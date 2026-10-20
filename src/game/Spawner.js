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
    // Pre-allocated enemy pool (120 base slots, dynamically expandable for unlimited fusions)
    this.pool = Array.from({ length: 120 }, () => new Enemy());
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

  syncWithWorldLedger() {
    this.clear();
    const fl = worldLedger.currentFloor ?? 0;
    if (fl === 0) {
      this.defeatedBosses = {
        theForeman: true,
        bigAxle: true,
        motherSump: true,
        theLongDry: true,
      };
      return;
    }
    const chainMap = worldLedger.floorSectorChains?.[fl] || {};
    this.defeatedBosses = {
      theForeman: (chainMap.slabTown?.stage ?? 0) >= 3,
      bigAxle: (chainMap.route9?.stage ?? 0) >= 3,
      motherSump: (chainMap.lyeMarsh?.stage ?? 0) >= 3,
      theLongDry: (chainMap.copperFlats?.stage ?? 0) >= 3,
    };
    for (const k of Object.keys(this.bossRespawnTimers)) {
      this.bossRespawnTimers[k] = 0;
    }
  }

  _getFreeEnemy() {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) return this.pool[i];
    }
    if (this.pool.length < 240) {
      const extra = new Enemy();
      this.pool.push(extra);
      return extra;
    }
    return null;
  }

  getActiveCount() {
    let count = 0;
    for (let i = 0; i < this.pool.length; i++) {
      const e = this.pool[i];
      if (e.active && e.tier !== 'boss' && e.tier !== 'fusionBoss' && !e.isRitualOrigin) count++;
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
    const fl = Math.max(1, worldLedger.currentFloor || 1);
    const floorCfg = worldLedger.getFloorConfig(fl);
    const [minLv] = floorCfg.expectedLevelBand || [1, 10];
    const hasLevelGap10 = ((player?.level || 1) - minLv) >= 10;
    const maxCommonsCap = hasLevelGap10 ? Math.max(58, SPAWNER_CONFIG.maxActive + 20) : SPAWNER_CONFIG.maxActive;

    const activeCount = this.getActiveCount();
    if (activeCount >= maxCommonsCap) return;
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
        // Common pack (larger packs when 10+ level gap so mobs can gather and fuse!)
        const basePack =
          SPAWNER_CONFIG.packSizeMin +
          Math.floor(Math.random() * (SPAWNER_CONFIG.packSizeMax - SPAWNER_CONFIG.packSizeMin + 1));
        const packSize = hasLevelGap10 ? basePack + 2 : basePack;
        const commonIds = area.commons || ['tinRat', 'dustDog'];
        const chosenId = commonIds[Math.floor(Math.random() * commonIds.length)];
        const cfg = ENEMIES_CONFIG.commons[chosenId];

        for (let p = 0; p < packSize; p++) {
          if (this.getActiveCount() >= maxCommonsCap) break;
          const enemy = this._getFreeEnemy();
          if (!enemy) break;
          const ox = sx + (Math.random() - 0.5) * 56;
          const oy = sy + (Math.random() - 0.5) * 56;
          if (!this._isInsideKettle(ox, oy, activeWorld)) {
            const safe = obstacleManager.findSafePosition(ox, oy, cfg.radius || 12);
            enemy.initFromConfig(cfg, safe.x, safe.y, scaleMult, player.level);
          }
        }
      } else {
        const eliteIds = area.elites || ['cleaverHauler'];
        const chosenId = eliteIds[Math.floor(Math.random() * eliteIds.length)];
        const cfg = ENEMIES_CONFIG.elites[chosenId];
        const enemy = this._getFreeEnemy();
        if (enemy && cfg) {
          const safe = obstacleManager.findSafePosition(sx, sy, cfg.radius || 20);
          enemy.initFromConfig(cfg, safe.x, safe.y, scaleMult, player.level);
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
      // Only permanently cleared when all 3 stages (Warden -> Executioner -> Overlord) are slain on this floor
      if (worldLedger.confirmedBossKills[bossId]) {
        this.defeatedBosses[bossId] = true;
        this.bossRespawnTimers[bossId] = 0;
        const activeInst = this.activeBossInstances[bossId];
        if (!activeInst || !activeInst.active) {
          continue;
        }
      } else {
        this.defeatedBosses[bossId] = false;
      }

      if (this.bossRespawnTimers[bossId] > 0) {
        this.bossRespawnTimers[bossId] = Math.max(0, this.bossRespawnTimers[bossId] - dt);
        if (this.bossRespawnTimers[bossId] > 0) continue;
      }

      let instance = this.activeBossInstances[bossId];
      const distToArena = Math.hypot(
        player.x - cfg.arenaCenter.x,
        player.y - cfg.arenaCenter.y
      );

      // Spawn current stage of the 3-boss Bloodline chain when player is within 650px of its arena
      if (
        (!instance || !instance.active) &&
        !this.defeatedBosses[bossId] &&
        distToArena <= 650
      ) {
        const slot = this._getFreeEnemy();
        if (slot) {
          slot.initFromConfig(cfg, cfg.arenaCenter.x, cfg.arenaCenter.y, 1.0, player.level);
          slot.isRematch = false;
          this.activeBossInstances[bossId] = slot;
          instance = slot;
        }
      }

      if (instance && instance.active && distToArena <= cfg.arenaRadius + 90) {
        if (!instance._hasShownCard) {
          instance._hasShownCard = true;
          sound.playBossAlert();
          this.bossNameCard = {
            name: instance.name,
            subtitle: instance.isRematch ? `${instance.subtitle} · REMATCH` : instance.subtitle,
            timer: 3.2,
          };
        }
      }
    }
  }

  startBossRematch(bossId, player, particles) {
    const cfg = ENEMIES_CONFIG.bosses[bossId];
    if (!cfg) return false;
    const existing = this.activeBossInstances[bossId];
    if (existing && existing.active && existing.hp > 0) return false;

    const slot = this._getFreeEnemy();
    if (!slot) return false;

    bossMechanics.abortActiveEncounter(bossId);
    slot.initFromConfig(cfg, cfg.arenaCenter.x, cfg.arenaCenter.y, 1.0, player ? player.level : 1);
    slot.isRematch = true;
    slot._hasShownCard = false;
    this.activeBossInstances[bossId] = slot;

    if (particles && player) {
      particles.spawnFloatingText(
        player.x,
        player.y - 32,
        `REMATCH SPAWNED: ${slot.name.toUpperCase()}`,
        PALETTE.brass
      );
    }
    sound.playBossAlert();
    return true;
  }

  onBossDefeated(bossId, player, particles, details = {}) {
    const wasAlreadyCleared = !!worldLedger.confirmedBossKills[bossId];
    this.activeBossInstances[bossId] = null;

    obstacleManager.clearByOwner(bossId);
    const res = worldLedger.recordConfirmedBossVictory(bossId, details, particles, player);

    // If Stage 0 (Warden) or Stage 1 (Executioner) fell, queue the next Bloodline stage in 2.2s!
    if (res && res.stageAdvanced) {
      this.defeatedBosses[bossId] = false;
      this.bossRespawnTimers[bossId] = 2.2;
      sound.playLevelUp();
      return;
    }

    this.defeatedBosses[bossId] = true;
    this.bossRespawnTimers[bossId] = 0;

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
          `BLOODLINE RELIC: ${dropItem.name.toUpperCase()}`,
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
    return this.bossRespawnTimers[bossId] || 0;
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
    if ((worldLedger.currentFloor ?? 0) === 0) {
      return {
        boss: {
          id: 'abyssal_spire',
          name: 'The Abyssal Spire',
          arenaCenter: { x: 3000, y: 2560 },
        },
        dist: Math.round(Math.hypot(3000 - player.x, 2560 - player.y)),
        isTownObjective: true,
      };
    }

    const bosses = Object.values(ENEMIES_CONFIG.bosses);
    for (let i = 0; i < bosses.length; i++) {
      const b = bosses[i];
      if (worldLedger.confirmedBossKills[b.id]) continue;
      const d = Math.hypot(b.arenaCenter.x - player.x, b.arenaCenter.y - player.y);
      if (d <= 950) {
        const chainEntry = worldLedger.getActiveBossChainEntry(b.id, worldLedger.currentFloor);
        return {
          boss: { ...b, name: chainEntry.name },
          dist: Math.round(d),
          suggestedRank: SUGGESTED_BOSS_ORDER.indexOf(b.id) + 1,
        };
      }
    }

    for (let i = 0; i < SUGGESTED_BOSS_ORDER.length; i++) {
      const bossId = SUGGESTED_BOSS_ORDER[i];
      if (!worldLedger.confirmedBossKills[bossId]) {
        const b = ENEMIES_CONFIG.bosses[bossId];
        if (b) {
          const chainEntry = worldLedger.getActiveBossChainEntry(bossId, worldLedger.currentFloor);
          const d = Math.hypot(b.arenaCenter.x - player.x, b.arenaCenter.y - player.y);
          return {
            boss: { ...b, name: chainEntry.name },
            dist: Math.round(d),
            suggestedRank: i + 1,
            isSuggestedNext: true,
          };
        }
      }
    }

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

  /**
   * Updates Corner Wandering Merchants on Floors 1–5:
   * - Starts the 30s Sudden Defense Quest when the player approaches within 220px
   * - Spawns ambush waves during the 30s timer
   * - Triggers Smoke-Bomb Flee if Merchant HP reaches 0
   * - Activates the 260px Mob-Repellent Sanctuary Ward upon surviving 30s!
   */
  _updateWanderingMerchantQuests(dt, player, particles, camera) {
    const merchants = worldLedger.wanderingMerchants || [];
    for (let i = 0; i < merchants.length; i++) {
      const m = merchants[i];
      if (m.state === 'fled' || m.state === 'protected') continue;

      const dist = Math.hypot(player.x - m.x, player.y - m.y);
      if (m.state === 'awaiting' && dist <= 220) {
        m.state = 'defending';
        m.defenseTimer = 30.0;
        m.waveSpawnCooldown = 0.5;
        worldLedger.quests.suddenQuest = {
          active: true,
          merchantId: m.id,
          title: 'SUDDEN QUEST: PROTECT MORWEN THE SHROUDED (30S)',
          timer: 30.0,
          maxTimer: 30.0,
          hp: m.hp,
          maxHp: m.maxHp,
          completed: false,
          failed: false,
        };
        sound.playBossAlert();
        if (particles) {
          particles.spawnFloatingText(
            m.x,
            m.y - 44,
            'SUDDEN QUEST: DEFEND MERCHANT FOR 30S!',
            '#FFC83D'
          );
        }
      }

      if (m.state === 'defending') {
        if (m.hp <= 0) {
          // Merchant flees in a smoke bomb and cannot be used on this floor run!
          m.state = 'fled';
          m.repellentActive = false;
          worldLedger.quests.suddenQuest = {
            active: false,
            failed: true,
            title: 'MORWEN FLED IN A SMOKE BOMB!',
          };
          if (particles) {
            particles.spawnShockwave(m.x, m.y, 75, PALETTE.bone, 0.35);
            particles.spawnFloatingText(
              m.x,
              m.y - 36,
              'SMOKE BOMB! MERCHANT FLED THE FLOOR!',
              '#FF5A26'
            );
          }
          continue;
        }

        m.defenseTimer = Math.max(0, m.defenseTimer - dt);
        m.waveSpawnCooldown -= dt;
        if (m.waveSpawnCooldown <= 0 && this.getActiveCount() < SPAWNER_CONFIG.maxActive) {
          m.waveSpawnCooldown = 6.0;
          const commonKeys = Object.keys(ENEMIES_CONFIG.commons);
          for (let w = 0; w < 3; w++) {
            const slot = this._getFreeEnemy();
            if (!slot) break;
            const ang = (w / 3) * Math.PI * 2 + Math.random() * 0.6;
            const sx = Math.max(80, Math.min(WORLD_CONFIG.size - 80, m.x + Math.cos(ang) * 210));
            const sy = Math.max(80, Math.min(WORLD_CONFIG.size - 80, m.y + Math.sin(ang) * 210));
            const pickId = commonKeys[(i + w) % commonKeys.length];
            slot.initFromConfig(ENEMIES_CONFIG.commons[pickId], sx, sy, 1.0, player.level);
          }
        }

        if (worldLedger.quests.suddenQuest && worldLedger.quests.suddenQuest.merchantId === m.id) {
          worldLedger.quests.suddenQuest.timer = m.defenseTimer;
          worldLedger.quests.suddenQuest.hp = m.hp;
        }

        if (m.defenseTimer <= 0) {
          // 30s Defense Complete -> Activate Mob-Repellent Sanctuary Ward!
          m.state = 'protected';
          m.repellentActive = true;
          worldLedger.quests.suddenQuest = {
            active: false,
            completed: true,
            title: 'MOB-REPELLENT WARD ACTIVE! PRESS [E] AT MERCHANT',
          };
          // Vaporize any hostile non-boss mobs inside the new Sanctuary Ward
          for (let j = 0; j < this.pool.length; j++) {
            const e = this.pool[j];
            if (e.active && e.tier !== 'boss') {
              const edx = e.x - m.x;
              const edy = e.y - m.y;
              if (edx * edx + edy * edy <= (m.repellentRadius + 40) * (m.repellentRadius + 40)) {
                e.active = false;
              }
            }
          }
          if (player) {
            const bonusGold = 120 * Math.max(1, worldLedger.currentFloor || 1);
            const bonusXp = 45 * Math.max(1, worldLedger.currentFloor || 1);
            player.gainXpAndGold(bonusXp, bonusGold, particles);
          }
          sound.playLevelUp();
          if (particles) {
            particles.spawnShockwave(m.x, m.y, m.repellentRadius, '#00F0FF', 0.45);
            particles.spawnFloatingText(
              m.x,
              m.y - 48,
              'MOB-REPELLENT SANCTUARY ACTIVATED!',
              '#00F0FF'
            );
          }
        }
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
    // FLOOR 0 (DUSKHOLLOW TOWN) IS A SAFE HAVEN — zero enemies or bosses spawn here!
    if ((worldLedger.currentFloor ?? 0) === 0) {
      for (let i = 0; i < this.pool.length; i++) {
        if (this.pool[i].active) this.pool[i].active = false;
      }
      return;
    }

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

    if (timeStopped) {
      return;
    }

    this._updateBosses(dt, player);
    this._updateWanderingMerchantQuests(dt, player, particles, camera);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = SPAWNER_CONFIG.interval;
      if (!player.dead && !player.ultimateActive) {
        this._trySpawnWave(player, world);
      }
    }

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
