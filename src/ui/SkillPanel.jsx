import React, { useState } from 'react';
import { DIALOGUE } from '../data/config.js';
import { CharacterPortrait, PixelIcon, StatusIcon } from './PixelWidgets.jsx';

export function SkillPanel({ engine, onClose, isHarlowMode = false }) {
  const [, setTick] = useState(0);
  const p = engine.player;
  const cls = p.classConfig;
  const accent = cls.accentColor;

  const forceRefresh = () => setTick((t) => t + 1);

  const canJourneyman = p.canPromoteToJourneyman();
  const canMaster = p.canPromoteToMaster();
  const inKettleOrHarlow = isHarlowMode || engine.isPlayerNearHarlow() || engine.world.isInsideKettle(p.x, p.y);

  const branchEntries = Object.values(cls.branches);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/90 p-4 select-none">
      <div className="w-full max-w-6xl bg-[#0B0D10] border-2 border-[#3A3F47] flex flex-col max-h-[92vh] overflow-y-auto">
        {/* TOP BAR: Portrait, Name, Title & Stage, Available Skill Points */}
        <div className="flex items-center justify-between border-b-2 border-[#3A3F47] px-4 py-2.5 bg-[#161A20]">
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
                <h2
                  className="text-sm font-bold tracking-wider uppercase"
                  style={{ color: accent }}
                >
                  {p.getFullTitleLine()}
                </h2>
                <span className="text-xs text-[#9E9789]">
                  · LV {p.level} {cls.className.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-[#9E9789]">
                {cls.mechanic.name}: {cls.mechanic.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="px-3 py-1 bg-[#0B0D10] border text-xs font-bold tabular-nums"
              style={{ borderColor: accent, color: accent }}
            >
              SKILL POINTS: {p.skillPoints}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#0B0D10] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
            >
              [ESC / K] CLOSE
            </button>
          </div>
        </div>

        {/* HARLOW'S TRADE REGISTER PROMOTION BANNER (Shown when eligible or at Harlow) */}
        {(canJourneyman || canMaster || isHarlowMode) && (
          <div className="border-b-2 border-[#FFC83D] bg-[#161A20] px-4 py-2.5">
            {canJourneyman ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#FFC83D] tracking-wider uppercase">
                    HARLOW&apos;S TRADE REGISTER · JOURNEYMAN PROMOTION (LV 8 · +1 SP)
                  </div>
                  <p className="text-xs text-[#D9D2C3] mt-0.5 italic">
                    &ldquo;{DIALOGUE.harlowJourneyman}&rdquo;
                  </p>
                </div>
                {inKettleOrHarlow ? (
                  <div className="flex items-center gap-2.5 shrink-0">
                    {branchEntries.map((br) => (
                      <button
                        key={br.id}
                        onClick={() => {
                          engine.promoteToJourneyman(br.id);
                          forceRefresh();
                        }}
                        className="px-3.5 py-2 bg-[#0B0D10] border-2 border-[#FFC83D] hover:bg-[#FFC83D] hover:text-[#0B0D10] text-xs font-bold text-[#FFC83D] transition-colors cursor-pointer"
                      >
                        STAMP: {br.journeymanTitle.toUpperCase()} (+1 SP)
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-bold text-[#FF3B3B]">
                    Return to Harlow in Kettle to stamp your Journeyman promotion.
                  </span>
                )}
              </div>
            ) : canMaster ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#FFC83D] tracking-wider uppercase">
                    HARLOW&apos;S TRADE REGISTER · MASTER PROMOTION (LV 16 · +2 SP)
                  </div>
                  <p className="text-xs text-[#D9D2C3] mt-0.5 italic">
                    &ldquo;{DIALOGUE.harlowMaster}&rdquo;
                  </p>
                </div>
                {inKettleOrHarlow ? (
                  <button
                    onClick={() => {
                      engine.promoteToMaster();
                      forceRefresh();
                    }}
                    className="px-4 py-2 bg-[#FFC83D] text-[#0B0D10] font-bold text-xs tracking-wider hover:bg-[#D9D2C3] cursor-pointer shrink-0"
                  >
                    PROMOTE TO {cls.branches[p.branch]?.masterTitle?.toUpperCase()} (+2 SP)
                  </button>
                ) : (
                  <span className="text-xs font-bold text-[#FF3B3B]">
                    Return to Harlow in Kettle to stamp your Master promotion.
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#FFC83D]">HARLOW · TRADE CLERK: </span>
                  <span className="text-[#D9D2C3] italic">
                    &ldquo;
                    {p.stage === 1
                      ? DIALOGUE.harlowLockedJourneyman
                      : p.stage === 2
                      ? DIALOGUE.harlowLockedMaster
                      : DIALOGUE.harlowDone}
                    &rdquo;
                  </span>
                </div>
                <span className="text-[11px] text-[#9E9789]">
                  Stage {p.stage}/3 ({p.getStageLabel()})
                </span>
              </div>
            )}
          </div>
        )}

        {/* THREE HORIZONTAL TIERS (One screen, no scrolling) */}
        <div className="p-4 space-y-3">
          {/* TIER 1: HAND (3 Active Skills + 2 Passives + Ultimate Reference) */}
          <div className="bg-[#161A20] border border-[#3A3F47] p-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: accent }}
              >
                TIER 1 — HAND ({cls.titles.hand.toUpperCase()}) · 3 ACTIVES (MAX LV 5) &amp; 2 PASSIVES (MAX LV 3)
              </span>
              <span className="text-[11px] text-[#9E9789]">
                [R] Ultimate: <strong className="text-[#D9D2C3]">{cls.ultimate.name}</strong> ({cls.ultimate.summary})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {/* 3 Active Skills */}
              {cls.skillOrder.map((skillId) => {
                const cfg = cls.skills[skillId];
                const lv = p.skills[skillId] || 1;
                const isMax = lv >= cfg.maxLevel;
                const canUpg = p.skillPoints > 0 && !isMax;
                const curStats = cfg.getStats(lv);

                return (
                  <div
                    key={skillId}
                    className="p-2.5 bg-[#0B0D10] border border-[#3A3F47] flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PixelIcon itemId={cfg.icon} size={28} />
                          <div>
                            <div className="text-xs font-bold text-[#D9D2C3] leading-tight">
                              [{cfg.hotkey}] {cfg.name}
                            </div>
                            <div
                              className="text-[10px] font-bold tabular-nums"
                              style={{ color: accent }}
                            >
                              Lv {lv}/{cfg.maxLevel}
                            </div>
                          </div>
                        </div>
                        {/* Level pips */}
                        <div className="flex gap-0.5 pt-0.5">
                          {Array.from({ length: cfg.maxLevel }, (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 border"
                              style={{
                                borderColor: i < lv ? accent : '#3A3F47',
                                backgroundColor: i < lv ? accent : '#0B0D10',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#9E9789] mt-1.5 leading-snug">
                        {cfg.desc}
                      </p>
                      <div className="text-[10px] text-[#D9D2C3] mt-1 font-medium tabular-nums">
                        {cfg.formatCurrent(curStats)}
                      </div>
                    </div>

                    <button
                      disabled={!canUpg}
                      onClick={() => {
                        engine.upgradeSkill(skillId);
                        forceRefresh();
                      }}
                      className={`w-full py-1 text-[11px] font-bold border cursor-pointer ${
                        isMax
                          ? 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789] cursor-default'
                          : canUpg
                          ? 'bg-[#161A20] text-[#0B0D10]'
                          : 'bg-[#0B0D10] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                      }`}
                      style={
                        canUpg
                          ? { backgroundColor: accent, borderColor: accent, color: '#0B0D10' }
                          : undefined
                      }
                    >
                      {isMax ? 'MAXED' : 'UPGRADE (1 SP)'}
                    </button>
                  </div>
                );
              })}

              {/* 2 Tier 1 Passives */}
              {cls.passives.map((pas) => {
                const lv = p.passives[pas.id] || 0;
                const isMax = lv >= pas.maxLevel;
                const canUpg = p.skillPoints > 0 && !isMax;

                return (
                  <div
                    key={pas.id}
                    className="p-2.5 bg-[#0B0D10] border border-[#3A3F47] flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold text-[#9E9789] uppercase">
                            PASSIVE
                          </div>
                          <div className="text-xs font-bold text-[#D9D2C3]">
                            {pas.name}
                          </div>
                          <div
                            className="text-[10px] font-bold tabular-nums"
                            style={{ color: accent }}
                          >
                            Lv {lv}/{pas.maxLevel}
                          </div>
                        </div>
                        <div className="flex gap-0.5 pt-1">
                          {Array.from({ length: pas.maxLevel }, (_, i) => (
                            <div
                              key={i}
                              className="w-2.5 h-2.5 border"
                              style={{
                                borderColor: i < lv ? accent : '#3A3F47',
                                backgroundColor: i < lv ? accent : '#0B0D10',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#9E9789] mt-1.5 leading-snug">
                        {pas.desc}
                      </p>
                      <div className="text-[10px] text-[#D9D2C3] mt-1 font-medium tabular-nums">
                        {pas.formatCurrent(lv)}
                      </div>
                    </div>

                    <button
                      disabled={!canUpg}
                      onClick={() => {
                        engine.upgradePassive(pas.id);
                        forceRefresh();
                      }}
                      className={`w-full py-1 text-[11px] font-bold border cursor-pointer ${
                        isMax
                          ? 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789] cursor-default'
                          : canUpg
                          ? 'bg-[#161A20] text-[#0B0D10]'
                          : 'bg-[#0B0D10] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                      }`}
                      style={
                        canUpg
                          ? { backgroundColor: accent, borderColor: accent, color: '#0B0D10' }
                          : undefined
                      }
                    >
                      {isMax ? 'MAXED' : 'UPGRADE (1 SP)'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connector Lines between Tier 1 and Tier 2 */}
          <div className="flex items-center justify-around px-24 -my-1">
            {branchEntries.map((br) => {
              const isChosen = p.branch === br.id;
              return (
                <div
                  key={br.id}
                  className="h-3 w-0.5"
                  style={{
                    backgroundColor: isChosen ? accent : '#3A3F47',
                  }}
                />
              );
            })}
          </div>

          {/* TIER 2 (JOURNEYMAN) & TIER 3 (MASTER) SPLIT LEFT & RIGHT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branchEntries.map((br) => {
              const isChosenBranch = p.branch === br.id;
              const isLockedOut = p.branch !== null && p.branch !== br.id;

              return (
                <div
                  key={br.id}
                  className={`relative border-2 p-3 space-y-2.5 ${
                    isLockedOut ? 'opacity-45 bg-[#0B0D10]' : 'bg-[#161A20]'
                  }`}
                  style={{
                    borderColor: isChosenBranch ? accent : '#3A3F47',
                  }}
                >
                  {/* Diagonal slash overlay if permanently locked out */}
                  {isLockedOut && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-[#0B0D10]/95 border border-[#FF3B3B] px-3 py-1 text-[11px] font-bold text-[#FF3B3B] tracking-widest uppercase">
                        LOCKED · OTHER TRADE CHOSEN
                      </div>
                    </div>
                  )}

                  {/* Branch Header */}
                  <div className="flex items-center justify-between border-b border-[#3A3F47] pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold tracking-wider uppercase"
                          style={{ color: isChosenBranch ? accent : '#D9D2C3' }}
                        >
                          BRANCH: {br.journeymanTitle} → {br.masterTitle}
                        </span>
                        {isChosenBranch && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 bg-[#0B0D10] border"
                            style={{ borderColor: accent, color: accent }}
                          >
                            STAMPED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#9E9789]">{br.summary}</div>
                    </div>

                    {p.stage === 1 && p.level >= 8 && inKettleOrHarlow && (
                      <button
                        onClick={() => {
                          engine.promoteToJourneyman(br.id);
                          forceRefresh();
                        }}
                        className="px-2.5 py-1 bg-[#FFC83D] text-[#0B0D10] font-bold text-[11px] cursor-pointer"
                      >
                        CHOOSE {br.journeymanTitle.toUpperCase()}
                      </button>
                    )}
                  </div>

                  {/* TIER 2: 3 Journeyman Nodes (1 SP each) */}
                  <div>
                    <div className="text-[10px] font-bold text-[#9E9789] uppercase mb-1.5">
                      TIER 2 — JOURNEYMAN ({br.journeymanTitle.toUpperCase()}) · 1 SP EACH
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {br.journeymanNodes.map((nd) => {
                        const unlocked = p.hasNode(nd.id);
                        const canUnlock =
                          p.stage >= 2 &&
                          isChosenBranch &&
                          !unlocked &&
                          p.skillPoints > 0;

                        return (
                          <div
                            key={nd.id}
                            className="p-2 bg-[#0B0D10] border flex flex-col justify-between gap-1.5"
                            style={{
                              borderColor: unlocked ? accent : '#3A3F47',
                            }}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-bold text-[#D9D2C3] leading-tight">
                                  {nd.name}
                                </span>
                                {nd.statusApplied && (
                                  <StatusIcon statusId={nd.statusApplied} size={12} />
                                )}
                              </div>
                              <p className="text-[10px] text-[#9E9789] mt-1 leading-snug">
                                {nd.desc}
                              </p>
                            </div>

                            <button
                              disabled={!canUnlock}
                              onClick={() => {
                                engine.unlockBranchNode(nd.id);
                                forceRefresh();
                              }}
                              className={`w-full py-1 text-[10px] font-bold border cursor-pointer ${
                                unlocked
                                  ? 'bg-[#161A20] text-[#D9D2C3] cursor-default'
                                  : canUnlock
                                  ? 'text-[#0B0D10]'
                                  : 'bg-[#0B0D10] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                              }`}
                              style={
                                unlocked
                                  ? { borderColor: accent, color: accent }
                                  : canUnlock
                                  ? { backgroundColor: accent, borderColor: accent }
                                  : undefined
                              }
                            >
                              {unlocked ? 'ACTIVE' : 'UNLOCK (1 SP)'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Connector Line to Tier 3 */}
                  <div className="flex justify-center -my-1">
                    <div
                      className="h-2.5 w-0.5"
                      style={{
                        backgroundColor:
                          isChosenBranch && p.stage >= 3 ? accent : '#3A3F47',
                      }}
                    />
                  </div>

                  {/* TIER 3: 2 Master Capstone Nodes (1 SP each) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-[#9E9789] uppercase">
                        TIER 3 — MASTER ({br.masterTitle.toUpperCase()}) · CAPSTONES (1 SP EACH)
                      </span>
                      {isChosenBranch && p.stage < 3 && (
                        <span className="text-[10px] text-[#FFC83D]">
                          Requires Lv 16 Master Stamp
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {br.masterNodes.map((nd) => {
                        const unlocked = p.hasNode(nd.id);
                        const canUnlock =
                          p.stage >= 3 &&
                          isChosenBranch &&
                          !unlocked &&
                          p.skillPoints > 0;

                        return (
                          <div
                            key={nd.id}
                            className="p-2 bg-[#0B0D10] border flex flex-col justify-between gap-1.5"
                            style={{
                              borderColor: unlocked ? accent : '#3A3F47',
                            }}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-bold text-[#D9D2C3]">
                                  {nd.name}
                                </span>
                                {nd.statusApplied && (
                                  <StatusIcon statusId={nd.statusApplied} size={12} />
                                )}
                              </div>
                              <p className="text-[10px] text-[#9E9789] mt-1 leading-snug">
                                {nd.desc}
                              </p>
                            </div>

                            <button
                              disabled={!canUnlock}
                              onClick={() => {
                                engine.unlockBranchNode(nd.id);
                                forceRefresh();
                              }}
                              className={`w-full py-1 text-[10px] font-bold border cursor-pointer ${
                                unlocked
                                  ? 'bg-[#161A20] cursor-default'
                                  : canUnlock
                                  ? 'text-[#0B0D10]'
                                  : 'bg-[#0B0D10] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                              }`}
                              style={
                                unlocked
                                  ? { borderColor: accent, color: accent }
                                  : canUnlock
                                  ? { backgroundColor: accent, borderColor: accent }
                                  : undefined
                              }
                            >
                              {unlocked ? 'ACTIVE' : 'UNLOCK (1 SP)'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillPanel;
