/**
 * HellsAdvent — 10-of-a-Kind Same-Species Fusion System (Section 3, D6, D7, D11, D16, D21, D25, D34, D38, D39)
 * - Detects 10 living, active common mobs of the exact same species ID in a contact-connected cluster
 *   within 96px of their centroid.
 * - Strictly suppressed inside the Foreman's marked ritual No-Fusion AOE (D34).
 * - Runs a 2.0s interruptible FUSION CHANNEL with a visible universal stagger meter (D16, D21).
 * - Interrupted by kills, stun, knockback displacement, or universal stagger damage.
 * - Late interruption (last 0.5s) triggers 1.5s Fusion Backlash disorientation on survivors (D25).
 * - If mid-boss capacity is full, eligible mobs continue fighting normally and retry later (D39).
 */

import { PALETTE } from '../data/config.js';
import { FUSION_BOSSES_CONFIG, FUSION_RULES } from '../data/expansionConfig.js';
import { obstacleManager } from './Obstacles.js';
import { drawBresenhamCircle, drawPixelLine } from './PixelArt.js';
import { sound } from './Audio.js';

export class FusionManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.channels = []; // Active 2.0s fusion channels
    this.scanTimer = 0.22; // Check 4-5 times per second
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

    // 1. Update active fusion channels
    for (let i = this.channels.length - 1; i >= 0; i--) {
      const ch = this.channels[i];
      ch.elapsed += dt;

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

      // Check interruption conditions: member killed, stunned, displaced, or universal stagger reached (D16, D21)
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
        if (distFromCentroid > FUSION_RULES.maxClusterRadius + 24) {
          brokenReason = 'DISPLACED';
          break;
        }
      }

      if (!brokenReason && ch.damageTaken >= ch.staggerThreshold) {
        brokenReason = 'STAGGER BREAK';
      }

      if (brokenReason || aliveCount < FUSION_RULES.requiredCount) {
        const isLateBacklash =
          ch.elapsed >= FUSION_RULES.channelDuration - FUSION_RULES.backlashWindow;
        this._interruptChannel(ch, isLateBacklash, brokenReason, particles, camera, worldLedger);
        this.channels.splice(i, 1);
        continue;
      }

      // Pull members gently toward centroid while channeling
      for (let mIdx = 0; mIdx < ch.members.length; mIdx++) {
        const m = ch.members[mIdx];
        const dx = ch.centroidX - m.x;
        const dy = ch.centroidY - m.y;
        const d = Math.hypot(dx, dy);
        if (d > 14) {
          m.x += (dx / d) * 18 * dt;
          m.y += (dy / d) * 18 * dt;
        }
      }

      // Channel complete -> Transform 10 commons into 1 Fusion Mid-Boss!
      if (ch.elapsed >= FUSION_RULES.channelDuration) {
        const success = this._completeFusion(ch, spawner, player, particles, camera);
        if (!success) {
          // D39: If mid-boss capacity or pool is full at completion frame, release without deleting
          this._releaseChannelMembers(ch);
        }
        this.channels.splice(i, 1);
      }
    }

    // 2. Periodically scan for new 10-of-a-kind contact clusters
    this.scanTimer -= dt;
    if (this.scanTimer <= 0) {
      this.scanTimer = 0.22;
      this._scanForClusters(spawner, player, particles, camera, bossMechanics);
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
      m.fusionBacklashTimer = 3.5; // Prevent immediate re-chaining

      // D25: Late interruption (last 0.5s) disorients survivors for 1.5s
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
    const allEnemies = spawner.getAllActiveEnemies ? spawner.getAllActiveEnemies() : spawner.pool;
    if (this.getActiveFusionBossCount(allEnemies) >= FUSION_RULES.maxActiveFusionBosses) {
      return false; // D39: Keep fighting normally and retry later
    }

    const fusionCfg = FUSION_BOSSES_CONFIG[ch.speciesId];
    if (!fusionCfg) return false;

    // Verify all 10 members are still alive
    for (let i = 0; i < ch.members.length; i++) {
      if (!ch.members[i] || !ch.members[i].active || ch.members[i].hp <= 0) {
        return false;
      }
    }

    // Atomically consume the 10 common mobs (granting NO ordinary kill rewards per D38)
    const scaleMult = ch.members[0].scaleMult || 1.0;
    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      m.fusionLocked = false;
      m.fusionChannelId = null;
      m.active = false;
      m.dead = true;
    }

    // Now allocate 1 slot for the Fusion Mid-Boss (guaranteed free since we just freed up to 10 pool slots)
    const bossSlot = spawner._getFreeEnemy();
    if (!bossSlot) return false;

    const safePos = obstacleManager.findSafePosition(
      ch.centroidX,
      ch.centroidY,
      fusionCfg.radius || 26
    );
    bossSlot.initFromConfig(fusionCfg, safePos.x, safePos.y, scaleMult);
    bossSlot.tier = 'fusionBoss';
    bossSlot.scaleMult = scaleMult;

    sound.playBossAlert?.();
    if (camera) camera.shake(7, 0.26);
    if (particles) {
      particles.spawnGroundBreakEffect(safePos.x, safePos.y, 92);
      particles.spawnFloatingText(
        safePos.x,
        safePos.y - 34,
        `10× FUSION: ${fusionCfg.name.toUpperCase()}!`,
        PALETTE.blood
      );
    }

    return true;
  }

  _scanForClusters(spawner, player, particles, camera, bossMechanics) {
    if (this.channels.length >= FUSION_RULES.maxActiveChannels) return;

    const allEnemies = spawner.getAllActiveEnemies ? spawner.getAllActiveEnemies() : spawner.pool;
    if (this.getActiveFusionBossCount(allEnemies) >= FUSION_RULES.maxActiveFusionBosses) {
      return; // D39: Mid-boss slots full; eligible mobs continue normal combat
    }

    // Group eligible common mobs by speciesId
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

      if (!FUSION_BOSSES_CONFIG[e.id]) continue;

      let list = bySpecies.get(e.id);
      if (!list) {
        list = [];
        bySpecies.set(e.id, list);
      }
      list.push(e);
    }

    // Sort deterministically by uid
    for (const [speciesId, list] of bySpecies.entries()) {
      if (list.length < 6) continue;
      list.sort((a, b) => (a.uid || 0) - (b.uid || 0));

      // Apply subtle convergence attraction when 6+ same-species mobs are within 140px
      this._applyConvergenceNudge(list);

      if (list.length < FUSION_RULES.requiredCount) continue;

      // Find contact-connected components (two mobs touch if dist <= r1 + r2 + 12)
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
            if (d <= cur.radius + other.radius + 14) {
              visited.add(other);
              queue.push(other);
            }
          }
        }

        if (component.length >= FUSION_RULES.requiredCount) {
          // Pick the 10 closest to the component centroid and verify they fit within 96px
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

          // Check bounded 96px gathering radius
          let fitsRadius = true;
          let totalHp = 0;
          for (let k = 0; k < chosen10.length; k++) {
            totalHp += chosen10[k].maxHp || 24;
            if (Math.hypot(chosen10[k].x - fx, chosen10[k].y - fy) > FUSION_RULES.maxClusterRadius) {
              fitsRadius = false;
              break;
            }
          }

          if (fitsRadius && (!bossMechanics || !bossMechanics.isInsideForemanNoFusionField(fx, fy))) {
            this._startChannel(speciesId, chosen10, fx, fy, totalHp, particles);
            if (this.channels.length >= FUSION_RULES.maxActiveChannels) return;
          }
        }
      }
    }
  }

  _applyConvergenceNudge(list) {
    // When 6+ same-species mobs are near each other, gently nudge them toward their local neighbor so emergent 10-mob clusters form naturally (D6)
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      a.convergeX = 0;
      a.convergeY = 0;
      let count = 0;
      for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        const b = list[j];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d > 8 && d < 120) {
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

    const fusionCfg = FUSION_BOSSES_CONFIG[speciesId];
    this.channels.push({
      id: chId,
      speciesId,
      targetName: fusionCfg ? fusionCfg.name : 'Amalgam',
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

  getHudChannelSummary() {
    if (this.channels.length === 0) return null;
    const ch = this.channels[0];
    return {
      id: ch.id,
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
      if (!camera.isVisible(ch.centroidX, ch.centroidY, 120)) continue;

      const sx = Math.round(ch.centroidX - camX);
      const sy = Math.round(ch.centroidY - camY);
      const progress = Math.min(1, ch.elapsed / ch.duration);
      const ringR = Math.round(FUSION_RULES.maxClusterRadius * (1 - progress * 0.55));
      const isLate = ch.elapsed >= ch.duration - FUSION_RULES.backlashWindow;
      const col = isLate ? PALETTE.blood : PALETTE.brass;

      drawBresenhamCircle(ctx, sx, sy, ringR, col, 1.0);

      // Draw tether lines from each of the 10 members to the fusion centroid
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
          1
        );
      }

      // Draw overhead channel progress & stagger bar
      const barW = 44;
      const bx = sx - 22;
      const by = sy - 34;
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
