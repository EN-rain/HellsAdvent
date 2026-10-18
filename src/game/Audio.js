/**
 * GRAVEL SKY — Procedural Web Audio Synthesizer
 * Exact audio tie-ins:
 * - Lunge: filtered noise sweep
 * - Ground Break: low sine drop plus noise burst
 * - Rail Spike: sharp metal ping
 * - Seven Cuts: 7 rising ticks, 200ms dead silence, then one big crack
 * - Rook (Springgun, Reload, Perfect Reload, Tripwire, Mine)
 * - Ines (Alternator hum, Magnet throw, Pull, Spin Up, Lump, Scrapfall)
 * - Status Effects: Bleed (wet drip), Burn (crackle), Corrode (hiss),
 *   Stun (dull ring), Buff apply (stamp tone), Buff end (soft click), Promotion Stamp
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.35;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  _canPlay() {
    if (this.muted || this.isSilenced()) return false;
    this.init();
    return !!this.ctx;
  }

  _createNoiseBuffer(duration = 0.25) {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playSlash(comboStep = 1) {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = comboStep === 3 ? 310 : comboStep === 2 ? 430 : 380;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.13);

    gain.gain.setValueAtTime(0.22 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.11);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 + comboStep * 280, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.24 * this.masterVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  playSpringgunShot(heavy = false) {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    // Leaf-spring twang + nail-gun snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = heavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(heavy ? 480 : 720, now);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 110 : 185, now + (heavy ? 0.16 : 0.09));

    gain.gain.setValueAtTime((heavy ? 0.34 : 0.22) * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.17 : 0.1));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (heavy ? 0.17 : 0.1));
  }

  playReloadStart() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.setValueAtTime(360, now + 0.04);
    gain.gain.setValueAtTime(0.16 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playPerfectReload() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const freqs = [880, 1320];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.04);
      gain.gain.setValueAtTime(0.28 * this.masterVolume, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.14);
    });
  }

  playMagnetThrow(emptyPulse = false) {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = emptyPulse ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(emptyPulse ? 240 : 540, now);
    osc.frequency.exponentialRampToValueAtTime(emptyPulse ? 120 : 880, now + 0.1);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playMagnetPull() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.24);
    gain.gain.setValueAtTime(0.32 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playHit(isCrit = false) {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(isCrit ? 240 : 160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + (isCrit ? 0.14 : 0.09));

    gain.gain.setValueAtTime((isCrit ? 0.38 : 0.25) * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.14 : 0.09));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isCrit ? 0.14 : 0.09));
  }

  playPlayerHurt() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.linearRampToValueAtTime(52, now + 0.2);

    gain.gain.setValueAtTime(0.38 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playDodge() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.14);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(210, now + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.24 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playSkillLunge() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.22);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(4.5, now);
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(3400, now + 0.14);
    filter.frequency.exponentialRampToValueAtTime(680, now + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playSkillGroundBreak() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(26, now + 0.38);

    gain.gain.setValueAtTime(0.6 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.28);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(780, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.42 * this.masterVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  playSkillRailSpike() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    const freqs = [1480, 2910];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.92, now + 0.22);

      gain.gain.setValueAtTime((idx === 0 ? 0.34 : 0.2) * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  playShieldBlock() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    // High metallic deflection clang
    const freqs = [1120, 2240, 3360];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.94, now + 0.16);

      gain.gain.setValueAtTime((idx === 0 ? 0.42 : 0.28) * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    });

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.06);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2800, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  playParry() {
    this.playShieldBlock();
  }

  playUltimateStart() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
    gain.gain.setValueAtTime(0.35 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playUltimateCut(cutIndex = 0) {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const freq = 520 + cutIndex * 145;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.055);

    gain.gain.setValueAtTime(0.28 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playUltimateReleaseCrack() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.36);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(420, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.65 * this.masterVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);

    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.35);
    oGain.gain.setValueAtTime(0.55 * this.masterVolume, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(oGain);
    oGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  playConcussiveBlast() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.24);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.55 * this.masterVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);

    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.24);
    oGain.gain.setValueAtTime(0.5 * this.masterVolume, now);
    oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(oGain);
    oGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  // --- STATUS EFFECT SYNTHESIZED AUDIO ---

  playStatusBleed() {
    // Short wet drip
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.045);
    gain.gain.setValueAtTime(0.14 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playStatusBurn() {
    // Short crackle
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.06);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playStatusCorrode() {
    // Short lye hiss
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.11);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3400, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playStatusStun() {
    // Dull metallic ring
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(610, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.18);
    gain.gain.setValueAtTime(0.24 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  playBuffApply() {
    // Stamp-like tone when a buff lands
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(330, now + 0.03);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playBuffExpire() {
    // Soft click when a buff ends
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);
    gain.gain.setValueAtTime(0.1 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  playStamp() {
    // Heavy rubber stamp hit for Harlow promotion & skill node unlock
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);
    gain.gain.setValueAtTime(0.45 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.08);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.28 * this.masterVolume, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    noise.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  playLevelUp() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const notes = [330, 440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.24 * this.masterVolume, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.22);
    });
  }

  playCoin() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.05);
    gain.gain.setValueAtTime(0.2 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playUiClick() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(640, now);
    gain.gain.setValueAtTime(0.14 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playBuySell() {
    this.playCoin();
  }

  playHarlowStamp() {
    this.playStamp();
  }

  playUltimateReady() {
    // Short low resonant tone when the ultimate ring fills
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
    gain.gain.setValueAtTime(0.32 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playInvalidBuzz() {
    // Short dull buzz when R is pressed without a valid target within 300px or in Kettle
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(98, now);
    osc.frequency.setValueAtTime(82, now + 0.07);
    gain.gain.setValueAtTime(0.26 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  setSilenceWindow(durationSec = 0.2) {
    this.silenceUntil = performance.now() + durationSec * 1000;
  }

  isSilenced() {
    return this.silenceUntil && performance.now() < this.silenceUntil;
  }

  playBossAlert() {
    if (!this._canPlay()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(92, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.5);
    gain.gain.setValueAtTime(0.36 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }
}

export const sound = new SoundSystem();
export default sound;

