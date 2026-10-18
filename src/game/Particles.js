/**
 * GRAVEL SKY — Object-Pooled Particles, Ground Decals, Debris Parts, Cracks, & Skill VFX
 * - All effects snap to integer pixels and step at 24 fps (1/24s).
 * - Zero gradients, zero shadowBlur, zero alpha blending (uses Bayer dither or color-step fading).
 * - Each effect uses at most 3 colors.
 * - Ground stain decals capped at 60, lasting 20s.
 */

import { PALETTE, SHOP_ITEMS } from '../data/config.js';
import {
  drawPixelLine,
  drawBresenhamCircle,
  drawDitheredGlowRings,
  passDither,
  angleTo8Dir,
} from './PixelArt.js';
import { spriteRegistry } from './Sprites.js';

export class ParticlePool {
  constructor(maxParticles = 500, maxNumbers = 80, maxSlashes = 32) {
    // Square particles, dust puffs (3 sizes), lifted rocks with ground shades, cross-cut flashes
    this.particles = Array.from({ length: maxParticles }, () => ({
      active: false,
      kind: 'pixel', // 'pixel' | 'dust' | 'rock' | 'ring' | 'crossFlash' | 'splitHalf'
      x: 0,
      y: 0,
      z: 0, // height above ground for lifted rocks & tumbling debris
      vx: 0,
      vy: 0,
      vz: 0,
      size: 2,
      color: PALETTE.bone,
      color2: PALETTE.rust,
      life: 0,
      maxLife: 0.4,
      ringMaxRadius: 40,
      splitCanvas: null,
      splitClipSide: 0,
    }));

    // Ground stain decals & wet Leech trails (cap 60 decals, 20s lifetime)
    this.decals = [];
    this.maxDecals = 60;

    // Tumbling 8-angle junk debris parts (can lid, goggles, wire, tarp, bone/rust shards)
    this.debris = Array.from({ length: 120 }, () => ({
      active: false,
      partType: 'canLid',
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      angle: 0,
      vAngle: 8,
      life: 0,
      maxLife: 1.2,
    }));

    // Ground Break 8 jagged crack lines in soot with signal glowing inside (fading over 600ms)
    this.groundCracks = Array.from({ length: 16 }, () => ({
      active: false,
      cx: 0,
      cy: 0,
      life: 0,
      maxLife: 0.6,
      arms: [], // 8 jagged polylines
    }));

    // Shrinking Lunge slash lines & Seven Cuts tapered white slash lines
    this.slashes = Array.from({ length: maxSlashes }, () => ({
      active: false,
      kind: 'lunge', // 'lunge' (shrinks from both ends over 150ms) | 'sevenCuts' (tapered white slash)
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      color: PALETTE.signal,
      life: 0,
      maxLife: 0.15,
    }));

    // Floating integer damage numbers (crits in brass)
    this.numbers = Array.from({ length: maxNumbers }, () => ({
      active: false,
      x: 0,
      y: 0,
      vy: -38,
      text: '',
      color: PALETTE.bone,
      isCrit: false,
      life: 0,
      maxLife: 0.7,
    }));

    // Loot & Grounded Scrap Pickups (gold, xp, item drops, and magnetic scrap for Ines)
    this.pickups = [];
    this.hitStopTimer = 0;

    // Heavy Anti-Materiel Rail Gun Beams
    this.railBeams = [];

    // Crescent Slashes (sweeping circular blade arcs with glowing core & sparks)
    this.crescentSlashes = [];
  }

  clear() {
    for (let i = 0; i < this.particles.length; i++) this.particles[i].active = false;
    for (let i = 0; i < this.debris.length; i++) this.debris[i].active = false;
    for (let i = 0; i < this.groundCracks.length; i++) this.groundCracks[i].active = false;
    for (let i = 0; i < this.slashes.length; i++) this.slashes[i].active = false;
    for (let i = 0; i < this.numbers.length; i++) this.numbers[i].active = false;
    this.decals = [];
    this.pickups = [];
    this.railBeams = [];
    this.crescentSlashes = [];
    this.hitStopTimer = 0;
  }

  triggerHitStop(duration = 0.05) {
    this.hitStopTimer = Math.max(this.hitStopTimer, duration);
  }

  updateHitStop(dt) {
    if (this.hitStopTimer > 0) {
      this.hitStopTimer = Math.max(0, this.hitStopTimer - dt);
      return true;
    }
    return false;
  }

  spawnPickup(x, y, type = 'gold', value = 5, itemId = null) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 6 + Math.random() * 14;
    this.pickups.push({
      active: true,
      type, // 'gold' | 'xp' | 'item' | 'scrap'
      value,
      itemId,
      x: Math.round(x + Math.cos(ang) * dist),
      y: Math.round(y + Math.sin(ang) * dist),
      life: 25.0,
      variant: Math.floor(Math.random() * 8),
    });
  }

  getActiveScrapPickups() {
    return this.pickups.filter((pk) => pk.active && pk.type === 'scrap');
  }

  // Add ground stain decal (cap 60, 20s duration)
  spawnDecal(x, y, colorOrType = '#1A1312', radius = 5, life = 20.0) {
    let color = colorOrType;
    let r = radius;
    if (colorOrType === 'scorch') {
      color = '#14171C';
      r = Math.max(8, Math.round(radius * 0.25));
    } else if (colorOrType === 'crater') {
      color = '#14171C';
      r = Math.max(12, Math.round(radius * 0.3));
    } else if (colorOrType === 'slash') {
      color = '#1D2229';
      r = 6;
    } else if (colorOrType === 'footprint') {
      color = '#161A20';
      r = 2;
    }
    if (this.decals.length >= this.maxDecals) {
      this.decals.shift();
    }
    this.decals.push({
      x: Math.round(x),
      y: Math.round(y),
      color,
      radius: Math.round(r),
      life,
      maxLife: life,
    });
  }

  // Spawn tumbling 8-angle junk debris when an enemy dies or gets cut
  spawnDebris(x, y, partType = 'canLid', count = 3) {
    for (let c = 0; c < count; c++) {
      for (let i = 0; i < this.debris.length; i++) {
        const d = this.debris[i];
        if (!d.active) {
          d.active = true;
          d.partType = partType;
          d.x = x;
          d.y = y;
          d.z = 4 + Math.random() * 6;
          const ang = Math.random() * Math.PI * 2;
          const spd = 35 + Math.random() * 75;
          d.vx = Math.cos(ang) * spd;
          d.vy = Math.sin(ang) * spd;
          d.vz = 65 + Math.random() * 55;
          d.angle = Math.random() * Math.PI * 2;
          d.vAngle = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 10);
          d.life = 0.9 + Math.random() * 0.5;
          d.maxLife = d.life;
          break;
        }
      }
    }
  }

  spawnParticle({
    kind = 'pixel',
    x,
    y,
    z = 0,
    vx = 0,
    vy = 0,
    vz = 0,
    size = 2,
    color = PALETTE.bone,
    color2 = PALETTE.rust,
    life = 0.35,
    ringMaxRadius = 40,
    splitCanvas = null,
    splitClipSide = 0,
  }) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.kind = kind;
        p.x = x;
        p.y = y;
        p.z = z;
        p.vx = vx;
        p.vy = vy;
        p.vz = vz;
        p.size = size;
        p.color = color;
        p.color2 = color2;
        p.life = life;
        p.maxLife = life;
        p.ringMaxRadius = ringMaxRadius;
        p.splitCanvas = splitCanvas;
        p.splitClipSide = splitClipSide;
        return p;
      }
    }
    return null;
  }

  // Foot-contact or roll dust puff (3 sizes: 1=small, 2=medium, 3=large)
  spawnDustPuff(x, y, sizeTier = 1, vx = 0, vy = 0) {
    this.spawnParticle({
      kind: 'dust',
      x,
      y,
      vx,
      vy,
      size: sizeTier,
      color: PALETTE.bone,
      color2: PALETTE.slag,
      life: 0.25 + sizeTier * 0.06,
    });
  }

  // 2-frame white cross-cut flash on Lunge enemy hit
  spawnCrossCutFlash(x, y) {
    this.spawnParticle({
      kind: 'crossFlash',
      x,
      y,
      size: 9,
      color: PALETTE.bone,
      life: 2 / 24, // 2 frames at 24fps
    });
  }

  // Split enemy sprite halves sliding apart on Seven Cuts final release
  spawnSplitEnemyHalves(x, y, spriteCanvas) {
    if (!spriteCanvas) return;
    for (const side of [-1, 1]) {
      this.spawnParticle({
        kind: 'splitHalf',
        x,
        y,
        vx: side * 26,
        vy: side * -14,
        life: 0.45,
        splitCanvas: spriteCanvas,
        splitClipSide: side,
      });
    }
  }

  /**
   * Ground Break Impact VFX:
   * - 1-frame full white ring
   * - 220ms expanding Bresenham ring 2px thick (signal outer, bone inner)
   * - 8 jagged crack lines in soot with signal glowing inside, fading over 600ms
   * - Lifted rocks that rise and fall with their own ground shades
   * - Three sizes of dust puffs rolling outward
   */
  spawnGroundBreakEffect(x, y, radius = 60) {
    const rVal = Math.max(10, Math.round(Number.isFinite(radius) ? radius : 60));
    // 1-frame full white ring on impact frame
    this.spawnParticle({
      kind: 'ring',
      x,
      y,
      color: PALETTE.bone,
      color2: PALETTE.bone,
      ringMaxRadius: Math.round(rVal * 0.45),
      life: 1 / 24,
    });

    // 220ms expanding 2px Bresenham ring (signal outer, bone inner)
    this.spawnParticle({
      kind: 'ring',
      x,
      y,
      color: PALETTE.signal,
      color2: PALETTE.bone,
      ringMaxRadius: Math.round(rVal),
      life: 0.22,
    });

    // 8 jagged crack lines in soot with signal glowing inside, fading over 600ms
    for (let i = 0; i < this.groundCracks.length; i++) {
      const gc = this.groundCracks[i];
      if (!gc.active) {
        gc.active = true;
        gc.cx = Math.round(x);
        gc.cy = Math.round(y);
        gc.life = 0.6;
        gc.maxLife = 0.6;
        gc.arms = [];
        for (let a = 0; a < 8; a++) {
          const baseAng = (a / 8) * Math.PI * 2 + (Math.random() * 0.2 - 0.1);
          const pts = [{ x: gc.cx, y: gc.cy }];
          for (let s = 1; s <= 4; s++) {
            const r = (s / 4) * (rVal * 0.85);
            const jitter = (s % 2 === 0 ? 1 : -1) * 0.16;
            pts.push({
              x: Math.round(gc.cx + Math.cos(baseAng + jitter) * r),
              y: Math.round(gc.cy + Math.sin(baseAng + jitter) * r),
            });
          }
          gc.arms.push(pts);
        }
        break;
      }
    }

    // Lifted rocks that rise and fall with their own ground shades
    for (let r = 0; r < 10; r++) {
      const ang = (r / 10) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 14 + Math.random() * (radius * 0.55);
      this.spawnParticle({
        kind: 'rock',
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        z: 2,
        vx: Math.cos(ang) * 28,
        vy: Math.sin(ang) * 28,
        vz: 85 + Math.random() * 45,
        size: r % 2 === 0 ? 3 : 2,
        color: PALETTE.slag,
        color2: PALETTE.bone,
        life: 0.48,
      });
    }

    // Three sizes of dust puffs rolling outward (tiers 3, 2, 1)
    for (let d = 0; d < 12; d++) {
      const ang = (d / 12) * Math.PI * 2;
      const tier = (d % 3) + 1;
      const spd = 45 + (3 - tier) * 25;
      this.spawnDustPuff(
        x + Math.cos(ang) * 10,
        y + Math.sin(ang) * 10,
        tier,
        Math.cos(ang) * spd,
        Math.sin(ang) * spd
      );
    }
  }

  spawnRing(x, y, color = PALETTE.bone, maxRadius = 40, duration = 0.22) {
    this.spawnParticle({
      kind: 'ring',
      x,
      y,
      color,
      color2: PALETTE.bone,
      ringMaxRadius: Math.round(maxRadius),
      life: duration,
    });
  }

  spawnShockwave(x, y, maxRadius, color = PALETTE.signal, duration = 0.22) {
    this.spawnRing(x, y, color, maxRadius, duration);
  }

  spawnBurst(
    x,
    y,
    count = 8,
    color = PALETTE.signal,
    speedMin = 30,
    speedMax = 110,
    size = 2,
    life = 0.28
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      this.spawnParticle({
        kind: 'pixel',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.min(3, Math.max(1, size)),
        color,
        color2: PALETTE.rust,
        life: life * (0.75 + Math.random() * 0.4),
      });
    }
  }

  // Lunge 1px signal slash line that shrinks from both ends over 150ms, or Seven Cuts tapered slash
  spawnSlashLine(x1, y1, x2, y2, color = PALETTE.signal, kind = 'lunge', duration = 0.15) {
    for (let i = 0; i < this.slashes.length; i++) {
      const s = this.slashes[i];
      if (!s.active) {
        s.active = true;
        s.kind = kind;
        s.x1 = Math.round(x1);
        s.y1 = Math.round(y1);
        s.x2 = Math.round(x2);
        s.y2 = Math.round(y2);
        s.color = color;
        s.life = duration;
        s.maxLife = duration;
        return s;
      }
    }
    return null;
  }

  spawnSlash(x1, y1, x2, y2, color = PALETTE.signal, arg6 = 0.15, arg7 = 'lunge') {
    let duration = 0.15;
    let kind = 'lunge';
    if (typeof arg6 === 'number') {
      duration = arg6;
      if (typeof arg7 === 'string') kind = arg7;
    } else if (typeof arg6 === 'string') {
      kind = arg6;
      if (typeof arg7 === 'number') duration = arg7;
    }
    return this.spawnSlashLine(x1, y1, x2, y2, color, kind, duration);
  }

  // Colossal Anti-Materiel Rail Gun Beam (90px wide multi-tier kinetic corridor across 1400px)
  spawnRailBeam(x1, y1, x2, y2, width = 90, duration = 0.5) {
    this.railBeams.push({
      x1: Math.round(x1),
      y1: Math.round(y1),
      x2: Math.round(x2),
      y2: Math.round(y2),
      width,
      life: duration,
      maxLife: duration,
      seed: Math.random() * 1000,
    });
    if (this.railBeams.length > 8) this.railBeams.shift();

    // Spawn kinetic sparks and flechettes along the corridor
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.min(24, Math.round(dist / 50));
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      this.spawnSparks(px, py, 4, PALETTE.brass);
    }
  }

  spawnDamageNumber(x, y, amount, isCrit = false, customText = null, customColor = null) {
    for (let i = 0; i < this.numbers.length; i++) {
      const n = this.numbers[i];
      if (!n.active) {
        n.active = true;
        n.x = Math.round(x + (Math.random() * 12 - 6));
        n.y = Math.round(y - 10);
        n.vy = isCrit ? -44 : -32;
        n.text =
          customText !== null
            ? customText
            : isCrit
              ? `${Math.round(amount)}!`
              : `${Math.round(amount)}`;
        n.color = customColor || (isCrit ? PALETTE.brass : PALETTE.bone);
        n.isCrit = isCrit;
        n.life = isCrit ? 0.85 : 0.65;
        n.maxLife = n.life;
        return n;
      }
    }
    return null;
  }

  spawnFloatingText(x, y, text, color = PALETTE.bone) {
    return this.spawnDamageNumber(x, y, 0, false, String(text), color);
  }

  spawnSparks(x, y, count = 6, color = PALETTE.signal) {
    this.spawnBurst(x, y, count, color, 35, 95, 2, 0.25);
  }

  spawnHitSparks(x, y, count = 3, color = PALETTE.rust, color2 = PALETTE.brass) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 55;
      this.spawnParticle({
        kind: 'pixel',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1,
        color: i % 2 === 0 ? color : color2,
        color2,
        life: 0.18 + Math.random() * 0.1,
      });
    }
  }

  spawnDirectionalSparks(x, y, angle = 0, spread = 0.6, count = 8, color = PALETTE.signal) {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const spd = 45 + Math.random() * 75;
      this.spawnParticle({
        kind: 'pixel',
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        size: i % 2 === 0 ? 2 : 1,
        color,
        color2: PALETTE.bone,
        life: 0.22 + Math.random() * 0.14,
      });
    }
  }

  spawnGroundShockwave(x, y, radius = 80, color = PALETTE.signal) {
    this.spawnGroundBreakEffect(x, y, radius);
    this.spawnShockwave(x, y, radius, color, 0.24);
  }

  spawnCraterDecal(x, y, radius = 34, duration = 30.0) {
    this.spawnDecal(x, y, '#111418', radius, duration);
    // Draw 4-6 jagged radiate fracture decals
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const d = radius * (0.6 + Math.random() * 0.4);
      this.spawnDecal(x + Math.cos(a) * d, y + Math.sin(a) * d, '#1A1D24', 4, duration);
    }
  }

  spawnSlashArc(x, y, angle, arc = 1.6, radius = 36, color = PALETTE.signal) {
    const a1 = angle - arc * 0.5;
    const a2 = angle + arc * 0.5;
    const x1 = x + Math.cos(a1) * radius;
    const y1 = y + Math.sin(a1) * radius;
    const x2 = x + Math.cos(a2) * radius;
    const y2 = y + Math.sin(a2) * radius;
    this.spawnSlashLine(x1, y1, x2, y2, color, 'sevenCuts', 0.14);
  }

  // Sweeping crescent blade slash with glowing core and flechette spark burst
  spawnCrescentSlash(x, y, angle, radius = 64, arc = 2.4, color = PALETTE.signal, duration = 0.28) {
    this.crescentSlashes.push({
      x: Math.round(x),
      y: Math.round(y),
      angle,
      radius,
      arc,
      color,
      life: duration,
      maxLife: duration,
    });
    if (this.crescentSlashes.length > 8) this.crescentSlashes.shift();

    // Burst directional sparks along the crescent arc
    const sparkCount = 9;
    for (let i = 0; i < sparkCount; i++) {
      const a = angle - arc * 0.5 + (i / (sparkCount - 1)) * arc;
      const sx = x + Math.cos(a) * (radius * 0.82);
      const sy = y + Math.sin(a) * (radius * 0.82);
      this.spawnDirectionalSparks(sx, sy, a, 0.45, 3, color);
    }
  }

  update(dt, player = null) {
    // Update pickups & magnetic collection
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (!pk.active) {
        this.pickups.splice(i, 1);
        continue;
      }
      pk.life -= dt;
      if (pk.life <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }
      if (player && !player.dead && pk.type !== 'scrap') {
        const dx = player.x - pk.x;
        const dy = player.y - pk.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 75 && dist > 1) {
          pk.x += (dx / dist) * 180 * dt;
          pk.y += (dy / dist) * 180 * dt;
        }
        if (dist <= 18) {
          pk.active = false;
          if (pk.type === 'gold') {
            player.addGold(pk.value, this);
          } else if (pk.type === 'xp') {
            player.gainXp(pk.value, this);
          } else if (pk.type === 'item' && pk.itemId) {
            const itemDef = SHOP_ITEMS[pk.itemId];
            if (itemDef?.consumable) {
              player.supplies[pk.itemId] = (player.supplies[pk.itemId] || 0) + 1;
              const label = itemDef.name || pk.itemId;
              this.spawnFloatingText(player.x, player.y - 22, `+1 ${label.toUpperCase()}`, PALETTE.signal);
            } else if (!player.ownedEquipment.includes(pk.itemId)) {
              player.ownedEquipment.push(pk.itemId);
              const label = itemDef?.name || 'GEAR';
              this.spawnFloatingText(player.x, player.y - 22, `FOUND ${label.toUpperCase()}`, PALETTE.brass);
            }
          }
          this.pickups.splice(i, 1);
        }
      }
    }

    // Update ground decals (20s duration)
    for (let i = this.decals.length - 1; i >= 0; i--) {
      this.decals[i].life -= dt;
      if (this.decals[i].life <= 0) {
        this.decals.splice(i, 1);
      }
    }

    // Update Ground Break cracks (600ms fade)
    for (let i = 0; i < this.groundCracks.length; i++) {
      const gc = this.groundCracks[i];
      if (!gc.active) continue;
      gc.life -= dt;
      if (gc.life <= 0) gc.active = false;
    }

    // Update tumbling 8-angle debris parts (bounce on ground, then blink out)
    for (let i = 0; i < this.debris.length; i++) {
      const d = this.debris[i];
      if (!d.active) continue;
      d.life -= dt;
      if (d.life <= 0) {
        d.active = false;
        continue;
      }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.z += d.vz * dt;
      d.vz -= 240 * dt; // Gravity
      if (d.z <= 0) {
        d.z = 0;
        d.vz = Math.abs(d.vz) * 0.45;
        d.vx *= 0.65;
        d.vy *= 0.65;
        d.vAngle *= 0.6;
      }
      d.angle += d.vAngle * dt;
    }

    // Update particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'rock') {
        p.z += p.vz * dt;
        p.vz -= 260 * dt;
        if (p.z < 0) {
          p.z = 0;
          p.vz = Math.abs(p.vz) * 0.35;
          p.vx *= 0.5;
          p.vy *= 0.5;
        }
      } else {
        p.vx *= 0.9;
        p.vy *= 0.9;
      }
    }

    // Update slash lines
    for (let i = 0; i < this.slashes.length; i++) {
      const s = this.slashes[i];
      if (!s.active) continue;
      s.life -= dt;
      if (s.life <= 0) s.active = false;
    }

    // Update rail beams
    for (let i = this.railBeams.length - 1; i >= 0; i--) {
      const b = this.railBeams[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.railBeams.splice(i, 1);
      }
    }

    // Update crescent slashes
    for (let i = this.crescentSlashes.length - 1; i >= 0; i--) {
      const cs = this.crescentSlashes[i];
      cs.life -= dt;
      if (cs.life <= 0) {
        this.crescentSlashes.splice(i, 1);
      }
    }

    // Update floating damage numbers
    for (let i = 0; i < this.numbers.length; i++) {
      const n = this.numbers[i];
      if (!n.active) continue;
      n.life -= dt;
      if (n.life <= 0) {
        n.active = false;
        continue;
      }
      n.y += n.vy * dt;
      n.vy *= 0.9;
    }
  }

  // Drawn on ground underneath entities (stain decals & Ground Break cracks)
  drawGroundLayer(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;

    // 1. Stain decals & Lye Leech wet trails (dithered in final 3s instead of alpha)
    for (let i = 0; i < this.decals.length; i++) {
      const dec = this.decals[i];
      const sx = Math.round(dec.x - camX);
      const sy = Math.round(dec.y - camY);
      if (sx < -16 || sx > camera.width + 16 || sy < -16 || sy > camera.height + 16) continue;

      // Blink/dither out in last 3 seconds
      if (dec.life < 3.0 && Math.floor(dec.life * 8) % 2 === 0) continue;

      ctx.fillStyle = dec.color;
      const r = dec.radius;
      ctx.fillRect(sx - r, sy - Math.max(1, r - 2), r * 2, Math.max(2, r * 2 - 3));
    }

    // 2. Ground Break 8 jagged crack lines in soot with signal glowing inside (fading over 600ms)
    for (let i = 0; i < this.groundCracks.length; i++) {
      const gc = this.groundCracks[i];
      if (!gc.active) continue;
      const ratio = gc.life / gc.maxLife;

      for (let a = 0; a < gc.arms.length; a++) {
        const arm = gc.arms[a];
        for (let s = 0; s < arm.length - 1; s++) {
          const p0 = arm[s];
          const p1 = arm[s + 1];
          if (!p0 || !p1 || !Number.isFinite(p0.x) || !Number.isFinite(p0.y) || !Number.isFinite(p1.x) || !Number.isFinite(p1.y)) {
            continue;
          }
          // Soot outer crack
          drawPixelLine(ctx, p0.x - camX, p0.y - camY, p1.x - camX, p1.y - camY, PALETTE.soot, 3);
          // Signal glowing inside the cracks for first 400ms, then bone/slag
          if (ratio > 0.35 || Math.floor(gc.life * 24) % 2 === 0) {
            drawPixelLine(
              ctx,
              p0.x - camX,
              p0.y - camY,
              p1.x - camX,
              p1.y - camY,
              ratio > 0.45 ? PALETTE.signal : PALETTE.bone,
              1
            );
          }
        }
      }
    }
  }

  // Drawn above entities
  draw(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;

    // 1. Tumbling 8-angle junk debris parts (bounce with ground shade, blink out at end)
    for (let i = 0; i < this.debris.length; i++) {
      const d = this.debris[i];
      if (!d.active) continue;
      // Blink on twos in final 0.25s
      if (d.life < 0.25 && Math.floor(d.life * 24) % 2 === 0) continue;

      const sx = Math.round(d.x - camX);
      const sy = Math.round(d.y - camY);
      if (sx < -20 || sx > camera.width + 20 || sy < -20 || sy > camera.height + 20) continue;

      // Ground shade underneath airborne debris
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - 2, sy + 2, 4, 2);

      const frames = spriteRegistry.debrisParts[d.partType] || spriteRegistry.debrisParts.canLid;
      if (frames && frames.length === 8) {
        const dir8 = angleTo8Dir(d.angle);
        const img = frames[dir8];
        ctx.drawImage(
          img,
          Math.round(sx - img.width / 2),
          Math.round(sy - d.z - img.height / 2)
        );
      }
    }

    // 2. Particles: 24fps stepped dust puffs, lifted rocks with ground shades, Bresenham rings, split halves
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      // Quantize progress to 24fps steps
      const totalSteps = Math.max(1, Math.round(p.maxLife * 24));
      const curStep = Math.floor((1 - p.life / p.maxLife) * totalSteps);
      const stepProgress = curStep / totalSteps;

      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY);

      if (p.kind === 'ring') {
        const r = Math.max(2, Math.round(4 + (p.ringMaxRadius - 4) * stepProgress));
        // 2px thick Bresenham ring: signal outer, bone inner + fake dithered glow rings
        drawBresenhamCircle(ctx, sx, sy, r, p.color, 1.0);
        if (r > 3) {
          drawBresenhamCircle(ctx, sx, sy, r - 1, p.color2 || PALETTE.bone, 1.0);
        }
        drawDitheredGlowRings(ctx, sx, sy, r, p.color);
      } else if (p.kind === 'crossFlash') {
        // 2-frame white cross-cut flash on Lunge hit
        const arm = p.size;
        drawPixelLine(ctx, sx - arm, sy - arm, sx + arm, sy + arm, PALETTE.bone, 2);
        drawPixelLine(ctx, sx - arm, sy + arm, sx + arm, sy - arm, PALETTE.bone, 2);
      } else if (p.kind === 'rock') {
        // Ground shade stays on ground while rock lifts and falls
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 1, sy + 1, p.size, 2);
        const ry = Math.round(sy - p.z);
        ctx.fillStyle = p.color;
        ctx.fillRect(sx - 1, ry - 1, p.size, p.size);
        ctx.fillStyle = p.color2; // top-left highlight pixel
        ctx.fillRect(sx - 1, ry - 1, 1, 1);
      } else if (p.kind === 'dust') {
        if (sx < -16 || sx > camera.width + 16 || sy < -16 || sy > camera.height + 16) continue;
        // 3 sizes of integer pixel dust puffs (color shifts bone -> slag, dithered at end)
        const r = Math.max(1, p.size * 2 - Math.floor(stepProgress * p.size));
        const col = stepProgress < 0.45 ? PALETTE.bone : PALETTE.slag;
        ctx.fillStyle = col;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              if (stepProgress < 0.7 || passDither(sx + dx, sy + dy, 0.5)) {
                ctx.fillRect(sx + dx, sy + dy, 1, 1);
              }
            }
          }
        }
      } else if (p.kind === 'splitHalf' && p.splitCanvas) {
        // Enemy sprite split along its horizontal cut line sliding apart after Seven Cuts
        const w = p.splitCanvas.width;
        const h = p.splitCanvas.height;
        const halfH = Math.floor(h / 2);
        if (p.splitClipSide < 0) {
          ctx.drawImage(
            p.splitCanvas,
            0,
            0,
            w,
            halfH,
            Math.round(sx - w / 2),
            Math.round(sy - h / 2),
            w,
            halfH
          );
        } else {
          ctx.drawImage(
            p.splitCanvas,
            0,
            halfH,
            w,
            h - halfH,
            Math.round(sx - w / 2),
            Math.round(sy - h / 2 + halfH),
            w,
            h - halfH
          );
        }
      } else {
        // Square pixel particle (trails bone -> rust -> gone, zero alpha)
        if (sx < -10 || sx > camera.width + 10 || sy < -10 || sy > camera.height + 10) continue;
        ctx.fillStyle = stepProgress < 0.5 ? p.color : p.color2;
        ctx.fillRect(sx, sy, p.size, p.size);
      }
    }

    // 3. Slash Lines:
    // - 'lunge': 1px signal slash line along path for 150ms, shrinking from BOTH ends
    // - 'sevenCuts': full-length tapered white slash line at cut angle
    for (let i = 0; i < this.slashes.length; i++) {
      const s = this.slashes[i];
      if (!s.active) continue;
      const progress = 1 - Math.max(0, s.life / s.maxLife);

      if (s.kind === 'lunge') {
        // Shrink inward from both ends toward the midpoint
        const trim = progress * 0.48;
        const ax = s.x1 + (s.x2 - s.x1) * trim - camX;
        const ay = s.y1 + (s.y2 - s.y1) * trim - camY;
        const bx = s.x2 - (s.x2 - s.x1) * trim - camX;
        const by = s.y2 - (s.y2 - s.y1) * trim - camY;
        drawPixelLine(ctx, ax, ay, bx, by, s.color, 1);
      } else {
        // Tapered white slash line: 1px at tips, 3px in middle
        const mx = (s.x1 + s.x2) * 0.5;
        const my = (s.y1 + s.y2) * 0.5;
        const q1x = (s.x1 + mx) * 0.5;
        const q1y = (s.y1 + my) * 0.5;
        const q2x = (s.x2 + mx) * 0.5;
        const q2y = (s.y2 + my) * 0.5;
        drawPixelLine(ctx, s.x1 - camX, s.y1 - camY, s.x2 - camX, s.y2 - camY, s.color, 1);
        drawPixelLine(ctx, q1x - camX, q1y - camY, q2x - camX, q2y - camY, s.color, 3);
      }
    }

    // 3.2. Crescent Slashes (Sweeping high-velocity circular blade arcs)
    if (this.crescentSlashes && this.crescentSlashes.length > 0) {
      for (let i = 0; i < this.crescentSlashes.length; i++) {
        const cs = this.crescentSlashes[i];
        if (cs.life <= 0) continue;
        const progress = 1 - Math.max(0, cs.life / cs.maxLife);
        const sx = Math.round(cs.x - camX);
        const sy = Math.round(cs.y - camY);
        const rCur = cs.radius * (0.85 + progress * 0.25);
        const halfArc = cs.arc * 0.5;
        const segs = 16;

        let prevX = null;
        let prevY = null;
        let prevCoreX = null;
        let prevCoreY = null;

        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          const a = cs.angle - halfArc + t * cs.arc;
          const taper = Math.sin(t * Math.PI);
          const rOuter = rCur + taper * 4;
          const rCore = rCur;

          const px = Math.round(sx + Math.cos(a) * rOuter);
          const py = Math.round(sy + Math.sin(a) * rOuter);
          const cx = Math.round(sx + Math.cos(a) * rCore);
          const cy = Math.round(sy + Math.sin(a) * rCore);

          if (prevX !== null) {
            const thick = taper > 0.6 ? 3 : taper > 0.2 ? 2 : 1;
            drawPixelLine(ctx, prevX, prevY, px, py, cs.color, thick);
            drawPixelLine(ctx, prevCoreX, prevCoreY, cx, cy, PALETTE.bone, 1);
          }

          prevX = px;
          prevY = py;
          prevCoreX = cx;
          prevCoreY = cy;
        }

        // Star gleam at crescent apex
        const midA = cs.angle;
        const apexX = Math.round(sx + Math.cos(midA) * rCur);
        const apexY = Math.round(sy + Math.sin(midA) * rCur);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(apexX - 3, apexY - 1, 7, 3);
        ctx.fillRect(apexX - 1, apexY - 3, 3, 7);
      }
    }

    // 3.5. Colossal Anti-Materiel Rail Gun Beam Corridor (Multi-layered kinetic beam with Mach cones)
    if (this.railBeams && this.railBeams.length > 0) {
      for (let i = 0; i < this.railBeams.length; i++) {
        const b = this.railBeams[i];
        if (b.life <= 0) continue;
        const progress = 1 - Math.max(0, b.life / b.maxLife);

        const sx1 = Math.round(b.x1 - camX);
        const sy1 = Math.round(b.y1 - camY);
        const sx2 = Math.round(b.x2 - camX);
        const sy2 = Math.round(b.y2 - camY);

        const dx = sx2 - sx1;
        const dy = sy2 - sy1;
        const len = Math.hypot(dx, dy);
        if (len < 1) continue;
        const ang = Math.atan2(dy, dx);
        const nx = -dy / len;
        const ny = dx / len;

        const maxW = b.width || 90;
        // Peak width rapidly in first 12% of life, then taper down cleanly
        const curW = Math.max(
          4,
          Math.round(
            maxW *
              (progress < 0.12
                ? progress / 0.12
                : Math.max(0, 1 - (progress - 0.12) * 1.1))
          )
        );

        // Fast rotated rectangle bands for solid inner energy core (avoids 60+ 1400px Bresenham loops)
        ctx.save();
        ctx.translate(sx1, sy1);
        ctx.rotate(ang);

        const drawLen = Math.min(len, 620);
        const midW = Math.max(4, Math.round(curW * 0.46));
        const coreW = Math.max(2, Math.round(curW * 0.22));

        // Outer soot contrast trench border
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, -Math.round(curW * 0.52), drawLen, Math.round(curW * 1.04));

        // Rust plasma envelope
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(0, -Math.round(curW * 0.42), drawLen, Math.round(curW * 0.84));

        // High-voltage Brass energy core
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(0, -Math.round(midW * 0.5), drawLen, midW);

        // Blazing Tungsten Bone core
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(0, -Math.round(coreW * 0.5), drawLen, coreW);

        // Pure White center needle
        if (progress < 0.65) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, -1, drawLen, 2);
        }
        ctx.restore();

        // Outer rail boundary lines & Mach shockwave cones (clipped to viewport via drawPixelLine)
        const outerOff = Math.round(curW * 0.5);
        drawPixelLine(ctx, sx1 + nx * outerOff, sy1 + ny * outerOff, sx2 + nx * outerOff, sy2 + ny * outerOff, PALETTE.brass, 1);
        drawPixelLine(ctx, sx1 - nx * outerOff, sy1 - ny * outerOff, sx2 - nx * outerOff, sy2 - ny * outerOff, PALETTE.brass, 1);

        // Mach shock rings along the rail wake
        for (let m = 1; m <= 6; m++) {
          const distM = m * 85 + progress * 40;
          const mx = sx1 + (dx / len) * distM;
          const my = sy1 + (dy / len) * distM;
          const machR = Math.max(4, Math.round(curW * 0.38));
          drawBresenhamCircle(ctx, mx, my, machR, m % 2 === 0 ? PALETTE.bone : PALETTE.brass, 0.75);
        }

        // Crackling high-voltage electric arcs along the visible corridor
        const arcCount = 8;
        for (let a = 0; a < arcCount; a++) {
          const d1 = a * 65;
          const d2 = (a + 1) * 65;
          const j1 = Math.sin(b.seed + a * 5 + progress * 35) * (curW * 0.52);
          const j2 = Math.cos(b.seed + a * 11 + progress * 35) * (curW * 0.52);
          const ax1 = sx1 + (dx / len) * d1 + nx * j1;
          const ay1 = sy1 + (dy / len) * d1 + ny * j1;
          const ax2 = sx1 + (dx / len) * d2 + nx * j2;
          const ay2 = sy1 + (dy / len) * d2 + ny * j2;
          drawPixelLine(ctx, ax1, ay1, ax2, ay2, a % 2 === 0 ? '#52C5FF' : PALETTE.bone, 1);
        }
      }
    }

    // 4. Crisp integer pixel damage numbers (no sub-pixel, no alpha)
    ctx.save();
    ctx.textAlign = 'center';
    for (let i = 0; i < this.numbers.length; i++) {
      const n = this.numbers[i];
      if (!n.active) continue;
      if (n.life < 0.16 && Math.floor(n.life * 24) % 2 === 0) continue;

      const sx = Math.round(n.x - camX);
      const sy = Math.round(n.y - camY);
      if (sx < -30 || sx > camera.width + 30 || sy < -20 || sy > camera.height + 20) continue;

      ctx.font = n.isCrit
        ? 'bold 10px ui-monospace, SFMono-Regular, Menlo, monospace'
        : 'bold 8px ui-monospace, SFMono-Regular, Menlo, monospace';
      // 1px Soot outline
      ctx.fillStyle = PALETTE.soot;
      ctx.fillText(n.text, sx + 1, sy);
      ctx.fillText(n.text, sx - 1, sy);
      ctx.fillText(n.text, sx, sy + 1);
      ctx.fillText(n.text, sx, sy - 1);
      ctx.fillStyle = n.color;
      ctx.fillText(n.text, sx, sy);
    }
    ctx.restore();
  }

  drawGroundDecals(ctx, camera) {
    this.drawGroundLayer(ctx, camera);
  }

  drawPickups(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;
    for (let i = 0; i < this.pickups.length; i++) {
      const pk = this.pickups[i];
      if (!pk.active) continue;
      const sx = Math.round(pk.x - camX);
      const sy = Math.round(pk.y - camY);
      if (sx < -16 || sx > camera.width + 16 || sy < -16 || sy > camera.height + 16) continue;

      if (pk.type === 'scrap') {
        const scrapCanvas = spriteRegistry.getScrapVariant(pk.variant || 0);
        if (scrapCanvas) {
          ctx.drawImage(scrapCanvas, sx - 4, sy - 4);
        } else {
          ctx.fillStyle = PALETTE.verdigris;
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
        }
      } else if (pk.type === 'gold') {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 3, sy - 3, 6, 6);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
      } else if (pk.type === 'item') {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(sx - 4, sy - 4, 8, 8);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(sx - 3, sy - 3, 6, 6);
      }
    }
  }

  drawParticlesAndText(ctx, camera) {
    this.draw(ctx, camera);
  }
}

export { ParticlePool as ParticleSystem };
export default ParticlePool;
