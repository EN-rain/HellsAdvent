/**
 * GRAVEL SKY — Manifest-Driven Skill Effect Strips, Ground Cracks, & Damage Numbers
 * All visual effects are drawn from preloaded sprite strips in /public/assets/manifest.json:
 * - fx_slash_smear (5 frames, 128x128)
 * - fx_dash_streak (4 frames, 160x48)
 * - fx_hit_cross (3 frames, 48x48)
 * - fx_shards (4 frames, 64x64)
 * - fx_shock_ring (6 frames, 256x256)
 * - fx_ground_cracks (3 variants, 192x192)
 * - fx_dust_puff (4 frames, 48x48)
 * - fx_spark (3 frames, 24x24)
 * - fx_ult_slash (3 variants, 320x40)
 */

import { PALETTE } from '../data/config.js';
import { assets } from './AssetLoader.js';

export class ParticlePool {
  constructor(maxFx = 180, maxTexts = 40, maxCracks = 32) {
    this.fxList = Array.from({ length: maxFx }, () => ({
      active: false,
      assetId: 'fx_spark',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      frame: 0,
      timer: 0,
      fps: 24,
      flipX: false,
      scale: 1,
      tintColor: null,
      layer: 'air', // 'ground' or 'air'
    }));

    this.cracks = Array.from({ length: maxCracks }, () => ({
      active: false,
      x: 0,
      y: 0,
      variant: 0,
      life: 0,
      maxLife: 4.0,
    }));

    this.texts = Array.from({ length: maxTexts }, () => ({
      active: false,
      x: 0,
      y: 0,
      vy: 0,
      text: '',
      color: PALETTE.bone,
      life: 0,
      maxLife: 0.65,
      isCrit: false,
    }));
  }

  spawnStripFx(assetId, x, y, opts = {}) {
    const spec = assets.getSpec(assetId);
    const fps = opts.fps || spec?.fps || 24;
    for (let i = 0; i < this.fxList.length; i++) {
      const fx = this.fxList[i];
      if (!fx.active) {
        fx.active = true;
        fx.assetId = assetId;
        fx.x = Math.round(x);
        fx.y = Math.round(y);
        fx.vx = opts.vx || 0;
        fx.vy = opts.vy || 0;
        fx.frame = opts.frame ?? 0;
        fx.timer = 0;
        fx.fps = fps;
        fx.flipX = !!opts.flipX;
        fx.scale = opts.scale || 1;
        fx.tintColor = opts.tintColor || null;
        fx.layer = opts.layer || 'air';
        return fx;
      }
    }
    return null;
  }

  // --- HIGH-LEVEL SKILL & COMBAT EFFECT SPAWNERS ---

  spawnSlashArc(x, y, angle, radius = 26, _thickness = 5, _isCleave = false) {
    const dx = Math.cos(angle) * (radius * 0.45);
    const dy = Math.sin(angle) * (radius * 0.45);
    this.spawnStripFx('fx_slash_smear', x + dx, y + dy, {
      flipX: Math.cos(angle) < 0,
      scale: 0.45,
      fps: 24,
    });
  }

  spawnBurst(x, y, count = 6, color = PALETTE.signal, _speedMin = 25, _speedMax = 75) {
    this.spawnStripFx('fx_spark', x, y, {
      tintColor: color === PALETTE.blood ? PALETTE.blood : null,
      fps: 24,
    });
    if (count >= 6) {
      this.spawnStripFx('fx_shards', x, y, { scale: 0.65, fps: 20 });
    }
  }

  spawnHitSparks(x, y, angle, isCrit = false) {
    this.spawnStripFx('fx_hit_cross', x, y, {
      scale: isCrit ? 0.85 : 0.6,
      tintColor: isCrit ? PALETTE.brass : null,
      fps: 24,
    });
    this.spawnStripFx('fx_spark', x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, {
      fps: 24,
    });
  }

  spawnDustPuff(x, y, count = 4) {
    for (let i = 0; i < Math.min(2, count); i++) {
      this.spawnStripFx(
        'fx_dust_puff',
        x + (i === 0 ? -4 : 4),
        y + 2,
        {
          flipX: i % 2 === 1,
          scale: 0.65,
          fps: 18,
        }
      );
    }
  }

  spawnGroundBreakCracks(x, y, _radius = 48) {
    // Persistent ground crack decal (4s fade) + expanding fx_shock_ring
    let slot = null;
    for (let i = 0; i < this.cracks.length; i++) {
      if (!this.cracks[i].active) {
        slot = this.cracks[i];
        break;
      }
    }
    if (!slot) slot = this.cracks[0];
    slot.active = true;
    slot.x = Math.round(x);
    slot.y = Math.round(y);
    slot.variant = Math.floor(Math.random() * 3);
    slot.life = 4.0;
    slot.maxLife = 4.0;

    this.spawnStripFx('fx_shock_ring', x, y, {
      scale: 0.5,
      fps: 22,
      layer: 'ground',
    });
    this.spawnStripFx('fx_shards', x, y, { scale: 0.9, fps: 18 });
  }

  spawnRing(x, y, _maxRadius = 48, color = PALETTE.signal, _duration = 0.25) {
    this.spawnStripFx('fx_shock_ring', x, y, {
      scale: 0.45,
      tintColor: color === PALETTE.signal ? null : color,
      fps: 24,
      layer: 'ground',
    });
  }

  spawnSlashLine(x1, y1, x2, y2, color = PALETTE.signal, _duration = 0.35) {
    const mx = (x1 + x2) * 0.5;
    const my = (y1 + y2) * 0.5;
    const flipX = x2 < x1;
    if (Math.hypot(x2 - x1, y2 - y1) > 90) {
      this.spawnStripFx('fx_ult_slash', mx, my, {
        flipX,
        scale: 0.5,
        tintColor: color === PALETTE.signal ? null : color,
        fps: 20,
      });
    } else {
      this.spawnStripFx('fx_dash_streak', mx, my, {
        flipX,
        scale: 0.55,
        fps: 24,
      });
    }
  }

  spawnDebrisBurst(x, y, _partIds = [], _isMachinery = false) {
    this.spawnStripFx('fx_shards', x, y, { scale: 0.85, fps: 18 });
    this.spawnStripFx('fx_dust_puff', x, y, { scale: 0.75, fps: 16 });
  }

  spawnDamageNumber(x, y, amount, isCrit = false, customColor = null) {
    for (let i = 0; i < this.texts.length; i++) {
      const t = this.texts[i];
      if (!t.active) {
        t.active = true;
        t.x = Math.round(x + (Math.random() - 0.5) * 8);
        t.y = Math.round(y - 10);
        t.vy = isCrit ? -28 : -20;
        t.text = typeof amount === 'number' ? `${Math.max(1, Math.round(amount))}` : `${amount}`;
        t.color = customColor || (isCrit ? PALETTE.brass : PALETTE.bone);
        t.maxLife = isCrit ? 0.75 : 0.55;
        t.life = t.maxLife;
        t.isCrit = isCrit;
        return;
      }
    }
  }

  update(dt) {
    for (let i = 0; i < this.fxList.length; i++) {
      const fx = this.fxList[i];
      if (!fx.active) continue;
      fx.x += fx.vx * dt;
      fx.y += fx.vy * dt;
      fx.timer += dt;
      const spec = assets.getSpec(fx.assetId);
      const frameCount = spec ? spec.frameCount : 3;
      const frameDur = 1 / Math.max(1, fx.fps);
      if (fx.timer >= frameDur) {
        fx.timer -= frameDur;
        fx.frame += 1;
        if (fx.frame >= frameCount) {
          fx.active = false;
        }
      }
    }

    for (let i = 0; i < this.cracks.length; i++) {
      const c = this.cracks[i];
      if (!c.active) continue;
      c.life -= dt;
      if (c.life <= 0) c.active = false;
    }

    for (let i = 0; i < this.texts.length; i++) {
      const t = this.texts[i];
      if (!t.active) continue;
      t.y += t.vy * dt;
      t.vy *= 0.92;
      t.life -= dt;
      if (t.life <= 0) t.active = false;
    }
  }

  drawGroundLayer(ctx, camera) {
    // 1. Ground Break radial cracks (fx_ground_cracks strip)
    for (let i = 0; i < this.cracks.length; i++) {
      const c = this.cracks[i];
      if (!c.active) continue;
      const pos = camera.worldToScreen(c.x, c.y);
      const tint = c.life < 1.2 ? PALETTE.slag : null;
      assets.drawSprite(ctx, 'fx_ground_cracks', c.variant, pos.x, pos.y, {
        scaleX: 0.5,
        scaleY: 0.5,
        tintColor: tint,
      });
    }

    // 2. Ground-layer effect strips (shockwaves)
    for (let i = 0; i < this.fxList.length; i++) {
      const fx = this.fxList[i];
      if (!fx.active || fx.layer !== 'ground') continue;
      const pos = camera.worldToScreen(fx.x, fx.y);
      assets.drawSprite(ctx, fx.assetId, fx.frame, pos.x, pos.y, {
        flipX: fx.flipX,
        scaleX: fx.scale,
        scaleY: fx.scale,
        tintColor: fx.tintColor,
      });
    }
  }

  draw(ctx, camera) {
    // Air-layer skill and combat effect strips
    for (let i = 0; i < this.fxList.length; i++) {
      const fx = this.fxList[i];
      if (!fx.active || fx.layer === 'ground') continue;
      const pos = camera.worldToScreen(fx.x, fx.y);
      assets.drawSprite(ctx, fx.assetId, fx.frame, pos.x, pos.y, {
        flipX: fx.flipX,
        scaleX: fx.scale,
        scaleY: fx.scale,
        tintColor: fx.tintColor,
      });
    }

    // Crisp pixel damage numbers
    ctx.textAlign = 'center';
    for (let i = 0; i < this.texts.length; i++) {
      const t = this.texts[i];
      if (!t.active) continue;
      const pos = camera.worldToScreen(t.x, t.y);
      const sx = Math.round(pos.x);
      const sy = Math.round(pos.y);
      ctx.font = t.isCrit
        ? 'bold 9px ui-monospace, SFMono-Regular, Menlo, monospace'
        : 'bold 7px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = PALETTE.soot;
      ctx.fillText(t.text, sx + 1, sy + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, sx, sy);
    }
  }
}
