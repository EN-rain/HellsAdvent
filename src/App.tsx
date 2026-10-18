/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/Engine.js';
import { HUD } from './ui/HUD.jsx';
import { ShopModal } from './ui/ShopModal.jsx';
import { InventoryModal } from './ui/InventoryModal.jsx';
import { SkillPanel } from './ui/SkillPanel.jsx';
import { GalleryView } from './ui/GalleryView.jsx';
import {
  TitleScreen,
  SaveSlotScreen,
  CharacterSelectScreen,
  PauseMenu,
  DeathScreen,
} from './ui/Screens.jsx';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [galleryOpen, setGalleryOpen] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).has('gallery');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const engine = new GameEngine((nextSnapshot: any) => {
      setSnapshot(nextSnapshot);
    });
    engineRef.current = engine;

    if (canvasRef.current) {
      engine.attachCanvas(canvasRef.current);
      engine.start();
      setSnapshot(engine.getHudSnapshot());
    }

    const handleResize = () => engine.handleResize();
    const handleKeyDown = (e: KeyboardEvent) => engine.onKeyDown(e);
    const handleKeyUp = (e: KeyboardEvent) => engine.onKeyUp(e);
    const handleMouseUp = (e: MouseEvent) => engine.onMouseUp(e);

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mouseup', handleMouseUp);
      engine.stop();
    };
  }, []);

  const engine = engineRef.current;
  const uiState = snapshot?.uiState || 'title';

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#0B0D10] select-none"
      onMouseMove={(e) => engine?.onMouseMove(e)}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button, input, [data-hud-interactive]')) {
          return;
        }
        engine?.onMouseDown(e);
      }}
      onMouseUp={(e) => engine?.onMouseUp(e)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Offscreen-buffered 480x270 integer-scaled Game World Canvas */}
      <canvas
        ref={canvasRef}
        className="pixelated block w-full h-full cursor-crosshair"
      />

      {/* Optional CRT Scanline Overlay */}
      {snapshot?.scanlinesEnabled && <div className="scanline-overlay" />}

      {/* ?gallery Sprite & Silhouette Inspection View */}
      {galleryOpen && (
        <GalleryView
          onBackToGame={() => {
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('gallery');
              window.history.replaceState({}, '', url.toString());
            } catch {
              // Ignore history errors
            }
            setGalleryOpen(false);
          }}
        />
      )}

      {/* Title Screen */}
      {!galleryOpen && uiState === 'title' && engine && (
        <TitleScreen
          engine={engine}
          onStart={() => engine.setUiState('slotSelect')}
          onOpenGallery={() => setGalleryOpen(true)}
        />
      )}

      {/* 3 Save Slots Selection Screen */}
      {!galleryOpen && uiState === 'slotSelect' && engine && (
        <SaveSlotScreen
          engine={engine}
          onBack={() => engine.setUiState('title')}
        />
      )}

      {/* Character Select Screen (Sena, Rook, Ines) */}
      {!galleryOpen && uiState === 'charSelect' && engine && (
        <CharacterSelectScreen
          engine={engine}
          onBack={() => engine.setUiState('slotSelect')}
        />
      )}

      {/* Active HUD (Rendered on 10Hz tick) */}
      {!galleryOpen && uiState !== 'title' && uiState !== 'slotSelect' && uiState !== 'charSelect' && engine && (
        <HUD snapshot={snapshot} engine={engine} />
      )}

      {/* Ume's Pawn Shop Modal */}
      {!galleryOpen && uiState === 'shop' && engine && (
        <ShopModal
          engine={engine}
          onClose={() => engine.setUiState('playing')}
        />
      )}

      {/* Inventory & Gear Modal */}
      {!galleryOpen && uiState === 'inventory' && engine && (
        <InventoryModal
          engine={engine}
          onClose={() => engine.setUiState('playing')}
        />
      )}

      {/* Skill Tree & Promotion Panel (Also opens when interacting with Harlow) */}
      {!galleryOpen && (uiState === 'skills' || uiState === 'harlow') && engine && (
        <SkillPanel
          engine={engine}
          isHarlowMode={uiState === 'harlow'}
          onClose={() => engine.setUiState('playing')}
        />
      )}

      {/* Pause Menu */}
      {!galleryOpen && uiState === 'pause' && engine && (
        <PauseMenu
          engine={engine}
          onResume={() => engine.setUiState('playing')}
          onOpenGallery={() => setGalleryOpen(true)}
        />
      )}

      {/* Death Screen */}
      {!galleryOpen && uiState === 'death' && engine && (
        <DeathScreen engine={engine} />
      )}
    </div>
  );
}
