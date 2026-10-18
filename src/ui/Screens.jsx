import React, { useEffect, useRef, useState } from 'react';
import { PALETTE, DIALOGUE } from '../data/config.js';
import { CLASSES, CLASS_ORDER } from '../data/classes.js';
import { CharacterPortrait, PixelIcon } from './PixelWidgets.jsx';
import { drawCharacterSelectCardArt } from '../game/Sprites.js';
import { sound } from '../game/Audio.js';

/**
 * Shared 480x270 Pixel-Art Parallax Wasteland Backdrop Canvas
 */
function ParallaxWastelandCanvas() {
  const bgCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = null;
    let t = 0;

    const ash = Array.from({ length: 48 }, (_, i) => ({
      x: (i * 47) % 480,
      y: (i * 29) % 270,
      vx: 10 + (i % 5) * 4,
      vy: 4 + (i % 4) * 2,
      size: i % 3 === 0 ? 2 : 1,
    }));

    const renderParallax = () => {
      t += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#141A1C';
      ctx.fillRect(0, 75, w, 65);
      ctx.fillStyle = '#2B1F1D';
      ctx.fillRect(0, 140, w, 40);
      ctx.fillStyle = '#4A2416';
      ctx.fillRect(0, 180, w, 25);

      ctx.fillStyle = PALETTE.rust;
      for (let i = 0; i < 12; i++) {
        const rx = Math.round(((i * 43 + t * 2) % (w + 30)) - 15);
        const ry = Math.round(28 + Math.sin(i * 0.7) * 10);
        ctx.fillRect(rx, ry, 6 + (i % 3) * 4, 2);
      }

      const offset1 = Math.round((t * 4) % 120);
      for (let x = -120; x < w + 120; x += 60) {
        const px = Math.round(x - offset1);
        const towerH = 42 + ((Math.abs(Math.floor(x / 60)) * 23) % 38);
        ctx.fillStyle = '#13171B';
        ctx.fillRect(px, 185 - towerH, 26, towerH);
        if (Math.abs(Math.floor(x / 60)) % 3 === 0) {
          ctx.fillStyle = PALETTE.signal;
          ctx.fillRect(px + 10, 185 - towerH + 6, 2, 2);
        }
      }

      const offset2 = Math.round((t * 10) % 90);
      ctx.fillStyle = '#1C2026';
      ctx.fillRect(0, 182, w, 42);
      for (let x = -90; x < w + 90; x += 45) {
        const px = Math.round(x - offset2);
        ctx.fillStyle = PALETTE.slag;
        ctx.fillRect(px, 165, 32, 6);
        ctx.fillRect(px + 12, 171, 6, 18);
      }

      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(0, 208, w, 62);

      const sx = 355;
      const sy = 178;
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(sx - 14, sy + 6, 4, 24);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(sx - 11, sy + 6, 1, 24);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - 5, sy + 8, 10, 22);
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - 4, sy + 2, 9, 6);
      for (let k = 0; k < 6; k++) {
        const waveY = Math.round(Math.sin(t * 5 + k * 0.6) * 2);
        ctx.fillStyle = k === 4 ? PALETTE.rust : PALETTE.bone;
        ctx.fillRect(sx + 3 + k * 3, sy + 9 + waveY, 3, 2);
      }

      for (let i = 0; i < ash.length; i++) {
        const a = ash[i];
        a.x = (a.x + a.vx * 0.016) % w;
        a.y = (a.y + a.vy * 0.016) % h;
        ctx.fillStyle = i % 6 === 0 ? PALETTE.rust : PALETTE.bone;
        ctx.fillRect(Math.round(a.x), Math.round(a.y), a.size, a.size);
      }

      raf = requestAnimationFrame(renderParallax);
    };

    raf = requestAnimationFrame(renderParallax);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={bgCanvasRef}
      width={480}
      height={270}
      className="pixelated absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  );
}

/**
 * 96x96 Animated Portrait Card Canvas for Character Select Screen
 * Plays idle animation normally, and cycles idle + short attack when hovered.
 */
function CharacterSelectCardPortrait({ classId, isHovered, accentColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let tick = 0;
    const draw = () => {
      drawCharacterSelectCardArt(canvas, classId, isHovered, tick);
      tick++;
    };
    draw();
    const id = window.setInterval(draw, 1000 / 12);
    return () => window.clearInterval(id);
  }, [classId, isHovered]);

  return (
    <canvas
      ref={canvasRef}
      width={96}
      height={96}
      style={{
        width: 96,
        height: 96,
        borderColor: isHovered ? accentColor : '#3A3F47',
      }}
      className="pixelated block border-2 bg-[#0B0D10] shrink-0"
    />
  );
}

/**
 * Main Menu / Title Screen
 */
export function TitleScreen({ engine, onStart, onOpenGallery }) {
  const [showOptions, setShowOptions] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between bg-[#0B0D10] p-8 select-none">
      <ParallaxWastelandCanvas />

      <div className="relative z-10 flex items-center justify-between text-xs text-[#9E9789]">
        <span>YEARS AFTER THE SKY CAME DOWN IN PIECES</span>
        <span>SENA IBUKI · ROOK MATSUDA · INES CALLOWAY</span>
      </div>

      <div className="relative z-10 my-auto max-w-2xl">
        <svg
          viewBox="0 0 560 110"
          className="w-full max-w-xl h-auto block"
          aria-label="HellsAdvent"
        >
          <rect
            x="0"
            y="12"
            width="520"
            height="72"
            fill="#0B0D10"
            stroke="#3A3F47"
            strokeWidth="3"
          />
          <line x1="0" y1="84" x2="545" y2="84" stroke="#00F0FF" strokeWidth="4" />
          <polygon points="520,12 548,12 520,84" fill="#8B3A1E" />
          <text
            x="22"
            y="65"
            fill="#D9D2C3"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            fontWeight="900"
            fontSize="52"
            letterSpacing="4"
          >
            HELLSADVENT
          </text>
          <text
            x="24"
            y="104"
            fill="#00F0FF"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            fontWeight="700"
            fontSize="13"
            letterSpacing="4"
          >
            FLOOR 1 · RUST · ASH · DEAD WATER · THREE TRADES
          </text>
        </svg>

        <p className="mt-4 text-sm text-[#D9D2C3]/90 max-w-lg leading-relaxed bg-[#0B0D10] border border-[#3A3F47] p-3.5">
          Kettle&apos;s boiler is still burning. Pick your trade—Railcut melee, Springgun ranged, or Magnetist coil—interrupt 10-mob convergence rituals, and liberate Lye Marsh, Route 9, Slab Town, and the Copper Flats.
        </p>

        <div className="mt-6 w-72 bg-[#0B0D10] border-2 border-[#3A3F47] p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#3A3F47] pb-2 text-[11px] font-bold tracking-widest text-[#9E9789]">
            <span>MAIN MENU</span>
            <span className="text-[#00F0FF]">PRESS ENTER</span>
          </div>

          <button
            onClick={() => {
              sound.playUiClick();
              onStart();
            }}
            className="w-full px-5 py-3 bg-[#00F0FF] text-[#0B0D10] font-bold text-sm tracking-widest border-2 border-[#00F0FF] hover:bg-[#D9D2C3] hover:border-[#D9D2C3] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>START</span>
            <span className="text-xs font-bold">[ENTER]</span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              setShowOptions(true);
            }}
            className="w-full px-5 py-3 bg-[#161A20] text-[#D9D2C3] font-bold text-sm tracking-widest border-2 border-[#3A3F47] hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>OPTIONS</span>
            <span className="text-xs text-[#9E9789]">CFG</span>
          </button>

          {onOpenGallery && (
            <button
              onClick={() => {
                sound.playUiClick();
                onOpenGallery();
              }}
              className="w-full px-5 py-2.5 bg-[#0B0D10] text-[#FFC83D] font-bold text-xs tracking-wider border border-[#3A3F47] hover:border-[#FFC83D] transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>SPRITE GALLERY</span>
              <span>?gallery</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playUiClick();
              setShowControls(true);
            }}
            className="w-full px-5 py-2 bg-[#0B0D10] text-[#9E9789] font-bold text-xs tracking-wider border border-[#3A3F47] hover:border-[#00F0FF] hover:text-[#D9D2C3] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span>CONTROLS MANUAL</span>
            <span>[?]</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[#3A3F47] pt-3 text-xs text-[#D9D2C3]/80">
        <span>
          WASD Move · Mouse Aim · LMB Attack · SPACE Dodge · 1/2/3 Skills · R Ultimate · E Interact · I Gear · K Skill Tree · ESC Pause
        </span>
        <span className="text-[#FFC83D]">F11 FULLSCREEN</span>
      </div>

      {showOptions && (
        <OptionsModal
          engine={engine}
          onClose={() => setShowOptions(false)}
          onOpenControls={() => {
            setShowOptions(false);
            setShowControls(true);
          }}
        />
      )}

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
}

/**
 * 3-Save-Slot Selection Screen
 * Allows continuing an existing character run or starting a new character in any of the 3 save slots.
 */
export function SaveSlotScreen({ engine, onBack }) {
  const [, setRefresh] = useState(0);
  const [confirmDeleteSlot, setConfirmDeleteSlot] = useState(null);
  const slots = engine.getSaveSlotsSummary();

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between bg-[#0B0D10] p-6 select-none overflow-y-auto">
      <ParallaxWastelandCanvas />

      <div className="relative z-10 flex items-center justify-between border-b border-[#3A3F47] pb-3 shrink-0">
        <div>
          <h2 className="text-lg font-bold tracking-wider text-[#00F0FF]">
            SELECT SAVE LEDGER (3 SLOTS)
          </h2>
          <p className="text-xs text-[#9E9789]">
            Each save slot locks to one character class for the entire run. Starting a different class uses a new slot.
          </p>
        </div>
        <button
          onClick={() => {
            sound.playUiClick();
            onBack();
          }}
          className="px-4 py-2 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
        >
          [ESC] BACK TO TITLE
        </button>
      </div>

      <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mx-auto py-4">
        {slots.map((slot) => {
          const accent = slot.accentColor || PALETTE.signal;
          return (
            <div
              key={slot.slotIndex}
              className="bg-[#0B0D10]/95 border-2 p-5 flex flex-col justify-between gap-5"
              style={{ borderColor: slot.exists ? accent : '#3A3F47' }}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#3A3F47] pb-2 mb-4">
                  <span className="text-xs font-bold tracking-widest text-[#9E9789]">
                    SAVE SLOT 0{slot.slotIndex + 1}
                  </span>
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: slot.exists ? accent : '#9E9789' }}
                  >
                    {slot.exists ? `${slot.className} RUN` : 'EMPTY LEDGER'}
                  </span>
                </div>

                {slot.exists ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <CharacterPortrait
                        classId={slot.classId}
                        expression="normal"
                        equipped={slot.equipped}
                        stage={slot.stage}
                        branch={null}
                        size={72}
                      />
                      <div>
                        <div className="text-base font-bold text-[#D9D2C3]">
                          {slot.characterName}
                        </div>
                        <div
                          className="text-xs font-bold mt-0.5"
                          style={{ color: accent }}
                        >
                          {slot.title}, {slot.stageName}
                        </div>
                        <div className="text-xs text-[#FFC83D] font-bold mt-1 tabular-nums">
                          Level {slot.level} · {slot.gold} G
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-2 border border-dashed border-[#3A3F47] bg-[#161A20]/50">
                    <div className="text-sm font-bold text-[#D9D2C3]">
                      UNSTAMPED TRADE LEDGER
                    </div>
                    <p className="text-xs text-[#9E9789] px-4">
                      Start a new run as Sena (Melee), Rook (Ranged), Ines (Mage), Kaelen (Thermo-Lancer), or Vespera (Artificer).
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {slot.exists ? (
                  <>
                    <button
                      onClick={() => engine.selectSlot(slot.slotIndex)}
                      className="w-full py-3 font-bold text-xs tracking-wider text-[#0B0D10] cursor-pointer"
                      style={{ backgroundColor: accent }}
                    >
                      CONTINUE RUN (SLOT 0{slot.slotIndex + 1})
                    </button>

                    {confirmDeleteSlot === slot.slotIndex ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            engine.deleteSaveSlot(slot.slotIndex);
                            setConfirmDeleteSlot(null);
                            setRefresh((r) => r + 1);
                          }}
                          className="flex-1 py-2 bg-[#FF3B3B] text-[#0B0D10] font-bold text-xs cursor-pointer"
                        >
                          CONFIRM WIPE
                        </button>
                        <button
                          onClick={() => setConfirmDeleteSlot(null)}
                          className="flex-1 py-2 bg-[#161A20] border border-[#3A3F47] text-[#D9D2C3] font-bold text-xs cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteSlot(slot.slotIndex)}
                        className="w-full py-2 bg-[#161A20] border border-[#8B3A1E] hover:border-[#FF3B3B] text-xs font-bold text-[#9E9789] hover:text-[#FF3B3B] cursor-pointer"
                      >
                        WIPE SLOT &amp; PICK NEW CLASS
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => engine.selectSlot(slot.slotIndex)}
                    className="w-full py-3 bg-[#00F0FF] hover:bg-[#D9D2C3] text-[#0B0D10] font-bold text-xs tracking-widest cursor-pointer"
                  >
                    CHOOSE CHARACTER →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 text-center text-xs text-[#9E9789]">
        Progress saves automatically every 30s to your active slot.
      </div>
    </div>
  );
}

/**
 * Character Select Screen
 * Three tall cards side by side on a soot background with a slow parallax wasteland behind them.
 * Each card shows a 96x96 portrait, character name, class, one-line pitch, stat bars, and 3 starting skills with icons.
 * Hover plays the idle animation and a short attack. Click selects, then a confirm box asks:
 * "This is your character until you start a new save. Begin?" with Begin and Back.
 */
export function CharacterSelectScreen({ engine, onBack }) {
  const [hoveredClassId, setHoveredClassId] = useState(null);
  const [confirmClassId, setConfirmClassId] = useState(null);

  const statMaxes = {
    hp: 130,
    stamina: 65,
    atk: 14,
    def: 7,
    speed: 145,
  };

  const selectedCls = confirmClassId ? CLASSES[confirmClassId] : null;

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between bg-[#0B0D10] p-6 select-none overflow-y-auto">
      <ParallaxWastelandCanvas />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#3A3F47] pb-3">
        <div>
          <h2 className="text-lg font-bold tracking-wider text-[#D9D2C3]">
            SELECT YOUR RUNNER · SLOT 0{engine.activeSlotIndex + 1}
          </h2>
          <p className="text-xs text-[#9E9789]">
            Hover a card to preview combat stance. Click to lock your character for this save slot.
          </p>
        </div>
        <button
          onClick={() => {
            sound.playUiClick();
            onBack();
          }}
          className="px-4 py-2 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
        >
          [ESC] BACK TO SLOTS
        </button>
      </div>

      {/* Five Tall Cards Side by Side */}
      <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 max-w-7xl w-full mx-auto py-2">
        {CLASS_ORDER.map((classId) => {
          const cls = CLASSES[classId];
          const accent = cls.accentColor;
          const isHovered = hoveredClassId === classId;
          const b = cls.baseStats;

          const statRows = [
            { label: 'HP', val: b.hp, pct: (b.hp / statMaxes.hp) * 100 },
            { label: 'STAM', val: b.stamina, pct: (b.stamina / statMaxes.stamina) * 100 },
            { label: 'ATK', val: b.atk, pct: (b.atk / statMaxes.atk) * 100 },
            { label: 'DEF', val: b.def, pct: (b.def / statMaxes.def) * 100 },
            { label: 'SPD', val: b.speed, pct: (b.speed / statMaxes.speed) * 100 },
          ];

          return (
            <div
              key={classId}
              onMouseEnter={() => setHoveredClassId(classId)}
              onMouseLeave={() => setHoveredClassId(null)}
              onClick={() => {
                sound.playUiClick();
                setConfirmClassId(classId);
              }}
              className="bg-[#0B0D10]/95 border-2 p-4 flex flex-col justify-between gap-3.5 transition-colors cursor-pointer"
              style={{
                borderColor: isHovered ? accent : '#3A3F47',
              }}
            >
              <div className="space-y-3">
                {/* Top Header: 96x96 Animated Portrait + Name, Class, Titles */}
                <div className="flex items-start gap-3.5">
                  <CharacterSelectCardPortrait
                    classId={classId}
                    isHovered={isHovered}
                    accentColor={accent}
                  />
                  <div className="space-y-1">
                    <div
                      className="text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-[#161A20] border inline-block"
                      style={{ borderColor: accent, color: accent }}
                    >
                      {cls.className} · {cls.titles.hand}
                    </div>
                    <h3 className="text-base font-bold text-[#D9D2C3] tracking-wide">
                      {cls.characterName}
                    </h3>
                    <div className="text-[11px] text-[#9E9789]">
                      Weapon: <strong className="text-[#D9D2C3]">{cls.weaponName}</strong>
                    </div>
                    <div className="text-[10px] text-[#9E9789]">
                      Promotions:{' '}
                      <span style={{ color: accent }}>
                        {Object.values(cls.branches)
                          .map((br) => `${br.journeymanTitle} → ${br.masterTitle}`)
                          .join(' / ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* One-Line Pitch */}
                <p
                  className="text-xs text-[#D9D2C3] bg-[#161A20] border-l-2 px-3 py-2 leading-relaxed"
                  style={{ borderColor: accent }}
                >
                  {cls.pitch}
                </p>

                {/* Stat Bars (HP, Stamina, ATK, DEF, Speed) */}
                <div className="space-y-1.5 bg-[#161A20] border border-[#3A3F47] p-2.5">
                  <div className="text-[10px] font-bold text-[#9E9789] uppercase tracking-wider">
                    BASE ATTRIBUTES
                  </div>
                  {statRows.map((st) => (
                    <div key={st.label} className="flex items-center gap-2 text-[11px] tabular-nums">
                      <span className="w-10 font-bold text-[#9E9789]">{st.label}</span>
                      <div className="flex-1 h-2 bg-[#0B0D10] border border-[#3A3F47]">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, st.pct)}%`,
                            backgroundColor: accent,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right font-bold text-[#D9D2C3]">
                        {st.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Class Mechanic + 3 Starting Skills with Icons */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                    MECHANIC: {cls.mechanic.name}
                  </div>
                  <p className="text-[11px] text-[#9E9789] leading-snug">
                    {cls.mechanic.desc}
                  </p>

                  <div className="pt-1 space-y-1.5">
                    <div className="text-[10px] font-bold text-[#9E9789] uppercase tracking-wider">
                      STARTING SKILLS (1 / 2 / 3) &amp; ULTIMATE (R)
                    </div>
                    {cls.skillOrder.map((skId) => {
                      const sk = cls.skills[skId];
                      return (
                        <div
                          key={skId}
                          className="flex items-center gap-2.5 bg-[#161A20] border border-[#3A3F47] p-1.5"
                        >
                          <PixelIcon itemId={sk.icon} size={24} />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#D9D2C3]">
                              [{sk.hotkey}] {sk.name}
                            </div>
                            <div className="text-[10px] text-[#9E9789] truncate">
                              {sk.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playUiClick();
                  setConfirmClassId(classId);
                }}
                className="w-full py-2.5 font-bold text-xs tracking-widest uppercase border-2 transition-colors cursor-pointer"
                style={{
                  borderColor: accent,
                  backgroundColor: isHovered ? accent : '#161A20',
                  color: isHovered ? '#0B0D10' : accent,
                }}
              >
                SELECT {cls.characterName.toUpperCase()}
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {selectedCls && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0B0D10]/90 p-6">
          <div
            className="w-full max-w-md bg-[#0B0D10] border-2 p-6 space-y-4 text-center"
            style={{ borderColor: selectedCls.accentColor }}
          >
            <div className="flex justify-center">
              <CharacterPortrait
                classId={selectedCls.id}
                expression="normal"
                size={72}
              />
            </div>
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: selectedCls.accentColor }}
              >
                {selectedCls.characterName} · {selectedCls.className} ({selectedCls.titles.hand})
              </div>
              <p className="text-sm font-bold text-[#D9D2C3] mt-2 leading-relaxed">
                This is your character until you start a new save. Begin?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playHarlowStamp();
                  engine.startNewCharacterInSlot(engine.activeSlotIndex, selectedCls.id);
                }}
                className="flex-1 py-3 font-bold text-xs tracking-widest text-[#0B0D10] cursor-pointer"
                style={{ backgroundColor: selectedCls.accentColor }}
              >
                BEGIN
              </button>
              <button
                onClick={() => {
                  sound.playUiClick();
                  setConfirmClassId(null);
                }}
                className="flex-1 py-3 bg-[#161A20] border border-[#3A3F47] hover:border-[#D9D2C3] font-bold text-xs tracking-widest text-[#D9D2C3] cursor-pointer"
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OptionsModal({ engine, onClose, onOpenControls }) {
  const [, setRefresh] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [volumePct, setVolumePct] = useState(() =>
    Math.round((sound.masterVolume / 0.7) * 100)
  );

  const forceUpdate = () => {
    engine.saveProgress();
    engine.notifyUi();
    setRefresh((v) => v + 1);
  };

  const toggleFullscreen = () => {
    sound.playUiClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolumePct(val);
    sound.masterVolume = (val / 100) * 0.7;
    if (val === 0) {
      sound.setMuted(true);
    } else if (sound.muted) {
      sound.setMuted(false);
    }
    sound.playUiClick();
    forceUpdate();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0B0D10]/90 p-6">
      <div className="w-full max-w-lg bg-[#0B0D10] border-2 border-[#00F0FF] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#3A3F47] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#00F0FF] tracking-wider">
              OPTIONS &amp; CONFIGURATION
            </h3>
            <p className="text-xs text-[#9E9789] mt-0.5">
              Audio, display, and save file controls.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playUiClick();
              onClose();
            }}
            className="px-3 py-1.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between bg-[#161A20] border border-[#3A3F47] p-3">
            <div>
              <div className="font-bold text-[#D9D2C3]">WEB AUDIO SYNTHESIZER</div>
              <div className="text-[11px] text-[#9E9789]">
                Procedural sound effects for combat and menus
              </div>
            </div>
            <button
              onClick={() => {
                sound.toggleMute();
                sound.playUiClick();
                forceUpdate();
              }}
              className={`px-3.5 py-1.5 font-bold border cursor-pointer ${
                !sound.muted
                  ? 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789]'
              }`}
            >
              {sound.muted ? 'MUTED' : 'ENABLED'}
            </button>
          </div>

          <div className="bg-[#161A20] border border-[#3A3F47] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#D9D2C3]">MASTER VOLUME</span>
              <span className="font-bold text-[#00F0FF] tabular-nums">{volumePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={volumePct}
              onChange={handleVolumeChange}
              className="w-full accent-[#00F0FF] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between bg-[#161A20] border border-[#3A3F47] p-3">
            <div>
              <div className="font-bold text-[#D9D2C3]">CRT SCANLINE OVERLAY</div>
              <div className="text-[11px] text-[#9E9789]">
                Toggle horizontal monitor scanlines across viewport
              </div>
            </div>
            <button
              onClick={() => {
                engine.scanlinesEnabled = !engine.scanlinesEnabled;
                sound.playUiClick();
                forceUpdate();
              }}
              className={`px-3.5 py-1.5 font-bold border cursor-pointer ${
                engine.scanlinesEnabled
                  ? 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789]'
              }`}
            >
              {engine.scanlinesEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#161A20] border border-[#3A3F47] p-3">
            <div>
              <div className="font-bold text-[#D9D2C3]">REDUCE FLASHES</div>
              <div className="text-[11px] text-[#9E9789]">
                Replaces white screen flashes with bone tint; caps flashes to max 3/sec
              </div>
            </div>
            <button
              onClick={() => {
                engine.settings.reduceFlashes = !engine.settings.reduceFlashes;
                sound.playUiClick();
                forceUpdate();
              }}
              className={`px-3.5 py-1.5 font-bold border cursor-pointer ${
                engine.settings.reduceFlashes
                  ? 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789]'
              }`}
            >
              {engine.settings.reduceFlashes ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#161A20] border border-[#3A3F47] p-3">
            <div>
              <div className="font-bold text-[#D9D2C3]">SHORT ULTIMATES</div>
              <div className="text-[11px] text-[#9E9789]">
                Cuts cut-in duration to 120ms and compresses cinematic steps by 30%
              </div>
            </div>
            <button
              onClick={() => {
                engine.settings.shortUltimates = !engine.settings.shortUltimates;
                sound.playUiClick();
                forceUpdate();
              }}
              className={`px-3.5 py-1.5 font-bold border cursor-pointer ${
                engine.settings.shortUltimates
                  ? 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF]'
                  : 'bg-[#0B0D10] border-[#3A3F47] text-[#9E9789]'
              }`}
            >
              {engine.settings.shortUltimates ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#161A20] border border-[#3A3F47] p-3">
            <div>
              <div className="font-bold text-[#D9D2C3]">DISPLAY MODE</div>
              <div className="text-[11px] text-[#9E9789]">
                Toggle fullscreen window [F11]
              </div>
            </div>
            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 bg-[#0B0D10] border border-[#3A3F47] hover:border-[#00F0FF] font-bold text-[#D9D2C3] cursor-pointer"
            >
              TOGGLE FULLSCREEN
            </button>
          </div>

          {onOpenControls && (
            <button
              onClick={() => {
                sound.playUiClick();
                onOpenControls();
              }}
              className="w-full py-2.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] font-bold text-[#D9D2C3] cursor-pointer"
            >
              VIEW KEYBOARD &amp; MOUSE CONTROLS
            </button>
          )}

          <div className="pt-2 border-t border-[#3A3F47] flex items-center justify-between">
            <span className="text-[11px] text-[#9E9789]">
              Slot 0{engine.activeSlotIndex + 1}: {engine.player.getFullTitleLine()} · Lv {engine.player.level}
            </span>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 bg-[#0B0D10] border border-[#8B3A1E] hover:border-[#FF3B3B] text-[11px] font-bold text-[#FF3B3B] cursor-pointer"
              >
                RESET ACTIVE SLOT
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    engine.resetSaveData();
                    setConfirmReset(false);
                    forceUpdate();
                  }}
                  className="px-3 py-1 bg-[#FF3B3B] text-[#0B0D10] font-bold text-[11px] cursor-pointer"
                >
                  CONFIRM WIPE
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 bg-[#161A20] border border-[#3A3F47] text-[#D9D2C3] text-[11px] cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ControlsModal({ onClose }) {
  const rows = [
    ['WASD / Arrows', 'Move your Runner across the wasteland'],
    ['Mouse Cursor', 'Aim basic attacks, projectiles, and skills'],
    ['Left Click (LMB)', 'Basic Attack (Railcut 3-hit combo / Springgun bolts / Magnetist scrap throw)'],
    ['Right Click / Key V', 'Rook: Manual Active Reload · Sena (Anvil): Toggle Guard Stance'],
    ['SPACE', 'Dodge Roll (0.25s invulnerable, 1.2s cooldown)'],
    ['Keys 1 / 2 / 3', 'Class Active Skills 1, 2, and 3'],
    ['Key R', 'Class Ultimate (Seven Cuts / Ten Count / Scrapfall)'],
    ['Keys Q / F / Z / X / C', 'Quick-use Gauze Roll, Sugar Tin, Lye Wash, Hot Stew, Stim Stick'],
    ['Key E', 'Talk to Ume (Pawn Counter) or Harlow (Trade Register Promotions)'],
    ['Key I', 'Open Runner Pack & Equipment'],
    ['Key K', 'Open 3-Tier Class Skill Tree & Promotions'],
    ['ESC / F11', 'Pause Menu / Toggle Fullscreen'],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0B0D10]/90 p-6">
      <div className="w-full max-w-2xl bg-[#0B0D10] border-2 border-[#00F0FF] p-6">
        <div className="flex items-center justify-between border-b border-[#3A3F47] pb-3 mb-4">
          <h3 className="text-base font-bold text-[#00F0FF] tracking-wider">
            CONTROLS &amp; FIELD MANUAL
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {rows.map(([key, desc]) => (
            <div
              key={key}
              className="flex items-center justify-between border-b border-[#161A20] py-1.5 gap-4"
            >
              <span className="font-bold text-[#FFC83D] shrink-0">{key}</span>
              <span className="text-[#D9D2C3] text-right">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PauseMenu({ engine, onResume, onOpenGallery }) {
  const [showOptions, setShowOptions] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const p = engine.player;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/85 p-6">
      <div className="w-full max-w-md bg-[#0B0D10] border-2 border-[#3A3F47] p-6 space-y-4">
        <div className="border-b border-[#3A3F47] pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-wider text-[#D9D2C3]">
              PAUSED
            </h2>
            <p className="text-xs text-[#9E9789]">
              {p.getFullTitleLine()} · Slot 0{engine.activeSlotIndex + 1}
            </p>
          </div>
          <CharacterPortrait
            classId={p.classId}
            expression="normal"
            equipped={p.equipped}
            stage={p.stage}
            branch={p.branch}
            size={48}
          />
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onResume}
            className="w-full py-2.5 bg-[#00F0FF] text-[#0B0D10] font-bold text-xs tracking-wider hover:bg-[#D9D2C3] cursor-pointer"
          >
            RESUME [ESC]
          </button>

          <button
            onClick={() => setShowOptions(true)}
            className="w-full py-2.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
          >
            OPTIONS
          </button>

          {onOpenGallery && (
            <button
              onClick={onOpenGallery}
              className="w-full py-2.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#FFC83D] text-xs font-bold text-[#FFC83D] cursor-pointer"
            >
              SPRITE &amp; SILHOUETTE GALLERY (?gallery)
            </button>
          )}

          <button
            onClick={() => {
              engine.scanlinesEnabled = !engine.scanlinesEnabled;
              engine.saveProgress();
              engine.notifyUi();
            }}
            className="w-full py-2.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
          >
            SCANLINE OVERLAY: {engine.scanlinesEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowControls(true)}
            className="w-full py-2.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
          >
            CONTROLS SCREEN
          </button>

          <button
            onClick={() => {
              engine.saveProgress();
              setSavedNotice(true);
              setTimeout(() => setSavedNotice(false), 1800);
            }}
            className="w-full py-2.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#FFC83D] cursor-pointer"
          >
            {savedNotice ? 'PROGRESS SAVED' : 'SAVE PROGRESS NOW'}
          </button>

          <button
            onClick={() => {
              engine.saveProgress();
              engine.setUiState('slotSelect');
            }}
            className="w-full py-2.5 bg-[#161A20] border border-[#3A3F47] hover:border-[#00F0FF] text-xs font-bold text-[#D9D2C3] cursor-pointer"
          >
            SWITCH SAVE SLOT / NEW CHARACTER
          </button>

          <button
            onClick={() => {
              engine.saveProgress();
              engine.setUiState('title');
            }}
            className="w-full py-2.5 bg-[#0B0D10] border border-[#8B3A1E] hover:border-[#FF3B3B] text-xs font-bold text-[#9E9789] hover:text-[#D9D2C3] cursor-pointer"
          >
            RETURN TO MAIN MENU
          </button>
        </div>
      </div>

      {showOptions && (
        <OptionsModal
          engine={engine}
          onClose={() => setShowOptions(false)}
          onOpenControls={() => {
            setShowOptions(false);
            setShowControls(true);
          }}
        />
      )}

      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
}

export function DeathScreen({ engine }) {
  const p = engine.player;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/90 p-6">
      <div className="w-full max-w-md bg-[#0B0D10] border-2 border-[#FF3B3B] p-6 text-center space-y-4">
        <div className="flex justify-center">
          <CharacterPortrait
            classId={p.classId}
            expression="hurt"
            equipped={p.equipped}
            stage={p.stage}
            branch={p.branch}
            size={64}
          />
        </div>
        <h2 className="text-xl font-bold tracking-widest text-[#FF3B3B]">
          DOWN IN THE ASH
        </h2>
        <p className="text-xs text-[#D9D2C3] leading-relaxed">
          {DIALOGUE.deathMessage}
        </p>
        <div className="py-2 bg-[#161A20] border border-[#3A3F47] text-xs font-bold text-[#FFC83D] tabular-nums">
          HAUL FEE LOST: -{engine.lastGoldLost} GOLD (10%)
        </div>
        <button
          onClick={() => engine.respawnAfterDeath()}
          className="w-full py-3 bg-[#00F0FF] text-[#0B0D10] font-bold text-xs tracking-widest hover:bg-[#D9D2C3] cursor-pointer"
        >
          WAKE UP AT KETTLE [ENTER]
        </button>
      </div>
    </div>
  );
}
