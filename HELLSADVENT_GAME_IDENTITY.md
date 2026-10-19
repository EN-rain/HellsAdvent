# HellsAdvent / GRAVEL SKY — Game Identity & Intelligent Combat Design

**Status:** Design proposal — not implemented  
**Reviewed:** 2026-10-18  
**Source project:** `C:\Users\LENOVO\Desktop\Projectsss\HellsAdvent` (React / JavaScript / Vite / Electron)  
**Purpose:** Make the game distinctive and entertaining through readable enemy intelligence, boss mind games, and character reactions. Preserve the established world and combat identity.

## 1. Current Theme — Verified Against the Project

**Current genre/theme:** A post-apocalyptic, industrial-wasteland, top-down pixel-art action RPG with anime-influenced character design.

**Important naming note:** The repository folder is `HellsAdvent`, but the current on-screen title, HTML page title, asset design specifications, code comments, and `metadata.json` call the game **GRAVEL SKY**. Treat HellsAdvent as the project name and GRAVEL SKY as the current product title until the owner decides otherwise. Do not silently rebrand the game.

### Established identity

| Dimension | Verified direction |
|---|---|
| World | A ruined industrial society, ash, rust, dead water, scavenging, dangerous routes, abandoned machinery and mutant/industrial enemies |
| Tone | Grounded, harsh, weary, survival-oriented, with human-scale moments of humor and solidarity |
| Visuals | 16-bit-era-inspired, top-down/three-quarter pixel art; hand-pixelled hard edges, limited palettes, almost no blur or glow |
| Palette | Soot black, slag gray, rust orange, bone/off-white, bog teal, cyan signal accents and occasional brass yellow |
| Player fantasy | Become a capable salvage runner by mastering a specialized trade, learning enemy behavior, surviving dangerous routes and bringing something back to Kettle |
| Hub | **Kettle**, a guarded boiler camp and safe zone with Ume, Harlow and the campfire |
| Playable cast | **Sena Ibuki** (Railcut melee), **Rook Matsuda** (Springgun ranged), **Ines Calloway** (magnetic scrap / coil combat) |
| Regions | **Slab Town**, **Route 9**, **Lye Marsh**, **Copper Flats** |
| Bosses | **The Foreman**, **Big Axle**, **Mother Sump**, **The Long Dry** |

Avoid drifting into generic medieval dark fantasy, magic circles, glowing fantasy enemies, or a cheerful high-fantasy village. The game's established setting is **industrial post-collapse**, even if the development project is named HellsAdvent.

### Existing gameplay relevant to this design

- `src/game/Enemy.js`: common enemy pursuit, unique tells, special telegraphs, cooldowns, statuses, elite/boss attack phases, separation movement.
- `src/game/Spawner.js`: ordinary/elite enemy packs, area-based enemy choices, four boss arenas, boss-defeat tracking and respawn timers.
- `src/game/World.js`: a fixed large overworld, Kettle safe zone, four surrounding areas and an atmospheric day/storm cycle.
- `src/game/Engine.js`: live simulation, input, UI states, three save slots, combat coordination, save/load and death/respawn.
- `src/ui/Screens.jsx`: title, save-slot and class selection, settings, pause and death screens.
- `src/data/config.js`: enemy and boss definitions, level bands, shop equipment, industrial palette and NPC dialogue.

**Assessment:** Substantial gameplay and presentation already exist. The opportunity is behavioral depth and meaningful social feedback, not another duplicate inventory, shop or menu. The proposed systems below were **not verified as implemented** in the inspected code.

## 2. Vision

> **Enemies make plans. Players learn their tricks, disrupt their coordination, and win by understanding them. The people at Kettle remember what kind of runner came home.**

The goal is not to make every enemy a perfect tactical solver. The goal is to create **interesting, legible stories during combat**: a scout loses its nerve, a squad breaks formation, a boss tries a trick once, the player predicts it and counterattacks. Success must come from observation and agency rather than enemy stat inflation.

Three pillars are in scope:

1. **Enemy Intelligence Network** — small groups observe and communicate, but have imperfect information.
2. **Boss Personalities and Mind Games** — tactical adaptation, feints, counters, readable mistakes and weaknesses without manipulating terrain.
3. **Kettle Remembers** — contextual dialogue and social recognition based on verifiable player history.

### Explicitly out of scope

- **Unpredictable expeditions:** no new generated expedition objectives, random convoy/rescue events, mission-director system or procedural encounter quests as part of this proposal.
- **Weaponized environments:** no new breakable power lines, acid-pipe hazards, traps, destructible arenas or player-triggered map hazards.
- **Living territories:** no changing regional ownership, repopulated zones, faction frontlines, persistent world-state conquest or post-boss territory simulation.

Do not reintroduce any of these under a different name. Existing world/atmosphere systems may remain unchanged. Bosses can control **space through their own movements and attack patterns**, not through new interactive terrain systems.

## 3. Pillar A — Enemy Intelligence Network

### Player-visible promise

Enemies feel like small groups with intentions, limited awareness and self-preservation. They do not all mindlessly converge on the player's current position.

### Tactical roles

| Role | Behaviors | Readable counterplay |
|---|---|---|
| **Scout** | Spots the player, warns nearby allies, retreats to maintain sight | Break line-of-sight, rush the scout or interrupt a callout |
| **Pressurer** | Maintains threat from an angle and attempts to draw dodges | Change position, counterattack during recovery |
| **Interceptor** | Predicts a short movement path rather than chasing the exact current position | Feint movement, reverse course or pause |
| **Protector** | Guards a high-value ally and sometimes blocks approach routes by positioning | Separate the group or bait the protector away |
| **Cautious survivor** | Retreats briefly when injured or isolated; may rejoin an ally | Exploit its retreat window or disengage |

Do not automatically assign all roles to all existing enemy types. Start with a small, believable pairing drawn from existing enemy definitions. Enemy skills and silhouettes must continue to match their roles.

### Shared knowledge, but not omniscience

Use an observation model: `lastSeenPosition`, `lastSeenTime`, `confidence`, `observedAttackCategory`, `recentDodgeDirection`, and `reporterId`. Nearby allies receive limited reports after a short, visible communication cue. Reports decay. Enemies **must not** know the player through walls, know unobserved cooldowns, or perfectly forecast inputs.

Initial tactical reactions:

- If a player repeatedly attacks from range, some allies spread out **after a scout observes that behavior**.
- If the player repeatedly dodges in one direction, an interceptor aims at the likely end position once, with a clear tell and chance to miss.
- If a squad loses its scout, coordination effectiveness falls; the player should visibly notice the difference.
- If an ally goes down, low-morale enemies occasionally hesitate, withdraw or take a safer angle.

### Important fairness boundaries

- Restrict adaptation to **recent observed behavior**, with decay, randomness and reaction delay.
- A tell, animation, audio cue or visible posture shift must precede an important tactical maneuver.
- Let the player counter or trick enemy intelligence (e.g. intentionally repeat a movement pattern, then change it).
- Cap simultaneous tactical decisions and expensive neighborhood queries; reuse the existing spatial grid in `Spawner.js`.
- A normal encounter should still allow straightforward combat. Tactical AI adds texture; it must not turn every common mob into a chess master.

### Suggested first demo

Two ordinary enemies plus one scout. When the scout sees three similar ranged attacks, it signals its ally to spread out. If the scout is interrupted, the ally continues without new information. The player can see and exploit both outcomes.

## 4. Pillar E — Boss Personalities and Combat Mind Games

Each boss should have a **recognizable decision style**, not just higher speed and damage across phases. Their tactics can evolve during the fight, but every new trick needs a comprehensible tell and a weakness.

| Existing boss | Tactical personality | Player counterplay |
|---|---|---|
| **The Foreman** | Commanding planner: pauses to direct nearby minions, switches between pressure and regrouping, tries to protect a vulnerable ally | Interrupt a command, isolate him, punish long command recovery |
| **Big Axle** | Aggressive duelist: begins with honest rams, later varies charge timing, sometimes pauses as a feint | Read engine/body cues; bait and sidestep, punish missed charge |
| **Mother Sump** | Patient hunter: pressures weak positions with her own attacks, briefly withdraws, times follow-ups when the player commits | Resist panic dodging; maintain distance and strike during withdrawal/recovery |
| **The Long Dry** | Deceptive predator: uses a fixed set of clearly distinct approach cues, occasionally fakes an emergence before a real strike | Learn the cues, avoid committing too early, exploit the long recovery |

**No new terrain-changing boss mechanics** are included. Direction changes, movement predictions, tactical commands, feints, delays, attack choices and recovery windows are sufficient.

### Boss decision model

1. Evaluate current **phase, distance, cooldowns, player-observed behavior and own health**.
2. Choose among a few authored actions (e.g. `press`, `reposition`, `command`, `feint`, `commit`, `recover`) with weights and constraints.
3. Play a distinct tell for high-impact actions.
4. Execute action using the already existing damage, projectile and status systems.
5. Enforce recovery and adapt **sparingly**. Never cancel recovery simply because the AI detects an incoming player hit.

### Sample boss moment

Big Axle shows the usual charge tell. The player repeatedly dodges instantly. After clearly telegraphing a different engine sputter, Big Axle delays one charge to catch an early dodge. The player can instead wait out the sputter, sidestep the genuine charge, and punish the recovery. The adaptation is **learnable and defeatable**, not an invisible input-reading counter.

## 5. Pillar F — Kettle Remembers

The hub already has Ume, Harlow, a campfire, promotions, a shop, and existing NPC dialogue. Expand them into a **small reactive social layer** without changing region ownership, generating missions or rebuilding the hub.

### Player events worth remembering

| Saved event | Possible Kettle response |
|---|---|
| First victory against an existing boss | Ume has a specific remark about the trophy and the player's survival |
| Repeated returns after death | Ume comments dryly about carrying the player home again, without shaming the player |
| Surviving an entire outing without healing | Harlow remarks on discipline or recklessness |
| Repeated reliance on a specific class technique | A class-specific line acknowledges the player's fighting habits |
| Reaching Journeyman or Master promotion | Different greetings and acknowledgments from Harlow |
| Defeating all four bosses | A special camp dialogue and recognition, without making territories change |

Use authored lines with conditions, priorities and cooldowns. Avoid random generative dialogue and avoid claiming the NPC saw actions that were not recorded. Favor witty, human-scale dialogue over lengthy exposition.

### Memory rules

- Store compact facts and milestone IDs, not a permanent log of every player action.
- Prevent repetitive lines by recording `lastSeen` / `timesPlayed` where appropriate.
- The player can skip dialogue; no lengthy mandatory conversations after every death.
- Keep this local to NPC presentation and save data. No extra quest, faction or regional takeover system.

## 6. Implementation Sketch for the **Current JavaScript Project**

> These paths are **proposed**, not files already present. The project inspected here is JavaScript/React, not the separate Godot C# migration.

| Proposed module / existing integration point | Responsibility |
|---|---|
| `src/game/ai/BehaviorProfiles.js` (new) | Data-driven enemy roles, tactical choices, cooldowns and boss personality definitions |
| `src/game/ai/Perception.js` (new) | Sight checks, last-known target, observation age and confidence decay |
| `src/game/ai/SquadBlackboard.js` (new) | Limited squad information sharing, morale and report expiration |
| `src/game/ai/TacticalDecision.js` (new) | Small bounded utility selection or explicit finite-state decision rules |
| `src/game/Enemy.js` (existing) | Execute selected actions using current movement, animation, damage, status and telegraph plumbing |
| `src/game/Spawner.js` (existing) | Assign tactical groups; continue using current spatial hash and population budget |
| `src/game/Player.js` + `src/game/Engine.js` (existing) | Publish observable combat events; maintain small encounter counters and route milestone updates |
| `src/data/character_reactions.js` (new) | Authored conditional Ume/Harlow dialogue entries |
| `src/ui/*` (existing) | Small callout/tell and dialogue display updates only where player comprehension requires them |

### Data rather than hardcoded behavior

Represent behavior tunables in named configuration: observation range, update cadence, report lifetime, memory decay, maximum adaptation frequency, action weights, windup, cooldown, recovery and class-specific cues. Existing `config.js` demonstrates centralized configuration; avoid embedding numerical tuning tables throughout `Enemy.js`.

### Performance strategy

- Use a finite-state or small utility system; **no network LLM calls**, expensive pathfinding every frame, or global scans per enemy.
- Run tactical decision updates at a lower frequency than rendering and physics; stagger them across frames.
- Use `Spawner.js`'s spatial hash for neighbor lookup and a limited number of cached squad blackboards.
- Maintain deterministic seeded tests for common sequences and a debug overlay exposing intended action, last seen position, report age and cooldown.
- Keep existing 480×270 art presentation, hit-stop, telegraphs, audio, character abilities, and source-defined damage/status behavior intact.

## 7. Prioritized Development Plan

### Phase 1 — One believable enemy squad

Create one scout-and-pressure pairing, one report signal and one reversible adaptive response. Test whether a player can *notice*, *predict*, and *counter* it. Preserve ordinary mobs as the baseline.

**Pass criteria:** scout interrupted → no report; player breaks sight → report expires; player deliberately changes dodge/attack behavior → old tactic loses effectiveness; combat remains performant.

### Phase 2 — One boss with a personality

Prototype Big Axle's feint/delayed-charge decision branch using the existing charge and telegraph mechanics. Playtest with Sena, Rook and Ines. Make the cue visually different and preserve a punishment window.

**Pass criteria:** no zero-warning attacks, no omniscient reactions, meaningful player counterplay, no class is hard-countered without response options.

### Phase 3 — Small social payoff at Kettle

Record a boss-victory flag, return/death count and one class-style milestone; use them to choose contextual lines for Ume and Harlow. Reuse the current save slots and save versioning path.

**Pass criteria:** lines fire for correct conditions only, do not spam, survive a save/load cycle, and degrade safely when loading an older save.

### Phase 4 — Expand only if validated

Extend to other bosses and a few selected enemy group types after the first demonstrations are demonstrably fun. Tune decision frequency and cues before adding more tactics.

## 8. Test Questions That Matter

1. Can players understand **why** an enemy changed behavior without reading a guide?
2. Can players exploit the same intelligence system the enemies use?
3. Is there a different, memorable way to beat each boss, not just a longer health bar?
4. Do new reactions make Kettle feel inhabited without forcing long dialogue?
5. Are new behaviors occasional surprises rather than constant interruptions?
6. Does each character class retain a fair, rewarding way to respond?
7. Does AI work remain bounded under the existing 40-active-normal-enemy budget?

## 9. Source-of-Truth References

The following were inspected on 2026-10-18:

- `metadata.json` — current product name and action-RPG description.
- `index.html` — on-page product name and tagline.
- `ASSETS_NEEDED.md` — art direction and prohibited fantasy visual tropes.
- `src/data/config.js` — world areas, palette, enemies, bosses, NPC names and dialogue.
- `src/data/classes.js` — playable cast, class identities and skill concepts.
- `src/ui/Screens.jsx` — existing title/menu, controls, options and death presentation.
- `src/game/Enemy.js` — current chase, special attack, telegraph and phase behavior.
- `src/game/Spawner.js` — enemy packs, area spawns, boss states and respawn logic.
- `src/game/World.js` — Kettle, regions, weather and world construction.
- `src/game/Engine.js` — game lifecycle, fixed update, saving, death, HUD state.

**This document is a design proposal only. It does not report gameplay features as implemented and does not change source code.**
