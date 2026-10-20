import { useEffect, useRef } from 'react';
import { PALETTE } from '../data/config.js';

/**
 * Data-driven Consumable Quick-Slot Definitions
 */
export const QUICK_SUPPLIES = [
  { id: 'gauzeRoll', key: 'Q', label: 'Bloodvine Bandage (+60 HP, Clears Bleed)' },
  { id: 'sugarTin', key: 'F', label: 'Soul-Salt Vial (+30 Stamina)' },
  { id: 'lyeWash', key: 'Z', label: 'Purifying Tincture (Clears Blight & Hellfire)' },
  { id: 'hotStew', key: 'X', label: 'Abyssal Wyrm Broth (+10% Max HP & Regen)' },
  { id: 'stimStick', key: 'C', label: 'Crimson Adrenaline (+20% Move & Attack Speed)' },
];

/**
 * Data-driven Status Icon Map for Boss Affliction Badges
 */
export const STATUS_BADGE_ICONS = {
  burn: '🔥',
  stun: '⚡',
  staggered: '⚡',
  slow: '❄',
  bleed: '🩸',
};

/**
 * Static 10%-segment tick indices for the bottom RPG Experience Bar
 */
export const XP_BAR_TICK_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Pure compass direction calculation from player (px, py) to target (bx, by)
 */
export function getCompassDirectionLabel(px, py, bx, by) {
  const dx = bx - px;
  const dy = by - py;
  if (Math.hypot(dx, dy) < 280) return 'HERE';
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy < 0 ? 'NORTH' : 'SOUTH';
  }
  return dx < 0 ? 'WEST' : 'EAST';
}

/**
 * Data-driven Boss Signature Mechanic bar resolver
 */
const BOSS_MECHANIC_RESOLVERS = {
  foreman: () => ({
    subText: 'KEEP ARRIVALS < 10',
    barPct: 100,
    barColor: '#00F0FF',
  }),
  bigAxle: (mech) => ({
    subText: mech.coreExposed
      ? `CORE HP: ${mech.coreHpPct}% (${mech.coreExposedSec}S)`
      : `HEAT: ${mech.heat}/${mech.maxHeat}`,
    barPct: mech.coreBroken ? 100 : mech.coreExposed ? mech.coreHpPct : mech.heat,
    barColor: mech.coreBroken ? '#4FD6A0' : mech.coreExposed ? '#00F0FF' : '#FFC83D',
  }),
  motherSump: (mech) => ({
    subText: mech.devourActive
      ? `INTERRUPT STAGGER: ${mech.devourStaggerPct}%`
      : `FEEDS DENIED: ${mech.deniedFeeds}/${mech.requiredDeniedFeeds}`,
    barPct: mech.isStarved
      ? 100
      : mech.devourActive
      ? mech.devourStaggerPct
      : Math.round((mech.deniedFeeds / Math.max(1, mech.requiredDeniedFeeds)) * 100),
    barColor: mech.isStarved ? '#4FD6A0' : mech.devourActive ? '#FF3B3B' : '#FFC83D',
  }),
  theLongDry: (mech) => ({
    subText: mech.exposed
      ? `WINDOW: ${mech.exposedSec}S · PLATES: ${mech.segmentsBroken}/${mech.totalSegments}`
      : `PLATES: ${mech.segmentsBroken}/${mech.totalSegments}`,
    barPct: Math.round((mech.segmentsBroken / Math.max(1, mech.totalSegments)) * 100),
    barColor:
      mech.segmentsBroken >= mech.totalSegments
        ? '#4FD6A0'
        : mech.exposed
        ? '#00F0FF'
        : '#FFC83D',
  }),
};

export function resolveBossMechanicDisplay(mech) {
  if (!mech) return null;
  const resolver = BOSS_MECHANIC_RESOLVERS[mech.type];
  if (resolver) {
    return resolver(mech);
  }
  return {
    subText: '',
    barPct: 0,
    barColor: PALETTE.signal,
  };
}

/**
 * Pure helper to classify outgoing player attack damage as 'physical' or 'magical'
 */
const MAGICAL_SKILL_KEYWORDS = [
  'burn',
  'fire',
  'flame',
  'pyro',
  'ember',
  'inferno',
  'boiler',
  'steam',
  'magma',
  'cinder',
  'arc',
  'arcane',
  'volt',
  'pulse',
  'coil',
  'pylon',
  'plasma',
  'storm',
  'cloud',
  'void',
  'blink',
  'magnet',
  'singularity',
  'flux',
  'overload',
  'hex',
  'corrode',
  'acid',
];

export function inferSkillDamageType(skillNameOrId = '', classId = 'sena') {
  const lower = String(skillNameOrId).toLowerCase();
  for (let i = 0; i < MAGICAL_SKILL_KEYWORDS.length; i++) {
    if (lower.includes(MAGICAL_SKILL_KEYWORDS[i])) {
      return 'magical';
    }
  }
  if (classId === 'ines' || classId === 'kaelen' || classId === 'vespera') {
    return 'magical';
  }
  return 'physical';
}

export function inferEnemyHitDamageType(player, statusProc = null, explicitType = null) {
  if (explicitType === 'physical' || explicitType === 'magical') {
    return explicitType;
  }
  const procId = typeof statusProc === 'string' ? statusProc : statusProc?.id;
  if (
    procId === 'burn' ||
    procId === 'corrode' ||
    procId === 'slow' ||
    procId === 'lifted' ||
    procId === 'marked' ||
    procId === 'drawnIn'
  ) {
    return 'magical';
  }
  if (player) {
    if (player.lastAttackDamageType === 'physical' || player.lastAttackDamageType === 'magical') {
      return player.lastAttackDamageType;
    }
    if (player.classId === 'ines' || player.classId === 'kaelen' || player.classId === 'vespera') {
      return 'magical';
    }
  }
  return 'physical';
}

const MAGICAL_ENEMY_IDS = new Set([
  'lyeLeech',
  'lyeStrider',
  'sumpBat',
  'sumpCantor',
  'signalMite',
  'motherSump',
  'bigAxle',
  'relayColossus',
  'screechChoir',
  'brineMaw',
]);

const MAGICAL_SPECIAL_TYPES = new Set([
  'acidSpit',
  'cantorPulse',
  'suctionDrain',
  'overclockBroadcast',
  'furnaceAirstrike',
]);

export function inferIncomingPlayerDamageType(sourceEntity = null, statusToApply = null, explicitType = null) {
  if (explicitType === 'physical' || explicitType === 'magical') {
    return explicitType;
  }
  const procId = typeof statusToApply === 'string' ? statusToApply : statusToApply?.id;
  if (procId === 'burn' || procId === 'corrode' || procId === 'slow' || procId === 'choked') {
    return 'magical';
  }
  if (sourceEntity) {
    if (MAGICAL_ENEMY_IDS.has(sourceEntity.id) || MAGICAL_SPECIAL_TYPES.has(sourceEntity.specialType)) {
      return 'magical';
    }
    const lowerName = (sourceEntity.name || '').toLowerCase();
    if (
      lowerName.includes('boiler') ||
      lowerName.includes('torch') ||
      lowerName.includes('hell') ||
      lowerName.includes('lye') ||
      lowerName.includes('sump')
    ) {
      return 'magical';
    }
  }
  return 'physical';
}

/**
 * Reusable custom hook for requestAnimationFrame loops that never tear down
 * when callback props update.
 */
export function useAnimationFrame(callback, enabled = true) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;
    let frameId = null;
    const tick = (timestamp) => {
      callbackRef.current(timestamp);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [enabled]);
}
