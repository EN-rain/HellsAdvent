/**
 * GRAVEL SKY — Generic Status Effect & Buff Engine + Damage Pipeline
 * Runs all 28 statuses from /src/data/statuses.js on Player, Enemies, and Bosses.
 * Zero copy-pasted status logic.
 */

import { PALETTE } from '../data/config.js';
import { STATUSES } from '../data/statuses.js';
import { drawBresenhamCircle, drawPixelLine } from './PixelArt.js';
import { sound } from './Audio.js';

// Stores the most recent step-by-step damage pipeline breakdown for ?status-test
export let lastDamagePipelineLog = null;

/**
 * Exact Ordered Damage Pipeline:
 * 1) baseDamage
 * 2) x (1 + sum of ATK buffs and class mechanic bonuses)
 * 3) x crit (critMult if isCrit else 1.0)
 * 4) x distanceBonus (1 + distanceBonusPct)
 * 5) x (1 + 0.20 if Marked) [and x (1 + 0.30 if Boss Staggered)]
 * 6) -> target damage reduction (sum of all sources, capped at 75%)
 * 7) -> DEF reduction: damage * 100 / (100 + effectiveDEF)
 * Invulnerable overrides everything.
 */
export function computeDamagePipeline({
  baseDamage = 10,
  atkBuffPct = 0, // sum of ATK buffs + Momentum / Clean Mag / Settled / Good Arm
  isCrit = false,
  critMult = 1.5,
  distanceBonusPct = 0, // Rook distance bonus (0..0.30 or 0..0.60)
  targetStatuses = null, // StatusSystem of target
  targetBaseDef = 0,
  targetEquipDamageReduction = 0, // e.g., Plate Coat 8%, Sena Anvil Guarding, etc.
  isFrontalHit = false, // for Guarding 60% frontal block
  ignoreDef = false, // true for DoTs (Bleed, Burn)
  sourceName = 'Attack',
  targetName = 'Target',
}) {
  const steps = [];
  steps.push(`1. Base Damage (${sourceName} -> ${targetName}): ${baseDamage.toFixed(2)}`);

  if (targetStatuses && targetStatuses.isInvulnerable()) {
    steps.push('2. Target is Invulnerable (Untouchable) -> Final Damage: 0');
    const result = { finalDamage: 0, blockedByInvuln: true, steps };
    lastDamagePipelineLog = result;
    return result;
  }

  // Step 2: ATK buffs & class mechanic bonuses
  const atkMult = Math.max(0, 1 + atkBuffPct);
  let dmg = baseDamage * atkMult;
  steps.push(
    `2. ATK Buffs & Class Mechanic (x${atkMult.toFixed(2)} [+${Math.round(atkBuffPct * 100)}%]): ${dmg.toFixed(2)}`
  );

  // Step 3: Crit
  const cMult = isCrit ? critMult : 1.0;
  dmg *= cMult;
  steps.push(`3. Critical Hit (${isCrit ? `YES x${cMult.toFixed(2)}` : 'NO x1.00'}): ${dmg.toFixed(2)}`);

  // Step 4: Distance bonus
  const distMult = 1 + Math.max(0, distanceBonusPct);
  dmg *= distMult;
  steps.push(
    `4. Distance Bonus (x${distMult.toFixed(2)} [+${Math.round(distanceBonusPct * 100)}%]): ${dmg.toFixed(2)}`
  );

  // Step 5: Marked (+20%) & Boss Staggered (+30%)
  const isMarked = targetStatuses ? targetStatuses.has('marked') : false;
  const isStaggered = targetStatuses ? targetStatuses.staggeredTimer > 0 : false;
  const markMult = 1 + (isMarked ? 0.20 : 0);
  dmg *= markMult;
  steps.push(`5. Marked Bonus (${isMarked ? 'Marked x1.20' : 'None x1.00'}): ${dmg.toFixed(2)}`);

  if (isStaggered) {
    dmg *= 1.30;
    steps.push(`5b. Boss Staggered Bonus (x1.30): ${dmg.toFixed(2)}`);
  }

  // Step 6: Target damage reduction (sum of all sources, capped at 75%)
  const statusDr = targetStatuses ? targetStatuses.getTotalDamageReduction(isFrontalHit) : 0;
  const rawDr = Math.max(0, targetEquipDamageReduction + statusDr);
  const cappedDr = Math.min(0.75, rawDr);
  dmg *= 1 - cappedDr;
  steps.push(
    `6. Target Damage Reduction (${Math.round(rawDr * 100)}% raw -> ${Math.round(cappedDr * 100)}% capped [max 75%]): ${dmg.toFixed(2)}`
  );

  // Step 7: DEF reduction (damage * 100 / (100 + DEF))
  let effectiveDef = Math.max(0, targetBaseDef);
  if (!ignoreDef) {
    if (targetStatuses) {
      effectiveDef = targetStatuses.getEffectiveDef(effectiveDef);
    }
    const defMult = 100 / (100 + effectiveDef);
    dmg *= defMult;
    steps.push(
      `7. DEF Reduction (Effective DEF ${effectiveDef.toFixed(1)} -> x${defMult.toFixed(3)}): ${dmg.toFixed(2)}`
    );
  } else {
    steps.push('7. DEF Reduction: Ignored (Damage over Time)');
  }

  const finalDamage = Math.max(1, Math.round(dmg));
  steps.push(`8. Final Rounded Damage: ${finalDamage}`);

  const result = {
    finalDamage,
    blockedByInvuln: false,
    effectiveDef,
    cappedDr,
    isMarked,
    isStaggered,
    steps,
  };
  lastDamagePipelineLog = result;
  return result;
}

export class StatusSystem {
  /**
   * @param {any} ownerOrTier
   * @param {'player' | 'common' | 'elite' | 'boss'} [maybeTier]
   */
  constructor(ownerOrTier = 'common', maybeTier = null) {
    if (typeof ownerOrTier === 'string') {
      this.owner = null;
      this.entityTier = ownerOrTier;
    } else {
      this.owner = ownerOrTier;
      this.entityTier =
        maybeTier ||
        (ownerOrTier?.isBoss ? 'boss' : ownerOrTier?.isElite ? 'elite' : 'common');
    }

    // Map of statusId -> statusEntry
    this.map = new Map();

    // Diminishing returns window on hard CC (Stun, Lifted)
    this.drCount = 0;
    this.drWindowTimer = 0;

    // Resist floating word throttle (once per 0.5s)
    this.resistFeedbackCooldown = 0;

    // Visual feedback timers
    this.cleanseWipeTimer = 0; // 3-frame white wipe across sprite (feet -> head)
    this.buffRingTimer = 0; // 4-frame ground ring when a buff lands
    this.buffRingColor = PALETTE.signal;
    this.exposedFlashTimer = 0; // 1-frame bone outline flash when Exposed lands

    // Boss Stagger meter (0..100, decays 5/s, at 100 staggered for 2s and locked for 20s)
    this.stagger = 0;
    this.staggerMax = 100;
    this.staggeredTimer = 0;
    this.staggerLockTimer = 0;
  }

  clearAll() {
    this.map.clear();
    this.drCount = 0;
    this.drWindowTimer = 0;
    this.stagger = 0;
    this.staggeredTimer = 0;
    this.staggerLockTimer = 0;
  }

  clearCombatStatusesOnLoad() {
    for (const [id, inst] of this.map.entries()) {
      const def = STATUSES[id];
      if (!def || !def.persistOnSave) {
        this.map.delete(id);
      }
    }
  }

  has(statusId) {
    return this.map.has(statusId);
  }

  get(statusId) {
    return this.map.get(statusId) || null;
  }

  getStacks(statusId) {
    const inst = this.map.get(statusId);
    if (!inst) return 0;
    return inst.stacks || 1;
  }

  isInvulnerable() {
    for (const inst of this.map.values()) {
      if (inst.def.flags && inst.def.flags.invulnerable) return true;
    }
    return false;
  }

  cannotMove() {
    if (this.staggeredTimer > 0) return true;
    for (const inst of this.map.values()) {
      if (inst.def.flags && inst.def.flags.cantMove) return true;
    }
    return false;
  }

  cannotAct() {
    if (this.staggeredTimer > 0) return true;
    for (const inst of this.map.values()) {
      if (inst.def.flags && inst.def.flags.cantAct) return true;
    }
    return false;
  }

  isLifted() {
    return this.map.has('lifted');
  }

  isPinned() {
    return this.map.has('pinned');
  }

  isStunned() {
    return this.map.has('stun') || this.map.has('staggered') || this.staggeredTimer > 0;
  }

  isHardCCed() {
    return this.cannotAct() || this.isStunned() || this.isLifted();
  }

  isImmobilized() {
    return this.cannotMove() || this.isPinned();
  }

  isTaunted() {
    return this.map.has('drawnIn');
  }

  _spawnResistWord(entity, particles, text = 'Immune') {
    if (!particles || !entity || this.resistFeedbackCooldown > 0) return;
    this.resistFeedbackCooldown = 0.5;
    particles.spawnDamageNumber(
      entity.x,
      entity.y - (entity.radius || 14) - 6,
      0,
      false,
      text,
      PALETTE.boneDark
    );
  }

  /**
   * Apply a status effect or buff to the owner entity.
   */
  apply(statusId, options = {}, entity = null, particles = null) {
    const def = STATUSES[statusId];
    if (!def) return false;

    if (def.playerOnly && this.entityTier !== 'player') {
      return false;
    }

    let duration =
      options.duration !== undefined ? options.duration : def.defaultDuration;
    const sourceAtk = options.sourceAtk !== undefined ? options.sourceAtk : 10;
    const sourceName = options.sourceName || 'Source';
    let value = options.value !== undefined ? options.value : 0.30; // e.g. Slow %

    // --- CROWD CONTROL & TIER RULES ---
    const isHardCC = !!(def.flags && def.flags.hardCC); // Stun, Lifted

    // 1. Boss Immunities & Stagger Meter conversion
    if (this.entityTier === 'boss') {
      if (
        statusId === 'stun' ||
        statusId === 'pinned' ||
        statusId === 'lifted' ||
        statusId === 'drawnIn'
      ) {
        if (statusId !== 'drawnIn' && this.staggerLockTimer <= 0 && this.staggeredTimer <= 0) {
          let staggerAdd = 0;
          if (statusId === 'stun') staggerAdd = 25 + 10 * duration;
          else if (statusId === 'pinned') staggerAdd = 15;
          else if (statusId === 'lifted') staggerAdd = 40;

          this.stagger = Math.min(this.staggerMax, this.stagger + staggerAdd);
          if (this.stagger >= this.staggerMax) {
            this.stagger = this.staggerMax;
            this.staggeredTimer = 2.0; // Staggered for 2s
            this.staggerLockTimer = 20.0; // Locked for 20s
            sound.playStatusStun();
            if (particles && entity) {
              particles.spawnDamageNumber(
                entity.x,
                entity.y - (entity.radius || 34) - 10,
                0,
                true,
                'STAGGERED!',
                PALETTE.brass
              );
            }
          } else {
            this._spawnResistWord(entity, particles, 'Immune');
          }
        } else {
          this._spawnResistWord(entity, particles, 'Immune');
        }
        return false;
      }

      // Slow works at 50% strength on Bosses
      if (statusId === 'slow') {
        value *= 0.5;
      }
    }

    // 2. Elite CC reduction: Stun, Slow, and Pinned last 50% as long
    if (this.entityTier === 'elite') {
      if (statusId === 'stun' || statusId === 'slow' || statusId === 'pinned') {
        duration *= 0.5;
      }
    }

    // 3. Player protection: Shaken Off immunity & max 1.2s enemy stun
    if (this.entityTier === 'player' && isHardCC) {
      if (this.map.has('shakenOff')) {
        this._spawnResistWord(entity, particles, 'Immune');
        return false;
      }
      if (statusId === 'stun') {
        duration = Math.min(1.2, duration);
      }
    }

    // 4. Diminishing returns on hard crowd control (Stun, Lifted):
    // 1st in 8s = 100%, 2nd = 50%, 3rd = 25%, then window resets
    if (isHardCC) {
      if (this.drCount === 0) {
        this.drWindowTimer = 8.0;
        this.drCount = 1;
      } else if (this.drCount === 1) {
        duration *= 0.5;
        this.drCount = 2;
      } else if (this.drCount === 2) {
        duration *= 0.25;
        this.drCount = 0; // Window resets after 3rd
        this.drWindowTimer = 0;
      }
    }

    // --- PLAY AUDIO & VISUAL TRIGGERS ---
    if (statusId === 'bleed') sound.playStatusBleed();
    else if (statusId === 'burn') sound.playStatusBurn();
    else if (statusId === 'corrode') sound.playStatusCorrode();
    else if (statusId === 'stun' || statusId === 'lifted') sound.playStatusStun();
    else if (def.kind === 'buff' && !this.map.has(statusId) && statusId !== 'warmed') {
      sound.playBuffApply();
      this.buffRingTimer = 4 / 24; // 4-frame ground ring at 24fps
      this.buffRingColor = def.color || PALETTE.signal;
    }

    if (statusId === 'exposed') {
      this.exposedFlashTimer = 2 / 24;
    }

    // --- STACKING RULES ---
    const existing = this.map.get(statusId);
    const maxStacks = options.maxStacks || def.maxStacks || 1;

    if (!existing) {
      const entry = {
        id: statusId,
        def,
        stacks: 1,
        duration,
        maxDuration: duration,
        sourceAtk,
        sourceName,
        value,
        branchMode: options.branchMode || 'base',
        dropBonusDamage: !!options.dropBonusDamage,
        tauntTarget: options.tauntTarget || null,
        dotTickTimer: 0,
        dotNumberTimer: 0,
        dotAccumulatedDamage: 0,
        instances:
          def.stacking === 'independent'
            ? [{ duration, maxDuration: duration, sourceAtk, sourceName }]
            : null,
      };
      this.map.set(statusId, entry);
      return true;
    }

    // Handle re-application according to stacking rule
    switch (def.stacking) {
      case 'refresh':
      case 'consume': {
        existing.duration = Math.max(existing.duration, duration);
        existing.maxDuration = Math.max(existing.maxDuration, duration);
        existing.sourceAtk = sourceAtk;
        existing.sourceName = sourceName;
        if (options.branchMode) existing.branchMode = options.branchMode;
        if (options.dropBonusDamage !== undefined) {
          existing.dropBonusDamage = !!options.dropBonusDamage;
        }
        if (options.tauntTarget) existing.tauntTarget = options.tauntTarget;
        break;
      }

      case 'stack': {
        existing.stacks = Math.min(maxStacks, existing.stacks + 1);
        existing.duration = duration;
        existing.maxDuration = duration;
        existing.sourceAtk = sourceAtk;
        existing.sourceName = sourceName;
        if (options.branchMode) existing.branchMode = options.branchMode;
        break;
      }

      case 'independent': {
        if (!existing.instances) existing.instances = [];
        if (existing.instances.length < maxStacks) {
          existing.instances.push({
            duration,
            maxDuration: duration,
            sourceAtk,
            sourceName,
          });
        } else {
          // Replace the shortest remaining timer
          let minIdx = 0;
          for (let i = 1; i < existing.instances.length; i++) {
            if (existing.instances[i].duration < existing.instances[minIdx].duration) {
              minIdx = i;
            }
          }
          existing.instances[minIdx] = {
            duration,
            maxDuration: duration,
            sourceAtk,
            sourceName,
          };
        }
        existing.stacks = existing.instances.length;
        existing.duration = Math.max(...existing.instances.map((x) => x.duration));
        existing.maxDuration = Math.max(existing.maxDuration, duration);
        break;
      }

      case 'strongest': {
        // Only the strongest value counts and the longer duration is kept
        if (value > existing.value) {
          existing.value = value;
          existing.sourceName = sourceName;
        }
        if (duration > existing.duration) {
          existing.duration = duration;
          existing.maxDuration = Math.max(existing.maxDuration, duration);
        }
        break;
      }

      default:
        existing.duration = duration;
        break;
    }

    return true;
  }

  consume(statusId) {
    if (!this.map.has(statusId)) return null;
    const inst = this.map.get(statusId);
    this.map.delete(statusId);
    sound.playBuffExpire();
    return inst;
  }

  remove(statusId) {
    if (this.map.has(statusId)) {
      this.map.delete(statusId);
      return true;
    }
    return false;
  }

  removeStacks(statusId, count = 1) {
    const inst = this.map.get(statusId);
    if (!inst) return;
    if (inst.instances) {
      inst.instances.splice(0, count);
      if (inst.instances.length === 0) {
        this.map.delete(statusId);
      } else {
        inst.stacks = inst.instances.length;
      }
    } else {
      inst.stacks -= count;
      if (inst.stacks <= 0) {
        this.map.delete(statusId);
      }
    }
  }

  /**
   * Cleanse helpers
   */
  cleanseSpecific(statusIds = []) {
    let removedAny = false;
    for (const id of statusIds) {
      const inst = this.map.get(id);
      if (inst && inst.def.cleansable) {
        this.map.delete(id);
        removedAny = true;
      }
    }
    if (removedAny) {
      this.cleanseWipeTimer = 3 / 24; // 3-frame white wipe across sprite
      sound.playBuffApply();
    }
    return removedAny;
  }

  cleanseAllDebuffs() {
    let removedAny = false;
    for (const [id, inst] of this.map.entries()) {
      if (inst.def.kind === 'debuff' && inst.def.cleansable) {
        this.map.delete(id);
        removedAny = true;
      }
    }
    if (removedAny) {
      this.cleanseWipeTimer = 3 / 24;
    }
    return removedAny;
  }

  halveBurnOnDodge() {
    const burn = this.map.get('burn');
    if (burn) {
      burn.duration *= 0.5;
      if (burn.duration <= 0.05) {
        this.map.delete('burn');
      }
    }
  }

  onOwnerDodge() {
    this.halveBurnOnDodge();
  }

  cleanse(statusIds = []) {
    return this.cleanseSpecific(statusIds);
  }

  clearAllDebuffs() {
    return this.cleanseAllDebuffs();
  }

  consumeIfPresent(statusId) {
    return this.consume(statusId);
  }

  addStagger(amount = 15, particles = null) {
    if (this.entityTier !== 'boss') return false;
    if (this.staggerLockTimer > 0 || this.staggeredTimer > 0) return false;
    this.stagger = Math.min(this.staggerMax, this.stagger + amount);
    if (this.stagger >= this.staggerMax) {
      this.stagger = this.staggerMax;
      this.staggeredTimer = 3.0;
      this.staggerLockTimer = 20.0;
      sound.playStatusStun();
      if (particles && this.owner) {
        particles.spawnFloatingText(
          this.owner.x,
          this.owner.y - (this.owner.radius || 34) - 10,
          'STAGGERED!',
          PALETTE.brass
        );
      }
      return true;
    }
    return false;
  }

  /**
   * Updates all active timers, 10Hz DoT ticks, 1Hz DoT floating numbers,
   * Diminishing Returns window, and Boss Stagger meter.
   */
  update(dt, arg1 = null, arg2 = null, arg3 = null) {
    // Support both update(dt, particles, world) when owner is bound AND update(dt, ownerEntity, particles, onDotDamage)
    let ownerEntity = this.owner;
    let particles = arg1;
    let onDotDamage = arg3;
    if (arg1 && typeof arg1.x === 'number' && !arg1.spawnParticle) {
      ownerEntity = arg1;
      particles = arg2;
    }
    if (!onDotDamage && ownerEntity) {
      onDotDamage = (tickDmg) => {
        if (ownerEntity.dead) return;
        ownerEntity.hp = Math.max(0, ownerEntity.hp - tickDmg);
      };
    }

    if (this.resistFeedbackCooldown > 0) {
      this.resistFeedbackCooldown = Math.max(0, this.resistFeedbackCooldown - dt);
    }
    if (this.cleanseWipeTimer > 0) {
      this.cleanseWipeTimer = Math.max(0, this.cleanseWipeTimer - dt);
    }
    if (this.buffRingTimer > 0) {
      this.buffRingTimer = Math.max(0, this.buffRingTimer - dt);
    }
    if (this.exposedFlashTimer > 0) {
      this.exposedFlashTimer = Math.max(0, this.exposedFlashTimer - dt);
    }

    if (this.drWindowTimer > 0) {
      this.drWindowTimer -= dt;
      if (this.drWindowTimer <= 0) {
        this.drWindowTimer = 0;
        this.drCount = 0;
      }
    }

    // Boss Stagger meter update
    if (this.entityTier === 'boss') {
      if (this.staggeredTimer > 0) {
        this.staggeredTimer = Math.max(0, this.staggeredTimer - dt);
        if (this.staggeredTimer === 0) {
          this.stagger = 0;
        }
      } else {
        if (this.staggerLockTimer > 0) {
          this.staggerLockTimer = Math.max(0, this.staggerLockTimer - dt);
        }
        if (this.stagger > 0) {
          this.stagger = Math.max(0, this.stagger - 5 * dt); // Decays 5 per second
        }
      }
    }

    const toApplyAfter = [];

    for (const [id, inst] of this.map.entries()) {
      const def = inst.def;

      // 1. Handle 'independent' timers (Bleed)
      if (def.stacking === 'independent' && inst.instances) {
        let totalDps = 0;
        for (let i = inst.instances.length - 1; i >= 0; i--) {
          const sub = inst.instances[i];
          sub.duration -= dt;
          totalDps += sub.sourceAtk * (def.dotAttackRatio || 0.15);
          if (sub.duration <= 0) {
            inst.instances.splice(i, 1);
          }
        }

        if (inst.instances.length === 0) {
          this.map.delete(id);
          continue;
        }

        inst.stacks = inst.instances.length;
        inst.duration = Math.max(...inst.instances.map((x) => x.duration));

        // 10 Hz DoT internal tick
        inst.dotTickTimer += dt;
        while (inst.dotTickTimer >= 0.1) {
          inst.dotTickTimer -= 0.1;
          const tickDmg = totalDps * 0.1;
          inst.dotAccumulatedDamage += tickDmg;
          if (onDotDamage) {
            onDotDamage(tickDmg, def);
          }
        }

        // Show DoT floating number once per second in status color
        inst.dotNumberTimer += dt;
        if (inst.dotNumberTimer >= 1.0) {
          inst.dotNumberTimer -= 1.0;
          const shown = Math.max(1, Math.round(inst.dotAccumulatedDamage));
          inst.dotAccumulatedDamage = 0;
          if (particles && ownerEntity) {
            particles.spawnDamageNumber(
              ownerEntity.x + (Math.random() * 8 - 4),
              ownerEntity.y - (ownerEntity.radius || 12) - 4,
              shown,
              false,
              `${shown}`,
              def.color
            );
          }
        }
        continue;
      }

      // 2. Standard duration countdown
      inst.duration -= dt;

      // 10 Hz DoT tick for non-independent DoTs (Burn)
      if (def.dotAttackRatio) {
        const dps = inst.sourceAtk * def.dotAttackRatio * (inst.stacks || 1);
        inst.dotTickTimer += dt;
        while (inst.dotTickTimer >= 0.1) {
          inst.dotTickTimer -= 0.1;
          const tickDmg = dps * 0.1;
          inst.dotAccumulatedDamage += tickDmg;
          if (onDotDamage) {
            onDotDamage(tickDmg, def);
          }
        }

        inst.dotNumberTimer += dt;
        if (inst.dotNumberTimer >= 1.0) {
          inst.dotNumberTimer -= 1.0;
          const shown = Math.max(1, Math.round(inst.dotAccumulatedDamage));
          inst.dotAccumulatedDamage = 0;
          if (particles && ownerEntity) {
            particles.spawnDamageNumber(
              ownerEntity.x + (Math.random() * 8 - 4),
              ownerEntity.y - (ownerEntity.radius || 12) - 4,
              shown,
              false,
              `${shown}`,
              def.color
            );
          }
        }
      }

      if (inst.duration <= 0) {
        this.map.delete(id);
        if (def.kind === 'buff' && id !== 'warmed') {
          sound.playBuffExpire();
        }
        // Trigger follow-up status (e.g. Haste -> Crash, Stun/Lifted on player -> Shaken Off)
        if (def.onExpireApply) {
          toApplyAfter.push({ id: def.onExpireApply, opts: { sourceName: def.name } });
        }
        if (this.entityTier === 'player' && (id === 'stun' || id === 'lifted')) {
          toApplyAfter.push({ id: 'shakenOff', opts: { duration: 2.0, sourceName: 'Recovery' } });
        }
        // When Lifted ends on an enemy and Crane 'Lift' bonus is active, drop for 100% bonus damage
        if (id === 'lifted' && inst.dropBonusDamage && onDotDamage) {
          const dropDmg = inst.sourceAtk * 1.0;
          onDotDamage(dropDmg, { ...def, isDropImpact: true });
          if (particles && ownerEntity) {
            particles.spawnDamageNumber(
              ownerEntity.x,
              ownerEntity.y - (ownerEntity.radius || 12),
              Math.round(dropDmg),
              true,
              `${Math.round(dropDmg)}`,
              PALETTE.verdigris
            );
          }
        }
      }
    }

    for (const next of toApplyAfter) {
      this.apply(next.id, next.opts, ownerEntity, particles);
    }
  }

  // --- STAT MODIFIER QUERIES ---

  getEffectiveDef(baseDef) {
    let def = baseDef;
    // Momentum on Anvil gives +3% DEF per stack
    const mom = this.map.get('momentum');
    if (mom && mom.branchMode === 'anvil') {
      def *= 1 + (mom.stacks || 1) * 0.03;
    }
    // Corrode: -15% DEF per stack
    const corrode = this.map.get('corrode');
    if (corrode) {
      const stacks = Math.min(4, corrode.stacks || 1);
      def *= Math.max(0, 1 - 0.15 * stacks);
    }
    // Exposed: -20% DEF (stacks multiplicatively with Corrode)
    if (this.map.has('exposed')) {
      def *= 0.80;
    }
    return Math.max(0, def);
  }

  getAtkBonusPct() {
    let bonus = 0;
    const mom = this.map.get('momentum');
    if (mom && mom.branchMode !== 'anvil') {
      const perStack = mom.branchMode === 'cutter' ? 0.05 : 0.04;
      bonus += (mom.stacks || 1) * perStack;
    }
    if (this.map.has('cleanMag')) bonus += 0.25;
    if (this.map.has('settled')) bonus += 0.80;
    return bonus;
  }

  getMoveSpeedMultiplier() {
    let mult = 1.0;
    // Slow: strongest value
    const slow = this.map.get('slow');
    if (slow) {
      mult *= Math.max(0.15, 1 - (slow.value || 0.30));
    }
    if (this.map.has('crash')) {
      mult *= 0.85; // -15%
    }
    if (this.map.has('haste')) {
      mult *= 1.20; // +20%
    }
    if (this.map.has('redline')) {
      mult *= 1.10; // +10%
    }
    return mult;
  }

  getFlatMoveSpeedBonus() {
    const mom = this.map.get('momentum');
    return mom ? (mom.stacks || 1) * 4 : 0;
  }

  getAttackSpeedMultiplier() {
    let mult = 1.0;
    if (this.map.has('haste')) mult *= 1.10;
    if (this.map.has('overspun')) mult *= 1.25;
    if (this.map.has('rapidFire')) mult *= 2.0;
    if (this.map.has('slow')) mult *= 0.70; // Slow plays animation at 70% speed
    return mult;
  }

  getTotalDamageReduction(isFrontalHit = false) {
    let dr = 0;
    if (isFrontalHit && this.map.has('guarding')) dr += 0.60;
    if (this.map.has('dugIn')) dr += 0.60;
    if (this.map.has('secondSkin')) dr += 0.25;
    if (this.map.has('heavyLanding')) dr += 0.15;
    return Math.min(0.75, dr);
  }

  getMaxHpMultiplier() {
    return this.map.has('fed') ? 1.10 : 1.0;
  }

  getStaminaRegenMultiplier() {
    return this.map.has('choked') ? 0.50 : 1.0;
  }

  getLightRadiusMultiplier() {
    return this.map.has('choked') ? 0.65 : 1.0;
  }

  getXpAndGoldMultiplier() {
    return this.map.has('bounty') ? 1.10 : 1.0;
  }

  /**
   * Returns UI-ready array of active statuses sorted with Debuffs first, then Buffs.
   */
  getUiList() {
    const list = [];
    for (const inst of this.map.values()) {
      const def = inst.def;
      list.push({
        id: inst.id,
        name: def.name,
        kind: def.kind,
        color: def.color,
        icon: def.icon,
        stacks: inst.stacks || 1,
        duration: inst.duration,
        maxDuration: inst.maxDuration || def.defaultDuration || 1,
        noTimerDisplay: !!def.noTimerDisplay,
        priority: def.priority || 50,
        sourceName: inst.sourceName || '',
        tooltip: def.getTooltip ? def.getTooltip(inst) : def.name,
      });
    }
    list.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'debuff' ? -1 : 1;
      return a.priority - b.priority;
    });
    return list;
  }

  getStatTotals() {
    let maxHpPct = 0;
    if (this.map.has('fed') || this.map.has('wellFed')) maxHpPct += 0.15;

    let atkPct = this.getAtkBonusPct();
    if (this.map.has('steadyAim')) atkPct += 0.25;
    if (this.map.has('holdBreath')) atkPct += 0.80;
    if (this.map.has('weakened')) atkPct -= 0.25;

    let defPct = 0;
    const corrode = this.map.get('corrode');
    if (corrode) defPct -= Math.min(4, corrode.stacks || 1) * 0.15;
    if (this.map.has('exposed')) defPct -= 0.20;
    const mom = this.map.get('momentum');
    if (mom && mom.branchMode === 'anvil') defPct += (mom.stacks || 1) * 0.03;

    const moveSpeedPct = this.getMoveSpeedMultiplier() - 1.0;
    let attackSpeedPct = this.getAttackSpeedMultiplier() - 1.0;
    if (this.map.has('quickHands')) attackSpeedPct += 0.25;

    let critChanceBonus = 0;
    if (this.map.has('focus')) critChanceBonus += 0.20;

    let damageReduction = this.getTotalDamageReduction(true);
    if (this.map.has('ironHide')) damageReduction = Math.min(0.75, damageReduction + 0.20);
    if (this.map.has('scrapSkin')) damageReduction = Math.min(0.75, damageReduction + 0.25);

    const staminaRegenMult = this.getStaminaRegenMultiplier();
    const xpGoldMult = this.getXpAndGoldMultiplier();
    const visionMult = this.getLightRadiusMultiplier();

    return {
      maxHpPct,
      atkPct,
      defPct,
      moveSpeedPct,
      attackSpeedPct,
      critChanceBonus,
      damageReduction,
      staminaRegenMult,
      xpGoldMult,
      visionMult,
    };
  }

  getHudStatusList() {
    const list = [];
    for (const inst of this.map.values()) {
      const def = inst.def;
      const isBuff = def.kind === 'buff';
      const baseTooltip = def.getTooltip ? def.getTooltip(inst) : def.name;
      const timeStr =
        def.noTimerDisplay || inst.duration > 9000
          ? ''
          : `, ${inst.duration.toFixed(1)}s`;
      const stackStr = (inst.stacks || 1) > 1 ? ` x${inst.stacks}` : '';
      list.push({
        id: inst.id,
        name: def.name,
        kind: def.kind,
        isBuff,
        color: def.color,
        icon: def.icon,
        stacks: inst.stacks || 1,
        remaining: inst.duration,
        duration: inst.maxDuration || def.defaultDuration || 1,
        noTimerDisplay: !!def.noTimerDisplay,
        priority: def.priority || 50,
        tooltip: `${def.name}${stackStr} - ${baseTooltip}${timeStr}`,
      });
    }
    list.sort((a, b) => a.priority - b.priority);
    return list;
  }

  getOverheadIcons(maxIcons = 3) {
    return this.getHudStatusList().slice(0, maxIcons);
  }

  drawWorldStatusVisuals(ctx, sx, sy, w = 32) {
    this.drawEffectsOnEntity(ctx, sx, sy, Math.round(w * 0.35), performance.now() / 1000);
  }

  toJSON() {
    const saved = [];
    for (const [id, inst] of this.map.entries()) {
      if (inst.def.persistOnSave) {
        saved.push({
          id,
          duration: inst.duration,
          stacks: inst.stacks || 1,
        });
      }
    }
    return saved;
  }

  fromJSON(arr) {
    this.clearAll();
    if (!Array.isArray(arr)) return;
    for (const item of arr) {
      if (item && item.id && STATUSES[item.id]?.persistOnSave) {
        this.apply(item.id, { duration: item.duration });
      }
    }
  }

  /**
   * Draws all active pixel-art status visuals directly around an entity at (sx, sy)
   * on the 480x270 integer canvas. No sparkles, no blurry glow, no generic fire/poison green.
   */
  drawEffectsOnEntity(ctx, sx, sy, radius = 12, animClock = 0) {
    const ix = Math.round(sx);
    const iy = Math.round(sy);
    const frame24 = Math.floor(animClock * 24);
    const frame12 = Math.floor(animClock * 12);

    // 1. Buff 4-frame ground ring on application
    if (this.buffRingTimer > 0) {
      const progress = 1 - this.buffRingTimer / (4 / 24);
      const r = Math.round(radius * (0.7 + progress * 0.9));
      drawBresenhamCircle(ctx, ix, iy + 8, r, this.buffRingColor, 1.0);
    }

    // 2. Active Buff thin colored rim indicator at feet
    let activeBuffColor = null;
    for (const inst of this.map.values()) {
      if (inst.def.kind === 'buff' && inst.id !== 'warmed') {
        activeBuffColor = inst.def.color;
        break;
      }
    }
    if (activeBuffColor) {
      ctx.fillStyle = activeBuffColor;
      ctx.fillRect(ix - radius, iy - 2, 1, 5);
      ctx.fillRect(ix + radius, iy - 2, 1, 5);
    }

    // 3. Shaken Off brief grey flash on sprite
    if (this.map.has('shakenOff') && frame12 % 2 === 0) {
      ctx.fillStyle = PALETTE.boneDark;
      ctx.fillRect(ix - 6, iy - radius - 2, 12, 2);
    }

    // 4. Pinned: nail or short rail spike driven through the shadow on the ground
    if (this.map.has('pinned')) {
      ctx.fillStyle = '#9BA39C';
      ctx.fillRect(ix - 1, iy + 5, 3, 9);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(ix - 3, iy + 4, 7, 2);
    }

    // 5. Bleed: dark red droplets falling from the sprite (3 frames)
    if (this.map.has('bleed')) {
      const f = frame12 % 3;
      ctx.fillStyle = PALETTE.blood;
      ctx.fillRect(ix - 5, iy - 4 + f * 4, 2, 3);
      ctx.fillRect(ix + 4, iy - 2 + ((f + 1) % 3) * 4, 2, 3);
    }

    // 6. Burn: small rust-orange flames on shoulders and head (4 frames, flickering)
    if (this.map.has('burn')) {
      const f = frame12 % 4;
      ctx.fillStyle = PALETTE.rust;
      ctx.fillRect(ix - 6, iy - 10 - (f % 2), 3, 4);
      ctx.fillRect(ix + 4, iy - 9 - ((f + 1) % 2), 3, 4);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(ix - 5, iy - 9, 1, 2);
      ctx.fillRect(ix + 5, iy - 8, 1, 2);
      ctx.fillRect(ix - 1, iy - radius - 3 - (f % 2), 2, 3);
    }

    // 7. Corrode: pale lye yellow-green (#C9D26B) sizzle dots rising from the sprite
    const corrode = this.map.get('corrode');
    if (corrode) {
      const stacks = corrode.stacks || 1;
      ctx.fillStyle = PALETTE.lye;
      for (let s = 0; s < stacks + 1; s++) {
        const dx = ((s * 7 + frame12 * 3) % (radius * 2)) - radius;
        const dy = -((frame12 * 2 + s * 5) % (radius + 8));
        ctx.fillRect(ix + dx, iy + dy, 2, 2);
      }
    }

    // 8. Exposed: thin cracked bone line pattern overlay on torso
    if (this.map.has('exposed')) {
      ctx.fillStyle = this.exposedFlashTimer > 0 ? '#FFFFFF' : PALETTE.bone;
      drawPixelLine(ctx, ix - 4, iy - 6, ix + 2, iy, PALETTE.bone, 1);
      drawPixelLine(ctx, ix + 2, iy, ix - 2, iy + 5, PALETTE.bone, 1);
      drawPixelLine(ctx, ix + 2, iy, ix + 5, iy + 3, PALETTE.bone, 1);
    }

    // 9. Stun: 3 tiny bright points circling the head (4 frames)
    if (this.map.has('stun') || this.staggeredTimer > 0) {
      for (let i = 0; i < 3; i++) {
        const a = animClock * 8 + (i * Math.PI * 2) / 3;
        const px = ix + Math.round(Math.cos(a) * 8);
        const py = iy - radius - 6 + Math.round(Math.sin(a) * 3);
        ctx.fillStyle = i === 0 ? PALETTE.signal : PALETTE.bone;
        ctx.fillRect(px, py, 2, 2);
      }
    }

    // 10. Marked: small brass downward triangle bobbing above the head
    if (this.map.has('marked')) {
      const bob = frame12 % 2 === 0 ? 0 : -2;
      const my = iy - radius - 13 + bob;
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(ix - 4, my - 1, 9, 6);
      ctx.fillStyle = PALETTE.brass;
      ctx.fillRect(ix - 3, my, 7, 2);
      ctx.fillRect(ix - 2, my + 2, 5, 1);
      ctx.fillRect(ix - 1, my + 3, 3, 1);
      ctx.fillRect(ix, my + 4, 1, 1);
    }

    // 11. Cleanse: 3-frame white wipe across the sprite sweeping from feet to head
    if (this.cleanseWipeTimer > 0) {
      const progress = 1 - this.cleanseWipeTimer / (3 / 24);
      const wipeY = Math.round(iy + 10 - progress * (radius * 2 + 12));
      ctx.fillStyle = PALETTE.bone;
      ctx.fillRect(ix - radius, wipeY, radius * 2, 4);
    }
  }
}

export default StatusSystem;
