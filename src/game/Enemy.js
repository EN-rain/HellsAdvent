/**
 * GRAVEL SKY — Enemies (Common, Elite, and 3-Phase Bosses)
 * - Uses pre-baked layered sprites from SpriteRegistry (zero canvas rotation, integer coordinates).
 * - Full StatusSystem integration: Bleed, Burn, Corrode, Exposed, Slow, Stun, Pinned, Lifted,
 *   Marked, Drawn In, Diminishing Returns, and Boss Stagger Meter (0-100).
 * - Displays up to 3 prioritized status icons above enemy health bars (+N if more).
 */

import {
  PALETTE,
  ENEMIES_CONFIG,
  WORLD_CONFIG,
} from '../data/config.js';
import { StatusSystem } from './Status.js';
import {
  drawPixelLine,
  drawBresenhamCircle,
  passDither,
} from './PixelArt.js';
import { spriteRegistry, drawPixelText } from './Sprites.js';
import { sound } from './Audio.js';
import { bossMechanics } from './BossMechanics.js';
import { fusionManager } from './FusionManager.js';
import { tacticalSystem } from './TacticalAI.js';
import { obstacleManager } from './Obstacles.js';
import { worldLedger } from './WorldLedger.js';
import {
  getFloorMobDisplayName,
  getOverlevelXpMultiplier,
  getAbyssalEnrageBuff,
} from '../data/darkFantasyConfig.js';
import { inferEnemyHitDamageType } from '../utils/hudHelpers.js';

let NEXT_ENEMY_UID = 1;

export class Enemy {
  constructor() {
    this.uid = NEXT_ENEMY_UID++;
    this.active = false;
    this.dead = false;
    this.id = 'tinRat';
    this.name = 'Tin Rat';
    this.subtitle = '';
    this.tier = 'common';
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 11;
    this.maxHp = 24;
    this.hp = 24;
    this.damage = 5;
    this.def = 2;
    this.speed = 80;
    this.xp = 8;
    this.goldMin = 3;
    this.goldMax = 6;
    this.flying = false;

    // Generic StatusSystem instance
    this.statuses = new StatusSystem('common');

    // 12 fps animation state
    this.animTimer = 0;
    this.animClock = 0;
    this.animFrame = 0;
    this.facingX = 1;
    this.hitFlashFrames = 0;
    this.squashTimer = 0;
    this.contactCooldown = 0;

    // Unique Common behavioral tells & status timers
    this.ratTwitchTimer = 0;
    this.ratLungeCooldown = 2.2;
    this.trailTimer = 0;
    this.batScreechTimer = 4.5; // Sump Bat screech every 6s -> Slow 25% for 2s

    // Elite / Boss telegraphed special attack state
    this.specialType = null;
    this.specialCooldown = 4.5;
    this.specialTimer = 2.2;
    this.telegraphActive = false;
    this.telegraphTimer = 0;
    this.telegraphDuration = 0.8;
    this.telegraphImpactFlashTimer = 0;
    this.telegraphShape = null;
    this.actionActiveTimer = 0;
    this.actionVx = 0;
    this.actionVy = 0;

    // Boss specific
    this.phase = 1;
    this.brassRimTimer = 0;
    this.arenaCenter = null;
    this.arenaRadius = 380;
    this.guaranteedDrop = null;
    this.patternIndex = 0;
  }

  get status() {
    return this.statuses;
  }

  initFromConfig(cfg, x, y, scaleMult = 1.0, playerLevel = 1) {
    spriteRegistry.init();
    this.uid = NEXT_ENEMY_UID++;
    this.active = true;
    this.dead = false;
    this.id = cfg.id;
    this.tier = cfg.tier || (cfg.arenaCenter ? 'boss' : 'common');
    this.floor = Math.max(1, worldLedger.currentFloor || 1);
    const floorCfg = worldLedger.getFloorConfig(this.floor);
    const [minLv, maxLv] = floorCfg.expectedLevelBand || [1, 10];

    if (this.tier === 'boss') {
      this.level = maxLv;
      const chainEntry = worldLedger.getActiveBossChainEntry(cfg.id, this.floor);
      this.name = chainEntry.name || cfg.name;
      this.subtitle = `${chainEntry.stageLabel} · ${chainEntry.title || cfg.subtitle || ''}`;
      this.bossStageIndex = chainEntry.stageIndex;
      this.bossStageLabel = chainEntry.stageLabel;
      const bossHpMult = (floorCfg.hpMult || 1) * (chainEntry.hpMult || 1);
      const bossDmgMult = (floorCfg.dmgMult || 1) * (chainEntry.dmgMult || 1);
      this.baseMaxHp = Math.round(cfg.hp * bossHpMult);
      this.baseDamage = Math.max(1, Math.round(cfg.damage * bossDmgMult));
      this.baseDef = Math.round((cfg.def !== undefined ? cfg.def : 18) * (1 + (this.floor - 1) * 0.45));
      this.xp = Math.round((cfg.xp || 95) * (floorCfg.xpMult || 1) * (0.75 + chainEntry.stageIndex * 0.25));
      const gBase = cfg.gold !== undefined ? cfg.gold : cfg.goldMin || 90;
      this.goldMin = Math.round(gBase * (floorCfg.goldMult || 1));
      this.goldMax = Math.round((cfg.goldMax || gBase) * (floorCfg.goldMult || 1));
    } else {
      this.level =
        this.tier === 'elite' || this.tier === 'fusionBoss'
          ? Math.min(maxLv, Math.round((minLv + maxLv) / 2) + 2)
          : Math.min(maxLv, minLv + (this.uid % Math.max(1, maxLv - minLv)));
      this.name = getFloorMobDisplayName(cfg.name || cfg.id, this.floor);
      this.subtitle = cfg.subtitle || `Floor ${this.floor} · Lv.${this.level}`;
      const fHpMult = (floorCfg.hpMult || 1) * scaleMult;
      const fDmgMult = (floorCfg.dmgMult || 1) * scaleMult;
      this.baseMaxHp = Math.round(cfg.hp * fHpMult);
      this.baseDamage = Math.max(1, Math.round(cfg.damage * fDmgMult));
      this.baseDef = Math.round(
        (cfg.def !== undefined ? cfg.def : this.tier === 'elite' ? 8 : 2) *
          (1 + (this.floor - 1) * 0.4)
      );
      this.xp = Math.max(1, Math.round((cfg.xp || 5) * (floorCfg.xpMult || 1)));
      this.goldMin = Math.round((cfg.gold !== undefined ? cfg.gold : cfg.goldMin || 3) * (floorCfg.goldMult || 1));
      this.goldMax = Math.round((cfg.gold !== undefined ? cfg.gold : cfg.goldMax || 6) * (floorCfg.goldMult || 1));
    }

    this.x = Math.round(x);
    this.y = Math.round(y);
    this.vx = 0;
    this.vy = 0;
    this.radius = cfg.radius || 12;
    this.baseSpeed = cfg.speed || 80;
    this.maxHp = this.baseMaxHp;
    this.hp = this.maxHp;
    this.damage = this.baseDamage;
    this.def = this.baseDef;
    this.speed = this.baseSpeed;
    this.flying = !!cfg.flying;
    this.isAbyssEnraged = false;
    this.enrageTag = null;
    this.syncAbyssalEnrage(playerLevel);

    this.statuses = new StatusSystem(this.tier);

    this.animTimer = Math.random() * 2;
    this.animClock = Math.random() * 2;
    this.animFrame = 0;
    this.facingX = 1;
    this.hitFlashFrames = 0;
    this.squashTimer = 0;
    this.contactCooldown = 0;

    this.ratTwitchTimer = 0;
    this.ratLungeCooldown = 1.8 + Math.random();
    this.trailTimer = 0;
    this.batScreechTimer = 3.5 + Math.random() * 2.5;

    this.specialType = cfg.specialType || null;
    this.specialCooldown = cfg.specialCooldown || 5.0;
    this.specialTimer = 1.6 + Math.random() * 1.5;
    this.telegraphActive = false;
    this.telegraphTimer = 0;
    this.telegraphDuration = cfg.telegraphTime || 0.8;
    this.telegraphImpactFlashTimer = 0;
    this.telegraphShape = null;
    this.actionActiveTimer = 0;
    this.kbTimer = 0;
    this.kbVx = 0;
    this.kbVy = 0;

    this.scaleMult = scaleMult;
    this.isKingBoss = Boolean(cfg.isKingBoss);
    this.baseSpeciesId = cfg.sourceSpeciesId || cfg.id;
    this.baseMobName = cfg.name || cfg.id;
    this.fusionLocked = false;
    this.fusionChannelId = null;
    this.fusionBacklashTimer = 0;
    this.convergeX = 0;
    this.convergeY = 0;
    this.gatherSkillTimer = 1.6 + Math.random() * 2.2;
    this.gatherRallyTimer = 0;
    this.gatherTargetX = null;
    this.gatherTargetY = null;
    this.gapBehaviorMode = this.uid % 2 === 0 ? 'CHASE_ATTACK' : 'FUSION_GATHER';
    this.isRitualOrigin = false;
    this.isRitualMarcher = false;
    this.ritualTargetX = undefined;
    this.ritualTargetY = undefined;
    this.morale = 100;
    this.aiRoleState = 'CHASE';
    this.grudgeState = null;
    this.feignedDeathTimer = 0;
    this.hasFeignedDeath = false;
    this.signalTimer = 2.2 + Math.random() * 1.5;
    this.confirmFinalDeath = false;
    this.isRematch = false;

    this.phase = 1;
    this.brassRimTimer = 0;
    this.arenaCenter = cfg.arenaCenter ? { ...cfg.arenaCenter } : null;
    this.arenaRadius = cfg.arenaRadius || 380;
    this.guaranteedDrop = cfg.guaranteedDrop || null;
    this.patternIndex = 0;

    if (this.tier === 'boss') {
      bossMechanics.initBossState(this);
    }
  }

  /**
   * 10-Level Gap "Abyssal Enrage" Buff:
   * If player.level - this.level >= 10, this mob/boss gets a massive HP, ATK, DEF, and +25% Speed buff!
   */
  syncAbyssalEnrage(playerLevel = 1) {
    const buff = getAbyssalEnrageBuff(playerLevel, this.level || 1);
    if (buff.active && !this.isAbyssEnraged) {
      const hpRatio = this.maxHp > 0 ? this.hp / this.maxHp : 1;
      this.isAbyssEnraged = true;
      this.enrageTag = buff.tag;
      this.maxHp = Math.round(this.baseMaxHp * buff.hpMult);
      this.hp = Math.max(1, Math.round(this.maxHp * hpRatio));
      this.damage = Math.round(this.baseDamage * buff.atkMult);
      this.def = Math.round(this.baseDef * buff.defMult);
      this.speed = Math.round(this.baseSpeed * buff.speedMult);
    }
  }

  applyStun(duration, particles = null) {
    this.statuses.apply('stun', { duration, sourceName: 'Stun' }, this, particles);
    if (this.tier !== 'boss' && this.telegraphActive && this.statuses.cannotAct()) {
      this.telegraphActive = false;
      this.telegraphShape = null;
    }
  }

  applyBurn(duration = 3.0, sourceAtk = 12, particles = null) {
    return this.statuses.apply('burn', { duration, sourceAtk, sourceName: 'Burn' }, this, particles);
  }

  applySlow(duration = 2.0, value = 0.35, particles = null) {
    return this.statuses.apply('slow', { duration, value, sourceName: 'Slow' }, this, particles);
  }

  inflictBurn(target, duration = 3.0, sourceAtk = null, particles = null) {
    if (!target || !target.statuses) return false;
    return target.statuses.apply(
      'burn',
      { duration, sourceAtk: sourceAtk !== null ? sourceAtk : this.damage, sourceName: this.name },
      target,
      particles
    );
  }

  inflictStun(target, duration = 1.0, particles = null) {
    if (!target || !target.statuses) return false;
    return target.statuses.apply('stun', { duration, sourceName: this.name }, target, particles);
  }

  inflictSlow(target, duration = 2.0, value = 0.35, particles = null) {
    if (!target || !target.statuses) return false;
    return target.statuses.apply('slow', { duration, value, sourceName: this.name }, target, particles);
  }

  takeDamage(amount, hitAngle, knockback, isCrit, player, spawner, particles, camera, statusProc = null, damageType = null) {
    if (!this.active || this.hp <= 0) return;

    // Apply optional status effect proc from attacker
    if (statusProc) {
      if (typeof statusProc === 'string') {
        if (statusProc === 'burn') this.applyBurn(3.0, player ? player.atk * 0.3 : 12, particles);
        else if (statusProc === 'stun') this.applyStun(1.0, particles);
        else if (statusProc === 'slow') this.applySlow(2.5, 0.40, particles);
        else this.statuses.apply(statusProc, { duration: 3.0, sourceName: 'Proc' }, this, particles);
      } else if (typeof statusProc === 'object' && statusProc.id) {
        this.statuses.apply(statusProc.id, statusProc, this, particles);
      }
    }

    // Plate Marshal (Slab Town Elite): Frontal scrap shield reduces frontal damage by 55% unless stunned
    if (this.id === 'plateMarshal' && !this.statuses.cannotAct()) {
      const hitFromDirX = -Math.cos(hitAngle);
      if (hitFromDirX * this.facingX > 0.25) {
        amount = Math.max(1, Math.round(amount * 0.45));
        if (particles && Math.random() < 0.5) {
          particles.spawnFloatingText(this.x, this.y - 24, 'FRONT SHIELD! FLANK!', PALETTE.boneDark);
        }
      }
    }

    // Universal Stagger for 10-Mob Fusion Channel (D21)
    if (this.fusionChannelId) {
      fusionManager.onMemberDamaged(this, amount);
    }

    // Boss-specific damage interception (Foreman ritual invuln, Big Axle core, Mother Sump devour stagger, Long Dry shell segments)
    if (this.tier === 'boss') {
      amount = bossMechanics.onBossTakeDamage(this, amount, player, spawner, particles, camera);
      if (amount <= 0) {
        return;
      }
    }

    this.hp = Math.max(0, this.hp - amount);
    this.hitFlashFrames = 2;
    this.squashTimer = 2 / 12;

    // Silt Mimic (Lye Marsh Common): Feigns death once at <= 45% HP, then lunges if player rushes in
    if (
      this.id === 'siltMimic' &&
      !this.hasFeignedDeath &&
      this.hp > 0 &&
      this.hp <= this.maxHp * 0.45
    ) {
      this.hasFeignedDeath = true;
      this.feignedDeathTimer = 1.35;
      if (particles) {
        particles.spawnFloatingText(this.x, this.y - 18, '...?', PALETTE.lye);
      }
    }

    if (knockback > 0 && (!this.bm || !this.bm.ritualActive)) {
      const baseDist = Math.min(knockback * 0.22, 48);
      const tierMult =
        this.tier === 'boss'
          ? 0.15
          : this.tier === 'fusionBoss'
          ? 0.32
          : this.tier === 'elite'
          ? 0.45
          : 1.0;
      const kbDist = Math.max(1, Math.round(baseDist * tierMult));
      this.x = Math.round(this.x + Math.cos(hitAngle) * kbDist);
      this.y = Math.round(this.y + Math.sin(hitAngle) * kbDist);

      // Apply smooth knockback skid velocity for heavy knockbacks (like Crescent Slash)
      if (knockback >= 120) {
        const skidSpeed = Math.min(knockback * 1.4, 340) * tierMult;
        this.kbVx = Math.cos(hitAngle) * skidSpeed;
        this.kbVy = Math.sin(hitAngle) * skidSpeed;
        this.kbTimer = 0.18;
      }
      this._keepOutOfKettleAndBounds();
    }

    // Interrupt non-boss telegraph if hard CC'd
    if (this.tier !== 'boss' && this.telegraphActive && this.statuses.cannotAct()) {
      this.telegraphActive = false;
      this.telegraphShape = null;
    }

    // Check Boss phase transitions (100% -> 60% -> 30%) -> Brass rim flash
    if (this.tier === 'boss' && this.hp > 0) {
      const ratio = this.hp / this.maxHp;
      if (this.phase === 1 && ratio <= 0.6) {
        this.phase = 2;
        this._triggerBossPhaseShift(particles, camera);
      } else if (this.phase < 3 && ratio <= 0.3) {
        this.phase = 3;
        this._triggerBossPhaseShift(particles, camera);
      }
    }

    if (particles) {
      const resolvedDmgType = inferEnemyHitDamageType(player, statusProc, damageType);
      particles.spawnBurst(
        this.x,
        this.y,
        isCrit ? 6 : 3,
        isCrit ? PALETTE.brass : resolvedDmgType === 'magical' ? '#C084FC' : PALETTE.bone,
        25,
        80,
        2,
        0.22
      );
      particles.spawnDamageNumber(this.x, this.y - this.radius, amount, isCrit, null, null, {
        damageType: resolvedDmgType,
        targetType: 'enemy',
      });
    }

    if (this.hp <= 0) {
      // Check Boss Mandatory Kill Gate / Reassembly Protocol before allowing final death (D1, D3, D22, D36)
      if (this.tier === 'boss') {
        const allowDeath = bossMechanics.shouldAllowFinalBossDeath(
          this,
          player,
          spawner,
          particles,
          camera
        );
        if (!allowDeath) {
          return;
        }
      }
      this._onDeath(player, spawner, particles, camera);
    }
  }

  _triggerBossPhaseShift(particles, camera) {
    sound.playBossAlert();
    camera.shake(6, 0.22);
    this.brassRimTimer = 1.4;
    if (particles) {
      particles.spawnShockwave(this.x, this.y, 90, PALETTE.brass, 0.3);
      particles.spawnDamageNumber(
        this.x,
        this.y - this.radius - 12,
        0,
        true,
        `PHASE ${this.phase}`,
        PALETTE.brass
      );
    }
    this.specialTimer = 0.3;
  }

  _onDeath(player, spawner, particles, camera, extraDetails = {}) {
    if (this.dead) return; // Guarantee exactly-once death & reward pathway
    this.active = false;
    this.dead = true;
    this.telegraphActive = false;
    this.fusionLocked = false;
    this.fusionChannelId = null;

    // Trigger morale drop on nearby allies when an enemy is slain (D24)
    tacticalSystem.onEnemyKilled(this, spawner);

    const baseGold =
      this.goldMin + Math.random() * Math.max(0, this.goldMax - this.goldMin);
    const variance = 0.8 + Math.random() * 0.4;
    const rematchMult = this.isRematch ? 0.35 : 1.0;
    const overlevelXpMult = getOverlevelXpMultiplier(player ? player.level : 1, this.level || 1);
    const finalGold = Math.max(1, Math.round(baseGold * variance * rematchMult));
    const finalXp = Math.max(1, Math.round(this.xp * rematchMult * overlevelXpMult));

    if (player) {
      player.gainXpAndGold(finalXp, finalGold, particles);
      worldLedger.recordMobKillForQuests(this, this.floor || worldLedger.currentFloor);
      if (player.ultimates) {
        if (typeof player.ultimates.addKillCharge === 'function') {
          player.ultimates.addKillCharge(player, this.tier);
        } else if (typeof player.ultimates.onEnemyKilled === 'function') {
          player.ultimates.onEnemyKilled(player, this.tier);
        }
      }
      if (player.classId === 'ines' && player.classBehavior) {
        player.classBehavior.onEnemyKilledNearby(this.x, this.y, particles);
      }
    }

    if (this.tier === 'fusionBoss') {
      worldLedger.recordFusionBossKilled(particles, player);
    }

    if (particles) {
      const decalColor =
        this.id === 'lyeLeech' || this.id === 'lyeStrider' || this.id === 'motherSump'
          ? '#142927'
          : '#1E1513';
      particles.spawnDecal(this.x, this.y + 4, decalColor, this.tier === 'boss' ? 14 : 6, 20.0);

      if (this.id === 'tinRat' || this.id === 'rivetTick') {
        particles.spawnDebris(this.x, this.y, 'canLid', 2);
        particles.spawnDebris(this.x, this.y, 'shardRust', 2);
      } else if (this.id === 'dustDog' || this.id === 'cinderCrow') {
        particles.spawnDebris(this.x, this.y, 'goggles', 1);
        particles.spawnDebris(this.x, this.y, 'shardBone', 3);
      } else if (this.id === 'wireKite' || this.id === 'signalMite') {
        particles.spawnDebris(this.x, this.y, 'wire', 3);
        particles.spawnDebris(this.x, this.y, 'tarp', 2);
      } else if (this.id === 'lyeLeech' || this.id === 'sumpBat' || this.id === 'siltMimic') {
        particles.spawnDebris(this.x, this.y, 'tarp', 3);
        particles.spawnDebris(this.x, this.y, 'wire', 2);
      } else if (this.tier === 'elite' || this.tier === 'fusionBoss') {
        particles.spawnDebris(this.x, this.y, 'canLid', 5);
        particles.spawnDebris(this.x, this.y, 'wire', 5);
        particles.spawnDebris(this.x, this.y, 'shardRust', 6);
        particles.spawnShockwave(this.x, this.y, 52, PALETTE.blood, 0.25);
      } else if (this.tier === 'boss') {
        particles.spawnDebris(this.x, this.y, 'canLid', 8);
        particles.spawnDebris(this.x, this.y, 'goggles', 4);
        particles.spawnDebris(this.x, this.y, 'wire', 8);
        particles.spawnDebris(this.x, this.y, 'shardRust', 8);
        particles.spawnGroundBreakEffect(this.x, this.y, 95);
      }
    }

    if ((this.tier === 'elite' || this.tier === 'fusionBoss') && Math.random() < 0.25 && player) {
      player.supplies.gauzeRoll = (player.supplies.gauzeRoll || 0) + 1;
      if (particles) {
        particles.spawnDamageNumber(
          this.x,
          this.y - 16,
          0,
          true,
          '+1 GAUZE',
          PALETTE.signal
        );
      }
      sound.playCoin();
    }

    if (this.tier === 'boss' && player && spawner) {
      if (camera) camera.shake(8, 0.35);
      player.statuses.apply(
        'bounty',
        { duration: 600.0, sourceName: this.name },
        player,
        particles
      );
      const bossDetails = {
        ...extraDetails,
        revived: !!(this.bm && this.bm.isIronForeman),
        arrivals: this.bm ? this.bm.arrivals || 0 : 0,
        feedsAllowed: this.bm ? this.bm.feedsAllowed || 0 : 0,
        isRematch: !!this.isRematch,
      };
      spawner.onBossDefeated(this.id, player, particles, bossDetails);
    }
  }

  _applyCommonContactStatus(player, particles) {
    if (!player || !player.statuses) return;
    // Enemy-applied durations stay fixed and do not scale with level; DoT scales with enemy damage stat.
    if (this.id === 'tinRat') {
      if (Math.random() < 0.20) {
        this.inflictSlow(player, 2.0, 0.30, particles);
      } else if (Math.random() < 0.20) {
        player.statuses.apply(
          'bleed',
          { duration: 4.0, sourceAtk: this.damage, sourceName: 'Tin Rat' },
          player,
          particles
        );
      }
    } else if (this.id === 'dustDog') {
      if (Math.random() < 0.25) {
        this.inflictSlow(player, 2.0, 0.35, particles);
      } else if (Math.random() < 0.25) {
        player.statuses.apply(
          'bleed',
          { duration: 4.0, sourceAtk: this.damage, sourceName: 'Dust Dog' },
          player,
          particles
        );
      }
    } else if (this.id === 'lyeLeech') {
      player.statuses.apply(
        'corrode',
        { duration: 8.0, sourceName: 'Lye Leech' },
        player,
        particles
      );
      this.inflictSlow(player, 2.0, 0.25, particles);
    } else if (this.id === 'sumpBat') {
      this.inflictSlow(player, 2.0, 0.30, particles);
    } else if (this.id === 'cleaverHauler') {
      this.inflictStun(player, 0.6, particles);
    } else if (this.id === 'bigAxle') {
      this.inflictBurn(player, 3.0, this.damage, particles);
      this.inflictStun(player, 0.8, particles);
    } else if (this.id === 'theForeman') {
      this.inflictStun(player, 0.8, particles);
      this.inflictSlow(player, 2.0, 0.30, particles);
    } else if (this.id === 'motherSump') {
      this.inflictSlow(player, 3.0, 0.40, particles);
    } else if (this.id === 'theLongDry') {
      this.inflictSlow(player, 2.0, 0.30, particles);
    } else if (this.name?.toLowerCase().includes('boiler') || this.name?.toLowerCase().includes('torch') || this.name?.toLowerCase().includes('hell')) {
      this.inflictBurn(player, 3.0, this.damage * 0.75, particles);
    }
  }

  update(dt, player, spawner, projectiles, particles, camera, world) {
    if (!this.active || this.hp <= 0) return;

    if (player && player.level) {
      this.syncAbyssalEnrage(player.level);
    }

    this.animClock += dt;
    if (this.hitFlashFrames > 0) this.hitFlashFrames--;
    if (this.squashTimer > 0) this.squashTimer = Math.max(0, this.squashTimer - dt);
    if (this.brassRimTimer > 0) this.brassRimTimer = Math.max(0, this.brassRimTimer - dt);
    if (this.contactCooldown > 0) this.contactCooldown = Math.max(0, this.contactCooldown - dt);
    if (this.telegraphImpactFlashTimer > 0) {
      this.telegraphImpactFlashTimer = Math.max(0, this.telegraphImpactFlashTimer - dt);
    }

    // Freeze enemies during any player ultimate (Melee, Archer, and Trasher)
    const isUltFrozen =
      player.ultimateActive ||
      (player.ultimates && player.ultimates.active && player.ultimates.worldFrozen) ||
      (player.isTimeStopped && player.isTimeStopped());
    if (isUltFrozen) return;

    // Update StatusSystem (DoT ticks, Stagger meter, Lifted drop impact)
    this.statuses.update(dt, this, particles, (dotDmg) => {
      if (this.active && this.hp > 0) {
        this.hp = Math.max(0, this.hp - dotDmg);
        if (this.hp <= 0) {
          if (this.tier === 'boss') {
            const allow = bossMechanics.shouldAllowFinalBossDeath(
              this,
              player,
              spawner,
              particles,
              camera
            );
            if (!allow) return;
          }
          this._onDeath(player, spawner, particles, camera);
        }
      }
    });
    if (!this.active || this.hp <= 0) return;

    // Halt normal AI & attacks while locked in a 2.0s 10-unit Fusion Channel (Section 3.2)
    if (this.fusionLocked) {
      this.telegraphActive = false;
      this.actionActiveTimer = 0;
      return;
    }

    // Halt normal boss movement/attacks during Reassembly Protocol, Overheat Stall, Subsurface Burrow, or Devour Channel
    if (this.tier === 'boss' && this.bm) {
      if (
        this.bm.ritualActive ||
        this.bm.coreExposedTimer > 0 ||
        this.bm.disabledRestartTimer > 0 ||
        this.bm.subsurfaceTimer > 0 ||
        (this.bm.devourChannel && this.bm.devourChannel.active)
      ) {
        this.telegraphActive = false;
        this.actionActiveTimer = 0;
        return;
      }
    }

    // Apply smooth knockback skid physics
    if (this.kbTimer > 0) {
      this.kbTimer = Math.max(0, this.kbTimer - dt);
      const decay = this.kbTimer / 0.18;
      this.x += this.kbVx * decay * dt;
      this.y += this.kbVy * decay * dt;
      this._keepOutOfKettleAndBounds();
    }

    // Cannot act (Stunned, Lifted, or Boss Staggered)
    if (this.statuses.cannotAct()) {
      return;
    }

    // Animate on twos at 12 fps (or 70% speed when Slowed)
    const entry = spriteRegistry.enemies[this.id];
    const frameCount = entry ? entry.right.length : 2;
    const slowMult = this.statuses.has('slow') ? 0.7 : 1.0;
    const baseStep =
      this.id === 'flatsHarvester' && this.telegraphActive ? 1 / 24 : 1 / 12;
    const frameStep = baseStep / slowMult;

    this.animTimer += dt;
    if (this.animTimer >= frameStep) {
      this.animTimer -= frameStep;
      this.animFrame = (this.animFrame + 1) % frameCount;

      if (this.id === 'dustDog' && this.animFrame === 1) {
        particles.spawnDustPuff(this.x - this.facingX * 4, this.y + 8, 1, 0, 0);
      }
    }

    if (this.id === 'lyeLeech') {
      this.trailTimer += dt;
      if (this.trailTimer >= 0.45) {
        this.trailTimer = 0;
        particles.spawnDecal(this.x, this.y + 4, '#153431', 4, 8.0);
      }
    }

    const playerInSafeZone = Boolean(
      player && (
        player.inSafeZone ||
        (world && typeof world.getAreaAt === 'function' && world.getAreaAt(player.x, player.y)?.safe) ||
        (typeof player.isInSafeZone === 'function' && player.isInSafeZone(world))
      )
    );

    if (playerInSafeZone) {
      if (this.telegraphActive && !this.isRitualMarcher) {
        this.telegraphActive = false;
        this.telegraphTimer = 0;
      }
      this.ratTwitchTimer = 0;
    }

    const dxToPlayer = player.x - this.x;
    const dyToPlayer = player.y - this.y;
    const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer) || 1;
    const dirX = dxToPlayer / distToPlayer;
    const dirY = dyToPlayer / distToPlayer;
    if (!playerInSafeZone) {
      this.facingX = dirX >= 0 ? 1 : -1;
    }

    // Sump Bat screech every 6s: Slow 25% for 2s on the player (unaware if in safe zone)
    if (this.id === 'sumpBat' && !this.isRitualMarcher && !playerInSafeZone) {
      this.batScreechTimer -= dt;
      if (this.batScreechTimer <= 0 && distToPlayer <= 165) {
        this.batScreechTimer = 6.0;
        particles.spawnShockwave(this.x, this.y, 48, PALETTE.lye, 0.2);
        player.statuses.apply(
          'slow',
          { duration: 2.0, value: 0.25, sourceName: 'Sump Bat Screech' },
          player,
          particles
        );
      }
    }

    // Signal Mite (Route 9 Scout): Broadcasts observed player habits to nearby allies every 3.8s
    if (this.id === 'signalMite' && !this.isRitualMarcher && !playerInSafeZone) {
      this.signalTimer -= dt;
      if (this.signalTimer <= 0 && distToPlayer <= 280) {
        this.signalTimer = 3.8;
        tacticalSystem.emitBroadcast(this, 260, 4.5, 'intercept');
        if (particles) {
          particles.spawnShockwave(this.x, this.y, 42, PALETTE.signal, 0.2);
        }
      }
    }

    // 10-Level Gap Behavior: Low-level common mobs can either CHASE & ATTACK you OR use a FUSION GATHER SKILL
    // to call/pull same-species mobs together to trigger a 10× Fusion!
    // Also Mid-Level Fused Bosses can use a King Rally to pull other Mid-Bosses together for a 5× King Fusion!
    if (this.gatherRallyTimer > 0) {
      this.gatherRallyTimer = Math.max(0, this.gatherRallyTimer - dt);
    }

    if (
      !this.isRitualMarcher &&
      !playerInSafeZone &&
      spawner &&
      ((this.tier === 'common' && this.isAbyssEnraged) ||
        (this.tier === 'fusionBoss' && !this.isKingBoss))
    ) {
      this.morale = 100; // Never panic/flee during 10-level gap or as Fusion Boss
      this.gatherSkillTimer -= dt;
      if (this.gatherSkillTimer <= 0) {
        this.gatherSkillTimer = 3.0 + Math.random() * 1.8;

        if (this.tier === 'common') {
          // Find same-species common mobs within 650px
          const nearbyAll = spawner.queryRadius
            ? spawner.queryRadius(this.x, this.y, 650)
            : [];
          const sameSpecies = [];
          for (let i = 0; i < nearbyAll.length; i++) {
            const o = nearbyAll[i];
            if (
              o &&
              o.active &&
              o.hp > 0 &&
              o.tier === 'common' &&
              o.id === this.id &&
              !o.fusionLocked &&
              !o.isRitualMarcher
            ) {
              sameSpecies.push(o);
            }
          }

          // Toggle or choose between CHASE_ATTACK and FUSION_GATHER skill
          const shouldGather =
            sameSpecies.length >= 3 &&
            (this.gapBehaviorMode === 'FUSION_GATHER' || sameSpecies.length >= 5 || Math.random() < 0.65);

          if (shouldGather) {
            this.gapBehaviorMode = 'FUSION_GATHER';
            let rx = 0;
            let ry = 0;
            for (let i = 0; i < sameSpecies.length; i++) {
              rx += sameSpecies[i].x;
              ry += sameSpecies[i].y;
            }
            rx /= sameSpecies.length;
            ry /= sameSpecies.length;

            // Cast Gathering Skill: rally all same-species mobs in range toward the convergence point!
            for (let i = 0; i < sameSpecies.length; i++) {
              const ally = sameSpecies[i];
              ally.gatherRallyTimer = 3.6;
              ally.gatherTargetX = rx;
              ally.gatherTargetY = ry;
            }
            if (particles && Math.random() < 0.35) {
              particles.spawnShockwave(this.x, this.y, 72, '#FFC83D', 0.24);
            }
          } else {
            // Aggressively chase & lunge-attack the player!
            this.gapBehaviorMode = 'CHASE_ATTACK';
            this.gatherRallyTimer = 0;
            if (distToPlayer < 190 && !this.statuses.cannotMove()) {
              this.actionActiveTimer = 0.20;
              this.actionVx = dirX * (this.speed * 2.15);
              this.actionVy = dirY * (this.speed * 2.15);
            }
          }
        } else if (this.tier === 'fusionBoss' && !this.isKingBoss) {
          // Mid-Level Fused Boss checks for other Mid-Bosses to rally for a 5× King Fusion!
          const allActive = spawner.getAllActiveEnemies ? spawner.getAllActiveEnemies() : spawner.pool;
          const midBosses = [];
          for (let i = 0; i < allActive.length; i++) {
            const o = allActive[i];
            if (
              o &&
              o.active &&
              o.hp > 0 &&
              o.tier === 'fusionBoss' &&
              !o.isKingBoss &&
              !o.fusionLocked
            ) {
              midBosses.push(o);
            }
          }
          if (midBosses.length >= 2) {
            let rx = 0;
            let ry = 0;
            for (let i = 0; i < midBosses.length; i++) {
              rx += midBosses[i].x;
              ry += midBosses[i].y;
            }
            rx /= midBosses.length;
            ry /= midBosses.length;
            for (let i = 0; i < midBosses.length; i++) {
              midBosses[i].gatherRallyTimer = 3.8;
              midBosses[i].gatherTargetX = rx;
              midBosses[i].gatherTargetY = ry;
            }
            if (particles && midBosses.length >= 4 && Math.random() < 0.4) {
              particles.spawnShockwave(this.x, this.y, 95, '#C042FF', 0.28);
            }
          }
        }
      }
    }

    // Silt Mimic (Lye Marsh Common): Feigns collapse with a subtle twitch tell; ambushes if player steps close
    if (this.id === 'siltMimic' && this.feignedDeathTimer > 0) {
      if (playerInSafeZone) {
        return; // Unaware while player is in safe zone
      }
      this.feignedDeathTimer -= dt;
      this.ratTwitchTimer = 0.1; // Visual tell
      if (distToPlayer <= 72 || this.feignedDeathTimer <= 0) {
        this.feignedDeathTimer = 0;
        this.ratTwitchTimer = 0;
        if (distToPlayer <= 95 && !this.statuses.cannotMove()) {
          this.actionActiveTimer = 0.18;
          this.actionVx = dirX * 250;
          this.actionVy = dirY * 250;
          if (particles) {
            particles.spawnFloatingText(this.x, this.y - 20, 'AMBUSH!', PALETTE.lye);
          }
        }
      }
      return;
    }

    // Tin Rat / Rivet Tick / Cinder Crow unique crouch/dive tells before lunge
    if ((this.id === 'tinRat' || this.id === 'rivetTick' || this.id === 'cinderCrow') && !this.isRitualMarcher && !playerInSafeZone) {
      if (this.ratTwitchTimer > 0) {
        this.ratTwitchTimer -= dt;
        if (this.ratTwitchTimer <= 0 && !this.statuses.cannotMove()) {
          this.actionActiveTimer = this.id === 'cinderCrow' ? 0.22 : 0.16;
          const lungeSpd = this.id === 'rivetTick' ? 245 : this.id === 'cinderCrow' ? 260 : 220;
          this.actionVx = dirX * lungeSpd;
          this.actionVy = dirY * lungeSpd;
        }
        return;
      }
      this.ratLungeCooldown -= dt;
      const triggerRange = this.id === 'cinderCrow' ? 135 : 95;
      if (this.ratLungeCooldown <= 0 && distToPlayer < triggerRange) {
        this.ratTwitchTimer = 0.25;
        this.ratLungeCooldown = this.id === 'rivetTick' ? 2.1 : 2.4;
        return;
      }
    }

    // 1. Active dash / charge execution (Cleaver Hauler charge, Big Axle ram, etc.)
    if (this.actionActiveTimer > 0) {
      this.actionActiveTimer -= dt;
      if (!this.statuses.cannotMove()) {
        this.x += this.actionVx * dt;
        this.y += this.actionVy * dt;
      }

      // Big Axle engine fire applies Burn along its ram path (blocked in safe zone)
      if (this.id === 'bigAxle' && !playerInSafeZone && distToPlayer <= this.radius + player.radius + 22) {
        player.statuses.apply(
          'burn',
          { duration: 3.0, sourceAtk: this.damage, sourceName: 'Big Axle Exhaust' },
          player,
          particles
        );
      }

      if (!playerInSafeZone && distToPlayer <= this.radius + player.radius + 4) {
        const hit = player.takeDamage(
          Math.round(this.damage * 1.3),
          this.x,
          this.y,
          particles,
          camera,
          this,
          spawner
        );
        if (hit) {
          if (this.id === 'cleaverHauler') {
            // Cleaver Hauler charge hit: Bleed and Stun 0.6s
            player.statuses.apply(
              'bleed',
              { duration: 4.0, sourceAtk: this.damage, sourceName: 'Cleaver Hauler' },
              player,
              particles
            );
            player.statuses.apply(
              'stun',
              { duration: 0.6, sourceName: 'Cleaver Hauler' },
              player,
              particles
            );
          } else if (this.id === 'bigAxle') {
            // Big Axle ram: Stun 1s + Burn
            player.statuses.apply(
              'stun',
              { duration: 1.0, sourceName: 'Big Axle' },
              player,
              particles
            );
            player.statuses.apply(
              'burn',
              { duration: 3.0, sourceAtk: this.damage, sourceName: 'Big Axle' },
              player,
              particles
            );
          } else if (this.id === 'theLongDry') {
            // The Long Dry sand burst: Choked 6s and Slow 30% for 2s
            player.statuses.apply(
              'choked',
              { duration: 6.0, sourceName: 'The Long Dry' },
              player,
              particles
            );
            player.statuses.apply(
              'slow',
              { duration: 2.0, value: 0.30, sourceName: 'The Long Dry' },
              player,
              particles
            );
          } else if (this.id === 'theForeman') {
            player.statuses.apply(
              'stun',
              { duration: 0.8, sourceName: 'The Foreman' },
              player,
              particles
            );
            player.statuses.apply(
              'slow',
              { duration: 2.0, value: 0.30, sourceName: 'The Foreman' },
              player,
              particles
            );
          } else {
            this._applyCommonContactStatus(player, particles);
          }
        }
      }
      this._keepOutOfKettleAndBounds();
      return;
    }

    // 2. Telegraphed Special Warning Zone (0.8s ahead)
    if (this.telegraphActive) {
      this.telegraphTimer -= dt;

      if (this.id === 'cleaverHauler' && Math.random() < 0.4) {
        particles.spawnParticle({
          kind: 'pixel',
          x: this.x + this.facingX * 14,
          y: this.y + 8,
          vx: -this.facingX * 30,
          vy: -25,
          size: 2,
          color: PALETTE.brass,
          color2: PALETTE.rust,
          life: 0.16,
        });
      }

      if (this.id === 'theLongDry' && this.telegraphShape?.type === 'line' && Math.random() < 0.6) {
        const prog = 1 - Math.max(0, this.telegraphTimer / this.telegraphDuration);
        const rx =
          this.telegraphShape.x1 +
          (this.telegraphShape.x2 - this.telegraphShape.x1) * prog;
        const ry =
          this.telegraphShape.y1 +
          (this.telegraphShape.y2 - this.telegraphShape.y1) * prog;
        particles.spawnDustPuff(rx, ry, 2, 0, -15);
      }

      if (this.telegraphTimer <= 0) {
        this.telegraphActive = false;
        this.telegraphImpactFlashTimer = 2 / 24;
        this._executeTelegraphedAttack(player, spawner, projectiles, particles, camera);
      }
      return;
    }

    // 3. Check if Elite, Fusion Mid-Boss, or Boss should start a telegraphed special attack (unaware if in safe zone)
    if ((this.tier === 'elite' || this.tier === 'fusionBoss' || this.tier === 'boss') && !playerInSafeZone) {
      const cdMult =
        this.tier === 'boss'
          ? this.phase === 3
            ? 0.6
            : this.phase === 2
            ? 0.8
            : 1.0
          : 1.0;
      this.specialTimer -= dt;
      if (this.specialTimer <= 0 && distToPlayer < 275) {
        this.specialTimer = this.specialCooldown * cdMult;
        this._beginTelegraph(player);
        return;
      }
    }

    // 4. Constant chase / tactical movement (blocked if Pinned)
    if (!this.statuses.cannotMove()) {
      const steered = tacticalSystem.computeSteering(
        this,
        player,
        dirX,
        dirY,
        distToPlayer,
        spawner,
        playerInSafeZone
      );

      if (playerInSafeZone && Math.abs(steered.dirX) > 0.05) {
        this.facingX = steered.dirX >= 0 ? 1 : -1;
      }

      let speedMult =
        this.statuses.getMoveSpeedMultiplier() *
        steered.speedMult *
        obstacleManager.getHazardSpeedMultiplier(this);
      if (this.id === 'lyeLeech' && !this.isRitualMarcher) {
        speedMult *= this.animFrame === 1 ? 1.65 : 0.45;
      } else if (this.tier === 'boss') {
        speedMult *= this.phase === 3 ? 1.3 : this.phase === 2 ? 1.15 : 1.0;
      }

      let sepX = 0;
      let sepY = 0;
      const isGatheringSkillActive =
        this.gatherRallyTimer > 0 &&
        this.gatherTargetX !== null &&
        this.gatherTargetY !== null &&
        !bossMechanics.isInsideForemanNoFusionField(this.x, this.y);

      // Reduce separation when converging for 10-unit common fusion or 5-unit Mid-Boss King fusion
      const isConverging =
        isGatheringSkillActive ||
        ((this.tier === 'common' || (this.tier === 'fusionBoss' && !this.isKingBoss)) &&
          !this.isRitualMarcher &&
          (Math.abs(this.convergeX || 0) > 0.01 || Math.abs(this.convergeY || 0) > 0.01) &&
          !bossMechanics.isInsideForemanNoFusionField(this.x, this.y));

      const sepStrength = isGatheringSkillActive ? 6 : isConverging ? 16 : 65;
      const neighbors = (spawner && typeof spawner.queryRadius === 'function')
        ? spawner.queryRadius(this.x, this.y, this.radius * 2.1)
        : [];
      for (let i = 0; i < neighbors.length; i++) {
        const other = neighbors[i];
        if (other === this || !other.active) continue;
        const ndx = this.x - other.x;
        const ndy = this.y - other.y;
        const nDist = Math.hypot(ndx, ndy) || 0.1;
        const minSep = this.radius + other.radius + (isConverging ? -2 : 3);
        if (nDist < minSep && minSep > 0) {
          const push = ((minSep - nDist) / minSep) * sepStrength;
          sepX += (ndx / nDist) * push;
          sepY += (ndy / nDist) * push;
        }
      }

      let finalDirX = steered.dirX;
      let finalDirY = steered.dirY;
      if (isGatheringSkillActive) {
        const gdx = this.gatherTargetX - this.x;
        const gdy = this.gatherTargetY - this.y;
        const gDist = Math.hypot(gdx, gdy) || 1;
        if (gDist > 16) {
          finalDirX = gdx / gDist;
          finalDirY = gdy / gDist;
          speedMult *= 1.35; // Burst speed while using Gathering Skill to fuse!
        }
      }

      const convVX = isConverging ? (this.convergeX || 0) * 44 : 0;
      const convVY = isConverging ? (this.convergeY || 0) * 44 : 0;

      const moveSpeed = this.speed * speedMult;
      this.x += (finalDirX * moveSpeed + sepX + convVX) * dt;
      this.y += (finalDirY * moveSpeed + sepY + convVY) * dt;
    }

    if (!playerInSafeZone && distToPlayer <= this.radius + player.radius + 2 && this.contactCooldown <= 0) {
      const hit = player.takeDamage(this.damage, this.x, this.y, particles, camera, this, spawner);
      if (hit) {
        this.contactCooldown = 0.85;
        this._applyCommonContactStatus(player, particles);
      }
    }

    // Check if attacking a defending Wandering Merchant during the 30s Sudden Defense Quest
    if (this.tier !== 'boss' && this.contactCooldown <= 0 && worldLedger.wanderingMerchants) {
      for (const m of worldLedger.wanderingMerchants) {
        if (m.state === 'defending' && m.hp > 0) {
          const mdx = m.x - this.x;
          const mdy = m.y - this.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist <= this.radius + 18) {
            this.contactCooldown = 1.05;
            m.hp = Math.max(0, m.hp - this.damage);
            if (particles) {
              particles.spawnDamageNumber(m.x, m.y - 22, this.damage, false, null, '#FF5A26');
            }
          }
        }
      }
    }

    this._keepOutOfKettleAndBounds();
  }

  _keepOutOfKettleAndBounds() {
    const isBurrowed = !!(this.bm && this.bm.subsurfaceTimer > 0) || !!this.isBurrowed;
    const resolved = obstacleManager.resolveEntityCollision(this.x, this.y, this.radius, {
      isFlying: !!this.flying,
      isBurrowed,
    });
    this.x = resolved.x;
    this.y = resolved.y;
    this.lastCollidedObstacle = resolved.hitObstacle;

    // Repel enemies from any active Wandering Merchant Mob-Repellent Sanctuary Ward!
    if (worldLedger.wanderingMerchants) {
      for (let i = 0; i < worldLedger.wanderingMerchants.length; i++) {
        const m = worldLedger.wanderingMerchants[i];
        if (m.repellentActive && m.state === 'protected') {
          const dx = this.x - m.x;
          const dy = this.y - m.y;
          const dist = Math.hypot(dx, dy) || 1;
          const minWardDist = m.repellentRadius + this.radius + 8;
          if (dist < minWardDist) {
            this.x = m.x + (dx / dist) * minWardDist;
            this.y = m.y + (dy / dist) * minWardDist;
          }
        }
      }
    }

    if (this.tier === 'boss' && this.arenaCenter) {
      const adx = this.x - this.arenaCenter.x;
      const ady = this.y - this.arenaCenter.y;
      const aDist = Math.hypot(adx, ady) || 1;
      const maxArena = this.arenaRadius + 40;
      if (aDist > maxArena) {
        this.x = this.arenaCenter.x + (adx / aDist) * maxArena;
        this.y = this.arenaCenter.y + (ady / aDist) * maxArena;
      }
    }

    this.x = Math.max(30, Math.min(WORLD_CONFIG.size - 30, this.x));
    this.y = Math.max(30, Math.min(WORLD_CONFIG.size - 30, this.y));
  }

  _beginTelegraph(player) {
    this.telegraphActive = true;
    this.telegraphDuration = 0.8;
    this.telegraphTimer = this.telegraphDuration;

    // Use bounded tactical aim prediction (includes Elite/Fusion Grudge D26 & Signal Mite broadcast)
    const angle = tacticalSystem.getPredictedAimAngle(this, player);

    if (this.tier === 'elite' || this.tier === 'fusionBoss') {
      if (
        this.specialType === 'charge' ||
        this.specialType === 'switchbackCharge' ||
        this.specialType === 'rollingRush' ||
        this.specialType === 'pairedLungeHowl' ||
        this.specialType === 'furnaceAirstrike'
      ) {
        const dist = this.tier === 'fusionBoss' ? 170 : 145;
        this.telegraphShape = {
          type: 'line',
          x1: Math.round(this.x),
          y1: Math.round(this.y),
          x2: Math.round(this.x + Math.cos(angle) * dist),
          y2: Math.round(this.y + Math.sin(angle) * dist),
          width: this.tier === 'fusionBoss' ? 28 : 22,
          angle,
          color: PALETTE.blood,
        };
      } else if (
        this.specialType === 'acidSpit' ||
        this.specialType === 'burrowMortar' ||
        this.specialType === 'titanSlamLeap'
      ) {
        this.telegraphShape = {
          type: 'circle',
          x: Math.round(player.x),
          y: Math.round(player.y),
          radius: this.tier === 'fusionBoss' ? 54 : 44,
          angle,
          color: this.specialType === 'acidSpit' ? PALETTE.lye : PALETTE.blood,
        };
      } else {
        // Ring pulse (Flats Harvester, Plate Marshal, Sump Cantor, Relay Colossus, Screech Choir, Brine Maw, Dredge Husk, Wire Cyclone)
        if (this.specialType === 'overclockBroadcast' || this.specialType === 'shieldCommand') {
          tacticalSystem.emitBroadcast(this, 300, 5.0, 'command');
        }
        this.telegraphShape = {
          type: 'ring',
          x: Math.round(this.x),
          y: Math.round(this.y),
          radius: this.tier === 'fusionBoss' ? 76 : 64,
          angle,
          color:
            this.specialType === 'cantorPulse' || this.specialType === 'suctionDrain'
              ? PALETTE.lye
              : PALETTE.blood,
        };
      }
      return;
    }

    const pat = this.patternIndex % 3;
    this.patternIndex += 1;

    if (pat === 0) {
      const dist = 175 + this.phase * 25;
      this.telegraphShape = {
        type: 'line',
        x1: Math.round(this.x),
        y1: Math.round(this.y),
        x2: Math.round(this.x + Math.cos(angle) * dist),
        y2: Math.round(this.y + Math.sin(angle) * dist),
        width: 34,
        angle,
        color: PALETTE.blood,
      };
    } else if (pat === 1) {
      this.telegraphShape = {
        type: 'ring',
        x: Math.round(this.x),
        y: Math.round(this.y),
        radius: 85 + this.phase * 14,
        angle,
        color: PALETTE.blood,
      };
    } else {
      const count = 2 + this.phase;
      const circles = [{ x: Math.round(player.x), y: Math.round(player.y), radius: 42 }];
      for (let i = 1; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + angle;
        circles.push({
          x: Math.round(player.x + Math.cos(a) * 58),
          y: Math.round(player.y + Math.sin(a) * 58),
          radius: 38,
        });
      }
      this.telegraphShape = {
        type: 'multiCircle',
        circles,
        angle,
        color: PALETTE.blood,
      };
    }
  }

  _applySpecialStatusToPlayer(player, particles) {
    if (this.id === 'lyeStrider') {
      // Lye Strider spit: 2 Corrode stacks
      player.statuses.apply('corrode', { duration: 8.0, sourceName: 'Lye Strider' }, player, particles);
      player.statuses.apply('corrode', { duration: 8.0, sourceName: 'Lye Strider' }, player, particles);
    } else if (this.id === 'flatsHarvester') {
      // Flats Harvester spin: Bleed (up to 3 stacks)
      player.statuses.apply(
        'bleed',
        { duration: 4.0, sourceAtk: this.damage, sourceName: 'Flats Harvester' },
        player,
        particles
      );
      player.statuses.apply(
        'bleed',
        { duration: 4.0, sourceAtk: this.damage, sourceName: 'Flats Harvester' },
        player,
        particles
      );
    } else if (this.id === 'theForeman') {
      // The Foreman slam: Stun 0.8s plus Slow 30% for 2s
      player.statuses.apply('stun', { duration: 0.8, sourceName: 'The Foreman' }, player, particles);
      player.statuses.apply(
        'slow',
        { duration: 2.0, value: 0.30, sourceName: 'The Foreman' },
        player,
        particles
      );
    } else if (this.id === 'bigAxle') {
      // Big Axle ram/exhaust: Stun 1s + Burn
      player.statuses.apply('stun', { duration: 1.0, sourceName: 'Big Axle' }, player, particles);
      player.statuses.apply(
        'burn',
        { duration: 3.0, sourceAtk: this.damage, sourceName: 'Big Axle' },
        player,
        particles
      );
    } else if (this.id === 'motherSump') {
      // Mother Sump tar splash: 2 Corrode stacks and Slow 40% for 3s
      player.statuses.apply('corrode', { duration: 8.0, sourceName: 'Mother Sump' }, player, particles);
      player.statuses.apply('corrode', { duration: 8.0, sourceName: 'Mother Sump' }, player, particles);
      player.statuses.apply(
        'slow',
        { duration: 3.0, value: 0.40, sourceName: 'Mother Sump' },
        player,
        particles
      );
    } else if (this.id === 'theLongDry') {
      // The Long Dry sand burst: Choked for 6s and Slow 30% for 2s
      player.statuses.apply('choked', { duration: 6.0, sourceName: 'The Long Dry' }, player, particles);
      player.statuses.apply(
        'slow',
        { duration: 2.0, value: 0.30, sourceName: 'The Long Dry' },
        player,
        particles
      );
    }
  }

  _executeTelegraphedAttack(player, spawner, projectiles, particles, camera) {
    const sh = this.telegraphShape;
    if (!sh) return;

    if (sh.type === 'line') {
      sound.playSkillLunge();
      camera.shake(4, 0.14);
      const dist = Math.hypot(sh.x2 - sh.x1, sh.y2 - sh.y1);
      const dur = 0.22;
      this.actionActiveTimer = dur;
      this.actionVx = Math.cos(sh.angle) * (dist / dur);
      this.actionVy = Math.sin(sh.angle) * (dist / dur);
      return;
    }

    if (sh.type === 'circle') {
      sound.playSkillGroundBreak();
      camera.shake(4, 0.14);
      particles.spawnShockwave(sh.x, sh.y, sh.radius, sh.color || PALETTE.lye, 0.22);

      // Lye Strider leaves a 3s puddle on the ground that applies 1 Corrode stack/s
      if (this.id === 'lyeStrider' && projectiles) {
        projectiles.spawnAcidPuddle(sh.x, sh.y, 28, 3.0);
      }

      const d = Math.hypot(player.x - sh.x, player.y - sh.y);
      if (d <= sh.radius + player.radius) {
        const hit = player.takeDamage(
          Math.round(this.damage * 1.25),
          sh.x,
          sh.y,
          particles,
          camera,
          this,
          spawner
        );
        if (hit) {
          this._applySpecialStatusToPlayer(player, particles);
        }
      }
      return;
    }

    if (sh.type === 'ring') {
      sound.playSkillGroundBreak();
      camera.shake(this.tier === 'boss' ? 6 : 4, 0.18);
      particles.spawnShockwave(this.x, this.y, sh.radius, PALETTE.blood, 0.24);

      const d = Math.hypot(player.x - this.x, player.y - this.y);
      if (d <= sh.radius + player.radius) {
        const hit = player.takeDamage(
          Math.round(this.damage * 1.35),
          this.x,
          this.y,
          particles,
          camera,
          this,
          spawner
        );
        if (hit) {
          this._applySpecialStatusToPlayer(player, particles);
        }
      }

      if (this.id === 'motherSump' && spawner && typeof spawner.getActiveCount === 'function' && spawner.getActiveCount() < 36) {
        const slot = typeof spawner._getFreeEnemy === 'function' ? spawner._getFreeEnemy() : null;
        if (slot) {
          slot.initFromConfig(ENEMIES_CONFIG.commons.lyeLeech, this.x + 28, this.y + 18, 1.2);
        }
      }
      return;
    }

    if (sh.type === 'multiCircle') {
      sound.playSkillGroundBreak();
      camera.shake(5, 0.2);
      for (let i = 0; i < sh.circles.length; i++) {
        const c = sh.circles[i];
        particles.spawnShockwave(c.x, c.y, c.radius, PALETTE.blood, 0.24);
        particles.spawnDebris(c.x, c.y, 'shardRust', 3);
        const d = Math.hypot(player.x - c.x, player.y - c.y);
        if (d <= c.radius + player.radius) {
          const hit = player.takeDamage(
            Math.round(this.damage * 1.25),
            c.x,
            c.y,
            particles,
            camera,
            this,
            spawner
          );
          if (hit) {
            this._applySpecialStatusToPlayer(player, particles);
          }
        }
      }
    }
  }

  drawTelegraph(ctx, camera) {
    if (!this.active) return;
    const isImpactSolid = this.telegraphImpactFlashTimer > 0;
    if (!this.telegraphActive && !isImpactSolid) return;
    const sh = this.telegraphShape;
    if (!sh) return;

    const tick24 = Math.floor(this.telegraphTimer * 24);
    if (!isImpactSolid && tick24 % 3 === 2) return;

    const camX = camera.renderX;
    const camY = camera.renderY;
    const col = sh.color || PALETTE.blood;

    if (sh.type === 'line') {
      const sx1 = Math.round(sh.x1 - camX);
      const sy1 = Math.round(sh.y1 - camY);
      const sx2 = Math.round(sh.x2 - camX);
      const sy2 = Math.round(sh.y2 - camY);

      const perpX = Math.round(-Math.sin(sh.angle) * (sh.width / 2));
      const perpY = Math.round(Math.cos(sh.angle) * (sh.width / 2));
      drawPixelLine(ctx, sx1 + perpX, sy1 + perpY, sx2 + perpX, sy2 + perpY, col, 1);
      drawPixelLine(ctx, sx1 - perpX, sy1 - perpY, sx2 - perpX, sy2 - perpY, col, 1);
      drawPixelLine(ctx, sx1, sy1, sx2, sy2, col, isImpactSolid ? sh.width : 2);
    } else if (sh.type === 'circle' || sh.type === 'ring') {
      const cx = Math.round((sh.type === 'ring' ? this.x : sh.x) - camX);
      const cy = Math.round((sh.type === 'ring' ? this.y : sh.y) - camY);
      const r = Math.round(sh.radius);
      drawBresenhamCircle(ctx, cx, cy, r, col, 1.0);
      if (isImpactSolid) {
        ctx.fillStyle = col;
        for (let dy = -r; dy <= r; dy++) {
          const span = Math.floor(Math.sqrt(r * r - dy * dy));
          ctx.fillRect(cx - span, cy + dy, span * 2, 1);
        }
      } else {
        ctx.fillStyle = col;
        for (let dy = -r; dy <= r; dy += 2) {
          const span = Math.floor(Math.sqrt(r * r - dy * dy));
          for (let dx = -span; dx <= span; dx += 2) {
            if (passDither(cx + dx, cy + dy, 0.25)) {
              ctx.fillRect(cx + dx, cy + dy, 1, 1);
            }
          }
        }
      }
    } else if (sh.type === 'multiCircle') {
      for (let i = 0; i < sh.circles.length; i++) {
        const c = sh.circles[i];
        const cx = Math.round(c.x - camX);
        const cy = Math.round(c.y - camY);
        const r = Math.round(c.radius);
        drawBresenhamCircle(ctx, cx, cy, r, col, 1.0);
        if (isImpactSolid) {
          ctx.fillStyle = col;
          for (let dy = -r; dy <= r; dy++) {
            const span = Math.floor(Math.sqrt(r * r - dy * dy));
            ctx.fillRect(cx - span, cy + dy, span * 2, 1);
          }
        }
      }
    }
  }

  draw(ctx, camera) {
    if (!this.active || !camera.isVisible(this.x, this.y, 72)) return;

    const camX = camera.renderX;
    const camY = camera.renderY;
    const sx = Math.round(this.x - camX);
    const sy = Math.round(this.y - camY);

    const isWireKite = this.id === 'wireKite';
    const isLifted = this.statuses.isLifted();
    const isStaggered = this.statuses.staggeredTimer > 0;
    const isStunned = this.statuses.isStunned();

    // Lifted raises the sprite 12px while the shadow stays on the ground
    const flyHeightOffset =
      (isWireKite
        ? -14 + Math.round(Math.sin(this.animTimer * Math.PI * 4) * 3)
        : this.flying
        ? -8
        : 0) + (isLifted ? -12 : 0);

    // Ground shade (always stays on the ground)
    ctx.fillStyle = PALETTE.soot;
    const shadeW = Math.max(8, Math.round(this.radius * 1.3));
    ctx.fillRect(sx - (shadeW >> 1), sy + this.radius - 2, shadeW, 3);

    const entry = spriteRegistry.enemies[this.id];
    if (entry) {
      const fIdx = this.animFrame % entry.right.length;
      const isRight = this.facingX >= 0;
      let spriteCanvas = null;

      if (
        this.hitFlashFrames > 0 ||
        (isStaggered && Math.floor(this.animClock * 16) % 2 === 0)
      ) {
        spriteCanvas = isRight ? entry.whiteRight[fIdx] : entry.whiteLeft[fIdx];
      } else if (isStunned) {
        spriteCanvas = isRight ? entry.stunRight[fIdx] : entry.stunLeft[fIdx];
      } else if (this.tier === 'boss' && this.brassRimTimer > 0) {
        spriteCanvas = isRight ? entry.brassRimRight[fIdx] : entry.brassRimLeft[fIdx];
      } else if (this.telegraphActive || this.ratTwitchTimer > 0) {
        spriteCanvas = isRight ? entry.tellRight[fIdx] : entry.tellLeft[fIdx];
      } else if ((this.tier === 'elite' || this.tier === 'fusionBoss') && Math.floor(this.animClock * 6) % 2 === 1) {
        spriteCanvas = isRight ? entry.elitePulseRight[fIdx] : entry.elitePulseLeft[fIdx];
      } else {
        spriteCanvas = isRight ? entry.right[fIdx] : entry.left[fIdx];
      }

      // Hide sprite while The Long Dry is burrowed underground (tremor rings drawn by BossMechanics)
      const isBurrowed = !!(this.bm && this.bm.subsurfaceTimer > 0);
      if (spriteCanvas && !isBurrowed) {
        const scaleDraw = this.isKingBoss ? 1.45 : 1.0;
        const w = Math.round(spriteCanvas.width * scaleDraw);
        const h = Math.round(spriteCanvas.height * scaleDraw);
        const stunTiltX = isStaggered
          ? Math.floor(this.animClock * 24) % 2 === 0
            ? -2
            : 2
          : isStunned
          ? 2
          : 0;
        const squashDropY = this.squashTimer > 0 || this.feignedDeathTimer > 0 ? 3 : 0;

        if (this.isKingBoss) {
          drawBresenhamCircle(ctx, sx, sy + flyHeightOffset, this.radius + 4, '#FFC83D', 0.9);
          drawBresenhamCircle(ctx, sx, sy + flyHeightOffset, this.radius + 1, '#C042FF', 0.85);
        }

        ctx.drawImage(
          spriteCanvas,
          0,
          0,
          spriteCanvas.width,
          spriteCanvas.height,
          Math.round(sx - w / 2 + stunTiltX),
          Math.round(sy - h / 2 + flyHeightOffset + squashDropY),
          w,
          h
        );
      }
    }

    // Draw pixel-art status visuals on enemy
    this.statuses.drawEffectsOnEntity(
      ctx,
      sx,
      sy + flyHeightOffset,
      this.radius,
      this.animClock
    );

    // Overhead HP bar + AI role/grudge/morale cues
    const activeStatuses = this.statuses.getUiList();
    if (
      this.tier !== 'boss' &&
      (this.hp < this.maxHp ||
        this.tier === 'elite' ||
        this.tier === 'fusionBoss' ||
        activeStatuses.length > 0)
    ) {
      const barW = this.isKingBoss ? 52 : this.tier === 'fusionBoss' ? 36 : this.tier === 'elite' ? 24 : 16;
      const barH = this.isKingBoss ? 4 : this.tier === 'fusionBoss' ? 3 : 2;
      const bx = sx - (barW >> 1);
      const by = sy - this.radius - (this.isKingBoss ? 11 : 7) + flyHeightOffset;
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = this.isKingBoss ? '#FFC83D' : this.tier === 'fusionBoss' ? PALETTE.brass : PALETTE.blood;
      ctx.fillRect(bx, by, Math.max(1, Math.round((this.hp / this.maxHp) * barW)), barH);

      if (this.isKingBoss) {
        drawPixelText(ctx, `★ ${this.name.toUpperCase()} ★`, sx, by - 8, '#FFC83D', 'center');
      } else if (this.tier === 'fusionBoss') {
        drawPixelText(ctx, this.name.toUpperCase(), sx, by - 7, PALETTE.brass, 'center');
      }

      // Up to 3 small status icons above the health bar
      if (activeStatuses.length > 0) {
        const shown = activeStatuses.slice(0, 3);
        const startX = sx - Math.round((shown.length * 6) / 2);
        const iconY = by - (this.tier === 'fusionBoss' ? 14 : 6);
        for (let i = 0; i < shown.length; i++) {
          const st = shown[i];
          const ix = startX + i * 6;
          ctx.fillStyle = PALETTE.soot;
          ctx.fillRect(ix - 1, iconY - 1, 6, 6);
          ctx.fillStyle = st.color;
          ctx.fillRect(ix, iconY, 4, 4);
        }
      }
    }

    // Subtle crimson ring for 10-Level Gap Enrage (no cluttering text popup!)
    if (this.isAbyssEnraged && !this.isKingBoss) {
      drawBresenhamCircle(ctx, sx, sy + flyHeightOffset, this.radius + 2, '#E03C31', 0.65);
    } else if (this.isRitualMarcher) {
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(sx - 2, sy - this.radius - 11, 4, 2);
    } else if (this.aiRoleState === 'RETREAT') {
      drawPixelText(ctx, '!', sx, sy - this.radius - 12, PALETTE.bone, 'center');
    } else if (this.grudgeState && this.grudgeState.confidence >= 2) {
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - 2, sy - this.radius - 12, 4, 2);
    }
  }
}

export default Enemy;
