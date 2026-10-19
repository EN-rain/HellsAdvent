import React, { useState } from 'react';
import { DIALOGUE, PALETTE } from '../data/config.js';
import { worldLedger } from '../game/WorldLedger.js';
import { CharacterPortrait, PixelIcon } from './PixelWidgets.jsx';
import {
  CHARACTERS,
  SPECIALIZATIONS,
  getAllSkillsForCharacter,
  getLearnedSkillsForCharacter,
  getDefaultSkillSlots,
  getDefaultPresets,
} from '../data/classChangeData.js';

export function SkillPanel({ engine, onClose, isHarlowMode = false }) {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState('loadout'); // 'loadout' | 'tree' | 'traits'
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'base' | 'new' | 'ult'
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [draggedSkillId, setDraggedSkillId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

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

  // Assign or Swap slot
  const handleSlotClick = (slotIdx) => {
    if (selectedSkillId) {
      const ok = p.assignSkillSlot(slotIdx, selectedSkillId);
      if (ok) {
        showToast(`Equipped to slot ${slotIdx === 4 ? '[R]' : `[${slotIdx + 1}]`}. No cross-class combos created.`);
        engine.saveProgress();
      } else {
        showToast(slotIdx === 4 ? 'Only ultimates can be assigned to [R].' : 'Ultimates can only be assigned to [R].');
      }
      setSelectedSkillId(null);
      forceRefresh();
      return;
    }

    // If clicking an existing filled slot without selection, select it for moving/swapping
    const curSkillId = slotIdx === 4 ? p.ultimateSlot : p.skillSlots[slotIdx];
    if (curSkillId) {
      setSelectedSkillId(curSkillId);
      showToast('Selected. Click another slot to swap or assign.');
    }
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

    const ok = p.assignSkillSlot(slotIdx, skillId);
    if (ok) {
      showToast(`Assigned to slot ${slotIdx === 4 ? '[R]' : `[${slotIdx + 1}]`}.`);
      engine.saveProgress();
    } else {
      showToast(slotIdx === 4 ? 'Only ultimates can be placed in [R].' : 'Ultimates can only be placed in [R].');
    }
    setDraggedSkillId(null);
    setSelectedSkillId(null);
    forceRefresh();
  };

  // Class switching
  const handleSwitchClass = (newClassId) => {
    const ok = p.switchClass(newClassId);
    if (ok) {
      showToast(`Class switched to ${SPECIALIZATIONS[newClassId]?.name}. Character level (${p.level}) and XP retained!`);
      engine.saveProgress();
      forceRefresh();
    }
  };

  // Presets
  const handleSavePreset = (idx) => {
    p.savePreset(idx);
    showToast(`Saved preset "${p.loadoutPresets[idx].name}".`);
    engine.saveProgress();
    forceRefresh();
  };

  const handleLoadPreset = (idx) => {
    p.loadPreset(idx);
    showToast(`Loaded preset "${p.loadoutPresets[idx].name}".`);
    engine.saveProgress();
    forceRefresh();
  };

  // Respec
  const handleRespec = () => {
    p.respecTree();
    showToast('Tree points refunded for active class! Learned skills, level, and XP remain intact.');
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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/95 p-3 select-none">
      <div className="w-full max-w-6xl bg-[#0F151B] border-2 border-[#3A3F47] flex flex-col max-h-[94vh] shadow-2xl">
        {/* TOP HEADER: Branding, Character Level (Permanent), XP, Points */}
        <div className="flex flex-wrap items-center justify-between border-b-2 border-[#3A3F47] px-4 py-3 bg-[#121920]">
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
                <span className="text-base font-extrabold tracking-wider text-[#E3E8E5]">
                  HELLS<span style={{ color: accent }}>ADVENT</span>
                </span>
                <span className="text-xs text-[#9BA7AF]">/ SKILL ARCHIVE</span>
                <span
                  className="px-2 py-0.5 text-xs font-bold bg-[#0B0D10] border"
                  style={{ borderColor: accent, color: accent }}
                >
                  {chDef.name.toUpperCase()} · {currentSpec.name.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-[#9BA7AF] mt-0.5">
                {currentSpec.concept}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-[#9BA7AF] font-bold tracking-wider">
                CHARACTER LEVEL — ALWAYS RETAINED
              </div>
              <div className="text-lg font-black tabular-nums" style={{ color: accent }}>
                LV {p.level}{' '}
                <span className="text-xs text-[#9BA7AF] font-normal">
                  ({p.xp.toLocaleString()} XP)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="px-2.5 py-1 bg-[#0B0D10] border text-xs font-bold tabular-nums"
                style={{ borderColor: accent, color: accent }}
              >
                TREE POINTS: {p.getAvailableTreePoints()}/8
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-[#19232D] border border-[#34404B] hover:border-[#00F0FF] text-xs font-bold text-[#E3E8E5] cursor-pointer"
              >
                [ESC / K] CLOSE
              </button>
            </div>
          </div>
        </div>

        {/* CONTROLS STRIP: Class Selector & Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-[#34404B] bg-[#11171E]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#9BA7AF] uppercase">
              Specialization:
            </span>
            <div className="flex items-center gap-1.5">
              {chDef.classes.map((clsKey) => {
                const spec = SPECIALIZATIONS[clsKey];
                const isActive = p.activeClassId === clsKey;
                const isUnlocked = (p.unlockedClasses || []).includes(clsKey) || p.level >= 15;

                return (
                  <button
                    key={clsKey}
                    onClick={() => handleSwitchClass(clsKey)}
                    className={`px-3 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#1C303B] border-[#00F0FF] text-[#00F0FF]'
                        : isUnlocked
                        ? 'bg-[#19232D] border-[#34404B] text-[#E3E8E5] hover:border-[#00F0FF]'
                        : 'bg-[#0B0D10] border-[#34404B] text-[#52616A] cursor-not-allowed'
                    }`}
                    title={spec.concept}
                  >
                    {spec.name} {isActive ? '✓' : !isUnlocked ? '🔒 (Lv 15)' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-[#9BA7AF] italic">
            Switching class preserves character level, XP, inventory, and learned skills.
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-[#34404B] bg-[#111820]">
          <button
            onClick={() => setActiveTab('loadout')}
            className={`flex-1 py-2 text-xs font-extrabold tracking-wider border-r border-[#34404B] cursor-pointer transition-colors ${
              activeTab === 'loadout'
                ? 'bg-[#1A333E] text-[#00F0FF] border-b-2 border-b-[#00F0FF]'
                : 'text-[#9BA7AF] hover:text-[#E3E8E5] hover:bg-[#16222B]'
            }`}
          >
            INTERACTIVE LOADOUT &amp; PRESETS
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex-1 py-2 text-xs font-extrabold tracking-wider border-r border-[#34404B] cursor-pointer transition-colors ${
              activeTab === 'tree'
                ? 'bg-[#1A333E] text-[#00F0FF] border-b-2 border-b-[#00F0FF]'
                : 'text-[#9BA7AF] hover:text-[#E3E8E5] hover:bg-[#16222B]'
            }`}
          >
            BRANCHING SPECIALIZATION TREE
          </button>
          <button
            onClick={() => setActiveTab('traits')}
            className={`flex-1 py-2 text-xs font-extrabold tracking-wider cursor-pointer transition-colors ${
              activeTab === 'traits'
                ? 'bg-[#1A333E] text-[#00F0FF] border-b-2 border-b-[#00F0FF]'
                : 'text-[#9BA7AF] hover:text-[#E3E8E5] hover:bg-[#16222B]'
            }`}
          >
            AUTO-EVOLVING TRAITS
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* TAB 1: LOADOUT */}
          {activeTab === 'loadout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Learned Skills Library (5 cols) */}
              <div className="lg:col-span-5 bg-[#121B22] border border-[#34404B] p-3 flex flex-col max-h-[580px]">
                <div className="flex items-center justify-between pb-2 border-b border-[#34404B]">
                  <span className="text-xs font-extrabold text-[#E3E8E5] tracking-wider uppercase">
                    Learned Skill Library
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0B0D10] text-[#00F0FF] border border-[#00F0FF]/40">
                    {learnedSkills.length} LEARNED
                  </span>
                </div>

                {/* Search & Filters */}
                <div className="my-2.5 space-y-2">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search learned skills..."
                    className="w-full px-2.5 py-1.5 bg-[#0C131A] border border-[#34404B] text-xs text-[#E3E8E5] focus:outline-none focus:border-[#00F0FF]"
                  />
                  <div className="flex gap-1">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'base', label: 'Original' },
                      { id: 'new', label: 'Class' },
                      { id: 'ult', label: 'Ultimates' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setFilter(btn.id)}
                        className={`flex-1 py-1 text-[10px] font-bold border cursor-pointer ${
                          filter === btn.id
                            ? 'bg-[#1C303B] border-[#00F0FF] text-[#00F0FF]'
                            : 'bg-[#19232D] border-[#34404B] text-[#9BA7AF] hover:text-[#E3E8E5]'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skill List */}
                <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                  {filteredLibrary.map((sk) => {
                    const isSelected = selectedSkillId === sk.id;
                    const isUlt = sk.type === 'ultimate';

                    return (
                      <div
                        key={sk.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, sk.id)}
                        onClick={() => {
                          setSelectedSkillId(isSelected ? null : sk.id);
                          showToast(isSelected ? 'Deselected.' : `Selected ${sk.name}. Click a slot to assign.`);
                        }}
                        className={`p-2.5 border rounded-sm flex items-start gap-2.5 cursor-grab active:cursor-grabbing transition-all ${
                          isSelected
                            ? 'bg-[#1C303B] border-[#00F0FF] ring-1 ring-[#00F0FF]'
                            : isUlt
                            ? 'bg-[#0E171E] border-[#FFC83D]/60 hover:border-[#FFC83D]'
                            : 'bg-[#0E171E] border-[#34404B] hover:border-[#00F0FF]/80'
                        }`}
                        title={sk.desc}
                      >
                        <div
                          className="w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-xs border"
                          style={{
                            borderColor: isUlt ? '#FFC83D' : accent,
                            color: isUlt ? '#FFC83D' : accent,
                            backgroundColor: '#162128',
                          }}
                        >
                          {isUlt ? 'R' : '✦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-[#E3E8E5] truncate">
                              {sk.name}
                            </span>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.2 bg-[#0B0D10] border shrink-0"
                              style={{
                                borderColor: isUlt ? '#FFC83D' : '#34404B',
                                color: isUlt ? '#FFC83D' : '#9BA7AF',
                              }}
                            >
                              LV {sk.level}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#9BA7AF] truncate mt-0.5">
                            {sk.source} · {isUlt ? 'ULTIMATE' : 'ACTIVE'}
                          </div>
                          <p className="text-[10px] text-[#9BA7AF] line-clamp-2 mt-1 leading-snug">
                            {sk.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {filteredLibrary.length === 0 && (
                    <div className="text-xs text-[#9BA7AF] italic text-center py-8">
                      No learned skills match the current search or level.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: 4 Active Slots + 1 Ultimate Slot + Presets (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 4 Active Slots + 1 Ultimate Slot */}
                <div className="bg-[#121B22] border border-[#34404B] p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#34404B]">
                    <span className="text-xs font-extrabold text-[#E3E8E5] tracking-wider uppercase">
                      Equipped Skill Slots (Keys 1–4, Ultimate [R])
                    </span>
                    <span className="text-[10px] text-[#9BA7AF]">
                      DRAG / TAP TO ASSIGN OR SWAP
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[0, 1, 2, 3].map((slotIdx) => {
                      const skillId = p.skillSlots[slotIdx];
                      const sk = allSkills.find((s) => s.id === skillId);
                      const isSelected = selectedSkillId === skillId && skillId !== null;

                      return (
                        <div
                          key={slotIdx}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, slotIdx)}
                          onClick={() => handleSlotClick(slotIdx)}
                          className={`min-h-[82px] p-3 border-2 border-dashed flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#1C303B] border-[#00F0FF]'
                              : selectedSkillId
                              ? 'bg-[#162128] border-[#00F0FF]/60 hover:border-[#00F0FF]'
                              : 'bg-[#0B141B] border-[#34404B] hover:border-[#9BA7AF]'
                          }`}
                        >
                          <div className="w-9 h-9 bg-[#263943] border border-[#3A6572] rounded flex items-center justify-center font-black text-sm text-[#00F0FF] shrink-0">
                            {slotIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-[#9BA7AF] uppercase">
                              SLOT {slotIdx + 1} · {sk ? 'EQUIPPED' : 'EMPTY'}
                            </div>
                            <div className="text-xs font-bold text-[#E3E8E5] truncate">
                              {sk ? sk.name : '— Drop or tap skill —'}
                            </div>
                            <div className="text-[10px] text-[#00F0FF] truncate">
                              {sk ? `${sk.source} · Active` : 'Click to bind'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ultimate Slot [R] */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 4)}
                    onClick={() => handleSlotClick(4)}
                    className={`p-3 border-2 border-dashed flex items-center gap-3 cursor-pointer transition-all ${
                      selectedSkillId === p.ultimateSlot && p.ultimateSlot !== null
                        ? 'bg-[#1C303B] border-[#FFC83D]'
                        : 'bg-[#0B141B] border-[#917C49] hover:border-[#FFC83D]'
                    }`}
                  >
                    <div className="w-10 h-10 bg-[#2C2415] border border-[#FFC83D] rounded flex items-center justify-center font-black text-sm text-[#FFC83D] shrink-0">
                      R
                    </div>
                    {(() => {
                      const ultSk = allSkills.find((s) => s.id === p.ultimateSlot);
                      return (
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-bold text-[#FFC83D] uppercase">
                            SIGNATURE ULTIMATE SLOT [R]
                          </div>
                          <div className="text-xs font-bold text-[#E3E8E5] truncate">
                            {ultSk ? ultSk.name : '— Drop or tap ultimate —'}
                          </div>
                          <div className="text-[10px] text-[#9BA7AF] truncate">
                            {ultSk ? `${ultSk.source} · Ultimate` : 'Select any learned ultimate'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Loadout Preset Buttons */}
                  <div className="pt-2 border-t border-[#34404B] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#E3E8E5] uppercase">
                        Free Loadout Presets
                      </span>
                      <span className="text-[10px] text-[#9BA7AF]">
                        Saved per character · Zero costs
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {p.loadoutPresets.map((preset, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#0B141B] border border-[#34404B] rounded flex flex-col justify-between gap-1.5"
                        >
                          <div>
                            <div className="text-xs font-bold text-[#E3E8E5] truncate">
                              {preset.name}
                            </div>
                            <div className="text-[10px] text-[#9BA7AF] truncate">
                              {SPECIALIZATIONS[preset.classId]?.name || 'Specialization'}
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleSavePreset(idx)}
                              className="flex-1 py-1 text-[10px] font-bold bg-[#19232D] border border-[#34404B] hover:border-[#00F0FF] text-[#E3E8E5] cursor-pointer"
                            >
                              SAVE
                            </button>
                            <button
                              onClick={() => handleLoadPreset(idx)}
                              className="flex-1 py-1 text-[10px] font-bold bg-[#1A333E] border border-[#00F0FF]/60 hover:border-[#00F0FF] text-[#00F0FF] cursor-pointer"
                            >
                              LOAD
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={() => {
                          p.skillSlots = getDefaultSkillSlots(p.classId);
                          forceRefresh();
                          showToast('Reset equipped slots to defaults.');
                        }}
                        className="px-3 py-1 text-[11px] font-bold bg-[#19232D] border border-[#34404B] hover:border-[#FF6262] text-[#9BA7AF] hover:text-[#FF6262] cursor-pointer"
                      >
                        Reset Equipped Slots
                      </button>
                      <button
                        onClick={() => setSelectedSkillId(null)}
                        className="px-3 py-1 text-[11px] font-bold bg-[#19232D] border border-[#34404B] text-[#9BA7AF] hover:text-[#E3E8E5] cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>

                {/* Non-Negotiable Rule Banner */}
                <div className="p-3 bg-[#0C1B25] border border-[#354753] text-[11px] text-[#B1CAD4] leading-relaxed">
                  <strong className="text-[#00F0FF]">NO CROSS-CLASS COMBOS:</strong> Skills retained from previous classes execute independently with their own parameters. Equipping skills from different classes does not create cross-class combo triggers or artificial synergy multipliers.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANCHING SPECIALIZATION TREE */}
          {activeTab === 'tree' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#121B22] border border-[#34404B]">
                <div>
                  <h3 className="text-xs font-black tracking-wider text-[#00F0FF] uppercase">
                    {currentSpec.name} · Branching Specialization Tree
                  </h3>
                  <p className="text-[11px] text-[#9BA7AF] mt-0.5">
                    Choose one mutually exclusive fork variant per ability. Tree choices mutate only that specific skill.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold bg-[#0B0D10] border border-[#00F0FF] text-[#00F0FF]">
                    {p.getAvailableTreePoints()} / 8 POINTS
                  </span>
                  <button
                    onClick={handleRespec}
                    className="px-3 py-1 text-xs font-bold bg-[#19232D] border border-[#FF6262] text-[#FF6262] hover:bg-[#FF6262] hover:text-[#0B0D10] cursor-pointer transition-colors"
                  >
                    FREE RESPEC
                  </button>
                </div>
              </div>

              {/* 3 Milestones */}
              <div className="space-y-4">
                {/* Milestone 01 — Lv 15 */}
                <div className={`p-4 bg-[#131D26] border rounded ${p.level >= 15 ? 'border-[#34404B]' : 'border-[#34404B]/50 opacity-60'}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-[#34404B]">
                    <span className="text-xs font-black text-[#00F0FF] uppercase">
                      Milestone 01 — Character Level 15 · Class Entry
                    </span>
                    <span className={`text-[10px] font-bold ${p.level >= 15 ? 'text-[#4FD6A0]' : 'text-[#9BA7AF]'}`}>
                      {p.level >= 15 ? '✓ UNLOCKED' : '🔒 REQUIRES LV 15'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {currentSpec.skills.slice(0, 2).map((sk) => {
                      const nodeKey = `${currentSpec.id}:${sk.name}`;
                      const chosenVariant = p.treeNodes[nodeKey];

                      return (
                        <div key={sk.id} className="p-3 bg-[#0A151D] border border-[#405361] rounded space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#E3E8E5]">{sk.name}</span>
                            <span className="text-[9px] text-[#9BA7AF]">Active Skill</span>
                          </div>
                          <p className="text-[11px] text-[#9BA7AF] leading-snug">{sk.desc}</p>
                          <div className="pt-2 border-t border-[#34404B] space-y-1.5">
                            <span className="text-[9px] font-bold text-[#9BA7AF] uppercase">
                              Fork Variants (Exclusive):
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {sk.fork.map((variantText, vIdx) => {
                                const isPicked = chosenVariant === vIdx;
                                return (
                                  <button
                                    key={vIdx}
                                    disabled={p.level < 15}
                                    onClick={() => handleTreeChoice(nodeKey, vIdx)}
                                    className={`p-2 text-[10px] font-bold border text-left cursor-pointer transition-colors ${
                                      isPicked
                                        ? 'bg-[#1C303B] border-[#00F0FF] text-[#00F0FF]'
                                        : 'bg-[#111820] border-[#34404B] text-[#9BA7AF] hover:text-[#E3E8E5] hover:border-[#00F0FF]/60'
                                    }`}
                                  >
                                    <div>Variant {vIdx === 0 ? 'A' : 'B'} {isPicked ? '✓' : ''}</div>
                                    <div className="font-normal text-[9px] text-[#E3E8E5] mt-0.5 line-clamp-2">
                                      {variantText}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone 02 — Lv 30 */}
                <div className={`p-4 bg-[#131D26] border rounded ${p.level >= 30 ? 'border-[#34404B]' : 'border-[#34404B]/50 opacity-60'}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-[#34404B]">
                    <span className="text-xs font-black text-[#00F0FF] uppercase">
                      Milestone 02 — Character Level 30 · Advanced Mastery
                    </span>
                    <span className={`text-[10px] font-bold ${p.level >= 30 ? 'text-[#4FD6A0]' : 'text-[#9BA7AF]'}`}>
                      {p.level >= 30 ? '✓ UNLOCKED' : '🔒 REQUIRES LV 30'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {currentSpec.skills.slice(2, 4).map((sk) => {
                      const nodeKey = `${currentSpec.id}:${sk.name}`;
                      const chosenVariant = p.treeNodes[nodeKey];

                      return (
                        <div key={sk.id} className="p-3 bg-[#0A151D] border border-[#405361] rounded space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#E3E8E5]">{sk.name}</span>
                            <span className="text-[9px] text-[#9BA7AF]">Mastery Skill</span>
                          </div>
                          <p className="text-[11px] text-[#9BA7AF] leading-snug">{sk.desc}</p>
                          <div className="pt-2 border-t border-[#34404B] space-y-1.5">
                            <span className="text-[9px] font-bold text-[#9BA7AF] uppercase">
                              Fork Variants (Exclusive):
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {sk.fork.map((variantText, vIdx) => {
                                const isPicked = chosenVariant === vIdx;
                                return (
                                  <button
                                    key={vIdx}
                                    disabled={p.level < 30}
                                    onClick={() => handleTreeChoice(nodeKey, vIdx)}
                                    className={`p-2 text-[10px] font-bold border text-left cursor-pointer transition-colors ${
                                      isPicked
                                        ? 'bg-[#1C303B] border-[#00F0FF] text-[#00F0FF]'
                                        : 'bg-[#111820] border-[#34404B] text-[#9BA7AF] hover:text-[#E3E8E5] hover:border-[#00F0FF]/60'
                                    }`}
                                  >
                                    <div>Variant {vIdx === 0 ? 'A' : 'B'} {isPicked ? '✓' : ''}</div>
                                    <div className="font-normal text-[9px] text-[#E3E8E5] mt-0.5 line-clamp-2">
                                      {variantText}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestone 03 — Lv 45 */}
                {(() => {
                  const ult = currentSpec.skills[4];
                  const ultNodeKey = `${currentSpec.id}:${ult.name}`;
                  const chosenUltVariant = p.treeNodes[ultNodeKey];

                  return (
                    <div className={`p-4 bg-[#131D26] border rounded ${p.level >= 45 ? 'border-[#FFC83D]' : 'border-[#34404B]/50 opacity-60'}`}>
                      <div className="flex items-center justify-between pb-2 border-b border-[#34404B]">
                        <span className="text-xs font-black text-[#FFC83D] uppercase">
                          Milestone 03 — Character Level 45 · Class Awakening
                        </span>
                        <span className={`text-[10px] font-bold ${p.level >= 45 ? 'text-[#FFC83D]' : 'text-[#9BA7AF]'}`}>
                          {p.level >= 45 ? '✓ AWAKENED' : '🔒 REQUIRES LV 45'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-[#0A151D] border border-[#FFC83D]/50 rounded mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-[#FFC83D]">{ult.name}</span>
                          <span className="text-[10px] font-bold text-[#FFC83D]">SIGNATURE ULTIMATE</span>
                        </div>
                        <p className="text-xs text-[#E3E8E5] leading-relaxed">{ult.desc}</p>
                        <div className="pt-2 border-t border-[#34404B] space-y-1.5">
                          <span className="text-[9px] font-bold text-[#FFC83D] uppercase">
                            Ultimate Fork (Exclusive):
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {ult.fork.map((vText, vIdx) => {
                              const isPicked = chosenUltVariant === vIdx;
                              return (
                                <button
                                  key={vIdx}
                                  disabled={p.level < 45}
                                  onClick={() => handleTreeChoice(ultNodeKey, vIdx)}
                                  className={`p-2.5 text-[10px] font-bold border text-left cursor-pointer transition-colors ${
                                    isPicked
                                      ? 'bg-[#2B2313] border-[#FFC83D] text-[#FFC83D]'
                                      : 'bg-[#111820] border-[#34404B] text-[#9BA7AF] hover:text-[#E3E8E5] hover:border-[#FFC83D]/60'
                                  }`}
                                >
                                  <div>Fork {vIdx === 0 ? 'A' : 'B'} {isPicked ? '✓' : ''}</div>
                                  <div className="font-normal text-[9px] text-[#E3E8E5] mt-0.5 line-clamp-2">
                                    {vText}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

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
