import React from 'react';
import { SKILLS_CONFIG } from '../data/config.js';
import { PixelIcon } from './PixelWidgets.jsx';

export function SkillPanel({ engine, onClose }) {
  const p = engine.player;

  const activeSkills = [
    {
      cfg: SKILLS_CONFIG.lunge,
      icon: 'skill_lunge',
      level: p.skills.lunge,
      formatCurrent: (s) =>
        `${Math.round(s.damageMult * 100)}% ATK · ${s.cooldown}s CD · ${s.staminaCost} Stamina`,
      formatNext: (s) =>
        `${Math.round(s.damageMult * 100)}% ATK (+20%) · ${s.cooldown}s CD (-0.4s)`,
    },
    {
      cfg: SKILLS_CONFIG.groundBreak,
      icon: 'skill_groundBreak',
      level: p.skills.groundBreak,
      formatCurrent: (s) =>
        `${Math.round(s.damageMult * 100)}% ATK · ${s.radius}px Radius · ${s.stunDuration}s Stun`,
      formatNext: (s) =>
        `${Math.round(s.damageMult * 100)}% ATK (+15%) · ${s.radius}px Radius (+12px)`,
    },
    {
      cfg: SKILLS_CONFIG.railSpike,
      icon: 'skill_railSpike',
      level: p.skills.railSpike,
      formatCurrent: (s) =>
        `${Math.round(s.damageMult * 100)}% ATK · Pierces ${s.pierce} · ${s.range}px Range`,
      formatNext: (s) =>
        `${Math.round(s.damageMult * 100)}% ATK (+20%) · Pierces ${s.pierce} (+1)`,
    },
  ];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/85 p-6">
      <div className="w-full max-w-3xl bg-[#0B0D10] border-2 border-[#3A3F47] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3A3F47] px-5 py-3.5 bg-[#161A20]">
          <div>
            <h2 className="text-base font-bold tracking-wider text-[#D9D2C3]">
              RAILCUT TECHNIQUES · SKILL PANEL [K]
            </h2>
            <p className="text-xs text-[#9E9789] mt-0.5">
              Each level-up grants +1 Skill Point. Max level 5 per active technique.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-[#00F0FF] tabular-nums">
              SKILL POINTS: {p.skillPoints}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#0B0D10] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3]"
            >
              [ESC / K] CLOSE
            </button>
          </div>
        </div>

        {/* Skills List */}
        <div className="p-5 space-y-3">
          {activeSkills.map(({ cfg, icon, level, formatCurrent, formatNext }) => {
            const isMax = level >= cfg.maxLevel;
            const canUpgrade = p.skillPoints > 0 && !isMax;
            const curStats = cfg.getStats(level);
            const nextStats = !isMax ? cfg.getStats(level + 1) : null;

            return (
              <div
                key={cfg.id}
                className="p-4 bg-[#161A20] border border-[#3A3F47] flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <PixelIcon itemId={icon} size={48} />
                    <span className="absolute -top-1.5 -left-1.5 bg-[#0B0D10] border border-[#00F0FF] px-1.5 py-0.5 text-[10px] font-bold text-[#00F0FF]">
                      KEY {cfg.hotkey}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-[#D9D2C3]">
                        {cfg.name}
                      </span>
                      <span className="text-xs font-bold text-[#00F0FF] tabular-nums">
                        Level {level} / {cfg.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#9E9789] mt-1">{cfg.desc}</p>
                    <div className="text-xs text-[#D9D2C3] mt-1.5 font-medium tabular-nums">
                      Current: {formatCurrent(curStats)}
                    </div>
                    {nextStats && (
                      <div className="text-xs text-[#2CE8A2] mt-0.5 tabular-nums">
                        Next Level: {formatNext(nextStats)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  {/* Level pips */}
                  <div className="flex gap-1">
                    {Array.from({ length: cfg.maxLevel }, (_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 border ${
                          idx < level
                            ? 'bg-[#00F0FF] border-[#00F0FF]'
                            : 'bg-[#0B0D10] border-[#3A3F47]'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    disabled={!canUpgrade}
                    onClick={() => engine.upgradeSkill(cfg.id)}
                    className={`px-3.5 py-1.5 text-xs font-bold border whitespace-nowrap ${
                      isMax
                        ? 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789] cursor-default'
                        : canUpgrade
                        ? 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#0B0D10]'
                        : 'bg-[#0B0D10] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                    }`}
                  >
                    {isMax ? 'MAX LEVEL' : 'UPGRADE (1 SP)'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Ultimate: Seven Cuts (Cannot be leveled) */}
          <div className="p-4 bg-[#0B0D10] border-2 border-[#FFC83D] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FFC83D]">
                  [R] ULTIMATE
                </span>
                <span className="text-sm font-bold text-[#D9D2C3]">
                  {SKILLS_CONFIG.sevenCuts.name}
                </span>
                <span className="text-xs text-[#9E9789]">
                  · Fixed Rank (Cannot Be Leveled)
                </span>
              </div>
              <p className="text-xs text-[#9E9789] mt-1">
                {SKILLS_CONFIG.sevenCuts.desc}
              </p>
              <div className="text-xs text-[#00F0FF] mt-1 tabular-nums">
                500% Total ATK across 7 cuts · 300px Radius · Invulnerable while active
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-[#FFC83D] tabular-nums">
                CHARGE: {Math.floor(p.ultimateCharge)}%
              </div>
              <div className="text-[10px] text-[#9E9789] mt-0.5">
                Fills from dealing & taking damage
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillPanel;
