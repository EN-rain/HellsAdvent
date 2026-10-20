import React, { useState } from 'react';
import { PALETTE } from '../data/config.js';
import { STORY_CAMPAIGN, SIDE_QUESTS, DUSKHOLLOW_TOWN } from '../data/darkFantasyConfig.js';
import { sound } from '../game/Audio.js';

export function QuestModal({ engine, onClose }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'main' | 'side' | 'bloodlines' | 'completed'
  const [selectedQuestId, setSelectedQuestId] = useState(null);

  if (!engine) return null;

  const snapshot = engine.getHudSnapshot();
  const worldLedger = engine.world?.worldLedger || snapshot.worldLedger;
  const questSummary = snapshot.worldLedger?.questSummary;

  // Compile all quests into a unified structure
  const storyActs = (STORY_CAMPAIGN || []).map((act) => {
    const isCleared = act.act === 0
      ? snapshot.worldLedger?.quests?.prologueTalkedToMalakor || snapshot.worldLedger?.floor1Complete
      : !!snapshot.worldLedger?.clearedFloors?.[act.floor];
    const isClaimed = !!snapshot.worldLedger?.quests?.completedActs?.[act.act];
    const isCurrent = (snapshot.currentFloor || 0) === act.floor;

    return {
      id: `act_${act.act}`,
      category: 'main',
      categoryLabel: 'MAIN STORY ACT',
      categoryColor: '#FFC83D',
      title: act.title,
      actNumber: act.act,
      floor: act.floor,
      location: act.floor === 0 ? 'Duskhollow Town Plaza' : `Abyssal Spire · Floor ${act.floor}`,
      giver: act.act === 0 ? 'Chronicler Malakor' : 'Ashen Vanguard Council',
      objective: act.objective,
      lore: act.lore,
      rewardGold: act.rewardGold,
      rewardXp: act.rewardXp,
      progress: isCleared ? 1 : 0,
      target: 1,
      completed: isCleared,
      claimed: isClaimed,
      isCurrent,
    };
  });

  const rawSideQuests = questSummary?.sideQuests || (SIDE_QUESTS || []).map((sq) => {
    const st = snapshot.worldLedger?.quests?.sideQuests?.[sq.id] || {};
    return {
      ...sq,
      progress: st.progress || 0,
      completed: !!st.completed,
      claimed: !!st.claimed,
    };
  });

  const formattedSideQuests = rawSideQuests.map((sq) => {
    const isBloodline = sq.id.includes('bloodline') || sq.id.includes('sovereign');
    return {
      id: sq.id,
      category: isBloodline ? 'bloodlines' : 'side',
      categoryLabel: isBloodline ? 'BLOODLINE BOUNTY' : 'TOWN CONTRACT',
      categoryColor: isBloodline ? '#FF3B3B' : '#00F0FF',
      title: sq.title,
      location: sq.desc.includes('Floor 2')
        ? 'Floor 2 · Frostbound Crypt'
        : sq.desc.includes('Floor 3')
        ? 'Floor 3 · Hellfire Abyss'
        : sq.desc.includes('Floor 4')
        ? 'Floor 4 · Rotwood Mire'
        : sq.desc.includes('Floor 5')
        ? 'Floor 5 · Void Citadel'
        : 'Floor 1 · Blighted Catacombs',
      giver: sq.giver || 'Duskhollow Guildmaster',
      objective: sq.desc,
      lore: `A formal trade bounty sanctioned by ${sq.giver || 'the Town Guild'} to preserve Duskhollow Town against the Abyssal Spire horrors.`,
      rewardGold: sq.rewardGold,
      rewardXp: sq.rewardXp,
      progress: sq.progress || 0,
      target: sq.target || 1,
      completed: !!sq.completed,
      claimed: !!sq.claimed,
      isCurrent: true,
    };
  });

  // Sudden merchant defense quest if active
  const sudden = snapshot.worldLedger?.activeSuddenQuest;
  const suddenList = sudden && sudden.active ? [{
    id: 'sudden_merchant_defense',
    category: 'sudden',
    categoryLabel: 'SUDDEN EVENT',
    categoryColor: '#FF5A26',
    title: 'Protect Morwen the Shrouded (30s)',
    location: `Floor ${snapshot.currentFloor} · Wandering Caravan`,
    giver: 'Morwen the Shrouded',
    objective: `Hold off hostile waves for 30s while Morwen prepares her Mob-Repellent Sanctuary Ward (${Math.ceil(sudden.timer || 0)}s left).`,
    lore: 'Morwen carries forbidden relics and 35%-off discounted goods through the darkest strata of the Abyssal Spire. If her HP drops to zero, she flees in a smoke bomb.',
    rewardGold: 120 * Math.max(1, snapshot.currentFloor || 1),
    rewardXp: 45 * Math.max(1, snapshot.currentFloor || 1),
    progress: Math.max(0, 30 - Math.ceil(sudden.timer || 0)),
    target: 30,
    completed: !!sudden.completed,
    claimed: false,
    isCurrent: true,
  }] : [];

  const allQuests = [...suddenList, ...storyActs, ...formattedSideQuests];

  // Filter based on active tab
  const filteredQuests = allQuests.filter((q) => {
    if (activeTab === 'main') return q.category === 'main';
    if (activeTab === 'side') return q.category === 'side';
    if (activeTab === 'bloodlines') return q.category === 'bloodlines';
    if (activeTab === 'completed') return q.completed || q.claimed;
    return true;
  });

  // Default selection
  const selectedQuest = allQuests.find((q) => q.id === selectedQuestId) || filteredQuests[0] || allQuests[0];

  const handleClaim = (questId) => {
    sound.playBuySell?.();
    const res = engine.claimQuest(questId);
    if (!res || !res.ok) {
      // Fallback direct check
      worldLedger?.claimQuestReward?.(questId, engine.player, engine.particles);
      engine.saveProgress();
      engine.notifyUi();
    }
  };

  const handleWaypoint = (targetFloor) => {
    sound.playUiClick?.();
    if (targetFloor === 0) {
      engine.travelToFloor(0);
      onClose();
    } else if (targetFloor <= snapshot.highestUnlockedFloor) {
      engine.travelToFloor(targetFloor);
      onClose();
    }
  };

  const readyToClaimCount = allQuests.filter((q) => q.completed && !q.claimed).length;

  return (
    <div
      data-hud-interactive="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0D10]/85 backdrop-blur-sm p-4 select-none font-mono"
    >
      <div className="relative w-full max-w-5xl h-[620px] max-h-[92vh] bg-[#0E1116] border-2 border-[#3A3F47] shadow-[0_0_32px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161A20] border-b-2 border-[#3A3F47] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">📜</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-widest text-[#FFFDF5] uppercase">
                  CHRONICLES &amp; CONTRACT LEDGER
                </h2>
                {readyToClaimCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#FFC83D] text-[#0B0D10] text-[10px] font-black uppercase rounded-xs animate-pulse">
                    {readyToClaimCount} REWARD{readyToClaimCount > 1 ? 'S' : ''} READY!
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#9E9789]">
                Main Story Acts, Duskhollow Guild Bounties, and Sudden Caravan Events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playUiClick?.();
                onClose();
              }}
              className="px-3 py-1.5 bg-[#1F242C] border border-[#3A3F47] hover:border-[#FF3B3B] hover:text-[#FF3B3B] text-xs font-bold text-[#D9D2C3] cursor-pointer transition-colors"
            >
              [ESC] CLOSE
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#12151B] border-b border-[#3A3F47] text-xs font-bold overflow-x-auto shrink-0">
          {[
            { id: 'all', label: 'ALL CONTRACTS', count: allQuests.length },
            { id: 'main', label: 'MAIN STORY (ACTS 0–5)', count: storyActs.length },
            { id: 'side', label: 'TOWN CONTRACTS', count: formattedSideQuests.filter((q) => q.category === 'side').length },
            { id: 'bloodlines', label: 'BLOODLINE BOUNTIES', count: formattedSideQuests.filter((q) => q.category === 'bloodlines').length },
            { id: 'completed', label: 'COMPLETED / CLAIMED', count: allQuests.filter((q) => q.completed || q.claimed).length },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playUiClick?.();
                  setActiveTab(tab.id);
                }}
                className={`px-3 py-1.5 border transition-colors cursor-pointer whitespace-nowrap text-[11px] ${
                  active
                    ? 'bg-[#00F0FF] text-[#0B0D10] border-[#00F0FF] font-black'
                    : 'bg-[#161A20] text-[#D9D2C3] border-[#3A3F47] hover:border-[#00F0FF] hover:text-white'
                }`}
              >
                {tab.label} <span className="opacity-75">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Quest List */}
          <div className="w-full md:w-[42%] border-r border-[#3A3F47] bg-[#0B0D10]/50 overflow-y-auto p-3 space-y-2">
            {filteredQuests.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9E9789] border border-dashed border-[#3A3F47]">
                No contracts matching this category.
              </div>
            ) : (
              filteredQuests.map((q) => {
                const isSelected = selectedQuest?.id === q.id;
                const isReady = q.completed && !q.claimed;
                const pct = Math.min(100, Math.round(((q.progress || 0) / (q.target || 1)) * 100));

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      sound.playUiClick?.();
                      setSelectedQuestId(q.id);
                    }}
                    className={`p-3 border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#19222E] border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : isReady
                        ? 'bg-[#231E12] border-[#FFC83D] hover:border-[#FFC83D]'
                        : 'bg-[#12151B] border-[#3A3F47] hover:border-[#9E9789]'
                    }`}
                  >
                    {/* Category & Status Badges */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[9px] font-black tracking-wider uppercase px-1 py-0.5 border"
                        style={{
                          color: q.categoryColor,
                          borderColor: `${q.categoryColor}55`,
                          backgroundColor: `${q.categoryColor}15`,
                        }}
                      >
                        {q.categoryLabel}
                      </span>

                      {q.claimed ? (
                        <span className="text-[9px] font-bold text-[#4FD6A0] flex items-center gap-1">
                          <span>✓</span> CLAIMED
                        </span>
                      ) : isReady ? (
                        <span className="px-1.5 py-0.5 bg-[#FFC83D] text-[#0B0D10] text-[9px] font-black uppercase rounded-xs animate-pulse">
                          CLAIM REWARD!
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-[#9E9789] tabular-nums">
                          {q.progress} / {q.target}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="text-xs font-bold text-[#FFFDF5] leading-tight">
                      {q.title}
                    </div>

                    {/* Location */}
                    <div className="text-[10px] text-[#9E9789] mt-0.5 flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{q.location}</span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full h-1.5 bg-[#0B0D10] border border-[#3A3F47] mt-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: q.claimed
                            ? '#4FD6A0'
                            : isReady
                            ? PALETTE.brass
                            : q.categoryColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed View */}
          <div className="w-full md:w-[58%] bg-[#0E1218] p-5 overflow-y-auto flex flex-col justify-between">
            {selectedQuest ? (
              <div className="space-y-4">
                {/* Header Info */}
                <div className="border-b border-[#3A3F47] pb-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 border"
                      style={{
                        color: selectedQuest.categoryColor,
                        borderColor: `${selectedQuest.categoryColor}66`,
                        backgroundColor: `${selectedQuest.categoryColor}15`,
                      }}
                    >
                      {selectedQuest.categoryLabel}
                    </span>
                    <span className="text-xs text-[#9E9789] font-bold flex items-center gap-1">
                      <span>📍</span> {selectedQuest.location}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#FFFDF5] mt-1.5 leading-snug">
                    {selectedQuest.title}
                  </h3>

                  <div className="text-xs text-[#00F0FF] mt-0.5">
                    Contract Issued By: <span className="font-bold text-[#FFFDF5]">{selectedQuest.giver}</span>
                  </div>
                </div>

                {/* Lore Narrative */}
                <div className="p-3 bg-[#141820] border-l-2 border-[#00F0FF] text-xs text-[#D9D2C3]/90 leading-relaxed italic">
                  &ldquo;{selectedQuest.lore}&rdquo;
                </div>

                {/* Objectives Section */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-[#9E9789] tracking-wider uppercase">
                    PRIMARY OBJECTIVES
                  </div>
                  <div className="p-3 bg-[#12151B] border border-[#3A3F47] space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`text-sm shrink-0 ${
                          selectedQuest.completed ? 'text-[#34d399]' : 'text-[#FFC83D]'
                        }`}
                      >
                        {selectedQuest.completed ? '☑' : '☐'}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-[#FFFDF5]">
                          {selectedQuest.objective}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#9E9789] mt-1 tabular-nums">
                          <span>Progress Status</span>
                          <span className={selectedQuest.completed ? 'text-[#34d399] font-bold' : 'text-[#00F0FF]'}>
                            {selectedQuest.completed
                              ? 'OBJECTIVE COMPLETED'
                              : `${selectedQuest.progress} / ${selectedQuest.target} Fulfilled`}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#0B0D10] border border-[#3A3F47] mt-1 overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(((selectedQuest.progress || 0) / (selectedQuest.target || 1)) * 100)
                              )}%`,
                              backgroundColor: selectedQuest.completed ? '#34d399' : PALETTE.signal,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rewards Box */}
                <div className="space-y-1.5">
                  <div className="text-xs font-black text-[#9E9789] tracking-wider uppercase">
                    CONTRACT REWARDS
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#161A20] border border-[#3A3F47] flex items-center gap-3">
                      <span className="text-xl">💰</span>
                      <div>
                        <div className="text-[10px] text-[#9E9789] font-bold uppercase">GOLD REWARD</div>
                        <div className="text-sm font-black text-[#FFC83D] tabular-nums">
                          +{selectedQuest.rewardGold} Gold
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#161A20] border border-[#3A3F47] flex items-center gap-3">
                      <span className="text-xl">⚡</span>
                      <div>
                        <div className="text-[10px] text-[#9E9789] font-bold uppercase">EXPERIENCE</div>
                        <div className="text-sm font-black text-[#00F0FF] tabular-nums">
                          +{selectedQuest.rewardXp} XP
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-4 border-t border-[#3A3F47] flex flex-wrap items-center justify-between gap-3">
                  {selectedQuest.completed && !selectedQuest.claimed ? (
                    <button
                      onClick={() => handleClaim(selectedQuest.id)}
                      className="px-6 py-2.5 bg-[#FFC83D] hover:bg-[#FFE082] text-[#0B0D10] font-black text-xs tracking-wider cursor-pointer transition-colors shadow-[0_0_16px_rgba(255,200,61,0.4)] animate-pulse"
                    >
                      CLAIM CONTRACT REWARD (+{selectedQuest.rewardGold}G / +{selectedQuest.rewardXp}XP)
                    </button>
                  ) : selectedQuest.claimed ? (
                    <div className="px-4 py-2 bg-[#122620] border border-[#34d399] text-[#34d399] text-xs font-bold flex items-center gap-1.5">
                      <span>✓</span> CONTRACT REWARD CLAIMED
                    </div>
                  ) : (
                    <div className="text-xs text-[#9E9789] flex items-center gap-1.5">
                      <span>⏳</span> Complete the objectives in the field to claim rewards.
                    </div>
                  )}

                  {/* Quick Travel / Waypoint */}
                  {selectedQuest.floor !== undefined && selectedQuest.floor !== snapshot.currentFloor && (
                    <button
                      onClick={() => handleWaypoint(selectedQuest.floor)}
                      className="px-4 py-2 bg-[#19222E] border border-[#00F0FF] hover:bg-[#00F0FF] hover:text-[#0B0D10] text-[#00F0FF] text-xs font-bold cursor-pointer transition-colors"
                    >
                      {selectedQuest.floor === 0 ? 'RETURN TO TOWN HUB' : `ASCEND TO FLOOR ${selectedQuest.floor}`}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="my-auto text-center text-xs text-[#9E9789]">
                Select a contract from the ledger to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestModal;
