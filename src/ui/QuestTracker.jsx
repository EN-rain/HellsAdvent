import React, { memo } from 'react';
import { PALETTE } from '../data/config.js';
import { sound } from '../game/Audio.js';
import { SIDE_QUESTS } from '../data/darkFantasyConfig.js';

/**
 * Compact Non-Expanding HUD Quest Button & Objective Strip
 * Clicking anywhere on the tracker opens the Quest Panel Modal directly.
 */
export const QuestTracker = memo(function QuestTracker({ snapshot, engine, onOpenQuestModal }) {
  if (!snapshot || !engine) return null;

  const currentFloor = snapshot.currentFloor || 0;
  const isTown = currentFloor === 0;
  const ledger = engine.world?.worldLedger || snapshot.worldLedger;
  const questSummary = snapshot.worldLedger?.questSummary;

  const talkedToMalakor = Boolean(ledger?.quests?.prologueTalkedToMalakor);

  const storyQuest = snapshot.worldLedger?.storyQuest ||
    questSummary?.activeMainSummary || {
      actTitle: isTown ? 'Prologue · The Ashen Oath' : `Act ${currentFloor} · Strata Overlords`,
      objective: isTown
        ? talkedToMalakor
          ? 'Head North to the Abyssal Spire Gatehouse'
          : 'Speak with Chronicler Malakor at the Hunters Guild'
        : `Cleanse Floor ${currentFloor} Territories & Slay Overlords`,
    };

  const rawSideQuests =
    questSummary?.sideQuests ||
    (SIDE_QUESTS || []).map((sq) => {
      const st = ledger?.quests?.sideQuests?.[sq.id] || {};
      return {
        ...sq,
        progress: st.progress || 0,
        completed: Boolean(st.completed),
        claimed: Boolean(st.claimed),
      };
    });

  const activeContracts = rawSideQuests.filter((sq) => !sq.claimed);
  const readyToClaimContracts = activeContracts.filter((sq) => sq.completed);
  const readyCount = Math.max(
    readyToClaimContracts.length,
    questSummary?.readyToClaimCount || 0
  );

  const suddenQuest = snapshot.worldLedger?.activeSuddenQuest || questSummary?.suddenQuest;
  const hasSudden = Boolean(suddenQuest && (suddenQuest.active || suddenQuest.remainingSec > 0));

  const handleOpenLog = (e) => {
    e?.stopPropagation?.();
    sound.playUiClick?.();
    if (typeof onOpenQuestModal === 'function') {
      onOpenQuestModal();
    } else {
      engine.setUiState('quests');
    }
  };

  return (
    <button
      type="button"
      data-hud-interactive="true"
      onClick={handleOpenLog}
      className="pointer-events-auto group w-[292px] bg-[#0B0D10]/92 hover:bg-[#14181F] backdrop-blur-md border shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-left select-none transition-all duration-150 font-mono cursor-pointer"
      style={{
        borderColor: hasSudden
          ? '#FF3B3B'
          : readyCount > 0
          ? PALETTE.brass
          : '#3A3F47',
      }}
      title="Click to open Quest Journal [J]"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#14181F] group-hover:bg-[#1B2029] border-b border-[#2C323B] transition-colors">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-black tracking-wider text-[#FFFDF5] group-hover:text-[#00F0FF] uppercase whitespace-nowrap transition-colors">
            {isTown ? 'Town Journal' : 'Quest Tracker'}
          </span>
          {readyCount > 0 ? (
            <span className="px-1.5 py-0.5 bg-[#FFC83D] text-[#0B0D10] text-[9px] font-black whitespace-nowrap">
              {readyCount} Claim Ready
            </span>
          ) : (
            <span className="text-[9px] text-[#8C96A5] font-bold whitespace-nowrap">
              · {activeContracts.length} Contracts
            </span>
          )}
        </div>
        <span className="px-1.5 py-0.5 bg-[#0B0D10] border border-[#3A3F47] group-hover:border-[#00F0FF] text-[9px] font-bold text-[#00F0FF] transition-colors whitespace-nowrap shrink-0">
          [J] Quests
        </span>
      </div>

      {/* Compact Active Objective Summary (Click opens Quest Panel) */}
      <div className="px-2.5 py-1.5 space-y-0.5">
        {hasSudden ? (
          <div className="flex items-center justify-between text-[10px] font-black text-[#FF3B3B]">
            <span className="truncate">
              ⚠ {suddenQuest.title || 'Protect Merchant Morwen'}
            </span>
            <span className="tabular-nums shrink-0 ml-1">
              {Math.ceil(suddenQuest.remainingSec || suddenQuest.timer || 0)}s
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-[#FFC83D]">
              <span className="truncate">{storyQuest.actTitle}</span>
              <span className="text-[9px] text-[#9E9789] shrink-0">
                {isTown ? 'Duskhollow' : `FL ${currentFloor}`}
              </span>
            </div>
            <div className="text-[10px] text-[#D9D2C3] group-hover:text-white truncate transition-colors">
              {storyQuest.objective}
            </div>
          </>
        )}
      </div>
    </button>
  );
});

export default QuestTracker;
