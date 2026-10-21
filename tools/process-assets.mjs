#!/usr/bin/env node
/**
 * GRAVEL SKY — Asset-Driven Art Pipeline & Processor (tools/process-assets.mjs)
 *
 * Implements:
 * - STEP 0: Style Lock & Negative Prompt enforcement + ASSETS_NEEDED.md generator
 * - Raw source sheet generator into /assets-src/raw/*.png on #FF00FF magenta
 *   (if an external AI image isn't already placed there)
 * - STEP 1: 6-stage image processor on every image in /assets-src/raw:
 *   1. Remove #FF00FF background (tolerance 40) + clean pink-tinted fringe pixels.
 *   2. Crop to bounding box + 2px padding (for sprite frames).
 *   3. Detect underlying pixel grid and resample to it (or nearest-neighbor median cell).
 *   4. Quantize to shared 48-color global palette (soot, slag, rust, bog, bone, signal, blood, brass + hue-shifted ramps).
 *   5. Align feet anchor (bottom center) on every animation frame so frames never jitter.
 *   6. Save PNG with alpha to /public/assets/<id>.png, pack strips into 2048x2048 atlases,
 *      write /public/assets/manifest.json, and output /public/assets/contact-sheet.html
 *      showing every asset at 1x and 6x on soot (#0B0D10) plus a solid black silhouette row.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, 'assets-src', 'raw');
const OUT_DIR = path.join(ROOT, 'public', 'assets');

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// ============================================================================
// STEP 0: STYLE LOCK & NEGATIVE PROMPT
// ============================================================================
export const STYLE_LOCK =
  '16-bit era Japanese JRPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure black), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view, post-apocalyptic wasteland setting, rust and ash and dead-teal palette.';

export const NEGATIVE_PROMPT =
  'smooth shading, vector look, 3D render, painterly, soft glow, lens flare, sparkles, magic circles, runes, purple energy, fantasy goblin, orc, skeleton, slime, dragon, symmetrical pose facing camera, extra limbs, text, logo, photograph.';

// ============================================================================
// SHARED 48-COLOR GLOBAL PALETTE (8 Core Tokens + Hue-Shifted 4-Step Ramps)
// ============================================================================
export const PALETTE_HEX = [
  // Core 8 tokens
  '#0B0D10', // 0: soot (darkest, never pure black)
  '#3A3F47', // 1: slag
  '#8B3A1E', // 2: rust
  '#1F4D4A', // 3: bog
  '#D9D2C3', // 4: bone
  '#00F0FF', // 5: signal
  '#FF3B3B', // 6: blood
  '#FFC83D', // 7: brass

  // Soot / Coat Ramp (darkens toward bog, highlights toward bone)
  '#11171B', // 8
  '#1A2228', // 9
  '#26313A', // 10
  '#33414C', // 11

  // Slag / Iron Ramp
  '#182429', // 12
  '#2A353D', // 13
  '#4F565E', // 14
  '#6E757A', // 15

  // Rust / Copper Ramp
  '#3B1C18', // 16
  '#612819', // 17
  '#B04E27', // 18
  '#D16B38', // 19

  // Bog / Toxic Marsh Ramp
  '#11292B', // 20
  '#173B3A', // 21
  '#2E6962', // 22
  '#4A8F82', // 23

  // Bone / Scarf / Ash Ramp
  '#545D5A', // 24
  '#8A877C', // 25
  '#B8B2A2', // 26
  '#EFE9DA', // 27

  // Signal Cyan Ramp
  '#0E4B57', // 28
  '#088A9E', // 29
  '#5CEBFF', // 30
  '#B8FBFF', // 31

  // Blood Crimson Ramp
  '#4A141C', // 32
  '#8A1C24', // 33
  '#C9282D', // 34
  '#FF7A70', // 35

  // Brass / Gold Ramp
  '#593E18', // 36
  '#946B22', // 37
  '#D49B2A', // 38
  '#FFE48A', // 39

  // Skin / Warm Flesh Ramp (Sena & Human Scavengers)
  '#472B26', // 40
  '#7D4E40', // 41
  '#B87D65', // 42
  '#E3B094', // 43

  // Leeches / Mutant Bile / Wood / Dust Accents
  '#3A4A24', // 44
  '#6B8036', // 45
  '#9CB34C', // 46
  '#4D3423', // 47
];

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export const GLOBAL_PALETTE_RGB = PALETTE_HEX.map(hexToRgb);

const C = {
  soot: hexToRgb('#0B0D10'),
  coat0: hexToRgb('#11171B'),
  coat1: hexToRgb('#1A2228'),
  coat2: hexToRgb('#26313A'),
  coat3: hexToRgb('#33414C'),
  slag0: hexToRgb('#182429'),
  slag1: hexToRgb('#2A353D'),
  slag2: hexToRgb('#3A3F47'),
  slag3: hexToRgb('#6E757A'),
  rust0: hexToRgb('#3B1C18'),
  rust1: hexToRgb('#612819'),
  rust2: hexToRgb('#8B3A1E'),
  rust3: hexToRgb('#D16B38'),
  bog0: hexToRgb('#11292B'),
  bog1: hexToRgb('#1F4D4A'),
  bog2: hexToRgb('#2E6962'),
  bog3: hexToRgb('#4A8F82'),
  bone0: hexToRgb('#545D5A'),
  bone1: hexToRgb('#8A877C'),
  bone2: hexToRgb('#B8B2A2'),
  bone3: hexToRgb('#D9D2C3'),
  boneHi: hexToRgb('#EFE9DA'),
  sig0: hexToRgb('#0E4B57'),
  sig1: hexToRgb('#088A9E'),
  sig2: hexToRgb('#00F0FF'),
  sig3: hexToRgb('#B8FBFF'),
  blood0: hexToRgb('#4A141C'),
  blood1: hexToRgb('#8A1C24'),
  blood2: hexToRgb('#FF3B3B'),
  blood3: hexToRgb('#FF7A70'),
  brass0: hexToRgb('#593E18'),
  brass1: hexToRgb('#946B22'),
  brass2: hexToRgb('#D49B2A'),
  brass3: hexToRgb('#FFC83D'),
  skin0: hexToRgb('#472B26'),
  skin1: hexToRgb('#7D4E40'),
  skin2: hexToRgb('#B87D65'),
  skin3: hexToRgb('#E3B094'),
  bile0: hexToRgb('#3A4A24'),
  bile1: hexToRgb('#6B8036'),
  bile2: hexToRgb('#9CB34C'),
  wood: hexToRgb('#4D3423'),
  magenta: [255, 0, 255],
};

// ============================================================================
// PURE NODE.JS PNG ENCODER & DECODER (via node:zlib)
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

export function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // Filter type 0 (None)
    const srcStart = y * stride;
    for (let i = 0; i < stride; i++) {
      raw[rowStart + 1 + i] = rgba[srcStart + i];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

export function decodePNG(buffer) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 6;
  const idatParts = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatParts.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }

  const inflated = zlib.inflateSync(Buffer.concat(idatParts));
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 4;
  const stride = width * bpp;
  const recon = new Uint8Array(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = inflated[y * (stride + 1)];
    const rowIn = y * (stride + 1) + 1;
    const rowOut = y * stride;
    for (let x = 0; x < stride; x++) {
      const rawByte = inflated[rowIn + x];
      const a = x >= bpp ? recon[rowOut + x - bpp] : 0;
      const b = y > 0 ? recon[rowOut - stride + x] : 0;
      const c = y > 0 && x >= bpp ? recon[rowOut - stride + x - bpp] : 0;
      let val = rawByte;
      if (filter === 1) val = (rawByte + a) & 0xff;
      else if (filter === 2) val = (rawByte + b) & 0xff;
      else if (filter === 3) val = (rawByte + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) val = (rawByte + paethPredictor(a, b, c)) & 0xff;
      recon[rowOut + x] = val;
    }
  }

  if (bpp === 4) {
    return { width, height, data: recon };
  }
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = recon[i * 3];
    rgba[i * 4 + 1] = recon[i * 3 + 1];
    rgba[i * 4 + 2] = recon[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return { width, height, data: rgba };
}

// ============================================================================
// PIXEL SURFACE HELPER FOR DRAWING RAW SOURCE SHEETS ON #FF00FF MAGENTA
// ============================================================================
class Surface {
  constructor(w, h, bg = C.magenta, alpha = 255) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
    if (bg) {
      for (let i = 0; i < w * h; i++) {
        this.data[i * 4] = bg[0];
        this.data[i * 4 + 1] = bg[1];
        this.data[i * 4 + 2] = bg[2];
        this.data[i * 4 + 3] = alpha;
      }
    }
  }

  pset(x, y, rgb, a = 255) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h || !rgb) return;
    const idx = (iy * this.w + ix) * 4;
    this.data[idx] = rgb[0];
    this.data[idx + 1] = rgb[1];
    this.data[idx + 2] = rgb[2];
    this.data[idx + 3] = a;
  }

  pget(x, y) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return [255, 0, 255, 0];
    const idx = (iy * this.w + ix) * 4;
    return [this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]];
  }

  rect(x, y, w, h, rgb) {
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        this.pset(x + px, y + py, rgb);
      }
    }
  }

  ellipse(cx, cy, rx, ry, rgb) {
    const x0 = Math.floor(cx - rx);
    const x1 = Math.ceil(cx + rx);
    const y0 = Math.floor(cy - ry);
    const y1 = Math.ceil(cy + ry);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x - cx) / Math.max(0.5, rx);
        const dy = (y - cy) / Math.max(0.5, ry);
        if (dx * dx + dy * dy <= 1.0) {
          this.pset(x, y, rgb);
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
    const sx = ix0 < ix1 ? 1 : -1;
    const dy = -Math.abs(iy1 - iy0);
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      for (let ty = 0; ty < thickness; ty++) {
        for (let tx = 0; tx < thickness; tx++) {
          this.pset(ix0 + tx, iy0 + ty, rgb);
        }
      }
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        ix0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        iy0 += sy;
      }
    }
  }

  /**
   * Automatic 1px dark material outline pass on a frame region (skips magenta bg)
   */
  outlineRegion(ox, oy, rw, rh, outlineRgb = C.soot) {
    const copy = new Uint8Array(this.data);
    const isBg = (x, y) => {
      if (x < ox || y < oy || x >= ox + rw || y >= oy + rh) return true;
      const idx = (y * this.w + x) * 4;
      return copy[idx] === 255 && copy[idx + 1] === 0 && copy[idx + 2] === 255;
    };
    for (let y = oy + 1; y < oy + rh - 1; y++) {
      for (let x = ox + 1; x < ox + rw - 1; x++) {
        if (!isBg(x, y)) continue;
        const nUp = !isBg(x, y - 1);
        const nDown = !isBg(x, y + 1);
        const nLeft = !isBg(x - 1, y);
        const nRight = !isBg(x + 1, y);
        if (nUp || nDown || nLeft || nRight) {
          this.pset(x, y, outlineRgb);
        }
      }
    }
  }
}

// ============================================================================
// STEP 3: COMPLETE ASSET CATALOG & PROMPTS
// ============================================================================
export const ASSET_CATALOG = [
  // --- SENA TURNAROUND & DIRECTIONAL ANIMATIONS (64x64) ---
  {
    id: 'sena_turnaround',
    category: 'player',
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    fps: 2,
    anchor: [32, 60],
    alignFeet: true,
    prompt:
      'character turnaround sheet, front view, back view, left side view, right side view, of Sena Ibuki, a young woman salvage runner, short uneven rust-red hair with one longer strand on the left held by a bent paper clip, cracked welding goggles pushed up on her forehead, black patched work coat with a frayed hem and a square rust patch on the back left shoulder, left sleeve torn off at the elbow with a grey bandaged forearm, right forearm wearing a brass pipe-clamp cuff, long bone-colored scarf with one stenciled rust stripe near the tail, holding a short sword made from a sawn-off length of train rail, cloth-wrapped flange as the hilt, only the sharpened edge glowing signal cyan, worn boots, determined expression, anime proportions, about 4 heads tall',
  },
  ...['down', 'up', 'side'].flatMap((dir) => [
    {
      id: `sena_idle_${dir}`,
      category: 'player',
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 2,
      fps: 4,
      anchor: [32, 60],
      alignFeet: true,
      dir,
      anim: 'idle',
      prompt: `same character Sena Ibuki, same palette, same proportions, same costume details, new pose: ${dir} view idle breathing pose, 2 frames, holding Railcut sword with signal cyan edge`,
    },
    {
      id: `sena_run_${dir}`,
      category: 'player',
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 6,
      fps: 12,
      anchor: [32, 60],
      alignFeet: true,
      dir,
      anim: 'run',
      prompt: `same character Sena Ibuki, same palette, same proportions, same costume details, new pose: ${dir} view 6-frame run cycle, scarf trailing, coat hem flaring`,
    },
    {
      id: `sena_attack1_${dir}`,
      category: 'player',
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 3,
      fps: 14,
      anchor: [32, 60],
      alignFeet: true,
      dir,
      anim: 'attack1',
      prompt: `same character Sena Ibuki, same palette, same proportions, same costume details, new pose: ${dir} view attack combo hit 1 horizontal forehand slash, 3 frames (anticipation, smear, recovery)`,
    },
    {
      id: `sena_attack2_${dir}`,
      category: 'player',
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 3,
      fps: 14,
      anchor: [32, 60],
      alignFeet: true,
      dir,
      anim: 'attack2',
      prompt: `same character Sena Ibuki, same palette, same proportions, same costume details, new pose: ${dir} view attack combo hit 2 reverse upward backhand slash, 3 frames (anticipation, smear, recovery)`,
    },
    {
      id: `sena_attack3_${dir}`,
      category: 'player',
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 3,
      fps: 12,
      anchor: [32, 60],
      alignFeet: true,
      dir,
      anim: 'attack3',
      prompt: `same character Sena Ibuki, same palette, same proportions, same costume details, new pose: ${dir} view attack combo hit 3 two-handed overhead rail cleave, 3 frames (anticipation, smear, recovery)`,
    },
    {
      id: `sena_hurt_${dir}`,
      category: 'player',
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 1,
      fps: 8,
      anchor: [32, 60],
      alignFeet: true,
      dir,
      anim: 'hurt',
      prompt: `same character Sena Ibuki, same palette, same proportions, same costume details, new pose: ${dir} view hurt recoil pose, 1 frame`,
    },
  ]),
  {
    id: 'sena_dodge_side',
    category: 'player',
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    fps: 16,
    anchor: [32, 60],
    alignFeet: true,
    dir: 'side',
    anim: 'dodge',
    prompt:
      'same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view low evasive dodge roll, 4 frames, bone scarf whipping forward',
  },
  {
    id: 'sena_death_side',
    category: 'player',
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    fps: 6,
    anchor: [32, 60],
    alignFeet: true,
    dir: 'side',
    anim: 'death',
    prompt:
      'same character Sena Ibuki, same palette, same proportions, same costume details, new pose: side view collapse to knees and planting Railcut sword in the ground, 4 frames',
  },

  // --- SENA PORTRAITS (96x96) ---
  {
    id: 'sena_neutral',
    category: 'portrait',
    frameWidth: 96,
    frameHeight: 96,
    frameCount: 1,
    fps: 1,
    anchor: [48, 96],
    alignFeet: false,
    prompt:
      'anime bust portrait of Sena Ibuki, neutral calm expression, visual-novel framing, pixel art, same costume',
  },
  {
    id: 'sena_hurt',
    category: 'portrait',
    frameWidth: 96,
    frameHeight: 96,
    frameCount: 1,
    fps: 1,
    anchor: [48, 96],
    alignFeet: false,
    prompt:
      'anime bust portrait of Sena Ibuki, hurt wincing expression with grit teeth, visual-novel framing, pixel art, same costume',
  },
  {
    id: 'sena_determined',
    category: 'portrait',
    frameWidth: 96,
    frameHeight: 96,
    frameCount: 1,
    fps: 1,
    anchor: [48, 96],
    alignFeet: false,
    prompt:
      'anime bust portrait of Sena Ibuki, determined focused combat expression, visual-novel framing, pixel art, same costume',
  },
  {
    id: 'sena_ultimate',
    category: 'portrait',
    frameWidth: 96,
    frameHeight: 96,
    frameCount: 1,
    fps: 1,
    anchor: [48, 96],
    alignFeet: false,
    prompt:
      'anime bust portrait of Sena Ibuki, ultimate expression with eyes glowing bright signal cyan, visual-novel framing, pixel art, same costume',
  },

  // --- COMMON ENEMIES (40x40, 5 frames: move 2, attack 1, hurt 1, dead 1) ---
  {
    id: 'tin_rat',
    category: 'enemy_common',
    frameWidth: 40,
    frameHeight: 40,
    frameCount: 5,
    fps: 8,
    anchor: [20, 36],
    alignFeet: true,
    prompt:
      'scrawny rat with a rusted soup can fused over its back like a shell, lid flapping on a hinge, red pinprick eyes, matted grey fur, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts)',
  },
  {
    id: 'dust_dog',
    category: 'enemy_common',
    frameWidth: 40,
    frameHeight: 40,
    frameCount: 5,
    fps: 8,
    anchor: [20, 36],
    alignFeet: true,
    prompt:
      "starved hound, ribs showing, pale bone-colored fur with rust stains, a rag collar with a pair of dead person's welding goggles hanging from it, head carried low, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts)",
  },
  {
    id: 'wire_kite',
    category: 'enemy_common',
    frameWidth: 40,
    frameHeight: 40,
    frameCount: 5,
    fps: 8,
    anchor: [20, 34],
    alignFeet: true,
    prompt:
      'drone made from two crossed sticks and torn plastic sheet wings, one camera-lens eye glowing blood red, a long trailing wire tail, hovering, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts)',
  },
  {
    id: 'lye_leech',
    category: 'enemy_common',
    frameWidth: 40,
    frameHeight: 40,
    frameCount: 5,
    fps: 8,
    anchor: [20, 36],
    alignFeet: true,
    prompt:
      'fat half-translucent yellow-green slug with a ring mouth of tiny teeth, wet shine, stretched mid-crawl, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts)',
  },
  {
    id: 'sump_bat',
    category: 'enemy_common',
    frameWidth: 40,
    frameHeight: 40,
    frameCount: 5,
    fps: 10,
    anchor: [20, 34],
    alignFeet: true,
    prompt:
      'bat with wings made of torn hazmat plastic on bent umbrella ribs, swollen pale sac under its belly, wings spread, 5 frames (move 2, attack 1, hurt 1, dead 1 scattered parts)',
  },

  // --- ELITE ENEMIES (80x80, 7 frames: move 2, tell 1, attack 2, hurt 1, dead 1) ---
  {
    id: 'cleaver_hauler',
    category: 'enemy_elite',
    frameWidth: 80,
    frameHeight: 80,
    frameCount: 7,
    fps: 8,
    anchor: [40, 74],
    alignFeet: true,
    prompt:
      "hunched man-sized scavenger dragging a wheeled cart of scrap by a chain, a butcher's cleaver welded in place of his right hand, rag-wrapped face, 7 frames (move 2, tell 1, attack 2, hurt 1, dead 1)",
  },
  {
    id: 'lye_strider',
    category: 'enemy_elite',
    frameWidth: 80,
    frameHeight: 80,
    frameCount: 7,
    fps: 8,
    anchor: [40, 74],
    alignFeet: true,
    prompt:
      'tall stilt-legged figure built from bent pipes, chemical tank on its back with a cracked pressure gauge, a funnel for a head, 7 frames (move 2, tell 1, attack 2, hurt 1, dead 1)',
  },
  {
    id: 'flats_harvester',
    category: 'enemy_elite',
    frameWidth: 80,
    frameHeight: 80,
    frameCount: 7,
    fps: 8,
    anchor: [40, 74],
    alignFeet: true,
    prompt:
      'half-human operator fused into the front of a small harvester blade drum, red-stained blades, dust coating, 7 frames (move 2, tell 1, attack 2, hurt 1, dead 1)',
  },

  // --- BOSSES (9 frames: idle 2, attack A 2, attack B 2, phase-change 1, dead 2) ---
  {
    id: 'the_foreman',
    category: 'boss',
    frameWidth: 192,
    frameHeight: 192,
    frameCount: 9,
    fps: 6,
    anchor: [96, 176],
    alignFeet: true,
    prompt:
      'excavator rig with a skeleton in a yellow hard hat in the cab, rusted bucket arm, dangling wrecking ball chain, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2)',
  },
  {
    id: 'big_axle',
    category: 'boss',
    frameWidth: 224,
    frameHeight: 160,
    frameCount: 9,
    fps: 6,
    anchor: [112, 146],
    alignFeet: true,
    prompt:
      'truck cab dragging two chained trailer sections, headlights glowing like eyes, dented grille like a jaw, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2)',
  },
  {
    id: 'mother_sump',
    category: 'boss',
    frameWidth: 192,
    frameHeight: 192,
    frameCount: 9,
    fps: 6,
    anchor: [96, 176],
    alignFeet: true,
    prompt:
      'heaving mass of rusted drums and torn tarp with a pulsing pale sac, leeches crawling out, half-sunk in toxic water, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2)',
  },
  {
    id: 'the_long_dry',
    category: 'boss',
    frameWidth: 256,
    frameHeight: 192,
    frameCount: 9,
    fps: 6,
    anchor: [128, 176],
    alignFeet: true,
    prompt:
      'giant worm built from stacked rusted pipe rings, mouth ringed with drill bits, bursting from red sand, 9 frames (idle 2, attack A 2, attack B 2, phase-change 1, dead 2)',
  },

  // --- SKILL EFFECT STRIPS ---
  {
    id: 'fx_slash_smear',
    category: 'fx',
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 5,
    fps: 24,
    anchor: [64, 64],
    alignFeet: false,
    prompt:
      'crescent sword-slash smear, tapered, white core with a cyan edge, motion-blur-free pixel art, frame N of 5 growing then fading',
  },
  {
    id: 'fx_dash_streak',
    category: 'fx',
    frameWidth: 160,
    frameHeight: 48,
    frameCount: 4,
    fps: 24,
    anchor: [80, 24],
    alignFeet: false,
    prompt: 'horizontal speed streak lines, bone and cyan, 4 frames',
  },
  {
    id: 'fx_hit_cross',
    category: 'fx',
    frameWidth: 48,
    frameHeight: 48,
    frameCount: 3,
    fps: 24,
    anchor: [24, 24],
    alignFeet: false,
    prompt: 'white cross-shaped hit flash, 3 frames',
  },
  {
    id: 'fx_shards',
    category: 'fx',
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    fps: 20,
    anchor: [32, 32],
    alignFeet: false,
    prompt: '6 small metal shards flying outward, bone and rust, 4 frames',
  },
  {
    id: 'fx_shock_ring',
    category: 'fx',
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 6,
    fps: 20,
    anchor: [128, 128],
    alignFeet: false,
    prompt:
      'top-down expanding shockwave ring with cracked ground lines, signal cyan inner glow, soot cracks, dust, 6 frames',
  },
  {
    id: 'fx_ground_cracks',
    category: 'fx',
    frameWidth: 192,
    frameHeight: 192,
    frameCount: 3,
    fps: 1,
    anchor: [96, 96],
    alignFeet: false,
    prompt: 'top-down radial ground cracks glowing cyan inside, soot-colored rim, 3 variants',
  },
  {
    id: 'fx_dust_puff',
    category: 'fx',
    frameWidth: 48,
    frameHeight: 48,
    frameCount: 4,
    fps: 16,
    anchor: [24, 24],
    alignFeet: false,
    prompt: 'dust cloud puff in rust and slag, 4 frames',
  },
  {
    id: 'rail_spike',
    category: 'fx',
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 4,
    fps: 1,
    anchor: [8, 8],
    alignFeet: false,
    prompt:
      'short rail piece thrown like a spear, cyan tip, drawn at 4 angles (right, down-right, down, up-right)',
  },
  {
    id: 'fx_spark',
    category: 'fx',
    frameWidth: 24,
    frameHeight: 24,
    frameCount: 3,
    fps: 24,
    anchor: [12, 12],
    alignFeet: false,
    prompt: 'small metal spark burst, 3 frames',
  },
  {
    id: 'ultimate_cutin',
    category: 'fx',
    frameWidth: 480,
    frameHeight: 120,
    frameCount: 1,
    fps: 1,
    anchor: [240, 60],
    alignFeet: false,
    prompt:
      "anime close-up strip of Sena's eyes, cyan glow, speed lines radiating from behind, bold ink style in pixel art",
  },
  {
    id: 'fx_ult_slash',
    category: 'fx',
    frameWidth: 320,
    frameHeight: 40,
    frameCount: 3,
    fps: 24,
    anchor: [160, 20],
    alignFeet: false,
    prompt: 'long tapered white slash line with signal cyan edge, 3 variants',
  },

  // --- WORLD TILES (16x16, 3 variants per area + transitions) ---
  {
    id: 'tile_kettle',
    category: 'tile',
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 3,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: 'top-down seamless ground texture tile, packed dirt with cracked concrete, 3 variants',
  },
  {
    id: 'tile_slab_town',
    category: 'tile',
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 3,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: 'top-down seamless ground texture tile, broken concrete rubble, 3 variants',
  },
  {
    id: 'tile_route_9',
    category: 'tile',
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 3,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: 'top-down seamless ground texture tile, cracked asphalt with faded lane paint, 3 variants',
  },
  {
    id: 'tile_lye_marsh',
    category: 'tile',
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 3,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: 'top-down seamless ground texture tile, pale toxic mud with puddles, 3 variants',
  },
  {
    id: 'tile_copper_flats',
    category: 'tile',
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 3,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: 'top-down seamless ground texture tile, rust-red sand, 3 variants',
  },
  {
    id: 'tile_transitions',
    category: 'tile',
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 6,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt:
      'top-down seamless edge transition ground tiles between dirt, rubble, asphalt, toxic mud, and red sand, 6 variants',
  },

  // --- WORLD PROPS (8 per area = 40 props, with baked shadow ellipse) ---
  // Kettle (8)
  { id: 'prop_kettle_boiler_tower', category: 'prop', area: 'kettle', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 88], prompt: 'rusted industrial boiler tower with warm furnace grate and pipes, baked ground shadow' },
  { id: 'prop_kettle_shack', category: 'prop', area: 'kettle', frameWidth: 80, frameHeight: 64, frameCount: 1, fps: 1, anchor: [40, 58], prompt: 'corrugated tin salvage shack with tarp roof, baked ground shadow' },
  { id: 'prop_kettle_campfire', category: 'prop', area: 'kettle', frameWidth: 32, frameHeight: 32, frameCount: 3, fps: 8, anchor: [16, 28], prompt: 'oil drum ring campfire with brass and rust flames, 3 frames, baked ground shadow' },
  { id: 'prop_kettle_signs', category: 'prop', area: 'kettle', frameWidth: 32, frameHeight: 40, frameCount: 1, fps: 1, anchor: [16, 36], prompt: 'wooden post with stenciled metal directional signs, baked ground shadow' },
  { id: 'prop_kettle_crates', category: 'prop', area: 'kettle', frameWidth: 40, frameHeight: 32, frameCount: 1, fps: 1, anchor: [20, 28], prompt: 'stacked wooden and stamped iron salvage crates, baked ground shadow' },
  { id: 'prop_kettle_barrels', category: 'prop', area: 'kettle', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 28], prompt: 'pair of dented water and fuel barrels, baked ground shadow' },
  { id: 'prop_kettle_tent', category: 'prop', area: 'kettle', frameWidth: 64, frameHeight: 48, frameCount: 1, fps: 1, anchor: [32, 42], prompt: 'patched canvas runner tent held up by rebar poles, baked ground shadow' },
  { id: 'prop_kettle_bench', category: 'prop', area: 'kettle', frameWidth: 48, frameHeight: 32, frameCount: 1, fps: 1, anchor: [24, 28], prompt: 'workbench built from railway sleepers and a vise, baked ground shadow' },

  // Slab Town (8)
  { id: 'prop_slab_collapsed_wall', category: 'prop', area: 'slabTown', frameWidth: 80, frameHeight: 64, frameCount: 1, fps: 1, anchor: [40, 58], prompt: 'collapsed concrete apartment wall with exposed rebar, baked ground shadow' },
  { id: 'prop_slab_rebar_pile', category: 'prop', area: 'slabTown', frameWidth: 48, frameHeight: 40, frameCount: 1, fps: 1, anchor: [24, 34], prompt: 'tangled pile of rusted rebar rods and concrete chunks, baked ground shadow' },
  { id: 'prop_slab_dead_mall_sign', category: 'prop', area: 'slabTown', frameWidth: 64, frameHeight: 64, frameCount: 1, fps: 1, anchor: [32, 58], prompt: 'fallen commercial mall pylon sign with broken casing, baked ground shadow' },
  { id: 'prop_slab_rubble_heap', category: 'prop', area: 'slabTown', frameWidth: 56, frameHeight: 40, frameCount: 1, fps: 1, anchor: [28, 34], prompt: 'mound of broken concrete slabs and masonry dust, baked ground shadow' },
  { id: 'prop_slab_bent_streetlight', category: 'prop', area: 'slabTown', frameWidth: 32, frameHeight: 72, frameCount: 1, fps: 1, anchor: [16, 66], prompt: 'bent steel streetlight pole with shattered lamp housing, baked ground shadow' },
  { id: 'prop_slab_shopping_cart', category: 'prop', area: 'slabTown', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 28], prompt: 'rusted wire shopping cart tipped on its side, baked ground shadow' },
  { id: 'prop_slab_vending_machine', category: 'prop', area: 'slabTown', frameWidth: 40, frameHeight: 56, frameCount: 1, fps: 1, anchor: [20, 50], prompt: 'gutted beverage vending machine with cracked front panel, baked ground shadow' },
  { id: 'prop_slab_broken_stairs', category: 'prop', area: 'slabTown', frameWidth: 64, frameHeight: 56, frameCount: 1, fps: 1, anchor: [32, 50], prompt: 'freestanding concrete stairwell leading nowhere, baked ground shadow' },

  // Route 9 (8)
  { id: 'prop_route9_burnt_car', category: 'prop', area: 'route9', frameWidth: 72, frameHeight: 48, frameCount: 1, fps: 1, anchor: [36, 42], prompt: 'rusted burnt-out sedan chassis without wheels, baked ground shadow' },
  { id: 'prop_route9_overturned_truck', category: 'prop', area: 'route9', frameWidth: 96, frameHeight: 64, frameCount: 1, fps: 1, anchor: [48, 58], prompt: 'overturned freight truck cab and axle on cracked highway, baked ground shadow' },
  { id: 'prop_route9_guardrail', category: 'prop', area: 'route9', frameWidth: 64, frameHeight: 32, frameCount: 1, fps: 1, anchor: [32, 28], prompt: 'crumpled steel highway guardrail section, baked ground shadow' },
  { id: 'prop_route9_road_sign', category: 'prop', area: 'route9', frameWidth: 32, frameHeight: 56, frameCount: 1, fps: 1, anchor: [16, 50], prompt: 'bullet-riddled highway exit sign on bent post, baked ground shadow' },
  { id: 'prop_route9_tire_stack', category: 'prop', area: 'route9', frameWidth: 32, frameHeight: 36, frameCount: 1, fps: 1, anchor: [16, 32], prompt: 'stack of worn rubber truck tires, baked ground shadow' },
  { id: 'prop_route9_oil_drum', category: 'prop', area: 'route9', frameWidth: 32, frameHeight: 36, frameCount: 1, fps: 1, anchor: [16, 32], prompt: 'corroded highway barrel drum, baked ground shadow' },
  { id: 'prop_route9_dead_tree', category: 'prop', area: 'route9', frameWidth: 56, frameHeight: 64, frameCount: 1, fps: 1, anchor: [28, 58], prompt: 'leafless ash-white dead roadside tree, baked ground shadow' },
  { id: 'prop_route9_billboard_frame', category: 'prop', area: 'route9', frameWidth: 88, frameHeight: 72, frameCount: 1, fps: 1, anchor: [44, 66], prompt: 'skeletal steel highway billboard lattice with torn metal strips, baked ground shadow' },

  // Lye Marsh (8)
  { id: 'prop_marsh_rusted_drum_cluster', category: 'prop', area: 'lyeMarsh', frameWidth: 48, frameHeight: 40, frameCount: 1, fps: 1, anchor: [24, 34], prompt: 'cluster of leaking chemical drums half-sunk in lye mud, baked ground shadow' },
  { id: 'prop_marsh_dead_reed_clump', category: 'prop', area: 'lyeMarsh', frameWidth: 32, frameHeight: 40, frameCount: 1, fps: 1, anchor: [16, 34], prompt: 'clump of brittle bleached marsh reeds, baked ground shadow' },
  { id: 'prop_marsh_bone_pile', category: 'prop', area: 'lyeMarsh', frameWidth: 40, frameHeight: 32, frameCount: 1, fps: 1, anchor: [20, 28], prompt: 'ribcages and bleached animal bones in toxic mud, baked ground shadow' },
  { id: 'prop_marsh_sunken_car_roof', category: 'prop', area: 'lyeMarsh', frameWidth: 64, frameHeight: 40, frameCount: 1, fps: 1, anchor: [32, 34], prompt: 'car roof and pillars protruding from bog water, baked ground shadow' },
  { id: 'prop_marsh_glowing_spore_pods', category: 'prop', area: 'lyeMarsh', frameWidth: 40, frameHeight: 40, frameCount: 1, fps: 1, anchor: [20, 34], prompt: ' swollen bog fungal pods with faint cyan-teal pores, baked ground shadow' },
  { id: 'prop_marsh_pipe_outflow', category: 'prop', area: 'lyeMarsh', frameWidth: 56, frameHeight: 48, frameCount: 1, fps: 1, anchor: [28, 42], prompt: 'large corroded drainage pipe discharging green sludge, baked ground shadow' },
  { id: 'prop_marsh_tarp_shack', category: 'prop', area: 'lyeMarsh', frameWidth: 72, frameHeight: 56, frameCount: 1, fps: 1, anchor: [36, 50], prompt: 'stilted bog lean-to covered in yellow hazmat tarp, baked ground shadow' },
  { id: 'prop_marsh_fog_patch', category: 'prop', area: 'lyeMarsh', frameWidth: 64, frameHeight: 32, frameCount: 1, fps: 1, anchor: [32, 26], prompt: 'low hanging pixel-dithered bog vapor cloud over mud' },

  // Copper Flats (8)
  { id: 'prop_flats_wrecked_harvester', category: 'prop', area: 'copperFlats', frameWidth: 96, frameHeight: 72, frameCount: 1, fps: 1, anchor: [48, 66], prompt: 'hulking rusted strip-mine harvester chassis buried in red sand, baked ground shadow' },
  { id: 'prop_flats_sand_dune_crest', category: 'prop', area: 'copperFlats', frameWidth: 80, frameHeight: 40, frameCount: 1, fps: 1, anchor: [40, 34], prompt: 'wind-swept rust-red sand dune ridge with slag stones, baked ground shadow' },
  { id: 'prop_flats_machine_rib_cage', category: 'prop', area: 'copperFlats', frameWidth: 72, frameHeight: 56, frameCount: 1, fps: 1, anchor: [36, 50], prompt: 'arched iron hull ribs of a gutted turbine half-buried in sand, baked ground shadow' },
  { id: 'prop_flats_cactus_husk', category: 'prop', area: 'copperFlats', frameWidth: 32, frameHeight: 48, frameCount: 1, fps: 1, anchor: [16, 42], prompt: 'petrified woody desert cactus skeleton, baked ground shadow' },
  { id: 'prop_flats_buried_antenna', category: 'prop', area: 'copperFlats', frameWidth: 40, frameHeight: 64, frameCount: 1, fps: 1, anchor: [20, 58], prompt: 'tilted dish antenna mast protruding from red drift sand, baked ground shadow' },
  { id: 'prop_flats_tire_half_sunk', category: 'prop', area: 'copperFlats', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 28], prompt: 'massive haul-truck tire half-buried in red sand, baked ground shadow' },
  { id: 'prop_flats_bone_arch', category: 'prop', area: 'copperFlats', frameWidth: 72, frameHeight: 64, frameCount: 1, fps: 1, anchor: [36, 58], prompt: 'giant bleached vertebrae and scrap beam arch in the desert, baked ground shadow' },
  { id: 'prop_flats_rusted_silo', category: 'prop', area: 'copperFlats', frameWidth: 80, frameHeight: 88, frameCount: 1, fps: 1, anchor: [40, 80], prompt: 'collapsed cylindrical ore silo with riveted rust plates, baked ground shadow' },

  // --- UME SHOP NPC (64x64, idle 2 frames) ---
  {
    id: 'ume',
    category: 'npc',
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 2,
    fps: 2,
    anchor: [32, 58],
    alignFeet: true,
    prompt:
      'older woman with a pawn counter, rolled sleeves, reading glasses on a chain, a crate of mixed junk beside her, idle 2 frames',
  },

  // --- UI ASSETS ---
  {
    id: 'ui_panel',
    category: 'ui',
    frameWidth: 48,
    frameHeight: 48,
    frameCount: 1,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: 'worn metal and wood 9-slice panel frame with rivets, rust and slag, pixel art',
  },
  {
    id: 'ui_bar_hp',
    category: 'ui',
    frameWidth: 128,
    frameHeight: 12,
    frameCount: 2,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: '128x12 pixel-bar frame and blood-red fill mask, rusted iron border',
  },
  {
    id: 'ui_bar_stamina',
    category: 'ui',
    frameWidth: 128,
    frameHeight: 12,
    frameCount: 2,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: '128x12 pixel-bar frame and signal-cyan fill mask, rusted iron border',
  },
  {
    id: 'ui_bar_xp',
    category: 'ui',
    frameWidth: 128,
    frameHeight: 12,
    frameCount: 2,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: '128x12 pixel-bar frame and brass-gold fill mask, rusted iron border',
  },
  {
    id: 'ui_button',
    category: 'ui',
    frameWidth: 96,
    frameHeight: 24,
    frameCount: 3,
    fps: 1,
    anchor: [0, 0],
    alignFeet: false,
    prompt: 'worn metal plate button normal, hover, and pressed states at 96x24',
  },
  // Skill Icons (32x32)
  { id: 'icon_skill_lunge', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 skill icon for Lunge: forward rail-blade thrust with signal cyan streak on dark square' },
  { id: 'icon_skill_ground_break', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 skill icon for Ground Break: rail sword slammed into cracked cyan earth on dark square' },
  { id: 'icon_skill_rail_spike', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 skill icon for Rail Spike: sharpened iron rail spike flying with cyan tip on dark square' },
  { id: 'icon_skill_seven_cuts', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 skill icon for Seven Cuts: seven intersecting signal-cyan and bone slash lines on dark square' },
  { id: 'icon_skill_locked', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 locked skill icon: heavy rusted iron padlock and chain on dark square' },

  // Item Icons (32x32)
  { id: 'icon_item_welding_goggles', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: cracked brass welding goggles with leather strap on dark square' },
  { id: 'icon_item_surplus_respirator', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: rubber surplus twin-canister respirator mask on dark square' },
  { id: 'icon_item_riders_helmet', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: battered highway dispatch riders helmet with visor on dark square' },
  { id: 'icon_item_patched_vest', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: heavy canvas work vest with tin scrap plates on dark square' },
  { id: 'icon_item_riot_jacket', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: ribbed civil-defense riot jacket with shoulder pads on dark square' },
  { id: 'icon_item_plate_coat', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: long Duster coat lined with boiler steel plates on dark square' },
  { id: 'icon_item_work_boots', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: steel-toe leather salvage boots on dark square' },
  { id: 'icon_item_courier_leggings', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: canvas courier trousers with knee braces on dark square' },
  { id: 'icon_item_hydraulic_shins', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: brass-piston hydraulic leg greaves on dark square' },
  { id: 'icon_item_gauze_roll', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: boiled bone-white bandage roll with red cross stitch on dark square' },
  { id: 'icon_item_sugar_tin', category: 'ui_icon', frameWidth: 32, frameHeight: 32, frameCount: 1, fps: 1, anchor: [16, 16], prompt: '32x32 item icon: dented pocket tin of hard brown sugar blocks on dark square' },

  // Minimap frame, coin, cursor, title key art, title logo
  { id: 'ui_minimap_frame', category: 'ui', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [0, 0], prompt: '96x96 rusted iron compass-radar minimap bezel frame with rivets' },
  { id: 'ui_coin', category: 'ui', frameWidth: 16, frameHeight: 16, frameCount: 1, fps: 1, anchor: [8, 8], prompt: '16x16 stamped brass salvage token coin with square hole' },
  { id: 'ui_cursor', category: 'ui', frameWidth: 16, frameHeight: 16, frameCount: 1, fps: 1, anchor: [8, 8], prompt: '16x16 signal cyan and bone targeting crosshair cursor' },
  { id: 'title_logo', category: 'ui', frameWidth: 360, frameHeight: 64, frameCount: 1, fps: 1, anchor: [180, 32], prompt: 'GRAVEL SKY title lettering drawn in chunky pixel letters with a rust and bone worn-stencil look' },
  { id: 'title_key_art', category: 'key_art', frameWidth: 480, frameHeight: 270, frameCount: 1, fps: 1, anchor: [0, 0], prompt: "wide pixel-art scene: Sena standing on a collapsed overpass, scarf blowing, Kettle's boiler glow far below, burnt sky" },

  // Expansion Assets from ASSETS_NEEDED.md (5 Class 6x2 Sheets, 4 Class Portraits, 4 Common Enemies, 4 Elite Enemies, 7 Town NPCs)
  { id: 'sena_sheet', category: 'player_sheet', classId: 'sena', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Sena Ibuki 384x128 6x2 chibi sheet (Row 1: 4 Idle, Row 2: 6 Run)' },
  { id: 'rook_sheet', category: 'player_sheet', classId: 'rook', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Rook Matsuda Inquisitor Marksman 384x128 6x2 chibi sheet' },
  { id: 'ines_sheet', category: 'player_sheet', classId: 'ines', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Ines Calloway Ossuary Necromancer 384x128 6x2 chibi sheet' },
  { id: 'kaelen_sheet', category: 'player_sheet', classId: 'kaelen', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Kaelen Vos Hellfire Dragoon 384x128 6x2 chibi sheet' },
  { id: 'vespera_sheet', category: 'player_sheet', classId: 'vespera', frameWidth: 64, frameHeight: 64, frameCount: 6, rows: 2, sheetW: 384, sheetH: 128, fps: 10, anchor: [32, 60], prompt: 'Vespera Locke Eldritch Soulbinder 384x128 6x2 chibi sheet' },
  { id: 'rook_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Rook Matsuda with highwayman hat, brass monocle, and Hexbane Arbalest' },
  { id: 'ines_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Ines Calloway with bone-braided hair, verdigris streaks, and dorsal reliquary coil' },
  { id: 'kaelen_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Kaelen Vos in obsidian dragonplate with horned crest helm and ember eyes' },
  { id: 'vespera_neutral', category: 'portrait', frameWidth: 96, frameHeight: 96, frameCount: 1, fps: 1, anchor: [48, 96], prompt: '96x96 anime bust portrait of Vespera Locke with astral visor, floating brass halo, and familiar skull' },
  { id: 'rivet_tick', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 8, anchor: [20, 36], alignFeet: true, prompt: 'Ossuary Skitter / Rivet Tick skull-shelled 6-legged iron crypt spider' },
  { id: 'signal_mite', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 8, anchor: [20, 34], alignFeet: false, prompt: 'Cursed Wisp / Signal Mite floating iron lantern-skull wreathed in signal-cyan soulfire' },
  { id: 'silt_mimic', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 8, anchor: [20, 36], alignFeet: true, prompt: 'Cursed Mimic / Silt Mimic bog-crusted iron coffer splitting open with jagged bone teeth' },
  { id: 'cinder_crow', category: 'enemy_common', frameWidth: 40, frameHeight: 40, frameCount: 5, fps: 10, anchor: [20, 34], alignFeet: false, prompt: 'Carrion Crow / Cinder Crow undead raven with bone skull beak and ember-orange wingtips' },
  { id: 'plate_marshal', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Dread Templar / Plate Marshal undead cathedral knight with tower shield and rusted broadsword' },
  { id: 'switchback_driver', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Hell-Steed Outrider / Switchback Driver armored outrider on spiked monowheel steed' },
  { id: 'sump_cantor', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Hex Chanter / Sump Cantor hunched fen-priest swinging a corroded brass plague-bell staff' },
  { id: 'bore_sentinel', category: 'enemy_elite', frameWidth: 80, frameHeight: 80, frameCount: 7, fps: 8, anchor: [40, 74], alignFeet: true, prompt: 'Crypt Wyrmling / Bore Sentinel segmented iron-and-bone burrowing drake with furnace throat' },
  { id: 'npc_vaelen', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Master Smith Vaelen bearded runesmith with glowing runehammer and soulfire anvil' },
  { id: 'npc_isolde', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Sister Isolde plague-alchemist nun in bog-teal and bone veil with crimson blood vial and alembic table' },
  { id: 'npc_malakor', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Chronicler Malakor hooded chronicler with brass astrolabe spectacles beside the Bloodline Ledger board' },
  { id: 'npc_solen', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Archmage Solen grand astromancer with levitating signal-cyan grimoire and starforged staff' },
  { id: 'npc_maeve', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Maeve the Hearthkeeper warm tavern hostess with wyrm-steak platter and spiced ale tankard' },
  { id: 'npc_vex', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Vex the Veil-Peddler masked curio broker with 3 sealed reliquary coffers' },
  { id: 'npc_morwen', category: 'npc', frameWidth: 64, frameHeight: 64, frameCount: 2, fps: 2, anchor: [32, 58], alignFeet: true, prompt: 'Morwen the Veil-Peddler wandering caravan mystic with monster-repelling ward lantern' },
];

// ============================================================================
// RAW PIXEL ART SHEET RENDERERS (Produces authentic 16-bit JRPG sheets in /assets-src/raw)
// ============================================================================
function drawSenaFrame(surf, ox, oy, dir, anim, frameIdx) {
  const cx = ox + 32;
  const feetY = oy + 58;
  const bob = anim === 'idle' ? (frameIdx % 2 === 1 ? 1 : 0) : anim === 'run' ? (frameIdx % 2 === 1 ? -1 : 1) : 0;
  const lungeX = anim.startsWith('attack') && frameIdx === 1 ? (dir === 'side' ? 5 : 0) : 0;
  const lungeY = anim.startsWith('attack') && frameIdx === 1 ? (dir === 'down' ? 4 : dir === 'up' ? -4 : 0) : 0;

  if (anim === 'death') {
    const drop = Math.min(12, frameIdx * 4);
    // Kneeling / fallen Sena with Railcut planted vertically
    surf.rect(cx - 10, feetY - 12, 20, 10, C.coat1);
    surf.rect(cx - 7, feetY - 22 + drop, 14, 12, C.coat2);
    surf.rect(cx - 5, feetY - 30 + drop, 10, 9, C.rust2); // head/hair
    surf.rect(cx - 6, feetY - 18 + drop, 14, 4, C.bone3); // scarf
    // Planted Railcut
    surf.rect(cx + 9, feetY - 28, 3, 26, C.slag2);
    surf.line(cx + 12, feetY - 28, cx + 12, feetY - 3, C.sig2);
    surf.outlineRegion(ox, oy, 64, 64, C.soot);
    return;
  }

  if (anim === 'dodge') {
    // Tucked rolling silhouette with bone scarf whipping
    const rollY = feetY - 16 + (frameIdx === 1 || frameIdx === 2 ? -3 : 0);
    surf.ellipse(cx, rollY, 11, 9, C.coat1);
    surf.rect(cx - 6, rollY - 5, 12, 6, C.rust2);
    surf.rect(cx - 16, rollY - 3, 12, 4, C.bone3);
    surf.rect(cx - 14, rollY - 2, 3, 4, C.rust2); // rust stripe
    surf.line(cx - 8, rollY + 4, cx + 12, rollY - 4, C.sig2);
    surf.outlineRegion(ox, oy, 64, 64, C.soot);
    return;
  }

  const bx = cx + lungeX;
  const by = feetY + bob + lungeY;

  // Legs & worn boots
  const stride = anim === 'run' ? [-5, -2, 2, 5, 2, -2][frameIdx % 6] : 0;
  surf.rect(bx - 6 + stride, by - 10, 5, 10, C.coat0);
  surf.rect(bx + 1 - stride, by - 10, 5, 10, C.coat0);
  surf.rect(bx - 6 + stride, by - 4, 6, 4, C.rust0); // left boot
  surf.rect(bx + 1 - stride, by - 4, 6, 4, C.rust0); // right boot

  // Patched Black Work Coat (frayed hem + rust shoulder patch)
  surf.rect(bx - 9, by - 25, 18, 16, C.coat1);
  surf.rect(bx - 8, by - 25, 10, 14, C.coat2); // top-left light
  // Frayed hem notches
  surf.pset(bx - 7, by - 9, C.magenta);
  surf.pset(bx - 2, by - 9, C.magenta);
  surf.pset(bx + 4, by - 9, C.magenta);
  // Square rust patch on back-left shoulder
  if (dir === 'up' || dir === 'side') {
    surf.rect(bx - 7, by - 23, 5, 5, C.rust2);
    surf.rect(bx - 7, by - 23, 4, 2, C.rust3);
  }

  // Asymmetric Arms: Left torn sleeve + grey bandaged forearm; Right brass pipe-clamp cuff
  if (dir !== 'side') {
    // Left arm (bandaged)
    surf.rect(bx - 12, by - 23, 3, 5, C.coat2);
    surf.rect(bx - 12, by - 18, 3, 6, C.bone1);
    surf.pset(bx - 11, by - 16, C.bone3);
    // Right arm (brass cuff)
    surf.rect(bx + 9, by - 23, 3, 9, C.coat1);
    surf.rect(bx + 9, by - 16, 3, 3, C.brass3);
  } else {
    // Side profile arm with bandaged forearm + brass cuff on weapon hand
    surf.rect(bx - 3, by - 21, 5, 8, C.bone2);
    surf.rect(bx + 3, by - 19, 4, 3, C.brass3);
  }

  // Bone-colored Scarf (with 1 stenciled rust stripe near tail)
  const scarfSwing = anim === 'run' ? (frameIdx % 2 === 0 ? -3 : -1) : -1;
  surf.rect(bx - 7, by - 27, 14, 4, C.bone3);
  surf.rect(bx - 13 + scarfSwing, by - 25, 8, 12, C.bone2);
  surf.rect(bx - 12 + scarfSwing, by - 25, 6, 9, C.bone3);
  surf.rect(bx - 13 + scarfSwing, by - 16, 7, 2, C.rust2); // stenciled rust stripe

  // Head & Face (4-head proportions)
  surf.rect(bx - 6, by - 38, 12, 11, C.skin2);
  surf.rect(bx - 6, by - 38, 9, 8, C.skin3);

  // Short uneven rust-red hair + longer left strand with bent paper clip
  surf.rect(bx - 7, by - 42, 14, 6, C.rust2);
  surf.rect(bx - 6, by - 42, 10, 4, C.rust3);
  if (dir !== 'up') {
    // Left longer strand + silver/bone paper clip
    surf.rect(bx - 8, by - 38, 3, 9, C.rust2);
    surf.rect(bx - 8, by - 35, 3, 1, C.boneHi); // bent paper clip
    // Cracked welding goggles pushed up on forehead
    surf.rect(bx - 6, by - 39, 12, 3, C.brass2);
    surf.rect(bx - 5, by - 39, 4, 3, C.bog2);
    surf.rect(bx + 1, by - 39, 4, 3, C.bog2);
    surf.pset(bx - 4, by - 38, C.boneHi); // crack glint
    // 2x2 eyes with 1 bone highlight pixel
    if (dir === 'down') {
      surf.rect(bx - 4, by - 33, 2, 2, C.soot);
      surf.pset(bx - 4, by - 33, C.boneHi);
      surf.rect(bx + 2, by - 33, 2, 2, C.soot);
      surf.pset(bx + 2, by - 33, C.boneHi);
    } else if (dir === 'side') {
      surf.rect(bx + 2, by - 33, 2, 2, C.soot);
      surf.pset(bx + 2, by - 33, C.boneHi);
    }
  } else {
    // Back of hair
    surf.rect(bx - 7, by - 39, 14, 9, C.rust1);
    surf.rect(bx - 6, by - 41, 12, 6, C.rust2);
  }

  // Weapon: The Railcut (22px length of rail, cloth-wrapped hilt, signal-cyan edge)
  if (anim.startsWith('attack')) {
    const hitNum = anim === 'attack1' ? 1 : anim === 'attack2' ? 2 : 3;
    if (frameIdx === 0) {
      // Anticipation windup
      surf.line(bx - 10, by - 22, bx - 22, by - 36, C.slag2, 3);
      surf.line(bx - 10, by - 23, bx - 22, by - 37, C.sig2, 1);
    } else if (frameIdx === 1) {
      // Smear & Extended Railcut Cleave
      const arcR = hitNum === 3 ? 24 : 20;
      const sx = dir === 'side' ? bx + 18 : bx;
      const sy = dir === 'down' ? by - 6 : dir === 'up' ? by - 36 : by - 20;
      surf.line(bx + 4, by - 20, sx + (dir === 'side' ? 8 : 14), sy, C.slag2, 4);
      surf.line(bx + 4, by - 21, sx + (dir === 'side' ? 9 : 15), sy, C.sig2, 2);
      // Built-in slash arc keyframe cue
      for (let a = -1.1; a <= 1.1; a += 0.1) {
        const px = sx + Math.cos(a) * arcR;
        const py = sy + Math.sin(a) * (arcR * 0.65);
        surf.pset(px, py, C.sig2);
        surf.pset(px - 1, py, C.boneHi);
      }
    } else {
      // Recovery follow-through
      surf.line(bx + 6, by - 18, bx + 24, by - 10, C.slag2, 3);
      surf.line(bx + 6, by - 17, bx + 24, by - 9, C.sig2, 1);
    }
  } else {
    // Carried at side/back
    const wx0 = bx + 7;
    const wy0 = by - 18;
    const wx1 = bx + 22;
    const wy1 = by - 30;
    surf.line(wx0, wy0, wx0 + 3, wy0 + 2, C.bone1, 2); // cloth-wrapped flange hilt
    surf.line(wx0 + 2, wy0 - 1, wx1, wy1, C.slag2, 3);
    surf.line(wx0 + 3, wy0 - 2, wx1 + 1, wy1 - 1, C.sig2, 1); // glowing signal-cyan edge
  }

  surf.outlineRegion(ox, oy, 64, 64, C.soot);
}

function drawPortraitSena(surf, mode) {
  // 96x96 bust portrait on #FF00FF magenta
  const cx = 48;
  // Shoulders & black patched coat
  surf.ellipse(cx, 88, 34, 22, C.coat1);
  surf.ellipse(cx - 6, 86, 24, 18, C.coat2);
  // Rust shoulder patch
  surf.rect(cx - 28, 72, 12, 10, C.rust2);
  // Bone scarf wraps around neck
  surf.ellipse(cx, 66, 22, 10, C.bone2);
  surf.ellipse(cx - 3, 64, 18, 8, C.bone3);
  surf.rect(cx + 8, 66, 10, 4, C.rust2); // rust stencil stripe
  // Face & jaw
  surf.ellipse(cx, 44, 18, 21, C.skin2);
  surf.ellipse(cx - 3, 42, 14, 18, C.skin3);
  // Hair back & bangs
  surf.ellipse(cx, 28, 21, 12, C.rust2);
  surf.ellipse(cx - 4, 26, 15, 9, C.rust3);
  // Left long hair strand + bent paper clip
  surf.rect(cx - 20, 30, 6, 26, C.rust2);
  surf.rect(cx - 21, 40, 7, 2, C.boneHi); // paper clip
  // Cracked welding goggles on forehead
  surf.rect(cx - 17, 24, 34, 8, C.brass1);
  surf.ellipse(cx - 8, 28, 7, 6, C.brass3);
  surf.ellipse(cx + 8, 28, 7, 6, C.brass3);
  surf.ellipse(cx - 8, 28, 5, 4, C.bog1);
  surf.ellipse(cx + 8, 28, 5, 4, C.bog1);
  surf.line(cx - 11, 26, cx - 5, 30, C.boneHi, 1); // cracked lens
  // Eyes & Expression
  const eyeColor = mode === 'sena_ultimate' ? C.sig2 : C.soot;
  const eyeHi = mode === 'sena_ultimate' ? C.sig3 : C.boneHi;
  if (mode === 'sena_hurt') {
    surf.line(cx - 11, 42, cx - 5, 45, C.soot, 2);
    surf.line(cx - 11, 46, cx - 5, 44, C.soot, 2);
    surf.line(cx + 5, 45, cx + 11, 42, C.soot, 2);
    surf.rect(cx - 5, 53, 10, 3, C.bone3); // grit teeth
    surf.line(cx + 6, 48, cx + 10, 52, C.rust1, 1); // smudge
  } else {
    surf.rect(cx - 11, 42, 6, 5, eyeColor);
    surf.rect(cx + 5, 42, 6, 5, eyeColor);
    surf.rect(cx - 10, 42, 2, 2, eyeHi);
    surf.rect(cx + 6, 42, 2, 2, eyeHi);
    // Eyebrows
    const browY = mode === 'sena_determined' || mode === 'sena_ultimate' ? 39 : 38;
    surf.line(cx - 12, browY, cx - 4, browY + 1, C.rust0, 2);
    surf.line(cx + 4, browY + 1, cx + 12, browY, C.rust0, 2);
    // Mouth
    surf.line(cx - 4, 54, cx + 4, 54, C.rust0, 1);
  }
  // Railcut hilt peeking behind right shoulder
  surf.line(cx + 18, 58, cx + 30, 22, C.slag2, 5);
  surf.line(cx + 22, 58, cx + 34, 22, C.sig2, 2);
  surf.outlineRegion(0, 0, 96, 96, C.soot);
}

function drawCommonEnemyFrame(surf, ox, oy, id, f) {
  const cx = ox + 20;
  const cy = oy + 24;
  const isDead = f === 4;
  const bob = f === 1 ? -1 : f === 2 ? 2 : 0;

  if (id === 'tin_rat') {
    if (isDead) {
      surf.ellipse(cx - 5, cy + 6, 6, 4, C.rust2); // soup can half
      surf.ellipse(cx + 6, cy + 8, 4, 2, C.slag2); // lid
      surf.line(cx - 10, cy + 9, cx - 2, cy + 10, C.rust1, 1);
    } else {
      // Tail & paws
      surf.line(cx - 14, cy + 6, cx - 6, cy + 4 + bob, C.skin1, 2);
      // Rusted soup can shell
      surf.rect(cx - 8, cy - 5 + bob, 15, 11, C.rust2);
      surf.rect(cx - 7, cy - 5 + bob, 12, 4, C.rust3);
      surf.line(cx - 3, cy - 5 + bob, cx - 3, cy + 5 + bob, C.rust0, 1);
      // Hinged can lid flapping + pointy snout + red eye
      surf.line(cx + 7, cy - 5 + bob, cx + 11, cy - (f === 2 ? 9 : 4) + bob, C.slag3, 2);
      surf.ellipse(cx + 10, cy + 2 + bob, 5, 4, C.slag2);
      surf.pset(cx + 11, cy + 1 + bob, C.blood2);
    }
  } else if (id === 'dust_dog') {
    if (isDead) {
      surf.ellipse(cx - 4, cy + 6, 7, 4, C.bone1);
      surf.rect(cx + 4, cy + 5, 5, 3, C.brass2); // fallen goggles
    } else {
      const stretch = f === 2 ? 3 : 0;
      // Starved ribcage body
      surf.ellipse(cx - 2, cy + bob, 11 + stretch, 6, C.bone1);
      surf.line(cx - 5, cy - 3 + bob, cx - 5, cy + 3 + bob, C.rust1, 1);
      surf.line(cx - 2, cy - 3 + bob, cx - 2, cy + 3 + bob, C.rust1, 1);
      surf.line(cx + 1, cy - 3 + bob, cx + 1, cy + 3 + bob, C.rust1, 1);
      // Legs
      surf.line(cx - 9, cy + 4, cx - 11 - stretch, cy + 11, C.bone0, 2);
      surf.line(cx + 6, cy + 4, cx + 9 + stretch, cy + 11, C.bone0, 2);
      // Rag collar + hanging welding goggles
      surf.rect(cx + 5, cy - 3 + bob, 3, 7, C.rust2);
      surf.rect(cx + 6, cy + 3 + bob, 4, 3, C.brass3);
      // Low-slung hound head
      surf.ellipse(cx + 11 + stretch, cy + 1 + bob, 5, 4, C.bone2);
      surf.pset(cx + 13 + stretch, cy + bob, C.blood2);
    }
  } else if (id === 'wire_kite') {
    if (isDead) {
      surf.line(cx - 8, cy + 6, cx + 8, cy + 10, C.wood, 2);
      surf.ellipse(cx, cy + 8, 5, 3, C.slag2);
    } else {
      // Crossed sticks + torn plastic wings + blood camera lens + trailing wire
      surf.line(cx - 13, cy - 6 + bob, cx + 13, cy - 6 + bob, C.wood, 2);
      surf.line(cx, cy - 12 + bob, cx, cy + 4 + bob, C.wood, 2);
      surf.ellipse(cx - 7, cy - 6 + bob, 6, 4, C.bone1);
      surf.ellipse(cx + 7, cy - 6 + bob, 6, 4, C.bone1);
      surf.ellipse(cx, cy - 6 + bob, 4, 4, C.slag1);
      surf.rect(cx - 1, cy - 7 + bob, 3, 3, C.blood2);
      // Trailing wire tail
      surf.line(cx, cy + 4 + bob, cx - 4 + (f % 2) * 3, cy + 12, C.slag3, 1);
    }
  } else if (id === 'lye_leech') {
    if (isDead) {
      surf.ellipse(cx, cy + 8, 10, 3, C.bile1);
    } else {
      const w = f === 1 ? 13 : f === 2 ? 15 : 11;
      surf.ellipse(cx, cy + 5, w, 6, C.bile1);
      surf.ellipse(cx - 2, cy + 3, w - 3, 4, C.bile2);
      // Ring mouth of tiny bone teeth
      surf.ellipse(cx + w - 2, cy + 5, 4, 4, C.soot);
      surf.pset(cx + w - 4, cy + 3, C.bone3);
      surf.pset(cx + w, cy + 3, C.bone3);
      surf.pset(cx + w - 4, cy + 7, C.bone3);
      surf.pset(cx + w, cy + 7, C.bone3);
    }
  } else if (id === 'sump_bat') {
    if (isDead) {
      surf.ellipse(cx, cy + 7, 9, 4, C.bog1);
    } else {
      const wingY = f === 1 ? -8 : 2;
      // Bent umbrella rib wings + swollen pale belly sac
      surf.line(cx, cy - 2, cx - 15, cy + wingY, C.slag3, 2);
      surf.line(cx, cy - 2, cx + 15, cy + wingY, C.slag3, 2);
      surf.ellipse(cx - 8, cy + (wingY >> 1), 6, 4, C.bog2);
      surf.ellipse(cx + 8, cy + (wingY >> 1), 6, 4, C.bog2);
      surf.ellipse(cx, cy + 3, 6, 6, C.bile2); // swollen pale sac
      surf.ellipse(cx, cy - 3, 4, 4, C.coat1);
      surf.pset(cx - 2, cy - 4, C.blood2);
      surf.pset(cx + 2, cy - 4, C.blood2);
    }
  }
  surf.outlineRegion(ox, oy, 40, 40, C.soot);
}

function drawEliteEnemyFrame(surf, ox, oy, id, f) {
  const cx = ox + 40;
  const cy = oy + 46;
  const isDead = f === 6;
  const isTell = f === 2;
  const isAtk = f === 3 || f === 4;
  const bob = f === 1 ? -2 : 0;

  if (id === 'cleaver_hauler') {
    if (isDead) {
      surf.ellipse(cx - 12, cy + 16, 12, 8, C.rust1); // overturned cart
      surf.rect(cx + 4, cy + 18, 18, 6, C.slag3); // fallen cleaver
    } else {
      // Wheeled scrap cart dragged behind + chain
      surf.rect(cx - 32, cy - 4, 18, 16, C.rust1);
      surf.ellipse(cx - 24, cy + 14, 6, 6, C.slag1);
      surf.line(cx - 14, cy + 4, cx - 4, cy + 2, C.slag3, 2);
      // Hunched scavenger body
      surf.ellipse(cx + 2, cy - 4 + bob, 13, 16, C.coat1);
      surf.ellipse(cx + 5, cy - 18 + bob, 7, 7, C.bone1); // rag-wrapped head
      surf.pset(cx + 8, cy - 19 + bob, C.blood2);
      // Welded butcher's cleaver right arm
      const cleaverY = isTell ? cy - 28 : isAtk ? cy + 8 : cy - 8;
      surf.rect(cx + 12, cleaverY, 18, 9, C.slag3);
      surf.rect(cx + 12, cleaverY + 7, 18, 2, isTell ? C.brass3 : C.boneHi);
    }
  } else if (id === 'lye_strider') {
    if (isDead) {
      surf.line(cx - 22, cy + 20, cx + 20, cy + 24, C.slag2, 3);
      surf.ellipse(cx, cy + 16, 12, 8, C.bog2);
    } else {
      // Tall pipe stilts
      const stride = f === 1 ? 5 : 0;
      surf.line(cx - 6 - stride, cy - 6, cx - 12 - stride, cy + 26, C.slag2, 3);
      surf.line(cx + 6 + stride, cy - 6, cx + 12 + stride, cy + 26, C.slag2, 3);
      // Chemical tank on back
      surf.rect(cx - 14, cy - 26 + bob, 14, 20, C.bog2);
      surf.rect(cx - 12, cy - 22 + bob, 10, 8, isTell ? C.sig2 : C.bile2);
      // Torso & funnel head
      surf.ellipse(cx + 2, cy - 14 + bob, 9, 11, C.rust1);
      surf.ellipse(cx + 6, cy - 28 + bob, 7, 5, C.slag3); // funnel head
      if (isAtk) {
        surf.ellipse(cx + 20, cy - 24, 8, 5, C.bile2);
      }
    }
  } else if (id === 'flats_harvester') {
    if (isDead) {
      surf.ellipse(cx, cy + 14, 22, 10, C.rust1);
    } else {
      // Tracked chassis + operator torso + spinning red-stained blade drum
      surf.rect(cx - 24, cy + 4, 42, 16, C.rust1);
      surf.rect(cx - 20, cy + 16, 36, 8, C.slag1);
      surf.ellipse(cx - 6, cy - 8 + bob, 10, 12, C.coat2);
      surf.ellipse(cx - 4, cy - 20 + bob, 6, 6, C.skin1);
      // Front harvester drum
      const drumX = cx + 18 + (isAtk ? 6 : 0);
      surf.ellipse(drumX, cy + 6, 13, 13, C.slag2);
      surf.ellipse(drumX, cy + 6, 9, 9, C.rust2);
      // Blades
      const bladeCol = isTell ? C.brass3 : C.blood2;
      surf.line(drumX - 14, cy + 6, drumX + 14, cy + 6, bladeCol, 3);
      surf.line(drumX, cy - 8, drumX, cy + 20, bladeCol, 3);
    }
  }
  surf.outlineRegion(ox, oy, 80, 80, C.blood2);
}

function drawBossFrame(surf, ox, oy, w, h, id, f) {
  const cx = ox + (w >> 1);
  const cy = oy + (h >> 1) + 10;
  const isDead = f >= 7;
  const isPhase = f === 6;
  const isAtkA = f === 2 || f === 3;
  const isAtkB = f === 4 || f === 5;

  if (id === 'the_foreman') {
    // 192x192 Excavator rig with skeleton in yellow hard hat, rusted bucket arm, wrecking ball
    surf.rect(cx - 56, cy + 26, 112, 28, C.slag1); // caterpillar tracks
    surf.rect(cx - 50, cy + 32, 100, 16, C.slag0);
    if (!isDead) {
      surf.rect(cx - 46, cy - 24, 88, 52, C.rust2); // excavator housing
      surf.rect(cx - 42, cy - 20, 76, 22, C.rust3);
      // Cab + skeleton in yellow/brass hard hat
      surf.rect(cx - 10, cy - 52, 36, 30, C.slag2);
      surf.ellipse(cx + 8, cy - 36, 7, 7, C.bone3); // skull
      surf.ellipse(cx + 8, cy - 42, 9, 4, C.brass3); // yellow hard hat
      // Articulated rusted bucket arm
      const armDrop = isAtkA ? 26 : isPhase ? -16 : 0;
      surf.line(cx + 30, cy - 18, cx + 68, cy - 48 + armDrop, C.rust2, 10);
      surf.rect(cx + 58, cy - 22 + armDrop, 26, 22, C.slag3); // toothed bucket
      // Wrecking ball on chain
      const swingX = isAtkB ? 24 : 0;
      surf.line(cx - 42, cy - 24, cx - 68 + swingX, cy + 12, C.slag3, 3);
      surf.ellipse(cx - 68 + swingX, cy + 20, 16, 16, C.slag1);
    } else {
      surf.ellipse(cx, cy + 12, 52, 22, C.rust1);
    }
  } else if (id === 'big_axle') {
    // 224x160 Armored semi-truck cab dragging two chained trailer sections, headlights glowing
    const shift = isAtkA ? 14 : 0;
    // Two chained trailer sections behind
    surf.rect(cx - 96 + shift, cy - 18, 48, 42, C.rust1);
    surf.rect(cx - 42 + shift, cy - 22, 52, 46, C.rust2);
    // Main armored cab
    surf.rect(cx + 16 + shift, cy - 30, 68, 56, C.slag2);
    surf.rect(cx + 22 + shift, cy - 26, 52, 24, C.rust3);
    // Dented jaw grille & glowing headlights
    surf.rect(cx + 72 + shift, cy - 12, 14, 32, C.slag3);
    surf.ellipse(cx + 82 + shift, cy - 16, 5, 5, isPhase ? C.blood2 : C.brass3);
    surf.ellipse(cx + 82 + shift, cy + 8, 5, 5, isPhase ? C.blood2 : C.brass3);
    // 6 heavy wheels
    for (const wx of [-80, -56, -26, 0, 32, 66]) {
      surf.ellipse(cx + wx + shift, cy + 28, 12, 12, C.coat0);
      surf.ellipse(cx + wx + shift, cy + 28, 5, 5, C.slag3);
    }
  } else if (id === 'mother_sump') {
    // 192x192 Heaving mass of rusted drums and torn tarp with pulsing pale sac in toxic water
    surf.ellipse(cx, cy + 32, 78, 22, C.bog1); // toxic water puddle
    if (!isDead) {
      surf.ellipse(cx, cy + 2, 62, 44, C.bog2); // torn tarp mound
      // Rusted chemical drums embedded
      surf.rect(cx - 48, cy - 12, 24, 32, C.rust2);
      surf.rect(cx + 26, cy - 8, 24, 32, C.rust1);
      // Pulsing pale sac
      const sacR = isAtkA || isPhase ? 28 : 22;
      surf.ellipse(cx, cy - 4, sacR, sacR - 4, C.bile2);
      surf.ellipse(cx - 6, cy - 8, sacR - 8, sacR - 10, C.bone3);
    } else {
      surf.ellipse(cx, cy + 24, 68, 16, C.bile1);
    }
  } else if (id === 'the_long_dry') {
    // 256x192 Giant worm built from stacked rusted pipe rings, mouth ringed with drill bits, bursting from red sand
    surf.ellipse(cx, cy + 44, 96, 18, C.rust2); // red sand mound
    if (!isDead) {
      const arch = isAtkA ? -16 : isAtkB ? 12 : 0;
      for (let seg = 0; seg < 6; seg++) {
        const sx = cx - 68 + seg * 26;
        const sy = cy + 26 - Math.sin((seg / 5) * Math.PI) * (64 - arch);
        surf.ellipse(sx, sy, 24, 22, seg % 2 === 0 ? C.rust2 : C.slag2);
        surf.ellipse(sx - 4, sy - 4, 18, 15, C.rust3);
      }
      // Mouth ringed with drill bits on head segment
      const hx = cx + 64;
      const hy = cy - 10 + arch;
      surf.ellipse(hx, hy, 26, 26, C.slag1);
      surf.ellipse(hx + 4, hy, 16, 16, C.soot);
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        surf.ellipse(hx + 4 + Math.cos(ang) * 18, hy + Math.sin(ang) * 18, 5, 4, C.brass3);
      }
    } else {
      surf.ellipse(cx, cy + 36, 86, 14, C.slag2);
    }
  }
  surf.outlineRegion(ox, oy, w, h, C.brass3);
}

function drawFxStrip(surf, spec) {
  const { id, frameWidth: fw, frameHeight: fh, frameCount: fc } = spec;
  for (let f = 0; f < fc; f++) {
    const ox = f * fw;
    const cx = ox + (fw >> 1);
    const cy = fh >> 1;

    if (id === 'fx_slash_smear') {
      // 5 frames crescent sword-slash smear, white/bone core with signal-cyan edge
      const r = 26 + f * 6;
      const span = 1.4 - f * 0.18;
      for (let a = -span; a <= span; a += 0.02) {
        const thick = Math.max(1, Math.round((1 - Math.abs(a) / span) * (10 - f * 1.5)));
        for (let t = -thick; t <= thick; t++) {
          const px = cx + Math.cos(a) * (r + t);
          const py = cy + Math.sin(a) * ((r + t) * 0.72);
          surf.pset(px, py, Math.abs(t) >= thick - 1 ? C.sig2 : C.boneHi);
        }
      }
    } else if (id === 'fx_dash_streak') {
      const len = 130 - f * 24;
      for (let i = 0; i < 5; i++) {
        const ly = 10 + i * 7;
        surf.line(ox + 12 + f * 14, ly, ox + 12 + len, ly, i % 2 === 0 ? C.sig2 : C.boneHi, 2);
      }
    } else if (id === 'fx_hit_cross') {
      const arm = 18 - f * 4;
      surf.line(cx - arm, cy - arm, cx + arm, cy + arm, C.sig2, 3);
      surf.line(cx - arm, cy + arm, cx + arm, cy - arm, C.boneHi, 3);
    } else if (id === 'fx_shards') {
      const dist = 6 + f * 6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + f * 0.3;
        surf.rect(cx + Math.cos(a) * dist - 2, cy + Math.sin(a) * dist - 2, 4, 4, i % 2 === 0 ? C.bone3 : C.rust3);
      }
    } else if (id === 'fx_shock_ring') {
      const rx = 24 + f * 18;
      const ry = Math.round(rx * 0.65);
      for (let a = 0; a < Math.PI * 2; a += 0.02) {
        const px = cx + Math.cos(a) * rx;
        const py = cy + Math.sin(a) * ry;
        surf.rect(px - 1, py - 1, 3, 3, C.sig2);
        surf.pset(px, py, C.boneHi);
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
    } else if (id === 'rail_spike') {
      // 4 angles: 0=right, 1=down-right, 2=down, 3=up-right
      const angles = [0, Math.PI / 4, Math.PI / 2, -Math.PI / 4];
      const ang = angles[f] || 0;
      const dx = Math.cos(ang) * 6;
      const dy = Math.sin(ang) * 6;
      surf.line(cx - dx, cy - dy, cx + dx, cy + dy, C.slag3, 3);
      surf.rect(cx + dx - 1, cy + dy - 1, 3, 3, C.sig2);
    } else if (id === 'fx_spark') {
      const r = 4 + f * 3;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        surf.line(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, f === 0 ? C.boneHi : C.sig2, 2);
      }
    } else if (id === 'ultimate_cutin') {
      surf.rect(0, 0, fw, fh, C.soot);
      for (let y = 0; y < fh; y += 4) {
        surf.line(0, y, fw, y, y % 8 === 0 ? C.slag1 : C.coat1, 1);
      }
      surf.rect(0, 0, fw, 4, C.sig2);
      surf.rect(0, fh - 4, fw, 4, C.sig2);
      // Close-up of Sena's rust hair and blazing signal-cyan eyes
      surf.ellipse(240, 60, 140, 48, C.skin2);
      surf.rect(60, 8, 360, 24, C.rust2);
      surf.ellipse(185, 62, 24, 12, C.soot);
      surf.ellipse(295, 62, 24, 12, C.soot);
      surf.ellipse(185, 62, 12, 9, C.sig2);
      surf.ellipse(295, 62, 12, 9, C.sig2);
      surf.rect(180, 58, 5, 5, C.boneHi);
      surf.rect(290, 58, 5, 5, C.boneHi);
    } else if (id === 'fx_ult_slash') {
      surf.line(ox + 8, cy + (f - 1) * 6, ox + fw - 8, cy - (f - 1) * 6, C.sig2, 5);
      surf.line(ox + 16, cy + (f - 1) * 6, ox + fw - 16, cy - (f - 1) * 6, C.boneHi, 2);
    }
  }
}

function drawTileStrip(surf, spec) {
  const { id, frameWidth: fw, frameHeight: fh, frameCount: fc } = spec;
  for (let f = 0; f < fc; f++) {
    const ox = f * fw;
    let base = C.coat1;
    let p1 = C.coat2;
    let p2 = C.rust1;
    if (id === 'tile_kettle') {
      base = C.coat1;
      p1 = C.rust1;
      p2 = C.slag1;
    } else if (id === 'tile_slab_town') {
      base = C.slag1;
      p1 = C.slag2;
      p2 = C.coat0;
    } else if (id === 'tile_route_9') {
      base = C.coat0;
      p1 = C.slag1;
      p2 = f === 1 ? C.brass2 : C.coat2; // faded lane paint on variant 1
    } else if (id === 'tile_lye_marsh') {
      base = C.bog0;
      p1 = C.bog1;
      p2 = C.bile0;
    } else if (id === 'tile_copper_flats') {
      base = C.rust0;
      p1 = C.rust1;
      p2 = C.rust2;
    }
    surf.rect(ox, 0, fw, fh, base);
    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const h = ((x * 37 + y * 17 + f * 53) & 0xff);
        if (h < 36) surf.pset(ox + x, y, p1);
        else if (h > 235) surf.pset(ox + x, y, p2);
      }
    }
    if (id === 'tile_route_9' && f === 1) {
      surf.rect(ox + 7, 2, 2, 12, C.brass1);
    }
  }
}

function drawPropStrip(surf, spec) {
  const { id, frameWidth: fw, frameHeight: fh, frameCount: fc } = spec;
  for (let f = 0; f < fc; f++) {
    const ox = f * fw;
    const cx = ox + (fw >> 1);
    const by = fh - 6;
    // Baked solid shadow ellipse
    surf.ellipse(cx, by, Math.max(10, (fw >> 1) - 6), Math.max(4, Math.floor(fh * 0.14)), C.soot);

    if (id === 'prop_kettle_campfire') {
      surf.ellipse(cx, by - 3, 10, 5, C.slag2);
      const flameH = 9 + (f % 3) * 2;
      surf.ellipse(cx, by - 5 - (flameH >> 1), 6, flameH >> 1, C.rust3);
      surf.ellipse(cx + (f - 1), by - 5 - (flameH >> 1), 3, (flameH >> 1) - 1, C.brass3);
    } else if (id.includes('boiler') || id.includes('silo')) {
      surf.rect(cx - 26, 12, 52, by - 14, C.rust1);
      surf.rect(cx - 22, 14, 34, by - 18, C.rust2);
      surf.rect(cx - 12, by - 22, 24, 14, C.brass2); // boiler glow grate
    } else if (id.includes('shack') || id.includes('tent')) {
      surf.rect(cx - 26, by - 32, 52, 28, C.slag2);
      surf.rect(cx - 30, by - 38, 60, 10, C.rust2);
      surf.rect(cx - 8, by - 20, 14, 16, C.soot);
    } else if (id.includes('car') || id.includes('truck') || id.includes('harvester')) {
      surf.rect(cx - (fw >> 2) - 8, by - 26, (fw >> 1) + 16, 20, C.rust2);
      surf.rect(cx - (fw >> 2), by - 36, fw >> 1, 12, C.slag2);
      surf.ellipse(cx - (fw >> 2), by - 4, 7, 7, C.coat0);
      surf.ellipse(cx + (fw >> 2), by - 4, 7, 7, C.coat0);
    } else {
      // Distinct industrial prop silhouette per item
      const h = Math.max(16, fh - 16);
      const w = Math.max(14, fw - 18);
      surf.rect(cx - (w >> 1), by - h, w, h - 2, id.includes('marsh') ? C.bog2 : C.slag2);
      surf.rect(cx - (w >> 1) + 2, by - h + 2, w - 6, (h >> 1), id.includes('flats') ? C.rust3 : C.rust2);
    }
    surf.outlineRegion(ox, 0, fw, fh, C.soot);
  }
}

function drawUmeStrip(surf, spec) {
  for (let f = 0; f < 2; f++) {
    const ox = f * 64;
    const cx = ox + 32;
    const by = 58;
    // Pawn counter in front + crate of mixed junk beside her
    surf.ellipse(cx, by, 24, 6, C.soot);
    // Ume torso & rolled sleeves + reading glasses on chain
    surf.rect(cx - 10, by - 34 + f, 16, 18, C.rust1);
    surf.ellipse(cx - 2, by - 42 + f, 7, 7, C.skin2);
    surf.ellipse(cx - 2, by - 46 + f, 8, 5, C.bone2); // grey bun hair
    surf.rect(cx - 6, by - 42 + f, 8, 2, C.brass3); // reading glasses
    // Wooden pawn counter & junk crate
    surf.rect(cx - 22, by - 20, 36, 16, C.wood);
    surf.rect(cx - 20, by - 22, 32, 4, C.rust2);
    surf.rect(cx + 14, by - 18, 12, 14, C.slag2);
    surf.outlineRegion(ox, 0, 64, 64, C.soot);
  }
}

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
    for (const [rx, ry] of [[5, 5], [fw - 7, 5], [5, fh - 7], [fw - 7, fh - 7]]) {
      surf.rect(rx, ry, 2, 2, C.brass3);
    }
  } else if (id.startsWith('ui_bar_')) {
    const fillCol = id.includes('hp') ? C.blood2 : id.includes('stamina') ? C.sig2 : C.brass3;
    const shadeCol = id.includes('hp') ? C.blood1 : id.includes('stamina') ? C.sig1 : C.brass1;
    // Frame 0: empty bar frame; Frame 1: full fill bar
    surf.rect(0, 0, fw, fh, C.soot);
    surf.rect(1, 1, fw - 2, fh - 2, C.slag2);
    surf.rect(2, 2, fw - 4, fh - 4, C.coat0);
    surf.rect(fw, 0, fw, fh, C.soot);
    surf.rect(fw + 2, 2, fw - 4, fh - 4, shadeCol);
    surf.rect(fw + 2, 2, fw - 4, fh - 6, fillCol);
    surf.rect(fw + 2, 2, fw - 4, 2, C.boneHi);
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
    surf.rect(0, 0, 32, 32, C.soot);
    surf.rect(1, 1, 30, 30, C.slag1);
    surf.rect(2, 2, 28, 28, C.coat0);
    if (id === 'icon_skill_lunge') {
      surf.line(6, 24, 25, 7, C.slag3, 4);
      surf.line(7, 23, 26, 6, C.sig2, 2);
      surf.line(4, 18, 18, 6, C.boneHi, 1);
    } else if (id === 'icon_skill_ground_break') {
      surf.rect(14, 4, 4, 18, C.slag3);
      surf.line(18, 4, 18, 22, C.sig2, 1);
      surf.line(5, 24, 27, 24, C.sig2, 2);
      surf.line(8, 24, 4, 29, C.boneHi, 2);
      surf.line(24, 24, 28, 29, C.boneHi, 2);
    } else if (id === 'icon_skill_rail_spike') {
      surf.line(6, 26, 24, 8, C.slag3, 3);
      surf.rect(22, 6, 5, 5, C.sig2);
      surf.rect(7, 23, 3, 3, C.rust3);
    } else if (id === 'icon_skill_seven_cuts') {
      const lines = [
        [4, 8, 28, 24],
        [4, 22, 28, 10],
        [10, 4, 22, 28],
        [18, 4, 12, 28],
        [6, 15, 26, 15],
      ];
      for (const [x0, y0, x1, y1] of lines) {
        surf.line(x0, y0, x1, y1, C.sig2, 2);
        surf.line(x0 + 1, y0, x1 - 1, y1, C.boneHi, 1);
      }
    } else if (id === 'icon_skill_locked') {
      surf.rect(9, 14, 14, 12, C.rust1);
      surf.line(12, 14, 12, 8, C.slag3, 2);
      surf.line(20, 14, 20, 8, C.slag3, 2);
      surf.line(12, 8, 20, 8, C.slag3, 2);
      surf.rect(15, 18, 2, 4, C.soot);
    } else if (id.includes('goggles')) {
      surf.rect(5, 12, 22, 9, C.brass2);
      surf.ellipse(11, 16, 4, 4, C.bog2);
      surf.ellipse(21, 16, 4, 4, C.bog2);
    } else if (id.includes('respirator')) {
      surf.ellipse(16, 15, 7, 8, C.slag2);
      surf.ellipse(9, 20, 4, 4, C.rust2);
      surf.ellipse(23, 20, 4, 4, C.rust2);
    } else if (id.includes('helmet')) {
      surf.ellipse(16, 16, 10, 9, C.bone2);
      surf.rect(10, 14, 14, 5, C.sig1);
    } else if (id.includes('vest') || id.includes('jacket') || id.includes('coat')) {
      const col = id.includes('coat') ? C.brass2 : id.includes('jacket') ? C.bog2 : C.rust2;
      surf.rect(8, 7, 16, 19, col);
      surf.rect(11, 10, 10, 14, C.slag2);
    } else if (id.includes('boots') || id.includes('leggings') || id.includes('shins')) {
      const col = id.includes('shins') ? C.brass3 : id.includes('leggings') ? C.bog2 : C.rust2;
      surf.rect(9, 7, 5, 16, col);
      surf.rect(18, 7, 5, 16, col);
      surf.rect(9, 21, 8, 4, C.slag3);
      surf.rect(18, 21, 8, 4, C.slag3);
    } else if (id.includes('gauze')) {
      surf.ellipse(16, 16, 9, 7, C.bone3);
      surf.rect(15, 12, 3, 9, C.blood2);
      surf.rect(12, 15, 9, 3, C.blood2);
    } else if (id.includes('sugar')) {
      surf.rect(8, 9, 16, 14, C.brass2);
      surf.rect(10, 11, 12, 10, C.rust2);
      surf.rect(13, 14, 6, 4, C.boneHi);
    }
  } else if (id === 'ui_minimap_frame') {
    surf.rect(0, 0, fw, fh, C.slag2);
    surf.rect(2, 2, fw - 4, fh - 4, C.rust1);
    surf.rect(4, 4, fw - 8, fh - 8, C.magenta);
  } else if (id === 'ui_coin') {
    surf.ellipse(8, 8, 6, 6, C.brass3);
    surf.ellipse(7, 7, 4, 4, C.brass2);
    surf.rect(7, 7, 2, 2, C.soot);
  } else if (id === 'ui_cursor') {
    surf.line(8, 1, 8, 14, C.sig2, 1);
    surf.line(1, 8, 14, 8, C.sig2, 1);
    surf.rect(7, 7, 2, 2, C.boneHi);
  } else if (id === 'title_logo') {
    // Transparent background (#FF00FF magenta) with chunky worn-stencil pixel letters "GRAVEL SKY"
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
            // Drop shadow in soot
            surf.rect(px + 3, py + 3, scale, scale, C.soot);
            // Worn stencil bone top, rust bottom
            const fill = gy < 3 ? C.bone3 : gy === 3 ? C.brass3 : C.rust3;
            surf.rect(px, py, scale, scale, fill);
            // Stencil horizontal cut gap at row 3
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
    // 480x270 scene (which will be integer-scaled 4x to 1920x1080 on disk!)
    for (let y = 0; y < fh; y++) {
      const col = y < 58 ? C.soot : y < 115 ? C.rust0 : y < 168 ? C.rust1 : C.coat0;
      surf.rect(0, y, fw, 1, col);
    }
    // Ash clouds & broken skyline silhouettes
    for (let x = 0; x < fw; x += 28) {
      const bh = 25 + ((x * 19) % 45);
      surf.rect(x, 168 - bh, 22, bh, C.coat0);
    }
    // Kettle's warm boiler glow far below in the valley
    surf.ellipse(350, 195, 58, 22, C.rust2);
    surf.ellipse(350, 195, 32, 12, C.rust3);
    surf.ellipse(350, 195, 14, 6, C.brass3);
    // Collapsed concrete highway overpass in foreground left
    surf.rect(0, 196, 275, 74, C.slag0);
    surf.rect(0, 192, 282, 10, C.slag2);
    surf.line(275, 196, 310, 224, C.slag1, 3); // protruding rebar
    // Sena standing on the overpass edge looking out, scarf blowing, Railcut glowing signal cyan
    drawSenaFrame(surf, 142, 142, 'side', 'idle', 0);
  }
}

export function ensureRawAsset(spec, force = false) {
  const gptPath = path.join(ROOT, 'gptgen', `${spec.id}.png`);
  const geminiPath = path.join(ROOT, 'geminigen', `${spec.id}.png`);
  const rawPath = path.join(RAW_DIR, `${spec.id}.png`);
  if (!force) {
    if (fs.existsSync(gptPath)) return gptPath;
    if (fs.existsSync(geminiPath)) return geminiPath;
    if (fs.existsSync(rawPath)) return rawPath;
  }

  const totalW = spec.frameWidth * spec.frameCount;
  const totalH = spec.frameHeight;
  const surf = new Surface(totalW, totalH, C.magenta, 255);

  if (spec.id === 'sena_turnaround') {
    const dirs = ['down', 'up', 'side', 'side'];
    for (let f = 0; f < 4; f++) {
      drawSenaFrame(surf, f * 64, 0, dirs[f], 'idle', 0);
    }
  } else if (spec.category === 'player') {
    for (let f = 0; f < spec.frameCount; f++) {
      drawSenaFrame(surf, f * 64, 0, spec.dir || 'down', spec.anim || 'idle', f);
    }
  } else if (spec.category === 'portrait') {
    drawPortraitSena(surf, spec.id);
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
    drawUmeStrip(surf, spec);
  } else {
    drawUiAsset(surf, spec);
  }

  fs.writeFileSync(rawPath, encodePNG(totalW, totalH, surf.data));
  return rawPath;
}

// ============================================================================
// STEP 1: THE 6-STAGE PROCESSING PIPELINE
// ============================================================================
function nearestPaletteColor(r, g, b) {
  let bestDist = Infinity;
  let best = GLOBAL_PALETTE_RGB[0];
  for (let i = 0; i < GLOBAL_PALETTE_RGB.length; i++) {
    const c = GLOBAL_PALETTE_RGB[i];
    const dr = r - c[0];
    const dg = g - c[1];
    const db = b - c[2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

export function processRawSheet(rawImg, spec) {
  const { frameWidth: fw, frameHeight: fh, frameCount: fc } = spec;
  const targetW = spec.sheetW || fw * fc;
  const targetH = spec.sheetH || fh;

  // Stage 1: Remove #FF00FF background with tolerance 40, then clean pink-tinted fringe pixels
  const srcW = rawImg.width;
  const srcH = rawImg.height;
  const cleaned = new Uint8Array(rawImg.data);

  for (let i = 0; i < srcW * srcH; i++) {
    const idx = i * 4;
    const r = cleaned[idx];
    const g = cleaned[idx + 1];
    const b = cleaned[idx + 2];
    const distToMagenta = Math.hypot(r - 255, g - 0, b - 255);
    if (distToMagenta <= 40) {
      cleaned[idx + 3] = 0;
    }
  }

  // Clean pink-tinted fringe pixels bordering transparent pixels
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const idx = (y * srcW + x) * 4;
      if (cleaned[idx + 3] === 0) continue;
      const r = cleaned[idx];
      const g = cleaned[idx + 1];
      const b = cleaned[idx + 2];
      const isPinkFringe = r > g + 45 && b > g + 45 && r > 140 && b > 140;
      if (!isPinkFringe) continue;
      let touchesAlpha = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= srcW || ny >= srcH) {
          touchesAlpha = true;
        } else if (cleaned[(ny * srcW + nx) * 4 + 3] === 0) {
          touchesAlpha = true;
        }
      }
      if (touchesAlpha) {
        cleaned[idx + 3] = 0;
      }
    }
  }

  // Stage 3: Resample to target grid (nearest-neighbor / cell center if scaled)
  const resampled = new Uint8Array(targetW * targetH * 4);
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const sx = Math.min(srcW - 1, Math.floor(((x + 0.5) * srcW) / targetW));
      const sy = Math.min(srcH - 1, Math.floor(((y + 0.5) * srcH) / targetH));
      const sIdx = (sy * srcW + sx) * 4;
      const dIdx = (y * targetW + x) * 4;
      resampled[dIdx] = cleaned[sIdx];
      resampled[dIdx + 1] = cleaned[sIdx + 1];
      resampled[dIdx + 2] = cleaned[sIdx + 2];
      resampled[dIdx + 3] = cleaned[sIdx + 3];
    }
  }

  // Stage 4: Quantize to the shared 48-color global palette
  for (let i = 0; i < targetW * targetH; i++) {
    const idx = i * 4;
    if (resampled[idx + 3] < 128) {
      resampled[idx] = 0;
      resampled[idx + 1] = 0;
      resampled[idx + 2] = 0;
      resampled[idx + 3] = 0;
    } else {
      const q = nearestPaletteColor(resampled[idx], resampled[idx + 1], resampled[idx + 2]);
      resampled[idx] = q[0];
      resampled[idx + 1] = q[1];
      resampled[idx + 2] = q[2];
      resampled[idx + 3] = 255;
    }
  }

  // Stage 2 & Stage 5: Per-frame bounding box crop + 2px padding & Feet Anchor alignment (bottom center)
  if (!spec.alignFeet) {
    return { width: targetW, height: targetH, data: resampled };
  }

  const aligned = new Uint8Array(targetW * targetH * 4);
  const anchorX = spec.anchor ? spec.anchor[0] : fw >> 1;
  const anchorY = spec.anchor ? spec.anchor[1] : fh - 4;

  for (let f = 0; f < fc; f++) {
    const ox = f * fw;
    let minX = fw;
    let maxX = -1;
    let minY = fh;
    let maxY = -1;

    for (let y = 0; y < fh; y++) {
      for (let x = 0; x < fw; x++) {
        const idx = (y * targetW + (ox + x)) * 4;
        if (resampled[idx + 3] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX) continue;

    const bboxCenterX = Math.round((minX + maxX) / 2);
    const shiftX = anchorX - bboxCenterX;
    const shiftY = anchorY - maxY;

    for (let y = Math.max(0, minY - 2); y <= Math.min(fh - 1, maxY + 2); y++) {
      for (let x = Math.max(0, minX - 2); x <= Math.min(fw - 1, maxX + 2); x++) {
        const sIdx = (y * targetW + (ox + x)) * 4;
        if (resampled[sIdx + 3] === 0) continue;
        const dx = x + shiftX;
        const dy = y + shiftY;
        if (dx < 0 || dy < 0 || dx >= fw || dy >= fh) continue;
        const dIdx = (dy * targetW + (ox + dx)) * 4;
        aligned[dIdx] = resampled[sIdx];
        aligned[dIdx + 1] = resampled[sIdx + 1];
        aligned[dIdx + 2] = resampled[sIdx + 2];
        aligned[dIdx + 3] = 255;
      }
    }
  }

  return { width: targetW, height: targetH, data: aligned };
}

// ============================================================================
// MAIN EXECUTION: PROCESS ASSETS, PACK 2048x2048 ATLAS, WRITE MANIFEST & CONTACT SHEET
// ============================================================================
function scaleIntegerRgba(srcW, srcH, srcData, factor) {
  const dstW = srcW * factor;
  const dstH = srcH * factor;
  const dst = new Uint8Array(dstW * dstH * 4);
  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const sIdx = (y * srcW + x) * 4;
      const r = srcData[sIdx];
      const g = srcData[sIdx + 1];
      const b = srcData[sIdx + 2];
      const a = srcData[sIdx + 3];
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const dIdx = ((y * factor + dy) * dstW + (x * factor + dx)) * 4;
          dst[dIdx] = r;
          dst[dIdx + 1] = g;
          dst[dIdx + 2] = b;
          dst[dIdx + 3] = a;
        }
      }
    }
  }
  return { width: dstW, height: dstH, data: dst };
}

function runPipeline() {
  const forceRaw = process.argv.includes('--force');
  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    internalResolution: { width: 480, height: 270 },
    palette: PALETTE_HEX,
    atlases: ['atlas_0.png'],
    assets: {},
  };

  // 2048x2048 shelf packer for atlas_0.png
  const ATLAS_SIZE = 2048;
  const atlasRgba = new Uint8Array(ATLAS_SIZE * ATLAS_SIZE * 4);
  let shelfX = 2;
  let shelfY = 2;
  let shelfRowH = 0;

  for (const spec of ASSET_CATALOG) {
    const rawPath = ensureRawAsset(spec, forceRaw);
    const rawPng = decodePNG(fs.readFileSync(rawPath));
    let processed = processRawSheet(rawPng, spec);

    const outFilename = `${spec.id}.png`;
    const outPath = path.join(OUT_DIR, outFilename);

    if (spec.id === 'title_key_art') {
      const upscaled = scaleIntegerRgba(processed.width, processed.height, processed.data, 4);
      fs.writeFileSync(outPath, encodePNG(upscaled.width, upscaled.height, upscaled.data));
      manifest.assets[spec.id] = {
        id: spec.id,
        category: spec.category,
        area: null,
        src: `/assets/${outFilename}`,
        frameCount: 1,
        frameWidth: 1920,
        frameHeight: 1080,
        stripWidth: 1920,
        stripHeight: 1080,
        anchor: [0, 0],
        fps: 1,
        atlas: null,
      };
      continue;
    }

    fs.writeFileSync(outPath, encodePNG(processed.width, processed.height, processed.data));

    // Pack into 2048x2048 atlas if it fits
    let atlasRect = null;
    if (processed.width + 4 <= ATLAS_SIZE && shelfY + processed.height + 2 <= ATLAS_SIZE) {
      if (shelfX + processed.width + 2 > ATLAS_SIZE) {
        shelfX = 2;
        shelfY += shelfRowH + 2;
        shelfRowH = 0;
      }
      if (shelfY + processed.height + 2 <= ATLAS_SIZE) {
        for (let y = 0; y < processed.height; y++) {
          for (let x = 0; x < processed.width; x++) {
            const sIdx = (y * processed.width + x) * 4;
            const dIdx = ((shelfY + y) * ATLAS_SIZE + (shelfX + x)) * 4;
            atlasRgba[dIdx] = processed.data[sIdx];
            atlasRgba[dIdx + 1] = processed.data[sIdx + 1];
            atlasRgba[dIdx + 2] = processed.data[sIdx + 2];
            atlasRgba[dIdx + 3] = processed.data[sIdx + 3];
          }
        }
        atlasRect = {
          atlas: 'atlas_0.png',
          x: shelfX,
          y: shelfY,
          w: processed.width,
          h: processed.height,
        };
        shelfX += processed.width + 2;
        if (processed.height > shelfRowH) shelfRowH = processed.height;
      }
    }

    manifest.assets[spec.id] = {
      id: spec.id,
      category: spec.category,
      area: spec.area || null,
      src: `/assets/${outFilename}`,
      frameCount: spec.frameCount,
      frameWidth: spec.frameWidth,
      frameHeight: spec.frameHeight,
      stripWidth: processed.width,
      stripHeight: processed.height,
      anchor: spec.anchor || [spec.frameWidth >> 1, spec.frameHeight >> 1],
      fps: spec.fps || 8,
      atlas: atlasRect,
    };
  }

  fs.writeFileSync(path.join(OUT_DIR, 'atlas_0.png'), encodePNG(ATLAS_SIZE, ATLAS_SIZE, atlasRgba));
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Generate /public/assets/contact-sheet.html
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>GRAVEL SKY — Asset Contact Sheet (1x, 6x, & Black Silhouettes)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: #0B0D10;
      color: #D9D2C3;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    h1 { color: #00F0FF; letter-spacing: 0.12em; margin: 0 0 8px 0; font-size: 20px; }
    p.sub { color: #8A877C; font-size: 12px; margin: 0 0 24px 0; }
    .grid { display: flex; flex-direction: column; gap: 20px; }
    .card {
      border: 2px solid #3A3F47;
      background: #0B0D10;
      padding: 14px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #3A3F47;
      padding-bottom: 6px;
      margin-bottom: 12px;
      font-size: 12px;
    }
    .card-header strong { color: #FFC83D; }
    .row-label { font-size: 10px; color: #8A877C; text-transform: uppercase; margin: 8px 0 4px; }
    .strip-box {
      overflow-x: auto;
      background: #0B0D10;
      padding: 8px;
      border: 1px solid #1F4D4A;
    }
    .strip-box.sil-bg {
      background: #D9D2C3;
    }
    img.pixel {
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      display: block;
    }
    img.silhouette {
      filter: brightness(0) saturate(100%);
    }
  </style>
</head>
<body>
  <h1>GRAVEL SKY — PROCESSED ASSET CONTACT SHEET</h1>
  <p class="sub">Every manifest asset verified on disk • Shown at 1x, 6x integer scale on Soot (#0B0D10), and solid black silhouette row.</p>
  <div class="grid">
    ${Object.values(manifest.assets)
      .map(
        (a) => `
      <div class="card">
        <div class="card-header">
          <strong>${a.id}</strong>
          <span>${a.category} • ${a.frameCount}f @ ${a.frameWidth}x${a.frameHeight}px (${a.fps} fps) • anchor [${a.anchor.join(', ')}]</span>
        </div>
        <div class="row-label">1x Native (${a.stripWidth}x${a.stripHeight}px on #0B0D10 Soot)</div>
        <div class="strip-box">
          <img class="pixel" src="/assets/${a.id}.png" width="${a.stripWidth}" height="${a.stripHeight}" alt="${a.id} 1x" />
        </div>
        <div class="row-label">6x Integer Scale (${a.stripWidth * 6}x${a.stripHeight * 6}px on #0B0D10 Soot)</div>
        <div class="strip-box">
          <img class="pixel" src="/assets/${a.id}.png" width="${Math.min(1920, a.stripWidth * 6)}" style="height:auto" alt="${a.id} 6x" />
        </div>
        <div class="row-label">Solid Black Silhouette Check</div>
        <div class="strip-box sil-bg">
          <img class="pixel silhouette" src="/assets/${a.id}.png" width="${Math.min(960, a.stripWidth * 2)}" style="height:auto" alt="${a.id} silhouette" />
        </div>
      </div>`
      )
      .join('\n')}
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'contact-sheet.html'), html);

  // Only regenerate /ASSETS_NEEDED.md if --regen-docs is explicitly passed
  if (process.argv.includes('--regen-docs')) {
    const mdLines = [
      '# GRAVEL SKY — Asset Generation Prompts & Manifest Specification (`ASSETS_NEEDED.md`)',
      '',
      'Drop raw generated images into `/assets-src/raw/<id>.png` on a flat `#FF00FF` magenta background and run:',
      '```bash',
      'node tools/process-assets.mjs',
      '```',
      '',
      '## Step 0: Global Style Lock (Prefixed to Every Prompt)',
      `> ${STYLE_LOCK}`,
      '',
      '## Step 0: Global Negative Prompt',
      `> avoid: ${NEGATIVE_PROMPT}`,
      '',
      '## Complete Asset List',
      '',
    ];

    for (const spec of ASSET_CATALOG) {
      mdLines.push(`### \`${spec.id}.png\``);
      mdLines.push(`- **Category**: \`${spec.category}\``);
      mdLines.push(`- **Frame Size**: \`${spec.frameWidth}x${spec.frameHeight}\` (${spec.frameCount} frame(s), strip \`${spec.frameWidth * spec.frameCount}x${spec.frameHeight}\`, ${spec.fps} fps)`);
      mdLines.push(`- **Full Prompt**: \`${STYLE_LOCK} ${spec.prompt}. avoid: ${NEGATIVE_PROMPT}\``);
      mdLines.push('');
    }

    fs.writeFileSync(path.join(ROOT, 'ASSETS_NEEDED.md'), mdLines.join('\n'));
  }
  console.log(`Processed ${ASSET_CATALOG.length} asset strips into /public/assets/manifest.json and /public/assets/atlas_0.png.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve( ROOT, 'tools', 'process-assets.mjs')) {
  runPipeline();
}

