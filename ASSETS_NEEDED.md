# HELL'S ADVENT: ABYSSAL DESCENT — Reference-Guided GPT Image ("gpt2.5 image") Dark Fantasy Asset Bible (`ASSETS_NEEDED.md`)

> **IMPORTANT COPYRIGHT & REFERENCE NOTICE (`DONOTCOMPLETELYCOPY`)**:
> All files inside `/tempartreference(DONOTCOMPLETELYCOPY)/` are extracted *HoloCure - Save the Fans!* sprite sheets and asset packs (`holocure-asset-sources.csv`, 105 asset packs / 752 PNGs). They must **NEVER** be copied directly into the game or traced 1:1 as VTuber characters.
> Instead, attach the specified reference file(s) from `/tempartreference(DONOTCOMPLETELYCOPY)/` alongside `/public/assets/aistudio/image_c95e226e.png` (Chibi Base Body) into **GPT Image (`gpt-image-1` / GPT-2.5 Image)** as **structural, dimensional, grid-spacing, and pixel-cluster references**, while replacing 100% of the subject matter, costume design, weaponry, creature anatomy, and color palette with the pure **Gothic Dark Fantasy** aesthetic of **Hell's Advent: Abyssal Descent**.
>
> **CRITICAL DARK FANTASY VISUAL RULE**: Never reference or include any mechanical, sci-fi, modern, or post-apocalyptic wasteland elements (no cars, trucks, tires, tin cans, welding goggles, gas masks, rebar, vending machines, radar dishes, excavators, hydraulic pistons, or drones). Every creature, character, prop, and item must be depicted as **100% pure Gothic Dark Fantasy** (cursed black-iron armor, bleached ossuary bone, tattered inquisitor vestments, demonic horns, abyssal soulfire, necrotic mist, blood-stained runes, and eldritch reliquaries).
>
> **CRITICAL HIGH-RESOLUTION (~1.2K×1.2K) & APPARENT PIXEL-GRID VISION RULE**:
> Image generators (`gpt-image-1` / GPT-2.5 Image / Gemini Image Gen) natively generate high-resolution canvases (~`1024x1024` to `1536x1024` / ~`1.2Kx1.2K` resolution). **Never** tell the image generator that the output image size must literally be `64x64` (or `40x40`, `32x32`, etc.), and **never** force a raw destructive conversion/downscale to `64x64` that ruins the generated artwork. Instead, every sprite specification in this bible uses `64x64` (or `40x40`, `80x80`, `96x96`, `32x32`, etc.) **strictly as a visual pixel-density & proportion example ("looks like a 64x64 sprite as an example")** rendered at **full crisp high resolution (~1.2K×1.2K)** with chunky, clearly readable pixel clusters.

Drop raw generated high-resolution images into `/assets-src/raw/<id>.png` on a flat `#FF00FF` magenta background and run:
```bash
node tools/process-assets.mjs
```

---

## Part 1: Complete Analysis of `tempartreference(DONOTCOMPLETELYCOPY)` (All 105 Packs / 752 Files)

Every folder and sprite sheet in `tempartreference(DONOTCOMPLETELYCOPY)` has been analyzed for apparent pixel-cluster density, grid layout, frame cadence, and structural utility against **Hell's Advent**:

### 1.1 Playable Character Folders (38 Character Packs across 11 Folders)
| Reference Directory / File | Contents Per Character Pack (12–20 Files Each) | Structural & Apparent Pixel-Vision Analysis | Hell's Advent Dark Fantasy Mapping |
| :--- | :--- | :--- | :--- |
| **`Playable Characters - JP Gen 2/529969 - Nakiri Ayame/`** (`Ayame.png`, `_O1.png`, `_O2.png`, `_Port.png`, `Title_Ayame.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`, `_slash.png`, `_spiritslash.png`, `_spirit.png`, `_spiritfire.png`) | Base sprite strip (6 cols × 2 rows of cells that look like `64x64` pixel-grid density as an example: Row 1 = 4-frame Idle + 2 empty cells; Row 2 = 6-frame Run), 2 alternate outfit sheets, close-up eye/bust portrait, weapon & perk icons, multi-row crescent slash VFX. | **2-head-tall chibi proportions** (looks like a `~36–42px` tall sprite inside a `64x64`-style cell as an example of apparent pixel density), oversized expressive anime eyes, readable silhouette weapon held to the side/back. | **Primary Reference for `sena` (Sena Ibuki — Abyssal Blade Knight)**: *Duskrend* cursed soulfire katana, *Shadow Lunge*, *Abyssal Rupture*, *Soulfire Ward Parry*, *Seven Seals of Eclipse*, Oathsworn (*Rift-Cleaver* / *Aegis Knight*) & Archon (*Abyssal Executioner* / *Immortal Bulwark*) promotion skins. |
| **`Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/`** (`Calli.png`, `_O1..O4.png`, `_portrait.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`, `_slash.png`, `_slash2.png`, `_death.png`, `_special0.png`) | Character strip with wide weapon clearance cell grid, wide sweeping reaper-scythe slash arcs, skull/death mark VFX, dark gothic cloak silhouette. | Shows how oversized polearms/great-blades extend beyond the chibi torso without muddying the 2-head chibi body silhouette. | **Secondary Reference for `sena` (Reaper/Abyssal Executioner Mastery) & `flats_harvester` (Bone-Scythe Reaver Wraith) & House of Malgorth Executioners**. |
| **`Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/`** (`Zeta.png`, `_O1.png`, `_Port.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`, `_pistol.png`, `_BigBullet.png`, `_Flash.png`, `_stealthhit.png`) + **`530068 - Kureiji Ollie/`** (`Ollie_chargerifle1.png`, `Ollie_chargerifle2.png`) + **`204785 - Amelia Watson.png`** | Chibi ranged sprite sheet (6×2 grid looking like `64x64`-style cells as an example), separate weapon sprite, high-velocity piercing projectile VFX, muzzle flash, crosshair/target markers. | Demonstrates compact ranged crossbow carriage on a 2-head chibi body + crisp consecrated bolt projectile strips. | **Primary Reference for `rook` (Rook Matsuda — Witch-Hunter Marksman)**: *Hexbane Arbalest* (gothic vampire-hunter repeating crossbow), *Silver Stake Spread*, *Sanctified Kickback*, *Inquisitor Volley*, *Judgement Silver Spear*. |
| **`Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/`** (`Ina.png`, `_O1..O4.png`, `_Portrait.png`, `_Attack.png`, `_wheel.png`, `_convert.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`) + **`Playable Characters - JP Gen 2/529968 - Murasaki Shion/`** (`Shion.png`, `Shion_Circle.png`, `Shion_portal.png`, `Shion_MagicPulse.png`, `Shion_beam.png`) + **`529785 - Tsukumo Sana/`** (orbiting spheres) | Occult tome/scepter caster strips (6×2 grid), orbiting ring/wheel projectiles (`Ina__wheel.png`), dark ground sigils (`Shion_Circle.png`, `Shion_portal.png`), void tentacle/shard attacks (`Ina_Attack.png`). | Shows how orbiting bone-shards and dark ritual circles read cleanly around a `64x64`-style chibi caster cell as an example. | **Primary Reference for `ines` (Ines Calloway — Ossuary Necromancer & Blood-Lich)**: *Gravelord Skull-Scepter & Cursed Ossuary Reliquary*, *Grave-Grasp Pull*, *Whirling Bone-Vortex*, *Ossuary Monolith*, *Catacomb Bone-Tempest*. |
| **`Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png`** + **`Playable Characters - Force (JP Gen 4)/530030 - Kiryu Coco/`** (`Coco.png`, dragon fire) + **`Playable Characters - Fantasy (JP Gen 3)/530011 - Shirogane Noel/`** (`Noel.png`, heavy knight plate) + **`530072 - Kaela Kovalskia/`** (`Kaela_Anvil.png`, `Kaela_hammer.png`, `Kaela_RarestMetal.png`) | Complete master sheet with 4 outfits, wide fiery crescent sweeps (`Phoenix Sword` & `Awakened`), 36-frame giant firebird/drake transformation sequence, and 13-frame pillar explosion strip; plus heavy knight armor & forge hammers. | Masterclass reference for multi-frame hellfire sweeps, molten brimstone pillars, and draconic transformation ultimates. | **Primary Reference for `kaelen` (Kaelen Vos — Hellfire Dragoon & Wyrm-Knight)**: *Cinderlance & Brimstone Dragonplate*, *Brimstone Dragon-Rush*, *Hellfire Crucible Bomb*, *Infernal Wyrm-Roar*, *Avatar of the Hell-Drake*, plus **Master Smith Vaelen**. |
| **`Playable Characters - JP Gen 0/529818 - Roboco-san/`** (`Roboco.png`, `_battery.png`, `_chargedshot.png`, `_electric.png`, `_hispec.png`, `_shock.png`) + **`Playable Characters - Council (EN Gen 2)/529784 - Ouro Kronii/`** (`Kronii.png`, clock/halo blades) + **`529782 - IRyS/`** + **`530058 - Moona Hoshinova/`** | Autonomous floating familiar attachments, eldritch lightning arcs (`Roboco_electric.png`, `Roboco_shock.png`), floating seraphic halo rings, astral beams. | Ideal apparent pixel density and frame cycling for hovering cursed skull-familiars, summoned runic obelisks, and eldritch lightning arcs. | **Primary Reference for `vespera` (Vespera Locke — Eldritch Soulbinder & Astral Oracle)**: *Astral Grimoire & Seraphic Halo Familiars*, *Eldritch Obelisk*, *Wisp-Skull Swarm*, *Astral Rift-Step*, *Choir of Twelve Seraphim*. |
| **Remaining Playable Character Packs** (`263895 - Gawr Gura.png`, `204786 - Hakos Baelz.png`, `529781 - Ceres Fauna`, `529783 - Nanashi Mumei`, `529804 - Inugami Korone`, `529805 - Nekomata Okayu`, `529806 - Ookami Mio`, `529807 - Shirakami Fubuki`, `529816 - AZKi`, `529817 - Hoshimachi Suisei`, `529819 - Sakura Miko`, `529820 - Tokino Sora`, `529822 - Aki Rosenthal`, `529823 - Haachama`, `529824 - Natsuiro Matsuri`, `529825 - Yozora Mel`, `529967 - Minato Aqua`, `529970 - Oozora Subaru`, `529971 - Yuzuki Choco`, `530009 - Houshou Marine`, `530010 - Shiranui Flare`, `530012 - Usada Pekora`, `530026 - Amane Kanata`, `530028 - Himemori Luna`, `530032 - Tokoyami Towa`, `530035 - Tsunomaki Watame`, `530056 - Airani Iofifteen`, `530057 - Ayunda Risu`, `530067 - Anya Melfissa`, `530069 - Pavolia Reine`, `530073 - Kobo Kanaeru`) | Diverse weapon types (executioner axes, halberds, ritual daggers, twin blades, staves, chalices, scythes, bows, familiars), status icons, and elemental VFX (falling monoliths, spider webs, bats, demon horns, needles, wind slashes, storm clouds). | Provides 500+ specialized reference sprites for secondary Specialization skills (e.g., *Suisei_axswing.png* for heavy cleaves, *Anya_keris.png* for *Shadow Pin* ritual phase-daggers, *Choco_Supplies.png* for Apothecary blood-vials, *Mel_bat.png* for *Crypt Bat*, *Haachama_Spider.png* for *Ossuary Bone-Spider*). | **Used across all 15 Specializations, Status Effects, Town NPCs, and Common Enemies**. |

### 1.2 Enemies & Bosses Folders (10 Enemy Sheets + 11 Boss Sheets)
| Reference File (`tempartreference(DONOTCOMPLETELYCOPY)/...`) | Reference Sheet Layout | Visual & Structural Breakdown | Hell's Advent Dark Fantasy Mapping |
| :--- | :--- | :--- | :--- |
| **`Enemies/206132 - Myth Enemies (EN Gen1).png`** | Multi-row mob grid | Grid of 3-frame walk cycles for Chumbud (small hunched fiend silhouette), Dead Beat (skeleton warrior with bone club, crimson skeleton with dark-iron tower shield, hooded reaper wraith), Investigater (snouted hound silhouette), Takodachi (small blob/leech), KFP (small winged bird). | **Primary Reference for Common Enemies (looking like `40x40` pixel density as an example) & Shielded Elites**: Dead Beat -> `tin_rat` (*Shackled Crypt-Rat / Risen Bone-Scurrier*), Shielded Dead Beat -> `plate_marshal` (*Dread Cathedral Templar*), Investigater -> `dust_dog` (*Flayed Grave-Hound*), Takodachi -> `lye_leech` (*Bloated Blood-Leech*), KFP -> `cinder_crow` (*Ashen Carrion-Crow*). |
| **`Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png`** | Multi-row mob grid | Sanallites, Saplings, Hoomans (hooded cultists with ritual daggers/torches), Kronies, Bae Rats, Irystocrats. | **Reference for Cultist/Chanter Elites & Swarmers**: Hoomans -> `sump_cantor` (*Mire Hex-Chanter*), `lye_strider` (*Plague Censer-Stalker*), Bae Rats -> `tin_rat` (*Shackled Crypt-Rat*). |
| **`Enemies/206134 - Gamers Enemies (JP).png`** | Multi-row mob grid | Sukonbu, Koronesuki, Miofa (wolf-pack runners), Onigirya. | **Reference for `dust_dog` (*Flayed Grave-Hound*) & `bonepack_alpha` (*10x Cerberus Dire-Pack Fusion*)**. |
| **`Enemies/206135 - Enemies (JP Gen0).png`**, **`206136 - Enemies (JP Gen1).png`**, **`206137 - Enemies (JP Gen2).png`**, **`206138 - Area 15 (ID Gen1).png`**, **`206139 - Holoro (ID Gen2).png`**, **`206140 - HoloH3RO (ID Gen3).png`** | Multi-row mob grids | Compact 3-frame enemy strips showing clear silhouette differentiation across small flyers, armored walkers, floating wisps, and mimic props. | **Reference for `wire_kite` (*Stone Gargoyle Imp*), `sump_bat` (*Vampiric Crypt-Bat*), `rivet_tick` (*Skull-Carapace Bone-Spider*), `signal_mite` (*Will-o'-Wisp Soul-Lantern*), `silt_mimic` (*Ravenous Ossuary Coffer Mimic*)**. |
| **`Enemies/206549 - Enemies (Miscellaneous).png`** | Heavy enemy sheet | Larger heavy enemies, elite bruisers, and special hazard mobs. | **Reference for Elite Enemies (looking like `80x80` pixel density as an example): `cleaver_hauler` (*Catacomb Executioner Brute*), `switchback_driver` (*Nightmare Hell-Steed Outrider*), `bore_sentinel` (*Ash-Burrower Wyrmling*)**. |
| **`Bosses/206494 - Stage 1 Boss (Smol Ame).png`** & **`206496 - Stage 1 Hard Boss (Halloween Bae).png`** | Full boss sheets | Full boss animation sheets broken into labeled rows: Walk (4–8 frames), Jump/Slam/Backflip (16–24 frames), Telegraph windups, and Hurt/Defeat states. | **Reference for Boss Animation Phasing & Telegraph Pose Structure**. |
| **`Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`**, **`206497 - Stage 2 Mini Boss (Mikodanye).png`**, **`206501 - Stage 3 Mini Boss (Shubangelion).png`** | Colossus boss sheets | Towering colossus/behemoth bosses with breath attacks, heavy stomp, and articulated limbs. | **Primary Structural Reference for `the_foreman.png` (*High Executioner Malgorth — Ossuary Bone-Colossus*) & `the_long_dry.png` (*Catacomb Elder-Wyrm Skarath*)**. |
| **`Bosses/206500 - Stage 3 Boss (Hachama).png`**, **`206502 - Stage 3 Hard Boss (Myth or Treat).png`**, **`206504 - Stage 4 Boss (Area 15).png`**, **`206503 - Stage 4 Mini Boss (Udin).png`**, **`206498 - Stage 2 Boss (A-Chan).png`**, **`206499 - Stage 2 Hard Boss (Nodoka).png`** | Multi-entity boss sheets | Multi-entity boss formations, monstrous eldritch forms, and hovering commanders. | **Primary Structural Reference for `mother_sump.png` (*Bog-Matriarch Hagra — Charnel Swamp Hag-Queen*), `big_axle.png` (*Dread Charioteer Varkos — Bone-Chariot & Hell-Steeds*), and the 9 Dark-Fantasy Fusion Mid-Bosses**. |

### 1.3 Items, Weapons, Levels, Holo House, Shop & Miscellaneous UI Folders
| Reference File (`tempartreference(DONOTCOMPLETELYCOPY)/...`) | Reference Sheet Layout | Visual & Structural Breakdown | Hell's Advent Dark Fantasy Mapping |
| :--- | :--- | :--- | :--- |
| **`Items/206883 - Item Icons.png`** | Framed square icon atlas | Complete icon atlas on dark framed squares (looking like `32x32` pixel-grid density as an example): Weapons, Collab Weapons, Super Collab Weapons (golden/sparkling border), Items, Super Items, Effect Icons, Other (Heart, Sword, Winged Boot, Crosshair, Crit Target, Clock). | **Primary Reference for ALL `icon_skill_*.png` & `icon_item_*.png` (looking like `32x32` pixel density as an example)**: Shows exact icon padding (2px-style border, dark slate interior `#161A20`, diagonal 45-degree weapon/relic tilt, high-contrast 1px-style inner highlight). |
| **`Items/206879 - Weapons.png`**, **`206880 - Weapons (Collabs).png`**, **`206881 - Weapons (Super Collabs).png`** | Multi-row VFX sheets | Massive VFX sprite sheets for projectiles, spinning axes, orbital grimoires/blades, astral beams, brimstone pools, spider webs, lightning chains, and shockwaves. | **Primary Reference for `fx_*.png` Skill Effect Strips, Projectiles (`rail_spike.png` Soulfire Bone-Lance), & Class Specialization VFX**. |
| **`Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png`** | Complete gothic stage sheet | Dark gothic stone floor tiles (grey & blood-stained), red carpet, crumbled stone rubble, broken pillars, spilled dark red puddles (`Berry Juice`), gothic arches/walls, wooden barrels, wrought-iron gates, candelabras, radial lamp glow, blood-moon night sky. | **Primary Reference for Duskhollow Sanctuary & Floor 1 (*The Blighted Catacombs*) Tiles (`tile_*.png`) & Gothic Ruin Props (`prop_*.png`)**. |
| **`Levels/206142 - Stage 1 - Grassy Plains.png`**, **`206841 - Stage 1 Hard (Night).png`**, **`206842 - Stage 2 - Holo Office.png`**, **`206843 - Stage 2 Hard (Evening).png`**, **`206851 - Time Stage 1 - Concert Stage.png`**, **`206853 - Stage 4 - Gelora Bung Yagoo.png`** | Modular stage sheets | Modular 3/4 top-down wrought-iron fences, stone barriers, reliquary shrines, wooden benches, cracked tiles, and environmental obstacles with baked elliptical shadows. | **Reference for Floor 2 (*Frostbound Crypt*), Floor 3 (*Hellfire Abyss*), Floor 4 (*Rotwood Mire*), Floor 5 (*Void Citadel*), and Floor 1 Catacomb Props**. |
| **`Holo House/206115..206127` & `206141 - NPCs.png`** | Town & NPC sheets | `206116 - Cooking.png` (cauldrons, stews, roasts, chalices), `206121 - Interior.png`, `206123 - Structure.png`, `206141 - NPCs.png` (merchant stall, notice board, NPC idle frames, speech bubbles). | **Reference for Duskhollow Town 7 RPG Buildings, Tavern Meals (`TAVERN_MEALS`), and Sanctuary NPCs (`ume.png`, Malakor's Blood Ledger Board, Maeve's Tavern)**. |
| **`Shop/206130 - Character Gacha.png`** & **`206131 - Shop Menu.png`** | Shop & menu sheets | Animated shopkeeper counter frames, upgrade tier pips, curio chest unsealing beams, and shop UI frames. | **Reference for Vex's Mystic Curio Unsealing UI, Vaelen's Runesmith Forge UI, and `ume.png` Quartermaster animations**. |
| **`Miscellaneous/206506 - Effects.png`**, **`206508 - Pickups.png`**, **`206509 - EXP.png`**, **`206962 - Holozon Box.png`**, **`206964 - Title.png`**, **`206965 - Game Menus and HUDs.png`**, **`206128 - Fandom Ranks.png`**, **`206129 - Achievements.png`**, **`206143 - Yagoo Statue.png`** | HUD, VFX & Title sheets | Complete HUD bars (`HP Bar`, `Exp Bar`), 9-slice dialogue/inventory boxes, warning telegraphs, explosion rings, ground cracks, anime speed-line cut-ins (`Anime Zoom`), spinning coins (`Holocoins`), anvil upgrades, and treasure chest animations (`Holozon Box`). | **Primary Reference for `ui_*.png`, `fx_hit_cross.png`, `fx_shock_ring.png`, `fx_ground_cracks.png`, `fx_dust_puff.png`, `ultimate_cutin.png`, `title_logo.png`, `title_key_art.png`**. |

---

## Part 2: Master GPT Image ("gpt2.5 image") Reference-Guided Dark Fantasy Prompting Protocol

When generating assets in **GPT Image (`gpt-image-1` / GPT-2.5 Image)**, always attach:
1. **The Structural Reference Image** from `tempartreference(DONOTCOMPLETELYCOPY)/...` listed in the asset's **Reference File(s)** field below.
2. **(For Characters/NPCs)** Also attach `/public/assets/aistudio/image_c95e226e.png` (Chibi Base Body) and `/public/assets/characters/sheet_combined_272x208_4x.png` (Approved Chibi Style Target).

### Step 0A: Global Style Lock (Prefixed to Every Prompt)
> `16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art (HoloCure / Darkest Dungeon / Castlevania: Symphony of the Night / Bloodborne chibi pixel aesthetic), rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled pixel-cluster blocks, clean 1px-style dark outlines in a darker shade of each material (never pure #000000 black; use #0B0D10 abyssal soot), 16-color limited palette per sprite drawn from the Hell's Advent 48-color master palette (abyssal soot #0B0D10, cursed iron #3A3F47, dried blood/crimson #8B3A1E, catacomb verdigris #1F4D4A, ossuary bone #D9D2C3, soulfire cyan #00F0FF, fresh blood #FF3B3B, tarnished sanctum gold #FFC83D, hellfire ember #FF5A26, eldritch volt-lime #C9F24B, hoarfrost cyan #7CE8FF), hue-shifted cel-pixel shading, light from top-left, crisp hard nearest-neighbor pixel edges, zero anti-aliasing, zero soft gradients, zero motion blur, zero bloom, no text, no watermark, no UI border frame unless specified, flat solid #FF00FF magenta background, subject centered in each grid cell with safety margin, 3/4 top-down orthographic RPG camera view.`

### Step 0B: Global Reference-Guided Transformation Rule (Included in Every Prompt)
> `REFERENCE-GUIDED INSTRUCTION: Use the attached reference image ONLY for apparent pixel-cluster grid spacing, sprite scale, chibi head-to-body ratio (~2 heads tall, large expressive eyes, compact limbs), animation pose keyframes, and silhouette readability. DO NOT copy the reference character's VTuber identity, modern idol clothes, or pastel colors, and DO NOT include any modern, sci-fi, or mechanical wasteland parts—completely transform the subject into the pure gothic dark-fantasy design of Hell's Advent described below.`

### Step 0C: Global Negative Prompt
> `avoid: mechanical parts, sci-fi robots, modern vehicles, cars, tires, tin cans, gas masks, welding goggles, rebar, vending machines, firearms, copying VTuber character designs or hololive logos, tiny low-resolution output, blurry downscaled pixels, smooth digital painting, vector art, 3D render, bilinear blur, anti-aliased edges, soft airbrush glow, lens flare, semi-transparent alpha fringes against the #FF00FF background, realistic 8-head human proportions, generic cheerful high-fantasy, mismatched frame sizes, cropped weapon tips, text, watermarks, signatures.`

### Step 0D: High-Resolution Canvas (~1.2K×1.2K) vs. Apparent Pixel-Grid Vision Rule
> **Why It Should Look Like `64x64` as an Example (Not Be Forced to `64x64` Output Size)**:
> Modern AI image generators (`gpt-image-1`, Gemini Image Gen) render natively around `1024x1024` to `1536x1024` (~`1.2Kx1.2K`). Asking the generator for a literal `64x64` image or forcing a naive downscale to `64x64` destroys fine pixel clusters, eyes, and outlines. Therefore, whenever an entry below lists an **Apparent Pixel-Grid Vision Example** (such as *looks like `64x64` per cell as an example*, or *looks like `40x40` / `80x80` / `32x32` as an example*), generate the image at **full native ~1.2K×1.2K resolution** while keeping the **visual pixel-block chunkiness and detail density** looking like that classic `64x64` (or `40x40`, `80x80`, `32x32`) 16-bit sprite grid.

---

## Part 3: Complete Asset Catalog & GPT Image Prompts (`process-assets.mjs` Manifest + Full Expansion Roster)

Every asset below includes its exact **Manifest ID** (for `/assets-src/raw/<id>.png`), **Apparent Pixel-Grid Vision Example & Strip Layout (Rendered at High-Res ~1.2K×1.2K)**, **Exact Reference File(s) in `tempartreference(DONOTCOMPLETELYCOPY)`**, **Detailed Dark-Fantasy Visual Description for GPT Image**, and a **Copy-Pasteable Full GPT Image Prompt**.

---

## SECTION 1: PLAYABLE CHARACTERS — SENA IBUKI & THE 5 ASCENDANT CLASSES

### `sena_turnaround.png`
- **Category**: `player` (Sena Ibuki — Abyssal Blade Knight)
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 4-frame horizontal turnaround strip (`4:1` aspect ratio) where each cell **looks like a `64x64` pixel-art sprite as an example** of apparent pixel-block density (4 frames, 2 fps, feet anchored near bottom center)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
  - `public/assets/aistudio/image_c95e226e.png` (Chibi Base Proportions)
  - `public/assets/characters/sheet_combined_272x208_4x.png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **Silhouette & Anatomy**: 2-head-tall dark-fantasy chibi swordswoman whose pixel-cluster density **looks like a `64x64` sprite as an example** (`~40` apparent pixel-blocks tall inside each cell), rendered crisp at full ~1.2K resolution.
  - **Head & Hair**: Short uneven crimson-rust hair (`#8B3A1E` / `#D16B38`) with one longer front-left lock pinned by a carved bone-clasp; a tarnished sanctum-gold winged brow-circlet (`#FFC83D`) set with a small cracked soul-gem rests across her forehead; large expressive anime eyes with soulfire-cyan (`#00F0FF`) irises.
  - **Armor & Garments**: Weathered soot-black abyssal knight surcoat (`#1A2228`) with a tattered swallowtail hem, a fluted dark-iron pauldron (`#3A3F47`) with crimson trim on her right shoulder, left forearm wrapped in consecrated ash-grey linen bindings, right forearm armored in a rune-etched brass vambrace (`#FFC83D`), and a long flowing ossuary-bone scarf (`#D9D2C3`) marked with a blood-crimson sigil stripe near its tail.
  - **Weapon**: **Duskrend**, a cursed dark-iron odachi/katana with a talisman-wrapped hilt, skull-winged tsuba guard, and a razor-sharp blade edge glowing with a `1px`-style soulfire-cyan (`#00F0FF`) spirit flame.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled pixel blocks, clean 1px-style dark outlines in a darker shade of each material (never pure #000000 black; use #0B0D10 soot), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the exact 2-head-tall chibi pixel anatomy, apparent pixel-block density, and cell framing of attached reference `Ayame.png` and `image_c95e226e.png` without copying the VTuber character. Render at full high resolution (~1.2K canvas) a 4-frame horizontal character turnaround sprite strip (4 equal square cells side-by-side where each cell visually looks like a 64x64 pixel sprite as an example of apparent pixel-grid density: Frame 1 Front/Down view, Frame 2 Back/Up view, Frame 3 Left Side view, Frame 4 Right Side view) of Sena Ibuki, Abyssal Blade Knight: young gothic swordswoman, short uneven blood-rust hair (#8B3A1E, #D16B38) with one longer left lock held by a carved bone clasp, tarnished gold winged brow-circlet (#FFC83D) on her forehead, soot-black tattered knight surcoat (#1A2228) with a fluted dark-iron shoulder pauldron (#3A3F47), left forearm wrapped in consecrated ash-grey linen bandages, right forearm with a rune-etched gold vambrace, long bone-white scarf (#D9D2C3) with a crimson rune stripe near the tail, wielding Duskrend (a cursed dark-iron katana with talisman-wrapped hilt and a soulfire-cyan #00F0FF glowing cutting edge), dark leather greaves, determined anime eyes. avoid: mechanical goggles, sci-fi tech, forced tiny low-res downscale, smooth shading, vector look, 3D render, painterly, soft glow, lens flare, copying VTuber costume, extra limbs, text, logo.
  ```

### `sena_idle_down.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 2-frame horizontal strip (`2:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (4 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 1, Frames 1–2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use Row 1 (Idle frames) of attached `Ayame.png` for exact chibi scale and 1-pixel-block vertical breathing bob, and `sena_turnaround.png` for character identity. Render at full high resolution (~1.2K canvas) a 2-frame horizontal sprite strip (two equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki in front/down-facing combat idle stance: Frame 1 neutral ready stance wearing her winged gold brow-circlet, bone scarf, and tattered black knight surcoat while holding Duskrend katana with soulfire-cyan (#00F0FF) edge at her right side; Frame 2 torso and bone scarf bobbing 1 pixel-block down with subtle surcoat hem shift. avoid: mechanical parts, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text, watermark.
  ```

### `sena_run_down.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6-frame horizontal strip (`6:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (12 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 2, Frames 1–6)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the exact 6-frame chibi run cycle rhythm and leg/hair bounce of Row 2 in attached `Ayame.png`. Render at full high resolution (~1.2K canvas) a 6-frame horizontal sprite strip (six equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki in a front/down-facing 6-frame run cycle: alternating armoured boot strides, bone-white scarf trailing upward, tattered black knight surcoat hem flaring, winged gold circlet gleaming on her brow, Duskrend katana held low at her side with a crisp soulfire-cyan (#00F0FF) edge. avoid: mechanical parts, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text, watermark.
  ```

### `sena_attack1_down.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (14 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_slash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the chibi proportions of `Ayame.png` and the crisp pixel crescent arc of `Ayame_slash.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Down-View Attack Combo Hit 1 (horizontal forehand slash): Frame 1 windup drawing Duskrend back to her right shoulder; Frame 2 forward lunge with wide horizontal bone-white (#EFE9DA) and soulfire-cyan (#00F0FF) pixel slash smear across the lower arc; Frame 3 follow-through recovery pose. avoid: smooth shading, motion blur, soft glow, 3D render, text.
  ```

### `sena_attack2_down.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (14 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_spiritslash.png` reverse slash arc. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Down-View Attack Combo Hit 2 (reverse upward backhand slash): Frame 1 coiled backhand anticipation; Frame 2 sweeping reverse crescent smear in bone-white (#EFE9DA) and soulfire-cyan (#00F0FF); Frame 3 blade-high recovery stance. avoid: smooth shading, motion blur, soft glow, 3D render, text.
  ```

### `sena_attack3_down.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (12 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 0/529817 - Hoshimachi Suisei/Suisei_axswing.png` + `Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use `Ayame.png` for chibi scale and `Suisei_axswing.png` for heavy overhead cleave arc weight. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Down-View Attack Combo Hit 3 (two-handed overhead Duskrend finisher cleave): Frame 1 raising Duskrend high overhead with both hands; Frame 2 slamming the cursed blade straight down with a massive vertical soulfire-cyan (#00F0FF) and bone-white abyssal rift arc; Frame 3 grounded cleave recovery. avoid: smooth shading, motion blur, soft glow, 3D render, text.
  ```

### `sena_hurt_down.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a single square frame that **looks like a `64x64` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions. Render at full high resolution (~1.2K canvas) a single square frame (visually looking like a 64x64 pixel sprite as an example of apparent pixel density) of Sena Ibuki in a down-facing hurt recoil pose: wincing expression, head and shoulders knocked backward 2 pixel-blocks, bone scarf flaring upward, Duskrend held defensively across her chest. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_idle_up.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 2-frame horizontal strip (`2:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (4 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` 2-head chibi scale and idle rhythm, viewed from behind (up-facing). Render at full high resolution (~1.2K canvas) a 2-frame horizontal sprite strip (two equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki in an up-facing (back view) idle breathing stance: showing the back of her uneven crimson-rust hair, the bone-white scarf tail with its crimson rune stripe hanging over her back, the crimson crest emblazoned on the back of her black knight surcoat, and Duskrend's soulfire-cyan edge held to her right. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_run_up.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6-frame horizontal strip (`6:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (12 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match Row 2 run cycle cadence of `Ayame.png`, turned to up-facing (back view). Render at full high resolution (~1.2K canvas) a 6-frame horizontal sprite strip (six equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki running upward (back view): 6-frame footwork cycle, bone scarf and tattered black knight surcoat streaming behind her toward the camera, fluted iron pauldron visible, Duskrend blade carried at her right side. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack1_up.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (14 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_slash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_slash.png` arc. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Up-View (back view) Attack Combo Hit 1: Frame 1 windup; Frame 2 sweeping horizontal forehand slash above her head with a bone-white and soulfire-cyan (#00F0FF) crescent smear; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack2_up.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (14 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi scale and `Ayame_spiritslash.png` reverse arc. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Up-View (back view) Attack Combo Hit 2 (reverse backhand slash): Frame 1 anticipation; Frame 2 reverse upward crescent smear in soulfire-cyan (#00F0FF) and bone-white; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack3_up.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (12 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 0/529817 - Hoshimachi Suisei/Suisei_axswing.png` + `Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Suisei_axswing.png` heavy cleave. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Up-View (back view) Attack Combo Hit 3 (two-handed overhead cleave): Frame 1 high windup; Frame 2 heavy forward-upward slam with wide soulfire-cyan (#00F0FF) abyssal rift arc; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_hurt_up.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a single square frame that **looks like a `64x64` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions. Render at full high resolution (~1.2K canvas) a single square frame (visually looking like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki in an up-facing (back view) hurt recoil pose, shoulders jolted, bone scarf and crimson-rust hair flaring outward. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_idle_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 2-frame horizontal strip (`2:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (4 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 1, Frames 1–2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match exact side-facing 3/4 chibi stance of `Ayame.png` Row 1. Render at full high resolution (~1.2K canvas) a 2-frame horizontal sprite strip (two equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki in right-facing side profile idle breathing pose: 1-pixel-block vertical breathing bob, bone scarf trailing left, winged gold circlet on forehead, holding Duskrend with soulfire-cyan (#00F0FF) edge ready. avoid: mechanical goggles, smooth shading, blur, glow, 3D render, text.
  ```

### `sena_run_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6-frame horizontal strip (`6:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (12 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 2, Frames 1–6)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Directly match the 6-frame forward-leaning chibi run cycle pose progression of Row 2 in `Ayame.png`. Render at full high resolution (~1.2K canvas) a 6-frame horizontal sprite strip (six equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki running right in side profile: torso leaning slightly forward, bone scarf with crimson rune stripe streaming horizontally behind her, black knight surcoat hem flaring, Duskrend held back in a poised sprint grip. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack1_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (14 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_slash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_slash.png` forward crescent smear. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Right-Side-View Attack Combo Hit 1 (horizontal forehand slash): Frame 1 blade drawn back; Frame 2 forward step with bright bone-white core and soulfire-cyan (#00F0FF) crescent slash smear to the right; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack2_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (14 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_spiritslash.png` upward arc. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Right-Side-View Attack Combo Hit 2 (reverse upward backhand slash): Frame 1 low coiled windup; Frame 2 upward rising soulfire-cyan (#00F0FF) and bone-white slash smear to the right; Frame 3 high-guard recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack3_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (12 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli_slash.png` + `Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi scale and `Calli_slash.png` wide heavy cleave smear. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (three equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing Right-Side-View Attack Combo Hit 3 (two-handed overhead Duskrend cleave): Frame 1 high overhead windup; Frame 2 full-body forward lunge slamming Duskrend down with a massive 180-degree soulfire-cyan (#00F0FF) and bone-white crescent arc; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_hurt_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a single square frame that **looks like a `64x64` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi scale. Render at full high resolution (~1.2K canvas) a single square frame (visually looking like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki in right-facing side profile hurt recoil pose: leaning backward from impact, grit teeth, bone scarf and surcoat hem whipped forward. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_dodge_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 4-frame horizontal strip (`4:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (16 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529968 - Murasaki Shion/Shion_Jump.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Fan Dash` section)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use `Shion_Jump.png` and `Fan Dash` in `206506 - Effects.png` for tucked evasive dash motion. Render at full high resolution (~1.2K canvas) a 4-frame horizontal sprite strip (four equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki performing a right-facing evasive shadow-step dodge roll: Frame 1 low crouch push-off; Frame 2 tucked airborne roll wrapped in shadow-mist with bone scarf and soulfire-cyan (#00F0FF) afterimage streak; Frame 3 low tuck rotation; Frame 4 sliding recovery on one knee with Duskrend braced. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_death_side.png`
- **Category**: `player`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 4-frame horizontal strip (`4:1` aspect ratio) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density (6 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Holo House/206141 - NPCs.png` (fallen Nousagi pose)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions. Render at full high resolution (~1.2K canvas) a 4-frame horizontal sprite strip (four equal square cells side-by-side where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) of Sena Ibuki's defeat animation in side profile: Frame 1 staggering backward; Frame 2 dropping to her knees; Frame 3 planting Duskrend vertically into the stone floor to brace herself; Frame 4 slumped forward on one knee holding the planted hilt of Duskrend, bone scarf resting on the ground. avoid: smooth shading, blur, glow, 3D render, text, gore.
  ```

---

### COMPANION PLAYABLE CLASS SPRITE SHEETS (HoloCure 6×2 Grid Format — Rendered at High-Res ~1.2K Canvas, Looking Like `64x64` Cells as an Example)
*(Drop into `/assets-src/raw/<class_id>_sheet.png` or individual directional strips)*

#### `rook_sheet.png` (Rook Matsuda — Witch-Hunter Marksman)
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6×2 grid (`3:1` aspect ratio: Row 1 = 4 Idle frames + 2 empty cells; Row 2 = 6 Run frames) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/204785 - Amelia Watson.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **Silhouette & Anatomy**: 2-head-tall gothic witch-hunter marksman (looks like `~40` apparent pixel-blocks tall inside a `64x64`-style cell as an example).
  - **Attire & Details**: Weathered midnight-slate inquisitor trench cloak (`#1A2228`) with tarnished gold clasps (`#FFC83D`), a pointed dark-leather witch-hunter hat tilted over ash-silver hair, a glowing rune-etched gold monocle over his right eye, and a leather bandolier of blessed silver stakes across his chest.
  - **Weapon**: **Hexbane Arbalest**, an ornate dark-iron and carved-bone repeating crossbow with a curved sanctum-gold bow prod and a consecrated silver stake loaded in the groove.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use attached `Zeta.png` (6 columns by 2 rows grid: Row 1 = 4-frame Idle, Row 2 = 6-frame Run) and `image_c95e226e.png` for exact 2-head chibi anatomy and cell placement, where each cell visually looks like a 64x64 sprite as an example of apparent pixel density. Transform completely into Rook Matsuda, Witch-Hunter Marksman: sharp-eyed gothic inquisitor wearing a weathered midnight-slate witch-hunter cloak (#1A2228) with tarnished gold clasps (#FFC83D), a pointed wide-brimmed dark leather witch-hunter hat over ash-silver hair, a rune-etched gold monocle over his right eye, leather bandolier of blessed silver stakes across his chest, holding the Hexbane Arbalest (an ornate dark-iron and bone repeating crossbow with a curved sanctum-gold bow prod and glowing #FFC83D consecrated silver bolt loaded). avoid: modern firearms, sci-fi guns, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

#### `ines_sheet.png` (Ines Calloway — Ossuary Necromancer & Blood-Lich)
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6×2 grid (`3:1` aspect ratio: Row 1 = 4 Idle frames; Row 2 = 6 Run frames) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/Ina.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529968 - Murasaki Shion/Shion.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **Silhouette & Anatomy**: 2-head-tall pale gothic necromancer (looks like `~40` apparent pixel-blocks tall inside a `64x64`-style cell as an example).
  - **Attire & Details**: Long braided bone-white hair (`#D9D2C3`) streaked with necrotic verdigris-emerald (`#4FD6A0`) and pinned with miniature crow skulls, tattered hooded catacomb vestments (`#1A2228`) bound by a carved skeletal rib-cage corset, and an arched bone-and-verdigris ossuary reliquary shrine strapped to her back that burns with ghostly green soulfire.
  - **Weapon**: **Gravelord Scepter**, a horned skull-topped bone staff and clawed dark-iron ritual gauntlets, surrounded by 3 levitating jagged bone fragments orbiting her waist.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the 6x2 grid (Row 1: 4 Idle frames, Row 2: 6 Run frames, where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) and 2-head chibi proportions of attached `Ina.png` and `Shion.png`. Transform completely into Ines Calloway, Ossuary Necromancer: pale gothic necromancer with bone-white braided hair (#D9D2C3) streaked with verdigris-emerald (#4FD6A0) and skull hairpins, dark hooded catacomb vestments over a carved skeletal rib-cage corset, a dorsal ossuary bone-shrine strapped to her back burning with ghostly emerald-verdigris (#4FD6A0) soulfire, wielding the horned skull-topped Gravelord Scepter and dark-iron ritual claws with 3 jagged bone shards levitating in orbit around her waist. avoid: industrial magnets, mechanical coils, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

#### `kaelen_sheet.png` (Kaelen Vos — Hellfire Dragoon & Wyrm-Knight)
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6×2 grid (`3:1` aspect ratio: Row 1 = 4 Idle frames; Row 2 = 6 Run frames) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png` (Default Outfit Idle/Run)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Fantasy (JP Gen 3)/530011 - Shirogane Noel/Noel.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **Silhouette & Anatomy**: 2-head-tall armored dragon-knight (looks like `~42` apparent pixel-blocks tall inside a `64x64`-style cell as an example).
  - **Attire & Details**: Heavy blackened obsidian-and-crimson dragonscale plate armor (`#2A353D` / `#8B3A1E`), curved tarnished-gold wyrm horns (`#FFC83D`) sweeping back from his brow over spiky ash-crimson hair, fierce molten ember-orange (`#FF5A26`) eyes, a glowing brimstone heart-core set into his breastplate, and folded charred draconic half-wings / spiked wyrm-crests on his back that vent tiny hellfire embers.
  - **Weapon**: **Cinderlance**, a massive serrated obsidian-and-bone dragon-spear with a glowing molten hellfire (`#FF5A26`) blade tip and horned crossguard.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the 6x2 grid (Row 1: 4 Idle frames, Row 2: 6 Run frames, where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) and armoured chibi proportions of `Noel.png` and `204696 - Takanashi Kiara.png`. Transform completely into Kaelen Vos, Hellfire Dragoon: demon-forged dragon knight in blackened obsidian-and-crimson dragonscale plate (#2A353D, #8B3A1E) with curved gold wyrm horns (#FFC83D) on his brow, spiky ash-crimson hair, fierce ember-orange (#FF5A26) eyes, glowing brimstone dragon-heart on his chestplate, charred draconic dorsal crests on his back shedding tiny hellfire sparks, wielding the Cinderlance (a massive serrated obsidian-and-bone greatlance with a molten hellfire #FF5A26 core and dragon-fang guard). avoid: mechanical boiler pipes, sci-fi jetpacks, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

#### `vespera_sheet.png` (Vespera Locke — Eldritch Soulbinder & Astral Oracle)
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6×2 grid (`3:1` aspect ratio: Row 1 = 4 Idle frames; Row 2 = 6 Run frames) where each cell **looks like a `64x64` sprite as an example** of apparent pixel density
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 0/529818 - Roboco-san/Roboco.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Council (EN Gen 2)/529784 - Ouro Kronii/Kronii.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **Silhouette & Anatomy**: 2-head-tall eldritch oracle & soulbinder (looks like `~40` apparent pixel-blocks tall inside a `64x64`-style cell as an example).
  - **Attire & Details**: Long flowing starlight-silver hair (`#D9D2C3`), a tarnished-gold eclipsed-star crown (`#FFC83D`) set with an eldritch volt-lime (`#C9F24B`) third-eye gem on her brow, luminous volt-green (`#C9F24B`) and soulfire-cyan (`#00F0FF`) eyes, a high-collared midnight sanctum robe (`#1A2228`) draped with rune-inscribed stoles, and a levitating starforged golden **Seraphic Astrolabe Halo** behind her shoulders.
  - **Weapon**: **Astral Grimoire & Soul-Scourge**, a leather-bound forbidden tome levitating open before her hand and 3 tiny winged bone wisp-skulls with glowing volt-green (`#C9F24B`) eye sockets orbiting her.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the 6x2 grid (Row 1: 4 Idle frames, Row 2: 6 Run frames, where each cell visually looks like a 64x64 sprite as an example of apparent pixel density) and hovering halo/familiar layout of `Kronii.png` and `Roboco.png`. Transform completely into Vespera Locke, Eldritch Soulbinder: gothic astral oracle with long starlight-silver hair (#D9D2C3), tarnished-gold eclipsed-star tiara (#FFC83D) with a glowing volt-lime (#C9F24B) gem, luminous volt-green and soulfire-cyan eyes, high-collared midnight sanctum cloak with gold runic stoles, a levitating starforged brass Seraphic Halo ring behind her shoulders, an open levitating leather-bound Astral Grimoire in front of her hand, and 3 tiny winged bone wisp-skulls with volt-green (#C9F24B) eye-flames orbiting her. avoid: sci-fi visors, robotic drones, copper wires, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

---

## SECTION 2: CHARACTER PORTRAITS (Rendered at High-Res ~1.2K×1.2K Canvas, Looking Like `96x96` Pixel Portraits as an Example)

### `sena_neutral.png`
- **Category**: `portrait`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas) with chunky pixel-art clusters that **visually look like a `96x96` pixel-art bust portrait as an example** of apparent pixel density
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli_portrait.png`
  - `public/assets/characters/sheet_combined_272x208_4x.png` (Top row framed bust portraits)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the crisp pixel-art anime bust portrait framing, eye highlight cluster detail, and shading style of attached `sheet_combined_272x208_4x.png` (top portraits) and `Ayame_Port.png`. Render at full high resolution (~1.2Kx1.2K) an anime bust portrait that visually looks like a 96x96 pixel portrait as an example of apparent pixel density, depicting Sena Ibuki, Abyssal Blade Knight, with a calm, stoic neutral expression: short uneven blood-rust hair (#8B3A1E, #D16B38) with longer left lock held by a carved bone clasp, tarnished gold winged brow-circlet (#FFC83D) set with a soul-gem on her forehead, bone-white scarf (#D9D2C3) with crimson rune stripe wrapped around her neck, dark-iron knight pauldron and black surcoat shoulders, and the skull-guarded hilt of Duskrend with a faint soulfire-cyan (#00F0FF) edge peeking behind her right shoulder. avoid: mechanical goggles, forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `sena_hurt.png`
- **Category**: `portrait`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas), **looking like a `96x96` pixel portrait as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` + `public/assets/characters/sheet_combined_272x208_4x.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Keep exact dark-fantasy costume, palette, and framing of `sena_neutral.png` and `Ayame_Port.png`. Render at full high resolution (~1.2Kx1.2K) an anime bust portrait (visually looking like a 96x96 pixel portrait as an example of apparent pixel density) of Sena Ibuki with a battle-damaged hurt expression: one eye wincing shut, grit teeth, a small ash-and-blood scratch on her cheek, furrowed brows, same blood-rust hair, winged gold brow-circlet, bone scarf, and Duskrend hilt. avoid: mechanical goggles, forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `sena_determined.png`
- **Category**: `portrait`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas), **looking like a `96x96` pixel portrait as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` + `public/assets/characters/sheet_combined_272x208_4x.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Keep exact dark-fantasy costume, palette, and framing of `sena_neutral.png` and `Ayame_Port.png`. Render at full high resolution (~1.2Kx1.2K) an anime bust portrait (visually looking like a 96x96 pixel portrait as an example of apparent pixel density) of Sena Ibuki with a fierce, focused combat expression: sharp angled eyebrows, intense locked-on soulfire-cyan gaze, slight confident battle smirk, winged gold circlet gleaming, bone scarf billowing slightly, Duskrend hilt glinting soulfire-cyan (#00F0FF) behind her shoulder. avoid: mechanical goggles, forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `sena_ultimate.png`
- **Category**: `portrait`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas), **looking like a `96x96` pixel portrait as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` + `Playable Characters - JP Gen 1/529823 - Haachama (Akai Haato)/Haachama_Portrait.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Keep exact dark-fantasy costume and framing of `sena_neutral.png` and `Ayame_Port.png`. Render at full high resolution (~1.2Kx1.2K) an anime bust portrait (visually looking like a 96x96 pixel portrait as an example of apparent pixel density) of Sena Ibuki unleashing her Ultimate (Seven Seals of Eclipse): her irises and brow-circlet soul-gem blazing bright soulfire-cyan (#00F0FF) with crisp pixel spirit-flame wisps rising from her eyes, blood-rust hair and bone scarf swept upward by abyssal pressure, dramatic high-contrast rim-light in #B8FBFF on her jawline and Duskrend blade. avoid: mechanical goggles, forced tiny downscale, smooth airbrush glow, vector look, 3D render, blur, text.
  ```

---

## SECTION 3: COMMON ENEMIES (5-Frame Strips — Move 2, Attack 1, Hurt 1, Dead 1; Rendered at High-Res ~1.2K Canvas, Looking Like `40x40` Cells as an Example)

> **Visual Direction & High-Res Vision Rule for All Common Enemies**:
> - **Pure Gothic Dark Fantasy**: Every common enemy is a creature of the Blighted Catacombs (undead vermin, flayed grave-hounds, stone gargoyle imps, abyssal blood-leeches, vampiric crypt-bats, bone-carapace spiders, ghostly soul-lantern wisps, cursed treasure-chest mimics, and hellfire carrion-crows). Do **not** include any tin cans, welding goggles, barbed wire, mechanical drones, or industrial scrap.
> - **High-Res Canvas (~1.2K) vs. `40x40` Pixel-Density Example**: Render every 5-frame strip at **full high resolution (~1.2K canvas)** (`5:1` strip aspect ratio of 5 equal square cells) where each cell is drawn with chunky pixel blocks so it **visually looks like a `40x40` sprite as an example** of apparent pixel density—never force a literal tiny `40x40` image generation or destructive downscale.

### `tin_rat.png` (Shackled Crypt-Rat / Risen Bone-Scurrier — Floor 1 Ossuary Nave)
- **Category**: `enemy_common`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 5-frame horizontal strip (`5:1` aspect ratio) where each square cell **looks like a `40x40` sprite as an example** of apparent pixel-block density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (`Chumbud` & `Dead Beat` 3-frame grid cells) + `Playable Characters - Council (EN Gen 2)/204786 - Hakos Baelz.png` (rat minion)
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A hunched, mangy undead catacomb plague-rat (looks like `~28x28` apparent pixel-blocks inside a `40x40`-style cell as an example) with matted soot-grey fur (`#3A3F47`), exposed bleached bone ribs (`#D9D2C3`), and a cracked medieval black-iron torture-pillory / spiked iron maiden shell (`#8B3A1E`, `#2A353D`) clamped around its arched spine with a broken iron chain link dangling behind; its oversized yellowed incisors bare in a snarl and its eyes burn like blood-red (`#FF3B3B`) embers.
  - **5-Frame Strip Layout**: Frame 1 Scurry Stride A (forepaws extended), Frame 2 Scurry Stride B (hindlegs bunched, tail whipping), Frame 3 Fanged Lunge Bite (jaws wide open, bone claws raking forward), Frame 4 Hurt Recoil (knocked back, spine arched), Frame 5 Dead (collapsed pile of bleached rat bones and broken iron shackles).
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the compact enemy sprite scale and 1px-style outline readability of `Chumbud` and `Dead Beat` in attached `206132 - Myth Enemies (EN Gen1).png`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Scurry A, Frame 2 Scurry B, Frame 3 Fanged Bite Lunge Attack, Frame 4 Hurt Recoil, Frame 5 Dead scattered bones and broken iron shackle) of `tin_rat` (Shackled Crypt-Rat): hunched undead catacomb plague-rat with matted ash-grey fur (#3A3F47), exposed bleached bone ribcage (#D9D2C3), a spiked dark-iron dungeon shackle-shell (#8B3A1E, #2A353D) clamped over its back with a broken chain link, jagged bone claws, and glowing blood-red (#FF3B3B) eyes. avoid: tin cans, soup cans, mechanical parts, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `dust_dog.png` (Flayed Grave-Hound — Ossuary Nave & Sepulcher of Ash)
- **Category**: `enemy_common`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 5-frame horizontal strip (`5:1` aspect ratio) where each cell **looks like a `40x40` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206134 - Gamers Enemies (JP).png` (`Miofa` & `Koronesuki`) + `Enemies/206132 - Myth Enemies (EN Gen1).png` (`Investigater`)
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A gaunt, feral undead Barghest / catacomb grave-hound (looks like `~32x26` apparent pixel-blocks inside a `40x40`-style cell as an example) with crimson-sinewed flayed haunches (`#8B3A1E`), an exposed bleached wolf skull and ribcage (`#D9D2C3`), jagged dorsal bone spines along its back, and a heavy spiked dark-iron dungeon collar (`#3A3F47`) with a tarnished gold inquisitor seal (`#FFC83D`) and broken chain links trailing from its neck; its eye sockets blaze with predatory blood-crimson (`#FF3B3B`) fire.
  - **5-Frame Strip Layout**: Frame 1 Prowl Gallop A, Frame 2 Prowl Gallop B, Frame 3 Savage Jaw-Snap Lunge, Frame 4 Hurt Recoil, Frame 5 Dead (collapsed hound skull, ribs, and spiked iron collar).
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the small quadruped/hound enemy proportions and stride cadence of `206134 - Gamers Enemies (JP).png` and `206132 - Myth Enemies (EN Gen1).png`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Gallop A, Frame 2 Gallop B, Frame 3 Jaw-Snap Lunge Attack, Frame 4 Hurt Recoil, Frame 5 Dead collapsed hound skeleton and collar) of `dust_dog` (Flayed Grave-Hound): starved undead catacomb Barghest hound with exposed bone-white (#D9D2C3) wolf skull and ribcage, flayed crimson-sinew hide (#8B3A1E), a spiked dark-iron dungeon collar (#3A3F47) with a tarnished gold talisman (#FFC83D) and broken chain dangling from its neck, head carried low with blazing blood-red (#FF3B3B) eye sockets. avoid: welding goggles, modern accessories, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `wire_kite.png` (Stone Gargoyle Imp — Gallows Causeway)
- **Category**: `enemy_common`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 5-frame horizontal strip (`5:1` aspect ratio) where each cell **looks like a `40x40` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png` (flying enemies) + `Playable Characters - Force (JP Gen 4)/530032 - Tokoyami Towa/` (devil/imp motifs)
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A winged gothic cathedral gargoyle imp (looks like `~30x30` apparent pixel-blocks inside a `40x40`-style cell as an example) carved from cracked dark-slate basalt (`#2A353D`, `#3A3F47`) and ossuary bone (`#D9D2C3`), with curved ram horns, tattered bat-like stone-and-parchment wings, a glowing blood-crimson (`#FF3B3B`) abyssal rune-eye carved into its chest, clawed talons, and a whip-like barbed devil tail tipped with a bone spade.
  - **5-Frame Strip Layout**: Frame 1 Wingbeat Up (hovering high), Frame 2 Wingbeat Down (talons tucked), Frame 3 Diving Talon Slash, Frame 4 Hurt Recoil, Frame 5 Dead (shattered stone gargoyle fragments on the ground).
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the hovering flyer silhouette scale of `206133 - CouncilRyS Enemies (EN Gen2 + Hope).png`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Wingbeat Up, Frame 2 Wingbeat Down, Frame 3 Swoop Talon Dive Attack, Frame 4 Hurt Recoil, Frame 5 Dead shattered stone gargoyle rubble) of `wire_kite` (Stone Gargoyle Imp): a gothic cathedral gargoyle imp with cracked dark-slate stone skin (#2A353D, #3A3F47), curved bone horns (#D9D2C3), tattered leathery gargoyle wings, a glowing blood-crimson (#FF3B3B) abyssal eye-rune in its chest, wicked talons, and a spaded devil tail. avoid: barbed wire, kites, mechanical parts, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `lye_leech.png` (Bloated Blight-Leech — Weeping Fens)
- **Category**: `enemy_common`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 5-frame horizontal strip (`5:1` aspect ratio) where each cell **looks like a `40x40` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (`Takodachi` blob squish cycle)
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A grotesque, blood-gorged eldritch swamp leech (looks like `~28x24` apparent pixel-blocks inside a `40x40`-style cell as an example) with glistening bog-verdigris (`#1F4D4A`) and necrotic bile-green (`#6B8036`, `#9CB34C`) ringed flesh segments, pulsing dark-crimson blood veins (`#8B3A1E`), dorsal bone-spikes, and a gaping circular lamprey maw lined with concentric rings of jagged bone-white (`#D9D2C3`) teeth.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use the squash-and-stretch ground crawler proportions of `Takodachi` in `206132 - Myth Enemies (EN Gen1).png`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Compressed Crawl, Frame 2 Extended Crawl, Frame 3 Lamprey Maw Lunge Bite, Frame 4 Hurt Recoil, Frame 5 Dead burst necrotic ichor puddle) of `lye_leech` (Bloated Blight-Leech): grotesque eldritch swamp-leech with bile-green (#6B8036, #9CB34C) and bog-verdigris (#1F4D4A) glistening ringed flesh, pulsing crimson veins (#8B3A1E), and a circular lamprey maw ringed with jagged bone-white (#D9D2C3) teeth. avoid: forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `sump_bat.png` (Vampiric Crypt-Bat — Weeping Fens)
- **Category**: `enemy_common`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 5-frame horizontal strip (`5:1` aspect ratio) where each cell **looks like a `40x40` sprite as an example** of apparent pixel density (10 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 1/529825 - Yozora Mel/Mel_bat.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Decorations` bat icon)
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A monstrous vampiric strigoi bat (looks like `~32x26` apparent pixel-blocks inside a `40x40`-style cell as an example) with frayed dark bog-teal (`#2E6962`) leathery wings spanned across exposed bone wing-fingers (`#D9D2C3`), bat-like horned ears, bared vampire fangs, a swollen glowing bile-green (`#9CB34C`) venom gullet under its chest, and twin blazing blood-red (`#FF3B3B`) eyes.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the crisp pixel bat wing silhouettes of `Mel_bat.png` and `206852 - Stage 3 - Halloween Castle`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Wings Spread High, Frame 2 Wings Downbeat, Frame 3 Vampiric Sonic Fang Swoop, Frame 4 Hurt Recoil, Frame 5 Dead grounded bat carcass) of `sump_bat` (Vampiric Crypt-Bat): monstrous gothic strigoi crypt-bat with tattered bog-teal (#2E6962) leathery membrane wings stretched over bleached bone wing-ribs (#D9D2C3), pointed vampire ears, a swollen pale bile-green (#9CB34C) venom sac under its chest, and twin blood-red (#FF3B3B) eyes. avoid: mechanical ribs, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### Additional Floor 1 Expansion Common Enemies (5 frames, Rendered at High-Res ~1.2K Canvas, Looking Like `40x40` Cells as an Example)

#### `rivet_tick.png` (Skull-Carapace Bone-Spider — Ossuary Nave)
- **Category**: `enemy_common` | **Apparent Pixel-Grid Vision & Layout**: 5-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like a `40x40` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 1/529823 - Haachama (Akai Haato)/Haachama_Spider.png`
- **Dark-Fantasy Visual Description (For GPT Image)**: A creepy necromantic catacomb arachnid whose abdomen is a giant cracked human cranium (`#D9D2C3`) bound with dark-iron runes (`#3A3F47`), scuttling on 6 scythe-like bone-and-chitin legs with a cluster of glowing blood-crimson (`#FF3B3B`) spider eyes peeking from the skull's nasal cavity.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the compact arachnid leg-silhouette of attached `Haachama_Spider.png`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Scuttle A, Frame 2 Scuttle B, Frame 3 Pouncing Fang-Latch Attack, Frame 4 Hurt Recoil, Frame 5 Dead cracked skull and curled legs) of `rivet_tick` (Skull-Carapace Bone-Spider): necromantic crypt spider carrying a giant cracked bone skull (#D9D2C3) as its carapace shell, 6 sharp dark-chitin and bone scythe-legs (#3A3F47), and glowing blood-crimson (#FF3B3B) spider eyes glaring from the skull sockets. avoid: mechanical rivets, robot legs, forced tiny downscale, smooth shading, blur, glow, text.
  ```

#### `signal_mite.png` (Will-o'-Wisp Soul-Lantern — Gallows Causeway)
- **Category**: `enemy_common` | **Apparent Pixel-Grid Vision & Layout**: 5-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like a `40x40` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_spiritfire.png` + `Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png`
- **Dark-Fantasy Visual Description (For GPT Image)**: A haunted floating wrought-iron graveyard cage-lantern (`#2A353D`) containing a chattering bleached skull (`#D9D2C3`) engulfed in eerie soulfire-cyan (`#00F0FF`) phantom flames, with a tarnished gold ritual bell (`#FFC83D`) hanging underneath that rings out psychic warning ripples to nearby monsters.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the floating wisp scale of `Ayame_spiritfire.png`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Float Up, Frame 2 Float Down, Frame 3 Soul-Bell Warning Pulse Attack with cyan ring, Frame 4 Hurt Recoil, Frame 5 Dead shattered iron cage and extinguished skull) of `signal_mite` (Will-o'-Wisp Soul-Lantern): haunted floating gothic wrought-iron cage lantern (#2A353D) housing a cursed bone skull (#D9D2C3) burning with bright soulfire-cyan (#00F0FF) spirit flames and a hanging tarnished-gold (#FFC83D) ritual bell underneath. avoid: radio antennas, sci-fi drones, forced tiny downscale, smooth shading, blur, glow, text.
  ```

#### `silt_mimic.png` (Ravenous Ossuary Coffer Mimic — Weeping Fens)
- **Category**: `enemy_common` | **Apparent Pixel-Grid Vision & Layout**: 5-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like a `40x40` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206962 - Holozon Box.png` + `Enemies/206139 - Holoro Enemies (ID Gen2).png`
- **Dark-Fantasy Visual Description (For GPT Image)**: A moss-and-barnacle-crusted gothic reliquary treasure chest (`#4D3423`, `#1F4D4A`, `#FFC83D` clasps) that splits open at the seam to reveal rows of jagged bone fangs (`#D9D2C3`), four clawed fleshy spider-legs underneath, glaring blood-red (`#FF3B3B`) eyes inside the lid, and a lashing bile-green (`#9CB34C`) tentacle tongue.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the chest proportions of `206962 - Holozon Box.png` scaled to a compact mob cell. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Scuttle A, Frame 2 Scuttle B, Frame 3 Gaping Fang-And-Tongue Ambush Bite, Frame 4 Feign-Death Closed Chest, Frame 5 Dead splintered coffer) of `silt_mimic` (Ravenous Ossuary Coffer Mimic): cursed gothic iron-bound wooden reliquary chest (#4D3423, #2E6962, #FFC83D) that hinges wide open to expose jagged bone teeth (#D9D2C3), glaring crimson eyes (#FF3B3B), and a whipping bile-green (#9CB34C) tongue. avoid: forced tiny downscale, smooth shading, blur, glow, text.
  ```

#### `cinder_crow.png` (Ashen Hellfire Carrion-Crow — Sepulcher of Ash)
- **Category**: `enemy_common` | **Apparent Pixel-Grid Vision & Layout**: 5-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like a `40x40` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Council (EN Gen 2)/529783 - Nanashi Mumei/` + `Enemies/206132 - Myth Enemies (EN Gen1).png` (`KFP`)
- **Dark-Fantasy Visual Description (For GPT Image)**: A three-eyed undead harbinger raven with ragged soot-black plumage (`#0B0D10`, `#1A2228`) whose primary wing-feathers smolder with molten hellfire embers (`#FF5A26`, `#FFC83D`), a bare serrated bone-skull beak (`#D9D2C3`), and trailing cinders.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the compact avian flyer silhouette of `206132 - Myth Enemies.png`. Render at full high resolution (~1.2K canvas) a 5-frame horizontal sprite strip (5 equal square cells side-by-side where each cell visually looks like a 40x40 pixel sprite as an example of apparent pixel density: Frame 1 Wingbeat Up, Frame 2 Wingbeat Down, Frame 3 Blazing Hellfire Dive-Peck Attack, Frame 4 Hurt Recoil, Frame 5 Dead pile of charred feathers and skull) of `cinder_crow` (Ashen Hellfire Carrion-Crow): three-eyed undead gothic raven with ragged soot-black plumage (#1A2228), wingtips burning with molten hellfire ember-orange (#FF5A26), an exposed bleached bone skull beak (#D9D2C3), and glowing crimson eyes (#FF3B3B). avoid: forced tiny downscale, smooth shading, blur, glow, text.
  ```

---

## SECTION 4: ELITE ENEMIES (7-Frame Strips — Move 2, Tell 1, Attack 2, Hurt 1, Dead 1; Rendered at High-Res ~1.2K Canvas, Looking Like `80x80` Cells as an Example)

> **Visual Direction & High-Res Vision Rule for All Elite Enemies**:
> - **Pure Gothic Dark Fantasy**: Every elite enemy is a towering **Gothic Dark Fantasy** champion or monstrosity outlined with a `1px`-style `#FF3B3B` blood-crimson threat aura around its `#0B0D10` dark outline. Frame 3 is always a clear **Telegraph Tell Pose** with a `#FFC83D` sanctum-gold rune/weapon glint so the player can read and counter the attack. Zero modern, sci-fi, or mechanical vehicle parts.
> - **High-Res Canvas (~1.2K) vs. `80x80` Pixel-Density Example**: Render every 7-frame strip at **full high resolution (~1.2K canvas)** where each square cell is drawn with chunky pixel clusters so it **visually looks like an `80x80` sprite as an example** of apparent pixel density—never force a literal tiny `80x80` output or destructive downscale.

### `cleaver_hauler.png` (Catacomb Executioner Brute — Ossuary Nave & Gallows Causeway)
- **Category**: `enemy_elite`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 7-frame horizontal strip (`7:1` aspect ratio) where each square cell **looks like an `80x80` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206549 - Enemies (Miscellaneous).png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (Large Hooded Dead Beat)
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A hulking, muscle-bound undead headsman (looks like `~64x68` apparent pixel-blocks inside an `80x80`-style cell as an example) wearing a blood-stained leather executioner's cowl (`#1A2228`, `#612819`) with a single blazing crimson eye (`#FF3B3B`) visible beneath the hood, spiked black-iron shoulder pauldrons (`#3A3F47`), and heavy iron shackles wrapped around his forearms; in his right hand he drags a colossal notched bone-and-black-iron **Headsman's Guillotine Great-Cleaver** (`#6E757A`, `#8B3A1E`), while his left hand hauls a chained iron-caged **Ossuary Reliquary Coffin** overflowing with skulls (`#D9D2C3`).
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #FF3B3B blood-crimson elite threat outline around a #0B0D10 dark base outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the heavy bruiser proportions of `206549 - Enemies (Miscellaneous).png`. Render at full high resolution (~1.2K canvas) a 7-frame horizontal sprite strip (7 equal square cells side-by-side where each cell visually looks like an 80x80 pixel sprite as an example of apparent pixel density: Frames 1–2 Heavy Lumbering Walk, Frame 3 Gold-Glint Telegraph Windup raising great-cleaver high with #FFC83D spark, Frames 4–5 Overhead Guillotine Cleaver Slam & Brutal Charge, Frame 6 Hurt Recoil, Frame 7 Dead fallen executioner and shattered bone-coffin) of `cleaver_hauler` (Catacomb Executioner Brute): hulking undead gothic headsman in a tattered blood-stained leather hood (#1A2228, #612819) with one glowing blood-red (#FF3B3B) eye, spiked dark-iron pauldrons (#3A3F47), hauling a chained iron-caged ossuary coffin of skulls (#D9D2C3) in his left hand and wielding a colossal notched black-iron executioner's guillotine cleaver (#6E757A) in his right hand. avoid: wheeled shopping carts, welded robot arms, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `lye_strider.png` (Plague Censer-Stalker — Weeping Fens & Sepulcher of Ash)
- **Category**: `enemy_elite`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 7-frame horizontal strip (`7:1` aspect ratio) where each square cell **looks like an `80x80` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png` (Tall Cultist figures) + `Enemies/206549 - Enemies (Miscellaneous).png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A towering, gaunt plague-doctor abomination (looks like `~56x72` apparent pixel-blocks inside an `80x80`-style cell as an example) stalking above the mire on elongated, digitigrade bone-and-wood ritual stilts bound with dark-iron bands (`#D9D2C3`, `#3A3F47`), draped in tattered bog-verdigris (`#1F4D4A`) monk robes; it wears a curved bone crow-beak plague mask with glowing bile-green (`#9CB34C`) eye lenses and carries a giant bubbling glass-and-bronze **Alchemical Plague Cauldron** strapped to its hunched back that spews corrosive green miasma through a skull-mouthed censer hose.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #FF3B3B elite outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the tall, lanky silhouette proportions of `206133 - CouncilRyS Enemies.png` and `206549 - Enemies (Miscellaneous).png`. Render at full high resolution (~1.2K canvas) a 7-frame horizontal sprite strip (7 equal square cells side-by-side where each cell visually looks like an 80x80 pixel sprite as an example of apparent pixel density: Frames 1–2 Tall Stilt Stride, Frame 3 Bubbling Cauldron & Gold-Glint Telegraph Windup, Frames 4–5 Corrosive Bile-Breath & Censer Volley, Frame 6 Hurt Recoil, Frame 7 Dead collapsed bone-stilts and shattered cauldron) of `lye_strider` (Plague Censer-Stalker): tall gothic plague-apothecary abomination walking on towering carved-bone stilts (#D9D2C3, #3A3F47), draped in tattered bog-verdigris vestments (#1F4D4A), wearing a bone crow-beak plague mask with glowing bile-green (#9CB34C) eyes, carrying a bubbling alchemical cauldron of toxic green ichor on its hunched back. avoid: plumbing pipes, sci-fi tanks, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `flats_harvester.png` (Bone-Scythe Reaver Wraith — Gallows Causeway & Sepulcher of Ash)
- **Category**: `enemy_elite`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 7-frame horizontal strip (`7:1` aspect ratio) where each square cell **looks like an `80x80` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli.png` + `Calli_slash2.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206549 - Enemies (Miscellaneous).png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: A terrifying four-armed undead reaper construct (looks like `~68x70` apparent pixel-blocks inside an `80x80`-style cell as an example): the upper torso of a horned, crowned skeletal wraith-lord (`#D9D2C3`, `#FFC83D`) grafted onto a skittering lower body of fused bone-centipede legs and spiked dark-iron coffin plates (`#3A3F47`, `#8B3A1E`), wielding **four colossal blood-drenched crescent war-scythes** (`#FF3B3B`, `#EFE9DA`) that spin in a whirling cyclone of death during its reaping rush.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #FF3B3B elite outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the imposing reaper proportions and wide spinning scythe arcs of `Calli.png` and `Calli_slash2.png`. Render at full high resolution (~1.2K canvas) a 7-frame horizontal sprite strip (7 equal square cells side-by-side where each cell visually looks like an 80x80 pixel sprite as an example of apparent pixel density: Frames 1–2 Skittering Advance, Frame 3 Gold-Glint Telegraph spreading all 4 scythes wide, Frames 4–5 Whirling Blood-Scythe Cyclone Rush, Frame 6 Hurt Recoil, Frame 7 Dead shattered bone-graft and broken scythes) of `flats_harvester` (Bone-Scythe Reaver Wraith): four-armed necromantic reaper abomination with a horned skeletal wraith torso (#D9D2C3) in a tattered crimson mantle (#8B3A1E) grafted onto a lower body of articulated bone-legs and dark-iron plates (#3A3F47), wielding four massive blood-stained crescent war-scythes (#FF3B3B, #FFC83D). avoid: caterpillar tracks, tractors, rotary lawnmowers, vehicles, forced tiny downscale, smooth shading, vector look, 3D render, blur, glow, text.
  ```

### Additional Floor 1 Expansion Elite Enemies (7 frames, Rendered at High-Res ~1.2K Canvas, Looking Like `80x80` Cells as an Example)

#### `plate_marshal.png` (Dread Cathedral Templar — Ossuary Nave)
- **Category**: `enemy_elite` | **Apparent Pixel-Grid Vision & Layout**: 7-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like an `80x80` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (Red Shielded Dead Beat) + `Playable Characters - Fantasy (JP Gen 3)/530011 - Shirogane Noel/Noel.png`
- **Dark-Fantasy Visual Description (For GPT Image)**: A towering fallen paladin commander (looks like `~64x70` apparent pixel-blocks inside an `80x80`-style cell as an example) clad in heavy fluted black-iron cathedral plate (`#2A353D`, `#3A3F47`) with a horned greathelm, tattered crimson cape (`#8B3A1E`), an iron war-banner standard rising from his back, a massive skull-embossed **Cathedral Tower Shield** held in front to block frontal attacks, and a runed executioner broadsword.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Scale the shielded skeleton soldier of `206132 - Myth Enemies.png` and heavy plate of `Noel.png` up to an imposing elite knight with a 1px-style #FF3B3B elite outline. Render at full high resolution (~1.2K canvas) a 7-frame horizontal strip (7 equal square cells where each cell visually looks like an 80x80 pixel sprite as an example of apparent pixel density: Frames 1–2 Heavy March, Frame 3 Gold War-Banner Command Tell, Frames 4–5 Fortress Shield-Bash & Broadsword Cleave, Frame 6 Hurt, Frame 7 Dead collapsed armor) of `plate_marshal` (Dread Cathedral Templar): towering undead fallen paladin in blackened gothic plate armor (#2A353D, #3A3F47) with a horned greathelm, tattered crimson cloak (#8B3A1E), dorsal iron command banner, a massive skull-faced tower shield braced in front, and a cursed broadsword. avoid: riot shields, modern gear, forced tiny downscale, smooth shading, blur, glow, text.
  ```

#### `switchback_driver.png` (Nightmare Hell-Steed Outrider — Gallows Causeway)
- **Category**: `enemy_elite` | **Apparent Pixel-Grid Vision & Layout**: 7-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like an `80x80` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206497 - Stage 2 Mini Boss (Mikodanye).png` + `Enemies/206549 - Enemies (Miscellaneous).png`
- **Dark-Fantasy Visual Description (For GPT Image)**: A skull-helmed Dark-Fantasy Death-Knight outrider (looks like `~68x68` apparent pixel-blocks inside an `80x80`-style cell as an example) mounted atop a barded **Skeletal Nightmare Warhorse** (`#1A2228`, `#D9D2C3`) armored in spiked crimson-and-black-iron chamfron barding (`#8B3A1E`, `#3A3F47`) with hellfire-orange (`#FF5A26`) flames snorting from the steed's nostrils and hooves, couching a wicked barbed jousting war-lance (`#FFC83D` tip) for feint-and-ram charges.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the charging cavalry/bruiser silhouette of `206549 - Enemies (Miscellaneous).png` with a 1px-style #FF3B3B elite outline. Render at full high resolution (~1.2K canvas) a 7-frame horizontal strip (7 equal square cells where each cell visually looks like an 80x80 pixel sprite as an example of apparent pixel density: Frames 1–2 Canter, Frame 3 Rearing Hoof-Flame Feint/Charge Tell, Frames 4–5 Blazing Lance Twin-Charge, Frame 6 Hurt, Frame 7 Dead fallen steed and rider) of `switchback_driver` (Nightmare Hell-Steed Outrider): dark-fantasy undead cavalier knight mounted on a skeletal Nightmare warhorse (#D9D2C3, #1A2228) clad in spiked black-iron and crimson barding (#3A3F47, #8B3A1E), hellfire-orange (#FF5A26) flames flaring from its hooves and nostrils, couching a heavy barbed jousting lance (#FFC83D). avoid: motorcycles, monowheels, tires, exhaust pipes, forced tiny downscale, smooth shading, blur, glow, text.
  ```

#### `sump_cantor.png` (Mire Hex-Chanter — Weeping Fens)
- **Category**: `enemy_elite` | **Apparent Pixel-Grid Vision & Layout**: 7-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like an `80x80` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png` (Hooded Hooman) + `Playable Characters - JP Gen 2/529968 - Murasaki Shion/Shion.png`
- **Dark-Fantasy Visual Description (For GPT Image)**: A hunched, antler-crowned swamp-necromancer high priest (looks like `~58x68` apparent pixel-blocks inside an `80x80`-style cell as an example) draped in layered bog-verdigris (`#1F4D4A`) and rotted parchment ritual vestments inscribed with blood runes, wearing a bleached stag-skull mask (`#D9D2C3`) and swinging a heavy three-bell tarnished-gold **Plague Carillon Crozier** (`#FFC83D`) that radiates concentric bile-green (`#9CB34C`) hex waves to empower nearby monsters.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the robed occult caster silhouette of `206133 - CouncilRyS Enemies.png` with a 1px-style #FF3B3B elite outline. Render at full high resolution (~1.2K canvas) a 7-frame horizontal strip (7 equal square cells where each cell visually looks like an 80x80 pixel sprite as an example of apparent pixel density: Frames 1–2 Ritual Procession Walk, Frame 3 Bell-Toll Channel Tell with #FFC83D glint, Frames 4–5 Necrotic Bog-Hex Ring Pulse, Frame 6 Hurt, Frame 7 Dead crumpled robes and broken crozier) of `sump_cantor` (Mire Hex-Chanter): hunched dark-fantasy swamp high priest in layered bog-verdigris (#1F4D4A) vestments wearing a bleached horned stag-skull mask (#D9D2C3) and swinging a tarnished-gold plague-bell crozier staff (#FFC83D) that emits bile-green (#9CB34C) hex rings. avoid: forced tiny downscale, smooth shading, blur, glow, text.
  ```

#### `bore_sentinel.png` (Ash-Burrower Wyrmling — Sepulcher of Ash)
- **Category**: `enemy_elite` | **Apparent Pixel-Grid Vision & Layout**: 7-frame horizontal strip rendered at ~1.2K resolution where each cell **looks like an `80x80` sprite as an example** (8 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Force (JP Gen 4)/530030 - Kiryu Coco/` + `Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`
- **Dark-Fantasy Visual Description (For GPT Image)**: A vicious subterranean lesser bone-dragon / basilisk wyrm (looks like `~68x68` apparent pixel-blocks inside an `80x80`-style cell as an example) erupting waist-deep from a churning ring of blood-red catacomb ash (`#8B3A1E`), armored in overlapping blackened obsidian scales (`#2A353D`) and bleached vertebral crest-spikes (`#D9D2C3`), with four splitting mandibles revealing a white-hot molten brimstone gullet (`#FF5A26`, `#FFC83D`).
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the armoured reptile/drake proportions of `206495 - Stage 1 Mini Boss (Fubuzilla).png` with a 1px-style #FF3B3B elite outline. Render at full high resolution (~1.2K canvas) a 7-frame horizontal strip (7 equal square cells where each cell visually looks like an 80x80 pixel sprite as an example of apparent pixel density: Frames 1–2 Coiled Slither, Frame 3 Subterranean Burrow Tremor Tell, Frames 4–5 Explosive Breach & Molten Brimstone Spit, Frame 6 Hurt, Frame 7 Dead shattered wyrm skull in ash) of `bore_sentinel` (Ash-Burrower Wyrmling): ferocious subterranean dark-fantasy bone-and-obsidian wyrmling (#2A353D, #D9D2C3) bursting from a collar of crimson ash (#8B3A1E) with horned dragon jaws and a glowing molten hellfire (#FF5A26, #FFC83D) throat core. avoid: mechanical drills, pipes, forced tiny downscale, smooth shading, blur, glow, text.
  ```

---

## SECTION 5: BOSSES & THE 4 GREAT BLOODLINES (`9 Frames`: Idle 2, Attack A 2, Attack B 2, Phase-Change 1, Dead 2; Rendered at High-Res ~1.2K Canvas)

> **Visual Direction & High-Res Vision Rule for All 4 Floor 1 Overlord Bosses**:
> - **Pure Gothic Dark Fantasy**: Every Overlord Boss is a monumental **Gothic Dark Fantasy** sovereign entity outlined in a `1px`-style `#FFC83D` sanctum-gold boss border over `#0B0D10` abyssal soot. Do **not** draw any excavators, caterpillar treads, semi-trucks, headlights, hazmat tarps, chemical drums, or boiler pipes—each boss is an ancient dark-fantasy lord of bone, cursed black-iron, necrotic mire, or draconic ash.
> - **High-Res Canvas (~1.2K) vs. Boss Pixel-Density Example**: Render every 9-frame strip (or 3×3 master grid) at **full high resolution (~1.2K canvas)** where each cell is drawn with chunky pixel clusters that **visually look like a `192x192` / `224x160` / `256x192` 16-bit boss sprite as an example** of apparent pixel density—never force a destructive downscale.

### `the_foreman.png` (High Executioner Malgorth — House of Malgorth, North Sector Overlord)
- **Category**: `boss`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 9-frame boss strip (or 3×3 sheet) where each cell **looks like a `192x192` boss sprite as an example** of apparent pixel density (6 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206501 - Stage 3 Mini Boss (Shubangelion).png` (giant articulated colossus)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli.png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: **High Executioner Malgorth**, a gargantuan **Undead Ossuary Bone-Colossus & Cathedral Executioner Lord** (looks like `~160` apparent pixel-blocks tall inside a `192x192`-style boss cell as an example) fused onto a walking throne-fortress of giant skeletal titan ribs (`#D9D2C3`), spiked black-iron gothic arches (`#2A353D`, `#3A3F47`), and tattered crimson velvet inquisitor banners (`#8B3A1E`). Atop the rib-caged reliquary torso towers Malgorth himself in a jagged sanctum-gold crown-helm (`#FFC83D`) with blazing soulfire-cyan (`#00F0FF`) and blood-red (`#FF3B3B`) eyes. His colossal right arm wields a rune-carved **Cathedral Guillotine Greataxe**, while his left arm swings a massive spiked **Iron-Maiden Censer Flail** on thick dungeon chains that draws sacrificial thralls inward during his 30-second Reassembly Ritual.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #FFC83D sanctum-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the towering colossus silhouette weight and multi-limb articulation of attached `206501 - Stage 3 Mini Boss (Shubangelion).png`. Render at full high resolution (~1.2K canvas) a 9-frame boss sprite strip (9 equal square cells where each cell visually looks like a 192x192 pixel boss sprite as an example of apparent pixel density: Frames 1–2 Heavy Sovereign Idle, Frames 3–4 Attack A Colossal Guillotine Greataxe Slam, Frames 5–6 Attack B Chained Iron-Maiden Censer Flail Sweep, Frame 7 Phase-Change Soul-Harvest Reassembly Ritual Roar with soulfire-cyan #00F0FF and blood-red #FF3B3B necromantic vortex, Frames 8–9 Defeated shattered bone-throne and fallen crown) of `the_foreman` (High Executioner Malgorth): gargantuan dark-fantasy undead ossuary colossus armored in blackened cathedral plate (#2A353D, #3A3F47), giant bleached titan ribs (#D9D2C3), and tattered crimson banners (#8B3A1E), wearing a jagged gold crown-helm (#FFC83D), wielding a massive rune-etched guillotine greataxe in his right hand and a chained spiked iron-maiden censer flail in his left hand. avoid: excavators, caterpillar treads, construction vehicles, cabs, forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `big_axle.png` (Dread Cavalier Varkos — Cavalcade of Varkos, West Sector Overlord)
- **Category**: `boss`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 9-frame boss strip where each cell **looks like a `224x160` wide boss sprite as an example** of apparent pixel density (6 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206502 - Stage 3 Hard Boss (Myth or Treat).png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206497 - Stage 2 Mini Boss (Mikodanye).png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: **Dread Cavalier Varkos**, a gargantuan **Six-Legged Skeletal Nightmare Centaur-Archfiend & Death-Knight Monarch** (looks like `~200x140` apparent pixel-blocks inside a `224x160`-style boss cell as an example) with **zero wheels, zero chariot, and zero vehicle parts**. His lower body is a monstrous six-legged armored undead Nightmare War-Stallion (`#D9D2C3`, `#1A2228`) galloping on **six blazing hellfire-shod cloven iron hooves** (`#FF5A26`) and clad in spiked black-iron and blood-crimson cathedral cataphract barding (`#3A3F47`, `#8B3A1E`) with a horned demon-skull chest-ram (`#FFC83D`) at the breast. Rising from the beast's shoulders is Varkos's towering horned Death-Knight torso draped in a tattered crimson mantle, wielding a colossal rune-etched **Executioner's Dread-Halberd** in his right hand and dragging a spiked **Chained Ossuary Skull-Flail** in his left; during his Overheated phase (Frame 7), his armored ribcage splits wide open to expose a volatile blazing **Hellfire Soul-Furnace Heart** (`#FF3B3B` / `#FFE478`).
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #FFC83D sanctum-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the wide horizontal boss footprint and charge telegraph poses of `206502 - Stage 3 Hard Boss (Myth or Treat).png` and `206497 - Stage 2 Mini Boss (Mikodanye).png`. Render at full high resolution (~1.2K canvas) a 9-frame boss sprite strip (9 equal wide cells where each cell visually looks like a 224x160 pixel boss sprite as an example of apparent pixel density: Frames 1–2 Snorting Six-Legged Nightmare Centaur Idle, Frames 3–4 Attack A Full-Gallop Horned Demon-Breast Ram & Halberd Charge, Frames 5–6 Attack B Chained Ossuary Skull-Flail Sweep & Hellfire Hoof Stomp, Frame 7 Overheated Exposed Soul-Heart Phase with split ribcage and blazing blood-crimson #FF3B3B chest core, Frames 8–9 Defeated collapsed skeletal centaur-lord) of `big_axle` (Dread Cavalier Varkos): gargantuan dark-fantasy six-legged skeletal Nightmare centaur-archfiend with six blazing hellfire-shod cloven hooves (#FF5A26), armored in spiked black-iron (#3A3F47) and blood-crimson (#8B3A1E) cataphract barding with giant bleached bones (#D9D2C3) and gold runes (#FFC83D), topped by a horned Death-Knight sovereign wielding a colossal dread-halberd and chained skull-flail. avoid: wheels, chariots, carts, wagons, semi-trucks, cars, rubber tires, headlights, windshields, trailers, vehicles, forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `mother_sump.png` (Bog-Matriarch Hagra — Coven of Hagra, East Sector Overlord)
- **Category**: `boss`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 9-frame boss strip where each cell **looks like a `192x192` boss sprite as an example** of apparent pixel density (6 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206500 - Stage 3 Boss (Hachama).png` (eldritch spider/abomination boss)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206504 - Stage 4 Boss (Area 15).png`
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: **Bog-Matriarch Hagra**, a grotesquely sprawling **Eldritch Swamp Hag-Queen & Leech-Brood Mother** (looks like `~165x165` apparent pixel-blocks inside a `192x192`-style boss cell as an example) rising waist-deep from a bubbling dark bog-verdigris (`#1F4D4A`) mire pool. Her upper torso is a four-armed, antler-crowned crone witch draped in rotting bog-moss shawls, hanging skull fetishes (`#D9D2C3`), and tarnished gold coven talismans (`#FFC83D`), while her lower body is a colossal, translucent, pulsing **Bile-Green Brood-Sac Abdomen** (`#6B8036`, `#9CB34C`) teeming with writhing leech-tentacles and gaping lamprey mouths that suck in brood-spawn to heal.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #FFC83D sanctum-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the sprawling eldritch boss silhouette and multi-part body mass of attached `206500 - Stage 3 Boss (Hachama).png`. Render at full high resolution (~1.2K canvas) a 9-frame boss sprite strip (9 equal square cells where each cell visually looks like a 192x192 pixel boss sprite as an example of apparent pixel density: Frames 1–2 Heaving Mire Idle, Frames 3–4 Attack A Corrosive Bile Deluge & Leech-Tentacle Lash, Frames 5–6 Attack B Ravenous Brood-Devour Suction Channel, Frame 7 Starved / Enraged Phase with ruptured glowing bile-green #9CB34C brood-sac, Frames 8–9 Defeated sunken mire carcass) of `mother_sump` (Bog-Matriarch Hagra): grotesque dark-fantasy eldritch swamp hag-queen half-submerged in a dark bog-teal (#1F4D4A) pool, crowned with twisted bone antlers and skull talismans (#D9D2C3, #FFC83D), four clawed witch arms, fused to a massive pulsing bile-green (#9CB34C) leech brood-sac abdomen surrounded by writhing lamprey tendrils. avoid: hazmat suits, chemical drums, plastic tarps, forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `the_long_dry.png` (Catacomb Elder-Wyrm Skarath — Brood of Skarath, South Sector Overlord)
- **Category**: `boss`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 9-frame boss strip where each cell **looks like a `256x192` boss sprite as an example** of apparent pixel density (6 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Force (JP Gen 4)/530030 - Kiryu Coco/` (Dragon tail/body segments)
- **Dark-Fantasy Visual Description (For GPT Image)**:
  - **What It Looks Like**: **Catacomb Elder-Wyrm Skarath**, a gargantuan subterranean **Undead Bone-And-Obsidian Elder Dragon Wyrm** (looks like `~230x170` apparent pixel-blocks inside a `256x192`-style boss cell as an example) coiling upward from a churning crater of blood-crimson catacomb ash (`#8B3A1E`). Its serpentine body is formed from colossal bleached dragon vertebrae (`#D9D2C3`) and **three breakable dark-iron & obsidian dorsal carapace plates** (`#2A353D`, `#3A3F47`) etched with glowing gold runes (`#FFC83D`), topped by a horned draconic skull with four splitting mandibles and a throat blazing with hellfire-amber (`#FF5A26`, `#FFE478`) dragon-breath.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #FFC83D sanctum-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the segmented serpentine/kaiju scale of `206495 - Stage 1 Mini Boss (Fubuzilla).png`. Render at full high resolution (~1.2K canvas) a 9-frame boss sprite strip (9 equal cells where each cell visually looks like a 256x192 pixel boss sprite as an example of apparent pixel density: Frames 1–2 Coiled Subterranean Breach Idle, Frames 3–4 Attack A High-Arcing Dragon-Jaw Crush Slam, Frames 5–6 Attack B Ash-Vortex & Brimstone Breath Barrage, Frame 7 Carapace-Shattered Exposed Molten Rib-Core Phase, Frames 8–9 Defeated colossal dragon skeleton in red ash) of `the_long_dry` (Catacomb Elder-Wyrm Skarath): gargantuan dark-fantasy subterranean undead dragon-wyrm bursting upward from a crater of crimson ash (#8B3A1E), its sinuous body composed of giant bleached dragon vertebrae (#D9D2C3) armored with 3 breakable obsidian-and-gold carapace plates (#2A353D, #FFC83D) along its spine, and a horned dragon skull with splitting fang-lined jaws glowing with molten hellfire (#FF5A26). avoid: boiler pipes, mechanical rotary drills, machines, forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

---

## SECTION 6: COMBAT VFX, PROJECTILES & ULTIMATE CUT-INS (`fx` Category — Rendered at High-Res ~1.2K Canvas)

### `fx_slash_smear.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 5-frame horizontal strip (`5:1` aspect ratio) where each square cell **looks like a `128x128` VFX sprite as an example** of apparent pixel density (24 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_slash.png` (5-frame crescent slash progression)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png` (`Main - Phoenix Sword` 5-frame crescent strip)
- **Dark Fantasy Visual Design**:
  - **What It Looks Like**: A razor-sharp **Soulfire Katana Crescent Slash Wave** with a pure bone-white (`#EFE9DA`) core and a jagged soulfire-cyan (`#00F0FF` / `#088A9E`) outer edge that expands and dissipates into cursed rune sparks across 5 frames.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, zero anti-aliasing, zero blur, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Directly match the 5-frame crescent sword-slash smear progression of Row 1 in attached `Ayame_slash.png` and `204696 - Takanashi Kiara.png` (Main - Phoenix Sword). Render at full high resolution (~1.2K canvas) a 5-frame horizontal VFX sprite strip (5 equal square cells side-by-side where each cell visually looks like a 128x128 pixel VFX sprite as an example of apparent pixel density) of `fx_slash_smear`: Frame 1 initial razor crescent arc; Frame 2 wide full-bodied crescent sword smear; Frame 3 tapering crescent; Frame 4 thin trailing razor arc; Frame 5 final pixel fragments fading out. Colored with a pure bone-white (#EFE9DA) inner core and a 2-pixel-block soulfire-cyan (#00F0FF) and deep-teal (#088A9E) outer edge. avoid: soft airbrush glow, alpha gradient blur, 3D render, text.
  ```

### `fx_dash_streak.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 4-frame horizontal strip where each cell **looks like a `160x48` VFX sprite as an example** of apparent pixel density (24 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Fan Dash` 4-frame horizontal blue streak section)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the 4-frame horizontal dash burst progression of `Fan Dash` in attached `206506 - Effects.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal VFX sprite strip (4 equal wide cells where each cell visually looks like a 160x48 pixel VFX sprite as an example of apparent pixel density) of `fx_dash_streak`: sharp horizontal pixel speed-streak lines and phantom shadow-step wind in bone-white (#EFE9DA) and soulfire-cyan (#00F0FF) that stretch across the frame on Frame 1 and progressively thin and break into pixel dashes across Frames 2, 3, and 4. avoid: motion blur, soft gradients, text.
  ```

### `fx_hit_cross.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `48x48` VFX sprite as an example** of apparent pixel density (24 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Use Special` 4-point star impact flash & `Explode` Frames 1–2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the crisp 4-point star/cross impact flash of `Use Special` in attached `206506 - Effects.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal VFX sprite strip (3 equal square cells where each cell visually looks like a 48x48 pixel VFX sprite as an example of apparent pixel density) of `fx_hit_cross`: a sharp diagonal X-cross blade impact spark burst with a bone-white (#EFE9DA) center and soulfire-cyan (#00F0FF) tips, expanding on Frame 1, peaking with detached pixel sparks on Frame 2, and shrinking on Frame 3. avoid: soft lens flare, blur, gradients, text.
  ```

### `fx_shards.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 4-frame horizontal strip (`4:1` aspect ratio) where each cell **looks like a `64x64` VFX sprite as an example** of apparent pixel density (20 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Rubble` 9-cell grid)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206508 - Pickups.png` (`Crate` splinter fragments)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the pixel debris/shrapnel chunks of `Rubble` in `206506 - Effects.png` and `Crate` in `206508 - Pickups.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal VFX sprite strip (4 equal square cells where each cell visually looks like a 64x64 pixel VFX sprite as an example of apparent pixel density) of `fx_shards`: 6 jagged bleached bone splinters (#D9D2C3), dark obsidian armor fragments (#6E757A), and blood-ember sparks (#D16B38) blasting radially outward from the center from Frame 1 to Frame 4. avoid: blur, soft glow, text.
  ```

### `fx_shock_ring.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6-frame horizontal strip (`6:1` aspect ratio) where each cell **looks like a `256x256` VFX sprite as an example** of apparent pixel density (20 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Explode` 8-frame expanding shockwave ring & `Use Special` ring)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down perspective. REFERENCE-GUIDED INSTRUCTION: Directly match the expanding serrated pixel shockwave ring progression of `Explode` in attached `206506 - Effects.png`, foreshortened into a 3/4 top-down ellipse. Render at full high resolution (~1.2K canvas) a 6-frame horizontal VFX sprite strip (6 equal square cells where each cell visually looks like a 256x256 pixel VFX sprite as an example of apparent pixel density) of `fx_shock_ring`: an expanding top-down elliptical ground shockwave ring with jagged bone-white (#EFE9DA) inner spikes, soulfire-cyan (#00F0FF) energy rim, and soot-black (#0B0D10) catacomb stone dust, growing from a tight inner ring in Frame 1 to a wide dissipated ring in Frame 6. avoid: smooth airbrush blur, gradients, 3D render, text.
  ```

### `fx_ground_cracks.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `192x192` ground decal as an example** of apparent pixel density (1 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Ground Crack` rectangular radial fissure decal)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Directly use the jagged pixel fissure network style of `Ground Crack` in attached `206506 - Effects.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (3 equal square cells showing 3 distinct radial crack variations, where each cell visually looks like a 192x192 pixel decal as an example of apparent pixel density) of `fx_ground_cracks`: top-down radial impact crater fissures with soot-black (#0B0D10) and dark-slate (#3A3F47) shattered stone rims and a 1-pixel-block soulfire-cyan (#00F0FF) abyssal rift vein glowing deep inside the central cracks. avoid: smooth shading, blur, soft glow, text.
  ```

### `fx_dust_puff.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 4-frame horizontal strip (`4:1` aspect ratio) where each cell **looks like a `48x48` VFX sprite as an example** of apparent pixel density (16 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Smoke` and `Smoke VFX` 6-frame pixel cloud strips)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the cel-shaded pixel smoke cloud clusters of `Smoke VFX` in attached `206506 - Effects.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal VFX sprite strip (4 equal square cells where each cell visually looks like a 48x48 pixel VFX sprite as an example of apparent pixel density) of `fx_dust_puff`: a billowy impact crypt-ash and bone-dust puff in dark-slate (#4F565E), dried blood-rust (#8B3A1E), and bone-ash (#B8B2A2) that bursts outward in Frame 1, curls in Frame 2, separates into smaller cloudlets in Frame 3, and dissipates in Frame 4. avoid: soft airbrush smoke, alpha blur, text.
  ```

### `rail_spike.png` (Dark Fantasy Role: **Soulfire Javelin / Runic Bone-Lance Projectile**)
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 4-frame horizontal strip (`4:1` aspect ratio) where each cell **looks like a `16x16` projectile sprite as an example** of apparent pixel density (1 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoro (ID Gen 2)/530067 - Anya Melfissa/Anya_Blade.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529971 - Yuzuki Choco/Choco_Needle.png`
- **Dark Fantasy Visual Design**:
  - **What It Looks Like**: A consecrated **Soulfire Javelin / Runic Bone-Lance** with a carved dark-iron and bone shaft (`#3A3F47`, `#D9D2C3`), winged tarnished-gold cross-guards (`#FFC83D`), and a blazing soulfire-cyan (`#00F0FF`) and bone-white (`#EFE9DA`) barbed spearhead. (No railway spikes or industrial hardware.)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the crisp small thrown blade/dagger pixel clarity of `Anya_Blade.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal projectile strip (4 equal square cells where each cell visually looks like a 16x16 pixel projectile sprite as an example of apparent pixel density) of `rail_spike` (Soulfire Javelin): a dark-fantasy runic throwing lance with a dark-iron and bone shaft (#3A3F47, #D9D2C3), tiny gold winglet crossguard (#FFC83D), and a blazing soulfire-cyan (#00F0FF) and bone-white (#EFE9DA) barbed spearhead, drawn at 4 exact orientations: Frame 1 pointing Right (0°), Frame 2 pointing Down-Right (45°), Frame 3 pointing Down (90°), Frame 4 pointing Up-Right (-45°). avoid: railroad spikes, industrial nails, forced tiny downscale, blur, anti-aliasing, text.
  ```

### `fx_spark.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip (`3:1` aspect ratio) where each cell **looks like a `24x24` spark sprite as an example** of apparent pixel density (24 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta_Flash.png` + `206506 - Effects.png` (`Explode` Frame 1)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match `Zeta_Flash.png` metal hit-spark geometry. Render at full high resolution (~1.2K canvas) a 3-frame horizontal VFX sprite strip (3 equal square cells where each cell visually looks like a 24x24 pixel spark sprite as an example of apparent pixel density) of `fx_spark`: a crisp sword-on-armor clash spark burst with 4 radiating pixel needles in bone-white (#EFE9DA), sanctum-gold (#FFC83D), and soulfire-cyan (#00F0FF) expanding across 3 frames. avoid: soft glow, blur, text.
  ```

### `ultimate_cutin.png` (Sena Ibuki — *Seven Seals of Eclipse* Cut-In)
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` widescreen banner canvas, `4:1` aspect ratio) where the pixel-cluster density **looks like a `480x120` 16-bit anime cut-in banner as an example**
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Anime Zoom` speed-line border strips)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` (Close-up eye crop)
- **Dark Fantasy Visual Design**:
  - **What It Looks Like**: An extreme widescreen anime close-up of **Sena Ibuki's blazing soulfire-cyan eyes** (`#00F0FF`) beneath her **tarnished gold winged brow-circlet** (`#FFC83D`) with a glowing cyan soul-gem in the center of her forehead, framed by windswept crimson-rust bangs (`#D16B38`) and razor-sharp dimensional slash lines. (No goggles.)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2K widescreen canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Combine the dramatic close-up eye framing of `Ayame_Port.png` with the high-contrast radial pixel speed-lines of `Anime Zoom` in `206506 - Effects.png`. Render at full high resolution (~1.2K canvas) a 4:1 widescreen cinematic anime ultimate cut-in banner (visually looking like a 480x120 pixel cut-in banner as an example of apparent pixel density) of Sena Ibuki: extreme close-up across her eyes and forehead framed by top and bottom soulfire-cyan (#00F0FF) slash borders, windswept crimson-rust bangs (#8B3A1E, #D16B38) and her tarnished gold winged brow-circlet (#FFC83D) with a glowing cyan soul-gem at the top, her eyes blazing luminous soulfire-cyan (#00F0FF) with bone-white (#EFE9DA) slit highlights, set against a soot-black (#0B0D10) background streaked with razor-sharp bone and dark-slate horizontal speed lines. avoid: goggles, glasses, modern eyewear, smooth shading, soft airbrush glow, blur, text, letters.
  ```

### `fx_ult_slash.png`
- **Category**: `fx`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal strip where each cell **looks like a `320x40` spatial slash sprite as an example** of apparent pixel density (24 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 1/529822 - Aki Rosenthal/Aki_akibeam.png` + `529969 - Nakiri Ayame/Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the long screen-cleaving pixel beam/slash taper of `Aki_akibeam.png` and `Ayame_spiritslash.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal VFX sprite strip (3 equal wide cells where each cell visually looks like a 320x40 pixel slash sprite as an example of apparent pixel density) of `fx_ult_slash` (Seven Seals of Eclipse spatial rift cut): a long tapered dimensional sword-slash line with a pure bone-white (#EFE9DA) core and jagged soulfire-cyan (#00F0FF) rift edges, shown in 3 intensity frames (full spatial cleave, fracturing rift line, dissipating cyan sparks). avoid: soft blur, airbrush glow, text.
  ```

---

## SECTION 7: WORLD GROUND TILES (Seamless Strips — Rendered at High-Res ~1.2K Canvas, Looking Like `16x16` Tiles as an Example)

### `tile_kettle.png` (Duskhollow Town / Sanctuary Bastion Ground Tile)
- **Category**: `tile`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal tile strip (`3:1` aspect ratio) where each square tile **looks like a `16x16` pixel tile as an example** of apparent pixel-block density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Floor` 3-column dark stone & warm brick tiles)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the subtle low-contrast pixel stone texture density of the `Floor` section in attached `206852 - Stage 3 - Halloween Castle.png` so sprites remain 100% readable on top. Render at full high resolution (~1.2K canvas) a 3-frame horizontal tile strip (3 seamless square ground tile variants side-by-side where each tile visually looks like a 16x16 pixel tile as an example of apparent pixel density, 100% opaque) of `tile_kettle` (Duskhollow Town Sanctuary): ancient soot-and-slate medieval cobblestone (#11171B, #1A2228) blended with warm hearth-lit courtyard earth (#3B1C18) and weathered flagstone seams. avoid: high-contrast noise, forced tiny downscale, 3D bevels, blur.
  ```

### `tile_slab_town.png` (The Ossuary Nave — Ruined Catacomb Flagstones)
- **Category**: `tile`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal tile strip (`3:1` aspect ratio) where each square tile **looks like a `16x16` pixel tile as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Floor` first column dark blue-grey crypt stone)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the dark crypt flagstone texture of `Floor` Column 1 in `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal tile strip (3 seamless square ground tile variants side-by-side where each tile visually looks like a 16x16 pixel tile as an example of apparent pixel density, 100% opaque) of `tile_slab_town` (The Ossuary Nave): fractured dark gothic cathedral paving stones (#182429, #2A353D) scattered with tiny bleached bone-dust flecks (#545D5A) and hairline crypt cracks. avoid: bright highlights, noisy contrast, forced tiny downscale, blur.
  ```

### `tile_route_9.png` (The Gallows Causeway — Cursed Basalt Via Dolorosa)
- **Category**: `tile`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal tile strip (`3:1` aspect ratio) where each square tile **looks like a `16x16` pixel tile as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle.png` (`Floor` dark stone tiles)
- **Dark Fantasy Visual Design**:
  - **What It Looks Like**: Ancient **Scorched Basalt War-Road Flagstones** (`#0B0D10`, `#182429`) carved with sunken chariot wheel ruts and inlaid with a faded tarnished-gold (`#593E18`, `#946B22`) **Processional Rune Border** down the center of Variant 2. (No modern highway asphalt or road lane paint.)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the low-contrast dark stone tile style of `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal tile strip (3 seamless square ground tile variants side-by-side where each tile visually looks like a 16x16 pixel tile as an example of apparent pixel density, 100% opaque) of `tile_route_9` (The Gallows Causeway): scorched soot-black basalt war-road flagstones (#0B0D10, #182429) with worn chariot grooves, and Variant 2 featuring a faded tarnished sanctum-gold (#593E18, #946B22) inlaid runic border down the center. avoid: modern highway asphalt, bright white road lines, forced tiny downscale, blur, gradients.
  ```

### `tile_lye_marsh.png` (The Weeping Fens — Plague-Blighted Mire)
- **Category**: `tile`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal tile strip (`3:1` aspect ratio) where each square tile **looks like a `16x16` pixel tile as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206841 - Stage 1 Hard - Grassy Plains (Night).png` + `206852 - Stage 3 - Halloween Castle.png` (`Berry Juice` puddle shapes)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the dark night-ground palette of `206841 - Stage 1 Hard (Night).png` and puddle shapes of `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal tile strip (3 seamless square ground tile variants side-by-side where each tile visually looks like a 16x16 pixel tile as an example of apparent pixel density, 100% opaque) of `tile_lye_marsh` (The Weeping Fens): dark bog-teal mire mud (#11292B, #173B3A) with shallow cursed venom-green (#3A4A24) fens puddles and damp cemetery moss pixels. avoid: neon green, noisy contrast, forced tiny downscale, blur.
  ```

### `tile_copper_flats.png` (The Sepulcher of Ash — Blood-Stained Catacomb Wastes)
- **Category**: `tile`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 3-frame horizontal tile strip (`3:1` aspect ratio) where each square tile **looks like a `16x16` pixel tile as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Floor` Column 2 rust-brown stone & Column 3 dark crimson)
- **Dark Fantasy Visual Design**:
  - **What It Looks Like**: Wind-rippled **Blood-Crimson Cremation Ash and Shattered Bone-Sand** (`#3B1C18`, `#612819`, `#8B3A1E`) dotted with dark obsidian fragments and tiny calcified bone chips.
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the warm dark rust-brown value range of `Floor` Column 2 in `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal tile strip (3 seamless square ground tile variants side-by-side where each tile visually looks like a 16x16 pixel tile as an example of apparent pixel density, 100% opaque) of `tile_copper_flats` (The Sepulcher of Ash): wind-rippled dark crimson cremation ash and red bone-dust dunes (#3B1C18, #612819, #8B3A1E) dotted with tiny dark obsidian stones and bone fragments. avoid: bright neon orange, forced tiny downscale, blur, gradients.
  ```

### `tile_transitions.png`
- **Category**: `tile`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 6-frame horizontal tile strip (`6:1` aspect ratio) where each square tile **looks like a `16x16` pixel tile as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206142 - Stage 1 - Grassy Plains.png` + `206852 - Stage 3 - Halloween Castle.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the pixel-stepped tile transition borders in `206142 - Stage 1 - Grassy Plains.png` and `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution (~1.2K canvas) a 6-frame horizontal tile strip (6 seamless square edge-transition tiles side-by-side where each tile visually looks like a 16x16 pixel tile as an example of apparent pixel density, 100% opaque) blending between Duskhollow sanctuary cobblestone (#1A2228), Ossuary Nave crypt flagstones (#2A353D), Gallows Causeway black basalt (#0B0D10), Weeping Fens bog-mire (#173B3A), and Sepulcher crimson cremation ash (#612819). avoid: soft alpha blending, forced tiny downscale, blur, gradients.
  ```

---

## SECTION 8: WORLD PROPS & DUSKHOLLOW STRUCTURES (40 Pure Gothic Dark Fantasy Props across 5 Regions, Rendered at High-Res ~1.2K Canvas with Baked Ground Shadow Ellipse)

> **Structural Reference & High-Res Vision Rule for All Props**:
> - Attach `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Rubble`, `Furniture`, `Decorations`, `Walls`), `Holo House/206123 - Furniture - Structure.png`, and `Holo House/206141 - NPCs.png`.
> - **Dark Fantasy Prop Rule**: Every single world prop keeps its exact manifest filename (`prop_*`) for engine compatibility, but its visual appearance is **100% Gothic Dark Fantasy** (ancient catacomb masonry, bone reliquaries, dark-iron braziers, shattered gargoyles, wrecked gothic war-carriages, cursed obelisks, plague cauldrons, and fallen dragon skeletons — **zero modern cars, trucks, shopping carts, vending machines, oil drums, rubber tires, rebar, or radar dishes**). Every prop sits on a baked solid `#0B0D10` soot-black elliptical ground shadow on `#FF00FF` magenta.
> - **High-Res Canvas (~1.2K) vs. Prop Pixel-Density Example**: Render every prop at **full high resolution (~1.2K canvas)** where the chunky pixel clusters **visually look like the listed pixel-grid example (e.g., `96x96`, `80x64`, `32x32` as an example of apparent pixel density)**—never force a destructive downscale to tiny dimensions.

### 8.1 Kettle / Duskhollow Town Props (8 Sanctuary Bastion Props)

#### `prop_kettle_boiler_tower.png` (Dark Fantasy Role: **Abyssal Waystone Gatehouse & Sanctuary Bell-Tower**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `96x96` sprite as an example** of apparent pixel density (1 frame)
- **Primary Reference File(s)**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Walls` gothic archway) + `Miscellaneous/206143 - Yagoo Statue.png`
- **What It Looks Like**: A towering **Gothic Dark-Stone & Wrought-Iron Sanctuary Gatehouse Monument** (looks like `96x96` pixel-grid density as an example) with pointed cathedral buttresses, twin hanging sanctum-gold (`#FFC83D`) hearth braziers at its base, and a glowing soulfire-cyan (`#00F0FF`) runic waystone seal set into the arch keystone.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 top-down gothic stone archway scale and shading of `Walls` in `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution (~1.2K canvas) a sprite of `prop_kettle_boiler_tower` (visually looking like a 96x96 pixel sprite as an example of apparent pixel density): a towering dark-fantasy gothic stone and wrought-iron sanctuary gatehouse monument (#2A353D, #8B3A1E) with pointed cathedral buttresses, warm sanctum-gold (#FFC83D) fire braziers burning at its base, and a glowing soulfire-cyan (#00F0FF) runic waystone seal carved into the keystone arch, with a baked #0B0D10 ground shadow ellipse on #FF00FF magenta. avoid: industrial pipes, boilers, modern machinery, forced tiny downscale.
  ```

#### `prop_kettle_shack.png` (Dark Fantasy Role: **Runesmith Timber-and-Slate Forge Pavilion**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like an `80x64` sprite as an example** of apparent pixel density (1 frame)
- **Primary Reference File(s)**: `Holo House/206141 - NPCs.png` (`Bloop` stall) + `Holo House/206123 - Furniture - Structure.png`
- **What It Looks Like**: A medieval **Dark-Timber and Slate-Shingled Runesmith Armory Pavilion** (looks like `80x64` pixel-grid density as an example) with carved gargoyle eaves, a hanging wrought-iron lantern (`#FFC83D`), a rack of broadswords, and a heavy stone hearth chimney.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 top-down merchant stall structure of `Bloop` in `206141 - NPCs.png`. Render at full high resolution (~1.2K canvas) a sprite of `prop_kettle_shack` (visually looking like an 80x64 pixel sprite as an example of apparent pixel density): a dark-fantasy medieval timber and slate-shingled runesmith armory pavilion (#4D3423, #8B3A1E, #3A3F47) with a pitched dark-slate roof, hanging wrought-iron lantern (#FFC83D), sword rack, and stone forge counter, with a baked #0B0D10 ground shadow on #FF00FF magenta. avoid: corrugated sheet metal, modern shacks, forced tiny downscale.
  ```

#### `prop_kettle_campfire.png` (Dark Fantasy Role: **Wrought-Iron Sanctuary Fire Brazier**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution as a 3-frame strip where each cell **looks like a `32x32` sprite as an example** of apparent pixel density (8 fps)
- **Primary Reference File(s)**: `Miscellaneous/206506 - Effects.png` (`Fire` 4-frame flame animation) + `Holo House/206116 - Cooking.png`
- **What It Looks Like**: A clawed **Wrought-Iron Sanctuary Tripod Brazier** (looks like `32x32` pixel-grid density per cell as an example) set atop a carved runic stone ring, burning with 3-frame animated ember-orange (`#D16B38`) and sanctum-gold (`#FFC83D`) flames.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 4-frame pixel flame animation style of `Fire` in `206506 - Effects.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal sprite strip (3 equal square cells where each cell visually looks like a 32x32 pixel sprite as an example of apparent pixel density) of `prop_kettle_campfire`: a dark-fantasy clawed wrought-iron sanctuary brazier (#3A3F47) resting on carved runic flagstones, with flickering 3-frame pixel flames in ember-orange (#D16B38) and sanctum-gold (#FFC83D), baked #0B0D10 ground shadow on #FF00FF magenta. avoid: oil drums, trash barrels, forced tiny downscale.
  ```

#### `prop_kettle_signs.png` (Dark Fantasy Role: **Crossroads Wrought-Iron & Timber Waypost**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `32x40` sprite as an example** of apparent pixel density (1 frame)
- **Primary Reference File(s)**: `Levels/206142 - Stage 1 - Grassy Plains.png` + `Holo House/206141 - NPCs.png`
- **What It Looks Like**: A weathered **Carved Oak and Wrought-Iron Sanctuary Waypost** (looks like `32x40` pixel-grid density as an example) topped with a small raven skull and 3 pointed wooden/iron directional blades pointing North, West, East, and South.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 signpost proportions in `206142 - Stage 1 - Grassy Plains.png`. Render at full high resolution (~1.2K canvas) a sprite of `prop_kettle_signs` (visually looking like a 32x40 pixel sprite as an example of apparent pixel density): a dark carved timber waypost (#4D3423) bound in wrought-iron brackets with 3 pointed medieval directional plaques (#8B3A1E, #D9D2C3) and a tiny perched skull ornament at the top, baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_crates.png` (Dark Fantasy Role: **Iron-Bound Reliquary Chests & Provision Coffers**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `40x32` sprite as an example** of apparent pixel density (1 frame)
- **Primary Reference File(s)**: `Miscellaneous/206508 - Pickups.png` (`Crate` 3/4 wooden/metal crate)
- **What It Looks Like**: Two stacked **Iron-Strapped Dark Oak Provision Coffers & Reliquary Chests** (looks like `40x32` pixel-grid density as an example) with tarnished gold corner clasps (`#FFC83D`) and wax parchment seals.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the exact 3/4 pixel chest/crate perspective of `Crate` in `206508 - Pickups.png`. Render at full high resolution (~1.2K canvas) a sprite of `prop_kettle_crates` (visually looking like a 40x32 pixel sprite as an example of apparent pixel density): two stacked dark-oak and wrought-iron reliquary supply coffers (#4D3423, #3A3F47) reinforced with tarnished gold corner clasps (#FFC83D) and crimson wax seals, baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_barrels.png` (Dark Fantasy Role: **Iron-Hooped Tavern Casks & Alchemical Tuns**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `32x32` sprite as an example** of apparent pixel density (1 frame)
- **Primary Reference File(s)**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` barrel) + `Holo House/206141 - NPCs.png` (`Bloop` barrel)
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 pixel barrel shading in `206141 - NPCs.png` and `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution (~1.2K canvas) a sprite of `prop_kettle_barrels` (visually looking like a 32x32 pixel sprite as an example of apparent pixel density): a pair of medieval iron-hooped dark oak tavern casks (#8B3A1E, #3A3F47), one sealed with a brass bung stopper (#FFC83D), baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_tent.png` (Dark Fantasy Role: **Inquisitor Order Campaign Pavilion Tent**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `64x48` sprite as an example** of apparent pixel density (1 frame)
- **Primary Reference File(s)**: `Holo House/206127 - Furniture - Bedroom.png` + `Holo House/206123 - Furniture - Structure.png`
- **What It Looks Like**: A weathered **Parchment-Canvas & Crimson-Bannered Knight's Campaign Pavilion Tent** (looks like `64x48` pixel-grid density as an example) pitched on dark spear poles with a warm brass ward-lantern hanging by the entrance flap.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 top-down prop geometry of `206127 - Furniture - Bedroom.png`. Render at full high resolution (~1.2K canvas) a sprite of `prop_kettle_tent` (visually looking like a 64x48 pixel sprite as an example of apparent pixel density): a weathered bone-canvas and dark-crimson medieval campaign tent (#8A877C, #B8B2A2, #612819) pitched on iron-shod timber poles with a warm brass ward-lantern (#FFC83D) hanging at the entrance flap, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: rebar poles.
  ```

#### `prop_kettle_bench.png` (Dark Fantasy Role: **Runesmith Whetstone & Weapon-Carving Table**)
- **Category**: `prop` (`area: kettle`) | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `48x32` sprite as an example** of apparent pixel density (1 frame)
- **Primary Reference File(s)**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` tables) + `Playable Characters - Holoh3ro (ID Gen 3)/530072 - Kaela Kovalskia/Kaela_Anvil.png`
- **What It Looks Like**: A heavy **Hewn Oak Runesmith Workbench** (looks like `48x32` pixel-grid density as an example) fitted with a pedal-driven stone grinding wheel, an unfinished dark-iron sword blade, a smith's hammer, and glowing rune-chisels.
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 table perspective of `Furniture` in `206852 - Stage 3 - Halloween Castle.png` and tool detail of `Kaela_Anvil.png`. Render at full high resolution (~1.2K canvas) a sprite of `prop_kettle_bench` (visually looking like a 48x32 pixel sprite as an example of apparent pixel density): a heavy hewn-oak runesmith workbench (#4D3423) fitted with a stone sharpening grindstone (#3A3F47), a quenched broadsword blade, and brass rune-scribing calipers (#FFC83D), baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

---

### 8.2 Slab Town / The Ossuary Nave Props (8 Gothic Catacomb Props — Rendered at High-Res ~1.2K Canvas)
- **`prop_slab_collapsed_wall.png`** (**Looks like `80x64` pixel density as an example** — **Collapsed Ossuary Cathedral Wall**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` crumbled stone wall sections 1 & 3)
  - **What It Looks Like**: A shattered **Gothic Cathedral Wall** (looks like `80x64` pixel-grid density as an example) of carved dark ashlar masonry (`#2A353D`, `#4F565E`) with inset skull niches (`#B8B2A2`) and twisted wrought-iron gate spikes (`#8B3A1E`) protruding from the broken arch. (No concrete or rebar.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Directly match the crumbled stone wall construction of Rubble in attached 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_collapsed_wall (visually looking like an 80x64 pixel sprite as an example of apparent pixel density): collapsed gothic ossuary cathedral stone wall (#2A353D, #4F565E) with recessed skull niches (#B8B2A2) and jagged wrought-iron fence spikes (#8B3A1E) protruding from the broken masonry, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: concrete, rebar, forced tiny downscale.`
- **`prop_slab_rebar_pile.png`** (**Looks like `48x40` pixel density as an example** — **Cheval-de-Frise Pike & Bone Barricade**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble`)
  - **What It Looks Like**: A jagged **Catacomb Barricade of Crossed Iron Halberd Pikes, Wrought-Iron Fence Spears, and Shattered Tombstones** (looks like `48x40` pixel-grid density as an example). (No construction rebar.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the rubble pile cluster style of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_rebar_pile (visually looking like a 48x40 pixel sprite as an example of apparent pixel density): tangled dark-fantasy barricade of crossed rusted iron halberd pikes (#8B3A1E), wrought-iron gate spears, and shattered ossuary headstones (#3A3F47, #B8B2A2), baked #0B0D10 ground shadow on #FF00FF magenta. avoid: construction rebar, forced tiny downscale.`
- **`prop_slab_dead_mall_sign.png`** (**Looks like `64x64` pixel density as an example** — **Shattered Waystone Obelisk & Fallen Gargoyle Pillar**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` middle broken pillar/obelisk)
  - **What It Looks Like**: A toppled **Gothic Waystone Obelisk** (looks like `64x64` pixel-grid density as an example) carved from dark slate (`#2A353D`) with a broken winged gargoyle bust and a cracked soulfire-cyan (`#088A9E`) rune tablet in its center. (No mall sign.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the broken stone pillar silhouette in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_dead_mall_sign (visually looking like a 64x64 pixel sprite as an example of apparent pixel density): fallen gothic stone obelisk monument (#2A353D, #612819) with a broken gargoyle crest and a cracked soulfire-cyan (#088A9E) engraved rune tablet, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: neon signs, mall signs, modern text, forced tiny downscale.`
- **`prop_slab_rubble_heap.png`** (**Looks like `56x40` pixel density as an example** — **Ossuary Skull & Flagstone Mound**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` + `Miscellaneous/206506 - Effects.png` `Rubble`)
  - **What It Looks Like**: A mound of **Broken Crypt Flagstones, Carved Gargoyle Heads, and Bleached Skulls** (looks like `56x40` pixel-grid density as an example).
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match Rubble in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_rubble_heap (visually looking like a 56x40 pixel sprite as an example of apparent pixel density): mound of broken gothic crypt flagstones (#3A3F47), bleached catacomb skulls (#B8B2A2), and carved stone fragments, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_bent_streetlight.png`** (**Looks like `32x72` pixel density as an example** — **Bent Wrought-Iron Catacomb Candelabra & Hanging Gibbet Lantern**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Decorations` tall candelabra/lantern post)
  - **What It Looks Like**: A tall, crooked **Wrought-Iron Gothic Gibbet-Lantern Post** (looks like `32x72` pixel-grid density as an example) with scrolled ironwork and a shattered iron lantern cage dangling from a chain.
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the tall vertical candelabra/lantern post proportion of Decorations in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_bent_streetlight (visually looking like a 32x72 pixel sprite as an example of apparent pixel density): crooked wrought-iron gothic catacomb lantern post (#2A353D) with scrolled gargoyle brackets and a shattered iron lantern cage hanging from a chain, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern electric streetlights, forced tiny downscale.`
- **`prop_slab_shopping_cart.png`** (**Looks like `32x32` pixel density as an example** — **Overturned Wrought-Iron Gibbet Bone-Cage**):
  - **Reference**: `Holo House/206120 - Furniture - Decorations.png` + `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **What It Looks Like**: An overturned **Wrought-Iron Torture Gibbet Cage / Charnel Bone-Barrow** (looks like `32x32` pixel-grid density as an example) lying on its side with bleached skulls spilling out onto the flagstones. (No supermarket shopping cart.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the prop clarity of 206120 - Furniture - Decorations.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_shopping_cart (visually looking like a 32x32 pixel sprite as an example of apparent pixel density): overturned medieval wrought-iron gibbet bone-cage (#8B3A1E, #4F565E) lying on its side with bleached skulls (#B8B2A2) spilling out, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: supermarket shopping carts, plastic handles, caster wheels, forced tiny downscale.`
- **`prop_slab_vending_machine.png`** (**Looks like `40x56` pixel density as an example** — **Desecrated Iron Maiden Sarcophagus & Reliquary Shrine**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` tall cabinet / coffin)
  - **What It Looks Like**: An upright **Gothic Iron Maiden Sarcophagus / Arched Reliquary Shrine** (looks like `40x56` pixel-grid density as an example) with its spiked iron door cracked ajar and a faint soulfire-cyan (`#088A9E`) spirit glow leaking from within. (No modern vending machine.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the upright coffin/cabinet silhouette of Furniture in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_vending_machine (visually looking like a 40x56 pixel sprite as an example of apparent pixel density): upright gothic iron-maiden sarcophagus and arched reliquary cabinet (#2A353D, #612819) with a cracked iron grille door and faint soulfire-cyan (#088A9E) wisp glow inside, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern soda/snack vending machines, glass display buttons, forced tiny downscale.`
- **`prop_slab_broken_stairs.png`** (**Looks like `64x56` pixel density as an example** — **Sheared Cathedral Altar Steps**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` & `Walls`)
  - **What It Looks Like**: A freestanding flight of **Five Cracked Gothic Stone Altar Steps** (looks like `64x56` pixel-grid density as an example) with carved stone balustrades sheared off at the top.
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the stone masonry shading of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_slab_broken_stairs (visually looking like a 64x56 pixel sprite as an example of apparent pixel density): freestanding flight of 5 cracked gothic cathedral stone steps (#2A353D, #4F565E) with broken stone balustrades sheared off at the top, baked #0B0D10 ground shadow on #FF00FF magenta.`

---

### 8.3 Route 9 / The Gallows Causeway Props (8 Cursed War-Road & Siege Props — Rendered at High-Res ~1.2K Canvas)
- **`prop_route9_burnt_car.png`** (**Looks like `72x48` pixel density as an example** — **Scorched Gothic Hearse-Carriage Wreck**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` & `Furniture`)
  - **What It Looks Like**: A shattered, fire-blackened **Gothic Wrought-Iron & Timber Hearse-Carriage** (looks like `72x48` pixel-grid density as an example) resting on splintered spoked wooden wheels with tattered crimson draperies and iron lanterns. (No modern sedan or automobile.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 obstacle perspective and gothic stone/iron shading of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_burnt_car (visually looking like a 72x48 pixel sprite as an example of apparent pixel density): scorched, wrecked dark-fantasy gothic horseless hearse-carriage (#612819, #2A353D) with broken iron-rimmed wooden spoked wheels, wrought-iron roof cresting, and tattered crimson curtains, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern cars, sedans, windshields, headlights, rubber tires, forced tiny downscale.`
- **`prop_route9_overturned_truck.png`** (**Looks like `96x64` pixel density as an example** — **Overturned Ironclad Siege War-Wagon**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **What It Looks Like**: A massive overturned **Ironclad Inquisition Prisoner War-Wagon** (looks like `96x64` pixel-grid density as an example) lying on its side with barred iron cage windows, spiked wooden siege wheels, and a broken battering-ram prow. (No semi-truck or modern lorry.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the heavy 3/4 obstacle scale and dark iron shading of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_overturned_truck (visually looking like a 96x64 pixel sprite as an example of apparent pixel density): overturned dark-fantasy ironclad siege war-wagon and prisoner cage-wain (#8B3A1E, #3A3F47) lying on its side with heavy iron-shod spoked wooden wheels and barred cage doors, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern trucks, semi-trailers, windshields, rubber tires, forced tiny downscale.`
- **`prop_route9_guardrail.png`** (**Looks like `64x32` pixel density as an example** — **Shattered Wrought-Iron Cemetery Fence & Stone Balustrade**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Walls` fence/railing)
  - **What It Looks Like**: A battered horizontal section of **Spiked Wrought-Iron Cemetery Fencing Anchored to Carved Skull Pillars** (looks like `64x32` pixel-grid density as an example). (No highway guardrail.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the horizontal barrier layout of Walls in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_guardrail (visually looking like a 64x32 pixel sprite as an example of apparent pixel density): bent, battle-scarred wrought-iron cemetery fence with fleur-de-lis spikes (#4F565E, #612819) anchored between two short carved stone skull-posts, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern corrugated highway guardrails, forced tiny downscale.`
- **`prop_route9_road_sign.png`** (**Looks like `32x56` pixel density as an example** — **Gallows Executioner's Gibbet Post & Iron Warning Plaque**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Decorations`)
  - **What It Looks Like**: A tall **Timber-and-Iron Gallows Post** (looks like `32x56` pixel-grid density as an example) with a dangling iron noose chain and a shield-shaped tarnished brass plaque (`#946B22`, `#612819`) branded with a skull emblem. (No diamond traffic road sign.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the vertical post scale of Decorations in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_road_sign (visually looking like a 32x56 pixel sprite as an example of apparent pixel density): dark-fantasy timber-and-iron gallows warning post (#4D3423, #3A3F47) with a hanging iron chain and a battered brass heraldic shield plaque (#946B22, #612819) painted with a skull sigil, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern highway traffic signs, forced tiny downscale.`
- **`prop_route9_tire_stack.png`** (**Looks like `32x36` pixel density as an example** — **Stack of Broken Iron-Rimmed Chariot Wheels**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **What It Looks Like**: A stack of **Three Heavy Spoked Wood-and-Iron Chariot Torture Wheels** (looks like `32x36` pixel-grid density as an example) studded with iron spikes and dusted with crimson ash. (No rubber car tires.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the prop clarity of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_tire_stack (visually looking like a 32x36 pixel sprite as an example of apparent pixel density): stack of 3 heavy medieval iron-rimmed spoked wooden chariot wheels (#4D3423, #3A3F47, #612819) studded with iron rivets, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: rubber car tires, forced tiny downscale.`
- **`prop_route9_oil_drum.png`** (**Looks like `32x36` pixel density as an example** — **Cursed Iron Pitch Brazier-Cauldron**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` barrel)
  - **What It Looks Like**: A heavy riveted **Cast-Iron Siege Pitch Cauldron / Cursed Reliquary Urn** (looks like `32x36` pixel-grid density as an example) banded with tarnished brass rune hoops (`#946B22`). (No modern 55-gallon oil drum.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the vessel silhouette in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_oil_drum (visually looking like a 32x36 pixel sprite as an example of apparent pixel density): heavy riveted cast-iron siege pitch cauldron (#8B3A1E, #3A3F47) encircled by a tarnished gold rune band (#946B22) with ring handles, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern ribbed 55-gallon oil drums, forced tiny downscale.`
- **`prop_route9_dead_tree.png`** (**Looks like `56x64` pixel density as an example** — **Bone-Bleached Gallows Tree**):
  - **Reference**: `Levels/206841 - Stage 1 Hard - Grassy Plains (Night).png` (dark gnarled tree)
  - **What It Looks Like**: A gnarled, leafless **Bone-Bleached Gallows Tree** (looks like `56x64` pixel-grid density as an example) with twisted claw-like boughs and a broken iron shackle chain hanging from a limb.
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 tree trunk and branch silhouette in 206841 - Stage 1 Hard (Night).png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_dead_tree (visually looking like a 56x64 pixel sprite as an example of apparent pixel density): gnarled, leafless bone-bleached gallows tree (#8A877C, #B8B2A2) with a broken iron shackle chain hanging from a bough, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_billboard_frame.png`** (**Looks like `88x72` pixel density as an example** — **Ruined Timber-and-Iron Mass Gallows Scaffold**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Walls`)
  - **What It Looks Like**: A towering **Timber-and-Iron Mass Gallows Scaffold & Tattered Inquisition Banner Arch** (looks like `88x72` pixel-grid density as an example) with hanging iron cages and torn blood-crimson war banners flapping in the wind. (No highway billboard.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the large structural prop scale of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_route9_billboard_frame (visually looking like an 88x72 pixel sprite as an example of apparent pixel density): dark-fantasy timber-and-wrought-iron mass gallows scaffold (#4D3423, #612819, #3A3F47) hung with tattered blood-crimson war banners and dangling iron chains, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern highway billboards, steel trusses, forced tiny downscale.`

---

### 8.4 Lye Marsh / The Weeping Fens Props (8 Eldritch Plague-Mire Props — Rendered at High-Res ~1.2K Canvas)
- **`prop_marsh_rusted_drum_cluster.png`** (**Looks like `48x40` pixel density as an example** — **Cracked Plague-Alchemist Cauldrons & Venom Urns**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` barrel + `Berry Juice` puddle)
  - **What It Looks Like**: Three **Corroded Bronze Plague-Urns & Cracked Witch-Cauldrons** (looks like `48x40` pixel-grid density as an example) half-sunken in dark mire mud and leaking glowing venom-green (`#9CB34C`) ichor. (No chemical drums.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Combine the vessels and liquid puddles of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_rusted_drum_cluster (visually looking like a 48x40 pixel sprite as an example of apparent pixel density): 3 cracked bronze plague-urns and witch cauldrons (#8B3A1E, #1F4D4A) half-sunken in dark bog mud leaking glowing venom-green (#9CB34C) ichor, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern chemical barrels, oil drums, forced tiny downscale.`
- **`prop_marsh_dead_reed_clump.png`** (**Looks like `32x40` pixel density as an example** — **Bone-Bleached Fen Reeds**):
  - **Reference**: `Levels/206142 - Stage 1 - Grassy Plains.png` (tall grass/reed clumps)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the reed/foliage cluster pixel structure of 206142 - Stage 1 - Grassy Plains.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_dead_reed_clump (visually looking like a 32x40 pixel sprite as an example of apparent pixel density): clump of brittle bone-bleached marsh reeds (#8A877C, #B8B2A2) and bog-teal (#2E6962) stalks rising from mud, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_bone_pile.png`** (**Looks like `40x32` pixel density as an example** — **Mire-Submerged Beast Ribcage & Skulls**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble`) + `Enemies/206132 - Myth Enemies.png` (`Dead Beat` bones)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the bone/rubble pixel clusters of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_bone_pile (visually looking like a 40x32 pixel sprite as an example of apparent pixel density): bleached beast ribcage and horned skulls (#B8B2A2, #D9D2C3) half-submerged in bog-teal (#1F4D4A) mire, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_sunken_car_roof.png`** (**Looks like `64x40` pixel density as an example** — **Sunken Crypt Mausoleum Roof & Gargoyle Gable**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` & `Walls`)
  - **What It Looks Like**: The peaked **Carved Stone Roof and Gargoyle Gable of a Drowned Crypt Mausoleum** (looks like `64x40` pixel-grid density as an example) protruding at an angle from dark bog water ripples. (No sunken car roof.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the sunken stone ruin style of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_sunken_car_roof (visually looking like a 64x40 pixel sprite as an example of apparent pixel density): peaked gothic stone mausoleum roof and mossy gargoyle gable (#2A353D, #2E6962, #8A877C) protruding at an angle from dark bog water ripples, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern cars, windshields, forced tiny downscale.`
- **`prop_marsh_glowing_spore_pods.png`** (**Looks like `40x40` pixel density as an example** — **Bioluminescent Eldritch Spore-Bulbs**):
  - **Reference**: `Holo House/206115 - Farming.png` (strange bulbous crops)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the organic plant cluster scale of 206115 - Farming.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_glowing_spore_pods (visually looking like a 40x40 pixel sprite as an example of apparent pixel density): cluster of 3 swollen bog-fungal pods (#1F4D4A, #6B8036) with glowing soulfire-cyan (#00F0FF) and venom-green (#9CB34C) pores, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_pipe_outflow.png`** (**Looks like `56x48` pixel density as an example** — **Carved Gargoyle Sewer Sluice-Maw**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **What It Looks Like**: A moss-covered **Gothic Stone Gargoyle Sluice-Gate Mouth** (looks like `56x48` pixel-grid density as an example) with iron portcullis bars, vomiting a stream of glowing venom-green (`#9CB34C`) bog bile into a mire puddle.
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the stone/iron masonry of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_pipe_outflow (visually looking like a 56x48 pixel sprite as an example of apparent pixel density): mossy carved stone gargoyle sluice-drain archway (#2A353D, #3A3F47) with iron grate bars discharging a stream of glowing venom-green (#9CB34C) sludge into a bog puddle, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: modern industrial pipes, forced tiny downscale.`
- **`prop_marsh_tarp_shack.png`** (**Looks like `72x56` pixel density as an example** — **Stilted Bog-Witch Coven Hut**):
  - **Reference**: `Holo House/206141 - NPCs.png` (`Bloop` stall)
  - **What It Looks Like**: A ramshackle **Stilted Fen-Witch Hut** (looks like `72x56` pixel-grid density as an example) built from twisted bog-wood, patched beast hides (`#946B22`, `#2E6962`), hanging bone wind-chimes, and a glowing witch-lantern.
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the stilted wooden structure of 206141 - NPCs.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_tarp_shack (visually looking like a 72x56 pixel sprite as an example of apparent pixel density): ramshackle stilted bog-witch hut (#4D3423) thatched with weathered beast-hide (#946B22) and bog-moss (#2E6962) with hanging bone talismans, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_fog_patch.png`** (**Looks like `64x32` pixel density as an example** — **Creeping Fen Miasma Cloud**):
  - **Reference**: `Miscellaneous/206506 - Effects.png` (`Smoke` horizontal strip)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the horizontal pixel cloud layering of Smoke in 206506 - Effects.png. Render at full high resolution (~1.2K canvas) a sprite of prop_marsh_fog_patch (visually looking like a 64x32 pixel sprite as an example of apparent pixel density): low-hanging checkerboard-dithered pixel miasma cloud in bog-teal (#2E6962) and bone-grey (#8A877C) on #FF00FF magenta (no ground shadow).`

---

### 8.5 Copper Flats / The Sepulcher of Ash Props (8 Ancient Dragon-Graveyard & Ossuary Ruins Props — Rendered at High-Res ~1.2K Canvas)
- **`prop_flats_wrecked_harvester.png`** (**Looks like `96x72` pixel density as an example** — **Fallen Siege Bone-Colossus Husk**):
  - **Reference**: `Bosses/206501 - Stage 3 Mini Boss (Shubangelion).png` + `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **What It Looks Like**: The colossal, half-buried **Skeletal Torso and Horned Greathelm of a Fallen Ancient Siege Bone-Golem** (looks like `96x72` pixel-grid density as an example) in crimson cremation ash, with a shattered dark-iron breastplate and a broken spiked war-wheel embedded in its ribs. (No strip-mine excavator or harvester machine.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the heavy boss-scale ruin detail of 206501 - Stage 3 Mini Boss.png and 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_wrecked_harvester (visually looking like a 96x72 pixel sprite as an example of apparent pixel density): colossal half-buried skeletal torso and horned dark-iron greathelm of a fallen ancient siege bone-colossus (#D9D2C3, #8B3A1E, #3A3F47) resting in red cremation ash with a shattered gothic war-shield, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: strip-mine excavators, modern construction vehicles, forced tiny downscale.`
- **`prop_flats_sand_dune_crest.png`** (**Looks like `80x40` pixel density as an example** — **Crimson Cremation-Ash & Bone Dune Ridge**):
  - **Reference**: `Levels/206142 - Stage 1 - Grassy Plains.png` (terrain mounds)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the terrain mound shading of 206142 - Stage 1 - Grassy Plains.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_sand_dune_crest (visually looking like an 80x40 pixel sprite as an example of apparent pixel density): wind-sculpted crimson cremation-ash dune ridge (#612819, #8B3A1E, #D16B38) studded with dark obsidian stones (#2A353D) and half-buried skulls, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_machine_rib_cage.png`** (**Looks like `72x56` pixel density as an example** — **Bleached Elder-Dragon Ribcage Ruin**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble`)
  - **What It Looks Like**: Four colossal **Arched Bleached Dragon Ribs** (looks like `72x56` pixel-grid density as an example) bound in rusted dark-iron chains (`#3A3F47`, `#8B3A1E`) protruding like a cathedral vault from crimson ash. (No turbine machine.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the arched ruin silhouette of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_machine_rib_cage (visually looking like a 72x56 pixel sprite as an example of apparent pixel density): 4 colossal arched bleached elder-dragon ribs (#D9D2C3, #8A877C) bound with rusted dark-iron chains (#8B3A1E) protruding from crimson ash, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: turbines, engines, forced tiny downscale.`
- **`prop_flats_cactus_husk.png`** (**Looks like `32x48` pixel density as an example** — **Petrified Blood-Thorn Pillar**):
  - **Reference**: `Holo House/206115 - Farming.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the vertical plant silhouette in 206115 - Farming.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_cactus_husk (visually looking like a 32x48 pixel sprite as an example of apparent pixel density): petrified, hollow bone-grey and dry-wood blood-thorn desert pillar (#4D3423, #8A877C) bristling with long dark-iron thorns, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_buried_antenna.png`** (**Looks like `40x64` pixel density as an example** — **Tilted Cursed Bell-Spire & Astrolabe Finial**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Walls` & `Decorations`)
  - **What It Looks Like**: The tilted, half-buried **Gothic Wrought-Iron Belfry Spire and Tarnished Brass Astrolabe Weather-Vane** (looks like `40x64` pixel-grid density as an example) of a sunken cathedral, sticking out of crimson ash. (No radar dish or radio antenna.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the gothic iron spire geometry in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_buried_antenna (visually looking like a 40x64 pixel sprite as an example of apparent pixel density): tilted gothic wrought-iron cathedral spire pinnacle and tarnished brass crescent-moon astrolabe finial (#8B3A1E, #4F565E, #946B22) half-buried in crimson ash, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: radar dishes, satellite antennas, radio towers, forced tiny downscale.`
- **`prop_flats_tire_half_sunk.png`** (**Looks like `32x32` pixel density as an example** — **Half-Buried Spiked Bone-Chariot Wheel**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **What It Looks Like**: A giant **Spiked Dark-Iron and Carved-Bone War-Chariot Wheel** (looks like `32x32` pixel-grid density as an example) with a skull hubcap, buried upright halfway into crimson ash. (No rubber haul-rig tire.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the prop scale of 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_tire_half_sunk (visually looking like a 32x32 pixel sprite as an example of apparent pixel density): giant spiked dark-iron and bone war-chariot wheel (#1A2228, #612819, #B8B2A2) with a skull hub buried upright halfway into red cremation ash, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: rubber tires, forced tiny downscale.`
- **`prop_flats_bone_arch.png`** (**Looks like `72x64` pixel density as an example** — **Colossal Wyrm-Jaw & Vertebrae Archway**):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Walls` arch + `Rubble`)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the archway geometry of Walls in 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_bone_arch (visually looking like a 72x64 pixel sprite as an example of apparent pixel density): colossal bleached wyrm-jawbone and vertebrae archway (#D9D2C3, #8A877C, #8B3A1E) bound with heavy wrought-iron chains, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: I-beams, steel girders, forced tiny downscale.`
- **`prop_flats_rusted_silo.png`** (**Looks like `80x88` pixel density as an example** — **Collapsed Cylindrical Ossuary Watchtower & Crypt Dome**):
  - **Reference**: `Holo House/206123 - Furniture - Structure.png` + `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **What It Looks Like**: A collapsed **Cylindrical Gothic Stone-and-Bronze Ossuary Watchtower** (looks like `80x88` pixel-grid density as an example) with arched arrow-slit windows and a shattered copper-patina dome roof half-sunk in red ash. (No industrial grain/ore silo.)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the large cylindrical/structural shading of 206123 - Furniture - Structure.png and 206852 - Stage 3 - Halloween Castle.png. Render at full high resolution (~1.2K canvas) a sprite of prop_flats_rusted_silo (visually looking like an 80x88 pixel sprite as an example of apparent pixel density): collapsed cylindrical gothic stone and bronze-plated ossuary watchtower (#612819, #8B3A1E, #3A3F47) with narrow lancet windows and a shattered dome roof half-buried in crimson ash, baked #0B0D10 ground shadow on #FF00FF magenta. avoid: industrial grain silos, factory tanks, forced tiny downscale.`

---

## SECTION 9: DUSKHOLLOW TOWN NPCs & MERCHANTS (2-Frame Idle Strips — Rendered at High-Res ~1.2K Canvas, Looking Like `64x64` Cells as an Example)

### `ume.png` (Quartermaster Ume — Sanctuary Reliquary Keeper & Runesmith Quartermaster)
- **Category**: `npc`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` canvas) as a 2-frame horizontal strip (`2:1` aspect ratio) where each square cell **looks like a `64x64` sprite as an example** of apparent pixel density (2 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Shop/206131 - Shop Menu.png` (`A-Chan Idle` behind counter)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Holo House/206141 - NPCs.png` (`Bloop` stall counter & `Shiraken Elfriend`)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoh3ro (ID Gen 3)/530072 - Kaela Kovalskia/Kaela.png`
- **Dark Fantasy Visual Design**:
  - **What It Looks Like**: **Quartermaster Ume**, a weathered, tough-as-nails older **Sanctuary Runesmith & Reliquary Quartermaster** in 2-head chibi RPG proportions (looks like a `64x64` sprite per cell as an example) standing behind a heavy carved-oak and wrought-iron armory counter (`#4D3423`, `#8B3A1E`). She has silver-grey hair tied in a bun (`#B8B2A2`) skewered with a bone pin, half-moon brass reading spectacles (`#FFC83D`) on a chain, a leather runesmith apron over a crimson-rust tunic, and an iron-bound chest of consecrated blades and glowing soul-gems beside her counter.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K canvas) with chunky hand-pixelled blocks, clean 1px-style #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Combine the counter-standing shopkeeper composition of `206131 - Shop Menu.png` and `206141 - NPCs.png` with 2-head chibi RPG proportions. Render at full high resolution (~1.2K canvas) a 2-frame horizontal NPC sprite strip (two equal square cells side-by-side where each cell visually looks like a 64x64 pixel sprite as an example of apparent pixel density, 1-pixel-block idle breathing bob) of `ume` (Quartermaster Ume): weathered older dark-fantasy runesmith and reliquary quartermaster standing behind a heavy carved-oak and wrought-iron armory counter (#4D3423, #8B3A1E), silver-grey hair tied in a bun (#B8B2A2), half-moon brass spectacles (#FFC83D) on a chain, leather runesmith apron over rolled-up rust tunic sleeves, with an iron-bound chest of consecrated swords and glowing soul-gems beside her counter, and a baked #0B0D10 ground shadow ellipse. avoid: forced tiny downscale, smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### Companion Duskhollow Town NPCs (2-Frame Strips Rendered at High-Res ~1.2K Canvas, Looking Like `64x64` Cells as an Example — Reference: `206141 - NPCs.png` & `206131 - Shop Menu.png`)
- **`npc_vaelen.png` (Master Smith Vaelen — Runesmith Forge)**: Bearded runesmith in soot-black dragon-leather apron (`#1A2228`) holding a glowing hellfire-amber (`#FF5A26`) runehammer over a soulfire anvil (`Kaela_Anvil.png` reference).
- **`npc_isolde.png` (Sister Isolde — Alchemist Apothecary)**: Plague-alchemist nun in bog-teal (`#1F4D4A`) and bone-white habit veil holding a glowing crimson blood-vitae phial (`#FF3B3B`) beside a glass alembic table (`Choco_Supplies.png` reference).
- **`npc_malakor.png` (Chronicler Malakor — Hunters Guild & Bloodline Hall)**: Hooded inquisitor chronicler in dark slate-violet robes (`#26313A`) holding a feather quill beside the illuminated Bloodline Ledger board (`Herding Board` in `206141 - NPCs.png` reference).
- **`npc_solen.png` (Archmage Solen — Arcane Sanctum)**: Grand astromancer with levitating soulfire-cyan (`#00F0FF`) grimoire and starforged staff (`Shion.png` reference).
- **`npc_maeve.png` (Maeve the Hearthkeeper — Raven's Rest Tavern)**: Warm medieval tavern hostess carrying a steaming platter of roast wyrm-steak and a spiced ale tankard (`206116 - Cooking.png` reference).
- **`npc_vex.png` (Vex the Veil-Peddler — Mystic Enchanter & Curio Broker)**: Masked occult curio broker surrounded by 3 chained reliquary coffers (`206962 - Holozon Box.png` reference).
- **`npc_morwen.png` (Morwen the Veil-Peddler — Wandering Caravan Mystic)**: Hooded caravan mystic bearing a tall wrought-iron soulfire ward-staff that repels monsters.

---

## SECTION 10: SKILL ICONS & ITEM ICONS (Pure Dark Fantasy UI Icons — Rendered at High-Res ~1.2K×1.2K Canvas, Looking Like `32x32` Icons as an Example)

> **Master Structural Reference & High-Res Vision Rule for ALL Skill & Item Icons**:
> - Attach `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`Weapons`, `Collab Weapons`, `Items`, `Other`) and any character `_Perk1..3.png` / `_Weapon.png` (e.g., `529969 - Nakiri Ayame/Ayame_Weapon.png`, `Ayame_Perk1.png`, `Ayame_Special.png`).
> - **High-Res Canvas (~1.2K) vs. `32x32` Pixel-Density Example**: Render each icon (or multi-icon atlas grid) at **full high resolution (~1.2K×1.2K canvas)** where the chunky pixel blocks **visually look like a `32x32` pixel icon as an example** of apparent pixel density—never force a literal tiny `32x32` output or blurry downscale.
> - **Icon Framing Rule**: Every icon has a `1px`-style `#0B0D10` outer border, a `1px`-style `#3A3F47` (dark-iron) inner bevel, a solid `#11171B` dark interior background, and the centered Gothic Dark Fantasy icon subject drawn at a crisp 45° diagonal or front-emblem angle with a `1px`-style `#0B0D10` outline.

### 10.1 Active Skill Icons (`icon_skill_*.png` — Rendered at High-Res ~1.2K Canvas, Looking Like `32x32` as an Example)

#### `icon_skill_lunge.png` (Shadow Lunge)
- **Category**: `ui_icon` | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `32x32` icon as an example** of apparent pixel density
- **Primary Reference File(s)**: `Items/206883 - Item Icons.png` (`Weapons` Row 1 Col 8 katana / `Other` sword) + `529969 - Nakiri Ayame/Ayame_Weapon.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the framed square icon layout and diagonal weapon readability of attached `206883 - Item Icons.png` and `Ayame_Weapon.png`. Render at full high resolution (~1.2K canvas) a skill icon for `icon_skill_lunge` (Shadow Lunge) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square interior with a 1px-style #3A3F47 iron border, showing Duskrend's cursed dark-iron katana blade thrusting diagonally from bottom-left to top-right wrapped in a razor-sharp soulfire-cyan (#00F0FF) and bone-white (#EFE9DA) phantom speed-streak. avoid: forced tiny downscale, blur, text, numbers, soft glow.
  ```

#### `icon_skill_ground_break.png` (Abyssal Rupture / Ground Break)
- **Category**: `ui_icon` | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `32x32` icon as an example** of apparent pixel density
- **Primary Reference File(s)**: `Items/206883 - Item Icons.png` + `530072 - Kaela Kovalskia/Kaela_Anvil.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the framed icon style of `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) a skill icon for `icon_skill_ground_break` (Abyssal Rupture) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing Duskrend's blade driven vertically downward into shattered #2A353D crypt stone, erupting with radial soulfire-cyan (#00F0FF) and bone-white (#EFE9DA) shockwave cracks at the bottom. avoid: forced tiny downscale, blur, text, soft glow.
  ```

#### `icon_skill_rail_spike.png` (Dark Fantasy Role: **Soulfire Lance / Runic Bone-Javelin**)
- **Category**: `ui_icon` | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `32x32` icon as an example** of apparent pixel density
- **Primary Reference File(s)**: `Items/206883 - Item Icons.png` (`Collab Weapons` diagonal lance/beam icons)
- **What It Looks Like**: A winged **Runic Bone-and-Iron Throwing Javelin (Soulfire Lance)** hurtling diagonally toward the top-right with a blazing soulfire-cyan (`#00F0FF`) and bone-white (`#EFE9DA`) barbed spearhead and crimson-ember (`#D16B38`) rune sparks.
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the framed icon style of `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) a skill icon for `icon_skill_rail_spike` (Soulfire Lance) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a winged dark-iron and bone runic javelin hurtling diagonally toward top-right with a blazing soulfire-cyan (#00F0FF) and bone-white (#EFE9DA) barbed spearhead and ember-orange (#D16B38) rune sparks trailing behind. avoid: railroad spikes, forced tiny downscale, blur, text, soft glow.
  ```

#### `icon_skill_seven_cuts.png` (Seven Seals of Eclipse Ultimate)
- **Category**: `ui_icon` | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `32x32` icon as an example** of apparent pixel density
- **Primary Reference File(s)**: `529969 - Nakiri Ayame/Ayame_Special.png` + `529762 - Mori Calliope/Calli_Special.png` + `Items/206883 - Item Icons.png` (`Super Collab Weapons` row)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the high-impact ultimate icon composition of `Ayame_Special.png` and `Super Collab Weapons` in `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an ultimate skill icon for `icon_skill_seven_cuts` (Seven Seals of Eclipse) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #0B0D10 square with a 1px-style sanctum-gold (#FFC83D) ultimate border, showing 7 intersecting razor-sharp soulfire-cyan (#00F0FF) and bone-white (#EFE9DA) dimensional slash lines slicing across a blood-crimson (#8A1C24) eclipsed moon silhouette. avoid: forced tiny downscale, blur, text, soft glow.
  ```

#### `icon_skill_locked.png` (Locked Skill Slot — Cursed Iron Seal)
- **Category**: `ui_icon` | **Apparent Pixel-Grid Vision**: Render at ~1.2K resolution, **looking like a `32x32` icon as an example** of apparent pixel density
- **Primary Reference File(s)**: `Miscellaneous/206965 - Game Menus and HUDs.png` (`Locked Characters` padlock & chain icon)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the pixel padlock and crossed chains of `Locked Characters` in attached `206965 - Game Menus and HUDs.png`. Render at full high resolution (~1.2K canvas) an icon for `icon_skill_locked` that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #0B0D10 square with 1px-style #2A353D border, showing a heavy gothic skull-embossed iron padlock (#8B3A1E, #4F565E) bound by diagonal dark-iron chains. avoid: forced tiny downscale, blur, text, soft glow.
  ```

---

### 10.2 Equipment & Supply Icons (`icon_item_*.png` — Pure Gothic Dark Fantasy Relics, Rendered at High-Res ~1.2K Canvas, Looking Like `32x32` as an Example)

#### Head Armor Icons (`welding_goggles`, `surplus_respirator`, `riders_helmet`)
- **`icon_item_welding_goggles.png` (Dark Fantasy Role: Tarnished Winged Brow-Circlet)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` headgear/tiara icons)
  - **What It Looks Like**: A **Tarnished Gold & Dark-Iron Winged Valkyrie Brow-Circlet** (`#D49B2A`, `#6E757A`) set with a glowing soulfire-cyan (`#00F0FF`) faceted soul-gem in the center of the forehead band, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**. (No welding goggles or lenses.)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the headgear item icon layout of `Items` in attached `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_welding_goggles` (Tarnished Iron Circlet) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a weathered tarnished-gold and dark-iron winged brow-circlet (#D49B2A, #6E757A) set with a glowing soulfire-cyan (#00F0FF) diamond soul-gem in the center. avoid: welding goggles, glasses, lenses, forced tiny downscale, blur, text, soft glow.
    ```
- **`icon_item_surplus_respirator.png` (Dark Fantasy Role: Grave-Forged Plague-Inquisitor Visage)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 6 dark mask)
  - **What It Looks Like**: A grim **Dark-Iron & Bone Plague-Inquisitor Skull Half-Mask** (`#3A3F47`, `#B8B2A2`) with barred iron jaw-slits and glowing soulfire-cyan (`#00F0FF`) rune engravings along the cheekbones, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**. (No modern gas-mask canisters.)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the mask icon in `Items` Row 2 Column 6 of attached `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_surplus_respirator` (Grave-Forged Visage) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a gothic dark-iron and carved-bone inquisitor skull half-mask (#3A3F47, #B8B2A2) with vertical visor bars and glowing soulfire-cyan (#00F0FF) ward runes. avoid: modern gas mask canisters, rubber hoses, forced tiny downscale, blur, text, soft glow.
    ```
- **`icon_item_riders_helmet.png` (Dark Fantasy Role: Frost-Runed Deathknight Greathelm)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 1 Col 7 horned helm & `Enemies/206132` helmet)
  - **What It Looks Like**: A crested **Bone-Horned Dark-Steel Knight Greathelm** (`#B8B2A2`, `#4F565E`) with a glowing T-shaped soulfire-cyan (`#00F0FF`) visor slit and gold trim (`#FFC83D`), rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**.
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the headgear icon framing of `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_riders_helmet` (Frost-Runed Greathelm) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a crested bone-horned dark-steel knight greathelm (#B8B2A2, #4F565E) with a glowing soulfire-cyan (#00F0FF) T-visor slit and tarnished gold trim (#FFC83D). avoid: motorcycle helmets, forced tiny downscale, blur, text, soft glow.
    ```

#### Body Armor Icons (`patched_vest`, `riot_jacket`, `plate_coat`)
- **`icon_item_patched_vest.png` (Dark Fantasy Role: Tarnished Chainmail Hauberk & Leather Jerkin)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 4 coat & Row 4 Col 3 outfit)
  - **What It Looks Like**: A battle-worn **Crimson-Rust Leather Gambeson Reinforced with Dark-Iron Chainmail Rings** (`#8B3A1E`, `#4F565E`) and a buckled sword-belt, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**.
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the torso armor icon framing in `Items` Row 2 Col 4 of attached `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_patched_vest` (Tarnished Chain Hauberk) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a medieval crimson-rust leather gambeson (#8B3A1E) layered over dark-iron chainmail mesh (#4F565E) with a brass shoulder buckle. avoid: modern work vests, forced tiny downscale, blur, text, soft glow.
    ```
- **`icon_item_riot_jacket.png` (Dark Fantasy Role: Grave-Forged Ossuary Cuirass)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 4)
  - **What It Looks Like**: A **Blackened Steel & Bog-Teal Leather Brigandine Cuirass** (`#1F4D4A`, `#3A3F47`) armored with carved bone rib-plates (`#B8B2A2`) and spiked pauldrons, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**.
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the armor icon framing of `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_riot_jacket` (Grave-Forged Cuirass) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a dark bog-teal (#1F4D4A, #2E6962) and blackened steel brigandine breastplate reinforced with bone-white (#B8B2A2) skeletal rib-guards and pauldrons. avoid: modern tactical riot vests, forced tiny downscale, blur, text, soft glow.
    ```
- **`icon_item_plate_coat.png` (Dark Fantasy Role: Frost-Runed Inquisitor Plate Mantle)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Super Items` Row 2 Col 4 ornate coat)
  - **What It Looks Like**: A regal **Inquisitor Lord's High-Collared Mantle & Fluted Dark-Steel Breastplate** (`#26313A`, `#4F565E`) inlaid with sanctum-gold filigree (`#D49B2A`) and frost-cyan (`#5CEBFF`) chest runes, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**.
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the prestige armor icon framing of `Super Items` in `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_plate_coat` (Frost-Runed Brigandine) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a gothic high-collared inquisitor mantle (#26313A) armored with gold-filigreed (#D49B2A) and frost-cyan (#5CEBFF) rune-etched dark-steel chest plate. avoid: boiler plates, forced tiny downscale, blur, text, soft glow.
    ```

#### Leg Armor Icons (`work_boots`, `courier_leggings`, `hydraulic_shins`)
- **`icon_item_work_boots.png` (Dark Fantasy Role: Tarnished Iron Greaves)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Other` Row 1 Col 3 boot)
  - **What It Looks Like**: Heavy **Dark-Leather & Banded Iron Adventurer Greaves** (`#612819`, `#6E757A`) with buckled knee-cops, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**.
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the boot icon silhouette in `Other` Row 1 Column 3 of attached `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_work_boots` (Tarnished Iron Greaves) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing heavy medieval rust-leather greaves (#612819, #8B3A1E) plated with dark-iron (#6E757A) shin guards and knee-cops. avoid: modern construction boots, forced tiny downscale, blur, text, soft glow.
    ```
- **`icon_item_courier_leggings.png` (Dark Fantasy Role: Grave-Forged Shadow-Stalker Sabatons)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Other` Row 1 Col 3)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the footwear/leg-armor icon style of `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_courier_leggings` (Grave-Forged Sabatons) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing articulated shadow-teal (#1F4D4A, #2E6962) and bone-trimmed dark-steel knight sabatons with clawed toe-plates. avoid: forced tiny downscale, blur, text, soft glow.
    ```
- **`icon_item_hydraulic_shins.png` (Dark Fantasy Role: Frost-Runed Wind-Strider Greaves)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Other` Row 1 Col 3 winged/speed boot)
  - **What It Looks Like**: Masterwork **Winged Gold-and-Soulfire-Runed Knight Greaves** (`#FFC83D`, `#00F0FF`) with valkyrie ankle-wings and 3 crisp cyan speed-lines trailing behind the heel, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**. (No hydraulic pistons.)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the winged speed-boot icon in `Other` Row 1 Col 3 of `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_hydraulic_shins` (Frost-Runed Striders) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing masterwork sanctum-gold (#FFC83D) and soulfire-cyan (#00F0FF) rune-etched steel greaves adorned with small valkyrie ankle-wings and 3 crisp pixel speed-lines trailing behind the heel. avoid: hydraulic pistons, machines, forced tiny downscale, blur, text, soft glow.
    ```

#### Alchemical Supply Icons (`gauze_roll`, `sugar_tin`)
- **`icon_item_gauze_roll.png` (Dark Fantasy Role: Crimson Blood-Vitae Vial & Sanctified Linen)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 1 Col 3 potion bottle) + `529971 - Yuzuki Choco/Choco_Supplies.png`
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the potion/medical item icon clarity of `206883 - Item Icons.png` and `Choco_Supplies.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_gauze_roll` (Crimson Blood Vial) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing a stoppered gothic glass blood-vitae phial (#FF3B3B) wrapped in a bone-white (#D9D2C3) sanctified prayer linen roll. avoid: modern adhesive bandages, forced tiny downscale, blur, text, soft glow.
    ```
- **`icon_item_sugar_tin.png` (Dark Fantasy Role: Ashen Soul-Crystal Phial)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 5 jar & Row 4 Col 4 bottle)
  - **What It Looks Like**: An ornate **Gold-Caged Alchemical Crystal Phial** (`#D49B2A`, `#8B3A1E`) brimming with glowing bone-white (`#EFE9DA`) and soulfire-cyan (`#5CEBFF`) condensed soul-shards, rendered at ~1.2K resolution while **looking like a `32x32` icon as an example**. (No pocket sugar tin.)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the potion container icon style in `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) an item icon for `icon_item_sugar_tin` (Ashen Soul Elixir) that visually looks like a 32x32 pixel icon as an example of apparent pixel density: dark #11171B square with 1px-style #3A3F47 border, showing an ornate tarnished-gold caged alchemical flask (#D49B2A, #8B3A1E) filled with glowing bone-white (#EFE9DA) and soulfire-cyan (#5CEBFF) soul crystals. avoid: tin cans, modern containers, forced tiny downscale, blur, text, soft glow.
    ```

---

## SECTION 11: UI FRAMES, BARS, MINIMAP, PICKUPS & TITLE KEY ART (`ui` & `key_art` Categories — Rendered at High-Res ~1.2K Canvas)

### `ui_panel.png` (9-Slice Gothic Reliquary Panel Frame)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas) where the pixel-cluster density **looks like a `48x48` 9-slice UI tile as an example**
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Dialogue Box`, `Inventory`, and `Pause Menu` 9-slice frames)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the clean 9-slice border thickness and corner ornament geometry of `Dialogue Box` and `Inventory` in attached `206965 - Game Menus and HUDs.png`. Render at full high resolution (~1.2K canvas) a 9-slice UI panel tile (`ui_panel`) that visually looks like a 48x48 pixel tile as an example of apparent pixel density: 1px-style #0B0D10 outer border, 2px-style beveled dark-iron (#3A3F47) and antique bronze (#612819) gothic frame, 2x2-style sanctum-gold (#FFC83D) fleur-de-lis corner studs in all four corners, and a flat solid dark-soot (#11171B) center area suitable for 9-slice stretching. avoid: gradients, drop shadows, text, asymmetric patterns in the center.
  ```

### `ui_bar_hp.png` (HUD Health Bar Frame & Blood-Crimson Fill Mask)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2K` canvas) as a 2-frame horizontal UI strip where each cell **looks like a `128x12` HUD bar as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`HP Bar` top-left section)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the pixel bar frame and segmented bevel of `HP Bar` in attached `206965 - Game Menus and HUDs.png`. Render at full high resolution (~1.2K canvas) a 2-frame horizontal UI strip (two equal bar cells side-by-side where each cell visually looks like a 128x12 pixel bar as an example of apparent pixel density): Frame 1 (left) is the empty dark-iron bar housing (#0B0D10 border, #3A3F47 inner bevel, #11171B trough); Frame 2 (right) is the full HP bar filled with a blood-crimson (#FF3B3B) core, #8A1C24 bottom shadow row, and 1px-style #EFE9DA top specular highlight row. avoid: smooth gradients, blur, text.
  ```

### `ui_bar_stamina.png` (HUD Stamina Bar Frame & Soulfire-Cyan Fill Mask)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2K` canvas) as a 2-frame horizontal UI strip where each cell **looks like a `128x12` HUD bar as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`HP Bar` & `Exp Bar` sections)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the exact 2-frame bar geometry of `ui_bar_hp.png` and `206965 - Game Menus and HUDs.png`. Render at full high resolution (~1.2K canvas) a 2-frame horizontal UI strip (two equal bar cells side-by-side where each cell visually looks like a 128x12 pixel bar as an example of apparent pixel density): Frame 1 empty dark-iron bar housing (#0B0D10, #3A3F47, #11171B); Frame 2 full Stamina bar filled with soulfire-cyan (#00F0FF) core, #088A9E bottom shadow row, and 1px-style #EFE9DA top highlight row. avoid: smooth gradients, blur, text.
  ```

### `ui_bar_xp.png` (HUD Experience Bar Frame & Sanctum-Gold Fill Mask)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2K` canvas) as a 2-frame horizontal UI strip where each cell **looks like a `128x12` HUD bar as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Exp Bar Frame`)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the exact 2-frame bar geometry of `ui_bar_hp.png` and `Exp Bar Frame` in `206965 - Game Menus and HUDs.png`. Render at full high resolution (~1.2K canvas) a 2-frame horizontal UI strip (two equal bar cells side-by-side where each cell visually looks like a 128x12 pixel bar as an example of apparent pixel density): Frame 1 empty dark-iron bar housing (#0B0D10, #3A3F47, #11171B); Frame 2 full XP bar filled with sanctum-gold (#FFC83D) core, #946B22 bottom shadow row, and 1px-style #EFE9DA top highlight row. avoid: smooth gradients, blur, text.
  ```

### `ui_button.png` (3-State Gothic Iron Plate Button)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2K` canvas) as a 3-frame horizontal UI strip where each cell **looks like a `96x24` button state as an example** of apparent pixel density
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Main Menu` / `Basic` / `Confirm 1` normal & hover button states)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2K canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 3-state pixel menu button layout in `Basic Elements` of attached `206965 - Game Menus and HUDs.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal UI strip (three equal button states side-by-side with no text, where each cell visually looks like a 96x24 pixel button as an example of apparent pixel density): Frame 1 Normal state (dark #1A2228 iron plate with #6E757A border and gold corner studs); Frame 2 Hover state (warm #612819 crimson-bronze fill with bright 1px-style #00F0FF soulfire-cyan highlight border); Frame 3 Pressed state (inset #946B22 sanctum-gold plate shifted 1 pixel-block down). avoid: text, letters, blur, gradients.
  ```

### `ui_minimap_frame.png` (Gothic Astrolabe Compass Minimap Bezel)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas) where the pixel-cluster density **looks like a `96x96` minimap frame as an example**
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Pause Menu` / `Collab Menu` square frames)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the square HUD frame border weight in `206965 - Game Menus and HUDs.png`. Render at full high resolution (~1.2K canvas) a UI minimap bezel frame (`ui_minimap_frame`) that visually looks like a 96x96 pixel frame as an example of apparent pixel density: a 4-pixel-block-thick gothic dark-iron (#3A3F47) and antique bronze (#612819) square compass-astrolabe frame with tiny sanctum-gold (#FFC83D) cardinal fleur-de-lis pointers at N/S/E/W, and a completely flat solid #FF00FF magenta transparent center cutout. avoid: drawing a map inside the center, gradients, blur, text.
  ```

### `ui_coin.png` (Abyssal Sovereign Gold Coin)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas) where the pixel-cluster density **looks like a `16x16` coin sprite as an example**
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206508 - Pickups.png` (`Holocoins` 8-frame spinning coin row)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`Other` coin icon)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match Frame 1 of `Holocoins` in attached `206508 - Pickups.png`. Render at full high resolution (~1.2K canvas) a sprite of `ui_coin` that visually looks like a 16x16 pixel sprite as an example of apparent pixel density: a stamped sanctum-gold (#FFC83D, #D49B2A, #946B22) ancient sovereign coin embossed with a tiny cross/crown relief and a 1-pixel-block #EFE9DA top-left glint, outlined in 1px-style #0B0D10. avoid: forced tiny downscale, blur, anti-aliasing.
  ```

### `ui_cursor.png` (Runic Targeting Crosshair Cursor)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2Kx1.2K` square canvas) where the pixel-cluster density **looks like a `16x16` reticle sprite as an example**
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`Other` Row 1 Col 4 & 5 crosshair/target icons) + `206965 - Game Menus and HUDs.png` (`Cursor 1`)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2Kx1.2K square canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the pixel reticle clarity of `Other` Row 1 Column 5 in `206883 - Item Icons.png`. Render at full high resolution (~1.2K canvas) a targeting reticle sprite (`ui_cursor`) that visually looks like a 16x16 pixel sprite as an example of apparent pixel density: a crisp symmetrical diamond-and-cross runic reticle with soulfire-cyan (#00F0FF) outer ticks, a 2x2-style bone-white (#EFE9DA) center dot, and a 1px-style #0B0D10 dark outline for contrast over any terrain. avoid: forced tiny downscale, blur, anti-aliasing.
  ```

### `title_logo.png` (Game Title Logo Banner)
- **Category**: `ui`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (~`1.2K` wide banner canvas) where the pixel-cluster density **looks like a `360x64` pixel logo banner as an example**
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206964 - Title.png` (Top pixel logo typography & outline thickness)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2K wide canvas) with chunky hand-pixelled blocks, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the bold, chunky, hand-pixelled logo weight and heavy dark drop-shadow structure of attached `206964 - Title.png` without copying its text or pastel colors. Render at full high resolution (~1.2K canvas) a pixel-art game title logo reading `HELL'S ADVENT` (visually looking like a 360x64 pixel banner as an example of apparent pixel density): chiseled gothic serif capital pixel lettering with a bone-white (#D9D2C3) top bevel, sanctum-gold (#FFC83D) horizon glint across the middle, blood-crimson (#8B3A1E, #D16B38) lower face, and a thick 3-pixel-block #0B0D10 soot drop shadow, centered on a flat #FF00FF magenta background. avoid: smooth vector fonts, anti-aliasing, soft glow.
  ```

### `title_key_art.png` (Main Menu Widescreen Dark Fantasy Pixel Key Art)
- **Category**: `key_art`
- **Apparent Pixel-Grid Vision & Layout**: Render at full high resolution (`16:9` widescreen ~`1536x1024` / `1920x1080` canvas) where the pixel-cluster density **looks like a `480x270` 16-bit/32-bit widescreen pixel illustration as an example**
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206964 - Title.png` (title screen composition)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Background` blood-moon sky & gothic silhouette)
- **Dark Fantasy Visual Design**:
  - **What It Looks Like**: A breathtaking widescreen 16-bit/32-bit dark-fantasy pixel art key illustration (rendered at full high resolution while looking like `480x270` pixel-art density as an example). On the left foreground, **Sena Ibuki** stands in heroic profile atop a **shattered Gothic Gargoyle Viaduct Bridge**, her bone-white mantle (`#D9D2C3`) and crimson-rust hair (`#D16B38`) whipping in the wind beneath her tarnished gold winged brow-circlet, while her cursed katana *Duskrend* gleams with a `1px`-style soulfire-cyan (`#00F0FF`) edge. Below in the valley glows the warm lantern-lit bastion of **Duskhollow Town**; towering in the center-right background against a blood-crimson eclipsed moon sky (`#0B0D10`, `#3B1C18`, `#612819`) rises the monolithic Gothic Cathedral fortress of the **Abyssal Spire**. (No rebar or highway overpasses.)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, rendered at full high resolution (~1.2K–1.5K widescreen canvas) with chunky hand-pixelled blocks, 48-color Hell's Advent master palette, crisp hard nearest-neighbor pixel edges, zero anti-aliasing, zero blur, 100% opaque. REFERENCE-GUIDED INSTRUCTION: Combine the epic panoramic title-screen staging of `206964 - Title.png` with the blood-moon gothic castle sky of `206852 - Stage 3 - Halloween Castle.png`. Render at full high resolution a widescreen 16:9 pixel-art scene (`title_key_art`, visually looking like a 480x270 pixel illustration as an example of apparent pixel density): on the left foreground, Sena Ibuki stands in heroic profile atop a shattered gothic stone gargoyle bridge, her bone-white cloak (#D9D2C3) and crimson-rust hair (#D16B38) blowing in the wind beneath her gold winged brow-circlet while her Duskrend katana gleams with a soulfire-cyan (#00F0FF) edge; below in the mid-ground valley glows the warm sanctum-gold (#FFC83D, #8B3A1E) lantern bastion of Duskhollow Town; towering in the center-right background against a soot-and-crimson (#0B0D10, #3B1C18, #612819) eclipsed blood-moon sky rises the monolithic gothic cathedral fortress of the Abyssal Spire. avoid: rebar, highway bridges, modern buildings, text, logos, UI buttons, smooth digital painting, 3D render, soft airbrush gradients.
  ```

---

## Part 4: Quick Reference Lookup Table (`tempartreference(DONOTCOMPLETELYCOPY)` -> `HellsAdvent`)

| Hell's Advent Asset Group | Exact Reference File(s) in `tempartreference(DONOTCOMPLETELYCOPY)/` | High-Res (~1.2K) Canvas & Apparent Pixel-Grid Vision Example |
| :--- | :--- | :--- |
| **Sena Ibuki (`sena_*`)** | `Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`, `Ayame_slash.png`, `Ayame_spiritslash.png`, `Ayame_Port.png`, `Ayame_Special.png` | Render at ~1.2K resolution; cells **look like `64x64` sprites as an example** (6×2 master sheet + 21 directional/action strips) & portraits **look like `96x96` as an example** |
| **Rook Matsuda (`rook_*`)** | `Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta.png`, `Zeta_pistol.png`, `Zeta_BigBullet.png`, `204785 - Amelia Watson.png` | Render at ~1.2K resolution; cells **look like `64x64` sprites as an example** (6×2 master sheet + 21 directional/action strips) & portraits **look like `96x96` as an example** |
| **Ines Calloway (`ines_*`)** | `Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/Ina.png`, `Ina__wheel.png`, `529968 - Murasaki Shion/Shion.png`, `Shion_Circle.png` | Render at ~1.2K resolution; cells **look like `64x64` sprites as an example** (6×2 master sheet + 21 directional/action strips) & portraits **look like `96x96` as an example** |
| **Kaelen Vos (`kaelen_*`)** | `Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png`, `530011 - Shirogane Noel/Noel.png`, `530030 - Kiryu Coco/Coco.png` | Render at ~1.2K resolution; cells **look like `64x64` sprites as an example** (6×2 master sheet + 21 directional/action strips) & portraits **look like `96x96` as an example** |
| **Vespera Locke (`vespera_*`)** | `Playable Characters - JP Gen 0/529818 - Roboco-san/Roboco.png`, `Roboco_electric.png`, `529784 - Ouro Kronii/Kronii.png` | Render at ~1.2K resolution; cells **look like `64x64` sprites as an example** (6×2 master sheet + 21 directional/action strips) & portraits **look like `96x96` as an example** |
| **Common Enemies** | `Enemies/206132 - Myth Enemies (EN Gen1).png`, `206133 - CouncilRyS Enemies.png`, `206134 - Gamers Enemies (JP).png`, `529823 - Haachama/Haachama_Spider.png`, `529825 - Yozora Mel/Mel_bat.png` | Render at ~1.2K resolution; 5-frame strip where each cell **looks like a `40x40` sprite as an example** |
| **Elite Enemies** | `Enemies/206549 - Enemies (Miscellaneous).png`, `Bosses/206503 - Stage 4 Mini Boss (Udin).png`, `Enemies/206132 - Myth Enemies.png` | Render at ~1.2K resolution; 7-frame strip where each cell **looks like an `80x80` sprite as an example** |
| **Fusion & King Bosses** | `Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`, `206497 - Stage 2 Mini Boss (Mikodanye).png`, `206503 - Stage 4 Mini Boss (Udin).png` | Render at ~1.2K resolution; 7-frame strip where each cell **looks like `96x96` (10× Fusion) or `128x128` (5× King) as an example** |
| **Bloodline Bosses (`the_foreman`, `big_axle`, `mother_sump`, `the_long_dry` + Floors 1–5)** | `Bosses/206501 - Stage 3 Mini Boss (Shubangelion).png`, `206502 - Stage 3 Hard Boss (Myth or Treat).png`, `206500 - Stage 3 Boss (Hachama).png`, `206495 - Stage 1 Mini Boss (Fubuzilla).png` | Render at ~1.2K resolution; 9-frame strip where each cell **looks like `128x128` (Warden), `160x160` (Executioner), or `192x192`–`256x192` (Overlord) as an example** |
| **Combat VFX (`fx_*`)** | `Miscellaneous/206506 - Effects.png`, `Items/206879 - Weapons.png`, `Items/206880 - Weapons (Collabs).png` | Render at ~1.2K resolution; cells **look like `128x128`, `160x48`, `256x256`, `192x192`, or `480x120` as an example** |
| **World Tiles (`tile_*`) & Props (`prop_*`)** | `Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png`, `206142 - Stage 1.png`, `206841 - Stage 1 Hard (Night).png`, `206853 - Stage 4.png`, `Holo House/206120..206127` | Render at ~1.2K resolution; tiles **look like `16x16` as an example** & props/buildings **look like `32x32`–`160x120` as an example** |
| **NPCs (`ume.png` & Duskhollow Cast)** | `Shop/206131 - Shop Menu.png`, `Holo House/206141 - NPCs.png`, `Holo House/206116 - Cooking.png` | Render at ~1.2K resolution; 2-frame strip where each cell **looks like `64x64` as an example** & portraits **look like `96x96` as an example** |
| **Skill, Status & Item Icons (`icon_*`)** | `Items/206883 - Item Icons.png`, Character `_Perk1..3.png`, `_Weapon.png`, `_Special.png` | Render at ~1.2K resolution; icons **look like `32x32` framed square icons or `16x16` HUD status badges as an example** |
| **HUD, Menus & Title (`ui_*`, `title_*`)** | `Miscellaneous/206965 - Game Menus and HUDs.png`, `206964 - Title.png`, `206508 - Pickups.png`, `206962 - Holozon Box.png` | Render at ~1.2K resolution; elements **look like `48x48`, `128x12`, `96x24`, `96x96`, `16x16`, `360x64`, or `480x270` as an example** |

---

## SECTION 12: FULL 21-STRIP DIRECTIONAL & COMBAT ANIMATIONS FOR ROOK, INES, KAELEN & VESPERA (Plus 15 Dark Fantasy Specialization Costume Sheets)

> **CRITICAL RESOLUTION & PIXEL-GRID VISION RULE (NO FORCED TINY DOWNSCALE)**:
> Image generators (`gpt-image-1` / Gemini Image Gen) render natively at **high resolution (~`1024x1024` to `1536x1024` / ~`1.2Kx1.2K` canvas)**. Never ask the generator for a tiny literal `64x64` pixel image or force a destructive raw downscale to `64x64`, which blurs and ruins the artwork. Instead, every prompt instructs the generator to render on a **full high-resolution canvas (~1.2K)** where each cell is drawn with chunky, crisp pixel clusters so it **looks like** a classic `64x64`-scale 16-bit sprite as an example of apparent pixel density.

To give **Rook Matsuda (`rook`)**, **Ines Calloway (`ines`)**, **Kaelen Vos (`kaelen`)**, and **Vespera Locke (`vespera`)** 100% animation parity with **Sena Ibuki (`sena`)**, each character uses the exact same **21-strip directional & combat animation architecture** (apparent `64x64`-style pixel-grid cells rendered at full high resolution, left-facing mirrored at runtime from `_side`):

### 12.1 Universal 21-Strip Animation Specification (Applies to `sena`, `rook`, `ines`, `kaelen`, `vespera`)

| Strip Suffix | Apparent Grid Aspect Example (Rendered at High-Res ~1.2K) | Frames | FPS | Anchor Ratio | Gameplay Trigger & Animation Keyframe Breakdown |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`<char>_turnaround.png`** | 4:1 strip (looks like four `64x64`-style cells) | 4 | 2 | `[0.5, 0.94]` | Character model sheet: Frame 1 Front/Down, Frame 2 Back/Up, Frame 3 Left Side, Frame 4 Right Side. |
| **`<char>_idle_down.png`** | 2:1 strip (looks like two `64x64`-style cells) | 2 | 4 | `[0.5, 0.94]` | Down-facing combat ready idle: Frame 1 neutral stance; Frame 2 1-step torso/head breathing bob + secondary hair/cloak shift. |
| **`<char>_idle_up.png`** | 2:1 strip (looks like two `64x64`-style cells) | 2 | 4 | `[0.5, 0.94]` | Up-facing (back view) idle: shows dorsal weapon/ossuary-shrine/dragon-crest/seraph-halo details with breathing bob. |
| **`<char>_idle_side.png`** | 2:1 strip (looks like two `64x64`-style cells) | 2 | 4 | `[0.5, 0.94]` | Right-facing profile idle (mirrored for left): breathing bob, signature dark-fantasy weapon poised in hand. |
| **`<char>_run_down.png`** | 6:1 strip (looks like six `64x64`-style cells) | 6 | 12 | `[0.5, 0.94]` | Down-facing 6-frame run cycle: alternating boot strides, cape/mantle flare, vertical bounce. |
| **`<char>_run_up.png`** | 6:1 strip (looks like six `64x64`-style cells) | 6 | 12 | `[0.5, 0.94]` | Up-facing 6-frame run cycle: back-view footwork, cloak/scarf streaming toward camera, dorsal relic bobbing. |
| **`<char>_run_side.png`** | 6:1 strip (looks like six `64x64`-style cells) | 6 | 12 | `[0.5, 0.94]` | Right-facing 6-frame sprint cycle: forward torso lean, full 6-step stride, trailing cloak/scarf/hair. |
| **`<char>_attack1_down.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 14 | `[0.5, 0.94]` | Combo Hit 1 (Down): Frame 1 windup/draw; Frame 2 active weapon discharge/slash smear; Frame 3 recovery. |
| **`<char>_attack2_down.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 14 | `[0.5, 0.94]` | Combo Hit 2 (Down): Frame 1 reverse/secondary windup; Frame 2 secondary arc/volley smear; Frame 3 recovery. |
| **`<char>_attack3_down.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 12 | `[0.5, 0.94]` | Combo Hit 3 Finisher (Down): Frame 1 heavy charge; Frame 2 oversized finisher cleave/blast; Frame 3 recovery. |
| **`<char>_attack1_up.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 14 | `[0.5, 0.94]` | Combo Hit 1 (Up / Back View): 3-frame upward attack arc. |
| **`<char>_attack2_up.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 14 | `[0.5, 0.94]` | Combo Hit 2 (Up / Back View): 3-frame reverse upward attack arc. |
| **`<char>_attack3_up.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 12 | `[0.5, 0.94]` | Combo Hit 3 Finisher (Up / Back View): 3-frame heavy upward finisher. |
| **`<char>_attack1_side.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 14 | `[0.5, 0.94]` | Combo Hit 1 (Right Side, mirrored for Left): Frame 1 coil; Frame 2 forward strike/shot flash; Frame 3 follow-through. |
| **`<char>_attack2_side.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 14 | `[0.5, 0.94]` | Combo Hit 2 (Right Side): Frame 1 low/reverse coil; Frame 2 rising arc/rapid shot; Frame 3 high guard. |
| **`<char>_attack3_side.png`** | 3:1 strip (looks like three `64x64`-style cells) | 3 | 12 | `[0.5, 0.94]` | Combo Hit 3 Finisher (Right Side): Frame 1 full windup; Frame 2 heavy lunging finisher; Frame 3 recovery. |
| **`<char>_hurt_down.png`** | 1:1 cell (looks like a `64x64`-style sprite) | 1 | 8 | `[0.5, 0.94]` | Down-facing impact flinch: wincing eyes, torso knocked back, weapon raised defensively. |
| **`<char>_hurt_up.png`** | 1:1 cell (looks like a `64x64`-style sprite) | 1 | 8 | `[0.5, 0.94]` | Up-facing impact flinch: shoulders jolted, cloak/hair flaring outward. |
| **`<char>_hurt_side.png`** | 1:1 cell (looks like a `64x64`-style sprite) | 1 | 8 | `[0.5, 0.94]` | Side-facing impact recoil: leaning back from hit, grit teeth. |
| **`<char>_dodge_side.png`** | 4:1 strip (looks like four `64x64`-style cells) | 4 | 16 | `[0.5, 0.94]` | 4-frame evasive roll/dash: Frame 1 crouch push-off; Frames 2–3 class-colored shadow/soulfire dash blur; Frame 4 knee-slide recovery. |
| **`<char>_death_side.png`** | 4:1 strip (looks like four `64x64`-style cells) | 4 | 6 | `[0.5, 0.94]` | 4-frame defeat sequence: Frame 1 stagger; Frame 2 drop to knees; Frame 3 weapon planted/dropped; Frame 4 slumped kneel. |

---

### 12.2 Rook Matsuda (`rook` — Witch-Hunter Marksman) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta.png`, `Zeta_pistol.png`, `Zeta_Flash.png`, `530068 - Kureiji Ollie/Ollie_chargerifle1.png`, `public/assets/aistudio/image_c95e226e.png`
- **Dark Fantasy Visual Design**: 2-head chibi gothic witch-hunter marksman in a high-collared slate-and-crimson inquisitor cloak (`#26313A` / `#612819`), pointed dark-leather witch-hunter hat with a sanctum-gold buckle (`#FFC83D`), an engraved gold ocular-rune eyepatch over his right amber-gold eye, a bandolier of blessed silver stakes across his chest, wielding the **Hexbane Arbalest** (a gothic dark-iron & carved wyrm-bone repeating crossbow with a sanctum-gold bow prod and glowing `#FFC83D` / `#EFE9DA` silver bolts).
- **All 21 Strip Files & Prompts**:
  1. **`rook_turnaround.png`** (4 frames, rendered at high-res ~1.2K looking like four `64x64`-style pixel-art cells):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 2-head chibi proportions of `Zeta.png` and `image_c95e226e.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal turnaround strip whose chunky pixel-cluster density looks like four 64x64-style 16-bit cells (Down, Up, Left, Right) of Rook Matsuda, Witch-Hunter Marksman: ash-silver hair under a pointed dark leather witch-hunter hat with gold buckle (#FFC83D), engraved gold ocular-rune eyepatch over one amber eye, high-collared slate-and-crimson inquisitor mantle with a blessed silver-stake bandolier, holding the Hexbane Arbalest (dark-iron and carved bone repeating crossbow with a sanctum-gold prod). avoid: modern rifles, sci-fi guns, forced tiny downscaling.
     ```
  2. **`rook_idle_down.png`**, **`rook_idle_up.png`**, **`rook_idle_side.png`** (2 frames each, 4 fps):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match Row 1 idle frames of `Zeta.png`. Render at full high resolution (~1.2K canvas) a 2-frame horizontal strip with apparent pixel density looking like two 64x64-style 16-bit cells of Rook Matsuda in [down-facing / up-facing back / right-side profile] combat idle stance: Frame 1 poised holding the dark-iron and bone Hexbane Arbalest at hip level with its sanctum-gold bow prod glinting; Frame 2 subtle 1-pixel-unit breathing bob with inquisitor cloak hem and pointed hat brim shifting.
     ```
  3. **`rook_run_down.png`**, **`rook_run_up.png`**, **`rook_run_side.png`** (6 frames each, 12 fps):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match Row 2 6-frame run cycle of `Zeta.png`. Render at full high resolution (~1.2K canvas) a 6-frame horizontal strip looking like six 64x64-style 16-bit cells of Rook Matsuda running in [down-facing / up-facing back / right-side profile] view: 6-frame leather boot stride, gothic inquisitor cloak tail flaring, one hand steadying his pointed witch-hunter hat brim while the other carries the Hexbane Arbalest.
     ```
  4. **`rook_attack1_down.png`**, **`rook_attack1_up.png`**, **`rook_attack1_side.png`** (3 frames each, 14 fps — *Snap-Shot Silver Bolt*):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match `Zeta.png` and `Zeta_Flash.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Rook Matsuda performing Attack 1 (Snap-Shot Silver Bolt) in [down / up / right-side] view: Frame 1 raising the Hexbane Arbalest to eye level with his gold ocular-rune glinting; Frame 2 loosing a consecrated silver bolt with a crisp sanctum-gold (#FFC83D) and bone-white (#EFE9DA) bowstring cross-flash; Frame 3 lever-drawing recovery.
     ```
  5. **`rook_attack2_down.png`**, **`rook_attack2_up.png`**, **`rook_attack2_side.png`** (3 frames each, 14 fps — *Twin Repeater Volley*):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match `Zeta.png` and `Zeta_pistol.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Rook Matsuda performing Attack 2 (Twin Repeater Volley) in [down / up / right-side] view: Frame 1 low braced stance; Frame 2 rapid double-bolt release from the repeatingbone-and-iron arbalest with twin staggered sanctum-gold (#FFC83D) bolt streaks; Frame 3 crisp cocking snap.
     ```
  6. **`rook_attack3_down.png`**, **`rook_attack3_up.png`**, **`rook_attack3_side.png`** (3 frames each, 12 fps — *Heavy Consecrated Stake Blast*):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match `Ollie_chargerifle1.png` and `Zeta_BigBullet.png`. Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Rook Matsuda performing Attack 3 Finisher (Consecrated Silver Great-Stake) in [down / up / right-side] view: Frame 1 kneeling/bracing the Hexbane Arbalest as its wyrm-bone and gold prod blazes #FFE478; Frame 2 loosing a massive demon-piercing silver great-stake with a wide cone of sanctum-gold rune sparks and recoil slide; Frame 3 incense-smoke recovery.
     ```
  7. **`rook_hurt_down.png`**, **`rook_hurt_up.png`**, **`rook_hurt_side.png`** (1 frame each):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a single square sprite cell looking like a 64x64-style 16-bit sprite of Rook Matsuda in [down / up / right-side] hurt recoil pose: knocked back, holding onto his pointed witch-hunter hat brim, gold ocular-rune sparking, Hexbane Arbalest held across his torso.
     ```
  8. **`rook_dodge_side.png`** (4 frames, 16 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Rook Matsuda performing a right-facing witch-hunter shadow-tumble roll: Frame 1 low dive push-off; Frames 2–3 tucked inquisitor cloak roll trailing sanctum-gold (#FFC83D) rune motes and ash; Frame 4 one-knee arbalest-aiming slide recovery.
     ```
  9. **`rook_death_side.png`** (4 frames, 6 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Rook Matsuda's defeat sequence in side profile: Frame 1 staggering back; Frame 2 dropping to one knee as his witch-hunter hat tips forward; Frame 3 resting the Hexbane Arbalest stock on the stones; Frame 4 slumped forward in shadow with hat brim covering his eyes.
     ```

---

### 12.3 Ines Calloway (`ines` — Ossuary Necromancer & Blood-Lich) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/Ina.png`, `Ina__wheel.png`, `529968 - Murasaki Shion/Shion.png`, `Shion_Circle.png`, `public/assets/aistudio/image_c95e226e.png`
- **Dark Fantasy Visual Design**: 2-head chibi ossuary necromancer & blood-lich noblewoman with bone-white & ebon twin-locks (`#D9D2C3` / `#1A2228`), carved raven-skull hairpins, emerald-verdigris anime eyes (`#4FD6A0`), skeletal bone rib-corset over tattered soot-black catacomb vestments, a hovering gothic **Ossuary Bone-Shrine Censer** emitting verdigris soulfire behind her back, wielding the **Gravelord Scepter** (horned skull-topped bone staff with a glowing verdigris `#4FD6A0` soul-gem) and 3 orbiting cursed bone-blade shards. (Zero industrial magnets.)
- **All 21 Strip Files & Prompts**:
  1. **`ines_turnaround.png`** (4 frames):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match 2-head chibi proportions of `Ina.png` and `Shion.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal turnaround strip looking like four 64x64-style 16-bit cells (Down, Up, Left, Right) of Ines Calloway, Ossuary Necromancer: bone-white twin locks with carved skull hairpins, emerald-verdigris (#4FD6A0) eyes, skeletal bone rib-corset over tattered dark catacomb robes, gothic bone-shrine reliquary censer burning with green soulfire on her back, holding the skull-crowned Gravelord Scepter with 3 jagged bone-blade shards hovering around her waist. avoid: industrial magnets, sci-fi tech.
     ```
  2. **`ines_idle_down.png`**, **`ines_idle_up.png`**, **`ines_idle_side.png`** (2 frames each, 4 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 2-frame horizontal strip looking like two 64x64-style 16-bit cells of Ines Calloway in [down / up / right-side] idle stance: subtle breathing bob, dorsal bone-shrine censer flickering with verdigris (#4FD6A0) soulfire, 3 jagged bone-blade shards orbiting around her waist.
     ```
  3. **`ines_run_down.png`**, **`ines_run_up.png`**, **`ines_run_side.png`** (6 frames each, 12 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 6-frame horizontal strip looking like six 64x64-style 16-bit cells of Ines Calloway in a [down / up / right-side] 6-frame spectral glide-run cycle: bone-white twin locks and dark catacomb vestments billowing, Gravelord Scepter held forward, verdigris soulfire mist streaming from her dorsal bone-shrine.
     ```
  4. **`ines_attack1_down.png`**, **`ines_attack1_up.png`**, **`ines_attack1_side.png`** (3 frames each, 14 fps — *Scepter Bone-Shard Lash*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Ines Calloway performing Attack 1 (Scepter Bone-Shard Lash) in [down / up / right-side] view: Frame 1 drawing the Gravelord Scepter back as its skull eyes flare #4FD6A0; Frame 2 sweeping the scepter forward, hurling a crescent wave of razor bone shards and verdigris soulfire arcs; Frame 3 poised recovery.
     ```
  5. **`ines_attack2_down.png`**, **`ines_attack2_up.png`**, **`ines_attack2_side.png`** (3 frames each, 14 fps — *Spectral Grave-Claw Pulse*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Ines Calloway performing Attack 2 (Spectral Grave-Claw Pulse) in [down / up / right-side] view: Frame 1 left hand raised with a glowing verdigris necromantic sigil; Frame 2 a giant spectral skeletal claw and soulfire ring erupting outward in #4FD6A0 and #EFE9DA; Frame 3 recovery.
     ```
  6. **`ines_attack3_down.png`**, **`ines_attack3_up.png`**, **`ines_attack3_side.png`** (3 frames each, 12 fps — *Ossuary Tombstone Crush*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Ines Calloway performing Attack 3 Finisher (Ossuary Monolith Crush) in [down / up / right-side] view: Frame 1 raising both scepter and hand overhead as orbiting bone shards converge into a giant skull-monolith; Frame 2 slamming the scepter down to unleash a massive verdigris (#4FD6A0) and bone-white shockwave; Frame 3 recovery.
     ```
  7. **`ines_hurt_down.png`**, **`ines_hurt_up.png`**, **`ines_hurt_side.png`** (1 frame each):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a single square sprite cell looking like a 64x64-style 16-bit sprite of Ines Calloway in [down / up / right-side] hurt recoil pose: wincing, twin bone-white locks whipped back, verdigris soulfire sparks scattering from her dorsal bone-shrine.
     ```
  8. **`ines_dodge_side.png`** (4 frames, 16 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Ines Calloway performing a right-facing necrotic mist-step dodge: Frame 1 dissolving into swirling bone splinters; Frames 2–3 low vortex of bone-white (#D9D2C3) and verdigris (#4FD6A0) wraith-mist; Frame 4 reforming into poised caster stance.
     ```
  9. **`ines_death_side.png`** (4 frames, 6 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Ines Calloway's defeat sequence in side profile: Frame 1 staggering; Frame 2 dropping to knees as her orbiting bone shards fall inert; Frame 3 Gravelord Scepter clattering to the floor as its green soulfire fades; Frame 4 slumped in her dark catacomb mantle.
     ```

---

### 12.4 Kaelen Vos (`kaelen` — Hellfire Dragoon & Wyrm-Knight) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png`, `530011 - Shirogane Noel/Noel.png`, `530030 - Kiryu Coco/Coco.png`, `public/assets/aistudio/image_c95e226e.png`
- **Dark Fantasy Visual Design**: 2-head chibi hellfire dragoon knight in jagged obsidian-and-crimson **Wyrm-Scale Dragonplate** (`#2A353D` / `#8B3A1E`), curved sanctum-gold dragon horns on his brow (`#FFC83D`), flame-tipped spiky crimson hair, molten ember-orange anime eyes (`#FF5A26`), **Twin Charred Dragon-Wing Dorsal Crests** on his back venting hellfire embers, and a glowing brimstone dragon-heart core in his breastplate, wielding the **Cinderlance** (a heavy serrated obsidian-and-bone dragon-slayer great-lance with a molten `#FF5A26` magma core). (Zero boiler pipes or industrial tanks.)
- **All 21 Strip Files & Prompts**:
  1. **`kaelen_turnaround.png`** (4 frames):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the armored 2-head chibi proportions of `Noel.png` and `204696 - Takanashi Kiara.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal turnaround strip looking like four 64x64-style 16-bit cells (Down, Up, Left, Right) of Kaelen Vos, Hellfire Dragoon: spiky crimson-rust hair with ember tips, curved gold dragon-horn crown (#FFC83D), molten ember-orange (#FF5A26) eyes, jagged obsidian wyrm-scale dragonplate with a glowing brimstone dragon-heart chest core, twin charred dragon-wing dorsal crests on his back venting ember sparks, wielding the serrated Cinderlance dragon-spear. avoid: boiler pipes, steam engines, sci-fi jetpacks.
     ```
  2. **`kaelen_idle_down.png`**, **`kaelen_idle_up.png`**, **`kaelen_idle_side.png`** (2 frames each, 4 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 2-frame horizontal strip looking like two 64x64-style 16-bit cells of Kaelen Vos in [down / up / right-side] idle stance: heavy dragonplate breathing bob, dorsal dragon-wing crests puffing ember-orange (#FF5A26) hellfire sparks, Cinderlance held ready.
     ```
  3. **`kaelen_run_down.png`**, **`kaelen_run_up.png`**, **`kaelen_run_side.png`** (6 frames each, 12 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 6-frame horizontal strip looking like six 64x64-style 16-bit cells of Kaelen Vos in a [down / up / right-side] 6-frame heavy dragoon run cycle: clawed wyrm-scale greaves pounding, tattered crimson dragon-cape flaring, dorsal dragon crests streaming ember sparks, Cinderlance couched at his side.
     ```
  4. **`kaelen_attack1_down.png`**, **`kaelen_attack1_up.png`**, **`kaelen_attack1_side.png`** (3 frames each, 14 fps — *Cinderlance Wide Dragonfire Sweep*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Kaelen Vos performing Attack 1 (Wide Cinderlance Dragonfire Sweep) in [down / up / right-side] view: Frame 1 drawing the Cinderlance back as his dragon-heart chest core flares; Frame 2 wide 160-degree horizontal spear sweep trailing a crescent of ember-orange (#FF5A26) and gold (#FFE478) dragonfire; Frame 3 recovery.
     ```
  5. **`kaelen_attack2_down.png`**, **`kaelen_attack2_up.png`**, **`kaelen_attack2_side.png`** (3 frames each, 14 fps — *Reverse Brimstone Cleave*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Kaelen Vos performing Attack 2 (Reverse Brimstone Cleave) in [down / up / right-side] view: Frame 1 coiled reverse grip; Frame 2 reverse backhand lance cleave erupting with molten brimstone sparks (#FF5A26, #D16B38); Frame 3 braced recovery.
     ```
  6. **`kaelen_attack3_down.png`**, **`kaelen_attack3_up.png`**, **`kaelen_attack3_side.png`** (3 frames each, 12 fps — *Hell-Drake Wyrm-Fang Thrust*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Kaelen Vos performing Attack 3 Finisher (Hell-Drake Wyrm-Fang Thrust) in [down / up / right-side] view: Frame 1 spectral dragon wings flaring behind his shoulders; Frame 2 explosive two-handed Cinderlance lunge projecting a roaring dragon-jaw cone of white-hot (#EFE9DA) and ember-orange (#FF5A26) hellfire; Frame 3 recovery.
     ```
  7. **`kaelen_hurt_down.png`**, **`kaelen_hurt_up.png`**, **`kaelen_hurt_side.png`** (1 frame each):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a single square sprite cell looking like a 64x64-style 16-bit sprite of Kaelen Vos in [down / up / right-side] hurt recoil pose: braced behind the Cinderlance shaft, ember sparks scattering from his dragonplate pauldrons, grit teeth.
     ```
  8. **`kaelen_dodge_side.png`** (4 frames, 16 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Kaelen Vos performing a right-facing dragon-wing flame-rush dodge: Frame 1 low crouched ignition; Frames 2–3 fiery horizontal dragoon rush wreathed in ember-orange (#FF5A26) and gold (#FFC83D) dragonfire wings; Frame 4 heavy clawed-greave slide recovery.
     ```
  9. **`kaelen_death_side.png`** (4 frames, 6 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Kaelen Vos's defeat sequence in side profile: Frame 1 staggering as his dragon-heart chest core flickers; Frame 2 dropping to one knee; Frame 3 planting the Cinderlance upright into the ground as its magma glow dims; Frame 4 bowed head resting against the lance shaft.
     ```

---

### 12.5 Vespera Locke (`vespera` — Eldritch Soulbinder & Astral Oracle) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - JP Gen 0/529818 - Roboco-san/Roboco.png`, `Roboco_electric.png`, `529784 - Ouro Kronii/Kronii.png`, `public/assets/aistudio/image_c95e226e.png`
- **Dark Fantasy Visual Design**: 2-head chibi eldritch soulbinder & astral oracle with long starlight-silver hair (`#D9D2C3`), a tarnished-gold **Eclipsed-Star Tiara** set with an eldritch volt-lime (`#C9F24B`) jewel on her brow, luminous violet/volt anime eyes, midnight sanctum velvet robes with twin glowing volt-lime (`#C9F24B`) runic prayer stoles, a floating starforged gold **Seraphic Astrolabe Halo Ring** behind her shoulders, and an **Astral Lightning Whip & Levitating Grimoire** accompanied by winged wisp-skulls. (Zero robot visors or mechanical coils.)
- **All 21 Strip Files & Prompts**:
  1. **`vespera_turnaround.png`** (4 frames):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match 2-head chibi proportions and floating halo geometry of `Kronii.png`. Render at full high resolution (~1.2K canvas) a 4-frame horizontal turnaround strip looking like four 64x64-style 16-bit cells (Down, Up, Left, Right) of Vespera Locke, Eldritch Soulbinder: long starlight-silver hair (#D9D2C3), tarnished gold star tiara with a volt-green (#C9F24B) gem, midnight sanctum robes with glowing runic stoles, floating starforged gold Seraphic Astrolabe Halo Ring behind her shoulders studded with 3 soul-gems, and an Astral Lightning Whip & levitating Grimoire. avoid: robot visors, sci-fi antennas, copper coils.
     ```
  2. **`vespera_idle_down.png`**, **`vespera_idle_up.png`**, **`vespera_idle_side.png`** (2 frames each, 4 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 2-frame horizontal strip looking like two 64x64-style 16-bit cells of Vespera Locke in [down / up / right-side] idle stance: subtle breathing bob, floating gold Seraphic Astrolabe Halo Ring hovering behind her shoulders with eldritch volt-green (#C9F24B) rune sparks.
     ```
  3. **`vespera_run_down.png`**, **`vespera_run_up.png`**, **`vespera_run_side.png`** (6 frames each, 12 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 6-frame horizontal strip looking like six 64x64-style 16-bit cells of Vespera Locke in a [down / up / right-side] 6-frame run cycle: starlight-silver hair and midnight sanctum cloak flowing, Seraphic Astrolabe Halo Ring rotating behind her shoulders, eldritch volt-green (#C9F24B) starlight sparks trailing her boots.
     ```
  4. **`vespera_attack1_down.png`**, **`vespera_attack1_up.png`**, **`vespera_attack1_side.png`** (3 frames each, 14 fps — *Astral Lightning Whip Lash*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Vespera Locke performing Attack 1 (Astral Lightning Whip Lash) in [down / up / right-side] view: Frame 1 Seraphic Halo ring flaring volt-green (#C9F24B); Frame 2 snapping a jagged tendril-whip of eldritch volt-green (#C9F24B) and bone-white (#EFE9DA) lightning forward; Frame 3 recovery.
     ```
  5. **`vespera_attack2_down.png`**, **`vespera_attack2_up.png`**, **`vespera_attack2_side.png`** (3 frames each, 14 fps — *Twin Seraphic Arc Discharge*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Vespera Locke performing Attack 2 (Twin Seraphic Arc Discharge) in [down / up / right-side] view: Frame 1 open grimoire page glowing; Frame 2 twin intersecting arcs of eldritch volt-green (#C9F24B) and soulfire-cyan (#00F0FF) lightning firing from her Seraphic Halo; Frame 3 recovery.
     ```
  6. **`vespera_attack3_down.png`**, **`vespera_attack3_up.png`**, **`vespera_attack3_side.png`** (3 frames each, 12 fps — *Seraphic Starfall Nova*):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 3-frame horizontal strip looking like three 64x64-style 16-bit cells of Vespera Locke performing Attack 3 Finisher (Seraphic Starfall Nova) in [down / up / right-side] view: Frame 1 levitating as her Seraphic Astrolabe Halo expands; Frame 2 unleashing a wide multi-pronged volt-green (#C9F24B) and sanctum-gold (#FFC83D) celestial lightning burst; Frame 3 landing recovery.
     ```
  7. **`vespera_hurt_down.png`**, **`vespera_hurt_up.png`**, **`vespera_hurt_side.png`** (1 frame each):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a single square sprite cell looking like a 64x64-style 16-bit sprite of Vespera Locke in [down / up / right-side] hurt recoil pose: knocked back, Seraphic Halo Ring tilted and sparking volt-green (#C9F24B), silver hair flaring.
     ```
  8. **`vespera_dodge_side.png`** (4 frames, 16 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Vespera Locke performing a right-facing astral rift-blink dodge: Frame 1 stepping into a volt-green (#C9F24B) runic circle; Frames 2–3 celestial lightning orb & starlight afterimage streak; Frame 4 emerging from an arrival sigil.
     ```
  9. **`vespera_death_side.png`** (4 frames, 6 fps):
     ```text
     [Global Style Lock] Render at full high resolution (~1.2K canvas) a 4-frame horizontal strip looking like four 64x64-style 16-bit cells of Vespera Locke's defeat sequence in side profile: Frame 1 staggering; Frame 2 dropping to her knees as her Seraphic Halo Ring dims; Frame 3 the gold halo ring settling onto the ground around her; Frame 4 slumped gently with closed eyes.
     ```

---

### 12.6 All 15 Pure Dark Fantasy Specialization Costume Sprite Sheets (6×2 Grid: Row 1 = 4 Idle, Row 2 = 6 Run, Rendered at High-Res ~1.2K Looking Like `64x64`-Style Cells)
*(Reference: Alternate outfits `_O1.png`, `_O2.png`, `_O3.png` inside `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - .../`)*

| Spec Sheet ID | Character & Specialization | Pure Gothic Dark Fantasy Costume & Weapon Transformation (What It Looks Like for GPT Image) |
| :--- | :--- | :--- |
| **`sena_spec_phantom_edge_sheet.png`** | Sena — **Phantom Edge** (*Shadow Assassin*) | Sleeveless hooded abyssal night-shroud, twin wavy cursed ritual kris-daggers (`Anya_keris.png` ref) glowing `#00F0FF`, spectral wraith-scarf tails. |
| **`sena_spec_rift_breaker_sheet.png`** | Sena — **Rift Breaker** (*Colossus Titan-Breaker*) | Heavy **Gargoyle-Skull & Runed Obsidian Siege Cestus Gauntlets** (`Kaela.png` / `Korone.png` ref) with glowing sanctum-gold (`#FFC83D`) earth-shattering runes and horned cathedral shoulder pauldrons. (No hydraulic pistons.) |
| **`sena_spec_pulse_dancer_sheet.png`** | Sena — **Pulse Dancer** (*Storm-Blade Valkyrie*) | Flowingastral-silk valkyrie battle tunic with twin enchanted **Soulfire & Volt-Rune Chakram Rings** (`#00F0FF` / `#C9F24B`) orbiting her wrists. |
| **`rook_spec_rail_hunter_sheet.png`** | Rook — **Rail Hunter** (*Abyssal Harpooner*) | Long gargoyle-wing stalker cloak, triple-lens gold astrolabe monocle, wielding an oversized **Chained Wyrm-Bone Great-Bow & Tethered Harpoon-Crossbow** (`Ollie_chargerifle1.png` ref). |
| **`rook_spec_siege_gunner_sheet.png`** | Rook — **Siege Gunner** (*Hellfire Culverin Bombardier*) | Heavy dragon-hide blast mantle and bronze lion-head pauldron, carrying a medieval **Gargoyle-Mouthed Hellfire Hand-Culverin Bombard** and dorsal powder-reliquary (`Pekora.png` ref). |
| **`rook_spec_circuit_warden_sheet.png`** | Rook — **Circuit Warden** (*Runic Ward-Artificer*) | Sanctified rune-etched inquisitor coat, dorsal **Consecrated Ward-Spire Reliquary Rack**, and a twin-limbed **Lightning-Rune Repeater Crossbow** (`Roboco.png` ref). |
| **`ines_spec_magnet_crusher_sheet.png`** | Ines — **Magnet Crusher** (*Gravelord Dread-Crusher*) | Heavy ossuary bone-and-black-iron dread cuirass, oversized **Skeletal Gargoyle-Claw Crushing Gauntlets**, and a floating compressed **Charnel Skull-Sphere** (`Sana.png` ref). (No horseshoe magnets.) |
| **`ines_spec_scrapstorm_sheet.png`** | Ines — **Scrapstorm** (*Charnel Blade-Tempest*) | Wind-swept lich shroud surrounded by a permanent whirling halo of **8 Razor-Sharp Cursed Bone-Scythe Blades** (`Ina__wheel.png` ref). |
| **`ines_spec_polarity_breaker_sheet.png`** | Ines — **Polarity Breaker** (*Twin-Soul Reaper*) | Asymmetrical split lich-mantle (left side soulfire-cyan `#00F0FF` life-ward, right side blood-crimson `#FF3B3B` death-curse), wielding **Dual Cursed Bone-and-Iron War-Tonfa Scythes**. |
| **`kaelen_spec_cinder_corsair_sheet.png`** | Kaelen — **Cinder Corsair** (*Wyrm-Wing Sky-Reaver*) | **Spread Charred Dragon-Bone & Hellfire Wings** on his back, horned wyrm-visor helm, wielding paired curved **Molten Dragon-Fang Scimitars** (`204696 - Takanashi Kiara.png` ref). (No jetpack or aviator visor.) |
| **`kaelen_spec_crucible_architect_sheet.png`** | Kaelen — **Crucible Architect** (*Hellforge Runesmith Lord*) | Master hellforge obsidian apron-cuirass, a colossal molten **Demon-Skull Forge-Gauntlet** on his right arm and a blazing **Runehammer** on his left (`Kaela_hammer.png` ref). |
| **`kaelen_spec_cryo_saboteur_sheet.png`** | Kaelen — **Cryo Saboteur** (*Frostbound Rime-Dragoon*) | Hoarfrost-crusted deathknight mantle, **Twin Dorsal Crystalline Glacier-Spire Reliquaries** (`#7CE8FF`) on his back, and dual **Ice-Fang Katar Gauntlets**. (No chemical coolant tanks.) |
| **`vespera_spec_volt_reaver_sheet.png`** | Vespera — **Volt Reaver** (*Storm-Glaive Executioner*) | Armored astral-valkyrie war-coat, crackling volt-lime (`#C9F24B`) horned shoulder pauldrons, wielding a massive **Lightning-Runed Executioner Great-Bardiche** (`Suisei_axswing.png` ref). |
| **`vespera_spec_iron_puppeteer_sheet.png`** | Vespera — **Iron Puppeteer** (*Ossuary Golem-Binder*) | Gold ritual-thread control rings on all zehn fingers with glowing soulfire spirit-chains linked to a hovering **Crowned Iron-and-Bone Gargoyle Homunculus**. |
| **`vespera_spec_storm_cartographer_sheet.png`** | Vespera — **Storm Cartographer** (*Celestial Tempest Weaver*) | Star-charted astromancer vestments, **Starforged Astrolabe Scepter** in hand, and a miniature **Crowned Thunder-Cloud & Lightning Halo** floating above her head (`Kobo.png` ref). |

---

## SECTION 13: ALL REMAINING CHARACTER EXPRESSION PORTRAITS, ULTIMATE CUT-INS & NPC PORTRAITS (Rendered at High-Res ~1.2K Looking Like `96x96` Portraits / `480x120` Cut-Ins)

### 13.1 Companion Playable Character Expression Portraits (16 Files — Apparent `96x96`-Style Bust Portraits Rendered at High Resolution)
- **Primary Reference File(s)**: `public/assets/characters/sheet_combined_272x208_4x.png` + `530074 - Vestia Zeta/Zeta_Port.png` + `529763 - Ninomae Inanis/Ina_Portrait.png`
- **Rook Matsuda (`rook` — Witch-Hunter Marksman)**:
  - **`rook_neutral.png`**: Calm, sharp-eyed witch-hunter bust portrait (rendered at high-res ~1.2K with apparent `96x96` pixel-art density), pointed dark leather witch-hunter hat with gold buckle, engraved gold ocular-rune eyepatch over right eye, left amber-gold eye, blessed silver-stake bandolier, Hexbane Arbalest stock behind shoulder.
  - **`rook_hurt.png`**: Battle-damaged wince, ocular-rune eyepatch sparking gold, hat brim nicked, grit teeth, ash smudge on cheek.
  - **`rook_determined.png`**: Focused marksman lock-on expression, ocular-rune glowing `#FFC83D`, confident smirk, raising the wyrm-bone Hexbane Arbalest.
  - **`rook_ultimate.png`**: Unleashing *Judgement Silver Spear*: amber-gold eye and ocular-rune blazing `#FFE478`, solar-silver spirit wisps rising around his hat brim.
- **Ines Calloway (`ines` — Ossuary Necromancer)**:
  - **`ines_neutral.png`**: Composed gothic ossuary necromancer bust portrait, bone-white & ebon twin-locks with carved raven-skull hairpins, emerald-verdigris (`#4FD6A0`) eyes, skeletal bone rib-corset, dorsal bone-shrine censer glowing behind shoulder.
  - **`ines_hurt.png`**: Wincing expression, bone hairpin cracked, verdigris soulfire sparks leaking from her reliquary collar.
  - **`ines_determined.png`**: Fierce occult chant expression, orbiting razor bone shards floating past her cheeks, Gravelord Scepter skull glowing bright `#4FD6A0`.
  - **`ines_ultimate.png`**: Unleashing *Catacomb Bone-Tempest*: eyes blazing pure emerald-verdigris (`#4FD6A0`), bone-white hair levitating upward in a necrotic soulfire vortex.
- **Kaelen Vos (`kaelen` — Hellfire Dragoon)**:
  - **`kaelen_neutral.png`**: Stoic hellfire dragoon bust portrait, spiky crimson-rust hair, curved gold dragon-horns on brow, molten ember-orange (`#FF5A26`) eyes, jagged obsidian wyrm-scale pauldrons and charred dragon-wing dorsal crests. (No boiler stacks.)
  - **`kaelen_hurt.png`**: Grimacing through heavy impact, ash across cheek, dragon-wing dorsal crest venting emergency hellfire embers.
  - **`kaelen_determined.png`**: Fierce battle roar grin, flame-tipped bangs flaring, Cinderlance dragon-spear tip glowing `#FF5A26` beside his face.
  - **`kaelen_ultimate.png`**: Unleashing *Avatar of the Hell-Drake*: eyes and dragon-horns wreathed in white-hot (`#FFE478`) and molten ember (`#FF5A26`) dragonfire, glowing draconic scales along his jaw.
- **Vespera Locke (`vespera` — Eldritch Soulbinder)**:
  - **`vespera_neutral.png`**: Serene eldritch soulbinder bust portrait, starlight-silver hair, tarnished gold eclipsed-star tiara with volt-lime gem, violet/volt anime eyes, midnight sanctum collar, floating gold Seraphic Astrolabe Halo Ring behind her head.
  - **`vespera_hurt.png`**: Wincing recoil, star tiara flickering with erratic volt-green (`#C9F24B`) lightning sparks, silver hair disheveled.
  - **`vespera_determined.png`**: Intense coven-oracle gaze, levitating Astral Grimoire open in the foreground with glowing `#C9F24B` runes.
  - **`vespera_ultimate.png`**: Unleashing *Choir of Twelve Seraphim*: eyes and star tiara blazing eldritch volt-green (`#C9F24B`) and soulfire-cyan (`#00F0FF`), concentric seraphic astrolabe rings radiating behind her head.

### 13.2 Companion Ultimate Cut-In Banners (4 Additional Widescreen Cut-In Banners — Apparent `480x120`-Style Aspect Rendered at High Resolution)
- **Primary Reference File(s)**: `Miscellaneous/206506 - Effects.png` (`Anime Zoom` speed-lines) + Character `_Port.png`
- **`rook_cutin.png`**: Extreme close-up widescreen anime eye cut-in of Rook Matsuda across a diagonal soot-and-gold speed-line slash banner; his left amber eye and right engraved gold ocular-rune lock onto the target with a blazing `#FFC83D` runic crosshair flare.
- **`ines_cutin.png`**: Extreme close-up widescreen anime eye cut-in of Ines Calloway across a soot-and-verdigris speed-line banner; her emerald-verdigris (`#4FD6A0`) eyes blaze with necromantic runes while bone-white hair strands and skull sigils whip across the frame.
- **`kaelen_cutin.png`**: Extreme close-up widescreen anime eye cut-in of Kaelen Vos across a soot-and-ember speed-line banner; his molten `#FF5A26` draconic eyes and curved gold dragon-horns erupt with white-hot (`#FFE478`) hellfire flames.
- **`vespera_cutin.png`**: Extreme close-up widescreen anime eye cut-in of Vespera Locke across a soot-and-volt speed-line banner; her eyes and forehead eclipsed-star tiara blaze with `#C9F24B` eldritch lightning and geometric astrolabe rings.

### 13.3 Cleansed-Territory Pilgrim NPCs & All 11 NPC Dialogue Portraits
- **3 Cleansed-Territory Pilgrim Sprites (2-frame idle strips rendered at high-res ~1.2K looking like two `64x64`-style cells)**:
  - **`npc_pilgrim_caelum.png` (Sir Caelum the Undying — Cleansed Sanctuary Knight)**: Weathered silver-plate paladin kneeling/standing with a blessed soulfire-cyan (`#00F0FF`) banner-spear and bone-white cloak.
  - **`npc_pilgrim_lyra.png` (Sister Lyra of the Veil — Wandering Shrine Maiden)**: Gothic shrine maiden in bone-white and bog-teal (`#2E6962`) vestments holding a purifying gold thurible censer.
  - **`npc_pilgrim_orin.png` (Runeseeker Orin — Relic Chronicler)**: Hooded scholar-chronicler carrying a grimoire-packed leather rucksack and glowing astrolabe ward-lantern (`#FFC83D`).
- **11 NPC Dialogue Bust Portraits (Rendered at high-res ~1.2K looking like `96x96`-style pixel bust portraits)**:
  - **`portrait_ume.png`** (Quartermaster Ume), **`portrait_vaelen.png`** (Master Smith Vaelen), **`portrait_isolde.png`** (Sister Isolde), **`portrait_malakor.png`** (Chronicler Malakor), **`portrait_solen.png`** (Archmage Solen), **`portrait_maeve.png`** (Maeve the Hearthkeeper), **`portrait_vex.png`** (Vex the Veil-Peddler), **`portrait_morwen.png`** (Morwen the Caravan Mystic), **`portrait_caelum.png`** (Sir Caelum), **`portrait_lyra.png`** (Sister Lyra), **`portrait_orin.png`** (Runeseeker Orin).

---

## SECTION 14: ALL 9 SAME-SPECIES 10× FUSION MID-BOSSES & 9 SECOND-STAGE 5× KING FUSION BOSSES (100% Pure Gothic Dark Fantasy Abominations)

> **Visual & Resolution Rule for Fusion & King Bosses**:
> Render every strip at **full high resolution (~1.2K canvas)** with chunky pixel-cluster density that **looks like** a 7-frame `96x96`-style strip (for 10× Fusions) or `128x128`-style strip (for 5× Kings). Zero tin cans, welding goggles, barbed wire, or mechanical parts—every Fusion and King boss is a terrifying **Darkest Dungeon / Castlevania / Bloodborne** eldritch or ossuary abomination!

### 14.1 Nine 10× Same-Species Fusion Mid-Bosses (7-Frame Strips: Frames 1–2 Move, Frame 3 Sanctum-Gold Telegraph Windup, Frames 4–5 Signature Special Attack, Frame 6 Hurt, Frame 7 Dead)
- **Primary Reference File(s)**: `Bosses/206503 - Stage 4 Mini Boss (Udin).png`, `Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`, `Enemies/206549 - Enemies (Miscellaneous).png`
1. **`fusion_scrap_rat_king.png` (`scrapRatKing` — 10× Shackled Crypt-Rat Amalgam: "The Charnel Rat-King Behemoth")**:
   - **What It Looks Like**: A grotesque **Ten-Headed Rat-King Hydra Behemoth** whose knotted tails, mutated claws, and skeletal spines are fused around a central **Spiked Wrought-Iron Torture Gibbet Cage** (`#8B3A1E`, `#3A3F47`) studded with bleached skulls (`#D9D2C3`) and twenty glowing crimson eyes (`#FF3B3B`), lunging forward in a frenzied stampede (`rollingRush`). (No tin cans or wheels.)
2. **`fusion_bonepack_alpha.png` (`bonepackAlpha` — 10× Flayed Grave-Hound Amalgam: "Cerberus of the Ossuary")**:
   - **What It Looks Like**: A ferocious **Three-Headed Flayed Cerberus Dire-Beast** stitched together from ten grave-hound skeletons (`#D9D2C3`, `#8B3A1E`), wearing a jagged dark-iron spiked executioner's collar with trailing shackle chains and howling with soulfire-cyan (`#00F0FF`) jaws (`pairedLungeHowl`). (No goggles.)
3. **`fusion_wire_cyclone.png` (`wireCyclone` — 10× Stone Gargoyle Imp Amalgam: "Gargoyle Choir Cyclone")**:
   - **What It Looks Like**: A whirling **Aerial Vortex of Ten Fused Stone Gargoyle Imps** bound together by **Spiked Dark-Iron Penance Chains** around a central floating **Blood-Crimson Demon Oculus** (`#FF3B3B`) that arcs cursed blood-lightning (`aerialBoltArcs`). (No barbed wire.)
4. **`fusion_brine_maw.png` (`brineMaw` — 10× Bloated Blood-Leech Amalgam: "Abyssal Gullet-Worm")**:
   - **What It Looks Like**: A cavernous, multi-ringed **Eldritch Bog-Leviathan Maw** formed from ten bloated mire-leeches fused around a central circular lamprey gullet of 36 bone teeth dripping glowing venom-green (`#9CB34C`) bile (`suctionDrain`).
5. **`fusion_screech_choir.png` (`screechChoir` — 10× Vampiric Crypt-Bat Amalgam: "Cathedral Belfry Strigoi")**:
   - **What It Looks Like**: A winged **Vampiric Bat-Cathedral Abomination** formed from ten giant crypt-bats fused around a cracked **Cursed Bronze Belfry Bell & Bone Ribcage Resonator** that unleashes crimson sonic shockwaves (`sonicCone`).
6. **`fusion_rivet_titan.png` (`rivetTitan` — 10× Skull-Carapace Bone-Spider Amalgam: "Ossuary Arachnid Juggernaut")**:
   - **What It Looks Like**: A towering **Twelve-Legged Catacomb Spider Behemoth** whose abdomen is a mountain of ten fused horned demon skulls (`#D9D2C3`) bound in spiked black-iron armor plates (`#3A3F47`) with a glowing hellfire-ember (`#FF5A26`) underbelly (`titanSlamLeap`). (No furnace vents.)
7. **`fusion_relay_colossus.png` (`relayColossus` — 10× Will-o'-Wisp Soul-Lantern Amalgam: "Astral Censer Obelisk")**:
   - **What It Looks Like**: A floating **Gothic Wrought-Iron Chandelier-Obelisk of Ten Crowned Lich-Skulls** linked by arcs of soulfire-cyan (`#00F0FF`) spirit lightning and swinging sanctum-gold (`#FFC83D`) ritual censers (`overclockBroadcast`). (No tesla coils.)
8. **`fusion_dredge_husk.png` (`dredgeHusk` — 10× Ossuary Coffer Mimic Amalgam: "Charnel Reliquary Hermit-Colossus")**:
   - **What It Looks Like**: A hulking **Multi-Clawed Reliquary Monstrosity** carrying a fortress-shell of ten chained gothic iron-and-bone treasure coffers overflowing with snapping fanged jaws, eyeballs, and lashing venom-green tongues (`feintCounterSlam`).
9. **`fusion_blackwing_furnace.png` (`blackwingFurnace` — 10× Ashen Carrion-Crow Amalgam: "Six-Winged Pyre-Roc")**:
   - **What It Looks Like**: A colossal **Six-Winged Undead Phoenix-Roc of Charred Bone and Burning Black Feathers** with a ribcage full of roaring hellfire coals (`#FF5A26`, `#FFE478`) that rains brimstone firestorms from above (`furnaceAirstrike`). (No boiler grates.)

### 14.2 Nine Second-Stage 5× Mid-Boss "KING" Fusion Bosses (7-Frame Strips Rendered at High-Res ~1.2K Looking Like `128x128`-Style Cells, Outlined in a 2px Sovereign Gold `#FFC83D` & Blood-Crimson `#FF3B3B` Double Rim)
1. **`king_tin_rat.png` (King Tin Rat — "Sovereign Vermin-Emperor of the Gibbet")**: Grotesque crowned **Rat-Daemon Monarch** carried atop a walking ossuary palanquin of fused rat-ogre skeletons and swarming plague-rats, wearing a jagged crown of tarnished sanctum-gold (`#FFC83D`) and wielding a skull-flail. (No tin cans or wheels.)
2. **`king_dust_dog.png` (King Dust Dog — "Arch-Hound Cerberus Rex")**: Colossal **Three-Headed Armored Death-Hound Sovereign** clad in spiked black-iron cataphract barding and ossuary bone-plate, with blazing crimson eye-sockets and soulfire-cyan manes.
3. **`king_wire_kite.png` (King Wire Kite — "Seraphic Gargoyle Archon")**: Towering **Six-Winged Cathedral Gargoyle Arch-Fiend** carved from living obsidian and bone, surrounded by a revolving sanctum-gold astrolabe halo that rains blood-lightning.
4. **`king_lye_leech.png` (King Lye Leech — "Sovereign Hydra of the Weeping Fens")**: Monstrous **Five-Headed Crowned Leech-Hydra** rising from a cracked sacrificial stone altar-basin overflowing with glowing venom-green (`#9CB34C`) plague-ichor.
5. **`king_sump_bat.png` (King Sump Bat — "Nosferatu Chiropteran Overlord")**: Regal, terrifying **Ancient Vampire Bat-Lord** draped in a royal mantle of leathery wings and crimson velvet, with a gothic bone pipe-organ of screaming skulls fused to his back.
6. **`king_rivet_tick.png` (King Rivet Tick — "Citadel Weaver Arachne-Rex")**: Gargantuan **Spider-Monarch Carrying a Ruined Gothic Cathedral Belfry on Its Back**, marching on eight spear-tipped obsidian-and-bone legs. (No hydraulic legs.)
7. **`king_signal_mite.png` (King Signal Mite — "Arch-Lich Skull-Sun Sovereign")**: A colossal **Crowned Lich-Skull Seraph** ablaze with soulfire-cyan (`#00F0FF`) and sanctum-gold (`#FFC83D`) spirit flames, orbited by a choir of ten floating wrought-iron bell-skulls. (No satellite dishes.)
8. **`king_silt_mimic.png` (King Silt Mimic — "Royal Vault-Sarcophagus Gargantua")**: An ornate **Gilded Royal Mausoleum Sarcophagus** split wide open into a three-jawed eldritch bone-and-tentacle leviathan overflowing with cursed gold coins and relics.
9. **`king_cinder_crow.png` (King Cinder Crow — "Ashen Crow-Emperor of the Pyre")**: Towering **Four-Winged Avian Fiend-Lord** in a cloak of burning black feathers, wearing a crown of molten hellfire thorns (`#FF5A26`) and wielding a blazing bone-halberd.

---

## SECTION 15: ALL 60 BLOODLINE BOSSES ACROSS FLOORS 1–5 (4 Bloodlines × 5 Floors × 3 Stages — 100% Pure Gothic Dark Fantasy)

Each Floor features 4 Sectors (`slabTown` North = **House of Malgorth**, `route9` West = **Cavalcade of Varkos**, `lyeMarsh` East = **Coven of Hagra**, `copperFlats` South = **Brood of Skarath**), and each Sector has a 3-stage sequential boss chain rendered at **full high resolution (~1.2K canvas)** with chunky pixel-cluster density that **looks like**:
- **Stage I · Warden**: 9-frame strip looking like `128x128`-style cells
- **Stage II · Executioner**: 9-frame strip looking like `160x160`-style cells
- **Stage III · Overlord**: 9-frame strip looking like `192x192` to `256x192`-style cells

### 15.1 Floor 1 — The Blighted Catacombs (12 Bosses — Accent: `#00F0FF` Soulfire Cyan & `#8B3A1E` Blood-Rust)
- **North (House of Malgorth)**:
  - `boss_f1_north_warden.png` (**Grave-Warden Vorn** — Ossuary Gatekeeper): Towering undead gatekeeper knight in spiked crypt-plate swinging a chained wrought-iron portcullis great-mace.
  - `boss_f1_north_exec.png` (**Bone-Cleaver Gorath** — Crypt Headsman): Giant horned executioner lord in a bone-masked hood wielding a two-handed notched guillotine greatsword.
  - `the_foreman.png` (**High Executioner Malgorth / The Foreman** — Stage III Overlord, Ossuary Bone-Colossus, detailed in Section 5).
- **West (Cavalcade of Varkos)**:
  - `boss_f1_west_warden.png` (**Houndsman Kael** — Gallows Outrider): Mounted skeletal huntsman atop an armored dread-stag holding a chain-leash of snapping flayed grave-hounds and a barbed bone-harpoon.
  - `boss_f1_west_exec.png` (**Iron-Gibbet Draven** — Dread Centaur Reaver): Towering four-legged undead bone-centaur executioner armored in spiked wrought-iron penance cages, swinging twin burning skull-flails. (No wheels.)
  - `big_axle.png` (**Dread Cavalier Varkos / Big Axle** — Stage III Overlord, Six-Legged Skeletal Nightmare Centaur-Archfiend on blazing cloven hooves, detailed in Section 5; zero wheels or vehicles).
- **East (Coven of Hagra)**:
  - `boss_f1_east_warden.png` (**Mire-Witch Syla** — Keeper of Leech Cauldrons): Stilted bog-hag stirring a bone cauldron-staff overflowing with glowing venom-green (`#9CB34C`) leeches.
  - `boss_f1_east_exec.png` (**Leech-Cantor Morvath** — Choir of the Fens): Multi-armed plague-bishop abomination carrying an arched wooden yoke of cursed bronze plague-bells.
  - `mother_sump.png` (**Bog-Matriarch Hagra / Mother Sump** — Stage III Overlord, Eldritch Swamp Hag-Queen, detailed in Section 5).
- **South (Brood of Skarath)**:
  - `boss_f1_south_warden.png` (**Crypt-Stalker Vorx** — Burrower of Ash): Armored bone-and-obsidian centipede-drake with serrated scissoring bone mandibles erupting from crimson ash. (No mechanical drills.)
  - `boss_f1_south_exec.png` (**Tomb-Gorger Krag** — Carapace Behemoth): Hulking six-legged draconic siege-tortoise with a volcanic magma-crater shell on its back that lobs brimstone boulders.
  - `the_long_dry.png` (**Catacomb Elder-Wyrm Skarath / The Long Dry** — Stage III Overlord, Undead Elder Dragon-Wyrm, detailed in Section 5).

### 15.2 Floor 2 — The Frostbound Crypt (12 Bosses — Accent: `#7CE8FF` Hoarfrost Cyan & `#1B3144` Glacial Slate)
- **North**: `boss_f2_north_warden.png` (**Rime-Warden Vorn**), `boss_f2_north_exec.png` (**Deathknight Gorath**), `boss_f2_north_overlord.png` (**Dreadlord Malgorth** — Frostbound deathknight colossus encased in jagged glacier spires and blue soul-ice armor).
- **West**: `boss_f2_west_warden.png` (**Frost-Stalker Kael**), `boss_f2_west_exec.png` (**Glacier-Horn Draven**), `boss_f2_west_overlord.png` (**Cryo-Cavalier Varkos** — Six-legged glacial frost-drake centaur monarch with jagged ice-scythe forelimbs and rime-armored barding).
- **East**: `boss_f2_east_warden.png` (**Frost-Siren Syla**), `boss_f2_east_exec.png` (**Rime-Priest Morvath**), `boss_f2_east_overlord.png` (**Ice-Matriarch Hagra** — Frozen charnel witch-queen enthroned inside a translucent crystal glacier cocoon).
- **South**: `boss_f2_south_warden.png` (**Ice-Borer Vorx**), `boss_f2_south_exec.png` (**Frost-Gorger Krag**), `boss_f2_south_overlord.png` (**Glacier-Wyrm Skarath** — Sub-zero permafrost elder-dragon with jagged diamond-ice fangs and rime-crusted wings).

### 15.3 Floor 3 — The Hellfire Abyss (12 Bosses — Accent: `#FF5A26` Molten Ember & `#3B1A14` Brimstone Obsidian)
- **North**: `boss_f3_north_warden.png` (**Cinder-Warden Vorn**), `boss_f3_north_exec.png` (**Hellblade Gorath**), `boss_f3_north_overlord.png` (**Archfiend Malgorth** — Horned demon-forged caldera colossus with molten obsidian executioner blades).
- **West**: `boss_f3_west_warden.png` (**Hellhound Kael**), `boss_f3_west_exec.png` (**Magma-Hoof Draven**), `boss_f3_west_overlord.png` (**Infernal Cavalier Varkos** — Colossal six-legged hellfire obsidian centaur-archfiend with blazing magma hooves and chained iron-maiden flails).
- **East**: `boss_f3_east_warden.png` (**Pyre-Witch Syla**), `boss_f3_east_exec.png` (**Ash-Cantor Morvath**), `boss_f3_east_overlord.png` (**Cinder-Queen Hagra** — Sacrificial magma-altar daemon-matriarch birthing burning cinder-fiends).
- **South**: `boss_f3_south_warden.png` (**Magma-Burrower Vorx**), `boss_f3_south_exec.png` (**Slag-Maw Krag**), `boss_f3_south_overlord.png` (**Hell-Drake Skarath** — Volcanic elder dragon of jagged obsidian scales and rivers of liquid hellfire).

### 15.4 Floor 4 — The Rotwood Mire (12 Bosses — Accent: `#C9F24B` Spore Volt-Lime & `#1F3D2E` Mycelium Green)
- **North**: `boss_f4_north_warden.png` (**Blight-Warden Vorn**), `boss_f4_north_exec.png` (**Spore-Reaver Gorath**), `boss_f4_north_overlord.png` (**Pestilent Lord Malgorth** — Overgrown fungal-cathedral treant-executioner).
- **West**: `boss_f4_west_warden.png` (**Carrion-Hound Kael**), `boss_f4_west_exec.png` (**Bile-Hulk Draven**), `boss_f4_west_overlord.png` (**Plague-Rider Varkos** — Giant antlered rot-stag centaur sovereign overgrown with weeping bile-briars and spore-censers).
- **East**: `boss_f4_east_warden.png` (**Spore-Witch Syla**), `boss_f4_east_exec.png` (**Rot-Cantor Morvath**), `boss_f4_east_overlord.png` (**Brood-Mother Hagra** — Towering mycelium dryad-empress of the Carrion Fen).
- **South**: `boss_f4_south_warden.png` (**Root-Chewer Vorx**), `boss_f4_south_exec.png` (**Venom-Maw Krag**), `boss_f4_south_overlord.png` (**Putrid Leviathan Skarath** — Ancient rot-wood briar-dragon dripping corrosive spores).

### 15.5 Floor 5 — The Void Citadel (12 Bosses — Accent: `#FFC83D` Sovereign Gold, `#9FA7FF` Astral Violet & `#110C1D` Void Black)
- **North**: `boss_f5_north_warden.png` (**Void-Warden Vorn**), `boss_f5_north_exec.png` (**Astral-Blade Gorath**), `boss_f5_north_overlord.png` (**Eternal Sovereign Malgorth** — Six-winged seraphic executioner archon wielding dimensional rift-greatswords).
- **West**: `boss_f5_west_warden.png` (**Rift-Hound Kael**), `boss_f5_west_exec.png` (**Star-Lancer Draven**), `boss_f5_west_overlord.png` (**Void-Cavalier Varkos** — Starforged cosmic pegasus-centaur archon galloping on constellation void-hooves with an eclipse halberd).
- **East**: `boss_f5_east_warden.png` (**Void-Oracle Syla**), `boss_f5_east_exec.png` (**Void-Choir Morvath**), `boss_f5_east_overlord.png` (**Abyss-Mother Hagra** — Eldritch high priestess of the Eclipsed Star).
- **South**: `boss_f5_south_warden.png` (**Rift-Serpent Vorx**), `boss_f5_south_exec.png` (**Star-Gorger Krag**), `boss_f5_south_overlord.png` (**Elder Void-Dragon Skarath** — Constellation-scaled apex astral dragon of the Demiurge).

---

## SECTION 16: ALL 95 SKILL ICONS, TRAIT ICONS & 28 STATUS EFFECT ICONS (Rendered at High-Res ~1.2K Looking Like `32x32` / `16x16` Pixel Icons)

> **Reference File for All Icons**: `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`444x430` master icon sheet) + Character `_Weapon.png`, `_Perk1..3.png`, `_Special.png`.
> Render each icon at **full high resolution (~1.2K canvas)** with chunky pixel clusters so it **looks like** a classic `32x32` (or `16x16` status) square icon with a `1px #0B0D10` outer outline, `1px #3A3F47` dark-iron bevel (or `#FFC83D` sanctum-gold border for Ultimates), and `#11171B` dark slate interior.

### 16.1 Base Class Active & Ultimate Skill Icons (16 Additional Base Icons)
- **Rook Matsuda (`#FFC83D` Sanctum-Gold Accent)**:
  - `icon_skill_rivet_spread.png` (*Silver Stake Spread*): 5 consecrated silver crossbow bolts fanning outward in a cone with sanctum-gold trails.
  - `icon_skill_kickback.png` (*Sanctified Kickback*): Arbalest bow-prod blast firing downward-right with winged backward-vault arrows.
  - `icon_skill_rapid_fire.png` (*Inquisitor Volley*): 3 rapid-fire silver bolts stacked in parallel motion lines.
  - `icon_skill_rail_slug.png` (*Judgement Silver Spear* Ultimate): Colossal glowing solar-silver spear-bolt piercing a demonic skull-shield (`#FFC83D` border).
- **Ines Calloway (`#4FD6A0` Verdigris Soulfire Accent)**:
  - `icon_skill_pull.png` (*Grave-Grasp Pull*): Spectral skeletal hand pulling 3 jagged bone shards inward into a verdigris vortex.
  - `icon_skill_spin_up.png` (*Whirling Bone-Vortex*): Circular saw-ring of orbiting bone-scythe shards with verdigris soulfire arcs.
  - `icon_skill_lump.png` (*Ossuary Monolith*): Giant compressed skull-monolith of fused catacomb bones being hurled.
  - `icon_skill_scrapfall.png` (*Catacomb Bone-Tempest* Ultimate): Rain of ancestral bone obelisks and tombstones falling from a verdigris sky-rift (`#FFC83D` border).
- **Kaelen Vos (`#FF5A26` Hellfire Ember Accent)**:
  - `icon_skill_naphtha_jet.png` (*Brimstone Dragon-Rush*): Blazing Cinderlance spearhead hurtling forward with twin dragon-wing flame trails.
  - `icon_skill_caustic_mortar.png` (*Hellfire Crucible Bomb*): Lobbed volcanic brimstone orb exploding into a molten magma pool.
  - `icon_skill_vent_supernova.png` (*Infernal Wyrm-Roar*): 360-degree radial dragonfire eruption from a roaring horned dragon skull.
  - `icon_skill_supercritical_meltdown.png` (*Avatar of the Hell-Drake* Ultimate): Horned Hell-Drake skull wreathed in white-hot and molten ember flames (`#FFC83D` border).
- **Vespera Locke (`#C9F24B` Eldritch Volt & `#00F0FF` Soulfire Accent)**:
  - `icon_skill_tesla_pylon.png` (*Eldritch Obelisk*): Pair of runic gold-and-obsidian obelisks linked by a crackling volt-green lightning beam.
  - `icon_skill_seeker_swarm.png` (*Wisp-Skull Swarm*): 3 winged cursed wisp-skulls diving with volt-green eye trails.
  - `icon_skill_phase_blink.png` (*Astral Rift-Step*): Twin linked astrolabe teleportation sigils with a lightning step-streak between them.
  - `icon_skill_overclocked_armada.png` (*Choir of Twelve Seraphim* Ultimate): 12-pointed seraphic gold astrolabe halo firing twin intersecting astral beams (`#FFC83D` border).

### 16.2 All 75 Specialization Skill & Ultimate Icons (5 Icons × 15 Specializations — Pure Dark Fantasy Visual Motifs)
- **Sena — Phantom Edge**: `icon_skill_shadow_pin.png` (cursed kris dagger pinning a shadow), `icon_skill_false_exit.png` (vanishing cloak wraith), `icon_skill_seam_cut.png` (dimensional eye-slit slash), `icon_skill_borrowed_second.png` (shattered hourglass of soulfire), `icon_skill_midnight_corridor.png` (Ult: endless gothic colonnade of cyan slashes).
- **Sena — Rift Breaker**: `icon_skill_pile_fist.png` (gargoyle-skull cestus punch), `icon_skill_faultline_stomp.png` (armored sabaton shattering stone), `icon_skill_anchor_grip.png` (soul-chain grappling claw), `icon_skill_seismic_guard.png` (crossed obsidian gauntlets & earth wall), `icon_skill_worldsplitter.png` (Ult: colossal greatsword cleaving a chasm of gold & cyan light).
- **Sena — Pulse Dancer**: `icon_skill_snapstep.png` (winged lightning boot-step), `icon_skill_conductive_loop.png` (twin interlocking volt chakrams), `icon_skill_backbeat.png` (crescent ribbon counter-slash), `icon_skill_chain_waltz.png` (three dancing blade-rings), `icon_skill_perfect_frequency.png` (Ult: resonating valkyrie bell-halo of cyan lightning).
- **Rook — Rail Hunter**: `icon_skill_harpoon_line.png` (barbed wyrm-bone harpoon on a chain), `icon_skill_sightline_break.png` (gold ocular-rune piercing mist), `icon_skill_ricochet_survey.png` (silver bolt banking off two rune-stones), `icon_skill_pinpoint_verdict.png` (crimson heart pierced by a silver stake), `icon_skill_dead_meridian.png` (Ult: eclipsed sun bisected by a golden great-arrow).
- **Rook — Siege Gunner**: `icon_skill_mortar_beacon.png` (burning inquisitor brazier-flare), `icon_skill_bunker_roller.png` (spiked iron-wheel powder barrel), `icon_skill_salvo_grid.png` (rain of five hellfire cannonballs), `icon_skill_breakwater_shot.png` (roaring lion-mouth culverin blast), `icon_skill_iron_weather.png` (Ult: apocalyptic sky raining burning siege meteors).
- **Rook — Circuit Warden**: `icon_skill_arc_pylon.png` (consecrated lightning-ward spire), `icon_skill_scrambler_disk.png` (spinning engraved brass rune-disc), `icon_skill_relay_swap.png` (twin swapping ward-lanterns), `icon_skill_overload_command.png` (shattering ward-spire lightning nova), `icon_skill_blackout_cascade.png` (Ult: ring of six cathedral ward-spires chaining sanctum lightning).
- **Ines — Magnet Crusher**: `icon_skill_crush_point.png` (twin skeletal hands crushing a skull), `icon_skill_iron_coffin.png` (spiked iron-maiden sarcophagus slamming shut), `icon_skill_mass_driver.png` (hurled charnel bone-boulder), `icon_skill_pressure_inversion.png` (imploding dark-gravity rune sphere), `icon_skill_singularity_press.png` (Ult: black-and-verdigris abyssal void star crushing bones).
- **Ines — Scrapstorm**: `icon_skill_razor_monsoon.png` (whirlwind of curved bone-blades), `icon_skill_shiver_step.png` (wraith-step through flying bone splinters), `icon_skill_crosswind.png` (twin intersecting bone-scythe gusts), `icon_skill_shard_cathedral.png` (spire of levitating bone spears), `icon_skill_thousand_knife_typhoon.png` (Ult: maelstrom of a hundred glowing ritual daggers).
- **Ines — Polarity Breaker**: `icon_skill_northbound.png` (cyan soul-rune pulling forward), `icon_skill_reverse_charge.png` (crimson blood-rune repelling outward), `icon_skill_collision_course.png` (two skulls smashing together in sparks), `icon_skill_mag_rail_surf.png` (gliding atop a stream of spectral bones), `icon_skill_zero_point_reversal.png` (Ult: twin cyan-and-crimson eclipsed moons colliding).
- **Kaelen — Cinder Corsair**: `icon_skill_jet_sickle.png` (flaming dragon-fang scimitar slash), `icon_skill_thruster_feint.png` (spread dragon-wings backflip), `icon_skill_skyhook_dive.png` (meteoric dragoon dive-spear), `icon_skill_razor_afterburn.png` (trail of burning hellfire feathers), `icon_skill_crimson_flyover.png` (Ult: soaring hell-drake carpet-bombing the earth in fire).
- **Kaelen — Crucible Architect**: `icon_skill_mold_stamp.png` (demon-skull forge gauntlet slamming an anvil), `icon_skill_pourline.png` (river of molten gold-and-ember magma), `icon_skill_foundry_press.png` (twin closing obsidian forge-walls), `icon_skill_quench_fracture.png` (cracked red-hot blade steaming), `icon_skill_cathedral_of_iron.png` (Ult: fortress of molten hellforge pillars erupting).
- **Kaelen — Cryo Saboteur**: `icon_skill_cold_snap_canister.png` (shattering hoarfrost crystal flask), `icon_skill_fracture_wire.png` (razor-ice trip-chain), `icon_skill_thermocline_kick.png` (half-fire half-ice dragon kick), `icon_skill_zero_kelvin_flask.png` (ancient rime-phylactery), `icon_skill_whiteout_rupture.png` (Ult: exploding glacier rose of `#7CE8FF` soul-ice).
- **Vespera — Volt Reaver**: `icon_skill_arc_rend.png` (lightning-wreathed great-bardiche cleave), `icon_skill_breaker_step.png` (thunderbolt lunge), `icon_skill_countercoil.png` (parrying halo of volt-lime runes), `icon_skill_thunder_guillotine.png` (falling executioner axe of pure lightning), `icon_skill_cataclysm_edge.png` (Ult: sky-splitting volt-green god-blade).
- **Vespera — Iron Puppeteer**: `icon_skill_titan_hand.png` (colossal Descending gargoyle-golem fist), `icon_skill_anchor_walk.png` (soul-chained homunculus march), `icon_skill_chain_hoist.png` (puppet-strings lifting an enemy skull), `icon_skill_break_order.png` (command sigil shattering a golem core), `icon_skill_colossus_directive.png` (Ult: crowned cathedral golem firing an eye-beam).
- **Vespera — Storm Cartographer**: `icon_skill_cloud_etching.png` (quill drawing a lightning rune in a cloud), `icon_skill_pressure_drop.png` (crushing dark tempest vortex), `icon_skill_isobar_sweep.png` (astrolabe compass sweeping wind-blades), `icon_skill_eye_of_storm.png` (serene starlight eye inside a hurricane), `icon_skill_worldstorm_atlas.png` (Ult: celestial armillary sphere unleashing twelve lightnings).

### 16.3 All 28 Status Effect & Buff HUD Icons (Apparent `16x16` / `32x32`-Style Pixel Badges Rendered at High Resolution)
*(Reference: `Effect Icons` & `Other` in `Items/206883 - Item Icons.png`)*
- **Debuffs (14)**: `icon_status_bleed.png` (crimson blood drop), `icon_status_burn.png` (hellfire ember flame), `icon_status_corrode.png` (venom-dissolved shield), `icon_status_exposed.png` (cracked bone breastplate), `icon_status_weakened.png` (shattered broadsword), `icon_status_slow.png` (shackled iron greave), `icon_status_pinned.png` (soulfire javelin pinning a chain), `icon_status_stun.png` (soulfire-cyan dizzy star), `icon_status_lifted.png` (verdigris necromantic levitation hand), `icon_status_blind.png` (bandaged dark eye), `icon_status_choked.png` (miasma skull-cloud), `icon_status_marked.png` (gold witch-hunter rune crosshair), `icon_status_overloaded.png` (arcing eldritch volt-rune), `icon_status_staggered.png` (cracked sanctum-gold crown).
- **Buffs (14)**: `icon_status_momentum.png` (soulfire-cyan winged chevron), `icon_status_redline.png` (blazing blood-and-soulfire eye), `icon_status_guarding.png` (sanctified aegis crest), `icon_status_steadyAim.png` (gold ocular-rune reticle), `icon_status_holdBreath.png` (consecrated silver bolt), `icon_status_quickHands.png` (winged gold gauntlets), `icon_status_ironHide.png` (obsidian wyrm-scale plate), `icon_status_secondSkin.png` (orbiting bone-ward ring), `icon_status_grounded.png` (rooted stone sabaton), `icon_status_fed.png` (roast wyrm-steak haunch), `icon_status_haste.png` (winged gold greave), `icon_status_focus.png` (glowing astral diamond), `icon_status_warmed.png` (sanctuary hearth flame), `icon_status_bounty.png` (sovereign gold coin crest).

---

## SECTION 17: EXTENDED SUPPLIES, TAVERN MEALS, CURIO COFFERS, WANDERING MERCHANT RELICS & CLASS VFX

### 17.1 Extended Consumables, Tavern Meals, Curios & Relics (Rendered at High-Res ~1.2K Looking Like `32x32` Framed Icons)
- **Additional Alchemical Supplies (`src/data/config.js`)**:
  - `icon_item_lye_wash.png` (*Purifying Salt Phial*): Bog-teal alchemical glass phial (`#2E6962`) filled with glowing bone-white consecrated salt crystals that cleanse Burn and Corrode.
  - `icon_item_hot_stew.png` (*Sanctuary Marrow Chalice*): Steaming bronze cauldron-bowl (`#D16B38`) of rich crimson wyrm-marrow stew granting *Fed*.
  - `icon_item_stim_stick.png` (*Quicksilver Draught Phial*): Winged sanctum-gold and crystal vial (`#FFC83D`, `#00F0FF`) swirling with liquid quicksilver lightning. (No modern medical syringe.)
- **Raven's Rest Tavern Meals (`TAVERN_MEALS` — Reference: `Holo House/206116 - Cooking.png`)**:
  - `icon_meal_wyrm_steak.png` (*Charred Wyrm Steak*): Sizzling bone-in dragon rib steak with ember sear marks on a dark-iron platter.
  - `icon_meal_frost_ale.png` (*Spiced Abyssal Stout*): Frothy iron-hooped oak tavern tankard with golden-amber foam and warm hearth glow.
  - `icon_meal_spiced_marrow.png` (*Seer's Moonlit Broth*): Glowing soulfire-cyan (`#00F0FF`) herbal bone-broth chalice with floating star-anise.
  - `icon_meal_void_nectar.png` (*Sovereign Feast of the Eclipse*): Royal gilded banquet platter with roast wyrm, goblet of void-wine, and golden pomegranates.
- **Vex's Curio Gambling Coffers (`CURIO_GAMBLE_TIERS` — Reference: `Miscellaneous/206962 - Holozon Box.png`)**:
  - `icon_curio_tarnished.png` (*Tarnished Catacomb Coffer*): Weathered dark-iron and carved-bone reliquary lockbox bound with a heavy chain.
  - `icon_curio_bloodbound.png` (*Hellforged Reliquary Box*): Crimson-and-gold runed reliquary chest glowing with hellfire ember seams.
  - `icon_curio_sovereign.png` (*Astral Demiurge Casket*): Ornate sanctum-gold and void-obsidian casket radiating soulfire-cyan and violet starlight.
- **Morwen's Wandering Merchant Relics & Elixirs (`WANDERING_MERCHANT_STOCK`)**:
  - `icon_relic_blood_chalice.png` (*Cursed Blood Chalice*): Gothic gilded skull-goblet overflowing with glowing crimson (`#FF3B3B`) vitae.
  - `icon_relic_obsidian_signet.png` (*Abyssal Ward Signet*): Heavy obsidian signet ring set with a soulfire-cyan (`#00F0FF`) ward-stone.
  - `icon_relic_astral_eye.png` (*Eye of the Eclipsed Star*): Levitating sanctum-gold astrolabe talisman with a blazing violet-gold iris.
  - `icon_elixir_soul_harvest.png` (*Elixir of Soul Harvest*): Faceted emerald-gold alchemical phial swirling with captured soul motes.
  - `icon_elixir_void_ascendance.png` (*Draught of Abyssal Ascendance*): Winged sovereign crystal flask glowing with starlight cyan and sanctum gold.

### 17.2 Class-Specific Projectiles, Summons & Specialization VFX (`fx_*` Category — Pure Dark Fantasy Visuals)
- **Rook Witch-Hunter Ballistics & Ward Devices**:
  - `fx_rook_bolt.png` (4 orientations): Consecrated silver-and-bone crossbow bolt with a crisp `#FFC83D` sanctum-gold rune trail.
  - `fx_rook_rail_slug.png` (3 frames): Colossal solar-silver *Judgement Spear* projectile surrounded by spiral sanctum-gold shock-rings.
  - `fx_rook_trap.png` (3 frames): Jawed dark-iron wolf-snare & glowing consecrated ward-spire deployed on the ground.
- **Ines Ossuary Necromancy**:
  - `fx_ines_bone_orbit.png` (4 frames): Orbiting jagged bone-scythe shard wreathed in `#4FD6A0` verdigris soulfire.
  - `fx_ines_pull_sigil.png` (4 frames): Top-down necromantic ritual implosion circle (`Shion_Circle.png` ref) in `#4FD6A0` verdigris soulfire and `#D9D2C3` bone runes.
  - `fx_ines_monolith.png` (4 frames): Hurled *Ossuary Monolith* fused-skull boulder & spiked *Iron Maiden Sarcophagus* plates.
- **Kaelen Hellfire & Hoarfrost**:
  - `fx_kaelen_flame_jet.png` (4 frames): Roaring cone of `#FF5A26` and `#FFE478` dragonfire breath (`Coco.png` ref).
  - `fx_kaelen_lava_pool.png` (3 frames): Bubbling top-down molten brimstone crater pool (`Items/206880 - Weapons (Collabs).png` `MiComet` magma pool ref).
  - `fx_kaelen_cryo_shatter.png` (4 frames): Endothermic `#7CE8FF` hoarfrost glacier-crystal explosion.
- **Vespera Eldritch & Golem-Binding**:
  - `fx_vespera_pylon.png` (3 frames): Levitating gold-and-obsidian *Eldritch Obelisk* pulsing with `#C9F24B` volt-lime runes.
  - `fx_vespera_wisp_skull.png` (4 frames): Homing winged bone wisp-skull with volt-green eye trail.
  - `fx_vespera_automaton.png` (6 frames): *Ossuary Golem-Binder's* walking **Crowned Iron-and-Bone Gargoyle Colossus** construct (Idle 2, March 2, Titan Fist Slam 2).

---

## SECTION 18: DUSKHOLLOW TOWN 7 DARK FANTASY RPG BUILDINGS & FLOORS 2–5 BIOME TILES/PROPS

### 18.1 Duskhollow Town (Floor 0) Landmark Buildings (Rendered at High-Res ~1.2K Looking Like `160x120`-Style Pixel Structures with Baked `#0B0D10` Ground Shadow)
*(Reference: `Holo House/206123 - Furniture - Structure.png`, `206141 - NPCs.png`, `Levels/206852 - Stage 3 - Halloween Castle.png`)*
1. **`building_abyssal_gatehouse.png`**: Monolithic northern Gothic Cathedral Spire entrance gatehouse with twin soulfire braziers, carved gargoyle buttresses, and a swirling `#00F0FF` waystone portal arch.
2. **`building_runesmith_forge.png`**: Master Smith Vaelen's dark-stone medieval runesmithy with a roaring `#FF5A26` open dragon-hearth furnace, stone chimney smoke, soulfire anvil yard, and racks of broadswords and halberds.
3. **`building_alchemist_apothecary.png`**: Sister Isolde's bog-teal slate gothic apothecary with pointed stained-glass lancet windows, glass alembic distillation vessels, hanging dried herbs, and glowing `#2EE6A8` / `#FF3B3B` blood-vitae jars.
4. **`building_hunters_guild.png`**: Chronicler Malakor's gothic timber-and-stone guildhall hung with crimson inquisitor banners, mounted dragon skulls, and the candle-lit Bloodline Ledger board outside.
5. **`building_arcane_sanctum.png`**: Archmage Solen's gothic astronomical observatory tower with a revolving sanctum-gold armillary dome and floating `#00F0FF` grimoire pedestals.
6. **`building_ravens_rest_tavern.png`**: Maeve's warm medieval timber-and-stone inn with glowing `#FFC83D` leaded-glass hearth windows, wrought-iron hanging raven signboard, and oak ale casks.
7. **`building_mystic_enchanter.png`**: Vex's velvet-draped occult reliquary pavilion with floating violet spirit-lanterns (`#E879F9`) and 3 chained reliquary coffers on display.

### 18.2 Upper Spire Floors 2–5 Seamless Ground Tiles (3-Variant Seamless Tile Strips Rendered at High-Res ~1.2K Looking Like Three `16x16`-Style Tile Variants Each)
- **Floor 2 (The Frostbound Crypt — `#0D1822` / `#7CE8FF`)**:
  - `tile_f2_rime_vaults.png` (frost-cracked crypt flagstones), `tile_f2_glacial_viaduct.png` (translucent blue glacier-ice causeway), `tile_f2_frozen_charnel.png` (bone-embedded permafrost), `tile_f2_hoarfrost_citadel.png` (silver-inlaid deathknight sanctum marble).
- **Floor 3 (The Hellfire Abyss — `#1C0E0C` / `#FF5A26`)**:
  - `tile_f3_brimstone_caldera.png` (cracked obsidian crust with glowing magma veins), `tile_f3_iron_maiden_causeway.png` (blood-forged dark-iron grates), `tile_f3_cinder_pit.png` (smoldering volcanic ash & charnel coals), `tile_f3_throne_of_scars.png` (gilded demonic basalt).
- **Floor 4 (The Rotwood Mire — `#0E1D16` / `#C9F24B`)**:
  - `tile_f4_fungal_catacombs.png` (spore-encrusted flagstones), `tile_f4_bile_root_hollow.png` (knotted weeping roots & mire mud), `tile_f4_carrion_fen.png` (venom-green bog shallows & ribs), `tile_f4_heart_of_blight.png` (bioluminescent mycelium carpet).
- **Floor 5 (The Void Citadel — `#110C1D` / `#FFC83D` / `#9FA7FF`)**:
  - `tile_f5_starfall_cloister.png` (obsidian star-mosaic floor), `tile_f5_eclipsed_spire.png` (gilded astral marble), `tile_f5_choir_of_silence.png` (void-glass tiles with nebula depth), `tile_f5_sanctum_demiurge.png` (sovereign gold-inlaid celestial sanctuary flagstones).
