/**
 * GRAVEL SKY — Open 6000x6000 World in 16px Tiles, Streamed in Chunks
 * - Paints terrain from deterministic noise using the 3 seamless 16x16 ground tile variants
 *   per area from manifest.json (tile_kettle, tile_slab_town, tile_route_9, tile_lye_marsh,
 *   tile_copper_flats) plus edge transition tiles (tile_transitions).
 * - Scatters all 40 area props (8 per area, each with baked shadow ellipse) and animates
 *   Kettle's 3-frame campfire (prop_kettle_campfire) and Ume (ume, 2 frames).
 * - Exposes visible props for Y-sorting alongside characters and enemies.
 */

import {
  PALETTE,
  WORLD_CONFIG,
  AREAS_CONFIG,
  ENEMIES_CONFIG,
} from '../data/config.js';
import { BAYER_4X4 } from './PixelArt.js';
import { assets } from './AssetLoader.js';

const AREA_TILE_ASSETS = {
  kettle: 'tile_kettle',
  slabTown: 'tile_slab_town',
  route9: 'tile_route_9',
  lyeMarsh: 'tile_lye_marsh',
  copperFlats: 'tile_copper_flats',
};

const AREA_PROP_LISTS = {
  kettle: [
    'prop_kettle_boiler_tower',
    'prop_kettle_shack',
    'prop_kettle_campfire',
    'prop_kettle_signs',
    'prop_kettle_crates',
    'prop_kettle_barrels',
    'prop_kettle_tent',
    'prop_kettle_bench',
  ],
  slabTown: [
    'prop_slab_collapsed_wall',
    'prop_slab_rebar_pile',
    'prop_slab_dead_mall_sign',
    'prop_slab_rubble_heap',
    'prop_slab_bent_streetlight',
    'prop_slab_shopping_cart',
    'prop_slab_vending_machine',
    'prop_slab_broken_stairs',
  ],
  route9: [
    'prop_route9_burnt_car',
    'prop_route9_overturned_truck',
    'prop_route9_guardrail',
    'prop_route9_road_sign',
    'prop_route9_tire_stack',
    'prop_route9_oil_drum',
    'prop_route9_dead_tree',
    'prop_route9_billboard_frame',
  ],
  lyeMarsh: [
    'prop_marsh_rusted_drum_cluster',
    'prop_marsh_dead_reed_clump',
    'prop_marsh_bone_pile',
    'prop_marsh_sunken_car_roof',
    'prop_marsh_glowing_spore_pods',
    'prop_marsh_pipe_outflow',
    'prop_marsh_tarp_shack',
    'prop_marsh_fog_patch',
  ],
  copperFlats: [
    'prop_flats_wrecked_harvester',
    'prop_flats_sand_dune_crest',
    'prop_flats_machine_rib_cage',
    'prop_flats_cactus_husk',
    'prop_flats_buried_antenna',
    'prop_flats_tire_half_sunk',
    'prop_flats_bone_arch',
    'prop_flats_rusted_silo',
  ],
};

function hash2D(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

export class World {
  constructor() {
    this.width = WORLD_CONFIG.width;
    this.height = WORLD_CONFIG.height;
    this.tileSize = WORLD_CONFIG.tileSize; // 16px
    this.chunkTiles = WORLD_CONFIG.chunkTiles; // 32x32 tiles = 512x512px
    this.chunkPixelSize = this.tileSize * this.chunkTiles;

    this.chunkCache = new Map();
    this.chunkOrder = [];
    this.maxCachedChunks = 24;
    this.manifestBuiltWith = false;

    // Fixed Kettle Hub props (8 distinct props + Ume)
    const kc = WORLD_CONFIG.kettleCenter;
    this.kettleProps = [
      { id: 'prop_kettle_boiler_tower', x: kc.x, y: kc.y - 68, scale: 0.85 },
      { id: 'prop_kettle_shack', x: kc.x - 76, y: kc.y - 26, scale: 0.8 },
      { id: 'prop_kettle_campfire', x: kc.x, y: kc.y, scale: 0.9 },
      { id: 'prop_kettle_signs', x: kc.x + 56, y: kc.y + 42, scale: 0.85 },
      { id: 'prop_kettle_crates', x: kc.x - 46, y: kc.y + 34, scale: 0.85 },
      { id: 'prop_kettle_barrels', x: kc.x + 42, y: kc.y - 38, scale: 0.85 },
      { id: 'prop_kettle_tent', x: kc.x + 82, y: kc.y - 8, scale: 0.85 },
      { id: 'prop_kettle_bench', x: kc.x - 28, y: kc.y + 12, scale: 0.85 },
    ];

    this.cycleTimer = 0;
    this.stormFactor = 0;
    this.animTime = 0;

    this.motes = Array.from({ length: 42 }, (_, i) => ({
      x: (i * 73) % 480,
      y: (i * 41) % 270,
      vx: -8 - (i % 4) * 4,
      vy: 4 + (i % 3) * 3,
    }));
  }

  getAreaAt(wx, wy) {
    const kc = WORLD_CONFIG.kettleCenter;
    const distToKettle = Math.hypot(wx - kc.x, wy - kc.y);
    if (distToKettle <= WORLD_CONFIG.kettleSafeRadius) {
      return AREAS_CONFIG.kettle;
    }
    if (wx < 3000 && wy < 3000) return AREAS_CONFIG.slabTown;
    if (wx >= 3000 && wy < 3000) return AREAS_CONFIG.route9;
    if (wx < 3000 && wy >= 3000) return AREAS_CONFIG.lyeMarsh;
    return AREAS_CONFIG.copperFlats;
  }

  isInsideKettle(wx, wy) {
    const kc = WORLD_CONFIG.kettleCenter;
    return Math.hypot(wx - kc.x, wy - kc.y) <= WORLD_CONFIG.kettleSafeRadius;
  }

  _buildChunk(cx, cy) {
    const key = `${cx},${cy}`;
    if (this.chunkCache.has(key)) {
      return this.chunkCache.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.chunkPixelSize;
    canvas.height = this.chunkPixelSize;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.imageSmoothingEnabled = false;

    const worldStartX = cx * this.chunkPixelSize;
    const worldStartY = cy * this.chunkPixelSize;

    // 1. Paint 16x16 tiles from manifest strips + edge transition tiles where areas meet
    for (let ty = 0; ty < this.chunkTiles; ty++) {
      for (let tx = 0; tx < this.chunkTiles; tx++) {
        const wx = worldStartX + tx * this.tileSize;
        const wy = worldStartY + ty * this.tileSize;
        const area = this.getAreaAt(wx + 8, wy + 8);
        const neighborRight = this.getAreaAt(wx + 24, wy + 8);
        const neighborDown = this.getAreaAt(wx + 8, wy + 24);
        const h = hash2D(cx * 32 + tx, cy * 32 + ty);

        const px = tx * this.tileSize;
        const py = ty * this.tileSize;

        const isEdgeTransition =
          neighborRight.id !== area.id || neighborDown.id !== area.id;

        if (isEdgeTransition && assets.loaded) {
          const transFrame = Math.floor(h * 6) % 6;
          const tCanvas = assets.getFrameCanvas('tile_transitions', transFrame, false);
          if (tCanvas) {
            ctx.drawImage(tCanvas, px, py);
            continue;
          }
        }

        const tileAssetId = AREA_TILE_ASSETS[area.id] || 'tile_slab_town';
        const variant = Math.floor(h * 3) % 3;
        const tileCanvas = assets.loaded
          ? assets.getFrameCanvas(tileAssetId, variant, false)
          : null;

        if (tileCanvas) {
          ctx.drawImage(tileCanvas, px, py);
        } else {
          ctx.fillStyle = area.groundBase || PALETTE.soot;
          ctx.fillRect(px, py, 16, 16);
        }
      }
    }

    // 2. Deterministic scatter of area props (8 prop types per area) for Y-sorting
    const props = [];
    for (let pyCell = 0; pyCell < 4; pyCell++) {
      for (let pxCell = 0; pxCell < 4; pxCell++) {
        const seedX = cx * 4 + pxCell;
        const seedY = cy * 4 + pyCell;
        const r = hash2D(seedX * 13, seedY * 29);
        if (r > 0.55) continue;

        const wx = Math.round(
          worldStartX + pxCell * 128 + 24 + hash2D(seedX + 3, seedY + 7) * 80
        );
        const wy = Math.round(
          worldStartY + pyCell * 128 + 24 + hash2D(seedX + 11, seedY + 19) * 80
        );

        // Keep Kettle center clear for the hand-placed Kettle camp layout
        if (Math.hypot(wx - WORLD_CONFIG.kettleCenter.x, wy - WORLD_CONFIG.kettleCenter.y) < 210) {
          continue;
        }

        const area = this.getAreaAt(wx, wy);
        const propPool = AREA_PROP_LISTS[area.id] || AREA_PROP_LISTS.slabTown;
        const propId = propPool[Math.floor(hash2D(seedX + 5, seedY + 17) * propPool.length)];
        props.push({
          id: propId,
          x: wx,
          y: wy,
          scale: 0.72,
        });
      }
    }

    const chunkRecord = { canvas, props };
    this.chunkCache.set(key, chunkRecord);
    this.chunkOrder.push(key);
    if (this.chunkOrder.length > this.maxCachedChunks) {
      const oldest = this.chunkOrder.shift();
      this.chunkCache.delete(oldest);
    }

    return chunkRecord;
  }

  update(dt) {
    this.animTime += dt;
    this.cycleTimer = (this.cycleTimer + dt) % WORLD_CONFIG.dayCycleDuration;

    // Clear pre-asset chunk cache once manifest assets finish loading
    if (assets.loaded && !this.manifestBuiltWith) {
      this.manifestBuiltWith = true;
      this.chunkCache.clear();
      this.chunkOrder = [];
    }

    const phase = this.cycleTimer / WORLD_CONFIG.dayCycleDuration;
    if (phase > 0.6 && phase < 0.92) {
      this.stormFactor = Math.min(1, this.stormFactor + dt * 0.5);
    } else {
      this.stormFactor = Math.max(0, this.stormFactor - dt * 0.5);
    }

    const windMult = 1 + this.stormFactor * 1.8;
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      m.x += m.vx * windMult * dt;
      m.y += m.vy * windMult * dt;
      if (m.x < 0) m.x += 480;
      if (m.x >= 480) m.x -= 480;
      if (m.y < 0) m.y += 270;
      if (m.y >= 270) m.y -= 270;
    }
  }

  drawGround(ctx, camera) {
    const startCx = Math.max(0, Math.floor(camera.x / this.chunkPixelSize));
    const endCx = Math.min(
      Math.floor((this.width - 1) / this.chunkPixelSize),
      Math.floor((camera.x + camera.width) / this.chunkPixelSize)
    );
    const startCy = Math.max(0, Math.floor(camera.y / this.chunkPixelSize));
    const endCy = Math.min(
      Math.floor((this.height - 1) / this.chunkPixelSize),
      Math.floor((camera.y + camera.height) / this.chunkPixelSize)
    );

    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(0, 0, camera.width, camera.height);

    for (let cy = startCy; cy <= endCy; cy++) {
      for (let cx = startCx; cx <= endCx; cx++) {
        const chunk = this._buildChunk(cx, cy);
        const screenPos = camera.worldToScreen(
          cx * this.chunkPixelSize,
          cy * this.chunkPixelSize
        );
        ctx.drawImage(chunk.canvas, Math.round(screenPos.x), Math.round(screenPos.y));
      }
    }

    // Boss Arena perimeter markers
    for (const bossCfg of Object.values(ENEMIES_CONFIG.bosses)) {
      const bx = bossCfg.arenaCenter.x;
      const by = bossCfg.arenaCenter.y;
      const br = Math.round(bossCfg.arenaRadius * 0.55);
      if (camera.isVisible(bx, by, br + 40)) {
        const pos = camera.worldToScreen(bx, by);
        ctx.strokeStyle = PALETTE.rust;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          Math.round(pos.x - br),
          Math.round(pos.y - br * 0.7),
          br * 2,
          Math.round(br * 1.4)
        );
      }
    }
  }

  /**
   * Collects all visible props (including Kettle camp props and Ume) for Y-sorted rendering.
   */
  collectVisibleRenderables(camera, list) {
    const startCx = Math.max(0, Math.floor(camera.x / this.chunkPixelSize));
    const endCx = Math.min(
      Math.floor((this.width - 1) / this.chunkPixelSize),
      Math.floor((camera.x + camera.width) / this.chunkPixelSize)
    );
    const startCy = Math.max(0, Math.floor(camera.y / this.chunkPixelSize));
    const endCy = Math.min(
      Math.floor((this.height - 1) / this.chunkPixelSize),
      Math.floor((camera.y + camera.height) / this.chunkPixelSize)
    );

    for (let cy = startCy; cy <= endCy; cy++) {
      for (let cx = startCx; cx <= endCx; cx++) {
        const chunk = this._buildChunk(cx, cy);
        for (let i = 0; i < chunk.props.length; i++) {
          const p = chunk.props[i];
          if (!camera.isVisible(p.x, p.y, 72)) continue;
          list.push({
            y: p.y,
            draw: (ctx) => {
              const pos = camera.worldToScreen(p.x, p.y);
              const frame =
                p.id === 'prop_kettle_campfire'
                  ? Math.floor(this.animTime * 8) % 3
                  : 0;
              assets.drawSprite(ctx, p.id, frame, pos.x, pos.y, {
                scaleX: p.scale,
                scaleY: p.scale,
              });
            },
          });
        }
      }
    }

    // Kettle Hub Props
    for (let i = 0; i < this.kettleProps.length; i++) {
      const p = this.kettleProps[i];
      if (!camera.isVisible(p.x, p.y, 80)) continue;
      list.push({
        y: p.y,
        draw: (ctx) => {
          const pos = camera.worldToScreen(p.x, p.y);
          const frame =
            p.id === 'prop_kettle_campfire'
              ? Math.floor(this.animTime * 8) % 3
              : 0;
          assets.drawSprite(ctx, p.id, frame, pos.x, pos.y, {
            scaleX: p.scale,
            scaleY: p.scale,
          });
        },
      });
    }

    // Ume (Shop NPC, 64x64, idle 2 frames)
    const umePos = WORLD_CONFIG.umePosition;
    if (camera.isVisible(umePos.x, umePos.y, 64)) {
      list.push({
        y: umePos.y,
        draw: (ctx) => {
          const pos = camera.worldToScreen(umePos.x, umePos.y);
          const frame = Math.floor(this.animTime * 2) % 2;
          assets.drawSprite(ctx, 'ume', frame, pos.x, pos.y, {
            scaleX: 0.78,
            scaleY: 0.78,
          });
          ctx.fillStyle = PALETTE.brass;
          ctx.font = 'bold 7px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('UME', Math.round(pos.x), Math.round(pos.y - 44));
        },
      });
    }
  }

  drawAtmosphereAndVignette(ctx, camera, player) {
    // 1. Seven Cuts Ultimate whole-screen palette drop to slag/bone
    if (player.ultimateActive) {
      ctx.fillStyle = PALETTE.soot;
      for (let y = 0; y < camera.height; y += 2) {
        ctx.fillRect(0, y, camera.width, 1);
      }
      return;
    }

    // 2. Crisp 1x1 pixel atmospheric motes
    const area = this.getAreaAt(player.x, player.y);
    ctx.fillStyle =
      area.id === 'lyeMarsh'
        ? PALETTE.bog
        : area.id === 'copperFlats'
        ? PALETTE.rust
        : PALETTE.bone;
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      ctx.fillRect(Math.round(m.x), Math.round(m.y), 1, 1);
    }

    // 3. Ordered Bayer-dithered dark edge vignette
    const pScreen = camera.worldToScreen(player.x, player.y);
    const px = Math.round(pScreen.x);
    const py = Math.round(pScreen.y);

    ctx.fillStyle = PALETTE.soot;
    const step = 2;
    for (let y = 0; y < camera.height; y += step) {
      for (let x = 0; x < camera.width; x += step) {
        const dx = x - px;
        const dy = (y - py) * 1.35;
        const dist = Math.hypot(dx, dy);
        if (dist < 135) continue;
        const bayerVal = BAYER_4X4[(y >> 1) & 3][(x >> 1) & 3] / 16;
        const darkness = Math.min(1, (dist - 135) / 145);
        if (darkness > bayerVal) {
          ctx.fillRect(x, y, step, step);
        }
      }
    }
  }
}
