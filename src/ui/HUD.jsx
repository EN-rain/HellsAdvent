import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PALETTE,
  WORLD_CONFIG,
  ENEMIES_CONFIG,
} from '../data/config.js';
import { CharacterPortrait, PixelIcon, StatusIcon } from './PixelWidgets.jsx';
import { sound } from '../game/Audio.js';
import { QuestTracker } from './QuestTracker.jsx';
import { InteractionPrompt } from './InteractionPrompt.jsx';
import { DUSKHOLLOW_TOWN } from '../data/darkFantasyConfig.js';
import {
  QUICK_SUPPLIES,
  STATUS_BADGE_ICONS,
  XP_BAR_TICK_INDICES,
  getCompassDirectionLabel,
  resolveBossMechanicDisplay,
  useAnimationFrame,
} from '../utils/hudHelpers.js';

const FLOOR_SECTOR_COLORS = {
  1: ['rgba(35, 40, 48, 0.35)', 'rgba(74, 36, 22, 0.35)', 'rgba(24, 28, 34, 0.35)', 'rgba(20, 43, 40, 0.35)'],
  2: ['rgba(22, 40, 54, 0.35)', 'rgba(28, 51, 71, 0.35)', 'rgba(19, 34, 48, 0.35)', 'rgba(31, 59, 82, 0.35)'],
  3: ['rgba(59, 18, 18, 0.35)', 'rgba(74, 24, 16, 0.35)', 'rgba(46, 13, 13, 0.35)', 'rgba(84, 30, 20, 0.35)'],
  4: ['rgba(20, 43, 29, 0.35)', 'rgba(29, 54, 24, 0.35)', 'rgba(16, 36, 24, 0.35)', 'rgba(36, 61, 29, 0.35)'],
  5: ['rgba(31, 18, 53, 0.35)', 'rgba(42, 22, 71, 0.35)', 'rgba(23, 13, 41, 0.35)', 'rgba(52, 28, 89, 0.35)'],
};

function drawDiamond(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();
}

/**
 * Shared Reusable Progress Bar Component with optional delayed damage-trail bar and explicit CSS gradient support.
 */
const StatProgressBar = memo(function StatProgressBar({
  pct,
  trailPct,
  trailClassName = 'bg-[#FFC83D]/75',
  containerClassName = 'relative h-4 w-full bg-[#161A20] border border-[#3A3F47] overflow-hidden',
  fillClassName = 'h-full transition-[width,background-color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
  fillColor,
  fillBackground,
  children,
}) {
  const clampedPct = Math.max(0, Math.min(100, Number(pct) || 0));
  const clampedTrail =
    trailPct !== undefined ? Math.max(clampedPct, Math.min(100, Number(trailPct) || 0)) : null;

  const prevPctRef = useRef(clampedPct);
  const [deltaMode, setDeltaMode] = useState(null);

  useEffect(() => {
    const diff = clampedPct - prevPctRef.current;
    prevPctRef.current = clampedPct;
    if (Math.abs(diff) < 0.25) return undefined;

    setDeltaMode(diff > 0 ? 'replenish' : 'deplete');
    const timer = setTimeout(() => {
      setDeltaMode(null);
    }, 260);
    return () => clearTimeout(timer);
  }, [clampedPct]);

  return (
    <div className={containerClassName}>
      {clampedTrail !== null && clampedTrail > clampedPct && (
        <div
          className={`absolute top-0 bottom-0 left-0 ${trailClassName} transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none`}
          style={{ width: `${clampedTrail}%` }}
        />
      )}
      <div
        className={`relative ${fillClassName} ${
          deltaMode === 'replenish'
            ? 'brightness-115 duration-300'
            : deltaMode === 'deplete'
            ? 'brightness-110 duration-150'
            : ''
        }`}
        style={{
          width: `${clampedPct}%`,
          ...(fillColor ? { backgroundColor: fillColor } : null),
          ...(fillBackground ? { background: fillBackground } : null),
        }}
      >
        {/* Subtle top bevel sheen for depth */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-white/20 to-transparent" />
        {/* Fluid leading-edge pulse on value change */}
        {clampedPct > 1 && clampedPct < 99.8 && (
          <div
            className={`pointer-events-none absolute top-0 bottom-0 right-0 w-1.5 transition-opacity duration-200 ${
              deltaMode === 'replenish'
                ? 'bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.85)] opacity-100'
                : deltaMode === 'deplete'
                ? 'bg-[#FFC83D]/90 shadow-[0_0_6px_rgba(255,200,61,0.8)] opacity-95'
                : 'bg-white/30 opacity-50'
            }`}
          />
        )}
      </div>
      {children}
    </div>
  );
});

/**
 * Shared Reusable Pip Row Component for Class Mechanics (Momentum, Magazine, Scrap Orbit, Arc-Drones)
 */
const PipRow = memo(function PipRow({ count, itemClassName, getPipStyle }) {
  return (
    <>
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} className={itemClassName} style={getPipStyle(idx)} />
      ))}
    </>
  );
});

/**
 * Transparent Glassmorphic Top-Right Minimap
 * - On Floor 0 (Duskhollow Town), uses a dedicated Town Zoom Viewport (world 2420..3580)
 *   so all 6 RPG Master buildings, the Sanctuary Well, and the Spire Gatehouse spread cleanly
 *   across the 140x140 canvas without overlapping labels.
 * - On Floors 1-5 (Abyssal Spire), supports 1x (Full Floor) and 2x (Local Radar) zoom modes.
 */
const Minimap = memo(function Minimap({
  playerX,
  playerY,
  defeatedBosses,
  accentColor,
  currentFloor,
  worldLedger,
}) {
  const canvasRef = useRef(null);
  const [hoveredPoi, setHoveredPoi] = useState(null);
  const [radarZoom, setRadarZoom] = useState(1);
  const poisRef = useRef([]);
  const propsRef = useRef({
    playerX,
    playerY,
    defeatedBosses,
    accentColor,
    currentFloor,
    worldLedger,
    radarZoom,
  });
  propsRef.current = {
    playerX,
    playerY,
    defeatedBosses,
    accentColor,
    currentFloor,
    worldLedger,
    radarZoom,
  };

  useAnimationFrame(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const {
      playerX: curPlayerX,
      playerY: curPlayerY,
      defeatedBosses: curDefeatedBosses,
      accentColor: curAccentColor,
      currentFloor: curFloor,
      worldLedger: curLedger,
      radarZoom: curZoom,
    } = propsRef.current;

    const size = 140;
    const now = Date.now();
    const pois = [];

    // Coordinate projection helper:
    // In Town (Floor 0), zoom into the Duskhollow Sanctuary bounds (2420..3580) so all buildings are clearly separated.
    // In Tower (Floors 1-5), support 1x (full 6000x6000 floor) or 2x (3000x3000 centered on player).
    const isTown = curFloor === 0;
    const span = isTown ? 1160 : WORLD_CONFIG.size / (curZoom || 1);
    const minWorldX = isTown
      ? 2420
      : curZoom > 1
      ? Math.max(0, Math.min(WORLD_CONFIG.size - span, curPlayerX - span / 2))
      : 0;
    const minWorldY = isTown
      ? 2420
      : curZoom > 1
      ? Math.max(0, Math.min(WORLD_CONFIG.size - span, curPlayerY - span / 2))
      : 0;

    const toMiniX = (wx) => ((wx - minWorldX) / span) * size;
    const toMiniY = (wy) => ((wy - minWorldY) / span) * size;
    const scale = size / span;

    // 1. Transparent glass clearing
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(11, 13, 16, 0.55)';
    ctx.fillRect(0, 0, size, size);

    // Subtle compass crosshairs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    if (isTown) {
      // FLOOR 0: DUSKHOLLOW TOWN SAFE HAVEN (Zoomed Town Map)
      const cx = toMiniX(3000);
      const cy = toMiniY(3000);

      // Cobblestone North-South & East-West avenues
      ctx.fillStyle = 'rgba(46, 40, 58, 0.75)';
      ctx.fillRect(cx - 7, 10, 14, size - 20);
      ctx.fillRect(10, cy - 6, size - 20, 12);

      // Central Sanctuary Plaza Circle
      ctx.fillStyle = 'rgba(37, 32, 48, 0.85)';
      ctx.strokeStyle = 'rgba(255, 200, 61, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Central Sanctuary Well
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      pois.push({ x: cx, y: cy, name: 'Sanctuary Well (Full Restore)', label: 'WELL', color: '#38bdf8' });

      // Top-Center Abyssal Spire Gatehouse (3000, 2560)
      const towerObj =
        DUSKHOLLOW_TOWN.abyssalTower ||
        DUSKHOLLOW_TOWN.towerEntrance ||
        DUSKHOLLOW_TOWN.towerGatehouse ||
        { x: 3000, y: 2560 };
      const sx = Math.round(toMiniX(towerObj?.x || 3000));
      const sy = Math.round(toMiniY(towerObj?.y || 2560));

      const spirePulse = (now / 260) % 4;
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sx, sy, 6 + spirePulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#c084fc';
      drawDiamond(ctx, sx, sy, 5.5);
      ctx.fillStyle = '#ffffff';
      drawDiamond(ctx, sx, sy, 2);

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SPIRE', sx, sy - 8);

      pois.push({ x: sx, y: sy, name: 'Abyssal Spire Gatehouse', label: 'PORTAL', color: '#c084fc' });

      // 6 RPG Town NPC Buildings & Masters (now cleanly spaced across the Town map!)
      const shortLabels = {
        runesmith_forge: 'FORGE',
        alchemist_apothecary: 'APOTH',
        hunters_guild: 'GUILD',
        arcane_sanctum: 'SANCTUM',
        ravens_rest_tavern: 'TAVERN',
        mystic_enchanter: 'CURIOS',
      };

      for (const b of DUSKHOLLOW_TOWN.buildings) {
        const bx = Math.round(toMiniX(b.x));
        const by = Math.round(toMiniY(b.y));
        const bCol = b.accentColor || b.roofTrim || PALETTE.brass;

        ctx.fillStyle = '#0B0D10';
        ctx.fillRect(bx - 4, by - 4, 8, 8);
        ctx.fillStyle = bCol;
        ctx.fillRect(bx - 3, by - 3, 6, 6);

        if (b.id === 'hunters_guild') {
          const malPulse = (now / 300) % 3.5;
          ctx.strokeStyle = '#FFC83D';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, by, 5 + malPulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        const tag = shortLabels[b.id];
        if (tag) {
          ctx.fillStyle = bCol;
          ctx.font = 'bold 6px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(tag, bx, by - 6);
        }

        pois.push({
          x: bx,
          y: by,
          name: `${b.npcName || b.name} (${b.name})`,
          label: b.npcTitle || 'Master',
          color: bCol,
        });
      }
    } else {
      // FLOORS 1-5: ABYSSAL SPIRE REALMS
      const cols = FLOOR_SECTOR_COLORS[curFloor] || FLOOR_SECTOR_COLORS[1];

      ctx.fillStyle = cols[0];
      ctx.fillRect(24, 0, size - 48, 52);
      ctx.fillStyle = cols[1];
      ctx.fillRect(24, size - 52, size - 48, 52);
      ctx.fillStyle = cols[2];
      ctx.fillRect(0, 24, 52, size - 48);
      ctx.fillStyle = cols[3];
      ctx.fillRect(size - 52, 24, 52, size - 48);

      // Crossroad paths
      const midX = toMiniX(3000);
      const midY = toMiniY(3000);
      ctx.fillStyle = 'rgba(43, 48, 56, 0.65)';
      ctx.fillRect(midX - 3, 0, 6, size);
      ctx.fillRect(0, midY - 3, size, 6);

      // Wandering Merchants & Mob-Repellent Wards
      const merchants = curLedger?.wanderingMerchants || [];
      for (const m of merchants) {
        if (!m || m.state === 'FLED' || m.state === 'fled') continue;
        const mx = Math.round(toMiniX(m.x));
        const my = Math.round(toMiniY(m.y));
        if (mx < -10 || mx > size + 10 || my < -10 || my > size + 10) continue;

        if (m.repellentActive) {
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(5, Math.round((m.wardRadius || m.repellentRadius || 260) * scale)), 0, Math.PI * 2);
          ctx.stroke();
        }
        const isDef = m.state === 'DEFENDING' || m.state === 'defending';
        ctx.fillStyle = isDef ? '#FF3B3B' : '#34d399';
        ctx.fillRect(mx - 3, my - 3, 6, 6);

        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MERCHANT', mx, my - 5);

        pois.push({
          x: mx,
          y: my,
          name: `${m.name || 'Morwen'} (Caravan)`,
          label: isDef ? 'DEFENDING' : 'MERCHANT',
          color: isDef ? '#FF3B3B' : '#34d399',
        });
      }

      // Dual Portals (Ascent Portal & Town Return Portal)
      const portals = curLedger?.floorPortals;
      if (portals && portals.spawned) {
        if (portals.ascentPortal) {
          const px = Math.round(toMiniX(portals.ascentPortal.x));
          const py = Math.round(toMiniY(portals.ascentPortal.y));
          const ascPulse = (now / 220) % 5;
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px, py, 6 + ascPulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#c084fc';
          drawDiamond(ctx, px, py, 6);
          ctx.fillStyle = '#ffffff';
          drawDiamond(ctx, px, py, 2.5);

          ctx.fillStyle = '#c084fc';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('ASCENT', px, py - 7);

          pois.push({
            x: px,
            y: py,
            name: `Ascent Portal (FL ${portals.ascentPortal.targetFloor || 2})`,
            label: 'ASCENT',
            color: '#c084fc',
          });
        }

        if (portals.townPortal) {
          const tx = Math.round(toMiniX(portals.townPortal.x));
          const ty = Math.round(toMiniY(portals.townPortal.y));
          const tPulse = (now / 260) % 4;
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(tx, ty, 6 + tPulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('TOWN', tx, ty - 7);

          pois.push({
            x: tx,
            y: ty,
            name: 'Return to Town Portal',
            label: 'TOWN',
            color: '#34d399',
          });
        }
      }

      // 4 Fixed Boss Arenas
      const chains = curLedger?.floorSectorChains?.[curFloor] || {};
      for (const boss of Object.values(ENEMIES_CONFIG.bosses)) {
        const bx = Math.round(toMiniX(boss.arenaCenter.x));
        const by = Math.round(toMiniY(boss.arenaCenter.y));
        if (bx < -8 || bx > size + 8 || by < -8 || by > size + 8) continue;

        const ch = chains[boss.areaId];
        const isCleared = ch ? ch.cleared : curDefeatedBosses && curDefeatedBosses[boss.id];
        const bossCol = isCleared
          ? '#34d399'
          : ch?.stage === 3
          ? '#c084fc'
          : ch?.stage === 2
          ? '#FFC83D'
          : PALETTE.blood;

        ctx.fillStyle = bossCol;
        ctx.fillRect(bx - 3.5, by - 3.5, 7, 7);
        ctx.strokeStyle = '#0B0D10';
        ctx.strokeRect(bx - 3.5, by - 3.5, 7, 7);

        pois.push({
          x: bx,
          y: by,
          name: `${boss.name} (${boss.areaName})`,
          label: isCleared ? 'CLEARED' : 'BOSS ARENA',
          color: bossCol,
        });
      }
    }

    // Player Position Dot with radar pulse ping
    const px = Math.max(5, Math.min(size - 5, Math.round(toMiniX(curPlayerX))));
    const py = Math.max(5, Math.min(size - 5, Math.round(toMiniY(curPlayerY))));

    const pPulse = (now / 220) % 5;
    ctx.strokeStyle = curAccentColor || PALETTE.signal;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(px, py, 4.5 + pPulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = '#0B0D10';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = curAccentColor || PALETTE.signal;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

    poisRef.current = pois;
  });

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (140 / rect.width);
    const my = (e.clientY - rect.top) * (140 / rect.height);

    let nearest = null;
    let minDist = 12;
    for (const pt of poisRef.current) {
      const d = Math.hypot(mx - pt.x, my - pt.y);
      if (d < minDist) {
        minDist = d;
        nearest = pt;
      }
    }
    setHoveredPoi((prev) => {
      if (!prev && !nearest) return null;
      if (prev && nearest && prev.name === nearest.name && prev.label === nearest.label) {
        return prev;
      }
      return nearest;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredPoi(null);
  }, []);

  const handleToggleZoom = useCallback(() => {
    sound.playUiClick?.();
    setRadarZoom((z) => (z === 1 ? 2 : 1));
  }, []);

  return (
    <div
      data-hud-interactive="true"
      className="relative pointer-events-auto bg-[#0B0D10]/70 backdrop-blur-md border border-[#3A3F47]/85 rounded-xs p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.75)] select-none transition-colors hover:border-[#00F0FF]/50 font-mono"
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={140}
          height={140}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={currentFloor > 0 ? handleToggleZoom : undefined}
          className="pixelated block cursor-crosshair rounded-xs"
          title={currentFloor > 0 ? 'Click to toggle 1x / 2x Radar Zoom' : 'Duskhollow Sanctuary Map'}
        />

        {/* Cardinal Compass Ticks */}
        <span className="pointer-events-none absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#9E9789]/70">
          N
        </span>
        <span className="pointer-events-none absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-[#9E9789]/70">
          S
        </span>
        <span className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-black text-[#9E9789]/70">
          W
        </span>
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-black text-[#9E9789]/70">
          E
        </span>

        {currentFloor > 0 && (
          <button
            onClick={handleToggleZoom}
            className="absolute top-1 right-1 px-1 py-0 bg-[#0B0D10]/85 border border-[#3A3F47] hover:border-[#00F0FF] text-[8px] font-bold text-[#D9D2C3] cursor-pointer"
            title="Toggle Minimap Zoom"
          >
            {radarZoom}x
          </button>
        )}
      </div>

      {hoveredPoi && (
        <div
          className="absolute -bottom-7 right-0 left-0 bg-[#0B0D10]/95 border px-1.5 py-0.5 text-center text-[9px] font-black truncate shadow-lg z-20 pointer-events-none"
          style={{ borderColor: hoveredPoi.color, color: hoveredPoi.color }}
        >
          {hoveredPoi.label}: {hoveredPoi.name}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between text-[8px] text-[#D9D2C3]/85 font-bold px-0.5">
        {currentFloor === 0 ? (
          <>
            <span className="text-[#c084fc]">SPIRE</span>
            <span className="text-[#FF5A26]">FORGE</span>
            <span className="text-[#FFC83D]">GUILD</span>
            <span className="text-[#2EE6A8]">APOTH</span>
          </>
        ) : (
          <>
            <span className="text-[#c084fc]">ASCENT</span>
            <span className="text-[#34d399]">TOWN</span>
            <span className="text-[#FFC83D]">MERCHANT</span>
          </>
        )}
      </div>
    </div>
  );
});

/**
 * Memoized Quick-Action Icon Dock positioned right next to the Minimap
 */
const QuickActionIconDock = memo(function QuickActionIconDock({
  engine,
  skillPoints,
  readyQuestCount,
  currentFloor,
}) {
  return (
    <div
      data-hud-interactive="true"
      className="pointer-events-auto grid grid-cols-2 gap-1.5 bg-[#0B0D10]/70 backdrop-blur-md border border-[#3A3F47]/85 p-1.5 rounded-xs shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
    >
      {/* [I] GEAR ICON */}
      <button
        onClick={() => engine.setUiState('inventory')}
        className="group relative flex items-center justify-center w-10 h-10 bg-[#14181F]/90 border border-[#3A3F47] hover:border-[#00F0FF] hover:bg-[#1B222C] text-[#D9D2C3] hover:text-[#00F0FF] transition-all cursor-pointer"
        title="Gear & Inventory [I]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3L4 7v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V7l-8-4z" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        <span className="absolute bottom-0.5 right-1 text-[8px] font-black text-[#9E9789] group-hover:text-[#00F0FF]">
          I
        </span>
      </button>

      {/* [K] SKILLS ICON */}
      <button
        onClick={() => engine.setUiState('skills')}
        className={`group relative flex items-center justify-center w-10 h-10 bg-[#14181F]/90 border transition-all cursor-pointer ${
          skillPoints > 0
            ? 'border-[#00F0FF] text-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
            : 'border-[#3A3F47] text-[#D9D2C3] hover:border-[#00F0FF] hover:text-[#00F0FF]'
        }`}
        title={`Skills & Mastery [K]${skillPoints > 0 ? ` (+${skillPoints} SP)` : ''}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
        <span className="absolute bottom-0.5 right-1 text-[8px] font-black text-[#9E9789] group-hover:text-[#00F0FF]">
          K
        </span>
        {skillPoints > 0 && (
          <span className="absolute -top-1 -left-1 px-1 py-0 text-[8px] font-black bg-[#00F0FF] text-[#0B0D10] leading-tight rounded-xs tabular-nums">
            +{skillPoints}
          </span>
        )}
      </button>

      {/* [J] QUESTS ICON */}
      <button
        onClick={() => engine.setUiState('quests')}
        className={`group relative flex items-center justify-center w-10 h-10 border transition-all cursor-pointer ${
          readyQuestCount > 0
            ? 'bg-[#231B12]/95 border-[#FFC83D] text-[#FFC83D] shadow-[0_0_10px_rgba(255,200,61,0.35)]'
            : 'bg-[#14181F]/90 border-[#3A3F47] text-[#D9D2C3] hover:border-[#FFC83D] hover:text-[#FFC83D]'
        }`}
        title={`Quest Journal & Contracts [J]${readyQuestCount > 0 ? ` (${readyQuestCount} Ready to Claim!)` : ''}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
        <span className="absolute bottom-0.5 right-1 text-[8px] font-black text-[#9E9789] group-hover:text-[#FFC83D]">
          J
        </span>
        {readyQuestCount > 0 && (
          <span className="absolute -top-1 -left-1 px-1 py-0 text-[8px] font-black bg-[#FFC83D] text-[#0B0D10] leading-tight rounded-xs tabular-nums">
            !{readyQuestCount}
          </span>
        )}
      </button>

      {/* SPIRE & BLOODLINES ICON */}
      <button
        onClick={() => engine.setUiState('harlow')}
        className="group relative flex items-center justify-center w-10 h-10 bg-[#1A1326]/90 border border-[#c084fc]/80 hover:border-[#FFC83D] text-[#c084fc] hover:text-[#FFC83D] transition-all cursor-pointer"
        title="Spire & Bloodlines — Floor Travel & Boss Hierarchy"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L7 9h10l-5-7z" />
          <path d="M8 9l-2 11h12L16 9" />
          <path d="M4 20h16" />
        </svg>
        <span className="absolute bottom-0.5 right-1 text-[7px] font-black text-[#c084fc] group-hover:text-[#FFC83D]">
          SP
        </span>
      </button>

      {/* TOWN PORTAL ICON */}
      <button
        onClick={() => {
          if (currentFloor > 0) {
            engine.travelToFloor(0);
          } else {
            engine.setUiState('harlow');
          }
        }}
        className={`group relative flex items-center justify-center w-10 h-10 border transition-all cursor-pointer ${
          currentFloor > 0
            ? 'bg-[#122620]/90 border-[#34d399] text-[#34d399] hover:bg-[#19382F] hover:border-[#A7F3D0]'
            : 'bg-[#14181F]/75 border-[#3A3F47] text-[#34d399]/80 hover:border-[#34d399] hover:text-[#34d399]'
        }`}
        title={
          currentFloor > 0
            ? 'Town Portal — Return to Duskhollow Safe Haven'
            : 'In Duskhollow Town — Click to Open Spire Gate Travel'
        }
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span className="absolute bottom-0.5 right-1 text-[7px] font-black text-[#34d399]">
          TP
        </span>
      </button>

      {/* [~] DEV CONSOLE ICON */}
      <button
        onClick={() => engine.setUiState('dev')}
        className="group relative flex items-center justify-center w-10 h-10 bg-[#25102E]/90 border border-[#C042FF]/80 hover:border-[#00F0FF] hover:bg-[#3B154A] text-[#ECA6FF] hover:text-white transition-all cursor-pointer"
        title="Dev Cheats & Sandbox Settings [~ or F2]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <span className="absolute bottom-0.5 right-1 text-[8px] font-black text-[#ECA6FF]">
          ~
        </span>
      </button>
    </div>
  );
});

const StatusSlotBox = memo(function StatusSlotBox({ st, onHover }) {
  const borderCol = st.isBuff ? PALETTE.signal : PALETTE.blood;
  const elapsedPct =
    st.duration && st.duration < 9000
      ? Math.max(0, Math.min(1, 1 - st.remaining / st.duration))
      : 0;
  const showSeconds = st.remaining && st.remaining > 0 && st.remaining < 900;

  return (
    <div
      onMouseEnter={() => onHover(st)}
      onMouseLeave={() => onHover(null)}
      className="relative flex items-center gap-1 px-1.5 py-0.5 bg-[#12161D] cursor-help"
      style={{ border: `1px solid ${borderCol}` }}
      title={st.tooltip}
    >
      <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
        <StatusIcon statusId={st.id} size={13} />
        {elapsedPct > 0 && (
          <div
            className="absolute top-0 left-0 right-0 bg-[#0B0D10]/65 pointer-events-none"
            style={{ height: `${Math.round(elapsedPct * 100)}%` }}
          />
        )}
      </div>

      <span
        className="text-[9px] font-bold uppercase tracking-tight whitespace-nowrap"
        style={{ color: borderCol }}
      >
        {st.name || st.id}
      </span>

      {st.stacks > 1 && (
        <span className="text-[8px] font-black text-white tabular-nums">
          ×{st.stacks}
        </span>
      )}

      {showSeconds && (
        <span className="text-[8px] font-mono text-[#9E9789] tabular-nums">
          {Math.ceil(st.remaining)}s
        </span>
      )}
    </div>
  );
});

const ClassMechanicBar = memo(function ClassMechanicBar({ mech, accentColor, engine }) {
  if (!mech) return null;

  if (mech.type === 'momentum') {
    const isRedline = mech.redline;
    const activeCol = isRedline ? PALETTE.blood : accentColor;
    return (
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold tracking-wider text-[#9E9789]">
            {isRedline ? 'REDLINE' : 'MOMENTUM'}
          </span>
          <div className="flex items-center gap-1 ml-1">
            <PipRow
              count={mech.maxStacks || 5}
              itemClassName="w-3.5 h-2 border"
              getPipStyle={(idx) => {
                const active = idx < mech.stacks;
                return {
                  borderColor: active ? activeCol : '#3A3F47',
                  backgroundColor: active ? activeCol : '#0B0D10',
                };
              }}
            />
          </div>
        </div>
        {engine.player.hasNode('brace') && (
          <span
            className="text-[9px] font-bold px-1 border"
            style={{
              borderColor: mech.guarding ? PALETTE.signal : '#3A3F47',
              color: mech.guarding ? PALETTE.signal : '#9E9789',
            }}
          >
            [V] GUARD {mech.guarding ? 'ON' : 'OFF'}
          </span>
        )}
      </div>
    );
  }

  if (mech.type === 'magazine') {
    if (mech.reloading) {
      const pct = Math.max(0, Math.min(100, mech.reloadProgress * 100));
      return (
        <div className="space-y-0.5 pt-0.5">
          <div className="flex items-center justify-between text-[9px] font-bold">
            <span className="text-[#FFC83D]">
              RELOADING · PRESS [LMB / V] IN BRASS ZONE
            </span>
          </div>
          <div className="relative h-2.5 w-full bg-[#0B0D10] border border-[#3A3F47]">
            <div
              className="absolute top-0 bottom-0 bg-[#FFC83D]/85"
              style={{
                left: `${(mech.windowStart || 0.35) * 100}%`,
                width: `${((mech.windowEnd || 0.52) - (mech.windowStart || 0.35)) * 100}%`,
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#D9D2C3]"
              style={{ left: `${pct}%` }}
            />
          </div>
        </div>
      );
    }

    const hasLastWord = engine.player.hasNode('lastWord');
    return (
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-[#9E9789]">MAGAZINE</span>
          <div className="flex items-center gap-0.5 ml-1">
            <PipRow
              count={mech.maxBolts || 12}
              itemClassName="w-1.5 h-2.5 border"
              getPipStyle={(idx) => {
                const filled = idx < mech.bolts;
                const isLastShot = idx === 0 && hasLastWord;
                return {
                  borderColor: filled ? PALETTE.brass : '#3A3F47',
                  backgroundColor: filled
                    ? isLastShot
                      ? PALETTE.blood
                      : PALETTE.brass
                    : '#0B0D10',
                };
              }}
            />
          </div>
        </div>
        <span className="text-[9px] font-bold text-[#FFC83D] tabular-nums">
          {mech.bolts}/{mech.maxBolts} [V]
        </span>
      </div>
    );
  }

  if (mech.type === 'scrapOrbit') {
    return (
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-[#9E9789]">SCRAP ORBIT</span>
          <div className="flex items-center gap-1 ml-1">
            <PipRow
              count={mech.maxCount || 6}
              itemClassName="w-2.5 h-2.5 border"
              getPipStyle={(idx) => {
                const active = idx < mech.count;
                return {
                  borderColor: active ? PALETTE.verdigris : '#3A3F47',
                  backgroundColor: active ? PALETTE.verdigris : '#0B0D10',
                };
              }}
            />
          </div>
        </div>
        <span className="text-[9px] font-bold text-[#4FD6A0] tabular-nums">
          +{Math.round(mech.count * 1.5)} DEF
        </span>
      </div>
    );
  }

  if (mech.type === 'boilerPressure') {
    const pct = Math.max(0, Math.min(100, mech.pressure || 0));
    const isRedZone = mech.inRedZone || pct >= 75;
    return (
      <div className="space-y-0.5 pt-0.5">
        <div className="flex items-center justify-between text-[9px] font-bold">
          <span style={{ color: mech.overheated ? '#FFFFFF' : isRedZone ? PALETTE.ember : '#9E9789' }}>
            {mech.overheated
              ? 'OVERHEATED SURGE (+40% ATK)'
              : isRedZone
              ? 'RED GAUGE (+35% SKILL DMG)'
              : 'BOILER PRESSURE'}
          </span>
          <span className="text-[#FF5A26] tabular-nums">
            {pct}% [V] VENT
          </span>
        </div>
        <StatProgressBar
          pct={pct}
          containerClassName="relative h-2.5 w-full bg-[#0B0D10] border border-[#3A3F47]"
          fillClassName="h-full transition-all duration-75"
          fillColor={
            mech.overheated
              ? '#D9D2C3'
              : isRedZone
              ? PALETTE.ember
              : PALETTE.brass
          }
        >
          <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-[#D9D2C3] z-10" />
        </StatProgressBar>
      </div>
    );
  }

  if (mech.type === 'arcSwarm') {
    return (
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-[#9E9789]">ARC-DRONES</span>
          <div className="flex items-center gap-1 ml-1">
            <PipRow
              count={mech.maxDrones || 3}
              itemClassName="w-2.5 h-2.5 border"
              getPipStyle={(idx) => {
                const active = idx < (mech.drones || 0);
                return {
                  borderColor: active ? PALETTE.volt : '#3A3F47',
                  backgroundColor: active
                    ? mech.overcharged
                      ? '#D9D2C3'
                      : PALETTE.volt
                    : '#0B0D10',
                };
              }}
            />
          </div>
        </div>
        <span className="text-[9px] font-bold text-[#C9F24B] tabular-nums">
          PYLONS {mech.pylons || 0}/{mech.maxPylons || 2} · [V] PULSE
        </span>
      </div>
    );
  }

  return null;
});

const SkillTooltip = memo(function SkillTooltip({ skill, accent, inSafeZone, currentStamina }) {
  if (!skill) return null;
  const isUlt = skill.isUlt;
  const onCd = skill.cd > 0.05;
  const lowStam = !isUlt && currentStamina !== undefined && currentStamina < skill.cost;

  return (
    <div
      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none z-50 w-72 sm:w-80 bg-[#0B0D10]/95 border-2 p-3 text-left shadow-[0_8px_32px_rgba(0,0,0,0.95)] backdrop-blur-md select-none"
      style={{ borderColor: accent }}
    >
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0B0D10] border-b-2 border-r-2 rotate-45"
        style={{ borderColor: accent }}
      />

      <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#2B3542]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xs bg-[#161A20] border flex items-center justify-center shrink-0"
            style={{ borderColor: accent }}
          >
            <PixelIcon itemId={skill.icon || 'lunge'} size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black tracking-wide text-[#E3E8E5] truncate">
              {skill.name}
            </div>
            <div
              className="text-[9px] font-bold tracking-wider truncate"
              style={{ color: accent }}
            >
              {skill.category || (isUlt ? 'Ultimate Awakening' : 'Active Technique')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-[#D9D2C3] tabular-nums">
          <span>[{skill.hotkey}]</span>
          {skill.level && (
            <span>
              · L{skill.level}{skill.maxLevel ? `/${skill.maxLevel}` : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 my-2 text-[10px] font-bold">
        {isUlt ? (
          <>
            <span className="text-[#FFC83D]">{skill.cost}</span>
            <span className="text-[#9E9789]">·</span>
            <span className={skill.ultReady ? 'text-[#4FD6A0]' : 'text-[#D9D2C3]'}>
              {skill.ultReady ? 'Ready to Cast' : `${skill.ultPct}% Charged`}
            </span>
          </>
        ) : (
          <>
            <span className="text-[#FFC83D]">
              {skill.cost > 0 ? `${skill.cost} Stamina` : 'No Cost'}
            </span>
            <span className="text-[#9E9789]">·</span>
            <span className="text-[#00F0FF]">
              {skill.maxCd > 0 ? `${skill.maxCd}s Cooldown` : 'Instant'}
            </span>
            {skill.source && (
              <>
                <span className="text-[#9E9789]">·</span>
                <span className="text-[#8C9CA9]">{skill.source}</span>
              </>
            )}
          </>
        )}
      </div>

      {onCd && (
        <div className="mb-2 flex items-center justify-between px-2 py-1 bg-[#FF3B3B]/10 border border-[#FF3B3B]/40 text-[#FF5252] text-[10px] font-bold">
          <span>Recharging</span>
          <span className="tabular-nums font-mono">
            {skill.cd.toFixed(1)}s remaining
          </span>
        </div>
      )}

      {lowStam && !onCd && (
        <div className="mb-2 flex items-center justify-between px-2 py-1 bg-[#FFC83D]/10 border border-[#FFC83D]/40 text-[#FFC83D] text-[10px] font-bold">
          <span>Low Stamina</span>
          <span className="tabular-nums font-mono">
            {currentStamina} / {skill.cost} SP
          </span>
        </div>
      )}

      {inSafeZone && (
        <div className="mb-2 px-2 py-0.5 bg-[#4FD6A0]/10 border border-[#4FD6A0]/30 text-[#4FD6A0] text-[9px] font-bold">
          Safe Haven · Combat Disabled in Town
        </div>
      )}

      <div className="text-xs text-[#D9D2C3] leading-relaxed font-normal">
        {skill.desc || 'No description available for this technique.'}
      </div>

      <div className="mt-2 pt-1.5 border-t border-[#1F2733] flex items-center justify-between text-[9px] text-[#7E8E9B] font-bold">
        <span>{isUlt ? 'Trigger: Key [R]' : `Trigger: Key [${skill.hotkey}]`}</span>
        <span style={{ color: accent }}>Hellsing Arms</span>
      </div>
    </div>
  );
});

/**
 * Memoized Supply Quick-Slot Button
 */
const SupplySlotButton = memo(function SupplySlotButton({ sup, count, accent, onUseSupply }) {
  return (
    <button
      onClick={() => onUseSupply(sup.id)}
      className={`relative flex flex-col items-center justify-center w-11 h-12 bg-[#14181F] border transition-colors cursor-pointer ${
        count > 0
          ? 'border-[#3A3F47] hover:border-[#00F0FF]'
          : 'border-[#252A32] opacity-60 hover:opacity-100 hover:border-[#3A3F47]'
      }`}
      title={sup.label}
    >
      <PixelIcon itemId={sup.id} size={20} />
      <span className="text-[10px] font-bold text-[#D9D2C3] mt-0.5 tabular-nums">
        ×{count}
      </span>
      <span
        className="absolute top-0.5 left-1 text-[8px] font-bold"
        style={{ color: accent }}
      >
        {sup.key}
      </span>
    </button>
  );
});

/**
 * Memoized Combat Skill Button
 */
const AbilitySlotButton = memo(function AbilitySlotButton({
  sk,
  accent,
  stamina,
  inSafeZone,
  isStunned,
  isHovered,
  onHover,
  onUseSkill,
}) {
  const onCd = sk.cd > 0.05;
  const cdRatio = sk.maxCd > 0 ? Math.min(1, sk.cd / sk.maxCd) : 0;
  const lowStam = stamina < sk.cost;

  const skDef = useMemo(
    () => ({
      id: sk.id,
      name: sk.name,
      hotkey: sk.hotkey,
      icon: sk.icon,
      level: sk.level,
      maxLevel: sk.maxLevel,
      cost: sk.cost,
      cd: sk.cd,
      maxCd: sk.maxCd,
      desc: sk.desc,
      source: sk.source || 'Class Art',
      category:
        sk.source === 'Original'
          ? 'Core Class Art'
          : sk.source
          ? `${sk.source} Specialization`
          : 'Active Technique',
    }),
    [sk.id, sk.name, sk.hotkey, sk.icon, sk.level, sk.maxLevel, sk.cost, sk.cd, sk.maxCd, sk.desc, sk.source]
  );

  return (
    <div
      onMouseEnter={() => onHover(sk.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onUseSkill(sk.hotkey)}
      className="relative flex flex-col items-center cursor-pointer group"
    >
      {isHovered && (
        <SkillTooltip
          skill={skDef}
          accent={accent}
          inSafeZone={inSafeZone}
          currentStamina={stamina}
        />
      )}
      <div
        className="relative w-12 h-12 bg-[#14181F] border-2 flex items-center justify-center transition-transform duration-150 group-hover:scale-105"
        style={{
          borderColor: onCd
            ? '#3A3F47'
            : lowStam
            ? PALETTE.rust
            : isHovered
            ? '#00F0FF'
            : accent,
          boxShadow: isHovered ? `0 0 12px ${accent}55` : undefined,
        }}
      >
        <PixelIcon itemId={sk.icon} size={28} />

        {onCd && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#0B0D10]/85 flex items-center justify-center"
            style={{ height: `${cdRatio * 100}%` }}
          >
            <span className="text-xs font-bold text-[#FFC83D] tabular-nums">
              {sk.cd.toFixed(1)}
            </span>
          </div>
        )}

        {isStunned && (
          <div className="absolute inset-0 bg-[#0B1017]/85 border border-[#00F0FF] flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-xs">⚡</span>
            <span className="text-[7px] font-black text-[#00F0FF] tracking-tighter">LOCKED</span>
          </div>
        )}

        <span
          className="absolute top-0.5 left-1 text-[9px] font-bold"
          style={{ color: accent }}
        >
          {sk.hotkey}
        </span>
        <span className="absolute bottom-0.5 right-1 text-[8px] text-[#D9D2C3]/80 tabular-nums">
          L{sk.level}
        </span>
      </div>
      <span
        className={`text-[9px] mt-1 font-medium whitespace-nowrap truncate max-w-[58px] transition-colors ${
          isHovered ? 'text-white font-bold' : 'text-[#D9D2C3]'
        }`}
      >
        {sk.name}
      </span>
    </div>
  );
});

export function HUD({ snapshot, engine }) {
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [hoveredSkillId, setHoveredSkillId] = useState(null);

  // Smooth delayed trails for Player HP, Player Stamina, and Boss HP
  const [playerTrailPct, setPlayerTrailPct] = useState(100);
  const [staminaTrailPct, setStaminaTrailPct] = useState(100);
  const [bossTrailPct, setBossTrailPct] = useState(100);

  const hpPct = snapshot
    ? Math.max(0, Math.min(100, (snapshot.hp / Math.max(1, snapshot.maxHp)) * 100))
    : 100;
  const stamPct = snapshot
    ? Math.max(0, Math.min(100, (snapshot.stamina / Math.max(1, snapshot.maxStamina)) * 100))
    : 100;
  const bossHpPct = snapshot?.activeBoss
    ? Math.max(
        0,
        Math.min(100, (snapshot.activeBoss.hp / Math.max(1, snapshot.activeBoss.maxHp)) * 100)
      )
    : 100;

  useEffect(() => {
    if (hpPct >= playerTrailPct) {
      setPlayerTrailPct(hpPct);
      return undefined;
    }
    const t = setTimeout(() => {
      setPlayerTrailPct(hpPct);
    }, 180);
    return () => clearTimeout(t);
  }, [hpPct, playerTrailPct]);

  useEffect(() => {
    if (stamPct >= staminaTrailPct) {
      setStaminaTrailPct(stamPct);
      return undefined;
    }
    const t = setTimeout(() => {
      setStaminaTrailPct(stamPct);
    }, 140);
    return () => clearTimeout(t);
  }, [stamPct, staminaTrailPct]);

  useEffect(() => {
    if (bossHpPct >= bossTrailPct) {
      setBossTrailPct(bossHpPct);
      return undefined;
    }
    const t = setTimeout(() => {
      setBossTrailPct(bossHpPct);
    }, 180);
    return () => clearTimeout(t);
  }, [bossHpPct, bossTrailPct]);

  const handleOpenQuestModal = useCallback(() => {
    engine.setUiState('quests');
  }, [engine]);

  const handleUseSupply = useCallback(
    (supplyId) => {
      engine.player.useSupply(supplyId, engine.particles);
    },
    [engine]
  );

  const handleUseSkill = useCallback(
    (hotkey) => {
      const slotIdx = parseInt(hotkey, 10) - 1;
      if (!isNaN(slotIdx) && slotIdx >= 0 && slotIdx < 4) {
        engine.player.useSkillByIndex(
          slotIdx,
          engine.keys.worldMouseX,
          engine.keys.worldMouseY,
          engine.spawner,
          engine.projectiles,
          engine.particles,
          engine.camera,
          engine.world,
          engine.triggerHitStop
        );
      }
    },
    [engine]
  );

  const handleUseUltimate = useCallback(() => {
    engine.player.useUltimate(
      engine.keys.worldMouseX,
      engine.keys.worldMouseY,
      engine.spawner,
      engine.projectiles,
      engine.particles,
      engine.camera,
      engine.world,
      engine.settings
    );
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    sound.toggleMute();
    engine.notifyUi();
  }, [engine]);

  const handleOpenPause = useCallback(() => {
    engine.setUiState('pause');
  }, [engine]);

  const statuses = snapshot?.statuses;
  const { buffs, debuffs, stunStatus, burnStatus, slowStatus } = useMemo(() => {
    const list = statuses || [];
    return {
      buffs: list.filter((s) => s.isBuff).slice(0, 6),
      debuffs: list.filter((s) => !s.isBuff).slice(0, 6),
      stunStatus: list.find((s) => s.id === 'stun' || s.id === 'staggered') || null,
      burnStatus: list.find((s) => s.id === 'burn') || null,
      slowStatus: list.find((s) => s.id === 'slow') || null,
    };
  }, [statuses]);

  if (!snapshot) return null;

  const accent = snapshot.accentColor || PALETTE.signal;
  const xpPct =
    snapshot.xpToNext > 0
      ? Math.max(0, Math.min(100, (snapshot.xp / snapshot.xpToNext) * 100))
      : 100;
  const neededCharge = snapshot.ultimateChargeNeeded || 100;
  const ultPct = Math.max(0, Math.min(100, (snapshot.ultimateCharge / neededCharge) * 100));
  const ultReady = snapshot.ultimateCharge >= neededCharge;

  const skillList = snapshot.activeSkillDefs || [];
  const isStunned = Boolean(stunStatus);
  const isBurned = Boolean(burnStatus);
  const isSlowed = Boolean(slowStatus);

  const obj = snapshot.objective;
  const objDir = obj
    ? obj.dir ||
      (obj.boss?.arenaCenter
        ? getCompassDirectionLabel(
            snapshot.x,
            snapshot.y,
            obj.boss.arenaCenter.x,
            obj.boss.arenaCenter.y
          )
        : '')
    : '';
  const objName = obj ? obj.name || obj.boss?.name || '' : '';
  const objDistM = obj ? (obj.boss ? Math.round(obj.dist / 16) : obj.dist) : 0;
  const canPromote = snapshot.canPromoteJourneyman || snapshot.canPromoteMaster;
  const readyQuestCount = snapshot.worldLedger?.questSummary?.readyToClaimCount || 0;
  const bossMechDisplay = resolveBossMechanicDisplay(snapshot.activeBoss?.mechanic);
  const hasAnyStatuses =
    buffs.length > 0 || debuffs.length > 0 || Boolean(snapshot.tavernMeal) || Boolean(snapshot.elixirBuff);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-3.5 select-none">
      {/* Floating In-World Interaction Prompt (Floats above NPCs and Portals in range) */}
      <InteractionPrompt engine={engine} snapshot={snapshot} />

      {/* FULL-SCREEN STATUS FEEDBACK VIGNETTES */}
      {isStunned && (
        <div className="pointer-events-none fixed inset-0 z-0 border-4 border-[#00F0FF]/60 shadow-[inset_0_0_80px_rgba(0,240,255,0.45)]" />
      )}
      {isBurned && (
        <div className="pointer-events-none fixed inset-0 z-0 border-2 border-[#FF6A00]/40 shadow-[inset_0_0_70px_rgba(255,106,0,0.35)]" />
      )}
      {isSlowed && (
        <div className="pointer-events-none fixed inset-0 z-0 border-2 border-[#7CE8FF]/35 shadow-[inset_0_0_55px_rgba(124,232,255,0.25)]" />
      )}

      {/* TOP STATUS ALERTS FEEDBACK BANNER STRIP */}
      {(isStunned || isBurned || isSlowed) && (
        <div className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5">
          {isStunned && (
            <div className="px-3.5 py-1 bg-[#0B121A]/95 border-2 border-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.5)] flex items-center gap-2 text-xs font-black text-[#00F0FF] tracking-wider">
              <span>⚡ STUNNED — CANNOT MOVE OR ACT</span>
              <span className="text-[10px] text-[#A6E8FF] tabular-nums">
                ({stunStatus.remaining.toFixed(1)}s)
              </span>
            </div>
          )}
          {isBurned && (
            <div className="px-3.5 py-1 bg-[#1A0F07]/95 border-2 border-[#FF6A00] shadow-[0_0_16px_rgba(255,106,0,0.45)] flex items-center gap-2 text-xs font-black text-[#FF9E4A] tracking-wider">
              <span>🔥 BURNED — TAKING FIRE DAMAGE</span>
              <span className="text-[10px] text-[#FFD1A4] tabular-nums">
                ({burnStatus.remaining.toFixed(1)}s)
              </span>
              <span className="text-[9px] text-[#FFB67A] font-normal italic">
                · roll to halve time
              </span>
            </div>
          )}
          {isSlowed && (
            <div className="px-3.5 py-1 bg-[#09151C]/95 border-2 border-[#7CE8FF] shadow-[0_0_14px_rgba(124,232,255,0.35)] flex items-center gap-2 text-xs font-black text-[#7CE8FF] tracking-wider">
              <span>❄ SLOWED — MOVEMENT IMPAIRED</span>
              <span className="text-[10px] text-[#C2F4FF] tabular-nums">
                ({slowStatus.remaining.toFixed(1)}s)
              </span>
            </div>
          )}
        </div>
      )}

      {/* TOP PERIMETER CLUSTER */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left: Player Unit Frame + Compact Status Row + Quest Tracker */}
        <div className="flex flex-col gap-1.5 items-start">
          <div
            data-hud-interactive="true"
            className="pointer-events-auto flex items-start gap-3 bg-[#0B0D10]/92 backdrop-blur-md border-2 p-2.5 w-[292px] shadow-[0_6px_24px_rgba(0,0,0,0.75)]"
            style={{ borderColor: '#3A3F47' }}
          >
            <div className="relative shrink-0">
              <CharacterPortrait
                classId={snapshot.classId}
                expression={snapshot.portraitExpression}
                equipped={snapshot.equipped}
                stage={snapshot.stage}
                branch={snapshot.branch}
                size={60}
              />
              <div
                className="absolute -bottom-1 -right-1 bg-[#0B0D10] border px-1.5 py-0.5 text-[10px] font-black tabular-nums"
                style={{ borderColor: accent, color: accent }}
              >
                LV {snapshot.level}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Character Name & Gold */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span
                  className="font-bold tracking-wide truncate"
                  style={{ color: accent }}
                  title={snapshot.fullTitleLine}
                >
                  {snapshot.fullTitleLine}
                </span>
                <span className="font-bold text-[#FFC83D] tabular-nums shrink-0">
                  {snapshot.gold.toLocaleString()} G
                </span>
              </div>

              {/* HP BAR with Smooth Delayed Damage Trail & Fluid Replenishment */}
              <StatProgressBar
                pct={hpPct}
                trailPct={playerTrailPct}
                trailClassName="bg-[#FFC83D]/75"
                containerClassName={`relative h-4 w-full bg-[#161A20] border overflow-hidden transition-[border-color,box-shadow] duration-300 ${
                  hpPct <= 25
                    ? 'border-[#FF3B3B] shadow-[0_0_10px_rgba(255,59,59,0.45)]'
                    : 'border-[#3A3F47]'
                }`}
                fillClassName="h-full bg-[#FF3B3B] transition-[width,background-color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[10px] font-bold text-[#F5F2EB] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tabular-nums">
                  <span>HP · {hpPct <= 25 ? 'CRITICAL' : 'VITALITY'}</span>
                  <span>
                    {snapshot.hp} / {snapshot.maxHp}
                  </span>
                </div>
              </StatProgressBar>

              {/* STAMINA BAR with Fluid Depletion Trail & Replenishment Glide */}
              <StatProgressBar
                pct={stamPct}
                trailPct={staminaTrailPct}
                trailClassName="bg-white/35"
                containerClassName="relative h-3.5 w-full bg-[#161A20] border border-[#3A3F47] overflow-hidden transition-[border-color,box-shadow] duration-300"
                fillClassName="h-full transition-[width,background-color,box-shadow,filter] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                fillColor={accent}
              >
                <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-bold text-[#F5F2EB] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] tabular-nums">
                  <span>STAMINA</span>
                  <span>
                    {snapshot.stamina} / {snapshot.maxStamina}
                  </span>
                </div>
              </StatProgressBar>

              {/* CLASS MECHANIC BAR */}
              <ClassMechanicBar
                mech={snapshot.classMechanic}
                accentColor={accent}
                engine={engine}
              />

              {/* Core Combat Telemetry Strip */}
              <div className="flex items-center justify-between text-[10px] text-[#D9D2C3]/85 pt-0.5 tabular-nums font-mono">
                <span>
                  ATK {snapshot.atk} · DEF {snapshot.def} · SPD {snapshot.speed}
                </span>
                <span className="text-[#FFC83D] font-bold">
                  CRIT {Math.round((snapshot.critChance || 0.08) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* COMPACT STATUS & BUFF STRIP */}
          {hasAnyStatuses && (
            <div
              data-hud-interactive="true"
              className="pointer-events-auto flex flex-col gap-1 bg-[#0B0D10]/90 border border-[#3A3F47] px-2 py-1.5 w-[292px]"
            >
              <div className="flex flex-wrap items-center gap-1">
                {buffs.map((st) => (
                  <StatusSlotBox key={st.id} st={st} onHover={setHoveredStatus} />
                ))}
                {debuffs.map((st) => (
                  <StatusSlotBox key={st.id} st={st} onHover={setHoveredStatus} />
                ))}
                {snapshot.tavernMeal && (
                  <span className="px-1.5 py-0.5 bg-[#122620] border border-[#34d399]/60 text-[9px] font-bold text-[#34d399] tabular-nums">
                    {snapshot.tavernMeal.name} ({Math.ceil(snapshot.tavernMeal.timer)}s)
                  </span>
                )}
                {snapshot.elixirBuff && (
                  <span className="px-1.5 py-0.5 bg-[#1E132B] border border-[#c084fc]/60 text-[9px] font-bold text-[#c084fc] tabular-nums">
                    {snapshot.elixirBuff.name} ({Math.ceil(snapshot.elixirBuff.timer)}s)
                  </span>
                )}
              </div>

              {hoveredStatus && (
                <div className="text-[10px] font-bold text-[#D9D2C3] tabular-nums pt-0.5 border-t border-[#262B33]">
                  {hoveredStatus.tooltip}
                </div>
              )}
            </div>
          )}

          {/* Action RPG Quest Tracker (Positioned on the Left Side) */}
          <QuestTracker
            snapshot={snapshot}
            engine={engine}
            onOpenQuestModal={handleOpenQuestModal}
          />
        </div>

        {/* Top-Center: Active Combat Encounters, Sudden Defense, Tower Hunt Compass & Promotion Banner */}
        <div className="flex flex-col items-center gap-1.5 max-w-xl w-full">
          {snapshot.worldLedger?.activeSuddenQuest && (
            <div className="w-full max-w-lg bg-[#1A0B12]/95 border-2 border-[#FF3B3B] p-2 space-y-1 shadow-[0_0_20px_rgba(255,59,59,0.45)]">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-[#FFC83D]">
                  SUDDEN QUEST: PROTECT MORWEN THE CARAVANER
                </span>
                <span className="text-[#FF3B3B] tabular-nums">
                  {snapshot.worldLedger.activeSuddenQuest.remainingSec.toFixed(1)}s LEFT
                </span>
              </div>
              <StatProgressBar
                pct={
                  (snapshot.worldLedger.activeSuddenQuest.hp /
                    Math.max(1, snapshot.worldLedger.activeSuddenQuest.maxHp)) *
                  100
                }
                containerClassName="relative h-3 w-full bg-[#0B0D10] border border-[#3A3F47]"
                fillClassName="h-full bg-[#34d399] transition-all duration-75"
              >
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#D9D2C3] tabular-nums">
                  MERCHANT HP: {Math.ceil(snapshot.worldLedger.activeSuddenQuest.hp)} / {snapshot.worldLedger.activeSuddenQuest.maxHp}
                </div>
              </StatProgressBar>
            </div>
          )}

          {/* Tower Floor Compass / Portal Alert (Only shown on Tower Floors 1-5 to keep Town view uncluttered) */}
          {snapshot.currentFloor > 0 && (
            snapshot.worldLedger?.floorPortals?.spawned ? (
              <div className="bg-[#0B0D10]/95 border-2 border-[#c084fc] px-3.5 py-1 text-xs text-[#c084fc] font-bold tracking-wide">
                Floor {snapshot.currentFloor} Overlords Slain · Ascent &amp; Town Portals Open [E]
              </div>
            ) : (
              obj && !snapshot.activeBoss && (
                <div className="bg-[#0B0D10]/90 border border-[#3A3F47] px-3.5 py-1 text-xs text-[#D9D2C3] tracking-wide tabular-nums">
                  <span className="text-[#FFC83D] font-bold">
                    Floor {snapshot.currentFloor} Hunt (Stage {obj.stage || 1}/3 · Lv.{obj.recommendedLevel || 5})
                  </span>
                  <span className="text-[#9E9789]"> · </span>
                  <span className="font-bold" style={{ color: accent }}>
                    {objName}
                  </span>
                  <span className="text-[#9E9789]">
                    {' '}
                    · {objDir} ({objDistM}m)
                  </span>
                </div>
              )
            )
          )}

          {canPromote && (
            <button
              data-hud-interactive="true"
              onClick={() => engine.setUiState('harlow')}
              className="pointer-events-auto bg-[#0B0D10]/95 border border-[#FFC83D] hover:bg-[#1E1910] px-3.5 py-1 text-xs font-bold text-[#FFC83D] tracking-wide cursor-pointer transition-colors shadow-sm"
            >
              Bloodline Promotion Available · Click or Visit Hunters Guild [E]
            </button>
          )}

          {/* Large Boss Health Bar + Delayed Damage Trail + Stagger Bar + Signature Mechanic Bar */}
          {snapshot.activeBoss && (
            <div className="w-full bg-[#0B0D10]/95 border-2 border-[#FF3B3B] p-2.5 space-y-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black text-[#c084fc]">
                    Stage {snapshot.activeBoss.bloodlineStage || 1}/3 · {snapshot.activeBoss.bloodlineStageLabel || 'Warden'}
                  </span>
                  <span className="text-[#9E9789]">·</span>
                  <span className="font-bold text-[#FF3B3B] tracking-wider">
                    {snapshot.activeBoss.name}
                  </span>
                  <span className="text-[#9E9789] text-[11px] tabular-nums">
                    (Lv.{snapshot.activeBoss.level || 1}) {snapshot.activeBoss.subtitle}
                  </span>
                  {snapshot.activeBoss.abyssalEnraged && (
                    <span className="text-[10px] font-black text-[#FF9E4A]">
                      · Abyssal Enrage (+10 Lv Gap)
                    </span>
                  )}
                  {snapshot.activeBoss.isRematch && (
                    <span className="text-[10px] font-bold text-[#FFC83D]">
                      · Rematch
                    </span>
                  )}
                </div>
                <span className="text-[#FFC83D] font-bold text-[11px] tabular-nums">
                  Phase {snapshot.activeBoss.phase} / 3
                </span>
              </div>

              <StatProgressBar
                pct={bossHpPct}
                trailPct={bossTrailPct}
                containerClassName="relative h-4 w-full bg-[#161A20] border border-[#3A3F47] overflow-hidden"
                fillClassName="h-full bg-[#FF3B3B] transition-all duration-75"
              >
                <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-[#0B0D10] z-10" />
                <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-[#0B0D10] z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#F5F2EB] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tabular-nums z-10">
                  {snapshot.activeBoss.hp.toLocaleString()} / {snapshot.activeBoss.maxHp.toLocaleString()} ({Math.ceil(bossHpPct)}%)
                </div>
              </StatProgressBar>

              {/* Boss Stagger Meter */}
              <StatProgressBar
                pct={snapshot.activeBoss.staggered ? 100 : snapshot.activeBoss.staggerPct || 0}
                containerClassName="relative h-2.5 w-full bg-[#161A20] border border-[#3A3F47] overflow-hidden"
                fillClassName="h-full bg-[#FFC83D] transition-all duration-75"
              >
                <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-bold text-[#D9D2C3] tabular-nums">
                  <span>STAGGER</span>
                  <span className="text-[#FFC83D]">
                    {snapshot.activeBoss.staggered
                      ? 'STAGGERED (+35% DMG TAKEN)'
                      : `${snapshot.activeBoss.staggerPct || 0}%`}
                  </span>
                </div>
              </StatProgressBar>

              {/* Boss Afflictions & Active Statuses Bar */}
              {snapshot.activeBoss.statuses && snapshot.activeBoss.statuses.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[9px] font-bold text-[#9E9789]">
                    Afflictions:
                  </span>
                  {snapshot.activeBoss.statuses.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-[#10151C] border text-[9px] font-bold tabular-nums"
                      style={{
                        borderColor: st.color || '#FFC83D',
                        color: st.color || '#FFC83D',
                      }}
                      title={st.tooltip}
                    >
                      <span>{STATUS_BADGE_ICONS[st.id] || '✦'}</span>
                      <span>{st.name}</span>
                      {st.remaining && st.remaining < 9000 && (
                        <span className="text-[8px] opacity-80">{st.remaining.toFixed(1)}s</span>
                      )}
                      {st.stacks > 1 && (
                        <span className="text-[8px] text-white">
                          ×{st.stacks}
                        </span>
                      )}
                    </div>
                  ))}
                  {snapshot.activeBoss.isStunned && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-[#101D27] border border-[#00F0FF] text-[#00F0FF]">
                      ⚡ STUNNED
                    </span>
                  )}
                </div>
              )}

              {/* Boss Signature Mechanic Bar */}
              {snapshot.activeBoss.mechanic && bossMechDisplay && (
                <div className="pt-1 border-t border-[#3A3F47]">
                  <div className="flex items-center justify-between text-[10px] font-bold mb-0.5">
                    <span style={{ color: bossMechDisplay.barColor }}>
                      {snapshot.activeBoss.mechanic.label}
                    </span>
                    <span className="text-[#D9D2C3] tabular-nums">{bossMechDisplay.subText}</span>
                  </div>
                  <StatProgressBar
                    pct={bossMechDisplay.barPct}
                    containerClassName="relative h-2 w-full bg-[#161A20] border border-[#3A3F47] overflow-hidden"
                    fillClassName="h-full transition-all duration-75"
                    fillColor={bossMechDisplay.barColor}
                  />
                </div>
              )}
            </div>
          )}

          {/* 10x MOB FUSION & 5x MID-BOSS -> KING FUSION CONVERGENCE BANNER */}
          {snapshot.activeFusion && (
            <div
              className={`w-full bg-[#0B0D10]/95 border-2 p-2 space-y-1 ${
                snapshot.activeFusion.isKingFusion
                  ? 'border-[#C042FF] shadow-[0_0_16px_rgba(192,66,255,0.45)]'
                  : 'border-[#FFC83D]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-[#FFC83D]">
                  {snapshot.activeFusion.isKingFusion
                    ? `👑 5× MID-BOSS KING FUSION → ${snapshot.activeFusion.targetName}`
                    : `⚠ 10× FUSION CONVERGENCE → ${snapshot.activeFusion.targetName}`}
                  {snapshot.activeFusion.activeCount > 1
                    ? ` (+${snapshot.activeFusion.activeCount - 1} more)`
                    : ''}
                </span>
                <span className="text-[#FF3B3B] tabular-nums">
                  {snapshot.activeFusion.remainingSec.toFixed(1)}s
                </span>
              </div>
              <StatProgressBar
                pct={snapshot.activeFusion.progressPct || 0}
                containerClassName="relative h-2 w-full bg-[#161A20] border border-[#3A3F47] overflow-hidden"
                fillClassName="h-full transition-all duration-75"
                fillBackground={
                  snapshot.activeFusion.isKingFusion
                    ? 'linear-gradient(90deg, #C042FF 0%, #FFC83D 100%)'
                    : undefined
                }
                fillColor={snapshot.activeFusion.isKingFusion ? undefined : '#FF3B3B'}
              />
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-[#4FD6A0]">
                  {snapshot.activeFusion.inBacklashWindow
                    ? 'BACKLASH WINDOW ACTIVE (INTERRUPT = 1.5s STUN)'
                    : 'Deal damage, stun, or displace to interrupt'}
                </span>
                <span className="text-[#4FD6A0] tabular-nums">
                  STAGGER {Math.round(snapshot.activeFusion.staggerPct || 0)}%
                </span>
              </div>
              <StatProgressBar
                pct={snapshot.activeFusion.staggerPct || 0}
                containerClassName="relative h-1.5 w-full bg-[#161A20] border border-[#3A3F47] overflow-hidden"
                fillClassName="h-full bg-[#4FD6A0]"
              />
            </div>
          )}

          {/* Boss Name Card on Spawn / Arena Entry */}
          {snapshot.bossNameCard && (
            <div className="mt-2 bg-[#0B0D10]/95 border-2 border-[#FFC83D] px-8 py-3 text-center shadow-[0_8px_32px_rgba(0,0,0,0.9)]">
              <div className="text-[10px] tracking-[0.2em] text-[#FFC83D]">
                AREA BOSS DETECTED
              </div>
              <div className="text-xl font-bold tracking-wider text-[#D9D2C3] mt-0.5">
                {snapshot.bossNameCard.name}
              </div>
              <div className="text-xs text-[#8B3A1E] mt-0.5">
                {snapshot.bossNameCard.subtitle}
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Compact Zone Header + Quick-Action Icon Dock + Transparent Minimap */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Sleek Single-Line Zone Header matched to the exact width of Icon Dock + Minimap */}
          <div className="w-[254px] bg-[#0B0D10]/75 backdrop-blur-md border border-[#3A3F47]/85 px-2.5 py-1.5 text-right font-mono shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold whitespace-nowrap">
              <span className="text-[#c084fc]">
                {snapshot.currentFloor === 0 ? 'Town Hub' : `Floor ${snapshot.currentFloor}/5`}
              </span>
              <span className="text-[#D9D2C3] truncate" title={snapshot.areaName}>
                {snapshot.areaName}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[9px] text-[#9E9789] mt-0.5 whitespace-nowrap">
              <span className={snapshot.inSafeZone ? 'text-[#4FD6A0] font-bold' : 'truncate'}>
                {snapshot.inSafeZone
                  ? 'Safe Sanctuary'
                  : snapshot.worldLedger?.zoneLiberated
                  ? 'Cleansed Sector (-65% Mobs)'
                  : snapshot.floorName}
              </span>
              {snapshot.currentFloor > 0 && snapshot.worldLedger ? (
                <span className="text-[#FFC83D] font-bold tabular-nums">
                  Overlords {snapshot.worldLedger.liberatedCount}/4
                </span>
              ) : (
                <span className="text-[#9E9789] tabular-nums">
                  Max FL {snapshot.highestUnlockedFloor}/5
                </span>
              )}
            </div>
          </div>

          {/* Minimap + Adjacent Quick-Action Icon Dock */}
          <div className="flex items-start gap-1.5">
            <QuickActionIconDock
              engine={engine}
              skillPoints={snapshot.skillPoints}
              readyQuestCount={readyQuestCount}
              currentFloor={snapshot.currentFloor}
            />
            <Minimap
              playerX={snapshot.x}
              playerY={snapshot.y}
              defeatedBosses={snapshot.defeatedBosses}
              accentColor={accent}
              currentFloor={snapshot.currentFloor}
              worldLedger={snapshot.worldLedger}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM HUD CLUSTER: Action Dock (Items & Skills) + Experience Bar Below */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* BOTTOM ACTION BAR: Supplies (Q/F/Z/X/C), Skills (1/2/3/4), Dodge (SPC), Ultimate (R), System Controls */}
        <div className="w-full max-w-3xl flex items-end justify-between gap-2">
          {/* Left: Consumable Quick Slots */}
          <div
            data-hud-interactive="true"
            className="pointer-events-auto flex items-center gap-1 bg-[#0B0D10]/92 backdrop-blur-md border border-[#3A3F47] p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
          >
            {QUICK_SUPPLIES.map((sup) => (
              <SupplySlotButton
                key={sup.id}
                sup={sup}
                count={snapshot.supplies[sup.id] || 0}
                accent={accent}
                onUseSupply={handleUseSupply}
              />
            ))}
          </div>

          {/* Center: Combat Skills (1-4), Dodge (SPACE), and Ultimate Awakening (R) */}
          <div
            data-hud-interactive="true"
            className={`pointer-events-auto flex items-center gap-2.5 bg-[#0B0D10]/92 backdrop-blur-md border px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.7)] ${
              snapshot.inSafeZone ? 'border-[#4FD6A0]/45' : 'border-[#3A3F47]'
            }`}
          >
            {skillList.map((sk) => (
              <AbilitySlotButton
                key={sk.id}
                sk={sk}
                accent={accent}
                stamina={snapshot.stamina}
                inSafeZone={snapshot.inSafeZone}
                isStunned={isStunned}
                isHovered={hoveredSkillId === sk.id}
                onHover={setHoveredSkillId}
                onUseSkill={handleUseSkill}
              />
            ))}

            {/* Dodge Indicator */}
            {(() => {
              const isHovered = hoveredSkillId === 'dodge';
              const onCd = snapshot.cooldowns.dodge > 0.05;
              const dodgeDef = {
                id: 'dodge',
                name: 'Roll (Evasion)',
                hotkey: 'SPACE',
                icon: 'dodge',
                cost: 0,
                cd: snapshot.cooldowns.dodge || 0,
                maxCd: snapshot.maxCooldowns.dodge || 1.2,
                desc: 'Perform a rapid evasive dash with invulnerability frames (i-frames) to avoid all incoming attacks and environmental hazards.',
                source: 'Universal Evasion',
                category: 'Mobility & I-Frames',
              };

              return (
                <div
                  onMouseEnter={() => setHoveredSkillId('dodge')}
                  onMouseLeave={() => setHoveredSkillId(null)}
                  className="relative flex flex-col items-center cursor-pointer group"
                >
                  {isHovered && (
                    <SkillTooltip
                      skill={dodgeDef}
                      accent={accent}
                      inSafeZone={snapshot.inSafeZone}
                      currentStamina={snapshot.stamina}
                    />
                  )}
                  <div
                    className={`relative w-12 h-12 bg-[#14181F] border-2 flex items-center justify-center transition-transform duration-150 group-hover:scale-105 ${
                      onCd ? 'border-[#3A3F47]' : isHovered ? 'border-[#00F0FF]' : 'border-[#D9D2C3]'
                    }`}
                    style={{
                      boxShadow: isHovered ? '0 0 12px rgba(0,240,255,0.4)' : undefined,
                    }}
                  >
                    <span className="text-[10px] font-bold text-[#D9D2C3]">ROLL</span>
                    {onCd && (
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[#0B0D10]/85 flex items-center justify-center"
                        style={{
                          height: `${Math.min(
                            100,
                            (snapshot.cooldowns.dodge / snapshot.maxCooldowns.dodge) * 100
                          )}%`,
                        }}
                      >
                        <span className="text-xs font-bold text-[#D9D2C3] tabular-nums">
                          {snapshot.cooldowns.dodge.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {isStunned && (
                      <div className="absolute inset-0 bg-[#0B1017]/85 border border-[#00F0FF] flex flex-col items-center justify-center pointer-events-none z-10">
                        <span className="text-xs">⚡</span>
                        <span className="text-[7px] font-black text-[#00F0FF]">LOCK</span>
                      </div>
                    )}
                    <span className="absolute top-0.5 left-1 text-[8px] font-bold text-[#9E9789]">
                      SPC
                    </span>
                  </div>
                  <span
                    className={`text-[9px] mt-1 whitespace-nowrap transition-colors ${
                      isHovered ? 'text-white font-bold' : 'text-[#9E9789]'
                    }`}
                  >
                    Dodge
                  </span>
                </div>
              );
            })()}

            <div className="h-11 w-px bg-[#3A3F47] mx-0.5" />

            {/* Ultimate Charge Ring [R] */}
            {(() => {
              const isHovered = hoveredSkillId === 'ultimate';
              const ultDef = {
                id: 'ultimate',
                name: snapshot.ultimateDef?.name || 'Ultimate Awakening',
                hotkey: 'R',
                icon: snapshot.ultimateDef?.icon || 'sevenCuts',
                cost: `${neededCharge} Charge`,
                cd: ultReady ? 0 : Math.max(0, neededCharge - snapshot.ultimateCharge),
                maxCd: neededCharge,
                desc:
                  snapshot.ultimateDef?.desc ||
                  snapshot.ultimateDef?.summary ||
                  'Channel accumulated combat charge into a devastating signature technique.',
                source: 'Awakening Technique',
                category: 'Ultimate Awakening',
                isUlt: true,
                ultPct: Math.floor(ultPct),
                ultReady,
              };

              return (
                <div
                  onMouseEnter={() => setHoveredSkillId('ultimate')}
                  onMouseLeave={() => setHoveredSkillId(null)}
                  className="relative flex flex-col items-center group cursor-pointer"
                >
                  {isHovered && (
                    <SkillTooltip
                      skill={ultDef}
                      accent={accent}
                      inSafeZone={snapshot.inSafeZone}
                      currentStamina={snapshot.stamina}
                    />
                  )}
                  <div
                    onClick={handleUseUltimate}
                    className={`relative w-12 h-12 flex items-center justify-center cursor-pointer transition-transform duration-150 group-hover:scale-105 ${
                      snapshot.invalidUltShake ? 'translate-x-1 duration-75 text-[#FF3B3B]' : ''
                    } ${snapshot.ultReadyFlash ? 'scale-105' : ''}`}
                    title={
                      ultReady
                        ? `[R] ${snapshot.ultimateDef?.name || 'Ultimate'} Ready!`
                        : `Charging ${snapshot.ultimateDef?.name || 'Ultimate'} (${Math.floor(ultPct)}%)`
                    }
                  >
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                      <circle
                        cx="28"
                        cy="28"
                        r="23"
                        fill="#0B0D10"
                        stroke="#3A3F47"
                        strokeWidth="4"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r="23"
                        fill="none"
                        stroke={
                          snapshot.ultimateContinuousTimer > 0
                            ? '#00F0FF'
                            : ultReady
                            ? accent
                            : snapshot.invalidUltShake
                            ? PALETTE.blood
                            : PALETTE.brass
                        }
                        strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 23}
                        strokeDashoffset={
                          snapshot.ultimateContinuousTimer > 0
                            ? 2 * Math.PI * 23 * (1 - snapshot.ultimateContinuousTimer / 8.0)
                            : 2 * Math.PI * 23 * (1 - ultPct / 100)
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="text-[10px] font-bold tabular-nums"
                        style={{
                          color:
                            snapshot.ultimateContinuousTimer > 0
                              ? '#00F0FF'
                              : ultReady
                              ? accent
                              : PALETTE.bone,
                        }}
                      >
                        {snapshot.ultimateContinuousTimer > 0
                          ? `${snapshot.ultimateContinuousTimer.toFixed(1)}s`
                          : ultReady
                          ? 'READY'
                          : `${Math.floor(ultPct)}%`}
                      </span>
                      <span className="text-[8px] font-bold text-[#FFC83D]">
                        {snapshot.ultimateContinuousTimer > 0 ? 'RECAST' : '[R]'}
                      </span>
                    </div>
                    {isStunned && (
                      <div className="absolute inset-0 rounded-full bg-[#0B1017]/85 border-2 border-[#00F0FF] flex flex-col items-center justify-center pointer-events-none z-10">
                        <span className="text-xs">⚡</span>
                        <span className="text-[7px] font-black text-[#00F0FF]">LOCK</span>
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[9px] font-bold mt-1 whitespace-nowrap truncate max-w-[64px] transition-colors group-hover:text-white"
                    style={{ color: isHovered ? '#FFFFFF' : accent }}
                  >
                    {snapshot.ultimateDef?.name || 'Ultimate'}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Right: Compact Audio & Pause Controls */}
          <div
            data-hud-interactive="true"
            className="pointer-events-auto flex flex-col gap-1 bg-[#0B0D10]/92 backdrop-blur-md border border-[#3A3F47] p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
          >
            <button
              onClick={handleToggleMute}
              className="px-2.5 py-1 bg-[#14181F] border border-[#3A3F47] hover:border-[#00F0FF] text-[10px] font-bold text-[#D9D2C3] whitespace-nowrap cursor-pointer transition-colors"
            >
              {sound.muted ? 'Audio: Off' : 'Audio: On'}
            </button>
            <button
              onClick={handleOpenPause}
              className="px-2.5 py-1 bg-[#14181F] border border-[#3A3F47] hover:border-[#00F0FF] text-[10px] font-bold text-[#D9D2C3] whitespace-nowrap cursor-pointer transition-colors"
            >
              [ESC] Pause
            </button>
          </div>
        </div>

        {/* Notched RPG Experience Bar Strip (Positioned Below Items & Skills) */}
        <div className="w-full max-w-3xl bg-[#0B0D10]/92 backdrop-blur-md border border-[#3A3F47] px-3 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.75)] font-mono">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wide mb-0.5 tabular-nums">
            <div className="flex items-center gap-2">
              <span className="text-[#FFC83D]">LV {snapshot.level} EXPERIENCE</span>
              {snapshot.inSafeZone && (
                <span className="text-[#4FD6A0] text-[9px]">
                  · Safe Haven (Weapons Sheathed)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#D9D2C3]">
                {snapshot.xp.toLocaleString()} / {snapshot.xpToNext.toLocaleString()} XP ({Math.floor(xpPct)}%)
              </span>
              <span className="text-[#9E9789]">·</span>
              <span className="text-[#FFC83D]">
                Next Lv: {Math.max(0, snapshot.xpToNext - snapshot.xp).toLocaleString()} XP
              </span>
            </div>
          </div>
          <StatProgressBar
            pct={xpPct}
            containerClassName="relative h-2.5 w-full bg-[#14181F] border border-[#2C313A] overflow-hidden"
            fillClassName="h-full transition-all duration-150"
            fillBackground="linear-gradient(90deg, #7C3AED 0%, #C084FC 55%, #FFC83D 100%)"
          >
            <div className="pointer-events-none absolute inset-0 flex justify-evenly">
              {XP_BAR_TICK_INDICES.map((idx) => (
                <div key={idx} className="w-px h-full bg-[#0B0D10]/65" />
              ))}
            </div>
          </StatProgressBar>
        </div>
      </div>
    </div>
  );
}

export default HUD;
