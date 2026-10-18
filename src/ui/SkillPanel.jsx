import React, { useState } from 'react';
import { DIALOGUE, ENEMIES_CONFIG } from '../data/config.js';
import { SUGGESTED_BOSS_ORDER, KETTLE_ACHIEVEMENTS } from '../data/expansionConfig.js';
import { worldLedger } from '../game/WorldLedger.js';
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
                    {worldLedger.getReactiveDialogue('harlow') ||
                      (p.stage === 1
                        ? DIALOGUE.harlowLockedJourneyman
                        : p.stage === 2
                        ? DIALOGUE.harlowLockedMaster
                        : DIALOGUE.harlowDone)}
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

          {/* FLOOR 1 LIBERATION LEDGER, OPTIONAL BOSS REMATCHES & KETTLE COSMETICS (D13, D15, D44, D49) */}
          <div className="bg-[#161A20] border-2 border-[#FFC83D] p-3 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#3A3F47] pb-2">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-[#FFC83D]">
                  HARLOW&apos;S FLOOR 1 LIBERATION LEDGER · BOSS REMATCHES &amp; KETTLE COSMETICS
                </div>
                <p className="text-[11px] text-[#9E9789]">
                  Confirmed boss kills permanently liberate their territory (auto-respawn disabled). Trigger optional rematches at Kettle or equip cosmetic titles &amp; UI trim colors.
                </p>
              </div>
              {worldLedger.floor1Cleared ? (
                <div className="px-3 py-1 bg-[#4FD6A0] text-[#0B0D10] text-xs font-bold tracking-wider uppercase shrink-0">
                  ★ FLOOR 1 CLEARED (4/4 LIBERATED) ★
                </div>
              ) : (
                <div className="px-3 py-1 bg-[#0B0D10] border border-[#FFC83D] text-xs font-bold text-[#FFC83D] shrink-0">
                  LIBERATED: {Object.values(worldLedger.confirmedBossKills).filter(Boolean).length} / 4
                </div>
              )}
            </div>

            {/* 4 Boss Territories in Suggested Hunt Order (D49: Big Axle -> Long Dry -> Mother Sump -> The Foreman) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
              {SUGGESTED_BOSS_ORDER.map((bossId, idx) => {
                const bossCfg = ENEMIES_CONFIG.bosses[bossId];
                const isDefeated = !!worldLedger.confirmedBossKills[bossId];
                const recLevels = {
                  bigAxle: 5,
                  theLongDry: 9,
                  motherSump: 13,
                  theForeman: 16,
                };
                const gateNotes = {
                  bigAxle: 'Bait charges to 100% Heat & shatter exposed Engine Core.',
                  theLongDry: 'Read real emergence tremors & break all 3 Shell Segments.',
                  motherSump: 'Interrupt 2 Devour channels to trigger Starved vulnerability.',
                  theForeman: 'Survive 30s Reassembly Protocol (<10 arrivals) or slay Iron Foreman.',
                };

                return (
                  <div
                    key={bossId}
                    className="p-2.5 bg-[#0B0D10] border flex flex-col justify-between gap-2"
                    style={{
                      borderColor: isDefeated ? '#4FD6A0' : '#3A3F47',
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-[#FFC83D]">
                          HUNT #{idx + 1} · REC LV.{recLevels[bossId] || 5}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 ${
                            isDefeated
                              ? 'bg-[#4FD6A0] text-[#0B0D10]'
                              : 'bg-[#161A20] text-[#FF3B3B]'
                          }`}
                        >
                          {isDefeated ? 'CLEARED' : 'CONTROLLED'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#D9D2C3]">
                        {bossCfg?.name || bossId}{' '}
                        <span className="text-[10px] text-[#9E9789]">
                          {bossCfg?.subtitle || ''}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#9E9789]">{gateNotes[bossId]}</div>
                    </div>

                    {isDefeated ? (
                      <div className="pt-1">
                        {inKettleOrHarlow ? (
                          <button
                            onClick={() => {
                              engine.triggerBossRematch(bossId);
                            }}
                            className="w-full py-1.5 bg-[#8B3A1E] hover:bg-[#FF3B3B] text-[#D9D2C3] hover:text-[#0B0D10] font-bold text-[10px] tracking-wider uppercase cursor-pointer"
                          >
                            START OPTIONAL REMATCH
                          </button>
                        ) : (
                          <div className="text-[9px] text-center text-[#9E9789]">
                            Return to Kettle to start Rematch
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-1 text-center text-[10px] text-[#9E9789] bg-[#161A20] border border-[#3A3F47]">
                        OPEN IN WORLD ARENA
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Kettle Recognition Achievements & Cosmetics (D13 — Purely Cosmetic Titles & Trim Colors) */}
            <div className="pt-2 border-t border-[#3A3F47]">
              <div className="text-[10px] font-bold text-[#9E9789] uppercase mb-1.5">
                KETTLE RECOGNITION ACHIEVEMENTS &amp; COSMETIC TITLES (ZERO COMBAT STAT BUFFS)
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(KETTLE_ACHIEVEMENTS).map((ach) => {
                  const unlocked = !!worldLedger.unlockedAchievements[ach.id];
                  const equipped = worldLedger.equippedCosmeticTitle === ach.cosmeticTitle;

                  return (
                    <div
                      key={ach.id}
                      className="p-2 bg-[#0B0D10] border flex flex-col justify-between gap-1.5"
                      style={{
                        borderColor: unlocked ? ach.trimColor : '#3A3F47',
                        opacity: unlocked ? 1 : 0.55,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span style={{ color: unlocked ? ach.trimColor : '#9E9789' }}>
                            {ach.title}
                          </span>
                          <span className="text-[9px] text-[#9E9789]">
                            {unlocked ? 'UNLOCKED' : 'LOCKED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9E9789] mt-0.5 leading-snug">
                          {ach.desc}
                        </p>
                      </div>

                      {unlocked && (
                        <button
                          onClick={() => {
                            engine.equipCosmetic(equipped ? null : ach.id);
                            forceRefresh();
                          }}
                          className="w-full py-1 text-[10px] font-bold border cursor-pointer"
                          style={
                            equipped
                              ? {
                                  backgroundColor: ach.trimColor,
                                  borderColor: ach.trimColor,
                                  color: '#0B0D10',
                                }
                              : {
                                  backgroundColor: '#161A20',
                                  borderColor: '#3A3F47',
                                  color: ach.trimColor,
                                }
                          }
                        >
                          {equipped ? `EQUIPPED: ${ach.cosmeticTitle}` : `EQUIP: ${ach.cosmeticTitle}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillPanel;
