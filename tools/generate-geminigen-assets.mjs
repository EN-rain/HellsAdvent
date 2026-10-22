#!/usr/bin/env node
/**
 * HELL'S ADVENT: ABYSSAL DESCENT (GRAVEL SKY) — Reference-Guided SVG + PNG Asset Generator
 * Output Directory: /geminigen/<id>.svg and /geminigen/<id>.png
 *
 * Applies structural pixel-art craft lessons from /tempartreference(DONOTCOMPLETELYCOPY)/
 * (2-head chibi proportions, 4x4 anime eye clusters with specular glints, selective 1px
 * material-tinted inner seams + #0B0D10 outer outlines, distinct multi-frame animation poses,
 * 80%-fill 32x32 framed icons, and bespoke 3/4 top-down props with baked elliptical shadows)
 * without copying any reference VTuber identities or designs.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ASSET_CATALOG, PALETTE_HEX } from './process-assets.mjs';

const ROOT = process.cwd();
const GEMINI_DIR = path.join(ROOT, 'geminigen');
const RAW_DIR = path.join(ROOT, 'assets-src', 'raw');

fs.mkdirSync(GEMINI_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

// ============================================================================
// EXPANSION CATALOG (All additional assets specified in ASSETS_NEEDED.md)
// ============================================================================
export const EXPANSION_CATALOG = [
  // HoloCure 6x2 Grid Format Sheets (384x128: Row 1 = 4 Idle frames, Row 2 = 6 Run frames)
  { id: 'sena_sheet', category: 'player_sheet', classId: 'sena', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Sena Ibuki 384x128 6x2 chibi sheet (Row 1: 4 Idle, Row 2: 6 Run)' },
  { id: 'rook_sheet', category: 'player_sheet', classId: 'rook', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Rook Matsuda Inquisitor Marksman 384x128 6x2 chibi sheet' },
  { id: 'ines_sheet', category: 'player_sheet', classId: 'ines', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Ines Calloway Ossuary Necromancer 384x128 6x2 chibi sheet' },
  { id: 'kaelen_sheet', category: 'player_sheet', classId: 'kaelen', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Kaelen Vos Hellfire Dragoon 384x128 6x2 chibi sheet' },
  { id: 'vespera_sheet', category: 'player_sheet', classId: 'vespera', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Vespera Locke Eldritch Soulbinder 384x128 6x2 chibi sheet' },

  // Companion Class Portraits (96x96)
  { id: 'rook_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Rook Matsuda with highwayman hat, brass monocle, and Hexbane Arbalest' },
  { id: 'ines_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Ines Calloway with bone-braided hair, verdigris streaks, and dorsal reliquary coil' },
  { id: 'kaelen_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Kaelen Vos in obsidian dragonplate with horned crest helm and ember eyes' },
  { id: 'vespera_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Vespera Locke with astral visor, floating brass halo, and familiar skull' },

  // Additional Floor 1 Common Enemies (40x40 x 5 frames = 200x40)
  { id: 'rivet_tick', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 8, anchor: [20, 36], alignFeet: true, prompt: 'Ossuary Skitter / Rivet Tick skull-shelled 6-legged iron crypt spider' },
  { id: 'signal_mite', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 8, anchor: [20, 34], alignFeet: false, prompt: 'Cursed Wisp / Signal Mite floating iron lantern-skull wreathed in signal-cyan soulfire' },
  { id: 'silt_mimic', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 8, anchor: [20, 36], alignFeet: true, prompt: 'Cursed Mimic / Silt Mimic bog-crusted iron coffer splitting open with jagged bone teeth' },
  { id: 'cinder_crow', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 10, anchor: [20, 34], alignFeet: false, prompt: 'Carrion Crow / Cinder Crow undead raven with bone skull beak and ember-orange wingtips' },

  // Additional Floor 1 Elite Enemies (80x80 x 7 frames = 560x80)
  { id: 'plate_marshal', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Dread Templar / Plate Marshal undead cathedral knight with tower shield and rusted broadsword' },
  { id: 'switchback_driver', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Hell-Steed Outrider / Switchback Driver armored outrider on spiked monowheel steed' },
  { id: 'sump_cantor', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Hex Chanter / Sump Cantor hunched fen-priest swinging a corroded brass plague-bell staff' },
  { id: 'bore_sentinel', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Crypt Wyrmling / Bore Sentinel segmented iron-and-bone burrowing drake with furnace throat' },

  // Duskhollow Town Companion NPCs (64x64 x 2 frames = 128x64)
  { id: 'npc_vaelen', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Master Smith Vaelen bearded runesmith with glowing runehammer and soulfire anvil' },
  { id: 'npc_isolde', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Sister Isolde plague-alchemist nun in bog-teal and bone veil with crimson blood vial and alembic table' },
  { id: 'npc_malakor', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Chronicler Malakor hooded chronicler with brass astrolabe spectacles beside the Bloodline Ledger board' },
  { id: 'npc_solen', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Archmage Solen grand astromancer with levitating signal-cyan grimoire and starforged staff' },
  { id: 'npc_maeve', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Maeve the Hearthkeeper warm tavern hostess with wyrm-steak platter and spiced ale tankard' },
  { id: 'npc_vex', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Vex the Veil-Peddler masked curio broker with 3 sealed reliquary coffers' },
  { id: 'npc_morwen', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Morwen the Veil-Peddler wandering caravan mystic with monster-repelling ward lantern' },
];

// ============================================================================
// COLOR HELPERS & NAMED PALETTE TOKENS (48-Color Locked Palette)
// ============================================================================
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

const C = {
  magenta: [255, 0, 255],
  soot: hexToRgb('#0B0D10'),
  slag: hexToRgb('#3A3F47'),
  rust: hexToRgb('#8B3A1E'),
  bog: hexToRgb('#1F4D4A'),
  bone: hexToRgb('#D9D2C3'),
  signal: hexToRgb('#00F0FF'),
  blood: hexToRgb('#FF3B3B'),
  brass: hexToRgb('#FFC83D'),

  coat0: hexToRgb('#11171B'),
  coat1: hexToRgb('#1A2228'),
  coat2: hexToRgb('#26313A'),
  coat3: hexToRgb('#33414C'),

  slag0: hexToRgb('#182429'),
  slag1: hexToRgb('#2A353D'),
  slag2: hexToRgb('#4F565E'),
  slag3: hexToRgb('#6E757A'),

  rust0: hexToRgb('#3B1C18'),
  rust1: hexToRgb('#612819'),
  rust2: hexToRgb('#B04E27'),
  rust3: hexToRgb('#D16B38'),

  bog0: hexToRgb('#11292B'),
  bog1: hexToRgb('#173B3A'),
  bog2: hexToRgb('#2E6962'),
  bog3: hexToRgb('#4A8F82'),

  bone0: hexToRgb('#545D5A'),
  bone1: hexToRgb('#8A877C'),
  bone2: hexToRgb('#B8B2A2'),
  bone3: hexToRgb('#EFE9DA'),

  sig0: hexToRgb('#094B57'),
  sig1: hexToRgb('#088A9E'),
  sig2: hexToRgb('#5CEBFF'),
  sig3: hexToRgb('#B8FBFF'),

  blood0: hexToRgb('#4A121B'),
  blood1: hexToRgb('#8A1C24'),
  blood2: hexToRgb('#D62828'),
  blood3: hexToRgb('#FF7A6B'),

  brass0: hexToRgb('#593E18'),
  brass1: hexToRgb('#946B22'),
  brass2: hexToRgb('#D49B2A'),
  brass3: hexToRgb('#FFE478'),

  skin0: hexToRgb('#5E362A'),
  skin1: hexToRgb('#8C5543'),
  skin2: hexToRgb('#BA7E63'),
  skin3: hexToRgb('#DFAD8C'),

  bile0: hexToRgb('#3A4A24'),
  bile1: hexToRgb('#6B8036'),
  bile2: hexToRgb('#9CB34C'),
  wood: hexToRgb('#4D3423'),
};

// ============================================================================
// PURE NODE PNG ENCODER & PIXEL-GRID SVG ENCODER
// ============================================================================
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    const rowStart = y * width * 4;
    raw.set(rgba.subarray(rowStart, rowStart + width * 4), y * stride + 1);
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Converts a Surface pixel buffer into a crisp, run-length-optimized pixel-art SVG
 * using shape-rendering="crispEdges". Magenta (#FF00FF) key pixels are left transparent
 * in the SVG so the vector asset displays with clean alpha in any viewer or browser.
 */
function encodePixelSVG(surf, id, keepMagenta = false) {
  const { width, height, data } = surf;
  const rects = [];
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      const isMag = r === 255 && g === 0 && b === 255;
      if (a === 0 || (!keepMagenta && isMag)) {
        x++;
        continue;
      }
      let runW = 1;
      while (x + runW < width) {
        const nIdx = (y * width + (x + runW)) * 4;
        if (
          data[nIdx] === r &&
          data[nIdx + 1] === g &&
          data[nIdx + 2] === b &&
          data[nIdx + 3] === a
        ) {
          runW++;
        } else {
          break;
        }
      }
      const hex = rgbToHex(r, g, b);
      rects.push(`<rect x="${x}" y="${y}" width="${runW}" height="1" fill="${hex}"/>`);
      x += runW;
    }
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges" data-asset-id="${id}">`,
    ...rects,
    `</svg>`,
  ].join('\n');
}

// ============================================================================
// PIXEL ART SURFACE PRIMITIVES
// ============================================================================
class Surface {
  constructor(width, height, bgRgb = C.magenta, bgAlpha = 255) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
      this.data[i * 4] = bgRgb[0];
      this.data[i * 4 + 1] = bgRgb[1];
      this.data[i * 4 + 2] = bgRgb[2];
      this.data[i * 4 + 3] = bgAlpha;
    }
  }

  pset(x, y, rgb, a = 255) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    const idx = (iy * this.width + ix) * 4;
    this.data[idx] = rgb[0];
    this.data[idx + 1] = rgb[1];
    this.data[idx + 2] = rgb[2];
    this.data[idx + 3] = a;
  }

  pget(x, y) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return [255, 0, 255, 0];
    const idx = (iy * this.width + ix) * 4;
    return [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
  }

  rect(x, y, w, h, rgb) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.pset(px, py, rgb);
      }
    }
  }

  ditherRect(x, y, w, h, rgbA, rgbB) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.pset(px, py, (px + py) % 2 === 0 ? rgbA : rgbB);
      }
    }
  }

  ellipse(cx, cy, rx, ry, rgb) {
    for (let py = Math.floor(cy - ry); py <= Math.ceil(cy + ry); py++) {
      for (let px = Math.floor(cx - rx); px <= Math.ceil(cx + rx); px++) {
        const dx = (px - cx) / Math.max(0.5, rx);
        const dy = (py - cy) / Math.max(0.5, ry);
        if (dx * dx + dy * dy <= 1.0) {
          this.pset(px, py, rgb);
        }
      }
    }
  }

  line(x0, y0, x1, y1, rgb, thickness = 1) {
    let ix0 = Math.round(x0);
    let iy0 = Math.round(y0);
    const ix1 = Math.round(x1);
    const iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;
    const r = Math.floor((thickness - 1) / 2);
    while (true) {
      for (let ty = -r; ty <= thickness - 1 - r; ty++) {
        for (let tx = -r; tx <= thickness - 1 - r; tx++) {
          this.pset(ix0 + tx, iy0 + ty, rgb);
        }
      }
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        ix0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        iy0 += sy;
      }
    }
  }

  outlineRegion(ox, oy, w, h, outlineRgb = C.soot) {
    const isBg = (px, py) => {
      if (px < ox || py < oy || px >= ox + w || py >= oy + h) return true;
      const [r, g, b, a] = this.pget(px, py);
      return a === 0 || (r === 255 && g === 0 && b === 255);
    };
    const toOutline = [];
    for (let py = oy; py < oy + h; py++) {
      for (let px = ox; px < ox + w; px++) {
        if (!isBg(px, py)) continue;
        if (!isBg(px - 1, py) || !isBg(px + 1, py) || !isBg(px, py - 1) || !isBg(px, py + 1)) {
          toOutline.push([px, py]);
        }
      }
    }
    for (const [px, py] of toOutline) {
      this.pset(px, py, outlineRgb);
    }
  }
}

// ============================================================================
// 1. PLAYABLE CHARACTERS — 2-HEAD CHIBI PROPORTIONS (Reference: Ayame / Zeta / Ina / Noel / Kronii)
// ============================================================================
function drawSenaChibiFrame(surf, ox, oy, dir, anim, frameIdx) {
  const cx = ox + 32;
  const feetY = oy + 58;
  const bob =
    anim === 'idle'
      ? frameIdx % 2 === 1
        ? 1
        : 0
      : anim === 'run'
      ? [0, -1, -2, 0, -1, -2][frameIdx % 6]
      : anim === 'hurt'
      ? 1
      : 0;
  const lungeX = anim.startsWith('attack') && frameIdx === 1 ? (dir === 'side' ? 6 : 0) : anim === 'hurt' ? (dir === 'side' ? -3 : 0) : 0;
  const lungeY = anim.startsWith('attack') && frameIdx === 1 ? (dir === 'down' ? 4 : dir === 'up' ? -4 : 0) : anim === 'hurt' ? (dir === 'down' ? -2 : 2) : 0;

  // Ground shadow under feet
  surf.ellipse(cx + lungeX, feetY + 1, 11, 3, C.coat0);

  if (anim === 'death') {
    const drop = Math.min(11, frameIdx * 4);
    // Kneeling / fallen chibi Sena with Duskrend planted vertically into the ground
    surf.ellipse(cx, feetY - 4, 13, 6, C.coat0);
    surf.rect(cx - 10, feetY - 12, 20, 9, C.coat1);
    surf.rect(cx - 8, feetY - 21 + drop, 15, 11, C.coat2);
    // Scarf draped across shoulders/ground
    surf.rect(cx - 9, feetY - 17 + drop, 16, 4, C.bone2);
    surf.rect(cx - 7, feetY - 17 + drop, 12, 3, C.bone3);
    surf.rect(cx - 12, feetY - 14 + drop, 5, 2, C.rust2); // crimson stencil stripe
    // Chibi head bowed
    surf.ellipse(cx - 1, feetY - 27 + drop, 8, 7, C.skin2);
    surf.ellipse(cx - 1, feetY - 31 + drop, 9, 5, C.rust2);
    surf.rect(cx - 7, feetY - 30 + drop, 12, 3, C.brass2); // goggles
    // Duskrend planted vertically
    surf.rect(cx + 11, feetY - 34, 3, 32, C.slag2);
    surf.line(cx + 14, feetY - 34, cx + 14, feetY - 3, C.sig2, 1);
    surf.rect(cx + 9, feetY - 36, 7, 3, C.brass2); // guard
    surf.outlineRegion(ox, oy, 64, 64, C.soot);
    return;
  }

  if (anim === 'dodge') {
    // Dynamic 4-frame shadow-step evasive roll with signal-cyan afterimage
    const rollY = feetY - 16 + (frameIdx === 1 || frameIdx === 2 ? -4 : 0);
    // Cyan afterimage trail on frames 1-2
    if (frameIdx === 1 || frameIdx === 2) {
      surf.ellipse(cx - 10, rollY + 1, 9, 8, C.sig0);
      surf.line(cx - 20, rollY - 3, cx - 6, rollY - 3, C.sig2, 2);
      surf.line(cx - 18, rollY + 4, cx - 4, rollY + 4, C.bone3, 1);
    }
    surf.ellipse(cx, rollY, 11, 9, C.coat1);
    surf.ellipse(cx - 2, rollY - 2, 8, 6, C.coat2);
    surf.ellipse(cx + 2, rollY - 5, 7, 6, C.rust2); // tucked head
    surf.rect(cx - 16, rollY - 4, 13, 4, C.bone3); // whipping bone scarf
    surf.rect(cx - 14, rollY - 3, 3, 3, C.rust2); // crimson stencil stripe
    surf.line(cx - 8, rollY + 5, cx + 13, rollY - 5, C.slag3, 2);
    surf.line(cx - 8, rollY + 4, cx + 13, rollY - 6, C.sig2, 1);
    surf.outlineRegion(ox, oy, 64, 64, C.soot);
    return;
  }

  const bx = cx + lungeX;
  const by = feetY + bob + lungeY;

  // Back of scarf & cape flare when facing down/side
  const scarfSwing = anim === 'run' ? [-3, -1, 1, 3, 1, -1][frameIdx % 6] : -1;
  if (dir !== 'up') {
    surf.rect(bx - 14 + scarfSwing, by - 22, 7, 11, C.bone1);
    surf.rect(bx - 13 + scarfSwing, by - 22, 5, 9, C.bone2);
    surf.rect(bx - 14 + scarfSwing, by - 14, 6, 2, C.rust2); // crimson stencil stripe
  }

  // Legs & Worn Boots (Chibi compact stride)
  const stride = anim === 'run' ? [-5, -3, 1, 5, 3, -1][frameIdx % 6] : 0;
  const liftL = anim === 'run' && (frameIdx === 1 || frameIdx === 2) ? -2 : 0;
  const liftR = anim === 'run' && (frameIdx === 4 || frameIdx === 5) ? -2 : 0;
  surf.rect(bx - 6 + stride, by - 9 + liftL, 5, 9, C.coat0);
  surf.rect(bx + 1 - stride, by - 9 + liftR, 5, 9, C.coat0);
  surf.rect(bx - 7 + stride, by - 4 + liftL, 6, 4, C.rust0);
  surf.rect(bx - 6 + stride, by - 4 + liftL, 4, 2, C.rust1);
  surf.rect(bx + 1 - stride, by - 4 + liftR, 6, 4, C.rust0);
  surf.rect(bx + 2 - stride, by - 4 + liftR, 4, 2, C.rust1);

  // Patched Soot-Black Abyssal Coat (flared chibi silhouette + frayed hem)
  surf.rect(bx - 10, by - 23, 20, 15, C.coat1);
  surf.rect(bx - 9, by - 23, 12, 13, C.coat2); // top-left cel shading
  surf.rect(bx - 8, by - 22, 6, 8, C.coat3);
  // Inner dark seam down coat center
  surf.line(bx, by - 21, bx, by - 9, C.soot, 1);
  // Frayed hem notches
  surf.pset(bx - 8, by - 9, C.magenta);
  surf.pset(bx - 3, by - 9, C.magenta);
  surf.pset(bx + 4, by - 9, C.magenta);
  surf.pset(bx + 8, by - 9, C.magenta);

  // Rust Shoulder Pauldron Patch
  if (dir === 'up' || dir === 'side' || dir === 'down') {
    const px = dir === 'side' ? bx - 6 : bx - 10;
    surf.rect(px, by - 23, 6, 5, C.rust1);
    surf.rect(px + 1, by - 23, 4, 3, C.rust2);
    surf.pset(px + 1, by - 22, C.rust3);
  }

  // Asymmetric Arms: Left torn sleeve + ash-grey bandaged forearm; Right brass ward-cuff
  if (dir !== 'side') {
    surf.rect(bx - 13, by - 21, 3, 5, C.coat2);
    surf.rect(bx - 13, by - 16, 3, 5, C.bone1);
    surf.pset(bx - 12, by - 15, C.bone3);
    surf.rect(bx + 10, by - 21, 3, 6, C.coat1);
    surf.rect(bx + 10, by - 15, 3, 3, C.brass2);
    surf.pset(bx + 11, by - 15, C.brass3);
  } else {
    surf.rect(bx - 4, by - 20, 5, 7, C.bone2);
    surf.line(bx - 4, by - 17, bx, by - 17, C.bone0, 1);
    surf.rect(bx + 2, by - 18, 4, 3, C.brass2);
    surf.pset(bx + 3, by - 18, C.brass3);
  }

  // Bone-White Scarf Collar (with 1px dark inner seam underneath)
  surf.rect(bx - 9, by - 24, 18, 1, C.soot);
  surf.rect(bx - 9, by - 27, 18, 4, C.bone2);
  surf.rect(bx - 8, by - 27, 14, 3, C.bone3);
  if (dir === 'up') {
    // Scarf tail hanging down her back in Up view
    surf.rect(bx - 4 + scarfSwing, by - 24, 7, 13, C.bone2);
    surf.rect(bx - 3 + scarfSwing, by - 24, 5, 10, C.bone3);
    surf.rect(bx - 4 + scarfSwing, by - 14, 7, 2, C.rust2);
  }

  // 2-Head Chibi Head & Face (Oversized 18x15 head for true HoloCure/chibi read)
  surf.ellipse(bx, by - 34, 9, 8, C.skin2);
  surf.ellipse(bx - 1, by - 35, 7, 6, C.skin3);

  // Short Uneven Rust-Red Hair (#8B3A1E / #B04E27 / #D16B38)
  surf.ellipse(bx, by - 40, 10, 5, C.rust2);
  surf.ellipse(bx - 2, by - 41, 7, 4, C.rust3);
  // Side hair tufts
  surf.rect(bx - 10, by - 39, 3, 9, C.rust1);
  surf.rect(bx + 8, by - 39, 3, 8, C.rust1);

  if (dir !== 'up') {
    // Longer left hair strand + silver/bone clasp
    surf.rect(bx - 10, by - 37, 3, 11, C.rust2);
    surf.rect(bx - 10, by - 33, 4, 2, C.bone3); // bone clasp
    // Cracked Brass Welding Goggles pushed up on forehead
    surf.rect(bx - 9, by - 40, 18, 4, C.brass1);
    surf.rect(bx - 8, by - 40, 6, 4, C.brass3);
    surf.rect(bx + 2, by - 40, 6, 4, C.brass3);
    surf.rect(bx - 7, by - 39, 4, 2, C.bog2);
    surf.rect(bx + 3, by - 39, 4, 2, C.bog2);
    surf.pset(bx - 6, by - 39, C.bone3); // cracked lens glint

    // Expressive 3x4 Chibi Anime Eyes with Bone Specular Glint
    if (dir === 'down') {
      if (anim === 'hurt') {
        surf.line(bx - 6, by - 34, bx - 3, by - 32, C.soot, 1);
        surf.line(bx - 6, by - 32, bx - 3, by - 34, C.soot, 1);
        surf.line(bx + 3, by - 34, bx + 6, by - 32, C.soot, 1);
        surf.line(bx + 3, by - 32, bx + 6, by - 34, C.soot, 1);
      } else {
        // Left eye
        surf.rect(bx - 6, by - 34, 3, 4, C.soot);
        surf.rect(bx - 5, by - 32, 2, 2, C.rust2); // iris
        surf.pset(bx - 6, by - 34, C.bone3); // specular highlight
        // Right eye
        surf.rect(bx + 3, by - 34, 3, 4, C.soot);
        surf.rect(bx + 4, by - 32, 2, 2, C.rust2);
        surf.pset(bx + 3, by - 34, C.bone3);
      }
    } else if (dir === 'side') {
      surf.rect(bx + 3, by - 34, 3, 4, C.soot);
      surf.rect(bx + 4, by - 32, 2, 2, C.rust2);
      surf.pset(bx + 3, by - 34, C.bone3);
    }
  } else {
    // Back of head hair layers + goggle strap in Up view
    surf.ellipse(bx, by - 35, 10, 7, C.rust1);
    surf.ellipse(bx - 1, by - 37, 8, 5, C.rust2);
    surf.rect(bx - 9, by - 37, 18, 2, C.brass0); // goggle strap
  }

  // Weapon: Duskrend / The Railcut (dark-iron rail-katana with signal-cyan glowing edge)
  if (anim.startsWith('attack')) {
    const hitNum = anim === 'attack1' ? 1 : anim === 'attack2' ? 2 : 3;
    if (frameIdx === 0) {
      // Frame 0: Coiled windup
      const wx = hitNum === 2 ? bx + 14 : bx - 18;
      const wy = hitNum === 3 ? by - 46 : by - 34;
      surf.line(bx - 4, by - 20, wx, wy, C.slag2, 3);
      surf.line(bx - 4, by - 21, wx, wy - 1, C.sig2, 1);
      surf.rect(bx - 6, by - 22, 4, 3, C.brass2);
    } else if (frameIdx === 1) {
      // Frame 1: Full cleave + multi-layered crescent slash smear (bone core + cyan rim)
      const arcR = hitNum === 3 ? 25 : 21;
      const sx = dir === 'side' ? bx + 12 : bx;
      const sy = dir === 'down' ? by - 10 : dir === 'up' ? by - 34 : by - 20;
      const tipX = sx + (dir === 'side' ? 18 : hitNum === 2 ? -18 : 18);
      const tipY = sy + (dir === 'down' ? 12 : dir === 'up' ? -12 : 4);
      surf.line(bx + 2, by - 19, tipX, tipY, C.slag2, 4);
      surf.line(bx + 2, by - 20, tipX, tipY - 1, C.sig2, 2);

      // Crescent smear arc
      const aStart = dir === 'up' ? -2.4 : dir === 'down' ? -0.4 : -1.2;
      const aEnd = dir === 'up' ? -0.7 : dir === 'down' ? 2.0 : 1.2;
      for (let a = aStart; a <= aEnd; a += 0.05) {
        const px = sx + Math.cos(a) * arcR;
        const py = sy + Math.sin(a) * (arcR * 0.72);
        surf.rect(px - 1, py - 1, 3, 3, C.sig1);
        surf.rect(px, py, 2, 2, C.sig2);
        surf.pset(px, py, C.bone3);
      }
    } else {
      // Frame 2: Follow-through recovery
      surf.line(bx + 6, by - 18, bx + 25, by - 9, C.slag2, 3);
      surf.line(bx + 6, by - 17, bx + 25, by - 8, C.sig2, 1);
      surf.rect(bx + 5, by - 19, 3, 3, C.brass2);
    }
  } else {
    // Carried poised at side/back
    const wx0 = bx + 7;
    const wy0 = by - 17;
    const wx1 = bx + 23;
    const wy1 = by - 31;
    surf.rect(wx0 - 1, wy0 - 1, 4, 3, C.brass2); // brass tsuba guard
    surf.line(wx0 - 3, wy0 + 2, wx0, wy0, C.bone2, 2); // cloth-wrapped hilt
    surf.line(wx0 + 2, wy0 - 1, wx1, wy1, C.slag2, 3);
    surf.line(wx0 + 3, wy0 - 2, wx1 + 1, wy1 - 1, C.sig2, 1); // 1px signal-cyan edge
  }

  surf.outlineRegion(ox, oy, 64, 64, C.soot);
}

/**
 * Renders any of the 5 playable classes in HoloCure 6x2 sheet layout (384x128: Row 1 = 4 Idle, Row 2 = 6 Run)
 */
function drawPlayableClassSheet(surf, classId) {
  const drawCell = (col, row, anim, f) => {
    const ox = col * 64;
    const oy = row * 64;
    if (classId === 'sena') {
      drawSenaChibiFrame(surf, ox, oy, 'side', anim, f);
      return;
    }
    const cx = ox + 32;
    const feetY = oy + 58;
    const bob = anim === 'idle' ? (f % 2 === 1 ? 1 : 0) : [0, -1, -2, 0, -1, -2][f % 6];
    const stride = anim === 'run' ? [-5, -3, 1, 5, 3, -1][f % 6] : 0;
    const by = feetY + bob;

    surf.ellipse(cx, feetY + 1, 11, 3, C.coat0);
    // Legs
    surf.rect(cx - 6 + stride, by - 9, 5, 9, C.coat0);
    surf.rect(cx + 1 - stride, by - 9, 5, 9, C.coat0);
    surf.rect(cx - 6 + stride, by - 4, 6, 4, C.rust0);
    surf.rect(cx + 1 - stride, by - 4, 6, 4, C.rust0);

    if (classId === 'rook') {
      // Rook Matsuda: Inquisitor Marksman (slate duster coat, brass buckles, highwayman hat, monocle, Hexbane Arbalest)
      surf.rect(cx - 10, by - 23, 20, 15, C.coat1);
      surf.rect(cx - 9, by - 23, 11, 13, C.coat2);
      // Bandolier of silver rail-bolts across chest
      surf.line(cx - 8, by - 22, cx + 7, by - 11, C.brass2, 2);
      surf.pset(cx - 4, by - 19, C.bone3);
      surf.pset(cx, by - 16, C.bone3);
      surf.pset(cx + 4, by - 13, C.bone3);
      // Chibi Head + Brass Monocle
      surf.ellipse(cx, by - 33, 8, 7, C.skin2);
      surf.rect(cx + 2, by - 34, 4, 4, C.brass3); // monocle rim
      surf.rect(cx + 3, by - 33, 2, 2, C.sig2); // monocle lens
      // Wide-brimmed dark leather inquisitor hat
      surf.ellipse(cx, by - 39, 14, 3, C.coat0);
      surf.rect(cx - 8, by - 45, 16, 6, C.coat1);
      surf.rect(cx - 8, by - 40, 16, 2, C.brass2); // hat band
      // Hexbane Arbalest / Springgun held forward
      surf.rect(cx + 6, by - 20, 16, 4, C.slag2);
      surf.line(cx + 18, by - 25, cx + 18, by - 11, C.brass3, 2); // leaf-spring bow
      surf.line(cx + 10, by - 20, cx + 23, by - 20, C.sig2, 1); // loaded bolt
    } else if (classId === 'ines') {
      // Ines Calloway: Ossuary Necromancer & Magnetist (bone braids with verdigris, dorsal coil, orbiting shards)
      // Dorsal copper-bone reliquary coil on back
      surf.rect(cx - 14, by - 28, 6, 14, C.rust2);
      surf.rect(cx - 13, by - 26, 4, 10, C.bog3);
      // Corset & catacomb mantle
      surf.rect(cx - 9, by - 23, 18, 15, C.coat1);
      surf.rect(cx - 6, by - 21, 12, 10, C.bone2); // bone-ribbed corset
      surf.line(cx - 5, by - 19, cx + 5, by - 19, C.soot, 1);
      surf.line(cx - 5, by - 16, cx + 5, by - 16, C.soot, 1);
      // Head + Bone-white braided hair streaked with verdigris
      surf.ellipse(cx, by - 34, 8, 7, C.skin3);
      surf.ellipse(cx, by - 40, 10, 5, C.bone3);
      surf.rect(cx - 10, by - 38, 3, 14, C.bone2); // braid
      surf.rect(cx - 7, by - 38, 2, 10, C.bog3); // verdigris streak
      surf.rect(cx + 3, by - 34, 3, 4, C.bog3); // glowing verdigris eye
      // Gravelord Scepter & 3 orbiting bone/iron shards
      surf.line(cx + 9, by - 8, cx + 14, by - 30, C.slag3, 2);
      surf.ellipse(cx + 14, by - 32, 4, 4, C.bone3);
      surf.pset(cx + 14, by - 32, C.sig2);
      const orbShift = f % 2 === 0 ? 0 : 2;
      surf.rect(cx - 16, by - 16 + orbShift, 3, 3, C.bone3);
      surf.rect(cx + 18, by - 18 - orbShift, 3, 3, C.sig2);
    } else if (classId === 'kaelen') {
      // Kaelen Vos: Hellfire Dragoon (obsidian dragonplate, twin boiler exhausts, horned crest helm, Cinderlance)
      // Twin brass boiler exhaust stacks on back
      surf.rect(cx - 13, by - 31, 4, 14, C.brass2);
      surf.rect(cx - 8, by - 33, 4, 14, C.brass1);
      surf.pset(cx - 12, by - 34 - (f % 2), C.rust3); // ember spark
      // Heavy obsidian dragonplate torso
      surf.rect(cx - 10, by - 23, 20, 15, C.slag1);
      surf.rect(cx - 8, by - 22, 14, 12, C.slag2);
      surf.rect(cx - 4, by - 20, 8, 6, C.rust3); // brimstone furnace core on chest
      // Head + spiky ash-blond hair + horned dragon crest helm
      surf.ellipse(cx, by - 34, 8, 7, C.skin2);
      surf.ellipse(cx, by - 40, 10, 5, C.slag1);
      surf.line(cx - 8, by - 41, cx - 14, by - 47, C.bone3, 2); // left horn
      surf.line(cx + 6, by - 41, cx + 13, by - 47, C.bone3, 2); // right horn
      surf.rect(cx + 3, by - 34, 3, 3, C.rust3); // fierce ember eye
      // Cinderlance (massive serrated obsidian greatlance with molten core)
      surf.line(cx + 4, by - 16, cx + 26, by - 26, C.slag1, 4);
      surf.line(cx + 6, by - 17, cx + 26, by - 26, C.rust3, 2);
      surf.line(cx + 10, by - 19, cx + 25, by - 25, C.brass3, 1);
    } else if (classId === 'vespera') {
      // Vespera Locke: Eldritch Soulbinder (levitating brass halo ring, astral visor, open grimoire, familiar skulls)
      // Levitating starforged brass halo ring behind shoulders
      surf.ellipse(cx - 2, by - 28, 14, 14, C.brass2);
      surf.ellipse(cx - 2, by - 28, 11, 11, C.magenta);
      // Midnight sanctum cloak with copper coil trim
      surf.rect(cx - 10, by - 23, 20, 15, C.coat1);
      surf.rect(cx - 8, by - 23, 14, 14, C.coat2);
      surf.rect(cx - 10, by - 11, 20, 2, C.rust3); // copper trim
      // Head + dark hair + glowing astral visor
      surf.ellipse(cx, by - 34, 8, 7, C.skin3);
      surf.ellipse(cx, by - 40, 10, 5, C.coat0);
      surf.rect(cx - 5, by - 35, 12, 4, C.sig2); // astral visor
      surf.rect(cx - 3, by - 34, 9, 2, C.sig3);
      // Levitating open Astral Grimoire + hovering Familiar Skull
      surf.rect(cx + 11, by - 22 + (f % 2), 8, 6, C.bone3);
      surf.rect(cx + 11, by - 17 + (f % 2), 8, 2, C.rust2);
      surf.ellipse(cx - 15, by - 36 - (f % 2), 4, 4, C.bone2); // familiar skull
      surf.pset(cx - 14, by - 36 - (f % 2), C.bile2); // volt-green eye
    }

    surf.outlineRegion(ox, oy, 64, 64, C.soot);
  };

  // Row 0: 4 Idle frames (cols 0..3)
  for (let c = 0; c < 4; c++) {
    drawCell(c, 0, 'idle', c);
  }
  // Row 1: 6 Run frames (cols 0..5)
  for (let c = 0; c < 6; c++) {
    drawCell(c, 1, 'run', c);
  }
}

// ============================================================================
// 2. CHARACTER PORTRAITS (96x96 High-Detail Anime Busts)
// ============================================================================
function drawPortrait(surf, id) {
  const cx = 48;
  if (id.startsWith('sena_')) {
    // Shoulders & Patched Black Coat
    surf.ellipse(cx, 88, 36, 22, C.coat1);
    surf.ellipse(cx - 6, 86, 26, 18, C.coat2);
    surf.rect(cx - 30, 72, 13, 10, C.rust2); // rust shoulder pauldron
    surf.rect(cx - 29, 73, 9, 5, C.rust3);
    // Duskrend hilt & signal-cyan blade edge peeking behind right shoulder
    surf.line(cx + 18, 64, cx + 32, 18, C.slag2, 6);
    surf.line(cx + 21, 64, cx + 35, 18, C.sig2, 2);
    surf.rect(cx + 22, 34, 10, 3, C.brass3);
    // Bone Scarf with crimson stencil stripe
    surf.ellipse(cx, 66, 24, 11, C.bone2);
    surf.ellipse(cx - 3, 64, 19, 8, C.bone3);
    surf.rect(cx + 7, 65, 11, 4, C.rust2);
    // Neck & Face
    surf.rect(cx - 6, 52, 12, 10, C.skin1);
    surf.ellipse(cx, 43, 19, 21, C.skin2);
    surf.ellipse(cx - 3, 41, 15, 18, C.skin3);
    // Hair Back & Layered Bangs
    surf.ellipse(cx, 26, 22, 13, C.rust1);
    surf.ellipse(cx - 2, 25, 19, 11, C.rust2);
    surf.ellipse(cx - 5, 23, 13, 7, C.rust3);
    // Longer left hair strand + bent bone/silver clasp
    surf.rect(cx - 21, 28, 7, 29, C.rust2);
    surf.rect(cx - 20, 28, 4, 24, C.rust3);
    surf.rect(cx - 22, 40, 9, 3, C.bone3);
    // Cracked Brass Welding Goggles on Forehead
    surf.rect(cx - 18, 22, 36, 9, C.brass1);
    surf.ellipse(cx - 9, 26, 8, 6, C.brass3);
    surf.ellipse(cx + 9, 26, 8, 6, C.brass3);
    surf.ellipse(cx - 9, 26, 5, 4, C.bog2);
    surf.ellipse(cx + 9, 26, 5, 4, C.bog2);
    surf.line(cx - 12, 24, cx - 6, 28, C.bone3, 1); // lens crack glint

    // Expression Variants
    if (id === 'sena_hurt') {
      surf.line(cx - 13, 41, cx - 5, 44, C.soot, 2);
      surf.line(cx - 13, 46, cx - 5, 43, C.soot, 2);
      surf.line(cx + 5, 44, cx + 13, 41, C.soot, 2);
      surf.line(cx + 5, 43, cx + 13, 46, C.soot, 2);
      surf.rect(cx - 6, 53, 12, 4, C.bone3); // grit teeth
      surf.line(cx - 6, 55, cx + 5, 55, C.soot, 1);
      surf.line(cx + 7, 48, cx + 13, 52, C.blood2, 2); // cheek cut/smudge
    } else {
      const isUlt = id === 'sena_ultimate';
      const isDet = id === 'sena_determined';
      const irisCol = isUlt ? C.sig2 : C.rust2;
      const hiCol = isUlt ? C.sig3 : C.bone3;
      // Left & Right Eyes (7x6 expressive anime eyes)
      for (const ex of [cx - 12, cx + 5]) {
        surf.rect(ex, 40, 7, 6, C.soot);
        surf.rect(ex + 1, 41, 5, 5, irisCol);
        surf.rect(ex + 2, 42, 3, 3, isUlt ? C.bone3 : C.soot);
        surf.rect(ex + 1, 41, 2, 2, hiCol);
        surf.pset(ex + 5, 44, hiCol);
      }
      if (isUlt) {
        // Rising spatial cyan energy wisps from eyes
        surf.line(cx - 9, 39, cx - 15, 30, C.sig2, 2);
        surf.line(cx + 9, 39, cx + 16, 30, C.sig2, 2);
      }
      const browY = isDet || isUlt ? 37 : 36;
      surf.line(cx - 13, browY - (isDet ? 1 : 0), cx - 4, browY + 1, C.rust0, 2);
      surf.line(cx + 4, browY + 1, cx + 13, browY - (isDet ? 1 : 0), C.rust0, 2);
      surf.line(cx - 4, 54, cx + 4, isDet ? 53 : 54, C.rust0, 2);
    }
  } else if (id === 'rook_neutral') {
    surf.ellipse(cx, 88, 36, 22, C.coat1);
    surf.line(cx - 18, 70, cx + 18, 88, C.brass2, 4); // bolt bandolier
    surf.ellipse(cx, 66, 20, 9, C.rust1);
    surf.ellipse(cx, 44, 17, 19, C.skin2);
    // Monocle on right eye
    surf.ellipse(cx + 8, 42, 6, 6, C.brass3);
    surf.ellipse(cx + 8, 42, 4, 4, C.sig2);
    surf.rect(cx - 11, 41, 5, 5, C.soot);
    surf.pset(cx - 10, 41, C.bone3);
    // Wide-brimmed highwayman inquisitor hat
    surf.ellipse(cx, 26, 38, 7, C.coat0);
    surf.rect(cx - 18, 10, 36, 16, C.coat1);
    surf.rect(cx - 18, 22, 36, 3, C.brass2);
  } else if (id === 'ines_neutral') {
    surf.ellipse(cx, 88, 34, 22, C.coat1);
    surf.ellipse(cx, 44, 17, 19, C.skin3);
    surf.ellipse(cx, 26, 22, 12, C.bone3);
    surf.rect(cx - 21, 28, 6, 36, C.bone2); // bone braid
    surf.rect(cx + 15, 28, 6, 36, C.bog3); // verdigris braid
    surf.rect(cx - 11, 41, 6, 5, C.bog3);
    surf.rect(cx + 5, 41, 6, 5, C.bog3);
    surf.pset(cx - 10, 41, C.bone3);
    surf.pset(cx + 6, 41, C.bone3);
  } else if (id === 'kaelen_neutral') {
    surf.ellipse(cx, 88, 38, 24, C.slag1);
    surf.ellipse(cx, 74, 14, 8, C.rust3); // furnace chest core
    surf.ellipse(cx, 44, 18, 19, C.skin2);
    surf.ellipse(cx, 25, 21, 11, C.slag2);
    surf.line(cx - 16, 24, cx - 32, 8, C.bone3, 4); // left dragon horn
    surf.line(cx + 16, 24, cx + 32, 8, C.bone3, 4); // right dragon horn
    surf.rect(cx - 11, 41, 6, 5, C.rust3);
    surf.rect(cx + 5, 41, 6, 5, C.rust3);
    surf.pset(cx - 10, 41, C.brass3);
    surf.pset(cx + 6, 41, C.brass3);
  } else if (id === 'vespera_neutral') {
    // Brass halo behind bust
    surf.ellipse(cx, 48, 38, 38, C.brass2);
    surf.ellipse(cx, 48, 33, 33, C.magenta);
    surf.ellipse(cx, 88, 34, 22, C.coat1);
    surf.ellipse(cx, 44, 17, 19, C.skin3);
    surf.ellipse(cx, 26, 21, 12, C.coat0);
    surf.rect(cx - 15, 38, 30, 8, C.sig2); // astral visor
    surf.rect(cx - 12, 40, 24, 4, C.sig3);
  }
  surf.outlineRegion(0, 0, 96, 96, C.soot);
}

// ============================================================================
// 3. COMMON ENEMIES (40x40 x 5 Frames: Move A, Move B, Attack, Hurt, Dead)
// ============================================================================
function drawCommonEnemyFrame(surf, ox, oy, id, f) {
  const cx = ox + 20;
  const cy = oy + 24;
  const isDead = f === 4;
  const isHurt = f === 3;
  const isAtk = f === 2;
  const bob = f === 1 ? -2 : isAtk ? 2 : isHurt ? -1 : 0;

  if (id === 'tin_rat') {
    // Shackled Crypt-Rat: feral plague-rat bound in a spiked wrought-iron torture gibbet collar & chain
    if (isDead) {
      surf.ellipse(cx - 4, cy + 7, 8, 4, C.coat1);
      surf.rect(cx + 3, cy + 5, 6, 4, C.slag2); // broken iron gibbet collar
      surf.line(cx - 12, cy + 9, cx - 3, cy + 10, C.skin1, 1);
    } else {
      surf.ellipse(cx, cy + 9, 11, 3, C.coat0);
      surf.line(cx - 16, cy + 5, cx - 6, cy + 3 + bob, C.skin1, 2); // segmented rat tail
      // Hunched mange-furred rat body + exposed spine
      surf.ellipse(cx - 2, cy + 1 + bob, 9, 6, C.coat1);
      surf.ellipse(cx - 3, cy - 1 + bob, 6, 4, C.slag1);
      for (const sx of [-6, -2, 2]) {
        surf.pset(cx + sx, cy - 5 + bob, C.bone3); // dorsal bone spine ridges
      }
      // Spiked wrought-iron torture gibbet collar & trailing shackle chain
      surf.rect(cx + 3, cy - 5 + bob, 5, 10, C.rust1);
      surf.rect(cx + 4, cy - 7 + bob, 3, 2, C.slag3); // dorsal iron spike
      surf.line(cx + 3, cy + 5 + bob, cx - 6, cy + 8, C.slag3, 1); // dragging chain
      // Snarling skull-snout, bone incisors & glowing crimson eye
      surf.ellipse(cx + 10 + (isAtk ? 3 : 0), cy + 1 + bob, 5, 4, C.bone2);
      surf.rect(cx + 11 + (isAtk ? 3 : 0), cy - 1 + bob, 2, 2, isAtk ? C.brass3 : C.blood2);
      surf.line(cx + 13 + (isAtk ? 3 : 0), cy + 3 + bob, cx + 13 + (isAtk ? 3 : 0), cy + 5 + bob, C.bone3, 1);
    }
  } else if (id === 'dust_dog') {
    // Flayed Grave-Hound: undead skeletal necro-hound with exposed ribcage & spiked executioner collar
    if (isDead) {
      surf.ellipse(cx - 4, cy + 7, 9, 4, C.bone1);
      surf.rect(cx + 5, cy + 6, 5, 3, C.rust1);
    } else {
      const stretch = isAtk ? 4 : f === 1 ? 2 : 0;
      surf.ellipse(cx, cy + 10, 12, 3, C.coat0);
      surf.ellipse(cx - 2, cy + bob, 11 + stretch, 6, C.rust1); // flayed crimson muscle
      // Exposed bleached ribcage bars & jagged dorsal vertebrae
      for (const rx of [-6, -3, 0, 3]) {
        surf.line(cx + rx, cy - 4 + bob, cx + rx, cy + 3 + bob, C.bone3, 1);
        surf.pset(cx + rx, cy - 6 + bob, C.bone2);
      }
      surf.line(cx - 9, cy + 4, cx - 12 - stretch, cy + 11, C.bone1, 2);
      surf.line(cx + 6, cy + 4, cx + 9 + stretch, cy + 11, C.bone1, 2);
      // Spiked dark-iron executioner collar & broken chain links
      surf.rect(cx + 5, cy - 4 + bob, 4, 8, C.slag1);
      surf.pset(cx + 7, cy - 6 + bob, C.brass3);
      surf.line(cx + 6, cy + 4 + bob, cx + 3, cy + 9 + bob, C.slag3, 1);
      // Elongated canine skull head & blazing crimson eye socket
      surf.ellipse(cx + 11 + stretch, cy + bob, 6, 4, C.bone3);
      surf.rect(cx + 12 + stretch, cy - 1 + bob, 2, 2, isAtk ? C.brass3 : C.blood2);
    }
  } else if (id === 'wire_kite') {
    // Stone Gargoyle Imp: winged gothic cathedral gargoyle with demon oculus & spiked penance chain
    if (isDead) {
      surf.ellipse(cx, cy + 8, 9, 4, C.slag1);
      surf.ellipse(cx - 4, cy + 7, 4, 3, C.bone1);
    } else {
      const wingY = f === 1 ? -10 : -3;
      // Leathery ribbed bat-gargoyle wings
      surf.line(cx - 3, cy - 4 + bob, cx - 15, cy + wingY, C.slag2, 2);
      surf.line(cx + 3, cy - 4 + bob, cx + 15, cy + wingY, C.slag2, 2);
      surf.ellipse(cx - 9, cy + wingY + 3, 6, 4, C.coat2);
      surf.ellipse(cx + 9, cy + wingY + 3, 6, 4, C.coat2);
      // Horned gargoyle torso & head with glowing crimson demon oculus
      surf.ellipse(cx, cy - 4 + bob, 6, 6, C.slag1);
      surf.line(cx - 4, cy - 9 + bob, cx - 7, cy - 13 + bob, C.bone2, 2); // left horn
      surf.line(cx + 4, cy - 9 + bob, cx + 7, cy - 13 + bob, C.bone2, 2); // right horn
      surf.rect(cx - 2, cy - 6 + bob, 4, 4, isAtk ? C.brass3 : C.blood2);
      surf.pset(cx - 1, cy - 6 + bob, C.bone3);
      // Whipping iron penance chain tail with spiked plumb weight
      const tailX = cx - 4 + (f % 2) * 6;
      surf.line(cx, cy + 2 + bob, tailX, cy + 11, C.slag3, 1);
      surf.rect(tailX - 1, cy + 10, 3, 3, C.rust2);
    }
  } else if (id === 'lye_leech') {
    // Bloated Blood-Leech: translucent venom-green mire parasite with circular lamprey maw
    if (isDead) {
      surf.ellipse(cx, cy + 8, 11, 3, C.bile1);
    } else {
      const w = f === 1 ? 13 : isAtk ? 15 : 11;
      surf.ellipse(cx, cy + 5, w, 6, C.bog2);
      surf.ellipse(cx - 2, cy + 4, w - 2, 5, C.bile1);
      surf.ellipse(cx - 3, cy + 2, w - 5, 3, C.bile2);
      // Circular lamprey maw with bone teeth
      surf.ellipse(cx + w - 2, cy + 5, 4, 4, C.soot);
      surf.pset(cx + w - 4, cy + 3, C.bone3);
      surf.pset(cx + w, cy + 3, C.bone3);
      surf.pset(cx + w - 4, cy + 7, C.bone3);
      surf.pset(cx + w, cy + 7, C.bone3);
    }
  } else if (id === 'sump_bat') {
    // Vampiric Crypt-Bat: nosferatu strigoi bat with clawed wing-thumbs & glowing venom sac
    if (isDead) {
      surf.ellipse(cx, cy + 7, 10, 4, C.bog1);
    } else {
      const wingY = f === 1 ? -9 : 3;
      surf.line(cx, cy - 3, cx - 15, cy + wingY, C.rust1, 2);
      surf.line(cx, cy - 3, cx + 15, cy + wingY, C.rust1, 2);
      surf.pset(cx - 15, cy + wingY - 1, C.bone3); // wing-thumb bone claw
      surf.pset(cx + 15, cy + wingY - 1, C.bone3);
      surf.ellipse(cx - 8, cy + (wingY >> 1), 6, 4, C.bog2);
      surf.ellipse(cx + 8, cy + (wingY >> 1), 6, 4, C.bog2);
      surf.ellipse(cx, cy + 3, 6, 6, C.bile2); // swollen venom sac
      surf.ellipse(cx, cy - 3, 5, 4, C.coat1);
      surf.line(cx - 3, cy - 6, cx - 5, cy - 10, C.coat2, 1); // vampire bat ear
      surf.line(cx + 3, cy - 6, cx + 5, cy - 10, C.coat2, 1);
      surf.pset(cx - 2, cy - 4, C.blood2);
      surf.pset(cx + 2, cy - 4, C.blood2);
    }
  } else if (id === 'rivet_tick') {
    // Skull-Carapace Bone-Spider: 6-legged catacomb arachnid carrying a horned skull shell
    if (isDead) {
      surf.ellipse(cx, cy + 8, 8, 4, C.bone1);
    } else {
      for (const lx of [-10, -4, 4, 10]) {
        surf.line(cx + (lx >> 1), cy + 2, cx + lx, cy + 10 + ((f + lx) % 2), C.slag3, 2);
      }
      surf.ellipse(cx, cy + bob, 8, 7, C.bone2);
      surf.ellipse(cx - 2, cy - 2 + bob, 5, 4, C.bone3);
      surf.rect(cx - 4, cy + 1 + bob, 8, 2, C.blood2); // crimson eye cluster
    }
  } else if (id === 'signal_mite') {
    // Will-o'-Wisp Soul-Lantern: floating wrought-iron cage skull wreathed in soulfire-cyan
    if (isDead) {
      surf.ellipse(cx, cy + 8, 6, 3, C.slag2);
    } else {
      surf.ellipse(cx, cy - 4 + bob, 9, 10, C.sig1);
      surf.ellipse(cx, cy - 2 + bob, 6, 6, C.bone2);
      surf.rect(cx - 3, cy - 3 + bob, 2, 2, C.sig2);
      surf.rect(cx + 1, cy - 3 + bob, 2, 2, C.sig2);
      surf.line(cx, cy - 14 + bob, cx, cy - 8 + bob, C.brass3, 2);
    }
  } else if (id === 'silt_mimic') {
    // Ossuary Coffer Mimic: gothic iron-and-bone reliquary chest with snapping fangs & bile tongue
    if (isDead) {
      surf.rect(cx - 9, cy + 4, 18, 6, C.rust1);
    } else {
      const open = isAtk ? 5 : f === 1 ? 2 : 0;
      surf.rect(cx - 10, cy + 1, 20, 9, C.rust1);
      surf.rect(cx - 10, cy - 6 - open, 20, 7, C.slag2);
      surf.rect(cx - 2, cy - 2 - open, 4, 4, C.brass2); // skull clasp
      if (open > 0) {
        surf.rect(cx - 8, cy - open, 16, open + 1, C.soot);
        for (let tx = -7; tx <= 7; tx += 4) {
          surf.pset(cx + tx, cy - open + 1, C.bone3);
        }
        surf.line(cx, cy, cx + 8, cy - 3, C.bile2, 2); // bile tongue
      }
    }
  } else if (id === 'cinder_crow') {
    // Ashen Carrion-Crow: undead raven with exposed bone-skull beak and hellfire-ember feathers
    if (isDead) {
      surf.ellipse(cx, cy + 8, 8, 3, C.coat0);
    } else {
      const wingY = f === 1 ? -10 : 2;
      surf.line(cx, cy - 2, cx - 14, cy + wingY, C.coat1, 3);
      surf.line(cx, cy - 2, cx + 14, cy + wingY, C.coat1, 3);
      surf.rect(cx - 15, cy + wingY - 1, 3, 3, C.rust3); // ember wingtips
      surf.rect(cx + 13, cy + wingY - 1, 3, 3, C.rust3);
      surf.ellipse(cx, cy, 5, 5, C.coat0);
      surf.ellipse(cx + 5, cy - 2, 4, 3, C.bone3); // bone skull beak
      surf.pset(cx + 3, cy - 3, C.blood2);
    }
  }

  surf.outlineRegion(ox, oy, 40, 40, C.soot);
}

// ============================================================================
// 4. ELITE ENEMIES (80x80 x 7 Frames: Move 2, Tell 1, Attack 2, Hurt 1, Dead 1)
// ============================================================================
function drawEliteEnemyFrame(surf, ox, oy, id, f) {
  const cx = ox + 40;
  const cy = oy + 46;
  const isDead = f === 6;
  const isTell = f === 2;
  const isAtk = f === 3 || f === 4;
  const bob = f === 1 ? -2 : 0;

  if (id === 'cleaver_hauler') {
    // Chained Crypt-Executioner Brute: horned iron-masked headsman dragging a spiked Iron-Maiden Coffin Reliquary (NO WHEELS)
    if (isDead) {
      surf.rect(cx - 26, cy + 12, 22, 10, C.slag1); // fallen coffin reliquary
      surf.rect(cx + 4, cy + 16, 22, 8, C.slag3); // fallen guillotine cleaver
    } else {
      // Spiked Iron-Maiden Coffin Reliquary dragged on ground (no wheels) + heavy dungeon chain
      surf.rect(cx - 32, cy - 10, 16, 28, C.slag1);
      surf.rect(cx - 30, cy - 8, 12, 24, C.rust1);
      surf.ellipse(cx - 24, cy - 2, 4, 5, C.bone3); // skull relief on coffin door
      surf.line(cx - 16, cy + 4, cx - 6, cy + 2, C.brass2, 2); // heavy chain
      // Towering hunched executioner brute in crimson leather & spiked pauldrons
      surf.ellipse(cx + 2, cy - 4 + bob, 14, 17, C.rust1);
      surf.ellipse(cx + 2, cy - 8 + bob, 12, 10, C.slag1);
      // Horned executioner iron mask head + glowing blood eyes
      surf.ellipse(cx + 5, cy - 20 + bob, 8, 8, C.slag2);
      surf.line(cx + 1, cy - 26 + bob, cx - 3, cy - 32 + bob, C.bone3, 2); // left horn
      surf.line(cx + 9, cy - 26 + bob, cx + 13, cy - 32 + bob, C.bone3, 2); // right horn
      surf.rect(cx + 7, cy - 21 + bob, 3, 2, C.blood2);
      // Colossal notched Guillotine Butcher's Cleaver
      const cleaverY = isTell ? cy - 30 : isAtk ? cy + 6 : cy - 10;
      surf.rect(cx + 13, cleaverY, 20, 12, C.slag3);
      surf.rect(cx + 13, cleaverY + 9, 20, 3, isTell ? C.brass3 : C.bone3);
    }
  } else if (id === 'lye_strider') {
    // Stilted Plague-Alchemist Cenobite: bone-stilt walker with glowing Bile-Alembic Censer & plague-doctor beak mask
    if (isDead) {
      surf.line(cx - 22, cy + 20, cx + 20, cy + 24, C.bone2, 3);
      surf.ellipse(cx, cy + 16, 12, 8, C.bog2);
    } else {
      const stride = f === 1 ? 5 : 0;
      // Tall bound bone-and-wrought-iron stilts
      surf.line(cx - 6 - stride, cy - 6, cx - 12 - stride, cy + 26, C.bone2, 3);
      surf.line(cx + 6 + stride, cy - 6, cx + 12 + stride, cy + 26, C.bone2, 3);
      // Dorsal glass Bile-Alembic Reliquary Censer on back
      surf.ellipse(cx - 8, cy - 18 + bob, 8, 11, C.bog2);
      surf.ellipse(cx - 8, cy - 16 + bob, 6, 7, isTell ? C.brass3 : C.bile2);
      // Robed torso & curved plague-doctor beak mask
      surf.ellipse(cx + 2, cy - 14 + bob, 9, 11, C.bog1);
      surf.ellipse(cx + 5, cy - 27 + bob, 6, 6, C.bone3); // skull cowl
      surf.line(cx + 9, cy - 27 + bob, cx + 19, cy - 24 + bob, C.bone2, 3); // curved plague beak
      surf.pset(cx + 8, cy - 28 + bob, C.blood2);
      if (isAtk) {
        surf.ellipse(cx + 23, cy - 22, 8, 5, C.bile2);
      }
    }
  } else if (id === 'flats_harvester') {
    // Bone-Scythe Reaver Wraith: four-armed horned skeletal reaper grafted onto skittering bone-centipede legs (NO TREADS/DRUM)
    if (isDead) {
      surf.ellipse(cx, cy + 14, 22, 9, C.bone1);
      surf.line(cx - 16, cy + 12, cx + 16, cy + 16, C.blood2, 2);
    } else {
      // Articulated bone-centipede lower body & skittering scythe-talons
      surf.ellipse(cx, cy + 10, 20, 8, C.slag1);
      for (let lx = -16; lx <= 16; lx += 8) {
        const legLift = ((f + (lx >> 3)) & 1) * 3;
        surf.line(cx + lx, cy + 12, cx + lx - 3, cy + 24 - legLift, C.bone2, 2);
      }
      // Horned skeletal wraith-lord upper torso in tattered crimson mantle
      surf.ellipse(cx - 2, cy - 6 + bob, 11, 13, C.rust1);
      surf.ellipse(cx - 1, cy - 20 + bob, 7, 7, C.bone3); // skull head
      surf.rect(cx - 5, cy - 27 + bob, 9, 3, C.brass3); // crown
      surf.pset(cx + 2, cy - 20 + bob, C.blood2);
      // Four whirling blood-stained crescent war-scythes
      const spin = isAtk ? 8 : isTell ? -5 : 0;
      const bladeCol = isTell ? C.brass3 : C.blood2;
      surf.line(cx + 4, cy - 10, cx + 26 + spin, cy - 22, C.bone3, 2);
      surf.line(cx + 22 + spin, cy - 24, cx + 30 + spin, cy - 8, bladeCol, 3); // upper front scythe
      surf.line(cx + 4, cy + 2, cx + 28 + spin, cy + 6, C.bone3, 2);
      surf.line(cx + 24 + spin, cy + 2, cx + 30 + spin, cy + 18, bladeCol, 3); // lower front scythe
      surf.line(cx - 6, cy - 8, cx - 24, cy - 20 - spin, C.bone2, 2);
      surf.line(cx - 22, cy - 22 - spin, cx - 28, cy - 8 - spin, bladeCol, 2); // back scythe
    }
  } else if (id === 'plate_marshal') {
    // Dread Cathedral Templar: towering undead fallen paladin with skull-embossed tower shield & broadsword
    if (isDead) {
      surf.rect(cx - 18, cy + 16, 36, 8, C.slag2);
    } else {
      surf.ellipse(cx - 2, cy - 4 + bob, 14, 18, C.slag1);
      surf.ellipse(cx - 2, cy - 22 + bob, 8, 8, C.slag3); // horned greathelm
      surf.line(cx - 8, cy - 26 + bob, cx - 12, cy - 33 + bob, C.bone3, 2);
      surf.line(cx + 4, cy - 26 + bob, cx + 8, cy - 33 + bob, C.bone3, 2);
      surf.rect(cx - 1, cy - 22 + bob, 5, 2, isTell ? C.brass3 : C.blood2);
      // Skull-Embossed Cathedral Tower Shield in front
      const shX = cx + 8 + (isAtk ? 6 : 0);
      surf.rect(shX, cy - 18, 12, 34, C.slag2);
      surf.rect(shX + 2, cy - 14, 8, 26, C.rust1);
      surf.ellipse(shX + 6, cy - 2, 3, 4, C.bone3); // shield skull boss
      // Runed Broadsword
      surf.line(cx - 8, cy - 12, cx - 22, cy - (isTell ? 34 : 26), C.slag3, 4);
    }
  } else if (id === 'switchback_driver') {
    // Nightmare Hell-Steed Outrider: Death-Knight cavalier on a 4-legged Skeletal Nightmare Warhorse (NO WHEELS)
    if (isDead) {
      surf.ellipse(cx, cy + 14, 22, 9, C.bone1);
    } else {
      const shift = isAtk ? 8 : 0;
      const gallop = f % 2 === 0 ? -4 : 4;
      // 4 skeletal warhorse legs with hellfire-orange hooves
      for (const lx of [-14, -5, 6, 15]) {
        const legX = cx + lx + shift + (lx < 0 ? -gallop : gallop);
        surf.line(cx + lx + shift, cy + 6, legX, cy + 23, C.bone2, 2);
        surf.rect(legX - 2, cy + 21, 4, 3, C.rust3); // hellfire hoof
      }
      // Armored Skeletal Nightmare Warhorse body & horned skull head
      surf.ellipse(cx + shift, cy + 2, 18, 9, C.slag1);
      surf.ellipse(cx + shift, cy + 1, 14, 6, C.rust1); // crimson barding
      surf.ellipse(cx + 18 + shift, cy - 8 + bob, 7, 5, C.bone3); // horse skull
      surf.pset(cx + 20 + shift, cy - 9 + bob, C.rust3); // blazing eye
      // Death-Knight rider torso & couched barbed war-lance
      surf.ellipse(cx - 2 + shift, cy - 12 + bob, 8, 11, C.coat2);
      surf.ellipse(cx - 1 + shift, cy - 23 + bob, 6, 6, C.slag3);
      surf.line(cx - 10 + shift, cy - 8, cx + 32 + shift, cy - 8, isTell ? C.brass3 : C.bone3, 3); // war-lance
    }
  } else if (id === 'sump_cantor') {
    // Mire Hex-Chanter: antler-crowned swamp high priest swinging a 3-bell Plague Carillon Crozier
    if (isDead) {
      surf.ellipse(cx, cy + 16, 18, 7, C.bog1);
    } else {
      surf.ellipse(cx - 2, cy - 2 + bob, 14, 18, C.bog1);
      surf.ellipse(cx, cy - 18 + bob, 8, 8, C.bone3); // stag-skull mask
      surf.line(cx - 4, cy - 24 + bob, cx - 10, cy - 32 + bob, C.bone2, 2); // left antler
      surf.line(cx + 4, cy - 24 + bob, cx + 10, cy - 32 + bob, C.bone2, 2); // right antler
      surf.line(cx + 12, cy + 18, cx + 16, cy - 26, C.wood, 3); // crozier staff
      surf.ellipse(cx + 20, cy - 22, 6, 7, isTell ? C.sig2 : C.brass3); // plague bell
      if (isAtk) {
        surf.ellipse(cx + 20, cy - 22, 12, 12, C.bile2);
      }
    }
  } else if (id === 'bore_sentinel') {
    // Ash-Burrower Wyrmling: subterranean obsidian-and-bone drake bursting from crimson ash collar
    if (isDead) {
      surf.ellipse(cx, cy + 16, 22, 8, C.rust1);
    } else {
      surf.ellipse(cx, cy + 18, 24, 8, C.rust2); // crimson ash crater
      for (let s = 0; s < 3; s++) {
        surf.ellipse(cx - 4 + s * 4, cy + 8 - s * 10 + bob, 12 - s, 9, s % 2 === 0 ? C.slag1 : C.bone2);
      }
      surf.ellipse(cx + 8, cy - 18 + bob, 9, 7, isTell || isAtk ? C.brass3 : C.rust3);
      surf.line(cx + 4, cy - 24 + bob, cx - 2, cy - 30 + bob, C.bone3, 2); // drake horn
    }
  }

  surf.outlineRegion(ox, oy, 80, 80, C.blood2);
}

// ============================================================================
// 5. BOSSES (9 Frames Each — 100% Pure Gothic Dark Fantasy Sovereign Entities)
// ============================================================================
function drawBossFrame(surf, ox, oy, w, h, id, f) {
  const cx = ox + (w >> 1);
  const cy = oy + (h >> 1) + 10;
  const isDead = f >= 7;
  const isPhase = f === 6;
  const isAtkA = f === 2 || f === 3;
  const isAtkB = f === 4 || f === 5;
  const bob = f % 2 === 1 ? -2 : 0;

  if (id === 'the_foreman') {
    // High Executioner Malgorth: Gargantuan Undead Ossuary Bone-Colossus & Cathedral Executioner Lord (NO EXCAVATOR/TREADS)
    if (!isDead) {
      // Shadow & two massive armored obsidian-and-bone pillar legs with clawed sabatons
      surf.ellipse(cx, cy + 44, 62, 12, C.coat0);
      surf.rect(cx - 38, cy + 10, 24, 34, C.slag1);
      surf.rect(cx + 14, cy + 10, 24, 34, C.slag1);
      surf.rect(cx - 42, cy + 36, 30, 10, C.bone2); // left bone-claw sabaton
      surf.rect(cx + 12, cy + 36, 30, 10, C.bone2); // right bone-claw sabaton
      // Tattered crimson inquisitor banner-fauld between legs
      surf.rect(cx - 14, cy + 12, 28, 28, C.rust1);
      surf.rect(cx - 10, cy + 14, 20, 22, C.rust2);

      // Gargantuan Ossuary Reliquary Torso & Giant Bleached Titan Ribcage
      surf.ellipse(cx, cy - 12 + bob, 48, 32, C.slag1);
      surf.ellipse(cx, cy - 12 + bob, 36, 24, isPhase ? C.sig2 : C.rust1); // necromantic soul-furnace core
      for (let ry = -28; ry <= 4; ry += 8) {
        surf.line(cx - 38, cy + ry + bob, cx - 8, cy + ry + 3 + bob, C.bone3, 4); // left titan ribs
        surf.line(cx + 8, cy + ry + 3 + bob, cx + 38, cy + ry + bob, C.bone3, 4); // right titan ribs
      }
      // Spiked gothic cathedral pauldrons & dorsal ossuary spires
      surf.ellipse(cx - 44, cy - 28 + bob, 16, 12, C.slag2);
      surf.ellipse(cx + 44, cy - 28 + bob, 16, 12, C.slag2);
      surf.line(cx - 48, cy - 36 + bob, cx - 56, cy - 52 + bob, C.bone3, 4);
      surf.line(cx + 48, cy - 36 + bob, cx + 56, cy - 52 + bob, C.bone3, 4);

      // Crowned Horned Skull Head of High Executioner Malgorth
      surf.ellipse(cx, cy - 48 + bob, 15, 14, C.bone3);
      surf.rect(cx - 14, cy - 62 + bob, 28, 7, C.brass2); // jagged sanctum-gold crown
      surf.pset(cx - 10, cy - 65 + bob, C.brass3);
      surf.pset(cx, cy - 67 + bob, C.brass3);
      surf.pset(cx + 10, cy - 65 + bob, C.brass3);
      surf.rect(cx - 7, cy - 49 + bob, 4, 4, isPhase ? C.sig2 : C.blood2); // left blazing eye
      surf.rect(cx + 3, cy - 49 + bob, 4, 4, isPhase ? C.sig2 : C.blood2); // right blazing eye

      // Right Arm: Colossal Rune-Carved Cathedral Guillotine Greataxe
      const axeDrop = isAtkA ? 28 : isPhase ? -14 : 0;
      surf.line(cx + 36, cy - 24 + bob, cx + 68, cy - 44 + axeDrop, C.slag3, 6);
      surf.rect(cx + 54, cy - 48 + axeDrop, 28, 32, C.slag2);
      surf.rect(cx + 76, cy - 48 + axeDrop, 6, 32, isPhase ? C.sig2 : C.bone3); // razor guillotine edge

      // Left Arm: Chained Spiked Iron-Maiden Censer Flail
      const swingX = isAtkB ? -22 : 0;
      surf.line(cx - 38, cy - 24 + bob, cx - 66 + swingX, cy + 8, C.brass2, 3);
      surf.ellipse(cx - 66 + swingX, cy + 20, 15, 16, C.slag1);
      surf.ellipse(cx - 66 + swingX, cy + 20, 9, 10, isPhase ? C.sig2 : C.blood2);
    } else {
      // Shattered bone-colossus ribcage and fallen gold crown
      surf.ellipse(cx, cy + 24, 56, 18, C.bone1);
      surf.rect(cx - 12, cy + 14, 24, 6, C.brass2);
    }
  } else if (id === 'big_axle') {
    // Dread Cavalier Varkos: Gargantuan Six-Legged Skeletal Nightmare Centaur-Archfiend (ZERO WHEELS / ZERO TRUCK)
    const shift = isAtkA ? 14 : 0;
    if (!isDead) {
      surf.ellipse(cx + shift, cy + 36, 86, 12, C.coat0); // ground shadow

      // 6 Articulated Skeletal Nightmare Warhorse Legs with Blazing Hellfire Cloven Hooves (NO WHEELS)
      const legOffsets = [-68, -44, -18, 8, 34, 58];
      for (let i = 0; i < legOffsets.length; i++) {
        const lx = cx + legOffsets[i] + shift;
        const stride = ((f + i) % 2 === 0 ? -6 : 6) * (isAtkA ? 1.5 : 1);
        const kneeX = lx + Math.round(stride * 0.5);
        const hoofX = lx + Math.round(stride);
        surf.line(lx, cy + 6, kneeX, cy + 22, C.bone2, 5); // upper femur bone
        surf.line(kneeX, cy + 22, hoofX, cy + 36, C.bone3, 4); // lower cannon bone
        // Cloven iron hoof wreathed in hellfire-orange flames
        surf.rect(hoofX - 5, cy + 33, 10, 6, C.rust2);
        surf.rect(hoofX - 4, cy + 35, 8, 4, isPhase ? C.blood2 : C.brass3);
      }

      // Whipping Skeletal Tail with Crimson Hellfire Plume on Rear Left
      surf.line(cx - 74 + shift, cy - 8 + bob, cx - 98 + shift, cy + 8 - bob, C.bone2, 4);
      surf.ellipse(cx - 98 + shift, cy + 8 - bob, 8, 5, C.rust3);

      // Elongated Six-Legged Nightmare Stallion Body Armored in Spiked Black-Iron & Crimson Cataphract Barding
      surf.ellipse(cx - 14 + shift, cy - 4 + bob, 66, 20, C.slag1);
      surf.ellipse(cx - 14 + shift, cy - 6 + bob, 58, 15, C.rust1);
      // Exposed giant bleached rib-arches along the beast's flank
      for (let rx = -58; rx <= 26; rx += 14) {
        surf.line(cx + rx + shift, cy - 18 + bob, cx + rx - 3 + shift, cy + 8 + bob, C.bone3, 3);
      }
      // Horned Demon-Skull Breast-Ram at the Centaur Prow (front right)
      surf.ellipse(cx + 54 + shift, cy - 6 + bob, 16, 15, C.slag2);
      surf.ellipse(cx + 58 + shift, cy - 6 + bob, 11, 10, C.bone2);
      surf.line(cx + 62 + shift, cy - 14 + bob, cx + 82 + shift, cy - 24 + bob, C.bone3, 4); // prow tusk-horn
      surf.line(cx + 62 + shift, cy + 2 + bob, cx + 82 + shift, cy + 10 + bob, C.bone3, 4);
      surf.rect(cx + 62 + shift, cy - 9 + bob, 5, 5, isPhase ? C.blood2 : C.brass3); // blazing demon-prow eye

      // Varkos's Towering Horned Death-Knight Sovereign Upper Torso rising from the Centaur Shoulders
      surf.ellipse(cx + 32 + shift, cy - 32 + bob, 22, 20, C.slag2);
      // Flowing tattered crimson war-cape behind Varkos
      surf.ellipse(cx + 6 + shift, cy - 30 + bob, 24, 12, C.rust2);
      // Overheated Exposed Hellfire Soul-Furnace Heart in Varkos's Chest
      surf.ellipse(cx + 36 + shift, cy - 30 + bob, isPhase ? 12 : 7, isPhase ? 12 : 7, isPhase ? C.blood2 : C.rust3);
      if (isPhase) {
        surf.ellipse(cx + 36 + shift, cy - 30 + bob, 6, 6, C.brass3);
      }
      // Crowned Winged-Horn Death-Knight Greathelm
      surf.ellipse(cx + 34 + shift, cy - 54 + bob, 12, 11, C.slag3);
      surf.line(cx + 26 + shift, cy - 60 + bob, cx + 12 + shift, cy - 72 + bob, C.bone3, 4); // great curved horn
      surf.line(cx + 42 + shift, cy - 60 + bob, cx + 56 + shift, cy - 72 + bob, C.bone3, 4);
      surf.rect(cx + 34 + shift, cy - 55 + bob, 8, 3, C.blood2); // glowing visor slit

      // Colossal Executioner's Dread-Halberd couched forward & Chained Skull-Flail
      const lanceReach = isAtkA ? 98 : 86;
      surf.line(cx + 12 + shift, cy - 28 + bob, cx + lanceReach + shift, cy - 26 + bob, C.bone3, 4);
      surf.ellipse(cx + lanceReach - 8 + shift, cy - 26 + bob, 12, 9, isPhase ? C.blood2 : C.brass3); // crescent halberd blade
      if (isAtkB) {
        surf.line(cx + 18 + shift, cy - 34 + bob, cx - 48 + shift, cy - 48, C.brass2, 3);
        surf.ellipse(cx - 52 + shift, cy - 48, 12, 12, C.bone3);
      }
    } else {
      // Defeated collapsed skeletal centaur-archfiend bones & broken halberd
      surf.ellipse(cx, cy + 20, 72, 16, C.bone1);
      surf.ellipse(cx + 24, cy + 16, 26, 12, C.rust1);
    }
  } else if (id === 'mother_sump') {
    // Bog-Matriarch Hagra: Eldritch Swamp Hag-Queen & Translucent Leech-Brood Mother (NO CHEMICAL DRUMS)
    surf.ellipse(cx, cy + 32, 78, 22, C.bog1); // dark bubbling mire pool
    if (!isDead) {
      // Writhing lamprey-leech tentacles radiating from the mire
      for (const tx of [-58, -38, 38, 58]) {
        const waveY = ((f + (tx > 0 ? 1 : 0)) % 2 === 0 ? -8 : 6);
        surf.line(cx + (tx >> 1), cy + 16, cx + tx, cy - 6 + waveY, C.bog2, 6);
        surf.ellipse(cx + tx, cy - 6 + waveY, 6, 6, C.soot);
        surf.pset(cx + tx - 2, cy - 8 + waveY, C.bone3); // lamprey teeth
        surf.pset(cx + tx + 2, cy - 4 + waveY, C.bone3);
      }
      // Colossal pulsing translucent Bile-Green Brood-Sac Abdomen
      const sacR = isAtkA || isPhase ? 38 : 32;
      surf.ellipse(cx + 10, cy + 6 + bob, sacR + 8, sacR - 4, C.bog2);
      surf.ellipse(cx + 12, cy + 4 + bob, sacR, sacR - 8, C.bile1);
      surf.ellipse(cx + 14, cy + 2 + bob, sacR - 8, sacR - 14, isPhase ? C.blood2 : C.bile2);
      surf.ellipse(cx + 8, cy - 2 + bob, 10, 8, C.bone3); // glowing brood embryos inside sac

      // Upper Torso: Four-Armed Antler-Crowned Swamp Hag-Queen in Moss Shawls & Skull Fetishes
      surf.ellipse(cx - 18, cy - 16 + bob, 22, 26, C.bog1);
      surf.ellipse(cx - 18, cy - 42 + bob, 13, 12, C.bone3); // bleached stag-skull crone mask
      // Giant twisted bone antlers & hanging gold coven talismans
      surf.line(cx - 26, cy - 48 + bob, cx - 52, cy - 68 + bob, C.bone2, 4);
      surf.line(cx - 10, cy - 48 + bob, cx + 16, cy - 68 + bob, C.bone2, 4);
      surf.ellipse(cx - 46, cy - 56 + bob, 4, 5, C.brass3);
      surf.ellipse(cx + 10, cy - 56 + bob, 4, 5, C.brass3);
      surf.rect(cx - 23, cy - 43 + bob, 4, 4, C.bile2); // glowing witch eyes
      surf.rect(cx - 15, cy - 43 + bob, 4, 4, C.bile2);
    } else {
      surf.ellipse(cx, cy + 24, 68, 16, C.bile1);
    }
  } else if (id === 'the_long_dry') {
    // Catacomb Elder-Wyrm Skarath: Subterranean Undead Bone-And-Obsidian Elder Dragon Wyrm (NO PIPES/DRILLS)
    surf.ellipse(cx, cy + 44, 96, 18, C.rust1); // crimson catacomb ash crater
    if (!isDead) {
      const arch = isAtkA ? -16 : isAtkB ? 12 : 0;
      // Sinuous dragon-wyrm spine of giant bleached vertebrae & 3 obsidian-and-gold carapace plates
      for (let seg = 0; seg < 6; seg++) {
        const sx = cx - 68 + seg * 26;
        const sy = cy + 26 - Math.sin((seg / 5) * Math.PI) * (64 - arch);
        // Bleached dragon vertebra segment & curved rib-horns
        surf.ellipse(sx, sy, 22, 20, C.bone2);
        surf.ellipse(sx - 3, sy - 3, 15, 13, C.bone3);
        surf.line(sx, sy - 18, sx - 10, sy - 32, C.bone3, 4); // dorsal dragon spine-fin
        // 3 Breakable Obsidian-and-Gold Carapace Plates on segments 1, 2, 3
        if (seg >= 1 && seg <= 3 && !isPhase) {
          surf.ellipse(sx, sy - 6, 18, 12, C.slag1);
          surf.rect(sx - 6, sy - 10, 12, 4, C.brass3); // sanctum-gold rune seal
        }
      }
      // Horned Draconic Skull with 4 Splitting Mandibles & Blazing Hellfire Gullet
      const hx = cx + 64;
      const hy = cy - 10 + arch;
      surf.ellipse(hx, hy, 26, 22, C.bone3);
      surf.ellipse(hx - 6, hy - 4, 18, 14, C.slag1); // armored dragon brow
      // Swept-back elder dragon horns
      surf.line(hx - 8, hy - 14, hx - 36, hy - 34, C.bone3, 5);
      surf.line(hx - 4, hy + 14, hx - 28, hy + 28, C.bone2, 4);
      // Gaping molten hellfire dragon maw & jagged bone fangs
      surf.ellipse(hx + 8, hy + 2, 14, 14, C.soot);
      surf.ellipse(hx + 8, hy + 2, 9, 9, isPhase ? C.blood2 : C.rust3);
      surf.ellipse(hx + 8, hy + 2, 5, 5, C.brass3);
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        surf.ellipse(hx + 8 + Math.cos(ang) * 15, hy + 2 + Math.sin(ang) * 15, 4, 3, C.bone3); // dragon fangs
      }
    } else {
      surf.ellipse(cx, cy + 36, 86, 14, C.bone1);
    }
  }
  surf.outlineRegion(ox, oy, w, h, C.brass3);
}

// ============================================================================
// 6. COMBAT VFX & PROJECTILES (11 Strips)
// ============================================================================
function drawFxStrip(surf, spec) {
  const { id, frameWidth: fw, frameHeight: fh, frameCount: fc } = spec;
  for (let f = 0; f < fc; f++) {
    const ox = f * fw;
    const cx = ox + (fw >> 1);
    const cy = fh >> 1;

    if (id === 'fx_slash_smear') {
      const r = 28 + f * 6;
      const span = 1.45 - f * 0.18;
      for (let a = -span; a <= span; a += 0.015) {
        const thick = Math.max(1, Math.round((1 - Math.abs(a) / span) * (11 - f * 1.6)));
        for (let t = -thick; t <= thick; t++) {
          const px = cx + Math.cos(a) * (r + t);
          const py = cy + Math.sin(a) * ((r + t) * 0.72);
          surf.pset(px, py, Math.abs(t) >= thick - 1 ? C.sig1 : Math.abs(t) >= thick - 2 ? C.sig2 : C.bone3);
        }
      }
    } else if (id === 'fx_dash_streak') {
      const len = 132 - f * 24;
      for (let i = 0; i < 6; i++) {
        const ly = 8 + i * 6;
        surf.line(ox + 12 + f * 14, ly, ox + 12 + len, ly, i % 2 === 0 ? C.sig2 : C.bone3, 2);
      }
    } else if (id === 'fx_hit_cross') {
      const arm = 18 - f * 4;
      surf.line(cx - arm, cy - arm, cx + arm, cy + arm, C.sig2, 3);
      surf.line(cx - arm, cy + arm, cx + arm, cy - arm, C.bone3, 3);
    } else if (id === 'fx_shards') {
      const dist = 6 + f * 6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + f * 0.3;
        surf.rect(cx + Math.cos(a) * dist - 2, cy + Math.sin(a) * dist - 2, 4, 4, i % 2 === 0 ? C.bone3 : C.rust3);
      }
    } else if (id === 'fx_shock_ring') {
      const rx = 24 + f * 18;
      const ry = Math.round(rx * 0.65);
      for (let a = 0; a < Math.PI * 2; a += 0.018) {
        const px = cx + Math.cos(a) * rx;
        const py = cy + Math.sin(a) * ry;
        surf.rect(px - 1, py - 1, 3, 3, C.sig2);
        surf.pset(px, py, C.bone3);
      }
    } else if (id === 'fx_ground_cracks') {
      for (let ray = 0; ray < 8; ray++) {
        const a = (ray / 8) * Math.PI * 2 + f * 0.4;
        surf.line(cx, cy, cx + Math.cos(a) * 76, cy + Math.sin(a) * 52, C.soot, 4);
        surf.line(cx, cy, cx + Math.cos(a) * 72, cy + Math.sin(a) * 48, C.sig2, 2);
      }
    } else if (id === 'fx_dust_puff') {
      const r = 14 - f * 2;
      surf.ellipse(cx - 4 + f * 2, cy, r, r - 2, C.slag2);
      surf.ellipse(cx + 3, cy - 2, r - 3, r - 4, C.rust2);
      surf.ellipse(cx - 1, cy - 3, Math.max(2, r - 6), Math.max(2, r - 6), C.bone2);
    } else if (id === 'rail_spike') {
      const angles = [0, Math.PI / 4, Math.PI / 2, -Math.PI / 4];
      const ang = angles[f] || 0;
      const dx = Math.cos(ang) * 6;
      const dy = Math.sin(ang) * 6;
      surf.line(cx - dx, cy - dy, cx + dx, cy + dy, C.slag3, 3);
      surf.rect(cx + dx - 1, cy + dy - 1, 3, 3, C.sig2);
      surf.pset(cx + dx, cy + dy, C.bone3);
    } else if (id === 'fx_spark') {
      const r = 4 + f * 3;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        surf.line(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, f === 0 ? C.bone3 : C.sig2, 2);
      }
    } else if (id === 'ultimate_cutin') {
      surf.rect(0, 0, fw, fh, C.soot);
      for (let y = 0; y < fh; y += 4) {
        surf.line(0, y, fw, y, y % 8 === 0 ? C.slag1 : C.coat1, 1);
      }
      surf.rect(0, 0, fw, 4, C.sig2);
      surf.rect(0, fh - 4, fw, 4, C.sig2);
      surf.ellipse(240, 60, 140, 48, C.skin2);
      surf.rect(60, 8, 360, 24, C.rust2);
      surf.ellipse(185, 62, 24, 12, C.soot);
      surf.ellipse(295, 62, 24, 12, C.soot);
      surf.ellipse(185, 62, 12, 9, C.sig2);
      surf.ellipse(295, 62, 12, 9, C.sig2);
      surf.rect(180, 58, 5, 5, C.bone3);
      surf.rect(290, 58, 5, 5, C.bone3);
    } else if (id === 'fx_ult_slash') {
      surf.line(ox + 8, cy + (f - 1) * 6, ox + fw - 8, cy - (f - 1) * 6, C.sig2, 5);
      surf.line(ox + 16, cy + (f - 1) * 6, ox + fw - 16, cy - (f - 1) * 6, C.bone3, 2);
    }
  }
}

// ============================================================================
// 7. WORLD GROUND TILES (6 Strips, Low-Contrast High-Readability)
// ============================================================================
function drawTileStrip(surf, spec) {
  const { id, frameWidth: fw, frameHeight: fh, frameCount: fc } = spec;
  for (let f = 0; f < fc; f++) {
    const ox = f * fw;
    let base = C.coat1;
    let p1 = C.coat2;
    let p2 = C.rust0;
    if (id === 'tile_kettle') {
      base = C.coat1;
      p1 = C.rust0;
      p2 = C.slag1;
    } else if (id === 'tile_slab_town') {
      base = C.slag1;
      p1 = C.slag0;
      p2 = C.bone0;
    } else if (id === 'tile_route_9') {
      base = C.soot;
      p1 = C.slag0;
      p2 = f === 1 ? C.brass1 : C.coat1;
    } else if (id === 'tile_lye_marsh') {
      base = C.bog0;
      p1 = C.bog1;
      p2 = C.bile0;
    } else if (id === 'tile_copper_flats') {
      base = C.rust0;
      p1 = C.rust1;
      p2 = C.rust2;
    } else if (id === 'tile_transitions') {
      const pairs = [
        [C.coat1, C.slag1],
        [C.slag1, C.soot],
        [C.soot, C.bog0],
        [C.bog0, C.rust0],
        [C.rust0, C.coat1],
        [C.slag1, C.bog0],
      ];
      const [cA, cB] = pairs[f % pairs.length];
      for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
          const useB = x + ((y * 3) % 5) > 8;
          surf.pset(ox + x, y, useB ? cB : cA);
        }
      }
      continue;
    }

    surf.rect(ox, 0, fw, fh, base);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const h = (x * 37 + y * 17 + f * 53) & 0xff;
        if (h < 38) surf.pset(ox + x, y, p1);
        else if (h > 232) surf.pset(ox + x, y, p2);
      }
    }
    if (id === 'tile_route_9' && f === 1) {
      surf.rect(ox + 7, 2, 2, 12, C.brass1);
    }
  }
}

// ============================================================================
// 8. BESPOKE 40 WORLD PROPS ACROSS 5 REGIONS (Every Single Prop Individually Drawn)
// ============================================================================
function drawPropStrip(surf, spec) {
  const { id, frameWidth: fw, frameHeight: fh, frameCount: fc } = spec;
  for (let f = 0; f < fc; f++) {
    const ox = f * fw;
    const cx = ox + (fw >> 1);
    const by = fh - 5;

    // Baked ground shadow ellipse (except fog patch)
    if (id !== 'prop_marsh_fog_patch') {
      surf.ellipse(cx, by, Math.max(10, (fw >> 1) - 5), Math.max(3, Math.floor(fh * 0.13)), C.soot);
    }

    switch (id) {
      // --- KETTLE (8 PROPS) ---
      case 'prop_kettle_boiler_tower':
        surf.rect(cx - 28, 10, 56, by - 12, C.slag1);
        surf.rect(cx - 24, 14, 48, by - 18, C.rust1);
        surf.rect(cx - 18, 18, 28, by - 24, C.rust2);
        surf.rect(cx - 12, by - 24, 24, 16, C.brass2); // furnace grate
        surf.rect(cx - 8, by - 20, 16, 10, C.brass3);
        surf.ellipse(cx, 26, 8, 8, C.sig2); // waystone seal
        break;
      case 'prop_kettle_shack':
        surf.rect(cx - 28, by - 34, 56, 30, C.wood);
        surf.rect(cx - 32, by - 44, 64, 14, C.rust1);
        surf.rect(cx - 28, by - 42, 56, 8, C.rust2);
        surf.rect(cx - 10, by - 22, 16, 18, C.soot);
        surf.rect(cx + 12, by - 24, 6, 6, C.brass3); // forge lantern
        break;
      case 'prop_kettle_campfire': {
        surf.ellipse(cx, by - 3, 10, 5, C.slag2);
        const flameH = 9 + (f % 3) * 2;
        surf.ellipse(cx, by - 5 - (flameH >> 1), 6, flameH >> 1, C.rust3);
        surf.ellipse(cx + (f - 1), by - 5 - (flameH >> 1), 3, (flameH >> 1) - 1, C.brass3);
        break;
      }
      case 'prop_kettle_signs':
        surf.rect(cx - 2, 8, 4, by - 9, C.wood);
        surf.rect(cx - 12, 12, 22, 5, C.rust2);
        surf.rect(cx - 10, 20, 20, 5, C.bone2);
        surf.rect(cx - 11, 28, 18, 5, C.slag2);
        break;
      case 'prop_kettle_crates':
        surf.rect(cx - 14, by - 16, 16, 14, C.wood);
        surf.rect(cx - 2, by - 14, 16, 12, C.slag2);
        surf.rect(cx - 8, by - 26, 14, 12, C.rust2);
        surf.pset(cx - 12, by - 14, C.brass3);
        surf.pset(cx + 10, by - 12, C.brass3);
        break;
      case 'prop_kettle_barrels':
        surf.ellipse(cx - 5, by - 10, 6, 9, C.rust1);
        surf.ellipse(cx + 5, by - 8, 6, 8, C.slag2);
        surf.line(cx - 10, by - 10, cx, by - 10, C.slag3, 1);
        surf.pset(cx - 5, by - 16, C.brass3);
        break;
      case 'prop_kettle_tent':
        for (let y = 0; y < 28; y++) {
          const w = 8 + y * 1.6;
          surf.rect(cx - (w >> 1), by - 32 + y, w, 1, y < 14 ? C.bone2 : C.bone1);
        }
        surf.rect(cx - 6, by - 16, 12, 12, C.soot);
        surf.rect(cx + 8, by - 18, 3, 3, C.brass3);
        break;
      case 'prop_kettle_bench':
        surf.rect(cx - 18, by - 14, 36, 6, C.wood);
        surf.rect(cx - 15, by - 8, 4, 7, C.slag1);
        surf.rect(cx + 11, by - 8, 4, 7, C.slag1);
        surf.rect(cx - 12, by - 19, 7, 5, C.slag3); // vise
        surf.rect(cx + 4, by - 17, 6, 3, C.brass2); // calipers
        break;

      // --- SLAB TOWN / OSSUARY NAVE (8 PROPS) ---
      case 'prop_slab_collapsed_wall':
        surf.rect(cx - 32, by - 36, 48, 32, C.slag1);
        surf.rect(cx - 28, by - 32, 36, 22, C.slag2);
        surf.line(cx + 16, by - 32, cx + 28, by - 44, C.rust2, 2); // rebar
        surf.line(cx + 16, by - 20, cx + 30, by - 26, C.rust2, 2);
        break;
      case 'prop_slab_rebar_pile':
        surf.ellipse(cx, by - 8, 16, 8, C.slag1);
        surf.line(cx - 14, by - 4, cx + 12, by - 24, C.rust2, 2);
        surf.line(cx + 14, by - 4, cx - 10, by - 26, C.rust3, 2);
        surf.line(cx - 4, by - 2, cx + 6, by - 28, C.slag3, 2);
        break;
      case 'prop_slab_dead_mall_sign':
        surf.rect(cx - 16, by - 46, 32, 42, C.slag1);
        surf.rect(cx - 12, by - 42, 24, 30, C.rust1);
        surf.rect(cx - 8, by - 34, 16, 14, C.sig1); // rune casing
        break;
      case 'prop_slab_rubble_heap':
        surf.ellipse(cx, by - 10, 20, 10, C.slag1);
        surf.ellipse(cx - 5, by - 12, 12, 7, C.slag2);
        surf.ellipse(cx + 6, by - 8, 5, 5, C.bone2); // skull in rubble
        break;
      case 'prop_slab_bent_streetlight':
        surf.line(cx - 4, by - 2, cx - 4, by - 44, C.slag2, 3);
        surf.line(cx - 4, by - 44, cx + 10, by - 54, C.slag2, 3);
        surf.rect(cx + 8, by - 52, 6, 8, C.brass2);
        break;
      case 'prop_slab_shopping_cart':
        surf.rect(cx - 10, by - 16, 20, 12, C.slag3);
        surf.rect(cx - 8, by - 14, 16, 8, C.rust1);
        surf.ellipse(cx - 6, by - 3, 3, 3, C.soot);
        surf.ellipse(cx + 6, by - 3, 3, 3, C.soot);
        break;
      case 'prop_slab_vending_machine':
        surf.rect(cx - 13, by - 42, 26, 38, C.slag1);
        surf.rect(cx - 10, by - 38, 20, 22, C.rust1);
        surf.rect(cx - 7, by - 34, 14, 14, C.soot);
        surf.line(cx - 4, by - 30, cx + 4, by - 22, C.sig2, 1);
        break;
      case 'prop_slab_broken_stairs':
        for (let s = 0; s < 5; s++) {
          surf.rect(cx - 22 + s * 4, by - 8 - s * 7, 36 - s * 4, 7, s % 2 === 0 ? C.slag2 : C.slag1);
        }
        break;

      // --- ROUTE 9 / GALLOWS CAUSEWAY (8 PROPS) ---
      case 'prop_route9_burnt_car':
        surf.rect(cx - 26, by - 18, 52, 14, C.rust1);
        surf.rect(cx - 16, by - 28, 30, 12, C.slag1);
        surf.ellipse(cx - 16, by - 4, 6, 6, C.coat0);
        surf.ellipse(cx + 16, by - 4, 6, 6, C.coat0);
        break;
      case 'prop_route9_overturned_truck':
        surf.rect(cx - 38, by - 34, 76, 28, C.rust1);
        surf.rect(cx - 34, by - 30, 48, 20, C.rust2);
        surf.rect(cx + 18, by - 28, 18, 22, C.slag2);
        surf.ellipse(cx - 20, by - 5, 7, 7, C.coat0);
        surf.ellipse(cx + 16, by - 5, 7, 7, C.coat0);
        break;
      case 'prop_route9_guardrail':
        surf.rect(cx - 26, by - 16, 52, 7, C.slag3);
        surf.rect(cx - 26, by - 14, 52, 2, C.rust1);
        surf.rect(cx - 20, by - 9, 4, 8, C.wood);
        surf.rect(cx + 16, by - 9, 4, 8, C.wood);
        break;
      case 'prop_route9_road_sign':
        surf.rect(cx - 1, by - 38, 3, 36, C.slag2);
        surf.ellipse(cx, by - 38, 9, 9, C.brass1);
        surf.ellipse(cx, by - 38, 6, 6, C.rust1);
        break;
      case 'prop_route9_tire_stack':
        for (let t = 0; t < 3; t++) {
          surf.ellipse(cx + (t % 2), by - 6 - t * 6, 9, 5, C.coat0);
          surf.ellipse(cx + (t % 2), by - 6 - t * 6, 5, 2, C.slag2);
        }
        break;
      case 'prop_route9_oil_drum':
        surf.rect(cx - 8, by - 22, 16, 20, C.rust1);
        surf.rect(cx - 8, by - 15, 16, 4, C.brass1);
        surf.ellipse(cx, by - 22, 8, 3, C.slag2);
        break;
      case 'prop_route9_dead_tree':
        surf.line(cx, by - 2, cx, by - 34, C.bone1, 5);
        surf.line(cx, by - 24, cx - 16, by - 42, C.bone2, 3);
        surf.line(cx, by - 28, cx + 16, by - 44, C.bone2, 3);
        surf.line(cx + 10, by - 36, cx + 10, by - 22, C.slag3, 1); // hanging chain
        break;
      case 'prop_route9_billboard_frame':
        surf.rect(cx - 34, by - 52, 68, 30, C.slag1);
        surf.rect(cx - 30, by - 48, 60, 22, C.rust1);
        surf.rect(cx - 24, by - 22, 5, 20, C.slag2);
        surf.rect(cx + 19, by - 22, 5, 20, C.slag2);
        break;

      // --- LYE MARSH / WEEPING FENS (8 PROPS) ---
      case 'prop_marsh_rusted_drum_cluster':
        surf.ellipse(cx, by - 2, 18, 6, C.bile1);
        surf.rect(cx - 12, by - 18, 11, 15, C.rust1);
        surf.rect(cx + 1, by - 16, 11, 13, C.bog2);
        break;
      case 'prop_marsh_dead_reed_clump':
        for (const rx of [-6, -3, 0, 3, 6]) {
          surf.line(cx + rx, by - 3, cx + rx * 1.4, by - 26 - (Math.abs(rx) % 5), C.bone2, 1);
        }
        break;
      case 'prop_marsh_bone_pile':
        surf.ellipse(cx, by - 7, 14, 7, C.bone1);
        surf.ellipse(cx - 4, by - 10, 6, 5, C.bone3);
        surf.ellipse(cx + 5, by - 8, 5, 4, C.bone2);
        break;
      case 'prop_marsh_sunken_car_roof':
        surf.ellipse(cx, by - 3, 24, 6, C.bog2);
        surf.rect(cx - 18, by - 16, 36, 10, C.rust1);
        surf.rect(cx - 14, by - 14, 28, 5, C.bone2);
        break;
      case 'prop_marsh_glowing_spore_pods':
        for (const [dx, dy, r] of [[-7, -8, 6], [6, -7, 5], [0, -13, 6]]) {
          surf.ellipse(cx + dx, by + dy, r, r + 2, C.bog2);
          surf.ellipse(cx + dx, by + dy - 2, 2, 2, C.sig2);
        }
        break;
      case 'prop_marsh_pipe_outflow':
        surf.ellipse(cx, by - 18, 16, 14, C.slag2);
        surf.ellipse(cx, by - 18, 11, 10, C.soot);
        surf.rect(cx - 6, by - 16, 12, 14, C.bile2); // sludge outflow
        break;
      case 'prop_marsh_tarp_shack':
        surf.rect(cx - 24, by - 34, 48, 28, C.wood);
        surf.rect(cx - 26, by - 38, 52, 12, C.bog2);
        surf.rect(cx - 22, by - 36, 40, 8, C.brass1);
        break;
      case 'prop_marsh_fog_patch':
        surf.ditherRect(ox + 8, 8, fw - 16, fh - 16, C.bog2, C.magenta);
        surf.ditherRect(ox + 16, 11, fw - 32, fh - 22, C.bone1, C.bog2);
        break;

      // --- COPPER FLATS / SEPULCHER OF ASH (8 PROPS) ---
      case 'prop_flats_wrecked_harvester':
        surf.rect(cx - 36, by - 40, 72, 34, C.rust1);
        surf.rect(cx - 30, by - 36, 52, 22, C.rust2);
        surf.ellipse(cx + 22, by - 18, 14, 14, C.slag2);
        break;
      case 'prop_flats_sand_dune_crest':
        surf.ellipse(cx, by - 10, 32, 12, C.rust1);
        surf.ellipse(cx - 6, by - 12, 24, 8, C.rust2);
        surf.ellipse(cx - 10, by - 14, 14, 5, C.rust3);
        break;
      case 'prop_flats_machine_rib_cage':
        for (const rx of [-20, -7, 7, 20]) {
          surf.line(cx + rx, by - 4, cx + rx - 4, by - 36, C.slag2, 3);
          surf.line(cx + rx - 4, by - 36, cx + rx + 6, by - 42, C.rust2, 3);
        }
        break;
      case 'prop_flats_cactus_husk':
        surf.rect(cx - 4, by - 34, 8, 30, C.bone1);
        surf.rect(cx - 11, by - 24, 7, 4, C.bone1);
        surf.rect(cx - 11, by - 30, 4, 8, C.bone2);
        surf.rect(cx + 4, by - 20, 7, 4, C.bone1);
        surf.rect(cx + 7, by - 28, 4, 10, C.bone2);
        break;
      case 'prop_flats_buried_antenna':
        surf.line(cx - 6, by - 4, cx + 8, by - 48, C.slag2, 3);
        surf.ellipse(cx + 8, by - 44, 10, 6, C.rust2);
        break;
      case 'prop_flats_tire_half_sunk':
        surf.ellipse(cx, by - 6, 11, 11, C.coat0);
        surf.ellipse(cx, by - 6, 6, 6, C.slag2);
        surf.rect(ox, by - 4, fw, 9, C.rust1);
        break;
      case 'prop_flats_bone_arch':
        surf.ellipse(cx, by - 24, 28, 24, C.bone2);
        surf.ellipse(cx, by - 20, 16, 18, C.magenta);
        break;
      case 'prop_flats_rusted_silo':
        surf.rect(cx - 26, 14, 52, by - 16, C.rust1);
        surf.rect(cx - 22, 16, 36, by - 20, C.rust2);
        surf.ellipse(cx, 16, 26, 8, C.slag2);
        break;
      default:
        surf.rect(cx - 12, by - 24, 24, 20, C.slag2);
        break;
    }

    if (id !== 'prop_marsh_fog_patch') {
      surf.outlineRegion(ox, 0, fw, fh, C.soot);
    }
  }
}

// ============================================================================
// 9. DUSKHOLLOW TOWN NPCs (ume + 7 Companion NPCs, 128x64 2-Frame Strips)
// ============================================================================
function drawNpcStrip(surf, spec) {
  const { id } = spec;
  for (let f = 0; f < 2; f++) {
    const ox = f * 64;
    const cx = ox + 32;
    const by = 58;
    const bob = f;
    surf.ellipse(cx, by, 24, 6, C.soot);

    if (id === 'ume') {
      // Ume behind wooden/iron pawn counter + salvage crate
      surf.rect(cx - 10, by - 36 + bob, 16, 18, C.rust1);
      surf.ellipse(cx - 2, by - 43 + bob, 8, 7, C.skin2);
      surf.ellipse(cx - 2, by - 48 + bob, 9, 5, C.bone2); // silver bun
      surf.rect(cx - 7, by - 44 + bob, 10, 3, C.brass3); // reading glasses
      surf.rect(cx - 22, by - 20, 36, 16, C.wood);
      surf.rect(cx - 20, by - 22, 32, 4, C.rust2);
      surf.rect(cx + 14, by - 18, 12, 14, C.slag2);
    } else if (id === 'npc_vaelen') {
      // Master Smith Vaelen + Soulfire Anvil + Glowing Runehammer
      surf.rect(cx - 12, by - 34 + bob, 18, 22, C.coat1);
      surf.ellipse(cx - 3, by - 41 + bob, 8, 7, C.skin2);
      surf.rect(cx - 8, by - 38 + bob, 10, 6, C.rust1); // beard
      surf.rect(cx + 6, by - 16, 18, 12, C.slag2); // anvil
      surf.rect(cx + 8, by - 32 + bob, 8, 5, C.rust3); // glowing runehammer
    } else if (id === 'npc_isolde') {
      // Sister Isolde + Bog-teal habit + Crimson blood vial
      surf.rect(cx - 10, by - 34 + bob, 20, 26, C.bog1);
      surf.ellipse(cx, by - 41 + bob, 8, 7, C.skin3);
      surf.ellipse(cx, by - 45 + bob, 10, 5, C.bone3); // veil
      surf.rect(cx + 12, by - 28 + bob, 5, 7, C.blood2); // crimson blood vial
    } else if (id === 'npc_malakor') {
      // Chronicler Malakor + Astrolabe spectacles + Bloodline Ledger board
      surf.rect(cx - 14, by - 34 + bob, 18, 26, C.coat2);
      surf.ellipse(cx - 5, by - 41 + bob, 8, 7, C.skin2);
      surf.rect(cx - 9, by - 42 + bob, 9, 3, C.brass3);
      surf.rect(cx + 8, by - 38, 16, 32, C.wood); // Ledger board
      surf.rect(cx + 10, by - 34, 12, 18, C.bone2);
    } else if (id === 'npc_solen') {
      // Archmage Solen + Levitating Cyan Grimoire + Starforged Staff
      surf.rect(cx - 10, by - 34 + bob, 20, 26, C.coat1);
      surf.ellipse(cx, by - 41 + bob, 8, 7, C.skin3);
      surf.line(cx - 16, by - 4, cx - 16, by - 46, C.brass3, 2);
      surf.ellipse(cx - 16, by - 48, 5, 5, C.sig2);
      surf.rect(cx + 12, by - 28 - bob, 9, 7, C.sig2); // levitating grimoire
    } else if (id === 'npc_maeve') {
      // Maeve the Hearthkeeper + Wyrm-steak platter & ale tankard
      surf.rect(cx - 10, by - 34 + bob, 20, 26, C.rust2);
      surf.ellipse(cx, by - 41 + bob, 8, 7, C.skin3);
      surf.ellipse(cx, by - 46 + bob, 9, 5, C.rust3);
      surf.ellipse(cx + 13, by - 24 + bob, 7, 4, C.brass2); // platter
      surf.rect(cx - 16, by - 26 + bob, 5, 7, C.brass3); // ale tankard
    } else if (id === 'npc_vex') {
      // Vex the Veil-Peddler + 3 Sealed Reliquary Coffers
      surf.rect(cx - 10, by - 34 + bob, 20, 26, C.coat1);
      surf.ellipse(cx, by - 41 + bob, 8, 7, C.bone2); // mask
      surf.rect(cx - 22, by - 14, 10, 10, C.brass2);
      surf.rect(cx + 12, by - 14, 10, 10, C.rust2);
    } else if (id === 'npc_morwen') {
      // Morwen the Veil-Peddler + Monster-Repelling Ward Lantern
      surf.rect(cx - 10, by - 34 + bob, 20, 26, C.bog2);
      surf.ellipse(cx, by - 41 + bob, 8, 7, C.skin2);
      surf.ellipse(cx + 15, by - 28 + bob, 6, 8, C.sig2); // ward lantern
      surf.ellipse(cx + 15, by - 28 + bob, 3, 4, C.bone3);
    }

    surf.outlineRegion(ox, 0, 64, 64, C.soot);
  }
}

// ============================================================================
// 10. UI FRAMES, BARS, SKILL & ITEM ICONS (32x32 Framed), & TITLE KEY ART
// ============================================================================
const FONT_5X7 = {
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function drawUiAsset(surf, spec) {
  const { id, frameWidth: fw, frameHeight: fh } = spec;

  if (id === 'ui_panel') {
    surf.rect(0, 0, fw, fh, C.soot);
    surf.rect(1, 1, fw - 2, fh - 2, C.slag2);
    surf.rect(2, 2, fw - 4, fh - 4, C.rust1);
    surf.rect(4, 4, fw - 8, fh - 8, C.coat0);
    for (const [rx, ry] of [
      [5, 5],
      [fw - 7, 5],
      [5, fh - 7],
      [fw - 7, fh - 7],
    ]) {
      surf.rect(rx, ry, 2, 2, C.brass3);
    }
  } else if (id.startsWith('ui_bar_')) {
    const fillCol = id.includes('hp') ? C.blood2 : id.includes('stamina') ? C.sig2 : C.brass3;
    const shadeCol = id.includes('hp') ? C.blood1 : id.includes('stamina') ? C.sig1 : C.brass1;
    surf.rect(0, 0, fw, fh, C.soot);
    surf.rect(1, 1, fw - 2, fh - 2, C.slag2);
    surf.rect(2, 2, fw - 4, fh - 4, C.coat0);
    surf.rect(fw, 0, fw, fh, C.soot);
    surf.rect(fw + 2, 2, fw - 4, fh - 4, shadeCol);
    surf.rect(fw + 2, 2, fw - 4, fh - 6, fillCol);
    surf.rect(fw + 2, 2, fw - 4, 2, C.bone3);
  } else if (id === 'ui_button') {
    const cols = [C.coat1, C.rust1, C.brass1];
    for (let f = 0; f < 3; f++) {
      const ox = f * fw;
      surf.rect(ox, 0, fw, fh, C.soot);
      surf.rect(ox + 1, 1, fw - 2, fh - 2, f === 1 ? C.sig2 : C.slag3);
      surf.rect(ox + 2, 2, fw - 4, fh - 4, cols[f]);
      surf.rect(ox + 4, 4, 2, 2, C.brass3);
      surf.rect(ox + fw - 6, 4, 2, 2, C.brass3);
    }
  } else if (id.startsWith('icon_')) {
    // HoloCure Reference Framing: 1px #0B0D10 outer border, 1px #3A3F47 bevel, #11171B interior
    const isUlt = id === 'icon_skill_seven_cuts';
    surf.rect(0, 0, 32, 32, C.soot);
    surf.rect(1, 1, 30, 30, isUlt ? C.brass2 : C.slag1);
    surf.rect(2, 2, 28, 28, C.coat0);
    surf.pset(2, 2, isUlt ? C.brass3 : C.slag3);

    switch (id) {
      case 'icon_skill_lunge':
        surf.line(6, 25, 25, 6, C.slag3, 4);
        surf.line(7, 24, 26, 5, C.sig2, 2);
        surf.line(4, 19, 19, 4, C.bone3, 1);
        break;
      case 'icon_skill_ground_break':
        surf.rect(14, 4, 4, 18, C.slag3);
        surf.line(18, 4, 18, 22, C.sig2, 1);
        surf.line(4, 24, 28, 24, C.sig2, 2);
        surf.line(8, 24, 4, 29, C.bone3, 2);
        surf.line(24, 24, 28, 29, C.bone3, 2);
        break;
      case 'icon_skill_rail_spike':
        surf.line(6, 26, 24, 8, C.slag3, 3);
        surf.rect(21, 5, 6, 6, C.sig2);
        surf.rect(23, 5, 3, 3, C.bone3);
        surf.rect(6, 23, 4, 4, C.rust3);
        break;
      case 'icon_skill_seven_cuts':
        surf.ellipse(16, 16, 9, 9, C.blood1);
        for (const [x0, y0, x1, y1] of [
          [4, 8, 28, 24],
          [4, 22, 28, 10],
          [10, 4, 22, 28],
          [18, 4, 12, 28],
          [6, 15, 26, 15],
        ]) {
          surf.line(x0, y0, x1, y1, C.sig2, 2);
          surf.line(x0 + 1, y0, x1 - 1, y1, C.bone3, 1);
        }
        break;
      case 'icon_skill_locked':
        surf.rect(9, 14, 14, 12, C.rust1);
        surf.rect(10, 15, 12, 10, C.rust2);
        surf.line(12, 14, 12, 8, C.slag3, 2);
        surf.line(20, 14, 20, 8, C.slag3, 2);
        surf.line(12, 8, 20, 8, C.slag3, 2);
        surf.rect(15, 18, 2, 4, C.soot);
        break;
      case 'icon_item_welding_goggles':
        surf.rect(5, 11, 22, 10, C.brass2);
        surf.ellipse(11, 16, 4, 4, C.bog2);
        surf.ellipse(21, 16, 4, 4, C.bog2);
        surf.pset(10, 15, C.bone3);
        break;
      case 'icon_item_surplus_respirator':
        surf.ellipse(16, 15, 7, 8, C.slag2);
        surf.ellipse(9, 20, 4, 4, C.rust2);
        surf.ellipse(23, 20, 4, 4, C.rust2);
        surf.rect(14, 17, 4, 3, C.sig2);
        break;
      case 'icon_item_riders_helmet':
        surf.ellipse(16, 16, 10, 9, C.bone2);
        surf.rect(9, 14, 15, 4, C.sig2);
        surf.rect(14, 6, 4, 6, C.brass3);
        break;
      case 'icon_item_patched_vest':
        surf.rect(8, 7, 16, 19, C.rust2);
        surf.rect(11, 10, 10, 14, C.slag2);
        surf.rect(9, 9, 4, 4, C.brass2);
        break;
      case 'icon_item_riot_jacket':
        surf.rect(7, 7, 18, 19, C.bog2);
        surf.rect(10, 10, 12, 14, C.slag1);
        surf.line(11, 13, 21, 13, C.bone2, 2);
        surf.line(11, 18, 21, 18, C.bone2, 2);
        break;
      case 'icon_item_plate_coat':
        surf.rect(7, 6, 18, 21, C.coat2);
        surf.rect(10, 9, 12, 13, C.brass2);
        surf.rect(12, 11, 8, 8, C.sig2);
        break;
      case 'icon_item_work_boots':
        surf.rect(8, 7, 6, 16, C.rust1);
        surf.rect(18, 7, 6, 16, C.rust2);
        surf.rect(8, 21, 9, 4, C.slag3);
        surf.rect(18, 21, 9, 4, C.slag3);
        break;
      case 'icon_item_courier_leggings':
        surf.rect(8, 7, 6, 16, C.bog2);
        surf.rect(18, 7, 6, 16, C.bog3);
        surf.rect(8, 14, 6, 3, C.brass2);
        surf.rect(18, 14, 6, 3, C.brass2);
        surf.rect(8, 21, 9, 4, C.slag2);
        surf.rect(18, 21, 9, 4, C.slag2);
        break;
      case 'icon_item_hydraulic_shins':
        surf.rect(8, 7, 6, 16, C.brass2);
        surf.rect(18, 7, 6, 16, C.brass3);
        surf.line(4, 12, 7, 12, C.sig2, 1);
        surf.line(4, 17, 7, 17, C.sig2, 1);
        surf.rect(8, 21, 9, 4, C.sig2);
        surf.rect(18, 21, 9, 4, C.sig2);
        break;
      case 'icon_item_gauze_roll':
        surf.ellipse(16, 16, 9, 7, C.bone3);
        surf.rect(15, 11, 3, 10, C.blood2);
        surf.rect(11, 14, 11, 3, C.blood2);
        break;
      case 'icon_item_sugar_tin':
        surf.rect(8, 9, 16, 14, C.brass2);
        surf.rect(10, 11, 12, 10, C.rust2);
        surf.rect(12, 13, 8, 6, C.sig2);
        surf.rect(14, 14, 4, 4, C.bone3);
        break;
    }
  } else if (id === 'ui_minimap_frame') {
    surf.rect(0, 0, fw, fh, C.slag2);
    surf.rect(2, 2, fw - 4, fh - 4, C.rust1);
    surf.rect(4, 4, fw - 8, fh - 8, C.magenta);
    // Cardinal N/S/E/W brass ticks
    surf.rect(46, 0, 4, 3, C.brass3);
    surf.rect(46, fh - 3, 4, 3, C.brass3);
    surf.rect(0, 46, 3, 4, C.brass3);
    surf.rect(fw - 3, 46, 3, 4, C.brass3);
  } else if (id === 'ui_coin') {
    surf.ellipse(8, 8, 6, 6, C.brass3);
    surf.ellipse(7, 7, 4, 4, C.brass2);
    surf.rect(7, 7, 2, 2, C.soot);
    surf.outlineRegion(0, 0, 16, 16, C.soot);
  } else if (id === 'ui_cursor') {
    surf.line(8, 1, 8, 14, C.sig2, 1);
    surf.line(1, 8, 14, 8, C.sig2, 1);
    surf.rect(7, 7, 2, 2, C.bone3);
    surf.outlineRegion(0, 0, 16, 16, C.soot);
  } else if (id === 'title_logo') {
    const text = 'GRAVEL SKY';
    const scale = 5;
    let cursorX = 18;
    const startY = 14;
    for (const ch of text) {
      const glyph = FONT_5X7[ch] || FONT_5X7[' '];
      for (let gy = 0; gy < 7; gy++) {
        for (let gx = 0; gx < 5; gx++) {
          if (glyph[gy][gx] === '1') {
            const px = cursorX + gx * scale;
            const py = startY + gy * scale;
            surf.rect(px + 3, py + 3, scale, scale, C.soot);
            const fill = gy < 3 ? C.bone3 : gy === 3 ? C.brass3 : C.rust3;
            surf.rect(px, py, scale, scale, fill);
            if (gy === 3) {
              surf.rect(px, py + 2, scale, 1, C.soot);
            }
          }
        }
      }
      cursorX += 6 * scale + 3;
    }
    surf.outlineRegion(0, 0, fw, fh, C.soot);
  } else if (id === 'title_key_art') {
    for (let y = 0; y < fh; y++) {
      const col = y < 58 ? C.soot : y < 115 ? C.rust0 : y < 168 ? C.rust1 : C.coat0;
      surf.rect(0, y, fw, 1, col);
    }
    // Eclipsed Blood Moon in upper right sky
    surf.ellipse(370, 56, 26, 26, C.blood2);
    surf.ellipse(370, 56, 21, 21, C.soot);
    // Distant Abyssal Spire & broken skyline silhouettes
    for (let x = 0; x < fw; x += 28) {
      const bh = x === 336 ? 95 : 25 + ((x * 19) % 45);
      surf.rect(x, 168 - bh, 22, bh, C.coat0);
    }
    // Kettle's warm boiler glow far below in the valley
    surf.ellipse(350, 195, 58, 22, C.rust2);
    surf.ellipse(350, 195, 32, 12, C.rust3);
    surf.ellipse(350, 195, 14, 6, C.brass3);
    // Collapsed concrete highway overpass in foreground left
    surf.rect(0, 196, 275, 74, C.slag0);
    surf.rect(0, 192, 282, 10, C.slag2);
    surf.line(275, 196, 310, 224, C.slag1, 3);
    // Sena standing on overpass edge
    drawSenaChibiFrame(surf, 142, 142, 'side', 'idle', 0);
  }
}

// ============================================================================
// GENERATE ALL 145 ASSETS INTO /geminigen/*.svg AND /geminigen/*.png
// ============================================================================
function generateAllGeminigenAssets() {
  const seen = new Set();
  const fullCatalog = [...ASSET_CATALOG, ...EXPANSION_CATALOG].filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
  const indexCards = [];

  for (const spec of fullCatalog) {
    const totalW = spec.sheetW || spec.frameWidth * spec.frameCount;
    const totalH = spec.sheetH || spec.frameHeight;
    const surf = new Surface(totalW, totalH, C.magenta, 255);

    if (spec.id === 'sena_turnaround') {
      const dirs = ['down', 'up', 'side', 'side'];
      for (let f = 0; f < 4; f++) {
        drawSenaChibiFrame(surf, f * 64, 0, dirs[f], 'idle', 0);
      }
    } else if (spec.category === 'player') {
      for (let f = 0; f < spec.frameCount; f++) {
        drawSenaChibiFrame(surf, f * 64, 0, spec.dir || 'down', spec.anim || 'idle', f);
      }
    } else if (spec.category === 'player_sheet') {
      drawPlayableClassSheet(surf, spec.classId);
    } else if (spec.category === 'portrait') {
      drawPortrait(surf, spec.id);
    } else if (spec.category === 'enemy_common') {
      for (let f = 0; f < spec.frameCount; f++) {
        drawCommonEnemyFrame(surf, f * spec.frameWidth, 0, spec.id, f);
      }
    } else if (spec.category === 'enemy_elite') {
      for (let f = 0; f < spec.frameCount; f++) {
        drawEliteEnemyFrame(surf, f * spec.frameWidth, 0, spec.id, f);
      }
    } else if (spec.category === 'boss') {
      for (let f = 0; f < spec.frameCount; f++) {
        drawBossFrame(surf, f * spec.frameWidth, 0, spec.frameWidth, spec.frameHeight, spec.id, f);
      }
    } else if (spec.category === 'fx') {
      drawFxStrip(surf, spec);
    } else if (spec.category === 'tile') {
      drawTileStrip(surf, spec);
    } else if (spec.category === 'prop') {
      drawPropStrip(surf, spec);
    } else if (spec.category === 'npc') {
      drawNpcStrip(surf, spec);
    } else {
      drawUiAsset(surf, spec);
    }

    const pngBuf = encodePNG(totalW, totalH, surf.data);
    const svgStr = encodePixelSVG(surf, spec.id, false);

    // Write both .svg and .png into /geminigen/
    fs.writeFileSync(path.join(GEMINI_DIR, `${spec.id}.svg`), svgStr, 'utf8');
    fs.writeFileSync(path.join(GEMINI_DIR, `${spec.id}.png`), pngBuf);

    // Also sync to /assets-src/raw/<id>.png so tools/process-assets.mjs ingests it
    fs.writeFileSync(path.join(RAW_DIR, `${spec.id}.png`), pngBuf);

    indexCards.push({
      id: spec.id,
      category: spec.category,
      w: totalW,
      h: totalH,
      fw: spec.frameWidth,
      fh: spec.frameHeight,
      fc: spec.frameCount,
    });
  }

  // Write an inspectable SVG + PNG contact sheet inside /geminigen/index.html
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>HELL'S ADVENT — geminigen/ SVG + PNG Asset Suite (${indexCards.length} Assets)</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; background: #0B0D10; color: #D9D2C3; font-family: ui-monospace, monospace; }
    h1 { color: #00F0FF; margin: 0 0 8px; font-size: 20px; }
    p { color: #8A877C; font-size: 12px; margin: 0 0 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
    .card { border: 1px solid #3A3F47; background: #11171B; padding: 12px; }
    .hdr { display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px solid #2A353D; padding-bottom: 6px; margin-bottom: 8px; }
    .hdr strong { color: #FFC83D; }
    .preview { background: #0B0D10; padding: 8px; overflow-x: auto; border: 1px solid #1F4D4A; }
    .preview img { image-rendering: pixelated; image-rendering: crisp-edges; display: block; }
  </style>
</head>
<body>
  <h1>HELL'S ADVENT — geminigen/ SVG + PNG Asset Suite (${indexCards.length} Assets)</h1>
  <p>Every asset from ASSETS_NEEDED.md generated as both pixel-locked SVG (.svg) and raster PNG (.png) in /geminigen/.</p>
  <div class="grid">
    ${indexCards
      .map(
        (c) => `<div class="card">
      <div class="hdr"><strong>${c.id}</strong><span>${c.category} • ${c.w}×${c.h}px</span></div>
      <div class="preview"><img src="./${c.id}.svg" width="${Math.min(320, c.w * 2)}" alt="${c.id}" /></div>
    </div>`
      )
      .join('\n')}
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(GEMINI_DIR, 'index.html'), html, 'utf8');

  console.log(
    `Generated ${indexCards.length} .svg and ${indexCards.length} .png asset sheets in /geminigen/ and synced to /assets-src/raw/.`
  );
}

generateAllGeminigenAssets();
