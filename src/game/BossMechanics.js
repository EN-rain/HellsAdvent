/**
 * HellsAdvent — BossMechanicController, BossRitualController, & RitualActorStore
 * Implements Section 7 and Consolidated Specification (D1–D5, D10, D15, D18, D21–D23, D28–D48):
 * 1. The Foreman: 30s Reassembly Protocol, 15 guaranteed waves of 10 marchers every 2s (150 physical spawns)
 *    in dynamic RitualActorStore exempt from 64/40 caps (D45), 310px No-Fusion AOE (D34),
 *    t=30 resolution (0-9 arrivals = permanent defeat; 10+ = Iron Foreman revival with 10-100% HP & 1.45x-1.0x rage).
 * 2. Big Axle: Engine Heat (0-100), False Ignition feints, Overheat stall, and required Engine Core break gate (D3, D40).
 * 3. Mother Sump: Devour channel with Universal Stagger interrupt (D21), Brine Maw devour support (D10),
 *    bounded heal cap, and 2-denied-feeds / timeout Starvation kill gate (D3, D41).
 * 4. The Long Dry: Subsurface hunt, real vs false emergence tells, and 3-Shell-Segment break gate by any class (D22, D42).
 */

import { PALETTE, ENEMIES_CONFIG } from '../data/config.js';
import { BOSS_MECHANICS_CONFIG } from '../data/expansionConfig.js';
import { obstacleManager } from './Obstacles.js';
import { drawBresenhamCircle, drawPixelLine } from './PixelArt.js';
import { sound } from './Audio.js';

export class BossMechanicsManager {
  constructor() {
    // D45 / D46: Dynamically allocated collection for Foreman ritual-origin actors (no 64/40 cap, no 120 ceiling)
    this.ritualActors = [];
    this.nextRitualUid = 100000;
    this.enemyClassRef = null;
    this.resetAll();
  }

  setEnemyClass(EnemyClass) {
    this.enemyClassRef = EnemyClass;
  }

  resetAll() {
    this.ritualActors = [];
    this.foremanRitual = null;
  }

  /**
   * Discards transient ritual actors and active boss state on death/reload (D8, D19, D43, D48).
   */
  abortActiveEncounter(bossId = null) {
    if (!bossId || bossId === 'theForeman') {
      this.ritualActors = [];
      this.foremanRitual = null;
    }
    if (bossId) {
      obstacleManager.clearByOwner(bossId);
    } else {
      obstacleManager.clearTemporary();
    }
  }

  /**
   * Initializes per-boss mechanic state on a newly spawned boss instance.
   */
  initBossState(boss) {
    if (!boss) return;
    boss.confirmFinalDeath = false;

    if (boss.id === 'theForeman') {
      boss.bm = {
        type: 'foreman',
        ritualTriggered: false,
        ritualActive: false,
        isIronForeman: false,
        arrivals: 0,
        rageMultiplier: 1.0,
        baseDamage: boss.damage,
        baseDef: boss.def,
        barricadeCooldown: 6.5,
        commandCooldown: 8.0,
        repairUsed: false,
      };
    } else if (boss.id === 'bigAxle') {
      const cfg = BOSS_MECHANICS_CONFIG.bigAxle;
      const coreMaxHp = Math.round(boss.maxHp * cfg.coreMaxHpRatio);
      boss.bm = {
        type: 'bigAxle',
        heat: 0,
        maxHeat: cfg.maxHeat,
        coreExposedTimer: 0,
        coreHp: coreMaxHp,
        coreMaxHp,
        coreBroken: false,
        disabledRestartTimer: 0,
        falseIgnitionCooldown: 5.5,
        ventCooldown: 9.0,
        laneObstacleCooldown: 6.5,
        obstacleCrashHeatGranted: false,
        lastChargeHitPlayer: false,
      };
    } else if (boss.id === 'motherSump') {
      const cfg = BOSS_MECHANICS_CONFIG.motherSump;
      boss.bm = {
        type: 'motherSump',
        deniedFeeds: 0,
        requiredDeniedFeeds: cfg.requiredDeniedFeeds,
        feedsAllowed: 0,
        totalHealed: 0,
        maxTotalHeal: Math.round(boss.maxHp * cfg.maxTotalHealRatio),
        isStarved: false,
        starvedTimer: 0,
        noPreyHungerTimer: 0,
        devourChannel: null, // { target, elapsed, duration, staggerDamage, staggerThreshold }
        devourCooldown: 4.5,
        contaminationCooldown: 6.5,
      };
    } else if (boss.id === 'theLongDry') {
      const cfg = BOSS_MECHANICS_CONFIG.theLongDry;
      const segMax = Math.round(boss.maxHp * cfg.segmentHpRatio);
      boss.bm = {
        type: 'theLongDry',
        segMaxHp: segMax,
        segments: [segMax, segMax, segMax],
        segmentsBroken: 0,
        totalSegments: cfg.totalShellSegments,
        exposedWindowTimer: 0,
        subsurfaceTimer: 0,
        burrowCooldown: 6.0,
        terrainCooldown: 7.0,
        decoyTremors: [],
        realEmergenceX: boss.x,
        realEmergenceY: boss.y,
        molted: false,
      };
    }
  }

  /**
   * Authoritative check for the Foreman's marked 30s No-Fusion AOE (D34).
   */
  isInsideForemanNoFusionField(x, y) {
    if (!this.foremanRitual || !this.foremanRitual.active) return false;
    const dx = x - this.foremanRitual.centerX;
    const dy = y - this.foremanRitual.centerY;
    return Math.hypot(dx, dy) <= this.foremanRitual.noFusionRadius;
  }

  /**
   * Intercepts incoming damage on a boss to handle shell windows, core damage, universal stagger, and ritual gates.
   * Returns adjusted damage to boss HP.
   */
  onBossTakeDamage(boss, rawAmount, player, spawner, particles, camera) {
    if (!boss || !boss.bm) return rawAmount;
    const bm = boss.bm;

    // 1. THE FOREMAN: Invulnerable while collapsed in 30s Reassembly Protocol
    if (bm.type === 'foreman') {
      if (bm.ritualActive) {
        if (particles) {
          particles.spawnFloatingText(
            boss.x,
            boss.y - 28,
            'REASSEMBLY ACTIVE! STOP THE MARCHERS!',
            PALETTE.signal
          );
        }
        return 0;
      }
      return rawAmount;
    }

    // 2. BIG AXLE: Exposed Engine Core takes direct core damage during Overheat stall (D3, D40)
    if (bm.type === 'bigAxle') {
      if (bm.disabledRestartTimer > 0) {
        return 0;
      }
      if (bm.coreExposedTimer > 0 && !bm.coreBroken) {
        bm.coreHp = Math.max(0, bm.coreHp - rawAmount * 1.25);
        if (particles) {
          particles.spawnFloatingText(
            boss.x,
            boss.y - 34,
            `CORE HIT! (${Math.ceil(bm.coreHp)} HP)`,
            PALETTE.brass
          );
        }
        if (bm.coreHp <= 0) {
          bm.coreBroken = true;
          bm.coreExposedTimer = 0;
          if (camera) camera.shake(8, 0.3);
          sound.playSkillGroundBreak?.();
          if (particles) {
            particles.spawnGroundBreakEffect(boss.x, boss.y, 110);
            particles.spawnFloatingText(
              boss.x,
              boss.y - 44,
              'ENGINE CORE SHATTERED! FINISH BIG AXLE!',
              PALETTE.signal
            );
          }
        }
      }
      return rawAmount;
    }

    // 3. MOTHER SUMP: Universal Stagger during Devour Channel (D21)
    if (bm.type === 'motherSump') {
      if (bm.devourChannel && bm.devourChannel.active) {
        bm.devourChannel.staggerDamage += rawAmount;
        if (bm.devourChannel.staggerDamage >= bm.devourChannel.staggerThreshold) {
          this._interruptMotherSumpDevour(boss, 'STAGGER BREAK', particles, camera);
        }
      }
      // Digestive armor reduces damage by 40% unless Starved
      if (!bm.isStarved && boss.hp < boss.maxHp * 0.35) {
        return Math.max(1, Math.round(rawAmount * 0.65));
      }
      return rawAmount;
    }

    // 4. THE LONG DRY: Any class damages exposed Shell Segments during exposure window (D22, D42)
    if (bm.type === 'theLongDry') {
      if (bm.subsurfaceTimer > 0) {
        return 0; // Underground
      }
      if (bm.segmentsBroken < bm.totalSegments) {
        if (bm.exposedWindowTimer > 0) {
          const segIdx = bm.segmentsBroken;
          bm.segments[segIdx] = Math.max(0, bm.segments[segIdx] - rawAmount * 1.35);
          if (bm.segments[segIdx] <= 0) {
            bm.segmentsBroken++;
            if (camera) camera.shake(7, 0.24);
            sound.playShieldBlock?.();
            if (particles) {
              particles.spawnShockwave(boss.x, boss.y, 88, PALETTE.brass, 0.28);
              particles.spawnFloatingText(
                boss.x,
                boss.y - 38,
                bm.segmentsBroken >= bm.totalSegments
                  ? 'ALL 3 SHELL PLATES SHATTERED! CORE EXPOSED!'
                  : `SHELL SEGMENT ${bm.segmentsBroken}/3 SHATTERED!`,
                PALETTE.signal
              );
            }
          }
          return Math.round(rawAmount * 0.85);
        } else {
          // Armored shell deflects 65% outside exposure window; prompt player to bait emergence
          if (Math.random() < 0.35 && particles) {
            particles.spawnFloatingText(
              boss.x,
              boss.y - 30,
              'ARMORED SHELL! BAIT EMERGENCE RECOVERY!',
              PALETTE.boneDark
            );
          }
          return Math.max(1, Math.round(rawAmount * 0.35));
        }
      }
      return rawAmount;
    }

    return rawAmount;
  }

  /**
   * Intercepts HP <= 0 on a boss. Returns true if the boss is allowed to die permanently,
   * or false if a mandatory kill gate / Reassembly Protocol intercepts death!
   */
  shouldAllowFinalBossDeath(boss, player, spawner, particles, camera) {
    if (!boss || !boss.bm) return true;
    if (boss.confirmFinalDeath) return true;
    const bm = boss.bm;

    // 1. THE FOREMAN: First HP=0 triggers 30s Reassembly Protocol (D1, D28, D36, D45)
    if (bm.type === 'foreman') {
      if (!bm.ritualTriggered && !bm.isIronForeman) {
        this._startForemanRitual(boss, player, spawner, particles, camera);
        return false;
      }
      if (bm.ritualActive) {
        boss.hp = 1;
        return false;
      }
      // Iron Foreman defeated -> permanent victory!
      boss.confirmFinalDeath = true;
      return true;
    }

    // 2. BIG AXLE: Requires Engine Core to be broken (D3, D40)
    if (bm.type === 'bigAxle') {
      if (bm.coreBroken) {
        boss.confirmFinalDeath = true;
        return true;
      }
      // D40: Missed core window at 0 HP -> brief disabled state, then restarts at capped 18% HP with high heat
      boss.hp = 1;
      if (bm.disabledRestartTimer <= 0 && bm.coreExposedTimer <= 0) {
        bm.heat = 100;
        bm.coreExposedTimer = BOSS_MECHANICS_CONFIG.bigAxle.coreExposedDuration;
        if (particles) {
          particles.spawnFloatingText(
            boss.x,
            boss.y - 38,
            'OVERHEAT STALL! SHATTER THE EXPOSED CORE NOW!',
            PALETTE.brass
          );
        }
      }
      return false;
    }

    // 3. MOTHER SUMP: Requires Starved state (2 denied feeds or hunger timeout, D3, D41)
    if (bm.type === 'motherSump') {
      if (bm.isStarved) {
        boss.confirmFinalDeath = true;
        return true;
      }
      boss.hp = Math.max(1, Math.round(boss.maxHp * 0.06));
      if (!bm.devourChannel) {
        this._tryStartMotherSumpDevour(boss, spawner, particles);
      }
      if (particles) {
        particles.spawnFloatingText(
          boss.x,
          boss.y - 36,
          `DENY HER FEED TO STARVE HER! (${bm.deniedFeeds}/${bm.requiredDeniedFeeds})`,
          PALETTE.verdigris
        );
      }
      return false;
    }

    // 4. THE LONG DRY: Requires all 3 Shell Segments shattered (D22, D42)
    if (bm.type === 'theLongDry') {
      if (bm.segmentsBroken >= bm.totalSegments) {
        boss.confirmFinalDeath = true;
        return true;
      }
      boss.hp = Math.max(1, Math.round(boss.maxHp * 0.08));
      if (bm.exposedWindowTimer <= 0 && bm.subsurfaceTimer <= 0) {
        bm.exposedWindowTimer = BOSS_MECHANICS_CONFIG.theLongDry.exposureWindowDuration;
        if (particles) {
          particles.spawnFloatingText(
            boss.x,
            boss.y - 38,
            `SHATTER SHELL SEGMENTS (${bm.segmentsBroken}/3) TO EXPOSE CORE!`,
            PALETTE.brass
          );
        }
      }
      return false;
    }

    return true;
  }

  // ============================================================================
  // 1. THE FOREMAN — REASSEMBLY PROTOCOL & DYNAMIC RITUAL ACTOR STORE (D1-D5, D28-D48)
  // ============================================================================
  _startForemanRitual(boss, player, spawner, particles, camera) {
    const cfg = BOSS_MECHANICS_CONFIG.theForeman;
    const bm = boss.bm;
    bm.ritualTriggered = true;
    bm.ritualActive = true;
    bm.arrivals = 0;

    boss.hp = 1;
    boss.telegraphActive = false;
    boss.telegraphShape = null;
    boss.actionActiveTimer = 0;

    // 4.1: Retract all Foreman barricades so the full 360° ritual spawn ring and marching lanes are 100% clear
    obstacleManager.clearByOwner(boss.id);
    obstacleManager.clearDynamicNear(boss.x, boss.y, cfg.noFusionFieldRadius + 40);

    this.foremanRitual = {
      active: true,
      boss,
      centerX: Math.round(boss.x),
      centerY: Math.round(boss.y),
      spawnRingRadius: cfg.spawnRingRadius,
      noFusionRadius: cfg.noFusionFieldRadius,
      elapsed: 0,
      duration: cfg.ritualDuration, // 30.0s
      wavesSpawned: 0,
      totalWaves: cfg.totalWaves, // 15 waves at t=0,2,...,28 -> 150 spawns
      arrivals: 0,
    };

    // Call existing active Slab Town common mobs in the normal pool to march as well
    if (spawner) {
      for (let i = 0; i < spawner.pool.length; i++) {
        const e = spawner.pool[i];
        if (e.active && e.hp > 0 && e.tier === 'common' && Math.hypot(e.x - boss.x, e.y - boss.y) <= 750) {
          e.isRitualMarcher = true;
          e.ritualTargetX = boss.x;
          e.ritualTargetY = boss.y;
          e.morale = 100;
        }
      }
    }

    sound.playBossAlert?.();
    if (camera) camera.shake(8, 0.35);
    if (particles) {
      particles.spawnShockwave(boss.x, boss.y, cfg.noFusionFieldRadius, PALETTE.signal, 0.45);
      particles.spawnFloatingText(
        boss.x,
        boss.y - 44,
        'REASSEMBLY PROTOCOL (30s)! KEEP ARRIVALS UNDER 10!',
        PALETTE.signal
      );
    }

    // Spawn Wave 0 immediately at t = 0.0s (D28, D45, D47)
    this._spawnGuaranteedForemanWave(0, particles);
    this.foremanRitual.wavesSpawned = 1;
  }

  /**
   * D28 / D45 / D46 / D47: Atomically spawns 10 physical ritual-origin mobs evenly around the 360° ring
   * into this.ritualActors, completely exempt from the 64-slot pool and 40-active ordinary cap.
   */
  _spawnGuaranteedForemanWave(waveIndex, particles) {
    if (!this.foremanRitual || !this.enemyClassRef) return;
    const cfg = BOSS_MECHANICS_CONFIG.theForeman;
    const cx = this.foremanRitual.centerX;
    const cy = this.foremanRitual.centerY;
    const ringR = cfg.spawnRingRadius;

    const marcherSpecies = ['tinRat', 'rivetTick', 'dustDog'];
    const angleOffset = (waveIndex % 2) * (Math.PI / cfg.mobsPerWave);

    for (let i = 0; i < cfg.mobsPerWave; i++) {
      const angle = (i / cfg.mobsPerWave) * Math.PI * 2 + angleOffset;
      const rawX = cx + Math.cos(angle) * ringR;
      const rawY = cy + Math.sin(angle) * ringR;
      const safePos = obstacleManager.findSafePosition(rawX, rawY, cfg.marcherRadius);

      const speciesId = marcherSpecies[(waveIndex + i) % marcherSpecies.length];
      const baseCfg = ENEMIES_CONFIG.commons[speciesId] || ENEMIES_CONFIG.commons.tinRat;

      const actor = new this.enemyClassRef();
      actor.initFromConfig(baseCfg, safePos.x, safePos.y, 1.0);
      actor.uid = this.nextRitualUid++;
      actor.hp = cfg.marcherHp;
      actor.maxHp = cfg.marcherHp;
      actor.speed = cfg.marcherSpeed; // 250px / 50px/s = 5.0s travel time (D30)
      actor.radius = cfg.marcherRadius;
      actor.isRitualOrigin = true; // D45: Permanent exemption from normal 64/40 caps
      actor.isRitualMarcher = true; // Active marching state until t=30s
      actor.ritualTargetX = cx;
      actor.ritualTargetY = cy;
      actor.morale = 100; // D29: Immune to morale

      this.ritualActors.push(actor);
    }

    if (particles) {
      particles.spawnShockwave(cx, cy, ringR, PALETTE.rustLight, 0.2);
    }
  }

  _updateForemanRitual(dt, player, spawner, projectiles, particles, camera, worldLedger) {
    const rit = this.foremanRitual;
    if (!rit || !rit.active) return;
    const cfg = BOSS_MECHANICS_CONFIG.theForeman;
    const boss = rit.boss;

    rit.elapsed += dt;
    // Keep boss anchored and invulnerable during the 30s ritual
    boss.hp = 1;

    // 1. Guaranteed scheduled waves at t = 0, 2, 4, ..., 28s (15 waves = 150 physical spawns, D28/D45/D47)
    while (
      rit.wavesSpawned < cfg.totalWaves &&
      rit.elapsed >= rit.wavesSpawned * cfg.waveInterval &&
      rit.elapsed < cfg.ritualDuration
    ) {
      this._spawnGuaranteedForemanWave(rit.wavesSpawned, particles);
      rit.wavesSpawned++;
    }

    // 2. Check arrivals from both ritual-origin actors and any called Slab Town normal-pool marchers
    const allCandidates = spawner.getAllActiveEnemies ? spawner.getAllActiveEnemies() : this.ritualActors;
    const arrivalDist = boss.radius + 14;

    for (let i = 0; i < allCandidates.length; i++) {
      const m = allCandidates[i];
      if (!m || !m.active || m.hp <= 0 || !m.isRitualMarcher || m === boss) continue;

      const d = Math.hypot(m.x - rit.centerX, m.y - rit.centerY);
      if (d <= arrivalDist) {
        // Consume marcher on arrival without kill rewards (D38) and increment counter once
        m.isRitualMarcher = false;
        m.active = false;
        m.dead = true;
        rit.arrivals++;
        boss.bm.arrivals = rit.arrivals;

        sound.playReloadTick?.();
        if (particles) {
          particles.spawnBurst(rit.centerX, rit.centerY, 5, PALETTE.brass, 20, 70, 2, 0.2);
          particles.spawnFloatingText(
            rit.centerX,
            rit.centerY - 30,
            `ARRIVAL ${rit.arrivals}/10`,
            rit.arrivals >= 10 ? PALETTE.blood : PALETTE.brass
          );
        }
      }
    }

    // 3. End-of-Ritual Resolution at exactly t = 30.0s (D33, D36, D48)
    if (rit.elapsed >= cfg.ritualDuration) {
      rit.active = false;
      boss.bm.ritualActive = false;

      // D33 / D48: All surviving ritual marchers revert to normal-behaving mobs and remain in the world
      for (let i = 0; i < allCandidates.length; i++) {
        const m = allCandidates[i];
        if (m && m.active && m.hp > 0 && m.isRitualMarcher) {
          m.isRitualMarcher = false;
          m.aiRoleState = 'CHASE';
        }
      }

      const totalArrivals = rit.arrivals;
      if (totalArrivals < cfg.minArrivalsToRevive) {
        // 0-9 arrivals: Reassembly fails -> Permanent Boss Defeat! (D1, D36)
        boss.confirmFinalDeath = true;
        boss.hp = 0;
        if (camera) camera.shake(9, 0.4);
        if (particles) {
          particles.spawnGroundBreakEffect(boss.x, boss.y, 130);
          particles.spawnFloatingText(
            boss.x,
            boss.y - 46,
            `REASSEMBLY DENIED (${totalArrivals}/10)! FOREMAN DESTROYED!`,
            PALETTE.signal
          );
        }
        boss._onDeath(player, spawner, particles, camera, {
          revived: false,
          arrivals: totalArrivals,
        });
      } else {
        // 10+ arrivals: Revives once as THE IRON FOREMAN (D1, D2, D18)
        const reviveHpPct = Math.min(
          1.0,
          Math.max(0.10, 0.10 + 0.045 * (totalArrivals - 10))
        );
        const rageMultiplier = +(1 + 0.5 * (1 - reviveHpPct)).toFixed(3);

        boss.bm.isIronForeman = true;
        boss.bm.rageMultiplier = rageMultiplier;
        boss.name = 'The Iron Foreman';
        boss.subtitle = `Reassembled Rig · ${Math.round(reviveHpPct * 100)}% HP · ×${rageMultiplier.toFixed(2)} Rage`;
        boss.hp = Math.max(1, Math.round(boss.maxHp * reviveHpPct));
        boss.damage = Math.round(boss.bm.baseDamage * rageMultiplier);
        // Bounded defensive bonus per consolidated spec so low-HP revival is fierce but not spongy
        boss.def = Math.round(boss.bm.baseDef * Math.min(1.3, rageMultiplier));
        boss.phase = 3;
        boss.brassRimTimer = 3.0;

        sound.playBossAlert?.();
        if (camera) camera.shake(9, 0.4);
        if (particles) {
          particles.spawnGroundBreakEffect(boss.x, boss.y, 135);
          particles.spawnFloatingText(
            boss.x,
            boss.y - 46,
            `THE IRON FOREMAN REVIVES! (${Math.round(reviveHpPct * 100)}% HP · ×${rageMultiplier.toFixed(2)} RAGE)`,
            PALETTE.blood
          );
        }
      }
    }
  }

  // ============================================================================
  // 2. MOTHER SUMP — DEVOUR CHANNEL & STARVATION HELPERS (Section 7.3, D3, D10, D21, D41)
  // ============================================================================
  _tryStartMotherSumpDevour(boss, spawner, particles) {
    const bm = boss.bm;
    if (!bm || bm.isStarved || bm.devourChannel) return false;
    if (bm.totalHealed >= bm.maxTotalHeal) {
      this._triggerMotherSumpStarved(boss, particles);
      return false;
    }

    // Find eligible prey within 260px: fused Brine Maw (D10) or Lye Leech / Sump Bat
    const nearby = spawner.queryRadius(boss.x, boss.y, 260);
    let bestPrey = null;
    for (let i = 0; i < nearby.length; i++) {
      const e = nearby[i];
      if (!e.active || e.hp <= 0 || e === boss || e.tier === 'boss') continue;
      if (e.id === 'brineMaw') {
        bestPrey = e;
        break; // Prioritize fused Brine Maw per D10
      }
      if (e.id === 'lyeLeech' || e.id === 'sumpBat' || e.tier === 'common') {
        bestPrey = e;
      }
    }

    if (!bestPrey) return false;

    const cfg = BOSS_MECHANICS_CONFIG.motherSump;
    bestPrey.statuses?.apply('pinned', { duration: cfg.devourChannelDuration, sourceName: 'Devour Grasp' }, bestPrey, particles);

    // 4.3: Keep a navigable route to feeding prey so players can interrupt Devour
    obstacleManager.clearDynamicNear(bestPrey.x, bestPrey.y, 72);

    bm.devourChannel = {
      active: true,
      target: bestPrey,
      isBrineMaw: bestPrey.id === 'brineMaw',
      elapsed: 0,
      duration: cfg.devourChannelDuration,
      staggerDamage: 0,
      staggerThreshold: Math.max(25, Math.round(boss.maxHp * cfg.staggerInterruptHpRatio)),
    };

    sound.playBossAlert?.();
    if (particles) {
      particles.spawnFloatingText(
        boss.x,
        boss.y - 38,
        bestPrey.id === 'brineMaw'
          ? 'DEVOURING BRINE MAW! INTERRUPT OR SLAY PREY!'
          : 'MOTHER SUMP DEVOURING! DEAL DAMAGE OR KILL PREY!',
        PALETTE.lye
      );
    }
    return true;
  }

  _interruptMotherSumpDevour(boss, reason, particles, camera) {
    const bm = boss.bm;
    if (!bm || !bm.devourChannel) return;
    bm.devourChannel = null;
    bm.deniedFeeds++;
    bm.devourCooldown = 5.5;
    bm.noPreyHungerTimer = 0;

    if (camera) camera.shake(6, 0.2);
    sound.playShieldBlock?.();

    if (bm.deniedFeeds >= bm.requiredDeniedFeeds) {
      this._triggerMotherSumpStarved(boss, particles);
    } else if (particles) {
      particles.spawnFloatingText(
        boss.x,
        boss.y - 38,
        `FEED DENIED (${bm.deniedFeeds}/${bm.requiredDeniedFeeds})! [${reason}]`,
        PALETTE.signal
      );
    }
  }

  _triggerMotherSumpStarved(boss, particles) {
    const bm = boss.bm;
    if (!bm || bm.isStarved) return;
    bm.isStarved = true;
    bm.devourChannel = null;
    bm.starvedTimer = BOSS_MECHANICS_CONFIG.motherSump.starvedDuration;
    boss.def = Math.max(4, Math.round(boss.def * 0.45));

    sound.playSkillGroundBreak?.();
    if (particles) {
      particles.spawnShockwave(boss.x, boss.y, 96, PALETTE.verdigris, 0.35);
      particles.spawnFloatingText(
        boss.x,
        boss.y - 44,
        'MOTHER SUMP IS STARVED! CARAPACE BROKEN — FINISH HER!',
        PALETTE.verdigris
      );
    }
  }

  // ============================================================================
  // MAIN PER-TICK UPDATE FOR ALL BOSS MECHANICS & RITUAL ACTORS
  // ============================================================================
  update(dt, player, spawner, projectiles, particles, camera, world, worldLedger) {
    // 1. Update active Foreman Reassembly Protocol if running
    if (this.foremanRitual && this.foremanRitual.active) {
      this._updateForemanRitual(dt, player, spawner, projectiles, particles, camera, worldLedger);
    }

    // 2. Update all dynamically allocated ritual-origin actors (D45, D46, D48)
    for (let i = this.ritualActors.length - 1; i >= 0; i--) {
      const ra = this.ritualActors[i];
      if (!ra.active || ra.hp <= 0) {
        this.ritualActors.splice(i, 1);
        continue;
      }
      // Natural distance despawn only after ritual ends (never during active 30s ritual)
      if (!ra.isRitualMarcher && Math.hypot(ra.x - player.x, ra.y - player.y) > 1200) {
        this.ritualActors.splice(i, 1);
        continue;
      }
      ra.update(dt, player, spawner, projectiles, particles, camera, world);
    }

    // 3. Update active Main Boss specific controllers
    const boss = spawner ? spawner.activeBoss : null;
    if (!boss || !boss.active || !boss.bm) return;
    const bm = boss.bm;

    // Capture encounter-entry snapshot when player is within arena combat range (D43)
    if (
      worldLedger &&
      Math.hypot(player.x - boss.x, player.y - boss.y) <= (boss.arenaRadius || 380) + 60
    ) {
      worldLedger.captureBossEntrySnapshot(boss.id, player, !!boss.isRematch);
    }

    if (bm.type === 'foreman' && !bm.ritualActive) {
      bm.barricadeCooldown -= dt;
      if (bm.barricadeCooldown <= 0 && Math.hypot(player.x - boss.x, player.y - boss.y) < 340) {
        bm.barricadeCooldown = 8.0;
        // 4.1: Deploy temporary scrap barricade to redirect player movement and shelter nearby mobs
        const ang =
          Math.atan2(player.y - boss.y, player.x - boss.x) +
          (Math.random() < 0.5 ? 0.65 : -0.65);
        const bx = boss.x + Math.cos(ang) * 115;
        const by = boss.y + Math.sin(ang) * 115;
        obstacleManager.spawnBossObstacle({
          kind: 'foreman_scrap_wall',
          x: bx,
          y: by,
          duration: 8.5,
          ownerBossId: boss.id,
          player,
          ritualCenter: { x: boss.x, y: boss.y },
          ritualClearRadius: 68,
        });
      }
    } else if (bm.type === 'bigAxle') {
      this._updateBigAxle(dt, boss, bm, player, particles, camera);
    } else if (bm.type === 'motherSump') {
      this._updateMotherSump(dt, boss, bm, player, spawner, particles, camera);
    } else if (bm.type === 'theLongDry') {
      this._updateLongDry(dt, boss, bm, player, particles, camera);
    }
  }

  _updateBigAxle(dt, boss, bm, player, particles, camera) {
    const cfg = BOSS_MECHANICS_CONFIG.bigAxle;

    if (bm.disabledRestartTimer > 0) {
      bm.disabledRestartTimer -= dt;
      boss.actionActiveTimer = 0;
      if (bm.disabledRestartTimer <= 0) {
        boss.hp = Math.round(boss.maxHp * cfg.failedGateRestartHpPct);
        bm.heat = 75; // One dodged charge immediately re-exposes the core (D40)
        if (particles) {
          particles.spawnFloatingText(
            boss.x,
            boss.y - 36,
            'ENGINE RESTARTED (18% HP)! BAIT 1 CHARGE TO OVERHEAT!',
            PALETTE.brass
          );
        }
      }
      return;
    }

    if (bm.coreExposedTimer > 0) {
      bm.coreExposedTimer -= dt;
      boss.actionActiveTimer = 0;
      boss.telegraphActive = false;
      if (bm.coreExposedTimer <= 0 && !bm.coreBroken) {
        bm.heat = 35;
        if (boss.hp <= 1) {
          // D40: Missed core window at 0 HP -> enter short disabled window then restart at low HP
          bm.disabledRestartTimer = cfg.disabledBeforeRestartDuration;
          if (particles) {
            particles.spawnFloatingText(
              boss.x,
              boss.y - 36,
              'CORE COOLED! ENGINE REBOOTING...',
              PALETTE.rustLight
            );
          }
        }
      }
      return;
    }

    // 4.2: Deploy temporary lane machinery & superheated exhaust zones while preserving clear charge runways
    bm.laneObstacleCooldown = (bm.laneObstacleCooldown ?? 6.5) - dt;
    if (
      bm.laneObstacleCooldown <= 0 &&
      boss.actionActiveTimer <= 0 &&
      Math.hypot(player.x - boss.x, player.y - boss.y) < 350
    ) {
      bm.laneObstacleCooldown = 7.5;
      const toPlayerAng = Math.atan2(player.y - boss.y, player.x - boss.x);
      const flankAng = toPlayerAng + (Math.random() < 0.5 ? 1.15 : -1.15);
      const isExhaust = Math.random() < 0.45;
      obstacleManager.spawnBossObstacle({
        kind: isExhaust ? 'axle_exhaust_zone' : 'axle_lane_machinery',
        x: boss.x + Math.cos(flankAng) * 125,
        y: boss.y + Math.sin(flankAng) * 125,
        ownerBossId: boss.id,
        player,
      });
    }

    // 4.2: Obstacle collisions during a committed charge contribute bonus Engine Heat (+18)!
    if (boss.actionActiveTimer > 0) {
      if (!bm._wasCharging) {
        bm._wasCharging = true;
        bm.obstacleCrashHeatGranted = false;
      }
      if (boss.lastCollidedObstacle && !bm.obstacleCrashHeatGranted) {
        bm.obstacleCrashHeatGranted = true;
        bm.heat = Math.min(cfg.maxHeat, bm.heat + 18);
        if (camera) camera.shake(5, 0.18);
        sound.playShieldBlock?.();
        if (particles) {
          particles.spawnSparks(boss.x, boss.y, 7, PALETTE.brass);
          particles.spawnFloatingText(
            boss.x,
            boss.y - 34,
            `OBSTACLE RAM! +18 HEAT (${bm.heat}%)`,
            PALETTE.brass
          );
        }
      }
    } else if (bm._wasCharging) {
      bm._wasCharging = false;
      const heatGain = boss.hp < boss.maxHp * 0.35 ? cfg.heatPerOverdriveCharge : cfg.heatPerMissedCharge;
      bm.heat = Math.min(cfg.maxHeat, bm.heat + heatGain);
      if (particles) {
        particles.spawnFloatingText(
          boss.x,
          boss.y - 30,
          `ENGINE HEAT ${bm.heat}%`,
          bm.heat >= 100 ? PALETTE.blood : PALETTE.brass
        );
      }
      if (bm.heat >= cfg.maxHeat && !bm.coreBroken) {
        bm.coreExposedTimer = cfg.coreExposedDuration;
        // 4.2: Guarantee Engine Core exposure remains physically reachable
        obstacleManager.clearDynamicNear(boss.x, boss.y, 85);
        sound.playSkillGroundBreak?.();
        if (camera) camera.shake(6, 0.22);
        if (particles) {
          particles.spawnShockwave(boss.x, boss.y, 84, PALETTE.brass, 0.3);
          particles.spawnFloatingText(
            boss.x,
            boss.y - 42,
            '100% HEAT OVERLOAD! ENGINE CORE EXPOSED!',
            PALETTE.signal
          );
        }
      }
    }
  }

  _updateMotherSump(dt, boss, bm, player, spawner, particles, camera) {
    const cfg = BOSS_MECHANICS_CONFIG.motherSump;

    // 4.3: Deploy temporary sludge pools (slow) & raised sludge barriers while keeping Devour prey reachable
    bm.contaminationCooldown = (bm.contaminationCooldown ?? 6.5) - dt;
    if (
      bm.contaminationCooldown <= 0 &&
      Math.hypot(player.x - boss.x, player.y - boss.y) < 350
    ) {
      bm.contaminationCooldown = 7.5;
      const ang =
        Math.atan2(player.y - boss.y, player.x - boss.x) +
        (Math.random() < 0.5 ? 0.95 : -0.95);
      const isPool = Math.random() < 0.55;
      obstacleManager.spawnBossObstacle({
        kind: isPool ? 'sump_sludge_pool' : 'sump_sludge_barrier',
        x: boss.x + Math.cos(ang) * 120,
        y: boss.y + Math.sin(ang) * 120,
        ownerBossId: boss.id,
        player,
        protectedTarget: bm.devourChannel?.target || null,
      });
    }

    if (bm.devourChannel && bm.devourChannel.active) {
      const ch = bm.devourChannel;
      ch.elapsed += dt;

      // Check if prey was killed or displaced > 150px from Mother Sump
      if (
        !ch.target ||
        !ch.target.active ||
        ch.target.hp <= 0 ||
        Math.hypot(ch.target.x - boss.x, ch.target.y - boss.y) > 165
      ) {
        this._interruptMotherSumpDevour(boss, 'PREY REMOVED', particles, camera);
        return;
      }

      // Pull prey toward Mother Sump during channel
      const dx = boss.x - ch.target.x;
      const dy = boss.y - ch.target.y;
      const d = Math.hypot(dx, dy) || 1;
      ch.target.x += (dx / d) * 45 * dt;
      ch.target.y += (dy / d) * 45 * dt;

      if (ch.elapsed >= ch.duration) {
        // Successful feed (bounded by encounter heal cap, D10/D41)
        ch.target.active = false;
        ch.target.dead = true;
        bm.devourChannel = null;
        bm.feedsAllowed++;
        bm.devourCooldown = 7.0;

        const rawHeal = Math.round(
          boss.maxHp * (ch.isBrineMaw ? cfg.brineMawHealRatio : cfg.leechHealRatio)
        );
        const allowedHeal = Math.max(0, Math.min(rawHeal, bm.maxTotalHeal - bm.totalHealed));
        bm.totalHealed += allowedHeal;
        boss.hp = Math.min(boss.maxHp, boss.hp + allowedHeal);

        if (particles) {
          particles.spawnFloatingText(
            boss.x,
            boss.y - 36,
            allowedHeal > 0 ? `DEVOURED PREY! +${allowedHeal} HP` : 'FEED CAP REACHED!',
            PALETTE.blood
          );
        }
        if (bm.totalHealed >= bm.maxTotalHeal) {
          this._triggerMotherSumpStarved(boss, particles);
        }
      }
      return;
    }

    if (!bm.isStarved && boss.hp <= boss.maxHp * cfg.hungerThresholdPct) {
      bm.devourCooldown -= dt;
      if (bm.devourCooldown <= 0) {
        const started = this._tryStartMotherSumpDevour(boss, spawner, particles);
        if (!started) {
          // D41: Bounded hunger timeout when no prey is available so fight never stalls
          bm.noPreyHungerTimer += dt;
          if (bm.noPreyHungerTimer >= cfg.noPreyHungerTimeout) {
            this._triggerMotherSumpStarved(boss, particles);
          }
        } else {
          bm.noPreyHungerTimer = 0;
        }
      }
    }
  }

  _updateLongDry(dt, boss, bm, player, particles, camera) {
    const cfg = BOSS_MECHANICS_CONFIG.theLongDry;

    if (bm.exposedWindowTimer > 0) {
      bm.exposedWindowTimer = Math.max(0, bm.exposedWindowTimer - dt);
    }

    // 4.4: Spawn temporary sand ridges & dust clouds while preserving readable emergence cues & exposed segment access
    bm.terrainCooldown = (bm.terrainCooldown ?? 7.0) - dt;
    if (
      bm.terrainCooldown <= 0 &&
      bm.exposedWindowTimer <= 0 &&
      Math.hypot(player.x - boss.x, player.y - boss.y) < 360
    ) {
      bm.terrainCooldown = 7.5;
      const ang =
        Math.atan2(player.y - boss.y, player.x - boss.x) +
        (Math.random() < 0.5 ? 1.05 : -1.05);
      const isDust = Math.random() < 0.5;
      obstacleManager.spawnBossObstacle({
        kind: isDust ? 'dry_dust_cloud' : 'dry_sand_ridge',
        x: player.x + Math.cos(ang) * 95,
        y: player.y + Math.sin(ang) * 95,
        ownerBossId: boss.id,
        player,
        protectedTarget: { x: bm.realEmergenceX, y: bm.realEmergenceY },
      });
    }

    if (bm.subsurfaceTimer > 0) {
      bm.subsurfaceTimer -= dt;
      if (bm.subsurfaceTimer <= 0) {
        // Emerge at real tremor coordinates and open Shell Exposure Window (D22, D42)
        const safeEmerge = obstacleManager.findSafePosition(
          bm.realEmergenceX,
          bm.realEmergenceY,
          boss.radius
        );
        boss.x = safeEmerge.x;
        boss.y = safeEmerge.y;
        bm.decoyTremors = [];
        bm.exposedWindowTimer = cfg.exposureWindowDuration;
        // 4.4: Ensure exposed armor segments and core are targetable by all classes
        obstacleManager.clearDynamicNear(boss.x, boss.y, 85);

        sound.playSkillGroundBreak?.();
        if (camera) camera.shake(6, 0.22);
        if (particles) {
          particles.spawnGroundBreakEffect(boss.x, boss.y, 95);
          if (bm.segmentsBroken < bm.totalSegments) {
            particles.spawnFloatingText(
              boss.x,
              boss.y - 38,
              `SHELL EXPOSED (${cfg.exposureWindowDuration.toFixed(0)}s)! STRIKE NOW!`,
              PALETTE.signal
            );
          }
        }
      }
      return;
    }

    if (bm.segmentsBroken < bm.totalSegments) {
      bm.burrowCooldown -= dt;
      if (bm.burrowCooldown <= 0 && bm.exposedWindowTimer <= 0) {
        bm.burrowCooldown = 7.5;
        bm.subsurfaceTimer = cfg.subsurfaceDuration;

        // Partly damaged (unbroken) segment repairs slightly on burrow; destroyed segments stay broken (D42)
        const curIdx = bm.segmentsBroken;
        if (bm.segments[curIdx] > 0 && bm.segments[curIdx] < bm.segMaxHp) {
          bm.segments[curIdx] = Math.min(
            bm.segMaxHp,
            Math.round(bm.segments[curIdx] + bm.segMaxHp * cfg.partialRegrowthRatio)
          );
        }

        // Choose 1 real emergence point and 2 readable decoy tremor points
        const ang = Math.atan2(player.y - boss.y, player.x - boss.x);
        const realPos = obstacleManager.findSafePosition(
          player.x + Math.cos(ang) * 48,
          player.y + Math.sin(ang) * 48,
          boss.radius
        );
        bm.realEmergenceX = realPos.x;
        bm.realEmergenceY = realPos.y;
        bm.decoyTremors = [
          {
            x: Math.round(player.x + Math.cos(ang + 1.8) * 115),
            y: Math.round(player.y + Math.sin(ang + 1.8) * 115),
            isReal: false,
          },
          {
            x: Math.round(player.x + Math.cos(ang - 1.8) * 115),
            y: Math.round(player.y + Math.sin(ang - 1.8) * 115),
            isReal: false,
          },
          {
            x: bm.realEmergenceX,
            y: bm.realEmergenceY,
            isReal: true,
          },
        ];
      }
    }
  }

  /**
   * Builds the HUD objective snapshot for the currently active boss.
   */
  getHudBossMechanicState(boss) {
    if (!boss || !boss.bm) return null;
    const bm = boss.bm;

    if (bm.type === 'foreman') {
      if (this.foremanRitual && this.foremanRitual.active) {
        const rit = this.foremanRitual;
        const arr = rit.arrivals;
        const willRevive = arr >= 10;
        const predictedHpPct = willRevive
          ? Math.min(100, Math.round((0.10 + 0.045 * (arr - 10)) * 100))
          : 0;
        const predictedRage = willRevive
          ? +(1 + 0.5 * (1 - predictedHpPct / 100)).toFixed(2)
          : 1.0;

        return {
          type: 'foremanRitual',
          label: 'REASSEMBLY PROTOCOL · NO-FUSION ZONE ACTIVE',
          remainingSec: Math.max(0, +(rit.duration - rit.elapsed).toFixed(1)),
          arrivals: arr,
          threshold: 10,
          wavesSpawned: rit.wavesSpawned,
          totalWaves: rit.totalWaves,
          willRevive,
          predictedHpPct,
          predictedRage,
        };
      }
      return {
        type: 'foreman',
        label: bm.isIronForeman
          ? `THE IRON FOREMAN · RAGE ×${bm.rageMultiplier.toFixed(2)}`
          : 'REASSEMBLY READY AT 0 HP (KEEP MARCHERS < 10)',
      };
    }

    if (bm.type === 'bigAxle') {
      return {
        type: 'bigAxle',
        heat: bm.heat,
        maxHeat: bm.maxHeat,
        coreExposed: bm.coreExposedTimer > 0 && !bm.coreBroken,
        coreExposedSec: +bm.coreExposedTimer.toFixed(1),
        coreBroken: bm.coreBroken,
        coreHpPct: Math.max(0, Math.round((bm.coreHp / bm.coreMaxHp) * 100)),
        label: bm.coreBroken
          ? 'ENGINE CORE SHATTERED · FINISH BIG AXLE!'
          : bm.coreExposedTimer > 0
          ? `CORE EXPOSED (${bm.coreExposedTimer.toFixed(1)}s) — STRIKE NOW!`
          : `BAIT CHARGES TO OVERHEAT (${bm.heat}/100 HEAT)`,
      };
    }

    if (bm.type === 'motherSump') {
      const ch = bm.devourChannel;
      return {
        type: 'motherSump',
        deniedFeeds: bm.deniedFeeds,
        requiredDeniedFeeds: bm.requiredDeniedFeeds,
        isStarved: bm.isStarved,
        devourActive: !!(ch && ch.active),
        devourStaggerPct: ch
          ? Math.min(100, Math.round((ch.staggerDamage / ch.staggerThreshold) * 100))
          : 0,
        label: bm.isStarved
          ? 'STARVED & EXPOSED — FINISH MOTHER SUMP!'
          : ch && ch.active
          ? 'DEVOURING PREY! ATTACK OR KILL PREY TO INTERRUPT!'
          : `STARVATION GATE: ${bm.deniedFeeds}/${bm.requiredDeniedFeeds} FEEDS DENIED`,
      };
    }

    if (bm.type === 'theLongDry') {
      return {
        type: 'theLongDry',
        segmentsBroken: bm.segmentsBroken,
        totalSegments: bm.totalSegments,
        exposed: bm.exposedWindowTimer > 0 && bm.segmentsBroken < bm.totalSegments,
        exposedSec: +bm.exposedWindowTimer.toFixed(1),
        label:
          bm.segmentsBroken >= bm.totalSegments
            ? 'ALL 3 SHELL PLATES SHATTERED — INNER CORE EXPOSED!'
            : bm.exposedWindowTimer > 0
            ? `SHELL EXPOSED (${bm.exposedWindowTimer.toFixed(1)}s) — ANY ATTACK DAMAGES PLATE!`
            : `SHELL PLATES BROKEN: ${bm.segmentsBroken}/${bm.totalSegments} (BAIT EMERGENCE)`,
      };
    }

    return null;
  }

  /**
   * Draws world-space boss mechanic visuals:
   * - Foreman 310px No-Fusion Suppression Field AOE & spawn ring (D34)
   * - Mother Sump Devour tether & stagger bar
   * - The Long Dry real vs decoy emergence ground tells
   * - Big Axle exposed core gleam
   */
  drawWorldOverlays(ctx, camera, spawner) {
    const camX = camera.renderX;
    const camY = camera.renderY;

    // 1. Draw Foreman Ritual No-Fusion Suppression Field AOE (D34)
    if (this.foremanRitual && this.foremanRitual.active) {
      const rit = this.foremanRitual;
      const sx = Math.round(rit.centerX - camX);
      const sy = Math.round(rit.centerY - camY);

      // Outer 310px No-Fusion boundary ring
      drawBresenhamCircle(ctx, sx, sy, rit.noFusionRadius, PALETTE.signal, 1.0);
      // 250px 10-unit spawn ring
      drawBresenhamCircle(ctx, sx, sy, rit.spawnRingRadius, PALETTE.rustLight, 0.5);
      // Inner arrival threshold ring around Foreman's body
      drawBresenhamCircle(ctx, sx, sy, 46, PALETTE.blood, 1.0);
    }

    // 2. Draw active Boss world cues
    const boss = spawner ? spawner.activeBoss : null;
    if (!boss || !boss.active || !boss.bm) return;
    const bm = boss.bm;
    const bsx = Math.round(boss.x - camX);
    const bsy = Math.round(boss.y - camY);

    if (bm.type === 'bigAxle' && bm.coreExposedTimer > 0 && !bm.coreBroken) {
      drawBresenhamCircle(ctx, bsx, bsy, 24, PALETTE.brass, 1.0);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(bsx - 4, bsy - 4, 8, 8);
    } else if (bm.type === 'motherSump' && bm.devourChannel && bm.devourChannel.active) {
      const ch = bm.devourChannel;
      if (ch.target && ch.target.active) {
        drawPixelLine(
          ctx,
          bsx,
          bsy,
          Math.round(ch.target.x - camX),
          Math.round(ch.target.y - camY),
          PALETTE.lye,
          2
        );
      }
    } else if (bm.type === 'theLongDry') {
      // Draw real vs decoy emergence tremors (Section 7.4: learnable distinct cues)
      if (bm.subsurfaceTimer > 0 && bm.decoyTremors.length > 0) {
        for (let i = 0; i < bm.decoyTremors.length; i++) {
          const t = bm.decoyTremors[i];
          const tx = Math.round(t.x - camX);
          const ty = Math.round(t.y - camY);
          if (t.isReal) {
            // Real emergence has a double concentric rust/blood ring + center drill spark
            drawBresenhamCircle(ctx, tx, ty, 36, PALETTE.blood, 1.0);
            drawBresenhamCircle(ctx, tx, ty, 18, PALETTE.brass, 1.0);
          } else {
            // Decoy emergence has a single hollow bone-grey dust ring
            drawBresenhamCircle(ctx, tx, ty, 28, PALETTE.boneDark, 0.5);
          }
        }
      } else if (bm.exposedWindowTimer > 0 && bm.segmentsBroken < bm.totalSegments) {
        drawBresenhamCircle(ctx, bsx, bsy, 42, PALETTE.signal, 1.0);
      }
    }
  }
}

export const bossMechanics = new BossMechanicsManager();
