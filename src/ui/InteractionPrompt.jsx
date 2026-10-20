import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { sound } from '../game/Audio.js';
import { useAnimationFrame } from '../utils/hudHelpers.js';

/**
 * Interaction Prompt UI Component
 * Floats directly above NPCs and portals in the world canvas.
 * Uses a DOM ref + useAnimationFrame to update position at 60fps without triggering
 * 60Hz React state re-renders.
 */
export const InteractionPrompt = memo(function InteractionPrompt({ engine, snapshot }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const initialCoordsRef = useRef({ x: 0, y: 0 });

  const interact = snapshot?.nearbyInteractable;

  useEffect(() => {
    if (!interact || !engine) {
      setVisible(false);
      return;
    }
    const screenPos = engine.worldToScreen(interact.x, interact.y - 42);
    initialCoordsRef.current = { x: screenPos.x, y: screenPos.y };
    setVisible(Boolean(screenPos.visible));
  }, [interact, engine]);

  useAnimationFrame(() => {
    if (!interact || !engine) return;
    const screenPos = engine.worldToScreen(interact.x, interact.y - 42);
    if (screenPos.visible !== visible) {
      setVisible(Boolean(screenPos.visible));
    }
    if (containerRef.current && screenPos.visible) {
      const clampedX = Math.max(160, Math.min((window.innerWidth || 1280) - 160, screenPos.x));
      const clampedY = Math.max(96, Math.min((window.innerHeight || 720) - 120, screenPos.y));
      containerRef.current.style.left = `${clampedX}px`;
      containerRef.current.style.top = `${clampedY}px`;
    }
  }, Boolean(interact && engine));

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      sound.playUiClick?.();
      engine?.onKeyDown({ code: 'KeyE', preventDefault: () => {} });
    },
    [engine]
  );

  if (!interact || !visible) return null;

  const accent = interact.color || '#FFC83D';
  const actionText = interact.action || 'Interact';
  const nameText = interact.name || 'NPC';
  const subtitleText = interact.subtitle || '';

  return (
    <div
      ref={containerRef}
      data-hud-interactive="true"
      onClick={handleClick}
      style={{
        left: `${initialCoordsRef.current.x}px`,
        top: `${initialCoordsRef.current.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      className="fixed z-20 pointer-events-auto cursor-pointer select-none transition-transform duration-150 hover:scale-105 active:scale-95 group font-mono"
    >
      {/* Floating Prompt Card */}
      <div
        className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0B0D10]/95 backdrop-blur-md border-2 shadow-[0_6px_24px_rgba(0,0,0,0.9)] rounded-xs"
        style={{
          borderColor: accent,
          boxShadow: `0 0 14px ${accent}38, 0 6px_24px rgba(0,0,0,0.9)`,
        }}
      >
        {/* Tactile 3D Keycap [E] */}
        <div
          className="relative flex items-center justify-center w-6 h-6 rounded-xs border text-xs font-black shadow-[0_2px_0_#3A304D] transition-transform group-hover:-translate-y-0.5 shrink-0"
          style={{
            borderColor: accent,
            color: accent,
            background: 'linear-gradient(180deg, #251F33 0%, #120F1A 100%)',
          }}
        >
          <span>E</span>
        </div>

        {/* Action Title and NPC/Portal Name */}
        <div className="flex flex-col text-left pr-1 leading-tight">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-xs font-black tracking-wide text-[#FFFDF5] group-hover:text-[#00F0FF] transition-colors">
              {actionText}
            </span>
            <span className="text-[10px] font-bold text-[#FFC83D]/90">
              · Press E
            </span>
          </div>

          <div className="text-[10px] text-[#D9D2C3]/85 flex items-center gap-1 mt-0.5 whitespace-nowrap">
            <span className="font-bold text-[#E3E8E5]">{nameText}</span>
            {subtitleText && (
              <span className="text-[#9E9789] text-[9px] truncate max-w-[165px]">
                · {subtitleText}
              </span>
            )}
          </div>
        </div>

        {/* Small enter arrow indicator */}
        <div
          className="text-xs font-bold transition-transform group-hover:translate-x-0.5 shrink-0"
          style={{ color: accent }}
        >
          ▶
        </div>
      </div>

      {/* Downward Pointer Caret Arrow pointing at the NPC/Portal */}
      <div
        className="w-2.5 h-2.5 rotate-45 bg-[#0B0D10] border-r-2 border-b-2 mx-auto -mt-1.5"
        style={{ borderColor: accent }}
      />
    </div>
  );
});

export default InteractionPrompt;
