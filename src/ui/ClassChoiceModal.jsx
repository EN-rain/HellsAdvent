import React, { useEffect } from 'react';
import { CHARACTERS, SPECIALIZATIONS } from '../data/classChangeData.js';
import { PixelIcon, CharacterPortrait } from './PixelWidgets.jsx';
import { sound } from '../game/Audio.js';

/**
 * 3-Card Level-Up Specialization Selection Modal
 * Pops up when the player reaches Level 15 (First Class Change milestone)
 * Player MUST choose one of the 3 cards to specialize their character.
 */
export function ClassChoiceModal({ engine, onSelectClass }) {
  const p = engine.player;
  const chDef = CHARACTERS[p.classId] || CHARACTERS.sena;
  const classKeys = chDef.classes || [];
  const accent = chDef.color || '#00F0FF';

  // Keyboard hotkey support: Keys '1', '2', '3'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        if (classKeys[0]) handleSelect(classKeys[0]);
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        if (classKeys[1]) handleSelect(classKeys[1]);
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        if (classKeys[2]) handleSelect(classKeys[2]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [classKeys]);

  const handleSelect = (classId) => {
    sound.playLevelUp?.();
    sound.playStamp?.();
    sound.playCoin?.();

    if (engine.particles && p) {
      engine.particles.spawnShockwave(p.x, p.y, 140, '#F0B232', 0.5);
      engine.particles.spawnFloatingText(
        p.x,
        p.y - 35,
        `SPECIALIZATION CHOSEN: ${SPECIALIZATIONS[classId]?.name.toUpperCase()}`,
        '#F0B232'
      );
    }

    onSelectClass(classId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A0E]/95 backdrop-blur-md p-4 select-none animate-fadeIn">
      {/* Atmospheric Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      <div className="relative w-full max-w-6xl flex flex-col items-center space-y-6">
        {/* HEADER: Milestone Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1A150A] border-2 border-[#F0B232] shadow-[0_0_16px_rgba(240,178,50,0.4)]">
            <span className="text-[#F0B232] text-sm animate-pulse">★</span>
            <span className="text-xs font-black tracking-widest text-[#F0B232] uppercase">
              CHARACTER LEVEL 15 MILESTONE · CLASS ADVANCEMENT
            </span>
            <span className="text-[#F0B232] text-sm animate-pulse">★</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F0B232] via-[#FFF5D0] to-[#F0B232] uppercase">
            CHOOSE YOUR SPECIALIZATION
          </h2>

          <p className="text-xs md:text-sm text-[#A1B2C2] max-w-2xl mx-auto leading-relaxed">
            Select one of 3 distinct combat disciplines for <strong className="text-white">{chDef.name}</strong>.
            This choice replaces your base weapon stance, awards your signature combat art, and activates your specialization trait.
          </p>

          <div className="text-[11px] text-[#7A8A99] font-semibold italic">
            (Character Level and XP are permanently preserved · Player must choose one card to proceed)
          </div>
        </div>

        {/* 3 SPECIALIZATION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
          {classKeys.map((clsKey, idx) => {
            const spec = SPECIALIZATIONS[clsKey];
            if (!spec) return null;

            const skill0 = spec.skills?.[0];
            const ultSkill = spec.skills?.[4];
            const trait = spec.trait;

            return (
              <div
                key={clsKey}
                onClick={() => handleSelect(clsKey)}
                className="group relative bg-[#0D131A] border-2 border-[#2D3A47] hover:border-[#F0B232] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(240,178,50,0.3)] cursor-pointer"
              >
                {/* Top Corner Number Badge (Hotkey) */}
                <div className="flex items-center justify-between pb-3 border-b border-[#23303D]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center bg-[#1A2633] border border-[#3A4958] text-xs font-black text-[#00F0FF] group-hover:border-[#F0B232] group-hover:text-[#F0B232] transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#15202B] text-[#9BA7AF]">
                      {spec.concept?.split(/[\s/]/)[0] || 'CLASS'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#788896] font-bold">
                    [Key {idx + 1}]
                  </span>
                </div>

                {/* Class Title & Concept */}
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#E3E8E5] group-hover:text-[#F0B232] transition-colors">
                    {spec.name}
                  </h3>
                  <div className="text-[11px] font-bold text-[#FFC83D]">
                    Stance: {spec.weapon || 'Dual Weapons'}
                  </div>
                  <p className="text-xs text-[#95A5B5] leading-snug line-clamp-2">
                    {spec.concept}
                  </p>
                </div>

                {/* Feature 1: Primary Combat Art */}
                {skill0 && (
                  <div className="p-3 bg-[#080D12] border border-[#212C37] group-hover:border-[#F0B232]/40 rounded-lg space-y-1.5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PixelIcon itemId={skill0.icon || 'lunge'} size={24} />
                        <span className="text-xs font-bold text-[#E3E8E5]">
                          {skill0.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#101923] text-[#00F0FF]">
                        Active Art
                      </span>
                    </div>
                    {skill0.tuning && (
                      <div className="text-[10px] font-semibold text-[#FFC83D]">
                        {skill0.tuning}
                      </div>
                    )}
                    <p className="text-[11px] text-[#8C9CA9] leading-snug">
                      {skill0.desc}
                    </p>
                  </div>
                )}

                {/* Feature 2: Specialization Trait */}
                {trait && (
                  <div className="p-3 bg-[#080D12] border border-[#212C37] group-hover:border-[#4FD6A0]/40 rounded-lg space-y-1 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#4FD6A0]">
                        {trait.name}
                      </span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#0F1E1B] text-[#4FD6A0]">
                        Class Trait I
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C9CA9] leading-snug">
                      {trait.ranks?.[15] || trait.desc}
                    </p>
                  </div>
                )}

                {/* Feature 3: Signature Awakening Ultimate Teaser */}
                {ultSkill && (
                  <div className="px-3 py-1.5 bg-[#090D11] border border-[#1C2530] rounded flex items-center justify-between text-[10px]">
                    <span className="text-[#7E8E9B] font-semibold">Awakening Ult (Lv 45):</span>
                    <span className="font-bold text-[#FFC83D] truncate ml-1">{ultSkill.name}</span>
                  </div>
                )}

                {/* CALL TO ACTION BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(clsKey);
                  }}
                  className="w-full py-3 mt-2 font-black text-xs md:text-sm tracking-wider uppercase rounded-lg bg-gradient-to-r from-[#D4931C] to-[#F0B232] hover:from-[#F0B232] hover:to-[#FFD700] text-[#080B0F] shadow-[0_0_14px_rgba(240,178,50,0.4)] group-hover:shadow-[0_0_20px_rgba(240,178,50,0.6)] cursor-pointer transition-all transform active:scale-95"
                >
                  CHOOSE {spec.name.toUpperCase()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ClassChoiceModal;
