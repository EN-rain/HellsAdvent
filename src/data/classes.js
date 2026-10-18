/**
 * GRAVEL SKY — Playable Classes, Skill Trees, Passives, & Promotion Branches
 * All stats, mechanic parameters, skills, passives, branches, and node effects live here.
 * Nothing is hard-coded in UI components.
 *
 * Skill Point Budget:
 * - 1 point per level from level 2 to 30 (29 points) + 3 bonus points per promotion (6 points) = 35 points total.
 * - Full single branch cost: Skills (4x3=12) + Passives (3x4=12) + Journeyman (2x3=6) + Master (3x3=9) = 39 points.
 * - Player is always 4 points short, forcing deliberate build trade-offs.
 */

import { PALETTE } from './config.js';

export const STAGE_NAMES = {
  1: 'Hand',
  2: 'Journeyman',
  3: 'Master',
};

export const CLASSES = {
  // =========================================================================
  // 1) SENA IBUKI — MELEE
  // =========================================================================
  sena: {
    id: 'sena',
    name: 'Sena Ibuki',
    role: 'Melee',
    accent: PALETTE.signal, // #00F0FF
    accentName: 'signal',
    pitch: 'Close-range rail cutter who builds speed and edge through unbroken pressure.',
    weaponName: 'Railcut',
    weaponDesc: 'A 22-inch length of train rail ground to a cyan edge.',
    titles: {
      hand: 'Runner',
      journeyman: {
        cutter: 'Cutter',
        anvil: 'Anvil',
      },
      master: {
        cutter: 'Flenser',
        anvil: 'Girder',
      },
    },
    baseStats: {
      hp: 120,
      stamina: 50,
      atk: 12,
      def: 6,
      speed: 130,
      critChance: 0.08,
      critMult: 1.5,
    },
    perLevel: {
      hp: 14,
      stamina: 3,
      atk: 2,
      def: 1,
    },
    basicAttack: {
      type: 'meleeCombo',
      reach: 40,
      hits: [
        { step: 1, mult: 1.0, duration: 0.22, range: 40, arc: 1.65, knockback: 80, stepForward: 32 },
        { step: 2, mult: 1.1, duration: 0.22, range: 40, arc: 1.85, knockback: 105, stepForward: 38 },
        { step: 3, mult: 1.5, duration: 0.30, range: 44, arc: 2.35, knockback: 165, stepForward: 50 },
      ],
    },
    mechanic: {
      id: 'momentum',
      name: 'Momentum',
      maxStacksBase: 5,
      maxStacksCutter: 8,
      atkPerStackBase: 0.04, // +4% ATK
      atkPerStackCutter: 0.05, // +5% ATK as Cutter
      defPerStackAnvil: 0.03, // +3% DEF as Anvil instead of ATK
      speedPerStack: 4, // +4 speed per stack
      dropDelay: 3.0, // drops after 3s without landing a hit
      stacksLostOnHit: 2, // taking damage removes 2 stacks
      desc: 'Every hit lands +1 Momentum stack (max 5). Each stack gives +4% ATK and +4 speed. Drops after 3s idle; taking damage removes 2 stacks.',
    },
    skills: [
      {
        id: 'lunge',
        slot: 1,
        hotkey: '1',
        name: 'Lunge',
        icon: 'lunge',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 1.60,
        damagePerLevel: 0.20,
        baseCooldown: 5.0,
        cooldownPerLevel: -0.4,
        staminaCost: 10,
        dashDistance: 160,
        desc: 'Dash 160px toward the cursor, cutting every enemy on the line.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(5, lvl));
          const hasQuickEdge = ownedNodes.includes('quickEdge');
          const cd = Math.max(1.0, +(this.baseCooldown + (l - 1) * this.cooldownPerLevel).toFixed(2));
          return {
            damageMult: +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            cooldown: hasQuickEdge ? +(cd * 0.6).toFixed(2) : cd,
            staminaCost: this.staminaCost,
            dashDistance: this.dashDistance,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'groundBreak',
        slot: 2,
        hotkey: '2',
        name: 'Ground Break',
        icon: 'groundBreak',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 1.40,
        damagePerLevel: 0.15,
        baseRadius: 110,
        radiusPerLevel: 12,
        baseCooldown: 9.0,
        cooldownPerLevel: 0,
        staminaCost: 20,
        stunDuration: 1.0,
        desc: 'Slam the Railcut into the ground. Deals area damage and applies Stun for 1s.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(5, lvl));
          const hasCarve = ownedNodes.includes('carve');
          const hasHeavyLanding = ownedNodes.includes('heavyLanding');
          return {
            damageMult: hasCarve
              ? +(2.60 + (l - 1) * this.damagePerLevel).toFixed(2)
              : +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            radius: this.baseRadius + (l - 1) * this.radiusPerLevel + (hasHeavyLanding ? 40 : 0),
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
            stunDuration: hasCarve ? 0 : this.stunDuration,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Radius: ${cur.radius}px -> ${nxt.radius}px`,
          ];
        },
      },
      {
        id: 'railSpike',
        slot: 3,
        hotkey: '3',
        name: 'Rail Spike',
        icon: 'railSpike',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 1.80,
        damagePerLevel: 0.20,
        basePierce: 2,
        piercePerLevel: 1,
        range: 420,
        speed: 620,
        baseCooldown: 6.0,
        cooldownPerLevel: 0,
        staminaCost: 15,
        desc: 'Hurl a sharpened rail piece that pierces enemies in a 420px line.',
        getStats(lvl = 1) {
          const l = Math.max(1, Math.min(5, lvl));
          return {
            damageMult: +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            pierce: this.basePierce + (l - 1) * this.piercePerLevel,
            range: this.range,
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl) {
          const cur = this.getStats(lvl);
          const nxt = this.getStats(nextLvl);
          return [
            `Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Pierce: ${cur.pierce} -> ${nxt.pierce} targets`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'sevenCuts',
      hotkey: 'R',
      name: 'Seven Cuts',
      icon: 'sevenCuts',
      totalDamageMult: 5.0,
      cuts: 7,
      radius: 300,
      duration: 1.05,
      desc: 'Time stops. Sena cuts 7 times across every enemy within 300px for 500% total ATK.',
    },
    passives: [
      {
        id: 'thickSkin',
        name: 'Thick Skin',
        icon: 'thickSkin',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+3 DEF per level.',
        formatComparison(lvl, nextLvl) {
          return [`DEF Bonus: +${lvl * 3} -> +${nextLvl * 3}`];
        },
      },
      {
        id: 'secondWind',
        name: 'Second Wind',
        icon: 'secondWind',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+12% Stamina regen per level.',
        formatComparison(lvl, nextLvl) {
          return [`Stamina Regen: +${lvl * 12}% -> +${nextLvl * 12}%`];
        },
      },
      {
        id: 'keenEdge',
        name: 'Keen Edge',
        icon: 'keenEdge',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+3% crit chance per level (crits deal 150% damage).',
        formatComparison(lvl, nextLvl) {
          return [`Crit Chance: +${lvl * 3}% -> +${nextLvl * 3}%`];
        },
      },
      {
        id: 'footwork',
        name: 'Footwork',
        icon: 'footwork',
        maxLevel: 3,
        costPerLevel: 1,
        desc: 'Dodge roll cooldown reduced by 0.15s per level.',
        formatComparison(lvl, nextLvl) {
          return [`Dodge Cooldown: -${(lvl * 0.15).toFixed(2)}s -> -${(nextLvl * 0.15).toFixed(2)}s`];
        },
      },
    ],
    branches: {
      cutter: {
        id: 'cutter',
        journeymanTitle: 'Cutter',
        masterTitle: 'Flenser',
        roleTag: 'Offense',
        summary: 'Momentum max stacks 5 -> 8, and each stack gives +5% ATK.',
        overlayDesc: {
          journeyman: 'Re-ground longer rail edge + red cloth bound on the hilt.',
          master: "Leather butcher's apron + second short blade on the hip.",
        },
        journeymanNodes: [
          {
            id: 'quickEdge',
            name: 'Quick Edge',
            icon: 'quickEdge',
            tier: 2,
            cost: 2,
            desc: 'Lunge passes through enemies, cooldown -40%, and resets on a kill.',
          },
          {
            id: 'openWound',
            name: 'Open Wound',
            icon: 'openWound',
            tier: 2,
            cost: 2,
            desc: 'Combo hit 3 applies Bleed (15% ATK per second for 4s, ignores DEF).',
          },
          {
            id: 'redline',
            name: 'Redline',
            icon: 'redline',
            tier: 2,
            cost: 2,
            desc: 'At max Momentum, grants Redline: attacks cost no Stamina and move speed is +10%.',
          },
        ],
        masterNodes: [
          {
            id: 'strip',
            name: 'Strip',
            icon: 'strip',
            tier: 3,
            cost: 3,
            desc: 'Every 4th hit on one enemy applies Exposed (-20% DEF for 6s).',
          },
          {
            id: 'carve',
            name: 'Carve',
            icon: 'carve',
            tier: 3,
            cost: 3,
            desc: 'Ground Break becomes a forward 3-slash cone dealing 260% ATK (no stun).',
          },
          {
            id: 'nineCuts',
            name: 'Nine Cuts',
            icon: 'nineCuts',
            tier: 3,
            cost: 3,
            desc: 'Seven Cuts becomes 9 cuts, applies Bleed, and needs 15% less charge.',
          },
        ],
      },
      anvil: {
        id: 'anvil',
        journeymanTitle: 'Anvil',
        masterTitle: 'Girder',
        roleTag: 'Defense',
        summary: 'Momentum stacks give +3% DEF each instead of ATK.',
        overlayDesc: {
          journeyman: 'Welded plate pauldron on left shoulder + road-sign buckler on left forearm.',
          master: 'Full riveted boiler chest plate.',
        },
        journeymanNodes: [
          {
            id: 'brace',
            name: 'Brace',
            icon: 'brace',
            tier: 2,
            cost: 2,
            desc: 'Hold right click to Guard. Blocks 60% of frontal damage (10 Stamina/s). First 0.2s reflects 100% ATK.',
          },
          {
            id: 'heavyLanding',
            name: 'Heavy Landing',
            icon: 'heavyLanding',
            tier: 2,
            cost: 2,
            desc: 'Ground Break radius +40px and grants Heavy Landing (15% damage reduction for 3s).',
          },
          {
            id: 'standFast',
            name: 'Stand Fast',
            icon: 'standFast',
            tier: 2,
            cost: 2,
            desc: 'Immune to knockback while below 50% HP.',
          },
        ],
        masterNodes: [
          {
            id: 'rebar',
            name: 'Rebar',
            icon: 'rebar',
            tier: 3,
            cost: 3,
            desc: 'Rail Spike throws 3 spikes in a spread, and spikes apply Pinned for 1s.',
          },
          {
            id: 'counterweight',
            name: 'Counterweight',
            icon: 'counterweight',
            tier: 3,
            cost: 3,
            desc: 'Guarding fills ultimate charge at double speed, and a perfect block restores 15 Stamina.',
          },
          {
            id: 'holdTheLine',
            name: 'Hold the Line',
            icon: 'holdTheLine',
            tier: 3,
            cost: 3,
            desc: 'Seven Cuts becomes a 6s Dug In stand: draws enemies within 300px, -60% damage taken, returns 80% ATK in a 120px burst on hit.',
          },
        ],
      },
    },
  },

  // =========================================================================
  // 2) ROOK MATSUDA — RANGED
  // =========================================================================
  rook: {
    id: 'rook',
    name: 'Rook Matsuda',
    role: 'Ranged',
    accent: PALETTE.brass, // #FFC83D
    accentName: 'brass',
    pitch: 'Road courier with a leaf-spring nail gun, active reloads, and wire traps.',
    weaponName: 'Springgun',
    weaponDesc: 'A nail gun rebuilt with a car leaf spring as the bow, firing 6-inch rail bolts.',
    titles: {
      hand: 'Drifter',
      journeyman: {
        longhand: 'Longhand',
        wirehand: 'Wirehand',
      },
      master: {
        longhand: 'Surveyor',
        wirehand: 'Minelayer',
      },
    },
    baseStats: {
      hp: 85,
      stamina: 60,
      atk: 11,
      def: 3,
      speed: 140,
      critChance: 0.08,
      critMult: 1.5,
    },
    perLevel: {
      hp: 9,
      stamina: 4,
      atk: 2,
      def: 0.5, // +1 DEF every 2 levels
    },
    basicAttack: {
      type: 'rangedBolts',
      fireRate: 3, // 3 shots per second
      damageMult: 1.0, // 100% ATK each
      range: 420,
      speed: 680,
    },
    mechanic: {
      id: 'magazine',
      name: 'Magazine & Range',
      baseMagSize: 12,
      baseReloadTime: 1.4,
      perfectWindowStart: 0.75, // last 25% of reload bar (0.75..1.0)
      cleanReloadWindowStart: 0.50, // doubled window with Clean Reload node (last 50%)
      perfectBonusPct: 0.25, // +25% damage on Clean Mag
      distMin: 80,
      distSpan: 240, // 80 + 240 = 320px max
      maxDistBonusBase: 0.30, // +30% at 320px+
      desc: 'Holds 12 bolts. Press Q during the last 25% of the 1.4s reload bar for a Perfect Reload (+25% damage Clean Mag). Bolts deal up to +30% bonus damage at 320px+.',
    },
    skills: [
      {
        id: 'rivetSpread',
        slot: 1,
        hotkey: '1',
        name: 'Rivet Spread',
        icon: 'rivetSpread',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 0.60, // 60% ATK per bolt
        damagePerLevel: 0.08, // +8% per level
        bolts: 5,
        fanDeg: 40,
        baseCooldown: 6.0,
        cooldownPerLevel: -0.4,
        staminaCost: 12,
        desc: 'Fires 5 rail bolts in a 40-degree fan for 60% ATK each.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(5, lvl));
          const hasRailSlug = ownedNodes.includes('railSlug');
          return {
            damageMult: hasRailSlug
              ? +(4.20 + (l - 1) * 0.25).toFixed(2)
              : +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            bolts: hasRailSlug ? 1 : this.bolts,
            cooldown: hasRailSlug
              ? 7.0
              : Math.max(2.0, +(this.baseCooldown + (l - 1) * this.cooldownPerLevel).toFixed(2)),
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Bolt Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'kickback',
        slot: 2,
        hotkey: '2',
        name: 'Kickback',
        icon: 'kickback',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 2.00, // 200% ATK
        damagePerLevel: 0.20, // +20% per level
        hopDistance: 90,
        knockback: 40,
        baseCooldown: 7.0,
        cooldownPerLevel: -0.4,
        staminaCost: 10,
        desc: 'Hop back 90px and fire one heavy bolt at the cursor for 200% ATK and 40px knockback.',
        getStats(lvl = 1) {
          const l = Math.max(1, Math.min(5, lvl));
          return {
            damageMult: +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            cooldown: Math.max(2.5, +(this.baseCooldown + (l - 1) * this.cooldownPerLevel).toFixed(2)),
            staminaCost: this.staminaCost,
            hopDistance: this.hopDistance,
            knockback: this.knockback,
          };
        },
        formatComparison(lvl, nextLvl) {
          const cur = this.getStats(lvl);
          const nxt = this.getStats(nextLvl);
          return [
            `Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'tripwire',
        slot: 3,
        hotkey: '3',
        name: 'Tripwire',
        icon: 'tripwire',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 1.20, // 120% ATK
        damagePerLevel: 0.20, // +20% per level
        baseDuration: 8.0,
        durationPerLevel: 1.0, // +1s per level
        lineLength: 140,
        maxLines: 3,
        slowPct: 0.40,
        slowDuration: 2.0,
        baseCooldown: 10.0,
        cooldownPerLevel: 0,
        staminaCost: 18,
        desc: 'Throw a spool that lays a 140px wire line for 8s. Crossing enemies take 120% ATK and Slow 40% for 2s.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(5, lvl));
          const hasSpareSpools = ownedNodes.includes('spareSpools');
          const hasPressurePlates = ownedNodes.includes('pressurePlates');
          return {
            damageMult: hasPressurePlates
              ? +(3.00 + (l - 1) * this.damagePerLevel).toFixed(2)
              : +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            duration: this.baseDuration + (l - 1) * this.durationPerLevel,
            maxLines: hasPressurePlates ? 4 : this.maxLines + (hasSpareSpools ? 2 : 0),
            cooldown: this.baseCooldown - (hasSpareSpools ? 2.0 : 0),
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Duration: ${cur.duration.toFixed(1)}s -> ${nxt.duration.toFixed(1)}s`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'tenCount',
      hotkey: 'R',
      name: 'Ten Count',
      icon: 'tenCount',
      totalDamageMult: 6.0, // 600% ATK total
      bolts: 10,
      chargeTime: 1.0,
      range: 520,
      desc: 'Rook plants his feet, aims along a red laser line for 1s, then fires 10 piercing bolts for 600% total ATK.',
    },
    passives: [
      {
        id: 'steadyHands',
        name: 'Steady Hands',
        icon: 'steadyHands',
        maxLevel: 3,
        costPerLevel: 1,
        desc: 'Reload time reduced by 0.15s per level.',
        formatComparison(lvl, nextLvl) {
          return [`Reload Time: -${(lvl * 0.15).toFixed(2)}s -> -${(nextLvl * 0.15).toFixed(2)}s`];
        },
      },
      {
        id: 'longBarrel',
        name: 'Long Barrel',
        icon: 'longBarrel',
        maxLevel: 3,
        costPerLevel: 1,
        desc: 'Maximum distance damage bonus increased by +6% per level.',
        formatComparison(lvl, nextLvl) {
          return [`Max Distance Bonus: +${30 + lvl * 6}% -> +${30 + nextLvl * 6}%`];
        },
      },
      {
        id: 'deepBelt',
        name: 'Deep Belt',
        icon: 'deepBelt',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+2 magazine size per level.',
        formatComparison(lvl, nextLvl) {
          return [`Magazine Size: ${12 + lvl * 2} -> ${12 + nextLvl * 2} bolts`];
        },
      },
      {
        id: 'lightStep',
        name: 'Light Step',
        icon: 'lightStep',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+6 move speed and +10% dodge distance per level.',
        formatComparison(lvl, nextLvl) {
          return [
            `Move Speed: +${lvl * 6} -> +${nextLvl * 6}`,
            `Dodge Distance: +${lvl * 10}% -> +${nextLvl * 10}%`,
          ];
        },
      },
    ],
    branches: {
      longhand: {
        id: 'longhand',
        journeymanTitle: 'Longhand',
        masterTitle: 'Surveyor',
        roleTag: 'Precision',
        summary: 'High-caliber long-distance marksmanship, active reload rewards, and target marking.',
        overlayDesc: {
          journeyman: 'Longer Springgun barrel + bottle-lens scope.',
          master: "Surveyor's tripod strapped to back + enlarged brass monocle.",
        },
        journeymanNodes: [
          {
            id: 'holdBreath',
            name: 'Hold Breath',
            icon: 'holdBreath',
            tier: 2,
            cost: 2,
            desc: 'Standing still for 0.6s grants Settled: next shot deals +80% damage and +1 pierce.',
          },
          {
            id: 'cleanReload',
            name: 'Clean Reload',
            icon: 'cleanReload',
            tier: 2,
            cost: 2,
            desc: 'Perfect Reload window is doubled, and a Perfect Reload adds +1 bolt to that magazine.',
          },
          {
            id: 'marked',
            name: 'Marked',
            icon: 'marked',
            tier: 2,
            cost: 2,
            desc: 'Kickback applies Marked to its target (+20% damage taken from all sources for 5s).',
          },
        ],
        masterNodes: [
          {
            id: 'rangeFinder',
            name: 'Range Finder',
            icon: 'rangeFinder',
            tier: 3,
            cost: 3,
            desc: 'Distance bonus cap increases from +30% to +60%, and starts ramping at 60px.',
          },
          {
            id: 'railSlug',
            name: 'Rail Slug',
            icon: 'railSlug',
            tier: 3,
            cost: 3,
            desc: 'Rivet Spread becomes one high-velocity piercing slug dealing 420% ATK (cooldown 7s).',
          },
          {
            id: 'longCount',
            name: 'Long Count',
            icon: 'longCount',
            tier: 3,
            cost: 3,
            desc: 'Ten Count becomes one massive bolt after a 1.6s charge: 900% ATK, unlimited pierce, marks every enemy hit.',
          },
        ],
      },
      wirehand: {
        id: 'wirehand',
        journeymanTitle: 'Wirehand',
        masterTitle: 'Minelayer',
        roleTag: 'Traps',
        summary: 'Battlefield control with barbed wire lines, caltrop dodges, and chained blast mines.',
        overlayDesc: {
          journeyman: 'Wire spools on belt + canvas trap satchel.',
          master: 'Bandolier of fused tin-can mines across chest.',
        },
        journeymanNodes: [
          {
            id: 'spareSpools',
            name: 'Spare Spools',
            icon: 'spareSpools',
            tier: 2,
            cost: 2,
            desc: 'Tripwire max lines +2 and cooldown reduced by 2s.',
          },
          {
            id: 'barbed',
            name: 'Barbed',
            icon: 'barbed',
            tier: 2,
            cost: 2,
            desc: 'Tripwire applies Bleed (15% ATK/s for 4s) and its Slow increases to 60%.',
          },
          {
            id: 'caltropPocket',
            name: 'Caltrop Pocket',
            icon: 'caltropPocket',
            tier: 2,
            cost: 2,
            desc: 'Every dodge roll drops a 60px caltrop patch for 4s (Slow 40% and Bleed on contact).',
          },
        ],
        masterNodes: [
          {
            id: 'pressurePlates',
            name: 'Pressure Plates',
            icon: 'pressurePlates',
            tier: 3,
            cost: 3,
            desc: 'Tripwire places proximity mines that explode for 300% ATK in an 80px radius (max 4 mines).',
          },
          {
            id: 'chainReaction',
            name: 'Chain Reaction',
            icon: 'chainReaction',
            tier: 3,
            cost: 3,
            desc: 'When a mine explodes, all active wire lines and mines pulse for 100% ATK.',
          },
          {
            id: 'deadGround',
            name: 'Dead Ground',
            icon: 'deadGround',
            tier: 3,
            cost: 3,
            desc: 'Ten Count becomes a minefield barrage, dropping 12 mines over 1.5s in a 220px field (220% ATK each).',
          },
        ],
      },
    },
  },

  // =========================================================================
  // 3) INES CALLOWAY — MAGE (MAGNETIST)
  // =========================================================================
  ines: {
    id: 'ines',
    name: 'Ines Calloway',
    role: 'Mage (Magnetist)',
    accent: PALETTE.verdigris, // #4FD6A0
    accentName: 'verdigris',
    pitch: 'Industrial magnetist who orbits live scrap for armor and hurls metal at high velocity.',
    weaponName: 'Alternator Rig & Palm Magnets',
    weaponDesc: 'Canvas welding gloves with horseshoe magnets wired to a humming car alternator coil.',
    titles: {
      hand: 'Gleaner',
      journeyman: {
        binder: 'Binder',
        slinger: 'Slinger',
      },
      master: {
        binder: 'Crane',
        slinger: 'Wrecker',
      },
    },
    baseStats: {
      hp: 80,
      stamina: 90,
      atk: 9,
      def: 3,
      speed: 125,
      critChance: 0.08,
      critMult: 1.5,
    },
    perLevel: {
      hp: 8,
      stamina: 6,
      atk: 2,
      def: 0.5, // +1 DEF every 2 levels
    },
    basicAttack: {
      type: 'scrapThrow',
      fireRate: 3, // 3 throws per second
      damageMultWithScrap: 1.30, // 130% ATK, pierces 1 enemy
      damageMultEmptyPulse: 0.40, // 40% ATK magnetic pulse at 120px when 0 scrap
      emptyPulseRange: 120,
      range: 360,
      speed: 580,
    },
    mechanic: {
      id: 'scrapOrbit',
      name: 'Scrap Orbit',
      baseMaxScrap: 6,
      orbitRadius: 22,
      defPerScrap: 1.5, // +1.5 DEF per orbiting piece
      baseGainInterval: 3.0, // 1 piece every 3s
      killGatherRadius: 200, // +1 piece when enemy dies within 200px
      pickupRadiusBase: 52, // walk near grounded scrap to pull back
      groundScrapDuration: 4.0,
      desc: 'Up to 6 scrap pieces orbit at 22px (+1.5 DEF each). Gains 1 piece every 3s and from kills within 200px. Left click hurls a piece for 130% ATK.',
    },
    skills: [
      {
        id: 'pull',
        slot: 1,
        hotkey: '1',
        name: 'Pull',
        icon: 'pull',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 0.90, // 90% ATK
        damagePerLevel: 0.10, // +10% per level
        baseRadius: 180,
        radiusPerLevel: 14, // +14px per level
        baseCooldown: 8.0,
        cooldownPerLevel: 0,
        staminaCost: 15,
        desc: 'Yank every enemy within 180px of the cursor toward the cursor point and deal 90% ATK.',
        getStats(lvl = 1) {
          const l = Math.max(1, Math.min(5, lvl));
          return {
            damageMult: +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            radius: this.baseRadius + (l - 1) * this.radiusPerLevel,
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl) {
          const cur = this.getStats(lvl);
          const nxt = this.getStats(nextLvl);
          return [
            `Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Pull Radius: ${cur.radius}px -> ${nxt.radius}px`,
          ];
        },
      },
      {
        id: 'spinUp',
        slot: 2,
        hotkey: '2',
        name: 'Spin Up',
        icon: 'spinUp',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 0.60, // 60% ATK per second
        damagePerLevel: 0.10, // +10% per level
        baseDuration: 5.0,
        durationPerLevel: 0.5, // +0.5s per level
        radius: 70,
        baseCooldown: 10.0,
        cooldownPerLevel: 0,
        staminaCost: 20,
        desc: 'Accelerate orbiting scrap into a 70px ring for 5s, dealing 60% ATK/s and blocking projectiles (uses 1 scrap/s).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(5, lvl));
          const hasSecondSkin = ownedNodes.includes('secondSkin');
          return {
            damageMult: +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            duration: (hasSecondSkin ? 7.0 : this.baseDuration) + (l - 1) * this.durationPerLevel,
            radius: this.radius,
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Ring DPS: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK/s`,
            `Duration: ${cur.duration.toFixed(1)}s -> ${nxt.duration.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'lump',
        slot: 3,
        hotkey: '3',
        name: 'Lump',
        icon: 'lump',
        maxLevel: 5,
        costPerLevel: 1,
        baseDamageMult: 2.50, // 250% ATK
        damagePerLevel: 0.20, // +20% per level
        baseRadius: 60,
        radiusPerLevel: 8, // +8px per level
        scrapCost: 3,
        knockback: 50,
        baseCooldown: 6.0,
        cooldownPerLevel: 0,
        staminaCost: 15,
        desc: 'Compress 3 orbiting pieces into a heavy metallic lump and hurl it for 250% ATK in a 60px blast.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(5, lvl));
          const hasSpareParts = ownedNodes.includes('spareParts');
          const hasPileDriver = ownedNodes.includes('pileDriver');
          const baseRad = this.baseRadius + (l - 1) * this.radiusPerLevel;
          return {
            damageMult: hasPileDriver
              ? +(4.00 + (l - 1) * this.damagePerLevel).toFixed(2)
              : +(this.baseDamageMult + (l - 1) * this.damagePerLevel).toFixed(2),
            radius: Math.round(baseRad * (hasSpareParts ? 1.3 : 1.0)),
            scrapCost: hasSpareParts ? 2 : this.scrapCost,
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Blast Damage: ${Math.round(cur.damageMult * 100)}% -> ${Math.round(nxt.damageMult * 100)}% ATK`,
            `Blast Radius: ${cur.radius}px -> ${nxt.radius}px`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'scrapfall',
      hotkey: 'R',
      name: 'Scrapfall',
      icon: 'scrapfall',
      totalDamageMult: 5.5, // 550% ATK
      radius: 160,
      stunDuration: 1.5,
      desc: 'Levitate loose wreck parts within 400px above the target area over 1s, then slam them down for 550% ATK and a 1.5s Stun.',
    },
    passives: [
      {
        id: 'deepPockets',
        name: 'Deep Pockets',
        icon: 'deepPockets',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+1 maximum orbiting scrap per level.',
        formatComparison(lvl, nextLvl) {
          return [`Max Scrap Orbit: ${6 + lvl} -> ${6 + nextLvl}`];
        },
      },
      {
        id: 'stickyFingers',
        name: 'Sticky Fingers',
        icon: 'stickyFingers',
        maxLevel: 3,
        costPerLevel: 1,
        desc: 'Scrap gather radius +30px/lv and passive generation interval faster (3s -> 2.5s -> 2s -> 1.5s).',
        formatComparison(lvl, nextLvl) {
          const intervals = [3.0, 2.5, 2.0, 1.5];
          return [
            `Gather Radius: +${lvl * 30}px -> +${nextLvl * 30}px`,
            `Generation: ${intervals[lvl]}s -> ${intervals[nextLvl]}s`,
          ];
        },
      },
      {
        id: 'goodArm',
        name: 'Good Arm',
        icon: 'goodArm',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+6% thrown scrap and Lump damage per level.',
        formatComparison(lvl, nextLvl) {
          return [`Thrown Damage: +${lvl * 6}% -> +${nextLvl * 6}%`];
        },
      },
      {
        id: 'calmHands',
        name: 'Calm Hands',
        icon: 'calmHands',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+10% Stamina regen per level.',
        formatComparison(lvl, nextLvl) {
          return [`Stamina Regen: +${lvl * 10}% -> +${nextLvl * 10}%`];
        },
      },
    ],
    branches: {
      binder: {
        id: 'binder',
        journeymanTitle: 'Binder',
        masterTitle: 'Crane',
        roleTag: 'Control',
        summary: 'Heavy magnetic crowd control, levitation slams, and orbiting scrap shielding.',
        overlayDesc: {
          journeyman: 'Heavier alternator coil + second horseshoe magnet on back.',
          master: 'Industrial hoist hook on a short chain from the shoulder.',
        },
        journeymanNodes: [
          {
            id: 'drag',
            name: 'Drag',
            icon: 'drag',
            tier: 2,
            cost: 2,
            desc: 'Pull also applies Slow 50% for 2s.',
          },
          {
            id: 'secondSkin',
            name: 'Second Skin',
            icon: 'secondSkin',
            tier: 2,
            cost: 2,
            desc: 'Spin Up grants Second Skin (25% damage reduction) and lasts 7s base.',
          },
          {
            id: 'magnetBelt',
            name: 'Magnet Belt',
            icon: 'magnetBelt',
            tier: 2,
            cost: 2,
            desc: 'Orbiting scrap automatically intercepts and blocks one enemy projectile every 3s.',
          },
        ],
        masterNodes: [
          {
            id: 'lift',
            name: 'Lift',
            icon: 'lift',
            tier: 3,
            cost: 3,
            desc: 'Pull applies Lifted for 1.5s (suspended 12px, cannot act) and deals 100% bonus damage when dropped.',
          },
          {
            id: 'pileDriver',
            name: 'Pile Driver',
            icon: 'pileDriver',
            tier: 3,
            cost: 3,
            desc: 'Lump drops vertically from above for 400% ATK and applies Stun for 1s.',
          },
          {
            id: 'craneDrop',
            name: 'Crane Drop',
            icon: 'craneDrop',
            tier: 3,
            cost: 3,
            desc: 'Scrapfall lasts 8s as a floating junkyard that drops 3 waves for 550% total ATK and a 2s Stun per wave.',
          },
        ],
      },
      slinger: {
        id: 'slinger',
        journeymanTitle: 'Slinger',
        masterTitle: 'Wrecker',
        roleTag: 'Damage',
        summary: 'High-speed ricocheting scrap salvos, shrapnel bursts, and massive wrecking-ball throws.',
        overlayDesc: {
          journeyman: 'Canvas scrap bag on hip + leather sling band on forearm.',
          master: 'Heavy iron chain wrapped across both shoulders.',
        },
        journeymanNodes: [
          {
            id: 'spareParts',
            name: 'Spare Parts',
            icon: 'spareParts',
            tier: 2,
            cost: 2,
            desc: 'Lump costs 2 scrap instead of 3, and its blast radius is increased by +30%.',
          },
          {
            id: 'ricochet',
            name: 'Ricochet',
            icon: 'ricochet',
            tier: 2,
            cost: 2,
            desc: 'Basic scrap throws bounce to 1 extra nearby enemy for 60% damage.',
          },
          {
            id: 'overspin',
            name: 'Overspin',
            icon: 'overspin',
            tier: 2,
            cost: 2,
            desc: 'At max Scrap Orbit, grants Overspun (+25% throw attack speed).',
          },
        ],
        masterNodes: [
          {
            id: 'wreckingBall',
            name: 'Wrecking Ball',
            icon: 'wreckingBall',
            tier: 3,
            cost: 3,
            desc: 'Lump compresses a car-sized wreck mass dealing 600% ATK in a 100px blast radius.',
          },
          {
            id: 'shrapnel',
            name: 'Shrapnel',
            icon: 'shrapnel',
            tier: 3,
            cost: 3,
            desc: 'Every thrown scrap piece splits into 3 metal shards on hit, dealing 30% ATK each.',
          },
          {
            id: 'junkyardRain',
            name: 'Junkyard Rain',
            icon: 'junkyardRain',
            tier: 3,
            cost: 3,
            desc: "Scrapfall's radius expands to 260px and drops 3 heavy waves for 750% ATK total.",
          },
        ],
      },
    },
  },
};

export const CLASS_ORDER = ['sena', 'rook', 'ines'];
export const CLASS_LIST = [CLASSES.sena, CLASSES.rook, CLASSES.ines];

// Normalize class objects so both array/key lookups and UI helpers work seamlessly
for (const cls of CLASS_LIST) {
  cls.characterName = cls.characterName || cls.name;
  cls.className = cls.className || cls.role;
  cls.accentColor = cls.accentColor || cls.accent;

  if (Array.isArray(cls.skills)) {
    const skillArr = cls.skills;
    cls.skillOrder = skillArr.map((s) => s.id);
    const skillMap = {};
    for (const sk of skillArr) {
      if (!sk.icon.startsWith('skill_')) {
        sk.icon = `skill_${sk.id}`;
      }
      if (!sk.formatCurrent) {
        sk.formatCurrent = (st) => {
          const parts = [];
          if (st.damageMult) parts.push(`${Math.round(st.damageMult * 100)}% ATK`);
          if (st.dpsMult) parts.push(`${Math.round(st.dpsMult * 100)}% ATK/s`);
          if (st.radius) parts.push(`${st.radius}px Radius`);
          if (st.range) parts.push(`${st.range}px Range`);
          if (st.cooldown) parts.push(`${st.cooldown}s CD`);
          return parts.join(' · ');
        };
      }
      skillMap[sk.id] = sk;
      skillArr[sk.id] = sk;
    }
    skillMap[Symbol.iterator] = function* () {
      yield* skillArr;
    };
    cls.skillMap = skillMap;
    cls.skills = skillArr;
  }

  if (Array.isArray(cls.passives)) {
    // Keep 2 Tier 1 passives as specified by the 3-tier Skill Tree layout
    cls.passives = cls.passives.slice(0, 2);
    const passiveMap = {};
    for (const pas of cls.passives) {
      if (!pas.formatCurrent) {
        pas.formatCurrent = (lv) => {
          if (pas.formatComparison) {
            const cmp = pas.formatComparison(lv, Math.min(pas.maxLevel, lv + 1));
            return cmp[0] || `Rank ${lv}/${pas.maxLevel}`;
          }
          return `Rank ${lv}/${pas.maxLevel}`;
        };
      }
      passiveMap[pas.id] = pas;
      cls.passives[pas.id] = pas;
    }
    passiveMap[Symbol.iterator] = function* () {
      yield* cls.passives;
    };
    cls.passiveMap = passiveMap;
  }

  if (cls.ultimate && !cls.ultimate.summary) {
    cls.ultimate.summary = `${Math.round((cls.ultimate.totalDamageMult || 5) * 100)}% Total ATK`;
  }
}

export function getClassConfig(classId) {
  return CLASSES[classId] || CLASSES.sena;
}

export function getStageName(stage = 1) {
  return STAGE_NAMES[stage] || 'Hand';
}

export function getCharacterTitle(classId, stage = 1, branch = null) {
  const cfg = getClassConfig(classId);
  if (stage === 1 || !branch) {
    return cfg.titles.hand;
  }
  if (stage === 2) {
    return cfg.titles.journeyman[branch] || cfg.titles.hand;
  }
  return cfg.titles.master[branch] || cfg.titles.journeyman[branch] || cfg.titles.hand;
}

export function getCharacterTitleAndStage(classId, stage = 1, branch = null) {
  const cfg = getClassConfig(classId);
  const title = getCharacterTitle(classId, stage, branch);
  const stageName = getStageName(stage);
  return {
    title,
    stageName,
    fullLabel: `${cfg.name} - ${title}, ${stageName}`,
  };
}

export default CLASSES;
