/**
 * HellsAdvent — Data-Driven Obstacle Registry, Hazard Controller, & NavigationService
 * Implements Floor 1 Territory Obstacle Catalog, Obstacle Classes (Solid, Cover, Hazard, Dynamic Boss),
 * Sprite-Footprint Collision Validation, Flying/Burrowing Exceptions, and Spatial Grid Indexing.
 */

import { PALETTE, WORLD_CONFIG } from '../data/config.js';
import { drawBresenhamCircle, drawPixelLine } from './PixelArt.js';

/**
 * Reusable Data-Driven Obstacle Registry (Section 5)
 * Explicit flags: blocksMovement, blocksProjectile, blocksVision, destructible (false on Floor 1).
 * Collision is validated against ground sprite footprints (footprintRadius & footprintOffsetY).
 */
export const OBSTACLE_REGISTRY = {
  // ============================================================================
  // 1. SLAB TOWN (Industrial Wrecking Yard & Mall Ruins — North Sector)
  // ============================================================================
  slab_concrete_wall_short: {
    id: 'slab_concrete_wall_short',
    name: 'Broken Concrete Wall',
    territory: 'slab_town',
    category: 'solid',
    visualResource: 'res://obstacles/slab_concrete_wall_short',
    collisionShape: { type: 'footprint_circle', footprintRadius: 22, spriteWidth: 48, spriteHeight: 44, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  slab_scrap_barricade: {
    id: 'slab_scrap_barricade',
    name: 'Scrap-Metal Barricade',
    territory: 'slab_town',
    category: 'cover',
    visualResource: 'res://obstacles/slab_scrap_barricade',
    collisionShape: { type: 'footprint_circle', footprintRadius: 19, spriteWidth: 42, spriteHeight: 36, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: false, // Waist-high cover: blocks shots & movement, preserves sightlines
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  slab_rusted_container: {
    id: 'slab_rusted_container',
    name: 'Rusted Cargo Container',
    territory: 'slab_town',
    category: 'solid',
    visualResource: 'res://obstacles/slab_rusted_container',
    collisionShape: { type: 'footprint_circle', footprintRadius: 26, spriteWidth: 56, spriteHeight: 50, footprintOffsetY: 4 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  slab_abandoned_machinery: {
    id: 'slab_abandoned_machinery',
    name: 'Abandoned Stamping Press',
    territory: 'slab_town',
    category: 'solid',
    visualResource: 'res://obstacles/slab_abandoned_machinery',
    collisionShape: { type: 'footprint_circle', footprintRadius: 23, spriteWidth: 48, spriteHeight: 46, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  slab_steel_support: {
    id: 'slab_steel_support',
    name: 'Steel Support Gantry',
    territory: 'slab_town',
    category: 'cover',
    visualResource: 'res://obstacles/slab_steel_support',
    collisionShape: { type: 'footprint_circle', footprintRadius: 18, spriteWidth: 40, spriteHeight: 44, footprintOffsetY: 0 },
    blocksMovement: false, // Open girder arch with hanging chains: walk-through cover!
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  slab_exhaust_vent: {
    id: 'slab_exhaust_vent',
    name: 'Furnace Exhaust Grate',
    territory: 'slab_town',
    category: 'hazard',
    visualResource: 'res://obstacles/slab_exhaust_vent',
    collisionShape: { type: 'footprint_circle', footprintRadius: 26, spriteWidth: 52, spriteHeight: 52, footprintOffsetY: 0 },
    blocksMovement: false,
    blocksProjectile: false,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: {
      type: 'exhaust_vent',
      cyclePeriod: 6.5,
      telegraphSeconds: 1.4,
      activeSeconds: 2.4,
      effectRadius: 34,
      slowPct: 0.25,
      damagePerTick: 5,
      tickInterval: 0.8,
      statusId: 'burn',
      statusDuration: 2.5,
      affectsFlying: true,
      affectsBurrowed: false,
    },
  },

  // ============================================================================
  // 2. ROUTE 9 (Collapsed Highway & Diesel Corridor — West Sector)
  // ============================================================================
  r9_abandoned_truck: {
    id: 'r9_abandoned_truck',
    name: 'Abandoned Hauler Cab',
    territory: 'route_9',
    category: 'solid',
    visualResource: 'res://obstacles/r9_abandoned_truck',
    collisionShape: { type: 'footprint_circle', footprintRadius: 25, spriteWidth: 54, spriteHeight: 48, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  r9_crashed_vehicle: {
    id: 'r9_crashed_vehicle',
    name: 'Crashed Highway Wreck',
    territory: 'route_9',
    category: 'solid',
    visualResource: 'res://obstacles/r9_crashed_vehicle',
    collisionShape: { type: 'footprint_circle', footprintRadius: 21, spriteWidth: 46, spriteHeight: 40, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  r9_road_divider: {
    id: 'r9_road_divider',
    name: 'Concrete Road Divider',
    territory: 'route_9',
    category: 'cover',
    visualResource: 'res://obstacles/r9_road_divider',
    collisionShape: { type: 'footprint_circle', footprintRadius: 19, spriteWidth: 44, spriteHeight: 34, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  r9_broken_guardrail: {
    id: 'r9_broken_guardrail',
    name: 'Broken Steel Guardrail',
    territory: 'route_9',
    category: 'cover',
    visualResource: 'res://obstacles/r9_broken_guardrail',
    collisionShape: { type: 'footprint_circle', footprintRadius: 17, spriteWidth: 38, spriteHeight: 30, footprintOffsetY: 1 },
    blocksMovement: false, // Low bent guardrail: step-over cover that intercepts low shots
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  r9_collapsed_overpass: {
    id: 'r9_collapsed_overpass',
    name: 'Collapsed Overpass Pillar',
    territory: 'route_9',
    category: 'solid',
    visualResource: 'res://obstacles/r9_collapsed_overpass',
    collisionShape: { type: 'footprint_circle', footprintRadius: 27, spriteWidth: 58, spriteHeight: 52, footprintOffsetY: 4 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  r9_exhaust_vent: {
    id: 'r9_exhaust_vent',
    name: 'Ruptured Fuel Main',
    territory: 'route_9',
    category: 'hazard',
    visualResource: 'res://obstacles/r9_exhaust_vent',
    collisionShape: { type: 'footprint_circle', footprintRadius: 26, spriteWidth: 52, spriteHeight: 52, footprintOffsetY: 0 },
    blocksMovement: false,
    blocksProjectile: false,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: {
      type: 'exhaust_vent',
      cyclePeriod: 6.0,
      telegraphSeconds: 1.3,
      activeSeconds: 2.2,
      effectRadius: 34,
      slowPct: 0.25,
      damagePerTick: 5,
      tickInterval: 0.75,
      statusId: 'burn',
      statusDuration: 2.5,
      affectsFlying: true,
      affectsBurrowed: false,
    },
  },

  // ============================================================================
  // 3. LYE MARSH (Caustic Chemical Sump & Vat Dredge — East Sector)
  // ============================================================================
  lm_chemical_tank: {
    id: 'lm_chemical_tank',
    name: 'Rusted Chemical Tank',
    territory: 'lye_marsh',
    category: 'solid',
    visualResource: 'res://obstacles/lm_chemical_tank',
    collisionShape: { type: 'footprint_circle', footprintRadius: 23, spriteWidth: 48, spriteHeight: 46, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  lm_corroded_pipe: {
    id: 'lm_corroded_pipe',
    name: 'Corroded Vat Pipeline',
    territory: 'lye_marsh',
    category: 'cover',
    visualResource: 'res://obstacles/lm_corroded_pipe',
    collisionShape: { type: 'footprint_circle', footprintRadius: 19, spriteWidth: 42, spriteHeight: 36, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  lm_submerged_debris: {
    id: 'lm_submerged_debris',
    name: 'Submerged Grate & Reeds',
    territory: 'lye_marsh',
    category: 'cover',
    visualResource: 'res://obstacles/lm_submerged_debris',
    collisionShape: { type: 'footprint_circle', footprintRadius: 18, spriteWidth: 40, spriteHeight: 38, footprintOffsetY: 0 },
    blocksMovement: false, // Walkable marsh cover that breaks LOS and blocks low projectiles
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  lm_raised_sludge_bank: {
    id: 'lm_raised_sludge_bank',
    name: 'Raised Calcified Sludge Bank',
    territory: 'lye_marsh',
    category: 'solid',
    visualResource: 'res://obstacles/lm_raised_sludge_bank',
    collisionShape: { type: 'footprint_circle', footprintRadius: 24, spriteWidth: 50, spriteHeight: 46, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  lm_toxic_sludge: {
    id: 'lm_toxic_sludge',
    name: 'Caustic Lye Pool',
    territory: 'lye_marsh',
    category: 'hazard',
    visualResource: 'res://obstacles/lm_toxic_sludge',
    collisionShape: { type: 'footprint_circle', footprintRadius: 30, spriteWidth: 60, spriteHeight: 60, footprintOffsetY: 0 },
    blocksMovement: false,
    blocksProjectile: false,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: {
      type: 'toxic_sludge',
      cyclePeriod: 7.0,
      telegraphSeconds: 1.4,
      activeSeconds: 3.4,
      effectRadius: 36,
      slowPct: 0.35,
      damagePerTick: 4,
      tickInterval: 0.85,
      statusId: 'corrode',
      statusDuration: 3.0,
      affectsFlying: false, // Flying units pass safely above ground sludge
      affectsBurrowed: false,
    },
  },

  // ============================================================================
  // 4. COPPER FLATS (Open-Pit Strip Mine & Bore Wastes — South Sector)
  // ============================================================================
  cf_mining_equipment: {
    id: 'cf_mining_equipment',
    name: 'Abandoned Excavator Rig',
    territory: 'copper_flats',
    category: 'solid',
    visualResource: 'res://obstacles/cf_mining_equipment',
    collisionShape: { type: 'footprint_circle', footprintRadius: 25, spriteWidth: 54, spriteHeight: 48, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  cf_drill_head: {
    id: 'cf_drill_head',
    name: 'Salvaged Bore Drill Head',
    territory: 'copper_flats',
    category: 'solid',
    visualResource: 'res://obstacles/cf_drill_head',
    collisionShape: { type: 'footprint_circle', footprintRadius: 21, spriteWidth: 46, spriteHeight: 42, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  cf_buried_wreck: {
    id: 'cf_buried_wreck',
    name: 'Buried Crawler Chassis',
    territory: 'copper_flats',
    category: 'cover',
    visualResource: 'res://obstacles/cf_buried_wreck',
    collisionShape: { type: 'footprint_circle', footprintRadius: 18, spriteWidth: 40, spriteHeight: 34, footprintOffsetY: 1 },
    blocksMovement: false, // Half-buried hull provides projectile cover without blocking foot movement
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  cf_rock_formation: {
    id: 'cf_rock_formation',
    name: 'Copper-Seam Rock Pillar',
    territory: 'copper_flats',
    category: 'solid',
    visualResource: 'res://obstacles/cf_rock_formation',
    collisionShape: { type: 'footprint_circle', footprintRadius: 24, spriteWidth: 50, spriteHeight: 48, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  cf_rusted_machinery: {
    id: 'cf_rusted_machinery',
    name: 'Rusted Ore Crusher',
    territory: 'copper_flats',
    category: 'solid',
    visualResource: 'res://obstacles/cf_rusted_machinery',
    collisionShape: { type: 'footprint_circle', footprintRadius: 22, spriteWidth: 46, spriteHeight: 44, footprintOffsetY: 3 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: null,
  },
  cf_dust_vent: {
    id: 'cf_dust_vent',
    name: 'Silica Dust Geyser',
    territory: 'copper_flats',
    category: 'hazard',
    visualResource: 'res://obstacles/cf_dust_vent',
    collisionShape: { type: 'footprint_circle', footprintRadius: 28, spriteWidth: 56, spriteHeight: 56, footprintOffsetY: 0 },
    blocksMovement: false,
    blocksProjectile: false,
    blocksVision: true, // Obscures line-of-sight when venting
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: null,
    hazard: {
      type: 'dust_cloud',
      cyclePeriod: 6.8,
      telegraphSeconds: 1.3,
      activeSeconds: 2.8,
      effectRadius: 36,
      slowPct: 0.30,
      damagePerTick: 3,
      tickInterval: 0.9,
      statusId: 'choke',
      statusDuration: 2.5,
      affectsFlying: true,
      affectsBurrowed: false,
    },
  },

  // ============================================================================
  // 5. DYNAMIC BOSS OBSTACLES & HAZARDS (Section 3.4 & Section 4.1–4.4)
  // ============================================================================
  foreman_scrap_wall: {
    id: 'foreman_scrap_wall',
    name: 'Tactical Scrap Wall',
    territory: 'boss_dynamic',
    category: 'dynamic',
    ownerEncounterId: 'theForeman',
    visualResource: 'res://obstacles/foreman_scrap_wall',
    collisionShape: { type: 'footprint_circle', footprintRadius: 20, spriteWidth: 44, spriteHeight: 40, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: true,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: 8.5,
    telegraphSeconds: 0.55,
    resetCleanup: 'remove_on_reset',
    hazard: null,
  },
  axle_lane_machinery: {
    id: 'axle_lane_machinery',
    name: 'Dropped Diesel Transmission',
    territory: 'boss_dynamic',
    category: 'dynamic',
    ownerEncounterId: 'bigAxle',
    visualResource: 'res://obstacles/axle_lane_machinery',
    collisionShape: { type: 'footprint_circle', footprintRadius: 20, spriteWidth: 44, spriteHeight: 38, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: 9.0,
    telegraphSeconds: 0.6,
    resetCleanup: 'remove_on_reset',
    hazard: null,
  },
  axle_exhaust_zone: {
    id: 'axle_exhaust_zone',
    name: 'Superheated Exhaust Zone',
    territory: 'boss_dynamic',
    category: 'hazard',
    ownerEncounterId: 'bigAxle',
    visualResource: 'res://obstacles/axle_exhaust_zone',
    collisionShape: { type: 'footprint_circle', footprintRadius: 30, spriteWidth: 60, spriteHeight: 60, footprintOffsetY: 0 },
    blocksMovement: false,
    blocksProjectile: false,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: 7.5,
    telegraphSeconds: 0.85,
    resetCleanup: 'remove_on_reset',
    hazard: {
      type: 'exhaust_vent',
      cyclePeriod: null, // Active for duration after initial spawn telegraph
      telegraphSeconds: 0.85,
      activeSeconds: 7.5,
      effectRadius: 32,
      slowPct: 0.25,
      damagePerTick: 4,
      tickInterval: 0.8,
      statusId: 'burn',
      statusDuration: 2.0,
      affectsFlying: true,
      affectsBurrowed: false,
    },
  },
  sump_sludge_barrier: {
    id: 'sump_sludge_barrier',
    name: 'Raised Sludge Barrier',
    territory: 'boss_dynamic',
    category: 'dynamic',
    ownerEncounterId: 'motherSump',
    visualResource: 'res://obstacles/sump_sludge_barrier',
    collisionShape: { type: 'footprint_circle', footprintRadius: 20, spriteWidth: 44, spriteHeight: 38, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: 8.0,
    telegraphSeconds: 0.65,
    resetCleanup: 'remove_on_reset',
    hazard: null,
  },
  sump_sludge_pool: {
    id: 'sump_sludge_pool',
    name: 'Contamination Sludge Pool',
    territory: 'boss_dynamic',
    category: 'hazard',
    ownerEncounterId: 'motherSump',
    visualResource: 'res://obstacles/sump_sludge_pool',
    collisionShape: { type: 'footprint_circle', footprintRadius: 32, spriteWidth: 64, spriteHeight: 64, footprintOffsetY: 0 },
    blocksMovement: false,
    blocksProjectile: false,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: 8.5,
    telegraphSeconds: 0.8,
    resetCleanup: 'remove_on_reset',
    hazard: {
      type: 'toxic_sludge',
      cyclePeriod: null,
      telegraphSeconds: 0.8,
      activeSeconds: 8.5,
      effectRadius: 34,
      slowPct: 0.35,
      damagePerTick: 4,
      tickInterval: 0.85,
      statusId: 'corrode',
      statusDuration: 2.5,
      affectsFlying: false,
      affectsBurrowed: false,
    },
  },
  dry_sand_ridge: {
    id: 'dry_sand_ridge',
    name: 'Displaced Sand Ridge',
    territory: 'boss_dynamic',
    category: 'dynamic',
    ownerEncounterId: 'theLongDry',
    visualResource: 'res://obstacles/dry_sand_ridge',
    collisionShape: { type: 'footprint_circle', footprintRadius: 20, spriteWidth: 44, spriteHeight: 36, footprintOffsetY: 2 },
    blocksMovement: true,
    blocksProjectile: true,
    blocksVision: false,
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: 8.0,
    telegraphSeconds: 0.6,
    resetCleanup: 'remove_on_reset',
    hazard: null,
  },
  dry_dust_cloud: {
    id: 'dry_dust_cloud',
    name: 'Ambush Dust Cloud',
    territory: 'boss_dynamic',
    category: 'hazard',
    ownerEncounterId: 'theLongDry',
    visualResource: 'res://obstacles/dry_dust_cloud',
    collisionShape: { type: 'footprint_circle', footprintRadius: 34, spriteWidth: 68, spriteHeight: 68, footprintOffsetY: 0 },
    blocksMovement: false,
    blocksProjectile: false,
    blocksVision: true, // Obscures vision without hiding emergence ground rings
    blocksFlying: false,
    destructible: false,
    lifetimeSeconds: 7.0,
    telegraphSeconds: 0.7,
    resetCleanup: 'remove_on_reset',
    hazard: {
      type: 'dust_cloud',
      cyclePeriod: null,
      telegraphSeconds: 0.7,
      activeSeconds: 7.0,
      effectRadius: 36,
      slowPct: 0.25,
      damagePerTick: 0,
      tickInterval: 1.0,
      statusId: null,
      statusDuration: 0,
      affectsFlying: true,
      affectsBurrowed: false,
    },
  },
};

// Legacy kind aliases mapped to authoritative OBSTACLE_REGISTRY IDs
const LEGACY_KIND_MAP = {
  scrapBarricade: 'foreman_scrap_wall',
  highwayDebris: 'r9_road_divider',
  sludgeVat: 'lm_chemical_tank',
  borePillar: 'cf_drill_head',
};

export class ObstacleManager {
  constructor() {
    this.obstacles = []; // Dynamic boss-created obstacles & temporary hazards
    this.staticObstacles = []; // Territory-populated non-destructible obstacles & cyclic hazards
    this.spatialGrid = new Map();
    this.cellSize = 512;
    this.nextId = 1;
    this.clock = 0;

    this._initTerritoryObstacles();
  }

  getDefinition(kindOrId) {
    const mappedId = LEGACY_KIND_MAP[kindOrId] || kindOrId;
    return OBSTACLE_REGISTRY[mappedId] || OBSTACLE_REGISTRY.slab_concrete_wall_short;
  }

  _instantiateObstacle(defId, x, y, overrides = {}) {
    const def = this.getDefinition(defId);
    const shape = def.collisionShape || { footprintRadius: 20, footprintOffsetY: 0 };
    const radius = overrides.radius ?? shape.footprintRadius ?? 20;
    const lifetime = overrides.duration ?? def.lifetimeSeconds;
    const telegraph = overrides.telegraphSeconds ?? def.telegraphSeconds ?? 0;

    return {
      id: overrides.id || `obs_${this.nextId++}`,
      defId: def.id,
      kind: def.id,
      name: def.name,
      territory: def.territory,
      category: def.category,
      x: Math.round(x),
      y: Math.round(y),
      footprintX: Math.round(x),
      footprintY: Math.round(y + (shape.footprintOffsetY || 0)),
      radius,
      footprintRadius: radius,
      blocksMovement: overrides.blocksMovement ?? def.blocksMovement,
      blocksProjectile: overrides.blocksProjectile ?? def.blocksProjectile,
      blocksVision: overrides.blocksVision ?? def.blocksVision,
      blocksFlying: overrides.blocksFlying ?? def.blocksFlying ?? false,
      destructible: false,
      permanent: lifetime === null || lifetime === undefined,
      life: lifetime ?? 999999,
      maxLife: lifetime ?? 999999,
      telegraphTimer: telegraph,
      maxTelegraph: telegraph,
      ownerBossId: overrides.ownerBossId ?? def.ownerEncounterId ?? null,
      hazard: def.hazard ? { ...def.hazard } : null,
      phaseOffset: overrides.phaseOffset ?? 0,
      hazardTickTimer: 0.25,
    };
  }

  /**
   * Populates the four territories (Slab Town, Route 9, Lye Marsh, Copper Flats)
   * with distinct industrial-wasteland obstacle sets (~70% open movement space / 30% tactical terrain),
   * while keeping Kettle and all 4 Boss Arenas open and navigable.
   */
  _initTerritoryObstacles() {
    this.staticObstacles = [];
    this.spatialGrid.clear();

    const placements = [
      // ======================================================================
      // SLAB TOWN (North Sector: y < 2550, Foreman Arena at 3000, 1050)
      // Note: Foreman Arena keeps >340px around (3000, 1050) 100% clear for the 250px ritual ring & 310px No-Fusion AOE!
      // ======================================================================
      // Outer Arena Approach Chokepoints & Flanking Cover (y ~ 1420..1520)
      { defId: 'slab_concrete_wall_short', x: 2640, y: 1220 },
      { defId: 'slab_concrete_wall_short', x: 3360, y: 1220 },
      { defId: 'slab_scrap_barricade', x: 2790, y: 1430 },
      { defId: 'slab_scrap_barricade', x: 3210, y: 1430 },
      { defId: 'slab_steel_support', x: 2630, y: 1460 },
      { defId: 'slab_steel_support', x: 3370, y: 1460 },

      // Mid Slab Town Mall & Wrecking Yard Clusters (y ~ 1650..2420)
      { defId: 'slab_rusted_container', x: 2820, y: 1720 },
      { defId: 'slab_scrap_barricade', x: 2960, y: 1760 },
      { defId: 'slab_abandoned_machinery', x: 3180, y: 1710 },
      { defId: 'slab_exhaust_vent', x: 3000, y: 1870, phaseOffset: 0.0 },

      { defId: 'slab_concrete_wall_short', x: 2480, y: 1840 },
      { defId: 'slab_steel_support', x: 2590, y: 1930 },
      { defId: 'slab_rusted_container', x: 3480, y: 1850 },
      { defId: 'slab_scrap_barricade', x: 3360, y: 1950 },

      { defId: 'slab_abandoned_machinery', x: 2740, y: 2120 },
      { defId: 'slab_steel_support', x: 2880, y: 2180 },
      { defId: 'slab_exhaust_vent', x: 3090, y: 2140, phaseOffset: 2.2 },
      { defId: 'slab_concrete_wall_short', x: 3260, y: 2160 },

      { defId: 'slab_scrap_barricade', x: 2860, y: 2380 },
      { defId: 'slab_scrap_barricade', x: 3140, y: 2380 },
      { defId: 'slab_rusted_container', x: 2560, y: 2320 },
      { defId: 'slab_abandoned_machinery', x: 3440, y: 2320 },

      // ======================================================================
      // ROUTE 9 (West Sector: x < 2450, Big Axle Arena at 1050, 3000)
      // Wide charge runways preserved inside Big Axle's arena; peripheral lane dividers
      // ======================================================================
      { defId: 'r9_road_divider', x: 1320, y: 2780 },
      { defId: 'r9_road_divider', x: 1320, y: 3220 },
      { defId: 'r9_crashed_vehicle', x: 820, y: 2760 },
      { defId: 'r9_crashed_vehicle', x: 820, y: 3240 },

      // Highway Corridor Lane Choices & Overpass Sections (x ~ 1520..2400)
      { defId: 'r9_abandoned_truck', x: 1580, y: 2890 },
      { defId: 'r9_broken_guardrail', x: 1690, y: 2990 },
      { defId: 'r9_crashed_vehicle', x: 1590, y: 3130 },
      { defId: 'r9_exhaust_vent', x: 1760, y: 3020, phaseOffset: 0.8 },

      { defId: 'r9_collapsed_overpass', x: 1890, y: 2720 },
      { defId: 'r9_road_divider', x: 1940, y: 2880 },
      { defId: 'r9_road_divider', x: 1940, y: 3120 },
      { defId: 'r9_collapsed_overpass', x: 1890, y: 3280 },

      { defId: 'r9_abandoned_truck', x: 2160, y: 2910 },
      { defId: 'r9_broken_guardrail', x: 2180, y: 3060 },
      { defId: 'r9_exhaust_vent', x: 2290, y: 2980, phaseOffset: 3.1 },
      { defId: 'r9_crashed_vehicle', x: 2360, y: 2780 },
      { defId: 'r9_crashed_vehicle', x: 2360, y: 3210 },

      // ======================================================================
      // LYE MARSH (East Sector: x > 3550, Mother Sump Arena at 4950, 3000)
      // Open Devour interruption lanes near arena; chemical tanks, pipes, & toxic pools on approaches
      // ======================================================================
      { defId: 'lm_chemical_tank', x: 4680, y: 2780 },
      { defId: 'lm_chemical_tank', x: 4680, y: 3220 },
      { defId: 'lm_corroded_pipe', x: 5180, y: 2770 },
      { defId: 'lm_corroded_pipe', x: 5180, y: 3230 },

      // Marshland Vat & Sludge Approaches (x ~ 3600..4520)
      { defId: 'lm_raised_sludge_bank', x: 4440, y: 2880 },
      { defId: 'lm_submerged_debris', x: 4340, y: 3010 },
      { defId: 'lm_toxic_sludge', x: 4460, y: 3130, phaseOffset: 0.4 },

      { defId: 'lm_chemical_tank', x: 4140, y: 2750 },
      { defId: 'lm_corroded_pipe', x: 4120, y: 2920 },
      { defId: 'lm_toxic_sludge', x: 4060, y: 3060, phaseOffset: 2.6 },
      { defId: 'lm_raised_sludge_bank', x: 4160, y: 3240 },

      { defId: 'lm_submerged_debris', x: 3860, y: 2860 },
      { defId: 'lm_chemical_tank', x: 3780, y: 3020 },
      { defId: 'lm_corroded_pipe', x: 3880, y: 3160 },
      { defId: 'lm_toxic_sludge', x: 3660, y: 2940, phaseOffset: 4.5 },
      { defId: 'lm_raised_sludge_bank', x: 3640, y: 3140 },

      // ======================================================================
      // COPPER FLATS (South Sector: y > 3550, The Long Dry Arena at 3000, 4950)
      // Open emergence arena with outer bore drill pillars; blind corners & dust vents in quarry
      // ======================================================================
      { defId: 'cf_drill_head', x: 2760, y: 4680 },
      { defId: 'cf_drill_head', x: 3240, y: 4680 },
      { defId: 'cf_rock_formation', x: 2740, y: 5190 },
      { defId: 'cf_rock_formation', x: 3260, y: 5190 },

      // Strip-Mine Quarry Approaches (y ~ 3600..4520)
      { defId: 'cf_mining_equipment', x: 2860, y: 4420 },
      { defId: 'cf_buried_wreck', x: 3020, y: 4360 },
      { defId: 'cf_dust_vent', x: 3160, y: 4440, phaseOffset: 1.1 },

      { defId: 'cf_rock_formation', x: 2640, y: 4160 },
      { defId: 'cf_rusted_machinery', x: 2890, y: 4120 },
      { defId: 'cf_drill_head', x: 3140, y: 4140 },
      { defId: 'cf_rock_formation', x: 3360, y: 4180 },

      { defId: 'cf_dust_vent', x: 2960, y: 3920, phaseOffset: 3.4 },
      { defId: 'cf_mining_equipment', x: 2750, y: 3840 },
      { defId: 'cf_buried_wreck', x: 3180, y: 3860 },
      { defId: 'cf_rusted_machinery', x: 2860, y: 3640 },
      { defId: 'cf_drill_head', x: 3140, y: 3640 },
    ];

    for (let i = 0; i < placements.length; i++) {
      const p = placements[i];
      // Verify outside Kettle safe zone
      if (
        Math.hypot(p.x - WORLD_CONFIG.kettleCenter.x, p.y - WORLD_CONFIG.kettleCenter.y) <
        WORLD_CONFIG.kettleRadius + 140
      ) {
        continue;
      }
      const inst = this._instantiateObstacle(p.defId, p.x, p.y, {
        id: `static_${i + 1}`,
        phaseOffset: p.phaseOffset || (i * 0.7) % 5.0,
      });
      this.staticObstacles.push(inst);
      this._insertIntoSpatialGrid(inst);
    }
  }

  _getCellKey(cx, cy) {
    return `${cx},${cy}`;
  }

  _insertIntoSpatialGrid(obs) {
    const cx = Math.floor(obs.x / this.cellSize);
    const cy = Math.floor(obs.y / this.cellSize);
    const key = this._getCellKey(cx, cy);
    let bucket = this.spatialGrid.get(key);
    if (!bucket) {
      bucket = [];
      this.spatialGrid.set(key, bucket);
    }
    bucket.push(obs);
  }

  /**
   * Returns static obstacles in the 3x3 spatial grid cells around (x, y) plus all active dynamic obstacles.
   */
  getNearbyObstacles(x, y) {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const result = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const bucket = this.spatialGrid.get(this._getCellKey(cx + dx, cy + dy));
        if (bucket) {
          for (let i = 0; i < bucket.length; i++) {
            result.push(bucket[i]);
          }
        }
      }
    }

    for (let i = 0; i < this.obstacles.length; i++) {
      result.push(this.obstacles[i]);
    }
    return result;
  }

  clearTemporary() {
    this.obstacles = [];
  }

  clearByOwner(ownerBossId) {
    this.obstacles = this.obstacles.filter((o) => o.ownerBossId !== ownerBossId);
  }

  /**
   * Clears any dynamic obstacle within `radius` of `(x, y)` (used when bosses expose cores/shells or start rituals).
   */
  clearDynamicNear(x, y, radius = 90) {
    this.obstacles = this.obstacles.filter(
      (o) => Math.hypot(o.x - x, o.y - y) > radius + o.radius
    );
  }

  getAllActive() {
    return [...this.staticObstacles, ...this.obstacles];
  }

  /**
   * Returns true if a hazard obstacle is currently in its active effect window.
   */
  isHazardActive(obs) {
    if (!obs || !obs.hazard) return false;
    if (!obs.permanent) {
      return obs.telegraphTimer <= 0 && obs.life > 0;
    }
    const h = obs.hazard;
    const cycle = h.cyclePeriod || 6.5;
    const t = (this.clock + (obs.phaseOffset || 0)) % cycle;
    return t >= h.telegraphSeconds && t < h.telegraphSeconds + h.activeSeconds;
  }

  /**
   * Returns true if a hazard obstacle is currently in its telegraph warning window.
   */
  isHazardTelegraphing(obs) {
    if (!obs) return false;
    if (!obs.permanent) {
      return obs.telegraphTimer > 0;
    }
    if (!obs.hazard) return false;
    const h = obs.hazard;
    const cycle = h.cyclePeriod || 6.5;
    const t = (this.clock + (obs.phaseOffset || 0)) % cycle;
    return t < h.telegraphSeconds;
  }

  /**
   * Spawns a temporary boss-generated obstacle or hazard while guaranteeing it never overlaps the player,
   * seals a path, blocks the Foreman's ritual spawn ring, or blocks Mother Sump's Devour prey route.
   */
  spawnBossObstacle({
    kind = 'foreman_scrap_wall',
    x,
    y,
    radius = null,
    duration = null,
    ownerBossId = null,
    player = null,
    protectedTarget = null,
    ritualCenter = null,
    ritualClearRadius = 0,
  }) {
    if (this.obstacles.length >= 12) {
      this.obstacles.shift();
    }

    const def = this.getDefinition(kind);
    const effRadius = radius ?? def.collisionShape?.footprintRadius ?? 20;

    // 1. Never spawn inside Kettle safe zone
    const kdx = x - WORLD_CONFIG.kettleCenter.x;
    const kdy = y - WORLD_CONFIG.kettleCenter.y;
    if (Math.hypot(kdx, kdy) < WORLD_CONFIG.kettleRadius + 60) return null;

    // 2. Never spawn directly on top of the player (prevent trapping)
    if (
      player &&
      def.blocksMovement &&
      Math.hypot(x - player.x, y - player.y) < effRadius + (player.radius || 14) + 32
    ) {
      return null;
    }

    // 3. Never block a protected target (e.g. Mother Sump's Devour prey or Long Dry's real emergence)
    if (
      protectedTarget &&
      Math.hypot(x - protectedTarget.x, y - protectedTarget.y) < effRadius + 56
    ) {
      return null;
    }

    // 4. Never obstruct the Foreman's ritual ring or arrival body
    if (
      ritualCenter &&
      ritualClearRadius > 0 &&
      Math.hypot(x - ritualCenter.x, y - ritualCenter.y) < ritualClearRadius + effRadius
    ) {
      return null;
    }

    // 5. Enforce minimum navigable gap between solid obstacles so routes are never sealed
    if (def.blocksMovement) {
      const nearby = this.getNearbyObstacles(x, y);
      for (let i = 0; i < nearby.length; i++) {
        const other = nearby[i];
        if (!other.blocksMovement) continue;
        const minGap = effRadius + other.footprintRadius + 56;
        if (Math.hypot(x - other.x, y - other.y) < minGap) {
          return null;
        }
      }
    }

    const obs = this._instantiateObstacle(def.id, x, y, {
      radius: effRadius,
      duration: duration ?? def.lifetimeSeconds ?? 8.5,
      ownerBossId: ownerBossId ?? def.ownerEncounterId,
    });
    this.obstacles.push(obs);
    return obs;
  }

  /**
   * Updates dynamic obstacle timers and applies data-defined environmental hazards to grounded actors.
   */
  update(dt, player = null, spawner = null, particles = null, camera = null) {
    this.clock += dt;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      if (o.telegraphTimer > 0) {
        o.telegraphTimer = Math.max(0, o.telegraphTimer - dt);
      } else if (!o.permanent) {
        o.life -= dt;
        if (o.life <= 0) {
          this.obstacles.splice(i, 1);
          continue;
        }
      }
    }

    // Evaluate active hazards near the player/camera
    if (!player) return;
    const nearby = this.getNearbyObstacles(player.x, player.y);
    const enemies =
      spawner && typeof spawner.getAllActiveEnemies === 'function'
        ? spawner.getAllActiveEnemies()
        : spawner
        ? spawner.pool
        : [];

    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      if (!o.hazard || !this.isHazardActive(o)) continue;

      const h = o.hazard;
      const r = h.effectRadius || o.radius;
      o.hazardTickTimer -= dt;
      if (o.hazardTickTimer > 0) continue;
      o.hazardTickTimer = h.tickInterval || 0.8;

      // Check player inside hazard
      if (
        !player.dead &&
        (!player.dodgeTimer || player.dodgeTimer <= 0) &&
        Math.hypot(player.x - o.x, player.y - o.y) <= r + (player.radius || 12)
      ) {
        if (h.damagePerTick > 0) {
          player.hp = Math.max(1, player.hp - h.damagePerTick);
        }
        if (h.statusId && player.statuses) {
          player.statuses.apply(
            h.statusId,
            { duration: h.statusDuration || 2.5, sourceName: o.name },
            player,
            particles
          );
        }
      }

      // Check enemies inside hazard (respecting flying & burrowing immunity flags)
      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        if (!e || !e.active || e.hp <= 0 || e.tier === 'boss') continue;
        if (e.flying && !h.affectsFlying) continue;
        const isBurrowed = !!(e.bm && e.bm.subsurfaceTimer > 0) || !!e.isBurrowed;
        if (isBurrowed && !h.affectsBurrowed) continue;

        if (Math.hypot(e.x - o.x, e.y - o.y) <= r + (e.radius || 12)) {
          if (h.statusId && e.statuses) {
            e.statuses.apply(
              h.statusId,
              { duration: h.statusDuration || 2.0, sourceName: o.name },
              e,
              particles
            );
          }
        }
      }
    }
  }

  /**
   * Returns movement speed multiplier (0.55..1.0) for an actor standing in an active environmental hazard.
   * Explicitly exempts flying or burrowed actors according to the hazard definition.
   */
  getHazardSpeedMultiplier(entity) {
    if (!entity) return 1.0;
    const isFlying = !!entity.flying || !!entity.isFlying;
    const isBurrowed =
      !!(entity.bm && entity.bm.subsurfaceTimer > 0) || !!entity.isBurrowed;

    const nearby = this.getNearbyObstacles(entity.x, entity.y);
    let minMult = 1.0;

    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      if (!o.hazard || !this.isHazardActive(o)) continue;
      const h = o.hazard;
      if (isFlying && !h.affectsFlying) continue;
      if (isBurrowed && !h.affectsBurrowed) continue;

      const r = h.effectRadius || o.radius;
      if (Math.hypot(entity.x - o.x, entity.y - o.y) <= r + (entity.radius || 12)) {
        const mult = 1 - (h.slowPct || 0);
        if (mult < minMult) minMult = mult;
      }
    }
    return minMult;
  }

  /**
   * Resolves circle collision against sprite footprints of active solid obstacles (`blocksMovement: true`).
   * Flying and burrowed actors have explicit, consistent exceptions (`options.isFlying`, `options.isBurrowed`).
   */
  resolveEntityCollision(x, y, entityRadius = 12, options = {}) {
    if (options.isBurrowed) {
      return { x, y, collided: false, hitObstacle: null };
    }

    let rx = x;
    let ry = y;
    let collided = false;
    let hitObstacle = null;
    const nearby = this.getNearbyObstacles(rx, ry);

    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      if (!o.blocksMovement) continue;
      if (o.telegraphTimer > 0) continue; // Do not collide while still telegraphing emergence
      if (options.isFlying && !o.blocksFlying) continue;

      const fx = o.footprintX ?? o.x;
      const fy = o.footprintY ?? o.y;
      const fr = o.footprintRadius ?? o.radius;

      const dx = rx - fx;
      const dy = ry - fy;
      const dist = Math.hypot(dx, dy) || 0.01;
      const minDist = entityRadius + fr;
      if (dist < minDist) {
        const push = minDist - dist;
        rx += (dx / dist) * push;
        ry += (dy / dist) * push;
        collided = true;
        hitObstacle = o;
      }
    }
    return { x: rx, y: ry, collided, hitObstacle };
  }

  /**
   * Ensures a spawn point, emergence point, or fusion centroid is outside any solid obstacle footprint.
   */
  findSafePosition(x, y, entityRadius = 16) {
    let rx = x;
    let ry = y;
    for (let pass = 0; pass < 3; pass++) {
      const res = this.resolveEntityCollision(rx, ry, entityRadius + 8);
      rx = res.x;
      ry = res.y;
      if (!res.collided) break;
    }
    return { x: Math.round(rx), y: Math.round(ry) };
  }

  /**
   * Returns true if point (x, y) is inside any movement-blocking obstacle footprint.
   */
  isPointBlocked(x, y, entityRadius = 12, options = {}) {
    const res = this.resolveEntityCollision(x, y, entityRadius, options);
    return res.collided;
  }

  /**
   * Checks if a projectile at (x, y) hits any obstacle with `blocksProjectile: true`.
   * Preserves Rook's intended piercing abilities when projectile.piercesObstacles is true.
   */
  checkProjectileCollision(proj) {
    if (!proj || proj.piercesObstacles || proj.pierce >= 8) return false;
    const nearby = this.getNearbyObstacles(proj.x, proj.y);
    const pr = proj.radius || 4;
    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      if (!o.blocksProjectile || o.telegraphTimer > 0) continue;
      const fx = o.footprintX ?? o.x;
      const fy = o.footprintY ?? o.y;
      const fr = o.footprintRadius ?? o.radius;
      const dx = proj.x - fx;
      const dy = proj.y - fy;
      if (dx * dx + dy * dy <= (fr + pr) * (fr + pr)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if a melee attack between (x1, y1) and (x2, y2) is blocked by a full-height solid wall
   * (`blocksMovement && blocksProjectile && blocksVision`), while allowing melee across low cover.
   */
  hasMeleeReach(x1, y1, x2, y2) {
    const nearby = this.getNearbyObstacles((x1 + x2) * 0.5, (y1 + y2) * 0.5);
    const vx = x2 - x1;
    const vy = y2 - y1;
    const lenSq = vx * vx + vy * vy;
    if (lenSq < 1) return true;

    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      if (!o.blocksMovement || !o.blocksProjectile || !o.blocksVision || o.telegraphTimer > 0) {
        continue;
      }
      const fx = o.footprintX ?? o.x;
      const fy = o.footprintY ?? o.y;
      const fr = Math.max(6, (o.footprintRadius ?? o.radius) - 4);
      const t = Math.max(0, Math.min(1, ((fx - x1) * vx + (fy - y1) * vy) / lenSq));
      const px = x1 + t * vx;
      const py = y1 + t * vy;
      const distSq = (fx - px) * (fx - px) + (fy - py) * (fy - py);
      if (distSq < fr * fr) {
        return false;
      }
    }
    return true;
  }

  /**
   * Raycast Line-of-Sight check between two points (`blocksVision: true`).
   * Respects cover flags (waist-high cover with `blocksVision: false` does not block sight;
   * active dust clouds with `blocksVision: true` block sight while venting).
   */
  hasLineOfSight(x1, y1, x2, y2) {
    const nearby = this.getNearbyObstacles((x1 + x2) * 0.5, (y1 + y2) * 0.5);
    const vx = x2 - x1;
    const vy = y2 - y1;
    const lenSq = vx * vx + vy * vy;
    if (lenSq < 1) return true;

    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      if (!o.blocksVision || o.telegraphTimer > 0) continue;
      if (o.hazard && !this.isHazardActive(o)) continue;

      const fx = o.footprintX ?? o.x;
      const fy = o.footprintY ?? o.y;
      const fr = Math.max(6, (o.footprintRadius ?? o.radius) - 2);
      const t = Math.max(0, Math.min(1, ((fx - x1) * vx + (fy - y1) * vy) / lenSq));
      const px = x1 + t * vx;
      const py = y1 + t * vy;
      const distSq = (fx - px) * (fx - px) + (fy - py) * (fy - py);
      if (distSq < fr * fr) {
        return false;
      }
    }
    return true;
  }

  /**
   * NavigationService: Steers a desired movement vector (dirX, dirY) smoothly around nearby solid obstacles
   * and active environmental hazards.
   */
  steerDirection(x, y, dirX, dirY, entityRadius = 13, options = {}) {
    if (options.isFlying || options.isBurrowed) {
      return { dirX, dirY };
    }

    const nearby = this.getNearbyObstacles(x, y);
    const lookAhead = 46 + entityRadius;
    let sx = dirX;
    let sy = dirY;

    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      const isSolid = o.blocksMovement && o.telegraphTimer <= 0;
      const isActiveHazard = o.hazard && this.isHazardActive(o) && !options.ignoreHazards;
      if (!isSolid && !isActiveHazard) continue;

      const fx = o.footprintX ?? o.x;
      const fy = o.footprintY ?? o.y;
      const fr = o.footprintRadius ?? o.radius;

      const toObsX = fx - x;
      const toObsY = fy - y;
      const dist = Math.hypot(toObsX, toObsY);
      if (dist > lookAhead + fr || dist < 0.01) continue;

      const dot = toObsX * dirX + toObsY * dirY;
      if (dot <= 0) continue; // Obstacle is behind movement vector

      const weight = isSolid ? 1.45 : 0.65;
      const avoidStrength = Math.max(0, 1 - dist / (lookAhead + fr)) * weight;
      const perp1X = -toObsY / dist;
      const perp1Y = toObsX / dist;
      const cross = toObsX * dirY - toObsY * dirX;
      const sign = cross >= 0 ? 1 : -1;

      sx += perp1X * sign * avoidStrength;
      sy += perp1Y * sign * avoidStrength;
    }

    const norm = Math.hypot(sx, sy) || 1;
    return { dirX: sx / norm, dirY: sy / norm };
  }

  /**
   * Renders visible obstacles, cover silhouettes, and telegraphed hazards at 480x270 native resolution.
   */
  draw(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;
    const centerWx = camX + camera.width * 0.5;
    const centerWy = camY + camera.height * 0.5;
    const nearby = this.getNearbyObstacles(centerWx, centerWy);

    for (let i = 0; i < nearby.length; i++) {
      const o = nearby[i];
      if (!camera.isVisible(o.x, o.y, o.radius + 36)) continue;

      const sx = Math.round(o.x - camX);
      const sy = Math.round(o.y - camY);
      const r = o.radius;

      // 1. Environmental Hazards (telegraphed ground vents, caustic pools, dust clouds)
      if (o.category === 'hazard' || o.hazard) {
        this._drawHazardObstacle(ctx, o, sx, sy, r);
        continue;
      }

      // 2. Dynamic Boss Obstacle spawn telegraph (0.6s ground warning before emerging)
      if (o.telegraphTimer > 0) {
        drawBresenhamCircle(ctx, sx, sy, r, PALETTE.signal, 0.5);
        drawPixelLine(ctx, sx - 6, sy, sx + 6, sy, PALETTE.brass, 1);
        drawPixelLine(ctx, sx, sy - 6, sx, sy + 6, PALETTE.brass, 1);
        continue;
      }

      // Ground shadow under footprint
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - r - 1, sy + r - 4, r * 2 + 2, 5);

      this._drawObstacleVisual(ctx, o, sx, sy, r);

      // Cover indicator badge (subtle 2px cyan corner notch on non-movement-blocking or low-cover structures)
      if (o.category === 'cover' || !o.blocksVision) {
        ctx.fillStyle = PALETTE.boneDark;
        ctx.fillRect(sx - r + 1, sy - r + 3, 4, 1);
      }

      // Expiration warning flicker during final 1.5s of temporary boss obstacles
      if (!o.permanent && o.life < 1.5 && Math.floor(o.life * 10) % 2 === 0) {
        ctx.fillStyle = PALETTE.signal;
        ctx.fillRect(sx - r, sy - r + 3, r * 2, 1);
      }
    }
  }

  _drawHazardObstacle(ctx, o, sx, sy, r) {
    const h = o.hazard;
    const effR = h ? h.effectRadius || r : r;
    const isTelegraph = this.isHazardTelegraphing(o);
    const isActive = this.isHazardActive(o);

    // Base grate / basin silhouette
    if (h?.type === 'toxic_sludge') {
      ctx.fillStyle = PALETTE.bogDark;
      ctx.fillRect(sx - r + 4, sy - r + 6, r * 2 - 8, r * 2 - 12);
      ctx.fillStyle = isActive ? PALETTE.lye : PALETTE.bog;
      ctx.fillRect(sx - r + 7, sy - r + 9, r * 2 - 14, r * 2 - 18);
    } else if (h?.type === 'dust_cloud') {
      ctx.fillStyle = PALETTE.rustDark;
      ctx.fillRect(sx - 10, sy - 6, 20, 12);
      ctx.fillStyle = PALETTE.boneDark;
      ctx.fillRect(sx - 6, sy - 3, 12, 6);
    } else {
      // Exhaust / steam grate
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx - 14, sy - 10, 28, 20);
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(sx - 12, sy - 8, 24, 16);
      ctx.fillStyle = PALETTE.soot;
      for (let gx = -8; gx <= 8; gx += 4) {
        ctx.fillRect(sx + gx, sy - 6, 2, 12);
      }
    }

    if (isTelegraph) {
      // Clear warning ring + 4 cardinal safe-exit ticks
      const warnColor =
        h?.type === 'toxic_sludge'
          ? PALETTE.lye
          : h?.type === 'dust_cloud'
          ? PALETTE.brass
          : PALETTE.ember;
      drawBresenhamCircle(ctx, sx, sy, effR, warnColor, 0.5);
      // Outward safe-exit ticks
      drawPixelLine(ctx, sx, sy - effR - 2, sx, sy - effR - 5, warnColor, 1);
      drawPixelLine(ctx, sx, sy + effR + 2, sx, sy + effR + 5, warnColor, 1);
      drawPixelLine(ctx, sx - effR - 2, sy, sx - effR - 5, sy, warnColor, 1);
      drawPixelLine(ctx, sx + effR + 2, sy, sx + effR + 5, sy, warnColor, 1);
    } else if (isActive) {
      const activeColor =
        h?.type === 'toxic_sludge'
          ? PALETTE.lye
          : h?.type === 'dust_cloud'
          ? PALETTE.boneDark
          : PALETTE.ember;
      drawBresenhamCircle(ctx, sx, sy, effR, activeColor, 1.0);
      const pulse = Math.floor(this.clock * 8) % 3;
      for (let k = 0; k < 4; k++) {
        const ang = (k * Math.PI) / 2 + pulse * 0.4;
        const px = Math.round(sx + Math.cos(ang) * (effR * 0.55));
        const py = Math.round(sy + Math.sin(ang) * (effR * 0.55));
        ctx.fillStyle = activeColor;
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
  }

  _drawObstacleVisual(ctx, o, sx, sy, r) {
    const id = o.defId;

    // SLAB TOWN OBSTACLES
    if (id === 'slab_concrete_wall_short') {
      ctx.fillStyle = PALETTE.slagDark;
      ctx.fillRect(sx - r, sy - r + 4, r * 2, r * 2 - 4);
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(sx - r + 2, sy - r + 6, r * 2 - 4, r * 2 - 10);
      ctx.fillStyle = PALETTE.boneDark;
      ctx.fillRect(sx - r + 2, sy - r + 6, r * 2 - 5, 2); // Top-left highlight
      // Exposed rebar rods
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - r + 5, sy - r, 2, 5);
      ctx.fillRect(sx + r - 8, sy - r + 1, 2, 4);
      return;
    }

    if (id === 'slab_scrap_barricade' || id === 'foreman_scrap_wall') {
      ctx.fillStyle = PALETTE.slagDark;
      ctx.fillRect(sx - r, sy - r + 5, r * 2, r * 2 - 5);
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(sx - r + 2, sy - r + 7, r * 2 - 4, r * 2 - 9);
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - r + 3, sy - 2, r * 2 - 6, 5);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - r + 4, sy - r + 8, 3, 3);
      ctx.fillRect(sx + r - 7, sy - r + 8, 3, 3);
      return;
    }

    if (id === 'slab_rusted_container') {
      ctx.fillStyle = PALETTE.rustDark;
      ctx.fillRect(sx - r, sy - r + 3, r * 2, r * 2 - 3);
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - r + 2, sy - r + 5, r * 2 - 4, r * 2 - 7);
      ctx.fillStyle = PALETTE.rustLight;
      ctx.fillRect(sx - r + 2, sy - r + 5, r * 2 - 4, 2);
      // Corrugated vertical ribs
      ctx.fillStyle = PALETTE.rustDark;
      for (let rx = -r + 6; rx < r - 4; rx += 6) {
        ctx.fillRect(sx + rx, sy - r + 8, 2, r * 2 - 12);
      }
      return;
    }

    if (id === 'slab_abandoned_machinery' || id === 'cf_rusted_machinery') {
      ctx.fillStyle = PALETTE.slagDark;
      ctx.fillRect(sx - r, sy - r + 4, r * 2, r * 2 - 4);
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(sx - r + 3, sy - r + 6, r * 2 - 6, r * 2 - 8);
      // Flywheel & brass gauge
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - 8, sy - 8, 16, 16);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - 3, sy - 3, 6, 6);
      return;
    }

    if (id === 'slab_steel_support') {
      // Open I-beam gantry frame with hanging chains (walk-through cover)
      ctx.fillStyle = PALETTE.slagDark;
      ctx.fillRect(sx - r, sy - r + 2, 5, r * 2 - 2);
      ctx.fillRect(sx + r - 5, sy - r + 2, 5, r * 2 - 2);
      ctx.fillStyle = PALETTE.rustLight;
      ctx.fillRect(sx - r, sy - r + 2, r * 2, 5);
      // Hanging chains that break LOS & intercept shots
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(sx - 6, sy - r + 7, 2, r * 2 - 10);
      ctx.fillRect(sx + 4, sy - r + 7, 2, r * 2 - 10);
      return;
    }

    // ROUTE 9 OBSTACLES
    if (id === 'r9_abandoned_truck') {
      ctx.fillStyle = PALETTE.rustDark;
      ctx.fillRect(sx - r, sy - r + 4, r * 2, r * 2 - 4);
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - r + 2, sy - r + 6, r * 2 - 12, r * 2 - 8);
      // Cab windshield & grille
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(sx + r - 10, sy - r + 7, 8, r * 2 - 10);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(sx + r - 8, sy - r + 9, 4, r * 2 - 14);
      return;
    }

    if (id === 'r9_crashed_vehicle' || id === 'axle_lane_machinery') {
      ctx.fillStyle = PALETTE.slagDark;
      ctx.fillRect(sx - r, sy - r + 5, r * 2, r * 2 - 5);
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(sx - r + 2, sy - r + 7, r * 2 - 4, r * 2 - 9);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - r + 4, sy - 2, r * 2 - 8, 4);
      return;
    }

    if (id === 'r9_road_divider') {
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(sx - r, sy - r + 6, r * 2, r * 2 - 6);
      ctx.fillStyle = PALETTE.boneDark;
      ctx.fillRect(sx - r + 2, sy - r + 7, r * 2 - 4, 5);
      drawPixelLine(ctx, sx - r + 4, sy + 2, sx + r - 4, sy + 2, PALETTE.brass, 2);
      return;
    }

    if (id === 'r9_broken_guardrail' || id === 'cf_buried_wreck') {
      ctx.fillStyle = PALETTE.slagDark;
      ctx.fillRect(sx - r, sy - 5, r * 2, 10);
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(sx - r + 2, sy - 4, r * 2 - 4, 3);
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - r + 4, sy + 2, 4, 6);
      ctx.fillRect(sx + r - 8, sy + 2, 4, 6);
      return;
    }

    if (id === 'r9_collapsed_overpass') {
      ctx.fillStyle = PALETTE.slagDark;
      ctx.fillRect(sx - r, sy - r + 2, r * 2, r * 2 - 2);
      ctx.fillStyle = PALETTE.slag;
      ctx.fillRect(sx - r + 3, sy - r + 5, r * 2 - 6, r * 2 - 8);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - r + 6, sy, r * 2 - 12, 3);
      return;
    }

    // LYE MARSH OBSTACLES
    if (id === 'lm_chemical_tank') {
      ctx.fillStyle = PALETTE.bogDark;
      ctx.fillRect(sx - r, sy - r + 4, r * 2, r * 2 - 4);
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - r + 3, sy - r + 6, r * 2 - 6, r * 2 - 8);
      ctx.fillStyle = PALETTE.lye;
      ctx.fillRect(sx - r + 6, sy - r + 8, r * 2 - 12, 5);
      return;
    }

    if (id === 'lm_corroded_pipe') {
      ctx.fillStyle = PALETTE.bogDark;
      ctx.fillRect(sx - r, sy - 8, r * 2, 16);
      ctx.fillStyle = PALETTE.bogLight;
      ctx.fillRect(sx - r + 2, sy - 6, r * 2 - 4, 4);
      ctx.fillStyle = PALETTE.lye;
      ctx.fillRect(sx - 4, sy - 2, 8, 5);
      return;
    }

    if (id === 'lm_submerged_debris') {
      ctx.fillStyle = PALETTE.bogDark;
      ctx.fillRect(sx - r + 2, sy - r + 4, r * 2 - 4, r * 2 - 8);
      ctx.fillStyle = PALETTE.verdigris;
      for (let rx = -r + 5; rx < r - 4; rx += 5) {
        ctx.fillRect(sx + rx, sy - r + 2, 2, r * 2 - 6);
      }
      return;
    }

    if (id === 'lm_raised_sludge_bank' || id === 'sump_sludge_barrier') {
      ctx.fillStyle = PALETTE.bogDark;
      ctx.fillRect(sx - r, sy - r + 5, r * 2, r * 2 - 5);
      ctx.fillStyle = PALETTE.bog;
      ctx.fillRect(sx - r + 3, sy - r + 7, r * 2 - 6, r * 2 - 9);
      ctx.fillStyle = PALETTE.lye;
      ctx.fillRect(sx - r + 5, sy - r + 7, r * 2 - 10, 3);
      return;
    }

    // COPPER FLATS OBSTACLES
    if (id === 'cf_mining_equipment') {
      ctx.fillStyle = PALETTE.rustDark;
      ctx.fillRect(sx - r, sy - r + 3, r * 2, r * 2 - 3);
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(sx - r + 3, sy - r + 5, r * 2 - 6, r * 2 - 7);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(sx - 9, sy - 9, 18, 6);
      ctx.fillStyle = PALETTE.slagLight;
      ctx.fillRect(sx - 5, sy - 2, 10, 10);
      return;
    }

    if (id === 'cf_rock_formation' || id === 'dry_sand_ridge') {
      ctx.fillStyle = PALETTE.rustDark;
      ctx.fillRect(sx - r, sy - r + 5, r * 2, r * 2 - 5);
      ctx.fillStyle = PALETTE.dustBrown;
      ctx.fillRect(sx - r + 3, sy - r + 7, r * 2 - 6, r * 2 - 9);
      ctx.fillStyle = PALETTE.verdigris; // Copper ore vein highlight
      ctx.fillRect(sx - 5, sy - 4, 10, 2);
      return;
    }

    // Default / cf_drill_head
    ctx.fillStyle = PALETTE.rustDark;
    ctx.fillRect(sx - r, sy - r + 3, r * 2, r * 2 - 3);
    ctx.fillStyle = PALETTE.rustLight;
    ctx.fillRect(sx - r + 3, sy - r + 5, r * 2 - 6, r * 2 - 7);
    ctx.fillStyle = PALETTE.brass;
    ctx.fillRect(sx - 4, sy - 4, 8, 8);
  }
}

export const obstacleManager = new ObstacleManager();
