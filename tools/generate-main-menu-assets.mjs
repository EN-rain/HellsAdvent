import fs from 'node:fs';
import path from 'node:path';
import { encodePNG } from './process-assets.mjs';

const OUT_DIR = path.join(process.cwd(), 'public', 'assets');
const GEMINI_DIR = path.join(process.cwd(), 'geminigen');
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(GEMINI_DIR, { recursive: true });

function hexToRgba(hex, alpha = 255) {
  const c = hex.replace('#', '');
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
    alpha,
  ];
}

class PixelCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = Buffer.alloc(width * height * 4);
  }

  setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (Math.floor(y) * this.width + Math.floor(x)) * 4;
    if (a < 255) {
      const srcA = a / 255;
      const dstA = this.buffer[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA > 0) {
        this.buffer[idx] = Math.round((r * srcA + this.buffer[idx] * dstA * (1 - srcA)) / outA);
        this.buffer[idx + 1] = Math.round((g * srcA + this.buffer[idx + 1] * dstA * (1 - srcA)) / outA);
        this.buffer[idx + 2] = Math.round((b * srcA + this.buffer[idx + 2] * dstA * (1 - srcA)) / outA);
        this.buffer[idx + 3] = Math.round(outA * 255);
      }
    } else {
      this.buffer[idx] = r;
      this.buffer[idx + 1] = g;
      this.buffer[idx + 2] = b;
      this.buffer[idx + 3] = a;
    }
  }

  setHex(x, y, hex, a = 255) {
    const [r, g, b] = hexToRgba(hex);
    this.setPixel(x, y, r, g, b, a);
  }

  fillRect(x, y, w, h, hex, a = 255) {
    const [r, g, b] = hexToRgba(hex);
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.width, Math.floor(x + w));
    const y1 = Math.min(this.height, Math.floor(y + h));
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        this.setPixel(px, py, r, g, b, a);
      }
    }
  }

  toPNG() {
    return encodePNG(this.width, this.height, this.buffer);
  }

  toSVG(id) {
    const rects = [];
    for (let y = 0; y < this.height; y++) {
      let x = 0;
      while (x < this.width) {
        const idx = (y * this.width + x) * 4;
        const r = this.buffer[idx];
        const g = this.buffer[idx + 1];
        const b = this.buffer[idx + 2];
        const a = this.buffer[idx + 3];
        if (a === 0) {
          x++;
          continue;
        }
        let runW = 1;
        while (x + runW < this.width) {
          const nIdx = (y * this.width + (x + runW)) * 4;
          if (
            this.buffer[nIdx] === r &&
            this.buffer[nIdx + 1] === g &&
            this.buffer[nIdx + 2] === b &&
            this.buffer[nIdx + 3] === a
          ) {
            runW++;
          } else {
            break;
          }
        }
        const hex =
          '#' +
          [r, g, b]
            .map((v) => v.toString(16).padStart(2, '0'))
            .join('')
            .toUpperCase();
        const op = a < 255 ? ` fill-opacity="${(a / 255).toFixed(2)}"` : '';
        rects.push(`<rect x="${x}" y="${y}" width="${runW}" height="1" fill="${hex}"${op}/>`);
        x += runW;
      }
    }
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}" shape-rendering="crispEdges" data-asset-id="${id}">`,
      ...rects,
      `</svg>`,
    ].join('\n');
  }
}

// ----------------------------------------------------------------------------
// 1. MAIN MENU BACKGROUND SKYLINE (640 x 360)
// High-res pixel art industrial wasteland skyline, multi-tone soot/slag/rust gradient
// ----------------------------------------------------------------------------
function generateBackground() {
  const w = 640;
  const h = 360;
  const cv = new PixelCanvas(w, h);

  // Gradient sky: deep void to toxic twilight rust
  for (let y = 0; y < h; y++) {
    const t = y / h;
    let hex;
    if (t < 0.25) hex = '#080A0D';
    else if (t < 0.45) hex = '#11151A';
    else if (t < 0.60) hex = '#1D1A1F';
    else if (t < 0.75) hex = '#361D19';
    else if (t < 0.88) hex = '#5A2617';
    else hex = '#1C1F24';
    cv.fillRect(0, y, w, 1, hex);
  }

  // Smog & ash storm band
  for (let x = 0; x < w; x++) {
    const haze = Math.sin(x * 0.02) * 12 + Math.cos(x * 0.05) * 8;
    cv.fillRect(x, 220 + haze, 1, 35, '#8B3A1E', 45);
    cv.fillRect(x, 235 + haze * 0.8, 1, 20, '#00F0FF', 18);
  }

  // Distant Monolithic Factories & Smokestacks (Layer 1 - deep background, darkest silhouette)
  const layer1Towers = [
    { x: 20, w: 42, h: 140 },
    { x: 75, w: 28, h: 170 },
    { x: 120, w: 55, h: 120 },
    { x: 195, w: 34, h: 190 },
    { x: 240, w: 48, h: 110 },
    { x: 310, w: 32, h: 160 },
    { x: 360, w: 60, h: 130 },
    { x: 440, w: 26, h: 210 },
    { x: 480, w: 50, h: 150 },
    { x: 550, w: 38, h: 180 },
    { x: 600, w: 35, h: 130 },
  ];
  for (const tw of layer1Towers) {
    cv.fillRect(tw.x, 260 - tw.h, tw.w, tw.h, '#15191E');
    // Chimney rims
    cv.fillRect(tw.x - 2, 260 - tw.h, tw.w + 4, 4, '#242A33');
    // Faint warning lights
    cv.fillRect(tw.x + Math.floor(tw.w / 2), 260 - tw.h + 2, 2, 2, '#FF3B3B');
    // Billowing ash plume
    for (let sy = 0; sy < 40; sy++) {
      const sw = 10 + sy * 0.8;
      const drift = Math.sin(sy * 0.3) * 6 + sy * 0.5;
      cv.fillRect(tw.x + tw.w / 2 - sw / 2 + drift, 260 - tw.h - sy, sw, 1, '#242A33', Math.max(0, 120 - sy * 3));
    }
  }

  // Mid-distance Refineries, Gantry Cranes & Silos (Layer 2)
  const layer2Towers = [
    { x: 0, w: 50, h: 100 },
    { x: 55, w: 40, h: 130 },
    { x: 155, w: 65, h: 115 },
    { x: 225, w: 30, h: 145 },
    { x: 270, w: 75, h: 85 },
    { x: 380, w: 45, h: 140 },
    { x: 430, w: 35, h: 125 },
    { x: 515, w: 70, h: 95 },
    { x: 590, w: 50, h: 150 },
  ];
  for (const tw of layer2Towers) {
    cv.fillRect(tw.x, 265 - tw.h, tw.w, tw.h, '#1C2127');
    // Window grid / pipe lights
    for (let wy = 265 - tw.h + 12; wy < 265; wy += 14) {
      for (let wx = tw.x + 6; wx < tw.x + tw.w - 6; wx += 10) {
        if ((wx + wy) % 3 === 0) {
          cv.fillRect(wx, wy, 3, 4, '#FFC83D', 180);
        } else if ((wx + wy) % 5 === 0) {
          cv.fillRect(wx, wy, 2, 2, '#00F0FF', 220);
        }
      }
    }
    // Gantry pipe lines
    cv.fillRect(tw.x + 4, 265 - tw.h + 4, tw.w - 8, 3, '#2F3740');
  }

  // Heavy Ground Slag & Foundations
  cv.fillRect(0, 265, w, 95, '#121518');
  cv.fillRect(0, 265, w, 4, '#3A3F47');
  cv.fillRect(0, 269, w, 2, '#8B3A1E');

  // Floating embers and sparks
  for (let i = 0; i < 90; i++) {
    const px = (i * 37) % w;
    const py = (i * 19) % 300;
    const color = i % 4 === 0 ? '#00F0FF' : i % 2 === 0 ? '#FFC83D' : '#8B3A1E';
    cv.fillRect(px, py, 2, 2, color, 190);
  }

  return cv;
}

// ----------------------------------------------------------------------------
// 2. MAIN MENU OVERPASS BRIDGE / PLATFORM (640 x 180, Alpha Transparent)
// Rusted highway overpass, concrete pillars, caution stripes, metal guard rails
// ----------------------------------------------------------------------------
function generateBridge() {
  const w = 640;
  const h = 180;
  const cv = new PixelCanvas(w, h);

  const bridgeY = 40;
  const bridgeH = 34;

  // Massive Support Pillars (T-shaped reinforced concrete)
  const pillarX = [70, 190, 310, 430, 550];
  for (const px of pillarX) {
    // Pillar cap / crosshead
    cv.fillRect(px - 36, bridgeY + bridgeH, 72, 14, '#24282F');
    cv.fillRect(px - 34, bridgeY + bridgeH + 2, 68, 10, '#323842');
    cv.fillRect(px - 34, bridgeY + bridgeH + 12, 68, 2, '#181B20');

    // Pillar shaft
    cv.fillRect(px - 18, bridgeY + bridgeH + 14, 36, h - (bridgeY + bridgeH + 14), '#1F2329');
    cv.fillRect(px - 14, bridgeY + bridgeH + 14, 28, h - (bridgeY + bridgeH + 14), '#2B313A');
    cv.fillRect(px - 14, bridgeY + bridgeH + 14, 4, h - (bridgeY + bridgeH + 14), '#3E4652'); // highlight edge

    // Stress cracks & rust streaks down concrete
    cv.fillRect(px - 6, bridgeY + bridgeH + 20, 3, 35, '#8B3A1E', 180);
    cv.fillRect(px + 8, bridgeY + bridgeH + 30, 2, 25, '#8B3A1E', 150);
  }

  // Steel Guardrail Posts & Bars
  for (let gx = 0; gx < w; gx += 20) {
    cv.fillRect(gx, bridgeY - 22, 4, 22, '#3A3F47');
    cv.fillRect(gx + 1, bridgeY - 22, 2, 22, '#6E757A');
  }
  // Top & mid rail
  cv.fillRect(0, bridgeY - 22, w, 4, '#4F565E');
  cv.fillRect(0, bridgeY - 21, w, 2, '#8A877C');
  cv.fillRect(0, bridgeY - 11, w, 3, '#3A3F47');

  // Roadbed Slab
  cv.fillRect(0, bridgeY, w, 10, '#3A3F47');
  cv.fillRect(0, bridgeY, w, 2, '#D9D2C3', 140); // Asphalt edge highlight
  cv.fillRect(0, bridgeY + 10, w, bridgeH - 10, '#1C2026');

  // Heavy I-Beam Girder underneath
  cv.fillRect(0, bridgeY + bridgeH - 8, w, 8, '#262D35');
  cv.fillRect(0, bridgeY + bridgeH - 2, w, 2, '#0B0D10');

  // Caution Hazard Chevron Striping across bridge fascia
  for (let cx = 0; cx < w; cx += 24) {
    for (let cy = 0; cy < 12; cy++) {
      cv.fillRect(cx + cy, bridgeY + 12 + cy, 6, 1, '#FFC83D');
      cv.fillRect(cx + cy + 12, bridgeY + 12 + cy, 6, 1, '#0B0D10');
    }
  }

  // Weathered rust patches on girder
  for (let rx = 15; rx < w; rx += 45) {
    cv.fillRect(rx, bridgeY + 8, 22, 14, '#8B3A1E', 190);
    cv.fillRect(rx + 4, bridgeY + 12, 14, 8, '#D16B38', 210);
  }

  // Electric power conduit running along the bottom with glowing cyan conduit lines
  cv.fillRect(0, bridgeY + bridgeH - 4, w, 2, '#00F0FF', 230);

  return cv;
}

// ----------------------------------------------------------------------------
// 3. MAIN MENU HERO SPOTLIGHT (Sena Ibuki, 240 x 320, Alpha Transparent)
// Key art character illustration: Wielding glowing Railcut Katana with wind-blown coat
// ----------------------------------------------------------------------------
function generateHero() {
  const w = 240;
  const h = 320;
  const cv = new PixelCanvas(w, h);

  const cx = 110;
  const cy = 130;

  // Railcut Katana - Extended Spatial Blade angled up-right
  const bladeX0 = cx + 22;
  const bladeY0 = cy + 15;
  const bladeLen = 135;

  // Blade energy aura (cyan glow bloom)
  for (let i = 0; i < bladeLen; i += 2) {
    const bx = bladeX0 + Math.floor(i * 0.72);
    const by = bladeY0 - Math.floor(i * 0.88);
    cv.fillRect(bx - 4, by - 4, 9, 9, '#00F0FF', 40);
    cv.fillRect(bx - 2, by - 2, 5, 5, '#5CEBFF', 90);
  }
  // Core razor steel & laser core
  for (let i = 0; i < bladeLen; i++) {
    const bx = bladeX0 + Math.floor(i * 0.72);
    const by = bladeY0 - Math.floor(i * 0.88);
    cv.fillRect(bx - 1, by - 1, 3, 3, '#088A9E');
    cv.fillRect(bx, by, 2, 2, '#B8FBFF');
    // Spatial lightning arcs
    if (i % 16 === 0) {
      cv.fillRect(bx - 5, by - 2, 4, 2, '#00F0FF');
      cv.fillRect(bx + 3, by + 1, 3, 2, '#5CEBFF');
    }
  }

  // Katana Tsuba (Guard) & Hilt
  cv.fillRect(bladeX0 - 6, bladeY0 + 2, 12, 6, '#FFC83D');
  cv.fillRect(bladeX0 - 4, bladeY0 + 3, 8, 4, '#593E18');
  // Hilt
  for (let k = 0; k < 22; k++) {
    const hx = bladeX0 - 4 - Math.floor(k * 0.7);
    const hy = bladeY0 + 6 + Math.floor(k * 0.8);
    cv.fillRect(hx, hy, 4, 3, k % 3 === 0 ? '#FFC83D' : '#1A2228');
  }

  // Waving Duster Coat (Rust Inner Lining, Soot-Black Outer Shell)
  // Back coat tails blowing dramatically to the left
  for (let ty = cy + 30; ty < cy + 130; ty++) {
    const spread = (ty - (cy + 30)) * 0.55;
    const wave = Math.sin(ty * 0.12) * 8;
    const startX = cx - 24 - spread + wave;
    const coatW = 32 + spread * 0.5;
    // Outer soot black
    cv.fillRect(startX, ty, coatW, 1, '#11171B');
    // Inner rust lining
    cv.fillRect(startX + coatW - 8, ty, 6, 1, '#8B3A1E');
    cv.fillRect(startX + coatW - 4, ty, 3, 1, '#D16B38');
  }

  // Legs / Tactical Boots
  // Left leg
  cv.fillRect(cx - 16, cy + 85, 12, 55, '#1A2228');
  cv.fillRect(cx - 18, cy + 120, 16, 28, '#26313A'); // Knee armor
  cv.fillRect(cx - 20, cy + 144, 20, 14, '#0B0D10'); // Boot
  cv.fillRect(cx - 20, cy + 154, 22, 4, '#8B3A1E'); // Steel boot sole

  // Right leg
  cv.fillRect(cx + 6, cy + 85, 14, 55, '#1A2228');
  cv.fillRect(cx + 4, cy + 120, 18, 28, '#26313A');
  cv.fillRect(cx + 4, cy + 144, 20, 14, '#0B0D10');
  cv.fillRect(cx + 4, cy + 154, 22, 4, '#8B3A1E');

  // Torso / Armored Vest & Utility Belt
  cv.fillRect(cx - 20, cy + 28, 42, 58, '#1A2228');
  cv.fillRect(cx - 16, cy + 32, 34, 48, '#26313A');
  // Chest plate highlight
  cv.fillRect(cx - 12, cy + 36, 26, 24, '#33414C');
  cv.fillRect(cx - 10, cy + 38, 22, 2, '#4F565E');

  // Utility belt with brass buckles & ammo pouches
  cv.fillRect(cx - 22, cy + 76, 46, 10, '#3B1C18');
  cv.fillRect(cx - 6, cy + 74, 14, 12, '#FFC83D'); // Center buckle
  cv.fillRect(cx - 4, cy + 76, 10, 8, '#593E18');
  cv.fillRect(cx - 18, cy + 78, 8, 8, '#8B3A1E'); // Pouch left
  cv.fillRect(cx + 12, cy + 78, 8, 8, '#8B3A1E'); // Pouch right

  // Scarf (Fluffy bone-ash cowl around neck)
  cv.fillRect(cx - 22, cy + 18, 46, 14, '#B8B2A2');
  cv.fillRect(cx - 20, cy + 20, 42, 10, '#D9D2C3');
  cv.fillRect(cx - 16, cy + 22, 34, 6, '#EFE9DA');
  // Scarf tails fluttering backward
  cv.fillRect(cx - 36, cy + 24, 16, 6, '#D9D2C3');
  cv.fillRect(cx - 48, cy + 26, 14, 4, '#B8B2A2');

  // Head / Face
  cv.fillRect(cx - 14, cy - 18, 30, 36, '#E3B094'); // Skin base
  cv.fillRect(cx - 12, cy - 14, 26, 30, '#E3B094');
  cv.fillRect(cx - 14, cy + 10, 28, 4, '#B87D65'); // Chin shadow

  // Anime Eyes (Sharp, intense cyan gaze)
  cv.fillRect(cx - 4, cy - 2, 7, 5, '#11171B');
  cv.fillRect(cx - 3, cy - 1, 5, 4, '#00F0FF');
  cv.fillRect(cx - 2, cy - 1, 2, 2, '#FFFFFF');

  cv.fillRect(cx + 8, cy - 2, 7, 5, '#11171B');
  cv.fillRect(cx + 9, cy - 1, 5, 4, '#00F0FF');
  cv.fillRect(cx + 10, cy - 1, 2, 2, '#FFFFFF');

  // Eyebrows
  cv.fillRect(cx - 6, cy - 6, 10, 2, '#612819');
  cv.fillRect(cx + 7, cy - 6, 10, 2, '#612819');

  // Brass Aviator Goggles on Forehead
  cv.fillRect(cx - 16, cy - 18, 36, 10, '#593E18');
  cv.fillRect(cx - 14, cy - 20, 14, 12, '#FFC83D'); // Left lens frame
  cv.fillRect(cx - 11, cy - 18, 8, 8, '#1F4D4A'); // Left lens glass
  cv.fillRect(cx - 9, cy - 17, 3, 3, '#00F0FF'); // Reflection
  cv.fillRect(cx + 4, cy - 20, 14, 12, '#FFC83D'); // Right lens frame
  cv.fillRect(cx + 7, cy - 18, 8, 8, '#1F4D4A'); // Right lens glass
  cv.fillRect(cx + 9, cy - 17, 3, 3, '#00F0FF');

  // Auburn / Rust-Red Hair
  // Top crest
  cv.fillRect(cx - 18, cy - 32, 40, 16, '#8B3A1E');
  cv.fillRect(cx - 14, cy - 36, 32, 8, '#D16B38');
  cv.fillRect(cx - 10, cy - 38, 24, 4, '#FF7A70');
  // Side bangs & stray locks
  cv.fillRect(cx - 20, cy - 24, 8, 38, '#612819');
  cv.fillRect(cx - 22, cy - 16, 6, 32, '#8B3A1E');
  cv.fillRect(cx + 18, cy - 24, 8, 36, '#612819');
  cv.fillRect(cx + 22, cy - 18, 6, 28, '#8B3A1E');

  // Left Arm (gripping scabbard on hip)
  cv.fillRect(cx - 28, cy + 34, 12, 38, '#1A2228');
  cv.fillRect(cx - 30, cy + 68, 10, 10, '#E3B094'); // Hand

  // Right Arm (raised forward wielding the Railcut Katana)
  cv.fillRect(cx + 18, cy + 32, 14, 20, '#26313A');
  cv.fillRect(cx + 28, cy + 22, 14, 18, '#33414C');
  cv.fillRect(cx + 34, cy + 12, 12, 12, '#E3B094'); // Grip hand

  // Ground contact shadow
  cv.fillRect(cx - 36, cy + 156, 76, 8, '#0B0D10', 210);

  return cv;
}

// ----------------------------------------------------------------------------
// 4. MAIN MENU TITLE LOGO CREST (640 x 140, Alpha Transparent)
// High-impact pixel-art title emblem: "HELLSADVENT" with steel border, rivets,
// rust hazard chevron, and glowing neon cyan energy underline
// ----------------------------------------------------------------------------
function generateLogo() {
  const w = 640;
  const h = 140;
  const cv = new PixelCanvas(w, h);

  const boxX = 20;
  const boxY = 16;
  const boxW = 580;
  const boxH = 88;

  // Steel backplate with dark soot fill
  cv.fillRect(boxX, boxY, boxW, boxH, '#0B0D10', 245);
  // Outer border - heavy slag iron
  cv.fillRect(boxX, boxY, boxW, 4, '#3A3F47');
  cv.fillRect(boxX, boxY + boxH - 4, boxW, 4, '#3A3F47');
  cv.fillRect(boxX, boxY, 4, boxH, '#3A3F47');
  cv.fillRect(boxX + boxW - 4, boxY, 4, boxH, '#3A3F47');

  // Inner bevel highlight
  cv.fillRect(boxX + 4, boxY + 4, boxW - 8, 2, '#6E757A');
  cv.fillRect(boxX + 4, boxY + 4, 2, boxH - 8, '#6E757A');
  cv.fillRect(boxX + 4, boxY + boxH - 6, boxW - 8, 2, '#182429');

  // Corner Rivet Studs
  const rivets = [
    [boxX + 8, boxY + 8],
    [boxX + boxW - 14, boxY + 8],
    [boxX + 8, boxY + boxH - 14],
    [boxX + boxW - 14, boxY + boxH - 14],
  ];
  for (const [rx, ry] of rivets) {
    cv.fillRect(rx, ry, 6, 6, '#FFC83D');
    cv.fillRect(rx + 1, ry + 1, 4, 4, '#946B22');
    cv.fillRect(rx + 2, ry + 2, 2, 2, '#FFE48A');
  }

  // Right-hand industrial hazard cut-corner triangle in rust orange
  for (let y = 0; y < boxH; y++) {
    const startX = boxX + boxW - 40 + Math.floor(y * 0.4);
    cv.fillRect(startX, boxY + y, boxX + boxW - startX, 1, '#8B3A1E');
    cv.fillRect(startX, boxY + y, 3, 1, '#D16B38');
  }

  // Laser Cyan Energy Underline
  cv.fillRect(boxX, boxY + boxH, boxW + 20, 5, '#00F0FF');
  cv.fillRect(boxX, boxY + boxH + 1, boxW + 20, 3, '#B8FBFF');
  cv.fillRect(boxX, boxY + boxH + 5, boxW + 20, 2, '#088A9E');

  // Stylized pixel font for "HELLSADVENT"
  // Let's render big chunky pixel block letters (Height = 44px)
  const letters = [
    // H
    { w: 26, draw: (x, y) => {
      cv.fillRect(x, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 19, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 7, y + 18, 12, 8, '#D9D2C3');
    }},
    // E
    { w: 24, draw: (x, y) => {
      cv.fillRect(x, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 7, y, 17, 8, '#D9D2C3');
      cv.fillRect(x + 7, y + 18, 14, 8, '#D9D2C3');
      cv.fillRect(x + 7, y + 36, 17, 8, '#D9D2C3');
    }},
    // L
    { w: 22, draw: (x, y) => {
      cv.fillRect(x, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 7, y + 36, 15, 8, '#D9D2C3');
    }},
    // L
    { w: 22, draw: (x, y) => {
      cv.fillRect(x, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 7, y + 36, 15, 8, '#D9D2C3');
    }},
    // S
    { w: 25, draw: (x, y) => {
      cv.fillRect(x, y, 25, 8, '#D9D2C3');
      cv.fillRect(x, y + 8, 7, 12, '#D9D2C3');
      cv.fillRect(x, y + 18, 25, 8, '#D9D2C3');
      cv.fillRect(x + 18, y + 26, 7, 12, '#D9D2C3');
      cv.fillRect(x, y + 36, 25, 8, '#D9D2C3');
    }},
    // A
    { w: 26, draw: (x, y) => {
      cv.fillRect(x, y + 8, 7, 36, '#D9D2C3');
      cv.fillRect(x + 19, y + 8, 7, 36, '#D9D2C3');
      cv.fillRect(x + 6, y, 14, 8, '#D9D2C3');
      cv.fillRect(x + 7, y + 22, 12, 7, '#D9D2C3');
    }},
    // D
    { w: 26, draw: (x, y) => {
      cv.fillRect(x, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 7, y, 13, 8, '#D9D2C3');
      cv.fillRect(x + 7, y + 36, 13, 8, '#D9D2C3');
      cv.fillRect(x + 19, y + 8, 7, 28, '#D9D2C3');
    }},
    // V
    { w: 26, draw: (x, y) => {
      cv.fillRect(x, y, 7, 26, '#D9D2C3');
      cv.fillRect(x + 19, y, 7, 26, '#D9D2C3');
      cv.fillRect(x + 4, y + 24, 7, 12, '#D9D2C3');
      cv.fillRect(x + 15, y + 24, 7, 12, '#D9D2C3');
      cv.fillRect(x + 9, y + 34, 8, 10, '#D9D2C3');
    }},
    // E
    { w: 24, draw: (x, y) => {
      cv.fillRect(x, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 7, y, 17, 8, '#D9D2C3');
      cv.fillRect(x + 7, y + 18, 14, 8, '#D9D2C3');
      cv.fillRect(x + 7, y + 36, 17, 8, '#D9D2C3');
    }},
    // N
    { w: 26, draw: (x, y) => {
      cv.fillRect(x, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 19, y, 7, 44, '#D9D2C3');
      cv.fillRect(x + 7, y + 10, 6, 12, '#D9D2C3');
      cv.fillRect(x + 13, y + 22, 6, 12, '#D9D2C3');
    }},
    // T
    { w: 25, draw: (x, y) => {
      cv.fillRect(x, y, 25, 8, '#D9D2C3');
      cv.fillRect(x + 9, y + 8, 7, 36, '#D9D2C3');
    }},
  ];

  let curX = boxX + 24;
  const textY = boxY + 22;
  for (const letter of letters) {
    // Drop shadow
    letter.draw(curX + 3, textY + 3);
    // Main white/bone body
    letter.draw(curX, textY);
    curX += letter.w + 12;
  }

  // Recolor letters with gradient & highlight (Top half bone, bottom half copper-rust)
  for (let py = textY; py < textY + 44; py++) {
    for (let px = boxX + 20; px < curX + 10; px++) {
      const idx = (py * w + px) * 4;
      if (cv.buffer[idx] > 180 && cv.buffer[idx + 1] > 180) {
        if (py - textY > 24) {
          // Bottom half: Rust / Copper
          cv.buffer[idx] = 209;
          cv.buffer[idx + 1] = 107;
          cv.buffer[idx + 2] = 56;
        } else if (py - textY > 20) {
          // Mid accent line: Brass Gold
          cv.buffer[idx] = 255;
          cv.buffer[idx + 1] = 200;
          cv.buffer[idx + 2] = 61;
        } else {
          // Top half: Crisp Bone Ivory
          cv.buffer[idx] = 239;
          cv.buffer[idx + 1] = 233;
          cv.buffer[idx + 2] = 218;
        }
      }
    }
  }

  // Subtitle Ribbon underneath
  cv.fillRect(boxX + 2, boxY + boxH + 12, 420, 22, '#0B0D10', 230);
  cv.fillRect(boxX + 2, boxY + boxH + 12, 4, 22, '#00F0FF');

  return cv;
}

// ----------------------------------------------------------------------------
// 5. MAIN MENU CREST / TRADE SEAL (320 x 80, Alpha Transparent)
// "FLOOR 1 · RUST · ASH · DEAD WATER · THREE TRADES"
// ----------------------------------------------------------------------------
function generateCrest() {
  const w = 320;
  const h = 80;
  const cv = new PixelCanvas(w, h);

  cv.fillRect(0, 0, w, h, '#0B0D10', 210);
  cv.fillRect(0, 0, w, 2, '#3A3F47');
  cv.fillRect(0, h - 2, w, 2, '#3A3F47');
  cv.fillRect(0, 0, 4, h, '#00F0FF');
  cv.fillRect(w - 4, 0, 4, h, '#8B3A1E');

  // Decorative chevron pattern
  for (let x = 8; x < w - 8; x += 16) {
    cv.fillRect(x, 6, 2, 2, '#00F0FF');
    cv.fillRect(x + 8, h - 8, 2, 2, '#FFC83D');
  }

  // Central Emblem (crossed blades & steam boiler icon)
  const mx = Math.floor(w / 2);
  const my = Math.floor(h / 2);
  cv.fillRect(mx - 14, my - 14, 28, 28, '#1C2026');
  cv.fillRect(mx - 12, my - 12, 24, 24, '#3A3F47');
  // Boiler flame
  cv.fillRect(mx - 4, my - 6, 8, 12, '#8B3A1E');
  cv.fillRect(mx - 2, my - 4, 4, 8, '#D16B38');
  cv.fillRect(mx - 1, my - 2, 2, 4, '#FFC83D');

  return cv;
}

// Execute batch generation
console.log('Generating main menu visual assets...');
const menuAssets = [
  ['main_menu_bg', generateBackground()],
  ['main_menu_bridge', generateBridge()],
  ['main_menu_hero', generateHero()],
  ['main_menu_logo', generateLogo()],
  ['main_menu_crest', generateCrest()],
];

for (const [id, cvOrPng] of menuAssets) {
  const png = Buffer.isBuffer(cvOrPng) ? cvOrPng : cvOrPng.toPNG();
  fs.writeFileSync(path.join(OUT_DIR, `${id}.png`), png);
  fs.writeFileSync(path.join(GEMINI_DIR, `${id}.png`), png);
  if (!Buffer.isBuffer(cvOrPng)) {
    fs.writeFileSync(path.join(GEMINI_DIR, `${id}.svg`), cvOrPng.toSVG(id), 'utf8');
  }
  console.log(`✓ public/assets/${id}.png + geminigen/${id}.{png,svg} generated`);
}

console.log('All 5 modular main menu image assets successfully generated!');
