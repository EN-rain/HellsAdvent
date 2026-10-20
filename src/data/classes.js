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
  1: 'Initiate',
  2: 'Oathsworn',
  3: 'Archon',
};

export const CLASSES = {
  // =========================================================================
  // 1) SENA IBUKI — ABYSSAL BLADE KNIGHT
  // =========================================================================
  sena: {
    id: 'sena',
    name: 'Sena Ibuki',
    role: 'Abyssal Blade Knight',
    accent: PALETTE.signal, // #00F0FF
    accentName: 'signal',
    pitch: 'Cursed spatial swordswoman who builds Blood-Rhythm through relentless void slashes.',
    weaponName: 'Duskrend',
    weaponDesc: 'A cursed void-katana forged in soulfire that cleaves dimensional rifts.',
    titles: {
      hand: 'Nightblade',
      journeyman: {
        cutter: 'Rift-Cleaver',
        anvil: 'Aegis Knight',
      },
      master: {
        cutter: 'Abyssal Executioner',
        anvil: 'Immortal Bulwark',
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
        name: 'Shadow Lunge',
        icon: 'lunge',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 cut', damageMult: 1.60, cooldown: 5.0 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 cuts', damageMult: 1.85, cooldown: 4.5 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 cuts', damageMult: 2.15, cooldown: 3.9 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 cuts', damageMult: 2.40, cooldown: 3.4 },
        ],
        baseDamageMult: 1.60,
        damagePerLevel: 0.27,
        baseCooldown: 5.0,
        cooldownFloor: 2.5,
        cooldownPerLevel: -0.53,
        staminaCost: 10,
        dashDistance: 160,
        desc: 'Shadow-step 160px toward the cursor, cleaving every cursed foe on the line. Ranks unlock free at Lv 1/15/30/45 (1 -> 4 cuts, 160% -> 240% ATK).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasQuickEdge = ownedNodes.includes('quickEdge');
          const rawCd = hasQuickEdge ? rk.cooldown * 0.6 : rk.cooldown;
          const cd = Math.max(this.cooldownFloor, +rawCd.toFixed(2));
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            cooldown: cd,
            staminaCost: this.staminaCost,
            dashDistance: this.dashDistance,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Count & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s (Floor ${this.cooldownFloor}s)`,
          ];
        },
      },
      {
        id: 'groundBreak',
        slot: 2,
        hotkey: '2',
        name: 'Abyssal Rupture',
        icon: 'groundBreak',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 shock ring', damageMult: 1.40, radius: 110 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 rings', damageMult: 1.60, radius: 126 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 rings', damageMult: 1.80, radius: 142 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 rings', damageMult: 2.00, radius: 158 },
        ],
        baseDamageMult: 1.40,
        damagePerLevel: 0.20,
        baseRadius: 110,
        radiusPerLevel: 16,
        baseCooldown: 8.5,
        cooldownFloor: 4.25,
        cooldownPerLevel: 0,
        staminaCost: 14,
        stunDuration: 1.0,
        desc: 'Drive Duskrend downward, fracturing a 110px soulfire crater with 1.0s Stun. Ranks unlock free at Lv 1/15/30/45 (1 -> 4 shock rings, 140% -> 200% ATK).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasCarve = ownedNodes.includes('carve');
          const hasHeavyLanding = ownedNodes.includes('heavyLanding');
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: hasCarve ? +(rk.damageMult + 1.20).toFixed(2) : rk.damageMult,
            radius: rk.radius + (hasHeavyLanding ? 40 : 0),
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
            stunDuration: hasCarve ? 0 : this.stunDuration,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Count & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Radius: ${cur.radius}px -> ${nxt.radius}px`,
          ];
        },
      },
      {
        id: 'railParry',
        slot: 3,
        hotkey: '3',
        name: 'Soulfire Ward Parry',
        icon: 'railParry',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 crescent', damageMult: 3.50, cooldown: 6.0 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 crescents', damageMult: 4.00, cooldown: 5.5 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 crescents', damageMult: 4.50, cooldown: 5.0 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 crescents', damageMult: 5.00, cooldown: 4.5 },
        ],
        parryDuration: 0.40,
        baseDamageMult: 3.50,
        damagePerLevel: 0.50,
        baseCooldown: 6.0,
        cooldownFloor: 3.0,
        cooldownPerLevel: 0.5,
        staminaCost: 8,
        desc: 'Enter a 0.4s ward stance. Deflecting an incoming blow unleashes Eclipse Crescent Slash (1 -> 4 crescents, 350% -> 500% total ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasRebar = ownedNodes.includes('rebar');
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            parryDuration: +(this.parryDuration + (hasRebar ? 0.20 : 0)).toFixed(2),
            damageMult: +(rk.damageMult + (hasRebar ? 0.60 : 0)).toFixed(2),
            cooldown: Math.max(this.cooldownFloor, rk.cooldown),
            staminaCost: this.staminaCost,
            hasCounterShockwave: hasRebar,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Riposte: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'sevenCuts',
      hotkey: 'R',
      name: 'Seven Seals of Eclipse',
      icon: 'sevenCuts',
      totalDamageMult: 5.0,
      cuts: 7,
      radius: 300,
      duration: 1.05,
      desc: 'Time stops beneath the Blood Moon. Sena cleaves 7 spatial rifts across every enemy within 300px for 500% total ATK.',
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
            name: 'Rebar Riposte',
            icon: 'rebar',
            tier: 3,
            cost: 3,
            desc: 'Rail Parry timing window +0.2s, and Riposte triggers a 120px shockwave that pins enemies for 1.5s.',
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
  // 2) ROOK MATSUDA — INQUISITOR MARKSMAN
  // =========================================================================
  rook: {
    id: 'rook',
    name: 'Rook Matsuda',
    role: 'Inquisitor Marksman',
    accent: PALETTE.brass, // #FFC83D
    accentName: 'brass',
    pitch: 'Witch-hunter arbalist who fires consecrated silver stakes, consecrated reloads, and snare wards.',
    weaponName: 'Hexbane Arbalest',
    weaponDesc: 'A blessed repeating crossbow wrought from silvered yew and dark cathedral iron.',
    titles: {
      hand: 'Witch-Stalker',
      journeyman: {
        longhand: 'Deadeye Inquisitor',
        wirehand: 'Hex-Trapper',
      },
      master: {
        longhand: 'Grand Arbiter',
        wirehand: 'Sanctum Warden',
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
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 5, countLabel: '5 bolts', totalMult: 3.00, boltMult: 0.60, cooldown: 6.0 },
          { rank: 2, unlockLevel: 15, count: 6, countLabel: '6 bolts', totalMult: 3.60, boltMult: 0.60, cooldown: 5.5 },
          { rank: 3, unlockLevel: 30, count: 7, countLabel: '7 bolts', totalMult: 3.99, boltMult: 0.57, cooldown: 5.0 },
          { rank: 4, unlockLevel: 45, count: 8, countLabel: '8 bolts', totalMult: 4.40, boltMult: 0.55, cooldown: 4.5 },
        ],
        baseDamageMult: 0.60,
        damagePerLevel: 0.0,
        bolts: 5,
        fanDeg: 40,
        baseCooldown: 6.0,
        cooldownFloor: 3.0,
        cooldownPerLevel: -0.5,
        staminaCost: 12,
        desc: 'Fires rail bolts in a 40-degree fan (5 -> 8 bolts, 300% -> 440% total ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasRailSlug = ownedNodes.includes('railSlug');
          return {
            rank: l,
            count: hasRailSlug ? 1 : rk.count,
            countLabel: hasRailSlug ? '1 slug' : rk.countLabel,
            damageMult: hasRailSlug ? +(4.20 + (l - 1) * 0.25).toFixed(2) : rk.boltMult,
            totalDamageMult: hasRailSlug ? +(4.20 + (l - 1) * 0.25).toFixed(2) : rk.totalMult,
            bolts: hasRailSlug ? 1 : rk.count,
            cooldown: hasRailSlug ? 7.0 : Math.max(this.cooldownFloor, rk.cooldown),
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Spread: ${cur.countLabel} (${Math.round(cur.totalDamageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.totalDamageMult * 100)}% ATK)`,
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
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 bolt', damageMult: 2.00, cooldown: 7.0 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 bolts', damageMult: 2.25, cooldown: 6.4 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 bolts', damageMult: 2.55, cooldown: 5.8 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 bolts', damageMult: 2.80, cooldown: 5.2 },
        ],
        baseDamageMult: 2.00,
        damagePerLevel: 0.27,
        hopDistance: 90,
        knockback: 40,
        baseCooldown: 7.0,
        cooldownFloor: 3.5,
        cooldownPerLevel: -0.6,
        staminaCost: 10,
        desc: 'Hop back 90px and fire heavy recoil bolts (1 -> 4 bolts, 200% -> 280% total ATK across Lv 1/15/30/45).',
        getStats(lvl = 1) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            cooldown: Math.max(this.cooldownFloor, rk.cooldown),
            staminaCost: this.staminaCost,
            hopDistance: this.hopDistance,
            knockback: this.knockback,
          };
        },
        formatComparison(lvl, nextLvl) {
          const cur = this.getStats(lvl);
          const nxt = this.getStats(nextLvl);
          return [
            `Count & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'rapidFire',
        slot: 3,
        hotkey: '3',
        name: 'Rapid Fire',
        icon: 'rapidFire',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 4.0, countLabel: '4.0s', duration: 4.0, cooldown: 12.0 },
          { rank: 2, unlockLevel: 15, count: 4.7, countLabel: '4.7s', duration: 4.7, cooldown: 11.2 },
          { rank: 3, unlockLevel: 30, count: 5.3, countLabel: '5.3s', duration: 5.3, cooldown: 10.4 },
          { rank: 4, unlockLevel: 45, count: 6.0, countLabel: '6.0s', duration: 6.0, cooldown: 9.6 },
        ],
        baseDuration: 4.0,
        durationPerLevel: 0.67,
        attackSpeedMult: 2.0,
        baseCooldown: 12.0,
        cooldownFloor: 6.0,
        cooldownPerLevel: 0.8,
        staminaCost: 15,
        desc: 'Overclock the springgun (4.0s -> 6.0s across Lv 1/15/30/45). Refills magazine immediately, grants +100% Attack Speed, and basic shots consume no ammo.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasSpareSpools = ownedNodes.includes('spareSpools');
          const hasPressurePlates = ownedNodes.includes('pressurePlates');
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            duration: +(rk.duration + (hasSpareSpools ? 1.5 : 0)).toFixed(1),
            cooldown: Math.max(this.cooldownFloor, +(rk.cooldown - (hasSpareSpools ? 2.0 : 0)).toFixed(1)),
            attackSpeedMult: this.attackSpeedMult,
            staminaCost: this.staminaCost,
            hasExplosiveBolts: hasPressurePlates,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Duration: ${cur.duration.toFixed(1)}s -> ${nxt.duration.toFixed(1)}s`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'railSlug',
      hotkey: 'R',
      name: 'Judgement Silver Spear',
      icon: 'railSlug',
      totalDamageMult: 10.0, // 1000% ATK total
      range: 800,
      chargeTime: 1.2,
      desc: 'Rook kneels in inquisitorial prayer and fires a consecrated solar spear across the realm for 1000% ATK, piercing all foes.',
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
            name: 'Drum Mag',
            icon: 'spareSpools',
            tier: 2,
            cost: 2,
            desc: 'Rapid Fire duration +1.5s and cooldown reduced by 2s.',
          },
          {
            id: 'barbed',
            name: 'Barbed Bolts',
            icon: 'barbed',
            tier: 2,
            cost: 2,
            desc: 'During Rapid Fire, bolts apply Bleed (15% ATK/s for 4s) and Slow 40% on hit.',
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
            name: 'Explosive Bolts',
            icon: 'pressurePlates',
            tier: 3,
            cost: 3,
            desc: 'During Rapid Fire, bolts detonate on impact for 60% bonus AOE damage in a 45px blast.',
          },
          {
            id: 'chainReaction',
            name: 'Split Shot',
            icon: 'chainReaction',
            tier: 3,
            cost: 3,
            desc: 'During Rapid Fire, bolts pierce 2 additional enemies and fly 25% faster.',
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
  // 3) INES CALLOWAY — OSSUARY NECROMANCER
  // =========================================================================
  ines: {
    id: 'ines',
    name: 'Ines Calloway',
    role: 'Ossuary Necromancer',
    accent: PALETTE.verdigris, // #4FD6A0
    accentName: 'verdigris',
    pitch: 'Catacomb necromancer who orbits cursed bone-shards for armor and hurls grave-constructs.',
    weaponName: 'Gravelord Scepter & Bone Reliquary',
    weaponDesc: 'An ancient skull-topped scepter and dorsal ossuary cage humming with emerald soul-flame.',
    titles: {
      hand: 'Grave-Caller',
      journeyman: {
        binder: 'Bone-Weaver',
        slinger: 'Crypt-Hurler',
      },
      master: {
        binder: 'Ossuary Sovereign',
        slinger: 'Lich Empress',
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
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 pulse', damageMult: 0.90, radius: 180 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 pulses', damageMult: 1.00, radius: 194 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 pulses', damageMult: 1.15, radius: 208 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 pulses', damageMult: 1.30, radius: 222 },
        ],
        baseDamageMult: 0.90,
        damagePerLevel: 0.13,
        baseRadius: 180,
        radiusPerLevel: 14,
        baseCooldown: 8.0,
        cooldownFloor: 4.0,
        cooldownPerLevel: 0,
        staminaCost: 15,
        desc: 'Yank every enemy within 180px toward the cursor (1 -> 4 pulses, 90% -> 130% ATK across Lv 1/15/30/45).',
        getStats(lvl = 1) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            radius: rk.radius,
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl) {
          const cur = this.getStats(lvl);
          const nxt = this.getStats(nextLvl);
          return [
            `Count & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
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
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 3, countLabel: '3 blades', damageMult: 0.60, duration: 5.0, totalMult: 3.00 },
          { rank: 2, unlockLevel: 15, count: 4, countLabel: '4 blades', damageMult: 0.64, duration: 5.4, totalMult: 3.46 },
          { rank: 3, unlockLevel: 30, count: 5, countLabel: '5 blades', damageMult: 0.68, duration: 5.8, totalMult: 3.94 },
          { rank: 4, unlockLevel: 45, count: 6, countLabel: '6 blades', damageMult: 0.72, duration: 6.0, totalMult: 4.32 },
        ],
        baseDamageMult: 0.60,
        damagePerLevel: 0.04,
        baseDuration: 5.0,
        durationPerLevel: 0.35,
        radius: 70,
        baseCooldown: 10.0,
        cooldownFloor: 5.0,
        cooldownPerLevel: 0,
        staminaCost: 20,
        desc: 'Accelerate orbiting scrap into a 70px blade ring (3 -> 6 blades, 300% -> 432% total ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasSecondSkin = ownedNodes.includes('secondSkin');
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            totalDamageMult: rk.totalMult,
            duration: +(rk.duration + (hasSecondSkin ? 2.0 : 0)).toFixed(1),
            radius: this.radius,
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Blades & DPS: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%/s) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}%/s)`,
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
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 0, countLabel: '0 fragments', damageMult: 2.50, radius: 60 },
          { rank: 2, unlockLevel: 15, count: 4, countLabel: '4 fragments', damageMult: 2.80, radius: 68 },
          { rank: 3, unlockLevel: 30, count: 6, countLabel: '6 fragments', damageMult: 3.20, radius: 76 },
          { rank: 4, unlockLevel: 45, count: 8, countLabel: '8 fragments', damageMult: 3.60, radius: 84 },
        ],
        baseDamageMult: 2.50,
        damagePerLevel: 0.37,
        baseRadius: 60,
        radiusPerLevel: 8,
        scrapCost: 3,
        knockback: 50,
        baseCooldown: 6.0,
        cooldownFloor: 3.0,
        cooldownPerLevel: 0,
        staminaCost: 15,
        desc: 'Compress 3 orbiting pieces into a heavy metallic lump and hurl it (0 -> 8 fragments, 250% -> 360% ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasSpareParts = ownedNodes.includes('spareParts');
          const hasPileDriver = ownedNodes.includes('pileDriver');
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: hasPileDriver ? +(rk.damageMult + 1.50).toFixed(2) : rk.damageMult,
            radius: Math.round(rk.radius * (hasSpareParts ? 1.3 : 1.0)),
            scrapCost: hasSpareParts ? 2 : this.scrapCost,
            cooldown: this.baseCooldown,
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Fragments & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Blast Radius: ${cur.radius}px -> ${nxt.radius}px`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'scrapfall',
      hotkey: 'R',
      name: 'Catacomb Bone-Tempest',
      icon: 'scrapfall',
      totalDamageMult: 5.5, // 550% ATK
      radius: 160,
      stunDuration: 1.5,
      desc: 'Summon ancestral tombstones and colossus ribs from the earth over 1s, then crash them down for 550% ATK and a 1.5s Stun.',
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

  // =========================================================================
  // 4) KAELEN VOS — HELLFIRE DRAGOON
  // =========================================================================
  kaelen: {
    id: 'kaelen',
    name: 'Kaelen Vos',
    role: 'Hellfire Dragoon',
    accent: PALETTE.ember, // #FF5A26
    accentName: 'ember',
    pitch: 'Demon-forged dragoon who sweeps brimstone fire-cones and vents abyssal dragon-fury.',
    weaponName: 'Cinderlance & Brimstone Heart',
    weaponDesc: 'A dragon-forged obsidian greatlance fed by a blazing infernal crucible strapped to his back.',
    titles: {
      hand: 'Ashen Lancer',
      journeyman: {
        hellburner: 'Pyre-Knight',
        ironclad: 'Demonclad',
      },
      master: {
        hellburner: 'Brimstone Dragoon',
        ironclad: 'Infernal Tyrant',
      },
    },
    baseStats: {
      hp: 112,
      stamina: 60,
      atk: 11,
      def: 5,
      speed: 128,
      critChance: 0.08,
      critMult: 1.5,
    },
    perLevel: {
      hp: 13,
      stamina: 4,
      atk: 2,
      def: 1,
    },
    basicAttack: {
      type: 'flameSweep',
      fireRate: 2.6,
      reach: 95,
      arc: 1.55,
      damageMult: 1.15,
      pressureGain: 9,
    },
    mechanic: {
      id: 'boilerPressure',
      name: 'Boiler Pressure',
      maxPressure: 100,
      redZoneThreshold: 50,
      redZoneDamageBonus: 0.25,
      decayDelay: 3.5,
      decayPerSec: 8,
      ventCost: 40,
      desc: 'Attacks build Boiler Pressure (0-100%). At 50%+ (Red Gauge), attacks deal +25% damage and ignite Burn. Reaching 100% triggers Overheated Surge (+40% ATK, twin fire waves). Press [V] at 40%+ to Steam Vent.',
    },
    skills: [
      {
        id: 'naphthaJet',
        slot: 1,
        hotkey: '1',
        name: 'Naphtha Jet',
        icon: 'naphthaJet',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 fire pool', damageMult: 1.75, cooldown: 5.5 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 pools', damageMult: 2.00, cooldown: 5.0 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 pools', damageMult: 2.30, cooldown: 4.5 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 pools', damageMult: 2.55, cooldown: 4.0 },
        ],
        baseDamageMult: 1.75,
        damagePerLevel: 0.27,
        baseCooldown: 5.5,
        cooldownFloor: 2.75,
        cooldownPerLevel: -0.5,
        staminaCost: 12,
        dashDistance: 150,
        pressureGain: 22,
        desc: 'Rocket 150px forward on twin exhaust nozzles, leaving blazing naphtha pools (1 -> 4 pools, 175% -> 255% ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasFlashpoint = ownedNodes.includes('flashpoint');
          const rawCd = hasFlashpoint ? rk.cooldown * 0.7 : rk.cooldown;
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            cooldown: Math.max(this.cooldownFloor, +rawCd.toFixed(2)),
            staminaCost: this.staminaCost,
            dashDistance: this.dashDistance,
            pressureGain: this.pressureGain,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Pools & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'causticMortar',
        slot: 2,
        hotkey: '2',
        name: 'Caustic Mortar',
        icon: 'causticMortar',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 canister', damageMult: 1.90, radius: 110, cooldown: 7.5 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 canisters', damageMult: 2.15, radius: 120, cooldown: 7.0 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 canisters', damageMult: 2.45, radius: 130, cooldown: 6.5 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 canisters', damageMult: 2.70, radius: 140, cooldown: 6.0 },
        ],
        baseDamageMult: 1.90,
        damagePerLevel: 0.27,
        baseRadius: 110,
        radiusPerLevel: 10,
        baseCooldown: 7.5,
        cooldownFloor: 3.75,
        cooldownPerLevel: -0.5,
        staminaCost: 15,
        pressureGain: 25,
        desc: 'Lob pressurized lye-naphtha canisters (1 -> 4 canisters, 190% -> 270% ATK across Lv 1/15/30/45), inflicting Burn + Corrode.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasBackdraft = ownedNodes.includes('backdraft');
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            radius: rk.radius + (hasBackdraft ? 25 : 0),
            cooldown: Math.max(this.cooldownFloor, rk.cooldown),
            staminaCost: this.staminaCost,
            pressureGain: this.pressureGain,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Canisters & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Blast Radius: ${cur.radius}px -> ${nxt.radius}px`,
          ];
        },
      },
      {
        id: 'ventNova',
        slot: 3,
        hotkey: '3',
        name: 'Vent Supernova',
        icon: 'ventNova',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 ring', damageMult: 2.50, cooldown: 8.5 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 rings', damageMult: 2.85, cooldown: 7.9 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 rings', damageMult: 3.20, cooldown: 7.3 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 rings', damageMult: 3.50, cooldown: 6.7 },
        ],
        baseDamageMult: 2.50,
        damagePerLevel: 0.33,
        baseRadius: 140,
        baseCooldown: 8.5,
        cooldownFloor: 4.25,
        cooldownPerLevel: -0.6,
        staminaCost: 16,
        desc: 'Pull the boiler release valve! Detonates thermobaric nova rings (1 -> 4 rings, 250% -> 350% ATK across Lv 1/15/30/45), stunning for 1s and granting Slag Carapace.',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasMeltdown = ownedNodes.includes('meltdown');
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: +(rk.damageMult + (hasMeltdown ? 0.50 : 0)).toFixed(2),
            radius: this.baseRadius + (hasMeltdown ? 30 : 0),
            cooldown: Math.max(this.cooldownFloor, rk.cooldown),
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Rings & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'supercriticalMeltdown',
      hotkey: 'R',
      name: 'Avatar of the Hell-Drake',
      icon: 'supercriticalMeltdown',
      totalDamageMult: 14.5,
      radius: 240,
      duration: 8.0,
      desc: 'Unleashes the Hell-Drake Heart for 8.0s of Infernal Overdrive (+40% Move Speed, +50% Damage Reduction, CC Immunity). Leaves molten brimstone footprints, breathes a continuous 160px dragonfire torrent, and ends in a 240px hellfire eruption.',
    },
    passives: [
      {
        id: 'asbestosLining',
        name: 'Asbestos Lining',
        icon: 'asbestosLining',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+3 DEF and +10% Burn/Flame damage per level.',
        formatComparison(lvl, nextLvl) {
          return [`DEF & Flame Bonus: +${lvl * 3} DEF / +${lvl * 10}% -> +${nextLvl * 3} DEF / +${nextLvl * 10}%`];
        },
      },
      {
        id: 'draftBellows',
        name: 'Draft Bellows',
        icon: 'draftBellows',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+12% Stamina regen and +15% Pressure generation per level.',
        formatComparison(lvl, nextLvl) {
          return [`Stam Regen & Pressure: +${lvl * 12}% -> +${nextLvl * 12}%`];
        },
      },
    ],
    branches: {
      hellburner: {
        id: 'hellburner',
        journeymanTitle: 'Hellburner',
        masterTitle: 'Cremator',
        roleTag: 'Pyromania',
        summary: 'Superheated naphtha jets, faster Burn ticks, and cataclysmic solar furnace detonations.',
        overlayDesc: {
          journeyman: 'Twin brass pressure-relief chimneys + glowing ember fuel hoses.',
          master: 'White-hot furnace core visor + twin-pronged plasma igniter lance.',
        },
        journeymanNodes: [
          {
            id: 'flashpoint',
            name: 'Flashpoint',
            icon: 'flashpoint',
            tier: 2,
            cost: 2,
            desc: 'Naphtha Jet cooldown reduced by 30% and its fire pools deal +50% damage.',
          },
          {
            id: 'thermiteCore',
            name: 'Thermite Core',
            icon: 'thermiteCore',
            tier: 2,
            cost: 2,
            desc: 'Red Gauge activates at 35% Pressure instead of 50% and grants +35% bonus damage.',
          },
          {
            id: 'backdraft',
            name: 'Backdraft',
            icon: 'backdraft',
            tier: 2,
            cost: 2,
            desc: 'Caustic Mortar radius +25px and vacuum-pulls nearby enemies into the fireball.',
          },
        ],
        masterNodes: [
          {
            id: 'meltdown',
            name: 'Meltdown',
            icon: 'meltdown',
            tier: 3,
            cost: 3,
            desc: 'Vent Supernova deals +50% ATK, expands by +30px, and spawns 4 magma pools.',
          },
          {
            id: 'whitePhosphor',
            name: 'White Phosphor',
            icon: 'whitePhosphor',
            tier: 3,
            cost: 3,
            desc: 'At 50%+ Pressure, basic flame sweeps also inflict Corrode (-15% DEF) and launch a piercing slag wave.',
          },
          {
            id: 'crimsonSun',
            name: 'Crimson Sun',
            icon: 'crimsonSun',
            tier: 3,
            cost: 3,
            desc: 'Solar Kiln becomes Crimson Sun: 1150% total ATK across 320px with 8 orbital magma pillars.',
          },
        ],
      },
      ironclad: {
        id: 'ironclad',
        journeymanTitle: 'Slagclad',
        masterTitle: 'Furnace Lord',
        roleTag: 'Juggernaut',
        summary: 'Turns Boiler Pressure into heavy armor, self-repairing steam vents, and tectonic magma slams.',
        overlayDesc: {
          journeyman: 'Riveted boiler-plate shoulder armor + heavy cast-iron pressure shield.',
          master: 'Towering dreadnought furnace carapace with molten slag vents.',
        },
        journeymanNodes: [
          {
            id: 'pressurePlate',
            name: 'Pressure Plating',
            icon: 'pressurePlate',
            tier: 2,
            cost: 2,
            desc: 'Gain +3 DEF for every 25% Boiler Pressure currently held.',
          },
          {
            id: 'reliefValve',
            name: 'Relief Valve',
            icon: 'reliefValve',
            tier: 2,
            cost: 2,
            desc: 'Steam Vent [V] and Vent Supernova heal 12% Max HP and cleanse all debuffs.',
          },
          {
            id: 'slagWeld',
            name: 'Slag Weld',
            icon: 'slagWeld',
            tier: 2,
            cost: 2,
            desc: 'Naphtha Jet grants Slag Carapace (-25% damage taken for 4s) on arrival.',
          },
        ],
        masterNodes: [
          {
            id: 'boilerFortress',
            name: 'Boiler Fortress',
            icon: 'boilerFortress',
            tier: 3,
            cost: 3,
            desc: 'Immune to knockback while above 40% Pressure, and taking a hit builds +12% Pressure.',
          },
          {
            id: 'concussionRam',
            name: 'Concussion Ram',
            icon: 'concussionRam',
            tier: 3,
            cost: 3,
            desc: 'Vent Supernova stun duration increases to 2.0s and applies Exposed (-20% DEF for 6s).',
          },
          {
            id: 'hellboreEruption',
            name: 'Hellbore Eruption',
            icon: 'hellboreEruption',
            tier: 3,
            cost: 3,
            desc: 'Solar Kiln erupts tectonic magma pillars and grants 6s of Molten Juggernaut (-45% DMG taken, +30% ATK, searing magma pulses).',
          },
        ],
      },
    },
  },

  // =========================================================================
  // 5) VESPERA LOCKE — ELDRITCH SOULBINDER
  // =========================================================================
  vespera: {
    id: 'vespera',
    name: 'Vespera Locke',
    role: 'Eldritch Soulbinder',
    accent: PALETTE.volt, // #C9F24B
    accentName: 'volt',
    pitch: 'Occult coven weaver who commands hovering Familiar Skulls, runic obelisks, and eldritch lightning.',
    weaponName: 'Astral Grimoire & Halo Familiars',
    weaponDesc: 'A levitating forbidden tome and a starforged halo ring that binds spectral familiar wisps.',
    titles: {
      hand: 'Coven Initiate',
      journeyman: {
        overseer: 'Familiar Weaver',
        conduit: 'Rift-Caller',
      },
      master: {
        overseer: 'Grand Soulbinder',
        conduit: 'Astral Oracle',
      },
    },
    baseStats: {
      hp: 88,
      stamina: 85,
      atk: 10,
      def: 4,
      speed: 136,
      critChance: 0.10,
      critMult: 1.5,
    },
    perLevel: {
      hp: 10,
      stamina: 5,
      atk: 2,
      def: 0.6,
    },
    basicAttack: {
      type: 'chainLightning',
      fireRate: 2.8,
      range: 340,
      damageMult: 1.05,
      baseBounces: 2,
      bounceFalloff: 0.75,
    },
    mechanic: {
      id: 'droneSwarm',
      name: 'Arc-Drone Squadron',
      baseDrones: 3,
      droneFireInterval: 0.85,
      droneRange: 280,
      droneDamageMult: 0.55,
      maxPylonsBase: 2,
      desc: 'Commands 3 autonomous hovering Arc-Drones that auto-fire at enemies within 280px. Basic attacks unleash Chain Lightning (jumps to 2 extra enemies) and command all Drones & Pylons to focus-fire.',
    },
    skills: [
      {
        id: 'deployPylon',
        slot: 1,
        hotkey: '1',
        name: 'Tesla Pylon',
        icon: 'deployPylon',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 zap target', damageMult: 0.85, cooldown: 6.0 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 targets', damageMult: 1.00, cooldown: 5.5 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 targets', damageMult: 1.15, cooldown: 5.0 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 targets', damageMult: 1.33, cooldown: 4.5 },
        ],
        baseDamageMult: 0.85,
        damagePerLevel: 0.16,
        baseDuration: 12.0,
        radius: 155,
        baseCooldown: 6.0,
        cooldownFloor: 3.0,
        cooldownPerLevel: -0.5,
        staminaCost: 14,
        desc: 'Deploy an autonomous Tesla Pylon (12s, max 2) that zaps nearby foes (1 -> 4 targets, 85% -> 133% ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasSiege = ownedNodes.includes('siegePylons');
          return {
            rank: l,
            count: rk.count + (hasSiege ? 2 : 0),
            countLabel: rk.countLabel,
            damageMult: +(rk.damageMult + (hasSiege ? 0.30 : 0)).toFixed(2),
            duration: this.baseDuration + (hasSiege ? 6.0 : 0),
            radius: this.radius,
            cooldown: Math.max(this.cooldownFloor, rk.cooldown),
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Targets & Zap: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'seekerSwarm',
        slot: 2,
        hotkey: '2',
        name: 'Seeker Swarm',
        icon: 'seekerSwarm',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 4, countLabel: '4 micro-drones', damageMult: 1.75, cooldown: 8.0 },
          { rank: 2, unlockLevel: 15, count: 5, countLabel: '5 drones', damageMult: 2.00, cooldown: 7.4 },
          { rank: 3, unlockLevel: 30, count: 6, countLabel: '6 drones', damageMult: 2.30, cooldown: 6.8 },
          { rank: 4, unlockLevel: 45, count: 8, countLabel: '8 drones', damageMult: 2.55, cooldown: 6.2 },
        ],
        baseDamageMult: 1.75,
        damagePerLevel: 0.27,
        seekers: 4,
        baseCooldown: 8.0,
        cooldownFloor: 4.0,
        cooldownPerLevel: -0.6,
        staminaCost: 16,
        desc: 'Overdrive Drones and Pylons to emit a 130px EMP shockwave + launch homing Micro-Drones (4 -> 8 drones, 175% -> 255% ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasOverclock = ownedNodes.includes('overclockedSwarm');
          return {
            rank: l,
            count: rk.count + (hasOverclock ? 2 : 0),
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            seekers: rk.count + (hasOverclock ? 2 : 0),
            cooldown: Math.max(this.cooldownFloor, rk.cooldown),
            staminaCost: this.staminaCost,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Swarm & DMG: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
      {
        id: 'phaseBlink',
        slot: 3,
        hotkey: '3',
        name: 'Phase Blink',
        icon: 'phaseBlink',
        maxLevel: 4,
        costPerLevel: 0,
        rankTrack: [
          { rank: 1, unlockLevel: 1, count: 1, countLabel: '1 decoy blast', damageMult: 2.20, cooldown: 7.5 },
          { rank: 2, unlockLevel: 15, count: 2, countLabel: '2 blasts', damageMult: 2.55, cooldown: 6.9 },
          { rank: 3, unlockLevel: 30, count: 3, countLabel: '3 blasts', damageMult: 2.90, cooldown: 6.3 },
          { rank: 4, unlockLevel: 45, count: 4, countLabel: '4 blasts', damageMult: 3.20, cooldown: 5.7 },
        ],
        baseDamageMult: 2.20,
        damagePerLevel: 0.33,
        blinkDistance: 170,
        baseCooldown: 7.5,
        cooldownFloor: 3.75,
        cooldownPerLevel: -0.6,
        staminaCost: 14,
        desc: 'Teleport 170px in a flash of lightning and leave a Holo-Decoy behind that taunts foes before detonating (1 -> 4 blasts, 220% -> 320% ATK across Lv 1/15/30/45).',
        getStats(lvl = 1, ownedNodes = []) {
          const l = Math.max(1, Math.min(4, lvl));
          const rk = this.rankTrack[l - 1] || this.rankTrack[0];
          const hasStatic = ownedNodes.includes('staticField');
          const rawCd = hasStatic ? rk.cooldown * 0.65 : rk.cooldown;
          return {
            rank: l,
            count: rk.count,
            countLabel: rk.countLabel,
            damageMult: rk.damageMult,
            cooldown: Math.max(this.cooldownFloor, +rawCd.toFixed(2)),
            staminaCost: this.staminaCost,
            blinkDistance: this.blinkDistance,
          };
        },
        formatComparison(lvl, nextLvl, ownedNodes = []) {
          const cur = this.getStats(lvl, ownedNodes);
          const nxt = this.getStats(nextLvl, ownedNodes);
          return [
            `Decoy Blasts: ${cur.countLabel} (${Math.round(cur.damageMult * 100)}%) -> ${nxt.countLabel} (${Math.round(nxt.damageMult * 100)}% ATK)`,
            `Cooldown: ${cur.cooldown.toFixed(1)}s -> ${nxt.cooldown.toFixed(1)}s`,
          ];
        },
      },
    ],
    ultimate: {
      id: 'overclockedArmada',
      hotkey: 'R',
      name: 'Choir of Twelve Seraphim',
      icon: 'overclockedArmada',
      totalDamageMult: 15.0,
      radius: 260,
      duration: 8.0,
      desc: 'Summons 12 Eldritch Familiar Eyes orbiting in a double sigil ring for 8.0s. Familiars incinerate incoming projectiles within 140px, fire continuous astral beams near the cursor, and dive-bomb in a 12-star cataclysm on recast [R].',
    },
    passives: [
      {
        id: 'auxiliaryCore',
        name: 'Auxiliary Core',
        icon: 'auxiliaryCore',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+10% Drone & Chain Lightning damage and +2 DEF per level.',
        formatComparison(lvl, nextLvl) {
          return [`Arc DMG & DEF: +${lvl * 10}% / +${lvl * 2} DEF -> +${nextLvl * 10}% / +${nextLvl * 2} DEF`];
        },
      },
      {
        id: 'copperWindings',
        name: 'Copper Windings',
        icon: 'copperWindings',
        maxLevel: 3,
        costPerLevel: 1,
        desc: '+12% Stamina regen and +5 move speed per level.',
        formatComparison(lvl, nextLvl) {
          return [`Stam Regen & Speed: +${lvl * 12}% / +${lvl * 5} SPD -> +${nextLvl * 12}% / +${nextLvl * 5} SPD`];
        },
      },
    ],
    branches: {
      overseer: {
        id: 'overseer',
        journeymanTitle: 'Overseer',
        masterTitle: 'Architect',
        roleTag: 'Summoner',
        summary: 'Expands the autonomous Arc-Drone squadron, adds a 3rd Tesla Pylon, and weaves lethal laser grids.',
        overlayDesc: {
          journeyman: 'Dual dorsal drone-docking antennae + brass command gauntlet.',
          master: 'Halo of hovering micro-relays + high-voltage capacitor cloak.',
        },
        journeymanNodes: [
          {
            id: 'extraChassis',
            name: 'Extra Chassis',
            icon: 'extraChassis',
            tier: 2,
            cost: 2,
            desc: '+1 permanent Orbiting Arc-Drone (4 total) and +1 Max Tesla Pylon (3 total).',
          },
          {
            id: 'teslaGrid',
            name: 'Tesla Grid',
            icon: 'teslaGrid',
            tier: 2,
            cost: 2,
            desc: 'Laser tether beams between Pylons deal +60% damage and apply Slow 45%.',
          },
          {
            id: 'repairProtocol',
            name: 'Repair Protocol',
            icon: 'repairProtocol',
            tier: 2,
            cost: 2,
            desc: 'Drone and Pylon hits restore 1.5 Stamina, and kills heal Vespera for 2% Max HP.',
          },
        ],
        masterNodes: [
          {
            id: 'overclockedSwarm',
            name: 'Overclocked Swarm',
            icon: 'overclockedSwarm',
            tier: 3,
            cost: 3,
            desc: 'Orbiting Drones fire 40% faster, and Seeker Swarm launches 6 Micro-Drones instead of 4.',
          },
          {
            id: 'siegePylons',
            name: 'Siege Pylons',
            icon: 'siegePylons',
            tier: 3,
            cost: 3,
            desc: 'Tesla Pylons last 18s, deal +30% damage, and their zaps chain to 2 extra enemies.',
          },
          {
            id: 'orbitalGrid',
            name: 'Orbital Ion Grid',
            icon: 'orbitalGrid',
            tier: 3,
            cost: 3,
            desc: 'Ion Convergence deploys a persistent 8s hexagonal satellite cage that strikes 3 times for 1050% total ATK.',
          },
        ],
      },
      conduit: {
        id: 'conduit',
        journeymanTitle: 'Conduit',
        masterTitle: 'Stormcaller',
        roleTag: 'Chain Burst',
        summary: 'Turns Vespera into a high-voltage lightning weaver with rapid teleports and cascading arc novas.',
        overlayDesc: {
          journeyman: 'Copper arc-coils along both sleeves + glowing volt visor lens.',
          master: 'Crackling storm-crown array + twin-forked superconductor staff.',
        },
        journeymanNodes: [
          {
            id: 'highVoltage',
            name: 'High Voltage',
            icon: 'highVoltage',
            tier: 2,
            cost: 2,
            desc: 'Basic Chain Lightning jumps to +2 additional targets (4 jumps total) and applies Exposed.',
          },
          {
            id: 'staticField',
            name: 'Static Field',
            icon: 'staticField',
            tier: 2,
            cost: 2,
            desc: 'Phase Blink cooldown reduced by 35%, and Decoy detonation Stuns enemies for 1.2s.',
          },
          {
            id: 'capacitorSurge',
            name: 'Capacitor Surge',
            icon: 'capacitorSurge',
            tier: 2,
            cost: 2,
            desc: 'Every 4th basic attack unleashes a free 110px lightning nova around the primary target for 140% ATK.',
          },
        ],
        masterNodes: [
          {
            id: 'superconductor',
            name: 'Superconductor',
            icon: 'superconductor',
            tier: 3,
            cost: 3,
            desc: 'Chain Lightning suffers zero damage falloff on bounces and has +15% Crit Chance.',
          },
          {
            id: 'arcNova',
            name: 'Arc Cascade',
            icon: 'arcNova',
            tier: 3,
            cost: 3,
            desc: 'Seeker Swarm pulses twice and grants Vespera 4s of Arc Overcharge.',
          },
          {
            id: 'valkyrieProtocol',
            name: 'Valkyrie Protocol',
            icon: 'valkyrieProtocol',
            tier: 3,
            cost: 3,
            desc: 'Ion Convergence becomes Valkyrie Protocol: 1200% ATK 8-satellite orbital plasma obliteration across 280px.',
          },
        ],
      },
    },
  },
};

export const CLASS_ORDER = ['sena', 'rook', 'ines', 'kaelen', 'vespera'];
export const CLASS_LIST = [
  CLASSES.sena,
  CLASSES.rook,
  CLASSES.ines,
  CLASSES.kaelen,
  CLASSES.vespera,
];

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
