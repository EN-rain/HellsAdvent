/**
 * GRAVEL SKY — Central Game Configuration
 * Every stat, price, XP curve, spawn rate, palette token, and string lives here.
 * Strictly follows grounded post-collapse industrial tone and naming rules.
 */

export const PALETTE = {
  soot: '#0B0D10',
  slag: '#3A3F47',
  rust: '#8B3A1E',
  bog: '#1F4D4A',
  bone: '#D9D2C3',
  signal: '#00F0FF',
  blood: '#FF3B3B',
  brass: '#FFC83D',
  // Extended shading tones derived strictly from the core palette
  sootLight: '#161A20',
  slagDark: '#23272D',
  slagLight: '#565E6A',
  rustDark: '#592310',
  rustLight: '#B85430',
  bogDark: '#122E2C',
  bogLight: '#2E736E',
  boneDark: '#9E9789',
  skinLight: '#E6CCB8',
  skinShadow: '#B8967D',
};

export const GRADES = {
  Scrap: {
    id: 'Scrap',
    name: 'Scrap',
    color: '#9E9789', // grey / worn bone-slag
    unlockLevel: 1,
  },
  Salvaged: {
    id: 'Salvaged',
    name: 'Salvaged',
    color: '#00F0FF', // signal / teal
    bgTint: '#1F4D4A',
    unlockLevel: 8,
  },
  Relic: {
    id: 'Relic',
    name: 'Relic',
    color: '#FFC83D', // brass
    unlockLevel: 16,
  },
};

export const PLAYER_CONFIG = {
  name: 'Sena Ibuki',
  role: 'Salvage Runner',
  weaponName: 'Railcut',
  weaponDesc: 'A sawn-off length of train rail ground to a cyan edge.',
  baseStats: {
    hp: 100,
    stamina: 60,
    atk: 12,
    def: 4,
    speed: 130,
    critChance: 0.08,
    critMult: 1.65,
    damageTakenMult: 1.0,
    dodgeCooldownReduction: 0,
  },
  levelCap: 30,
  perLevel: {
    hp: 12,
    stamina: 4,
    atk: 2,
    def: 1,
    skillPoints: 1,
    healRatio: 0.35, // Small heal on level up (35% of max HP + full stamina)
  },
  xpForNextLevel: (level) => Math.floor(40 * Math.pow(level, 1.5)),
  staminaRegenPerSec: 11,
  dodge: {
    duration: 0.25, // 0.25s invulnerable
    cooldown: 1.2, // 1.2s cooldown
    speed: 380,
    staminaCost: 8,
  },
  combo: [
    { step: 1, mult: 1.0, duration: 0.24, range: 54, arc: 1.65, knockback: 90, stepForward: 45 },
    { step: 2, mult: 1.15, duration: 0.24, range: 58, arc: 1.85, knockback: 115, stepForward: 55 },
    { step: 3, mult: 1.45, duration: 0.32, range: 68, arc: 2.35, knockback: 185, stepForward: 75 },
  ],
  comboResetTime: 0.7,
  hitStopDuration: 0.05, // 50ms hit-stop
  deathGoldPenalty: 0.10, // Lose 10% of gold on death
};

export const SKILLS_CONFIG = {
  lunge: {
    id: 'lunge',
    hotkey: '1',
    name: 'Lunge',
    maxLevel: 5,
    baseDamageMult: 1.6, // 160% ATK
    damagePerLevel: 0.2, // +20% per level
    baseCooldown: 5.0, // 5s
    cooldownPerLevel: -0.4, // -0.4s per level
    staminaCost: 10,
    dashDistance: 160,
    width: 38,
    desc: 'Dash 160px toward the cursor, cutting everything on the path.',
    getStats(level) {
      const lvl = Math.max(1, level);
      return {
        damageMult: +(this.baseDamageMult + (lvl - 1) * this.damagePerLevel).toFixed(2),
        cooldown: +(this.baseCooldown + (lvl - 1) * this.cooldownPerLevel).toFixed(1),
        staminaCost: this.staminaCost,
        dashDistance: this.dashDistance,
      };
    },
  },
  groundBreak: {
    id: 'groundBreak',
    hotkey: '2',
    name: 'Ground Break',
    maxLevel: 5,
    baseDamageMult: 1.4, // 140% ATK
    damagePerLevel: 0.15, // +15% per level
    baseRadius: 110, // 110px
    radiusPerLevel: 12, // +12px per level
    cooldown: 9.0, // 9s
    staminaCost: 20,
    stunDuration: 1.0, // stuns 1s
    desc: 'Slam the blade down. Shockwave stuns nearby enemies for 1s.',
    getStats(level) {
      const lvl = Math.max(1, level);
      return {
        damageMult: +(this.baseDamageMult + (lvl - 1) * this.damagePerLevel).toFixed(2),
        radius: this.baseRadius + (lvl - 1) * this.radiusPerLevel,
        cooldown: this.cooldown,
        staminaCost: this.staminaCost,
        stunDuration: this.stunDuration,
      };
    },
  },
  railSpike: {
    id: 'railSpike',
    hotkey: '3',
    name: 'Rail Spike',
    maxLevel: 5,
    baseDamageMult: 1.8, // 180% ATK
    damagePerLevel: 0.2, // +20% per level
    basePierce: 2, // Piercing
    piercePerLevel: 1, // +1 pierce per level
    range: 420, // 420px
    speed: 620,
    cooldown: 6.0, // 6s
    staminaCost: 15,
    desc: 'Throw a sharpened piece of rail that pierces targets in a line.',
    getStats(level) {
      const lvl = Math.max(1, level);
      return {
        damageMult: +(this.baseDamageMult + (lvl - 1) * this.damagePerLevel).toFixed(2),
        pierce: this.basePierce + (lvl - 1) * this.piercePerLevel,
        range: this.range,
        cooldown: this.cooldown,
        staminaCost: this.staminaCost,
      };
    },
  },
  sevenCuts: {
    id: 'sevenCuts',
    hotkey: 'R',
    name: 'Seven Cuts',
    totalDamageMult: 5.0, // 500% ATK total shared across hits
    cuts: 7,
    radius: 300, // 300px
    duration: 1.05, // Time stops while 7 cuts play out
    chargeMax: 100,
    chargePerHitDealt: 4.2,
    chargePerDamageTaken: 0.65,
    desc: 'Time stops. Sena cuts seven times across every enemy within 300px for 500% total ATK.',
  },
};

export const WORLD_CONFIG = {
  size: 6000,
  tileSize: 16,
  chunkTiles: 16, // 256x256 px per chunk
  kettleCenter: { x: 3000, y: 3000 },
  kettleRadius: 430, // Safe zone radius
  umePosition: { x: 2940, y: 2925 },
  boilerPosition: { x: 3000, y: 2990 },
  dayCycleDuration: 180, // 3-minute cycle with dust storms
  areas: {
    kettle: {
      id: 'kettle',
      name: 'Kettle',
      subtitle: 'Boiler Camp · Safe Zone',
      levelBand: [1, 30],
      safe: true,
      groundColor: '#191C21',
      detailColor: '#2B3038',
      particleType: 'ash',
      bounds: { x1: 2550, y1: 2550, x2: 3450, y2: 3450 },
    },
    slabTown: {
      id: 'slabTown',
      name: 'Slab Town',
      subtitle: 'North Sector · Levels 1–8',
      levelBand: [1, 8],
      safe: false,
      groundColor: '#23272E',
      detailColor: '#3A3F47',
      particleType: 'dust',
      commons: ['tinRat', 'dustDog'],
      elites: ['cleaverHauler'],
      bossId: 'theForeman',
    },
    route9: {
      id: 'route9',
      name: 'Route 9',
      subtitle: 'West Highway · Levels 5–14',
      levelBand: [5, 14],
      safe: false,
      groundColor: '#171A1F',
      detailColor: '#2E333B',
      particleType: 'sparks',
      commons: ['wireKite', 'tinRat'],
      elites: ['cleaverHauler', 'flatsHarvester'],
      bossId: 'bigAxle',
    },
    lyeMarsh: {
      id: 'lyeMarsh',
      name: 'Lye Marsh',
      subtitle: 'East Sump · Levels 10–20',
      levelBand: [10, 20],
      safe: false,
      groundColor: '#132826',
      detailColor: '#1F4D4A',
      particleType: 'spores',
      commons: ['lyeLeech', 'sumpBat'],
      elites: ['lyeStrider'],
      bossId: 'motherSump',
    },
    copperFlats: {
      id: 'copperFlats',
      name: 'Copper Flats',
      subtitle: 'South Basin · Levels 15–25',
      levelBand: [15, 25],
      safe: false,
      groundColor: '#3D2014',
      detailColor: '#8B3A1E',
      particleType: 'sand',
      commons: ['dustDog', 'wireKite'],
      elites: ['flatsHarvester', 'lyeStrider'],
      bossId: 'theLongDry',
    },
  },
};

export const SPAWNER_CONFIG = {
  interval: 1.2, // Every 1.2s
  maxActive: 40, // Fewer than 40 active
  minSpawnDist: 520, // 520-700px from player
  maxSpawnDist: 700,
  despawnDist: 1200, // Despawn beyond 1200px
  commonWeight: 0.85, // 85% common, 14% elite (bosses are arena-spawned)
  eliteWeight: 0.15,
  packSizeMin: 2,
  packSizeMax: 4,
  levelScalePerPlayerLevel: 0.06, // +6% HP and damage per player level inside area's level band
  bossRespawnTime: 300, // 5 minutes (300s)
};

export const ENEMIES_CONFIG = {
  commons: {
    tinRat: {
      id: 'tinRat',
      name: 'Tin Rat',
      tier: 'common',
      hp: 24,
      damage: 5,
      speed: 82,
      radius: 12,
      xp: 8,
      goldMin: 3,
      goldMax: 6,
      behavior: 'melee',
    },
    dustDog: {
      id: 'dustDog',
      name: 'Dust Dog',
      tier: 'common',
      hp: 24,
      damage: 5,
      speed: 86,
      radius: 13,
      xp: 8,
      goldMin: 3,
      goldMax: 6,
      behavior: 'melee',
    },
    wireKite: {
      id: 'wireKite',
      name: 'Wire Kite',
      tier: 'common',
      hp: 24,
      damage: 5,
      speed: 84,
      radius: 13,
      xp: 8,
      goldMin: 3,
      goldMax: 6,
      flying: true,
      behavior: 'swoop',
    },
    lyeLeech: {
      id: 'lyeLeech',
      name: 'Lye Leech',
      tier: 'common',
      hp: 24,
      damage: 5,
      speed: 76,
      radius: 13,
      xp: 8,
      goldMin: 3,
      goldMax: 6,
      behavior: 'melee',
    },
    sumpBat: {
      id: 'sumpBat',
      name: 'Sump Bat',
      tier: 'common',
      hp: 24,
      damage: 5,
      speed: 88,
      radius: 12,
      xp: 8,
      goldMin: 3,
      goldMax: 6,
      flying: true,
      behavior: 'swoop',
    },
  },
  elites: {
    cleaverHauler: {
      id: 'cleaverHauler',
      name: 'Cleaver Hauler',
      tier: 'elite',
      hp: 160,
      damage: 14,
      speed: 95,
      radius: 20,
      xp: 60,
      goldMin: 40,
      goldMax: 60,
      gauzeDropChance: 0.2,
      specialType: 'charge', // Red line warning 0.8s ahead
      specialCooldown: 5.2,
      telegraphTime: 0.8,
    },
    lyeStrider: {
      id: 'lyeStrider',
      name: 'Lye Strider',
      tier: 'elite',
      hp: 160,
      damage: 14,
      speed: 95,
      radius: 19,
      xp: 60,
      goldMin: 40,
      goldMax: 60,
      gauzeDropChance: 0.2,
      specialType: 'acidSpit', // Red circle warning 0.8s ahead
      specialCooldown: 4.8,
      telegraphTime: 0.8,
    },
    flatsHarvester: {
      id: 'flatsHarvester',
      name: 'Flats Harvester',
      tier: 'elite',
      hp: 160,
      damage: 14,
      speed: 95,
      radius: 21,
      xp: 60,
      goldMin: 40,
      goldMax: 60,
      gauzeDropChance: 0.2,
      specialType: 'spinCut', // Red ring warning 0.8s ahead
      specialCooldown: 5.0,
      telegraphTime: 0.8,
    },
  },
  bosses: {
    theForeman: {
      id: 'theForeman',
      name: 'The Foreman',
      subtitle: 'Slab Town Wrecking Rig',
      areaId: 'slabTown',
      arenaCenter: { x: 3000, y: 1050 },
      arenaRadius: 380,
      hp: 1400,
      damage: 25,
      speed: 74,
      radius: 34,
      xp: 600,
      gold: 500,
      guaranteedDrop: 'surplusRespirator',
    },
    bigAxle: {
      id: 'bigAxle',
      name: 'Big Axle',
      subtitle: 'Route 9 Diesel Hauler',
      areaId: 'route9',
      arenaCenter: { x: 1050, y: 3000 },
      arenaRadius: 380,
      hp: 1400,
      damage: 25,
      speed: 88,
      radius: 34,
      xp: 600,
      gold: 500,
      guaranteedDrop: 'courierLeggings',
    },
    motherSump: {
      id: 'motherSump',
      name: 'Mother Sump',
      subtitle: 'Lye Marsh Vat Dredger',
      areaId: 'lyeMarsh',
      arenaCenter: { x: 4950, y: 3000 },
      arenaRadius: 380,
      hp: 1400,
      damage: 25,
      speed: 68,
      radius: 36,
      xp: 600,
      gold: 500,
      guaranteedDrop: 'riotJacket',
    },
    theLongDry: {
      id: 'theLongDry',
      name: 'The Long Dry',
      subtitle: 'Copper Flats Bore Worm',
      areaId: 'copperFlats',
      arenaCenter: { x: 3000, y: 4950 },
      arenaRadius: 400,
      hp: 1400,
      damage: 25,
      speed: 92,
      radius: 38,
      xp: 600,
      gold: 500,
      guaranteedDrop: 'riotJacket',
    },
  },
};

export const SHOP_ITEMS = {
  // HEAD
  weldingGoggles: {
    id: 'weldingGoggles',
    name: 'Welding Goggles',
    slot: 'head',
    grade: 'Scrap',
    price: 80,
    stats: { def: 3 },
    spriteTint: '#9E9789',
    desc: 'Cracked dark lenses strapped with rawhide. Keeps ash out of your eyes.',
  },
  surplusRespirator: {
    id: 'surplusRespirator',
    name: 'Surplus Respirator',
    slot: 'head',
    grade: 'Salvaged',
    price: 450,
    stats: { def: 7, stamina: 10 },
    spriteTint: '#1F4D4A',
    desc: 'Charcoal canister mask pulled from an old civil locker. Easier breathing on the run.',
  },
  ridersHelmet: {
    id: 'ridersHelmet',
    name: "Rider's Helmet",
    slot: 'head',
    grade: 'Relic',
    price: 1600,
    stats: { def: 12, stamina: 20, critChance: 0.05 },
    spriteTint: '#FFC83D',
    desc: 'Heavy highway shell with a wired rangefinder visor.',
  },

  // BODY
  patchedVest: {
    id: 'patchedVest',
    name: 'Patched Vest',
    slot: 'body',
    grade: 'Scrap',
    price: 120,
    stats: { def: 6, hp: 15 },
    spriteTint: '#565E6A',
    desc: 'Canvas work vest sewn with tire rubber and flattened tin.',
  },
  riotJacket: {
    id: 'riotJacket',
    name: 'Riot Jacket',
    slot: 'body',
    grade: 'Salvaged',
    price: 650,
    stats: { def: 14, hp: 40 },
    spriteTint: '#1F4D4A',
    desc: 'Quilted Kevlar coat with steel rib inserts. Smells like old grease.',
  },
  plateCoat: {
    id: 'plateCoat',
    name: 'Plate Coat',
    slot: 'body',
    grade: 'Relic',
    price: 2200,
    stats: { def: 24, hp: 90, damageReduction: 0.08 },
    spriteTint: '#8B3A1E',
    desc: 'Riveted boiler-plate longcoat. Turns claws and shrapnel aside.',
  },

  // LEGS
  workBoots: {
    id: 'workBoots',
    name: 'Work Boots',
    slot: 'legs',
    grade: 'Scrap',
    price: 70,
    stats: { def: 2, speed: 8 },
    spriteTint: '#592310',
    desc: 'Steel-toe leather boots resoled with conveyor belt tread.',
  },
  courierLeggings: {
    id: 'courierLeggings',
    name: 'Courier Leggings',
    slot: 'legs',
    grade: 'Salvaged',
    price: 400,
    stats: { def: 6, speed: 20 },
    spriteTint: '#2E736E',
    desc: 'Canvas wraps and knee braces worn by Slab Town runners.',
  },
  hydraulicShins: {
    id: 'hydraulicShins',
    name: 'Hydraulic Shins',
    slot: 'legs',
    grade: 'Relic',
    price: 1500,
    stats: { def: 10, speed: 35, dodgeCdReduction: 0.3 },
    spriteTint: '#FFC83D',
    desc: 'Spring-piston leg frames salvaged from a loader rig. Fast off the mark.',
  },

  // SUPPLIES
  gauzeRoll: {
    id: 'gauzeRoll',
    name: 'Gauze Roll',
    slot: 'supplies',
    grade: 'Scrap',
    price: 25,
    consumable: true,
    healHp: 50,
    hotkey: 'Q',
    desc: 'Boiled cloth and pine pitch. Restores 50 HP.',
  },
  sugarTin: {
    id: 'sugarTin',
    name: 'Sugar Tin',
    slot: 'supplies',
    grade: 'Scrap',
    price: 30,
    consumable: true,
    restoreStamina: 40,
    hotkey: 'F',
    desc: 'Hard brown sugar cubes in a dented tin. Restores 40 Stamina.',
  },
};

export const SHOP_SELL_RATIO = 0.4; // Sell back at 40%

export const DIALOGUE = {
  titleTagline: 'Rust, ash, dead water, and the occasional working light.',
  deathHeader: 'HAULED BACK TO KETTLE',
  deathSub:
    'The runners dragged you back to the Kettle boiler. Ume took ten percent for the haul.',
  umeGreetings: [
    "Boiler's still holding pressure. What did you drag back, Sena?",
    "Pay in clean coin or scrap. Don't bleed on the counter.",
    "Foreman's rig has been banging steel up in Slab Town all morning.",
    "Lye fog's rolling thick out east. Check your filters before you go.",
    "You look chewed up. Buy some gauze or sit by the fire.",
  ],
  umeLevelGated: (grade, reqLevel) =>
    `I keep the ${grade} stock locked until you hit Level ${reqLevel}. Come back when you've lasted longer.`,
  deathMessage:
    'The runners dragged you back to the Kettle boiler. Ume took ten percent for the haul.',
};

// Compatibility aliases so all modules resolve cleanly
WORLD_CONFIG.width = WORLD_CONFIG.size;
WORLD_CONFIG.height = WORLD_CONFIG.size;
WORLD_CONFIG.kettleSafeRadius = WORLD_CONFIG.kettleRadius;

PLAYER_CONFIG.radius = 12;
PLAYER_CONFIG.baseHp = PLAYER_CONFIG.baseStats.hp;
PLAYER_CONFIG.baseStamina = PLAYER_CONFIG.baseStats.stamina;
PLAYER_CONFIG.baseAtk = PLAYER_CONFIG.baseStats.atk;
PLAYER_CONFIG.baseDef = PLAYER_CONFIG.baseStats.def;
PLAYER_CONFIG.baseSpeed = PLAYER_CONFIG.baseStats.speed;
PLAYER_CONFIG.baseCritChance = PLAYER_CONFIG.baseStats.critChance;
PLAYER_CONFIG.critMultiplier = PLAYER_CONFIG.baseStats.critMult;
PLAYER_CONFIG.perLevel.healFraction = PLAYER_CONFIG.perLevel.healRatio;
PLAYER_CONFIG.dodgeDuration = PLAYER_CONFIG.dodge.duration;
PLAYER_CONFIG.dodgeCooldown = PLAYER_CONFIG.dodge.cooldown;
PLAYER_CONFIG.dodgeSpeed = PLAYER_CONFIG.dodge.speed;
PLAYER_CONFIG.dodgeStaminaCost = PLAYER_CONFIG.dodge.staminaCost;

SKILLS_CONFIG.lunge.cooldownBase = SKILLS_CONFIG.lunge.baseCooldown;
SKILLS_CONFIG.lunge.cooldownReductionPerLevel = Math.abs(SKILLS_CONFIG.lunge.cooldownPerLevel);
SKILLS_CONFIG.lunge.damageMultBase = SKILLS_CONFIG.lunge.baseDamageMult;
SKILLS_CONFIG.lunge.damageMultPerLevel = SKILLS_CONFIG.lunge.damagePerLevel;

SKILLS_CONFIG.groundBreak.cooldownBase = SKILLS_CONFIG.groundBreak.cooldown;
SKILLS_CONFIG.groundBreak.cooldownReductionPerLevel = 0.4;
SKILLS_CONFIG.groundBreak.damageMultBase = SKILLS_CONFIG.groundBreak.baseDamageMult;
SKILLS_CONFIG.groundBreak.damageMultPerLevel = SKILLS_CONFIG.groundBreak.damagePerLevel;
SKILLS_CONFIG.groundBreak.radiusBase = SKILLS_CONFIG.groundBreak.baseRadius;

SKILLS_CONFIG.railSpike.cooldownBase = SKILLS_CONFIG.railSpike.cooldown;
SKILLS_CONFIG.railSpike.cooldownReductionPerLevel = 0.35;
SKILLS_CONFIG.railSpike.damageMultBase = SKILLS_CONFIG.railSpike.baseDamageMult;
SKILLS_CONFIG.railSpike.damageMultPerLevel = SKILLS_CONFIG.railSpike.damagePerLevel;

SKILLS_CONFIG.sevenCuts.freezeDuration = SKILLS_CONFIG.sevenCuts.duration;
SKILLS_CONFIG.sevenCuts.chargePerHit = SKILLS_CONFIG.sevenCuts.chargePerHitDealt;

const SNAKE_ITEM_ALIASES = {
  welding_goggles: SHOP_ITEMS.weldingGoggles,
  surplus_respirator: SHOP_ITEMS.surplusRespirator,
  riders_helmet: SHOP_ITEMS.ridersHelmet,
  patched_vest: SHOP_ITEMS.patchedVest,
  riot_jacket: SHOP_ITEMS.riotJacket,
  plate_coat: SHOP_ITEMS.plateCoat,
  work_boots: SHOP_ITEMS.workBoots,
  courier_leggings: SHOP_ITEMS.courierLeggings,
  hydraulic_shins: SHOP_ITEMS.hydraulicShins,
};
for (const [k, v] of Object.entries(SNAKE_ITEM_ALIASES)) {
  Object.defineProperty(SHOP_ITEMS, k, {
    value: v,
    enumerable: false,
    configurable: true,
  });
}
SHOP_ITEMS.gauzeRoll.healFraction = 0.45;
SHOP_ITEMS.sugarTin.staminaRestore = SHOP_ITEMS.sugarTin.restoreStamina;
SHOP_ITEMS.sugarTin.buffDuration = 6.0;
SHOP_ITEMS.sugarTin.staminaRegenMultiplier = 1.65;

export const AREAS_CONFIG = WORLD_CONFIG.areas;
export const xpForNextLevel = PLAYER_CONFIG.xpForNextLevel;
export const ELITE_MODIFIERS = {
  hpMultiplier: 1.0,
  atkMultiplier: 1.0,
  xpMultiplier: 1.0,
  goldMultiplier: 1.0,
  warningDuration: 0.8,
};

