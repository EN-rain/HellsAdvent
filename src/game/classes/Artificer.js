/**
 * GRAVEL SKY — Artificer / Summoner Class Behavior Module (Vespera Locke)
 * Implements Autonomous Orbiting Arc-Drones, Chain-Lightning Whip, Deployable Tesla Pylons
 * with high-voltage laser tether fences, Seeker Micro-Drones, and Phase Blink + EMP Holo-Decoy.
 */

import { PALETTE } from '../../data/config.js';
import { CLASSES } from '../../data/classes.js';
import { computeDamagePipeline } from '../Status.js';
import { angleTo4Facing, drawBresenhamCircle, drawPixelLine } from '../PixelArt.js';
import { sound } from '../Audio.js';

export class ArtificerBehavior {
  constructor(player) {
    this.player = player;
    this.cfg = CLASSES.vespera;

    // Autonomous Orbiting Arc-Drones
    this.dronePhase = 0;
    this.droneFireTimer = 0;
    this.basicAttackCounter = 0;

    // Deployed Tesla Pylons: [{ x, y, life, maxLife, zapTimer, tetherTimer, radius, damageMult }]
    this.pylons = [];

    // Homing Seeker Micro-Drones: [{ x, y, vx, vy, target, damageMult, life }]
    this.seekers = [];

    // Active Holo-Capacitor Decoys: [{ x, y, life, maxLife, radius, damageMult, stunOnBlast }]
    this.decoys = [];

    // Transient Chain-Lightning & Laser Beams for crisp pixel rendering:
    // [{ x1, y1, x2, y2, color, life, maxLife, jagged }]
    this.arcBeams = [];
  }

  getMaxDrones() {
    return this.cfg.mechanic.baseDrones + (this.player.hasNode('extraChassis') ? 1 : 0);
  }

  getMaxPylons() {
    return this.cfg.mechanic.maxPylonsBase + (this.player.hasNode('extraChassis') ? 1 : 0);
  }

  getAuxiliaryBonusPct() {
    const lvl = this.player.passives.auxiliaryCore || 0;
    return lvl * 0.10;
  }

  getAuxiliaryDefBonus() {
    const lvl = this.player.passives.auxiliaryCore || 0;
    return lvl * 2;
  }

  getDronePositions() {
    const p = this.player;
    const count = this.getMaxDrones();
    const orbitRad = 26;
    const list = [];
    for (let i = 0; i < count; i++) {
      const a = this.dronePhase + (i / count) * Math.PI * 2;
      list.push({
        x: Math.round(p.x + Math.cos(a) * orbitRad),
        y: Math.round(p.y - 6 + Math.sin(a) * (orbitRad * 0.75)),
        angle: a,
        index: i,
      });
    }
    return list;
  }

  spawnArcBeam(x1, y1, x2, y2, color = PALETTE.volt, duration = 0.16, jagged = true) {
    if (this.arcBeams.length >= 32) this.arcBeams.shift();
    this.arcBeams.push({
      x1: Math.round(x1),
      y1: Math.round(y1),
      x2: Math.round(x2),
      y2: Math.round(y2),
      color,
      life: duration,
      maxLife: duration,
      jagged,
      seed: Math.random() * 100,
    });
  }

  _onDroneOrPylonHit(killed) {
    const p = this.player;
    if (p.hasNode('repairProtocol')) {
      p.stamina = Math.min(p.maxStamina, p.stamina + 1.5);
      if (killed) {
        p.hp = Math.min(p.maxHp, p.hp + Math.max(1, Math.round(p.maxHp * 0.02)));
      }
    }
  }

  /**
   * [V] or Right-Click: Command Tactical Drone Recall / Focus Pulse
   */
  tryDronePulse(particles = null, spawner = null, camera = null) {
    const p = this.player;
    if (p.dead || p.statuses.cannotAct()) return false;
    if (p.stamina < 8) return false;
    p.stamina -= 8;

    const drones = this.getDronePositions();
    sound.playMagnetPull();
    if (particles) {
      particles.spawnFloatingText(p.x, p.y - 22, 'DRONE SYNC!', PALETTE.volt);
    }

    const candidates = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(p.x, p.y, 260)
      : [];
    const alive = candidates.filter((e) => e.active && e.hp > 0);
    if (alive.length > 0) {
      for (let i = 0; i < drones.length; i++) {
        const d = drones[i];
        const target = alive[i % alive.length];
        this.spawnArcBeam(d.x, d.y, target.x, target.y, PALETTE.volt, 0.18, true);
        const pipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * 0.65 * (1 + this.getAuxiliaryBonusPct()),
          atkBuffPct: p.statuses.getAtkBonusPct(),
          targetStatuses: target.statuses,
          targetBaseDef: target.def || 0,
          sourceName: 'Arc-Drone Sync',
          targetName: target.name,
        });
        const prevHp = target.hp;
        target.takeDamage(pipe.finalDamage, 0, 25, false, p, spawner, particles, camera);
        this._onDroneOrPylonHit(prevHp > 0 && target.hp <= 0);
      }
    }
    return true;
  }

  update(dt, input, spawner, projectiles, particles, camera, onHitStop) {
    const p = this.player;
    const isOverclock = p.hasNode('overclockedSwarm');
    const isOvercharged = p.statuses.has('arcOvercharge');
    this.dronePhase += dt * (isOvercharged ? 4.8 : 2.8);

    // 1. Update transient lightning beams
    for (let i = this.arcBeams.length - 1; i >= 0; i--) {
      this.arcBeams[i].life -= dt;
      if (this.arcBeams[i].life <= 0) {
        this.arcBeams.splice(i, 1);
      }
    }

    // 2. Autonomous Orbiting Arc-Drones auto-fire at nearby enemies
    if (!p.dead) {
      const fireInterval =
        (this.cfg.mechanic.droneFireInterval / (isOverclock ? 1.4 : 1.0)) /
        (isOvercharged ? 1.3 : 1.0);
      this.droneFireTimer += dt;
      if (this.droneFireTimer >= fireInterval) {
        this.droneFireTimer = 0;
        this._fireAutonomousDrones(spawner, particles, camera);
      }
    }

    // 3. Update Deployed Tesla Pylons & Laser Tether Grid
    this._updatePylons(dt, spawner, particles, camera);

    // 4. Update Homing Seeker Micro-Drones
    this._updateSeekers(dt, spawner, particles, camera);

    // 5. Update Holo-Capacitor Decoys
    this._updateDecoys(dt, spawner, particles, camera, onHitStop);
  }

  _fireAutonomousDrones(spawner, particles, camera) {
    const p = this.player;
    if (!spawner || typeof spawner.queryRadius !== 'function') return;
    const raw = spawner.queryRadius(p.x, p.y, this.cfg.mechanic.droneRange);
    const valid = raw.filter((e) => e.active && e.hp > 0);
    if (valid.length === 0) return;

    valid.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    const drones = this.getDronePositions();
    const auxBonus = this.getAuxiliaryBonusPct();

    for (let i = 0; i < drones.length; i++) {
      const d = drones[i];
      const target = valid[i % valid.length];
      if (!target || !target.active || target.hp <= 0) continue;

      this.spawnArcBeam(d.x, d.y, target.x, target.y, i % 2 === 0 ? PALETTE.volt : PALETTE.signal, 0.14, true);
      if (particles) {
        particles.spawnSparks(target.x, target.y, 2, PALETTE.volt);
      }

      const pipe = computeDamagePipeline({
        baseDamage: p.baseAtkForPipeline * this.cfg.mechanic.droneDamageMult * (1 + auxBonus),
        atkBuffPct: p.statuses.getAtkBonusPct(),
        isCrit: false,
        targetStatuses: target.statuses,
        targetBaseDef: target.def || 0,
        sourceName: 'Arc-Drone',
        targetName: target.name,
      });

      const prevHp = target.hp;
      const ang = Math.atan2(target.y - d.y, target.x - d.x);
      target.takeDamage(pipe.finalDamage, ang, 16, false, p, spawner, particles, camera);
      this._onDroneOrPylonHit(prevHp > 0 && target.hp <= 0);
      p.addUltimateCharge(0.9);
    }
  }

  _updatePylons(dt, spawner, particles, camera) {
    const p = this.player;
    const auxBonus = this.getAuxiliaryBonusPct();
    const hasTeslaGrid = p.hasNode('teslaGrid');
    const hasSiege = p.hasNode('siegePylons');

    for (let i = this.pylons.length - 1; i >= 0; i--) {
      const py = this.pylons[i];
      py.life -= dt;
      if (py.life <= 0) {
        this.pylons.splice(i, 1);
        continue;
      }

      // Periodic Pylon Zap
      py.zapTimer -= dt;
      if (py.zapTimer <= 0) {
        py.zapTimer = 0.65;
        const enemies = spawner && typeof spawner.queryRadius === 'function'
          ? spawner.queryRadius(py.x, py.y, py.radius)
          : [];
        const valid = enemies.filter((e) => e.active && e.hp > 0);
        if (valid.length > 0) {
          const hitTargets = valid.slice(0, hasSiege ? 3 : 1);
          for (let t = 0; t < hitTargets.length; t++) {
            const e = hitTargets[t];
            this.spawnArcBeam(py.x, py.y - 10, e.x, e.y, PALETTE.volt, 0.16, true);
            const pipe = computeDamagePipeline({
              baseDamage: p.baseAtkForPipeline * py.damageMult * (1 + auxBonus),
              atkBuffPct: p.statuses.getAtkBonusPct(),
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Tesla Pylon',
              targetName: e.name,
            });
            const prevHp = e.hp;
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - py.y, e.x - py.x), 24, false, p, spawner, particles, camera);
            this._onDroneOrPylonHit(prevHp > 0 && e.hp <= 0);
          }
          sound.playHit(false);
        }
      }

      // High-Voltage Tether Beam between Pylon and Vespera (if within 260px) or next Pylon
      py.tetherTimer -= dt;
      if (py.tetherTimer <= 0) {
        py.tetherTimer = 0.40;
        const anchors = [{ x: p.x, y: p.y }];
        if (i > 0) anchors.push({ x: this.pylons[i - 1].x, y: this.pylons[i - 1].y });

        for (const anc of anchors) {
          const dist = Math.hypot(anc.x - py.x, anc.y - py.y);
          if (dist > 300 || dist < 16) continue;
          const midX = (py.x + anc.x) * 0.5;
          const midY = (py.y + anc.y) * 0.5;
          const segLenSq = (anc.x - py.x) * (anc.x - py.x) + (anc.y - py.y) * (anc.y - py.y);
          const near = spawner && typeof spawner.queryRadius === 'function'
            ? spawner.queryRadius(midX, midY, dist * 0.55 + 24)
            : [];

          for (let j = 0; j < near.length; j++) {
            const e = near[j];
            if (!e.active || e.hp <= 0) continue;
            let t = ((e.x - py.x) * (anc.x - py.x) + (e.y - py.y) * (anc.y - py.y)) / segLenSq;
            t = Math.max(0, Math.min(1, t));
            const px = py.x + t * (anc.x - py.x);
            const pyProj = py.y + t * (anc.y - py.y);
            if (Math.hypot(e.x - px, e.y - pyProj) <= e.radius + 10) {
              const tetherMult = 0.50 * (hasTeslaGrid ? 1.6 : 1.0) * (1 + auxBonus);
              const pipe = computeDamagePipeline({
                baseDamage: p.baseAtkForPipeline * tetherMult,
                atkBuffPct: p.statuses.getAtkBonusPct(),
                targetStatuses: e.statuses,
                targetBaseDef: e.def || 0,
                sourceName: 'Tesla Tether',
                targetName: e.name,
              });
              e.takeDamage(pipe.finalDamage, 0, 15, false, p, spawner, particles, camera);
              if (hasTeslaGrid && e.active) {
                e.statuses.apply('slow', { duration: 1.5, value: 0.45, sourceName: 'Tesla Grid' }, e, particles);
              }
            }
          }
        }
      }
    }
  }

  _updateSeekers(dt, spawner, particles, camera) {
    const p = this.player;
    const auxBonus = this.getAuxiliaryBonusPct();

    for (let i = this.seekers.length - 1; i >= 0; i--) {
      const sk = this.seekers[i];
      sk.life -= dt;
      if (sk.life <= 0) {
        this.seekers.splice(i, 1);
        continue;
      }

      // Find or re-acquire nearest active enemy
      if (!sk.target || !sk.target.active || sk.target.hp <= 0) {
        const near = spawner && typeof spawner.queryRadius === 'function'
          ? spawner.queryRadius(sk.x, sk.y, 340)
          : [];
        let best = null;
        let bestDist = 9999;
        for (let j = 0; j < near.length; j++) {
          const e = near[j];
          if (!e.active || e.hp <= 0) continue;
          const d = Math.hypot(e.x - sk.x, e.y - sk.y);
          if (d < bestDist) {
            bestDist = d;
            best = e;
          }
        }
        sk.target = best;
      }

      if (sk.target && sk.target.active) {
        const ang = Math.atan2(sk.target.y - sk.y, sk.target.x - sk.x);
        const speed = 340;
        sk.vx = Math.cos(ang) * speed;
        sk.vy = Math.sin(ang) * speed;
      }

      sk.x += sk.vx * dt;
      sk.y += sk.vy * dt;

      // Check collision with any enemy
      const hits = spawner && typeof spawner.queryRadius === 'function'
        ? spawner.queryRadius(sk.x, sk.y, 28)
        : [];
      let detonated = false;
      for (let j = 0; j < hits.length; j++) {
        const e = hits[j];
        if (!e.active || e.hp <= 0) continue;
        if (Math.hypot(e.x - sk.x, e.y - sk.y) <= (e.radius || 12) + 10) {
          const isCrit = Math.random() < p.critChance;
          const pipe = computeDamagePipeline({
            baseDamage: p.baseAtkForPipeline * sk.damageMult * (1 + auxBonus),
            atkBuffPct: p.statuses.getAtkBonusPct(),
            isCrit,
            critMult: p.critMult,
            targetStatuses: e.statuses,
            targetBaseDef: e.def || 0,
            sourceName: 'Seeker Drone',
            targetName: e.name,
          });
          e.takeDamage(pipe.finalDamage, Math.atan2(sk.vy, sk.vx), 65, isCrit, p, spawner, particles, camera);
          if (particles) {
            particles.spawnShockwave(sk.x, sk.y, 42, PALETTE.volt, 0.16);
            particles.spawnSparks(sk.x, sk.y, 5, PALETTE.volt);
          }
          sound.playHit(false);
          detonated = true;
          break;
        }
      }

      if (detonated) {
        this.seekers.splice(i, 1);
      }
    }
  }

  _updateDecoys(dt, spawner, particles, camera, onHitStop) {
    const p = this.player;
    for (let i = this.decoys.length - 1; i >= 0; i--) {
      const dec = this.decoys[i];
      dec.life -= dt;

      // Continuously taunt nearby enemies toward the Holo-Decoy
      const near = spawner && typeof spawner.queryRadius === 'function'
        ? spawner.queryRadius(dec.x, dec.y, 180)
        : [];
      for (let j = 0; j < near.length; j++) {
        const e = near[j];
        if (!e.active || e.hp <= 0 || e.tier === 'boss') continue;
        e.statuses.apply(
          'drawnIn',
          { duration: 0.5, tauntTarget: { x: dec.x, y: dec.y }, sourceName: 'Holo-Decoy' },
          e,
          null
        );
      }

      if (dec.life <= 0) {
        // Detonate EMP blast!
        sound.playSkillGroundBreak();
        if (camera && typeof camera.shake === 'function') camera.shake(5, 0.16);
        if (particles) {
          particles.spawnShockwave(dec.x, dec.y, dec.radius, PALETTE.volt, 0.24);
          particles.spawnShockwave(dec.x, dec.y, Math.round(dec.radius * 0.65), PALETTE.signal, 0.18);
          particles.spawnBurst(dec.x, dec.y, 12, PALETTE.volt, 40, 110, 2, 0.28);
        }

        const targets = spawner && typeof spawner.queryRadius === 'function'
          ? spawner.queryRadius(dec.x, dec.y, dec.radius + 24)
          : [];
        for (let j = 0; j < targets.length; j++) {
          const e = targets[j];
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - dec.x, e.y - dec.y) <= dec.radius + e.radius) {
            const pipe = computeDamagePipeline({
              baseDamage: p.baseAtkForPipeline * dec.damageMult * (1 + this.getAuxiliaryBonusPct()),
              atkBuffPct: p.statuses.getAtkBonusPct(),
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Holo-Decoy EMP',
              targetName: e.name,
            });
            e.takeDamage(
              pipe.finalDamage,
              Math.atan2(e.y - dec.y, e.x - dec.x),
              125,
              false,
              p,
              spawner,
              particles,
              camera
            );
            if (e.active) {
              e.statuses.apply('slow', { duration: 2.5, value: 0.50, sourceName: 'Holo-Decoy' }, e, particles);
              if (dec.stunOnBlast) {
                e.statuses.apply('stun', { duration: 1.2, sourceName: 'Static Field' }, e, particles);
              }
            }
          }
        }
        if (onHitStop) onHitStop(0.04);
        this.decoys.splice(i, 1);
      }
    }
  }

  /**
   * [V] or Special key: Overcharge Recall Pulse (discharges EMP radial pulse around Vespera and all Pylons)
   */
  tryRecallPulse(arg1 = null, arg2 = null, arg3 = null) {
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
    if (p.dead || p.statuses.cannotAct() || p.stamina < 15) return false;
    p.stamina -= 15;
    sound.playMagnetPull();
    if (camera && typeof camera.shake === 'function') camera.shake(3, 0.12);

    const emitters = [{ x: p.x, y: p.y }, ...this.pylons.map((py) => ({ x: py.x, y: py.y }))];
    for (const em of emitters) {
      if (particles) {
        if (typeof particles.spawnShockwave === 'function') particles.spawnShockwave(em.x, em.y, 80, PALETTE.volt, 0.18);
        if (typeof particles.spawnSparks === 'function') particles.spawnSparks(em.x, em.y, 4, PALETTE.volt);
      }
      if (spawner && typeof spawner.queryRadius === 'function') {
        const near = spawner.queryRadius(em.x, em.y, 80);
        for (let i = 0; i < near.length; i++) {
          const e = near[i];
          if (!e.active || e.hp <= 0) continue;
          e.takeDamage(Math.round(p.atk * 0.75), Math.atan2(e.y - em.y, e.x - em.x), 75, false, p, spawner, particles, camera);
          if (e.active) {
            e.statuses.apply('slow', { duration: 2.0, value: 0.35, sourceName: 'Recall Pulse' }, e, particles);
          }
        }
      }
    }
    if (particles && typeof particles.spawnFloatingText === 'function') {
      particles.spawnFloatingText(p.x, p.y - 20, 'RECALL PULSE', PALETTE.volt);
    }
    return true;
  }

  /**
   * Basic Attack: High-Voltage Chain-Lightning Whip + Synchronized Drone Laser Focus
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

    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.attackAngle = angle;
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;
    p.comboStep = (p.comboStep % 3) + 1;

    this.basicAttackCounter += 1;
    const isFourthSurge = p.hasNode('capacitorSurge') && this.basicAttackCounter % 4 === 0;
    const range = this.cfg.basicAttack.range;

    // Find primary target nearest to cursor ray within 340px
    const candidates = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(p.x, p.y, range + 24)
      : [];
    let primary = null;
    let bestScore = 999999;

    for (let i = 0; i < candidates.length; i++) {
      const e = candidates[i];
      if (!e.active || e.hp <= 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > range + e.radius) continue;
      let diff = Math.atan2(dy, dx) - angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) <= 0.65 || dist <= 48) {
        const score = dist + Math.abs(diff) * 140;
        if (score < bestScore) {
          bestScore = score;
          primary = e;
        }
      }
    }

    sound.playMagnetThrow(true);

    if (!primary) {
      // Unleash crackling lightning arc to max range point along cursor
      const ex = p.x + Math.cos(angle) * (range * 0.75);
      const ey = p.y + Math.sin(angle) * (range * 0.75);
      this.spawnArcBeam(p.x, p.y - 6, ex, ey, PALETTE.volt, 0.14, true);
      if (particles) {
        particles.spawnSparks(ex, ey, 3, PALETTE.volt);
      }
      return true;
    }

    // Chain-Lightning Jump Loop!
    const maxBounces = this.cfg.basicAttack.baseBounces + (p.hasNode('highVoltage') ? 2 : 0);
    const hasSuperconductor = p.hasNode('superconductor');
    const falloff = hasSuperconductor ? 1.0 : this.cfg.basicAttack.bounceFalloff;
    const critChance = p.critChance + (hasSuperconductor ? 0.15 : 0);
    const auxBonus = this.getAuxiliaryBonusPct();

    const hitSet = new Set();
    let curTarget = primary;
    let prevX = p.x;
    let prevY = p.y - 6;
    let bounceMult = 1.0;

    for (let b = 0; b <= maxBounces && curTarget; b++) {
      hitSet.add(curTarget);
      this.spawnArcBeam(
        prevX,
        prevY,
        curTarget.x,
        curTarget.y,
        b === 0 ? PALETTE.volt : PALETTE.signal,
        0.18,
        true
      );

      const isCrit = Math.random() < critChance;
      const pipe = computeDamagePipeline({
        baseDamage:
          p.baseAtkForPipeline *
          this.cfg.basicAttack.damageMult *
          bounceMult *
          (1 + auxBonus),
        atkBuffPct: p.statuses.getAtkBonusPct(),
        isCrit,
        critMult: p.critMult,
        targetStatuses: curTarget.statuses,
        targetBaseDef: curTarget.def || 0,
        sourceName: 'Chain Lightning',
        targetName: curTarget.name,
      });

      const prevHp = curTarget.hp;
      curTarget.takeDamage(
        pipe.finalDamage,
        Math.atan2(curTarget.y - prevY, curTarget.x - prevX),
        b === 0 ? 45 : 25,
        isCrit,
        p,
        spawner,
        particles,
        camera
      );
      this._onDroneOrPylonHit(prevHp > 0 && curTarget.hp <= 0);

      if (p.hasNode('highVoltage') && curTarget.active) {
        curTarget.statuses.apply(
          'exposed',
          { duration: 5.0, sourceName: 'High Voltage' },
          curTarget,
          particles
        );
      }

      prevX = curTarget.x;
      prevY = curTarget.y;
      bounceMult *= falloff;

      // Find next unhit enemy within 155px of curTarget
      const nearby = spawner.queryRadius(curTarget.x, curTarget.y, 155);
      let nextTarget = null;
      let minDist = 9999;
      for (let j = 0; j < nearby.length; j++) {
        const n = nearby[j];
        if (!n.active || n.hp <= 0 || hitSet.has(n)) continue;
        const d = Math.hypot(n.x - curTarget.x, n.y - curTarget.y);
        if (d < minDist) {
          minDist = d;
          nextTarget = n;
        }
      }
      curTarget = nextTarget;
    }

    // Command Orbiting Drones to fire synchronized focus-lasers at the primary target on every 2nd attack
    if (this.basicAttackCounter % 2 === 0 && primary.active && primary.hp > 0) {
      const drones = this.getDronePositions();
      for (let d = 0; d < drones.length; d++) {
        this.spawnArcBeam(drones[d].x, drones[d].y, primary.x, primary.y, PALETTE.signal, 0.12, false);
      }
    }

    // Capacitor Surge (Conduit Journeyman): every 4th basic attack triggers a 110px lightning nova on primary target
    if (isFourthSurge) {
      if (particles) {
        particles.spawnShockwave(primary.x, primary.y, 110, PALETTE.volt, 0.22);
        particles.spawnBurst(primary.x, primary.y, 8, PALETTE.volt, 35, 95, 2, 0.25);
      }
      const novaTargets = spawner.queryRadius(primary.x, primary.y, 110);
      for (let k = 0; k < novaTargets.length; k++) {
        const ne = novaTargets[k];
        if (!ne.active || ne.hp <= 0) continue;
        const nPipe = computeDamagePipeline({
          baseDamage: p.baseAtkForPipeline * 1.4 * (1 + auxBonus),
          atkBuffPct: p.statuses.getAtkBonusPct(),
          targetStatuses: ne.statuses,
          targetBaseDef: ne.def || 0,
          sourceName: 'Capacitor Surge',
          targetName: ne.name,
        });
        ne.takeDamage(nPipe.finalDamage, 0, 55, false, p, spawner, particles, camera);
      }
    }

    p.addUltimateCharge(3.8);
    if (onHitStop && isFourthSurge) onHitStop(0.04);
    return true;
  }

  /**
   * Skill 1 — Deploy Tesla Pylon at cursor
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
    const stats = skillDef.getStats(p.skills.deployPylon || 1, p.ownedNodes);

    if (p.cooldowns.skill1 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill1 = stats.cooldown;
    p.maxCooldowns.skill1 = stats.cooldown;

    const tx = p.clampCoord(worldMouseX);
    const ty = p.clampCoord(worldMouseY);

    const maxPylons = this.getMaxPylons();
    while (this.pylons.length >= maxPylons) {
      this.pylons.shift();
    }

    this.pylons.push({
      x: tx,
      y: ty,
      life: stats.duration,
      maxLife: stats.duration,
      zapTimer: 0.1,
      tetherTimer: 0.1,
      radius: stats.radius,
      damageMult: stats.damageMult,
    });

    sound.playReloadStart();
    if (particles) {
      particles.spawnShockwave(tx, ty, 64, PALETTE.volt, 0.20);
      particles.spawnSparks(tx, ty, 6, PALETTE.volt);
    }

    // Immediate arrival zap in 90px around deployed Pylon
    const near = spawner && typeof spawner.queryRadius === 'function'
      ? spawner.queryRadius(tx, ty, 90)
      : [];
    for (let i = 0; i < near.length; i++) {
      const e = near[i];
      if (!e.active || e.hp <= 0) continue;
      this.spawnArcBeam(tx, ty - 10, e.x, e.y, PALETTE.volt, 0.18, true);
      const pipe = computeDamagePipeline({
        baseDamage: p.baseAtkForPipeline * stats.damageMult * (1 + this.getAuxiliaryBonusPct()),
        atkBuffPct: p.statuses.getAtkBonusPct(),
        targetStatuses: e.statuses,
        targetBaseDef: e.def || 0,
        sourceName: 'Tesla Pylon Drop',
        targetName: e.name,
      });
      e.takeDamage(pipe.finalDamage, Math.atan2(e.y - ty, e.x - tx), 45, false, p, spawner, particles, camera);
    }

    if (onHitStop && near.length > 0) onHitStop(0.03);
    return true;
  }

  /**
   * Skill 2 — Seeker Swarm: EMP discharge around Vespera & Pylons + launch 4-6 homing Micro-Drones
   */
  trySkill2(worldMouseX, worldMouseY, arg3, arg4, arg5, arg6, arg7) {
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
    const skillDef = this.cfg.skills[1];
    const stats = skillDef.getStats(p.skills.seekerSwarm || 1, p.ownedNodes);

    if (p.cooldowns.skill2 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill2 = stats.cooldown;
    p.maxCooldowns.skill2 = stats.cooldown;

    const executePulse = () => {
      const emitters = [{ x: p.x, y: p.y }, ...this.pylons.map((py) => ({ x: py.x, y: py.y }))];
      const hitEnemies = new Set();

      for (const em of emitters) {
        if (particles) {
          particles.spawnShockwave(em.x, em.y, 130, PALETTE.volt, 0.24);
          particles.spawnShockwave(em.x, em.y, 90, PALETTE.signal, 0.18);
        }
        const near = spawner && typeof spawner.queryRadius === 'function'
          ? spawner.queryRadius(em.x, em.y, 130)
          : [];
        for (let i = 0; i < near.length; i++) {
          const e = near[i];
          if (!e.active || e.hp <= 0 || hitEnemies.has(e)) continue;
          hitEnemies.add(e);
          const pipe = computeDamagePipeline({
            baseDamage: p.baseAtkForPipeline * stats.damageMult * (1 + this.getAuxiliaryBonusPct()),
            atkBuffPct: p.statuses.getAtkBonusPct(),
            targetStatuses: e.statuses,
            targetBaseDef: e.def || 0,
            sourceName: 'Seeker Swarm EMP',
            targetName: e.name,
          });
          e.takeDamage(pipe.finalDamage, Math.atan2(e.y - em.y, e.x - em.x), 95, false, p, spawner, particles, camera);
          if (e.active) {
            e.statuses.apply('stun', { duration: 1.0, sourceName: 'Seeker Swarm' }, e, particles);
          }
        }
      }

      if (hitEnemies.size > 0) {
        p.addUltimateCharge(hitEnemies.size * 3.5);
      }
    };

    executePulse();

    // Arc Cascade (Stormcaller Master): pulses a second time and grants Arc Overcharge
    if (p.hasNode('arcNova')) {
      p.statuses.apply('arcOvercharge', { duration: 4.0, sourceName: 'Arc Cascade' }, p, particles);
      setTimeout(() => {
        if (!p.dead) executePulse();
      }, 220);
    }

    // Launch homing Kamikaze Seeker Micro-Drones
    const seekerCount = stats.seekers;
    for (let s = 0; s < seekerCount; s++) {
      const a = (s / seekerCount) * Math.PI * 2;
      this.seekers.push({
        x: p.x + Math.cos(a) * 18,
        y: p.y + Math.sin(a) * 18,
        vx: Math.cos(a) * 240,
        vy: Math.sin(a) * 240,
        target: null,
        damageMult: stats.damageMult * 0.75,
        life: 3.5,
      });
    }

    sound.playMagnetPull();
    if (camera && typeof camera.shake === 'function') camera.shake(5, 0.16);
    if (onHitStop) onHitStop(0.04);
    return true;
  }

  /**
   * Skill 3 — Phase Blink: Teleport 170px toward cursor + leave taunting EMP Holo-Decoy behind
   */
  trySkill3(worldMouseX, worldMouseY, arg3, arg4, arg5, arg6, arg7) {
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
    const skillDef = this.cfg.skills[2];
    const stats = skillDef.getStats(p.skills.phaseBlink || 1, p.ownedNodes);

    if (p.cooldowns.skill3 > 0 || p.stamina < stats.staminaCost) return false;
    p.stamina -= stats.staminaCost;
    p.cooldowns.skill3 = stats.cooldown;
    p.maxCooldowns.skill3 = stats.cooldown;

    const oldX = p.x;
    const oldY = p.y;
    const angle = Math.atan2(worldMouseY - p.y, worldMouseX - p.x);
    p.facingDir = angleTo4Facing(angle);
    p.facingX = Math.cos(angle) >= 0 ? 1 : -1;

    // Leave Holo-Decoy at origin
    this.decoys.push({
      x: oldX,
      y: oldY,
      life: 2.2,
      maxLife: 2.2,
      radius: 120,
      damageMult: stats.damageMult,
      stunOnBlast: p.hasNode('staticField'),
    });

    // Teleport Vespera up to 170px toward cursor
    const dist = Math.min(stats.blinkDistance, Math.hypot(worldMouseX - oldX, worldMouseY - oldY));
    p.x = p.clampCoord(oldX + Math.cos(angle) * Math.max(80, dist));
    p.y = p.clampCoord(oldY + Math.sin(angle) * Math.max(80, dist));
    p.invulnTimer = Math.max(p.invulnTimer, 0.45);

    p.statuses.apply('untouchable', { duration: 0.45, sourceName: 'Phase Blink' }, p, null);
    p.statuses.apply('arcOvercharge', { duration: 3.5, sourceName: 'Phase Blink' }, p, particles);

    this.spawnArcBeam(oldX, oldY - 6, p.x, p.y - 6, PALETTE.volt, 0.28, true);
    this.spawnArcBeam(oldX, oldY - 6, p.x, p.y - 6, PALETTE.signal, 0.20, false);

    sound.playSkillLunge();
    if (camera && typeof camera.shake === 'function') camera.shake(3, 0.10);
    if (particles) {
      particles.spawnShockwave(oldX, oldY, 48, PALETTE.signal, 0.18);
      particles.spawnShockwave(p.x, p.y, 56, PALETTE.volt, 0.20);
      particles.spawnFloatingText(p.x, p.y - 22, 'PHASE BLINK!', PALETTE.volt);
    }

    return true;
  }

  getHudMechanicState() {
    return {
      type: 'droneSwarm',
      drones: this.getMaxDrones(),
      maxDrones: this.getMaxDrones(),
      pylons: this.pylons.length,
      maxPylons: this.getMaxPylons(),
      overcharged: this.player.statuses.has('arcOvercharge'),
    };
  }

  drawClassExtras(ctx, camera) {
    const p = this.player;
    const camX = camera.renderX;
    const camY = camera.renderY;

    // 1. Draw Deployed Tesla Pylons & Laser Tether Grid
    for (let i = 0; i < this.pylons.length; i++) {
      const py = this.pylons[i];
      const sx = Math.round(py.x - camX);
      const sy = Math.round(py.y - camY);

      // Pylon shock field perimeter
      drawBresenhamCircle(ctx, sx, sy, py.radius, PALETTE.volt, 0.35);

      // Tether beam to Vespera (if within 300px)
      const distToPlayer = Math.hypot(p.x - py.x, p.y - py.y);
      if (distToPlayer <= 300 && !p.dead) {
        const px = Math.round(p.x - camX);
        const pyScreen = Math.round(p.y - camY - 6);
        drawPixelLine(ctx, sx, sy - 10, px, pyScreen, PALETTE.signal, 1);
      }
      // Tether beam to previous Pylon
      if (i > 0) {
        const prev = this.pylons[i - 1];
        if (Math.hypot(prev.x - py.x, prev.y - py.y) <= 300) {
          drawPixelLine(
            ctx,
            sx,
            sy - 10,
            Math.round(prev.x - camX),
            Math.round(prev.y - camY - 10),
            PALETTE.volt,
            2
          );
        }
      }

      // Draw Pylon Spire Sprite (tripod base + copper coil + pulsing volt orb)
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - 5, sy - 14, 10, 16);
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(sx - 4, sy - 2, 8, 4);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - 2, sy - 10, 4, 8);
      ctx.fillStyle = Math.floor(p.animClock * 10) % 2 === 0 ? PALETTE.volt : PALETTE.signal;
      ctx.fillRect(sx - 3, sy - 14, 6, 4);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(sx - 1, sy - 13, 2, 2);
    }

    // 2. Draw Active Holo-Capacitor Decoys
    for (let i = 0; i < this.decoys.length; i++) {
      const dec = this.decoys[i];
      const sx = Math.round(dec.x - camX);
      const sy = Math.round(dec.y - camY);
      const pulse = Math.floor(p.animClock * 16) % 2 === 0;

      drawBresenhamCircle(ctx, sx, sy, dec.radius, PALETTE.signal, 0.45);
      drawBresenhamCircle(ctx, sx, sy, Math.round(dec.radius * (1 - dec.life / dec.maxLife)), PALETTE.volt, 0.85);

      // Flickering Hologram Silhouette of Vespera
      ctx.fillStyle = pulse ? PALETTE.volt : PALETTE.signal;
      ctx.fillRect(sx - 4, sy - 14, 8, 16);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(sx - 2, sy - 12, 4, 4);
    }

    // 3. Draw Homing Seeker Micro-Drones
    for (let i = 0; i < this.seekers.length; i++) {
      const sk = this.seekers[i];
      const sx = Math.round(sk.x - camX);
      const sy = Math.round(sk.y - camY);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
      ctx.fillStyle = PALETTE.volt;
      ctx.fillRect(sx - 2, sy - 2, 4, 4);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }

    // 4. Draw Transient Jagged Chain-Lightning & Laser Beams
    for (let i = 0; i < this.arcBeams.length; i++) {
      const b = this.arcBeams[i];
      const x1 = Math.round(b.x1 - camX);
      const y1 = Math.round(b.y1 - camY);
      const x2 = Math.round(b.x2 - camX);
      const y2 = Math.round(b.y2 - camY);

      if (!b.jagged) {
        drawPixelLine(ctx, x1, y1, x2, y2, b.color, 1);
      } else {
        const segs = 4;
        let px = x1;
        let py = y1;
        for (let s = 1; s <= segs; s++) {
          const t = s / segs;
          const jit = s < segs ? Math.sin(b.seed + s * 4.1 + p.animClock * 40) * 6 : 0;
          const nx = Math.round(x1 + (x2 - x1) * t + jit);
          const ny = Math.round(y1 + (y2 - y1) * t - jit);
          drawPixelLine(ctx, px, py, nx, ny, b.color, 2);
          drawPixelLine(ctx, px, py, nx, ny, PALETTE.bone, 1);
          px = nx;
          py = ny;
        }
      }
    }

    // 5. Draw Autonomous Orbiting Arc-Drones around Vespera
    if (!p.dead) {
      const drones = this.getDronePositions();
      for (let i = 0; i < drones.length; i++) {
        const d = drones[i];
        const sx = Math.round(d.x - camX);
        const sy = Math.round(d.y - camY);

        // Ground shadow
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 2, sy + 10, 5, 2);

        // Hovering Arc-Drone chassis (diamond wing + brass core + volt eye)
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 4, sy - 4, 9, 7);
        ctx.fillStyle = PALETTE.slagLight;
        ctx.fillRect(sx - 3, sy - 3, 7, 5);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(sx - 1, sy - 4, 3, 2);
        ctx.fillStyle = i % 2 === 0 ? PALETTE.volt : PALETTE.signal;
        ctx.fillRect(sx - 1, sy - 2, 3, 3);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(sx, sy - 1, 1, 1);
      }
    }
  }
}

export default ArtificerBehavior;
