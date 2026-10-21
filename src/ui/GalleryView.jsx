import React, { useEffect, useRef, useState } from 'react';
import { PALETTE } from '../data/config.js';
import { STATUSES, STATUS_ORDER } from '../data/statuses.js';
import { bakePlayerSprites, spriteRegistry } from '../game/Sprites.js';
import { assets } from '../game/AssetLoader.js';
import { StatusIcon } from './PixelWidgets.jsx';


/**
 * StripCanvas: renders an array of offscreen frame canvases horizontally
 * at an exact integer scale (1x or 6x) on a soot #0B0D10 background.
 */
function StripCanvas({ frames, scale = 1, pad = 2, bg = PALETTE.soot }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frames || frames.length === 0) return;
    const fw = frames[0].width;
    const fh = frames[0].height;
    const totalW = (fw * frames.length + pad * (frames.length + 1)) * scale;
    const totalH = (fh + pad * 2) * scale;

    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, totalW, totalH);

    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const dx = (pad + i * (fw + pad)) * scale;
      const dy = pad * scale;
      ctx.drawImage(f, 0, 0, fw, fh, dx, dy, fw * scale, fh * scale);
    }
  }, [frames, scale, pad, bg]);

  return (
    <canvas
      ref={canvasRef}
      className="pixelated block border border-[#3A3F47]"
    />
  );
}

/**
 * Live 12fps Animated Preview Box
 */
function LiveAnimCanvas({ frames, scale = 6, fps = 12 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frames || frames.length === 0) return;
    const fw = frames[0].width;
    const fh = frames[0].height;
    canvas.width = fw * scale;
    canvas.height = fh * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    let idx = 0;
    const draw = () => {
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const frame = frames[idx % frames.length];
      ctx.drawImage(frame, 0, 0, fw, fh, 0, 0, fw * scale, fh * scale);
      idx++;
    };
    draw();
    const id = window.setInterval(draw, 1000 / fps);
    return () => window.clearInterval(id);
  }, [frames, scale, fps]);

  return (
    <canvas
      ref={canvasRef}
      className="pixelated block border border-[#00F0FF] shrink-0"
    />
  );
}

export function GalleryView({ onBackToGame }) {
  const [ready, setReady] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(assets.loaded);
  const [selectedClass, setSelectedClass] = useState('sena');
  const [selectedPromo, setSelectedPromo] = useState({ stage: 1, branch: null });
  const [classSheets, setClassSheets] = useState(null);
  const [baseSilhouettes, setBaseSilhouettes] = useState({});

  useEffect(() => {
    spriteRegistry.init();
    assets.preloadAll();
    const refreshGallery = () => {
      if (assets.loaded) {
        spriteRegistry.hydrateFromManifest();
        setAssetsLoaded(true);
      }
      const senaBase = bakePlayerSprites({}, 'sena', 1, null);
      const rookBase = bakePlayerSprites({}, 'rook', 1, null);
      const inesBase = bakePlayerSprites({}, 'ines', 1, null);
      const kaelenBase = bakePlayerSprites({}, 'kaelen', 1, null);
      const vesperaBase = bakePlayerSprites({}, 'vespera', 1, null);
      setBaseSilhouettes({
        sena: senaBase.idle.silhouette[0],
        rook: rookBase.idle.silhouette[0],
        ines: inesBase.idle.silhouette[0],
        kaelen: kaelenBase.idle.silhouette[0],
        vespera: vesperaBase.idle.silhouette[0],
      });
      setClassSheets(
        bakePlayerSprites({}, selectedClass, selectedPromo.stage, selectedPromo.branch)
      );
      setReady(true);
    };
    refreshGallery();
    return assets.subscribe(({ loaded }) => {
      if (loaded) refreshGallery();
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    setClassSheets(
      bakePlayerSprites({}, selectedClass, selectedPromo.stage, selectedPromo.branch)
    );
  }, [ready, selectedClass, selectedPromo, assetsLoaded]);

  if (!ready || !classSheets) return null;

  const promoOptionsByClass = {
    sena: [
      { label: 'Hand: Runner', stage: 1, branch: null },
      { label: 'Journeyman: Cutter', stage: 2, branch: 'cutter' },
      { label: 'Master: Flenser', stage: 3, branch: 'cutter' },
      { label: 'Journeyman: Anvil', stage: 2, branch: 'anvil' },
      { label: 'Master: Girder', stage: 3, branch: 'anvil' },
    ],
    rook: [
      { label: 'Hand: Drifter', stage: 1, branch: null },
      { label: 'Journeyman: Deadeye', stage: 2, branch: 'deadeye' },
      { label: 'Master: Longshot', stage: 3, branch: 'deadeye' },
      { label: 'Journeyman: Trapper', stage: 2, branch: 'trapper' },
      { label: 'Master: Sapper', stage: 3, branch: 'trapper' },
    ],
    ines: [
      { label: 'Hand: Coilhand', stage: 1, branch: null },
      { label: 'Journeyman: Binder', stage: 2, branch: 'binder' },
      { label: 'Master: Crane', stage: 3, branch: 'binder' },
      { label: 'Journeyman: Slinger', stage: 2, branch: 'slinger' },
      { label: 'Master: Wrecker', stage: 3, branch: 'slinger' },
    ],
    kaelen: [
      { label: 'Hand: Stoker', stage: 1, branch: null },
      { label: 'Journeyman: Slagbreaker', stage: 2, branch: 'slagbreaker' },
      { label: 'Master: Colossus', stage: 3, branch: 'slagbreaker' },
      { label: 'Journeyman: Pyreknight', stage: 2, branch: 'pyreknight' },
      { label: 'Master: Hellkite', stage: 3, branch: 'pyreknight' },
    ],
    vespera: [
      { label: 'Hand: Conduit', stage: 1, branch: null },
      { label: 'Journeyman:weaver', stage: 2, branch: 'weaver' },
      { label: 'Master: Seraph', stage: 3, branch: 'weaver' },
      { label: 'Journeyman: Stormcaller', stage: 2, branch: 'stormcaller' },
      { label: 'Master: Archon', stage: 3, branch: 'stormcaller' },
    ],
  };


  const animStrips = [
    { key: 'idle', label: 'Idle (4f · Breathing + Sway + Blink)' },
    { key: 'run', label: 'Run (6f · Stride + Garment Lag)' },
    { key: 'attack1', label: 'Attack 1 (4f: Anticipation, Hold, Smear, Recovery)' },
    { key: 'attack2', label: 'Attack 2 (4f: Anticipation, Hold, Smear, Recovery)' },
    { key: 'attack3', label: 'Attack 3 (4f: Anticipation, Hold, Smear, Recovery)' },
    { key: 'dodge', label: 'Dodge Roll (6f · Tucked Roll)' },
    { key: 'hurt', label: 'Hurt (2f · Recoil)' },
    { key: 'death', label: 'Death (5f · Collapse)' },
  ];

  const enemyEntries = [
    {
      id: 'tinRat',
      name: 'Tin Rat (Common · Slab Town / Route 9)',
      notes: 'Soup can fused over back; hinged lid flaps when running; red pinprick eye; 0.25s twitch tell.',
    },
    {
      id: 'dustDog',
      name: 'Dust Dog (Common · Slab Town / Copper Flats)',
      notes: 'Starved hound with visible ribs; rag collar with dangling welding goggles; head carried low.',
    },
    {
      id: 'wireKite',
      name: 'Wire Kite (Common · Route 9 / Copper Flats)',
      notes: 'Crossed-stick kite frame with torn plastic wings, blood-red camera lens eye, and whipping wire tail.',
    },
    {
      id: 'lyeLeech',
      name: 'Lye Leech (Common · Lye Marsh)',
      notes: 'Half-translucent yellow-green bog slug with ring mouth of bone teeth; inchworm stretch/contract.',
    },
    {
      id: 'sumpBat',
      name: 'Sump Bat (Common · Lye Marsh)',
      notes: 'Torn hazmat plastic wings on bent umbrella ribs; swollen pulsing pale belly sac; 3f erratic flap.',
    },
    {
      id: 'rivetTick',
      name: 'Rivet Tick (Common · Slab Town / Copper Flats)',
      notes: 'Six-legged iron mite that pounces at range and latches onto armor.',
    },
    {
      id: 'signalMite',
      name: 'Signal Mite (Common · Route 9 / Copper Flats)',
      notes: 'Antenna-backed copper bug that emits a static shock ring on attack.',
    },
    {
      id: 'siltMimic',
      name: 'Silt Mimic (Common · Lye Marsh / Slab Town)',
      notes: 'Half-buried drum crustacean that snaps with rusted pincers when approached.',
    },
    {
      id: 'cinderCrow',
      name: 'Cinder Crow (Common · Route 9 / Copper Flats)',
      notes: 'Ash-feathered scavenger with a welded rebar beak that dives in diagonal strafes.',
    },
    {
      id: 'cleaverHauler',
      name: 'Cleaver Hauler (Elite · 1px Pulsing Blood Rim)',
      notes: 'Hunched figure dragging wheeled scrap cart by chain; welded butcher cleaver right hand.',
    },
    {
      id: 'lyeStrider',
      name: 'Lye Strider (Elite · 1px Pulsing Blood Rim)',
      notes: 'Stilt-legged bent-pipe walker with back chemical tank, cracked pressure gauge, and funnel head.',
    },
    {
      id: 'flatsHarvester',
      name: 'Flats Harvester (Elite · 1px Pulsing Blood Rim)',
      notes: 'Half-human operator fused into front of rotary harvester blade drum; drum revs through 3 frames on tell.',
    },
    {
      id: 'plateMarshal',
      name: 'Plate Marshal (Elite · Slab Town)',
      notes: 'Heavy welded-plate shield bearer that deflects frontal hits and issues squad flank orders.',
    },
    {
      id: 'switchbackDriver',
      name: 'Switchback Driver (Elite · Route 9)',
      notes: 'Wheeled highway rig runner that executes double switchback charges with exhaust feints.',
    },
    {
      id: 'sumpCantor',
      name: 'Sump Cantor (Elite · Lye Marsh)',
      notes: 'Bell-ringing bog cultist that channels corrosive resonance pulses and coordinates leech packs.',
    },
    {
      id: 'boreSentinel',
      name: 'Bore Sentinel (Elite · Copper Flats)',
      notes: 'Burrowing drill-sentinel that launches slag mortars and exposes its vent core after surfacing.',
    },
    {
      id: 'scrapRatKing',
      name: 'Scrap Rat King (10× Tin Rat Amalgam · Fusion Mid-Boss)',
      notes: '10 Tin Rats knotted by tail and jagged soup-can armor into a rolling thrashing wheel.',
    },
    {
      id: 'bonepackAlpha',
      name: 'Bonepack Alpha (10× Dust Dog Amalgam · Fusion Mid-Boss)',
      notes: 'Multi-headed fused hound pack wrapped in barbed wire and glowing rib-plates.',
    },
    {
      id: 'wireCyclone',
      name: 'Wire Cyclone (10× Wire Kite Amalgam · Fusion Mid-Boss)',
      notes: 'Cyclonic column of 10 Wire Kites crackling with high-voltage brass arcs.',
    },
    {
      id: 'brineMaw',
      name: 'Brine Maw (10× Lye Leech Amalgam · Fusion Mid-Boss)',
      notes: 'Bloated multi-mouthed bog leech mass dripping concentrated lye; prioritized by Mother Sump.',
    },
    {
      id: 'screechChoir',
      name: 'Screech Choir (10× Sump Bat Amalgam · Fusion Mid-Boss)',
      notes: 'Hanging cluster-beast of 10 fused hazmat wings and sonic sacs.',
    },
    {
      id: 'rivetTitan',
      name: 'Rivet Titan (10× Rivet Tick Amalgam · Fusion Mid-Boss)',
      notes: 'Walking iron boulder of 10 fused Rivet Ticks that slams the ground and sheds molten rivets.',
    },
    {
      id: 'relayColossus',
      name: 'Relay Colossus (10× Signal Mite Amalgam · Fusion Mid-Boss)',
      notes: 'Walking radio-tower arachnid formed from 10 fused Signal Mites that overclocks nearby allies.',
    },
    {
      id: 'dredgeHusk',
      name: 'Dredge Husk (10× Silt Mimic Amalgam · Fusion Mid-Boss)',
      notes: 'Fortress hermit-crab built from 10 fused oil drums that baits attacks with fake stagger tremors.',
    },
    {
      id: 'blackwingFurnace',
      name: 'Blackwing Furnace (10× Cinder Crow Amalgam · Fusion Mid-Boss)',
      notes: 'Swirling avian furnace formed from 10 Cinder Crows that carpets burning airstrike lanes.',
    },
    {
      id: 'theForeman',
      name: 'The Foreman (Boss · Slab Town · 30s Reassembly Protocol)',
      notes: 'Tracked excavator rig that calls 15 waves of 10 marchers at 0 HP; revives as The Iron Foreman if 10+ arrive.',
    },
    {
      id: 'bigAxle',
      name: 'Big Axle (Boss · Route 9 · Engine Heat & Core Gate)',
      notes: 'Armored highway diesel cab that builds Heat on missed charges until its Engine Core exposes.',
    },
    {
      id: 'motherSump',
      name: 'Mother Sump (Boss · Lye Marsh · Devour & Starvation Gate)',
      notes: 'Corrosive brood-matron that attempts to devour leeches and Brine Maws; deny 2 feeds to Starve her.',
    },
    {
      id: 'theLongDry',
      name: 'The Long Dry (Boss · Copper Flats · 3-Shell Segment Gate)',
      notes: 'Giant bore worm with real vs decoy emergence tremors and 3 breakable armored shell segments.',
    },
  ];

  const allSilhouettes = [
    { name: 'Sena (Melee)', canvas: baseSilhouettes.sena },
    { name: 'Rook (Ranged)', canvas: baseSilhouettes.rook },
    { name: 'Ines (Mage)', canvas: baseSilhouettes.ines },
    { name: 'Kaelen (Dragoon)', canvas: baseSilhouettes.kaelen },
    { name: 'Vespera (Soulbinder)', canvas: baseSilhouettes.vespera },
    ...enemyEntries.map((e) => ({
      name: e.id,
      canvas: spriteRegistry.enemies[e.id]?.silhouette[0],
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0D10] text-[#D9D2C3] p-6 select-text">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#3A3F47] pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#00F0FF]">
              HELLSADVENT · SPRITE, CLASS, FUSION, &amp; STATUS GALLERY (?gallery)
            </h1>
            <p className="text-xs text-[#9E9789] mt-1">
              {assetsLoaded
                ? `Loaded ${Object.keys(assets.manifest?.assets || {}).length} generated pixel-art assets from /assets/manifest.json & /assets/atlas_0.png.`
                : 'Loading generated pixel-art assets from /assets/manifest.json...'}
            </p>
          </div>
          <button
            onClick={onBackToGame}
            className="px-4 py-2 bg-[#00F0FF] text-[#0B0D10] font-bold text-xs tracking-wider cursor-pointer hover:bg-[#D9D2C3]"
          >
            RETURN TO GAME
          </button>
        </div>

        {/* SECTION 1: SOLID BLACK SILHOUETTE LINEUP */}
        <section className="bg-[#161A20] border-2 border-[#3A3F47] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#FFC83D] tracking-wider uppercase">
              1. SOLID BLACK SILHOUETTE RECOGNITION ROW (ALL 5 CLASSES + ALL 29 ENEMIES &amp; FUSIONS)
            </h2>
            <span className="text-xs text-[#9E9789]">
              Every character and enemy is uniquely identifiable from its silhouette alone.
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-6 p-4 bg-[#D9D2C3] border border-[#3A3F47] overflow-x-auto">
            {allSilhouettes.map((item) => (
              <div key={item.name} className="flex flex-col items-center gap-2">
                {item.canvas && (
                  <StripCanvas
                    frames={[item.canvas]}
                    scale={2}
                    pad={2}
                    bg="#D9D2C3"
                  />
                )}
                <span className="text-[11px] font-bold text-[#0B0D10]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: FIVE PLAYABLE CLASSES & PROMOTION OVERLAYS */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3A3F47] pb-2">
            <h2 className="text-sm font-bold text-[#00F0FF] tracking-wider uppercase">
              2. PLAYABLE CLASSES &amp; PROMOTION OVERLAYS (64x64 · 1x &amp; 4x STRIPS ON SOOT)
            </h2>

            {/* Class & Promotion Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'sena', label: 'SENA IBUKI (MELEE)', color: PALETTE.signal },
                { id: 'rook', label: 'ROOK MATSUDA (RANGED)', color: PALETTE.brass },
                { id: 'ines', label: 'INES CALLOWAY (MAGE)', color: PALETTE.verdigris },
                { id: 'kaelen', label: 'KAELEN VOS (DRAGOON)', color: PALETTE.ember },
                { id: 'vespera', label: 'VESPERA LOCKE (SOULBINDER)', color: PALETTE.volt },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClass(c.id);
                    setSelectedPromo({ stage: 1, branch: null });
                  }}
                  className="px-3 py-1 text-xs font-bold border cursor-pointer"
                  style={{
                    borderColor: selectedClass === c.id ? c.color : '#3A3F47',
                    backgroundColor: selectedClass === c.id ? '#161A20' : '#0B0D10',
                    color: selectedClass === c.id ? c.color : '#D9D2C3',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage / Branch Tabs for Selected Class */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#9E9789] mr-2">PROMOTION VISUAL OVERLAY:</span>
            {(promoOptionsByClass[selectedClass] || promoOptionsByClass.sena).map((opt) => {
              const active =
                selectedPromo.stage === opt.stage && selectedPromo.branch === opt.branch;
              return (
                <button
                  key={opt.label}
                  onClick={() => setSelectedPromo({ stage: opt.stage, branch: opt.branch })}
                  className={`px-3 py-1 text-xs font-bold border cursor-pointer ${
                    active
                      ? 'bg-[#00F0FF] text-[#0B0D10] border-[#00F0FF]'
                      : 'bg-[#161A20] text-[#D9D2C3] border-[#3A3F47]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>


          {/* 4 Facing Directions + Cut-In Strip */}
          <div className="p-4 bg-[#161A20] border border-[#3A3F47] flex flex-wrap items-center gap-8">
            <div>
              <div className="text-xs font-bold text-[#D9D2C3] mb-2">
                4 Facing Directions (Right, Left, Down, Up) — 1x &amp; 3x
              </div>
              <div className="flex items-center gap-4">
                <StripCanvas
                  frames={[
                    classSheets.idle.right[0],
                    classSheets.idle.left[0],
                    classSheets.idle.down[0],
                    classSheets.idle.up[0],
                  ]}
                  scale={1}
                />
                <StripCanvas
                  frames={[
                    classSheets.idle.right[0],
                    classSheets.idle.left[0],
                    classSheets.idle.down[0],
                    classSheets.idle.up[0],
                  ]}
                  scale={3}
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#FFC83D] mb-2">
                Ultimate Eye Cut-In Strip (64x16 @ 1x &amp; 4x)
              </div>
              <div className="flex items-center gap-3">
                <StripCanvas frames={[spriteRegistry.getCutIn(selectedClass)]} scale={1} />
                <StripCanvas frames={[spriteRegistry.getCutIn(selectedClass)]} scale={4} />
              </div>
            </div>
          </div>

          {animStrips.map((st) => {
            const frames = classSheets[st.key]?.right || [];
            return (
              <div
                key={st.key}
                className="p-4 bg-[#161A20] border border-[#3A3F47] space-y-3 overflow-x-auto"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D9D2C3]">{st.label}</span>
                  <span className="text-[11px] text-[#9E9789]">12 FPS ON TWOS · 1x &amp; 6x</span>
                </div>
                <div className="flex items-center gap-6">
                  <LiveAnimCanvas frames={frames} scale={4} fps={12} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#9E9789] w-8">1x:</span>
                      <StripCanvas frames={frames} scale={1} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#00F0FF] w-8">6x:</span>
                      <StripCanvas frames={frames} scale={6} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* SECTION 3: ALL 28 STATUS EFFECT & BUFF 12x12 ICONS */}
        <section className="p-4 bg-[#161A20] border border-[#3A3F47] space-y-3">
          <h2 className="text-sm font-bold text-[#4FD6A0] tracking-wider uppercase">
            3. STATUS EFFECTS &amp; BUFFS REGISTRY (12x12 PIXEL ICONS · ZERO TEXT · MAX 3 COLORS + OUTLINE)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {STATUS_ORDER.map((id) => {
              const st = STATUSES[id];
              if (!st) return null;
              return (
                <div
                  key={id}
                  className="p-2 bg-[#0B0D10] border border-[#3A3F47] flex items-center gap-2.5"
                >
                  <StatusIcon statusId={id} size={24} />
                  <div className="min-w-0">
                    <div
                      className="text-xs font-bold truncate"
                      style={{ color: st.color }}
                    >
                      {st.name}
                    </div>
                    <div className="text-[10px] text-[#9E9789] uppercase">
                      {st.isBuff ? 'Buff' : 'Debuff'} · {st.stackRule}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: 8-ANGLE PRE-RENDERED PROJECTILES, SCRAP ORBIT, & DEBRIS */}
        <section className="p-4 bg-[#161A20] border border-[#3A3F47] space-y-3 overflow-x-auto">
          <h2 className="text-sm font-bold text-[#00F0FF] tracking-wider uppercase">
            4. PRE-RENDERED 8-ANGLE PROJECTILES, SCRAP ORBIT PIECES, &amp; DEBRIS (ZERO CANVAS ROTATE)
          </h2>
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <div className="text-xs font-bold text-[#D9D2C3] mb-1">
                Sena Rail Spike (16x6 · 8 Angles @ 4x)
              </div>
              <StripCanvas frames={spriteRegistry.railSpikeAngles} scale={4} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#FFC83D] mb-1">
                Rook Springgun Bolt (10x3 · 8 Angles @ 4x)
              </div>
              <StripCanvas frames={spriteRegistry.boltAngles} scale={4} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#4FD6A0] mb-1">
                Ines Scrap Orbit Variants (8 Junk Shapes @ 4x)
              </div>
              <StripCanvas frames={spriteRegistry.scrapVariants} scale={4} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#D9D2C3] mb-1">
                Enemy Debris Parts (Can Lid, Goggles, Wire @ 4x)
              </div>
              <StripCanvas frames={spriteRegistry.debrisParts.canLid} scale={4} />
            </div>
          </div>
        </section>

        {/* SECTION 5: ALL ENEMIES (COMMONS, ELITES, BOSSES) @ 1x & 6x */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-[#00F0FF] tracking-wider uppercase border-b border-[#3A3F47] pb-2">
            5. ENEMIES &amp; BOSSES (1x, 6x, ANIMATED TELL POSE, &amp; STUNNED SIGNAL OUTLINE)
          </h2>

          {enemyEntries.map((e) => {
            const entry = spriteRegistry.enemies[e.id];
            if (!entry) return null;
            const stripWithTellAndStun = [
              ...entry.right,
              entry.tellRight[0],
              entry.stunRight[0],
              entry.whiteRight[0],
            ];
            return (
              <div
                key={e.id}
                className="p-4 bg-[#161A20] border border-[#3A3F47] space-y-3 overflow-x-auto"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-[#FFC83D]">{e.name}</span>
                    <p className="text-xs text-[#9E9789] mt-0.5">{e.notes}</p>
                  </div>
                  <span className="text-[11px] text-[#9E9789]">
                    Strip: Walk Frames + Attack Tell Frame + Stunned Signal Outline + 2f White Hit Flash
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <LiveAnimCanvas frames={entry.right} scale={3} fps={8} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#9E9789] w-8">1x:</span>
                      <StripCanvas frames={stripWithTellAndStun} scale={1} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#00F0FF] w-8">6x:</span>
                      <StripCanvas frames={stripWithTellAndStun} scale={6} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default GalleryView;
