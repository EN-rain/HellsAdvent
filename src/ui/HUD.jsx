import React, { useEffect, useRef, useState } from 'react';
import {
  PALETTE,
  WORLD_CONFIG,
  ENEMIES_CONFIG,
} from '../data/config.js';
import { CharacterPortrait, PixelIcon, StatusIcon } from './PixelWidgets.jsx';
import { sound } from '../game/Audio.js';

function Minimap({ playerX, playerY, defeatedBosses, accentColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 132;
    const scale = size / WORLD_CONFIG.size;

    // 1. Background sectors
    ctx.fillStyle = '#0B0D10';
    ctx.fillRect(0, 0, size, size);

    // North: Slab Town
    ctx.fillStyle = '#232830';
    ctx.fillRect(24, 0, size - 48, 52);

    // South: Copper Flats
    ctx.fillStyle = '#4A2416';
    ctx.fillRect(24, size - 52, size - 48, 52);

    // West: Route 9
    ctx.fillStyle = '#181C22';
    ctx.fillRect(0, 24, 52, size - 48);

    // East: Lye Marsh
    ctx.fillStyle = '#142B28';
    ctx.fillRect(size - 52, 24, 52, size - 48);

    // Crossroad highways
    ctx.fillStyle = '#2B3038';
    ctx.fillRect(size / 2 - 3, 0, 6, size);
    ctx.fillRect(0, size / 2 - 3, size, 6);

    // Center Kettle safe zone circle
    const kx = WORLD_CONFIG.kettleCenter.x * scale;
    const ky = WORLD_CONFIG.kettleCenter.y * scale;
    const kr = WORLD_CONFIG.kettleRadius * scale;
    ctx.fillStyle = '#1F242B';
    ctx.strokeStyle = PALETTE.boneDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ume & Harlow markers in Kettle
    ctx.fillStyle = PALETTE.brass;
    ctx.fillRect(kx - 4, ky - 2, 3, 3);
    ctx.fillStyle = PALETTE.verdigris;
    ctx.fillRect(kx + 2, ky - 2, 3, 3);

    // 4 Fixed Boss Arenas
    for (const boss of Object.values(ENEMIES_CONFIG.bosses)) {
      const bx = Math.round(boss.arenaCenter.x * scale);
      const by = Math.round(boss.arenaCenter.y * scale);
      const isBeaten = defeatedBosses && defeatedBosses[boss.id];
      ctx.fillStyle = isBeaten ? PALETTE.slag : PALETTE.blood;
      ctx.fillRect(bx - 3, by - 3, 6, 6);
      ctx.strokeStyle = PALETTE.soot;
      ctx.strokeRect(bx - 3, by - 3, 6, 6);
    }

    // Player dot (Class Accent)
    const px = Math.max(3, Math.min(size - 3, Math.round(playerX * scale)));
    const py = Math.max(3, Math.min(size - 3, Math.round(playerY * scale)));
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(px - 3, py - 3, 7, 7);
    ctx.fillStyle = accentColor || PALETTE.signal;
    ctx.fillRect(px - 2, py - 2, 5, 5);
  }, [playerX, playerY, defeatedBosses, accentColor]);

  return (
    <div className="bg-[#0B0D10] border-2 border-[#3A3F47] p-1.5">
      <canvas
        ref={canvasRef}
        width={132}
        height={132}
        className="pixelated block"
      />
      <div className="mt-1 flex items-center justify-between text-[10px] text-[#D9D2C3]/80">
        <span>N:SLAB</span>
        <span>W:RT9</span>
        <span>E:LYE</span>
        <span>S:FLATS</span>
      </div>
    </div>
  );
}

function StatusSlotBox({ st, onHover }) {
  const borderCol = st.isBuff ? PALETTE.signal : PALETTE.blood;
  const elapsedPct =
    st.duration && st.duration < 9000
      ? Math.max(0, Math.min(1, 1 - st.remaining / st.duration))
      : 0;

  return (
    <div
      onMouseEnter={() => onHover(st)}
      onMouseLeave={() => onHover(null)}
      className="relative w-[18px] h-[18px] bg-[#0B0D10] flex items-center justify-center cursor-help"
      style={{ border: `1px solid ${borderCol}` }}
      title={st.tooltip}
    >
      <StatusIcon statusId={st.id} size={14} />

      {/* Clockwise / vertical dark wipe showing elapsed duration */}
      {elapsedPct > 0 && (
        <div
          className="absolute top-0 left-0 right-0 bg-[#0B0D10]/70 pointer-events-none"
          style={{ height: `${Math.round(elapsedPct * 100)}%` }}
        />
      )}

      {/* Stack badge in bottom-right corner */}
      {st.stacks > 1 && (
        <span
          className="absolute -bottom-0.5 right-0 bg-[#0B0D10] px-0.5 text-[8px] font-bold leading-none tabular-nums"
          style={{ color: borderCol }}
        >
          {st.stacks}
        </span>
      )}
    </div>
  );
}

function ClassMechanicBar({ mech, accentColor, engine }) {
  if (!mech) return null;

  if (mech.type === 'momentum') {
    const isRedline = mech.redline;
    return (
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold tracking-wider text-[#9E9789]">
            {isRedline ? 'REDLINE' : 'MOMENTUM'}
          </span>
          <div className="flex items-center gap-1 ml-1">
            {Array.from({ length: mech.maxStacks || 5 }, (_, idx) => {
              const active = idx < mech.stacks;
              return (
                <div
                  key={idx}
                  className="w-3.5 h-2 border"
                  style={{
                    borderColor: active
                      ? isRedline
                        ? PALETTE.blood
                        : accentColor
                      : '#3A3F47',
                    backgroundColor: active
                      ? isRedline
                        ? PALETTE.blood
                        : accentColor
                      : '#0B0D10',
                  }}
                />
              );
            })}
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
              RELOADING... PRESS [LMB / V] IN BRASS ZONE
            </span>
          </div>
          <div className="relative h-2.5 w-full bg-[#0B0D10] border border-[#3A3F47]">
            {/* 0.35s - 0.50s sweet spot notch */}
            <div
              className="absolute top-0 bottom-0 bg-[#FFC83D]/85"
              style={{
                left: `${(mech.windowStart || 0.35) * 100}%`,
                width: `${((mech.windowEnd || 0.52) - (mech.windowStart || 0.35)) * 100}%`,
              }}
            />
            {/* Moving cursor bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#D9D2C3]"
              style={{ left: `${pct}%` }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-[#9E9789]">MAGAZINE</span>
          <div className="flex items-center gap-0.5 ml-1">
            {Array.from({ length: mech.maxBolts || 12 }, (_, idx) => {
              const filled = idx < mech.bolts;
              const isLastShot = idx === 0 && engine.player.hasNode('lastWord');
              return (
                <div
                  key={idx}
                  className="w-1.5 h-2.5 border"
                  style={{
                    borderColor: filled ? PALETTE.brass : '#3A3F47',
                    backgroundColor: filled
                      ? isLastShot
                        ? PALETTE.blood
                        : PALETTE.brass
                      : '#0B0D10',
                  }}
                />
              );
            })}
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
            {Array.from({ length: mech.maxCount || 6 }, (_, idx) => {
              const active = idx < mech.count;
              return (
                <div
                  key={idx}
                  className="w-2.5 h-2.5 border"
                  style={{
                    borderColor: active ? PALETTE.verdigris : '#3A3F47',
                    backgroundColor: active ? PALETTE.verdigris : '#0B0D10',
                  }}
                />
              );
            })}
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
              ? '★ OVERHEATED SURGE (+40% ATK)'
              : isRedZone
              ? 'RED GAUGE (+35% SKILL DMG)'
              : 'BOILER PRESSURE'}
          </span>
          <span className="text-[#FF5A26] tabular-nums">
            {pct}% [V] VENT
          </span>
        </div>
        <div className="relative h-2.5 w-full bg-[#0B0D10] border border-[#3A3F47]">
          {/* 75% Red Gauge threshold marker */}
          <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-[#D9D2C3] z-10" />
          <div
            className="h-full transition-all duration-75"
            style={{
              width: `${pct}%`,
              backgroundColor: mech.overheated
                ? '#D9D2C3'
                : isRedZone
                ? PALETTE.ember
                : PALETTE.brass,
            }}
          />
        </div>
      </div>
    );
  }

  if (mech.type === 'arcSwarm') {
    return (
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-[#9E9789]">ARC-DRONES</span>
          <div className="flex items-center gap-1 ml-1">
            {Array.from({ length: mech.maxDrones || 3 }, (_, idx) => {
              const active = idx < (mech.drones || 0);
              return (
                <div
                  key={idx}
                  className="w-2.5 h-2.5 border"
                  style={{
                    borderColor: active ? PALETTE.volt : '#3A3F47',
                    backgroundColor: active
                      ? mech.overcharged
                        ? '#D9D2C3'
                        : PALETTE.volt
                      : '#0B0D10',
                  }}
                />
              );
            })}
          </div>
        </div>
        <span className="text-[9px] font-bold text-[#C9F24B] tabular-nums">
          PYLONS {mech.pylons || 0}/{mech.maxPylons || 2} · [V] PULSE
        </span>
      </div>
    );
  }

  return null;
}

export function HUD({ snapshot, engine }) {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  if (!snapshot) return null;

  const accent = snapshot.accentColor || PALETTE.signal;
  const hpPct = Math.max(0, Math.min(100, (snapshot.hp / snapshot.maxHp) * 100));
  const stamPct = Math.max(0, Math.min(100, (snapshot.stamina / snapshot.maxStamina) * 100));
  const xpPct = snapshot.xpToNext > 0
    ? Math.max(0, Math.min(100, (snapshot.xp / snapshot.xpToNext) * 100))
    : 100;
  const neededCharge = snapshot.ultimateChargeNeeded || 100;
  const ultPct = Math.max(0, Math.min(100, (snapshot.ultimateCharge / neededCharge) * 100));
  const ultReady = snapshot.ultimateCharge >= neededCharge;

  const skillList = snapshot.activeSkillDefs || [];
  const buffs = (snapshot.statuses || []).filter((s) => s.isBuff).slice(0, 6);
  const debuffs = (snapshot.statuses || []).filter((s) => !s.isBuff).slice(0, 6);

  const getDirectionLabel = (bx, by) => {
    const dx = bx - snapshot.x;
    const dy = by - snapshot.y;
    if (Math.hypot(dx, dy) < 280) return 'HERE';
    if (Math.abs(dy) >= Math.abs(dx)) {
      return dy < 0 ? 'NORTH' : 'SOUTH';
    }
    return dx < 0 ? 'WEST' : 'EAST';
  };

  const obj = snapshot.objective;
  const objDir = obj
    ? obj.dir ||
      (obj.boss?.arenaCenter
        ? getDirectionLabel(obj.boss.arenaCenter.x, obj.boss.arenaCenter.y)
        : '')
    : '';
  const objName = obj ? obj.name || obj.boss?.name || '' : '';
  const objDistM = obj ? (obj.boss ? Math.round(obj.dist / 16) : obj.dist) : 0;
  const canPromote = snapshot.canPromoteJourneyman || snapshot.canPromoteMaster;

  const quickSupplies = [
    { id: 'gauzeRoll', key: 'Q', label: 'Gauze Roll (+50 HP, Clears Bleed)' },
    { id: 'sugarTin', key: 'F', label: 'Sugar Tin (+40 Stamina)' },
    { id: 'lyeWash', key: 'Z', label: 'Lye Wash (Clears Corrode, Burn, Choke)' },
    { id: 'hotStew', key: 'X', label: 'Hot Stew (Well Fed 180s)' },
    { id: 'stimStick', key: 'C', label: 'Stim Stick (Haste + Focus 8s)' },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 select-none">
      {/* TOP PERIMETER CLUSTER */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left: Class Portrait + Full Title Line + HP, Stamina, Class Mechanic, & Status Row */}
        <div className="flex flex-col gap-1.5">
          <div
            className="flex items-start gap-3 bg-[#0B0D10]/90 border-2 p-2.5"
            style={{ borderColor: '#3A3F47' }}
          >
            <div className="relative">
              <CharacterPortrait
                classId={snapshot.classId}
                expression={snapshot.portraitExpression}
                equipped={snapshot.equipped}
                stage={snapshot.stage}
                branch={snapshot.branch}
                size={64}
              />
              <div
                className="absolute -bottom-1 -right-1 bg-[#0B0D10] border px-1.5 py-0.5 text-[11px] font-bold"
                style={{ borderColor: accent, color: accent }}
              >
                LV {snapshot.level}
              </div>
            </div>

            <div className="w-60 space-y-1.5">
              {/* Character Name - Title, Stage */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span
                  className="font-bold tracking-wide truncate"
                  style={{ color: accent }}
                  title={snapshot.fullTitleLine}
                >
                  {snapshot.fullTitleLine}
                </span>
                <span className="font-bold text-[#FFC83D] tabular-nums shrink-0">
                  {snapshot.gold} G
                </span>
              </div>

              {/* HP BAR */}
              <div className="relative h-4 w-full bg-[#161A20] border border-[#3A3F47]">
                <div
                  className="h-full bg-[#FF3B3B] transition-all duration-75"
                  style={{ width: `${hpPct}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[11px] font-bold text-[#D9D2C3] tabular-nums">
                  <span>HP</span>
                  <span>
                    {snapshot.hp} / {snapshot.maxHp}
                  </span>
                </div>
              </div>

              {/* STAMINA BAR */}
              <div className="relative h-3.5 w-full bg-[#161A20] border border-[#3A3F47]">
                <div
                  className="h-full transition-all duration-75"
                  style={{ width: `${stamPct}%`, backgroundColor: accent }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[10px] font-bold text-[#0B0D10] mix-blend-screen tabular-nums">
                  <span className="text-[#D9D2C3]">STAM</span>
                  <span className="text-[#D9D2C3]">
                    {snapshot.stamina} / {snapshot.maxStamina}
                  </span>
                </div>
              </div>

              {/* CLASS MECHANIC BAR (Momentum / Magazine / Scrap Orbit) */}
              <ClassMechanicBar
                mech={snapshot.classMechanic}
                accentColor={accent}
                engine={engine}
              />

              {/* XP BAR */}
              <div className="relative h-1.5 w-full bg-[#161A20] border border-[#3A3F47]">
                <div
                  className="h-full bg-[#D9D2C3] transition-all duration-100"
                  style={{ width: `${xpPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#D9D2C3]/75 tabular-nums">
                <span>
                  ATK {snapshot.atk} · DEF {snapshot.def} · SPD {snapshot.speed}
                </span>
                <span>
                  XP {snapshot.xp}/{snapshot.xpToNext}
                </span>
              </div>
            </div>
          </div>

          {/* STATUS BAR ROW (Buffs on left framed in Signal, Debuffs on right framed in Blood) */}
          {(buffs.length > 0 || debuffs.length > 0) && (
            <div
              data-hud-interactive="true"
              className="pointer-events-auto flex flex-col gap-1 bg-[#0B0D10]/90 border border-[#3A3F47] px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Buffs (up to 6) */}
                <div className="flex items-center gap-1">
                  {buffs.map((st) => (
                    <StatusSlotBox key={st.id} st={st} onHover={setHoveredStatus} />
                  ))}
                </div>
                {/* Debuffs (up to 6) */}
                <div className="flex items-center gap-1">
                  {debuffs.map((st) => (
                    <StatusSlotBox key={st.id} st={st} onHover={setHoveredStatus} />
                  ))}
                </div>
              </div>

              {hoveredStatus && (
                <div className="text-[10px] font-bold text-[#D9D2C3] tabular-nums">
                  {hoveredStatus.tooltip}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top-Center: Objective Line + Promotion Notice + Active Boss Health & Stagger Bar */}
        <div className="flex flex-col items-center gap-2 max-w-xl w-full">
          {snapshot.worldLedger?.floor1Complete ? (
            <div className="bg-[#0B0D10]/95 border-2 border-[#4FD6A0] px-3.5 py-1 text-xs text-[#4FD6A0] font-bold tracking-wide">
              ★ FLOOR 1 LIBERATED — ALL 4 TERRITORIES CLEARED · VISIT HARLOW FOR REMATCHES ★
            </div>
          ) : (
            obj && (
              <div className="bg-[#0B0D10]/90 border border-[#3A3F47] px-3.5 py-1 text-xs text-[#D9D2C3] tracking-wide tabular-nums">
                <span className="text-[#FFC83D] font-bold">
                  HUNT #{obj.orderIndex || 1}/4 (REC LV.{obj.recommendedLevel || 5}):{' '}
                </span>
                <span className="font-bold" style={{ color: accent }}>
                  {objName}
                </span>
                <span className="text-[#9E9789]">
                  {' '}
                  · {objDir} ({objDistM}m)
                </span>
              </div>
            )
          )}

          {canPromote && (
            <div className="bg-[#0B0D10]/95 border-2 border-[#FFC83D] px-3.5 py-1 text-xs font-bold text-[#FFC83D] tracking-wide">
              PROMOTION READY AT KETTLE — VISIT HARLOW&apos;S TRADE REGISTER [E]
            </div>
          )}

          {/* Large Boss Health Bar + Stagger Bar + Signature Mechanic Bar */}
          {snapshot.activeBoss && (
            <div className="w-full bg-[#0B0D10]/95 border-2 border-[#FF3B3B] p-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#FF3B3B] uppercase tracking-wider">
                    {snapshot.activeBoss.name}
                  </span>
                  <span className="text-[#9E9789] text-[11px]">
                    {snapshot.activeBoss.subtitle}
                  </span>
                  {snapshot.activeBoss.isRematch && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#8B3A1E] text-[#D9D2C3]">
                      REMATCH
                    </span>
                  )}
                </div>
                <span className="text-[#FFC83D] font-bold text-[11px]">
                  PHASE {snapshot.activeBoss.phase} / 3
                </span>
              </div>
              <div className="relative h-4 w-full bg-[#161A20] border border-[#3A3F47]">
                <div
                  className="h-full bg-[#FF3B3B] transition-all duration-75"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (snapshot.activeBoss.hp / snapshot.activeBoss.maxHp) * 100)
                    )}%`,
                  }}
                />
                <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-[#0B0D10]" />
                <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-[#0B0D10]" />
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#D9D2C3] tabular-nums">
                  {snapshot.activeBoss.hp} / {snapshot.activeBoss.maxHp}
                </div>
              </div>

              {/* Boss Stagger Meter */}
              <div className="relative h-2.5 w-full bg-[#161A20] border border-[#3A3F47]">
                <div
                  className="h-full bg-[#FFC83D] transition-all duration-75"
                  style={{
                    width: `${
                      snapshot.activeBoss.staggered
                        ? 100
                        : Math.max(0, Math.min(100, snapshot.activeBoss.staggerPct || 0))
                    }%`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] font-bold text-[#D9D2C3] tabular-nums">
                  <span>STAGGER</span>
                  <span className="text-[#FFC83D]">
                    {snapshot.activeBoss.staggered
                      ? 'STAGGERED (+35% DMG TAKEN)'
                      : `${snapshot.activeBoss.staggerPct || 0}%`}
                  </span>
                </div>
              </div>

              {/* Boss Signature Mechanic Bar (D1–D5, D18, D21–D23, D28–D48) */}
              {snapshot.activeBoss.mechanic && (() => {
                const mech = snapshot.activeBoss.mechanic;
                let subText = '';
                let barPct = 0;
                let barColor = '#FFC83D';

                if (mech.type === 'foremanRitual') {
                  subText = `ARRIVALS: ${mech.arrivals}/${mech.threshold} · WAVE ${mech.wavesSpawned}/${mech.totalWaves} · ${mech.remainingSec}S`;
                  barPct = Math.round(((30 - mech.remainingSec) / 30) * 100);
                  barColor = mech.willRevive ? '#FF3B3B' : '#00F0FF';
                } else if (mech.type === 'foreman') {
                  subText = 'KEEP ARRIVALS < 10';
                  barPct = 100;
                  barColor = '#00F0FF';
                } else if (mech.type === 'bigAxle') {
                  subText = mech.coreExposed
                    ? `CORE HP: ${mech.coreHpPct}% (${mech.coreExposedSec}S)`
                    : `HEAT: ${mech.heat}/${mech.maxHeat}`;
                  barPct = mech.coreBroken ? 100 : mech.coreExposed ? mech.coreHpPct : mech.heat;
                  barColor = mech.coreBroken ? '#4FD6A0' : mech.coreExposed ? '#00F0FF' : '#FFC83D';
                } else if (mech.type === 'motherSump') {
                  subText = mech.devourActive
                    ? `INTERRUPT STAGGER: ${mech.devourStaggerPct}%`
                    : `FEEDS DENIED: ${mech.deniedFeeds}/${mech.requiredDeniedFeeds}`;
                  barPct = mech.isStarved
                    ? 100
                    : mech.devourActive
                    ? mech.devourStaggerPct
                    : Math.round((mech.deniedFeeds / Math.max(1, mech.requiredDeniedFeeds)) * 100);
                  barColor = mech.isStarved ? '#4FD6A0' : mech.devourActive ? '#FF3B3B' : '#FFC83D';
                } else if (mech.type === 'theLongDry') {
                  subText = mech.exposed
                    ? `WINDOW: ${mech.exposedSec}S · PLATES: ${mech.segmentsBroken}/${mech.totalSegments}`
                    : `PLATES: ${mech.segmentsBroken}/${mech.totalSegments}`;
                  barPct = Math.round((mech.segmentsBroken / Math.max(1, mech.totalSegments)) * 100);
                  barColor = mech.segmentsBroken >= mech.totalSegments ? '#4FD6A0' : mech.exposed ? '#00F0FF' : '#FFC83D';
                }

                return (
                  <div className="pt-1 border-t border-[#3A3F47]">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-0.5">
                      <span style={{ color: barColor }}>{mech.label}</span>
                      <span className="text-[#D9D2C3] tabular-nums">{subText}</span>
                    </div>
                    <div className="relative h-2 w-full bg-[#161A20] border border-[#3A3F47]">
                      <div
                        className="h-full transition-all duration-75"
                        style={{
                          width: `${Math.max(0, Math.min(100, barPct))}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 10x MOB FUSION CONVERGENCE BANNER (D6, D7, D11, D16, D21, D25) */}
          {snapshot.activeFusion && (
            <div className="w-full bg-[#0B0D10]/95 border-2 border-[#FFC83D] p-2 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                <span className="text-[#FFC83D]">
                  ⚠ 10× FUSION CONVERGENCE → {snapshot.activeFusion.targetName}
                </span>
                <span className="text-[#FF3B3B] tabular-nums">
                  {snapshot.activeFusion.remainingSec.toFixed(1)}S
                </span>
              </div>
              <div className="relative h-2 w-full bg-[#161A20] border border-[#3A3F47]">
                <div
                  className="h-full bg-[#FF3B3B]"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, snapshot.activeFusion.progressPct || 0)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                <span className="text-[#4FD6A0]">
                  {snapshot.activeFusion.inBacklashWindow
                    ? '★ BACKLASH WINDOW ACTIVE (INTERRUPT = 1.5S STUN) ★'
                    : 'DEAL DAMAGE / STUN / DISPLACE TO INTERRUPT'}
                </span>
                <span className="text-[#4FD6A0] tabular-nums">
                  STAGGER {Math.round(snapshot.activeFusion.staggerPct || 0)}%
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-[#161A20] border border-[#3A3F47]">
                <div
                  className="h-full bg-[#4FD6A0]"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, snapshot.activeFusion.staggerPct || 0)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Boss Name Card on Spawn / Arena Entry */}
          {snapshot.bossNameCard && (
            <div className="mt-2 bg-[#0B0D10] border-2 border-[#FFC83D] px-8 py-3 text-center">
              <div className="text-[10px] tracking-[0.25em] text-[#FFC83D] uppercase">
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

        {/* Top-Right: Minimap & Current Zone Indicator */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="bg-[#0B0D10]/90 border border-[#3A3F47] px-2.5 py-1 text-right">
            <div className="flex items-center justify-end gap-1.5">
              {snapshot.worldLedger?.zoneLiberated && (
                <span className="px-1 py-0.5 text-[9px] font-bold bg-[#4FD6A0] text-[#0B0D10] uppercase">
                  LIBERATED (-65% SPAWNS)
                </span>
              )}
              <div className="text-xs font-bold text-[#D9D2C3] uppercase tracking-wider">
                {snapshot.areaName}
              </div>
            </div>
            <div className="text-[10px] text-[#9E9789]">
              {snapshot.areaSubtitle}
              {snapshot.stormActive ? ' · DUST STORM' : ''}
            </div>
            {snapshot.worldLedger && (
              <div className="text-[9px] font-bold text-[#FFC83D] mt-0.5">
                TERRITORIES LIBERATED: {snapshot.worldLedger.liberatedCount} / 4
              </div>
            )}
          </div>
          <Minimap
            playerX={snapshot.x}
            playerY={snapshot.y}
            defeatedBosses={snapshot.defeatedBosses}
            accentColor={accent}
          />
        </div>
      </div>

      {/* BOTTOM ACTION BAR: Supplies (Q/F/Z/X/C), Skills (1/2/3), Ultimate (R), Panel Shortcuts */}
      <div className="flex items-end justify-between gap-3">
        {/* Left: Consumable Quick Slots & Panel Buttons */}
        <div
          data-hud-interactive="true"
          className="pointer-events-auto flex items-center gap-1.5 bg-[#0B0D10]/90 border-2 border-[#3A3F47] p-2"
        >
          {quickSupplies.map((sup) => {
            const count = snapshot.supplies[sup.id] || 0;
            return (
              <button
                key={sup.id}
                onClick={() => engine.player.useSupply(sup.id, engine.particles)}
                className="relative flex flex-col items-center justify-center w-11 h-12 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] cursor-pointer"
                title={sup.label}
              >
                <PixelIcon itemId={sup.id} size={22} />
                <span className="text-[10px] font-bold text-[#D9D2C3] mt-0.5 tabular-nums">
                  x{count}
                </span>
                <span
                  className="absolute top-0.5 left-1 text-[9px] font-bold"
                  style={{ color: accent }}
                >
                  {sup.key}
                </span>
              </button>
            );
          })}

          <div className="h-10 w-px bg-[#3A3F47] mx-0.5" />

          <button
            onClick={() => engine.setUiState('inventory')}
            className="px-2.5 py-2 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] whitespace-nowrap cursor-pointer"
          >
            [I] GEAR
          </button>

          <button
            onClick={() => engine.setUiState('skills')}
            className={`px-2.5 py-2 bg-[#161A20] border text-xs font-bold whitespace-nowrap cursor-pointer ${
              snapshot.skillPoints > 0
                ? 'border-[#00F0FF] text-[#00F0FF]'
                : 'border-[#3A3F47] text-[#D9D2C3] hover:border-[#00F0FF]'
            }`}
          >
            [K] SKILLS {snapshot.skillPoints > 0 ? `(+${snapshot.skillPoints})` : ''}
          </button>

          {snapshot.nearUme && (
            <button
              onClick={() => engine.setUiState('shop')}
              className="px-2.5 py-2 bg-[#1F4D4A] border border-[#00F0FF] text-xs font-bold text-[#00F0FF] whitespace-nowrap cursor-pointer"
            >
              [E] UME SHOP
            </button>
          )}

          {snapshot.nearHarlow && (
            <button
              onClick={() => engine.setUiState('harlow')}
              className="px-2.5 py-2 bg-[#161A20] border-2 border-[#FFC83D] text-xs font-bold text-[#FFC83D] whitespace-nowrap cursor-pointer"
            >
              [E] HARLOW · REGISTER
            </button>
          )}
        </div>

        {/* Center: Three Class Skill Icons with Hotkeys & Cooldown Sweeps + Ultimate Charge Ring */}
        <div className="flex items-center gap-3 bg-[#0B0D10]/90 border-2 border-[#3A3F47] px-3.5 py-2">
          {skillList.map((sk) => {
            const onCd = sk.cd > 0.05;
            const cdRatio = sk.maxCd > 0 ? Math.min(1, sk.cd / sk.maxCd) : 0;
            const lowStam = snapshot.stamina < sk.cost;

            return (
              <div key={sk.id} className="flex flex-col items-center">
                <div
                  className="relative w-13 h-13 bg-[#161A20] border-2 flex items-center justify-center"
                  style={{
                    borderColor: onCd
                      ? '#3A3F47'
                      : lowStam
                      ? PALETTE.rust
                      : accent,
                  }}
                >
                  <PixelIcon itemId={sk.icon} size={32} />

                  {/* Cooldown vertical sweep overlay */}
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

                  <span
                    className="absolute top-0.5 left-1 text-[10px] font-bold"
                    style={{ color: accent }}
                  >
                    {sk.hotkey}
                  </span>
                  <span className="absolute bottom-0.5 right-1 text-[9px] text-[#D9D2C3]/80">
                    L{sk.level}
                  </span>
                </div>
                <span className="text-[10px] text-[#D9D2C3] mt-1 font-medium whitespace-nowrap">
                  {sk.name}
                </span>
              </div>
            );
          })}

          {/* Dodge Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-13 h-13 bg-[#161A20] border-2 flex items-center justify-center ${
                snapshot.cooldowns.dodge > 0.05 ? 'border-[#3A3F47]' : 'border-[#D9D2C3]'
              }`}
            >
              <span className="text-[11px] font-bold text-[#D9D2C3]">ROLL</span>
              {snapshot.cooldowns.dodge > 0.05 && (
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
              <span className="absolute top-0.5 left-1 text-[9px] font-bold text-[#9E9789]">
                SPC
              </span>
            </div>
            <span className="text-[10px] text-[#9E9789] mt-1 whitespace-nowrap">Dodge</span>
          </div>

          <div className="h-12 w-px bg-[#3A3F47] mx-1" />

          {/* Ultimate Charge Ring [R] */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => {
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
              }}
              className={`relative w-14 h-14 flex items-center justify-center cursor-pointer transition-transform ${
                snapshot.invalidUltShake ? 'translate-x-1 duration-75 text-[#FF3B3B]' : ''
              } ${snapshot.ultReadyFlash ? 'scale-105' : ''}`}
              title={
                ultReady
                  ? `[R] ${snapshot.ultimateDef?.name || 'Ultimate'} Ready!`
                  : `Charging ${snapshot.ultimateDef?.name || 'Ultimate'} (${Math.floor(ultPct)}%)`
              }
            >
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
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
                  stroke={ultReady ? accent : snapshot.invalidUltShake ? PALETTE.blood : PALETTE.brass}
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 23}
                  strokeDashoffset={2 * Math.PI * 23 * (1 - ultPct / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: ultReady ? accent : PALETTE.bone }}
                >
                  {ultReady ? 'READY' : `${Math.floor(ultPct)}%`}
                </span>
                <span className="text-[9px] font-bold text-[#FFC83D]">[R]</span>
              </div>
            </div>
            <span
              className="text-[10px] font-bold mt-0.5 whitespace-nowrap"
              style={{ color: accent }}
            >
              {snapshot.ultimateDef?.name || 'Ultimate'}
            </span>
          </div>
        </div>

        {/* Right: Quick Mute & Pause Affordance */}
        <div
          data-hud-interactive="true"
          className="pointer-events-auto flex items-center gap-2 bg-[#0B0D10]/90 border-2 border-[#3A3F47] p-2"
        >
          <button
            onClick={() => {
              sound.toggleMute();
              engine.notifyUi();
            }}
            className="px-2.5 py-2 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] whitespace-nowrap cursor-pointer"
          >
            {sound.muted ? 'AUDIO: OFF' : 'AUDIO: ON'}
          </button>
          <button
            onClick={() => engine.setUiState('pause')}
            className="px-2.5 py-2 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] whitespace-nowrap cursor-pointer"
          >
            [ESC] PAUSE
          </button>
        </div>
      </div>
    </div>
  );
}

export default HUD;
