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
 * UNIFIED 2-HEAD CHIBI PIXEL-ART BASE TEMPLATE (Modeled on /public/assets/aistudio/image_c95e226e.png)
 * Anatomy (48x48 grid, centered at cx=24, total height ~30px from topY=10 to topY+30=40):
 * - Head: 16x14px rounded chibi cranium (topY .. topY+13)
 * - Ears: 3x5px prominent side ears (topY+6 .. topY+10)
 * - Eyes: 3x4px vertical anime iris with dark plum upper lash + 1x2px white highlight + 2x1px cheek blush
 * - Torso: 10x10px compact chibi body (topY+14 .. topY+23)
 * - Arms: 3x7px slightly splayed stubby chibi arms (topY+14 .. topY+20)
 * - Legs: 4x6px stubby chibi legs with center separation (topY+24 .. topY+29)
 */
export function getChibiPoseOffsets(anim, frameIdx, dir) {
  let bobY = 0;
  let torsoLeanX = 0;
  let leftFootX = 0;
  let rightFootX = 0;
  let leftFootY = 0;
  let rightFootY = 0;

  if (anim === 'idle') {
    bobY = frameIdx === 1 || frameIdx === 2 ? 1 : 0;
  } else if (anim === 'run') {
    bobY = frameIdx % 3 === 1 ? -1 : frameIdx % 3 === 2 ? 1 : 0;
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
    if (frameIdx === 0) torsoLeanX = -1;
    else if (frameIdx === 1 || frameIdx === 2) {
      torsoLeanX = anim === 'attack3' ? 3 : 2;
    } else torsoLeanX = 1;
  }

  return { bobY, torsoLeanX, leftFootX, rightFootX, leftFootY, rightFootY };
}

export function drawChibiLowerAndTorsoBase(g, cx, topY, pose, opts = {}) {
  const {
    coatMat = 'coat',
    legsMat = 'steel',
    trimMat = 'brass',
    capeMat = null,
    anim = 'idle',
    frameIdx = 0,
    dir = 'right',
    isAttacking = false,
  } = opts;

  const { leftFootX, rightFootX, leftFootY, rightFootY } = pose;

  // Optional Dark Fantasy Back Cape / Cloak
  if (capeMat) {
    const capeSway = anim === 'run' ? -2 - (frameIdx % 2) : frameIdx % 2 === 0 ? 0 : -1;
    const capeX = dir === 'down' ? cx - 6 : cx - 7 + capeSway;
    g.shadedRect(capeX, topY + 13, 12, 14, capeMat);
    // Tattered gothic hem
    for (let hx = 0; hx < 12; hx += 3) {
      g.rect(capeX + hx, topY + 26, 2, 2, capeMat, 1);
    }
  }

  // Stubby Chibi Back Arm (left arm)
  const lArmX = dir === 'up' ? cx - 8 : cx - 7;
  const lArmY = topY + 14 + (anim === 'run' ? Math.round(rightFootY * 0.5) : 0);
  g.shadedRect(lArmX, lArmY, 3, 5, coatMat);
  g.rect(lArmX - 1, lArmY + 4, 3, 3, 'chibiSkin', 2); // Chibi hand

  // Stubby Chibi Legs (4x6px each, crisp center split at cx)
  const legY = topY + 23;
  // Left leg
  g.shadedRect(cx - 4 + leftFootX, legY + leftFootY, 4, 4, 'chibiSkin');
  g.shadedRect(cx - 4 + leftFootX, legY + 2 + leftFootY, 4, 5, legsMat);
  // Right leg
  g.shadedRect(cx + 1 + rightFootX, legY + rightFootY, 4, 4, 'chibiSkin');
  g.shadedRect(cx + 1 + rightFootX, legY + 2 + rightFootY, 4, 5, legsMat);

  // Compact Chibi Torso (10x10px, topY+13 .. topY+23)
  const torsoY = topY + 13;
  g.shadedRect(cx - 5, torsoY, 11, 10, coatMat);
  // Gothic belt & trim buckle
  g.rect(cx - 5, torsoY + 7, 11, 2, 'coat', 0);
  g.rect(cx - 1, torsoY + 7, 3, 2, trimMat, 3);

  // Stubby Chibi Front Arm (when not overridden by active weapon swing)
  if (!isAttacking) {
    const rArmX = cx + 5;
    const rArmY = topY + 14 + (anim === 'run' ? Math.round(leftFootY * 0.5) : 0);
    g.shadedRect(rArmX, rArmY, 3, 5, coatMat);
    g.rect(rArmX + 1, rArmY + 4, 3, 3, 'chibiSkin', 2);
  }
}

/**
 * Renders the 16x14px Chibi Head, 3x5px Side Ears, Cheek Blush, and 3x4px Anime Eyes
 * directly matching /public/assets/aistudio/image_c95e226e.png
 */
export function drawChibiHeadBase(g, cx, topY, dir, anim, frameIdx, opts = {}) {
  const {
    irisMat = 'chibiIrisPink',
    hairMat = 'hair',
    hairStyle = 'knight',
    isUltimateEyes = false,
  } = opts;

  const headX = (anim === 'hurt' ? cx - 1 : cx) - 8; // 16px wide: cx-8 .. cx+7
  const headY = topY; // 14px tall: topY .. topY+13

  // Back hair layer behind ears/neck
  if (hairStyle === 'necromancer' || hairStyle === 'soulbinder') {
    g.shadedRect(headX - 1, headY + 6, 18, 10, hairMat);
  } else {
    g.shadedRect(headX, headY + 5, 16, 8, hairMat);
  }

  // Prominent 3x5px Chibi Side Ears (y: headY+6 .. headY+10)
  // Left Ear
  g.rect(headX - 2, headY + 6, 3, 5, 'chibiSkin', 2);
  g.set(headX - 1, headY + 8, 'chibiBlush', 1); // Inner ear shadow
  // Right Ear
  g.rect(headX + 15, headY + 6, 3, 5, 'chibiSkin', 2);
  g.set(headX + 16, headY + 8, 'chibiBlush', 1);

  // Rounded 16x14px Chibi Cranium (warm cream-peach skin with rounded corners)
  g.shadedRect(headX + 2, headY, 12, 14, 'chibiSkin');
  g.shadedRect(headX + 1, headY + 1, 14, 12, 'chibiSkin');
  g.shadedRect(headX, headY + 2, 16, 9, 'chibiSkin');
  // Smooth bright forehead & cheek fill (matching image_c95e226e.png)
  g.rect(headX + 2, headY + 2, 12, 10, 'chibiSkin', 2);
  g.rect(headX + 3, headY + 2, 10, 4, 'chibiSkin', 3);
  // Warm chin shadow
  g.line(headX + 4, headY + 13, headX + 11, headY + 13, 'chibiSkin', 1, 1);

  // Facial Features (when not facing Away/Up)
  if (dir !== 'up') {
    const shiftX = dir === 'down' ? 0 : 1;
    const leftEyeX = headX + 3 + shiftX;
    const rightEyeX = headX + 10 + shiftX;
    const eyeY = headY + 6;
    const eyeBlink = anim === 'idle' && frameIdx === 3;

    // Soft 2x1px Cheek Blush right below outer eye corners
    g.rect(leftEyeX - 1, eyeY + 4, 2, 1, 'chibiBlush', 2);
    g.rect(rightEyeX + 2, eyeY + 4, 2, 1, 'chibiBlush', 2);

    if (eyeBlink || anim === 'hurt') {
      // Closed lash line
      g.rect(leftEyeX, eyeY + 2, 3, 1, 'chibiOutline', 1);
      g.rect(rightEyeX, eyeY + 2, 3, 1, 'chibiOutline', 1);
    } else {
      const activeIris = isUltimateEyes ? 'signal' : irisMat;
      // Left 3x4 Anime Eye
      g.rect(leftEyeX - 1, eyeY, 4, 1, 'chibiOutline', 0); // Thick upper lash
      g.rect(leftEyeX, eyeY + 1, 3, 3, activeIris, 2); // Vertical iris
      g.rect(leftEyeX + 1, eyeY + 1, 2, 2, activeIris, 1); // Deep upper iris tone
      g.rect(leftEyeX, eyeY + 1, 1, 2, 'chibiIrisPink', 3); // 1x2px vertical white highlight!
      g.set(leftEyeX + 1, eyeY + 3, activeIris, 3); // Lower iris glow

      // Right 3x4 Anime Eye
      g.rect(rightEyeX, eyeY, 4, 1, 'chibiOutline', 0); // Thick upper lash
      g.rect(rightEyeX, eyeY + 1, 3, 3, activeIris, 2); // Vertical iris
      g.rect(rightEyeX + 1, eyeY + 1, 2, 2, activeIris, 1);
      g.rect(rightEyeX, eyeY + 1, 1, 2, 'chibiIrisPink', 3); // 1x2px vertical white highlight!
      g.set(rightEyeX + 1, eyeY + 3, activeIris, 3);
    }

    // Subtle eyebrow arches above eyes
    g.line(leftEyeX, eyeY - 2, leftEyeX + 2, eyeY - 2, 'chibiOutline', 2, 1);
    g.line(rightEyeX, eyeY - 2, rightEyeX + 2, eyeY - 2, 'chibiOutline', 2, 1);
  } else {
    // Full back of hair when facing UP
    g.shadedRect(headX, headY + 1, 16, 12, hairMat);
  }

  return { headX, headY };
}

/**
 * 1. SENA IBUKI — ABYSSAL BLADE KNIGHT (2-Head Chibi Base + Obsidian Armor + Duskrend Greatsword)
 */
export function buildSenaFrameGrid(anim, frameIdx, dir = 'right', equipped = {}, isUltimateEyes = false) {
  const g = new PixelGrid(48, 48);

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

  if (anim === 'dodge') {
    const cx = 24;
    const cy = 26 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 9, coatMat, 1);
    const ang = (frameIdx / 6) * Math.PI * 2;
    const hx = cx + Math.round(Math.cos(ang) * 5);
    const hy = cy + Math.round(Math.sin(ang) * 5);
    g.rect(hx - 4, hy - 4, 7, 7, 'hair', 2);
    g.line(cx - 9, cy + 5, cx + 9, cy - 5, 'steel', 2, 2);
    g.set(cx + 9, cy - 5, 'signal', 3);
    return g;
  }

  if (anim === 'death') {
    // Planted Duskrend Greatsword + fallen chibi knight
    g.rect(32, 15, 4, 3, 'brass', 2);
    g.rect(33, 18, 3, 20, 'steel', 2);
    g.line(35, 18, 35, 37, 'signal', 3, 1);
    g.shadedRect(10, 32, 14, 8, coatMat);
    g.shadedRect(20, 28, 12, 11, 'chibiSkin');
    g.shadedRect(19, 27, 13, 6, 'hair');
    return g;
  }

  const pose = getChibiPoseOffsets(anim, frameIdx, dir);
  const cx = 23 + pose.torsoLeanX;
  const topY = 9 + pose.bobY;
  const isAttacking = anim === 'attack1' || anim === 'attack2' || anim === 'attack3';

  // Carried Duskrend Greatsword on back when not swinging
  if (!isAttacking) {
    const rx0 = cx - 10;
    const ry0 = topY + 25;
    const rx1 = cx + 11;
    const ry1 = topY + 5;
    g.rect(rx0 - 2, ry0 - 1, 4, 3, 'brass', 2); // Winged abyssal crossguard
    g.line(rx0 + 1, ry0 - 1, rx1, ry1, 'steel', 2, 3);
    const edgeStep = frameIdx % 4 === 2 ? 2 : 3;
    g.line(rx0 + 2, ry0, rx1 + 1, ry1 + 1, 'signal', edgeStep, 1); // Soulfire cyan rune edge
  }

  // Chibi Body, Splayed Limbs, Obsidian Breastplate & Frayed Abyssal Cape
  drawChibiLowerAndTorsoBase(g, cx, topY, pose, {
    coatMat,
    legsMat,
    trimMat: 'brass',
    capeMat: 'blood',
    anim,
    frameIdx,
    dir,
    isAttacking,
  });

  // Obsidian Knight Chest Pauldrons & Runed Collar
  g.shadedRect(cx - 6, topY + 13, 4, 4, 'steel');
  g.shadedRect(cx + 3, topY + 13, 4, 4, 'steel');
  g.rect(cx - 2, topY + 15, 5, 4, 'steel', 2);
  g.set(cx, topY + 16, 'signal', 3); // Glowing soul-rune on breastplate

  // Chibi Head + 3x4 Anime Eyes (Violet-Pink / Signal Cyan)
  const { headX, headY } = drawChibiHeadBase(g, cx, topY, dir, anim, frameIdx, {
    irisMat: 'chibiIrisPink',
    hairMat: 'hair',
    hairStyle: 'knight',
    isUltimateEyes,
  });

  // Sena's Crimson-Auburn Chibi Hair Bangs & Obsidian Circlet
  if (dir !== 'up') {
    g.shadedRect(headX + 1, headY - 1, 14, 4, 'hair');
    // Side hair locks framing chibi cheeks
    g.shadedRect(headX, headY + 2, 3, 8, 'hair');
    g.shadedRect(headX + 13, headY + 2, 3, 7, 'hair');
    // Center parted bangs
    g.rect(headX + 5, headY + 2, 2, 3, 'hair', 2);
    g.rect(headX + 9, headY + 2, 2, 3, 'hair', 2);
    // Dark Fantasy Winged Obsidian Circlet on brow
    g.rect(headX + 3, headY + 1, 10, 2, 'steel', 2);
    g.rect(headX + 7, headY, 2, 3, 'brass', 3);
    g.set(headX + 7, headY + 1, 'signal', 3);
  }

  // Active Duskrend Combo Swings
  if (isAttacking) {
    this_drawAttackBlade(g, anim, frameIdx, cx, topY + 4, coatMat);
  }

  return g;
}

function this_drawAttackBlade(g, anim, frameIdx, cx, topY, coatMat) {
  const rArmY = topY + 9;
  const edgeStep = frameIdx % 2 === 0 ? 3 : 2;

  if (anim === 'attack1') {
    if (frameIdx === 0) {
      g.rect(cx - 2, rArmY, 4, 3, 'brass', 3);
      g.line(cx - 3, rArmY, cx - 18, rArmY - 6, 'steel', 2, 3);
      g.line(cx - 3, rArmY - 1, cx - 18, rArmY - 7, 'signal', edgeStep, 1);
    } else if (frameIdx === 1) {
      g.rect(cx + 3, rArmY, 4, 3, 'brass', 3);
      g.rect(cx + 6, rArmY - 1, 20, 4, 'steel', 2);
      g.line(cx + 6, rArmY + 3, cx + 25, rArmY + 3, 'signal', 3, 1);
    } else if (frameIdx === 2) {
      for (let r = 8; r <= 23; r++) {
        for (let dy = -6; dy <= 5; dy++) {
          const mat = dy >= 4 ? 'signal' : dy >= 1 ? 'bone' : 'steel';
          g.set(cx + r, rArmY + dy, mat, dy >= 4 ? 3 : 2);
        }
      }
      g.rect(cx + 4, rArmY + 2, 21, 3, 'steel', 2);
      g.line(cx + 4, rArmY + 5, cx + 24, rArmY + 5, 'signal', 3, 1);
    } else {
      g.rect(cx + 2, rArmY + 2, 3, 3, 'brass', 2);
      g.line(cx + 4, rArmY + 3, cx + 19, rArmY + 10, 'steel', 2, 3);
      g.line(cx + 4, rArmY + 5, cx + 19, rArmY + 12, 'signal', edgeStep, 1);
    }
  } else if (anim === 'attack2') {
    if (frameIdx === 0) {
      g.rect(cx + 1, rArmY + 3, 3, 3, 'brass', 2);
      g.line(cx + 3, rArmY + 4, cx + 15, rArmY + 13, 'steel', 2, 3);
      g.line(cx + 4, rArmY + 3, cx + 16, rArmY + 12, 'signal', edgeStep, 1);
    } else if (frameIdx === 1) {
      g.rect(cx + 3, rArmY - 1, 4, 3, 'brass', 3);
      g.line(cx + 6, rArmY - 1, cx + 24, rArmY - 6, 'steel', 2, 3);
      g.line(cx + 6, rArmY - 3, cx + 24, rArmY - 8, 'signal', 3, 1);
    } else if (frameIdx === 2) {
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
    if (frameIdx === 0) {
      g.rect(cx, topY - 2, 3, 4, 'brass', 3);
      g.rect(cx - 1, topY - 11, 3, 10, 'steel', 2);
      g.line(cx + 2, topY - 11, cx + 2, topY - 2, 'signal', 3, 1);
    } else if (frameIdx === 1) {
      g.rect(cx + 1, topY - 3, 3, 4, 'brass', 3);
      g.rect(cx, topY - 11, 4, 9, 'steel', 3);
      g.line(cx + 4, topY - 11, cx + 4, topY - 3, 'signal', 3, 1);
    } else if (frameIdx === 2) {
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
  const topY = 9 + (anim === 'idle' && (frameIdx === 1 || frameIdx === 2) ? 1 : 0);

  if (classId === 'sena') {
    if (branch === 'cutter') {
      g.rect(cx - 10, topY + 21, 4, 3, 'blood', 3);
      g.line(cx + 8, topY + 7, cx + 14, topY + 2, 'signal', 3, 2);
      if (stage >= 3) {
        g.shadedRect(cx - 4, topY + 14, 8, 9, 'blood');
      }
    } else if (branch === 'anvil') {
      g.shadedRect(cx - 8, topY + 13, 5, 5, 'brass');
      if (stage >= 3) {
        g.shadedRect(cx - 5, topY + 14, 10, 8, 'steel');
        g.set(cx, topY + 16, 'brass', 3);
      }
    }
  } else if (classId === 'rook') {
    if (branch === 'longhand') {
      g.rect(cx + 12, topY + 16, 6, 2, 'brass', 3);
    } else if (branch === 'wirehand') {
      g.circle(cx - 5, topY + 21, 2, 'brass', 3);
    }
  } else if (classId === 'ines') {
    if (branch === 'binder') {
      g.rect(cx - 10, topY + 8, 4, 3, 'verdigris', 3);
    } else if (branch === 'slinger') {
      g.line(cx - 6, topY + 14, cx + 5, topY + 18, 'bone', 3, 2);
    }
  } else if (classId === 'kaelen') {
    if (branch === 'furnace') {
      g.rect(cx - 10, topY + 4, 3, 3, 'ember', 3);
    } else if (branch === 'alchemist') {
      g.rect(cx - 10, topY + 10, 3, 6, 'lye', 3);
    }
  } else if (classId === 'vespera') {
    if (branch === 'swarm') {
      g.set(cx - 9, topY + 6, 'volt', 3);
      g.set(cx + 9, topY + 6, 'volt', 3);
    } else if (branch === 'dynamo') {
      g.rect(cx - 3, topY - 3, 6, 2, 'volt', 3);
    }
  }

  return g;
}

/**
 * 2. ROOK MATSUDA — INQUISITOR MARKSMAN (2-Head Chibi Base + Witch-Hunter Cowl + Hexbane Arbalest)
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
    const cy = 26 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 9, coatMat, 2);
    g.rect(cx - 4, cy - 5, 7, 3, 'brass', 3);
    return g;
  }

  if (anim === 'death') {
    g.shadedRect(10, 32, 16, 7, coatMat);
    g.shadedRect(21, 28, 12, 10, 'chibiSkin');
    g.shadedRect(20, 26, 13, 5, 'olive');
    return g;
  }

  const pose = getChibiPoseOffsets(anim, frameIdx, dir);
  const cx = 23 + pose.torsoLeanX;
  const topY = 9 + pose.bobY;

  drawChibiLowerAndTorsoBase(g, cx, topY, pose, {
    coatMat,
    legsMat,
    trimMat: 'brass',
    capeMat: 'olive',
    anim,
    frameIdx,
    dir,
    isAttacking: true,
  });

  // Silver-Stake Bandolier across Inquisitor Coat
  g.line(cx - 4, topY + 14, cx + 4, topY + 21, 'bone', 2, 2);
  g.set(cx - 2, topY + 16, 'brass', 3);
  g.set(cx + 1, topY + 18, 'brass', 3);

  // Chibi Head + Amber-Gold Anime Eyes
  const { headX, headY } = drawChibiHeadBase(g, cx, topY, dir, anim, frameIdx, {
    irisMat: 'chibiIrisGold',
    hairMat: 'bone',
    hairStyle: 'inquisitor',
    isUltimateEyes,
  });

  // Ash-Silver Hair Bangs, Brass Eye Monocle & Witch-Hunter Cowl Brim
  if (dir !== 'up') {
    g.shadedRect(headX + 1, headY + 1, 14, 3, 'bone');
    g.rect(headX, headY + 3, 2, 6, 'bone', 2);
    // Inquisitor Brass Targeting Monocle over left eye
    const monoX = dir === 'down' ? headX + 2 : headX + 3;
    g.rect(monoX, headY + 5, 5, 1, 'brass', 3);
    g.set(monoX - 1, headY + 7, 'brass', 3);
  }
  // Pointed Witch-Hunter Hat / Cowl
  g.shadedRect(headX - 2, headY, 20, 3, 'olive');
  g.shadedRect(headX + 2, headY - 3, 12, 3, 'coat');
  g.rect(headX + 3, headY - 1, 10, 1, 'brass', 3); // Gold inquisitor hatband buckle

  // Hexbane Arbalest (Silver-Runed Crossbow held at chibi side)
  const gunX = cx + 4;
  const gunY = topY + 15;
  g.rect(gunX, gunY, 3, 3, 'chibiSkin', 2);
  g.shadedRect(gunX + 2, gunY - 1, 11, 4, 'steel');
  g.line(gunX + 11, gunY - 5, gunX + 13, gunY + 5, 'brass', 3, 2); // Runed crossbow prod
  if (anim === 'attack1' || anim === 'attack2' || anim === 'attack3') {
    if (frameIdx === 1 || frameIdx === 2) {
      g.rect(gunX + 14, gunY - 1, 6, 3, 'brass', 3);
      g.set(gunX + 20, gunY, 'bone', 3);
    }
  } else {
    g.line(gunX + 7, gunY, gunX + 15, gunY, 'bone', 3, 1);
  }

  return g;
}

/**
 * 3. INES CALLOWAY — OSSUARY NECROMANCER (2-Head Chibi Base + Bone-White Twin Locks + Gravelord Scepter)
 */
export function buildInesFrameGrid(anim, frameIdx, dir = 'right', equipped = {}, isUltimateEyes = false) {
  const g = new PixelGrid(48, 48);
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

  if (anim === 'dodge') {
    const cx = 24;
    const cy = 26 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 9, 'bone', 2);
    g.circle(cx, cy, 5, 'verdigris', 3);
    return g;
  }

  if (anim === 'death') {
    g.shadedRect(10, 32, 16, 7, 'coat');
    g.shadedRect(21, 28, 12, 10, 'chibiSkin');
    g.shadedRect(20, 26, 13, 6, 'bone');
    return g;
  }

  const pose = getChibiPoseOffsets(anim, frameIdx, dir);
  const cx = 23 + pose.torsoLeanX;
  const topY = 9 + pose.bobY;

  // Floating Bone Reliquary Censer on back with Soul-Verdigris Flame
  const packX = dir === 'down' ? cx + 6 : cx - 11;
  const packY = topY + 12;
  g.shadedRect(packX, packY, 5, 9, 'bone');
  g.rect(packX, packY - 2, 5, 3, 'verdigris', frameIdx % 2 === 0 ? 3 : 2);

  drawChibiLowerAndTorsoBase(g, cx, topY, pose, {
    coatMat,
    legsMat,
    trimMat: 'verdigris',
    capeMat: 'coat',
    anim,
    frameIdx,
    dir,
    isAttacking: true,
  });

  // Ossuary Bone Rib-Corset over Necromancer Robes
  g.rect(cx - 3, topY + 14, 7, 6, 'bone', 2);
  g.line(cx, topY + 14, cx, topY + 20, 'coat', 0, 1);

  // Chibi Head + Emerald-Verdigris Anime Eyes
  const { headX, headY } = drawChibiHeadBase(g, cx, topY, dir, anim, frameIdx, {
    irisMat: 'chibiIrisEmerald',
    hairMat: 'bone',
    hairStyle: 'necromancer',
    isUltimateEyes,
  });

  // Bone-White & Ebon Twin Locks + Skull Hairpins
  if (dir !== 'up') {
    g.shadedRect(headX + 1, headY - 1, 14, 4, 'coat');
    g.line(headX + 3, headY, headX + 12, headY + 1, 'bone', 3, 2); // White streak bangs
    g.shadedRect(headX - 1, headY + 2, 3, 9, 'bone');
    g.shadedRect(headX + 14, headY + 2, 3, 9, 'bone');
    // Mini skull hairpins on temples
    g.rect(headX + 1, headY + 2, 3, 3, 'bone', 3);
    g.rect(headX + 12, headY + 2, 3, 3, 'bone', 3);
    g.set(headX + 2, headY + 3, 'verdigris', 3);
  }

  // Gravelord Scepter (Bone-Crowned Necromancer Staff)
  const armX = cx + (anim.startsWith('attack') && (frameIdx === 1 || frameIdx === 2) ? 7 : 5);
  const armY = topY + 15;
  g.rect(armX, armY, 3, 3, 'chibiSkin', 2);
  g.line(armX + 3, armY + 6, armX + 5, armY - 6, 'bone', 2, 2); // Bone staff shaft
  g.circle(armX + 5, armY - 7, 3, 'bone', 3); // Skull scepter head
  g.circle(armX + 5, armY - 7, 2, 'verdigris', 3); // Soul-emerald core

  return g;
}

/**
 * 4. KAELEN VOS — HELLFIRE DRAGOON (2-Head Chibi Base + Dragon-Horn Circlet + Cinderlance)
 */
export function buildKaelenFrameGrid(anim, frameIdx, dir = 'right', equipped = {}, isUltimateEyes = false) {
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
    const cy = 26 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 9, 'rust', 2);
    g.circle(cx, cy, 5, 'ember', 3);
    return g;
  }

  if (anim === 'death') {
    g.shadedRect(10, 32, 16, 7, 'rust');
    g.shadedRect(21, 28, 12, 10, 'chibiSkin');
    g.shadedRect(20, 26, 13, 5, 'ember');
    return g;
  }

  const pose = getChibiPoseOffsets(anim, frameIdx, dir);
  const cx = 23 + pose.torsoLeanX;
  const topY = 9 + pose.bobY;

  // Twin Hellfire Vent Stacks on back
  const packX = dir === 'down' ? cx + 6 : cx - 11;
  const packY = topY + 11;
  g.shadedRect(packX, packY, 5, 10, 'brass');
  g.rect(packX + 1, packY - 2, 3, 3, 'ember', frameIdx % 2 === 0 ? 3 : 2);

  drawChibiLowerAndTorsoBase(g, cx, topY, pose, {
    coatMat,
    legsMat,
    trimMat: 'ember',
    capeMat: 'rust',
    anim,
    frameIdx,
    dir,
    isAttacking: true,
  });

  // Hellfire Core Crest on Chest
  g.circle(cx, topY + 17, 2, 'brass', 3);
  g.set(cx, topY + 17, 'ember', 3);

  // Chibi Head + Molten-Ember Anime Eyes
  const { headX, headY } = drawChibiHeadBase(g, cx, topY, dir, anim, frameIdx, {
    irisMat: 'chibiIrisEmber',
    hairMat: 'rust',
    hairStyle: 'dragoon',
    isUltimateEyes,
  });

  // Fiery Spiky Hair & Dragon-Horn Circlet
  if (dir !== 'up') {
    g.shadedRect(headX + 1, headY - 1, 14, 4, 'rust');
    g.rect(headX + 3, headY - 2, 10, 2, 'ember', 3); // Flame-tipped bangs
    g.shadedRect(headX, headY + 2, 2, 7, 'rust');
    g.shadedRect(headX + 14, headY + 2, 2, 7, 'rust');
  }
  // Curved Dragon Horns on brow
  g.line(headX + 2, headY + 1, headX - 1, headY - 3, 'brass', 3, 2);
  g.line(headX + 13, headY + 1, headX + 16, headY - 3, 'brass', 3, 2);
  g.rect(headX + 4, headY + 1, 8, 2, 'brass', 3);

  // Weapon: Cinderlance (Hellfire Dragon-Spear)
  const lanceY = topY + 16;
  if (anim === 'attack1' || anim === 'attack2') {
    g.shadedRect(cx + 3, lanceY - 1, 14, 4, 'steel');
    g.rect(cx + 12, lanceY - 2, 5, 5, 'brass', 3);
    if (frameIdx === 1 || frameIdx === 2) {
      for (let r = 15; r <= 24; r++) {
        const spread = Math.floor((r - 13) * 0.7);
        for (let dy = -spread; dy <= spread; dy++) {
          const mat = Math.abs(dy) >= spread - 1 ? 'ember' : 'brass';
          g.set(cx + r, lanceY + dy, mat, 3);
        }
      }
    } else {
      g.rect(cx + 17, lanceY - 1, 3, 3, 'ember', 3);
    }
  } else if (anim === 'attack3') {
    const thrustExt = frameIdx === 1 || frameIdx === 2 ? 7 : 0;
    g.shadedRect(cx + 3, lanceY - 1, 15 + thrustExt, 4, 'steel');
    g.line(cx + 15 + thrustExt, lanceY, cx + 23 + thrustExt, lanceY, 'ember', 3, 3);
  } else {
    g.line(cx - 1, lanceY + 3, cx + 16, lanceY - 4, 'steel', 2, 3);
    g.rect(cx + 12, lanceY - 4, 4, 3, 'brass', 3);
    g.rect(cx + 15, lanceY - 5, 3, 3, 'ember', frameIdx % 2 === 0 ? 3 : 2);
  }

  return g;
}

/**
 * 5. VESPERA LOCKE — ELDRITCH SOULBINDER (2-Head Chibi Base + Starlight Hair + Astral Halo & Whip)
 */
export function buildVesperaFrameGrid(anim, frameIdx, dir = 'right', equipped = {}, isUltimateEyes = false) {
  const g = new PixelGrid(48, 48);
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

  if (anim === 'dodge') {
    const cx = 24;
    const cy = 26 + (frameIdx % 2 === 0 ? -1 : 1);
    g.circle(cx, cy, 9, 'coat', 1);
    g.circle(cx, cy, 6, 'volt', 3);
    return g;
  }

  if (anim === 'death') {
    g.shadedRect(10, 32, 16, 7, coatMat);
    g.shadedRect(21, 28, 12, 10, 'chibiSkin');
    g.shadedRect(20, 26, 13, 6, 'bone');
    return g;
  }

  const pose = getChibiPoseOffsets(anim, frameIdx, dir);
  const cx = 23 + pose.torsoLeanX;
  const topY = 9 + pose.bobY;

  // Floating Eldritch Astral Halo Ring behind Chibi Shoulders
  const haloX = cx - 2;
  const haloY = topY + 9 + (frameIdx % 2 === 0 ? -1 : 0);
  g.circle(haloX, haloY, 8, 'brass', 2);
  g.circle(haloX, haloY, 6, 'coat', 0);
  g.set(haloX - 8, haloY, 'volt', 3);
  g.set(haloX + 8, haloY, 'volt', 3);
  g.set(haloX, haloY - 8, 'volt', 3);

  drawChibiLowerAndTorsoBase(g, cx, topY, pose, {
    coatMat,
    legsMat,
    trimMat: 'volt',
    capeMat: 'coat',
    anim,
    frameIdx,
    dir,
    isAttacking: true,
  });

  // Eldritch Runic Stole down front of robe
  g.line(cx - 2, topY + 14, cx - 2, topY + 22, 'volt', 3, 1);
  g.line(cx + 2, topY + 14, cx + 2, topY + 22, 'volt', 3, 1);

  // Chibi Head + Astral-Violet Anime Eyes
  const { headX, headY } = drawChibiHeadBase(g, cx, topY, dir, anim, frameIdx, {
    irisMat: 'chibiIrisViolet',
    hairMat: 'bone',
    hairStyle: 'soulbinder',
    isUltimateEyes,
  });

  // Starlight-Silver Hair Bangs & Eldritch Star Diadem
  if (dir !== 'up') {
    g.shadedRect(headX + 1, headY - 1, 14, 4, 'bone');
    g.shadedRect(headX - 1, headY + 2, 3, 9, 'bone');
    g.shadedRect(headX + 13, headY + 2, 4, 9, 'bone');
    // Eldritch Star Tiara on forehead
    g.rect(headX + 4, headY, 8, 2, 'brass', 3);
    g.rect(headX + 7, headY - 2, 2, 4, 'volt', 3);
  }

  // Weapon: Floating Astral Conduit Whip
  const armX = cx + 5;
  const armY = topY + 15;
  g.rect(armX, armY, 3, 3, 'chibiSkin', 2);
  if (anim === 'attack1' || anim === 'attack2' || anim === 'attack3') {
    const whipY = anim === 'attack2' ? armY - 5 : anim === 'attack3' ? armY + 2 : armY - 1;
    g.line(armX + 2, armY, armX + 12, whipY - 3, 'volt', 3, 2);
    g.line(armX + 12, whipY - 3, armX + 22, whipY + 2, 'volt', 3, 2);
    g.line(armX + 3, armY, armX + 21, whipY + 1, 'bone', 3, 1);
  } else {
    g.circle(armX + 4, armY + 1, 3, 'brass', 2);
    g.set(armX + 6, armY + (frameIdx % 2 === 0 ? -1 : 2), 'volt', 3);
  }

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
      : classId === 'kaelen'
      ? PALETTE.ember
      : classId === 'vespera'
      ? PALETTE.volt
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
        } else if (classId === 'kaelen') {
          grid = buildKaelenFrameGrid(anim, f, baseDir, equipped, false);
        } else if (classId === 'vespera') {
          grid = buildVesperaFrameGrid(anim, f, baseDir, equipped, false);
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

    case 'rivetTick': {
      // COMMON (24x20): Scrap-plated parasite with riveted carapace and spring-loaded hind legs
      const g = new PixelGrid(24, 20);
      const crouch = isTell ? 2 : frameIdx % 2;
      g.shadedRect(5, 7 + crouch, 13, 8, 'steel');
      g.rect(7, 8 + crouch, 3, 2, 'brass', 3); // Rivet studs
      g.rect(12, 8 + crouch, 3, 2, 'brass', 3);
      g.rect(16, 10 + crouch, 3, 3, isTell ? 'signal' : 'blood', 3); // Mandible / eye
      // 6 skittering legs
      g.line(6, 14, 4, 18, 'rust', 2, 1);
      g.line(11, 14, 11, 18, 'rust', 2, 1);
      g.line(16, 14, 18, 18, 'rust', 2, 1);
      return g;
    }

    case 'signalMite': {
      // COMMON (24x24): Fragile tripod scout carrying a copper dish and blinking signal antenna
      const g = new PixelGrid(24, 24);
      const pulse = frameIdx % 2;
      g.shadedRect(7, 10, 10, 7, 'coat');
      g.circle(12, 10, 4, 'brass', 2); // Copper dish
      // Antenna spire
      g.line(12, 9, 12, 2, 'steel', 3, 1);
      g.rect(10, 1, 5, 3, isTell || pulse === 1 ? 'signal' : 'brass', 3);
      // Tripod wire legs
      g.line(8, 16, 5, 22, 'steel', 2, 1);
      g.line(12, 16, 12, 22, 'steel', 2, 1);
      g.line(16, 16, 19, 22, 'steel', 2, 1);
      return g;
    }

    case 'siltMimic': {
      // COMMON (28x22): Hermit crab-like scrap lurker hiding under a dented oil drum lid
      const g = new PixelGrid(28, 22);
      const collapse = isTell ? 3 : frameIdx % 2;
      g.shadedRect(4, 6 + collapse, 18, 10, 'bog');
      g.shadedRect(6, 4 + collapse, 14, 5, 'rust'); // Dented drum lid shell
      // Hidden pincer & glaring eye underneath
      g.rect(19, 11 + collapse, 5, 4, 'steel', 3);
      g.set(18, 10 + collapse, isTell ? 'blood' : 'brass', 3);
      return g;
    }

    case 'cinderCrow': {
      // COMMON (28x26): Sheet-metal scavenger bird with glowing furnace belly and razor pinions
      const g = new PixelGrid(28, 26);
      const flap = frameIdx % 2 === 0 ? -4 : 4;
      g.shadedRect(9, 10, 10, 7, 'coat');
      g.rect(11, 12, 5, 3, isTell ? 'blood' : 'rust', 3); // Furnace ember belly
      g.line(10, 11, 3, 10 + flap, 'steel', 2, 2); // Left wing
      g.line(17, 11, 25, 10 + flap, 'steel', 3, 2); // Right wing
      g.rect(19, 10, 5, 3, 'bone', 3); // Iron beak
      g.set(17, 10, 'brass', 3);
      return g;
    }

    case 'plateMarshal': {
      // ELITE (48x48): Heavy commander carrying a towering riveted boiler-door riot shield & signal baton
      const g = new PixelGrid(48, 48);
      const march = frameIdx % 2;
      g.shadedRect(14, 14 + march, 16, 22, 'rust');
      g.shadedRect(17, 8 + march, 10, 7, 'steel');
      g.rect(22, 10 + march, 4, 2, 'signal', 3); // Visor slit
      // Towering frontal scrap shield on right side (x=30..41, y=10..42)
      g.shadedRect(30, 10, 10, 32, 'steel');
      g.shadedRect(32, 13, 6, 26, 'coat');
      g.rect(38, 14, 2, 24, isTell ? 'signal' : 'brass', 3);
      // Command baton raised on tell
      if (isTell) {
        g.line(18, 14, 10, 4, 'signal', 3, 3);
      }
      return g;
    }

    case 'switchbackDriver': {
      // ELITE (48x48): Twin-wheeled gyro-cycle raider with dual exhaust pipes and ramming prow
      const g = new PixelGrid(48, 48);
      const rev = frameIdx % 2;
      g.circle(14, 34, 8, 'coat', 1); // Rear wheel
      g.circle(34, 34, 8, 'coat', 1); // Front wheel
      g.shadedRect(12, 20 + rev, 24, 12, 'rust'); // Engine chassis
      g.shadedRect(18, 11 + rev, 10, 10, 'steel'); // Rider torso
      g.rect(36, 22, 8, 8, isTell ? 'blood' : 'brass', 3); // Ramming prow
      // Exhaust pipes
      g.line(12, 22, 4, 16, 'steel', 2, 3);
      if (isTell) {
        g.rect(2, 13, 5, 5, 'signal', 3);
      }
      return g;
    }

    case 'sumpCantor': {
      // ELITE (48x48): Hooded marsh figure carrying a swinging corroded iron dive-bell on a gantry pole
      const g = new PixelGrid(48, 48);
      const sway = frameIdx % 2 === 0 ? -2 : 2;
      g.shadedRect(14, 16, 14, 26, 'bog');
      g.shadedRect(16, 9, 10, 8, 'brass'); // Brass diving helmet head
      g.rect(20, 12, 4, 3, 'signal', 3);
      // Gantry pole & swinging bell on right
      g.line(26, 38, 28, 8, 'steel', 2, 2);
      g.line(28, 8, 38, 8, 'steel', 2, 2);
      g.shadedRect(33 + sway, 16, 10, 12, isTell ? 'brass' : 'rust');
      if (isTell) {
        g.circle(38 + sway, 22, 9, 'signal', 3);
      }
      return g;
    }

    case 'boreSentinel': {
      // ELITE (48x48): Vertical industrial rock-drill automaton with glowing cooling vents
      const g = new PixelGrid(48, 48);
      const spin = frameIdx % 2;
      g.shadedRect(14, 10, 20, 22, 'rust');
      g.shadedRect(16, 14, 16, 10, isTell ? 'blood' : 'brass'); // Vent core
      // Conical drill base
      g.shadedRect(16, 32, 16, 5, 'steel');
      g.shadedRect(19 + spin, 37, 10, 5, 'bone');
      g.rect(22, 42, 4, 4, 'steel', 3);
      return g;
    }

    case 'scrapRatKing':
    case 'bonepackAlpha':
    case 'wireCyclone':
    case 'brineMaw':
    case 'screechChoir':
    case 'rivetTitan':
    case 'relayColossus':
    case 'dredgeHusk':
    case 'blackwingFurnace': {
      // FUSION MID-BOSSES (64x64): Towering 10-unit amalgamated wasteland monstrosities
      const g = new PixelGrid(64, 64);
      const pulse = frameIdx % 2 === 0 ? -2 : 2;
      const primaryMat =
        id === 'brineMaw' || id === 'dredgeHusk'
          ? 'bog'
          : id === 'wireCyclone' || id === 'relayColossus'
          ? 'brass'
          : id === 'bonepackAlpha'
          ? 'bone'
          : 'rust';

      // Massive amalgamated chassis (x=12..52, y=14..54)
      g.shadedRect(14, 18 + pulse, 36, 32, primaryMat);
      g.shadedRect(10, 26 - pulse, 44, 20, 'steel');
      // Welded crown of 10 glowing eyes / sensors across the amalgam
      for (let i = 0; i < 5; i++) {
        const ex = 16 + i * 7;
        const ey = 22 + ((i % 2) * 5) + pulse;
        g.rect(ex, ey, 4, 4, isTell ? 'blood' : 'signal', 3);
      }
      // Heavy protruding weapon/maw on front right
      g.shadedRect(46, 24 + pulse, 14, 18, isTell ? 'blood' : 'brass');
      g.rect(54, 28 + pulse, 5, 10, 'bone', 3);
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
      // 9 Commons
      { id: 'tinRat', tier: 'common', frames: 2 },
      { id: 'dustDog', tier: 'common', frames: 4 },
      { id: 'wireKite', tier: 'common', frames: 4 },
      { id: 'lyeLeech', tier: 'common', frames: 3 },
      { id: 'sumpBat', tier: 'common', frames: 3 },
      { id: 'rivetTick', tier: 'common', frames: 2 },
      { id: 'signalMite', tier: 'common', frames: 2 },
      { id: 'siltMimic', tier: 'common', frames: 2 },
      { id: 'cinderCrow', tier: 'common', frames: 2 },
      // 7 Elites
      { id: 'cleaverHauler', tier: 'elite', frames: 2 },
      { id: 'lyeStrider', tier: 'elite', frames: 2 },
      { id: 'flatsHarvester', tier: 'elite', frames: 3 },
      { id: 'plateMarshal', tier: 'elite', frames: 2 },
      { id: 'switchbackDriver', tier: 'elite', frames: 2 },
      { id: 'sumpCantor', tier: 'elite', frames: 2 },
      { id: 'boreSentinel', tier: 'elite', frames: 2 },
      // 9 Fusion Mid-Bosses
      { id: 'scrapRatKing', tier: 'fusionBoss', frames: 2 },
      { id: 'bonepackAlpha', tier: 'fusionBoss', frames: 2 },
      { id: 'wireCyclone', tier: 'fusionBoss', frames: 2 },
      { id: 'brineMaw', tier: 'fusionBoss', frames: 2 },
      { id: 'screechChoir', tier: 'fusionBoss', frames: 2 },
      { id: 'rivetTitan', tier: 'fusionBoss', frames: 2 },
      { id: 'relayColossus', tier: 'fusionBoss', frames: 2 },
      { id: 'dredgeHusk', tier: 'fusionBoss', frames: 2 },
      { id: 'blackwingFurnace', tier: 'fusionBoss', frames: 2 },
      // 4 Primary Bosses
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

        const baseRim =
          def.tier === 'elite'
            ? PALETTE.blood
            : def.tier === 'fusionBoss'
            ? PALETTE.brass
            : null;
        const pulseRim =
          def.tier === 'elite'
            ? MATERIAL_RAMPS.blood[1]
            : def.tier === 'fusionBoss'
            ? PALETTE.signal
            : null;

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

    // Pre-render 64x16 Ultimate Eye Cut-In Strips for all 5 classes
    this.cutInCanvases.sena = this._buildCutIn('sena');
    this.cutInCanvases.rook = this._buildCutIn('rook');
    this.cutInCanvases.ines = this._buildCutIn('ines');
    this.cutInCanvases.kaelen = this._buildCutIn('kaelen');
    this.cutInCanvases.vespera = this._buildCutIn('vespera');
    this.cutInCanvas = this.cutInCanvases.sena;

    // Cache base class sprite sheets for Character Select card animations
    this.baseClassSheets = {
      sena: bakePlayerSprites({}, 'sena', 1, null),
      rook: bakePlayerSprites({}, 'rook', 1, null),
      ines: bakePlayerSprites({}, 'ines', 1, null),
      kaelen: bakePlayerSprites({}, 'kaelen', 1, null),
      vespera: bakePlayerSprites({}, 'vespera', 1, null),
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

    if (classId === 'kaelen') {
      // Kaelen: Slitted brass foundry helmet visor blazing with pressurized white-hot ember fire
      cctx.fillStyle = MATERIAL_RAMPS.brass[2];
      cctx.fillRect(6, 1, 52, 14);
      cctx.fillStyle = MATERIAL_RAMPS.steel[1];
      cctx.fillRect(10, 4, 44, 8);
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(12, 5, 40, 6);
      // Blazing ember visor slit + twin furnace glare points
      cctx.fillStyle = PALETTE.ember;
      cctx.fillRect(14, 6, 36, 4);
      cctx.fillStyle = PALETTE.brass;
      cctx.fillRect(18, 6, 10, 4);
      cctx.fillRect(36, 6, 10, 4);
      cctx.fillStyle = '#FFFFFF';
      cctx.fillRect(21, 7, 4, 2);
      cctx.fillRect(39, 7, 4, 2);
      return c;
    }

    if (classId === 'vespera') {
      // Vespera: Illuminated volt-green visor glasses with electric arc telemetry & white-blonde hair
      cctx.fillStyle = PALETTE.bone;
      cctx.fillRect(4, 0, 56, 4);
      cctx.fillStyle = MATERIAL_RAMPS.skin[2];
      cctx.fillRect(12, 4, 40, 11);
      // Sleek angular volt visor glasses
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(14, 4, 36, 8);
      cctx.fillStyle = PALETTE.volt;
      cctx.fillRect(16, 5, 14, 6);
      cctx.fillRect(34, 5, 14, 6);
      cctx.fillStyle = '#FFFFFF';
      cctx.fillRect(19, 6, 5, 3);
      cctx.fillRect(37, 6, 5, 3);
      return c;
    }

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
 * 64x64 Chibi Anime Portrait Renderer for Sena, Rook, Ines, Kaelen, and Vespera
 * Modeled on /public/assets/aistudio/image_c95e226e.png:
 * - Rounded chibi cranium, prominent side ears, soft cheek blush, vertical anime eyes with thick upper lash & 1x2px highlight
 */
function drawPortraitChibiFace(g, headOffX, irisMat, expression) {
  // Prominent Chibi Side Ears
  g.shadedRect(10 + headOffX, 24, 5, 10, 'chibiSkin');
  g.rect(12 + headOffX, 27, 2, 4, 'chibiBlush', 1);
  g.shadedRect(49 + headOffX, 24, 5, 10, 'chibiSkin');
  g.rect(50 + headOffX, 27, 2, 4, 'chibiBlush', 1);

  // Rounded Chibi Head & Neck
  g.shadedRect(27 + headOffX, 40, 10, 6, 'chibiSkin');
  g.shadedRect(16 + headOffX, 14, 32, 28, 'chibiSkin');
  g.shadedRect(14 + headOffX, 17, 36, 22, 'chibiSkin');
  g.rect(18 + headOffX, 17, 28, 22, 'chibiSkin', 2);
  g.rect(20 + headOffX, 16, 24, 7, 'chibiSkin', 3);

  // Cheek Blush
  g.rect(18 + headOffX, 33, 4, 2, 'chibiBlush', 2);
  g.rect(42 + headOffX, 33, 4, 2, 'chibiBlush', 2);

  if (expression === 'hurt') {
    g.line(21 + headOffX, 26, 27 + headOffX, 28, 'chibiOutline', 0, 2);
    g.line(27 + headOffX, 28, 21 + headOffX, 30, 'chibiOutline', 0, 2);
    g.line(43 + headOffX, 26, 37 + headOffX, 28, 'chibiOutline', 0, 2);
    g.line(37 + headOffX, 28, 43 + headOffX, 30, 'chibiOutline', 0, 2);
    g.rect(29 + headOffX, 36, 6, 2, 'chibiOutline', 0);
  } else {
    const activeIris = expression === 'ultimate' ? 'signal' : irisMat;
    // Left Vertical Chibi Anime Eye (6x8px scaled for 64x64 portrait)
    g.rect(20 + headOffX, 24, 8, 2, 'chibiOutline', 0); // Thick upper lash
    g.rect(21 + headOffX, 26, 6, 6, activeIris, 2);
    g.rect(23 + headOffX, 26, 4, 3, activeIris, 1);
    g.rect(21 + headOffX, 26, 2, 4, 'chibiIrisPink', 3); // Crisp vertical white highlight
    g.rect(23 + headOffX, 30, 3, 2, activeIris, 3);

    // Right Vertical Chibi Anime Eye
    g.rect(36 + headOffX, 24, 8, 2, 'chibiOutline', 0); // Thick upper lash
    g.rect(37 + headOffX, 26, 6, 6, activeIris, 2);
    g.rect(39 + headOffX, 26, 4, 3, activeIris, 1);
    g.rect(37 + headOffX, 26, 2, 4, 'chibiIrisPink', 3); // Crisp vertical white highlight
    g.rect(39 + headOffX, 30, 3, 2, activeIris, 3);

    // Eyebrows & mouth
    g.line(21 + headOffX, 21, 26 + headOffX, 21, 'chibiOutline', 1, 1);
    g.line(38 + headOffX, 21, 43 + headOffX, 21, 'chibiOutline', 1, 1);
    g.rect(30 + headOffX, 36, 4, 1, 'chibiOutline', 1);
  }
}

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
    // ROOK MATSUDA — INQUISITOR MARKSMAN CHIBI PORTRAIT
    g.shadedRect(12, 44, 40, 20, 'olive');
    g.line(16, 45, 46, 62, 'bone', 2, 4);
    g.rect(22, 49, 4, 4, 'brass', 3);
    g.rect(32, 54, 4, 4, 'brass', 3);
    drawPortraitChibiFace(g, headOffX, 'chibiIrisGold', expression);
    // Inquisitor Brass Targeting Monocle Rim over left eye
    g.rect(19 + headOffX, 23, 10, 1, 'brass', 3);
    g.rect(19 + headOffX, 32, 10, 1, 'brass', 3);
    // Ash-Silver Bangs & Pointed Witch-Hunter Hat
    g.shadedRect(15 + headOffX, 12, 34, 6, 'bone');
    g.shadedRect(10 + headOffX, 9, 44, 5, 'olive');
    g.shadedRect(18 + headOffX, 3, 28, 7, 'coat');
    g.rect(20 + headOffX, 8, 24, 2, 'brass', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0);
    return;
  }

  if (classId === 'ines') {
    // INES CALLOWAY — OSSUARY NECROMANCER CHIBI PORTRAIT
    g.shadedRect(8, 18, 8, 32, 'bone');
    g.shadedRect(48, 18, 8, 32, 'bone');
    g.shadedRect(9, 14, 6, 5, 'verdigris');
    g.shadedRect(49, 14, 6, 5, 'verdigris');
    g.shadedRect(12, 44, 40, 20, 'coat');
    g.shadedRect(20, 46, 24, 18, 'bone');
    drawPortraitChibiFace(g, headOffX, 'chibiIrisEmerald', expression);
    // Bone-White & Ebon Twin Locks + Skull Hairpins
    g.shadedRect(14 + headOffX, 9, 36, 8, 'coat');
    g.line(18 + headOffX, 11, 44 + headOffX, 14, 'bone', 3, 3);
    g.shadedRect(12 + headOffX, 16, 5, 24, 'bone');
    g.shadedRect(47 + headOffX, 16, 5, 24, 'bone');
    g.rect(15 + headOffX, 14, 5, 5, 'bone', 3);
    g.rect(44 + headOffX, 14, 5, 5, 'bone', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0);
    return;
  }

  if (classId === 'kaelen') {
    // KAELEN VOS — HELLFIRE DRAGOON CHIBI PORTRAIT
    g.shadedRect(8, 16, 9, 34, 'brass');
    g.shadedRect(47, 16, 9, 34, 'brass');
    g.rect(10, 12, 5, 4, 'ember', 3);
    g.rect(49, 12, 5, 4, 'ember', 3);
    g.shadedRect(12, 44, 40, 20, 'steel');
    g.shadedRect(18, 46, 28, 18, 'rust');
    g.circle(32, 54, 4, 'ember', 3);
    drawPortraitChibiFace(g, headOffX, 'chibiIrisEmber', expression);
    // Fiery Spiky Hair & Curved Dragon Horns
    g.shadedRect(14 + headOffX, 9, 36, 8, 'rust');
    g.rect(20 + headOffX, 7, 24, 4, 'ember', 3);
    g.line(16 + headOffX, 13, 8 + headOffX, 4, 'brass', 3, 3);
    g.line(48 + headOffX, 13, 56 + headOffX, 4, 'brass', 3, 3);
    g.rect(22 + headOffX, 13, 20, 3, 'brass', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0);
    return;
  }

  if (classId === 'vespera') {
    // VESPERA LOCKE — ELDRITCH SOULBINDER CHIBI PORTRAIT
    g.circle(32, 28, 25, 'brass', 2);
    g.circle(32, 28, 21, 'coat', 0);
    g.rect(30, 3, 4, 4, 'volt', 3);
    g.rect(7, 26, 4, 4, 'volt', 3);
    g.rect(53, 26, 4, 4, 'volt', 3);
    g.shadedRect(12, 44, 40, 20, 'coat');
    g.line(22, 44, 22, 62, 'volt', 3, 2);
    g.line(42, 44, 42, 62, 'volt', 3, 2);
    drawPortraitChibiFace(g, headOffX, 'chibiIrisViolet', expression);
    // Starlight-Silver Hair & Eldritch Star Diadem
    g.shadedRect(14 + headOffX, 9, 36, 8, 'bone');
    g.shadedRect(12 + headOffX, 15, 5, 24, 'bone');
    g.shadedRect(46 + headOffX, 15, 6, 24, 'bone');
    g.rect(24 + headOffX, 11, 16, 3, 'brass', 3);
    g.rect(30 + headOffX, 7, 4, 8, 'volt', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0);
    return;
  }

  // SENA IBUKI — ABYSSAL BLADE KNIGHT CHIBI PORTRAIT
  const bodyMat =
    equipped.body === 'plateCoat'
      ? 'rust'
      : equipped.body === 'riotJacket'
      ? 'bog'
      : 'coat';
  g.shadedRect(12, 44, 40, 20, bodyMat);
  g.shadedRect(10, 43, 12, 10, 'steel');
  g.shadedRect(42, 43, 12, 10, 'steel');
  // Duskrend Greatsword Hilt behind right shoulder
  g.shadedRect(48, 12, 7, 34, 'steel');
  g.rect(49, 16, 5, 6, 'signal', 3);
  drawPortraitChibiFace(g, headOffX, 'chibiIrisPink', expression);
  // Crimson-Auburn Hair Locks & Winged Obsidian Circlet
  g.shadedRect(14 + headOffX, 9, 36, 8, 'hair');
  g.shadedRect(12 + headOffX, 16, 5, 22, 'hair');
  g.shadedRect(47 + headOffX, 16, 5, 22, 'hair');
  g.rect(20 + headOffX, 12, 24, 3, 'steel', 2);
  g.rect(30 + headOffX, 9, 4, 6, 'brass', 3);
  g.set(31 + headOffX, 11, 'signal', 3);

  const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
  ctx.drawImage(baked, 0, 0);
}

export function drawSenaPortrait(canvas, expression = 'normal', equipped = {}, classId = 'sena', stage = 1, branch = null) {
  drawCharacterPortrait(canvas, classId, expression, equipped, stage, branch);
}

const _chibiNpcCache = {};

/**
 * Renders any Duskhollow Town Master, Wandering Merchant, or Cleansed-Territory Pilgrim
 * using the exact 2-Head Chibi Pixel-Art Base (image_c95e226e.png).
 */
export function getChibiNpcCanvas(npcRole = 'forge', frameIdx = 0) {
  const key = `${npcRole}_${frameIdx % 2}`;
  if (_chibiNpcCache[key]) return _chibiNpcCache[key];

  const g = new PixelGrid(48, 48);
  const pose = getChibiPoseOffsets('idle', frameIdx % 2 === 0 ? 0 : 1, 'down');
  const cx = 24;
  const topY = 9 + pose.bobY;

  const roleMap = {
    forge: { coatMat: 'rust', legsMat: 'steel', trimMat: 'brass', capeMat: 'coat', irisMat: 'chibiIrisEmber', hairMat: 'rust', hat: 'horns' },
    apothecary: { coatMat: 'bog', legsMat: 'coat', trimMat: 'verdigris', capeMat: 'bog', irisMat: 'chibiIrisEmerald', hairMat: 'bone', hat: 'hood' },
    guild: { coatMat: 'coat', legsMat: 'steel', trimMat: 'brass', capeMat: 'blood', irisMat: 'chibiIrisGold', hairMat: 'bone', hat: 'crown' },
    sanctum: { coatMat: 'coat', legsMat: 'steel', trimMat: 'volt', capeMat: 'coat', irisMat: 'chibiIrisViolet', hairMat: 'bone', hat: 'tiara' },
    tavern: { coatMat: 'rust', legsMat: 'coat', trimMat: 'brass', capeMat: null, irisMat: 'chibiIrisPink', hairMat: 'hair', hat: 'band' },
    gambler: { coatMat: 'olive', legsMat: 'coat', trimMat: 'volt', capeMat: 'coat', irisMat: 'chibiIrisViolet', hairMat: 'coat', hat: 'cowl' },
    merchant: { coatMat: 'olive', legsMat: 'brass', trimMat: 'brass', capeMat: 'rust', irisMat: 'chibiIrisGold', hairMat: 'bone', hat: 'cowl' },
    pilgrim: { coatMat: 'steel', legsMat: 'steel', trimMat: 'signal', capeMat: 'bone', irisMat: 'chibiIrisPink', hairMat: 'bone', hat: 'crown' },
  };
  const cfg = roleMap[npcRole] || roleMap.guild;

  drawChibiLowerAndTorsoBase(g, cx, topY, pose, {
    coatMat: cfg.coatMat,
    legsMat: cfg.legsMat,
    trimMat: cfg.trimMat,
    capeMat: cfg.capeMat,
    anim: 'idle',
    frameIdx: frameIdx % 2,
    dir: 'down',
    isAttacking: false,
  });

  const { headX, headY } = drawChibiHeadBase(g, cx, topY, 'down', 'idle', 0, {
    irisMat: cfg.irisMat,
    hairMat: cfg.hairMat,
    hairStyle: 'knight',
    isUltimateEyes: false,
  });

  // Hair bangs & NPC headgear
  g.shadedRect(headX + 1, headY - 1, 14, 4, cfg.hairMat);
  g.shadedRect(headX, headY + 2, 2, 7, cfg.hairMat);
  g.shadedRect(headX + 14, headY + 2, 2, 7, cfg.hairMat);
  if (cfg.hat === 'crown') {
    g.rect(headX + 3, headY - 2, 10, 3, 'brass', 3);
    g.set(headX + 7, headY - 3, 'signal', 3);
  } else if (cfg.hat === 'cowl' || cfg.hat === 'hood') {
    g.shadedRect(headX - 1, headY - 2, 18, 4, cfg.coatMat);
    g.rect(headX + 4, headY, 8, 1, 'brass', 3);
  } else if (cfg.hat === 'tiara') {
    g.rect(headX + 4, headY, 8, 2, 'volt', 3);
  }

  const canvas = g.bakeToCanvas({ selectiveOutline: true, topLeftHighlight: true });
  _chibiNpcCache[key] = canvas;
  return canvas;
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

