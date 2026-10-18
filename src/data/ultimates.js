/**
 * GRAVEL SKY — Ultimates Data & Timeline Definitions
 * All numbers, charge meter rules, casting rules, accessibility defaults,
 * and step-by-step sequencer timelines ({ t, action, params }) live here.
 * Internal resolution reference: 480x270.
 */

import { PALETTE } from './config.js';

export const ULTIMATE_CHARGE_CONFIG = {
  maxCharge: 100,
  nineCutsChargeNeeded: 85,
  basicHitGain: 1.2,
  skillHitGain: 3.0,
  skillHitMaxEnemiesPerCast: 3,
  damageTakenGainPerPctMaxHp: 0.8,
  killBonus: {
    common: 1.5,
    elite: 8.0,
    boss: 0.0,
  },
  damageDealtGainCapPerSecond: 6.0,
  classMultipliers: {
    sena: 1.0,
    rook: 0.6,
    ines: 0.7,
  },
  counterweightBlockMultiplier: 2.0,
  pausedDuringUltimates: ['holdTheLine', 'craneDrop'],
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
  bossStaggerBase: 25,
  bossStaggerPerSecStun: 10,
  maxCameraZoom: 1.15,
  letterboxHeightRatio: 0.12, // 12% of 270px = 32px top & bottom
  accessibilityDefaults: {
    reduceFlashes: false,
    shortUltimates: false,
  },
  shortUltimatesCutInMs: 120,
  shortUltimatesNonGameplayScale: 0.7, // compresses non-gameplay steps by 30%
  reduceFlashesBoneTintFrames: 3,
  reduceFlashesMaxPerSecond: 3,
};

/**
 * Helper to build the 7 or 9 cut steps for Sena's Seven Cuts / Nine Cuts
 */
function buildSenaCutSteps({
  cutsCount = 7,
  cutIntervalMs = 90,
  damageMultPerCut = 5.0 / 7,
  applyBleed = false,
  titleCard = 'SEVEN CUTS',
}) {
  const cutStartMs = 380;
  const silenceStartMs = cutStartMs + cutsCount * cutIntervalMs; // 1010ms for 7 cuts, 1055ms for 9 cuts
  const releaseMs = silenceStartMs + 200; // 1210ms for 7 cuts, 1255ms for 9 cuts
  const endMs = releaseMs + 290; // 1500ms for 7 cuts, 1545ms for 9 cuts

  const steps = [
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
        titleCard,
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
        shakePx: 4,
        invertFrames: 1,
        damageMult: damageMultPerCut,
        applyBleed,
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
        totalCuts: cutsCount,
        damageMultPerCut,
        applyBleed,
        whiteFlashFrames: 1,
        shakePx: 8,
        boneDebrisCount: 16,
        letterboxOut: true,
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
 * Helper to build Rook's Ten Count timeline
 */
function buildTenCountSteps() {
  const steps = [
    {
      t: 0,
      action: 'startCast',
      nonGameplay: true,
      params: {
        freezeWorld: true,
        twoToneWorld: false,
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
        titleCard: 'TEN COUNT',
        slideFromRight: true,
        speedLines8Dir: true,
      },
    },
    {
      t: 330,
      action: 'cutInExit',
      nonGameplay: true,
      params: {
        unfreezeWorld: true,
        zoom: 1.12,
        aimLineRange: 520,
        aimLineColor: PALETTE.blood,
        chargeDurationMs: 1000,
      },
    },
  ];

  // 10 ratchet clicks during the 1000ms charge (330ms..1330ms)
  for (let i = 0; i < 10; i++) {
    steps.push({
      t: 330 + i * 100,
      action: 'rookChargeTick',
      nonGameplay: false,
      params: {
        tickIndex: i,
        totalTicks: 10,
      },
    });
  }

  // Release: 10 bolts in a tight line down cursor direction (600% ATK total = 60% each)
  for (let b = 0; b < 10; b++) {
    steps.push({
      t: 1330 + b * 45,
      action: 'rookFireTenCountBolt',
      nonGameplay: false,
      params: {
        boltIndex: b,
        totalBolts: 10,
        damageMult: 0.60, // 10 x 60% = 600% ATK total
        range: 520,
        speed: 920,
        shakePx: 3,
        whiteFlashFrames: b === 0 ? 1 : 0,
      },
    });
  }

  steps.push({
    t: 1850,
    action: 'endCast',
    nonGameplay: true,
    params: {},
  });

  return steps;
}

/**
 * Helper to build Rook's Dead Ground (Minelayer Master) timeline
 */
function buildDeadGroundSteps() {
  const steps = [
    {
      t: 0,
      action: 'startCast',
      nonGameplay: true,
      params: {
        freezeWorld: true,
        twoToneWorld: false,
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
        titleCard: 'DEAD GROUND',
        slideFromRight: true,
        speedLines8Dir: true,
      },
    },
    {
      t: 330,
      action: 'cutInExit',
      nonGameplay: true,
      params: {
        unfreezeWorld: true,
        zoom: 1.10,
        fieldRadius: 220,
      },
    },
  ];

  // Drop 12 mines over 1.5s (330ms..1830ms, 125ms apart) in a 220px field
  for (let m = 0; m < 12; m++) {
    steps.push({
      t: 330 + m * 125,
      action: 'rookDropDeadGroundMine',
      nonGameplay: false,
      params: {
        mineIndex: m,
        totalMines: 12,
        fieldRadius: 220,
        blastRadius: 80,
        damageMult: 2.20, // 220% ATK each
        shakePx: 2,
      },
    });
  }

  steps.push(
    {
      t: 1830,
      action: 'rookReleaseDeadGround',
      nonGameplay: false,
      params: {
        whiteFlashFrames: 1,
        shakePx: 5,
      },
    },
    {
      t: 1980,
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
    pauseChargeWhileActive: false,
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
    pauseChargeWhileActive: false,
    totalDamageMult: 7.2,
    cuts: 9,
    radius: 300,
    summary: '720% Total ATK · 9 Cuts + Bleed · 85 Charge',
    desc: 'Needs 85 charge. Time stops for 9 cuts at 75ms each (80% ATK + 1 Bleed stack per cut, 720% single-target).',
    steps: buildSenaCutSteps({
      cutsCount: 9,
      cutIntervalMs: 75,
      damageMultPerCut: 0.80,
      applyBleed: true,
      titleCard: 'NINE CUTS',
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
          twoToneWorld: false,
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
    pauseChargeWhileActive: false,
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
    pauseChargeWhileActive: false,
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
          twoToneWorld: false,
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
          unfreezeWorld: true,
          zoom: 1.15,
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
    pauseChargeWhileActive: false,
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
    pauseChargeWhileActive: false,
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
          twoToneWorld: false,
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
          unfreezeWorld: true,
          zoom: 1.12,
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
    totalDamageMult: 5.5,
    radius: 160,
    stunDuration: 2.0,
    summary: '8s Floating Junkyard · 3 Waves · 2s Stun/Wave',
    desc: 'Forms an 8s hovering magnetic junkyard over a 160px zone that slams down 3 times for 550% total ATK and a 2s Stun per wave.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: false,
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
          unfreezeWorld: true,
          zoom: 1.08,
        },
      },
      {
        t: 330,
        action: 'inesLevitateScrap',
        nonGameplay: false,
        params: {
          radius: 160,
          gatherRadius: 400,
          levitateDurationMs: 8000,
          wreckPieceCount: 16,
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
        action: 'inesSlamScrapWave',
        nonGameplay: false,
        params: {
          waveIndex: 1,
          radius: 160,
          damageMult: 5.5 / 3,
          stunDuration: 2.0,
          whiteFlashFrames: 1,
          shakePx: 5,
          spawnCrater: true,
          keepLevitating: true,
        },
      },
      {
        t: 4330,
        action: 'inesSlamScrapWave',
        nonGameplay: false,
        params: {
          waveIndex: 2,
          radius: 160,
          damageMult: 5.5 / 3,
          stunDuration: 2.0,
          whiteFlashFrames: 1,
          shakePx: 5,
          spawnCrater: true,
          keepLevitating: true,
        },
      },
      {
        t: 7330,
        action: 'inesSlamScrapWave',
        nonGameplay: false,
        params: {
          waveIndex: 3,
          radius: 160,
          damageMult: 5.5 / 3,
          stunDuration: 2.0,
          whiteFlashFrames: 1,
          shakePx: 6,
          spawnCrater: true,
          keepLevitating: false,
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
    name: 'Junkyard Rain',
    titleCard: 'JUNKYARD RAIN',
    hotkey: 'R',
    icon: 'junkyardRain',
    accent: PALETTE.verdigris,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: false,
    totalDamageMult: 7.5,
    radius: 260,
    stunDuration: 1.5,
    summary: '750% Total ATK · 260px Radius · 3 Heavy Waves',
    desc: 'Expands Scrapfall to a 260px magnetic tempest that slams 3 heavy waves of scrap for 750% total ATK and a 1.5s Stun.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: true,
          twoToneWorld: false,
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
          titleCard: 'JUNKYARD RAIN',
          slideFromRight: true,
          speedLines8Dir: true,
        },
      },
      {
        t: 330,
        action: 'cutInExit',
        nonGameplay: true,
        params: {
          unfreezeWorld: true,
          zoom: 1.15,
        },
      },
      {
        t: 330,
        action: 'inesLevitateScrap',
        nonGameplay: false,
        params: {
          radius: 260,
          gatherRadius: 440,
          levitateDurationMs: 1350,
          wreckPieceCount: 24,
        },
      },
      {
        t: 930,
        action: 'inesSlamScrapWave',
        nonGameplay: false,
        params: {
          waveIndex: 1,
          radius: 260,
          damageMult: 2.5, // Wave 1: 250% ATK
          stunDuration: 0.5,
          whiteFlashFrames: 1,
          shakePx: 5,
          spawnCrater: true,
          keepLevitating: true,
        },
      },
      {
        t: 1280,
        action: 'inesSlamScrapWave',
        nonGameplay: false,
        params: {
          waveIndex: 2,
          radius: 260,
          damageMult: 2.5, // Wave 2: 250% ATK
          stunDuration: 0.5,
          whiteFlashFrames: 1,
          shakePx: 6,
          spawnCrater: true,
          keepLevitating: true,
        },
      },
      {
        t: 1630,
        action: 'inesSlamScrapWave',
        nonGameplay: false,
        params: {
          waveIndex: 3,
          radius: 260,
          damageMult: 2.5, // Wave 3: 250% ATK (750% total)
          stunDuration: 1.5,
          whiteFlashFrames: 1,
          shakePx: 8,
          spawnCrater: true,
          keepLevitating: false,
        },
      },
      {
        t: 1900,
        action: 'endCast',
        nonGameplay: true,
        params: {},
      },
    ],
  },
};

/**
 * Resolves the active Ultimate definition for a given player class & unlocked Master nodes.
 */
export function getActiveUltimateForPlayer(classId = 'sena', ownedNodes = []) {
  if (classId === 'sena') {
    if (ownedNodes.includes('nineCuts')) return ULTIMATES.nineCuts;
    if (ownedNodes.includes('holdTheLine')) return ULTIMATES.holdTheLine;
    return ULTIMATES.sevenCuts;
  }
  if (classId === 'rook') {
    if (ownedNodes.includes('longCount')) return ULTIMATES.longCount;
    if (ownedNodes.includes('deadGround')) return ULTIMATES.deadGround;
    return ULTIMATES.tenCount;
  }
  if (classId === 'ines') {
    if (ownedNodes.includes('craneDrop')) return ULTIMATES.craneDrop;
    if (ownedNodes.includes('junkyardRain')) return ULTIMATES.junkyardRain;
    return ULTIMATES.scrapfall;
  }
  return ULTIMATES.sevenCuts;
}

export default ULTIMATES;
