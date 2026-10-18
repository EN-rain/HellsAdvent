/**
 * GRAVEL SKY — Status Effects & Buffs Data Registry
 * Defines all 28 status effects and buffs used across classes, enemies, bosses, items, and world hazards.
 * One generic StatusSystem (/src/game/Status.js) runs them all.
 */

import { PALETTE } from './config.js';

export const STATUSES = {
  // =========================================================================
  // DEBUFFS (can hit both the player and enemies)
  // =========================================================================
  bleed: {
    id: 'bleed',
    name: 'Bleed',
    kind: 'debuff',
    color: PALETTE.blood,
    defaultDuration: 4.0,
    stacking: 'independent', // each application keeps its own timer, up to max
    maxStacks: 3,
    tickInterval: 0.1, // ticks at 10Hz internally, shows number once per second
    dotAttackRatio: 0.15, // 15% of source attack per second, ignores DEF
    cleansable: true,
    cleanseBy: ['gauzeRoll', 'campfire'],
    priority: 5,
    icon: 'bleed',
    tags: ['dot', 'bleed'],
    getTooltip(inst) {
      const stacks = inst.stacks || 1;
      const dps = Math.max(1, Math.round((inst.sourceAtk || 10) * 0.15 * stacks));
      return `Takes ${dps} damage per second (15% of source ATK per stack). Ignores DEF.`;
    },
  },

  burn: {
    id: 'burn',
    name: 'Burn',
    kind: 'debuff',
    color: PALETTE.rustLight,
    defaultDuration: 3.0,
    stacking: 'refresh',
    maxStacks: 1,
    tickInterval: 0.1,
    dotAttackRatio: 0.20, // 20% of source attack per second, ignores DEF
    cleansable: true,
    cleanseBy: ['lyeWash', 'campfire'],
    dodgeHalvesDuration: true, // A dodge roll cuts the remaining Burn time in half
    priority: 6,
    icon: 'burn',
    tags: ['dot', 'burn'],
    getTooltip(inst) {
      const dps = Math.max(1, Math.round((inst.sourceAtk || 10) * 0.20));
      return `Takes ${dps} damage per second (20% of source ATK). Dodge roll halves remaining time.`;
    },
  },

  corrode: {
    id: 'corrode',
    name: 'Corrode',
    kind: 'debuff',
    color: PALETTE.lye,
    defaultDuration: 8.0,
    stacking: 'stack', // adds a stack up to max, every stack's timer refreshes
    maxStacks: 4,
    statModifiers: {
      defPctPerStack: -0.15, // -15% DEF per stack
    },
    cleansable: true,
    cleanseBy: ['lyeWash', 'campfire'],
    priority: 7,
    icon: 'corrode',
    tags: ['corrode', 'armorBreak'],
    getTooltip(inst) {
      const pct = (inst.stacks || 1) * 15;
      return `DEF lowered by ${pct}% (-15% per stack, max 4).`;
    },
  },

  exposed: {
    id: 'exposed',
    name: 'Exposed',
    kind: 'debuff',
    color: PALETTE.bone,
    defaultDuration: 6.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      defMult: 0.80, // -20% DEF, stacks multiplicatively with Corrode
    },
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 7,
    icon: 'exposed',
    tags: ['armorBreak'],
    getTooltip() {
      return 'DEF lowered by 20%. Stacks multiplicatively with Corrode.';
    },
  },

  slow: {
    id: 'slow',
    name: 'Slow',
    kind: 'debuff',
    color: PALETTE.boneDark,
    defaultDuration: 2.0,
    stacking: 'strongest', // only the strongest value counts and the longer duration is kept
    maxStacks: 1,
    statModifiers: {
      moveSpeedPctFromValue: true, // uses -inst.value (default 0.30 -> -30% move speed)
    },
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 8,
    icon: 'slow',
    tags: ['slow', 'cc'],
    getTooltip(inst) {
      const pct = Math.round((inst.value || 0.30) * 100);
      return `Move speed lowered by ${pct}%.`;
    },
  },

  stun: {
    id: 'stun',
    name: 'Stun',
    kind: 'debuff',
    color: PALETTE.signal,
    defaultDuration: 1.0,
    stacking: 'refresh',
    maxStacks: 1,
    flags: {
      cantMove: true,
      cantAct: true,
      cantAttack: true,
      hardCC: true,
    },
    cleansable: false, // Never cleansable
    priority: 1,
    icon: 'stun',
    tags: ['hardCC', 'stun'],
    getTooltip() {
      return 'Cannot move or act.';
    },
  },

  pinned: {
    id: 'pinned',
    name: 'Pinned',
    kind: 'debuff',
    color: '#9BA39C',
    defaultDuration: 1.0,
    stacking: 'refresh',
    maxStacks: 1,
    flags: {
      cantMove: true,
    },
    cleansable: false, // Never cleansable
    priority: 2,
    icon: 'pinned',
    tags: ['cc', 'pin'],
    getTooltip() {
      return 'Pinned in place. Cannot move, but can still attack and cast.';
    },
  },

  lifted: {
    id: 'lifted',
    name: 'Lifted',
    kind: 'debuff',
    color: PALETTE.verdigris,
    defaultDuration: 1.5,
    stacking: 'refresh',
    maxStacks: 1,
    flags: {
      cantMove: true,
      cantAct: true,
      cantAttack: true,
      hardCC: true,
      lifted: true,
    },
    cleansable: false, // Never cleansable
    priority: 3,
    icon: 'lifted',
    tags: ['hardCC', 'lifted'],
    getTooltip(inst) {
      return inst.dropBonusDamage
        ? 'Suspended 12px off the ground. Cannot act. Takes 100% bonus damage when dropped.'
        : 'Suspended 12px off the ground. Cannot act.';
    },
  },

  marked: {
    id: 'marked',
    name: 'Marked',
    kind: 'debuff',
    color: PALETTE.brass,
    defaultDuration: 5.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      damageTakenBonus: 0.20, // takes +20% damage from all sources
    },
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 4,
    icon: 'marked',
    tags: ['vulnerability'],
    getTooltip() {
      return 'Takes 20% more damage from everything.';
    },
  },

  choked: {
    id: 'choked',
    name: 'Choked',
    kind: 'debuff',
    color: PALETTE.dustBrown,
    defaultDuration: 6.0,
    stacking: 'refresh',
    maxStacks: 1,
    playerOnly: true,
    statModifiers: {
      staminaRegenMult: 0.50, // -50% Stamina regen
      lightRadiusMult: 0.65, // -35% light radius
    },
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 9,
    icon: 'choked',
    tags: ['blind', 'stamina'],
    getTooltip() {
      return 'Stamina regen lowered by 50% and vision radius lowered by 35%.';
    },
  },

  drawnIn: {
    id: 'drawnIn',
    name: 'Drawn In',
    kind: 'debuff',
    color: PALETTE.signal,
    defaultDuration: 6.0,
    stacking: 'refresh',
    maxStacks: 1,
    flags: {
      taunted: true,
    },
    cleansable: false,
    priority: 10,
    icon: 'drawnIn',
    tags: ['taunt'],
    getTooltip() {
      return 'Forced to path toward the taunting target.';
    },
  },

  crash: {
    id: 'crash',
    name: 'Crash',
    kind: 'debuff',
    color: PALETTE.slagLight,
    defaultDuration: 10.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      moveSpeedPct: -0.15, // -15% move speed for 10s after Haste ends
    },
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 11,
    icon: 'crash',
    tags: ['slow'],
    getTooltip() {
      return 'Move speed lowered by 15% after Stim Stick wears off.';
    },
  },

  // =========================================================================
  // BUFFS
  // =========================================================================
  momentum: {
    id: 'momentum',
    name: 'Momentum',
    kind: 'buff',
    color: PALETTE.signal,
    defaultDuration: 3.0,
    stacking: 'stack',
    maxStacks: 8, // 5 base, 8 as Cutter
    cleansable: false,
    icon: 'momentum',
    tags: ['classMechanic'],
    getTooltip(inst) {
      const stacks = inst.stacks || 1;
      const mode = inst.branchMode || 'base';
      if (mode === 'anvil') {
        return `${stacks} stacks: +${stacks * 3}% DEF and +${stacks * 4} move speed.`;
      }
      const atkPer = mode === 'cutter' ? 5 : 4;
      return `${stacks} stacks: +${stacks * atkPer}% ATK and +${stacks * 4} move speed.`;
    },
  },

  cleanMag: {
    id: 'cleanMag',
    name: 'Clean Mag',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 30.0, // lasts until current magazine is empty
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      atkBonusPct: 0.25, // +25% damage until current magazine is empty
    },
    cleansable: false,
    icon: 'cleanMag',
    tags: ['classMechanic'],
    getTooltip() {
      return '+25% damage until the current magazine is empty.';
    },
  },

  settled: {
    id: 'settled',
    name: 'Settled',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 10.0,
    stacking: 'consume', // removed when next shot is fired
    maxStacks: 1,
    statModifiers: {
      atkBonusPct: 0.80, // next shot +80% damage and +1 pierce
      extraPierce: 1,
    },
    cleansable: false,
    icon: 'settled',
    tags: ['classMechanic'],
    getTooltip() {
      return 'Next shot deals +80% damage and has +1 pierce.';
    },
  },

  rapidFire: {
    id: 'rapidFire',
    name: 'Rapid Fire',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 4.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      attackSpeedMult: 2.0, // +100% attack speed
    },
    cleansable: false,
    icon: 'rapidFire',
    tags: ['classMechanic', 'buff'],
    getTooltip(inst) {
      const dur = inst.duration ? inst.duration.toFixed(1) : '4.0';
      return `Rapid Fire active (${dur}s): +100% Attack Speed. Basic shots consume no ammo.`;
    },
  },

  parrying: {
    id: 'parrying',
    name: 'Parrying',
    kind: 'buff',
    color: PALETTE.signal,
    defaultDuration: 0.6,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {},
    cleansable: false,
    icon: 'railParry',
    tags: ['classMechanic', 'buff'],
    getTooltip() {
      return 'Primed parry stance: Negates 100% of the next hit and triggers an instant Riposte.';
    },
  },

  guarding: {
    id: 'guarding',
    name: 'Guarding',
    kind: 'buff',
    color: PALETTE.signal,
    defaultDuration: 0.25,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      frontalDamageReduction: 0.60, // 60% frontal block while right click is held
    },
    cleansable: false,
    icon: 'guarding',
    tags: ['block'],
    getTooltip() {
      return 'Blocking 60% of frontal damage. First 0.2s reflects 100% ATK.';
    },
  },

  dugIn: {
    id: 'dugIn',
    name: 'Dug In',
    kind: 'buff',
    color: PALETTE.signal,
    defaultDuration: 6.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      damageReduction: 0.60, // 60% damage reduction for 6s + taunt aura
    },
    cleansable: false,
    icon: 'dugIn',
    tags: ['stance'],
    getTooltip() {
      return 'Takes 60% less damage, draws enemies within 300px, and returns 80% ATK on hit.';
    },
  },

  heavyLanding: {
    id: 'heavyLanding',
    name: 'Heavy Landing',
    kind: 'buff',
    color: PALETTE.signal,
    defaultDuration: 3.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      damageReduction: 0.15, // 15% damage reduction for 3s after Ground Break
    },
    cleansable: false,
    icon: 'heavyLanding',
    tags: ['defense'],
    getTooltip() {
      return 'Takes 15% less damage after Ground Break.';
    },
  },

  spinning: {
    id: 'spinning',
    name: 'Spinning',
    kind: 'buff',
    color: PALETTE.verdigris,
    defaultDuration: 5.0,
    stacking: 'refresh',
    maxStacks: 1,
    cleansable: false,
    icon: 'spinning',
    tags: ['scrapRing'],
    getTooltip() {
      return 'Orbiting scrap ring damages nearby enemies and blocks projectiles.';
    },
  },

  secondSkin: {
    id: 'secondSkin',
    name: 'Second Skin',
    kind: 'buff',
    color: PALETTE.verdigris,
    defaultDuration: 7.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      damageReduction: 0.25, // 25% damage reduction while Spinning
    },
    cleansable: false,
    icon: 'secondSkin',
    tags: ['defense'],
    getTooltip() {
      return 'Takes 25% less damage while Spin Up is active.';
    },
  },

  overspun: {
    id: 'overspun',
    name: 'Overspun',
    kind: 'buff',
    color: PALETTE.verdigris,
    defaultDuration: 0.5,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      attackSpeedPct: 0.25, // +25% throw speed while at max scrap
    },
    cleansable: false,
    icon: 'overspun',
    tags: ['haste'],
    getTooltip() {
      return '+25% throw speed while at maximum Scrap Orbit.';
    },
  },

  redline: {
    id: 'redline',
    name: 'Redline',
    kind: 'buff',
    color: PALETTE.signal,
    defaultDuration: 0.5,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      moveSpeedPct: 0.10, // +10% move speed
      zeroStaminaCost: true, // attacks cost no Stamina
    },
    cleansable: false,
    icon: 'redline',
    tags: ['offense'],
    getTooltip() {
      return 'At max Momentum: attacks cost 0 Stamina and move speed is +10%.';
    },
  },

  untouchable: {
    id: 'untouchable',
    name: 'Untouchable',
    kind: 'buff',
    color: PALETTE.bone,
    defaultDuration: 0.25,
    stacking: 'refresh',
    maxStacks: 1,
    flags: {
      invulnerable: true,
    },
    cleansable: false,
    icon: 'untouchable',
    tags: ['invulnerable'],
    getTooltip() {
      return 'Invulnerable to all damage and effects.';
    },
  },

  haste: {
    id: 'haste',
    name: 'Haste',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 20.0,
    stacking: 'refresh',
    maxStacks: 1,
    persistOnSave: true,
    onExpireApply: 'crash', // Triggers Crash for 10s when Haste ends
    statModifiers: {
      moveSpeedPct: 0.20, // +20% move speed
      attackSpeedPct: 0.10, // +10% attack speed
    },
    cleansable: false,
    icon: 'haste',
    tags: ['consumable', 'haste'],
    getTooltip() {
      return '+20% move speed and +10% attack speed. Followed by Crash for 10s.';
    },
  },

  fed: {
    id: 'fed',
    name: 'Fed',
    kind: 'buff',
    color: PALETTE.rustLight,
    defaultDuration: 300.0, // 5 minutes
    stacking: 'refresh', // Does not stack with itself
    maxStacks: 1,
    persistOnSave: true,
    statModifiers: {
      maxHpPct: 0.10, // +10% max HP
      outOfCombatHpRegen: 1.0, // +1 HP per second out of combat
    },
    cleansable: false,
    icon: 'fed',
    tags: ['consumable', 'food'],
    getTooltip() {
      return '+10% max HP and +1 HP per second out of combat.';
    },
  },

  warmed: {
    id: 'warmed',
    name: 'Warmed',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 0.6, // Refreshed while within 80px of Kettle campfire
    noTimerDisplay: true,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      hpRegenMaxHpPct: 0.02, // 2% max HP per second
    },
    cleansable: false,
    icon: 'warmed',
    tags: ['campfire'],
    getTooltip() {
      return 'Restores 2% max HP per second and clears debuffs near the Kettle fire.';
    },
  },

  bounty: {
    id: 'bounty',
    name: 'Bounty',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 600.0, // 10 minutes
    stacking: 'refresh',
    maxStacks: 1,
    persistOnSave: true,
    statModifiers: {
      xpGainPct: 0.10, // +10% XP
      goldGainPct: 0.10, // +10% gold
    },
    cleansable: false,
    icon: 'bounty',
    tags: ['bounty'],
    getTooltip() {
      return '+10% XP and +10% gold after defeating a boss.';
    },
  },

  shakenOff: {
    id: 'shakenOff',
    name: 'Shaken Off',
    kind: 'buff',
    color: PALETTE.bone,
    defaultDuration: 2.0,
    stacking: 'refresh',
    maxStacks: 1,
    flags: {
      hardCCImmune: true,
    },
    cleansable: false,
    icon: 'shakenOff',
    tags: ['ccImmune'],
    getTooltip() {
      return 'Immune to Stun and Lifted for 2s.';
    },
  },

  weakened: {
    id: 'weakened',
    name: 'Weakened',
    kind: 'debuff',
    color: PALETTE.rust,
    defaultDuration: 4.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      atkBonusPct: -0.25,
    },
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 6,
    icon: 'weakened',
    tags: ['weakened'],
    getTooltip() {
      return 'Deals 25% less damage.';
    },
  },

  blind: {
    id: 'blind',
    name: 'Blind',
    kind: 'debuff',
    color: PALETTE.boneDark,
    defaultDuration: 3.0,
    stacking: 'refresh',
    maxStacks: 1,
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 5,
    icon: 'blind',
    tags: ['blind'],
    getTooltip() {
      return '50% chance for attacks to miss.';
    },
  },

  overloaded: {
    id: 'overloaded',
    name: 'Overloaded',
    kind: 'debuff',
    color: PALETTE.verdigris,
    defaultDuration: 5.0,
    stacking: 'refresh',
    maxStacks: 1,
    cleansable: true,
    cleanseBy: ['campfire'],
    priority: 4,
    icon: 'overloaded',
    tags: ['magnetic'],
    getTooltip() {
      return 'Magnetically charged: pulls nearby enemies when hit by scrap.';
    },
  },

  staggered: {
    id: 'staggered',
    name: 'Staggered',
    kind: 'debuff',
    color: PALETTE.brass,
    defaultDuration: 3.0,
    stacking: 'refresh',
    maxStacks: 1,
    flags: {
      cantMove: true,
      cantAct: true,
      cantAttack: true,
    },
    cleansable: false,
    priority: 1,
    icon: 'stun',
    tags: ['stagger'],
    getTooltip() {
      return 'Boss staggered: cannot act and takes +35% damage.';
    },
  },

  steadyAim: {
    id: 'steadyAim',
    name: 'Steady Aim',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 30.0,
    stacking: 'consume',
    maxStacks: 1,
    statModifiers: {
      atkBonusPct: 0.25,
    },
    cleansable: false,
    icon: 'steadyAim',
    tags: ['classMechanic'],
    getTooltip() {
      return 'Perfect reload: +25% bolt damage for this magazine.';
    },
  },

  holdBreath: {
    id: 'holdBreath',
    name: 'Hold Breath',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 10.0,
    stacking: 'consume',
    maxStacks: 1,
    statModifiers: {
      atkBonusPct: 0.80,
      extraPierce: 1,
    },
    cleansable: false,
    icon: 'holdBreath',
    tags: ['classMechanic'],
    getTooltip() {
      return 'Stood still 1.5s: next shot deals +80% damage and +1 pierce.';
    },
  },

  quickHands: {
    id: 'quickHands',
    name: 'Quick Hands',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 4.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      attackSpeedPct: 0.25,
    },
    cleansable: false,
    icon: 'quickHands',
    tags: ['haste'],
    getTooltip() {
      return '+25% attack and throw speed.';
    },
  },

  ironHide: {
    id: 'ironHide',
    name: 'Iron Hide',
    kind: 'buff',
    color: PALETTE.signal,
    defaultDuration: 3.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      damageReduction: 0.20,
    },
    cleansable: false,
    icon: 'ironHide',
    tags: ['defense'],
    getTooltip() {
      return 'Takes 20% less damage.';
    },
  },

  grounded: {
    id: 'grounded',
    name: 'Grounded',
    kind: 'buff',
    color: PALETTE.verdigris,
    defaultDuration: 4.0,
    stacking: 'refresh',
    maxStacks: 1,
    cleansable: false,
    icon: 'grounded',
    tags: ['stance'],
    getTooltip() {
      return 'Planted stance: immune to knockback and Pull/Push.';
    },
  },

  focus: {
    id: 'focus',
    name: 'Focus',
    kind: 'buff',
    color: PALETTE.brass,
    defaultDuration: 8.0,
    stacking: 'refresh',
    maxStacks: 1,
    statModifiers: {
      critChanceBonus: 0.20,
    },
    cleansable: false,
    icon: 'focus',
    tags: ['crit'],
    getTooltip() {
      return '+20% critical hit chance.';
    },
  },
};

// Map convenient ID aliases so any caller ID works seamlessly
STATUSES.choke = STATUSES.choked;
STATUSES.wellFed = STATUSES.fed;
STATUSES.warm = STATUSES.warmed;
STATUSES.scrapSkin = STATUSES.secondSkin;

for (const st of Object.values(STATUSES)) {
  st.isBuff = st.kind === 'buff';
  st.stackRule = st.stacking;
}

export const STATUS_ORDER = [
  'bleed',
  'burn',
  'corrode',
  'exposed',
  'weakened',
  'slow',
  'pinned',
  'stun',
  'lifted',
  'blind',
  'choked',
  'marked',
  'overloaded',
  'staggered',
  'momentum',
  'redline',
  'guarding',
  'steadyAim',
  'holdBreath',
  'quickHands',
  'ironHide',
  'secondSkin',
  'grounded',
  'fed',
  'haste',
  'focus',
  'warmed',
  'bounty',
];

export const STATUS_LIST = STATUS_ORDER.map((k) => STATUSES[k]).filter(Boolean);
export default STATUSES;
