/**
 * GRAVEL SKY — Enemy Spawner, Grid-Based Spatial Partitioning, & Boss Arena Manager
 * Spawns every 1.2s if < 40 active, 520-700px from player, off screen, never inside Kettle.
 * Despawns beyond 1200px. Uses a 250x250 spatial grid for O(1) neighbor/combat queries.
 */

import {
  PALETTE,
  SPAWNER_CONFIG,
  ENEMIES_CONFIG,
  WORLD_CONFIG,
  SHOP_ITEMS,
} from '../data/config.js';
import { Enemy } from './Enemy.js';
import { sound } from './Audio.js';
import { bossMechanics } from './BossMechanics.js';
import { obstacleManager } from './Obstacles.js';
import { worldLedger } from './WorldLedger.js';
import { SUGGESTED_BOSS_ORDER } from '../data/expansionConfig.js';

export class Spawner {
  constructor(world = null) {
    this.world = world;
    bossMechanics.setEnemyClass(Enemy);
    // Pre-allocated enemy pool (up to 64 for normal-origin enemies per D35)
    this.pool = Array.from({ length: 64 }, () => new Enemy());
    this.enemies = this.pool;
    this.spawnTimer = 0.6;

    // Spatial Hash Grid (250px cells over 6000x6000 world -> 24x24 cells)
    this.cellSize = 250;
    this.gridCols = Math.ceil(WORLD_CONFIG.size / this.cellSize);
    this.grid = new Map();

    // Boss state tracking
    this.defeatedBosses = {
      theForeman: false,
      bigAxle: false,
      motherSump: false,
      theLongDry: false,
    };
    this.bossRespawnTimers = {
      theForeman: 0,
      bigAxle: 0,
      motherSump: 0,
      theLongDry: 0,
    };
    this.activeBossInstances = {
      theForeman: null,
      bigAxle: null,
      motherSump: null,
      theLongDry: null,
    };

    // Boss Name Card banner on arena entry / spawn
    this.bossNameCard = null; // { name, subtitle, timer }
  }

  clear() {
    for (let i = 0; i < this.pool.length; i++) {
      this.pool[i].active = false;
      this.pool[i].dead = false;
    }
    this.activeBossInstances = {
      theForeman: null,
      bigAxle: null,
      motherSump: null,
      theLongDry: null,
    };
    this.bossNameCard = null;
    if (this.grid && typeof this.grid.clear === 'function') {
      this.grid.clear();
    }
  }

  _getFreeEnemy() {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) return this.pool[i];
    }
    return null;
  }

  getActiveCount() {
    let count = 0;
    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      if (e.active && e.tier !== 'boss' && !e.isRitualOrigin) count++;
    }
    return count;
  }

  /**
   * Returns all active enemies across both the 64-slot normal pool AND the dynamic RitualActorStore (D45/D46).
   */
  getAllActiveEnemies() {
    const out = [];
    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      if (e.active && e.hp > 0) out.push(e);
    }
    if (bossMechanics && Array.isArray(bossMechanics.ritualActors)) {
      for (let i = 0; i < bossMechanics.ritualActors.length; i++) {
        const ra = bossMechanics.ritualActors[i];
        if (ra && ra.active && ra.hp > 0) out.push(ra);
      }
    }
    return out;
  }

  rebuildSpatialGrid() {
    this.grid.clear();
    const insertEntity = (e) => {
      if (!e || !e.active || e.hp <= 0) return;
      const cx = Math.floor(e.x / this.cellSize);
      const cy = Math.floor(e.y / this.cellSize);
      const key = `${cx},${cy}`;
      let cell = this.grid.get(key);
      if (!cell) {
        cell = [];
        this.grid.set(key, cell);
      }
      cell.push(e);
    };

    for (let i = 0; i < this.pool.length; i++) {
      insertEntity(this.pool[i]);
    }
    // D45 / D46: Include all dynamically allocated Foreman ritual-origin actors in the spatial hash grid
    if (bossMechanics && Array.isArray(bossMechanics.ritualActors)) {
      for (let i = 0; i < bossMechanics.ritualActors.length; i++) {
        insertEntity(bossMechanics.ritualActors[i]);
      }
    }
  }

  queryRadius(x, y, radius) {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);
    const results = [];

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const cell = this.grid.get(`${cx},${cy}`);
        if (!cell) continue;
        for (let i = 0; i < cell.length; i++) {
          results.push(cell[i]);
        }
      }
    }
    return results;
  }

  _computeScaleMult(playerLevel, area) {
    if (!area || !area.levelBand) return 1.0;
    const [minLvl, maxLvl] = area.levelBand;
    const clampedLvl = Math.max(minLvl, Math.min(maxLvl, playerLevel));
    const levelsAboveMin = Math.max(0, clampedLvl - minLvl);
    // +6% HP and damage per player level inside the area's level band
    return 1 + levelsAboveMin * SPAWNER_CONFIG.levelScalePerPlayerLevel;
  }

  _isInsideKettle(wx, wy, world = null) {
    const w = world || this.world;
    if (w && typeof w.isInsideKettle === 'function') {
      return w.isInsideKettle(wx, wy);
    }
    const dx = wx - WORLD_CONFIG.kettleCenter.x;
    const dy = wy - WORLD_CONFIG.kettleCenter.y;
    return dx * dx + dy * dy <= WORLD_CONFIG.kettleRadius * WORLD_CONFIG.kettleRadius;
  }

  _getAreaAt(wx, wy, world = null) {
    const w = world || this.world;
    if (w && typeof w.getAreaAt === 'function') {
      return w.getAreaAt(wx, wy);
    }
    if (w && typeof w.getZoneAt === 'function') {
      return w.getZoneAt(wx, wy);
    }
    const dx = wx - WORLD_CONFIG.kettleCenter.x;
    const dy = wy - WORLD_CONFIG.kettleCenter.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= WORLD_CONFIG.kettleRadius * WORLD_CONFIG.kettleRadius) {
      return WORLD_CONFIG.areas.kettle;
    }
    if (Math.abs(dy) >= Math.abs(dx)) {
      return dy < 0 ? WORLD_CONFIG.areas.slabTown : WORLD_CONFIG.areas.copperFlats;
    } else {
      return dx < 0 ? WORLD_CONFIG.areas.route9 : WORLD_CONFIG.areas.lyeMarsh;
    }
  }

  _trySpawnWave(player, world) {
    const activeCount = this.getActiveCount();
    if (activeCount >= SPAWNER_CONFIG.maxActive) return;
    const activeWorld = world || this.world;

    // Pick a random point 520-700px from the player, never inside Kettle
    for (let attempt = 0; attempt < 10; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist =
        SPAWNER_CONFIG.minSpawnDist +
        Math.random() * (SPAWNER_CONFIG.maxSpawnDist - SPAWNER_CONFIG.minSpawnDist);
      const sx = player.x + Math.cos(angle) * dist;
      const sy = player.y + Math.sin(angle) * dist;

      if (sx < 80 || sx > WORLD_CONFIG.size - 80 || sy < 80 || sy > WORLD_CONFIG.size - 80) {
        continue;
      }
      if (this._isInsideKettle(sx, sy, activeWorld)) {
        continue;
      }

      const area = this._getAreaAt(sx, sy, activeWorld);
      if (!area || area.safe) continue;

      const scaleMult = this._computeScaleMult(player.level, area);
      const roll = Math.random();

      if (roll < SPAWNER_CONFIG.commonWeight) {
        // Common pack of 2-4
        const packSize =
          SPAWNER_CONFIG.packSizeMin +
          Math.floor(Math.random() * (SPAWNER_CONFIG.packSizeMax - SPAWNER_CONFIG.packSizeMin + 1));
        const commonIds = area.commons || ['tinRat', 'dustDog'];
        const chosenId = commonIds[Math.floor(Math.random() * commonIds.length)];
        const cfg = ENEMIES_CONFIG.commons[chosenId];

        for (let p = 0; p < packSize; p++) {
          if (this.getActiveCount() >= SPAWNER_CONFIG.maxActive) break;
          const enemy = this._getFreeEnemy();
          if (!enemy) break;
          const ox = sx + (Math.random() - 0.5) * 56;
          const oy = sy + (Math.random() - 0.5) * 56;
          if (!this._isInsideKettle(ox, oy, activeWorld)) {
            const safe = obstacleManager.findSafePosition(ox, oy, cfg.radius || 12);
            enemy.initFromConfig(cfg, safe.x, safe.y, scaleMult);
          }
        }
      } else {
        // Elite (14%+)
        const eliteIds = area.elites || ['cleaverHauler'];
        const chosenId = eliteIds[Math.floor(Math.random() * eliteIds.length)];
        const cfg = ENEMIES_CONFIG.elites[chosenId];
        const enemy = this._getFreeEnemy();
        if (enemy && cfg) {
          const safe = obstacleManager.findSafePosition(sx, sy, cfg.radius || 20);
          enemy.initFromConfig(cfg, safe.x, safe.y, scaleMult);
        }
      }
      return;
    }
  }

  _updateBosses(dt, player) {
    if (this.bossNameCard) {
      this.bossNameCard.timer -= dt;
      if (this.bossNameCard.timer <= 0) {
        this.bossNameCard = null;
      }
    }

    for (const [bossId, cfg] of Object.entries(ENEMIES_CONFIG.bosses)) {
      // D15: Confirmed-cleared bosses stay dead permanently; automatic respawn timer is disabled for them.
      if (this.defeatedBosses[bossId] || worldLedger.confirmedBossKills[bossId]) {
        this.defeatedBosses[bossId] = true;
        this.bossRespawnTimers[bossId] = 0;
        const activeInst = this.activeBossInstances[bossId];
        if (!activeInst || !activeInst.active) {
          continue;
        }
      }

      let instance = this.activeBossInstances[bossId];
      const distToArena = Math.hypot(
        player.x - cfg.arenaCenter.x,
        player.y - cfg.arenaCenter.y
      );

      // Spawn unbeaten boss when player approaches within 650px of its fixed arena
      if (
        (!instance || !instance.active) &&
        !this.defeatedBosses[bossId] &&
        distToArena <= 650
      ) {
        const slot = this._getFreeEnemy();
        if (slot) {
          slot.initFromConfig(cfg, cfg.arenaCenter.x, cfg.arenaCenter.y, 1.0);
          slot.isRematch = false;
          this.activeBossInstances[bossId] = slot;
          instance = slot;
        }
      }

      // Trigger Boss Name Card when player steps inside arena radius + 90px
      if (instance && instance.active && distToArena <= cfg.arenaRadius + 90) {
        if (!instance._hasShownCard) {
          instance._hasShownCard = true;
          sound.playBossAlert();
          this.bossNameCard = {
            name: instance.name,
            subtitle: instance.isRematch ? `${cfg.subtitle} · REMATCH` : cfg.subtitle,
            timer: 3.2,
          };
        }
      }
    }
  }

  /**
   * D15 / D44: Optional Rematch Mode lets players re-fight a confirmed-cleared boss
   * without undoing the clear or territory state, paying reduced non-farmable rewards.
   */
  startBossRematch(bossId, player, particles) {
    const cfg = ENEMIES_CONFIG.bosses[bossId];
    if (!cfg) return false;
    const existing = this.activeBossInstances[bossId];
    if (existing && existing.active && existing.hp > 0) return false;

    const slot = this._getFreeEnemy();
    if (!slot) return false;

    bossMechanics.abortActiveEncounter(bossId);
    slot.initFromConfig(cfg, cfg.arenaCenter.x, cfg.arenaCenter.y, 1.0);
    slot.isRematch = true;
    slot._hasShownCard = false;
    this.activeBossInstances[bossId] = slot;

    if (particles && player) {
      particles.spawnFloatingText(
        player.x,
        player.y - 32,
        `REMATCH SPAWNED: ${cfg.name.toUpperCase()}`,
        PALETTE.brass
      );
    }
    sound.playBossAlert();
    return true;
  }

  onBossDefeated(bossId, player, particles, details = {}) {
    const wasAlreadyCleared = !!this.defeatedBosses[bossId] || !!worldLedger.confirmedBossKills[bossId];
    this.defeatedBosses[bossId] = true;
    // D15: Disable automatic respawn timer for confirmed clears
    this.bossRespawnTimers[bossId] = 0;
    this.activeBossInstances[bossId] = null;

    obstacleManager.clearByOwner(bossId);
    worldLedger.recordConfirmedBossVictory(bossId, details, particles, player);

    // D44: First-clear guaranteed Salvaged drop is one-time only (not repeated on optional rematches)
    if (!wasAlreadyCleared && !details.isRematch) {
      const salvagePool = ['surplusRespirator', 'riotJacket', 'courierLeggings'];
      const cfg = ENEMIES_CONFIG.bosses[bossId];
      let dropId = cfg && cfg.guaranteedDrop ? cfg.guaranteedDrop : salvagePool[0];
      if (player.ownedEquipment.includes(dropId) || player.equipped[SHOP_ITEMS[dropId]?.slot] === dropId) {
        const unowned = salvagePool.find(
          (id) => !player.ownedEquipment.includes(id) && player.equipped[SHOP_ITEMS[id]?.slot] !== id
        );
        if (unowned) dropId = unowned;
      }

      const dropItem = SHOP_ITEMS[dropId];
      if (dropItem && !player.ownedEquipment.includes(dropId)) {
        player.ownedEquipment.push(dropId);
        particles.spawnDamageNumber(
          player.x,
          player.y - 34,
          0,
          true,
          `SALVAGED DROP: ${dropItem.name.toUpperCase()}`,
          PALETTE.signal
        );
      }
    } else if (particles) {
      particles.spawnFloatingText(
        player.x,
        player.y - 34,
        'REMATCH VICTORY (REDUCED REWARD)',
        PALETTE.brass
      );
    }
    sound.playLevelUp();
  }

  getBossRespawnRemaining(bossId) {
    return 0;
  }

  getActiveBossNearPlayer(player) {
    for (const [, instance] of Object.entries(this.activeBossInstances)) {
      if (!instance || !instance.active || instance.hp <= 0) continue;
      const d = Math.hypot(player.x - instance.x, player.y - instance.y);
      if (d <= 560) {
        return instance;
      }
    }
    return null;
  }

  getNearestUnbeatenBossObjective(player) {
    // D49: Recommend bosses in Suggested Order (Big Axle -> Long Dry -> Mother Sump -> The Foreman),
    // unless the player is already inside another unbeaten boss's sector (< 900px from its arena).
    const bosses = Object.values(ENEMIES_CONFIG.bosses);
    for (let i = 0; i < bosses.length; i++) {
      const b = bosses[i];
      if (this.defeatedBosses[b.id]) continue;
      const d = Math.hypot(b.arenaCenter.x - player.x, b.arenaCenter.y - player.y);
      if (d <= 950) {
        return {
          boss: b,
          dist: Math.round(d),
          suggestedRank: SUGGESTED_BOSS_ORDER.indexOf(b.id) + 1,
        };
      }
    }

    for (let i = 0; i < SUGGESTED_BOSS_ORDER.length; i++) {
      const bossId = SUGGESTED_BOSS_ORDER[i];
      if (!this.defeatedBosses[bossId]) {
        const b = ENEMIES_CONFIG.bosses[bossId];
        if (b) {
          const d = Math.hypot(b.arenaCenter.x - player.x, b.arenaCenter.y - player.y);
          return {
            boss: b,
            dist: Math.round(d),
            suggestedRank: i + 1,
            isSuggestedNext: true,
          };
        }
      }
    }

    // All 4 primary bosses confirmed defeated -> Floor 1 Cleared!
    const fore = ENEMIES_CONFIG.bosses.theForeman;
    return {
      boss: fore,
      dist: Math.round(Math.hypot(fore.arenaCenter.x - player.x, fore.arenaCenter.y - player.y)),
      allCleared: true,
    };
  }

  getNearestUnbeatenBoss(x, y) {
    const dummyPlayer = { x, y };
    return this.getNearestUnbeatenBossObjective(dummyPlayer);
  }

  get activeBoss() {
    for (const b of Object.values(this.activeBossInstances)) {
      if (b && b.active && b.hp > 0) return b;
    }
    return null;
  }

  clearNonBossEnemies() {
    for (let i = 0; i < this.pool.length; i++) {
      if (this.pool[i].tier !== 'boss') {
        this.pool[i].active = false;
      }
    }
  }

  toJSON() {
    return {
      defeatedBosses: { ...this.defeatedBosses },
      bossRespawnTimers: { ...this.bossRespawnTimers },
    };
  }

  fromJSON(data) {
    if (!data) return;
    if (data.defeatedBosses) {
      this.defeatedBosses = { ...this.defeatedBosses, ...data.defeatedBosses };
    }
    if (data.bossRespawnTimers) {
      this.bossRespawnTimers = { ...this.bossRespawnTimers, ...data.bossRespawnTimers };
    }
  }

  update(dt, player, projectiles, particles, camera, worldOrTimeStopped, maybeTimeStopped = false) {
    let world = null;
    let timeStopped = false;

    if (worldOrTimeStopped && typeof worldOrTimeStopped === 'object') {
      world = worldOrTimeStopped;
      timeStopped = !!maybeTimeStopped;
    } else {
      world = this.world;
      timeStopped = typeof worldOrTimeStopped === 'boolean' ? worldOrTimeStopped : !!maybeTimeStopped;
    }
    if (!world) {
      world = this.world;
    }

    if (!timeStopped && player && typeof player.isTimeStopped === 'function') {
      timeStopped = player.isTimeStopped();
    }

    // "Time stop: during a freeze step, all game time stops (entities, projectiles, status timers, spawns)."
    if (timeStopped) {
      return;
    }

    this._updateBosses(dt, player);

    // Every 1.2s, if fewer than 40 active, spawn outside Kettle
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = SPAWNER_CONFIG.interval;
      if (!player.dead && !player.ultimateActive) {
        this._trySpawnWave(player, world);
      }
    }

    // Despawn non-boss enemies beyond 1200px, rebuild spatial hash grid, and update all active
    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      if (!e.active) continue;
      if (e.tier !== 'boss' && !e.isRitualMarcher) {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        if (dist > SPAWNER_CONFIG.despawnDist) {
          e.active = false;
          continue;
        }
      }
    }

    this.rebuildSpatialGrid();

    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      if (!e.active) continue;
      e.update(dt, player, this, projectiles, particles, camera, world);
    }
  }

  drawTelegraphs(ctx, camera) {
    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      if (e.active) e.drawTelegraph(ctx, camera);
    }
    if (bossMechanics && Array.isArray(bossMechanics.ritualActors)) {
      for (let i = 0; i < bossMechanics.ritualActors.length; i++) {
        const ra = bossMechanics.ritualActors[i];
        if (ra && ra.active) ra.drawTelegraph(ctx, camera);
      }
    }
  }

  drawEnemies(ctx, camera) {
    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      if (e.active) e.draw(ctx, camera);
    }
    if (bossMechanics && Array.isArray(bossMechanics.ritualActors)) {
      for (let i = 0; i < bossMechanics.ritualActors.length; i++) {
        const ra = bossMechanics.ritualActors[i];
        if (ra && ra.active) ra.draw(ctx, camera);
      }
    }
  }
}

export default Spawner;
