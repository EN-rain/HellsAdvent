# HELL'S ADVENT: ABYSSAL DESCENT — Reference-Guided GPT Image ("gpt2.5 image") Asset Generation Bible (`ASSETS_NEEDED.md`)

> **IMPORTANT COPYRIGHT & REFERENCE NOTICE (`DONOTCOMPLETELYCOPY`)**:
> All files inside `/tempartreference(DONOTCOMPLETELYCOPY)/` are extracted *HoloCure - Save the Fans!* sprite sheets and asset packs (`holocure-asset-sources.csv`, 105 asset packs / 752 PNGs). They must **NEVER** be copied directly into the game or traced 1:1 as VTuber characters.
> Instead, attach the specified reference file(s) from `/tempartreference(DONOTCOMPLETELYCOPY)/` alongside `/public/assets/aistudio/image_c95e226e.png` (Chibi Base Body) into **GPT Image (`gpt-image-1` / GPT-2.5 Image)** as **structural, dimensional, grid-spacing, and pixel-cluster references**, while replacing 100% of the subject matter, costume design, weaponry, and color palette with **Hell's Advent: Abyssal Descent**.

Drop raw generated images into `/assets-src/raw/<id>.png` on a flat `#FF00FF` magenta background and run:
```bash
node tools/process-assets.mjs
```

---

## Part 1: Complete Analysis of `tempartreference(DONOTCOMPLETELYCOPY)` (All 105 Packs / 752 Files)

Every folder and sprite sheet in `tempartreference(DONOTCOMPLETELYCOPY)` has been analyzed for pixel dimensions, grid layout, frame cadence, and structural utility against **Hell's Advent**:

### 1.1 Playable Character Folders (38 Character Packs across 11 Folders)
| Reference Directory / File | Contents Per Character Pack (12–20 Files Each) | Structural & Dimensional Analysis | Hell's Advent Mapping |
| :--- | :--- | :--- | :--- |
| **`Playable Characters - JP Gen 2/529969 - Nakiri Ayame/`** (`Ayame.png`, `_O1.png`, `_O2.png`, `_Port.png`, `Title_Ayame.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`, `_slash.png`, `_spiritslash.png`, `_spirit.png`, `_spiritfire.png`) | Base sprite strip (`384x128`, 6 cols × 2 rows of `64x64` cells: Row 1 = 4-frame Idle + 2 empty cells; Row 2 = 6-frame Run), 2 alternate outfit sheets, `62x50` close-up eye/bust portrait, `24x24`/`32x32` weapon & perk icons, multi-row crescent slash VFX (`720x231`). | **2-head-tall chibi proportions** (`~36–42px` tall sprite inside a `64x64` cell, feet anchored at `y=58`), oversized expressive anime eyes (`4x5px`), readable silhouette weapon held to the side/back. | **Primary Reference for `sena` (Sena Ibuki — Abyssal Blade Knight)**: *Duskrend* void-katana, *Shadow Lunge*, *Abyssal Rupture*, *Soulfire Ward Parry*, *Seven Seals of Eclipse*, Oathsworn (*Rift-Cleaver* / *Aegis Knight*) & Archon (*Abyssal Executioner* / *Immortal Bulwark*) promotion skins. |
| **`Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/`** (`Calli.png`, `_O1..O4.png`, `_portrait.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`, `_slash.png`, `_slash2.png`, `_death.png`, `_special0.png`) | `512x168` character strip (large weapon clearance cell grid), wide sweeping reaper-scythe slash arcs, skull/death mark VFX, dark gothic cloak silhouette. | Shows how oversized polearms/great-blades extend beyond the chibi torso without muddying the 2-head chibi body silhouette. | **Secondary Reference for `sena` (Reaper/Abyssal Executioner Mastery) & `flats_harvester` (Scythe Reaver Elite) & House of Malgorth Executioners**. |
| **`Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/`** (`Zeta.png`, `_O1.png`, `_Port.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`, `_pistol.png`, `_BigBullet.png`, `_Flash.png`, `_stealthhit.png`) + **`530068 - Kureiji Ollie/`** (`Ollie_chargerifle1.png`, `Ollie_chargerifle2.png`) + **`204785 - Amelia Watson.png`** (`916x2531`) | `384x128` chibi gunner sprite sheet, separate weapon sprite (`Zeta_pistol.png`, `Ollie_chargerifle1.png`), high-velocity piercing bullet VFX (`Zeta_BigBullet.png`), muzzle flash, crosshair/target markers. | Demonstrates compact ranged firearm/crossbow carriage on a 2-head chibi body + crisp ballistic projectile strips. | **Primary Reference for `rook` (Rook Matsuda — Inquisitor Marksman)**: *Hexbane Arbalest* / *Springgun*, *Rivet Spread*, *Kickback*, *Rapid Fire*, *Judgement Silver Spear* / *Anti-Materiel Rail Slug*. |
| **`Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/`** (`Ina.png`, `_O1..O4.png`, `_Portrait.png`, `_Attack.png`, `_wheel.png`, `_convert.png`, `_Weapon.png`, `_MaxedWeapon.png`, `_Perk1..3.png`, `_Special.png`) + **`Playable Characters - JP Gen 2/529968 - Murasaki Shion/`** (`Shion.png`, `Shion_Circle.png`, `Shion_portal.png`, `Shion_MagicPulse.png`, `Shion_beam.png`) + **`529785 - Tsukumo Sana/`** (orbiting planets) | Occult tome/scepter caster strips (`384x128`), orbiting ring/wheel projectiles (`Ina__wheel.png`), dark ground sigils (`Shion_Circle.png`, `Shion_portal.png`), void tentacle/shard attacks (`Ina_Attack.png`). | Shows how orbiting projectiles (`Scrap Orbit` / `Bone-Shard Orbit`) and ground pull/implosion circles read cleanly around a `64x64` chibi caster. | **Primary Reference for `ines` (Ines Calloway — Ossuary Necromancer / Industrial Magnetist)**: *Gravelord Scepter & Bone Reliquary*, *Pull*, *Spin Up*, *Lump*, *Catacomb Bone-Tempest* / *Scrapfall*. |
| **`Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png`** (`1679x4130` master sheet) + **`Playable Characters - Force (JP Gen 4)/530030 - Kiryu Coco/`** (`Coco.png`, dragon fire) + **`Playable Characters - Fantasy (JP Gen 3)/530011 - Shirogane Noel/`** (`Noel.png`, heavy knight plate) + **`530072 - Kaela Kovalskia/`** (`Kaela_Anvil.png`, `Kaela_hammer.png`, `Kaela_RarestMetal.png`) | Complete master sheet with 4 outfits, wide fiery crescent sweeps (`Phoenix Sword` & `Awakened`), 36-frame giant firebird/drake transformation sequence, and 13-frame pillar explosion strip; plus heavy knight armor & forge hammers. | Masterclass reference for multi-frame fire sweeps, molten explosion pillars, and transformation ultimates. | **Primary Reference for `kaelen` (Kaelen Vos — Hellfire Dragoon / Thermo-Lancer)**: *Cinderlance & Brimstone Heart*, *Naphtha Jet*, *Caustic Mortar*, *Vent Supernova*, *Avatar of the Hell-Drake*, plus **Master Smith Vaelen**. |
| **`Playable Characters - JP Gen 0/529818 - Roboco-san/`** (`Roboco.png`, `_battery.png`, `_chargedshot.png`, `_electric.png`, `_hispec.png`, `_shock.png`) + **`Playable Characters - Council (EN Gen 2)/529784 - Ouro Kronii/`** (`Kronii.png`, clock/halo blades) + **`529782 - IRyS/`** + **`530058 - Moona Hoshinova/`** | Autonomous floating tech/familiar attachments, electric shock arcs (`Roboco_electric.png`, `Roboco_shock.png`), floating halo/orbital rings, laser beams. | Ideal pixel density and frame cycling for hovering micro-drones/familiar skulls, deployed pylons, and chain lightning arcs. | **Primary Reference for `vespera` (Vespera Locke — Eldritch Soulbinder / Arc-Drone Artificer)**: *Astral Grimoire & Halo Familiars*, *Tesla Pylon*, *Seeker Swarm*, *Phase Blink*, *Choir of Twelve Seraphim*. |
| **Remaining Playable Character Packs** (`263895 - Gawr Gura.png`, `204786 - Hakos Baelz.png`, `529781 - Ceres Fauna`, `529783 - Nanashi Mumei`, `529804 - Inugami Korone`, `529805 - Nekomata Okayu`, `529806 - Ookami Mio`, `529807 - Shirakami Fubuki`, `529816 - AZKi`, `529817 - Hoshimachi Suisei`, `529819 - Sakura Miko`, `529820 - Tokino Sora`, `529822 - Aki Rosenthal`, `529823 - Haachama`, `529824 - Natsuiro Matsuri`, `529825 - Yozora Mel`, `529967 - Minato Aqua`, `529970 - Oozora Subaru`, `529971 - Yuzuki Choco`, `530009 - Houshou Marine`, `530010 - Shiranui Flare`, `530012 - Usada Pekora`, `530026 - Amane Kanata`, `530028 - Himemori Luna`, `530032 - Tokoyami Towa`, `530035 - Tsunomaki Watame`, `530056 - Airani Iofifteen`, `530057 - Ayunda Risu`, `530067 - Anya Melfissa`, `530069 - Pavolia Reine`, `530073 - Kobo Kanaeru`) | Diverse weapon types (axes, halberds, daggers, twin blades, staves, syringes, anchors, bows, familiars), status icons, and elemental VFX (falling blocks, spider webs, bats, demon horns, needles, wind slashes, rainclouds). | Provides 500+ specialized reference sprites for secondary Specialization skills (e.g., *Suisei_axswing.png* for heavy cleaves, *Anya_keris.png* for *Shadow Pin* phase-knives, *Choco_Needle.png* / *Choco_Supplies.png* for Apothecary items, *Mel_bat.png* for *Crypt Bat*, *Haachama_Spider.png* for *Ossuary Skitter*). | **Used across all 15 Specializations, Status Effects, Town NPCs, and Common Enemies**. |

### 1.2 Enemies & Bosses Folders (10 Enemy Sheets + 11 Boss Sheets)
| Reference File (`tempartreference(DONOTCOMPLETELYCOPY)/...`) | Dimensions | Visual & Structural Breakdown | Hell's Advent Mapping |
| :--- | :--- | :--- | :--- |
| **`Enemies/206132 - Myth Enemies (EN Gen1).png`** | `802x704` | Grid of 3-frame walk cycles for Chumbud (small bipedal lizard/rat silhouette), Dead Beat (skeleton warrior with club, red skeleton with iron riot shield, hooded reaper skeleton), Investigater (snouted hound/gator silhouette), Takodachi (small blob/leech), KFP (small winged bird). | **Primary Reference for Common Enemies (`40x40`) & Shielded Elites**: Dead Beat -> `tin_rat` (*Risen Thrall*), Shielded Dead Beat -> `plate_marshal` (*Dread Templar*), Investigater -> `dust_dog` (*Grave Hound*), Takodachi -> `lye_leech` (*Blight Leech*), KFP -> `cinder_crow` (*Carrion Crow*). |
| **`Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png`** | `1014x450` | Sanallites, Saplings, Hoomans (hooded cultists with daggers/torches), Kronies (clock-headed construct), Bae Rats, Irystocrats. | **Reference for Cultist/Chanter Elites & Swarmers**: Hoomans/Kronies -> `sump_cantor` (*Hex Chanter*), `lye_strider` (*Blight Stalker*), Bae Rats -> `tin_rat` (*Tin Rat*). |
| **`Enemies/206134 - Gamers Enemies (JP).png`** | `676x344` | Sukonbu, Koronesuki, Miofa (wolf-pack runners), Onigirya. | **Reference for `dust_dog` (*Grave Hound*) & `bonepack_alpha` (*10x Hound Fusion*)**. |
| **`Enemies/206135 - Enemies (JP Gen0).png`** (`610x342`), **`206136 - Enemies (JP Gen1).png`** (`878x318`), **`206137 - Enemies (JP Gen2).png`** (`676x408`), **`206138 - Area 15 (ID Gen1).png`** (`408x408`), **`206139 - Holoro (ID Gen2).png`** (`408x342`), **`206140 - HoloH3RO (ID Gen3).png`** (`610x448`) | `408x342` to `878x318` | Compact 3-frame enemy strips showing clear silhouette differentiation across small flyers, armored walkers, floating wisps, and mimic props. | **Reference for `wire_kite` (*Gargoyle Imp*), `sump_bat` (*Crypt Bat*), `rivet_tick` (*Ossuary Skitter*), `signal_mite` (*Cursed Wisp*), `silt_mimic` (*Cursed Mimic*)**. |
| **`Enemies/206549 - Enemies (Miscellaneous).png`** | `276x836` | Larger heavy enemies, elite bruisers, and special hazard mobs. | **Reference for Elite Enemies (`80x80`): `cleaver_hauler` (*Executioner Brute*), `switchback_driver` (*Hell-Steed Outrider*), `bore_sentinel` (*Crypt Wyrmling*)**. |
| **`Bosses/206494 - Stage 1 Boss (Smol Ame).png`** (`518x1742`) & **`206496 - Stage 1 Hard Boss (Halloween Bae).png`** (`400x1128`) | `518x1742` / `400x1128` | Full boss animation sheets broken into labeled rows: Walk (4–8 frames), Jump/Slam/Backflip (16–24 frames), Telegraph windups, and Hurt/Defeat states. | **Reference for Boss Animation Phasing & Telegraph Pose Structure**. |
| **`Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`** (`476x1151`), **`206497 - Stage 2 Mini Boss (Mikodanye).png`** (`536x1232`), **`206501 - Stage 3 Mini Boss (Shubangelion).png`** (`528x930`) | `~500x1100` | Towering mech/kaiju/colossus bosses with beam breath, heavy stomp, and articulated limbs. | **Primary Structural Reference for `the_foreman.png` (*High Executioner Malgorth / The Foreman*) & `the_long_dry.png` (*Catacomb Wyrm Skarath*)**. |
| **`Bosses/206500 - Stage 3 Boss (Hachama).png`** (`648x714`), **`206502 - Stage 3 Hard Boss (Myth or Treat).png`** (`788x1468`), **`206504 - Stage 4 Boss (Area 15).png`** (`402x780`), **`206503 - Stage 4 Mini Boss (Udin).png`** (`404x302`), **`206498 - Stage 2 Boss (A-Chan).png`** (`295x222`), **`206499 - Stage 2 Hard Boss (Nodoka).png`** (`274x212`) | Various | Multi-entity boss formations, monstrous eldritch forms, and hovering commanders. | **Primary Structural Reference for `mother_sump.png` (*Bog-Matriarch Hagra*), `big_axle.png` (*Dread Charioteer Varkos*), and the 9 Fusion Mid-Bosses**. |

### 1.3 Items, Weapons, Levels, Holo House, Shop & Miscellaneous UI Folders
| Reference File (`tempartreference(DONOTCOMPLETELYCOPY)/...`) | Dimensions | Visual & Structural Breakdown | Hell's Advent Mapping |
| :--- | :--- | :--- | :--- |
| **`Items/206883 - Item Icons.png`** | `444x430` | Complete `24x24` / `32x32` icon atlas on dark framed squares: Weapons, Collab Weapons, Super Collab Weapons (golden/sparkling border), Items, Super Items, Effect Icons, Other (Heart, Sword, Winged Boot, Crosshair, Crit Target, Clock). | **Primary Reference for ALL `icon_skill_*.png` & `icon_item_*.png` (`32x32`)**: Shows exact icon padding (2px border, dark slate interior `#161A20`, diagonal 45-degree weapon/item tilt, high-contrast 1px inner highlight). |
| **`Items/206879 - Weapons.png`** (`856x3634`), **`206880 - Weapons (Collabs).png`** (`788x4790`), **`206881 - Weapons (Super Collabs).png`** (`365x366`) | `856x3634` / `788x4790` | Massive VFX sprite sheets for projectiles, spinning axes, orbital books/blades, laser beams, magma pools, spider webs, lightning chains, and shockwaves. | **Primary Reference for `fx_*.png` Skill Effect Strips, Projectiles (`rail_spike.png`), & Class Specialization VFX**. |
| **`Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png`** | `1772x2049` | Dark gothic stone floor tiles (grey & blood-stained), red carpet, crumbled stone rubble, broken pillars, spilled dark red puddles (`Berry Juice`), gothic arches/walls, barrels, iron gates, candelabras, radial lamp glow, blood-moon night sky. | **Primary Reference for Duskhollow Town & Floor 1 (*The Blighted Catacombs*) Tiles (`tile_*.png`) & Props (`prop_*.png`)**. |
| **`Levels/206142 - Stage 1 - Grassy Plains.png`** (`1292x2008`), **`206841 - Stage 1 Hard (Night).png`** (`1290x1609`), **`206842 - Stage 2 - Holo Office.png`** (`1597x1234`), **`206843 - Stage 2 Hard (Evening).png`** (`1597x1234`), **`206851 - Time Stage 1 - Concert Stage.png`** (`1333x1732`), **`206853 - Stage 4 - Gelora Bung Yagoo.png`** (`2816x3003`) | `1290x1609` to `2816x3003` | Modular 3/4 top-down fences, barriers, vending machines, benches, street props, cracked tiles, and environmental obstacles with baked elliptical shadows. | **Reference for Floor 2 (*Frostbound Crypt*), Floor 3 (*Hellfire Abyss*), Floor 4 (*Rotwood Mire*), Floor 5 (*Void Citadel*), and Industrial Wasteland Relic Props**. |
| **`Holo House/206115..206127` & `206141 - NPCs.png`** | `205x437` to `912x1796` | `206116 - Cooking.png` (cauldrons, stews, fish, meats), `206121 - Interior.png`, `206123 - Structure.png`, `206141 - NPCs.png` (merchant stall, notice board, NPC idle frames, speech bubbles). | **Reference for Duskhollow Town 6 RPG Buildings, Tavern Meals (`TAVERN_MEALS`), and Town/Sanctuary NPCs (`ume.png`, Malakor's Blood Ledger Board, Maeve's Tavern)**. |
| **`Shop/206130 - Character Gacha.png`** (`2584x3128`) & **`206131 - Shop Menu.png`** (`2584x4144`) | `2584x3128` / `2584x4144` | Animated shopkeeper counter frames, upgrade tier pips, gacha/curio chest unsealing beams, and shop UI frames. | **Reference for Vex's Mystic Curio Unsealing UI, Vaelen's Runesmith Forge UI, and `ume.png` shopkeeper animations**. |
| **`Miscellaneous/206506 - Effects.png`** (`658x4079`), **`206508 - Pickups.png`** (`328x749`), **`206509 - EXP.png`** (`398x950`), **`206962 - Holozon Box.png`** (`1408x1939`), **`206964 - Title.png`** (`1248x799`), **`206965 - Game Menus and HUDs.png`** (`1322x5017`), **`206128 - Fandom Ranks.png`**, **`206129 - Achievements.png`**, **`206143 - Yagoo Statue.png`** | Various | Complete HUD bars (`HP Bar`, `Exp Bar`), 9-slice dialogue/inventory boxes, warning telegraphs, explosion rings, ground cracks, anime speed-line cut-ins (`Anime Zoom`), spinning coins (`Holocoins`), anvil upgrades, and treasure chest animations (`Holozon Box`). | **Primary Reference for `ui_*.png`, `fx_hit_cross.png`, `fx_shock_ring.png`, `fx_ground_cracks.png`, `fx_dust_puff.png`, `ultimate_cutin.png`, `title_logo.png`, `title_key_art.png`**. |

---

## Part 2: Master GPT Image ("gpt2.5 image") Reference-Guided Prompting Protocol

When generating assets in **GPT Image (`gpt-image-1` / GPT-2.5 Image)**, always attach:
1. **The Structural Reference Image** from `tempartreference(DONOTCOMPLETELYCOPY)/...` listed in the asset's **Reference File(s)** field below.
2. **(For Characters/NPCs)** Also attach `/public/assets/aistudio/image_c95e226e.png` (Chibi Base Body) and `/public/assets/characters/sheet_combined_272x208_4x.png` (Approved Chibi Style Target).

### Step 0A: Global Style Lock (Prefixed to Every Prompt)
> `16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art (HoloCure / Darkest Dungeon / Castlevania / Bloodborne chibi pixel aesthetic), hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure #000000 black; use #0B0D10 soot), 16-color limited palette per sprite drawn from the Hell's Advent 48-color master palette (soot #0B0D10, slag #3A3F47, rust/crimson #8B3A1E, bog/verdigris #1F4D4A, bone #D9D2C3, signal cyan #00F0FF, blood #FF3B3B, brass gold #FFC83D, ember #FF5A26, volt #C9F24B, frost #7CE8FF), hue-shifted cel-pixel shading, light from top-left, crisp hard nearest-neighbor pixel edges, zero anti-aliasing, zero soft gradients, zero motion blur, zero bloom, no text, no watermark, no UI border frame unless specified, flat solid #FF00FF magenta background, subject centered in each grid cell with 2px safety margin, 3/4 top-down orthographic RPG camera view.`

### Step 0B: Global Reference-Guided Transformation Rule (Included in Every Prompt)
> `REFERENCE-GUIDED INSTRUCTION: Use the attached reference image ONLY for exact pixel grid cell spacing, sprite scale, chibi head-to-body ratio (~2 heads tall, large expressive eyes, compact limbs), animation pose keyframes, and silhouette readability. DO NOT copy the reference character's VTuber identity, modern idol clothes, or pastel colors—completely transform the subject into the dark gothic/industrial fantasy design of Hell's Advent described below.`

### Step 0C: Global Negative Prompt
> `avoid: copying VTuber character designs or hololive logos, smooth digital painting, vector art, 3D render, bilinear blur, anti-aliased edges, soft airbrush glow, lens flare, semi-transparent alpha fringes against the #FF00FF background, realistic 8-head human proportions, generic cheerful high-fantasy, mismatched frame sizes, cropped weapon tips, text, watermarks, signatures.`

---

## Part 3: Complete Asset Catalog & GPT Image Prompts (`process-assets.mjs` Manifest + Full Expansion Roster)

Every asset below includes its exact **Manifest ID** (for `/assets-src/raw/<id>.png`), **Frame Size & Strip Layout**, **Exact Reference File(s) in `tempartreference(DONOTCOMPLETELYCOPY)`**, **What to Keep vs. Transform**, and a **Copy-Pasteable Full GPT Image Prompt**.

---

## SECTION 1: PLAYABLE CHARACTERS — SENA IBUKI & THE 5 ASCENDANT CLASSES

### `sena_turnaround.png`
- **Category**: `player` (Sena Ibuki — Abyssal Blade Knight / Spatial Blade Executioner)
- **Frame Size**: `64x64` (4 frame(s), horizontal strip `256x64`, 2 fps, feet anchor `[32, 60]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
  - `public/assets/aistudio/image_c95e226e.png` (Chibi Base Proportions)
  - `public/assets/characters/sheet_combined_272x208_4x.png`
- **Reference Analysis (Keep vs. Transform)**:
  - **Keep**: Exact chibi 2-head-tall body proportions from `Ayame.png` and `image_c95e226e.png`, crisp `64x64` frame cells, feet aligned on `y=58`, katana held diagonally at the side with clear silhouette separation.
  - **Transform**: Replace Ayame's white hair and red shrine kimono with **Sena Ibuki**: short uneven rust-crimson hair (`#8B3A1E` / `#D16B38`) with one longer left strand pinned by a silver bone-clasp, cracked brass welding/inquisitor goggles (`#FFC83D`) pushed up on her forehead, weathered soot-blackabyssal trench coat (`#1A2228`) with a frayed hem and a rust shoulder plate, left forearm wrapped in ash-grey bandages, right forearm wearing a brass ward-cuff, long bone-white scarf (`#D9D2C3`) with a crimson stencil stripe near the tail, wielding **Duskrend / The Railcut** (a cursed soulfire-forged rail-katana with a cloth-wrapped hilt and a razor edge glowing signal cyan `#00F0FF`).
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, hand-pixelled look, clean 1px dark outlines in a darker shade of each material (never pure #000000 black; use #0B0D10 soot), 16-color limited palette per sprite, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, no gradients, no blur, no glow, no text, no watermark, no frame, flat solid #FF00FF magenta background, subject centered with margin, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the exact 2-head-tall chibi pixel anatomy, pixel density, and cell framing of attached reference `Ayame.png` and `image_c95e226e.png` without copying the VTuber character. Generate a 4-frame horizontal character turnaround sprite strip (256x64px total, four 64x64px cells: Frame 1 Front/Down view, Frame 2 Back/Up view, Frame 3 Left Side view, Frame 4 Right Side view) of Sena Ibuki, Abyssal Blade Knight: young woman warrior, short uneven rust-red hair (#8B3A1E, #D16B38) with one longer left strand held by a bone clasp, cracked brass goggles (#FFC83D) pushed up on her forehead, soot-black patched abyssal coat (#1A2228) with a frayed hem and rust shoulder pauldron, left sleeve torn at the elbow with ash-grey bandaged forearm, right forearm with a brass cuff, long bone-colored scarf (#D9D2C3) with one crimson stripe near the tail, holding Duskrend (a heavy dark-iron rail-katana with cloth-wrapped hilt and a 1px signal-cyan #00F0FF glowing cutting edge), worn dark leather boots anchored at y=58, determined anime eyes. avoid: smooth shading, vector look, 3D render, painterly, soft glow, lens flare, copying VTuber costume, extra limbs, text, logo, photograph.
  ```

### `sena_idle_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 4 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 1, Frames 1–2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use Row 1 (Idle frames) of attached `Ayame.png` for exact chibi scale and 1px vertical breathing bob, and `sena_turnaround.png` for character identity. Generate a 2-frame horizontal sprite strip (128x64px total, two 64x64px cells) of Sena Ibuki in front/down-facing combat idle stance: Frame 1 neutral ready stance holding Duskrend rail-katana with signal-cyan (#00F0FF) edge at her right side; Frame 2 torso and bone scarf bobbing 1px down with subtle coat hem shift, feet planted at y=58. avoid: smooth shading, vector look, 3D render, blur, glow, text, watermark.
  ```

### `sena_run_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (6 frame(s), strip `384x64`, 12 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 2, Frames 1–6)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the exact 6-frame chibi run cycle rhythm and leg/hair bounce of Row 2 in attached `Ayame.png`. Generate a 6-frame horizontal sprite strip (384x64px total, six 64x64px cells) of Sena Ibuki in a front/down-facing 6-frame run cycle: alternating boot strides, bone-white scarf trailing upward, frayed black coat hem flaring, Duskrend rail-katana held low at her side with a crisp signal-cyan (#00F0FF) edge. avoid: smooth shading, vector look, 3D render, blur, glow, text, watermark.
  ```

### `sena_attack1_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_slash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the chibi proportions of `Ayame.png` and the crisp pixel crescent arc of `Ayame_slash.png`. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Down-View Attack Combo Hit 1 (horizontal forehand slash): Frame 1 windup drawing Duskrend back to her right shoulder; Frame 2 forward lunge with wide horizontal bone-white and signal-cyan (#00F0FF) pixel slash smear across the lower arc; Frame 3 follow-through recovery pose. avoid: smooth shading, motion blur, soft glow, 3D render, text.
  ```

### `sena_attack2_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_spiritslash.png` reverse slash arc. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Down-View Attack Combo Hit 2 (reverse upward backhand slash): Frame 1 coiled backhand anticipation; Frame 2 sweeping reverse crescent smear in bone-white (#EFE9DA) and signal-cyan (#00F0FF); Frame 3 blade-high recovery stance. avoid: smooth shading, motion blur, soft glow, 3D render, text.
  ```

### `sena_attack3_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 12 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 0/529817 - Hoshimachi Suisei/Suisei_axswing.png` + `Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use `Ayame.png` for chibi scale and `Suisei_axswing.png` for heavy overhead cleave arc weight. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Down-View Attack Combo Hit 3 (two-handed overhead Duskrend finisher cleave): Frame 1 raising Duskrend high overhead with both hands; Frame 2 slamming the blade straight down with a massive vertical signal-cyan (#00F0FF) and bone-white rift arc; Frame 3 grounded cleave recovery. avoid: smooth shading, motion blur, soft glow, 3D render, text.
  ```

### `sena_hurt_down.png`
- **Category**: `player`
- **Frame Size**: `64x64` (1 frame(s), strip `64x64`, 8 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions. Generate a single 64x64px frame of Sena Ibuki in a down-facing hurt recoil pose: wincing expression, head and shoulders knocked backward 2px, bone scarf flaring upward, Duskrend held defensively across her chest. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_idle_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 4 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` 2-head chibi scale and idle rhythm, viewed from behind (up-facing). Generate a 2-frame horizontal sprite strip (128x64px total, two 64x64px cells) of Sena Ibuki in an up-facing (back view) idle breathing stance: showing the back of her uneven rust-red hair, the bone-white scarf tail with its rust stencil stripe hanging over her back, the square rust patch on the back-left shoulder of her black coat, and Duskrend's signal-cyan edge held to her right. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_run_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (6 frame(s), strip `384x64`, 12 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match Row 2 run cycle cadence of `Ayame.png`, turned to up-facing (back view). Generate a 6-frame horizontal sprite strip (384x64px total, six 64x64px cells) of Sena Ibuki running upward (back view): 6-frame footwork cycle, bone scarf and frayed black coat hem streaming behind her toward the camera, rust shoulder patch visible, Duskrend blade carried at her right side. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack1_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_slash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_slash.png` arc. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Up-View (back view) Attack Combo Hit 1: Frame 1 windup; Frame 2 sweeping horizontal forehand slash above her head with a bone-white and signal-cyan (#00F0FF) crescent smear; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack2_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi scale and `Ayame_spiritslash.png` reverse arc. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Up-View (back view) Attack Combo Hit 2 (reverse backhand slash): Frame 1 anticipation; Frame 2 reverse upward crescent smear in signal-cyan (#00F0FF) and bone-white; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack3_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 12 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 0/529817 - Hoshimachi Suisei/Suisei_axswing.png` + `Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Suisei_axswing.png` heavy cleave. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Up-View (back view) Attack Combo Hit 3 (two-handed overhead cleave): Frame 1 high windup; Frame 2 heavy forward-upward slam with wide signal-cyan (#00F0FF) rift arc; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_hurt_up.png`
- **Category**: `player`
- **Frame Size**: `64x64` (1 frame(s), strip `64x64`, 8 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions. Generate a single 64x64px frame of Sena Ibuki in an up-facing (back view) hurt recoil pose, shoulders jolted, bone scarf and rust hair flaring outward. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_idle_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 4 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 1, Frames 1–2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match exact side-facing 3/4 chibi stance of `Ayame.png` Row 1. Generate a 2-frame horizontal sprite strip (128x64px total, two 64x64px cells) of Sena Ibuki in right-facing side profile idle breathing pose: 1px vertical breathing bob, bone scarf trailing left, brass goggles on forehead, holding Duskrend with signal-cyan (#00F0FF) edge ready. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_run_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (6 frame(s), strip `384x64`, 12 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` (Row 2, Frames 1–6)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Directly match the 6-frame forward-leaning chibi run cycle pose progression of Row 2 in `Ayame.png`. Generate a 6-frame horizontal sprite strip (384x64px total, six 64x64px cells) of Sena Ibuki running right in side profile: torso leaning slightly forward, bone scarf with rust stripe streaming horizontally behind her, black coat hem flaring, Duskrend held back in a poised sprint grip. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack1_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_slash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_slash.png` forward crescent smear. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Right-Side-View Attack Combo Hit 1 (horizontal forehand slash): Frame 1 blade drawn back; Frame 2 forward step with bright bone-white core and signal-cyan (#00F0FF) crescent slash smear to the right; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack2_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 14 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions and `Ayame_spiritslash.png` upward arc. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Right-Side-View Attack Combo Hit 2 (reverse upward backhand slash): Frame 1 low coiled windup; Frame 2 upward rising signal-cyan (#00F0FF) and bone-white slash smear to the right; Frame 3 high-guard recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_attack3_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (3 frame(s), strip `192x64`, 12 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli_slash.png` + `Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi scale and `Calli_slash.png` wide heavy cleave smear. Generate a 3-frame horizontal sprite strip (192x64px total, three 64x64px cells) of Sena Ibuki performing Right-Side-View Attack Combo Hit 3 (two-handed overhead Duskrend cleave): Frame 1 high overhead windup; Frame 2 full-body forward lunge slamming Duskrend down with a massive 180-degree signal-cyan (#00F0FF) and bone-white crescent arc; Frame 3 recovery. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_hurt_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (1 frame(s), strip `64x64`, 8 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi scale. Generate a single 64x64px frame of Sena Ibuki in right-facing side profile hurt recoil pose: leaning backward from impact, grit teeth, bone scarf and coat hem whipped forward. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_dodge_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (4 frame(s), strip `256x64`, 16 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529968 - Murasaki Shion/Shion_Jump.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Fan Dash` section)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use `Shion_Jump.png` and `Fan Dash` in `206506 - Effects.png` for tucked evasive dash motion. Generate a 4-frame horizontal sprite strip (256x64px total, four 64x64px cells) of Sena Ibuki performing a right-facing evasive shadow-step dodge roll: Frame 1 low crouch push-off; Frame 2 tucked airborne roll with bone scarf and signal-cyan (#00F0FF) afterimage streak; Frame 3 low tuck rotation; Frame 4 sliding recovery on one knee with Duskrend braced. avoid: smooth shading, blur, glow, 3D render, text.
  ```

### `sena_death_side.png`
- **Category**: `player`
- **Frame Size**: `64x64` (4 frame(s), strip `256x64`, 6 fps, anchor `[32, 60]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png` + `Holo House/206141 - NPCs.png` (fallen Nousagi pose)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match `Ayame.png` chibi proportions. Generate a 4-frame horizontal sprite strip (256x64px total, four 64x64px cells) of Sena Ibuki's defeat animation in side profile: Frame 1 staggering backward; Frame 2 dropping to her knees; Frame 3 planting Duskrend vertically into the ground to brace herself; Frame 4 slumped forward on one knee holding the planted hilt of Duskrend, bone scarf resting on the ground. avoid: smooth shading, blur, glow, 3D render, text, gore.
  ```

---

### COMPANION PLAYABLE CLASS SPRITE SHEETS (HoloCure 6×2 Grid Format `384x128` for All 5 Classes)
*(Drop into `/assets-src/raw/<class_id>_sheet.png` or individual directional strips)*

#### `rook_sheet.png` (Rook Matsuda — Inquisitor Marksman / Road Courier Ballistics)
- **Frame Size**: `64x64` cells in a `384x128` sheet (Row 1: 4 Idle frames; Row 2: 6 Run frames)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/204785 - Amelia Watson.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use attached `Zeta.png` (384x128px, Row 1 = 4-frame Idle, Row 2 = 6-frame Run) and `image_c95e226e.png` for exact 2-head chibi anatomy and cell placement. Transform completely into Rook Matsuda, Inquisitor Marksman: sharp-eyed witch-hunter marksman wearing a weathered slate-black inquisitor duster coat (#1A2228) with brass buckles (#FFC83D), a tilted wide-brimmed dark leather highwayman/inquisitor hat with a brass monocle lens over his right eye, bandolier of silver rail-bolts across his chest, holding the Hexbane Arbalest / Springgun (a heavy dark-iron repeating crossbow with a curved brass leaf-spring bow and glowing brass-gold #FFC83D bolt loaded). avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

#### `ines_sheet.png` (Ines Calloway — Ossuary Necromancer / Industrial Magnetist)
- **Frame Size**: `64x64` cells in a `384x128` sheet (Row 1: 4 Idle frames; Row 2: 6 Run frames)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/Ina.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529968 - Murasaki Shion/Shion.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the exact 384x128px grid (Row 1: 4 Idle frames, Row 2: 6 Run frames) and 2-head chibi proportions of attached `Ina.png` and `Shion.png`. Transform completely into Ines Calloway, Ossuary Necromancer & Magnetist: pale gothic-industrial mystic with bone-white braided hair (#D9D2C3) streaked with verdigris teal (#4FD6A0), dark hooded catacomb mantle over an iron-ribbed corset, dorsal bone-and-copper reliquary coil strapped to her back humming with emerald-verdigris (#4FD6A0) soulfire, wielding the Gravelord Scepter & horseshoe-magnet gauntlets with 3 tiny bone/iron shards orbiting her waist. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

#### `kaelen_sheet.png` (Kaelen Vos — Hellfire Dragoon / Thermo-Lancer)
- **Frame Size**: `64x64` cells in a `384x128` sheet (Row 1: 4 Idle frames; Row 2: 6 Run frames)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png` (Default Outfit Idle/Run)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Fantasy (JP Gen 3)/530011 - Shirogane Noel/Noel.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the 384x128px grid (Row 1: 4 Idle frames, Row 2: 6 Run frames) and armoured chibi proportions of `Noel.png` and `204696 - Takanashi Kiara.png`. Transform completely into Kaelen Vos, Hellfire Dragoon: demon-forged heavy lancer in dark obsidian-and-slag dragonplate (#2A353D) with horned crest helm pushed back to show spiky ash-blond hair and fierce ember-orange (#FF5A26) eyes, twin brass pressure-boiler exhaust stacks on his back venting tiny ember sparks, wielding the Cinderlance (a massive serrated obsidian greatlance with a molten ember-orange #FF5A26 core and brass furnace guard). avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

#### `vespera_sheet.png` (Vespera Locke — Eldritch Soulbinder / Signal Artificer)
- **Frame Size**: `64x64` cells in a `384x128` sheet (Row 1: 4 Idle frames; Row 2: 6 Run frames)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 0/529818 - Roboco-san/Roboco.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Council (EN Gen 2)/529784 - Ouro Kronii/Kronii.png`
  - `public/assets/aistudio/image_c95e226e.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the 384x128px grid (Row 1: 4 Idle frames, Row 2: 6 Run frames) and hovering halo/familiar layout of `Kronii.png` and `Roboco.png`. Transform completely into Vespera Locke, Eldritch Soulbinder: occult coven weaver with long dark-violet/soot hair, glowing volt-green (#C9F24B) and holo-cyan (#38F8E2) eyes behind an astral visor, high-collared midnight sanctum cloak with copper coil trim, a levitating starforged brass halo ring behind her shoulders, an open levitating Astral Grimoire in front of her hand, and 3 tiny hovering Familiar Skulls with volt-green (#C9F24B) eye-lights orbiting her. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

---

## SECTION 2: CHARACTER PORTRAITS (`96x96`)

### `sena_neutral.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli_portrait.png`
  - `public/assets/characters/sheet_combined_272x208_4x.png` (Top row framed bust portraits)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the crisp pixel-art anime bust portrait framing, eye highlight cluster detail, and shading style of attached `sheet_combined_272x208_4x.png` (top portraits) and `Ayame_Port.png`. Generate a 96x96px anime bust portrait of Sena Ibuki, Abyssal Blade Knight, with a calm, stoic neutral expression: short uneven rust-red hair (#8B3A1E, #D16B38) with longer left strand held by a bone clasp, cracked brass goggles (#FFC83D) pushed up on her forehead, bone-white scarf (#D9D2C3) with crimson stencil stripe wrapped around her neck, black patched coat shoulders, and the hilt of Duskrend with a faint signal-cyan (#00F0FF) edge peeking behind her right shoulder. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `sena_hurt.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` + `public/assets/characters/sheet_combined_272x208_4x.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Keep exact costume, palette, and framing of `sena_neutral.png` and `Ayame_Port.png`. Generate a 96x96px anime bust portrait of Sena Ibuki with a battle-damaged hurt expression: one eye wincing shut, grit teeth, a small ash-and-blood smudge on her cheek, furrowed brows, same rust-red hair, brass forehead goggles, bone scarf, and Duskrend hilt. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `sena_determined.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` + `public/assets/characters/sheet_combined_272x208_4x.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Keep exact costume, palette, and framing of `sena_neutral.png` and `Ayame_Port.png`. Generate a 96x96px anime bust portrait of Sena Ibuki with a fierce, focused combat expression: sharp angled eyebrows, intense locked-on gaze, slight confident battle smirk, bone scarf billowing slightly, Duskrend hilt glinting signal-cyan (#00F0FF) behind her shoulder. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `sena_ultimate.png`
- **Category**: `portrait`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` + `Playable Characters - JP Gen 1/529823 - Haachama (Akai Haato)/Haachama_Portrait.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Keep exact costume and framing of `sena_neutral.png` and `Ayame_Port.png`. Generate a 96x96px anime bust portrait of Sena Ibuki unleashing her Ultimate (Seven Seals of Eclipse): her irises blazing bright signal-cyan (#00F0FF) with crisp pixel energy wisps rising from her eyes, rust-red hair and bone scarf swept upward by spatial pressure, dramatic high-contrast rim-light in #B8FBFF on her jawline and Duskrend blade. avoid: smooth airbrush glow, vector look, 3D render, blur, text.
  ```

---

## SECTION 3: COMMON ENEMIES (`40x40` 5-Frame Strips — Move 2, Attack 1, Hurt 1, Dead 1)

### `tin_rat.png` (Risen Thrall / Tin Rat — Floor 1 Ossuary Nave)
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), horizontal strip `200x40`, 8 fps, feet anchor `[20, 36]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (`Chumbud` & `Dead Beat` 3-frame grid cells) + `Playable Characters - Council (EN Gen 2)/204786 - Hakos Baelz.png` (rat minion)
- **Reference Analysis (Keep vs. Transform)**:
  - **Keep**: Compact `~28x28px` monster silhouette inside a `40x40` cell, distinct 2-frame scurry stride, clear attack lunge frame, recoil frame, and collapsed rubble death frame.
  - **Transform**: Combine the skeletal/cursed undead silhouette of `Dead Beat` with the low-slung scurry of `Chumbud`: a hunched skeletal plague-rat / risen crypt-thrall with a rusted iron torture-cask / soup-can shell riveted over its spine, hinged lid flapping, glowing blood-red (`#FF3B3B`) pinprick eyes, and bone claws.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the compact 40x40px enemy sprite scale and 1px outline readability of `Chumbud` and `Dead Beat` in attached `206132 - Myth Enemies (EN Gen1).png`. Generate a 5-frame horizontal sprite strip (200x40px total, five 40x40px cells: Frame 1 Move A, Frame 2 Move B, Frame 3 Bite/Claw Lunge Attack, Frame 4 Hurt Recoil, Frame 5 Dead scattered rusted shell and bones) of `tin_rat` (Risen Thrall / Tin Rat): scrawny undead plague-rat fused inside a corroded rust-orange (#8B3A1E) iron canister shell on its back, hinged metal lid flapping open, matted ash-grey fur and exposed bone ribs, glowing blood-red (#FF3B3B) pinprick eyes. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `dust_dog.png` (Grave Hound / Dust Dog — Ossuary Nave & Sepulcher of Ash)
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 8 fps, anchor `[20, 36]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206134 - Gamers Enemies (JP).png` (`Miofa` & `Koronesuki`) + `Enemies/206132 - Myth Enemies (EN Gen1).png` (`Investigater`)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the small quadruped/hound enemy proportions and stride cadence of `206134 - Gamers Enemies (JP).png` and `206132 - Myth Enemies (EN Gen1).png`. Generate a 5-frame horizontal sprite strip (200x40px total, five 40x40px cells: Frame 1 Move A, Frame 2 Move B, Frame 3 Jaw-Snap Lunge Attack, Frame 4 Hurt Recoil, Frame 5 Dead collapsed bones and goggles) of `dust_dog` (Grave Hound): starved undead catacomb hound with exposed bone-white (#D9D2C3) ribcage, rust-stained hide, a frayed iron-chain collar with a dead runner's brass welding goggles (#FFC83D) dangling from its neck, head carried low with blood-red (#FF3B3B) eyes. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `wire_kite.png` (Gargoyle Imp / Wire Kite — Gallows Causeway)
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 8 fps, anchor `[20, 34]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png` (flying enemies) + `Playable Characters - Force (JP Gen 4)/530032 - Tokoyami Towa/` (devil/imp motifs)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the hovering flyer silhouette scale of `206133 - CouncilRyS Enemies (EN Gen2 + Hope).png`. Generate a 5-frame horizontal sprite strip (200x40px total, five 40x40px cells: Frame 1 Wingbeat Up, Frame 2 Wingbeat Down, Frame 3 Swoop Dive Attack, Frame 4 Hurt Recoil, Frame 5 Dead shattered frame on ground) of `wire_kite` (Gargoyle Imp / Wire Kite): a cursed bone-and-iron winged imp construct built from crossed dark-iron ribs and tattered bone-parchment wings (#D9D2C3), a single glowing blood-crimson (#FF3B3B) oculus eye in its chest, and a trailing barbed-wire tail. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `lye_leech.png` (Blight Leech / Lye Leech — Weeping Fens)
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 8 fps, anchor `[20, 36]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (`Takodachi` blob squish cycle)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Use the squash-and-stretch ground crawler proportions of `Takodachi` in `206132 - Myth Enemies (EN Gen1).png`. Generate a 5-frame horizontal sprite strip (200x40px total, five 40x40px cells: Frame 1 Compressed Crawl, Frame 2 Extended Crawl, Frame 3 Maw Lunge Bite, Frame 4 Hurt Recoil, Frame 5 Dead burst bile puddle) of `lye_leech` (Blight Leech): bloated caustic swamp-leech with bile-green (#6B8036, #9CB34C) and bog-teal (#1F4D4A) glistening segments, specular pixel wet highlights, and a circular lamprey maw ringed with bone-white (#D9D2C3) teeth. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `sump_bat.png` (Crypt Bat / Sump Bat — Weeping Fens)
- **Category**: `enemy_common`
- **Frame Size**: `40x40` (5 frame(s), strip `200x40`, 10 fps, anchor `[20, 34]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 1/529825 - Yozora Mel/Mel_bat.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Decorations` bat icon)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the crisp pixel bat wing silhouettes of `Mel_bat.png` and `206852 - Stage 3 - Halloween Castle`. Generate a 5-frame horizontal sprite strip (200x40px total, five 40x40px cells: Frame 1 Wings Spread High, Frame 2 Wings Downbeat, Frame 3 Sonic Fang Swoop, Frame 4 Hurt Recoil, Frame 5 Dead grounded wings) of `sump_bat` (Crypt Bat): mutated catacomb bat with tattered bog-teal (#2E6962) membrane wings stretched over rusted iron ribs, a swollen pale bile-green (#9CB34C) venom sac under its belly, and twin blood-red (#FF3B3B) eyes. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### Additional Floor 1 Expansion Common Enemies (`40x40`, 5 frames)
- **`rivet_tick.png` (Ossuary Skitter / Rivet Tick)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 1/529823 - Haachama (Akai Haato)/Haachama_Spider.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the compact arachnid leg-silhouette of attached Haachama_Spider.png. Generate a 5-frame 200x40px strip (five 40x40px cells: Move 1, Move 2, Leap-Latch Attack, Hurt, Dead) of rivet_tick (Ossuary Skitter): skull-shelled iron-legged crypt tick with 6 barbed slag-steel legs and a glowing crimson (#FF3B3B) eye-slit.`
- **`signal_mite.png` (Cursed Wisp / Signal Mite)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_spiritfire.png` + `Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the floating wisp/drone scale of Ayame_spiritfire.png. Generate a 5-frame 200x40px strip (five 40x40px cells: Hover 1, Hover 2, Broadcast Signal Pulse, Hurt, Dead) of signal_mite (Cursed Wisp): floating iron lantern-skull wisp wreathed in signal-cyan (#00F0FF) soulfire with a brass antenna chime.`
- **`silt_mimic.png` (Cursed Mimic / Silt Mimic)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206962 - Holozon Box.png` + `Enemies/206139 - Holoro Enemies (ID Gen2).png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the box/chest proportions of 206962 - Holozon Box.png scaled to a 40x40px mob cell. Generate a 5-frame 200x40px strip (five 40x40px cells: Crawl 1, Crawl 2, Jaw-Snap Ambush, Hurt/Feign-Death, Dead) of silt_mimic (Cursed Mimic): half-sunken bog-crusted iron reliquary coffer that splits open to reveal jagged bone teeth and a bile-green (#9CB34C) tongue.`
- **`cinder_crow.png` (Carrion Crow / Cinder Crow)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Council (EN Gen 2)/529783 - Nanashi Mumei/` + `Enemies/206132 - Myth Enemies (EN Gen1).png` (`KFP`)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the compact avian flyer silhouette of 206132 - Myth Enemies.png. Generate a 5-frame 200x40px strip (five 40x40px cells: Flap Up, Flap Down, High-Speed Dive Peck, Hurt, Dead) of cinder_crow (Carrion Crow): soot-black undead raven with smoldering ember-orange (#FF5A26) wingtips, exposed bone skull beak, and trailing ash sparks.`

---

## SECTION 4: ELITE ENEMIES (`80x80` 7-Frame Strips — Move 2, Tell 1, Attack 2, Hurt 1, Dead 1)

### `cleaver_hauler.png` (Executioner Brute / Cleaver Hauler — Ossuary Nave & Gallows Causeway)
- **Category**: `enemy_elite`
- **Frame Size**: `80x80` (7 frame(s), horizontal strip `560x80`, 8 fps, feet anchor `[40, 74]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206549 - Enemies (Miscellaneous).png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (Large Hooded Dead Beat)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #FF3B3B blood-crimson elite threat outline around a #0B0D10 dark base outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the heavy bruiser proportions of `206549 - Enemies (Miscellaneous).png`. Generate a 7-frame horizontal sprite strip (560x80px total, seven 80x80px cells: Frames 1–2 Heavy Walk, Frame 3 Brass-Glint Telegraph Windup raising cleaver high, Frames 4–5 Overhead Cleaver Slam & Charge, Frame 6 Hurt Recoil, Frame 7 Dead overturned cart and fallen cleaver) of `cleaver_hauler` (Executioner Brute): hulking hunched catacomb executioner in a tattered dark coat (#1A2228) and bone-rag hood with one glowing blood-red (#FF3B3B) eye, dragging a chained iron-wheeled ossuary cart of bones and scrap behind him, with a massive rusted butcher's guillotine cleaver (#6E757A) welded in place of his right forearm. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `lye_strider.png` (Blight Stalker / Lye Strider — Weeping Fens & Sepulcher of Ash)
- **Category**: `enemy_elite`
- **Frame Size**: `80x80` (7 frame(s), strip `560x80`, 8 fps, anchor `[40, 74]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png` (Tall Kronie / Cultist figures) + `Enemies/206549 - Enemies (Miscellaneous).png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #FF3B3B elite outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the tall, lanky silhouette proportions of `206133 - CouncilRyS Enemies.png` and `206549 - Enemies (Miscellaneous).png`. Generate a 7-frame horizontal sprite strip (560x80px total, seven 80x80px cells: Frames 1–2 Stilt Stride, Frame 3 Pressurized Tank Glow Telegraph, Frames 4–5 Caustic Acid-Spit Volley, Frame 6 Hurt Recoil, Frame 7 Dead collapsed stilts and cracked vat) of `lye_strider` (Blight Stalker): tall stilt-legged plague construct walking on twin bent iron pipes (#3A3F47), carrying a pressurized bog-teal (#2E6962) and bile-green (#9CB34C) glass alchemical vat on its hunched rust-armored back, with a corroded iron funnel/beak for a head that sprays toxic lye-bile. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### `flats_harvester.png` (Scythe Reaver / Flats Harvester — Gallows Causeway & Sepulcher of Ash)
- **Category**: `enemy_elite`
- **Frame Size**: `80x80` (7 frame(s), strip `560x80`, 8 fps, anchor `[40, 74]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206503 - Stage 4 Mini Boss (Udin).png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli_slash2.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #FF3B3B elite outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the compact armored vehicle/construct proportions of `206503 - Stage 4 Mini Boss (Udin).png` and spinning blade arcs of `Calli_slash2.png`. Generate a 7-frame horizontal sprite strip (560x80px total, seven 80x80px cells: Frames 1–2 Tracked Grind Roll, Frame 3 Brass Blade-Spin Telegraph, Frames 4–5 Whirling Blood-Stained Scythe-Drum Rush, Frame 6 Hurt Recoil, Frame 7 Dead wrecked chassis) of `flats_harvester` (Scythe Reaver): half-undead revenant torso fused into the front of a rusted iron caterpillar-tracked bone-harvester chassis (#8B3A1E, #3A3F47) mounted with a spinning rotary drum of blood-crimson (#FF3B3B) and brass (#FFC83D) scythe blades. avoid: smooth shading, vector look, 3D render, blur, glow, text.
  ```

### Additional Floor 1 Expansion Elite Enemies (`80x80`, 7 frames)
- **`plate_marshal.png` (Dread Templar / Plate Marshal)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206132 - Myth Enemies (EN Gen1).png` (Red Shielded Dead Beat) + `Playable Characters - Fantasy (JP Gen 3)/530011 - Shirogane Noel/Noel.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Scale the shielded skeleton soldier of 206132 - Myth Enemies.png up to an imposing 80x80px elite knight. Generate a 7-frame 560x80px strip (Move 2, Command Banner Tell 1, Shield Bash & Command Wave 2, Hurt 1, Dead 1) of plate_marshal (Dread Templar): towering undead cathedral knight in riveted slag-steel plate (#3A3F47) holding a massive tower shield (blocking frontal hits) and a rusted broadsword.`
- **`switchback_driver.png` (Hell-Steed Outrider / Switchback Driver)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206497 - Stage 2 Mini Boss (Mikodanye).png` + `Enemies/206549 - Enemies (Miscellaneous).png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the charging bruiser silhouette of 206549 - Enemies (Miscellaneous).png. Generate a 7-frame 560x80px strip (Move 2, Exhaust Sputter Feint/Rev Tell 1, Switchback Twin-Ram 2, Hurt 1, Dead 1) of switchback_driver (Hell-Steed Outrider): armored iron-wheel outrider fused to a bone-plated monowheel steed with twin brass exhaust pipes and a spiked ram prow.`
- **`sump_cantor.png` (Hex Chanter / Sump Cantor)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Enemies/206133 - CouncilRyS Enemies (EN Gen2 + Hope).png` (Hooded Hooman) + `Playable Characters - JP Gen 2/529968 - Murasaki Shion/Shion.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the robed occult caster silhouette of 206133 - CouncilRyS Enemies.png. Generate a 7-frame 560x80px strip (Move 2, Bell-Toll Channel Tell 1, Bog-Hex Pulse 2, Hurt 1, Dead 1) of sump_cantor (Hex Chanter): hunched fen-priest in tattered bog-teal (#1F4D4A) vestments swinging a corroded brass plague-bell staff that radiates bile-green (#9CB34C) hex rings.`
- **`bore_sentinel.png` (Crypt Wyrmling / Bore Sentinel)**:
  - **Reference**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Force (JP Gen 4)/530030 - Kiryu Coco/` + `Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the armoured reptile/drake proportions of 206495 - Stage 1 Mini Boss (Fubuzilla).png at 80x80px. Generate a 7-frame 560x80px strip (Move 2, Burrow Tremor Tell 1, Emerge & Slag-Mortar Spit 2, Hurt 1, Dead 1) of bore_sentinel (Crypt Wyrmling): segmented iron-and-bone burrowing drake emerging from a collar of red ash with a glowing ember-brass (#FFC83D) furnace core in its throat.`

---

## SECTION 5: BOSSES & THE 4 GREAT BLOODLINES (`9 Frames`: Idle 2, Attack A 2, Attack B 2, Phase-Change 1, Dead 2)

### `the_foreman.png` (High Executioner Malgorth / The Foreman — House of Malgorth, North Sector Overlord)
- **Category**: `boss`
- **Frame Size**: `192x192` (9 frame(s), horizontal strip `1728x192`, 6 fps, feet anchor `[96, 176]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206501 - Stage 3 Mini Boss (Shubangelion).png` (`528x930` giant articulated mech/colossus)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png` (`476x1151`)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/529762 - Mori Calliope/Calli.png`
- **Reference Analysis (Keep vs. Transform)**:
  - **Keep**: Massive boss silhouette presence (`~160x160px` inside `192x192` cell) from `206501 - Stage 3 Mini Boss (Shubangelion).png`, heavy tracked/armored base, articulated right crushing arm and left swinging chain weapon, distinct phase-change roar pose.
  - **Transform**: Fuse the industrial excavator-colossus of **The Foreman** with the gothic ossuary dreadnought of **High Executioner Malgorth**: a towering rusted iron-and-bone siege excavator reliquary (`#8B3A1E`, `#3A3F47`) on heavy spiked caterpillar treads, a crowned giant skeletal executioner in a brass-gold (`#FFC83D`) helm seated inside the rib-caged command cab, an articulated right guillotine-bucket arm, and a swinging left wrecking-ball thurible on heavy iron chains, outlined in a 1px brass-gold (`#FFC83D`) boss border.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #FFC83D brass-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the towering colossus/mech silhouette weight and multi-limb articulation of attached `206501 - Stage 3 Mini Boss (Shubangelion).png`. Generate a 9-frame horizontal boss sprite strip (1728x192px total, nine 192x192px cells: Frames 1–2 Heavy Idle, Frames 3–4 Attack A Guillotine Bucket-Arm Slam, Frames 5–6 Attack B Chained Wrecking-Ball Sweep, Frame 7 Phase-Change Reassembly Ritual Roar with signal-cyan #00F0FF and blood-red #FF3B3B energy, Frames 8–9 Defeated collapsed siege rig) of `the_foreman` (High Executioner Malgorth / The Foreman): colossal catacomb-excavator dreadnought on heavy slag-iron caterpillar treads (#3A3F47), rusted iron boiler housing (#8B3A1E) reinforced with giant bone ribs, a skeletal executioner lord wearing a brass-gold (#FFC83D) crown-helm inside the armored cab, a massive toothed guillotine-excavator arm on the right, and a spiked iron wrecking ball dangling from a heavy chain on the left. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `big_axle.png` (Dread Charioteer Varkos / Big Axle — Cavalcade of Varkos, West Sector Overlord)
- **Category**: `boss`
- **Frame Size**: `224x160` (9 frame(s), horizontal strip `2016x160`, 6 fps, feet anchor `[112, 146]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206502 - Stage 3 Hard Boss (Myth or Treat).png` (`788x1468`)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206497 - Stage 2 Mini Boss (Mikodanye).png` (`536x1232`)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #FFC83D brass-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the wide horizontal boss footprint and charge telegraph poses of `206502 - Stage 3 Hard Boss (Myth or Treat).png` and `206497 - Stage 2 Mini Boss (Mikodanye).png`. Generate a 9-frame horizontal boss sprite strip (2016x160px total, nine 224x160px cells: Frames 1–2 Idling Engine Rumble, Frames 3–4 Attack A Full-Throttle Ram Charge, Frames 5–6 Attack B Chained Trailer Whip & Broadside Mortar, Frame 7 Overheated Core Exposed Phase with glowing blood-crimson #FF3B3B furnace core, Frames 8–9 Defeated shattered war-rig) of `big_axle` (Dread Charioteer Varkos / Big Axle): monstrous armored war-chariot semi-cab (#3A3F47, #8B3A1E) on 6 spiked iron wheels dragging two chained iron-maiden trailer sections behind it, a jagged jaw-like cowcatcher grille on the front, twin headlights glowing like predatory brass-gold (#FFC83D) eyes (turning blood-red #FF3B3B in phase 2), and an undead outrider fused to the furnace helm. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `mother_sump.png` (Bog-Matriarch Hagra / Mother Sump — Coven of Hagra, East Sector Overlord)
- **Category**: `boss`
- **Frame Size**: `192x192` (9 frame(s), horizontal strip `1728x192`, 6 fps, feet anchor `[96, 176]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206500 - Stage 3 Boss (Hachama).png` (`648x714` eldritch spider/abomination boss)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206504 - Stage 4 Boss (Area 15).png` (`402x780`)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #FFC83D brass-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the sprawling eldritch boss silhouette and multi-part body mass of attached `206500 - Stage 3 Boss (Hachama).png`. Generate a 9-frame horizontal boss sprite strip (1728x192px total, nine 192x192px cells: Frames 1–2 Heaving Bog Idle, Frames 3–4 Attack A Caustic Bile Deluge & Tentacle Lash, Frames 5–6 Attack B Brood Devour Suction Channel, Frame 7 Starved / Enraged Phase with distended glowing bile-green #9CB34C sac, Frames 8–9 Defeated deflated mire carcass) of `mother_sump` (Bog-Matriarch Hagra / Mother Sump): grotesquely fused bog-matriarch abomination half-submerged in a dark bog-teal (#1F4D4A) toxic pool, draped in torn hazmat-yellow androtted coven tarp over corroded chemical drums (#8B3A1E), with a huge pulsing pale bile-green (#9CB34C) brood-sac abdomen and writhing leech-tendrils. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### `the_long_dry.png` (Catacomb Wyrm Skarath / The Long Dry — Brood of Skarath, South Sector Overlord)
- **Category**: `boss`
- **Frame Size**: `256x192` (9 frame(s), horizontal strip `2304x192`, 6 fps, feet anchor `[128, 176]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png` (`476x1151`)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Force (JP Gen 4)/530030 - Kiryu Coco/` (Dragon tail/body segments)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #FFC83D brass-gold boss outline over #0B0D10 soot outline, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Match the segmented serpentine/kaiju scale of `206495 - Stage 1 Mini Boss (Fubuzilla).png`. Generate a 9-frame horizontal boss sprite strip (2304x192px total, nine 256x192px cells: Frames 1–2 Coiled Subterranean Breach Idle, Frames 3–4 Attack A High-Arcing Drill-Maw Slam, Frames 5–6 Attack B Sand-Vortex & Slag Spit Barrage, Frame 7 Shell-Cracked Exposed Core Phase, Frames 8–9 Defeated shattered pipe-wyrm skeleton in red ash) of `the_long_dry` (Catacomb Wyrm Skarath / The Long Dry): gargantuan subterranean wyrm bursting upward from a collar of rust-red ash (#8B3A1E), its sinuous body constructed from 6 interlocking rusted iron boiler-pipe rings and bleached dragon vertebrae (#3A3F47, #D9D2C3), with 3 breakable armored shell plates along its spine and a gaping circular maw ringed with spinning brass (#FFC83D) rotary drill-teeth. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

---

## SECTION 6: COMBAT VFX, PROJECTILES & ULTIMATE CUT-INS (`fx` Category)

### `fx_slash_smear.png`
- **Category**: `fx`
- **Frame Size**: `128x128` (5 frame(s), strip `640x128`, 24 fps, center anchor `[64, 64]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_slash.png` (`720x231` 5-frame crescent slash progression)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png` (`Main - Phoenix Sword` 5-frame crescent strip)
- **Reference Analysis (Keep vs. Transform)**:
  - **Keep**: Exact 5-frame crescent growth-to-dissipation geometry from Row 1 of `Ayame_slash.png` and `Phoenix Sword` in `204696 - Takanashi Kiara.png` (Frame 1 thin leading arc, Frame 2 widest full crescent smear, Frame 3 trailing edge thinning, Frames 4–5 pixel-stepped dissipation).
  - **Transform**: Color with bone-white (`#EFE9DA`) core and razor-sharp signal-cyan (`#00F0FF` / `#088A9E`) outer rim on `#FF00FF` magenta background.
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, zero anti-aliasing, zero blur, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Directly match the 5-frame crescent sword-slash smear progression of Row 1 in attached `Ayame_slash.png` and `204696 - Takanashi Kiara.png` (Main - Phoenix Sword). Generate a 5-frame horizontal VFX sprite strip (640x128px total, five 128x128px cells) of `fx_slash_smear`: Frame 1 initial razor crescent arc; Frame 2 wide full-bodied crescent sword smear; Frame 3 tapering crescent; Frame 4 thin trailing razor arc; Frame 5 final pixel fragments fading out. Colored with a pure bone-white (#EFE9DA) inner core and a 2px signal-cyan (#00F0FF) and deep-teal (#088A9E) outer edge. avoid: soft airbrush glow, alpha gradient blur, 3D render, text.
  ```

### `fx_dash_streak.png`
- **Category**: `fx`
- **Frame Size**: `160x48` (4 frame(s), strip `640x48`, 24 fps, anchor `[80, 24]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Fan Dash` 4-frame horizontal blue streak section)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the 4-frame horizontal dash burst progression of `Fan Dash` in attached `206506 - Effects.png`. Generate a 4-frame horizontal VFX sprite strip (640x48px total, four 160x48px cells) of `fx_dash_streak`: sharp horizontal pixel speed-streak lines and spatial rift wind in bone-white (#EFE9DA) and signal-cyan (#00F0FF) that stretch across the frame on Frame 1 and progressively thin and break into pixel dashes across Frames 2, 3, and 4. avoid: motion blur, soft gradients, text.
  ```

### `fx_hit_cross.png`
- **Category**: `fx`
- **Frame Size**: `48x48` (3 frame(s), strip `144x48`, 24 fps, anchor `[24, 24]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Use Special` 4-point star impact flash & `Explode` Frames 1–2)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the crisp 4-point star/cross impact flash of `Use Special` in attached `206506 - Effects.png`. Generate a 3-frame horizontal VFX sprite strip (144x48px total, three 48x48px cells) of `fx_hit_cross`: a sharp diagonal X-cross impact spark burst with a bone-white (#EFE9DA) center and signal-cyan (#00F0FF) tips, expanding on Frame 1, peaking with detached pixel sparks on Frame 2, and shrinking on Frame 3. avoid: soft lens flare, blur, gradients, text.
  ```

### `fx_shards.png`
- **Category**: `fx`
- **Frame Size**: `64x64` (4 frame(s), strip `256x64`, 20 fps, anchor `[32, 32]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Rubble` 9-cell grid)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206508 - Pickups.png` (`Crate` splinter fragments)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the pixel debris/shrapnel chunks of `Rubble` in `206506 - Effects.png` and `Crate` in `206508 - Pickups.png`. Generate a 4-frame horizontal VFX sprite strip (256x64px total, four 64x64px cells) of `fx_shards`: 6 jagged bone-white (#D9D2C3), slag-iron (#6E757A), and rust-orange (#D16B38) shrapnel shards blasting radially outward from the center from Frame 1 to Frame 4. avoid: blur, soft glow, text.
  ```

### `fx_shock_ring.png`
- **Category**: `fx`
- **Frame Size**: `256x256` (6 frame(s), strip `1536x256`, 20 fps, anchor `[128, 128]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Explode` 8-frame expanding shockwave ring & `Use Special` ring)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down perspective. REFERENCE-GUIDED INSTRUCTION: Directly match the expanding serrated pixel shockwave ring progression of `Explode` in attached `206506 - Effects.png`, foreshortened into a 3/4 top-down ellipse. Generate a 6-frame horizontal VFX sprite strip (1536x256px total, six 256x256px cells) of `fx_shock_ring`: an expanding top-down elliptical ground shockwave ring with jagged bone-white (#EFE9DA) inner spikes, signal-cyan (#00F0FF) energy rim, and soot-black (#0B0D10) earth fracture dust, growing from a tight 48px ring in Frame 1 to a massive 240px dissipated ring in Frame 6. avoid: smooth airbrush blur, gradients, 3D render, text.
  ```

### `fx_ground_cracks.png`
- **Category**: `fx`
- **Frame Size**: `192x192` (3 frame(s), strip `576x192`, 1 fps, anchor `[96, 96]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Ground Crack` rectangular radial fissure decal)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Directly use the jagged pixel fissure network style of `Ground Crack` in attached `206506 - Effects.png`. Generate a 3-frame horizontal sprite strip (576x192px total, three 192x192px cells showing 3 distinct radial crack variations) of `fx_ground_cracks`: top-down radial impact crater fissures with soot-black (#0B0D10) and slag-grey (#3A3F47) shattered stone rims and a 1px signal-cyan (#00F0FF) soulfire vein glowing deep inside the central cracks. avoid: smooth shading, blur, soft glow, text.
  ```

### `fx_dust_puff.png`
- **Category**: `fx`
- **Frame Size**: `48x48` (4 frame(s), strip `192x48`, 16 fps, anchor `[24, 24]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Smoke` and `Smoke VFX` 6-frame pixel cloud strips)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the cel-shaded pixel smoke cloud clusters of `Smoke VFX` in attached `206506 - Effects.png`. Generate a 4-frame horizontal VFX sprite strip (192x48px total, four 48x48px cells) of `fx_dust_puff`: a billowy impact dust and ash puff in slag-grey (#4F565E), rust-brown (#8B3A1E), and bone-ash (#B8B2A2) that bursts outward in Frame 1, curls in Frame 2, separates into smaller cloudlets in Frame 3, and dissipates in Frame 4. avoid: soft airbrush smoke, alpha blur, text.
  ```

### `rail_spike.png`
- **Category**: `fx`
- **Frame Size**: `16x16` (4 frame(s), strip `64x16`, 1 fps, anchor `[8, 8]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoro (ID Gen 2)/530067 - Anya Melfissa/Anya_Blade.png`
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529971 - Yuzuki Choco/Choco_Needle.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the crisp small thrown blade/needle pixel clarity of `Anya_Blade.png` and `Choco_Needle.png`. Generate a 4-frame horizontal projectile strip (64x16px total, four 16x16px cells) of `rail_spike` (Soulfire Lance / Rail Spike): a heavy sharpened iron rail-spike with a dark slag-steel shaft (#3A3F47) and a blazing signal-cyan (#00F0FF) and bone-white (#EFE9DA) tip, drawn at 4 exact orientations: Frame 1 pointing Right (0°), Frame 2 pointing Down-Right (45°), Frame 3 pointing Down (90°), Frame 4 pointing Up-Right (-45°). avoid: blur, anti-aliasing, text.
  ```

### `fx_spark.png`
- **Category**: `fx`
- **Frame Size**: `24x24` (3 frame(s), strip `72x24`, 24 fps, anchor `[12, 12]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta_Flash.png` + `206506 - Effects.png` (`Explode` Frame 1)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match `Zeta_Flash.png` metal hit-spark geometry. Generate a 3-frame horizontal VFX sprite strip (72x24px total, three 24x24px cells) of `fx_spark`: a crisp metal-on-metal clash spark burst with 4 radiating pixel needles in bone-white (#EFE9DA), brass-gold (#FFC83D), and signal-cyan (#00F0FF) expanding across 3 frames. avoid: soft glow, blur, text.
  ```

### `ultimate_cutin.png`
- **Category**: `fx`
- **Frame Size**: `480x120` (1 frame(s), strip `480x120`, 1 fps, anchor `[240, 60]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206506 - Effects.png` (`Anime Zoom` speed-line border strips)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame_Port.png` (Close-up eye crop)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Combine the dramatic close-up eye framing of `Ayame_Port.png` with the high-contrast radial pixel speed-lines of `Anime Zoom` in `206506 - Effects.png`. Generate a 480x120px cinematic anime ultimate cut-in banner of Sena Ibuki: extreme close-up across her eyes and bridge of nose framed by top and bottom 4px signal-cyan (#00F0FF) slash borders, uneven rust-red bangs (#8B3A1E, #D16B38) and cracked brass goggle rim at the top, her eyes blazing luminous signal-cyan (#00F0FF) with bone-white (#EFE9DA) slit highlights, set against a soot-black (#0B0D10) background streaked with razor-sharp bone and slag-grey horizontal speed lines. avoid: smooth shading, soft airbrush glow, blur, text, letters.
  ```

### `fx_ult_slash.png`
- **Category**: `fx`
- **Frame Size**: `320x40` (3 frame(s), strip `960x40`, 24 fps, anchor `[160, 20]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - JP Gen 1/529822 - Aki Rosenthal/Aki_akibeam.png` + `529969 - Nakiri Ayame/Ayame_spiritslash.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the long screen-cleaving pixel beam/slash taper of `Aki_akibeam.png` and `Ayame_spiritslash.png`. Generate a 3-frame horizontal VFX sprite strip (960x40px total, three 320x40px cells) of `fx_ult_slash` (Seven Seals of Eclipse spatial rift cut): a 300px-long tapered dimensional sword-slash line with a pure bone-white (#EFE9DA) core and jagged signal-cyan (#00F0FF) rift edges, shown in 3 intensity frames (full spatial cleave, fracturing rift line, dissipating cyan sparks). avoid: soft blur, airbrush glow, text.
  ```

---

## SECTION 7: WORLD GROUND TILES (`16x16` Seamless Strips)

### `tile_kettle.png` (Duskhollow Town / Spire Crossroads Ground Tile)
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Floor` 3-column dark stone & warm brick tiles)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the subtle low-contrast pixel stone texture density of the `Floor` section in attached `206852 - Stage 3 - Halloween Castle.png` so sprites remain 100% readable on top. Generate a 3-frame horizontal tile strip (48x16px total, three seamless 16x16px ground tile variants, 100% opaque) of `tile_kettle` (Duskhollow Town / Spire Crossroads): dark soot-and-slate cobblestone (#11171B, #1A2228) blended with packed rust-warmed hearth dirt (#3B1C18) and subtle cracked flagstone seams. avoid: high-contrast noise, 3D bevels, blur.
  ```

### `tile_slab_town.png` (Ossuary Nave / Slab Town Ground Tile)
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Floor` first column dark blue-grey crypt stone)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the dark crypt flagstone texture of `Floor` Column 1 in `206852 - Stage 3 - Halloween Castle.png`. Generate a 3-frame horizontal tile strip (48x16px total, three seamless 16x16px ground tile variants, 100% opaque) of `tile_slab_town` (Ossuary Nave / Slab Town): fractured dark slag-stone catacomb paving (#182429, #2A353D) with tiny bone-ash (#545D5A) rubble flecks and hairline cracks. avoid: bright highlights, noisy contrast, blur.
  ```

### `tile_route_9.png` (Gallows Causeway / Route 9 Ground Tile)
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206853 - Stage 4 - Gelora Bung Yagoo.png` (asphalt/stone track tiles) + `206852 - Stage 3 - Halloween Castle.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the low-contrast ground tile style of `206852 - Stage 3 - Halloween Castle.png`. Generate a 3-frame horizontal tile strip (48x16px total, three seamless 16x16px ground tile variants, 100% opaque) of `tile_route_9` (Gallows Causeway / Route 9): scorched soot-black basalt causeway & cracked asphalt (#0B0D10, #182429), with Variant 2 featuring a faded tarnished brass-gold (#593E18, #946B22) lane/runic stripe down the center. avoid: bright white lines, blur, gradients.
  ```

### `tile_lye_marsh.png` (Weeping Fens / Lye Marsh Ground Tile)
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206841 - Stage 1 Hard - Grassy Plains (Night).png` + `206852 - Stage 3 - Halloween Castle.png` (`Berry Juice` puddle shapes)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the dark night-ground palette of `206841 - Stage 1 Hard (Night).png` and puddle shapes of `206852 - Stage 3 - Halloween Castle.png`. Generate a 3-frame horizontal tile strip (48x16px total, three seamless 16x16px ground tile variants, 100% opaque) of `tile_lye_marsh` (Weeping Fens / Lye Marsh): dark bog-teal mire mud (#11292B, #173B3A) with shallow caustic bile-green (#3A4A24) puddles and damp moss pixels. avoid: neon green, noisy contrast, blur.
  ```

### `tile_copper_flats.png` (Sepulcher of Ash / Copper Flats Ground Tile)
- **Category**: `tile`
- **Frame Size**: `16x16` (3 frame(s), strip `48x16`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Floor` Column 2 rust-brown stone & Column 3 dark crimson)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the warm dark rust-brown value range of `Floor` Column 2 in `206852 - Stage 3 - Halloween Castle.png`. Generate a 3-frame horizontal tile strip (48x16px total, three seamless 16x16px ground tile variants, 100% opaque) of `tile_copper_flats` (Sepulcher of Ash / Copper Flats): wind-rippled dark rust-red ash and copper slag sand (#3B1C18, #612819, #8B3A1E) with tiny dark iron pebbles. avoid: bright orange, blur, gradients.
  ```

### `tile_transitions.png`
- **Category**: `tile`
- **Frame Size**: `16x16` (6 frame(s), strip `96x16`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206142 - Stage 1 - Grassy Plains.png` + `206852 - Stage 3 - Halloween Castle.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, top-down orthographic view. REFERENCE-GUIDED INSTRUCTION: Match the pixel-stepped tile transition borders in `206142 - Stage 1 - Grassy Plains.png` and `206852 - Stage 3 - Halloween Castle.png`. Generate a 6-frame horizontal tile strip (96x16px total, six seamless 16x16px edge-transition tiles, 100% opaque) blending between Duskhollow hearth-stone (#1A2228), Ossuary slag-rubble (#2A353D), Causeway basalt (#0B0D10), Weeping Fens bog-mud (#173B3A), and Sepulcher rust-ash (#612819). avoid: soft alpha blending, blur, gradients.
  ```

---

## SECTION 8: WORLD PROPS & DUSKHOLLOW STRUCTURES (40 Props across 5 Regions, with Baked Ground Shadow Ellipse)

> **Structural Reference for All Props**:
> Attach `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Rubble`, `Furniture`, `Decorations`, `Walls`), `Holo House/206123 - Furniture - Structure.png`, and `Holo House/206141 - NPCs.png`. Every prop must sit on a baked solid `#0B0D10` soot-black elliptical ground shadow on a `#FF00FF` magenta background.

### 8.1 Kettle / Duskhollow Town Props (8 Props)

#### `prop_kettle_boiler_tower.png` (Abyssal Spire Gatehouse / Kettle Boiler Tower)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `96x96` (1 frame, anchor `[48, 88]`)
- **Primary Reference File(s)**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Walls` gothic archway) + `Miscellaneous/206143 - Yagoo Statue.png`
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 top-down architectural scale and stone/metal shading of `Walls` in `206852 - Stage 3 - Halloween Castle.png`. Generate a 96x96px sprite of `prop_kettle_boiler_tower`: a towering dark-iron and gothic-stone boiler gatehouse monument (#2A353D, #8B3A1E) with riveted iron pipes, a warm brass-amber (#FFC83D) furnace grate at its base, and a glowing signal-cyan (#00F0FF) waystone seal above the arch, with a baked #0B0D10 ground shadow ellipse on #FF00FF magenta.
  ```

#### `prop_kettle_shack.png` (Runesmith / Salvage Shack)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `80x64` (1 frame, anchor `[40, 58]`)
- **Primary Reference File(s)**: `Holo House/206141 - NPCs.png` (`Bloop` stall) + `Holo House/206123 - Furniture - Structure.png`
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 top-down merchant stall/shack structure of `Bloop` in `206141 - NPCs.png`. Generate an 80x64px sprite of `prop_kettle_shack`: a rugged dark-timber and corrugated rust-iron armory shack (#4D3423, #8B3A1E, #3A3F47) with a pitched slate tarp roof, hanging forge lantern (#FFC83D), and anvil counter, with a baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_campfire.png` (Sanctuary Brazier / Oil-Drum Campfire)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `32x32` (3 frame(s), strip `96x32`, 8 fps, anchor `[16, 28]`)
- **Primary Reference File(s)**: `Miscellaneous/206506 - Effects.png` (`Fire` 4-frame flame animation) + `Holo House/206116 - Cooking.png`
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 4-frame pixel flame animation style of `Fire` in `206506 - Effects.png`. Generate a 3-frame horizontal sprite strip (96x32px total, three 32x32px cells) of `prop_kettle_campfire`: a dwarf-iron ring brazier / cut oil-drum firepit (#3A3F47) surrounded by stone blocks, with flickering 3-frame pixel flames in rust-orange (#D16B38) and brass-gold (#FFC83D), baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_signs.png` (Crossroads Directional Signpost)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `32x40` (1 frame, anchor `[16, 36]`)
- **Primary Reference File(s)**: `Levels/206142 - Stage 1 - Grassy Plains.png` + `Holo House/206141 - NPCs.png`
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 signpost proportions in `206142 - Stage 1 - Grassy Plains.png`. Generate a 32x40px sprite of `prop_kettle_signs`: a dark timber post (#4D3423) bound in iron chains with 3 directional rusted metal arrow plaques (#8B3A1E, #D9D2C3) pointing North, West, East, and South, baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_crates.png` (Stamped Iron & Timber Supply Crates)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `40x32` (1 frame, anchor `[20, 28]`)
- **Primary Reference File(s)**: `Miscellaneous/206508 - Pickups.png` (`Crate` 3/4 wooden/metal crate)
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the exact 3/4 pixel crate perspective of `Crate` in `206508 - Pickups.png`. Generate a 40x32px sprite of `prop_kettle_crates`: two stacked dark-wood and stamped slag-iron supply crates (#4D3423, #3A3F47) reinforced with brass corner rivets (#FFC83D), baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_barrels.png` (Alchemical & Fuel Barrels)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `32x32` (1 frame, anchor `[16, 28]`)
- **Primary Reference File(s)**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` barrel) + `Holo House/206141 - NPCs.png` (`Bloop` barrel)
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 pixel barrel shading in `206141 - NPCs.png` and `206852 - Stage 3 - Halloween Castle.png`. Generate a 32x32px sprite of `prop_kettle_barrels`: a pair of dented iron-hooped barrels (#8B3A1E, #3A3F47), one sealed with a brass bung, baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_tent.png` (Sanctuary Runner Tent)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `64x48` (1 frame, anchor `[32, 42]`)
- **Primary Reference File(s)**: `Holo House/206127 - Furniture - Bedroom.png` + `Holo House/206123 - Furniture - Structure.png`
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 top-down prop geometry of `206127 - Furniture - Bedroom.png`. Generate a 64x48px sprite of `prop_kettle_tent`: a weathered bone-canvas and dark-leather expedition tent (#8A877C, #B8B2A2, #612819) pitched on iron rebar poles with a warm lantern at the entrance flap, baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

#### `prop_kettle_bench.png` (Armorer's Vise Workbench)
- **Category**: `prop` (`area: kettle`) | **Frame Size**: `48x32` (1 frame, anchor `[24, 28]`)
- **Primary Reference File(s)**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` tables) + `Playable Characters - Holoh3ro (ID Gen 3)/530072 - Kaela Kovalskia/Kaela_Anvil.png`
- **Full GPT Image Prompt**:
  ```text
  [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 table perspective of `Furniture` in `206852 - Stage 3 - Halloween Castle.png` and tool detail of `Kaela_Anvil.png`. Generate a 48x32px sprite of `prop_kettle_bench`: a heavy railway-sleeper workbench (#4D3423) fitted with a cast-iron vise (#3A3F47), sharpening whetstone, and brass calipers, baked #0B0D10 ground shadow on #FF00FF magenta.
  ```

---

### 8.2 Slab Town / Ossuary Nave Props (8 Props)
- **`prop_slab_collapsed_wall.png`** (`80x64`, anchor `[40, 58]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` crumbled stone wall sections 1 & 3)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Directly match the crumbled stone wall construction of Rubble in attached 206852 - Stage 3 - Halloween Castle.png. Generate an 80x64px sprite of prop_slab_collapsed_wall: collapsed gothic catacomb concrete/stone wall (#2A353D, #4F565E) with twisted rusted iron rebar rods (#8B3A1E) protruding from the broken masonry, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_rebar_pile.png`** (`48x40`, anchor `[24, 34]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble`)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the rubble pile cluster style of 206852 - Stage 3 - Halloween Castle.png. Generate a 48x40px sprite of prop_slab_rebar_pile: tangled barricade of rusted iron rebar spikes (#8B3A1E) and shattered ossuary stone blocks (#3A3F47), baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_dead_mall_sign.png`** (`64x64`, anchor `[32, 58]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` middle broken pillar/obelisk)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the broken stone pillar silhouette in 206852 - Stage 3 - Halloween Castle.png. Generate a 64x64px sprite of prop_slab_dead_mall_sign: fallen iron-framed monolith pylon / shattered sanctuary obelisk (#2A353D, #612819) with a cracked signal-cyan (#088A9E) rune casing, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_rubble_heap.png`** (`56x40`, anchor `[28, 34]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` + `Miscellaneous/206506 - Effects.png` `Rubble`)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match Rubble in 206852 - Stage 3 - Halloween Castle.png. Generate a 56x40px sprite of prop_slab_rubble_heap: mound of broken slate slabs (#3A3F47), bone-white skulls (#B8B2A2), and masonry dust, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_bent_streetlight.png`** (`32x72`, anchor `[16, 66]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Decorations` tall candelabra/lantern post)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the tall vertical post proportion of Decorations in 206852 - Stage 3 - Halloween Castle.png. Generate a 32x72px sprite of prop_slab_bent_streetlight: bent wrought-iron street/catacomb lamp post (#2A353D) with a shattered cage housing hanging at an angle, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_shopping_cart.png`** (`32x32`, anchor `[16, 28]`):
  - **Reference**: `Holo House/206120 - Furniture - Decorations.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 32x32 prop clarity of 206120 - Furniture - Decorations.png. Generate a 32x32px sprite of prop_slab_shopping_cart: overturned rusted iron wire-cage bone-cart (#8B3A1E, #4F565E) tipped on its side, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_vending_machine.png`** (`40x56`, anchor `[20, 50]`):
  - **Reference**: `Levels/206842 - Stage 2 - Holo Office.png` (Office vending machine / cabinet) + `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` tall cabinet)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Combine the upright cabinet silhouette of 206842 - Stage 2 - Holo Office.png and 206852 - Stage 3 - Halloween Castle.png. Generate a 40x56px sprite of prop_slab_vending_machine: gutted iron reliquary dispenser / vending cabinet (#2A353D, #612819) with a shattered front glass panel and faint cyan (#088A9E) wire spark, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_slab_broken_stairs.png`** (`64x56`, anchor `[32, 50]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble` & `Walls`)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the stone masonry shading of 206852 - Stage 3 - Halloween Castle.png. Generate a 64x56px sprite of prop_slab_broken_stairs: freestanding flight of 5 cracked stone catacomb steps (#2A353D, #4F565E) sheared off at the top, with exposed iron bars, baked #0B0D10 ground shadow on #FF00FF magenta.`

---

### 8.3 Route 9 / Gallows Causeway Props (8 Props)
- **`prop_route9_burnt_car.png`** (`72x48`, anchor `[36, 42]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png` (street props/vehicles)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 vehicle/obstacle perspective of 206853 - Stage 4 - Gelora Bung Yagoo.png. Generate a 72x48px sprite of prop_route9_burnt_car: rusted, burnt-out iron carriage / sedan hull (#612819, #2A353D) resting on wheelless axles, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_overturned_truck.png`** (`96x64`, anchor `[48, 58]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the heavy obstacle scale of 206853 - Stage 4 - Gelora Bung Yagoo.png. Generate a 96x64px sprite of prop_route9_overturned_truck: overturned armored transport cab / war-wagon (#8B3A1E, #3A3F47) lying on its side with exposed undercarriage axles, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_guardrail.png`** (`64x32`, anchor `[32, 28]`):
  - **Reference**: `Levels/206142 - Stage 1 - Grassy Plains.png` (horizontal barrier/fence)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the horizontal barrier layout of 206142 - Stage 1 - Grassy Plains.png. Generate a 64x32px sprite of prop_route9_guardrail: crumpled, dented slag-steel highway/causeway guardrail section (#4F565E, #612819) bolted to wooden posts, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_road_sign.png`** (`32x56`, anchor `[16, 50]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the vertical sign prop scale of 206853 - Stage 4 - Gelora Bung Yagoo.png. Generate a 32x56px sprite of prop_route9_road_sign: bolt-riddled diamond warning sign (#946B22, #612819) on a bent iron pipe post with a hanging chain, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_tire_stack.png`** (`32x36`, anchor `[16, 32]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 32x36 prop clarity of 206853 - Stage 4 - Gelora Bung Yagoo.png. Generate a 32x36px sprite of prop_route9_tire_stack: stack of 3 heavy iron-rimmed rubber treads (#1A2228, #3A3F47) dusted with rust ash, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_oil_drum.png`** (`32x36`, anchor `[16, 32]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` barrel)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 32x36 barrel silhouette in 206852 - Stage 3 - Halloween Castle.png. Generate a 32x36px sprite of prop_route9_oil_drum: corroded ribbed iron oil drum (#8B3A1E, #3A3F47) with a brass hazard stripe (#946B22), baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_dead_tree.png`** (`56x64`, anchor `[28, 58]`):
  - **Reference**: `Levels/206841 - Stage 1 Hard - Grassy Plains (Night).png` (dark gnarled tree)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 3/4 tree trunk and branch silhouette in 206841 - Stage 1 Hard (Night).png. Generate a 56x64px sprite of prop_route9_dead_tree: gnarled, leafless bone-bleached gallows tree (#8A877C, #B8B2A2) with a broken iron chain hanging from a bough, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_route9_billboard_frame.png`** (`88x72`, anchor `[44, 66]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the large structural prop scale of 206853 - Stage 4 - Gelora Bung Yagoo.png. Generate an 88x72px sprite of prop_route9_billboard_frame: skeletal rusted-steel truss frame / gallows gantry (#612819, #3A3F47) with torn sheet-metal strips, baked #0B0D10 ground shadow on #FF00FF magenta.`

---

### 8.4 Lye Marsh / Weeping Fens Props (8 Props)
- **`prop_marsh_rusted_drum_cluster.png`** (`48x40`, anchor `[24, 34]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Furniture` barrel + `Berry Juice` puddle)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Combine the barrels and liquid puddles of 206852 - Stage 3 - Halloween Castle.png. Generate a 48x40px sprite of prop_marsh_rusted_drum_cluster: 3 corroded chemical drums (#8B3A1E, #1F4D4A) half-sunken in dark bog mud leaking bile-green (#9CB34C) sludge, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_dead_reed_clump.png`** (`32x40`, anchor `[16, 34]`):
  - **Reference**: `Levels/206142 - Stage 1 - Grassy Plains.png` (tall grass/reed clumps)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the reed/foliage cluster pixel structure of 206142 - Stage 1 - Grassy Plains.png. Generate a 32x40px sprite of prop_marsh_dead_reed_clump: clump of brittle bone-bleached marsh reeds (#8A877C, #B8B2A2) and bog-teal (#2E6962) stalks rising from mud, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_bone_pile.png`** (`40x32`, anchor `[20, 28]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble`) + `Enemies/206132 - Myth Enemies.png` (`Dead Beat` bones)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the bone/rubble pixel clusters of 206852 - Stage 3 - Halloween Castle.png. Generate a 40x32px sprite of prop_marsh_bone_pile: bleached beast ribcage and horned skulls (#B8B2A2, #D9D2C3) half-submerged in bog-teal (#1F4D4A) mire, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_sunken_car_roof.png`** (`64x40`, anchor `[32, 34]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the sunken obstacle style of 206853 - Stage 4 - Gelora Bung Yagoo.png. Generate a 64x40px sprite of prop_marsh_sunken_car_roof: corroded iron carriage/car roof and window pillars (#612819, #2E6962) protruding at an angle from bog water ripples, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_glowing_spore_pods.png`** (`40x40`, anchor `[20, 34]`):
  - **Reference**: `Holo House/206115 - Farming.png` (strange bulbous crops)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 40x40 organic plant cluster scale of 206115 - Farming.png. Generate a 40x40px sprite of prop_marsh_glowing_spore_pods: cluster of 3 swollen bog-fungal pods (#1F4D4A, #6B8036) with glowing signal-cyan (#00F0FF) and bile-green (#9CB34C) pores, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_pipe_outflow.png`** (`56x48`, anchor `[28, 42]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the stone/iron masonry of 206852 - Stage 3 - Halloween Castle.png. Generate a 56x48px sprite of prop_marsh_pipe_outflow: large riveted rust-iron sewer culvert pipe (#612819, #3A3F47) discharging a stream of bile-green (#9CB34C) sludge into a bog puddle, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_tarp_shack.png`** (`72x56`, anchor `[36, 50]`):
  - **Reference**: `Holo House/206141 - NPCs.png` (`Bloop` stall)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the stilted wooden structure of 206141 - NPCs.png. Generate a 72x56px sprite of prop_marsh_tarp_shack: ramshackle stilted fen lean-to (#4D3423) draped in weathered brass-yellow (#946B22) and bog-teal (#2E6962) tarp with a hangingwitch-charm, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_marsh_fog_patch.png`** (`64x32`, anchor `[32, 26]`):
  - **Reference**: `Miscellaneous/206506 - Effects.png` (`Smoke` horizontal strip)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the horizontal pixel cloud layering of Smoke in 206506 - Effects.png. Generate a 64x32px sprite of prop_marsh_fog_patch: low-hanging checkerboard-dithered pixel miasma cloud in bog-teal (#2E6962) and bone-grey (#8A877C) on #FF00FF magenta (no ground shadow).`

---

### 8.5 Copper Flats / Sepulcher of Ash Props (8 Props)
- **`prop_flats_wrecked_harvester.png`** (`96x72`, anchor `[48, 66]`):
  - **Reference**: `Bosses/206501 - Stage 3 Mini Boss (Shubangelion).png` + `Levels/206853 - Stage 4.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the heavy mechanical wreck detail of 206501 - Stage 3 Mini Boss.png. Generate a 96x72px sprite of prop_flats_wrecked_harvester: hulking rusted strip-mine excavator/harvester hull (#8B3A1E, #3A3F47) half-buried in drift ash with a broken toothed wheel, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_sand_dune_crest.png`** (`80x40`, anchor `[40, 34]`):
  - **Reference**: `Levels/206142 - Stage 1 - Grassy Plains.png` (terrain mounds)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the terrain mound shading of 206142 - Stage 1 - Grassy Plains.png. Generate an 80x40px sprite of prop_flats_sand_dune_crest: wind-sculpted rust-red ash dune ridge (#612819, #8B3A1E, #D16B38) studded with dark slag stones (#2A353D), baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_machine_rib_cage.png`** (`72x56`, anchor `[36, 50]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Rubble`)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the arched ruin silhouette of 206852 - Stage 3 - Halloween Castle.png. Generate a 72x56px sprite of prop_flats_machine_rib_cage: 4 arched iron hull ribs of a gutted leviathan turbine (#3A3F47, #8B3A1E) protruding like a ribcage from red ash, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_cactus_husk.png`** (`32x48`, anchor `[16, 42]`):
  - **Reference**: `Holo House/206115 - Farming.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the vertical plant silhouette in 206115 - Farming.png. Generate a 32x48px sprite of prop_flats_cactus_husk: petrified, hollow bone-grey and dry-wood desert pillar cactus skeleton (#4D3423, #8A877C) with iron thorns, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_buried_antenna.png`** (`40x64`, anchor `[20, 58]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the tilted mast silhouette in 206853 - Stage 4 - Gelora Bung Yagoo.png. Generate a 40x64px sprite of prop_flats_buried_antenna: tilted rusted radar dish and iron lattice mast (#8B3A1E, #4F565E) half-buried in red ash, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_tire_half_sunk.png`** (`32x32`, anchor `[16, 28]`):
  - **Reference**: `Levels/206853 - Stage 4 - Gelora Bung Yagoo.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the 32x32 prop scale of 206853 - Stage 4.png. Generate a 32x32px sprite of prop_flats_tire_half_sunk: giant haul-rig iron-tread wheel (#1A2228, #612819) buried upright halfway into rust-red sand, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_bone_arch.png`** (`72x64`, anchor `[36, 58]`):
  - **Reference**: `Levels/206852 - Stage 3 - Halloween Castle.png` (`Walls` arch + `Rubble`)
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the archway geometry of Walls in 206852 - Stage 3 - Halloween Castle.png. Generate a 72x64px sprite of prop_flats_bone_arch: colossal wyrm-vertebrae and rusted I-beam archway (#D9D2C3, #8A877C, #8B3A1E) bound with iron chains, baked #0B0D10 ground shadow on #FF00FF magenta.`
- **`prop_flats_rusted_silo.png`** (`80x88`, anchor `[40, 80]`):
  - **Reference**: `Holo House/206123 - Furniture - Structure.png`
  - **Prompt**: `[Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match the large cylindrical/structural shading of 206123 - Furniture - Structure.png. Generate an 80x88px sprite of prop_flats_rusted_silo: collapsed cylindrical ore silo (#612819, #8B3A1E, #3A3F47) made of riveted rust plates with a ruptured top dome, baked #0B0D10 ground shadow on #FF00FF magenta.`

---

## SECTION 9: DUSKHOLLOW TOWN NPCs & MERCHANTS (`64x64`, 2-Frame Idle Strip `128x64`)

### `ume.png` (Quartermaster Ume / Master Smith Vaelen)
- **Category**: `npc`
- **Frame Size**: `64x64` (2 frame(s), strip `128x64`, 2 fps, anchor `[32, 58]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Shop/206131 - Shop Menu.png` (`A-Chan Idle` behind counter)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Holo House/206141 - NPCs.png` (`Bloop` stall counter & `Shiraken Elfriend`)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - Holoh3ro (ID Gen 3)/530072 - Kaela Kovalskia/Kaela.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, clean 1px #0B0D10 dark outlines, 16-color limited palette, hue-shifted shading, light from top-left, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background, 3/4 top-down view. REFERENCE-GUIDED INSTRUCTION: Combine the counter-standing shopkeeper composition of `206131 - Shop Menu.png` and `206141 - NPCs.png` with 2-head chibi RPG proportions. Generate a 2-frame horizontal NPC sprite strip (128x64px total, two 64x64px cells, 1px idle breathing bob) of `ume` (Quartermaster Ume / Runesmith): weathered older salvage-armorer woman standing behind a heavy wooden-and-iron pawn/forge counter (#4D3423, #8B3A1E), silver-grey hair tied in a bun (#B8B2A2), brass reading/forging glasses (#FFC83D) on a chain, rolled-up rust tunic sleeves, with an iron crate of salvaged weapons and glowing soul-iron beside her counter, and a baked #0B0D10 ground shadow ellipse. avoid: smooth shading, vector look, 3D render, blur, soft glow, text.
  ```

### Companion Duskhollow Town NPCs (`64x64` 2-Frame Strips `128x64` — Reference: `206141 - NPCs.png` & `206131 - Shop Menu.png`)
- **`npc_vaelen.png` (Master Smith Vaelen — Runesmith Forge)**: Bearded runesmith in soot-black leather apron (`#1A2228`) holding a glowing ember-orange (`#FF5A26`) runehammer over a soulfire anvil (`Kaela_Anvil.png` reference).
- **`npc_isolde.png` (Sister Isolde — Alchemist Apothecary)**: Plague-alchemist nun in bog-teal (`#1F4D4A`) and bone-white veil holding a glowing crimson blood vial (`#FF3B3B`) beside an alembic table (`Choco_Supplies.png` reference).
- **`npc_malakor.png` (Chronicler Malakor — Hunters Guild & Bloodline Hall)**: Hooded chronicler in dark purple-slate robes (`#26313A`) with brass astrolabe spectacles beside the Bloodline Ledger board (`Herding Board` in `206141 - NPCs.png` reference).
- **`npc_solen.png` (Archmage Solen — Arcane Sanctum)**: Grand astromancer with levitating signal-cyan (`#00F0FF`) grimoire and starforged staff (`Shion.png` reference).
- **`npc_maeve.png` (Maeve the Hearthkeeper — Raven's Rest Tavern)**: Warm tavern hostess carrying a steaming platter of wyrm-steak and spiced ale tankard (`206116 - Cooking.png` reference).
- **`npc_vex.png` (Vex the Veil-Peddler — Mystic Enchanter & Curio Broker)**: Masked occult curio broker surrounded by 3 sealed reliquary coffers (`206962 - Holozon Box.png` reference).
- **`npc_morwen.png` (Morwen the Veil-Peddler — Wandering Caravan Mystic)**: Corner-spawning caravan mystic with a ward-lantern that repels monsters.

---

## SECTION 10: SKILL ICONS & ITEM ICONS (`32x32` UI Icons)

> **Master Structural Reference for ALL `32x32` Icons**:
> Attach `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`Weapons`, `Collab Weapons`, `Items`, `Other`) and any character `_Perk1..3.png` / `_Weapon.png` (e.g., `529969 - Nakiri Ayame/Ayame_Weapon.png`, `Ayame_Perk1.png`, `Ayame_Special.png`).
> **Icon Framing Rule**: Every `32x32` icon is a full `32x32` square with a `1px` `#0B0D10` outer border, a `1px` `#3A3F47` (slag-iron) inner bevel, a solid `#11171B` dark interior background, and the centered icon subject drawn at a crisp 45° diagonal or front-emblem angle with a `1px` `#0B0D10` outline.

### 10.1 Active Skill Icons (`icon_skill_*.png` — `32x32`, 1 frame)

#### `icon_skill_lunge.png` (Shadow Lunge)
- **Category**: `ui_icon` | **Frame Size**: `32x32` (1 frame)
- **Primary Reference File(s)**: `Items/206883 - Item Icons.png` (`Weapons` Row 1 Col 8 katana / `Other` sword) + `529969 - Nakiri Ayame/Ayame_Weapon.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 framed square icon layout and diagonal weapon readability of attached `206883 - Item Icons.png` and `Ayame_Weapon.png`. Generate a 32x32px skill icon for `icon_skill_lunge` (Shadow Lunge): dark #11171B square interior with a 1px #3A3F47 iron border, showing Duskrend's dark-iron blade thrusting diagonally from bottom-left to top-right wrapped in a razor-sharp signal-cyan (#00F0FF) and bone-white (#EFE9DA) speed-streak. avoid: blur, text, numbers, soft glow.
  ```

#### `icon_skill_ground_break.png` (Abyssal Rupture / Ground Break)
- **Category**: `ui_icon` | **Frame Size**: `32x32` (1 frame)
- **Primary Reference File(s)**: `Items/206883 - Item Icons.png` + `530072 - Kaela Kovalskia/Kaela_Anvil.png`
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 framed icon style of `206883 - Item Icons.png`. Generate a 32x32px skill icon for `icon_skill_ground_break` (Abyssal Rupture): dark #11171B square with 1px #3A3F47 border, showing Duskrend's blade driven vertically downward into shattered #2A353D stone, erupting with radial signal-cyan (#00F0FF) and bone-white (#EFE9DA) shockwave cracks at the bottom. avoid: blur, text, soft glow.
  ```

#### `icon_skill_rail_spike.png` (Soulfire Lance / Rail Parry / Rail Spike)
- **Category**: `ui_icon` | **Frame Size**: `32x32` (1 frame)
- **Primary Reference File(s)**: `Items/206883 - Item Icons.png` (`Collab Weapons` diagonal lance/beam icons)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 framed icon style of `206883 - Item Icons.png`. Generate a 32x32px skill icon for `icon_skill_rail_spike` (Soulfire Lance / Rail Spike): dark #11171B square with 1px #3A3F47 border, showing a heavy sharpened iron rail-spike hurtling diagonally toward top-right with a blazing signal-cyan (#00F0FF) and bone-white (#EFE9DA) piercing tip and rust-orange (#D16B38) tail sparks. avoid: blur, text, soft glow.
  ```

#### `icon_skill_seven_cuts.png` (Seven Seals of Eclipse / Seven Cuts Ultimate)
- **Category**: `ui_icon` | **Frame Size**: `32x32` (1 frame)
- **Primary Reference File(s)**: `529969 - Nakiri Ayame/Ayame_Special.png` + `529762 - Mori Calliope/Calli_Special.png` + `Items/206883 - Item Icons.png` (`Super Collab Weapons` row)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the high-impact ultimate icon composition of `Ayame_Special.png` and `Super Collab Weapons` in `206883 - Item Icons.png`. Generate a 32x32px ultimate skill icon for `icon_skill_seven_cuts` (Seven Seals of Eclipse): dark #0B0D10 square with a 1px brass-gold (#FFC83D) ultimate border, showing 7 intersecting razor-sharp signal-cyan (#00F0FF) and bone-white (#EFE9DA) dimensional slash lines slicing across a blood-crimson (#8A1C24) eclipsed moon silhouette. avoid: blur, text, soft glow.
  ```

#### `icon_skill_locked.png` (Locked Skill Slot)
- **Category**: `ui_icon` | **Frame Size**: `32x32` (1 frame)
- **Primary Reference File(s)**: `Miscellaneous/206965 - Game Menus and HUDs.png` (`Locked Characters` padlock & chain icon)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the pixel padlock and crossed chains of `Locked Characters` in attached `206965 - Game Menus and HUDs.png`. Generate a 32x32px icon for `icon_skill_locked`: dark #0B0D10 square with 1px #2A353D border, showing a heavy rusted iron padlock (#8B3A1E, #4F565E) bound by diagonal slag-iron chains with a dark keyhole in the center. avoid: blur, text, soft glow.
  ```

---

### 10.2 Equipment & Supply Icons (`icon_item_*.png` — `32x32`, 1 frame)

#### Head Armor Icons (`welding_goggles`, `surplus_respirator`, `riders_helmet`)
- **`icon_item_welding_goggles.png` (Tarnished Iron Circlet / Welding Goggles)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 3 shades & Row 4 Col 7 round glasses)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 eyewear item icon layout of `Items` in attached `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_welding_goggles`: dark #11171B square with 1px #3A3F47 border, showing a pair of battered brass-and-iron smithing goggles / brow-circlet (#D49B2A, #6E757A) with bog-teal (#2E6962) lenses (one lens cracked with a #EFE9DA glint) and a dark leather strap. avoid: blur, text, soft glow.
    ```
- **`icon_item_surplus_respirator.png` (Grave-Forged Visage / Surplus Respirator)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 6 dark mask)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 mask icon in `Items` Row 2 Column 6 of attached `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_surplus_respirator` (Grave-Forged Visage): dark #11171B square with 1px #3A3F47 border, showing a dark-iron plague-inquisitor half-mask / twin-canister respirator (#3A3F47, #6E757A) with rust-copper (#8B3A1E) filter drums and signal-cyan (#00F0FF) rune-etched vents. avoid: blur, text, soft glow.
    ```
- **`icon_item_riders_helmet.png` (Frost-Runed Greathelm / Rider's Helmet)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 1 Col 7 horned hood/helm & `Enemies/206132` Viking helmet)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 headgear icon framing of `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_riders_helmet` (Frost-Runed Greathelm): dark #11171B square with 1px #3A3F47 border, showing a crested bone-and-steel knight/outrider helm (#B8B2A2, #4F565E) with a glowing signal-cyan (#00F0FF) visor slit and brass rivets (#FFC83D). avoid: blur, text, soft glow.
    ```

#### Body Armor Icons (`patched_vest`, `riot_jacket`, `plate_coat`)
- **`icon_item_patched_vest.png` (Tarnished Chain Hauberk / Patched Vest)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 4 coat & Row 4 Col 3 outfit)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 torso garment icon framing in `Items` Row 2 Col 4 of attached `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_patched_vest` (Tarnished Chain Hauberk): dark #11171B square with 1px #3A3F47 border, showing a rugged rust-leather work vest (#8B3A1E) reinforced with stitched slag-iron chainmail and scrap plates (#4F565E). avoid: blur, text, soft glow.
    ```
- **`icon_item_riot_jacket.png` (Grave-Forged Cuirass / Riot Jacket)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 4)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 armor icon framing of `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_riot_jacket` (Grave-Forged Cuirass): dark #11171B square with 1px #3A3F47 border, showing a dark bog-teal (#1F4D4A, #2E6962) and blackened steel brigandine breastplate reinforced with bone-white (#B8B2A2) rib-guards and shoulder pauldrons. avoid: blur, text, soft glow.
    ```
- **`icon_item_plate_coat.png` (Frost-Runed Brigandine / Plate Coat)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Super Items` Row 2 Col 4 ornate coat)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 prestige armor icon framing of `Super Items` in `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_plate_coat` (Frost-Runed Brigandine): dark #11171B square with 1px #3A3F47 border, showing a long inquisitor trench-coat (#26313A) plated with brass-trimmed (#D49B2A) and frost-cyan (#5CEBFF) boiler-steel chest plates. avoid: blur, text, soft glow.
    ```

#### Leg Armor Icons (`work_boots`, `courier_leggings`, `hydraulic_shins`)
- **`icon_item_work_boots.png` (Tarnished Iron Greaves / Work Boots)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Other` Row 1 Col 3 blue boot)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 boot icon silhouette in `Other` Row 1 Column 3 of attached `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_work_boots` (Tarnished Iron Greaves): dark #11171B square with 1px #3A3F47 border, showing a pair of heavy rust-leather boots (#612819, #8B3A1E) plated with slag-iron (#6E757A) steel-toe caps and shin buckles. avoid: blur, text, soft glow.
    ```
- **`icon_item_courier_leggings.png` (Grave-Forged Sabatons / Courier Leggings)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Other` Row 1 Col 3)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 footwear/leg-armor icon style of `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_courier_leggings` (Grave-Forged Sabatons): dark #11171B square with 1px #3A3F47 border, showing articulated shadow-teal (#1F4D4A, #2E6962) and dark-steel outrider leg-guards with knee braces and speed straps. avoid: blur, text, soft glow.
    ```
- **`icon_item_hydraulic_shins.png` (Frost-Runed Striders / Hydraulic Shins)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Other` Row 1 Col 3 winged/speed boot)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the speed-streaked boot icon in `Other` Row 1 Col 3 of `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_hydraulic_shins` (Frost-Runed Striders): dark #11171B square with 1px #3A3F47 border, showing masterwork brass-piston (#FFC83D) and signal-cyan (#00F0FF) rune-etched steel greaves with 3 crisp pixel speed-lines trailing behind the heel. avoid: blur, text, soft glow.
    ```

#### Alchemical Supply Icons (`gauze_roll`, `sugar_tin` + Extended Supplies)
- **`icon_item_gauze_roll.png` (Crimson Blood Vial / Boiled Gauze Roll)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 4 Col 8 adhesive bandage & Row 1 Col 3 bottle) + `529971 - Yuzuki Choco/Choco_Supplies.png`
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 medical item icon clarity of `Items` Row 4 Col 8 in `206883 - Item Icons.png` and `Choco_Supplies.png`. Generate a 32x32px item icon for `icon_item_gauze_roll`: dark #11171B square with 1px #3A3F47 border, showing a bone-white (#D9D2C3) sanctified bandage roll and stoppered crimson blood vial (#FF3B3B) marked with a crisp blood-red healer's cross stitch. avoid: blur, text, soft glow.
    ```
- **`icon_item_sugar_tin.png` (Ashen Soul Elixir / Pocket Sugar Tin)**:
  - **Reference**: `Items/206883 - Item Icons.png` (`Items` Row 2 Col 5 jar & Row 4 Col 4 bottle)
  - **Full GPT Image Prompt**:
    ```text
    16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 32x32 consumable container icon style in `206883 - Item Icons.png`. Generate a 32x32px item icon for `icon_item_sugar_tin`: dark #11171B square with 1px #3A3F47 border, showing a dented brass-and-rust pocket tin / crystal phial (#D49B2A, #8B3A1E) open to reveal glowing bone-white (#EFE9DA) and signal-cyan (#5CEBFF) stamina crystals. avoid: blur, text, soft glow.
    ```

---

## SECTION 11: UI FRAMES, BARS, MINIMAP, PICKUPS & TITLE KEY ART (`ui` & `key_art` Categories)

### `ui_panel.png` (9-Slice Gothic-Industrial Panel Frame)
- **Category**: `ui`
- **Frame Size**: `48x48` (1 frame(s), strip `48x48`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Dialogue Box`, `Inventory`, and `Pause Menu` 9-slice frames)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the clean 9-slice border thickness and corner ornament geometry of `Dialogue Box` and `Inventory` in attached `206965 - Game Menus and HUDs.png`. Generate a 48x48px 9-slice UI panel tile (`ui_panel`): 1px #0B0D10 outer border, 2px beveled slag-iron (#3A3F47) and dark rust-bronze (#612819) frame, 2x2px brass-gold (#FFC83D) rivets in all four corners, and a flat solid dark-soot (#11171B) center area suitable for 9-slice stretching. avoid: gradients, drop shadows, text, asymmetric patterns in the center.
  ```

### `ui_bar_hp.png` (HUD Health Bar Frame & Blood-Crimson Fill Mask)
- **Category**: `ui`
- **Frame Size**: `128x12` (2 frame(s), strip `256x12`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`HP Bar` top-left section)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the pixel bar frame and segmented bevel of `HP Bar` in attached `206965 - Game Menus and HUDs.png`. Generate a 2-frame horizontal UI strip (256x12px total, two 128x12px cells): Frame 1 (left 128x12) is the empty dark-iron bar housing (#0B0D10 border, #3A3F47 inner bevel, #11171B trough); Frame 2 (right 128x12) is the full HP bar filled with a blood-crimson (#FF3B3B) core, #8A1C24 bottom shadow row, and 1px #EFE9DA top specular highlight row. avoid: smooth gradients, blur, text.
  ```

### `ui_bar_stamina.png` (HUD Stamina Bar Frame & Signal-Cyan Fill Mask)
- **Category**: `ui`
- **Frame Size**: `128x12` (2 frame(s), strip `256x12`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`HP Bar` & `Exp Bar` sections)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the exact 2-frame 256x12px bar geometry of `ui_bar_hp.png` and `206965 - Game Menus and HUDs.png`. Generate a 2-frame horizontal UI strip (256x12px total, two 128x12px cells): Frame 1 empty dark-iron bar housing (#0B0D10, #3A3F47, #11171B); Frame 2 full Stamina bar filled with signal-cyan (#00F0FF) core, #088A9E bottom shadow row, and 1px #EFE9DA top highlight row. avoid: smooth gradients, blur, text.
  ```

### `ui_bar_xp.png` (HUD Experience Bar Frame & Brass-Gold Fill Mask)
- **Category**: `ui`
- **Frame Size**: `128x12` (2 frame(s), strip `256x12`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Exp Bar Frame`)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the exact 2-frame 256x12px bar geometry of `ui_bar_hp.png` and `Exp Bar Frame` in `206965 - Game Menus and HUDs.png`. Generate a 2-frame horizontal UI strip (256x12px total, two 128x12px cells): Frame 1 empty dark-iron bar housing (#0B0D10, #3A3F47, #11171B); Frame 2 full XP bar filled with brass-gold (#FFC83D) core, #946B22 bottom shadow row, and 1px #EFE9DA top highlight row. avoid: smooth gradients, blur, text.
  ```

### `ui_button.png` (3-State Interactive Metal Plate Button)
- **Category**: `ui`
- **Frame Size**: `96x24` (3 frame(s), strip `288x24`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Main Menu` / `Basic` / `Confirm 1` normal & hover button states)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the 3-state pixel menu button layout in `Basic Elements` of attached `206965 - Game Menus and HUDs.png`. Generate a 3-frame horizontal UI strip (288x24px total, three 96x24px button states with no text): Frame 1 Normal state (dark #1A2228 iron plate with #6E757A border and brass corner rivets); Frame 2 Hover state (warm #612819 rust-iron fill with bright 1px #00F0FF signal-cyan highlight border); Frame 3 Pressed state (inset #946B22 brass-gold plate shifted 1px down). avoid: text, letters, blur, gradients.
  ```

### `ui_minimap_frame.png` (Compass-Radar Minimap Bezel)
- **Category**: `ui`
- **Frame Size**: `96x96` (1 frame(s), strip `96x96`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206965 - Game Menus and HUDs.png` (`Pause Menu` / `Collab Menu` square frames)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing. REFERENCE-GUIDED INSTRUCTION: Match the square HUD frame border weight in `206965 - Game Menus and HUDs.png`. Generate a 96x96px UI minimap bezel frame (`ui_minimap_frame`): a 4px-thick riveted slag-iron (#3A3F47) and rust-bronze (#612819) square radar/compass frame with tiny brass cardinal tick-marks at N/S/E/W, and a completely flat solid #FF00FF magenta 88x88px transparent center cutout. avoid: drawing a map inside the center, gradients, blur, text.
  ```

### `ui_coin.png` (Salvage Gold Coin / Abyssal Sovereign Token)
- **Category**: `ui`
- **Frame Size**: `16x16` (1 frame(s), strip `16x16`, 1 fps, anchor `[8, 8]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206508 - Pickups.png` (`Holocoins` 8-frame spinning coin row)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`Other` coin icon)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match Frame 1 of `Holocoins` in attached `206508 - Pickups.png`. Generate a 16x16px sprite of `ui_coin`: a stamped brass-gold (#FFC83D, #D49B2A, #946B22) octagonal/round sovereign coin with a 2x2px #0B0D10 square hole in the center and a 1px #EFE9DA top-left glint, outlined in 1px #0B0D10. avoid: blur, anti-aliasing.
  ```

### `ui_cursor.png` (Targeting Crosshair Cursor)
- **Category**: `ui`
- **Frame Size**: `16x16` (1 frame(s), strip `16x16`, 1 fps, anchor `[8, 8]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`Other` Row 1 Col 4 & 5 crosshair/target icons) + `206965 - Game Menus and HUDs.png` (`Cursor 1`)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the pixel reticle clarity of `Other` Row 1 Column 5 in `206883 - Item Icons.png`. Generate a 16x16px targeting reticle sprite (`ui_cursor`): a crisp symmetrical pixel crosshair with signal-cyan (#00F0FF) outer ticks, a 2x2px bone-white (#EFE9DA) center dot, and a 1px #0B0D10 dark outline for contrast over any terrain. avoid: blur, anti-aliasing.
  ```

### `title_logo.png` (Game Title Logo Banner)
- **Category**: `ui`
- **Frame Size**: `360x64` (1 frame(s), strip `360x64`, 1 fps, anchor `[180, 32]`)
- **Primary Reference File(s)**: `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206964 - Title.png` (Top pixel logo typography & outline thickness)
- **Full GPT Image Prompt**:
  ```text
  16-bit era Japanese dark-fantasy action-RPG pixel art, crisp hard pixel edges, no anti-aliasing, flat solid #FF00FF magenta background. REFERENCE-GUIDED INSTRUCTION: Match the bold, chunky, hand-pixelled logo weight and heavy dark drop-shadow structure of attached `206964 - Title.png` without copying its text or pastel colors. Generate a 360x64px pixel-art game title logo reading `HELL'S ADVENT` (or `GRAVEL SKY` for legacy mode): chiseled gothic-industrial capital pixel lettering with a bone-white (#D9D2C3) top bevel, brass-gold (#FFC83D) horizontal stencil split across the middle, rust-crimson (#8B3A1E, #D16B38) lower face, and a thick 3px #0B0D10 soot drop shadow, centered on a flat #FF00FF magenta background. avoid: smooth vector fonts, anti-aliasing, soft glow.
  ```

### `title_key_art.png` (Main Menu Widescreen Pixel Key Art)
- **Category**: `key_art`
- **Frame Size**: `480x270` (1 frame(s), strip `480x270` upscaled 4× to `1920x1080` by `process-assets.mjs`, 1 fps, anchor `[0, 0]`)
- **Primary Reference File(s)**:
  - `tempartreference(DONOTCOMPLETELYCOPY)/Miscellaneous/206964 - Title.png` (`1248x799` title screen composition)
  - `tempartreference(DONOTCOMPLETELYCOPY)/Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png` (`Background` blood-moon sky & gothic silhouette)
- **Full GPT Image Prompt**:
  ```text
  16-bit and 32-bit era Japanese dark-fantasy action-RPG pixel art, hand-pixelled widescreen key art illustration, 48-color Hell's Advent master palette, crisp hard nearest-neighbor pixel edges, zero anti-aliasing, zero blur, 100% opaque. REFERENCE-GUIDED INSTRUCTION: Combine the epic panoramic title-screen staging of `206964 - Title.png` with the blood-moon gothic sky of `206852 - Stage 3 - Halloween Castle.png`. Generate a 480x270px widescreen pixel-art scene (`title_key_art`): on the left foreground, Sena Ibuki stands in heroic profile on a shattered stone-and-rebar overpass bridge, her bone-white scarf (#D9D2C3) and rust-red hair (#D16B38) blowing in the wind while her Duskrend katana gleams with a 1px signal-cyan (#00F0FF) edge; below in the mid-ground valley glows the warm brass-and-rust (#FFC83D, #8B3A1E) lantern bastion of Duskhollow Town / Kettle; towering in the center-right background against a soot-and-crimson (#0B0D10, #3B1C18, #612819) eclipsed blood-moon sky rises the monolithic gothic-industrial Abyssal Spire. avoid: text, logos, UI buttons, smooth digital painting, 3D render, soft airbrush gradients.
  ```

---

## Part 4: Quick Reference Lookup Table (`tempartreference(DONOTCOMPLETELYCOPY)` -> `HellsAdvent`)

| Hell's Advent Asset Group | Exact Reference File(s) in `tempartreference(DONOTCOMPLETELYCOPY)/` | Target Dimensions |
| :--- | :--- | :--- |
| **Sena Ibuki (`sena_*`)** | `Playable Characters - JP Gen 2/529969 - Nakiri Ayame/Ayame.png`, `Ayame_slash.png`, `Ayame_spiritslash.png`, `Ayame_Port.png`, `Ayame_Special.png` | `64x64` frames (`384x128` master sheet + 21 directional/action strips) & `96x96` portraits |
| **Rook Matsuda (`rook_*`)** | `Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta.png`, `Zeta_pistol.png`, `Zeta_BigBullet.png`, `204785 - Amelia Watson.png` | `64x64` frames (`384x128` master sheet + 21 directional/action strips) & `96x96` portraits |
| **Ines Calloway (`ines_*`)** | `Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/Ina.png`, `Ina__wheel.png`, `529968 - Murasaki Shion/Shion.png`, `Shion_Circle.png` | `64x64` frames (`384x128` master sheet + 21 directional/action strips) & `96x96` portraits |
| **Kaelen Vos (`kaelen_*`)** | `Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png`, `530011 - Shirogane Noel/Noel.png`, `530030 - Kiryu Coco/Coco.png` | `64x64` frames (`384x128` master sheet + 21 directional/action strips) & `96x96` portraits |
| **Vespera Locke (`vespera_*`)** | `Playable Characters - JP Gen 0/529818 - Roboco-san/Roboco.png`, `Roboco_electric.png`, `529784 - Ouro Kronii/Kronii.png` | `64x64` frames (`384x128` master sheet + 21 directional/action strips) & `96x96` portraits |
| **Common Enemies (`40x40`)** | `Enemies/206132 - Myth Enemies (EN Gen1).png`, `206133 - CouncilRyS Enemies.png`, `206134 - Gamers Enemies (JP).png`, `529823 - Haachama/Haachama_Spider.png`, `529825 - Yozora Mel/Mel_bat.png` | `40x40` frames × 5 = `200x40` strip |
| **Elite Enemies (`80x80`)** | `Enemies/206549 - Enemies (Miscellaneous).png`, `Bosses/206503 - Stage 4 Mini Boss (Udin).png`, `Enemies/206132 - Myth Enemies.png` | `80x80` frames × 7 = `560x80` strip |
| **Fusion & King Bosses (`96x96` / `128x128`)** | `Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`, `206497 - Stage 2 Mini Boss (Mikodanye).png`, `206503 - Stage 4 Mini Boss (Udin).png` | `96x96` × 7 = `672x96` (10× Fusion) & `128x128` × 7 = `896x128` (5× King) |
| **Bloodline Bosses (`the_foreman`, `big_axle`, `mother_sump`, `the_long_dry` + Floors 1–5)** | `Bosses/206501 - Stage 3 Mini Boss (Shubangelion).png`, `206502 - Stage 3 Hard Boss (Myth or Treat).png`, `206500 - Stage 3 Boss (Hachama).png`, `206495 - Stage 1 Mini Boss (Fubuzilla).png` | `128x128` (Warden), `160x160` (Executioner), `192x192`–`256x192` (Overlord) × 9 frames |
| **Combat VFX (`fx_*`)** | `Miscellaneous/206506 - Effects.png`, `Items/206879 - Weapons.png`, `Items/206880 - Weapons (Collabs).png` | `128x128`, `160x48`, `256x256`, `192x192`, `480x120` |
| **World Tiles (`tile_*`) & Props (`prop_*`)** | `Levels/206852 - Stage 3 - Halloween Castle - Stage 3 Hard - Halloween Castle (Myth).png`, `206142 - Stage 1.png`, `206841 - Stage 1 Hard (Night).png`, `206853 - Stage 4.png`, `Holo House/206120..206127` | `16x16` tiles & `32x32`–`160x120` props/buildings |
| **NPCs (`ume.png` & Duskhollow Cast)** | `Shop/206131 - Shop Menu.png`, `Holo House/206141 - NPCs.png`, `Holo House/206116 - Cooking.png` | `64x64` frames × 2 = `128x64` strip & `96x96` portraits |
| **Skill, Status & Item Icons (`icon_*`)** | `Items/206883 - Item Icons.png`, Character `_Perk1..3.png`, `_Weapon.png`, `_Special.png` | `32x32` framed square icons & `16x16` HUD status badges |
| **HUD, Menus & Title (`ui_*`, `title_*`)** | `Miscellaneous/206965 - Game Menus and HUDs.png`, `206964 - Title.png`, `206508 - Pickups.png`, `206962 - Holozon Box.png` | `48x48`, `128x12`, `96x24`, `96x96`, `16x16`, `360x64`, `480x270` |

---

## SECTION 12: FULL 21-STRIP DIRECTIONAL & COMBAT ANIMATIONS FOR ROOK, INES, KAELEN & VESPERA (Plus 15 Specialization Costume Sheets)

To give **Rook Matsuda (`rook`)**, **Ines Calloway (`ines`)**, **Kaelen Vos (`kaelen`)**, and **Vespera Locke (`vespera`)** 100% animation parity with **Sena Ibuki (`sena`)**, each character uses the exact same **21-strip directional & combat animation architecture** (`64x64` cells, feet anchored at `[32, 60]`, left-facing mirrored at runtime from `_side`):

### 12.1 Universal 21-Strip Animation Specification (Applies to `sena`, `rook`, `ines`, `kaelen`, `vespera`)

| Strip Suffix | Dimensions | Frames | FPS | Anchor | Gameplay Trigger & Animation Keyframe Breakdown |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`<char>_turnaround.png`** | `256x64` | 4 | 2 | `[32, 60]` | Character model sheet: Frame 1 Front/Down, Frame 2 Back/Up, Frame 3 Left Side, Frame 4 Right Side. |
| **`<char>_idle_down.png`** | `128x64` | 2 | 4 | `[32, 60]` | Down-facing combat ready idle: Frame 1 neutral stance; Frame 2 1px torso/head breathing bob + secondary hair/cloak shift. |
| **`<char>_idle_up.png`** | `128x64` | 2 | 4 | `[32, 60]` | Up-facing (back view) idle: shows dorsal weapon/reliquary/boiler/halo details with 1px breathing bob. |
| **`<char>_idle_side.png`** | `128x64` | 2 | 4 | `[32, 60]` | Right-facing profile idle (mirrored for left): 1px breathing bob, signature weapon poised in front/side hand. |
| **`<char>_run_down.png`** | `384x64` | 6 | 12 | `[32, 60]` | Down-facing 6-frame run cycle: alternating boot strides (`[-3, -1, 1, 3, 1, -1]`), cape/coat flare, 1px vertical bounce. |
| **`<char>_run_up.png`** | `384x64` | 6 | 12 | `[32, 60]` | Up-facing 6-frame run cycle: back-view footwork, cloak/scarf streaming toward camera, dorsal pack bobbing. |
| **`<char>_run_side.png`** | `384x64` | 6 | 12 | `[32, 60]` | Right-facing 6-frame sprint cycle: 1px forward torso lean, full 6-step stride, trailing cloak/scarf/hair. |
| **`<char>_attack1_down.png`** | `192x64` | 3 | 14 | `[32, 60]` | Combo Hit 1 (Down): Frame 1 windup/draw; Frame 2 active weapon discharge/slash smear; Frame 3 recovery. |
| **`<char>_attack2_down.png`** | `192x64` | 3 | 14 | `[32, 60]` | Combo Hit 2 (Down): Frame 1 reverse/secondary windup; Frame 2 secondary arc/volley smear; Frame 3 recovery. |
| **`<char>_attack3_down.png`** | `192x64` | 3 | 12 | `[32, 60]` | Combo Hit 3 Finisher (Down): Frame 1 heavy charge; Frame 2 oversized finisher cleave/blast; Frame 3 recovery. |
| **`<char>_attack1_up.png`** | `192x64` | 3 | 14 | `[32, 60]` | Combo Hit 1 (Up / Back View): 3-frame upward attack arc. |
| **`<char>_attack2_up.png`** | `192x64` | 3 | 14 | `[32, 60]` | Combo Hit 2 (Up / Back View): 3-frame reverse upward attack arc. |
| **`<char>_attack3_up.png`** | `192x64` | 3 | 12 | `[32, 60]` | Combo Hit 3 Finisher (Up / Back View): 3-frame heavy upward finisher. |
| **`<char>_attack1_side.png`** | `192x64` | 3 | 14 | `[32, 60]` | Combo Hit 1 (Right Side, mirrored for Left): Frame 1 coil; Frame 2 forward strike/shot flash; Frame 3 follow-through. |
| **`<char>_attack2_side.png`** | `192x64` | 3 | 14 | `[32, 60]` | Combo Hit 2 (Right Side): Frame 1 low/reverse coil; Frame 2 rising arc/rapid shot; Frame 3 high guard. |
| **`<char>_attack3_side.png`** | `192x64` | 3 | 12 | `[32, 60]` | Combo Hit 3 Finisher (Right Side): Frame 1 full windup; Frame 2 heavy lunging finisher; Frame 3 recovery. |
| **`<char>_hurt_down.png`** | `64x64` | 1 | 8 | `[32, 60]` | Down-facing impact flinch: wincing eyes, torso knocked back 2px, weapon raised defensively. |
| **`<char>_hurt_up.png`** | `64x64` | 1 | 8 | `[32, 60]` | Up-facing impact flinch: shoulders jolted, cloak/hair flaring outward. |
| **`<char>_hurt_side.png`** | `64x64` | 1 | 8 | `[32, 60]` | Side-facing impact recoil: leaning back 2px from hit, grit teeth. |
| **`<char>_dodge_side.png`** | `256x64` | 4 | 16 | `[32, 60]` | 4-frame evasive roll/dash: Frame 1 crouch push-off; Frames 2–3 class-colored dash/roll blur; Frame 4 knee-slide recovery. |
| **`<char>_death_side.png`** | `256x64` | 4 | 6 | `[32, 60]` | 4-frame defeat sequence: Frame 1 stagger; Frame 2 drop to knees; Frame 3 weapon planted/dropped; Frame 4 slumped kneel. |

---

### 12.2 Rook Matsuda (`rook` — Inquisitor Marksman) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - Holoh3ro (ID Gen 3)/530074 - Vestia Zeta/Zeta.png`, `Zeta_pistol.png`, `Zeta_Flash.png`, `530068 - Kureiji Ollie/Ollie_chargerifle1.png`, `public/assets/aistudio/image_c95e226e.png`
- **Character Design Lock**: 2-head chibi witch-hunter marksman in slate-olive inquisitor duster coat (`#26313A` / `#3A4A24`), wide-brimmed dark leather highwayman hat with brass buckle (`#FFC83D`), brass targeting monocle over right amber-gold eye, silver-stake bandolier across chest, wielding the **Hexbane Arbalest** (heavy repeating iron crossbow with curved brass leaf-spring prod and glowing `#FFC83D` / `#EFE9DA` silver bolts).
- **All 21 Strip Files & Prompts**:
  1. **`rook_turnaround.png`** (`256x64`, 4 frames):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match 2-head chibi anatomy of `Zeta.png` and `image_c95e226e.png`. Generate a 4-frame horizontal turnaround strip (256x64px, four 64x64px cells: Down, Up, Left, Right) of Rook Matsuda, Inquisitor Marksman: ash-silver hair under a pointed dark highwayman hat with brass buckle (#FFC83D), brass monocle over one amber eye, weathered slate-olive duster coat with silver-stake bandolier, holding the Hexbane Arbalest repeating crossbow with brass bow prod.
     ```
  2. **`rook_idle_down.png`**, **`rook_idle_up.png`**, **`rook_idle_side.png`** (`128x64`, 2 frames each, 4 fps):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match Row 1 idle frames of `Zeta.png`. Generate a 2-frame horizontal strip (128x64px, two 64x64px cells) of Rook Matsuda in [down-facing / up-facing back / right-side profile] combat idle stance: Frame 1 poised holding Hexbane Arbalest at hip level with brass prod glinting; Frame 2 1px breathing bob with duster coat hem and hat brim shifting 1px.
     ```
  3. **`rook_run_down.png`**, **`rook_run_up.png`**, **`rook_run_side.png`** (`384x64`, 6 frames each, 12 fps):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match Row 2 6-frame run cycle of `Zeta.png`. Generate a 6-frame horizontal strip (384x64px, six 64x64px cells) of Rook Matsuda running in [down-facing / up-facing back / right-side profile] view: 6-frame boot stride, inquisitor duster coat tail flaring, one hand steadying his highwayman hat brim while the other carries the Hexbane Arbalest.
     ```
  4. **`rook_attack1_down.png`**, **`rook_attack1_up.png`**, **`rook_attack1_side.png`** (`192x64`, 3 frames each, 14 fps — *Snap-Shot Bolt*):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match `Zeta.png` and `Zeta_Flash.png`. Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Rook Matsuda performing Attack 1 (Snap-Shot Silver Bolt) in [down / up / right-side] view: Frame 1 raising Hexbane Arbalest to eye level with brass monocle glint; Frame 2 firing a consecrated silver bolt with a crisp brass-gold (#FFC83D) and bone-white (#EFE9DA) muzzle cross-flash and recoil; Frame 3 lever-cocking recovery.
     ```
  5. **`rook_attack2_down.png`**, **`rook_attack2_up.png`**, **`rook_attack2_side.png`** (`192x64`, 3 frames each, 14 fps — *Twin Repeater Volley*):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match `Zeta.png` and `Zeta_pistol.png`. Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Rook Matsuda performing Attack 2 (Twin Repeater Volley) in [down / up / right-side] view: Frame 1 low braced stance; Frame 2 rapid double-bolt discharge with twin staggered brass-gold (#FFC83D) muzzle streaks; Frame 3 crisp reload snap.
     ```
  6. **`rook_attack3_down.png`**, **`rook_attack3_up.png`**, **`rook_attack3_side.png`** (`192x64`, 3 frames each, 12 fps — *Heavy Piercing Stake Blast*):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match `Ollie_chargerifle1.png` and `Zeta_BigBullet.png`. Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Rook Matsuda performing Attack 3 Finisher (Heavy Piercing Stake Blast) in [down / up / right-side] view: Frame 1 kneeling/bracing heavy arbalest as brass prod glows bright #FFE478; Frame 2 firing a massive armor-piercing silver stake with a wide cone of brass-gold shock-sparks and 2px knockback slide; Frame 3 venting smoke recovery.
     ```
  7. **`rook_hurt_down.png`**, **`rook_hurt_up.png`**, **`rook_hurt_side.png`** (`64x64`, 1 frame each):
     ```text
     [Global Style Lock] Generate a single 64x64px frame of Rook Matsuda in [down / up / right-side] hurt recoil pose: knocked back 2px, holding onto his highwayman hat brim, brass monocle sparking, Hexbane Arbalest held across torso.
     ```
  8. **`rook_dodge_side.png`** (`256x64`, 4 frames, 16 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Rook Matsuda performing a right-facing combat tumble/grapple-roll: Frame 1 low dive push-off; Frames 2–3 tucked duster-coat roll with brass-gold (#FFC83D) shell casings and dust streak; Frame 4 one-knee aiming slide recovery.
     ```
  9. **`rook_death_side.png`** (`256x64`, 4 frames, 6 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Rook Matsuda's defeat sequence in side profile: Frame 1 staggering back; Frame 2 dropping to one knee as his highwayman hat tips forward; Frame 3 resting the Hexbane Arbalest stock on the stones; Frame 4 slumped forward in shadow with hat brim covering his eyes.
     ```

---

### 12.3 Ines Calloway (`ines` — Ossuary Necromancer / Magnetist) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - Myth (EN Gen 1)/529763 - Ninomae Inanis/Ina.png`, `Ina__wheel.png`, `529968 - Murasaki Shion/Shion.png`, `Shion_Circle.png`, `public/assets/aistudio/image_c95e226e.png`
- **Character Design Lock**: 2-head chibi ossuary necromancer & industrial magnetist with bone-white & ebon twin-locks (`#D9D2C3` / `#1A2228`), skull hairpins, emerald-verdigris anime eyes (`#4FD6A0`), bone rib-corset over soot-black robes, dorsal bone-reliquary censer emitting verdigris soulfire on her back, wielding the **Gravelord Scepter** (skull-topped bone staff with glowing verdigris `#4FD6A0` core) and orbiting bone/iron shards.
- **All 21 Strip Files & Prompts**:
  1. **`ines_turnaround.png`** (`256x64`, 4 frames):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match 2-head chibi proportions of `Ina.png` and `Shion.png`. Generate a 4-frame horizontal turnaround strip (256x64px, four 64x64px cells: Down, Up, Left, Right) of Ines Calloway, Ossuary Necromancer: bone-white twin locks with skull hairpins, emerald-verdigris (#4FD6A0) eyes, bone rib-corset over dark catacomb robes, dorsal bone reliquary censer with green soulfire on her back, holding the skull-crowned Gravelord Scepter with 3 tiny bone shards hovering around her waist.
     ```
  2. **`ines_idle_down.png`**, **`ines_idle_up.png`**, **`ines_idle_side.png`** (`128x64`, 2 frames each, 4 fps):
     ```text
     [Global Style Lock] Generate a 2-frame horizontal strip (128x64px, two 64x64px cells) of Ines Calloway in [down / up / right-side] idle stance: 1px breathing bob, dorsal reliquary censer flickering with verdigris (#4FD6A0) soulfire, 3 bone-and-iron shards orbiting 2px around her waist.
     ```
  3. **`ines_run_down.png`**, **`ines_run_up.png`**, **`ines_run_side.png`** (`384x64`, 6 frames each, 12 fps):
     ```text
     [Global Style Lock] Generate a 6-frame horizontal strip (384x64px, six 64x64px cells) of Ines Calloway in a [down / up / right-side] 6-frame glide-run cycle: bone-white twin locks and dark catacomb mantle billowing, Gravelord Scepter held forward, verdigris soulfire trail streaming from her dorsal reliquary.
     ```
  4. **`ines_attack1_down.png`**, **`ines_attack1_up.png`**, **`ines_attack1_side.png`** (`192x64`, 3 frames each, 14 fps — *Scepter Shard Lash*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Ines Calloway performing Attack 1 (Scepter Shard Lash) in [down / up / right-side] view: Frame 1 drawing Gravelord Scepter back as skull eyes flare #4FD6A0; Frame 2 sweeping scepter forward, hurling a crescent wave of bone shards and verdigris magnetic arcs; Frame 3 poised recovery.
     ```
  5. **`ines_attack2_down.png`**, **`ines_attack2_up.png`**, **`ines_attack2_side.png`** (`192x64`, 3 frames each, 14 fps — *Polarity Claw Pulse*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Ines Calloway performing Attack 2 (Polarity Claw Pulse) in [down / up / right-side] view: Frame 1 left hand raised with glowing verdigris sigil; Frame 2 spectral bone-claw & magnetic ring erupting outward in #4FD6A0 and #EFE9DA; Frame 3 recovery.
     ```
  6. **`ines_attack3_down.png`**, **`ines_attack3_up.png`**, **`ines_attack3_side.png`** (`192x64`, 3 frames each, 12 fps — *Ossuary Monolith Crush*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Ines Calloway performing Attack 3 Finisher (Ossuary Monolith Crush) in [down / up / right-side] view: Frame 1 raising both scepter and hand overhead as orbiting shards converge; Frame 2 slamming the scepter down to unleash a massive verdigris (#4FD6A0) and bone-white skull shockwave; Frame 3 recovery.
     ```
  7. **`ines_hurt_down.png`**, **`ines_hurt_up.png`**, **`ines_hurt_side.png`** (`64x64`, 1 frame each):
     ```text
     [Global Style Lock] Generate a single 64x64px frame of Ines Calloway in [down / up / right-side] hurt recoil pose: wincing, twin bone-white locks whipped back, verdigris sparks scattering from her dorsal reliquary.
     ```
  8. **`ines_dodge_side.png`** (`256x64`, 4 frames, 16 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Ines Calloway performing a right-facing necrotic mist-step dodge: Frame 1 dissolving into bone shards; Frames 2–3 low swirling vortex of bone-white (#D9D2C3) and verdigris (#4FD6A0) spirit-mist; Frame 4 reforming into poised caster stance.
     ```
  9. **`ines_death_side.png`** (`256x64`, 4 frames, 6 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Ines Calloway's defeat sequence in side profile: Frame 1 staggering; Frame 2 dropping to knees as orbiting shards fall inert; Frame 3 Gravelord Scepter clattering to the floor as its green glow fades; Frame 4 slumped in her dark mantle.
     ```

---

### 12.4 Kaelen Vos (`kaelen` — Hellfire Dragoon / Thermo-Lancer) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - Myth (EN Gen 1)/204696 - Takanashi Kiara.png`, `530011 - Shirogane Noel/Noel.png`, `530030 - Kiryu Coco/Coco.png`, `public/assets/aistudio/image_c95e226e.png`
- **Character Design Lock**: 2-head chibi hellfire dragoon in dark slag-and-rust dragonplate (`#2A353D` / `#8B3A1E`), curved brass dragon-horns on brow (`#FFC83D`), flame-tipped spiky rust hair, molten ember-orange anime eyes (`#FF5A26`), twin brass boiler exhaust stacks on his back venting ember flames, wielding the **Cinderlance** (heavy serrated obsidian-and-brass dragon-spear with a molten `#FF5A26` furnace tip).
- **All 21 Strip Files & Prompts**:
  1. **`kaelen_turnaround.png`** (`256x64`, 4 frames):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match armoured 2-head chibi proportions of `Noel.png` and `204696 - Takanashi Kiara.png`. Generate a 4-frame horizontal turnaround strip (256x64px, four 64x64px cells: Down, Up, Left, Right) of Kaelen Vos, Hellfire Dragoon: spiky rust-red hair with ember tips, curved brass dragon-horn circlet (#FFC83D), molten ember-orange (#FF5A26) eyes, dark obsidian dragonplate with glowing chest core, twin dorsal brass boiler vents on his back, wielding the serrated Cinderlance great-spear.
     ```
  2. **`kaelen_idle_down.png`**, **`kaelen_idle_up.png`**, **`kaelen_idle_side.png`** (`128x64`, 2 frames each, 4 fps):
     ```text
     [Global Style Lock] Generate a 2-frame horizontal strip (128x64px, two 64x64px cells) of Kaelen Vos in [down / up / right-side] idle stance: 1px heavy plate breathing bob, dorsal brass boiler stacks puffing 2px ember-orange (#FF5A26) sparks, Cinderlance held ready.
     ```
  3. **`kaelen_run_down.png`**, **`kaelen_run_up.png`**, **`kaelen_run_side.png`** (`384x64`, 6 frames each, 12 fps):
     ```text
     [Global Style Lock] Generate a 6-frame horizontal strip (384x64px, six 64x64px cells) of Kaelen Vos in a [down / up / right-side] 6-frame heavy dragoon run cycle: armored greaves pounding, tattered rust cape flaring, dorsal boiler vents jetting ember sparks, Cinderlance couched at his side.
     ```
  4. **`kaelen_attack1_down.png`**, **`kaelen_attack1_up.png`**, **`kaelen_attack1_side.png`** (`192x64`, 3 frames each, 14 fps — *Cinderlance Wide Flame Sweep*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Kaelen Vos performing Attack 1 (Wide Cinderlance Flame Sweep) in [down / up / right-side] view: Frame 1 drawing Cinderlance back as vents flare; Frame 2 wide 160-degree horizontal spear sweep trailing a crescent of ember-orange (#FF5A26) and brass-yellow (#FFE478) dragonfire; Frame 3 recovery.
     ```
  5. **`kaelen_attack2_down.png`**, **`kaelen_attack2_up.png`**, **`kaelen_attack2_side.png`** (`192x64`, 3 frames each, 14 fps — *Reverse Crucible Slash*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Kaelen Vos performing Attack 2 (Reverse Crucible Slash) in [down / up / right-side] view: Frame 1 coiled reverse grip; Frame 2 reverse backhand lance cleave erupting with molten slag sparks (#FF5A26, #D16B38); Frame 3 braced recovery.
     ```
  6. **`kaelen_attack3_down.png`**, **`kaelen_attack3_up.png`**, **`kaelen_attack3_side.png`** (`192x64`, 3 frames each, 12 fps — *Hell-Drake Drill Thrust*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Kaelen Vos performing Attack 3 Finisher (Hell-Drake Jet Thrust) in [down / up / right-side] view: Frame 1 dorsal boilers roaring at max pressure; Frame 2 explosive two-handed Cinderlance thrust projecting a 24px cone of white-hot (#EFE9DA) and ember-orange (#FF5A26) dragonfire; Frame 3 steam-venting recovery.
     ```
  7. **`kaelen_hurt_down.png`**, **`kaelen_hurt_up.png`**, **`kaelen_hurt_side.png`** (`64x64`, 1 frame each):
     ```text
     [Global Style Lock] Generate a single 64x64px frame of Kaelen Vos in [down / up / right-side] hurt recoil pose: braced behind Cinderlance shaft, ember sparks venting from dorsal stacks, grit teeth.
     ```
  8. **`kaelen_dodge_side.png`** (`256x64`, 4 frames, 16 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Kaelen Vos performing a right-facing thruster-dash dodge: Frame 1 low crouched ignition; Frames 2–3 jet-propelled horizontal dash wreathed in ember-orange (#FF5A26) and brass (#FFC83D) thruster flames; Frame 4 heavy armored boot slide recovery.
     ```
  9. **`kaelen_death_side.png`** (`256x64`, 4 frames, 6 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Kaelen Vos's defeat sequence in side profile: Frame 1 staggering as boiler vents sputter dark smoke; Frame 2 dropping to one knee; Frame 3 planting Cinderlance upright into the ground as its ember core dims; Frame 4 bowed head resting against the lance shaft.
     ```

---

### 12.5 Vespera Locke (`vespera` — Eldritch Soulbinder / Signal Artificer) Full 21-Strip Prompts
- **Primary Reference File(s)**: `Playable Characters - JP Gen 0/529818 - Roboco-san/Roboco.png`, `Roboco_electric.png`, `529784 - Ouro Kronii/Kronii.png`, `public/assets/aistudio/image_c95e226e.png`
- **Character Design Lock**: 2-head chibi eldritch soulbinder & arc-artificer with starlight-silver hair (`#D9D2C3`), brass-and-volt star tiara (`#FFC83D` / `#C9F24B`), astral-violet/volt anime eyes, midnight sanctum cloak with twin glowing volt-green (`#C9F24B`) runic stoles, a floating starforged brass **Astral Halo Ring** behind her shoulders, and an **Astral Conduit Whip / Levitating Grimoire** with hovering wisp-skulls.
- **All 21 Strip Files & Prompts**:
  1. **`vespera_turnaround.png`** (`256x64`, 4 frames):
     ```text
     [Global Style Lock] REFERENCE-GUIDED INSTRUCTION: Match 2-head chibi proportions and floating halo geometry of `Kronii.png` and `Roboco.png`. Generate a 4-frame horizontal turnaround strip (256x64px, four 64x64px cells: Down, Up, Left, Right) of Vespera Locke, Eldritch Soulbinder: long starlight-silver hair (#D9D2C3), brass star tiara with volt-green (#C9F24B) gem, midnight sanctum cloak with volt runic stoles, floating brass Astral Halo Ring behind her shoulders studded with 3 volt-green nodes, and an Astral Conduit Whip & levitating Grimoire.
     ```
  2. **`vespera_idle_down.png`**, **`vespera_idle_up.png`**, **`vespera_idle_side.png`** (`128x64`, 2 frames each, 4 fps):
     ```text
     [Global Style Lock] Generate a 2-frame horizontal strip (128x64px, two 64x64px cells) of Vespera Locke in [down / up / right-side] idle stance: 1px breathing bob, floating brass Astral Halo Ring hovering 1px up/down behind her shoulders with volt-green (#C9F24B) sparks.
     ```
  3. **`vespera_run_down.png`**, **`vespera_run_up.png`**, **`vespera_run_side.png`** (`384x64`, 6 frames each, 12 fps):
     ```text
     [Global Style Lock] Generate a 6-frame horizontal strip (384x64px, six 64x64px cells) of Vespera Locke in a [down / up / right-side] 6-frame run cycle: starlight-silver hair and midnight sanctum cloak flowing, Astral Halo Ring rotating slightly behind her shoulders, volt-green (#C9F24B) arc sparks trailing her boots.
     ```
  4. **`vespera_attack1_down.png`**, **`vespera_attack1_up.png`**, **`vespera_attack1_side.png`** (`192x64`, 3 frames each, 14 fps — *Astral Conduit Whip Lash*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Vespera Locke performing Attack 1 (Astral Conduit Whip Lash) in [down / up / right-side] view: Frame 1 Halo ring flaring volt-green (#C9F24B); Frame 2 snapping a jagged bolt-whip of volt-green (#C9F24B) and bone-white (#EFE9DA) lightning forward; Frame 3 coil recovery.
     ```
  5. **`vespera_attack2_down.png`**, **`vespera_attack2_up.png`**, **`vespera_attack2_side.png`** (`192x64`, 3 frames each, 14 fps — *Twin Halo Arc Discharge*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Vespera Locke performing Attack 2 (Twin Halo Arc Discharge) in [down / up / right-side] view: Frame 1 open grimoire page glowing; Frame 2 twin intersecting arcs of volt-green (#C9F24B) and signal-cyan (#00F0FF) lightning firing from her Astral Halo; Frame 3 recovery.
     ```
  6. **`vespera_attack3_down.png`**, **`vespera_attack3_up.png`**, **`vespera_attack3_side.png`** (`192x64`, 3 frames each, 12 fps — *Seraphic Overcharge Nova*):
     ```text
     [Global Style Lock] Generate a 3-frame horizontal strip (192x64px, three 64x64px cells) of Vespera Locke performing Attack 3 Finisher (Seraphic Overcharge Nova) in [down / up / right-side] view: Frame 1 levitating 2px as her Astral Halo expands; Frame 2 unleashing a wide multi-pronged volt-green (#C9F24B) and brass-gold (#FFC83D) lightningburst; Frame 3 landing recovery.
     ```
  7. **`vespera_hurt_down.png`**, **`vespera_hurt_up.png`**, **`vespera_hurt_side.png`** (`64x64`, 1 frame each):
     ```text
     [Global Style Lock] Generate a single 64x64px frame of Vespera Locke in [down / up / right-side] hurt recoil pose: knocked back 2px, Astral Halo Ring tilted and sparking volt-green (#C9F24B), silver hair flaring.
     ```
  8. **`vespera_dodge_side.png`** (`256x64`, 4 frames, 16 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Vespera Locke performing a right-facing astral phase-blink dodge: Frame 1 stepping into a volt-green (#C9F24B) geometric ring; Frames 2–3 high-voltage lightning ball & starlight afterimage streak; Frame 4 emerging from an arrival ring.
     ```
  9. **`vespera_death_side.png`** (`256x64`, 4 frames, 6 fps):
     ```text
     [Global Style Lock] Generate a 4-frame horizontal strip (256x64px, four 64x64px cells) of Vespera Locke's defeat sequence in side profile: Frame 1 staggering; Frame 2 dropping to her knees as her Astral Halo Ring Powers down; Frame 3 the brass halo ring settling onto the ground around her; Frame 4 slumped gently with closed eyes.
     ```

---

### 12.6 All 15 Specialization Costume Sprite Sheets (`384x128` 6×2 Grid: Row 1 = 4 Idle, Row 2 = 6 Run)
*(Reference: Alternate outfits `_O1.png`, `_O2.png`, `_O3.png` inside `tempartreference(DONOTCOMPLETELYCOPY)/Playable Characters - .../`)*

| Spec Sheet ID | Character & Specialization | Visual Costume & Weapon Transformation (`384x128` Chibi Sheet) |
| :--- | :--- | :--- |
| **`sena_spec_phantom_edge_sheet.png`** | Sena — **Phantom Edge** | Sleeveless hooded assassin shroud, twin spectral phase-knives (`Anya_keris.png` ref) glowing `#00F0FF`, afterimage scarf tails. |
| **`sena_spec_rift_breaker_sheet.png`** | Sena — **Rift Breaker** | Heavy hydraulic siege gauntlets (`Kaela.png` / `Korone.png` ref) with brass pistons `#FFC83D` and riveted shoulder pauldrons. |
| **`sena_spec_pulse_dancer_sheet.png`** | Sena — **Pulse Dancer** | Flowing electro-silk battle tunic with twin conductive volt-cyan (`#00F0FF` / `#C9F24B`) ribbon hoops orbiting her wrists. |
| **`rook_spec_rail_hunter_sheet.png`** | Rook — **Rail Hunter** | Long camou-slate sniper cloak, multi-lens brass rangefinder visor, oversized tethered Coil Harpoon Rifle (`Ollie_chargerifle1.png` ref). |
| **`rook_spec_siege_gunner_sheet.png`** | Rook — **Siege Gunner** | Heavy blast-apron and artillery pauldron rig, carrying a drum-fed Mortar Bombard Cannon and dorsal shell rack (`Pekora.png` ref). |
| **`rook_spec_circuit_warden_sheet.png`** | Rook — **Circuit Warden** | Copper-wired combat engineer trench coat, dorsal pylon dispenser pack, and short-barrel Arc-Tool carbine (`Roboco.png` ref). |
| **`ines_spec_magnet_crusher_sheet.png`** | Ines — **Magnet Crusher** | Heavy iron-plated grav-vest, oversized twin horseshoe-magnet crushing gauntlets, floating compressed iron sphere (`Sana.png` ref). |
| **`ines_spec_scrapstorm_sheet.png`** | Ines — **Scrapstorm** | Wind-swept shroud surrounded by a permanent whirling ring of 8 razor bone-and-steel micro-blades (`Ina__wheel.png` ref). |
| **`ines_spec_polarity_breaker_sheet.png`** | Ines — **Polarity Breaker** | Asymmetrical split coat (left side signal-cyan `+`, right side blood-crimson `-`), dual electromagnetic pulse tonfas. |
| **`kaelen_spec_cinder_corsair_sheet.png`** | Kaelen — **Cinder Corsair** | Winged twin-thruster jetpack on back, aviator heat-visor, wielding paired curved Combustion Cutters (`204696 - Takanashi Kiara.png` ref). |
| **`kaelen_spec_crucible_architect_sheet.png`** | Kaelen — **Crucible Architect** | Master foundry apron-plate, giant molten Crucible Stamp-Glove on right arm and forge hammer on left (`Kaela_hammer.png` ref). |
| **`kaelen_spec_cryo_saboteur_sheet.png`** | Kaelen — **Cryo Saboteur** | Frost-rimmed chemical trench coat, twin dorsal sub-zero coolant tanks (`#7CE8FF`), dual cryo-injector gauntlets. |
| **`vespera_spec_volt_reaver_sheet.png`** | Vespera — **Volt Reaver** | Armored storm-duelist coat, crackling volt-green (`#C9F24B`) shoulder coils, wielding a massive Electrified Heavy Cleaver (`Suisei_axswing.png` ref). |
| **`vespera_spec_iron_puppeteer_sheet.png`** | Vespera — **Iron Puppeteer** | Brass-and-wire control harness on both hands with glowing tether cables linked to a miniature floating Iron Automaton Skull. |
| **`vespera_spec_storm_cartographer_sheet.png`** | Vespera — **Storm Cartographer** | Star-charted astromancer mantle, Conductive Weather Baton in hand, and a miniature thundercloud halo above her head (`Kobo.png` ref). |

---

## SECTION 13: ALL REMAINING CHARACTER EXPRESSION PORTRAITS (`96x96`), ULTIMATE CUT-INS (`480x120`) & NPC PORTRAITS (`96x96`)

### 13.1 Companion Playable Character Expression Portraits (`96x96` — 16 Files)
- **Primary Reference File(s)**: `public/assets/characters/sheet_combined_272x208_4x.png` + `530074 - Vestia Zeta/Zeta_Port.png` + `529763 - Ninomae Inanis/Ina_Portrait.png`
- **Rook Matsuda (`rook`)**:
  - **`rook_neutral.png`**: Calm, sharp-eyed inquisitor marksman bust portrait (`96x96`), pointed highwayman hat with brass buckle, brass targeting monocle over right amber-gold eye, silver-stake bandolier, Hexbane Arbalest stock behind shoulder.
  - **`rook_hurt.png`**: Battle-damaged wince, cracked monocle lens sparking brass, hat brim nicked, grit teeth, soot smudge on cheek.
  - **`rook_determined.png`**: Focused sniper lock-on expression, monocle crosshair glowing `#FFC83D`, confident smirk, raising Hexbane Arbalest.
  - **`rook_ultimate.png`**: Unleashing *Judgement Silver Spear*: amber-gold eye and brass monocle blazing `#FFE478`, solar-silver energy wisps rising around his hat brim.
- **Ines Calloway (`ines`)**:
  - **`ines_neutral.png`**: Composed gothic-industrial necromancer bust portrait (`96x96`), bone-white & ebon twin-locks with skull hairpins, emerald-verdigris (`#4FD6A0`) eyes, bone rib-corset, dorsal reliquary censer glowing behind shoulder.
  - **`ines_hurt.png`**: Wincing expression, bone hairpin cracked, verdigris sparks leaking from reliquary collar.
  - **`ines_determined.png`**: Fierce occult chant expression, orbiting bone shards floating past her cheeks, Gravelord Scepter skull glowing bright `#4FD6A0`.
  - **`ines_ultimate.png`**: Unleashing *Catacomb Bone-Tempest*: eyes blazing pure emerald-verdigris (`#4FD6A0`), bone-white hair levitating upward in a necrotic vortex.
- **Kaelen Vos (`kaelen`)**:
  - **`kaelen_neutral.png`**: Stoic hellfire dragoon bust portrait (`96x96`), spiky rust-red hair, curved brass dragon-horns on brow, molten ember-orange (`#FF5A26`) eyes, obsidian dragonplate pauldrons and dorsal boiler stacks.
  - **`kaelen_hurt.png`**: Grimacing through heavy impact, soot and ash across cheek, dorsal boiler stack venting emergency steam.
  - **`kaelen_determined.png`**: Fierce battle roar grin, flame-tipped bangs flaring, Cinderlance blade tip glowing `#FF5A26` beside his face.
  - **`kaelen_ultimate.png`**: Unleashing *Avatar of the Hell-Drake*: eyes and dragon-horns wreathed in white-hot (`#FFE478`) and molten ember (`#FF5A26`) dragonfire, obsidian scales glowing along his jaw.
- **Vespera Locke (`vespera`)**:
  - **`vespera_neutral.png`**: Serene eldritch soulbinder bust portrait (`96x96`), starlight-silver hair, brass-and-volt star tiara, violet/volt anime eyes, midnight sanctum collar, floating brass Astral Halo Ring behind her head.
  - **`vespera_hurt.png`**: Wincing recoil, star tiara flickering with erratic volt-green (`#C9F24B`) static, silver hair disheveled.
  - **`vespera_determined.png`**: Intense coven-weaver gaze, levitating Astral Grimoire open in the foreground with glowing `#C9F24B` runes.
  - **`vespera_ultimate.png`**: Unleashing *Choir of Twelve Seraphim*: eyes and tiara blazing electric volt-green (`#C9F24B`) and signal-cyan (`#00F0FF`), concentric seraphic halo rings radiating behind her head.

### 13.2 Companion Ultimate Cut-In Banners (`480x120` — 4 Additional Banners)
- **Primary Reference File(s)**: `Miscellaneous/206506 - Effects.png` (`Anime Zoom` speed-lines) + Character `_Port.png`
- **`rook_cutin.png`** (`480x120`): Extreme close-up widescreen anime eye cut-in of Rook Matsuda across a diagonal soot-and-brass speed-line slash banner; his left amber eye and right brass targeting monocle lock onto the target with a blazing `#FFC83D` crosshair flare.
- **`ines_cutin.png`** (`480x120`): Extreme close-up widescreen anime eye cut-in of Ines Calloway across a soot-and-verdigris speed-line banner; her emerald-verdigris (`#4FD6A0`) eyes blaze with necrotic runes while bone-white hair strands and skull sigils whip across the frame.
- **`kaelen_cutin.png`** (`480x120`): Extreme close-up widescreen anime eye cut-in of Kaelen Vos across a soot-and-ember speed-line banner; his molten `#FF5A26` draconic eyes and curved brass horns erupt with white-hot (`#FFE478`) furnace flames.
- **`vespera_cutin.png`** (`480x120`): Extreme close-up widescreen anime eye cut-in of Vespera Locke across a soot-and-volt speed-line banner; her eyes and forehead star-tiara blaze with `#C9F24B` volt lightning and geometric astral rings.

### 13.3 Cleansed-Territory Pilgrim NPCs (`128x64` 2-Frame Idle Strips) & All 11 NPC Dialogue Portraits (`96x96`)
- **3 Cleansed-Territory Pilgrim Sprites (`64x64` × 2 frames = `128x64`, anchor `[32, 58]`)**:
  - **`npc_pilgrim_caelum.png` (Sir Caelum the Undying — Cleansed Sanctuary Knight)**: Weathered silver-plate paladin kneeling/standing with a blessed signal-cyan (`#00F0FF`) banner-spear and bone-white cloak.
  - **`npc_pilgrim_lyra.png` (Sister Lyra of the Veil — Wandering Shrine Maiden)**: Shrine maiden in bone-white and bog-teal (`#2E6962`) vestments holding a purifying brass thurible censer.
  - **`npc_pilgrim_orin.png` (Runeseeker Orin — Relic Chronicler)**: Scholar-explorer carrying a scroll-packed leather rucksack and glowing astrolabe lantern (`#FFC83D`).
- **11 NPC Dialogue Bust Portraits (`96x96`, 1 frame each)**:
  - **`portrait_ume.png`** (Quartermaster Ume), **`portrait_vaelen.png`** (Master Smith Vaelen), **`portrait_isolde.png`** (Sister Isolde), **`portrait_malakor.png`** (Chronicler Malakor), **`portrait_solen.png`** (Archmage Solen), **`portrait_maeve.png`** (Maeve the Hearthkeeper), **`portrait_vex.png`** (Vex the Veil-Peddler), **`portrait_morwen.png`** (Morwen the Caravan Mystic), **`portrait_caelum.png`** (Sir Caelum), **`portrait_lyra.png`** (Sister Lyra), **`portrait_orin.png`** (Runeseeker Orin).

---

## SECTION 14: ALL 9 SAME-SPECIES 10× FUSION MID-BOSSES (`672x96`) & 9 SECOND-STAGE 5× KING FUSION BOSSES (`896x128`)

### 14.1 Nine 10× Same-Species Fusion Mid-Bosses (`96x96` × 7 Frames = `672x96`, 8 fps, anchor `[48, 88]`)
*(Frame Layout: Frames 1–2 Move, Frame 3 Brass-Glint Telegraph Windup, Frames 4–5 Signature Special Attack, Frame 6 Hurt, Frame 7 Dead)*
- **Primary Reference File(s)**: `Bosses/206503 - Stage 4 Mini Boss (Udin).png`, `Bosses/206495 - Stage 1 Mini Boss (Fubuzilla).png`, `Enemies/206549 - Enemies (Miscellaneous).png`
1. **`fusion_scrap_rat_king.png` (`scrapRatKing` — 10× Tin Rat Amalgam)**: Multi-headed rat-king juggernaut fused inside a welded sphere of 10 rusted iron torture-cans (`#8B3A1E`), rolling forward as a spiked iron wheel (`rollingRush`).
2. **`fusion_bonepack_alpha.png` (`bonepackAlpha` — 10× Dust Dog Amalgam)**: Three-headed ossuary dire-hound stitched from 10 grave-hound skeletons (`#D9D2C3`) wearing a crown of tangled chain collars and brass goggles (`pairedLungeHowl`).
3. **`fusion_wire_cyclone.png` (`wireCyclone` — 10× Wire Kite Amalgam)**: Whirling aerialgyre of 10 bone-winged gargoyle imps bound by electrified barbed wire and a central crimson oculus (`aerialBoltArcs`).
4. **`fusion_brine_maw.png` (`brineMaw` — 10× Lye Leech Amalgam)**: Cavernous multi-ringed abyssal worm-maw formed from 10 bloated bile-green (`#9CB34C`) leeches fused around a central suction gullet (`suctionDrain`).
5. **`fusion_screech_choir.png` (`screechChoir` — 10× Sump Bat Amalgam)**: Hanging gothic cathedral chandelier of 10 fused crypt-bats with a giant amplified rib-cage resonator bell (`sonicCone`).
6. **`fusion_rivet_titan.png` (`rivetTitan` — 10× Rivet Tick Amalgam)**: Towering 12-legged iron-skull arachnid colossus built from 10 riveted crypt-ticks with glowing furnace vents under its carapace (`titanSlamLeap`).
7. **`fusion_relay_colossus.png` (`relayColossus` — 10× Signal Mite Amalgam)**: Floating obelisk-chandelier of 10 lantern-skulls linked by signal-cyan (`#00F0FF`) lightning coils and brass chimes (`overclockBroadcast`).
8. **`fusion_dredge_husk.png` (`dredgeHusk` — 10× Silt Mimic Amalgam)**: Hulking crab-like reliquary golem made of 10 chained iron treasure coffers overflowing with bone jaws and bile-green tongues (`feintCounterSlam`).
9. **`fusion_blackwing_furnace.png` (`blackwingFurnace` — 10× Cinder Crow Amalgam)**: Six-winged undead phoenix-roc of charred bone and rusted boiler grates venting ember-orange (`#FF5A26`) firestorms (`furnaceAirstrike`).

### 14.2 Nine Second-Stage 5× Mid-Boss "KING" Fusion Bosses (`128x128` × 7 Frames = `896x128`, 8 fps, anchor `[64, 118]`)
*(Triggered when 5 Mid-Level Fused Bosses merge into `"King <Mob Name>"`, outlined in a 2px Sovereign Brass-Gold `#FFC83D` & Blood-Crimson `#FF3B3B` double rim)*
1. **`king_tin_rat.png` (King Tin Rat)**: Sovereign Rat-Emperor seated atop a rolling cathedral-throne of crushed iron canisters, wearing a jagged tin-can crown (`#FFC83D`).
2. **`king_dust_dog.png` (King Dust Dog)**: Colossal Cerberus-Behemoth of fused ossuary bone-plate with blazing crimson eye-sockets and spiked iron shoulder-chains.
3. **`king_wire_kite.png` (King Wire Kite)**: Seraphic Gargoyle Archon with 6 razor-wire wings and a revolving brass astrolabe halo firing blood-lightning.
4. **`king_lye_leech.png` (King Lye Leech)**: Sovereign Hydra-Leech with 5 crowned lamprey necks rising from a boiling cauldron of caustic bile (`#9CB34C`).
5. **`king_sump_bat.png` (King Sump Bat)**: Nosferatu Chiropteran Lord draped in a royal cloak of leathery wings with a brass cathedral organ fused to its spine.
6. **`king_rivet_tick.png` (King Rivet Tick)**: Fortress-Spider Monarch carrying a gothic iron citadel crown on its abdomen with 8 hydraulic pile-driver legs.
7. **`king_signal_mite.png` (King Signal Mite)**: Astral Lich-Lantern Sovereign — a giant crowned skull-sun of signal-cyan (`#00F0FF`) soulfire orbited by 10 brass satellite bells.
8. **`king_silt_mimic.png` (King Silt Mimic)**: Royal Treasury Gargantua — an ornate gilded vault-door sarcophagus split open into a three-jawed bone leviathan.
9. **`king_cinder_crow.png` (King Cinder Crow)**: Ashen Crow-King in a cloak of burning black feathers, wearing a crown of molten iron thorns (`#FF5A26`).

---

## SECTION 15: ALL 60 BLOODLINE BOSSES ACROSS FLOORS 1–5 (4 Bloodlines × 5 Floors × 3 Stages)

Each Floor features 4 Sectors (`slabTown` North = **House of Malgorth**, `route9` West = **Cavalcade of Varkos**, `lyeMarsh` East = **Coven of Hagra**, `copperFlats` South = **Brood of Skarath**), and each Sector has a 3-stage sequential boss chain:
- **Stage I · Warden**: `128x128` × 9 frames (`1152x128`, anchor `[64, 118]`)
- **Stage II · Executioner**: `160x160` × 9 frames (`1440x160`, anchor `[80, 148]`)
- **Stage III · Overlord**: `192x192` to `256x192` × 9 frames (`1728x192` / `2016x160` / `2304x192`)

### 15.1 Floor 1 — The Blighted Catacombs (12 Bosses — Accent: `#00F0FF` Signal Cyan & `#8B3A1E` Rust)
- **North (House of Malgorth)**:
  - `boss_f1_north_warden.png` (**Grave-Warden Vorn** — Ossuary Gatekeeper, `128x128`×9): Towering undead gatekeeper in riveted crypt-plate swinging a chained iron portcullis mace.
  - `boss_f1_north_exec.png` (**Bone-Cleaver Gorath** — Crypt Headsman, `160x160`×9): Executioner lord in a bone-horned hood wielding a twin-handed guillotine greatsword.
  - `the_foreman.png` (**High Executioner Malgorth / The Foreman** — Stage III Overlord, `192x192`×9, already detailed in Section 5).
- **West (Cavalcade of Varkos)**:
  - `boss_f1_west_warden.png` (**Houndsman Kael** — Gallows Outrider, `128x128`×9): Mounted skeletal outrider with a pack-leash of chained grave-hounds and a barbed harpoon.
  - `boss_f1_west_exec.png` (**Iron-Wheel Draven** — Chain-Flail Rider, `160x160`×9): Heavy spiked monowheel juggernaut swinging twin burning furnace flails.
  - `big_axle.png` (**Dread Charioteer Varkos / Big Axle** — Stage III Overlord, `224x160`×9, already detailed in Section 5).
- **East (Coven of Hagra)**:
  - `boss_f1_east_warden.png` (**Mire-Witch Syla** — Keeper of Leech Vats, `128x128`×9): Stilted bog-witch stirring a cauldron-staff of glowing bile-green (`#9CB34C`) leeches.
  - `boss_f1_east_exec.png` (**Leech-Cantor Morvath** — Choir of the Fens, `160x160`×9): Multi-armed plague bishop carrying a rack of corroded brass curse-bells.
  - `mother_sump.png` (**Bog-Matriarch Hagra / Mother Sump** — Stage III Overlord, `192x192`×9, already detailed in Section 5).
- **South (Brood of Skarath)**:
  - `boss_f1_south_warden.png` (**Crypt-Stalker Vorx** — Burrower of Ash, `128x128`×9): Armored centipede-drake with旋转 brass drill-mandibles emerging from red ash.
  - `boss_f1_south_exec.png` (**Tomb-Gorger Krag** — Carapace Behemoth, `160x160`×9): Hulking siege-tortoise wyrm with a furnace-mortar shell on its back.
  - `the_long_dry.png` (**Catacomb Wyrm Skarath / The Long Dry** — Stage III Overlord, `256x192`×9, already detailed in Section 5).

### 15.2 Floor 2 — The Frostbound Crypt (12 Bosses — Accent: `#7CE8FF` Hoarfrost Cyan & `#1B3144` Glacial Slate)
- **North**: `boss_f2_north_warden.png` (**Rime-Warden Vorn**), `boss_f2_north_exec.png` (**Deathknight Gorath**), `boss_f2_north_overlord.png` (**Dreadlord Malgorth** — Frostbound siege dreadnought encased in glacier spikes and blue soul-ice).
- **West**: `boss_f2_west_warden.png` (**Frost-Stalker Kael**), `boss_f2_west_exec.png` (**Glacier-Ram Draven**), `boss_f2_west_overlord.png` (**Cryo-Cavalier Varkos** — Icebreaker war-chariot with frost-turbine blades).
- **East**: `boss_f2_east_warden.png` (**Frost-Siren Syla**), `boss_f2_east_exec.png` (**Rime-Priest Morvath**), `boss_f2_east_overlord.png` (**Ice-Matriarch Hagra** — Frozen charnel queen encased in a crystalline cryo-brood sac).
- **South**: `boss_f2_south_warden.png` (**Ice-Borer Vorx**), `boss_f2_south_exec.png` (**Frost-Gorger Krag**), `boss_f2_south_overlord.png` (**Glacier-Wyrm Skarath** — Sub-zero permafrost leviathan with diamond-ice drill jaws).

### 15.3 Floor 3 — The Hellfire Abyss (12 Bosses — Accent: `#FF5A26` Molten Ember & `#3B1A14` Brimstone Obsidian)
- **North**: `boss_f3_north_warden.png` (**Cinder-Warden Vorn**), `boss_f3_north_exec.png` (**Hellblade Gorath**), `boss_f3_north_overlord.png` (**Archfiend Malgorth** — Demon-forged caldera colossus with molten guillotine arms).
- **West**: `boss_f3_west_warden.png` (**Hellhound Kael**), `boss_f3_west_exec.png` (**Magma-Ram Draven**), `boss_f3_west_overlord.png` (**Infernal Chariot Varkos** — Brimstone locomotive war-rig dragging red-hot iron maidens).
- **East**: `boss_f3_east_warden.png` (**Pyre-Witch Syla**), `boss_f3_east_exec.png` (**Ash-Cantor Morvath**), `boss_f3_east_overlord.png` (**Cinder-Queen Hagra** — Magma-cauldron matriarch birthing cinder-larvae).
- **South**: `boss_f3_south_warden.png` (**Magma-Burrower Vorx**), `boss_f3_south_exec.png` (**Slag-Maw Krag**), `boss_f3_south_overlord.png` (**Hell-Drake Skarath** — Volcanic elder dragon of obsidian plate and liquid fire).

### 15.4 Floor 4 — The Rotwood Mire (12 Bosses — Accent: `#C9F24B` Spore Volt-Lime & `#1F3D2E` Mycelium Green)
- **North**: `boss_f4_north_warden.png` (**Blight-Warden Vorn**), `boss_f4_north_exec.png` (**Spore-Reaver Gorath**), `boss_f4_north_overlord.png` (**Pestilent Lord Malgorth** — Overgrown fungal-cathedral executioner).
- **West**: `boss_f4_west_warden.png` (**Carrion-Hound Kael**), `boss_f4_west_exec.png` (**Bile-Hulk Draven**), `boss_f4_west_overlord.png` (**Plague-Rider Varkos** — Contagion war-wagon overgrown with weeping bile-roots).
- **East**: `boss_f4_east_warden.png` (**Spore-Witch Syla**), `boss_f4_east_exec.png` (**Rot-Cantor Morvath**), `boss_f4_east_overlord.png` (**Brood-Mother Hagra** — Towering mycelium empress of the Carrion Fen).
- **South**: `boss_f4_south_warden.png` (**Root-Chewer Vorx**), `boss_f4_south_exec.png` (**Venom-Maw Krag**), `boss_f4_south_overlord.png` (**Putrid Leviathan Skarath** — Rot-wood root-wyrm dripping corrosive spores).

### 15.5 Floor 5 — The Void Citadel (12 Bosses — Accent: `#FFC83D` Sovereign Gold, `#9FA7FF` Astral Violet & `#110C1D` Void Black)
- **North**: `boss_f5_north_warden.png` (**Void-Warden Vorn**), `boss_f5_north_exec.png` (**Astral-Blade Gorath**), `boss_f5_north_overlord.png` (**Eternal Sovereign Malgorth** — Six-winged astral executioner progenitor with dimensional rift-blades).
- **West**: `boss_f5_west_warden.png` (**Rift-Hound Kael**), `boss_f5_west_exec.png` (**Star-Ram Draven**), `boss_f5_west_overlord.png` (**Void-Cavalier Varkos** — Starforged nebula chariot pulled by void-steeds).
- **East**: `boss_f5_east_warden.png` (**Void-Oracle Syla**), `boss_f5_east_exec.png` (**Void-Choir Morvath**), `boss_f5_east_overlord.png` (**Abyss-Mother Hagra** — Cosmic high priestess of the Eclipsed Star).
- **South**: `boss_f5_south_warden.png` (**Rift-Serpent Vorx**), `boss_f5_south_exec.png` (**Star-Gorger Krag**), `boss_f5_south_overlord.png` (**Elder Void-Dragon Skarath** — Constellation-scaled apex wyrm of the Demiurge).

---

## SECTION 16: ALL 95 SKILL ICONS, TRAIT ICONS & 28 STATUS EFFECT ICONS (`32x32` & `16x16`)

> **Reference File for All Icons**: `tempartreference(DONOTCOMPLETELYCOPY)/Items/206883 - Item Icons.png` (`444x430` master icon sheet) + Character `_Weapon.png`, `_Perk1..3.png`, `_Special.png`.
> Every `32x32` icon uses a `1px #0B0D10` outer outline, `1px #3A3F47` bevel (or `#FFC83D` brass border for Ultimates), and `#11171B` dark slate interior.

### 16.1 Base Class Active & Ultimate Skill Icons (`32x32` — 16 Additional Base Icons)
- **Rook Matsuda (`#FFC83D` Brass Accent)**:
  - `icon_skill_rivet_spread.png` (*Silver Stake Spread*): 5 consecrated silver crossbow bolts fanning outward in a cone with brass-gold trails.
  - `icon_skill_kickback.png` (*Sanctified Kickback*): Crossbow muzzle blast firing downward-right with backward vault speed-arrows.
  - `icon_skill_rapid_fire.png` (*Inquisitor Volley*): 3 rapid-fire silver bolts stacked in parallel motion lines.
  - `icon_skill_rail_slug.png` (*Judgement Silver Spear* Ultimate): Colossal glowing solar-silver spear-bolt piercing a cracked iron shield (`#FFC83D` border).
- **Ines Calloway (`#4FD6A0` Verdigris Accent)**:
  - `icon_skill_pull.png` (*Grave-Grasp Pull*): Spectral bone hand & horseshoe magnet pulling 3 iron shards inward.
  - `icon_skill_spin_up.png` (*Whirling Bone-Vortex*): Circular saw-ring of orbiting bone-and-steel shards with verdigris motion arcs.
  - `icon_skill_lump.png` (*Ossuary Monolith*): Giant compressed skull-boulder of fused bones and scrap iron being hurled.
  - `icon_skill_scrapfall.png` (*Catacomb Bone-Tempest* Ultimate): Rain of ancestral bone pillars and iron debris falling from a verdigris rift (`#FFC83D` border).
- **Kaelen Vos (`#FF5A26` Ember Accent)**:
  - `icon_skill_naphtha_jet.png` (*Brimstone Dragon-Rush*): Blazing Cinderlance tip hurtling forward with twin ember thruster trails.
  - `icon_skill_caustic_mortar.png` (*Hellfire Crucible Bomb*): Lobbed molten brimstone shell exploding into an ember-and-bile puddle.
  - `icon_skill_vent_supernova.png` (*Infernal Wyrm-Roar*): 360-degree radial dragonfire eruption from twin brass boiler vents.
  - `icon_skill_supercritical_meltdown.png` (*Avatar of the Hell-Drake* Ultimate): Horned Hell-Drake skull wreathed in white-hot and molten ember flames (`#FFC83D` border).
- **Vespera Locke (`#C9F24B` Volt & `#00F0FF` Signal Accent)**:
  - `icon_skill_tesla_pylon.png` (*Eldritch Obelisk*): Pair of runic brass-and-stone obelisks linked by a crackling volt-green laser beam.
  - `icon_skill_seeker_swarm.png` (*Wisp-Skull Swarm*): 3 winged mechanical wisp-skulls diving with volt-green eye trails.
  - `icon_skill_phase_blink.png` (*Astral Rift-Step*): Twin linked astral teleportation portals with a lightning step-streak between them.
  - `icon_skill_overclocked_armada.png` (*Choir of Twelve Seraphim* Ultimate): 12-pointed seraphic brass halo firing twin intersecting astral lasers (`#FFC83D` border).

### 16.2 All 75 Specialization Skill & Ultimate Icons (`32x32` — 5 Icons × 15 Specializations)
- **Sena — Phantom Edge**: `icon_skill_shadow_pin.png`, `icon_skill_false_exit.png`, `icon_skill_seam_cut.png`, `icon_skill_borrowed_second.png`, `icon_skill_midnight_corridor.png` (Ult).
- **Sena — Rift Breaker**: `icon_skill_pile_fist.png`, `icon_skill_faultline_stomp.png`, `icon_skill_anchor_grip.png`, `icon_skill_seismic_guard.png`, `icon_skill_worldsplitter.png` (Ult).
- **Sena — Pulse Dancer**: `icon_skill_snapstep.png`, `icon_skill_conductive_loop.png`, `icon_skill_backbeat.png`, `icon_skill_chain_waltz.png`, `icon_skill_perfect_frequency.png` (Ult).
- **Rook — Rail Hunter**: `icon_skill_harpoon_line.png`, `icon_skill_sightline_break.png`, `icon_skill_ricochet_survey.png`, `icon_skill_pinpoint_verdict.png`, `icon_skill_dead_meridian.png` (Ult).
- **Rook — Siege Gunner**: `icon_skill_mortar_beacon.png`, `icon_skill_bunker_roller.png`, `icon_skill_salvo_grid.png`, `icon_skill_breakwater_shot.png`, `icon_skill_iron_weather.png` (Ult).
- **Rook — Circuit Warden**: `icon_skill_arc_pylon.png`, `icon_skill_scrambler_disk.png`, `icon_skill_relay_swap.png`, `icon_skill_overload_command.png`, `icon_skill_blackout_cascade.png` (Ult).
- **Ines — Magnet Crusher**: `icon_skill_crush_point.png`, `icon_skill_iron_coffin.png`, `icon_skill_mass_driver.png`, `icon_skill_pressure_inversion.png`, `icon_skill_singularity_press.png` (Ult).
- **Ines — Scrapstorm**: `icon_skill_razor_monsoon.png`, `icon_skill_shiver_step.png`, `icon_skill_crosswind.png`, `icon_skill_shard_cathedral.png`, `icon_skill_thousand_knife_typhoon.png` (Ult).
- **Ines — Polarity Breaker**: `icon_skill_northbound.png`, `icon_skill_reverse_charge.png`, `icon_skill_collision_course.png`, `icon_skill_mag_rail_surf.png`, `icon_skill_zero_point_reversal.png` (Ult).
- **Kaelen — Cinder Corsair**: `icon_skill_jet_sickle.png`, `icon_skill_thruster_feint.png`, `icon_skill_skyhook_dive.png`, `icon_skill_razor_afterburn.png`, `icon_skill_crimson_flyover.png` (Ult).
- **Kaelen — Crucible Architect**: `icon_skill_mold_stamp.png`, `icon_skill_pourline.png`, `icon_skill_foundry_press.png`, `icon_skill_quench_fracture.png`, `icon_skill_cathedral_of_iron.png` (Ult).
- **Kaelen — Cryo Saboteur**: `icon_skill_cold_snap_canister.png`, `icon_skill_fracture_wire.png`, `icon_skill_thermocline_kick.png`, `icon_skill_zero_kelvin_flask.png`, `icon_skill_whiteout_rupture.png` (Ult).
- **Vespera — Volt Reaver**: `icon_skill_arc_rend.png`, `icon_skill_breaker_step.png`, `icon_skill_countercoil.png`, `icon_skill_thunder_guillotine.png`, `icon_skill_cataclysm_edge.png` (Ult).
- **Vespera — Iron Puppeteer**: `icon_skill_titan_hand.png`, `icon_skill_anchor_walk.png`, `icon_skill_chain_hoist.png`, `icon_skill_break_order.png`, `icon_skill_colossus_directive.png` (Ult).
- **Vespera — Storm Cartographer**: `icon_skill_cloud_etching.png`, `icon_skill_pressure_drop.png`, `icon_skill_isobar_sweep.png`, `icon_skill_eye_of_storm.png`, `icon_skill_worldstorm_atlas.png` (Ult).

### 16.3 All 28 Status Effect & Buff HUD Icons (`16x16` & `32x32` — `icon_status_<id>.png`)
*(Reference: `Effect Icons` & `Other` in `Items/206883 - Item Icons.png`)*
- **Debuffs (14)**: `icon_status_bleed.png` (crimson blood drop), `icon_status_burn.png` (ember flame), `icon_status_corrode.png` (acid-cracked shield), `icon_status_exposed.png` (split bone-white armor plate), `icon_status_weakened.png` (cracked sword), `icon_status_slow.png` (chained iron boot), `icon_status_pinned.png` (rail-spike driven through chain), `icon_status_stun.png` (signal-cyan lightning star), `icon_status_lifted.png` (verdigris levitation arrow), `icon_status_blind.png` (slashed dark eye), `icon_status_choked.png` (ash-cloud lungs), `icon_status_marked.png` (brass inquisitor crosshair), `icon_status_overloaded.png` (verdigris magnet spark), `icon_status_staggered.png` (shattered brass crown).
- **Buffs (14)**: `icon_status_momentum.png` (cyan double chevron), `icon_status_redline.png` (crimson-cyan overdrive gauge), `icon_status_guarding.png` (cyan aegis shield), `icon_status_steadyAim.png` (brass scope reticle), `icon_status_holdBreath.png` (golden sniper bullet), `icon_status_quickHands.png` (winged brass gauntlets), `icon_status_ironHide.png` (riveted boiler plate), `icon_status_secondSkin.png` (orbiting bone-shard ring), `icon_status_grounded.png` (anchored iron boot), `icon_status_fed.png` (roasted wyrm-steak haunch), `icon_status_haste.png` (brass lightning boot), `icon_status_focus.png` (glowing crit diamond), `icon_status_warmed.png` (hearth campfire flame), `icon_status_bounty.png` (sovereign gold coin crest).

---

## SECTION 17: EXTENDED SUPPLIES, TAVERN MEALS, CURIO COFFERS, WANDERING MERCHANT RELICS & CLASS VFX

### 17.1 Extended Consumables, Tavern Meals, Curios & Relics (`32x32` Framed Icons)
- **Additional Supplies (`src/data/config.js`)**:
  - `icon_item_lye_wash.png` (*Purifying Salt Phial / Lye Wash*): Bog-teal glass flask (`#2E6962`) with purifying bone-white salt crystals that cleanse Burn and Corrode.
  - `icon_item_hot_stew.png` (*Sanctuary Marrow Tin / Hot Stew*): Steaming copper mess-tin (`#D16B38`) of rich crimson marrow stew granting *Fed*.
  - `icon_item_stim_stick.png` (*Quicksilver Adrenaline Injector / Stim Stick*): Brass-and-glass syringe (`#FFC83D`, `#00F0FF`) sparking with haste energy (`Choco_Needle.png` ref).
- **Raven's Rest Tavern Meals (`TAVERN_MEALS` — Reference: `Holo House/206116 - Cooking.png`)**:
  - `icon_meal_wyrm_steak.png` (*Charred Wyrm Steak*): Sizzling bone-in drake rib steak with ember grill marks on an iron platter.
  - `icon_meal_frost_ale.png` (*Spiced Abyssal Stout*): Frothy iron-hooped tavern tankard with golden-amber foam and cinnamon spice glow.
  - `icon_meal_spiced_marrow.png` (*Seer's Moonlit Broth*): Glowing signal-cyan (`#00F0FF`) herbal bone-broth bowl with floating star-anise.
  - `icon_meal_void_nectar.png` (*Sovereign Feast of the Eclipse*): Royal gilded banquet platter with roast wyrm, chalice of void-wine, and golden fruit.
- **Vex's Curio Gambling Coffers (`CURIO_GAMBLE_TIERS` — Reference: `Miscellaneous/206962 - Holozon Box.png`)**:
  - `icon_curio_tarnished.png` (*Tarnished Catacomb Coffer*): Rusted iron-and-bone lockbox bound with a heavy chain.
  - `icon_curio_bloodbound.png` (*Hellforged Reliquary Box*): Crimson-and-brass runed reliquary chest glowing with ember seams.
  - `icon_curio_sovereign.png` (*Astral Demiurge Casket*): Ornate gold-and-void casket radiating signal-cyan and violet starlight.
- **Morwen's Wandering Merchant Relics & Elixirs (`WANDERING_MERCHANT_STOCK`)**:
  - `icon_relic_blood_chalice.png` (*Cursed Blood Chalice*): Gothic gilded goblet overflowing with glowing crimson (`#FF3B3B`) vitae.
  - `icon_relic_obsidian_signet.png` (*Abyssal Ward Signet*): Heavy obsidian ring set with a signal-cyan (`#00F0FF`) ward-stone.
  - `icon_relic_astral_eye.png` (*Eye of the Eclipsed Star*): Levitating brass oculus talisman with a blazing violet-gold iris.
  - `icon_elixir_soul_harvest.png` (*Elixir of Soul Harvest*): Faceted emerald-gold alchemical phial swirling with captured soul motes.
  - `icon_elixir_void_ascendance.png` (*Draught of Abyssal Ascendance*): Winged sovereign flask glowing with starlight cyan and brass gold.

### 17.2 Class-Specific Projectiles, Summons & Specialization VFX (`fx_*` Category)
- **Rook Ballistics & Devices**:
  - `fx_rook_bolt.png` (`16x16` × 4 orientations = `64x16`): Silver-and-brass crossbow bolt with a crisp `#FFC83D` tracer tail.
  - `fx_rook_rail_slug.png` (`64x24` × 3 frames = `192x24`): Colossal solar-silver Judgement Spear projectile surrounded by spiral brass shock-rings.
  - `fx_rook_trap.png` (`32x32` × 3 frames = `96x32`): Jawed iron snare / Arc Pylon / Bunker Roller deployed on the ground.
- **Ines Necromancy & Magnetism**:
  - `fx_ines_bone_orbit.png` (`24x24` × 4 frames = `96x24`): Orbiting jagged bone-and-iron shard wreathed in `#4FD6A0` verdigris flame.
  - `fx_ines_pull_sigil.png` (`128x128` × 4 frames = `512x128`): Top-down necrotic magnetic implosion circle (`Shion_Circle.png` ref) in `#4FD6A0` and `#D9D2C3`.
  - `fx_ines_monolith.png` (`48x48` × 4 frames = `192x48`): Hurled Ossuary Monolith skull-boulder & Iron Coffin plates.
- **Kaelen Hellfire & Cryo**:
  - `fx_kaelen_flame_jet.png` (`96x64` × 4 frames = `384x64`): Roaring cone of `#FF5A26` and `#FFE478` dragonfire breath (`Coco.png` ref).
  - `fx_kaelen_lava_pool.png` (`96x96` × 3 frames = `288x96`): Bubbling top-down molten brimstone crater pool (`Items/206880 - Weapons (Collabs).png` `MiComet` magma pool ref).
  - `fx_kaelen_cryo_shatter.png` (`96x96` × 4 frames = `384x96`): Endothermic `#7CE8FF` hoarfrost crystal explosion.
- **Vespera Eldritch & Automaton**:
  - `fx_vespera_pylon.png` (`32x48` × 3 frames = `96x48`): Levitating brass-and-stone Eldritch Obelisk pulsing with `#C9F24B` volt runes.
  - `fx_vespera_wisp_skull.png` (`24x24` × 4 frames = `96x24`): Homing winged mechanical wisp-skull with volt-green eye trail.
  - `fx_vespera_automaton.png` (`96x96` × 6 frames = `576x96`): Iron Puppeteer's walking siege automaton construct (Idle 2, March 2, Titan Fist Slam 2).

---

## SECTION 18: DUSKHOLLOW TOWN 6 RPG BUILDINGS & FLOORS 2–5 BIOME TILES/PROPS

### 18.1 Duskhollow Town (Floor 0) Landmark Buildings (`160x120`, 1 Frame Each, with Baked `#0B0D10` Ground Shadow)
*(Reference: `Holo House/206123 - Furniture - Structure.png`, `206141 - NPCs.png`, `Levels/206852 - Stage 3 - Halloween Castle.png`)*
1. **`building_abyssal_gatehouse.png`** (`192x144`): Monolithic northern Spire entrance gatehouse with twin soulfire braziers and a swirling `#00F0FF` waystone portal arch.
2. **`building_runesmith_forge.png`** (`160x120`): Master Smith Vaelen's dark-stone smithy with a roaring `#FF5A26` open blast furnace, chimney smoke, anvil yard, and weapon racks.
3. **`building_alchemist_apothecary.png`** (`160x120`): Sister Isolde's bog-teal slate apothecary with stained-glass herbarium windows, copper distillation coils, and glowing `#2EE6A8` / `#FF3B3B` potion jars.
4. **`building_hunters_guild.png`** (`160x120`): Chronicler Malakor's gothic guildhall with crimson banners, mounted wyrm skulls, and the illuminated Bloodline Ledger board outside.
5. **`building_arcane_sanctum.png`** (`160x120`): Archmage Solen's astronomical observatory tower with a revolving brass armillary dome and floating `#00F0FF` grimoire pedestals.
6. **`building_ravens_rest_tavern.png`** (`160x120`): Maeve's warm timber-and-stone inn with glowing `#FFC83D` hearth windows, hanging raven signboard, and outdoor ale barrels.
7. **`building_mystic_enchanter.png`** (`160x120`): Vex's purple-draped occult curio pavilion with floating violet lanterns (`#E879F9`) and 3 sealed reliquary chests on display.

### 18.2 Upper Spire Floors 2–5 Seamless Ground Tiles (`48x16` Strips — Three `16x16` Variants Each)
- **Floor 2 (The Frostbound Crypt — `#0D1822` / `#7CE8FF`)**:
  - `tile_f2_rime_vaults.png`, `tile_f2_glacial_viaduct.png`, `tile_f2_frozen_charnel.png`, `tile_f2_hoarfrost_citadel.png`
- **Floor 3 (The Hellfire Abyss — `#1C0E0C` / `#FF5A26`)**:
  - `tile_f3_brimstone_caldera.png`, `tile_f3_iron_maiden_causeway.png`, `tile_f3_cinder_pit.png`, `tile_f3_throne_of_scars.png`
- **Floor 4 (The Rotwood Mire — `#0E1D16` / `#C9F24B`)**:
  - `tile_f4_fungal_catacombs.png`, `tile_f4_bile_root_hollow.png`, `tile_f4_carrion_fen.png`, `tile_f4_heart_of_blight.png`
- **Floor 5 (The Void Citadel — `#110C1D` / `#FFC83D` / `#9FA7FF`)**:
  - `tile_f5_starfall_cloister.png`, `tile_f5_eclipsed_spire.png`, `tile_f5_choir_of_silence.png`, `tile_f5_sanctum_demiurge.png`

