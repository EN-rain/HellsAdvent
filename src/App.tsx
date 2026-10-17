/**
 * GRAVEL SKY — Main Application Shell
 * - Supports ?gallery URL query parameter (or in-app gallery toggle) to inspect every sprite
 *   and animation strip at 1x and 6x on soot (#0B0D10) plus solid black silhouettes.
 * - Renders the game world on an offscreen 480x270 canvas scaled by whole-number factors.
 */

import React, { useEffect, useRef, useState } from 'react';
import { gameEngine } from './game/Engine.js';
import { HUD } from './ui/HUD.jsx';
import { ShopModal } from './ui/ShopModal.jsx';
import { SkillPanel } from './ui/SkillPanel.jsx';
import { InventoryModal } from './ui/InventoryModal.jsx';
import { TitleScreen, PauseMenu, DeathScreen } from './ui/Screens.jsx';
import { GalleryView } from './ui/GalleryView.jsx';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uiState, setUiState] = useState<string>(gameEngine.uiState);
  const [hudSnapshot, setHudSnapshot] = useState<any>(() =>
    gameEngine.getHudSnapshot()
  );
  const [showGallery, setShowGallery] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.search.includes('gallery') ||
      window.location.hash.includes('gallery')
    );
  });
  const [, setTickVersion] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      gameEngine.attachCanvas(canvas);
    }

    const unsubscribe = gameEngine.subscribeUi((nextUiState: string) => {
      setUiState(nextUiState);
      setHudSnapshot(gameEngine.getHudSnapshot());
      setTickVersion((v) => v + 1);
    });

    const intervalId = window.setInterval(() => {
      if (gameEngine.uiState !== 'title') {
        setHudSnapshot(gameEngine.getHudSnapshot());
      }
    }, 100);

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
      gameEngine.detachCanvas();
    };
  }, []);

  if (showGallery) {
    return (
      <GalleryView
        onBackToGame={() => {
          if (window.location.search.includes('gallery')) {
            window.history.replaceState({}, '', window.location.pathname);
          }
          setShowGallery(false);
        }}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0B0D10] select-none">
      {/* Primary 60fps Game World Canvas (480x270 integer-scaled) */}
      <canvas
        ref={canvasRef}
        className="pixelated block w-full h-full cursor-crosshair"
      />

      {/* Optional Scanline Overlay (Toggled in Pause/Options Menu) */}
      {gameEngine.scanlinesEnabled && (
        <div className="scanlines pointer-events-none fixed inset-0 z-20" />
      )}

      {/* 10 Hz Perimeter HUD */}
      {uiState !== 'title' && (
        <HUD snapshot={hudSnapshot} engine={gameEngine} />
      )}

      {/* Title Screen & Main Menu */}
      {uiState === 'title' && (
        <TitleScreen
          engine={gameEngine}
          onStart={() => gameEngine.startGameFromTitle()}
          onOpenGallery={() => setShowGallery(true)}
        />
      )}

      {/* Ume's Pawn Shop Counter [E] */}
      {uiState === 'shop' && (
        <ShopModal
          engine={gameEngine}
          onClose={() => gameEngine.setUiState('playing')}
        />
      )}

      {/* Skill Panel [K] */}
      {uiState === 'skills' && (
        <SkillPanel
          engine={gameEngine}
          onClose={() => gameEngine.setUiState('playing')}
        />
      )}

      {/* Inventory & Equipment [I] */}
      {uiState === 'inventory' && (
        <InventoryModal
          engine={gameEngine}
          onClose={() => gameEngine.setUiState('playing')}
        />
      )}

      {/* Pause Menu [ESC] */}
      {uiState === 'pause' && (
        <PauseMenu
          engine={gameEngine}
          onResume={() => gameEngine.setUiState('playing')}
          onOpenGallery={() => setShowGallery(true)}
        />
      )}

      {/* Death Screen */}
      {uiState === 'death' && <DeathScreen engine={gameEngine} />}
    </div>
  );
}
