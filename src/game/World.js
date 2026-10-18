/**
 * GRAVEL SKY — Open 6000x6000 World in 16px Tiles, Streamed in Chunks
 * - Rendered onto the 480x270 integer pixel buffer.
 * - Zero gradients, zero shadowBlur, zero alpha blending.
 * - Uses Bayer dithered rings for the dark vignette around Sena and fake dithered glow rings
 *   around the Kettle boiler fire and Ume's lantern.
 */

import { PALETTE, WORLD_CONFIG, ENEMIES_CONFIG } from '../data/config.js';
import {
  drawBresenhamCircle,
  drawDitheredGlowRings,
  passDither,
  MATERIAL_RAMPS,
} from './PixelArt.js';
import { worldLedger } from './WorldLedger.js';

export class World {
  constructor() {
    this.size = WORLD_CONFIG.size;
    this.tileSize = WORLD_CONFIG.tileSize;
    this.chunkTiles = WORLD_CONFIG.chunkTiles;
    this.chunkPixelSize = this.tileSize * this.chunkTiles; // 256px
    this.chunkCache = new Map();
    this.maxCachedChunks = 120;

    this.cycleTime = 0;
    this.stormFactor = 0;
    this.timeOfDayFactor = 0;
    this.windPhase = 0;

    // Ambient floating ash/sparks/spores/sand in 480x270 space
    this.ambientMotes = Array.from({ length: 42 }, (_, i) => ({
      x: (i * 89) % 480,
      y: (i * 53) % 270,
      speedX: 10 + (i % 5) * 4,
      speedY: 5 + (i % 4) * 3,
      size: i % 4 === 0 ? 2 : 1,
    }));
  }

  _hash(tx, ty) {
    let n = tx * 374761393 + ty * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    return (n ^ (n >> 16)) >>> 0;
  }

  getAreaAt(wx, wy) {
    const cx = WORLD_CONFIG.kettleCenter.x;
    const cy = WORLD_CONFIG.kettleCenter.y;
    const dx = wx - cx;
    const dy = wy - cy;
    const distSq = dx * dx + dy * dy;

    if (distSq <= WORLD_CONFIG.kettleRadius * WORLD_CONFIG.kettleRadius) {
      return WORLD_CONFIG.areas.kettle;
    }

    if (Math.abs(dy) >= Math.abs(dx)) {
      return dy < 0 ? WORLD_CONFIG.areas.slabTown : WORLD_CONFIG.areas.copperFlats;
    } else {
      return dx < 0 ? WORLD_CONFIG.areas.route9 : WORLD_CONFIG.areas.lyeMarsh;
    }
  }

  getZoneAt(wx, wy) {
    return this.getAreaAt(wx, wy);
  }

  get stormTimer() {
    return this.stormFactor > 0.3 ? 1.0 : 0.0;
  }

  draw(ctx, camera, spawner) {
    this.drawGround(ctx, camera, spawner);
  }

  isInsideKettle(wx, wy) {
    const dx = wx - WORLD_CONFIG.kettleCenter.x;
    const dy = wy - WORLD_CONFIG.kettleCenter.y;
    return dx * dx + dy * dy <= WORLD_CONFIG.kettleRadius * WORLD_CONFIG.kettleRadius;
  }

  _buildChunkCanvas(cx, cy) {
    const canvas = document.createElement('canvas');
    canvas.width = this.chunkPixelSize;
    canvas.height = this.chunkPixelSize;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const baseTx = cx * this.chunkTiles;
    const baseTy = cy * this.chunkTiles;

    for (let ty = 0; ty < this.chunkTiles; ty++) {
      for (let tx = 0; tx < this.chunkTiles; tx++) {
        const worldTx = baseTx + tx;
        const worldTy = baseTy + ty;
        const wx = worldTx * this.tileSize + 8;
        const wy = worldTy * this.tileSize + 8;
        const px = tx * this.tileSize;
        const py = ty * this.tileSize;
        const h = this._hash(worldTx, worldTy);
        const area = this.getAreaAt(wx, wy);

        this._drawTile(ctx, px, py, worldTx, worldTy, wx, wy, h, area);
      }
    }

    return canvas;
  }

  _drawTile(ctx, px, py, tx, ty, wx, wy, h, area) {
    const s = this.tileSize;

    if (area.id === 'kettle') {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? MATERIAL_RAMPS.coat[1] : MATERIAL_RAMPS.steel[0];
      ctx.fillRect(px, py, s, s);

      const distX = Math.abs(wx - 3000);
      const distY = Math.abs(wy - 3000);
      if (distX < 28 || distY < 28) {
        ctx.fillStyle = MATERIAL_RAMPS.steel[1];
        ctx.fillRect(px + 1, py + 1, s - 2, s - 2);
        ctx.fillStyle = MATERIAL_RAMPS.steel[2];
        ctx.fillRect(px + 1, py + 1, s - 3, 1); // Top-left highlight
      } else if (h % 11 === 0) {
        ctx.fillStyle = MATERIAL_RAMPS.rust[1];
        ctx.fillRect(px + (h % 9), py + ((h >> 4) % 9), 3, 2);
      }
      return;
    }

    if (area.id === 'slabTown') {
      const isMallZone = Math.abs(wx - 3000) < 620 && wy < 2250;
      ctx.fillStyle =
        isMallZone && (tx + ty) % 2 === 0 ? MATERIAL_RAMPS.steel[1] : MATERIAL_RAMPS.coat[1];
      ctx.fillRect(px, py, s, s);

      // Top-left lit slab edge & soot seam
      ctx.fillStyle = PALETTE.soot;
      if (tx % 2 === 0) ctx.fillRect(px + s - 1, py, 1, s);
      if (ty % 2 === 0) ctx.fillRect(px, py + s - 1, s, 1);

      if (h % 19 === 0) {
        ctx.fillStyle = MATERIAL_RAMPS.steel[2];
        ctx.fillRect(px + 2, py + 3, 9, 7);
        ctx.fillStyle = MATERIAL_RAMPS.bone[2];
        ctx.fillRect(px + 2, py + 3, 9, 1);
      } else if (h % 31 === 0) {
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(px + 4, py + 2, 2, 10);
      }
      return;
    }

    if (area.id === 'route9') {
      const onHighwayBand = Math.abs(wy - 3000) < 160;
      ctx.fillStyle = onHighwayBand ? PALETTE.soot : MATERIAL_RAMPS.coat[1];
      ctx.fillRect(px, py, s, s);

      if (Math.abs(wy - 3000) < 10 && tx % 4 < 2) {
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(px, py + 6, s, 3);
      } else if (Math.abs(Math.abs(wy - 3000) - 130) < 10) {
        ctx.fillStyle = MATERIAL_RAMPS.bone[1];
        ctx.fillRect(px, py + 6, s, 2);
      }

      if (h % 15 === 0) {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(px + 2, py + 7, 9, 1);
      } else if (h % 37 === 0 && !onHighwayBand) {
        ctx.fillStyle = MATERIAL_RAMPS.rust[1];
        ctx.fillRect(px + 1, py + 2, 13, 10);
        ctx.fillStyle = MATERIAL_RAMPS.steel[2];
        ctx.fillRect(px + 3, py + 4, 9, 5);
      }
      return;
    }

    if (area.id === 'lyeMarsh') {
      const isPool = ((h >> 3) % 7) < 2;
      ctx.fillStyle = isPool ? MATERIAL_RAMPS.bog[2] : MATERIAL_RAMPS.bog[1];
      ctx.fillRect(px, py, s, s);

      if (isPool && h % 7 === 0) {
        ctx.fillStyle = MATERIAL_RAMPS.bog[3];
        ctx.fillRect(px + 4, py + 4, 5, 2);
      } else if (Math.abs(wy - 3000) < 24) {
        ctx.fillStyle = MATERIAL_RAMPS.rust[1];
        ctx.fillRect(px + 1, py + 2, s - 2, s - 4);
        ctx.fillStyle = MATERIAL_RAMPS.rust[3];
        ctx.fillRect(px + 1, py + 2, s - 2, 1);
      }
      return;
    }

    // Copper Flats
    ctx.fillStyle = h % 2 === 0 ? MATERIAL_RAMPS.rust[1] : MATERIAL_RAMPS.rust[2];
    ctx.fillRect(px, py, s, s);

    if ((tx + ty) % 3 === 0) {
      ctx.fillStyle = MATERIAL_RAMPS.rust[3];
      ctx.fillRect(px + 2, py + 6, 11, 1);
    }
    if (h % 29 === 0) {
      ctx.fillStyle = MATERIAL_RAMPS.steel[2];
      ctx.fillRect(px + 2, py + 2, 10, 10);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(px + 5, py + 5, 4, 4);
    }
  }

  getChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.chunkCache.has(key)) {
      return this.chunkCache.get(key);
    }
    const canvas = this._buildChunkCanvas(cx, cy);
    if (this.chunkCache.size >= this.maxCachedChunks) {
      const oldestKey = this.chunkCache.keys().next().value;
      this.chunkCache.delete(oldestKey);
    }
    this.chunkCache.set(key, canvas);
    return canvas;
  }

  update(dt) {
    this.cycleTime = (this.cycleTime + dt) % WORLD_CONFIG.dayCycleDuration;
    this.windPhase += dt * 2.4;

    const norm = this.cycleTime / WORLD_CONFIG.dayCycleDuration;
    this.timeOfDayFactor = 0.5 - 0.5 * Math.cos(norm * Math.PI * 2);
    const stormCenter = Math.abs(norm - 0.65);
    this.stormFactor = stormCenter < 0.18 ? 1 - stormCenter / 0.18 : 0;

    const windMult = 1 + this.stormFactor * 2.2;
    for (let i = 0; i < this.ambientMotes.length; i++) {
      const m = this.ambientMotes[i];
      m.x = (m.x + m.speedX * windMult * dt + 480) % 480;
      m.y = (m.y + m.speedY * (1 + this.stormFactor * 0.6) * dt + 270) % 270;
    }
  }

  drawGround(ctx, camera, spawner) {
    const startCx = Math.max(0, Math.floor(camera.x / this.chunkPixelSize));
    const endCx = Math.min(
      Math.floor((this.size - 1) / this.chunkPixelSize),
      Math.floor((camera.x + camera.width) / this.chunkPixelSize)
    );
    const startCy = Math.max(0, Math.floor(camera.y / this.chunkPixelSize));
    const endCy = Math.min(
      Math.floor((this.size - 1) / this.chunkPixelSize),
      Math.floor((camera.y + camera.height) / this.chunkPixelSize)
    );

    const camX = camera.renderX;
    const camY = camera.renderY;

    for (let cy = startCy; cy <= endCy; cy++) {
      for (let cx = startCx; cx <= endCx; cx++) {
        const chunkCanvas = this.getChunk(cx, cy);
        const sx = Math.round(cx * this.chunkPixelSize - camX);
        const sy = Math.round(cy * this.chunkPixelSize - camY);
        ctx.drawImage(chunkCanvas, sx, sy);
      }
    }

    this._drawKettleCamp(ctx, camera);
    this._drawBossArenas(ctx, camera, spawner);
  }

  _drawKettleCamp(ctx, camera) {
    const cx = WORLD_CONFIG.kettleCenter.x;
    const cy = WORLD_CONFIG.kettleCenter.y;
    if (!camera.isVisible(cx, cy, WORLD_CONFIG.kettleRadius + 60)) return;

    const camX = camera.renderX;
    const camY = camera.renderY;

    // Safe-zone boundary dithered ring
    drawBresenhamCircle(
      ctx,
      cx - camX,
      cy - camY,
      WORLD_CONFIG.kettleRadius,
      MATERIAL_RAMPS.steel[2],
      0.5
    );

    // Central Old Boiler monument at (3000, 2955) with top-left light highlight
    const bx = Math.round(3000 - camX);
    const by = Math.round(2955 - camY);
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(bx - 24, by - 22, 48, 38);
    ctx.fillStyle = MATERIAL_RAMPS.rust[1];
    ctx.fillRect(bx - 22, by - 20, 44, 34);
    ctx.fillStyle = MATERIAL_RAMPS.rust[2];
    ctx.fillRect(bx - 22, by - 20, 42, 16);
    ctx.fillStyle = MATERIAL_RAMPS.rust[3]; // Top-left lit edge
    ctx.fillRect(bx - 22, by - 20, 42, 1);
    ctx.fillRect(bx - 22, by - 20, 1, 34);
    // Smokestack
    ctx.fillStyle = MATERIAL_RAMPS.steel[2];
    ctx.fillRect(bx - 7, by - 32, 14, 14);
    ctx.fillStyle = MATERIAL_RAMPS.steel[3];
    ctx.fillRect(bx - 7, by - 32, 14, 1);

    // Glowing boiler firebox grate + 2 stacked 1px dithered glow rings
    const flicker = Math.sin(this.windPhase * 3) > 0 ? PALETTE.brass : MATERIAL_RAMPS.rust[3];
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(bx - 9, by + 1, 18, 9);
    ctx.fillStyle = flicker;
    ctx.fillRect(bx - 7, by + 3, 14, 5);
    drawDitheredGlowRings(ctx, bx, by + 5, 11, PALETTE.brass);

    // Campfire at (3000, 3024) + fake dithered glow rings
    const fx = Math.round(3000 - camX);
    const fy = Math.round(3024 - camY);
    ctx.fillStyle = MATERIAL_RAMPS.steel[1];
    ctx.fillRect(fx - 8, fy - 5, 16, 10);
    ctx.fillStyle = PALETTE.rust;
    ctx.fillRect(fx - 5, fy - 4, 10, 7);
    ctx.fillStyle = PALETTE.brass;
    const fH = 5 + (Math.floor(this.windPhase * 4) % 2);
    ctx.fillRect(fx - 3, fy - fH, 6, fH);
    ctx.fillStyle = PALETTE.bone;
    ctx.fillRect(fx - 1, fy - 2, 2, 2);
    drawDitheredGlowRings(ctx, fx, fy - 2, 12, PALETTE.brass);

    // Ume's Pawn Counter & Ume NPC at (2940, 2925)
    const ux = Math.round(WORLD_CONFIG.umePosition.x - camX);
    const uy = Math.round(WORLD_CONFIG.umePosition.y - camY);
    // Bog tarp awning with top-left highlight
    ctx.fillStyle = MATERIAL_RAMPS.bog[1];
    ctx.fillRect(ux - 18, uy - 18, 36, 12);
    ctx.fillStyle = MATERIAL_RAMPS.bog[2];
    ctx.fillRect(ux - 17, uy - 17, 34, 8);
    ctx.fillStyle = MATERIAL_RAMPS.bog[3];
    ctx.fillRect(ux - 17, uy - 17, 34, 1);

    // Ume NPC sprite
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(ux - 5, uy - 9, 10, 12);
    ctx.fillStyle = PALETTE.bone; // Headscarf
    ctx.fillRect(ux - 4, uy - 8, 8, 4);
    ctx.fillStyle = MATERIAL_RAMPS.skin[2];
    ctx.fillRect(ux - 3, uy - 4, 6, 3);
    ctx.fillStyle = PALETTE.rust;
    ctx.fillRect(ux - 4, uy - 1, 8, 5);

    // Counter bench + Brass lantern with dithered glow ring
    ctx.fillStyle = MATERIAL_RAMPS.steel[2];
    ctx.fillRect(ux - 17, uy + 4, 34, 8);
    ctx.fillStyle = MATERIAL_RAMPS.steel[3];
    ctx.fillRect(ux - 17, uy + 4, 34, 1);
    ctx.fillStyle = PALETTE.brass;
    ctx.fillRect(ux + 8, uy + 1, 4, 4);
    drawDitheredGlowRings(ctx, ux + 10, uy + 3, 5, PALETTE.brass);

    // Harlow's Trade Register Desk & Harlow NPC at (3062, 2925)
    const hx = Math.round(WORLD_CONFIG.harlowPosition.x - camX);
    const hy = Math.round(WORLD_CONFIG.harlowPosition.y - camY);
    // Rust sheet-metal roof canopy
    ctx.fillStyle = MATERIAL_RAMPS.rust[1];
    ctx.fillRect(hx - 18, hy - 18, 36, 11);
    ctx.fillStyle = MATERIAL_RAMPS.rust[2];
    ctx.fillRect(hx - 17, hy - 17, 34, 7);
    ctx.fillStyle = MATERIAL_RAMPS.rust[3];
    ctx.fillRect(hx - 17, hy - 17, 34, 1);
    // Harlow NPC (clerk with bone hair, brass visor, bog coat)
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(hx - 5, hy - 9, 10, 12);
    ctx.fillStyle = PALETTE.bone;
    ctx.fillRect(hx - 4, hy - 8, 8, 3);
    ctx.fillStyle = PALETTE.brass; // Clerk visor
    ctx.fillRect(hx - 4, hy - 5, 8, 1);
    ctx.fillStyle = MATERIAL_RAMPS.skin[2];
    ctx.fillRect(hx - 3, hy - 4, 6, 3);
    ctx.fillStyle = MATERIAL_RAMPS.bog[2];
    ctx.fillRect(hx - 4, hy - 1, 8, 5);
    // Steel ledger desk + open bone trade book + iron stamp
    ctx.fillStyle = MATERIAL_RAMPS.steel[1];
    ctx.fillRect(hx - 16, hy + 4, 32, 8);
    ctx.fillStyle = MATERIAL_RAMPS.steel[3];
    ctx.fillRect(hx - 16, hy + 4, 32, 1);
    ctx.fillStyle = PALETTE.bone; // Ledger pages
    ctx.fillRect(hx - 6, hy + 2, 9, 4);
    ctx.fillStyle = PALETTE.rust; // Spine
    ctx.fillRect(hx - 2, hy + 2, 1, 4);
    ctx.fillStyle = PALETTE.brass; // Heavy iron stamp
    ctx.fillRect(hx + 6, hy + 1, 4, 5);

    // Hand-painted directional signs around Kettle + Territory Liberation Brass Ribbons
    const signs = [
      { x: 3000, y: 2790, bossId: 'theForeman' },
      { x: 2790, y: 3000, bossId: 'bigAxle' },
      { x: 3210, y: 3000, bossId: 'motherSump' },
      { x: 3000, y: 3210, bossId: 'theLongDry' },
    ];
    for (let i = 0; i < signs.length; i++) {
      const sg = signs[i];
      if (!camera.isVisible(sg.x, sg.y, 40)) continue;
      const sx = Math.round(sg.x - camX);
      const sy = Math.round(sg.y - camY);
      const liberated = !!worldLedger.confirmedBossKills?.[sg.bossId];
      ctx.fillStyle = MATERIAL_RAMPS.rust[1];
      ctx.fillRect(sx - 1, sy - 4, 3, 10);
      ctx.fillStyle = liberated ? MATERIAL_RAMPS.brass[2] : MATERIAL_RAMPS.steel[2];
      ctx.fillRect(sx - 7, sy - 8, 14, 5);
      ctx.fillStyle = liberated ? PALETTE.bone : MATERIAL_RAMPS.bone[2];
      ctx.fillRect(sx - 7, sy - 8, 14, 1);
    }

    // Boss Trophy Monuments around the Kettle Campfire
    if (worldLedger.confirmedBossKills?.theForeman) {
      // Foreman Hard-Hat & Gear Trophy
      const tx = Math.round(2972 - camX);
      const ty = Math.round(3012 - camY);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(tx - 5, ty - 10, 10, 12);
      ctx.fillStyle = MATERIAL_RAMPS.steel[2];
      ctx.fillRect(tx - 4, ty - 2, 8, 3);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(tx - 3, ty - 9, 6, 7);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(tx - 2, ty - 8, 3, 5);
    }
    if (worldLedger.confirmedBossKills?.bigAxle) {
      // Big Axle Cracked Piston Trophy
      const tx = Math.round(2966 - camX);
      const ty = Math.round(3034 - camY);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(tx - 5, ty - 9, 10, 11);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(tx - 4, ty - 8, 8, 2);
      ctx.fillRect(tx - 3, ty - 5, 6, 2);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(tx - 1, ty - 8, 2, 8);
    }
    if (worldLedger.confirmedBossKills?.motherSump) {
      // Mother Sump Dried Bog Lantern
      const tx = Math.round(3028 - camX);
      const ty = Math.round(3012 - camY);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(tx - 4, ty - 10, 8, 12);
      ctx.fillStyle = MATERIAL_RAMPS.bog[2];
      ctx.fillRect(tx - 3, ty - 9, 6, 7);
      ctx.fillStyle = PALETTE.lye;
      ctx.fillRect(tx - 2, ty - 7, 4, 4);
      drawDitheredGlowRings(ctx, tx, ty - 5, 5, PALETTE.lye);
    }
    if (worldLedger.confirmedBossKills?.theLongDry) {
      // The Long Dry Shattered Bore Plate Trophy
      const tx = Math.round(3034 - camX);
      const ty = Math.round(3034 - camY);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(tx - 5, ty - 9, 10, 11);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(tx - 4, ty - 8, 8, 5);
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(tx - 4, ty - 8, 8, 1);
      ctx.fillStyle = MATERIAL_RAMPS.rust[2];
      ctx.fillRect(tx - 2, ty - 3, 4, 4);
    }
  }

  _drawBossArenas(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;
    const bossConfigs = Object.values(ENEMIES_CONFIG.bosses);

    for (let i = 0; i < bossConfigs.length; i++) {
      const b = bossConfigs[i];
      const ac = b.arenaCenter;
      if (!camera.isVisible(ac.x, ac.y, b.arenaRadius + 40)) continue;

      const sx = Math.round(ac.x - camX);
      const sy = Math.round(ac.y - camY);
      drawBresenhamCircle(ctx, sx, sy, b.arenaRadius, PALETTE.rust, 0.55);
    }
  }

  /**
   * Renders atmospheric motes & Bayer-dithered dark vignette around Sena on the 480x270 canvas.
   * Zero gradients, zero alpha blending.
   * Also supports 2-tone (slag & bone) world drop during the opening of Seven Cuts.
   */
  drawAtmosphereAndVignette(ctx, camera, player) {
    const w = camera.width;
    const h = camera.height;

    // Cinematic Ultimate Atmospheric Vignette & Contrast Shader
    // Darkens outer edges dramatically, focusing high-contrast light on the player and targets (no white wash, zero readback lag)
    const isUltActive =
      (player.ultimates && player.ultimates.active) ||
      (player.ultimateActive && !player.ultimateReleased);

    if (isUltActive) {
      ctx.save();
      const px = Math.round(player.x - camera.renderX);
      const py = Math.round(player.y - camera.renderY);
      const grad = ctx.createRadialGradient(px, py, 32, px, py, Math.max(w, h) * 0.72);
      grad.addColorStop(0, 'rgba(11, 13, 16, 0.0)');
      grad.addColorStop(0.45, 'rgba(11, 13, 16, 0.42)');
      grad.addColorStop(1, 'rgba(11, 13, 16, 0.82)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle dynamic class energy focus lines at screen borders
      const accent =
        player.classId === 'rook'
          ? 'rgba(229, 168, 35, 0.25)'
          : player.classId === 'ines'
          ? 'rgba(46, 230, 168, 0.25)'
          : 'rgba(224, 64, 48, 0.25)';
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, w, 2);
      ctx.fillRect(0, h - 2, w, 2);
      ctx.restore();
    }

    const area = this.getAreaAt(player.x, player.y);

    // 1. Area-specific drifting ash / sparks / spores / sand (solid integer pixels)
    for (let i = 0; i < this.ambientMotes.length; i++) {
      const m = this.ambientMotes[i];
      const sx = Math.round((m.x - camera.renderX * 0.5 + 4800) % w);
      const sy = Math.round((m.y - camera.renderY * 0.5 + 2700) % h);

      if (area.particleType === 'sparks') {
        ctx.fillStyle = i % 2 === 0 ? PALETTE.brass : PALETTE.rust;
      } else if (area.particleType === 'spores') {
        ctx.fillStyle = i % 2 === 0 ? PALETTE.bone : MATERIAL_RAMPS.bog[3];
      } else if (area.particleType === 'sand') {
        ctx.fillStyle = i % 2 === 0 ? MATERIAL_RAMPS.rust[3] : PALETTE.bone;
      } else {
        ctx.fillStyle = MATERIAL_RAMPS.bone[1];
      }

      const stretchX = area.particleType === 'sand' || this.stormFactor > 0.3 ? m.size * 2 : m.size;
      ctx.fillRect(sx, sy, stretchX, m.size);
    }

    // 2. Bayer-Dithered Dark Vignette centered on Sena (no radial gradient, no alpha)
    const pScreen = camera.worldToScreen(player.x, player.y);
    const px = Math.round(pScreen.x);
    const py = Math.round(pScreen.y);
    const rInnerSq = 105 * 105;
    const rMidSq = 155 * 155;
    const rOuterSq = 205 * 205;

    ctx.fillStyle = PALETTE.soot;
    // Step in 2x2 pixel blocks at perimeter for fast 60fps dithered vignette
    for (let y = 0; y < h; y += 2) {
      const dy = y - py;
      const dySq = dy * dy;
      for (let x = 0; x < w; x += 2) {
        const dx = x - px;
        const dSq = dx * dx + dySq;
        if (dSq <= rInnerSq) continue;

        const density = dSq >= rOuterSq ? 0.85 : dSq >= rMidSq ? 0.45 : 0.2;
        if (passDither(x >> 1, y >> 1, density)) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  }
}

export default World;
