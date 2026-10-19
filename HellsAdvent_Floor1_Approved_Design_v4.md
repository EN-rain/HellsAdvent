# HellsAdvent — Combined Floor 1 Expansion & Intelligent Boss Design Plan

> **DOCUMENT STATUS: DESIGN ROADMAP WITH RECORDED OWNER APPROVALS — NOT IMPLEMENTED.**  
> **Prepared:** October 18, 2026 · **Revised:** October 18, 2026 (v4 — suggested Floor 1 boss encounter order added)  
> **Project inspected previously:** `C:\Users\LENOVO\Desktop\Projectsss\HellsAdvent` (React/JavaScript Canvas + Vite/Electron)  
> **Delivery:** This standalone Markdown document is delivered in chat. **No local project files or gameplay code were changed.**

## 0. Owner decisions log

Owner decisions, including the latest ritual decisions, override older or contradictory drafts. **D45 is the newest explicit owner ruling and overrides D35 wherever capacity treatment differs for Foreman ritual-origin mobs.** D36–D44 are previously adopted recommendations and stay in force; D46–D48 are engineering clarifications of D45, not new gameplay difficulty caps.

| # | Decision | Owner ruling | Status |
|---|---|---|---|
| D1 | Foreman revival threshold | **Several mobs, 10–30 range.** Fewer than 10 arrivals = **no revival**. 10 arrivals = revive at **10% HP**; 30+ arrivals = revive at **100% HP** | **Approved** |
| D2 | Foreman rage buff | After revival the Foreman receives a **rage buff proportional to HP lost**: lower revival HP = higher damage and higher defense | **Approved** (formula below is a proposal) |
| D3 | Big Axle and Mother Sump mechanics | **Required kill gates** (not optional strategy) | **Approved** |
| D4 | Build order | **Full build in plan order** (Phase 0 → Phase 7), not vertical-slice-first | **Approved** |
| D6 | Fusion frequency | **Not rare.** Fusion is emergent: when mobs chasing the player crowd together and ten same-species mobs end up connected, they fuse. No special trigger or scripting | **Approved** |
| D7 | Ritual summons and fusion | Summoned mobs generally can fuse, **except during the marked Foreman ritual no-fusion AOE**; Mother Sump brood can still fuse | **Approved; scoped by D34** |
| D8 | Death and boss progress | **Reset the current boss fight only.** Confirmed boss clears and Floor 1 progress are kept | **Approved** |
| D9 | Foreman fusion mid-boss arrivals | Historical rule that fused marchers count as 0 arrivals. **Superseded in practice by D34:** fusion cannot start or continue inside the Foreman ritual no-fusion area | **Superseded by D34** |
| D10 | Mother Sump and fused brood | **Mother Sump can devour a fused Brine Maw for a big heal.** Heal is still bounded by her existing feed cap and counts as one feed | **Approved** |
| D11 | Fusion form rollout | **Delegated to Claude ("do what's better").** Adopted: all nine fusion forms are in scope, built in two waves within Phase 3 (see below) | **Approved by delegation** |
| D12 | Product name | **HellsAdvent.** The code, metadata and title screen currently say GRAVEL SKY, so a rename pass is needed | **Approved** |
| D13 | Kettle recognition rewards | **Achievements and cosmetics.** No mechanical combat buffs | **Approved** |
| D14 | Breakable obstacles | **None for now.** All obstacles are non-destructible; barriers expire by timer or boss phase, not by damage. Revisit later | **Approved** |
| D15 | Boss respawn after Floor 1 clear | **Bosses stay dead permanently.** An **optional rematch mode** lets players re-fight them without undoing the clear. The existing respawn timer is disabled for confirmed clears | **Approved** |
| D16 | Fusion channel | **Interruptible, about 2 seconds**, by kills, stun or displacement | **Approved** (2 s is the starting value, tunable) |
| D17 | Returning to Kettle | **Free return to Kettle** from later floors | **Approved** |
| D18 | Foreman scaling numbers | **Confirmed:** linear revival HP (10% at 10 arrivals → 100% at 30+) and rage multiplier ×1.45 at 10% revival, scaling down to ×1.00 at 100% | **Approved** |
| D19 | Save/load during a boss ritual | **Loading a save made mid-boss restarts the whole boss fight.** This matches D8 (death also resets the fight). No ritual state is persisted | **Approved** |
| D20 | Art production | **Sprites for new mobs, fusion forms and boss states will be generated externally with AI image tools** (owner named Argon, Gemini or GPT) | **Approved** (asset requirements below) |
| D21 | Interrupt rule (all classes) | **Universal stagger:** enough damage dealt within a short window interrupts Mother Sump's Devour and a fusion channel, regardless of class or ability. Kills, stuns and displacement also still interrupt (D16) | **Approved** (threshold values below are proposals) |
| D22 | Long Dry shell segments | **Any attack from any class damages shell segments.** No class-specific breaking method | **Approved** |
| D23 | Stopping Foreman marchers | **Marchers are weak, and any class clears them.** No dedicated crowd-control skill or class requirement | **Approved** |
| D24 | Morale | **Included.** Wounded or isolated mobs may panic, hold back or flee after allies fall | **Approved** (rules below are proposals) |
| D25 | Fusion backlash | **Included.** A late-interrupted fusion briefly disorients the surviving members | **Approved** (timing below is a proposal) |
| D26 | Enemy grudges | **Included for selected special enemies only** (not ordinary mobs) | **Approved** (scope below is a proposal) |
| D27 | Former fixed 120-slot ritual pool and 120-alive safety ceiling | **Superseded by D45:** no fixed-size ritual cap. Allocate ritual actors separately and dynamically | **Superseded by D45** |
| D28 | Foreman ritual duration | **30 seconds**, exactly fifteen scheduled waves of ten ritual mobs at t=0,2,...,28: **150 physical spawns** in an uninterrupted ritual; independent of normal pool occupancy | **Approved; capacity clarified by D45** |
| D29 | Morale and ritual marchers | **Ritual marchers are immune to morale and never flee** | **Approved** |
| D30 | Ritual ring distance | **Marchers take about 5 seconds to reach the Foreman's body** from their spawn point | **Approved** |
| D31 | Former fused-marcher behavior | **Superseded by D34:** no fusion during marked Foreman ritual. Pre-existing fusion mid-bosses are not ritual marchers and remain governed by ordinary encounter rules | **Superseded by latest owner ruling** |
| D5 | Territory mob supply and ritual waves | Normal mobs keep existing 64/40 capacity rules and region-specific weights. **Foreman ritual waves always spawn ten new physical mobs every 2 s for 30 s**, completely exempt from those normal caps (D45). | **Approved; clarified by D45** |
| D32 | Foreman ritual difficulty | **Intentionally extremely difficult. Do not reduce challenge simply because most players will fail to prevent resurrection.** A first-time revival is an acceptable outcome | **LATEST owner-approved** |
| D33 | Mob fate at ritual end | **All surviving ritual marchers revert to normal mobs when the 30 s ritual ends, including late-spawned waves. They do not disappear automatically** | **LATEST owner-approved** |
| D34 | Foreman ritual fusion suppression | Draw a visible **no-fusion AOE on the floor** centered on the Foreman. Its radius **must cover the entire 10-mob spawn ring and paths inward**. No fusion can start or finish in that area during the ritual | **LATEST owner-approved** |
| D35 | Ordinary enemy capacity | **Preserve the original game model for ordinary spawns:** one shared pool of 64 and normal-spawn target of 40; no independent per-territory ordinary cap | **Approved; ritual exception D45** |
| D36 | Foreman end-of-timer semantics | Ritual ends at 30 s; arrivals counted up to that instant determine outcome; end-of-ritual marchers immediately resume normal behavior; revive/kill resolves **then**, not at the first ten arrivals | **Adopted recommended default** |
| D37 | Fusion precedence | A mob reaching the Foreman body counts as arrival; fusion is prohibited by marked AOE during the ritual, so contact race does not arise there | **Adopted recommended default** |
| D38 | Ritual mob rewards | No rewards for automatic state transitions or cleanup; ordinary rewards only for enemies the player actually defeats | **Adopted recommended default** |
| D39 | Mid-boss capacity | If mid-boss slots are full, eligible mobs remain ordinary, continue fighting, and retry when capacity is available. Never consume or delete them without spawning a replacement | **Adopted recommended default** |
| D40 | Big Axle missed core window | At 0 HP without core break: disabled, then restarts at low capped HP; player can reliably force another overheat | **Adopted recommended default** |
| D41 | Mother Sump starvation | Two interrupted feeding attempts unlock STARVED; no eligible prey auto-progresses starvation after a bounded timeout; total healing remains capped | **Adopted recommended default** |
| D42 | Long Dry damage window | All classes can damage exposed shell segments during clear vulnerability windows; destroyed segments never regenerate that fight | **Adopted recommended default** |
| D43 | Boss reset and consumables | Restoring a boss encounter reloads the **encounter-entry snapshot** for boss-scoped HP/consumables/gold and transient entities; already-confirmed floor/boss progress persists | **Adopted recommended default** |
| D44 | Clear and rematch rewards | Floor 1 requires **all four finally defeated bosses**; first-clear rewards/achievements are one-time; optional rematches cannot alter territory clears and pay reduced non-exploitative rewards | **Adopted recommended default** |
| D45 | **Foreman ritual actors ignore caps** | **Every ritual wave spawns all ten mobs at the scheduled 2-second mark regardless of the original 64-slot pool and 40-active ordinary-spawn threshold. Do not defer, skip, truncate or substitute waves.** Ritual-origin actors remain exempt even when survivors return to ordinary behavior at 30 s | **NEWEST explicit owner ruling; supersedes conflicting D35 text** |
| D46 | Runtime realization of D45 | Keep existing 64/40 for ordinary mobs; create a separately managed **dynamic ritual-origin actor collection**, no 120-slot ceiling and no fixed-size capacity constraint; integrate into targeting, hit detection, rendering, navigation, status effects, rewards and cleanup | **Engineering recommendation adopted; not a gameplay cap** |
| D47 | Reliable wave delivery | Exactly fifteen waves of ten physical entities at t=0,2,...,28 during a completed ritual, with deterministic IDs and atomic wave creation. No capacity-related deferral. Ordinary spawns continue under their original 64/40 rules, independently of guaranteed ritual waves | **Engineering recommendation adopted** |
| D48 | Survivors and persistence | At 30 s, living ritual mobs retain their dynamic allocation and provenance exemption, switch to regular AI and rewards, and remain until they die or meet normal distance-despawn rules; death/reload restarts the current boss encounter and discards *transient encounter-owned actors* per D43 | **Engineering recommendation adopted** |
| D49 | **Suggested Floor 1 boss encounter order** | **Big Axle → The Long Dry → Mother Sump → The Foreman.** Present The Foreman as the **intended final challenge** but keep **every boss territory and fight accessible earlier**; no mandatory order or boss-gated region access. All four *confirmed* final victories are still required to clear Floor 1 (D44). | **Added to plan at owner request; recommended route, not a forced sequence** |


### Foreman ritual — consolidated authoritative specification (D1–D5, D18, D28–D48)

- **Intentionally extreme difficulty (D32).** Preventing resurrection is a mastery result, not an outcome guaranteed for first-time players. Never secretly scale down wave size or frequency, or help the player by dropping spawns.
- **Trigger and duration:** Foreman reaches 0 HP for the first time → enters Reassembly Protocol for exactly **30 seconds**; no rewards/clear before resolution.
- **Guaranteed spawning (D5/D28/D45/D47):** At **t = 0, 2, 4, ..., 28 seconds**, spawn **exactly 10 separate, physical, weak ritual enemies** evenly spaced around the whole 360° ring: **15 waves / 150 ritual-born actors** during a complete ritual. Existing normal enemy occupancy, pool pressure and ordinary spawn caps **must not delay or reduce** these waves. Each marching mob's intended travel time is approximately **5 seconds** to Foreman's body, with adjustable radius derived from movement speed/path length.
- **Visible suppression field (D34):** Throughout the ritual, draw a ground AOE centered on Foreman. Its radius is at least `spawnRingRadius + largestMobCollisionRadius + routeMargin` and encompasses **every actual spawn point and the full march paths**. While active, **no species may begin, continue or complete fusion inside it**; cancel existing fusion channels that enter, without deleting their units. When the timer ends, the field disappears and fusion works normally again. Already-fused bosses are not undone.
- **Existing territory mobs vs new summons:** If an **already-existing Slab Town mob** is called to march, it stays in the original normal 64-slot pool with its original capacity treatment; it can contribute one arrival if it reaches the body. The **150 newly spawned ritual-origin mobs** are additional, and are the only actors exempted by D45. Both types obey the same no-fusion field, collision and arrival rules. Existing mobs that survive the deadline simply resume their original normal AI; only ritual-**origin** survivors retain the cap exemption.
- **Arrivals:** Each live ritual marcher contributes **one** only when it physically reaches Foreman's body before t=30. The arrival consumes that marcher (without kill reward) and increments the counter exactly once. Killed marchers never count; stunned/stopped marchers count only if they eventually reach the body on time.
- **End-of-ritual transition (D33/D36/D48):** At exactly t=30, stop the wave scheduler and tally arrivals. **All surviving marchers, including late waves, become normal-behaving mobs and remain in the world**; no forced cleanup. Each keeps its dynamically allocated runtime identity and **ritual-origin exemption from ordinary pool/spawn caps for the rest of its lifetime**, until killed or naturally distance-despawned. Following the transition, the no-fusion field is removed and these mobs are eligible for regular same-species fusion. They do not retroactively arrive at the body.
- **Outcome:** 0–9 arrivals → permanent boss defeat, first-clear reward once. 10+ arrivals → one Iron Foreman revival; tally all arrivals up to **t=30** rather than reviving immediately on the tenth. The revived Foreman cannot start another ritual.
- **Approved revival HP:** For arrivals at least 10, `reviveHpPct = clamp(0.10 + 0.045*(arrivals - 10), 0.10, 1.00)`: 10→10%, 20→55%, 30+→100%.
- **Approved rage scaling:** `rageMultiplier = 1 + 0.5*(1 - reviveHpPct)` applies to damage and a deliberately bounded defensive interpretation: 10→×1.45, 20→×1.225, 30+→×1.00. Apply the revival and rage only once; separately test defensive effective HP so it is not accidentally unfair beyond the chosen challenge.
- **Original game limits, unchanged for nonritual mobs (D35):** Keep its **64-slot ordinary/shared enemy pool** and **40-active ordinary spawn threshold**. Do not install a separate 120-slot ritual pool or a 120-alive safety ceiling. Normal spawning and normal fusion mid-bosses still respect their respective original/budgeted limits. The ritual exception does **not** increase the original pool's size.
- **Dynamic ritual-actor ownership (D45/D46):** Ritual entities live in an **independent, dynamically allocated collection**, not in the existing 64 objects. Its capacity grows to hold the scripted wave output and any surviving actors; **there is no separate fixed ritual cap**. They still need the same collision, combat, status, hit, render, spatial query, animation, XP and death/loot behavior as ordinary enemies. Maintain global unique IDs and prevent double update/draw/death handling.
- **No wave deferral:** Never queue or skip a guaranteed ritual wave because the normal pool is full. Implement atomic wave spawning at scheduled timestamps. If resource allocation fails at runtime, treat that as a logged/failing technical error, not a gameplay mechanic or a reason to quietly reduce encounter difficulty.
- **Performance rather than caps:** The 30-second schedule inherently bounds *new* ritual summons at **150 per completed ritual** (plus any normal-origin territory mobs that join the march); live counts decrease on arrivals and kills. Use inexpensive straight-line marching logic, spatial partitioning, re-used sprite resources, low-frequency expensive tactical checks, offscreen rendering culls and object reuse where safe. Profile 64 normal entities **plus** the entire scripted ritual workload; optimize until the intended waves function. No invisible deletion, hidden 120-unit limit or cap-driven wave delay.
- **Restart / rematch:** Boss death and mid-encounter reload use the encounter-entry snapshot per D43, removing transient actors owned by that aborted attempt. Confirmed clears stay confirmed. Rematches use the same mechanics but cannot repay first-clear rewards.
- **HUD:** countdown, single authoritative arrivals number, predicted revival HP/rage, wave entry warnings and the no-fusion marker; ensure the three character classes can each kill weak marchers, even though stopping enough of them is intentionally hard.

### Adopted defaults for other mechanics (D36–D44)

- Fusion mid-boss cap full → eligible normal mobs continue fighting and retry later. No silent deletion or consumption.
- No rewards for automatic scene/lifecycle transitions; player-caused kills use exactly-once rewards.
- Big Axle at 0 HP without core destruction → short disabled window, then reliable restart at **capped low HP**, with heat mechanic still forceable by player action.
- Mother Sump → **two successfully denied feeds** trigger STARVED; if no prey is available, a bounded hunger timeout forces the vulnerability. Healing has an encounter-total cap.
- Long Dry → **any class** may damage exposed shell during readable windows; destroyed segments do not repair within the fight.
- Player death/reload → restore current boss attempt using encounter-entry snapshot for HP, consumables, gold and encounter-owned transient entities; confirmed world/floor/boss clears persist.
- Floor 1 completion → **all four confirmed primary boss kills**; rematch rewards are limited, no duplicate first-clear achievements or irreversible territory changes.

---

## 1. Game identity, vision, and boundaries

The current project has a **post-apocalyptic industrial-wasteland, anime-inspired pixel-art action RPG** setting. Its code, metadata, and title screen use **GRAVEL SKY** as the in-game product name although the project folder is **HellsAdvent**. **Owner decision D12: the final name is HellsAdvent**, so the existing GRAVEL SKY strings must be renamed as a deliberate, separate task. Its existing visual identity uses soot black, worn steel, rust, ash, bog teal, bone/off-white, signal cyan, and restrained brass accents. Weapons and creatures should feel like products of a ruined industrial society, not generic medieval fantasy.

**Core vision:** A tower-clear action game where mobs observe and cooperate, same-species groups physically fuse into mid-bosses, major bosses demand tactics other than damage output, and each cleared territory has consequences recognized by people in Kettle.

The desired player experience rewards **observation, interruption, manipulation of enemy behavior, prioritization, and learning**. Cunning enemies must not be omniscient, and every major mechanic needs fair telegraphs and counterplay.

### Confirmed current starting point

| Existing element | Inspected state | Planned change |
|---|---|---|
| Common enemy species | 5: Tin Rat, Dust Dog, Wire Kite, Lye Leech, Sump Bat | Add 4, for **9** total |
| Elite species | 3: Cleaver Hauler, Lye Strider, Flats Harvester | Add 4, for **7** total |
| Main bosses | The Foreman, Big Axle, Mother Sump, The Long Dry | Retain, redesign their encounters |
| Enemy behavior | Pursuit, separation, timed attacks, some unique tells/status effects | Bounded perception, squads, tactical roles, fusion preparation |
| Boss behavior | 3-phase progression with HP thresholds around 60% and 30%; timed line/ring/circle telegraphs | Unique skills, phases, and objective-based kill mechanics |
| World | One continuous ~6000×6000 map; central Kettle and four outer regions | Formally define existing map as **Floor 1**; support later floors |
| Enemy capacity | Existing normal spawn threshold 40; normal/shared pool 64; spatial lookup grid | Keep 64/40 for normal-origin mobs; **ritual-origin Foreman mobs bypass both with independent dynamic allocation (D45)** |
| Terrain | Ground art and painted arena rings; no verified general solid-obstacle/navigation system | Add collision, navigation, cover and boss-generated obstacles |
| Boss death | Current HP-zero pathway pays rewards and marks victory immediately | Split **apparent defeat** and **confirmed final death** |
| Persistence | Three save slots, player and boss defeat information | Versioned floor, territory, boss-event and Kettle-history state |

**Important floor distinction:** The owner describes the current game as **Floor 1** of a tower-clear experience. The inspected code represents it as a continuous overworld, and a functional multi-floor state machine was not verified. Make Floor 1 explicit without pretending additional floors exist.

**This plan includes:** Enemy intelligence network, Living Territories, Bosses that Manipulate the Battlefield, Kettle Remembers Your Actions, four more common and four more elite species, 10-of-a-kind fusion, floor structure, obstacles, four unique boss victory systems, testing, and implementation sequence.

**This plan does not add** a separate system of randomly generated expeditions or convoy/rescue missions unless the owner later asks for it.

---

## 2. Eight new mob species — proposed roster

### 2.1 Four new common mobs

| Proposed ID | Name | Floor 1 region | Identity and abilities | Readable counter |
|---|---|---|---|---|
| `rivetTick` | **Rivet Tick** | Slab Town | Fast scrap-covered parasite; crouches, leaps, temporarily clings and interferes with dodge recovery | Attack during crouch or knock it away before latch |
| `signalMite` | **Signal Mite** | Route 9 | Fragile scout; records recent fighting habits and visibly broadcasts them to nearby allies | Break sight, interrupt signal, eliminate it to disrupt coordination |
| `siltMimic` | **Silt Mimic** | Lye Marsh | Plays dead or falsely staggers, then lunges at players who rush in | Recognize distinct false-collapse cue; bait counter or attack from range |
| `cinderCrow` | **Cinder Crow** | Copper Flats | Circling flying harasser with a committed diagonal dive and vulnerable landing | Dodge across dive angle and punish landing |

These are industrial-wasteland creatures with clear silhouettes, not magical creatures. The existing five species remain available and gain optional tactical roles gradually.

### 2.2 Four new elites

| Proposed ID | Name | Region | Unique role / skill | Readable counter |
|---|---|---|---|---|
| `plateMarshal` | **Plate Marshal** | Slab Town | Frontal scrap shield, allied guard order, synchronized press | Flank exposed sides; interrupt command windup |
| `switchbackDriver` | **Switchback Driver** | Route 9 | Genuine and fake charge, delayed second ram | Read engine/posture cue; punish overshoot recovery |
| `sumpCantor` | **Sump Cantor** | Lye Marsh | Pulsing support that briefly reinforces nearby allies or applies pressure | Break rhythmic channel; separate support from squad |
| `boreSentinel` | **Bore Sentinel** | Copper Flats | Marked short burrow, shrapnel spread, vulnerable overheating core | Track disturbed ground; punish overheating |

**Elite quality bar:** Each has a different silhouette, combat function, tell, recovery window, counter, damage/status integration, and response to coordination. Do not ship four reskins with inflated HP.

### 2.3 Spawning and unlock constraints

- Maintain the four region-specific enemy pools; add new types as **weighted choices** rather than replacing the current species.
- Introduce combinations gradually during Floor 1 so new players can learn their counters.
- Keep a mix of unsophisticated and tactical enemies. Ordinary mobs should not all act like perfect strategists.
- Use explicit allocation **within the original 64 shared instances** for normal-origin elites, summons, fusion bosses and main bosses. **Exception:** Foreman ritual-born mobs have dynamic storage outside this pool, no fixed cap (D45). Mother Sump brood retains normal budgeting.
- Existing art loading and sprite registry must support all new idle, move, attack, hurt, telegraph, fusion, and death visuals. Per D20, art will be generated externally with AI image tools, so every asset needs an art spec and a cleanup pass (see Section 2.4). Do not ship placeholder recolors as final art.

### 2.4 Art pipeline requirements (D20)

Sprites will be produced with external AI image tools, which tend to drift in style, palette and pixel grid, so the game needs a spec and a review step before anything is loaded.

- **Style lock:** one shared style sheet (soot black, worn steel, rust, ash, bog teal, bone/off-white, signal cyan, restrained brass) and a fixed pixel scale for the 480×270 view. Reject assets with mixed pixel sizes, soft anti-aliasing, or off-palette colors.
- **Per-asset list:** 4 commons, 4 elites, 9 fusion mid-bosses, plus boss states (Iron Foreman, Big Axle heat/exposed core, Mother Sump feeding/starved, Long Dry shell segments and molt). Each needs idle, move, attack, hurt, telegraph and death frames where applicable, and consistent frame size and anchor points.
- **Readability first:** tells and fake-vs-real cues (Big Axle false ignition, Long Dry false emergence, Silt Mimic fake collapse) must be distinguishable at native resolution, so AI output is judged on silhouette and cue clarity, not just looks.
- **Cleanup pass:** expect manual palette snapping, frame alignment and sprite-sheet packing before the asset loader accepts a file.
- **Provenance:** keep a record of which tool generated each asset, and check the tool's terms for commercial use before release.

---

## 3. Signature system: ten identical common mobs fuse

### 3.1 Exact eligibility and collision interpretation

A fusion can start **only** when all these conditions hold:

1. There are **10 living, active common mobs of the exact same species ID**.
2. They belong to the same active floor and allowed encounter/territory.
3. They are in a **contact-connected cluster**: each member touches at least one other member, connecting all ten through actual collision/contact.
4. The whole group fits inside a bounded gathering radius (initial **proposal: 96 world pixels** from centroid) to prevent a very long contact chain counting as a cluster.
5. No participant is already reserved, dead, mid-fusing, inside Kettle, **inside the Foreman ritual's visibly marked no-fusion AOE while active**, or part of a different fusion.

**9 Tin Rats + 1 Dust Dog = no fusion.**  
**10 Tin Rats in contact = eligible.**  
**10 Tin Rats merely near each other but with gaps = not eligible until contact.**

Ten circular mobs cannot practically all collide with every other mob simultaneously; connected contact is the faithful, implementable rule.

The existing separation steering pushes mobs apart. Add a **deliberate convergence state** only to eligible same-species groups **outside a marked fusion-suppression area**; reduce separation appropriately while gathering, without disabling collision throughout combat.

### 3.2 Fusion lifecycle

```text
NORMAL
  → same-species collision cluster detected (10 verified)
  → lock exact 10 distinct enemy IDs
  → STOP movement and attacks for all 10
  → shared FUSION CHANNEL, animation + audio + warning
      ├─ enough members killed / staggered / knocked apart → CANCEL
      │    → survivors recover and return to normal behavior
      └─ channel completes while all conditions remain valid
           → atomically consume exactly 10 common enemies
           → spawn ONE species-specific MID-BOSS at centroid
           → release reservations, grant no ordinary-kill rewards
```

**Frequency (D6, approved):** fusion is **not rare**. It happens whenever ten same-species mobs chasing the player end up crowded and connected, with no extra spawn condition. Because it will occur often, the simultaneous-limit values below are **safety caps against overload**, not rarity controls, and may need to rise after playtests.

**Proposed starting values, subject to approval:** 2-second channel, bounded checks 4–5 times/second, at most 1–2 active channels in an arena and 2 fusion mid-bosses simultaneously. Tune HP/rewards by actual playtests, not automatically as 10× normal HP. **No recursive fusion.**

The player can prevent transformation by killing members, hard interrupting the channel, or separating the contact group. Distinguish an interrupted fusion from a successful one with clearly different feedback.

### 3.3 One fusion form for each of the nine common species

| Fusion ingredients | New fusion mid-boss | Signature skill | Specific counter |
|---|---|---|---|
| 10 Tin Rats | **Scrap Rat King** | Armored rolling rush | Exposed underside in recovery |
| 10 Dust Dogs | **Bonepack Alpha** | Paired lunges plus howl | Punish howl preparation and post-lunge recovery |
| 10 Wire Kites | **Wire Cyclone** | Spinning aerial bolt arcs | Break synchronized wind-up or hit after arc discharge |
| 10 Lye Leeches | **Brine Maw** | Short-range suction and life drain | Escape suction; strike after committed bite |
| 10 Sump Bats | **Screech Choir** | Directional sonic cone | Get outside or behind the cone |
| 10 Rivet Ticks | **Rivet Titan** | Interlocking armor and large leap | Attack revealed joints after landing |
| 10 Signal Mites | **Relay Colossus** | Commands nearby allies | Interrupt exposed transmitter when signaling |
| 10 Silt Mimics | **Dredge Husk** | Fake-stagger into counterattack | Recognize tell, delay your punish |
| 10 Cinder Crows | **Blackwing Furnace** | Dive-and-rise airstrike sequence | Attack during distinct landing cooldown |

Fusion mid-bosses are **not** part of the 4 new elites or 4 existing main bosses. They need dedicated animation, size, collision, HP UI, rewards, and spawn-budget accounting.

### 3.4 Fusion edge cases and safeguards

- Process stable entity IDs in deterministic order; never reserve one unit twice.
- If slots are full, do not delete the ten mobs: they keep fighting ordinarily and may try again once a mid-boss slot becomes available (D39).
- Cancel properly on player death, encounter cleanup, territory unload, floor change, stun, displacement or save/load.
- Stop normal enemy AI and attacks while the channel is active.
- Prevent double loot/XP/ultimate-charge rewards from consuming ten mobs.
- **D7 as narrowed by D34:** Summoned mobs can ordinarily fuse, including Mother Sump brood. **No mob inside the marked Foreman ritual AOE can fuse during its 30-second ritual**; once it ends, surviving marchers are ordinary mobs and can fuse again.
- Since fusion is common (D6), enforce the simultaneous mid-boss cap strictly. If the cap is reached, eligible groups continue normal combat and retry when capacity opens. They must never be deleted.
- Test exact cases: 9 same-species, 10 same-species, 11 same-species, 5+5 mixed species, overlapping eligible groups, killed participant at last frame, despawn, exhausted pool.

---

## 4. Enemy Intelligence Network

### 4.1 Intended player experience

Enemies have roles and limited knowledge. A scout spots the player and communicates; protectors defend valuable allies; interceptors anticipate repeated movement habits; wounded units occasionally retreat or hesitate. The player should *notice* and *exploit* this intelligence.

```text
IDLE / PATROL
  → SUSPICIOUS
  → PLAYER OBSERVED
  → LOCAL DECISION
       CHASE | FLANK | HOLD RANGE | PROTECT | RETREAT | SIGNAL | GATHER FOR FUSION
  → COMMIT WITH READABLE TELL
  → RECOVER / RE-EVALUATE
```

### 4.2 Data the AI is allowed to know

- Last observed player position and timestamp.
- Observation confidence and report age.
- Recently observed attack category (melee, ranged, magnetic ability, etc.).
- A short history of visible dodge directions.
- Sighted ally deaths or recent attack outcomes.
- Tactical report from an ally, within a finite broadcast distance.

It **must not** read unknown input, see through valid cover, track the player indefinitely off-screen, or perfectly know undisclosed cooldowns. Reports decay; tactical changes require a cue and reaction time.

### 4.3 Examples

- The player repeatedly dodges right. A Signal Mite signals an interceptor to aim slightly right next time. The player feints right, then reverses left to punish the prediction.
- The player kills the scout mid-broadcast. Nearby mobs lose the updated report and fall back to simpler behavior.
- An elite protector moves between the player and a wounded ally; the player can bait it away, then strike the vulnerable target.
- Some low-HP ordinary enemies retreat; others panic and commit. Their roles and temperament explain the difference.

### 4.4 Technical and fairness guidelines

Use an inexpensive finite state machine or bounded utility selector rather than per-frame expensive planning, AI model requests, or globally scanning every entity. Update tactical decisions a few times per second, stagger work across entities, reuse the existing spatial hash, cap squad sizes and blackboard lifetimes, and add a developer visualization of AI state/last seen/signal age. Preserve long attack recoveries and clear tells; AI may not cancel recovery to avoid a player punish.

---

## 5. Floor 1: tower clearing and obstacles

### 5.1 Proposed floor interpretation

```text
FLOOR 1 — THE WASTELAND
   Kettle — safe hub
   ├── Slab Town → The Foreman
   ├── Route 9 → Big Axle
   ├── Lye Marsh → Mother Sump
   └── Copper Flats → The Long Dry
        ↓
   Four PRIMARY bosses finally defeated
        ↓
   Unlock a clearly marked floor exit at Kettle
        ↓
   Floor 1 clear/results screen and persistent reward
        ↓
   Floor 2 (future content, not defined here)
```

**Suggested default:** Require all four confirmed boss victories; show which territories remain unfinished. Merely reducing a boss to 0 HP **does not count** if its objective/final death phase is pending. Later floors are a future design decision; do not invent them or show inaccessible content as if finished.

### 5.1.1 Recommended Floor 1 boss encounter order (D49)

**Suggested progression (recommended, not required):**

```text
BIG AXLE (Route 9)
    ↓
THE LONG DRY (Copper Flats)
    ↓
MOTHER SUMP (Lye Marsh)
    ↓
THE FOREMAN (Slab Town) — intended final / hardest challenge
```

- **Player freedom is explicit:** All four territories, arenas and boss encounters remain accessible from the beginning of Floor 1. Bosses can be fought and finally defeated **in any order**. Never enforce the suggested sequence with locked doors, required boss prerequisites, forbidden entry, forced teleports or fake unavailable encounters.
- **Foreman as the climax, not a gate:** Present The Foreman as the expected toughest boss through NPC hints, optional map/journal guidance and encounter design. Its extremely difficult 30-second ritual and resurrection rules remain **unchanged**; the player can challenge him first if desired.
- **Floor clear condition remains unchanged:** Regardless of the order chosen, Floor 1 is cleared only after **all four primary bosses are finally defeated**, including successful resolution of their mandatory mechanics. Previously confirmed boss defeats persist; no boss respawns except in the optional rematch mode (D15/D44).
- **Existing area level-band conflict to resolve during implementation:** In the current `WORLD_CONFIG` design, Slab Town is **Lv 1–8** (Foreman), Route 9 **Lv 5–14** (Big Axle), Lye Marsh **Lv 10–20** (Mother Sump) and Copper Flats **Lv 15–25** (Long Dry). These currently suggest a different traversal order. **Do not silently swap the four territories or relabel their lore**. Instead, review boss-specific difficulty, enemy level bands, discovery prompts, and early-game access so the *recommended boss order* is legible while each area remains legitimately playable out of order. Distinguish ordinary-region mob difficulty from primary boss encounter difficulty.
- **Optional UX:** Provide a subtle `Suggested Challenge` order in the map or Kettle dialogue, with no reward penalty or completion restriction when players ignore it. Do not label a region as unplayable merely because its boss is designed as an advanced challenge.

### 5.2 Obstacle foundation

The current map uses detailed floor art and boss-arena markings, but no verified general-purpose solid geometry. Before introducing boss barricades and meaningful cover:

- Define static and temporary obstacle geometry with collision and line-of-sight checks.
- Add navigation/steering so players, enemies, mobs marching to the boss and fusion mid-bosses can move around obstacles.
- Specify which attacks pierce or collide with obstacles. **Obstacles are not breakable for now (D14)**, so no attack destroys them. Preserve Rook's intended piercing abilities.
- Validate spawn positions and fusion centroids; don't spawn actors inside solids.
- Ensure boss-generated barriers preserve at least one traversable route and **never trap players without counterplay**.
- Use authored 16-bit art and a limited dynamic-obstacle budget appropriate for 480×270 visuals.

**Proposed boss-generated objects:** scrap barricades (Foreman), blocked lanes and debris (Big Axle), sludge pools (Mother Sump), dust concealment and short-lived obstructions (Long Dry). All require explicit tells, durations, collision semantics and cleanup. Under D14 they are **not destructible by damage**: they disappear only by timer, boss phase change, or encounter end, so each must be easy to path around and must never fully block a route.

---

## 6. Living Territories

The existing four areas are distinct **Floor 1 territories**. Their responses should be meaningful yet manageable, rather than becoming a full strategy-game simulation.

| Territory | Boss | Personality / territory behavior | Possible post-victory reaction |
|---|---|---|---|
| Slab Town | The Foreman | Coordinated patrols, guards and scrap barricades | Command hierarchy collapses; survivor groups lose coordination |
| Route 9 | Big Axle | Mobile patrols, alerts, feints and high-speed pursuit | Road threats lose their leader; surviving units become more scattered |
| Lye Marsh | Mother Sump | Brood groups, recovery and swarming | Brood units scatter or show reduced coordination |
| Copper Flats | The Long Dry | Ambushes, concealment, hunter groups | Reduced coordinated ambushes after the dominant predator's defeat |

### Suggested territory state

- `territoryId`, `floorId`.
- `bossState`: alive, fight active, ritual pending, finally defeated, or returning (if enabled).
- `alertLevel` and `coordinationLevel` with bounded min/max and decay.
- `reinforcementBudget` or call availability. **D35 applies to ordinary territory spawns**: original global 40-active spawn target and 64-instance pool; no independent 30-per-territory hard limit. **D45 exception:** Foreman ritual-origin mobs are entirely outside these caps, even if their survivors become normal-behaving mobs after 30 s. Territory weighting does not alter the normal pool capacity.
- `territoryCleared`, `lastMajorOutcome`, key milestones.

Suggested progression: **CONTROLLED → CONTESTED → BOSS DEFEATED → UNSTABLE → CLEARED**, with optional remnant encounters. A primary boss's confirmed victory remains recorded for floor-clear progress; **per D15, confirmed-cleared bosses stay dead permanently**, and the existing boss respawn timer must be disabled for them. Rematches go through a separate optional rematch mode that does not undo the clear, grant duplicate first-clear rewards, or alter territory state.

No indefinite background simulation required. Change territory state from documented events, and display the result in the HUD/map and Kettle dialogue. Preserve gameplay when returning to earlier zones.

---

## 7. Main boss encounter design: four distinct ways to win

### Boss matrix

| Boss | Personality | Defining challenge | Final-win requirement (proposal) | Failure outcome |
|---|---|---|---|---|
| **The Foreman** | Commander using mobs as spare parts | Crowd control and preventing resurrection | Keep arrivals **below 10** so no revival occurs, then confirm destruction | **10+ arrivals revive him once**, HP scaled 10–100%, with a proportional rage buff |
| **Big Axle** | Aggressive deceptive engine | Bait charges, manage heat, strike weak point | Overheat and break exposed engine core | Cools down, resumes attack pattern |
| **Mother Sump** | Predatory healer | Deny feeding, interrupt channels and force starvation | Break defensive state by preventing successful feeds; land final strike | Regenerates and briefly armors itself |
| **The Long Dry** | Hidden deceiver | Tell-reading, false emergences and armored segments | Expose and break enough armor to reach core | Retires underground and partially repairs |

**Across all fights:** Show objective progress, preserve player options across Sena/Rook/Ines, make cues distinguishable, limit unavoidable damage, prevent infinite loops, and only award boss rewards on *confirmed final death*.

### 7.1 The Foreman — **The Reassembly Protocol**

**Combat fantasy:** A cold tactical commander who treats mobs as ammunition, shields and replacement machine parts.

**Proposed skills and traits**

1. **Command Override:** Audible/visible order that changes an allied group's tactic to flank or synchronize attacks. It can be interrupted.
2. **Scrap Barricade:** Deploys a few short-lived metal barriers. Their positions cannot fully seal the player inside an area.
3. **Sacrifice Order:** One nearby mob attempts to take a blow meant for the boss. The bodyguard has a visible dash tell and can be intercepted.
4. **False Command:** Appears ready for a personal slam, then signals a predictable allied pressure pattern. The false tell must differ observably from the actual slam.
5. **Emergency Repairs:** Below roughly 25% HP, briefly attempts to consume one existing scrap-bearing mob for limited healing. This costs the Foreman a punishable channel and cannot repeat indefinitely.
6. **Patterned command phases:** At roughly 60% and 30% HP, gains a new mix of issued orders instead of merely reducing cooldowns.

**Signature final mechanic: the Foreman collapses at 0 HP and summons its territory.**

```text
HP FALLS TO ZERO (FIRST TIME)
      ↓
BOSS COLLAPSES — NOT A FINAL DEATH
      ↓
REASSEMBLY PROTOCOL BEGINS — countdown displayed
      ↓
ALL ELIGIBLE ACTIVE MOBS IN THE FOREMAN'S TERRITORY RECEIVE THE CALL
      ↓
THEY MARCH TOWARD ITS BODY
      ├── FEWER THAN 10 called mobs arrive → REASSEMBLY FAILS
      │      → FOREMAN PERMANENTLY DESTROYED → victory/rewards
      └── 10 OR MORE called mobs arrive → REVIVAL (OWNER-APPROVED)
             → revive HP scales: 10 arrivals = 10% HP … 30+ arrivals = 100% HP
             → RAGE BUFF proportional to HP lost (lower HP = higher dmg/def)
             → THE IRON FOREMAN: stronger final form
             → one additional final HP phase (no more resurrections)
```

**Owner-approved revival rules (D1/D2):** The player does **not** need to stop every mob. They need to keep arrivals **below 10**. Each arrival beyond 10 raises the Foreman's revival HP, from **10% at 10 arrivals to 100% at 30 or more**. Because the rage buff is proportional to HP lost, a weak revival (few arrivals) produces a *glass-cannon-but-tough* Foreman with high damage and defense, while a full-HP revival has no rage. This creates a real trade-off: stopping most mobs (10–15 arrivals) leaves a low-HP but heavily enraged Foreman, while letting nearly all mobs through gives a full-HP Foreman with no rage. Every mob the player stops still matters. Existing territory mobs should answer the call.

**Rage tuning note:** the proposed formula is `1 + 0.5 × (1 − reviveHpPct)` for both damage and defense. Because high-defense plus low-HP can make the Iron Foreman feel spongy, cap the defense bonus and playtest it separately from the damage bonus.

**Owner-approved Foreman priority (D32): difficulty stays extremely high.** This ritual is meant to challenge mastery, not guarantee first-attempt prevention. Fair tells and playable framerates are mandatory, but easing the ritual is **not** an implementation task.

**Ritual rule summary:** Ten weak marchers attempt to spawn in a complete ring every two seconds for 30 seconds. The visually marked floor AOE fully covers spawn radius, collision margins and all routes inward, and **disables fusion during the ritual**. Marchers reaching the body before the clock ends count once. The arrival total is evaluated **at t=30**, not at t=10 arrivals. Survivors, including the last waves, **become ordinary mobs** and remain in play once the ritual expires; the boss then either finally dies (0–9 arrivals) or resurrects (10+).

**Entity consistency (D45):** The original **64-slot pool and 40-active spawn target remain unchanged for nonritual-origin enemies**. Foreman ritual mobs **ignore both**: instantiate every 10-mob wave exactly on the 2-second schedule into an independently managed, dynamically sized actor collection (no fixed 120 cap, no silent wave deferral). Guarantee all **150 summons** across a completed ritual regardless of the normal pool occupancy. When the ritual expires, surviving ritual-origin mobs **keep their exemption and dynamic storage** while behaving, fighting, dropping loot and eventually distance-despawning like normal enemies. The same spatial queries, damage rules and rendering must include both populations. Optimize the workload rather than cancelling summons.

**Revived form — The Iron Foreman:** one final HP bar starting at the approved scaled revival HP (10%–100%), the proportional rage buff, readable enhanced commands, reinforced plating and an additional three-step strike combination. It **cannot resurrect again**. Rewards and floor progress trigger only on confirmed final death.

**Skill tested:** Extreme wave clear, target prioritization, interruption and risk management, without a forced easy-mode path.

### 7.2 Big Axle — **Engine Overload**

**Combat fantasy:** An intimidating charging machine that deliberately exploits predictable dodges.

**Proposed skills and traits**

1. **False Ignition:** Fake acceleration with a distinct sputter cue; baits early dodge.
2. **Switchback Ram:** First rush and clearly re-telegraphed second rush after a brief setup.
3. **Adaptive Pursuit:** Occasionally targets a location extrapolated from *observed* recent movement, with uncertainty and chance to miss.
4. **Overdrive:** Below roughly 30% HP, charges become more aggressive and produce heat faster.
5. **Emergency Venting:** Attempts to retreat and reduce heat; vulnerable while cooling.
6. **Engine Break:** Destruction exposes core components and changes the boss's attacks.

**Heat mechanic (starting prototype numbers, not locked):**

- A committed missed charge builds heat, e.g. **+25** on a 0–100 meter.
- Venting removes heat, e.g. **−15** during a readable retreat/channel.
- **100 heat:** Big Axle stalls, briefly exposes a vulnerable engine core and cannot chain charges.
- Heat gain/cooling must be tuned so players can force exposure through movement, not by waiting for random AI mistakes forever.

```text
BAIT / EVADE COMMITTED RAMS
       ↓
ENGINE HEAT RISES
       ↓
100% HEAT → OVERHEAT + STALL
       ↓
EXPOSED CORE CAN BE DAMAGED
       ↓
HP DEPLETED + CORE BROKEN → FINAL DEATH
```

**Final condition (owner-approved required kill gate, D3):** The player must expose and break the engine core when its HP is depleted. If the player misses the core window at zero HP, Big Axle enters a disabled state, then **restarts at a capped low HP** and resumes an attack loop with a reliably inducible next overheating opportunity (D40). No endless invulnerable loop; exposure is reliably inducible by dodging charges. Clear audio differences distinguish true and false ignition, especially with reduced-flashes settings.

**Skill tested:** Delayed reactions, baiting, movement, pattern recognition and timing a focused weak-point punish.

### 7.3 Mother Sump — **The Starving Devourer**

**Combat fantasy:** A hungry predator that recovers by eating its own brood. The player can starve it rather than out-DPS its healing.

**Proposed skills and traits**

1. **Predator's Retreat:** Below ~30% HP, repositions toward an eligible nearby mob.
2. **Devour:** Visible channel to grab/consume prey and restore part of max HP if uninterrupted.
3. **Brood Call:** Summons a limited number of Lye Leeches, respecting encounter/pool budget.
4. **Digestive Armor:** Successful feed grants a short defensive window.
5. **False Collapse:** A false stagger with a distinguishable tell, followed by a grab attempt.
6. **Hunger Frenzy:** Repeated denied feeds make her moves more reckless, with longer punishable recovery.
7. **Corroding Reach:** Existing corrosive/status attacks remain part of her identity, with clear safe areas.

```text
MOTHER SUMP BELOW ~30% HP
       ↓
HUNGER STATE — TARGETS PREY
       ↓
RETREAT + DEVOUR CHANNEL (visible, interruptible)
       ├── Interrupted / prey removed
       │       → FAILED FEED COUNTS TOWARD STARVATION
       │       → EXPOSED DEFENSIVE WEAKNESS
       └── Successful consume
               → MOB REMOVED ONCE
               → LIMITED HP RESTORE + BRIEF ARMOR
               → PLAYER MUST DENY A LATER FEED
```

**Win condition (owner-approved required kill gate, D3):** After **two** successfully denied feeding channels (or a bounded hunger timeout when all eligible prey are removed), Mother Sump enters **STARVED**, loses a defensive layer, and is vulnerable to a finishing strike. Feed HP recovery and attempts are capped; the fight must not repeat indefinitely. If there is no prey, she cannot stall—her hunger sequence times out into STARVED.

**Class fairness (resolved by D21):** Every class denies a feed the same way: deal enough damage to Mother Sump (or the Devour channel) within a short window to stagger her, kill the prey, or displace it. No specific ability is required.

**Proposed universal stagger values (need tuning):** an interrupt threshold of roughly **8–10% of her max HP within 2 seconds** during the channel, scaling so a low-damage class can still reach it by sustained hits. Add a visible **stagger meter** on the HUD while the channel runs, so the player can see progress toward the interrupt. Use the same stagger meter design for the 2 s fusion channel, but scale the threshold to the mid-boss's HP.

**Skill tested:** Interruption timing, target management, saving a key cooldown, and denying enemy resources.

### 7.4 The Long Dry — **Shatter the Shell**

**Combat fantasy:** An elusive burrowing predator that forces the player to tell real attacks from decoys, then capitalize on brief armor openings.

**Proposed skills and traits**

1. **Subsurface Hunt:** Burrows under the player; ground motion is trackable.
2. **False Emergence:** Creates decoy disturbances. Real and fake cues are *different in learnable ways*, never pure random guessing.
3. **Dust Veil:** Short visibility reduction that leaves danger indicators legible, with reduce-flashes/accessibility options respected.
4. **Predicted Ambush:** Chooses a slightly anticipated dodge destination based on observations, not live input reading.
5. **Armor Regrowth:** Repairs damaged-but-unbroken plate segments while underground, within strict limits.
6. **Desperation Molt:** Below ~30% HP, sheds shell to change timing and reveal a different exposed core.
7. **Committed Emergence:** Powerful dive with predictable end position and a substantial punishable recovery.

```text
SUBSURFACE HUNT → MULTIPLE GROUND TELLS
       ↓
IDENTIFY THE REAL EMERGENCE
       ↓
BAIT / EVADE COMMITTED STRIKE
       ↓
MISS / RECOVERY EXPOSES ARMOR SEGMENT
       ↓
DESTROY REQUIRED SEGMENTS
       ↓
INNER CORE EXPOSED → FINAL STRIKE → DEATH
```

**Final condition:** Break a finite number of important shell segments (proposal: 3), then finish the exposed core. Per D22 and adopted D42, **any attack from any class damages a shell segment during a clearly readable exposure window**; no class-specific method is required, and armor damage outside that window is blocked with clear feedback. The skill test remains reading cues and baiting real emergence, not class choice. Fully destroyed segments **stay destroyed for this fight**; only partly damaged segments can repair on a subsequent burrow. The player must be able to create recovery windows reliably, not wait on RNG.

**Skill tested:** Reading cues, preserving composure, baiting real commitments, and exploiting weak-point windows.

### 7.5 Comparative defeat and failure rules

| Boss | Mandatory special condition? (proposal) | Can mechanic fail? | Max repeated escalation |
|---|---|---|---|
| Foreman | **Yes:** keep arrivals under 10 at 30 s, or beat one revived form | Yes, 10+ arrivals trigger revival (10–30 scales HP 10–100%). **Hard by design** | **One resurrection** |
| Big Axle | **Yes (approved gate):** core exposed and broken | Yes, heat can cool | Always forceable; finite retries |
| Mother Sump | **Yes (approved gate):** reach starved/exposed state | Yes, boss feeds/heals | Healing cap + starvation timeout |
| Long Dry | **Yes:** required armor segments broken | Yes, damaged plates may repair | Destroyed plates remain broken |

**Resolved (D3):** Big Axle and Mother Sump mechanics are **required kill gates**. Because they are mandatory, every gate must be reliably inducible by player action (no waiting on enemy randomness) and must have a bounded fallback so the fight can never softlock.

---

## 8. Kettle remembers your actions

The current Kettle hub already contains Ume, Harlow, a campfire, a shop and progression systems. Extend its **reactive dialogue and milestones** without forcing long conversations.

| Event recorded | Possible NPC response |
|---|---|
| First fusion mid-boss defeated | Ume reacts to the strange merged creature |
| Many fusions successfully interrupted | Harlow acknowledges combat discipline |
| Foreman permanently defeated without revival (under 10 arrivals) | Unique recognition for preventing reassembly |
| Foreman revived once before defeat | A concerned, specific remark about the Iron Foreman; optionally a variant if revived at very low HP vs full HP |
| Mother Sump denied all successful feeds | Ume jokes that the player finally starved the swamp's monster |
| Big Axle's core destroyed | NPC refers to the machine's final breakdown |
| Long Dry shell exposed and shattered | NPC mentions the creature's weak point |
| Repeated deaths to one boss | Optional practical hint, nonjudgmental and not repeated indefinitely |
| All four territories confirmed cleared | Floor 1 completion acknowledgement |

Use versioned persistent milestone flags/counters and hand-written dialogue templates with priority, cooldown and one-time rules. Only narrate recorded events; never claim Kettle knows facts the game did not observe. Include skip support.

**Rewards (D13, approved):** achievements and cosmetics only, such as titles, outfits or palette swaps, plus dialogue changes. No combat power or stat buffs, and avoid grinding solely to hear reactive lines.

---

## 9. Implementation architecture for the current JavaScript project

All module paths below are **illustrative planning names**, not files already implemented. Keep content/configuration data separate from generic runtime logic; do not grow `Enemy.js` into thousands more lines of one-off boss checks.

| Proposed module | Responsibility | Existing integration |
|---|---|---|
| `FloorManager` | Floor ID, objective progress, transitions, clear and results | `Engine.js`, `World.js`, UI |
| `EnemyDefinitions` / `BehaviorProfiles` | Nine common and seven elite species, traits, numbers, vulnerabilities | `config.js`, sprites/asset manifest |
| `EnemyPerception` | Sight, last observed target, uncertainty, action observations | `Enemy.js`, player events |
| `SquadBlackboard` | Short-lived reports and tactical group ownership | `Spawner.js`, spatial grid |
| `TacticalAI` | Bounded decisions: flank, retreat, protect, feint, signal | `Enemy.js` |
| `FusionManager` | Contact component detection, ten-member lock, channel and final transformation | `Spawner.js`, `Enemy.js`, particles/UI |
| `FusionBossDefinitions` | Nine distinct mid-boss profiles | enemy registry, sprites |
| `BossMechanicController` | Generic stages, tells, objectives, interrupt windows | boss entities, HUD |
| `BossRitualController` | HP-zero interception, **guaranteed** timed 10-unit wave schedule, march, revival and finalization | enemy death, spawner, save |
| `RitualActorStore` (D45) | Separate dynamically allocated ritual-origin mobs; shared combat/draw/spatial integration; keeps origin flag after t=30; no fixed cap | spawner, Enemy.js, Engine.js, World.js |
| `TerritoryManager` | Alert/coordination levels and persistent boss authority | world regions, FloorManager |
| `ObstacleManager` | Solid and temporary obstacle lifecycle/collision | `World.js`, projectile/player logic |
| `NavigationService` | Affordable navigation around barriers, march targets | enemy movement, ritual groups |
| `WorldEventLedger` | Battle milestones and reactions, minimal persistent facts | saving, dialogue |
| `DialogueReactionResolver` | Conditional Ume/Harlow text with anti-repeat rules | `Screens.jsx`, Kettle interactions |
| `DebugEncounterOverlay` | AI intent, cluster IDs, ritual state, obstacle/path overlays | optional debug-only UI |

### Existing source touch points to audit before implementation

- `src/game/Enemy.js`: HP-zero and `_onDeath` currently perform all rewards; phase shifts, telegraphs, movement, status effects and death must be separated into clean states.
- `src/game/Spawner.js`: current object pool (64), ordinary capacity (40), 250-pixel spatial grid and per-area spawns need budgets for fusions/summons and ritual ownership.
- `src/game/World.js`: current terrain drawing and world region lookup need collision/navigation abstraction without breaking render performance.
- `src/game/Engine.js`: fixed timestep, boss HUD snapshot, save/load and floor lifecycle orchestration.
- `src/game/Player.js`: observed attack/dodge events and class-specific damage/crowd-control interactions.
- `src/game/Projectile.js`: obstacle interactions and source-defined piercing rules.
- `src/game/Sprites.js`, `src/game/AssetLoader.js`, asset manifest: sprites for every new mob, transformation and boss state.
- `src/ui/HUD.jsx`: explicit boss objective, feeding interruption, heat, armor, ritual and fusion progress warnings.
- `src/ui/Screens.jsx`: Floor 1 clear and results (not currently verified in project).
- `src/data/config.js`: current central tuning values and boss/region identity remain authoritative until migrated to registries.

### Save and event lifecycle

1. Bump save schema version and supply migration defaults for older slots.
2. Persist *confirmed* boss clears separately from transient apparent deaths and rituals.
3. Save territory state, floor state, milestone event flags and an **encounter-entry snapshot** for boss attempts (D43), not a mutable ritual or active-fusion snapshot.
4. Never reward intermediate ritual deaths or consumption twice.
5. Clean up stranded summons, fusion participants, temporary obstacles and in-progress timers on game over/floor change.
6. **Loading a save made mid-boss restarts the whole boss fight (D19).** Do not persist transient ritual, fusion or arrival state. Clean transient actors belonging to that aborted attempt (including the dynamic ritual collection) exactly once; confirmed clears stay saved (D8).
7. **After successful ritual completion**, living ritual-origin survivors remain dynamic ordinary-behaving enemies; avoid converting them into normal-pool entries, which would violate D45. Handle their normal distance despawn, kill rewards, collisions and rendering until removal.
7. All bosses and fusions must use a shared **exactly-once finalization** pathway.

---

## 10. Implementation sequence and acceptance criteria

### Phase 0 — Approve rules **before any gameplay edits**

- [x] Product title is HellsAdvent (D12). Add a task to rename GRAVEL SKY strings in code, metadata and the title screen.
- [ ] Approve names and identity of four commons and four elites.
- [x] Boss ritual summons can fuse (D7, approved). Fusion is common and emergent (D6). All nine commons get fusion forms in two waves (D11).
- [x] Fusion channel is interruptible, about 2 s (D16). Detection radius (96 px) and simultaneous limits remain starting proposals to tune in playtests.
- [x] Approve mandatory/optional boss kill gates and exact resurrection failure threshold. **Done: required gates (D3); Foreman revives at 10+ arrivals, HP 10%–100% over 10–30 (D1/D2).**
- [x] Foreman scaling numbers confirmed (D18). Arrival counting rules stand as written.
- [x] Ritual spawns **all 10 mobs** in a full ring at t=0,2,...,28 over 30 s, ~5 s travel (D5/D28/D30). **D45:** ritual-origin mobs **ignore both** ordinary 64-slot pool capacity and 40-spawn threshold; all 150 scheduled actors are physically spawned. Nonritual actors keep original caps. No fixed 120 ritual pool, skipped waves, deferred waves or independent territory hard cap. Difficulty intentionally stays extreme (D32).
- [x] Bosses stay dead after Floor 1 clear, with an optional reduced-reward rematch mode that does not duplicate first-clear achievements or alter territory state (D15/D44).
- [x] Death/reload resets the current boss attempt using the encounter-entry snapshot (D8/D19/D43), but keeps confirmed floor/territory clears.

**Pass:** one accepted behavior specification with unambiguous edge cases.

### Phase 1 — Infrastructure and floor state

- [ ] Add data registries, entity categories/budgets and unique encounter IDs. **Include uncapped dynamic ritual-origin actor storage independent of ordinary 64/40**; make both populations visible to combat/render/spatial queries.
- [ ] Formalize Floor 1 and boss/territory clear states; prepare future-floor interfaces only. Implement D49 as **advisory encounter order only**, with no required boss prerequisites and no region locks.
- [ ] Build basic solid collision, LOS and simple navigation; preserve smooth existing combat.
- [ ] Create debug overlays and seeded scenario tests.

**Pass:** The existing game remains playable with all new systems disabled.

### Phase 2 — Eight new enemies

- [ ] Four commons, four elites, stats, unique state machines and sprites.
- [ ] Weighted region spawns, distinct attack tells and correct rewards.
- [ ] Validate collisions, pacing and counterplay across Sena/Rook/Ines.

**Pass:** New species are distinguishable by behavior and readable at native resolution.

### Phase 3 — Same-species fusion

- [ ] Contact-connected group detection and limited convergence steering.
- [ ] Atomic ten-member reservation, visible fusion channel, interrupt/cancel and success transitions **outside active Foreman ritual AOE**.
- [ ] All nine fusion mid-boss definitions and animations, built in two waves (D11): **Wave A** one prototype form (suggested: Signal Mite → Relay Colossus, since it ties into the AI network) to prove detection, channel, interrupt, rewards and save lifecycle; **Wave B** the remaining eight forms once Wave A passes performance and fairness checks.
- [ ] Performance/resource, reward and save lifecycle tests.

**Pass:** Ten same-species mobs can transform, nine do not, mixed species never qualify, and interruptions do not destroy or duplicate units.

### Phase 4 — AI network

- [ ] Perception, fading memories, squad knowledge and tactical roles.
- [ ] Broadcast cues, limited reaction delays, retreat and imperfect interception.
- [ ] CPU profiling under normal enemy cap.

**Pass:** Players understand when an enemy has learned something and can bait it into mistakes.

### Phase 5 — Boss-specific mechanics and obstacles

- [ ] Reusable boss skill/state controllers, hitboxes, telegraphs and interruptions.
- [ ] Foreman 30 s high-difficulty reassembly, marked no-fusion AOE sized to ring, **independent dynamic ritual mob wave scheduler guaranteeing 150 physical spawns**, survivor-to-normal-behavior transition preserving exemption, and exactly-once final reward.
- [ ] Big Axle heat and breakable core.
- [ ] Mother Sump feed/starve with bounded healing.
- [ ] Long Dry real/fake emergence and non-infinite plate system.
- [ ] Safe boss-created temporary cover, altered lanes, slime, dust and collision/nav updates.

**Pass:** Four bosses require four visibly different skills; no softlocked encounter and no endless health recovery. Per D21–D23, no boss mechanic may require a specific class.

### Phase 6 — Territories, Kettle reactions, Floor 1 clear

- [ ] Persist territory alert/coordination/conquered state and reconcile boss respawns.
- [ ] Trigger short authored Ume/Harlow lines from recorded achievements.
- [ ] Unlock and display Floor 1 clear when all four **confirmed** boss objectives are complete **in any order**; optionally display the suggested Big Axle → Long Dry → Mother Sump → Foreman order in Kettle/map guidance.
- [ ] Save/load/version compatibility with old slots and boss encounter-entry snapshots.

**Pass:** Territory and NPC feedback reflects actual player actions and survives restart.

### Phase 7 — Playtesting and performance validation

- [ ] Repeat fights with Sena, Rook and Ines using low, medium and high equipment levels.
- [ ] Verify clarity of telegraphs at 480×270 with visual accessibility settings.
- [ ] Verify FPS and CPU under maximum ordinary enemies plus permitted fusion and boss entities.
- [ ] Stress 9/10/11 contact clusters, 10 mixed mobs, 20 same-species mobs, no free pool slot and simultaneous ritual conditions.
- [ ] Kill a feeding target at final frame; interrupt a fusion at last frame; save/load when boss HP is 0 but ritual unresolved.
- [ ] Foreman ritual: 0/9/10/20/30/40+ arrivals; resolve at t=30 only; five-second transit for late waves; late survivors revert to ordinary **behavior** without deletion or losing origin exemption; original **64/40 preserved for nonritual**; **all 150 physical ritual spawns at exact wave timestamps even with normal pool 64/64 occupied**; no deferral; 360° no-fusion AOE spanning every spawn/path; canceled channels; path-block handling; rage exactly once; one-resurrection ceiling.
- [ ] Stress with 64 occupied normal slots **plus** 150 live ritual-origin mobs; verify hitboxes, AoE target enumeration, projectiles, rendering and status updates include both collections, and each unit has exactly one UID/death/reward. Validate FPS/CPU/memory without thinning ritual waves.
- [ ] After t=30, verify all ritual survivors persist and chase normally, can later fuse when allowed, keep separate capacity exemption, and eventually die or distance-despawn. No forced cleanup or unexpected normal-pool allocation.
- [ ] Big Axle: force heat exposure repeatedly, core timing, no deadlock when player does not dodge.
- [ ] Mother Sump: feed succeeds, feed denied, no food available, healing cap and starvation automatic fallback.
- [ ] Long Dry: real/fake cue readable, armor repair bounded, destroyed armor never respawns indefinitely.
- [ ] No duplicate drops, XP, kill charges, boss clears, rewards or achievement flags.
- [ ] Every generated obstruction has a valid escape/path and is removed on death/reload/floor change.
- [ ] Confirm end-to-end Floor 1 victory requires all 4 confirmed boss kills **in any order** (including Foreman first), results, Kettle recognition, saves and old-save migration; verify reduced-reward rematches never alter cleared territory state. Check D49 guidance does not gate bosses and that existing territory level bands are reconciled with boss-specific challenge expectations.

**Pass:** New mechanics are fun, fair, understandable and reproducible—not merely technically functional.

### Vertical slice (not selected as the starting point)

> **Owner decision D4:** build the **full plan in phase order**. The vertical slice below is retained as an optional early milestone or a risk-reduction checkpoint, not as a gate before full production.

Build one limited playable scenario first: **Route 9 Signal Mites share a tactical report → 10 Signal Mites can fuse into Relay Colossus → Big Axle can fake charges and overheat → Kettle acknowledges a relevant result.** Include one functional obstacle. If the interactions are entertaining and performant with all three classes, generalize to the other species and bosses. This avoids investing in nine fusion bosses before proving the design.

---

## 11. Optional proposals (items 1, 2 and 5 approved; others remain optional)

1. **Morale and mistakes (APPROVED, D24):** Wounded/isolated mobs may panic, hold back, or flee after allies fall.
2. **Fusion backlash (APPROVED, D25):** A late interrupted fusion briefly disorients surviving members, visibly rewarding player timing.
3. **Distinct feint language:** Each boss has consistent cues players can learn, with occasional fair fakeouts—not indistinguishable randomness.
4. **Boss mastery acknowledgements:** Cosmetics, titles or dialogue for stopping Foreman's reassembly, starving Mother Sump, overheating Big Axle and shattering Long Dry.
5. **Limited enemy grudges (APPROVED, D26):** Selected special enemies remember a previous encounter or failed tactic; avoid persisting every mob or punishing players perpetually.
6. **Territory identity cues:** HUD and NPC language reflect alert/coordination changes without requiring a complex diplomacy or procedural mission system.

### 11.0 Capacity, ritual exemption, and confirmed default behaviors (D32–D48)

- **Ritual ring marker:** draw a persistent ground-space marker with clear boundary. Compute its radius from the **entire spawn ring, full march paths, largest collision radius and margin**. The same authoritative test suppresses fusion for **every species** inside during ritual. Cancel any pre-existing channel that moves inside without destroying its participants; remove suppression at t=30.
- **After the countdown:** surviving ritual-origin mobs lose forced marching, switch to normal enemy AI and loot behavior, and remain in the world. **They remain in dynamically allocated ritual-origin storage, fully exempt from ordinary 64/40 capacity for their lifetime**; do not migrate into the 64-slot pool or silently despawn on expiration. Natural later death or original distance despawn still works.
- **Original capacity applies only to normal-origin actors:** keep one 64-entity pool and the existing 40-active ordinary spawn target for ordinary spawning; do not add independent territory caps. Original spawned enemies and ordinary summons honor those limits. **D45 overrides the older D35 interpretation for Foreman ritual-born actors.**
- **Foreman ritual ignores both caps:** fifteen atomic full waves of ten new mobs at t=0,2,...,28 (150 physical spawns), no fixed 120-slot collection and no hidden numerical ceiling or wave deferral. A **separate dynamic actor store** owns the ritual actors, with unique IDs and all standard combat/render/spatial integrations. Explicit runtime allocation failure is a technical failure to fix, never an invisible gameplay balance mechanism.
- **Performance:** profile stress cases of **64 normal + 150 ritual-born active** actors. Optimize decision cadence, spatial neighborhoods, render culling and reuse animation resources, without skipping/weakening any ritual mob or altering the required schedule. The approved 30-second finite schedule itself limits how many actors that *one ritual* can produce.
- **Intentional hardness:** never auto-win, thin waves, auto-delete survivors, reduce HP or lengthen intervals to make the ritual easy. **Do not artificially pause normal spawning to reduce combat pressure; regular enemies follow their original spawning limits.** Players may fail to prevent resurrection; that is by design. Keep visual tells and stable framerate so losses are earned rather than caused by lag.
- **Adopted recommendations:** Big Axle low-HP restart on failed core window; two interrupted feeds for Mother Sump starvation; universal Long Dry exposed-shell damage; boss encounter-entry snapshot restoration; all-four-boss Floor 1 clearance; first-clear rewards once and limited rematch rewards. These remain D36–D44.
- **Reminder:** These are instructions for the future implementation, not a claim that the game code has changed.

### 11.1 Rules for the approved features (proposals, tune in playtests)

**Morale (D24):**
- Each mob has a short-lived morale value that drops when allies nearby die, when it is wounded, or when it is isolated from its group. Low morale makes it hesitate, hold range, or flee, with a visible cue (flinch, ears back, change of color).
- Temperament varies by species and role, as the plan already describes, so some enemies panic and others commit. Do not make every mob flee, or fights lose pressure.
- **Interaction with fusion:** fleeing mobs break clusters, so morale naturally reduces fusion. Do not let morale stop fusion entirely, since fusion is meant to be common (D6).
- **Interaction with the Foreman ritual (D29, approved):** ritual marchers are **immune to morale** and never flee, so the march stays predictable and the arrival counter is fair.
- Recovering morale over time so fleeing mobs return to the fight, and cap the number fleeing at once so they never become hard to find.

**Fusion backlash (D25):**
- If the fusion channel is interrupted in its **final part (proposal: the last 0.5 s of the 2 s channel)**, the surviving members are disoriented for about 1.5 s (slowed, no attacks, visible stun cue). Earlier interrupts just cancel the fusion with no backlash.
- Backlash applies to survivors only, not to the player, and cannot chain into a second fusion during the disorientation.
- Use a clear, different audio and visual cue from a normal cancel so players learn that late timing pays off.

**Enemy grudges (D26):**
- **Scope:** selected special enemies only, proposal: the 7 elites and the nine fusion mid-bosses. Ordinary mobs and main bosses do not hold grudges.
- A grudge remembers one failed tactic (for example, the player's repeated dodge direction) and adjusts slightly for that fight. It must be bounded, decay over time, and be imperfect, consistent with the "every prediction can miss" principle.
- **Persistence:** per D8 and D19, fights reset on death or reload, so grudges are **session-scoped and not saved**. They never carry between floors or punish the player permanently.
- Show the grudge with a cue (an elite visibly eyes the player's habit) so the player can notice and exploit it.

---

## 12. Decision tracker — resolved choices and remaining tuning

Owner resolved the extreme Foreman difficulty, post-ritual mob behavior, no-fusion field and normal capacity under D32–D35. **D45 explicitly exempts every Foreman ritual-born mob from both original caps** and D46–D48 define the needed technical implementation. D36–D44 preserve earlier accepted recommendations. Remaining values, such as ritual mob HP, telegraph scale, stagger thresholds and CPU budget, are tuning tasks, not unanswered capacity questions.

| # | Decision | Recommended starting choice |
|---|---|---|
| 1 | Should **all nine** common species have fusion forms? | **RESOLVED (D11):** yes, all nine, built in two waves (one prototype first) |
| 2 | Must **ten** physically touch in one connected cluster, not simply share a radius? | **Adopted default:** yes; no fusion inside Foreman ritual AOE (D34) |
| 3 | Can the player interrupt the 10-mob fusion channel? | **RESOLVED (D16, D21):** yes, ~2 s, by kills, stun, displacement or universal stagger damage |
| 4 | How frequent should fusion become? | **RESOLVED (D6):** not rare, emergent from chasing mobs crowding together |
| 5 | May summoned ritual mobs fuse? | **Resolved D7/D34:** ordinary summons may fuse, but no fusion within the Foreman ritual's marked AOE |
| 6 | Foreman: does **one** marching mob reaching the corpse revive him, or should several be required? | **RESOLVED (D1):** several. 10+ arrivals revive him; HP 10% at 10 → 100% at 30+ |
| 7 | Foreman: how many resurrections per boss fight? | **Adopted default:** one |
| 8 | Are Big Axle/Mother Sump mechanics required kill gates or optional optimal strategies? | **RESOLVED (D3):** required kill gates |
| 9 | Should all four bosses be confirmed dead to clear Floor 1? | **Adopted default (D44):** yes |
| 10 | Do primary bosses stay defeated permanently once cleared, or respawn later? | **Resolved D15/D44:** stay dead; optional rematches with reduced non-farmable rewards |
| 11 | Does dying reset current floor/territory progress? | **Resolved D8/D43:** restore encounter-entry snapshot for boss attempt, keep confirmed clears |
| 12 | Can both players and bosses break certain obstacles? | **RESOLVED (D14):** no breakable obstacles for now |
| 13 | Can players return to Kettle between later floors? | **RESOLVED (D17):** yes, free return |
| 14 | Should Kettle achievements yield only dialogue/cosmetics or mechanical buffs too? | **RESOLVED (D13):** achievements and cosmetics, no buffs |
| 15 | Will final public branding be HellsAdvent or GRAVEL SKY? | **RESOLVED (D12):** HellsAdvent |
| 16 | Do Foreman ritual mobs obey the original 64/40 enemy caps? | **RESOLVED (D45):** No. Ritual-origin mobs are dynamically allocated outside both caps, with guaranteed 10-mob waves every 2 s and no capacity deferral; original caps stay for ordinary-origin enemies. |
| 17 | Is Big Axle → Long Dry → Mother Sump → Foreman a forced progression? | **D49:** No. It is the suggested challenge order; players can fight all four in any sequence. Foreman is the intended climactic challenge, not a required last boss. |

---

## 13. Design acceptance principles

- **Mechanics create problems players can solve.** They are not disguised damage sponges.
- **Fairness beats impossible AI.** Every prediction can miss, every major tell is understandable, every powerful phase has recovery.
- **One win means one win.** Boss false death cannot pay rewards or unlock floor clear early. Foreman outcome is decided at the **30 s deadline**, and late surviving marchers **become ordinary mobs**. The rage buff and revival HP are computed once and never re-applied.
- **Same-species fusion is exact.** Ten eligible common mobs, connected by collision, not mixed and not instantly merged without a tell. **No fusion inside the marked Foreman ritual AOE during those 30 seconds.**
- **Territories are consequential but bounded.** Persistent progress and reactive populations, not unlimited background simulation. Preserve the original **64-slot/40-target normal-enemy system**, while Foreman ritual-born mobs are **fully exempt** from both limits under D45.
- **Kettle remembers recorded actions.** Short authored feedback, no fabricated knowledge and no mandatory lengthy dialogue.
- **Floor 1 is the existing game first.** Later floors wait for explicit content planning. **The Big Axle → Long Dry → Mother Sump → Foreman order is recommended, not enforced; all four bosses are accessible at any time within Floor 1.**
- **Don't hardcode each new mechanic into the engine.** Use reusable state machines, data and tested service boundaries.
- **No implementation before approval.** This document is a proposed implementation roadmap, not a completed feature list.

### Source provenance

This document combines the two design responses previously developed in this chat (the broad HellsAdvent implementation plan and the four detailed boss mechanics) with the prior inspection of: `src/game/Enemy.js`, `Spawner.js`, `World.js`, `Engine.js`, `Player.js`, `src/data/config.js`, `src/ui/Screens.jsx`, `Sprites.js`, `AssetLoader.js`, `metadata.json`, and `ASSETS_NEEDED.md`. Facts marked **existing** come from that prior inspection; mechanics marked **proposed** are new design work and must not be described as currently implemented.