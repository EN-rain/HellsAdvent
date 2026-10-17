import React, { useEffect, useRef } from 'react';
import {
  PALETTE,
  SKILLS_CONFIG,
  WORLD_CONFIG,
  ENEMIES_CONFIG,
} from '../data/config.js';
import { SenaPortrait, PixelIcon, PixelBar } from './PixelWidgets.jsx';
import { sound } from '../game/Audio.js';

export function HUD({ snapshot, engine }) {
  const minimapRef = useRef(null);

  useEffect(() => {
    const canvas = minimapRef.current;
    if (!canvas || !snapshot) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#181C22';
    ctx.fillRect(0, 0, w / 2, h / 2);
    ctx.fillStyle = '#1C1A18';
    ctx.fillRect(w / 2, 0, w / 2, h / 2);
    ctx.fillStyle = '#102422';
    ctx.fillRect(0, h / 2, w / 2, h / 2);
    ctx.fillStyle = '#2A1610';
    ctx.fillRect(w / 2, h / 2, w / 2, h / 2);

    const scaleX = w / WORLD_CONFIG.width;
    const scaleY = h / WORLD_CONFIG.height;
    const kx = WORLD_CONFIG.kettleCenter.x * scaleX;
    const ky = WORLD_CONFIG.kettleCenter.y * scaleY;
    const kr = WORLD_CONFIG.kettleSafeRadius * scaleX;

    ctx.strokeStyle = PALETTE.signal;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(kx, ky, Math.max(4, kr), 0, Math.PI * 2);
    ctx.stroke();

    for (const [id, bossCfg] of Object.entries(ENEMIES_CONFIG.bosses)) {
      const bx = bossCfg.arenaCenter.x * scaleX;
      const by = bossCfg.arenaCenter.y * scaleY;
      const defeated = snapshot.defeatedBosses && snapshot.defeatedBosses[id];
      ctx.fillStyle = defeated ? PALETTE.slag : PALETTE.blood;
      ctx.fillRect(Math.round(bx - 2), Math.round(by - 2), 4, 4);
    }

    const px = snapshot.x * scaleX;
    const py = snapshot.y * scaleY;
    ctx.fillStyle = PALETTE.signal;
    ctx.fillRect(Math.round(px - 2), Math.round(py - 2), 5, 5);
    ctx.fillStyle = PALETTE.bone;
    ctx.fillRect(Math.round(px - 1), Math.round(py - 1), 3, 3);
  }, [snapshot]);

  if (!snapshot) return null;

  const hpPct = Math.max(0, Math.min(1, snapshot.hp / Math.max(1, snapshot.maxHp)));
  const stamPct = Math.max(
    0,
    Math.min(1, snapshot.stamina / Math.max(1, snapshot.maxStamina))
  );
  const xpPct = Math.max(0, Math.min(1, snapshot.xp / Math.max(1, snapshot.xpToNext)));
  const ultPct = Math.max(0, Math.min(100, snapshot.ultimateCharge));

  const skillsList = [
    {
      key: '1',
      id: 'lunge',
      name: SKILLS_CONFIG.lunge.name,
      lvl: snapshot.skills.lunge,
      cd: snapshot.cooldowns.lunge,
      maxCd: snapshot.maxCooldowns.lunge,
    },
    {
      key: '2',
      id: 'groundBreak',
      name: SKILLS_CONFIG.groundBreak.name,
      lvl: snapshot.skills.groundBreak,
      cd: snapshot.cooldowns.groundBreak,
      maxCd: snapshot.maxCooldowns.groundBreak,
    },
    {
      key: '3',
      id: 'railSpike',
      name: SKILLS_CONFIG.railSpike.name,
      lvl: snapshot.skills.railSpike,
      cd: snapshot.cooldowns.railSpike,
      maxCd: snapshot.maxCooldowns.railSpike,
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 text-[#D9D2C3]">
      {/* TOP ROW: Portrait + Bars (Left) | Boss Health Bar (Center) | Minimap + Objective (Right) */}
      <div className="flex items-start justify-between gap-4">
        {/* TOP-LEFT: Sena 96x96 Portrait & UI Bar Frames */}
        <div
          data-hud-interactive="true"
          className="pointer-events-auto flex items-start gap-3 bg-[#0B0D10]/95 border-2 border-[#3A3F47] p-2.5 shadow-lg"
        >
          <div className="relative">
            <SenaPortrait
              expression={snapshot.portraitExpression}
              equipped={snapshot.equipped}
              size={64}
            />
            <div className="absolute -bottom-1.5 -right-1.5 bg-[#0B0D10] border border-[#00F0FF] px-1.5 py-0.5 text-[10px] font-bold text-[#00F0FF]">
              LV.{snapshot.level}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[168px]">
            <div className="flex items-center justify-between text-xs font-bold tracking-wider">
              <span className="text-[#D9D2C3]">SENA IBUKI</span>
              <span className="flex items-center gap-1 text-[#FFC83D]">
                <PixelIcon iconType="coin" size={14} />
                {snapshot.gold}G
              </span>
            </div>

            {/* HP BAR (ui_bar_hp.png) */}
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-[#FF3B3B] font-bold">HP</span>
                <span>
                  {snapshot.hp}/{snapshot.maxHp}
                </span>
              </div>
              <PixelBar kind="hp" ratio={hpPct} width={160} height={12} />
            </div>

            {/* STAMINA BAR (ui_bar_stamina.png) */}
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-[#00F0FF] font-bold">STM</span>
                <span>
                  {snapshot.stamina}/{snapshot.maxStamina}
                </span>
              </div>
              <PixelBar kind="stamina" ratio={stamPct} width={160} height={12} />
            </div>

            {/* XP BAR (ui_bar_xp.png) */}
            <div>
              <div className="flex justify-between text-[9px] text-[#D9D2C3]/80 mb-0.5">
                <span className="text-[#FFC83D] font-bold">EXP</span>
                <span>
                  {snapshot.xp}/{snapshot.xpToNext}
                </span>
              </div>
              <PixelBar kind="xp" ratio={xpPct} width={160} height={10} />
            </div>
          </div>
        </div>

        {/* TOP-CENTER: Active Boss Bar OR Boss Title Card */}
        <div className="flex flex-col items-center flex-1 max-w-xl mx-auto">
          {snapshot.activeBoss && (
            <div className="w-full bg-[#0B0D10]/95 border-2 border-[#FF3B3B] p-2.5 shadow-lg">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#FF3B3B] uppercase tracking-widest">
                    {snapshot.activeBoss.name}
                  </span>
                  <span className="text-[10px] text-[#D9D2C3]/70">
                    — {snapshot.activeBoss.subtitle}
                  </span>
                </div>
                <span className="px-1.5 py-0.5 bg-[#8B3A1E] text-[#FFC83D] text-[10px]">
                  PHASE {snapshot.activeBoss.phase}/3
                </span>
              </div>
              <div className="relative h-3.5 w-full bg-[#3A3F47] border border-[#0B0D10]">
                <div
                  className="h-full bg-[#FF3B3B] transition-all duration-100"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        (snapshot.activeBoss.hp / snapshot.activeBoss.maxHp) * 100
                      )
                    )}%`,
                  }}
                />
                <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-[#0B0D10]" />
                <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-[#0B0D10]" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#D9D2C3]">
                  {snapshot.activeBoss.hp} / {snapshot.activeBoss.maxHp}
                </div>
              </div>
            </div>
          )}

          {snapshot.bossNameCard && (
            <div className="mt-3 px-6 py-2 bg-[#0B0D10]/95 border-y-2 border-[#FF3B3B] text-center">
              <div className="text-base font-bold tracking-[0.2em] text-[#FF3B3B]">
                {snapshot.bossNameCard.title}
              </div>
              <div className="text-xs text-[#D9D2C3]">
                {snapshot.bossNameCard.subtitle}
              </div>
            </div>
          )}
        </div>

        {/* TOP-RIGHT: Minimap Frame (/assets/ui_minimap_frame.png) + Area Info */}
        <div
          data-hud-interactive="true"
          className="pointer-events-auto flex flex-col items-end gap-2"
        >
          <div className="flex items-start gap-2.5 bg-[#0B0D10]/95 border-2 border-[#3A3F47] p-2">
            <div className="flex flex-col justify-between text-right min-w-[135px]">
              <div>
                <div className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider">
                  {snapshot.areaName}
                </div>
                <div className="text-[10px] text-[#D9D2C3]/75">
                  {snapshot.areaSubtitle}
                </div>
              </div>

              <div className="mt-2">
                {snapshot.isSafeZone ? (
                  <span className="inline-block px-1.5 py-0.5 bg-[#1F4D4A] text-[#00F0FF] text-[10px] font-bold">
                    SAFE CAMP • HP REGEN
                  </span>
                ) : snapshot.stormActive ? (
                  <span className="inline-block px-1.5 py-0.5 bg-[#8B3A1E] text-[#FFC83D] text-[10px] font-bold">
                    ASH SQUALL ACTIVE
                  </span>
                ) : (
                  <span className="inline-block px-1.5 py-0.5 bg-[#3A3F47]/60 text-[#D9D2C3] text-[10px]">
                    HOSTILE SECTOR
                  </span>
                )}
              </div>

              {snapshot.objective && (
                <div className="mt-2 pt-1.5 border-t border-[#3A3F47] text-[10px]">
                  <div className="text-[#FFC83D] font-bold">
                    TARGET: {snapshot.objective.name}
                  </div>
                  <div className="text-[#D9D2C3]/80">
                    {snapshot.objective.direction} • {snapshot.objective.distance}m
                  </div>
                </div>
              )}
            </div>

            <div className="relative w-[96px] h-[96px]">
              <canvas
                ref={minimapRef}
                width={88}
                height={88}
                className="pixelated absolute top-[4px] left-[4px] block"
              />
              <img
                src="/assets/ui_minimap_frame.png"
                alt="Minimap Frame"
                width={96}
                height={96}
                className="pixelated pointer-events-none relative z-10 block w-full h-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {snapshot.nearUme && (
              <button
                onClick={() => engine.setUiState('shop')}
                className="px-2.5 py-1 bg-[#8B3A1E] hover:bg-[#8B3A1E]/80 border border-[#FFC83D] text-[#FFC83D] text-xs font-bold cursor-pointer"
              >
                [E] UME&apos;S COUNTER
              </button>
            )}
            <button
              onClick={() => engine.setUiState('inventory')}
              className="px-2.5 py-1 bg-[#0B0D10]/90 hover:bg-[#3A3F47] border border-[#3A3F47] text-xs font-bold cursor-pointer"
            >
              [I] GEAR
            </button>
            <button
              onClick={() => engine.setUiState('skills')}
              className={`px-2.5 py-1 bg-[#0B0D10]/90 hover:bg-[#3A3F47] border text-xs font-bold cursor-pointer ${
                snapshot.skillPoints > 0
                  ? 'border-[#00F0FF] text-[#00F0FF]'
                  : 'border-[#3A3F47] text-[#D9D2C3]'
              }`}
            >
              [K] SKILLS {snapshot.skillPoints > 0 ? `(+${snapshot.skillPoints})` : ''}
            </button>
            <button
              onClick={() => {
                sound.toggleMute();
                engine.notifyUi();
              }}
              className="px-2 py-1 bg-[#0B0D10]/90 hover:bg-[#3A3F47] border border-[#3A3F47] text-xs cursor-pointer"
            >
              {sound.muted ? 'MUTE' : 'SFX'}
            </button>
            <button
              onClick={() => engine.setUiState('pause')}
              className="px-2.5 py-1 bg-[#0B0D10]/90 hover:bg-[#3A3F47] border border-[#3A3F47] text-xs font-bold cursor-pointer"
            >
              [ESC]
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Active Skills Bar (1, 2, 3, SPACE, R Ultimate, & Q/F Supplies) */}
      <div className="flex items-end justify-center">
        <div
          data-hud-interactive="true"
          className="pointer-events-auto flex items-center gap-2.5 bg-[#0B0D10]/95 border-2 border-[#3A3F47] px-3 py-2 shadow-lg"
        >
          {skillsList.map((sk) => {
            const onCd = sk.cd > 0.05;
            const cdPct = onCd ? Math.min(100, (sk.cd / sk.maxCd) * 100) : 0;
            return (
              <div
                key={sk.id}
                className="relative flex flex-col items-center"
                title={`${sk.name} (Lv.${sk.lvl})`}
              >
                <div className="relative w-11 h-11 border border-[#3A3F47] bg-[#0B0D10] flex items-center justify-center">
                  <PixelIcon iconType={sk.id} size={36} />
                  {onCd && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#0B0D10]/85 flex items-center justify-center text-xs font-bold text-[#FF3B3B]"
                      style={{ height: `${cdPct}%` }}
                    >
                      {sk.cd.toFixed(1)}
                    </div>
                  )}
                  <span className="absolute top-0.5 left-1 text-[10px] font-bold text-[#00F0FF]">
                    {sk.key}
                  </span>
                  <span className="absolute bottom-0.5 right-1 text-[9px] text-[#FFC83D]">
                    L{sk.lvl}
                  </span>
                </div>
                <span className="text-[10px] mt-0.5 text-[#D9D2C3]/85">
                  {sk.name}
                </span>
              </div>
            );
          })}

          <div className="flex flex-col items-center">
            <div className="relative w-11 h-11 border border-[#3A3F47] bg-[#0B0D10] flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-[#00F0FF]">SPC</span>
              <span className="text-[9px] text-[#D9D2C3]">STEP</span>
              {snapshot.cooldowns.dodge > 0.05 && (
                <div className="absolute inset-0 bg-[#0B0D10]/85 flex items-center justify-center text-xs font-bold text-[#FF3B3B]">
                  {snapshot.cooldowns.dodge.toFixed(1)}
                </div>
              )}
            </div>
            <span className="text-[10px] mt-0.5 text-[#D9D2C3]/85">Dodge</span>
          </div>

          <div className="h-10 w-0.5 bg-[#3A3F47] mx-1" />

          {/* R: SEVEN CUTS ULTIMATE */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-12 h-12 border-2 flex items-center justify-center ${
                ultPct >= 100
                  ? 'border-[#00F0FF] bg-[#1F4D4A]/50 animate-pulse'
                  : 'border-[#3A3F47] bg-[#0B0D10]'
              }`}
            >
              <PixelIcon
                iconType={ultPct >= 100 ? 'sevenCuts' : 'locked'}
                size={38}
              />
              <span className="absolute top-0.5 left-1 text-[10px] font-bold text-[#00F0FF]">
                R
              </span>
              <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-[#FFC83D]">
                {Math.floor(ultPct)}%
              </span>
            </div>
            <span
              className={`text-[10px] mt-0.5 font-bold ${
                ultPct >= 100 ? 'text-[#00F0FF]' : 'text-[#D9D2C3]/70'
              }`}
            >
              Seven Cuts
            </span>
          </div>

          <div className="h-10 w-0.5 bg-[#3A3F47] mx-1" />

          {/* Q & F SUPPLIES */}
          <button
            onClick={() => engine.player.useSupply('gauzeRoll', engine.particles)}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="relative w-10 h-10 border border-[#3A3F47] bg-[#0B0D10] flex items-center justify-center">
              <PixelIcon iconType="gauzeRoll" size={32} />
              <span className="absolute top-0.5 left-1 text-[9px] font-bold text-[#00F0FF]">
                Q
              </span>
              <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-[#D9D2C3]">
                x{snapshot.supplies.gauzeRoll || 0}
              </span>
            </div>
            <span className="text-[9px] mt-0.5 text-[#D9D2C3]/80">Gauze</span>
          </button>

          <button
            onClick={() => engine.player.useSupply('sugarTin', engine.particles)}
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="relative w-10 h-10 border border-[#3A3F47] bg-[#0B0D10] flex items-center justify-center">
              <PixelIcon iconType="sugarTin" size={32} />
              <span className="absolute top-0.5 left-1 text-[9px] font-bold text-[#00F0FF]">
                F
              </span>
              <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-[#D9D2C3]">
                x{snapshot.supplies.sugarTin || 0}
              </span>
            </div>
            <span className="text-[9px] mt-0.5 text-[#D9D2C3]/80">Sugar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
