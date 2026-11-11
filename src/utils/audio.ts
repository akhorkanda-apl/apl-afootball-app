/**
 * Web Audio API Synthesizer for Match Whistle and Goal Audio
 * (100% Offline & Zero External Assets)
 */

class SoundEffectsController {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Authentic Referee Whistle: Dual high-frequency tone burst
   */
  public playWhistle(long = false) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const duration = long ? 0.6 : 0.25;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Authentic Acme Thunderer whistle frequencies ~2500Hz-2900Hz
      osc1.frequency.setValueAtTime(2600, ctx.currentTime);
      osc2.frequency.setValueAtTime(2850, ctx.currentTime);

      // Tremolo modulation
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      mod.frequency.setValueAtTime(35, ctx.currentTime);
      modGain.gain.setValueAtTime(120, ctx.currentTime);
      mod.connect(osc1.frequency);
      mod.connect(osc2.frequency);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      mod.start(ctx.currentTime);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);

      mod.stop(ctx.currentTime + duration);
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Goal Celebration Harmonic Chord
   */
  public playGoalChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Major triumphant chord (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundEffectsController();
