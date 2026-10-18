/**
 * GRAVEL SKY — Complete Layered Sprite Pipeline & Pre-Baked Cache
 * Builds Sena Ibuki (48x48, 30px body, 4-head proportions, 4 directions),
 * all 5 Commons (20-28px), 3 Elites (40-48px with pulsing blood rim),
 * 4 Bosses (96-160px), 8-angle Rail Spike & enemy debris parts, and 64x16 Ultimate eye cut-in.
 */

import { PALETTE, SHOP_ITEMS } from '../data/config.js';
import {
  PixelGrid,
  bake8AngleFrames,
  MATERIAL_RAMPS,
} from './PixelArt.js';

/**
 * SENA IBUKI (48x48 canvas, body ~30px tall from y=11 to y=41, 4-head proportions ~7.5px head)
 * Asymmetric details:
 * - Left sleeve torn off at elbow, forearm wrapped in grey bandage ('bone' ramp)
 * - Right forearm wears a brass cuff made from a pipe clamp ('brass' ramp)
 * - Black work coat ('coat' ramp), hem frayed, one square rust-colored patch sewn on back left shoulder
 * - Rust-red hair cut short and uneven, one longer strand at left held by a bent paper clip ('steel')
 * - Cracked pair of welding goggles pushed up on forehead
 * - 2x2 pixel eyes with 1 bone highlight pixel (flash signal cyan only during Seven Cuts)
 * - Weapon: The Railcut (22px length of rail, flat flange hilt wrapped in dirty cloth, only 1px edge glows signal cyan with 4-frame flicker)
 */
export function buildSenaFrameGrid(anim, frameIdx, dir = 'right', equipped = {}, isUltimateEyes = false) {
  const g = new PixelGrid(48, 48);

  // Determine coat/legs material from equipped gear
  const coatMat =
    equipped.body === 'plateCoat'
      ? 'rust'
      : equipped.body === 'riotJacket'
      ? 'bog'
      : 'coat';
  const legsMat =
    equipped.legs === 'hydraulicShins'
      ? 'brass'
      : equipped.legs === 'courierLeggings'
      ? 'bog'
      : 'steel';

  // Dodge Roll: 6f tucked ball roll
  if (anim === 'dodge') {
    const cx = 24;
    const cy = 28 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 8, coatMat, 1);
    // Frayed coat & rust shoulder patch rotating through the tuck
    const ang = (frameIdx / 6) * Math.PI * 2;
    const hx = cx + Math.round(Math.cos(ang) * 5);
    const hy = cy + Math.round(Math.sin(ang) * 5);
    g.rect(hx - 3, hy - 3, 6, 6, 'hair', 2);
    g.rect(cx - 2, cy - 2, 4, 4, 'scarf', 2);
    // Tucked Railcut on back
    g.line(cx - 8, cy + 5, cx + 8, cy - 5, 'steel', 2, 2);
    g.set(cx + 8, cy - 5, 'signal', 3);
    return g;
  }

  // Death: 5f (0: stagger, 1: drops to knees, 2: sword plants in ground, 3: falls forward, 4: settled)
  if (anim === 'death') {
    if (frameIdx >= 3) {
      // Planted Railcut vertical in ground at x=33, y=16..38
      g.rect(32, 16, 4, 3, 'brass', 2); // Flange hilt
      g.rect(33, 19, 2, 3, 'bone', 1); // Dirty cloth wrap
      g.rect(33, 22, 3, 17, 'steel', 2); // 22px rail shaft
      g.line(35, 22, 35, 38, 'signal', 3, 1); // 1px cyan edge
      // Fallen body on ground (y=34..41)
      g.shadedRect(12, 34, 16, 6, coatMat);
      g.rect(14, 35, 3, 3, 'rust', 2); // Back left shoulder rust patch
      g.shadedRect(26, 35, 6, 5, 'hair');
      g.rect(10, 36, 4, 3, 'bone', 2); // Bandaged left forearm outstretched
      return g;
    }
    const kneelDrop = frameIdx * 4;
    const cy = 12 + kneelDrop;
    // Planted Railcut appearing on frame 2
    if (frameIdx >= 2) {
      g.rect(31, 18, 4, 2, 'brass', 2);
      g.rect(32, 20, 3, 19, 'steel', 2);
      g.line(34, 20, 34, 38, 'signal', 3, 1);
    }
    g.shadedRect(20, cy + 16, 7, 7, legsMat);
    g.shadedRect(19, cy + 7, 9, 10, coatMat);
    g.rect(20, cy + 8, 3, 3, 'rust', 2);
    g.shadedRect(20, cy, 8, 7, 'skin');
    g.shadedRect(19, cy - 1, 9, 4, 'hair');
    return g;
  }

  // Standard 30px tall 4-head proportions (y=11..41)
  let bobY = 0;
  let torsoLeanX = 0;
  let leftFootY = 0;
  let rightFootY = 0;
  let leftFootX = 0;
  let rightFootX = 0;

  if (anim === 'idle') {
    bobY = frameIdx === 1 || frameIdx === 2 ? 1 : 0;
  } else if (anim === 'run') {
    bobY = frameIdx % 3 === 1 ? -1 : frameIdx % 3 === 2 ? 1 : 0;
    torsoLeanX = dir === 'up' || dir === 'down' ? 0 : 2;
    const strideX = [-4, -2, 1, 4, 2, -1][frameIdx % 6];
    const strideY = [0, -2, -1, 0, -2, -1][frameIdx % 6];
    leftFootX = strideX;
    rightFootX = -strideX;
    leftFootY = strideY;
    rightFootY = [-1, 0, -2, -1, 0, -2][frameIdx % 6];
  } else if (anim === 'hurt') {
    torsoLeanX = -2;
    bobY = 1;
  } else if (anim === 'attack1' || anim === 'attack2' || anim === 'attack3') {
    // 4f: 0=anticipation, 1=hold, 2=smear+lunge, 3=recovery
    if (frameIdx === 0) torsoLeanX = -2;
    else if (frameIdx === 1 || frameIdx === 2) {
      torsoLeanX = anim === 'attack3' ? 4 : 2; // Hit 3 has 2px extra forward lunge
    } else torsoLeanX = 1;
  }

  const cx = 23 + torsoLeanX;
  const topY = 11 + bobY; // Head is 7px tall (11..18), Torso/Coat is 14px (18..32), Legs/Boots 9px (32..41) => 30px tall

  // LAYER 1: BACK ARM & WEAPON WHEN CARRIED
  const isAttacking = anim === 'attack1' || anim === 'attack2' || anim === 'attack3';
  if (!isAttacking) {
    // Carried 22px Railcut diagonally across back
    const rx0 = cx - 9;
    const ry0 = topY + 20;
    const rx1 = cx + 9;
    const ry1 = topY + 4;
    // Flange hilt wrapped in dirty cloth
    g.rect(rx0 - 2, ry0 - 1, 4, 3, 'steel', 1);
    g.rect(rx0, ry0 - 2, 3, 3, 'bone', 1);
    // 22px Rail shaft
    g.line(rx0 + 1, ry0 - 1, rx1, ry1, 'steel', 2, 3);
    // 1px Signal-cyan ground edge with slow 4-frame flicker
    const edgeStep = frameIdx % 4 === 2 ? 2 : 3;
    g.line(rx0 + 2, ry0, rx1 + 1, ry1 + 1, 'signal', edgeStep, 1);
  }

  // Left arm (back arm when facing right): sleeve torn off at elbow, forearm wrapped in grey bandage
  const lArmX = dir === 'up' ? cx - 6 : cx - 4;
  const lArmY = topY + 9;
  g.rect(lArmX, lArmY, 3, 4, 'skin', 2); // bare elbow where sleeve is torn
  g.rect(lArmX - 1, lArmY + 4, 3, 5, 'bone', 2); // grey bandage forearm wrap
  g.set(lArmX, lArmY + 6, 'bone', 1); // bandage seam

  // LAYER 2: LEGS & BOOTS (y = topY+21 .. topY+30)
  const legBaseY = topY + 21;
  // Back/Left leg
  g.shadedRect(cx - 4 + leftFootX, legBaseY + leftFootY, 3, 6, 'coat');
  g.shadedRect(cx - 4 + leftFootX, legBaseY + 5 + leftFootY, 4, 4, legsMat);
  // Front/Right leg
  g.shadedRect(cx + 1 + rightFootX, legBaseY + rightFootY, 3, 6, 'coat');
  g.shadedRect(cx + 1 + rightFootX, legBaseY + 5 + rightFootY, 4, 4, legsMat);

  // LAYER 3: TORSO & BLACK WORK COAT WITH FRAYED HEM & RUST PATCH
  const coatY = topY + 8;
  g.shadedRect(cx - 5, coatY, 10, 13, coatMat);
  // Coat tail lag when running
  const tailLag = anim === 'run' ? -2 - (frameIdx % 2) : 0;
  // Frayed coat hem teeth at bottom
  for (let fx = -5; fx <= 4; fx += 2) {
    g.rect(cx + fx + (fx < 0 ? tailLag : 0), coatY + 12, 2, 2, coatMat, 1);
  }
  // One square rust-colored patch sewn on the back left shoulder
  if (dir !== 'down') {
    g.rect(cx - 4, coatY + 2, 3, 3, 'rust', 2);
  } else {
    g.rect(cx + 1, coatY + 2, 3, 3, 'rust', 2);
  }

  // Scarf neck collar wrap (bone color)
  g.shadedRect(cx - 4, topY + 7, 9, 3, 'scarf');

  // LAYER 4: HEAD, UNEVEN RUST HAIR, PAPER CLIP, & WELDING GOGGLES ON FOREHEAD (7.5px head)
  const headX = anim === 'hurt' ? cx - 2 : cx - 4;
  const headY = topY;
  g.shadedRect(headX, headY + 1, 8, 6, 'skin');

  if (dir !== 'up') {
    // 2x2 eyes with 1 bone highlight pixel (or signal cyan during Seven Cuts)
    const eyeBlink = anim === 'idle' && frameIdx === 3;
    const eyeX = dir === 'down' ? headX + 2 : headX + 4;
    const eyeY = headY + 3;
    if (eyeBlink) {
      g.rect(eyeX, eyeY + 1, 2, 1, 'coat', 0);
      if (dir === 'down') g.rect(eyeX + 4, eyeY + 1, 2, 1, 'coat', 0);
    } else {
      const eyeMat = isUltimateEyes ? 'signal' : 'coat';
      const eyeStep = isUltimateEyes ? 3 : 0;
      g.rect(eyeX, eyeY, 2, 2, eyeMat, eyeStep);
      g.set(eyeX, eyeY, isUltimateEyes ? 'signal' : 'bone', 3); // 1px bone highlight
      if (dir === 'down') {
        g.rect(eyeX + 4, eyeY, 2, 2, eyeMat, eyeStep);
        g.set(eyeX + 4, eyeY, isUltimateEyes ? 'signal' : 'bone', 3);
      }
    }
  }

  // Short uneven rust-red hair
  g.shadedRect(headX - 1, headY - 1, 9, 3, 'hair');
  g.rect(headX - 1, headY + 1, 2, 4, 'hair', 1);
  // Longer strand at the left held by a bent paper clip
  g.rect(headX - 2, headY + 2, 2, 6, 'hair', 2);
  g.rect(headX - 2, headY + 4, 2, 1, 'steel', 3); // Bent paper clip

  // Cracked pair of welding goggles pushed up on the forehead
  g.rect(headX, headY, 8, 2, 'steel', 1);
  g.rect(headX + 1, headY, 2, 2, 'brass', 2); // Left lens rim
  g.rect(headX + 5, headY, 2, 2, 'brass', 2); // Right lens rim
  g.set(headX + 2, headY + 1, 'bone', 3); // Diagonal crack across lens

  // LAYER 5: FRONT RIGHT ARM (with Brass pipe-clamp cuff) & ACTIVE RAILCUT ATTACKS
  const rArmX = cx + 2;
  const rArmY = topY + 9;

  if (!isAttacking) {
    g.rect(rArmX, rArmY, 3, 5, coatMat, 2);
    // Brass cuff made from a pipe clamp on right forearm
    g.rect(rArmX, rArmY + 5, 3, 3, 'brass', 3);
    g.set(rArmX + 2, rArmY + 6, 'steel', 1); // clamp bolt
    g.rect(rArmX, rArmY + 8, 2, 2, 'skin', 2);
  } else {
    // 3-Hit Combo Animations (4 frames each: 0=anticipation, 1=hold, 2=smear, 3=recovery)
    this_drawAttackBlade(g, anim, frameIdx, cx, topY, coatMat);
  }

  return g;
}

function this_drawAttackBlade(g, anim, frameIdx, cx, topY, coatMat) {
  const rArmY = topY + 9;
  const edgeStep = frameIdx % 2 === 0 ? 3 : 2;

  if (anim === 'attack1') {
    // Hit 1: Horizontal cut
    if (frameIdx === 0) {
      // Anticipation: blade drawn back behind shoulder
      g.rect(cx - 2, rArmY, 4, 3, 'brass', 3);
      g.line(cx - 3, rArmY, cx - 18, rArmY - 6, 'steel', 2, 3);
      g.line(cx - 3, rArmY - 1, cx - 18, rArmY - 7, 'signal', edgeStep, 1);
    } else if (frameIdx === 1) {
      // Hold frame: mid-swing horizontal extension
      g.rect(cx + 3, rArmY, 4, 3, 'brass', 3);
      g.rect(cx + 6, rArmY - 1, 20, 4, 'steel', 2);
      g.line(cx + 6, rArmY + 3, cx + 25, rArmY + 3, 'signal', 3, 1);
    } else if (frameIdx === 2) {
      // Smear frame: wide solid bone/steel sweep wedge + 1px cyan outer edge
      for (let r = 8; r <= 23; r++) {
        for (let dy = -6; dy <= 5; dy++) {
          const mat = dy >= 4 ? 'signal' : dy >= 1 ? 'bone' : 'steel';
          g.set(cx + r, rArmY + dy, mat, dy >= 4 ? 3 : 2);
        }
      }
      g.rect(cx + 4, rArmY + 2, 21, 3, 'steel', 2);
      g.line(cx + 4, rArmY + 5, cx + 24, rArmY + 5, 'signal', 3, 1);
    } else {
      // Recovery frame: blade low forward
      g.rect(cx + 2, rArmY + 2, 3, 3, 'brass', 2);
      g.line(cx + 4, rArmY + 3, cx + 19, rArmY + 10, 'steel', 2, 3);
      g.line(cx + 4, rArmY + 5, cx + 19, rArmY + 12, 'signal', edgeStep, 1);
    }
  } else if (anim === 'attack2') {
    // Hit 2: Backhand upward cut
    if (frameIdx === 0) {
      g.rect(cx + 1, rArmY + 3, 3, 3, 'brass', 2);
      g.line(cx + 3, rArmY + 4, cx + 15, rArmY + 13, 'steel', 2, 3);
      g.line(cx + 4, rArmY + 3, cx + 16, rArmY + 12, 'signal', edgeStep, 1);
    } else if (frameIdx === 1) {
      g.rect(cx + 3, rArmY - 1, 4, 3, 'brass', 3);
      g.line(cx + 6, rArmY - 1, cx + 24, rArmY - 6, 'steel', 2, 3);
      g.line(cx + 6, rArmY - 3, cx + 24, rArmY - 8, 'signal', 3, 1);
    } else if (frameIdx === 2) {
      // Backhand smear arc
      for (let r = 8; r <= 23; r++) {
        for (let dy = -9; dy <= 2; dy++) {
          const mat = dy <= -8 ? 'signal' : dy <= -5 ? 'bone' : 'steel';
          g.set(cx + r, rArmY + dy, mat, dy <= -8 ? 3 : 2);
        }
      }
      g.line(cx + 5, rArmY - 2, cx + 22, rArmY - 10, 'steel', 2, 3);
      g.line(cx + 5, rArmY - 4, cx + 22, rArmY - 12, 'signal', 3, 1);
    } else {
      g.rect(cx + 1, rArmY - 3, 3, 3, 'brass', 2);
      g.line(cx + 2, rArmY - 4, cx + 14, rArmY - 13, 'steel', 2, 3);
      g.line(cx + 3, rArmY - 4, cx + 15, rArmY - 13, 'signal', edgeStep, 1);
    }
  } else {
    // Hit 3: Overhead chop with 2-pixel forward lunge
    if (frameIdx === 0) {
      // Raised high overhead
      g.rect(cx, topY - 2, 3, 4, 'brass', 3);
      g.rect(cx - 1, topY - 11, 3, 10, 'steel', 2);
      g.line(cx + 2, topY - 11, cx + 2, topY - 2, 'signal', 3, 1);
    } else if (frameIdx === 1) {
      // Hold at apex
      g.rect(cx + 1, topY - 3, 3, 4, 'brass', 3);
      g.rect(cx, topY - 11, 4, 9, 'steel', 3);
      g.line(cx + 4, topY - 11, cx + 4, topY - 3, 'signal', 3, 1);
    } else if (frameIdx === 2) {
      // Heavy downward chop smear from overhead to ground
      for (let py = topY - 8; py <= topY + 22; py++) {
        const reach = Math.round(18 + Math.sin(((py - (topY - 8)) / 30) * Math.PI) * 6);
        for (let px = cx + 6; px <= cx + reach; px++) {
          const isEdge = px >= cx + reach - 1;
          g.set(px, py, isEdge ? 'signal' : px >= cx + reach - 3 ? 'bone' : 'steel', isEdge ? 3 : 2);
        }
      }
      g.rect(cx + 4, rArmY + 5, 20, 4, 'steel', 2);
      g.line(cx + 4, rArmY + 9, cx + 23, rArmY + 9, 'signal', 3, 1);
    } else {
      // Recovery: blade embedded low
      g.rect(cx + 3, rArmY + 4, 3, 3, 'brass', 2);
      g.rect(cx + 5, rArmY + 6, 19, 4, 'steel', 2);
      g.line(cx + 5, rArmY + 10, cx + 23, rArmY + 10, 'signal', edgeStep, 1);
    }
  }
}

export function applyPromotionOverlayToGrid(g, classId, stage = 1, branch = null, anim = 'idle', frameIdx = 0) {
  if (stage < 2 || !branch) return g;
  if (anim === 'death' || anim === 'dodge') return g;

  const cx = 23;
  const topY = 11 + (anim === 'idle' && (frameIdx === 1 || frameIdx === 2) ? 1 : 0);

  if (classId === 'sena') {
    if (branch === 'cutter') {
      // Journeyman (Cutter): longer re-ground rail edge + red cloth bound on hilt
      g.rect(cx - 10, topY + 19, 4, 3, 'blood', 2); // Red cloth bound on hilt
      g.line(cx + 8, topY + 5, cx + 13, topY + 1, 'signal', 3, 2); // Extended re-ground edge
      if (stage >= 3) {
        // Master (Flenser): leather butcher's apron + second short blade on hip
        g.shadedRect(cx - 4, topY + 11, 8, 11, 'rust'); // Butcher's apron
        g.line(cx - 7, topY + 18, cx + 2, topY + 22, 'steel', 3, 2); // Second short hip blade
        g.set(cx - 7, topY + 18, 'brass', 3);
      }
    } else if (branch === 'anvil') {
      // Journeyman (Anvil): welded plate pauldron on left shoulder + road-sign buckler on left forearm
      g.shadedRect(cx - 7, topY + 7, 5, 5, 'steel'); // Left shoulder plate pauldron
      g.shadedRect(cx - 8, topY + 13, 5, 6, 'brass'); // Road-sign buckler on left forearm
      g.set(cx - 6, topY + 15, 'coat', 0);
      if (stage >= 3) {
        // Master (Girder): full riveted boiler chest plate
        g.shadedRect(cx - 5, topY + 9, 10, 10, 'steel');
        g.set(cx - 3, topY + 11, 'brass', 3);
        g.set(cx + 3, topY + 11, 'brass', 3);
        g.set(cx - 3, topY + 16, 'brass', 3);
        g.set(cx + 3, topY + 16, 'brass', 3);
      }
    }
  } else if (classId === 'rook') {
    if (branch === 'longhand') {
      // Journeyman (Longhand): longer barrel + bottle-lens scope
      g.rect(cx + 12, topY + 11, 7, 2, 'steel', 3); // Extended barrel
      g.rect(cx + 6, topY + 9, 4, 2, 'signal', 3); // Bottle-lens scope
      if (stage >= 3) {
        // Master (Surveyor): surveyor's tripod strapped to back + bigger brass monocle
        g.line(cx - 7, topY + 5, cx - 10, topY + 23, 'brass', 2, 2);
        g.line(cx - 5, topY + 5, cx - 8, topY + 24, 'steel', 2, 1);
        g.rect(cx + 1, topY + 2, 4, 4, 'brass', 3); // Bigger monocle
      }
    } else if (branch === 'wirehand') {
      // Journeyman (Wirehand): spools of wire on belt + trap satchel
      g.circle(cx - 4, topY + 19, 2, 'brass', 3); // Wire spool
      g.shadedRect(cx - 7, topY + 16, 4, 5, 'bone'); // Trap satchel
      if (stage >= 3) {
        // Master (Minelayer): bandolier of cans with fuses across chest
        g.rect(cx - 3, topY + 10, 3, 3, 'rust', 3);
        g.rect(cx, topY + 13, 3, 3, 'rust', 3);
        g.set(cx - 2, topY + 9, 'brass', 3);
        g.set(cx + 1, topY + 12, 'brass', 3);
      }
    }
  } else if (classId === 'ines') {
    if (branch === 'binder') {
      // Journeyman (Binder): heavier alternator coil + second horseshoe magnet on back
      g.shadedRect(cx - 9, topY + 6, 5, 12, 'brass');
      g.rect(cx - 10, topY + 4, 4, 3, 'verdigris', 3); // Second magnet tip
      if (stage >= 3) {
        // Master (Crane): hoist hook on a short chain from the shoulder
        g.line(cx + 4, topY + 7, cx + 8, topY + 15, 'steel', 3, 1);
        g.rect(cx + 7, topY + 15, 3, 4, 'brass', 3);
      }
    } else if (branch === 'slinger') {
      // Journeyman (Slinger): bag of loose scrap on hip + leather sling band on forearm
      g.shadedRect(cx - 6, topY + 17, 5, 5, 'rust');
      g.rect(cx + 2, topY + 12, 4, 2, 'rust', 3);
      if (stage >= 3) {
        // Master (Wrecker): chunk of heavy chain wrapped around shoulders
        g.line(cx - 6, topY + 8, cx + 5, topY + 11, 'steel', 3, 2);
        g.line(cx - 5, topY + 12, cx + 4, topY + 9, 'steel', 2, 2);
      }
    }
  }

  return g;
}

/**
 * ROOK MATSUDA — RANGED (48x48 canvas, lanky courier ~31px tall)
 * - Tilted flat cap with a cracked bike reflector sewn on the brim
 * - Salvaged rangefinder monocle strapped over the left eye with a brass rim
 * - Olive-drab road coat tied at the waist, canvas bandolier of rail bolts across the chest
 * - Mismatched fingerless gloves (one canvas, one leather)
 * - Weapon: The Springgun (rebuilt nail-gun crossbow with a car leaf spring as the bow)
 */
export function buildRookFrameGrid(anim, frameIdx, dir = 'right', equipped = {}, isUltimateEyes = false) {
  const g = new PixelGrid(48, 48);
  const coatMat =
    equipped.body === 'plateCoat'
      ? 'rust'
      : equipped.body === 'riotJacket'
      ? 'bog'
      : 'olive';
  const legsMat =
    equipped.legs === 'hydraulicShins'
      ? 'brass'
      : equipped.legs === 'courierLeggings'
      ? 'bog'
      : 'coat';

  if (anim === 'dodge') {
    const cx = 24;
    const cy = 28 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 8, coatMat, 2);
    g.rect(cx - 4, cy - 5, 7, 3, 'brass', 3);
    g.line(cx - 7, cy + 4, cx + 7, cy - 4, 'steel', 3, 2);
    return g;
  }

  if (anim === 'death') {
    g.shadedRect(12, 34, 18, 6, coatMat);
    g.shadedRect(27, 35, 6, 5, 'olive');
    g.rect(31, 35, 2, 2, 'brass', 3);
    g.line(14, 32, 26, 30, 'steel', 2, 2);
    return g;
  }

  let bobY = 0;
  let torsoLeanX = 0;
  let leftFootX = 0;
  let rightFootX = 0;
  let leftFootY = 0;
  let rightFootY = 0;

  if (anim === 'idle') {
    bobY = frameIdx === 1 || frameIdx === 2 ? 1 : 0;
  } else if (anim === 'run') {
    bobY = frameIdx % 3 === 1 ? -1 : 0;
    torsoLeanX = dir === 'up' || dir === 'down' ? 0 : 2;
    const strideX = [-4, -2, 1, 4, 2, -1][frameIdx % 6];
    const strideY = [0, -2, -1, 0, -2, -1][frameIdx % 6];
    leftFootX = strideX;
    rightFootX = -strideX;
    leftFootY = strideY;
    rightFootY = [-1, 0, -2, -1, 0, -2][frameIdx % 6];
  } else if (anim === 'hurt') {
    torsoLeanX = -2;
    bobY = 1;
  } else if (anim === 'attack1' || anim === 'attack2' || anim === 'attack3') {
    // Recoil kick on shot frame
    torsoLeanX = frameIdx === 1 ? -2 : 0;
  }

  const cx = 23 + torsoLeanX;
  const topY = 10 + bobY;

  // Legs & Tall Laced Boots
  const legBaseY = topY + 21;
  g.shadedRect(cx - 4 + leftFootX, legBaseY + leftFootY, 3, 6, 'bone');
  g.shadedRect(cx - 4 + leftFootX, legBaseY + 5 + leftFootY, 4, 5, legsMat);
  g.shadedRect(cx + 1 + rightFootX, legBaseY + rightFootY, 3, 6, 'bone');
  g.shadedRect(cx + 1 + rightFootX, legBaseY + 5 + rightFootY, 4, 5, legsMat);

  // Olive-drab road coat tied at waist
  const coatY = topY + 8;
  g.shadedRect(cx - 5, coatY, 10, 14, coatMat);
  g.rect(cx - 5, coatY + 8, 10, 2, 'rust', 2); // Waist tie belt

  // Canvas bandolier of rail bolts across chest
  g.line(cx - 4, coatY + 1, cx + 4, coatY + 10, 'bone', 2, 2);
  g.set(cx - 2, coatY + 3, 'brass', 3);
  g.set(cx, coatY + 5, 'brass', 3);
  g.set(cx + 2, coatY + 7, 'brass', 3);

  // Head & Tilted Flat Cap with cracked bike reflector on brim
  const headX = cx - 4;
  const headY = topY;
  g.shadedRect(headX, headY + 2, 8, 6, 'skin');

  if (dir !== 'up') {
    // Salvaged rangefinder monocle strapped over left eye with brass rim
    const monoX = dir === 'down' ? headX + 1 : headX + 3;
    g.rect(monoX, headY + 3, 3, 3, 'brass', 3);
    g.set(monoX + 1, headY + 4, isUltimateEyes ? 'brass' : 'signal', 3);
    if (dir === 'down') {
      g.rect(headX + 5, headY + 4, 2, 2, 'coat', 0);
    }
  }

  // Tilted flat cap + bike reflector on brim
  g.shadedRect(headX - 1, headY - 1, 10, 4, 'olive');
  g.rect(headX + 6, headY + 1, 4, 2, 'coat', 1); // Cap brim
  g.rect(headX + 7, headY, 2, 2, 'rust', 3); // Cracked orange-red bike reflector

  // Arms & The Springgun (rebuilt nail-gun crossbow with car leaf spring bow)
  const gunX = cx + 2;
  const gunY = topY + 10;
  g.rect(gunX - 1, gunY, 4, 3, 'skin', 2);
  g.rect(gunX + 1, gunY, 2, 3, 'bone', 2); // Canvas fingerless glove
  // Springgun body
  g.shadedRect(gunX + 2, gunY - 1, 11, 4, 'steel');
  // Car leaf spring bow curved vertically at front of gun
  g.line(gunX + 11, gunY - 5, gunX + 13, gunY + 6, 'rust', 3, 2);
  g.line(gunX + 6, gunY - 4, gunX + 11, gunY - 5, 'bone', 2, 1); // Bowstring
  g.line(gunX + 6, gunY + 5, gunX + 11, gunY + 6, 'bone', 2, 1);
  // Loaded rail bolt & muzzle flash on attack
  if (anim === 'attack1' || anim === 'attack2' || anim === 'attack3') {
    if (frameIdx === 1 || frameIdx === 2) {
      g.rect(gunX + 14, gunY - 1, 6, 3, 'brass', 3);
      g.set(gunX + 20, gunY, 'bone', 3);
    }
  } else {
    g.line(gunX + 8, gunY, gunX + 15, gunY, 'brass', 3, 1);
  }

  return g;
}

/**
 * INES CALLOWAY — MAGE / MAGNETIST (48x48 canvas, stocky ~29px tall)
 * - Grey streak in dark hair pulled into a tight bun
 * - Thick safety goggles around her neck
 * - Quilted jacket under a heavy canvas apron, tool ring on belt
 * - Backpack frame carrying an old car alternator coil wrapped in copper wire with verdigris-green glowing tips
 * - Thick welding gloves each with a large horseshoe magnet bound to the palm
 */
export function buildInesFrameGrid(anim, frameIdx, dir = 'right', equipped = {}, isUltimateEyes = false) {
  const g = new PixelGrid(48, 48);
  const coatMat =
    equipped.body === 'plateCoat'
      ? 'rust'
      : equipped.body === 'riotJacket'
      ? 'bog'
      : 'steel';
  const legsMat =
    equipped.legs === 'hydraulicShins'
      ? 'brass'
      : equipped.legs === 'courierLeggings'
      ? 'bog'
      : 'coat';

  if (anim === 'dodge') {
    const cx = 24;
    const cy = 28 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 8, 'bone', 2);
    g.circle(cx, cy, 5, 'verdigris', 3);
    return g;
  }

  if (anim === 'death') {
    g.shadedRect(12, 34, 17, 6, 'bone');
    g.shadedRect(14, 31, 8, 5, 'rust'); // Alternator pack
    g.rect(15, 30, 3, 2, 'verdigris', 3);
    return g;
  }

  let bobY = 0;
  let torsoLeanX = 0;
  let leftFootX = 0;
  let rightFootX = 0;
  let leftFootY = 0;
  let rightFootY = 0;

  if (anim === 'idle') {
    bobY = frameIdx === 1 || frameIdx === 2 ? 1 : 0;
  } else if (anim === 'run') {
    bobY = frameIdx % 3 === 1 ? -1 : 0;
    torsoLeanX = dir === 'up' || dir === 'down' ? 0 : 1;
    const strideX = [-3, -1, 1, 3, 1, -1][frameIdx % 6];
    const strideY = [0, -2, -1, 0, -2, -1][frameIdx % 6];
    leftFootX = strideX;
    rightFootX = -strideX;
    leftFootY = strideY;
    rightFootY = [-1, 0, -2, -1, 0, -2][frameIdx % 6];
  } else if (anim === 'hurt') {
    torsoLeanX = -2;
    bobY = 1;
  } else if (anim === 'attack1' || anim === 'attack2' || anim === 'attack3') {
    torsoLeanX = frameIdx === 1 || frameIdx === 2 ? 2 : 0;
  }

  const cx = 23 + torsoLeanX;
  const topY = 12 + bobY;

  // Backpack frame carrying old car alternator coil wrapped in copper wire with verdigris tips
  const packX = dir === 'down' ? cx + 4 : cx - 9;
  const packY = topY + 5;
  g.shadedRect(packX, packY, 6, 12, 'steel');
  g.shadedRect(packX + 1, packY + 2, 4, 7, 'rust'); // Copper wire coil
  const tipStep = frameIdx % 2 === 0 ? 3 : 2;
  g.rect(packX, packY - 2, 5, 3, 'verdigris', tipStep); // Glowing verdigris coil tips

  // Legs & Boots
  const legBaseY = topY + 20;
  g.shadedRect(cx - 4 + leftFootX, legBaseY + leftFootY, 4, 5, 'coat');
  g.shadedRect(cx - 4 + leftFootX, legBaseY + 4 + leftFootY, 4, 4, legsMat);
  g.shadedRect(cx + 1 + rightFootX, legBaseY + rightFootY, 4, 5, 'coat');
  g.shadedRect(cx + 1 + rightFootX, legBaseY + 4 + rightFootY, 4, 4, legsMat);

  // Stocky quilted jacket under heavy canvas apron
  const coatY = topY + 8;
  g.shadedRect(cx - 5, coatY, 11, 12, coatMat);
  g.shadedRect(cx - 4, coatY + 2, 9, 10, 'bone'); // Heavy canvas apron
  g.circle(cx + 3, coatY + 9, 2, 'brass', 3); // Ring of tools on belt

  // Thick safety goggles around neck
  g.rect(cx - 4, topY + 7, 9, 2, 'brass', 2);
  g.set(cx - 2, topY + 7, 'verdigris', 3);
  g.set(cx + 2, topY + 7, 'verdigris', 3);

  // Head & Dark Hair in tight bun with grey streak
  const headX = cx - 4;
  const headY = topY;
  g.shadedRect(headX, headY + 1, 8, 6, 'skin');
  if (dir !== 'up') {
    const eyeX = dir === 'down' ? headX + 2 : headX + 4;
    const eyeMat = isUltimateEyes ? 'verdigris' : 'coat';
    const eyeStep = isUltimateEyes ? 3 : 0;
    g.rect(eyeX, headY + 3, 2, 2, eyeMat, eyeStep);
    g.set(eyeX, headY + 3, 'bone', 3);
    if (dir === 'down') {
      g.rect(eyeX + 4, headY + 3, 2, 2, eyeMat, eyeStep);
      g.set(eyeX + 4, headY + 3, 'bone', 3);
    }
  }
  // Dark hair + tight bun at back + grey streak
  g.shadedRect(headX - 1, headY - 1, 9, 3, 'coat');
  g.circle(headX - 2, headY + 1, 3, 'coat', 1); // Tight bun
  g.line(headX, headY - 1, headX + 5, headY, 'bone', 3, 1); // Grey streak

  // Thick welding gloves with large horseshoe magnet bound to palm
  const armX = cx + (anim.startsWith('attack') && (frameIdx === 1 || frameIdx === 2) ? 6 : 3);
  const armY = topY + 10;
  g.shadedRect(armX, armY, 5, 4, 'bone'); // Thick welding glove
  // Horseshoe magnet bound to palm (red/steel U-shape with verdigris pole tips)
  g.rect(armX + 4, armY - 1, 4, 2, 'blood', 3);
  g.rect(armX + 4, armY + 3, 4, 2, 'blood', 3);
  g.rect(armX + 3, armY, 2, 4, 'steel', 2);
  g.set(armX + 8, armY - 1, 'verdigris', 3);
  g.set(armX + 8, armY + 4, 'verdigris', 3);

  return g;
}

export function bakePlayerSprites(equipped = {}, classId = 'sena', stage = 1, branch = null) {
  const animDefs = {
    idle: 4,
    run: 6,
    attack1: 4,
    attack2: 4,
    attack3: 4,
    hurt: 2,
    death: 5,
    dodge: 6,
  };

  const accentColor =
    classId === 'rook'
      ? PALETTE.brass
      : classId === 'ines'
      ? PALETTE.verdigris
      : PALETTE.signal;

  const directions = ['right', 'left', 'down', 'up'];
  const sheets = {};

  for (const [anim, count] of Object.entries(animDefs)) {
    sheets[anim] = {
      right: [],
      left: [],
      down: [],
      up: [],
      whiteRight: [],
      whiteLeft: [],
      silhouette: [],
      dither60Right: [],
      dither35Right: [],
      dither15Right: [],
      dither60Left: [],
      dither35Left: [],
      dither15Left: [],
    };

    for (let f = 0; f < count; f++) {
      for (const dir of directions) {
        const baseDir = dir === 'left' ? 'right' : dir;
        const mirrorX = dir === 'left';
        let grid;
        if (classId === 'rook') {
          grid = buildRookFrameGrid(anim, f, baseDir, equipped, false);
        } else if (classId === 'ines') {
          grid = buildInesFrameGrid(anim, f, baseDir, equipped, false);
        } else {
          grid = buildSenaFrameGrid(anim, f, baseDir, equipped, false);
        }

        // Composite Journeyman / Master promotion overlays over base frame
        applyPromotionOverlayToGrid(grid, classId, stage, branch, anim, f);

        sheets[anim][dir].push(
          grid.bakeToCanvas({ selectiveOutline: true, topLeftHighlight: true, mirrorX })
        );

        if (dir === 'right') {
          sheets[anim].whiteRight.push(
            grid.bakeToCanvas({ solidColor: PALETTE.bone, mirrorX: false })
          );
          sheets[anim].whiteLeft.push(
            grid.bakeToCanvas({ solidColor: PALETTE.bone, mirrorX: true })
          );
          sheets[anim].silhouette.push(
            grid.bakeToCanvas({ solidColor: '#000000', mirrorX: false })
          );
          sheets[anim].dither60Right.push(
            grid.bakeToCanvas({ solidColor: accentColor, ditherDensity: 0.6, mirrorX: false })
          );
          sheets[anim].dither35Right.push(
            grid.bakeToCanvas({ solidColor: accentColor, ditherDensity: 0.35, mirrorX: false })
          );
          sheets[anim].dither15Right.push(
            grid.bakeToCanvas({ solidColor: accentColor, ditherDensity: 0.15, mirrorX: false })
          );
          sheets[anim].dither60Left.push(
            grid.bakeToCanvas({ solidColor: accentColor, ditherDensity: 0.6, mirrorX: true })
          );
          sheets[anim].dither35Left.push(
            grid.bakeToCanvas({ solidColor: accentColor, ditherDensity: 0.35, mirrorX: true })
          );
          sheets[anim].dither15Left.push(
            grid.bakeToCanvas({ solidColor: accentColor, ditherDensity: 0.15, mirrorX: true })
          );
        }
      }
    }
  }

  return sheets;
}

/**
 * ENEMY SPRITE PIPELINE
 * Every enemy is built from world junk, has an unmistakable silhouette,
 * an animated tell, and breaks into its own junk debris parts.
 */
export function buildEnemyFrameGrid(id, frameIdx = 0, isTell = false) {
  switch (id) {
    case 'tinRat': {
      // 28x22 canvas: Rat with a soup can fused over its back like a shell.
      // Lid flaps on a hinge at the front when running; red pinprick eyes.
      const g = new PixelGrid(28, 22);
      const scurry = frameIdx % 2;
      const twitchY = isTell ? (frameIdx % 2 === 0 ? -1 : 1) : 0;
      // Long rat tail trailing left
      g.line(2, 15 + scurry, 8, 15, 'rust', 2, 1);
      // Cylindrical soup can shell fused over back
      g.shadedRect(8, 8 + twitchY, 11, 8, 'steel');
      g.rect(10, 9 + twitchY, 6, 5, 'rust', 2); // Soup label band
      // Hinged soup can lid flapping up/down at x=19
      const lidAngleY = isTell ? -5 : scurry === 0 ? -4 : -1;
      g.line(18, 8 + twitchY, 21, 8 + lidAngleY + twitchY, 'steel', 3, 2);
      // Pointed rat snout & red pinprick eye
      g.shadedRect(18, 11 + twitchY, 6, 5, 'coat');
      g.set(22, 12 + twitchY, 'blood', 3); // Red pinprick eye
      // Little clawed feet
      g.rect(9 + scurry * 2, 16, 3, 3, 'skin', 1);
      g.rect(16 - scurry * 2, 16, 3, 3, 'skin', 1);
      return g;
    }

    case 'dustDog': {
      // 32x26 canvas: Starved hound, ribs showing, rag collar with a dead person's welding goggles
      // hanging from it. Head carried low, loping gait. Pale bone fur, rust stains.
      const g = new PixelGrid(32, 26);
      const stride = [-2, 0, 2, 0][frameIdx % 4];
      const lowHeadY = isTell ? 13 : 11;
      // Arched starved spine & gaunt hindquarters
      g.shadedRect(6, 9, 14, 7, 'bone');
      // Visible dark ribs on flank
      g.line(9, 10, 9, 14, 'coat', 1, 1);
      g.line(12, 10, 12, 14, 'coat', 1, 1);
      g.line(15, 10, 15, 14, 'coat', 1, 1);
      // Rust stains on haunch
      g.rect(7, 10, 3, 3, 'rust', 2);
      // Rag collar + dangling welding goggles under neck
      g.rect(18, 10, 3, 6, 'rust', 2);
      g.rect(18, 16, 4, 3, 'brass', 3); // Hanging goggles
      g.set(19, 17, 'signal', 2);
      // Low-slung hound head & jaws
      g.shadedRect(20, lowHeadY, 8, 5, 'bone');
      g.set(25, lowHeadY + 1, 'blood', 3);
      // 4 loping legs
      g.line(8, 16, 7 + stride, 22, 'bone', 1, 2);
      g.line(12, 16, 12 - stride, 22, 'bone', 2, 2);
      g.line(17, 16, 18 + stride, 22, 'bone', 1, 2);
      g.line(20, 16, 21 - stride, 22, 'bone', 2, 2);
      // Thin tail
      g.line(6, 10, 2, 14, 'bone', 1, 1);
      return g;
    }

    case 'wireKite': {
      // 28x28 canvas: Drone built from a kite frame (two crossed sticks) with torn plastic sheet wings,
      // one camera-lens eye that glows blood red, and a long whipping wire tail.
      const g = new PixelGrid(28, 28);
      const bob = [-1, 0, 1, 0][frameIdx % 4];
      const cy = 11 + bob;
      // Torn plastic sheet diamond wings (asymmetric tattered right wing)
      g.line(6, cy, 15, cy - 6, 'bone', 2, 3);
      g.line(15, cy - 6, 23, cy + 1, 'bone', 2, 3);
      g.line(6, cy, 15, cy + 6, 'bone', 1, 2);
      g.line(15, cy + 6, 21, cy + 2, 'bone', 1, 2);
      // Two crossed wooden/metal kite sticks
      g.line(4, cy, 25, cy, 'rust', 3, 1);
      g.line(15, cy - 8, 15, cy + 8, 'rust', 3, 1);
      // Central camera-lens housing + glowing blood-red lens eye
      g.shadedRect(12, cy - 3, 6, 6, 'steel');
      g.rect(14, cy - 1, 3, 3, 'blood', 3);
      // Long whipping copper wire tail below
      const whip = [-2, 1, 2, -1][frameIdx % 4];
      g.line(14, cy + 6, 11 + whip, cy + 11, 'brass', 2, 1);
      g.line(11 + whip, cy + 11, 7 - whip, cy + 15, 'brass', 3, 1);
      return g;
    }

    case 'lyeLeech': {
      // 28x20 canvas: Fat, half-translucent yellow-green slug with a ring mouth of tiny teeth.
      // Moves by stretching and contracting (inchworm).
      const g = new PixelGrid(28, 20);
      const stretch = frameIdx % 3; // 0: bunched hump, 1: mid, 2: stretched flat
      if (stretch === 0) {
        g.shadedRect(7, 7, 13, 9, 'bog');
        g.rect(9, 5, 8, 4, 'bog', 3);
        g.rect(10, 8, 6, 4, 'brass', 2); // Translucent internal yellow-green core
      } else if (stretch === 1) {
        g.shadedRect(5, 9, 17, 7, 'bog');
        g.rect(9, 10, 9, 4, 'brass', 2);
      } else {
        g.shadedRect(3, 11, 21, 5, 'bog');
        g.rect(8, 12, 10, 3, 'brass', 2);
      }
      // Ring mouth of tiny bone teeth on front right
      const mx = stretch === 0 ? 19 : stretch === 1 ? 21 : 23;
      const my = stretch === 0 ? 10 : 11;
      g.rect(mx, my, 3, 5, 'coat', 0);
      g.set(mx, my, 'bone', 3);
      g.set(mx + 2, my + 1, 'bone', 3);
      g.set(mx, my + 4, 'bone', 3);
      g.set(mx + 2, my + 3, 'bone', 3);
      return g;
    }

    case 'sumpBat': {
      // 30x26 canvas: Wings made of torn hazmat plastic on bent umbrella ribs,
      // a swollen pale sac under its belly that pulses. Erratic flap on 3 frames.
      const g = new PixelGrid(30, 26);
      const flapY = [-6, 0, 5][frameIdx % 3];
      // Swollen pulsing pale sac under belly
      const sacR = frameIdx % 3 === 1 ? 5 : 4;
      g.circle(15, 16, sacR, 'bone', 3);
      g.rect(13, 15, 4, 3, 'brass', 3);
      // Bent steel umbrella ribs + hazmat yellow/bog plastic wings
      g.line(14, 12, 3, 12 + flapY, 'steel', 3, 1);
      g.line(16, 12, 27, 12 + flapY, 'steel', 3, 1);
      // Tattered hazmat wing webs
      g.line(4, 13 + flapY, 12, 15, 'brass', 2, 3);
      g.line(26, 13 + flapY, 18, 15, 'brass', 2, 3);
      // Asymmetric head & sensor eye
      g.shadedRect(13, 9, 5, 5, 'coat');
      g.set(16, 11, 'blood', 3);
      return g;
    }

    case 'cleaverHauler': {
      // ELITE (48x48): Hunched man-sized figure dragging a wheeled cart of scrap by a chain,
      // a butcher's cleaver welded in place of its right hand.
      const g = new PixelGrid(48, 48);
      const crouch = isTell ? 4 : frameIdx % 2;
      // Wheeled cart of scrap on left (x=2..16, y=24..40)
      g.shadedRect(3, 25, 13, 9, 'rust');
      g.rect(5, 22, 4, 4, 'steel', 2); // Scrap pile in cart
      g.rect(10, 21, 5, 5, 'brass', 1);
      g.circle(6, 36, 4, 'steel', 1); // Cart wheel
      g.set(6, 36, 'bone', 3);
      // Iron chain linking cart to hauler's left arm (drops slack on charge tell)
      if (!isTell) {
        g.line(16, 29, 24, 26, 'steel', 2, 2);
      } else {
        g.line(16, 34, 24, 36, 'steel', 1, 2);
      }
      // Hunched brute body (x=22..35, y=14+crouch..38)
      g.shadedRect(23, 30, 4, 9, 'coat'); // Left leg
      g.shadedRect(30, 30, 4, 9, 'coat'); // Right leg
      g.shadedRect(21, 15 + crouch, 14, 16, 'rust'); // Hunched torso
      g.shadedRect(27, 11 + crouch, 7, 6, 'steel'); // Welded iron mask head
      g.rect(31, 13 + crouch, 2, 2, 'blood', 3);
      // Welded giant Butcher's Cleaver in place of right hand
      if (isTell) {
        // Scraping cleaver along the ground throwing sparks!
        g.shadedRect(34, 26, 12, 11, 'steel');
        g.line(34, 36, 45, 36, 'bone', 3, 2);
        g.rect(44, 35, 3, 3, 'brass', 3); // Scrape sparks
      } else {
        g.shadedRect(35, 14 + crouch, 10, 14, 'steel');
        g.line(44, 14 + crouch, 44, 27 + crouch, 'bone', 3, 2);
        g.rect(37, 16 + crouch, 2, 2, 'coat', 0); // Cleaver hanging hole
      }
      return g;
    }

    case 'lyeStrider': {
      // ELITE (48x48): Tall, stilt-legged, built from bent pipes, a chemical tank on its back
      // with a cracked gauge. Its head is an upturned funnel.
      const g = new PixelGrid(48, 48);
      const step = frameIdx % 2 === 0 ? -3 : 3;
      // Tall bent-pipe stilt legs (y=22..44)
      g.line(18, 22, 13 + step, 33, 'steel', 2, 2);
      g.line(13 + step, 33, 15 + step, 44, 'steel', 3, 2);
      g.line(28, 22, 33 - step, 33, 'steel', 2, 2);
      g.line(33 - step, 33, 30 - step, 44, 'steel', 3, 2);
      // Chemical tank on back (x=13..28, y=8..23)
      g.shadedRect(13, 8, 15, 15, 'bog');
      // Cracked circular pressure gauge on tank
      g.circle(20, 15, 4, 'bone', 3);
      if (isTell) {
        // Gauge needle swings to red!
        g.line(20, 15, 23, 12, 'blood', 3, 2);
      } else {
        g.line(20, 15, 18, 12, 'coat', 0, 1);
      }
      // Funnel head on right (tips down during spit tell)
      const tipY = isTell ? 5 : 0;
      g.shadedRect(27, 12 + tipY, 6, 5, 'brass');
      g.line(33, 13 + tipY, 41, 10 + tipY * 2, 'brass', 3, 3);
      g.line(33, 16 + tipY, 41, 19 + tipY * 2, 'brass', 2, 3);
      if (isTell) {
        g.rect(41, 20, 3, 4, 'bog', 3); // Dripping lye acid
      }
      return g;
    }

    case 'flatsHarvester': {
      // ELITE (48x48): Half-human operator fused into the front of a small harvester blade drum.
      const g = new PixelGrid(48, 48);
      const revShift = isTell ? frameIdx % 3 : frameIdx % 2;
      // Heavy tracked chassis & engine housing on left
      g.shadedRect(6, 20, 18, 16, 'rust');
      g.shadedRect(5, 34, 22, 7, 'coat'); // Treads
      // Fused half-human operator torso & helmeted head wired into top
      g.shadedRect(16, 10, 9, 11, 'coat');
      g.shadedRect(18, 5, 7, 6, 'brass');
      g.rect(22, 7, 3, 2, 'blood', 3);
      // Rotary Harvester Blade Drum in front (x=24..44, y=16..38)
      g.circle(34, 27, 10, 'steel', 2);
      g.circle(34, 27, 5, 'rust', 2);
      // Jagged rotary teeth spinning around the drum
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2 + revShift * 0.7;
        const tx = 34 + Math.round(Math.cos(ang) * 11);
        const ty = 27 + Math.round(Math.sin(ang) * 11);
        g.rect(tx - 2, ty - 2, 4, 4, isTell ? 'blood' : 'bone', 3);
      }
      return g;
    }

    case 'theForeman': {
      // BOSS 1 (96x96): Excavator rig with a dead operator in a yellow hard hat in the cab,
      // articulated hydraulic arm on right, and chained wrecking ball on left.
      const g = new PixelGrid(96, 96);
      const rumble = frameIdx % 2;
      // Heavy caterpillar tracks at base
      g.shadedRect(18, 66, 56, 18, 'coat');
      for (let wx = 24; wx <= 64; wx += 12) {
        g.circle(wx, 75, 5, 'steel', 2);
      }
      // Excavator cab body
      g.shadedRect(22, 34 + rumble, 44, 33, 'brass');
      g.rect(26, 38 + rumble, 22, 18, 'coat', 0); // Cab window opening
      // Operator skull in yellow hard hat inside cab
      g.shadedRect(33, 44 + rumble, 8, 8, 'bone');
      g.rect(31, 41 + rumble, 12, 4, 'brass', 3); // Yellow hard hat
      g.set(38, 47 + rumble, 'blood', 3);
      // Left counterweight & swinging wrecking ball
      const swingX = isTell ? 6 : 12;
      g.line(22, 40, swingX, 62, 'steel', 2, 2);
      g.circle(swingX, 68, 9, 'steel', 1);
      // Right articulated hydraulic excavator boom arm + toothed bucket
      const armDrop = isTell ? 12 : 0;
      g.line(64, 44 + rumble, 78, 22 + armDrop, 'rust', 2, 6);
      g.line(78, 22 + armDrop, 88, 52 + armDrop, 'brass', 2, 5);
      g.shadedRect(80, 52 + armDrop, 14, 14, 'steel');
      // Bucket teeth
      g.rect(80, 66 + armDrop, 3, 5, 'bone', 3);
      g.rect(85, 66 + armDrop, 3, 5, 'bone', 3);
      g.rect(90, 66 + armDrop, 3, 5, 'bone', 3);
      return g;
    }

    case 'bigAxle': {
      // BOSS 2 (96x96): Armored highway truck cab dragging two chained trailer sections.
      // Headlights are its glaring eyes.
      const g = new PixelGrid(96, 96);
      const sway = frameIdx % 2 === 0 ? -2 : 2;
      // Trailer section 2 (rear left)
      g.shadedRect(4, 42 + sway, 20, 24, 'rust');
      g.circle(10, 68 + sway, 5, 'coat', 1);
      g.circle(20, 68 + sway, 5, 'coat', 1);
      // Chain 2
      g.line(24, 54 + sway, 32, 54 - sway, 'steel', 3, 2);
      // Trailer section 1 (mid)
      g.shadedRect(31, 38 - sway, 22, 28, 'steel');
      g.circle(37, 68 - sway, 5, 'coat', 1);
      g.circle(47, 68 - sway, 5, 'coat', 1);
      // Chain 1
      g.line(53, 52 - sway, 60, 52, 'steel', 3, 3);
      // Main Diesel Truck Cab (front right, x=58..90, y=26..72)
      g.shadedRect(58, 28, 30, 38, 'rust');
      g.shadedRect(62, 32, 16, 12, 'coat'); // Armored windshield slit
      // Twin smokestacks belching soot
      g.shadedRect(60, 14, 5, 16, 'steel');
      g.shadedRect(68, 12, 5, 18, 'steel');
      // Spiked cattle-catcher ram grill on front
      g.shadedRect(86, 36, 7, 28, 'steel');
      // Glaring Headlight Eyes
      g.rect(84, 40, 5, 6, isTell ? 'blood' : 'brass', 3);
      g.rect(84, 52, 5, 6, isTell ? 'blood' : 'brass', 3);
      // Heavy front wheels
      g.circle(66, 70, 7, 'coat', 1);
      g.circle(82, 70, 7, 'coat', 1);
      return g;
    }

    case 'motherSump': {
      // BOSS 3 (96x96): Heaving asymmetric mass of rusted chemical drums and tarp,
      // with a pulsing pale sac that sheds Lye Leeches.
      const g = new PixelGrid(96, 96);
      const heave = frameIdx % 2 === 0 ? 0 : 3;
      // Tarp mound & sludge base
      g.shadedRect(14, 54 + heave, 68, 26, 'bog');
      g.shadedRect(20, 34 + heave, 54, 28, 'coat');
      // Jutting rusted chemical 55-gallon drums fused at odd angles
      g.shadedRect(16, 38 + heave, 18, 24, 'rust');
      g.line(16, 46 + heave, 34, 46 + heave, 'brass', 2, 2);
      g.shadedRect(32, 20 + heave, 20, 26, 'rust');
      g.line(32, 28 + heave, 52, 28 + heave, 'brass', 2, 2);
      // Giant pulsing brood sac on the right side
      const sacRadius = isTell ? 19 : 16 + (frameIdx % 2);
      g.circle(64, 50 + heave, sacRadius, 'bone', 2);
      g.circle(66, 48 + heave, sacRadius - 5, 'brass', 3);
      // Leeches wriggling on the surface
      g.rect(58, 44 + heave, 8, 4, 'bog', 2);
      g.rect(64, 56 + heave, 9, 4, 'bog', 2);
      return g;
    }

    case 'theLongDry':
    default: {
      // BOSS 4 (96x96): Giant worm built from stacked iron pipe rings,
      // mouth ringed with rotary drill bits.
      const g = new PixelGrid(96, 96);
      const wave = frameIdx % 2 === 0 ? -3 : 3;
      // Coiled stacked pipe segments from tail (left) to maw (upper right)
      const segs = [
        { x: 16, y: 68, r: 10 },
        { x: 28, y: 62 + wave, r: 12 },
        { x: 42, y: 52 - wave, r: 14 },
        { x: 56, y: 40 + wave, r: 16 },
        { x: 70, y: 32, r: 18 },
      ];
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        g.circle(s.x, s.y, s.r, i % 2 === 0 ? 'rust' : 'steel', 2);
        // Riveted pipe flange collar
        g.line(s.x - 4, s.y - s.r, s.x + 4, s.y + s.r, 'brass', 2, 2);
      }
      // Gaping Maw at (74, 32) ringed with industrial drill bits
      g.circle(74, 32, 12, 'coat', 0);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + (frameIdx * 0.4);
        const bx = 74 + Math.round(Math.cos(a) * 14);
        const by = 32 + Math.round(Math.sin(a) * 14);
        g.rect(bx - 3, by - 3, 6, 6, isTell ? 'blood' : 'bone', 3);
      }
      return g;
    }
  }
}

/**
 * Pre-bakes all Enemy sprites (normal, tell, white hit flash, stunned signal rim, and black silhouette)
 * plus 8-angle Rail Spike projectile and enemy junk debris parts.
 */
class SpriteRegistry {
  constructor() {
    this.enemies = {};
    this.railSpikeAngles = [];
    this.rookBoltAngles = [];
    this.scrapVariantAngles = []; // 8 scrap variants x 8 angles
    this.debrisParts = {};
    this.cutInCanvas = null;
    this.cutInCanvases = {};
    this.initialized = false;
  }

  init() {
    if (this.initialized || typeof document === 'undefined') return;
    this.initialized = true;

    const enemyDefs = [
      { id: 'tinRat', tier: 'common', frames: 2 },
      { id: 'dustDog', tier: 'common', frames: 4 },
      { id: 'wireKite', tier: 'common', frames: 4 },
      { id: 'lyeLeech', tier: 'common', frames: 3 },
      { id: 'sumpBat', tier: 'common', frames: 3 },
      { id: 'cleaverHauler', tier: 'elite', frames: 2 },
      { id: 'lyeStrider', tier: 'elite', frames: 2 },
      { id: 'flatsHarvester', tier: 'elite', frames: 3 },
      { id: 'theForeman', tier: 'boss', frames: 2 },
      { id: 'bigAxle', tier: 'boss', frames: 2 },
      { id: 'motherSump', tier: 'boss', frames: 2 },
      { id: 'theLongDry', tier: 'boss', frames: 2 },
    ];

    for (const def of enemyDefs) {
      const entry = {
        right: [],
        left: [],
        elitePulseRight: [],
        elitePulseLeft: [],
        tellRight: [],
        tellLeft: [],
        stunRight: [],
        stunLeft: [],
        brassRimRight: [],
        brassRimLeft: [],
        whiteRight: [],
        whiteLeft: [],
        silhouette: [],
      };

      for (let f = 0; f < def.frames; f++) {
        const grid = buildEnemyFrameGrid(def.id, f, false);
        const tellGrid = buildEnemyFrameGrid(def.id, f, true);

        const baseRim = def.tier === 'elite' ? PALETTE.blood : null;
        const pulseRim = def.tier === 'elite' ? MATERIAL_RAMPS.blood[1] : null;

        entry.right.push(grid.bakeToCanvas({ rimColor: baseRim, mirrorX: false }));
        entry.left.push(grid.bakeToCanvas({ rimColor: baseRim, mirrorX: true }));

        entry.elitePulseRight.push(grid.bakeToCanvas({ rimColor: pulseRim, mirrorX: false }));
        entry.elitePulseLeft.push(grid.bakeToCanvas({ rimColor: pulseRim, mirrorX: true }));

        entry.tellRight.push(tellGrid.bakeToCanvas({ rimColor: baseRim, mirrorX: false }));
        entry.tellLeft.push(tellGrid.bakeToCanvas({ rimColor: baseRim, mirrorX: true }));

        entry.stunRight.push(grid.bakeToCanvas({ rimColor: PALETTE.signal, mirrorX: false }));
        entry.stunLeft.push(grid.bakeToCanvas({ rimColor: PALETTE.signal, mirrorX: true }));

        entry.brassRimRight.push(grid.bakeToCanvas({ rimColor: PALETTE.brass, mirrorX: false }));
        entry.brassRimLeft.push(grid.bakeToCanvas({ rimColor: PALETTE.brass, mirrorX: true }));

        entry.whiteRight.push(grid.bakeToCanvas({ solidColor: PALETTE.bone, mirrorX: false }));
        entry.whiteLeft.push(grid.bakeToCanvas({ solidColor: PALETTE.bone, mirrorX: true }));

        entry.silhouette.push(grid.bakeToCanvas({ solidColor: '#000000', mirrorX: false }));
      }

      this.enemies[def.id] = entry;
    }

    // Pre-render 8-angle Rail Spike (16x6 rail piece)
    const spikeGrid = new PixelGrid(16, 6);
    spikeGrid.shadedRect(0, 1, 13, 4, 'steel');
    spikeGrid.line(10, 1, 15, 2, 'signal', 3, 2);
    spikeGrid.line(2, 2, 12, 2, 'bone', 3, 1);
    this.railSpikeAngles = bake8AngleFrames(spikeGrid, { selectiveOutline: true });

    // Pre-render 8-angle Rook Springgun Bolt (14x5 brass-tipped rail bolt)
    const boltGrid = new PixelGrid(14, 5);
    boltGrid.shadedRect(0, 1, 10, 3, 'steel');
    boltGrid.rect(9, 1, 5, 3, 'brass', 3);
    boltGrid.set(13, 2, 'bone', 3);
    this.rookBoltAngles = bake8AngleFrames(boltGrid, { selectiveOutline: true });

    // Pre-render 8 Scrap Orbit variants at 12x12 with 8 angles each for Ines
    const scrapDrawers = [
      // 0: Hex Bolt
      (g) => {
        g.shadedRect(2, 4, 8, 4, 'steel');
        g.shadedRect(2, 3, 3, 6, 'brass');
      },
      // 1: Hubcap
      (g) => {
        g.circle(6, 6, 4, 'steel', 3);
        g.circle(6, 6, 2, 'verdigris', 3);
      },
      // 2: Toothed Gear
      (g) => {
        g.circle(6, 6, 4, 'brass', 2);
        g.rect(5, 1, 2, 10, 'brass', 3);
        g.rect(1, 5, 10, 2, 'brass', 3);
        g.set(6, 6, 'coat', 0);
      },
      // 3: Pipe End
      (g) => {
        g.shadedRect(2, 3, 8, 6, 'rust');
        g.shadedRect(8, 2, 2, 8, 'steel');
      },
      // 4: Copper Coil Ring
      (g) => {
        g.circle(6, 6, 4, 'rust', 3);
        g.set(6, 3, 'verdigris', 3);
      },
      // 5: Wrench Head
      (g) => {
        g.shadedRect(2, 5, 6, 3, 'steel');
        g.rect(7, 3, 3, 2, 'bone', 3);
        g.rect(7, 7, 3, 2, 'bone', 3);
      },
      // 6: Rivet Plate
      (g) => {
        g.shadedRect(2, 2, 8, 8, 'steel');
        g.set(4, 4, 'brass', 3);
        g.set(7, 7, 'brass', 3);
      },
      // 7: Magnetized Shard
      (g) => {
        g.line(2, 8, 9, 3, 'steel', 3, 3);
        g.set(9, 3, 'verdigris', 3);
      },
    ];
    this.scrapVariantAngles = scrapDrawers.map((fn) => {
      const sg = new PixelGrid(12, 12);
      fn(sg);
      return bake8AngleFrames(sg, { selectiveOutline: true });
    });

    // Pre-render 8-angle junk debris parts per enemy type
    const makeDebris = (drawFn) => {
      const dg = new PixelGrid(10, 10);
      drawFn(dg);
      return bake8AngleFrames(dg, { selectiveOutline: true });
    };

    this.debrisParts = {
      canLid: makeDebris((dg) => dg.circle(5, 5, 3, 'steel', 3)),
      goggles: makeDebris((dg) => {
        dg.rect(2, 3, 6, 3, 'brass', 3);
        dg.set(3, 4, 'signal', 3);
        dg.set(6, 4, 'signal', 3);
      }),
      wire: makeDebris((dg) => dg.line(1, 7, 8, 2, 'brass', 3, 2)),
      tarp: makeDebris((dg) => dg.shadedRect(2, 2, 6, 5, 'bog')),
      shardBone: makeDebris((dg) => dg.shadedRect(3, 3, 4, 3, 'bone')),
      shardRust: makeDebris((dg) => dg.shadedRect(2, 3, 5, 4, 'rust')),
    };

    this.boltAngles = this.rookBoltAngles;
    this.scrapVariants = this.scrapVariantAngles.map((arr) => arr[0]);

    // Pre-render 64x16 Ultimate Eye Cut-In Strips for Sena, Rook, and Ines
    this.cutInCanvases.sena = this._buildCutIn('sena');
    this.cutInCanvases.rook = this._buildCutIn('rook');
    this.cutInCanvases.ines = this._buildCutIn('ines');
    this.cutInCanvas = this.cutInCanvases.sena;

    // Cache base class sprite sheets for Character Select card animations
    this.baseClassSheets = {
      sena: bakePlayerSprites({}, 'sena', 1, null),
      rook: bakePlayerSprites({}, 'rook', 1, null),
      ines: bakePlayerSprites({}, 'ines', 1, null),
    };
  }

  getCutIn(classId = 'sena') {
    return this.cutInCanvases?.[classId] || this.cutInCanvas;
  }

  getScrapVariant(index = 0) {
    return this.scrapVariants?.[index % 8] || null;
  }

  _buildCutIn(classId) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 16;
    const cctx = c.getContext('2d');
    cctx.imageSmoothingEnabled = false;
    cctx.fillStyle = PALETTE.soot;
    cctx.fillRect(0, 0, 64, 16);

    if (classId === 'rook') {
      // Rook: Single eye behind the brass rangefinder monocle, brass flash
      cctx.fillStyle = MATERIAL_RAMPS.olive[2];
      cctx.fillRect(0, 0, 64, 4);
      cctx.fillStyle = MATERIAL_RAMPS.skin[2];
      cctx.fillRect(10, 4, 44, 10);
      // Brass monocle ring over left side (x=18..32)
      cctx.fillStyle = PALETTE.brass;
      cctx.fillRect(17, 3, 14, 11);
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(19, 5, 10, 7);
      cctx.fillStyle = PALETTE.brass;
      cctx.fillRect(21, 6, 6, 5);
      cctx.fillStyle = '#FFFFFF';
      cctx.fillRect(23, 7, 2, 2);
      // Crosshair tick lines inside monocle
      cctx.fillStyle = PALETTE.bone;
      cctx.fillRect(15, 8, 18, 1);
      // Right eye narrowed
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(39, 7, 9, 2);
      return c;
    }

    if (classId === 'ines') {
      // Ines: Eyes behind safety goggles, verdigris magnetic light
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(0, 0, 64, 16);
      cctx.fillStyle = MATERIAL_RAMPS.skin[2];
      cctx.fillRect(12, 3, 40, 11);
      // Heavy safety goggle frames
      cctx.fillStyle = MATERIAL_RAMPS.steel[2];
      cctx.fillRect(15, 4, 34, 9);
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(17, 5, 12, 7);
      cctx.fillRect(35, 5, 12, 7);
      // Verdigris glowing eyes inside goggles
      cctx.fillStyle = PALETTE.verdigris;
      cctx.fillRect(20, 6, 6, 5);
      cctx.fillRect(38, 6, 6, 5);
      cctx.fillStyle = '#FFFFFF';
      cctx.fillRect(21, 7, 2, 2);
      cctx.fillRect(39, 7, 2, 2);
      return c;
    }

    // Default Sena: Rust hair locks framing face + Signal cyan eyes
    cctx.fillStyle = PALETTE.rust;
    cctx.fillRect(0, 0, 64, 3);
    cctx.fillRect(4, 3, 10, 13);
    cctx.fillRect(52, 3, 12, 13);
    cctx.fillStyle = MATERIAL_RAMPS.skin[2];
    cctx.fillRect(14, 3, 38, 11);
    cctx.fillStyle = PALETTE.soot;
    cctx.fillRect(18, 5, 11, 2);
    cctx.fillRect(37, 5, 11, 2);
    cctx.fillStyle = PALETTE.bone;
    cctx.fillRect(19, 7, 9, 5);
    cctx.fillRect(38, 7, 9, 5);
    cctx.fillStyle = PALETTE.signal;
    cctx.fillRect(22, 7, 5, 5);
    cctx.fillRect(41, 7, 5, 5);
    cctx.fillStyle = '#FFFFFF';
    cctx.fillRect(23, 8, 2, 2);
    cctx.fillRect(42, 8, 2, 2);
    return c;
  }
}

export const spriteRegistry = new SpriteRegistry();

/**
 * 64x64 Anime Portrait Renderer for Sena, Rook, and Ines
 * Supports expressions: 'normal', 'hurt', 'determined', 'ultimate'
 * Plus Journeyman (stage 2) and Master (stage 3) branch visual details.
 */
export function drawCharacterPortrait(
  canvas,
  classId = 'sena',
  expression = 'normal',
  equipped = {},
  stage = 1,
  branch = null
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 64, 64);

  const g = new PixelGrid(64, 64);
  g.rect(0, 0, 64, 64, 'coat', 0);

  const headOffX = expression === 'hurt' ? -2 : 0;

  if (classId === 'rook') {
    // ROOK MATSUDA PORTRAIT
    g.shadedRect(10, 46, 44, 18, 'olive');
    // Bandolier of rail bolts across chest
    g.line(14, 47, 46, 62, 'bone', 2, 4);
    g.rect(20, 50, 4, 4, 'brass', 3);
    g.rect(28, 54, 4, 4, 'brass', 3);
    g.rect(36, 58, 4, 4, 'brass', 3);

    // Master Surveyor tripod on back OR Master Minelayer fused cans
    if (stage >= 3 && branch === 'longhand') {
      g.shadedRect(48, 12, 6, 36, 'brass');
    } else if (stage >= 3 && branch === 'wirehand') {
      g.shadedRect(14, 48, 8, 10, 'rust');
      g.shadedRect(42, 48, 8, 10, 'rust');
    }

    // Neck & Face
    g.shadedRect(20 + headOffX, 17, 24, 22, 'skin');
    // Tired half-smile or hurt grimace
    if (expression === 'hurt') {
      g.rect(28 + headOffX, 34, 8, 2, 'coat', 0);
    } else {
      g.line(27 + headOffX, 34, 35 + headOffX, 33, 'coat', 0, 1);
    }

    // Left eye: Salvaged rangefinder monocle with brass rim
    const monoSize = stage >= 3 && branch === 'longhand' ? 11 : 9;
    g.shadedRect(20 + headOffX, 22, monoSize, monoSize, 'brass');
    g.rect(
      22 + headOffX,
      24,
      monoSize - 4,
      monoSize - 4,
      expression === 'ultimate' ? 'brass' : 'signal',
      3
    );
    g.set(23 + headOffX, 25, 'bone', 3);

    // Right eye
    if (expression === 'hurt') {
      g.line(35 + headOffX, 25, 40 + headOffX, 27, 'coat', 0, 2);
    } else {
      g.rect(35 + headOffX, 25, 5, 4, expression === 'ultimate' ? 'brass' : 'coat', expression === 'ultimate' ? 3 : 0);
      g.set(36 + headOffX, 26, 'bone', 3);
    }

    // Tilted flat cap with cracked bike reflector sewn on brim
    g.shadedRect(14 + headOffX, 7, 36, 11, 'olive');
    g.shadedRect(18 + headOffX, 15, 30, 4, 'coat');
    g.shadedRect(38 + headOffX, 10, 7, 5, 'rust'); // Cracked bike reflector
    g.set(40 + headOffX, 12, 'brass', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0);
    return;
  }

  if (classId === 'ines') {
    // INES CALLOWAY PORTRAIT
    // Alternator coil frame behind shoulders with verdigris tips
    g.shadedRect(8, 18, 10, 32, 'steel');
    g.shadedRect(46, 18, 10, 32, 'steel');
    g.shadedRect(9, 14, 8, 6, 'verdigris');
    g.shadedRect(47, 14, 8, 6, 'verdigris');

    // Quilted jacket + Heavy canvas apron
    g.shadedRect(10, 46, 44, 18, 'steel');
    g.shadedRect(16, 48, 32, 16, 'bone');
    if (stage >= 3 && branch === 'slinger') {
      // Wrecker chain across shoulders
      g.line(12, 48, 52, 54, 'steel', 3, 3);
    } else if (stage >= 3 && branch === 'binder') {
      // Crane hoist hook
      g.shadedRect(45, 42, 7, 10, 'brass');
    }

    // Thick safety goggles around neck
    g.shadedRect(18, 38, 28, 7, 'brass');
    g.shadedRect(21, 39, 9, 5, 'verdigris');
    g.shadedRect(34, 39, 9, 5, 'verdigris');

    // Face
    g.shadedRect(19 + headOffX, 17, 26, 20, 'skin');
    if (expression === 'hurt') {
      g.line(23 + headOffX, 25, 28 + headOffX, 27, 'coat', 0, 2);
      g.line(35 + headOffX, 25, 40 + headOffX, 27, 'coat', 0, 2);
    } else {
      const eyeMat = expression === 'ultimate' ? 'verdigris' : 'coat';
      const eyeStep = expression === 'ultimate' ? 3 : 0;
      g.rect(23 + headOffX, 25, 5, 5, eyeMat, eyeStep);
      g.rect(24 + headOffX, 26, 2, 2, 'bone', 3);
      g.rect(36 + headOffX, 25, 5, 5, eyeMat, eyeStep);
      g.rect(37 + headOffX, 26, 2, 2, 'bone', 3);
    }
    g.rect(29 + headOffX, 33, 6, 1, 'coat', 0);

    // Dark hair pulled into tight bun with grey streak
    g.circle(32 + headOffX, 7, 7, 'coat', 1); // Top bun
    g.shadedRect(17 + headOffX, 9, 30, 9, 'coat');
    g.line(20 + headOffX, 10, 34 + headOffX, 14, 'bone', 3, 2); // Grey streak

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0);
    return;
  }

  // SENA IBUKI PORTRAIT
  const bodyMat =
    equipped.body === 'plateCoat'
      ? 'rust'
      : equipped.body === 'riotJacket'
      ? 'bog'
      : 'coat';
  g.shadedRect(10, 47, 44, 17, bodyMat);
  g.rect(13, 50, 7, 6, 'rust', 2);

  if (stage >= 2 && branch === 'anvil') {
    // Anvil welded shoulder pauldron
    g.shadedRect(8, 44, 14, 12, 'steel');
    if (stage >= 3) {
      // Girder riveted chest plate
      g.shadedRect(16, 48, 32, 16, 'steel');
    }
  } else if (stage >= 3 && branch === 'cutter') {
    // Flenser leather butcher's apron
    g.shadedRect(16, 48, 32, 16, 'rust');
  }

  // Railcut flange hilt behind right shoulder
  g.shadedRect(47, 12, 8, 36, 'steel');
  g.rect(48, 16, 6, 8, stage >= 2 && branch === 'cutter' ? 'blood' : 'bone', 2);

  // Bone scarf around neck + stenciled rust stripe
  g.shadedRect(14, 36, 36, 14, 'scarf');
  g.rect(18, 44, 28, 3, 'rust', 2);

  // Face
  g.shadedRect(19 + headOffX, 16, 26, 20, 'skin');

  if (expression === 'hurt') {
    g.line(22 + headOffX, 24, 28 + headOffX, 26, 'coat', 0, 2);
    g.line(28 + headOffX, 26, 22 + headOffX, 28, 'coat', 0, 2);
    g.line(41 + headOffX, 24, 35 + headOffX, 26, 'coat', 0, 2);
    g.line(35 + headOffX, 26, 41 + headOffX, 28, 'coat', 0, 2);
  } else {
    const eyeMat = expression === 'ultimate' ? 'signal' : 'coat';
    const eyeStep = expression === 'ultimate' ? 3 : 0;
    g.rect(23 + headOffX, 24, 5, 5, eyeMat, eyeStep);
    g.rect(24 + headOffX, 25, 2, 2, 'bone', 3);
    g.rect(36 + headOffX, 24, 5, 5, eyeMat, eyeStep);
    g.rect(37 + headOffX, 25, 2, 2, 'bone', 3);
  }

  g.rect(29 + headOffX, 32, 6, expression === 'hurt' ? 2 : 1, 'coat', 0);

  // Short uneven rust-red hair + paper clip
  g.shadedRect(15 + headOffX, 7, 34, 10, 'hair');
  g.shadedRect(14 + headOffX, 15, 5, 19, 'hair');
  g.rect(14 + headOffX, 23, 6, 2, 'steel', 3);

  // Cracked welding goggles pushed up on forehead
  g.shadedRect(17 + headOffX, 9, 30, 7, 'steel');
  g.shadedRect(20 + headOffX, 10, 10, 5, 'brass');
  g.shadedRect(34 + headOffX, 10, 10, 5, 'brass');
  g.line(22 + headOffX, 10, 27 + headOffX, 14, 'bone', 3, 1);

  const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
  ctx.drawImage(baked, 0, 0);
}

export function drawSenaPortrait(canvas, expression = 'normal', equipped = {}, classId = 'sena', stage = 1, branch = null) {
  drawCharacterPortrait(canvas, classId, expression, equipped, stage, branch);
}

/**
 * 96x96 Character Select Card Renderer
 * Shows the 64x64 portrait on the left/backdrop and a live 2x (96x96) animated character sprite
 * that plays idle normally and cycles idle + short attack when hovered.
 */
export function drawCharacterSelectCardArt(canvas, classId = 'sena', isHovered = false, tick = 0) {
  if (!canvas) return;
  spriteRegistry.init();
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PALETTE.soot;
  ctx.fillRect(0, 0, 96, 96);

  // Subtle industrial grid backing
  ctx.fillStyle = '#14181E';
  ctx.fillRect(4, 72, 88, 20);
  ctx.fillStyle = '#232830';
  ctx.fillRect(4, 72, 88, 1);

  const sheets = spriteRegistry.baseClassSheets?.[classId];
  if (!sheets) return;

  let animKey = 'idle';
  let frameIdx = tick % 4;
  if (isHovered) {
    const cycle = tick % 12;
    if (cycle < 4) {
      animKey = 'idle';
      frameIdx = cycle;
    } else if (cycle < 8) {
      animKey = 'attack1';
      frameIdx = cycle - 4;
    } else {
      animKey = 'attack2';
      frameIdx = cycle - 8;
    }
  }

  const frames = sheets[animKey]?.right || sheets.idle.right;
  const frameCanvas = frames[frameIdx % frames.length];
  if (frameCanvas) {
    // Draw 48x48 sprite at 2x integer scale (96x96)
    ctx.drawImage(frameCanvas, 0, 0, 48, 48, 0, 0, 96, 96);
  }
}

export function drawPixelText(ctx, text, x, y, color = PALETTE.bone, align = 'center') {
  ctx.save();
  ctx.font = 'bold 7px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const ix = Math.round(x);
  const iy = Math.round(y);
  ctx.fillStyle = PALETTE.soot;
  ctx.fillText(text, ix + 1, iy);
  ctx.fillText(text, ix - 1, iy);
  ctx.fillText(text, ix, iy + 1);
  ctx.fillText(text, ix, iy - 1);
  ctx.fillStyle = color;
  ctx.fillText(text, ix, iy);
  ctx.restore();
}

