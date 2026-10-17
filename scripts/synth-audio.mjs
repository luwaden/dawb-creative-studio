/**
 * Synthesises DAWB's built-in sound library (royalty-free, generated from code):
 * sound effects for logo stings and transitions, plus short music beds.
 *   node scripts/synth-audio.mjs   → public/audio/*.mp3   (needs ffmpeg on PATH)
 * The generated MP3s are committed, so end users never need to run this.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SR = 44100;
const OUT = path.join(process.cwd(), "public", "audio");
fs.mkdirSync(OUT, { recursive: true });

let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const clamp = (x) => Math.max(-1, Math.min(1, x));
const buf = (sec) => [new Float32Array(Math.ceil(sec * SR)), new Float32Array(Math.ceil(sec * SR))];
const env = (t, a, d, total) => (t < a ? t / a : Math.max(0, 1 - (t - a) / Math.max(1e-4, d))) * (t <= total ? 1 : 0);
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

function writeWav(name, [L, R], gain = 0.9) {
  let peak = 1e-6;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const k = gain / peak;
  const data = Buffer.alloc(L.length * 4);
  for (let i = 0; i < L.length; i++) {
    data.writeInt16LE(Math.round(clamp(L[i] * k) * 32767), i * 4);
    data.writeInt16LE(Math.round(clamp(R[i] * k) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
  const wav = path.join(OUT, `${name}.wav`);
  fs.writeFileSync(wav, Buffer.concat([h, data]));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "160k", path.join(OUT, `${name}.mp3`)]);
  fs.rmSync(wav);
  console.log("wrote", name);
}

/** One-pole low-pass with a time-varying cutoff (Hz) — for whooshes and risers. */
function filteredNoise(sec, cutoffAt, ampAt, pan = () => 0) {
  const [L, R] = buf(sec);
  let y = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const a = 1 - Math.exp((-2 * Math.PI * cutoffAt(t)) / SR);
    y += a * (rnd() - y);
    const s = y * ampAt(t);
    const p = pan(t);
    L[i] = s * (1 - Math.max(0, p));
    R[i] = s * (1 + Math.min(0, p));
  }
  return [L, R];
}

function addTone(out, start, { freq, dur, amp = 0.5, attack = 0.005, type = "sine", glide = 0, pan = 0, decayCurve = 3 }) {
  const [L, R] = out;
  const s0 = Math.floor(start * SR);
  let ph = 0;
  for (let i = 0; i < dur * SR && s0 + i < L.length; i++) {
    const t = i / SR;
    const f = freq * (1 + glide * (t / dur));
    ph += (2 * Math.PI * f) / SR;
    let w = Math.sin(ph);
    if (type === "tri") w = (2 / Math.PI) * Math.asin(Math.sin(ph));
    if (type === "saw") w = ((ph / Math.PI) % 2) - 1;
    if (type === "bell") w = Math.sin(ph) + 0.45 * Math.sin(ph * 2.76) * Math.exp(-t * 6) + 0.25 * Math.sin(ph * 5.4) * Math.exp(-t * 10);
    const e = (t < attack ? t / attack : 1) * Math.exp(-decayCurve * (t / dur));
    L[s0 + i] += w * e * amp * (1 - Math.max(0, pan));
    R[s0 + i] += w * e * amp * (1 + Math.min(0, pan));
  }
}

function addNoiseHit(out, start, { dur, amp = 0.4, cutoff = 4000 }) {
  const [L, R] = out;
  const s0 = Math.floor(start * SR);
  let y = 0;
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  for (let i = 0; i < dur * SR && s0 + i < L.length; i++) {
    const t = i / SR;
    y += a * (rnd() - y);
    const e = Math.exp(-t / (dur / 5));
    L[s0 + i] += y * e * amp;
    R[s0 + i] += y * e * amp;
  }
}

/** Simple stereo reverb: a few feedback comb taps. */
function reverb([L, R], mix = 0.25, size = 0.08) {
  const taps = [size, size * 1.37, size * 1.71, size * 2.13].map((s) => Math.floor(s * SR));
  const oL = new Float32Array(L), oR = new Float32Array(R);
  for (const [k, d] of taps.entries()) {
    const g = 0.55 - k * 0.08;
    for (let i = d; i < L.length; i++) {
      oL[i] += oR[i - d] * g * mix;
      oR[i] += oL[i - d] * g * mix;
    }
  }
  return [oL, oR];
}

// ───────────── sound effects ─────────────
writeWav("whoosh", filteredNoise(1.1, (t) => 300 + 5200 * Math.sin(Math.PI * Math.min(1, t / 1.0)), (t) => Math.pow(Math.sin(Math.PI * Math.min(1, t / 1.05)), 1.6), (t) => -0.8 + 1.6 * (t / 1.1)), 0.8);

{
  const o = buf(1.6);
  addTone(o, 0, { freq: 62, dur: 1.3, amp: 1, glide: -0.35, decayCurve: 4 });
  addTone(o, 0, { freq: 124, dur: 0.4, amp: 0.4, decayCurve: 6 });
  addNoiseHit(o, 0, { dur: 0.35, amp: 0.6, cutoff: 2500 });
  writeWav("impact", reverb(o, 0.3, 0.06), 0.95);
}

{
  const o = buf(0.25);
  addNoiseHit(o, 0, { dur: 0.03, amp: 0.8, cutoff: 9000 });
  addTone(o, 0, { freq: 1800, dur: 0.05, amp: 0.5, decayCurve: 8 });
  writeWav("click", o, 0.7);
}

{
  const o = buf(2.6);
  [84, 88, 91, 96, 100, 103].forEach((n, i) => addTone(o, i * 0.07, { freq: midi(n), dur: 2.2, amp: 0.25, type: "bell", pan: i % 2 ? 0.5 : -0.5, decayCurve: 3 }));
  writeWav("shimmer", reverb(o, 0.45, 0.09), 0.8);
}

writeWav("riser", (() => {
  const n = filteredNoise(2.2, (t) => 200 + 7000 * Math.pow(t / 2.2, 2), (t) => Math.pow(t / 2.2, 2.2));
  addTone(n, 0, { freq: 110, dur: 2.2, amp: 0.25, glide: 2, type: "saw", attack: 2, decayCurve: 0 });
  return n;
})(), 0.75);

{
  const o = buf(0.4);
  addTone(o, 0, { freq: 520, dur: 0.25, amp: 0.8, glide: 0.9, decayCurve: 7 });
  writeWav("pop", o, 0.7);
}

{
  const o = buf(1.8);
  [96, 100, 103, 108].forEach((n, i) => addTone(o, i * 0.11, { freq: midi(n), dur: 1.4, amp: 0.3, type: "bell", pan: (i - 1.5) / 2 }));
  writeWav("chime", reverb(o, 0.4, 0.1), 0.8);
}

{
  // digital glitch: stuttered square blips
  const o = buf(0.7);
  for (let k = 0; k < 9; k++) addTone(o, k * 0.06, { freq: 300 + ((k * 137) % 900), dur: 0.035, amp: 0.4, type: "saw", decayCurve: 2 });
  addNoiseHit(o, 0.3, { dur: 0.15, amp: 0.35, cutoff: 7000 });
  writeWav("glitch", o, 0.65);
}

// ───────────── music beds ─────────────
function drumKit(o, bpm, bars, { hats = true, clapOn = [1, 3] } = {}) {
  const beat = 60 / bpm;
  for (let b = 0; b < bars * 4; b++) {
    const t = b * beat;
    addTone(o, t, { freq: 58, dur: 0.35, amp: 0.9, glide: -0.5, decayCurve: 6 });
    if (clapOn.includes(b % 4)) addNoiseHit(o, t, { dur: 0.18, amp: 0.35, cutoff: 3500 });
    if (hats) [0.5].forEach((off) => addNoiseHit(o, t + off * beat, { dur: 0.05, amp: 0.18, cutoff: 9000 }));
  }
}

function chordPad(o, start, notes, dur, amp = 0.12) {
  notes.forEach((n, i) => {
    addTone(o, start, { freq: midi(n), dur, amp, type: "tri", attack: 0.6, decayCurve: 0.8, pan: (i - 1.5) / 3 });
    addTone(o, start, { freq: midi(n) * 1.004, dur, amp: amp * 0.6, type: "tri", attack: 0.8, decayCurve: 0.8, pan: -(i - 1.5) / 3 });
  });
}

{
  // "Pulse" — focused tech bed, 104 bpm, 16 bars (~37 s)
  const bpm = 104, bars = 16, beat = 60 / bpm;
  const o = buf(bars * 4 * beat + 2);
  drumKit(o, bpm, bars);
  const prog = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]];
  for (let bar = 0; bar < bars; bar++) {
    const ch = prog[bar % 4];
    chordPad(o, bar * 4 * beat, ch, 4 * beat, 0.09);
    for (let s = 0; s < 8; s++) addTone(o, bar * 4 * beat + s * beat / 2, { freq: midi(ch[0] - 12), dur: beat / 2, amp: 0.28, type: "saw", decayCurve: 5 });
    for (let s = 0; s < 4; s++) addTone(o, bar * 4 * beat + s * beat + beat * 0.75, { freq: midi(ch[(s + bar) % 4] + 12), dur: 0.25, amp: 0.1, type: "bell", decayCurve: 4 });
  }
  writeWav("music-pulse", reverb(o, 0.2, 0.07), 0.85);
}

{
  // "Ambient" — slow evolving pad (~32 s)
  const o = buf(33);
  const prog = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]];
  for (let k = 0; k < 8; k++) chordPad(o, k * 4, prog[k % 4], 6, 0.13);
  for (let k = 0; k < 24; k++) addTone(o, k * 1.33 + 0.4, { freq: midi(74 + [0, 3, 7, 10, 12][k % 5]), dur: 2, amp: 0.06, type: "bell", pan: k % 2 ? 0.6 : -0.6 });
  writeWav("music-ambient", reverb(o, 0.5, 0.11), 0.8);
}

{
  // "Festive" — sleigh-bell sparkle + bell melody, 120 bpm (~32 s)
  const bpm = 120, beat = 0.5, bars = 16;
  const o = buf(bars * 2 + 2);
  const melody = [76, 76, 76, 0, 76, 76, 76, 0, 76, 79, 72, 74, 76, 0, 0, 0, 77, 77, 77, 77, 77, 76, 76, 76, 76, 74, 74, 76, 74, 0, 79, 0];
  for (let i = 0; i < bars * 4; i++) {
    addNoiseHit(o, i * beat, { dur: 0.08, amp: 0.12, cutoff: 11000 });
    addNoiseHit(o, i * beat + beat / 2, { dur: 0.06, amp: 0.08, cutoff: 11000 });
    const n = melody[i % melody.length];
    if (n) addTone(o, i * beat, { freq: midi(n), dur: 0.9, amp: 0.22, type: "bell" });
    if (i % 4 === 0) addTone(o, i * beat, { freq: midi([48, 53, 55, 48][(i / 4) % 4]), dur: 1.8, amp: 0.3, type: "tri", decayCurve: 2 });
  }
  for (let bar = 0; bar < bars; bar++) chordPad(o, bar * 2, [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]][bar % 4], 2.2, 0.07);
  writeWav("music-festive", reverb(o, 0.3, 0.08), 0.85);
  void bpm;
}

{
  // "Celebrate" — bright four-on-the-floor, 118 bpm (~33 s)
  const bpm = 118, bars = 16, beat = 60 / bpm;
  const o = buf(bars * 4 * beat + 2);
  drumKit(o, bpm, bars, { clapOn: [1, 3] });
  const prog = [[60, 64, 67, 72], [57, 60, 64, 69], [65, 69, 72, 77], [67, 71, 74, 79]];
  for (let bar = 0; bar < bars; bar++) {
    const ch = prog[bar % 4];
    for (let s = 0; s < 8; s++) {
      if (s % 2 === 1) ch.slice(0, 3).forEach((n) => addTone(o, bar * 4 * beat + s * beat / 2, { freq: midi(n), dur: beat / 2.2, amp: 0.1, type: "saw", decayCurve: 6 }));
      addTone(o, bar * 4 * beat + s * beat / 2, { freq: midi(ch[0] - 24), dur: beat / 2, amp: 0.3, type: "tri", decayCurve: 3 });
    }
    addTone(o, bar * 4 * beat, { freq: midi(ch[3] + 12), dur: beat * 1.5, amp: 0.12, type: "bell" });
  }
  writeWav("music-celebrate", reverb(o, 0.22, 0.07), 0.85);
}
