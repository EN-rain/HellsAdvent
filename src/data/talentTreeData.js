/**
 * HellsAdvent — World of Warcraft Dragonflight-Style Dual Talent Tree System
 *
 * Provides structured node graphs for:
 * 1. CLASS TREES (Left): Character Archetype Utility, Survivability, Base Skills & Stat Passives.
 * 2. SPEC TREES (Right): Specialization-Specific Mastery, Active Skills, 2-Way Choice Forks, and Capstones.
 *
 * Node Shapes:
 * - 'square'   : Active Abilities & Major Skills
 * - 'circle'   : Passive Talents & Stat Enhancers (Rank 1/1, 1/2, 2/2, etc.)
 * - 'octagon'  : Choice Nodes (Mutually Exclusive Fork Variants with < > selection)
 */

import { CHARACTERS, SPECIALIZATIONS } from './classChangeData.js';

// --- HELPER TO BUILD NODE ---
function node({
  id,
  name,
  icon,
  type = 'passive', // 'active' | 'passive' | 'choice'
  shape = 'circle', // 'square' | 'circle' | 'octagon'
  col = 3,          // 0 to 6
  row = 0,          // 0 to 6
  maxRank = 1,
  parents = [],
  desc = '',
  nextDesc = null,
  stats = {},       // Stat bonuses per rank { atk, hp, stamina, speed, def, critChance, stamRegen, cdr }
  forks = null,     // [{ title, desc, tag }, { title, desc, tag }] for choice nodes
  skillRef = null,  // Active skill ID reference if active
  tuning = null,
}) {
  return {
    id,
    name,
    icon,
    type,
    shape: type === 'choice' ? 'octagon' : (type === 'active' ? 'square' : shape),
    col,
    row,
    maxRank: type === 'choice' ? 1 : maxRank,
    parents,
    desc,
    nextDesc,
    stats,
    forks,
    skillRef,
    tuning,
  };
}

// ============================================================================
// 1. CLASS TALENT TREES (LEFT SIDE)
// ============================================================================

export const CLASS_TREES = {
  sena: {
    id: 'sena',
    name: 'Scrapper Core',
    subtitle: 'Sena Ibuki · Class Talents',
    accent: '#00F0FF',
    nodes: [
      // ROW 0: Starter Baseline Actives
      node({
        id: 'sena:base:lunge',
        name: 'Lunge',
        icon: 'lunge',
        type: 'active',
        shape: 'square',
        col: 1,
        row: 0,
        maxRank: 1,
        parents: [],
        desc: 'Dash 160px toward the cursor, cutting every enemy on the line.',
        skillRef: 'sena:base:lunge',
        tuning: '10 Stamina · 5.0s Cooldown',
      }),
      node({
        id: 'sena:base:ground-break',
        name: 'Ground Break',
        icon: 'groundBreak',
        type: 'active',
        shape: 'square',
        col: 3,
        row: 0,
        maxRank: 1,
        parents: [],
        desc: 'Slam the rail downward, fracturing a 110px crater with heavy stagger and stun.',
        skillRef: 'sena:base:ground-break',
        tuning: '14 Stamina · 8.5s Cooldown',
      }),
      node({
        id: 'sena:base:rail-parry',
        name: 'Rail Parry',
        icon: 'railSpike',
        type: 'active',
        shape: 'square',
        col: 5,
        row: 0,
        maxRank: 1,
        parents: [],
        desc: 'Enter a 0.4s parry window. Deflecting an incoming hit unleashes Crescent Slash.',
        skillRef: 'sena:base:rail-parry',
        tuning: '8 Stamina · 6.0s Cooldown',
      }),

      // ROW 1: Early Stat Passives
      node({
        id: 'sena:class:iron-grip',
        name: 'Iron Grip',
        icon: 'railcutSword',
        type: 'passive',
        col: 1,
        row: 1,
        maxRank: 2,
        parents: ['sena:base:lunge'],
        desc: 'Increases Attack Power by +6 per rank.',
        nextDesc: 'Increases Attack Power by +12.',
        stats: { atk: 6 },
      }),
      node({
        id: 'sena:class:enduring-will',
        name: 'Enduring Will',
        icon: 'sugarTin',
        type: 'passive',
        col: 3,
        row: 1,
        maxRank: 2,
        parents: ['sena:base:ground-break'],
        desc: 'Increases Maximum Stamina by +15 and Stamina Recovery by +3/s per rank.',
        nextDesc: 'Increases Maximum Stamina by +30 and Stamina Recovery by +6/s.',
        stats: { stamina: 15, stamRegen: 3 },
      }),
      node({
        id: 'sena:class:thick-skin',
        name: 'Tempered Scrap',
        icon: 'patchedVest',
        type: 'passive',
        col: 5,
        row: 1,
        maxRank: 2,
        parents: ['sena:base:rail-parry'],
        desc: 'Increases Armor/Defense by +3 and Maximum HP by +20 per rank.',
        nextDesc: 'Increases Armor/Defense by +6 and Maximum HP by +40.',
        stats: { def: 3, hp: 20 },
      }),

      // ROW 2: Mobility & Branch Choice
      node({
        id: 'sena:class:fleetfoot',
        name: 'Fleetfoot',
        icon: 'runningShoes',
        type: 'passive',
        col: 0,
        row: 2,
        maxRank: 2,
        parents: ['sena:class:iron-grip'],
        desc: 'Increases Movement Speed by +8 and Sprint Efficiency by +10% per rank.',
        nextDesc: 'Increases Movement Speed by +16 and Sprint Efficiency by +20%.',
        stats: { speed: 8 },
      }),
      node({
        id: 'sena:class:choice-mobility',
        name: 'Tactical Stride',
        icon: 'lunge',
        type: 'choice',
        col: 2,
        row: 2,
        maxRank: 1,
        parents: ['sena:class:iron-grip', 'sena:class:enduring-will'],
        desc: 'Choose an evasive tactical mutation:',
        forks: [
          { title: 'Momentum Rush', desc: 'Dodge distance increased by +35px and grants +10% move speed for 2s.', tag: 'SPEED' },
          { title: 'Ghost Step', desc: 'Dodge cooldown reduced by 0.25s and grants 0.15s extra invulnerability.', tag: 'INVULN' },
        ],
      }),
      node({
        id: 'sena:class:keen-edge',
        name: 'Keen Edge',
        icon: 'railSpike',
        type: 'passive',
        col: 4,
        row: 2,
        maxRank: 2,
        parents: ['sena:class:enduring-will', 'sena:class:thick-skin'],
        desc: 'Increases Critical Strike Chance by +4% and Critical Damage by +10% per rank.',
        nextDesc: 'Increases Critical Strike Chance by +8% and Critical Damage by +20%.',
        stats: { critChance: 0.04 },
      }),
      node({
        id: 'sena:class:parry-mastery',
        name: 'Reflex Retaliation',
        icon: 'railSpike',
        type: 'passive',
        col: 6,
        row: 2,
        maxRank: 2,
        parents: ['sena:class:thick-skin'],
        desc: 'Extends Rail Parry window by 0.1s and counter-attack damage by +25% per rank.',
        nextDesc: 'Extends Rail Parry window by 0.2s and counter-attack damage by +50%.',
        stats: { atk: 4 },
      }),

      // ROW 3: Mid-Tier Synergies
      node({
        id: 'sena:class:adrenaline-surge',
        name: 'Adrenaline Surge',
        icon: 'stimStick',
        type: 'passive',
        col: 1,
        row: 3,
        maxRank: 1,
        parents: ['sena:class:fleetfoot', 'sena:class:choice-mobility'],
        desc: 'Killing an enemy immediately refunds 15 Stamina and resets sprint cost for 2s.',
        stats: { stamina: 10 },
      }),
      node({
        id: 'sena:class:choice-defense',
        name: 'Survival Conditioning',
        icon: 'gauzeRoll',
        type: 'choice',
        col: 3,
        row: 3,
        maxRank: 1,
        parents: ['sena:class:choice-mobility', 'sena:class:keen-edge'],
        desc: 'Choose defensive resilience doctrine:',
        forks: [
          { title: 'Second Wind', desc: 'When dropping below 30% HP, instantly heal 25% max HP (60s cooldown).', tag: 'HEAL' },
          { title: 'Slag Barrier', desc: 'Using any skill creates a barrier absorbing damage equal to 10% max HP for 3s.', tag: 'SHIELD' },
        ],
      }),
      node({
        id: 'sena:class:crushing-impact',
        name: 'Crushing Impact',
        icon: 'groundBreak',
        type: 'passive',
        col: 5,
        row: 3,
        maxRank: 1,
        parents: ['sena:class:keen-edge', 'sena:class:parry-mastery'],
        desc: 'Attacks deal +25% more stagger against elite enemies and bosses.',
        stats: { atk: 5 },
      }),

      // ROW 4: Deep Combat Passives
      node({
        id: 'sena:class:flow-state',
        name: 'Flow State',
        icon: 'sugarTin',
        type: 'passive',
        col: 2,
        row: 4,
        maxRank: 2,
        parents: ['sena:class:adrenaline-surge', 'sena:class:choice-defense'],
        desc: 'Reduces all skill cooldowns by 8% per rank.',
        nextDesc: 'Reduces all skill cooldowns by 16%.',
        stats: { cdr: 0.08 },
      }),
      node({
        id: 'sena:class:bleed-mastery',
        name: 'Hemorrhage',
        icon: 'cleaver',
        type: 'passive',
        col: 4,
        row: 4,
        maxRank: 2,
        parents: ['sena:class:choice-defense', 'sena:class:crushing-impact'],
        desc: 'Bleed effects applied to enemies deal +30% damage and last 2s longer per rank.',
        nextDesc: 'Bleed effects deal +60% damage and last 4s longer.',
        stats: { atk: 4 },
      }),

      // ROW 5: Pre-Capstone Passives
      node({
        id: 'sena:class:lethal-precision',
        name: 'Lethal Precision',
        icon: 'railcutSword',
        type: 'passive',
        col: 1,
        row: 5,
        maxRank: 2,
        parents: ['sena:class:flow-state'],
        desc: 'Increases Critical Strike Multiplier from 1.5x to 1.75x per rank.',
        nextDesc: 'Increases Critical Strike Multiplier from 1.75x to 2.0x.',
        stats: { critChance: 0.03, atk: 5 },
      }),
      node({
        id: 'sena:class:choice-offense',
        name: 'Execution Doctrine',
        icon: 'railSpike',
        type: 'choice',
        col: 3,
        row: 5,
        maxRank: 1,
        parents: ['sena:class:flow-state', 'sena:class:bleed-mastery'],
        desc: 'Choose finisher focus:',
        forks: [
          { title: 'Culling Blade', desc: 'Deals +40% bonus damage to enemies below 35% health.', tag: 'EXECUTE' },
          { title: 'Broad Cleave', desc: 'Basic attacks hit in a 40% wider arc, striking all adjacent foes.', tag: 'CLEAVE' },
        ],
      }),
      node({
        id: 'sena:class:juggernaut',
        name: 'Unstoppable Momentum',
        icon: 'anvil',
        type: 'passive',
        col: 5,
        row: 5,
        maxRank: 2,
        parents: ['sena:class:bleed-mastery'],
        desc: 'While above 50% stamina, gain +15% damage reduction and immunity to knockback.',
        nextDesc: 'While above 50% stamina, gain +30% damage reduction and immunity to knockback.',
        stats: { def: 4, hp: 30 },
      }),

      // ROW 6: Class Capstones (Bottom Row)
      node({
        id: 'sena:class:capstone-left',
        name: 'Apex Predator',
        icon: 'railcutSword',
        type: 'active',
        shape: 'square',
        col: 1,
        row: 6,
        maxRank: 1,
        parents: ['sena:class:lethal-precision'],
        desc: 'Every 5th attack triggers an automated Crescent Wave dealing 180% weapon damage in a 200px line.',
        stats: { atk: 12 },
      }),
      node({
        id: 'sena:class:capstone-center',
        name: 'Limitless Echo',
        icon: 'sevenCuts',
        type: 'active',
        shape: 'square',
        col: 3,
        row: 6,
        maxRank: 1,
        parents: ['sena:class:choice-offense'],
        desc: 'Activating Ultimate refunds 50% of all skill cooldowns and increases attack speed by 30% for 6s.',
        stats: { atk: 15, stamina: 25 },
      }),
      node({
        id: 'sena:class:capstone-right',
        name: 'Iron Bastion',
        icon: 'anvil',
        type: 'active',
        shape: 'square',
        col: 5,
        row: 6,
        maxRank: 1,
        parents: ['sena:class:juggernaut'],
        desc: 'Taking lethal damage leaves Sena at 1 HP with 2.5s invulnerability and +50% move speed (120s CD).',
        stats: { hp: 50, def: 6 },
      }),
    ],
  },

  rook: {
    id: 'rook',
    name: 'Marksman Core',
    subtitle: 'Rook Matsuda · Class Talents',
    accent: '#FFC83D',
    nodes: [
      node({ id: 'rook:base:rivet-spread', name: 'Rivet Spread', icon: 'rivetSpread', type: 'active', shape: 'square', col: 1, row: 0, maxRank: 1, desc: 'Fire a 5-pellet conical blast of heated industrial rivets.' }),
      node({ id: 'rook:base:kickback', name: 'Kickback', icon: 'kickback', type: 'active', shape: 'square', col: 3, row: 0, maxRank: 1, desc: 'Discharge an explosive concussive blast, vaulting backward away from danger.' }),
      node({ id: 'rook:base:rapid-fire', name: 'Rapid Fire', icon: 'rapidFire', type: 'active', shape: 'square', col: 5, row: 0, maxRank: 1, desc: 'Unload three rapid-fire piercing shells in rapid succession.' }),

      node({ id: 'rook:class:rifling', name: 'Precision Rifling', icon: 'railSlug', type: 'passive', col: 1, row: 1, maxRank: 2, parents: ['rook:base:rivet-spread'], desc: '+7 Attack Power and +15% projectile velocity per rank.', stats: { atk: 7 } }),
      node({ id: 'rook:class:powder-keg', name: 'Volatile Powder', icon: 'grenade', type: 'passive', col: 3, row: 1, maxRank: 2, parents: ['rook:base:kickback'], desc: '+15% blast radius and +10% explosive damage per rank.', stats: { atk: 5, critChance: 0.03 } }),
      node({ id: 'rook:class:quickdraw', name: 'Hair Trigger', icon: 'rapidFire', type: 'passive', col: 5, row: 1, maxRank: 2, parents: ['rook:base:rapid-fire'], desc: '-10% attack windup and +10 Max Stamina per rank.', stats: { stamina: 10, speed: 6 } }),

      node({ id: 'rook:class:ballistics', name: 'Ballistics Focus', icon: 'railSlug', type: 'passive', col: 0, row: 2, maxRank: 2, parents: ['rook:class:rifling'], desc: '+5% Critical Strike Chance per rank.', stats: { critChance: 0.05 } }),
      node({
        id: 'rook:class:choice-recoil',
        name: 'Recoil Control',
        icon: 'kickback',
        type: 'choice',
        col: 2,
        row: 2,
        maxRank: 1,
        parents: ['rook:class:rifling', 'rook:class:powder-keg'],
        desc: 'Choose bolt recoil tuning:',
        forks: [
          { title: 'Impact Compensator', desc: 'Kickback pushes enemies 80px further and stuns for 0.6s.', tag: 'STUN' },
          { title: 'Free Runner', desc: 'Kickback refunds its stamina cost if fired while airborne or moving.', tag: 'STAMINA' },
        ],
      }),
      node({ id: 'rook:class:tactical-roll', name: 'Combat Slide', icon: 'runningShoes', type: 'passive', col: 4, row: 2, maxRank: 2, parents: ['rook:class:powder-keg', 'rook:class:quickdraw'], desc: '+8 Movement Speed and dodge cooldown reduced by 0.2s.', stats: { speed: 8 } }),
      node({ id: 'rook:class:shrapnel', name: 'Piercing Lead', icon: 'rivetSpread', type: 'passive', col: 6, row: 2, maxRank: 2, parents: ['rook:class:quickdraw'], desc: 'Projectiles pierce 1 additional enemy per rank.', stats: { atk: 6 } }),

      node({ id: 'rook:class:spotter', name: 'Thermal Scope', icon: 'weldingGoggles', type: 'passive', col: 2, row: 3, maxRank: 2, parents: ['rook:class:choice-recoil', 'rook:class:tactical-roll'], desc: 'Hitting distant targets deals up to +35% bonus damage.', stats: { atk: 8 } }),
      node({
        id: 'rook:class:choice-ammo',
        name: 'Munitions Doctrine',
        icon: 'railSlug',
        type: 'choice',
        col: 4,
        row: 3,
        maxRank: 1,
        parents: ['rook:class:tactical-roll', 'rook:class:shrapnel'],
        desc: 'Choose ammunition specialization:',
        forks: [
          { title: 'Incendiary Rounds', desc: 'Attacks ignite targets, burning them for 40% ATK over 4s.', tag: 'BURN' },
          { title: 'Depleted Tungsten', desc: 'Attacks bypass 50% of enemy armor and deal +25% stagger.', tag: 'PIERCE' },
        ],
      }),

      node({ id: 'rook:class:kill-zone', name: 'Kill Zone', icon: 'rapidFire', type: 'passive', col: 1, row: 4, maxRank: 2, parents: ['rook:class:spotter'], desc: 'Consecutive hits against the same target increase damage by +5% (stacks to 5).', stats: { atk: 8 } }),
      node({ id: 'rook:class:suppression', name: 'Suppression Barrage', icon: 'grenade', type: 'passive', col: 5, row: 4, maxRank: 2, parents: ['rook:class:choice-ammo'], desc: 'Critical hits slow target movement by 40% for 2s.', stats: { critChance: 0.04 } }),

      node({ id: 'rook:class:capstone-left', name: 'Dead Eye', icon: 'railSlug', type: 'active', shape: 'square', col: 1, row: 5, maxRank: 1, parents: ['rook:class:kill-zone'], desc: 'Standing still for 1s grants guaranteed critical hit and +60% range on next shot.', stats: { atk: 15 } }),
      node({ id: 'rook:class:capstone-right', name: 'Overcharge Battery', icon: 'rapidFire', type: 'active', shape: 'square', col: 5, row: 5, maxRank: 1, parents: ['rook:class:suppression'], desc: 'Every 8th shot triggers an explosive secondary cluster detonation.', stats: { atk: 12, critChance: 0.05 } }),
    ],
  },

  ines: {
    id: 'ines',
    name: 'Magnetic Flux Core',
    subtitle: 'Ines Calloway · Class Talents',
    accent: '#4FD6A0',
    nodes: [
      node({ id: 'ines:base:pull', name: 'Pull', icon: 'pull', type: 'active', shape: 'square', col: 1, row: 0, maxRank: 1, desc: 'Direct magnetic flux to drag environmental scrap and lesser enemies toward Ines.' }),
      node({ id: 'ines:base:spin-up', name: 'Spin Up', icon: 'spinUp', type: 'active', shape: 'square', col: 3, row: 0, maxRank: 1, desc: 'Accelerate orbiting scrap metal into a whirling defensive perimeter blade.' }),
      node({ id: 'ines:base:lump', name: 'Lump', icon: 'lump', type: 'active', shape: 'square', col: 5, row: 0, maxRank: 1, desc: 'Compress surrounding debris into a dense molten slag block and hurl it.' }),

      node({ id: 'ines:class:magnetic-pull', name: 'Attraction Field', icon: 'pull', type: 'passive', col: 1, row: 1, maxRank: 2, parents: ['ines:base:pull'], desc: 'Increases scrap attraction radius by +40px and Attack by +6.', stats: { atk: 6 } }),
      node({ id: 'ines:class:dense-slag', name: 'Dense Slag', icon: 'lump', type: 'passive', col: 3, row: 1, maxRank: 2, parents: ['ines:base:spin-up'], desc: '+25 Max HP and +3 Armor per rank.', stats: { hp: 25, def: 3 } }),
      node({ id: 'ines:class:overclock-rotors', name: 'Kinetic Orbit', icon: 'spinUp', type: 'passive', col: 5, row: 1, maxRank: 2, parents: ['ines:base:lump'], desc: 'Orbiting scrap spins 20% faster and deals +15% collision damage.', stats: { atk: 6 } }),

      node({
        id: 'ines:class:choice-polarity',
        name: 'Polarity Matrix',
        icon: 'pull',
        type: 'choice',
        col: 2,
        row: 2,
        maxRank: 1,
        parents: ['ines:class:magnetic-pull', 'ines:class:dense-slag'],
        desc: 'Choose magnetic polarity behavior:',
        forks: [
          { title: 'Vortex Inversion', desc: 'Pull can be recast to emit an outward repelling magnetic shockwave.', tag: 'REPULSE' },
          { title: 'Singularity Hold', desc: 'Pull roots all affected enemies for 1.2s upon reaching center.', tag: 'ROOT' },
        ],
      }),
      node({ id: 'ines:class:reflux', name: 'Reflux Generator', icon: 'sugarTin', type: 'passive', col: 4, row: 2, maxRank: 2, parents: ['ines:class:dense-slag', 'ines:class:overclock-rotors'], desc: '+15 Max Stamina and +3/s Stamina Recovery.', stats: { stamina: 15, stamRegen: 3 } }),

      node({ id: 'ines:class:shrapnel-bloom', name: 'Shrapnel Bloom', icon: 'lump', type: 'passive', col: 2, row: 3, maxRank: 2, parents: ['ines:class:choice-polarity'], desc: 'Hurling lump releases 4 piercing scrap shards on impact.', stats: { atk: 8 } }),
      node({ id: 'ines:class:scrap-shield', name: 'Magnetic Aegis', icon: 'patchedVest', type: 'passive', col: 4, row: 3, maxRank: 2, parents: ['ines:class:reflux'], desc: 'Orbiting pieces block incoming projectiles and absorb 10 damage each.', stats: { def: 4, hp: 30 } }),

      node({ id: 'ines:class:capstone-left', name: 'Colossus Magnet', icon: 'scrapfall', type: 'active', shape: 'square', col: 2, row: 4, maxRank: 1, parents: ['ines:class:shrapnel-bloom'], desc: 'Scrapfall radius doubled and creates a permanent gravitational pull field for 6s.', stats: { atk: 15 } }),
      node({ id: 'ines:class:capstone-right', name: 'Induction Surge', icon: 'spinUp', type: 'active', shape: 'square', col: 4, row: 4, maxRank: 1, parents: ['ines:class:scrap-shield'], desc: 'Spin Up periodically discharges chain lightning to 3 nearby foes.', stats: { atk: 12, critChance: 0.05 } }),
    ],
  },

  kaelen: {
    id: 'kaelen',
    name: 'Pyro-Kinetic Core',
    subtitle: 'Kaelen Vance · Class Talents',
    accent: '#FF6262',
    nodes: [
      node({ id: 'kaelen:base:naphtha-jet', name: 'Naphtha Jet', icon: 'flame', type: 'active', shape: 'square', col: 2, row: 0, maxRank: 1, desc: 'Unleash a continuous stream of pressurized liquid flame.' }),
      node({ id: 'kaelen:base:fire-whirl', name: 'Combustion Slam', icon: 'explosion', type: 'active', shape: 'square', col: 4, row: 0, maxRank: 1, desc: 'Ignite fuel canister into an explosive point-blank conflagration.' }),
      node({ id: 'kaelen:class:boiler-plate', name: 'Boiler Plate', icon: 'patchedVest', type: 'passive', col: 2, row: 1, maxRank: 2, parents: ['kaelen:base:naphtha-jet'], desc: '+4 Armor and +30 HP per rank.', stats: { def: 4, hp: 30 } }),
      node({ id: 'kaelen:class:white-heat', name: 'White Heat', icon: 'flame', type: 'passive', col: 4, row: 1, maxRank: 2, parents: ['kaelen:base:fire-whirl'], desc: 'Burn effects deal +30% damage and ignore enemy fire resistance.', stats: { atk: 8 } }),
      node({
        id: 'kaelen:class:choice-fuel',
        name: 'Fuel Mixture',
        icon: 'stimStick',
        type: 'choice',
        col: 3,
        row: 2,
        maxRank: 1,
        parents: ['kaelen:class:boiler-plate', 'kaelen:class:white-heat'],
        desc: 'Choose chemical fuel composition:',
        forks: [
          { title: 'Sticky Napalm', desc: 'Flames coat the ground, creating burning fire puddles that linger for 5s.', tag: 'GROUND' },
          { title: 'Flash Pyrolysis', desc: 'Initial blast deals +60% instant burst damage with high knockback.', tag: 'BURST' },
        ],
      }),
      node({ id: 'kaelen:class:capstone', name: 'Hellfire Overdrive', icon: 'explosion', type: 'active', shape: 'square', col: 3, row: 3, maxRank: 1, parents: ['kaelen:class:choice-fuel'], desc: 'Overheating no longer stalls; instead releases a colossal shockwave wave.', stats: { atk: 18 } }),
    ],
  },

  vespera: {
    id: 'vespera',
    name: 'Artificer Core',
    subtitle: 'Vespera Locke · Class Talents',
    accent: '#A655F7',
    nodes: [
      node({ id: 'vespera:base:tesla-pylon', name: 'Tesla Pylon', icon: 'lightning', type: 'active', shape: 'square', col: 2, row: 0, maxRank: 1, desc: 'Deploy an automated galvanic pylon that zaps nearby enemies.' }),
      node({ id: 'vespera:base:seeker-swarm', name: 'Seeker Swarm', icon: 'drone', type: 'active', shape: 'square', col: 4, row: 0, maxRank: 1, desc: 'Release four homing micro-drones that seek out vulnerable enemies.' }),
      node({ id: 'vespera:class:copper-coils', name: 'Conductive Coils', icon: 'lightning', type: 'passive', col: 2, row: 1, maxRank: 2, parents: ['vespera:base:tesla-pylon'], desc: '+5% Critical Chance and +6 Attack Power per rank.', stats: { critChance: 0.05, atk: 6 } }),
      node({ id: 'vespera:class:overclock', name: 'Nanite Battery', icon: 'sugarTin', type: 'passive', col: 4, row: 1, maxRank: 2, parents: ['vespera:base:seeker-swarm'], desc: '+15 Max Stamina and drone lifespan increased by 3s.', stats: { stamina: 15 } }),
      node({
        id: 'vespera:class:choice-protocol',
        name: 'Deployment Protocol',
        icon: 'drone',
        type: 'choice',
        col: 3,
        row: 2,
        maxRank: 1,
        parents: ['vespera:class:copper-coils', 'vespera:class:overclock'],
        desc: 'Choose automaton directive:',
        forks: [
          { title: 'EMP Discharge', desc: 'Drones detonate in an EMP blast that stuns hostiles for 1s.', tag: 'STUN' },
          { title: 'Recharge Siphon', desc: 'Drone damage returns 8% of damage dealt as health and stamina.', tag: 'LEECH' },
        ],
      }),
      node({ id: 'vespera:class:capstone', name: 'Orbital Singularity', icon: 'lightning', type: 'active', shape: 'square', col: 3, row: 3, maxRank: 1, parents: ['vespera:class:choice-protocol'], desc: 'Call down an automated orbital laser strike sweeping across the sector.', stats: { atk: 20 } }),
    ],
  },
};

// ============================================================================
// 2. SPECIALIZATION TALENT TREES (RIGHT SIDE)
// ============================================================================

export function buildSpecTree(specKey) {
  const spec = SPECIALIZATIONS[specKey];
  if (!spec) return null;

  const sk = spec.skills || [];
  const s0 = sk[0];
  const s1 = sk[1];
  const s2 = sk[2];
  const s3 = sk[3];
  const sUlt = sk[4];

  return {
    id: spec.id,
    name: spec.name,
    char: spec.char || 'sena',
    concept: spec.concept || '',
    trait: spec.trait || null,
    nodes: [
      // ROW 0: Spec Starter Active (Square)
      node({
        id: s0 ? s0.id : `${spec.id}:skill0`,
        name: s0 ? s0.name : 'Primary Art',
        icon: 'lunge',
        type: 'active',
        shape: 'square',
        col: 3,
        row: 0,
        maxRank: 1,
        desc: s0?.desc || 'Primary combat skill of this specialization.',
        tuning: s0?.tuning,
        skillRef: s0?.id,
      }),

      // ROW 1: Tier 1 Passives & Choice Fork for Skill 1
      node({
        id: `${spec.id}:t1-pass-l`,
        name: `${spec.name} Adept`,
        icon: 'railcutSword',
        type: 'passive',
        col: 1,
        row: 1,
        maxRank: 2,
        parents: [s0 ? s0.id : `${spec.id}:skill0`],
        desc: `Increases Attack Power by +6 and specialization skill damage by +10% per rank.`,
        nextDesc: `Increases Attack Power by +12 and specialization skill damage by +20%.`,
        stats: { atk: 6 },
      }),
      node({
        id: `${spec.id}:${s0?.name || 'skill0'}:fork`,
        name: `${s0?.name || 'Skill 1'} Mutation`,
        icon: 'railSpike',
        type: 'choice',
        col: 3,
        row: 1,
        maxRank: 1,
        parents: [s0 ? s0.id : `${spec.id}:skill0`],
        desc: `Choose variant fork for ${s0?.name}:`,
        forks: [
          { title: s0?.fork?.[0]?.split(/[\s(]/)[0] || 'Variant A', desc: s0?.fork?.[0] || 'Enhanced variant A', tag: 'A' },
          { title: s0?.fork?.[1]?.split(/[\s(]/)[0] || 'Variant B', desc: s0?.fork?.[1] || 'Enhanced variant B', tag: 'B' },
        ],
      }),
      node({
        id: `${spec.id}:t1-pass-r`,
        name: `${spec.name} Flow`,
        icon: 'sugarTin',
        type: 'passive',
        col: 5,
        row: 1,
        maxRank: 2,
        parents: [s0 ? s0.id : `${spec.id}:skill0`],
        desc: `Increases Stamina Recovery by +3/s and reduces specialization cooldowns by 5%.`,
        nextDesc: `Increases Stamina Recovery by +6/s and reduces specialization cooldowns by 10%.`,
        stats: { stamina: 10, stamRegen: 3 },
      }),

      // ROW 2: Second Active Ability (Square) & Synergies
      node({
        id: s1 ? s1.id : `${spec.id}:skill1`,
        name: s1 ? s1.name : 'Secondary Art',
        icon: 'groundBreak',
        type: 'active',
        shape: 'square',
        col: 2,
        row: 2,
        maxRank: 1,
        parents: [`${spec.id}:t1-pass-l`, `${spec.id}:${s0?.name || 'skill0'}:fork`],
        desc: s1?.desc || 'Secondary tactical technique.',
        tuning: s1?.tuning,
        skillRef: s1?.id,
      }),
      node({
        id: `${spec.id}:${s1?.name || 'skill1'}:fork`,
        name: `${s1?.name || 'Skill 2'} Mutation`,
        icon: 'groundBreak',
        type: 'choice',
        col: 4,
        row: 2,
        maxRank: 1,
        parents: [`${spec.id}:${s0?.name || 'skill0'}:fork`, `${spec.id}:t1-pass-r`],
        desc: `Choose variant fork for ${s1?.name}:`,
        forks: [
          { title: s1?.fork?.[0]?.split(/[\s(]/)[0] || 'Variant A', desc: s1?.fork?.[0] || 'Enhanced variant A', tag: 'A' },
          { title: s1?.fork?.[1]?.split(/[\s(]/)[0] || 'Variant B', desc: s1?.fork?.[1] || 'Enhanced variant B', tag: 'B' },
        ],
      }),

      // ROW 3: Mid-Tier Mastery & Trait Synergy
      node({
        id: `${spec.id}:trait-amp`,
        name: `${spec.trait?.name || 'Specialization'} Amplification`,
        icon: 'weldingGoggles',
        type: 'passive',
        col: 1,
        row: 3,
        maxRank: 2,
        parents: [s1 ? s1.id : `${spec.id}:skill1`],
        desc: `Amplifies ${spec.trait?.name || 'class trait'} effectiveness by +20% per rank.`,
        nextDesc: `Amplifies class trait effectiveness by +40%.`,
        stats: { atk: 7 },
      }),
      node({
        id: s2 ? s2.id : `${spec.id}:skill2`,
        name: s2 ? s2.name : 'Tertiary Art',
        icon: 'sevenCuts',
        type: 'active',
        shape: 'square',
        col: 3,
        row: 3,
        maxRank: 1,
        parents: [s1 ? s1.id : `${spec.id}:skill1`, `${spec.id}:${s1?.name || 'skill1'}:fork`],
        desc: s2?.desc || 'Advanced specialization ability.',
        tuning: s2?.tuning,
        skillRef: s2?.id,
      }),
      node({
        id: `${spec.id}:crit-surge`,
        name: 'Precision Overload',
        icon: 'railSpike',
        type: 'passive',
        col: 5,
        row: 3,
        maxRank: 2,
        parents: [`${spec.id}:${s1?.name || 'skill1'}:fork`],
        desc: `Critical strike chance increased by +5% and critical damage by +15%.`,
        nextDesc: `Critical strike chance increased by +10% and critical damage by +30%.`,
        stats: { critChance: 0.05 },
      }),

      // ROW 4: Third & Fourth Skill Choice Mutations
      node({
        id: `${spec.id}:${s2?.name || 'skill2'}:fork`,
        name: `${s2?.name || 'Skill 3'} Mutation`,
        icon: 'sevenCuts',
        type: 'choice',
        col: 2,
        row: 4,
        maxRank: 1,
        parents: [`${spec.id}:trait-amp`, s2 ? s2.id : `${spec.id}:skill2`],
        desc: `Choose variant fork for ${s2?.name}:`,
        forks: [
          { title: s2?.fork?.[0]?.split(/[\s(]/)[0] || 'Variant A', desc: s2?.fork?.[0] || 'Enhanced variant A', tag: 'A' },
          { title: s2?.fork?.[1]?.split(/[\s(]/)[0] || 'Variant B', desc: s2?.fork?.[1] || 'Enhanced variant B', tag: 'B' },
        ],
      }),
      node({
        id: s3 ? s3.id : `${spec.id}:skill3`,
        name: s3 ? s3.name : 'Master Technique',
        icon: 'runningShoes',
        type: 'active',
        shape: 'square',
        col: 4,
        row: 4,
        maxRank: 1,
        parents: [s2 ? s2.id : `${spec.id}:skill2`, `${spec.id}:crit-surge`],
        desc: s3?.desc || 'Apex specialization maneuver.',
        tuning: s3?.tuning,
        skillRef: s3?.id,
      }),

      // ROW 5: Choice Node for Skill 4 & Pre-Capstone Passives
      node({
        id: `${spec.id}:apex-synergy`,
        name: 'Resonating Impact',
        icon: 'anvil',
        type: 'passive',
        col: 1,
        row: 5,
        maxRank: 2,
        parents: [`${spec.id}:${s2?.name || 'skill2'}:fork`],
        desc: 'Specialization skill hits reduce enemy defense by 15% for 4s.',
        nextDesc: 'Specialization skill hits reduce enemy defense by 30% for 4s.',
        stats: { atk: 8 },
      }),
      node({
        id: `${spec.id}:${s3?.name || 'skill3'}:fork`,
        name: `${s3?.name || 'Skill 4'} Mutation`,
        icon: 'runningShoes',
        type: 'choice',
        col: 3,
        row: 5,
        maxRank: 1,
        parents: [`${spec.id}:${s2?.name || 'skill2'}:fork`, s3 ? s3.id : `${spec.id}:skill3`],
        desc: `Choose variant fork for ${s3?.name}:`,
        forks: [
          { title: s3?.fork?.[0]?.split(/[\s(]/)[0] || 'Variant A', desc: s3?.fork?.[0] || 'Enhanced variant A', tag: 'A' },
          { title: s3?.fork?.[1]?.split(/[\s(]/)[0] || 'Variant B', desc: s3?.fork?.[1] || 'Enhanced variant B', tag: 'B' },
        ],
      }),
      node({
        id: `${spec.id}:speed-surge`,
        name: 'Velocity Conduit',
        icon: 'runningShoes',
        type: 'passive',
        col: 5,
        row: 5,
        maxRank: 2,
        parents: [s3 ? s3.id : `${spec.id}:skill3`],
        desc: 'After executing any skill, gain +20% movement speed for 3s.',
        nextDesc: 'After executing any skill, gain +40% movement speed for 3s.',
        stats: { speed: 10 },
      }),

      // ROW 6: Awakening Ultimate Capstone & Choice (Octagon / Square)
      node({
        id: sUlt ? sUlt.id : `${spec.id}:ultimate`,
        name: sUlt ? sUlt.name : 'Awakening Ultimate',
        icon: 'sevenCuts',
        type: 'active',
        shape: 'square',
        col: 2,
        row: 6,
        maxRank: 1,
        parents: [`${spec.id}:apex-synergy`, `${spec.id}:${s3?.name || 'skill3'}:fork`],
        desc: sUlt?.desc || 'Cataclysmic awakening ultimate skill.',
        tuning: sUlt?.tuning,
        skillRef: sUlt?.id,
      }),
      node({
        id: `${spec.id}:${sUlt?.name || 'ultimate'}:fork`,
        name: `${sUlt?.name || 'Awakening'} Mutation`,
        icon: 'sevenCuts',
        type: 'choice',
        col: 4,
        row: 6,
        maxRank: 1,
        parents: [`${spec.id}:${s3?.name || 'skill3'}:fork`, `${spec.id}:speed-surge`],
        desc: `Choose awakening ultimate focus:`,
        forks: [
          { title: sUlt?.fork?.[0]?.split(/[\s(]/)[0] || 'Extended Field', desc: sUlt?.fork?.[0] || 'Wider area damage & coverage', tag: 'FIELD' },
          { title: sUlt?.fork?.[1]?.split(/[\s(]/)[0] || 'Epicenter Burst', desc: sUlt?.fork?.[1] || 'Concentrated single-target annihilation', tag: 'BURST' },
        ],
      }),
    ],
  };
}

// Cache of built spec trees
const SPEC_TREE_CACHE = {};
export function getSpecTree(specKey) {
  if (!SPEC_TREE_CACHE[specKey]) {
    SPEC_TREE_CACHE[specKey] = buildSpecTree(specKey);
  }
  return SPEC_TREE_CACHE[specKey];
}
