import React from 'react';
import { PALETTE, GRADES } from '../data/config.js';

/**
 * 96x96 Pixel-Art Anime Portrait Component for Sena Ibuki
 * Loads directly from /assets/sena_neutral.png, /assets/sena_hurt.png,
 * /assets/sena_determined.png, and /assets/sena_ultimate.png.
 */
export function SenaPortrait({
  expression = 'neutral',
  equipped = {},
  size = 64,
  className = '',
}) {
  const validExp = ['neutral', 'hurt', 'determined', 'ultimate'].includes(expression)
    ? expression
    : expression === 'normal'
    ? 'neutral'
    : 'neutral';
  const src = `/assets/sena_${validExp}.png`;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden bg-[#0B0D10] border-2 ${
        validExp === 'ultimate'
          ? 'border-[#00F0FF]'
          : validExp === 'hurt'
          ? 'border-[#FF3B3B]'
          : 'border-[#3A3F47]'
      } ${className}`}
      data-equipped={JSON.stringify(equipped)}
    >
      <img
        src={src}
        alt={`Sena Ibuki (${validExp})`}
        width={size}
        height={size}
        className="pixelated block w-full h-full object-cover"
      />
    </div>
  );
}

const ICON_ASSET_MAP = {
  // Skills
  lunge: '/assets/icon_skill_lunge.png',
  skill_lunge: '/assets/icon_skill_lunge.png',
  groundBreak: '/assets/icon_skill_ground_break.png',
  skill_groundBreak: '/assets/icon_skill_ground_break.png',
  railSpike: '/assets/icon_skill_rail_spike.png',
  skill_railSpike: '/assets/icon_skill_rail_spike.png',
  sevenCuts: '/assets/icon_skill_seven_cuts.png',
  skill_sevenCuts: '/assets/icon_skill_seven_cuts.png',
  locked: '/assets/icon_skill_locked.png',

  // Items (both camelCase and snake_case)
  weldingGoggles: '/assets/icon_item_welding_goggles.png',
  welding_goggles: '/assets/icon_item_welding_goggles.png',
  surplusRespirator: '/assets/icon_item_surplus_respirator.png',
  surplus_respirator: '/assets/icon_item_surplus_respirator.png',
  ridersHelmet: '/assets/icon_item_riders_helmet.png',
  riders_helmet: '/assets/icon_item_riders_helmet.png',
  patchedVest: '/assets/icon_item_patched_vest.png',
  patched_vest: '/assets/icon_item_patched_vest.png',
  riotJacket: '/assets/icon_item_riot_jacket.png',
  riot_jacket: '/assets/icon_item_riot_jacket.png',
  plateCoat: '/assets/icon_item_plate_coat.png',
  plate_coat: '/assets/icon_item_plate_coat.png',
  workBoots: '/assets/icon_item_work_boots.png',
  work_boots: '/assets/icon_item_work_boots.png',
  courierLeggings: '/assets/icon_item_courier_leggings.png',
  courier_leggings: '/assets/icon_item_courier_leggings.png',
  hydraulicShins: '/assets/icon_item_hydraulic_shins.png',
  hydraulic_shins: '/assets/icon_item_hydraulic_shins.png',
  gauzeRoll: '/assets/icon_item_gauze_roll.png',
  gauze_roll: '/assets/icon_item_gauze_roll.png',
  sugarTin: '/assets/icon_item_sugar_tin.png',
  sugar_tin: '/assets/icon_item_sugar_tin.png',

  // Slot placeholders & UI
  head: '/assets/icon_item_welding_goggles.png',
  body: '/assets/icon_item_patched_vest.png',
  legs: '/assets/icon_item_work_boots.png',
  coin: '/assets/ui_coin.png',
};

/**
 * 32x32 Manifest-Loaded Pixel Icon for Skills, Equipment, Supplies, and Coins.
 * Adds code-drawn grade frame color (Scrap grey, Salvaged teal, Relic brass).
 */
export function PixelIcon({
  iconType,
  itemId,
  skillId,
  grade = 'Scrap',
  size = 32,
  className = '',
}) {
  const key = iconType || itemId || skillId || 'head';
  const src = ICON_ASSET_MAP[key] || '/assets/icon_item_patched_vest.png';
  const borderColor = getGradeColor(grade);

  if (key === 'coin') {
    return (
      <img
        src="/assets/ui_coin.png"
        alt="Gold Coin"
        width={size}
        height={size}
        className={`pixelated inline-block shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderColor,
      }}
      className={`relative inline-block shrink-0 border-2 bg-[#0B0D10] overflow-hidden ${className}`}
    >
      <img
        src={src}
        alt={key}
        width={size}
        height={size}
        className="pixelated block w-full h-full"
      />
    </div>
  );
}

/**
 * 128x12 Pixel Bar Component using /assets/ui_bar_hp.png, ui_bar_stamina.png, ui_bar_xp.png
 * (2 frames: frame 0 = empty frame at [0..128], frame 1 = fill bar at [128..256]).
 */
export function PixelBar({ kind = 'hp', ratio = 1, width = 128, height = 12 }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const assetUrl =
    kind === 'hp'
      ? '/assets/ui_bar_hp.png'
      : kind === 'stamina'
      ? '/assets/ui_bar_stamina.png'
      : '/assets/ui_bar_xp.png';

  return (
    <div
      style={{ width, height }}
      className="relative overflow-hidden bg-[#0B0D10] select-none"
    >
      {/* Frame 0: Bar Empty Background */}
      <div
        className="pixelated absolute inset-0"
        style={{
          backgroundImage: `url(${assetUrl})`,
          backgroundSize: `${width * 2}px ${height}px`,
          backgroundPosition: '0px 0px',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Frame 1: Clipped Fill Mask */}
      <div
        className="pixelated absolute top-0 left-0 bottom-0 overflow-hidden transition-[width] duration-75"
        style={{ width: `${Math.round(clamped * 100)}%` }}
      >
        <div
          className="pixelated"
          style={{
            width,
            height,
            backgroundImage: `url(${assetUrl})`,
            backgroundSize: `${width * 2}px ${height}px`,
            backgroundPosition: `-${width}px 0px`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>
    </div>
  );
}

export function getGradeColor(grade) {
  if (grade === 'Relic') return GRADES.Relic.color;
  if (grade === 'Salvaged') return GRADES.Salvaged.color;
  return PALETTE.bone;
}
