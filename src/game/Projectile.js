/**
 * GRAVEL SKY — Object-Pooled Projectiles (Rail Spike, Rook Bolts, Ines Scrap, & Enemy Projectiles)
 * - Uses 8 pre-rendered angle frames (zero ctx.rotate()).
 * - Supports ordered Damage Pipeline, Rook Distance Bonus, Ines Ricochet & Shrapnel,
 *   missed scrap ground drops, Magnet Belt / Spin Up projectile blocking, and Lye Strider Corrode puddles.
 */

import { PALETTE } from '../data/config.js';
import { computeDamagePipeline } from './Status.js';
import { angleTo8Dir, drawBresenhamCircle } from './PixelArt.js';
import { spriteRegistry } from './Sprites.js';
import { sound } from './Audio.js';

export class ProjectilePool {
  constructor(maxProjectiles = 96) {
    this.pool = Array.from({ length: maxProjectiles }, () => ({
      active: false,
      stuckInGround: false,
      stuckTimer: 0,
      x: 0,
      y: 0,
      originX: 0,
      originY: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      dir8: 0,
      speed: 400,
      distanceTraveled: 0,
      maxRange: 420,
      radius: 8,
      damage: 20,
      atkBuffPct: 0,
      knockback: 95,
      isPlayer: true,
      pierceRemaining: 1,
      hitIds: new Set(),
      type: 'railSpike',
      scrapVariant: 0,
      color: PALETTE.signal,
      trailTimer: 0,
      useRookDistanceBonus: false,
      ricochet: false,
      shrapnel: false,
      onHitStatus: null,
      enemyStatusOnHit: null,
    }));

    // Lye Strider acid puddles on ground (3s duration, applies 1 Corrode stack/s)
    this.acidPuddles = [];
  }

  clear() {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      p.active = false;
      p.stuckInGround = false;
      p.stuckTimer = 0;
      if (p.hitIds && typeof p.hitIds.clear === 'function') {
        p.hitIds.clear();
      }
    }
    this.acidPuddles = [];
  }

  spawn({
    x,
    y,
    angle,
    speed = 620,
    maxRange = 420,
    radius = 8,
    damage = 25,
    atkBuffPct = 0,
    knockback = 95,
    isPlayer = true,
    pierce = 2,
    type = 'railSpike',
    scrapVariant = 0,
    color = PALETTE.signal,
    useRookDistanceBonus = false,
    ricochet = false,
    shrapnel = false,
    onHitStatus = null,
    enemyStatusOnHit = null,
  }) {
    for (let i = 0; i < this.pool.length; i++) {
      const proj = this.pool[i];
      if (!proj.active) {
        proj.active = true;
        proj.stuckInGround = false;
        proj.stuckTimer = 0;
        proj.x = x;
        proj.y = y;
        proj.originX = x;
        proj.originY = y;
        proj.angle = angle;
        proj.dir8 = angleTo8Dir(angle);
        proj.speed = speed;
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
        proj.distanceTraveled = 0;
        proj.maxRange = maxRange;
        proj.radius = radius;
        proj.damage = damage;
        proj.atkBuffPct = atkBuffPct;
        proj.knockback = knockback;
        proj.isPlayer = isPlayer;
        proj.pierceRemaining = pierce;
        proj.hitIds.clear();
        proj.type = type;
        proj.scrapVariant = scrapVariant || 0;
        proj.color = color;
        proj.trailTimer = 0;
        proj.useRookDistanceBonus = !!useRookDistanceBonus;
        proj.ricochet = !!ricochet;
        proj.shrapnel = !!shrapnel;
        proj.onHitStatus = onHitStatus || null;
        proj.enemyStatusOnHit = enemyStatusOnHit || null;
        return proj;
      }
    }
    return null;
  }

  spawnAcidPuddle(x, y, radius = 26, duration = 3.0) {
    if (this.acidPuddles.length >= 16) this.acidPuddles.shift();
    this.acidPuddles.push({
      x: Math.round(x),
      y: Math.round(y),
      radius,
      life: duration,
      tickTimer: 0,
    });
  }

  _finishProjectile(proj, player, particles) {
    if (proj.type === 'railSpike') {
      proj.stuckInGround = true;
      proj.stuckTimer = 1.0;
      particles.spawnParticle({
        kind: 'ring',
        x: proj.x,
        y: proj.y,
        color: PALETTE.bone,
        color2: PALETTE.signal,
        ringMaxRadius: 12,
        life: 1 / 24,
      });
    } else if (proj.type === 'inesScrap') {
      // Thrown scrap pieces that miss stay on the ground for 4s and can be pulled back
      if (proj.hitIds.size === 0 && player.classId === 'ines' && player.classBehavior) {
        player.classBehavior.spawnGroundScrap(proj.x, proj.y, proj.scrapVariant);
      }
      proj.active = false;
    } else {
      if (proj.enemyStatusOnHit === 'acidSpit') {
        this.spawnAcidPuddle(proj.x, proj.y, 26, 3.0);
      }
      proj.active = false;
    }
  }

  update(dt, arg1, arg2, arg3, arg4, arg5, arg6) {
    let player = arg1;
    let spawner = arg2;
    let particles = arg3;
    let camera = arg4;
    let onHitStop = null;
    let timeStopped = false;

    // Detect if called as (dt, world, player, spawner, particles, camera, timeStopped)
    if (arg1 && arg1.chunkTiles !== undefined) {
      player = arg2;
      spawner = arg3;
      particles = arg4;
      camera = arg5;
      timeStopped = !!arg6;
    } else {
      onHitStop = arg5;
      timeStopped = !!arg6 || !!(player && player.isTimeStopped && player.isTimeStopped());
    }

    if (!timeStopped) {
      // Update Lye Strider acid puddles (1 Corrode stack/s on player)
      for (let i = this.acidPuddles.length - 1; i >= 0; i--) {
        const p = this.acidPuddles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.acidPuddles.splice(i, 1);
          continue;
        }
        p.tickTimer += dt;
        if (p.tickTimer >= 1.0) {
          p.tickTimer = 0;
          if (player && !player.dead && Math.hypot(player.x - p.x, player.y - p.y) <= p.radius + player.radius) {
            player.statuses.apply(
              'corrode',
              { duration: 8.0, sourceName: 'Lye Strider Puddle' },
              player,
              particles
            );
          }
        }
      }
    }

    const getCandidates = (x, y, r) => {
      if (spawner && typeof spawner.queryRadius === 'function') {
        return spawner.queryRadius(x, y, r);
      }
      const list = Array.isArray(spawner)
        ? spawner
        : (spawner && Array.isArray(spawner.enemies)
          ? spawner.enemies
          : (spawner && Array.isArray(spawner.pool) ? spawner.pool : []));
      const rSq = r * r;
      return list.filter((e) => {
        if (!e.active || e.hp <= 0) return false;
        const dx = e.x - x;
        const dy = e.y - y;
        return dx * dx + dy * dy <= rSq;
      });
    };

    for (let i = 0; i < this.pool.length; i++) {
      const proj = this.pool[i];
      if (!proj.active) continue;

      // During time-stop, freeze all regular projectiles; only ultimate projectiles travel
      if (timeStopped && !proj.isUltimateProjectile) continue;

      if (proj.stuckInGround) {
        proj.stuckTimer -= dt;
        if (proj.stuckTimer <= 0) {
          proj.active = false;
        }
        continue;
      }

      const stepDist = proj.speed * dt;
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.distanceTraveled += stepDist;

      // Trail square pixels
      proj.trailTimer += dt;
      if (proj.trailTimer >= 1 / 48) {
        proj.trailTimer = 0;
        particles.spawnParticle({
          kind: 'pixel',
          x: Math.round(proj.x),
          y: Math.round(proj.y),
          vx: 0,
          vy: 0,
          size: 2,
          color: proj.type === 'inesScrap' ? PALETTE.verdigris : PALETTE.bone,
          color2: proj.type === 'rookBolt' ? PALETTE.brass : PALETTE.rust,
          life: 0.14,
        });
      }

      if (proj.isPlayer) {
        const candidates = getCandidates(proj.x, proj.y, proj.radius + 36);
        for (let j = 0; j < candidates.length; j++) {
          const enemy = candidates[j];
          if (!enemy.active || enemy.hp <= 0 || proj.hitIds.has(enemy.uid)) continue;

          const dx = enemy.x - proj.x;
          const dy = enemy.y - proj.y;
          const hitRad = proj.radius + enemy.radius;

          if (dx * dx + dy * dy <= hitRad * hitRad) {
            proj.hitIds.add(enemy.uid);
            const isCrit = Math.random() < player.critChance;

            let distBonusPct = 0;
            if (proj.useRookDistanceBonus && player.classId === 'rook' && player.classBehavior) {
              const shotDist = Math.hypot(enemy.x - proj.originX, enemy.y - proj.originY);
              distBonusPct = player.classBehavior.getDistanceBonusPct(shotDist);
            }

            const pipe = computeDamagePipeline({
              baseDamage: proj.damage,
              atkBuffPct: proj.atkBuffPct || player.statuses.getAtkBonusPct(),
              isCrit,
              critMult: player.critMult,
              distanceBonusPct: distBonusPct,
              targetStatuses: enemy.statuses,
              targetBaseDef: enemy.def || 0,
              sourceName:
                proj.type === 'rookBolt'
                  ? 'Springgun Bolt'
                  : proj.type === 'inesScrap'
                  ? 'Scrap Throw'
                  : 'Rail Spike',
              targetName: enemy.name,
            });

            const prevHp = enemy.hp;
            enemy.takeDamage(
              pipe.finalDamage,
              proj.angle,
              proj.knockback,
              isCrit,
              player,
              spawner,
              particles,
              camera
            );

            if (proj.onHitStatus && enemy.active) {
              enemy.statuses.apply(proj.onHitStatus.id, proj.onHitStatus, enemy, particles);
            }

            if (player.classId === 'sena' && player.classBehavior) {
              player.classBehavior.onLandHit(enemy, prevHp > 0 && enemy.hp <= 0, particles);
            }

            // Shrapnel (Wrecker Master): every thrown piece splits into 3 shards on hit (30% ATK each)
            if (proj.shrapnel) {
              proj.shrapnel = false;
              for (const off of [-0.55, 0, 0.55]) {
                this.spawn({
                  x: enemy.x,
                  y: enemy.y,
                  angle: proj.angle + off,
                  speed: 520,
                  maxRange: 140,
                  radius: 5,
                  damage: player.baseAtkForPipeline * 0.30,
                  atkBuffPct: proj.atkBuffPct,
                  isPlayer: true,
                  pierce: 1,
                  type: 'inesShard',
                  color: PALETTE.verdigris,
                });
              }
            }

            // Ricochet (Slinger Journeyman): bounce to 1 extra nearby enemy for 60% damage
            if (proj.ricochet) {
              proj.ricochet = false;
              const nearby = getCandidates(enemy.x, enemy.y, 160);
              for (const nextE of nearby) {
                if (nextE.active && nextE.hp > 0 && !proj.hitIds.has(nextE.uid)) {
                  const bounceAng = Math.atan2(nextE.y - proj.y, nextE.x - proj.x);
                  proj.angle = bounceAng;
                  proj.dir8 = angleTo8Dir(bounceAng);
                  proj.vx = Math.cos(bounceAng) * proj.speed;
                  proj.vy = Math.sin(bounceAng) * proj.speed;
                  proj.damage *= 0.60;
                  proj.pierceRemaining += 1;
                  break;
                }
              }
            }

            // Explosive Bolt (Rapid Fire node): detonate in an AOE blast on hit
            if (proj.explosiveRadius && proj.explosiveRadius > 0) {
              const expRad = proj.explosiveRadius;
              proj.explosiveRadius = 0;
              if (particles && typeof particles.spawnDustPuff === 'function') {
                particles.spawnDustPuff(enemy.x, enemy.y, 4, 0, 0);
              }
              const blastCandidates = getCandidates(enemy.x, enemy.y, expRad);
              for (const be of blastCandidates) {
                if (!be.active || be.hp <= 0 || be.uid === enemy.uid) continue;
                const bPipe = computeDamagePipeline({
                  baseDamage: player.baseAtkForPipeline * (proj.explosiveDamageMult || 0.6),
                  atkBuffPct: proj.atkBuffPct || player.statuses.getAtkBonusPct(),
                  isCrit: false,
                  critMult: 1.0,
                  targetStatuses: be.statuses,
                  targetBaseDef: be.def || 0,
                  sourceName: 'Explosive Bolt',
                  targetName: be.name,
                });
                be.takeDamage(bPipe.finalDamage, Math.atan2(be.y - enemy.y, be.x - enemy.x), 60, false, player, spawner, particles, camera);
              }
            }

            player.addUltimateCharge(4.0);
            sound.playHit(isCrit);
            if (onHitStop) onHitStop(0.04);

            // Spark on pierce
            const perpAng = proj.angle + (Math.random() > 0.5 ? 1.2 : -1.2);
            particles.spawnParticle({
              kind: 'pixel',
              x: proj.x,
              y: proj.y,
              vx: Math.cos(perpAng) * 95,
              vy: Math.sin(perpAng) * 95,
              size: 2,
              color: PALETTE.brass,
              color2: PALETTE.rust,
              life: 0.22,
            });

            proj.pierceRemaining -= 1;
            if (proj.pierceRemaining <= 0) {
              this._finishProjectile(proj, player, particles);
              break;
            }
          }
        }
      } else {
        // Enemy projectile
        const dx = player.x - proj.x;
        const dy = player.y - proj.y;

        // Check Ines Spin Up or Magnet Belt projectile interception
        if (
          player.classId === 'ines' &&
          player.classBehavior &&
          Math.hypot(dx, dy) <= 44
        ) {
          if (player.classBehavior.tryBlockProjectileWithMagnet(proj, particles)) {
            proj.active = false;
            continue;
          }
        }

        const hitRad = proj.radius + player.radius;
        if (dx * dx + dy * dy <= hitRad * hitRad) {
          const didHit = player.takeDamage(proj.damage, proj.x, proj.y, particles, camera);
          if (didHit) {
            if (proj.enemyStatusOnHit === 'acidSpit') {
              player.statuses.apply(
                'corrode',
                { duration: 8.0, sourceName: 'Lye Strider' },
                player,
                particles
              );
              player.statuses.apply(
                'corrode',
                { duration: 8.0, sourceName: 'Lye Strider' },
                player,
                particles
              );
              this.spawnAcidPuddle(proj.x, proj.y, 26, 3.0);
            }
            proj.active = false;
            continue;
          }
        }
      }

      if (proj.active && !proj.stuckInGround && proj.distanceTraveled >= proj.maxRange) {
        this._finishProjectile(proj, player, particles);
      }
    }
  }

  draw(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;

    // Draw Lye Strider acid puddles
    for (let i = 0; i < this.acidPuddles.length; i++) {
      const p = this.acidPuddles[i];
      if (!camera.isVisible(p.x, p.y, p.radius + 10)) continue;
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY);
      drawBresenhamCircle(ctx, sx, sy, p.radius, PALETTE.lye, 0.75);
      drawBresenhamCircle(ctx, sx, sy, Math.round(p.radius * 0.55), PALETTE.bog, 0.55);
    }

    for (let i = 0; i < this.pool.length; i++) {
      const proj = this.pool[i];
      if (!proj.active) continue;
      if (!camera.isVisible(proj.x, proj.y, 24)) continue;

      if (
        proj.stuckInGround &&
        proj.stuckTimer < 0.25 &&
        Math.floor(proj.stuckTimer * 24) % 2 === 0
      ) {
        continue;
      }

      const sx = Math.round(proj.x - camX);
      const sy = Math.round(proj.y - camY);

      if (proj.type === 'railSpike' && spriteRegistry.railSpikeAngles.length === 8) {
        const frame = spriteRegistry.railSpikeAngles[proj.dir8];
        if (proj.stuckInGround) {
          ctx.fillStyle = PALETTE.soot;
          ctx.fillRect(sx - 3, sy + 2, 6, 2);
        }
        ctx.drawImage(
          frame,
          Math.round(sx - frame.width / 2),
          Math.round(sy - frame.height / 2)
        );
      } else if (proj.type === 'rookBolt' && spriteRegistry.rookBoltAngles.length === 8) {
        const frame = spriteRegistry.rookBoltAngles[proj.dir8];
        ctx.drawImage(
          frame,
          Math.round(sx - frame.width / 2),
          Math.round(sy - frame.height / 2)
        );
      } else if (
        proj.type === 'inesScrap' &&
        spriteRegistry.scrapVariantAngles.length > 0
      ) {
        const variantFrames =
          spriteRegistry.scrapVariantAngles[
            proj.scrapVariant % spriteRegistry.scrapVariantAngles.length
          ];
        const frame = variantFrames ? variantFrames[proj.dir8] : null;
        if (frame) {
          ctx.drawImage(
            frame,
            Math.round(sx - frame.width / 2),
            Math.round(sy - frame.height / 2)
          );
        }
      } else {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 4, sy - 4, 8, 8);
        ctx.fillStyle = proj.color;
        ctx.fillRect(sx - 3, sy - 3, 6, 6);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(sx - 2, sy - 2, 2, 2);
      }
    }
  }
}

export default ProjectilePool;
