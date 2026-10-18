/**
 * GRAVEL SKY — Ranged Class Behavior Module (Rook Matsuda)
 * Implements Magazine & Active Perfect Reload, Distance Bonus, Springgun bolts,
 * Rivet Spread / Rail Slug, Kickback, Tripwire / Pressure Plates, Caltrop Pocket,
 * Hold Breath, and Ten Count / Long Count / Dead Ground ultimates.
 */

import { PALETTE } from '../../data/config.js';
import { CLASSES } from '../../data/classes.js';
import { computeDamagePipeline } from '../Status.js';
import { angleTo4Facing, drawBresenhamCircle, drawPixelLine } from '../PixelArt.js';
import { sound } from '../Audio.js';

export class RangedBehavior {
  constructor(player) {
    this.player = player;
    this.cfg = CLASSES.rook;

    // Magazine & Reload state
    this.maxMag = 12;
    this.ammo = 12;
    this.reloading = false;
    this.reloadTimer = 0;
    this.reloadDuration = 1.4;
    this.reloadLockout = false; // If player missed Q window, cannot spam Q

    // Hold Breath (Longhand Journeyman): standing still for 0.6s grants Settled
    this.stillTimer = 0;

    // Active Tripwires, Proximity Mines, and Caltrop Patches in world space
    this.traps = [];

    // Ten Count / Long Count / Dead Ground ultimate state
    this.tenCountState = 'none'; // 'charging' | 'firing' | 'minefield'
    this.tenCountTimer = 0;
    this.tenCountBoltsFired = 0;
    this.tenCountAngle = 0;
    this.tenCountTargetX = 0;
    this.tenCountTargetY = 0;
  }

  getMaxMagazine() {
    const p = this.player;
    const deepBeltLvl = p.passives.deepBelt || 0;
    return this.cfg.mechanic.baseMagSize + deepBeltLvl * 2;
  }

  getReloadDuration() {
    const p = this.player;
    const steadyLvl = p.passives.steadyHands || 0;
    return Math.max(0.55, this.cfg.mechanic.baseReloadTime - steadyLvl * 0.15);
  }

  getPerfectWindowStart() {
    return this.player.hasNode('cleanReload')
      ? this.cfg.mechanic.cleanReloadWindowStart
      : this.cfg.mechanic.perfectWindowStart;
  }

  getDistanceBonusPct(dist) {
    const p = this.player;
    const longBarrelLvl = p.passives.longBarrel || 0;
    const hasRangeFinder = p.hasNode('rangeFinder');
    const minDist = hasRangeFinder ? 60 : this.cfg.mechanic.distMin;
    const maxCap =
      this.cfg.mechanic.maxDistBonusBase +
      longBarrelLvl * 0.06 +
      (hasRangeFinder ? 0.30 : 0);
    const t = Math.max(0, Math.min(1, (dist - minDist) / this.cfg.mechanic.distSpan));
    return maxCap * t;
  }

  /**
   * Q Key: Manual Reload OR Active Perfect Reload attempt
   */
  tryReloadOrPerfectReload(particles) {
    const p = this.player;
    if (p.dead || p.statuses.cannotAct()) return false;

    if (!this.reloading) {
      if (this.ammo >= this.getMaxMagazine()) return false;
      this.startReload();
      return true;
    }

    // Attempting Active Perfect Reload during reload bar
    if (this.reloadLockout) return false;
    const progress = this.reloadTimer / Math.max(0.01, this.reloadDuration);
    const winStart = this.getPerfectWindowStart();

    if (progress >= winStart && progress <= 1.0) {
      // PERFECT RELOAD!
      this.reloading = false;
      this.reloadTimer = 0;
      const bonusBolt = p.hasNode('cleanReload') ? 1 : 0;
      this.maxMag = this.getMaxMagazine();
      this.ammo = this.maxMag + bonusBolt;
      p.statuses.apply(
        'cleanMag',
        { duration: 45.0, sourceName: 'Perfect Reload' },
        p,
        particles
      );
      sound.playPerfectReload();
      if (particles) {
        particles.spawnDamageNumber(p.x, p.y - 24, 0, true, 'PERFECT RELOAD!', PALETTE.brass);
      }
      return true;
    } else {
      // Missed the window -> lock out further Q presses for this reload cycle
      this.reloadLockout = true;
      if (particles) {
        particles.spawnDamageNumber(p.x, p.y - 22, 0, false, 'JAMMED', PALETTE.boneDark);
      }
      return false;
    }
  }

  startReload() {
    this.reloading = true;
    this.reloadTimer = 0;
    this.reloadDuration = this.getReloadDuration();
    this.reloadLockout = false;
    this.player.statuses.remove('cleanMag');
    sound.playReloadStart();
  }

  onDodgeRoll(x, y, particles) {
    const p = this.player;
    if (!p.hasNode('caltropPocket')) return;
    // Caltrop Pocket (Wirehand Journeyman): drop a 60px caltrop patch for 4s
    this.traps.push({
      kind: 'caltrops',
      x,
      y,
      radius: 30, // 60px diameter
      life: 4.0,
      maxLife: 4.0,
      tickTimer: 0,
      hitCooldowns: new Map(),
    });
    if (particles) {
      particles.spawnDustPuff(x, y, 2, 0, 0);
    }
  }

  update(dt, input, spawner, projectiles, particles, camera, onHitStop) {
    const p = this.player;
    this.maxMag = this.getMaxMagazine();

    // 1. Reload bar progression
    if (this.reloading) {
      this.reloadTimer += dt;
      if (this.reloadTimer >= this.reloadDuration) {
        this.reloading = false;
        this.reloadTimer = 0;
        this.reloadLockout = false;
        this.ammo = this.maxMag;
        sound.playUiClick();
      }
    }

    // 2. Hold Breath (Longhand Journeyman): standing still for 0.6s grants Settled
    if (p.hasNode('holdBreath') && !p.dead) {
      const isMoving = Math.hypot(p.vx, p.vy) > 5 || p.dodgeTimer > 0;
      if (!isMoving && !p.statuses.has('settled')) {
        this.stillTimer += dt;
        if (this.stillTimer >= 0.6) {
          this.stillTimer = 0;
          p.statuses.apply('settled', { duration: 12.0, sourceName: 'Hold Breath' }, p, particles);
        }
      } else if (isMoving) {
        this.stillTimer = 0;
      }
    }

    // 3. Ten Count / Long Count / Dead Ground ultimate state machine
    if (this.tenCountState !== 'none') {
      this.tenCountTimer += dt;

      if (this.tenCountState === 'charging') {
        this.tenCountAngle = Math.atan2(
          input.worldMouseY - p.y,
          input.worldMouseX - p.x
        );
        p.facingDir = angleTo4Facing(this.tenCountAngle);
        p.facingX = Math.cos(this.tenCountAngle) >= 0 ? 1 : -1;

        const chargeTarget = p.hasNode('longCount') ? 1.6 : 1.0;
        if (this.tenCountTimer >= chargeTarget) {
          if (p.hasNode('longCount')) {
            // Long Count: one huge bolt, 900% ATK, unlimited pierce, marks every enemy hit
            projectiles.spawn({
              x: p.x + Math.cos(this.tenCountAngle) * 16,
              y: p.y + Math.sin(this.tenCountAngle) * 16,
              angle: this.tenCountAngle,
              speed: 880,
              maxRange: 720,
              radius: 14,
              damage: p.baseAtkForPipeline * 9.0,
              isPlayer: true,
              pierce: 999,
              type: 'rookBolt',
              color: PALETTE.brass,
              onHitStatus: { id: 'marked', duration: 5.0, sourceName: 'Long Count' },
            });
            sound.playUltimateReleaseCrack();
            camera.shake(7, 0.25);
            this.tenCountState = 'none';
            p.ultimateActive = false;
          } else {
            this.tenCountState = 'firing';
            this.tenCountTimer = 0;
            this.tenCountBoltsFired = 0;
          }
        }
      } else if (this.tenCountState === 'firing') {
        // Fires 10 bolts in a tight line over 0.45s (600% ATK total -> 60% per bolt, unlimited pierce)
        const interval = 0.045;
        while (this.tenCountBoltsFired < 10 && this.tenCountTimer >= this.tenCountBoltsFired * interval) {
          this.tenCountBoltsFired++;
          projectiles.spawn({
            x: p.x + Math.cos(this.tenCountAngle) * 14,
            y: p.y + Math.sin(this.tenCountAngle) * 14,
            angle: this.tenCountAngle + (Math.random() - 0.5) * 0.03,
            speed: 780,
            maxRange: 520,
            radius: 9,
            damage: p.baseAtkForPipeline * 0.60,
            isPlayer: true,
            pierce: 999,
            type: 'rookBolt',
            color: PALETTE.brass,
          });
          sound.playSpringgunShot(true);
          camera.shake(2, 0.06);
        }
        if (this.tenCountBoltsFired >= 10) {
          this.tenCountState = 'none';
          p.ultimateActive = false;
        }
      } else if (this.tenCountState === 'minefield') {
        // Dead Ground (Minelayer Master): drops 12 mines over 1.5s in a 220px field (220% ATK each)
        const interval = 1.5 / 12;
        while (this.tenCountBoltsFired < 12 && this.tenCountTimer >= this.tenCountBoltsFired * interval) {
          this.tenCountBoltsFired++;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 110;
          const mx = p.clampCoord(this.tenCountTargetX + Math.cos(a) * r);
          const my = p.clampCoord(this.tenCountTargetY + Math.sin(a) * r);
          this.traps.push({
            kind: 'mine',
            x: mx,
            y: my,
            radius: 20,
            blastRadius: 80,
            damageMult: 2.20,
            life: 10.0,
            maxLife: 10.0,
          });
          sound.playReloadStart();
        }
        if (this.tenCountBoltsFired >= 12) {
          this.tenCountState = 'none';
          p.ultimateActive = false;
        }
      }
    }

    // 4. Update active Tripwires, Mines, and Caltrop Patches
    this._updateTraps(dt, spawner, particles, camera, onHitStop);
  }

  _updateTraps(dt, spawner, particles, camera, onHitStop) {
    const p = this.player;
    for (let i = this.traps.length - 1; i >= 0; i--) {
      const trap = this.traps[i];
      trap.life -= dt;
      if (trap.life <= 0) {
        this.traps.splice(i, 1);
        continue;
      }

      if (trap.kind === 'wire') {
        const midX = (trap.x1 + trap.x2) * 0.5;
        const midY = (trap.y1 + trap.y2) * 0.5;
        const enemies = spawner.queryRadius(midX, midY, 95);
        const segLenSq =
          (trap.x2 - trap.x1) * (trap.x2 - trap.x1) +
          (trap.y2 - trap.y1) * (trap.y2 - trap.y1);

        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (!e.active || e.hp <= 0) continue;
          const lastHit = trap.hitMap.get(e.uid) || -10;
          if (trap.maxLife - trap.life - lastHit < 1.2) continue;

          let t = 0;
          if (segLenSq > 0) {
            t =
              ((e.x - trap.x1) * (trap.x2 - trap.x1) +
                (e.y - trap.y1) * (trap.y2 - trap.y1)) /
              segLenSq;
            t = Math.max(0, Math.min(1, t));
          }
          const px = trap.x1 + t * (trap.x2 - trap.x1);
          const py = trap.y1 + t * (trap.y2 - trap.y1);
          if (Math.hypot(e.x - px, e.y - py) <= e.radius + 8) {
            trap.hitMap.set(e.uid, trap.maxLife - trap.life);
            const pipe = computeDamagePipeline({
              baseDamage: p.baseAtkForPipeline * trap.damageMult,
              atkBuffPct: p.statuses.getAtkBonusPct(),
              isCrit: false,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Tripwire',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, 0, 20, false, p, spawner, particles, camera);

            const hasBarbed = p.hasNode('barbed');
            e.statuses.apply(
              'slow',
              {
                duration: 2.0,
                value: hasBarbed ? 0.60 : 0.40,
                sourceName: 'Tripwire',
              },
              e,
              particles
            );
            if (hasBarbed) {
              e.statuses.apply(
                'bleed',
                { duration: 4.0, sourceAtk: p.atk, sourceName: 'Barbed Wire' },
                e,
                particles
              );
            }
            sound.playHit(false);
          }
        }
      } else if (trap.kind === 'mine') {
        const enemies = spawner.queryRadius(trap.x, trap.y, trap.radius + 26);
        let triggered = false;
        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (e.active && e.hp > 0 && Math.hypot(e.x - trap.x, e.y - trap.y) <= trap.radius + e.radius) {
            triggered = true;
            break;
          }
        }
        if (triggered) {
          this._detonateMine(trap, spawner, particles, camera, onHitStop);
          this.traps.splice(i, 1);
        }
      } else if (trap.kind === 'caltrops') {
        trap.tickTimer += dt;
        if (trap.tickTimer >= 0.5) {
          trap.tickTimer = 0;
          const enemies = spawner.queryRadius(trap.x, trap.y, trap.radius + 20);
          for (let j = 0; j < enemies.length; j++) {
            const e = enemies[j];
            if (!e.active || e.hp <= 0) continue;
            if (Math.hypot(e.x - trap.x, e.y - trap.y) <= trap.radius + e.radius) {
              e.statuses.apply(
                'slow',
                { duration: 1.2, value: 0.40, sourceName: 'Caltrop Pocket' },
                e,
                particles
              );
              e.statuses.apply(
                'bleed',
                { duration: 2.0, sourceAtk: p.atk, sourceName: 'Caltrop Pocket' },
                e,
                particles
              );
            }
          }
        }
      }
    }
  }

  _detonateMine(mine, spawner, particles, camera, onHitStop) {
    const p = this.player;
    sound.playSkillGroundBreak();
    camera.shake(4, 0.14);
    particles.spawnGroundBreakEffect(mine.x, mine.y, mine.blastRadius);

    const targets = spawner.queryRadius(mine.x, mine.y, mine.blastRadius + 28);
    for (let i = 0; i < targets.length; i++) {
      const e = targets[i];
      if (!e.active || e.hp <= 0) continue;
      if (Math.hypot(e.x - mine.x, e.y - mine.y) <= mine.blastRadius + e.radius) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * mine.damageMult,
          atkBuffPct: p.statuses.getAtkBonusPct(),
          isCrit,
          critMult: p.critMult,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Pressure Mine',
          targetName: e.name,
        });
        const ang = Math.atan2(e.y - mine.y, e.x - mine.x);
        e.takeDamage(pipe.finalDamage, ang, 120, isCrit, p, spawner, particles, camera);
      }
    }

    // Chain Reaction (Minelayer Master): when a mine goes off, nearby wire lines pulse for 100% ATK
    if (p.hasNode('chainReaction')) {
      for (const other of this.traps) {
        if (other.kind === 'wire') {
          const midX = (other.x1 + other.x2) * 0.5;
          const midY = (other.y1 + other.y2) * 0.5;
          particles.spawnSlash(other.x1, other.y1, other.x2, other.y2, PALETTE.brass, 0.18, 'lunge');
          const nearWire = spawner.queryRadius(midX, midY, 85);
          for (const e of nearWire) {
            if (!e.active || e.hp <= 0) continue;
            const pipe = computeDamagePipeline({
              baseDamage: p.baseAtkForPipeline * 1.0,
              atkBuffPct: p.statuses.getAtkBonusPct(),
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Chain Reaction',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, 0, 40, false, p, spawner, particles, camera);
          }
        }
      }
    }

    if (onHitStop) onHitStop(0.04);
  }

  /**
   * Basic Attack: Hold left click to fire Springgun bolts at 3 shots/sec (100% ATK, 420px range)
   */
  tryBasicAttack(worldMouseX, worldMouseY, projectiles, particles, camera) {
    const p = this.player;
    if (
      p.dead ||
      p.statuses.cannotAct() ||
      this.tenCountState !== 'none' ||
      p.dodgeTimer > 0 ||
      p.attackTimer > 0
    ) {
      return false;
    }

    if (this.reloading) return false;
    if (this.ammo <= 0) {
      this.startReload();
      return false;
    }

    const atkSpd = p.statuses.getAttackSpeedMultiplier();
    p.attackDuration = (1 / this.cfg.basicAttack.fireRate) / atkSpd;
    p.attackTimer = p.attackDuration;

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.attackAngle = angle;
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    // Check Settled (Hold Breath): next shot +80% damage and +1 pierce, consumed on shot
    const hasSettled = p.statuses.has('settled');
    const atkBonus = p.statuses.getAtkBonusPct();
    if (hasSettled) {
      p.statuses.consume('settled');
    }

    this.ammo -= 1;
    if (this.ammo <= 0) {
      p.statuses.remove('cleanMag');
      this.startReload();
    }

    projectiles.spawn({
      x: p.x + Math.cos(angle) * 14,
      y: p.y + Math.sin(angle) * 14,
      angle,
      speed: this.cfg.basicAttack.speed,
      maxRange: this.cfg.basicAttack.range,
      radius: 7,
      damage: p.baseAtkForPipeline * this.cfg.basicAttack.damageMult,
      atkBuffPct: atkBonus,
      isPlayer: true,
      pierce: 1 + (hasSettled ? 1 : 0),
      type: 'rookBolt',
      color: PALETTE.brass,
      useRookDistanceBonus: true,
    });

    sound.playSpringgunShot(hasSettled);
    return true;
  }

  /**
   * Skill 1 — Rivet Spread (or Rail Slug if Surveyor Master node owned)
   */
  trySkill1(worldMouseX, worldMouseY, projectiles, particles, camera) {
    const p = this.player;
    const skillDef = this.cfg.skills[0];
    const stats = skillDef.getStats(p.skills.rivetSpread || 1, p.ownedNodes);

    if (p.cooldowns.skill1 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill1 = stats.cooldown;
    p.maxCooldowns.skill1 = stats.cooldown;

    const baseAngle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(baseAngle);
    p.facingX = Math.cos(baseAngle) >= 0 ? 1 : -1;
    p.attackTimer = 0.22;
    p.attackDuration = 0.22;

    const hasRailSlug = p.hasNode('railSlug');
    if (hasRailSlug) {
      projectiles.spawn({
        x: p.x + Math.cos(baseAngle) * 14,
        y: p.y + Math.sin(baseAngle) * 14,
        angle: baseAngle,
        speed: 820,
        maxRange: 520,
        radius: 11,
        damage: p.baseAtkForPipeline * stats.damageMult,
        atkBuffPct: p.statuses.getAtkBonusPct(),
        isPlayer: true,
        pierce: 8,
        type: 'rookBolt',
        color: PALETTE.brass,
        useRookDistanceBonus: true,
      });
      sound.playSpringgunShot(true);
      camera.shake(4, 0.12);
    } else {
      const fanRad = (40 * Math.PI) / 180;
      for (let i = 0; i < 5; i++) {
        const ang = baseAngle - fanRad * 0.5 + (fanRad * i) / 4;
        projectiles.spawn({
          x: p.x + Math.cos(ang) * 12,
          y: p.y + Math.sin(ang) * 12,
          angle: ang,
          speed: 660,
          maxRange: 380,
          radius: 7,
          damage: p.baseAtkForPipeline * stats.damageMult,
          atkBuffPct: p.statuses.getAtkBonusPct(),
          isPlayer: true,
          pierce: 1,
          type: 'rookBolt',
          color: PALETTE.brass,
          useRookDistanceBonus: true,
        });
      }
      sound.playSpringgunShot(false);
      camera.shake(2, 0.08);
    }

    return true;
  }

  /**
   * Skill 2 — Kickback (hop back 90px and fire heavy bolt for 200% ATK; Marked node applies Marked)
   */
  trySkill2(worldMouseX, worldMouseY, projectiles, particles, camera) {
    const p = this.player;
    const skillDef = this.cfg.skills[1];
    const stats = skillDef.getStats(p.skills.kickback || 1);

    if (p.cooldowns.skill2 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill2 = stats.cooldown;
    p.maxCooldowns.skill2 = stats.cooldown;

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    // Hop back 90px opposite cursor
    particles.spawnDustPuff(p.x, p.y + 8, 2, 0, 0);
    p.x = p.clampCoord(p.x - Math.cos(angle) * stats.hopDistance);
    p.y = p.clampCoord(p.y - Math.sin(angle) * stats.hopDistance);
    particles.spawnDustPuff(p.x, p.y + 8, 2, 0, 0);

    const hasMarked = p.hasNode('marked');
    projectiles.spawn({
      x: p.x + Math.cos(angle) * 14,
      y: p.y + Math.sin(angle) * 14,
      angle,
      speed: 740,
      maxRange: 460,
      radius: 10,
      damage: p.baseAtkForPipeline * stats.damageMult,
      atkBuffPct: p.statuses.getAtkBonusPct(),
      isPlayer: true,
      pierce: 2,
      knockback: stats.knockback,
      type: 'rookBolt',
      color: PALETTE.brass,
      useRookDistanceBonus: true,
      onHitStatus: hasMarked ? { id: 'marked', duration: 5.0, sourceName: 'Kickback' } : null,
    });

    sound.playSpringgunShot(true);
    camera.shake(3, 0.1);
    return true;
  }

  /**
   * Skill 3 — Tripwire (or Pressure Plates mine if Minelayer Master node owned)
   */
  trySkill3(worldMouseX, worldMouseY, particles) {
    const p = this.player;
    const skillDef = this.cfg.skills[2];
    const stats = skillDef.getStats(p.skills.tripwire || 1, p.ownedNodes);

    if (p.cooldowns.skill3 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill3 = stats.cooldown;
    p.maxCooldowns.skill3 = stats.cooldown;

    const hasPressurePlates = p.hasNode('pressurePlates');
    const activeKind = hasPressurePlates ? 'mine' : 'wire';
    const currentSameKind = this.traps.filter((t) => t.kind === activeKind);
    if (currentSameKind.length >= stats.maxLines) {
      const oldestIdx = this.traps.findIndex((t) => t.kind === activeKind);
      if (oldestIdx !== -1) this.traps.splice(oldestIdx, 1);
    }

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    const dist = Math.min(180, Math.hypot(worldMouseX - p.x, worldMouseY - p.y));
    const cx = p.clampCoord(p.x + Math.cos(angle) * dist);
    const cy = p.clampCoord(p.y + Math.sin(angle) * dist);

    if (hasPressurePlates) {
      this.traps.push({
        kind: 'mine',
        x: cx,
        y: cy,
        radius: 22,
        blastRadius: 80,
        damageMult: stats.damageMult,
        life: stats.duration,
        maxLife: stats.duration,
      });
    } else {
      // 140px wire line perpendicular to throw angle
      const perp = angle + Math.PI * 0.5;
      const half = 70;
      this.traps.push({
        kind: 'wire',
        x1: cx - Math.cos(perp) * half,
        y1: cy - Math.sin(perp) * half,
        x2: cx + Math.cos(perp) * half,
        y2: cy + Math.sin(perp) * half,
        damageMult: stats.damageMult,
        life: stats.duration,
        maxLife: stats.duration,
        hitMap: new Map(),
      });
    }

    sound.playReloadStart();
    if (particles) {
      particles.spawnDustPuff(cx, cy, 1, 0, 0);
    }
    return true;
  }

  /**
   * Ultimate — Ten Count (or Long Count / Dead Ground)
   */
  tryUltimate(worldMouseX, worldMouseY, spawner, particles, camera) {
    const p = this.player;
    if (p.ultimateCharge < 100 || this.tenCountState !== 'none') return false;
    p.ultimateCharge = 0;
    p.ultimateActive = true;

    this.tenCountAngle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    this.tenCountTargetX = worldMouseX;
    this.tenCountTargetY = worldMouseY;
    this.tenCountTimer = 0;
    this.tenCountBoltsFired = 0;

    if (p.hasNode('deadGround')) {
      this.tenCountState = 'minefield';
      p.statuses.apply('untouchable', { duration: 1.5, sourceName: 'Dead Ground' }, p, null);
    } else {
      this.tenCountState = 'charging';
      const dur = p.hasNode('longCount') ? 1.7 : 1.5;
      p.statuses.apply('untouchable', { duration: dur, sourceName: 'Ten Count' }, p, null);
    }

    sound.playUltimateStart();
    camera.shake(3, 0.12);
    return true;
  }

  drawClassExtras(ctx, camera) {
    const p = this.player;
    const camX = camera.renderX;
    const camY = camera.renderY;
    const twitch = Math.floor(p.animClock * 12) % 2;

    // 1. Draw active Tripwires, Pressure Mines, and Caltrop Patches
    for (let i = 0; i < this.traps.length; i++) {
      const trap = this.traps[i];
      if (trap.kind === 'wire') {
        const sx1 = Math.round(trap.x1 - camX);
        const sy1 = Math.round(trap.y1 - camY);
        const sx2 = Math.round(trap.x2 - camX);
        const sy2 = Math.round(trap.y2 - camY);
        // Spool posts at ends
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(sx1 - 2, sy1 - 2, 4, 4);
        ctx.fillRect(sx2 - 2, sy2 - 2, 4, 4);
        // Wire line with 2-frame twitch
        drawPixelLine(
          ctx,
          sx1,
          sy1 + twitch,
          sx2,
          sy2 - twitch,
          p.hasNode('barbed') ? PALETTE.blood : PALETTE.bone,
          1
        );
      } else if (trap.kind === 'mine') {
        const sx = Math.round(trap.x - camX);
        const sy = Math.round(trap.y - camY);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 4, sy - 3, 8, 6);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(sx - 3, sy - 2, 6, 4);
        ctx.fillStyle = twitch === 0 ? PALETTE.blood : PALETTE.brass;
        ctx.fillRect(sx - 1, sy - 1, 2, 2);
      } else if (trap.kind === 'caltrops') {
        const sx = Math.round(trap.x - camX);
        const sy = Math.round(trap.y - camY);
        drawBresenhamCircle(ctx, sx, sy, trap.radius, PALETTE.boneDark, 0.45);
        for (let c = 0; c < 7; c++) {
          const cx = sx + Math.round(Math.cos(c * 1.9) * (trap.radius * 0.6));
          const cy = sy + Math.round(Math.sin(c * 2.3) * (trap.radius * 0.6));
          ctx.fillStyle = PALETTE.bone;
          ctx.fillRect(cx - 1, cy - 1, 2, 2);
        }
      }
    }

    // 2. Ten Count / Long Count red aim line while charging
    if (this.tenCountState === 'charging') {
      const s = camera.worldToScreen(p.x, p.y);
      const sx = Math.round(s.x);
      const sy = Math.round(s.y);
      const ex = sx + Math.round(Math.cos(this.tenCountAngle) * 320);
      const ey = sy + Math.round(Math.sin(this.tenCountAngle) * 320);
      drawPixelLine(ctx, sx, sy, ex, ey, PALETTE.blood, p.hasNode('longCount') ? 2 : 1);
    }

    // 3. Reload bar above Rook's head when reloading
    if (this.reloading) {
      const s = camera.worldToScreen(p.x, p.y);
      const bx = Math.round(s.x - 14);
      const by = Math.round(s.y - 26);
      const w = 28;
      const progress = Math.max(0, Math.min(1, this.reloadTimer / this.reloadDuration));
      const winStart = this.getPerfectWindowStart();

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(bx - 1, by - 1, w + 2, 5);
      // Marked Perfect Reload zone in last 25% (or 50% with Clean Reload)
      const winX = bx + Math.round(w * winStart);
      ctx.fillStyle = this.reloadLockout ? PALETTE.slag : PALETTE.brass;
      ctx.fillRect(winX, by, bx + w - winX, 3);
      // Moving cursor tick
      const curX = bx + Math.round(w * progress);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(curX, by - 1, 2, 5);
    }
  }

  getHudMechanicState() {
    const maxMag = this.getMaxMagazine ? this.getMaxMagazine() : (this.maxMag || 6);
    const winStart = this.getPerfectWindowStart ? this.getPerfectWindowStart() : 0.45;
    return {
      type: 'magazine',
      bolts: this.ammo !== undefined ? this.ammo : maxMag,
      maxBolts: maxMag,
      reloading: !!this.reloading,
      reloadProgress: this.reloadDuration > 0 ? this.reloadTimer / this.reloadDuration : 0,
      windowStart: winStart,
      windowEnd: 1.0,
      lockout: !!this.reloadLockout,
    };
  }
}

export default RangedBehavior;
