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
import { assets } from './AssetLoader.js';

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

function extractDitherCanvas(baseCanvas, color, density) {
  if (!baseCanvas) return null;
  const c = document.createElement('canvas');
  c.width = baseCanvas.width;
  c.height = baseCanvas.height;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(baseCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const data = imgData.data;
  const hex = (color || '#00F0FF').replace('#', '');
  const cr = parseInt(hex.slice(0, 2), 16) || 0;
  const cg = parseInt(hex.slice(2, 4), 16) || 240;
  const cb = parseInt(hex.slice(4, 6), 16) || 255;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const idx = (y * c.width + x) * 4;
      if (data[idx + 3] < 20) {
        data[idx + 3] = 0;
        continue;
      }
      const bayer = ((x & 1) * 2 + (y & 1)) / 4;
      if (bayer < density) {
        data[idx] = cr;
        data[idx + 1] = cg;
        data[idx + 2] = cb;
        data[idx + 3] = 255;
      } else {
        data[idx + 3] = 0;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

function getManifestPlayerFrame(classId, anim, f, dir) {
  if (!assets.loaded) return null;
  const mirrorX = dir === 'left';
  const dirSuffix = dir === 'up' ? 'up' : dir === 'down' ? 'down' : 'side';

  let stripId = null;
  let frameIndex = f;
  if (anim === 'idle') {
    stripId = `${classId}_idle_${dirSuffix}`;
    frameIndex = f % 2;
  } else if (anim === 'run') {
    stripId = `${classId}_run_${dirSuffix}`;
    frameIndex = f % 6;
  } else if (anim === 'attack1' || anim === 'attack2' || anim === 'attack3') {
    stripId = `${classId}_${anim}_${dirSuffix}`;
    frameIndex = Math.min(2, f);
  } else if (anim === 'hurt') {
    stripId = `${classId}_hurt_${dirSuffix}`;
    frameIndex = 0;
  } else if (anim === 'dodge') {
    stripId = `${classId}_dodge_side`;
    frameIndex = Math.min(3, f);
  } else if (anim === 'death') {
    stripId = `${classId}_death_side`;
    frameIndex = Math.min(3, f);
  }

  if (stripId) {
    const c = assets.getFrameCanvas(stripId, frameIndex, mirrorX);
    if (c) return c;
  }

  // Fallback to <classId>_sheet (384x128: row 0 = idle, row 1 = run) for idle & run states
  if (anim === 'idle' || anim === 'run') {
    const sheetId = `${classId}_sheet`;
    const row = anim === 'idle' ? 0 : 1;
    const col = anim === 'idle' ? f % 4 : f % 6;
    const sheetFrame = assets.getGridFrameCanvas(sheetId, col, row, 64, 64, mirrorX);
    if (sheetFrame) return sheetFrame;
  }

  return null;
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
        const manifestCanvas = getManifestPlayerFrame(classId, anim, f, dir);

        if (manifestCanvas) {
          sheets[anim][dir].push(manifestCanvas);
          if (dir === 'right') {
            const leftCanvas = getManifestPlayerFrame(classId, anim, f, 'left') || manifestCanvas;
            const makeSolid = (srcCanvas, color) => {
              const sc = document.createElement('canvas');
              sc.width = srcCanvas.width;
              sc.height = srcCanvas.height;
              const sctx = sc.getContext('2d');
              sctx.imageSmoothingEnabled = false;
              sctx.drawImage(srcCanvas, 0, 0);
              sctx.globalCompositeOperation = 'source-in';
              sctx.fillStyle = color;
              sctx.fillRect(0, 0, sc.width, sc.height);
              sctx.globalCompositeOperation = 'source-over';
              return sc;
            };
            sheets[anim].whiteRight.push(makeSolid(manifestCanvas, PALETTE.bone));
            sheets[anim].whiteLeft.push(makeSolid(leftCanvas, PALETTE.bone));
            sheets[anim].silhouette.push(makeSolid(manifestCanvas, '#000000'));
            sheets[anim].dither60Right.push(extractDitherCanvas(manifestCanvas, accentColor, 0.6));
            sheets[anim].dither35Right.push(extractDitherCanvas(manifestCanvas, accentColor, 0.35));
            sheets[anim].dither15Right.push(extractDitherCanvas(manifestCanvas, accentColor, 0.15));
            sheets[anim].dither60Left.push(extractDitherCanvas(leftCanvas, accentColor, 0.6));
            sheets[anim].dither35Left.push(extractDitherCanvas(leftCanvas, accentColor, 0.35));
            sheets[anim].dither15Left.push(extractDitherCanvas(leftCanvas, accentColor, 0.15));
          }
          continue;
        }

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
      // Shackled Crypt-Rat: feral plague-rat bound in a spiked wrought-iron torture gibbet collar & chain
      const g = new PixelGrid(28, 22);
      const scurry = frameIdx % 2;
      const twitchY = isTell ? (frameIdx % 2 === 0 ? -1 : 1) : 0;
      g.line(2, 15 + scurry, 8, 15, 'skin', 1, 1); // rat tail
      g.shadedRect(7, 9 + twitchY, 11, 7, 'coat'); // mange-furred rat body
      g.line(9, 8 + twitchY, 15, 8 + twitchY, 'bone', 3, 1); // exposed dorsal spine
      // Spiked wrought-iron torture gibbet collar & trailing chain
      g.shadedRect(14, 7 + twitchY, 4, 9, 'rust');
      g.rect(15, 5 + twitchY, 2, 2, 'steel', 3); // dorsal iron spike
      g.line(14, 16 + twitchY, 8, 19, 'steel', 2, 1); // dragging shackle chain
      // Snarling skull-snout & crimson eye
      g.shadedRect(18, 10 + twitchY, 6, 5, 'bone');
      g.set(22, 11 + twitchY, isTell ? 'brass' : 'blood', 3);
      g.rect(9 + scurry * 2, 16, 3, 3, 'bone', 2);
      g.rect(16 - scurry * 2, 16, 3, 3, 'bone', 2);
      return g;
    }

    case 'dustDog': {
      // Flayed Grave-Hound: undead skeletal necro-hound with exposed ribcage & spiked executioner collar
      const g = new PixelGrid(32, 26);
      const stride = [-2, 0, 2, 0][frameIdx % 4];
      const lowHeadY = isTell ? 13 : 11;
      g.shadedRect(6, 9, 14, 7, 'rust'); // flayed muscle torso
      g.line(9, 9, 9, 15, 'bone', 3, 1); // exposed white ribs
      g.line(12, 9, 12, 15, 'bone', 3, 1);
      g.line(15, 9, 15, 15, 'bone', 3, 1);
      // Spiked dark-iron executioner collar & chain
      g.shadedRect(18, 9, 3, 7, 'steel');
      g.set(19, 7, 'brass', 3);
      g.line(19, 16, 16, 20, 'steel', 2, 1);
      // Canine skull head & blazing crimson eye
      g.shadedRect(20, lowHeadY, 8, 5, 'bone');
      g.set(25, lowHeadY + 1, isTell ? 'brass' : 'blood', 3);
      g.line(8, 16, 7 + stride, 22, 'bone', 2, 2);
      g.line(12, 16, 12 - stride, 22, 'bone', 2, 2);
      g.line(17, 16, 18 + stride, 22, 'bone', 2, 2);
      g.line(20, 16, 21 - stride, 22, 'bone', 2, 2);
      g.line(6, 10, 2, 14, 'bone', 2, 1);
      return g;
    }

    case 'wireKite': {
      // Stone Gargoyle Imp: winged gothic cathedral gargoyle with demon oculus & spiked penance chain
      const g = new PixelGrid(28, 28);
      const bob = [-1, 0, 1, 0][frameIdx % 4];
      const cy = 11 + bob;
      // Leathery ribbed gargoyle bat wings
      g.line(4, cy - 3, 13, cy, 'steel', 2, 3);
      g.line(15, cy, 24, cy - 3, 'steel', 2, 3);
      // Horned gargoyle head & glowing crimson demon oculus
      g.shadedRect(11, cy - 4, 7, 7, 'steel');
      g.line(11, cy - 4, 8, cy - 8, 'bone', 3, 1);
      g.line(17, cy - 4, 20, cy - 8, 'bone', 3, 1);
      g.rect(13, cy - 2, 3, 3, isTell ? 'brass' : 'blood', 3);
      // Whipping iron penance chain tail
      const whip = [-2, 1, 2, -1][frameIdx % 4];
      g.line(14, cy + 4, 11 + whip, cy + 12, 'steel', 2, 1);
      g.rect(10 + whip, cy + 12, 3, 3, 'rust', 3);
      return g;
    }

    case 'lyeLeech': {
      // Bloated Blood-Leech: translucent venom-green mire parasite with circular lamprey maw
      const g = new PixelGrid(28, 20);
      const stretch = frameIdx % 3;
      if (stretch === 0) {
        g.shadedRect(7, 7, 13, 9, 'bog');
        g.rect(10, 8, 6, 4, 'lye', 3);
      } else if (stretch === 1) {
        g.shadedRect(5, 9, 17, 7, 'bog');
        g.rect(9, 10, 9, 4, 'lye', 3);
      } else {
        g.shadedRect(3, 11, 21, 5, 'bog');
        g.rect(8, 12, 10, 3, 'lye', 3);
      }
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
      // Vampiric Crypt-Bat: nosferatu strigoi bat with clawed wing-thumbs & glowing venom sac
      const g = new PixelGrid(30, 26);
      const flapY = [-6, 0, 5][frameIdx % 3];
      const sacR = frameIdx % 3 === 1 ? 5 : 4;
      g.circle(15, 16, sacR, 'lye', 3);
      g.line(14, 12, 3, 12 + flapY, 'rust', 2, 2);
      g.line(16, 12, 27, 12 + flapY, 'rust', 2, 2);
      g.line(4, 13 + flapY, 12, 15, 'bog', 2, 3);
      g.line(26, 13 + flapY, 18, 15, 'bog', 2, 3);
      g.shadedRect(13, 8, 5, 5, 'coat');
      g.set(16, 10, 'blood', 3);
      return g;
    }

    case 'cleaverHauler': {
      // Chained Crypt-Executioner Brute dragging a spiked Iron-Maiden Coffin Reliquary (NO WHEELS)
      const g = new PixelGrid(48, 48);
      const crouch = isTell ? 4 : frameIdx % 2;
      // Spiked Iron-Maiden Coffin Reliquary dragged behind (no wheels)
      g.shadedRect(3, 18, 12, 22, 'steel');
      g.shadedRect(5, 20, 8, 18, 'rust');
      g.rect(7, 23, 4, 4, 'bone', 3); // skull relief on coffin
      g.line(15, 29, 23, 27, 'brass', 2, 2); // heavy chain
      // Towering hunched executioner brute in crimson leather & horned iron mask
      g.shadedRect(23, 30, 4, 9, 'coat');
      g.shadedRect(30, 30, 4, 9, 'coat');
      g.shadedRect(21, 15 + crouch, 14, 16, 'rust');
      g.shadedRect(27, 10 + crouch, 7, 6, 'steel');
      g.line(27, 10 + crouch, 24, 6 + crouch, 'bone', 3, 2); // horn
      g.line(33, 10 + crouch, 36, 6 + crouch, 'bone', 3, 2);
      g.rect(31, 12 + crouch, 2, 2, 'blood', 3);
      // Colossal Guillotine Butcher's Cleaver
      if (isTell) {
        g.shadedRect(34, 26, 12, 11, 'steel');
        g.line(34, 36, 45, 36, 'bone', 3, 2);
        g.rect(44, 35, 3, 3, 'brass', 3);
      } else {
        g.shadedRect(35, 14 + crouch, 10, 14, 'steel');
        g.line(44, 14 + crouch, 44, 27 + crouch, 'bone', 3, 2);
      }
      return g;
    }

    case 'lyeStrider': {
      // Stilted Plague-Alchemist Cenobite on bound bone stilts with glowing Bile-Alembic Censer & beak mask
      const g = new PixelGrid(48, 48);
      const step = frameIdx % 2 === 0 ? -3 : 3;
      g.line(18, 22, 13 + step, 33, 'bone', 2, 2);
      g.line(13 + step, 33, 15 + step, 44, 'bone', 3, 2);
      g.line(28, 22, 33 - step, 33, 'bone', 2, 2);
      g.line(33 - step, 33, 30 - step, 44, 'bone', 3, 2);
      // Glowing glass Bile-Alembic Censer on back
      g.shadedRect(13, 9, 13, 14, 'bog');
      g.circle(19, 16, 4, isTell ? 'brass' : 'lye', 3);
      // Robed torso & curved plague-doctor skull beak mask
      const tipY = isTell ? 4 : 0;
      g.shadedRect(25, 11 + tipY, 8, 9, 'bone');
      g.line(33, 14 + tipY, 42, 17 + tipY, 'bone', 2, 3);
      g.set(30, 13 + tipY, 'blood', 3);
      return g;
    }

    case 'flatsHarvester': {
      // Bone-Scythe Reaver Wraith: four-armed horned skeletal reaper on skittering bone-centipede legs (NO TREADS/DRUM)
      const g = new PixelGrid(48, 48);
      const spin = isTell ? frameIdx % 3 : frameIdx % 2;
      // Articulated bone-centipede lower body & skittering legs
      g.shadedRect(10, 26, 26, 10, 'steel');
      for (let lx = 12; lx <= 34; lx += 7) {
        g.line(lx, 35, lx - 2 + (spin % 2) * 3, 44, 'bone', 3, 2);
      }
      // Horned skeletal wraith-lord upper torso in crimson mantle
      g.shadedRect(18, 12, 12, 15, 'rust');
      g.shadedRect(20, 5, 8, 7, 'bone');
      g.rect(20, 3, 8, 2, 'brass', 3); // crown
      g.rect(25, 7, 2, 2, 'blood', 3);
      // Four whirling blood-stained crescent war-scythes
      const bladeMat = isTell ? 'brass' : 'blood';
      g.line(28, 16, 42, 8 + spin * 3, 'bone', 3, 2);
      g.line(38, 6 + spin * 3, 44, 18 + spin * 2, bladeMat, 3, 3);
      g.line(28, 22, 43, 28 - spin * 2, 'bone', 3, 2);
      g.line(39, 24 - spin * 2, 44, 36 - spin * 2, bladeMat, 3, 3);
      return g;
    }

    case 'theForeman': {
      // BOSS 1 (96x96): High Executioner Malgorth — Undead Ossuary Bone-Colossus & Cathedral Executioner Lord (NO EXCAVATOR)
      const g = new PixelGrid(96, 96);
      const bob = frameIdx % 2;
      // Two massive armored obsidian-and-bone pillar legs with clawed sabatons
      g.shadedRect(22, 60, 18, 26, 'steel');
      g.shadedRect(56, 60, 18, 26, 'steel');
      g.shadedRect(18, 80, 24, 8, 'bone');
      g.shadedRect(54, 80, 24, 8, 'bone');
      g.shadedRect(40, 62, 16, 20, 'rust'); // crimson inquisitor banner-fauld
      // Gargantuan Ossuary Reliquary Torso & Bleached Titan Ribcage
      g.shadedRect(20, 26 + bob, 56, 36, 'steel');
      g.shadedRect(28, 30 + bob, 40, 26, isTell ? 'signal' : 'rust');
      for (let ry = 32; ry <= 52; ry += 7) {
        g.line(22, ry + bob, 42, ry + 2 + bob, 'bone', 3, 3);
        g.line(54, ry + 2 + bob, 74, ry + bob, 'bone', 3, 3);
      }
      // Crowned Horned Skull Head of High Executioner Malgorth
      g.shadedRect(38, 12 + bob, 20, 15, 'bone');
      g.rect(36, 7 + bob, 24, 5, 'brass', 3); // jagged gold crown
      g.rect(42, 17 + bob, 4, 4, 'blood', 3);
      g.rect(51, 17 + bob, 4, 4, 'blood', 3);
      // Left Chained Spiked Iron-Maiden Censer Flail
      const swingX = isTell ? 6 : 12;
      g.line(20, 34, swingX, 58, 'brass', 3, 2);
      g.circle(swingX, 66, 9, 'steel', 2);
      g.circle(swingX, 66, 4, 'blood', 3);
      // Right Colossal Rune-Carved Cathedral Guillotine Greataxe
      const axeDrop = isTell ? 12 : 0;
      g.line(74, 34 + bob, 86, 18 + axeDrop, 'steel', 3, 4);
      g.shadedRect(76, 22 + axeDrop, 16, 24, 'steel');
      g.rect(89, 22 + axeDrop, 3, 24, isTell ? 'signal' : 'bone', 3);
      return g;
    }

    case 'bigAxle': {
      // BOSS 2 (96x96): Dread Cavalier Varkos — Six-Legged Skeletal Nightmare Centaur-Archfiend (ZERO WHEELS / ZERO TRUCK)
      const g = new PixelGrid(96, 96);
      const sway = frameIdx % 2 === 0 ? -2 : 2;
      // 6 Articulated Skeletal Nightmare Warhorse Legs with Blazing Hellfire Cloven Hooves (NO WHEELS)
      const legXs = [14, 26, 38, 52, 66, 78];
      for (let i = 0; i < legXs.length; i++) {
        const lx = legXs[i];
        const stepX = (i % 2 === 0 ? sway : -sway) * 2;
        g.line(lx, 56, lx + stepX, 78, 'bone', 3, 3);
        g.rect(lx + stepX - 3, 76, 6, 5, isTell ? 'blood' : 'ember', 3); // blazing cloven hoof
      }
      // Skeletal Nightmare Centaur Body in Spiked Black-Iron & Crimson Cataphract Barding
      g.shadedRect(12, 38 + sway, 68, 22, 'steel');
      g.shadedRect(16, 40 + sway, 58, 16, 'rust');
      for (let rx = 20; rx <= 64; rx += 11) {
        g.line(rx, 38 + sway, rx - 2, 56 + sway, 'bone', 3, 2); // exposed rib-arches
      }
      // Horned Demon-Skull Breast-Ram at Centaur Prow (front right)
      g.shadedRect(74, 38, 14, 18, 'bone');
      g.line(82, 38, 93, 30, 'bone', 3, 3); // prow horn
      g.line(82, 54, 93, 60, 'bone', 3, 3);
      g.rect(82, 44, 4, 4, isTell ? 'blood' : 'brass', 3);
      // Varkos's Towering Horned Death-Knight Sovereign Torso & Exposed Hellfire Soul-Heart
      g.shadedRect(48, 16, 24, 24, 'steel');
      g.shadedRect(30, 18, 18, 12, 'rust'); // flowing crimson war-cape
      g.circle(62, 28, isTell ? 6 : 4, isTell ? 'blood' : 'ember', 3); // Hellfire Soul-Heart
      // Winged-Horn Death-Knight Greathelm & Dread-Halberd
      g.shadedRect(52, 6, 14, 11, 'steel');
      g.line(52, 8, 42, 1, 'bone', 3, 2);
      g.line(66, 8, 76, 1, 'bone', 3, 2);
      g.rect(60, 10, 5, 2, 'blood', 3);
      g.line(44, 24, 92, 22, 'bone', 3, 3); // couched Dread-Halberd
      g.shadedRect(82, 16, 10, 12, isTell ? 'blood' : 'brass');
      return g;
    }

    case 'motherSump': {
      // BOSS 3 (96x96): Bog-Matriarch Hagra — Eldritch Swamp Hag-Queen & Leech-Brood Mother (NO DRUMS)
      const g = new PixelGrid(96, 96);
      const heave = frameIdx % 2 === 0 ? 0 : 3;
      g.shadedRect(12, 60 + heave, 72, 20, 'bog'); // bubbling mire pool
      // Colossal pulsing translucent Bile-Green Brood-Sac Abdomen
      const sacRadius = isTell ? 22 : 19 + (frameIdx % 2);
      g.circle(58, 48 + heave, sacRadius, 'lye', 2);
      g.circle(60, 46 + heave, sacRadius - 6, isTell ? 'blood' : 'brass', 3);
      // Antler-Crowned Swamp Hag-Queen Upper Torso & Stag-Skull Mask
      g.shadedRect(20, 28 + heave, 24, 32, 'bog');
      g.shadedRect(24, 16 + heave, 16, 13, 'bone'); // stag-skull crone mask
      g.line(24, 16 + heave, 12, 4 + heave, 'bone', 3, 3); // left bone antler
      g.line(40, 16 + heave, 52, 4 + heave, 'bone', 3, 3); // right bone antler
      g.rect(28, 21 + heave, 3, 3, 'lye', 3);
      g.rect(35, 21 + heave, 3, 3, 'lye', 3);
      return g;
    }

    case 'rivetTick': {
      // Skull-Carapace Bone-Spider
      const g = new PixelGrid(24, 20);
      const crouch = isTell ? 2 : frameIdx % 2;
      g.shadedRect(5, 6 + crouch, 13, 8, 'bone');
      g.rect(15, 9 + crouch, 3, 3, isTell ? 'signal' : 'blood', 3);
      g.line(6, 14, 4, 18, 'steel', 2, 1);
      g.line(11, 14, 11, 18, 'steel', 2, 1);
      g.line(16, 14, 18, 18, 'steel', 2, 1);
      return g;
    }

    case 'signalMite': {
      // Will-o'-Wisp Soul-Lantern
      const g = new PixelGrid(24, 24);
      const pulse = frameIdx % 2;
      g.circle(12, 12, 7, 'signal', 2);
      g.shadedRect(8, 8, 8, 8, 'bone');
      g.rect(9, 10, 2, 2, isTell || pulse === 1 ? 'signal' : 'brass', 3);
      g.rect(13, 10, 2, 2, isTell || pulse === 1 ? 'signal' : 'brass', 3);
      return g;
    }

    case 'siltMimic': {
      // Ossuary Coffer Mimic
      const g = new PixelGrid(28, 22);
      const collapse = isTell ? 3 : frameIdx % 2;
      g.shadedRect(4, 8 + collapse, 18, 9, 'rust');
      g.shadedRect(4, 3 + collapse, 18, 5, 'steel');
      g.rect(18, 9 + collapse, 5, 4, 'bone', 3);
      g.set(17, 8 + collapse, isTell ? 'blood' : 'brass', 3);
      return g;
    }

    case 'cinderCrow': {
      // Ashen Carrion-Crow
      const g = new PixelGrid(28, 26);
      const flap = frameIdx % 2 === 0 ? -4 : 4;
      g.shadedRect(9, 10, 10, 7, 'coat');
      g.rect(11, 12, 5, 3, isTell ? 'blood' : 'ember', 3);
      g.line(10, 11, 3, 10 + flap, 'coat', 2, 2);
      g.line(17, 11, 25, 10 + flap, 'coat', 3, 2);
      g.rect(19, 10, 5, 3, 'bone', 3);
      g.set(17, 10, 'blood', 3);
      return g;
    }

    case 'plateMarshal': {
      // Dread Cathedral Templar
      const g = new PixelGrid(48, 48);
      const march = frameIdx % 2;
      g.shadedRect(14, 14 + march, 16, 22, 'steel');
      g.shadedRect(17, 7 + march, 10, 8, 'steel');
      g.line(17, 7 + march, 13, 2 + march, 'bone', 3, 2);
      g.line(27, 7 + march, 31, 2 + march, 'bone', 3, 2);
      g.rect(22, 10 + march, 4, 2, 'blood', 3);
      g.shadedRect(30, 10, 10, 32, 'steel');
      g.shadedRect(32, 13, 6, 26, 'rust');
      g.rect(34, 22, 3, 4, 'bone', 3);
      return g;
    }

    case 'switchbackDriver': {
      // Nightmare Hell-Steed Outrider on 4 skeletal warhorse legs (NO WHEELS)
      const g = new PixelGrid(48, 48);
      const gallop = frameIdx % 2 === 0 ? -2 : 2;
      g.line(14, 28, 12 + gallop, 42, 'bone', 3, 2);
      g.line(20, 28, 20 - gallop, 42, 'bone', 2, 2);
      g.line(30, 28, 30 + gallop, 42, 'bone', 3, 2);
      g.line(36, 28, 38 - gallop, 42, 'bone', 2, 2);
      g.rect(11 + gallop, 40, 3, 3, 'ember', 3);
      g.rect(37 - gallop, 40, 3, 3, 'ember', 3);
      g.shadedRect(12, 20, 24, 10, 'rust'); // barded warhorse torso
      g.shadedRect(34, 14, 9, 7, 'bone'); // horse skull head
      g.shadedRect(18, 9, 10, 12, 'steel'); // Death-Knight rider
      g.line(14, 16, 45, 16, isTell ? 'brass' : 'bone', 3, 2); // couched war-lance
      return g;
    }

    case 'sumpCantor': {
      // Mire Hex-Chanter with stag-skull mask & plague-bell crozier
      const g = new PixelGrid(48, 48);
      const sway = frameIdx % 2 === 0 ? -2 : 2;
      g.shadedRect(14, 16, 14, 26, 'bog');
      g.shadedRect(16, 9, 10, 8, 'bone'); // stag-skull mask
      g.line(16, 9, 11, 3, 'bone', 3, 2);
      g.line(26, 9, 31, 3, 'bone', 3, 2);
      g.line(28, 38, 30, 8, 'rust', 2, 2);
      g.shadedRect(33 + sway, 16, 9, 11, isTell ? 'brass' : 'steel');
      return g;
    }

    case 'boreSentinel': {
      // Ash-Burrower Wyrmling
      const g = new PixelGrid(48, 48);
      const sway = frameIdx % 2;
      g.shadedRect(10, 36, 28, 7, 'rust'); // crimson ash crater
      g.shadedRect(16, 18, 16, 18, 'steel');
      g.shadedRect(18 + sway, 8, 14, 11, 'bone'); // horned drake skull
      g.rect(22 + sway, 12, 8, 5, isTell ? 'blood' : 'ember', 3);
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
      // FUSION MID-BOSSES (64x64): Towering 10-unit Gothic Dark Fantasy Ossuary & Eldritch Abominations
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

      g.shadedRect(14, 18 + pulse, 36, 32, primaryMat);
      g.shadedRect(10, 26 - pulse, 44, 20, 'steel');
      for (let i = 0; i < 5; i++) {
        const ex = 16 + i * 7;
        const ey = 22 + ((i % 2) * 5) + pulse;
        g.rect(ex, ey, 4, 4, isTell ? 'blood' : 'signal', 3);
      }
      g.shadedRect(46, 24 + pulse, 14, 18, isTell ? 'blood' : 'bone');
      return g;
    }

    case 'theLongDry':
    default: {
      // BOSS 4 (96x96): Catacomb Elder-Wyrm Skarath — Undead Bone-And-Obsidian Elder Dragon Wyrm (NO PIPES/DRILLS)
      const g = new PixelGrid(96, 96);
      const wave = frameIdx % 2 === 0 ? -3 : 3;
      const segs = [
        { x: 16, y: 68, r: 10 },
        { x: 28, y: 62 + wave, r: 12 },
        { x: 42, y: 52 - wave, r: 14 },
        { x: 56, y: 40 + wave, r: 16 },
        { x: 70, y: 32, r: 18 },
      ];
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        g.circle(s.x, s.y, s.r, i % 2 === 0 ? 'bone' : 'steel', 2);
        g.line(s.x, s.y - s.r, s.x - 5, s.y - s.r - 8, 'bone', 3, 2); // dorsal dragon spine
      }
      // Horned Dragon Skull & Blazing Hellfire Maw
      g.circle(74, 32, 13, 'bone', 3);
      g.line(70, 20, 54, 8, 'bone', 3, 3); // swept dragon horn
      g.circle(78, 34, 9, isTell ? 'blood' : 'ember', 3);
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
      // 9 Commons (5 frames each in manifest: 0,1 walk, 2 tell, 3 hit, 4 death)
      { id: 'tinRat', manifestId: 'tin_rat', tier: 'common', frames: 2 },
      { id: 'dustDog', manifestId: 'dust_dog', tier: 'common', frames: 4 },
      { id: 'wireKite', manifestId: 'wire_kite', tier: 'common', frames: 4 },
      { id: 'lyeLeech', manifestId: 'lye_leech', tier: 'common', frames: 3 },
      { id: 'sumpBat', manifestId: 'sump_bat', tier: 'common', frames: 3 },
      { id: 'rivetTick', manifestId: 'rivet_tick', tier: 'common', frames: 2 },
      { id: 'signalMite', manifestId: 'signal_mite', tier: 'common', frames: 2 },
      { id: 'siltMimic', manifestId: 'silt_mimic', tier: 'common', frames: 2 },
      { id: 'cinderCrow', manifestId: 'cinder_crow', tier: 'common', frames: 2 },
      // 7 Elites (7 frames each in manifest: 0,1 walk, 2,3 tell, 4 active, 5 hit, 6 death)
      { id: 'cleaverHauler', manifestId: 'cleaver_hauler', tier: 'elite', frames: 2 },
      { id: 'lyeStrider', manifestId: 'lye_strider', tier: 'elite', frames: 2 },
      { id: 'flatsHarvester', manifestId: 'flats_harvester', tier: 'elite', frames: 3 },
      { id: 'plateMarshal', manifestId: 'plate_marshal', tier: 'elite', frames: 2 },
      { id: 'switchbackDriver', manifestId: 'switchback_driver', tier: 'elite', frames: 2 },
      { id: 'sumpCantor', manifestId: 'sump_cantor', tier: 'elite', frames: 2 },
      { id: 'boreSentinel', manifestId: 'bore_sentinel', tier: 'elite', frames: 2 },
      // 9 Fusion Mid-Bosses (use base common manifest sprites with fusionBoss brass/signal rims)
      { id: 'scrapRatKing', manifestId: 'tin_rat', tier: 'fusionBoss', frames: 2 },
      { id: 'bonepackAlpha', manifestId: 'dust_dog', tier: 'fusionBoss', frames: 2 },
      { id: 'wireCyclone', manifestId: 'wire_kite', tier: 'fusionBoss', frames: 2 },
      { id: 'brineMaw', manifestId: 'lye_leech', tier: 'fusionBoss', frames: 2 },
      { id: 'screechChoir', manifestId: 'sump_bat', tier: 'fusionBoss', frames: 2 },
      { id: 'rivetTitan', manifestId: 'rivet_tick', tier: 'fusionBoss', frames: 2 },
      { id: 'relayColossus', manifestId: 'signal_mite', tier: 'fusionBoss', frames: 2 },
      { id: 'dredgeHusk', manifestId: 'silt_mimic', tier: 'fusionBoss', frames: 2 },
      { id: 'blackwingFurnace', manifestId: 'cinder_crow', tier: 'fusionBoss', frames: 2 },
      // 4 Primary Bosses (9 frames each in manifest)
      { id: 'theForeman', manifestId: 'the_foreman', tier: 'boss', frames: 2 },
      { id: 'bigAxle', manifestId: 'big_axle', tier: 'boss', frames: 2 },
      { id: 'motherSump', manifestId: 'mother_sump', tier: 'boss', frames: 2 },
      { id: 'theLongDry', manifestId: 'the_long_dry', tier: 'boss', frames: 2 },
    ];
    this.enemyDefs = enemyDefs;

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
        hitRight: null,
        hitLeft: null,
        deathRight: null,
        deathLeft: null,
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
      (g) => {
        g.shadedRect(2, 4, 8, 4, 'steel');
        g.shadedRect(2, 3, 3, 6, 'brass');
      },
      (g) => {
        g.circle(6, 6, 4, 'steel', 3);
        g.circle(6, 6, 2, 'verdigris', 3);
      },
      (g) => {
        g.circle(6, 6, 4, 'brass', 2);
        g.rect(5, 1, 2, 10, 'brass', 3);
        g.rect(1, 5, 10, 2, 'brass', 3);
        g.set(6, 6, 'coat', 0);
      },
      (g) => {
        g.shadedRect(2, 3, 8, 6, 'rust');
        g.shadedRect(8, 2, 2, 8, 'steel');
      },
      (g) => {
        g.circle(6, 6, 4, 'rust', 3);
        g.set(6, 3, 'verdigris', 3);
      },
      (g) => {
        g.shadedRect(2, 5, 6, 3, 'steel');
        g.rect(7, 3, 3, 2, 'bone', 3);
        g.rect(7, 7, 3, 2, 'bone', 3);
      },
      (g) => {
        g.shadedRect(2, 2, 8, 8, 'steel');
        g.set(4, 4, 'brass', 3);
        g.set(7, 7, 'brass', 3);
      },
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

    if (assets.loaded) {
      this.hydrateFromManifest();
    }
  }

  /**
   * Hydrates all enemy strips, projectiles (rail_spike), shards (fx_shards),
   * ultimate_cutin, NPC caches, and baseClassSheets directly from the loaded manifest/atlas.
   */
  hydrateFromManifest() {
    if (!assets.loaded) return;
    if (!this.initialized) this.init();

    // 1. Hydrate all 29 enemy/elite/fusionBoss/boss entries from manifest strips
    for (const def of this.enemyDefs || []) {
      const mId = def.manifestId;
      const spec = mId ? assets.getSpec(mId) : null;
      if (!spec) continue;

      const f0Right = assets.getFrameCanvas(mId, 0, false);
      if (!f0Right) continue;

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
        hitRight: null,
        hitLeft: null,
        deathRight: null,
        deathLeft: null,
      };

      const walkCount = Math.max(2, def.frames);
      for (let i = 0; i < walkCount; i++) {
        const walkFrameIdx = i % 2;
        const tellFrameIdx = spec.frameCount >= 4 ? 2 + (i % 2) : Math.min(spec.frameCount - 1, 2);

        const rWalk = baseRim
          ? assets.getOutlinedFrame(mId, walkFrameIdx, false, baseRim)
          : assets.getFrameCanvas(mId, walkFrameIdx, false);
        const lWalk = baseRim
          ? assets.getOutlinedFrame(mId, walkFrameIdx, true, baseRim)
          : assets.getFrameCanvas(mId, walkFrameIdx, true);

        const rPulse = pulseRim
          ? assets.getOutlinedFrame(mId, walkFrameIdx, false, pulseRim)
          : rWalk;
        const lPulse = pulseRim
          ? assets.getOutlinedFrame(mId, walkFrameIdx, true, pulseRim)
          : lWalk;

        const rTell = baseRim
          ? assets.getOutlinedFrame(mId, tellFrameIdx, false, baseRim)
          : assets.getFrameCanvas(mId, tellFrameIdx, false);
        const lTell = baseRim
          ? assets.getOutlinedFrame(mId, tellFrameIdx, true, baseRim)
          : assets.getFrameCanvas(mId, tellFrameIdx, true);

        entry.right.push(rWalk);
        entry.left.push(lWalk);
        entry.elitePulseRight.push(rPulse);
        entry.elitePulseLeft.push(lPulse);
        entry.tellRight.push(rTell);
        entry.tellLeft.push(lTell);
        entry.stunRight.push(assets.getOutlinedFrame(mId, walkFrameIdx, false, PALETTE.signal));
        entry.stunLeft.push(assets.getOutlinedFrame(mId, walkFrameIdx, true, PALETTE.signal));
        entry.brassRimRight.push(assets.getOutlinedFrame(mId, walkFrameIdx, false, PALETTE.brass));
        entry.brassRimLeft.push(assets.getOutlinedFrame(mId, walkFrameIdx, true, PALETTE.brass));
        entry.whiteRight.push(assets.getTintedFrame(mId, walkFrameIdx, false, PALETTE.bone));
        entry.whiteLeft.push(assets.getTintedFrame(mId, walkFrameIdx, true, PALETTE.bone));
        entry.silhouette.push(assets.getTintedFrame(mId, walkFrameIdx, false, '#000000'));
      }

      const hitIdx = spec.frameCount >= 7 ? 5 : spec.frameCount >= 5 ? 3 : 0;
      const deathIdx = spec.frameCount - 1;
      entry.hitRight = assets.getFrameCanvas(mId, hitIdx, false);
      entry.hitLeft = assets.getFrameCanvas(mId, hitIdx, true);
      entry.deathRight = assets.getFrameCanvas(mId, deathIdx, false);
      entry.deathLeft = assets.getFrameCanvas(mId, deathIdx, true);

      this.enemies[def.id] = entry;
    }

    // 2. Hydrate 8-angle rail_spike from manifest
    const spikeBase = assets.getFrameCanvas('rail_spike', 0, false);
    if (spikeBase) {
      const rotated = [];
      for (let a = 0; a < 8; a++) {
        const rc = document.createElement('canvas');
        rc.width = 16;
        rc.height = 16;
        const rctx = rc.getContext('2d');
        rctx.imageSmoothingEnabled = false;
        rctx.translate(8, 8);
        rctx.rotate((a * Math.PI) / 4);
        rctx.drawImage(spikeBase, -8, -8);
        rotated.push(rc);
      }
      this.railSpikeAngles = rotated;
    }

    // 3. Hydrate fx_shards (6 frames of 16x16) into scrapVariants & debrisParts
    const shardSpec = assets.getSpec('fx_shards');
    if (shardSpec) {
      const shardFrames = [];
      for (let s = 0; s < shardSpec.frameCount; s++) {
        const sc = assets.getFrameCanvas('fx_shards', s, false);
        if (sc) shardFrames.push(sc);
      }
      if (shardFrames.length > 0) {
        this.scrapVariants = Array.from({ length: 8 }, (_, i) => shardFrames[i % shardFrames.length]);
      }
    }

    // 4. Hydrate ultimate_cutin (320x90) for Sena
    const cutinManifest = assets.getFrameCanvas('ultimate_cutin', 0, false);
    if (cutinManifest) {
      this.cutInCanvases.sena = cutinManifest;
      this.cutInCanvas = cutinManifest;
    }

    // 5. Rebuild baseClassSheets with manifest player sprites & class sheets
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
      cctx.fillStyle = MATERIAL_RAMPS.brass[2];
      cctx.fillRect(6, 1, 52, 14);
      cctx.fillStyle = MATERIAL_RAMPS.steel[1];
      cctx.fillRect(10, 4, 44, 8);
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(12, 5, 40, 6);
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
      cctx.fillStyle = PALETTE.bone;
      cctx.fillRect(4, 0, 56, 4);
      cctx.fillStyle = MATERIAL_RAMPS.skin[2];
      cctx.fillRect(12, 4, 40, 11);
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
      cctx.fillStyle = MATERIAL_RAMPS.olive[2];
      cctx.fillRect(0, 0, 64, 4);
      cctx.fillStyle = MATERIAL_RAMPS.skin[2];
      cctx.fillRect(10, 4, 44, 10);
      cctx.fillStyle = PALETTE.brass;
      cctx.fillRect(17, 3, 14, 11);
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(19, 5, 10, 7);
      cctx.fillStyle = PALETTE.brass;
      cctx.fillRect(21, 6, 6, 5);
      cctx.fillStyle = '#FFFFFF';
      cctx.fillRect(23, 7, 2, 2);
      cctx.fillStyle = PALETTE.bone;
      cctx.fillRect(15, 8, 18, 1);
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(39, 7, 9, 2);
      return c;
    }

    if (classId === 'ines') {
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(0, 0, 64, 16);
      cctx.fillStyle = MATERIAL_RAMPS.skin[2];
      cctx.fillRect(12, 3, 40, 11);
      cctx.fillStyle = MATERIAL_RAMPS.steel[2];
      cctx.fillRect(15, 4, 34, 9);
      cctx.fillStyle = PALETTE.soot;
      cctx.fillRect(17, 5, 12, 7);
      cctx.fillRect(35, 5, 12, 7);
      cctx.fillStyle = PALETTE.verdigris;
      cctx.fillRect(20, 6, 6, 5);
      cctx.fillRect(38, 6, 6, 5);
      cctx.fillStyle = '#FFFFFF';
      cctx.fillRect(21, 7, 2, 2);
      cctx.fillRect(39, 7, 2, 2);
      return c;
    }

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
 * 64x64 / 96x96 Character Portrait Renderer for Sena, Rook, Ines, Kaelen, and Vespera
 * Uses the generated 96x96 pixel-art portraits when loaded, with procedural fallback.
 */
function drawPortraitChibiFace(g, headOffX, irisMat, expression) {
  g.shadedRect(10 + headOffX, 24, 5, 10, 'chibiSkin');
  g.rect(12 + headOffX, 27, 2, 4, 'chibiBlush', 1);
  g.shadedRect(49 + headOffX, 24, 5, 10, 'chibiSkin');
  g.rect(50 + headOffX, 27, 2, 4, 'chibiBlush', 1);

  g.shadedRect(27 + headOffX, 40, 10, 6, 'chibiSkin');
  g.shadedRect(16 + headOffX, 14, 32, 28, 'chibiSkin');
  g.shadedRect(14 + headOffX, 17, 36, 22, 'chibiSkin');
  g.rect(18 + headOffX, 17, 28, 22, 'chibiSkin', 2);
  g.rect(20 + headOffX, 16, 24, 7, 'chibiSkin', 3);

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
    g.rect(20 + headOffX, 24, 8, 2, 'chibiOutline', 0);
    g.rect(21 + headOffX, 26, 6, 6, activeIris, 2);
    g.rect(23 + headOffX, 26, 4, 3, activeIris, 1);
    g.rect(21 + headOffX, 26, 2, 4, 'chibiIrisPink', 3);
    g.rect(23 + headOffX, 30, 3, 2, activeIris, 3);

    g.rect(36 + headOffX, 24, 8, 2, 'chibiOutline', 0);
    g.rect(37 + headOffX, 26, 6, 6, activeIris, 2);
    g.rect(39 + headOffX, 26, 4, 3, activeIris, 1);
    g.rect(37 + headOffX, 26, 2, 4, 'chibiIrisPink', 3);
    g.rect(39 + headOffX, 30, 3, 2, activeIris, 3);

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
  const cw = canvas.width || 64;
  const ch = canvas.height || 64;
  ctx.clearRect(0, 0, cw, ch);

  if (assets.loaded) {
    let portraitId = `${classId}_neutral`;
    if (expression === 'hurt') portraitId = `${classId}_hurt`;
    else if (expression === 'ultimate') portraitId = `${classId}_ultimate`;
    else if (expression === 'determined') portraitId = `${classId}_determined`;

    const manifestPortrait =
      assets.getFrameCanvas(portraitId, 0, false) ||
      (expression === 'normal' ? assets.getFrameCanvas(`${classId}_neutral`, 0, false) : null);
    if (manifestPortrait) {
      ctx.drawImage(
        manifestPortrait,
        0,
        0,
        manifestPortrait.width,
        manifestPortrait.height,
        0,
        0,
        cw,
        ch
      );
      return;
    }
  }

  const g = new PixelGrid(64, 64);
  g.rect(0, 0, 64, 64, 'coat', 0);

  const headOffX = expression === 'hurt' ? -2 : 0;

  if (classId === 'rook') {
    g.shadedRect(12, 44, 40, 20, 'olive');
    g.line(16, 45, 46, 62, 'bone', 2, 4);
    g.rect(22, 49, 4, 4, 'brass', 3);
    g.rect(32, 54, 4, 4, 'brass', 3);
    drawPortraitChibiFace(g, headOffX, 'chibiIrisGold', expression);
    g.rect(19 + headOffX, 23, 10, 1, 'brass', 3);
    g.rect(19 + headOffX, 32, 10, 1, 'brass', 3);
    g.shadedRect(15 + headOffX, 12, 34, 6, 'bone');
    g.shadedRect(10 + headOffX, 9, 44, 5, 'olive');
    g.shadedRect(18 + headOffX, 3, 28, 7, 'coat');
    g.rect(20 + headOffX, 8, 24, 2, 'brass', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0, 64, 64, 0, 0, cw, ch);
    return;
  }

  if (classId === 'ines') {
    g.shadedRect(8, 18, 8, 32, 'bone');
    g.shadedRect(48, 18, 8, 32, 'bone');
    g.shadedRect(9, 14, 6, 5, 'verdigris');
    g.shadedRect(49, 14, 6, 5, 'verdigris');
    g.shadedRect(12, 44, 40, 20, 'coat');
    g.shadedRect(20, 46, 24, 18, 'bone');
    drawPortraitChibiFace(g, headOffX, 'chibiIrisEmerald', expression);
    g.shadedRect(14 + headOffX, 9, 36, 8, 'coat');
    g.line(18 + headOffX, 11, 44 + headOffX, 14, 'bone', 3, 3);
    g.shadedRect(12 + headOffX, 16, 5, 24, 'bone');
    g.shadedRect(47 + headOffX, 16, 5, 24, 'bone');
    g.rect(15 + headOffX, 14, 5, 5, 'bone', 3);
    g.rect(44 + headOffX, 14, 5, 5, 'bone', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0, 64, 64, 0, 0, cw, ch);
    return;
  }

  if (classId === 'kaelen') {
    g.shadedRect(8, 16, 9, 34, 'brass');
    g.shadedRect(47, 16, 9, 34, 'brass');
    g.rect(10, 12, 5, 4, 'ember', 3);
    g.rect(49, 12, 5, 4, 'ember', 3);
    g.shadedRect(12, 44, 40, 20, 'steel');
    g.shadedRect(18, 46, 28, 18, 'rust');
    g.circle(32, 54, 4, 'ember', 3);
    drawPortraitChibiFace(g, headOffX, 'chibiIrisEmber', expression);
    g.shadedRect(14 + headOffX, 9, 36, 8, 'rust');
    g.rect(20 + headOffX, 7, 24, 4, 'ember', 3);
    g.line(16 + headOffX, 13, 8 + headOffX, 4, 'brass', 3, 3);
    g.line(48 + headOffX, 13, 56 + headOffX, 4, 'brass', 3, 3);
    g.rect(22 + headOffX, 13, 20, 3, 'brass', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0, 64, 64, 0, 0, cw, ch);
    return;
  }

  if (classId === 'vespera') {
    g.circle(32, 28, 25, 'brass', 2);
    g.circle(32, 28, 21, 'coat', 0);
    g.rect(30, 3, 4, 4, 'volt', 3);
    g.rect(7, 26, 4, 4, 'volt', 3);
    g.rect(53, 26, 4, 4, 'volt', 3);
    g.shadedRect(12, 44, 40, 20, 'coat');
    g.line(22, 44, 22, 62, 'volt', 3, 2);
    g.line(42, 44, 42, 62, 'volt', 3, 2);
    drawPortraitChibiFace(g, headOffX, 'chibiIrisViolet', expression);
    g.shadedRect(14 + headOffX, 9, 36, 8, 'bone');
    g.shadedRect(12 + headOffX, 15, 5, 24, 'bone');
    g.shadedRect(46 + headOffX, 15, 6, 24, 'bone');
    g.rect(24 + headOffX, 11, 16, 3, 'brass', 3);
    g.rect(30 + headOffX, 7, 4, 8, 'volt', 3);

    const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
    ctx.drawImage(baked, 0, 0, 64, 64, 0, 0, cw, ch);
    return;
  }

  const bodyMat =
    equipped.body === 'plateCoat'
      ? 'rust'
      : equipped.body === 'riotJacket'
      ? 'bog'
      : 'coat';
  g.shadedRect(12, 44, 40, 20, bodyMat);
  g.shadedRect(10, 43, 12, 10, 'steel');
  g.shadedRect(42, 43, 12, 10, 'steel');
  g.shadedRect(48, 12, 7, 34, 'steel');
  g.rect(49, 16, 5, 6, 'signal', 3);
  drawPortraitChibiFace(g, headOffX, 'chibiIrisPink', expression);
  g.shadedRect(14 + headOffX, 9, 36, 8, 'hair');
  g.shadedRect(12 + headOffX, 16, 5, 22, 'hair');
  g.shadedRect(47 + headOffX, 16, 5, 22, 'hair');
  g.rect(20 + headOffX, 12, 24, 3, 'steel', 2);
  g.rect(30 + headOffX, 9, 4, 6, 'brass', 3);
  g.set(31 + headOffX, 11, 'signal', 3);

  const baked = g.bakeToCanvas({ selectiveOutline: false, topLeftHighlight: true });
  ctx.drawImage(baked, 0, 0, 64, 64, 0, 0, cw, ch);
}

export function drawSenaPortrait(canvas, expression = 'normal', equipped = {}, classId = 'sena', stage = 1, branch = null) {
  drawCharacterPortrait(canvas, classId, expression, equipped, stage, branch);
}

const _chibiNpcCache = {};

const NPC_ROLE_TO_MANIFEST_ID = {
  forge: 'npc_vaelen',
  apothecary: 'npc_isolde',
  guild: 'npc_malakor',
  sanctum: 'npc_solen',
  tavern: 'npc_maeve',
  gambler: 'npc_vex',
  merchant: 'npc_morwen',
  pilgrim: 'ume',
  ume: 'ume',
};

/**
 * Renders any Duskhollow Town Master, Wandering Merchant, or Cleansed-Territory Pilgrim.
 * Uses the generated 64x64 2-frame NPC strips from manifest when loaded.
 */
export function getChibiNpcCanvas(npcRole = 'forge', frameIdx = 0) {
  if (assets.loaded) {
    const manifestNpcId = NPC_ROLE_TO_MANIFEST_ID[npcRole] || npcRole;
    const npcCanvas = assets.getFrameCanvas(manifestNpcId, frameIdx % 2, false);
    if (npcCanvas) return npcCanvas;
  }

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
 * Shows the live animated character sprite from the loaded class sheet / directional strip.
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
    ctx.drawImage(
      frameCanvas,
      0,
      0,
      frameCanvas.width,
      frameCanvas.height,
      0,
      0,
      96,
      96
    );
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

