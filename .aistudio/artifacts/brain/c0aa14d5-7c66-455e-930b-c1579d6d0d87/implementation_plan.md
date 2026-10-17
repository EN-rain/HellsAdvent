# GRAVEL SKY — Action JRPG Implementation Plan

A complete, 60fps pixel-art anime action JRPG set in a ruined industrial wasteland years after the sky collapsed. Players control **Sena Ibuki**, a salvage runner wielding the **Railcut**, battling across five distinct open-world zones, upgrading skills, trading scrap gear at the Kettle camp, and hunting four multi-phase bosses—all rendered entirely through procedural pixel art and synthesized Web Audio.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Because the specification states *"Do not ask me questions. Make any unspecified detail a decision yourself"*, all architectural, balance, and visual details have been resolved directly in this plan. Review the decisions below and click **Proceed** to build the full game.

- **Zero External Assets (Procedural Pixel & Audio Pipeline)**: All 32×32 character/enemy sprites, 64×64 dynamic anime portraits, 16×16 world tiles, item icons, and multi-phase boss rigs are rendered from palette-indexed matrices cached onto offscreen canvases (`image-rendering: pixelated`). All combat, UI, and ambient sounds are synthesized in real time via the Web Audio API.
- **Strict 60fps Simulation Decoupling**: The entire game simulation runs inside plain JavaScript/TypeScript classes (`src/game/*`) on a single `<canvas>` using a fixed-timestep accumulator and `requestAnimationFrame`. React (`src/ui/*`) never re-renders per frame; the HUD polls game state on a 10 Hz (`100ms`) tick, while modal panels (Shop, Inventory, Skills, Pause, Death) subscribe on state change events.
- **Dual Runtime (Browser + Electron Desktop)**: Includes Electron main/preload scripts (`electron/main.cjs`) configured for a 1280×720 window (min 960×540, F11 fullscreen, menu-bar hidden) with automatic 30-second and on-quit JSON saves to `app.getPath("userData")`, seamlessly falling back to `localStorage` inside a `try/catch` when running in the browser preview.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers an immediate, high-impact top-down action RPG with a 3-hit melee combo, directional dodge roll with i-frames, 3 upgradeable active skills (**Lunge**, **Ground Break**, **Rail Spike**), a time-stopping ultimate (**Seven Cuts**), an open 6000×6000 px world streamed in 16px tile chunks, spatial-grid enemy swarming, and a full equipment/consumable economy.
- **Setting & Tone**: Grounded, worn-down industrial post-apocalypse. Short, blunt, practical names and dialogue from Ume at the pawn counter. Strictly adheres to the banned-word rules (no generic fantasy/sci-fi buzzwords or hype adjectives).
- **Key Value**: Playable within seconds of launch with responsive game feel—50ms hit-stop on heavy hits, decaying camera shake, knockback physics, white hit flashes, pooled damage numbers (brass crits), and a 15+ minute progression loop across four boss arenas.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Title Screen**: Full-viewport live parallax wasteland backdrop with drifting ash, bespoke inline `<svg>` **GRAVEL SKY** industrial lockup, `"PRESS ENTER"` start prompt, and a quick Controls modal toggle.
  2. **Kettle Camp (Safe Zone)**: Players spawn by the old boiler fire near Ume's pawn counter (`[E] Talk to Ume`). Hand-painted directional signs point North (Slab Town), West (Route 9), East (Lye Marsh), and South (Copper Flats).
  3. **Exploration & Combat**: Smooth-follow camera with dark vignette, day and dust-storm lighting cycle, biome-specific ambient particles (falling concrete dust, highway sparks, pale marsh spores, red sandstorms), and an objective tracker pointing to the nearest unbeaten boss.
  4. **Progression & Shop**: Killing enemies awards XP and gold (`±20%` variance). Pressing `K` opens the Skill Panel to invest skill points; pressing `I` opens Inventory & Equipment; pressing `E` near Ume opens the 4-tab Shop (`Head`, `Body`, `Legs`, `Supplies`) with one-click Buy & Equip, 40% sell-back, and live green/red stat comparison tooltips. Equipped armor dynamically recolors Sena's sprite.
  5. **Death & Recovery**: Losing all HP triggers the 5-frame death animation and Death Screen, deducting 10% gold before waking Sena back by the Kettle boiler at full HP.

- **Visual Identity & Palette (`src/data/config.js`)**:
  - **Soot (`#0B0D10`)**: Deep dominant background, vignette, and UI surface base.
  - **Slag (`#3A3F47`)**: Structural concrete, borders, and muted steel surfaces.
  - **Rust (`#8B3A1E`)**: Sena's hair, oxidized machinery, Copper Flats terrain, and worn accents.
  - **Bog (`#1F4D4A`)**: Lye Marsh chemical pools, Salvaged-grade item trim.
  - **Bone (`#D9D2C3`)**: Primary readable typography, Sena's wind-animated scarf, and clean data readouts.
  - **Signal (`#00F0FF`)**: The sole high-contrast electric accent—reserved strictly for Sena's Railcut blade edge, active skill effects, ultimate slashes, and primary UI focus states.
  - **Blood (`#FF3B3B`)**: HP bar fill, elite enemy outlines, and 0.8s telegraphed hazard zones.
  - **Brass (`#FFC83D`)**: Critical hit numbers, Relic-grade gear, gold counter, and boss phase warnings.

- **HUD & Low-Occlusion Discipline**:
  - Keeps over 85% of the viewport clear with `pointer-events: none` on HUD wrappers and zero `backdrop-filter` blur over the canvas.
  - **Top-Left Cluster**: 64×64 pixel-art anime portrait of Sena (dynamically switches between Normal, Hurt/Grimace, and Ultimate/Focused expressions), HP bar (`blood`), Stamina bar (`signal`), XP bar (`bone`), Level badge, and Gold (`brass`) in `tabular-nums` monospace.
  - **Top-Center**: Single-line objective tracker naming the nearest unbeaten boss and distance, plus the Boss Health Bar & Name Card when inside an active boss arena.
  - **Top-Right**: Chunk-rendered Minimap showing biome boundaries, Kettle camp, boss arenas, and Sena's position.
  - **Bottom-Center**: 3 Skill slots (`1` Lunge, `2` Ground Break, `3` Rail Spike) with radial/vertical cooldown sweeps, stamina checks, quick-use consumable slots (`Q` Gauze Roll, `F` Sugar Tin), and the circular **Seven Cuts** (`R`) Ultimate charge ring.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pre-Baked Offscreen Sprite Sheets vs. Per-Frame Pixel Loops**
  - *Chosen Approach*: Define all sprite frames, portraits, tiles, and icons as compact palette-indexed arrays, then bake them once at startup (and when Sena equips new armor colors) onto offscreen HTML5 canvases.
  - *Why*: Drawing pre-baked offscreen canvases via `ctx.drawImage()` is orders of magnitude faster than iterating pixel arrays every frame, guaranteeing locked 60fps even with 40 active enemies, boss telegraphs, and hundreds of particles.
- **Decision 2: Object Pooling & Spatial Hash Grid**
  - *Chosen Approach*: Pre-allocate fixed pools for `Particles` (500), `Projectiles` (64), and `DamageNumbers` (64), and partition the 6000×6000 world into 250×250 px spatial grid cells.
  - *Why*: Eliminates garbage-collection pauses during intense combat and keeps melee arc checks, piercing Rail Spikes, and enemy separation $O(1)$ per cell.
- **Decision 3: Unified JavaScript/TypeScript Module Interop**
  - *Chosen Approach*: Provide `src/data/config.js` and modular classes in `src/game/*` and `src/ui/*` that work seamlessly with Vite's bundler and Electron's desktop wrapper.
  - *Why*: Satisfies the exact folder structure (`/src/game`, `/src/ui`, `/src/data/config.js`) while maintaining clean imports and zero console warnings.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        App Shell (React + Vite)                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                 GameCanvas Wrapper (<canvas>)                     │  │
│  │   requestAnimationFrame -> Fixed Timestep (dt clamped <= 0.05s)   │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│        10 Hz HUD Poll (100ms)      ▼       Direct Event Triggers        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   Game Engine Singleton (JS)                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │  │
│  │  │  World   │  │  Camera  │  │  Player   │  │     Spawner      │  │  │
│  │  │ (6000px  │  │ (Smooth  │  │  (Sena +  │  │ (Spatial Grid +  │  │  │
│  │  │  Chunks) │  │  +Shake) │  │  Scarf)   │  │  4 Boss Arenas)  │  │  │
│  │  └──────────┘  └──────────┘  └───────────┘  └────────┬─────────┘  │  │
│  │  ┌────────────────────────┐  ┌───────────┐           │            │  │
│  │  │ Object Pools           │  │ Web Audio │           ▼            │  │
│  │  │ • Projectiles          │  │ Procedural│  ┌──────────────────┐  │  │
│  │  │ • Particles & Numbers  │  │ Synth SFX │  │ Enemies & Bosses │  │  │
│  │  └────────────────────────┘  └───────────┘  └──────────────────┘  │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              React UI Overlays (src/ui/*)                         │  │
│  │  • TitleScreen & ControlsModal    • HUD (Portrait, Bars, Minimap) │  │
│  │  • ShopModal (Ume's Pawn Counter) • SkillPanel (K) & Inventory (I)│  │
│  │  • PauseMenu (ESC + Scanlines)    • DeathScreen (Respawn Kettle)  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### World Geography & Boss Arenas (`6000 x 6000 px`)

- **Kettle (Center Safe Zone)**: `(2600..3400, 2600..3400)` — Old boiler centerpiece, glowing campfire, Ume's counter, zero enemy spawns, health/stamina trickle recovery near fire.
- **Slab Town (North, Lvl 1–8)**: `y < 2400` — Collapsed concrete blocks, dead mall tiles, falling dust particles.
  - *Commons*: Tin Rat, Dust Dog. *Elite*: Cleaver Hauler (line charge).
  - *Boss*: **The Foreman** at `(3000, 900)` — Wrecked construction rig with wrecking-ball slam, rebar volley, and overdrive bulldoze across 3 phases (`100%`, `60%`, `30%`).
- **Route 9 (West, Lvl 5–14)**: `x < 2400` — Cracked asphalt highway, burnt car husks, drifting sparks.
  - *Commons*: Wire Kite (flying drone), Tin Rat. *Elite*: Cleaver Hauler / Flats Harvester.
  - *Boss*: **Big Axle** at `(900, 3000)` — Armored road train engine executing turbo rams, exhaust flame rings, and shrapnel barrages.
- **Lye Marsh (East, Lvl 10–20)**: `x > 3600` — Dark chemical bog pools, boardwalks, pale spores, fog overlay.
  - *Commons*: Lye Leech, Sump Bat. *Elite*: Lye Strider (0.8s telegraphed acid mortar).
  - *Boss*: **Mother Sump** at `(5100, 3000)` — Bloated chemical vat horror spawning acid geysers, toxic waves, and leech broods.
- **Copper Flats (South, Lvl 15–25)**: `y > 3600` — Oxidized red sand, wrecked excavators, high-wind dust storms.
  - *Commons*: Dust Dog, Wire Kite. *Elite*: Flats Harvester (0.8s telegraphed whirlwind spin cut).
  - *Boss*: **The Long Dry** at `(3000, 5100)` — Giant mechanical-plated sand worm burrowing under the arena, erupting with boulder rings and sand-laser sweeps.

### Interactive Component & State Mapping

- **Combat & Skills (`Player.js`)**:
  - **3-Hit Basic Combo (LMB)**: Alternating slash arcs toward cursor (`100%`, `115%`, `140%` ATK) with step-forward momentum and cyan blade trails.
  - **Dodge Roll (`SPACE`)**: `0.25s` invulnerability, `1.2s` base cooldown (`0.9s` with Hydraulic Shins), afterimage trail.
  - **Skill 1 — Lunge (`1`)**: Dash `160px` toward cursor, cutting all enemies along the line (`160% ATK`, `+20%/lvl`, `5s` CD `-0.4s/lvl`, `10` Stamina).
  - **Skill 2 — Ground Break (`2`)**: Slam the Railcut for a `110px` radius shockwave + `1s` stun (`140% ATK`, `+15%/lvl`, `+12px/lvl`, `9s` CD, `20` Stamina).
  - **Skill 3 — Rail Spike (`3`)**: Hurl a high-velocity piece of sharpened rail (`420px` range, `180% ATK`, `+20%/lvl`, `+1 pierce/lvl`, `6s` CD, `15` Stamina).
  - **Ultimate — Seven Cuts (`R`)**: Requires 100% charge (gained from dealing/taking damage). Freezes world time for `1.1s`, renders 7 rapid lightning-cyan slashes across all enemies within `300px` for `500% ATK` total shared across the cuts, then shatters the screen on the final frame.
- **Persistence (`SaveSystem`)**:
  - Automatically serializes level, XP, gold, skill levels, equipped items, inventory, boss defeat flags, and settings every 30 seconds and on window unload/quit via Electron IPC (`window.electronAPI.saveGame`) with automatic fallback to `localStorage.getItem('gravel_sky_save_v1')`.
