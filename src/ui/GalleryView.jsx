/**
 * GRAVEL SKY — ?gallery Asset & Silhouette Inspector
 * Reads directly from /assets/manifest.json and displays every processed PNG strip
 * at 1x and 6x on soot (#0B0D10) plus a solid black silhouette row.
 */

import React, { useEffect, useState } from 'react';

export function GalleryView({ onBackToGame }) {
  const [manifest, setManifest] = useState(null);
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    fetch('/assets/manifest.json')
      .then((r) => r.json())
      .then((data) => setManifest(data))
      .catch(() => {});
  }, []);

  const assetsList = manifest ? Object.values(manifest.assets) : [];
  const categories = ['all', 'player', 'portrait', 'enemy_common', 'enemy_elite', 'boss', 'fx', 'tile', 'prop', 'npc', 'ui', 'ui_icon'];
  const filtered =
    filterCat === 'all'
      ? assetsList
      : assetsList.filter((a) => a.category === filterCat);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0D10] text-[#D9D2C3] p-6 select-text">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#3A3F47] pb-4 mb-6">
          <div>
            <div className="text-xs font-bold tracking-[0.2em] text-[#00F0FF] uppercase">
              MANIFEST ASSET PIPELINE • 1X, 6X, &amp; SILHOUETTE VERIFICATION
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-[#D9D2C3] mt-0.5">
              GRAVEL SKY — CONTACT SHEET &amp; GALLERY
            </h1>
            <p className="text-xs text-[#D9D2C3]/75 mt-1">
              Every asset loaded from <code className="text-[#00F0FF]">/public/assets/manifest.json</code> • Zero pink fringe • 48-color quantized palette • Aligned feet anchors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/assets/contact-sheet.html"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-[#1F4D4A] border border-[#00F0FF] text-[#00F0FF] font-bold text-xs uppercase"
            >
              OPEN STATIC CONTACT-SHEET.HTML
            </a>
            {onBackToGame && (
              <button
                onClick={onBackToGame}
                className="px-4 py-2 bg-[#00F0FF] hover:bg-[#00F0FF]/85 text-[#0B0D10] font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                RETURN TO GAME
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-2.5 py-1 text-xs font-bold uppercase border cursor-pointer ${
                filterCat === cat
                  ? 'bg-[#00F0FF] text-[#0B0D10] border-[#00F0FF]'
                  : 'bg-[#0B0D10] text-[#D9D2C3] border-[#3A3F47] hover:bg-[#3A3F47]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="border-2 border-[#3A3F47] bg-[#0B0D10] p-4"
            >
              <div className="flex items-center justify-between border-b border-[#3A3F47] pb-2 mb-3 text-xs">
                <span className="font-bold text-[#FFC83D]">{a.id}</span>
                <span className="text-[#D9D2C3]/75">
                  {a.category} • {a.frameCount}f @ {a.frameWidth}×{a.frameHeight}px ({a.fps} fps) • anchor [{a.anchor?.join(', ')}]
                </span>
              </div>

              <div className="text-[10px] uppercase text-[#D9D2C3]/70 mb-1">
                1x Native ({a.stripWidth}×{a.stripHeight}px on Soot #0B0D10)
              </div>
              <div className="overflow-x-auto bg-[#0B0D10] border border-[#1F4D4A] p-2 mb-3">
                <img
                  src={a.src}
                  alt={`${a.id} 1x`}
                  width={a.stripWidth}
                  height={a.stripHeight}
                  className="pixelated block"
                />
              </div>

              <div className="text-[10px] uppercase text-[#00F0FF] mb-1">
                6x Integer Scale ({a.stripWidth * 6}×{a.stripHeight * 6}px on Soot #0B0D10)
              </div>
              <div className="overflow-x-auto bg-[#0B0D10] border border-[#1F4D4A] p-3 mb-3">
                <img
                  src={a.src}
                  alt={`${a.id} 6x`}
                  style={{
                    width: Math.min(1600, a.stripWidth * 6),
                    height: 'auto',
                  }}
                  className="pixelated block"
                />
              </div>

              <div className="text-[10px] uppercase text-[#FFC83D] mb-1">
                Solid Black Silhouette Row
              </div>
              <div className="overflow-x-auto bg-[#D9D2C3] border border-[#3A3F47] p-2">
                <img
                  src={a.src}
                  alt={`${a.id} silhouette`}
                  style={{
                    width: Math.min(960, a.stripWidth * 2),
                    height: 'auto',
                    filter: 'brightness(0) saturate(100%)',
                  }}
                  className="pixelated block"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
