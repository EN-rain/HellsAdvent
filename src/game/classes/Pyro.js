/**
 * GRAVEL SKY — Thermo-Lancer Class Behavior Module (Kaelen Vos)
 * Implements Boiler Pressure (0-100%), Red Gauge & Overheated Surge, Manual Steam Vent [V],
 * Naphtha Flame Sweep / Lance Thrust, Naphtha Jet, Caustic Mortar, Vent Supernova,
 * and Hellburner/Cremator + Slagclad/Furnace Lord branch modifiers.
 */

import { PALETTE } from '../../data/config.js';
import { CLASSES } from '../../data/classes.js';
import { computeDamagePipeline } from '../Status.js';
import { angleTo4Facing, drawBresenhamCircle, drawPixelLine } from '../PixelArt.js';
import { sound } from '../Audio.js';

export class PyroBehavior {
  constructor(player) {
    this.player = player;
    this.cfg = CLASSES.kaelen;

    // Boiler Pressure state (0..100)
    this.pressure = 0;
    this.maxPressure = 100;
    this.idleDecayTimer = 0;
    this.sweepStep = 0;

    // Active ground fire pools, mortar shells in flight, and flame cone visuals
    this.firePools = []; // [{ x, y, radius, life, maxLife, tickTimer, isCaustic, damageMult }]
    this.mortars = []; // [{ startX, startY, endX, endY, progress, duration, radius, damageMult }]
    this.flameCones = []; // [{ x, y, angle, reach, arc, life, maxLife, color }]

    // Molten Juggernaut (Hellbore Eruption Master) pulse timer
    this.juggernautPulseTimer = 0;
  }

  getRedZoneThreshold() {
    return this.player.hasNode('thermiteCore') ? 35 : 50;
  }

  isInRedZone() {
    return this.pressure >= this.getRedZoneThreshold() || this.player.statuses.has('overheated');
  }

  getRedZoneBonusPct() {
    if (!this.isInRedZone()) return 0;
    return this.player.hasNode('thermiteCore') ? 0.35 : 0.25;
  }

  getPassiveFlameBonusPct() {
    const lvl = this.player.passives.asbestosLining || 0;
    return lvl * 0.10;
  }

  getPressureDefBonus() {
    const p = this.player;
    let bonus = (p.passives.asbestosLining || 0) * 3;
    if (p.hasNode('pressurePlate')) {
      bonus += Math.floor(this.pressure / 25) * 3;
    }
    return bonus;
  }

  addPressure(amount, particles = null, spawner = null, camera = null) {
    const p = this.player;
    const bellowsLvl = p.passives.draftBellows || 0;
    const mult = 1 + bellowsLvl * 0.15;
    const prev = this.pressure;
    this.pressure = Math.min(this.maxPressure, +(this.pressure + amount * mult).toFixed(1));
    this.idleDecayTimer = this.cfg.mechanic.decayDelay;

    const redThresh = this.getRedZoneThreshold();
    if (prev < redThresh && this.pressure >= redThresh && particles && typeof particles.spawnFloatingText === 'function') {
      particles.spawnFloatingText(p.x, p.y - 22, 'RED GAUGE!', PALETTE.ember);
    }

    // Reaching 100% triggers Overheated Surge for 4s and vents a 105px steam burst!
    if (this.pressure >= 100 && !p.statuses.has('overheated')) {
      this.pressure = 65;
      p.statuses.apply(
        'overheated',
        { duration: 4.0, sourceName: 'Boiler Overdrive' },
        p,
        particles
      );
      sound.playSkillGroundBreak();
      if (camera && typeof camera.shake === 'function') camera.shake(5, 0.16);
      if (particles) {
        if (typeof particles.spawnShockwave === 'function') particles.spawnShockwave(p.x, p.y, 105, PALETTE.ember, 0.24);
        if (typeof particles.spawnFloatingText === 'function') particles.spawnFloatingText(p.x, p.y - 26, 'OVERDRIVE!', PALETTE.brass);
        if (typeof particles.spawnBurst === 'function') particles.spawnBurst(p.x, p.y, 10, PALETTE.ember, 40, 110, 2, 0.3);
      }
      if (spawner && typeof spawner.queryRadius === 'function') {
        const near = spawner.queryRadius(p.x, p.y, 105);
        for (let i = 0; i < near.length; i++) {
          const e = near[i];
          if (!e.active || e.hp <= 0) continue;
          const ang = Math.atan2(e.y - p.y, e.x - p.x);
          e.takeDamage(Math.round(p.atk * 1.1), ang, 110, false, p, spawner, particles, camera);
          if (e.active) {
            e.statuses.apply(
              'burn',
              { duration: 3.5, sourceAtk: p.atk, sourceName: 'Overdrive Vent' },
              e,
              particles
            );
          }
        }
      }
    }
  }

  onTakeDamage(particles = null, spawner = null, camera = null) {
    if (this.player.hasNode('boilerFortress')) {
      this.addPressure(12, particles, spawner, camera);
    }
  }

  /**
   * [V] or Right-Click: Manual Steam Vent (consumes 40 Pressure, radial knockback + cleanse/heal)
   */
  trySteamVent(arg1 = null, arg2 = null, arg3 = null) {
    let spawner = null;
    let particles = null;
    let camera = null;
    if (arg1 && (typeof arg1.spawnShockwave === 'function' || typeof arg1.spawnFloatingText === 'function')) {
      particles = arg1;
      spawner = arg2;
      camera = arg3;
    } else {
      spawner = arg1;
      particles = arg2;
      camera = arg3;
    }

    const p = this.player;
    if (p.dead || p.statuses.cannotAct() || this.pressure < 40) {
      if (particles && typeof particles.spawnFloatingText === 'function' && this.pressure < 40) {
        particles.spawnFloatingText(p.x, p.y - 20, 'NEED 40% PRESSURE', PALETTE.boneDark);
      }
      return false;
    }

    this.pressure = Math.max(0, this.pressure - 40);
    sound.playSkillGroundBreak();
    if (camera && typeof camera.shake === 'function') camera.shake(4, 0.14);

    p.statuses.cleanseSpecific(['choked', 'slow']);
    const healRatio = p.hasNode('reliefValve') ? 0.12 : 0.06;
    if (p.hasNode('reliefValve')) {
      p.statuses.cleanseAllDebuffs();
    }
    const healAmt = Math.max(1, Math.round(p.maxHp * healRatio));
    p.hp = Math.min(p.maxHp, p.hp + healAmt);

    if (particles) {
      if (typeof particles.spawnShockwave === 'function') {
        particles.spawnShockwave(p.x, p.y, 105, PALETTE.bone, 0.22);
        particles.spawnShockwave(p.x, p.y, 85, PALETTE.ember, 0.18);
      }
      if (typeof particles.spawnFloatingText === 'function') {
        particles.spawnFloatingText(p.x, p.y - 24, `STEAM VENT +${healAmt} HP`, PALETTE.ember);
      }
    }

    if (spawner && typeof spawner.queryRadius === 'function') {
      const targets = spawner.queryRadius(p.x, p.y, 105);
      for (let i = 0; i < targets.length; i++) {
        const e = targets[i];
        if (!e.active || e.hp <= 0) continue;
        const ang = Math.atan2(e.y - p.y, e.x - p.x);
        e.takeDamage(Math.round(p.atk * 1.25), ang, 145, false, p, spawner, particles, camera);
        if (e.active) {
          e.statuses.apply('burn', { duration: 3.0, sourceAtk: p.atk, sourceName: 'Steam Vent' }, e, particles);
        }
      }
    }
    return true;
  }

  spawnFirePool(x, y, radius = 44, duration = 4.0, isCaustic = false, damageMult = 0.45) {
    if (this.firePools.length >= 16) this.firePools.shift();
    this.firePools.push({
      x: Math.round(x),
      y: Math.round(y),
      radius,
      life: duration,
      maxLife: duration,
      tickTimer: 0.15,
      isCaustic,
      damageMult,
    });
  }

  update(dt, input, spawner, projectiles, particles, camera, onHitStop) {
    const p = this.player;

    // 1. Pressure decay after idle delay
    if (this.idleDecayTimer > 0) {
      this.idleDecayTimer = Math.max(0, this.idleDecayTimer - dt);
    } else if (this.pressure > 0 && !p.statuses.has('overheated')) {
      this.pressure = Math.max(0, +(this.pressure - this.cfg.mechanic.decayPerSec * dt).toFixed(1));
    }

    // 2. Update active flame cones
    for (let i = this.flameCones.length - 1; i >= 0; i--) {
      this.flameCones[i].life -= dt;
      if (this.flameCones[i].life <= 0) {
        this.flameCones.splice(i, 1);
      }
    }

    // 3. Update active Naphtha / Caustic Fire Pools
    const poolBonus = (p.hasNode('flashpoint') ? 0.50 : 0) + this.getPassiveFlameBonusPct();
    for (let i = this.firePools.length - 1; i >= 0; i--) {
      const fp = this.firePools[i];
      fp.life -= dt;
      if (fp.life <= 0) {
        this.firePools.splice(i, 1);
        continue;
      }
      fp.tickTimer -= dt;
      if (fp.tickTimer <= 0) {
        fp.tickTimer = 0.45;
        const enemies = spawner && typeof spawner.queryRadius === 'function'
          ? spawner.queryRadius(fp.x, fp.y, fp.radius + 20)
          : [];
        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - fp.x, e.y - fp.y) <= fp.radius + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: p.baseAtkForPipeline * fp.damageMult * (1 + poolBonus),
              atkBuffPct: p.statuses.getAtkBonusPct(),
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: fp.isCaustic ? 'Caustic Pool' : 'Naphtha Pool',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, 0, 12, false, p, spawner, particles, camera);
            if (e.active) {
              e.statuses.apply(
                'burn',
                { duration: 3.0, sourceAtk: p.atk, sourceName: 'Naphtha Pool' },
                e,
                particles
              );
              if (fp.isCaustic) {
                e.statuses.apply(
                  'corrode',
                  { duration: 6.0, sourceName: 'Caustic Pool' },
                  e,
                  particles
                );
              }
            }
          }
        }
      }
    }

    // 4. Update parabolic Caustic Mortar canisters in flight
    for (let i = this.mortars.length - 1; i >= 0; i--) {
      const m = this.mortars[i];
      m.progress += dt / Math.max(0.05, m.duration);
      if (m.progress >= 1) {
        this._detonateCausticMortar(m, spawner, particles, camera, onHitStop);
        this.mortars.splice(i, 1);
      }
    }

    // 5. Molten Juggernaut (Hellbore Eruption Master) searing aura pulses
    if (p.statuses.has('moltenJuggernaut')) {
      this.juggernautPulseTimer += dt;
      if (this.juggernautPulseTimer >= 0.75) {
        this.juggernautPulseTimer = 0;
        if (particles) {
          particles.spawnShockwave(p.x, p.y, 135, PALETTE.ember, 0.22);
        }
        const near = spawner && typeof spawner.queryRadius === 'function'
          ? spawner.queryRadius(p.x, p.y, 135)
          : [];
        for (let i = 0; i < near.length; i++) {
          const e = near[i];
          if (!e.active || e.hp <= 0) continue;
          const ang = Math.atan2(e.y - p.y, e.x - p.x);
          e.takeDamage(Math.round(p.atk * 0.95), ang, 80, false, p, spawner, particles, camera);
          if (e.active) {
            e.statuses.apply('burn', { duration: 3.5, sourceAtk: p.atk, sourceName: 'Hellbore Aura' }, e, particles);
          }
        }
      }
    } else {
      this.juggernautPulseTimer = 0;
    }
  }

  /**
   * Basic Attack: Pressurized Flame Sweep (step 1-2) & Boiler Lance Impale (step 3)
   */
  tryBasicAttack(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop) {
    const p = this.player;
    if (
      p.dead ||
      p.statuses.cannotAct() ||
      p.ultimateActive ||
      p.dodgeTimer > 0 ||
      p.attackTimer > 0
    ) {
      return false;
    }

    const atkSpd = p.statuses.getAttackSpeedMultiplier();
    p.attackDuration = (1 / this.cfg.basicAttack.fireRate) / atkSpd;
    p.attackTimer = p.attackDuration;

    this.sweepStep = (this.sweepStep % 3) + 1;
    p.comboStep = this.sweepStep;
    p.comboResetTimer = 0.8;

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.attackAngle = angle;
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    const isRed = this.isInRedZone();
    const isOverheated = p.statuses.has('overheated');
    const reach = this.cfg.basicAttack.reach + (isOverheated ? 18 : 0);
    const arc = this.cfg.basicAttack.arc;

    // Visual Flame Cone Sweep + Crescent fire wave
    this.flameCones.push({
      x: p.x,
      y: p.y,
      angle,
      reach,
      arc,
      life: 0.18,
      maxLife: 0.18,
      color: isOverheated ? PALETTE.brass : PALETTE.ember,
    });

    if (particles) {
      if (typeof particles.spawnCrescentSlash === 'function') {
        particles.spawnCrescentSlash(
          p.x,
          p.y,
          angle,
          reach * 0.85,
          arc,
          isRed ? PALETTE.ember : PALETTE.rustLight,
          0.20
        );
        if (isOverheated) {
          particles.spawnCrescentSlash(
            p.x,
            p.y,
            angle,
            reach * 1.05,
            arc * 1.1,
            PALETTE.brass,
            0.24
          );
        }
      }
      particles.spawnDirectionalSparks(
        p.x + Math.cos(angle) * 20,
        p.y + Math.sin(angle) * 20,
        angle,
        0.85,
        isRed ? 9 : 6,
        isRed ? PALETTE.ember : PALETTE.brass
      );
    }

    // White Phosphor (Cremator Master): at 50%+ Pressure, launches a piercing slag wave projectile
    if (isRed && p.hasNode('whitePhosphor') && projectiles && typeof projectiles.spawn === 'function') {
      projectiles.spawn({
        x: p.x + Math.cos(angle) * 18,
        y: p.y + Math.sin(angle) * 18,
        angle,
        speed: 620,
        maxRange: 260,
        radius: 10,
        damage: p.baseAtkForPipeline * 0.85,
        atkBuffPct: p.statuses.getAtkBonusPct() + this.getRedZoneBonusPct() + this.getPassiveFlameBonusPct(),
        isPlayer: true,
        pierce: 4,
        type: 'rookBolt',
        color: PALETTE.ember,
        onHitStatus: { id: 'corrode', duration: 6.0, sourceName: 'White Phosphor' },
      });
    }

    sound.playSlash(this.sweepStep);
    this.addPressure(this.cfg.basicAttack.pressureGain, particles, spawner, camera);

    const candidates = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(p.x, p.y, reach + 32)
      : [];
    let hitAny = false;
    const totalBonusPct =
      p.statuses.getAtkBonusPct() +
      this.getRedZoneBonusPct() +
      this.getPassiveFlameBonusPct();
    const stepMult = this.sweepStep === 3 ? 1.35 : this.cfg.basicAttack.damageMult;

    for (let i = 0; i < candidates.length; i++) {
      const e = candidates[i];
      if (!e.active || e.hp <= 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > reach + e.radius) continue;

      let diff = Math.atan2(dy, dx) - angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      if (Math.abs(diff) <= arc * 0.55 || dist <= e.radius + 18) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * stepMult,
          atkBuffPct: totalBonusPct,
          isCrit,
          critMult: p.critMult,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Slag Igniter',
          targetName: e.name,
        });

        e.takeDamage(
          pipe.finalDamage,
          angle,
          this.sweepStep === 3 ? 115 : 70,
          isCrit,
          p,
          spawner,
          particles,
          camera
        );

        // Red Gauge or Hit 3 ignites Burn!
        if ((isRed || this.sweepStep === 3) && e.active) {
          e.statuses.apply(
            'burn',
            { duration: 3.5, sourceAtk: p.atk, sourceName: 'Slag Igniter' },
            e,
            particles
          );
          if (isRed && p.hasNode('whitePhosphor')) {
            e.statuses.apply(
              'corrode',
              { duration: 6.0, sourceName: 'White Phosphor' },
              e,
              particles
            );
          }
        }
        hitAny = true;
      }
    }

    if (hitAny) {
      p.addUltimateCharge(4.2);
      sound.playHit(this.sweepStep === 3);
      if (camera && typeof camera.shake === 'function') camera.shake(this.sweepStep === 3 ? 3 : 2, 0.08);
      if (onHitStop && this.sweepStep === 3) onHitStop(0.04);
    }

    return true;
  }

  /**
   * Skill 1 — Naphtha Jet: Rocket 150px forward, leaving burning naphtha pools and slamming with the lance
   */
  trySkill1(worldMouseX, worldMouseY, arg3, arg4, arg5, arg6, arg7) {
    let spawner = arg3;
    let particles = arg4;
    let camera = arg5;
    let onHitStop = arg6;
    if (arg4 && (arg4.projectiles !== undefined || (arg5 && (typeof arg5.spawnBurst === 'function' || typeof arg5.spawnFloatingText === 'function')))) {
      particles = arg5;
      camera = arg6;
      onHitStop = arg7;
    }

    const p = this.player;
    const skillDef = this.cfg.skills[0];
    const stats = skillDef.getStats(p.skills.naphthaJet || 1, p.ownedNodes);

    if (p.cooldowns.skill1 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill1 = stats.cooldown;
    p.maxCooldowns.skill1 = stats.cooldown;

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    const x1 = p.x;
    const y1 = p.y;
    const x2 = p.clampCoord(p.x + Math.cos(angle) * stats.dashDistance);
    const y2 = p.clampCoord(p.y + Math.sin(angle) * stats.dashDistance);

    // Spawn 4 burning naphtha pools along the rocket path
    for (let s = 0; s < 4; s++) {
      const t = s / 3;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      this.spawnFirePool(px, py, 38, 4.0, false, 0.45);
      if (particles) {
        particles.spawnBurst(px, py, 5, PALETTE.ember, 25, 70, 2, 0.25);
      }
    }

    p.x = x2;
    p.y = y2;
    p.invulnTimer = Math.max(p.invulnTimer, 0.22);

    // Slag Weld (Slagclad Journeyman): grants Slag Carapace (-25% DMG taken for 4s)
    if (p.hasNode('slagWeld')) {
      p.statuses.apply('slagCarapace', { duration: 4.0, sourceName: 'Slag Weld' }, p, particles);
    }

    this.addPressure(stats.pressureGain, particles, spawner, camera);
    sound.playSkillLunge();
    if (camera && typeof camera.shake === 'function') camera.shake(5, 0.14);

    if (particles) {
      particles.spawnSlash(x1, y1, x2, y2, PALETTE.ember, 0.22, 'lunge');
      particles.spawnShockwave(x2, y2, 72, PALETTE.ember, 0.20);
    }

    // Damage all enemies along the jet line + arrival slam
    const segLenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    const candidates = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius((x1 + x2) * 0.5, (y1 + y2) * 0.5, 160)
      : [];
    let hitCount = 0;
    const atkBonus = p.statuses.getAtkBonusPct() + this.getRedZoneBonusPct() + this.getPassiveFlameBonusPct();

    for (let i = 0; i < candidates.length; i++) {
      const e = candidates[i];
      if (!e.active || e.hp <= 0) continue;
      let t = 0;
      if (segLenSq > 0) {
        t = ((e.x - x1) * (x2 - x1) + (e.y - y1) * (y2 - y1)) / segLenSq;
        t = Math.max(0, Math.min(1, t));
      }
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      if (Math.hypot(e.x - projX, e.y - projY) <= 36 + e.radius || Math.hypot(e.x - x2, e.y - y2) <= 72 + e.radius) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * stats.damageMult,
          atkBuffPct: atkBonus,
          isCrit,
          critMult: p.critMult,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Naphtha Jet',
          targetName: e.name,
        });
        e.takeDamage(pipe.finalDamage, angle, 130, isCrit, p, spawner, particles, camera);
        if (e.active) {
          e.statuses.apply('burn', { duration: 4.0, sourceAtk: p.atk, sourceName: 'Naphtha Jet' }, e, particles);
        }
        hitCount++;
      }
    }

    if (hitCount > 0) {
      p.addUltimateCharge(hitCount * 4.0);
      if (onHitStop) onHitStop(0.05);
    }
    return true;
  }

  /**
   * Skill 2 — Caustic Mortar: Lob pressurized lye-naphtha canister to cursor
   */
  trySkill2(worldMouseX, worldMouseY, arg3, arg4, arg5, arg6, arg7) {
    let spawner = arg3;
    let particles = arg4;
    let camera = arg5;
    let onHitStop = arg6;
    if (arg4 && (arg4.projectiles !== undefined || (arg5 && (typeof arg5.spawnBurst === 'function' || typeof arg5.spawnGroundBreakEffect === 'function')))) {
      particles = arg5;
      camera = arg6;
      onHitStop = arg7;
    }

    const p = this.player;
    const skillDef = this.cfg.skills[1];
    const stats = skillDef.getStats(p.skills.causticMortar || 1, p.ownedNodes);

    if (p.cooldowns.skill2 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill2 = stats.cooldown;
    p.maxCooldowns.skill2 = stats.cooldown;

    const dx = worldMouseX - p.x;
    const dy = worldMouseY - p.y;
    const dist = Math.min(320, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    const tx = p.clampCoord(p.x + Math.cos(angle) * dist);
    const ty = p.clampCoord(p.y + Math.sin(angle) * dist);

    this.mortars.push({
      startX: p.x,
      startY: p.y,
      endX: tx,
      endY: ty,
      progress: 0,
      duration: 0.26,
      radius: stats.radius,
      damageMult: stats.damageMult,
    });

    this.addPressure(stats.pressureGain, particles, spawner, camera);
    sound.playSpringgunShot(true);
    return true;
  }

  _detonateCausticMortar(m, spawner, particles, camera, onHitStop) {
    const p = this.player;
    sound.playSkillGroundBreak();
    if (camera && typeof camera.shake === 'function') camera.shake(5, 0.16);

    if (particles) {
      particles.spawnGroundBreakEffect(m.endX, m.endY, m.radius);
      particles.spawnShockwave(m.endX, m.endY, m.radius, PALETTE.lye, 0.24);
      particles.spawnBurst(m.endX, m.endY, 10, PALETTE.ember, 35, 105, 2, 0.3);
    }

    // Leave bubbling caustic fire zone for 3.5s
    this.spawnFirePool(m.endX, m.endY, Math.round(m.radius * 0.65), 3.5, true, 0.55);

    const hasBackdraft = p.hasNode('backdraft');
    const atkBonus = p.statuses.getAtkBonusPct() + this.getRedZoneBonusPct() + this.getPassiveFlameBonusPct();
    const targets = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(m.endX, m.endY, m.radius + 36)
      : [];
    let hitCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const e = targets[i];
      if (!e.active || e.hp <= 0) continue;
      const d = Math.hypot(e.x - m.endX, e.y - m.endY);
      if (d <= m.radius + e.radius) {
        if (hasBackdraft && e.tier !== 'boss') {
          e.x = Math.round(e.x + (m.endX - e.x) * 0.55);
          e.y = Math.round(e.y + (m.endY - e.y) * 0.55);
        }
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * m.damageMult,
          atkBuffPct: atkBonus,
          isCrit,
          critMult: p.critMult,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Caustic Mortar',
          targetName: e.name,
        });
        const ang = Math.atan2(e.y - m.endY, e.x - m.endX);
        e.takeDamage(pipe.finalDamage, ang, 110, isCrit, p, spawner, particles, camera);
        if (e.active) {
          e.statuses.apply('burn', { duration: 4.0, sourceAtk: p.atk, sourceName: 'Caustic Mortar' }, e, particles);
          e.statuses.apply('corrode', { duration: 8.0, sourceName: 'Caustic Mortar' }, e, particles);
        }
        hitCount++;
      }
    }

    if (hitCount > 0) {
      p.addUltimateCharge(hitCount * 4.0);
      if (onHitStop) onHitStop(0.04);
    }
  }

  /**
   * Skill 3 — Vent Supernova: Consumes up to 50% Pressure for a thermobaric nova + stun + Slag Carapace
   */
  trySkill3(worldMouseX, worldMouseY, arg3, arg4, arg5, arg6, arg7) {
    let spawner = arg3;
    let particles = arg4;
    let camera = arg5;
    let onHitStop = arg6;
    if (arg4 && (arg4.projectiles !== undefined || (arg5 && (typeof arg5.spawnBurst === 'function' || typeof arg5.spawnGroundBreakEffect === 'function')))) {
      particles = arg5;
      camera = arg6;
      onHitStop = arg7;
    }

    const p = this.player;
    const skillDef = this.cfg.skills[2];
    const stats = skillDef.getStats(p.skills.ventNova || 1, p.ownedNodes);

    if (p.cooldowns.skill3 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill3 = stats.cooldown;
    p.maxCooldowns.skill3 = stats.cooldown;

    // Consume up to 50% Pressure for up to +60% bonus damage
    const consumed = Math.min(50, this.pressure);
    this.pressure = Math.max(0, +(this.pressure - consumed).toFixed(1));
    const pressureBonusMult = 1 + (consumed / 50) * 0.60;

    p.statuses.apply('slagCarapace', { duration: 4.0, sourceName: 'Vent Supernova' }, p, particles);

    if (p.hasNode('reliefValve')) {
      p.statuses.cleanseAllDebuffs();
      const heal = Math.round(p.maxHp * 0.12);
      p.hp = Math.min(p.maxHp, p.hp + heal);
    }

    sound.playSkillGroundBreak();
    if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
    if (camera && typeof camera.shake === 'function') camera.shake(8, 0.24);

    if (particles) {
      particles.spawnGroundBreakEffect(p.x, p.y, stats.radius);
      particles.spawnShockwave(p.x, p.y, stats.radius, PALETTE.ember, 0.28);
      particles.spawnShockwave(p.x, p.y, Math.round(stats.radius * 0.7), PALETTE.brass, 0.20);
      particles.spawnBurst(p.x, p.y, 16, PALETTE.ember, 50, 140, 2, 0.35);
    }

    // Meltdown (Cremator Master): spawns 4 surrounding magma pools
    if (p.hasNode('meltdown')) {
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + 0.4;
        this.spawnFirePool(
          p.x + Math.cos(a) * 65,
          p.y + Math.sin(a) * 65,
          44,
          4.5,
          true,
          0.55
        );
      }
    }

    const stunDur = p.hasNode('concussionRam') ? 2.0 : 1.0;
    const hasConcussion = p.hasNode('concussionRam');
    const atkBonus = p.statuses.getAtkBonusPct() + this.getPassiveFlameBonusPct();
    const targets = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(p.x, p.y, stats.radius + 32)
      : [];
    let hitCount = 0;

    for (let i = 0; i < targets.length; i++) {
      const e = targets[i];
      if (!e.active || e.hp <= 0) continue;
      if (Math.hypot(e.x - p.x, e.y - p.y) <= stats.radius + e.radius) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * stats.damageMult * pressureBonusMult,
          atkBuffPct: atkBonus,
          isCrit,
          critMult: p.critMult,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Vent Supernova',
          targetName: e.name,
        });
        const ang = Math.atan2(e.y - p.y, e.x - p.x);
        e.takeDamage(pipe.finalDamage, ang, 165, isCrit, p, spawner, particles, camera);
        if (e.active) {
          e.statuses.apply('stun', { duration: stunDur, sourceName: 'Vent Supernova' }, e, particles);
          e.statuses.apply('burn', { duration: 4.0, sourceAtk: p.atk, sourceName: 'Vent Supernova' }, e, particles);
          if (hasConcussion) {
            e.statuses.apply('exposed', { duration: 6.0, sourceName: 'Concussion Ram' }, e, particles);
          }
        }
        hitCount++;
      }
    }

    if (hitCount > 0) {
      p.addUltimateCharge(hitCount * 4.5);
      if (onHitStop) onHitStop(0.06);
    }
    return true;
  }

  getHudMechanicState() {
    return {
      type: 'boilerPressure',
      pressure: Math.round(this.pressure),
      maxPressure: this.maxPressure,
      redThreshold: this.getRedZoneThreshold(),
      isRedZone: this.isInRedZone(),
      isOverheated: this.player.statuses.has('overheated'),
      canVent: this.pressure >= 40,
    };
  }

  drawClassExtras(ctx, camera) {
    const p = this.player;
    const camX = camera.renderX;
    const camY = camera.renderY;

    // 1. Draw active Naphtha & Caustic Fire Pools on ground
    for (let i = 0; i < this.firePools.length; i++) {
      const fp = this.firePools[i];
      const sx = Math.round(fp.x - camX);
      const sy = Math.round(fp.y - camY);
      const colOuter = fp.isCaustic ? PALETTE.lye : PALETTE.ember;
      const colInner = fp.isCaustic ? PALETTE.verdigris : PALETTE.brass;
      drawBresenhamCircle(ctx, sx, sy, fp.radius, colOuter, 0.75);
      drawBresenhamCircle(ctx, sx, sy, Math.round(fp.radius * 0.55), colInner, 0.55);

      // Flickering flame/bubble pixels inside pool
      const tick = Math.floor(p.animClock * 12) + i * 3;
      for (let f = 0; f < 4; f++) {
        const a = (f / 4) * Math.PI * 2 + tick * 0.4;
        const r = (fp.radius * 0.45) * ((f % 2 === 0) ? 0.8 : 0.4);
        const fx = Math.round(sx + Math.cos(a) * r);
        const fy = Math.round(sy + Math.sin(a) * r);
        ctx.fillStyle = f % 2 === 0 ? colInner : colOuter;
        ctx.fillRect(fx - 1, fy - 2, 2, 3);
      }
    }

    // 2. Draw Caustic Mortar canisters arcing through the air
    for (let i = 0; i < this.mortars.length; i++) {
      const m = this.mortars[i];
      const t = Math.min(1, m.progress);
      const curX = m.startX + (m.endX - m.startX) * t;
      const curY = m.startY + (m.endY - m.startY) * t;
      const lift = Math.sin(t * Math.PI) * 44;
      const sx = Math.round(curX - camX);
      const sy = Math.round(curY - camY - lift);

      // Target reticle on ground
      const tx = Math.round(m.endX - camX);
      const ty = Math.round(m.endY - camY);
      drawBresenhamCircle(ctx, tx, ty, Math.round(m.radius * t), PALETTE.lye, 0.55);

      // Canister shell
      ctx.fillStyle = PALETTE.ember;
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
      ctx.fillStyle = PALETTE.lye;
      ctx.fillRect(sx - 1, sy - 1, 3, 3);
    }

    // 3. Draw active Flame Cone sweeps
    for (let i = 0; i < this.flameCones.length; i++) {
      const fc = this.flameCones[i];
      const ratio = fc.life / fc.maxLife;
      const sx = Math.round(fc.x - camX);
      const sy = Math.round(fc.y - camY);
      const rays = 7;
      for (let r = 0; r < rays; r++) {
        const a = fc.angle - fc.arc * 0.5 + (r / (rays - 1)) * fc.arc;
        const dist = fc.reach * (0.45 + 0.55 * (1 - ratio * 0.5));
        const ex = Math.round(sx + Math.cos(a) * dist);
        const ey = Math.round(sy + Math.sin(a) * dist);
        drawPixelLine(ctx, sx, sy, ex, ey, r % 2 === 0 ? fc.color : PALETTE.brass, 2);
      }
    }

    // 4. Draw Red Gauge / Overheated / Molten Juggernaut heat ring around Kaelen
    if (this.isInRedZone() && !p.dead) {
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY);
      const isOver = p.statuses.has('overheated') || p.statuses.has('moltenJuggernaut');
      drawBresenhamCircle(
        ctx,
        sx,
        sy + 6,
        isOver ? 22 : 16,
        isOver ? PALETTE.brass : PALETTE.ember,
        0.55
      );
    }
  }
}

export default PyroBehavior;
