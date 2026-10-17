/**
 * GRAVEL SKY — Strict Integer Pixel Rasterizer & 4-Step Hue-Shifted Material Ramps
 * - Zero anti-aliasing, zero sub-pixel coordinates, zero gradients, zero shadowBlur, zero alpha glow.
 * - Top-left light source: automatic 1px selective outline (darkest ramp of neighboring material,
 *   never pure black, skipped on lit top-left edges) + 1px highlight edge.
 * - Pre-renders 8-angle rotations and Bayer-dithered silhouette frames at startup.
 */

import { PALETTE } from '../data/config.js';

/**
 * 4-step hue-shifting material ramps:
 * Index 0: deepest shade (shifts toward bog teal #1F4D4A / soot #0B0D10, never pure #000000)
 * Index 1: mid-dark base
 * Index 2: lit midtone
 * Index 3: top-left highlight (shifts toward brass #FFC83D / bone #D9D2C3)
 */
export const MATERIAL_RAMPS = {
  coat: ['#0B0D10', '#182124', '#3A3F47', '#6E7578'],
  scarf: ['#1F4D4A', '#8C897A', '#D9D2C3', '#F2E8CF'],
  hair: ['#192B2B', '#5C2616', '#8B3A1E', '#C96B32'],
  skin: ['#2B3D3B', '#8F6D5B', '#C9A790', '#E8D2B5'],
  brass: ['#1F4D4A', '#7A541E', '#C98A2C', '#FFC83D'],
  steel: ['#132627', '#2B333B', '#525B66', '#9BA39C'],
  rust: ['#182E2D', '#592512', '#8B3A1E', '#C86D3B'],
  bog: ['#0B0D10', '#143331', '#1F4D4A', '#6E9E85'],
  signal: ['#1F4D4A', '#007A87', '#00C4D4', '#00F0FF'],
  blood: ['#24171D', '#7A1C1C', '#C92A2A', '#FF3B3B'],
  bone: ['#1F4D4A', '#7E7A6E', '#B8B1A2', '#D9D2C3'],
};

// 4x4 Bayer matrix for zero-alpha dithered afterimages & fake glow rings
export const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function passDither(x, y, density) {
  const ix = ((x | 0) % 4 + 4) % 4;
  const iy = ((y | 0) % 4 + 4) % 4;
  return BAYER_4X4[iy][ix] < density * 16;
}

/**
 * Software Pixel Buffer for building layered part sprites before selective outlining.
 * Each pixel stores { mat: string, step: 0|1|2|3, rawColor?: string } or null.
 */
export class PixelGrid {
  constructor(width, height) {
    this.width = width | 0;
    this.height = height | 0;
    this.cells = new Array(this.width * this.height).fill(null);
  }

  clear() {
    this.cells.fill(null);
  }

  set(x, y, mat, step = 2, rawColor = null) {
    const ix = x | 0;
    const iy = y | 0;
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return;
    this.cells[iy * this.width + ix] = { mat, step, rawColor };
  }

  get(x, y) {
    const ix = x | 0;
    const iy = y | 0;
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return null;
    return this.cells[iy * this.width + ix];
  }

  rect(x, y, w, h, mat, step = 2, rawColor = null) {
    const x0 = x | 0;
    const y0 = y | 0;
    const x1 = (x + w) | 0;
    const y1 = (y + h) | 0;
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        this.set(px, py, mat, step, rawColor);
      }
    }
  }

  // Shaded box with top-left light source automatic step assignment
  shadedRect(x, y, w, h, mat) {
    const x0 = x | 0;
    const y0 = y | 0;
    const w0 = w | 0;
    const h0 = h | 0;
    for (let py = 0; py < h0; py++) {
      for (let px = 0; px < w0; px++) {
        let step = 2;
        if (px === 0 || py === 0) step = 3; // Top-left lit edge
        else if (px === w0 - 1 || py === h0 - 1) step = 1; // Bottom-right shade
        this.set(x0 + px, y0 + py, mat, step);
      }
    }
  }

  circle(cx, cy, r, mat, step = 2) {
    const ix = cx | 0;
    const iy = cy | 0;
    const ir = r | 0;
    for (let dy = -ir; dy <= ir; dy++) {
      for (let dx = -ir; dx <= ir; dx++) {
        if (dx * dx + dy * dy <= ir * ir) {
          let s = step;
          if (dx + dy < -ir * 0.4) s = Math.min(3, step + 1);
          else if (dx + dy > ir * 0.5) s = Math.max(1, step - 1);
          this.set(ix + dx, iy + dy, mat, s);
        }
      }
    }
  }

  line(x0, y0, x1, y1, mat, step = 2, thickness = 1, rawColor = null) {
    let ix0 = x0 | 0;
    let iy0 = y0 | 0;
    const ix1 = x1 | 0;
    const iy1 = y1 | 0;
    const dx = Math.abs(ix1 - ix0);
    const dy = -Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      if (thickness <= 1) {
        this.set(ix0, iy0, mat, step, rawColor);
      } else {
        const half = (thickness >> 1);
        this.rect(ix0 - half, iy0 - half, thickness, thickness, mat, step, rawColor);
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
   * Automatic Post-Pass:
   * 1. Adds 1px highlight (step 3) on interior pixels whose top or left neighbor is empty.
   * 2. Adds 1px selective outline (step 0 of neighboring material, never pure black)
   *    on empty pixels bordering bottom/right edges, skipping lit top-left outer edges.
   * 3. Optional 1px pulsing rim (e.g. blood-red for Elites or brass for Boss phase shifts).
   */
  bakeToCanvas(options = {}) {
    const {
      selectiveOutline = true,
      topLeftHighlight = true,
      rimColor = null,
      mirrorX = false,
      solidColor = null, // e.g. '#D9D2C3' for 2-frame white hit silhouette or '#0B0D10' for gallery silhouette
      ditherDensity = 1.0,
    } = options;

    const w = this.width;
    const h = this.height;
    const out = new Array(w * h).fill(null);

    // First pass: resolve interior pixels + top-left highlight edge
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cell = this.get(x, y);
        if (!cell) continue;

        if (solidColor) {
          out[y * w + x] = solidColor;
          continue;
        }

        if (cell.rawColor) {
          out[y * w + x] = cell.rawColor;
          continue;
        }

        const ramp = MATERIAL_RAMPS[cell.mat] || MATERIAL_RAMPS.steel;
        let step = cell.step;

        if (topLeftHighlight && step < 3) {
          const upEmpty = !this.get(x, y - 1);
          const leftEmpty = !this.get(x - 1, y);
          const downFull = !!this.get(x, y + 1);
          const rightFull = !!this.get(x + 1, y);
          if ((upEmpty && downFull) || (leftEmpty && rightFull)) {
            step = Math.min(3, step + 1);
          }
        }
        out[y * w + x] = ramp[step];
      }
    }

    // Second pass: 1px selective outline (skipped on lit top-left outer edges unless rimColor is active)
    if (selectiveOutline && !solidColor) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (this.get(x, y)) continue;

          // Check 4-neighbors relative to this empty pixel
          const nAbove = this.get(x, y - 1); // empty is below sprite -> shadow outline!
          const nLeft = this.get(x - 1, y);  // empty is right of sprite -> shadow outline!
          const nBelow = this.get(x, y + 1); // empty is above sprite -> lit top edge
          const nRight = this.get(x + 1, y); // empty is left of sprite -> lit left edge

          const neighbor = nAbove || nLeft || nBelow || nRight;
          if (!neighbor) continue;

          if (rimColor) {
            out[y * w + x] = rimColor;
            continue;
          }

          // Selective outline: always outline bottom/right shadow edges; on top/left only use step 1 shade if enclosed
          const isShadowEdge = !!(nAbove || nLeft);
          const ramp = MATERIAL_RAMPS[neighbor.mat] || MATERIAL_RAMPS.steel;
          if (isShadowEdge) {
            out[y * w + x] = ramp[0]; // Darkest ramp color of neighboring material (never pure #000000)
          } else if (nBelow && nRight) {
            // Concave top-left corner gets darkest ramp color
            out[y * w + x] = ramp[0];
          }
        }
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const col = out[y * w + x];
        if (!col) continue;
        const drawX = mirrorX ? w - 1 - x : x;
        if (ditherDensity < 1.0 && !passDither(drawX, y, ditherDensity)) {
          continue;
        }
        ctx.fillStyle = col;
        ctx.fillRect(drawX, y, 1, 1);
      }
    }

    return canvas;
  }
}

/**
 * Integer Bresenham Circle & Line helpers for direct canvas rendering (shockwaves, fake dithered glow rings)
 */
export function drawPixelLine(ctx, x0, y0, x1, y1, color, thickness = 1) {
  let ix0 = Math.round(x0);
  let iy0 = Math.round(y0);
  const ix1 = Math.round(x1);
  const iy1 = Math.round(y1);
  const dx = Math.abs(ix1 - ix0);
  const dy = -Math.abs(iy1 - iy0);
  const sx = ix0 < ix1 ? 1 : -1;
  const sy = iy0 < iy1 ? 1 : -1;
  let err = dx + dy;

  ctx.fillStyle = color;
  const half = thickness >> 1;

  while (true) {
    ctx.fillRect(ix0 - half, iy0 - half, thickness, thickness);
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

export function drawBresenhamCircle(ctx, cx, cy, radius, color, ditherDensity = 1.0) {
  const ix = Math.round(cx);
  const iy = Math.round(cy);
  let r = Math.round(radius);
  if (r <= 0) return;

  let x = 0;
  let y = r;
  let d = 3 - 2 * r;
  ctx.fillStyle = color;

  const plot8 = (px, py) => {
    const pts = [
      [ix + px, iy + py],
      [ix - px, iy + py],
      [ix + px, iy - py],
      [ix - px, iy - py],
      [ix + py, iy + px],
      [ix - py, iy + px],
      [ix + py, iy - px],
      [ix - py, iy - px],
    ];
    for (let i = 0; i < 8; i++) {
      const [qx, qy] = pts[i];
      if (ditherDensity >= 1.0 || passDither(qx, qy, ditherDensity)) {
        ctx.fillRect(qx, qy, 1, 1);
      }
    }
  };

  while (y >= x) {
    plot8(x, y);
    x++;
    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
  }
}

/**
 * Fake Glow Helper: Two stacked 1px dithered rings (inner 55% Bayer dither, outer 25% Bayer dither)
 * Zero alpha blur, zero shadowBlur, zero gradients.
 */
export function drawDitheredGlowRings(ctx, cx, cy, baseRadius, color) {
  drawBresenhamCircle(ctx, cx, cy, baseRadius + 1, color, 0.55);
  drawBresenhamCircle(ctx, cx, cy, baseRadius + 2, color, 0.25);
}

/**
 * Pre-renders 8 discrete angle frames (0..7, every 45 deg) of a PixelGrid
 * using nearest-neighbor integer sampling so projectiles and debris never use ctx.rotate().
 */
export function bake8AngleFrames(sourceGrid, options = {}) {
  const baseCanvas = sourceGrid.bakeToCanvas(options);
  const w = baseCanvas.width;
  const h = baseCanvas.height;
  const size = Math.max(w, h) + 4;
  const srcCtx = baseCanvas.getContext('2d');
  const srcData = srcCtx.getImageData(0, 0, w, h).data;

  const frames = [];
  const cx = w / 2;
  const cy = h / 2;
  const dcx = Math.floor(size / 2);
  const dcy = Math.floor(size / 2);

  for (let dir = 0; dir < 8; dir++) {
    const angle = dir * (Math.PI / 4);
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = size;
    outCanvas.height = size;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = false;

    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const rx = dx - dcx;
        const ry = dy - dcy;
        const sx = Math.round(rx * cos - ry * sin + cx);
        const sy = Math.round(rx * sin + ry * cos + cy);
        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
          const idx = (sy * w + sx) * 4;
          if (srcData[idx + 3] > 128) {
            outCtx.fillStyle = `rgb(${srcData[idx]},${srcData[idx + 1]},${srcData[idx + 2]})`;
            outCtx.fillRect(dx, dy, 1, 1);
          }
        }
      }
    }
    frames.push(outCanvas);
  }
  return frames;
}

export function angleTo8Dir(angleRad) {
  const norm = ((angleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.round((norm / (Math.PI * 2)) * 8) % 8;
}

export function angleTo4Facing(angleRad) {
  // Returns 'right' | 'down' | 'left' | 'up'
  const norm = ((angleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const deg = (norm * 180) / Math.PI;
  if (deg >= 45 && deg < 135) return 'down';
  if (deg >= 135 && deg < 225) return 'left';
  if (deg >= 225 && deg < 315) return 'up';
  return 'right';
}
