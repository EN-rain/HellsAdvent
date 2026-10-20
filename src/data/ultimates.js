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
    kaelen: 0.9,
    vespera: 0.8,
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
  impactFrames: {
    slashCutFrames: 2,
    slashShatterFrames: 4,
    groundSlamFrames: 3,
    pierceVectorFrames: 2,
    pierceFinisherFrames: 3,
    railSlugFrames: 4,
    mineBlastFrames: 3,
    scrapCrushFrames: 3,
    scrapFinalCrushFrames: 4,
  },
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
        totalCuts: cutsCount,
        damageMultPerCut,
        applyBleed,
        whiteFlashFrames: 1,
        shakePx: 8,
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
 * Helper to build Rook's Anti-Materiel Rail Slug timeline
 */
function buildRailSlugSteps() {
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
        titleCard: 'RAIL SLUG',
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
        aimLineRange: 1400,
        aimLineColor: PALETTE.brass,
        chargeDurationMs: 1000,
      },
    },
  ];

  for (let i = 0; i < 5; i++) {
    steps.push({
      t: 380 + i * 180,
      action: 'rookChargeTick',
      nonGameplay: false,
      params: { tickIndex: i, totalTicks: 5 },
    });
  }

  steps.push({
    t: 1300,
    action: 'rookReleaseRailSlug',
    nonGameplay: false,
    params: {
      damageMult: 12.0, // 1200% ATK direct rail impact
      aoeDamageMult: 3.5, // 350% ATK secondary kinetic blast
      aoeRadius: 80, // 80px radius detonation around each hit target
      range: 1400,
      lineWidth: 90,
      applyMarkedDuration: 8.0,
      whiteFlashFrames: 1,
      shakePx: 14,
      impactFrame: {
        kind: 'rail',
        frames: 4,
        color: PALETTE.brass,
      },
    },
  });

  steps.push({
    t: 1650,
    action: 'endCast',
    nonGameplay: true,
    params: {},
  });

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
    const isFirst = b === 0;
    const isLast = b === 9;
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
        shakePx: isLast ? 5 : 3,
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
        impactFrame: {
          kind: 'mineBlast',
          frames: 3,
          color: PALETTE.brass,
        },
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
    pauseChargeWhileActive: false,
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
          zoom: 1.08,
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
            kind: 'crush',
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
            kind: 'crush',
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
            kind: 'crush',
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
    pauseChargeWhileActive: false,
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
            kind: 'crush',
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
            kind: 'crush',
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
            kind: 'crush',
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
          twoToneWorld: false,
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
    totalDamageMult: 8.5,
    radius: 260,
    stunDuration: 2.5,
    summary: '850% Total ATK · 4 Foundry Pillars · 80-Ton Forge Press Slam · Lava Lake',
    desc: 'Summons an open-sided industrial forge cathedral: 4 steel girder pillars crash into 4 corners of the arena connected by searing slag channels (220% ATK), clamping down an 80-ton hydraulic forge press that crushes the center for 400% ATK, 2.5s Stun, and leaves a bubbling molten lava lake.',
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
          damageMult: 2.2,
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
          damageMult: 2.3,
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
          damageMult: 4.0,
          stunDuration: 2.5,
          burnDuration: 8.0,
          shakePx: 14,
          spawnCrater: true,
          spawnLavaLake: true,
          impactFrame: {
            kind: 'explosion',
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
    accent: PALETTE.signal,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 8.0,
    radius: 270,
    stunDuration: 2.5,
    summary: '800% Total ATK · Subzero Chemical Blizzard · Koch Snowflake Fractals · Ice Knife Rupture',
    desc: 'Unleashes an endothermic cryogenic blizzard across 270px: sprawling hexagonal ice fractals and creeping frost needles freeze the earth (-200°C), pulling enemies inward, dealing 440% ATK across 2 subzero pulses + 5 Brittle stacks, before violently detonating into a screen-clearing shatter of razor ice knives for 360% ATK and 2.5s Freeze/Stun.',
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
          damageMult: 2.1,
          pullInwardPx: 60,
          shakePx: 6,
          freezeDuration: 1.5,
          impactFrame: {
            kind: 'slash',
            frames: 3,
            color: PALETTE.signal,
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
          damageMult: 2.3,
          pullInwardPx: 70,
          shakePx: 7,
          freezeDuration: 1.5,
          impactFrame: {
            kind: 'slash',
            frames: 3,
            color: PALETTE.signal,
          },
        },
      },
      {
        t: 1580,
        action: 'kaelenCryoShrapnelBurst',
        nonGameplay: false,
        params: {
          radius: 270,
          damageMult: 3.6,
          stunDuration: 2.5,
          shakePx: 12,
          spawnCrater: true,
          impactFrame: {
            kind: 'slash',
            frames: 4,
            color: PALETTE.signal,
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
    name: 'Overclocked Armada',
    titleCard: 'OVERCLOCKED ARMADA',
    hotkey: 'R',
    icon: 'overclockedArmada',
    accent: PALETTE.volt,
    chargeNeeded: 100,
    requiresTargetWithinPx: 0,
    pauseChargeWhileActive: true,
    totalDamageMult: 15.0,
    radius: 260,
    stunDuration: 2.0,
    duration: 8.0,
    summary: '8.0s Continuous Escort · 12 Orbiting Arc-Drones · Point Defense · Kamikaze Cluster Finale',
    desc: 'Deploys an escort of 12 autonomous Arc-Drones in a concentric double ring for 8.0s of continuous combat. Drones auto-zap incoming projectiles within 140px, fire continuous twin neon laser beams at enemies near the cursor, and on timeout or recast [R] dive-bomb the cursor in a 12-drone cluster nuke + 240px EMP shockwave.',
    steps: [
      {
        t: 0,
        action: 'startCast',
        nonGameplay: true,
        params: {
          freezeWorld: false,
          twoToneWorld: false,
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
    totalDamageMult: 8.8,
    radius: 270,
    stunDuration: 2.5,
    summary: '880% Total ATK · War Colossus Automaton · Puppet Wires · Pneumatic Fist & Core Slam',
    desc: 'Vespera channels control wires from her gloves to direct a massive 68x80px War Colossus automaton. The iron construct drops in with thruster jets, executes a 220px pneumatic left fist sweep (220% ATK), stomps a hydraulic right foot shockwave (240% ATK + Stun), and locks both fists overhead for a colossal double-hammer core slam (420% ATK + 2.5s Stun + volt discharge crater).',
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
            kind: 'groundSlam',
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
          damageMult: 2.4,
          stunDuration: 1.5,
          shakePx: 9,
          impactFrame: {
            kind: 'groundSlam',
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
            kind: 'groundSlam',
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
    accent: PALETTE.signal,
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
            kind: 'beam',
            frames: 3,
            color: PALETTE.signal,
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
            kind: 'beam',
            frames: 3,
            color: PALETTE.signal,
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
            color: PALETTE.signal,
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
            kind: 'groundSlam',
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
            kind: 'groundSlam',
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
            kind: 'groundSlam',
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
            kind: 'beam',
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
            kind: 'beam',
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
            kind: 'beam',
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
            kind: 'beam',
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
    pauseChargeWhileActive: false,
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
            kind: 'beam',
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
            kind: 'beam',
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

/**
 * Scales an ultimate definition's timeline steps, damage, radius, and camera/VFX intensity
 * for Tier 2 (Lv 15 Enhanced) and Tier 4 (Lv 45 Mastery).
 */
function applyUltimateTierScaling(baseUlt, tier, forkChoice = null) {
  if (!baseUlt) return baseUlt;

  // Tier 1 (Lv 1-14) and Tier 3 (Lv 30-44) use baseline definitions for their respective forms,
  // while Tier 2 (Lv 15-29) enhances the Lv 1 Base Ult and Tier 4 (Lv 45+) masters the Lv 30 Transformed Ult.
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
      p.shakePx = Math.round(p.shakePx * shakeScale);
    }
    if (typeof p.duration === 'number') {
      p.duration = +(p.duration * durationScale).toFixed(1);
    }
    if (typeof p.stunDuration === 'number' && (isEnhancedTier || isMasteryTier)) {
      p.stunDuration = +(p.stunDuration + 0.5).toFixed(1);
    }
    if (typeof p.wreckPieceCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      p.wreckPieceCount = Math.round(p.wreckPieceCount * 1.4);
    }
    if (typeof p.rayCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      p.rayCount += 4;
    }
    if (typeof p.meteorCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      p.meteorCount = Math.round(p.meteorCount * 1.5);
    }
    if (typeof p.vertexCount === 'number' && (isEnhancedTier || isMasteryTier)) {
      p.vertexCount += 2;
    }
    if (isEnhancedTier || isMasteryTier) {
      if (p.applyBleed === false) p.applyBleed = true;
      if (p.corrosiveRain === false) p.corrosiveRain = true;
      if (p.tectonicFissures === false && isMasteryTier) p.tectonicFissures = true;
      if (p.thunderheadStorm === false && isMasteryTier) p.thunderheadStorm = true;
      if (p.impactFrame && typeof p.impactFrame.frames === 'number') {
        p.impactFrame = {
          ...p.impactFrame,
          frames: p.impactFrame.frames + 1,
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
    tier,
    tierLabel,
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


