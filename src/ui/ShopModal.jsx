import React, { useState } from 'react';
import {
  SHOP_ITEMS,
  SHOP_SELL_RATIO,
  GRADES,
  DIALOGUE,
} from '../data/config.js';
import {
  TAVERN_MEALS,
  WANDERING_MERCHANT_STOCK,
  CURIO_GAMBLE_TIERS,
} from '../data/darkFantasyConfig.js';
import { CharacterPortrait, PixelIcon, getGradeColor } from './PixelWidgets.jsx';
import { worldLedger } from '../game/WorldLedger.js';

const TABS = [
  { id: 'head', label: 'Helms (Forge)' },
  { id: 'body', label: 'Armor (Forge)' },
  { id: 'legs', label: 'Greaves (Forge)' },
  { id: 'supplies', label: 'Apothecary' },
  { id: 'tavern', label: "Raven's Rest Tavern" },
  { id: 'curio', label: 'Curio Broker' },
  { id: 'wandering', label: 'Wandering Caravan' },
];

function renderStatComparisons(candidateItem, equippedItem) {
  if (!candidateItem) return null;
  if (candidateItem.consumable) {
    return (
      <div className="text-xs text-[#00F0FF] mt-1 space-y-0.5">
        {candidateItem.healHp ? <div>+{candidateItem.healHp} HP on use</div> : null}
        {candidateItem.restoreStamina ? (
          <div>+{candidateItem.restoreStamina} Stamina on use</div>
        ) : null}
        {candidateItem.clearsStatuses ? (
          <div className="text-[#4FD6A0]">
            Clears: {candidateItem.clearsStatuses.join(', ').toUpperCase()}
          </div>
        ) : null}
        {candidateItem.grantsBuffs ? (
          <div className="text-[#FFC83D]">
            Grants: {candidateItem.grantsBuffs.map((b) => `${b.id} (${b.duration}s)`).join(', ')}
          </div>
        ) : null}
      </div>
    );
  }

  const candStats = candidateItem.stats || {};
  const eqStats = equippedItem?.stats || {};
  const keys = [
    { key: 'def', label: 'DEF', mult: 1, unit: '' },
    { key: 'atk', label: 'ATK', mult: 1, unit: '' },
    { key: 'hp', label: 'Max HP', mult: 1, unit: '' },
    { key: 'stamina', label: 'Max Stamina', mult: 1, unit: '' },
    { key: 'speed', label: 'Move Speed', mult: 1, unit: ' px/s' },
    { key: 'critChance', label: 'Crit Chance', mult: 100, unit: '%' },
    { key: 'damageReduction', label: 'Less Damage Taken', mult: 100, unit: '%' },
    { key: 'dodgeCdReduction', label: 'Dodge Cooldown', mult: -1, unit: 's' },
  ];

  const rows = [];
  for (const k of keys) {
    const cVal = candStats[k.key] || 0;
    const eVal = eqStats[k.key] || 0;
    if (cVal === 0 && eVal === 0) continue;

    const diff = cVal - eVal;
    const formattedVal =
      k.key === 'dodgeCdReduction'
        ? `-${cVal.toFixed(1)}s`
        : `${cVal >= 0 ? '+' : ''}${Math.round(cVal * k.mult)}${k.unit}`;

    let diffEl = null;
    if (diff !== 0) {
      const isBetter = diff > 0;
      const diffFormatted =
        k.key === 'dodgeCdReduction'
          ? `${diff > 0 ? '-' : '+'}${Math.abs(diff).toFixed(1)}s`
          : `${diff > 0 ? '+' : ''}${Math.round(diff * k.mult)}${k.unit}`;
      diffEl = (
        <span
          className={`ml-2 font-bold ${
            isBetter ? 'text-[#2CE8A2]' : 'text-[#FF3B3B]'
          }`}
        >
          ({diffFormatted} vs equipped)
        </span>
      );
    } else {
      diffEl = <span className="ml-2 text-[#9E9789]">(No change)</span>;
    }

    rows.push(
      <div key={k.key} className="flex items-center justify-between text-xs py-0.5 tabular-nums">
        <span className="text-[#9E9789]">{k.label}</span>
        <div>
          <span className="text-[#D9D2C3] font-bold">{formattedVal}</span>
          {diffEl}
        </div>
      </div>
    );
  }

  return <div className="mt-2 space-y-0.5 border-t border-[#3A3F47] pt-2">{rows}</div>;
}

export function ShopModal({ engine, onClose }) {
  const initialTab = (() => {
    const t = engine.activeShopTab;
    if (t === 'apothecary') return 'supplies';
    if (t === 'tavern') return 'tavern';
    if (t === 'curio') return 'curio';
    if (t === 'wandering') return 'wandering';
    return 'head';
  })();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [hoveredItemId, setHoveredItemId] = useState('weldingGoggles');
  const [statusMsg, setStatusMsg] = useState(
    () => worldLedger.getReactiveDialogue('ume') || DIALOGUE.umeGreetings[0]
  );

  const p = engine.player;
  const cls = p.classConfig;
  const accent = cls.accentColor;

  const isEquipmentOrSupplyTab = ['head', 'body', 'legs', 'supplies'].includes(activeTab);
  const tabItems = isEquipmentOrSupplyTab
    ? Object.values(SHOP_ITEMS).filter((it) => it.slot === activeTab)
    : [];
  const inspectedItem = isEquipmentOrSupplyTab
    ? SHOP_ITEMS[hoveredItemId] || tabItems[0]
    : null;
  const currentlyEquippedForSlot =
    inspectedItem && !inspectedItem.consumable && p.equipped[inspectedItem.slot]
      ? SHOP_ITEMS[p.equipped[inspectedItem.slot]]
      : null;

  const handleBuyAndEquip = (item) => {
    const res = engine.buyAndEquipItem(item.id);
    if (!res.ok) {
      setStatusMsg(res.reason);
    } else {
      setStatusMsg(
        item.consumable
          ? `Prepared ${item.name}. Stored in your alchemy belt.`
          : `Runesmith Vaelen fitted ${item.name} onto your frame.`
      );
    }
  };

  const handleSellItem = (itemId, fromSlot = null) => {
    const item = SHOP_ITEMS[itemId];
    const ok = engine.sellItem(itemId, fromSlot);
    if (ok && item) {
      const price = Math.max(1, Math.floor(item.price * SHOP_SELL_RATIO));
      setStatusMsg(`Sold ${item.name} for ${price}G.`);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/90 p-4 select-none">
      <div className="w-full max-w-5xl bg-[#0B0D10] border-2 border-[#3A3F47] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3A3F47] px-5 py-3.5 bg-[#161A20]">
          <div>
            <h2 className="text-base font-bold tracking-wider text-[#D9D2C3]">
              DUSKHOLLOW SANCTUARY MERCHANTS &amp; FIELD CARAVANS
            </h2>
            <p className="text-xs text-[#c084fc] mt-0.5">{statusMsg}</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-sm font-bold text-[#FFC83D] tabular-nums">
              GOLD: {p.gold} G
            </div>
            <div className="text-xs font-bold" style={{ color: accent }}>
              {cls.characterName.toUpperCase()} LV {p.level}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#0B0D10] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
            >
              [ESC / E] LEAVE
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap border-b border-[#3A3F47] bg-[#0B0D10] px-5 pt-3 gap-1.5">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  const first = Object.values(SHOP_ITEMS).find((i) => i.slot === t.id);
                  if (first) setHoveredItemId(first.id);
                }}
                className={`px-3.5 py-2 text-xs font-bold border-t border-x transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#161A20] border-[#c084fc] text-[#c084fc]'
                    : 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789] hover:text-[#D9D2C3]'
                }`}
              >
                {t.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 overflow-y-auto">
          {/* Left 7 Cols: Active Merchant View */}
          <div className="md:col-span-7 space-y-2.5 max-h-[64vh] overflow-y-auto pr-1">
            {isEquipmentOrSupplyTab && (
              <>
                <div className="flex items-center justify-between text-[10px] text-[#9E9789] pb-1 border-b border-[#3A3F47]">
                  <span>
                    7 DARK FANTASY TIERS: LV1 · LV8 · LV16 · LV24 (FL2) · LV40 (FL3) · LV58 (FL4) · LV75 (FL5)
                  </span>
                  <span>ONE-CLICK BUY &amp; EQUIP</span>
                </div>

                {tabItems.map((item) => {
                  const gradeCfg = GRADES[item.grade] || { unlockLevel: item.reqLevel || 1 };
                  const reqLv = item.reqLevel || gradeCfg.unlockLevel || 1;
                  const gradeColor = getGradeColor(item.grade);
                  const isLocked = p.level < reqLv;
                  const isEquipped = !item.consumable && p.equipped[item.slot] === item.id;
                  const isOwnedInBag = !item.consumable && p.ownedEquipment.includes(item.id);
                  const canAfford = p.gold >= item.price;
                  const sellVal = Math.max(1, Math.floor(item.price * SHOP_SELL_RATIO));

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredItemId(item.id)}
                      className={`p-3 border flex items-center justify-between gap-3 transition-colors ${
                        hoveredItemId === item.id
                          ? 'bg-[#161A20] border-[#c084fc]'
                          : 'bg-[#0B0D10] border-[#3A3F47]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PixelIcon itemId={item.id} size={40} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-sm font-bold"
                              style={{ color: gradeColor }}
                            >
                              {item.name}
                            </span>
                            <span className="text-[11px] text-[#9E9789]">
                              · {gradeCfg.label || item.grade} (Lv.{reqLv})
                            </span>
                            {isEquipped && (
                              <span className="text-[10px] font-bold text-[#00F0FF]">
                                · EQUIPPED
                              </span>
                            )}
                            {item.consumable && (
                              <span className="text-[10px] font-bold text-[#FFC83D]">
                                · HELD: x{p.supplies[item.id] || 0}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#9E9789] mt-0.5">{item.desc}</div>
                          {isLocked && (
                            <div className="text-[11px] text-[#FF3B3B] mt-0.5">
                              Requires Player Level {reqLv}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-bold text-[#FFC83D] tabular-nums">
                          {item.price} G
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isEquipped ? (
                            <button
                              onClick={() => handleSellItem(item.id, item.slot)}
                              className="px-2.5 py-1 bg-[#161A20] border border-[#8B3A1E] hover:border-[#FF3B3B] text-[11px] font-bold text-[#D9D2C3] whitespace-nowrap cursor-pointer"
                            >
                              SELL ({sellVal}G)
                            </button>
                          ) : isOwnedInBag ? (
                            <>
                              <button
                                onClick={() => engine.equipFromInventory(item.id)}
                                className="px-2.5 py-1 bg-[#1F4D4A] border border-[#00F0FF] text-[11px] font-bold text-[#00F0FF] whitespace-nowrap cursor-pointer"
                              >
                                EQUIP OWNED
                              </button>
                              <button
                                onClick={() => handleSellItem(item.id)}
                                className="px-2 py-1 bg-[#161A20] border border-[#3A3F47] hover:border-[#FF3B3B] text-[11px] text-[#9E9789] whitespace-nowrap cursor-pointer"
                              >
                                SELL ({sellVal}G)
                              </button>
                            </>
                          ) : (
                            <button
                              disabled={isLocked || !canAfford}
                              onClick={() => handleBuyAndEquip(item)}
                              className={`px-3 py-1.5 text-xs font-bold border whitespace-nowrap cursor-pointer ${
                                isLocked || !canAfford
                                  ? 'bg-[#161A20] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                                  : 'bg-[#251538] border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-[#0B0D10]'
                              }`}
                            >
                              {item.consumable ? 'BUY (+1)' : 'BUY & EQUIP'}
                            </button>
                          )}

                          {item.consumable && (p.supplies[item.id] || 0) > 0 && (
                            <button
                              onClick={() => handleSellItem(item.id)}
                              className="px-2 py-1.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#FF3B3B] text-[11px] text-[#D9D2C3] whitespace-nowrap cursor-pointer"
                            >
                              SELL 1 ({sellVal}G)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* RAVEN'S REST TAVERN (Innkeeper Maeve) */}
            {activeTab === 'tavern' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#1A1324] border border-[#f59e0b]/50 text-xs text-[#D9D2C3]">
                  <div className="font-bold text-[#f59e0b] uppercase">
                    🍖 RAVEN&apos;S REST TAVERN · INNKEEPER MAEVE
                  </div>
                  <p className="text-[#9E9789] mt-0.5">
                    Every hot meal immediately restores 100% HP &amp; Stamina, cleanses all afflictions, and grants a 6-minute expedition buff across the Abyssal Spire.
                  </p>
                </div>

                {TAVERN_MEALS.map((meal) => {
                  const canAfford = p.gold >= meal.price;
                  const isActive = p.tavernMeal?.id === meal.id;
                  return (
                    <div
                      key={meal.id}
                      className={`p-3.5 border flex items-center justify-between gap-3 ${
                        isActive ? 'bg-[#1D2822] border-[#34d399]' : 'bg-[#0B0D10] border-[#3A3F47]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#FFC83D]">{meal.name}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#34d399] text-[#0B0D10]">
                              ACTIVE ({Math.ceil(p.tavernMeal.timer)}S)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#D9D2C3] mt-1">{meal.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-bold text-[#FFC83D]">{meal.price} G</span>
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            const res = engine.buyTavernMeal(meal.id);
                            setStatusMsg(res.ok ? `Savored ${meal.name}! Full HP/Stamina restored.` : res.reason);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold border cursor-pointer ${
                            !canAfford
                              ? 'bg-[#161A20] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                              : 'bg-[#2A1B0E] border-[#FFC83D] text-[#FFC83D] hover:bg-[#FFC83D] hover:text-[#0B0D10]'
                          }`}
                        >
                          DINE &amp; BUFF
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MYSTIC ENCHANTER & GAMBLING CURIO BROKER (Vex the Unseen) */}
            {activeTab === 'curio' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#171226] border border-[#c084fc]/50 text-xs text-[#D9D2C3]">
                  <div className="font-bold text-[#c084fc] uppercase">
                    🎲 GAMBLING CURIO BROKER · VEX THE UNSEEN
                  </div>
                  <p className="text-[#9E9789] mt-0.5">
                    Wager Gold on sealed Abyssal Reliquaries. Each coffer can unseal a 2.5x Gold Jackpot, high-tier Dark Fantasy Armor, or a permanent +1 Bonus Skill Point!
                  </p>
                </div>

                {CURIO_GAMBLE_TIERS.map((tier) => {
                  const canAfford = p.gold >= tier.price;
                  return (
                    <div
                      key={tier.id}
                      className="p-3.5 bg-[#0B0D10] border border-[#3A3F47] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#c084fc]">{tier.name}</div>
                        <p className="text-xs text-[#9E9789] mt-1">{tier.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-bold text-[#FFC83D]">{tier.price} G</span>
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            const res = engine.gambleCurio(tier.id);
                            setStatusMsg(res.ok ? res.rewardText : res.reason);
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold border cursor-pointer ${
                            !canAfford
                              ? 'bg-[#161A20] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                              : 'bg-[#251538] border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-[#0B0D10]'
                          }`}
                        >
                          UNSEAL COFFER
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* WANDERING MERCHANT CARAVAN (Morwen the Caravaner) */}
            {activeTab === 'wandering' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#10241E] border border-[#34d399]/60 text-xs text-[#D9D2C3]">
                  <div className="font-bold text-[#34d399] uppercase">
                    🛡 WANDERING MERCHANT CARAVAN · MORWEN THE CARAVANER
                  </div>
                  <p className="text-[#9E9789] mt-0.5">
                    Protected by the Mob-Repellent Sanctuary Ward! Morwen offers Rare Discount Gear, Cursed Relics (permanent passive artifacts), and potent XP/Gold Elixirs.
                  </p>
                </div>

                {WANDERING_MERCHANT_STOCK.map((item) => {
                  const canAfford = p.gold >= item.price;
                  const isOwnedRelic = item.category === 'relic' && p.cursedRelics?.includes(item.id);
                  const isActiveElixir = item.category === 'elixir' && p.elixirBuff?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-[#0B0D10] border border-[#3A3F47] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-[#162822] text-[#34d399] border border-[#34d399]/40">
                            {item.category}
                          </span>
                          <span className="text-sm font-bold text-[#D9D2C3]">{item.name}</span>
                          {isOwnedRelic && (
                            <span className="text-[10px] font-bold text-[#c084fc]">· RELIC BOUND</span>
                          )}
                          {isActiveElixir && (
                            <span className="text-[10px] font-bold text-[#34d399]">
                              · ACTIVE ({Math.ceil(p.elixirBuff.timer)}S)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9E9789] mt-1">{item.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-bold text-[#FFC83D]">{item.price} G</span>
                        <button
                          disabled={!canAfford || isOwnedRelic}
                          onClick={() => {
                            const res = engine.buyWanderingMerchantItem(item.id);
                            setStatusMsg(res.ok ? `Acquired ${item.name} from Morwen's Caravan!` : res.reason);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold border cursor-pointer ${
                            !canAfford || isOwnedRelic
                              ? 'bg-[#161A20] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                              : 'bg-[#14332A] border-[#34d399] text-[#34d399] hover:bg-[#34d399] hover:text-[#0B0D10]'
                          }`}
                        >
                          {isOwnedRelic ? 'OWNED' : 'PURCHASE'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 5 Cols: Comparison Tooltip & Character Live Gear Preview */}
          <div className="md:col-span-5 flex flex-col justify-between gap-4 bg-[#161A20] border border-[#3A3F47] p-4">
            {inspectedItem ? (
              <div>
                <div className="text-[10px] text-[#9E9789] uppercase tracking-wider">
                  INSPECTING · COMPARISON TOOLTIP
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <PixelIcon itemId={inspectedItem.id} size={44} />
                  <div>
                    <div
                      className="text-base font-bold"
                      style={{ color: getGradeColor(inspectedItem.grade) }}
                    >
                      {inspectedItem.name}
                    </div>
                    <div className="text-xs text-[#9E9789]">
                      {GRADES[inspectedItem.grade]?.label || inspectedItem.grade} · {inspectedItem.slot.toUpperCase()}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#D9D2C3]/90 mt-2.5 leading-relaxed">
                  {inspectedItem.desc}
                </p>

                {renderStatComparisons(inspectedItem, currentlyEquippedForSlot)}

                <div className="mt-3 pt-2 border-t border-[#3A3F47] flex items-center justify-between text-[11px] text-[#9E9789] tabular-nums">
                  <span>Buy Price: {inspectedItem.price} G</span>
                  <span>
                    Resale (40%): {Math.max(1, Math.floor(inspectedItem.price * SHOP_SELL_RATIO))} G
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#D9D2C3]">
                <div className="text-[10px] font-bold text-[#c084fc] uppercase tracking-wider">
                  ACTIVE SANCTUARY BLESSINGS &amp; RELICS
                </div>
                <div className="p-2.5 bg-[#0B0D10] border border-[#3A3F47] space-y-1.5">
                  <div>
                    <span className="text-[#9E9789]">Tavern Meal: </span>
                    <strong className="text-[#34d399]">
                      {p.tavernMeal ? `${p.tavernMeal.name} (${Math.ceil(p.tavernMeal.timer)}s)` : 'None'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#9E9789]">Caravan Elixir: </span>
                    <strong className="text-[#c084fc]">
                      {p.elixirBuff ? `${p.elixirBuff.name} (${Math.ceil(p.elixirBuff.timer)}s)` : 'None'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#9E9789]">Bound Cursed Relics: </span>
                    <strong className="text-[#FFC83D]">
                      {p.cursedRelics?.length ? p.cursedRelics.length : 0} / 3
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Character Portrait & Current Total Stats */}
            <div className="border-t border-[#3A3F47] pt-3 flex items-center gap-3">
              <CharacterPortrait
                classId={p.classId}
                expression="normal"
                equipped={p.equipped}
                stage={p.stage}
                branch={p.branch}
                size={64}
              />
              <div className="flex-1 text-xs space-y-1 tabular-nums">
                <div className="font-bold" style={{ color: accent }}>
                  {p.getFullTitleLine()}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[#D9D2C3]">
                  <span>HP: {p.maxHp}</span>
                  <span>STAM: {p.maxStamina}</span>
                  <span>ATK: {p.atk}</span>
                  <span>DEF: {p.def}</span>
                  <span>SPD: {p.speed}</span>
                  <span>CRIT: {Math.round(p.critChance * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopModal;
