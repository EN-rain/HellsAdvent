/**
 * GRAVEL SKY — Smooth Follow Camera & Screen Shake
 */

import { WORLD_CONFIG } from '../data/config.js';

export class Camera {
  constructor(viewportWidth = 1280, viewportHeight = 720) {
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.x = WORLD_CONFIG.kettleCenter.x - viewportWidth / 2;
    this.y = WORLD_CONFIG.kettleCenter.y - viewportHeight / 2;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  snapTo(targetX, targetY) {
    this.x = Math.max(0, Math.min(WORLD_CONFIG.size - this.width, targetX - this.width / 2));
    this.y = Math.max(0, Math.min(WORLD_CONFIG.size - this.height, targetY - this.height / 2));
  }

  shake(intensity = 6, duration = 0.16) {
    if (intensity >= this.shakeIntensity || this.shakeTimer <= 0) {
      this.shakeIntensity = intensity;
      this.shakeDuration = duration;
      this.shakeTimer = duration;
    }
  }

  addShake(intensity = 4, duration = 0.16) {
    this.shake(intensity, duration);
  }

  update(dt, targetX, targetY, aimX = targetX, aimY = targetY) {
    // Subtle look-ahead toward cursor
    const lookAheadX = (aimX - targetX) * 0.09;
    const lookAheadY = (aimY - targetY) * 0.09;

    const desiredX = targetX + lookAheadX - this.width / 2;
    const desiredY = targetY + lookAheadY - this.height / 2;

    const lerpFactor = 1 - Math.exp(-9.5 * dt);
    this.x += (desiredX - this.x) * lerpFactor;
    this.y += (desiredY - this.y) * lerpFactor;

    // Clamp inside 6000x6000 world bounds
    this.x = Math.max(0, Math.min(WORLD_CONFIG.size - this.width, this.x));
    this.y = Math.max(0, Math.min(WORLD_CONFIG.size - this.height, this.y));

    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      const decay = this.shakeDuration > 0 ? this.shakeTimer / this.shakeDuration : 0;
      const mag = this.shakeIntensity * decay;
      this.offsetX = (Math.random() * 2 - 1) * mag;
      this.offsetY = (Math.random() * 2 - 1) * mag;
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
      x: wx - this.renderX,
      y: wy - this.renderY,
    };
  }

  screenToWorld(sx, sy) {
    return {
      x: sx + this.renderX,
      y: sy + this.renderY,
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
