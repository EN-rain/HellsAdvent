# HellsAdvent — Combined Floor 1 Expansion & Intelligent Boss Design Plan

> **DOCUMENT STATUS: DESIGN PROPOSAL ONLY — NOT IMPLEMENTED AND NOT YET APPROVED.**  
> **Prepared:** October 18, 2026  
> **Project inspected previously:** `C:\Users\LENOVO\Desktop\Projectsss\HellsAdvent` (React/JavaScript Canvas + Vite/Electron)  
> **Delivery:** This standalone Markdown document is delivered in chat. **No local project files or gameplay code were changed.**

## 1. Game identity, vision, and boundaries

The current project has a **post-apocalyptic industrial-wasteland, anime-inspired pixel-art action RPG** setting. Its code, metadata, and title screen use **GRAVEL SKY** as the in-game product name although the project folder is **HellsAdvent**; naming is subject to the owner's decision. Its existing visual identity uses soot black, worn steel, rust, ash, bog teal, bone/off-white, signal cyan, and restrained brass accents. Weapons and creatures should feel like products of a ruined industrial society, not generic medieval fantasy.

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
| Enemy capacity | Existing ordinary active target cap 40; enemy pool 64; spatial lookup grid | Explicit separate budgets for common, elite, fusion, summons, boss |
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
- Use explicit limits for elites, summons, pending fusions, fusion bosses, and main bosses.
- Existing art loading and sprite registry must support all new idle, move, attack, hurt, telegraph, fusion, and death visuals. Use original authored assets, not placeholder recolors as final art.

---

## 3. Signature system: ten identical common mobs fuse

### 3.1 Exact eligibility and collision interpretation

A fusion can start **only** when all these conditions hold:

1. There are **10 living, active common mobs of the exact same species ID**.
2. They belong to the same active floor and allowed encounter/territory.
3. They are in a **contact-connected cluster**: each member touches at least one other member, connecting all ten through actual collision/contact.
4. The whole group fits inside a bounded gathering radius (initial **proposal: 96 world pixels** from centroid) to prevent a very long contact chain counting as a cluster.
5. No participant is already reserved, dead, mid-fusing, inside Kettle, or part of a different fusion.

**9 Tin Rats + 1 Dust Dog = no fusion.**  
**10 Tin Rats in contact = eligible.**  
**10 Tin Rats merely near each other but with gaps = not eligible until contact.**

Ten circular mobs cannot practically all collide with every other mob simultaneously; connected contact is the faithful, implementable rule.

The existing separation steering pushes mobs apart. Add a **deliberate convergence state** only to eligible same-species groups; reduce separation appropriately while gathering, without disabling collision throughout combat.

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
- If slots are full, do not delete the ten mobs; cancel or delay with a clear rule.
- Cancel properly on player death, encounter cleanup, territory unload, floor change, stun, displacement or save/load.
- Stop normal enemy AI and attacks while the channel is active.
- Prevent double loot/XP/ultimate-charge rewards from consuming ten mobs.
- Do not allow summoned ritual mobs to start a new fusion unless explicitly approved; suggested default **no** during boss rituals.
- Preserve reasonable fusion rarity: make the ten-body formation achievable but avoid an overwhelming number of simultaneous mid-bosses.
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

### 5.2 Obstacle foundation

The current map uses detailed floor art and boss-arena markings, but no verified general-purpose solid geometry. Before introducing boss barricades and meaningful cover:

- Define static and temporary obstacle geometry with collision and line-of-sight checks.
- Add navigation/steering so players, enemies, mobs marching to the boss and fusion mid-bosses can move around obstacles.
- Specify which attacks pierce, collide with, or destroy obstacles. Preserve Rook's intended piercing abilities.
- Validate spawn positions and fusion centroids; don't spawn actors inside solids.
- Ensure boss-generated barriers preserve at least one traversable route and **never trap players without counterplay**.
- Use authored 16-bit art and a limited dynamic-obstacle budget appropriate for 480×270 visuals.

**Proposed boss-generated objects:** scrap barricades (Foreman), blocked lanes and debris (Big Axle), sludge pools (Mother Sump), dust concealment and short-lived obstructions (Long Dry). All require explicit tells, durations, collision semantics and cleanup.

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
- `reinforcementBudget` or call availability.
- `territoryCleared`, `lastMajorOutcome`, key milestones.

Suggested progression: **CONTROLLED → CONTESTED → BOSS DEFEATED → UNSTABLE → CLEARED**, with optional remnant encounters. A primary boss's confirmed victory remains recorded for floor-clear progress; whether bosses themselves may respawn later is an approval question. The existing code has boss respawn timers, so a new territory rule must explicitly reconcile that behavior instead of silently contradicting it.

No indefinite background simulation required. Change territory state from documented events, and display the result in the HUD/map and Kettle dialogue. Preserve gameplay when returning to earlier zones.

---

## 7. Main boss encounter design: four distinct ways to win

### Boss matrix

| Boss | Personality | Defining challenge | Final-win requirement (proposal) | Failure outcome |
|---|---|---|---|---|
| **The Foreman** | Commander using mobs as spare parts | Crowd control and preventing resurrection | Stop all marching ritual mobs, then confirm destruction | Reassembles once into a stronger form |
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
      ├── Player stops EVERY called mob → REASSEMBLY FAILS
      │      → FOREMAN PERMANENTLY DESTROYED → victory/rewards
      └── At least ONE called mob completes the reassembly → REVIVAL
             → THE IRON FOREMAN: stronger final form
             → one additional final HP phase (no more resurrections)
```

**Rules faithful to the owner's example:** Defeat **all marching mobs** or prevent every one from completing the merge. **One successful arrival suffices for the proposed default resurrection**; a minimum-mob threshold is an alternative requiring approval. Existing territory mobs should answer the call. Since Floor 1 is geographically large, stage distant eligible mobs at visibly signaled approach points outside the fight while preserving their identity and count, instead of forcing minutes of walking across the overworld. Cap the encounter using a clearly shown ritual total and reserve space for ritual mobs. **Pause normal spawns during the ritual.** Do not silently summon unlimited extra mobs.

**If no eligible mobs exist:** Reconstruction fails after a short clear presentation; the player wins. **If mobs get stuck behind an obstacle:** they should reroute or safely expire according to a visible fail-safe, not softlock the fight. The player must have a fair chance to intercept the group.

**Revived form — The Iron Foreman:** one stronger final HP bar, faster but telegraphed commands, reinforced plating and an additional three-step strike combination. It **cannot resurrect again**; the player defeats it conventionally after learning this phase. The only boss loot award occurs after confirmed death.

**Skill tested:** Target prioritization under time pressure, control of groups, interruption, and deciding when to focus mobs instead of the boss.

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

**Suggested final condition:** The player must expose and break the engine core when its HP is depleted. If they miss the window, the engine cools and the boss continues at a low but capped recovery state. No endless invulnerable loop; exposure is reliably inducible by dodging charges. Clear audio differences distinguish true and false ignition, especially with reduced-flashes settings.

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

**Proposed win condition:** After a small set of successfully denied feeds (or when all eligible prey are removed), Mother Sump enters **STARVED**, loses a defensive layer, and is vulnerable to a finishing strike. Feed HP recovery and attempts are capped; the fight must not repeat indefinitely. If there is no prey, she cannot stall—her hunger sequence times out into STARVED.

**Important class fairness:** Melee, ranged and magnetic classes must each have a way to deny a feed, whether by attacking the channel, staggering the boss, displacing prey or eliminating the target. An interrupt must not require one specific ability.

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

**Suggested final condition:** Break a finite number of important shell segments (proposal: 3), then finish the exposed core. Fully destroyed segments **stay destroyed for this fight**; only partly damaged segments can repair on a subsequent burrow. The player must be able to create recovery windows reliably, not wait on RNG.

**Skill tested:** Reading cues, preserving composure, baiting real commitments, and exploiting weak-point windows.

### 7.5 Comparative defeat and failure rules

| Boss | Mandatory special condition? (proposal) | Can mechanic fail? | Max repeated escalation |
|---|---|---|---|
| Foreman | **Yes:** stop ritual or beat one revived form | Yes, one arrival triggers revival | **One resurrection** |
| Big Axle | **Yes:** core exposed and broken | Yes, heat can cool | Always forceable; finite retries |
| Mother Sump | **Yes:** reach starved/exposed state | Yes, boss feeds/heals | Healing cap + starvation timeout |
| Long Dry | **Yes:** required armor segments broken | Yes, damaged plates may repair | Destroyed plates remain broken |

**Owner choice:** A less scripted alternative is to make Big Axle and Mother Sump's mechanics an **optimal strategy** rather than an absolute kill gate. The proposed stricter version above is for comparison, not an unchangeable requirement.

---

## 8. Kettle remembers your actions

The current Kettle hub already contains Ume, Harlow, a campfire, a shop and progression systems. Extend its **reactive dialogue and milestones** without forcing long conversations.

| Event recorded | Possible NPC response |
|---|---|
| First fusion mid-boss defeated | Ume reacts to the strange merged creature |
| Many fusions successfully interrupted | Harlow acknowledges combat discipline |
| Foreman permanently defeated without revival | Unique recognition for preventing reassembly |
| Foreman revived once before defeat | A concerned, specific remark about the Iron Foreman |
| Mother Sump denied all successful feeds | Ume jokes that the player finally starved the swamp's monster |
| Big Axle's core destroyed | NPC refers to the machine's final breakdown |
| Long Dry shell exposed and shattered | NPC mentions the creature's weak point |
| Repeated deaths to one boss | Optional practical hint, nonjudgmental and not repeated indefinitely |
| All four territories confirmed cleared | Floor 1 completion acknowledgement |

Use versioned persistent milestone flags/counters and hand-written dialogue templates with priority, cooldown and one-time rules. Only narrate recorded events; never claim Kettle knows facts the game did not observe. Include skip support.

Optional rewards can be small achievements, cosmetic titles or dialogue changes; avoid forcing new combat power or grinding solely to hear reactive lines.

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
| `BossRitualController` | HP-zero interception, march, resurrection, feeding, finalization | enemy death, spawner, save |
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
3. Save territory state, floor state, milestone event flags and only the minimum live encounter state needed for fair resumption.
4. Never reward intermediate ritual deaths or consumption twice.
5. Clean up stranded summons, fusion participants, temporary obstacles and in-progress timers on game over/floor change.
6. Define safe restart behavior for loading mid-boss encounters, especially while a ritual is pending.
7. All bosses and fusions must use a shared **exactly-once finalization** pathway.

---

## 10. Implementation sequence and acceptance criteria

### Phase 0 — Approve rules **before any gameplay edits**

- [ ] Decide product title (HellsAdvent vs GRAVEL SKY) without involuntary rebranding.
- [ ] Approve names and identity of four commons and four elites.
- [ ] Choose whether all nine commons can fuse and whether boss ritual summons can fuse (recommended no).
- [ ] Set fusion channel duration, detection radius and simultaneous limits.
- [ ] Approve mandatory/optional boss kill gates and exact resurrection failure threshold.
- [ ] Decide whether existing boss respawn remains possible after Floor 1 clear.
- [ ] Decide whether players keep boss progress after death.

**Pass:** one accepted behavior specification with unambiguous edge cases.

### Phase 1 — Infrastructure and floor state

- [ ] Add data registries, entity categories/budgets and unique encounter IDs.
- [ ] Formalize Floor 1 and boss/territory clear states; prepare future-floor interfaces only.
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
- [ ] Atomic ten-member reservation, visible fusion channel, interrupt/cancel and success transitions.
- [ ] All nine fusion mid-boss definitions and animations.
- [ ] Performance/resource, reward and save lifecycle tests.

**Pass:** Ten same-species mobs can transform, nine do not, mixed species never qualify, and interruptions do not destroy or duplicate units.

### Phase 4 — AI network

- [ ] Perception, fading memories, squad knowledge and tactical roles.
- [ ] Broadcast cues, limited reaction delays, retreat and imperfect interception.
- [ ] CPU profiling under normal enemy cap.

**Pass:** Players understand when an enemy has learned something and can bait it into mistakes.

### Phase 5 — Boss-specific mechanics and obstacles

- [ ] Reusable boss skill/state controllers, hitboxes, telegraphs and interruptions.
- [ ] Foreman reassembly and exactly-once final reward.
- [ ] Big Axle heat and breakable core.
- [ ] Mother Sump feed/starve with bounded healing.
- [ ] Long Dry real/fake emergence and non-infinite plate system.
- [ ] Safe boss-created temporary cover, altered lanes, slime, dust and collision/nav updates.

**Pass:** Four bosses require four visibly different skills; no softlocked encounter and no endless health recovery.

### Phase 6 — Territories, Kettle reactions, Floor 1 clear

- [ ] Persist territory alert/coordination/conquered state and reconcile boss respawns.
- [ ] Trigger short authored Ume/Harlow lines from recorded achievements.
- [ ] Unlock and display Floor 1 clear when all four **confirmed** boss objectives are complete.
- [ ] Save/load/version compatibility with old slots.

**Pass:** Territory and NPC feedback reflects actual player actions and survives restart.

### Phase 7 — Playtesting and performance validation

- [ ] Repeat fights with Sena, Rook and Ines using low, medium and high equipment levels.
- [ ] Verify clarity of telegraphs at 480×270 with visual accessibility settings.
- [ ] Verify FPS and CPU under maximum ordinary enemies plus permitted fusion and boss entities.
- [ ] Stress 9/10/11 contact clusters, 10 mixed mobs, 20 same-species mobs, no free pool slot and simultaneous ritual conditions.
- [ ] Kill a feeding target at final frame; interrupt a fusion at last frame; save/load when boss HP is 0 but ritual unresolved.
- [ ] Foreman ritual: 0 mobs available, all stopped, one arrives, several arrive, spawn budget exhausted, navigation blocked, reload, one-resurrection ceiling.
- [ ] Big Axle: force heat exposure repeatedly, core timing, no deadlock when player does not dodge.
- [ ] Mother Sump: feed succeeds, feed denied, no food available, healing cap and starvation automatic fallback.
- [ ] Long Dry: real/fake cue readable, armor repair bounded, destroyed armor never respawns indefinitely.
- [ ] No duplicate drops, XP, kill charges, boss clears, rewards or achievement flags.
- [ ] Every generated obstruction has a valid escape/path and is removed on death/reload/floor change.
- [ ] Confirm end-to-end Floor 1 victory, results, Kettle recognition, saves, old save migration.

**Pass:** New mechanics are fun, fair, understandable and reproducible—not merely technically functional.

### Recommended vertical slice before full production

Build one limited playable scenario first: **Route 9 Signal Mites share a tactical report → 10 Signal Mites can fuse into Relay Colossus → Big Axle can fake charges and overheat → Kettle acknowledges a relevant result.** Include one functional obstacle. If the interactions are entertaining and performant with all three classes, generalize to the other species and bosses. This avoids investing in nine fusion bosses before proving the design.

---

## 11. Optional proposals (not approved requirements)

1. **Morale and mistakes:** Wounded/isolated mobs may panic, hold back, or flee after allies fall.
2. **Fusion backlash:** A late interrupted fusion briefly disorients surviving members, visibly rewarding player timing.
3. **Distinct feint language:** Each boss has consistent cues players can learn, with occasional fair fakeouts—not indistinguishable randomness.
4. **Boss mastery acknowledgements:** Cosmetics, titles or dialogue for stopping Foreman's reassembly, starving Mother Sump, overheating Big Axle and shattering Long Dry.
5. **Limited enemy grudges:** Selected special enemies remember a previous encounter or failed tactic; avoid persisting every mob or punishing players perpetually.
6. **Territory identity cues:** HUD and NPC language reflect alert/coordination changes without requiring a complex diplomacy or procedural mission system.

---

## 12. Questions for the owner — unresolved choices

| # | Decision | Recommended starting choice |
|---|---|---|
| 1 | Should **all nine** common species have fusion forms? | Yes; prototype one before producing all nine |
| 2 | Must **ten** physically touch in one connected cluster, not simply share a radius? | Yes, with bounded cluster size |
| 3 | Can the player interrupt the 10-mob fusion channel? | Yes, ~2s prototype, by kills/stun/displacement |
| 4 | How frequent should fusion become? | Uncommon, threatening, deliberately readable |
| 5 | May summoned ritual mobs fuse? | No during boss resurrection ritual |
| 6 | Foreman: does **one** marching mob reaching the corpse revive him, or should several be required? | One, faithful to the stated all-mobs-must-be-stopped challenge; adjust after testing |
| 7 | Foreman: how many resurrections per boss fight? | **One** |
| 8 | Are Big Axle/Mother Sump mechanics required kill gates or optional optimal strategies? | Prototype required, switch if too scripted |
| 9 | Should all four bosses be confirmed dead to clear Floor 1? | Yes |
| 10 | Do primary bosses stay defeated permanently once cleared, or respawn later? | Keep floor-clear milestone; optionally allow repeat-fight mode separately |
| 11 | Does dying reset current floor/territory progress? | Retain permanent boss clears; reset transient battles/fusions |
| 12 | Can both players and bosses break certain obstacles? | Yes, only selected objects and attacks |
| 13 | Can players return to Kettle between later floors? | Defer; design interface so either rule is supported |
| 14 | Should Kettle achievements yield only dialogue/cosmetics or mechanical buffs too? | Dialogue and cosmetics first |
| 15 | Will final public branding be HellsAdvent or GRAVEL SKY? | Owner to decide, no auto-rebrand |

---

## 13. Design acceptance principles

- **Mechanics create problems players can solve.** They are not disguised damage sponges.
- **Fairness beats impossible AI.** Every prediction can miss, every major tell is understandable, every powerful phase has recovery.
- **One win means one win.** Boss false death cannot pay rewards or unlock floor clear early.
- **Same-species fusion is exact.** Ten eligible common mobs, connected by collision, not mixed and not instantly merged without a tell.
- **Territories are consequential but bounded.** Persistent progress and reactive populations, not unlimited background simulation.
- **Kettle remembers recorded actions.** Short authored feedback, no fabricated knowledge and no mandatory lengthy dialogue.
- **Floor 1 is the existing game first.** Later floors wait for explicit content planning.
- **Don't hardcode each new mechanic into the engine.** Use reusable state machines, data and tested service boundaries.
- **No implementation before approval.** This document is a proposed implementation roadmap, not a completed feature list.

### Source provenance

This document combines the two design responses previously developed in this chat (the broad HellsAdvent implementation plan and the four detailed boss mechanics) with the prior inspection of: `src/game/Enemy.js`, `Spawner.js`, `World.js`, `Engine.js`, `Player.js`, `src/data/config.js`, `src/ui/Screens.jsx`, `Sprites.js`, `AssetLoader.js`, `metadata.json`, and `ASSETS_NEEDED.md`. Facts marked **existing** come from that prior inspection; mechanics marked **proposed** are new design work and must not be described as currently implemented.
