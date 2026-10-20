/**
 * GRAVEL SKY — Multi-Class Player Entity (Sena Ibuki, Rook Matsuda, Ines Calloway)
 * - Coordinates class behavior modules (/src/game/classes/Melee.js, Ranged.js, Mage.js),
 *   StatusSystem (/src/game/Status.js), 3-stage promotion & branch nodes, equipment, and supplies.
 * - Renders 48x48 4-direction sprites, Sena's 6-segment simulated scarf, class extras,
 *   and status effect visuals on the 480x270 integer pixel canvas.
 */

import {
  PALETTE,
  PLAYER_CONFIG,
  WORLD_CONFIG,
  SHOP_ITEMS,
} from '../data/config.js';
import {
  CLASSES,
  getClassConfig,
  getCharacterTitleAndStage,
} from '../data/classes.js';
import { StatusSystem, computeDamagePipeline } from './Status.js';
import { MeleeBehavior } from './classes/Melee.js';
import { RangedBehavior } from './classes/Ranged.js';
import { MageBehavior } from './classes/Mage.js';
import { PyroBehavior } from './classes/Pyro.js';
import { ArtificerBehavior } from './classes/Artificer.js';
import {
  angleTo4Facing,
  drawPixelLine,
  drawBresenhamCircle,
} from './PixelArt.js';
import { bakePlayerSprites, spriteRegistry } from './Sprites.js';
import { sound } from './Audio.js';
import { UltimateSequencer } from './Ultimates.js';
import { obstacleManager } from './Obstacles.js';
import { tacticalSystem } from './TacticalAI.js';
import {
  CHARACTERS,
  SPECIALIZATIONS,
  getAllSkillsForCharacter,
  getLearnedSkillsForCharacter,
  getDefaultSkillSlots,
  getDefaultPresets,
  getIntrinsicTraitRank,
  getClassTraitRank,
} from '../data/classChangeData.js';
import { CLASS_TREES, getSpecTree } from '../data/talentTreeData.js';
import { worldLedger } from './WorldLedger.js';
import { WANDERING_MERCHANT_STOCK, DUSKHOLLOW_TOWN } from '../data/darkFantasyConfig.js';
import {
  inferSkillDamageType,
  inferIncomingPlayerDamageType,
} from '../utils/hudHelpers.js';

export class Player {
  constructor(classId = 'sena') {
    spriteRegistry.init();

    this.x = DUSKHOLLOW_TOWN?.spawnPoint?.x ?? 3000;
    this.y = DUSKHOLLOW_TOWN?.spawnPoint?.y ?? 3040;
    this.vx = 0;
    this.vy = 0;
    this.radius = 12;

    // Class, Stage (1=Hand, 2=Journeyman, 3=Master), and Branch
    this.classId = classId;
    this.stage = 1;
    this.branch = null;

    // Progression & Economy
    this.level = 1;
    this.xp = 0;
    this.xpToNext = PLAYER_CONFIG.xpForNextLevel(1);
    this.gold = 120;
    this.skillPoints = 1; // Starts with 1 point so player can immediately test the Skill Tree

    // Skills (Lv 1..5), Passives (Lv 0..3), and Owned Branch Nodes
    this.skills = {};
    this.passives = {};
    this.ownedNodes = [];

    // Equipment & Supplies
    this.equipped = {
      head: null,
      body: null,
      legs: null,
    };
    this.ownedEquipment = [];
    this.supplies = {
      gauzeRoll: 2,
      sugarTin: 1,
      lyeWash: 1,
      hotStew: 0,
      stimStick: 0,
    };

    // Dark Fantasy Tavern Meal Buff & Wandering Merchant Relics/Elixirs
    this.tavernMeal = null; // { id, name, hpBonusPct, atkBonusPct, defBonus, xpBonusPct, timer }
    this.cursedRelics = []; // array of relic item IDs from Wandering Merchant
    this.elixirBuff = null; // { id, name, xpMult, goldMult, timer }

    // Status Effect System
    this.statuses = new StatusSystem('player');

    // Combat stats
    this.maxHp = 120;
    this.hp = 120;
    this.maxStamina = 50;
    this.stamina = 50;
    this.baseAtkForPipeline = 12;
    this.atk = 12;
    this.baseDefForPipeline = 6;
    this.def = 6;
    this.speed = 130;
    this.critChance = 0.08;
    this.critMult = 1.5;
    this.equipDamageReduction = 0;
    this.dodgeCooldownMax = PLAYER_CONFIG.dodge.cooldown;

    // Cooldowns (keyed by skill1, skill2, skill3, skill4, dodge + legacy aliases)
    this.cooldowns = {
      skill1: 0,
      skill2: 0,
      skill3: 0,
      skill4: 0,
      dodge: 0,
    };
    this.maxCooldowns = {
      skill1: 5.0,
      skill2: 9.0,
      skill3: 6.0,
      skill4: 8.0,
      dodge: 1.2,
    };

    this.ultimateCharge = 0;
    this.ultimateActive = false;

    // Developer Cheats & Tuner flags
    this.godmode = false;
    this.infiniteStamina = false;
    this.noCooldowns = false;
    this.oneHitKill = false;
    this.speedBoost = false;

    // Safe Zone State
    this.inSafeZone = true;
    this.safeZoneWarnTimer = 0;

    // Animation & Action state
    this.facingDir = 'right';
    this.facingX = 1;
    this.animState = 'idle';
    this.animClock = 0;
    this.hurtTimer = 0;
    this.invulnTimer = 0;
    this.dead = false;
    this.deathAnimTimer = 0;
    this.outOfCombatTimer = 0;

    // World hazard tick timers
    this.marshCorrodeTimer = 0;
    this.carBurnTimer = 0;
    this.stormChokeTimer = 0;

    // Basic Attack & Skill animation timers (used by Melee/Ranged/Mage)
    this.comboStep = 0;
    this.comboResetTimer = 0;
    this.attackTimer = 0;
    this.attackDuration = 0.24;
    this.attackAngle = 0;

    // Dodge Roll state
    this.dodgeTimer = 0;
    this.dodgeVx = 0;
    this.dodgeVy = 0;
    this.dodgeDustTick = 0;

    // Sena Lunge / Ground Break / Rail Spike / Seven Cuts timeline state
    this.lungeState = 'none';
    this.lungeTimer = 0;
    this.lungeAngle = 0;
    this.lungeStartX = 0;
    this.lungeStartY = 0;
    this.lungeEndX = 0;
    this.lungeEndY = 0;
    this.lungeAfterimages = [];

    this.groundBreakState = 'none';
    this.groundBreakTimer = 0;
    this.groundBreakRadius = 110;
    this.groundBreakDamageMult = 1.4;
    this.groundBreakStun = 1.0;

    this.railSpikeTimer = 0;
    this.parryTimer = 0;
    this.isSprinting = false;
    this.sprintDustTick = 0;

    this.ultimatePhaseTimer = 0;
    this.ultimateCutIndex = 0;
    this.ultimateTotalCuts = 7;
    this.ultimateTargetPool = [];
    this.ultimateTotalDamage = 0;
    this.ultimateInvertFrames = 0;
    this.ultimateOriginX = 0;
    this.ultimateOriginY = 0;
    this.ultimateReleased = false;

    // 6-Segment Simulated Scarf Chain (Sena's secondary motion)
    this.scarfNodes = Array.from({ length: 6 }, (_, i) => ({
      x: this.x - i * 2.5,
      y: this.y - 7 + i * 0.8,
    }));

    this.classBehavior = null;
    this.sprites = null;
    this.ultimates = new UltimateSequencer();

    // 15 Specializations & Multi-Class Loadout System (v4.1)
    const normalizedClassId = (classId || 'sena').toLowerCase();
    this.activeClassId = CHARACTERS[normalizedClassId]?.startingClass || 'phantomEdge';
    this.unlockedClasses = [this.activeClassId];
    this.skillSlots = getDefaultSkillSlots(normalizedClassId);
    this.ultimateSlot = CHARACTERS[normalizedClassId]?.ultimate?.id || null;
    this.loadoutPresets = getDefaultPresets(normalizedClassId);
    this.treeNodes = {};
    this.chosenClassAtLevel15 = null;
    this.pendingClassChoice = false;

    this._initClassData(classId, 1, null, true);
  }

  _initClassData(classId, stage = 1, branch = null, resetSkills = false) {
    const cfg = getClassConfig(classId);
    this.classId = cfg.id;
    this.stage = stage;
    this.branch = branch;

    const skillList = Array.isArray(cfg.skills)
      ? cfg.skills
      : (cfg.skillOrder || Object.keys(cfg.skills || {})).map((id) => cfg.skills[id]).filter(Boolean);
    const passiveList = Array.isArray(cfg.passives)
      ? cfg.passives
      : Object.values(cfg.passives || {});

    if (resetSkills) {
      this.skills = {};
      for (const sk of skillList) {
        this.skills[sk.id] = 1;
      }
      this.passives = {};
      for (const pas of passiveList) {
        this.passives[pas.id] = 0;
      }
      this.ownedNodes = [];
    } else {
      for (const sk of skillList) {
        if (!this.skills[sk.id]) this.skills[sk.id] = 1;
      }
      for (const pas of passiveList) {
        if (this.passives[pas.id] === undefined) this.passives[pas.id] = 0;
      }
    }

    if (this.classId === 'rook') {
      this.classBehavior = new RangedBehavior(this);
    } else if (this.classId === 'ines') {
      this.classBehavior = new MageBehavior(this);
    } else if (this.classId === 'kaelen') {
      this.classBehavior = new PyroBehavior(this);
    } else if (this.classId === 'vespera') {
      this.classBehavior = new ArtificerBehavior(this);
    } else {
      this.classBehavior = new MeleeBehavior(this);
    }

    this.rebuildSprites();
    this.recalculateStats(resetSkills);
  }

  setClass(classId, stage = 1, branch = null, resetSkills = true) {
    this.statuses.clearAll();
    this._initClassData(classId, stage, branch, resetSkills);
  }

  get status() {
    return this.statuses;
  }

  get classConfig() {
    return getClassConfig(this.classId);
  }

  get unlockedNodes() {
    return this.ownedNodes;
  }

  hasNode(nodeId) {
    return this.ownedNodes.includes(nodeId);
  }

  getTitleInfo() {
    return getCharacterTitleAndStage(this.classId, this.stage, this.branch);
  }

  getTitle() {
    return this.getTitleInfo().title;
  }

  getStageLabel() {
    return this.getTitleInfo().stageName;
  }

  getFullTitleLine() {
    return this.getTitleInfo().fullLabel;
  }

  canPromoteToJourneyman() {
    return this.stage === 1 && this.level >= 8;
  }

  canPromoteToMaster() {
    return this.stage === 2 && this.level >= 16;
  }

  promoteToJourneyman(branchId) {
    if (!this.canPromoteToJourneyman()) return false;
    this.stage = 2;
    this.branch = branchId;
    this.skillPoints += 1;
    this.rebuildSprites();
    this.recalculateStats(false);
    sound.playStamp();
    return true;
  }

  promoteToMaster() {
    if (!this.canPromoteToMaster()) return false;
    this.stage = 3;
    this.skillPoints += 2;
    this.rebuildSprites();
    this.recalculateStats(false);
    sound.playStamp();
    return true;
  }

  upgradeSkill(skillId) {
    if (this.skillPoints <= 0) return false;
    const cur = this.skills[skillId] || 1;
    if (cur >= 5) return false;
    this.skillPoints -= 1;
    this.skills[skillId] = cur + 1;
    this.recalculateStats(false);
    sound.playStamp();
    return true;
  }

  upgradePassive(passiveId) {
    if (this.skillPoints <= 0) return false;
    const cur = this.passives[passiveId] || 0;
    if (cur >= 3) return false;
    this.skillPoints -= 1;
    this.passives[passiveId] = cur + 1;
    this.recalculateStats(false);
    sound.playStamp();
    return true;
  }

  unlockBranchNode(nodeId) {
    if (this.skillPoints <= 0) return false;
    if (this.ownedNodes.includes(nodeId)) return false;
    this.skillPoints -= 1;
    this.ownedNodes.push(nodeId);
    this.recalculateStats(false);
    sound.playStamp();
    return true;
  }

  isTimeStopped() {
    return this.ultimateActive || (this.ultimates ? this.ultimates.worldFrozen : false);
  }

  getCutInTimer() {
    return this.ultimates && this.ultimates.cutInActive ? 0.3 : 0;
  }

  getSkillStaminaCost(skillId) {
    const cfg = getClassConfig(this.classId);
    const sk = cfg.skills ? cfg.skills[skillId] : null;
    return sk ? sk.staminaCost || 12 : 12;
  }

  addGold(val, particles = null) {
    this.gold += Math.max(0, val);
    sound.playCoin();
    if (particles) {
      particles.spawnFloatingText(this.x, this.y - 22, `+${val} G`, PALETTE.brass);
    }
  }

  setGold(val, particles = null) {
    this.gold = Math.max(0, Math.round(val));
    sound.playCoin?.();
    if (particles) {
      particles.spawnFloatingText?.(this.x, this.y - 22, `${this.gold} G`, PALETTE.brass);
    }
  }

  gainXp(val, particles = null) {
    this.gainXpAndGold(val, 0, particles);
  }

  setLevel(targetLevel, particles = null) {
    const prevLevel = this.level;
    const cap = Number.isFinite(PLAYER_CONFIG.levelCap) ? PLAYER_CONFIG.levelCap : 9999;
    const newLevel = Math.max(1, Math.min(cap, Math.round(targetLevel)));
    const diff = newLevel - this.level;
    this.level = newLevel;
    if (diff > 0) {
      this.skillPoints += diff;
    }
    this.xp = 0;
    this.xpToNext = PLAYER_CONFIG.xpForNextLevel(this.level);
    this.recalculateStats(false);
    this.hp = this.maxHp;
    this.stamina = this.maxStamina;

    if (prevLevel < 15 && this.level >= 15 && !this.chosenClassAtLevel15) {
      this.pendingClassChoice = true;
    }

    sound.playLevelUp?.();
    if (particles) {
      particles.spawnShockwave?.(this.x, this.y, 85, PALETTE.brass, 0.35);
      particles.spawnFloatingText?.(this.x, this.y - 25, `LEVEL ${this.level}!`, PALETTE.signal);
    }
    return this.level;
  }

  addLevel(count = 1, particles = null) {
    return this.setLevel(this.level + count, particles);
  }

  addSkillPoints(amount = 1) {
    this.skillPoints = Math.max(0, this.skillPoints + Math.round(amount));
  }

  setSkillPoints(amount = 0) {
    this.skillPoints = Math.max(0, Math.round(amount));
  }

  refillHealthAndStamina() {
    this.hp = this.maxHp;
    this.stamina = this.maxStamina;
    this.dead = false;
    this.statuses.cleanseAllDebuffs?.();
  }

  unlockAllSpecializations() {
    if (!this.unlockedClasses) this.unlockedClasses = [];
    for (const specKey of Object.keys(SPECIALIZATIONS)) {
      if (!this.unlockedClasses.includes(specKey)) {
        this.unlockedClasses.push(specKey);
      }
    }
    return true;
  }

  fillUltimateCharge() {
    this.ultimateCharge = 100;
  }

  clearAllCooldowns() {
    for (const k of Object.keys(this.cooldowns)) {
      this.cooldowns[k] = 0;
    }
  }

  setSuppliesMax(count = 99) {
    this.supplies = {
      gauzeRoll: count,
      sugarTin: count,
      lyeWash: count,
      hotStew: count,
      stimStick: count,
    };
  }

  recalcStats() {
    this.recalculateStats();
  }

  refreshEquipmentSprites() {
    this.rebuildSprites();
  }

  applyDeathPenalty() {
    const goldLost = Math.floor(this.gold * PLAYER_CONFIG.deathGoldPenalty);
    this.gold = Math.max(0, this.gold - goldLost);
    this.ultimateCharge = 0;
    if (this.ultimates) {
      this.ultimates.reset();
    }
    this.dead = true;
    return goldLost;
  }

  tryManualReload(particles = null) {
    if (this.classId === 'rook' && this.classBehavior && this.classBehavior.startReload) {
      this.classBehavior.startReload(particles);
      return true;
    }
    return false;
  }

  isInSafeZone(world = null) {
    if (worldLedger && worldLedger.currentFloor === 0) {
      return true;
    }
    if (worldLedger && typeof worldLedger.isInsideMobRepellentWard === 'function') {
      if (worldLedger.isInsideMobRepellentWard(this.x, this.y)) {
        return true;
      }
    }
    if (world && typeof world.getAreaAt === 'function') {
      const area = world.getAreaAt(this.x, this.y);
      return !!(area && area.safe);
    }
    return false;
  }

  warnSafeZone(particles = null, message = 'SAFE ZONE — WEAPONS SHEATHED') {
    if (this.safeZoneWarnTimer <= 0) {
      this.safeZoneWarnTimer = 1.0;
      sound.playError?.();
      if (particles && typeof particles.spawnFloatingText === 'function') {
        particles.spawnFloatingText(this.x, this.y - 24, message, PALETTE.signal);
      }
    }
  }

  toggleGuardStance(particles = null, spawner = null, camera = null) {
    if (this.inSafeZone || this.isInSafeZone()) {
      this.warnSafeZone(particles, 'SAFE ZONE — COMBAT DISABLED');
      return false;
    }
    if (this.classId === 'sena' && this.classBehavior) {
      this.classBehavior.isGuarding = !this.classBehavior.isGuarding;
      if (particles) {
        particles.spawnFloatingText(
          this.x,
          this.y - 20,
          this.classBehavior.isGuarding ? 'GUARD ON' : 'GUARD OFF',
          PALETTE.signal
        );
      }
      return true;
    }
    if (this.classId === 'kaelen' && this.classBehavior && typeof this.classBehavior.trySteamVent === 'function') {
      return this.classBehavior.trySteamVent(spawner || this._lastSpawner, particles, camera || this._lastCamera);
    }
    if (this.classId === 'vespera' && this.classBehavior && typeof this.classBehavior.tryRecallPulse === 'function') {
      return this.classBehavior.tryRecallPulse(spawner || this._lastSpawner, particles, camera || this._lastCamera);
    }
    return false;
  }

  // --- CHARACTER & CLASS CHANGE SYSTEM (v4.1) ---

  switchCharacter(newCharId, targetSpecId = null) {
    if (!newCharId) return { success: false, reason: 'Invalid character ID' };
    const normalizedCharId = newCharId.toLowerCase();
    const ch = CHARACTERS[normalizedCharId];
    if (!ch) return { success: false, reason: 'Character definition not found' };

    // Clear active temporary combat statuses
    this.statuses.clearAll();

    // Reinitialize base class data, behavior, sprites, and base stats
    this._initClassData(normalizedCharId, this.stage || 1, this.branch || null, false);

    // Pick active specialization: if targetSpecId belongs to this character, use it; else starting class
    const chosenSpec = targetSpecId && SPECIALIZATIONS[targetSpecId]?.char === normalizedCharId
      ? targetSpecId
      : ch.startingClass || 'phantomEdge';

    this.activeClassId = chosenSpec;
    this.unlockedClasses = [this.activeClassId];
    this.skillSlots = getDefaultSkillSlots(normalizedCharId);

    const specDef = SPECIALIZATIONS[this.activeClassId];
    const specUlt = specDef?.skills?.find((s) => s.ultimate);
    this.ultimateSlot = specUlt?.id || ch.ultimate?.id || null;

    this.loadoutPresets = getDefaultPresets(normalizedCharId);
    this.treeNodes = {};
    this.chosenClassAtLevel15 = null;
    this.pendingClassChoice = false;

    // Reset ultimate meter sequencer state
    if (this.ultimates) {
      this.ultimates.reset();
    }

    // Recalculate stats with the new character's base scaling
    this.recalculateStats(false);
    this.hp = Math.min(this.hp, this.maxHp);
    this.stamina = Math.min(this.stamina, this.maxStamina);

    return {
      success: true,
      characterId: normalizedCharId,
      activeClassId: this.activeClassId,
      ultimateSlot: this.ultimateSlot
    };
  }

  switchClass(newClassId, autoEquipUlt = true) {
    if (!newClassId) return { success: false, reason: 'Invalid class ID' };
    const spec = SPECIALIZATIONS[newClassId];
    if (!spec) return { success: false, reason: 'Specialization not found' };

    // If switching to a specialization of a DIFFERENT character,
    // seamlessly switch character first so base sprites, behaviors, and skills remain 100% in sync!
    if (spec.char && spec.char !== this.classId) {
      return this.switchCharacter(spec.char, newClassId);
    }

    // Auto-unlock if not already in unlocked list
    if (!this.unlockedClasses.includes(newClassId)) {
      this.unlockedClasses.push(newClassId);
    }

    // Switch active specialization ID
    this.activeClassId = newClassId;

    // Automatically equip the specialization's signature Level 45 Awakening Ultimate
    if (autoEquipUlt) {
      const specUlt = spec.skills?.find((s) => s.ultimate);
      if (specUlt) {
        this.ultimateSlot = specUlt.id;
      }
    }

    // CRITICAL BRAINSTORM RULING:
    // Character level and XP ALWAYS persist on class change (never reset to Lv 1).
    // Gold, stats, inventory, and world progress remain intact.

    // Refresh stats without altering character level or XP
    this.recalculateStats(false);
    return { success: true, activeClassId: this.activeClassId, ultimateSlot: this.ultimateSlot };
  }

  unlockClass(classId) {
    if (!classId) return false;
    if (!this.unlockedClasses.includes(classId)) {
      this.unlockedClasses.push(classId);
    }
    return true;
  }

  triggerClassChoice() {
    this.pendingClassChoice = true;
    return true;
  }

  assignSkillSlot(slotIdx, skillId) {
    if (slotIdx < 0 || slotIdx > 4) return { success: false, reason: 'Invalid slot index' };

    if (!skillId) {
      if (slotIdx === 4) {
        this.ultimateSlot = null;
      } else {
        this.skillSlots[slotIdx] = null;
      }
      return { success: true };
    }

    const allSkills = getAllSkillsForCharacter(this.classId);
    const sk = allSkills.find((s) => s.id === skillId);
    if (!sk) return { success: false, reason: 'Skill not found' };

    const isUltimate = sk.type === 'ultimate' || sk.ultimate === true;

    // Slot 4 is dedicated ultimate slot [R]
    if (slotIdx === 4) {
      if (!isUltimate) {
        return { success: false, reason: 'Only ultimates can be assigned to [R]' };
      }
      this.ultimateSlot = skillId;
      return { success: true };
    }

    // Slots 0..3 are active skills (1..4)
    if (isUltimate) {
      return { success: false, reason: 'Ultimates can only be assigned to [R]' };
    }

    // Check level & unlock requirement
    if (sk.source !== 'Original') {
      if (sk.classKey && !this.unlockedClasses.includes(sk.classKey)) {
        return { success: false, reason: 'Class is locked' };
      }
      if (this.level < (sk.level || 15)) {
        return { success: false, reason: 'Level requirement not met' };
      }
    }

    // If skill is already assigned to another slot in active 0..3, swap them
    const existingIdx = this.skillSlots.indexOf(skillId);
    if (existingIdx !== -1 && existingIdx !== slotIdx) {
      const prevInCurrentSlot = this.skillSlots[slotIdx];
      this.skillSlots[existingIdx] = prevInCurrentSlot;
    }
    this.skillSlots[slotIdx] = skillId;
    return { success: true };
  }

  savePreset(target) {
    const payload = {
      classId: this.activeClassId,
      slots: [...this.skillSlots],
      ultimate: this.ultimateSlot,
    };

    if (typeof target === 'number' && this.loadoutPresets[target]) {
      this.loadoutPresets[target].classId = payload.classId;
      this.loadoutPresets[target].slots = [...payload.slots];
      this.loadoutPresets[target].ultimate = payload.ultimate;
    } else if (Array.isArray(this.loadoutPresets)) {
      let p = this.loadoutPresets.find((x) => x.name === target);
      if (!p) {
        p = { name: target, ...payload };
        this.loadoutPresets.push(p);
      } else {
        p.classId = payload.classId;
        p.slots = [...payload.slots];
        p.ultimate = payload.ultimate;
      }
      this.loadoutPresets[target] = p;
    } else if (this.loadoutPresets && typeof this.loadoutPresets === 'object') {
      this.loadoutPresets[target] = { name: target, ...payload };
    }
    return { success: true };
  }

  loadPreset(target) {
    let preset = null;
    if (typeof target === 'number') {
      preset = this.loadoutPresets[target];
    } else if (Array.isArray(this.loadoutPresets)) {
      preset = this.loadoutPresets.find((p) => p.name === target) || this.loadoutPresets[target];
    } else if (this.loadoutPresets && typeof this.loadoutPresets === 'object') {
      preset = this.loadoutPresets[target];
    }

    if (!preset) return { success: false, reason: 'Preset not found' };

    if (preset.classId && this.unlockedClasses.includes(preset.classId)) {
      this.switchClass(preset.classId, false);
    }
    if (Array.isArray(preset.slots)) {
      this.skillSlots = [...preset.slots];
    }
    if (preset.ultimate) {
      this.ultimateSlot = preset.ultimate;
    }
    return { success: true };
  }

  investTreeNode(skillId, choice, allowRefund = true) {
    if (!skillId) return { success: false, reason: 'Invalid skill ID' };
    if (!this.treeNodes) this.treeNodes = {};

    // If already invested in this skill node
    if (this.treeNodes[skillId] !== undefined) {
      if (allowRefund && this.treeNodes[skillId] === choice) {
        delete this.treeNodes[skillId];
        this.recalculateStats(false);
        return { success: true, refunded: true };
      }
      this.treeNodes[skillId] = choice;
      this.recalculateStats(false);
      return { success: true, switched: true };
    }

    // New node investment requires an available tree point
    if (this.getAvailableTreePoints() <= 0) {
      return { success: false, reason: 'No available skill tree points' };
    }

    this.treeNodes[skillId] = choice;
    this.recalculateStats(false);
    return { success: true, invested: true };
  }

  investTalent(nodeId, maxRank = 1, choice = undefined, nodeType = 'passive') {
    if (!nodeId) return { success: false, reason: 'Invalid node ID' };
    if (!this.treeNodes) this.treeNodes = {};

    const cur = this.treeNodes[nodeId];

    if (nodeType === 'choice' || choice !== undefined) {
      const targetChoice = choice !== undefined ? choice : 0;
      if (cur !== undefined) {
        // Already invested, switching variant is free!
        const existingChoice = typeof cur === 'object' ? cur.choice : cur;
        const newChoice = choice !== undefined ? choice : (existingChoice === 0 ? 1 : 0);
        this.treeNodes[nodeId] = { choice: newChoice, rank: 1 };
        this.recalculateStats(false);
        sound.playCoin?.();
        return { success: true, switched: true, choice: newChoice };
      }
      // First investment costs 1 point
      if (this.getAvailableTreePoints() <= 0) {
        return { success: false, reason: 'No available skill points' };
      }
      this.treeNodes[nodeId] = { choice: targetChoice, rank: 1 };
      this.recalculateStats(false);
      sound.playStamp?.();
      return { success: true, invested: true, choice: targetChoice };
    }

    // Passive or Active node
    if (cur !== undefined) {
      const currentRank = typeof cur === 'number' ? cur : (cur?.rank || 1);
      if (currentRank < maxRank) {
        if (this.getAvailableTreePoints() <= 0) {
          return { success: false, reason: 'No available skill points' };
        }
        this.treeNodes[nodeId] = currentRank + 1;
        this.recalculateStats(false);
        sound.playCoin?.();
        return { success: true, rank: currentRank + 1 };
      }
      return { success: true, maxed: true };
    }

    if (this.getAvailableTreePoints() <= 0) {
      return { success: false, reason: 'No available skill points' };
    }

    this.treeNodes[nodeId] = 1;
    this.recalculateStats(false);
    sound.playStamp?.();
    return { success: true, invested: true };
  }

  refundTalent(nodeId) {
    if (!this.treeNodes || this.treeNodes[nodeId] === undefined) {
      return { success: false, reason: 'Not learned' };
    }

    const cur = this.treeNodes[nodeId];
    if (typeof cur === 'number' && cur > 1) {
      this.treeNodes[nodeId] = cur - 1;
    } else {
      delete this.treeNodes[nodeId];
    }

    this.recalculateStats(false);
    sound.playHit?.(false);
    return { success: true, refunded: true };
  }

  respecTree() {
    this.treeNodes = {};
    this.recalculateStats(false);
    return { success: true };
  }

  getAvailableTreePoints() {
    const totalPoints = Math.max(0, this.level - 1) + (this.bonusSkillPoints || 0);
    let spent = 0;
    for (const val of Object.values(this.treeNodes || {})) {
      if (typeof val === 'number') {
        spent += Math.max(1, val);
      } else if (val && typeof val.rank === 'number') {
        spent += Math.max(1, val.rank);
      } else {
        spent += 1;
      }
    }
    return Math.max(0, totalPoints - spent);
  }

  getSkillFork(skillNameOrId) {
    if (!this.treeNodes || !skillNameOrId) return null;
    if (this.treeNodes[skillNameOrId] !== undefined) {
      const v = this.treeNodes[skillNameOrId];
      return typeof v === 'object' ? v.choice ?? 0 : v;
    }

    const target = String(skillNameOrId).toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [k, v] of Object.entries(this.treeNodes)) {
      const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (kNorm === target || kNorm.includes(target) || target.includes(kNorm)) {
        return typeof v === 'object' ? v.choice ?? 0 : v;
      }
    }
    return null;
  }

  getIntrinsicTrait() {
    const trait = getIntrinsicTraitRank(this.classId, this.level);
    if (!trait) return null;
    const roman = ['I', 'II', 'III', 'IV'][trait.rank - 1] || 'I';
    return {
      ...trait,
      roman,
      rankDesc: trait.text,
    };
  }

  getClassTrait() {
    const trait = getClassTraitRank(this.activeClassId, this.level);
    if (!trait) return null;
    const roman = ['I', 'II', 'III'][trait.rank - 1] || 'I';
    return {
      ...trait,
      roman,
      rankDesc: trait.text,
    };
  }

  toJSON() {
    return {
      classId: this.classId,
      activeClassId: this.activeClassId,
      unlockedClasses: [...(this.unlockedClasses || [this.activeClassId])],
      skillSlots: [...(this.skillSlots || getDefaultSkillSlots(this.classId))],
      ultimateSlot: this.ultimateSlot,
      loadoutPresets: JSON.parse(JSON.stringify(this.loadoutPresets || getDefaultPresets(this.classId))),
      treeNodes: { ...(this.treeNodes || {}) },
      stage: this.stage,
      branch: this.branch,
      level: this.level,
      xp: this.xp,
      gold: this.gold,
      skillPoints: this.skillPoints,
      skills: { ...this.skills },
      passives: { ...this.passives },
      ownedNodes: [...this.ownedNodes],
      equipped: { ...this.equipped },
      ownedEquipment: [...this.ownedEquipment],
      supplies: { ...this.supplies },
      ultimateCharge: this.ultimateCharge,
      chosenClassAtLevel15: this.chosenClassAtLevel15,
      pendingClassChoice: Boolean(this.pendingClassChoice),
    };
  }

  fromJSON(data) {
    if (!data) return;
    this.classId = data.classId || 'sena';
    const normalizedClassId = this.classId.toLowerCase();
    this.activeClassId = data.activeClassId || CHARACTERS[normalizedClassId]?.startingClass || 'phantomEdge';
    this.unlockedClasses = Array.isArray(data.unlockedClasses) && data.unlockedClasses.length
      ? [...data.unlockedClasses]
      : [this.activeClassId];
    this.skillSlots = Array.isArray(data.skillSlots) && data.skillSlots.length === 4
      ? [...data.skillSlots]
      : getDefaultSkillSlots(normalizedClassId);
    this.ultimateSlot = data.ultimateSlot || CHARACTERS[normalizedClassId]?.ultimate?.id || null;
    this.loadoutPresets = Array.isArray(data.loadoutPresets) && data.loadoutPresets.length
      ? JSON.parse(JSON.stringify(data.loadoutPresets))
      : getDefaultPresets(normalizedClassId);
    this.treeNodes = data.treeNodes ? { ...data.treeNodes } : {};
    this.chosenClassAtLevel15 = data.chosenClassAtLevel15 || null;
    this.pendingClassChoice = Boolean(data.pendingClassChoice);

    this.stage = data.stage || 1;
    this.branch = data.branch || null;
    this.level = data.level || 1;
    this.xpToNext = PLAYER_CONFIG.xpForNextLevel(this.level);
    this.xp = Math.max(0, Math.min(data.xp || 0, Math.max(0, this.xpToNext - 1)));
    this.gold = data.gold ?? 120;
    this.skillPoints = data.skillPoints ?? 1;
    this.skills = data.skills ? { ...data.skills } : {};
    if (this.skills.tripwire && !this.skills.rapidFire) {
      this.skills.rapidFire = this.skills.tripwire;
    }
    if (this.skills.railSpike && !this.skills.railParry) {
      this.skills.railParry = this.skills.railSpike;
    }
    this.passives = data.passives ? { ...data.passives } : {};
    this.ownedNodes = data.ownedNodes ? [...data.ownedNodes] : [];
    this.equipped = data.equipped ? { ...data.equipped } : { head: null, body: null, legs: null };
    this.ownedEquipment = data.ownedEquipment ? [...data.ownedEquipment] : [];
    this.supplies = data.supplies ? { ...data.supplies } : { gauzeRoll: 2, sugarTin: 1, lyeWash: 1, hotStew: 0, stimStick: 0 };
    this.ultimateCharge = data.ultimateCharge ?? 0;

    if (this.classId === 'rook') {
      this.classBehavior = new RangedBehavior(this);
    } else if (this.classId === 'ines') {
      this.classBehavior = new MageBehavior(this);
    } else if (this.classId === 'kaelen') {
      this.classBehavior = new PyroBehavior(this);
    } else if (this.classId === 'vespera') {
      this.classBehavior = new ArtificerBehavior(this);
    } else {
      this.classBehavior = new MeleeBehavior(this);
    }

    if (!this.ultimates) {
      this.ultimates = new UltimateSequencer();
    }

    this.rebuildSprites();
    this.recalculateStats(true);
  }

  getHudMechanicState() {
    if (this.classBehavior && typeof this.classBehavior.getHudMechanicState === 'function') {
      return this.classBehavior.getHudMechanicState();
    }
    return null;
  }

  rebuildSprites() {
    if (typeof document !== 'undefined') {
      this.sprites = bakePlayerSprites(this.equipped, this.classId, this.stage, this.branch);
    }
  }

  recalculateStats(fullRestore = false) {
    const cfg = getClassConfig(this.classId);
    const lvlUps = Math.max(0, this.level - 1);

    let maxHp = cfg.baseStats.hp + lvlUps * cfg.perLevel.hp;
    let maxStamina = cfg.baseStats.stamina + lvlUps * cfg.perLevel.stamina;
    let atk = cfg.baseStats.atk + lvlUps * cfg.perLevel.atk;
    let def = cfg.baseStats.def + Math.floor(lvlUps * cfg.perLevel.def);
    let speed = cfg.baseStats.speed;
    let critChance = cfg.baseStats.critChance || 0.08;
    let dodgeCdRed = 0;
    let equipDr = 0;

    // Equipment bonuses
    for (const slot of ['head', 'body', 'legs']) {
      const itemId = this.equipped[slot];
      if (!itemId || !SHOP_ITEMS[itemId]) continue;
      const st = SHOP_ITEMS[itemId].stats || {};
      if (st.hp) maxHp += st.hp;
      if (st.stamina) maxStamina += st.stamina;
      if (st.atk) atk += st.atk;
      if (st.def) def += st.def;
      if (st.speed) speed += st.speed;
      if (st.critChance) critChance += st.critChance;
      if (st.dodgeCdReduction) dodgeCdRed += st.dodgeCdReduction;
      if (st.damageReduction) equipDr += st.damageReduction;
    }

    // Tier 1 Passives
    if (this.classId === 'sena') {
      def += (this.passives.thickSkin || 0) * 3;
      critChance += (this.passives.keenEdge || 0) * 0.03;
      dodgeCdRed += (this.passives.footwork || 0) * 0.15;
    } else if (this.classId === 'rook') {
      speed += (this.passives.lightStep || 0) * 6;
    } else if (this.classId === 'ines' && this.classBehavior) {
      def += this.classBehavior.getOrbitDefBonus();
    } else if (this.classId === 'kaelen') {
      def += (this.passives.boilerPlate || 0) * 4;
      speed += (this.passives.pressurizedDraft || 0) * 4;
      if (this.hasNode('slagCarapace') && this.classBehavior && this.classBehavior.pressure >= 75) {
        def += 8;
      }
    } else if (this.classId === 'vespera') {
      speed += (this.passives.servoLubricant || 0) * 6;
      critChance += (this.passives.copperConductors || 0) * 0.04;
      dodgeCdRed += (this.passives.servoLubricant || 0) * 0.10;
    }

    // Dual Talent Tree node bonuses
    if (this.treeNodes && typeof CLASS_TREES !== 'undefined') {
      const classTree = CLASS_TREES[this.classId];
      const specTree = getSpecTree(this.activeClassId);
      const allNodes = [...(classTree?.nodes || []), ...(specTree?.nodes || [])];
      const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

      for (const [nodeId, val] of Object.entries(this.treeNodes)) {
        const nodeDef = nodeMap.get(nodeId);
        if (nodeDef && nodeDef.stats) {
          const rank = typeof val === 'number'
            ? (nodeDef.type === 'choice' ? 1 : Math.max(1, val))
            : (val?.rank || 1);
          if (nodeDef.stats.hp) maxHp += nodeDef.stats.hp * rank;
          if (nodeDef.stats.stamina) maxStamina += nodeDef.stats.stamina * rank;
          if (nodeDef.stats.atk) atk += nodeDef.stats.atk * rank;
          if (nodeDef.stats.def) def += nodeDef.stats.def * rank;
          if (nodeDef.stats.speed) speed += nodeDef.stats.speed * rank;
          if (nodeDef.stats.critChance) critChance += nodeDef.stats.critChance * rank;
          if (nodeDef.stats.dodgeCdReduction) dodgeCdRed += nodeDef.stats.dodgeCdReduction * rank;
          if (nodeDef.stats.damageReduction) equipDr += nodeDef.stats.damageReduction * rank;
        }
      }
    }

    // Raven's Rest Tavern Meal & Wandering Merchant Cursed Relic modifiers
    if (this.tavernMeal && this.tavernMeal.timer > 0) {
      if (this.tavernMeal.hpBonusPct) maxHp = Math.round(maxHp * (1 + this.tavernMeal.hpBonusPct));
      if (this.tavernMeal.atkBonusPct) atk = Math.round(atk * (1 + this.tavernMeal.atkBonusPct));
      if (this.tavernMeal.defBonus) def += this.tavernMeal.defBonus;
      if (this.tavernMeal.critBonus) critChance += this.tavernMeal.critBonus;
    }
    if (Array.isArray(this.cursedRelics) && this.cursedRelics.length > 0) {
      for (const relicId of this.cursedRelics) {
        const relic = WANDERING_MERCHANT_STOCK?.find((it) => it.id === relicId);
        if (relic && relic.stats) {
          if (relic.stats.hp) maxHp += relic.stats.hp;
          if (relic.stats.atk) atk += relic.stats.atk;
          if (relic.stats.def) def += relic.stats.def;
          if (relic.stats.speed) speed += relic.stats.speed;
          if (relic.stats.critChance) critChance += relic.stats.critChance;
        }
      }
    }

    // Status Effect modifiers
    maxHp = Math.round(maxHp * this.statuses.getMaxHpMultiplier());
    this.baseAtkForPipeline = atk;
    this.atk = Math.round(atk * (1 + this.statuses.getAtkBonusPct()));
    this.baseDefForPipeline = def;
    this.def = Math.round(this.statuses.getEffectiveDef(def));
    this.speed = Math.round(
      (speed + this.statuses.getFlatMoveSpeedBonus()) *
        this.statuses.getMoveSpeedMultiplier()
    );
    this.critChance = critChance;
    this.critMult = 1.5;
    this.equipDamageReduction = equipDr;

    if (this.oneHitKill) {
      this.atk = 99999;
    }
    if (this.speedBoost) {
      this.speed = Math.round(this.speed * 1.6);
    }

    const prevMaxHp = this.maxHp || maxHp;
    this.maxHp = maxHp;
    this.maxStamina = maxStamina;
    this.dodgeCooldownMax = Math.max(0.45, PLAYER_CONFIG.dodge.cooldown - dodgeCdRed);

    // Update skill ranks (auto-evolving at Lv 1 / 15 / 30 / 45 for 0 Talent Points) & max cooldowns (with 50% Rank 1 floor)
    const autoSkillRank = this.level >= 45 ? 4 : this.level >= 30 ? 3 : this.level >= 15 ? 2 : 1;
    const skillList = Array.isArray(cfg.skills)
      ? cfg.skills
      : (cfg.skillOrder || Object.keys(cfg.skills || {})).map((id) => cfg.skills[id]).filter(Boolean);
    for (let i = 0; i < skillList.length; i++) {
      const sk = skillList[i];
      if (!sk) continue;
      const curRank = Math.max(this.skills[sk.id] || 1, autoSkillRank);
      this.skills[sk.id] = curRank;
      if (sk.getStats) {
        const r1 = sk.getStats(1, []);
        const cdFloor = +((r1?.cooldown || sk.cooldown || 6.0) * 0.5).toFixed(2);
        const st = sk.getStats(curRank, this.ownedNodes);
        this.maxCooldowns[`skill${i + 1}`] = Math.max(cdFloor, st.cooldown);
      }
    }
    this.maxCooldowns.dodge = this.dodgeCooldownMax;

    if (fullRestore) {
      this.hp = this.maxHp;
      this.stamina = this.maxStamina;
    } else {
      if (this.maxHp > prevMaxHp) {
        this.hp = Math.min(this.maxHp, this.hp + (this.maxHp - prevMaxHp));
      } else {
        this.hp = Math.min(this.maxHp, this.hp);
      }
      this.stamina = Math.min(this.maxStamina, this.stamina);
    }
  }

  getStaminaRegenPerSec() {
    let regen = PLAYER_CONFIG.staminaRegenPerSec;
    if (this.classId === 'sena') {
      regen *= 1 + (this.passives.secondWind || 0) * 0.12;
    } else if (this.classId === 'ines') {
      regen *= 1 + (this.passives.calmHands || 0) * 0.10;
    } else if (this.classId === 'kaelen') {
      regen *= 1 + (this.passives.pressurizedDraft || 0) * 0.12;
    } else if (this.classId === 'vespera') {
      regen *= 1 + (this.passives.capacitorBank || 0) * 0.14;
    }
    regen *= this.statuses.getStaminaRegenMultiplier();
    return regen;
  }

  clampCoord(v) {
    return Math.round(Math.max(48, Math.min(WORLD_CONFIG.size - 48, v)));
  }

  addUltimateCharge(amount) {
    if (this.ultimateActive) return;
    this.ultimateCharge = Math.min(100, this.ultimateCharge + amount);
  }

  addMomentum(count = 1, particles = null) {
    if (this.classBehavior && typeof this.classBehavior.addMomentum === 'function') {
      return this.classBehavior.addMomentum(count, particles);
    }
  }

  gainXpAndGold(xpAmount, goldAmount, particles) {
    let xpMult = this.statuses.getXpAndGoldMultiplier();
    let goldMult = xpMult;
    if (this.tavernMeal && this.tavernMeal.timer > 0 && this.tavernMeal.xpBonusPct) {
      xpMult *= 1 + this.tavernMeal.xpBonusPct;
    }
    if (this.elixirBuff && this.elixirBuff.timer > 0) {
      if (this.elixirBuff.xpMult) xpMult *= this.elixirBuff.xpMult;
      if (this.elixirBuff.goldMult) goldMult *= this.elixirBuff.goldMult;
    }
    const finalXp = Math.round(xpAmount * xpMult);
    const finalGold = Math.round(goldAmount * goldMult);

    this.gold += Math.max(0, finalGold);

    this.xp += Math.max(0, finalXp);
    while (this.xp >= this.xpToNext) {
      const prevLevel = this.level;
      this.xp -= this.xpToNext;
      this.level += 1;
      this.skillPoints += 1;
      this.xpToNext = PLAYER_CONFIG.xpForNextLevel(this.level);
      this.recalculateStats(false);

      if (prevLevel < 15 && this.level >= 15 && !this.chosenClassAtLevel15) {
        this.pendingClassChoice = true;
      }

      const healAmt = Math.ceil(this.maxHp * PLAYER_CONFIG.perLevel.healRatio);
      this.hp = Math.min(this.maxHp, this.hp + healAmt);
      this.stamina = this.maxStamina;

      sound.playLevelUp();
      if (particles) {
        particles.spawnShockwave(this.x, this.y, 85, PALETTE.brass, 0.35);
        particles.spawnDamageNumber(
          this.x,
          this.y - 26,
          0,
          true,
          `LEVEL ${this.level}`,
          PALETTE.brass
        );
      }
    }
  }

  useSupply(itemId, particles) {
    if (this.dead) return false;
    const item = SHOP_ITEMS[itemId];
    if (!item || !item.consumable) return false;
    const count = this.supplies[itemId] || 0;
    if (count <= 0) return false;

    if (itemId === 'gauzeRoll') {
      const hasBleed = this.statuses.has('bleed');
      if (this.hp >= this.maxHp && !hasBleed) return false;
      this.supplies.gauzeRoll -= 1;
      const healed = Math.min(this.maxHp - this.hp, item.healHp);
      this.hp += healed;
      this.statuses.cleanseSpecific(['bleed']);
      sound.playCoin();
      if (particles) {
        particles.spawnDamageNumber(
          this.x,
          this.y - 22,
          healed,
          false,
          healed > 0 ? `+${Math.round(healed)} HP` : 'CLEANSED',
          PALETTE.signal
        );
      }
      return true;
    }

    if (itemId === 'sugarTin') {
      if (this.stamina >= this.maxStamina) return false;
      this.supplies.sugarTin -= 1;
      const restored = Math.min(this.maxStamina - this.stamina, item.restoreStamina);
      this.stamina += restored;
      sound.playCoin();
      if (particles) {
        particles.spawnDamageNumber(
          this.x,
          this.y - 22,
          restored,
          false,
          `+${Math.round(restored)} STAM`,
          PALETTE.brass
        );
      }
      return true;
    }

    if (itemId === 'lyeWash') {
      this.supplies.lyeWash -= 1;
      this.statuses.cleanseSpecific(['corrode', 'burn']);
      sound.playCoin();
      if (particles) {
        particles.spawnDamageNumber(this.x, this.y - 22, 0, false, 'CLEANSED', PALETTE.lye);
      }
      return true;
    }

    if (itemId === 'hotStew') {
      this.supplies.hotStew -= 1;
      this.statuses.apply('fed', { duration: 300.0, sourceName: 'Hot Stew' }, this, particles);
      this.recalculateStats(false);
      if (particles) {
        particles.spawnDamageNumber(this.x, this.y - 22, 0, false, 'FED (+10% HP)', PALETTE.rustLight);
      }
      return true;
    }

    if (itemId === 'stimStick') {
      this.supplies.stimStick -= 1;
      this.statuses.apply('haste', { duration: 20.0, sourceName: 'Stim Stick' }, this, particles);
      this.recalculateStats(false);
      if (particles) {
        particles.spawnDamageNumber(this.x, this.y - 22, 0, false, 'HASTE!', PALETTE.brass);
      }
      return true;
    }

    return false;
  }

  /**
   * Dodge Roll [SPACE]:
   * - Applies Untouchable (0.25s invulnerable)
   * - Halves remaining Burn duration
   * - Triggers Rook's Caltrop Pocket if owned
   */
  tryDodge(moveX, moveY, arg3, arg4, arg5) {
    let worldMouseX = arg3;
    let worldMouseY = arg4;
    let particles = arg5;
    if (arg3 && typeof arg3 === 'object') {
      particles = arg3;
      worldMouseX = this._lastWorldMouseX ?? (this.x + (this.facingX || 1) * 40);
      worldMouseY = this._lastWorldMouseY ?? this.y;
    }

    if (
      this.dead ||
      this.statuses.cannotMove() ||
      this.ultimateActive ||
      this.lungeState !== 'none' ||
      this.groundBreakState !== 'none'
    ) {
      return false;
    }
    const cost = this.statuses.has('redline') ? 0 : PLAYER_CONFIG.dodge.staminaCost;
    if (this.cooldowns.dodge > 0 || this.stamina < cost) return false;

    this.stamina -= cost;
    this.cooldowns.dodge = this.dodgeCooldownMax;
    this.dodgeTimer = PLAYER_CONFIG.dodge.duration;
    this.invulnTimer = Math.max(this.invulnTimer, PLAYER_CONFIG.dodge.duration);

    this.statuses.apply(
      'untouchable',
      { duration: PLAYER_CONFIG.dodge.duration, sourceName: 'Dodge Roll' },
      this,
      null
    );
    // Dodge roll cuts remaining Burn time in half
    this.statuses.halveBurnOnDodge();

    let dx = moveX;
    let dy = moveY;
    const len = Math.hypot(dx, dy);
    if (len > 0.01) {
      dx /= len;
      dy /= len;
    } else if (Number.isFinite(worldMouseX) && Number.isFinite(worldMouseY)) {
      const ang = Math.atan2(worldMouseY - this.y, worldMouseX - this.x);
      dx = Math.cos(ang);
      dy = Math.sin(ang);
    } else {
      dx = this.facingX || 1;
      dy = 0;
    }

    const dodgeDistMult =
      this.classId === 'rook'
        ? 1 + (this.passives.lightStep || 0) * 0.10
        : this.classId === 'vespera'
        ? 1 + (this.passives.servoLubricant || 0) * 0.08
        : 1.0;

    this.dodgeVx = dx * PLAYER_CONFIG.dodge.speed * dodgeDistMult;
    this.dodgeVy = dy * PLAYER_CONFIG.dodge.speed * dodgeDistMult;
    const dodgeAngle = Math.atan2(dy, dx);
    this.facingDir = angleTo4Facing(dodgeAngle);
    if (Math.abs(dx) > 0.1) this.facingX = dx >= 0 ? 1 : -1;
    this._pendingObservedDodgeAngle = dodgeAngle;

    if (this.classBehavior && typeof this.classBehavior.onDodgeRoll === 'function') {
      this.classBehavior.onDodgeRoll(this.x, this.y, particles, this._lastSpawner);
    }

    sound.playDodge();
    if (particles) {
      particles.spawnDustPuff(this.x, this.y + 10, 2, -dx * 28, -dy * 28);
    }
    return true;
  }

  // --- DELEGATED BASIC ATTACK, SKILLS 1/2/3, & ULTIMATE ---

  tryBasicAttack(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop) {
    if (this.inSafeZone || this.isInSafeZone()) {
      this.warnSafeZone(particles, 'SAFE ZONE — WEAPONS SHEATHED');
      return false;
    }
    if (!this.classBehavior) return false;
    if (this.classId === 'rook') {
      return this.classBehavior.tryBasicAttack(
        worldMouseX,
        worldMouseY,
        projectiles,
        particles,
        camera
      );
    }
    if (this.classId === 'ines' || this.classId === 'kaelen' || this.classId === 'vespera') {
      return this.classBehavior.tryBasicAttack(
        worldMouseX,
        worldMouseY,
        spawner,
        projectiles,
        particles,
        camera,
        onHitStop
      );
    }
    return this.classBehavior.tryBasicAttack(
      worldMouseX,
      worldMouseY,
      spawner,
      particles,
      camera,
      onHitStop
    );
  }

  trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop) {
    if (this.inSafeZone || this.isInSafeZone()) {
      this.warnSafeZone(particles, 'SAFE ZONE — SKILLS DISABLED');
      return false;
    }
    if (
      this.dead ||
      this.statuses.cannotAct() ||
      this.ultimateActive ||
      this.lungeState !== 'none' ||
      this.groundBreakState !== 'none'
    ) {
      return false;
    }
    if (this.classId === 'rook') {
      return this.classBehavior.trySkill1(worldMouseX, worldMouseY, projectiles, particles, camera);
    }
    if (this.classId === 'kaelen' || this.classId === 'vespera') {
      return this.classBehavior.trySkill1(
        worldMouseX,
        worldMouseY,
        spawner,
        particles,
        camera,
        onHitStop
      );
    }
    return this.classBehavior.trySkill1(
      worldMouseX,
      worldMouseY,
      spawner,
      particles,
      camera,
      onHitStop
    );
  }

  trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop) {
    if (this.inSafeZone || this.isInSafeZone()) {
      this.warnSafeZone(particles, 'SAFE ZONE — SKILLS DISABLED');
      return false;
    }
    if (
      this.dead ||
      this.statuses.cannotAct() ||
      this.ultimateActive ||
      this.lungeState !== 'none' ||
      this.groundBreakState !== 'none'
    ) {
      return false;
    }
    if (this.classId === 'rook') {
      return this.classBehavior.trySkill2(worldMouseX, worldMouseY, projectiles, particles, camera);
    }
    if (this.classId === 'ines') {
      return this.classBehavior.trySkill2(particles);
    }
    if (this.classId === 'kaelen' || this.classId === 'vespera') {
      return this.classBehavior.trySkill2(
        worldMouseX,
        worldMouseY,
        spawner,
        particles,
        camera,
        onHitStop
      );
    }
    return this.classBehavior.trySkill2(
      worldMouseX,
      worldMouseY,
      spawner,
      particles,
      camera,
      onHitStop
    );
  }

  trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop) {
    if (this.inSafeZone || this.isInSafeZone()) {
      this.warnSafeZone(particles, 'SAFE ZONE — SKILLS DISABLED');
      return false;
    }
    if (
      this.dead ||
      this.statuses.cannotAct() ||
      this.ultimateActive ||
      this.lungeState !== 'none' ||
      this.groundBreakState !== 'none'
    ) {
      return false;
    }
    if (this.classId === 'rook') {
      return this.classBehavior.trySkill3(worldMouseX, worldMouseY, particles);
    }
    if (this.classId === 'ines') {
      return this.classBehavior.trySkill3(
        worldMouseX,
        worldMouseY,
        spawner,
        particles,
        camera,
        onHitStop
      );
    }
    if (this.classId === 'kaelen' || this.classId === 'vespera') {
      return this.classBehavior.trySkill3(
        worldMouseX,
        worldMouseY,
        spawner,
        particles,
        camera,
        onHitStop
      );
    }
    return this.classBehavior.trySkill3(
      worldMouseX,
      worldMouseY,
      projectiles,
      particles,
      camera
    );
  }

  useSkillByIndex(idx, worldMouseX, worldMouseY, spawner, projectiles, particles, camera, world, onHitStop) {
    if (idx < 0 || idx > 3) return false;
    if (this.dead || this.statuses.cannotAct() || this.ultimateActive) return false;
    if (this.inSafeZone || this.isInSafeZone(world)) {
      this.warnSafeZone(particles, 'SAFE ZONE — SKILLS DISABLED');
      return false;
    }

    const slotCdKey = `skill${idx + 1}`;
    if (this.cooldowns[slotCdKey] > 0.05) return false;

    const skillId = this.skillSlots ? this.skillSlots[idx] : null;
    if (!skillId) {
      if (idx === 0) return this.trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
      if (idx === 1) return this.trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
      if (idx === 2) return this.trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
      return false;
    }

    return this.executeSkillById(skillId, idx, worldMouseX, worldMouseY, spawner, projectiles, particles, camera, world, onHitStop);
  }

  executeSkillById(skillId, slotIdx, worldMouseX, worldMouseY, spawner, projectiles, particles, camera, world, onHitStop) {
    if (this.dead || this.statuses.cannotAct() || this.ultimateActive) return false;

    // Direct dispatches for original baseline skills
    if (skillId.includes(':base:lunge')) {
      return this.trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:ground-break')) {
      return this.trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:rail-parry')) {
      return this.trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:rivet-spread')) {
      return this.trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:kickback')) {
      return this.trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:rapid-fire')) {
      return this.trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:pull')) {
      return this.trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:spin-up')) {
      return this.trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:lump')) {
      return this.trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:naphtha-jet')) {
      return this.trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:caustic-mortar')) {
      return this.trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:vent-supernova')) {
      return this.trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:tesla-pylon')) {
      return this.trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:seeker-swarm')) {
      return this.trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (skillId.includes(':base:phase-blink')) {
      return this.trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }

    // Active Specialization Skills execution
    const allSkills = getAllSkillsForCharacter(this.classId);
    const skillDef = allSkills.find((s) => s.id === skillId);
    const staminaCost = skillDef?.staminaCost || 10;
    if (this.stamina < staminaCost) return false;

    const cdKey = `skill${slotIdx + 1}`;
    if (this.cooldowns[cdKey] > 0.05) return false;

    this.stamina -= staminaCost;
    const baseCd = skillDef?.cooldown || 6.0;
    const cdFloor = +(baseCd * 0.5).toFixed(2);
    const autoRank = this.level >= 45 ? 4 : this.level >= 30 ? 3 : this.level >= 15 ? 2 : 1;
    const rankCdRed = (autoRank - 1) * 0.4;
    const maxCd = Math.max(cdFloor, +(baseCd - rankCdRed).toFixed(2));
    this.cooldowns[cdKey] = maxCd;
    this.maxCooldowns[cdKey] = maxCd;

    const dx = worldMouseX - this.x;
    const dy = worldMouseY - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);

    this.facingX = Math.cos(angle) >= 0 ? 1 : -1;
    this.facingDir = angleTo4Facing(angle);

    sound.playHitMelee?.();

    // Check if player has an active fork mutation from the specialization tree
    const chosenFork = this.getSkillFork(skillDef?.id) ?? this.getSkillFork(skillDef?.name);
    let forkMult = 1.0;
    if (chosenFork !== null && chosenFork !== undefined) {
      if (chosenFork === 0) {
        forkMult = 1.25;
        const forkLabel = skillDef?.fork?.[0]?.split(/[\s(]/)[0] || 'FORK A';
        if (particles && typeof particles.spawnFloatingText === 'function') {
          particles.spawnFloatingText(this.x, this.y - 28, `[${forkLabel.toUpperCase()}]`, PALETTE.signal);
        }
      } else {
        forkMult = 1.45;
        const forkLabel = skillDef?.fork?.[1]?.split(/[\s(]/)[0] || 'FORK B';
        if (particles && typeof particles.spawnFloatingText === 'function') {
          particles.spawnFloatingText(this.x, this.y - 28, `[${forkLabel.toUpperCase()}]`, PALETTE.brass);
        }
      }
    }

    const atkDmg = Math.round(this.atk * forkMult);
    const skillName = (skillDef?.name || '').toLowerCase();
    const skillDmgType = inferSkillDamageType(skillDef?.name || skillId, this.classId);
    this.lastAttackDamageType = skillDmgType;

    // Dash / Movement skills
    if (
      skillName.includes('pin') ||
      skillName.includes('step') ||
      skillName.includes('surf') ||
      skillName.includes('dive') ||
      skillName.includes('kick') ||
      skillName.includes('northbound') ||
      skillName.includes('harpoon')
    ) {
      const travelDist = Math.min(dist, 160);
      const targetX = this.x + Math.cos(angle) * travelDist;
      const targetY = this.y + Math.sin(angle) * travelDist;
      const isBlocked = typeof obstacleManager?.isPointBlocked === 'function' && obstacleManager.isPointBlocked(targetX, targetY);
      if (!isBlocked) {
        this.x = targetX;
        this.y = targetY;
      }
      if (particles) {
        particles.spawnSlashArc(this.x, this.y, angle, 45, PALETTE.signal, 0.2);
        particles.spawnShockwave(this.x, this.y, 65, PALETTE.signal, 0.25);
      }
      if (spawner && typeof spawner.queryRadius === 'function') {
        const enemies = spawner.queryRadius(this.x, this.y, 75);
        for (const e of enemies) {
          if (e && e.active && e.hp > 0) {
            const isCrit = Math.random() < (this.critChance || 0.12);
            const hitAmt = Math.round(atkDmg * 2.0 * (isCrit ? this.critMult || 1.6 : 1.0));
            e.takeDamage(hitAmt, angle, 90, isCrit, this, spawner, particles, camera, null, skillDmgType);
          }
        }
        if (spawner.activeBoss && spawner.activeBoss.active) {
          const bDist = Math.hypot(spawner.activeBoss.x - this.x, spawner.activeBoss.y - this.y);
          if (bDist <= 85) {
            spawner.activeBoss.takeDamage(Math.round(atkDmg * 2.0), this, particles, camera);
          }
        }
      }
      return true;
    }

    // Ground AoE / Mortar / Stomp / Cloud / Press skills
    if (
      skillName.includes('stomp') ||
      skillName.includes('mortar') ||
      skillName.includes('crush') ||
      skillName.includes('press') ||
      skillName.includes('canister') ||
      skillName.includes('hand') ||
      skillName.includes('cloud') ||
      skillName.includes('storm') ||
      skillName.includes('grid') ||
      skillName.includes('coffin')
    ) {
      const impactDist = Math.min(dist, 180);
      const impactX = this.x + Math.cos(angle) * impactDist;
      const impactY = this.y + Math.sin(angle) * impactDist;

      if (particles) {
        particles.spawnTelegraphCircle(impactX, impactY, 75, 0.35, PALETTE.brass);
        setTimeout(() => {
          if (this.dead) return;
          if (particles) {
            particles.spawnShockwave(impactX, impactY, 90, PALETTE.rust, 0.35);
            particles.spawnSmokePuff(impactX, impactY, 12);
          }
          if (spawner && typeof spawner.queryRadius === 'function') {
            const enemies = spawner.queryRadius(impactX, impactY, 90);
            for (const e of enemies) {
              if (e && e.active && e.hp > 0) {
                const isCrit = Math.random() < (this.critChance || 0.12);
                const hitAmt = Math.round(atkDmg * 2.2 * (isCrit ? this.critMult || 1.6 : 1.0));
                e.takeDamage(hitAmt, angle, 110, isCrit, this, spawner, particles, camera, null, skillDmgType);
              }
            }
            if (spawner.activeBoss && spawner.activeBoss.active) {
              const bDist = Math.hypot(spawner.activeBoss.x - impactX, spawner.activeBoss.y - impactY);
              if (bDist <= 100) {
                spawner.activeBoss.takeDamage(Math.round(atkDmg * 2.2), this, particles, camera);
              }
            }
          }
          if (camera) camera.shake(3.5, 0.15);
        }, 150);
      }
      return true;
    }

    // Cone / Cleave / Beam / Projectile skills
    if (particles) {
      particles.spawnSlashArc(this.x, this.y, angle, 65, PALETTE.bone, 0.25);
      particles.spawnShockwave(this.x + Math.cos(angle) * 40, this.y + Math.sin(angle) * 40, 50, PALETTE.signal, 0.2);
    }
    if (spawner && typeof spawner.queryRadius === 'function') {
      const enemies = spawner.queryRadius(this.x + Math.cos(angle) * 50, this.y + Math.sin(angle) * 50, 95);
      for (const e of enemies) {
        if (e && e.active && e.hp > 0) {
          const isCrit = Math.random() < (this.critChance || 0.12);
          const hitAmt = Math.round(atkDmg * 1.8 * (isCrit ? this.critMult || 1.6 : 1.0));
          e.takeDamage(hitAmt, angle, 95, isCrit, this, spawner, particles, camera, null, skillDmgType);
        }
      }
      if (spawner.activeBoss && spawner.activeBoss.active) {
        const bDist = Math.hypot(spawner.activeBoss.x - this.x, spawner.activeBoss.y - this.y);
        if (bDist <= 110) {
          spawner.activeBoss.takeDamage(Math.round(atkDmg * 1.8), this, particles, camera);
        }
      }
    }
    if (camera) camera.shake(2.5, 0.12);
    return true;
  }

  tryUltimate(worldMouseX, worldMouseY, spawner, particles, camera) {
    if (this.inSafeZone || this.isInSafeZone()) {
      this.warnSafeZone(particles, 'SAFE ZONE — ULTIMATE DISABLED');
      return false;
    }
    if (
      this.dead ||
      this.statuses.cannotAct() ||
      this.ultimateActive ||
      this.lungeState !== 'none' ||
      this.groundBreakState !== 'none'
    ) {
      return false;
    }

    // Check if equipped ultimate is an awakened specialization ultimate
    const allSkills = getAllSkillsForCharacter(this.classId);
    const ultDef = allSkills.find((s) => s.id === this.ultimateSlot && s.type === 'ultimate');
    if (ultDef && ultDef.source !== 'Original') {
      if (this.ultimateCharge < 100) return false;
      this.ultimateCharge = 0;
      this.ultimateActive = true;

      const ultFork = this.getSkillFork(ultDef.id) ?? this.getSkillFork(ultDef.name);
      const isForkB = ultFork === 1;
      const ultDamage = Math.round(this.atk * (isForkB ? 6.5 : 5.0));

      sound.playExplosion?.();
      if (camera) camera.shake(6.0, 0.45);

      if (particles) {
        particles.spawnShockwave(this.x, this.y, 160, PALETTE.brass, 0.5);
        particles.spawnShockwave(this.x, this.y, 240, PALETTE.signal, 0.7);
        if (typeof particles.spawnFloatingText === 'function') {
          particles.spawnFloatingText(this.x, this.y - 36, `AWAKENING: ${ultDef.name.toUpperCase()}`, PALETTE.brass);
          if (ultFork !== null && ultFork !== undefined) {
            particles.spawnFloatingText(this.x, this.y - 48, isForkB ? '[FORK B: EPICENTER BURST]' : '[FORK A: EXTENDED FIELD]', PALETTE.signal);
          }
        }
      }

      const hitRadius = isForkB ? 180 : 250;
      if (spawner && typeof spawner.queryRadius === 'function') {
        const enemies = spawner.queryRadius(this.x, this.y, hitRadius);
        for (const e of enemies) {
          if (e && e.active && e.hp > 0) {
            e.takeDamage(ultDamage, 0, 180, true, this, spawner, particles, camera);
          }
        }
        if (spawner.activeBoss && spawner.activeBoss.active) {
          const bDist = Math.hypot(spawner.activeBoss.x - this.x, spawner.activeBoss.y - this.y);
          if (bDist <= hitRadius + 60) {
            spawner.activeBoss.takeDamage(ultDamage, this, particles, camera);
          }
        }
      }

      setTimeout(() => {
        this.ultimateActive = false;
      }, 500);

      return true;
    }

    return this.classBehavior.tryUltimate(
      worldMouseX,
      worldMouseY,
      spawner,
      particles,
      camera
    );
  }

  useUltimate(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, world, settings) {
    if (this.inSafeZone || this.isInSafeZone(world)) {
      this.warnSafeZone(particles, 'SAFE ZONE — ULTIMATE DISABLED');
      return false;
    }
    if (this.ultimates && typeof this.ultimates.tryCast === 'function') {
      return this.ultimates.tryCast(
        this,
        worldMouseX,
        worldMouseY,
        spawner,
        projectiles,
        particles,
        camera,
        world,
        settings
      );
    }
    return this.tryUltimate(worldMouseX, worldMouseY, spawner, particles, camera);
  }

  applyBurn(duration = 3.0, sourceAtk = 12, sourceName = 'Burn', particles = null) {
    return this.statuses.apply('burn', { duration, sourceAtk, sourceName }, this, particles);
  }

  applyStun(duration = 1.0, sourceName = 'Stun', particles = null) {
    return this.statuses.apply('stun', { duration, sourceName }, this, particles);
  }

  applySlow(duration = 2.0, value = 0.35, sourceName = 'Slow', particles = null) {
    return this.statuses.apply('slow', { duration, value, sourceName }, this, particles);
  }

  inflictBurn(target, duration = 3.0, sourceAtk = null, particles = null) {
    if (!target || !target.statuses) return false;
    return target.statuses.apply(
      'burn',
      { duration, sourceAtk: sourceAtk !== null ? sourceAtk : this.atk * 0.3, sourceName: this.getTitle() },
      target,
      particles
    );
  }

  inflictStun(target, duration = 1.0, particles = null) {
    if (!target || !target.statuses) return false;
    return target.statuses.apply('stun', { duration, sourceName: this.getTitle() }, target, particles);
  }

  inflictSlow(target, duration = 2.0, value = 0.35, particles = null) {
    if (!target || !target.statuses) return false;
    return target.statuses.apply('slow', { duration, value, sourceName: this.getTitle() }, target, particles);
  }

  takeDamage(rawDamage, sourceX, sourceY, particles, camera, sourceEntity = null, spawner = null, statusToApply = null) {
    if (
      this.godmode ||
      this.inSafeZone ||
      this.isInSafeZone() ||
      this.dead ||
      this.invulnTimer > 0 ||
      this.dodgeTimer > 0 ||
      this.ultimateActive ||
      this.statuses.isInvulnerable()
    ) {
      return false;
    }

    if (statusToApply) {
      if (typeof statusToApply === 'string') {
        if (statusToApply === 'burn') this.applyBurn(3.0, 12, 'Burn', particles);
        else if (statusToApply === 'stun') this.applyStun(1.0, 'Stun', particles);
        else if (statusToApply === 'slow') this.applySlow(2.0, 0.35, 'Slow', particles);
      } else if (typeof statusToApply === 'object' && statusToApply.id) {
        this.statuses.apply(statusToApply.id, statusToApply, this, particles);
      }
    }

    // Check Rail Parry window
    if ((this.parryTimer > 0 || this.statuses.has('parrying')) && this.classId === 'sena' && this.classBehavior) {
      this.parryTimer = 0;
      this.statuses.remove('parrying');
      this.invulnTimer = Math.max(this.invulnTimer, 0.35);
      if (typeof this.classBehavior.triggerRiposte === 'function') {
        this.classBehavior.triggerRiposte(sourceEntity, sourceX, sourceY, spawner, particles, camera);
      }
      return false; // 100% damage negated on successful parry!
    }

    // Check if attack is frontal for Sena's Brace / Guarding
    const hitFromAngle = Math.atan2(sourceY - this.y, sourceX - this.x);
    let isFrontal = false;
    if (this.classId === 'sena' && this.classBehavior && this.classBehavior.isGuarding) {
      const facingRad =
        this.facingDir === 'down'
          ? Math.PI * 0.5
          : this.facingDir === 'up'
          ? -Math.PI * 0.5
          : this.facingDir === 'left'
          ? Math.PI
          : 0;
      let diff = hitFromAngle - facingRad;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      isFrontal = Math.abs(diff) <= Math.PI * 0.65;

      // Perfect Block in first 0.2s reflects 100% ATK!
      if (isFrontal && this.classBehavior.guardActiveTime <= 0.2) {
        if (sourceEntity && sourceEntity.active && spawner) {
          sourceEntity.takeDamage(
            this.atk,
            hitFromAngle,
            120,
            true,
            this,
            spawner,
            particles,
            camera
          );
        }
        // Counterweight (Girder Master): perfect block restores 15 Stamina
        if (this.hasNode('counterweight')) {
          this.stamina = Math.min(this.maxStamina, this.stamina + 15);
        }
        if (particles) {
          particles.spawnDamageNumber(this.x, this.y - 24, 0, true, 'REFLECT!', PALETTE.signal);
        }
        sound.playSkillRailSpike();
      }
    }

    const pipe = computeDamagePipeline({
      baseDamage: rawDamage,
      atkBuffPct: 0,
      isCrit: false,
      targetStatuses: this.statuses,
      targetBaseDef: this.baseDefForPipeline,
      targetEquipDamageReduction: this.equipDamageReduction,
      isFrontalHit: isFrontal,
      sourceName: sourceEntity ? sourceEntity.name : 'Enemy',
      targetName: this.getTitleInfo().title,
    });

    if (pipe.blockedByInvuln) return false;
    const finalDmg = pipe.finalDamage;

    this.hp = Math.max(0, this.hp - finalDmg);
    this.hurtTimer = 0.24;
    this.invulnTimer = 0.35;
    this.outOfCombatTimer = 0;

    // Ultimate Charge from taking damage:
    // +0.8 for every 1% of max HP lost (counterweight doubles for Girder blocks)
    const hpLossPct = (finalDmg / Math.max(1, this.maxHp)) * 100;
    if (this.ultimates && typeof this.ultimates.addDamageTakenCharge === 'function') {
      this.ultimates.addDamageTakenCharge(
        this,
        hpLossPct,
        isFrontal && this.hasNode('counterweight')
      );
    } else {
      const chargeMult = isFrontal && this.hasNode('counterweight') ? 2.0 : 1.0;
      this.addUltimateCharge(finalDmg * 0.65 * chargeMult);
    }

    // Hold the Line (Girder Master): every hit taken during Dug In returns 80% ATK in a 120px burst
    if (this.statuses.has('dugIn') && spawner && typeof spawner.queryRadius === 'function') {
      const burstTargets = spawner.queryRadius(this.x, this.y, 120);
      if (particles) {
        particles.spawnShockwave(this.x, this.y, 120, PALETTE.signal, 0.2);
      }
      for (const e of burstTargets) {
        if (e.active && e.hp > 0) {
          e.takeDamage(
            Math.round(this.atk * 0.8),
            Math.atan2(e.y - this.y, e.x - this.x),
            90,
            false,
            this,
            spawner,
            particles,
            camera
          );
        }
      }
    }

    if (this.classId === 'sena' && this.classBehavior) {
      this.classBehavior.onTakeDamage();
    }

    // Stand Fast (Anvil Journeyman): immune to knockback while below 50% HP
    const immuneKnockback =
      this.hasNode('standFast') && this.hp <= this.maxHp * 0.5;
    if (!immuneKnockback) {
      const kbAngle = Math.atan2(this.y - sourceY, this.x - sourceX);
      this.x = this.clampCoord(this.x + Math.cos(kbAngle) * 6);
      this.y = this.clampCoord(this.y + Math.sin(kbAngle) * 6);
    }

    sound?.playPlayerHurt?.();
    camera?.shake?.(4, 0.14);

    if (particles) {
      const incomingDmgType = inferIncomingPlayerDamageType(sourceEntity, statusToApply);
      const isHeavyCritHit =
        Boolean(sourceEntity && (sourceEntity.isKingBoss || sourceEntity.tier === 'boss')) &&
        finalDmg >= this.maxHp * 0.18;
      particles.spawnBurst(
        this.x,
        this.y,
        5,
        incomingDmgType === 'magical' ? '#FF58B0' : PALETTE.blood,
        30,
        85,
        2,
        0.24
      );
      particles.spawnDamageNumber(
        this.x,
        this.y - 18,
        finalDmg,
        isHeavyCritHit,
        null,
        null,
        {
          damageType: incomingDmgType,
          targetType: 'player',
        }
      );
    }

    if (this.hp <= 0) {
      this.dead = true;
      this.deathAnimTimer = 0;
      this.animState = 'death';
    }

    return true;
  }

  respawnAtKettle() {
    this.animState = 'idle';
    this.x = DUSKHOLLOW_TOWN?.spawnPoint?.x ?? 3000;
    this.y = DUSKHOLLOW_TOWN?.spawnPoint?.y ?? 3040;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.deathAnimTimer = 0;
    this.hurtTimer = 0;
    this.invulnTimer = 1.2;
    this.lungeState = 'none';
    this.groundBreakState = 'none';
    this.ultimateActive = false;
    this.statuses.clearCombatStatusesOnLoad();
    this.recalculateStats(true);
    return;
  }

  update(dt, input, arg2, arg3, arg4, arg5, arg6, arg7) {
    let spawner, projectiles, particles, camera, world, onHitStop;

    if (arg2 && (typeof arg2.getAreaAt === 'function' || typeof arg2.getZoneAt === 'function')) {
      // Called as: (dt, input, world, enemies/spawner, projectiles, particles, camera, onHitStop/spawner)
      world = arg2;
      spawner = (arg7 && arg7.pool) ? arg7 : (arg3 && arg3.pool ? arg3 : arg3);
      projectiles = arg4;
      particles = arg5;
      camera = arg6;
      onHitStop = typeof arg7 === 'function' ? arg7 : null;
    } else {
      // Standard signature: (dt, input, spawner, projectiles, particles, camera, world, onHitStop)
      spawner = arg2;
      projectiles = arg3;
      particles = arg4;
      camera = arg5;
      world = arg6;
      onHitStop = arg7;
    }

    this.animClock += dt;
    this.outOfCombatTimer += dt;

    if (this.dead) {
      this.deathAnimTimer += dt;
      this._updateScarf(dt, 0, 0, world);
      return;
    }

    // 1. Update StatusSystem (DoTs, timers, DR window)
    this.statuses.update(dt, this, particles, (dotDmg) => {
      if (!this.dead && !this.statuses.isInvulnerable()) {
        this.hp = Math.max(1, this.hp - dotDmg);
      }
    });

    // Tick Tavern Meal & Elixir Buff timers
    if (this.tavernMeal && this.tavernMeal.timer > 0) {
      this.tavernMeal.timer = Math.max(0, this.tavernMeal.timer - dt);
      if (this.tavernMeal.timer <= 0) {
        this.tavernMeal = null;
        this.recalculateStats(false);
      }
    }
    if (this.elixirBuff && this.elixirBuff.timer > 0) {
      this.elixirBuff.timer = Math.max(0, this.elixirBuff.timer - dt);
      if (this.elixirBuff.timer <= 0) {
        this.elixirBuff = null;
      }
    }

    // 2. Check World Status Sources:
    // - Sanctuary Bonfire in Duskhollow Town (Floor 0) or Wandering Merchant Mob-Repellent Ward (Floors 1-5)
    const isFloor0 = !worldLedger || worldLedger.currentFloor === 0;
    const distToCampfire = Math.hypot(
      this.x - WORLD_CONFIG.campfirePosition.x,
      this.y - WORLD_CONFIG.campfirePosition.y
    );
    const inRepellentWard =
      !isFloor0 &&
      worldLedger &&
      typeof worldLedger.isInsideMobRepellentWard === 'function' &&
      worldLedger.isInsideMobRepellentWard(this.x, this.y);

    if ((isFloor0 && distToCampfire <= 110) || inRepellentWard) {
      this.statuses.apply(
        'warmed',
        { duration: 0.5, sourceName: isFloor0 ? 'Sanctuary Pyre' : 'Repellent Ward' },
        this,
        null
      );
      this.statuses.cleanseAllDebuffs();
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.025 * dt);
    } else {
      this.statuses.remove('warmed');
    }

    // - Fed out-of-combat regen (+1 HP/s when out of combat for > 3s)
    if (this.statuses.has('fed') && this.outOfCombatTimer >= 3.0) {
      this.hp = Math.min(this.maxHp, this.hp + 1.0 * dt);
    }

    // - Area environmental hazards (outside safe zones)
    const area = world && typeof world.getAreaAt === 'function'
      ? world.getAreaAt(this.x, this.y)
      : (world && typeof world.getZoneAt === 'function' ? world.getZoneAt(this.x, this.y) : null);
    this.inSafeZone = this.isInSafeZone(world);
    if (this.safeZoneWarnTimer > 0) {
      this.safeZoneWarnTimer = Math.max(0, this.safeZoneWarnTimer - dt);
    }
    if (area && !area.safe && world) {
      const tx = Math.floor(this.x / 16);
      const ty = Math.floor(this.y / 16);
      const h = typeof world._hash === 'function' ? world._hash(tx, ty) : 0;

      // Lye Marsh puddles: 1 Corrode stack per second while standing in them
      if (area.id === 'lyeMarsh' && ((h >> 3) % 7) < 2) {
        this.marshCorrodeTimer += dt;
        if (this.marshCorrodeTimer >= 1.0) {
          this.marshCorrodeTimer = 0;
          this.statuses.apply('corrode', { duration: 8.0, sourceName: 'Lye Marsh Pool' }, this, particles);
        }
      } else {
        this.marshCorrodeTimer = 0;
      }

      // Route 9 burning cars: Burn when within 40px (once per 2s)
      if (area.id === 'route9' && h % 37 === 0 && Math.abs(this.y - 3000) >= 160) {
        this.carBurnTimer += dt;
        if (this.carBurnTimer >= 2.0) {
          this.carBurnTimer = 0;
          this.statuses.apply(
            'burn',
            { duration: 3.0, sourceAtk: 12, sourceName: 'Burning Wreck' },
            this,
            particles
          );
        }
      }

      // Copper Flats dust storm: Choked while storm is active and outside a prop shelter
      if (area.id === 'copperFlats' && world.stormFactor > 0.35 && h % 29 !== 0) {
        this.stormChokeTimer += dt;
        if (this.stormChokeTimer >= 1.2) {
          this.stormChokeTimer = 0;
          this.statuses.apply('choked', { duration: 6.0, sourceName: 'Dust Storm' }, this, null);
        }
      }
    }

    // Recalculate dynamic stats affected by active statuses/scrap orbit
    this.recalculateStats(false);

    // Developer Cheats maintenance
    if (this.godmode) {
      this.hp = this.maxHp;
      this.dead = false;
      this.invulnTimer = Math.max(this.invulnTimer, 0.5);
    }
    if (this.infiniteStamina) {
      this.stamina = this.maxStamina;
    }
    if (this.noCooldowns) {
      for (const key of Object.keys(this.cooldowns)) {
        this.cooldowns[key] = 0;
      }
    }

    // Cooldowns & timers
    for (const key of Object.keys(this.cooldowns)) {
      if (this.cooldowns[key] > 0) {
        this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
      }
    }
    if (this.hurtTimer > 0) this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    if (this.comboResetTimer > 0) this.comboResetTimer = Math.max(0, this.comboResetTimer - dt);
    if (this.attackTimer > 0) this.attackTimer = Math.max(0, this.attackTimer - dt);
    if (this.railSpikeTimer > 0) this.railSpikeTimer = Math.max(0, this.railSpikeTimer - dt);
    if (this.parryTimer > 0) this.parryTimer = Math.max(0, this.parryTimer - dt);

    // Stamina regeneration (paused while sprinting)
    if (!this.isSprinting) {
      this.stamina = Math.min(
        this.maxStamina,
        this.stamina + this.getStaminaRegenPerSec() * dt
      );
    }

    // Update Class Behavior module
    this._lastSpawner = spawner;
    this._lastCamera = camera;
    if (input && Number.isFinite(input.worldMouseX)) {
      this._lastWorldMouseX = input.worldMouseX;
      this._lastWorldMouseY = input.worldMouseY;
    }
    if (this.classId === 'rook' || this.classId === 'ines' || this.classId === 'kaelen' || this.classId === 'vespera') {
      this.classBehavior.update(dt, input, spawner, projectiles, particles, camera, onHitStop);
    } else {
      this.classBehavior.update(dt, input, spawner, particles, camera);
    }

    // 3. Update Generic Ultimate Sequencer (runs all 9 class ultimates from /src/data/ultimates.js)
    if (this.ultimates) {
      this.ultimates.update(
        dt,
        this,
        input,
        spawner,
        projectiles,
        particles,
        camera,
        world,
        this.accessibility || { reduceFlashes: false, shortUltimates: false }
      );
      if (this.ultimates.active && this.ultimates.movementLocked) {
        this.vx = 0;
        this.vy = 0;
        this._updateScarf(dt, 0, 0, world);
        return;
      }
    }

    // Fallback legacy Seven Cuts timeline if active
    if (this.classId === 'sena' && this.ultimateActive) {
      this._updateSevenCuts(dt, spawner, particles, camera);
      this._updateScarf(dt, 0, 0, world);
      return;
    }

    // 4. Handle Sena's Lunge state machine
    if (this.lungeState !== 'none') {
      this.lungeTimer -= dt;
      if (this.lungeState === 'crouch' && this.lungeTimer <= 0) {
        this.lungeState = 'dash';
        this.lungeTimer = 0.14;
        const x1 = this.lungeStartX;
        const y1 = this.lungeStartY;
        const x2 = this.lungeEndX;
        const y2 = this.lungeEndY;
        this.lungeAfterimages = [
          {
            x: Math.round(x1 + (x2 - x1) * 0.25),
            y: Math.round(y1 + (y2 - y1) * 0.25),
            tier: 'dither15',
            life: 0.16,
          },
          {
            x: Math.round(x1 + (x2 - x1) * 0.52),
            y: Math.round(y1 + (y2 - y1) * 0.52),
            tier: 'dither35',
            life: 0.16,
          },
          {
            x: Math.round(x1 + (x2 - x1) * 0.78),
            y: Math.round(y1 + (y2 - y1) * 0.78),
            tier: 'dither60',
            life: 0.16,
          },
        ];
        this.classBehavior.executeLungeImpact(spawner, particles, camera, onHitStop);
      } else if (this.lungeState === 'dash' && this.lungeTimer <= 0) {
        this.lungeState = 'skid';
        this.lungeTimer = 2 / 12;
        particles.spawnDustPuff(this.x, this.y + 10, 2, Math.cos(this.lungeAngle) * 20, 0);
      } else if (this.lungeState === 'skid' && this.lungeTimer <= 0) {
        this.lungeState = 'none';
      }
      this._updateScarf(dt, Math.cos(this.lungeAngle) * 260, Math.sin(this.lungeAngle) * 260, world);
      return;
    }

    // 5. Handle Sena's Ground Break state machine
    if (this.groundBreakState !== 'none') {
      this.groundBreakTimer -= dt;
      if (this.groundBreakState === 'raise' && this.groundBreakTimer <= 0) {
        this.groundBreakState = 'slam';
        this.groundBreakTimer = 0.22;
        this.classBehavior.executeGroundBreakImpact(spawner, particles, camera, onHitStop);
      } else if (this.groundBreakState === 'slam' && this.groundBreakTimer <= 0) {
        this.groundBreakState = 'none';
      }
      this._updateScarf(dt, 0, 0, world);
      return;
    }

    // 6. Dodge Roll movement
    if (this._pendingObservedDodgeAngle !== undefined && spawner) {
      tacticalSystem.recordPlayerDodge(this, this._pendingObservedDodgeAngle, spawner);
      this._pendingObservedDodgeAngle = undefined;
    }

    if (this.dodgeTimer > 0) {
      this.dodgeTimer = Math.max(0, this.dodgeTimer - dt);
      this.x = this.clampCoord(this.x + this.dodgeVx * dt);
      this.y = this.clampCoord(this.y + this.dodgeVy * dt);
      const obsRes = obstacleManager.resolveEntityCollision(this.x, this.y, this.radius);
      this.x = this.clampCoord(obsRes.x);
      this.y = this.clampCoord(obsRes.y);
      this.animState = 'dodge';
      this.dodgeDustTick += dt;
      if (this.dodgeDustTick >= 0.07 && particles) {
        this.dodgeDustTick = 0;
        particles.spawnDustPuff(this.x, this.y + 10, 1, 0, 0);
      }
      this._updateScarf(dt, this.dodgeVx, this.dodgeVy, world);
      return;
    }

    // 7. Standard WASD Movement (blocked if Stunned, Pinned, Lifted, or Ten Count charging)
    let moveX = 0;
    let moveY = 0;
    const canMove =
      !this.statuses.cannotMove() &&
      !(this.classId === 'rook' && this.classBehavior.tenCountState === 'charging');

    let isSprinting = false;
    if (canMove && input) {
      const keys = input.keys || input;
      const isUp = !!(input.up || keys.KeyW || keys.ArrowUp || keys.up);
      const isDown = !!(input.down || keys.KeyS || keys.ArrowDown || keys.down);
      const isLeft = !!(input.left || keys.KeyA || keys.ArrowLeft || keys.left);
      const isRight = !!(input.right || keys.KeyD || keys.ArrowRight || keys.right);
      const shiftPressed = !!(keys.ShiftLeft || keys.ShiftRight || input.ShiftLeft || input.ShiftRight);

      if (isUp) moveY -= 1;
      if (isDown) moveY += 1;
      if (isLeft) moveX -= 1;
      if (isRight) moveX += 1;

      if (shiftPressed && this.stamina > 0 && (moveX !== 0 || moveY !== 0)) {
        isSprinting = true;
      }
    }
    this.isSprinting = isSprinting;

    const moveLen = Math.hypot(moveX, moveY);
    if (moveLen > 0) {
      moveX /= moveLen;
      moveY /= moveLen;
      let moveMult = (this.attackTimer > 0 ? 0.45 : 1.0) * obstacleManager.getHazardSpeedMultiplier(this);

      if (this.isSprinting) {
        moveMult *= 1.50; // +50% sprint speed boost
        this.stamina = Math.max(0, this.stamina - 14 * dt);
        if (this.stamina <= 0) {
          this.isSprinting = false;
        }
        this.sprintDustTick = (this.sprintDustTick || 0) + dt;
        if (this.sprintDustTick >= 0.14 && particles && typeof particles.spawnDustPuff === 'function') {
          this.sprintDustTick = 0;
          particles.spawnDustPuff(this.x, this.y + 10, 1, -moveX * 16, -moveY * 16);
        }
      }

      this.vx = moveX * this.speed * moveMult;
      this.vy = moveY * this.speed * moveMult;
      this.x = this.clampCoord(this.x + this.vx * dt);
      this.y = this.clampCoord(this.y + this.vy * dt);
      const obsRes = obstacleManager.resolveEntityCollision(this.x, this.y, this.radius);
      this.x = this.clampCoord(obsRes.x);
      this.y = this.clampCoord(obsRes.y);

      if (this.attackTimer <= 0) {
        this.facingDir = angleTo4Facing(Math.atan2(moveY, moveX));
        if (Math.abs(moveX) > 0.1) this.facingX = moveX >= 0 ? 1 : -1;
      }
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    // 8. Basic Attack: triggered by left click or while holding left mouse (blocked in Safe Zone)
    if (input && input.mouseDown && this.attackTimer <= 0 && !this.inSafeZone) {
      this.tryBasicAttack(
        input.worldMouseX,
        input.worldMouseY,
        spawner,
        projectiles,
        particles,
        camera,
        onHitStop
      );
    }

    // Update animation state
    if (this.hurtTimer > 0) {
      this.animState = 'hurt';
    } else if (this.attackTimer > 0) {
      const step = Math.max(1, Math.min(3, this.comboStep || 1));
      this.animState = `attack${step}`;
    } else if (moveLen > 0) {
      this.animState = 'run';
    } else {
      this.animState = 'idle';
    }

    // Fade Lunge afterimages
    for (let i = this.lungeAfterimages.length - 1; i >= 0; i--) {
      this.lungeAfterimages[i].life -= dt;
      if (this.lungeAfterimages[i].life <= 0) {
        this.lungeAfterimages.splice(i, 1);
      }
    }

    this._updateScarf(dt, this.vx, this.vy, world);
  }

  _updateSevenCuts(dt, spawner, particles, camera) {
    this.ultimatePhaseTimer += dt;
    if (this.ultimateInvertFrames > 0) this.ultimateInvertFrames--;

    const totalCuts = this.ultimateTotalCuts || 7;
    const cutStart = 0.16;
    const cutInterval = 0.80 / totalCuts;

    if (
      this.ultimateCutIndex < totalCuts &&
      this.ultimatePhaseTimer >= cutStart + this.ultimateCutIndex * cutInterval
    ) {
      this.ultimateCutIndex++;
      this.ultimateInvertFrames = 2;
      sound.playUltimateCut(this.ultimateCutIndex - 1);

      const pool = this.ultimateTargetPool.filter((e) => e.active);
      if (pool.length > 0) {
        const target = pool[(this.ultimateCutIndex - 1) % pool.length];
        const ang = (this.ultimateCutIndex * 2.15) % (Math.PI * 2);
        const len = 52;
        particles.spawnSlash(
          target.x - Math.cos(ang) * len,
          target.y - Math.sin(ang) * len,
          target.x + Math.cos(ang) * len,
          target.y + Math.sin(ang) * len,
          PALETTE.bone,
          0.35,
          'sevenCuts'
        );
        this.x = Math.round(target.x + Math.cos(ang) * 18);
        this.y = Math.round(target.y + Math.sin(ang) * 18);
      } else {
        const ang = this.ultimateCutIndex * 1.9;
        particles.spawnSlash(
          this.ultimateOriginX - Math.cos(ang) * 70,
          this.ultimateOriginY - Math.sin(ang) * 70,
          this.ultimateOriginX + Math.cos(ang) * 70,
          this.ultimateOriginY + Math.sin(ang) * 70,
          PALETTE.bone,
          0.35,
          'sevenCuts'
        );
      }
    }

    // Final release after 200ms silence
    if (!this.ultimateReleased && this.ultimatePhaseTimer >= 1.16) {
      this.ultimateReleased = true;
      this.x = this.ultimateOriginX;
      this.y = this.ultimateOriginY;
      sound.playUltimateReleaseCrack();
      camera.shake(9, 0.3);

      const pool = this.ultimateTargetPool.filter((e) => e.active && e.hp > 0);
      const perTargetBase =
        pool.length > 0 ? this.ultimateTotalDamage / pool.length : this.ultimateTotalDamage;
      const hasNineCuts = this.hasNode('nineCuts');

      for (let i = 0; i < pool.length; i++) {
        const enemy = pool[i];
        const pipe = computeDamagePipeline({
          baseDamage: Math.max(this.baseAtkForPipeline * 1.8, perTargetBase),
          atkBuffPct: this.statuses.getAtkBonusPct(),
          isCrit: true,
          critMult: this.critMult,
          targetStatuses: enemy.statuses,
          targetBaseDef: enemy.def || 0,
          sourceName: hasNineCuts ? 'Nine Cuts' : 'Seven Cuts',
          targetName: enemy.name,
        });

        enemy.takeDamage(
          pipe.finalDamage,
          0,
          160,
          true,
          this,
          spawner,
          particles,
          camera
        );

        if (hasNineCuts && enemy.active) {
          enemy.statuses.apply(
            'bleed',
            { duration: 4.0, sourceAtk: this.atk, sourceName: 'Nine Cuts' },
            enemy,
            particles
          );
        }
      }
    }

    if (this.ultimatePhaseTimer >= 1.38) {
      this.ultimateActive = false;
    }
  }

  _updateScarf(dt, vx, vy, world) {
    const neckX = this.x - this.facingX * 2;
    const neckY = this.y - 7;
    this.scarfNodes[0].x = neckX;
    this.scarfNodes[0].y = neckY;

    const wind =
      world && typeof world.windPhase === 'number'
        ? Math.sin(world.windPhase * 2.2) * 14
        : 6;
    const segLen = 2.4;

    for (let i = 1; i < this.scarfNodes.length; i++) {
      const prev = this.scarfNodes[i - 1];
      const cur = this.scarfNodes[i];

      cur.x += (-vx * 0.08 - this.facingX * 18 + wind) * dt;
      cur.y += (-vy * 0.08 + 10 + Math.cos(this.animClock * 5 + i) * 8) * dt;

      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist > segLen) {
        cur.x = prev.x + (dx / dist) * segLen;
        cur.y = prev.y + (dy / dist) * segLen;
      }
    }
  }

  getPortraitExpression() {
    if (this.ultimateActive) return 'ultimate';
    if (this.hurtTimer > 0 || (this.hp > 0 && this.hp / this.maxHp < 0.28)) return 'hurt';
    return 'normal';
  }

  draw(ctx, camera) {
    if (!this.sprites) this.rebuildSprites();
    if (!this.sprites) return;

    const camX = camera.renderX;
    const camY = camera.renderY;

    // 1. Draw Lunge dithered afterimages
    for (let i = 0; i < this.lungeAfterimages.length; i++) {
      const ai = this.lungeAfterimages[i];
      const sheet = this.sprites.run;
      const key = `${ai.tier}${this.facingX >= 0 ? 'Right' : 'Left'}`;
      const frames = sheet[key];
      if (frames && frames[0]) {
        ctx.drawImage(
          frames[0],
          Math.round(ai.x - camX - 24),
          Math.round(ai.y - camY - 29)
        );
      }
    }

    const s = camera.worldToScreen(this.x, this.y);
    const sx = Math.round(s.x);
    const sy = Math.round(s.y);

    // 2. Crisp ground shadow oval beneath character feet
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(sx - 6, sy + 10, 12, 3);

    // 3. Draw 6-segment Bone Scarf with stenciled rust stripe for Sena
    if (this.classId === 'sena' && !this.dead && this.animState !== 'dodge') {
      for (let i = this.scarfNodes.length - 1; i >= 1; i--) {
        const n = this.scarfNodes[i];
        const nx = Math.round(n.x - camX);
        const ny = Math.round(n.y - camY);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(nx - 1, ny, 3, 3);
        ctx.fillStyle = i === 4 ? PALETTE.rust : PALETTE.bone;
        ctx.fillRect(nx - 1, ny - 1, 3, 2);
      }
    }

    // 4. Select animation frame (12 fps step, or 70% speed when Slowed)
    const sheet = this.sprites[this.animState] || this.sprites.idle;
    const dirFrames = sheet[this.facingDir] || sheet.right;
    const fps = this.statuses.has('slow') ? 8.4 : 12;
    let frameIdx = Math.floor(this.animClock * fps) % dirFrames.length;

    if (this.animState.startsWith('attack')) {
      const progress = 1 - this.attackTimer / Math.max(0.01, this.attackDuration);
      frameIdx = Math.min(dirFrames.length - 1, Math.floor(progress * dirFrames.length));
    } else if (this.animState === 'death') {
      frameIdx = Math.min(dirFrames.length - 1, Math.floor(this.deathAnimTimer * 8));
    }

    const frameCanvas =
      this.hurtTimer > 0.14
        ? (this.facingX >= 0 ? sheet.whiteRight : sheet.whiteLeft)[frameIdx] || dirFrames[frameIdx]
        : dirFrames[frameIdx];

    if (frameCanvas) {
      const liftY = this.groundBreakState === 'raise' ? -5 : 0;
      ctx.drawImage(frameCanvas, sx - 24, sy - 29 + liftY);
    }

    // 5. Draw Class-Specific Extras (Rook traps/reload bar/aim line, Ines Scrap Orbit/Pull/Scrapfall, Sena Brace/DugIn)
    if (this.classBehavior && this.classBehavior.drawClassExtras) {
      this.classBehavior.drawClassExtras(ctx, camera);
    }

    // 6. Draw Status Effect & Buff Visuals on Player
    this.statuses.drawEffectsOnEntity(ctx, sx, sy, this.radius, this.animClock);
  }

  /**
   * Draws Ultimate Cut-In Eye Banner across the 480x270 viewport (Sena, Rook, or Ines)
   */
  drawUltimateOverlay(ctx, width, height) {
    let showCutIn = false;
    if (this.classId === 'sena' && this.ultimateActive && this.ultimatePhaseTimer < 0.22) {
      showCutIn = true;
    } else if (
      this.classId === 'rook' &&
      this.classBehavior &&
      this.classBehavior.tenCountState !== 'none' &&
      this.classBehavior.tenCountTimer < 0.25
    ) {
      showCutIn = true;
    } else if (
      this.classId === 'ines' &&
      this.ultimateActive &&
      this.classBehavior &&
      this.classBehavior.activeZones.some((z) => z.kind === 'scrapfall' && z.timer < 0.25)
    ) {
      showCutIn = true;
    }

    if (this.classId === 'sena' && this.ultimateActive) {
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(0, 0, width, 24);
      ctx.fillRect(0, height - 24, width, 24);
    }

    if (showCutIn) {
      const cutCanvas =
        spriteRegistry.cutInCanvases[this.classId] || spriteRegistry.cutInCanvas;
      const accent =
        this.classId === 'rook'
          ? PALETTE.brass
          : this.classId === 'ines'
          ? PALETTE.verdigris
          : this.classId === 'kaelen'
          ? PALETTE.ember
          : this.classId === 'vespera'
          ? PALETTE.volt
          : PALETTE.signal;

      if (cutCanvas) {
        const bannerY = 58;
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, bannerY - 3, width, 38);
        ctx.fillStyle = accent;
        ctx.fillRect(0, bannerY - 3, width, 2);
        ctx.fillRect(0, bannerY + 33, width, 2);
        ctx.drawImage(cutCanvas, 0, 0, 64, 16, 176, bannerY, 128, 32);
      }
    }
  }
}

export default Player;
