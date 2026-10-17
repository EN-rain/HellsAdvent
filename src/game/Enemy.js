/**
 * GRAVEL SKY — Enemies (Common, Elite, and 3-Phase Bosses)
 * - Every enemy and boss sprite is loaded from /public/assets/manifest.json:
 *   - Commons (40x40, 5 frames: move 0..1, attack 2, hurt 3, dead 4):
 *     tin_rat, dust_dog, wire_kite, lye_leech, sump_bat
 *   - Elites (80x80, 7 frames: move 0..1, tell 2, attack 3..4, hurt 5, dead 6):
 *     cleaver_hauler, lye_strider, flats_harvester
 *   - Bosses (9 frames: idle 0..1, attack A 2..3, attack B 4..5, phase-change 6, dead 7..8):
 *     the_foreman (192x192), big_axle (224x160), mother_sump (192x192), the_long_dry (256x192)
 * - Elites and Bosses get a code-drawn 1px blood-red or brass outline on the processed alpha mask.
 * - Hit flash uses an alpha-masked white copy of the sprite.
 * - Seven Cuts kills split the sprite along the slash line and slide the halves apart.
 */

import {
  PALETTE,
  ENEMIES_CONFIG,
  ELITE_MODIFIERS,
  WORLD_CONFIG,
  SHOP_ITEMS,
} from '../data/config.js';
import { assets } from './AssetLoader.js';
import { sound } from './Audio.js';

let NEXT_ENEMY_UID = 1;

const ASSET_ID_MAP = {
  tinRat: 'tin_rat',
  tin_rat: 'tin_rat',
  dustDog: 'dust_dog',
  dust_dog: 'dust_dog',
  wireKite: 'wire_kite',
  wire_kite: 'wire_kite',
  lyeLeech: 'lye_leech',
  lye_leech: 'lye_leech',
  sumpBat: 'sump_bat',
  sump_bat: 'sump_bat',
  cleaverHauler: 'cleaver_hauler',
  cleaver_hauler: 'cleaver_hauler',
  lyeStrider: 'lye_strider',
  lye_strider: 'lye_strider',
  flatsHarvester: 'flats_harvester',
  flats_harvester: 'flats_harvester',
  theForeman: 'the_foreman',
  the_foreman: 'the_foreman',
  bigAxle: 'big_axle',
  big_axle: 'big_axle',
  motherSump: 'mother_sump',
  mother_sump: 'mother_sump',
  theLongDry: 'the_long_dry',
  the_long_dry: 'the_long_dry',
};

export class Enemy {
  constructor(typeId = null, x = 0, y = 0, options = {}) {
    this.uid = NEXT_ENEMY_UID++;
    this.active = false;
    this.tier = 'common';
    this.typeId = typeId || 'tinRat';
    this.isBoss = false;
    this.isElite = false;
    this.name = 'Tin Rat';
    this.subtitle = '';
    this.behavior = 'melee';
    this.maxHp = 24;
    this.hp = 24;
    this.atk = 5;
    this.def = 0;
    this.speed = 36;
    this.radius = 10;
    this.xpReward = 8;
    this.goldMin = 3;
    this.goldMax = 6;
    this.assetId = 'tin_rat';
    this.drawScale = 0.65;
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.homeX = Math.round(x);
    this.homeY = Math.round(y);
    this.arenaRadius = 180;
    this.vx = 0;
    this.vy = 0;
    this.knockVx = 0;
    this.knockVy = 0;
    this.facingLeft = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.hitFlashTimer = 0;
    this.stunTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.killedBySevenCuts = false;
    this.attackCooldown = 0.8;
    this.phase = 1;
    this.phaseTransitionFlash = 0;
    this.telegraphs = [];
    this.dashTimer = 0;
    this.dashVx = 0;
    this.dashVy = 0;

    if (typeId) {
      const cfg =
        ENEMIES_CONFIG.bosses[typeId] ||
        ENEMIES_CONFIG.elites?.[typeId] ||
        ENEMIES_CONFIG.commons[typeId];
      if (cfg) {
        this.initFromConfig(cfg, x, y, 1.0, options);
      }
    }
  }

  initFromConfig(cfg, x, y, scaleMult = 1.0, options = {}) {
    this.uid = NEXT_ENEMY_UID++;
    this.active = true;
    this.typeId = cfg.id;
    this.tier = cfg.tier || (options.isBoss ? 'boss' : options.isElite ? 'elite' : 'common');
    this.isBoss = this.tier === 'boss' || !!options.isBoss || !!ENEMIES_CONFIG.bosses[cfg.id];
    this.isElite = this.tier === 'elite' || !!options.isElite || !!ENEMIES_CONFIG.elites?.[cfg.id];
    if (this.isBoss) this.tier = 'boss';
    else if (this.isElite) this.tier = 'elite';

    this.name = cfg.name;
    this.subtitle = cfg.subtitle || '';
    this.behavior = cfg.behavior || 'melee';

    const baseHp = cfg.hp || 24;
    const baseAtk = cfg.damage || cfg.atk || 6;
    this.maxHp = Math.round(baseHp * scaleMult);
    this.hp = this.maxHp;
    this.atk = Math.round(baseAtk * scaleMult);
    this.def = cfg.def || 0;
    this.speed = (cfg.speed || 84) * 0.42;
    this.radius = Math.round(
      (cfg.radius || 12) * (this.isBoss ? 0.65 : this.isElite ? 0.72 : 0.65)
    );
    this.xpReward = cfg.xp || 8;
    this.goldMin = cfg.goldMin ?? cfg.gold ?? 4;
    this.goldMax = cfg.goldMax ?? cfg.gold ?? 8;

    this.assetId = ASSET_ID_MAP[cfg.id] || 'tin_rat';
    this.drawScale = this.isBoss ? 0.42 : this.isElite ? 0.55 : 0.65;

    this.x = Math.round(x);
    this.y = Math.round(y);
    this.homeX = Math.round(x);
    this.homeY = Math.round(y);
    this.arenaRadius = cfg.arenaRadius ? Math.round(cfg.arenaRadius * 0.55) : 180;

    this.vx = 0;
    this.vy = 0;
    this.knockVx = 0;
    this.knockVy = 0;
    this.facingLeft = false;

    this.animFrame = 0;
    this.animTimer = 0;
    this.hitFlashTimer = 0;
    this.stunTimer = 0;
    this.dead = false;
    this.deathTimer = 0;
    this.killedBySevenCuts = false;
    this._hasShownCard = false;

    this.attackCooldown = 0.8 + Math.random() * 0.6;
    this.phase = 1;
    this.phaseTransitionFlash = 0;
    this.telegraphs = [];
    this.dashTimer = 0;
    this.dashVx = 0;
    this.dashVy = 0;
  }

  applyStun(duration) {
    if (this.dead) return;
    const actual = this.isBoss ? duration * 0.45 : duration;
    this.stunTimer = Math.max(this.stunTimer, actual);
  }

  takeDamage(rawDamage, knockAngle, knockForce, isCrit, player, particles, camera, spawner) {
    if (this.dead) return;

    const dmg = Math.max(1, Math.round(rawDamage - this.def));
    this.hp = Math.max(0, this.hp - dmg);
    this.hitFlashTimer = 2 / 24;

    const kbResist = this.isBoss ? 0.15 : this.isElite ? 0.45 : 1.0;
    this.knockVx = Math.cos(knockAngle) * knockForce * 0.45 * kbResist;
    this.knockVy = Math.sin(knockAngle) * knockForce * 0.45 * kbResist;

    if (particles) {
      particles.spawnHitSparks(this.x, this.y - 6, knockAngle, isCrit);
      particles.spawnDamageNumber(this.x, this.y - this.radius, dmg, isCrit);
    }

    if (this.isBoss && this.hp > 0) {
      const ratio = this.hp / this.maxHp;
      if (this.phase === 1 && ratio <= 0.6) {
        this.phase = 2;
        this._triggerBossPhaseShift(particles, camera);
      } else if (this.phase === 2 && ratio <= 0.3) {
        this.phase = 3;
        this._triggerBossPhaseShift(particles, camera);
      }
    }

    if (this.hp <= 0) {
      this._die(player, particles, camera, spawner);
    }
  }

  _triggerBossPhaseShift(particles, camera) {
    this.phaseTransitionFlash = 0.6;
    sound.playBossPhase();
    if (camera) camera.addShake(5);
    if (particles) {
      particles.spawnRing(this.x, this.y, this.radius + 36, PALETTE.blood, 0.45);
      particles.spawnDamageNumber(
        this.x,
        this.y - this.radius - 12,
        `PHASE ${this.phase}`,
        true,
        PALETTE.blood
      );
    }
  }

  _die(player, particles, camera, spawner) {
    this.dead = true;
    this.deathTimer = 0.65;
    this.telegraphs = [];

    sound.playEnemyDeath(this.isBoss);
    if (camera && (this.isBoss || this.isElite)) {
      camera.addShake(this.isBoss ? 7 : 3);
    }

    if (particles) {
      particles.spawnDebrisBurst(this.x, this.y, [], this.isBoss || this.isElite);
    }

    if (player) {
      player.gainXp(this.xpReward, particles);
      const gold =
        this.goldMin + Math.floor(Math.random() * (this.goldMax - this.goldMin + 1));
      player.gainGold(gold, particles);
      player.addUltimateCharge(
        this.isBoss ? 50 : this.isElite ? 22 : SKILLS_CONFIG_KILL_CHARGE
      );

      if (this.isBoss && spawner) {
        spawner.markBossDefeated(this.typeId, this.name, particles);
        const cfg = ENEMIES_CONFIG.bosses[this.typeId];
        if (cfg && cfg.relicDropId && SHOP_ITEMS[cfg.relicDropId]) {
          const relic = SHOP_ITEMS[cfg.relicDropId];
          if (
            player.equipped[relic.slot] !== relic.id &&
            !player.ownedEquipment.includes(relic.id)
          ) {
            player.ownedEquipment.push(relic.id);
            particles.spawnDamageNumber(
              this.x,
              this.y - 22,
              `RELIC: ${relic.name}`,
              true,
              PALETTE.brass
            );
          }
        }
      }
    }
  }

  update(dt, player, projectiles, particles, camera, spawner, world) {
    if (this.hitFlashTimer > 0) this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    if (this.phaseTransitionFlash > 0) {
      this.phaseTransitionFlash = Math.max(0, this.phaseTransitionFlash - dt);
    }

    if (this.dead) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.active = false;
      }
      return;
    }

    this.x += this.knockVx * dt;
    this.y += this.knockVy * dt;
    this.knockVx *= 0.82;
    this.knockVy *= 0.82;

    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const tel = this.telegraphs[i];
      tel.timer -= dt;
      if (tel.timer <= 0) {
        if (!tel.detonated) {
          tel.detonated = true;
          tel.impactHold = 2 / 24;
          this._detonateTelegraph(tel, player, projectiles, particles, camera, spawner);
        } else {
          tel.impactHold -= dt;
          if (tel.impactHold <= 0) {
            this.telegraphs.splice(i, 1);
          }
        }
      }
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }

    if (player.dead) return;

    this.animTimer += dt;
    if (this.animTimer >= 1 / 8) {
      this.animTimer -= 1 / 8;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angleToPlayer = Math.atan2(dy, dx);
    this.facingLeft = dx < 0;

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      this.x += this.dashVx * dt;
      this.y += this.dashVy * dt;
      if (dist <= this.radius + player.radius + 4) {
        player.takeDamage(Math.round(this.atk * 1.25), this.x, this.y, particles, camera);
      }
      return;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    if (this.isBoss) {
      this._updateBossAI(dt, dist, angleToPlayer, player, projectiles, particles, camera);
    } else {
      this._updateStandardAI(dt, dist, angleToPlayer, player, projectiles, particles, camera);
    }

    if (!this.isBoss && world.isInsideKettle(this.x, this.y)) {
      const kdx = this.x - WORLD_CONFIG.kettleCenter.x;
      const kdy = this.y - WORLD_CONFIG.kettleCenter.y;
      const kd = Math.hypot(kdx, kdy) || 1;
      const safeR = WORLD_CONFIG.kettleSafeRadius + 16;
      this.x = Math.round(WORLD_CONFIG.kettleCenter.x + (kdx / kd) * safeR);
      this.y = Math.round(WORLD_CONFIG.kettleCenter.y + (kdy / kd) * safeR);
    }

    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  }

  _updateStandardAI(dt, dist, angleToPlayer, player, projectiles, particles, camera) {
    if (this.isElite && this.attackCooldown <= 0 && dist < 110 && this.telegraphs.length === 0) {
      this.attackCooldown = 2.8;
      this.telegraphs.push({
        kind: 'circle',
        x: Math.round(player.x),
        y: Math.round(player.y),
        radius: 28,
        maxTimer: ELITE_MODIFIERS.warningDuration,
        timer: ELITE_MODIFIERS.warningDuration,
        damage: Math.round(this.atk * 1.35),
      });
    }

    if (this.behavior === 'ranged_kite') {
      if (dist > 95) {
        this.x += Math.cos(angleToPlayer) * this.speed * dt;
        this.y += Math.sin(angleToPlayer) * this.speed * dt;
      } else if (dist < 55) {
        this.x -= Math.cos(angleToPlayer) * this.speed * 0.7 * dt;
        this.y -= Math.sin(angleToPlayer) * this.speed * 0.7 * dt;
      }
      if (this.attackCooldown <= 0 && dist < 140) {
        this.attackCooldown = 1.9;
        projectiles.spawn({
          owner: 'enemy',
          kind: 'spark_dart',
          x: this.x,
          y: this.y,
          angle: angleToPlayer,
          speed: 120,
          radius: 4,
          damage: this.atk,
          maxLife: 1.5,
        });
      }
    } else if (this.behavior === 'acid_spit') {
      if (dist > 80) {
        this.x += Math.cos(angleToPlayer) * this.speed * dt;
        this.y += Math.sin(angleToPlayer) * this.speed * dt;
      }
      if (this.attackCooldown <= 0 && dist < 120) {
        this.attackCooldown = 2.1;
        projectiles.spawn({
          owner: 'enemy',
          kind: 'acid',
          x: this.x,
          y: this.y,
          angle: angleToPlayer,
          speed: 95,
          radius: 4,
          damage: this.atk,
          maxLife: 1.5,
        });
      }
    } else if (this.behavior === 'pack_lunge' || this.behavior === 'swoop_dash') {
      this.x += Math.cos(angleToPlayer) * this.speed * dt;
      this.y += Math.sin(angleToPlayer) * this.speed * dt;
      if (this.attackCooldown <= 0 && dist < 72 && dist > 20) {
        this.attackCooldown = 1.8;
        this.dashTimer = 0.2;
        this.dashVx = Math.cos(angleToPlayer) * this.speed * 2.3;
        this.dashVy = Math.sin(angleToPlayer) * this.speed * 2.3;
      }
    } else {
      this.x += Math.cos(angleToPlayer) * this.speed * dt;
      this.y += Math.sin(angleToPlayer) * this.speed * dt;
    }

    if (dist <= this.radius + player.radius + 3 && this.attackCooldown <= 0) {
      this.attackCooldown = 1.05;
      player.takeDamage(this.atk, this.x, this.y, particles, camera);
    }
  }

  _updateBossAI(dt, dist, angleToPlayer, player, _projectiles, particles, camera) {
    const speedMult = this.phase === 3 ? 1.35 : this.phase === 2 ? 1.15 : 1.0;
    if (dist > this.radius + 14) {
      this.x += Math.cos(angleToPlayer) * this.speed * speedMult * dt;
      this.y += Math.sin(angleToPlayer) * this.speed * speedMult * dt;
    }

    const fromHome = Math.hypot(this.x - this.homeX, this.y - this.homeY);
    if (fromHome > this.arenaRadius - 16) {
      const backAngle = Math.atan2(this.homeY - this.y, this.homeX - this.x);
      this.x += Math.cos(backAngle) * 50 * dt;
      this.y += Math.sin(backAngle) * 50 * dt;
    }

    if (dist <= this.radius + player.radius + 4) {
      player.takeDamage(this.atk, this.x, this.y, particles, camera);
    }

    if (this.attackCooldown > 0) return;

    const cdBase = this.phase === 3 ? 1.45 : this.phase === 2 ? 1.95 : 2.4;
    this.attackCooldown = cdBase;

    const ringCount = this.phase === 3 ? 3 : this.phase === 2 ? 2 : 1;
    for (let i = 0; i < ringCount; i++) {
      const offsetAngle = (i * Math.PI * 2) / ringCount;
      const offsetDist = i === 0 ? 0 : 32;
      this.telegraphs.push({
        kind: 'circle',
        x: Math.round(player.x + Math.cos(offsetAngle) * offsetDist),
        y: Math.round(player.y + Math.sin(offsetAngle) * offsetDist),
        radius: 32,
        maxTimer: 0.8,
        timer: 0.8,
        damage: Math.round(this.atk * 1.35),
      });
    }
  }

  _detonateTelegraph(tel, player, _projectiles, particles, camera, _spawner) {
    if (particles) {
      particles.spawnGroundBreakCracks(tel.x, tel.y, tel.radius);
    }
    if (camera) camera.addShake(3);
    sound.playGroundBreak();
    const d = Math.hypot(player.x - tel.x, player.y - tel.y);
    if (d <= tel.radius + player.radius) {
      player.takeDamage(tel.damage, tel.x, tel.y, particles, camera);
    }
  }

  drawTelegraphs(ctx, camera) {
    for (const tel of this.telegraphs) {
      const pos = camera.worldToScreen(tel.x, tel.y);
      const sx = Math.round(pos.x);
      const sy = Math.round(pos.y);
      const r = Math.round(tel.radius);

      ctx.strokeStyle = tel.detonated ? PALETTE.bone : PALETTE.blood;
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - r, sy - Math.round(r * 0.65), r * 2, Math.round(r * 1.3));
      ctx.beginPath();
      ctx.moveTo(sx - 4, sy);
      ctx.lineTo(sx + 4, sy);
      ctx.moveTo(sx, sy - 4);
      ctx.lineTo(sx, sy + 4);
      ctx.stroke();
    }
  }

  _getCurrentFrameIndex() {
    if (this.isBoss) {
      // 9 frames: idle 0..1, attack A 2..3, attack B 4..5, phase-change 6, dead 7..8
      if (this.dead) return this.deathTimer < 0.32 ? 8 : 7;
      if (this.phaseTransitionFlash > 0) return 6;
      if (this.telegraphs.length > 0) return 2 + (this.animFrame % 2);
      if (this.dashTimer > 0) return 4 + (this.animFrame % 2);
      return this.animFrame % 2;
    }
    if (this.isElite) {
      // 7 frames: move 0..1, tell 2, attack 3..4, hurt 5, dead 6
      if (this.dead) return 6;
      if (this.hitFlashTimer > 0) return 5;
      if (this.telegraphs.length > 0) return 2;
      if (this.dashTimer > 0 || this.attackCooldown > 2.4) return 3 + (this.animFrame % 2);
      return this.animFrame % 2;
    }
    // Commons: 5 frames: move 0..1, attack 2, hurt 3, dead 4
    if (this.dead) return 4;
    if (this.hitFlashTimer > 0) return 3;
    if (this.dashTimer > 0 || this.attackCooldown > 0.85) return 2;
    return this.animFrame % 2;
  }

  draw(ctx, camera) {
    if (!camera.isVisible(this.x, this.y, this.radius + 80)) return;
    const pos = camera.worldToScreen(this.x, this.y);
    const sx = Math.round(pos.x);
    const sy = Math.round(pos.y);

    // 1. Blob shadow under enemy
    assets.drawBlobShadow(ctx, sx, sy, Math.max(6, this.radius), Math.max(3, this.radius * 0.4));

    const frameIdx = this._getCurrentFrameIndex();

    // 2. If killed by Seven Cuts, draw split-apart halves sliding along the slash line!
    if (this.dead && this.killedBySevenCuts) {
      const slide = Math.round((0.65 - this.deathTimer) * 24);
      assets.drawSplitSprite(ctx, this.assetId, frameIdx, sx, sy, this.facingLeft, slide);
      return;
    }

    // 3. Code-drawn 1px blood-red or brass outline on the processed alpha mask for Elites & Bosses
    const outlineColor =
      this.stunTimer > 0
        ? PALETTE.signal
        : this.isBoss
        ? PALETTE.brass
        : this.isElite
        ? PALETTE.blood
        : null;

    assets.drawSprite(ctx, this.assetId, frameIdx, sx, sy, {
      flipX: this.facingLeft,
      whiteFlash: this.hitFlashTimer > 0,
      outlineColor,
      scaleX: this.drawScale,
      scaleY: this.drawScale,
    });

    // 4. Compact integer HP bar above damaged non-boss enemies
    if (!this.isBoss && !this.dead && this.hp < this.maxHp) {
      const barW = this.isElite ? 24 : 16;
      const bx = sx - (barW >> 1);
      const by = sy - this.radius - 12;
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(bx - 1, by - 1, barW + 2, 4);
      const fillW = Math.max(1, Math.round((this.hp / this.maxHp) * barW));
      ctx.fillStyle = this.isElite ? PALETTE.brass : PALETTE.blood;
      ctx.fillRect(bx, by, fillW, 2);
    }
  }
}

const SKILLS_CONFIG_KILL_CHARGE = 10;
