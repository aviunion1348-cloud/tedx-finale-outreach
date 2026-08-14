// WebAudio engine — pure oscillators + noise buffers, zero audio files.
// fx.tick / thunk / chime / open / warp. Sound is ON by default (v3).

type FXName = "tick" | "thunk" | "chime" | "open" | "warp";

class AudioEngine {
  private ctx: AudioContext | null = null;
  enabled = true;

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v && this.ctx) {
      void this.ctx.suspend();
    } else if (v && this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  play(name: FXName) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;

    const env = (gain: GainNode, peak: number, attack: number, decay: number) => {
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(peak, t + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    };

    switch (name) {
      case "tick": {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, t);
        env(g, 0.05, 0.005, 0.06);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }
      case "thunk": {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.12);
        env(g, 0.3, 0.005, 0.12);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
        break;
      }
      case "chime": {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1320, t);
        env(g, 0.12, 0.005, 0.3);
        osc.connect(g).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }
      case "open": {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc2.type = "sine";
        osc.frequency.setValueAtTime(220, t);
        osc2.frequency.setValueAtTime(440, t);
        env(g, 0.15, 0.02, 0.25);
        osc.connect(g);
        osc2.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.3);
        osc2.stop(t + 0.3);
        break;
      }
      case "warp": {
        // whoosh + sub-rumble
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer(ctx, 0.7);
        const nf = ctx.createBiquadFilter();
        nf.type = "bandpass";
        nf.frequency.setValueAtTime(200, t);
        nf.frequency.exponentialRampToValueAtTime(3000, t + 0.4);
        nf.frequency.exponentialRampToValueAtTime(150, t + 0.7);
        nf.Q.value = 1.2;
        const ng = ctx.createGain();
        env(ng, 0.5, 0.01, 0.6);
        noise.connect(nf);
        nf.connect(ng).connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.75);

        const osc = ctx.createOscillator();
        const og = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(70, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.6);
        env(og, 0.4, 0.01, 0.6);
        osc.connect(og).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.7);
        break;
      }
    }
  }
}

export const fx = new AudioEngine();
