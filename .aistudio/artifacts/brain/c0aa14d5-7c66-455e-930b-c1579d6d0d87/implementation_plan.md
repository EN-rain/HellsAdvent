# Full Dark Fantasy Overhaul, Chibi Character Base, 5-Act Story & Quests, Explorable RPG Town & 5-Floor Abyssal Tower

This plan transforms the entire game into a **Dark Fantasy Action RPG** (*HELLS ADVENT: ABYSSAL DESCENT*) using your uploaded **2-Head Chibi Pixel-Art Base (`/public/assets/aistudio/image_c95e226e.png`)** as the anatomical template for all playable characters and humanoid NPCs, paired with a **5-Act Main Story Campaign & 3-Tier Quest System**, an explorable **Dark Fantasy Town (Duskhollow)** with 6 interactive RPG buildings and the **Abyssal Tower** at the top-center, **5 hostile Tower Floors** with **3 sequential bosses per territory (12 bosses per floor, 60 total)** linked by an evolving **Boss Bloodline Family Tree**, **20% Cleansed-Territory NPCs**, **20% Corner Wandering Merchants** with a **30-second Sudden Defense Quest & Mob-Repellent Ward**, dual floor-completion portals, an **uncapped level system**, and a **10-Level Gap "Abyssal Enrage" Buff**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> This revised plan integrates your uploaded **Chibi Pixel-Art Base Template (`image_c95e226e.png`)** for all character sprites, animations, portraits, and NPCs alongside the full Dark Fantasy Story, Town, and 5-Floor Tower systems.

- **Confirmed Decision 1 — Chibi Pixel-Art Character Base (`image_c95e226e.png`) for All Classes & NPCs**:
  - Every playable hero, portrait, character-select card, and humanoid NPC (Town masters, Wandering Merchant, Cleansed-Territory pilgrims) is constructed directly on the **2-Head Chibi Pixel-Art Base** proportions from `/public/assets/aistudio/image_c95e226e.png`:
    - **Head & Face Anatomy**: Large rounded `16x14px` chibi cranium, prominent `3x5px` side ears, soft cheek blush pixels, warm dark-plum/obsidian 1px pixel outline (`#5D3A43` / `#2A1B24`), and expressive **`3x4px` vertical anime eyes** with thick upper lashes and a `1x2px` vertical highlight pixel.
    - **Torso & Limb Proportions**: Compact `10x11px` chibi torso, slightly splayed `3x6px` stubby arms, and short `4x5px` chibi legs with a crisp center separation and 1px outline.
    - **Layered Dark Fantasy Class Regalia**:
      1. **Sena Ibuki — Abyssal Blade Knight**: Crimson-auburn hair locks, glowing violet-cyan anime eyes, obsidian knight breastplate & frayed abyssal cape over the chibi base, wielding *Duskrend*.
      2. **Rook Matsuda — Inquisitor Marksman**: Ash-silver hair & witch-hunter cowl, amber-gold anime eyes, dark leather inquisitor coat over the chibi base, wielding *Hexbane Arbalest*.
      3. **Ines Calloway — Ossuary Necromancer**: Bone-white twin locks & skull hairpins, emerald-rose anime eyes, gothic necromancer vestments over the chibi base, wielding *Gravelord Scepter*.
      4. **Kaelen Vos — Hellfire Dragoon**: Fiery ember hair & dragon-horn circlet, molten-orange anime eyes, hellforged demonplate over the chibi base, wielding *Cinderlance*.
      5. **Vespera Locke — Eldritch Soulbinder**: Starlight-violet hair & arcane witch hat, astral-violet anime eyes, eldritch runic robes over the chibi base, with floating *Astral Grimoire*.
- **Confirmed Decision 2 — 5-Act Dark Fantasy Story Campaign & 3-Tier Quest System**:
  - **Overarching Story (*"The Eclipse of Duskhollow"*)**: Guided by **Chronicler Malakor**, you ascend the **Abyssal Spire** across 5 acts, severing the 4 immortal **Boss Bloodlines** (*Malgorth*, *Varkos*, *Hagra*, *Skarath*) across Main Story Quests, Town NPC Side Quests, and Emergent Sudden Quests (tracked on the HUD and in the **`[J]` Quest Journal**).
- **Confirmed Decision 3 — Explorable Dark Fantasy Town, Top-Center Tower & Emergent Field NPCs**:
  - **Duskhollow Town (`Floor 0`)**: Features **6 interactive RPG buildings** (*Runesmith Forge*, *Alchemist Apothecary*, *Hunters Guild & Bloodline Hall*, *Arcane Sanctum*, *Raven's Rest Tavern*, *Mystic Enchanter & Curio Broker*) and the **Abyssal Tower Gatehouse** at the **top-center**.
  - **Field Events (`Floors 1–5`)**: **20% Cleansed-Territory NPC** after defeating a territory's 3-boss chain, **20% Corner Wandering Merchant** with a **30s Sudden Defense Quest** that activates a **Mob-Repellent Sanctuary Ward** (or flees in a smoke bomb if defeated), and **Dual Floor-Clear Portals** (*Next Floor* + *Return to Town*).
- **Confirmed Decision 4 — 5 Dark Fantasy Floors, 60 Bloodline Bosses, Uncapped XP & 10-Level Gap Enrage**:
  - **Floors 1–5**: *Blighted Catacombs* (`Lv 1–10`), *Frostbound Crypt* (`Lv 11–20`), *Hellfire Abyss* (`Lv 21–30`), *Rotwood Mire* (`Lv 31–40`), and *Void Citadel* (`Lv 41–50`).
  - **Uncapped Levels + 10-Level Gap Enrage Buff**: Levels are uncapped (paced at ~10 levels/floor toward `Lv 100+` by future Floor 10), low-level kills suffer steep XP decay (`100%` down to `1%`), and enemies `10+` levels below the player gain the massive **`☠ ABYSS ENRAGED`** stat and speed buff.

---

### 1. Chibi Character Base & Dark Fantasy Class Design

```
┌────────────────────────────────────────────────────────────────────────────┐
│           2-HEAD CHIBI PIXEL-ART BASE ANATOMY (image_c95e226e.png)         │
├──────────────────────────────────┬─────────────────────────────────────────┤
│ BASE ANATOMY LAYER               │ DARK FANTASY CLASS & NPC OVERLAYS       │
├──────────────────────────────────┼─────────────────────────────────────────┤
│ • Head: 16×14px rounded cranium  │ • Modular Hair Back / Front / Bangs     │
│ • Ears: 3×5px prominent side ears│ • Headgear: Crowns, Cowls, Witch Hats   │
│ • Eyes: 3×4px vertical anime iris│ • Class Armor: Obsidian Plate, Robes,   │
│   with dark lash + 1×2px shine   │   Inquisitor Cloaks & Armor Tiers       │
│ • Blush: 2×1px soft cheek tint   │ • Animated 4-Dir Walk, Idle Bounce,     │
│ • Torso: 10×11px compact body    │   Dodge Roll & 3-Step Weapon Combo      │
│ • Arms: 3×6px splayed chibi arms │ • Applies to all 5 Playable Heroes +    │
│ • Legs: 4×5px stubby chibi legs  │   6 Town Masters + Wandering Merchant   │
└──────────────────────────────────┴─────────────────────────────────────────┘
```

---

### 2. Story Campaign, Town Layout & 5-Floor Progression

#### Narrative Progression Flow (Prologue + 5 Acts)
1. **Prologue: *The Ashen Oath* (Duskhollow Town · Lv 1)** — Speak with Chronicler Malakor at the Hunters Guild, equip your starting oath-arms at Vaelen's Forge, and enter the **Top-Center Abyssal Tower**.
2. **Act I: *Chains of the Ossuary* (Floor 1: Blighted Catacombs · Lv 1–10)** — Cleanse all 4 Catacomb territories (`Warden` $\rightarrow$ `Executioner` $\rightarrow$ `Overlord`) to spawn the **Floor 2 Ascent Portal** and **Duskhollow Town Portal**.
3. **Act II: *Rime of the Fallen* (Floor 2: Frostbound Crypt · Lv 11–20)** — Return to Town for Act II briefings and *Frost-Runed* gear, unlock your **Level 15 Specialization** at Archmage Solen's Arcane Sanctum, and defeat the 2nd-generation Frostbound Bloodlines.
4. **Act III: *Crucible of Damnation* (Floor 3: Hellfire Abyss · Lv 21–30)** — Brew Brimstone Wards at Sister Isolde's Apothecary, awaken your **Level 30 Transformed Ultimate**, and conquer the 3rd-generation Infernal Bloodlines.
5. **Act IV: *Roots of Contagion* (Floor 4: Rotwood Mire · Lv 31–40)** — Aid Vex and Isolde in purging the plague miasma threatening Duskhollow by severing the 4th-generation Pestilent Bloodlines.
6. **Act V: *Throne of the Eclipsed Star* (Floor 5: Void Citadel · Lv 41–50)** — Master your **Level 45 Tier 4 Ultimate**, forge *Void-Tempered Regalia*, and vanquish the 5th-generation Eternal Bloodline Sovereigns.

#### Duskhollow Town Layout (Safe Hub Map)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             DUSKHOLLOW TOWN                                │
│                                                                            │
│                     ╔════════════════════════════════╗                     │
│                     ║     ABYSSAL TOWER GATEHOUSE    ║                     │
│                     ║   (Top-Center Floor 1–5 Entry) ║                     │
│                     ╚═══════════════╤════════════════╝                     │
│                                     │                                      │
│   ┌──────────────────────┐          │          ┌──────────────────────┐    │
│   │   RUNESMITH FORGE    │          │          │ ALCHEMIST APOTHECARY │    │
│   │   & ARMORY (Vaelen)  │          │          │    (Sister Isolde)   │    │
│   └──────────────────────┘          │          └──────────────────────┘    │
│                                     │                                      │
│   ┌──────────────────────┐    ╔═════╧═════╗    ┌──────────────────────┐    │
│   │   HUNTERS GUILD &    │────╢ TOWN WELL ║────│    ARCANE SANCTUM    │    │
│   │ BLOODLINE HALL (Mal) │    ║  & PLAZA  ║    │  & GRIMOIRE (Solen)  │    │
│   └──────────────────────┘    ╚═════╤═════╝    └──────────────────────┘    │
│                                     │                                      │
│   ┌──────────────────────┐          │          ┌──────────────────────┐    │
│   │  RAVEN'S REST TAVERN │          │          │ MYSTIC ENCHANTER &   │    │
│   │  & INN (Meal Buffs)  │          │          │ CURIO GAMBLER (Vex)  │    │
│   └──────────────────────┘          ▼          └──────────────────────┘    │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Dark Fantasy Visual Identity & 5-Floor Palettes (60-30-10 Distribution)

| Location / Floor | Realm Name | Expected Band | 60% Dominant Ground / Canvas | 30% Structural Stone & Trim | 10% Arcane / Hazard Accent | Ambient Particle Weather |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Town Hub** | **Duskhollow Town** | `Safe Haven` | Cobblestone Slate (`#16141C`) | Timber & Iron (`#342D42`) | Lantern Gold (`#D4AF37`) | Warm Hearth Embers & Mist |
| **Floor 1** | **Blighted Catacombs** | `Lv 1–10` | Crypt Slate (`#121318`) | Ossuary Bone & Iron (`#3A3842`) | Soulfire Cyan (`#00F0FF`) | Grave Ash & Soul Wisps |
| **Floor 2** | **Frostbound Crypt** | `Lv 11–20` | Glacial Barrow (`#0D1822`) | Rime-Crusted Stone (`#2A465E`) | Pale Frostbite (`#7CE8FF`) | Blinding Hoarfrost & Ice Shards |
| **Floor 3** | **Hellfire Abyss** | `Lv 21–30` | Charred Basalt (`#1C0E0C`) | Demonforged Iron (`#4D2016`) | Hellfire Ember (`#FF5A26`) | Brimstone Cinders & Blood Sparks |
| **Floor 4** | **Rotwood Mire** | `Lv 31–40` | Putrid Fen (`#0E1D16`) | Blighted Timber (`#284E3C`) | Venomous Blight (`#C9F24B`) | Plague Spores & Swamp Miasma |
| **Floor 5** | **Void Citadel** | `Lv 41–50` | Eldritch Obsidian (`#110C1D`) | Starforged Brass (`#3E2E63`) | Astral Gold & Rift (`#FFC83D`) | Void Singularities & Starlight |

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Chibi Pixel-Art Sprite Generator (`Sprites.js`)**
  - *Chosen Approach*: Refactor the character sprite builder around a shared `drawChibiBase(grid, cx, cy, dir, anim, frameIdx, skinTone, eyeColor)` helper modeled directly on `/public/assets/aistudio/image_c95e226e.png` (big rounded head, side ears, 3x4 vertical anime eyes with highlight, splayed stubby arms, and compact legs), then layer class-specific hair, headgear, armor, capes, and weapons on top. Also display `/public/assets/aistudio/image_c95e226e.png` in the Sprite Gallery / Character Reference view.
  - *Why*: Ensures every playable class and NPC shares the exact cohesive, expressive chibi proportion and anime eye style from your reference image while supporting 4-directional movement, dodge rolls, and attack animations.

- **Decision 2: Wandering Merchant 30s Defense Sudden Quest & Mob-Repellent Stealth Ward**
  - *Chosen Approach*: Corner merchant spawns (`20%` per corner) trigger a `30s` wave defense when approached. Surviving activates `merchant.repellentActive = true`, projecting a `260px` ward where enemy AI cannot detect, target, or enter to attack the player or merchant, and unlocking Morwen's Black-Market Shop (`-35%` discount gear, Cursed Relics, XP/Gold Elixirs). If the merchant's HP reaches `0`, she vanishes in a smoke bomb.
  - *Why*: Turns exploring floor corners into a thrilling risk-reward event that creates a temporary safe oasis inside a dangerous dungeon floor.

- **Decision 3: Uncapped Level Progression + 10-Level Gap "Abyssal Enrage" Buff**
  - *Chosen Approach*:
    - Uncapped player levels (`levelCap = Infinity`) with reduced base XP and steep over-level XP decay (`100%` $\rightarrow$ `60%` $\rightarrow$ `30%` $\rightarrow$ `10%` $\rightarrow$ `1%`) calibrated for `~10 levels per floor` (`~Lv 50` at Floor 5, `~Lv 100+` by future Floor 10).
    - When `player.level - enemy.level >= 10`, enemies trigger **`☠ ABYSS ENRAGED`**, gaining massive stat multipliers (`HP`, `ATK`, `DEF`, `+25% Speed`) and a crimson curse aura.
  - *Why*: Keeps progression disciplined for future floors while preventing high-level players from trivially farming lower floors.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│     CHIBI SPRITE ENGINE, STORY, TOWN, 5-FLOOR TOWER & BLOODLINE SYSTEM     │
└──────────────────────────────────┬─────────────────────────────────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────────────┐
│  Chibi Base Pipeline │  │ Duskhollow Town &    │  │ Story, Quests & Enrage │
│  (image_c95e226e)    │  │ 5-Floor Abyssal Tower│  │ ────────────────────── │
│ ──────────────────── │  │ ──────────────────── │  │ • 5-Act Main Storyline │
│ • 16×14 Chibi Head   │  │ • Top-Center Tower   │  │ • Town NPC Side Quests │
│ • 3×4 Anime Eyes     │  │ • 6 RPG Buildings    │  │ • 20% Cleansed NPC     │
│ • Compact Body/Limbs │  │ • 60 Bloodline Bosses│  │ • 20% Corner Merchant  │
│ • Layered Dark       │  │   (3 Stages/Sector)  │  │   30s Sudden Quest &   │
│   Fantasy Class Gear │  │ • Dual Clear Portals │  │   Mob-Repellent Ward   │
└──────────┬───────────┘  └──────────┬───────────┘  └───────────┬────────────┘
           │                         │                          │
           └─────────────────────────┼──────────────────────────┘
                                     ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                  Gothic Dark Fantasy HUD, Menus & Displays                 │
│ ────────────────────────────────────────────────────────────────────────── │
│ • Reliquary HUD: Chibi Portrait, Blood HP, Soul Stamina & Quest Tracker    │
│ • [J] Quest Journal & Story Tome · [B] Boss Bloodline Family Tree Modal    │
│ • [K] Arcane Grimoire & Talent Tome · [I] Reliquary Gear & Runesmith Shop  │
│ • Town Building Modals & Wandering Merchant Black-Market Shop              │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Data Model & State
- **Chibi Sprite Builder (`src/game/Sprites.js`)**:
  - `drawChibiBodyBase(g, cx, topY, dir, anim, frameIdx, paletteOpts)`: Renders the exact silhouette, ear placement, blush, 3x4 anime eyes, and stubby limb animation frames matching `image_c95e226e.png`, used by all 5 playable classes and all Town/Field NPCs.
- **Location, Quest & Portal State (`WorldLedger`)**:
  - `currentFloor`: `0` (Duskhollow Town) or `1..5` (Abyssal Tower Floors 1–5).
  - `sectorProgress`: Tracks `stage` (`0 = Warden`, `1 = Executioner`, `2 = Overlord`, `3 = Cleansed`) for all 20 sectors across 5 floors.
  - `quests`: Tracks `currentAct (1..5)`, `mainQuestStep`, `sideQuests`, and `suddenQuest` (`30s` Wandering Merchant defense & `repellentActive` sanctuary zone).
