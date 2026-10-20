import React, { useEffect, useRef } from 'react';
import { PALETTE, GRADES } from '../data/config.js';
import { drawCharacterPortrait } from '../game/Sprites.js';

/**
 * 64x64 Pixel-Art Anime Portrait Component for Sena, Rook, or Ines
 * Reflects classId, expression, equipped headgear/coat, stage, and branch.
 */
export function CharacterPortrait({
  classId = 'sena',
  expression = 'normal',
  equipped = {},
  stage = 1,
  branch = null,
  size = 64,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawCharacterPortrait(
        canvasRef.current,
        classId,
        expression,
        equipped,
        stage,
        branch
      );
    }
  }, [classId, expression, equipped?.head, equipped?.body, equipped?.legs, stage, branch]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={64}
      style={{ width: size, height: size }}
      className={`pixelated block border border-[#3A3F47] bg-[#0B0D10] ${className}`}
    />
  );
}

// Backwards-compatible export
export function SenaPortrait(props) {
  return <CharacterPortrait {...props} />;
}

/**
 * 12x12 Pixel-Art Status Icon drawn from code (No text inside, max 3 colors + 1px dark outline)
 */
export function StatusIcon({ statusId, size = 24 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 12, 12);

    // 1px dark soot backing outline helper
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(0, 0, 12, 12);

    switch (statusId) {
      case 'bleed': {
        // Two falling blood drops
        ctx.fillStyle = '#7A1C1C';
        ctx.fillRect(3, 2, 2, 4);
        ctx.fillRect(7, 5, 2, 5);
        ctx.fillStyle = PALETTE.blood;
        ctx.fillRect(2, 4, 4, 3);
        ctx.fillRect(6, 7, 4, 3);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(3, 5, 1, 1);
        ctx.fillRect(7, 8, 1, 1);
        break;
      }
      case 'burn': {
        // Three jagged brass flame tongues
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(2, 5, 8, 5);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 3, 2, 6);
        ctx.fillRect(5, 2, 2, 7);
        ctx.fillRect(8, 4, 2, 5);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 6, 2, 3);
        break;
      }
      case 'corrode': {
        // Dripping lye-green droplet eating a notch out of a steel bar
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(1, 7, 4, 3);
        ctx.fillRect(7, 7, 4, 3);
        ctx.fillStyle = '#6B7E2A';
        ctx.fillRect(4, 8, 4, 2);
        ctx.fillStyle = PALETTE.lye;
        ctx.fillRect(5, 2, 2, 5);
        ctx.fillRect(4, 4, 4, 3);
        break;
      }
      case 'exposed': {
        // Cracked armor plate with a blood gap down the middle
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(2, 2, 3, 8);
        ctx.fillRect(7, 2, 3, 8);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(2, 2, 3, 1);
        ctx.fillRect(7, 2, 3, 1);
        ctx.fillStyle = PALETTE.blood;
        ctx.fillRect(5, 2, 2, 8);
        ctx.fillRect(4, 5, 4, 2);
        break;
      }
      case 'weakened': {
        // Bent blade pointing down
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(4, 1, 4, 2);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(5, 3, 2, 4);
        ctx.fillRect(3, 7, 3, 3);
        ctx.fillStyle = PALETTE.boneDark;
        ctx.fillRect(5, 3, 1, 3);
        break;
      }
      case 'slow': {
        // Boot with a ball and chain
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(2, 3, 3, 5);
        ctx.fillRect(2, 7, 5, 2);
        ctx.fillStyle = PALETTE.boneDark;
        ctx.fillRect(6, 7, 2, 1);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(8, 6, 3, 3);
        break;
      }
      case 'pinned': {
        // Iron stake driven through a ring
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(2, 6, 8, 3);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(5, 1, 2, 10);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(4, 1, 4, 2);
        break;
      }
      case 'stun': {
        // Cracked bell with two sound lines
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 3, 4, 5);
        ctx.fillRect(3, 7, 6, 2);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(5, 5, 1, 3);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(1, 3, 1, 4);
        ctx.fillRect(10, 3, 1, 4);
        break;
      }
      case 'lifted': {
        // Upward verdigris arrow under a block
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(3, 2, 6, 3);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(5, 6, 2, 5);
        ctx.fillRect(3, 7, 6, 1);
        ctx.fillRect(4, 6, 4, 1);
        break;
      }
      case 'blind': {
        // Eye with a diagonal slash across it
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(2, 5, 8, 2);
        ctx.fillRect(4, 4, 4, 4);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillStyle = PALETTE.blood;
        for (let i = 2; i < 10; i++) {
          ctx.fillRect(i, 11 - i, 2, 1);
        }
        break;
      }
      case 'choke': {
        // Two wavy smoke lines rising
        ctx.fillStyle = PALETTE.bog;
        ctx.fillRect(3, 2, 2, 8);
        ctx.fillRect(7, 2, 2, 8);
        ctx.fillStyle = PALETTE.lye;
        ctx.fillRect(2, 4, 2, 2);
        ctx.fillRect(4, 7, 2, 2);
        ctx.fillRect(6, 3, 2, 2);
        ctx.fillRect(8, 6, 2, 2);
        break;
      }
      case 'marked': {
        // Brass crosshair
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 1, 2, 3);
        ctx.fillRect(5, 8, 2, 3);
        ctx.fillRect(1, 5, 3, 2);
        ctx.fillRect(8, 5, 3, 2);
        ctx.fillStyle = PALETTE.blood;
        ctx.fillRect(5, 5, 2, 2);
        break;
      }
      case 'overloaded': {
        // Horseshoe magnet with two opposing arrows
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(2, 3, 2, 6);
        ctx.fillRect(8, 3, 2, 6);
        ctx.fillRect(2, 8, 8, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(2, 2, 2, 2);
        ctx.fillRect(8, 2, 2, 2);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 3, 2, 3);
        break;
      }
      case 'momentum': {
        // Forward chevron stack
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(2, 3, 2, 2);
        ctx.fillRect(4, 5, 2, 2);
        ctx.fillRect(2, 7, 2, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(6, 3, 2, 2);
        ctx.fillRect(8, 5, 2, 2);
        ctx.fillRect(6, 7, 2, 2);
        break;
      }
      case 'redline': {
        // Full chevron stack with a blood-red outline
        ctx.fillStyle = PALETTE.blood;
        ctx.fillRect(1, 1, 10, 10);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(2, 2, 8, 8);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(3, 3, 2, 6);
        ctx.fillRect(6, 4, 3, 4);
        break;
      }
      case 'guarding': {
        // Raised shield block
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(2, 2, 8, 7);
        ctx.fillRect(4, 9, 4, 2);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(2, 2, 8, 1);
        ctx.fillRect(5, 4, 2, 4);
        break;
      }
      case 'steadyAim': {
        // Scope reticle with a dot
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 2, 8, 1);
        ctx.fillRect(2, 9, 8, 1);
        ctx.fillRect(2, 2, 1, 8);
        ctx.fillRect(9, 2, 1, 8);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 5, 2, 2);
        break;
      }
      case 'holdBreath': {
        // Calm horizontal line / lungs
        ctx.fillStyle = PALETTE.bog;
        ctx.fillRect(2, 3, 3, 4);
        ctx.fillRect(7, 3, 3, 4);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(1, 8, 10, 2);
        break;
      }
      case 'quickHands': {
        // Two blurred bolt shapes
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 3, 7, 2);
        ctx.fillRect(3, 7, 7, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(8, 3, 2, 2);
        ctx.fillRect(9, 7, 2, 2);
        break;
      }
      case 'ironHide': {
        // Riveted plate square
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(2, 2, 8, 8);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(3, 3, 1, 1);
        ctx.fillRect(8, 3, 1, 1);
        ctx.fillRect(3, 8, 1, 1);
        ctx.fillRect(8, 8, 1, 1);
        break;
      }
      case 'scrapSkin':
      case 'secondSkin': {
        // Ring of four small scrap squares
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(5, 1, 2, 2);
        ctx.fillRect(5, 9, 2, 2);
        ctx.fillRect(1, 5, 2, 2);
        ctx.fillRect(9, 5, 2, 2);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(4, 4, 4, 4);
        break;
      }
      case 'grounded': {
        // Boot planted on a solid bar
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(4, 2, 3, 5);
        ctx.fillRect(3, 6, 6, 2);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(1, 9, 10, 2);
        break;
      }
      case 'wellFed': {
        // Steaming bowl
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(2, 6, 8, 3);
        ctx.fillRect(4, 9, 4, 1);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(4, 2, 1, 3);
        ctx.fillRect(7, 2, 1, 3);
        break;
      }
      case 'haste': {
        // Double forward arrow
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(2, 4, 3, 4);
        ctx.fillRect(6, 4, 3, 4);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(4, 5, 2, 2);
        ctx.fillRect(8, 5, 2, 2);
        break;
      }
      case 'riposteSurge': {
        // Curved crescent blade with glowing core and speed chevron
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(2, 2, 2, 7);
        ctx.fillRect(4, 1, 4, 2);
        ctx.fillRect(7, 2, 2, 3);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(3, 3, 2, 4);
        ctx.fillRect(5, 2, 2, 2);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 9, 7, 2);
        ctx.fillRect(6, 7, 3, 1);
        break;
      }
      case 'focus': {
        // Diamond eye
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 2, 2, 8);
        ctx.fillRect(2, 5, 8, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 5, 2, 2);
        break;
      }
      case 'warm': {
        // Small flame in a ring
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(2, 8, 8, 2);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 3, 4, 5);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 5, 2, 2);
        break;
      }
      case 'bounty': {
        // Stamped coin
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(3, 2, 6, 8);
        ctx.fillRect(2, 3, 8, 6);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(5, 4, 2, 4);
        break;
      }
      case 'overheated': {
        // Blazing ember pressure gauge needle at max
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(2, 2, 8, 8);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(3, 4, 6, 5);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 2, 2, 5);
        break;
      }
      case 'slagCarapace':
      case 'moltenJuggernaut': {
        // Molten ember-rimmed armor shield
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(2, 1, 8, 9);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(3, 2, 6, 7);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 4, 2, 3);
        break;
      }
      case 'arcOvercharge': {
        // Volt lightning bolt inside a copper halo
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 2, 8, 8);
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(3, 3, 6, 6);
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(5, 2, 3, 4);
        ctx.fillRect(4, 5, 3, 5);
        break;
      }
      default: {
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(3, 3, 6, 6);
        break;
      }
    }
  }, [statusId]);

  return (
    <canvas
      ref={canvasRef}
      width={12}
      height={12}
      style={{ width: size, height: size }}
      className="pixelated block shrink-0 bg-[#0B0D10]"
    />
  );
}

/**
 * 16x16 Pixel-Art Item / Skill Icon drawn from code onto an offscreen canvas
 */
export function PixelIcon({ itemId, size = 32 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 16, 16);

    switch (itemId) {
      case 'weldingGoggles': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(1, 5, 14, 6);
        ctx.fillStyle = PALETTE.boneDark;
        ctx.fillRect(2, 6, 5, 4);
        ctx.fillRect(9, 6, 5, 4);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(3, 7, 3, 2);
        ctx.fillRect(10, 7, 3, 2);
        break;
      }
      case 'surplusRespirator': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = PALETTE.bog;
        ctx.fillRect(4, 4, 8, 6);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(2, 8, 4, 4);
        ctx.fillRect(10, 8, 4, 4);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(6, 5, 4, 2);
        break;
      }
      case 'ridersHelmet': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(2, 2, 12, 12);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(4, 6, 8, 3);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(6, 2, 4, 2);
        break;
      }
      case 'patchedVest': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(4, 3, 8, 10);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(5, 8, 3, 3);
        ctx.fillStyle = PALETTE.boneDark;
        ctx.fillRect(8, 4, 3, 3);
        break;
      }
      case 'riotJacket': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(2, 2, 12, 12);
        ctx.fillStyle = PALETTE.bog;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 4, 6, 2);
        ctx.fillRect(5, 8, 6, 2);
        break;
      }
      case 'plateCoat': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(2, 1, 12, 14);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 4, 8, 3);
        ctx.fillRect(6, 8, 4, 5);
        break;
      }
      case 'workBoots': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(2, 3, 12, 11);
        ctx.fillStyle = PALETTE.rustDark;
        ctx.fillRect(3, 4, 4, 8);
        ctx.fillRect(9, 4, 4, 8);
        ctx.fillStyle = PALETTE.boneDark;
        ctx.fillRect(2, 11, 6, 2);
        ctx.fillRect(8, 11, 6, 2);
        break;
      }
      case 'courierLeggings': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = PALETTE.bog;
        ctx.fillRect(4, 3, 3, 10);
        ctx.fillRect(9, 3, 3, 10);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(4, 7, 3, 2);
        ctx.fillRect(9, 7, 3, 2);
        break;
      }
      case 'hydraulicShins': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(3, 2, 10, 12);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 3, 3, 10);
        ctx.fillRect(9, 3, 3, 10);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(5, 5, 1, 6);
        ctx.fillRect(10, 5, 1, 6);
        break;
      }
      case 'gauzeRoll': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(4, 4, 8, 8);
        ctx.fillStyle = PALETTE.blood;
        ctx.fillRect(7, 5, 2, 6);
        ctx.fillRect(5, 7, 6, 2);
        break;
      }
      case 'sugarTin': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 4, 8, 8);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(5, 6, 6, 4);
        break;
      }
      case 'lyeWash': {
        // Canteen bottle of neutralizer wash
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(4, 2, 8, 12);
        ctx.fillStyle = PALETTE.bog;
        ctx.fillRect(5, 5, 6, 8);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(6, 7, 4, 4);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(6, 2, 4, 2);
        break;
      }
      case 'hotStew': {
        // Tin bowl of hot stew with steam
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(2, 6, 12, 7);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(3, 7, 10, 5);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 7, 8, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 2, 2, 3);
        ctx.fillRect(9, 3, 2, 2);
        break;
      }
      case 'stimStick': {
        // Ampoule injector stick
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(5, 1, 6, 14);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(6, 2, 4, 10);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(7, 4, 2, 5);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(6, 12, 4, 2);
        break;
      }
      // SENA SKILLS
      case 'skill_lunge': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.signal;
        for (let i = 2; i < 14; i++) {
          ctx.fillRect(i, 15 - i, 2, 2);
        }
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(11, 2, 3, 3);
        break;
      }
      case 'skill_groundBreak': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(7, 2, 2, 9);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(2, 11, 12, 2);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 13, 8, 2);
        break;
      }
      case 'skill_railParry':
      case 'skill_railSpike': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(3, 11, 10, 2);
        ctx.fillRect(7, 2, 2, 12);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(8, 3, 1, 10);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillRect(10, 8, 2, 2);
        break;
      }
      case 'skill_sevenCuts': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(2, 3, 12, 2);
        ctx.fillRect(3, 7, 10, 2);
        ctx.fillRect(2, 11, 12, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(7, 1, 2, 14);
        break;
      }
      // ROOK SKILLS
      case 'skill_rivetSpread': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 7, 4, 2);
        ctx.fillRect(7, 3, 6, 2);
        ctx.fillRect(8, 7, 6, 2);
        ctx.fillRect(7, 11, 6, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(12, 3, 2, 2);
        ctx.fillRect(13, 7, 2, 2);
        ctx.fillRect(12, 11, 2, 2);
        break;
      }
      case 'skill_kickback': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(2, 6, 6, 4);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(8, 5, 6, 6);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(1, 4, 3, 2);
        ctx.fillRect(1, 10, 3, 2);
        break;
      }
      case 'skill_rapidFire':
      case 'skill_tripwire': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(3, 4, 9, 2);
        ctx.fillRect(5, 7, 8, 2);
        ctx.fillRect(2, 10, 10, 2);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(11, 4, 3, 2);
        ctx.fillRect(12, 7, 3, 2);
        ctx.fillRect(11, 10, 3, 2);
        break;
      }
      case 'skill_railSlug':
      case 'skill_tenCount': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 6, 10, 4);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(12, 7, 3, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(1, 4, 1, 8);
        ctx.fillRect(4, 5, 6, 1);
        ctx.fillRect(4, 10, 6, 1);
        break;
      }
      // INES SKILLS
      case 'skill_pull': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(3, 4, 8, 2);
        ctx.fillRect(3, 10, 8, 2);
        ctx.fillRect(3, 4, 2, 8);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(10, 4, 3, 2);
        ctx.fillRect(10, 10, 3, 2);
        break;
      }
      case 'skill_spinUp': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(4, 2, 8, 2);
        ctx.fillRect(4, 12, 8, 2);
        ctx.fillRect(2, 4, 2, 8);
        ctx.fillRect(12, 4, 2, 8);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(6, 6, 4, 4);
        break;
      }
      case 'skill_lump': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = PALETTE.rust;
        ctx.fillRect(5, 5, 6, 6);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(3, 3, 10, 2);
        ctx.fillRect(3, 3, 2, 10);
        break;
      }
      case 'skill_scrapfall': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(3, 2, 10, 7);
        ctx.fillStyle = PALETTE.verdigris;
        ctx.fillRect(2, 11, 12, 2);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 9, 6, 2);
        break;
      }
      // KAELEN VOS (THERMO-LANCER) SKILLS & ULTIMATES
      case 'naphthaJet':
      case 'skill_naphthaJet': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Rocket-lance dash spear with blazing ember wake
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(1, 9, 8, 4);
        ctx.fillRect(3, 6, 7, 3);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(7, 4, 5, 4);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(11, 2, 3, 3);
        break;
      }
      case 'causticMortar':
      case 'skill_causticMortar': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Pressurized lye/ember canister shell + acid splash ring
        ctx.fillStyle = PALETTE.lye;
        ctx.fillRect(2, 11, 12, 3);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 3, 6, 7);
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(6, 5, 4, 3);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(7, 2, 2, 2);
        break;
      }
      case 'ventSupernova':
      case 'skill_ventSupernova': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Radial 8-way boiler blast star
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(2, 6, 12, 4);
        ctx.fillRect(6, 2, 4, 12);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(4, 4, 8, 8);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(6, 6, 4, 4);
        break;
      }
      case 'supercriticalMeltdown':
      case 'skill_supercriticalMeltdown': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Overdriven red-hot boiler core with 4 jet vents and flame plumes
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(4, 4, 8, 8);
        ctx.fillRect(2, 6, 12, 4);
        ctx.fillRect(6, 2, 4, 12);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 5, 6, 6);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(6, 6, 4, 4);
        // Jet plume sparks at corners
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(1, 1, 2, 2);
        ctx.fillRect(13, 1, 2, 2);
        ctx.fillRect(1, 13, 2, 2);
        ctx.fillRect(13, 13, 2, 2);
        break;
      }
      case 'sunfallFurnace':
      case 'tectonicKiln':
      case 'blightHurricane':
      case 'skill_sunfallFurnace': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Miniature sun core with solar flare rays & crater ring
        ctx.fillStyle = PALETTE.ember;
        ctx.fillRect(3, 2, 10, 10);
        ctx.fillRect(1, 12, 14, 2);
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(5, 4, 6, 6);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(6, 5, 4, 4);
        break;
      }
      // VESPERA LOCKE (ARC-DRONE ARTIFICER) SKILLS & ULTIMATES
      case 'overclockedArmada':
      case 'skill_overclockedArmada': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Concentric dual-ring drone swarm with laser tethers
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(2, 2, 12, 2);
        ctx.fillRect(2, 12, 12, 2);
        ctx.fillRect(2, 4, 2, 8);
        ctx.fillRect(12, 4, 2, 8);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(5, 5, 6, 6);
        ctx.fillStyle = PALETTE.bone;
        // 4 Drone satellites on outer perimeter
        ctx.fillRect(1, 7, 2, 2);
        ctx.fillRect(13, 7, 2, 2);
        ctx.fillRect(7, 1, 2, 2);
        ctx.fillRect(7, 13, 2, 2);
        ctx.fillRect(7, 7, 2, 2);
        break;
      }
      case 'teslaPylon':
      case 'skill_teslaPylon': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Twin copper spire pylons linked by a volt laser tether
        ctx.fillStyle = PALETTE.brass;
        ctx.fillRect(2, 4, 3, 10);
        ctx.fillRect(11, 4, 3, 10);
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(2, 2, 3, 2);
        ctx.fillRect(11, 2, 3, 2);
        ctx.fillRect(5, 6, 6, 2);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(5, 7, 6, 1);
        break;
      }
      case 'seekerSwarm':
      case 'skill_seekerSwarm': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Three winged micro-drones with volt cores
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(2, 3, 4, 3);
        ctx.fillRect(9, 2, 4, 3);
        ctx.fillRect(6, 9, 5, 4);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(3, 4, 2, 1);
        ctx.fillRect(10, 3, 2, 1);
        ctx.fillRect(8, 10, 2, 2);
        break;
      }
      case 'arcDischarge':
      case 'skill_arcDischarge': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Phase-blink lightning ring + electric arc
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(3, 2, 10, 2);
        ctx.fillRect(3, 12, 10, 2);
        ctx.fillRect(2, 4, 2, 8);
        ctx.fillRect(12, 4, 2, 8);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(6, 4, 4, 3);
        ctx.fillRect(5, 7, 5, 2);
        ctx.fillRect(7, 9, 3, 3);
        break;
      }
      case 'orbitalSingularity':
      case 'valkyrieSwarm':
      case 'zenithThunderhead':
      case 'skill_orbitalSingularity': {
        ctx.fillStyle = PALETTE.soot;
        ctx.fillRect(0, 0, 16, 16);
        // Geometric star matrix + vertical ion beam
        ctx.fillStyle = PALETTE.volt;
        ctx.fillRect(2, 10, 12, 3);
        ctx.fillRect(6, 1, 4, 14);
        ctx.fillStyle = PALETTE.bone;
        ctx.fillRect(7, 1, 2, 14);
        ctx.fillRect(4, 11, 8, 1);
        break;
      }
      default: {
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(6, 6, 4, 4);
      }
    }
  }, [itemId]);

  return (
    <canvas
      ref={canvasRef}
      width={16}
      height={16}
      style={{ width: size, height: size }}
      className="pixelated block shrink-0 bg-[#0B0D10] border border-[#3A3F47]"
    />
  );
}

export function getGradeColor(grade) {
  return GRADES[grade]?.color || PALETTE.boneDark;
}
