/**
 * GRAVEL SKY — Smooth Follow Camera, Screen Shake, & Whole-Pixel Zoom
 * Ultimates may zoom up to 1.15x and add shake, always snapped to whole pixels.
 */

import { WORLD_CONFIG } from '../data/config.js';

export class Camera {
  constructor(viewportWidth = 480, viewportHeight = 270) {
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.x = WORLD_CONFIG.kettleCenter.x - viewportWidth / 2;
    this.y = WORLD_CONFIG.kettleCenter.y - viewportHeight / 2;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  setZoom(z = 1.0) {
    this.targetZoom = Math.max(1.0, Math.min(1.15, z));
  }

  snapTo(targetX, targetY, worldSize = WORLD_CONFIG.size) {
    this.x = Math.max(0, Math.min(worldSize - this.width, targetX - this.width / 2));
    this.y = Math.max(0, Math.min(worldSize - this.height, targetY - this.height / 2));
  }

  shake(intensity = 6, duration = 0.16) {
    if (intensity >= this.shakeIntensity || this.shakeTimer <= 0) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeTimer = duration;
    }
  }

  follow(targetX, targetY, worldSize = WORLD_CONFIG.size, dt = 1 / 60, aimX = targetX, aimY = targetY) {
    this.update(dt, targetX, targetY, aimX, aimY, worldSize);
  }

  update(dt, targetX, targetY, aimX = targetX, aimY = targetY, worldSize = WORLD_CONFIG.size) {
    // Smooth zoom interpolation
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, 10 * dt);
    if (Math.abs(this.targetZoom - this.zoom) < 0.003) {
      this.zoom = this.targetZoom;
    }

    // Subtle look-ahead toward cursor
    const lookAheadX = (aimX - targetX) * 0.09;
    const lookAheadY = (aimY - targetY) * 0.09;

    const desiredX = targetX + lookAheadX - this.width / 2;
    const desiredY = targetY + lookAheadY - this.height / 2;

    const lerpFactor = 1 - Math.exp(-9.5 * dt);
    this.x += (desiredX - this.x) * lerpFactor;
    this.y += (desiredY - this.y) * lerpFactor;

    // Clamp inside world bounds
    this.x = Math.max(0, Math.min(worldSize - this.width, this.x));
    this.y = Math.max(0, Math.min(worldSize - this.height, this.y));

    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      const decay = this.shakeDuration > 0 ? this.shakeTimer / this.shakeDuration : 0;
      const mag = this.shakeIntensity * decay;
      this.offsetX = Math.round((Math.random() * 2 - 1) * mag);
      this.offsetY = Math.round((Math.random() * 2 - 1) * mag);
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.shakeIntensity = 0;
    }
  }

  get renderX() {
    return Math.round(this.x + this.offsetX);
  }

  get renderY() {
    return Math.round(this.y + this.offsetY);
  }

  worldToScreen(wx, wy) {
    return {
      x: Math.round(wx - this.renderX),
      y: Math.round(wy - this.renderY),
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: Math.round(sx + this.renderX),
      y: Math.round(sy + this.renderY),
    };
  }

  isVisible(wx, wy, margin = 96) {
    return (
      wx >= this.x - margin &&
      wx <= this.x + this.width + margin &&
      wy >= this.y - margin &&
      wy <= this.y + this.height + margin
    );
  }
}

export default Camera;
