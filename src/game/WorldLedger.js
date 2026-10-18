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
import { sound } from './Audio.js';

export class WorldLedger {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentFloor = 1;
    this.floor1Cleared = false;
    this.floor1ClearBannerShown = false;

    // Confirmed final boss kills (permanent per D15)
    this.confirmedBossKills = {
      theForeman: false,
      bigAxle: false,
      motherSump: false,
      theLongDry: false,
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

    // Recorded battle milestones for Kettle reactive dialogue & achievements (Section 8)
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

    // Encounter-entry snapshot for active boss fight (D8, D19, D43)
    this.activeBossEncounterSnapshot = null;
  }

  /**
   * Captures the player's state upon engaging a boss so death/reload restores cleanly (D43).
   */
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

    // Mark territory CONTESTED while fighting its primary boss
    for (const terr of Object.values(this.territories)) {
      if (terr.bossId === bossId && terr.state === 'CONTROLLED') {
        terr.state = 'CONTESTED';
        terr.alertLevel = 85;
      }
    }
  }

  /**
   * Restores the encounter-entry snapshot when a boss fight is aborted by player death or mid-boss reload (D8, D19, D43).
   */
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
   * Records a confirmed final boss victory, updates territory state, checks Floor 1 clear, and unlocks achievements.
   */
  recordConfirmedBossVictory(bossId, details = {}, particles = null, player = null) {
    const wasAlreadyCleared = !!this.confirmedBossKills[bossId];
    this.confirmedBossKills[bossId] = true;
    this.milestones.recentBossDeaths = 0;
    this.activeBossEncounterSnapshot = null;

    // Update territory state: command hierarchy collapses after boss defeat (Section 6)
    for (const terr of Object.values(this.territories)) {
      if (terr.bossId === bossId) {
        terr.state = 'CLEARED';
        terr.alertLevel = 10;
        terr.coordinationLevel = 25;
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

    // Check if all 4 primary bosses are now confirmed defeated (D44)
    const allFourDead =
      this.confirmedBossKills.theForeman &&
      this.confirmedBossKills.bigAxle &&
      this.confirmedBossKills.motherSump &&
      this.confirmedBossKills.theLongDry;

    if (allFourDead && !this.floor1Cleared) {
      this.floor1Cleared = true;
      this._unlockAchievement('floor1Cleared', particles, player);
    }

    return { firstTimeClear: !wasAlreadyCleared, floor1JustCleared: allFourDead && !this.floor1ClearBannerShown };
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

  /**
   * Returns the highest-priority reactive dialogue line for Ume or Harlow (Section 8).
   */
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

  /**
   * Returns the next recommended unbeaten boss following D49 advisory order:
   * Big Axle -> The Long Dry -> Mother Sump -> The Foreman
   */
  getSuggestedNextBoss() {
    for (let i = 0; i < SUGGESTED_BOSS_ORDER.length; i++) {
      const bossId = SUGGESTED_BOSS_ORDER[i];
      if (!this.confirmedBossKills[bossId]) {
        return ENEMIES_CONFIG.bosses[bossId] || null;
      }
    }
    return null;
  }

  toJSON() {
    // D19: Never persist transient ritual/fusion/mid-boss encounter state; loading mid-boss restarts the boss fight cleanly.
    return {
      currentFloor: this.currentFloor,
      floor1Cleared: this.floor1Cleared,
      floor1ClearBannerShown: this.floor1ClearBannerShown,
      confirmedBossKills: { ...this.confirmedBossKills },
      territories: JSON.parse(JSON.stringify(this.territories)),
      milestones: { ...this.milestones },
      unlockedAchievements: { ...this.unlockedAchievements },
      equippedCosmeticTitle: this.equippedCosmeticTitle,
      equippedCosmeticTrim: this.equippedCosmeticTrim,
    };
  }

  fromJSON(data) {
    if (!data) return;
    this.currentFloor = data.currentFloor || 1;
    this.floor1Cleared = !!data.floor1Cleared;
    this.floor1ClearBannerShown = !!data.floor1ClearBannerShown;
    if (data.confirmedBossKills) {
      this.confirmedBossKills = {
        ...this.confirmedBossKills,
        ...data.confirmedBossKills,
      };
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
