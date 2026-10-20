/**
 * GRAVEL SKY — Ultimates Data & Timeline Definitions
 * All numbers, charge meter rules, casting rules, accessibility defaults,
 * and step-by-step sequencer timelines ({ t, action, params }) live here.
 * Internal resolution reference: 480x270.
 */

import { PALETTE } from './config.js';

export const ULTIMATE_CHARGE_CONFIG = {
  maxCharge: 100,
  extraCutChargeNeeded: 85,
  nineCutsChargeNeeded: 85, // legacy alias
  basicHitGain: 1.2,
  skillHitGain: 3.0,
  skillHitMaxEnemiesPerCast: 3,
  perCastChargeCap: 9, // Section 7: max 9 charge gained from any single skill cast
  damageTakenGainPerPctMaxHp: 0.8,
  killBonus: {
    common: 1.5,
    elite: 8.0,
    boss: 0.0,
  },
  damageDealtGainCapPerSecond: 6.0,
  classMultipliers: {
    sena: 1.00,
    rook: 0.77,
    ines: 0.83,
    kaelen: 0.71,
    vespera: 0.71,
  },
  counterweightBlockMultiplier: 2.0,
  pauseDuringAnyUltimate: true,
  pausedDuringUltimates: ['holdTheLine', 'craneDrop'],
};

export const HARD_CAPS = {
  maxShakePx: 16,
  maxCameraZoom: 1.25,
  maxStunSeconds: 3.0,
  maxCorrodeStacksPerCast: 3,
  maxPrimaryCountBonus: 1.5,
  maxImpactFrames: 6,
  maxRadiusBonus: 0.35,
  maxDamageBonus: 0.50,
};

export const ULTIMATE_HARD_CAPS = {
  ...HARD_CAPS,
  primaryCountBonusMax: 4, // +4 over tier base count (FIELD +2, nodes/capstones max +2)
  fieldCountBonus: 2,
  nodeCountBonusMax: 2,
  radiusBonusMax: 0.35, // +35% max radius bonus
  damageBonusMax: 0.35, // +35% pooled additive node/fork damage bonus (BURST +20% inside pool)
  stunBonusMax: 0.6, // +0.6s max added stun from nodes and forks
  maxTotalStun: 3.0, // total stun on any ult <= 3.0s
  chargeCostReductionMax: 0.15, // 15% max charge cost reduction
  skillCooldownFloorRatio: 0.50, // no skill may drop below 50% of Rank 1 cooldown
  minTelegraphSec: 0.4,
};

export const CLASS_VFX_PROFILES = {
  sena: {
    classId: 'sena',
    motionLanguage: 'Sharp, vertical, instant',
    rhythm: 'Staccato equal hits (75-90ms) -> 200ms silence -> release',
    delivery: 'Blink-cuts (Tier 1-2), Falling blades (Tier 3-4)',
    accent: PALETTE.signal,
    secondary: PALETTE.bone,
    bleedColor: PALETTE.blood,
    impactFamily: ['slashCut', 'slashShatter', 'greatSword'],
    shakeStyle: 'sharpSnap',
    payoffRider: 'bleed',
    groundMark: 'embeddedSwords',
    windUpPose: 'crouchAndBlink',
  },
  rook: {
    classId: 'rook',
    motionLanguage: 'Linear, horizontal, mechanical',
    rhythm: 'Ratchet charge -> held beat -> instant release -> 300ms ring-out',
    delivery: 'Hitscan lines, aim line, placed mines',
    accent: PALETTE.brass,
    secondary: PALETTE.whiteHot || '#FFFDF5',
    aimLineColor: PALETTE.blood,
    impactFamily: ['rail', 'pierceVector', 'mineBlast', 'emp'],
    shakeStyle: 'directionalRecoil',
    payoffRider: 'marked',
    groundMark: 'scorchedLine',
    windUpPose: 'plantFeetRatchet',
  },
  ines: {
    classId: 'ines',
    motionLanguage: 'Heavy, vertical, gravity-driven',
    rhythm: 'Slow lift -> overhead hang -> hard slam',
    delivery: 'Scrap lifted and dropped from above',
    accent: PALETTE.verdigris,
    secondary: PALETTE.rust,
    impactFamily: ['crush'],
    shakeStyle: 'lowFreqRumbleShove',
    payoffRider: 'slowCrater',
    groundMark: 'crater',
    windUpPose: 'armsRaisedScrapLifts',
  },
  kaelen: {
    classId: 'kaelen',
    motionLanguage: 'Swelling, radial, lingering',
    rhythm: 'Continuous build, overlapping waves, lingering fire (3-6s)',
    delivery: 'Expanding heat, lanes, rolling waves',
    accent: PALETTE.ember,
    secondary: PALETTE.whiteHot || '#FFFDF5',
    cryoAccent: PALETTE.frost || '#7CE8FF',
    impactFamily: ['explosion', 'frostShatter'],
    shakeStyle: 'rampingSwell',
    payoffRider: 'burnOrBrittle',
    groundMark: 'lavaLakeOrFrostField',
    windUpPose: 'ventsSteamGlows',
  },
  vespera: {
    classId: 'vespera',
    motionLanguage: 'Precise, geometric, aerial',
    rhythm: 'Staggered telegraphs at pattern points -> synchronized strike',
    delivery: 'Sky beams, geometric lattice, automaton',
    accent: PALETTE.volt,
    secondary: PALETTE.cyanHolo || '#38F8E2',
    impactFamily: ['beam', 'lattice', 'colossusSlam'],
    shakeStyle: 'crispJitterFlicker',
    payoffRider: 'shockChain',
    groundMark: 'ionBurnLattice',
    windUpPose: 'dronesRiseFormation',
  },
};

export const ULTIMATE_CAST_RULES = {
  blockedByStatuses: ['stun', 'lifted'],
  disallowInKettle: true,
  invalidShakeDuration: 0.3, // 0.3s icon shake on no valid target
  neverCrit: true,
  applyAtkBuffs: true,
  applyMomentum: true,
  applyMarked: true,
  applyDistanceBonus: false,
  applyCleanMag: false,
  cullingBladePayoffOnly: true, // Section 4.2: Culling Blade (+40% below 35% HP) applies to payoff hit only
  bossStaggerBase: 25,
  bossStaggerPerSecStun: 10,
  maxCameraZoom: 1.0, // Section 7: 1.0 (no zoom-lock)
  letterboxHeightRatio: 0, // Section 7: 0 (no letterbox)
  accessibilityDefaults: {
    reduceFlashes: false,
    shortUltimates: false,
  },
  shortUltimatesCutInMs: 0,
  shortUltimatesNonGameplayScale: 0.7, // compresses VFX-only steps by 30%, never shortens telegraphs
  reduceFlashesBoneTintFrames: 3,
  reduceFlashesMaxPerSecond: 3,
  impactFrames: {
    slashCutFrames: 2,
    slashShatterFrames: 4,
    greatSwordFrames: 4,
    cascadeFrames: 3,
    groundSlamFrames: 3,
    pierceVectorFrames: 2,
    pierceFinisherFrames: 3,
    railSlugFrames: 4,
    mineBlastFrames: 3,
    empFrames: 4,
    scrapCrushFrames: 3,
    scrapFinalCrushFrames: 4,
    frostShatterFrames: 4,
    latticeFrames: 3,
    colossusSlamFrames: 4,
  },
};

/**
 * Helper to build the 7, 8, or 9 cut steps for Sena's Seven Cuts / Eight Cuts (Tier 1-2)
 * Section 2.2 & 7: No cutInEnter/cutInExit, letterbox 0, freezeMobsInRadius: true (only Sena Tier 1-2).
 */
function buildSenaCutSteps({
  cutsCount = 7,
  cutIntervalMs = 85,
  damageMultPerCut = 5.0 / 7,
  applyBleed = false,
}) {
  const cutStartMs = 240; // <= 0.4s crouch-and-blink wind-up pose
  const silenceStartMs = cutStartMs + cutsCount * cutIntervalMs;
  const releaseMs = silenceStartMs + 200; // 200ms silence beat
  const endMs = releaseMs + 260;

  const steps = [
    {
      t: 0,
      action: 'startCast',
      nonGameplay: true,
      params: {
        freezeWorld: true, // Mob freeze in radius for Sena Tier 1-2 only
        freezeMobsInRadius: true,
        twoToneWorld: false,
        letterbox: 0,
        untouchable: true,
        lockMovement: true,
        windUpPose: 'crouchAndBlink',
      },
    },
  ];

  for (let i = 0; i < cutsCount; i++) {
    steps.push({
      t: cutStartMs + i * cutIntervalMs,
      action: 'senaSlashStep',
      nonGameplay: false,
      params: {
        cutIndex: i,
        totalCuts: cutsCount,
        blinkOffsetPx: 24,
        shakePx: 3,
        invertFrames: 1,
        damageMult: damageMultPerCut,
        applyBleed,
        impactFrame: {
          kind: 'slashCut',
          frames: 2,
          color: applyBleed ? PALETTE.blood : PALETTE.signal,
        },
      },
    });
  }

  steps.push(
    {
      t: silenceStartMs,
      action: 'silenceWindow',
      nonGameplay: true,
      params: {
        durationMs: 200,
      },
    },
    {
      t: releaseMs,
      action: 'senaReleaseCuts',
      nonGameplay: false,
      params: {
        isPayoff: true,
        totalCuts: cutsCount,
        damageMultPerCut,
        applyBleed,
        whiteFlashFrames: 1,
        shakePx: 7,
        boneDebrisCount: 16,
        letterboxOut: true,
        impactFrame: {
          kind: 'slashShatter',
          frames: 4,
          color: applyBleed ? PALETTE.blood : PALETTE.signal,
        },
      },
    },
    {
      t: endMs,
      action: 'endCast',
      nonGameplay: true,
      params: {
        faceLastTarget: true,
      },
    }
  );

  return steps;
}

/**
 * Helper to build Sena's Tier 3-4 Rain of Swords timeline (Section 4.5, 4.6, 10.4)
 * Telegraph 0-300ms -> Staccato waves at 600 / 900 / 1200ms -> 200ms silence -> Great Sword at 1600ms.
 * Sena and mobs remain free-moving (no world freeze).
 */
function buildRainOfSwordsSteps({
  swordsCount = 20,
  waveCount = 3,
  waveDamageMult = 1.60, // 3 waves x 160% = 480% ATK
  greatSwordDamageMult = 4.20, // + 420% Great Sword = 900% total ATK
  radius = 260,
}) {
  const steps = [
    {
      t: 0,
      action: 'startCast',
      nonGameplay: true,
      params: {
        freezeWorld: false,
        twoToneWorld: false,
        letterbox: 0,
        untouchable: false,
        lockMovement: false,
        windUpPose: 'crouchAndBlink',
      },
    },
    {
      t: 40,
      action: 'senaStartSoundstage',
      nonGameplay: false,
      params: {
        radius,
        durationMs: 1750,
        swordsCount,
      },
    },
  ];

  for (let w = 0; w < waveCount; w++) {
    steps.push({
      t: 600 + w * 300,
      action: 'senaBeatWindowDrop',
      nonGameplay: false,
      params: {
        beatIndex: w + 1,
        waveIndex: w + 1,
        totalWaves: waveCount,
        swordsInWave: Math.round(swordsCount / waveCount),
        radius: Math.round(radius * (0.75 + w * 0.12)),
        damageMult: waveDamageMult,
        applyBleed: true,
        shakePx: 3,
        color: PALETTE.signal,
        impactFrame: {
          kind: 'slashCut',
          frames: 2,
          color: PALETTE.signal,
        },
      },
    });
  }

  const lastWaveMs = 600 + (waveCount - 1) * 300;
  const silenceMs = lastWaveMs + 200;
  const greatSwordMs = silenceMs + 200;

  steps.push(
    {
      t: silenceMs,
      action: 'silenceWindow',
      nonGameplay: true,
      params: { durationMs: 200 },
    },
    {
      t: greatSwordMs,
      action: 'senaForteResonanceBurst',
      nonGameplay: false,
      params: {
        isPayoff: true,
        payoffName: 'Great Sword',
        radius,
        damageMult: greatSwordDamageMult,
        stunDuration: 2.2,
        applyBleed: true,
        shakePx: 9,
        impactFrame: {
          kind: 'greatSword',
          frames: 4,
          color: PALETTE.signal,
        },
      },
    },
    {
      t: greatSwordMs + 280,
      action: 'endCast',
      nonGameplay: true,
      params: {},
    }
  );

  return steps;
}

/**
 * Helper to build Rook's Twin Slug / Anti-Materiel Rail Slug timeline (Section 4.7 & 10.4)
 * Ratchet charge 0-1000ms -> Slug 1 at 1000ms -> Slug 2 at 1300ms -> Ring-out 300ms (total 1000% + 250% AOE)
 */
function buildRailSlugSteps() {
  const steps = [
    {
      t: 0,
      action: 'startCast',
      nonGameplay: true,
      params: {
        freezeWorld: false,
        twoToneWorld: false,
        letterbox: 0,
        untouchable: false,
        lockMovement: true,
        windUpPose: 'plantFeetRatchet',
        aimLineRange: 1400,
        aimLineColor: PALETTE.blood,
        chargeDurationMs: 1000,
      },
    },
  ];

  for (let i = 0; i < 5; i++) {
    steps.push({
      t: 120 + i * 175,
      action: 'rookChargeTick',
      nonGameplay: false,
      params: { tickIndex: i, totalTicks: 5 },
    });
  }

  // Slug 1 at 1000ms (550% ATK + 125% kinetic wake)
  steps.push({
    t: 1000,
    action: 'rookReleaseRailSlug',
    nonGameplay: false,
    params: {
      slugIndex: 1,
      damageMult: 5.5,
      aoeDamageMult: 1.25,
      aoeRadius: 80,
      followUpBlasts: 4,
      range: 1400,
      lineWidth: 90,
      applyMarkedDuration: 8.0,
      whiteFlashFrames: 1,
      shakePx: 8,
      impactFrame: {
        kind: 'rail',
        frames: 3,
        color: PALETTE.brass,
      },
    },
  });

  // Slug 2 (Payoff) at 1300ms (450% ATK + 125% kinetic wake = 1000% + 250% per enemy total)
  steps.push({
    t: 1300,
    action: 'rookReleaseRailSlug',
    nonGameplay: false,
    params: {
      isPayoff: true,
      slugIndex: 2,
      damageMult: 4.5,
      aoeDamageMult: 1.25,
      aoeRadius: 80,
      followUpBlasts: 4,
      range: 1400,
      lineWidth: 90,
      applyMarkedDuration: 8.0,
      whiteFlashFrames: 1,
      shakePx: 11,
      impactFrame: {
        kind: 'rail',
        frames: 4,
        color: PALETTE.brass,
      },
    },
  });

  steps.push({
    t: 1600,
    action: 'endCast',
    nonGameplay: true,
    params: {},
  });

  return steps;
}

/**
 * Helper to build Rook's Ten Count timeline (No cut-in, no world freeze, red aim line)
 */
function buildTenCountSteps(boltCount = 10, totalMult = 6.0) {
  const perBolt = +(totalMult / boltCount).toFixed(2);
  const steps = [
    {
      t: 0,
      action: 'startCast',
      nonGameplay: true,
      params: {
        freezeWorld: false,
        twoToneWorld: false,
        letterbox: 0,
        untouchable: false,
        lockMovement: true,
        windUpPose: 'plantFeetRatchet',
        aimLineRange: 520,
        aimLineColor: PALETTE.blood,
        chargeDurationMs: 1000,
      },
    },
  ];

  // Ratchet clicks during the 1000ms charge (0ms..1000ms)
  for (let i = 0; i < 10; i++) {
    steps.push({
      t: i * 100,
      action: 'rookChargeTick',
      nonGameplay: false,
      params: {
        tickIndex: i,
        totalTicks: 10,
      },
    });
  }

  // Release: bolts in a tight line down cursor direction
  for (let b = 0; b < boltCount; b++) {
    const isFirst = b === 0;
    const isLast = b === boltCount - 1;
    steps.push({
      t: 1000 + b * 45,
      action: 'rookFireTenCountBolt',
      nonGameplay: false,
      params: {
        isPayoff: isLast,
        boltIndex: b,
        totalBolts: boltCount,
        damageMult: perBolt,
        range: 520,
        speed: 920,
        shakePx: isLast ? 5 : 2,
        whiteFlashFrames: isFirst || isLast ? 1 : 0,
        impactFrame:
          isFirst || isLast
            ? {
                kind: 'pierceVector',
                frames: isLast ? 3 : 2,
                color: PALETTE.brass,
              }
            : null,
      },
    });
  }

  steps.push({
    t: 1000 + boltCount * 45 + 300, // 300ms ring-out
    action: 'endCast',
    nonGameplay: true,
    params: {},
  });

  return steps;
}

/**
 * Helper to build Rook's Dead Ground timeline (Section 4.7 & 10.4)
 * 14 mines placed over 0-1200ms -> Arm tick at 1400ms -> Chain detonation 1600-2200ms (~980% total = 14 x 70%)
 */
function buildDeadGroundSteps(mineCount = 14, perMineMult = 0.70) {
  const steps = [
    {
      t: 0,
      action: 'startCast',
      nonGameplay: true,
      params: {
        freezeWorld: false,
        twoToneWorld: false,
        letterbox: 0,
        untouchable: false,
        lockMovement: false,
        windUpPose: 'plantFeetRatchet',
        fieldRadius: 220,
      },
    },
  ];

  const intervalMs = Math.round(1200 / mineCount);
  for (let m = 0; m < mineCount; m++) {
    steps.push({
      t: m * intervalMs,
      action: 'rookDropDeadGroundMine',
      nonGameplay: false,
      params: {
        mineIndex: m,
        totalMines: mineCount,
        fieldRadius: 220,
        blastRadius: 80,
        damageMult: perMineMult,
        shakePx: 2,
      },
    });
  }

  steps.push(
    {
      t: 1400,
      action: 'rookChargeTick',
      nonGameplay: false,
      params: { tickIndex: 1, totalTicks: 1, armTick: true },
    },
    {
      t: 1600,
      action: 'rookReleaseDeadGround',
      nonGameplay: false,
      params: {
        isPayoff: true,
        stunDuration: 1.8,
        whiteFlashFrames: 1,
        shakePx: 6,
        impactFrame: {
          kind: 'mineBlast',
          frames: 3,
          color: PALETTE.brass,
        },
      },
    },
    {
      t: 2200,
      action: 'endCast',
      nonGameplay: true,
      params: {},
    }
  );

  return steps;
}

export const ULTIMATES = {
  // ===========================================================================
  // 1) SENA IBUKI — SEVEN CUTS (Hand), NINE CUTS (Flenser), HOLD THE LINE (Girder)
  // ===========================================================================
  sevenCuts: {
    id: 'sevenCuts',
    classId: 'sena',
    branch: null,
    nodeRequired: null,
    name: 'Seven Cuts',
    titleCard: 'SEVEN CUTS',
    hotkey: 'R',
    icon: 'sevenCuts',
    accent: PALETTE.signal,
    chargeNeeded: 100,
    requiresTargetWithinPx: 300,
    pauseChargeWhileActive: true,
    totalDamageMult: 5.0,
    cuts: 7,
    radius: 300,
    summary: '500% Total ATK · 7 Cuts',
    desc: 'Time stops. Sena blinks across up to 7 targets within 300px, slicing for 500% total ATK at release.',
    steps: buildSenaCutSteps({
      cutsCount: 7,
      cutIntervalMs: 90,
      damageMultPerCut: 5.0 / 7,
      applyBleed: false,
      titleCard: 'SEVEN CUTS',
    }),
  },

  nineCuts: {
    id: 'nineCuts',
    classId: 'sena',
    branch: 'cutter',
    nodeRequired: 'nineCuts',
    name: 'Nine Cuts',
    titleCard: 'NINE CUTS',
    hotkey: 'R',
    icon: 'nineCuts',
    accent: PALETTE.signal,
    chargeNeeded: 85,
    requiresTargetWithinPx: 300,
    pauseChargeWhileActive: true,
    totalDamageMult: 9.0,
    cuts: 9,
    radius: 300,
    summary: '900% Total ATK · 9 Cuts + Bleed + Rain of Swords · 85 Charge',
    desc: 'Needs 85 charge. Time stops for 9 cuts at 75ms each (80% ATK + 1 Bleed stack per cut, 720% single-target) followed by a 180% ATK Rain of Swords radial blade barrage.',
    steps: buildSenaCutSteps({
      cutsCount: 9,
      cutIntervalMs: 75,
      damageMultPerCut: 0.80,
      applyBleed: true,
      titleCard: 'NINE CUTS',
      rainOfSwords: true,
      rainDamageMult: 1.80,
    }),
  },

  holdTheLine: {
    id: 'holdTheLine',
    classId: 'sena',
    branch: 'anvil',
    nodeRequired: 'holdTheLine',
    name: 'Hold the Line',
    titleCard: 'HOLD THE LINE',
    hotkey: 'R',
    icon: 'holdTheLine',
    accent: PALETTE.signal,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 0.8,
    radius: 300,
    standDuration: 6.0,
    counterBurstRadius: 120,
    counterBurstMult: 0.80,
    summary: '6s Dug In Stand · -60% DMG · 80% ATK Counter-Burst',
    desc: 'Slam the Railcut to enter a 6s Dug In stand: draws enemies within 300px, -60% damage taken, and returns 80% ATK in a 120px burst on every hit.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'HOLD THE LINE',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.08,
          twoToneWorld: false,
        },
      },
      {
        t: 380,
        action: 'senaHoldTheLineStart',
        nonGameplay: false,
        params: {
          unfreezeWorld: true,
          returnControl: true,
          letterboxOut: true,
          zoom: 1.0,
          standDuration: 6.0,
          tauntRadius: 300,
          counterBurstRadius: 120,
          counterBurstMult: 0.80,
          whiteFlashFrames: 1,
          shakePx: 6,
          impactFrame: {
            kind: 'groundSlam',
            frames: 3,
            color: PALETTE.signal,
          },
        },
      },
      {
        t: 1500,
        action: 'senaHoldTheLinePulse',
        nonGameplay: false,
        params: { tauntRadius: 300 },
      },
      {
        t: 3000,
        action: 'senaHoldTheLinePulse',
        nonGameplay: false,
        params: { tauntRadius: 300 },
      },
      {
        t: 4500,
        action: 'senaHoldTheLinePulse',
        nonGameplay: false,
        params: { tauntRadius: 300 },
      },
      {
        t: 6380,
        action: 'endCast',
        nonGameplay: false,
        params: {},
      },
    ],
  },

  // ===========================================================================
  // 2) ROOK MATSUDA — TEN COUNT (Hand), LONG COUNT (Surveyor), DEAD GROUND (Minelayer)
  // ===========================================================================
  railSlug: {
    id: 'railSlug',
    classId: 'rook',
    branch: null,
    nodeRequired: null,
    name: 'Anti-Materiel Rail Slug',
    titleCard: 'RAIL SLUG',
    hotkey: 'R',
    icon: 'railSlug',
    accent: PALETTE.brass,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 12.0,
    range: 1400,
    lineWidth: 90,
    summary: '1200% ATK · 90px Wide Corridor · 80px AOE Detonations',
    desc: 'Rook locks into a braced stance and supercharges a colossal 90px-wide anti-materiel tungsten rail slug across 1400px. Pierces all enemies for 1200% ATK, marking targets and detonating 80px kinetic AOE shockwaves (350% ATK) on every enemy struck.',
    steps: buildRailSlugSteps(),
  },

  tenCount: {
    id: 'tenCount',
    classId: 'rook',
    branch: null,
    nodeRequired: null,
    name: 'Ten Count',
    titleCard: 'TEN COUNT',
    hotkey: 'R',
    icon: 'tenCount',
    accent: PALETTE.brass,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 6.0,
    bolts: 10,
    range: 520,
    summary: '600% Total ATK · 10 Piercing Bolts',
    desc: 'Rook plants his feet, sights down a red aim line for 1s, then fires 10 piercing rail bolts for 600% total ATK.',
    steps: buildTenCountSteps(),
  },

  longCount: {
    id: 'longCount',
    classId: 'rook',
    branch: 'longhand',
    nodeRequired: 'longCount',
    name: 'Long Count',
    titleCard: 'LONG COUNT',
    hotkey: 'R',
    icon: 'longCount',
    accent: PALETTE.brass,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 9.0,
    bolts: 1,
    range: 620,
    summary: '900% ATK · 1.6s Charge · Marks All Hit',
    desc: 'Rook sets his Surveyor tripod for a 1.6s rangefinder charge, then fires one massive rail slug dealing 900% ATK and Marking every enemy hit.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'LONG COUNT',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.15,
          twoToneWorld: false,
          aimLineRange: 620,
          aimLineColor: PALETTE.brass,
          chargeDurationMs: 1600,
        },
      },
      {
        t: 730,
        action: 'rookChargeTick',
        nonGameplay: false,
        params: { tickIndex: 2, totalTicks: 8 },
      },
      {
        t: 1130,
        action: 'rookChargeTick',
        nonGameplay: false,
        params: { tickIndex: 4, totalTicks: 8 },
      },
      {
        t: 1530,
        action: 'rookChargeTick',
        nonGameplay: false,
        params: { tickIndex: 6, totalTicks: 8 },
      },
      {
        t: 1930,
        action: 'rookReleaseLongCount',
        nonGameplay: false,
        params: {
          damageMult: 9.0, // 900% ATK
          range: 620,
          lineWidth: 30,
          applyMarkedDuration: 5.0,
          whiteFlashFrames: 1,
          shakePx: 8,
          impactFrame: {
            kind: 'rail',
            frames: 4,
            color: PALETTE.brass,
          },
        },
      },
      {
        t: 2200,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  deadGround: {
    id: 'deadGround',
    classId: 'rook',
    branch: 'wirehand',
    nodeRequired: 'deadGround',
    name: 'Dead Ground',
    titleCard: 'DEAD GROUND',
    hotkey: 'R',
    icon: 'deadGround',
    accent: PALETTE.brass,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 26.4,
    mines: 12,
    radius: 220,
    summary: '12 Proximity Mines · 220% ATK Each · 220px Field',
    desc: 'Rook lobs 12 fused proximity mines over 1.5s across a 220px field, each exploding for 220% ATK in an 80px blast.',
    steps: buildDeadGroundSteps(),
  },

  // ===========================================================================
  // 3) INES CALLOWAY — SCRAPFALL (Hand), CRANE DROP (Crane), JUNKYARD RAIN (Wrecker)
  // ===========================================================================
  scrapfall: {
    id: 'scrapfall',
    classId: 'ines',
    branch: null,
    nodeRequired: null,
    name: 'Scrapfall',
    titleCard: 'SCRAPFALL',
    hotkey: 'R',
    icon: 'scrapfall',
    accent: PALETTE.verdigris,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 5.5,
    radius: 160,
    stunDuration: 1.5,
    summary: '550% ATK · 160px Radius · 1.5s Stun',
    desc: 'Levitates loose wreck parts within 400px over 1s above a 160px target circle, then slams them down for 550% ATK and a 1.5s Stun.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
          refillScrapOrbit: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'SCRAPFALL',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.12,
          twoToneWorld: false,
        },
      },
      {
        t: 330,
        action: 'inesLevitateScrap',
        nonGameplay: false,
        params: {
          radius: 160,
          gatherRadius: 400,
          levitateDurationMs: 1000,
          wreckPieceCount: 14,
        },
      },
      {
        t: 1330,
        action: 'inesSlamScrapWave',
        nonGameplay: false,
        params: {
          radius: 160,
          damageMult: 5.5, // 550% ATK
          stunDuration: 1.5,
          whiteFlashFrames: 1,
          shakePx: 7,
          spawnCrater: true,
          impactFrame: {
            kind: 'crush',
            frames: 4,
            color: PALETTE.verdigris,
          },
        },
      },
      {
        t: 1600,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  craneDrop: {
    id: 'craneDrop',
    classId: 'ines',
    branch: 'binder',
    nodeRequired: 'craneDrop',
    name: 'Crane Drop',
    titleCard: 'CRANE DROP',
    hotkey: 'R',
    icon: 'craneDrop',
    accent: PALETTE.verdigris,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 6.0,
    radius: 170,
    stunDuration: 2.0,
    summary: '8s Overhead Gantry Crane · 3 Heavy Scrap Compactor Slams',
    desc: 'Deploys an industrial magnetic gantry crane with yellow/black hazard girders and suspension cables that drops an 80-ton scrap compactor block 3 times across an 8s duration for 600% total ATK and 2s Stun per slam.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
          refillScrapOrbit: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'CRANE DROP',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.08,
          twoToneWorld: false,
        },
      },
      {
        t: 330,
        action: 'inesDeployGantryCrane',
        nonGameplay: false,
        params: {
          radius: 170,
          durationMs: 8000,
        },
      },
      {
        t: 480,
        action: 'returnControlEarly',
        nonGameplay: false,
        params: {
          letterboxOut: true,
          zoom: 1.0,
        },
      },
      {
        t: 1330,
        action: 'inesGantryCraneDrop',
        nonGameplay: false,
        params: {
          waveIndex: 1,
          radius: 170,
          damageMult: 2.0,
          stunDuration: 2.0,
          shakePx: 7,
          spawnCrater: true,
          impactFrame: {
            kind: 'gantrySlam',
            frames: 3,
            color: PALETTE.verdigris,
          },
        },
      },
      {
        t: 4330,
        action: 'inesGantryCraneDrop',
        nonGameplay: false,
        params: {
          waveIndex: 2,
          radius: 170,
          damageMult: 2.0,
          stunDuration: 2.0,
          shakePx: 7,
          spawnCrater: true,
          impactFrame: {
            kind: 'gantrySlam',
            frames: 3,
            color: PALETTE.verdigris,
          },
        },
      },
      {
        t: 7330,
        action: 'inesGantryCraneDrop',
        nonGameplay: false,
        params: {
          waveIndex: 3,
          radius: 170,
          damageMult: 2.0,
          stunDuration: 2.0,
          shakePx: 8,
          spawnCrater: true,
          impactFrame: {
            kind: 'gantrySlam',
            frames: 4,
            color: PALETTE.verdigris,
          },
        },
      },
      {
        t: 8330,
        action: 'endCast',
        nonGameplay: false,
        params: {},
      },
    ],
  },

  junkyardRain: {
    id: 'junkyardRain',
    classId: 'ines',
    branch: 'slinger',
    nodeRequired: 'junkyardRain',
    name: 'Zero-Point Reversal',
    titleCard: 'ZERO-POINT REVERSAL',
    hotkey: 'R',
    icon: 'junkyardRain',
    accent: PALETTE.verdigris,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 8.0,
    radius: 270,
    stunDuration: 2.0,
    summary: '800% Total ATK · Dual-Polarity Singularity Vortex · Polar Inversion Detonation',
    desc: 'Spins up counter-rotating positive (+) cyan and negative (-) magenta magnetic particle streams into a dense 270px central singularity, dragging in enemies and metal debris (360% ATK across 2 pulses), before violently inverting polarity in a screen-wide repulsion detonation for 440% ATK and 2.0s Stun.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
          refillScrapOrbit: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'ZERO-POINT REVERSAL',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.15,
          twoToneWorld: false,
        },
      },
      {
        t: 330,
        action: 'inesDeployPolarityVortex',
        nonGameplay: false,
        params: {
          radius: 270,
          durationMs: 1550,
        },
      },
      {
        t: 750,
        action: 'inesPolarityPulse',
        nonGameplay: false,
        params: {
          pulseIndex: 1,
          radius: 260,
          damageMult: 1.8,
          pullInwardPx: 75,
          shakePx: 6,
          impactFrame: {
            kind: 'polarityFlip',
            frames: 3,
            color: PALETTE.verdigris,
          },
        },
      },
      {
        t: 1150,
        action: 'inesPolarityPulse',
        nonGameplay: false,
        params: {
          pulseIndex: 2,
          radius: 265,
          damageMult: 1.8,
          pullInwardPx: 85,
          shakePx: 7,
          impactFrame: {
            kind: 'polarityFlip',
            frames: 3,
            color: PALETTE.verdigris,
          },
        },
      },
      {
        t: 1580,
        action: 'inesPolarityInversionBurst',
        nonGameplay: false,
        params: {
          radius: 270,
          damageMult: 4.4,
          stunDuration: 2.0,
          shakePx: 12,
          spawnCrater: true,
          impactFrame: {
            kind: 'polarityFlip',
            frames: 4,
            color: PALETTE.verdigris,
          },
        },
      },
      {
        t: 1950,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  // ============================================================================
  // KAELEN VOS — THERMO-LANCER / PYRO-ALCHEMIST ULTIMATES
  // ============================================================================

  supercriticalMeltdown: {
    id: 'supercriticalMeltdown',
    classId: 'kaelen',
    branch: null,
    nodeRequired: null,
    name: 'Supercritical Meltdown',
    titleCard: 'MELTDOWN OVERDRIVE',
    hotkey: 'R',
    icon: 'supercriticalMeltdown',
    accent: PALETTE.ember,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 14.5,
    radius: 240,
    stunDuration: 2.0,
    duration: 8.0,
    summary: '8.0s Continuous Juggernaut · Molten Slag Trail · Flame Torrent · Thermobaric Vent Finale',
    desc: 'Locks boiler valves into a 200% Supercritical Overdrive for 8.0s of continuous real-time combat (+40% Move Speed, +50% DR, Stun & Knockback immunity). Drops bubbling molten slag footsteps, unleashes a continuous 160px flamethrower torrent toward the cursor, grants 0-cooldown Steam Vents, and concludes with a 240px thermobaric shockwave (750% ATK + Stun/Corrode/Burn) on timeout or recast [R].',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: false,
          twoToneWorld: true,
          letterbox: 0.08,
          untouchable: false,
          lockMovement: false,
        },
      },
      {
        t: 40,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'MELTDOWN OVERDRIVE',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 260,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.06,
          unfreezeWorld: true,
          twoToneWorld: false,
        },
      },
      {
        t: 280,
        action: 'kaelenStartMeltdown',
        nonGameplay: false,
        params: {
          duration: 8.0,
          returnControl: true,
          letterboxOut: true,
          zoom: 1.0,
          impactFrame: {
            kind: 'meltdownVent',
            frames: 3,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 8280,
        action: 'kaelenTimeoutFinale',
        nonGameplay: false,
        params: {},
      },
      {
        t: 8600,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  sunfallFurnace: {
    id: 'sunfallFurnace',
    classId: 'kaelen',
    branch: null,
    nodeRequired: null,
    name: 'Sunfall Cataclysm',
    titleCard: 'SUNFALL CATACLYSM',
    hotkey: 'R',
    icon: 'sunfallFurnace',
    accent: PALETTE.ember,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 6.4,
    radius: 230,
    stunDuration: 2.0,
    summary: '640% Total ATK · 8-Ray Solar Flare + Meteor Rain · 230px Cataclysm',
    desc: 'Ignites a pressurized solar reactor overhead, freezing time for an ember visor cut-in before erupting 8 revolving solar flare beams, 12 falling slag meteors, and a 230px thermobaric shockwave.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 70,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'SUNFALL CATACLYSM',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.18,
          twoToneWorld: false,
        },
      },
      {
        t: 340,
        action: 'kaelenIgniteSolarCore',
        nonGameplay: false,
        params: {
          radius: 230,
          durationMs: 1350,
          rayCount: 8,
          meteorCount: 12,
          corrosiveRain: false,
          tectonicFissures: false,
        },
      },
      {
        t: 650,
        action: 'kaelenSolarPulseWave',
        nonGameplay: false,
        params: {
          waveIndex: 1,
          radius: 210,
          damageMult: 1.6,
          burnDuration: 5.0,
          corrodeStacks: 1,
          shakePx: 6,
          impactFrame: {
            kind: 'explosion',
            frames: 2,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 1050,
        action: 'kaelenSolarPulseWave',
        nonGameplay: false,
        params: {
          waveIndex: 2,
          radius: 220,
          damageMult: 1.8,
          burnDuration: 5.0,
          corrodeStacks: 1,
          shakePx: 7,
          impactFrame: {
            kind: 'explosion',
            frames: 3,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 1520,
        action: 'kaelenSolarCataclysmSlam',
        nonGameplay: false,
        params: {
          radius: 230,
          damageMult: 3.0,
          stunDuration: 2.0,
          burnDuration: 6.0,
          corrodeStacks: 2,
          shakePx: 11,
          spawnCrater: true,
          impactFrame: {
            kind: 'explosion',
            frames: 4,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 1850,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  tectonicKiln: {
    id: 'tectonicKiln',
    classId: 'kaelen',
    branch: 'furnace',
    nodeRequired: 'tectonicKiln',
    name: 'Cathedral of Iron',
    titleCard: 'CATHEDRAL OF IRON',
    hotkey: 'R',
    icon: 'tectonicKiln',
    accent: PALETTE.ember,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 9.0,
    radius: 260,
    stunDuration: 2.5,
    summary: '900% Total ATK · 4 Foundry Pillars · 80-Ton Forge Press Slam · Lava Lake',
    desc: 'Summons an open-sided industrial forge cathedral: 4 steel girder pillars crash into 4 corners of the arena connected by searing slag channels (480% ATK across 2 pulses), clamping down an 80-ton hydraulic forge press that crushes the center for 420% ATK, 2.5s Stun, and leaves a bubbling molten lava lake.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 70,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'CATHEDRAL OF IRON',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.20,
          twoToneWorld: false,
        },
      },
      {
        t: 340,
        action: 'kaelenDeployFoundryRibs',
        nonGameplay: false,
        params: {
          radius: 260,
          durationMs: 1550,
          grantMoltenJuggernaut: true,
        },
      },
      {
        t: 700,
        action: 'kaelenFoundryRibPulse',
        nonGameplay: false,
        params: {
          waveIndex: 1,
          radius: 250,
          damageMult: 2.4,
          burnDuration: 6.0,
          shakePx: 7,
          impactFrame: {
            kind: 'explosion',
            frames: 3,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 1120,
        action: 'kaelenFoundryRibPulse',
        nonGameplay: false,
        params: {
          waveIndex: 2,
          radius: 255,
          damageMult: 2.4,
          burnDuration: 6.0,
          shakePx: 8,
          impactFrame: {
            kind: 'explosion',
            frames: 3,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 1580,
        action: 'kaelenFoundryPressSlam',
        nonGameplay: false,
        params: {
          radius: 260,
          damageMult: 4.2,
          stunDuration: 2.5,
          burnDuration: 8.0,
          shakePx: 14,
          spawnCrater: true,
          spawnLavaLake: true,
          impactFrame: {
            kind: 'foundryPress',
            frames: 4,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 1950,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  blightHurricane: {
    id: 'blightHurricane',
    classId: 'kaelen',
    branch: 'alchemist',
    nodeRequired: 'blightHurricane',
    name: 'Whiteout Rupture',
    titleCard: 'WHITEOUT RUPTURE',
    hotkey: 'R',
    icon: 'blightHurricane',
    accent: PALETTE.frost,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 9.0,
    radius: 270,
    stunDuration: 2.5,
    summary: '900% Total ATK · Subzero Chemical Blizzard · Koch Snowflake Fractals · Ice Knife Rupture',
    desc: 'Unleashes an endothermic cryogenic blizzard across 270px: sprawling hexagonal ice fractals and creeping frost needles freeze the earth (-200°C), pulling enemies inward, dealing 500% ATK across 2 subzero pulses + 5 Brittle stacks, before violently detonating into a screen-clearing shatter of razor ice knives for 400% ATK and 2.5s Freeze/Stun.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 70,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'WHITEOUT RUPTURE',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.20,
          twoToneWorld: false,
        },
      },
      {
        t: 340,
        action: 'kaelenDeployCryoBlizzard',
        nonGameplay: false,
        params: {
          radius: 270,
          durationMs: 1550,
        },
      },
      {
        t: 680,
        action: 'kaelenCryoFractalPulse',
        nonGameplay: false,
        params: {
          pulseIndex: 1,
          radius: 260,
          damageMult: 2.5,
          pullInwardPx: 60,
          shakePx: 6,
          freezeDuration: 1.5,
          brittleStacks: 3,
          impactFrame: {
            kind: 'cryoShatter',
            frames: 3,
            color: PALETTE.frost,
          },
        },
      },
      {
        t: 1100,
        action: 'kaelenCryoFractalPulse',
        nonGameplay: false,
        params: {
          pulseIndex: 2,
          radius: 265,
          damageMult: 2.5,
          pullInwardPx: 70,
          shakePx: 7,
          freezeDuration: 1.5,
          brittleStacks: 2,
          impactFrame: {
            kind: 'cryoShatter',
            frames: 3,
            color: PALETTE.frost,
          },
        },
      },
      {
        t: 1580,
        action: 'kaelenCryoShrapnelBurst',
        nonGameplay: false,
        params: {
          radius: 270,
          damageMult: 4.0,
          stunDuration: 2.5,
          shakePx: 12,
          spawnCrater: true,
          impactFrame: {
            kind: 'cryoShatter',
            frames: 4,
            color: PALETTE.frost,
          },
        },
      },
      {
        t: 1950,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  // ============================================================================
  // VESPERA LOCKE — ARC-DRONE ARTIFICER / SUMMONER ULTIMATES
  // ============================================================================

  overclockedArmada: {
    id: 'overclockedArmada',
    classId: 'vespera',
    branch: null,
    nodeRequired: null,
    name: 'Cataclysm Edge / Overclocked Armada',
    titleCard: 'OVERCLOCKED ARMADA',
    hotkey: 'R',
    icon: 'overclockedArmada',
    accent: PALETTE.volt,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 11.0,
    radius: 260,
    stunDuration: 2.0,
    duration: 8.0,
    summary: '1100% Total ATK · 8.0s Continuous Escort · 12 Orbiting Arc-Drones · Kamikaze Cluster Finale',
    desc: 'Deploys an escort of 12 autonomous Arc-Drones in a concentric double ring for 8.0s of continuous combat (400% ATK twin neon lasers + Point Defense within 140px). On timeout or recast [R], drones dive-bomb the cursor (300% ATK cluster nuke) + 240px EMP shockwave (400% ATK + 2.0s Stun).',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: false,
          twoToneWorld: true,
          letterbox: 0.08,
          untouchable: false,
          lockMovement: false,
        },
      },
      {
        t: 40,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'OVERCLOCKED ARMADA',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 260,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.05,
          unfreezeWorld: true,
          twoToneWorld: false,
        },
      },
      {
        t: 280,
        action: 'vesperaStartArmada',
        nonGameplay: false,
        params: {
          duration: 8.0,
          returnControl: true,
          letterboxOut: true,
          zoom: 1.0,
          impactFrame: {
            kind: 'armadaLaunch',
            frames: 3,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 8280,
        action: 'vesperaTimeoutFinale',
        nonGameplay: false,
        params: {},
      },
      {
        t: 8600,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  orbitalSingularity: {
    id: 'orbitalSingularity',
    classId: 'vespera',
    branch: null,
    nodeRequired: null,
    name: 'Orbital Ion Singularity',
    titleCard: 'ION SINGULARITY',
    hotkey: 'R',
    icon: 'orbitalSingularity',
    accent: PALETTE.volt,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 6.6,
    radius: 240,
    stunDuration: 2.0,
    summary: '660% Total ATK · Geometric Pentagram Matrix · Ion Sky-Pillar',
    desc: 'Expands all orbiting Arc-Drones into a 240px high-voltage geometric pentagram matrix, calling down 3 orbital ion pillars that vaporize enemies for 660% total ATK and Stun for 2.0s.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 70,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'ION SINGULARITY',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.18,
          twoToneWorld: false,
        },
      },
      {
        t: 340,
        action: 'vesperaDeployIonMatrix',
        nonGameplay: false,
        params: {
          radius: 240,
          durationMs: 1380,
          vertexCount: 5,
          spawnValkyrieSwarm: false,
          thunderheadStorm: false,
        },
      },
      {
        t: 660,
        action: 'vesperaIonMatrixPulse',
        nonGameplay: false,
        params: {
          pulseIndex: 1,
          radius: 230,
          damageMult: 1.8,
          pullInwardPx: 50,
          shakePx: 6,
          impactFrame: {
            kind: 'beam',
            frames: 2,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 1060,
        action: 'vesperaIonMatrixPulse',
        nonGameplay: false,
        params: {
          pulseIndex: 2,
          radius: 235,
          damageMult: 1.8,
          pullInwardPx: 60,
          shakePx: 7,
          impactFrame: {
            kind: 'beam',
            frames: 3,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 1520,
        action: 'vesperaIonSingularityCollapse',
        nonGameplay: false,
        params: {
          radius: 240,
          damageMult: 3.0,
          stunDuration: 2.0,
          shakePx: 11,
          spawnCrater: true,
          impactFrame: {
            kind: 'beam',
            frames: 4,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 1860,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  valkyrieSwarm: {
    id: 'valkyrieSwarm',
    classId: 'vespera',
    branch: 'swarm',
    nodeRequired: 'valkyrieSwarm',
    name: 'Colossus Directive',
    titleCard: 'COLOSSUS DIRECTIVE',
    hotkey: 'R',
    icon: 'valkyrieSwarm',
    accent: PALETTE.volt,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 9.0,
    radius: 270,
    stunDuration: 2.5,
    summary: '900% Total ATK · War Colossus Automaton · Puppet Wires · Pneumatic Fist & Core Slam',
    desc: 'Vespera channels control wires from her gloves to direct a massive 68x80px War Colossus automaton. The iron construct drops in with thruster jets, executes a 220px pneumatic left fist sweep (220% ATK), stomps a hydraulic right foot shockwave (260% ATK + Stun), and locks both fists overhead for a colossal double-hammer core slam (420% ATK + 2.5s Stun + volt discharge crater).',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 70,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'COLOSSUS DIRECTIVE',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.18,
          twoToneWorld: false,
        },
      },
      {
        t: 350,
        action: 'vesperaSpawnColossus',
        nonGameplay: false,
        params: {
          radius: 270,
          durationMs: 1580,
        },
      },
      {
        t: 680,
        action: 'vesperaColossusFistSweep',
        nonGameplay: false,
        params: {
          radius: 240,
          damageMult: 2.2,
          shakePx: 8,
          impactFrame: {
            kind: 'colossusSlam',
            frames: 3,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 1100,
        action: 'vesperaColossusStomp',
        nonGameplay: false,
        params: {
          radius: 250,
          damageMult: 2.6,
          stunDuration: 1.5,
          shakePx: 9,
          impactFrame: {
            kind: 'colossusSlam',
            frames: 3,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 1580,
        action: 'vesperaColossusGrandSlam',
        nonGameplay: false,
        params: {
          radius: 270,
          damageMult: 4.2,
          stunDuration: 2.5,
          shakePx: 14,
          spawnCrater: true,
          impactFrame: {
            kind: 'colossusSlam',
            frames: 4,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 1960,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  zenithThunderhead: {
    id: 'zenithThunderhead',
    classId: 'vespera',
    branch: 'dynamo',
    nodeRequired: 'zenithThunderhead',
    name: 'Worldstorm Atlas',
    titleCard: 'WORLDSTORM ATLAS',
    hotkey: 'R',
    icon: 'zenithThunderhead',
    accent: PALETTE.cyanHolo,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 9.0,
    radius: 280,
    stunDuration: 2.6,
    summary: '900% Total ATK · Holographic Weather Radar · Isobar Contour Fronts · Sky-Lightning Cascade',
    desc: 'Projects a cyan holographic atmospheric radar grid on the floor across 280px: undulating isobar pressure bands (1013 hPa, 995 hPa, 970 hPa EYE), swirling cyclonic wind vectors, and diagonal rain squalls. Calls down 4 cascading sky-lightning bolts into opposite pressure fronts (480% ATK total) before detonating a 40px supercell ion sky pillar directly into the eye for 420% ATK and 2.6s Stun.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 70,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'WORLDSTORM ATLAS',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.22,
          twoToneWorld: false,
        },
      },
      {
        t: 340,
        action: 'vesperaDeployStormAtlas',
        nonGameplay: false,
        params: {
          radius: 280,
          durationMs: 1580,
        },
      },
      {
        t: 680,
        action: 'vesperaSkyLightningCascade',
        nonGameplay: false,
        params: {
          boltWave: 1,
          radius: 270,
          damageMult: 2.4,
          pullInwardPx: 60,
          shakePx: 8,
          impactFrame: {
            kind: 'radarSweep',
            frames: 3,
            color: PALETTE.cyanHolo,
          },
        },
      },
      {
        t: 1100,
        action: 'vesperaSkyLightningCascade',
        nonGameplay: false,
        params: {
          boltWave: 2,
          radius: 275,
          damageMult: 2.4,
          pullInwardPx: 70,
          shakePx: 9,
          impactFrame: {
            kind: 'radarSweep',
            frames: 3,
            color: PALETTE.cyanHolo,
          },
        },
      },
      {
        t: 1580,
        action: 'vesperaSupercellBurst',
        nonGameplay: false,
        params: {
          radius: 280,
          damageMult: 4.2,
          stunDuration: 2.6,
          shakePx: 13,
          spawnCrater: true,
          impactFrame: {
            kind: 'beam',
            frames: 4,
            color: PALETTE.cyanHolo,
          },
        },
      },
      {
        t: 1960,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  worldsplitter: {
    id: 'worldsplitter',
    classId: 'sena',
    branch: 'anvil',
    nodeRequired: 'worldsplitter',
    name: 'Worldsplitter',
    titleCard: 'WORLDSPLITTER',
    hotkey: 'R',
    icon: 'holdTheLine',
    accent: PALETTE.ember,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 9.0, // 350% quake + 550% eruption
    radius: 240,
    summary: '900% Total ATK · 3 Concentric Fault Rings · Searing Magma Fissures · Tectonic Eruption',
    desc: 'Smashes both hydraulic gauntlets into the bedrock, tearing 3 expanding concentric fault rings (80px, 160px, 240px) into the earth with incandescent magma fissures (350% ATK). Magma geysers erupt from the fracture intersections for 550% ATK and 2.8s Stun.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'WORLDSPLITTER',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.18,
          twoToneWorld: false,
        },
      },
      {
        t: 360,
        action: 'senaWorldsplitterStart',
        nonGameplay: false,
        params: {
          radius: 240,
          shakePx: 12,
          impactFrame: {
            kind: 'faultline',
            frames: 3,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 720,
        action: 'senaWorldsplitterQuake',
        nonGameplay: false,
        params: {
          damageMult: 3.5,
          radius: 200,
          knockbackPx: 120,
          shakePx: 10,
          impactFrame: {
            kind: 'faultline',
            frames: 3,
            color: PALETTE.brass,
          },
        },
      },
      {
        t: 1200,
        action: 'senaWorldsplitterEruption',
        nonGameplay: false,
        params: {
          damageMult: 5.5,
          radius: 240,
          stunDuration: 2.8,
          shakePx: 15,
          impactFrame: {
            kind: 'faultline',
            frames: 4,
            color: PALETTE.ember,
          },
        },
      },
      {
        t: 1680,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  perfectFrequency: {
    id: 'perfectFrequency',
    classId: 'sena',
    branch: 'cutter',
    nodeRequired: 'perfectFrequency',
    name: 'Perfect Frequency',
    titleCard: 'PERFECT FREQUENCY',
    hotkey: 'R',
    icon: 'nineCuts',
    accent: PALETTE.signal,
    chargeNeeded: 85,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 11.0, // 180% beat1 + 220% beat2 + 280% crescendo + 420% forte
    radius: 260,
    summary: '1100% Total ATK · 8-Band Equalizer Soundstage · 4 Rhythm Beats · Forte Finale',
    desc: 'Steps into a holographic 8-band audio visualizer stage on the floor. Executes timed rhythmic shock pulses on Beats 1 & 2 (400% ATK total), spins a dual conductive ribbon vortex on Beat 3 (280% ATK), and triggers Max Harmony Forte on Beat 4 for a 420% ATK 360-degree sonic-electro detonation and 2.5s Stun.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'PERFECT FREQUENCY',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.15,
          twoToneWorld: false,
        },
      },
      {
        t: 340,
        action: 'senaStartSoundstage',
        nonGameplay: false,
        params: {
          radius: 250,
          durationMs: 1700,
        },
      },
      {
        t: 660,
        action: 'senaBeatWindowDrop',
        nonGameplay: false,
        params: {
          beatIndex: 1,
          radius: 140,
          damageMult: 1.8,
          shakePx: 6,
          color: PALETTE.signal,
          impactFrame: {
            kind: 'soundstage',
            frames: 2,
            color: PALETTE.signal,
          },
        },
      },
      {
        t: 990,
        action: 'senaBeatWindowDrop',
        nonGameplay: false,
        params: {
          beatIndex: 2,
          radius: 190,
          damageMult: 2.2,
          shakePx: 8,
          color: PALETTE.volt,
          impactFrame: {
            kind: 'soundstage',
            frames: 2,
            color: PALETTE.volt,
          },
        },
      },
      {
        t: 1320,
        action: 'senaHarmonicCrescendo',
        nonGameplay: false,
        params: {
          radius: 220,
          damageMult: 2.8,
          shakePx: 10,
          impactFrame: {
            kind: 'soundstage',
            frames: 3,
            color: PALETTE.signal,
          },
        },
      },
      {
        t: 1680,
        action: 'senaForteResonanceBurst',
        nonGameplay: false,
        params: {
          radius: 260,
          damageMult: 4.2,
          stunDuration: 2.5,
          shakePx: 14,
          impactFrame: {
            kind: 'soundstage',
            frames: 4,
            color: PALETTE.bone,
          },
        },
      },
      {
        t: 2050,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },

  blackoutCascade: {
    id: 'blackoutCascade',
    classId: 'rook',
    branch: 'longhand',
    nodeRequired: 'blackoutCascade',
    name: 'Blackout Cascade',
    titleCard: 'BLACKOUT CASCADE',
    hotkey: 'R',
    icon: 'longCount',
    accent: PALETTE.signal,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 10.0, // 380% grid + 620% collapse
    radius: 260,
    summary: '1000% Total ATK · 3 Tesla Relay Pylons · High-Voltage Laser Grid · Superconductor EMP',
    desc: 'Deploys 3 high-voltage Tesla relay pylons in an equilateral triangle. High-voltage laser wires connect the pylons into a power grid zapping trapped hostiles for 380% ATK total. All 3 pylons overload inward into a blinding 260px superconductor EMP blackout detonation dealing 620% ATK and 2.8s Stun with digital matrix glitch lines.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: true,
          letterbox: 0.12,
          untouchable: true,
          lockMovement: true,
        },
      },
      {
        t: 80,
        action: 'cutInEnter',
        nonGameplay: true,
        params: {
          titleCard: 'BLACKOUT CASCADE',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          zoom: 1.18,
          twoToneWorld: false,
        },
      },
      {
        t: 350,
        action: 'rookDeployRelayPylons',
        nonGameplay: false,
        params: {
          radius: 220,
          durationMs: 1400,
        },
      },
      {
        t: 720,
        action: 'rookChargeCircuitGrid',
        nonGameplay: false,
        params: {
          radius: 220,
          damageMult: 3.8,
          pullInwardPx: 45,
          shakePx: 9,
          impactFrame: {
            kind: 'empGrid',
            frames: 3,
            color: PALETTE.signal,
          },
        },
      },
      {
        t: 1250,
        action: 'rookSuperconductorCollapse',
        nonGameplay: false,
        params: {
          radius: 260,
          damageMult: 6.2,
          stunDuration: 2.8,
          shakePx: 15,
          impactFrame: {
            kind: 'empGrid',
            frames: 4,
            color: PALETTE.bone,
          },
        },
      },
      {
        t: 1680,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },
};

// Specialization ultimate aliases
ULTIMATES.colossusDirective = ULTIMATES.valkyrieSwarm;
ULTIMATES.worldstormAtlas = ULTIMATES.zenithThunderhead;
ULTIMATES.cathedralOfIron = ULTIMATES.tectonicKiln;
ULTIMATES.whiteoutRupture = ULTIMATES.blightHurricane;
ULTIMATES.zeroPointReversal = ULTIMATES.junkyardRain;

const TIER2_FLOURISHES = {
  sena: { boneDebrisCount: 12, persistentAfterimages: true, slashWidthBonus: 1 },
  rook: { recoilKickPx: 6, doubleCasingEject: true, corridorSparkDensity: 1.5 },
  ines: { verdigrisArcCount: 8, magnetizedCraterSheen: true, debrisSpinSpeed: 1.4 },
  kaelen: { convectionHeatHaze: true, secondaryEmberRing: true, slagTailLength: 1.4 },
  vespera: { secondDroneOrbitRing: true, cyanGridScanlines: true, arcForkCount: 2 },
};

const TIER4_FLOURISHES = {
  sena: { crossScreenHorizonCleave: true, splitCorpseSpeedMult: 1.4, boneDebrisCount: 16 },
  rook: { machConeCount: 3, downrangeSonicBoom: true, recoilKickPx: 8 },
  ines: { gantryDoubleStamp: true, magneticImplosionHoldMs: 250, verdigrisArcCount: 12 },
  kaelen: { whiteHotCoreColumn: true, fivePointMagmaStar: true, convectionHeatHaze: true },
  vespera: { orbitalLockOnReticle: true, empGlitchScanlines: 8, secondDroneOrbitRing: true },
};

/**
 * Scales an ultimate definition's timeline steps, damage, radius, and camera/VFX intensity
 * for Tier 2 (Lv 15 Enhanced) and Tier 4 (Lv 45 Mastery), enforcing Section 4.5 Hard Caps
 * and Section 10.5 Class-Specific Tier Flourishes.
 */
function applyUltimateTierScaling(baseUlt, tier, forkChoice = null) {
  if (!baseUlt) return baseUlt;

  const isEnhancedTier = tier === 2;
  const isMasteryTier = tier === 4;

  let dmgScale = isEnhancedTier ? 1.30 : isMasteryTier ? 1.35 : 1.0;
  let radiusScale = isEnhancedTier ? 1.20 : isMasteryTier ? 1.22 : 1.0;
  let shakeScale = isEnhancedTier ? 1.25 : isMasteryTier ? 1.35 : 1.0;
  let durationScale = isEnhancedTier ? 1.15 : isMasteryTier ? 1.25 : 1.0;

  // Apply Skill Tree Fork modifier at Tier 3/4 if invested
  if (forkChoice === 0) {
    radiusScale *= 1.15;
    durationScale *= 1.15;
  } else if (forkChoice === 1) {
    dmgScale *= 1.20;
    shakeScale *= 1.15;
  }

  const tierLabel =
    tier === 1
      ? 'TIER I · BASE'
      : tier === 2
      ? 'TIER II · ENHANCED'
      : tier === 3
      ? 'TIER III · TRANSFORMED'
      : 'TIER IV · MASTERY';

  const suffix =
    isEnhancedTier ? ' [ENHANCED]' : isMasteryTier ? ' [MASTERY]' : '';

  const classId = baseUlt.classId || 'sena';
  const classFlourish = isMasteryTier
    ? { ...(TIER2_FLOURISHES[classId] || {}), ...(TIER4_FLOURISHES[classId] || {}) }
    : isEnhancedTier
    ? { ...(TIER2_FLOURISHES[classId] || {}) }
    : {};

  const scaledSteps = (baseUlt.steps || []).map((step) => {
    const p = { ...(step.params || {}) };
    if (typeof p.damageMult === 'number') {
      p.damageMult = +(p.damageMult * dmgScale).toFixed(2);
    }
    if (typeof p.damageMultPerCut === 'number') {
      p.damageMultPerCut = +(p.damageMultPerCut * dmgScale).toFixed(2);
    }
    if (typeof p.aoeDamageMult === 'number') {
      p.aoeDamageMult = +(p.aoeDamageMult * dmgScale).toFixed(2);
    }
    if (typeof p.counterBurstMult === 'number') {
      p.counterBurstMult = +(p.counterBurstMult * dmgScale).toFixed(2);
    }
    if (typeof p.radius === 'number') {
      p.radius = Math.round(p.radius * radiusScale);
    }
    if (typeof p.fieldRadius === 'number') {
      p.fieldRadius = Math.round(p.fieldRadius * radiusScale);
    }
    if (typeof p.aoeRadius === 'number') {
      p.aoeRadius = Math.round(p.aoeRadius * radiusScale);
    }
    if (typeof p.shakePx === 'number') {
      p.shakePx = Math.min(HARD_CAPS.maxShakePx, Math.round(p.shakePx * shakeScale));
    }
    if (typeof p.zoom === 'number') {
      p.zoom = Math.min(HARD_CAPS.maxCameraZoom, +(p.zoom * (isMasteryTier ? 1.04 : isEnhancedTier ? 1.02 : 1.0)).toFixed(2));
    }
    if (typeof p.duration === 'number') {
      p.duration = +(p.duration * durationScale).toFixed(1);
    }
    if (typeof p.stunDuration === 'number') {
      const bonus = isEnhancedTier || isMasteryTier ? 0.5 : 0;
      p.stunDuration = Math.min(HARD_CAPS.maxStunSeconds, +(p.stunDuration + bonus).toFixed(1));
    }
    if (typeof p.corrodeStacks === 'number') {
      p.corrodeStacks = Math.min(HARD_CAPS.maxCorrodeStacksPerCast, p.corrodeStacks);
    }
    if (typeof p.wreckPieceCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      const cap = Math.round(p.wreckPieceCount * HARD_CAPS.maxPrimaryCountBonus);
      p.wreckPieceCount = Math.min(cap, Math.round(p.wreckPieceCount * 1.4));
    }
    if (typeof p.rayCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      const cap = Math.round(p.rayCount * HARD_CAPS.maxPrimaryCountBonus);
      p.rayCount = Math.min(cap, p.rayCount + 4);
    }
    if (typeof p.meteorCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      const cap = Math.round(p.meteorCount * HARD_CAPS.maxPrimaryCountBonus);
      p.meteorCount = Math.min(cap, Math.round(p.meteorCount * 1.5));
    }
    if (typeof p.vertexCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      const cap = Math.round(p.vertexCount * HARD_CAPS.maxPrimaryCountBonus);
      p.vertexCount = Math.min(cap, p.vertexCount + 2);
    }
    if (isEnhancedTier || isMasteryTier) {
      if (p.applyBleed === false) p.applyBleed = true;
      if (p.corrosiveRain === false) p.corrosiveRain = true;
      if (p.tectonicFissures === false && isMasteryTier) p.tectonicFissures = true;
      if (p.thunderheadStorm === false && isMasteryTier) p.thunderheadStorm = true;
      p.classFlourish = classFlourish;
      if (p.impactFrame && typeof p.impactFrame.frames === 'number') {
        p.impactFrame = {
          ...p.impactFrame,
          frames: Math.min(HARD_CAPS.maxImpactFrames, p.impactFrame.frames + 1),
        };
      }
    }
    if (step.action === 'cutInEnter' && p.titleCard) {
      p.titleCard = `${p.titleCard}${suffix}`;
    }
    return {
      ...step,
      params: p,
    };
  });

  return {
    ...baseUlt,
    pauseChargeWhileActive: true,
    tier,
    tierLabel,
    classFlourish,
    vfxProfile: CLASS_VFX_PROFILES[classId] || CLASS_VFX_PROFILES.sena,
    name: `${baseUlt.name}${suffix}`,
    titleCard: `${baseUlt.titleCard}${suffix}`,
    totalDamageMult: +(baseUlt.totalDamageMult * dmgScale).toFixed(2),
    radius: baseUlt.radius ? Math.round(baseUlt.radius * radiusScale) : baseUlt.radius,
    steps: scaledSteps,
  };
}

/**
 * Resolves the Base Ultimate (Levels 1-29) for each character.
 * Every character has a completely distinct mechanic, animation, and VFX palette.
 */
function getBaseUltimateForCharacter(classId = 'sena') {
  switch (classId) {
    case 'sena':
      return ULTIMATES.sevenCuts; // Omnislash time-stop spatial cuts
    case 'rook':
      return ULTIMATES.tenCount; // 10-round rapid precision ballistic barrage
    case 'ines':
      return ULTIMATES.scrapfall; // Magnetic levitation & orbital wreck slam
    case 'kaelen':
      return ULTIMATES.sunfallFurnace; // Solar reactor ignition & slag meteor rain
    case 'vespera':
      return ULTIMATES.orbitalSingularity; // Geometric drone matrix & ion sky-pillars
    default:
      return ULTIMATES.sevenCuts;
  }
}

/**
 * Resolves the Transformed Ultimate (Levels 30+) based on specialization, equipped ultimate, or master node.
 * Every class/specialization transforms into a fundamentally new mechanic and animation at Level 30.
 */
function getTransformedUltimateForPlayer(
  classId = 'sena',
  ownedNodes = [],
  activeClassId = null,
  ultimateSlot = null
) {
  const ultKey = (ultimateSlot || '').toLowerCase();
  if (ultKey) {
    if (ultKey.includes('meltdown') || ultKey.includes('flyover') || ultKey.includes('broadside')) {
      return ULTIMATES.supercriticalMeltdown;
    }
    if (ultKey.includes('cathedral') || ultKey.includes('tectonic') || ultKey.includes('kiln')) {
      return ULTIMATES.tectonicKiln;
    }
    if (ultKey.includes('whiteout') || ultKey.includes('rupture') || ultKey.includes('blight')) {
      return ULTIMATES.blightHurricane;
    }
    if (ultKey.includes('armada') || ultKey.includes('cleaver') || ultKey.includes('cataclysm-edge')) {
      return ULTIMATES.overclockedArmada;
    }
    if (ultKey.includes('colossus') || ultKey.includes('valkyrie') || ultKey.includes('puppeteer')) {
      return ULTIMATES.valkyrieSwarm;
    }
    if (ultKey.includes('worldstorm') || ultKey.includes('thunderhead') || ultKey.includes('supercell')) {
      return ULTIMATES.zenithThunderhead;
    }
    if (ultKey.includes('corridor') || ultKey.includes('phantom') || ultKey.includes('nine')) {
      return ULTIMATES.nineCuts;
    }
    if (ultKey.includes('worldsplitter') || ultKey.includes('cataclysm-fissure') || ultKey.includes('riftbreaker')) {
      return ULTIMATES.worldsplitter;
    }
    if (ultKey.includes('frequency') || ultKey.includes('crescendo') || ultKey.includes('pulsedancer')) {
      return ULTIMATES.perfectFrequency;
    }
    if (ultKey.includes('meridian') || ultKey.includes('curtain') || ultKey.includes('railhunter') || ultKey.includes('slug')) {
      return ULTIMATES.railSlug;
    }
    if (ultKey.includes('weather') || ultKey.includes('battery') || ultKey.includes('siegegunner') || ultKey.includes('dead')) {
      return ULTIMATES.deadGround;
    }
    if (ultKey.includes('blackout') || ultKey.includes('static-grid') || ultKey.includes('circuitwarden')) {
      return ULTIMATES.blackoutCascade;
    }
    if (ultKey.includes('press') || ultKey.includes('polarity-collapse') || ultKey.includes('magnetcrusher') || ultKey.includes('crane')) {
      return ULTIMATES.craneDrop;
    }
    if (ultKey.includes('typhoon') || ultKey.includes('scrap-maelstrom') || ultKey.includes('scrapstorm') || ultKey.includes('reversal') || ultKey.includes('flux-implosion') || ultKey.includes('polaritybreaker')) {
      return ULTIMATES.junkyardRain;
    }
  }

  const specKey = (activeClassId || '').toLowerCase();
  if (specKey) {
    if (specKey === 'cindercorsair') return ULTIMATES.supercriticalMeltdown;
    if (specKey === 'cruciblearchitect') return ULTIMATES.tectonicKiln;
    if (specKey === 'cryosaboteur') return ULTIMATES.blightHurricane;
    if (specKey === 'voltreaver') return ULTIMATES.overclockedArmada;
    if (specKey === 'ironpuppeteer') return ULTIMATES.valkyrieSwarm;
    if (specKey === 'stormcartographer') return ULTIMATES.zenithThunderhead;
    if (specKey === 'phantomedge') return ULTIMATES.nineCuts;
    if (specKey === 'riftbreaker') return ULTIMATES.worldsplitter;
    if (specKey === 'pulsedancer') return ULTIMATES.perfectFrequency;
    if (specKey === 'railhunter') return ULTIMATES.railSlug;
    if (specKey === 'siegegunner') return ULTIMATES.deadGround;
    if (specKey === 'circuitwarden') return ULTIMATES.blackoutCascade;
    if (specKey === 'magnetcrusher') return ULTIMATES.craneDrop;
    if (specKey === 'scrapstorm') return ULTIMATES.junkyardRain;
    if (specKey === 'polaritybreaker') return ULTIMATES.junkyardRain;
  }

  if (classId === 'sena') {
    if (ownedNodes.includes('holdTheLine')) return ULTIMATES.holdTheLine;
    if (ownedNodes.includes('worldsplitter')) return ULTIMATES.worldsplitter;
    if (ownedNodes.includes('perfectFrequency')) return ULTIMATES.perfectFrequency;
    return ULTIMATES.nineCuts;
  }
  if (classId === 'rook') {
    if (ownedNodes.includes('deadGround')) return ULTIMATES.deadGround;
    if (ownedNodes.includes('blackoutCascade')) return ULTIMATES.blackoutCascade;
    return ULTIMATES.railSlug;
  }
  if (classId === 'ines') {
    if (ownedNodes.includes('junkyardRain')) return ULTIMATES.junkyardRain;
    return ULTIMATES.craneDrop;
  }
  if (classId === 'kaelen') {
    if (ownedNodes.includes('tectonicKiln')) return ULTIMATES.tectonicKiln;
    if (ownedNodes.includes('blightHurricane')) return ULTIMATES.blightHurricane;
    return ULTIMATES.supercriticalMeltdown;
  }
  if (classId === 'vespera') {
    if (ownedNodes.includes('valkyrieSwarm')) return ULTIMATES.valkyrieSwarm;
    if (ownedNodes.includes('zenithThunderhead')) return ULTIMATES.zenithThunderhead;
    return ULTIMATES.overclockedArmada;
  }
  return ULTIMATES.nineCuts;
}

/**
 * Resolves the active Ultimate definition for a given player class, active specialization,
 * equipped ultimate slot, unlocked Master nodes, and player Level (4-Tier Progression: Lv 1, 15, 30, 45).
 */
export function getActiveUltimateForPlayer(
  classId = 'sena',
  ownedNodes = [],
  activeClassId = null,
  ultimateSlot = null,
  playerLevel = 1,
  forkChoice = null
) {
  const lvl = Number.isFinite(playerLevel) ? playerLevel : 1;

  // Determine Upgrade Tier:
  // Level 1-14:  Tier 1 (Base Ultimate)
  // Level 15-29: Tier 2 (Enhanced Base Ultimate)
  // Level 30-44: Tier 3 (Transformed Specialization Ultimate)
  // Level 45+:   Tier 4 (Mastery Specialization Ultimate)
  const tier = lvl >= 45 ? 4 : lvl >= 30 ? 3 : lvl >= 15 ? 2 : 1;

  // If explicit legacy master nodes were passed without a level (e.g. unit tests), honor them
  const hasExplicitMasterNode = Array.isArray(ownedNodes) && ownedNodes.length > 0;
  const useTransformed = tier >= 3 || hasExplicitMasterNode;

  const baseDef = useTransformed
    ? getTransformedUltimateForPlayer(classId, ownedNodes, activeClassId, ultimateSlot)
    : getBaseUltimateForCharacter(classId);

  return applyUltimateTierScaling(baseDef, tier, forkChoice);
}

export default ULTIMATES;


