import { SoundType } from '../types/water';

class AudioSynthesizer {
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

  public playSound(type: SoundType = 'droplet', volume: number = 0.8) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(volume, 1)), ctx.currentTime);
      masterGain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'droplet') {
        // Water droplet: Frequency sweep 600Hz -> 1750Hz with swift decay
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(3, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.25);

        // Secondary ripple droplet
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(900, now + 0.07);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.15);

        gain2.gain.setValueAtTime(0, now + 0.07);
        gain2.gain.linearRampToValueAtTime(0.4, now + 0.09);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc2.connect(gain2);
        gain2.connect(masterGain);

        osc2.start(now + 0.07);
        osc2.stop(now + 0.32);

      } else if (type === 'crystal') {
        // Clear high crystal chime (E6, G#6, B6 triad)
        const notes = [1318.51, 1661.22, 1975.53];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const start = now + index * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          noteGain.gain.setValueAtTime(0, start);
          noteGain.gain.linearRampToValueAtTime(0.3, start + 0.015);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(start);
          osc.stop(start + 0.65);
        });

      } else if (type === 'zen') {
        // Deep singing bowl / warm bell
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now); // 432 Hz calming tone

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(864, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + 1.25);
        oscHarmonic.stop(now + 1.25);

      } else {
        // Gentle double-tone
        const freqs = [523.25, 659.25]; // C5, E5
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          const start = now + idx * 0.12;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);

          noteGain.gain.setValueAtTime(0, start);
          noteGain.gain.linearRampToValueAtTime(0.4, start + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(start);
          osc.stop(start + 0.55);
        });
      }
    } catch {
      // Audio playback fails gracefully if blocked by autoplay policy
    }
  }
}

export const audioSynthesizer = new AudioSynthesizer();
