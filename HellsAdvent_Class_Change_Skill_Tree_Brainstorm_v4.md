# HellsAdvent — Class Change, Skill Tree & Interactive UI Specification (v4.1 Final)

**Status:** **APPROVED SPECIFICATION & IMPLEMENTATION ARCHITECTURE.**  
**Scope:** Sena Ibuki, Rook Matsuda, Ines Calloway, Kaelen Vos, Vespera Locke; three alternative class changes **per character** (15 specializations total); skill slots, traits, mastery, interactive UI, and class-independent loadouts (NO cross-class combo system).  
**Implementation Target:** Integrated directly into the HellsAdvent game engine, data models, HUD, and skill archive modal.
**Restored features:** Interactive loadout, free loadout presets, free respec, branching specialization UI, boss fairness, **NO cross-class combo mechanics**.  
**Progression rule:** **Character level and XP always persist. Class changing switches only the active class and its equipped class-specific behavior; it never starts the character again at Level 1.**

## 0. Central rule: a new class is allowed to be COMPLETELY DIFFERENT

A class change is **not restricted to enhancing the current character's starting attacks, weapons, or mechanics**. It can replace the combat fantasy entirely: new weapon, new basic attack, movement model, resource, animations, sounds, combat range, pace, and ultimate. These are *additional styles* for the same character, not forced extensions of their starting moves.

- Sena is **currently** a Railcut melee fighter with Momentum, Lunge, Ground Break, Rail Parry, and Seven Cuts. A new Sena class **need not use a Railcut or Momentum**.
- Rook is **currently** a Springgun ranged fighter with Magazine/Perfect Reload, Rivet Spread, Kickback, Rapid Fire, and a rail-shot ultimate. A new Rook class **need not shoot a Springgun or reload**.
- Ines is **currently** an **offensive Magnetist**, not a healer/support, using Scrap Orbit, Pull, Spin Up, Lump, and Scrapfall. A new Ines class **need not depend on Scrap Orbit** and may use entirely new forms of attack. **No healing or support class has been proposed for Ines.**
- **Kaelen Vos is already added by the project owner** as a Thermo-Lancer / Pyro-Alchemist: Boiler Pressure, Ignis Lance, Naphtha Jet, Caustic Mortar, Vent Supernova, Sunfall Cataclysm. His new class can abandon the lance, fire or pressure entirely.
- **Vespera Locke is already added by the project owner** as an Arc-Drone Artificer / Summoner: Arc-Drone Swarm, Arc-Lash, Tesla Pylon, Seeker Swarm, Phase Blink, Orbital Ion Singularity. Her new class can abandon drones, summons and tethers entirely.
- Existing skill unlocks remain owned forever. The player can equip an old ability after class-changing, mix old and new actives, or keep a fully old-school loadout.
- A **character** owns their skill library; different characters do **not** share each other's skills.

### Terms

| Term | Behavior |
|---|---|
| **Character** | Sena / Rook / Ines / Kaelen / Vespera; owns one persistent character level, XP, stats, learned skills, and overall progression. |
| **Character level / XP** | **Never changes because of a class switch.** Level thresholds 15/30/45 are based on this same persistent character level, not separate class levels. |
| **Class** | One of three alternative specializations, chosen/unlocked at the class-change milestone. Controls default basic attack, weapon stance, mobility identity, and class-specific passive. |
| **Skill** | Individually learned active ability; stays in the character's skill library even when another class is equipped. |
| **Skill slot** | Player-configurable input binding. Slot placement never changes what a skill does. |
| **Intrinsic trait** | Character-wide, **automatically evolving** passive. Always active, regardless of class. |
| **Class trait** | Class-flavored automatic passive that is active with that class; has rank-ups at advancement milestones. |
| **Skill-tree node** | Purchased choice: unlock a skill, improve it, alter behavior, or purchase a class-local modifier. Existing purchased passive upgrades can remain as a separate category. |

## 1. Progression: retain the ORIGINAL proposed workflow

### Non-negotiable: LEVEL RETAINS; ONLY CLASS CHANGES

- Each character has **one permanent character level and XP bar**. Switching classes does **not** reset, reduce, replace, or re-roll level/XP or character-wide progression.
- Example: **Level 27 Sena (Phantom Edge) → switch to Rift Breaker → still Level 27 Sena**. All earned XP, existing unlocked skills, and automatic intrinsic trait ranks remain.
- Example: **Level 45 Ines (Magnet Crusher) → Scrapstorm → still Level 45 Ines**. Her Level-45 intrinsic trait remains rank IV. Class-specific trait effects reflect the *currently active* class, without stacking effects of inactive classes.
- Levels 15/30/45 refer to **character level**, not to a fresh level progression for each class. Class-specific skill unlocks are tracked by unlocks/choices, not by setting a new class level to 1.
- Switching to a newly unlocked specialization at a high character level **does not force the character to level up again** to qualify for that specialization's level-gated options. Individual class skills or skill-tree nodes still need to be unlocked or purchased where relevant.
- Class-change animation, weapon, default stance, class trait, visuals, and chosen loadout preset may change. **Character level and XP do not**. Learned skill ranks, purchased passives, inventory, equipment ownership, and permanent character trait unlocks remain saved.


| Level | Event | What's gained |
|---:|---|---|
| 1 | Character starts | Existing starting kit, basic skill library, intrinsic trait rank I. |
| **15** | **First Class Change** | Choose from **3 class options unique to that character**, unlock one class's basic attack/stance, initial skills and class trait rank I. No old skill is lost. |
| **30** | **Advanced Mastery** | More skills and alternate behavior nodes for the chosen/learned class; automatic character/class trait evolution. |
| **45** | **Class Awakening** | Signature awakening skill/ultimate, additional skill mutations, final automatic trait evolution. |

**Important technical distinction:** The older JS checkout inspected for Sena/Rook/Ines caps character level at **30** and has a Level **8/16** promotion implementation. **Kaelen and Vespera were supplied as already added by the owner, but their files were not found in that checkout; use the supplied current-kit specifications as authoritative and re-check the live branch during implementation.** **This document deliberately proposes the requested 15/30/45 progression**, which would require changing the level cap and migrating older promotion/save data **when implemented**. Do **not** silently substitute the old 8/16 milestones in this proposal.

**Suggested class unlock policy (proposal):** On reaching 15, the player chooses the first class. The other two remain visible; they can be earned later through class-specific challenge/milestone requirements, **without resetting or altering character level or XP**. Advancing one class never deletes the other classes' unlocked abilities. No pay-to-respec or irreversible branch lockout. Optional class mastery is an unlock record, **not a replacement character level**.

**Suggested swapping restriction:** Change active class/loadout at Kettle or outside combat (to prevent switching exploits). This restriction is still optional and needs approval.

## 2. Skill slots and persistence

**Initial playable target:** 4 configurable active slots (keys 1–4), 1 configurable ultimate slot (R), dodge and normal attack remain separate core inputs. The number of slots is a *proposed UI target*, not a claim about the existing game. The established characters each have three mapped starting active skills, including Kaelen and Vespera per the owner-provided additions.

```
CHARACTER LIBRARY (persistent)
  Existing skills:  Lunge | Ground Break | Rail Parry | Seven Cuts ...
  Class A skills:  [unlocked entries]
  Class B skills:  [unlocked entries]
  Class C skills:  [unlocked entries]
            |
            v
DRAG / SWAP / SELECT
  [1] Any learned active   [2] Any learned active
  [3] Any learned active   [4] Any learned active
  [R] Any learned ultimate
```

**Rules:**

1. Drag from the library to a slot, swap two slots, or use click-select for keyboard/controller accessibility. Never permanently consume a skill on equip.
2. Class change offers a recommended loadout but **never overwrites** the player's existing loadout without consent. A selected ability can remain equipped after a class change.
3. Save at least three named loadout presets per character; save preferred class and key bindings separately. A preset may reference abilities unlocked on different class paths.
4. Allow any **learned** skill for that character to be slotted regardless of current class; same-name duplicates are disallowed unless a skill specifically creates charges/copies.
5. A skill must remain **fully castable** while its originating class is inactive. If it normally spends an exotic resource, give it a universal stamina/cooldown baseline; the skill uses its own independently defined parameters; **no cross-class combo or synergy effects** are generated.
6. Passive nodes never occupy active slots. Intrinsic traits upgrade automatically. Purchased passives remain separate and can coexist with automatic traits.
7. Old ultimates also remain selectable. If a new class changes the character's default basic attack, let the player preview the change and optionally select a legacy basic-attack stance outside combat.
8. Save equipped skill IDs (not numeric array positions), unlocked class IDs, current traits and milestone flags. On migration, map existing skills by stable IDs and never erase owned purchases.
9. Keep `characterLevel`, `characterXP`, earned stats, and character-wide trait milestones **independent of** `activeClassId`. The class-change action updates `activeClassId` (plus class-specific stance/preset/visuals) and **must never write to level or XP**. If a new class has unpurchased skill nodes, those nodes remain locked while the character retains full level and old skills.

## 3. Three paths for each character — deliberately different combat fantasies

### A. SENA IBUKI

Sena's starting kit is close-range Railcut/Momentum. The following options are **not just Railcut upgrades**.

#### A1. PHANTOM EDGE — Blink assassin / short-range spatial combat

**Identity:** Discard the heavy rail blade for paired spectral knives; attacks blink through marked locations. **New gameplay loop:** place an Echo, reposition, strike from the opposite side. No Momentum requirement.  
**Default stance:** Twin specter knives; short dual strikes; quick phase-hop instead of heavy lunge windups.  
**Unique class mechanic:** **Echo Anchors** — up to two afterimages left by movement or abilities, each lasting a few seconds. They enable positioning tricks but do not act as permanent summons.

| Unlock | New skill | Actual gameplay, not just a stat increase |
|---|---|---|
| 15 | **Shadow Pin** | Throw a spectral pin to designate a point/enemy. Recast blinks behind the marked target and cuts in a line. |
| 15 | **False Exit** | Drop a decoy Echo while dashing in a chosen direction; an enemy attack that hits the Echo triggers a small counter slash. |
| 30 | **Seam Cut** | Draw a short line between two placed Echoes; a delayed dimensional slash hits everything crossing it. |
| 30 | **Borrowed Second** | Rewind Sena's own position to the location she occupied a moment earlier; leaves a damaging tear along the rewind path. |
| 45 ultimate | **Midnight Corridor** | Temporarily create several blink gateways inside a marked combat zone; player chooses exit points while timed precision slashes detonate behind pursuers. Bosses are never forcibly teleported. |

**Class trait:** *Out of Frame* — after repositioning, next attack gains a precision bonus; at 30 it can strike marked enemies from either side; at 45 a successful perfect evade refreshes one Echo charge (bounded cooldown).  
**Tree decisions:** decoy survives longer **or** explodes instantly; blink causes bleed **or** stronger single-hit burst; Seam Cut slows crossings **or** deals greater damage to stationary targets.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

#### A2. RIFT BREAKER — Heavy gauntlet brawler / terrain shockwaves

**Identity:** Switch to hydraulic knuckle rigs. Slow, relentless close combat with impact waves, fracture lines and grabs; deliberately unlike Sena's quick Railcut style.  
**Default stance:** Weighted punch combos with chargeable finishers, low reach but large stagger.  
**Unique mechanic:** **Pressure** — gained from committed heavy strikes and perfect blocks; spent on larger rupture effects. Skills still function without Pressure, but the class enhances them when Pressure is available.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Pile Fist** | Charge and release a line-breaking punch; a perfect release adds a shockwave behind the target. |
| 15 | **Faultline Stomp** | Stamp a branching fracture pattern onto the floor; each crack erupts after a short visible warning. |
| 30 | **Anchor Grip** | Grab a small enemy or lock onto a large enemy's armor surface; hurl small enemies into others, or deliver a stationary armor-shock against bosses instead of moving them. |
| 30 | **Seismic Guard** | Brief brace absorbs knockback; stored impact is redirected into a forward cone when released. |
| 45 ultimate | **Worldsplitter** | Smash both gauntlets down to create sequential, telegraphed concentric fault rings; strongest hits occur only where rings intersect. |

**Class trait:** *Unbroken Stance* — heavy attacks resist interruption; at 30 blocked impact fuels Pressure; at 45 perfect-charge releases leave one brief follow-up fracture.  
**Tree decisions:** narrow high-stagger crack **or** wide lower-damage fan; grab single-target bonus **or** thrown-enemy collision damage; brace longer **or** release stronger.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

#### A3. PULSE DANCER — Rhythm-stance fighter / chained electric arcs

**Identity:** Moves to electro-conductive ribbon rings and footwork, playing like a timing-focused dance fighter; **not** a Railcut speed upgrade.  
**Default stance:** Rhythm-combo steps with alternating close and medium arcs.  
**Unique mechanic:** **Beat Windows** — optional timing markers on attacks. Perfectly timed casts alter shape; mistimed casts still work normally so latency cannot lock skills.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Snapstep** | Sidestep on a beat and fire a crescent pulse along the previous movement direction. |
| 15 | **Conductive Loop** | Throw a hovering electric hoop; enemies crossing its circumference get struck, center stays safer. |
| 30 | **Backbeat** | On the next incoming attack, a timed handclap parries the hit and sends a pulse behind nearby enemies. |
| 30 | **Chain Waltz** | Place three consecutive step markers; each successful step sparks the next, culminating in a chosen-direction finisher. |
| 45 ultimate | **Perfect Frequency** | A short stance sequence with multiple telegraphed timing hits that crescendo into an area burst; no forced QTE to deal baseline damage. |

**Class trait:** *Syncopation* — successful beat-timed actions build harmony charges; at 30 unlocks a free short step at a charge threshold; at 45 surplus charge enhances the next finisher, with a cap.  
**Tree decisions:** more forgiving beat windows **or** higher perfect-beat reward; Loop follows Sena **or** stays deployed; Waltz branches toward enemies **or** uses player-directed waypoints.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

### B. ROOK MATSUDA

Rook starts as a Springgun marksman using Magazine, Perfect Reload and ranged bolts. These changes can abandon the Springgun altogether.

#### B1. RAIL HUNTER — Harpoon sniper / exposed weak-point pursuit

**Identity:** Swap the rapid Springgun for a single-shot coil harpoon; shots tether targets/terrain and let Rook relocate. Not merely a bigger Springgun bullet.  
**Default stance:** Slow aimed harpoon with optional short-range sidearm finisher.  
**Unique mechanic:** **Target Bearings** — tagged weak-point angles reveal optimal lines for precise attacks. A missed tag still allows baseline damage.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Harpoon Line** | Fire a tether into valid terrain or an enemy. Recast pulls Rook toward the anchor; bosses are never pulled. |
| 15 | **Sightline Break** | Deploy a small temporary optics beacon that highlights a firing corridor; Rook's next shot along it pierces common enemies. |
| 30 | **Ricochet Survey** | Bounce one heavy shot off a selected solid surface to hit an obscured enemy from a different angle; only tagged reflective surfaces count. |
| 30 | **Pinpoint Verdict** | A deliberate scoped strike at a briefly exposed target region; successful timing triggers high stagger, not a mandatory boss skip. |
| 45 ultimate | **Dead Meridian** | Mark up to several distant firing lines and release a timed sequence of coil harpoons; intersecting lines deal large burst damage to exposed targets. |

**Class trait:** *Cold Read* — observing a target without firing improves first-shot precision; at 30 moving between anchors preserves some focus; at 45 perfect bearings permit one instant follow-up shot (cooldown).  
**Tree decisions:** anchor repositioning **or** high-impact pins; tag single-target damage **or** secondary pierce; narrower sightline damage **or** easier aim.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

#### B2. SIEGE GUNNER — Deployable artillery / controlled demolition

**Identity:** Replace the marksman weapon with a portable mortar chassis and rotary explosive drum. Delayed blast zoning, setup and repositioning; no Perfect Reload dependence.  
**Default stance:** Arc-firing explosive projectiles with slow cadence and visible landing markers.  
**Unique mechanic:** **Heat Lanes** — repeated artillery fire overheats the same location; moving the firing position or spacing shots restores efficiency.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Mortar Beacon** | Lob a beacon that calls one delayed shell onto its area, with warning circle visible to player and enemies. |
| 15 | **Bunker Roller** | Deploy a slow-moving armored drum that pushes small mobs aside and explodes when commanded. Cannot shove bosses or seal corridors. |
| 30 | **Salvo Grid** | Draw a three-cell pattern on the ground; shells land in the chosen sequence, making pattern planning central. |
| 30 | **Breakwater Shot** | Fire a concussive blast that briefly redirects projectiles and knocks away lesser mobs from an opening. |
| 45 ultimate | **Iron Weather** | Open an artillery window in which the player places several bombardment zones; simultaneous strikes create a large final blast after clear telegraphs. |

**Class trait:** *Siege Calculation* — attacks gain payoff for accurate pre-placement; at 30 consecutive hits in different zones cool the rig; at 45 a precisely overlapped barrage adds one extra secondary detonation.  
**Tree decisions:** shorter shell delay **or** larger warning/damage radius; moving roller **or** stationary mine; wide grid **or** concentrated bombardment.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

#### B3. CIRCUIT WARDEN — Aggressive combat engineer / chain devices

**Identity:** Rook swaps to an arc-tool and drone controller. Gameplay is about placing and actively triggering damaging machinery, **not passive support**.  
**Default stance:** Short-range electrical tool bolts plus drone-targeting pointer.  
**Unique mechanic:** **Circuit Links** — up to three placed devices can connect into a graph; power travels along visible links, with explicit per-device limits.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Arc Pylon** | Place a pylon that zaps enemies within reach. Two pylons create a damaging wire across their link. |
| 15 | **Scrambler Disk** | Throw a device that follows a short path and emits disruptive electrical bursts; enemies temporarily lose coordinated attacks, not all abilities. |
| 30 | **Relay Swap** | Instantly reposition one active device to a new legal spot; it discharges along its old-to-new path. |
| 30 | **Overload Command** | Sacrifice linked devices to create chained blasts; player chooses the detonation order to control knockback. |
| 45 ultimate | **Blackout Cascade** | Launch multiple temporary attack drones that route electricity through nearby legal nodes; finishes with an explosive network collapse. |

**Class trait:** *Feedback Loop* — triggering circuits returns a small amount of energy; at 30 carefully sequenced overloads add arc branches; at 45 a destroyed device releases one parting strike (strict proc cooldown).  
**Tree decisions:** chain depth **or** individual pylon strength; mobile disk **or** stationary disruption zone; automatic targeting **or** manual priority target.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

### C. INES CALLOWAY

**Current identity (verified): offensive Mage/Magnetist**, using Scrap Orbit, Pull, Spin Up, Lump and Scrapfall. The class fantasies below differ from **each other** and from current orbit/throw combat. No healing, revival or ally-buff role.

#### C1. MAGNET CRUSHER — Magnetic pressure / compression executioner

**Identity:** Converts the alternator rig into enormous localized compression fields. Feels like a heavy gravity-caster, not a scrap thrower. The combat loop is set a pressure point, collapse it, then shatter the resulting metal mass.  
**Default stance:** Short magnetic pressure blasts; slower than normal scrap throws.  
**Unique mechanic:** **Compression Nodes** — place short-lived pressure centers; enemies can leave before a collapse, bosses cannot be forcibly displaced.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Crush Point** | Mark a ground circle that tightens over time, then crushes enemies still within; enemies have a visible escape warning. |
| 15 | **Iron Coffin** | Form four suspended iron plates that converge around a target point. Common enemies are briefly trapped; bosses instead take armor-pressure pulses without confinement. |
| 30 | **Mass Driver** | Form a huge temporary steel weight from environmental scrap and launch it through a straight corridor; does **not** consume Scrap Orbit ammunition. |
| 30 | **Pressure Inversion** | Convert a selected Compression Node into an outward shockwave; rewards alternating inward/outward timing. |
| 45 ultimate | **Singularity Press** | Converge several massive industrial fragments into a visible central compression sphere, then violently flatten and burst the arena zone. This is magnetic pressure, **not a black hole that deletes enemies**. |

**Class trait:** *Critical Mass* — landing compression hits temporarily increases collapse strength; at 30 overlapping separate pressure zones changes the final shape; at 45 a precise detonation refunds one limited node charge.  
**Tree decisions:** tighter high-damage collapse **or** wider crowd hit; line-driver projectile **or** ground-impact wreck; inward pull pressure **or** outward armor disruption.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

#### C2. SCRAPSTORM — Whirlwind blade swarm / momentum-independent multi-hit DPS

**Identity:** Changes from inventory-based throwing to wielding a self-sustaining **cloud of razor-sharp metal shards**. High mobility, moving blade patterns, aggressive area damage. Can function at zero existing Scrap Orbit pieces.  
**Default stance:** Rapid cutting gusts of micro-shards rather than single scrap throws.  
**Unique mechanic:** **Storm Fronts** — directional shard currents follow player-directed paths and intersect for extra hits; they generate their own temporary shard visuals.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Razor Monsoon** | Send a moving rectangular storm across the floor, shredding enemies that stay inside its traveling path. |
| 15 | **Shiver Step** | Burst sideways, leaving a fan of sharp fragments behind; the fan continues for a short independent duration. |
| 30 | **Crosswind** | Bend an active storm through a chosen angle, forcing its blade front through a new lane. |
| 30 | **Shard Cathedral** | Erect several temporary orbiting shard columns around an area; the player can move the columns inward for a final piercing convergence. |
| 45 ultimate | **Thousand-Knife Typhoon** | Fill a chosen area with a huge rotating shard field, then collapse it into a sweeping outward razor wave; player steering changes safe/danger corridors. |

**Class trait:** *Cutting Current* — movement charges storm intensity; at 30 intersecting fronts create a short burst; at 45 a dodge through an active front accelerates it once (bounded).  
**Tree decisions:** slow persistent storm **or** fast hard-hitting front; player-following shard columns **or** rooted placement; many light hits **or** fewer armor-piercing hits.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.

#### C3. POLARITY BREAKER — Repulsion duelist / magnetic movement and collision

**Identity:** Ines becomes a fast, technical **electromagnetic duelist** who charges enemies and surfaces with opposing poles, then detonates collisions. Unlike Crusher's stationary pressure and Scrapstorm's sustained shred.  
**Default stance:** Magnetic strike gauntlets with quick short-range pulses; movement shifts between push and pull bursts.  
**Unique mechanic:** **Polar Marks (+ / −)** — new abilities assign temporary polarities to enemies/ground anchors. Opposites attract, same poles repel. Bosses do not get uncontrollably thrown or moved.

| Unlock | New skill | Gameplay |
|---|---|---|
| 15 | **Northbound** | Dash to a ground anchor while sending a pushing electromagnetic blade behind Ines. |
| 15 | **Reverse Charge** | Tag a cone of enemies with a pole, then flip the tag to blast them outward. Bosses instead take a pressure stagger hit. |
| 30 | **Collision Course** | Mark two legal points with opposite charges; nearby small enemies slide toward the line between them, then the line erupts. |
| 30 | **Mag-Rail Surf** | Ride a brief self-created magnetic rail along a player-selected path, striking enemies near the rail without needing a real wall or metal object. |
| 45 ultimate | **Zero-Point Reversal** | Alternate huge positive and negative field pulses in clearly marked lanes. The final flip converts built-up charge into a focused blast. |

**Class trait:** *Field Reversal* — alternating polarities boosts the next strike; at 30 perfectly timed flips reduce travel recovery; at 45 collision hits chain to one extra marked small enemy (hard target cap).  
**Tree decisions:** collision damage **or** longer repulsion; long linear surf **or** sharp steerable rail; more polarity targets **or** stronger single-target pressure.  
**Legacy skill availability:** Previously learned skills can be slotted and cast separately. There are **no cross-class combo triggers or bonus effects**.


### D. KAELEN VOS — EXISTING THERMO-LANCER / PYRO-ALCHEMIST (OWNER-CONFIRMED)

**Already in the game according to the owner; do not re-implement as a new character.** Baseline: **Boiler Pressure 0–100%**, building from Ignis Lance sweeps/thrusts. Above **75% (red gauge)**: **+35% skill damage** and burning ground pools. At **100%**: **Overheated Surge** (**+40% ATK, +25% attack speed, +20% move speed, 4 seconds**). **[V] manual steam vent**: radial knockback and debuff cleanse. These numbers and behaviors are *existing owner-provided definitions*, not balance changes proposed by this brainstorm.

**Existing, unchanged starting kit:** **[1] Naphtha Jet** (rocket lance charge, firewall trail, knockback); **[2] Caustic Mortar** (chemical slag projectile, Corrode + Burn, acid-fire pool); **[3] Vent Supernova** (spends pressure for circular thermobaric knockback/stun); **[R] Sunfall Cataclysm** (8 rotating solar flare beams, 12–16 slag meteors, 230–260 px crater finisher with time-stop and sakuga cut-in). The existing ultimate's **Tectonic Kiln / Blight Hurricane** branches must remain selectable: they are **variants of the original ultimate**, not the three new class-change choices.

**New classes need not use Boiler Pressure.** Their own class resources are self-sufficient; equipping an older pressure-dependent skill must preserve the legitimate pressure cost/generation rules rather than making it free or uncasteable. The [V] action for new classes may be a new class action when active, but selecting an old pressure-based skill must still have a discoverable, valid pressure path.

#### D1. CINDER CORSAIR — Jet-powered aerial skirmisher wielding twin combustion cutters; no Ignis Lance or Boiler Pressure requirement.

**Starting stance:** Twin plasma-cutters; short-range aerial sweeps and hover hops.  
**New class-only mechanic:** Burn Routes — directional jet lanes stored for a few seconds; attacks operate on own charges and stamina.  
**Automatic class trait:** **Cinder Wake** (rank I at Level 15, enhanced at 30, awakened at 45; effect only when this class is active).

**Automatic trait ranks:** **Level 15:** A clean jet dodge improves next cutter recovery. **Level 30:** A well-routed cutter pass adds one bounded burn pulse, with cooldown. **Level 45:** One perfect flyover sequence empowers the final descending strike.

| Gate | New ability | Action and independent gameplay | Initial tuning target (proposal) | Exclusive fork A / B |
|---|---|---|---|---|
| Lv15 active | **Jet Sickle** | Launch a curved burning cutter disk that returns along a different route; the return path is steerable for one short angle correction. | 4–6s cooldown; clean path collision; no required wall. | wide arc / concentrated returning hit |
| Lv15 active | **Thruster Feint** | Burst through a telegraphed dash lane, then leave a fiery decoy nozzle that detonates on enemy approach. | 7–9s cooldown; max one decoy; i-frames only on a short central dash window. | long dash / larger decoy blast |
| Lv30 active | **Skyhook Dive** | Vault to a selected valid landing circle, then crash down with a ring of explosive sparks and a brief armor-cracking hit. | 10–13s cooldown; valid landing is required; no boss knock-up. | larger ring / focused core impact |
| Lv30 active | **Razor Afterburn** | Draw two self-propelled burning blade tracks that cross the arena and retract on command. | 12–15s cooldown; two lanes max; collision remains open. | fast tracks / longer-lasting tracks |
| Lv45 [R] ultimate | **Crimson Flyover** | Ultimate: carve five player-steered aerial attack lanes in a high-speed montage before a final descending flame wheel. Bosses remain grounded; no skipping kill gates. | Charge-gated; each pass visibly telegraphed and bounded. | many narrow passes / fewer heavy passes |

**Legacy skill rule:** Existing Kaelen attacks remain in the character-wide library; a class change cannot delete Naphtha Jet, Caustic Mortar, Vent Supernova, or Sunfall Cataclysm. There is **no special cross-class combo effect** for slotting them alongside new abilities.

#### D2. CRUCIBLE ARCHITECT — Forge-controller who prints temporary molten molds, presses, and blades in the field instead of lance-combat.

**Starting stance:** Industrial crucible glove, hot-metal stamping attacks.  
**New class-only mechanic:** Mold Charges — three short-lived forge stamps; resource regeneration independent of Boiler Pressure.  
**Automatic class trait:** **Kiln Precision** (rank I at Level 15, enhanced at 30, awakened at 45; effect only when this class is active).

**Automatic trait ranks:** **Level 15:** Precise stamp placement slightly trims warning-to-hit delay. **Level 30:** A correctly placed press leaves a short extra damage pulse. **Level 45:** Completing a full forge sequence refunds one mold charge on cooldown.

| Gate | New ability | Action and independent gameplay | Initial tuning target (proposal) | Exclusive fork A / B |
|---|---|---|---|---|
| Lv15 active | **Mold Stamp** | Stamp a glowing iron shape on the floor; after a brief warning it rises as a damaging metal spike, then sinks away. | 6–8s cooldown; no solid permanent wall; clear warning edge. | single tall spike / three smaller spikes |
| Lv15 active | **Pourline** | Draw a short molten-metal line with the cursor; it cools after a few seconds and leaves a final sharp glass-like crack. | 8–10s cooldown; length capped; hazard cannot seal arena exits. | long thin line / short wide pool |
| Lv30 active | **Foundry Press** | Drop a giant temporary hydraulic press on a chosen circle; pressure ramps before the strike, then releases in a radial crack. | 12–15s cooldown; stagger not displacement on bosses. | faster strike / larger delayed impact |
| Lv30 active | **Quench Fracture** | Rapidly cool a chosen active mold, shattering it into outward shards; may operate on its own created mold without an old-class skill. | 9–12s cooldown; no terrain destruction. | piercing shards / wider scatter |
| Lv45 [R] ultimate | **Cathedral of Iron** | Ultimate: summon an open-sided forge cathedral of floating metal ribs that slam sequentially, ending in a molten central press. | Clearly escapable center; no persistent path block. | wide sequential strikes / dense focal crush |

**Legacy skill rule:** Existing Kaelen attacks remain in the character-wide library; a class change cannot delete Naphtha Jet, Caustic Mortar, Vent Supernova, or Sunfall Cataclysm. There is **no special cross-class combo effect** for slotting them alongside new abilities.

#### D3. CRYO SABOTEUR — Endothermic demolition expert using freezing reagents, brittle fractures and chemical shock, fundamentally different from pyro-lance combat.

**Starting stance:** Twin coolant injectors and shattering ampoules.  
**New class-only mechanic:** Brittle Marks — frost stress accumulates on enemies hit by coolant attacks; the class builds its own charges, no Boiler Pressure dependency.  
**Automatic class trait:** **Thermal Shock** (rank I at Level 15, enhanced at 30, awakened at 45; effect only when this class is active).

**Automatic trait ranks:** **Level 15:** Coolant attacks build class-only Brittleness. **Level 30:** At the Brittleness threshold, one additional class-local shatter pulse triggers. **Level 45:** Precisely timed freezing impacts convert a threshold to focused stagger, once per window.

| Gate | New ability | Action and independent gameplay | Initial tuning target (proposal) | Exclusive fork A / B |
|---|---|---|---|---|
| Lv15 active | **Cold Snap Canister** | Throw a fast canister that bursts into a freezing cloud, applying Slow and a brittle primer rather than immobilizing bosses. | 7–9s cooldown; fog edges always visible. | long slow duration / stronger impact damage |
| Lv15 active | **Fracture Wire** | Place a temporary taut brittle wire between two self-created stakes; triggers a splinter blast when enemies cross. | 10–12s cooldown; max one line; not a solid obstacle. | faster trigger / more splinter range |
| Lv30 active | **Thermocline Kick** | Dash across a temperature gradient and unleash an endothermic shatter burst at the endpoint. | 8–11s cooldown; collision-respecting dash. | longer movement / harder endpoint detonation |
| Lv30 active | **Zero-Kelvin Flask** | Launch a large flask that freezes a marked patch of ground and detonates into ice-metal shrapnel after a countdown. | 13–16s cooldown; bosses slowed only within defined resistances. | persistent patch / concentrated shrapnel |
| Lv45 [R] ultimate | **Whiteout Rupture** | Ultimate: a swirling pale chemical front rapidly crystallizes before fracturing into staggered ice knives and a final shockwave. | Charge-gated, timed pulses; never invulnerable crowd clear. | wide blizzard / concentrated breach |

**Legacy skill rule:** Existing Kaelen attacks remain in the character-wide library; a class change cannot delete Naphtha Jet, Caustic Mortar, Vent Supernova, or Sunfall Cataclysm. There is **no special cross-class combo effect** for slotting them alongside new abilities.

### E. VESPERA LOCKE — EXISTING ARC-DRONE ARTIFICER / SUMMONER (OWNER-CONFIRMED)

**Already in the game according to the owner; do not re-implement as a new character.** Baseline: autonomous **Arc-Drone Swarm (up to 3–5 orbiters)** and **Tether Grid**; **Arc-Lash** chains up to **4 targets** and marks the primary for **+35% drone focus damage**. **[V] Drone Recall Pulse** shocks and knocks back close enemies. The baseline drone count and +35% modifier are *existing owner-provided definitions*, not proposals.

**Existing, unchanged starting kit:** **[1] Tesla Pylon** (2–3 linked high-voltage spires and laser fence with damage/slow); **[2] Seeker Swarm** (5–8 homing explosive micro-drones); **[3] Phase Blink** (electric teleport, departure/arrival lightning novas, Arc Overcharge); **[R] Orbital Ion Singularity** (240–280 px geometric drone-laser ground matrix, inward lightning pull, multiple ion pillars and impact sakuga frames). The existing ultimate's **Valkyrie Swarm Protocol / Zenith Thunderhead** branches remain **original-ultimate variants**, not the new class-change choices.

**New classes need not use drones or the Arc-Lash.** Old drone skills remain separately castable after class change with their own deployable and target limits; no passive background drone swarm is required by the new melee/weather classes.

#### E1. VOLT REAVER — Aggressive melee lightning duelist with a shock-cleaver and counter stance; no drones or pylon requirement.

**Starting stance:** Electrified heavy cleaver, fast step-in attacks and charged ripostes.  
**New class-only mechanic:** Charge Edges — land close-range timed hits to fill three cleaver charges; separate from Arc-Drone Swarm.  
**Automatic class trait:** **Static Hunger** (rank I at Level 15, enhanced at 30, awakened at 45; effect only when this class is active).

**Automatic trait ranks:** **Level 15:** Consecutive cleaver hits improve the next cleaver attack slightly. **Level 30:** Successful cleaver counter refunds one charge with cooldown. **Level 45:** Three legitimately earned Charge Edges allow one enhanced thunderfinisher.

| Gate | New ability | Action and independent gameplay | Initial tuning target (proposal) | Exclusive fork A / B |
|---|---|---|---|---|
| Lv15 active | **Arc Rend** | Slash forward with a jagged lightning cleaver; a second manual press sends the arc along a short angled line. | 5–7s cooldown; modest stagger against bosses. | wide first arc / powerful second cut |
| Lv15 active | **Breaker Step** | Cross a small distance with a lightning dash and leave a delayed discharge where Vespera was standing. | 7–9s cooldown; no world-geometry bypass. | longer dash / stronger departure discharge |
| Lv30 active | **Countercoil** | Take a timed defensive stance; a successful counter unleashes an enormous downward electric axe blow. | 11–14s cooldown; boss attacks remain readable. | longer parry window / bigger retaliatory blast |
| Lv30 active | **Thunder Guillotine** | Carve a narrow vertical electrical tear, then pull the cleaver through it for a heavy armor-pressure finisher. | 12–15s cooldown; no mandatory boss phase skipped. | armor pressure / stronger small-mob cleave |
| Lv45 [R] ultimate | **Cataclysm Edge** | Ultimate: rapid thunder-cleaver sequences carve luminous X marks in the arena, which erupt together in a final skybolt. | Charge-gated; clear ground marks. | many X strikes / single enormous finishing cleave |

**Legacy skill rule:** Existing Vespera attacks remain in the character-wide library; class change cannot delete Tesla Pylon, Seeker Swarm, Phase Blink, or Orbital Ion Singularity. There is **no special cross-class combo effect** for slotting them alongside new abilities.

#### E2. IRON PUPPETEER — Controls ONE massive walking war automaton directly; opposite of five autonomous orbiting drones, emphasizing deliberate input and positioning.

**Starting stance:** Wired control gloves with short-range shock tool; remote automaton consumes independent command charges.  
**New class-only mechanic:** Command Queue — choose up to three explicit heavy actions for a single temporary automaton; no drone swarm or grid links necessary.  
**Automatic class trait:** **Command Discipline** (rank I at Level 15, enhanced at 30, awakened at 45; effect only when this class is active).

**Automatic trait ranks:** **Level 15:** Well-aimed automaton orders get slightly faster recovery. **Level 30:** Completing three valid queued orders triggers a bounded shockwave. **Level 45:** The final successful order per construct summons one small farewell blast.

| Gate | New ability | Action and independent gameplay | Initial tuning target (proposal) | Exclusive fork A / B |
|---|---|---|---|---|
| Lv15 active | **Titan Hand** | Summon the temporary automaton hand into a marked spot, punching down to break enemy formations. | 7–10s cooldown; cannot grapple or relocate bosses. | fast strike / wide shock ring |
| Lv15 active | **Anchor Walk** | Order the automaton to march along a short route while smashing lesser enemies it contacts; it respects obstacles. | 10–12s cooldown; single automaton footprint; auto path fallback. | high-speed march / armored slow march |
| Lv30 active | **Chain Hoist** | Issue a crane command that suspends small mobs briefly then slams them into a marked spot; bosses instead receive impact damage. | 12–15s cooldown; strict target cap. | multi-target sweep / focused single slam |
| Lv30 active | **Break Order** | Queue a three-hit drill/punch/hammer sequence; each stage is manually redirectable once before impact. | 14–17s cooldown; limited queue; no endless AI. | fast triple order / slower high-damage combo |
| Lv45 [R] ultimate | **Colossus Directive** | Ultimate: assemble one giant walking siege automaton for a brief attack sequence that culminates in a staged fist impact. | Charge-gated; one controllable construct, timed despawn. | roving assault / stationary barrage |

**Legacy skill rule:** Existing Vespera attacks remain in the character-wide library; class change cannot delete Tesla Pylon, Seeker Swarm, Phase Blink, or Orbital Ion Singularity. There is **no special cross-class combo effect** for slotting them alongside new abilities.

#### E3. STORM CARTOGRAPHER — Battlefield weather mage who sketches pressure fronts and summons sky lightning; does not use Arc-Drones, pylon fences, or spatial drone grids.

**Starting stance:** Conductive weather baton, long-range bolt marks and cloud rings.  
**New class-only mechanic:** Storm Lines — map two moving atmospheric paths; crossings create local lightning only from this class’s own nodes.  
**Automatic class trait:** **Atmospheric Mapping** (rank I at Level 15, enhanced at 30, awakened at 45; effect only when this class is active).

**Automatic trait ranks:** **Level 15:** Storm routes show clear attack-edge previews. **Level 30:** A correctly angled storm line improves its own final thunder pulse. **Level 45:** One well-routed final storm line adds a small pillar, subject to cooldown.

| Gate | New ability | Action and independent gameplay | Initial tuning target (proposal) | Exclusive fork A / B |
|---|---|---|---|---|
| Lv15 active | **Cloud Etching** | Draw a moving cloud segment that rains tiny electrical strikes in its path over time. | 7–10s cooldown; two segments max. | long thin front / short dense front |
| Lv15 active | **Pressure Drop** | Create a localized downdraft that gathers lesser enemies toward a safe center before a delayed thunder crack. | 9–12s cooldown; no forced boss displacement. | stronger small-mob drift / faster thunder |
| Lv30 active | **Isobar Sweep** | Shift an existing cloud route by drawing a new vector, turning a wide sweep into a precise angled strike. | 10–13s cooldown; independent of pylon skills. | wide sweep / focused line |
| Lv30 active | **Eye of Storm** | Create a circular storm with a relatively quiet center; outer rotating wall damages and slows enemies crossing it. | 14–18s cooldown; arena navigation never sealed. | larger outer radius / higher wall damage |
| Lv45 [R] ultimate | **Worldstorm Atlas** | Ultimate: a giant storm map overlays the field; several drawn pressure bands pulse with lightning before a single pillar-cluster climax. | Charge-gated; impact warnings, no auto-win. | multi-band coverage / compact pillar storm |

**Legacy skill rule:** Existing Vespera attacks remain in the character-wide library; class change cannot delete Tesla Pylon, Seeker Swarm, Phase Blink, or Orbital Ion Singularity. There is **no special cross-class combo effect** for slotting them alongside new abilities.

## 4. Class trait and permanent intrinsic trait progression

**Important:** A character's innate passive evolves **automatically** at levels 15, 30 and 45. This is distinct from existing purchasable passives (`Thick Skin`, `Deep Pockets`, etc.), which may still use skill points.

| Character | Level 1 starting intrinsic | Level 15 auto evolution | Level 30 auto evolution | Level 45 auto evolution |
|---|---|---|---|---|
| **Sena** | **Fighting Instinct:** consecutive meaningful attacks improve engagement recovery slightly. | First clean hit after evasion gets a modest bonus. | Better recovery when alternating offense and evasion; shared cap to prevent loops. | One bounded perfect-execution payoff after a sequence of varied actions. |
| **Rook** | **Field Awareness:** brief warning on incoming ranged threats. | First targeted attack against a previously unseen enemy is more accurate. | Weak-point recognition persists briefly after relocation. | A bounded precision follow-up after a true perfect setup. |
| **Ines** | **Flux Sense:** magnetic attacks reveal nearby interactable metal hazards/targets. | Offensive magnetic attacks build a small universal damage charge. | Successful timed polarity, compression or storm sequences improve burst slightly. | One bounded resonance detonation after a skilled chain, regardless of current Ines class. |
| **Kaelen** | **Pressure Instinct (proposed):** intuitive thermal timing improves warning/readability of his own active effects; existing Boiler Pressure rules unchanged. | Successfully timed attacks briefly sharpen damage window; no passive pressure exploit. | Improved control of new class effects after correctly timed actions, independent of currently active class. | One bounded character-wide execution payoff; original 75/100% pressure bonuses still work only when legitimately earned. |
| **Vespera** | **Circuit Intuition (proposed):** briefly indicates target priority and active-device range; existing drones still follow original limits. | Timed hits improve next independent strike slightly. | Better dodge/positioning feedback on successful attack sequences. | One bounded execution payoff with internal cooldown; no free autonomous drone multiplication. |

The above **intrinsic trait concepts are NEW proposals**; the current project has class mechanics and manually purchased passive skills, not these exact named auto-evolving traits. They are compatible with each specialization and do not redefine Ines as support.

**Class traits** listed in each branch also evolve at **character** levels 15/30/45, but only affect the **equipped class**. Do not erase accumulated class-specific unlocks when switching. **No separate class-level reset is allowed.**

### How to prevent passive stacking exploits and cross-class combos

- Automatic intrinsic perks are active once, not one copy per learned class.
- Off-class equipped skills work normally but do **not** gain passive benefits from an inactive class trait.
- Limit free casts, cooldown refunds, and extra-hit chains by explicit per-proc cooldowns and target ceilings.
- A skill can carry one main mutation and one minor modifier; mutually exclusive branches are explicit choices, not hidden restrictions.

## 5. Branching specialization tree — REQUIRED (UI and rules)

This system is **not** a purely linear list. Each of the fifteen proposed specializations has a visible, connected **branching tree** with clear prerequisites, two mutually exclusive behavior options on a fork, respec, and character-level gates. The game should keep a class library of all unlocked skills; tree choices adjust individual abilities, **not combinations between skills of different classes**.

```text
                          [CLASS UNLOCK • CHARACTER LV 15]
                                       |
                    +------------------+------------------+
                    |                                     |
            [ACTIVE A UNLOCK]                     [ACTIVE B UNLOCK]
                    |                                     |
              [FORK A • 1 SP]                        [FORK B • 1 SP]
               /            \                       /            \
          [VARIANT A1]   [VARIANT A2]         [VARIANT B1]  [VARIANT B2]
                    \                                    /
                     +-------[MASTERY • LV 30]-------------+
                                       |
                          [ACTIVE C]        [ACTIVE D]
                                |               |
                            [FORK C]        [FORK D]
                                       |
                             [AWAKENING • LV 45]
                                       |
                             [SIGNATURE ULTIMATE]
                                       |
                        [ULTIMATE FORK: AREA / FOCUS]
```

**Tree rules:** Level 15 grants both entry skills for the chosen unlocked class; level 30 grants its two advanced skills; level 45 grants its signature ultimate when its class is unlocked. Fork purchases cost skill points in the proposal. Each fork allows exactly **one** selected variant, and each variant modifies only its associated skill or a trait owned by the active class. Skill points, purchased fork choices and mastery are remembered by character and class. Reaching a milestone on one class doesn't remove access to the other two classes after they are unlocked. Changing active class never changes character level or XP.

**Branch respec** returns spent optional tree points, removes purchased variant effects, and leaves permanently unlocked abilities, class records, XP, character level, automatic traits, and all loadout presets intact. Any preset referencing an unlocked active skill must continue to work after respec. There is **no cross-class combo tree, link, chain multiplier, fused ability, or interaction node**.

The companion five-character standalone HTML mockup delivered with this `.md` implements a functional instance of the tree, including choosing and refunding variant nodes.

## 6. Fifteen sample loadouts proving old skills remain selectable

| Character/class | Example active loadout (4 slots) | Ultimate choice | Main idea |
|---|---|---|---|
| Sena / Phantom Edge | Shadow Pin · False Exit · Rail Parry *(old)* · Seam Cut | Midnight Corridor | Counter and blink assassin. |
| Sena / Rift Breaker | Pile Fist · Faultline Stomp · Lunge *(old)* · Seismic Guard | Seven Cuts *(old)* | Heavy area stagger with a mobility escape and a legacy finisher. |
| Sena / Pulse Dancer | Snapstep · Conductive Loop · Ground Break *(old)* · Chain Waltz | Perfect Frequency | Beat-timed positional damage. |
| Rook / Rail Hunter | Harpoon Line · Sightline Break · Kickback *(old)* · Pinpoint Verdict | Dead Meridian | Long-angle precision with a familiar escape tool. |
| Rook / Siege Gunner | Mortar Beacon · Bunker Roller · Rapid Fire *(old)* · Salvo Grid | Iron Weather | Bombardment + mobile fire between shell calls. |
| Rook / Circuit Warden | Arc Pylon · Scrambler Disk · Rivet Spread *(old)* · Overload Command | Blackout Cascade | Device corridors and burst detonations. |
| Ines / Magnet Crusher | Crush Point · Iron Coffin · Pull *(old)* · Mass Driver | Singularity Press | Trap a zone, compress, and fire a massive projectile. |
| Ines / Scrapstorm | Razor Monsoon · Shiver Step · Lump *(old)* · Crosswind | Thousand-Knife Typhoon | Moving damage fronts plus an emergency old-style burst. |
| Ines / Polarity Breaker | Northbound · Reverse Charge · Spin Up *(old)* · Collision Course | Zero-Point Reversal | High-mobility collision duelist with optional legacy defense. |
| Kaelen / Cinder Corsair | Jet Sickle · Thruster Feint · Naphtha Jet *(old)* · Skyhook Dive | Crimson Flyover | Jetting skirmisher with legacy charge. |
| Kaelen / Crucible Architect | Mold Stamp · Pourline · Caustic Mortar *(old)* · Foundry Press | Cathedral of Iron | Positioning + heavy forged impacts; original mortar remains independent. |
| Kaelen / Cryo Saboteur | Cold Snap Canister · Fracture Wire · Vent Supernova *(old)* · Zero-Kelvin Flask | Whiteout Rupture | Endothermic demolition; legacy vent spends real Boiler Pressure. |
| Vespera / Volt Reaver | Arc Rend · Breaker Step · Phase Blink *(old)* · Countercoil | Cataclysm Edge | Lightning melee, legacy blink utility. |
| Vespera / Iron Puppeteer | Titan Hand · Anchor Walk · Tesla Pylon *(old)* · Chain Hoist | Colossus Directive | One controllable heavy automaton; original pylon deployable independently. |
| Vespera / Storm Cartographer | Cloud Etching · Pressure Drop · Seeker Swarm *(old)* · Isobar Sweep | Worldstorm Atlas | Storm mapping with optional old micro-drone attack. |

**These are examples, not fixed or recommended mandatory slots.** A player can equip four old learned skills if four are available, four new class skills, or any mixture. No weapon or resource lockout should break old skills.

## 7. Special game-design interactions to prototype

### Bosses

- **Foreman:** Skills may kill ritual marchers quickly, but the ritual deliberately remains extremely difficult. His ritual summons are exempt from the original 64-slot/40-active normal caps, and all scheduled waves spawn. The floor-marked ritual zone suppresses **mob fusion** inside its full spawn ring; it does **not** automatically suppress player skills. Boss survival/revival still uses the existing arrival threshold and 30-second timer. Do not introduce skills that automatically delete every marcher or bypass the ritual.
- **Big Axle:** All three characters need a way to damage the exposed engine core. Teleports, tethers, pulls or compression may deal damage/stagger but must not skip its mandatory core-break window.
- **Mother Sump:** Every archetype needs an interrupt route through damage, stagger or killing prey. No new class should accidentally make the feeding gate unbeatable.
- **The Long Dry:** Exposed armor segments stay vulnerable to all classes. Blink paths, harpoon bounces, storms and magnetic fields need reliable targeting when the true body is exposed.

### Kaelen and Vespera boss-contract additions

- **Kaelen:** Thermobaric knockback, forge presses and frost effects can damage Big Axle's exposed engine and Mother Sump's channel, but may **not** bypass core-break/starvation gates. The existing 75% and 100% Boiler Pressure events still use their normal thresholds; off-class Vent Supernova consumes legitimately accumulated pressure.
- **Vespera:** Original Arc-Drone Swarm, Tesla Pylons, Seeker Swarm, and all new giant-automaton/weather effects must target exposed Long Dry segments correctly, **not** attack decoys as if they were true-body hit confirmations. All deployable counts and laser links have hard caps.
- **Foreman's ritual:** Neither Kaelen's large fire/cryo AoE nor Vespera's automatic targeting may trivially erase the 150 scheduled marchers with unavoidable permanent full-ring coverage. Preserve extreme difficulty while keeping valid hits possible; ritual mob fusion remains forbidden inside the clearly marked ring.
- **No summon abuse:** 3–5 baseline Vespera orbiters, 2–3 original pylons, 5–8 micro-drones, and class-change constructs each obey their existing or proposed counts and cleanup rules. A class swap cannot leave orphan drones or duplicated skills running indefinitely.

### World / obstacle constraints

- Anchors, ricochets, circuits, projectiles and travel rails may use scenery but must also work in open terrain or have a fallback. Obstacles were proposed as **non-destructible**; class explosions must not silently break them.
- Never permit a deployable, tether, magnetic wall or artillery object to permanently close the only traversable route.
- All damaging areas need clear pixel-readable warning edges at the game's 480×270 presentation target.

## 8. Feasibility and performance: build the fantasy without breaking the game

The fifteen sets introduce more gameplay systems than a simple node-stat skill tree. Build reusable systems rather than fifteen hardcoded character switches:

| Shared system | Users | Technical contract |
|---|---|---|
| Targeted ground zone + telegraph | Faultline, mortar, compression, storms, forge molds, coolant, cloud paths | Data-controlled radius, duration, damage pulse, hazard colors. |
| Path / spline attack | Echo cuts, harpoons, magnetic rail | Authorable paths; collision verified on server/game tick, not only visual FX. |
| Deployable instance | Decoy Echo, pylon, roller, optics beacon, single automaton, mold stamp | Owner, max count, expiry, legal placement and cleanup on reload. |
| Resource meter/charge | Echoes, Pressure, Beat, Bearings, Heat, Circuits, Compression, Storm Fronts, Polarity, Burn Routes, Mold Charges, Brittle Marks, Charge Edges, Command Queue, Storm Lines | Independent optional class meter; foreign-class skills still cast with baseline stamina/CD. |
| Skill mutation | Every tree | Data-driven effect graphs: one skill ID, selected mutator IDs, no copy-pasted skill implementation. |
| Drag/drop action binding | Every character | Stable unlocked skill IDs, 4 active slots + ultimate, presets, accessibility equivalent. |
| Auto trait evaluator | Every character | One-time milestones and passive modifiers, save-safe and stat recalculation-safe. |

**Important implementation honesty:** The older JS checkout inspected uses a Level-30 ceiling, fixed starting skill bindings, and an older promotion tree. Kaelen/Vespera were provided by the owner as already added; this inspected checkout did not surface those entries. None of the level-45 features, new abilities, or freeform class skills are verified as implemented. This file is the design target only.

### Suggested development phases

1. **Ownership/schema first:** one retained character level/XP, per-character unlocked skills, active class, slot IDs, class-specific unlocks, milestone-trait state; save migration/tests. Class swaps must never mutate character level or XP.
2. **Loadout UI:** functional drag/swap/keyboard/controller binding with old skills and presets. Ensure previously learned off-class skills can be cast before adding new skill sets.
3. **Class-change milestone:** 15/30/45 progression, level-cap extension, three choices each, class swaps and class-trait evolution.
4. **Combat primitives:** reusable zones, anchors, links, telegraphs, resource meter, off-class cast fallback.
5. **Vertical slice:** implement one radically different class (e.g. Rook Siege Gunner or Sena Phantom Edge) with full animation and collision; test independent legacy-skill usability.
6. **Remaining 14 classes:** build from shared primitives but keep distinct default stances and progression fantasies.
7. **Boss + performance stress:** extreme Foreman ritual, fusion no-go circle, multiple overlapping hazards, 480×270 readability, save/reload and class swap exploit tests.

## 8A. Required interactive UI — not optional or decorative

**Deliverable:** `HellsAdvent_Class_Skill_Tree_UI_Prototype_v4.html` is a standalone interactive browser mockup included alongside this plan. It is **not** an implementation inside the user's game; it demonstrates how the UI should function. It supports character/class selection, retained character level, library-to-slot drag/drop (plus tap-to-assign), 4 customizable active slots, one ultimate slot, free preset save/load, class-local tree forks and a working respec/reset. The ultimate slot accepts only unlocked ultimates. The classes/skills shown are proposals consistent with this brainstorm; no gameplay damage simulation is claimed.

### 8A.1 Layout at 480 × 270 game viewport

Use one full-screen modal layered over paused game rendering, with scaling/panning or tabs as necessary. Do not attempt to put a giant skill tree, a full library and giant prose tooltips in the 480×270 *combat HUD*. Detailed management belongs in a dedicated menu where large content can scroll and game inputs are suspended.

```text
 +---------------------------------------------------------------------+
 | HELLSADVENT  /  SKILL ARCHIVE     SENA LV 35 (XP RETAINED)       [X]|
 | Class: [Phantom Edge v]     [CLASS] [LOADOUT] [SKILL TREE] [TRAITS]  |
 +------------------------+--------------------------------------------+
 | LEARNED SKILL LIBRARY  |   ACTIVE SKILL SLOTS    drag / tap to assign|
 | [All] [Old] [New]      |   [1] Shadow Pin    [2] Ground Break       |
 | > Shadow Pin [Lv15]    |   [3] False Exit   [4] Rail Parry         |
 | > False Exit [Lv15]    |   [R] Seven Cuts     (ultimate only)       |
 | > Ground Break [OLD]   |--------------------------------------------|
 | > Rail Parry [OLD]     |   PRESETS [Boss] [Mob Clear] [Explore]      |
 | > Seven Cuts [ULT]    |    [SAVE] [LOAD] [RENAME]   [RESET SLOTS]   |
 +------------------------+--------------------------------------------+
 | STATUS: NO CROSS-CLASS COMBOS. EACH ABILITY WORKS INDEPENDENTLY.     |
 +---------------------------------------------------------------------+
```

### 8A.2 Exact control behaviors

| Interaction | Required result | Edge case / error message |
|---|---|---|
| Drag skill icon from library onto a valid slot | Replace assigned skill, keep skill owned; any previous assignment returns to library | Reject an ultimate dropped on active slot and vice versa |
| Drag one slotted active skill onto another active slot | Swap those two skills, do not duplicate/delete either | No silent overwrite if a swap is intended |
| Select skill, select slot (keyboard/controller/touch fallback) | Same binding behavior as drag/drop | Escape cancels selection |
| Choose another class | Retain level, XP, learned skill library, purchased ranks, intrinsic trait and presets | Never auto-replace current slots without explicit user choice |
| Save preset | Store class ID and five slot skill IDs, not references to node positions | Per-character names; at least three slots |
| Load preset | Set active class and five bindings, while retaining level and XP | Unavailable/unlearned skill ID is marked for repair, never silently replaced |
| Free respec | Refund purchased **optional tree-node points**; restore variant defaults | Does **not** delete earned skills, unlocks, levels, XP or automatic trait tiers |
| Select fork option | Invest a point in one of two class-local effects with prerequisite | Prevent selecting both without changing/refunding the first |
| Hover/focus skill | Inspect costs, cooldown, damage type, class-of-origin, and level gate | Accessible to keyboard/controller, not hover-only |
| Open traits tab | Display character-wide automatic trait and currently equipped class trait with 15/30/45 tier | Inactive class traits do not stack |
| Inspect locked skill | Show exact character-level gate / class requirement | No spend button on unowned node |

### 8A.3 Presets: free and persistent

- **Three free named presets minimum** per character: `Boss`, `Mob Clear`, `Explore`, plus rename if desired. No gold cost, no consumable cost, no cooldown for *editing while in a safe menu*.
- Snapshot consists of `{ characterId, classId, activeSkillIds[4], ultimateSkillId, inputBindings? }`; save by stable skill identifiers.
- Each preset can contain any **previously unlocked** active/ultimate belonging to the same character. Active class **does not** filter the learned library.
- Preset load restores exactly what the player saved; never forces current class's default skill set. If class is no longer valid due to migration, warn and preserve the old skill IDs for recovery.
- Class changes and preset loads are disabled during active combat/boss ritual if necessary for exploit safety; merely **viewing** tree/UI can be allowed separately.

### 8A.4 Respec without losing progress

- **Free respec:** can refund and reallocate optionally purchased passive/skill-tree points. Original baseline actives and class level-gate unlocks remain learned permanently.
- Permanently retain: `characterLevel`, `characterXp`, unlocked character classes, baseline skills/ultimates, milestone traits, acquired items, mastered class records, saved presets.
- Optional purchased fork effects may be disabled and points returned; cost and rank are recalculated once, not repeatedly on menu reopen. Respec cannot duplicate point currency through save/reload.
- Show comparison of refunded points and what will revert before confirmation. Provide `Cancel`; on confirmed respec restore node choices to unselected and refund spent node points. Avoid deleting an existing loadout if it references an owned baseline skill.

### 8A.5 All fifteen class-specific tree entry sets

| Class | Lv15 entry skills | Lv30 mastery skills | Lv45 ultimate | Fork brainstorming (class-local only) |
|---|---|---|---|---|
| **Phantom Edge** | Shadow Pin / False Exit | Seam Cut / Borrowed Second | Midnight Corridor | decoy survives longer or explodes instantly; blink causes bleed or stronger single-hit burst; Seam Cut slows crossings or deals greater damage to stationary targets.   |
| **Rift Breaker** | Pile Fist / Faultline Stomp | Anchor Grip / Seismic Guard | Worldsplitter | narrow high-stagger crack or wide lower-damage fan; grab single-target bonus or thrown-enemy collision damage; brace longer or release stronger.   |
| **Pulse Dancer** | Snapstep / Conductive Loop | Backbeat / Chain Waltz | Perfect Frequency | more forgiving beat windows or higher perfect-beat reward; Loop follows Sena or stays deployed; Waltz branches toward enemies or uses player-directed waypoints.   |
| **Rail Hunter** | Harpoon Line / Sightline Break | Ricochet Survey / Pinpoint Verdict | Dead Meridian | anchor repositioning or high-impact pins; tag single-target damage or secondary pierce; narrower sightline damage or easier aim.   |
| **Siege Gunner** | Mortar Beacon / Bunker Roller | Salvo Grid / Breakwater Shot | Iron Weather | shorter shell delay or larger warning/damage radius; moving roller or stationary mine; wide grid or concentrated bombardment.   |
| **Circuit Warden** | Arc Pylon / Scrambler Disk | Relay Swap / Overload Command | Blackout Cascade | chain depth or individual pylon strength; mobile disk or stationary disruption zone; automatic targeting or manual priority target.   |
| **Magnet Crusher** | Crush Point / Iron Coffin | Mass Driver / Pressure Inversion | Singularity Press | tighter high-damage collapse or wider crowd hit; line-driver projectile or ground-impact wreck; inward pull pressure or outward armor disruption.   |
| **Scrapstorm** | Razor Monsoon / Shiver Step | Crosswind / Shard Cathedral | Thousand-Knife Typhoon | slow persistent storm or fast hard-hitting front; player-following shard columns or rooted placement; many light hits or fewer armor-piercing hits.   |
| **Polarity Breaker** | Northbound / Reverse Charge | Collision Course / Mag-Rail Surf | Zero-Point Reversal | collision damage or longer repulsion; long linear surf or sharp steerable rail; more polarity targets or stronger single-target pressure.   |
| **Cinder Corsair** | Jet Sickle / Thruster Feint | Skyhook Dive / Razor Afterburn | Crimson Flyover | wide arc / concentrated returning hit; larger ring / focused core impact. |
| **Crucible Architect** | Mold Stamp / Pourline | Foundry Press / Quench Fracture | Cathedral of Iron | single tall spike / three smaller spikes; faster strike / larger delayed impact. |
| **Cryo Saboteur** | Cold Snap Canister / Fracture Wire | Thermocline Kick / Zero-Kelvin Flask | Whiteout Rupture | long slow duration / stronger impact damage; longer movement / harder endpoint detonation. |
| **Volt Reaver** | Arc Rend / Breaker Step | Countercoil / Thunder Guillotine | Cataclysm Edge | wide first arc / powerful second cut; longer parry window / bigger retaliatory blast. |
| **Iron Puppeteer** | Titan Hand / Anchor Walk | Chain Hoist / Break Order | Colossus Directive | fast strike / wide shock ring; multi-target sweep / focused single slam. |
| **Storm Cartographer** | Cloud Etching / Pressure Drop | Isobar Sweep / Eye of Storm | Worldstorm Atlas | long thin front / short dense front; wide sweep / focused line. |

### 8A.6 Branching tree UI behavior

```text
 CLASS TREE        [Phantom Edge]  LEVEL 35        [RESPEC (FREE)]
                         CLASS Lv15 [OWNED]
                              |
                   /--------------------\
         Shadow Pin [OWNED]          False Exit [OWNED]
             /        \                  /          \
       Bleed Pin    Burst Pin        Lasting Echo  Blast Echo
       [SELECTED]     [0/1]          [0/1]       [0/1]
                   \                    /
                     [LV30 MASTERY OWNED]
                   /                    \
        Seam Cut [OWNED]         Borrowed Second [OWNED]
              |                       |
        Slow Crossing OR         Safer Rewind OR
        Breaker Cut             Stronger Trail
                              |
                   [LV45 AWAKENING LOCKED]
                              |
                    Midnight Corridor [LOCKED]
```

Node states are `locked`, `available`, `selected`, and `purchased`; prerequisites, spent SP and refund consequences are visible. A tree is **branching**, but its choices **only mutate that class's own ability**. No cross-class combo perks exist.

## 8B. Boss fairness and functionality tests (mandatory)

All **fifteen** specializations must have a feasible kill path for all four Floor 1 bosses, alone and with a mixed old/new skill loadout. This does **not** mean equal time-to-kill or identical advantage, nor should it reduce Foreman's deliberately extreme challenge. Fairness means no mechanical soft-lock due solely to class kit.

| Boss | Class-agnostic correctness requirements | Rejection criteria |
|---|---|---|
| **Big Axle** | Every class and allowed loadout can target/damage the engine core in the exposure window and eventually destroy it. | Skills cannot hit the required core because of stance, damage-type gate or projectile collision. |
| **Mother Sump** | Every class has a viable damage/stagger/prey-kill route to interrupt feeding and trigger starvation. | Current class has zero valid interaction with the feed interrupt gate. |
| **The Long Dry** | Any character/class can damage the vulnerable exposed armor; targeting and hit confirmation distinguish decoys. | Only one class can break a mandatory armor segment, or teleports skip required gates. |
| **The Foreman** | All ritual waves spawn regardless of the ordinary 64-slot/40-active limits; AOE blocks enemy fusion through entire ritual ring. Player skills can kill marchers and eventually defeat Iron Foreman if revived. | Skill auto-clears all waves for free; ritual waves skipped due to capacity; player class bypasses intended revival gate. |

**Fifteen-by-four matrix:** Test 60 combinations with basic starter loadouts, all-class loadouts, and preset-switched builds; test saved-state reloads and death during combat. Verify no unavoidable class-specific invulnerability, no softlocks, and no bypass of boss mandatory phases. Keep class-induced displacement disabled or converted to stagger on bosses where needed. Teleport paths never clip non-destructible obstacles or leave the arena. Use readable telegraphs at 480×270 and stress the unlimited ritual-spawn exemption for performance.

## 8C. NON-NEGOTIABLE: No cross-class combo mechanics

**Allowed:** Player can manually equip, cast and rearrange old and new abilities from the *same character* irrespective of currently equipped class. Each ability calculates its own effects normally. Existing damage/status effects apply as normally defined by that skill.

**Forbidden:** No class-A skill gives extra damage, reset, activation, evolution or new effect *because class-B skill was cast*. No special linked skill pair, fused skill, cross-class perk, unlock condition, combo gauge, cross-class chain node or enhanced proc. Automatic class traits affect only the currently active class's own mechanics; intrinsic traits are character-wide. This is not a prohibition on the game's ordinary basic-attack combo for Sena or class-local sequences—only on **cross-class combination mechanics**.

**Test:** For every ordered pair of abilities from different class origins, casting B after A must not produce an extra effect whose sole trigger is that A and B come from different classes. Compare damage/FX with isolated casts, allowing normal independent status/damage rules but never a bespoke synergy bonus.

## 8D. Already-added character preservation / actual implementation boundary

**Owner-confirmed existing:** Kaelen Vos and Vespera Locke's names, starting roles, signature mechanics, controls, initial three skills, and flashy ultimates—including their existing ultimate branch labels. These details are *not* part of the proposed class-change implementation queue.

**New brainstorm only:** Cinder Corsair, Crucible Architect, Cryo Saboteur, Volt Reaver, Iron Puppeteer, Storm Cartographer; their new active skills/ultimates/traits, Level-15/30/45 milestone changes, 4+R loadout, new progression storage, class-change animations, and all class-specific tree forks. All proposed cooldowns/magnitudes are tuning placeholders, not claims about implemented balance.

**Implementation note:** The shared checkout inspected in the prior turn did not show Kaelen/Vespera definitions in its `src/` files. The user's provided current-character specifications take precedence; before coding in a future task, locate the latest authoritative project branch and compare the actual files rather than quietly rebuilding or overwriting these characters.

**Existing ultimate branches vs specialization branches:** `Sunfall Cataclysm → {Tectonic Kiln, Blight Hurricane}` and `Orbital Ion Singularity → {Valkyrie Swarm Protocol, Zenith Thunderhead}` remain *their originals*. New 15/30/45 class branches and optional skill-node forks are independent. Equipping an original ultimate on a new class does not invent a cross-class combo.

## 9. Finalized owner approvals & design rulings

1. **Class Unlock Policy:**  
   **APPROVED: Progressive Multi-Class Unlock.** Upon reaching Character Level 15, the player chooses their first specialization. The other two remain visible in the archive and can be unlocked at Harlow's register or via region mastery, without resetting or reducing character level, XP, or existing skill ownership.
2. **Basic Attack Stance Flexibility:**  
   **APPROVED: Selectable Stances.** The new class provides a distinct weapon stance/basic attack by default, but players may preview and toggle between their current class stance and legacy weapon stance outside combat.
3. **Universal Ultimate Slot [R]:**  
   **APPROVED: 1 Configurable Ultimate Slot.** The player equips exactly one learned ultimate in slot [R]. Any ultimate unlocked across learned classes (or base kit) for that character may be slotted and cast using the unified ultimate meter.
4. **Class & Loadout Switching Safety:**  
   **APPROVED: Outside Combat & At Kettle.** Full class switching is available at Harlow in Kettle or safely outside hostile engagement. Loadout preset swapping is allowed outside combat. During active boss rituals or combat encounters, loadout changes are locked to prevent exploit switching.
5. **Passive Node Partitioning:**  
   **APPROVED: Class-Local Branch Forks & Global Intrinsics.** Intrinsic traits are character-wide and evolve automatically. Branching specialization tree forks are strictly class-local to that specific ability and do not cross-pollinate. Universal passive upgrades continue to apply globally.
6. **Level 45 Awakening & Cap Extension:**  
   **APPROVED: Extended Character Cap (50).** The level cap is extended to 50 with explicit milestones at 15 (First Class Change), 30 (Advanced Mastery), and 45 (Class Awakening). Existing progression and save files migrate cleanly.

---

## 10. Non-negotiables carried from the discussion

- **Character level and XP remain exactly the same when changing class. Only the selected class, its stance/traits, and optionally its active loadout change.**
- **No per-class level reset or leveling from 1 again.** Level 15/30/45 milestones use the single retained character level.

- **Levels 15, 30, 45**, *not* the existing Level 8/16 promotion scheme.
- **Three different class-change options per character**, not three compulsory sequential forms.
- **Completely different skill kits are allowed.** No requirement to base new attacks on existing skills, weapons or resource mechanics.
- **Player-controlled skill slots and retention of old skills**, including after class changes.
- **Automatic trait evolution**, separate from optional/manual tree choices.
- **Ines remains an offensive Magnetist; no healer/support reclassification.**
- **Kaelen and Vespera are EXISTING characters by owner confirmation**; only their three proposed class changes are new design ideas. Do not replace their provided starting skills or existing ultimate branches.
- **NO CROSS-CLASS COMBO SYSTEM.** Previously learned actives and ultimates can be equipped on later classes, but no combo bonuses, paired-skill effects, or cross-class synergy nodes exist.
- **Interactive UI is mandatory:** drag-and-drop slots + click-to-assign fallback, skill inventory, branching tree, free presets, and safe respec.
- **Main-boss fairness must be tested across all fifteen specializations** and with old-skill loadouts.
- **This document is brainstorm/design only. No project code edited.**
