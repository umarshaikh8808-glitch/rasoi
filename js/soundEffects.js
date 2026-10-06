/**
 * RASOI 3D — Sound Effects Engine
 * Generates procedural UI sound effects using Web Audio API (Zero external assets needed!)
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = localStorage.getItem('rasoi_sound_enabled') !== 'false';
    this.initAudioContext();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.audioCtx = new AudioContext();
    }
  }

  ensureContext() {
    if (!this.audioCtx) this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('rasoi_sound_enabled', this.soundEnabled);
    if (this.soundEnabled) {
      this.playChime();
    }
    return this.soundEnabled;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  // Subtle luxury click sound for buttons and cards
  playClick() {
    if (!this.soundEnabled) return;
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio context policy safe fail
    }
  }

  // Gentle pop sound when opening modals or tabs
  playPop() {
    if (!this.soundEnabled) return;
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.audioCtx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } catch (e) {}
  }

  // Delightful chime when bookmarking or completing a step
  playChime() {
    if (!this.soundEnabled) return;
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.05);
        osc.stop(this.audioCtx.currentTime + idx * 0.05 + 0.35);
      });
    } catch (e) {}
  }

  // Timer complete celebration sound
  playTimerBell() {
    if (!this.soundEnabled) return;
    try {
      this.ensureContext();
      if (!this.audioCtx) return;

      [880, 1174.66, 1760].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + idx * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.12);
        osc.stop(this.audioCtx.currentTime + idx * 0.12 + 0.8);
      });
    } catch (e) {}
  }
}

// Global Sound Instance
window.SoundEngine = new SoundEngine();
