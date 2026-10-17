import React from 'react';
import { SHOP_ITEMS, PLAYER_CONFIG, ENEMIES_CONFIG } from '../data/config.js';
import { SenaPortrait, PixelIcon, getGradeColor } from './PixelWidgets.jsx';

export function InventoryModal({ engine, onClose }) {
  const p = engine.player;
  const slots = [
    { key: 'head', label: 'Head' },
    { key: 'body', label: 'Body' },
    { key: 'legs', label: 'Legs' },
  ];

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/85 p-6">
      <div className="w-full max-w-4xl bg-[#0B0D10] border-2 border-[#3A3F47] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3A3F47] px-5 py-3.5 bg-[#161A20]">
          <div>
            <h2 className="text-base font-bold tracking-wider text-[#D9D2C3]">
              RUNNER PACK & EQUIPMENT [I]
            </h2>
            <p className="text-xs text-[#9E9789] mt-0.5">
              Equipped gear alters your stats and recolors Sena&apos;s sprite in real time.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-[#FFC83D] tabular-nums">
              {p.gold} G
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#0B0D10] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3]"
            >
              [ESC / I] CLOSE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 overflow-y-auto">
          {/* Left 5 Cols: Sena Character Sheet & Equipped Slots */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-[#161A20] border border-[#3A3F47] p-4 flex items-start gap-4">
              <SenaPortrait
                expression={p.getPortraitExpression()}
                equipped={p.equipped}
                size={72}
              />
              <div className="flex-1 text-xs space-y-1 tabular-nums">
                <div className="text-sm font-bold text-[#D9D2C3]">
                  {PLAYER_CONFIG.name}
                </div>
                <div className="text-[11px] text-[#00F0FF] font-bold">
                  Level {p.level} {PLAYER_CONFIG.role}
                </div>
                <div className="text-[11px] text-[#9E9789]">
                  Weapon: {PLAYER_CONFIG.weaponName}
                </div>
                <div className="pt-1.5 border-t border-[#3A3F47] grid grid-cols-2 gap-x-2 gap-y-1 text-[#D9D2C3]">
                  <span>HP: {Math.ceil(p.hp)}/{p.maxHp}</span>
                  <span>STAM: {Math.floor(p.stamina)}/{p.maxStamina}</span>
                  <span>ATK: {p.atk}</span>
                  <span>DEF: {p.def}</span>
                  <span>SPD: {p.speed}</span>
                  <span>CRIT: {Math.round(p.critChance * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Active Equipment Slots */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#9E9789] uppercase tracking-wider">
                EQUIPPED RIGGING
              </div>
              {slots.map(({ key, label }) => {
                const itemId = p.equipped[key];
                const item = itemId ? SHOP_ITEMS[itemId] : null;
                return (
                  <div
                    key={key}
                    className="p-3 bg-[#161A20] border border-[#3A3F47] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {item ? (
                        <PixelIcon itemId={item.id} size={36} />
                      ) : (
                        <div className="w-9 h-9 bg-[#0B0D10] border border-[#3A3F47] flex items-center justify-center text-[10px] text-[#3A3F47]">
                          --
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] text-[#9E9789] uppercase">
                          {label} SLOT
                        </div>
                        {item ? (
                          <div
                            className="text-xs font-bold"
                            style={{ color: getGradeColor(item.grade) }}
                          >
                            {item.name} · {item.grade}
                          </div>
                        ) : (
                          <div className="text-xs text-[#3A3F47]">
                            Standard Work Clothes
                          </div>
                        )}
                      </div>
                    </div>

                    {item && (
                      <button
                        onClick={() => engine.unequipSlot(key)}
                        className="px-2.5 py-1 bg-[#0B0D10] border border-[#3A3F47] hover:border-[#00F0FF] text-[11px] text-[#D9D2C3]"
                      >
                        UNEQUIP
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 7 Cols: Supplies, Spare Gear Bag, & Boss Hunt Log */}
          <div className="md:col-span-7 space-y-4">
            {/* Field Supplies */}
            <div className="bg-[#161A20] border border-[#3A3F47] p-4">
              <div className="text-xs font-bold text-[#9E9789] uppercase tracking-wider mb-2.5">
                FIELD SUPPLIES (CONSUMABLES)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['gauzeRoll', 'sugarTin'].map((supId) => {
                  const item = SHOP_ITEMS[supId];
                  const count = p.supplies[supId] || 0;
                  return (
                    <div
                      key={supId}
                      className="p-3 bg-[#0B0D10] border border-[#3A3F47] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <PixelIcon itemId={supId} size={32} />
                        <div>
                          <div className="text-xs font-bold text-[#D9D2C3]">
                            {item.name} (x{count})
                          </div>
                          <div className="text-[11px] text-[#9E9789]">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <button
                        disabled={count <= 0}
                        onClick={() => engine.player.useSupply(supId, engine.particles)}
                        className={`px-2.5 py-1 text-xs font-bold border ${
                          count > 0
                            ? 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF]'
                            : 'bg-[#161A20] border-[#3A3F47] text-[#3A3F47] cursor-not-allowed'
                        }`}
                      >
                        USE [{item.hotkey}]
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spare Equipment in Bag */}
            <div className="bg-[#161A20] border border-[#3A3F47] p-4">
              <div className="text-xs font-bold text-[#9E9789] uppercase tracking-wider mb-2.5">
                SPARE GEAR IN PACK ({p.ownedEquipment.length})
              </div>
              {p.ownedEquipment.length === 0 ? (
                <div className="text-xs text-[#9E9789] py-3">
                  No unequipped gear in pack. Buy gear from Ume at Kettle or hunt area bosses for Salvaged drops.
                </div>
              ) : (
                <div className="space-y-2">
                  {p.ownedEquipment.map((itemId, idx) => {
                    const item = SHOP_ITEMS[itemId];
                    if (!item) return null;
                    return (
                      <div
                        key={`${itemId}-${idx}`}
                        className="p-2.5 bg-[#0B0D10] border border-[#3A3F47] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <PixelIcon itemId={item.id} size={32} />
                          <div>
                            <div
                              className="text-xs font-bold"
                              style={{ color: getGradeColor(item.grade) }}
                            >
                              {item.name} · {item.grade}
                            </div>
                            <div className="text-[11px] text-[#9E9789]">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => engine.equipFromInventory(item.id)}
                          className="px-3 py-1 bg-[#1F4D4A] border border-[#00F0FF] text-xs font-bold text-[#00F0FF]"
                        >
                          EQUIP
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Area Boss Record */}
            <div className="bg-[#161A20] border border-[#3A3F47] p-4">
              <div className="text-xs font-bold text-[#9E9789] uppercase tracking-wider mb-2">
                SECTOR BOSS BOUNTIES
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ENEMIES_CONFIG.bosses).map((b) => {
                  const cleared = engine.spawner.defeatedBosses[b.id];
                  return (
                    <div
                      key={b.id}
                      className="p-2 bg-[#0B0D10] border border-[#3A3F47] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#D9D2C3]">{b.name}</div>
                        <div className="text-[10px] text-[#9E9789]">
                          {b.subtitle}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          cleared ? 'text-[#00F0FF]' : 'text-[#8B3A1E]'
                        }`}
                      >
                        {cleared ? 'CLEARED' : 'ACTIVE'}
                      </span>
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

export default InventoryModal;
