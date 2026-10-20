import React, { useState } from 'react';
import { DIALOGUE, PALETTE } from '../data/config.js';
import { worldLedger } from '../game/WorldLedger.js';
import { CharacterPortrait, PixelIcon } from './PixelWidgets.jsx';
import { sound } from '../game/Audio.js';
import {
  CHARACTERS,
  SPECIALIZATIONS,
  getAllSkillsForCharacter,
  getLearnedSkillsForCharacter,
  getDefaultSkillSlots,
  getDefaultPresets,
} from '../data/classChangeData.js';
import { CLASS_TREES, getSpecTree } from '../data/talentTreeData.js';

export function SkillPanel({ engine, onClose, isHarlowMode = false }) {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState('loadout'); // 'loadout' | 'tree' | 'traits'
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'base' | 'new' | 'ult'
  const [selectedSlotForBinding, setSelectedSlotForBinding] = useState(null); // 0..4 (null if none)
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [draggedSkillId, setDraggedSkillId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  const [activeChoiceModal, setActiveChoiceModal] = useState(null);

  const p = engine.player;
  const chDef = CHARACTERS[p.classId] || CHARACTERS.sena;
  const currentSpec = SPECIALIZATIONS[p.activeClassId] || SPECIALIZATIONS[chDef.startingClass] || Object.values(SPECIALIZATIONS)[0];
  const accent = chDef.color || PALETTE.signal;

  const forceRefresh = () => setTick((t) => t + 1);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Ensure arrays exist
  if (!p.skillSlots || p.skillSlots.length !== 4) {
    p.skillSlots = getDefaultSkillSlots(p.classId);
  }
  if (!p.unlockedClasses || p.unlockedClasses.length === 0) {
    p.unlockedClasses = [p.activeClassId || chDef.startingClass];
  }
  if (!p.loadoutPresets || p.loadoutPresets.length !== 3) {
    p.loadoutPresets = getDefaultPresets(p.classId);
  }
  if (!p.treeNodes) {
    p.treeNodes = {};
  }

  const allSkills = getAllSkillsForCharacter(p.classId);
  const learnedSkills = getLearnedSkillsForCharacter(p.classId, p.level, p.unlockedClasses);

  // Filter library skills
  const filteredLibrary = learnedSkills.filter((sk) => {
    const matchesSearch =
      sk.name.toLowerCase().includes(search.toLowerCase()) ||
      sk.source.toLowerCase().includes(search.toLowerCase()) ||
      (sk.desc || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'base') return sk.source === 'Original';
    if (filter === 'new') return sk.source !== 'Original';
    if (filter === 'ult') return sk.type === 'ultimate';
    return true;
  });

  // Direct 1-Click Equip to specific slot
  const handleQuickAssign = (slotIdx, skillId) => {
    const ok = p.assignSkillSlot(slotIdx, skillId);
    if (ok) {
      sound.playStamp?.();
      const sk = allSkills.find((s) => s.id === skillId);
      showToast(`Equipped ${sk?.name || 'skill'} to slot ${slotIdx === 4 ? '[R]' : `[${slotIdx + 1}]`}!`);
      engine.saveProgress();
      setSelectedSlotForBinding(null);
      setSelectedSkillId(null);
      forceRefresh();
    } else {
      sound.playHit?.(false);
      showToast(slotIdx === 4 ? 'Only ultimates can be assigned to [R].' : 'Ultimates can only be assigned to [R].');
    }
  };

  // Unequip Slot
  const handleUnequipSlot = (slotIdx) => {
    p.assignSkillSlot(slotIdx, null);
    sound.playHit?.(false);
    showToast(`Unequipped slot ${slotIdx === 4 ? '[R]' : `[${slotIdx + 1}]`}.`);
    engine.saveProgress();
    forceRefresh();
  };

  // Clear all slots
  const handleClearAllSlots = () => {
    p.skillSlots = [null, null, null, null];
    p.ultimateSlot = null;
    sound.playHit?.(false);
    showToast('Cleared all active combat slots.');
    engine.saveProgress();
    forceRefresh();
  };

  // Reset to default starting class skills
  const handleResetDefaults = () => {
    p.skillSlots = getDefaultSkillSlots(p.classId);
    p.ultimateSlot = chDef.ultimate?.id || null;
    sound.playCoin?.();
    showToast('Reset equipped combat slots to class defaults.');
    engine.saveProgress();
    forceRefresh();
  };

  // Click on hotbar slot (selection mode)
  const handleSlotClick = (slotIdx) => {
    if (selectedSkillId) {
      handleQuickAssign(slotIdx, selectedSkillId);
      return;
    }

    if (selectedSlotForBinding === slotIdx) {
      setSelectedSlotForBinding(null);
      return;
    }

    setSelectedSlotForBinding(slotIdx);
    showToast(`Slot ${slotIdx === 4 ? '[R]' : `[${slotIdx + 1}]`} highlighted. Click any ability below to equip.`);
  };

  // Ability card click
  const handleAbilityCardClick = (skillId) => {
    if (selectedSlotForBinding !== null) {
      handleQuickAssign(selectedSlotForBinding, skillId);
      return;
    }

    const isSelected = selectedSkillId === skillId;
    setSelectedSkillId(isSelected ? null : skillId);
    showToast(isSelected ? 'Deselected ability.' : `Selected ${allSkills.find((s) => s.id === skillId)?.name}. Click a hotbar slot to equip.`);
  };

  // Drag and drop handlers
  const handleDragStart = (e, skillId) => {
    setDraggedSkillId(skillId);
    e.dataTransfer.setData('text/plain', skillId);
  };

  const handleDrop = (e, slotIdx) => {
    e.preventDefault();
    const skillId = draggedSkillId || e.dataTransfer.getData('text/plain');
    if (!skillId) return;

    handleQuickAssign(slotIdx, skillId);
    setDraggedSkillId(null);
  };

  // Presets
  const handleSavePreset = (idx) => {
    p.savePreset(idx);
    sound.playCoin?.();
    showToast(`Saved current loadout to preset "${p.loadoutPresets[idx].name}".`);
    engine.saveProgress();
    forceRefresh();
  };

  const handleLoadPreset = (idx) => {
    p.loadPreset(idx);
    sound.playStamp?.();
    showToast(`Equipped loadout preset "${p.loadoutPresets[idx].name}"!`);
    engine.saveProgress();
    forceRefresh();
  };

  // Tree variant toggle
  const handleTreeChoice = (nodeKey, choiceIdx) => {
    p.investTreeNode(nodeKey, choiceIdx);
    engine.saveProgress();
    forceRefresh();
  };

  // Intrinsic & Class Trait
  const intrinsicTrait = p.getIntrinsicTrait();
  const classTrait = p.getClassTrait();

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#070A0E]/95 p-3 select-none backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-6xl xl:max-w-7xl bg-[#0B1017] border-2 border-[#253240] rounded-xl flex flex-col max-h-[94vh] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* TOP HEADER: Branding, Character Level (Permanent), XP, Points */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#253240] px-4 py-3 bg-[#0E1520]">
          <div className="flex items-center gap-3">
            <CharacterPortrait
              classId={p.classId}
              expression="normal"
              equipped={p.equipped}
              stage={p.stage}
              branch={p.branch}
              size={48}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wider text-[#E3E8E5]">
                  HELLS<span style={{ color: accent }}>ADVENT</span>
                </span>
                <span className="text-xs text-[#00F0FF] font-bold">/ ABILITIES &amp; TALENTS</span>
                <span
                  className="px-2.5 py-0.5 text-xs font-black rounded bg-[#101923] border"
                  style={{ borderColor: accent, color: accent }}
                >
                  {chDef.name.toUpperCase()} · {currentSpec.name.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-[#8C9CA9] mt-0.5">
                Stance: <strong className="text-[#FFC83D]">{currentSpec.weapon || 'Dual Weapons'}</strong> · {currentSpec.concept}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-[#7E8E9B] font-bold tracking-widest uppercase">
                Permanent Character Level
              </div>
              <div className="text-base font-black tabular-nums" style={{ color: accent }}>
                LV {p.level}{' '}
                <span className="text-xs text-[#8C9CA9] font-normal">
                  ({p.xp.toLocaleString()} XP)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1.5 bg-[#0B121A] border-2 rounded-lg text-xs font-black tabular-nums shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                style={{ borderColor: accent, color: accent }}
              >
                ⭐ TALENT POINTS: {p.getAvailableTreePoints()}/8
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-[#17222E] border border-[#344658] hover:border-[#00F0FF] text-xs font-bold text-[#E3E8E5] hover:text-[#00F0FF] rounded-lg cursor-pointer transition-colors"
              >
                [ESC / K] CLOSE
              </button>
            </div>
          </div>
        </div>

        {/* HERO STATUS STRIP: ACTIVE SPECIALIZATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-[#1E2936] bg-[#0A0F16]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-[#7E8E9B] uppercase tracking-wider">
              Active Specialization:
            </span>
            {p.level >= 15 || p.chosenClassAtLevel15 ? (
              <div className="flex items-center gap-2 px-3 py-0.5 bg-[#101D27] border border-[#00F0FF] rounded-full text-xs font-black text-[#00F0FF]">
                <span>{currentSpec.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#051F14] text-[#4FD6A0] font-bold">
                  ✓ ACTIVE SPECIALIZATION
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-0.5 bg-[#141A20] border border-[#3A4550] rounded-full text-xs font-bold text-[#8FA0AD]">
                <span>{chDef.name} Core</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#1F1905] text-[#FFC83D] font-bold">
                  🔒 3-Card Choice Unlocks at Lv 15
                </span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#7E8E9B] font-medium">
            {p.level >= 15 || p.chosenClassAtLevel15
              ? `Locked via Level 15 milestone choice · Character Level and XP are permanently preserved.`
              : `Reach Level 15 to automatically trigger the 3-card specialization advancement!`}
          </div>
        </div>

        {/* MODERN TABS NAVIGATION */}
        <div className="flex border-b border-[#202D3C] bg-[#0E141D]">
          <button
            onClick={() => setActiveTab('loadout')}
            className={`flex-1 py-2.5 text-xs font-black tracking-wider border-r border-[#202D3C] cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activeTab === 'loadout'
                ? 'bg-[#152535] text-[#00F0FF] border-b-2 border-b-[#00F0FF] shadow-inner'
                : 'text-[#8292A1] hover:text-[#E3E8E5] hover:bg-[#121A24]'
            }`}
          >
            <span>⚔</span> ABILITY LOADOUT &amp; HOTBAR
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex-1 py-2.5 text-xs font-black tracking-wider border-r border-[#202D3C] cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activeTab === 'tree'
                ? 'bg-[#152535] text-[#00F0FF] border-b-2 border-b-[#00F0FF] shadow-inner'
                : 'text-[#8292A1] hover:text-[#E3E8E5] hover:bg-[#121A24]'
            }`}
          >
            <span>🌳</span> DUAL TALENT TREES (CLASS &amp; SPEC)
          </button>
          <button
            onClick={() => setActiveTab('traits')}
            className={`flex-1 py-2.5 text-xs font-black tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activeTab === 'traits'
                ? 'bg-[#152535] text-[#00F0FF] border-b-2 border-b-[#00F0FF] shadow-inner'
                : 'text-[#8292A1] hover:text-[#E3E8E5] hover:bg-[#121A24]'
            }`}
          >
            <span>✦</span> AUTO-EVOLVING TRAITS
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: USER-FRIENDLY COMBAT LOADOUT & ABILITY DECK */}
          {activeTab === 'loadout' && (
            <div className="space-y-4">
              {/* SECTION 1: DIRECT COMBAT HOTBAR (HUD MIRROR) */}
              <div className="p-4 bg-[#0F1722] border-2 border-[#202E3D] rounded-xl shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#202E3D]">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#00F0FF] flex items-center gap-2">
                      <span>ACTIVE COMBAT HOTBAR</span>
                      <span className="text-[10px] text-[#7E8E9B] font-bold">· KEYS 1–4 &amp; SIGNATURE ULTIMATE [R]</span>
                    </h3>
                    <p className="text-[11px] text-[#8C9CA9] mt-0.5">
                      Click any slot to set as target, or use the direct <strong className="text-white">[Equip 1–4]</strong> buttons on cards below.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetDefaults}
                      className="px-2.5 py-1 text-[11px] font-bold bg-[#141F2B] border border-[#2B3D4F] hover:border-[#00F0FF] text-[#8C9CA9] hover:text-[#00F0FF] rounded cursor-pointer transition-colors"
                      title="Reset hotbar to default class abilities"
                    >
                      ↺ Defaults
                    </button>
                    <button
                      onClick={handleClearAllSlots}
                      className="px-2.5 py-1 text-[11px] font-bold bg-[#1B1417] border border-[#44232B] hover:border-[#FF5252] text-[#A67882] hover:text-[#FF5252] rounded cursor-pointer transition-colors"
                      title="Clear all equipped slots"
                    >
                      ✕ Clear All
                    </button>
                  </div>
                </div>

                {/* 5 HOTBAR SLOTS (4 ACTIVE + 1 ULTIMATE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const skillId = p.skillSlots[slotIdx];
                    const sk = allSkills.find((s) => s.id === skillId);
                    const isTarget = selectedSlotForBinding === slotIdx;
                    const isSelected = selectedSkillId === skillId && skillId !== null;

                    return (
                      <div
                        key={slotIdx}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, slotIdx)}
                        onClick={() => handleSlotClick(slotIdx)}
                        title={sk ? `${sk.name} [Key ${slotIdx + 1}]:\n${sk.desc || ''}\nCooldown: ${sk.cooldown || 0}s · Stamina: ${sk.staminaCost || 10}` : `Empty Hotbar Slot ${slotIdx + 1}`}
                        className={`relative p-3 rounded-lg border-2 flex flex-col justify-between min-h-[92px] cursor-pointer transition-all ${
                          isTarget
                            ? 'bg-[#142636] border-[#00F0FF] ring-2 ring-[#00F0FF] shadow-[0_0_16px_rgba(0,240,255,0.4)]'
                            : isSelected
                            ? 'bg-[#182633] border-[#00F0FF]'
                            : sk
                            ? 'bg-[#111A24] border-[#293B4D] hover:border-[#00F0FF]/80 shadow-md'
                            : 'bg-[#0B121A] border-dashed border-[#233140] hover:border-[#00F0FF]/50'
                        }`}
                      >
                        {/* Slot Header: Key Badge + Unequip Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded flex items-center justify-center bg-[#182635] border border-[#3A526A] text-xs font-black text-[#00F0FF]">
                              {slotIdx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-[#7E8E9B] uppercase">
                              KEY [{slotIdx + 1}]
                            </span>
                          </div>

                          {sk && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnequipSlot(slotIdx);
                              }}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#7E8E9B] hover:text-[#FF5252] hover:bg-[#2A151A] text-xs font-bold cursor-pointer transition-colors"
                              title="Unequip ability from this slot"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Slot Content */}
                        {sk ? (
                          <div className="flex items-center gap-2.5 my-1">
                            <div className="w-10 h-10 rounded-lg bg-[#182533] border border-[#30455B] flex items-center justify-center shrink-0 shadow-inner">
                              <PixelIcon itemId={sk.icon || 'lunge'} size={28} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-[#E3E8E5] truncate">
                                {sk.name}
                              </div>
                              <div className="text-[10px] font-semibold text-[#00F0FF] flex items-center gap-1.5">
                                <span>⏱ {sk.cooldown > 0 ? `${sk.cooldown}s` : '0s'}</span>
                                <span>·</span>
                                <span>⚡ {sk.staminaCost || 10} STAM</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="my-auto text-center py-2">
                            <div className="text-xs font-bold text-[#55697A]">
                              {isTarget ? '► CLICK ABILITY BELOW' : '+ EMPTY SLOT'}
                            </div>
                            <div className="text-[10px] text-[#425261]">
                              {isTarget ? 'Binding target active' : 'Click to select target'}
                            </div>
                          </div>
                        )}

                        {/* Slot Status Tag */}
                        <div className="text-[9px] font-bold uppercase tracking-wider text-right text-[#586A7A]">
                          {sk ? (sk.source === 'Original' ? 'Base Art' : sk.source) : 'Active Slot'}
                        </div>
                      </div>
                    );
                  })}

                  {/* ULTIMATE SLOT [R] */}
                  {(() => {
                    const ultSk = allSkills.find((s) => s.id === p.ultimateSlot);
                    const isTarget = selectedSlotForBinding === 4;
                    const isSelected = selectedSkillId === p.ultimateSlot && p.ultimateSlot !== null;

                    return (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, 4)}
                        onClick={() => handleSlotClick(4)}
                        title={ultSk ? `${ultSk.name} [Ultimate Key R]:\n${ultSk.desc || ''}` : 'Empty Signature Ultimate Slot [R]'}
                        className={`relative p-3 rounded-lg border-2 flex flex-col justify-between min-h-[92px] cursor-pointer transition-all ${
                          isTarget
                            ? 'bg-[#291F0B] border-[#FFC83D] ring-2 ring-[#FFC83D] shadow-[0_0_16px_rgba(255,200,61,0.4)]'
                            : isSelected
                            ? 'bg-[#261E0E] border-[#FFC83D]'
                            : ultSk
                            ? 'bg-[#18140B] border-[#59471E] hover:border-[#FFC83D] shadow-md'
                            : 'bg-[#0E0C07] border-dashed border-[#443615] hover:border-[#FFC83D]/60'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded flex items-center justify-center bg-[#291F0D] border border-[#FFC83D] text-xs font-black text-[#FFC83D]">
                              R
                            </span>
                            <span className="text-[10px] font-black text-[#FFC83D] uppercase">
                              ULTIMATE [R]
                            </span>
                          </div>

                          {ultSk && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnequipSlot(4);
                              }}
                              className="w-5 h-5 rounded flex items-center justify-center text-[#9E8B61] hover:text-[#FF5252] hover:bg-[#2A151A] text-xs font-bold cursor-pointer transition-colors"
                              title="Unequip ultimate"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Content */}
                        {ultSk ? (
                          <div className="flex items-center gap-2.5 my-1">
                            <div className="w-10 h-10 rounded-lg bg-[#291E0B] border border-[#FFC83D]/60 flex items-center justify-center shrink-0 shadow-inner">
                              <PixelIcon itemId={ultSk.icon || 'sevenCuts'} size={28} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-[#FFC83D] truncate">
                                {ultSk.name}
                              </div>
                              <div className="text-[10px] font-semibold text-[#E3B755]">
                                Signature Awakening Art
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="my-auto text-center py-2">
                            <div className="text-xs font-bold text-[#8C763F]">
                              {isTarget ? '► SELECT ULTIMATE BELOW' : '+ ASSIGN ULTIMATE'}
                            </div>
                            <div className="text-[10px] text-[#635329]">
                              Awakening Art [R]
                            </div>
                          </div>
                        )}

                        <div className="text-[9px] font-bold uppercase tracking-wider text-right text-[#FFC83D]/70">
                          {ultSk ? ultSk.source : 'Awakening'}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* LOADOUT PRESETS STRIP */}
                <div className="pt-2 border-t border-[#202E3D] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-[#8C9CA9]">
                      Loadout Presets:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {p.loadoutPresets.map((preset, idx) => {
                        const isCurrent =
                          Array.isArray(preset.slots) &&
                          p.skillSlots.every((s, sIdx) => s === preset.slots[sIdx]) &&
                          p.ultimateSlot === preset.ultimate;

                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs ${
                              isCurrent
                                ? 'bg-[#122424] border-[#4FD6A0] text-[#4FD6A0]'
                                : 'bg-[#101720] border-[#2B3B4C] text-[#8C9CA9]'
                            }`}
                          >
                            <span className="font-bold">{preset.name}</span>
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleLoadPreset(idx)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer transition-colors ${
                                  isCurrent
                                    ? 'bg-[#193B2F] text-[#4FD6A0]'
                                    : 'bg-[#172433] hover:bg-[#00F0FF] hover:text-[#080B0F] text-[#00F0FF]'
                                }`}
                                title={`Apply ${preset.name} loadout`}
                              >
                                {isCurrent ? '✓ ACTIVE' : 'LOAD'}
                              </button>
                              <button
                                onClick={() => handleSavePreset(idx)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#141C25] hover:bg-[#253545] text-[#8C9CA9] hover:text-white cursor-pointer transition-colors"
                                title="Overwrite preset with current hotbar loadout"
                              >
                                💾 SAVE
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#7E8E9B] italic">
                    Presets save 4 active arts + 1 signature ultimate per character.
                  </div>
                </div>
              </div>

              {/* SECTION 2: MODERN ABILITY GRIMOIRE & CARDS */}
              <div className="p-4 bg-[#0F1722] border-2 border-[#202E3D] rounded-xl shadow-lg space-y-3.5">
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#202E3D]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#E3E8E5]">
                      Learned Ability Deck
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#132330] border border-[#00F0FF]/40 text-[#00F0FF]">
                      {learnedSkills.length} UNLOCKED
                    </span>
                  </div>

                  {/* Search Bar + Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search abilities by name or description..."
                        className="w-56 md:w-72 px-3 py-1.5 bg-[#090E14] border border-[#2B3B4C] focus:border-[#00F0FF] rounded-lg text-xs text-[#E3E8E5] placeholder-[#55697A] focus:outline-none"
                      />
                      {search && (
                        <button
                          onClick={() => setSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7E8E9B] hover:text-white text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 bg-[#090E14] p-1 rounded-lg border border-[#233140]">
                      {[
                        { id: 'all', label: `All (${learnedSkills.length})` },
                        { id: 'base', label: 'Base Arts' },
                        { id: 'new', label: 'Spec Arts' },
                        { id: 'ult', label: 'Ultimates' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setFilter(tab.id)}
                          className={`px-2.5 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                            filter === tab.id
                              ? 'bg-[#152737] text-[#00F0FF] border border-[#00F0FF]/60 shadow-sm'
                              : 'text-[#7E8E9B] hover:text-[#E3E8E5]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ABILITY CARDS RESPONSIVE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {filteredLibrary.map((sk) => {
                    const isUlt = sk.type === 'ultimate';
                    const activeSlotIdx = p.skillSlots.indexOf(sk.id);
                    const isEquippedActive = activeSlotIdx !== -1;
                    const isEquippedUlt = p.ultimateSlot === sk.id;
                    const isEquipped = isUlt ? isEquippedUlt : isEquippedActive;
                    const isSelected = selectedSkillId === sk.id;

                    return (
                      <div
                        key={sk.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, sk.id)}
                        onClick={() => handleAbilityCardClick(sk.id)}
                        className={`group p-3.5 rounded-xl border-2 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 select-none ${
                          isSelected
                            ? 'bg-[#152B3A] border-[#00F0FF] ring-2 ring-[#00F0FF]'
                            : isEquipped
                            ? isUlt
                              ? 'bg-[#1C170A] border-[#FFC83D] shadow-[0_0_12px_rgba(255,200,61,0.25)]'
                              : 'bg-[#0E1D1B] border-[#4FD6A0] shadow-[0_0_12px_rgba(79,214,160,0.25)]'
                            : 'bg-[#0D141C] border-[#223140] hover:border-[#00F0FF]/70 hover:shadow-lg'
                        }`}
                      >
                        {/* Top Row: Icon + Name + Category + Level */}
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center shrink-0 shadow-inner ${
                              isUlt
                                ? 'bg-[#291F0B] border-[#FFC83D]'
                                : 'bg-[#152330] border-[#30455B] group-hover:border-[#00F0FF]'
                            }`}
                          >
                            <PixelIcon itemId={sk.icon || 'lunge'} size={32} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-sm font-black text-[#E3E8E5] group-hover:text-[#00F0FF] truncate transition-colors">
                                {sk.name}
                              </h4>
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#090E14] border border-[#2B3B4C] text-[#8C9CA9] shrink-0">
                                LV {sk.level}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  isUlt
                                    ? 'bg-[#291E0B] text-[#FFC83D] border border-[#FFC83D]/40'
                                    : sk.source === 'Original'
                                    ? 'bg-[#131D27] text-[#8C9CA9] border border-[#293B4D]'
                                    : 'bg-[#0B202B] text-[#00F0FF] border border-[#00F0FF]/40'
                                }`}
                              >
                                {isUlt ? 'Awakening Ultimate' : sk.source === 'Original' ? 'Base Combat Art' : `${sk.source} Art`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Row: Combat Parameters Strip */}
                        <div className="flex items-center gap-2 pt-1 border-t border-[#1C2733] text-[11px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-[#080D12] border border-[#1C2733] text-[#00F0FF]">
                            ⏱ {sk.cooldown > 0 ? `${sk.cooldown}s CD` : '0s CD'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#080D12] border border-[#1C2733] text-[#4FD6A0]">
                            ⚡ {sk.staminaCost > 0 ? `${sk.staminaCost} Stamina` : 'Free'}
                          </span>
                          {sk.tuning && (
                            <span className="text-[10px] text-[#FFC83D] truncate ml-auto font-medium">
                              ★ {sk.tuning.split(';')[0]}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#95A5B5] leading-relaxed line-clamp-2">
                          {sk.desc}
                        </p>

                        {/* 1-CLICK QUICK ACTION BAR */}
                        <div
                          className="pt-2 border-t border-[#1C2733]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isUlt ? (
                            /* Ultimate Quick Controls */
                            isEquippedUlt ? (
                              <div className="flex items-center justify-between p-1.5 rounded bg-[#261E0E] border border-[#FFC83D]">
                                <span className="text-xs font-black text-[#FFC83D] flex items-center gap-1.5">
                                  <span>✓</span> EQUIPPED AS SIGNATURE [R]
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUnequipSlot(4)}
                                  className="px-2 py-0.5 text-[10px] font-bold bg-[#38151A] hover:bg-[#FF5252] text-[#FFB0B0] hover:text-[#0B0D10] rounded cursor-pointer transition-colors"
                                >
                                  Unequip
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickAssign(4, sk.id)}
                                className="w-full py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#D4931C] to-[#F0B232] hover:brightness-110 text-[#080B0F] shadow-[0_0_10px_rgba(240,178,50,0.3)] cursor-pointer transition-all transform active:scale-95"
                              >
                                ⭐ EQUIP AS SIGNATURE ULTIMATE [R]
                              </button>
                            )
                          ) : (
                            /* Active Skill Quick Controls (Slot 1..4) */
                            isEquippedActive ? (
                              <div className="flex items-center justify-between p-1.5 rounded bg-[#0F2420] border border-[#4FD6A0]">
                                <span className="text-xs font-black text-[#4FD6A0] flex items-center gap-1.5">
                                  <span>✓</span> EQUIPPED IN SLOT [{activeSlotIdx + 1}]
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUnequipSlot(activeSlotIdx)}
                                  className="px-2 py-0.5 text-[10px] font-bold bg-[#38151A] hover:bg-[#FF5252] text-[#FFB0B0] hover:text-[#0B0D10] rounded cursor-pointer transition-colors"
                                >
                                  Unequip
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-black uppercase text-[#7E8E9B]">
                                  Equip To:
                                </span>
                                <div className="grid grid-cols-4 gap-1.5 flex-1">
                                  {[0, 1, 2, 3].map((slotIdx) => (
                                    <button
                                      key={slotIdx}
                                      type="button"
                                      onClick={() => handleQuickAssign(slotIdx, sk.id)}
                                      className="py-1 px-1 rounded bg-[#132230] border border-[#2D455D] hover:border-[#00F0FF] hover:bg-[#00F0FF] text-[#E3E8E5] hover:text-[#080B0F] font-black text-[11px] cursor-pointer transition-all text-center"
                                      title={`Equip into Slot ${slotIdx + 1} (Key ${slotIdx + 1})`}
                                    >
                                      Slot {slotIdx + 1}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredLibrary.length === 0 && (
                    <div className="col-span-full py-12 text-center space-y-2 bg-[#090E14] border border-[#1E2B38] rounded-xl">
                      <div className="text-base font-bold text-[#7E8E9B]">
                        No learned abilities found matching "{search}".
                      </div>
                      <p className="text-xs text-[#55697A]">
                        Try searching for another keyword or switch category filters.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* USER-FRIENDLY PRO TIP & INDEPENDENCE BANNER */}
              <div className="p-3 bg-[#0C1520] border border-[#202F40] rounded-xl flex items-center justify-between text-xs text-[#8C9CA9]">
                <div className="flex items-center gap-2">
                  <span className="text-[#00F0FF] font-bold">💡 Pro Tip:</span>
                  <span>
                    Click any <strong className="text-white">Slot 1–4</strong> button to bind immediately. Drag &amp; drop onto hotbar slots is also supported!
                  </span>
                </div>
                <span className="text-[11px] text-[#55697A]">
                  Abilities execute independently with authentic cooldowns and costs.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: WORLD OF WARCRAFT STYLE DUAL TALENT TREES */}
          {activeTab === 'tree' && (() => {
            const classTree = CLASS_TREES[p.classId] || CLASS_TREES.sena;
            const specTree = getSpecTree(p.activeClassId) || getSpecTree('phantomEdge');
            const characterSpecs = Object.values(SPECIALIZATIONS).filter((s) => s.char === p.classId);

            // Compute points spent
            const allNodes = [...(classTree?.nodes || []), ...(specTree?.nodes || [])];
            const allNodesMap = new Map(allNodes.map((n) => [n.id, n]));

            let classSpent = 0;
            for (const n of classTree?.nodes || []) {
              const val = p.treeNodes[n.id];
              if (val !== undefined) {
                classSpent += typeof val === 'number' ? val : (val?.rank || 1);
              }
            }
            let specSpent = 0;
            for (const n of specTree?.nodes || []) {
              const val = p.treeNodes[n.id];
              if (val !== undefined) {
                specSpent += typeof val === 'number' ? val : (val?.rank || 1);
              }
            }

            const isNodeLearned = (nodeId) => p.treeNodes && p.treeNodes[nodeId] !== undefined;

            const getNodeRank = (node) => {
              if (!p.treeNodes) return 0;
              const val = p.treeNodes[node.id];
              if (val === undefined) return 0;
              if (typeof val === 'number') return val;
              if (typeof val === 'object' && typeof val.rank === 'number') return val.rank;
              return 1;
            };

            const getNodeChoice = (node) => {
              if (!p.treeNodes) return 0;
              const val = p.treeNodes[node.id];
              if (val === undefined) return 0;
              if (typeof val === 'object') return val.choice ?? 0;
              if (typeof val === 'number') return val;
              return 0;
            };

            const canLearn = (node) => {
              const r = getNodeRank(node);
              if (r >= node.maxRank) return false;
              if (p.getAvailableTreePoints() <= 0) return false;
              if (!node.parents || node.parents.length === 0) return true;
              return node.parents.some((pid) => isNodeLearned(pid));
            };

            const canRefund = (node, treeNodesList) => {
              if (!isNodeLearned(node.id)) return false;
              if (getNodeRank(node) > 1) return true;
              // Check if any child depends exclusively on this node
              const learnedChildren = treeNodesList.filter((child) => {
                if (!isNodeLearned(child.id)) return false;
                return child.parents && child.parents.includes(node.id);
              });
              for (const child of learnedChildren) {
                const otherLearned = child.parents.filter((pid) => pid !== node.id && isNodeLearned(pid));
                if (otherLearned.length === 0) return false;
              }
              return true;
            };

            const handleNodeClick = (node, treeNodesList) => {
              if (node.type === 'choice') {
                setActiveChoiceModal({
                  node,
                  isLearned: isNodeLearned(node.id),
                  choice: getNodeChoice(node),
                });
                return;
              }

              if (getNodeRank(node) >= node.maxRank) {
                showToast(`${node.name} is at maximum rank (${node.maxRank}/${node.maxRank}).`);
                return;
              }

              if (p.getAvailableTreePoints() <= 0) {
                showToast('No available talent points. Gain levels or use +SP button.');
                return;
              }

              if (!canLearn(node)) {
                showToast('Prerequisites not met. Learn connected parent talents first.');
                return;
              }

              const res = p.investTalent(node.id, node.maxRank, undefined, node.type);
              if (res.success) {
                engine.saveProgress();
                forceRefresh();
                showToast(`Invested point into ${node.name} (Rank ${p.treeNodes[node.id]}/${node.maxRank}).`);
              }
            };

            const handleNodeRightClick = (node, treeNodesList) => {
              if (!isNodeLearned(node.id)) {
                showToast(`${node.name} is not learned yet.`);
                return;
              }

              if (!canRefund(node, treeNodesList)) {
                showToast('Cannot refund: higher-tier talents depend on this node!');
                return;
              }

              const res = p.refundTalent(node.id);
              if (res.success) {
                engine.saveProgress();
                forceRefresh();
                showToast(`Refunded 1 point from ${node.name}.`);
              }
            };

            const handleQuickChoice = (node, choiceIdx) => {
              if (!isNodeLearned(node.id)) {
                if (p.getAvailableTreePoints() <= 0) {
                  showToast('No available talent points.');
                  return;
                }
                if (!canLearn(node)) {
                  showToast('Prerequisites not met. Learn connected parent talents first.');
                  return;
                }
              }
              const res = p.investTalent(node.id, 1, choiceIdx, 'choice');
              if (res.success) {
                engine.saveProgress();
                forceRefresh();
                showToast(`Selected ${node.forks?.[choiceIdx]?.title || 'Variant'} for ${node.name}!`);
              }
            };

            // Render a single tree canvas (Class or Spec)
            const renderTreeCanvas = (treeDef, isClass) => {
              if (!treeDef) return null;
              return (
                <div className="flex flex-col items-center">
                  {/* Tree Column Header */}
                  <div className="w-[460px] flex items-center justify-between px-3 py-2 bg-[#121921] border-2 border-[#25303D] border-b-0 rounded-t-lg">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: isClass ? '#00F0FF' : '#FFC83D' }}>
                        {isClass ? `${chDef.name} · CLASS TREE` : `${currentSpec.name} · SPEC TREE`}
                      </div>
                      <div className="text-xs font-bold text-[#E3E8E5]">
                        {treeDef.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isClass && (
                        <span className="px-2.5 py-0.5 text-[11px] font-black bg-[#1A150A] border border-[#FFC83D]/60 text-[#FFC83D] rounded">
                          {currentSpec.name}
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-[10px] font-black bg-[#0B0D10] border border-[#384858] text-[#E3E8E5] rounded">
                        {isClass ? classSpent : specSpent} PTS
                      </span>
                    </div>
                  </div>

                  {/* SVG & Node Interactive Canvas */}
                  <div className="relative w-[460px] h-[540px] bg-[#0A0E13] border-2 border-[#25303D] rounded-b-lg shadow-inner overflow-hidden select-none">
                    {/* Atmospheric background */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#394B5E_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div
                      className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-10 pointer-events-none"
                      style={{ backgroundColor: treeDef.accent || (isClass ? '#00F0FF' : '#F0B232') }}
                    />

                    {/* SVG Connecting Vector Network */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 460 540">
                      <defs>
                        <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {treeDef.nodes.map((node) => {
                        if (!node.parents || node.parents.length === 0) return null;
                        return node.parents.map((pid) => {
                          const parentNode = treeDef.nodes.find((n) => n.id === pid);
                          if (!parentNode) return null;

                          const pLearned = isNodeLearned(parentNode.id);
                          const nLearned = isNodeLearned(node.id);
                          const isLit = pLearned && nLearned;
                          const isAvailable = pLearned && !nLearned && canLearn(node);

                          const x1 = 35 + parentNode.col * 65;
                          const y1 = 35 + parentNode.row * 78;
                          const x2 = 35 + node.col * 65;
                          const y2 = 35 + node.row * 78;

                          let stroke = '#242F3C';
                          let strokeWidth = 1.5;
                          let filter = undefined;
                          let strokeDasharray = undefined;

                          if (isLit) {
                            stroke = isClass ? '#00F0FF' : '#F0B232';
                            strokeWidth = 2.5;
                            filter = isClass ? 'url(#cyan-glow)' : 'url(#gold-glow)';
                          } else if (isAvailable) {
                            stroke = isClass ? '#00F0FF99' : '#F0B23299';
                            strokeWidth = 2;
                            strokeDasharray = '4 3';
                          }

                          return (
                            <line
                              key={`${pid}->${node.id}`}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={stroke}
                              strokeWidth={strokeWidth}
                              filter={filter}
                              strokeDasharray={strokeDasharray}
                              strokeLinecap="round"
                            />
                          );
                        });
                      })}
                    </svg>

                    {/* Nodes Overlay */}
                    {treeDef.nodes.map((node) => {
                      const learned = isNodeLearned(node.id);
                      const curRank = getNodeRank(node);
                      const isMax = curRank >= node.maxRank;
                      const readyToLearn = canLearn(node);
                      const chosenFork = getNodeChoice(node);

                      const left = 35 + node.col * 65 - 21;
                      const top = 35 + node.row * 78 - 21;

                      return (
                        <div
                          key={node.id}
                          style={{ left: `${left}px`, top: `${top}px` }}
                          className="absolute w-[42px] h-[42px] flex items-center justify-center cursor-pointer select-none group"
                          onClick={() => handleNodeClick(node, treeDef.nodes)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleNodeRightClick(node, treeDef.nodes);
                          }}
                          onMouseEnter={(e) => {
                            setHoveredNode({
                              node,
                              x: e.clientX,
                              y: e.clientY,
                              rank: curRank,
                              isLearned: learned,
                              canLearn: readyToLearn,
                              choice: chosenFork,
                            });
                          }}
                          onMouseMove={(e) => {
                            setHoveredNode({
                              node,
                              x: e.clientX,
                              y: e.clientY,
                              rank: curRank,
                              isLearned: learned,
                              canLearn: readyToLearn,
                              choice: chosenFork,
                            });
                          }}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          {/* SHAPE 1: ACTIVE / SQUARE */}
                          {node.shape === 'square' && (
                            <div
                              className={`w-full h-full rounded-md flex items-center justify-center relative transition-all duration-150 ${
                                learned
                                  ? isClass
                                    ? 'bg-[#0E1E28] border-2 border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                                    : 'bg-[#1C160A] border-2 border-[#F0B232] shadow-[0_0_12px_rgba(240,178,50,0.6)]'
                                  : readyToLearn
                                  ? 'bg-[#0E151C] border-2 border-[#F0B232]/70 shadow-[0_0_6px_rgba(240,178,50,0.3)] animate-pulse'
                                  : 'bg-[#070A0E] border-2 border-[#26313C] opacity-45 grayscale hover:opacity-75'
                              }`}
                            >
                              <PixelIcon itemId={node.icon} size={28} />
                              <div
                                className={`absolute -bottom-1 -right-1 px-1 py-0.2 rounded border text-[8px] font-black leading-none bg-[#090D11] ${
                                  learned ? (isClass ? 'border-[#00F0FF] text-[#00F0FF]' : 'border-[#F0B232] text-[#F0B232]') : 'border-[#303B47] text-[#697785]'
                                }`}
                              >
                                {curRank}/{node.maxRank}
                              </div>
                            </div>
                          )}

                          {/* SHAPE 2: PASSIVE / CIRCLE */}
                          {node.shape === 'circle' && (
                            <div
                              className={`w-full h-full rounded-full flex items-center justify-center relative transition-all duration-150 ${
                                isMax
                                  ? isClass
                                    ? 'bg-[#0E1E28] border-2 border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                                    : 'bg-[#1C160A] border-2 border-[#F0B232] shadow-[0_0_12px_rgba(240,178,50,0.6)]'
                                  : learned
                                  ? 'bg-[#0E1B1B] border-2 border-[#4FD6A0] shadow-[0_0_8px_rgba(79,214,160,0.5)]'
                                  : readyToLearn
                                  ? 'bg-[#0C151B] border-2 border-[#4FD6A0]/70 shadow-[0_0_6px_rgba(79,214,160,0.3)] animate-pulse'
                                  : 'bg-[#070A0E] border-2 border-[#26313C] opacity-45 grayscale hover:opacity-75'
                              }`}
                            >
                              <PixelIcon itemId={node.icon} size={26} />
                              <div
                                className={`absolute -bottom-1 -right-1 px-1 py-0.2 rounded border text-[8px] font-black leading-none bg-[#090D11] ${
                                  isMax
                                    ? isClass
                                      ? 'border-[#00F0FF] text-[#00F0FF]'
                                      : 'border-[#F0B232] text-[#F0B232]'
                                    : learned
                                    ? 'border-[#4FD6A0] text-[#4FD6A0]'
                                    : 'border-[#303B47] text-[#697785]'
                                }`}
                              >
                                {curRank}/{node.maxRank}
                              </div>
                            </div>
                          )}

                          {/* SHAPE 3: CHOICE / OCTAGON WITH < > CHEVRONS */}
                          {node.shape === 'octagon' && (
                            <div className="w-full h-full relative flex items-center justify-center">
                              {/* Left Chevron Button: Selects Fork 0 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickChoice(node, 0);
                                }}
                                title={`Select ${node.forks?.[0]?.title || 'Variant A'}`}
                                className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-6 flex items-center justify-center cursor-pointer select-none transition-transform active:scale-75 z-10"
                              >
                                <span
                                  className={`text-[10px] font-black transition-all ${
                                    learned && chosenFork === 0
                                      ? 'text-[#F0B232] scale-125 drop-shadow-[0_0_4px_#F0B232]'
                                      : 'text-[#4A5766] hover:text-[#E3E8E5]'
                                  }`}
                                >
                                  ◄
                                </span>
                              </button>

                              {/* Right Chevron Button: Selects Fork 1 */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickChoice(node, 1);
                                }}
                                title={`Select ${node.forks?.[1]?.title || 'Variant B'}`}
                                className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-6 flex items-center justify-center cursor-pointer select-none transition-transform active:scale-75 z-10"
                              >
                                <span
                                  className={`text-[10px] font-black transition-all ${
                                    learned && chosenFork === 1
                                      ? 'text-[#F0B232] scale-125 drop-shadow-[0_0_4px_#F0B232]'
                                      : 'text-[#4A5766] hover:text-[#E3E8E5]'
                                  }`}
                                >
                                  ►
                                </span>
                              </button>

                              {/* Octagonal SVG Outline */}
                              <svg className="w-[42px] h-[42px] absolute inset-0 pointer-events-none" viewBox="0 0 42 42">
                                <polygon
                                  points="12,2 30,2 40,12 40,30 30,40 12,40 2,30 2,12"
                                  fill={learned ? '#1C160A' : '#080B0F'}
                                  stroke={learned ? '#F0B232' : readyToLearn ? '#F0B23288' : '#26313C'}
                                  strokeWidth="2.5"
                                  filter={learned ? 'url(#gold-glow)' : undefined}
                                  className={!learned && readyToLearn ? 'animate-pulse' : undefined}
                                />
                              </svg>

                              <PixelIcon itemId={node.icon} size={24} />

                              {/* Fork Tag Badge */}
                              {learned && (
                                <div className="absolute -top-1 -right-1 px-1 bg-[#140E04] border border-[#F0B232] text-[#F0B232] text-[8px] font-black rounded-sm leading-tight z-10">
                                  {chosenFork === 0 ? (node.forks?.[0]?.tag || 'A') : (node.forks?.[1]?.tag || 'B')}
                                </div>
                              )}

                              <div
                                className={`absolute -bottom-1 -right-1 px-1 py-0.2 rounded border text-[8px] font-black leading-none bg-[#090D11] z-10 ${
                                  learned ? 'border-[#F0B232] text-[#F0B232]' : 'border-[#303B47] text-[#697785]'
                                }`}
                              >
                                {curRank}/{node.maxRank}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-4">
                {/* GLOBAL TALENT TREE CONTROL HEADER */}
                <div className="flex flex-wrap items-center justify-between p-3.5 bg-[#121B22] border border-[#34404B] rounded-lg shadow-md gap-3">
                  <div>
                    <h3 className="text-xs font-black tracking-wider text-[#00F0FF] uppercase flex items-center gap-2">
                      <span>DUAL TALENT TREES</span>
                      <span className="text-[10px] text-[#9BA7AF] font-bold">· CLASS &amp; SPECIALIZATION MASTERY</span>
                    </h3>
                    <p className="text-[11px] text-[#9BA7AF] mt-0.5">
                      Left-Click to Learn · Right-Click to Refund · Mutually exclusive choice nodes denoted with ◄ ►
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Points Medallion */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1015] border-2 border-[#F0B232] rounded shadow-[0_0_10px_rgba(240,178,50,0.3)]">
                      <span className="text-[#F0B232] text-sm">⭐</span>
                      <span className="text-xs font-black text-[#F0B232]">
                        {p.getAvailableTreePoints()} TALENT POINTS
                      </span>
                    </div>

                    {/* Quick Cheat Buttons for easy build testing */}
                    <button
                      onClick={() => {
                        p.bonusSkillPoints = (p.bonusSkillPoints || 0) + 1;
                        p.recalculateStats(false);
                        forceRefresh();
                        showToast(`+1 Skill Point added! Unspent: ${p.getAvailableTreePoints()}`);
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-[#15232E] border border-[#00F0FF]/60 hover:border-[#00F0FF] text-[#00F0FF] rounded cursor-pointer transition-colors"
                      title="Add 1 talent point for testing"
                    >
                      +1 SP
                    </button>
                    <button
                      onClick={() => {
                        p.bonusSkillPoints = (p.bonusSkillPoints || 0) + 5;
                        p.recalculateStats(false);
                        forceRefresh();
                        showToast(`+5 Skill Points added! Unspent: ${p.getAvailableTreePoints()}`);
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-[#15232E] border border-[#00F0FF]/60 hover:border-[#00F0FF] text-[#00F0FF] rounded cursor-pointer transition-colors"
                      title="Add 5 talent points for testing"
                    >
                      +5 SP
                    </button>

                    {/* Free Respec */}
                    <button
                      onClick={() => {
                        p.respecTree();
                        engine.saveProgress();
                        forceRefresh();
                        showToast('All talent points refunded! Character stats recalculated.');
                      }}
                      className="px-3 py-1 text-xs font-bold bg-[#1F1418] border border-[#FF6262] text-[#FF6262] hover:bg-[#FF6262] hover:text-[#0B0D10] rounded cursor-pointer transition-colors"
                    >
                      FREE RESPEC
                    </button>
                  </div>
                </div>

                {/* DUAL TREE SIDE-BY-SIDE PANELS */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 py-1 overflow-x-auto">
                  {/* LEFT: CLASS TREE */}
                  {renderTreeCanvas(classTree, true)}

                  {/* RIGHT: SPEC TREE */}
                  {renderTreeCanvas(specTree, false)}
                </div>

                {/* CHOICE NODE MODAL COMPARISON */}
                {activeChoiceModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="w-full max-w-lg bg-[#0F1720] border-2 border-[#F0B232] shadow-[0_0_24px_rgba(240,178,50,0.35)] p-5 rounded-lg space-y-4 select-none">
                      <div className="flex items-center justify-between pb-3 border-b border-[#303E4D]">
                        <div>
                          <span className="text-[10px] font-black text-[#00F0FF] uppercase tracking-wider">
                            Mutation Choice Node
                          </span>
                          <h3 className="text-sm font-black text-[#F0B232] mt-0.5">
                            {activeChoiceModal.node.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveChoiceModal(null)}
                          className="text-[#9BA7AF] hover:text-white text-base font-bold px-2 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <p className="text-[11px] text-[#9BA7AF]">
                        Choose one mutually exclusive specialization mutation fork. You can change your choice freely at any time.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeChoiceModal.node.forks?.map((fork, fIdx) => {
                          const isPicked = activeChoiceModal.isLearned && activeChoiceModal.choice === fIdx;
                          return (
                            <div
                              key={fIdx}
                              className={`p-3.5 rounded border flex flex-col justify-between space-y-2.5 transition-all ${
                                isPicked
                                  ? 'bg-[#221D11] border-[#F0B232] shadow-[0_0_10px_rgba(240,178,50,0.3)]'
                                  : 'bg-[#0E151D] border-[#2A3744] hover:border-[#F0B232]/60'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#16222D] border border-[#384858] text-[#00F0FF]">
                                    VARIANT {fIdx === 0 ? 'A' : 'B'} · [{fork.tag || (fIdx === 0 ? 'A' : 'B')}]
                                  </span>
                                  {isPicked && (
                                    <span className="text-[10px] font-black text-[#4FD6A0]">
                                      ✓ ACTIVE
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold text-[#E3E8E5] mt-1.5">
                                  {fork.title}
                                </h4>
                                <p className="text-[11px] text-[#9BA7AF] mt-1 leading-snug">
                                  {fork.desc}
                                </p>
                              </div>

                              <button
                                onClick={() => {
                                  handleQuickChoice(activeChoiceModal.node, fIdx);
                                  setActiveChoiceModal(null);
                                }}
                                className={`w-full py-1.5 text-xs font-black rounded border cursor-pointer transition-colors ${
                                  isPicked
                                    ? 'bg-[#F0B232] text-[#0B0D10] border-[#F0B232]'
                                    : 'bg-[#15232E] border-[#384858] text-[#E3E8E5] hover:border-[#F0B232] hover:text-[#F0B232]'
                                }`}
                              >
                                {isPicked ? 'CURRENTLY ACTIVE' : `SELECT VARIANT ${fIdx === 0 ? 'A' : 'B'}`}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setActiveChoiceModal(null)}
                          className="px-4 py-1.5 text-xs font-bold bg-[#141C24] border border-[#384858] text-[#9BA7AF] hover:text-[#E3E8E5] rounded cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FLOATING RICH TOOLTIP */}
                {hoveredNode && (
                  <div
                    className="fixed z-50 pointer-events-none w-80 bg-[#0C1218]/95 border-2 border-[#384858] p-3.5 rounded-lg shadow-2xl backdrop-blur-md text-xs space-y-2 select-none"
                    style={{
                      left: Math.min(window.innerWidth - 340, hoveredNode.x + 16),
                      top: Math.min(window.innerHeight - 300, hoveredNode.y - 12),
                    }}
                  >
                    <div className="flex items-start justify-between border-b border-[#2B3846] pb-2">
                      <div className="flex items-center gap-2">
                        <PixelIcon itemId={hoveredNode.node.icon} size={28} />
                        <div>
                          <div className="font-black text-sm text-[#F0B232]">
                            {hoveredNode.node.name}
                          </div>
                          <div className="text-[10px] font-bold text-[#8FA2B2] uppercase">
                            {hoveredNode.node.type === 'active'
                              ? 'Active Ability'
                              : hoveredNode.node.type === 'choice'
                              ? 'Mutation Choice Node'
                              : 'Passive Talent'}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-black px-1.5 py-0.5 rounded bg-[#131C24] border border-[#384858] text-[#E3E8E5]">
                        Rank {hoveredNode.rank} / {hoveredNode.node.maxRank}
                      </div>
                    </div>

                    {hoveredNode.node.tuning && (
                      <div className="text-[11px] font-bold text-[#FFC83D]">
                        {hoveredNode.node.tuning}
                      </div>
                    )}

                    <div className="text-[11px] text-[#C2D0DC] leading-relaxed">
                      {hoveredNode.node.desc}
                    </div>

                    {/* Choice Forks */}
                    {hoveredNode.node.type === 'choice' && hoveredNode.node.forks && (
                      <div className="pt-2 border-t border-[#253240] space-y-1.5">
                        <div className="text-[10px] font-black uppercase text-[#00F0FF]">
                          Exclusive Mutation Branches (◄ ►):
                        </div>
                        {hoveredNode.node.forks.map((f, fIdx) => {
                          const isChosen = hoveredNode.choice === fIdx;
                          return (
                            <div
                              key={fIdx}
                              className={`p-1.5 rounded border text-[10px] ${
                                isChosen
                                  ? 'bg-[#221F13] border-[#F0B232] text-[#F0B232]'
                                  : 'bg-[#101720] border-[#2A3744] text-[#8E9FA9]'
                              }`}
                            >
                              <div className="font-bold flex items-center justify-between">
                                <span>[{f.tag || (fIdx === 0 ? 'A' : 'B')}] {f.title}</span>
                                {isChosen && <span className="text-[9px] text-[#4FD6A0]">✓ ACTIVE</span>}
                              </div>
                              <div className="text-[10px] text-[#C2D0DC] mt-0.5 leading-snug">
                                {f.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Next Rank Description */}
                    {hoveredNode.node.nextDesc && hoveredNode.rank < hoveredNode.node.maxRank && (
                      <div className="pt-2 border-t border-[#253240] text-[10px] text-[#4FD6A0]">
                        <span className="font-bold uppercase">Next Rank:</span> {hoveredNode.node.nextDesc}
                      </div>
                    )}

                    {/* Stats provided */}
                    {hoveredNode.node.stats && Object.keys(hoveredNode.node.stats).length > 0 && (
                      <div className="pt-1.5 border-t border-[#253240] flex flex-wrap gap-1.5 text-[10px]">
                        {hoveredNode.node.stats.atk && (
                          <span className="px-1.5 py-0.5 bg-[#1B252E] text-[#FF8585] rounded border border-[#FF8585]/30">
                            +{hoveredNode.node.stats.atk * Math.max(1, hoveredNode.rank)} ATK
                          </span>
                        )}
                        {hoveredNode.node.stats.hp && (
                          <span className="px-1.5 py-0.5 bg-[#1B252E] text-[#4FD6A0] rounded border border-[#4FD6A0]/30">
                            +{hoveredNode.node.stats.hp * Math.max(1, hoveredNode.rank)} HP
                          </span>
                        )}
                        {hoveredNode.node.stats.stamina && (
                          <span className="px-1.5 py-0.5 bg-[#1B252E] text-[#00F0FF] rounded border border-[#00F0FF]/30">
                            +{hoveredNode.node.stats.stamina * Math.max(1, hoveredNode.rank)} Stamina
                          </span>
                        )}
                        {hoveredNode.node.stats.def && (
                          <span className="px-1.5 py-0.5 bg-[#1B252E] text-[#FFC83D] rounded border border-[#FFC83D]/30">
                            +{hoveredNode.node.stats.def * Math.max(1, hoveredNode.rank)} Armor
                          </span>
                        )}
                        {hoveredNode.node.stats.speed && (
                          <span className="px-1.5 py-0.5 bg-[#1B252E] text-[#85E2FF] rounded border border-[#85E2FF]/30">
                            +{hoveredNode.node.stats.speed * Math.max(1, hoveredNode.rank)} Speed
                          </span>
                        )}
                        {hoveredNode.node.stats.critChance && (
                          <span className="px-1.5 py-0.5 bg-[#1B252E] text-[#FFB020] rounded border border-[#FFB020]/30">
                            +{(hoveredNode.node.stats.critChance * Math.max(1, hoveredNode.rank) * 100).toFixed(0)}% Crit
                          </span>
                        )}
                        {hoveredNode.node.stats.cdr && (
                          <span className="px-1.5 py-0.5 bg-[#1B252E] text-[#C084FC] rounded border border-[#C084FC]/30">
                            -{(hoveredNode.node.stats.cdr * Math.max(1, hoveredNode.rank) * 100).toFixed(0)}% CDR
                          </span>
                        )}
                      </div>
                    )}

                    {/* Requirements if locked */}
                    {!hoveredNode.isLearned && hoveredNode.node.parents && hoveredNode.node.parents.length > 0 && !hoveredNode.canLearn && (
                      <div className="pt-1.5 border-t border-[#3B2626] text-[10px] text-[#FF7575] font-bold">
                        🔒 Requires: {hoveredNode.node.parents.map((pid) => allNodesMap.get(pid)?.name || pid).join(' or ')}
                      </div>
                    )}

                    {/* Action Prompt */}
                    <div className="pt-1.5 border-t border-[#253240] text-[9px] text-[#7E8E9B] font-semibold flex justify-between">
                      <span>[Left-Click] {hoveredNode.node.type === 'choice' ? 'Configure Fork' : hoveredNode.rank < hoveredNode.node.maxRank ? 'Learn / Upgrade' : 'Maxed'}</span>
                      <span>[Right-Click] Refund</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 3: AUTO TRAITS */}
          {activeTab === 'traits' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-3 bg-[#0C1B25] border border-[#354753] text-[11px] text-[#B1CAD4]">
                Traits upgrade <strong className="text-[#00F0FF]">AUTOMATICALLY</strong> at character milestones (Levels 1, 15, 30, 45). They cost zero skill points and never reset when switching specializations.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Character Intrinsic Trait */}
                {intrinsicTrait && (
                  <div className="p-4 bg-[#101B24] border border-[#34404B] rounded space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#9BA7AF] uppercase">
                        Permanent Intrinsic Trait (Character-Wide)
                      </span>
                      <h4 className="text-sm font-black text-[#00F0FF] mt-0.5">
                        {intrinsicTrait.name} · Rank {intrinsicTrait.roman}
                      </h4>
                      <p className="text-[11px] text-[#9BA7AF] mt-1 leading-snug">
                        {intrinsicTrait.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#34404B]">
                      {[
                        { lv: 1, rank: 'I', desc: chDef.intrinsic.ranks[1] },
                        { lv: 15, rank: 'II', desc: chDef.intrinsic.ranks[15] },
                        { lv: 30, rank: 'III', desc: chDef.intrinsic.ranks[30] },
                        { lv: 45, rank: 'IV', desc: chDef.intrinsic.ranks[45] },
                      ].map((tier) => {
                        const active = p.level >= tier.lv;
                        return (
                          <div
                            key={tier.lv}
                            className={`p-2 border rounded text-xs ${
                              active
                                ? 'bg-[#14232C] border-[#00F0FF]/50 text-[#E3E8E5]'
                                : 'bg-[#0B1218] border-[#34404B]/40 text-[#52616A]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[10px]">
                              <span>LV {tier.lv} · RANK {tier.rank}</span>
                              <span style={{ color: active ? '#4FD6A0' : '#52616A' }}>
                                {active ? '✓ ACTIVE' : 'LOCKED'}
                              </span>
                            </div>
                            <div className="text-[10px] mt-1 leading-snug">{tier.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Class Trait */}
                {classTrait && (
                  <div className="p-4 bg-[#101B24] border border-[#34404B] rounded space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#9BA7AF] uppercase">
                        Active Specialization Trait
                      </span>
                      <h4 className="text-sm font-black text-[#FFC83D] mt-0.5">
                        {classTrait.name} · Rank {classTrait.roman}
                      </h4>
                      <p className="text-[11px] text-[#9BA7AF] mt-1 leading-snug">
                        {classTrait.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#34404B]">
                      {[
                        { lv: 15, rank: 'I', desc: currentSpec.trait.ranks[15] },
                        { lv: 30, rank: 'II', desc: currentSpec.trait.ranks[30] },
                        { lv: 45, rank: 'III', desc: currentSpec.trait.ranks[45] },
                      ].map((tier) => {
                        const active = p.level >= tier.lv;
                        return (
                          <div
                            key={tier.lv}
                            className={`p-2 border rounded text-xs ${
                              active
                                ? 'bg-[#221F14] border-[#FFC83D]/50 text-[#E3E8E5]'
                                : 'bg-[#0B1218] border-[#34404B]/40 text-[#52616A]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[10px]">
                              <span>LV {tier.lv} · RANK {tier.rank}</span>
                              <span style={{ color: active ? '#FFC83D' : '#52616A' }}>
                                {active ? '✓ ACTIVE' : 'LOCKED'}
                              </span>
                            </div>
                            <div className="text-[10px] mt-1 leading-snug">{tier.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STATUS / TOAST BAR */}
        <div className="px-4 py-2 bg-[#0C131A] border-t border-[#34404B] flex items-center justify-between text-xs">
          <span className="text-[#00F0FF] font-bold">
            {toastMessage || 'Ready. Click or drag to assign abilities.'}
          </span>
          <span className="text-[#9BA7AF] text-[11px]">
            HellsAdvent Class Specialization System (v4.1)
          </span>
        </div>
      </div>
    </div>
  );
}
