import { onGameEvent } from "./events";
import { useGame } from "./store";

// All sounds are synthesized with WebAudio — no assets, ~zero bundle cost.
// Muted by default; the context is only created after a user gesture unmutes.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function env(node: GainNode, t0: number, peak: number, decay: number) {
  node.gain.setValueAtTime(0.0001, t0);
  node.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
  node.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
}

function tone(freq: number, decay: number, peak = 0.18, type: OscillatorType = "sine", detune = 0) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  env(g, t0, peak, decay);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + decay + 0.05);
}

function thump(freq: number, decay: number, peak = 0.3) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.4), t0 + decay);
  env(g, t0, peak, decay);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + decay + 0.05);
}

function noise(decay: number, peak = 0.12, highpass = 1200) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime;
  const len = Math.ceil(a.sampleRate * decay);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = highpass;
  const g = a.createGain();
  env(g, t0, peak, decay);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t0);
}

function chord(freqs: number[], spacing: number, decay: number, peak = 0.14) {
  freqs.forEach((f, i) => setTimeout(() => tone(f, decay, peak, "triangle"), i * spacing * 1000));
}

export function playSound(name: string) {
  if (useGame.getState().muted) return;
  switch (name) {
    case "launch":
      thump(180, 0.16, 0.2);
      noise(0.08, 0.05, 400);
      break;
    case "pop":
      thump(320, 0.12, 0.35);
      noise(0.05, 0.1, 2000);
      break;
    case "bounce":
      thump(150, 0.1, 0.16);
      break;
    case "net":
      noise(0.12, 0.08, 600);
      break;
    case "targetHit":
      noise(0.18, 0.12, 1500);
      chord([523, 659, 784], 0.055, 0.5, 0.16);
      break;
    case "miss":
      tone(196, 0.25, 0.1, "sawtooth");
      break;
    case "streak":
      chord([523, 659, 784, 1047, 1319], 0.07, 0.6, 0.15);
      break;
    case "roar": {
      // filtered noise swell ≈ crowd
      const a = ac();
      if (!a) break;
      const t0 = a.currentTime;
      const len = Math.ceil(a.sampleRate * 1.6);
      const buf = a.createBuffer(1, len, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = a.createBufferSource();
      src.buffer = buf;
      const f = a.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 700;
      f.Q.value = 0.6;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
      src.connect(f).connect(g).connect(a.destination);
      src.start(t0);
      break;
    }
    case "launcherHit":
      thump(90, 0.3, 0.4);
      noise(0.25, 0.18, 300);
      break;
    case "turbo":
      chord([392, 523, 659, 784], 0.05, 0.4, 0.16);
      thump(60, 0.5, 0.3);
      break;
  }
}

/** Wire the event bus to sounds. Returns an unsubscribe fn. */
export function bindAudio() {
  return onGameEvent((e) => {
    switch (e.type) {
      case "launch": playSound("launch"); break;
      case "pop": playSound("pop"); break;
      case "bounce": playSound("bounce"); break;
      case "net": playSound("net"); break;
      case "targetHit": playSound("targetHit"); break;
      case "miss": playSound("miss"); break;
      case "streak": playSound("streak"); playSound("roar"); break;
      case "launcherHit": playSound("launcherHit"); break;
      case "turbo": playSound("turbo"); break;
    }
  });
}
