/**
 * GRAVEL SKY — Manifest-Driven Asset Loader, Atlas Cache, & Hybrid Animator
 *
 * - Preloads /assets/manifest.json, the 2048x2048 packed atlas (/assets/atlas_0.png),
 *   and every individual strip PNG in /public/assets/*.png with a progress bar callback.
 * - Provides cached offscreen alpha-masked white silhouettes (for hit flashes & Seven Cuts),
 *   cached color-tinted offscreen copies, and cached 1px blood/brass alpha-mask outlines
 *   for Elites and Bosses.
 * - Provides split-half sprite drawing (clipping along a slash angle and sliding halves apart).
 */

import { PALETTE } from '../data/config.js';

class AssetManager {
  constructor() {
    this.manifest = null;
    this.images = new Map(); // id -> HTMLImageElement
    this.atlases = new Map(); // filename -> HTMLImageElement
    this.loaded = false;
    this.loading = false;
    this.progress = 0;
    this.totalToLoad = 1;
    this.loadedCount = 0;
    this.listeners = new Set();

    // Offscreen caches for alpha-masked white hit flash, color tints, and 1px rim outlines
    this.whiteMaskCache = new Map(); // key: `${id}_${frame}_${flipX}` -> HTMLCanvasElement
    this.tintCache = new Map(); // key: `${id}_${frame}_${flipX}_${color}` -> HTMLCanvasElement
    this.outlineCache = new Map(); // key: `${id}_${frame}_${flipX}_${outlineColor}` -> HTMLCanvasElement
    this.blobShadowCache = new Map(); // key: `${rx}_${ry}` -> HTMLCanvasElement
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    for (const fn of this.listeners) {
      fn({
        loaded: this.loaded,
        progress: this.progress,
        loadedCount: this.loadedCount,
        totalToLoad: this.totalToLoad,
      });
    }
  }

  async preloadAll() {
    if (this.loaded || this.loading) return;
    this.loading = true;
    try {
      const res = await fetch('/assets/manifest.json');
      const manifest = await res.json();
      this.manifest = manifest;

      const assetEntries = Object.values(manifest.assets || {});
      const atlasList = manifest.atlases || [];
      this.totalToLoad = assetEntries.length + atlasList.length;
      this.loadedCount = 0;
      this.progress = 0;
      this._notify();

      const loadImg = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.decoding = 'sync';
          img.onload = () => {
            this.loadedCount += 1;
            this.progress = Math.min(1, this.loadedCount / Math.max(1, this.totalToLoad));
            this._notify();
            resolve(img);
          };
          img.onerror = () => {
            this.loadedCount += 1;
            this.progress = Math.min(1, this.loadedCount / Math.max(1, this.totalToLoad));
            this._notify();
            resolve(null);
          };
          img.src = src;
        });

      await Promise.all([
        ...atlasList.map(async (atlasFile) => {
          const img = await loadImg(`/assets/${atlasFile}`);
          if (img) this.atlases.set(atlasFile, img);
        }),
        ...assetEntries.map(async (entry) => {
          const img = await loadImg(entry.src);
          if (img) this.images.set(entry.id, img);
        }),
      ]);

      this.loaded = true;
      this.loading = false;
      this.progress = 1;
      this._notify();
    } catch (err) {
      console.error('Failed to preload manifest assets:', err);
      this.loaded = true;
      this.loading = false;
      this.progress = 1;
      this._notify();
    }
  }

  getSpec(id) {
    return this.manifest?.assets?.[id] || null;
  }

  getImage(id) {
    return this.images.get(id) || null;
  }

  /**
   * Returns a cached offscreen canvas containing a single extracted frame (optionally horizontally mirrored).
   */
  getFrameCanvas(id, frameIdx = 0, flipX = false) {
    const key = `${id}_${frameIdx}_${flipX ? 1 : 0}`;
    if (this.tintCache.has(key)) return this.tintCache.get(key);

    const spec = this.getSpec(id);
    if (!spec) return null;

    const fw = spec.frameWidth;
    const fh = spec.frameHeight;
    const f = Math.max(0, Math.min(spec.frameCount - 1, Math.floor(frameIdx)));

    const c = document.createElement('canvas');
    c.width = fw;
    c.height = fh;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    if (flipX) {
      ctx.translate(fw, 0);
      ctx.scale(-1, 1);
    }

    const atlasInfo = spec.atlas;
    const atlasImg = atlasInfo ? this.atlases.get(atlasInfo.atlas) : null;
    if (atlasImg) {
      ctx.drawImage(
        atlasImg,
        atlasInfo.x + f * fw,
        atlasInfo.y,
        fw,
        fh,
        0,
        0,
        fw,
        fh
      );
    } else {
      const stripImg = this.images.get(id);
      if (!stripImg) return null;
      ctx.drawImage(stripImg, f * fw, 0, fw, fh, 0, 0, fw, fh);
    }

    this.tintCache.set(key, c);
    return c;
  }

  /**
   * Returns an alpha-masked solid-color silhouette of a frame (used for white hit flashes & tints).
   */
  getTintedFrame(id, frameIdx = 0, flipX = false, color = PALETTE.bone) {
    const key = `${id}_${frameIdx}_${flipX ? 1 : 0}_${color}`;
    if (this.whiteMaskCache.has(key)) return this.whiteMaskCache.get(key);

    const baseCanvas = this.getFrameCanvas(id, frameIdx, flipX);
    if (!baseCanvas) return null;

    const c = document.createElement('canvas');
    c.width = baseCanvas.width;
    c.height = baseCanvas.height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(baseCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = 'source-over';

    this.whiteMaskCache.set(key, c);
    return c;
  }

  /**
   * Returns a cached frame with a code-drawn 1px blood-red or brass outline around the processed alpha mask.
   */
  getOutlinedFrame(id, frameIdx = 0, flipX = false, outlineColor = PALETTE.blood) {
    const key = `${id}_${frameIdx}_${flipX ? 1 : 0}_out_${outlineColor}`;
    if (this.outlineCache.has(key)) return this.outlineCache.get(key);

    const baseCanvas = this.getFrameCanvas(id, frameIdx, flipX);
    const maskCanvas = this.getTintedFrame(id, frameIdx, flipX, outlineColor);
    if (!baseCanvas || !maskCanvas) return baseCanvas;

    const c = document.createElement('canvas');
    c.width = baseCanvas.width;
    c.height = baseCanvas.height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // 4-neighbor 1px offset of the solid silhouette mask
    ctx.drawImage(maskCanvas, -1, 0);
    ctx.drawImage(maskCanvas, 1, 0);
    ctx.drawImage(maskCanvas, 0, -1);
    ctx.drawImage(maskCanvas, 0, 1);
    ctx.drawImage(baseCanvas, 0, 0);

    this.outlineCache.set(key, c);
    return c;
  }

  /**
   * Draws a simple pixel-art blob shadow under characters/mobs (cached as an image).
   */
  drawBlobShadow(ctx, x, y, rx = 10, ry = 4) {
    const irx = Math.max(3, Math.round(rx));
    const iry = Math.max(2, Math.round(ry));
    const key = `${irx}_${iry}`;
    let shadowCanvas = this.blobShadowCache.get(key);
    if (!shadowCanvas && typeof document !== 'undefined') {
      shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = irx * 2 + 2;
      shadowCanvas.height = iry * 2 + 2;
      const sctx = shadowCanvas.getContext('2d');
      const imgData = sctx.createImageData(shadowCanvas.width, shadowCanvas.height);
      const data = imgData.data;
      const cx = irx + 1;
      const cy = iry + 1;
      for (let py = 0; py < shadowCanvas.height; py++) {
        for (let px = 0; px < shadowCanvas.width; px++) {
          const dx = (px - cx) / irx;
          const dy = (py - cy) / iry;
          if (dx * dx + dy * dy <= 1.0) {
            const idx = (py * shadowCanvas.width + px) * 4;
            data[idx] = 11;
            data[idx + 1] = 13;
            data[idx + 2] = 16;
            data[idx + 3] = 255;
          }
        }
      }
      sctx.putImageData(imgData, 0, 0);
      this.blobShadowCache.set(key, shadowCanvas);
    }
    if (shadowCanvas) {
      ctx.drawImage(
        shadowCanvas,
        Math.round(x - irx - 1),
        Math.round(y - iry - 1)
      );
    }
  }

  /**
   * Draws a manifest sprite frame anchored at (worldScreenX, worldScreenY) with hybrid squash/bob/flash/outline.
   */
  drawSprite(ctx, id, frameIdx, screenX, screenY, opts = {}) {
    const spec = this.getSpec(id);
    if (!spec) return;

    const {
      flipX = false,
      whiteFlash = false,
      tintColor = null,
      outlineColor = null,
      scaleX = 1,
      scaleY = 1,
      offsetX = 0,
      offsetY = 0,
    } = opts;

    let srcCanvas = null;
    if (whiteFlash) {
      srcCanvas = this.getTintedFrame(id, frameIdx, flipX, PALETTE.bone);
    } else if (tintColor) {
      srcCanvas = this.getTintedFrame(id, frameIdx, flipX, tintColor);
    } else if (outlineColor) {
      srcCanvas = this.getOutlinedFrame(id, frameIdx, flipX, outlineColor);
    } else {
      srcCanvas = this.getFrameCanvas(id, frameIdx, flipX);
    }
    if (!srcCanvas) return;

    const anchorX = flipX ? spec.frameWidth - spec.anchor[0] : spec.anchor[0];
    const anchorY = spec.anchor[1];

    const dw = Math.round(spec.frameWidth * scaleX);
    const dh = Math.round(spec.frameHeight * scaleY);
    const dx = Math.round(screenX - anchorX * scaleX + offsetX);
    const dy = Math.round(screenY - anchorY * scaleY + offsetY);

    ctx.drawImage(srcCanvas, 0, 0, spec.frameWidth, spec.frameHeight, dx, dy, dw, dh);
  }

  /**
   * Draws a sprite split along a slash line and slid apart in two halves (used for Seven Cuts split-apart death).
   */
  drawSplitSprite(ctx, id, frameIdx, screenX, screenY, flipX, slideOffset = 8) {
    const spec = this.getSpec(id);
    const srcCanvas = this.getFrameCanvas(id, frameIdx, flipX);
    if (!spec || !srcCanvas) return;

    const fw = spec.frameWidth;
    const fh = spec.frameHeight;
    const halfH = fh >> 1;
    const anchorX = flipX ? fw - spec.anchor[0] : spec.anchor[0];
    const anchorY = spec.anchor[1];
    const baseX = Math.round(screenX - anchorX);
    const baseY = Math.round(screenY - anchorY);
    const shift = Math.round(slideOffset);

    // Top half slides top-right
    ctx.drawImage(srcCanvas, 0, 0, fw, halfH, baseX + shift, baseY - (shift >> 1), fw, halfH);
    // Bottom half slides bottom-left
    ctx.drawImage(
      srcCanvas,
      0,
      halfH,
      fw,
      fh - halfH,
      baseX - shift,
      baseY + halfH + (shift >> 1),
      fw,
      fh - halfH
    );
  }
}

/**
 * Manifest-Driven Hybrid Animator
 * Reads frameCount and fps from manifest.json and tracks animation playback + hybrid squash/bob offsets.
 */
export class SpriteAnimator {
  constructor(defaultAssetId) {
    this.currentId = defaultAssetId;
    this.frame = 0;
    this.timer = 0;
    this.loop = true;
    this.finished = false;
  }

  play(assetId, loop = true, reset = false) {
    if (this.currentId !== assetId || reset) {
      this.currentId = assetId;
      this.frame = 0;
      this.timer = 0;
      this.loop = loop;
      this.finished = false;
    }
  }

  update(dt) {
    const spec = assets.getSpec(this.currentId);
    if (!spec || spec.frameCount <= 1) return;
    const frameDur = 1 / Math.max(1, spec.fps || 8);
    this.timer += dt;
    while (this.timer >= frameDur) {
      this.timer -= frameDur;
      if (this.frame + 1 < spec.frameCount) {
        this.frame += 1;
      } else if (this.loop) {
        this.frame = 0;
      } else {
        this.finished = true;
      }
    }
  }
}

export const assets = new AssetManager();
export default assets;
