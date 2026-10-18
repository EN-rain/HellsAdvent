/**
 * HellsAdvent — Floor 1 Expansion & Intelligent Boss Configuration
 * Implements Approved Decisions D1–D49:
 * - 4 New Common Species (9 total)
 * - 4 New Elite Species (7 total)
 * - 9 Same-Species 10-Unit Fusion Mid-Bosses
 * - 4 Main Boss Objective / Ritual / Kill-Gate Parameters
 * - Suggested Boss Order (D49: Big Axle -> The Long Dry -> Mother Sump -> The Foreman)
 * - Kettle Reactive Dialogue, Achievements, & Cosmetics (D13)
 */

import { PALETTE } from './config.js';

export const PRODUCT_TITLE = 'HellsAdvent';
export const PRODUCT_SUBTITLE = 'FLOOR 1 · THE WASTELAND · KETTLE BOILER HUB';

// D49: Suggested Floor 1 boss encounter order (advisory only; all 4 arenas open from start)
export const SUGGESTED_BOSS_ORDER = [
  'bigAxle',
  'theLongDry',
  'motherSump',
  'theForeman',
];

export const NEW_COMMONS_CONFIG = {
  rivetTick: {
    id: 'rivetTick',
    name: 'Rivet Tick',
    tier: 'common',
    region: 'slabTown',
    hp: 22,
    damage: 5,
    def: 3,
    speed: 96,
    radius: 11,
    xp: 9,
    goldMin: 3,
    goldMax: 6,
    behavior: 'leapLatch',
    temperament: 'swarm',
    counterHint: 'Strike during crouch windup or knock away before latch.',
  },
  signalMite: {
    id: 'signalMite',
    name: 'Signal Mite',
    tier: 'common',
    region: 'route9',
    hp: 18,
    damage: 4,
    def: 1,
    speed: 90,
    radius: 11,
    xp: 10,
    goldMin: 4,
    goldMax: 7,
    behavior: 'scoutSignal',
    temperament: 'cautious',
    counterHint: 'Eliminate or interrupt while broadcasting to cut squad coordination.',
  },
  siltMimic: {
    id: 'siltMimic',
    name: 'Silt Mimic',
    tier: 'common',
    region: 'lyeMarsh',
    hp: 28,
    damage: 6,
    def: 3,
    speed: 78,
    radius: 13,
    xp: 10,
    goldMin: 4,
    goldMax: 7,
    behavior: 'feignDeath',
    temperament: 'ambusher',
    counterHint: 'Watch for the twitching false-collapse cue; bait the ambush lunge.',
  },
  cinderCrow: {
    id: 'cinderCrow',
    name: 'Cinder Crow',
    tier: 'common',
    region: 'copperFlats',
    hp: 22,
    damage: 6,
    def: 1,
    speed: 94,
    radius: 12,
    xp: 10,
    goldMin: 4,
    goldMax: 7,
    flying: true,
    behavior: 'diveHarass',
    temperament: 'skittish',
    counterHint: 'Dodge perpendicular to dive line and punish its grounded landing.',
  },
};

export const NEW_ELITES_CONFIG = {
  plateMarshal: {
    id: 'plateMarshal',
    name: 'Plate Marshal',
    tier: 'elite',
    region: 'slabTown',
    hp: 185,
    damage: 15,
    def: 12,
    speed: 84,
    radius: 21,
    xp: 70,
    goldMin: 45,
    goldMax: 65,
    gauzeDropChance: 0.22,
    specialType: 'shieldCommand',
    specialCooldown: 5.4,
    telegraphTime: 0.85,
    frontalShieldDr: 0.65,
    counterHint: 'Flank exposed rear/sides or interrupt command order windup.',
  },
  switchbackDriver: {
    id: 'switchbackDriver',
    name: 'Switchback Driver',
    tier: 'elite',
    region: 'route9',
    hp: 175,
    damage: 16,
    def: 9,
    speed: 104,
    radius: 20,
    xp: 70,
    goldMin: 45,
    goldMax: 65,
    gauzeDropChance: 0.22,
    specialType: 'switchbackCharge',
    specialCooldown: 5.0,
    telegraphTime: 0.75,
    counterHint: 'Read exhaust sputter vs true rev; punish after second ram overshoot.',
  },
  sumpCantor: {
    id: 'sumpCantor',
    name: 'Sump Cantor',
    tier: 'elite',
    region: 'lyeMarsh',
    hp: 165,
    damage: 13,
    def: 8,
    speed: 82,
    radius: 19,
    xp: 70,
    goldMin: 45,
    goldMax: 65,
    gauzeDropChance: 0.22,
    specialType: 'cantorPulse',
    specialCooldown: 5.2,
    telegraphTime: 0.9,
    counterHint: 'Interrupt rhythmic bell channel and separate Cantor from its pack.',
  },
  boreSentinel: {
    id: 'boreSentinel',
    name: 'Bore Sentinel',
    tier: 'elite',
    region: 'copperFlats',
    hp: 190,
    damage: 16,
    def: 11,
    speed: 88,
    radius: 21,
    xp: 75,
    goldMin: 48,
    goldMax: 68,
    gauzeDropChance: 0.22,
    specialType: 'burrowMortar',
    specialCooldown: 5.5,
    telegraphTime: 0.85,
    counterHint: 'Track ground tremor and strike the glowing vent core after emergence.',
  },
};

// Section 3.3: All 9 Same-Species 10-Mob Fusion Mid-Bosses (D11)
export const FUSION_BOSSES_CONFIG = {
  tinRat: {
    id: 'scrapRatKing',
    sourceSpeciesId: 'tinRat',
    name: 'Scrap Rat King',
    subtitle: '10× Tin Rat Amalgam',
    tier: 'fusionBoss',
    hp: 340,
    damage: 18,
    def: 10,
    speed: 98,
    radius: 26,
    xp: 120,
    goldMin: 75,
    goldMax: 110,
    specialType: 'rollingRush',
    specialCooldown: 4.6,
    telegraphTime: 0.8,
    counterHint: 'Dodge the armored rolling rush and strike the exposed underside during recovery.',
  },
  dustDog: {
    id: 'bonepackAlpha',
    sourceSpeciesId: 'dustDog',
    name: 'Bonepack Alpha',
    subtitle: '10× Dust Dog Amalgam',
    tier: 'fusionBoss',
    hp: 350,
    damage: 19,
    def: 9,
    speed: 104,
    radius: 26,
    xp: 120,
    goldMin: 75,
    goldMax: 110,
    specialType: 'pairedLungeHowl',
    specialCooldown: 4.8,
    telegraphTime: 0.75,
    counterHint: 'Punish the howl preparation or strike immediately after the second lunge.',
  },
  wireKite: {
    id: 'wireCyclone',
    sourceSpeciesId: 'wireKite',
    name: 'Wire Cyclone',
    subtitle: '10× Wire Kite Amalgam',
    tier: 'fusionBoss',
    hp: 320,
    damage: 18,
    def: 7,
    speed: 100,
    radius: 25,
    xp: 120,
    goldMin: 75,
    goldMax: 110,
    flying: true,
    specialType: 'aerialBoltArcs',
    specialCooldown: 4.5,
    telegraphTime: 0.8,
    counterHint: 'Break the synchronized spin wind-up or punish right after arc discharge.',
  },
  lyeLeech: {
    id: 'brineMaw',
    sourceSpeciesId: 'lyeLeech',
    name: 'Brine Maw',
    subtitle: '10× Lye Leech Amalgam',
    tier: 'fusionBoss',
    hp: 370,
    damage: 17,
    def: 11,
    speed: 82,
    radius: 27,
    xp: 125,
    goldMin: 80,
    goldMax: 115,
    specialType: 'suctionDrain',
    specialCooldown: 5.0,
    telegraphTime: 0.85,
    counterHint: 'Break out of short-range suction and punish after its committed bite.',
  },
  sumpBat: {
    id: 'screechChoir',
    sourceSpeciesId: 'sumpBat',
    name: 'Screech Choir',
    subtitle: '10× Sump Bat Amalgam',
    tier: 'fusionBoss',
    hp: 310,
    damage: 18,
    def: 7,
    speed: 102,
    radius: 25,
    xp: 120,
    goldMin: 75,
    goldMax: 110,
    flying: true,
    specialType: 'sonicCone',
    specialCooldown: 4.6,
    telegraphTime: 0.8,
    counterHint: 'Step outside or behind the directional sonic cone.',
  },
  rivetTick: {
    id: 'rivetTitan',
    sourceSpeciesId: 'rivetTick',
    name: 'Rivet Titan',
    subtitle: '10× Rivet Tick Amalgam',
    tier: 'fusionBoss',
    hp: 360,
    damage: 19,
    def: 13,
    speed: 92,
    radius: 27,
    xp: 130,
    goldMin: 80,
    goldMax: 120,
    specialType: 'titanSlamLeap',
    specialCooldown: 4.9,
    telegraphTime: 0.85,
    counterHint: 'Evade the heavy leap and strike the revealed vents on landing.',
  },
  signalMite: {
    id: 'relayColossus',
    sourceSpeciesId: 'signalMite',
    name: 'Relay Colossus',
    subtitle: '10× Signal Mite Amalgam',
    tier: 'fusionBoss',
    hp: 310,
    damage: 17,
    def: 8,
    speed: 94,
    radius: 25,
    xp: 135,
    goldMin: 85,
    goldMax: 120,
    specialType: 'overclockBroadcast',
    specialCooldown: 4.7,
    telegraphTime: 0.85,
    counterHint: 'Interrupt the exposed signal array while it broadcasts to nearby allies.',
  },
  siltMimic: {
    id: 'dredgeHusk',
    sourceSpeciesId: 'siltMimic',
    name: 'Dredge Husk',
    subtitle: '10× Silt Mimic Amalgam',
    tier: 'fusionBoss',
    hp: 365,
    damage: 20,
    def: 11,
    speed: 86,
    radius: 27,
    xp: 130,
    goldMin: 80,
    goldMax: 120,
    specialType: 'feintCounterSlam',
    specialCooldown: 4.8,
    telegraphTime: 0.8,
    counterHint: 'Spot the fake stagger tremor and delay your punish until the counter swing finishes.',
  },
  cinderCrow: {
    id: 'blackwingFurnace',
    sourceSpeciesId: 'cinderCrow',
    name: 'Blackwing Furnace',
    subtitle: '10× Cinder Crow Amalgam',
    tier: 'fusionBoss',
    hp: 335,
    damage: 20,
    def: 8,
    speed: 106,
    radius: 26,
    xp: 135,
    goldMin: 85,
    goldMax: 125,
    flying: true,
    specialType: 'furnaceAirstrike',
    specialCooldown: 4.8,
    telegraphTime: 0.8,
    counterHint: 'Sidestep the burning airstrike lane and punish during grounded vent cooldown.',
  },
};

export const FUSION_RULES = {
  requiredCount: 10,
  maxClusterRadius: 96, // 96 world pixels from centroid
  channelDuration: 2.0, // 2.0s interruptible channel (D16)
  backlashWindow: 0.5, // Last 0.5s of channel triggers 1.5s disorientation backlash on survivors (D25)
  backlashStunDuration: 1.5,
  maxActiveChannels: 2,
  maxActiveFusionBosses: 2, // D39: if full, eligible mobs keep fighting and retry later
  staggerDamageRatio: 0.22, // Universal stagger damage ratio of cluster HP to interrupt
};

// Consolidated authoritative specification for Boss Mechanics (D1–D5, D18, D21–D23, D28–D48)
export const BOSS_MECHANICS_CONFIG = {
  theForeman: {
    ritualDuration: 30.0, // Exactly 30.0s (D28)
    waveInterval: 2.0, // Every 2.0s at t=0,2,...,28 -> 15 waves of 10 = 150 spawns (D28, D45)
    mobsPerWave: 10,
    totalWaves: 15,
    marchTravelTime: 5.0, // ~5s travel time from spawn ring to Foreman body (D30)
    spawnRingRadius: 250, // 250px ring at 50px/s = 5.0s travel time
    noFusionFieldRadius: 310, // Covers spawnRingRadius + largestMobCollisionRadius + routeMargin (D34)
    minArrivalsToRevive: 10, // 0-9 arrivals = permanent defeat; 10+ = revival (D1)
    maxArrivalsScale: 30, // 10 -> 10% HP, 30+ -> 100% HP (D1, D18)
    marcherHp: 14, // Weak enough for any class to clear (D23)
    marcherSpeed: 50, // 250px / 50px/s = 5.0s
    marcherRadius: 11,
  },
  bigAxle: {
    maxHeat: 100,
    heatPerMissedCharge: 25,
    heatPerOverdriveCharge: 34,
    ventCoolAmount: 15,
    coreExposedDuration: 5.5,
    coreMaxHpRatio: 0.22, // Core HP to shatter
    failedGateRestartHpPct: 0.18, // D40: restarts at 18% HP if 0 HP reached without core break
    disabledBeforeRestartDuration: 2.5,
  },
  motherSump: {
    hungerThresholdPct: 0.35, // Enters hunger cycle below 35% HP
    devourChannelDuration: 2.6,
    staggerInterruptHpRatio: 0.085, // D21: ~8.5% max HP damage during channel interrupts feed
    requiredDeniedFeeds: 2, // D41: 2 denied feeds unlock STARVED state
    noPreyHungerTimeout: 9.0, // D41: auto-starves if no eligible prey for 9s
    leechHealRatio: 0.10, // 10% heal on normal leech
    brineMawHealRatio: 0.22, // D10: big heal on fused Brine Maw, bounded by total heal cap
    maxTotalHealRatio: 0.40, // Total encounter healing cap
    starvedDuration: 14.0,
  },
  theLongDry: {
    totalShellSegments: 3, // 3 shell segments must be broken (D22, D42)
    segmentHpRatio: 0.12, // Each segment takes ~12% of boss max HP during exposure window
    exposureWindowDuration: 4.2,
    subsurfaceDuration: 2.8,
    partialRegrowthRatio: 0.35, // Repairs damaged-but-unbroken segment by 35% on burrow
  },
};

// D13: Kettle Recognition Achievements & Cosmetics (No mechanical combat buffs)
export const KETTLE_ACHIEVEMENTS = {
  firstFusionSlain: {
    id: 'firstFusionSlain',
    title: 'Amalgam Breaker',
    desc: 'Defeated your first 10-unit Fusion Mid-Boss in the wasteland.',
    cosmeticTitle: 'Amalgam Breaker',
    trimColor: PALETTE.signal,
  },
  fusionDisruptor: {
    id: 'fusionDisruptor',
    title: 'Circuit Breaker',
    desc: 'Interrupted 3 or more enemy fusion channels before completion.',
    cosmeticTitle: 'Circuit Breaker',
    trimColor: PALETTE.brass,
  },
  foremanNoRevive: {
    id: 'foremanNoRevive',
    title: 'Protocol Denied',
    desc: 'Held The Foreman below 10 ritual arrivals and prevented his resurrection.',
    cosmeticTitle: 'Slab Warden',
    trimColor: PALETTE.signal,
  },
  ironForemanSlain: {
    id: 'ironForemanSlain',
    title: 'Scrapyard Executioner',
    desc: 'Defeated The Iron Foreman after his Reassembly Protocol revival.',
    cosmeticTitle: 'Ironbreaker',
    trimColor: PALETTE.rustLight,
  },
  bigAxleCoreShattered: {
    id: 'bigAxleCoreShattered',
    title: 'Redline Mechanic',
    desc: 'Baited Big Axle into overheating and shattered its exposed diesel core.',
    cosmeticTitle: 'Highway Stopper',
    trimColor: PALETTE.brass,
  },
  motherSumpStarved: {
    id: 'motherSumpStarved',
    title: 'Famine Bringer',
    desc: 'Denied Mother Sump her brood and slew her in a Starved state.',
    cosmeticTitle: 'Sump Starver',
    trimColor: PALETTE.verdigris,
  },
  longDryShellBroken: {
    id: 'longDryShellBroken',
    title: 'Shell Cracker',
    desc: 'Read the false tremors, shattered all 3 iron shell plates, and slew The Long Dry.',
    cosmeticTitle: 'Dune Piercer',
    trimColor: PALETTE.rustLight,
  },
  floor1Cleared: {
    id: 'floor1Cleared',
    title: 'Wasteland Sovereign (Floor 1 Clear)',
    desc: 'Permanently defeated all four primary bosses of Floor 1.',
    cosmeticTitle: 'Floor 1 Clearer',
    trimColor: PALETTE.brass,
  },
};

export const REACTIVE_DIALOGUE = {
  ume: [
    {
      id: 'ume_floor1_clear',
      priority: 100,
      check: (ledger) => ledger.floor1Cleared,
      text: "All four sectors quieted down. Boiler's never burned cleaner. Floor 1 is yours—take a breather or test yourself on the arena rematches.",
    },
    {
      id: 'ume_foreman_denied',
      priority: 90,
      check: (ledger) => ledger.milestones.foremanNoRevive,
      text: "Word is the Foreman called all of Slab Town to piece him back together and you cut the whole march short. Cold work, runner.",
    },
    {
      id: 'ume_foreman_revived_low',
      priority: 88,
      check: (ledger) => ledger.milestones.ironForemanSlain && ledger.milestones.foremanReviveArrivals >= 10 && ledger.milestones.foremanReviveArrivals <= 16,
      text: "You barely let ten scrap-crawlers reach the Foreman's rig—heard he came back half-built and twice as mean, and you still put him down.",
    },
    {
      id: 'ume_foreman_revived_high',
      priority: 87,
      check: (ledger) => ledger.milestones.ironForemanSlain,
      text: "So the Iron Foreman stood back up in Slab Town and you broke him a second time. Bring me whatever plating didn't melt.",
    },
    {
      id: 'ume_mother_starved_perfect',
      priority: 85,
      check: (ledger) => ledger.milestones.motherSumpStarved && ledger.milestones.motherSumpFeedsAllowed === 0,
      text: "Not a single leech down Mother Sump's gullet! You actually starved the swamp's fattest monster.",
    },
    {
      id: 'ume_mother_starved',
      priority: 82,
      check: (ledger) => ledger.milestones.motherSumpStarved,
      text: "Lye Marsh smells less rotten today. Cutting off Mother Sump's brood before finishing her was the only way.",
    },
    {
      id: 'ume_big_axle_core',
      priority: 80,
      check: (ledger) => ledger.milestones.bigAxleCoreShattered,
      text: "Heard Big Axle's diesel core blew a piston clear across Route 9 after you baited its charges into redline.",
    },
    {
      id: 'ume_long_dry_shell',
      priority: 78,
      check: (ledger) => ledger.milestones.longDryShellBroken,
      text: "Cracked all three pipe-rings off The Long Dry without falling for its decoy tremors. Good eyes.",
    },
    {
      id: 'ume_first_fusion',
      priority: 70,
      check: (ledger) => ledger.milestones.fusionsKilled >= 1,
      text: "Ten vermin tangling their scrap together into one giant beast... don't let them crowd up if you can help it.",
    },
    {
      id: 'ume_boss_deaths_hint',
      priority: 65,
      check: (ledger) => ledger.milestones.recentBossDeaths >= 2,
      text: "Brute force won't finish the four sector bosses. Bait Big Axle's heat, starve Mother Sump, crack Long Dry's rings, and stop the Foreman's marchers.",
    },
    {
      id: 'ume_suggested_route',
      priority: 40,
      check: (ledger) => !ledger.floor1Cleared,
      text: "Suggested hunt order if you want a fighting climb: Big Axle on Route 9, Long Dry South, Mother Sump East, and save The Foreman in Slab Town for last.",
    },
  ],
  harlow: [
    {
      id: 'harlow_floor1_clear',
      priority: 100,
      check: (ledger) => ledger.floor1Cleared,
      text: "Four confirmed kills stamped in permanent ink. The Floor 1 Ascent Gate in Kettle is open whenever you want to inspect the record.",
    },
    {
      id: 'harlow_fusions_interrupted',
      priority: 85,
      check: (ledger) => ledger.milestones.fusionsInterrupted >= 3,
      text: "Three convergence rituals broken before the ten could weld together. That's proper field discipline.",
    },
    {
      id: 'harlow_foreman_denied',
      priority: 82,
      check: (ledger) => ledger.milestones.foremanNoRevive,
      text: "Holding Slab Town's 150-unit Reassembly Protocol under ten arrivals is a feat for the Master ledger.",
    },
    {
      id: 'harlow_route_advice',
      priority: 50,
      check: (ledger) => !ledger.floor1Cleared,
      text: "All four sectors are open from day one, kid. Most runners test their boots on Big Axle -> Long Dry -> Mother Sump before trying The Foreman's ritual.",
    },
  ],
};
