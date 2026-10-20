/**
 * GRAVEL SKY — Open 6000x6000 World in 16px Tiles, Streamed in Chunks
 * - Rendered onto the 480x270 integer pixel buffer.
 * - Zero gradients, zero shadowBlur, zero alpha blending.
 * - Uses Bayer dithered rings for the dark vignette around Sena and fake dithered glow rings
 *   around the Kettle boiler fire and Ume's lantern.
 */

import { PALETTE, WORLD_CONFIG, ENEMIES_CONFIG } from '../data/config.js';
import {
  DARK_FANTASY_FLOORS,
  DUSKHOLLOW_TOWN,
} from '../data/darkFantasyConfig.js';
import {
  drawBresenhamCircle,
  drawDitheredGlowRings,
  passDither,
  MATERIAL_RAMPS,
} from './PixelArt.js';
import { getChibiNpcCanvas, drawPixelText } from './Sprites.js';
import { worldLedger } from './WorldLedger.js';

export class World {
  constructor() {
    this.size = WORLD_CONFIG.size;
    this.tileSize = WORLD_CONFIG.tileSize;
    this.chunkTiles = WORLD_CONFIG.chunkTiles;
    this.chunkPixelSize = this.tileSize * this.chunkTiles; // 256px
    this.chunkCache = new Map();
    this.maxCachedChunks = 140;

    this.cycleTime = 0;
    this.stormFactor = 0;
    this.timeOfDayFactor = 0;
    this.windPhase = 0;

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
    const fl = worldLedger.currentFloor ?? 0;

    // FLOOR 0: DUSKHOLLOW TOWN (Explorable Safe RPG Town)
    if (fl === 0) {
      // Check if near the Top-Center Abyssal Tower Gatehouse
      const tdx = wx - DUSKHOLLOW_TOWN.towerEntrance.x;
      const tdy = wy - DUSKHOLLOW_TOWN.towerEntrance.y;
      if (tdx * tdx + tdy * tdy <= 150 * 150) {
        return {
          id: 'abyssal_tower_gate',
          name: 'Abyssal Spire Gatehouse',
          subtitle: 'Top-Center Tower · Floors 1–5 Portal',
          levelBand: [1, 50],
          safe: true,
          groundColor: '#16141C',
          detailColor: '#342D42',
          particleType: 'ash',
        };
      }
      // Check if near any of the 6 RPG Town Buildings
      for (const b of DUSKHOLLOW_TOWN.buildings) {
        const bdx = wx - b.x;
        const bdy = wy - b.y;
        if (bdx * bdx + bdy * bdy <= 145 * 145) {
          return {
            id: `town_${b.id}`,
            name: b.name,
            subtitle: `${b.npcName} · ${b.npcTitle}`,
            levelBand: [1, 50],
            safe: true,
            groundColor: '#16141C',
            detailColor: '#342D42',
            particleType: 'sparks',
          };
        }
      }
      return {
        id: 'duskhollow_town',
        name: DUSKHOLLOW_TOWN.name,
        subtitle: DUSKHOLLOW_TOWN.subtitle,
        levelBand: [1, 50],
        safe: true,
        groundColor: DUSKHOLLOW_TOWN.palette?.ground || DUSKHOLLOW_TOWN.groundColor || '#16141C',
        detailColor: DUSKHOLLOW_TOWN.palette?.stone || DUSKHOLLOW_TOWN.detailColor || '#342D42',
        particleType: 'ash',
      };
    }

    // FLOORS 1–5: ABYSSAL SPIRE REALMS (No Central Safe Zone; only Wandering Merchant Repellent Ward is safe!)
    const floorCfg = DARK_FANTASY_FLOORS[fl] || DARK_FANTASY_FLOORS[1] || {};
    const lvlBand = floorCfg.expectedLevelBand || floorCfg.levelBand || [1, 10];
    const inRepellent = worldLedger.isInsideMobRepellentWard(wx, wy);

    const cx = WORLD_CONFIG.kettleCenter.x;
    const cy = WORLD_CONFIG.kettleCenter.y;
    const dx = wx - cx;
    const dy = wy - cy;
    const distSq = dx * dx + dy * dy;

    if (distSq <= WORLD_CONFIG.kettleRadius * WORLD_CONFIG.kettleRadius) {
      return {
        ...WORLD_CONFIG.areas.kettle,
        name: `${floorCfg.name || 'Abyssal Spire'} · Crossroads`,
        subtitle: `Floor ${fl} Waystone · Expected Lv ${lvlBand[0]}–${lvlBand[1]}`,
        levelBand: lvlBand,
        safe: inRepellent,
      };
    }

    let baseKey = 'slabTown';
    if (Math.abs(dy) >= Math.abs(dx)) {
      baseKey = dy < 0 ? 'slabTown' : 'copperFlats';
    } else {
      baseKey = dx < 0 ? 'route9' : 'lyeMarsh';
    }

    const baseArea = WORLD_CONFIG.areas[baseKey];
    const sectorOverride = floorCfg.sectors?.[baseKey];
    const stageIdx = worldLedger.getSectorStage(baseKey, fl);
    const stageText =
      stageIdx >= 3
        ? 'CLEANSED'
        : `Boss Stage ${stageIdx + 1}/3 (${stageIdx === 0 ? 'Warden' : stageIdx === 1 ? 'Executioner' : 'Overlord'})`;

    return {
      ...baseArea,
      name: sectorOverride?.name || baseArea.name,
      subtitle: `${sectorOverride?.subtitle || baseArea.subtitle} · ${stageText}`,
      levelBand: lvlBand,
      safe: inRepellent,
      particleType: floorCfg.weather || floorCfg.particleType || baseArea.particleType,
    };
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

  /**
   * True ONLY in Duskhollow Town (Floor 0) or inside an active Wandering Merchant Mob-Repellent Ward!
   * The central safe zone on dungeon floors has been removed per user request.
   */
  isInsideKettle(wx, wy) {
    if ((worldLedger.currentFloor ?? 0) === 0) return true;
    return worldLedger.isInsideMobRepellentWard(wx, wy);
  }

  _buildChunkCanvas(cx, cy, floorNum = 0) {
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

        this._drawTile(ctx, px, py, worldTx, worldTy, wx, wy, h, area, floorNum);
      }
    }

    return canvas;
  }

  _drawTile(ctx, px, py, tx, ty, wx, wy, h, area, floorNum = 0) {
    const s = this.tileSize;

    // FLOOR 0: DUSKHOLLOW TOWN COBBLESTONE PLAZA & LANTERN AVENUES
    if (floorNum === 0) {
      const dx = Math.abs(wx - 3000);
      const dy = Math.abs(wy - 3000);
      const onNorthTowerRoad = dx < 56 && wy <= 3020 && wy >= 2520;
      const onCrossRoad = (dy < 44 && dx < 460) || (dx < 44 && dy < 380);
      const inPlaza = dx * dx + dy * dy <= 210 * 210;

      if (onNorthTowerRoad || onCrossRoad || inPlaza) {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#241F31' : '#1D1828';
        ctx.fillRect(px, py, s, s);
        ctx.fillStyle = '#342D42';
        ctx.fillRect(px + 1, py + 1, s - 3, 1);
        if (onNorthTowerRoad && tx % 3 === 0 && ty % 4 === 0) {
          ctx.fillStyle = '#D4AF37';
          ctx.fillRect(px + 6, py + 6, 3, 3);
        }
      } else {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#16141C' : '#121018';
        ctx.fillRect(px, py, s, s);
        if (h % 17 === 0) {
          ctx.fillStyle = '#252030';
          ctx.fillRect(px + 3, py + 4, 6, 5);
        }
      }
      return;
    }

    // FLOORS 2–5 BIOME TINT OVERRIDES
    const floorCfg = DARK_FANTASY_FLOORS[floorNum] || DARK_FANTASY_FLOORS[1] || {};
    if (floorNum >= 2) {
      const pal = floorCfg.palette || {
        ground: floorCfg.groundColor || '#121318',
        stone: floorCfg.detailColor || '#252730',
        accent: floorCfg.accentColor || '#00F0FF',
      };
      const isRoad = Math.abs(wx - 3000) < 32 || Math.abs(wy - 3000) < 32;
      ctx.fillStyle = isRoad ? pal.stone : (tx + ty) % 2 === 0 ? pal.ground : PALETTE.soot;
      ctx.fillRect(px, py, s, s);
      if (tx % 2 === 0) {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(px + s - 1, py, 1, s);
      }
      if (h % 19 === 0) {
        ctx.fillStyle = pal.stone;
        ctx.fillRect(px + 2, py + 3, 8, 6);
      } else if (h % 43 === 0) {
        ctx.fillStyle = pal.accent;
        ctx.fillRect(px + 5, py + 5, 3, 3);
      }
      return;
    }

    if (area.id === 'kettle') {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? MATERIAL_RAMPS.coat[1] : MATERIAL_RAMPS.steel[0];
      ctx.fillRect(px, py, s, s);

      const distX = Math.abs(wx - 3000);
      const distY = Math.abs(wy - 3000);
      if (distX < 28 || distY < 28) {
        ctx.fillStyle = MATERIAL_RAMPS.steel[1];
        ctx.fillRect(px + 1, py + 1, s - 2, s - 2);
        ctx.fillStyle = MATERIAL_RAMPS.steel[2];
        ctx.fillRect(px + 1, py + 1, s - 3, 1);
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
    const fl = worldLedger.currentFloor ?? 0;
    const key = `${fl}:${cx},${cy}`;
    if (this.chunkCache.has(key)) {
      return this.chunkCache.get(key);
    }
    const canvas = this._buildChunkCanvas(cx, cy, fl);
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

    if ((worldLedger.currentFloor ?? 0) === 0) {
      this._drawDuskhollowTown(ctx, camera);
    } else {
      this._drawTowerFloorFeatures(ctx, camera);
      this._drawBossArenas(ctx, camera, spawner);
    }
  }

  /**
   * Renders Duskhollow Town (Floor 0):
   * - Top-Center Abyssal Spire Gatehouse (3000, 2560)
   * - Central Town Well & Sanctuary Brazier (3000, 3000)
   * - 6 Interactive Dark Fantasy RPG Buildings & their Chibi NPC Masters
   */
  _drawDuskhollowTown(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;
    const animFrame = Math.floor(this.windPhase * 2) % 2;

    // 1. Central Town Well & Sanctuary Brazier at (3000, 3000)
    if (camera.isVisible(3000, 3000, 180)) {
      const wx = Math.round(3000 - camX);
      const wy = Math.round(3000 - camY);
      drawBresenhamCircle(ctx, wx, wy, 52, '#342D42', 0.65);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(wx - 14, wy - 10, 28, 20);
      ctx.fillStyle = MATERIAL_RAMPS.steel[2];
      ctx.fillRect(wx - 12, wy - 8, 24, 16);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(wx - 7, wy - 4, 14, 8);
      drawDitheredGlowRings(ctx, wx, wy, 14, PALETTE.brass);
      drawPixelText(ctx, 'DUSKHOLLOW PLAZA · NORTH TO ABYSSAL SPIRE ▲', wx, wy + 24, '#D4AF37', 'center');
    }

    // 2. Top-Center ABYSSAL TOWER GATEHOUSE at (3000, 2560)
    const tx = DUSKHOLLOW_TOWN.towerEntrance.x;
    const ty = DUSKHOLLOW_TOWN.towerEntrance.y;
    if (camera.isVisible(tx, ty, 240)) {
      const sx = Math.round(tx - camX);
      const sy = Math.round(ty - camY);

      // Massive Obsidian Citadel Base & Twin Gargoyle Pillars
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - 64, sy - 68, 128, 84);
      ctx.fillStyle = '#241B35';
      ctx.fillRect(sx - 60, sy - 64, 120, 76);
      // Left & Right Spire Towers
      ctx.fillStyle = '#342D42';
      ctx.fillRect(sx - 60, sy - 76, 26, 88);
      ctx.fillRect(sx + 34, sy - 76, 26, 88);
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(sx - 60, sy - 76, 26, 2);
      ctx.fillRect(sx + 34, sy - 76, 26, 2);

      // Swirling Soulfire Rift Archway in Center
      ctx.fillStyle = '#09070E';
      ctx.fillRect(sx - 24, sy - 42, 48, 54);
      ctx.fillStyle = animFrame === 0 ? '#00F0FF' : '#8A2BE2';
      ctx.fillRect(sx - 18, sy - 36, 36, 44);
      ctx.fillStyle = '#E8DFD1';
      ctx.fillRect(sx - 8, sy - 24, 16, 24);
      drawDitheredGlowRings(ctx, sx, sy - 14, 24, '#00F0FF');

      drawPixelText(ctx, '▲ THE ABYSSAL SPIRE (FLOORS 1–5) ▲', sx, sy - 88, '#00F0FF', 'center');
      drawPixelText(ctx, '[E] ASCEND THE SPIRE', sx, sy + 20, '#FFC83D', 'center');
    }

    // 3. The 6 Dark Fantasy RPG Town Buildings + Chibi NPC Masters
    const roleByBuildingId = {
      runesmith_forge: 'forge',
      alchemist_apothecary: 'apothecary',
      hunters_guild: 'guild',
      arcane_sanctum: 'sanctum',
      ravens_rest_tavern: 'tavern',
      mystic_enchanter: 'gambler',
    };

    for (const b of DUSKHOLLOW_TOWN.buildings) {
      if (!camera.isVisible(b.x, b.y, 160)) continue;
      const bx = Math.round(b.x - camX);
      const by = Math.round(b.y - camY);

      // Gothic Building Footprint & Pitched Roof
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(bx - 42, by - 46, 84, 52);
      ctx.fillStyle = b.roofColor || '#342D42';
      ctx.fillRect(bx - 40, by - 44, 80, 22);
      ctx.fillStyle = b.accentColor || '#D4AF37';
      ctx.fillRect(bx - 40, by - 44, 80, 2);
      ctx.fillStyle = '#1B1824';
      ctx.fillRect(bx - 36, by - 22, 72, 26);

      // Doorway & Warm Lanterns
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(bx - 10, by - 14, 20, 18);
      ctx.fillStyle = b.accentColor || '#D4AF37';
      ctx.fillRect(bx - 24, by - 12, 4, 5);
      ctx.fillRect(bx + 20, by - 12, 4, 5);
      drawDitheredGlowRings(ctx, bx - 22, by - 10, 6, b.accentColor || PALETTE.brass);

      // Render Building's Chibi NPC Master out front using the 2-Head Chibi Base!
      const npcRole = roleByBuildingId[b.id] || 'guild';
      const npcCanvas = getChibiNpcCanvas(npcRole, animFrame);
      if (npcCanvas) {
        ctx.drawImage(npcCanvas, bx - 24, by - 16);
      }

      drawPixelText(ctx, b.name.toUpperCase(), bx, by - 55, b.accentColor || '#E8DFD1', 'center');
      drawPixelText(ctx, `${b.npcName}`, bx, by + 26, '#E8DFD1', 'center');
    }
  }

  /**
   * Renders Tower Floor (Floors 1–5) features:
   * - Central Waystone Crossroads (contested — no safe zone)
   * - Active Portals (Return to Town Portal + Floor Ascent Portal)
   * - 20% Cleansed-Territory Sanctuary Pilgrim NPCs
   * - 20% Corner Wandering Merchants with 30s Defense Quest or 260px Mob-Repellent Sanctuary Ward
   */
  _drawTowerFloorFeatures(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;
    const animFrame = Math.floor(this.windPhase * 2) % 2;

    // 1. Central Spire Crossroads Waystone at (3000, 3000)
    if (camera.isVisible(3000, 3000, 120)) {
      const fx = Math.round(3000 - camX);
      const fy = Math.round(3000 - camY);
      drawBresenhamCircle(ctx, fx, fy, 42, MATERIAL_RAMPS.steel[2], 0.5);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(fx - 10, fy - 14, 20, 24);
      ctx.fillStyle = MATERIAL_RAMPS.steel[2];
      ctx.fillRect(fx - 8, fy - 12, 16, 20);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(fx - 3, fy - 7, 6, 10);
      drawDitheredGlowRings(ctx, fx, fy - 2, 10, '#00F0FF');
    }

    // 2. Active Portals (Town Return Portal & Next Floor Ascent Portal)
    for (const p of worldLedger.spawnedPortals || []) {
      if (!camera.isVisible(p.x, p.y, 80)) continue;
      const px = Math.round(p.x - camX);
      const py = Math.round(p.y - camY);
      drawBresenhamCircle(ctx, px, py, 20, p.color || '#00F0FF', 0.85);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(px - 11, py - 16, 22, 28);
      ctx.fillStyle = p.color || '#00F0FF';
      ctx.fillRect(px - 8, py - 13, 16, 22);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(px - 3, py - 8, 6, 12);
      drawDitheredGlowRings(ctx, px, py - 2, 14, p.color || '#00F0FF');
      drawPixelText(ctx, p.label, px, py - 26, p.color || '#00F0FF', 'center');
      drawPixelText(ctx, p.sublabel || '[E] Enter Portal', px, py + 16, '#E8DFD1', 'center');
    }

    // 3. Cleansed-Territory Sanctuary Pilgrim NPCs (20% spawn after sector Overlord is slain)
    for (const npc of worldLedger.cleansedNpcs || []) {
      if (!camera.isVisible(npc.x, npc.y, 90)) continue;
      const nx = Math.round(npc.x - camX);
      const ny = Math.round(npc.y - camY);
      drawBresenhamCircle(ctx, nx, ny + 8, 22, '#00F0FF', 0.6);
      const npcCanvas = getChibiNpcCanvas('pilgrim', animFrame);
      if (npcCanvas) {
        ctx.drawImage(npcCanvas, nx - 24, ny - 28);
      }
      drawPixelText(ctx, npc.name.toUpperCase(), nx, ny - 32, '#00F0FF', 'center');
      drawPixelText(
        ctx,
        npc.used ? 'BLESSING BESTOWED' : '[E] RECEIVE SANCTUARY BLESSING',
        nx,
        ny + 18,
        '#FFC83D',
        'center'
      );
    }

    // 4. Corner Wandering Merchants (30s Defense Sudden Quest + Mob-Repellent Sanctuary Ward)
    for (const m of worldLedger.wanderingMerchants || []) {
      if (m.state === 'fled') continue;
      if (!camera.isVisible(m.x, m.y, m.repellentRadius + 40)) continue;
      const mx = Math.round(m.x - camX);
      const my = Math.round(m.y - camY);

      if (m.repellentActive && m.state === 'protected') {
        // Shimmering 260px Mob-Repellent Sanctuary Ward where enemies cannot see or enter!
        drawBresenhamCircle(ctx, mx, my, m.repellentRadius, '#00F0FF', 0.75);
        drawBresenhamCircle(ctx, mx, my, m.repellentRadius - 6, '#D4AF37', 0.45);
      } else if (m.state === 'defending') {
        drawBresenhamCircle(ctx, mx, my, 120, '#E03C31', 0.75);
      }

      // Merchant Lantern Cart & Chibi Sprite
      ctx.fillStyle = '#342D42';
      ctx.fillRect(mx - 22, my - 12, 18, 16);
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(mx - 20, my - 10, 14, 3);
      const merchCanvas = getChibiNpcCanvas('merchant', animFrame);
      if (merchCanvas) {
        ctx.drawImage(merchCanvas, mx - 16, my - 28);
      }

      drawPixelText(ctx, `${m.name.toUpperCase()}`, mx, my - 36, '#FFC83D', 'center');
      if (m.state === 'defending') {
        // HP Bar & 30s Sudden Quest Timer
        const hpRatio = Math.max(0, m.hp / m.maxHp);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(mx - 24, my - 26, 48, 5);
        ctx.fillStyle = '#2EE6A8';
        ctx.fillRect(mx - 23, my - 25, Math.round(46 * hpRatio), 3);
        drawPixelText(
          ctx,
          `PROTECT MERCHANT: ${Math.ceil(m.defenseTimer)}S`,
          mx,
          my + 18,
          '#FF5A26',
          'center'
        );
      } else if (m.state === 'protected') {
        drawPixelText(
          ctx,
          '[E] BLACK-MARKET RELICS (MOB REPELLENT ACTIVE)',
          mx,
          my + 18,
          '#00F0FF',
          'center'
        );
      } else {
        drawPixelText(ctx, 'APPROACH TO AID MERCHANT', mx, my + 18, '#E8DFD1', 'center');
      }
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
