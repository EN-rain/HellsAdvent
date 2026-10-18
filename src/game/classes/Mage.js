/**
 * GRAVEL SKY — Mage / Magnetist Class Behavior Module (Ines Calloway)
 * Implements Scrap Orbit (up to 6-9 orbiting pieces, +1.5 DEF each, grounded scrap pickup),
 * Pull / Drag / Lift, Spin Up / Second Skin, Lump / Pile Driver / Wrecking Ball,
 * and Scrapfall / Crane Drop / Junkyard Rain ultimates.
 */

import { PALETTE } from '../../data/config.js';
import { CLASSES } from '../../data/classes.js';
import { computeDamagePipeline } from '../Status.js';
import { angleTo4Facing, angleTo8Dir, drawBresenhamCircle, drawPixelLine } from '../PixelArt.js';
import { spriteRegistry } from '../Sprites.js';
import { sound } from '../Audio.js';

export class MageBehavior {
  constructor(player) {
    this.player = player;
    this.cfg = CLASSES.ines;

    // Orbiting scrap pieces: array of { variant: 0..7, angleOffset }
    this.orbitScrap = [
      { variant: 0 },
      { variant: 1 },
      { variant: 2 },
      { variant: 3 },
    ];
    this.orbitPhase = 0;
    this.passiveScrapTimer = 0;

    // Grounded scrap pieces (missed throws stay on ground for 4s, pulled back when near)
    this.groundScrap = [];

    // Spin Up active ring state
    this.spinUpTimer = 0;
    this.spinUpTickTimer = 0;
    this.spinUpConsumeTimer = 0;
    this.spinUpDpsMult = 0.60;

    // Magnet Belt (Binder Journeyman): auto-blocks 1 projectile every 3s
    this.magnetBeltCooldown = 0;

    // Active Pull / Lump / Scrapfall visual & delayed impact effects
    this.activeZones = [];
  }

  getMaxScrap() {
    const deepLvl = this.player.passives.deepPockets || 0;
    return this.cfg.mechanic.baseMaxScrap + deepLvl;
  }

  getScrapGainInterval() {
    const stickyLvl = this.player.passives.stickyFingers || 0;
    const table = [3.0, 2.5, 2.0, 1.5];
    return table[Math.min(3, stickyLvl)];
  }

  getGatherRadiusBonus() {
    const stickyLvl = this.player.passives.stickyFingers || 0;
    return stickyLvl * 30;
  }

  getGoodArmBonusPct() {
    const armLvl = this.player.passives.goodArm || 0;
    return armLvl * 0.06;
  }

  getOrbitDefBonus() {
    return this.orbitScrap.length * this.cfg.mechanic.defPerScrap;
  }

  addScrapPiece(count = 1) {
    const max = this.getMaxScrap();
    for (let i = 0; i < count; i++) {
      if (this.orbitScrap.length < max) {
        this.orbitScrap.push({
          variant: Math.floor(Math.random() * 8),
        });
      }
    }
  }

  onEnemyKilledNearby(enemyX, enemyY, particles) {
    const p = this.player;
    const maxDist = this.cfg.mechanic.killGatherRadius + this.getGatherRadiusBonus();
    if (Math.hypot(enemyX - p.x, enemyY - p.y) <= maxDist) {
      this.addScrapPiece(1);
      if (particles) {
        particles.spawnSlash(enemyX, enemyY, p.x, p.y, PALETTE.verdigris, 0.14, 'lunge');
      }
    }
  }

  spawnGroundScrap(x, y, variant = 0) {
    if (this.groundScrap.length >= 18) this.groundScrap.shift();
    this.groundScrap.push({
      x: Math.round(x),
      y: Math.round(y),
      variant: variant % 8,
      life: this.cfg.mechanic.groundScrapDuration,
    });
  }

  tryBlockProjectileWithMagnet(proj, particles) {
    const p = this.player;
    // Spin Up blocks all projectiles while active
    if (this.spinUpTimer > 0) {
      if (particles) {
        particles.spawnBurst(proj.x, proj.y, 4, PALETTE.verdigris, 25, 70, 2, 0.2);
      }
      sound.playSkillRailSpike();
      return true;
    }
    // Magnet Belt (Binder Journeyman): blocks 1 projectile every 3s if at least 1 orbiting scrap
    if (p.hasNode('magnetBelt') && this.magnetBeltCooldown <= 0 && this.orbitScrap.length > 0) {
      this.magnetBeltCooldown = 3.0;
      if (particles) {
        particles.spawnBurst(proj.x, proj.y, 5, PALETTE.verdigris, 30, 80, 2, 0.22);
        particles.spawnDamageNumber(p.x, p.y - 20, 0, false, 'DEFLECTED', PALETTE.verdigris);
      }
      sound.playSkillRailSpike();
      return true;
    }
    return false;
  }

  update(dt, input, spawner, projectiles, particles, camera, onHitStop) {
    const p = this.player;
    const maxScrap = this.getMaxScrap();
    this.orbitPhase += dt * (this.spinUpTimer > 0 ? 11.5 : 3.6);

    if (this.magnetBeltCooldown > 0) {
      this.magnetBeltCooldown = Math.max(0, this.magnetBeltCooldown - dt);
    }

    // 1. Passive scrap gain every 3s -> 1.5s
    if (!p.dead && this.orbitScrap.length < maxScrap) {
      this.passiveScrapTimer += dt;
      const interval = this.getScrapGainInterval();
      if (this.passiveScrapTimer >= interval) {
        this.passiveScrapTimer = 0;
        this.addScrapPiece(1);
      }
    } else {
      this.passiveScrapTimer = 0;
    }

    // 2. Overspin (Slinger Journeyman): at max scrap, throw speed +25%
    if (p.hasNode('overspin') && this.orbitScrap.length >= maxScrap) {
      p.statuses.apply('overspun', { duration: 0.25, sourceName: 'Overspin' }, p, null);
    } else {
      p.statuses.remove('overspun');
    }

    // 3. Grounded scrap pieces (stay 4s, pulled back when walking near)
    const pickupRad = this.cfg.mechanic.pickupRadiusBase + this.getGatherRadiusBonus();
    for (let i = this.groundScrap.length - 1; i >= 0; i--) {
      const gs = this.groundScrap[i];
      gs.life -= dt;
      if (gs.life <= 0) {
        this.groundScrap.splice(i, 1);
        continue;
      }
      const d = Math.hypot(p.x - gs.x, p.y - gs.y);
      if (d <= pickupRad && this.orbitScrap.length < maxScrap) {
        const pullAng = Math.atan2(p.y - gs.y, p.x - gs.x);
        gs.x += Math.cos(pullAng) * 260 * dt;
        gs.y += Math.sin(pullAng) * 260 * dt;
        if (d <= 16) {
          this.orbitScrap.push({ variant: gs.variant });
          this.groundScrap.splice(i, 1);
          sound.playUiClick();
        }
      }
    }

    // 4. Spin Up active ring update (damages enemies within 70px, uses 1 scrap/s)
    if (this.spinUpTimer > 0) {
      this.spinUpTimer = Math.max(0, this.spinUpTimer - dt);
      this.spinUpConsumeTimer += dt;
      if (this.spinUpConsumeTimer >= 1.0) {
        this.spinUpConsumeTimer -= 1.0;
        if (this.orbitScrap.length > 0) {
          this.orbitScrap.pop();
        }
        if (this.orbitScrap.length === 0) {
          this.spinUpTimer = 0;
          p.statuses.remove('spinning');
          p.statuses.remove('secondSkin');
        }
      }

      this.spinUpTickTimer += dt;
      if (this.spinUpTickTimer >= 0.25) {
        this.spinUpTickTimer -= 0.25;
        const targets = spawner.queryRadius(p.x, p.y, 70 + 24);
        for (let i = 0; i < targets.length; i++) {
          const e = targets[i];
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - p.x, e.y - p.y) <= 70 + e.radius) {
            const pipe = computeDamagePipeline({
              baseDamage: p.baseAtkForPipeline * this.spinUpDpsMult * 0.25,
              atkBuffPct: p.statuses.getAtkBonusPct(),
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Spin Up',
              targetName: e.name,
            });
            const ang = Math.atan2(e.y - p.y, e.x - p.x);
            e.takeDamage(pipe.finalDamage, ang, 18, false, p, spawner, particles, camera);
          }
        }
      }
    }

    // 5. Update active magnetic zones (Pull, Lump aerial drop, Scrapfall / Crane Drop / Junkyard Rain)
    for (let i = this.activeZones.length - 1; i >= 0; i--) {
      const z = this.activeZones[i];
      z.timer += dt;

      if (z.kind === 'lumpDrop') {
        if (z.timer >= z.delay) {
          this._explodeLumpZone(z, spawner, particles, camera, onHitStop);
          this.activeZones.splice(i, 1);
        }
      } else if (z.kind === 'scrapfall') {
        // Multi-wave or single-wave Scrapfall ultimate
        while (z.wavesDropped < z.totalWaves && z.timer >= z.waveTimes[z.wavesDropped]) {
          this._dropScrapfallWave(z, spawner, particles, camera, onHitStop);
          z.wavesDropped++;
        }
        if (z.timer >= z.duration) {
          p.ultimateActive = false;
          this.activeZones.splice(i, 1);
        }
      } else if (z.kind === 'pullRing') {
        if (z.timer >= z.duration) {
          this.activeZones.splice(i, 1);
        }
      }
    }
  }

  /**
   * Basic Attack: Left click hurls one orbiting scrap piece at cursor (130% ATK, pierces 1 enemy, 3/sec).
   * With 0 scrap, fires a weak magnetic pulse instead (40% ATK, 120px range).
   */
  tryBasicAttack(worldMouseX, worldMouseY, spawner, projectiles, particles, camera) {
    const p = this.player;
    if (
      p.dead ||
      p.statuses.cannotAct() ||
      p.dodgeTimer > 0 ||
      p.attackTimer > 0
    ) {
      return false;
    }

    const atkSpd = p.statuses.getAttackSpeedMultiplier();
    p.attackDuration = (1 / this.cfg.basicAttack.fireRate) / atkSpd;
    p.attackTimer = p.attackDuration;

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.attackAngle = angle;
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    if (this.orbitScrap.length > 0) {
      const piece = this.orbitScrap.pop();
      const goodArmBonus = this.getGoodArmBonusPct();
      projectiles.spawn({
        x: p.x + Math.cos(angle) * 14,
        y: p.y + Math.sin(angle) * 14,
        angle,
        speed: this.cfg.basicAttack.speed,
        maxRange: this.cfg.basicAttack.range,
        radius: 8,
        damage: p.baseAtkForPipeline * this.cfg.basicAttack.damageMultWithScrap,
        atkBuffPct: p.statuses.getAtkBonusPct() + goodArmBonus,
        isPlayer: true,
        pierce: 2, // pierces 1 enemy (hits up to 2)
        type: 'inesScrap',
        scrapVariant: piece.variant,
        color: PALETTE.verdigris,
        ricochet: p.hasNode('ricochet'),
        shrapnel: p.hasNode('shrapnel'),
      });
      sound.playMagnetThrow(false);
    } else {
      // Weak magnetic pulse (40% ATK, range 120px)
      const pulseRange = this.cfg.basicAttack.emptyPulseRange;
      const ex = p.x + Math.cos(angle) * pulseRange;
      const ey = p.y + Math.sin(angle) * pulseRange;
      particles.spawnSlash(p.x, p.y, ex, ey, PALETTE.verdigris, 0.12, 'lunge');

      const candidates = spawner.queryRadius(p.x, p.y, pulseRange + 24);
      for (let i = 0; i < candidates.length; i++) {
        const e = candidates[i];
        if (!e.active || e.hp <= 0) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > pulseRange + e.radius) continue;
        let diff = Math.atan2(dy, dx) - angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) <= 0.75) {
          const pipe = computeDamagePipeline({
            baseDamage: p.baseAtkForPipeline * this.cfg.basicAttack.damageMultEmptyPulse,
            atkBuffPct: p.statuses.getAtkBonusPct(),
            targetStatuses: e.statuses,
            targetBaseDef: e.def || 0,
            sourceName: 'Magnetic Pulse',
            targetName: e.name,
          });
          e.takeDamage(pipe.finalDamage, angle, 35, false, p, spawner, particles, camera);
          p.addUltimateCharge(2.5);
        }
      }
      sound.playMagnetThrow(true);
    }

    return true;
  }

  /**
   * Skill 1 — Pull (yank enemies within 180px of cursor toward cursor + 90% ATK; Drag adds Slow 50%; Lift adds Lifted 1.5s)
   */
  trySkill1(worldMouseX, worldMouseY, spawner, particles, camera, onHitStop) {
    const p = this.player;
    const skillDef = this.cfg.skills[0];
    const stats = skillDef.getStats(p.skills.pull || 1);

    if (p.cooldowns.skill1 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill1 = stats.cooldown;
    p.maxCooldowns.skill1 = stats.cooldown;

    const tx = p.clampCoord(worldMouseX);
    const ty = p.clampCoord(worldMouseY);
    const angle = Math.atan2(ty - p.y, tx - p.x);
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    this.activeZones.push({
      kind: 'pullRing',
      x: tx,
      y: ty,
      radius: stats.radius,
      timer: 0,
      duration: 5 / 24,
    });

    const hasDrag = p.hasNode('drag');
    const hasLift = p.hasNode('lift');
    const targets = spawner.queryRadius(tx, ty, stats.radius + 30);
    let hitCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const e = targets[i];
      if (!e.active || e.hp <= 0) continue;
      const dist = Math.hypot(e.x - tx, e.y - ty);
      if (dist > stats.radius + e.radius) continue;

      // Yank toward cursor point (Bosses move 25%, Commons/Elites pulled 70% toward center)
      const pullRatio = e.tier === 'boss' ? 0.2 : 0.72;
      e.x = Math.round(e.x + (tx - e.x) * pullRatio);
      e.y = Math.round(e.y + (ty - e.y) * pullRatio);

      const isCrit = Math.random() < p.critChance;
      const pipe = computeDamagePipeline({
        baseDamage: p.baseAtkForPipeline * stats.damageMult,
        atkBuffPct: p.statuses.getAtkBonusPct(),
        isCrit,
        critMult: p.critMult,
        targetStatuses: e.statuses,
        targetBaseDef: e.def || 0,
        sourceName: 'Pull',
        targetName: e.name,
      });

      const pullAng = Math.atan2(ty - e.y, tx - e.x);
      e.takeDamage(pipe.finalDamage, pullAng, 20, isCrit, p, spawner, particles, camera);

      if (hasDrag && e.active) {
        e.statuses.apply(
          'slow',
          { duration: 2.0, value: 0.50, sourceName: 'Drag' },
          e,
          particles
        );
      }
      if (hasLift && e.active) {
        e.statuses.apply(
          'lifted',
          {
            duration: 1.5,
            sourceAtk: p.atk,
            dropBonusDamage: true,
            sourceName: 'Lift',
          },
          e,
          particles
        );
      }

      hitCount++;
    }

    // Also pull any grounded scrap in radius immediately to Ines
    for (let i = this.groundScrap.length - 1; i >= 0; i--) {
      const gs = this.groundScrap[i];
      if (Math.hypot(gs.x - tx, gs.y - ty) <= stats.radius) {
        this.addScrapPiece(1);
        this.groundScrap.splice(i, 1);
      }
    }

    sound.playMagnetPull();
    camera.shake(3, 0.12);
    if (hitCount > 0) {
      p.addUltimateCharge(hitCount * 3.5);
      if (onHitStop) onHitStop(0.04);
    }
    return true;
  }

  /**
   * Skill 2 — Spin Up (orbiting scrap speeds up into a 70px ring for 5s/7s, deals 60% ATK/s, blocks projectiles)
   */
  trySkill2(particles) {
    const p = this.player;
    const skillDef = this.cfg.skills[1];
    const stats = skillDef.getStats(p.skills.spinUp || 1, p.ownedNodes);

    if (p.cooldowns.skill2 > 0 || p.stamina < stats.staminaCost) return false;
    if (this.orbitScrap.length === 0) {
      this.addScrapPiece(2);
    }

    p.stamina -= stats.staminaCost;
    p.cooldowns.skill2 = stats.cooldown;
    p.maxCooldowns.skill2 = stats.cooldown;

    this.spinUpTimer = stats.duration;
    this.spinUpTickTimer = 0;
    this.spinUpConsumeTimer = 0;
    this.spinUpDpsMult = stats.damageMult;

    p.statuses.apply('spinning', { duration: stats.duration, sourceName: 'Spin Up' }, p, particles);
    if (p.hasNode('secondSkin')) {
      p.statuses.apply(
        'secondSkin',
        { duration: stats.duration, sourceName: 'Second Skin' },
        p,
        particles
      );
    }

    sound.playMagnetPull();
    return true;
  }

  /**
   * Skill 3 — Lump (compress 3/2 scrap into a lump and throw; Pile Driver drops from above + Stun 1s; Wrecking Ball 600% ATK 100px)
   */
  trySkill3(worldMouseX, worldMouseY, spawner, particles, camera, onHitStop) {
    const p = this.player;
    const skillDef = this.cfg.skills[2];
    const stats = skillDef.getStats(p.skills.lump || 1, p.ownedNodes);

    if (p.cooldowns.skill3 > 0 || p.stamina < stats.staminaCost) return false;
    // Require scrap pieces (or consume what is available if at least 1)
    if (this.orbitScrap.length < 1) {
      if (particles) {
        particles.spawnDamageNumber(p.x, p.y - 20, 0, false, 'NO SCRAP', PALETTE.boneDark);
      }
      return false;
    }

    const consumeCount = Math.min(this.orbitScrap.length, stats.scrapCost);
    for (let i = 0; i < consumeCount; i++) {
      this.orbitScrap.pop();
    }

    p.stamina -= stats.staminaCost;
    p.cooldowns.skill3 = stats.cooldown;
    p.maxCooldowns.skill3 = stats.cooldown;

    const tx = p.clampCoord(worldMouseX);
    const ty = p.clampCoord(worldMouseY);
    const hasWreckingBall = p.hasNode('wreckingBall');
    const hasPileDriver = p.hasNode('pileDriver');

    const finalDamageMult = hasWreckingBall ? 6.0 : stats.damageMult;
    const finalRadius = hasWreckingBall ? 100 : stats.radius;

    this.activeZones.push({
      kind: 'lumpDrop',
      startX: p.x,
      startY: p.y,
      x: tx,
      y: ty,
      radius: finalRadius,
      damageMult: finalDamageMult,
      stunDuration: hasPileDriver ? 1.0 : 0,
      isVerticalDrop: hasPileDriver || hasWreckingBall,
      timer: 0,
      delay: hasWreckingBall ? 0.45 : 0.25,
    });

    sound.playMagnetThrow(false);
    return true;
  }

  _explodeLumpZone(z, spawner, particles, camera, onHitStop) {
    const p = this.player;
    sound.playSkillGroundBreak();
    camera.shake(5, 0.18);
    particles.spawnGroundBreakEffect(z.x, z.y, z.radius);
    particles.spawnDebris(z.x, z.y, 'canLid', 3);

    const goodArmBonus = this.getGoodArmBonusPct();
    const targets = spawner.queryRadius(z.x, z.y, z.radius + 32);
    let hitCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const e = targets[i];
      if (!e.active || e.hp <= 0) continue;
      if (Math.hypot(e.x - z.x, e.y - z.y) <= z.radius + e.radius) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * z.damageMult,
          atkBuffPct: p.statuses.getAtkBonusPct() + goodArmBonus,
          isCrit,
          critMult: p.critMult,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Lump',
          targetName: e.name,
        });
        const ang = Math.atan2(e.y - z.y, e.x - z.x);
        e.takeDamage(pipe.finalDamage, ang, 140, isCrit, p, spawner, particles, camera);

        if (z.stunDuration > 0 && e.active) {
          e.statuses.apply(
            'stun',
            { duration: z.stunDuration, sourceName: 'Pile Driver' },
            e,
            particles
          );
        }
        hitCount++;
      }
    }

    if (hitCount > 0) {
      p.addUltimateCharge(hitCount * 4.5);
      if (onHitStop) onHitStop(0.05);
    }
  }

  /**
   * Ultimate — Scrapfall (or Crane Drop 8s 3-wave junkyard, or Junkyard Rain 260px 3-wave 750% ATK)
   */
  tryUltimate(worldMouseX, worldMouseY, spawner, particles, camera) {
    const p = this.player;
    if (p.ultimateCharge < 100 || p.ultimateActive) return false;
    p.ultimateCharge = 0;
    p.ultimateActive = true;

    const tx = p.clampCoord(worldMouseX);
    const ty = p.clampCoord(worldMouseY);
    const hasCraneDrop = p.hasNode('craneDrop');
    const hasJunkyardRain = p.hasNode('junkyardRain');

    // Refill Scrap Orbit from pulled wreck debris
    this.addScrapPiece(this.getMaxScrap());

    if (hasCraneDrop) {
      p.statuses.apply('untouchable', { duration: 1.5, sourceName: 'Crane Drop' }, p, null);
      this.activeZones.push({
        kind: 'scrapfall',
        x: tx,
        y: ty,
        radius: 160,
        totalWaves: 3,
        wavesDropped: 0,
        waveTimes: [1.0, 4.0, 7.0],
        damagePerWaveMult: 5.5 / 3,
        stunDuration: 2.0,
        timer: 0,
        duration: 8.0,
      });
    } else if (hasJunkyardRain) {
      p.statuses.apply('untouchable', { duration: 1.5, sourceName: 'Junkyard Rain' }, p, null);
      this.activeZones.push({
        kind: 'scrapfall',
        x: tx,
        y: ty,
        radius: 260,
        totalWaves: 3,
        wavesDropped: 0,
        waveTimes: [0.9, 1.5, 2.1],
        damagePerWaveMult: 7.5 / 3,
        stunDuration: 1.5,
        timer: 0,
        duration: 2.4,
      });
    } else {
      p.statuses.apply('untouchable', { duration: 1.2, sourceName: 'Scrapfall' }, p, null);
      this.activeZones.push({
        kind: 'scrapfall',
        x: tx,
        y: ty,
        radius: 160,
        totalWaves: 1,
        wavesDropped: 0,
        waveTimes: [1.0],
        damagePerWaveMult: 5.5,
        stunDuration: 1.5,
        timer: 0,
        duration: 1.3,
      });
    }

    sound.playUltimateStart();
    camera.shake(4, 0.15);
    return true;
  }

  _dropScrapfallWave(z, spawner, particles, camera, onHitStop) {
    const p = this.player;
    sound.playUltimateReleaseCrack();
    camera.shake(8, 0.28);

    // Leave crater decal
    particles.spawnDecal(z.x, z.y, '#121918', Math.min(28, Math.round(z.radius * 0.22)), 20.0);
    particles.spawnGroundBreakEffect(z.x, z.y, z.radius);
    particles.spawnDebris(z.x, z.y, 'canLid', 5);
    particles.spawnDebris(z.x, z.y, 'wire', 5);

    const targets = spawner.queryRadius(z.x, z.y, z.radius + 36);
    for (let i = 0; i < targets.length; i++) {
      const e = targets[i];
      if (!e.active || e.hp <= 0) continue;
      if (Math.hypot(e.x - z.x, e.y - z.y) <= z.radius + e.radius) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * z.damagePerWaveMult,
          atkBuffPct: p.statuses.getAtkBonusPct(),
          isCrit,
          critMult: p.critMult,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Scrapfall',
          targetName: e.name,
        });
        const ang = Math.atan2(e.y - z.y, e.x - z.x);
        e.takeDamage(pipe.finalDamage, ang, 160, isCrit, p, spawner, particles, camera);
        if (e.active) {
          e.statuses.apply(
            'stun',
            { duration: z.stunDuration, sourceName: 'Scrapfall' },
            e,
            particles
          );
        }
      }
    }

    if (onHitStop) onHitStop(0.06);
  }

  drawClassExtras(ctx, camera) {
    const p = this.player;
    const camX = camera.renderX;
    const camY = camera.renderY;

    // 1. Draw grounded scrap pieces (missed throws)
    for (let i = 0; i < this.groundScrap.length; i++) {
      const gs = this.groundScrap[i];
      const sx = Math.round(gs.x - camX);
      const sy = Math.round(gs.y - camY);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - 3, sy + 2, 6, 2);
      const frames = spriteRegistry.scrapVariantAngles[gs.variant % 8];
      if (frames && frames[0]) {
        ctx.drawImage(frames[0], sx - 6, sy - 6);
      } else {
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
      }
    }

    // 2. Draw active Pull rings, Lump aerial shadows, and Scrapfall floating junkyard shadows
    for (let i = 0; i < this.activeZones.length; i++) {
      const z = this.activeZones[i];
      const sx = Math.round(z.x - camX);
      const sy = Math.round(z.y - camY);

      if (z.kind === 'pullRing') {
        const progress = z.timer / z.duration;
        const r = Math.max(6, Math.round(z.radius * (1 - progress)));
        drawBresenhamCircle(ctx, sx, sy, r, PALETTE.verdigris, 1.0);
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3 + progress;
          drawPixelLine(
            ctx,
            sx + Math.cos(ang) * r,
            sy + Math.sin(ang) * r,
            sx + Math.cos(ang) * (r * 0.4),
            sy + Math.sin(ang) * (r * 0.4),
            PALETTE.bone,
            1
          );
        }
      } else if (z.kind === 'lumpDrop') {
        const progress = Math.min(1, z.timer / z.delay);
        drawBresenhamCircle(ctx, sx, sy, Math.round(z.radius * progress), PALETTE.verdigris, 0.65);
        // Falling compressed scrap mass from above
        const dropY = Math.round(sy - (1 - progress) * 75);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 6, sy - 2, 12, 4);
        ctx.fillStyle = PALETTE.steel || '#525B66';
        ctx.fillRect(sx - 7, dropY - 7, 14, 14);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(sx - 4, dropY - 4, 8, 8);
      } else if (z.kind === 'scrapfall') {
        // Growing dark shadow circle + levitating scrap silhouettes overhead
        drawBresenhamCircle(ctx, sx, sy, z.radius, PALETTE.verdigris, 0.75);
        drawBresenhamCircle(ctx, sx, sy, Math.round(z.radius * 0.5), PALETTE.soot, 0.65);
        for (let k = 0; k < 8; k++) {
          const ang = p.animClock * 4 + (k * Math.PI) / 4;
          const ox = sx + Math.round(Math.cos(ang) * (z.radius * 0.55));
          const oy = sy - 42 + Math.round(Math.sin(ang) * 18);
          ctx.fillStyle = k % 2 === 0 ? PALETTE.verdigris : PALETTE.brass;
          ctx.fillRect(ox - 4, oy - 4, 8, 6);
        }
      }
    }

    // 3. Draw Orbiting Scrap pieces around Ines (22px radius, or 70px ring during Spin Up)
    const pScreen = camera.worldToScreen(p.x, p.y);
    const px = Math.round(pScreen.x);
    const py = Math.round(pScreen.y);
    const orbitRad = this.spinUpTimer > 0 ? 54 : this.cfg.mechanic.orbitRadius;
    const count = this.orbitScrap.length;

    if (this.spinUpTimer > 0) {
      drawBresenhamCircle(ctx, px, py, orbitRad, PALETTE.verdigris, 0.55);
    }

    for (let i = 0; i < count; i++) {
      const piece = this.orbitScrap[i];
      const ang = this.orbitPhase + (i * Math.PI * 2) / Math.max(1, count);
      const ox = px + Math.round(Math.cos(ang) * orbitRad);
      const oy = py + Math.round(Math.sin(ang) * (orbitRad * 0.75));
      const dir8 = angleTo8Dir(ang + Math.PI * 0.5);

      // Ground shadow under orbiting scrap
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(ox - 2, oy + 6, 4, 2);

      const variantFrames =
        spriteRegistry.scrapVariantAngles[piece.variant % spriteRegistry.scrapVariantAngles.length];
      if (variantFrames && variantFrames[dir8]) {
        const frame = variantFrames[dir8];
        ctx.drawImage(
          frame,
          Math.round(ox - frame.width / 2),
          Math.round(oy - frame.height / 2)
        );
      } else {
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(ox - 2, oy - 2, 5, 5);
      }
    }
  }

  getHudMechanicState() {
    const maxScrap = this.getMaxScrap ? this.getMaxScrap() : 6;
    const count = this.orbitScrap ? this.orbitScrap.length : 0;
    return {
      type: 'scrapOrbit',
      count,
      maxCount: maxScrap,
    };
  }
}

export default MageBehavior;
