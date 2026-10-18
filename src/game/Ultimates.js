/**
 * GRAVEL SKY — Generic Ultimate Sequencer & Charge Meter Engine
 * - Runs any ultimate from /src/data/ultimates.js as a list of timed steps ({ t, action, params }).
 * - Enforces all Charge Meter rules, Casting Rules, Target Priority, Damage Pipeline rules,
 *   Split-Corpse Halves on release, Code-Drawn Pixel Title Cards, Camera Zoom, and Accessibility options.
 */

import { PALETTE } from '../data/config.js';
import {
  ULTIMATES,
  ULTIMATE_CHARGE_CONFIG,
  ULTIMATE_CAST_RULES,
  getActiveUltimateForPlayer,
} from '../data/ultimates.js';
import { computeDamagePipeline } from './Status.js';
import {
  angleTo4Facing,
  drawPixelLine,
  drawBresenhamCircle,
} from './PixelArt.js';
import { spriteRegistry, drawPixelText } from './Sprites.js';
import { sound } from './Audio.js';

export class UltimateSequencer {
  constructor() {
    // Active sequence state
    this.active = false;
    this.ultDef = null;
    this.elapsedMs = 0;
    this.steps = [];
    this.stepIndex = 0;

    // Cast & freeze flags
    this.worldFrozen = false;
    this.twoToneWorld = false;
    this.invertFrames = 0;
    this.movementLocked = false;
    this.chargePaused = false;

    // Screen presentation state
    this.letterboxCurrent = 0; // 0..0.12
    this.letterboxTarget = 0;
    this.cutInActive = false;
    this.cutInProgress = 0; // 0..1 slam-in
    this.titleCardText = '';
    this.flashFrames = 0;
    this.flashColor = '#FFFFFF';
    this.flashTimestamps = []; // for capping to max 3 flashes/sec when reduceFlashes is on
    this.impactFrames = 0;
    this.impactMaxFrames = 0;
    this.impactData = null;

    // Charge Meter tracking & caps
    this.damageGainThisSecond = 0;
    this.damageGainWindowTimer = 0;
    this.readyFlashTimer = 0;
    this.wasReadyLastTick = false;
    this.invalidShakeTimer = 0;

    // Accessibility Notice (shown once on first ultimate cast)
    this.hasShownFirstCastNotice = false;
    this.firstCastNoticeTimer = 0;

    // Sena Seven Cuts / Nine Cuts runtime state
    this.cutAssignments = []; // [{ target, angle, x1, y1, x2, y2, triggered, damageMult, applyBleed }]
    this.lastCutTarget = null;
    this.splitCorpses = []; // [{ canvas, x, y, angle, sep, vx, vy, life, maxLife }]
    this.afterimages = []; // [{ x, y, fromX, fromY, facingX, life, maxLife, color }]

    // Rook Ten Count / Long Count / Dead Ground runtime state
    this.aimOriginX = 0;
    this.aimOriginY = 0;
    this.aimCursorX = 0;
    this.aimCursorY = 0;
    this.aimAngle = 0;
    this.aimLineActive = false;
    this.aimLineRange = 520;
    this.aimLineColor = PALETTE.blood;
    this.aimChargeProgress = 0;
    this.aimChargeDurationMs = 1000;
    this.aimChargeElapsedMs = 0;
    this.deadGroundCenter = { x: 0, y: 0 };
    this.mineArcs = []; // [{ startX, startY, endX, endY, progress, duration }]

    // Ines Scrapfall / Crane Drop / Junkyard Rain runtime state
    this.levitationZone = null; // { x, y, radius, elapsedMs, durationMs, pieces: [...] }
    this.slamStreaks = []; // [{ x, y, radius, life, maxLife, color }]

    // Kaelen Sunfall Cataclysm / Tectonic Kiln / Blight Hurricane runtime state
    this.solarCataclysm = null; // { x, y, radius, elapsedMs, durationMs, rayCount, corrosiveRain, tectonicFissures, meteors: [...] }

    // Vespera Orbital Ion Singularity / Valkyrie Swarm / Zenith Thunderhead runtime state
    this.ionSingularity = null; // { x, y, radius, elapsedMs, durationMs, vertexCount, thunderheadStorm, pillars: [...] }

    this.lastPlayerRef = null;
    this.lastSpawnerRef = null;
  }

  reset() {
    this.active = false;
    this.ultDef = null;
    this.elapsedMs = 0;
    this.steps = [];
    this.stepIndex = 0;
    this.worldFrozen = false;
    this.twoToneWorld = false;
    this.invertFrames = 0;
    this.movementLocked = false;
    this.chargePaused = false;
    this.letterboxCurrent = 0;
    this.letterboxTarget = 0;
    this.cutInActive = false;
    this.flashFrames = 0;
    this.impactFrames = 0;
    this.impactMaxFrames = 0;
    this.impactData = null;
    this.cutAssignments = [];
    this.afterimages = [];
    this.mineArcs = [];
    this.slamStreaks = [];
    this.aimLineActive = false;
    this.levitationZone = null;
    this.solarCataclysm = null;
    this.ionSingularity = null;
  }

  getActiveUltimateDef(player) {
    return getActiveUltimateForPlayer(player.classId, player.ownedNodes);
  }

  getChargeNeeded(player) {
    const def = this.getActiveUltimateDef(player);
    return def ? def.chargeNeeded : 100;
  }

  isReady(player) {
    return player.ultimateCharge >= this.getChargeNeeded(player);
  }

  isCinematicActive() {
    return this.active && (this.worldFrozen || this.movementLocked);
  }

  isChargeGainPaused(player) {
    if (this.chargePaused) return true;
    if (player && player.statuses && player.statuses.has('dugIn')) return true;
    if (this.active && this.ultDef && this.ultDef.pauseChargeWhileActive) return true;
    return false;
  }

  // ===========================================================================
  // CHARGE METER GAIN RULES
  // ===========================================================================

  _applyChargeDelta(player, rawAmount, isFromDealingDamage = false) {
    if (!player || player.dead || this.isChargeGainPaused(player)) return 0;

    const classMult =
      ULTIMATE_CHARGE_CONFIG.classMultipliers[player.classId] ?? 1.0;
    let delta = rawAmount * classMult;

    if (isFromDealingDamage) {
      const remainingCap = Math.max(
        0,
        ULTIMATE_CHARGE_CONFIG.damageDealtGainCapPerSecond - this.damageGainThisSecond
      );
      delta = Math.min(delta, remainingCap);
      this.damageGainThisSecond += delta;
    }

    if (delta <= 0) return 0;

    const needed = this.getChargeNeeded(player);
    const wasReady = player.ultimateCharge >= needed;
    player.ultimateCharge = Math.min(
      ULTIMATE_CHARGE_CONFIG.maxCharge,
      +(player.ultimateCharge + delta).toFixed(2)
    );
    const nowReady = player.ultimateCharge >= needed;

    if (!wasReady && nowReady) {
      this.readyFlashTimer = 0.65;
      this.wasReadyLastTick = true;
      sound.playUltimateReady();
    }

    return delta;
  }

  onBasicHitLanded(player) {
    return this._applyChargeDelta(player, ULTIMATE_CHARGE_CONFIG.basicHitGain, true);
  }

  onSkillHitLanded(player, enemyHitCountInThisCast = 1) {
    // Counted for at most 3 enemies per cast so area skills cannot spike the meter
    if (enemyHitCountInThisCast > ULTIMATE_CHARGE_CONFIG.skillHitMaxEnemiesPerCast) {
      return 0;
    }
    return this._applyChargeDelta(player, ULTIMATE_CHARGE_CONFIG.skillHitGain, true);
  }

  onDamageTaken(player, finalDamage, maxHp, isBlock = false) {
    if (!player || maxHp <= 0 || finalDamage <= 0) return 0;
    const pctLost = (finalDamage / maxHp) * 100;
    let raw = pctLost * ULTIMATE_CHARGE_CONFIG.damageTakenGainPerPctMaxHp;
    if (isBlock && player.hasNode('counterweight')) {
      raw *= ULTIMATE_CHARGE_CONFIG.counterweightBlockMultiplier;
    }
    return this._applyChargeDelta(player, raw, false);
  }

  addDamageTakenCharge(player, hpLossPct, isBlock = false) {
    if (!player || hpLossPct <= 0) return 0;
    let raw = hpLossPct * ULTIMATE_CHARGE_CONFIG.damageTakenGainPerPctMaxHp;
    if (isBlock && player.hasNode('counterweight')) {
      raw *= ULTIMATE_CHARGE_CONFIG.counterweightBlockMultiplier;
    }
    return this._applyChargeDelta(player, raw, false);
  }

  onEnemyKilled(player, enemyTier = 'common') {
    const bonus = ULTIMATE_CHARGE_CONFIG.killBonus[enemyTier] || 0;
    if (bonus <= 0) return 0;
    return this._applyChargeDelta(player, bonus, false);
  }

  addKillCharge(player, enemyTier = 'common') {
    return this.onEnemyKilled(player, enemyTier);
  }

  // ===========================================================================
  // CASTING & TIMELINE COMPILATION
  // ===========================================================================

  tryCast(
    player,
    worldMouseX,
    worldMouseY,
    spawner,
    projectiles,
    particles,
    camera,
    world,
    accessibility = { reduceFlashes: false, shortUltimates: false }
  ) {
    if (!player || player.dead) return false;

    // Not castable while stunned, lifted, or mid-cinematic
    if (
      player.statuses.has('stun') ||
      player.statuses.has('lifted') ||
      this.isCinematicActive() ||
      this.active
    ) {
      return false;
    }

    const ultDef = this.getActiveUltimateDef(player);
    const chargeNeeded = ultDef.chargeNeeded || 100;
    if (player.ultimateCharge < chargeNeeded) {
      return false;
    }

    // Not castable in Kettle
    if (world && typeof world.isInsideKettle === 'function' && world.isInsideKettle(player.x, player.y)) {
      sound.playInvalidBuzz();
      this.invalidShakeTimer = ULTIMATE_CAST_RULES.invalidShakeDuration;
      if (particles) {
        particles.spawnFloatingText(
          player.x,
          player.y - 24,
          'SAFE ZONE',
          PALETTE.boneDark
        );
      }
      return false;
    }

    // Seven Cuts and Nine Cuts need at least 1 enemy within 300px
    let sortedTargets = [];
    if (ultDef.requiresTargetWithinPx > 0) {
      sortedTargets = this._findSortedTargets(
        player,
        spawner,
        ultDef.requiresTargetWithinPx
      );
      if (sortedTargets.length === 0) {
        sound.playInvalidBuzz();
        this.invalidShakeTimer = ULTIMATE_CAST_RULES.invalidShakeDuration;
        if (particles) {
          particles.spawnFloatingText(
            player.x,
            player.y - 24,
            'NO TARGET IN 300PX',
            PALETTE.blood
          );
        }
        return false;
      }
    }

    // Empty meter at the moment of casting
    player.ultimateCharge = 0;
    this.wasReadyLastTick = false;

    // First-time ultimate accessibility notice
    if (!this.hasShownFirstCastNotice) {
      this.hasShownFirstCastNotice = true;
      this.firstCastNoticeTimer = 7.5;
    }

    // Start sequence
    this.active = true;
    this.ultDef = ultDef;
    this.elapsedMs = 0;
    this.stepIndex = 0;
    this.chargePaused = !!ultDef.pauseChargeWhileActive;
    this.lastPlayerRef = player;
    this.lastSpawnerRef = spawner;

    this.aimOriginX = player.x;
    this.aimOriginY = player.y;
    const rawMx = Number.isFinite(worldMouseX) ? worldMouseX : (player.x + (player.facingX || 1) * 100);
    const rawMy = Number.isFinite(worldMouseY) ? worldMouseY : player.y;
    this.aimCursorX = player.clampCoord(rawMx);
    this.aimCursorY = player.clampCoord(rawMy);
    const computedAngle = Math.atan2(rawMy - player.y, rawMx - player.x);
    this.aimAngle = Number.isFinite(computedAngle) ? computedAngle : (player.facingX >= 0 ? 0 : Math.PI);
    this.deadGroundCenter = {
      x: this.aimCursorX,
      y: this.aimCursorY,
    };

    // Pre-assign round-robin cuts for Seven Cuts / Nine Cuts
    if (ultDef.id === 'sevenCuts' || ultDef.id === 'nineCuts') {
      this._prepareSenaCutAssignments(player, sortedTargets, ultDef);
    } else {
      this.cutAssignments = [];
    }

    // Compile timeline steps with "Short ultimates" accessibility scaling if enabled
    this.steps = this._compileSteps(ultDef.steps, accessibility);

    // Execute any t=0 steps immediately
    this._runPendingSteps(
      player,
      spawner,
      projectiles,
      particles,
      camera,
      world,
      accessibility
    );

    return true;
  }

  _findSortedTargets(player, spawner, radiusPx) {
    if (!spawner || typeof spawner.queryRadius !== 'function') return [];
    const raw = spawner.queryRadius(player.x, player.y, radiusPx + 24);
    const valid = [];
    for (let i = 0; i < raw.length; i++) {
      const e = raw[i];
      if (!e || !e.active || e.hp <= 0) continue;
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d <= radiusPx + (e.radius || 12)) {
        valid.push({ enemy: e, dist: d });
      }
    }

    // Priority: boss first, then elites, then commons, then nearest
    const tierRank = { boss: 0, elite: 1, common: 2 };
    valid.sort((a, b) => {
      const rA = tierRank[a.enemy.tier] ?? 2;
      const rB = tierRank[b.enemy.tier] ?? 2;
      if (rA !== rB) return rA - rB;
      return a.dist - b.dist;
    });

    return valid.map((v) => v.enemy);
  }

  _prepareSenaCutAssignments(player, sortedTargets, ultDef) {
    const totalCuts = ultDef.cuts || 7;
    const pool = sortedTargets.slice(0, totalCuts);
    const assignmentOrder = [];

    // "Cuts are assigned round-robin across up to the first 7 targets.
    //  If fewer than 7 targets exist, the list repeats, and a boss gets 1 extra cut."
    const bossTarget = pool.find((e) => e.tier === 'boss');
    let idx = 0;
    while (assignmentOrder.length < totalCuts && pool.length > 0) {
      const t = pool[idx % pool.length];
      assignmentOrder.push(t);
      if (
        bossTarget &&
        t === bossTarget &&
        pool.length < totalCuts &&
        assignmentOrder.length < totalCuts
      ) {
        assignmentOrder.push(bossTarget);
      }
      idx++;
    }

    // Pre-pick distinct slash angles for each cut
    const baseAngles = [
      -0.45,
      0.55,
      -1.15,
      1.20,
      0.15,
      -0.85,
      0.95,
      -0.25,
      1.45,
    ];

    this.cutAssignments = assignmentOrder.map((target, i) => {
      const angle = baseAngles[i % baseAngles.length] + (i * 0.18);
      return {
        cutIndex: i,
        target,
        angle,
        triggered: false,
        released: false,
        x: target.x,
        y: target.y,
      };
    });
  }

  _compileSteps(rawSteps, accessibility) {
    const shortUlts = !!(accessibility && accessibility.shortUltimates);
    if (!shortUlts) {
      return rawSteps.map((s) => ({ ...s, params: { ...(s.params || {}) } }));
    }

    // "Short ultimates" cuts cut-in length to 120ms and compresses non-gameplay steps by 30%
    const scale = ULTIMATE_CAST_RULES.shortUltimatesNonGameplayScale; // 0.70
    let cutInOriginalSpan = 250; // 330 - 80 = 250ms
    let cutInSavedMs = cutInOriginalSpan - ULTIMATE_CAST_RULES.shortUltimatesCutInMs; // 130ms saved

    return rawSteps.map((s) => {
      let t = s.t;
      if (s.action === 'cutInEnter') {
        t = Math.round(s.t * scale);
      } else if (s.action === 'cutInExit') {
        t = Math.round(80 * scale) + ULTIMATE_CAST_RULES.shortUltimatesCutInMs;
      } else if (s.t >= 330) {
        t = Math.max(180, Math.round((s.t - cutInSavedMs) * (s.nonGameplay ? scale : 0.85)));
      }
      return {
        ...s,
        t,
        params: { ...(s.params || {}) },
      };
    });
  }

  triggerImpactFrame(data = {}) {
    const frames = Math.max(1, data.frames || 2);
    this.impactFrames = frames;
    this.impactMaxFrames = frames;
    this.impactData = {
      x: data.x,
      y: data.y,
      angle: data.angle || 0,
      color: data.color || PALETTE.signal,
      kind: data.kind || 'slash',
      camera: data.camera || null,
      seed: Math.random() * 1000,
    };
  }

  _triggerScreenFlash(frames = 1, accessibility = {}, options = {}) {
    const nowSec = performance.now() / 1000;
    this.flashTimestamps = this.flashTimestamps.filter((ts) => nowSec - ts < 1.0);

    if (accessibility && accessibility.reduceFlashes) {
      if (this.flashTimestamps.length >= ULTIMATE_CAST_RULES.reduceFlashesMaxPerSecond) {
        return;
      }
    }
    this.flashTimestamps.push(nowSec);

    // Do not clobber a dedicated multi-frame impactFrame already triggered by the current step
    if (this.impactFrames > 0 && !options.force) {
      return;
    }

    this.triggerImpactFrame({
      frames: Math.min(3, Math.max(1, frames)),
      color: options.color || (this.ultDef && this.ultDef.classId === 'rook' ? PALETTE.brass : this.ultDef && this.ultDef.classId === 'ines' ? PALETTE.verdigris : PALETTE.signal),
      kind: options.kind || 'slash',
      x: options.x,
      y: options.y,
      angle: options.angle,
      camera: options.camera,
    });
  }

  // ===========================================================================
  // UPDATE & STEP EXECUTION
  // ===========================================================================

  update(
    dt,
    player,
    arg2,
    arg3,
    arg4,
    arg5,
    arg6,
    arg7,
    arg8 = { reduceFlashes: false, shortUltimates: false }
  ) {
    let input, spawner, projectiles, particles, camera, world, accessibility;

    // Detect if arg2 is spawner instead of input (e.g. called as update(dt, player, spawner, projectiles, ...))
    if (
      arg2 &&
      (typeof arg2.queryRadius === 'function' ||
        typeof arg2.getActiveCount === 'function' ||
        Array.isArray(arg2.enemies) ||
        (arg3 && typeof arg3.spawn === 'function'))
    ) {
      input = player?.lastInput || null;
      spawner = arg2;
      projectiles = arg3;
      particles = arg4;
      camera = arg5;
      world = arg6;
      accessibility = arg7 || { reduceFlashes: false, shortUltimates: false };
    } else {
      input = arg2;
      spawner = arg3;
      projectiles = arg4;
      particles = arg5;
      camera = arg6;
      world = arg7;
      accessibility = arg8 || { reduceFlashes: false, shortUltimates: false };
    }

    if (player) {
      this.lastPlayerRef = player;
    }
    if (spawner) {
      this.lastSpawnerRef = spawner;
    }

    // 1. Update rolling 1-second cap window for damage-dealt ultimate charge
    this.damageGainWindowTimer += dt;
    if (this.damageGainWindowTimer >= 1.0) {
      this.damageGainWindowTimer -= 1.0;
      this.damageGainThisSecond = 0;
    }

    if (this.readyFlashTimer > 0) {
      this.readyFlashTimer = Math.max(0, this.readyFlashTimer - dt);
    }
    if (this.invalidShakeTimer > 0) {
      this.invalidShakeTimer = Math.max(0, this.invalidShakeTimer - dt);
    }
    if (this.firstCastNoticeTimer > 0) {
      this.firstCastNoticeTimer = Math.max(0, this.firstCastNoticeTimer - dt);
    }
    if (this.invertFrames > 0) {
      this.invertFrames--;
    }
    if (this.flashFrames > 0) {
      this.flashFrames--;
    }

    // Smooth letterbox slide in/out
    const lbSpeed = 0.9 * dt;
    if (this.letterboxCurrent < this.letterboxTarget) {
      this.letterboxCurrent = Math.min(this.letterboxTarget, this.letterboxCurrent + lbSpeed);
    } else if (this.letterboxCurrent > this.letterboxTarget) {
      this.letterboxCurrent = Math.max(this.letterboxTarget, this.letterboxCurrent - lbSpeed);
    }

    // Update split corpse halves sliding apart after Seven Cuts / Nine Cuts release
    for (let i = this.splitCorpses.length - 1; i >= 0; i--) {
      const sc = this.splitCorpses[i];
      sc.life -= dt;
      sc.sep += sc.speed * dt;
      if (sc.life <= 0) {
        this.splitCorpses.splice(i, 1);
      }
    }

    // Update Sena phantom blink afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const ai = this.afterimages[i];
      ai.life -= dt;
      if (ai.life <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    // Update Rook Dead Ground parabolic mine arcs
    for (let i = this.mineArcs.length - 1; i >= 0; i--) {
      const ma = this.mineArcs[i];
      ma.progress += dt / Math.max(0.05, ma.duration);
      if (ma.progress >= 1) {
        this.mineArcs.splice(i, 1);
      }
    }

    // Update Ines vertical slam kinetic streaks
    for (let i = this.slamStreaks.length - 1; i >= 0; i--) {
      const ss = this.slamStreaks[i];
      ss.life -= dt;
      if (ss.life <= 0) {
        this.slamStreaks.splice(i, 1);
      }
    }

    // Update Ines levitation zone animation
    if (this.levitationZone) {
      this.levitationZone.elapsedMs += dt * 1000;
      // Gently pull non-boss enemies inside the zone toward the center while levitating
      if (spawner && typeof spawner.queryRadius === 'function') {
        const near = spawner.queryRadius(
          this.levitationZone.x,
          this.levitationZone.y,
          this.levitationZone.radius
        );
        for (let i = 0; i < near.length; i++) {
          const e = near[i];
          if (!e.active || e.hp <= 0 || e.tier === 'boss') continue;
          const dx = this.levitationZone.x - e.x;
          const dy = this.levitationZone.y - e.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 12 && dist <= this.levitationZone.radius) {
            e.x = Math.round(e.x + (dx / dist) * 22 * dt);
            e.y = Math.round(e.y + (dy / dist) * 22 * dt);
          }
        }
      }
      if (this.levitationZone.elapsedMs >= this.levitationZone.durationMs) {
        this.levitationZone = null;
      }
    }

    // Update Kaelen's Solar Cataclysm animation (revolving solar rays + falling slag meteors)
    if (this.solarCataclysm) {
      this.solarCataclysm.elapsedMs += dt * 1000;
      for (const m of this.solarCataclysm.meteors) {
        m.progress += dt / Math.max(0.15, m.fallDuration);
        if (m.progress >= 1 && !m.impacted) {
          m.impacted = true;
          if (particles) {
            const col = this.solarCataclysm.corrosiveRain ? PALETTE.lye : PALETTE.ember;
            particles.spawnShockwave(m.targetX, m.targetY, 42, col, 0.22);
            particles.spawnBurst(m.targetX, m.targetY, 8, col, 25, 110, 2, 0.28);
          }
        }
      }
      if (this.solarCataclysm.elapsedMs >= this.solarCataclysm.durationMs) {
        this.solarCataclysm = null;
      }
    }

    // Update Vespera's Ion Singularity matrix (rotating geometric laser web + sky lightning pillars)
    if (this.ionSingularity) {
      this.ionSingularity.elapsedMs += dt * 1000;
      for (const pil of this.ionSingularity.pillars) {
        pil.life -= dt;
      }
      this.ionSingularity.pillars = this.ionSingularity.pillars.filter((pil) => pil.life > 0);
      if (this.ionSingularity.elapsedMs >= this.ionSingularity.durationMs) {
        this.ionSingularity = null;
      }
    }

    if (!this.active) return;

    // Track live cursor angle during Rook's Ten Count / Long Count / Rail Slug charge
    if (this.aimLineActive && input) {
      this.aimOriginX = player.x;
      this.aimOriginY = player.y;
      if (input.worldMouseX !== undefined && input.worldMouseY !== undefined) {
        this.aimCursorX = input.worldMouseX;
        this.aimCursorY = input.worldMouseY;
        const nextAng = Math.atan2(
          this.aimCursorY - player.y,
          this.aimCursorX - player.x
        );
        if (Number.isFinite(nextAng)) {
          this.aimAngle = nextAng;
          player.facingDir = angleTo4Facing(this.aimAngle);
          player.facingX = Math.cos(this.aimAngle) >= 0 ? 1 : -1;
        }
      }
      this.aimChargeElapsedMs += dt * 1000;
      this.aimChargeProgress = Math.min(
        1,
        this.aimChargeElapsedMs / Math.max(1, this.aimChargeDurationMs)
      );
    }

    if (this.cutInActive) {
      this.cutInProgress = Math.min(1, this.cutInProgress + dt * 14);
    }

    this.elapsedMs += dt * 1000;
    this._runPendingSteps(
      player,
      spawner,
      projectiles,
      particles,
      camera,
      world,
      accessibility
    );
  }

  _runPendingSteps(
    player,
    spawner,
    projectiles,
    particles,
    camera,
    world,
    accessibility
  ) {
    while (
      this.active &&
      this.stepIndex < this.steps.length &&
      this.elapsedMs >= this.steps[this.stepIndex].t
    ) {
      const step = this.steps[this.stepIndex];
      this.stepIndex++;
      this._executeStep(
        step,
        player,
        spawner,
        projectiles,
        particles,
        camera,
        world,
        accessibility
      );
    }
  }

  _executeStep(
    step,
    player,
    spawner,
    projectiles,
    particles,
    camera,
    world,
    accessibility
  ) {
    const p = step.params || {};

    if (p.impactFrame) {
      this.triggerImpactFrame({
        x: p.impactFrame.x !== undefined ? p.impactFrame.x : player.x,
        y: p.impactFrame.y !== undefined ? p.impactFrame.y : player.y,
        angle: p.impactFrame.angle !== undefined ? p.impactFrame.angle : (this.aimAngle || 0),
        color: p.impactFrame.color || (player.classId === 'rook' ? PALETTE.brass : player.classId === 'ines' ? PALETTE.verdigris : PALETTE.signal),
        kind: p.impactFrame.kind || 'slash',
        frames: p.impactFrame.frames || 2,
        camera,
      });
    }

    switch (step.action) {
      case 'startCast': {
        this.worldFrozen = !!p.freezeWorld;
        this.twoToneWorld = !!p.twoToneWorld;
        this.movementLocked = p.lockMovement !== false;
        this.letterboxTarget = p.letterbox ?? ULTIMATE_CAST_RULES.letterboxHeightRatio;
        player.ultimateActive = true;

        if (p.untouchable !== false) {
          player.statuses.apply(
            'untouchable',
            { duration: 3.0, sourceName: this.ultDef.name },
            player,
            null
          );
        }

        if (
          p.refillScrapOrbit &&
          player.classId === 'ines' &&
          player.classBehavior &&
          player.classBehavior.addScrapPiece
        ) {
          player.classBehavior.addScrapPiece(player.classBehavior.getMaxScrap());
        }

        sound.playUltimateStart();
        break;
      }

      case 'cutInEnter': {
        this.cutInActive = true;
        this.cutInProgress = 0;
        this.titleCardText = p.titleCard || this.ultDef?.titleCard || 'ULTIMATE';
        break;
      }

      case 'cutInExit': {
        this.cutInActive = false;
        if (p.unfreezeWorld) {
          this.worldFrozen = false;
        }
        if (p.zoom && camera && camera.setZoom) {
          camera.setZoom(Math.min(ULTIMATE_CAST_RULES.maxCameraZoom, p.zoom));
        }
        if (p.aimLineRange) {
          this.aimLineActive = true;
          this.aimLineRange = p.aimLineRange;
          this.aimLineColor = p.aimLineColor || PALETTE.blood;
          this.aimChargeDurationMs = p.chargeDurationMs || 1000;
          this.aimChargeElapsedMs = 0;
          this.aimChargeProgress = 0;
        }
        break;
      }

      case 'senaSlashStep': {
        const cutIdx = p.cutIndex || 0;
        const assign = this.cutAssignments[cutIdx];
        sound.playUltimateCut(cutIdx);

        if (camera) {
          camera.shake(p.shakePx || 4, 0.08);
        }

        if (assign && assign.target && assign.target.active) {
          const t = assign.target;
          const prevX = player.x;
          const prevY = player.y;

          assign.triggered = true;
          assign.x = t.x;
          assign.y = t.y;
          this.lastCutTarget = t;

          // Sena blinks to 24px from the target
          const blinkDist = p.blinkOffsetPx || 24;
          player.x = player.clampCoord(t.x + Math.cos(assign.angle) * blinkDist);
          player.y = player.clampCoord(t.y + Math.sin(assign.angle) * blinkDist);
          const faceAng = Math.atan2(t.y - player.y, t.x - player.x);
          player.facingDir = angleTo4Facing(faceAng);
          player.facingX = Math.cos(faceAng) >= 0 ? 1 : -1;

          // Spawn phantom blink afterimage and high-speed lightning dash trail
          this.afterimages.push({
            fromX: prevX,
            fromY: prevY,
            x: player.x,
            y: player.y,
            facingX: player.facingX,
            life: 0.48,
            maxLife: 0.48,
            color: p.applyBleed ? PALETTE.blood : PALETTE.signal,
          });

          if (particles) {
            particles.spawnCrossCutFlash(t.x, t.y);
            particles.spawnDirectionalSparks(t.x, t.y, assign.angle, 0.7, 6, p.applyBleed ? PALETTE.blood : PALETTE.signal);
          }

          // Center the cut impact frame directly on the struck target at the exact cut angle
          this.triggerImpactFrame({
            x: t.x,
            y: t.y,
            angle: assign.angle,
            color: p.applyBleed ? PALETTE.blood : PALETTE.signal,
            kind: 'slashCut',
            frames: p.impactFrame?.frames || 2,
            camera,
          });
        }
        break;
      }

      case 'silenceWindow': {
        const durSec = (p.durationMs || 200) / 1000;
        sound.setSilenceWindow(durSec);
        break;
      }

      case 'senaReleaseCuts': {
        this.twoToneWorld = false;
        this.worldFrozen = false;
        if (p.letterboxOut) {
          this.letterboxTarget = 0;
        }
        if (camera && camera.setZoom) {
          camera.setZoom(1.0);
        }

        sound.playUltimateReleaseCrack();
        // Full-screen Sakuga dimensional slash-shatter impact frame
        this.triggerImpactFrame({
          x: this.lastCutTarget ? this.lastCutTarget.x : player.x,
          y: this.lastCutTarget ? this.lastCutTarget.y : player.y,
          angle: this.lastCutTarget ? Math.atan2(this.lastCutTarget.y - player.y, this.lastCutTarget.x - player.x) : 0,
          color: p.applyBleed ? PALETTE.blood : PALETTE.signal,
          kind: 'slashShatter',
          frames: p.impactFrame?.frames || 4,
          camera,
        });

        if (camera) {
          camera.shake(p.shakePx || 9, 0.30);
        }

        // Group cuts by target so all damage lands in the same frame
        const cutsByTarget = new Map();
        for (let i = 0; i < this.cutAssignments.length; i++) {
          const c = this.cutAssignments[i];
          c.released = true;
          if (!c.target || !c.target.active || c.target.hp <= 0) continue;
          const entry = cutsByTarget.get(c.target) || {
            target: c.target,
            cutsCount: 0,
            lastAngle: c.angle,
          };
          entry.cutsCount += 1;
          entry.lastAngle = c.angle;
          cutsByTarget.set(c.target, entry);

          // Spawn vibrant slash burst along each cut line
          if (particles) {
            const len = 54;
            particles.spawnSlash(
              c.target.x - Math.cos(c.angle) * len,
              c.target.y - Math.sin(c.angle) * len,
              c.target.x + Math.cos(c.angle) * len,
              c.target.y + Math.sin(c.angle) * len,
              p.applyBleed ? PALETTE.blood : PALETTE.signal,
              0.32,
              'sevenCuts'
            );
          }
        }

        // Resolve damage & Bleed stacks for each target in the same frame
        for (const { target, cutsCount, lastAngle } of cutsByTarget.values()) {
          const totalMult = cutsCount * (p.damageMultPerCut || 5.0 / 7);

          // Ultimates never crit. ATK buffs, Momentum, and Marked apply.
          const pipe = computeDamagePipeline({
            baseDamage: player.baseAtkForPipeline * totalMult,
            atkBuffPct: player.statuses.getAtkBonusPct(),
            isCrit: false,
            critMult: 1.0,
            distanceBonusPct: 0,
            targetStatuses: target.statuses,
            targetBaseDef: target.def || 0,
            sourceName: this.ultDef.name,
            targetName: target.name,
          });

          const prevHp = target.hp;
          target.takeDamage(
            pipe.finalDamage,
            lastAngle,
            target.tier === 'boss' ? 40 : 120,
            false,
            player,
            spawner,
            particles,
            camera
          );

          // Nine Cuts: each cut applies 1 Bleed stack
          if (p.applyBleed && target.active && target.hp > 0) {
            for (let s = 0; s < cutsCount; s++) {
              target.statuses.apply(
                'bleed',
                { duration: 4.0, sourceAtk: player.atk, sourceName: 'Nine Cuts' },
                target,
                particles
              );
            }
          }

          const killed = prevHp > 0 && target.hp <= 0;
          if (player.classId === 'sena' && player.classBehavior) {
            player.classBehavior.onLandHit(target, killed, particles);
          }

          // Commons and elites split along their cut lines and the halves slide apart
          if (killed && target.tier !== 'boss') {
            this._spawnSplitCorpse(target, lastAngle);
          } else if (target.tier === 'boss') {
            target.hitFlashFrames = 6;
            target.brassRimTimer = Math.max(target.brassRimTimer || 0, 0.45);
          }
        }

        // Ring of bone debris bursts outward around Sena
        if (particles) {
          particles.spawnShockwave(player.x, player.y, 120, PALETTE.bone, 0.28);
          particles.spawnDebris(player.x, player.y, 'shardBone', 8);
        }

        // Sena ends where the final cut was, facing the target
        if (this.lastCutTarget) {
          const faceAng = Math.atan2(
            this.lastCutTarget.y - player.y,
            this.lastCutTarget.x - player.x
          );
          player.facingDir = angleTo4Facing(faceAng);
          player.facingX = Math.cos(faceAng) >= 0 ? 1 : -1;
        }
        break;
      }

      case 'senaHoldTheLineStart': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        this.movementLocked = false;
        this.letterboxTarget = 0;
        if (camera && camera.setZoom) {
          camera.setZoom(1.0);
        }

        // Remove cast-time Untouchable so Sena takes reduced hits and triggers 80% ATK counter-bursts
        player.statuses.remove('untouchable');
        player.ultimateActive = false;

        const dur = p.standDuration || 6.0;
        player.statuses.apply(
          'dugIn',
          { duration: dur, sourceName: 'Hold the Line' },
          player,
          particles
        );
        if (player.classBehavior) {
          player.classBehavior.holdTheLineTimer = dur;
        }

        sound.playSkillGroundBreak();
        this.triggerImpactFrame({
          x: player.x,
          y: player.y,
          color: PALETTE.signal,
          kind: 'groundSlam',
          frames: p.impactFrame?.frames || 3,
          camera,
        });
        if (camera) {
          camera.shake(p.shakePx || 7, 0.25);
        }
        if (particles) {
          particles.spawnGroundBreakEffect(player.x, player.y, 120);
          particles.spawnShockwave(
            player.x,
            player.y,
            p.tauntRadius || 300,
            PALETTE.signal,
            0.35
          );
        }

        this._tauntEnemiesInRadius(player, spawner, p.tauntRadius || 300, particles);
        break;
      }

      case 'senaHoldTheLinePulse': {
        this._tauntEnemiesInRadius(player, spawner, p.tauntRadius || 300, null);
        if (particles) {
          particles.spawnShockwave(player.x, player.y, 120, PALETTE.signal, 0.22);
          particles.spawnRing(player.x, player.y, PALETTE.bone, 300, 0.28);
        }
        break;
      }

      case 'rookChargeTick': {
        sound.playReloadStart();
        if (particles && player) {
          const muzzleX = player.x + Math.cos(this.aimAngle) * 16;
          const muzzleY = player.y + Math.sin(this.aimAngle) * 16;
          particles.spawnSparks(muzzleX, muzzleY, 3, PALETTE.brass);
        }
        break;
      }

      case 'rookFireTenCountBolt': {
        const angle = Number.isFinite(this.aimAngle) ? this.aimAngle : (player.facingX >= 0 ? 0 : Math.PI);
        if (p.boltIndex === 0) {
          this.aimLineActive = false;
        }
        if (p.boltIndex === 0 || p.boltIndex === 9) {
          this.triggerImpactFrame({
            x: player.x,
            y: player.y,
            angle,
            color: PALETTE.brass,
            kind: 'pierceVector',
            frames: p.boltIndex === 9 ? 3 : 2,
            camera,
          });
        }

        // Ultimates never crit. ATK buffs and Marked apply. Distance bonus and Clean Mag do not.
        const atkBuffPct = this._getUltimateAtkBuffPct(player);

        if (projectiles && typeof projectiles.spawn === 'function') {
          projectiles.spawn({
            x: player.x + Math.cos(angle) * 14,
            y: player.y + Math.sin(angle) * 14,
            angle,
            speed: p.speed || 920,
            maxRange: p.range || 520,
            radius: 10,
            damage: player.baseAtkForPipeline * (p.damageMult || 0.60),
            atkBuffPct,
            knockback: 75,
            isPlayer: true,
            pierce: 999,
            type: 'rookBolt',
            color: PALETTE.brass,
            useRookDistanceBonus: false,
            isUltimateProjectile: true,
          });
        }

        if (particles) {
          const mx = player.x + Math.cos(angle) * 16;
          const my = player.y + Math.sin(angle) * 16;
          particles.spawnDirectionalSparks(mx, my, angle, 0.35, 4, PALETTE.brass);
        }

        sound.playSpringgunShot(true);
        if (camera) {
          camera.shake(p.shakePx || 3, 0.06);
        }
        break;
      }

      case 'rookReleaseRailSlug':
      case 'rookReleaseLongCount': {
        this.aimLineActive = false;
        const angle = Number.isFinite(this.aimAngle) ? this.aimAngle : (player.facingX >= 0 ? 0 : Math.PI);
        const range = p.range || 1400;
        const lineWidth = p.lineWidth || 90;
        const x1 = player.x;
        const y1 = player.y;
        const x2 = x1 + Math.cos(angle) * range;
        const y2 = y1 + Math.sin(angle) * range;

        // Sakuga anime action impact frame along the exact firing vector
        this.triggerImpactFrame({
          x: player.x,
          y: player.y,
          angle,
          color: PALETTE.brass,
          kind: 'rail',
          frames: p.impactFrame?.frames || 4,
          camera,
        });

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') {
          sound.playConcussiveBlast();
        }

        if (camera) {
          camera.shake(p.shakePx || 14, 0.35);
        }

        // Spawn colossal multi-tier Rail Beam corridor & bounded ground shockwaves
        if (particles) {
          if (typeof particles.spawnRailBeam === 'function') {
            particles.spawnRailBeam(x1, y1, x2, y2, lineWidth, 0.52);
          } else {
            particles.spawnSlash(x1, y1, x2, y2, PALETTE.brass, 0.45, 'sevenCuts');
          }

          // Muzzle blast ring & shell casing ejection
          particles.spawnShockwave(x1, y1, 64, PALETTE.brass, 0.22);
          particles.spawnDebris(x1, y1, 'canLid', 2);

          // Spawn dust & ground cracks along the near visible corridor (avoids spawning 8 off-screen ground breaks)
          const visibleRange = Math.min(540, range);
          const stepCount = Math.min(9, Math.round(visibleRange / 65));
          for (let s = 1; s <= stepCount; s++) {
            const tx = x1 + Math.cos(angle) * (s * 65);
            const ty = y1 + Math.sin(angle) * (s * 65);
            particles.spawnDustPuff(tx, ty, 2);
            if (s === 2 || s === 5 || s === 8) {
              particles.spawnGroundBreakEffect(tx, ty, 48);
            }
          }
        }

        // Query all enemies along the 1400px x 90px corridor
        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const segLenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        const candidates = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius((x1 + x2) * 0.5, (y1 + y2) * 0.5, range * 0.6)
          : [];

        const directHits = [];
        const halfWidth = lineWidth * 0.5;

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
          const dist = Math.hypot(e.x - projX, e.y - projY);

          if (dist <= halfWidth + e.radius) {
            directHits.push(e);
          }
        }

        const aoeRadius = p.aoeRadius || 80;
        const aoeDamageMult = p.aoeDamageMult || 3.5;

        // Process Direct Hits & Secondary AOE Shockwave Detonations
        for (let i = 0; i < directHits.length; i++) {
          const e = directHits[i];
          if (!e.active || e.hp <= 0) continue;

          // Apply Marked (+20% damage taken for 8s)
          e.statuses.apply(
            'marked',
            { duration: p.applyMarkedDuration || 8.0, sourceName: 'Rail Slug' },
            e,
            particles
          );

          // Direct Hit Damage Pipeline (1200% ATK)
          const pipe = computeDamagePipeline({
            baseDamage: player.baseAtkForPipeline * (p.damageMult || 12.0),
            atkBuffPct,
            isCrit: true,
            critMult: player.critMult || 1.8,
            distanceBonusPct: 0,
            targetStatuses: e.statuses,
            targetBaseDef: e.def || 0,
            sourceName: 'Anti-Materiel Rail Slug',
            targetName: e.name,
          });

          e.takeDamage(
            pipe.finalDamage,
            angle,
            240,
            true,
            player,
            spawner,
            particles,
            camera
          );

          // SECONDARY KINETIC AOE SHOCKWAVE DETONATION ON EVERY TARGET HIT
          if (particles) {
            if (typeof particles.spawnRing === 'function') {
              particles.spawnRing(e.x, e.y, PALETTE.brass, aoeRadius);
            } else if (typeof particles.spawnShockwave === 'function') {
              particles.spawnShockwave(e.x, e.y, aoeRadius, PALETTE.brass);
            }
            if (typeof particles.spawnSparks === 'function') particles.spawnSparks(e.x, e.y, 6, PALETTE.brass);
            if (typeof particles.spawnDebris === 'function') particles.spawnDebris(e.x, e.y, 'shardRust', 3);
          }

          // Detonate concussive shockwave damage to all surrounding enemies within 80px radius
          const nearby = (spawner && typeof spawner.queryRadius === 'function')
            ? spawner.queryRadius(e.x, e.y, aoeRadius)
            : [];

          for (let j = 0; j < nearby.length; j++) {
            const n = nearby[j];
            if (!n.active || n.hp <= 0 || n === e) continue;
            const d = Math.hypot(n.x - e.x, n.y - e.y);
            if (d <= aoeRadius + n.radius) {
              const knockAng = Math.atan2(n.y - e.y, n.x - e.x);
              const aoePipe = computeDamagePipeline({
                baseDamage: player.baseAtkForPipeline * aoeDamageMult,
                atkBuffPct,
                isCrit: false,
                critMult: 1.0,
                distanceBonusPct: 0,
                targetStatuses: n.statuses,
                targetBaseDef: n.def || 0,
                sourceName: 'Rail Concussion AOE',
                targetName: n.name,
              });
              n.takeDamage(aoePipe.finalDamage, knockAng, 160, false, player, spawner, particles, camera);
            }
          }
        }
        break;
      }

      case 'rookDropDeadGroundMine': {
        const idx = p.mineIndex || 0;
        const total = p.totalMines || 12;
        const rad = p.fieldRadius || 220;
        // Golden-angle spiral distribution inside the 220px field
        const ringRatio = Math.sqrt((idx + 0.5) / total);
        const theta = idx * 2.39996;
        const mx = player.clampCoord(
          this.deadGroundCenter.x + Math.cos(theta) * rad * ringRatio * 0.85
        );
        const my = player.clampCoord(
          this.deadGroundCenter.y + Math.sin(theta) * rad * ringRatio * 0.85
        );

        // Animate parabolic lob arc from Rook to the mine landing spot
        this.mineArcs.push({
          startX: player.x,
          startY: player.y,
          endX: mx,
          endY: my,
          progress: 0,
          duration: 0.16,
        });

        if (player.classId === 'rook' && player.classBehavior) {
          player.classBehavior.traps.push({
            kind: 'mine',
            x: mx,
            y: my,
            radius: 20,
            triggerRadius: 34,
            blastRadius: p.blastRadius || 80,
            damageMult: p.damageMult || 2.20,
            life: 10.0,
            maxLife: 10.0,
            armTimer: 0.15,
            isUltimateMine: true,
          });
        }

        sound.playReloadStart();
        if (particles) {
          particles.spawnDustPuff(mx, my, 2, 0, 0);
          particles.spawnRing(mx, my, PALETTE.brass, 26, 0.16);
        }
        break;
      }

      case 'rookReleaseDeadGround': {
        this.triggerImpactFrame({
          x: this.deadGroundCenter.x,
          y: this.deadGroundCenter.y,
          color: PALETTE.brass,
          kind: 'mineBlast',
          frames: p.impactFrame?.frames || 3,
          camera,
        });
        if (camera) {
          camera.shake(p.shakePx || 6, 0.20);
        }
        if (particles) {
          particles.spawnShockwave(
            this.deadGroundCenter.x,
            this.deadGroundCenter.y,
            220,
            PALETTE.brass,
            0.28
          );
        }
        break;
      }

      case 'inesLevitateScrap': {
        const rad = p.radius || 160;
        const count = p.wreckPieceCount || 14;
        const pieces = Array.from({ length: count }, (_, i) => ({
          angle: (i / count) * Math.PI * 2,
          distRatio: 0.2 + ((i * 37) % 75) / 100,
          variant: i % 8,
          heightOffset: 0,
        }));

        this.levitationZone = {
          x: this.aimCursorX,
          y: this.aimCursorY,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.levitateDurationMs || 1000,
          pieces,
        };

        sound.playMagnetPull();
        break;
      }

      case 'inesSlamScrapWave': {
        const zx = this.levitationZone ? this.levitationZone.x : this.aimCursorX;
        const zy = this.levitationZone ? this.levitationZone.y : this.aimCursorY;
        const rad = p.radius || 160;

        sound.playSkillGroundBreak();
        // Trigger Sakuga magnetic-crush impact frame centered on the slam zone (zx, zy)
        this.triggerImpactFrame({
          x: zx,
          y: zy,
          color: PALETTE.verdigris,
          kind: 'crush',
          frames: p.impactFrame?.frames || 4,
          camera,
        });
        if (camera) {
          camera.shake(p.shakePx || 8, 0.26);
        }

        // Spawn vertical kinetic slam streaks hammering into the crater
        this.slamStreaks.push({
          x: zx,
          y: zy,
          radius: rad,
          life: 0.26,
          maxLife: 0.26,
          color: PALETTE.verdigris,
        });

        if (particles) {
          particles.spawnGroundBreakEffect(zx, zy, rad);
          particles.spawnShockwave(zx, zy, rad, PALETTE.verdigris, 0.28);
          particles.spawnDebris(zx, zy, 'canLid', 5);
          particles.spawnDebris(zx, zy, 'shardRust', 5);
          if (p.spawnCrater && particles.spawnCraterDecal) {
            particles.spawnCraterDecal(zx, zy, Math.min(85, Math.round(rad * 0.45)));
          }
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];

        for (let i = 0; i < targets.length; i++) {
          const e = targets[i];
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + e.radius) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 5.5),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              distanceBonusPct: 0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: this.ultDef.name,
              targetName: e.name,
            });

            const hitAng = Math.atan2(e.y - zy, e.x - zx);
            e.takeDamage(
              pipe.finalDamage,
              hitAng,
              140,
              false,
              player,
              spawner,
              particles,
              camera
            );

            // Apply Stun (on bosses, StatusSystem automatically adds 25 + 10 * stunDuration to Stagger!)
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply(
                'stun',
                { duration: p.stunDuration, sourceName: this.ultDef.name },
                e,
                particles
              );
            }
          }
        }

        if (!p.keepLevitating) {
          this.levitationZone = null;
        }
        break;
      }

      case 'returnControlEarly': {
        this.worldFrozen = false;
        this.movementLocked = false;
        player.ultimateActive = false;
        player.statuses.remove('untouchable');
        if (p.letterboxOut) {
          this.letterboxTarget = 0;
        }
        if (camera && camera.setZoom) {
          camera.setZoom(p.zoom || 1.0);
        }
        break;
      }

      case 'kaelenIgniteSolarCore': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 230;
        const meteorCount = p.meteorCount || 12;
        const meteors = [];
        for (let i = 0; i < meteorCount; i++) {
          const ang = (i / meteorCount) * Math.PI * 2 + (i % 3) * 0.4;
          const dist = 35 + ((i * 39) % (rad - 30));
          const tx = player.clampCoord(player.x + Math.cos(ang) * dist);
          const ty = player.clampCoord(player.y + Math.sin(ang) * dist);
          meteors.push({
            startX: tx - 65,
            startY: ty - 170,
            targetX: tx,
            targetY: ty,
            progress: -(i * 0.06),
            fallDuration: 0.36 + (i % 3) * 0.06,
            impacted: false,
          });
        }
        this.solarCataclysm = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1400,
          rayCount: p.rayCount || 8,
          corrosiveRain: !!p.corrosiveRain,
          tectonicFissures: !!p.tectonicFissures,
          meteors,
        };
        if (player.classBehavior && typeof player.classBehavior.addPressure === 'function') {
          player.classBehavior.pressure = 100;
          player.statuses.apply('overheated', { duration: 6.0, sourceName: this.ultDef.name }, player, particles);
          if (p.grantMoltenJuggernaut) {
            player.statuses.apply('moltenJuggernaut', { duration: 8.0, sourceName: 'Tectonic Kiln' }, player, particles);
          }
        }
        if (typeof sound.playExplosion === 'function') sound.playExplosion();
        else if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        break;
      }

      case 'kaelenSolarPulseWave': {
        const zx = this.solarCataclysm ? this.solarCataclysm.x : player.x;
        const zy = this.solarCataclysm ? this.solarCataclysm.y : player.y;
        const rad = p.radius || 220;
        const col = this.solarCataclysm?.corrosiveRain ? PALETTE.lye : PALETTE.ember;

        if (typeof sound.playExplosion === 'function') sound.playExplosion();
        else if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 7, 0.18);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, col, 0.32);
          particles.spawnBurst(zx, zy, 24, col, 45, 165, 3, 0.38);
          particles.spawnBurst(zx, zy, 14, PALETTE.bone, 60, 180, 2, 0.25);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 28)
          : [];
        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          const dist = Math.hypot(e.x - zx, e.y - zy);
          if (dist <= rad + (e.radius || 12)) {
            if (p.pullInwardPx > 0 && e.tier !== 'boss' && dist > 18) {
              const pullAng = Math.atan2(zy - e.y, zx - e.x);
              e.x = player.clampCoord(e.x + Math.cos(pullAng) * p.pullInwardPx);
              e.y = player.clampCoord(e.y + Math.sin(pullAng) * p.pullInwardPx);
            }
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 1.8),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: this.ultDef.name,
              targetName: e.name,
            });
            e.takeDamage(
              pipe.finalDamage,
              Math.atan2(e.y - zy, e.x - zx),
              60,
              false,
              player,
              spawner,
              particles,
              camera
            );
            if (e.active && e.hp > 0) {
              e.statuses.apply(
                'burn',
                { duration: p.burnDuration || 5.0, sourceAtk: player.atk * 1.4, sourceName: this.ultDef.name },
                e,
                particles
              );
              if (p.corrodeStacks > 0) {
                for (let c = 0; c < p.corrodeStacks; c++) {
                  e.statuses.apply('corrode', { duration: 8.0, sourceName: this.ultDef.name }, e, particles);
                }
              }
            }
          }
        }
        break;
      }

      case 'kaelenSolarCataclysmSlam': {
        const zx = this.solarCataclysm ? this.solarCataclysm.x : player.x;
        const zy = this.solarCataclysm ? this.solarCataclysm.y : player.y;
        const rad = p.radius || 240;
        const col = this.solarCataclysm?.corrosiveRain ? PALETTE.lye : PALETTE.ember;

        sound.playUltimateReleaseCrack();
        if (typeof sound.playExplosion === 'function') sound.playExplosion();
        else if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 11, 0.34);
        if (p.spawnCrater && world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        this.slamStreaks.push({
          x: zx,
          y: zy,
          radius: rad,
          life: 0.36,
          maxLife: 0.36,
          color: col,
        });

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, col, 0.42);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.65), PALETTE.bone, 0.28);
          particles.spawnBurst(zx, zy, 36, col, 60, 210, 3, 0.5);
          particles.spawnBurst(zx, zy, 20, PALETTE.brass, 40, 170, 2, 0.4);
        }

        // Spawn lingering hazard pools via Kaelen's classBehavior if available
        if (player.classId === 'kaelen' && player.classBehavior && Array.isArray(player.classBehavior.pools)) {
          for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + 0.4;
            player.classBehavior.pools.push({
              x: player.clampCoord(zx + Math.cos(a) * (rad * 0.45)),
              y: player.clampCoord(zy + Math.sin(a) * (rad * 0.45)),
              radius: 68,
              life: 6.0,
              maxLife: 6.0,
              tickTimer: 0.15,
              kind: this.solarCataclysm?.corrosiveRain ? 'caustic' : 'magma',
            });
          }
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];
        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 3.0),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: this.ultDef.name,
              targetName: e.name,
            });
            e.takeDamage(
              pipe.finalDamage,
              Math.atan2(e.y - zy, e.x - zx),
              185,
              false,
              player,
              spawner,
              particles,
              camera
            );
            if (e.active && e.hp > 0) {
              if (p.stunDuration > 0) {
                e.statuses.apply('stun', { duration: p.stunDuration, sourceName: this.ultDef.name }, e, particles);
              }
              e.statuses.apply(
                'burn',
                { duration: p.burnDuration || 6.0, sourceAtk: player.atk * 1.5, sourceName: this.ultDef.name },
                e,
                particles
              );
              for (let c = 0; c < (p.corrodeStacks || 2); c++) {
                e.statuses.apply('corrode', { duration: 8.0, sourceName: this.ultDef.name }, e, particles);
              }
            }
          }
        }
        this.solarCataclysm = null;
        break;
      }

      case 'vesperaDeployIonMatrix': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 240;
        this.ionSingularity = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1420,
          vertexCount: p.vertexCount || 5,
          thunderheadStorm: !!p.thunderheadStorm,
          pillars: [],
        };
        player.statuses.apply('arcOvercharge', { duration: 8.0, sourceName: this.ultDef.name }, player, particles);
        if (
          p.spawnValkyrieSwarm &&
          player.classId === 'vespera' &&
          player.classBehavior &&
          Array.isArray(player.classBehavior.seekerSwarm)
        ) {
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            player.classBehavior.seekerSwarm.push({
              x: player.x + Math.cos(a) * 20,
              y: player.y + Math.sin(a) * 20,
              vx: Math.cos(a) * 240,
              vy: Math.sin(a) * 240,
              damage: Math.round(player.atk * 1.35),
              life: 4.5,
              trailTick: 0,
            });
          }
        }
        sound.playUltimateStart();
        break;
      }

      case 'vesperaIonMatrixPulse': {
        const zx = this.ionSingularity ? this.ionSingularity.x : player.x;
        const zy = this.ionSingularity ? this.ionSingularity.y : player.y;
        const rad = p.radius || 235;

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 7, 0.18);

        if (this.ionSingularity) {
          const vCount = this.ionSingularity.vertexCount || 5;
          for (let i = 0; i < vCount; i++) {
            const a = (i / vCount) * Math.PI * 2 + (p.pulseIndex || 1) * 0.6;
            const px = zx + Math.cos(a) * (rad * 0.68);
            const py = zy + Math.sin(a) * (rad * 0.68);
            this.ionSingularity.pillars.push({
              x: px,
              y: py,
              width: 18,
              life: 0.34,
              maxLife: 0.34,
            });
          }
        }

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.volt, 0.30);
          particles.spawnBurst(zx, zy, 22, PALETTE.volt, 55, 185, 2, 0.32);
          particles.spawnBurst(zx, zy, 14, PALETTE.signal, 45, 160, 2, 0.26);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 28)
          : [];
        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          const dist = Math.hypot(e.x - zx, e.y - zy);
          if (dist <= rad + (e.radius || 12)) {
            if (p.pullInwardPx > 0 && e.tier !== 'boss' && dist > 16) {
              const pullAng = Math.atan2(zy - e.y, zx - e.x);
              e.x = player.clampCoord(e.x + Math.cos(pullAng) * p.pullInwardPx);
              e.y = player.clampCoord(e.y + Math.sin(pullAng) * p.pullInwardPx);
            }
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 1.8),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: this.ultDef.name,
              targetName: e.name,
            });
            e.takeDamage(
              pipe.finalDamage,
              Math.atan2(zy - e.y, zx - e.x),
              45,
              false,
              player,
              spawner,
              particles,
              camera
            );
            if (e.active && e.hp > 0) {
              e.statuses.apply('marked', { duration: 6.0, sourceName: this.ultDef.name }, e, particles);
              e.statuses.apply('slow', { duration: 3.0, sourceName: this.ultDef.name }, e, particles);
            }
          }
        }
        break;
      }

      case 'vesperaIonSingularityCollapse': {
        const zx = this.ionSingularity ? this.ionSingularity.x : player.x;
        const zy = this.ionSingularity ? this.ionSingularity.y : player.y;
        const rad = p.radius || 240;

        sound.playUltimateReleaseCrack();
        if (typeof sound.playExplosion === 'function') sound.playExplosion();
        else if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 11, 0.34);
        if (p.spawnCrater && world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        this.slamStreaks.push({
          x: zx,
          y: zy,
          radius: rad,
          life: 0.38,
          maxLife: 0.38,
          color: PALETTE.volt,
        });

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.volt, 0.42);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.55), PALETTE.bone, 0.28);
          particles.spawnBurst(zx, zy, 38, PALETTE.volt, 65, 220, 3, 0.48);
          particles.spawnBurst(zx, zy, 20, PALETTE.signal, 50, 180, 2, 0.38);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];
        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 3.0),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: this.ultDef.name,
              targetName: e.name,
            });
            e.takeDamage(
              pipe.finalDamage,
              Math.atan2(e.y - zy, e.x - zx),
              165,
              false,
              player,
              spawner,
              particles,
              camera
            );
            if (e.active && e.hp > 0) {
              if (p.stunDuration > 0) {
                e.statuses.apply('stun', { duration: p.stunDuration, sourceName: this.ultDef.name }, e, particles);
              }
              e.statuses.apply('marked', { duration: 7.0, sourceName: this.ultDef.name }, e, particles);
            }
          }
        }

        this.ionSingularity = null;
        break;
      }

      case 'endCast': {
        this.active = false;
        this.worldFrozen = false;
        this.twoToneWorld = false;
        this.movementLocked = false;
        this.chargePaused = false;
        this.letterboxTarget = 0;
        this.cutInActive = false;
        this.aimLineActive = false;
        this.levitationZone = null;
        this.solarCataclysm = null;
        this.ionSingularity = null;
        player.ultimateActive = false;
        player.statuses.remove('untouchable');

        this.cutAssignments = [];

        if (camera && camera.setZoom) {
          camera.setZoom(1.0);
        }
        break;
      }

      default:
        break;
    }
  }

  _getUltimateAtkBuffPct(player) {
    // "Ultimates never crit. ATK buffs, Momentum, and Marked apply. The distance bonus and Clean Mag do not."
    let pct = player.statuses.getAtkBonusPct();
    if (player.statuses.has('cleanMag')) {
      pct -= 0.25;
    }
    return Math.max(0, pct);
  }

  _tauntEnemiesInRadius(player, spawner, radius, particles) {
    if (!spawner || typeof spawner.queryRadius !== 'function') return;
    const nearby = spawner.queryRadius(player.x, player.y, radius);
    for (let i = 0; i < nearby.length; i++) {
      const e = nearby[i];
      if (!e.active || e.hp <= 0) continue;
      e.statuses.apply(
        'drawnIn',
        { duration: 2.0, tauntTarget: player, sourceName: 'Hold the Line' },
        e,
        particles
      );
    }
  }

  _spawnSplitCorpse(enemy, cutAngle) {
    const entry = spriteRegistry.enemies?.[enemy.id];
    if (!entry) return;
    const frames = enemy.facingX >= 0 ? entry.walkRight : entry.walkLeft;
    const canvas = frames?.[0];
    if (!canvas) return;

    this.splitCorpses.push({
      canvas,
      x: enemy.x,
      y: enemy.y,
      w: entry.w || canvas.width,
      h: entry.h || canvas.height,
      cutAngle,
      sep: 1,
      speed: 38,
      life: 0.45,
      maxLife: 0.45,
    });
  }

  // ===========================================================================
  // WORLD & SCREEN OVERLAY RENDERING
  // ===========================================================================

  drawWorldOverlay(ctx, camera, player = null) {
    return this.drawWorldEffects(ctx, camera, player || this.lastPlayerRef);
  }

  drawWorldEffects(ctx, camera, player = null) {
    const p = player || this.lastPlayerRef;
    const camX = camera.renderX;
    const camY = camera.renderY;

    // 0. Sena's Hold the Line — Bastion Anvil Aegis Perimeter on Ground
    if (p && p.classId === 'sena' && p.statuses && p.statuses.has('dugIn')) {
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY);
      const spin = (performance.now() * 0.0025) % (Math.PI * 2);

      // 120px counter-burst zone & 300px taunt perimeter
      drawBresenhamCircle(ctx, sx, sy, 120, PALETTE.signal, 0.85);
      drawBresenhamCircle(ctx, sx, sy, 116, PALETTE.bone, 0.45);
      drawBresenhamCircle(ctx, sx, sy, 300, PALETTE.rust, 0.45);

      // 8 rotating iron bastion chevrons at the 120px counter-burst ring
      for (let i = 0; i < 8; i++) {
        const a = spin + (i / 8) * Math.PI * 2;
        const bx = Math.round(sx + Math.cos(a) * 120);
        const by = Math.round(sy + Math.sin(a) * 120);
        const ix = Math.round(sx + Math.cos(a) * 106);
        const iy = Math.round(sy + Math.sin(a) * 106);
        drawPixelLine(ctx, ix, iy, bx, by, i % 2 === 0 ? PALETTE.bone : PALETTE.signal, 2);
      }
    }

    // 1. Draw Split Corpse Halves sliding apart along cut lines
    for (let i = 0; i < this.splitCorpses.length; i++) {
      const sc = this.splitCorpses[i];
      const sx = Math.round(sc.x - camX);
      const sy = Math.round(sc.y - camY);
      const perpX = Math.round(-Math.sin(sc.cutAngle) * sc.sep);
      const perpY = Math.round(Math.cos(sc.cutAngle) * sc.sep);
      const halfH = Math.floor(sc.h / 2);

      // Top half sliding one way
      ctx.drawImage(
        sc.canvas,
        0,
        0,
        sc.w,
        halfH,
        Math.round(sx - sc.w / 2 + perpX),
        Math.round(sy - sc.h / 2 + perpY),
        sc.w,
        halfH
      );
      // Bottom half sliding opposite way
      ctx.drawImage(
        sc.canvas,
        0,
        halfH,
        sc.w,
        sc.h - halfH,
        Math.round(sx - sc.w / 2 - perpX),
        Math.round(sy - sc.h / 2 + halfH - perpY),
        sc.w,
        sc.h - halfH
      );
      // Bright cut seam line between the two halves
      drawPixelLine(
        ctx,
        sx - 16,
        sy,
        sx + 16,
        sy,
        PALETTE.bone,
        1
      );
    }

    // 1.5. Draw Sena's high-speed phantom afterimages & blink-lightning vectors
    for (let i = 0; i < this.afterimages.length; i++) {
      const ai = this.afterimages[i];
      const ratio = ai.life / ai.maxLife;
      const sx0 = Math.round(ai.fromX - camX);
      const sy0 = Math.round(ai.fromY - camY);
      const sx1 = Math.round(ai.x - camX);
      const sy1 = Math.round(ai.y - camY);

      // Dash-lightning vector connecting blink origin to destination
      drawPixelLine(ctx, sx0, sy0, sx1, sy1, ratio > 0.55 ? PALETTE.bone : ai.color, ratio > 0.65 ? 2 : 1);

      // Phantom silhouette of Sena at blink origin
      ctx.fillStyle = ratio > 0.5 ? ai.color : PALETTE.slag;
      ctx.fillRect(sx0 - 4, sy0 - 11, 8, 16);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(sx0 - 2, sy0 - 9, 4, 4);
    }

    // 2. Draw frozen white slash lines & target lock-on reticles during Seven Cuts / Nine Cuts
    for (let i = 0; i < this.cutAssignments.length; i++) {
      const c = this.cutAssignments[i];
      if (!c.target || c.released) continue;
      const tx = Math.round(c.target.x - camX);
      const ty = Math.round(c.target.y - camY);

      if (!c.triggered) {
        // Queued target lock-on diamond reticle
        const r = 12;
        drawPixelLine(ctx, tx, ty - r, tx + r, ty, PALETTE.signal, 1);
        drawPixelLine(ctx, tx + r, ty, tx, ty + r, PALETTE.signal, 1);
        drawPixelLine(ctx, tx, ty + r, tx - r, ty, PALETTE.signal, 1);
        drawPixelLine(ctx, tx - r, ty, tx, ty - r, PALETTE.signal, 1);
        continue;
      }

      // Triggered cut: vibrating multi-layer slash seam + center cross-glint
      const jitter = Math.sin(this.elapsedMs * 0.08 + i * 1.7) * 1.2;
      const len = 42;
      const x1 = Math.round(tx - Math.cos(c.angle) * len + jitter);
      const y1 = Math.round(ty - Math.sin(c.angle) * len - jitter);
      const x2 = Math.round(tx + Math.cos(c.angle) * len + jitter);
      const y2 = Math.round(ty + Math.sin(c.angle) * len - jitter);

      const accentCol = this.ultDef?.id === 'nineCuts' ? PALETTE.blood : PALETTE.signal;
      drawPixelLine(ctx, x1, y1, x2, y2, accentCol, 3);
      drawPixelLine(ctx, x1, y1, x2, y2, '#FFFFFF', 1);

      // Center cross-star glint at the cut intersection
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(tx - 5, ty - 1, 11, 2);
      ctx.fillRect(tx - 1, ty - 5, 2, 11);
    }

    // 3. Draw Rook's Ten Count / Long Count / Rail Slug charging aim line, corridor bounds, & lock-on reticles
    if (this.aimLineActive && p) {
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY - 4);
      const cosA = Math.cos(this.aimAngle);
      const sinA = Math.sin(this.aimAngle);
      const ex = Math.round(sx + cosA * this.aimLineRange);
      const ey = Math.round(sy + sinA * this.aimLineRange);
      const nx = -sinA;
      const ny = cosA;

      // Converging rail-capacitor energy rings vacuuming into Rook's muzzle
      const muzzleX = Math.round(sx + cosA * 14);
      const muzzleY = Math.round(sy + sinA * 14);
      const gatherRad = Math.max(3, Math.round((1 - (this.aimChargeElapsedMs % 250) / 250) * 26));
      drawBresenhamCircle(ctx, muzzleX, muzzleY, gatherRad, PALETTE.brass, 0.9);
      drawBresenhamCircle(ctx, muzzleX, muzzleY, Math.max(2, Math.round(gatherRad * 0.5)), PALETTE.bone, 1.0);

      // Center laser sight line
      drawPixelLine(ctx, sx, sy, ex, ey, this.aimChargeProgress > 0.75 ? PALETTE.bone : this.aimLineColor, 1);

      // If Rail Slug or Long Count, draw corridor bounds, scrolling chevrons, and target lock-on diamonds
      const halfCorridor = this.aimLineRange >= 1000 ? 45 : this.aimLineRange >= 600 ? 15 : 0;
      if (halfCorridor > 0) {
        const bxOff = nx * halfCorridor;
        const byOff = ny * halfCorridor;
        drawPixelLine(ctx, sx + bxOff, sy + byOff, ex + bxOff, ey + byOff, PALETTE.brass, 1);
        drawPixelLine(ctx, sx - bxOff, sy - byOff, ex - bxOff, ey - byOff, PALETTE.brass, 1);

        // Scrolling rangefinder chevrons racing down the corridor
        const scrollOffset = (this.aimChargeElapsedMs * 0.28) % 90;
        for (let b = 0; b < 7; b++) {
          const bdist = 35 + b * 90 + scrollOffset;
          const bx = sx + cosA * bdist;
          const by = sy + sinA * bdist;
          const tipX = bx + cosA * 12;
          const tipY = by + sinA * 12;
          const wing = halfCorridor * 0.55;
          drawPixelLine(ctx, bx - nx * wing, by - ny * wing, tipX, tipY, PALETTE.brass, 1);
          drawPixelLine(ctx, bx + nx * wing, by + ny * wing, tipX, tipY, PALETTE.brass, 1);
        }

        // Lock-on diamond reticles on all enemies caught inside the corridor
        if (this.lastSpawnerRef && Array.isArray(this.lastSpawnerRef.enemies)) {
          const enemies = this.lastSpawnerRef.enemies;
          for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e || !e.active || e.hp <= 0) continue;
            const dx = e.x - p.x;
            const dy = e.y - p.y;
            const along = dx * cosA + dy * sinA;
            const perp = Math.abs(dx * nx + dy * ny);
            if (along > 0 && along <= this.aimLineRange && perp <= halfCorridor + (e.radius || 12)) {
              const esx = Math.round(e.x - camX);
              const esy = Math.round(e.y - camY);
              const lr = 13;
              drawPixelLine(ctx, esx, esy - lr, esx + lr, esy, PALETTE.brass, 1);
              drawPixelLine(ctx, esx + lr, esy, esx, esy + lr, PALETTE.brass, 1);
              drawPixelLine(ctx, esx, esy + lr, esx - lr, esy, PALETTE.brass, 1);
              drawPixelLine(ctx, esx - lr, esy, esx, esy - lr, PALETTE.brass, 1);
              ctx.fillStyle = PALETTE.bone;
              ctx.fillRect(esx - 1, esy - 1, 3, 3);
            }
          }
        }
      }

      // 10 countdown ticks along the aim line near Rook
      for (let t = 0; t < 10; t++) {
        const lit = t / 10 <= this.aimChargeProgress;
        const dist = 20 + t * 8;
        const tx = Math.round(sx + cosA * dist);
        const ty = Math.round(sy + sinA * dist);
        ctx.fillStyle = lit ? PALETTE.bone : PALETTE.slag;
        ctx.fillRect(tx - 1, ty - 1, 3, 3);
        if (lit) {
          ctx.fillStyle = PALETTE.brass;
          ctx.fillRect(tx, ty, 1, 1);
        }
      }
    }

    // 3.5. Draw Rook's Dead Ground parabolic mine arcs & tactical field perimeter
    if (this.active && this.ultDef?.id === 'deadGround') {
      const cx = Math.round(this.deadGroundCenter.x - camX);
      const cy = Math.round(this.deadGroundCenter.y - camY);
      drawBresenhamCircle(ctx, cx, cy, 220, PALETTE.brass, 0.65);
    }
    for (let i = 0; i < this.mineArcs.length; i++) {
      const ma = this.mineArcs[i];
      const t = Math.min(1, ma.progress);
      const curX = ma.startX + (ma.endX - ma.startX) * t;
      const curY = ma.startY + (ma.endY - ma.startY) * t;
      const arcLift = Math.sin(t * Math.PI) * 38;
      const sx = Math.round(curX - camX);
      const sy = Math.round(curY - camY - arcLift);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - 2, sy - 2, 5, 5);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }

    // 4. Draw Ines's Levitating Wreck Parts, Magnetic Tether Lightning, & Slam Drop Streaks
    if (this.levitationZone) {
      const zx = Math.round(this.levitationZone.x - camX);
      const zy = Math.round(this.levitationZone.y - camY);
      const rad = this.levitationZone.radius;
      const liftRatio = Math.min(1, this.levitationZone.elapsedMs / 850);

      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.verdigris, 0.85);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * (1 - liftRatio * 0.45)), PALETTE.bone, 0.55);

      // Crackling verdigris magnetic tether lightning from Ines to the vortex center
      if (p) {
        const px = Math.round(p.x - camX);
        const py = Math.round(p.y - camY - 8);
        const segs = 6;
        let prevX = px;
        let prevY = py;
        for (let s = 1; s <= segs; s++) {
          const st = s / segs;
          const jitter = s < segs ? Math.sin(this.levitationZone.elapsedMs * 0.04 + s * 2.3) * 10 : 0;
          const nx = Math.round(px + (zx - px) * st + jitter);
          const ny = Math.round(py + (zy - 28 - py) * st - jitter * 0.6);
          drawPixelLine(ctx, prevX, prevY, nx, ny, s % 2 === 0 ? PALETTE.bone : PALETTE.verdigris, 1);
          prevX = nx;
          prevY = ny;
        }
      }

      for (let i = 0; i < this.levitationZone.pieces.length; i++) {
        const pc = this.levitationZone.pieces[i];
        const a = pc.angle + this.levitationZone.elapsedMs * 0.005;
        const r = rad * pc.distRatio * (1 - liftRatio * 0.35);
        const px = Math.round(zx + Math.cos(a) * r);
        const pyGround = Math.round(zy + Math.sin(a) * r);
        const liftY = Math.round(liftRatio * 38);

        // Vertical magnetic flux line from ground shadow up to levitating piece
        if (i % 2 === 0) {
          drawPixelLine(ctx, px, pyGround, px, pyGround - liftY, PALETTE.verdigris, 1);
        }

        // Ground shadow under rising wreck piece
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(px - 3, pyGround - 1, 6, 2);

        // Rising wreck sprite
        const scrapCanvas = spriteRegistry.getScrapVariant(pc.variant);
        if (scrapCanvas) {
          ctx.drawImage(scrapCanvas, px - 6, pyGround - liftY - 6);
        } else {
          ctx.fillStyle = PALETTE.slagLight;
          ctx.fillRect(px - 3, pyGround - liftY - 3, 6, 6);
        }
      }
    }

    // 4.5. Draw Ines's vertical kinetic slam streaks hammering into the crater
    for (let i = 0; i < this.slamStreaks.length; i++) {
      const ss = this.slamStreaks[i];
      const ratio = ss.life / ss.maxLife;
      const zx = Math.round(ss.x - camX);
      const zy = Math.round(ss.y - camY);
      const count = 14;
      for (let k = 0; k < count; k++) {
        const offset = ((k / (count - 1)) - 0.5) * ss.radius * 1.5;
        const x = Math.round(zx + offset);
        const yBot = Math.round(zy + Math.sin(k * 1.9) * (ss.radius * 0.35));
        const yTop = Math.round(yBot - 110 * ratio);
        drawPixelLine(ctx, x, yTop, x, yBot, k % 2 === 0 ? PALETTE.bone : ss.color, k % 3 === 0 ? 2 : 1);
      }
    }

    // 5. Draw Kaelen's Sunfall Cataclysm / Tectonic Kiln / Blight Hurricane World Effects
    if (this.solarCataclysm) {
      const sc = this.solarCataclysm;
      const zx = Math.round(sc.x - camX);
      const zy = Math.round(sc.y - camY);
      const rad = sc.radius;
      const primaryCol = sc.corrosiveRain ? PALETTE.lye : PALETTE.ember;
      const spin = sc.elapsedMs * 0.0042;

      // Outer & inner furnace rings
      drawBresenhamCircle(ctx, zx, zy, rad, primaryCol, 0.9);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.55), PALETTE.brass, 0.75);
      drawBresenhamCircle(ctx, zx, zy, 26, PALETTE.bone, 1.0);

      // Levitating miniature solar core above Kaelen
      const sunY = zy - 34;
      ctx.fillStyle = primaryCol;
      ctx.fillRect(zx - 12, sunY - 12, 24, 24);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(zx - 8, sunY - 8, 16, 16);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(zx - 4, sunY - 4, 8, 8);

      // Revolving 8-Ray Solar Flare Beams sweeping the battlefield
      for (let i = 0; i < sc.rayCount; i++) {
        const a = spin + (i / sc.rayCount) * Math.PI * 2;
        const rx = Math.round(zx + Math.cos(a) * rad);
        const ry = Math.round(zy + Math.sin(a) * rad);
        drawPixelLine(ctx, zx, zy, rx, ry, primaryCol, 3);
        drawPixelLine(ctx, zx, zy, rx, ry, i % 2 === 0 ? PALETTE.bone : PALETTE.brass, 1);

        // If Tectonic Kiln, draw jagged magma fissures branching along the ground
        if (sc.tectonicFissures) {
          const midX = Math.round(zx + Math.cos(a) * (rad * 0.55));
          const midY = Math.round(zy + Math.sin(a) * (rad * 0.55));
          const branchA = a + 0.45;
          drawPixelLine(
            ctx,
            midX,
            midY,
            Math.round(midX + Math.cos(branchA) * 55),
            Math.round(midY + Math.sin(branchA) * 55),
            PALETTE.ember,
            2
          );
        }
      }

      // Falling Molten Slag Meteors
      for (const m of sc.meteors) {
        if (m.progress < 0 || m.progress > 1) continue;
        const mx = Math.round((m.startX + (m.targetX - m.startX) * m.progress) - camX);
        const my = Math.round((m.startY + (m.targetY - m.startY) * m.progress) - camY);
        const tx = Math.round(m.targetX - camX);
        const ty = Math.round(m.targetY - camY);

        // Ground impact reticle
        drawBresenhamCircle(ctx, tx, ty, 14, primaryCol, 0.65);
        // Meteor tail & blazing core
        drawPixelLine(ctx, mx - 12, my - 28, mx, my, primaryCol, 3);
        drawPixelLine(ctx, mx - 8, my - 18, mx, my, PALETTE.bone, 1);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(mx - 3, my - 3, 6, 6);
      }
    }

    // 6. Draw Vespera's Orbital Ion Singularity / Valkyrie Swarm / Zenith Thunderhead World Effects
    if (this.ionSingularity) {
      const ion = this.ionSingularity;
      const zx = Math.round(ion.x - camX);
      const zy = Math.round(ion.y - camY);
      const rad = ion.radius;
      const vCount = ion.vertexCount || 5;
      const rot = -ion.elapsedMs * 0.0038;

      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.volt, 0.9);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.42), PALETTE.signal, 0.8);

      // Compute outer polygon vertices
      const verts = [];
      for (let i = 0; i < vCount; i++) {
        const a = rot + (i / vCount) * Math.PI * 2;
        verts.push({
          x: Math.round(zx + Math.cos(a) * rad),
          y: Math.round(zy + Math.sin(a) * rad),
        });
      }

      // Draw outer geometric polygon + internal star chords (pentagram / hexagram / octagram)
      const step = vCount >= 5 ? 2 : 1;
      for (let i = 0; i < vCount; i++) {
        const v1 = verts[i];
        const v2 = verts[(i + 1) % vCount];
        const vStar = verts[(i + step) % vCount];
        drawPixelLine(ctx, v1.x, v1.y, v2.x, v2.y, PALETTE.volt, 2);
        drawPixelLine(ctx, v1.x, v1.y, vStar.x, vStar.y, i % 2 === 0 ? PALETTE.bone : PALETTE.volt, 1);

        // Orbiting Vertex Drone Node
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(v1.x - 4, v1.y - 4, 8, 8);
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(v1.x - 3, v1.y - 3, 6, 6);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(v1.x - 1, v1.y - 1, 2, 2);
      }

      // Central orbital ion sky-beam + peripheral pillars
      ctx.fillStyle = PALETTE.volt;
      ctx.fillRect(zx - 10, 0, 20, zy);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(zx - 4, 0, 8, zy);

      for (const pil of ion.pillars) {
        const px = Math.round(pil.x - camX);
        const py = Math.round(pil.y - camY);
        const w = Math.max(4, Math.round(pil.width * (pil.life / pil.maxLife)));
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(px - Math.floor(w / 2), 0, w, py);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(px - Math.max(1, Math.floor(w / 4)), 0, Math.max(2, Math.floor(w / 2)), py);
        drawBresenhamCircle(ctx, px, py, 18, PALETTE.volt, 0.9);
      }
    }
  }

  drawImpactFrame(ctx, width, height, player, accessibility = {}) {
    if (!this.impactData) return;
    const data = this.impactData;
    const cam = data.camera;

    let sx = Math.round(width * 0.5);
    let sy = Math.round(height * 0.5);
    if (data.x !== undefined && data.y !== undefined && cam) {
      sx = Math.round(data.x - cam.renderX);
      sy = Math.round(data.y - cam.renderY);
    }

    ctx.save();

    const accent =
      data.color ||
      (player.classId === 'rook'
        ? PALETTE.brass
        : player.classId === 'ines'
        ? PALETTE.verdigris
        : player.classId === 'kaelen'
        ? PALETTE.ember
        : player.classId === 'vespera'
        ? PALETTE.volt
        : PALETTE.signal);

    // Multi-frame Sakuga polarity inversion:
    // Frame 1 (when reduceFlashes is off and total frames >= 2): Inverted Bone/Accent flash with Soot lines
    // Remaining frames: Stark Pitch Soot backdrop with blazing Bone & Accent speed lines + silhouettes
    const isInvertedPolarity =
      !accessibility?.reduceFlashes &&
      this.impactMaxFrames >= 2 &&
      this.impactFrames === this.impactMaxFrames;

    const bgCol = isInvertedPolarity ? PALETTE.bone : PALETTE.soot;
    const primaryLineCol = isInvertedPolarity ? PALETTE.soot : PALETTE.bone;
    const secondaryLineCol = accent;

    // 1. Stark Sakuga Backdrop
    ctx.fillStyle = bgCol;
    ctx.fillRect(0, 0, width, height);

    if (data.kind === 'rail') {
      // Archer Rail Slug / Long Count Impact Frame:
      // Properly angled 90px kinetic ionization corridor along Rook's exact aim vector + Mach cones
      const angle = data.angle || 0;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const nx = -sinA;
      const ny = cosA;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);

      // Angled 90px wide kinetic rail swath across the entire screen
      ctx.fillStyle = secondaryLineCol;
      ctx.fillRect(-40, -44, 620, 88);
      ctx.fillStyle = primaryLineCol;
      ctx.fillRect(-20, -22, 620, 44);
      ctx.fillStyle = isInvertedPolarity ? secondaryLineCol : '#FFFFFF';
      ctx.fillRect(-10, -7, 620, 14);
      ctx.restore();

      // High-contrast diagonal speed & lightning shear rays along firing vector
      for (let i = -7; i <= 7; i++) {
        const offset = i * 18;
        const x1 = sx + nx * offset - cosA * 120;
        const y1 = sy + ny * offset - sinA * 120;
        const x2 = sx + nx * offset + cosA * 520;
        const y2 = sy + ny * offset + sinA * 520;
        drawPixelLine(
          ctx,
          x1,
          y1,
          x2,
          y2,
          i % 2 === 0 ? primaryLineCol : secondaryLineCol,
          Math.abs(i) <= 2 ? 2 : 1
        );
      }

      // Concentric Mach shock cones at muzzle and downrange
      drawBresenhamCircle(ctx, sx, sy, 38, primaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 22, secondaryLineCol, 1.0);
      drawBresenhamCircle(
        ctx,
        Math.round(sx + cosA * 140),
        Math.round(sy + sinA * 140),
        52,
        primaryLineCol,
        1.0
      );
    } else if (data.kind === 'slashCut') {
      // Focused per-cut Sakuga cross-slash centered directly on the struck enemy
      const angle = data.angle || 0;
      const rays = 14;
      for (let r = 0; r < rays; r++) {
        const a = (r / rays) * Math.PI * 2 + (data.seed % 0.5);
        const len = 55 + (r % 3) * 65;
        const ex = Math.round(sx + Math.cos(a) * len);
        const ey = Math.round(sy + Math.sin(a) * len);
        drawPixelLine(ctx, sx, sy, ex, ey, r % 2 === 0 ? primaryLineCol : secondaryLineCol, r % 3 === 0 ? 2 : 1);
      }

      const slashLen = Math.max(width, height);
      const cx1 = sx - Math.cos(angle) * slashLen;
      const cy1 = sy - Math.sin(angle) * slashLen;
      const cx2 = sx + Math.cos(angle) * slashLen;
      const cy2 = sy + Math.sin(angle) * slashLen;
      drawPixelLine(ctx, cx1, cy1, cx2, cy2, secondaryLineCol, 5);
      drawPixelLine(ctx, cx1, cy1, cx2, cy2, primaryLineCol, 2);
      drawBresenhamCircle(ctx, sx, sy, 20, primaryLineCol, 1.0);
    } else if (data.kind === 'slashShatter' || data.kind === 'slash') {
      // Full-screen Seven Cuts / Nine Cuts Finale Shatter:
      // All accumulated cut lines blaze simultaneously across the viewport + horizon cleave
      for (let i = 0; i < this.cutAssignments.length; i++) {
        const c = this.cutAssignments[i];
        if (!c.target || !cam) continue;
        const tx = Math.round(c.target.x - cam.renderX);
        const ty = Math.round(c.target.y - cam.renderY);
        const len = 280;
        const x1 = tx - Math.cos(c.angle) * len;
        const y1 = ty - Math.sin(c.angle) * len;
        const x2 = tx + Math.cos(c.angle) * len;
        const y2 = ty + Math.sin(c.angle) * len;
        drawPixelLine(ctx, x1, y1, x2, y2, secondaryLineCol, 4);
        drawPixelLine(ctx, x1, y1, x2, y2, primaryLineCol, 2);
      }

      // 24 radial shatter rays from Sena
      for (let r = 0; r < 24; r++) {
        const a = (r / 24) * Math.PI * 2 + (data.seed % 0.4);
        const len = 90 + (r % 4) * 90;
        drawPixelLine(
          ctx,
          sx,
          sy,
          sx + Math.cos(a) * len,
          sy + Math.sin(a) * len,
          r % 2 === 0 ? primaryLineCol : secondaryLineCol,
          r % 4 === 0 ? 3 : 1
        );
      }

      // Horizon cleave through center
      const cutAngle = data.angle || -0.25;
      const slashLen = Math.max(width, height);
      drawPixelLine(
        ctx,
        sx - Math.cos(cutAngle) * slashLen,
        sy - Math.sin(cutAngle) * slashLen,
        sx + Math.cos(cutAngle) * slashLen,
        sy + Math.sin(cutAngle) * slashLen,
        primaryLineCol,
        5
      );
      drawBresenhamCircle(ctx, sx, sy, 34, secondaryLineCol, 1.0);
    } else if (data.kind === 'pierceVector') {
      const angle = data.angle || 0;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const nx = -sinA;
      const ny = cosA;
      for (let i = -5; i <= 5; i++) {
        const off = i * 14;
        drawPixelLine(
          ctx,
          sx + nx * off - cosA * 40,
          sy + ny * off - sinA * 40,
          sx + nx * off + cosA * 480,
          sy + ny * off + sinA * 480,
          i % 2 === 0 ? secondaryLineCol : primaryLineCol,
          i === 0 ? 3 : 2
        );
      }
      drawBresenhamCircle(ctx, sx, sy, 24, primaryLineCol, 1.0);
    } else if (data.kind === 'groundSlam') {
      // Sena Hold the Line Bastion Slam: vertical iron pillars + radial tectonic rings
      for (let pIdx = -4; pIdx <= 4; pIdx++) {
        const px = sx + pIdx * 36;
        drawPixelLine(ctx, px, 0, px, height, pIdx % 2 === 0 ? secondaryLineCol : primaryLineCol, Math.abs(pIdx) <= 1 ? 3 : 1);
      }
      for (let r = 0; r < 24; r++) {
        const a = (r / 24) * Math.PI * 2;
        const len = 70 + (r % 3) * 55;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len, r % 2 === 0 ? primaryLineCol : secondaryLineCol, 2);
      }
      drawBresenhamCircle(ctx, sx, sy, 64, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 32, primaryLineCol, 1.0);
    } else if (data.kind === 'mineBlast') {
      // Rook Dead Ground Minefield Grid Impact Frame
      drawBresenhamCircle(ctx, sx, sy, 90, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 48, primaryLineCol, 1.0);
      for (let r = 0; r < 20; r++) {
        const a = (r / 20) * Math.PI * 2;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * 180, sy + Math.sin(a) * 180, r % 2 === 0 ? primaryLineCol : secondaryLineCol, 2);
      }
    } else if (data.kind === 'explosion') {
      // Kaelen Sunfall Cataclysm / Tectonic Kiln Solar Supernova Impact Frame:
      // 8-pointed blazing solar cross + concentric thermobaric blast rings
      drawBresenhamCircle(ctx, sx, sy, 110, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 68, primaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 28, secondaryLineCol, 1.0);
      for (let r = 0; r < 28; r++) {
        const a = (r / 28) * Math.PI * 2;
        const len = r % 2 === 0 ? 260 : 140;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len, r % 2 === 0 ? primaryLineCol : secondaryLineCol, r % 4 === 0 ? 4 : 2);
      }
    } else if (data.kind === 'beam') {
      // Vespera Orbital Ion Singularity Impact Frame:
      // Towering vertical sky-to-ground ion pillar + geometric star matrix
      ctx.fillStyle = secondaryLineCol;
      ctx.fillRect(sx - 34, 0, 68, height);
      ctx.fillStyle = primaryLineCol;
      ctx.fillRect(sx - 16, 0, 32, height);
      drawBresenhamCircle(ctx, sx, sy, 96, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 52, primaryLineCol, 1.0);
      for (let r = 0; r < 16; r++) {
        const a = (r / 16) * Math.PI * 2;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * 220, sy + Math.sin(a) * 220, r % 2 === 0 ? primaryLineCol : secondaryLineCol, 2);
      }
    } else {
      // Ines Scrapfall / Crane Drop / Junkyard Rain Magnetic Crush Impact Frame:
      // Heavy vertical gravity streaks slamming into (sx, sy) + radial crater shockwave
      for (let k = -6; k <= 6; k++) {
        const vx = sx + k * 22;
        drawPixelLine(ctx, vx, 0, sx + k * 8, sy, k % 2 === 0 ? primaryLineCol : secondaryLineCol, Math.abs(k) <= 2 ? 3 : 1);
      }
      for (let r = 0; r < 22; r++) {
        const a = (r / 22) * Math.PI * 2;
        const len = 80 + ((r * 19) % 110);
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len, r % 2 === 0 ? secondaryLineCol : primaryLineCol, (r % 3 === 0) ? 2 : 1);
      }
      drawBresenhamCircle(ctx, sx, sy, 48, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 22, primaryLineCol, 1.0);
    }

    // 2. High-Contrast Sakuga Entity Silhouettes (Player + Nearby Enemies remain visibly posed inside the impact frame!)
    if (cam && player) {
      const px = Math.round(player.x - cam.renderX);
      const py = Math.round(player.y - cam.renderY);

      // Enemy silhouettes in high-contrast outline + solid fill
      if (this.lastSpawnerRef && Array.isArray(this.lastSpawnerRef.enemies)) {
        const enemies = this.lastSpawnerRef.enemies;
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (!e || !e.active || e.hp <= 0) continue;
          const ex = Math.round(e.x - cam.renderX);
          const ey = Math.round(e.y - cam.renderY);
          if (ex < -32 || ex > width + 32 || ey < -32 || ey > height + 32) continue;
          const er = Math.max(6, Math.round(e.radius || 10));
          ctx.fillStyle = secondaryLineCol;
          ctx.fillRect(ex - er - 1, ey - er - 1, er * 2 + 2, er * 2 + 2);
          ctx.fillStyle = isInvertedPolarity ? PALETTE.soot : PALETTE.bone;
          ctx.fillRect(ex - er + 1, ey - er + 1, er * 2 - 2, er * 2 - 2);
        }
      }

      // Player dramatic hero silhouette + glowing eye/weapon accent
      ctx.fillStyle = isInvertedPolarity ? PALETTE.soot : PALETTE.bone;
      ctx.fillRect(px - 6, py - 14, 12, 20);
      ctx.fillStyle = secondaryLineCol;
      ctx.fillRect(px - 4, py - 11, 8, 3);
    }

    ctx.restore();
  }

  drawScreenOverlay(ctx, width, height, player, settings = {}) {
    // 1. Sakuga Impact Frames (Stark high-contrast comic action frame with entity silhouettes)
    if (this.impactFrames > 0) {
      this.drawImpactFrame(ctx, width, height, player, settings);
      this.impactFrames--;
    }

    // 2. Letterbox bars (12% of 270px = 32px top & bottom)
    if (this.letterboxCurrent > 0.005) {
      const barH = Math.round(height * this.letterboxCurrent);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(0, 0, width, barH);
      ctx.fillRect(0, height - barH, width, barH);

      const accent =
        player.classId === 'rook'
          ? PALETTE.brass
          : player.classId === 'ines'
          ? PALETTE.verdigris
          : player.classId === 'kaelen'
          ? PALETTE.ember
          : player.classId === 'vespera'
          ? PALETTE.volt
          : PALETTE.signal;
      ctx.fillStyle = accent;
      ctx.fillRect(0, barH - 1, width, 1);
      ctx.fillRect(0, height - barH, width, 1);
    }

    // 3. Cut-in strip slamming in from the right + 8-direction speed lines + Code-drawn Pixel Title Card
    if (this.cutInActive) {
      const accent =
        player.classId === 'rook'
          ? PALETTE.brass
          : player.classId === 'ines'
          ? PALETTE.verdigris
          : player.classId === 'kaelen'
          ? PALETTE.ember
          : player.classId === 'vespera'
          ? PALETTE.volt
          : PALETTE.signal;

      const bannerY = 52;
      const bannerH = 48;
      const slideOffset = Math.round((1 - this.cutInProgress) * width);

      // Soot backing strip
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(0, bannerY - 3, width, bannerH + 6);
      ctx.fillStyle = accent;
      ctx.fillRect(0, bannerY - 3, width, 2);
      ctx.fillRect(0, bannerY + bannerH + 1, width, 2);

      // High-energy diagonal & horizontal speed lines across the cut-in strip
      for (let i = 0; i < 18; i++) {
        const ly = bannerY + ((i * 7) % bannerH);
        const lx = ((i * 53 - Math.round(this.elapsedMs * 1.3)) % width + width) % width;
        ctx.fillStyle = i % 3 === 0 ? accent : i % 2 === 0 ? PALETTE.bone : PALETTE.slag;
        ctx.fillRect(lx, ly, 32 + (i % 4) * 18, i % 4 === 0 ? 2 : 1);
      }

      // 64x16 eye cut-in scaled 3x -> 192x48 slamming in from the right
      const cutCanvas = spriteRegistry.getCutIn(player.classId);
      if (cutCanvas) {
        const cw = 64 * 3;
        const ch = 16 * 3;
        const cx = Math.round(width - cw - 24 + slideOffset);
        ctx.drawImage(cutCanvas, 0, 0, 64, 16, cx, bannerY, cw, ch);
      }

      // Code-drawn Pixel Title Card (class accent color on soot, never part of an image)
      const cardX = Math.round(18 + slideOffset * 0.5);
      const cardY = bannerY + 12;
      const titleStr = this.titleCardText || 'ULTIMATE';
      const cardW = Math.max(96, titleStr.length * 8 + 20);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(cardX, cardY, cardW, 24);
      ctx.fillStyle = accent;
      ctx.fillRect(cardX, cardY, cardW, 2);
      ctx.fillRect(cardX, cardY + 22, cardW, 2);
      ctx.fillRect(cardX, cardY, 2, 24);
      ctx.fillRect(cardX + cardW - 2, cardY, 2, 24);

      drawPixelText(
        ctx,
        titleStr,
        Math.round(cardX + cardW / 2),
        cardY + 8,
        accent,
        'center'
      );
    }

    // 4. One-time accessibility notice pointing to "Reduce flashes" & "Short ultimates" in settings
    if (this.firstCastNoticeTimer > 0 && !this.cutInActive) {
      const nw = 380;
      const nh = 22;
      const nx = Math.round((width - nw) / 2);
      const ny = 14;

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(nx, ny, nw, nh);
      ctx.fillStyle = PALETTE.slag;
      ctx.strokeRect(nx + 0.5, ny + 0.5, nw - 1, nh - 1);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(nx, ny, 3, nh);

      drawPixelText(
        ctx,
        'ACCESSIBILITY: "REDUCE FLASHES" & "SHORT ULTS" IN ESC OPTIONS',
        nx + 10,
        ny + 7,
        PALETTE.bone,
        'left'
      );
    }
  }
}

export default UltimateSequencer;
