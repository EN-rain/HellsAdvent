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
import {
  angleTo4Facing,
  drawPixelLine,
  drawBresenhamCircle,
} from './PixelArt.js';
import { bakePlayerSprites, spriteRegistry } from './Sprites.js';
import { sound } from './Audio.js';
import { UltimateSequencer } from './Ultimates.js';

export class Player {
  constructor(classId = 'sena') {
    spriteRegistry.init();

    this.x = WORLD_CONFIG.kettleCenter.x;
    this.y = WORLD_CONFIG.kettleCenter.y + 42;
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

    // Cooldowns (keyed by skill1, skill2, skill3, dodge + legacy aliases)
    this.cooldowns = {
      skill1: 0,
      skill2: 0,
      skill3: 0,
      dodge: 0,
    };
    this.maxCooldowns = {
      skill1: 5.0,
      skill2: 9.0,
      skill3: 6.0,
      dodge: 1.2,
    };

    this.ultimateCharge = 0;
    this.ultimateActive = false;

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

  gainXp(val, particles = null) {
    this.gainXpAndGold(val, 0, particles);
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

  toggleGuardStance(particles = null) {
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
    return false;
  }

  toJSON() {
    return {
      classId: this.classId,
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
    };
  }

  fromJSON(data) {
    if (!data) return;
    this.classId = data.classId || 'sena';
    this.stage = data.stage || 1;
    this.branch = data.branch || null;
    this.level = data.level || 1;
    this.xp = data.xp || 0;
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

    const prevMaxHp = this.maxHp || maxHp;
    this.maxHp = maxHp;
    this.maxStamina = maxStamina;
    this.dodgeCooldownMax = Math.max(0.45, PLAYER_CONFIG.dodge.cooldown - dodgeCdRed);

    // Update skill max cooldowns
    const skillList = Array.isArray(cfg.skills)
      ? cfg.skills
      : (cfg.skillOrder || Object.keys(cfg.skills || {})).map((id) => cfg.skills[id]).filter(Boolean);
    for (let i = 0; i < skillList.length; i++) {
      const sk = skillList[i];
      if (sk && sk.getStats) {
        const st = sk.getStats(this.skills[sk.id] || 1, this.ownedNodes);
        this.maxCooldowns[`skill${i + 1}`] = st.cooldown;
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

  gainXpAndGold(xpAmount, goldAmount, particles) {
    const bountyMult = this.statuses.getXpAndGoldMultiplier();
    const finalXp = Math.round(xpAmount * bountyMult);
    const finalGold = Math.round(goldAmount * bountyMult);

    this.gold += Math.max(0, finalGold);
    if (this.level >= PLAYER_CONFIG.levelCap) return;

    this.xp += Math.max(0, finalXp);
    while (this.level < PLAYER_CONFIG.levelCap && this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.skillPoints += 1; // +1 point per level from level 2 to 30 (29 points total)
      this.xpToNext = PLAYER_CONFIG.xpForNextLevel(this.level);
      this.recalculateStats(false);

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
  tryDodge(moveX, moveY, worldMouseX, worldMouseY, particles) {
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
    } else {
      const ang = Math.atan2(worldMouseY - this.y, worldMouseX - this.x);
      dx = Math.cos(ang);
      dy = Math.sin(ang);
    }

    const dodgeDistMult =
      this.classId === 'rook' ? 1 + (this.passives.lightStep || 0) * 0.10 : 1.0;

    this.dodgeVx = dx * PLAYER_CONFIG.dodge.speed * dodgeDistMult;
    this.dodgeVy = dy * PLAYER_CONFIG.dodge.speed * dodgeDistMult;
    this.facingDir = angleTo4Facing(Math.atan2(dy, dx));
    if (Math.abs(dx) > 0.1) this.facingX = dx >= 0 ? 1 : -1;

    if (this.classId === 'rook' && this.classBehavior) {
      this.classBehavior.onDodgeRoll(this.x, this.y, particles);
    }

    sound.playDodge();
    if (particles) {
      particles.spawnDustPuff(this.x, this.y + 10, 2, -dx * 28, -dy * 28);
    }
    return true;
  }

  // --- DELEGATED BASIC ATTACK, SKILLS 1/2/3, & ULTIMATE ---

  tryBasicAttack(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop) {
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
    if (this.classId === 'ines') {
      return this.classBehavior.tryBasicAttack(
        worldMouseX,
        worldMouseY,
        spawner,
        projectiles,
        particles,
        camera
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
    if (this.classId === 'ines') {
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
    return this.classBehavior.trySkill3(
      worldMouseX,
      worldMouseY,
      projectiles,
      particles,
      camera
    );
  }

  useSkillByIndex(idx, worldMouseX, worldMouseY, spawner, projectiles, particles, camera, world, onHitStop) {
    if (idx === 0) {
      return this.trySkill1(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (idx === 1) {
      return this.trySkill2(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    if (idx === 2) {
      return this.trySkill3(worldMouseX, worldMouseY, spawner, projectiles, particles, camera, onHitStop);
    }
    return false;
  }

  tryUltimate(worldMouseX, worldMouseY, spawner, particles, camera) {
    if (
      this.dead ||
      this.statuses.cannotAct() ||
      this.ultimateActive ||
      this.lungeState !== 'none' ||
      this.groundBreakState !== 'none'
    ) {
      return false;
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

  takeDamage(rawDamage, sourceX, sourceY, particles, camera, sourceEntity = null, spawner = null) {
    if (
      this.dead ||
      this.invulnTimer > 0 ||
      this.dodgeTimer > 0 ||
      this.ultimateActive ||
      this.statuses.isInvulnerable()
    ) {
      return false;
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

    sound.playPlayerHurt();
    camera.shake(4, 0.14);

    if (particles) {
      particles.spawnBurst(this.x, this.y, 5, PALETTE.blood, 30, 85, 2, 0.24);
      particles.spawnDamageNumber(
        this.x,
        this.y - 18,
        finalDmg,
        false,
        `-${finalDmg}`,
        PALETTE.blood
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
    this.x = WORLD_CONFIG.kettleCenter.x;
    this.y = WORLD_CONFIG.kettleCenter.y + 42;
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

    // 2. Check World Status Sources:
    // - Campfire at Kettle (within 80px): Warmed (+2% max HP/s and clears debuffs)
    const distToCampfire = Math.hypot(
      this.x - WORLD_CONFIG.campfirePosition.x,
      this.y - WORLD_CONFIG.campfirePosition.y
    );
    if (distToCampfire <= 80) {
      this.statuses.apply('warmed', { duration: 0.5, sourceName: 'Campfire' }, this, null);
      this.statuses.cleanseAllDebuffs();
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.02 * dt);
    } else {
      this.statuses.remove('warmed');
    }

    // - Fed out-of-combat regen (+1 HP/s when out of combat for > 3s)
    if (this.statuses.has('fed') && this.outOfCombatTimer >= 3.0) {
      this.hp = Math.min(this.maxHp, this.hp + 1.0 * dt);
    }

    // - Area environmental hazards (outside Kettle)
    const area = world && typeof world.getAreaAt === 'function'
      ? world.getAreaAt(this.x, this.y)
      : (world && typeof world.getZoneAt === 'function' ? world.getZoneAt(this.x, this.y) : null);
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
    if (this.classId === 'rook') {
      this.classBehavior.update(dt, input, spawner, projectiles, particles, camera, onHitStop);
    } else if (this.classId === 'ines') {
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
    if (this.dodgeTimer > 0) {
      this.dodgeTimer = Math.max(0, this.dodgeTimer - dt);
      this.x = this.clampCoord(this.x + this.dodgeVx * dt);
      this.y = this.clampCoord(this.y + this.dodgeVy * dt);
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
      let moveMult = this.attackTimer > 0 ? 0.45 : 1.0;

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

      if (this.attackTimer <= 0) {
        this.facingDir = angleTo4Facing(Math.atan2(moveY, moveX));
        if (Math.abs(moveX) > 0.1) this.facingX = moveX >= 0 ? 1 : -1;
      }
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    // 8. Basic Attack: triggered by left click or while holding left mouse
    if (input && input.mouseDown && this.attackTimer <= 0) {
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
