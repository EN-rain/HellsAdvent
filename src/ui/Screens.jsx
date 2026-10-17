import React, { useEffect, useState } from 'react';
import { DIALOGUE } from '../data/config.js';
import { SenaPortrait } from './PixelWidgets.jsx';
import { sound } from '../game/Audio.js';
import { assets } from '../game/AssetLoader.js';

/**
 * Main Menu / Title Screen
 * - Uses /assets/title_key_art.png (1920x1080 wide pixel-art scene: Sena on a collapsed overpass,
 *   scarf blowing, Kettle's boiler glow far below, burnt sky).
 * - Uses /assets/title_logo.png ("GRAVEL SKY" transparent PNG in chunky rust & bone stencil pixel letters).
 * - Displays manifest asset preloader progress bar before starting.
 */
export function TitleScreen({ engine, onStart, onOpenGallery }) {
  const [showOptions, setShowOptions] = useState(false);
  const [assetStatus, setAssetStatus] = useState(() => ({
    loaded: assets.loaded,
    progress: assets.progress,
    loadedCount: assets.loadedCount,
    totalToLoad: assets.totalToLoad,
  }));

  useEffect(() => {
    assets.preloadAll();
    const unsub = assets.subscribe((st) => setAssetStatus(st));
    return () => unsub();
  }, []);

  const hasSavedProgress =
    engine.player.level > 1 ||
    engine.player.gold !== 95 ||
    Object.values(engine.spawner.defeatedBosses || {}).some(Boolean);

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-8 text-[#D9D2C3] overflow-hidden bg-[#0B0D10]">
      {/* 1920x1080 Pixel-Art Title Key Art Background (/assets/title_key_art.png) */}
      <img
        src="/assets/title_key_art.png"
        alt="GRAVEL SKY Title Key Art"
        className="pixelated pointer-events-none absolute inset-0 w-full h-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#0B0D10]/35" />

      {/* Top Status Strip */}
      <div className="relative z-10 flex items-center justify-between text-xs text-[#D9D2C3]/80">
        <span className="px-2 py-1 bg-[#0B0D10]/90 border border-[#3A3F47]">
          ASSET PIPELINE • 48-COLOR PALETTE • 480x270 INTEGER BUFFER
        </span>
        <span className="px-2 py-1 bg-[#0B0D10]/90 border border-[#3A3F47]">
          F11 FULLSCREEN • WASD + MOUSE
        </span>
      </div>

      {/* Center-Left Main Menu Card */}
      <div className="relative z-10 my-auto max-w-xl bg-[#0B0D10]/92 border-2 border-[#3A3F47] p-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <SenaPortrait
            expression="determined"
            equipped={engine.player.equipped}
            size={72}
          />
          <div>
            <div className="text-xs font-bold tracking-[0.25em] text-[#00F0FF] uppercase">
              SALVAGE RUNNER • RAILCUT
            </div>
            {/* Transparent PNG Title Logo (/assets/title_logo.png) */}
            <img
              src="/assets/title_logo.png"
              alt="GRAVEL SKY"
              width={320}
              height={56}
              className="pixelated block my-1"
            />
            <div className="text-xs text-[#FFC83D] mt-0.5">
              {DIALOGUE.titleTagline}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#D9D2C3]/85 leading-relaxed mb-5 border-l-2 border-[#8B3A1E] pl-3">
          Kettle&apos;s boiler still burns. Outside the wire: Slab Town, Route 9, Lye
          Marsh, and the Copper Flats. Four heavy bosses hold the scrap routes.
        </p>

        {/* Manifest Preloader Progress Bar */}
        {!assetStatus.loaded && (
          <div className="mb-4 p-2.5 bg-[#0B0D10] border border-[#00F0FF]">
            <div className="flex justify-between text-[11px] font-bold text-[#00F0FF] mb-1">
              <span>PRELOADING MANIFEST ASSETS...</span>
              <span>
                {assetStatus.loadedCount}/{assetStatus.totalToLoad} (
                {Math.round(assetStatus.progress * 100)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#3A3F47]">
              <div
                className="h-full bg-[#00F0FF] transition-all duration-75"
                style={{ width: `${Math.round(assetStatus.progress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* MAIN MENU BUTTONS: START & OPTIONS */}
        <div className="flex flex-col gap-2.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00F0FF] mb-0.5">
            MAIN MENU
          </div>

          <button
            onClick={onStart}
            disabled={!assetStatus.loaded}
            className="w-full flex items-center justify-between px-5 py-3 bg-[#00F0FF] hover:bg-[#00F0FF]/85 disabled:opacity-50 text-[#0B0D10] font-bold text-sm tracking-wider uppercase cursor-pointer border-2 border-[#D9D2C3] transition-colors"
          >
            <span>START</span>
            <span className="text-xs font-bold">
              {hasSavedProgress
                ? `LV.${engine.player.level} • ${engine.player.gold}G [ENTER]`
                : 'NEW RUN [ENTER]'}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playUiClick();
              setShowOptions(true);
            }}
            className="w-full flex items-center justify-between px-5 py-2.5 bg-[#1F4D4A]/40 hover:bg-[#1F4D4A]/80 border-2 border-[#00F0FF]/60 text-[#D9D2C3] font-bold text-sm tracking-wider uppercase cursor-pointer transition-colors"
          >
            <span>OPTIONS</span>
            <span className="text-[11px] text-[#00F0FF]">
              AUDIO • DISPLAY • CONTROLS • DATA
            </span>
          </button>

          {onOpenGallery && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playUiClick();
                  onOpenGallery();
                }}
                className="flex-1 flex items-center justify-between px-4 py-2 bg-[#0B0D10] hover:bg-[#3A3F47] border border-[#3A3F47] text-[#FFC83D] font-bold text-xs tracking-wider uppercase cursor-pointer transition-colors"
              >
                <span>SPRITE GALLERY</span>
                <span className="text-[10px] text-[#D9D2C3]/80">1X • 6X • SILHOUETTE</span>
              </button>
              <a
                href="/assets/contact-sheet.html"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-[#0B0D10] hover:bg-[#3A3F47] border border-[#3A3F47] text-[#00F0FF] font-bold text-xs tracking-wider uppercase flex items-center"
              >
                CONTACT SHEET
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 flex items-center justify-between text-xs text-[#D9D2C3]/60">
        <span>SENA IBUKI • KETTLE SALVAGE</span>
        <span>PRESS [ENTER] TO START</span>
      </div>

      {showOptions && (
        <OptionsModal
          engine={engine}
          onClose={() => {
            sound.playUiClick();
            setShowOptions(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Options Modal (Audio Volume, Mute Toggle, Scanline Filter, Fullscreen, Controls Reference, & Save Reset)
 */
export function OptionsModal({ engine, onClose }) {
  const [muted, setMuted] = useState(sound.muted);
  const [volume, setVolume] = useState(Math.round((sound.masterVolume ?? 0.35) * 100));
  const [scanlines, setScanlines] = useState(engine.scanlinesEnabled);
  const [confirmReset, setConfirmReset] = useState(false);

  const controls = [
    ['WASD / Arrows', 'Move Sena'],
    ['Mouse Cursor', 'Aim attacks & skills'],
    ['Left Click (Hold/Tap)', '3-Hit Railcut Combo'],
    ['SPACE', 'Dodge Step (0.25s invulnerable, 1.2s CD)'],
    ['1', 'Skill 1: Lunge (Dash cut)'],
    ['2', 'Skill 2: Ground Break (AoE stun)'],
    ['3', 'Skill 3: Rail Spike (Piercing iron)'],
    ['R', 'Ultimate: Seven Cuts (100% charge)'],
    ['Q / F', 'Use Boiled Gauze / Sugar Tin'],
    ['E', "Open Ume's Counter (in Kettle camp)"],
    ['I / K / ESC', 'Gear & Stats / Skills / Pause'],
  ];

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setMuted(next);
    engine.saveProgress();
    engine.notifyUi();
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    sound.masterVolume = val / 100;
    if (val > 0 && sound.muted) {
      sound.setMuted(false);
      setMuted(false);
    }
    sound.playUiClick();
    engine.notifyUi();
  };

  const handleToggleScanlines = () => {
    engine.scanlinesEnabled = !engine.scanlinesEnabled;
    setScanlines(engine.scanlinesEnabled);
    sound.playUiClick();
    engine.saveProgress();
    engine.notifyUi();
  };

  const handleToggleFullscreen = () => {
    sound.playUiClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      data-hud-interactive="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#0B0D10]/85 p-4 text-[#D9D2C3]"
    >
      <div className="w-full max-w-2xl bg-[#0B0D10] border-2 border-[#00F0FF] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-[#3A3F47] pb-3 mb-4">
          <div>
            <div className="text-base font-bold text-[#00F0FF] tracking-wider uppercase">
              OPTIONS &amp; CONTROLS
            </div>
            <div className="text-xs text-[#D9D2C3]/70">
              Audio synth, display filter, keybindings, and save file
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#3A3F47] hover:bg-[#8B3A1E] text-xs font-bold cursor-pointer"
          >
            CLOSE [ESC]
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="border border-[#3A3F47] bg-[#3A3F47]/15 p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FFC83D] uppercase">
                Web Audio Synth
              </span>
              <button
                onClick={handleToggleMute}
                className={`px-2.5 py-1 text-xs font-bold border cursor-pointer ${
                  muted
                    ? 'bg-[#8B3A1E]/40 border-[#FF3B3B] text-[#FF3B3B]'
                    : 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF]'
                }`}
              >
                {muted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-[11px] text-[#D9D2C3]/80 mb-1">
                <span>Master Volume</span>
                <span className="font-bold text-[#00F0FF]">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
            </div>
          </div>

          <div className="border border-[#3A3F47] bg-[#3A3F47]/15 p-3 flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#FFC83D] uppercase">
                  CRT Scanlines
                </div>
                <div className="text-[10px] text-[#D9D2C3]/70">
                  Subtle horizontal raster lines
                </div>
              </div>
              <button
                onClick={handleToggleScanlines}
                className={`px-2.5 py-1 text-xs font-bold border cursor-pointer ${
                  scanlines
                    ? 'bg-[#1F4D4A] border-[#00F0FF] text-[#00F0FF]'
                    : 'bg-[#0B0D10] border-[#3A3F47] text-[#D9D2C3]/70'
                }`}
              >
                {scanlines ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#3A3F47]/60">
              <div>
                <div className="text-xs font-bold text-[#D9D2C3] uppercase">
                  Window Mode
                </div>
                <div className="text-[10px] text-[#D9D2C3]/70">
                  Shortcut: [F11]
                </div>
              </div>
              <button
                onClick={handleToggleFullscreen}
                className="px-2.5 py-1 bg-[#3A3F47] hover:bg-[#00F0FF] hover:text-[#0B0D10] text-xs font-bold cursor-pointer"
              >
                FULLSCREEN
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#00F0FF] mb-2">
            KEYBOARD &amp; MOUSE CONTROLS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {controls.map(([k, desc]) => (
              <div
                key={k}
                className="flex items-center justify-between border border-[#3A3F47] bg-[#3A3F47]/10 px-2.5 py-1.5 text-xs"
              >
                <span className="font-bold text-[#FFC83D]">{k}</span>
                <span className="text-[#D9D2C3]/90 text-right">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#3A3F47]">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 bg-[#0B0D10] hover:bg-[#8B3A1E]/40 border border-[#8B3A1E] text-[#FF3B3B] text-xs font-bold cursor-pointer"
            >
              CLEAR SAVE DATA
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#FF3B3B] font-bold">
                Wipe all level &amp; gear progress?
              </span>
              <button
                onClick={() => {
                  engine.resetSaveData();
                  setConfirmReset(false);
                }}
                className="px-2.5 py-1 bg-[#FF3B3B] text-[#0B0D10] text-xs font-bold cursor-pointer"
              >
                CONFIRM WIPE
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-1 bg-[#3A3F47] text-[#D9D2C3] text-xs cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#00F0FF] text-[#0B0D10] text-xs font-bold uppercase cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Pause Menu [ESC]
 */
export function PauseMenu({ engine, onResume, onOpenGallery }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      data-hud-interactive="true"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/85 p-4 text-[#D9D2C3]"
    >
      <div className="w-full max-w-md bg-[#0B0D10] border-2 border-[#3A3F47] p-5 shadow-2xl">
        <div className="text-lg font-bold tracking-widest text-[#00F0FF] uppercase mb-1">
          PAUSED
        </div>
        <div className="text-xs text-[#D9D2C3]/70 mb-4">
          Progress saves automatically every 30 seconds and at Kettle camp.
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/85 text-[#0B0D10] font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            RESUME [ESC]
          </button>

          <button
            onClick={() => setShowOptions(true)}
            className="w-full py-2 bg-[#1F4D4A]/40 hover:bg-[#1F4D4A]/80 border border-[#00F0FF]/60 text-xs font-bold uppercase cursor-pointer"
          >
            OPTIONS &amp; CONTROLS
          </button>

          {onOpenGallery && (
            <button
              onClick={onOpenGallery}
              className="w-full py-2 bg-[#0B0D10] hover:bg-[#3A3F47] border border-[#FFC83D]/60 text-[#FFC83D] text-xs font-bold uppercase cursor-pointer"
            >
              SPRITE &amp; SILHOUETTE GALLERY
            </button>
          )}

          <button
            onClick={() => {
              engine.saveProgress();
              engine.setUiState('title');
            }}
            className="w-full py-2 bg-[#8B3A1E]/40 hover:bg-[#8B3A1E] border border-[#8B3A1E] text-xs font-bold uppercase cursor-pointer mt-2"
          >
            SAVE &amp; RETURN TO MAIN MENU
          </button>
        </div>
      </div>

      {showOptions && (
        <OptionsModal engine={engine} onClose={() => setShowOptions(false)} />
      )}
    </div>
  );
}

/**
 * Death Screen
 */
export function DeathScreen({ engine }) {
  return (
    <div
      data-hud-interactive="true"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#0B0D10]/90 p-4 text-[#D9D2C3]"
    >
      <div className="w-full max-w-md bg-[#0B0D10] border-2 border-[#FF3B3B] p-6 text-center shadow-2xl">
        <div className="flex justify-center mb-3">
          <SenaPortrait
            expression="hurt"
            equipped={engine.player.equipped}
            size={64}
          />
        </div>
        <div className="text-xl font-bold tracking-[0.2em] text-[#FF3B3B] uppercase mb-1">
          {DIALOGUE.deathHeader}
        </div>
        <p className="text-xs text-[#D9D2C3]/85 mb-4">{DIALOGUE.deathSub}</p>

        <div className="bg-[#3A3F47]/20 border border-[#3A3F47] p-3 mb-5 text-xs">
          <div className="flex justify-between mb-1">
            <span>Haul Fee (10% Gold):</span>
            <span className="text-[#FF3B3B] font-bold">
              -{engine.lastGoldLost}G
            </span>
          </div>
          <div className="flex justify-between">
            <span>Level &amp; Equipment:</span>
            <span className="text-[#00F0FF] font-bold">KEPT</span>
          </div>
        </div>

        <button
          onClick={() => engine.respawnAfterDeath()}
          className="w-full py-3 bg-[#FF3B3B] hover:bg-[#FF3B3B]/85 text-[#0B0D10] font-bold text-sm uppercase tracking-wider cursor-pointer"
        >
          WAKE AT KETTLE FIRE [ENTER]
        </button>
      </div>
    </div>
  );
}
