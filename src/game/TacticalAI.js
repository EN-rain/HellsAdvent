/**
 * HellsAdvent — Enemy Intelligence Network, Morale (D24/D29), & Grudges (D26)
 * - Bounded Perception: enemies only know what they or a signaling scout have observed.
 * - Squad Blackboard: Signal Mites and Relay Colossi broadcast short-lived tactical reports.
 * - Morale (D24): Wounded or isolated mobs may hesitate or retreat briefly after nearby ally deaths.
 *   Foreman ritual marchers are 100% immune to morale and never flee (D29).
 * - Enemy Grudges (D26): Elites and Fusion Mid-Bosses remember repeated player dodge habits
 *   within the current session and lead their aim slightly (imperfect & baitable).
 */

import { PALETTE } from '../data/config.js';
import { obstacleManager } from './Obstacles.js';

export class TacticalSystem {
  constructor() {
    this.reset();
  }

  reset() {
    // Bounded player observation history (only updated when an enemy has Line of Sight)
    this.lastSeenPlayerX = 3000;
    this.lastSeenPlayerY = 3000;
    this.lastSeenTimestamp = 0;
    this.observationConfidence = 0;
    this.recentDodgeAngles = []; // Last 4 observed player dodge angles
    this.recentAttackType = 'melee';
    this.clock = 0;

    // Active squad broadcasts from Signal Mites / Relay Colossi / Plate Marshals
    this.broadcasts = []; // { sourceId, x, y, radius, expiresAt, predictedDodgeAngle, kind }

    // Cap simultaneous fleeing mobs so they never become annoying to hunt down (D24)
    this.activeFleeingCount = 0;
  }

  recordPlayerDodge(player, dodgeAngle, spawner) {
    if (!player || !spawner) return;
    // Only record if at least one active enemy within 420px has line of sight
    const witnesses = spawner.queryRadius(player.x, player.y, 420);
    let seen = false;
    for (let i = 0; i < witnesses.length; i++) {
      const e = witnesses[i];
      if (!e.active || e.hp <= 0) continue;
      if (obstacleManager.hasLineOfSight(e.x, e.y, player.x, player.y)) {
        seen = true;
        // D26: Special enemies (Elites & Fusion Mid-Bosses) build a session grudge on repeated dodges
        if (e.tier === 'elite' || e.tier === 'fusionBoss') {
          this._updateEntityGrudge(e, player, dodgeAngle);
        }
      }
    }

    if (seen) {
      this.recentDodgeAngles.push(dodgeAngle);
      if (this.recentDodgeAngles.length > 4) {
        this.recentDodgeAngles.shift();
      }
    }
  }

  _updateEntityGrudge(enemy, player, dodgeAngle) {
    const toPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    let rel = dodgeAngle - toPlayer;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    const side = rel >= 0 ? 1 : -1;

    if (!enemy.grudgeState) {
      enemy.grudgeState = { preferredSide: side, confidence: 1, timer: 14.0 };
    } else {
      if (enemy.grudgeState.preferredSide === side) {
        enemy.grudgeState.confidence = Math.min(3, enemy.grudgeState.confidence + 1);
      } else {
        enemy.grudgeState.preferredSide = side;
        enemy.grudgeState.confidence = 1;
      }
      enemy.grudgeState.timer = 14.0;
    }
  }

  /**
   * Called when an enemy dies so nearby allies experience a morale drop (D24).
   */
  onEnemyKilled(deadEnemy, spawner) {
    if (!deadEnemy || !spawner) return;

    // Remove any active broadcast owned by this scout
    for (let i = this.broadcasts.length - 1; i >= 0; i--) {
      if (this.broadcasts[i].sourceUid === deadEnemy.uid) {
        this.broadcasts.splice(i, 1);
      }
    }

    const nearby = spawner.queryRadius(deadEnemy.x, deadEnemy.y, 190);
    const moraleShock = deadEnemy.tier === 'elite' || deadEnemy.tier === 'fusionBoss' ? 38 : 22;

    for (let i = 0; i < nearby.length; i++) {
      const ally = nearby[i];
      if (!ally.active || ally.hp <= 0 || ally === deadEnemy) continue;
      // D29: Ritual marchers are immune to morale and never flee
      if (ally.isRitualMarcher || ally.tier === 'boss') continue;

      ally.morale = Math.max(0, (ally.morale ?? 100) - moraleShock);
    }
  }

  emitBroadcast(sourceEnemy, radius = 260, duration = 4.5, kind = 'intercept') {
    if (!sourceEnemy || !sourceEnemy.active) return;
    let avgDodge = null;
    if (this.recentDodgeAngles.length >= 2) {
      const last = this.recentDodgeAngles[this.recentDodgeAngles.length - 1];
      avgDodge = last;
    }
    this.broadcasts.push({
      sourceUid: sourceEnemy.uid,
      x: sourceEnemy.x,
      y: sourceEnemy.y,
      radius,
      expiresAt: this.clock + duration,
      predictedDodgeAngle: avgDodge,
      kind,
    });
    if (this.broadcasts.length > 8) this.broadcasts.shift();
  }

  hasActiveBroadcastAt(x, y) {
    for (let i = 0; i < this.broadcasts.length; i++) {
      const b = this.broadcasts[i];
      if (this.clock <= b.expiresAt && Math.hypot(x - b.x, y - b.y) <= b.radius) {
        return b;
      }
    }
    return null;
  }

  update(dt, player, allEnemies) {
    this.clock += dt;

    for (let i = this.broadcasts.length - 1; i >= 0; i--) {
      if (this.clock > this.broadcasts[i].expiresAt) {
        this.broadcasts.splice(i, 1);
      }
    }

    let fleeingNow = 0;
    for (let i = 0; i < allEnemies.length; i++) {
      const e = allEnemies[i];
      if (!e.active || e.hp <= 0) continue;

      if (e.grudgeState) {
        e.grudgeState.timer -= dt;
        if (e.grudgeState.timer <= 0) {
          e.grudgeState = null;
        }
      }

      // D29: Ritual marchers never use morale
      if (e.isRitualMarcher) {
        e.morale = 100;
        e.aiRoleState = 'RITUAL_MARCH';
        continue;
      }

      if (e.morale === undefined) e.morale = 100;
      // Recover morale gradually over time so fleeing mobs return to the fight (Section 11.1)
      e.morale = Math.min(100, e.morale + 11 * dt);

      if (e.aiRoleState === 'RETREAT') {
        fleeingNow++;
      }
    }
    this.activeFleeingCount = fleeingNow;
  }

  /**
   * Computes bounded tactical steering for an enemy:
   * Returns { dirX, dirY, speedMult, roleLabel }
   */
  computeSteering(enemy, player, baseDirX, baseDirY, distToPlayer, spawner) {
    const navOpts = {
      isFlying: !!enemy.flying,
      isBurrowed: !!(enemy.bm && enemy.bm.subsurfaceTimer > 0) || !!enemy.isBurrowed,
      ignoreHazards: !!enemy.isRitualMarcher,
    };

    // 1. Foreman Ritual Marchers always march straight toward the Foreman's body (D29, D30)
    if (enemy.isRitualMarcher && enemy.ritualTargetX !== undefined) {
      const dx = enemy.ritualTargetX - enemy.x;
      const dy = enemy.ritualTargetY - enemy.y;
      const d = Math.hypot(dx, dy) || 1;
      const steered = obstacleManager.steerDirection(
        enemy.x,
        enemy.y,
        dx / d,
        dy / d,
        enemy.radius,
        navOpts
      );
      return {
        dirX: steered.dirX,
        dirY: steered.dirY,
        speedMult: 1.0,
        role: 'MARCH',
      };
    }

    // 2. Morale check for wounded/shaken common mobs (D24)
    if (
      enemy.tier === 'common' &&
      !enemy.isRitualMarcher &&
      !enemy.fusionLocked &&
      enemy.id !== 'siltMimic'
    ) {
      const hpRatio = enemy.hp / (enemy.maxHp || 24);
      const lowMorale = (enemy.morale ?? 100) < 32 || (hpRatio < 0.3 && (enemy.morale ?? 100) < 55);

      if (lowMorale && (enemy.aiRoleState === 'RETREAT' || this.activeFleeingCount < 3)) {
        enemy.aiRoleState = 'RETREAT';
        const steered = obstacleManager.steerDirection(
          enemy.x,
          enemy.y,
          -baseDirX,
          -baseDirY,
          enemy.radius,
          navOpts
        );
        return {
          dirX: steered.dirX,
          dirY: steered.dirY,
          speedMult: 1.15,
          role: 'PANIC',
        };
      } else if (enemy.aiRoleState === 'RETREAT' && (enemy.morale ?? 100) >= 55) {
        enemy.aiRoleState = 'CHASE';
      }
    }

    // 3. Signal Mite Scout behavior: hold range (~165px) and broadcast player habits
    if (enemy.id === 'signalMite') {
      if (distToPlayer < 125) {
        enemy.aiRoleState = 'HOLD_RANGE';
        const steered = obstacleManager.steerDirection(
          enemy.x,
          enemy.y,
          -baseDirX,
          -baseDirY,
          enemy.radius,
          navOpts
        );
        return { dirX: steered.dirX, dirY: steered.dirY, speedMult: 1.05, role: 'SCOUT' };
      }
      if (distToPlayer <= 250) {
        enemy.aiRoleState = 'SIGNAL';
        const perpX = -baseDirY;
        const perpY = baseDirX;
        return { dirX: perpX, dirY: perpY, speedMult: 0.65, role: 'SIGNAL' };
      }
    }

    // 4. Coordinate flank if receiving a Signal Mite / Marshal broadcast
    const report = this.hasActiveBroadcastAt(enemy.x, enemy.y);
    if (report && enemy.tier === 'common' && distToPlayer < 220 && distToPlayer > 48) {
      enemy.aiRoleState = 'FLANK';
      const side = (enemy.uid % 2 === 0 ? 1 : -1) * 0.55;
      const ang = Math.atan2(baseDirY, baseDirX) + side;
      const steered = obstacleManager.steerDirection(
        enemy.x,
        enemy.y,
        Math.cos(ang),
        Math.sin(ang),
        enemy.radius,
        navOpts
      );
      return {
        dirX: steered.dirX,
        dirY: steered.dirY,
        speedMult: 1.12,
        role: 'FLANK',
      };
    }

    // Default pursuit with obstacle navigation
    enemy.aiRoleState = 'CHASE';
    const steered = obstacleManager.steerDirection(
      enemy.x,
      enemy.y,
      baseDirX,
      baseDirY,
      enemy.radius,
      navOpts
    );
    return {
      dirX: steered.dirX,
      dirY: steered.dirY,
      speedMult: 1.0,
      role: 'CHASE',
    };
  }

  /**
   * Returns an aim angle adjusted by Elite/Fusion Grudge or Squad Broadcast (bounded & baitable).
   */
  getPredictedAimAngle(enemy, player) {
    const rawAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

    // D26: Elite / Fusion Boss grudge lead
    if (enemy.grudgeState && enemy.grudgeState.confidence >= 2) {
      const lead = enemy.grudgeState.preferredSide * 0.24;
      return rawAngle + lead;
    }

    // Squad broadcast lead
    const report = this.hasActiveBroadcastAt(enemy.x, enemy.y);
    if (report && report.predictedDodgeAngle !== null) {
      let diff = report.predictedDodgeAngle - rawAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      return rawAngle + Math.sign(diff) * 0.18;
    }

    return rawAngle;
  }

  drawWorldOverlays(ctx, camera) {
    const camX = camera.renderX;
    const camY = camera.renderY;

    // Draw Signal Mite / Relay Colossus tactical broadcast rings
    for (let i = 0; i < this.broadcasts.length; i++) {
      const b = this.broadcasts[i];
      if (!camera.isVisible(b.x, b.y, b.radius)) continue;
      const sx = Math.round(b.x - camX);
      const sy = Math.round(b.y - camY);
      const pulseR = Math.round(16 + ((this.clock * 90) % Math.min(120, b.radius)));
      ctx.strokeStyle = PALETTE.signal;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export const tacticalSystem = new TacticalSystem();
