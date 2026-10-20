/**
 * HellsAdvent — Class Change, Skill Tree & Specialization Data (v4.1)
 *
 * Implements the approved specifications from HellsAdvent_Class_Change_Skill_Tree_Brainstorm_v4.md:
 * - 5 Characters: Sena, Rook, Ines, Kaelen, Vespera.
 * - 3 Alternative Specializations per character (15 total).
 * - 4 Active skills + 1 Ultimate per specialization.
 * - Mutually exclusive 2-option fork variants per ability.
 * - Auto-evolving Intrinsic Traits (Levels 1, 15, 30, 45).
 * - Auto-evolving Class Traits (Levels 15, 30, 45).
 * - Strict rule: NO cross-class combo mechanics; abilities execute independently.
 */

export const CHARACTERS = {
  sena: {
    id: 'sena',
    name: 'Sena Ibuki',
    role: 'Melee',
    color: '#00F0FF',
    accentName: 'signal',
    startingClass: 'phantomEdge',
    base: [
      { id: 'sena:base:lunge', name: 'Lunge', level: 1, hotkey: '1', icon: 'lunge', cooldown: 5.0, staminaCost: 10, desc: 'Dash 160px toward the cursor, cutting every enemy on the line.' },
      { id: 'sena:base:ground-break', name: 'Ground Break', level: 1, hotkey: '2', icon: 'groundBreak', cooldown: 8.5, staminaCost: 14, desc: 'Slam the rail downward, fracturing a 110px crater with heavy stagger and stun.' },
      { id: 'sena:base:rail-parry', name: 'Rail Parry', level: 1, hotkey: '3', icon: 'railSpike', cooldown: 6.0, staminaCost: 8, desc: 'Enter a 0.4s parry window. Deflecting an incoming hit unleashes Crescent Slash.' }
    ],
    ultimate: {
      id: 'sena:base:seven-cuts',
      name: 'Seven Cuts',
      level: 1,
      hotkey: 'R',
      icon: 'sevenCuts',
      cooldown: 0,
      staminaCost: 0,
      desc: 'Seven spatial cuts across the combat arena ending in a devastating dimensional burst.'
    },
    classes: ['phantomEdge', 'riftBreaker', 'pulseDancer'],
    intrinsic: {
      id: 'fightingInstinct',
      name: 'Fighting Instinct',
      desc: 'Sena reads the rhythm of close-quarters violence, sharpening recovery and precision through unbroken focus.',
      ranks: {
        1: 'Consecutive meaningful attacks improve combat recovery slightly (+5% attack recovery).',
        15: 'First clean hit landed within 2s of a successful dodge gains +15% damage bonus.',
        30: 'Alternating between offensive attacks and evasive repositioning improves recovery by 10%.',
        45: 'Landing four varied actions in sequence grants one guaranteed critical finisher within 3s.'
      }
    }
  },
  rook: {
    id: 'rook',
    name: 'Rook Matsuda',
    role: 'Ranged',
    color: '#FFC83D',
    accentName: 'brass',
    startingClass: 'railHunter',
    base: [
      { id: 'rook:base:rivet-spread', name: 'Rivet Spread', level: 1, hotkey: '1', icon: 'rivetSpread', cooldown: 5.0, staminaCost: 8, desc: 'Fire a 5-pellet conical blast of heated industrial rivets.' },
      { id: 'rook:base:kickback', name: 'Kickback', level: 1, hotkey: '2', icon: 'kickback', cooldown: 7.5, staminaCost: 10, desc: 'Discharge an explosive concussive blast, vaulting backward away from danger.' },
      { id: 'rook:base:rapid-fire', name: 'Rapid Fire', level: 1, hotkey: '3', icon: 'rapidFire', cooldown: 6.0, staminaCost: 12, desc: 'Unload three rapid-fire piercing shells in rapid succession.' }
    ],
    ultimate: {
      id: 'rook:base:anti-materiel-rail-slug',
      name: 'Anti-Materiel Rail Slug',
      level: 1,
      hotkey: 'R',
      icon: 'railSlug',
      cooldown: 0,
      staminaCost: 0,
      desc: 'Charge and fire a colossal armor-piercing depleted uranium slug through all targets.'
    },
    classes: ['railHunter', 'siegeGunner', 'circuitWarden'],
    intrinsic: {
      id: 'fieldAwareness',
      name: 'Field Awareness',
      desc: 'Rook tracks ballistic vectors and combat positioning, predicting incoming fire and enemy blind spots.',
      ranks: {
        1: 'Displays brief visual warning arcs on incoming off-screen ranged projectiles.',
        15: 'First aimed shot against a newly engaged hostile gains +20% accuracy and projectile speed.',
        30: 'Target weak-point recognition persists for 3s after repositioning or vaulting.',
        45: 'Landing a precision shot on an exposed target reduces active cooldowns by 1.0s (4s cooldown).'
      }
    }
  },
  ines: {
    id: 'ines',
    name: 'Ines Calloway',
    role: 'Magnetist',
    color: '#4FD6A0',
    accentName: 'verdigris',
    startingClass: 'magnetCrusher',
    base: [
      { id: 'ines:base:pull', name: 'Pull', level: 1, hotkey: '1', icon: 'pull', cooldown: 5.5, staminaCost: 10, desc: 'Direct magnetic flux to drag environmental scrap and lesser enemies toward Ines.' },
      { id: 'ines:base:spin-up', name: 'Spin Up', level: 1, hotkey: '2', icon: 'spinUp', cooldown: 7.0, staminaCost: 12, desc: 'Accelerate orbiting scrap metal into a whirling defensive perimeter blade.' },
      { id: 'ines:base:lump', name: 'Lump', level: 1, hotkey: '3', icon: 'lump', cooldown: 6.0, staminaCost: 14, desc: 'Compress surrounding debris into a dense molten slag block and hurl it.' }
    ],
    ultimate: {
      id: 'ines:base:scrapfall',
      name: 'Scrapfall',
      level: 1,
      hotkey: 'R',
      icon: 'scrapfall',
      cooldown: 0,
      staminaCost: 0,
      desc: 'Magnetize the sky above, raining hundreds of heavy metal shards onto the combat arena.'
    },
    classes: ['magnetCrusher', 'scrapstorm', 'polarityBreaker'],
    intrinsic: {
      id: 'fluxSense',
      name: 'Flux Sense',
      desc: 'Ines senses magnetic currents throughout the wasteland, amplifying destructive electromagnetic collapses.',
      ranks: {
        1: 'Magnetic pulses reveal nearby interactable metal obstacles and slag hazards.',
        15: 'Offensive magnetic skill hits build +3% magnetic resonance damage (stacks up to 15%).',
        30: 'Successful compression, polarity, or storm sequences trigger a secondary micro-shockwave.',
        45: 'Reaching max resonance triggers a magnetic burst that staggers non-boss hostiles.'
      }
    }
  },
  kaelen: {
    id: 'kaelen',
    name: 'Kaelen Vos',
    role: 'Thermo-Lancer',
    color: '#FF5A26',
    accentName: 'ember',
    startingClass: 'cinderCorsair',
    base: [
      { id: 'kaelen:base:naphtha-jet', name: 'Naphtha Jet', level: 1, hotkey: '1', icon: 'naphthaJet', cooldown: 5.5, staminaCost: 12, desc: 'Rocket-propelled Ignis Lance charge leaving a blazing firewall trail and knocking back foes.' },
      { id: 'kaelen:base:caustic-mortar', name: 'Caustic Mortar', level: 1, hotkey: '2', icon: 'causticMortar', cooldown: 8.0, staminaCost: 14, desc: 'Lob a chemical slag shell applying Corrode and Burn in an expanding acid-fire pool.' },
      { id: 'kaelen:base:vent-supernova', name: 'Vent Supernova', level: 1, hotkey: '3', icon: 'ventSupernova', cooldown: 6.5, staminaCost: 10, desc: 'Discharge boiler steam for a 360-degree thermobaric shockwave and stun blast.' }
    ],
    ultimate: {
      id: 'kaelen:base:supercritical-meltdown',
      name: 'Supercritical Meltdown',
      level: 1,
      hotkey: 'R',
      icon: 'supercriticalMeltdown',
      cooldown: 0,
      staminaCost: 0,
      desc: 'Lock boiler valves for 8s of Supercritical Overdrive: +40% Speed, +50% DR, continuous flame torrent, molten slag footsteps, and a 240px thermobaric finale.'
    },
    classes: ['cinderCorsair', 'crucibleArchitect', 'cryoSaboteur'],
    intrinsic: {
      id: 'pressureInstinct',
      name: 'Pressure Instinct',
      desc: 'Kaelen commands extreme thermal cycles, turning volatile heat dissipation into lethal combat force.',
      ranks: {
        1: 'Displays boiler heat buildup gradients with clear audio-visual red-zone cues.',
        15: 'Attacking during the upper heat range (+75%) sharpens skill damage by an additional +10%.',
        30: 'Executing timed attacks reduces thermal recovery delay by 15% across all specializations.',
        45: 'Vent discharges leave a 4s thermal aura that burns hostiles and boosts move speed by +15%.'
      }
    }
  },
  vespera: {
    id: 'vespera',
    name: 'Vespera Locke',
    role: 'Artificer',
    color: '#9FA7FF',
    accentName: 'volt',
    startingClass: 'voltReaver',
    base: [
      { id: 'vespera:base:tesla-pylon', name: 'Tesla Pylon', level: 1, hotkey: '1', icon: 'teslaPylon', cooldown: 6.0, staminaCost: 10, desc: 'Deploy linked high-voltage spires that form a damaging, slowing laser fence.' },
      { id: 'vespera:base:seeker-swarm', name: 'Seeker Swarm', level: 1, hotkey: '2', icon: 'seekerSwarm', cooldown: 7.5, staminaCost: 12, desc: 'Launch homing explosive micro-drones that seek out targets and detonate on impact.' },
      { id: 'vespera:base:phase-blink', name: 'Phase Blink', level: 1, hotkey: '3', icon: 'phaseBlink', cooldown: 5.0, staminaCost: 8, desc: 'Teleport along cursor vector, emitting departure and arrival lightning shockwaves.' }
    ],
    ultimate: {
      id: 'vespera:base:overclocked-armada',
      name: 'Overclocked Armada',
      level: 1,
      hotkey: 'R',
      icon: 'overclockedArmada',
      cooldown: 0,
      staminaCost: 0,
      desc: 'Deploy 12 concentric Arc-Drones for 8s: active point-defense projectile zapping, continuous dual neon tracer beams, and a 12-drone kamikaze dive-bomb finale.'
    },
    classes: ['voltReaver', 'ironPuppeteer', 'stormCartographer'],
    intrinsic: {
      id: 'circuitIntuition',
      name: 'Circuit Intuition',
      desc: 'Vespera analyzes electrical grids and automated relays, optimizing drone networks and device feedback.',
      ranks: {
        1: 'Provides tactical HUD range circles and connection previews for active deployables.',
        15: 'Landing consecutive electro-strikes empowers the next device deployment with +15% radius.',
        30: 'Teleportation or phase maneuvers immediately discharge a defensive static arc to nearby foes.',
        45: 'Triggering three linked electrical events within 4s unleashes a cascading EMP overload.'
      }
    }
  }
};

export const SPECIALIZATIONS = {
  // =========================================================================
  // SENA IBUKI (3 Specializations)
  // =========================================================================
  phantomEdge: {
    id: 'phantomEdge',
    name: 'Phantom Edge',
    char: 'sena',
    concept: 'Blink assassin wielding paired spectral knives; reposition through Echo Anchors without Momentum.',
    stance: 'Twin specter knives; short dual strikes and instantaneous phase-hops.',
    mechanic: 'Echo Anchors — up to two afterimages placed by movement, allowing spatial repositioning cuts.',
    trait: {
      id: 'outOfFrame',
      name: 'Out of Frame',
      desc: 'After repositioning, Sena slips out of enemy focus, empowering her next strike.',
      ranks: {
        15: 'After using a blink or dodge, next attack gains +20% precision and critical chance.',
        30: 'Echo Anchors allow striking marked hostiles from either side, bypassing shield defenses.',
        45: 'A clean perfect evasion immediately refunds one Echo Anchor charge (5s cooldown).'
      }
    },
    skills: [
      {
        id: 'sena:phantomEdge:shadow-pin',
        name: 'Shadow Pin',
        level: 15,
        ultimate: false,
        cooldown: 5.0,
        staminaCost: 9,
        desc: 'Throw a spectral pin to designate a point or enemy. Recast blinks behind the target and cuts.',
        tuning: '5s cooldown; 180px throw reach; recast cuts 1.8x damage in a straight line.',
        fork: ['Bleed Pin (applies deep bleed over 4s)', 'Burst Pin (+40% instant single-target impact)']
      },
      {
        id: 'sena:phantomEdge:false-exit',
        name: 'False Exit',
        level: 15,
        ultimate: false,
        cooldown: 7.0,
        staminaCost: 10,
        desc: 'Drop a decoy Echo while dashing in a chosen direction; hits against the Echo trigger a counter slash.',
        tuning: '7s cooldown; decoy lasts 3.5s; counter slash deals 1.4x damage with 0.5s stagger.',
        fork: ['Lasting Echo (decoy lasts 6s and taunts)', 'Blast Echo (decoy explodes for 2.2x area damage on hit)']
      },
      {
        id: 'sena:phantomEdge:seam-cut',
        name: 'Seam Cut',
        level: 30,
        ultimate: false,
        cooldown: 10.0,
        staminaCost: 14,
        desc: 'Draw a dimensional line between two active Echoes; a delayed slash shreds everything crossing it.',
        tuning: '10s cooldown; deals 2.4x damage along the seam with 1.2s delay.',
        fork: ['Slow Crossing (enemies crossing line slowed by 50%)', 'Breaker Cut (deals +60% damage to stationary enemies)']
      },
      {
        id: 'sena:phantomEdge:borrowed-second',
        name: 'Borrowed Second',
        level: 30,
        ultimate: false,
        cooldown: 12.0,
        staminaCost: 12,
        desc: 'Rewind position to the location occupied 2.5s earlier, leaving a damaging spatial tear along the path.',
        tuning: '12s cooldown; rewinds HP by up to 35 damage lost in the last 2s; tear deals 1.6x damage.',
        fork: ['Safer Rewind (grants 1.0s invulnerability after rewind)', 'Stronger Trail (tear deals 2.5x damage and lingers)']
      },
      {
        id: 'sena:phantomEdge:midnight-corridor',
        name: 'Midnight Corridor',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Create multiple blink gateways across the zone; execute timed precision slashes behind pursuers.',
        tuning: 'Requires full ultimate charge; 6 rapid spatial strikes; boss remains grounded without displacement.',
        fork: ['Gateway Labyrinth (adds 2 extra strikes across wider zone)', 'Focus Decapitation (strikes concentrate on single highest HP foe)']
      }
    ]
  },

  riftBreaker: {
    id: 'riftBreaker',
    name: 'Rift Breaker',
    char: 'sena',
    concept: 'Heavy hydraulic gauntlet brawler creating terrain shockwaves and fracture lines; high stagger.',
    stance: 'Weighted knuckle punch combos with chargeable finishers and low reach.',
    mechanic: 'Pressure — builds from committed heavy strikes and perfect blocks; spent on ground ruptures.',
    trait: {
      id: 'unbrokenStance',
      name: 'Unbroken Stance',
      desc: 'Heavy attacks resist interruption, converting absorbed impact into crushing shockwaves.',
      ranks: {
        15: 'Attacking during windups grants 30% damage reduction and knockback immunity.',
        30: 'Blocking or absorbing heavy hits immediately generates 2 stacks of Pressure.',
        45: 'Fully charged strikes leave a secondary seismic fracture that detonates after 1s.'
      }
    },
    skills: [
      {
        id: 'sena:riftBreaker:pile-fist',
        name: 'Pile Fist',
        level: 15,
        ultimate: false,
        cooldown: 6.0,
        staminaCost: 12,
        desc: 'Charge and release a line-breaking punch; perfect release creates a shockwave behind the target.',
        tuning: '6s cooldown; 1.5x to 2.8x damage on charge; 140px shockwave cone.',
        fork: ['Narrow High-Stagger (120% extra stagger on direct hit)', 'Wide Cleave Fan (cone widened by 60% with pushback)']
      },
      {
        id: 'sena:riftBreaker:faultline-stomp',
        name: 'Faultline Stomp',
        level: 15,
        ultimate: false,
        cooldown: 8.5,
        staminaCost: 14,
        desc: 'Stamp a branching fracture pattern onto the floor; cracks erupt after a short visible warning.',
        tuning: '8.5s cooldown; 3 fracture lines extending 180px; erupts for 2.0x area damage.',
        fork: ['Deep Trenches (fractures linger for 4s, slowing enemies)', 'Rapid Tremor (erupts twice as fast for burst clear)']
      },
      {
        id: 'sena:riftBreaker:anchor-grip',
        name: 'Anchor Grip',
        level: 30,
        ultimate: false,
        cooldown: 9.0,
        staminaCost: 12,
        desc: 'Grab a small enemy or lock onto large armor; hurl small enemies or deliver an armor-shock to bosses.',
        tuning: '9s cooldown; throws small mobs for collision damage; deals 2.5x armor-shatter to bosses.',
        fork: ['Armor Shredder (reduces boss DEF by 20% for 6s)', 'Collateral Catapult (thrown hostiles deal 200% splash damage)']
      },
      {
        id: 'sena:riftBreaker:seismic-guard',
        name: 'Seismic Guard',
        level: 30,
        ultimate: false,
        cooldown: 11.0,
        staminaCost: 10,
        desc: 'Brief brace absorbs knockback; stored impact is redirected into a devastating forward cone.',
        tuning: '11s cooldown; 1.5s brace window; releases up to 3.0x absorbed damage in front.',
        fork: ['Extended Bastion (brace lasts 2.5s with +50% absorption)', 'Instant Retaliation (perfect timing immediately triggers max burst)']
      },
      {
        id: 'sena:riftBreaker:worldsplitter',
        name: 'Worldsplitter',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Smash both gauntlets down to create concentric fault rings; intersections deal critical damage.',
        tuning: 'Ultimate charge required; 3 expanding rings across 240px; 4.5x total potential damage.',
        fork: ['Cataclysmic Epicenter (core impact damage doubled)', 'Shattered Arena (fault rings leave burning seismic magma for 6s)']
      }
    ]
  },

  pulseDancer: {
    id: 'pulseDancer',
    name: 'Pulse Dancer',
    char: 'sena',
    concept: 'Rhythm-stance electro-dancer wielding conductive ribbon rings and fluid footwork.',
    stance: 'Alternating close and medium ribbon arcs timed to cadence markers.',
    mechanic: 'Beat Windows — optional timing rings on attacks; perfect cadence alters attack shape.',
    trait: {
      id: 'syncopation',
      name: 'Syncopation',
      desc: 'Executing strikes on rhythmic beats builds Harmony, empowering mobility and finishing strikes.',
      ranks: {
        15: 'Attacking on beat windows generates Harmony charges (+2% speed and +3% damage per charge).',
        30: 'At 5 Harmony charges, tapping dodge executes a free frictionless slide without stamina cost.',
        45: 'Surplus Harmony unleashes an electric chain pulse to up to 3 nearby foes on finishers.'
      }
    },
    skills: [
      {
        id: 'sena:pulseDancer:snapstep',
        name: 'Snapstep',
        level: 15,
        ultimate: false,
        cooldown: 4.5,
        staminaCost: 8,
        desc: 'Sidestep on a beat and fire a crescent electric pulse along the previous movement direction.',
        tuning: '4.5s cooldown; 100px quickstep; crescent deals 1.5x shock damage.',
        fork: ['Generous Cadence (widens beat window by 50%)', 'Perfect Forte (on-beat hit deals +45% extra burst)']
      },
      {
        id: 'sena:pulseDancer:conductive-loop',
        name: 'Conductive Loop',
        level: 15,
        ultimate: false,
        cooldown: 7.5,
        staminaCost: 11,
        desc: 'Throw a hovering electric hoop; enemies crossing its circumference get struck.',
        tuning: '7.5s cooldown; hoop lingers for 5s; 90px ring radius; zaps crossing targets for 1.2x damage.',
        fork: ['Orbiting Ribbon (loop follows Sena)', 'Rooted Dynamo (loop remains placed with +30% zap damage)']
      },
      {
        id: 'sena:pulseDancer:backbeat',
        name: 'Backbeat',
        level: 30,
        ultimate: false,
        cooldown: 9.0,
        staminaCost: 10,
        desc: 'Timed handclap parries incoming attacks and discharges an electrical pulse behind enemies.',
        tuning: '9s cooldown; 0.35s timing window; parry triggers 2.2x reverse shock pulse.',
        fork: ['Resonant Echo (pulse chains to 2 secondary targets)', 'Staggering Clap (parry applies 1.5s stun on attacker)']
      },
      {
        id: 'sena:pulseDancer:chain-waltz',
        name: 'Chain Waltz',
        level: 30,
        ultimate: false,
        cooldown: 12.0,
        staminaCost: 14,
        desc: 'Place three consecutive step markers; each successful step sparks the next into a finisher.',
        tuning: '12s cooldown; 3 sequential dashes dealing 1.0x, 1.3x, and 2.5x damage on finisher.',
        fork: ['Homing Waltz (steps automatically home toward enemies)', 'Precision Waypoints (player steers each step direction manually)']
      },
      {
        id: 'sena:pulseDancer:perfect-frequency',
        name: 'Perfect Frequency',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Stance sequence with telegraphed rhythm hits that crescendo into a massive electrical nova.',
        tuning: 'Ultimate charge required; 4-phase crescendo; deals baseline damage even if timing missed.',
        fork: ['Harmonic Overdrive (expands final nova radius to 300px)', 'Voltage Crescendo (each on-beat hit increases final nova damage by 25%)']
      }
    ]
  },

  // =========================================================================
  // ROOK MATSUDA (3 Specializations)
  // =========================================================================
  railHunter: {
    id: 'railHunter',
    name: 'Rail Hunter',
    char: 'rook',
    concept: 'Single-shot coil harpoon sniper seeking exposed weak-points and tethering to terrain.',
    stance: 'Slow aimed heavy harpoon with optional short-range sidearm discharge.',
    mechanic: 'Target Bearings — tagged weak-point angles reveal optimal piercing trajectories.',
    trait: {
      id: 'coldRead',
      name: 'Cold Read',
      desc: 'Observing targets without firing sharpens focus and ballistic velocity.',
      ranks: {
        15: 'Holding fire for 1.5s grants +25% damage and 100% pierce on the next harpoon shot.',
        30: 'Tethering to an anchor preserves 50% focus bonus through the repositioning move.',
        45: 'Hitting an exposed target bearing instantly grants one zero-cooldown follow-up shot (6s CD).'
      }
    },
    skills: [
      {
        id: 'rook:railHunter:harpoon-line',
        name: 'Harpoon Line',
        level: 15,
        ultimate: false,
        cooldown: 5.5,
        staminaCost: 10,
        desc: 'Fire a tether into valid terrain or an enemy. Recast pulls Rook rapidly toward the anchor.',
        tuning: '5.5s cooldown; 260px range; pull velocity 500px/s; bosses are never displaced.',
        fork: ['Anchor Slingshot (grants +40% speed for 2s after pull)', 'Heavy Cable (tether pins normal enemies to the floor for 2s)']
      },
      {
        id: 'rook:railHunter:sightline-break',
        name: 'Sightline Break',
        level: 15,
        ultimate: false,
        cooldown: 8.0,
        staminaCost: 11,
        desc: 'Deploy an optics beacon highlighting a firing corridor; shots along it pierce hostiles.',
        tuning: '8s cooldown; beacon lasts 6s; shots fired through corridor gain +30% damage and pierce.',
        fork: ['Wide Prism (firing corridor width widened by 75%)', 'Refractive Spike (piercing shots inflict Bleed on all struck enemies)']
      },
      {
        id: 'rook:railHunter:ricochet-survey',
        name: 'Ricochet Survey',
        level: 30,
        ultimate: false,
        cooldown: 10.0,
        staminaCost: 13,
        desc: 'Bounce a heavy slug off terrain to strike obscured targets around obstacles.',
        tuning: '10s cooldown; 1 bounce off obstacles; deals 2.2x damage on target after bounce.',
        fork: ['Double Deflection (allows 2 bounces with +20% damage per bounce)', 'Shatter Ricochet (slug splinters into 3 fragments upon first impact)']
      },
      {
        id: 'rook:railHunter:pinpoint-verdict',
        name: 'Pinpoint Verdict',
        level: 30,
        ultimate: false,
        cooldown: 12.0,
        staminaCost: 15,
        desc: 'Deliberate scoped shot at an exposed target region; perfect timing triggers massive stagger.',
        tuning: '12s cooldown; 0.8s aim delay; deals 3.2x critical damage with 80% boss stagger value.',
        fork: ['Armor Breach (permanently reduces target DEF by 15%)', 'Disorienting Impact (applies 2s stun to target and nearby enemies)']
      },
      {
        id: 'rook:railHunter:dead-meridian',
        name: 'Dead Meridian',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Mark multiple intersecting firing lines and release a timed salvo of hypersonic coil harpoons.',
        tuning: 'Ultimate charge required; 4 intersecting harpoon lines; intersection zones take 5.0x burst.',
        fork: ['Crossfire Matrix (adds 2 additional diagonal harpoons)', 'Meridian Singularity (intersections draw enemies inward before blast)']
      }
    ]
  },

  siegeGunner: {
    id: 'siegeGunner',
    name: 'Siege Gunner',
    char: 'rook',
    concept: 'Portable artillery chassis firing delayed mortar shells and deploying explosive drum zoning.',
    stance: 'Arc-firing explosive projectiles with slow cadence and visible ground markers.',
    mechanic: 'Heat Lanes — repeated mortar strikes in the same zone build heat; spacing shots optimizes yield.',
    trait: {
      id: 'siegeCalculation',
      name: 'Siege Calculation',
      desc: 'Careful pre-placement of bombardment zones multiplies destruction and cools artillery systems.',
      ranks: {
        15: 'Mortar shells hitting targets in the outer half of the blast circle deal +20% damage.',
        30: 'Landing consecutive shells in different zones vents heat and refunds 10% stamina.',
        45: 'Overlapping two shell detonations triggers a secondary concussive shockwave.'
      }
    },
    skills: [
      {
        id: 'rook:siegeGunner:mortar-beacon',
        name: 'Mortar Beacon',
        level: 15,
        ultimate: false,
        cooldown: 6.0,
        staminaCost: 12,
        desc: 'Lob a beacon that calls down a delayed high-explosive shell with clear ground telegraphing.',
        tuning: '6s cooldown; 1.2s delay; 90px blast radius; 2.2x explosive damage.',
        fork: ['Rapid Impact (shell arrives in 0.7s with smaller radius)', 'Bunker Buster (wider 130px radius with +35% damage)']
      },
      {
        id: 'rook:siegeGunner:bunker-roller',
        name: 'Bunker Roller',
        level: 15,
        ultimate: false,
        cooldown: 8.5,
        staminaCost: 13,
        desc: 'Deploy a slow armored explosive drum that pushes small mobs aside and explodes on command.',
        tuning: '8.5s cooldown; rolls 180px over 3s; manual recast or contact triggers 2.0x blast.',
        fork: ['Remote Landmine (roller parks and acts as proximity trap)', 'Rolling Cleaver (roller continuously shreds foes along its path)']
      },
      {
        id: 'rook:siegeGunner:salvo-grid',
        name: 'Salvo Grid',
        level: 30,
        ultimate: false,
        cooldown: 11.5,
        staminaCost: 16,
        desc: 'Draw a 3-cell pattern on the ground; shells land in the chosen sequence.',
        tuning: '11.5s cooldown; 3 mortar strikes spaced 0.4s apart; 1.8x damage per shell.',
        fork: ['Concentrated Cluster (all 3 shells land in tighter cluster for boss damage)', 'Carpet Barrage (wider 3-zone lane clearing entire screen corridors)']
      },
      {
        id: 'rook:siegeGunner:breakwater-shot',
        name: 'Breakwater Shot',
        level: 30,
        ultimate: false,
        cooldown: 9.0,
        staminaCost: 10,
        desc: 'Fire a concussive blast that deflects enemy projectiles and knocks away lesser enemies.',
        tuning: '9s cooldown; destroys or deflects enemy bullets in a 120px cone; knocks back mobs.',
        fork: ['Deflection Reflector (deflected bullets deal 150% damage back to enemies)', 'Shockwave Wall (leaves a 3s barrier that blocks light projectiles)']
      },
      {
        id: 'rook:siegeGunner:iron-weather',
        name: 'Iron Weather',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Open an artillery barrage window calling down sequential carpet bombardments across the arena.',
        tuning: 'Ultimate charge required; 8 heavy shells falling sequentially over 4s; 5.5x total damage.',
        fork: ['Incendiary Weather (shells leave burning napalm fields for 6s)', 'Thermobaric Finale (final shell explodes with 250px screen-wide blast)']
      }
    ]
  },

  circuitWarden: {
    id: 'circuitWarden',
    name: 'Circuit Warden',
    char: 'rook',
    concept: 'Aggressive combat engineer deploying pylons, scrambler disks, and overloaded circuits.',
    stance: 'Short-range arc-tool bolts with laser pointer targeting.',
    mechanic: 'Circuit Links — up to 3 placed devices connect into a damaging power graph.',
    trait: {
      id: 'feedbackLoop',
      name: 'Feedback Loop',
      desc: 'Active circuit networks return energy and channel destructive power along link lines.',
      ranks: {
        15: 'Enemies crossing between linked devices take continuous shock damage and are slowed by 25%.',
        30: 'Triggering an overload refunds 20% stamina and shortens device cooldowns by 1.5s.',
        45: 'Destroyed or detonated devices release a parting lightning burst to all enemies within 80px.'
      }
    },
    skills: [
      {
        id: 'rook:circuitWarden:arc-pylon',
        name: 'Arc Pylon',
        level: 15,
        ultimate: false,
        cooldown: 5.0,
        staminaCost: 9,
        desc: 'Place a pylon that zaps nearby foes. Linking two pylons creates a high-voltage laser wire.',
        tuning: '5s cooldown; max 3 pylons active; laser wire deals 1.4x continuous damage.',
        fork: ['Extended Grid (increases wire connection distance by 50%)', 'Overcharged Spire (individual pylons zap twice as fast)']
      },
      {
        id: 'rook:circuitWarden:scrambler-disk',
        name: 'Scrambler Disk',
        level: 15,
        ultimate: false,
        cooldown: 7.5,
        staminaCost: 11,
        desc: 'Throw a bouncing disk emitting electrical pulses that scramble enemy coordination.',
        tuning: '7.5s cooldown; bounces between up to 4 hostiles, dealing 1.3x shock damage and interrupting.',
        fork: ['EMP Pulse (disables enemy ranged attacks for 2.5s)', 'Discharge Trap (disk lodges in ground as a proximity stun mine)']
      },
      {
        id: 'rook:circuitWarden:relay-swap',
        name: 'Relay Swap',
        level: 30,
        ultimate: false,
        cooldown: 8.5,
        staminaCost: 10,
        desc: 'Instantly reposition an active device to cursor location; it discharges electricity along its path.',
        tuning: '8.5s cooldown; 200px swap range; path discharge deals 1.8x damage.',
        fork: ['Twin Discharge (discharges at both departure and arrival points)', 'Blink Relay (Rook swaps positions with the pylon instead)']
      },
      {
        id: 'rook:circuitWarden:overload-command',
        name: 'Overload Command',
        level: 30,
        ultimate: false,
        cooldown: 11.0,
        staminaCost: 14,
        desc: 'Sacrifice linked devices to create chained explosions; order determines knockback.',
        tuning: '11s cooldown; each detonated device deals 2.0x area damage with heavy stagger.',
        fork: ['Cascade Chain (each detonation deals +25% more damage than the last)', 'Residual Field (detonations leave lingering shock pools for 4s)']
      },
      {
        id: 'rook:circuitWarden:blackout-cascade',
        name: 'Blackout Cascade',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Launch attack drones that route electricity through all nearby nodes before a catastrophic network collapse.',
        tuning: 'Ultimate charge required; connects all enemies in a geometric shock grid ending in EMP burst.',
        fork: ['Infinite Relay (grid arcs to 6 additional targets)', 'Superconductor Collapse (final EMP deals double damage to shielded/boss targets)']
      }
    ]
  },

  // =========================================================================
  // INES CALLOWAY (3 Specializations)
  // =========================================================================
  magnetCrusher: {
    id: 'magnetCrusher',
    name: 'Magnet Crusher',
    char: 'ines',
    concept: 'Gravity-manipulating heavy magnetist forming localized compression fields and crushing metal masses.',
    stance: 'Heavy magnetic pulses and pressure gestures; deliberate casting animations.',
    mechanic: 'Compression Nodes — place short-lived pressure centers that tighten and collapse.',
    trait: {
      id: 'criticalMass',
      name: 'Critical Mass',
      desc: 'Accumulating compression fields builds gravitational pressure, amplifying inward implosions.',
      ranks: {
        15: 'Hostiles caught in compression centers take +15% more damage from all sources.',
        30: 'Overlapping two compression zones doubles the implosion pull and adds armor fracture.',
        45: 'Detonating a node with 3+ trapped hostiles refunds 50% of the skill cooldown.'
      }
    },
    skills: [
      {
        id: 'ines:magnetCrusher:crush-point',
        name: 'Crush Point',
        level: 15,
        ultimate: false,
        cooldown: 5.5,
        staminaCost: 11,
        desc: 'Mark a ground circle that tightens over 1.2s, then crushes enemies still within.',
        tuning: '5.5s cooldown; 100px radius shrinking to 30px; deals 2.2x heavy crush damage.',
        fork: ['Gravity Well (pulls enemies toward center before crush)', 'Spike Implosion (crush erupts with piercing metal shrapnel)']
      },
      {
        id: 'ines:magnetCrusher:iron-coffin',
        name: 'Iron Coffin',
        level: 15,
        ultimate: false,
        cooldown: 8.0,
        staminaCost: 13,
        desc: 'Form four suspended iron plates that slam together; traps normal mobs, pulses armor pressure on bosses.',
        tuning: '8s cooldown; traps standard mobs for 2s; deals 2.0x damage and 60% stagger to bosses.',
        fork: ['Armor Clamp (reduces boss DEF by 25% for 5s)', 'Shatter Plates (plates explode outward after slam for area damage)']
      },
      {
        id: 'ines:magnetCrusher:mass-driver',
        name: 'Mass Driver',
        level: 30,
        ultimate: false,
        cooldown: 9.5,
        staminaCost: 14,
        desc: 'Form a massive steel weight from environmental debris and launch it down a straight corridor.',
        tuning: '9.5s cooldown; does not consume scrap orbit; punches through line for 2.8x damage.',
        fork: ['Kinetic Piercer (slug pierces infinitely through all targets)', 'Ground Impact (slug crashes at target point, creating a shockwave crater)']
      },
      {
        id: 'ines:magnetCrusher:pressure-inversion',
        name: 'Pressure Inversion',
        level: 30,
        ultimate: false,
        cooldown: 11.0,
        staminaCost: 12,
        desc: 'Convert an active Compression Node into an outward shockwave, blasting foes away.',
        tuning: '11s cooldown; inverts inward node into 160px outward blast dealing 2.4x damage.',
        fork: ['Kinetic Blast (knocks normal enemies into walls for bonus collision damage)', 'Magnetic Vacuum (leaves a secondary vacuum pulling enemies back in)']
      },
      {
        id: 'ines:magnetCrusher:singularity-press',
        name: 'Singularity Press',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Converge massive industrial fragments into a central compression sphere, then violently flatten the zone.',
        tuning: 'Ultimate charge required; magnetic pressure implosion followed by 260px area blast.',
        fork: ['Event Horizon (extends inward suction pull duration to 3s)', 'Cataclysmic Flatten (crush impact deals massive critical damage to center)']
      }
    ]
  },

  scrapstorm: {
    id: 'scrapstorm',
    name: 'Scrapstorm',
    char: 'ines',
    concept: 'Wields a self-sustaining cloud of razor-sharp metal shards; high mobility and moving multi-hit blade fronts.',
    stance: 'Rapid cutting gusts of micro-shards circling Ines without requiring scrap inventory.',
    mechanic: 'Storm Fronts — directional shard currents follow player-directed paths and intersect.',
    trait: {
      id: 'cuttingCurrent',
      name: 'Cutting Current',
      desc: 'Fluid movement charges storm vortex intensity, increasing razor shard hit count.',
      ranks: {
        15: 'Continuous movement builds Storm Intensity (+10% attack speed and +15% shard hit rate).',
        30: 'Intersecting two active storm fronts triggers a razor vortex burst for 1.8x damage.',
        45: 'Dodging through an active storm accelerates it and grants Ines +25% move speed for 3s.'
      }
    },
    skills: [
      {
        id: 'ines:scrapstorm:razor-monsoon',
        name: 'Razor Monsoon',
        level: 15,
        ultimate: false,
        cooldown: 5.0,
        staminaCost: 10,
        desc: 'Send a moving rectangular storm across the floor, shredding enemies in its traveling path.',
        tuning: '5s cooldown; storm travels 200px over 3s; ticks for 0.4x damage 6 times.',
        fork: ['Persistent Deluge (storm travels slower and lasts 5s)', 'Gale Force (storm moves 50% faster with high knockback)']
      },
      {
        id: 'ines:scrapstorm:shiver-step',
        name: 'Shiver Step',
        level: 15,
        ultimate: false,
        cooldown: 6.5,
        staminaCost: 9,
        desc: 'Burst sideways, leaving a fan of sharp blade fragments behind that persists for 3s.',
        tuning: '6.5s cooldown; 120px sidestep; blade fan deals 1.5x damage to pursuing hostiles.',
        fork: ['Bladewall (fan forms a solid deterrent slowing enemies by 60%)', 'Razor Backlash (fan fires micro-shards at closest enemy)']
      },
      {
        id: 'ines:scrapstorm:crosswind',
        name: 'Crosswind',
        level: 30,
        ultimate: false,
        cooldown: 8.5,
        staminaCost: 11,
        desc: 'Bend an active storm through a chosen angle, redirecting its blade front through a new lane.',
        tuning: '8.5s cooldown; redirects active monsoon or shard fan with +30% accelerated speed.',
        fork: ['Cyclone Pivot (bending creates a spinning vortex at the pivot point)', 'Flensing Velocity (redirected storm deals +40% extra damage)']
      },
      {
        id: 'ines:scrapstorm:shard-cathedral',
        name: 'Shard Cathedral',
        level: 30,
        ultimate: false,
        cooldown: 12.0,
        staminaCost: 15,
        desc: 'Erect orbiting shard columns around an area; recast converges columns inward for a piercing strike.',
        tuning: '12s cooldown; 4 orbiting columns; convergence deals 2.8x piercing damage.',
        fork: ['Sanctuary Ring (Ines takes 25% reduced damage while inside cathedral)', 'Violent Collapse (columns explode into 16 outward razor needles)']
      },
      {
        id: 'ines:scrapstorm:thousand-knife-typhoon',
        name: 'Thousand-Knife Typhoon',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Fill arena with a massive rotating shard field, then collapse it into an outward razor wave.',
        tuning: 'Ultimate charge required; 240px rotating shard hurricane lasting 4s ending in a flensing wave.',
        fork: ['Whirlwind Vortex (drags enemies continuously into the cutting core)', 'Infinite Shards (shard wave expands screen-wide with bleed)']
      }
    ]
  },

  polarityBreaker: {
    id: 'polarityBreaker',
    name: 'Polarity Breaker',
    char: 'ines',
    concept: 'Fast technical electromagnetic duelist assigning positive and negative poles for collision combat.',
    stance: 'Magnetic gauntlets with rapid push/pull shock pulses.',
    mechanic: 'Polar Marks (+ / -) — assign polarities to enemies and anchors; opposites attract, likes repel.',
    trait: {
      id: 'fieldReversal',
      name: 'Field Reversal',
      desc: 'Alternating between positive and negative polarities empowers subsequent strikes.',
      ranks: {
        15: 'Alternating between (+) and (-) actions increases the next attack damage by +20%.',
        30: 'Perfect polarity flips reduce skill recovery time by 20% and grant brief hyper-armor.',
        45: 'Collision hits between opposite poles chain magnetic arcs to up to 2 nearby marked targets.'
      }
    },
    skills: [
      {
        id: 'ines:polarityBreaker:northbound',
        name: 'Northbound',
        level: 15,
        ultimate: false,
        cooldown: 5.0,
        staminaCost: 9,
        desc: 'Dash to a ground anchor while sending an electromagnetic pushing blade behind Ines.',
        tuning: '5s cooldown; 140px magnetic dash; rear wave deals 1.4x damage and repels.',
        fork: ['High-Tension Wire (leaves magnetic line tripping pursuers)', 'Magnetic Slingshot (dash distance increased to 220px with +30% speed)']
      },
      {
        id: 'ines:polarityBreaker:reverse-charge',
        name: 'Reverse Charge',
        level: 15,
        ultimate: false,
        cooldown: 7.0,
        staminaCost: 10,
        desc: 'Tag a cone of enemies with a pole, then flip the tag to blast them violently outward.',
        tuning: '7s cooldown; 120px cone; tags foes with (-); flip deals 1.8x damage and knockback.',
        fork: ['Polar Stagger (bosses take double stagger instead of knockback)', 'Chain Repulsion (enemies knocked into each other take collision damage)']
      },
      {
        id: 'ines:polarityBreaker:collision-course',
        name: 'Collision Course',
        level: 30,
        ultimate: false,
        cooldown: 9.5,
        staminaCost: 12,
        desc: 'Mark two points with opposite charges; nearby hostiles slam together into the center line.',
        tuning: '9.5s cooldown; opposites slam into center for 2.4x collision damage and 1s stun.',
        fork: ['Violent Impact (collision damage increased by 50%)', 'Extended Polarity (marked line continues to attract debris for 3s)']
      },
      {
        id: 'ines:polarityBreaker:mag-rail-surf',
        name: 'Mag-Rail Surf',
        level: 30,
        ultimate: false,
        cooldown: 11.0,
        staminaCost: 13,
        desc: 'Ride a brief self-created magnetic rail along cursor path, striking enemies near the line.',
        tuning: '11s cooldown; 200px ride trajectory; strikes all enemies along rail for 2.2x damage.',
        fork: ['Electrified Rails (rail lingers for 4s, shocking enemies who touch it)', 'Steerable Curve (player can curve rail trajectory around obstacles)']
      },
      {
        id: 'ines:polarityBreaker:zero-point-reversal',
        name: 'Zero-Point Reversal',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Alternate huge positive and negative pulses in lanes; final flip detonates built-up charge.',
        tuning: 'Ultimate charge required; 3 alternating field pulses followed by screen-wide polar detonation.',
        fork: ['Dual Magnetosphere (doubles pulse damage and stagger)', 'Singular Focus (final flip compresses all marked targets into one crushing point)']
      }
    ]
  },

  // =========================================================================
  // KAELEN VOS (3 Specializations)
  // =========================================================================
  cinderCorsair: {
    id: 'cinderCorsair',
    name: 'Cinder Corsair',
    char: 'kaelen',
    concept: 'Jet-powered aerial skirmisher wielding twin combustion cutters; fast aerial sweeps and hover hops.',
    stance: 'Twin plasma-cutters; short-range aerial sweeps and jet hover hops.',
    mechanic: 'Burn Routes — directional jet lanes stored for several seconds; independent of Boiler Pressure.',
    trait: {
      id: 'cinderWake',
      name: 'Cinder Wake',
      desc: 'High-speed jet navigation ignites the ground, enhancing cutter recovery and descending strikes.',
      ranks: {
        15: 'A clean jet dash or dodge improves next cutter attack recovery by 20%.',
        30: 'Passing through an active burn route adds a fiery pulse dealing 1.4x burn damage (3s CD).',
        45: 'Executing a three-route flyover sequence empowers the descending strike with guaranteed critical hit.'
      }
    },
    skills: [
      {
        id: 'kaelen:cinderCorsair:jet-sickle',
        name: 'Jet Sickle',
        level: 15,
        ultimate: false,
        cooldown: 5.0,
        staminaCost: 9,
        desc: 'Launch a curved burning cutter disk that returns along a steerable flight path.',
        tuning: '5s cooldown; 180px throw; returns to Kaelen; deals 1.5x on throw and 1.8x on return.',
        fork: ['Wide Arc (sweeps wider arc striking more side targets)', 'Concentrated Hit (returning hit deals +50% extra boss damage)']
      },
      {
        id: 'kaelen:cinderCorsair:thruster-feint',
        name: 'Thruster Feint',
        level: 15,
        ultimate: false,
        cooldown: 7.5,
        staminaCost: 10,
        desc: 'Burst through a telegraphed dash lane, leaving a fiery decoy nozzle that detonates.',
        tuning: '7.5s cooldown; 150px dash; decoy detonates when hostiles approach for 2.0x fire damage.',
        fork: ['Extended Dash (dash distance increased to 230px)', 'Napalm Decoy (decoy blast radius widened by 60% with burn)']
      },
      {
        id: 'kaelen:cinderCorsair:skyhook-dive',
        name: 'Skyhook Dive',
        level: 30,
        ultimate: false,
        cooldown: 11.0,
        staminaCost: 13,
        desc: 'Vault to a chosen landing circle, crashing down with a ring of explosive sparks and armor crack.',
        tuning: '11s cooldown; 200px vault; crash deals 2.6x area damage and applies 20% armor shatter.',
        fork: ['Explosive Ring (sparks form a 160px expanding fire ring)', 'Focused Core (direct central impact deals +40% single-target damage)']
      },
      {
        id: 'kaelen:cinderCorsair:razor-afterburn',
        name: 'Razor Afterburn',
        level: 30,
        ultimate: false,
        cooldown: 13.0,
        staminaCost: 14,
        desc: 'Draw two self-propelled burning blade tracks that cross the arena and retract on command.',
        tuning: '13s cooldown; tracks cross up to 240px; enemies crossing take 2.2x slicing burn damage.',
        fork: ['Supersonic Tracks (tracks travel 50% faster)', 'Enduring Inferno (blade tracks linger for 6s on the floor)']
      },
      {
        id: 'kaelen:cinderCorsair:crimson-flyover',
        name: 'Crimson Flyover',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Carve five player-steered aerial attack lanes in high-speed montage before a flame wheel dive.',
        tuning: 'Ultimate charge required; 5 aerial bombing passes culminating in a 240px flame crater.',
        fork: ['Saturation Carpet (leaves burning firestorm across all 5 lanes)', 'Precision Guillotine (final flame wheel deals massive single-target execute)']
      }
    ]
  },

  crucibleArchitect: {
    id: 'crucibleArchitect',
    name: 'Crucible Architect',
    char: 'kaelen',
    concept: 'Industrial forge controller printing molten molds, hydraulic presses, and molten blades.',
    stance: 'Industrial crucible glove and hot-metal stamping attacks.',
    mechanic: 'Mold Charges — 3 short-lived forge stamps; self-sustaining resource independent of Boiler Pressure.',
    trait: {
      id: 'kilnPrecision',
      name: 'Kiln Precision',
      desc: 'Precision placement of foundry molds accelerates cooling and unleashes pressurized shrapnel.',
      ranks: {
        15: 'Accurate stamp placement reduces warning-to-impact delay by 25%.',
        30: 'Landing a hydraulic press directly on a mold triggers an additional molten shockwave.',
        45: 'Completing a full forge sequence refunds one Mold Charge (5s cooldown).'
      }
    },
    skills: [
      {
        id: 'kaelen:crucibleArchitect:mold-stamp',
        name: 'Mold Stamp',
        level: 15,
        ultimate: false,
        cooldown: 6.5,
        staminaCost: 11,
        desc: 'Stamp a glowing iron shape on the floor; after warning, a molten iron spike erupts.',
        tuning: '6.5s cooldown; 0.8s warning; erupts for 2.0x molten piercing damage.',
        fork: ['Single Tall Spike (deals +45% damage with heavy armor pierce)', 'Triple Spikes (spawns 3 smaller spikes in a triangular spread)']
      },
      {
        id: 'kaelen:crucibleArchitect:pourline',
        name: 'Pourline',
        level: 15,
        ultimate: false,
        cooldown: 8.5,
        staminaCost: 12,
        desc: 'Draw a molten-metal line with the cursor; cools after a few seconds into sharp obsidian glass.',
        tuning: '8.5s cooldown; 180px line; molten channel burns for 1.2x damage, glass fractures for 1.8x.',
        fork: ['Long Thin Line (length increased to 280px)', 'Wide Slag Pool (wider pool applying heavy slow and burn)']
      },
      {
        id: 'kaelen:crucibleArchitect:foundry-press',
        name: 'Foundry Press',
        level: 30,
        ultimate: false,
        cooldown: 12.5,
        staminaCost: 15,
        desc: 'Drop a giant temporary hydraulic press on a chosen circle; ramps pressure before slamming.',
        tuning: '12.5s cooldown; 130px circle; slams for 3.2x damage with heavy stagger.',
        fork: ['Rapid Strike (press drops twice as fast with less warning)', 'Seismic Ramp (press charges 0.5s longer for +50% explosive crater damage)']
      },
      {
        id: 'kaelen:crucibleArchitect:quench-fracture',
        name: 'Quench Fracture',
        level: 30,
        ultimate: false,
        cooldown: 10.0,
        staminaCost: 12,
        desc: 'Rapidly cool an active mold with cryogenic brine, shattering it into outward piercing shards.',
        tuning: '10s cooldown; detonates active mold into 12 outward shards dealing 2.4x damage.',
        fork: ['Armor-Piercing Shards (shards pierce through all enemies in line)', 'Wider Scatter (shards explode in 360-degree radial ring)']
      },
      {
        id: 'kaelen:crucibleArchitect:cathedral-of-iron',
        name: 'Cathedral of Iron',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Summon an open-sided forge cathedral of floating metal ribs that slam sequentially into molten press.',
        tuning: 'Ultimate charge required; 4 perimeter rib slams ending in a central 260px molten hydraulic crush.',
        fork: ['Sequential Sunder (rib slams stagger and strip boss DEF by 30%)', 'Molten Inundation (central crush leaves lava lake for 8s)']
      }
    ]
  },

  cryoSaboteur: {
    id: 'cryoSaboteur',
    name: 'Cryo Saboteur',
    char: 'kaelen',
    concept: 'Endothermic demolition expert using freezing reagents, brittle fractures, and chemical shock.',
    stance: 'Twin coolant injectors and shattering chemical ampoules.',
    mechanic: 'Brittle Marks — frost stress accumulates on hostiles hit by coolant attacks; detonates on threshold.',
    trait: {
      id: 'thermalShock',
      name: 'Thermal Shock',
      desc: 'Alternating hot and sub-zero impacts induces thermal shock, shattering brittle armor.',
      ranks: {
        15: 'Coolant strikes apply Brittle Marks; hostiles at 3 marks take +20% damage from impact.',
        30: 'Triggering a Brittle threshold unleashes an endothermic ice-shatter pulse (4s CD).',
        45: 'Freezing impacts convert high brittle stacks into guaranteed 1.5s stagger on boss targets.'
      }
    },
    skills: [
      {
        id: 'kaelen:cryoSaboteur:cold-snap-canister',
        name: 'Cold Snap Canister',
        level: 15,
        ultimate: false,
        cooldown: 7.0,
        staminaCost: 10,
        desc: 'Throw a fast canister bursting into a freezing cloud, applying Slow and Brittle.',
        tuning: '7s cooldown; 110px freezing cloud lasting 4s; slows foes by 40% and ticks cold damage.',
        fork: ['Permafrost Cloud (cloud duration increased to 7s with 55% slow)', 'Flash-Freeze Impact (canister impact deals +60% direct damage)']
      },
      {
        id: 'kaelen:cryoSaboteur:fracture-wire',
        name: 'Fracture Wire',
        level: 15,
        ultimate: false,
        cooldown: 9.0,
        staminaCost: 11,
        desc: 'Place a taut brittle wire between two self-created stakes; triggers a splinter blast when crossed.',
        tuning: '9s cooldown; wire spans up to 180px; crossing trips 2.2x ice splinter blast.',
        fork: ['Hair-Trigger Wire (trips faster with +30% splinter range)', 'Cryo Snare (wire roots non-boss hostiles for 2s on trip)']
      },
      {
        id: 'kaelen:cryoSaboteur:thermocline-kick',
        name: 'Thermocline Kick',
        level: 30,
        ultimate: false,
        cooldown: 8.5,
        staminaCost: 11,
        desc: 'Dash across a temperature gradient and unleash an endothermic shatter burst at endpoint.',
        tuning: '8.5s cooldown; 140px dash; endpoint explosion deals 2.4x frost shatter damage.',
        fork: ['Long Skater (dash distance increased to 220px)', 'Sub-Zero Burst (endpoint burst radius widened by 50% with freeze)']
      },
      {
        id: 'kaelen:cryoSaboteur:zero-kelvin-flask',
        name: 'Zero-Kelvin Flask',
        level: 30,
        ultimate: false,
        cooldown: 13.0,
        staminaCost: 14,
        desc: 'Launch a large flask that freezes a marked ground patch and detonates into ice shrapnel.',
        tuning: '13s cooldown; 120px ice patch; countdown 2s before 3.0x shrapnel blast.',
        fork: ['Glacial Core (patch lingers for 6s freezing walking hostiles)', 'Shrapnel Bomb (ice shrapnel damage increased by 40%)']
      },
      {
        id: 'kaelen:cryoSaboteur:whiteout-rupture',
        name: 'Whiteout Rupture',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Swirling chemical blizzard rapidly crystallizes before shattering into staggered ice knives.',
        tuning: 'Ultimate charge required; 3-phase crystallization pulse ending in 280px screen-clearing rupture.',
        fork: ['Absolute Zero (freezes all standard hostiles solid for 3s)', 'Shatter Cataclysm (rupture shards deal critical damage to brittle targets)']
      }
    ]
  },

  // =========================================================================
  // VESPERA LOCKE (3 Specializations)
  // =========================================================================
  voltReaver: {
    id: 'voltReaver',
    name: 'Volt Reaver',
    char: 'vespera',
    concept: 'Aggressive melee lightning duelist with an electrified heavy cleaver and counter stance.',
    stance: 'Electrified heavy cleaver, fast step-in attacks, and charged ripostes.',
    mechanic: 'Charge Edges — close-range timed strikes accumulate 3 cleaver charges for finishers.',
    trait: {
      id: 'staticHunger',
      name: 'Static Hunger',
      desc: 'Close-quarters cleaver impacts absorb static electricity, empowering counters and thunder finishes.',
      ranks: {
        15: 'Consecutive cleaver hits improve the next attack speed by +15% and build static charge.',
        30: 'Executing a successful countercoil parry refunds 1 Charge Edge and 15 stamina.',
        45: 'Expending 3 Charge Edges unleashes an enhanced Thunderfinisher dealing +60% bonus damage.'
      }
    },
    skills: [
      {
        id: 'vespera:voltReaver:arc-rend',
        name: 'Arc Rend',
        level: 15,
        ultimate: false,
        cooldown: 5.0,
        staminaCost: 9,
        desc: 'Slash forward with a jagged lightning cleaver; manual recast sends arc along an angled line.',
        tuning: '5s cooldown; 1.5x damage on first cut; second cut deals 1.8x line damage.',
        fork: ['Wide Cleave Arc (first slash covers 180-degree forward arc)', 'Thunder Wave (second cut travels 180px as piercing projectile)']
      },
      {
        id: 'vespera:voltReaver:breaker-step',
        name: 'Breaker Step',
        level: 15,
        ultimate: false,
        cooldown: 7.0,
        staminaCost: 9,
        desc: 'Cross distance with a lightning dash and leave a delayed high-voltage discharge behind.',
        tuning: '7s cooldown; 130px lightning dash; departure discharge deals 1.6x shock damage.',
        fork: ['Extended Surge (dash distance increased to 200px)', 'Ground Conduction (departure discharge leaves shocking trail for 3s)']
      },
      {
        id: 'vespera:voltReaver:countercoil',
        name: 'Countercoil',
        level: 30,
        ultimate: false,
        cooldown: 11.0,
        staminaCost: 11,
        desc: 'Take a defensive stance; deflecting an incoming hit unleashes an enormous downward electric axe blow.',
        tuning: '11s cooldown; 0.4s parry window; retaliatory axe strike deals 3.0x critical shock damage.',
        fork: ['Forgiving Coil (parry window widened to 0.65s)', 'Titan Retaliation (counter blow deals +50% extra stagger to bosses)']
      },
      {
        id: 'vespera:voltReaver:thunder-guillotine',
        name: 'Thunder Guillotine',
        level: 30,
        ultimate: false,
        cooldown: 12.5,
        staminaCost: 14,
        desc: 'Carve a vertical electrical tear, then pull cleaver through it for an armor-breaking strike.',
        tuning: '12.5s cooldown; 2.8x damage; shatters 20% enemy armor for 5s.',
        fork: ['Armor Execution (deals +40% extra damage to targets below 35% HP)', 'Area Cleave (vertical tear explodes horizontally for crowd clear)']
      },
      {
        id: 'vespera:voltReaver:cataclysm-edge',
        name: 'Cataclysm Edge',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Rapid thunder-cleaver strikes carve luminous X marks across the arena, erupting into a final skybolt.',
        tuning: 'Ultimate charge required; 4 high-speed slash passes culminating in a 250px lightning skybolt.',
        fork: ['Overcharged Matrix (X marks erupt twice for cascading shockwaves)', 'Judgement Skybolt (single gigantic lightning strike dealing colossal burst)']
      }
    ]
  },

  ironPuppeteer: {
    id: 'ironPuppeteer',
    name: 'Iron Puppeteer',
    char: 'vespera',
    concept: 'Controls ONE massive walking war automaton directly; deliberate mechanical inputs over drone swarms.',
    stance: 'Wired control gloves with short-range shock tool directing a temporary remote construct.',
    mechanic: 'Command Queue — queue up to 3 explicit heavy actions for the automaton construct.',
    trait: {
      id: 'commandDiscipline',
      name: 'Command Discipline',
      desc: 'Disciplined queuing of automaton actions optimizes hydraulic recovery and impact force.',
      ranks: {
        15: 'Well-timed automaton orders gain 20% faster animation speed and recovery.',
        30: 'Completing three queued orders in succession triggers an automated radial shockwave.',
        45: 'Automaton construct expiring or completing its queue unleashes a parting kinetic burst.'
      }
    },
    skills: [
      {
        id: 'vespera:ironPuppeteer:titan-hand',
        name: 'Titan Hand',
        level: 15,
        ultimate: false,
        cooldown: 7.0,
        staminaCost: 12,
        desc: 'Summon the giant automaton hand into a marked spot, punching down to shatter enemy lines.',
        tuning: '7s cooldown; 110px impact circle; deals 2.2x heavy blunt damage with 1s stagger.',
        fork: ['Rapid Strike (fist drops in 0.5s with less warning)', 'Shock Ring (impact emits a 160px expanding kinetic ring)']
      },
      {
        id: 'vespera:ironPuppeteer:anchor-walk',
        name: 'Anchor Walk',
        level: 15,
        ultimate: false,
        cooldown: 9.5,
        staminaCost: 13,
        desc: 'Order automaton to march along a route while smashing lesser enemies in its path.',
        tuning: '9.5s cooldown; marches 180px over 2.5s; smashes for 1.8x damage and pushes mobs.',
        fork: ['Armored Ram (automaton takes 50% reduced hazard damage and marches faster)', 'Tectonic Treads (march leaves fractured tracks slowing enemies by 50%)']
      },
      {
        id: 'vespera:ironPuppeteer:chain-hoist',
        name: 'Chain Hoist',
        level: 30,
        ultimate: false,
        cooldown: 12.0,
        staminaCost: 14,
        desc: 'Issue a crane command that suspends small mobs and slams them; deals direct impact to bosses.',
        tuning: '12s cooldown; suspends up to 4 small mobs; deals 2.6x heavy slam damage.',
        fork: ['Multi-Target Crane (suspends up to 8 hostiles with wider slam)', 'Heavy Counterweight (boss impact damage increased by 45%)']
      },
      {
        id: 'vespera:ironPuppeteer:break-order',
        name: 'Break Order',
        level: 30,
        ultimate: false,
        cooldown: 14.0,
        staminaCost: 16,
        desc: 'Queue a three-hit drill/punch/hammer sequence; each stage is manually redirectable once.',
        tuning: '14s cooldown; 3 consecutive strikes dealing 1.2x, 1.6x, and 2.8x damage.',
        fork: ['Rapid Order (all 3 strikes execute 35% faster)', 'Crushing Hammer (final strike deals double damage and guaranteed stun)']
      },
      {
        id: 'vespera:ironPuppeteer:colossus-directive',
        name: 'Colossus Directive',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'Assemble one giant walking siege automaton for a multi-stage attack culminating in a ground-shattering fist.',
        tuning: 'Ultimate charge required; giant construct performs 3 sweeping slams and massive core punch.',
        fork: ['Siege Barrage (construct fires shoulder-mounted scrap cannons before slam)', 'Planetary Fist (final punch creates a 260px screen-wide earthquake)']
      }
    ]
  },

  stormCartographer: {
    id: 'stormCartographer',
    name: 'Storm Cartographer',
    char: 'vespera',
    concept: 'Battlefield weather mage sketching atmospheric pressure fronts and summoning sky lightning.',
    stance: 'Conductive weather baton; long-range bolt marks and cloud rings.',
    mechanic: 'Storm Lines — map two moving atmospheric vectors; crossings trigger focused lightning pillars.',
    trait: {
      id: 'atmosphericMapping',
      name: 'Atmospheric Mapping',
      desc: 'Mapping pressure bands predicts thunder corridors, increasing lightning strike potency.',
      ranks: {
        15: 'Storm routes display high-visibility vector previews and boost Vespera move speed by 10%.',
        30: 'Correctly angled storm lines increase their final lightning pulse damage by 25%.',
        45: 'Crossing storm lines call down a persistent thunderstorm pillar lasting 4s.'
      }
    },
    skills: [
      {
        id: 'vespera:stormCartographer:cloud-etching',
        name: 'Cloud Etching',
        level: 15,
        ultimate: false,
        cooldown: 7.0,
        staminaCost: 11,
        desc: 'Draw a moving cloud segment that rains electrical strikes along its trajectory over 4s.',
        tuning: '7s cooldown; cloud moves 200px over 4s; ticks for 0.5x damage 8 times.',
        fork: ['Long Thin Front (cloud length extended to 260px)', 'Dense Microburst (smaller cloud with +50% rain damage)']
      },
      {
        id: 'vespera:stormCartographer:pressure-drop',
        name: 'Pressure Drop',
        level: 15,
        ultimate: false,
        cooldown: 9.0,
        staminaCost: 12,
        desc: 'Create a localized downdraft that gathers lesser enemies toward center before a delayed thunder crack.',
        tuning: '9s cooldown; 110px draft pulling inward over 1.2s before 2.2x thunder crack.',
        fork: ['Stronger Inward Drift (pull force doubled for crowd grouping)', 'Accelerated Thunder (crack triggers in 0.6s with higher burst)']
      },
      {
        id: 'vespera:stormCartographer:isobar-sweep',
        name: 'Isobar Sweep',
        level: 30,
        ultimate: false,
        cooldown: 10.5,
        staminaCost: 13,
        desc: 'Shift an existing cloud route by drawing a new vector, turning a wide sweep into an angled strike.',
        tuning: '10.5s cooldown; redirects cloud segment; path crossing deals 2.4x lightning strike.',
        fork: ['Wide Sweep (sweeps 160-degree arc around arena)', 'Focused Lightning Spear (redirected strike concentrates into a piercing bolt)']
      },
      {
        id: 'vespera:stormCartographer:eye-of-storm',
        name: 'Eye of Storm',
        level: 30,
        ultimate: false,
        cooldown: 14.0,
        staminaCost: 15,
        desc: 'Create a circular storm with a quiet center; outer rotating wall damages and slows hostiles.',
        tuning: '14s cooldown; 160px diameter; outer wall slows by 50% and deals 0.6x tick damage.',
        fork: ['Larger Outer Radius (radius expanded to 220px)', 'Electrified Tempest (wall deals double damage and applies Shock)']
      },
      {
        id: 'vespera:stormCartographer:worldstorm-atlas',
        name: 'Worldstorm Atlas',
        level: 45,
        ultimate: true,
        cooldown: 0,
        staminaCost: 0,
        desc: 'A giant weather map overlays the arena; drawn pressure bands pulse with lightning before a pillar cluster.',
        tuning: 'Ultimate charge required; 3 intersecting pressure bands calling down 5 cascading ion pillars.',
        fork: ['Multi-Band Typhoon (pressure bands cover entire screen with continuous rain)', 'Compact Pillar Core (all 5 ion pillars strike in center for maximum boss execute)']
      }
    ]
  }
};

/**
 * Helper to get all skills for a character (base + unlocked class skills + ultimates)
 */
export function getAllSkillsForCharacter(charId) {
  const ch = CHARACTERS[charId];
  if (!ch) return [];

  const list = [];
  // 1. Starting active skills
  ch.base.forEach((sk) => {
    list.push({
      ...sk,
      charId,
      source: 'Original',
      type: 'active',
    });
  });

  // 2. Starting ultimate
  list.push({
    ...ch.ultimate,
    charId,
    source: 'Original',
    type: 'ultimate',
  });

  // 3. Class specialization skills
  ch.classes.forEach((classKey) => {
    const spec = SPECIALIZATIONS[classKey];
    if (!spec) return;
    spec.skills.forEach((sk) => {
      list.push({
        ...sk,
        charId,
        source: spec.name,
        classKey,
        type: sk.ultimate ? 'ultimate' : 'active',
      });
    });
  });

  return list;
}

/**
 * Helper to get learned skills based on character level and unlocked classes
 */
export function getLearnedSkillsForCharacter(charId, characterLevel, unlockedClasses = []) {
  const all = getAllSkillsForCharacter(charId);
  return all.filter((sk) => {
    // Starting skills always learned
    if (sk.source === 'Original') return true;
    // Must have unlocked the class
    if (!unlockedClasses.includes(sk.classKey)) return false;
    // Must meet the character level requirement (15, 30, 45)
    return characterLevel >= sk.level;
  });
}

/**
 * Helper to compute default skill slots for a character
 */
export function getDefaultSkillSlots(charId) {
  const ch = CHARACTERS[charId];
  if (!ch) return [null, null, null, null];
  return [
    ch.base[0]?.id || null,
    ch.base[1]?.id || null,
    ch.base[2]?.id || null,
    null // 4th slot empty or filled on first class change
  ];
}

/**
 * Helper to get default presets for a character
 */
export function getDefaultPresets(charId) {
  const ch = CHARACTERS[charId];
  const startingSpec = ch?.startingClass || 'phantomEdge';
  const defaultSlots = getDefaultSkillSlots(charId);
  const defaultUlt = ch?.ultimate?.id || null;

  return [
    {
      name: 'Boss',
      classId: startingSpec,
      slots: [...defaultSlots],
      ultimate: defaultUlt
    },
    {
      name: 'Mob Clear',
      classId: startingSpec,
      slots: [...defaultSlots],
      ultimate: defaultUlt
    },
    {
      name: 'Explore',
      classId: startingSpec,
      slots: [...defaultSlots],
      ultimate: defaultUlt
    }
  ];
}

/**
 * Returns specializations belonging to a character
 */
export function getClassesForCharacter(charId) {
  const ch = CHARACTERS[charId];
  if (!ch) return [];
  return ch.classes.map((k) => SPECIALIZATIONS[k]).filter(Boolean);
}

/**
 * Returns specialization by class key
 */
export function getClassById(classKey) {
  return SPECIALIZATIONS[classKey] || null;
}

/**
 * Global skill lookup across all characters, base abilities, and specializations
 */
export function getSkillById(skillId) {
  if (!skillId) return null;
  for (const charId of Object.keys(CHARACTERS)) {
    const skills = getAllSkillsForCharacter(charId);
    const found = skills.find((s) => s.id === skillId);
    if (found) return found;
  }
  return null;
}

/**
 * Evaluates auto-evolving Intrinsic Trait rank for character at given level (Ranks I-IV: Lv 1, 15, 30, 45)
 */
export function getIntrinsicTraitRank(charId, level = 1) {
  const ch = CHARACTERS[charId];
  if (!ch || !ch.intrinsic) return null;
  const ranks = ch.intrinsic.ranks;
  let activeRank = 1;
  let minLevel = 1;

  if (level >= 45) {
    activeRank = 4;
    minLevel = 45;
  } else if (level >= 30) {
    activeRank = 3;
    minLevel = 30;
  } else if (level >= 15) {
    activeRank = 2;
    minLevel = 15;
  } else {
    activeRank = 1;
    minLevel = 1;
  }

  return {
    id: ch.intrinsic.id,
    name: ch.intrinsic.name,
    desc: ch.intrinsic.desc,
    rank: activeRank,
    minLevel,
    text: ranks[minLevel] || '',
    allRanks: ranks
  };
}

/**
 * Evaluates auto-evolving Class Trait rank for specialization at given level (Ranks I-III: Lv 15, 30, 45)
 */
export function getClassTraitRank(classKey, level = 1) {
  const spec = SPECIALIZATIONS[classKey];
  if (!spec || !spec.trait) return null;
  if (level < 15) return null;

  let activeRank = 1;
  let minLevel = 15;

  if (level >= 45) {
    activeRank = 3;
    minLevel = 45;
  } else if (level >= 30) {
    activeRank = 2;
    minLevel = 30;
  } else {
    activeRank = 1;
    minLevel = 15;
  }

  return {
    id: spec.trait.id,
    name: spec.trait.name,
    desc: spec.trait.desc,
    rank: activeRank,
    minLevel,
    text: spec.trait.ranks[minLevel] || '',
    allRanks: spec.trait.ranks
  };
}

