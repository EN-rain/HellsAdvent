/**
 * GRAVEL SKY — Core Fixed-Timestep Game Engine
 * - Renders the entire game to an offscreen canvas at 480x270 (INTERNAL_WIDTH x INTERNAL_HEIGHT),
 *   then scales by whole-number factors only (letterboxing the remainder) with image-rendering: pixelated.
 * - Supports 3 Playable Classes (Sena, Rook, Ines), 3 Save Slots, Harlow's Trade Register promotions,
 *   Status Effects & Buffs, and 10Hz HUD snapshot synchronization.
 */

import {
  PALETTE,
  WORLD_CONFIG,
  SHOP_ITEMS,
  SHOP_SELL_RATIO,
  XP_CURVE,
  ENEMIES_CONFIG,
  NPC,
} from '../data/config.js';
import { CLASSES, getCharacterTitle, getStageName } from '../data/classes.js';
import { Camera } from './Camera.js';
import { World } from './World.js';
import { Player } from './Player.js';
import { Spawner } from './Spawner.js';
import { ProjectilePool } from './Projectile.js';
import { ParticleSystem } from './Particles.js';
import { sound } from './Audio.js';
import { spriteRegistry, drawPixelText } from './Sprites.js';
import { bossMechanics } from './BossMechanics.js';
import { fusionManager } from './FusionManager.js';
import { tacticalSystem } from './TacticalAI.js';
import { obstacleManager } from './Obstacles.js';
import { worldLedger } from './WorldLedger.js';
import { getAllSkillsForCharacter } from '../data/classChangeData.js';

const SAVE_SLOT_PREFIX = 'gravel_sky_save_slot_';
const LEGACY_SAVE_KEY = 'gravel_sky_save_v1';

export const INTERNAL_WIDTH = 480;
export const INTERNAL_HEIGHT = 270;

export class GameEngine {
  constructor(onUiUpdate) {
    this.onUiUpdate = onUiUpdate;

    // Pre-bake all procedural pixel-art sprites before first frame
    spriteRegistry.init();

    // Offscreen 480x270 low-res pixel buffer
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = INTERNAL_WIDTH;
    this.offscreenCanvas.height = INTERNAL_HEIGHT;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    this.offscreenCtx.imageSmoothingEnabled = false;

    this.displayScale = 2;
    this.letterboxX = 0;
    this.letterboxY = 0;

    this.camera = new Camera(INTERNAL_WIDTH, INTERNAL_HEIGHT);
    this.world = new World();
    this.player = new Player('sena');
    this.projectiles = new ProjectilePool(80);
    this.particles = new ParticleSystem();
    this.spawner = new Spawner(this.world);

    // UI states: 'title' | 'slotSelect' | 'charSelect' | 'playing' | 'shop' | 'inventory' | 'skills' | 'harlow' | 'pause' | 'death'
    this.uiState = 'title';
    this.activeSlotIndex = 0;
    this.scanlinesEnabled = false;
    this.settings = {
      reduceFlashes: false,
      shortUltimates: false,
    };
    this.lastGoldLost = 0;

    // Active Boss Name Card banner timer
    this.bossNameCard = null;
    this.seenBossesInSession = new Set();

    // Input state
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      mouseDown: false,
      rightMouseDown: false,
      worldMouseX: this.player.x + 40,
      worldMouseY: this.player.y,
    };
    this.keys.keys = this.keys;
    this.mouseScreenX = INTERNAL_WIDTH / 2;
    this.mouseScreenY = INTERNAL_HEIGHT / 2;

    // Loop timing
    this.running = false;
    this.rafId = null;
    this.lastFrameTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1 / 60;

    // 10Hz HUD tick & 30s auto-save timer
    this.hudTickTimer = 0;
    this.autoSaveTimer = 0;

    this._migrateLegacySaveIfNeeded();
    this.loadProgress(0);
  }

  _migrateLegacySaveIfNeeded() {
    try {
      const existingSlot0 = localStorage.getItem(`${SAVE_SLOT_PREFIX}0`);
      const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
      if (!existingSlot0 && legacy) {
        localStorage.setItem(`${SAVE_SLOT_PREFIX}0`, legacy);
      }
    } catch {
      // Ignore storage errors
    }
  }

  getSlotKey(slotIndex = this.activeSlotIndex) {
    return `${SAVE_SLOT_PREFIX}${slotIndex}`;
  }

  getSaveSlotsSummary() {
    const slots = [];
    for (let i = 0; i < 3; i++) {
      let raw = null;
      try {
        raw = localStorage.getItem(this.getSlotKey(i));
      } catch {
        raw = null;
      }

      if (!raw) {
        slots.push({
          slotIndex: i,
          exists: false,
        });
        continue;
      }

      try {
        const data = JSON.parse(raw);
        const p = data.player || {};
        const classId = p.classId && CLASSES[p.classId] ? p.classId : 'sena';
        const cls = CLASSES[classId];
        const stage = p.stage || 1;
        const branch = p.branch || null;
        const title = getCharacterTitle(classId, stage, branch);
        const stageName = getStageName(stage);

        slots.push({
          slotIndex: i,
          exists: true,
          classId,
          characterName: cls.characterName,
          className: cls.className,
          accentColor: cls.accentColor,
          title,
          stage,
          stageName,
          level: p.level || 1,
          gold: p.gold ?? 35,
          equipped: p.equipped || {},
          timestamp: data.timestamp || Date.now(),
        });
      } catch {
        slots.push({
          slotIndex: i,
          exists: false,
        });
      }
    }
    return slots;
  }

  selectSlot(slotIndex) {
    this.activeSlotIndex = slotIndex;
    const summaries = this.getSaveSlotsSummary();
    const slot = summaries[slotIndex];
    if (slot && slot.exists) {
      this.loadProgress(slotIndex);
      this.setUiState('playing');
    } else {
      this.setUiState('charSelect');
    }
  }

  startNewCharacterInSlot(slotIndex, classId) {
    this.activeSlotIndex = slotIndex;
    worldLedger.reset();
    bossMechanics.resetAll();
    fusionManager.reset();
    tacticalSystem.reset();
    obstacleManager.clearTemporary();
    this.player = new Player(classId);
    this.spawner = new Spawner(this.world);
    if (this.projectiles && typeof this.projectiles.clear === 'function') {
      this.projectiles.clear();
    }
    if (this.particles && typeof this.particles.clear === 'function') {
      this.particles.clear();
    }
    this.camera.snapTo(this.player.x, this.player.y, this.world.size);
    this.saveProgress(slotIndex);
    this.setUiState('playing');
  }

  deleteSaveSlot(slotIndex) {
    try {
      localStorage.removeItem(this.getSlotKey(slotIndex));
    } catch {
      // Ignore
    }
    this.notifyUi();
  }

  attachCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.handleResize();
    this.camera.snapTo(this.player.x, this.player.y, this.world.size);
  }

  handleResize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : window.innerWidth;
    const h = parent ? parent.clientHeight : window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }

    const scaleX = Math.floor(w / INTERNAL_WIDTH);
    const scaleY = Math.floor(h / INTERNAL_HEIGHT);
    this.displayScale = Math.max(1, Math.min(scaleX, scaleY));

    const scaledW = INTERNAL_WIDTH * this.displayScale;
    const scaledH = INTERNAL_HEIGHT * this.displayScale;
    this.letterboxX = Math.floor((w - scaledW) / 2);
    this.letterboxY = Math.floor((h - scaledH) / 2);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setUiState(nextState) {
    sound.playUiClick();
    this.uiState = nextState;
    this.keys.mouseDown = false;
    this.keys.rightMouseDown = false;
    if (nextState !== 'playing') {
      this.keys.up = false;
      this.keys.down = false;
      this.keys.left = false;
      this.keys.right = false;
      this.keys.KeyW = false;
      this.keys.KeyS = false;
      this.keys.KeyA = false;
      this.keys.KeyD = false;
      this.keys.ArrowUp = false;
      this.keys.ArrowDown = false;
      this.keys.ArrowLeft = false;
      this.keys.ArrowRight = false;
    }
    this.notifyUi();
  }

  loop(timestamp) {
    if (!this.running) return;
    const frameDelta = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    const isSimulationActive = this.uiState === 'playing';

    if (isSimulationActive) {
      this.accumulator += frameDelta;
      while (this.accumulator >= this.fixedDt) {
        this.fixedUpdate(this.fixedDt);
        this.accumulator -= this.fixedDt;
      }
    } else {
      this.world.update(frameDelta, this.player);
    }

    this.render();

    this.hudTickTimer += frameDelta;
    if (this.hudTickTimer >= 0.1) {
      this.hudTickTimer = 0;
      this.notifyUi();
    }

    if (isSimulationActive) {
      this.autoSaveTimer += frameDelta;
      if (this.autoSaveTimer >= 30) {
        this.autoSaveTimer = 0;
        this.saveProgress();
      }
    }

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  fixedUpdate(dt) {
    this.keys.worldMouseX = this.camera.x + this.mouseScreenX;
    this.keys.worldMouseY = this.camera.y + this.mouseScreenY;

    this.world.update(dt, this.player);

    // Hit-stop freezes world simulation while keeping camera shake active
    if (this.particles.updateHitStop(dt)) {
      this.camera.follow(this.player.x, this.player.y, this.world.size, dt);
      return;
    }

    const timeStopped = this.player.isTimeStopped();

    this.player.update(
      dt,
      this.keys,
      this.spawner,
      this.projectiles,
      this.particles,
      this.camera,
      this.world,
      (dur) => this.particles.triggerHitStop(dur)
    );

    // Check player death
    if (this.player.dead && this.player.deathAnimTimer >= 1.0 && this.uiState === 'playing') {
      // D8 / D19 / D43: Restore boss encounter-entry snapshot on boss wipe
      if (worldLedger.activeBossEncounterSnapshot) {
        const bossId = worldLedger.activeBossEncounterSnapshot.bossId;
        worldLedger.restoreBossEntrySnapshot(this.player);
        bossMechanics.abortActiveEncounter(bossId);
        if (this.spawner.activeBossInstances[bossId]) {
          this.spawner.activeBossInstances[bossId].active = false;
          this.spawner.activeBossInstances[bossId] = null;
        }
        this.lastGoldLost = 0;
      } else {
        this.lastGoldLost = this.player.applyDeathPenalty();
      }
      this.saveProgress();
      this.setUiState('death');

      return;
    }

    this.projectiles.update(
      dt,
      this.world,
      this.player,
      this.spawner,
      this.particles,
      this.camera,
      timeStopped
    );

    this.spawner.update(
      dt,
      this.player,
      this.projectiles,
      this.particles,
      this.camera,
      this.world,
      timeStopped
    );

    if (!timeStopped) {
      obstacleManager.update(dt, this.player, this.spawner, this.particles, this.camera);
      tacticalSystem.update(dt, this.player, this.spawner.getAllActiveEnemies());
      bossMechanics.update(
        dt,
        this.player,
        this.spawner,
        this.projectiles,
        this.particles,
        this.camera,
        this.world,
        worldLedger
      );
      fusionManager.update(
        dt,
        this.spawner,
        this.player,
        this.particles,
        this.camera,
        bossMechanics,
        worldLedger
      );
    }

    if (this.spawner.activeBoss) {
      const b = this.spawner.activeBoss;
      if (!this.seenBossesInSession.has(b.id)) {
        this.seenBossesInSession.add(b.id);
        this.bossNameCard = {
          name: b.name,
          subtitle: b.subtitle,
          timer: 3.5,
        };
      }
    }
    if (this.bossNameCard) {
      this.bossNameCard.timer -= dt;
      if (this.bossNameCard.timer <= 0) {
        this.bossNameCard = null;
      }
    }

    this.particles.update(dt, this.player, this.world);
    this.camera.follow(this.player.x, this.player.y, this.world.size, dt);
  }

  render() {
    if (!this.ctx || !this.canvas) return;

    const octx = this.offscreenCtx;
    octx.imageSmoothingEnabled = false;
    octx.fillStyle = PALETTE.soot;
    octx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // 1. World terrain chunks, Kettle camp, Ume, Harlow, Boss arena markers
    this.world.draw(octx, this.camera, this.spawner);

    // 1.5. Environmental Obstacles (Solid Pillars, Low Cover, Destructible Steam/Acid/Capacitors)
    obstacleManager.draw(octx, this.camera);

    // 2. Ground decals (scorches, slashes, footprints, puddle rings, tripwires, craters)
    this.particles.drawGroundDecals(octx, this.camera);

    // 2.5. Ground Telegraphs, Boss Ritual Props, & 10x Fusion Convergence Channeling
    this.spawner.drawTelegraphs(octx, this.camera);
    bossMechanics.drawWorldOverlays(octx, this.camera, this.spawner);
    fusionManager.drawWorldOverlays(octx, this.camera);

    // 3. Loot & grounded scrap pickups
    this.particles.drawPickups(octx, this.camera);

    // 4. Ume & Harlow interaction prompts when near
    if (this.uiState === 'playing') {
      if (this.isPlayerNearUme()) {
        const ux = Math.round(WORLD_CONFIG.umePosition.x - this.camera.renderX);
        const uy = Math.round(WORLD_CONFIG.umePosition.y - this.camera.renderY - 22);
        octx.fillStyle = PALETTE.soot;
        octx.fillRect(ux - 22, uy - 6, 44, 9);
        octx.fillStyle = PALETTE.signal;
        octx.fillRect(ux - 22, uy - 6, 44, 1);
        drawPixelText(octx, 'E SHOP', ux, uy - 4, PALETTE.signal, 'center');
      }
      if (this.isPlayerNearHarlow()) {
        const hx = Math.round(WORLD_CONFIG.harlowPosition.x - this.camera.renderX);
        const hy = Math.round(WORLD_CONFIG.harlowPosition.y - this.camera.renderY - 22);
        const canPromo = this.player.canPromoteToJourneyman() || this.player.canPromoteToMaster();
        const col = canPromo ? PALETTE.brass : PALETTE.bone;
        octx.fillStyle = PALETTE.soot;
        octx.fillRect(hx - 28, hy - 6, 56, 9);
        octx.fillStyle = col;
        octx.fillRect(hx - 28, hy - 6, 56, 1);
        drawPixelText(
          octx,
          canPromo ? 'E PROMOTE' : 'E HARLOW',
          hx,
          hy - 4,
          col,
          'center'
        );
      }
    }

    // 5. Y-Sorted Entities (Player + Enemies + Ritual Actors)
    const renderList = [];
    const activeEnemies = this.spawner.getAllActiveEnemies();
    for (let i = 0; i < activeEnemies.length; i++) {
      const e = activeEnemies[i];
      if (e.active && !e.dead && this.camera.isVisible(e.x, e.y, e.radius + 48)) {
        renderList.push({ y: e.y, type: 'enemy', entity: e });
      }
    }
    renderList.push({ y: this.player.y, type: 'player', entity: this.player });
    renderList.sort((a, b) => a.y - b.y);

    for (let i = 0; i < renderList.length; i++) {
      const item = renderList[i];
      if (item.type === 'enemy') {
        item.entity.draw(octx, this.camera);
      } else {
        item.entity.draw(octx, this.camera, this.particles);
      }
    }

    // 6. Projectiles (8-angle Rail Spikes, Rook Bolts, Ines Scrap, Enemy Bolts)
    this.projectiles.draw(octx, this.camera);

    // 7. Particles, Slash Arcs, Ground Shockwaves, Floating Damage Numbers
    this.particles.drawParticlesAndText(octx, this.camera);

    // 7.5. Ultimates World Overlays (Rook aim line, Ines levitating scrap, Sena slashes & split corpses)
    if (this.player.ultimates) {
      if (typeof this.player.ultimates.drawWorldOverlay === 'function') {
        this.player.ultimates.drawWorldOverlay(octx, this.camera, this.player);
      } else if (typeof this.player.ultimates.drawWorldEffects === 'function') {
        this.player.ultimates.drawWorldEffects(octx, this.camera, this.player);
      }
    }

    // 8. Atmospheric Ash Motes, Vignette, & Ultimate 2-Tone World Drop
    this.world.drawAtmosphereAndVignette(octx, this.camera, this.player);

    // 9. Ultimates Screen Overlays (Letterbox bars, Speed lines cut-in, code-drawn Pixel Title Cards, Flashes/Bone Tints, Accessibility notice)
    if (this.player.ultimates) {
      this.player.ultimates.drawScreenOverlay(
        octx,
        INTERNAL_WIDTH,
        INTERNAL_HEIGHT,
        this.player,
        this.settings
      );
    } else {
      const cutInTimer = this.player.getCutInTimer();
      if (cutInTimer > 0) {
        const cutIn = spriteRegistry.getCutIn(this.player.classId);
        if (cutIn) {
          const cw = 64 * 3;
          const ch = 16 * 3;
          const cx = Math.round((INTERNAL_WIDTH - cw) / 2);
          const cy = 36;
          octx.fillStyle = PALETTE.soot;
          octx.fillRect(0, cy - 2, INTERNAL_WIDTH, ch + 4);
          octx.fillStyle = this.player.classConfig.accentColor || PALETTE.signal;
          octx.fillRect(0, cy - 2, INTERNAL_WIDTH, 1);
          octx.fillRect(0, cy + ch + 1, INTERNAL_WIDTH, 1);
          octx.drawImage(cutIn, 0, 0, 64, 16, cx, cy, cw, ch);
        }
      }
    }

    // 10. Blit 480x270 offscreen canvas to main display canvas at integer scale
    const ctx = this.ctx;
    const dispW = this.canvas.width;
    const dispH = this.canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = PALETTE.soot;
    ctx.fillRect(0, 0, dispW, dispH);

    const scaledW = INTERNAL_WIDTH * this.displayScale;
    const scaledH = INTERNAL_HEIGHT * this.displayScale;
    ctx.drawImage(
      this.offscreenCanvas,
      0,
      0,
      INTERNAL_WIDTH,
      INTERNAL_HEIGHT,
      this.letterboxX,
      this.letterboxY,
      scaledW,
      scaledH
    );
  }

  isPlayerNearUme() {
    const dx = this.player.x - WORLD_CONFIG.umePosition.x;
    const dy = this.player.y - WORLD_CONFIG.umePosition.y;
    return Math.hypot(dx, dy) <= 95;
  }

  isPlayerNearHarlow() {
    const dx = this.player.x - WORLD_CONFIG.harlowPosition.x;
    const dy = this.player.y - WORLD_CONFIG.harlowPosition.y;
    return Math.hypot(dx, dy) <= 95;
  }

  // --- INPUT HANDLERS ---
  onKeyDown(e) {
    if (e.code === 'F11') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
      return;
    }

    if (this.uiState === 'title') {
      if (e.code === 'Enter' || e.code === 'Space') {
        this.setUiState('slotSelect');
      }
      return;
    }

    if (this.uiState === 'death') {
      if (e.code === 'Enter' || e.code === 'Space') {
        this.respawnAfterDeath();
      }
      return;
    }

    if (e.code === 'Backquote' || e.code === 'F2') {
      e.preventDefault();
      if (this.uiState === 'dev') {
        this.setUiState('playing');
      } else if (this.uiState === 'playing' || this.uiState === 'pause') {
        this.setUiState('dev');
      }
      return;
    }

    if (e.code === 'Escape') {
      if (this.uiState === 'playing') {
        this.setUiState('pause');
      } else if (
        this.uiState === 'shop' ||
        this.uiState === 'inventory' ||
        this.uiState === 'skills' ||
        this.uiState === 'harlow' ||
        this.uiState === 'pause' ||
        this.uiState === 'dev'
      ) {
        this.setUiState('playing');
      } else if (this.uiState === 'charSelect') {
        this.setUiState('slotSelect');
      } else if (this.uiState === 'slotSelect') {
        this.setUiState('title');
      }
      return;
    }

    if (e.code === 'KeyI') {
      if (this.uiState === 'playing') this.setUiState('inventory');
      else if (this.uiState === 'inventory') this.setUiState('playing');
      return;
    }

    if (e.code === 'KeyK') {
      if (this.uiState === 'playing') this.setUiState('skills');
      else if (this.uiState === 'skills') this.setUiState('playing');
      return;
    }

    if (e.code === 'KeyE') {
      if (this.uiState === 'playing') {
        if (this.isPlayerNearUme()) {
          this.setUiState('shop');
          return;
        }
        if (this.isPlayerNearHarlow()) {
          this.setUiState('harlow');
          return;
        }
      } else if (this.uiState === 'shop' || this.uiState === 'harlow') {
        this.setUiState('playing');
        return;
      }
    }

    if (this.uiState !== 'playing') return;

    this.keys[e.code] = true;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'Space': {
        e.preventDefault();
        let dx = 0;
        let dy = 0;
        if (this.keys.up) dy -= 1;
        if (this.keys.down) dy += 1;
        if (this.keys.left) dx -= 1;
        if (this.keys.right) dx += 1;
        if (dx === 0 && dy === 0) {
          dx = this.keys.worldMouseX - this.player.x;
          dy = this.keys.worldMouseY - this.player.y;
        }
        this.player.tryDodge(dx, dy, this.particles);
        break;
      }
      case 'Digit1':
        this.player.useSkillByIndex(
          0,
          this.keys.worldMouseX,
          this.keys.worldMouseY,
          this.spawner,
          this.projectiles,
          this.particles,
          this.camera,
          this.world
        );
        break;
      case 'Digit2':
        this.player.useSkillByIndex(
          1,
          this.keys.worldMouseX,
          this.keys.worldMouseY,
          this.spawner,
          this.projectiles,
          this.particles,
          this.camera,
          this.world
        );
        break;
      case 'Digit3':
        this.player.useSkillByIndex(
          2,
          this.keys.worldMouseX,
          this.keys.worldMouseY,
          this.spawner,
          this.projectiles,
          this.particles,
          this.camera,
          this.world
        );
        break;
      case 'Digit4':
        this.player.useSkillByIndex(
          3,
          this.keys.worldMouseX,
          this.keys.worldMouseY,
          this.spawner,
          this.projectiles,
          this.particles,
          this.camera,
          this.world
        );
        break;
      case 'KeyR':
        this.player.useUltimate(
          this.keys.worldMouseX,
          this.keys.worldMouseY,
          this.spawner,
          this.projectiles,
          this.particles,
          this.camera,
          this.world,
          this.settings
        );
        break;
      case 'KeyV':
        if (this.player.classId === 'rook') {
          this.player.tryManualReload(this.particles);
        } else if (this.player.classId === 'sena') {
          this.player.toggleGuardStance(this.particles);
        }
        break;
      case 'KeyQ':
        this.player.useSupply('gauzeRoll', this.particles);
        break;
      case 'KeyF':
        this.player.useSupply('sugarTin', this.particles);
        break;
      case 'KeyZ':
      case 'Digit4':
        this.player.useSupply('lyeWash', this.particles);
        break;
      case 'KeyX':
      case 'Digit5':
        this.player.useSupply('hotStew', this.particles);
        break;
      case 'KeyC':
      case 'Digit6':
        this.player.useSupply('stimStick', this.particles);
        break;
      default:
        break;
    }
  }

  onKeyUp(e) {
    this.keys[e.code] = false;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.up = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.down = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      default:
        break;
    }
  }

  updateMouseCoords(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left - this.letterboxX;
    const rawY = e.clientY - rect.top - this.letterboxY;
    this.mouseScreenX = Math.max(0, Math.min(INTERNAL_WIDTH, rawX / this.displayScale));
    this.mouseScreenY = Math.max(0, Math.min(INTERNAL_HEIGHT, rawY / this.displayScale));
    this.keys.worldMouseX = this.camera.x + this.mouseScreenX;
    this.keys.worldMouseY = this.camera.y + this.mouseScreenY;
  }

  onMouseMove(e) {
    this.updateMouseCoords(e);
  }

  onMouseDown(e) {
    if (this.uiState !== 'playing') return;
    this.updateMouseCoords(e);

    if (e.button === 0) {
      this.keys.mouseDown = true;
      if (this.player && this.player.attackTimer <= 0) {
        this.player.tryBasicAttack(
          this.keys.worldMouseX,
          this.keys.worldMouseY,
          this.spawner,
          this.projectiles,
          this.particles,
          this.camera,
          (dur) => this.particles.triggerHitStop(dur)
        );
      }
    } else if (e.button === 2) {
      this.keys.rightMouseDown = true;
      // Right-click convenience: Rook manual reload or Sena Anvil Guard toggle
      if (this.player.classId === 'rook') {
        this.player.tryManualReload(this.particles);
      } else if (this.player.classId === 'sena') {
        this.player.toggleGuardStance(this.particles);
      }
    }
  }

  onMouseUp(e) {
    if (e.button === 0) {
      this.keys.mouseDown = false;
    } else if (e.button === 2) {
      this.keys.rightMouseDown = false;
    }
  }

  // --- SHOP, SKILLS, & PROMOTION ACTIONS ---
  buyAndEquipItem(itemId) {
    const item = SHOP_ITEMS[itemId];
    if (!item) return { ok: false, reason: 'Unknown item.' };

    const p = this.player;
    const gradeOrder = { Scrap: 1, Salvaged: 8, Relic: 16 };
    const reqLv = gradeOrder[item.grade] || 1;
    if (p.level < reqLv) {
      return { ok: false, reason: `Requires Level ${reqLv}.` };
    }
    if (p.gold < item.price) {
      return { ok: false, reason: 'Not enough Gold.' };
    }

    p.gold -= item.price;
    sound.playBuySell();

    if (item.consumable) {
      p.supplies[item.id] = (p.supplies[item.id] || 0) + 1;
    } else {
      const prevEquipped = p.equipped[item.slot];
      if (prevEquipped && prevEquipped !== item.id && !p.ownedEquipment.includes(prevEquipped)) {
        p.ownedEquipment.push(prevEquipped);
      }
      p.equipped[item.slot] = item.id;
      p.ownedEquipment = p.ownedEquipment.filter((id) => id !== item.id);
      p.recalcStats();
      p.refreshEquipmentSprites();
    }

    this.saveProgress();
    this.notifyUi();
    return { ok: true };
  }

  equipFromInventory(itemId) {
    const item = SHOP_ITEMS[itemId];
    if (!item || item.consumable) return;
    const p = this.player;
    const idx = p.ownedEquipment.indexOf(itemId);
    if (idx === -1) return;

    const prev = p.equipped[item.slot];
    p.ownedEquipment.splice(idx, 1);
    if (prev) {
      p.ownedEquipment.push(prev);
    }
    p.equipped[item.slot] = itemId;
    p.recalcStats();
    p.refreshEquipmentSprites();
    sound.playUiClick();
    this.saveProgress();
    this.notifyUi();
  }

  unequipSlot(slot) {
    const p = this.player;
    const cur = p.equipped[slot];
    if (!cur) return;
    p.equipped[slot] = null;
    p.ownedEquipment.push(cur);
    p.recalcStats();
    p.refreshEquipmentSprites();
    sound.playUiClick();
    this.saveProgress();
    this.notifyUi();
  }

  sellItem(itemId, fromEquippedSlot = null) {
    const item = SHOP_ITEMS[itemId];
    if (!item) return false;
    const p = this.player;
    const sellPrice = Math.max(1, Math.floor(item.price * SHOP_SELL_RATIO));

    if (item.consumable) {
      if ((p.supplies[itemId] || 0) <= 0) return false;
      p.supplies[itemId] -= 1;
      p.gold += sellPrice;
    } else if (fromEquippedSlot) {
      if (p.equipped[fromEquippedSlot] !== itemId) return false;
      p.equipped[fromEquippedSlot] = null;
      p.gold += sellPrice;
      p.recalcStats();
      p.refreshEquipmentSprites();
    } else {
      const idx = p.ownedEquipment.indexOf(itemId);
      if (idx === -1) return false;
      p.ownedEquipment.splice(idx, 1);
      p.gold += sellPrice;
    }

    sound.playBuySell();
    this.saveProgress();
    this.notifyUi();
    return true;
  }

  upgradeSkill(skillId) {
    if (this.player.upgradeSkill(skillId)) {
      this.saveProgress();
      this.notifyUi();
    }
  }

  upgradePassive(passiveId) {
    if (this.player.upgradePassive(passiveId)) {
      this.saveProgress();
      this.notifyUi();
    }
  }

  unlockBranchNode(nodeId) {
    if (this.player.unlockBranchNode(nodeId)) {
      this.saveProgress();
      this.notifyUi();
    }
  }

  promoteToJourneyman(branchId) {
    if (this.player.promoteToJourneyman(branchId)) {
      this.particles.spawnFloatingText(
        this.player.x,
        this.player.y - 32,
        `PROMOTED: ${this.player.getTitle().toUpperCase()}`,
        PALETTE.brass
      );
      this.saveProgress();
      this.notifyUi();
      return true;
    }
    return false;
  }

  promoteToMaster() {
    if (this.player.promoteToMaster()) {
      this.particles.spawnFloatingText(
        this.player.x,
        this.player.y - 32,
        `MASTER: ${this.player.getTitle().toUpperCase()}`,
        PALETTE.brass
      );
      this.saveProgress();
      this.notifyUi();
      return true;
    }
    return false;
  }

  equipCosmetic(achId) {
    worldLedger.equipCosmetic(achId);
    sound.playUiClick();
    this.saveProgress();
    this.notifyUi();
  }

  equipCosmeticTitle(title) {
    worldLedger.equippedCosmeticTitle = title || null;
    sound.playUiClick();
    this.saveProgress();
    this.notifyUi();
  }

  equipCosmeticTrim(trimColor) {
    worldLedger.equippedCosmeticTrim = trimColor || null;
    sound.playUiClick();
    this.saveProgress();
    this.notifyUi();
  }

  triggerBossRematch(bossId) {
    if (this.spawner.startBossRematch(bossId, this.player, this.particles)) {
      this.setUiState('playing');
      return true;
    }
    return false;
  }

  respawnAfterDeath() {
    bossMechanics.resetAll();
    fusionManager.reset();
    obstacleManager.clearTemporary();
    this.player.respawnAtKettle();
    this.projectiles.clear();
    this.camera.snapTo(this.player.x, this.player.y, this.world.size);
    this.setUiState('playing');
    this.saveProgress();
  }

  // --- SAVE / LOAD SYSTEM (3 Save Slots + Electron IPC or localStorage fallback) ---
  saveProgress(slotIndex = this.activeSlotIndex) {
    const payload = {
      version: 3,
      slotIndex,
      timestamp: Date.now(),
      scanlinesEnabled: this.scanlinesEnabled,
      settings: { ...this.settings },
      player: this.player.toJSON(),
      spawner: this.spawner.toJSON(),
      worldLedger: worldLedger.toJSON(),
    };

    try {
      if (window.electronAPI?.saveGame) {
        window.electronAPI.saveGame(payload);
      }
    } catch {
      // Fallback
    }

    try {
      localStorage.setItem(this.getSlotKey(slotIndex), JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }

  loadProgress(slotIndex = this.activeSlotIndex) {
    this.activeSlotIndex = slotIndex;
    let data = null;
    try {
      const raw = localStorage.getItem(this.getSlotKey(slotIndex));
      if (raw) {
        data = JSON.parse(raw);
      }
    } catch {
      data = null;
    }

    bossMechanics.resetAll();
    fusionManager.reset();
    tacticalSystem.reset();
    obstacleManager.clearTemporary();

    if (data) {
      if (typeof data.scanlinesEnabled === 'boolean') {
        this.scanlinesEnabled = data.scanlinesEnabled;
      }
      if (data.settings && typeof data.settings === 'object') {
        this.settings = { ...this.settings, ...data.settings };
      }
      this.player.fromJSON(data.player);
      if (data.worldLedger) {
        worldLedger.fromJSON(data.worldLedger);
      } else {
        worldLedger.reset();
      }
      this.spawner.fromJSON(data.spawner);
      this.camera.snapTo(this.player.x, this.player.y, this.world.size);
    } else {
      worldLedger.reset();
      this.player = new Player('sena');
      this.spawner = new Spawner(this.world);
      this.camera.snapTo(this.player.x, this.player.y, this.world.size);
    }
  }

  resetSaveData(slotIndex = this.activeSlotIndex) {
    try {
      localStorage.removeItem(this.getSlotKey(slotIndex));
    } catch {
      // Ignore
    }
    worldLedger.reset();
    bossMechanics.resetAll();
    fusionManager.reset();
    tacticalSystem.reset();
    obstacleManager.clearTemporary();
    this.player = new Player(this.player.classId || 'sena');
    this.spawner = new Spawner(this.world);
    if (this.projectiles && typeof this.projectiles.clear === 'function') {
      this.projectiles.clear();
    }
    if (this.particles && typeof this.particles.clear === 'function') {
      this.particles.clear();
    }
    this.camera.snapTo(this.player.x, this.player.y, this.world.size);
    this.notifyUi();
  }

  // --- DEVELOPER CHEATS & ACTIONS ---

  killAllNearbyEnemies() {
    let killed = 0;
    const enemies = this.spawner.getAllActiveEnemies();
    for (const e of enemies) {
      if (e && e.active && e.hp > 0 && e.tier !== 'boss') {
        e.hp = 0;
        if (typeof e.die === 'function') {
          e.die(this.player, this.spawner, this.particles, this.camera);
        } else {
          e.active = false;
        }
        killed++;
      }
    }
    this.notifyUi();
    return killed;
  }

  killActiveBoss() {
    const boss = this.spawner.activeBoss;
    if (boss && boss.active && boss.hp > 0) {
      boss.takeDamage(999999, this.player, this.particles, this.camera);
      this.notifyUi();
      return true;
    }
    return false;
  }

  teleportPlayerTo(x, y) {
    this.player.x = Math.round(x);
    this.player.y = Math.round(y);
    this.player.vx = 0;
    this.player.vy = 0;
    this.camera.snapTo(this.player.x, this.player.y, this.world.size);
    if (this.particles) {
      this.particles.spawnShockwave?.(this.player.x, this.player.y, 80, PALETTE.signal, 0.3);
      this.particles.spawnSmokePuff?.(this.player.x, this.player.y, 14);
    }
    sound.playSkillLunge?.();
    this.notifyUi();
  }

  getHudSnapshot() {
    const p = this.player;
    const area = this.world.getZoneAt(p.x, p.y);
    const boss = this.spawner.activeBoss;
    const nearestBoss = this.spawner.getNearestUnbeatenBoss(p.x, p.y);
    const cls = p.classConfig;

    const allSkills = getAllSkillsForCharacter(p.classId);
    const skillMap = new Map(allSkills.map((s) => [s.id, s]));

    const slots = p.skillSlots && p.skillSlots.length === 4
      ? p.skillSlots
      : (cls.skillOrder || []).slice(0, 4);

    const activeSkillDefs = [];
    for (let idx = 0; idx < 4; idx++) {
      const sId = slots[idx];
      const sk = sId ? skillMap.get(sId) : null;
      const baseSk = cls.skills && cls.skillOrder?.[idx] ? cls.skills[cls.skillOrder[idx]] : null;
      const resolved = sk || baseSk;

      if (resolved) {
        const lv = p.skills[resolved.id] || 1;
        const stats = resolved.getStats ? resolved.getStats(lv, p.ownedNodes) : { cooldown: resolved.cooldown || 5 };
        const cdKey = `skill${idx + 1}`;
        activeSkillDefs.push({
          id: resolved.id,
          hotkey: String(idx + 1),
          name: resolved.name,
          icon: resolved.icon || 'lunge',
          level: lv,
          maxLevel: resolved.maxLevel || 5,
          cd: p.cooldowns[cdKey] ?? p.cooldowns[resolved.id] ?? 0,
          maxCd: p.maxCooldowns[cdKey] ?? stats.cooldown ?? 5,
          cost: resolved.staminaCost || (p.getSkillStaminaCost ? p.getSkillStaminaCost(resolved.id) : 10),
          desc: resolved.desc || '',
          source: resolved.source || 'Original',
        });
      }
    }

    let activeUltDef = null;
    if (p.ultimateSlot && skillMap.has(p.ultimateSlot)) {
      const u = skillMap.get(p.ultimateSlot);
      activeUltDef = {
        id: u.id,
        name: u.name,
        icon: u.icon || 'sevenCuts',
        summary: u.desc || '',
        desc: u.desc || '',
        chargeNeeded: 100,
      };
    }
    if (!activeUltDef) {
      activeUltDef = p.ultimates
        ? p.ultimates.getActiveUltimateDef(p)
        : cls.ultimate;
    }
    const maxChargeNeeded =
      activeUltDef?.chargeNeeded || (p.hasNode('nineCuts') ? 85 : 100);

    return {
      uiState: this.uiState,
      activeSlotIndex: this.activeSlotIndex,
      scanlinesEnabled: this.scanlinesEnabled,
      settings: { ...this.settings },
      classId: p.classId,
      activeClassId: p.activeClassId,
      unlockedClasses: p.unlockedClasses || [p.activeClassId],
      skillSlots: p.skillSlots,
      ultimateSlot: p.ultimateSlot,
      loadoutPresets: p.loadoutPresets,
      treeNodes: p.treeNodes,
      treePoints: p.getAvailableTreePoints ? p.getAvailableTreePoints() : 8,
      intrinsicTrait: p.getIntrinsicTrait ? p.getIntrinsicTrait() : null,
      classTrait: p.getClassTrait ? p.getClassTrait() : null,
      characterName: cls.characterName,
      className: cls.className,
      classTitle: worldLedger.equippedCosmeticTitle || p.getTitle(),
      baseClassTitle: p.getTitle(),
      stage: p.stage,
      stageName: p.getStageLabel(),
      fullTitleLine: worldLedger.equippedCosmeticTitle
        ? `${cls.characterName} — ${worldLedger.equippedCosmeticTitle} (${p.getStageLabel()})`
        : p.getFullTitleLine(),
      accentColor: worldLedger.equippedCosmeticTrim || cls.accentColor,
      weaponName: cls.weaponName,
      branch: p.branch,
      unlockedNodes: [...p.unlockedNodes],
      passives: { ...p.passives },
      hp: Math.ceil(p.hp),
      maxHp: p.maxHp,
      stamina: Math.floor(p.stamina),
      maxStamina: p.maxStamina,
      level: p.level,
      xp: p.xp,
      xpToNext: p.level >= 20 ? XP_CURVE[20] : XP_CURVE[p.level + 1],
      gold: p.gold,
      godmode: Boolean(p.godmode),
      infiniteStamina: Boolean(p.infiniteStamina),
      noCooldowns: Boolean(p.noCooldowns),
      oneHitKill: Boolean(p.oneHitKill),
      speedBoost: Boolean(p.speedBoost),
      atk: p.atk,
      def: p.def,
      speed: p.speed,
      critChance: p.critChance,
      skillPoints: p.skillPoints,
      skills: { ...p.skills },
      activeSkillDefs,
      cooldowns: { ...p.cooldowns },
      maxCooldowns: { ...p.maxCooldowns },
      ultimateCharge: Math.floor(p.ultimateCharge),
      ultimateChargeNeeded: maxChargeNeeded,
      ultimateDef: activeUltDef,
      invalidUltShake: p.ultimates ? p.ultimates.invalidShakeTimer > 0 : false,
      ultReadyFlash: p.ultimates ? p.ultimates.readyFlashTimer > 0 : false,
      equipped: { ...p.equipped },
      ownedEquipment: [...p.ownedEquipment],
      supplies: { ...p.supplies },
      portraitExpression: p.getPortraitExpression(),
      classMechanic:
        p.classBehavior && typeof p.classBehavior.getHudMechanicState === 'function'
          ? p.classBehavior.getHudMechanicState()
          : (typeof p.getHudMechanicState === 'function' ? p.getHudMechanicState() : null),
      statuses: (p.statuses || p.status)?.getHudStatusList?.() || [],
      areaName: area.name,
      areaSubtitle: area.subtitle,
      areaId: area.id,
      inSafeZone: !!(area && area.safe) || (p && p.isInSafeZone ? p.isInSafeZone(this.world) : false),
      stormActive: this.world.stormTimer > 0,
      nearUme: this.isPlayerNearUme(),
      nearHarlow: this.isPlayerNearHarlow(),
      canPromoteJourneyman: p.canPromoteToJourneyman(),
      canPromoteMaster: p.canPromoteToMaster(),
      x: Math.round(p.x),
      y: Math.round(p.y),
      defeatedBosses: { ...this.spawner.defeatedBosses },
      objective: nearestBoss,
      worldLedger: {
        floor1Complete: worldLedger.floor1Cleared,
        liberatedCount: Object.values(worldLedger.confirmedBossKills).filter(Boolean).length,
        zoneLiberated: worldLedger.territories[area.id]?.state === 'CLEARED',
        confirmedBossKills: { ...worldLedger.confirmedBossKills },
        unlockedAchievements: { ...worldLedger.unlockedAchievements },
        equippedCosmeticTitle: worldLedger.equippedCosmeticTitle,
        equippedCosmeticTrim: worldLedger.equippedCosmeticTrim,
        umeReactiveLine: worldLedger.getReactiveDialogue('ume'),
        harlowReactiveLine: worldLedger.getReactiveDialogue('harlow'),
      },
      activeFusion: fusionManager.getHudChannelSummary(),
      activeBoss: boss
        ? {
            id: boss.id,
            name: boss.name,
            subtitle: boss.subtitle,
            hp: Math.ceil(boss.hp),
            maxHp: boss.maxHp,
            phase: boss.phase,
            isRematch: !!boss.isRematch,
            staggerPct: Math.round((boss.statuses || boss.status)?.stagger || 0),
            staggered: Boolean(
              (boss.statuses || boss.status)?.has?.('staggered') ||
                (boss.statuses || boss.status)?.staggeredTimer > 0
            ),
            mechanic: bossMechanics.getHudBossMechanicState(boss),
          }
        : null,
      bossNameCard: this.bossNameCard ? { ...this.bossNameCard } : null,
    };
  }

  notifyUi() {
    if (this.onUiUpdate) {
      this.onUiUpdate(this.getHudSnapshot());
    }
  }
}
