/**
 * HELLS ADVENT: ABYSSAL DESCENT — Master Dark Fantasy Configuration
 * - Duskhollow Town (Floor 0) + Top-Center Abyssal Spire + 6 RPG Buildings
 * - 5 Abyssal Tower Floors (Blighted Catacombs, Frostbound Crypt, Hellfire Abyss, Rotwood Mire, Void Citadel)
 * - 4 Great Boss Bloodline Family Trees × 5 Floors × 3 Sequential Territory Stages (60 Bosses Total)
 * - 5-Act Dark Fantasy Story Campaign & Side Quests
 * - 20% Cleansed-Territory NPCs & 20% Corner Wandering Merchant (30s Defense Quest + Mob-Repellent Ward)
 * - Uncapped Level XP Decay & 10+ Level Gap "Abyssal Enrage" Buff
 */

export const CHIBI_BASE_ASSET_PATH = '/assets/aistudio/image_c95e226e.png';

// ============================================================================
// FLOOR 0: DUSKHOLLOW TOWN (SAFE HAVEN RPG HUB) & 6 RPG BUILDINGS
// ============================================================================
export const DUSKHOLLOW_TOWN = {
  id: 'duskhollow',
  floorId: 0,
  name: 'Duskhollow Town',
  subtitle: 'Last Bastion Beneath the Abyssal Spire · Safe Haven',
  spawnPoint: { x: 3000, y: 3040 },
  wellPosition: { x: 3000, y: 3000 },
  bounds: { x1: 2350, y1: 2350, x2: 3650, y2: 3550 },
  groundColor: '#16141C',
  roadColor: '#252130',
  detailColor: '#342D42',
  accentColor: '#D4AF37',
  palette: {
    ground: '#16141C',
    stone: '#342D42',
    road: '#252130',
    accent: '#D4AF37',
  },
  towerEntrance: {
    id: 'abyssalTower',
    name: 'The Abyssal Spire Gatehouse',
    subtitle: 'Top-Center Tower Entrance · Ascend Floors 1–5',
    x: 3000,
    y: 2560,
    interactRadius: 110,
    color: '#00F0FF',
  },
  buildings: [
    {
      id: 'runesmith_forge',
      name: 'Runesmith Forge & Armory',
      npcName: 'Master Smith Vaelen',
      npcTitle: 'Runesmith & Armorer',
      npcRole: 'Runesmith & Armorer',
      x: 2700,
      y: 2770,
      width: 150,
      height: 110,
      interactRadius: 95,
      roofColor: '#592310',
      wallColor: '#2B2533',
      accentColor: '#FF5A26',
      prompt: '[E] RUNESMITH FORGE (VAELEN)',
      greeting:
        'Soul-iron and grave-steel hold their edge only if your blood stays warm. Pick your armaments before you step into the Spire.',
    },
    {
      id: 'alchemist_apothecary',
      name: 'Alchemist Apothecary',
      npcName: 'Sister Isolde',
      npcTitle: 'Plague Alchemist',
      npcRole: 'Plague Alchemist',
      x: 3300,
      y: 2770,
      width: 150,
      height: 110,
      interactRadius: 95,
      roofColor: '#173B3A',
      wallColor: '#252E33',
      accentColor: '#2EE6A8',
      prompt: '[E] APOTHECARY (SISTER ISOLDE)',
      greeting:
        'Crimson vials for torn flesh, purifying salts for the mire-rot. Drink before the curse takes root.',
    },
    {
      id: 'hunters_guild',
      name: 'Hunters Guild & Bloodline Hall',
      npcName: 'Chronicler Malakor',
      npcTitle: 'Keeper of the Blood Ledger',
      npcRole: 'Keeper of the Blood Ledger',
      x: 2680,
      y: 3010,
      width: 160,
      height: 115,
      interactRadius: 95,
      roofColor: '#3B2854',
      wallColor: '#282338',
      accentColor: '#FFC83D',
      prompt: '[E] HUNTERS GUILD & BLOODLINES (MALAKOR)',
      greeting:
        'Four cursed bloodlines anchor the Spire. Slay the Warden, draw out the Executioner, and sever the Overlord.',
    },
    {
      id: 'arcane_sanctum',
      name: 'Arcane Sanctum & Grimoire Hall',
      npcName: 'Archmage Solen',
      npcTitle: 'Grand Astromancer',
      npcRole: 'Grand Astromancer',
      x: 3320,
      y: 3010,
      width: 160,
      height: 115,
      interactRadius: 95,
      roofColor: '#1B3B5A',
      wallColor: '#22293A',
      accentColor: '#00F0FF',
      prompt: '[E] ARCANE SANCTUM (ARCHMAGE SOLEN)',
      greeting:
        'Your soul-sigils can be inscribed, reshaped, or unbound here. Attune your Grimoire before ascending higher.',
    },
    {
      id: 'ravens_rest_tavern',
      name: "The Raven's Rest Tavern & Inn",
      npcName: 'Maeve the Hearthkeeper',
      npcTitle: 'Tavern Hostess',
      npcRole: 'Hearthkeeper',
      x: 2700,
      y: 3250,
      width: 155,
      height: 110,
      interactRadius: 95,
      roofColor: '#4D3423',
      wallColor: '#2E2622',
      accentColor: '#FFC83D',
      prompt: "[E] RAVEN'S REST TAVERN (MAEVE)",
      greeting:
        'Sit by the hearth, child. A hot plate of wyrm-steak and spiced ale will keep your heart beating in the dark.',
    },
    {
      id: 'mystic_enchanter',
      name: 'Mystic Enchanter & Curio Broker',
      npcName: 'Vex the Veil-Peddler',
      npcTitle: 'Occult Curio Broker',
      npcRole: 'Occult Broker',
      x: 3300,
      y: 3250,
      width: 155,
      height: 110,
      interactRadius: 95,
      roofColor: '#4A153B',
      wallColor: '#2A1D30',
      accentColor: '#E879F9',
      prompt: '[E] MYSTIC ENCHANTER & CURIOS (VEX)',
      greeting:
        'Gold is heavy, Ascendant. Wager it on sealed abyssal curios or let me etch forbidden runes into your armor.',
    },
  ],
};
DUSKHOLLOW_TOWN.towerGatehouse = DUSKHOLLOW_TOWN.towerEntrance;
DUSKHOLLOW_TOWN.abyssalTower = DUSKHOLLOW_TOWN.towerEntrance;
export const TOWN_CONFIG = DUSKHOLLOW_TOWN;

// ============================================================================
// TAVERN MEALS, CURIO GAMBLING TIERS & WANDERING MERCHANT WARES
// ============================================================================
export const TAVERN_MEALS = [
  {
    id: 'wyrm_steak',
    name: 'Charred Wyrm Steak',
    price: 75,
    duration: 300,
    atkMult: 0.15,
    defMult: 0,
    speedMult: 0,
    maxHpBonus: 40,
    desc: 'Restores full HP/Stamina and grants +15% Attack Power & +40 Max HP for 5 minutes.',
  },
  {
    id: 'frost_ale',
    name: 'Spiced Abyssal Stout',
    price: 85,
    duration: 300,
    atkMult: 0,
    defMult: 0.2,
    speedMult: 0.05,
    maxHpBonus: 60,
    desc: 'Restores full HP/Stamina and grants +20% Defense, +60 Max HP & +5% Speed for 5 minutes.',
  },
  {
    id: 'spiced_marrow',
    name: "Seer's Moonlit Broth",
    price: 95,
    duration: 300,
    atkMult: 0.1,
    defMult: 0.1,
    speedMult: 0.15,
    maxHpBonus: 30,
    desc: 'Restores full HP/Stamina and grants +15% Move Speed, +10% ATK/DEF & +30 Max HP for 5 minutes.',
  },
  {
    id: 'void_nectar',
    name: 'Sovereign Feast of the Eclipse',
    price: 220,
    duration: 420,
    atkMult: 0.25,
    defMult: 0.25,
    speedMult: 0.12,
    maxHpBonus: 120,
    desc: 'Royal banquet: Full Restore + +25% ATK, +25% DEF, +120 Max HP & +12% Move Speed for 7 minutes.',
  },
];

export const CURIO_GAMBLE_TIERS = [
  {
    id: 'curio_tarnished',
    name: 'Tarnished Catacomb Coffer',
    cost: 120,
    minFloor: 1,
    maxFloor: 2,
    desc: 'Unseal a Floor 1–2 Mystery Coffer. Can yield Crypt/Frostbound armaments, Alchemist bundles, or a 3x Gold Jackpot.',
  },
  {
    id: 'curio_bloodbound',
    name: 'Hellforged Reliquary Box',
    cost: 340,
    minFloor: 2,
    maxFloor: 4,
    desc: 'Unseal a Floor 2–4 Reliquary. High chance for Hellfire/Rotwood gear, Cursed Relics, or a 3x Gold Jackpot.',
  },
  {
    id: 'curio_sovereign',
    name: 'Astral Demiurge Casket',
    cost: 780,
    minFloor: 4,
    maxFloor: 5,
    desc: 'Unseal a Floor 4–5 Sovereign Casket. Can bestow Endgame Void-Touched gear or a massive Gold Jackpot.',
  },
];

export const WANDERING_MERCHANT_CONFIG = {
  name: 'Morwen the Veil-Peddler',
  title: 'Wandering Caravan Mystic',
  spawnChancePerCorner: 0.2,
  defenseDuration: 30,
  repellentRadius: 260,
  corners: [
    { id: 'nw', name: 'Northwest Crypt Corner', x: 780, y: 780 },
    { id: 'ne', name: 'Northeast Crypt Corner', x: 5220, y: 780 },
    { id: 'sw', name: 'Southwest Crypt Corner', x: 780, y: 5220 },
    { id: 'se', name: 'Southeast Crypt Corner', x: 5220, y: 5220 },
  ],
};

export const WANDERING_MERCHANT_STOCK = {
  relics: [
    {
      id: 'relic_blood_chalice',
      name: 'Cursed Blood Chalice',
      price: 160,
      atkBonus: 7,
      defBonus: 0,
      maxHpBonus: 25,
      critBonus: 0.06,
      desc: 'Ancient vampire chalice. Permanently grants +7 ATK, +25 Max HP, and +6% Crit Chance.',
    },
    {
      id: 'relic_obsidian_signet',
      name: 'Abyssal Ward Signet',
      price: 160,
      atkBonus: 2,
      defBonus: 7,
      maxHpBonus: 55,
      critBonus: 0,
      desc: 'Obsidian ward ring. Permanently grants +7 DEF, +2 ATK, and +55 Max HP.',
    },
    {
      id: 'relic_astral_eye',
      name: 'Eye of the Eclipsed Star',
      price: 290,
      atkBonus: 12,
      defBonus: 5,
      maxHpBonus: 60,
      critBonus: 0.08,
      desc: 'Forbidden Void relic. Permanently grants +12 ATK, +5 DEF, +60 Max HP, and +8% Crit Chance.',
    },
  ],
  elixirs: [
    {
      id: 'elixir_soul_harvest',
      name: 'Elixir of Soul Harvest',
      price: 95,
      duration: 240,
      xpMult: 0.5,
      goldMult: 0.5,
      desc: 'Grants +50% Bonus XP & +50% Bonus Gold from all kills for 4 minutes + Full Heal.',
    },
    {
      id: 'elixir_void_ascendance',
      name: 'Draught of Abyssal Ascendance',
      price: 175,
      duration: 300,
      xpMult: 1.0,
      goldMult: 0.75,
      desc: 'Grants +100% Bonus XP (2x XP) & +75% Bonus Gold for 5 minutes + Full Heal.',
    },
  ],
};
export const WANDERING_MERCHANT_WARES = WANDERING_MERCHANT_STOCK;

export const CLEANSED_TERRITORY_NPCS = [
  {
    id: 'pilgrim_caelum',
    name: 'Sir Caelum the Undying',
    role: 'Cleansed Sanctuary Knight',
    buffType: 'blessing',
    greeting:
      'You have severed the Overlord of this domain! Accept my Sanctuary Blessing and these supplies for your ascent.',
  },
  {
    id: 'pilgrim_lyra',
    name: 'Sister Lyra of the Veil',
    role: 'Wandering Shrine Maiden',
    buffType: 'blessing',
    greeting:
      'The miasma lifts from this sector. May the Sanctuary flame mend your wounds and fill your coffer.',
  },
  {
    id: 'pilgrim_orin',
    name: 'Runeseeker Orin',
    role: 'Relic Chronicler',
    buffType: 'blessing',
    greeting:
      'Remarkable! With the bloodline broken here, I recovered these ancient coins and vials for you.',
  },
];

// ============================================================================
// 5 ABYSSAL TOWER FLOORS CONFIGURATION (FLOORS 0–5)
// ============================================================================
export const DARK_FANTASY_FLOORS = {
  0: {
    floor: 0,
    floorId: 0,
    name: 'Duskhollow Town',
    subtitle: 'Safe Sanctuary Plaza · RPG Hub Beneath the Spire',
    roman: 'TOWN HUB',
    levelRange: 'Safe Haven',
    levelBand: [1, 100],
    expectedLevelBand: [1, 100],
    baseMobLevel: 1,
    hpMult: 1.0,
    dmgMult: 1.0,
    xpMult: 1.0,
    goldMult: 1.0,
    statMult: 1.0,
    accentColor: '#D4AF37',
    themeColor: '#D4AF37',
    groundColor: '#16141C',
    detailColor: '#342D42',
    palette: {
      ground: '#16141C',
      stone: '#342D42',
      road: '#252130',
      accent: '#D4AF37',
    },
    particleType: 'ash',
    weather: 'ash',
    statusHazard: null,
    lore: 'The last lantern-lit bastion where Forge, Apothecary, Guild, Sanctum, Tavern, and Enchanter prepare Ascendants for the Spire.',
    sectors: {
      slabTown: { name: 'Northern Spire Approach', subtitle: 'Abyssal Gatehouse Plaza', bloodline: 'malgorth', groundColor: '#16141C', detailColor: '#342D42' },
      route9: { name: 'Western Guild Quarter', subtitle: 'Forge, Guild & Tavern Row', bloodline: 'varkos', groundColor: '#16141C', detailColor: '#342D42' },
      lyeMarsh: { name: 'Eastern Sanctum Quarter', subtitle: 'Apothecary, Sanctum & Curios', bloodline: 'hagra', groundColor: '#16141C', detailColor: '#342D42' },
      copperFlats: { name: 'Southern Lantern Gate', subtitle: 'Duskhollow Waystone Courtyard', bloodline: 'skarath', groundColor: '#16141C', detailColor: '#342D42' },
    },
  },
  1: {
    floor: 1,
    floorId: 1,
    name: 'The Blighted Catacombs',
    subtitle: 'Floor 1 · Subterranean Ossuary & Weeping Fens',
    roman: 'FLOOR I',
    levelRange: 'Lv 1–10',
    levelBand: [1, 10],
    expectedLevelBand: [1, 10],
    baseMobLevel: 2,
    hpMult: 1.0,
    dmgMult: 1.0,
    xpMult: 1.0,
    goldMult: 1.0,
    statMult: 1.0,
    accentColor: '#00F0FF',
    themeColor: '#00F0FF',
    groundColor: '#121318',
    detailColor: '#252730',
    palette: {
      ground: '#121318',
      stone: '#252730',
      road: '#14151C',
      accent: '#00F0FF',
    },
    particleType: 'ash',
    weather: 'ash',
    statusHazard: 'bleed',
    lore: 'The fractured first stratum of the Spire where risen grave-thralls and 1st-generation Bloodline Wardens guard the ossuary seals.',
    sectors: {
      slabTown: { name: 'Ossuary Nave', subtitle: 'North Crypt · Lv 1–10 · House of Malgorth', bloodline: 'malgorth', groundColor: '#161820', detailColor: '#2E3140' },
      route9: { name: 'Gallows Causeway', subtitle: 'West Bridge · Lv 1–10 · Cavalcade of Varkos', bloodline: 'varkos', groundColor: '#14151C', detailColor: '#2A2C38' },
      lyeMarsh: { name: 'Weeping Fens', subtitle: 'East Mire · Lv 1–10 · Coven of Hagra', bloodline: 'hagra', groundColor: '#101F1E', detailColor: '#1D3B38' },
      copperFlats: { name: 'Sepulcher of Ash', subtitle: 'South Barrow · Lv 1–10 · Brood of Skarath', bloodline: 'skarath', groundColor: '#241512', detailColor: '#4A261E' },
    },
  },
  2: {
    floor: 2,
    floorId: 2,
    name: 'The Frostbound Crypt',
    subtitle: 'Floor 2 · Rime-Cursed Vaults & Glacial Viaduct',
    roman: 'FLOOR II',
    levelRange: 'Lv 11–20',
    levelBand: [11, 20],
    expectedLevelBand: [11, 20],
    baseMobLevel: 12,
    hpMult: 1.95,
    dmgMult: 1.65,
    xpMult: 2.1,
    goldMult: 1.9,
    statMult: 1.95,
    accentColor: '#7CE8FF',
    themeColor: '#7CE8FF',
    groundColor: '#0D1822',
    detailColor: '#1B3144',
    palette: {
      ground: '#0D1822',
      stone: '#1B3144',
      road: '#0D1924',
      accent: '#7CE8FF',
    },
    particleType: 'snow',
    weather: 'snow',
    statusHazard: 'slow',
    lore: 'Sub-zero burial chambers where 2nd-generation Deathknight bloodlines freeze the blood of intruders.',
    sectors: {
      slabTown: { name: 'Rime-Cursed Vaults', subtitle: 'North Vault · Lv 11–20 · House of Malgorth', bloodline: 'malgorth', groundColor: '#0F1D29', detailColor: '#233E54' },
      route9: { name: 'Glacial Viaduct', subtitle: 'West Iceway · Lv 11–20 · Cavalcade of Varkos', bloodline: 'varkos', groundColor: '#0D1924', detailColor: '#1E364A' },
      lyeMarsh: { name: 'Frozen Charnel', subtitle: 'East Glacier · Lv 11–20 · Coven of Hagra', bloodline: 'hagra', groundColor: '#0E2229', detailColor: '#1D4452' },
      copperFlats: { name: 'Hoarfrost Citadel', subtitle: 'South Keep · Lv 11–20 · Brood of Skarath', bloodline: 'skarath', groundColor: '#12202E', detailColor: '#2A4663' },
    },
  },
  3: {
    floor: 3,
    floorId: 3,
    name: 'The Hellfire Abyss',
    subtitle: 'Floor 3 · Brimstone Caldera & Iron Maiden Causeway',
    roman: 'FLOOR III',
    levelRange: 'Lv 21–30',
    levelBand: [21, 30],
    expectedLevelBand: [21, 30],
    baseMobLevel: 22,
    hpMult: 3.4,
    dmgMult: 2.5,
    xpMult: 3.8,
    goldMult: 3.2,
    statMult: 3.4,
    accentColor: '#FF5A26',
    themeColor: '#FF5A26',
    groundColor: '#1C0E0C',
    detailColor: '#3B1A14',
    palette: {
      ground: '#1C0E0C',
      stone: '#3B1A14',
      road: '#1C0D0B',
      accent: '#FF5A26',
    },
    particleType: 'sparks',
    weather: 'sparks',
    statusHazard: 'burn',
    lore: 'Rivers of molten slag and demonic crucibles ruled by the 3rd-generation Archfiend progenitors.',
    sectors: {
      slabTown: { name: 'Brimstone Caldera', subtitle: 'North Kiln · Lv 21–30 · House of Malgorth', bloodline: 'malgorth', groundColor: '#21100D', detailColor: '#4A2018' },
      route9: { name: 'Iron Maiden Causeway', subtitle: 'West Viaduct · Lv 21–30 · Cavalcade of Varkos', bloodline: 'varkos', groundColor: '#1C0D0B', detailColor: '#3D1B15' },
      lyeMarsh: { name: 'The Cinder Pit', subtitle: 'East Crucible · Lv 21–30 · Coven of Hagra', bloodline: 'hagra', groundColor: '#24130E', detailColor: '#522618' },
      copperFlats: { name: 'Throne of Scars', subtitle: 'South Caldera · Lv 21–30 · Brood of Skarath', bloodline: 'skarath', groundColor: '#29120C', detailColor: '#5E2416' },
    },
  },
  4: {
    floor: 4,
    floorId: 4,
    name: 'The Rotwood Mire',
    subtitle: 'Floor 4 · Fungal Catacombs & Heart of the Blight',
    roman: 'FLOOR IV',
    levelRange: 'Lv 31–40',
    levelBand: [31, 40],
    expectedLevelBand: [31, 40],
    baseMobLevel: 32,
    hpMult: 5.6,
    dmgMult: 3.7,
    xpMult: 6.4,
    goldMult: 5.2,
    statMult: 5.6,
    accentColor: '#C9F24B',
    themeColor: '#C9F24B',
    groundColor: '#0E1D16',
    detailColor: '#1F3D2E',
    palette: {
      ground: '#0E1D16',
      stone: '#1F3D2E',
      road: '#0F1F18',
      accent: '#C9F24B',
    },
    particleType: 'spores',
    weather: 'spores',
    statusHazard: 'corrode',
    lore: 'A sprawling subterranean forest of weeping mycelium where 4th-generation Plague Lords gestate.',
    sectors: {
      slabTown: { name: 'Fungal Catacombs', subtitle: 'North Hollow · Lv 31–40 · House of Malgorth', bloodline: 'malgorth', groundColor: '#11221A', detailColor: '#264A39' },
      route9: { name: 'Bile-Root Hollow', subtitle: 'West Thicket · Lv 31–40 · Cavalcade of Varkos', bloodline: 'varkos', groundColor: '#0F1F18', detailColor: '#224234' },
      lyeMarsh: { name: 'Carrion Fen', subtitle: 'East Swamp · Lv 31–40 · Coven of Hagra', bloodline: 'hagra', groundColor: '#12261B', detailColor: '#2B543D' },
      copperFlats: { name: 'Heart of the Blight', subtitle: 'South Nest · Lv 31–40 · Brood of Skarath', bloodline: 'skarath', groundColor: '#16291C', detailColor: '#325C3E' },
    },
  },
  5: {
    floor: 5,
    floorId: 5,
    name: 'The Void Citadel',
    subtitle: 'Floor 5 · Starfall Cloister & Sanctum of the Demiurge',
    roman: 'FLOOR V',
    levelRange: 'Lv 41–50+',
    levelBand: [41, 50],
    expectedLevelBand: [41, 50],
    baseMobLevel: 42,
    hpMult: 8.8,
    dmgMult: 5.4,
    xpMult: 10.5,
    goldMult: 8.5,
    statMult: 8.8,
    accentColor: '#FFC83D',
    themeColor: '#FFC83D',
    groundColor: '#110C1D',
    detailColor: '#281B42',
    palette: {
      ground: '#110C1D',
      stone: '#281B42',
      road: '#120C21',
      accent: '#FFC83D',
    },
    particleType: 'void',
    weather: 'void',
    statusHazard: 'stun',
    lore: 'The astral apex of the current Spire where gravity fractures and the 5th-generation Eternal Sovereigns reign.',
    sectors: {
      slabTown: { name: 'Starfall Cloister', subtitle: 'North Sanctum · Lv 41–50 · House of Malgorth', bloodline: 'malgorth', groundColor: '#140E24', detailColor: '#312254' },
      route9: { name: 'The Eclipsed Spire', subtitle: 'West Causeway · Lv 41–50 · Cavalcade of Varkos', bloodline: 'varkos', groundColor: '#120C21', detailColor: '#2B1D4C' },
      lyeMarsh: { name: 'Choir of Silence', subtitle: 'East Nave · Lv 41–50 · Coven of Hagra', bloodline: 'hagra', groundColor: '#160F26', detailColor: '#38245E' },
      copperFlats: { name: 'Sanctum of the Demiurge', subtitle: 'South Throne · Lv 41–50 · Brood of Skarath', bloodline: 'skarath', groundColor: '#1A112E', detailColor: '#422B70' },
    },
  },
};
export const TOWER_FLOORS = DARK_FANTASY_FLOORS;

// ============================================================================
// 4 GREAT BOSS BLOODLINE FAMILY TREES & 60 SEQUENTIAL BOSS CHAINS
// ============================================================================
export const FLOOR_BOSS_CHAINS = {
  1: {
    slabTown: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f1_north_warden', name: 'Grave-Warden Vorn', title: 'Ossuary Gatekeeper', level: 4, hpMult: 0.62, dmgMult: 0.75, scaleMult: 0.86 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f1_north_exec', name: 'Bone-Cleaver Gorath', title: 'Crypt Headsman', level: 7, hpMult: 0.85, dmgMult: 0.90, scaleMult: 0.96 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'theForeman', name: 'High Executioner Malgorth', title: 'Lord of the Ossuary Nave', level: 10, hpMult: 1.12, dmgMult: 1.08, scaleMult: 1.08 },
    ],
    route9: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f1_west_warden', name: 'Houndsman Kael', title: 'Gallows Outrider', level: 3, hpMult: 0.62, dmgMult: 0.75, scaleMult: 0.86 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f1_west_exec', name: 'Iron-Wheel Draven', title: 'Chain-Flail Rider', level: 6, hpMult: 0.85, dmgMult: 0.90, scaleMult: 0.96 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'bigAxle', name: 'Dread Charioteer Varkos', title: 'Scourge of Gallows Causeway', level: 9, hpMult: 1.12, dmgMult: 1.08, scaleMult: 1.08 },
    ],
    lyeMarsh: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f1_east_warden', name: 'Mire-Witch Syla', title: 'Keeper of Leech Vats', level: 4, hpMult: 0.62, dmgMult: 0.75, scaleMult: 0.86 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f1_east_exec', name: 'Leech-Cantor Morvath', title: 'Choir of the Fens', level: 7, hpMult: 0.85, dmgMult: 0.90, scaleMult: 0.96 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'motherSump', name: 'Bog-Matriarch Hagra', title: 'Queen of the Weeping Fens', level: 10, hpMult: 1.12, dmgMult: 1.08, scaleMult: 1.08 },
    ],
    copperFlats: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f1_south_warden', name: 'Crypt-Stalker Vorx', title: 'Burrower of Ash', level: 4, hpMult: 0.62, dmgMult: 0.75, scaleMult: 0.86 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f1_south_exec', name: 'Tomb-Gorger Krag', title: 'Carapace Behemoth', level: 7, hpMult: 0.85, dmgMult: 0.90, scaleMult: 0.96 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'theLongDry', name: 'Catacomb Wyrm Skarath', title: 'Terror of the Sepulcher', level: 10, hpMult: 1.12, dmgMult: 1.08, scaleMult: 1.08 },
    ],
  },
  2: {
    slabTown: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f2_north_warden', name: 'Rime-Warden Vorn', title: 'Frostbound Sentinel', level: 14, hpMult: 0.65, dmgMult: 0.78, scaleMult: 0.90 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f2_north_exec', name: 'Deathknight Gorath', title: 'Glacial Guillotine', level: 17, hpMult: 0.88, dmgMult: 0.94, scaleMult: 1.02 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f2_north_overlord', name: 'Dreadlord Malgorth', title: 'Monarch of the Rime Vaults', level: 20, hpMult: 1.18, dmgMult: 1.12, scaleMult: 1.15 },
    ],
    route9: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f2_west_warden', name: 'Frost-Stalker Kael', title: 'Houndmaster of Rime', level: 13, hpMult: 0.65, dmgMult: 0.78, scaleMult: 0.90 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f2_west_exec', name: 'Glacier-Ram Draven', title: 'Avalanche Rider', level: 16, hpMult: 0.88, dmgMult: 0.94, scaleMult: 1.02 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f2_west_overlord', name: 'Cryo-Cavalier Varkos', title: 'Phantom of the Viaduct', level: 19, hpMult: 1.18, dmgMult: 1.12, scaleMult: 1.15 },
    ],
    lyeMarsh: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f2_east_warden', name: 'Frost-Siren Syla', title: 'Chanter of Hoarfrost', level: 14, hpMult: 0.65, dmgMult: 0.78, scaleMult: 0.90 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f2_east_exec', name: 'Rime-Priest Morvath', title: 'Frozen Reliquary', level: 17, hpMult: 0.88, dmgMult: 0.94, scaleMult: 1.02 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f2_east_overlord', name: 'Ice-Matriarch Hagra', title: 'Mistress of Frozen Charnel', level: 20, hpMult: 1.18, dmgMult: 1.12, scaleMult: 1.15 },
    ],
    copperFlats: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f2_south_warden', name: 'Ice-Borer Vorx', title: 'Permafrost Tunnel-Wyrm', level: 14, hpMult: 0.65, dmgMult: 0.78, scaleMult: 0.90 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f2_south_exec', name: 'Frost-Gorger Krag', title: 'Glacier Crusher', level: 17, hpMult: 0.88, dmgMult: 0.94, scaleMult: 1.02 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f2_south_overlord', name: 'Glacier-Wyrm Skarath', title: 'Leviathan of Hoarfrost', level: 20, hpMult: 1.18, dmgMult: 1.12, scaleMult: 1.15 },
    ],
  },
  3: {
    slabTown: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f3_north_warden', name: 'Cinder-Warden Vorn', title: 'Ashen Bastion', level: 24, hpMult: 0.68, dmgMult: 0.80, scaleMult: 0.94 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f3_north_exec', name: 'Hellblade Gorath', title: 'Brimstone Butcher', level: 27, hpMult: 0.92, dmgMult: 0.96, scaleMult: 1.06 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f3_north_overlord', name: 'Archfiend Malgorth', title: 'Overlord of the Caldera', level: 30, hpMult: 1.24, dmgMult: 1.16, scaleMult: 1.22 },
    ],
    route9: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f3_west_warden', name: 'Hellhound Kael', title: 'Cinder Packleader', level: 23, hpMult: 0.68, dmgMult: 0.80, scaleMult: 0.94 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f3_west_exec', name: 'Magma-Ram Draven', title: 'Molten Juggernaut', level: 26, hpMult: 0.92, dmgMult: 0.96, scaleMult: 1.06 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f3_west_overlord', name: 'Infernal Chariot Varkos', title: 'Lord of Iron Maidens', level: 29, hpMult: 1.24, dmgMult: 1.16, scaleMult: 1.22 },
    ],
    lyeMarsh: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f3_east_warden', name: 'Pyre-Witch Syla', title: 'Maiden of Ash', level: 24, hpMult: 0.68, dmgMult: 0.80, scaleMult: 0.94 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f3_east_exec', name: 'Ash-Cantor Morvath', title: 'Herald of Immolation', level: 27, hpMult: 0.92, dmgMult: 0.96, scaleMult: 1.06 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f3_east_overlord', name: 'Cinder-Queen Hagra', title: 'Matron of the Cinder Pit', level: 30, hpMult: 1.24, dmgMult: 1.16, scaleMult: 1.22 },
    ],
    copperFlats: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f3_south_warden', name: 'Magma-Burrower Vorx', title: 'Obsidian Tunneler', level: 24, hpMult: 0.68, dmgMult: 0.80, scaleMult: 0.94 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f3_south_exec', name: 'Slag-Maw Krag', title: 'Crucible Devourer', level: 27, hpMult: 0.92, dmgMult: 0.96, scaleMult: 1.06 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f3_south_overlord', name: 'Hell-Drake Skarath', title: 'Wyrm of the Throne of Scars', level: 30, hpMult: 1.24, dmgMult: 1.16, scaleMult: 1.22 },
    ],
  },
  4: {
    slabTown: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f4_north_warden', name: 'Blight-Warden Vorn', title: 'Fungal Watcher', level: 34, hpMult: 0.70, dmgMult: 0.82, scaleMult: 0.98 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f4_north_exec', name: 'Spore-Reaver Gorath', title: 'Plague Executioner', level: 37, hpMult: 0.95, dmgMult: 0.98, scaleMult: 1.12 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f4_north_overlord', name: 'Pestilent Lord Malgorth', title: 'Harbinger of Decay', level: 40, hpMult: 1.30, dmgMult: 1.20, scaleMult: 1.28 },
    ],
    route9: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f4_west_warden', name: 'Carrion-Hound Kael', title: 'Bile-Root Tracker', level: 33, hpMult: 0.70, dmgMult: 0.82, scaleMult: 0.98 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f4_west_exec', name: 'Bile-Hulk Draven', title: 'Putrid Stampede', level: 36, hpMult: 0.95, dmgMult: 0.98, scaleMult: 1.12 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f4_west_overlord', name: 'Plague-Rider Varkos', title: 'Horseman of Contagion', level: 39, hpMult: 1.30, dmgMult: 1.20, scaleMult: 1.28 },
    ],
    lyeMarsh: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f4_east_warden', name: 'Spore-Witch Syla', title: 'Weaver of Mycelium', level: 34, hpMult: 0.70, dmgMult: 0.82, scaleMult: 0.98 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f4_east_exec', name: 'Rot-Cantor Morvath', title: 'Blight Bishop', level: 37, hpMult: 0.95, dmgMult: 0.98, scaleMult: 1.12 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f4_east_overlord', name: 'Brood-Mother Hagra', title: 'Empress of the Carrion Fen', level: 40, hpMult: 1.30, dmgMult: 1.20, scaleMult: 1.28 },
    ],
    copperFlats: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f4_south_warden', name: 'Root-Chewer Vorx', title: 'Mire Burrower', level: 34, hpMult: 0.70, dmgMult: 0.82, scaleMult: 0.98 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f4_south_exec', name: 'Venom-Maw Krag', title: 'Blight Behemoth', level: 37, hpMult: 0.95, dmgMult: 0.98, scaleMult: 1.12 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f4_south_overlord', name: 'Putrid Leviathan Skarath', title: 'Devourer of the Blight Heart', level: 40, hpMult: 1.30, dmgMult: 1.20, scaleMult: 1.28 },
    ],
  },
  5: {
    slabTown: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f5_north_warden', name: 'Void-Warden Vorn', title: 'Starfall Sentinel', level: 44, hpMult: 0.74, dmgMult: 0.85, scaleMult: 1.04 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f5_north_exec', name: 'Astral-Blade Gorath', title: 'Severer of Comets', level: 47, hpMult: 1.00, dmgMult: 1.02, scaleMult: 1.18 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f5_north_overlord', name: 'Eternal Sovereign Malgorth', title: 'Progenitor of the First Seal', level: 50, hpMult: 1.38, dmgMult: 1.26, scaleMult: 1.35 },
    ],
    route9: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f5_west_warden', name: 'Rift-Hound Kael', title: 'Void Outrider', level: 43, hpMult: 0.74, dmgMult: 0.85, scaleMult: 1.04 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f5_west_exec', name: 'Star-Ram Draven', title: 'Nebula Breaker', level: 46, hpMult: 1.00, dmgMult: 1.02, scaleMult: 1.18 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f5_west_overlord', name: 'Void-Cavalier Varkos', title: 'Ruin of the Eclipsed Spire', level: 49, hpMult: 1.38, dmgMult: 1.26, scaleMult: 1.35 },
    ],
    lyeMarsh: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f5_east_warden', name: 'Void-Oracle Syla', title: 'Seer of the Eclipse', level: 44, hpMult: 0.74, dmgMult: 0.85, scaleMult: 1.04 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f5_east_exec', name: 'Void-Choir Morvath', title: 'Cantor of Silence', level: 47, hpMult: 1.00, dmgMult: 1.02, scaleMult: 1.18 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f5_east_overlord', name: 'Abyss-Mother Hagra', title: 'High Priestess of the Void', level: 50, hpMult: 1.38, dmgMult: 1.26, scaleMult: 1.35 },
    ],
    copperFlats: [
      { stageIndex: 0, stageLabel: 'I · Warden', rank: 'Warden', id: 'f5_south_warden', name: 'Rift-Serpent Vorx', title: 'Dimensional Stalker', level: 44, hpMult: 0.74, dmgMult: 0.85, scaleMult: 1.04 },
      { stageIndex: 1, stageLabel: 'II · Executioner', rank: 'Executioner', id: 'f5_south_exec', name: 'Star-Gorger Krag', title: 'World-Eater Spawn', level: 47, hpMult: 1.00, dmgMult: 1.02, scaleMult: 1.18 },
      { stageIndex: 2, stageLabel: 'III · Overlord', rank: 'Overlord', id: 'f5_south_overlord', name: 'Elder Void-Dragon Skarath', title: 'Apex Wyrm of the Demiurge', level: 50, hpMult: 1.38, dmgMult: 1.26, scaleMult: 1.35 },
    ],
  },
};

export const BOSS_BLOODLINES = [
  {
    id: 'malgorth',
    sectorId: 'slabTown',
    bossId: 'theForeman',
    baseBossId: 'theForeman',
    name: 'House of Malgorth',
    familyName: 'House of Malgorth',
    title: 'The Undying Executioners (North)',
    accentColor: '#FF3B3B',
    accent: '#FF3B3B',
    lore: 'An ancient order of abyssal headsmen who bound their souls to guillotine greatswords. Each generation rises stronger in the deeper strata of the Spire.',
  },
  {
    id: 'varkos',
    sectorId: 'route9',
    bossId: 'bigAxle',
    baseBossId: 'bigAxle',
    name: 'Cavalcade of Varkos',
    familyName: 'Cavalcade of Varkos',
    title: 'The Dread Charioteers (West)',
    accentColor: '#FFC83D',
    accent: '#FFC83D',
    lore: 'Cursed outriders fused to iron war-chariots and spectral steeds. Their thunderous charges shatter bone and stone alike.',
  },
  {
    id: 'hagra',
    sectorId: 'lyeMarsh',
    bossId: 'motherSump',
    baseBossId: 'motherSump',
    name: 'Coven of Hagra',
    familyName: 'Coven of Hagra',
    title: 'The Blighted Matriarchs (East)',
    accentColor: '#C9F24B',
    accent: '#C9F24B',
    lore: 'High witches who brew necrotic cauldrons and devour their own thralls to birth pestilent abominations.',
  },
  {
    id: 'skarath',
    sectorId: 'copperFlats',
    bossId: 'theLongDry',
    baseBossId: 'theLongDry',
    name: 'Brood of Skarath',
    familyName: 'Brood of Skarath',
    title: 'The Catacomb Wyrms (South)',
    accentColor: '#00F0FF',
    accent: '#00F0FF',
    lore: 'Subterranean elder drakes and bone-plated wyrms that tunnel through the foundations of the Abyssal Spire.',
  },
];
// Attach named properties for object-key lookup compatibility
BOSS_BLOODLINES.forEach((b) => {
  BOSS_BLOODLINES[b.id] = b;
});

// Auto-fill stage: stageIndex + 1 across all FLOOR_BOSS_CHAINS
for (const fl of Object.values(FLOOR_BOSS_CHAINS)) {
  for (const sectorList of Object.values(fl)) {
    for (const item of sectorList) {
      if (item.stage === undefined) {
        item.stage = (item.stageIndex ?? 0) + 1;
      }
    }
  }
}

// ============================================================================
// 5-ACT MAIN STORY CAMPAIGN & SIDE QUESTS
// ============================================================================
export const STORY_CAMPAIGN = [
  {
    act: 0,
    id: 'act_0_prologue',
    title: 'Prologue: Lanterns of Duskhollow',
    floor: 0,
    objective: 'Explore Duskhollow Town, speak with Chronicler Malakor or gear up, and enter the Top-Center Abyssal Spire Gatehouse.',
    lore: 'Beneath the Eclipsed Blood Moon, only Duskhollow Town remains unconsumed. Step north into the Abyssal Spire to sever the four cursed Bloodlines.',
    rewardGold: 150,
    rewardXp: 35,
  },
  {
    act: 1,
    id: 'act_1_catacombs',
    title: 'Act I: Chains of the Ossuary',
    floor: 1,
    objective: 'Cleanse all 4 Territories on Floor 1 (The Blighted Catacombs) by slaying each Warden -> Executioner -> Overlord.',
    lore: 'The First Seal of the Abyssal Spire has fractured. Conquer the Blighted Catacombs to open the Ascent Portal to Floor 2.',
    rewardGold: 350,
    rewardXp: 120,
  },
  {
    act: 2,
    id: 'act_2_frost',
    title: 'Act II: Rime of the Fallen',
    floor: 2,
    objective: 'Conquer all 4 Frostbound Bloodlines on Floor 2 (The Frostbound Crypt) and reach Level 15 for your Class Specialization.',
    lore: 'Slaying the Catacomb Overlords awakened their 2nd-generation Deathknight ancestors in the sub-zero Rime Vaults.',
    rewardGold: 650,
    rewardXp: 240,
  },
  {
    act: 3,
    id: 'act_3_hellfire',
    title: 'Act III: Crucible of Damnation',
    floor: 3,
    objective: 'Extinguish all 4 Infernal Bloodlines on Floor 3 (The Hellfire Abyss) across the Brimstone Caldera.',
    lore: 'In the molten depths of Floor 3, the 3rd-generation Archfiends forge demonic armaments from fallen Ascendants.',
    rewardGold: 1100,
    rewardXp: 420,
  },
  {
    act: 4,
    id: 'act_4_rotwood',
    title: 'Act IV: Roots of Contagion',
    floor: 4,
    objective: 'Purge all 4 Plague Bloodlines on Floor 4 (The Rotwood Mire) and reach Level 30 for your 2nd Mastery.',
    lore: 'A pestilent spore-miasma seeps toward Duskhollow Town from the Fungal Catacombs of Floor 4.',
    rewardGold: 1800,
    rewardXp: 700,
  },
  {
    act: 5,
    id: 'act_5_void',
    title: 'Act V: Throne of the Eclipsed Star',
    floor: 5,
    objective: 'Vanquish all 4 Eternal Bloodline Sovereigns on Floor 5 (The Void Citadel) to seal the Demiurge Rift.',
    lore: 'At the astral pinnacle of Floor 5, the Progenitors of Malgorth, Varkos, Hagra, and Skarath guard the First Seal.',
    rewardGold: 3200,
    rewardXp: 1400,
  },
];
export const STORY_ACTS = STORY_CAMPAIGN;

export const SIDE_QUESTS = [
  {
    id: 'sq_catacomb_bones',
    title: 'Ossuary Culling',
    giver: 'Master Smith Vaelen',
    target: 12,
    rewardGold: 180,
    rewardXp: 55,
    desc: 'Slay 12 cursed thralls on Floor 1 (The Blighted Catacombs) to harvest soul-iron for the Forge.',
  },
  {
    id: 'sq_bloodline_warden',
    title: 'Severing the Wardens',
    giver: 'Chronicler Malakor',
    target: 4,
    rewardGold: 260,
    rewardXp: 90,
    desc: 'Slay 4 Stage-I Wardens or Stage-II Executioners across any floor of the Abyssal Spire.',
  },
  {
    id: 'sq_frost_hearts',
    title: 'Hoarfrost Reliquaries',
    giver: 'Sister Isolde',
    target: 15,
    rewardGold: 420,
    rewardXp: 150,
    desc: 'Slay 15 Frostbound horrors on Floor 2 (The Frostbound Crypt) for purifying salts.',
  },
  {
    id: 'sq_hellfire_cinders',
    title: 'Hearts of Brimstone',
    giver: 'Archmage Solen',
    target: 3,
    rewardGold: 750,
    rewardXp: 280,
    desc: 'Defeat 3 Bloodline Bosses (any stage) on Floor 3 (The Hellfire Abyss).',
  },
  {
    id: 'sq_rotwood_spores',
    title: 'Purge the Mycelium',
    giver: 'Maeve the Hearthkeeper',
    target: 20,
    rewardGold: 1150,
    rewardXp: 450,
    desc: 'Destroy 20 Rotwood abominations on Floor 4 (The Rotwood Mire).',
  },
  {
    id: 'sq_void_sovereigns',
    title: 'Fall of the Progenitors',
    giver: 'Vex the Veil-Peddler',
    target: 4,
    rewardGold: 2400,
    rewardXp: 950,
    desc: 'Slay all 4 Stage-III Eternal Overlords on Floor 5 (The Void Citadel).',
  },
];
export const TOWN_SIDE_QUESTS = SIDE_QUESTS;

// ============================================================================
// FLOOR MOB RE-NAMING, UNCAPPED XP CURVE & 10-LEVEL GAP ABYSSAL ENRAGE BUFF
// ============================================================================
const FLOOR_MOB_PREFIXES = {
  1: 'Crypt',
  2: 'Frostbound',
  3: 'Hellforged',
  4: 'Rot-Spore',
  5: 'Void-Touched',
};

export function getFloorMobDisplayName(...args) {
  let floorNum = 1;
  let baseName = '';

  for (const arg of args) {
    if (typeof arg === 'number') {
      floorNum = Math.max(1, Math.floor(arg));
    } else if (typeof arg === 'string' && arg.trim().length > 0) {
      if (!baseName || arg.length > baseName.length) {
        baseName = arg;
      }
    }
  }

  if (!baseName) baseName = 'Abyssal Thrall';

  if (floorNum <= 1) return baseName;
  const prefix = FLOOR_MOB_PREFIXES[floorNum] || 'Abyssal';
  if (typeof baseName.startsWith === 'function' && baseName.startsWith(prefix)) return baseName;
  return `${prefix} ${baseName}`;
}

/**
 * Uncapped XP requirement per level:
 * Scales smoothly from Lv 1 -> Lv 50 (Floors 1–5) and continues uncapped toward Lv 100+ (future Floor 10).
 */
export function getUncappedXpToNext(level = 1) {
  const lv = Math.max(1, Math.floor(level));
  if (lv <= 10) {
    return Math.round(45 + lv * 22 + Math.pow(lv, 1.55) * 6);
  }
  if (lv <= 50) {
    return Math.round(110 + lv * 38 + Math.pow(lv, 1.78) * 8);
  }
  // Lv 51 -> 100+ endgame scaling
  return Math.round(280 + lv * 65 + Math.pow(lv, 1.92) * 11);
}

/**
 * Over-Level XP Decay Multiplier:
 * Reduces XP gain when the player's level exceeds the mob/boss level so players must ascend floors to reach Lv 50–100+.
 */
export function getOverlevelXpMultiplier(playerLevel, enemyLevel) {
  const delta = (playerLevel || 1) - (enemyLevel || 1);
  if (delta <= 2) return 1.0;
  if (delta <= 4) return 0.72;
  if (delta <= 6) return 0.45;
  if (delta <= 9) return 0.22;
  if (delta <= 14) return 0.08;
  return 0.03;
}
export const getOverLevelXpMultiplier = getOverlevelXpMultiplier;

/**
 * 10+ Level Gap "Abyssal Enrage" Buff:
 * Whenever player.level >= enemy.level + 10, that mob or boss receives a massive Dark Fantasy Enrage buff!
 */
export function getAbyssalEnrageBuff(playerLevel, enemyLevel) {
  const gap = (playerLevel || 1) - (enemyLevel || 1);
  if (gap < 10) {
    return {
      active: false,
      isEnraged: false,
      gap: Math.max(0, gap),
      label: null,
      hpMult: 1.0,
      dmgMult: 1.0,
      atkMult: 1.0,
      defMult: 1.0,
      speedMult: 1.0,
    };
  }
  const extraTiers = Math.max(0, gap - 10);
  const hpMult = +(2.65 + extraTiers * 0.22).toFixed(2);
  const dmgMult = +(2.25 + extraTiers * 0.16).toFixed(2);
  const defMult = +(1.75 + extraTiers * 0.10).toFixed(2);
  const speedMult = +Math.min(1.45, 1.24 + extraTiers * 0.015).toFixed(2);
  return {
    active: true,
    isEnraged: true,
    gap,
    label: `ABYSSAL ENRAGE (+${gap} LV GAP)`,
    hpMult,
    dmgMult,
    atkMult: dmgMult,
    defMult,
    speedMult,
  };
}
