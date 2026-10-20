import React, { useState } from 'react';
import { PALETTE, WORLD_CONFIG, PLAYER_CONFIG } from '../data/config.js';
import { CharacterPortrait, PixelIcon } from './PixelWidgets.jsx';
import { CHARACTERS, SPECIALIZATIONS } from '../data/classChangeData.js';
import { worldLedger } from '../game/WorldLedger.js';
import { sound } from '../game/Audio.js';

export function DevSettingsModal({ engine, onClose }) {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState('progression'); // 'progression' | 'combat' | 'classes' | 'world'
  const [customGold, setCustomGold] = useState('1000');
  const [customLevel, setCustomLevel] = useState('15');
  const [toastMessage, setToastMessage] = useState('');

  const p = engine.player;
  const chDef = CHARACTERS[p.classId] || CHARACTERS.sena;
  const specDef = SPECIALIZATIONS[p.activeClassId] || SPECIALIZATIONS[chDef.startingClass] || Object.values(SPECIALIZATIONS)[0];
  const accent = chDef.color || PALETTE.signal;

  const forceRefresh = () => setTick((t) => t + 1);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // --- ACTIONS ---

  const handleAddGold = (amount) => {
    p.addGold(amount, engine.particles);
    engine.saveProgress();
    engine.notifyUi();
    showToast(`Added +${amount.toLocaleString()} Gold! (Total: ${p.gold.toLocaleString()} G)`);
    forceRefresh();
  };

  const handleSetGold = (amount) => {
    p.setGold(amount, engine.particles);
    engine.saveProgress();
    engine.notifyUi();
    showToast(`Gold set to ${p.gold.toLocaleString()} G!`);
    forceRefresh();
  };

  const handleSetLevel = (lvl) => {
    const newLvl = p.setLevel(lvl, engine.particles);
    engine.saveProgress();
    engine.notifyUi();
    if (p.pendingClassChoice) {
      onClose();
      engine.setUiState('classChoice');
      return;
    }
    showToast(`Level set to Lv ${newLvl}! Stats & XP threshold recalculated.`);
    forceRefresh();
  };

  const handleAddLevel = (count) => {
    const newLvl = p.addLevel(count, engine.particles);
    engine.saveProgress();
    engine.notifyUi();
    if (p.pendingClassChoice) {
      onClose();
      engine.setUiState('classChoice');
      return;
    }
    showToast(`Leveled up +${count}! (Now Lv ${newLvl})`);
    forceRefresh();
  };

  const handleAddXp = (amount) => {
    p.gainXp(amount, engine.particles);
    engine.saveProgress();
    engine.notifyUi();
    if (p.pendingClassChoice) {
      onClose();
      engine.setUiState('classChoice');
      return;
    }
    showToast(`Gained +${amount.toLocaleString()} XP! (Current: ${p.xp} / ${p.xpToNext})`);
    forceRefresh();
  };

  const handleFillXp = () => {
    const needed = Math.max(0, p.xpToNext - p.xp);
    p.gainXp(needed, engine.particles);
    engine.saveProgress();
    engine.notifyUi();
    if (p.pendingClassChoice) {
      onClose();
      engine.setUiState('classChoice');
      return;
    }
    showToast(`XP Bar filled! Leveled up to Lv ${p.level}.`);
    forceRefresh();
  };

  const handleTriggerClassChoice = () => {
    p.triggerClassChoice();
    engine.notifyUi();
    onClose();
    engine.setUiState('classChoice');
  };

  const handleAddSkillPoints = (amount) => {
    p.addSkillPoints(amount);
    sound.playStamp?.();
    engine.saveProgress();
    engine.notifyUi();
    showToast(`Added +${amount} Skill Points! (Total: ${p.skillPoints})`);
    forceRefresh();
  };

  const handleRefillHpStamina = () => {
    p.refillHealthAndStamina();
    sound.playCoin?.();
    engine.notifyUi();
    showToast('Health & Stamina fully restored! Cleansed all debuffs.');
    forceRefresh();
  };

  const handleToggleGodmode = () => {
    p.godmode = !p.godmode;
    if (p.godmode) p.refillHealthAndStamina();
    sound.playStamp?.();
    engine.notifyUi();
    showToast(p.godmode ? 'Godmode ACTIVATED! (Invulnerable & Unkillable)' : 'Godmode DEACTIVATED.');
    forceRefresh();
  };

  const handleToggleInfiniteStamina = () => {
    p.infiniteStamina = !p.infiniteStamina;
    if (p.infiniteStamina) p.stamina = p.maxStamina;
    sound.playStamp?.();
    engine.notifyUi();
    showToast(p.infiniteStamina ? 'Infinite Stamina ACTIVATED!' : 'Infinite Stamina DEACTIVATED.');
    forceRefresh();
  };

  const handleToggleNoCooldowns = () => {
    p.noCooldowns = !p.noCooldowns;
    if (p.noCooldowns) p.clearAllCooldowns();
    sound.playStamp?.();
    engine.notifyUi();
    showToast(p.noCooldowns ? 'Zero Cooldowns ACTIVATED!' : 'Zero Cooldowns DEACTIVATED.');
    forceRefresh();
  };

  const handleToggleOneHitKill = () => {
    p.oneHitKill = !p.oneHitKill;
    p.recalculateStats(false);
    sound.playStamp?.();
    engine.notifyUi();
    showToast(p.oneHitKill ? 'One-Hit Kill ACTIVATED! (+99,999 ATK)' : 'One-Hit Kill DEACTIVATED.');
    forceRefresh();
  };

  const handleToggleSpeedBoost = () => {
    p.speedBoost = !p.speedBoost;
    p.recalculateStats(false);
    sound.playStamp?.();
    engine.notifyUi();
    showToast(p.speedBoost ? 'Speed Boost ACTIVATED! (+60% Speed)' : 'Speed Boost DEACTIVATED.');
    forceRefresh();
  };

  const handleFillUltimate = () => {
    p.fillUltimateCharge();
    sound.playStamp?.();
    engine.notifyUi();
    showToast('Ultimate Charge set to 100%! Ready to cast [R].');
    forceRefresh();
  };

  const handleMaxSupplies = () => {
    p.setSuppliesMax(99);
    sound.playCoin?.();
    engine.saveProgress();
    engine.notifyUi();
    showToast('All supplies set to x99! (Gauze, Sugar, Lye, Stew, Stim)');
    forceRefresh();
  };

  const handleUnlockAllSpecializations = () => {
    p.unlockAllSpecializations();
    sound.playLevelUp?.();
    engine.saveProgress();
    engine.notifyUi();
    showToast('Unlocked ALL 15 Specializations across all characters!');
    forceRefresh();
  };

  const handleSwitchCharacter = (charId) => {
    const res = p.switchCharacter(charId);
    if (res.success) {
      engine.saveProgress();
      engine.notifyUi();
      const charName = CHARACTERS[charId]?.name || charId;
      showToast(`Switched runner to ${charName}! Level (${p.level}) & XP preserved.`);
      forceRefresh();
    }
  };

  const handleSwitchClass = (specId) => {
    p.unlockClass(specId);
    p.switchClass(specId);
    engine.saveProgress();
    engine.notifyUi();
    const spec = SPECIALIZATIONS[specId];
    const char = CHARACTERS[spec?.char];
    showToast(`Switched class to ${char?.name ? `${char.name} — ` : ''}${spec?.name}! Level (${p.level}) & XP preserved.`);
    forceRefresh();
  };

  const handleRespec = () => {
    p.respecTree();
    sound.playStamp?.();
    engine.saveProgress();
    engine.notifyUi();
    showToast('Tree points refunded for active specialization! (Level & XP intact)');
    forceRefresh();
  };

  const handleTeleport = (x, y, destName) => {
    engine.teleportPlayerTo(x, y);
    showToast(`Teleported to ${destName}!`);
  };

  const handleKillMobs = () => {
    const killed = engine.killAllNearbyEnemies();
    sound.playHitMelee?.();
    showToast(`Eliminated ${killed} nearby enemies!`);
  };

  const handleKillBoss = () => {
    const ok = engine.killActiveBoss();
    if (ok) {
      sound.playHitMelee?.();
      showToast('Active boss eliminated!');
    } else {
      showToast('No active boss currently spawned.');
    }
  };

  const handleDamageBoss = () => {
    const b = engine.spawner?.activeBoss;
    if (b && b.active && b.hp > 0) {
      const half = Math.ceil(b.maxHp * 0.5);
      b.takeDamage(half, p, engine.particles, engine.camera);
      engine.notifyUi();
      showToast(`Dealt ${half} damage to ${b.name}!`);
    } else {
      showToast('No active boss currently spawned.');
    }
  };

  const handleLiberateAll = () => {
    for (const key of Object.keys(worldLedger.territories)) {
      worldLedger.territories[key].state = 'CLEARED';
    }
    worldLedger.confirmedBossKills = {
      theForeman: true,
      motherSump: true,
      bigAxle: true,
      theLongDry: true,
    };
    worldLedger.floor1Cleared = true;
    engine.saveProgress();
    engine.notifyUi();
    sound.playLevelUp?.();
    showToast('All 4 wasteland territories liberated! Boss rematches unlocked.');
    forceRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A0E]/95 p-4 select-none backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#0F141C] border-2 border-[#C042FF] shadow-[0_0_25px_rgba(192,66,255,0.35)] flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER: Title & Stat Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#372744] bg-[#1A1224] px-4 py-3">
          <div className="flex items-center gap-3">
            <CharacterPortrait
              classId={p.classId}
              expression="normal"
              equipped={p.equipped}
              stage={p.stage}
              branch={p.branch}
              size={44}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider text-[#ECA6FF]">
                  HELLS<span style={{ color: '#00F0FF' }}>ADVENT</span>
                </span>
                <span className="text-xs text-[#C042FF] font-bold">/ DEV CHEATS &amp; TUNER</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#2B143D] border border-[#C042FF] text-[#ECA6FF] font-bold">
                  [~ or F2]
                </span>
              </div>
              <div className="text-[11px] text-[#A69AA8] mt-0.5">
                {chDef.name} · <strong style={{ color: accent }}>{specDef.name}</strong> ·{' '}
                <span className="text-[#FFC83D] font-bold tabular-nums">LV {p.level}</span> ({p.xp} / {p.xpToNext} XP) ·{' '}
                <span className="text-[#FFC83D] font-bold tabular-nums">{p.gold.toLocaleString()} G</span> ·{' '}
                <span className="text-[#00F0FF] font-bold tabular-nums">PTS: {p.skillPoints}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#2B143D] border border-[#C042FF] hover:border-[#00F0FF] hover:bg-[#3D1A56] text-xs font-bold text-[#ECA6FF] hover:text-[#FFFFFF] cursor-pointer transition-colors"
          >
            CLOSE [ESC]
          </button>
        </div>

        {/* TOAST FEEDBACK BANNER */}
        {toastMessage && (
          <div className="bg-[#1C3A27] border-b border-[#4FD6A0] px-4 py-1.5 text-xs text-[#4FD6A0] font-bold text-center tracking-wide animate-pulse">
            ★ {toastMessage}
          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex items-center border-b border-[#372744] bg-[#120F1A] px-3 pt-2 gap-1.5 overflow-x-auto">
          {[
            { id: 'progression', label: '1. GOLD & LEVEL UP', icon: '💰' },
            { id: 'combat', label: '2. COMBAT & GODMODE', icon: '⚡' },
            { id: 'classes', label: '3. CLASSES & SKILLS', icon: '⚔' },
            { id: 'world', label: '4. TELEPORT & BOSSES', icon: '🗺' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-bold border-t-2 border-x-2 rounded-t cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#1B1626] border-[#C042FF] text-[#ECA6FF]'
                  : 'bg-[#0B0912] border-transparent text-[#7F7488] hover:text-[#D9D2C3]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F141C]">
          {/* TAB 1: GOLD & LEVEL UP (User's primary request) */}
          {activeTab === 'progression' && (
            <div className="space-y-4">
              {/* GOLD STATION */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#352542]">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#FFC83D] uppercase tracking-wider flex items-center gap-1.5">
                      <span>💰</span> Gold &amp; Economy Controls
                    </h3>
                    <p className="text-[11px] text-[#A69AA8]">
                      Add currency or set exact gold balance for Harlow trade, Ume gear, and consumables.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#A69AA8] uppercase">Current Gold:</span>
                    <div className="text-lg font-black text-[#FFC83D] tabular-nums">
                      {p.gold.toLocaleString()} G
                    </div>
                  </div>
                </div>

                {/* Quick Add Gold Buttons */}
                <div>
                  <span className="text-[10px] font-bold text-[#A69AA8] uppercase">Quick Add Gold:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1.5">
                    {[1000, 5000, 10000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleAddGold(amt)}
                        className="py-2 px-2 bg-[#251A31] border border-[#FFC83D]/60 hover:border-[#FFC83D] hover:bg-[#3D2B52] text-xs font-bold text-[#FFC83D] text-center cursor-pointer transition-all"
                      >
                        +{amt.toLocaleString()} G
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Gold Input & Zero */}
                <div className="pt-2 border-t border-[#352542] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#A69AA8] uppercase">Custom Gold:</span>
                    <input
                      type="number"
                      value={customGold}
                      onChange={(e) => setCustomGold(e.target.value)}
                      className="w-28 px-2 py-1 bg-[#0B0912] border border-[#4B325C] text-xs text-[#FFC83D] font-bold tabular-nums"
                    />
                    <button
                      onClick={() => handleAddGold(Number(customGold) || 0)}
                      className="px-2.5 py-1 bg-[#FFC83D] text-[#0B0912] font-bold text-xs cursor-pointer hover:bg-[#FFE082]"
                    >
                      + Add
                    </button>
                    <button
                      onClick={() => handleSetGold(Number(customGold) || 0)}
                      className="px-2.5 py-1 bg-[#251A31] border border-[#FFC83D] text-[#FFC83D] font-bold text-xs cursor-pointer hover:bg-[#3D2B52]"
                    >
                      Set Exact
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSetGold(120)}
                      className="px-2.5 py-1 bg-[#1A1224] border border-[#352542] text-[#A69AA8] hover:text-[#D9D2C3] text-[10px] cursor-pointer"
                    >
                      Default (120 G)
                    </button>
                    <button
                      onClick={() => handleSetGold(0)}
                      className="px-2.5 py-1 bg-[#3A1414] border border-[#FF3B3B] text-[#FF9090] text-[10px] font-bold cursor-pointer hover:bg-[#521C1C]"
                    >
                      Zero Gold (0 G)
                    </button>
                  </div>
                </div>
              </div>

              {/* LEVEL & XP STATION */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#352542]">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚡</span> Runner Level &amp; Experience Controls
                    </h3>
                    <p className="text-[11px] text-[#A69AA8]">
                      Instantly level up, jump to specialization milestones (15, 30, 45), or set custom level.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#A69AA8] uppercase">Current Level:</span>
                    <div className="text-lg font-black text-[#00F0FF] tabular-nums">
                      LV {p.level} / {PLAYER_CONFIG.levelCap || 50}
                    </div>
                  </div>
                </div>

                {/* Quick Level Up & Milestones */}
                <div>
                  <span className="text-[10px] font-bold text-[#A69AA8] uppercase">Level Up &amp; Milestone Warps:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-1.5">
                    <button
                      onClick={() => handleAddLevel(1)}
                      className="py-2 px-1.5 bg-[#172635] border border-[#00F0FF]/60 hover:border-[#00F0FF] hover:bg-[#1E374E] text-xs font-bold text-[#00F0FF] text-center cursor-pointer transition-all"
                    >
                      +1 Level
                    </button>
                    <button
                      onClick={() => handleAddLevel(5)}
                      className="py-2 px-1.5 bg-[#172635] border border-[#00F0FF]/60 hover:border-[#00F0FF] hover:bg-[#1E374E] text-xs font-bold text-[#00F0FF] text-center cursor-pointer transition-all"
                    >
                      +5 Levels
                    </button>
                    <button
                      onClick={() => handleSetLevel(15)}
                      className="py-2 px-1.5 bg-[#251A31] border border-[#C042FF] hover:bg-[#3D2B52] text-xs font-bold text-[#ECA6FF] text-center cursor-pointer transition-all"
                      title="Tier 1 Specialization Milestone (Unlocks 2 Active Skills)"
                    >
                      Jump Lv 15
                    </button>
                    <button
                      onClick={() => handleSetLevel(30)}
                      className="py-2 px-1.5 bg-[#251A31] border border-[#C042FF] hover:bg-[#3D2B52] text-xs font-bold text-[#ECA6FF] text-center cursor-pointer transition-all"
                      title="Tier 2 Mastery Milestone (Unlocks Mastery Skills)"
                    >
                      Jump Lv 30
                    </button>
                    <button
                      onClick={() => handleSetLevel(45)}
                      className="py-2 px-1.5 bg-[#312517] border border-[#FFC83D] hover:bg-[#4E3A20] text-xs font-bold text-[#FFC83D] text-center cursor-pointer transition-all"
                      title="Tier 3 Awakening Milestone (Unlocks Signature Ultimate)"
                    >
                      Jump Lv 45
                    </button>
                    <button
                      onClick={() => handleSetLevel(50)}
                      className="py-2 px-1.5 bg-[#311728] border border-[#FF3B7A] hover:bg-[#4E203E] text-xs font-bold text-[#FF82B0] text-center cursor-pointer transition-all"
                      title="Maximum Level Cap"
                    >
                      Max Lv 50
                    </button>
                  </div>
                </div>

                {/* Custom Level Setting */}
                <div className="pt-2 border-t border-[#352542] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#A69AA8] uppercase">Set Exact Level:</span>
                    <input
                      type="number"
                      min="1"
                      max={PLAYER_CONFIG.levelCap || 50}
                      value={customLevel}
                      onChange={(e) => setCustomLevel(e.target.value)}
                      className="w-20 px-2 py-1 bg-[#0B0912] border border-[#4B325C] text-xs text-[#00F0FF] font-bold tabular-nums"
                    />
                    <button
                      onClick={() => handleSetLevel(Number(customLevel) || 1)}
                      className="px-3 py-1 bg-[#00F0FF] text-[#0B0912] font-bold text-xs cursor-pointer hover:bg-[#80F8FF]"
                    >
                      Set Level
                    </button>
                  </div>

                  {/* XP Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddXp(1000)}
                      className="px-2 py-1 bg-[#172635] border border-[#3A5672] text-[#80C8FF] text-[10px] font-bold cursor-pointer hover:border-[#00F0FF]"
                    >
                      +1,000 XP
                    </button>
                    <button
                      onClick={() => handleAddXp(5000)}
                      className="px-2 py-1 bg-[#172635] border border-[#3A5672] text-[#80C8FF] text-[10px] font-bold cursor-pointer hover:border-[#00F0FF]"
                    >
                      +5,000 XP
                    </button>
                    <button
                      onClick={handleFillXp}
                      className="px-2.5 py-1 bg-[#4FD6A0] text-[#0B0D10] font-bold text-[10px] cursor-pointer hover:bg-[#72F0BC]"
                    >
                      Fill XP Bar
                    </button>
                  </div>
                </div>
              </div>

              {/* SKILL POINTS STATION */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#ECA6FF] uppercase">Skill &amp; Branch Tree Points</h4>
                  <p className="text-[11px] text-[#A69AA8]">
                    Currently Available: <strong className="text-[#00F0FF]">{p.skillPoints} Points</strong> · Spent on Tree: {Object.keys(p.treeNodes || {}).length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddSkillPoints(1)}
                    className="px-2.5 py-1.5 bg-[#251A31] border border-[#C042FF] text-[#ECA6FF] font-bold text-xs cursor-pointer hover:bg-[#3D2B52]"
                  >
                    +1 Point
                  </button>
                  <button
                    onClick={() => handleAddSkillPoints(5)}
                    className="px-2.5 py-1.5 bg-[#251A31] border border-[#C042FF] text-[#ECA6FF] font-bold text-xs cursor-pointer hover:bg-[#3D2B52]"
                  >
                    +5 Points
                  </button>
                  <button
                    onClick={() => handleAddSkillPoints(20)}
                    className="px-2.5 py-1.5 bg-[#251A31] border border-[#C042FF] text-[#ECA6FF] font-bold text-xs cursor-pointer hover:bg-[#3D2B52]"
                  >
                    +20 Points
                  </button>
                  <button
                    onClick={() => {
                      p.setSkillPoints(Math.max(0, p.level - 1));
                      engine.saveProgress();
                      engine.notifyUi();
                      showToast(`Reset skill points to Lv-1 (${p.level - 1} pts).`);
                      forceRefresh();
                    }}
                    className="px-2.5 py-1.5 bg-[#1A1224] border border-[#352542] text-[#A69AA8] text-xs cursor-pointer hover:text-[#D9D2C3]"
                  >
                    Reset to (Lv - 1)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMBAT CHEATS & BUFFS */}
          {activeTab === 'combat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Godmode Switch */}
                <div className={`p-3.5 border rounded flex items-center justify-between ${p.godmode ? 'bg-[#2A163B] border-[#C042FF]' : 'bg-[#15141E] border-[#352A42]'}`}>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#ECA6FF]">Godmode (Invincible)</h4>
                    <p className="text-[10px] text-[#A69AA8]">Cannot take damage, invulnerable to all hazards and lethal hits.</p>
                  </div>
                  <button
                    onClick={handleToggleGodmode}
                    className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer ${
                      p.godmode ? 'bg-[#C042FF] text-[#FFFFFF]' : 'bg-[#251A31] text-[#A69AA8] border border-[#352A42]'
                    }`}
                  >
                    {p.godmode ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Infinite Stamina Switch */}
                <div className={`p-3.5 border rounded flex items-center justify-between ${p.infiniteStamina ? 'bg-[#122A26] border-[#4FD6A0]' : 'bg-[#15141E] border-[#352A42]'}`}>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#4FD6A0]">Infinite Stamina</h4>
                    <p className="text-[10px] text-[#A69AA8]">Dodging, skills, and sprinting never deplete stamina.</p>
                  </div>
                  <button
                    onClick={handleToggleInfiniteStamina}
                    className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer ${
                      p.infiniteStamina ? 'bg-[#4FD6A0] text-[#0B0D10]' : 'bg-[#1A2520] text-[#A69AA8] border border-[#2A3F36]'
                    }`}
                  >
                    {p.infiniteStamina ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Zero Cooldowns Switch */}
                <div className={`p-3.5 border rounded flex items-center justify-between ${p.noCooldowns ? 'bg-[#142636] border-[#00F0FF]' : 'bg-[#15141E] border-[#352A42]'}`}>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#00F0FF]">Zero Cooldowns</h4>
                    <p className="text-[10px] text-[#A69AA8]">All 4 active skills and dodge have 0.0s cooldown.</p>
                  </div>
                  <button
                    onClick={handleToggleNoCooldowns}
                    className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer ${
                      p.noCooldowns ? 'bg-[#00F0FF] text-[#0B0D10]' : 'bg-[#18232C] text-[#A69AA8] border border-[#2D3F4D]'
                    }`}
                  >
                    {p.noCooldowns ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* One-Hit Kill Switch */}
                <div className={`p-3.5 border rounded flex items-center justify-between ${p.oneHitKill ? 'bg-[#3A1414] border-[#FF3B3B]' : 'bg-[#15141E] border-[#352A42]'}`}>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#FF5A5A]">One-Hit Kill (+99,999 ATK)</h4>
                    <p className="text-[10px] text-[#A69AA8]">Normal attacks and skills obliterate any mob in one hit.</p>
                  </div>
                  <button
                    onClick={handleToggleOneHitKill}
                    className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer ${
                      p.oneHitKill ? 'bg-[#FF3B3B] text-[#FFFFFF]' : 'bg-[#291717] text-[#A69AA8] border border-[#442323]'
                    }`}
                  >
                    {p.oneHitKill ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Speed Boost Switch */}
                <div className={`p-3.5 border rounded flex items-center justify-between ${p.speedBoost ? 'bg-[#2D2513] border-[#FFC83D]' : 'bg-[#15141E] border-[#352A42]'}`}>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#FFC83D]">Haste Sprint (+60% Speed)</h4>
                    <p className="text-[10px] text-[#A69AA8]">Move rapidly across large world zones and boss arenas.</p>
                  </div>
                  <button
                    onClick={handleToggleSpeedBoost}
                    className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer ${
                      p.speedBoost ? 'bg-[#FFC83D] text-[#0B0D10]' : 'bg-[#241F16] text-[#A69AA8] border border-[#3E3422]'
                    }`}
                  >
                    {p.speedBoost ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Instant Ultimate Charge */}
                <div className="p-3.5 bg-[#15141E] border border-[#352A42] rounded flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#D9D2C3]">Instant Ultimate Charge</h4>
                    <p className="text-[10px] text-[#A69AA8]">Fills ultimate gauge to 100% immediately for [R].</p>
                  </div>
                  <button
                    onClick={handleFillUltimate}
                    className="px-3 py-1.5 bg-[#251A31] border border-[#C042FF] text-[#ECA6FF] hover:bg-[#3D2B52] text-xs font-bold rounded cursor-pointer"
                  >
                    100% ULT
                  </button>
                </div>
              </div>

              {/* Instant Restores */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#E3E8E5] uppercase">Emergency Combat Actions</h4>
                  <p className="text-[11px] text-[#A69AA8]">Instant recovery without consuming inventory items.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefillHpStamina}
                    className="px-3 py-2 bg-[#4FD6A0] text-[#0B0D10] font-bold text-xs rounded cursor-pointer hover:bg-[#72F0BC]"
                  >
                    Full Restore (HP &amp; Stamina)
                  </button>
                  <button
                    onClick={() => {
                      p.clearAllCooldowns();
                      showToast('All active skill cooldowns reset to 0s!');
                    }}
                    className="px-3 py-2 bg-[#172635] border border-[#00F0FF] text-[#00F0FF] font-bold text-xs rounded cursor-pointer hover:bg-[#1E374E]"
                  >
                    Reset Cooldowns
                  </button>
                  <button
                    onClick={handleMaxSupplies}
                    className="px-3 py-2 bg-[#251A31] border border-[#FFC83D] text-[#FFC83D] font-bold text-xs rounded cursor-pointer hover:bg-[#3D2B52]"
                  >
                    Supplies x99 All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLASSES & SKILLS */}
          {activeTab === 'classes' && (
            <div className="space-y-4">
              {/* SECTION 1: RUNNER SELECTOR (5 BASE CHARACTERS) */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#352542]">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#C042FF] uppercase tracking-wider flex items-center gap-1.5">
                      <span>👤</span> 1. Select Active Runner (5 Base Characters)
                    </h3>
                    <p className="text-[11px] text-[#A69AA8]">
                      Each character commands a distinct weapon style, class mechanic, intrinsic trait, and 3 dedicated specializations. Abilities do not cross over between characters.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#A69AA8] uppercase">Active Runner:</span>
                    <div className="text-sm font-black text-white" style={{ color: accent }}>
                      {chDef.name}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {['sena', 'rook', 'ines', 'kaelen', 'vespera'].map((cId) => {
                    const cDef = CHARACTERS[cId];
                    const isCurrent = p.classId === cId;
                    const cColor = cDef.color || '#D9D2C3';

                    return (
                      <div
                        key={cId}
                        onClick={() => handleSwitchCharacter(cId)}
                        className={`p-2.5 rounded-lg border-2 flex flex-col justify-between space-y-2 cursor-pointer transition-all select-none ${
                          isCurrent
                            ? 'bg-[#1E1929] shadow-[0_0_15px_rgba(192,66,255,0.3)]'
                            : 'bg-[#100D16] border-[#31233D] hover:border-[#C042FF]/70 hover:bg-[#181322]'
                        }`}
                        style={{ borderColor: isCurrent ? cColor : undefined }}
                      >
                        <div className="flex items-center gap-2">
                          <CharacterPortrait
                            classId={cId}
                            expression="normal"
                            equipped={isCurrent ? p.equipped : {}}
                            stage={1}
                            size={32}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black truncate" style={{ color: isCurrent ? cColor : '#E3E8E5' }}>
                              {cDef.name.split(' ')[0]}
                            </h4>
                            <span
                              className="text-[9px] font-black uppercase px-1 py-0.2 rounded inline-block"
                              style={{ backgroundColor: `${cColor}22`, color: cColor }}
                            >
                              {cDef.role}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-[#261B30] flex items-center justify-between text-[10px]">
                          {isCurrent ? (
                            <span className="font-black text-[#00F0FF] flex items-center gap-1">
                              <span>✓</span> ACTIVE
                            </span>
                          ) : (
                            <span className="text-[#8C7D93] group-hover:text-white font-semibold">
                              Switch ►
                            </span>
                          )}
                          <span className="text-[9px] text-[#6E6075]">3 Classes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: ACTIVE RUNNER'S 3 SPECIALIZATIONS */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#352542]">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚔</span> 2. {chDef.name.toUpperCase()}'s 3 Specializations
                    </h3>
                    <p className="text-[11px] text-[#A69AA8]">
                      Switching specialization automatically equips its signature Level 45 Awakening Ultimate to <strong className="text-white">[R]</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUnlockAllSpecializations}
                      className="px-2.5 py-1 bg-[#251A31] border border-[#C042FF] text-[#ECA6FF] hover:bg-[#3D2B52] text-[10px] font-bold rounded cursor-pointer transition-colors"
                    >
                      Unlock All 15 Classes
                    </button>
                    <button
                      onClick={handleRespec}
                      className="px-2.5 py-1 bg-[#1A1224] border border-[#FF3B3B] text-[#FF8282] hover:bg-[#331414] text-[10px] font-bold rounded cursor-pointer transition-colors"
                    >
                      Respec Active Tree
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(chDef.classes || []).map((specKey) => {
                    const spec = SPECIALIZATIONS[specKey];
                    if (!spec) return null;
                    const isActive = p.activeClassId === spec.id;
                    const specUlt = spec.skills?.find((s) => s.ultimate);
                    const skill0 = spec.skills?.[0];

                    return (
                      <div
                        key={spec.id}
                        onClick={() => handleSwitchClass(spec.id)}
                        className={`p-3 rounded-lg border-2 flex flex-col justify-between space-y-2.5 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-[#1C1628] shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                            : 'bg-[#100D16] border-[#2C2138] hover:border-[#00F0FF]/60 hover:bg-[#161220]'
                        }`}
                        style={{ borderColor: isActive ? '#00F0FF' : undefined }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black" style={{ color: isActive ? '#00F0FF' : '#E3E8E5' }}>
                              {spec.name}
                            </h4>
                            {isActive && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#0A262C] text-[#00F0FF] border border-[#00F0FF]/40">
                                EQUIPPED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#9A8FA0] leading-snug line-clamp-2">
                            {spec.concept}
                          </p>
                        </div>

                        {/* Active Art + Signature Ultimate Teaser */}
                        <div className="space-y-1 pt-1.5 border-t border-[#251B30] text-[10px]">
                          {skill0 && (
                            <div className="flex items-center gap-1.5 text-[#C4B7CC]">
                              <PixelIcon itemId={skill0.icon || 'lunge'} size={14} />
                              <span className="truncate">Art: <strong>{skill0.name}</strong></span>
                            </div>
                          )}
                          {specUlt && (
                            <div className="flex items-center gap-1.5 text-[#FFC83D]">
                              <PixelIcon itemId={specUlt.icon || 'sevenCuts'} size={14} />
                              <span className="truncate">Ult: <strong>{specUlt.name}</strong></span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchClass(spec.id);
                          }}
                          className={`w-full py-1.5 px-2 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0E282E] text-[#00F0FF] border border-[#00F0FF]'
                              : 'bg-[#251936] text-[#ECA6FF] hover:bg-[#3D2856] border border-[#C042FF]/40'
                          }`}
                        >
                          {isActive ? '✓ Active Class' : `Switch to ${spec.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: ALL 15 SPECIALIZATIONS DIRECTORY (GROUPED BY CHARACTER) */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded space-y-3">
                <div className="pb-2 border-b border-[#352542] flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#FFC83D] uppercase tracking-wider flex items-center gap-1.5">
                      <span>★</span> 3. All 15 Specializations Directory (Grouped by Character)
                    </h3>
                    <p className="text-[11px] text-[#A69AA8]">
                      Clicking any specialization from another character automatically switches your runner and equips that class cleanly.
                    </p>
                  </div>
                  <button
                    onClick={handleTriggerClassChoice}
                    className="px-2.5 py-1 bg-gradient-to-r from-[#D4931C] to-[#F0B232] text-[#080B0F] font-black text-[10px] rounded cursor-pointer hover:brightness-110 whitespace-nowrap"
                  >
                    ⚡ Test 3-Card Choice Modal
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.values(CHARACTERS).map((char) => {
                    const isCharActive = p.classId === char.id;
                    const charColor = char.color || '#D9D2C3';

                    return (
                      <div
                        key={char.id}
                        className={`p-2.5 rounded border ${
                          isCharActive ? 'bg-[#1B1626] border-[#553C68]' : 'bg-[#100D16] border-[#261B30]'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#241B2D]">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: charColor }} />
                            <span className="text-xs font-black text-white">{char.name}</span>
                            <span
                              className="text-[9px] font-bold uppercase px-1 py-0.2 rounded"
                              style={{ backgroundColor: `${charColor}22`, color: charColor }}
                            >
                              {char.role}
                            </span>
                          </div>
                          {isCharActive && (
                            <span className="text-[9px] font-black text-[#00F0FF] uppercase">
                              Active Character
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {char.classes.map((clsId) => {
                            const spec = SPECIALIZATIONS[clsId];
                            if (!spec) return null;
                            const isSpecActive = p.activeClassId === spec.id && isCharActive;
                            const ult = spec.skills?.find((s) => s.ultimate);

                            return (
                              <button
                                key={spec.id}
                                onClick={() => handleSwitchClass(spec.id)}
                                className={`p-2 border text-left rounded cursor-pointer transition-colors ${
                                  isSpecActive
                                    ? 'bg-[#2A163B] border-[#00F0FF] text-[#00F0FF]'
                                    : 'bg-[#14101B] border-[#2C2138] text-[#A69AA8] hover:border-[#C042FF] hover:text-[#D9D2C3]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs">{spec.name}</span>
                                  {isSpecActive && <span className="text-[9px] text-[#00F0FF]">✓ Active</span>}
                                </div>
                                <div className="text-[10px] text-[#7F7488] line-clamp-1 mt-0.5">
                                  Ult: {ult?.name || 'Awakening'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEPORT & WORLD CONTROLS */}
          {activeTab === 'world' && (
            <div className="space-y-4">
              {/* Teleport Destinations */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded space-y-3">
                <div>
                  <h3 className="text-xs font-extrabold text-[#00F0FF] uppercase tracking-wider">
                    Fast Teleportation
                  </h3>
                  <p className="text-[11px] text-[#A69AA8]">Warp instantly to hubs, boss arenas, or safe zones.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTeleport(WORLD_CONFIG.kettleCenter.x, WORLD_CONFIG.kettleCenter.y, 'The Kettle Safe Hub')}
                    className="p-2.5 bg-[#14231E] border border-[#4FD6A0] hover:bg-[#1D3A30] text-left rounded cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#4FD6A0]">The Kettle Camp (Hub)</div>
                    <div className="text-[10px] text-[#A69AA8]">Campfire, Ume Pawn, Harlow Register</div>
                  </button>

                  <button
                    onClick={() => handleTeleport(2400, 850, 'Slab Town Arena (The Foreman)')}
                    className="p-2.5 bg-[#251A31] border border-[#3A3F47] hover:border-[#00F0FF] text-left rounded cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#D9D2C3]">North: Slab Town</div>
                    <div className="text-[10px] text-[#A69AA8]">The Foreman (Arrivals Ritual)</div>
                  </button>

                  <button
                    onClick={() => handleTeleport(3950, 3000, 'Lye Marsh Arena (Mother Sump)')}
                    className="p-2.5 bg-[#251A31] border border-[#3A3F47] hover:border-[#00F0FF] text-left rounded cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#D9D2C3]">East: Lye Marsh</div>
                    <div className="text-[10px] text-[#A69AA8]">Mother Sump (Devour Channel)</div>
                  </button>

                  <button
                    onClick={() => handleTeleport(850, 3000, 'Route 9 Arena (Big Axle)')}
                    className="p-2.5 bg-[#251A31] border border-[#3A3F47] hover:border-[#00F0FF] text-left rounded cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#D9D2C3]">West: Route 9</div>
                    <div className="text-[10px] text-[#A69AA8]">Big Axle (Overheat Core)</div>
                  </button>

                  <button
                    onClick={() => handleTeleport(3000, 4950, 'Copper Flats Arena (The Long Dry)')}
                    className="p-2.5 bg-[#251A31] border border-[#3A3F47] hover:border-[#00F0FF] text-left rounded cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#D9D2C3]">South: Copper Flats</div>
                    <div className="text-[10px] text-[#A69AA8]">The Long Dry (Segment Break)</div>
                  </button>

                  <button
                    onClick={handleLiberateAll}
                    className="p-2.5 bg-[#2F2113] border border-[#FFC83D] hover:bg-[#47331D] text-left rounded cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#FFC83D]">★ Liberate All 4 Sectors</div>
                    <div className="text-[10px] text-[#A69AA8]">Marks all bosses defeated &amp; unlocks rematches</div>
                  </button>
                </div>
              </div>

              {/* Combat & World Wipes */}
              <div className="p-3.5 bg-[#171420] border border-[#4B325C] rounded flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#FF3B3B] uppercase">Mob &amp; Boss Eliminator</h4>
                  <p className="text-[11px] text-[#A69AA8]">Clear surrounding threats without manual combat.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleKillMobs}
                    className="px-3 py-1.5 bg-[#381616] border border-[#FF3B3B] text-[#FF8585] text-xs font-bold cursor-pointer hover:bg-[#521C1C]"
                  >
                    Kill Nearby Mobs
                  </button>
                  <button
                    onClick={handleDamageBoss}
                    className="px-3 py-1.5 bg-[#251A31] border border-[#FFC83D] text-[#FFC83D] text-xs font-bold cursor-pointer hover:bg-[#3D2B52]"
                  >
                    -50% Boss HP
                  </button>
                  <button
                    onClick={handleKillBoss}
                    className="px-3 py-1.5 bg-[#FF3B3B] text-[#0B0D10] text-xs font-bold cursor-pointer hover:bg-[#FF6666]"
                  >
                    Kill Active Boss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#372744] bg-[#120F1A] px-4 py-2.5 flex items-center justify-between text-xs text-[#7F7488]">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-[#251A31] border border-[#4B325C] text-[#ECA6FF] font-bold rounded">~</kbd> or <kbd className="px-1.5 py-0.5 bg-[#251A31] border border-[#4B325C] text-[#ECA6FF] font-bold rounded">F2</kbd> anytime to toggle this dev menu.</span>
          </div>
          <button
            onClick={() => {
              engine.saveProgress();
              showToast('Progress successfully saved to disk/localStorage!');
            }}
            className="px-3 py-1 bg-[#1A1224] border border-[#4B325C] hover:border-[#C042FF] text-[#ECA6FF] text-xs font-bold cursor-pointer"
          >
            Save Progress Now
          </button>
        </div>
      </div>
    </div>
  );
}
export default DevSettingsModal;
