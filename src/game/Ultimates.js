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
    this.craneDropState = null; // { x, y, radius, elapsedMs, durationMs, currentDropIndex, blocks: [...] }
    this.polarityVortex = null; // { x, y, radius, elapsedMs, durationMs, particles: [...] }

    // Kaelen Sunfall Cataclysm / Cathedral of Iron / Whiteout Rupture runtime state
    this.solarCataclysm = null; // { x, y, radius, elapsedMs, durationMs, rayCount, corrosiveRain, tectonicFissures, meteors: [...] }
    this.foundryCathedral = null; // { x, y, radius, elapsedMs, durationMs, pressY, pillars: [...] }
    this.cryoBlizzard = null; // { x, y, radius, elapsedMs, durationMs, fractalRings, iceNeedles: [...] }

    // Vespera Orbital Ion Singularity / Colossus Directive / Worldstorm Atlas runtime state
    this.ionSingularity = null; // { x, y, radius, elapsedMs, durationMs, vertexCount, thunderheadStorm, pillars: [...] }
    this.colossusState = null; // { x, y, radius, elapsedMs, durationMs, stage, sweepProgress, stompShockwave, hammerProgress }
    this.stormAtlas = null; // { x, y, radius, elapsedMs, durationMs, bolts: [...], supercellActive, radarAngle }

    // Sena Worldsplitter & Perfect Frequency runtime state
    this.worldsplitterState = null; // { x, y, radius, elapsedMs, durationMs, fissures: [...], spikes: [...], stage }
    this.soundstageState = null; // { x, y, radius, elapsedMs, durationMs, bars: 8, beat: 0, ribbonAngle: 0, rings: [] }

    // Rook Blackout Cascade runtime state
    this.relayPylonsState = null; // { x, y, radius, elapsedMs, durationMs, pylons: [...], gridActive, collapsing }

    // Continuous Flashy Ultimates runtime state
    this.meltdownState = null; // { active, timer, duration, slagTimer, flameTimer, venting, flameAngle, slagFootprints }
    this.armadaState = null; // { active, timer, duration, drones, zapTimer, laserTimer, diving, diveDrones, diveTarget, empTriggered }

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
    this.craneDropState = null;
    this.polarityVortex = null;
    this.solarCataclysm = null;
    this.foundryCathedral = null;
    this.cryoBlizzard = null;
    this.ionSingularity = null;
    this.colossusState = null;
    this.stormAtlas = null;
    this.meltdownState = null;
    this.armadaState = null;
    this.worldsplitterState = null;
    this.soundstageState = null;
    this.relayPylonsState = null;
  }

  getActiveUltimateDef(player) {
    if (!player) return ULTIMATES.sevenCuts;
    const forkChoice =
      typeof player.getSkillFork === 'function'
        ? player.getSkillFork(player.ultimateSlot)
        : null;
    return getActiveUltimateForPlayer(
      player.classId,
      player.ownedNodes,
      player.activeClassId,
      player.ultimateSlot,
      player.level || 1,
      forkChoice
    );
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
    if (this.chargePaused || this.active) return true;
    if (player && player.statuses && player.statuses.has('dugIn')) return true;
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
    // Counted for at most 3 enemies per cast (9.0 max charge gain per cast) so area skills cannot spike the meter
    if (enemyHitCountInThisCast > ULTIMATE_CHARGE_CONFIG.skillHitMaxEnemiesPerCast) {
      return 0;
    }
    const maxCastGain = ULTIMATE_CHARGE_CONFIG.skillCastMaxChargeGain || 9.0;
    const prevCastGain = (enemyHitCountInThisCast - 1) * ULTIMATE_CHARGE_CONFIG.skillHitGain;
    const allowedRaw = Math.max(0, Math.min(ULTIMATE_CHARGE_CONFIG.skillHitGain, maxCastGain - prevCastGain));
    if (allowedRaw <= 0) return 0;
    return this._applyChargeDelta(player, allowedRaw, true);
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

    // Recast handling during active continuous states (allows early finale trigger on [R])
    if (this.active) {
      if (this.armadaState && this.armadaState.active && !this.armadaState.diving) {
        this.triggerArmadaDiveBomb(player, worldMouseX, worldMouseY, spawner, projectiles, particles, camera, world);
        return true;
      }
      if (this.meltdownState && this.meltdownState.active && !this.meltdownState.venting) {
        this.triggerMeltdownVent(player, spawner, projectiles, particles, camera, world);
        return true;
      }
      return false;
    }

    // Not castable while stunned, lifted, or mid-cinematic
    if (
      player.statuses.has('stun') ||
      player.statuses.has('lifted') ||
      this.isCinematicActive()
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

    // Update Ines Crane Drop overhead gantry crane
    if (this.craneDropState) {
      this.craneDropState.elapsedMs += dt * 1000;
      for (let i = this.craneDropState.blocks.length - 1; i >= 0; i--) {
        const blk = this.craneDropState.blocks[i];
        blk.life -= dt;
        if (blk.life <= 0) {
          this.craneDropState.blocks.splice(i, 1);
        }
      }
      if (this.craneDropState.elapsedMs >= this.craneDropState.durationMs) {
        this.craneDropState = null;
      }
    }

    // Update Ines Zero-Point Reversal polarity vortex
    if (this.polarityVortex) {
      this.polarityVortex.elapsedMs += dt * 1000;
      for (const pt of this.polarityVortex.particles) {
        pt.angle += pt.speed * dt;
      }
      if (this.polarityVortex.elapsedMs >= this.polarityVortex.durationMs) {
        this.polarityVortex = null;
      }
    }

    // Update Kaelen Foundry Cathedral (press descend and lava lake)
    if (this.foundryCathedral) {
      this.foundryCathedral.elapsedMs += dt * 1000;
      if (!this.foundryCathedral.pressSlammed) {
        this.foundryCathedral.pressY = Math.min(0, this.foundryCathedral.pressY + dt * 120);
      }
      if (this.foundryCathedral.elapsedMs >= this.foundryCathedral.durationMs) {
        this.foundryCathedral = null;
      }
    }

    // Update Kaelen Cryo Blizzard (ice needles growth and frost mist)
    if (this.cryoBlizzard) {
      this.cryoBlizzard.elapsedMs += dt * 1000;
      for (const needle of this.cryoBlizzard.iceNeedles) {
        needle.grown = Math.min(1, needle.grown + dt * 2.5);
      }
      if (this.cryoBlizzard.elapsedMs >= this.cryoBlizzard.durationMs) {
        this.cryoBlizzard = null;
      }
    }

    // Update Vespera Colossus Automaton
    if (this.colossusState) {
      this.colossusState.elapsedMs += dt * 1000;
      if (this.colossusState.stage === 'sweep') {
        this.colossusState.sweepAngle += dt * 8.0;
      }
      if (this.colossusState.elapsedMs >= this.colossusState.durationMs) {
        this.colossusState = null;
      }
    }

    // Update Vespera Worldstorm Atlas
    if (this.stormAtlas) {
      this.stormAtlas.elapsedMs += dt * 1000;
      this.stormAtlas.radarAngle = (this.stormAtlas.radarAngle + dt * 3.8) % (Math.PI * 2);
      for (let i = this.stormAtlas.bolts.length - 1; i >= 0; i--) {
        const b = this.stormAtlas.bolts[i];
        b.life -= dt;
        if (b.life <= 0) {
          this.stormAtlas.bolts.splice(i, 1);
        }
      }
      if (this.stormAtlas.elapsedMs >= this.stormAtlas.durationMs) {
        this.stormAtlas = null;
      }
    }

    // Update Sena Worldsplitter (faultline tremor & magma glow)
    if (this.worldsplitterState) {
      this.worldsplitterState.elapsedMs += dt * 1000;
      if (this.worldsplitterState.elapsedMs >= this.worldsplitterState.durationMs) {
        this.worldsplitterState = null;
      }
    }

    // Update Sena Soundstage (equalizer bar pulse & spinning ribbons)
    if (this.soundstageState) {
      this.soundstageState.elapsedMs += dt * 1000;
      this.soundstageState.ribbonAngle = (this.soundstageState.ribbonAngle + dt * 4.2) % (Math.PI * 2);
      for (let i = this.soundstageState.rings.length - 1; i >= 0; i--) {
        const r = this.soundstageState.rings[i];
        r.rad += dt * 180;
        r.life -= dt;
        if (r.life <= 0) {
          this.soundstageState.rings.splice(i, 1);
        }
      }
      if (this.soundstageState.elapsedMs >= this.soundstageState.durationMs) {
        this.soundstageState = null;
      }
    }

    // Update Rook Blackout Cascade (Tesla pylon discharge & laser wires)
    if (this.relayPylonsState) {
      this.relayPylonsState.elapsedMs += dt * 1000;
      if (this.relayPylonsState.elapsedMs >= this.relayPylonsState.durationMs) {
        this.relayPylonsState = null;
      }
    }

    // 7. Update Kaelen's continuous Supercritical Meltdown (molten slag footsteps & flame torrent)
    if (this.meltdownState) {
      const ms = this.meltdownState;

      // Update lingering molten slag footprints regardless of active flag
      for (let i = ms.slagFootprints.length - 1; i >= 0; i--) {
        const fp = ms.slagFootprints[i];
        fp.life -= dt;
        fp.tickTimer -= dt;
        if (fp.tickTimer <= 0) {
          fp.tickTimer = 0.16;
          if (spawner && typeof spawner.queryRadius === 'function' && player) {
            const near = spawner.queryRadius(fp.x, fp.y, fp.radius + 16);
            for (const e of near) {
              if (!e.active || e.hp <= 0) continue;
              if (Math.hypot(e.x - fp.x, e.y - fp.y) <= fp.radius + (e.radius || 12)) {
                e.takeDamage(Math.max(1, Math.round(player.atk * 0.35)), 0, 0, false, player, spawner, particles, camera);
                if (e.active && e.hp > 0) {
                  e.statuses.apply('slow', { duration: 1.5, value: 0.40, sourceName: 'Molten Slag' }, e, particles);
                  e.statuses.apply('burn', { duration: 2.5, sourceAtk: player.atk * 0.5, sourceName: 'Molten Slag' }, e, particles);
                }
              }
            }
          }
        }
        if (fp.life <= 0) {
          ms.slagFootprints.splice(i, 1);
        }
      }

      if (ms.active && !ms.venting && player) {
        ms.timer -= dt;

        // Keep boiler pressure pegged to 200 during meltdown
        if (player.classBehavior && player.classBehavior.pressure !== undefined) {
          player.classBehavior.pressure = 200;
        }

        // Track cursor aimAngle
        if (input && input.worldMouseX !== undefined && input.worldMouseY !== undefined) {
          const ang = Math.atan2(input.worldMouseY - player.y, input.worldMouseX - player.x);
          if (Number.isFinite(ang)) ms.flameAngle = ang;
        } else {
          ms.flameAngle = player.facingX >= 0 ? 0 : Math.PI;
        }

        // Footprint slag pools: drop every 0.16s
        ms.slagTimer -= dt;
        if (ms.slagTimer <= 0) {
          ms.slagTimer = 0.16;
          ms.slagFootprints.push({
            x: player.x,
            y: player.y + 4,
            radius: 28,
            life: 3.5,
            maxLife: 3.5,
            tickTimer: 0.12,
          });
          if (particles) {
            particles.spawnBurst(player.x, player.y + 4, 3, PALETTE.ember, 10, 45, 1, 0.2);
          }
        }

        // Roaring Flamethrower Jet: continuous 160px cone damage every 0.08s
        ms.flameTimer -= dt;
        if (ms.flameTimer <= 0) {
          ms.flameTimer = 0.08;
          const flameReach = 160;
          const halfArc = 0.52; // ~30 deg

          if (spawner && typeof spawner.queryRadius === 'function') {
            const targets = spawner.queryRadius(player.x, player.y, flameReach + 24);
            for (const e of targets) {
              if (!e.active || e.hp <= 0) continue;
              const dx = e.x - player.x;
              const dy = e.y - player.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 0 && dist <= flameReach + (e.radius || 12)) {
                const angDiff = Math.abs(Math.atan2(dy, dx) - ms.flameAngle);
                const normDiff = Math.atan2(Math.sin(angDiff), Math.cos(angDiff));
                if (Math.abs(normDiff) <= halfArc) {
                  const pipe = computeDamagePipeline({
                    baseDamage: player.baseAtkForPipeline * 0.45,
                    atkBuffPct: this._getUltimateAtkBuffPct(player),
                    isCrit: false,
                    critMult: 1.0,
                    targetStatuses: e.statuses,
                    targetBaseDef: e.def || 0,
                    sourceName: 'Supercritical Meltdown',
                    targetName: e.name,
                  });
                  e.takeDamage(pipe.finalDamage, ms.flameAngle, 30, false, player, spawner, particles, camera);
                  if (e.active && e.hp > 0) {
                    e.statuses.apply('burn', { duration: 4.0, sourceAtk: player.atk * 0.8, sourceName: 'Supercritical Meltdown' }, e, particles);
                  }
                }
              }
            }
          }

          if (particles) {
            const sprayDist = 35 + Math.random() * (flameReach - 35);
            const sprayAng = ms.flameAngle + (Math.random() - 0.5) * halfArc;
            const fx = player.x + Math.cos(sprayAng) * sprayDist;
            const fy = player.y + Math.sin(sprayAng) * sprayDist;
            particles.spawnBurst(fx, fy, 2, Math.random() > 0.4 ? PALETTE.ember : PALETTE.brass, 15, 60, 2, 0.22);
          }
        }

        if (ms.timer <= 0) {
          this.triggerMeltdownVent(player, spawner, projectiles, particles, camera, world);
        }
      }
    }

    // 8. Update Vespera's continuous Overclocked Armada (12 orbiting drones, point-defense, dual lasers)
    if (this.armadaState && player) {
      const arm = this.armadaState;

      if (arm.active) {
        arm.timer -= dt;

        // Rotate orbiting drones
        for (let i = 0; i < arm.drones.length; i++) {
          const d = arm.drones[i];
          d.angle += d.speed * dt;
          d.x = player.x + Math.cos(d.angle) * d.radius;
          d.y = player.y - 6 + Math.sin(d.angle) * (d.radius * 0.65);
        }

        // Point-Defense System: auto-zaps incoming enemy projectiles within 145px every 0.12s
        arm.zapTimer -= dt;
        if (arm.zapTimer <= 0 && projectiles && Array.isArray(projectiles.pool)) {
          arm.zapTimer = 0.12;
          for (let i = 0; i < projectiles.pool.length; i++) {
            const pr = projectiles.pool[i];
            if (!pr.active || pr.isPlayer) continue;
            const distToPlayer = Math.hypot(pr.x - player.x, pr.y - player.y);
            if (distToPlayer <= 145) {
              pr.active = false;
              let closestDrone = arm.drones[0];
              let minDist = 9999;
              for (const d of arm.drones) {
                const dd = Math.hypot(d.x - pr.x, d.y - pr.y);
                if (dd < minDist) {
                  minDist = dd;
                  closestDrone = d;
                }
              }
              if (particles) {
                particles.spawnLaserBeam(closestDrone.x, closestDrone.y, pr.x, pr.y, PALETTE.volt, 0.12);
                particles.spawnShockwave(pr.x, pr.y, 22, PALETTE.volt, 0.16);
                particles.spawnBurst(pr.x, pr.y, 6, PALETTE.signal, 30, 95, 1, 0.2);
              }
              sound.playHitMetal();
              break;
            }
          }
        }

        // Twin Neon Laser Saturation: fires continuous tracer beams locking onto targets near cursor
        arm.laserTimer -= dt;
        if (arm.laserTimer <= 0) {
          arm.laserTimer = 0.08;
          const targetPointX = (input && input.worldMouseX !== undefined) ? input.worldMouseX : player.x;
          const targetPointY = (input && input.worldMouseY !== undefined) ? input.worldMouseY : player.y;

          if (spawner && typeof spawner.queryRadius === 'function') {
            const nearbyEnemies = spawner.queryRadius(targetPointX, targetPointY, 260)
              .filter((e) => e && e.active && e.hp > 0)
              .sort((a, b) => Math.hypot(a.x - targetPointX, a.y - targetPointY) - Math.hypot(b.x - targetPointX, b.y - targetPointY));

            const targets = nearbyEnemies.slice(0, 2);
            arm.activeLaserTargets = [];
            for (let ti = 0; ti < targets.length; ti++) {
              const tgt = targets[ti];
              const drone = arm.drones[(ti * 3 + Math.floor(this.elapsedMs * 0.01)) % arm.drones.length];
              arm.activeLaserTargets.push({
                fromX: drone.x,
                fromY: drone.y,
                toX: tgt.x,
                toY: tgt.y,
                color: ti === 0 ? PALETTE.volt : PALETTE.signal,
              });

              const pipe = computeDamagePipeline({
                baseDamage: player.baseAtkForPipeline * 0.32,
                atkBuffPct: this._getUltimateAtkBuffPct(player),
                isCrit: false,
                critMult: 1.0,
                targetStatuses: tgt.statuses,
                targetBaseDef: tgt.def || 0,
                sourceName: 'Overclocked Armada',
                targetName: tgt.name,
              });
              tgt.takeDamage(pipe.finalDamage, Math.atan2(tgt.y - drone.y, tgt.x - drone.x), 15, false, player, spawner, particles, camera);
              if (tgt.active && tgt.hp > 0) {
                tgt.statuses.apply('marked', { duration: 3.0, sourceName: 'Overclocked Armada' }, tgt, particles);
              }
              if (particles) {
                particles.spawnBurst(tgt.x, tgt.y, 1, PALETTE.volt, 10, 50, 1, 0.15);
              }
            }
          }
        }

        // Dive-bomb cluster animation & progression
        if (arm.diving) {
          let allImpacted = true;
          for (let i = 0; i < arm.diveDrones.length; i++) {
            const dd = arm.diveDrones[i];
            if (dd.impacted) continue;
            allImpacted = false;
            dd.progress += dt / Math.max(0.05, dd.duration);
            if (dd.progress >= 1) {
              dd.progress = 1;
              dd.impacted = true;
              if (camera) camera.shake(4, 0.10);
              if (particles) {
                particles.spawnShockwave(dd.targetX, dd.targetY, 38, PALETTE.volt, 0.2);
                particles.spawnBurst(dd.targetX, dd.targetY, 8, PALETTE.volt, 25, 110, 2, 0.25);
              }
              if (spawner && typeof spawner.queryRadius === 'function') {
                const near = spawner.queryRadius(dd.targetX, dd.targetY, 45);
                for (const e of near) {
                  if (e.active && e.hp > 0) {
                    e.takeDamage(Math.max(1, Math.round(player.atk * 0.50)), 0, 25, false, player, spawner, particles, camera);
                  }
                }
              }
            }
          }

          if (allImpacted && !arm.empTriggered) {
            arm.empTriggered = true;
            this.detonateArmadaEmp(player, arm.diveTarget.x, arm.diveTarget.y, spawner, particles, camera, world);
          }
        }

        if (arm.timer <= 0 && !arm.diving) {
          const tx = (input && input.worldMouseX !== undefined) ? input.worldMouseX : player.x;
          const ty = (input && input.worldMouseY !== undefined) ? input.worldMouseY : player.y;
          this.triggerArmadaDiveBomb(player, tx, ty, spawner, projectiles, particles, camera, world);
        }
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

        // Section 4.1 Class Capstone runtime effects on Ultimate cast:
        const treeNodes = player.treeNodes || {};
        // 1. Sena — Limitless Echo: refund 35% of active skill cooldowns and grant +20% Attack Speed for 4s
        if (player.classId === 'sena' && treeNodes['sena:class:capstone-center']) {
          if (player.cooldowns) {
            for (const k of Object.keys(player.cooldowns)) {
              if (player.cooldowns[k] > 0) {
                player.cooldowns[k] = Math.max(0, +(player.cooldowns[k] * 0.65).toFixed(2));
              }
            }
          }
          player.statuses.apply('haste', { duration: 4.0, value: 0.20, sourceName: 'Limitless Echo' }, player, particles);
        }
        // 2. Ines — Colossus Magnet: pull enemies within 260px inward by 80px and grant +25% scrap damage for 6s
        if (player.classId === 'ines' && treeNodes['ines:class:capstone-center']) {
          if (spawner && typeof spawner.queryRadius === 'function') {
            const near = spawner.queryRadius(player.x, player.y, 260);
            for (const e of near) {
              if (!e.active || e.hp <= 0 || e.tier === 'boss') continue;
              const ang = Math.atan2(player.y - e.y, player.x - e.x);
              e.x = player.clampCoord(e.x + Math.cos(ang) * 80);
              e.y = player.clampCoord(e.y + Math.sin(ang) * 80);
            }
          }
          player.statuses.apply('colossusMagnetBuff', { duration: 6.0, atkBonus: 0.25, sourceName: 'Colossus Magnet' }, player, particles);
        }
        // 3. Kaelen — Reactor Core: vent 360° steam for 180% ATK, cleanse 1 debuff, and grant +20% Burn/Corrode damage for 6s
        if (player.classId === 'kaelen' && treeNodes['kaelen:class:capstone-center']) {
          player.statuses.cleanseAllDebuffs?.();
          player.statuses.apply('reactorCoreBuff', { duration: 6.0, atkBonus: 0.20, sourceName: 'Reactor Core' }, player, particles);
          if (particles) {
            particles.spawnShockwave(player.x, player.y, 160, PALETTE.ember, 0.28);
          }
          if (spawner && typeof spawner.queryRadius === 'function') {
            const near = spawner.queryRadius(player.x, player.y, 160);
            for (const e of near) {
              if (!e.active || e.hp <= 0) continue;
              e.takeDamage(Math.max(1, Math.round(player.atk * 1.8)), Math.atan2(e.y - player.y, e.x - player.x), 80, false, player, spawner, particles, camera);
            }
          }
        }
        // 4. Vespera — Swarm Singularity: deploy 1 bonus temporary Arc-Drone for 6s and +25% drone fire rate
        if (player.classId === 'vespera' && treeNodes['vespera:class:capstone-center']) {
          player.statuses.apply('swarmSingularityBuff', { duration: 6.0, fireRateMult: 1.25, bonusDrones: 1, sourceName: 'Swarm Singularity' }, player, particles);
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
        const boneCount = p.classFlourish?.boneDebrisCount || 8;
        if (particles) {
          particles.spawnShockwave(player.x, player.y, 120, PALETTE.bone, 0.28);
          particles.spawnDebris(player.x, player.y, 'shardBone', boneCount);
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

      case 'senaRainOfSwords': {
        // Nine Cuts Tier 3/4 finisher: Rain of Swords radial barrage (12 falling phantom blades across 220px)
        const rad = p.radius || 220;
        const bladeCount = p.bladeCount || 12;
        const zx = player.x;
        const zy = player.y;

        sound.playUltimateReleaseCrack();
        if (camera) {
          camera.shake(p.shakePx || 11, 0.26);
        }

        this.slamStreaks.push({
          x: zx,
          y: zy,
          radius: rad,
          life: 0.34,
          maxLife: 0.34,
          color: PALETTE.blood,
        });

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.blood, 0.35);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.55), PALETTE.signal, 0.25);
          for (let b = 0; b < bladeCount; b++) {
            const a = (b / bladeCount) * Math.PI * 2;
            const d = 35 + ((b * 37) % Math.max(40, rad - 35));
            const bx = zx + Math.cos(a) * d;
            const by = zy + Math.sin(a) * d;
            particles.spawnCrossCutFlash?.(bx, by);
            particles.spawnDirectionalSparks?.(bx, by, -Math.PI * 0.5, 0.6, 4, PALETTE.signal);
          }
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 28)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 1.80),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Rain of Swords',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 110, false, player, spawner, particles, camera);
            if (p.applyBleed && e.active && e.hp > 0) {
              e.statuses.apply('bleed', { duration: 4.0, sourceAtk: player.atk, sourceName: 'Rain of Swords' }, e, particles);
            }
          }
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

      case 'inesDeployGantryCrane': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 170;
        this.craneDropState = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 8000,
          currentDropIndex: 0,
          blocks: [],
        };
        sound.playUltimateStart();
        break;
      }

      case 'inesGantryCraneDrop': {
        const rad = p.radius || 170;
        const zx = this.craneDropState ? this.craneDropState.x : player.x;
        const zy = this.craneDropState ? this.craneDropState.y : player.y;
        const wave = p.waveIndex || 1;

        if (this.craneDropState) {
          this.craneDropState.currentDropIndex = wave;
          this.craneDropState.blocks.push({
            x: zx + (wave === 1 ? -28 : wave === 2 ? 28 : 0),
            y: zy,
            radius: rad,
            life: 0.55,
            maxLife: 0.55,
          });
        }

        sound.playHitMetal();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 7, 0.22);

        this.slamStreaks.push({
          x: zx,
          y: zy,
          radius: rad,
          life: 0.38,
          maxLife: 0.38,
          color: PALETTE.verdigris,
        });

        if (particles) {
          particles.spawnGroundBreakEffect(zx, zy, rad);
          particles.spawnShockwave(zx, zy, rad, PALETTE.verdigris, 0.32);
          particles.spawnDebris(zx, zy, 'canLid', 6);
          particles.spawnDebris(zx, zy, 'shardRust', 6);
          if (p.spawnCrater && particles.spawnCraterDecal) {
            particles.spawnCraterDecal(zx, zy, Math.min(85, Math.round(rad * 0.45)));
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
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 2.0),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Crane Drop',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 160, false, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Crane Drop' }, e, particles);
            }
          }
        }
        break;
      }

      case 'inesDeployPolarityVortex': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 270;
        this.polarityVortex = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1550,
          particles: [],
        };
        for (let i = 0; i < 32; i++) {
          const a = (i / 32) * Math.PI * 2;
          this.polarityVortex.particles.push({
            angle: a,
            distRatio: 0.28 + (i % 5) * 0.14,
            speed: (i % 2 === 0 ? 1 : -1) * (2.8 + (i % 3) * 0.8),
            polarity: i % 2 === 0 ? '+' : '-',
            color: i % 2 === 0 ? PALETTE.signal : PALETTE.verdigris,
          });
        }
        sound.playUltimateStart();
        break;
      }

      case 'inesPolarityPulse': {
        const rad = p.radius || 260;
        const zx = this.polarityVortex ? this.polarityVortex.x : player.x;
        const zy = this.polarityVortex ? this.polarityVortex.y : player.y;

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 6, 0.16);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.verdigris, 0.28);
          particles.spawnBurst(zx, zy, 20, PALETTE.verdigris, 40, 160, 2, 0.30);
          particles.spawnBurst(zx, zy, 14, PALETTE.signal, 30, 130, 2, 0.25);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          const dist = Math.hypot(e.x - zx, e.y - zy);
          if (dist <= rad + (e.radius || 12)) {
            if (p.pullInwardPx > 0 && e.tier !== 'boss' && dist > 14) {
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
              sourceName: 'Zero-Point Reversal',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(zy - e.y, zx - e.x), 45, false, player, spawner, particles, camera);
            if (e.active && e.hp > 0) {
              e.statuses.apply('marked', { duration: 5.0, sourceName: 'Zero-Point Reversal' }, e, particles);
            }
          }
        }
        break;
      }

      case 'inesPolarityInversionBurst': {
        const rad = p.radius || 270;
        const zx = this.polarityVortex ? this.polarityVortex.x : player.x;
        const zy = this.polarityVortex ? this.polarityVortex.y : player.y;

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 12, 0.32);
        if (p.spawnCrater && world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.verdigris, 0.40);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.6), PALETTE.bone, 0.25);
          particles.spawnBurst(zx, zy, 34, PALETTE.verdigris, 60, 220, 3, 0.45);
          particles.spawnBurst(zx, zy, 24, PALETTE.signal, 50, 180, 2, 0.35);
          particles.spawnDebris(zx, zy, 'canLid', 8);
          particles.spawnDebris(zx, zy, 'shardRust', 8);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 4.4),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Zero-Point Reversal',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 220, false, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Zero-Point Reversal' }, e, particles);
            }
          }
        }
        this.polarityVortex = null;
        break;
      }

      case 'kaelenDeployFoundryRibs': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 260;
        this.foundryCathedral = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1550,
          pressY: -160,
          pressTargetY: 0,
          pressSlammed: false,
          pillars: [
            { x: player.x - rad * 0.65, y: player.y - rad * 0.55 },
            { x: player.x + rad * 0.65, y: player.y - rad * 0.55 },
            { x: player.x + rad * 0.65, y: player.y + rad * 0.55 },
            { x: player.x - rad * 0.65, y: player.y + rad * 0.55 },
          ],
        };
        if (p.grantMoltenJuggernaut) {
          player.statuses.apply('moltenJuggernaut', { duration: 8.0, sourceName: 'Cathedral of Iron' }, player, particles);
        }
        sound.playUltimateStart();
        if (camera) camera.shake(6, 0.18);
        if (particles) {
          for (const pil of this.foundryCathedral.pillars) {
            particles.spawnGroundBreakEffect(pil.x, pil.y, 40);
            particles.spawnSparks(pil.x, pil.y, 10, PALETTE.ember);
          }
        }
        break;
      }

      case 'kaelenFoundryRibPulse': {
        const rad = p.radius || 250;
        const zx = this.foundryCathedral ? this.foundryCathedral.x : player.x;
        const zy = this.foundryCathedral ? this.foundryCathedral.y : player.y;

        sound.playExplosion();
        if (camera) camera.shake(p.shakePx || 8, 0.20);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.ember, 0.32);
          particles.spawnBurst(zx, zy, 26, PALETTE.ember, 50, 175, 3, 0.35);
          particles.spawnBurst(zx, zy, 16, PALETTE.brass, 40, 150, 2, 0.28);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 2.2),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Cathedral of Iron',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 80, false, player, spawner, particles, camera);
            if (e.active && e.hp > 0) {
              e.statuses.apply('burn', { duration: p.burnDuration || 6.0, sourceAtk: player.atk * 1.5, sourceName: 'Cathedral of Iron' }, e, particles);
            }
          }
        }
        break;
      }

      case 'kaelenFoundryPressSlam': {
        const rad = p.radius || 260;
        const zx = this.foundryCathedral ? this.foundryCathedral.x : player.x;
        const zy = this.foundryCathedral ? this.foundryCathedral.y : player.y;

        if (this.foundryCathedral) {
          this.foundryCathedral.pressSlammed = true;
          this.foundryCathedral.pressY = 0;
        }

        sound.playUltimateReleaseCrack();
        if (typeof sound.playExplosion === 'function') sound.playExplosion();
        if (camera) camera.shake(p.shakePx || 14, 0.38);

        if (p.spawnCrater && world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        if (particles) {
          particles.spawnGroundBreakEffect(zx, zy, rad);
          particles.spawnShockwave(zx, zy, rad, PALETTE.ember, 0.45);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.65), PALETTE.brass, 0.30);
          particles.spawnBurst(zx, zy, 40, PALETTE.ember, 60, 240, 3, 0.50);
          particles.spawnBurst(zx, zy, 25, PALETTE.bone, 50, 190, 2, 0.40);
        }

        if (player.classId === 'kaelen' && player.classBehavior && Array.isArray(player.classBehavior.pools)) {
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            player.classBehavior.pools.push({
              x: player.clampCoord(zx + Math.cos(a) * (rad * 0.4)),
              y: player.clampCoord(zy + Math.sin(a) * (rad * 0.4)),
              radius: 75,
              life: 8.0,
              maxLife: 8.0,
              tickTimer: 0.15,
              kind: 'magma',
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
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 4.0),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Cathedral of Iron',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 220, false, player, spawner, particles, camera);
            if (e.active && e.hp > 0) {
              if (p.stunDuration > 0) {
                e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Cathedral of Iron' }, e, particles);
              }
              e.statuses.apply('burn', { duration: p.burnDuration || 8.0, sourceAtk: player.atk * 1.8, sourceName: 'Cathedral of Iron' }, e, particles);
            }
          }
        }
        break;
      }

      case 'kaelenDeployCryoBlizzard': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 270;
        const frostCol = PALETTE.frost || PALETTE.signal;
        this.cryoBlizzard = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1550,
          fractalRings: [0.35, 0.65, 1.0],
          iceNeedles: [],
        };
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2 + (i % 3) * 0.3;
          const dist = 30 + (i * 27) % (rad - 30);
          this.cryoBlizzard.iceNeedles.push({
            x: player.clampCoord(player.x + Math.cos(a) * dist),
            y: player.clampCoord(player.y + Math.sin(a) * dist),
            h: 12 + (i % 4) * 6,
            grown: 0,
          });
        }
        sound.playUltimateStart();
        if (particles) {
          particles.spawnShockwave(player.x, player.y, rad, frostCol, 0.28);
          particles.spawnBurst(player.x, player.y, 20, frostCol, 30, 120, 2, 0.3);
        }
        break;
      }

      case 'kaelenCryoFractalPulse': {
        const rad = p.radius || 260;
        const zx = this.cryoBlizzard ? this.cryoBlizzard.x : player.x;
        const zy = this.cryoBlizzard ? this.cryoBlizzard.y : player.y;
        const frostCol = PALETTE.frost || PALETTE.signal;

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 7, 0.18);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, frostCol, 0.32);
          particles.spawnBurst(zx, zy, 25, frostCol, 45, 160, 2, 0.32);
          particles.spawnBurst(zx, zy, 15, PALETTE.bone, 35, 130, 2, 0.25);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 28)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          const dist = Math.hypot(e.x - zx, e.y - zy);
          if (dist <= rad + (e.radius || 12)) {
            if (p.pullInwardPx > 0 && e.tier !== 'boss' && dist > 14) {
              const pullAng = Math.atan2(zy - e.y, zx - e.x);
              e.x = player.clampCoord(e.x + Math.cos(pullAng) * p.pullInwardPx);
              e.y = player.clampCoord(e.y + Math.sin(pullAng) * p.pullInwardPx);
            }
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 2.5),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Whiteout Rupture',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(zy - e.y, zx - e.x), 40, false, player, spawner, particles, camera);
            if (e.active && e.hp > 0) {
              e.statuses.apply('slow', { duration: 4.0, value: 0.50, sourceName: 'Whiteout Rupture' }, e, particles);
              const brittleCount = p.brittleStacks || 3;
              for (let b = 0; b < brittleCount; b++) {
                e.statuses.apply('corrode', { duration: 6.0, sourceName: 'Whiteout Brittle' }, e, particles);
              }
              if (p.freezeDuration > 0) {
                e.statuses.apply('stun', { duration: p.freezeDuration, sourceName: 'Whiteout Freeze' }, e, particles);
              }
            }
          }
        }
        break;
      }

      case 'kaelenCryoShrapnelBurst': {
        const rad = p.radius || 270;
        const zx = this.cryoBlizzard ? this.cryoBlizzard.x : player.x;
        const zy = this.cryoBlizzard ? this.cryoBlizzard.y : player.y;
        const frostCol = PALETTE.frost || PALETTE.signal;

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 12, 0.35);

        if (p.spawnCrater && world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, frostCol, 0.42);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.6), PALETTE.bone, 0.28);
          particles.spawnBurst(zx, zy, 40, frostCol, 60, 230, 3, 0.48);
          particles.spawnBurst(zx, zy, 25, PALETTE.bone, 50, 180, 2, 0.38);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 4.0),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Whiteout Rupture',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 190, false, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Whiteout Rupture' }, e, particles);
            }
          }
        }
        this.cryoBlizzard = null;
        break;
      }

      case 'vesperaSpawnColossus': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 270;
        this.colossusState = {
          x: player.x,
          y: player.y - 12,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1580,
          stage: 'descend',
          sweepAngle: -Math.PI * 0.75,
          sweepProgress: 0,
          stompShockwave: 0,
          hammerProgress: 0,
        };
        sound.playUltimateStart();
        if (camera) camera.shake(5, 0.15);
        if (particles) {
          particles.spawnBurst(player.x, player.y - 12, 16, PALETTE.volt, 40, 140, 2, 0.25);
        }
        break;
      }

      case 'vesperaColossusFistSweep': {
        const rad = p.radius || 240;
        const zx = this.colossusState ? this.colossusState.x : player.x;
        const zy = this.colossusState ? this.colossusState.y : player.y;

        if (this.colossusState) {
          this.colossusState.stage = 'sweep';
          this.colossusState.sweepProgress = 1;
        }

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 8, 0.20);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.volt, 0.32);
          particles.spawnBurst(zx, zy, 25, PALETTE.volt, 50, 180, 3, 0.32);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 2.2),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Colossus Directive',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 140, false, player, spawner, particles, camera);
          }
        }
        break;
      }

      case 'vesperaColossusStomp': {
        const rad = p.radius || 250;
        const zx = this.colossusState ? this.colossusState.x : player.x;
        const zy = this.colossusState ? this.colossusState.y : player.y;

        if (this.colossusState) {
          this.colossusState.stage = 'stomp';
          this.colossusState.stompShockwave = 1;
        }

        sound.playHitMetal();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 9, 0.22);
        if (particles) {
          particles.spawnGroundBreakEffect(zx, zy, rad * 0.7);
          particles.spawnShockwave(zx, zy, rad, PALETTE.volt, 0.35);
          particles.spawnBurst(zx, zy, 28, PALETTE.volt, 60, 190, 2, 0.35);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 2.4),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Colossus Directive',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 160, false, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Colossus Directive' }, e, particles);
            }
          }
        }
        break;
      }

      case 'vesperaColossusGrandSlam': {
        const rad = p.radius || 270;
        const zx = this.colossusState ? this.colossusState.x : player.x;
        const zy = this.colossusState ? this.colossusState.y : player.y;

        if (this.colossusState) {
          this.colossusState.stage = 'grandSlam';
          this.colossusState.hammerProgress = 1;
        }

        sound.playUltimateReleaseCrack();
        if (typeof sound.playExplosion === 'function') sound.playExplosion();
        if (camera) camera.shake(p.shakePx || 14, 0.38);

        if (p.spawnCrater && world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        if (particles) {
          particles.spawnGroundBreakEffect(zx, zy, rad);
          particles.spawnShockwave(zx, zy, rad, PALETTE.volt, 0.44);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.55), PALETTE.bone, 0.28);
          particles.spawnBurst(zx, zy, 40, PALETTE.volt, 70, 240, 3, 0.50);
          particles.spawnBurst(zx, zy, 25, PALETTE.signal, 50, 190, 2, 0.38);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 4.2),
              atkBuffPct,
              isCrit: true,
              critMult: 1.5,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Colossus Directive',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 220, true, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Colossus Directive' }, e, particles);
            }
          }
        }
        break;
      }

      case 'vesperaDeployStormAtlas': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 280;
        this.stormAtlas = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1580,
          bolts: [],
          supercellActive: false,
          radarAngle: 0,
        };
        sound.playUltimateStart();
        break;
      }

      case 'vesperaSkyLightningCascade': {
        const rad = p.radius || 270;
        const zx = this.stormAtlas ? this.stormAtlas.x : player.x;
        const zy = this.stormAtlas ? this.stormAtlas.y : player.y;
        const wave = p.boltWave || 1;

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 8, 0.20);

        if (this.stormAtlas) {
          for (let b = 0; b < 2; b++) {
            const ang = (wave * 1.5 + b * Math.PI) % (Math.PI * 2);
            const bx = zx + Math.cos(ang) * (rad * 0.65);
            const by = zy + Math.sin(ang) * (rad * 0.65);
            this.stormAtlas.bolts.push({
              targetX: bx,
              targetY: by,
              life: 0.35,
              maxLife: 0.35,
              segments: 5,
            });
          }
        }

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.signal, 0.30);
          particles.spawnBurst(zx, zy, 25, PALETTE.signal, 50, 180, 2, 0.32);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          const dist = Math.hypot(e.x - zx, e.y - zy);
          if (dist <= rad + (e.radius || 12)) {
            if (p.pullInwardPx > 0 && e.tier !== 'boss' && dist > 14) {
              const pullAng = Math.atan2(zy - e.y, zx - e.x);
              e.x = player.clampCoord(e.x + Math.cos(pullAng) * p.pullInwardPx);
              e.y = player.clampCoord(e.y + Math.sin(pullAng) * p.pullInwardPx);
            }
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 2.4),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Worldstorm Atlas',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(zy - e.y, zx - e.x), 50, false, player, spawner, particles, camera);
            if (e.active && e.hp > 0) {
              e.statuses.apply('marked', { duration: 6.0, sourceName: 'Worldstorm Atlas' }, e, particles);
            }
          }
        }
        break;
      }

      case 'vesperaSupercellBurst': {
        const rad = p.radius || 280;
        const zx = this.stormAtlas ? this.stormAtlas.x : player.x;
        const zy = this.stormAtlas ? this.stormAtlas.y : player.y;

        if (this.stormAtlas) {
          this.stormAtlas.supercellActive = true;
        }

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 13, 0.36);

        if (p.spawnCrater && world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.signal, 0.44);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.55), PALETTE.bone, 0.28);
          particles.spawnBurst(zx, zy, 40, PALETTE.signal, 65, 240, 3, 0.50);
          particles.spawnBurst(zx, zy, 25, PALETTE.volt, 50, 190, 2, 0.40);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 4.2),
              atkBuffPct,
              isCrit: true,
              critMult: 1.5,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Worldstorm Atlas',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 200, true, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Worldstorm Atlas' }, e, particles);
            }
          }
        }
        break;
      }

      case 'kaelenStartMeltdown': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        this.movementLocked = false;
        player.ultimateActive = false;
        player.statuses.remove('untouchable');
        if (p.letterboxOut) {
          this.letterboxTarget = 0;
        }
        if (camera && camera.setZoom) {
          camera.setZoom(p.zoom || 1.0);
        }

        const dur = p.duration || 8.0;
        this.meltdownState = {
          active: true,
          timer: dur,
          duration: dur,
          slagTimer: 0,
          flameTimer: 0,
          venting: false,
          flameAngle: this.aimAngle || 0,
          slagFootprints: [],
        };

        if (player.classBehavior && player.classBehavior.pressure !== undefined) {
          player.classBehavior.pressure = 200;
        }
        player.statuses.apply('moltenJuggernaut', { duration: dur, sourceName: 'Supercritical Meltdown' }, player, particles);
        player.statuses.apply('supercriticalOverdrive', { duration: dur, sourceName: 'Supercritical Meltdown' }, player, particles);
        player.statuses.apply('overheated', { duration: dur, sourceName: 'Supercritical Meltdown' }, player, particles);

        sound.playUltimateReleaseCrack();
        if (typeof sound.playExplosion === 'function') sound.playExplosion();
        if (camera) camera.shake(8, 0.22);
        if (particles) {
          particles.spawnShockwave(player.x, player.y, 140, PALETTE.ember, 0.32);
          particles.spawnBurst(player.x, player.y, 25, PALETTE.ember, 40, 160, 3, 0.35);
        }
        break;
      }

      case 'kaelenTimeoutFinale': {
        if (this.meltdownState && !this.meltdownState.venting) {
          this.triggerMeltdownVent(player, spawner, projectiles, particles, camera, world);
        }
        break;
      }

      case 'vesperaStartArmada': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        this.movementLocked = false;
        player.ultimateActive = false;
        player.statuses.remove('untouchable');
        if (p.letterboxOut) {
          this.letterboxTarget = 0;
        }
        if (camera && camera.setZoom) {
          camera.setZoom(p.zoom || 1.0);
        }

        const dur = p.duration || 8.0;
        const drones = [];
        // 6 inner drones (r = 46px, rotating +2.5 rad/s)
        for (let i = 0; i < 6; i++) {
          drones.push({
            ring: 'inner',
            radius: 46,
            angle: (i / 6) * Math.PI * 2,
            speed: 2.5,
            color: PALETTE.volt,
            x: player.x,
            y: player.y,
          });
        }
        // 6 outer drones (r = 82px, rotating -1.8 rad/s)
        for (let i = 0; i < 6; i++) {
          drones.push({
            ring: 'outer',
            radius: 82,
            angle: (i / 6) * Math.PI * 2,
            speed: -1.8,
            color: PALETTE.signal,
            x: player.x,
            y: player.y,
          });
        }

        this.armadaState = {
          active: true,
          timer: dur,
          duration: dur,
          drones,
          zapTimer: 0,
          laserTimer: 0,
          activeLaserTargets: [],
          diving: false,
          diveDrones: [],
          diveTarget: { x: player.x, y: player.y },
          empTriggered: false,
        };

        player.statuses.apply('arcOvercharge', { duration: dur, sourceName: 'Overclocked Armada' }, player, particles);
        player.statuses.apply('overclockedArmada', { duration: dur, sourceName: 'Overclocked Armada' }, player, particles);

        sound.playUltimateStart();
        if (camera) camera.shake(7, 0.20);
        if (particles) {
          particles.spawnShockwave(player.x, player.y, 160, PALETTE.volt, 0.35);
          particles.spawnBurst(player.x, player.y, 25, PALETTE.signal, 45, 175, 2, 0.35);
        }
        break;
      }

      case 'vesperaTimeoutFinale': {
        if (this.armadaState && !this.armadaState.diving) {
          const targetX = this.aimCursorX || player.x;
          const targetY = this.aimCursorY || player.y;
          this.triggerArmadaDiveBomb(player, targetX, targetY, spawner, projectiles, particles, camera, world);
        }
        break;
      }

      case 'senaWorldsplitterStart': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        this.movementLocked = true;
        const rad = p.radius || 240;
        const zx = player.x;
        const zy = player.y;

        const fissures = [];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.2;
          fissures.push({ angle: a, dist: rad });
        }
        const spikes = [];
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + 0.4;
          const dist = 60 + ((i * 47) % (rad - 80));
          spikes.push({
            x: zx + Math.cos(a) * dist,
            y: zy + Math.sin(a) * dist,
            height: 18 + (i % 3) * 8,
          });
        }

        this.worldsplitterState = {
          x: zx,
          y: zy,
          radius: rad,
          elapsedMs: 0,
          durationMs: 1800,
          fissures,
          spikes,
          stage: 'cracking',
        };

        sound.playSkillGroundBreak();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 12, 0.28);
        if (particles) {
          particles.spawnGroundBreakEffect(zx, zy, 120);
          particles.spawnShockwave(zx, zy, rad * 0.4, PALETTE.ember, 0.35);
          particles.spawnBurst(zx, zy, 25, PALETTE.ember, 50, 160, 2, 0.35);
        }
        break;
      }

      case 'senaWorldsplitterQuake': {
        const rad = p.radius || 200;
        const zx = this.worldsplitterState ? this.worldsplitterState.x : player.x;
        const zy = this.worldsplitterState ? this.worldsplitterState.y : player.y;
        if (this.worldsplitterState) {
          this.worldsplitterState.stage = 'quake';
        }

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 10, 0.24);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad * 0.75, PALETTE.brass, 0.32);
          particles.spawnBurst(zx, zy, 30, PALETTE.ember, 60, 190, 2, 0.38);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          const dist = Math.hypot(e.x - zx, e.y - zy);
          if (dist <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 3.5),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Worldsplitter',
              targetName: e.name,
            });
            const ang = Math.atan2(e.y - zy, e.x - zx);
            e.takeDamage(pipe.finalDamage, ang, p.knockbackPx || 120, false, player, spawner, particles, camera);
          }
        }
        break;
      }

      case 'senaWorldsplitterEruption': {
        this.movementLocked = false;
        player.ultimateActive = false;
        player.statuses.remove('untouchable');
        const rad = p.radius || 240;
        const zx = this.worldsplitterState ? this.worldsplitterState.x : player.x;
        const zy = this.worldsplitterState ? this.worldsplitterState.y : player.y;
        if (this.worldsplitterState) {
          this.worldsplitterState.stage = 'erupted';
        }

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 15, 0.38);

        if (world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 12.0);
        }

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.ember, 0.45);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.55), PALETTE.brass, 0.35);
          particles.spawnBurst(zx, zy, 45, PALETTE.ember, 70, 240, 3, 0.50);
          particles.spawnBurst(zx, zy, 30, PALETTE.brass, 50, 190, 2, 0.40);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 5.5),
              atkBuffPct,
              isCrit: true,
              critMult: 1.5,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Worldsplitter',
              targetName: e.name,
            });
            const ang = Math.atan2(e.y - zy, e.x - zx);
            e.takeDamage(pipe.finalDamage, ang, 220, true, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Worldsplitter' }, e, particles);
            }
          }
        }
        break;
      }

      case 'senaStartSoundstage': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 250;
        this.soundstageState = {
          x: player.x,
          y: player.y,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1700,
          bars: 8,
          beat: 0,
          ribbonAngle: 0,
          rings: [],
        };
        sound.playUltimateStart();
        if (particles) {
          particles.spawnShockwave(player.x, player.y, rad * 0.4, PALETTE.signal, 0.30);
        }
        break;
      }

      case 'senaBeatWindowDrop': {
        const rad = p.radius || 160;
        const zx = this.soundstageState ? this.soundstageState.x : player.x;
        const zy = this.soundstageState ? this.soundstageState.y : player.y;
        const col = p.color || PALETTE.signal;
        const beatIdx = p.beatIndex || 1;

        if (this.soundstageState) {
          this.soundstageState.beat = beatIdx;
          this.soundstageState.rings.push({ rad: 20, maxRad: rad, life: 0.45, color: col });
        }

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 6, 0.16);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, col, 0.28);
          particles.spawnBurst(zx, zy, 18, col, 40, 140, 2, 0.28);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 20)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 1.8),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Perfect Frequency',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 60, false, player, spawner, particles, camera);
          }
        }
        break;
      }

      case 'senaHarmonicCrescendo': {
        const rad = p.radius || 220;
        const zx = this.soundstageState ? this.soundstageState.x : player.x;
        const zy = this.soundstageState ? this.soundstageState.y : player.y;

        if (this.soundstageState) {
          this.soundstageState.beat = 3;
          this.soundstageState.rings.push({ rad: 40, maxRad: rad, life: 0.50, color: PALETTE.signal });
        }

        sound.playUltimateReleaseCrack();
        if (camera) camera.shake(p.shakePx || 10, 0.25);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.volt, 0.35);
          particles.spawnBurst(zx, zy, 28, PALETTE.signal, 55, 180, 2, 0.35);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 2.8),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Perfect Frequency',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 100, false, player, spawner, particles, camera);
          }
        }
        break;
      }

      case 'senaForteResonanceBurst': {
        const rad = p.radius || 260;
        const zx = this.soundstageState ? this.soundstageState.x : player.x;
        const zy = this.soundstageState ? this.soundstageState.y : player.y;

        if (this.soundstageState) {
          this.soundstageState.beat = 4;
        }

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 14, 0.36);

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.bone, 0.45);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.65), PALETTE.signal, 0.35);
          particles.spawnBurst(zx, zy, 40, PALETTE.signal, 65, 230, 3, 0.48);
          particles.spawnBurst(zx, zy, 25, PALETTE.volt, 50, 180, 2, 0.38);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 30)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 4.2),
              atkBuffPct,
              isCrit: true,
              critMult: 1.5,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Perfect Frequency',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 190, true, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Perfect Frequency' }, e, particles);
            }
          }
        }
        break;
      }

      case 'rookDeployRelayPylons': {
        this.worldFrozen = false;
        this.twoToneWorld = false;
        const rad = p.radius || 220;
        const zx = player.x;
        const zy = player.y;

        const pylons = [];
        for (let i = 0; i < 3; i++) {
          const a = -Math.PI * 0.5 + (i / 3) * Math.PI * 2;
          pylons.push({
            x: zx + Math.cos(a) * rad,
            y: zy + Math.sin(a) * rad,
          });
        }

        this.relayPylonsState = {
          x: zx,
          y: zy,
          radius: rad,
          elapsedMs: 0,
          durationMs: p.durationMs || 1400,
          pylons,
          gridActive: false,
          collapsing: false,
        };

        sound.playUltimateStart();
        if (camera) camera.shake(5, 0.18);
        if (particles) {
          particles.spawnShockwave(zx, zy, 80, PALETTE.signal, 0.25);
          for (const py of pylons) {
            particles.spawnGroundBreakEffect(py.x, py.y, 40);
          }
        }
        break;
      }

      case 'rookChargeCircuitGrid': {
        const rad = p.radius || 220;
        const zx = this.relayPylonsState ? this.relayPylonsState.x : player.x;
        const zy = this.relayPylonsState ? this.relayPylonsState.y : player.y;

        if (this.relayPylonsState) {
          this.relayPylonsState.gridActive = true;
        }

        sound.playSkillGroundBreak();
        if (camera) camera.shake(p.shakePx || 9, 0.22);
        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.signal, 0.32);
          particles.spawnBurst(zx, zy, 25, PALETTE.volt, 45, 170, 2, 0.32);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 24)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          const dist = Math.hypot(e.x - zx, e.y - zy);
          if (dist <= rad + (e.radius || 12)) {
            if (p.pullInwardPx > 0 && e.tier !== 'boss' && dist > 14) {
              const pullAng = Math.atan2(zy - e.y, zx - e.x);
              e.x = player.clampCoord(e.x + Math.cos(pullAng) * p.pullInwardPx);
              e.y = player.clampCoord(e.y + Math.sin(pullAng) * p.pullInwardPx);
            }
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 3.8),
              atkBuffPct,
              isCrit: false,
              critMult: 1.0,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Blackout Cascade',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(zy - e.y, zx - e.x), 50, false, player, spawner, particles, camera);
            if (e.active && e.hp > 0) {
              e.statuses.apply('marked', { duration: 6.0, sourceName: 'Blackout Cascade' }, e, particles);
            }
          }
        }
        break;
      }

      case 'rookSuperconductorCollapse': {
        const rad = p.radius || 260;
        const zx = this.relayPylonsState ? this.relayPylonsState.x : player.x;
        const zy = this.relayPylonsState ? this.relayPylonsState.y : player.y;

        if (this.relayPylonsState) {
          this.relayPylonsState.collapsing = true;
        }

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') sound.playConcussiveBlast();
        if (camera) camera.shake(p.shakePx || 15, 0.38);

        if (world && typeof world.addCrater === 'function') {
          world.addCrater(zx, zy, rad, 10.0);
        }

        if (particles) {
          particles.spawnShockwave(zx, zy, rad, PALETTE.bone, 0.45);
          particles.spawnShockwave(zx, zy, Math.round(rad * 0.65), PALETTE.signal, 0.35);
          particles.spawnBurst(zx, zy, 45, PALETTE.signal, 65, 240, 3, 0.50);
          particles.spawnBurst(zx, zy, 25, PALETTE.volt, 50, 190, 2, 0.40);
        }

        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const targets = (spawner && typeof spawner.queryRadius === 'function')
          ? spawner.queryRadius(zx, zy, rad + 32)
          : [];

        for (const e of targets) {
          if (!e.active || e.hp <= 0) continue;
          if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
            const pipe = computeDamagePipeline({
              baseDamage: player.baseAtkForPipeline * (p.damageMult || 6.2),
              atkBuffPct,
              isCrit: true,
              critMult: 1.5,
              targetStatuses: e.statuses,
              targetBaseDef: e.def || 0,
              sourceName: 'Blackout Cascade',
              targetName: e.name,
            });
            e.takeDamage(pipe.finalDamage, Math.atan2(zy - e.y, zx - e.x), 210, true, player, spawner, particles, camera);
            if (p.stunDuration > 0 && e.active && e.hp > 0) {
              e.statuses.apply('stun', { duration: p.stunDuration, sourceName: 'Blackout Cascade' }, e, particles);
            }
          }
        }
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
        this.meltdownState = null;
        this.armadaState = null;
        this.worldsplitterState = null;
        this.soundstageState = null;
        this.relayPylonsState = null;
        this.craneDropState = null;
        this.polarityVortex = null;
        this.foundryCathedral = null;
        this.cryoBlizzard = null;
        this.colossusState = null;
        this.stormAtlas = null;
        player.ultimateActive = false;
        player.statuses.remove('untouchable');

        this.cutAssignments = [];

        // Section 4.1 Rook Capstone — Final Count: If your Ultimate hits 3 or more targets (or if 3+ enemies were in range), refund 10 Ultimate Charge after the cast ends.
        if (player && player.classId === 'rook' && player.treeNodes?.['rook:class:capstone-center']) {
          const nearbyCount = (spawner && typeof spawner.queryRadius === 'function')
            ? spawner.queryRadius(player.x, player.y, 620).filter((e) => e && e.active).length
            : 3;
          if (nearbyCount >= 3 || this.ultDef?.id === 'railSlug' || this.ultDef?.id === 'deadGround' || this.ultDef?.id === 'blackoutCascade') {
            player.ultimateCharge = Math.min(ULTIMATE_CHARGE_CONFIG.maxCharge, (player.ultimateCharge || 0) + 10);
          }
        }

        if (camera && camera.setZoom) {
          camera.setZoom(1.0);
        }
        break;
      }

      default:
        break;
    }
  }

  triggerMeltdownVent(player, spawner, projectiles, particles, camera, world) {
    if (!this.meltdownState) return;
    this.meltdownState.venting = true;
    const zx = player.x;
    const zy = player.y;
    const rad = 240;

    sound.playUltimateReleaseCrack();
    if (camera) camera.shake(12, 0.38);
    if (world && typeof world.addCrater === 'function') {
      world.addCrater(zx, zy, rad, 10.0);
    }
    if (particles) {
      particles.spawnShockwave(zx, zy, rad, PALETTE.ember, 0.45);
      particles.spawnShockwave(zx, zy, Math.round(rad * 0.65), PALETTE.brass, 0.35);
      particles.spawnShockwave(zx, zy, Math.round(rad * 0.3), PALETTE.bone, 0.25);
      particles.spawnBurst(zx, zy, 45, PALETTE.ember, 70, 240, 3, 0.52);
      particles.spawnBurst(zx, zy, 25, PALETTE.brass, 50, 190, 2, 0.42);
    }

    // 4 Magma pools radiating from blast
    if (player.classBehavior && Array.isArray(player.classBehavior.pools)) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.35;
        player.classBehavior.pools.push({
          x: player.clampCoord(zx + Math.cos(a) * (rad * 0.45)),
          y: player.clampCoord(zy + Math.sin(a) * (rad * 0.45)),
          radius: 70,
          life: 6.0,
          maxLife: 6.0,
          tickTimer: 0.15,
          kind: 'magma',
        });
      }
    }

    // Heavy thermobaric damage + Stun + Burn + Corrode
    const atkBuffPct = this._getUltimateAtkBuffPct(player);
    const targets = (spawner && typeof spawner.queryRadius === 'function')
      ? spawner.queryRadius(zx, zy, rad + 32)
      : [];

    for (const e of targets) {
      if (!e.active || e.hp <= 0) continue;
      if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
        const pipe = computeDamagePipeline({
          baseDamage: player.baseAtkForPipeline * 7.5, // 750% ATK
          atkBuffPct,
          isCrit: false,
          critMult: 1.0,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Supercritical Vent',
          targetName: e.name,
        });
        e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 210, false, player, spawner, particles, camera);
        if (e.active && e.hp > 0) {
          e.statuses.apply('stun', { duration: 2.0, sourceName: 'Supercritical Vent' }, e, particles);
          e.statuses.apply('burn', { duration: 6.0, sourceAtk: player.atk * 1.5, sourceName: 'Supercritical Vent' }, e, particles);
          for (let c = 0; c < 5; c++) {
            e.statuses.apply('corrode', { duration: 8.0, sourceName: 'Supercritical Vent' }, e, particles);
          }
        }
      }
    }

    this.meltdownState = null;
    this.active = false;
    this.letterboxTarget = 0;
    if (camera && camera.setZoom) camera.setZoom(1.0);
  }

  triggerArmadaDiveBomb(player, worldMouseX, worldMouseY, spawner, projectiles, particles, camera, world) {
    if (!this.armadaState || this.armadaState.diving) return;
    this.armadaState.diving = true;
    const targetX = Number.isFinite(worldMouseX) ? worldMouseX : player.x;
    const targetY = Number.isFinite(worldMouseY) ? worldMouseY : player.y;
    this.armadaState.diveTarget = { x: targetX, y: targetY };
    this.armadaState.diveDrones = [];

    // Launch all 12 drones in a staggered kamikaze sequence
    for (let i = 0; i < this.armadaState.drones.length; i++) {
      const d = this.armadaState.drones[i];
      const scatterAngle = (i / this.armadaState.drones.length) * Math.PI * 2;
      const scatterDist = (i * 11) % 45;
      const tx = targetX + Math.cos(scatterAngle) * scatterDist;
      const ty = targetY + Math.sin(scatterAngle) * scatterDist;
      this.armadaState.diveDrones.push({
        startX: d.x,
        startY: d.y,
        targetX: tx,
        targetY: ty,
        progress: -(i * 0.04), // staggered delays
        duration: 0.28 + (i % 3) * 0.04,
        impacted: false,
      });
    }
    sound.playUltimateStart();
  }

  detonateArmadaEmp(player, zx, zy, spawner, particles, camera, world) {
    const rad = 240;
    sound.playUltimateReleaseCrack();
    if (camera) camera.shake(12, 0.35);
    if (world && typeof world.addCrater === 'function') {
      world.addCrater(zx, zy, rad, 10.0);
    }
    if (particles) {
      particles.spawnShockwave(zx, zy, rad, PALETTE.volt, 0.45);
      particles.spawnShockwave(zx, zy, Math.round(rad * 0.6), PALETTE.signal, 0.35);
      particles.spawnShockwave(zx, zy, Math.round(rad * 0.3), PALETTE.bone, 0.25);
      particles.spawnBurst(zx, zy, 45, PALETTE.volt, 65, 230, 3, 0.5);
      particles.spawnBurst(zx, zy, 25, PALETTE.signal, 50, 190, 2, 0.4);
    }

    // Heavy EMP damage + Stun to all in radius
    const atkBuffPct = this._getUltimateAtkBuffPct(player);
    const targets = (spawner && typeof spawner.queryRadius === 'function')
      ? spawner.queryRadius(zx, zy, rad + 32)
      : [];

    for (const e of targets) {
      if (!e.active || e.hp <= 0) continue;
      if (Math.hypot(e.x - zx, e.y - zy) <= rad + (e.radius || 12)) {
        const pipe = computeDamagePipeline({
          baseDamage: player.baseAtkForPipeline * 7.0, // 700% ATK
          atkBuffPct,
          isCrit: false,
          critMult: 1.0,
          targetStatuses: e.statuses,
          targetBaseDef: e.def || 0,
          sourceName: 'Overclocked Armada EMP',
          targetName: e.name,
        });
        e.takeDamage(pipe.finalDamage, Math.atan2(e.y - zy, e.x - zx), 190, false, player, spawner, particles, camera);
        if (e.active && e.hp > 0) {
          e.statuses.apply('stun', { duration: 2.0, sourceName: 'Overclocked Armada EMP' }, e, particles);
          e.statuses.apply('marked', { duration: 8.0, sourceName: 'Overclocked Armada EMP' }, e, particles);
        }
      }
    }

    this.armadaState = null;
    this.active = false;
    this.letterboxTarget = 0;
    if (camera && camera.setZoom) camera.setZoom(1.0);
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

    // 2.5. Draw Sena's Worldsplitter (3 Concentric Fault Rings, Magma Fissures, & Basalt Monolith Spikes)
    if (this.worldsplitterState) {
      const ws = this.worldsplitterState;
      const zx = Math.round(ws.x - camX);
      const zy = Math.round(ws.y - camY);
      const rad = ws.radius;
      const pulse = Math.sin(ws.elapsedMs * 0.008) * 3;

      // Draw 3 concentric jagged seismic fault rings on the ground
      const ringRadii = [80, 160, 240];
      for (let ri = 0; ri < ringRadii.length; ri++) {
        const ringR = ringRadii[ri];
        if (ws.stage === 'cracking' && ri > 0 && ws.elapsedMs < ri * 250) continue;
        const pts = 24;
        for (let pIdx = 0; pIdx < pts; pIdx++) {
          const a1 = (pIdx / pts) * Math.PI * 2;
          const a2 = ((pIdx + 1) / pts) * Math.PI * 2;
          const jag1 = ((pIdx * 19) % 9) - 4;
          const jag2 = (((pIdx + 1) * 19) % 9) - 4;
          const r1 = ringR + jag1 + pulse;
          const r2 = ringR + jag2 + pulse;
          const x1 = Math.round(zx + Math.cos(a1) * r1);
          const y1 = Math.round(zy + Math.sin(a1) * r1);
          const x2 = Math.round(zx + Math.cos(a2) * r2);
          const y2 = Math.round(zy + Math.sin(a2) * r2);

          drawPixelLine(ctx, x1, y1, x2, y2, PALETTE.ember, 3);
          drawPixelLine(ctx, x1, y1, x2, y2, PALETTE.brass, 1);
        }
      }

      // Draw branching incandescent magma fissure veins connecting the rings
      for (const fis of ws.fissures) {
        const segs = 4;
        let prevX = zx;
        let prevY = zy;
        for (let s = 1; s <= segs; s++) {
          const st = s / segs;
          const jitterA = fis.angle + Math.sin(s * 2.8 + ws.elapsedMs * 0.01) * 0.22;
          const curR = rad * st;
          const nx = Math.round(zx + Math.cos(jitterA) * curR);
          const ny = Math.round(zy + Math.sin(jitterA) * curR);
          drawPixelLine(ctx, prevX, prevY, nx, ny, PALETTE.ember, 2);
          drawPixelLine(ctx, prevX, prevY, nx, ny, PALETTE.brass, 1);
          prevX = nx;
          prevY = ny;
        }
      }

      // Central incandescent tectonic magma pool
      drawBresenhamCircle(ctx, zx, zy, 28, PALETTE.ember, 0.95);
      drawBresenhamCircle(ctx, zx, zy, 14, PALETTE.brass, 1.0);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(zx - 3, zy - 3, 6, 6);

      // Basalt rock monolith spikes along the fractures
      for (const spk of ws.spikes) {
        const sx = Math.round(spk.x - camX);
        const sy = Math.round(spk.y - camY);
        const h = spk.height;
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 3, sy - 1, 6, 2);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(sx - 2, sy - h, 4, h);
        ctx.fillStyle = PALETTE.slagLight;
        ctx.fillRect(sx - 1, sy - h + 2, 2, h - 3);
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(sx - 1, sy - 2, 2, 2);
      }
    }

    // 2.8. Draw Sena's Perfect Frequency (8-Band Audio Visualizer Soundstage, BPM Cadence Rings, & Conductive Ribbons)
    if (this.soundstageState) {
      const ss = this.soundstageState;
      const zx = Math.round(ss.x - camX);
      const zy = Math.round(ss.y - camY);
      const rad = ss.radius;

      // Holographic neon circular soundstage perimeter
      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.signal, 0.85);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.55), PALETTE.volt, 0.55);
      drawBresenhamCircle(ctx, zx, zy, 32, PALETTE.bone, 0.75);

      // 8-Directional Audio Equalizer Visualizer Towers radiating outward
      const barCount = 8;
      for (let b = 0; b < barCount; b++) {
        const ang = (b / barCount) * Math.PI * 2;
        const cosA = Math.cos(ang);
        const sinA = Math.sin(ang);

        // Tower guide line
        const startDist = 36;
        const endDist = rad - 12;
        const bx1 = Math.round(zx + cosA * startDist);
        const by1 = Math.round(zy + sinA * startDist);
        const bx2 = Math.round(zx + cosA * endDist);
        const by2 = Math.round(zy + sinA * endDist);
        drawPixelLine(ctx, bx1, by1, bx2, by2, PALETTE.soot, 1);

        // Animated equalizer level blocks (5 levels)
        const intensity = Math.abs(Math.sin(ss.elapsedMs * 0.012 + b * 1.4));
        const maxBlocks = 6;
        const litBlocks = Math.max(1, Math.round(intensity * maxBlocks));

        for (let lvl = 0; lvl < litBlocks; lvl++) {
          const lDist = startDist + (lvl / maxBlocks) * (endDist - startDist);
          const lx = Math.round(zx + cosA * lDist);
          const ly = Math.round(zy + sinA * lDist);
          const col = lvl >= 4 ? PALETTE.bone : lvl >= 2 ? PALETTE.volt : PALETTE.signal;
          ctx.fillStyle = col;
          ctx.fillRect(lx - 2, ly - 2, 4, 4);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(lx - 1, ly - 1, 2, 2);
        }
      }

      // Expanding BPM cadence rings
      for (const cr of ss.rings) {
        drawBresenhamCircle(ctx, zx, zy, Math.round(cr.rad), cr.color, Math.max(0.2, cr.life / 0.5));
      }

      // Spinning Conductive Ribbon Hoops orbiting Sena
      const ribbonDist = 42;
      for (let r = 0; r < 2; r++) {
        const rAng = ss.ribbonAngle + r * Math.PI;
        const rx = Math.round(zx + Math.cos(rAng) * ribbonDist);
        const ry = Math.round(zy + Math.sin(rAng) * (ribbonDist * 0.7));
        drawBresenhamCircle(ctx, rx, ry, 12, r === 0 ? PALETTE.signal : PALETTE.volt, 0.9);
        drawPixelLine(ctx, zx, zy - 4, rx, ry, PALETTE.bone, 1);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(rx - 2, ry - 2, 4, 4);
      }

      // Center treble resonance icon
      ctx.font = '9px monospace';
      ctx.fillStyle = PALETTE.signal;
      ctx.fillText('[♫ 140 BPM]', zx - 28, zy - 12);
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

    // 3.8. Draw Rook's Blackout Cascade (3 Tesla Relay Pylons, Laser Wire Power Grid, & EMP Collapse)
    if (this.relayPylonsState) {
      const rp = this.relayPylonsState;
      const zx = Math.round(rp.x - camX);
      const zy = Math.round(rp.y - camY);
      const rad = rp.radius;

      // Tactical grid perimeter
      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.signal, 0.65);

      const pPos = rp.pylons.map((p) => ({
        x: Math.round(p.x - camX),
        y: Math.round(p.y - camY),
      }));

      // High-Voltage Laser Wires connecting the 3 pylons into an equilateral triangle
      if (rp.gridActive || rp.collapsing) {
        for (let i = 0; i < 3; i++) {
          const p1 = pPos[i];
          const p2 = pPos[(i + 1) % 3];

          // Laser wire beam
          drawPixelLine(ctx, p1.x, p1.y - 30, p2.x, p2.y - 30, PALETTE.signal, 3);
          drawPixelLine(ctx, p1.x, p1.y - 30, p2.x, p2.y - 30, PALETTE.bone, 1);

          // Moving digital circuit data packet dots streaming along wire
          const streamOff = (rp.elapsedMs * 0.25 + i * 50) % 100;
          const st = streamOff / 100;
          const dotX = Math.round(p1.x + (p2.x - p1.x) * st);
          const dotY = Math.round(p1.y - 30 + (p2.y - p1.y) * st);
          ctx.fillStyle = PALETTE.volt;
          ctx.fillRect(dotX - 2, dotY - 2, 4, 4);
          ctx.fillStyle = PALETTE.bone;
          ctx.fillRect(dotX - 1, dotY - 1, 2, 2);

          // High-frequency electrical lightning arcs bridging inward to center
          const jitter = Math.sin(rp.elapsedMs * 0.05 + i * 2.1) * 12;
          const midX = Math.round((p1.x + p2.x) * 0.5 + jitter);
          const midY = Math.round((p1.y - 30 + p2.y - 30) * 0.5 - jitter * 0.5);
          drawPixelLine(ctx, midX, midY, zx, zy, PALETTE.volt, 1);
        }
      }

      // Draw the 3 Tesla Relay Pylons
      for (let i = 0; i < 3; i++) {
        const py = pPos[i];
        const pylonW = 16;
        const pylonH = 46;

        // Base ground anchoring
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(py.x - Math.floor(pylonW / 2) - 2, py.y - 3, pylonW + 4, 6);

        // Tower chassis
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(py.x - Math.floor(pylonW / 2), py.y - pylonH, pylonW, pylonH);
        ctx.fillStyle = PALETTE.slagLight;
        ctx.fillRect(py.x - Math.floor(pylonW / 2) + 2, py.y - pylonH + 2, pylonW - 4, pylonH - 4);

        // Cross-brace struts
        drawPixelLine(ctx, py.x - Math.floor(pylonW / 2), py.y - pylonH + 10, py.x + Math.floor(pylonW / 2), py.y - 10, PALETTE.rust, 1);
        drawPixelLine(ctx, py.x + Math.floor(pylonW / 2), py.y - pylonH + 10, py.x - Math.floor(pylonW / 2), py.y - 10, PALETTE.rust, 1);

        // Copper transformer coils
        for (let c = 0; c < 3; c++) {
          const cy = py.y - pylonH + 12 + c * 8;
          ctx.fillStyle = PALETTE.brass;
          ctx.fillRect(py.x - 6, cy, 12, 4);
          ctx.fillStyle = PALETTE.bone;
          ctx.fillRect(py.x - 2, cy + 1, 4, 2);
        }

        // Glowing neon glass insulator bulb on top
        const bulbY = py.y - pylonH - 4;
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(py.x - 5, bulbY - 6, 10, 10);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(py.x - 3, bulbY - 4, 6, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(py.x - 1, bulbY - 2, 2, 2);

        // Static discharge sparks from bulb
        if (rp.gridActive) {
          const spkAng = rp.elapsedMs * 0.02 + i * 2.3;
          const sx = Math.round(py.x + Math.cos(spkAng) * 10);
          const sy = Math.round(bulbY + Math.sin(spkAng) * 10);
          drawPixelLine(ctx, py.x, bulbY, sx, sy, PALETTE.volt, 1);
        }
      }

      // If collapsing: Blinding blue-white EMP blackout explosion + digital matrix glitch lines
      if (rp.collapsing) {
        drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.8), PALETTE.signal, 0.95);
        drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.45), PALETTE.bone, 1.0);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(zx - 16, zy - 16, 32, 32);

        // Horizontal digital glitch scanlines across screen
        for (let g = 0; g < 6; g++) {
          const gy = (zy - 80) + ((g * 31 + rp.elapsedMs * 0.6) % 160);
          drawPixelLine(ctx, zx - rad, Math.round(gy), zx + rad, Math.round(gy), PALETTE.signal, 1);
        }
      }
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

    // 4.6. Draw Ines's Overhead Industrial Gantry Crane & Magnetic Compactor Slam
    if (this.craneDropState) {
      const cds = this.craneDropState;
      const zx = Math.round(cds.x - camX);
      const zy = Math.round(cds.y - camY);
      const rad = cds.radius;

      // Draw gantry crane warning perimeter on ground
      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.verdigris, 0.75);
      drawBresenhamCircle(ctx, zx, zy, 40, PALETTE.bone, 0.45);

      // Overhead heavy industrial gantry girder across top of screen (at y = 22)
      const girderY = 22;
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(0, girderY - 6, ctx.canvas.width, 14);
      // Yellow / black hazard diagonal stripes along the girder
      for (let hx = 0; hx < ctx.canvas.width; hx += 24) {
        ctx.fillStyle = PALETTE.brass;
        ctx.beginPath();
        ctx.moveTo(hx, girderY + 8);
        ctx.lineTo(hx + 12, girderY - 6);
        ctx.lineTo(hx + 18, girderY - 6);
        ctx.lineTo(hx + 6, girderY + 8);
        ctx.fill();
      }

      // Crane trolley directly above target X
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(zx - 20, girderY - 8, 40, 18);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(zx - 16, girderY - 4, 32, 4);

      // Steel suspension cables hanging from trolley down to claw
      const cableProgress = Math.min(1, (cds.elapsedMs % 3000) / 1000);
      const clawY = Math.round(girderY + 12 + (zy - girderY - 24) * (cds.dropping ? 1 : cableProgress));

      drawPixelLine(ctx, zx - 12, girderY + 8, zx - 8, clawY, PALETTE.bone, 1);
      drawPixelLine(ctx, zx + 12, girderY + 8, zx + 8, clawY, PALETTE.bone, 1);

      // Electromagnetic claw + heavy scrap metal compactor block
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(zx - 24, clawY - 14, 48, 14);
      ctx.fillStyle = PALETTE.verdigris;
      ctx.fillRect(zx - 22, clawY - 12, 44, 10);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(zx - 18, clawY - 8, 36, 3);

      // 80-ton crushed scrap metal compactor cube
      const compactorW = 56;
      const compactorH = 34;
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(zx - Math.floor(compactorW / 2), clawY, compactorW, compactorH);
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(zx - Math.floor(compactorW / 2) + 4, clawY + 4, compactorW - 8, compactorH - 8);
      drawPixelLine(ctx, zx - Math.floor(compactorW / 2), clawY + 17, zx + Math.floor(compactorW / 2), clawY + 17, PALETTE.rust, 2);
      drawPixelLine(ctx, zx, clawY, zx, clawY + compactorH, PALETTE.rust, 2);

      // Crackling verdigris magnetic discharge arcs around the magnet
      for (let a = 0; a < 4; a++) {
        const arcX = zx + (a % 2 === 0 ? -26 : 26);
        const arcY = clawY + a * 6;
        drawPixelLine(ctx, arcX, arcY, arcX + (a % 2 === 0 ? -8 : 8), arcY + 4, PALETTE.signal, 1);
      }
    }

    // 4.8. Draw Ines's Dual-Polarity Singularity Vortex & Repulsion Inversion
    if (this.polarityVortex) {
      const pv = this.polarityVortex;
      const zx = Math.round(pv.x - camX);
      const zy = Math.round(pv.y - camY);
      const rad = pv.radius;

      // Concentric magnetic polarity contour rings
      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.verdigris, 0.85);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.65), PALETTE.signal, 0.75);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.35), PALETTE.bone, 0.90);

      // Central dense magnetic singularity core
      const coreR = Math.max(8, Math.round(20 * (1 - Math.min(1, pv.elapsedMs / 1400) * 0.5)));
      drawBresenhamCircle(ctx, zx, zy, coreR, PALETTE.bone, 1.0);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(zx - 6, zy - 6, 12, 12);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(zx - 4, zy - 4, 8, 8);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(zx - 2, zy - 2, 4, 4);

      // Draw counter-rotating (+) and (-) polarity particle streams spiraling inward
      for (const pt of pv.particles) {
        const curR = rad * pt.distRatio;
        const px = Math.round(zx + Math.cos(pt.angle) * curR);
        const py = Math.round(zy + Math.sin(pt.angle) * curR);

        const inA = pt.angle + (pt.speed > 0 ? 0.35 : -0.35);
        const inX = Math.round(zx + Math.cos(inA) * (curR * 0.8));
        const inY = Math.round(zy + Math.sin(inA) * (curR * 0.8));
        drawPixelLine(ctx, px, py, inX, inY, pt.color, 1);

        ctx.fillStyle = pt.color;
        ctx.fillRect(px - 2, py - 2, 4, 4);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(px - 1, py - 1, 2, 2);

        if (pt.polarity === '+') {
          drawPixelLine(ctx, px - 2, py, px + 2, py, PALETTE.bone, 1);
          drawPixelLine(ctx, px, py - 2, px, py + 2, PALETTE.bone, 1);
        } else {
          drawPixelLine(ctx, px - 2, py, px + 2, py, PALETTE.signal, 1);
        }
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

    // 5.3. Draw Kaelen's Cathedral of Iron (4 Steel Girder Pillars, Searing Slag Rivers, & 80-Ton Forge Press)
    if (this.foundryCathedral) {
      const fc = this.foundryCathedral;
      const zx = Math.round(fc.x - camX);
      const zy = Math.round(fc.y - camY);
      const rad = fc.radius;

      // Draw molten slag channels connecting the 4 corner pillars
      const p1 = { x: Math.round(fc.pillars[0].x - camX), y: Math.round(fc.pillars[0].y - camY) };
      const p2 = { x: Math.round(fc.pillars[1].x - camX), y: Math.round(fc.pillars[1].y - camY) };
      const p3 = { x: Math.round(fc.pillars[2].x - camX), y: Math.round(fc.pillars[2].y - camY) };
      const p4 = { x: Math.round(fc.pillars[3].x - camX), y: Math.round(fc.pillars[3].y - camY) };

      drawPixelLine(ctx, p1.x, p1.y, p2.x, p2.y, PALETTE.ember, 4);
      drawPixelLine(ctx, p2.x, p2.y, p3.x, p3.y, PALETTE.ember, 4);
      drawPixelLine(ctx, p3.x, p3.y, p4.x, p4.y, PALETTE.ember, 4);
      drawPixelLine(ctx, p4.x, p4.y, p1.x, p1.y, PALETTE.ember, 4);

      drawPixelLine(ctx, p1.x, p1.y, p2.x, p2.y, PALETTE.brass, 2);
      drawPixelLine(ctx, p2.x, p2.y, p3.x, p3.y, PALETTE.brass, 2);
      drawPixelLine(ctx, p3.x, p3.y, p4.x, p4.y, PALETTE.brass, 2);
      drawPixelLine(ctx, p4.x, p4.y, p1.x, p1.y, PALETTE.brass, 2);

      // Central molten lava lake in the crucible center
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.45), PALETTE.ember, 0.95);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.28), PALETTE.brass, 0.85);

      // Draw 4 colossal steel girder pillars at 4 corners
      const corners = [p1, p2, p3, p4];
      for (let i = 0; i < 4; i++) {
        const c = corners[i];
        const pillarW = 22;
        const pillarH = 75;
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(c.x - Math.floor(pillarW / 2), c.y - 4, pillarW, 8);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(c.x - Math.floor(pillarW / 2), c.y - pillarH, pillarW, pillarH);
        ctx.fillStyle = PALETTE.slagLight;
        ctx.fillRect(c.x - Math.floor(pillarW / 2) + 3, c.y - pillarH + 2, pillarW - 6, pillarH - 4);
        drawPixelLine(ctx, c.x - Math.floor(pillarW / 2), c.y - pillarH, c.x + Math.floor(pillarW / 2), c.y - 20, PALETTE.rust, 2);
        drawPixelLine(ctx, c.x + Math.floor(pillarW / 2), c.y - pillarH, c.x - Math.floor(pillarW / 2), c.y - 20, PALETTE.rust, 2);
        ctx.fillStyle = PALETTE.ember;
        for (let r = 0; r < 5; r++) {
          ctx.fillRect(c.x - 2, c.y - pillarH + 10 + r * 12, 4, 4);
        }
      }

      // Overhead hydraulic forge press
      const pressW = 86;
      const pressH = 42;
      const pressCurY = zy - 30 + fc.pressY;

      drawPixelLine(ctx, zx - 26, pressCurY - 120, zx - 26, pressCurY, PALETTE.bone, 4);
      drawPixelLine(ctx, zx + 26, pressCurY - 120, zx + 26, pressCurY, PALETTE.bone, 4);

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(zx - Math.floor(pressW / 2), pressCurY, pressW, pressH);
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(zx - Math.floor(pressW / 2) + 3, pressCurY + 3, pressW - 6, pressH - 6);
      for (let ch = -3; ch <= 3; ch++) {
        drawPixelLine(ctx, zx + ch * 12 - 4, pressCurY + 6, zx + ch * 12 + 4, pressCurY + 16, PALETTE.brass, 2);
      }
      drawPixelLine(ctx, zx - Math.floor(pressW / 2), pressCurY + pressH - 2, zx + Math.floor(pressW / 2), pressCurY + pressH - 2, PALETTE.ember, 3);
    }

    // 5.6. Draw Kaelen's Whiteout Rupture (Subzero Koch Snowflake Fractals & Ice Needles)
    if (this.cryoBlizzard) {
      const cb = this.cryoBlizzard;
      const zx = Math.round(cb.x - camX);
      const zy = Math.round(cb.y - camY);
      const rad = cb.radius;

      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.signal, 0.90);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.65), PALETTE.bone, 0.70);

      const rot = cb.elapsedMs * 0.0018;
      for (let arm = 0; arm < 6; arm++) {
        const a = rot + (arm / 6) * Math.PI * 2;
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        const ex = Math.round(zx + cosA * rad);
        const ey = Math.round(zy + sinA * rad);

        drawPixelLine(ctx, zx, zy, ex, ey, PALETTE.signal, 2);
        drawPixelLine(ctx, zx, zy, ex, ey, PALETTE.bone, 1);

        for (let b = 1; b <= 4; b++) {
          const bDist = (b / 5) * rad;
          const bx = Math.round(zx + cosA * bDist);
          const by = Math.round(zy + sinA * bDist);
          const wing = 18 - b * 2;
          const side1A = a + 0.65;
          const side2A = a - 0.65;
          drawPixelLine(ctx, bx, by, Math.round(bx + Math.cos(side1A) * wing), Math.round(by + Math.sin(side1A) * wing), PALETTE.signal, 1);
          drawPixelLine(ctx, bx, by, Math.round(bx + Math.cos(side2A) * wing), Math.round(by + Math.sin(side2A) * wing), PALETTE.signal, 1);
        }
      }

      for (const needle of cb.iceNeedles) {
        const nx = Math.round(needle.x - camX);
        const ny = Math.round(needle.y - camY);
        const curH = Math.round(needle.h * needle.grown);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(nx - 2, ny - 1, 4, 2);
        drawPixelLine(ctx, nx, ny, nx, ny - curH, PALETTE.signal, 2);
        drawPixelLine(ctx, nx, ny, nx, ny - curH, PALETTE.bone, 1);
      }

      for (let i = 0; i < 18; i++) {
        const fa = cb.elapsedMs * 0.004 + i * 0.35;
        const fr = (rad * 0.2) + ((i * 37) % (rad * 0.7));
        const fx = Math.round(zx + Math.cos(fa) * fr);
        const fy = Math.round(zy + Math.sin(fa) * (fr * 0.75));
        ctx.fillStyle = i % 2 === 0 ? PALETTE.signal : PALETTE.bone;
        ctx.fillRect(fx - 1, fy - 1, 3, 3);
      }
    }

    // 6. Draw Vespera's Orbital Ion Singularity World Effects
    if (this.ionSingularity) {
      const ion = this.ionSingularity;
      const zx = Math.round(ion.x - camX);
      const zy = Math.round(ion.y - camY);
      const rad = ion.radius;
      const vCount = ion.vertexCount || 5;
      const rot = -ion.elapsedMs * 0.0038;

      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.volt, 0.9);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.42), PALETTE.signal, 0.8);

      const verts = [];
      for (let i = 0; i < vCount; i++) {
        const a = rot + (i / vCount) * Math.PI * 2;
        verts.push({
          x: Math.round(zx + Math.cos(a) * rad),
          y: Math.round(zy + Math.sin(a) * rad),
        });
      }

      const step = vCount >= 5 ? 2 : 1;
      for (let i = 0; i < vCount; i++) {
        const v1 = verts[i];
        const v2 = verts[(i + 1) % vCount];
        const vStar = verts[(i + step) % vCount];
        drawPixelLine(ctx, v1.x, v1.y, v2.x, v2.y, PALETTE.volt, 2);
        drawPixelLine(ctx, v1.x, v1.y, vStar.x, vStar.y, i % 2 === 0 ? PALETTE.bone : PALETTE.volt, 1);

        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(v1.x - 4, v1.y - 4, 8, 8);
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(v1.x - 3, v1.y - 3, 6, 6);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(v1.x - 1, v1.y - 1, 2, 2);
      }

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

    // 6.4. Draw Vespera's Colossus Directive (War Automaton, Puppet Command Wires, Pneumatic Fist & Core Slam)
    if (this.colossusState) {
      const cs = this.colossusState;
      const zx = Math.round(cs.x - camX);
      const zy = Math.round(cs.y - camY);
      const rad = cs.radius;

      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.volt, 0.75);

      if (p) {
        const px = Math.round(p.x - camX);
        const py = Math.round(p.y - camY - 6);
        const wireSegments = 5;
        const leftHandX = px - 8;
        const rightHandX = px + 8;
        const colossusShoulderLX = zx - 18;
        const colossusShoulderRX = zx + 18;
        const colossusShoulderY = zy - 42;

        for (let s = 1; s <= wireSegments; s++) {
          const st = s / wireSegments;
          const prevSt = (s - 1) / wireSegments;
          const jitter = Math.sin(cs.elapsedMs * 0.06 + s * 1.8) * 4;
          const lx1 = Math.round(leftHandX + (colossusShoulderLX - leftHandX) * prevSt);
          const ly1 = Math.round(py + (colossusShoulderY - py) * prevSt);
          const lx2 = Math.round(leftHandX + (colossusShoulderLX - leftHandX) * st + (s < wireSegments ? jitter : 0));
          const ly2 = Math.round(py + (colossusShoulderY - py) * st);
          drawPixelLine(ctx, lx1, ly1, lx2, ly2, s % 2 === 0 ? PALETTE.volt : PALETTE.bone, 1);

          const rx1 = Math.round(rightHandX + (colossusShoulderRX - rightHandX) * prevSt);
          const ry1 = Math.round(py + (colossusShoulderY - py) * prevSt);
          const rx2 = Math.round(rightHandX + (colossusShoulderRX - rightHandX) * st + (s < wireSegments ? -jitter : 0));
          const ry2 = Math.round(py + (colossusShoulderY - py) * st);
          drawPixelLine(ctx, rx1, ry1, rx2, ry2, s % 2 === 0 ? PALETTE.volt : PALETTE.bone, 1);
        }
      }

      const autoX = zx;
      const autoY = zy;

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(autoX - 28, autoY + 6, 56, 12);

      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(autoX - 22, autoY - 14, 14, 24);
      ctx.fillRect(autoX + 8, autoY - 14, 14, 24);
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(autoX - 20, autoY - 12, 10, 20);
      ctx.fillRect(autoX + 10, autoY - 12, 10, 20);

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(autoX - 24, autoY - 52, 48, 40);
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(autoX - 22, autoY - 50, 44, 36);
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(autoX - 18, autoY - 46, 36, 28);

      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(autoX - 26, autoY - 64, 8, 16);
      ctx.fillRect(autoX + 18, autoY - 64, 8, 16);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(autoX - 27, autoY - 68, 10, 4);
      ctx.fillRect(autoX + 17, autoY - 68, 10, 4);

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(autoX - 10, autoY - 42, 20, 8);
      ctx.fillStyle = PALETTE.volt;
      ctx.fillRect(autoX - 8, autoY - 40, 16, 4);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(autoX - 3, autoY - 39, 6, 2);

      if (cs.stage === 'sweep') {
        const armAngle = cs.sweepAngle;
        const fistReach = 58;
        const fx = Math.round(autoX + Math.cos(armAngle) * fistReach);
        const fy = Math.round(autoY - 26 + Math.sin(armAngle) * fistReach);
        drawPixelLine(ctx, autoX - 16, autoY - 36, fx, fy, PALETTE.volt, 4);
        drawPixelLine(ctx, autoX - 16, autoY - 36, fx, fy, PALETTE.bone, 2);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(fx - 9, fy - 9, 18, 18);
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(fx - 6, fy - 6, 12, 12);
      } else if (cs.stage === 'grandSlam') {
        const slamY = autoY + 6;
        drawPixelLine(ctx, autoX - 16, autoY - 48, autoX, slamY, PALETTE.volt, 5);
        drawPixelLine(ctx, autoX + 16, autoY - 48, autoX, slamY, PALETTE.volt, 5);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(autoX - 18, slamY - 14, 36, 20);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(autoX - 16, slamY - 12, 32, 16);
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(autoX - 10, slamY - 8, 20, 8);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(autoX - 4, slamY - 4, 8, 4);
      } else {
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(autoX - 32, autoY - 42, 10, 32);
        ctx.fillRect(autoX + 22, autoY - 42, 10, 32);
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(autoX - 30, autoY - 20, 6, 10);
        ctx.fillRect(autoX + 24, autoY - 20, 6, 10);
      }
    }

    // 6.7. Draw Vespera's Worldstorm Atlas (Holographic Weather Radar, Isobar Contours, Sky Lightning)
    if (this.stormAtlas) {
      const sa = this.stormAtlas;
      const zx = Math.round(sa.x - camX);
      const zy = Math.round(sa.y - camY);
      const rad = sa.radius;

      // 1. Holographic weather radar grid on floor
      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.signal, 0.90);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.65), PALETTE.signal, 0.65);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * 0.35), PALETTE.signal, 0.45);
      drawPixelLine(ctx, zx - rad, zy, zx + rad, zy, PALETTE.signal, 1);
      drawPixelLine(ctx, zx, zy - rad, zx, zy + rad, PALETTE.signal, 1);

      // Rotating radar sweep beam
      const sweepX = Math.round(zx + Math.cos(sa.radarAngle) * rad);
      const sweepY = Math.round(zy + Math.sin(sa.radarAngle) * rad);
      drawPixelLine(ctx, zx, zy, sweepX, sweepY, PALETTE.bone, 2);
      drawPixelLine(ctx, zx, zy, sweepX, sweepY, PALETTE.signal, 1);

      // 2. Concentric undulating isobar pressure bands
      for (let ib = 1; ib <= 3; ib++) {
        const baseR = (ib / 3) * rad * 0.85;
        const pts = 16;
        for (let pIdx = 0; pIdx < pts; pIdx++) {
          const a1 = (pIdx / pts) * Math.PI * 2;
          const a2 = ((pIdx + 1) / pts) * Math.PI * 2;
          const r1 = baseR + Math.sin(a1 * 3 + sa.elapsedMs * 0.005) * 8;
          const r2 = baseR + Math.sin(a2 * 3 + sa.elapsedMs * 0.005) * 8;
          const x1 = Math.round(zx + Math.cos(a1) * r1);
          const y1 = Math.round(zy + Math.sin(a1) * r1);
          const x2 = Math.round(zx + Math.cos(a2) * r2);
          const y2 = Math.round(zy + Math.sin(a2) * r2);
          drawPixelLine(ctx, x1, y1, x2, y2, ib === 3 ? PALETTE.signal : PALETTE.volt, 1);
        }
      }

      // Isobar pressure text labels
      ctx.font = '8px monospace';
      ctx.fillStyle = PALETTE.signal;
      ctx.fillText('1013 hPa', zx + Math.round(rad * 0.65), zy - 8);
      ctx.fillText('995 hPa', zx + Math.round(rad * 0.4), zy - 8);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillText('970 hPa [EYE]', zx - 26, zy - 12);

      // 3. Swirling cyclonic wind vector arrows orbiting the center
      for (let i = 0; i < 6; i++) {
        const a = sa.elapsedMs * 0.003 + (i / 6) * Math.PI * 2;
        const dist = rad * 0.5;
        const ax = Math.round(zx + Math.cos(a) * dist);
        const ay = Math.round(zy + Math.sin(a) * dist);
        const tanA = a + Math.PI * 0.5;
        drawPixelLine(ctx, ax, ay, Math.round(ax + Math.cos(tanA) * 14), Math.round(ay + Math.sin(tanA) * 14), PALETTE.bone, 1);
      }

      // 4. Diagonal rain squalls across the radar
      for (let r = 0; r < 20; r++) {
        const rx = (zx - rad) + ((r * 31 + sa.elapsedMs * 0.45) % (rad * 2));
        const ry = (zy - rad) + ((r * 23 + sa.elapsedMs * 0.75) % (rad * 2));
        if (Math.hypot(rx - zx, ry - zy) <= rad) {
          drawPixelLine(ctx, Math.round(rx), Math.round(ry), Math.round(rx - 8), Math.round(ry + 14), PALETTE.signal, 1);
        }
      }

      // 5. Active jagged multi-segment sky lightning bolts
      for (const bolt of sa.bolts) {
        const ratio = bolt.life / bolt.maxLife;
        const tx = Math.round(bolt.targetX - camX);
        const ty = Math.round(bolt.targetY - camY);
        const skyY = 0;
        const segs = bolt.segments || 5;

        let prevX = tx + (Math.sin(sa.elapsedMs * 0.05) * 20);
        let prevY = skyY;
        for (let s = 1; s <= segs; s++) {
          const st = s / segs;
          const curY = Math.round(skyY + (ty - skyY) * st);
          const jitterX = s < segs ? (Math.sin(s * 3.7 + sa.elapsedMs * 0.05) * 18) : 0;
          const curX = Math.round(prevX + ((tx - prevX) * 0.5) + jitterX);
          drawPixelLine(ctx, prevX, prevY, curX, curY, ratio > 0.5 ? PALETTE.bone : PALETTE.signal, 3);
          drawPixelLine(ctx, prevX, prevY, curX, curY, '#FFFFFF', 1);
          prevX = curX;
          prevY = curY;
        }
        drawBresenhamCircle(ctx, tx, ty, 18, PALETTE.signal, 0.95);
      }

      // 6. Central Supercell Ion Sky Pillar
      if (sa.supercellActive) {
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(zx - 20, 0, 40, zy);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(zx - 8, 0, 16, zy);
        drawBresenhamCircle(ctx, zx, zy, 32, PALETTE.signal, 1.0);
      }
    }

    // 7. Draw Kaelen's continuous Supercritical Meltdown (molten slag footprints & roaring flamethrower torrent)
    if (this.meltdownState) {
      const ms = this.meltdownState;

      // Draw bubbling molten slag footprints
      for (let i = 0; i < ms.slagFootprints.length; i++) {
        const fp = ms.slagFootprints[i];
        const fx = Math.round(fp.x - camX);
        const fy = Math.round(fp.y - camY);
        const ratio = fp.life / fp.maxLife;
        drawBresenhamCircle(ctx, fx, fy, Math.max(4, Math.round(fp.radius * ratio)), PALETTE.ember, 0.85);
        drawBresenhamCircle(ctx, fx, fy, Math.max(2, Math.round(fp.radius * ratio * 0.55)), PALETTE.brass, 0.65);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(fx - 1, fy - 1, 2, 2);
      }

      // Draw roaring flamethrower torrent plume along flameAngle
      if (ms.active && !ms.venting && p) {
        const px = Math.round(p.x - camX);
        const py = Math.round(p.y - camY - 4);
        const cosA = Math.cos(ms.flameAngle);
        const sinA = Math.sin(ms.flameAngle);
        const perpX = -sinA;
        const perpY = cosA;
        const reach = 160;

        // Core flame beam
        drawPixelLine(ctx, px, py, Math.round(px + cosA * reach), Math.round(py + sinA * reach), PALETTE.bone, 2);

        // Flaring flame plumes
        const segments = 8;
        for (let s = 1; s <= segments; s++) {
          const st = s / segments;
          const dist = st * reach;
          const spread = Math.round(st * 36);
          const cx = Math.round(px + cosA * dist);
          const cy = Math.round(py + sinA * dist);

          drawBresenhamCircle(ctx, cx, cy, Math.max(3, Math.round(spread * 0.65)), s % 2 === 0 ? PALETTE.ember : PALETTE.brass, 0.75);

          // Lateral flame tongues
          const wingX = Math.round(perpX * spread);
          const wingY = Math.round(perpY * spread);
          drawPixelLine(ctx, cx - wingX, cy - wingY, cx + wingX, cy + wingY, s % 3 === 0 ? PALETTE.bone : PALETTE.ember, 1);
        }

        // Lance muzzle glow
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(px - 3, py - 3, 6, 6);
        drawBresenhamCircle(ctx, px, py, 14, PALETTE.ember, 0.9);
      }
    }

    // 8. Draw Vespera's continuous Overclocked Armada (12 orbiting drones, Faraday shields, neon saturation lasers)
    if (this.armadaState && p) {
      const arm = this.armadaState;
      const px = Math.round(p.x - camX);
      const py = Math.round(p.y - camY - 6);

      if (arm.active) {
        // Draw concentric orbital rings
        drawBresenhamCircle(ctx, px, py, 46, PALETTE.volt, 0.45);
        drawBresenhamCircle(ctx, px, py, 82, PALETTE.signal, 0.40);

        // Draw Faraday shield laser connections between adjacent drones in inner ring
        const innerDrones = arm.drones.filter((d) => d.ring === 'inner');
        for (let i = 0; i < innerDrones.length; i++) {
          const d1 = innerDrones[i];
          const d2 = innerDrones[(i + 1) % innerDrones.length];
          const x1 = Math.round(d1.x - camX);
          const y1 = Math.round(d1.y - camY);
          const x2 = Math.round(d2.x - camX);
          const y2 = Math.round(d2.y - camY);
          drawPixelLine(ctx, x1, y1, x2, y2, PALETTE.volt, 1);
        }

        // Draw Faraday shield laser connections between adjacent drones in outer ring
        const outerDrones = arm.drones.filter((d) => d.ring === 'outer');
        for (let i = 0; i < outerDrones.length; i++) {
          const d1 = outerDrones[i];
          const d2 = outerDrones[(i + 1) % outerDrones.length];
          const x1 = Math.round(d1.x - camX);
          const y1 = Math.round(d1.y - camY);
          const x2 = Math.round(d2.x - camX);
          const y2 = Math.round(d2.y - camY);
          drawPixelLine(ctx, x1, y1, x2, y2, PALETTE.signal, 1);
        }

        // Draw the 12 drones
        for (let i = 0; i < arm.drones.length; i++) {
          const d = arm.drones[i];
          const dx = Math.round(d.x - camX);
          const dy = Math.round(d.y - camY);

          // Drone body
          ctx.fillStyle = PALETTE.soot;
          ctx.fillRect(dx - 4, dy - 4, 8, 8);
          ctx.fillStyle = d.color;
          ctx.fillRect(dx - 3, dy - 3, 6, 6);
          ctx.fillStyle = PALETTE.bone;
          ctx.fillRect(dx - 1, dy - 1, 2, 2);

          // Spinning propeller tick marks
          const propA = this.elapsedMs * 0.04 + i * 1.5;
          const pCos = Math.cos(propA) * 5;
          const pSin = Math.sin(propA) * 5;
          drawPixelLine(ctx, Math.round(dx - pCos), Math.round(dy - pSin), Math.round(dx + pCos), Math.round(dy + pSin), PALETTE.bone, 1);
        }

        // Draw active neon tracer saturation lasers
        if (Array.isArray(arm.activeLaserTargets)) {
          for (const lt of arm.activeLaserTargets) {
            const x1 = Math.round(lt.fromX - camX);
            const y1 = Math.round(lt.fromY - camY);
            const x2 = Math.round(lt.toX - camX);
            const y2 = Math.round(lt.toY - camY);
            drawPixelLine(ctx, x1, y1, x2, y2, lt.color, 2);
            drawPixelLine(ctx, x1, y1, x2, y2, PALETTE.bone, 1);
            drawBresenhamCircle(ctx, x2, y2, 8, lt.color, 0.85);
          }
        }

        // Draw dive-bomb kamikaze streaks if diving
        if (arm.diving && Array.isArray(arm.diveDrones)) {
          for (const dd of arm.diveDrones) {
            if (dd.progress < 0 || dd.progress >= 1) continue;
            const curX = Math.round(dd.startX + (dd.targetX - dd.startX) * dd.progress - camX);
            const curY = Math.round(dd.startY + (dd.targetY - dd.startY) * dd.progress - camY);
            const tx = Math.round(dd.targetX - camX);
            const ty = Math.round(dd.targetY - camY);

            drawPixelLine(ctx, curX, curY, tx, ty, PALETTE.volt, 2);
            ctx.fillStyle = PALETTE.bone;
            ctx.fillRect(curX - 3, curY - 3, 6, 6);
            drawBresenhamCircle(ctx, tx, ty, 10, PALETTE.signal, 0.75);
          }
        }
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
    } else if (data.kind === 'faultline') {
      // Sena Worldsplitter Impact Frame: 3 concentric jagged tectonic fault rings + radial magma fractures
      for (const ringR of [50, 95, 145]) {
        drawBresenhamCircle(ctx, sx, sy, ringR, secondaryLineCol, 1.0);
      }
      for (let r = 0; r < 18; r++) {
        const a = (r / 18) * Math.PI * 2;
        const len = 85 + (r % 3) * 65;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len, r % 2 === 0 ? primaryLineCol : secondaryLineCol, r % 3 === 0 ? 3 : 2);
      }
    } else if (data.kind === 'soundstage') {
      // Sena Perfect Frequency Impact Frame: 8-band radial equalizer wave towers + harmonic rings
      drawBresenhamCircle(ctx, sx, sy, 115, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 58, primaryLineCol, 1.0);
      for (let b = 0; b < 16; b++) {
        const a = (b / 16) * Math.PI * 2;
        const len = b % 2 === 0 ? 210 : 120;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len, b % 2 === 0 ? primaryLineCol : secondaryLineCol, b % 2 === 0 ? 3 : 1);
      }
    } else if (data.kind === 'empGrid') {
      // Rook Blackout Cascade Impact Frame: triangular pylon grid + digital glitch scanlines
      drawBresenhamCircle(ctx, sx, sy, 105, secondaryLineCol, 1.0);
      for (let g = 0; g < 10; g++) {
        const gy = Math.round(((g + 1) / 11) * height);
        drawPixelLine(ctx, 0, gy, width, gy, g % 2 === 0 ? secondaryLineCol : primaryLineCol, g % 3 === 0 ? 2 : 1);
      }
      for (let i = 0; i < 3; i++) {
        const a1 = -Math.PI * 0.5 + (i / 3) * Math.PI * 2;
        const a2 = -Math.PI * 0.5 + (((i + 1) % 3) / 3) * Math.PI * 2;
        drawPixelLine(ctx, sx + Math.cos(a1) * 105, sy + Math.sin(a1) * 105, sx + Math.cos(a2) * 105, sy + Math.sin(a2) * 105, primaryLineCol, 3);
      }
    } else if (data.kind === 'gantrySlam') {
      // Ines Crane Drop Impact Frame: overhead industrial girder + vertical suspension cables + compactor crush
      ctx.fillStyle = secondaryLineCol;
      ctx.fillRect(0, 14, width, 12);
      drawPixelLine(ctx, sx - 18, 26, sx - 18, sy, primaryLineCol, 3);
      drawPixelLine(ctx, sx + 18, 26, sx + 18, sy, primaryLineCol, 3);
      ctx.fillStyle = primaryLineCol;
      ctx.fillRect(sx - 28, sy - 24, 56, 32);
      drawBresenhamCircle(ctx, sx, sy, 68, secondaryLineCol, 1.0);
    } else if (data.kind === 'polarityFlip') {
      // Ines Zero-Point Reversal Impact Frame: dual-polarity spiral arms + inversion core
      drawBresenhamCircle(ctx, sx, sy, 110, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 52, primaryLineCol, 1.0);
      for (let r = 0; r < 20; r++) {
        const a = (r / 20) * Math.PI * 2;
        const curveA = a + (r % 2 === 0 ? 0.45 : -0.45);
        drawPixelLine(ctx, sx + Math.cos(a) * 35, sy + Math.sin(a) * 35, sx + Math.cos(curveA) * 185, sy + Math.sin(curveA) * 185, r % 2 === 0 ? primaryLineCol : secondaryLineCol, 2);
      }
    } else if (data.kind === 'meltdownVent') {
      // Kaelen Supercritical Meltdown Impact Frame: thermobaric flare + radial pressure burst
      drawBresenhamCircle(ctx, sx, sy, 88, secondaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 42, primaryLineCol, 1.0);
      for (let r = 0; r < 24; r++) {
        const a = (r / 24) * Math.PI * 2;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * 200, sy + Math.sin(a) * 200, r % 2 === 0 ? secondaryLineCol : primaryLineCol, 2);
      }
    } else if (data.kind === 'foundryPress') {
      // Kaelen Cathedral of Iron Impact Frame: 4 corner girder pillars + descending 80-ton press
      ctx.fillStyle = primaryLineCol;
      ctx.fillRect(sx - 44, sy - 34, 88, 38);
      drawPixelLine(ctx, sx - 28, 0, sx - 28, sy - 34, secondaryLineCol, 4);
      drawPixelLine(ctx, sx + 28, 0, sx + 28, sy - 34, secondaryLineCol, 4);
      drawBresenhamCircle(ctx, sx, sy, 96, secondaryLineCol, 1.0);
    } else if (data.kind === 'cryoShatter') {
      // Kaelen Whiteout Rupture Impact Frame: 6-arm Koch snowflake fractal + ice knife shards
      const frostCol = PALETTE.frost || secondaryLineCol;
      drawBresenhamCircle(ctx, sx, sy, 98, frostCol, 1.0);
      for (let arm = 0; arm < 6; arm++) {
        const a = (arm / 6) * Math.PI * 2;
        const ex = sx + Math.cos(a) * 210;
        const ey = sy + Math.sin(a) * 210;
        drawPixelLine(ctx, sx, sy, ex, ey, primaryLineCol, 3);
        const mx = sx + Math.cos(a) * 110;
        const my = sy + Math.sin(a) * 110;
        drawPixelLine(ctx, mx, my, mx + Math.cos(a + 0.6) * 45, my + Math.sin(a + 0.6) * 45, frostCol, 2);
        drawPixelLine(ctx, mx, my, mx + Math.cos(a - 0.6) * 45, my + Math.sin(a - 0.6) * 45, frostCol, 2);
      }
    } else if (data.kind === 'armadaLaunch') {
      // Vespera Overclocked Armada Impact Frame: 12-drone dual orbital rings + Faraday web
      drawBresenhamCircle(ctx, sx, sy, 48, primaryLineCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 86, secondaryLineCol, 1.0);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r = i % 2 === 0 ? 48 : 86;
        const dx = Math.round(sx + Math.cos(a) * r);
        const dy = Math.round(sy + Math.sin(a) * r);
        ctx.fillStyle = primaryLineCol;
        ctx.fillRect(dx - 3, dy - 3, 6, 6);
        drawPixelLine(ctx, sx, sy, dx, dy, secondaryLineCol, 1);
      }
    } else if (data.kind === 'colossusSlam') {
      // Vespera Colossus Directive Impact Frame: automaton double-hammer core slam + puppet wires
      ctx.fillStyle = secondaryLineCol;
      ctx.fillRect(sx - 26, sy - 58, 52, 44);
      ctx.fillStyle = primaryLineCol;
      ctx.fillRect(sx - 18, sy - 14, 36, 20);
      drawBresenhamCircle(ctx, sx, sy, 84, secondaryLineCol, 1.0);
      for (let r = 0; r < 16; r++) {
        const a = (r / 16) * Math.PI * 2;
        drawPixelLine(ctx, sx, sy, sx + Math.cos(a) * 170, sy + Math.sin(a) * 170, r % 2 === 0 ? primaryLineCol : secondaryLineCol, 2);
      }
    } else if (data.kind === 'radarSweep') {
      // Vespera Worldstorm Atlas Impact Frame: holographic weather radar + sweeping azimuth + isobars
      const holoCol = PALETTE.cyanHolo || secondaryLineCol;
      drawBresenhamCircle(ctx, sx, sy, 115, holoCol, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 68, primaryLineCol, 1.0);
      drawPixelLine(ctx, sx - 140, sy, sx + 140, sy, holoCol, 1);
      drawPixelLine(ctx, sx, sy - 140, sx, sy + 140, holoCol, 1);
      drawPixelLine(ctx, sx, sy, sx + 115, sy - 65, primaryLineCol, 3);
    } else {
      // Ines Scrapfall Magnetic Crush Impact Frame:
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
