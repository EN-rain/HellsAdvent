/**
 * HellsAdvent — FloorManager, TerritoryManager, WorldEventLedger, & DialogueReactionResolver
 * Implements Sections 5, 6, 8 and Decisions D8, D13, D15, D17, D19, D43, D44, D49:
 * - Tracks Floor 1 progress and permanent confirmed boss kills (disables automatic boss respawn per D15).
 * - Optional Rematch Mode (D15, D44) with reduced non-exploitative rewards that never undo territory clears.
 * - Living Territories: tracks CONTROLLED -> CONTESTED -> BOSS_DEFEATED -> CLEARED states and coordination.
 * - Encounter-Entry Snapshot (D8, D19, D43): restores player HP/supplies/gold on boss wipe or mid-boss reload.
 * - Kettle Achievements, Cosmetics (titles & UI trim colors, zero combat buffs per D13), and Reactive Dialogue.
 */

import {
  KETTLE_ACHIEVEMENTS,
  REACTIVE_DIALOGUE,
  SUGGESTED_BOSS_ORDER,
} from '../data/expansionConfig.js';
import { ENEMIES_CONFIG, PALETTE } from '../data/config.js';
import {
  DARK_FANTASY_FLOORS,
  BOSS_BLOODLINES,
  FLOOR_BOSS_CHAINS,
  WANDERING_MERCHANT_CONFIG,
  CLEANSED_TERRITORY_NPCS,
  STORY_CAMPAIGN,
  SIDE_QUESTS,
} from '../data/darkFantasyConfig.js';
import { sound } from './Audio.js';

const SECTOR_KEYS = ['slabTown', 'route9', 'lyeMarsh', 'copperFlats'];
const SECTOR_TO_BOSS = {
  slabTown: 'theForeman',
  route9: 'bigAxle',
  lyeMarsh: 'motherSump',
  copperFlats: 'theLongDry',
};
const BOSS_TO_SECTOR = {
  theForeman: 'slabTown',
  bigAxle: 'route9',
  motherSump: 'lyeMarsh',
  theLongDry: 'copperFlats',
};

export class WorldLedger {
  constructor() {
    this.reset();
  }

  reset() {
    // Floor 0 = Duskhollow Town (Safe RPG Hub), Floors 1..5 = Abyssal Spire
    this.currentFloor = 0;
    this.highestUnlockedFloor = 1;
    this.floor1Cleared = false;
    this.floor1ClearBannerShown = false;
    this.clearedFloors = { 1: false, 2: false, 3: false, 4: false, 5: false };

    // Confirmed final boss kills for current active floor compatibility
    this.confirmedBossKills = {
      theForeman: false,
      bigAxle: false,
      motherSump: false,
      theLongDry: false,
    };

    // 3-Stage Boss Chain Progress per Floor (1..5) and Sector (0=Warden, 1=Executioner, 2=Overlord, 3=Cleansed)
    this.floorSectorChains = {};
    for (let fl = 1; fl <= 5; fl++) {
      this.floorSectorChains[fl] = {
        slabTown: { stage: 0, cleansed: false, npcSpawned: false },
        route9: { stage: 0, cleansed: false, npcSpawned: false },
        lyeMarsh: { stage: 0, cleansed: false, npcSpawned: false },
        copperFlats: { stage: 0, cleansed: false, npcSpawned: false },
      };
    }

    // All 60 Boss Bloodline Family Tree Kills (key: `${floor}_${sector}_${stageIndex}`)
    this.bloodlineKills = {};

    // Active Cleansed-Territory Pilgrim NPCs on current floor
    this.cleansedNpcs = [];

    // Active Corner Wandering Merchants on current floor
    this.wanderingMerchants = [];

    // Dual Floor-Clear Portals (spawned right beside player when all 4 territories on a floor are cleansed)
    this.spawnedPortals = [];

    // 5-Act Story Campaign & Quest State
    this.quests = {
      currentAct: 0, // 0 = Prologue in Duskhollow Town, 1..5 = Acts I..V
      prologueTalkedToMalakor: false,
      completedActs: {},
      sideQuests: {
        sq_catacomb_bones: { progress: 0, target: 12, completed: false, claimed: false },
        sq_bloodline_warden: { progress: 0, target: 4, completed: false, claimed: false },
        sq_frost_hearts: { progress: 0, target: 15, completed: false, claimed: false },
        sq_hellfire_cinders: { progress: 0, target: 3, completed: false, claimed: false },
        sq_rotwood_spores: { progress: 0, target: 20, completed: false, claimed: false },
        sq_void_sovereigns: { progress: 0, target: 4, completed: false, claimed: false },
      },
      suddenQuest: null, // { active, merchantId, title, timer, maxTimer, completed, failed }
    };

    // Living Territory States (Section 6)
    this.territories = {
      slabTown: {
        id: 'slabTown',
        bossId: 'theForeman',
        state: 'CONTROLLED',
        alertLevel: 35,
        coordinationLevel: 100,
      },
      route9: {
        id: 'route9',
        bossId: 'bigAxle',
        state: 'CONTROLLED',
        alertLevel: 30,
        coordinationLevel: 100,
      },
      lyeMarsh: {
        id: 'lyeMarsh',
        bossId: 'motherSump',
        state: 'CONTROLLED',
        alertLevel: 30,
        coordinationLevel: 100,
      },
      copperFlats: {
        id: 'copperFlats',
        bossId: 'theLongDry',
        state: 'CONTROLLED',
        alertLevel: 30,
        coordinationLevel: 100,
      },
    };

    this.milestones = {
      fusionsKilled: 0,
      fusionsInterrupted: 0,
      foremanNoRevive: false,
      ironForemanSlain: false,
      foremanReviveArrivals: 0,
      bigAxleCoreShattered: false,
      motherSumpStarved: false,
      motherSumpFeedsAllowed: 0,
      longDryShellBroken: false,
      recentBossDeaths: 0,
    };

    this.unlockedAchievements = {};
    this.equippedCosmeticTitle = null;
    this.equippedCosmeticTrim = null;
    this.activeBossEncounterSnapshot = null;
  }

  getFloorConfig(floorNum = this.currentFloor) {
    return DARK_FANTASY_FLOORS[floorNum] || DARK_FANTASY_FLOORS[1];
  }

  /**
   * Returns the current Boss Stage (0=Warden, 1=Executioner, 2=Overlord, 3=Cleansed) for a sector on the current floor.
   */
  getSectorStage(sectorId, floorNum = this.currentFloor) {
    if (floorNum <= 0) return 3;
    return this.floorSectorChains?.[floorNum]?.[sectorId]?.stage ?? 0;
  }

  /**
   * Returns the active Boss Chain metadata (name, title, stageLabel, hpMult, dmgMult, scaleMult) for a bossId on the current floor.
   */
  getActiveBossChainEntry(bossId, floorNum = this.currentFloor) {
    const fl = Math.max(1, Math.min(5, floorNum || 1));
    const sectorId = BOSS_TO_SECTOR[bossId] || 'slabTown';
    const stageIdx = Math.min(2, this.getSectorStage(sectorId, fl));
    const chain = FLOOR_BOSS_CHAINS?.[fl]?.[sectorId];
    const entry = chain?.[stageIdx] || {
      stageIndex: stageIdx,
      stageLabel: stageIdx === 0 ? 'I · Warden' : stageIdx === 1 ? 'II · Executioner' : 'III · Overlord',
      name: ENEMIES_CONFIG.bosses[bossId]?.name || bossId,
      title: 'Abyssal Sovereign',
      hpMult: stageIdx === 0 ? 0.65 : stageIdx === 1 ? 0.85 : 1.1,
      dmgMult: stageIdx === 0 ? 0.75 : stageIdx === 1 ? 0.9 : 1.08,
      scaleMult: stageIdx === 0 ? 0.86 : stageIdx === 1 ? 0.94 : 1.06,
    };
    return {
      ...entry,
      floor: fl,
      sectorId,
      stageIndex: stageIdx,
      isFinalStage: stageIdx >= 2,
      alreadyCleansed: this.getSectorStage(sectorId, fl) >= 3,
    };
  }

  /**
   * Transitions the player between Duskhollow Town (Floor 0) and Abyssal Spire Floors (1..5).
   */
  enterFloor(targetFloor, player = null, particles = null) {
    const floorNum = Math.max(0, Math.min(5, targetFloor));
    this.currentFloor = floorNum;
    this.activeBossEncounterSnapshot = null;
    this.spawnedPortals = [];
    this.cleansedNpcs = [];
    this.wanderingMerchants = [];
    this.quests.suddenQuest = null;

    if (floorNum === 0) {
      // Entering Duskhollow Town (Safe Haven)
      for (const k of SECTOR_KEYS) {
        this.territories[k].state = 'CLEARED';
        this.territories[k].alertLevel = 0;
      }
      if (player) {
        player.x = 3000;
        player.y = 3020;
        player.hp = player.maxHp;
        player.stamina = player.maxStamina;
      }
      return;
    }

    // Advance Story Campaign Act when entering a Tower Floor
    if (this.quests.currentAct < floorNum) {
      this.quests.currentAct = floorNum;
    }

    // Sync confirmedBossKills & territories for this floor
    const chainMap = this.floorSectorChains[floorNum] || {};
    for (const sectorId of SECTOR_KEYS) {
      const bossId = SECTOR_TO_BOSS[sectorId];
      const st = chainMap[sectorId]?.stage ?? 0;
      const isCleared = st >= 3;
      this.confirmedBossKills[bossId] = isCleared;
      this.territories[sectorId].state = isCleared ? 'CLEARED' : 'CONTROLLED';
      this.territories[sectorId].alertLevel = isCleared ? 10 : 35;
      this.territories[sectorId].coordinationLevel = isCleared ? 25 : 100;

      if (isCleared && chainMap[sectorId]?.npcSpawned) {
        this._spawnCleansedNpcForSector(sectorId, floorNum);
      }
    }

    // Roll 20% Corner Wandering Merchant spawns (with at least 1 corner merchant per Tower Floor run!)
    const corners = WANDERING_MERCHANT_CONFIG.corners || [];
    let spawnedCount = 0;
    for (let i = 0; i < corners.length; i++) {
      const c = corners[i];
      if (Math.random() < (WANDERING_MERCHANT_CONFIG.spawnChancePerCorner || 0.2)) {
        this._spawnCornerMerchant(c, floorNum);
        spawnedCount++;
      }
    }
    if (spawnedCount === 0 && corners.length > 0) {
      const pick = corners[Math.floor(Math.random() * corners.length)];
      this._spawnCornerMerchant(pick, floorNum);
    }

    // Always place a Return-to-Town Waystone Portal at the center crossroads (3000, 2930)
    this.spawnedPortals.push({
      id: `waystone_town_f${floorNum}`,
      type: 'town',
      targetFloor: 0,
      label: 'RETURN TO DUSKHOLLOW TOWN',
      sublabel: '[E] Step through Waystone Rift',
      x: 3000,
      y: 2915,
      color: '#D4AF37',
    });

    if (this.clearedFloors[floorNum] && floorNum < 5) {
      this.spawnedPortals.push({
        id: `waystone_next_f${floorNum}`,
        type: 'ascent',
        targetFloor: floorNum + 1,
        label: `ASCEND TO FLOOR ${floorNum + 1}`,
        sublabel: `[E] ${DARK_FANTASY_FLOORS[floorNum + 1]?.name || 'Next Floor'}`,
        x: 3000,
        y: 2845,
        color: '#00F0FF',
      });
    }

    if (player) {
      player.x = 3000;
      player.y = 3000;
    }
  }

  _spawnCornerMerchant(corner, floorNum) {
    const maxHp = 260 + floorNum * 110;
    this.wanderingMerchants.push({
      id: `merchant_${corner.id}_f${floorNum}`,
      cornerId: corner.id,
      cornerName: corner.name,
      name: WANDERING_MERCHANT_CONFIG.name,
      title: WANDERING_MERCHANT_CONFIG.title,
      x: corner.x,
      y: corner.y,
      hp: maxHp,
      maxHp,
      state: 'awaiting', // 'awaiting' -> 'defending' (30s sudden quest) -> 'protected' (repellent active) | 'fled'
      defenseTimer: WANDERING_MERCHANT_CONFIG.defenseDuration || 30,
      repellentActive: false,
      repellentRadius: WANDERING_MERCHANT_CONFIG.repellentRadius || 260,
      waveSpawnCooldown: 0,
    });
  }

  _spawnCleansedNpcForSector(sectorId, floorNum) {
    const bossId = SECTOR_TO_BOSS[sectorId];
    const bossCfg = ENEMIES_CONFIG.bosses[bossId];
    if (!bossCfg) return;
    const pool = CLEANSED_TERRITORY_NPCS || [];
    const template = pool[(floorNum + SECTOR_KEYS.indexOf(sectorId)) % pool.length] || {
      id: 'pilgrim',
      name: 'Sir Caelum the Undying',
      role: 'Cleansed Sanctuary Knight',
      greeting: 'This territory has been cleansed of the Bloodline curse. Take my blessing, Ascendant.',
    };
    this.cleansedNpcs.push({
      id: `cleansed_${sectorId}_f${floorNum}`,
      sectorId,
      name: template.name,
      role: template.role,
      greeting: template.greeting,
      buffType: template.buffType || 'blessing',
      x: bossCfg.arenaCenter.x,
      y: bossCfg.arenaCenter.y - 35,
      used: false,
    });
  }

  /**
   * Checks if any point (x, y) is inside an active Wandering Merchant Mob-Repellent Sanctuary Ward.
   */
  isInsideMobRepellentWard(x, y) {
    for (let i = 0; i < this.wanderingMerchants.length; i++) {
      const m = this.wanderingMerchants[i];
      if (m.repellentActive && m.state === 'protected') {
        const dx = x - m.x;
        const dy = y - m.y;
        if (dx * dx + dy * dy <= m.repellentRadius * m.repellentRadius) {
          return true;
        }
      }
    }
    return false;
  }

  recordMobKillForQuests(enemy, floorNum = this.currentFloor) {
    const sq = this.quests.sideQuests;
    if (floorNum === 1 && sq.sq_catacomb_bones && !sq.sq_catacomb_bones.completed) {
      sq.sq_catacomb_bones.progress = Math.min(sq.sq_catacomb_bones.target, sq.sq_catacomb_bones.progress + 1);
      if (sq.sq_catacomb_bones.progress >= sq.sq_catacomb_bones.target) sq.sq_catacomb_bones.completed = true;
    }
    if (floorNum === 2 && sq.sq_frost_hearts && !sq.sq_frost_hearts.completed) {
      sq.sq_frost_hearts.progress = Math.min(sq.sq_frost_hearts.target, sq.sq_frost_hearts.progress + 1);
      if (sq.sq_frost_hearts.progress >= sq.sq_frost_hearts.target) sq.sq_frost_hearts.completed = true;
    }
    if (floorNum === 4 && sq.sq_rotwood_spores && !sq.sq_rotwood_spores.completed) {
      sq.sq_rotwood_spores.progress = Math.min(sq.sq_rotwood_spores.target, sq.sq_rotwood_spores.progress + 1);
      if (sq.sq_rotwood_spores.progress >= sq.sq_rotwood_spores.target) sq.sq_rotwood_spores.completed = true;
    }
  }

  captureBossEntrySnapshot(bossId, player, isRematch = false) {
    if (!player) return;
    if (this.activeBossEncounterSnapshot && this.activeBossEncounterSnapshot.bossId === bossId) {
      return;
    }
    this.activeBossEncounterSnapshot = {
      bossId,
      isRematch,
      hp: player.hp,
      stamina: player.stamina,
      gold: player.gold,
      supplies: { ...player.supplies },
      ultimateCharge: player.ultimateCharge,
    };

    for (const terr of Object.values(this.territories)) {
      if (terr.bossId === bossId && terr.state === 'CONTROLLED') {
        terr.state = 'CONTESTED';
        terr.alertLevel = 85;
      }
    }
  }

  restoreBossEntrySnapshot(player) {
    if (!this.activeBossEncounterSnapshot || !player) return false;
    const snap = this.activeBossEncounterSnapshot;
    player.gold = snap.gold;
    player.supplies = { ...snap.supplies };
    player.ultimateCharge = snap.ultimateCharge;
    this.milestones.recentBossDeaths = (this.milestones.recentBossDeaths || 0) + 1;

    for (const terr of Object.values(this.territories)) {
      if (terr.bossId === snap.bossId && !this.confirmedBossKills[snap.bossId]) {
        terr.state = 'CONTROLLED';
      }
    }

    this.activeBossEncounterSnapshot = null;
    return true;
  }

  clearBossEntrySnapshot() {
    this.activeBossEncounterSnapshot = null;
  }

  /**
   * Records a Boss Chain stage kill (Stage 0 Warden -> Stage 1 Executioner -> Stage 2 Overlord).
   * When Stage 2 Overlord falls:
   * - Cleanses the territory
   * - Rolls 20% chance to spawn a Cleansed-Territory Pilgrim NPC
   * - Checks if all 4 territories on this Floor are cleansed; if so, spawns Dual Portals right beside the player!
   */
  recordConfirmedBossVictory(bossId, details = {}, particles = null, player = null) {
    const fl = Math.max(1, Math.min(5, this.currentFloor || 1));
    const sectorId = BOSS_TO_SECTOR[bossId] || 'slabTown';
    if (!this.floorSectorChains[fl]) {
      this.floorSectorChains[fl] = {
        slabTown: { stage: 0, cleansed: false, npcSpawned: false },
        route9: { stage: 0, cleansed: false, npcSpawned: false },
        lyeMarsh: { stage: 0, cleansed: false, npcSpawned: false },
        copperFlats: { stage: 0, cleansed: false, npcSpawned: false },
      };
    }
    const sectorChain = this.floorSectorChains[fl][sectorId];
    const currentStage = sectorChain.stage;
    const bloodlineKey = `${fl}_${sectorId}_${ Math.min(2, currentStage) }`;
    this.bloodlineKills[bloodlineKey] = true;
    this.activeBossEncounterSnapshot = null;

    // Update Side Quests for Boss Bloodlines
    const sq = this.quests.sideQuests;
    if (currentStage === 0 && sq.sq_bloodline_warden && !sq.sq_bloodline_warden.completed) {
      sq.sq_bloodline_warden.progress = Math.min(sq.sq_bloodline_warden.target, sq.sq_bloodline_warden.progress + 1);
      if (sq.sq_bloodline_warden.progress >= sq.sq_bloodline_warden.target) sq.sq_bloodline_warden.completed = true;
    }
    if (fl === 3 && sq.sq_hellfire_cinders && !sq.sq_hellfire_cinders.completed) {
      sq.sq_hellfire_cinders.progress = Math.min(sq.sq_hellfire_cinders.target, sq.sq_hellfire_cinders.progress + 1);
      if (sq.sq_hellfire_cinders.progress >= sq.sq_hellfire_cinders.target) sq.sq_hellfire_cinders.completed = true;
    }

    // If Stage 0 (Warden) or Stage 1 (Executioner), advance to the next boss in the 3-boss territory chain!
    if (currentStage < 2) {
      sectorChain.stage = currentStage + 1;
      const nextEntry = this.getActiveBossChainEntry(bossId, fl);
      if (particles && player) {
        particles.spawnFloatingText(
          player.x,
          player.y - 48,
          `BLOODLINE AWAKENS: ${nextEntry.name.toUpperCase()}`,
          '#FFC83D'
        );
      }
      return {
        firstTimeClear: true,
        stageAdvanced: true,
        nextStageIndex: sectorChain.stage,
        nextBossName: nextEntry.name,
        floor1JustCleared: false,
      };
    }

    // Stage 2 (Overlord) defeated! Territory is now CLEANSED (stage = 3)
    const wasAlreadyCleared = !!this.confirmedBossKills[bossId];
    sectorChain.stage = 3;
    sectorChain.cleansed = true;
    this.confirmedBossKills[bossId] = true;
    this.milestones.recentBossDeaths = 0;

    if (fl === 5 && sq.sq_void_sovereigns && !sq.sq_void_sovereigns.completed) {
      sq.sq_void_sovereigns.progress = Math.min(sq.sq_void_sovereigns.target, sq.sq_void_sovereigns.progress + 1);
      if (sq.sq_void_sovereigns.progress >= sq.sq_void_sovereigns.target) sq.sq_void_sovereigns.completed = true;
    }

    for (const terr of Object.values(this.territories)) {
      if (terr.bossId === bossId) {
        terr.state = 'CLEARED';
        terr.alertLevel = 10;
        terr.coordinationLevel = 25;
      }
    }

    // 20% Chance (or guaranteed first cleanse on floor) to spawn a Cleansed-Territory Sanctuary NPC!
    const anyNpcYet = this.cleansedNpcs.length > 0;
    if (!sectorChain.npcSpawned && (Math.random() < 0.2 || !anyNpcYet)) {
      sectorChain.npcSpawned = true;
      this._spawnCleansedNpcForSector(sectorId, fl);
      if (particles && player) {
        particles.spawnFloatingText(
          player.x,
          player.y - 60,
          'SANCTUARY PILGRIM APPEARED IN CLEANSED TERRITORY!',
          '#00F0FF'
        );
      }
    }

    // Specific boss milestone tracking
    if (bossId === 'theForeman') {
      if (details.revived) {
        this.milestones.ironForemanSlain = true;
        this.milestones.foremanReviveArrivals = details.arrivals || 10;
        this._unlockAchievement('ironForemanSlain', particles, player);
      } else {
        this.milestones.foremanNoRevive = true;
        this._unlockAchievement('foremanNoRevive', particles, player);
      }
    } else if (bossId === 'bigAxle') {
      this.milestones.bigAxleCoreShattered = true;
      this._unlockAchievement('bigAxleCoreShattered', particles, player);
    } else if (bossId === 'motherSump') {
      this.milestones.motherSumpStarved = true;
      this.milestones.motherSumpFeedsAllowed = details.feedsAllowed ?? 0;
      this._unlockAchievement('motherSumpStarved', particles, player);
    } else if (bossId === 'theLongDry') {
      this.milestones.longDryShellBroken = true;
      this._unlockAchievement('longDryShellBroken', particles, player);
    }

    const allFourDead =
      this.confirmedBossKills.theForeman &&
      this.confirmedBossKills.bigAxle &&
      this.confirmedBossKills.motherSump &&
      this.confirmedBossKills.theLongDry;

    let floorJustCleared = false;
    if (allFourDead) {
      floorJustCleared = !this.clearedFloors[fl];
      this.clearedFloors[fl] = true;
      this.quests.completedActs[fl] = true;
      if (fl === 1 && !this.floor1Cleared) {
        this.floor1Cleared = true;
        this._unlockAchievement('floor1Cleared', particles, player);
      }
      if (fl < 5 && this.highestUnlockedFloor < fl + 1) {
        this.highestUnlockedFloor = fl + 1;
      }

      // Spawn Dual Portals RIGHT BESIDE THE PLAYER: Next Floor Ascent Portal + Return to Duskhollow Town Portal!
      const px = player ? player.x : 3000;
      const py = player ? player.y : 3000;
      this.spawnedPortals = this.spawnedPortals.filter((p) => !p.id.startsWith('boss_clear_'));

      if (fl < 5) {
        const nextFl = fl + 1;
        const nextName = DARK_FANTASY_FLOORS[nextFl]?.name || `Floor ${nextFl}`;
        this.spawnedPortals.push({
          id: `boss_clear_ascent_f${fl}`,
          type: 'ascent',
          targetFloor: nextFl,
          label: `FLOOR ${nextFl} ASCENT PORTAL`,
          sublabel: `[E] Ascend to ${nextName}`,
          x: px + 68,
          y: py - 12,
          color: '#00F0FF',
        });
      }
      this.spawnedPortals.push({
        id: `boss_clear_town_f${fl}`,
        type: 'town',
        targetFloor: 0,
        label: 'DUSKHOLLOW TOWN PORTAL',
        sublabel: '[E] Return to Safe Haven',
        x: px - 68,
        y: py - 12,
        color: '#D4AF37',
      });
    }

    return {
      firstTimeClear: !wasAlreadyCleared,
      stageAdvanced: false,
      floor1JustCleared: floorJustCleared,
      clearedFloorNumber: fl,
    };
  }

  recordFusionBossKilled(particles = null, player = null) {
    this.milestones.fusionsKilled = (this.milestones.fusionsKilled || 0) + 1;
    if (this.milestones.fusionsKilled === 1) {
      this._unlockAchievement('firstFusionSlain', particles, player);
    }
  }

  recordFusionInterrupted(particles = null, player = null) {
    this.milestones.fusionsInterrupted = (this.milestones.fusionsInterrupted || 0) + 1;
    if (this.milestones.fusionsInterrupted >= 3) {
      this._unlockAchievement('fusionDisruptor', particles, player);
    }
  }

  _unlockAchievement(achId, particles = null, player = null) {
    if (this.unlockedAchievements[achId]) return;
    const def = KETTLE_ACHIEVEMENTS[achId];
    if (!def) return;

    this.unlockedAchievements[achId] = {
      unlockedAt: Date.now(),
    };

    if (!this.equippedCosmeticTitle) {
      this.equippedCosmeticTitle = def.cosmeticTitle;
      this.equippedCosmeticTrim = def.trimColor;
    }

    sound.playLevelUp?.();
    if (particles && player) {
      particles.spawnFloatingText(
        player.x,
        player.y - 42,
        `ACHIEVEMENT: ${def.title.toUpperCase()}`,
        def.trimColor || PALETTE.brass
      );
    }
  }

  equipCosmetic(achId) {
    if (!achId) {
      this.equippedCosmeticTitle = null;
      this.equippedCosmeticTrim = null;
      return;
    }
    if (!this.unlockedAchievements[achId]) return;
    const def = KETTLE_ACHIEVEMENTS[achId];
    if (def) {
      this.equippedCosmeticTitle = def.cosmeticTitle;
      this.equippedCosmeticTrim = def.trimColor;
    }
  }

  getReactiveDialogue(npcKey = 'ume') {
    const list = REACTIVE_DIALOGUE[npcKey] || [];
    const matching = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      try {
        if (item.check(this)) {
          matching.push(item);
        }
      } catch {
        // Ignore check error
      }
    }
    matching.sort((a, b) => b.priority - a.priority);
    return matching.length > 0 ? matching[0].text : null;
  }

  getSuggestedNextBoss() {
    for (let i = 0; i < SUGGESTED_BOSS_ORDER.length; i++) {
      const bossId = SUGGESTED_BOSS_ORDER[i];
      if (!this.confirmedBossKills[bossId]) {
        return ENEMIES_CONFIG.bosses[bossId] || null;
      }
    }
    return null;
  }

  /**
   * Returns the active Main Story Quest description for the HUD Quest Tracker & [J] Journal.
   */
  getActiveMainQuestSummary() {
    if (this.currentFloor === 0 && !this.quests.prologueTalkedToMalakor && !this.clearedFloors[1]) {
      return {
        actTitle: 'Prologue · The Ashen Oath',
        objective: 'Explore Duskhollow Town & Enter the Top-Center Abyssal Spire',
        detail: 'Visit the 6 RPG buildings or walk north to the Abyssal Tower Gatehouse (3000, 2560).',
      };
    }
    const actIdx = Math.max(1, Math.min(5, this.currentFloor || this.highestUnlockedFloor || 1));
    const actData = STORY_CAMPAIGN.find((a) => a.floor === actIdx) || STORY_CAMPAIGN[1];
    const chainMap = this.floorSectorChains[actIdx] || {};
    let cleansedCount = 0;
    let totalStages = 0;
    for (const k of SECTOR_KEYS) {
      const st = chainMap[k]?.stage ?? 0;
      totalStages += Math.min(3, st);
      if (st >= 3) cleansedCount++;
    }
    return {
      actTitle: `${actData?.act || `Act ${actIdx}`} · ${actData?.title || 'Abyssal Ascent'}`,
      objective:
        cleansedCount >= 4
          ? `Floor ${actIdx} Cleansed! Step into the Ascent Portal`
          : `Cleanse Floor ${actIdx} Territories (${cleansedCount}/4 Sectors · ${totalStages}/12 Bosses)`,
      detail: actData?.synopsis || 'Sever the Warden, Executioner, and Overlord in each sector.',
    };
  }

  getActiveStoryQuest() {
    return this.getActiveMainQuestSummary();
  }

  talkToMalakor(player = null, particles = null) {
    if (!this.quests.prologueTalkedToMalakor) {
      this.quests.prologueTalkedToMalakor = true;
      if (player) {
        player.gainXpAndGold?.(25, 100, particles);
      }
      sound.playLevelUp?.();
      if (particles && player) {
        particles.spawnFloatingText?.(
          player.x,
          player.y - 36,
          'PROLOGUE: HUNTSMAN CONTRACT SIGNED (+100G)!',
          PALETTE.brass
        );
      }
    }
  }

  claimQuestReward(questId, player = null, particles = null) {
    // 1. Check side quests
    const sq = this.quests.sideQuests?.[questId];
    if (sq && sq.completed && !sq.claimed) {
      sq.claimed = true;
      const def = SIDE_QUESTS.find((q) => q.id === questId);
      const gold = def?.rewardGold || 180;
      const xp = def?.rewardXp || 60;
      if (player) {
        player.gainXpAndGold?.(xp, gold, particles);
      }
      sound.playLevelUp?.();
      if (particles && player) {
        particles.spawnShockwave?.(player.x, player.y, 80, PALETTE.brass, 0.4);
        particles.spawnFloatingText?.(
          player.x,
          player.y - 40,
          `REWARD CLAIMED: +${gold}G!`,
          PALETTE.brass
        );
      }
      return { ok: true, gold, xp, quest: def };
    }

    // 2. Check completed Story Act claims
    if (questId?.startsWith?.('act_')) {
      const actIdx = parseInt(questId.replace('act_', ''), 10);
      const actDef = STORY_CAMPAIGN.find((a) => a.act === actIdx);
      if (actDef && this.clearedFloors[actIdx] && !this.quests.completedActs[actIdx]) {
        this.quests.completedActs[actIdx] = true;
        const gold = actDef.rewardGold || 350;
        const xp = actDef.rewardXp || 120;
        if (player) {
          player.gainXpAndGold?.(xp, gold, particles);
        }
        sound.playLevelUp?.();
        if (particles && player) {
          particles.spawnShockwave?.(player.x, player.y, 110, '#c084fc', 0.5);
          particles.spawnFloatingText?.(
            player.x,
            player.y - 45,
            `ACT VICTORY: +${gold}G!`,
            '#c084fc'
          );
        }
        return { ok: true, gold, xp, quest: actDef };
      }
    }

    return { ok: false, reason: 'Quest not completed or already claimed.' };
  }

  getQuestStatusSummary() {
    let readyToClaimCount = 0;
    const sqList = Object.entries(this.quests.sideQuests || {}).map(([id, st]) => {
      const def = SIDE_QUESTS.find((q) => q.id === id) || { id, title: id, target: st.target || 10 };
      if (st.completed && !st.claimed) readyToClaimCount++;
      return {
        ...def,
        progress: st.progress || 0,
        completed: !!st.completed,
        claimed: !!st.claimed,
      };
    });

    const actsList = STORY_CAMPAIGN.map((act) => {
      const isCleared = act.act === 0 ? this.quests.prologueTalkedToMalakor || this.clearedFloors[1] : !!this.clearedFloors[act.floor];
      const isClaimed = !!this.quests.completedActs[act.act];
      if (isCleared && !isClaimed) readyToClaimCount++;
      return {
        ...act,
        completed: isCleared,
        claimed: isClaimed,
      };
    });

    return {
      readyToClaimCount,
      sideQuests: sqList,
      storyActs: actsList,
      suddenQuest: this.quests.suddenQuest ? { ...this.quests.suddenQuest } : null,
      activeMainSummary: this.getActiveMainQuestSummary(),
    };
  }

  travelToFloor(targetFloor, player = null, particles = null) {
    return this.enterFloor(targetFloor, player, particles);
  }

  toJSON() {
    return {
      currentFloor: this.currentFloor,
      highestUnlockedFloor: this.highestUnlockedFloor,
      floor1Cleared: this.floor1Cleared,
      floor1ClearBannerShown: this.floor1ClearBannerShown,
      clearedFloors: { ...this.clearedFloors },
      confirmedBossKills: { ...this.confirmedBossKills },
      floorSectorChains: JSON.parse(JSON.stringify(this.floorSectorChains)),
      bloodlineKills: { ...this.bloodlineKills },
      quests: {
        currentAct: this.quests.currentAct,
        prologueTalkedToMalakor: this.quests.prologueTalkedToMalakor,
        completedActs: { ...this.quests.completedActs },
        sideQuests: JSON.parse(JSON.stringify(this.quests.sideQuests)),
      },
      territories: JSON.parse(JSON.stringify(this.territories)),
      milestones: { ...this.milestones },
      unlockedAchievements: { ...this.unlockedAchievements },
      equippedCosmeticTitle: this.equippedCosmeticTitle,
      equippedCosmeticTrim: this.equippedCosmeticTrim,
    };
  }

  fromJSON(data) {
    if (!data) return;
    this.currentFloor = data.currentFloor ?? 0;
    this.highestUnlockedFloor = data.highestUnlockedFloor || 1;
    this.floor1Cleared = !!data.floor1Cleared;
    this.floor1ClearBannerShown = !!data.floor1ClearBannerShown;
    if (data.clearedFloors) {
      this.clearedFloors = { ...this.clearedFloors, ...data.clearedFloors };
    }
    if (data.confirmedBossKills) {
      this.confirmedBossKills = {
        ...this.confirmedBossKills,
        ...data.confirmedBossKills,
      };
    }
    if (data.floorSectorChains) {
      for (let fl = 1; fl <= 5; fl++) {
        if (data.floorSectorChains[fl]) {
          this.floorSectorChains[fl] = {
            ...this.floorSectorChains[fl],
            ...data.floorSectorChains[fl],
          };
        }
      }
    }
    if (data.bloodlineKills) {
      this.bloodlineKills = { ...data.bloodlineKills };
    }
    if (data.quests) {
      this.quests.currentAct = data.quests.currentAct ?? 0;
      this.quests.prologueTalkedToMalakor = !!data.quests.prologueTalkedToMalakor;
      if (data.quests.completedActs) {
        this.quests.completedActs = { ...data.quests.completedActs };
      }
      if (data.quests.sideQuests) {
        for (const [k, v] of Object.entries(data.quests.sideQuests)) {
          if (this.quests.sideQuests[k]) {
            this.quests.sideQuests[k] = { ...this.quests.sideQuests[k], ...v };
          }
        }
      }
    }
    if (data.territories) {
      for (const k of Object.keys(this.territories)) {
        if (data.territories[k]) {
          this.territories[k] = { ...this.territories[k], ...data.territories[k] };
        }
      }
    }
    if (data.milestones) {
      this.milestones = { ...this.milestones, ...data.milestones };
    }
    if (data.unlockedAchievements) {
      this.unlockedAchievements = { ...data.unlockedAchievements };
    }
    this.equippedCosmeticTitle = data.equippedCosmeticTitle || null;
    this.equippedCosmeticTrim = data.equippedCosmeticTrim || null;
    this.activeBossEncounterSnapshot = null;
  }
}

export const worldLedger = new WorldLedger();
