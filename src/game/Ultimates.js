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

    // Ines Scrapfall / Crane Drop / Junkyard Rain runtime state
    this.levitationZone = null; // { x, y, radius, elapsedMs, durationMs, pieces: [...] }
    this.lastPlayerRef = null;
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
    this.impactData = null;
    this.cutAssignments = [];
    this.aimLineActive = false;
    this.levitationZone = null;
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

    this.aimOriginX = player.x;
    this.aimOriginY = player.y;
    this.aimCursorX = player.clampCoord(worldMouseX);
    this.aimCursorY = player.clampCoord(worldMouseY);
    this.aimAngle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);
    this.deadGroundCenter = {
      x: player.clampCoord(worldMouseX),
      y: player.clampCoord(worldMouseY),
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
    this.impactFrames = Math.max(1, data.frames || 2);
    this.impactData = {
      x: data.x,
      y: data.y,
      angle: data.angle || 0,
      color: data.color || PALETTE.signal,
      kind: data.kind || 'slash', // 'slash' | 'rail' | 'crush' | 'burst'
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

    // Replace blinding white flash with high-impact comic/anime impact frame!
    this.triggerImpactFrame({
      frames: Math.min(2, Math.max(1, frames)),
      color: options.color || (this.ultDef && this.ultDef.classId === 'rook' ? PALETTE.brass : PALETTE.signal),
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

    if (!this.active) return;

    // Track live cursor angle during Rook's Ten Count / Long Count charge
    if (this.aimLineActive && input) {
      this.aimOriginX = player.x;
      this.aimOriginY = player.y;
      if (input.worldMouseX !== undefined && input.worldMouseY !== undefined) {
        this.aimCursorX = input.worldMouseX;
        this.aimCursorY = input.worldMouseY;
        this.aimAngle = Math.atan2(
          this.aimCursorY - player.y,
          this.aimCursorX - player.x
        );
        player.facingDir = angleTo4Facing(this.aimAngle);
        player.facingX = Math.cos(this.aimAngle) >= 0 ? 1 : -1;
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

        if (accessibility && accessibility.reduceFlashes) {
          this._triggerScreenFlash(1, accessibility);
        } else {
          this.invertFrames = p.invertFrames || 1;
        }

        if (camera) {
          camera.shake(p.shakePx || 4, 0.08);
        }

        if (assign && assign.target && assign.target.active) {
          const t = assign.target;
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
        // Sakuga anime action impact frame (no white flash!)
        this.triggerImpactFrame({
          x: player.x,
          y: player.y,
          angle: this.lastCutTarget ? Math.atan2(this.lastCutTarget.y - player.y, this.lastCutTarget.x - player.x) : 0,
          color: p.applyBleed ? PALETTE.blood : PALETTE.signal,
          kind: 'slash',
          frames: 2,
          camera
        });

        if (camera) {
          camera.shake(p.shakePx || 8, 0.28);
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
            const len = 48;
            particles.spawnSlash(
              c.target.x - Math.cos(c.angle) * len,
              c.target.y - Math.sin(c.angle) * len,
              c.target.x + Math.cos(c.angle) * len,
              c.target.y + Math.sin(c.angle) * len,
              p.applyBleed ? PALETTE.blood : PALETTE.signal,
              0.28,
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
          particles.spawnShockwave(player.x, player.y, 110, PALETTE.bone, 0.26);
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
        this._triggerScreenFlash(p.whiteFlashFrames || 1, accessibility);
        if (camera) {
          camera.shake(p.shakePx || 6, 0.22);
        }
        if (particles) {
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
          particles.spawnShockwave(player.x, player.y, 120, PALETTE.signal, 0.18);
        }
        break;
      }

      case 'rookChargeTick': {
        sound.playReloadStart();
        break;
      }

      case 'rookFireTenCountBolt': {
        if (p.boltIndex === 0) {
          this.aimLineActive = false;
          this._triggerScreenFlash(p.whiteFlashFrames || 1, accessibility);
        }

        // Ultimates never crit. ATK buffs and Marked apply. Distance bonus and Clean Mag do not.
        const atkBuffPct = this._getUltimateAtkBuffPct(player);
        const angle = this.aimAngle;

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

        sound.playSpringgunShot(true);
        if (camera) {
          camera.shake(p.shakePx || 3, 0.06);
        }
        break;
      }

      case 'rookReleaseRailSlug':
      case 'rookReleaseLongCount': {
        this.aimLineActive = false;
        const angle = this.aimAngle;
        const range = p.range || 1400;
        const lineWidth = p.lineWidth || 90;
        const x1 = player.x;
        const y1 = player.y;
        const x2 = x1 + Math.cos(angle) * range;
        const y2 = y1 + Math.sin(angle) * range;

        // Sakuga anime action impact frame along the firing vector (zero white flash)
        this.triggerImpactFrame({
          x: player.x,
          y: player.y,
          angle,
          color: PALETTE.brass,
          kind: 'rail',
          frames: 2,
          camera,
        });

        sound.playUltimateReleaseCrack();
        if (typeof sound.playConcussiveBlast === 'function') {
          sound.playConcussiveBlast();
        }

        if (camera) {
          camera.shake(p.shakePx || 14, 0.35);
        }

        // Spawn colossal 90px multi-tier Rail Beam corridor
        if (particles) {
          if (typeof particles.spawnRailBeam === 'function') {
            particles.spawnRailBeam(x1, y1, x2, y2, lineWidth, 0.5);
          } else {
            particles.spawnSlash(x1, y1, x2, y2, PALETTE.brass, 0.45, 'sevenCuts');
          }

          // Spawn ground trench dust & shockwave cracks along the 1400px corridor
          const stepCount = Math.min(22, Math.round(range / 60));
          for (let s = 1; s <= stepCount; s++) {
            const tx = x1 + Math.cos(angle) * (s * 60);
            const ty = y1 + Math.sin(angle) * (s * 60);
            particles.spawnDustPuff(tx, ty, 3);
            if (s % 3 === 0) particles.spawnGroundBreakEffect(tx, ty);
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
            particles.spawnRing(e.x, e.y, PALETTE.brass, aoeRadius);
            particles.spawnSparks(e.x, e.y, 8, PALETTE.brass);
            particles.spawnDebris(e.x, e.y, 4);
          }
          if (typeof sound.playConcussiveBlast === 'function') {
            sound.playConcussiveBlast();
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

        // Terminal Kinetic Shock Detonation at Beam End
        if (particles) {
          particles.spawnRing(x2, y2, PALETTE.brass, 110);
          particles.spawnSparks(x2, y2, 16, PALETTE.brass);
          particles.spawnGroundBreakEffect(x2, y2);
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

        if (player.classId === 'rook' && player.classBehavior) {
          player.classBehavior.traps.push({
            kind: 'mine',
            x: mx,
            y: my,
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
        }
        break;
      }

      case 'rookReleaseDeadGround': {
        this._triggerScreenFlash(p.whiteFlashFrames || 1, accessibility);
        if (camera) {
          camera.shake(p.shakePx || 5, 0.18);
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
        this._triggerScreenFlash(p.whiteFlashFrames || 1, accessibility);
        if (camera) {
          camera.shake(p.shakePx || 7, 0.24);
        }

        if (particles) {
          particles.spawnGroundBreakEffect(zx, zy, rad);
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
        sx - 14,
        sy,
        sx + 14,
        sy,
        PALETTE.bone,
        1
      );
    }

    // 2. Draw frozen white slash lines over targets during Seven Cuts / Nine Cuts
    for (let i = 0; i < this.cutAssignments.length; i++) {
      const c = this.cutAssignments[i];
      if (!c.triggered || c.released || !c.target) continue;
      const tx = Math.round(c.target.x - camX);
      const ty = Math.round(c.target.y - camY);
      const len = 36;
      const x1 = Math.round(tx - Math.cos(c.angle) * len);
      const y1 = Math.round(ty - Math.sin(c.angle) * len);
      const x2 = Math.round(tx + Math.cos(c.angle) * len);
      const y2 = Math.round(ty + Math.sin(c.angle) * len);

      // Tapered white slash line (2px center, 1px tips)
      drawPixelLine(ctx, x1, y1, x2, y2, '#FFFFFF', 1);
      const midLen = 18;
      drawPixelLine(
        ctx,
        Math.round(tx - Math.cos(c.angle) * midLen),
        Math.round(ty - Math.sin(c.angle) * midLen),
        Math.round(tx + Math.cos(c.angle) * midLen),
        Math.round(ty + Math.sin(c.angle) * midLen),
        this.ultDef?.id === 'nineCuts' ? PALETTE.blood : PALETTE.signal,
        2
      );
    }

    // 3. Draw Rook's Ten Count / Long Count charging aim line, corridor bounds, & countdown ticks
    if (this.aimLineActive && p) {
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY - 4);
      const ex = Math.round(sx + Math.cos(this.aimAngle) * this.aimLineRange);
      const ey = Math.round(sy + Math.sin(this.aimAngle) * this.aimLineRange);

      drawPixelLine(ctx, sx, sy, ex, ey, this.aimLineColor, 1);

      // If Rail Slug (range >= 1000), draw 90px wide kinetic rail corridor boundaries
      if (this.aimLineRange >= 1000) {
        const cosA = Math.cos(this.aimAngle);
        const sinA = Math.sin(this.aimAngle);
        const nx = -sinA * 45;
        const ny = cosA * 45;
        drawPixelLine(ctx, sx + nx, sy + ny, ex + nx, ey + ny, PALETTE.brass, 1);
        drawPixelLine(ctx, sx - nx, sy - ny, ex - nx, ey - ny, PALETTE.brass, 1);

        // Cross targeting brackets along the corridor
        for (let b = 1; b <= 8; b++) {
          const bdist = b * 130;
          const bx = sx + cosA * bdist;
          const by = sy + sinA * bdist;
          drawPixelLine(ctx, bx - nx * 0.4, by - ny * 0.4, bx + nx * 0.4, by + ny * 0.4, PALETTE.slag, 1);
        }
      }

      // 10 countdown ticks along the aim line near Rook
      for (let t = 0; t < 10; t++) {
        const lit = t / 10 <= this.aimChargeProgress;
        const dist = 20 + t * 8;
        const tx = Math.round(sx + Math.cos(this.aimAngle) * dist);
        const ty = Math.round(sy + Math.sin(this.aimAngle) * dist);
        ctx.fillStyle = lit ? PALETTE.brass : PALETTE.slag;
        ctx.fillRect(tx - 1, ty - 1, 2, 2);
      }
    }

    // 4. Draw Ines's Levitating Wreck Parts & Magnetic Target Zone
    if (this.levitationZone) {
      const zx = Math.round(this.levitationZone.x - camX);
      const zy = Math.round(this.levitationZone.y - camY);
      const rad = this.levitationZone.radius;
      const liftRatio = Math.min(1, this.levitationZone.elapsedMs / 850);

      drawBresenhamCircle(ctx, zx, zy, rad, PALETTE.verdigris, 0.7);
      drawBresenhamCircle(ctx, zx, zy, Math.round(rad * (1 - liftRatio * 0.5)), PALETTE.bone, 0.4);

      for (let i = 0; i < this.levitationZone.pieces.length; i++) {
        const pc = this.levitationZone.pieces[i];
        const a = pc.angle + this.levitationZone.elapsedMs * 0.004;
        const r = rad * pc.distRatio * (1 - liftRatio * 0.35);
        const px = Math.round(zx + Math.cos(a) * r);
        const pyGround = Math.round(zy + Math.sin(a) * r);
        const liftY = Math.round(liftRatio * 34);

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
  }

  drawImpactFrame(ctx, width, height, player) {
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

    // 1. Pitch soot backdrop (stark action manga negative frame)
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(0, 0, width, height);

    const accent = data.color || (player.classId === 'rook' ? PALETTE.brass : player.classId === 'ines' ? PALETTE.verdigris : PALETTE.signal);

    if (data.kind === 'rail') {
      // Archer Rail Slug Impact Frame:
      // Huge forward kinetic ionization corridor + high-voltage lightning diagonals
      const angle = data.angle || 0;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const nx = -sinA;
      const ny = cosA;

      // Stark geometric beam swath across the screen
      ctx.fillStyle = accent;
      for (let w = -45; w <= 45; w += 3) {
        ctx.fillRect(0, Math.round(sy + ny * w - 1), width, 2);
      }

      // High-contrast diagonal speed rays
      for (let i = -6; i <= 6; i++) {
        const offset = i * 22;
        const x1 = sx + nx * offset;
        const y1 = sy + ny * offset;
        const x2 = x1 + cosA * 500;
        const y2 = y1 + sinA * 500;
        drawPixelLine(ctx, x1, y1, x2, y2, i % 2 === 0 ? '#52C5FF' : PALETTE.bone, 2);
      }

      // Muzzle shock ring
      drawBresenhamCircle(ctx, sx, sy, 32, PALETTE.bone, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 18, accent, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 6, '#FFFFFF', 1.0);
    } else if (data.kind === 'slash') {
      // Melee Seven Cuts / Riposte Impact Frame:
      // Sharp graphic action slash lines radiating from the hit point
      const angle = data.angle || 0;
      const rays = 16;
      for (let r = 0; r < rays; r++) {
        const a = (r / rays) * Math.PI * 2 + (data.seed % 0.5);
        const len = 70 + (r % 3) * 80;
        const ex = Math.round(sx + Math.cos(a) * len);
        const ey = Math.round(sy + Math.sin(a) * len);
        const col = r % 3 === 0 ? PALETTE.bone : r % 2 === 0 ? accent : PALETTE.blood;
        drawPixelLine(ctx, sx, sy, ex, ey, col, (r % 4 === 0) ? 3 : 1);
      }

      // Sharp diagonal cut through the center
      const slashLen = Math.max(width, height);
      const cutAngle = angle + (data.seed % 0.8 - 0.4);
      const cx1 = sx - Math.cos(cutAngle) * slashLen;
      const cy1 = sy - Math.sin(cutAngle) * slashLen;
      const cx2 = sx + Math.cos(cutAngle) * slashLen;
      const cy2 = sy + Math.sin(cutAngle) * slashLen;
      drawPixelLine(ctx, cx1, cy1, cx2, cy2, PALETTE.bone, 4);
      drawPixelLine(ctx, cx1 + 2, cy1, cx2 + 2, cy2, accent, 2);
      drawPixelLine(ctx, cx1 - 2, cy1, cx2 - 2, cy2, PALETTE.blood, 2);

      // Center impact diamond
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(sx - 2, sy - 2, 4, 4);
    } else {
      // General Burst / Crush Impact Frame:
      // Radial explosive shards
      for (let r = 0; r < 20; r++) {
        const a = (r / 20) * Math.PI * 2;
        const len = 60 + ((r * 17) % 100);
        const ex = Math.round(sx + Math.cos(a) * len);
        const ey = Math.round(sy + Math.sin(a) * len);
        const col = r % 2 === 0 ? accent : PALETTE.bone;
        drawPixelLine(ctx, sx, sy, ex, ey, col, (r % 3 === 0) ? 2 : 1);
      }
      drawBresenhamCircle(ctx, sx, sy, 24, accent, 1.0);
      drawBresenhamCircle(ctx, sx, sy, 12, PALETTE.bone, 1.0);
    }

    ctx.restore();
  }

  drawScreenOverlay(ctx, width, height, player) {
    // 1. Sakuga Impact Frames (Stark high-contrast comic action frame, zero white flash)
    if (this.impactFrames > 0) {
      this.drawImpactFrame(ctx, width, height, player);
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

      // 8-direction speed lines across the cut-in strip
      ctx.fillStyle = PALETTE.slag;
      for (let i = 0; i < 14; i++) {
        const ly = bannerY + ((i * 7) % bannerH);
        const lx = ((i * 53 - Math.round(this.elapsedMs * 0.9)) % width + width) % width;
        ctx.fillRect(lx, ly, 28 + (i % 3) * 14, 1);
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
