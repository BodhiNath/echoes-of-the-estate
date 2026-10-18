// Tiny WebAudio synth + haptics. No audio files to download.
import { S } from './state.js';

let ctx = null;
function ac() {
  if (!S.settings.sound) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq, { dur = 0.12, type = 'sine', gain = 0.18, at = 0 } = {}) {
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

export function buzz(pattern) {
  if (!S.settings.haptics) return;
  try { navigator.vibrate && navigator.vibrate(pattern); } catch { /* unsupported */ }
}

export const sfx = {
  tap()        { tone(420, { dur: 0.05, type: 'triangle', gain: 0.08 }); },
  spawn()      { tone(620, { dur: 0.07, type: 'triangle', gain: 0.1 }); },
  // Pitch rises with the tier produced: tier 2 → C5, tier 5 → high.
  merge(tier)  {
    const base = [0, 523, 659, 784, 988, 1175][Math.min(5, tier)] || 523;
    tone(base, { dur: 0.16 });
    tone(base * 1.5, { dur: 0.2, at: 0.05, gain: 0.12 });
    buzz(tier >= 4 ? [20, 30, 40] : 15);
  },
  deliver()    { tone(784, { dur: 0.12 }); tone(1047, { dur: 0.25, at: 0.1 }); buzz([10, 20, 30]); },
  fanfare()    { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, { dur: 0.3, at: i * 0.09, gain: 0.16 })); buzz([30, 40, 30, 40, 80]); },
  deny()       { tone(160, { dur: 0.15, type: 'square', gain: 0.06 }); buzz(40); },
  wire()       { tone(300 + Math.random() * 60, { dur: 0.04, type: 'triangle', gain: 0.05 }); },
  connect()    { tone(880, { dur: 0.15 }); buzz(12); },
};
