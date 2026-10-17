/**
 * GRAVEL SKY — Player Entity (Sena Ibuki)
 * - Uses manifest-loaded 64x64 directional sprite strips:
 *   sena_idle_down|up|side, sena_run_down|up|side, sena_attack1|2|3_down|up|side,
 *   sena_hurt_down|up|side, sena_dodge_side, sena_death_side.
 * - Left facing is a mirror of the side view (flipX = true).
 * - Hybrid animation: key frames from manifest + code-driven squash, bob, 2px sway offset,
 *   and alpha-masked white hit flash.
 * - Seven Cuts ultimate uses ultimate_cutin (480x120) and fx_ult_slash strips, plus
 *   whole-screen slag/bone drop, letterbox bars, inverted flash frames, and split-apart enemy kills.
 */

import {
  PALETTE,
  PLAYER_CONFIG,
  SKILLS_CONFIG,
  SHOP_ITEMS,
  WORLD_CONFIG,
  xpForNextLevel,
} from '../data/config.js';
import { assets } from './AssetLoader.js';
import { sound } from './Audio.js';

export class Player {
  constructor() {
    this.resetToNewGame();
  }

  resetToNewGame() {
    this.x = WORLD_CONFIG.kettleCenter.x;
    this.y = WORLD_CONFIG.kettleCenter.y + 28;
    this.vx = 0;
    this.vy = 0;
    this.radius = PLAYER_CONFIG.radius;

    this.level = 1;
    this.xp = 0;
    this.xpToNext = xpForNextLevel(1);
    this.gold = 95;
    this.skillPoints = 1;

    this.skills = {
      lunge: 1,
      groundBreak: 1,
      railSpike: 1,
    };

    this.equipped = {
      head: 'weldingGoggles',
      body: 'patchedVest',
      legs: 'workBoots',
    };
    this.ownedEquipment = [];

    this.supplies = {
      gauzeRoll: 2,
      sugarTin: 1,
    };

    this.maxHp = PLAYER_CONFIG.baseHp;
    this.hp = this.maxHp;
    this.maxStamina = PLAYER_CONFIG.baseStamina;
    this.stamina = this.maxStamina;
    this.atk = PLAYER_CONFIG.baseAtk;
    this.def = PLAYER_CONFIG.baseDef;
    this.speed = PLAYER_CONFIG.baseSpeed;
    this.critChance = PLAYER_CONFIG.baseCritChance;

    this.cooldowns = {
      dodge: 0,
      lunge: 0,
      groundBreak: 0,
      railSpike: 0,
    };
    this.maxCooldowns = {
      dodge: PLAYER_CONFIG.dodgeCooldown,
      lunge: SKILLS_CONFIG.lunge.cooldownBase,
      groundBreak: SKILLS_CONFIG.groundBreak.cooldownBase,
      railSpike: SKILLS_CONFIG.railSpike.cooldownBase,
    };

    this.recalculateStats(true);

    // 4 facing directions ('down', 'up', 'right', 'left')
    this.facingDir = 'down';
    this.aimAngle = 0;
    this.animState = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.swayTimer = 0;

    // 3-hit combo state
    this.comboStep = 0;
    this.comboResetTimer = 0;
    this.attackCooldown = 0;
    this.attackAnimTimer = 0;
    this.attackAnimDuration = 0.24;

    // Lunge (Skill 1)
    this.lungeActive = false;
    this.lungePhase = 'none';
    this.lungeTimer = 0;
    this.lungeAngle = 0;
    this.lungeTargetX = 0;
    this.lungeTargetY = 0;
    this.afterimages = [];

    // Ground Break (Skill 2)
    this.groundBreakActive = false;
    this.groundBreakPhase = 'none';
    this.groundBreakTimer = 0;

    // Dodge roll
    this.dodgeTimer = 0;
    this.dodgeVx = 0;
    this.dodgeVy = 0;
    this.invulnerableTimer = 0;

    this.sugarBuffTimer = 0;

    // Seven Cuts Ultimate
    this.ultimateCharge = 0;
    this.ultimateActive = false;
    this.ultimateTimer = 0;
    this.ultimateDuration = SKILLS_CONFIG.sevenCuts.freezeDuration;
    this.ultimateSlashes = [];
    this.ultimateTargetQueue = [];
    this.ultimateInvertFrames = 0;

    // Hurt / Death
    this.hurtTimer = 0;
    this.hitFlashTimer = 0;
    this.dead = false;
    this.deathAnimTimer = 0;
  }

  _angleToFacingDir(angle) {
    const deg = ((angle * 180) / Math.PI + 360) % 360;
    if (deg >= 45 && deg < 135) return 'down';
    if (deg >= 135 && deg < 225) return 'left';
    if (deg >= 225 && deg < 315) return 'up';
    return 'right';
  }

  recalculateStats(fullRestore = false) {
    if (!this.maxCooldowns) {
      this.maxCooldowns = {
        dodge: PLAYER_CONFIG.dodgeCooldown,
        lunge: SKILLS_CONFIG.lunge.cooldownBase,
        groundBreak: SKILLS_CONFIG.groundBreak.cooldownBase,
        railSpike: SKILLS_CONFIG.railSpike.cooldownBase,
      };
    }
    const lvlBonus = this.level - 1;
    let maxHp = PLAYER_CONFIG.baseHp + lvlBonus * PLAYER_CONFIG.perLevel.hp;
    let maxStam = PLAYER_CONFIG.baseStamina + lvlBonus * PLAYER_CONFIG.perLevel.stamina;
    let atk = PLAYER_CONFIG.baseAtk + lvlBonus * PLAYER_CONFIG.perLevel.atk;
    let def = PLAYER_CONFIG.baseDef + lvlBonus * PLAYER_CONFIG.perLevel.def;
    let speed = PLAYER_CONFIG.baseSpeed;
    let crit = PLAYER_CONFIG.baseCritChance;

    for (const slot of ['head', 'body', 'legs']) {
      const itemId = this.equipped[slot];
      const item = itemId ? SHOP_ITEMS[itemId] : null;
      if (item && item.stats) {
        maxHp += item.stats.hp || 0;
        maxStam += item.stats.stamina || 0;
        atk += item.stats.atk || 0;
        def += item.stats.def || 0;
        speed += item.stats.speed || 0;
        crit += item.stats.crit || item.stats.critChance || 0;
      }
    }

    const hpRatio = this.maxHp > 0 ? this.hp / this.maxHp : 1;
    this.maxHp = maxHp;
    this.maxStamina = maxStam;
    this.atk = atk;
    this.def = def;
    this.speed = speed * 0.42;
    this.critChance = Math.min(0.65, crit);

    if (fullRestore) {
      this.hp = this.maxHp;
      this.stamina = this.maxStamina;
    } else {
      this.hp = Math.min(this.maxHp, Math.max(1, Math.round(this.maxHp * hpRatio)));
      this.stamina = Math.min(this.maxStamina, this.stamina);
    }

    this.maxCooldowns.lunge = Math.max(
      1.2,
      SKILLS_CONFIG.lunge.cooldownBase -
        (this.skills.lunge - 1) * SKILLS_CONFIG.lunge.cooldownReductionPerLevel
    );
    this.maxCooldowns.groundBreak = Math.max(
      2.2,
      SKILLS_CONFIG.groundBreak.cooldownBase -
        (this.skills.groundBreak - 1) * SKILLS_CONFIG.groundBreak.cooldownReductionPerLevel
    );
    this.maxCooldowns.railSpike = Math.max(
      0.9,
      SKILLS_CONFIG.railSpike.cooldownBase -
        (this.skills.railSpike - 1) * SKILLS_CONFIG.railSpike.cooldownReductionPerLevel
    );
  }

  gainXp(amount, particles) {
    if (this.dead || this.level >= PLAYER_CONFIG.levelCap) return;
    this.xp += amount;
    while (this.xp >= this.xpToNext && this.level < PLAYER_CONFIG.levelCap) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.skillPoints += PLAYER_CONFIG.perLevel.skillPoints;
      this.xpToNext = xpForNextLevel(this.level);
      this.recalculateStats(false);

      const healAmount = Math.round(this.maxHp * PLAYER_CONFIG.perLevel.healFraction);
      this.hp = Math.min(this.maxHp, this.hp + healAmount);
      this.stamina = this.maxStamina;

      sound.playLevelUp();
      if (particles) {
        particles.spawnRing(this.x, this.y, 44, PALETTE.signal, 0.45);
        particles.spawnDamageNumber(this.x, this.y - 16, `LVL ${this.level}`, true, PALETTE.signal);
      }
    }
  }

  gainGold(amount, particles) {
    if (amount <= 0) return;
    this.gold += amount;
    sound.playCoin();
    if (particles) {
      particles.spawnDamageNumber(this.x, this.y - 10, `+${amount}G`, false, PALETTE.brass);
    }
  }

  addUltimateCharge(amount) {
    if (this.ultimateActive) return;
    this.ultimateCharge = Math.min(
      SKILLS_CONFIG.sevenCuts.chargeMax,
      this.ultimateCharge + amount
    );
  }

  useSupply(supplyId, particles) {
    if (this.dead) return false;
    const count = this.supplies[supplyId] || 0;
    if (count <= 0) return false;
    const item = SHOP_ITEMS[supplyId];
    if (!item) return false;

    if (supplyId === 'gauzeRoll') {
      if (this.hp >= this.maxHp) return false;
      this.supplies.gauzeRoll -= 1;
      const heal = Math.round(this.maxHp * item.healFraction);
      this.hp = Math.min(this.maxHp, this.hp + heal);
      sound.playHeal();
      if (particles) {
        particles.spawnDamageNumber(this.x, this.y - 10, `+${heal} HP`, false, PALETTE.signal);
      }
      return true;
    }

    if (supplyId === 'sugarTin') {
      this.supplies.sugarTin -= 1;
      this.stamina = Math.min(this.maxStamina, this.stamina + item.staminaRestore);
      this.sugarBuffTimer = item.buffDuration;
      sound.playHeal();
      if (particles) {
        particles.spawnDamageNumber(this.x, this.y - 10, 'STAMINA UP', false, PALETTE.brass);
      }
      return true;
    }

    return false;
  }

  tryDodge(moveX, moveY, mouseWorldX, mouseWorldY, particles) {
    if (
      this.dead ||
      this.ultimateActive ||
      this.lungeActive ||
      this.groundBreakActive ||
      this.dodgeTimer > 0 ||
      this.cooldowns.dodge > 0
    ) {
      return false;
    }
    if (this.stamina < PLAYER_CONFIG.dodgeStaminaCost) return false;

    this.stamina -= PLAYER_CONFIG.dodgeStaminaCost;
    this.dodgeTimer = PLAYER_CONFIG.dodgeDuration;
    this.invulnerableTimer = Math.max(this.invulnerableTimer, PLAYER_CONFIG.dodgeDuration);
    this.cooldowns.dodge = this.maxCooldowns.dodge;

    let angle = Math.atan2(moveY, moveX);
    if (moveX === 0 && moveY === 0) {
      angle = Math.atan2(mouseWorldY - this.y, mouseWorldX - this.x);
    }
    this.facingDir = this._angleToFacingDir(angle);
    const dodgeSpd = PLAYER_CONFIG.dodgeSpeed * 0.42;
    this.dodgeVx = Math.cos(angle) * dodgeSpd;
    this.dodgeVy = Math.sin(angle) * dodgeSpd;

    sound.playDodge();
    if (particles) {
      particles.spawnDustPuff(this.x, this.y + 4, 3);
    }
    return true;
  }

  tryBasicAttack(mouseWorldX, mouseWorldY, spawner, particles, camera, onHitStop) {
    if (
      this.dead ||
      this.ultimateActive ||
      this.lungeActive ||
      this.groundBreakActive ||
      this.dodgeTimer > 0 ||
      this.attackCooldown > 0
    ) {
      return false;
    }

    this.aimAngle = Math.atan2(mouseWorldY - this.y, mouseWorldX - this.x);
    this.facingDir = this._angleToFacingDir(this.aimAngle);

    this.comboStep = (this.comboStep % 3) + 1;
    this.comboResetTimer = PLAYER_CONFIG.comboResetTime;
    const isFinisher = this.comboStep === 3;
    this.attackCooldown = isFinisher ? 0.34 : 0.22;
    this.attackAnimDuration = isFinisher ? 0.32 : 0.22;
    this.attackAnimTimer = this.attackAnimDuration;
    this.animFrame = 0;
    this.animTimer = 0;

    // Slight forward step
    const step = isFinisher ? 8 : 4;
    this.x = Math.round(this.x + Math.cos(this.aimAngle) * step);
    this.y = Math.round(this.y + Math.sin(this.aimAngle) * step);

    sound.playSlash(this.comboStep);

    const reach = isFinisher ? 34 : 26;
    if (particles) {
      particles.spawnSlashArc(this.x, this.y - 6, this.aimAngle, reach, isFinisher ? 8 : 5, isFinisher);
    }

    const arcHalf = isFinisher ? 1.15 : 0.92;
    const mult = isFinisher ? 1.5 : this.comboStep === 2 ? 1.15 : 1.0;
    const rawDamage = Math.round(this.atk * mult);

    const candidates = spawner.queryNearby(this.x, this.y, reach + 32);
    let hitCount = 0;
    for (let i = 0; i < candidates.length; i++) {
      const e = candidates[i];
      if (e.dead) continue;
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > reach + e.radius) continue;

      const angleToEnemy = Math.atan2(dy, dx);
      let diff = angleToEnemy - this.aimAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      if (Math.abs(diff) <= arcHalf || dist < e.radius + 8) {
        const isCrit = Math.random() < this.critChance;
        const dmg = isCrit ? Math.round(rawDamage * PLAYER_CONFIG.critMultiplier) : rawDamage;
        const kb = isFinisher ? 65 : 35;
        e.takeDamage(dmg, this.aimAngle, kb, isCrit, this, particles, camera, spawner);
        hitCount += 1;
      }
    }

    if (hitCount > 0) {
      this.addUltimateCharge(hitCount * SKILLS_CONFIG.sevenCuts.chargePerHit);
      sound.playHitEnemy(isFinisher);
      camera.addShake(isFinisher ? 4 : 2);
      if (onHitStop) {
        onHitStop(isFinisher ? 0.065 : 0.045);
      }
    }

    return true;
  }

  /**
   * SKILL 1: LUNGE (Uses fx_dash_streak & 3 afterimages)
   */
  trySkillLunge(mouseWorldX, mouseWorldY, spawner, particles, camera, onHitStop) {
    if (
      this.dead ||
      this.ultimateActive ||
      this.lungeActive ||
      this.groundBreakActive ||
      this.cooldowns.lunge > 0
    ) {
      return false;
    }
    const cfg = SKILLS_CONFIG.lunge;
    if (this.stamina < cfg.staminaCost) return false;

    this.stamina -= cfg.staminaCost;
    this.cooldowns.lunge = this.maxCooldowns.lunge;
    this.aimAngle = Math.atan2(mouseWorldY - this.y, mouseWorldX - this.x);
    this.facingDir = this._angleToFacingDir(this.aimAngle);

    this.lungeActive = true;
    this.lungePhase = 'crouch';
    this.lungeTimer = 2 / 24;
    this.lungeAngle = this.aimAngle;
    this.invulnerableTimer = Math.max(this.invulnerableTimer, 0.28);

    const dashDist = 72;
    this.lungeTargetX = Math.max(
      24,
      Math.min(WORLD_CONFIG.width - 24, Math.round(this.x + Math.cos(this.lungeAngle) * dashDist))
    );
    this.lungeTargetY = Math.max(
      24,
      Math.min(WORLD_CONFIG.height - 24, Math.round(this.y + Math.sin(this.lungeAngle) * dashDist))
    );

    this._lungeDeps = { spawner, particles, camera, onHitStop };
    sound.playLunge();
    return true;
  }

  _executeLungeDash() {
    const { spawner, particles, camera, onHitStop } = this._lungeDeps || {};
    const startX = this.x;
    const startY = this.y;
    const endX = this.lungeTargetX;
    const endY = this.lungeTargetY;

    // 3 cyan-tinted afterimages spaced along the path
    this.afterimages = [1, 2, 3].map((step) => ({
      x: Math.round(startX + ((endX - startX) * step) / 4),
      y: Math.round(startY + ((endY - startY) * step) / 4),
      facingDir: this.facingDir,
      timer: (4 - step) * (1 / 24),
    }));

    if (particles) {
      particles.spawnDustPuff(startX, startY + 4, 4);
      particles.spawnSlashLine(startX, startY - 6, endX, endY - 6, PALETTE.signal, 0.25);
    }

    const cfg = SKILLS_CONFIG.lunge;
    const lvl = this.skills.lunge || 1;
    const mult = cfg.damageMultBase + (lvl - 1) * cfg.damageMultPerLevel;
    const rawDamage = Math.round(this.atk * mult);

    const dx = endX - startX;
    const dy = endY - startY;
    const segLenSq = dx * dx + dy * dy || 1;

    if (spawner) {
      const candidates = spawner.queryNearby((startX + endX) / 2, (startY + endY) / 2, 90);
      let hits = 0;
      for (let i = 0; i < candidates.length; i++) {
        const e = candidates[i];
        if (e.dead) continue;
        const t = Math.max(0, Math.min(1, ((e.x - startX) * dx + (e.y - startY) * dy) / segLenSq));
        const projX = startX + t * dx;
        const projY = startY + t * dy;
        const dist = Math.hypot(e.x - projX, e.y - projY);
        if (dist <= e.radius + 16) {
          const isCrit = Math.random() < this.critChance + 0.15;
          const dmg = isCrit ? Math.round(rawDamage * PLAYER_CONFIG.critMultiplier) : rawDamage;
          e.takeDamage(dmg, this.lungeAngle, 55, isCrit, this, particles, camera, spawner);
          hits += 1;
        }
      }
      if (hits > 0) {
        this.addUltimateCharge(hits * SKILLS_CONFIG.sevenCuts.chargePerHit);
        sound.playHitEnemy(true);
        if (onHitStop) onHitStop(0.055);
      }
    }

    this.x = endX;
    this.y = endY;
    if (camera) camera.addShake(4);
  }

  /**
   * SKILL 2: GROUND BREAK (Overhead hold + slam + fx_ground_cracks + fx_shock_ring)
   */
  trySkillGroundBreak(spawner, particles, camera, onHitStop) {
    if (
      this.dead ||
      this.ultimateActive ||
      this.lungeActive ||
      this.groundBreakActive ||
      this.cooldowns.groundBreak > 0
    ) {
      return false;
    }
    const cfg = SKILLS_CONFIG.groundBreak;
    if (this.stamina < cfg.staminaCost) return false;

    this.stamina -= cfg.staminaCost;
    this.cooldowns.groundBreak = this.maxCooldowns.groundBreak;
    this.groundBreakActive = true;
    this.groundBreakPhase = 'raise';
    this.groundBreakTimer = 3 / 24;
    this._gbDeps = { spawner, particles, camera, onHitStop };
    return true;
  }

  _executeGroundBreakImpact() {
    const { spawner, particles, camera, onHitStop } = this._gbDeps || {};
    const cfg = SKILLS_CONFIG.groundBreak;
    const lvl = this.skills.groundBreak || 1;
    const mult = cfg.damageMultBase + (lvl - 1) * cfg.damageMultPerLevel;
    const radius = Math.round((cfg.radiusBase + (lvl - 1) * cfg.radiusPerLevel) * 0.45);
    const rawDamage = Math.round(this.atk * mult);

    sound.playGroundBreak();
    if (camera) camera.addShake(3);
    if (particles) {
      particles.spawnGroundBreakCracks(this.x, this.y + 4, radius);
    }

    if (spawner) {
      const candidates = spawner.queryNearby(this.x, this.y, radius + 32);
      let hits = 0;
      for (let i = 0; i < candidates.length; i++) {
        const e = candidates[i];
        if (e.dead) continue;
        const dist = Math.hypot(e.x - this.x, e.y - this.y);
        if (dist <= radius + e.radius) {
          const angle = Math.atan2(e.y - this.y, e.x - this.x);
          const isCrit = Math.random() < this.critChance;
          const dmg = isCrit ? Math.round(rawDamage * PLAYER_CONFIG.critMultiplier) : rawDamage;
          e.takeDamage(dmg, angle, 75, isCrit, this, particles, camera, spawner);
          e.applyStun(cfg.stunDuration);
          hits += 1;
        }
      }
      if (hits > 0) {
        this.addUltimateCharge(hits * SKILLS_CONFIG.sevenCuts.chargePerHit);
        if (onHitStop) onHitStop(0.065);
      }
    }
  }

  /**
   * SKILL 3: RAIL SPIKE (Uses 4-angle rail_spike manifest asset)
   */
  trySkillRailSpike(mouseWorldX, mouseWorldY, projectiles, particles, camera) {
    if (
      this.dead ||
      this.ultimateActive ||
      this.lungeActive ||
      this.groundBreakActive ||
      this.cooldowns.railSpike > 0
    ) {
      return false;
    }
    const cfg = SKILLS_CONFIG.railSpike;
    if (this.stamina < cfg.staminaCost) return false;

    this.stamina -= cfg.staminaCost;
    this.cooldowns.railSpike = this.maxCooldowns.railSpike;
    this.aimAngle = Math.atan2(mouseWorldY - this.y, mouseWorldX - this.x);
    this.facingDir = this._angleToFacingDir(this.aimAngle);
    this.attackAnimDuration = 0.2;
    this.attackAnimTimer = 0.2;

    // 2px recoil
    this.x = Math.round(this.x - Math.cos(this.aimAngle) * 2);
    this.y = Math.round(this.y - Math.sin(this.aimAngle) * 2);

    const lvl = this.skills.railSpike || 1;
    const mult = cfg.damageMultBase + (lvl - 1) * cfg.damageMultPerLevel;
    const damage = Math.round(this.atk * mult);

    projectiles.spawn({
      owner: 'player',
      kind: 'rail_spike',
      x: this.x + Math.cos(this.aimAngle) * 10,
      y: this.y - 6 + Math.sin(this.aimAngle) * 10,
      angle: this.aimAngle,
      speed: 260,
      radius: 5,
      damage,
      maxLife: 0.9,
      pierce: true,
    });

    sound.playRailSpike();
    camera.addShake(2);
    if (particles) {
      particles.spawnBurst(
        this.x + Math.cos(this.aimAngle) * 10,
        this.y - 6 + Math.sin(this.aimAngle) * 10,
        5,
        PALETTE.signal,
        20,
        60
      );
    }
    return true;
  }

  /**
   * ULTIMATE [R]: SEVEN CUTS
   */
  tryUltimate(spawner, particles, camera) {
    if (this.dead || this.ultimateActive) return false;
    if (this.ultimateCharge < SKILLS_CONFIG.sevenCuts.chargeMax) return false;

    this.ultimateCharge = 0;
    this.ultimateActive = true;
    this.ultimateTimer = this.ultimateDuration;
    this.invulnerableTimer = this.ultimateDuration + 0.35;
    this.ultimateSlashes = [];
    this.ultimateInvertFrames = 0;

    const screenEnemies = spawner.getEnemiesInRadius(this.x, this.y, 240);
    this.ultimateTargetQueue = screenEnemies.filter((e) => !e.dead);

    sound.playSevenCutsStart();
    camera.addShake(4);

    const slashAngles = [-0.45, 0.52, -0.18, 0.85, -0.78, 0.14, -0.32];
    for (let i = 0; i < 7; i++) {
      this.ultimateSlashes.push({
        triggerTime: this.ultimateDuration - (0.2 + i * 0.1),
        fired: false,
        angle: slashAngles[i],
        index: i,
      });
    }

    this._ultimateDeps = { spawner, particles, camera };
    return true;
  }

  takeDamage(rawDamage, sourceX, sourceY, particles, camera) {
    if (this.dead || this.invulnerableTimer > 0 || this.ultimateActive) return false;

    const actualDamage = Math.max(1, Math.round(rawDamage - this.def));
    this.hp = Math.max(0, this.hp - actualDamage);
    this.hurtTimer = 0.25;
    this.hitFlashTimer = 0.14;
    this.invulnerableTimer = 0.38;

    const knockAngle = Math.atan2(this.y - sourceY, this.x - sourceX);
    this.x = Math.round(this.x + Math.cos(knockAngle) * 8);
    this.y = Math.round(this.y + Math.sin(knockAngle) * 8);

    sound.playPlayerHurt();
    camera.addShake(4);
    if (particles) {
      particles.spawnBurst(this.x, this.y - 6, 8, PALETTE.blood, 20, 75);
      particles.spawnDamageNumber(this.x, this.y - 12, `-${actualDamage}`, false, PALETTE.blood);
    }

    if (this.hp <= 0) {
      this.dead = true;
      this.deathAnimTimer = 0;
      this.animState = 'death';
      this.animFrame = 0;
      sound.playPlayerDeath();
    }
    return true;
  }

  respawnAtKettle() {
    const goldLost = Math.floor(this.gold * 0.1);
    this.gold = Math.max(0, this.gold - goldLost);
    this.x = WORLD_CONFIG.kettleCenter.x;
    this.y = WORLD_CONFIG.kettleCenter.y + 28;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.stamina = this.maxStamina;
    this.dead = false;
    this.deathAnimTimer = 0;
    this.hurtTimer = 0;
    this.invulnerableTimer = 1.2;
    this.animState = 'idle';
    this.animFrame = 0;
    return goldLost;
  }

  update(dt, input, spawner, particles, camera, world, onHitStop) {
    this.swayTimer += dt;

    for (const key of Object.keys(this.cooldowns)) {
      if (this.cooldowns[key] > 0) {
        this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
      }
    }

    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].timer -= dt;
      if (this.afterimages[i].timer <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    if (this.invulnerableTimer > 0) this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    if (this.hurtTimer > 0) this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    if (this.hitFlashTimer > 0) this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    if (this.sugarBuffTimer > 0) this.sugarBuffTimer = Math.max(0, this.sugarBuffTimer - dt);

    if (this.dead) {
      this.deathAnimTimer += dt;
      this.animState = 'death';
      this.animFrame = Math.min(3, Math.floor(this.deathAnimTimer / 0.16));
      return;
    }

    // Seven Cuts Ultimate Execution
    if (this.ultimateActive) {
      this.ultimateTimer -= dt;
      for (const s of this.ultimateSlashes) {
        if (!s.fired && this.ultimateTimer <= s.triggerTime) {
          s.fired = true;
          sound.playSevenCutsTick(s.index);
          const { particles: pt } = this._ultimateDeps || {};
          if (pt) {
            const cx = this.x + (Math.random() - 0.5) * 140;
            const cy = this.y + (Math.random() - 0.5) * 80;
            pt.spawnStripFx('fx_ult_slash', cx, cy, {
              frame: s.index % 3,
              flipX: s.index % 2 === 1,
              scale: 0.65,
              fps: 24,
            });
          }
          for (const e of this.ultimateTargetQueue) {
            if (!e.dead) {
              e.hitFlashTimer = 0.25;
            }
          }
        }
      }

      if (this.ultimateTimer <= 0) {
        this.ultimateActive = false;
        this.ultimateInvertFrames = 2;
        const { spawner: sp, particles: pt, camera: cam } = this._ultimateDeps || {};
        const totalDamage = Math.round(this.atk * SKILLS_CONFIG.sevenCuts.totalDamageMult);
        const perSlashDmg = Math.max(1, Math.round(totalDamage / 7));

        for (const e of this.ultimateTargetQueue) {
          if (!e.dead) {
            for (let cut = 0; cut < 7; cut++) {
              const ox = (Math.random() - 0.5) * 18;
              const oy = (Math.random() - 0.5) * 14;
              pt.spawnDamageNumber(e.x + ox, e.y - 8 + oy, perSlashDmg, true, PALETTE.brass);
            }
            e.killedBySevenCuts = true;
            e.takeDamage(totalDamage, 0, 70, true, this, pt, cam, sp);
          }
        }
        sound.playSevenCutsDetonate();
        if (cam) cam.addShake(7);
        if (onHitStop) onHitStop(0.08);
      }
      return;
    }

    // Lunge timeline
    if (this.lungeActive) {
      this.lungeTimer -= dt;
      if (this.lungePhase === 'crouch' && this.lungeTimer <= 0) {
        this._executeLungeDash();
        this.lungePhase = 'hold';
        this.lungeTimer = 3 / 24;
      } else if (this.lungePhase === 'hold' && this.lungeTimer <= 0) {
        this.lungeActive = false;
        this.lungePhase = 'none';
      }
      return;
    }

    // Ground Break timeline
    if (this.groundBreakActive) {
      this.groundBreakTimer -= dt;
      if (this.groundBreakPhase === 'raise' && this.groundBreakTimer <= 0) {
        this._executeGroundBreakImpact();
        this.groundBreakPhase = 'slam';
        this.groundBreakTimer = 0.16;
      } else if (this.groundBreakPhase === 'slam' && this.groundBreakTimer <= 0) {
        this.groundBreakActive = false;
        this.groundBreakPhase = 'none';
      }
      return;
    }

    // Stamina regen
    const regenMult =
      this.sugarBuffTimer > 0 ? SHOP_ITEMS.sugarTin.staminaRegenMultiplier : 1.0;
    this.stamina = Math.min(
      this.maxStamina,
      this.stamina + PLAYER_CONFIG.staminaRegenPerSec * regenMult * dt
    );

    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboStep = 0;
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;

    this.aimAngle = Math.atan2(input.worldMouseY - this.y, input.worldMouseX - this.x);

    if (this.dodgeTimer > 0) {
      this.dodgeTimer -= dt;
      this.vx = this.dodgeVx;
      this.vy = this.dodgeVy;
      this.animState = 'dodge';
    } else {
      let mx = 0;
      let my = 0;
      if (input.keys.KeyW || input.keys.ArrowUp) my -= 1;
      if (input.keys.KeyS || input.keys.ArrowDown) my += 1;
      if (input.keys.KeyA || input.keys.ArrowLeft) mx -= 1;
      if (input.keys.KeyD || input.keys.ArrowRight) mx += 1;

      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        mx /= len;
        my /= len;
        const moveFactor = this.attackAnimTimer > 0 ? 0.45 : 1.0;
        this.vx = mx * this.speed * moveFactor;
        this.vy = my * this.speed * moveFactor;
        if (this.attackAnimTimer <= 0) {
          this.facingDir = this._angleToFacingDir(Math.atan2(my, mx));
        }
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    }

    this.x = Math.max(24, Math.min(WORLD_CONFIG.width - 24, this.x + this.vx * dt));
    this.y = Math.max(24, Math.min(WORLD_CONFIG.height - 24, this.y + this.vy * dt));

    if (world.isInsideKettle(this.x, this.y) && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + 10 * dt);
    }

    // Select active manifest strip & advance frame
    if (this.dodgeTimer > 0) {
      this.animState = 'dodge';
      const p = 1 - this.dodgeTimer / PLAYER_CONFIG.dodgeDuration;
      this.animFrame = Math.min(3, Math.floor(p * 4));
    } else if (this.hurtTimer > 0.1) {
      this.animState = 'hurt';
      this.animFrame = 0;
    } else if (this.attackAnimTimer > 0) {
      this.animState = `attack${Math.max(1, this.comboStep)}`;
      const p = 1 - this.attackAnimTimer / Math.max(0.01, this.attackAnimDuration);
      this.animFrame = p < 0.25 ? 0 : p < 0.72 ? 1 : 2;
    } else if (Math.hypot(this.vx, this.vy) > 4) {
      this.animState = 'run';
      this.animTimer += dt;
      if (this.animTimer >= 1 / 12) {
        this.animTimer -= 1 / 12;
        this.animFrame = (this.animFrame + 1) % 6;
      }
    } else {
      this.animState = 'idle';
      this.animTimer += dt;
      if (this.animTimer >= 0.25) {
        this.animTimer -= 0.25;
        this.animFrame = (this.animFrame + 1) % 2;
      }
    }
  }

  getPortraitExpression() {
    if (this.ultimateActive) return 'ultimate';
    if (this.hurtTimer > 0 || this.hp / this.maxHp < 0.3) return 'hurt';
    if (this.attackAnimTimer > 0 || this.lungeActive || this.groundBreakActive) {
      return 'determined';
    }
    return 'neutral';
  }

  _getManifestAssetId() {
    if (this.dead || this.animState === 'death') return 'sena_death_side';
    if (this.dodgeTimer > 0 || this.animState === 'dodge') return 'sena_dodge_side';
    const dirKey =
      this.facingDir === 'left' || this.facingDir === 'right' ? 'side' : this.facingDir;
    if (this.lungeActive) return `sena_attack1_${dirKey}`;
    if (this.groundBreakActive) return `sena_attack3_${dirKey}`;
    if (this.animState.startsWith('attack')) return `sena_${this.animState}_${dirKey}`;
    if (this.animState === 'hurt') return `sena_hurt_${dirKey}`;
    if (this.animState === 'run') return `sena_run_${dirKey}`;
    return `sena_idle_${dirKey}`;
  }

  draw(ctx, camera) {
    // 1. Lunge cyan afterimages
    for (const ai of this.afterimages) {
      const aScreen = camera.worldToScreen(ai.x, ai.y);
      const dirKey =
        ai.facingDir === 'left' || ai.facingDir === 'right' ? 'side' : ai.facingDir;
      assets.drawSprite(
        ctx,
        `sena_attack1_${dirKey}`,
        1,
        aScreen.x,
        aScreen.y,
        {
          flipX: ai.facingDir === 'left',
          tintColor: PALETTE.signal,
          scaleX: 0.75,
          scaleY: 0.75,
        }
      );
    }

    const pos = camera.worldToScreen(this.x, this.y);
    const sx = Math.round(pos.x);
    const sy = Math.round(pos.y);

    // 2. Character blob shadow
    assets.drawBlobShadow(ctx, sx, sy, 10, 4);

    // 3. Hybrid animation: generated key frames + code-driven 2px sway/bob & squash
    const assetId = this._getManifestAssetId();
    const flipX = this.facingDir === 'left';
    const swayY =
      this.groundBreakActive && this.groundBreakPhase === 'raise'
        ? -6
        : Math.round(Math.sin(this.swayTimer * 6) * 1);
    const scaleX = this.lungeActive && this.lungePhase === 'crouch' ? 0.84 : 0.75;
    const scaleY = this.lungeActive && this.lungePhase === 'crouch' ? 0.66 : 0.75;

    assets.drawSprite(ctx, assetId, this.animFrame, sx, sy, {
      flipX,
      whiteFlash: this.hitFlashTimer > 0,
      scaleX,
      scaleY,
      offsetY: swayY,
    });
  }

  drawUltimateOverlay(ctx, width, height) {
    if (this.ultimateInvertFrames > 0) {
      this.ultimateInvertFrames -= 1;
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(0, 0, width, height);
      return;
    }

    if (!this.ultimateActive) return;

    // 24px top and bottom letterbox bars
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(0, 0, width, 24);
    ctx.fillRect(0, height - 24, width, 24);
    ctx.fillStyle = PALETTE.signal;
    ctx.fillRect(0, 24, width, 1);
    ctx.fillRect(0, height - 25, width, 1);

    // Anime close-up eye strip (ultimate_cutin 480x120 from manifest) during first 0.35s
    const elapsed = this.ultimateDuration - this.ultimateTimer;
    if (elapsed <= 0.38) {
      const cutInImg = assets.getImage('ultimate_cutin');
      if (cutInImg) {
        ctx.drawImage(cutInImg, 0, 0, 480, 120, 0, 32, 480, 64);
      }
    }
  }
}
