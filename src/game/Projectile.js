/**
 * GRAVEL SKY — Manifest-Driven Projectiles (rail_spike & enemy projectiles)
 * Uses the 4-angle `rail_spike` manifest asset (mirrored for left angles).
 */

import { PALETTE } from '../data/config.js';
import { sound } from './Audio.js';
import { assets } from './AssetLoader.js';

export class ProjectilePool {
  constructor(maxProjectiles = 64) {
    this.pool = Array.from({ length: maxProjectiles }, () => ({
      active: false,
      embedded: false,
      embedTimer: 0,
      owner: 'player',
      kind: 'rail_spike',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      frameIdx: 0,
      flipX: false,
      radius: 4,
      damage: 10,
      maxLife: 1.2,
      life: 0,
      pierce: false,
      hitIds: new Set(),
      trailTimer: 0,
    }));
  }

  _angleToRailFrame(angle) {
    // 4 angles in rail_spike strip: 0=right, 1=down-right, 2=down, 3=up-right
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const flipX = cos < -0.2;
    const ay = sin;
    const ax = Math.abs(cos);
    let frameIdx = 0;
    if (ax < 0.38) {
      frameIdx = 2; // vertical
    } else if (ay > 0.35) {
      frameIdx = 1; // down-diagonal
    } else if (ay < -0.35) {
      frameIdx = 3; // up-diagonal
    } else {
      frameIdx = 0; // horizontal
    }
    return { frameIdx, flipX };
  }

  spawn({
    owner = 'player',
    kind = 'rail_spike',
    x,
    y,
    angle,
    speed = 320,
    radius = 5,
    damage = 20,
    maxLife = 1.0,
    pierce = true,
  }) {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) {
        p.active = true;
        p.embedded = false;
        p.embedTimer = 0;
        p.owner = owner;
        p.kind = kind;
        p.x = Math.round(x);
        p.y = Math.round(y);
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        const orient = this._angleToRailFrame(angle);
        p.frameIdx = orient.frameIdx;
        p.flipX = orient.flipX;
        p.radius = radius;
        p.damage = damage;
        p.maxLife = maxLife;
        p.life = maxLife;
        p.pierce = pierce;
        p.trailTimer = 0;
        p.hitIds.clear();
        return p;
      }
    }
    return null;
  }

  update(dt, player, spawner, particles, camera, onHitStop) {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      if (p.embedded) {
        p.embedTimer -= dt;
        if (p.embedTimer <= 0) {
          p.active = false;
        }
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      p.trailTimer += dt;
      if (p.trailTimer >= 1 / 24) {
        p.trailTimer = 0;
        if (p.owner === 'player') {
          particles.spawnStripFx('fx_spark', p.x, p.y, { scale: 0.45, fps: 24 });
        }
      }

      if (p.owner === 'player') {
        const nearby = spawner.queryNearby(p.x, p.y, p.radius + 32);
        for (let j = 0; j < nearby.length; j++) {
          const e = nearby[j];
          if (e.dead || p.hitIds.has(e.uid)) continue;
          const dist = Math.hypot(e.x - p.x, e.y - p.y);
          if (dist <= e.radius + p.radius) {
            p.hitIds.add(e.uid);
            const isCrit = Math.random() < player.critChance;
            const finalDmg = isCrit ? Math.round(p.damage * 1.65) : p.damage;
            const knockAngle = Math.atan2(p.vy, p.vx);
            e.takeDamage(finalDmg, knockAngle, 65, isCrit, player, particles, camera, spawner);
            sound.playHitEnemy(isCrit);
            if (onHitStop) onHitStop(0.035);
            if (!p.pierce) {
              p.active = false;
              break;
            }
          }
        }
      } else if (!player.dead) {
        const dist = Math.hypot(player.x - p.x, player.y - p.y);
        if (dist <= player.radius + p.radius) {
          const hit = player.takeDamage(p.damage, p.x, p.y, particles, camera);
          if (hit) {
            p.active = false;
            continue;
          }
        }
      }

      if (p.life <= 0) {
        if (p.owner === 'player' && p.kind === 'rail_spike') {
          p.embedded = true;
          p.embedTimer = 1.0;
          particles.spawnDustPuff(p.x, p.y, 2);
        } else {
          p.active = false;
        }
      }
    }
  }

  draw(ctx, camera) {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      if (!camera.isVisible(p.x, p.y, 24)) continue;
      const pos = camera.worldToScreen(p.x, p.y);
      const tint =
        p.owner === 'enemy'
          ? p.kind === 'acid'
            ? PALETTE.bog
            : PALETTE.blood
          : p.embedded
          ? PALETTE.slag
          : null;
      assets.drawSprite(ctx, 'rail_spike', p.frameIdx, pos.x, pos.y, {
        flipX: p.flipX,
        tintColor: tint,
      });
    }
  }
}
