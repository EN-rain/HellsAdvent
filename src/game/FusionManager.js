/**
 * HellsAdvent — Unlimited 10× Common Mob Fusion & 5× Mid-Boss -> KING Fusion System
 * - 10 living, active common mobs of the same species ID in a cluster fuse into a Mid-Level Fused Boss.
 * - No artificial cap on how many fusions or channels can happen simultaneously as long as conditions are met.
 * - 5 Mid-Level Fused Bosses near together trigger a second-stage KING FUSION into "King <Name of the Mob>"!
 * - Strictly suppressed inside the Foreman's marked ritual No-Fusion AOE (D34).
 * - Runs an interruptible FUSION CHANNEL with a visible universal stagger meter.
 */

import { PALETTE, ENEMIES_CONFIG } from '../data/config.js';
import { FUSION_BOSSES_CONFIG, FUSION_RULES } from '../data/expansionConfig.js';
import { obstacleManager } from './Obstacles.js';
import { drawBresenhamCircle, drawPixelLine } from './PixelArt.js';
import { sound } from './Audio.js';

export class FusionManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.channels = []; // Active 10x common or 5x mid-boss king fusion channels
    this.scanTimer = 0.20; // Scan 5 times per second
    this.nextChannelId = 1;
  }

  /**
   * Cancels all active channels without deleting participants (used on encounter reset or no-fusion field entry).
   */
  cancelAllChannels() {
    for (let i = 0; i < this.channels.length; i++) {
      const ch = this.channels[i];
      for (let j = 0; j < ch.members.length; j++) {
        const m = ch.members[j];
        if (m) {
          m.fusionLocked = false;
          m.fusionChannelId = null;
        }
      }
    }
    this.channels = [];
  }

  /**
   * Records damage dealt to a member of an active fusion channel for universal stagger interruption (D21).
   */
  onMemberDamaged(enemy, damageAmount) {
    if (!enemy || !enemy.fusionChannelId) return;
    for (let i = 0; i < this.channels.length; i++) {
      const ch = this.channels[i];
      if (ch.id === enemy.fusionChannelId) {
        ch.damageTaken += damageAmount;
        break;
      }
    }
  }

  getActiveFusionBossCount(allEnemies) {
    let count = 0;
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      if (e.active && e.hp > 0 && e.tier === 'fusionBoss') {
        count++;
      }
    }
    return count;
  }

  _getCleanBaseMobName(speciesId, fallbackName = 'Mob') {
    const commonCfg = ENEMIES_CONFIG?.commons?.[speciesId];
    if (commonCfg && commonCfg.name) {
      return commonCfg.name;
    }
    return fallbackName || speciesId || 'Abyssal Mob';
  }

  update(dt, spawner, player, particles, camera, bossMechanics, worldLedger) {
    if (!spawner) return;
    const allEnemies = spawner.getAllActiveEnemies ? spawner.getAllActiveEnemies() : spawner.pool;

    // Tick down backlash cooldown timers on individual enemies
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      if (e.fusionBacklashTimer > 0) {
        e.fusionBacklashTimer = Math.max(0, e.fusionBacklashTimer - dt);
      }
    }

    // 1. Update active fusion channels (both 10x Common and 5x Mid-Boss King channels)
    for (let i = this.channels.length - 1; i >= 0; i--) {
      const ch = this.channels[i];
      ch.elapsed += dt;
      const reqCount = ch.requiredCount || (ch.isKingFusion ? (FUSION_RULES.kingRequiredCount || 5) : FUSION_RULES.requiredCount);
      const maxRad = ch.isKingFusion
        ? (FUSION_RULES.kingClusterRadius || 165)
        : FUSION_RULES.maxClusterRadius;

      // Check if Foreman ritual No-Fusion AOE now covers any member or centroid (D34)
      if (
        bossMechanics &&
        (bossMechanics.isInsideForemanNoFusionField(ch.centroidX, ch.centroidY) ||
          ch.members.some((m) => m && bossMechanics.isInsideForemanNoFusionField(m.x, m.y)))
      ) {
        this._releaseChannelMembers(ch);
        this.channels.splice(i, 1);
        continue;
      }

      // Check interruption conditions: member killed, stunned, displaced, or universal stagger reached
      let brokenReason = null;
      let aliveCount = 0;
      for (let mIdx = 0; mIdx < ch.members.length; mIdx++) {
        const m = ch.members[mIdx];
        if (!m || !m.active || m.hp <= 0) {
          brokenReason = 'MEMBER SLAIN';
          break;
        }
        aliveCount++;
        if (m.statuses && (m.statuses.isStunned() || m.statuses.isLifted())) {
          brokenReason = 'STUN INTERRUPT';
          break;
        }
        const distFromCentroid = Math.hypot(m.x - ch.centroidX, m.y - ch.centroidY);
        if (distFromCentroid > maxRad + 36) {
          brokenReason = 'DISPLACED';
          break;
        }
      }

      if (!brokenReason && ch.damageTaken >= ch.staggerThreshold) {
        brokenReason = 'STAGGER BREAK';
      }

      if (brokenReason || aliveCount < reqCount) {
        const isLateBacklash =
          ch.elapsed >= ch.duration - FUSION_RULES.backlashWindow;
        this._interruptChannel(ch, isLateBacklash, brokenReason, particles, camera, worldLedger);
        this.channels.splice(i, 1);
        continue;
      }

      // Pull members toward centroid while channeling
      const pullSpeed = ch.isKingFusion ? 28 : 22;
      for (let mIdx = 0; mIdx < ch.members.length; mIdx++) {
        const m = ch.members[mIdx];
        const dx = ch.centroidX - m.x;
        const dy = ch.centroidY - m.y;
        const d = Math.hypot(dx, dy);
        if (d > 14) {
          m.x += (dx / d) * pullSpeed * dt;
          m.y += (dy / d) * pullSpeed * dt;
        }
      }

      // Channel complete -> Transform into Fusion Mid-Boss or KING Boss!
      if (ch.elapsed >= ch.duration) {
        const success = ch.isKingFusion
          ? this._completeKingFusion(ch, spawner, player, particles, camera)
          : this._completeFusion(ch, spawner, player, particles, camera);
        if (!success) {
          this._releaseChannelMembers(ch);
        }
        this.channels.splice(i, 1);
      }
    }

    // 2. Periodically scan for new 10-of-a-kind common clusters AND 5-of-a-kind Mid-Boss King clusters
    this.scanTimer -= dt;
    if (this.scanTimer <= 0) {
      this.scanTimer = 0.20;
      this._scanForClusters(spawner, player, particles, camera, bossMechanics);
      this._scanForKingClusters(spawner, player, particles, camera, bossMechanics);
    }
  }

  _releaseChannelMembers(ch) {
    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      if (m) {
        m.fusionLocked = false;
        m.fusionChannelId = null;
      }
    }
  }

  _interruptChannel(ch, isLateBacklash, reason, particles, camera, worldLedger) {
    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      if (!m || !m.active || m.hp <= 0) continue;
      m.fusionLocked = false;
      m.fusionChannelId = null;
      m.fusionBacklashTimer = 3.0; // Brief cooldown before re-chaining

      if (isLateBacklash && m.statuses) {
        m.statuses.apply(
          'stun',
          { duration: FUSION_RULES.backlashStunDuration, sourceName: 'Fusion Backlash' },
          m,
          particles
        );
      }
    }

    if (worldLedger && typeof worldLedger.recordFusionInterrupted === 'function') {
      worldLedger.recordFusionInterrupted();
    }

    if (camera) camera.shake(isLateBacklash ? 6 : 4, 0.16);
    sound.playShieldBlock?.();

    if (particles) {
      particles.spawnShockwave(
        ch.centroidX,
        ch.centroidY,
        64,
        isLateBacklash ? PALETTE.signal : PALETTE.brass,
        0.25
      );
      particles.spawnFloatingText(
        ch.centroidX,
        ch.centroidY - 26,
        isLateBacklash ? 'FUSION BACKLASH! (1.5s STUN)' : `FUSION BROKEN! (${reason})`,
        isLateBacklash ? PALETTE.signal : PALETTE.brass
      );
    }
  }

  _completeFusion(ch, spawner, player, particles, camera) {
    // Unlimited fusions allowed as long as the 10-mob condition is satisfied!
    const baseMobName = this._getCleanBaseMobName(ch.speciesId, ch.members[0]?.name);
    const fusionCfg = FUSION_BOSSES_CONFIG[ch.speciesId] || {
      id: ch.speciesId,
      sourceSpeciesId: ch.speciesId,
      name: `Fused ${baseMobName}`,
      subtitle: `10× ${baseMobName} Amalgam`,
      tier: 'fusionBoss',
      hp: 340,
      damage: 18,
      def: 10,
      speed: 96,
      radius: 26,
      xp: 120,
      goldMin: 75,
      goldMax: 110,
      specialType: 'rollingRush',
      specialCooldown: 4.6,
      telegraphTime: 0.8,
    };

    // Verify all 10 members are still alive
    for (let i = 0; i < ch.members.length; i++) {
      if (!ch.members[i] || !ch.members[i].active || ch.members[i].hp <= 0) {
        return false;
      }
    }

    // Atomically consume the 10 common mobs
    const scaleMult = ch.members[0].scaleMult || 1.0;
    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      m.fusionLocked = false;
      m.fusionChannelId = null;
      m.active = false;
      m.dead = true;
    }

    const bossSlot = spawner._getFreeEnemy();
    if (!bossSlot) return false;

    const safePos = obstacleManager.findSafePosition(
      ch.centroidX,
      ch.centroidY,
      fusionCfg.radius || 26
    );
    bossSlot.initFromConfig(fusionCfg, safePos.x, safePos.y, scaleMult, player ? player.level : 1);
    bossSlot.tier = 'fusionBoss';
    bossSlot.isKingBoss = false;
    bossSlot.baseSpeciesId = ch.speciesId;
    bossSlot.baseMobName = baseMobName;
    bossSlot.scaleMult = scaleMult;

    sound.playBossAlert?.();
    if (camera) camera.shake(7, 0.26);
    if (particles) {
      particles.spawnGroundBreakEffect(safePos.x, safePos.y, 92);
      particles.spawnFloatingText(
        safePos.x,
        safePos.y - 34,
        `10× FUSION: ${bossSlot.name.toUpperCase()}!`,
        PALETTE.blood
      );
    }

    return true;
  }

  /**
   * Completes a 5× Mid-Level Fused Boss -> KING (<Name of the Mob>) Fusion!
   */
  _completeKingFusion(ch, spawner, player, particles, camera) {
    // Verify all 5 mid-bosses are still alive
    let totalMaxHp = 0;
    let totalDmg = 0;
    let totalDef = 0;
    let totalXp = 0;
    let totalGoldMin = 0;
    let totalGoldMax = 0;
    let maxLevel = 1;

    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      if (!m || !m.active || m.hp <= 0) {
        return false;
      }
      totalMaxHp += m.maxHp || 350;
      totalDmg += m.damage || 20;
      totalDef += m.def || 10;
      totalXp += m.xp || 120;
      totalGoldMin += m.goldMin || 75;
      totalGoldMax += m.goldMax || 110;
      if ((m.level || 1) > maxLevel) maxLevel = m.level;
    }

    const leader = ch.members[0];
    const scaleMult = leader.scaleMult || 1.0;
    const speciesId = ch.speciesId || leader.baseSpeciesId || 'tinRat';
    const baseMobName = ch.baseMobName || leader.baseMobName || this._getCleanBaseMobName(speciesId, leader.name);
    const baseFusionCfg = FUSION_BOSSES_CONFIG[speciesId] || {
      id: leader.id || 'scrapRatKing',
      specialType: leader.specialType || 'rollingRush',
      specialCooldown: 3.8,
      telegraphTime: 0.75,
      speed: leader.speed || 98,
    };

    // Consume all 5 mid-level fused bosses
    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      m.fusionLocked = false;
      m.fusionChannelId = null;
      m.active = false;
      m.dead = true;
    }

    const kingSlot = spawner._getFreeEnemy();
    if (!kingSlot) return false;

    const safePos = obstacleManager.findSafePosition(ch.centroidX, ch.centroidY, 33);
    kingSlot.initFromConfig(baseFusionCfg, safePos.x, safePos.y, scaleMult, player ? player.level : 1);

    // Override with Sovereign KING stats & identity ("King <Name of the Mob>")
    kingSlot.tier = 'fusionBoss';
    kingSlot.isKingBoss = true;
    kingSlot.baseSpeciesId = speciesId;
    kingSlot.baseMobName = baseMobName;
    kingSlot.level = maxLevel + 3;
    kingSlot.name = `King ${baseMobName}`;
    kingSlot.subtitle = `5× Fused Sovereign King · Lv.${kingSlot.level}`;
    kingSlot.radius = 33;
    kingSlot.baseMaxHp = Math.round(totalMaxHp * 1.25);
    kingSlot.maxHp = kingSlot.baseMaxHp;
    kingSlot.hp = kingSlot.maxHp;
    kingSlot.baseDamage = Math.round((totalDmg / ch.members.length) * 2.15);
    kingSlot.damage = kingSlot.baseDamage;
    kingSlot.baseDef = Math.round((totalDef / ch.members.length) * 1.75);
    kingSlot.def = kingSlot.baseDef;
    kingSlot.speed = Math.round((baseFusionCfg.speed || 96) * 1.12);
    kingSlot.xp = Math.round(totalXp * 1.5);
    kingSlot.goldMin = Math.round(totalGoldMin * 1.5);
    kingSlot.goldMax = Math.round(totalGoldMax * 1.6);

    sound.playBossAlert?.();
    if (camera) camera.shake(11, 0.42);
    if (particles) {
      particles.spawnGroundBreakEffect(safePos.x, safePos.y, 125);
      particles.spawnShockwave(safePos.x, safePos.y, 140, '#FFC83D', 0.45);
      particles.spawnShockwave(safePos.x, safePos.y, 95, '#C042FF', 0.35);
      particles.spawnFloatingText(
        safePos.x,
        safePos.y - 44,
        `👑 5× FUSION AWAKENED: KING ${baseMobName.toUpperCase()}!`,
        '#FFC83D'
      );
    }

    return true;
  }

  _scanForClusters(spawner, player, particles, camera, bossMechanics) {
    const allEnemies = spawner.getAllActiveEnemies ? spawner.getAllActiveEnemies() : spawner.pool;

    // Group eligible common mobs by speciesId (no cap on how many fusions can happen!)
    const bySpecies = new Map();
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      if (
        !e.active ||
        e.hp <= 0 ||
        e.tier !== 'common' ||
        e.fusionLocked ||
        e.isRitualMarcher ||
        (e.fusionBacklashTimer && e.fusionBacklashTimer > 0) ||
        (e.statuses && e.statuses.cannotAct())
      ) {
        continue;
      }

      // D34: Forbidden inside Foreman ritual No-Fusion AOE
      if (bossMechanics && bossMechanics.isInsideForemanNoFusionField(e.x, e.y)) {
        continue;
      }

      let list = bySpecies.get(e.id);
      if (!list) {
        list = [];
        bySpecies.set(e.id, list);
      }
      list.push(e);
    }

    const playerLv = player?.level || 1;

    // Sort deterministically by uid
    for (const [speciesId, list] of bySpecies.entries()) {
      if (list.length < 4) continue;
      list.sort((a, b) => (a.uid || 0) - (b.uid || 0));

      // Apply convergence attraction (stronger when 10+ level gap is active!)
      const hasGap10 = (playerLv - (list[0]?.level || 1)) >= 10;
      this._applyConvergenceNudge(list, hasGap10 ? 280 : 140);

      if (list.length < FUSION_RULES.requiredCount) continue;

      // Find contact-connected components (wider touch tolerance when gathering for fusion)
      const touchPad = hasGap10 ? 26 : 16;
      const visited = new Set();
      for (let i = 0; i < list.length; i++) {
        const seed = list[i];
        if (visited.has(seed)) continue;

        const component = [];
        const queue = [seed];
        visited.add(seed);

        while (queue.length > 0) {
          const cur = queue.shift();
          component.push(cur);
          for (let j = 0; j < list.length; j++) {
            const other = list[j];
            if (visited.has(other)) continue;
            const d = Math.hypot(cur.x - other.x, cur.y - other.y);
            if (d <= cur.radius + other.radius + touchPad) {
              visited.add(other);
              queue.push(other);
            }
          }
        }

        if (component.length >= FUSION_RULES.requiredCount) {
          // Pick the 10 closest to the component centroid
          let cx = 0;
          let cy = 0;
          for (let k = 0; k < component.length; k++) {
            cx += component[k].x;
            cy += component[k].y;
          }
          cx /= component.length;
          cy /= component.length;

          component.sort(
            (a, b) =>
              Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy)
          );
          const chosen10 = component.slice(0, FUSION_RULES.requiredCount);

          let fx = 0;
          let fy = 0;
          for (let k = 0; k < chosen10.length; k++) {
            fx += chosen10[k].x;
            fy += chosen10[k].y;
          }
          fx /= FUSION_RULES.requiredCount;
          fy /= FUSION_RULES.requiredCount;

          // Check gathering radius
          let fitsRadius = true;
          let totalHp = 0;
          const allowedRad = hasGap10 ? FUSION_RULES.maxClusterRadius + 24 : FUSION_RULES.maxClusterRadius;
          for (let k = 0; k < chosen10.length; k++) {
            totalHp += chosen10[k].maxHp || 24;
            if (Math.hypot(chosen10[k].x - fx, chosen10[k].y - fy) > allowedRad) {
              fitsRadius = false;
              break;
            }
          }

          if (fitsRadius && (!bossMechanics || !bossMechanics.isInsideForemanNoFusionField(fx, fy))) {
            this._startChannel(speciesId, chosen10, fx, fy, totalHp, particles);
          }
        }
      }
    }
  }

  /**
   * Scans for 5 Mid-Level Fused Bosses (`tier === 'fusionBoss' && !isKingBoss`) near each other
   * to trigger a second-stage fusion into "King <Name of the Mob>"!
   */
  _scanForKingClusters(spawner, player, particles, camera, bossMechanics) {
    const allEnemies = spawner.getAllActiveEnemies ? spawner.getAllActiveEnemies() : spawner.pool;
    const midBosses = [];

    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      if (
        !e.active ||
        e.hp <= 0 ||
        e.tier !== 'fusionBoss' ||
        e.isKingBoss ||
        e.fusionLocked ||
        (e.fusionBacklashTimer && e.fusionBacklashTimer > 0) ||
        (e.statuses && e.statuses.cannotAct())
      ) {
        continue;
      }
      if (bossMechanics && bossMechanics.isInsideForemanNoFusionField(e.x, e.y)) {
        continue;
      }
      midBosses.push(e);
    }

    if (midBosses.length < 2) return;

    // Apply strong convergence pull between active mid-level fused bosses so they group up for King Fusion!
    this._applyConvergenceNudge(midBosses, 520);

    const reqKingCount = FUSION_RULES.kingRequiredCount || 5;
    if (midBosses.length < reqKingCount) return;

    // Group by baseSpeciesId first; if any group has >= 5, check cluster. Also check all midBosses together!
    const groups = new Map();
    for (let i = 0; i < midBosses.length; i++) {
      const mb = midBosses[i];
      const key = mb.baseSpeciesId || mb.id || 'tinRat';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(mb);
    }
    // Also add a combined pool fallback so 5 mid-bosses near together ALWAYS fuse into a King!
    groups.set('__all_mid_bosses__', midBosses);

    const kingRad = FUSION_RULES.kingClusterRadius || 165;

    for (const [groupKey, list] of groups.entries()) {
      if (list.length < reqKingCount) continue;

      const visited = new Set();
      for (let i = 0; i < list.length; i++) {
        const seed = list[i];
        if (seed.fusionLocked || visited.has(seed)) continue;

        const component = [];
        const queue = [seed];
        visited.add(seed);

        while (queue.length > 0) {
          const cur = queue.shift();
          component.push(cur);
          for (let j = 0; j < list.length; j++) {
            const other = list[j];
            if (other.fusionLocked || visited.has(other)) continue;
            const d = Math.hypot(cur.x - other.x, cur.y - other.y);
            if (d <= cur.radius + other.radius + 95) {
              visited.add(other);
              queue.push(other);
            }
          }
        }

        if (component.length >= reqKingCount) {
          let cx = 0;
          let cy = 0;
          for (let k = 0; k < component.length; k++) {
            cx += component[k].x;
            cy += component[k].y;
          }
          cx /= component.length;
          cy /= component.length;

          component.sort(
            (a, b) =>
              Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy)
          );
          const chosen5 = component.slice(0, reqKingCount);

          let fx = 0;
          let fy = 0;
          let totalHp = 0;
          let fitsRadius = true;
          for (let k = 0; k < chosen5.length; k++) {
            fx += chosen5[k].x;
            fy += chosen5[k].y;
            totalHp += chosen5[k].maxHp || 340;
          }
          fx /= reqKingCount;
          fy /= reqKingCount;

          for (let k = 0; k < chosen5.length; k++) {
            if (Math.hypot(chosen5[k].x - fx, chosen5[k].y - fy) > kingRad) {
              fitsRadius = false;
              break;
            }
          }

          if (fitsRadius && (!bossMechanics || !bossMechanics.isInsideForemanNoFusionField(fx, fy))) {
            const domSpecies = groupKey === '__all_mid_bosses__'
              ? (chosen5[0].baseSpeciesId || 'tinRat')
              : groupKey;
            const domMobName = chosen5[0].baseMobName || this._getCleanBaseMobName(domSpecies, chosen5[0].name);
            this._startKingChannel(domSpecies, domMobName, chosen5, fx, fy, totalHp, particles);
          }
        }
      }
    }
  }

  _applyConvergenceNudge(list, maxRange = 140) {
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      a.convergeX = 0;
      a.convergeY = 0;
      let count = 0;
      for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        const b = list[j];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d > 8 && d < maxRange) {
          a.convergeX += (b.x - a.x) / d;
          a.convergeY += (b.y - a.y) / d;
          count++;
        }
      }
      if (count > 0) {
        a.convergeX /= count;
        a.convergeY /= count;
      }
    }
  }

  _startChannel(speciesId, members10, cx, cy, totalHp, particles) {
    const chId = `fusion_ch_${this.nextChannelId++}`;
    for (let i = 0; i < members10.length; i++) {
      members10[i].fusionLocked = true;
      members10[i].fusionChannelId = chId;
    }

    const baseMobName = this._getCleanBaseMobName(speciesId, members10[0]?.name);
    const fusionCfg = FUSION_BOSSES_CONFIG[speciesId];
    this.channels.push({
      id: chId,
      isKingFusion: false,
      requiredCount: FUSION_RULES.requiredCount,
      speciesId,
      baseMobName,
      targetName: fusionCfg ? fusionCfg.name : `Fused ${baseMobName}`,
      members: members10,
      centroidX: Math.round(cx),
      centroidY: Math.round(cy),
      elapsed: 0,
      duration: FUSION_RULES.channelDuration,
      damageTaken: 0,
      staggerThreshold: Math.max(18, Math.round(totalHp * FUSION_RULES.staggerDamageRatio)),
    });

    sound.playReloadStart?.();
    if (particles) {
      particles.spawnFloatingText(
        cx,
        cy - 24,
        '10× FUSION CONVERGENCE! INTERRUPT!',
        PALETTE.blood
      );
    }
  }

  _startKingChannel(speciesId, baseMobName, members5, cx, cy, totalHp, particles) {
    const chId = `king_fusion_ch_${this.nextChannelId++}`;
    for (let i = 0; i < members5.length; i++) {
      members5[i].fusionLocked = true;
      members5[i].fusionChannelId = chId;
    }

    const kingName = `King ${baseMobName}`;
    const duration = FUSION_RULES.kingChannelDuration || 2.2;
    this.channels.push({
      id: chId,
      isKingFusion: true,
      requiredCount: FUSION_RULES.kingRequiredCount || 5,
      speciesId,
      baseMobName,
      targetName: kingName,
      members: members5,
      centroidX: Math.round(cx),
      centroidY: Math.round(cy),
      elapsed: 0,
      duration,
      damageTaken: 0,
      staggerThreshold: Math.max(80, Math.round(totalHp * 0.25)),
    });

    sound.playBossAlert?.();
    if (particles) {
      particles.spawnShockwave(cx, cy, 110, '#FFC83D', 0.35);
      particles.spawnFloatingText(
        cx,
        cy - 32,
        `👑 5× MID-BOSS FUSION → ${kingName.toUpperCase()}!`,
        '#FFC83D'
      );
    }
  }

  getHudChannelSummary() {
    if (this.channels.length === 0) return null;
    // Prioritize showing King Fusion channel if active
    const kingCh = this.channels.find((c) => c.isKingFusion);
    const ch = kingCh || this.channels[0];
    return {
      id: ch.id,
      isKingFusion: Boolean(ch.isKingFusion),
      activeCount: this.channels.length,
      targetName: ch.targetName,
      progressPct: Math.min(100, Math.round((ch.elapsed / ch.duration) * 100)),
      staggerPct: Math.min(100, Math.round((ch.damageTaken / ch.staggerThreshold) * 100)),
      remainingSec: Math.max(0, +(ch.duration - ch.elapsed).toFixed(1)),
      inBacklashWindow: ch.elapsed >= ch.duration - FUSION_RULES.backlashWindow,
    };
  }

  drawWorldOverlays(ctx, camera) {
    if (this.channels.length === 0) return;
    const camX = camera.renderX;
    const camY = camera.renderY;

    for (let i = 0; i < this.channels.length; i++) {
      const ch = this.channels[i];
      if (!camera.isVisible(ch.centroidX, ch.centroidY, 160)) continue;

      const sx = Math.round(ch.centroidX - camX);
      const sy = Math.round(ch.centroidY - camY);
      const progress = Math.min(1, ch.elapsed / ch.duration);
      const baseR = ch.isKingFusion
        ? (FUSION_RULES.kingClusterRadius || 165)
        : FUSION_RULES.maxClusterRadius;
      const ringR = Math.round(baseR * (1 - progress * 0.55));
      const isLate = ch.elapsed >= ch.duration - FUSION_RULES.backlashWindow;
      const col = ch.isKingFusion
        ? (isLate ? '#C042FF' : '#FFC83D')
        : (isLate ? PALETTE.blood : PALETTE.brass);

      drawBresenhamCircle(ctx, sx, sy, ringR, col, 1.0);
      if (ch.isKingFusion) {
        drawBresenhamCircle(ctx, sx, sy, Math.max(8, ringR - 6), '#C042FF', 0.85);
      }

      // Draw tether lines from each member to the fusion centroid
      for (let mIdx = 0; mIdx < ch.members.length; mIdx++) {
        const m = ch.members[mIdx];
        if (!m || !m.active) continue;
        drawPixelLine(
          ctx,
          Math.round(m.x - camX),
          Math.round(m.y - camY),
          sx,
          sy,
          col,
          ch.isKingFusion ? 2 : 1
        );
      }

      // Draw overhead channel progress & stagger bar
      const barW = ch.isKingFusion ? 56 : 44;
      const bx = sx - (barW >> 1);
      const by = sy - 38;
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(bx - 1, by - 1, barW + 2, 7);
      ctx.fillStyle = col;
      ctx.fillRect(bx, by, Math.round(barW * progress), 3);
      ctx.fillStyle = PALETTE.signal;
      const stagRatio = Math.min(1, ch.damageTaken / ch.staggerThreshold);
      ctx.fillRect(bx, by + 4, Math.round(barW * stagRatio), 2);
    }
  }
}

export const fusionManager = new FusionManager();
