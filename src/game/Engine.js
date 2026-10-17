/**
 * GRAVEL SKY — Core Game Engine (480x270 Offscreen Integer Buffer + Fixed-Timestep Loop)
 * - Renders the entire world to an offscreen canvas at 480x270, then scales by
 *   whole-number factors only (letterboxing the remainder with soot #0B0D10).
 * - Maps mouse coordinates accurately through the letterboxed integer viewport.
 */

import {
  PALETTE,
  WORLD_CONFIG,
  SKILLS_CONFIG,
  SHOP_ITEMS,
  SHOP_SELL_RATIO,
  GRADES,
} from '../data/config.js';
import { Player } from './Player.js';
import { World } from './World.js';
import { Camera } from './Camera.js';
import { Spawner } from './Spawner.js';
import { ProjectilePool } from './Projectile.js';
import { ParticlePool } from './Particles.js';
import { sound } from './Audio.js';
import { assets } from './AssetLoader.js';

const SAVE_KEY = 'gravel_sky_save_v1';
export const INTERNAL_WIDTH = 480;
export const INTERNAL_HEIGHT = 270;

export class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.renderQueue = [];

    // 480x270 offscreen pixel buffer
    this.offscreen =
      typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this.offCtx = null;
    if (this.offscreen) {
      this.offscreen.width = INTERNAL_WIDTH;
      this.offscreen.height = INTERNAL_HEIGHT;
      this.offCtx = this.offscreen.getContext('2d', {
        alpha: false,
        willReadFrequently: true,
      });
      this.offCtx.imageSmoothingEnabled = false;
    }

    // Whole-number scale & letterbox offsets
    this.scaleFactor = 2;
    this.letterboxX = 0;
    this.letterboxY = 0;

    this.running = false;
    this.rafId = null;

    this.uiState = 'title';
    this.scanlinesEnabled = true;
    this.lastGoldLost = 0;

    // Core simulation objects (Camera operates in 480x270 internal resolution)
    this.world = new World();
    this.camera = new Camera(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    this.player = new Player();
    this.spawner = new Spawner();
    this.projectiles = new ProjectilePool(64);
    this.particles = new ParticlePool(180, 40, 32);

    this.fixedStep = 1 / 60;
    this.accumulator = 0;
    this.lastFrameTime = 0;
    this.hitStopTimer = 0;

    this.input = {
      keys: {},
      mouseX: 240,
      mouseY: 135,
      worldMouseX: WORLD_CONFIG.kettleCenter.x + 80,
      worldMouseY: WORLD_CONFIG.kettleCenter.y,
      mouseDown: false,
    };

    this.uiListeners = new Set();
    this.autoSaveTimer = 0;

    this._bindWindowEvents();
    this.loadProgress();
    if (typeof window !== 'undefined') {
      assets.preloadAll();
    }
  }

  subscribeUi(listener) {
    this.uiListeners.add(listener);
    return () => this.uiListeners.delete(listener);
  }

  notifyUi() {
    for (const fn of this.uiListeners) {
      fn(this.uiState);
    }
  }

  setUiState(nextState) {
    if (this.uiState === nextState) return;
    this.uiState = nextState;
    this.input.keys = {};
    this.input.mouseDown = false;
    sound.playUiClick();
    this.notifyUi();
  }

  attachCanvas(canvas) {
    this.canvas = canvas;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.handleResize();

    if (!this.running) {
      this.running = true;
      this.lastFrameTime = performance.now();
      this.rafId = requestAnimationFrame((t) => this._loop(t));
    }
  }

  detachCanvas() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  handleResize() {
    if (!this.canvas) return;
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }

    // Whole-number integer scale factor only (letterbox the remainder)
    const scaleX = Math.floor(w / INTERNAL_WIDTH);
    const scaleY = Math.floor(h / INTERNAL_HEIGHT);
    this.scaleFactor = Math.max(1, Math.min(scaleX, scaleY));

    const scaledW = INTERNAL_WIDTH * this.scaleFactor;
    const scaledH = INTERNAL_HEIGHT * this.scaleFactor;
    this.letterboxX = Math.floor((w - scaledW) / 2);
    this.letterboxY = Math.floor((h - scaledH) / 2);

    this.camera.resize(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    this.camera.snapTo(this.player.x, this.player.y);
  }

  _clientToInternal(clientX, clientY) {
    const ix = Math.floor((clientX - this.letterboxX) / this.scaleFactor);
    const iy = Math.floor((clientY - this.letterboxY) / this.scaleFactor);
    return {
      x: Math.max(0, Math.min(INTERNAL_WIDTH - 1, ix)),
      y: Math.max(0, Math.min(INTERNAL_HEIGHT - 1, iy)),
    };
  }

  startHitStop(duration = 0.05) {
    this.hitStopTimer = Math.max(this.hitStopTimer, duration);
  }

  startGameFromTitle() {
    sound.init();
    sound.playLevelUp();
    this.camera.snapTo(this.player.x, this.player.y);
    this.setUiState('playing');
  }

  respawnAfterDeath() {
    this.lastGoldLost = this.player.respawnAtKettle();
    this.spawner.clearNonBossEnemies();
    this.camera.snapTo(this.player.x, this.player.y);
    this.saveProgress();
    this.setUiState('playing');
  }

  // --- SHOP, INVENTORY, & SKILL UPGRADE ACTIONS ---

  upgradeSkill(skillId) {
    const cfg = SKILLS_CONFIG[skillId];
    if (!cfg || this.player.skillPoints <= 0) return false;
    const currentLvl = this.player.skills[skillId] || 1;
    if (currentLvl >= cfg.maxLevel) return false;

    this.player.skillPoints -= 1;
    this.player.skills[skillId] = currentLvl + 1;
    this.player.recalculateStats(false);
    sound.playLevelUp();
    this.saveProgress();
    this.notifyUi();
    return true;
  }

  buyAndEquipItem(itemId) {
    const item = SHOP_ITEMS[itemId];
    if (!item) return { ok: false, reason: 'Invalid item.' };

    const gradeCfg = GRADES[item.grade];
    if (gradeCfg && this.player.level < gradeCfg.unlockLevel) {
      return { ok: false, reason: `Requires Level ${gradeCfg.unlockLevel}.` };
    }

    if (this.player.gold < item.price) {
      return { ok: false, reason: 'Not enough gold.' };
    }

    this.player.gold -= item.price;

    if (item.consumable) {
      this.player.supplies[itemId] = (this.player.supplies[itemId] || 0) + 1;
    } else {
      const prevEquipped = this.player.equipped[item.slot];
      if (
        prevEquipped &&
        prevEquipped !== itemId &&
        !this.player.ownedEquipment.includes(prevEquipped)
      ) {
        this.player.ownedEquipment.push(prevEquipped);
      }
      this.player.ownedEquipment = this.player.ownedEquipment.filter((id) => id !== itemId);
      this.player.equipped[item.slot] = itemId;
      this.player.recalculateStats(false);
    }

    sound.playCoin();
    this.saveProgress();
    this.notifyUi();
    return { ok: true };
  }

  equipFromInventory(itemId) {
    const item = SHOP_ITEMS[itemId];
    if (!item || item.consumable) return false;

    const prevEquipped = this.player.equipped[item.slot];
    this.player.ownedEquipment = this.player.ownedEquipment.filter((id) => id !== itemId);
    if (prevEquipped && prevEquipped !== itemId) {
      this.player.ownedEquipment.push(prevEquipped);
    }
    this.player.equipped[item.slot] = itemId;
    this.player.recalculateStats(false);
    sound.playUiClick();
    this.saveProgress();
    this.notifyUi();
    return true;
  }

  unequipSlot(slot) {
    const current = this.player.equipped[slot];
    if (!current) return false;
    this.player.equipped[slot] = null;
    if (!this.player.ownedEquipment.includes(current)) {
      this.player.ownedEquipment.push(current);
    }
    this.player.recalculateStats(false);
    sound.playUiClick();
    this.saveProgress();
    this.notifyUi();
    return true;
  }

  sellItem(itemId, fromEquippedSlot = null) {
    const item = SHOP_ITEMS[itemId];
    if (!item) return false;
    const sellPrice = Math.max(1, Math.floor(item.price * SHOP_SELL_RATIO));

    if (item.consumable) {
      if (!this.player.supplies[itemId] || this.player.supplies[itemId] <= 0) return false;
      this.player.supplies[itemId] -= 1;
      this.player.gold += sellPrice;
    } else if (fromEquippedSlot && this.player.equipped[fromEquippedSlot] === itemId) {
      this.player.equipped[fromEquippedSlot] = null;
      this.player.gold += sellPrice;
      this.player.recalculateStats(false);
    } else {
      const idx = this.player.ownedEquipment.indexOf(itemId);
      if (idx === -1) return false;
      this.player.ownedEquipment.splice(idx, 1);
      this.player.gold += sellPrice;
    }

    sound.playCoin();
    this.saveProgress();
    this.notifyUi();
    return true;
  }

  // --- SAVE & LOAD SYSTEM ---

  serializeSave() {
    return {
      version: 1,
      timestamp: Date.now(),
      player: {
        level: this.player.level,
        xp: this.player.xp,
        gold: this.player.gold,
        skillPoints: this.player.skillPoints,
        skills: { ...this.player.skills },
        equipped: { ...this.player.equipped },
        ownedEquipment: [...this.player.ownedEquipment],
        supplies: { ...this.player.supplies },
        hp: this.player.hp,
        stamina: this.player.stamina,
      },
      defeatedBosses: { ...this.spawner.defeatedBosses },
      settings: {
        scanlinesEnabled: this.scanlinesEnabled,
        muted: sound.muted,
      },
    };
  }

  applySaveData(data) {
    if (!data || !data.player) return;
    const p = data.player;
    this.player.level = Math.max(1, Math.min(30, p.level || 1));
    this.player.xp = Math.max(0, p.xp || 0);
    this.player.gold = Math.max(0, p.gold ?? 95);
    this.player.skillPoints = Math.max(0, p.skillPoints ?? 1);
    if (p.skills) {
      this.player.skills = {
        lunge: Math.max(1, Math.min(5, p.skills.lunge || 1)),
        groundBreak: Math.max(1, Math.min(5, p.skills.groundBreak || 1)),
        railSpike: Math.max(1, Math.min(5, p.skills.railSpike || 1)),
      };
    }
    if (p.equipped) {
      this.player.equipped = {
        head: p.equipped.head || null,
        body: p.equipped.body || null,
        legs: p.equipped.legs || null,
      };
    }
    if (Array.isArray(p.ownedEquipment)) {
      this.player.ownedEquipment = [...p.ownedEquipment];
    }
    if (p.supplies) {
      this.player.supplies = {
        gauzeRoll: p.supplies.gauzeRoll ?? 2,
        sugarTin: p.supplies.sugarTin ?? 1,
      };
    }
    this.player.recalculateStats(false);
    if (typeof p.hp === 'number' && p.hp > 0) {
      this.player.hp = Math.min(this.player.maxHp, p.hp);
    } else {
      this.player.hp = this.player.maxHp;
    }

    if (data.defeatedBosses) {
      this.spawner.defeatedBosses = {
        ...this.spawner.defeatedBosses,
        ...data.defeatedBosses,
      };
    }
    if (data.settings) {
      if (typeof data.settings.scanlinesEnabled === 'boolean') {
        this.scanlinesEnabled = data.settings.scanlinesEnabled;
      }
      if (typeof data.settings.muted === 'boolean') {
        sound.setMuted(data.settings.muted);
      }
    }
  }

  saveProgress() {
    const payload = this.serializeSave();
    if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.saveGame) {
      window.electronAPI.saveGame(payload).catch(() => {});
    }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (_err) {}
  }

  async loadProgress() {
    try {
      if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.loadGame) {
        const electronData = await window.electronAPI.loadGame();
        if (electronData) {
          this.applySaveData(electronData);
          this.notifyUi();
          return;
        }
      }
    } catch (_e) {}

    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        this.applySaveData(JSON.parse(raw));
        this.notifyUi();
      }
    } catch (_err) {}
  }

  resetSaveData() {
    this.player = new Player();
    this.spawner = new Spawner();
    this.saveProgress();
    this.notifyUi();
  }

  // --- INPUT & WINDOW EVENT BINDINGS ---

  _bindWindowEvents() {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('blur', () => {
      this.input.keys = {};
      this.input.mouseDown = false;
    });
    window.addEventListener('beforeunload', () => {
      this.saveProgress();
    });

    window.addEventListener('mousemove', (e) => {
      const pt = this._clientToInternal(e.clientX, e.clientY);
      this.input.mouseX = pt.x;
      this.input.mouseY = pt.y;
      const worldPt = this.camera.screenToWorld(pt.x, pt.y);
      this.input.worldMouseX = worldPt.x;
      this.input.worldMouseY = worldPt.y;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (this.uiState !== 'playing') return;
      if (e.target && e.target.closest && e.target.closest('[data-hud-interactive="true"]')) {
        return;
      }
      sound.init();
      this.input.mouseDown = true;
      const pt = this._clientToInternal(e.clientX, e.clientY);
      this.input.mouseX = pt.x;
      this.input.mouseY = pt.y;
      const worldPt = this.camera.screenToWorld(pt.x, pt.y);
      this.input.worldMouseX = worldPt.x;
      this.input.worldMouseY = worldPt.y;

      this.player.tryBasicAttack(
        this.input.worldMouseX,
        this.input.worldMouseY,
        this.spawner,
        this.particles,
        this.camera,
        (dur) => this.startHitStop(dur)
      );
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.input.mouseDown = false;
      }
    });

    window.addEventListener('keydown', (e) => {
      const code = e.code;

      if (code === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
        return;
      }

      if (this.uiState === 'title') {
        if (code === 'Enter' || code === 'Space') {
          e.preventDefault();
          this.startGameFromTitle();
        }
        return;
      }

      if (this.uiState === 'death') {
        if (code === 'Enter' || code === 'Space') {
          e.preventDefault();
          this.respawnAfterDeath();
        }
        return;
      }

      if (code === 'Escape') {
        e.preventDefault();
        if (this.uiState === 'playing') {
          this.setUiState('pause');
        } else {
          this.setUiState('playing');
        }
        return;
      }

      if (code === 'KeyI') {
        e.preventDefault();
        this.setUiState(this.uiState === 'inventory' ? 'playing' : 'inventory');
        return;
      }

      if (code === 'KeyK') {
        e.preventDefault();
        this.setUiState(this.uiState === 'skills' ? 'playing' : 'skills');
        return;
      }

      if (code === 'KeyE') {
        e.preventDefault();
        if (this.uiState === 'shop') {
          this.setUiState('playing');
          return;
        }
        if (this.uiState === 'playing' && this.isPlayerNearUme()) {
          this.setUiState('shop');
          return;
        }
      }

      if (this.uiState !== 'playing') return;

      this.input.keys[code] = true;

      if (code === 'Space') {
        e.preventDefault();
        let mx = 0;
        let my = 0;
        if (this.input.keys.KeyW || this.input.keys.ArrowUp) my -= 1;
        if (this.input.keys.KeyS || this.input.keys.ArrowDown) my += 1;
        if (this.input.keys.KeyA || this.input.keys.ArrowLeft) mx -= 1;
        if (this.input.keys.KeyD || this.input.keys.ArrowRight) mx += 1;
        this.player.tryDodge(
          mx,
          my,
          this.input.worldMouseX,
          this.input.worldMouseY,
          this.particles
        );
      } else if (code === 'Digit1') {
        this.player.trySkillLunge(
          this.input.worldMouseX,
          this.input.worldMouseY,
          this.spawner,
          this.particles,
          this.camera,
          (dur) => this.startHitStop(dur)
        );
      } else if (code === 'Digit2') {
        this.player.trySkillGroundBreak(
          this.spawner,
          this.particles,
          this.camera,
          (dur) => this.startHitStop(dur)
        );
      } else if (code === 'Digit3') {
        this.player.trySkillRailSpike(
          this.input.worldMouseX,
          this.input.worldMouseY,
          this.projectiles,
          this.particles,
          this.camera
        );
      } else if (code === 'KeyR') {
        this.player.tryUltimate(this.spawner, this.particles, this.camera);
      } else if (code === 'KeyQ') {
        this.player.useSupply('gauzeRoll', this.particles);
      } else if (code === 'KeyF') {
        this.player.useSupply('sugarTin', this.particles);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });
  }

  isPlayerNearUme() {
    const d = Math.hypot(
      this.player.x - WORLD_CONFIG.umePosition.x,
      this.player.y - WORLD_CONFIG.umePosition.y
    );
    return d <= 75;
  }

  // --- MAIN FIXED-TIMESTEP LOOP ---

  _loop(now) {
    if (!this.running) return;
    const rawDt = Math.min(0.05, Math.max(0, (now - this.lastFrameTime) / 1000));
    this.lastFrameTime = now;

    this.autoSaveTimer += rawDt;
    if (this.autoSaveTimer >= 30) {
      this.autoSaveTimer = 0;
      this.saveProgress();
    }

    if (this.uiState === 'playing' || this.uiState === 'death') {
      if (this.hitStopTimer > 0) {
        this.hitStopTimer = Math.max(0, this.hitStopTimer - rawDt);
        this.camera.update(
          rawDt,
          this.player.x,
          this.player.y,
          this.input.worldMouseX,
          this.input.worldMouseY
        );
      } else {
        this.accumulator += rawDt;
        while (this.accumulator >= this.fixedStep) {
          this._fixedUpdate(this.fixedStep);
          this.accumulator -= this.fixedStep;
        }
      }
    } else if (this.uiState === 'title') {
      this.world.update(rawDt);
    }

    this._render();
    this.rafId = requestAnimationFrame((t) => this._loop(t));
  }

  _fixedUpdate(dt) {
    const worldPt = this.camera.screenToWorld(this.input.mouseX, this.input.mouseY);
    this.input.worldMouseX = worldPt.x;
    this.input.worldMouseY = worldPt.y;

    if (this.input.mouseDown && this.uiState === 'playing') {
      this.player.tryBasicAttack(
        this.input.worldMouseX,
        this.input.worldMouseY,
        this.spawner,
        this.particles,
        this.camera,
        (dur) => this.startHitStop(dur)
      );
    }

    this.world.update(dt);
    this.player.update(
      dt,
      this.input,
      this.spawner,
      this.particles,
      this.camera,
      this.world,
      (dur) => this.startHitStop(dur)
    );
    this.spawner.update(
      dt,
      this.player,
      this.projectiles,
      this.particles,
      this.camera,
      this.world
    );
    this.projectiles.update(
      dt,
      this.player,
      this.spawner,
      this.particles,
      this.camera,
      (dur) => this.startHitStop(dur)
    );
    this.particles.update(dt);
    this.camera.update(
      dt,
      this.player.x,
      this.player.y,
      this.input.worldMouseX,
      this.input.worldMouseY
    );

    if (this.player.dead && this.uiState === 'playing' && this.player.deathAnimTimer >= 1.05) {
      this.lastGoldLost = Math.floor(this.player.gold * 0.1);
      this.setUiState('death');
    }
  }

  /**
   * Renders the entire game to the 480x270 offscreen pixel buffer,
   * then blits it to the display canvas scaled by a whole-number integer factor
   * with soot letterboxing around the remainder.
   */
  _render() {
    if (!this.ctx || !this.canvas || !this.offCtx) return;
    const ctx = this.offCtx;

    // 1. Chunk-streamed 16px tile ground + Boss arena rings
    this.world.drawGround(ctx, this.camera);

    // 2. Ground Break glowing cracks & shockwave rings
    this.particles.drawGroundLayer(ctx, this.camera);

    // 3. Telegraphed enemy/boss warning zones
    this.spawner.drawTelegraphs(ctx, this.camera);

    // 4. Y-Sorted Props, Ume, Enemies, Bosses, and Sena Ibuki
    this.renderQueue.length = 0;
    this.world.collectVisibleRenderables(this.camera, this.renderQueue);

    for (let i = 0; i < this.spawner.enemies.length; i++) {
      const e = this.spawner.enemies[i];
      if (!this.camera.isVisible(e.x, e.y, e.radius + 80)) continue;
      this.renderQueue.push({
        y: e.y,
        draw: (c) => e.draw(c, this.camera),
      });
    }

    this.renderQueue.push({
      y: this.player.y,
      draw: (c) => this.player.draw(c, this.camera),
    });

    this.renderQueue.sort((a, b) => a.y - b.y);
    for (let i = 0; i < this.renderQueue.length; i++) {
      this.renderQueue[i].draw(ctx);
    }

    // 5. Projectiles (Rail Spikes, Acid, Spark Darts)
    this.projectiles.draw(ctx, this.camera);

    // 6. Skill Effect Strips & Damage Numbers
    this.particles.draw(ctx, this.camera);

    // 7. Atmospheric motes, Bayer-dithered dark vignette, or Seven Cuts 2-tone drop
    this.world.drawAtmosphereAndVignette(ctx, this.camera, this.player);

    // 8. Seven Cuts letterbox & 480x120 eye strip cut-in overlay
    this.player.drawUltimateOverlay(ctx, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // 10. Crisp pixel interaction prompt when near Ume in Kettle
    if (this.uiState === 'playing' && this.isPlayerNearUme()) {
      const pScreen = this.camera.worldToScreen(this.player.x, this.player.y);
      const px = Math.round(pScreen.x);
      const py = Math.round(pScreen.y - 28);
      ctx.fillStyle = PALETTE.soot;
      ctx.fillRect(px - 28, py - 9, 56, 11);
      ctx.fillStyle = PALETTE.signal;
      ctx.fillRect(px - 28, py - 9, 56, 1);
      ctx.fillRect(px - 28, py + 1, 56, 1);
      ctx.font = 'bold 7px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[E] UME', px, py - 1);
    }

    // Blit 480x270 offscreen canvas onto main display canvas with whole-number scaling
    const mainCtx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    mainCtx.imageSmoothingEnabled = false;
    mainCtx.fillStyle = PALETTE.soot;
    mainCtx.fillRect(0, 0, cw, ch);

    const destW = INTERNAL_WIDTH * this.scaleFactor;
    const destH = INTERNAL_HEIGHT * this.scaleFactor;
    mainCtx.drawImage(
      this.offscreen,
      0,
      0,
      INTERNAL_WIDTH,
      INTERNAL_HEIGHT,
      this.letterboxX,
      this.letterboxY,
      destW,
      destH
    );
  }

  getHudSnapshot() {
    const p = this.player;
    const area = this.world.getAreaAt(p.x, p.y);
    const activeBoss = this.spawner.getActiveBossNearPlayer(p);
    const nearestObjective = this.spawner.getNearestUnbeatenBossObjective(p);

    return {
      hp: Math.ceil(p.hp),
      maxHp: p.maxHp,
      stamina: Math.floor(p.stamina),
      maxStamina: p.maxStamina,
      xp: Math.floor(p.xp),
      xpToNext: p.xpToNext,
      level: p.level,
      gold: p.gold,
      skillPoints: p.skillPoints,
      atk: p.atk,
      def: p.def,
      speed: p.speed,
      critChance: p.critChance,
      x: Math.round(p.x),
      y: Math.round(p.y),
      portraitExpression: p.getPortraitExpression(),
      equipped: { ...p.equipped },
      supplies: { ...p.supplies },
      skills: { ...p.skills },
      cooldowns: {
        lunge: p.cooldowns.lunge,
        groundBreak: p.cooldowns.groundBreak,
        railSpike: p.cooldowns.railSpike,
        dodge: p.cooldowns.dodge,
      },
      maxCooldowns: { ...p.maxCooldowns },
      ultimateCharge: p.ultimateCharge,
      ultimateActive: p.ultimateActive,
      areaName: area ? area.name : 'Kettle',
      areaSubtitle: area ? area.subtitle : '',
      isSafeZone: area ? !!area.safe : false,
      nearUme: this.isPlayerNearUme(),
      stormActive: this.world.stormFactor > 0.35,
      activeBoss: activeBoss
        ? {
            id: activeBoss.id,
            name: activeBoss.name,
            subtitle: activeBoss.subtitle,
            hp: Math.ceil(activeBoss.hp),
            maxHp: activeBoss.maxHp,
            phase: activeBoss.phase,
          }
        : null,
      bossNameCard: this.spawner.bossNameCard
        ? { ...this.spawner.bossNameCard }
        : null,
      objective: nearestObjective,
      defeatedBosses: { ...this.spawner.defeatedBosses },
    };
  }
}

export const gameEngine = new GameEngine();
export default gameEngine;
