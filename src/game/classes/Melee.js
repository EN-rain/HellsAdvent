/**
 * GRAVEL SKY — Melee Class Behavior Module (Sena Ibuki)
 * Implements Momentum, 3-hit Railcut combo, Lunge, Ground Break, Rail Spike, Seven Cuts,
 * and all Cutter/Flenser & Anvil/Girder node modifiers.
 */

import { PALETTE } from '../../data/config.js';
import { CLASSES } from '../../data/classes.js';
import { computeDamagePipeline } from '../Status.js';
import { angleTo4Facing, drawBresenhamCircle, drawPixelLine } from '../PixelArt.js';
import { sound } from '../Audio.js';

export class MeleeBehavior {
  constructor(player) {
    this.player = player;
    this.cfg = CLASSES.sena;

    // Momentum class mechanic state
    this.momentumStacks = 0;
    this.momentumTimer = 0;

    // Strip (Flenser Master): every 4th hit on one enemy applies Exposed
    this.enemyHitCounter = new Map();

    // Brace (Anvil Journeyman): right-click guard state
    this.isGuarding = false;
    this.guardActiveTime = 0;

    // Dug In (Hold the Line Girder Master) active aura timer
    this.holdTheLineTimer = 0;
  }

  getMaxMomentum() {
    return this.player.branch === 'cutter'
      ? this.cfg.mechanic.maxStacksCutter
      : this.cfg.mechanic.maxStacksBase;
  }

  addMomentum(count = 1, particles = null) {
    const p = this.player;
    const maxStacks = this.getMaxMomentum();
    const branchMode = p.branch === 'cutter' ? 'cutter' : p.branch === 'anvil' ? 'anvil' : 'base';

    for (let i = 0; i < count; i++) {
      p.statuses.apply(
        'momentum',
        {
          duration: this.cfg.mechanic.dropDelay,
          maxStacks,
          branchMode,
          sourceName: 'Momentum',
        },
        p,
        particles
      );
    }
    this.momentumStacks = p.statuses.getStacks('momentum');
    this.momentumTimer = this.cfg.mechanic.dropDelay;

    // Redline node: at max Momentum, attacks cost no Stamina and move speed is +10%
    if (p.hasNode('redline') && this.momentumStacks >= maxStacks) {
      p.statuses.apply('redline', { duration: 3.0, sourceName: 'Redline' }, p, particles);
    }
  }

  onLandHit(enemy, isKill, particles) {
    this.addMomentum(1, particles);

    // Strip node: every 4th hit on one enemy applies Exposed (-20% DEF for 6s)
    if (this.player.hasNode('strip') && enemy && enemy.active) {
      const count = (this.enemyHitCounter.get(enemy.uid) || 0) + 1;
      this.enemyHitCounter.set(enemy.uid, count);
      if (count % 4 === 0) {
        enemy.statuses.apply(
          'exposed',
          { duration: 6.0, sourceName: 'Strip' },
          enemy,
          particles
        );
      }
    }
  }

  onTakeDamage() {
    const p = this.player;
    // Taking damage removes 2 stacks of Momentum
    p.statuses.removeStacks('momentum', 2);
    this.momentumStacks = p.statuses.getStacks('momentum');
    if (this.momentumStacks < this.getMaxMomentum()) {
      p.statuses.remove('redline');
    }
  }

  update(dt, input, spawner, particles, camera) {
    const p = this.player;
    this.momentumStacks = p.statuses.getStacks('momentum');
    const momInst = p.statuses.get('momentum');
    this.momentumTimer = momInst ? momInst.duration : 0;

    if (p.hasNode('redline') && this.momentumStacks >= this.getMaxMomentum()) {
      p.statuses.apply('redline', { duration: 0.25, sourceName: 'Redline' }, p, null);
    } else {
      p.statuses.remove('redline');
    }

    // Brace (Anvil Journeyman): hold right click to guard (10 Stamina/s)
    if (p.hasNode('brace') && input && input.rightMouseDown && !p.dead && p.stamina > 1) {
      const cost = 10 * dt;
      if (p.stamina >= cost) {
        p.stamina = Math.max(0, p.stamina - cost);
        this.isGuarding = true;
        this.guardActiveTime += dt;
        p.statuses.apply('guarding', { duration: 0.15, sourceName: 'Brace' }, p, null);
      } else {
        this.isGuarding = false;
        this.guardActiveTime = 0;
      }
    } else {
      this.isGuarding = false;
      this.guardActiveTime = 0;
    }

    // Hold the Line (Girder Master): 6s Dug In stand aura drawing enemies within 300px
    if (this.holdTheLineTimer > 0) {
      this.holdTheLineTimer = Math.max(0, this.holdTheLineTimer - dt);
      const nearby = spawner && typeof spawner.queryRadius === 'function'
        ? spawner.queryRadius(p.x, p.y, 300)
        : [];
      for (let i = 0; i < nearby.length; i++) {
        const e = nearby[i];
        if (!e.active || e.hp <= 0 || e.tier === 'boss') continue;
        e.statuses.apply(
          'drawnIn',
          { duration: 0.5, tauntTarget: p, sourceName: 'Hold the Line' },
          e,
          null
        );
      }
    }
  }

  /**
   * Basic Attack: 3-hit Railcut combo at 100% / 110% / 150% ATK, reach 40px
   */
  tryBasicAttack(worldMouseX, worldMouseY, spawner, particles, camera, onHitStop) {
    const p = this.player;
    if (
      p.dead ||
      p.statuses.cannotAct() ||
      p.ultimateActive ||
      p.lungeState !== 'none' ||
      p.groundBreakState !== 'none' ||
      p.railSpikeTimer > 0 ||
      p.dodgeTimer > 0 ||
      p.attackTimer > 0
    ) {
      return false;
    }

    const hits = this.cfg.basicAttack.hits;
    const nextStep = p.comboResetTimer > 0 ? (p.comboStep % 3) + 1 : 1;
    const hitCfg = hits[nextStep - 1];

    p.comboStep = nextStep;
    const atkSpd = p.statuses.getAttackSpeedMultiplier();
    p.attackDuration = hitCfg.duration / atkSpd;
    p.attackTimer = p.attackDuration;
    p.comboResetTimer = 0.75;

    p.attackAngle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(p.attackAngle);
    p.facingX = Math.cos(p.attackAngle) >= 0 ? 1 : -1;

    // Step forward slightly on swing
    const stepDist = nextStep === 3 ? 12 : 6;
    p.x = p.clampCoord(p.x + Math.cos(p.attackAngle) * stepDist);
    p.y = p.clampCoord(p.y + Math.sin(p.attackAngle) * stepDist);

    sound.playSlash(nextStep);

    const reach = hitCfg.range + 12;

    if (particles && typeof particles.spawnSlash === 'function') {
      const halfArc = (hitCfg.arc || 1.6) * 0.45;
      const a1 = p.attackAngle - halfArc;
      const a2 = p.attackAngle + halfArc;
      const r = reach * 0.95;
      particles.spawnSlash(
        p.x + Math.cos(a1) * (r * 0.35),
        p.y + Math.sin(a1) * (r * 0.35),
        p.x + Math.cos(a2) * r,
        p.y + Math.sin(a2) * r,
        nextStep === 3 ? PALETTE.signal : PALETTE.bone,
        0.13,
        'lunge'
      );
    }

    const candidates = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(p.x, p.y, reach + 32)
      : [];
    let hitAny = false;

    for (let i = 0; i < candidates.length; i++) {
      const enemy = candidates[i];
      if (!enemy.active || enemy.hp <= 0) continue;

      const dx = enemy.x - p.x;
      const dy = enemy.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > reach + enemy.radius) continue;

      const angleToEnemy = Math.atan2(dy, dx);
      let diff = angleToEnemy - p.attackAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      if (Math.abs(diff) <= hitCfg.arc * 0.55 || dist <= enemy.radius + 16) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * hitCfg.mult,
          atkBuffPct: p.statuses.getAtkBonusPct(),
          isCrit,
          critMult: p.critMult,
          distanceBonusPct: 0,
          targetStatuses: enemy.statuses,
          targetBaseDef: enemy.def || 0,
          sourceName: `Railcut Hit ${nextStep}`,
          targetName: enemy.name,
        });

        const prevHp = enemy.hp;
        enemy.takeDamage(
          pipe.finalDamage,
          p.attackAngle,
          hitCfg.knockback,
          isCrit,
          p,
          spawner,
          particles,
          camera
        );

        // Open Wound (Cutter Journeyman): combo hit 3 applies Bleed (15% ATK/s for 4s)
        if (nextStep === 3 && p.hasNode('openWound') && enemy.active) {
          enemy.statuses.apply(
            'bleed',
            { duration: 4.0, sourceAtk: p.atk, sourceName: 'Open Wound' },
            enemy,
            particles
          );
        }

        this.onLandHit(enemy, prevHp > 0 && enemy.hp <= 0, particles);
        hitAny = true;
      }
    }

    if (hitAny) {
      p.addUltimateCharge(4.5);
      sound.playHit(nextStep === 3);
      if (camera && typeof camera.shake === 'function') camera.shake(nextStep === 3 ? 4 : 2, 0.09);
      if (onHitStop) onHitStop(0.05);
    }

    return true;
  }

  /**
   * Skill 1 — Lunge
   */
  trySkill1(worldMouseX, worldMouseY, spawner, particles, camera, onHitStop) {
    const p = this.player;
    const skillDef = this.cfg.skills[0];
    const stats = skillDef.getStats(p.skills.lunge || 1, p.ownedNodes);
    const stamCost = p.statuses.has('redline') ? 0 : stats.staminaCost;

    if (p.cooldowns.skill1 > 0 || p.stamina < stamCost) return false;
    p.stamina -= stamCost;
    p.cooldowns.skill1 = stats.cooldown;
    p.maxCooldowns.skill1 = stats.cooldown;

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    p.lungeState = 'crouch';
    p.lungeTimer = 1 / 12;
    p.lungeAngle = angle;
    p.lungeStartX = p.x;
    p.lungeStartY = p.y;
    p.lungeEndX = p.clampCoord(p.x + Math.cos(angle) * stats.dashDistance);
    p.lungeEndY = p.clampCoord(p.y + Math.sin(angle) * stats.dashDistance);
    p.lungeAfterimages = [];
    p._pendingLungeStats = stats;

    sound.playSkillLunge();
    return true;
  }

  executeLungeImpact(spawner, particles, camera, onHitStop) {
    const p = this.player;
    const stats = p._pendingLungeStats || { damageMult: 1.6 };
    const x1 = p.lungeStartX;
    const y1 = p.lungeStartY;
    const x2 = p.lungeEndX;
    const y2 = p.lungeEndY;
    const segLenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);

    p.x = x2;
    p.y = y2;
    if (particles && typeof particles.spawnSlash === 'function') {
      particles.spawnSlash(x1, y1, x2, y2, PALETTE.signal, 0.15, 'lunge');
    }

    const midX = (x1 + x2) * 0.5;
    const midY = (y1 + y2) * 0.5;
    const candidates = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(midX, midY, 160)
      : [];
    let hitCount = 0;
    let killedAny = false;

    for (let i = 0; i < candidates.length; i++) {
      const enemy = candidates[i];
      if (!enemy.active || enemy.hp <= 0) continue;

      let t = 0;
      if (segLenSq > 0) {
        t = ((enemy.x - x1) * (x2 - x1) + (enemy.y - y1) * (y2 - y1)) / segLenSq;
        t = Math.max(0, Math.min(1, t));
      }
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      const dist = Math.hypot(enemy.x - projX, enemy.y - projY);

      if (dist <= 28 + enemy.radius) {
        const isCrit = Math.random() < p.critChance;
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * stats.damageMult,
          atkBuffPct: p.statuses.getAtkBonusPct(),
          isCrit,
          critMult: p.critMult,
          targetStatuses: enemy.statuses,
          targetBaseDef: enemy.def || 0,
          sourceName: 'Lunge',
          targetName: enemy.name,
        });

        const prevHp = enemy.hp;
        enemy.takeDamage(
          pipe.finalDamage,
          p.lungeAngle,
          140,
          isCrit,
          p,
          spawner,
          particles,
          camera
        );
        if (particles && typeof particles.spawnCrossCutFlash === 'function') {
          particles.spawnCrossCutFlash(enemy.x, enemy.y);
        }

        const killed = prevHp > 0 && enemy.hp <= 0;
        if (killed) killedAny = true;
        this.onLandHit(enemy, killed, particles);
        hitCount++;
      }
    }

    // Quick Edge (Cutter Journeyman): resets Lunge cooldown on a kill
    if (killedAny && p.hasNode('quickEdge')) {
      p.cooldowns.skill1 = 0;
      if (particles && typeof particles.spawnDamageNumber === 'function') {
        particles.spawnDamageNumber(p.x, p.y - 24, 0, true, 'RESET!', PALETTE.signal);
      }
    }

    if (hitCount > 0) {
      p.addUltimateCharge(hitCount * 4.5);
      sound.playHit(true);
      if (camera && typeof camera.shake === 'function') camera.shake(4, 0.12);
      if (onHitStop) onHitStop(0.05);
    }
  }

  /**
   * Skill 2 — Ground Break (or Carve forward 3-slash cone if Flenser node owned)
   */
  trySkill2(worldMouseX, worldMouseY, spawner, particles, camera, onHitStop) {
    const p = this.player;
    const skillDef = this.cfg.skills[1];
    const stats = skillDef.getStats(p.skills.groundBreak || 1, p.ownedNodes);
    const stamCost = p.statuses.has('redline') ? 0 : stats.staminaCost;

    if (p.cooldowns.skill2 > 0 || p.stamina < stamCost) return false;
    p.stamina -= stamCost;
    p.cooldowns.skill2 = stats.cooldown;
    p.maxCooldowns.skill2 = stats.cooldown;

    p.attackAngle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(p.attackAngle);
    p.facingX = Math.cos(p.attackAngle) >= 0 ? 1 : -1;

    p.groundBreakState = 'raise';
    p.groundBreakTimer = 3 / 12;
    p.groundBreakRadius = stats.radius;
    p.groundBreakDamageMult = stats.damageMult;
    p.groundBreakStun = stats.stunDuration;

    return true;
  }

  executeGroundBreakImpact(spawner, particles, camera, onHitStop) {
    const p = this.player;
    const radius = p.groundBreakRadius;
    const hasCarve = p.hasNode('carve');

    sound.playSkillGroundBreak();
    if (camera && typeof camera.shake === 'function') camera.shake(3, 0.18);

    // Heavy Landing (Anvil Journeyman): grants 15% damage reduction for 3s
    if (p.hasNode('heavyLanding')) {
      p.statuses.apply(
        'heavyLanding',
        { duration: 3.0, sourceName: 'Heavy Landing' },
        p,
        particles
      );
    }

    if (hasCarve) {
      // Carve (Flenser Master): forward 3-slash cone, 260% ATK, no stun
      for (const offsetAngle of [-0.35, 0, 0.35]) {
        const a = p.attackAngle + offsetAngle;
        if (particles && typeof particles.spawnSlash === 'function') {
          particles.spawnSlash(
            p.x,
            p.y,
            p.x + Math.cos(a) * radius,
            p.y + Math.sin(a) * radius,
            PALETTE.signal,
            0.22,
            'lunge'
          );
        }
      }
    } else {
      if (particles && typeof particles.spawnGroundBreakEffect === 'function') {
        particles.spawnGroundBreakEffect(p.x, p.y, radius);
      }
    }

    const candidates = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(p.x, p.y, radius + 36)
      : [];
    let hitCount = 0;

    for (let i = 0; i < candidates.length; i++) {
      const enemy = candidates[i];
      if (!enemy.active || enemy.hp <= 0) continue;

      const dx = enemy.x - p.x;
      const dy = enemy.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > radius + enemy.radius) continue;

      if (hasCarve) {
        const ang = Math.atan2(dy, dx);
        let diff = ang - p.attackAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) > 0.95 && dist > 28) continue;
      }

      const isCrit = Math.random() < p.critChance;
      const pipe = computeDamagePipeline({
        baseDamage: p.baseAtkForPipeline * p.groundBreakDamageMult,
        atkBuffPct: p.statuses.getAtkBonusPct(),
        isCrit,
        critMult: p.critMult,
        targetStatuses: enemy.statuses,
        targetBaseDef: enemy.def || 0,
        sourceName: hasCarve ? 'Carve' : 'Ground Break',
        targetName: enemy.name,
      });

      const hitAng = Math.atan2(dy, dx);
      const prevHp = enemy.hp;
      enemy.takeDamage(pipe.finalDamage, hitAng, 160, isCrit, p, spawner, particles, camera);

      if (!hasCarve && p.groundBreakStun > 0 && enemy.active) {
        enemy.statuses.apply(
          'stun',
          { duration: p.groundBreakStun, sourceName: 'Ground Break' },
          enemy,
          particles
        );
      }

      this.onLandHit(enemy, prevHp > 0 && enemy.hp <= 0, particles);
      hitCount++;
    }

    if (hitCount > 0) {
      p.addUltimateCharge(hitCount * 4.5);
      if (onHitStop) onHitStop(0.05);
    }
  }

  /**
   * Skill 3 — Rail Parry / Riposte
   */
  trySkill3(worldMouseX, worldMouseY, arg3, arg4, arg5, arg6) {
    const p = this.player;
    const skillDef = this.cfg.skills[2];
    const lvl = p.skills.railParry || p.skills.railSpike || 1;
    const stats = skillDef.getStats(lvl, p.ownedNodes);
    const stamCost = p.statuses.has('redline') ? 0 : stats.staminaCost;

    if (p.cooldowns.skill3 > 0 || p.stamina < stamCost) return false;
    p.stamina -= stamCost;
    p.cooldowns.skill3 = stats.cooldown;
    p.maxCooldowns.skill3 = stats.cooldown;

    const particles = (arg4 && typeof arg4.spawnParticle === 'function')
      ? arg4
      : (arg5 && typeof arg5.spawnParticle === 'function' ? arg5 : (arg3 && typeof arg3.spawnParticle === 'function' ? arg3 : null));
    const camera = (arg5 && typeof arg5.shake === 'function')
      ? arg5
      : (arg6 && typeof arg6.shake === 'function' ? arg6 : null);

    const baseAngle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(baseAngle);
    p.facingX = Math.cos(baseAngle) >= 0 ? 1 : -1;
    p.attackAngle = baseAngle;

    // Enter primed parry stance for duration
    p.parryTimer = stats.parryDuration;
    p.statuses.apply('parrying', { duration: stats.parryDuration, sourceName: 'Rail Parry' }, p, particles);

    sound.playReloadStart();
    if (camera && typeof camera.shake === 'function') camera.shake(2, 0.06);
    if (particles && typeof particles.spawnFloatingText === 'function') {
      particles.spawnFloatingText(p.x, p.y - 18, 'PARRY!', PALETTE.signal);
    }
    return true;
  }

  triggerRiposte(sourceEntity, sourceX, sourceY, spawner, particles, camera) {
    const p = this.player;
    const skillDef = this.cfg.skills[2];
    const lvl = p.skills.railParry || p.skills.railSpike || 1;
    const stats = skillDef.getStats(lvl, p.ownedNodes);

    // 1. Audio & Camera: Crisp metallic deflection CLANG!
    if (sound && typeof sound.playShieldBlock === 'function') {
      sound.playShieldBlock();
    } else if (sound && typeof sound.playHit === 'function') {
      sound.playHit(true);
    }
    if (camera && typeof camera.shake === 'function') camera.shake(6, 0.16);
    if (particles && typeof particles.triggerHitStop === 'function') {
      particles.triggerHitStop(0.08);
    }

    // 2. Momentum +2
    this.addMomentum(2, particles);

    // 3. Counter slash angle towards source
    const ang = (sourceX !== undefined && sourceY !== undefined)
      ? Math.atan2(sourceY - p.y, sourceX - p.x)
      : (p.attackAngle || 0);

    p.facingDir = angleTo4Facing(ang);
    p.facingX = Math.cos(ang) >= 0 ? 1 : -1;

    // Visual: Sweeping high-velocity Crescent Blade Slash with glowing core & spark burst
    if (particles && typeof particles.spawnCrescentSlash === 'function') {
      particles.spawnCrescentSlash(p.x, p.y, ang, 86, Math.PI * 0.95, PALETTE.signal, 0.36);
      particles.spawnCrescentSlash(p.x, p.y, ang, 58, Math.PI * 0.75, PALETTE.bone, 0.24);
    }

    const len = 52;
    const perp = ang + Math.PI * 0.5;
    const sx1 = p.x - Math.cos(perp) * len;
    const sy1 = p.y - Math.sin(perp) * len;
    const sx2 = p.x + Math.cos(perp) * len;
    const sy2 = p.y + Math.sin(perp) * len;

    if (particles && typeof particles.spawnSlash === 'function') {
      particles.spawnSlash(sx1, sy1, sx2, sy2, PALETTE.signal, 0.28, 'heavySlash');
    }

    // 4. Apply 3-second Speed & ATK Buff (Riposte Surge: +35% ATK Spd, +30% ATK, +25% Move Spd)
    p.statuses.apply(
      'riposteSurge',
      { duration: 3.0, sourceName: 'Crescent Parry' },
      p,
      particles
    );

    // 5. Hit targets in frontal 140px crescent arc for 350% ATK (guaranteed Crit)
    const targets = (spawner && typeof spawner.queryRadius === 'function')
      ? spawner.queryRadius(p.x, p.y, 140)
      : (sourceEntity ? [sourceEntity] : []);

    for (let i = 0; i < targets.length; i++) {
      const e = targets[i];
      if (!e.active || e.hp <= 0) continue;
      const targetAng = Math.atan2(e.y - p.y, e.x - p.x);
      let diff = targetAng - ang;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) <= Math.PI * 0.72 || e === sourceEntity) {
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * stats.damageMult,
          atkBuffPct: p.statuses.getAtkBonusPct(),
          isCrit: true,
          critMult: p.critMult || 1.5,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Crescent Riposte',
          targetName: e.name,
        });
        e.takeDamage(pipe.finalDamage, targetAng, 240, true, p, spawner, particles, camera);

        // Directional kinetic dust kickback from the crescent shockwave
        if (particles && typeof particles.spawnDustPuff === 'function') {
          particles.spawnDustPuff(
            e.x,
            e.y + 4,
            2,
            Math.cos(targetAng) * 24,
            Math.sin(targetAng) * 24
          );
        }

        if (stats.hasCounterShockwave && e.active) {
          e.statuses.apply('pinned', { duration: 1.5, sourceName: 'Rebar Riposte' }, e, particles);
        }
      }
    }

    if (particles && typeof particles.spawnFloatingText === 'function') {
      particles.spawnFloatingText(p.x, p.y - 28, 'CRESCENT SLASH! +SPD +ATK (3s)', PALETTE.signal);
    }
    sound.playSlash(true);
  }

  /**
   * Ultimate — Seven Cuts (or Nine Cuts on Flenser, or Hold the Line 6s stand on Girder)
   */
  tryUltimate(worldMouseX, worldMouseY, spawner, particles, camera) {
    const p = this.player;
    const reqCharge = p.hasNode('nineCuts') ? 85 : 100;
    if (p.ultimateCharge < reqCharge || p.ultimateActive) return false;

    p.ultimateCharge = 0;

    // Girder Master node: Hold the Line -> 6s Dug In stand instead of time-stop slash
    if (p.hasNode('holdTheLine')) {
      this.holdTheLineTimer = 6.0;
      p.statuses.apply('dugIn', { duration: 6.0, sourceName: 'Hold the Line' }, p, particles);
      sound.playSkillGroundBreak();
      if (camera && typeof camera.shake === 'function') camera.shake(5, 0.2);
      if (particles && typeof particles.spawnGroundBreakEffect === 'function') {
        particles.spawnGroundBreakEffect(p.x, p.y, 140);
      }
      return true;
    }

    // Standard Seven Cuts (or Nine Cuts with Flenser node)
    const totalCuts = p.hasNode('nineCuts') ? 9 : 7;
    p.ultimateTotalCuts = totalCuts;
    p.ultimateActive = true;
    p.ultimatePhaseTimer = 0;
    p.ultimateCutIndex = 0;
    p.ultimateInvertFrames = 0;
    p.ultimateOriginX = p.x;
    p.ultimateOriginY = p.y;
    p.ultimateReleased = false;
    p.statuses.apply('untouchable', { duration: 1.6, sourceName: 'Seven Cuts' }, p, null);

    const targets = (spawner && typeof spawner.queryRadius === 'function')
      ? spawner.queryRadius(p.x, p.y, 300).filter((e) => e.active && e.hp > 0)
      : [];
    p.ultimateTargetPool = targets;
    p.ultimateTotalDamage = Math.max(12, p.baseAtkForPipeline * 5.0);

    sound.playUltimateStart();
    if (camera && typeof camera.shake === 'function') camera.shake(4, 0.14);
    return true;
  }

  drawClassExtras(ctx, camera) {
    const p = this.player;
    const s = camera.worldToScreen(p.x, p.y);
    const sx = Math.round(s.x);
    const sy = Math.round(s.y);

    // Draw Brace frontal shield arc when guarding
    if (this.isGuarding) {
      const dirX = p.facingX >= 0 ? 1 : -1;
      drawPixelLine(ctx, sx + dirX * 12, sy - 10, sx + dirX * 14, sy + 8, PALETTE.signal, 2);
    }

    // Draw Rail Parry primed stance
    if (p.parryTimer > 0) {
      const dirX = p.facingX >= 0 ? 1 : -1;
      drawPixelLine(ctx, sx + dirX * 10, sy - 14, sx + dirX * 10, sy + 14, PALETTE.signal, 3);
      drawPixelLine(ctx, sx + dirX * 6, sy - 8, sx + dirX * 14, sy + 8, PALETTE.brass, 2);
    }

    // Draw Hold the Line Dug In 120px / 300px ring
    if (this.holdTheLineTimer > 0) {
      drawBresenhamCircle(ctx, sx, sy, 48, PALETTE.signal, 0.55);
    }
  }

  getHudMechanicState() {
    const p = this.player;
    const currentStacks = p && p.statuses ? p.statuses.getStacks('momentum') : this.momentumStacks;
    return {
      type: 'momentum',
      stacks: currentStacks || this.momentumStacks || 0,
      maxStacks: this.getMaxMomentum ? this.getMaxMomentum() : 5,
      guarding: !!this.isGuarding,
    };
  }
}

export default MeleeBehavior;
