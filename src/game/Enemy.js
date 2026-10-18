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
import { spriteRegistry } from './Sprites.js';
import { sound } from './Audio.js';

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

  initFromConfig(cfg, x, y, scaleMult = 1.0) {
    spriteRegistry.init();
    this.uid = NEXT_ENEMY_UID++;
    this.active = true;
    this.dead = false;
    this.id = cfg.id;
    this.name = cfg.name;
    this.subtitle = cfg.subtitle || '';
    this.tier = cfg.tier || (cfg.arenaCenter ? 'boss' : 'common');
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.vx = 0;
    this.vy = 0;
    this.radius = cfg.radius || 12;

    const mult = this.tier === 'boss' ? 1.0 : scaleMult;
    this.maxHp = Math.round(cfg.hp * mult);
    this.hp = this.maxHp;
    this.damage = Math.max(1, Math.round(cfg.damage * mult));
    this.def = cfg.def !== undefined ? cfg.def : this.tier === 'boss' ? 18 : this.tier === 'elite' ? 8 : 2;
    this.speed = cfg.speed || 80;
    this.xp = cfg.xp || 8;
    this.goldMin = cfg.gold !== undefined ? cfg.gold : cfg.goldMin || 3;
    this.goldMax = cfg.gold !== undefined ? cfg.gold : cfg.goldMax || 6;
    this.flying = !!cfg.flying;

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

    this.phase = 1;
    this.brassRimTimer = 0;
    this.arenaCenter = cfg.arenaCenter ? { ...cfg.arenaCenter } : null;
    this.arenaRadius = cfg.arenaRadius || 380;
    this.guaranteedDrop = cfg.guaranteedDrop || null;
    this.patternIndex = 0;
  }

  applyStun(duration, particles = null) {
    this.statuses.apply('stun', { duration, sourceName: 'Stun' }, this, particles);
    if (this.tier !== 'boss' && this.telegraphActive && this.statuses.cannotAct()) {
      this.telegraphActive = false;
      this.telegraphShape = null;
    }
  }

  takeDamage(amount, hitAngle, knockback, isCrit, player, spawner, particles, camera) {
    if (!this.active || this.hp <= 0) return;

    this.hp = Math.max(0, this.hp - amount);
    this.hitFlashFrames = 2;
    this.squashTimer = 2 / 12;

    if (knockback > 0) {
      const kbPixels = this.tier === 'boss' ? 1 : this.tier === 'elite' ? 2 : 3;
      this.x = Math.round(this.x + Math.cos(hitAngle) * kbPixels);
      this.y = Math.round(this.y + Math.sin(hitAngle) * kbPixels);
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
      particles.spawnBurst(
        this.x,
        this.y,
        isCrit ? 6 : 3,
        isCrit ? PALETTE.brass : PALETTE.bone,
        25,
        80,
        2,
        0.22
      );
      particles.spawnDamageNumber(this.x, this.y - this.radius, amount, isCrit);
    }

    if (this.hp <= 0) {
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

  _onDeath(player, spawner, particles, camera) {
    this.active = false;
    this.dead = true;
    this.telegraphActive = false;

    const baseGold =
      this.goldMin + Math.random() * Math.max(0, this.goldMax - this.goldMin);
    const variance = 0.8 + Math.random() * 0.4;
    const finalGold = Math.max(1, Math.round(baseGold * variance));

    if (player) {
      player.gainXpAndGold(this.xp, finalGold, particles);
      if (player.ultimates) {
        if (typeof player.ultimates.addKillCharge === 'function') {
          player.ultimates.addKillCharge(player, this.tier);
        } else if (typeof player.ultimates.onEnemyKilled === 'function') {
          player.ultimates.onEnemyKilled(player, this.tier);
        }
      }
      // Ines Scrap Orbit: +1 scrap piece when an enemy dies within 200px
      if (player.classId === 'ines' && player.classBehavior) {
        player.classBehavior.onEnemyKilledNearby(this.x, this.y, particles);
      }
    }

    if (particles) {
      const decalColor =
        this.id === 'lyeLeech' || this.id === 'lyeStrider' || this.id === 'motherSump'
          ? '#142927'
          : '#1E1513';
      particles.spawnDecal(this.x, this.y + 4, decalColor, this.tier === 'boss' ? 14 : 6, 20.0);

      if (this.id === 'tinRat') {
        particles.spawnDebris(this.x, this.y, 'canLid', 2);
        particles.spawnDebris(this.x, this.y, 'shardRust', 2);
      } else if (this.id === 'dustDog') {
        particles.spawnDebris(this.x, this.y, 'goggles', 1);
        particles.spawnDebris(this.x, this.y, 'shardBone', 3);
      } else if (this.id === 'wireKite') {
        particles.spawnDebris(this.x, this.y, 'wire', 3);
        particles.spawnDebris(this.x, this.y, 'tarp', 2);
      } else if (this.id === 'lyeLeech' || this.id === 'sumpBat') {
        particles.spawnDebris(this.x, this.y, 'tarp', 3);
        particles.spawnDebris(this.x, this.y, 'wire', 2);
      } else if (this.tier === 'elite') {
        particles.spawnDebris(this.x, this.y, 'canLid', 4);
        particles.spawnDebris(this.x, this.y, 'wire', 4);
        particles.spawnDebris(this.x, this.y, 'shardRust', 5);
        particles.spawnShockwave(this.x, this.y, 44, PALETTE.blood, 0.25);
      } else if (this.tier === 'boss') {
        particles.spawnDebris(this.x, this.y, 'canLid', 8);
        particles.spawnDebris(this.x, this.y, 'goggles', 4);
        particles.spawnDebris(this.x, this.y, 'wire', 8);
        particles.spawnDebris(this.x, this.y, 'shardRust', 8);
        particles.spawnGroundBreakEffect(this.x, this.y, 95);
      }
    }

    if (this.tier === 'elite' && Math.random() < 0.2 && player) {
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
      // Boss kills grant Bounty (+10% XP and +10% gold for 10 minutes)
      player.statuses.apply(
        'bounty',
        { duration: 600.0, sourceName: this.name },
        player,
        particles
      );
      spawner.onBossDefeated(this.id, player, particles);
    }
  }

  _applyCommonContactStatus(player, particles) {
    // Enemy-applied durations stay fixed and do not scale with level; DoT scales with enemy damage stat.
    if (this.id === 'tinRat') {
      if (Math.random() < 0.15) {
        player.statuses.apply(
          'bleed',
          { duration: 4.0, sourceAtk: this.damage, sourceName: 'Tin Rat' },
          player,
          particles
        );
      }
    } else if (this.id === 'dustDog') {
      if (Math.random() < 0.25) {
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
    }
  }

  update(dt, player, spawner, projectiles, particles, camera, world) {
    if (!this.active || this.hp <= 0) return;

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
          this._onDeath(player, spawner, particles, camera);
        }
      }
    });
    if (!this.active || this.hp <= 0) return;

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

    const dxToPlayer = player.x - this.x;
    const dyToPlayer = player.y - this.y;
    const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer) || 1;
    const dirX = dxToPlayer / distToPlayer;
    const dirY = dyToPlayer / distToPlayer;
    this.facingX = dirX >= 0 ? 1 : -1;

    // Sump Bat screech every 6s: Slow 25% for 2s on the player
    if (this.id === 'sumpBat') {
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

    // Tin Rat unique tell: stops and twitches for 0.25s before each lunge
    if (this.id === 'tinRat') {
      if (this.ratTwitchTimer > 0) {
        this.ratTwitchTimer -= dt;
        if (this.ratTwitchTimer <= 0 && !this.statuses.cannotMove()) {
          this.actionActiveTimer = 0.16;
          this.actionVx = dirX * 220;
          this.actionVy = dirY * 220;
        }
        return;
      }
      this.ratLungeCooldown -= dt;
      if (this.ratLungeCooldown <= 0 && distToPlayer < 95) {
        this.ratTwitchTimer = 0.25;
        this.ratLungeCooldown = 2.4;
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

      // Big Axle engine fire applies Burn along its ram path
      if (this.id === 'bigAxle' && distToPlayer <= this.radius + player.radius + 22) {
        player.statuses.apply(
          'burn',
          { duration: 3.0, sourceAtk: this.damage, sourceName: 'Big Axle Exhaust' },
          player,
          particles
        );
      }

      if (distToPlayer <= this.radius + player.radius + 4) {
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

    // 3. Check if Elite or Boss should start a telegraphed special attack
    if (this.tier === 'elite' || this.tier === 'boss') {
      const cdMult =
        this.tier === 'boss'
          ? this.phase === 3
            ? 0.6
            : this.phase === 2
            ? 0.8
            : 1.0
          : 1.0;
      this.specialTimer -= dt;
      if (this.specialTimer <= 0 && distToPlayer < 260) {
        this.specialTimer = this.specialCooldown * cdMult;
        this._beginTelegraph(player);
        return;
      }
    }

    // 4. Constant chase movement (blocked if Pinned)
    if (!this.statuses.cannotMove()) {
      let speedMult = this.statuses.getMoveSpeedMultiplier();
      if (this.id === 'lyeLeech') {
        speedMult *= this.animFrame === 1 ? 1.65 : 0.45;
      } else if (this.tier === 'boss') {
        speedMult *= this.phase === 3 ? 1.3 : this.phase === 2 ? 1.15 : 1.0;
      }

      let sepX = 0;
      let sepY = 0;
      const neighbors = (spawner && typeof spawner.queryRadius === 'function')
        ? spawner.queryRadius(this.x, this.y, this.radius * 2.1)
        : [];
      for (let i = 0; i < neighbors.length; i++) {
        const other = neighbors[i];
        if (other === this || !other.active) continue;
        const ndx = this.x - other.x;
        const ndy = this.y - other.y;
        const nDist = Math.hypot(ndx, ndy) || 0.1;
        const minSep = this.radius + other.radius + 3;
        if (nDist < minSep) {
          const push = ((minSep - nDist) / minSep) * 65;
          sepX += (ndx / nDist) * push;
          sepY += (ndy / nDist) * push;
        }
      }

      const moveSpeed = this.speed * speedMult;
      this.x += (dirX * moveSpeed + sepX) * dt;
      this.y += (dirY * moveSpeed + sepY) * dt;
    }

    if (distToPlayer <= this.radius + player.radius + 2 && this.contactCooldown <= 0) {
      const hit = player.takeDamage(this.damage, this.x, this.y, particles, camera, this, spawner);
      if (hit) {
        this.contactCooldown = 0.85;
        this._applyCommonContactStatus(player, particles);
      }
    }

    this._keepOutOfKettleAndBounds();
  }

  _keepOutOfKettleAndBounds() {
    const cx = WORLD_CONFIG.kettleCenter.x;
    const cy = WORLD_CONFIG.kettleCenter.y;
    const dx = this.x - cx;
    const dy = this.y - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const minKettleDist = WORLD_CONFIG.kettleRadius + this.radius + 10;
    if (dist < minKettleDist) {
      this.x = cx + (dx / dist) * minKettleDist;
      this.y = cy + (dy / dist) * minKettleDist;
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

    const angle = Math.atan2(player.y - this.y, player.x - this.x);

    if (this.tier === 'elite') {
      if (this.specialType === 'charge') {
        const dist = 140;
        this.telegraphShape = {
          type: 'line',
          x1: Math.round(this.x),
          y1: Math.round(this.y),
          x2: Math.round(this.x + Math.cos(angle) * dist),
          y2: Math.round(this.y + Math.sin(angle) * dist),
          width: 22,
          angle,
          color: PALETTE.blood,
        };
      } else if (this.specialType === 'acidSpit') {
        this.telegraphShape = {
          type: 'circle',
          x: Math.round(player.x),
          y: Math.round(player.y),
          radius: 44,
          angle,
          color: PALETTE.lye,
        };
      } else {
        this.telegraphShape = {
          type: 'ring',
          x: Math.round(this.x),
          y: Math.round(this.y),
          radius: 62,
          angle,
          color: PALETTE.blood,
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
      } else if (this.tier === 'elite' && Math.floor(this.animClock * 6) % 2 === 1) {
        spriteCanvas = isRight ? entry.elitePulseRight[fIdx] : entry.elitePulseLeft[fIdx];
      } else {
        spriteCanvas = isRight ? entry.right[fIdx] : entry.left[fIdx];
      }

      if (spriteCanvas) {
        const w = spriteCanvas.width;
        const h = spriteCanvas.height;
        const stunTiltX = isStaggered
          ? Math.floor(this.animClock * 24) % 2 === 0
            ? -2
            : 2
          : isStunned
          ? 2
          : 0;
        const squashDropY = this.squashTimer > 0 ? 2 : 0;
        ctx.drawImage(
          spriteCanvas,
          Math.round(sx - w / 2 + stunTiltX),
          Math.round(sy - h / 2 + flyHeightOffset + squashDropY)
        );
      }
    }

    // Draw pixel-art status visuals on enemy (Bleed drops, Burn flames, Corrode dots, Pinned spike, Marked triangle, Stun points)
    this.statuses.drawEffectsOnEntity(
      ctx,
      sx,
      sy + flyHeightOffset,
      this.radius,
      this.animClock
    );

    // Overhead HP bar + up to 3 prioritized status icons (+N if more)
    const activeStatuses = this.statuses.getUiList();
    if (this.tier !== 'boss' && (this.hp < this.maxHp || this.tier === 'elite' || activeStatuses.length > 0)) {
      const barW = this.tier === 'elite' ? 24 : 16;
      const barH = 2;
      const bx = sx - (barW >> 1);
      const by = sy - this.radius - 6 + flyHeightOffset;
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = PALETTE.blood;
      ctx.fillRect(bx, by, Math.max(1, Math.round((this.hp / this.maxHp) * barW)), barH);

      // Up to 3 small status icons above the health bar
      if (activeStatuses.length > 0) {
        const shown = activeStatuses.slice(0, 3);
        const startX = sx - Math.round((shown.length * 6) / 2);
        const iconY = by - 6;
        for (let i = 0; i < shown.length; i++) {
          const st = shown[i];
          const ix = startX + i * 6;
          ctx.fillStyle = PALETTE.soot;
          ctx.fillRect(ix - 1, iconY - 1, 6, 6);
          ctx.fillStyle = st.color;
          ctx.fillRect(ix, iconY, 4, 4);
        }
        if (activeStatuses.length > 3) {
          ctx.fillStyle = PALETTE.bone;
          ctx.font = 'bold 5px ui-monospace, monospace';
          ctx.fillText(`+${activeStatuses.length - 3}`, startX + shown.length * 6 + 3, iconY + 4);
        }
      }
    }
  }
}

export default Enemy;
