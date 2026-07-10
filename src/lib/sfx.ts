import { useApp } from "../store/useApp";

// Chiptune feedback for interactions: tiny blips synthesized on the fly with
// WebAudio (no audio assets, no dependencies, no licensing) paired with
// navigator.vibrate micro-haptics. Sound and haptics are gated independently
// on the preferences slice, so the Settings toggles are pure wiring over this
// module. Everything is lazily created on the first interaction to respect the
// browser autoplay policy: a context made before a user gesture starts
// suspended, and the click that triggers a blip resumes it.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Note = { freq: number; start: number; dur: number };

function play(notes: Note[]) {
  if (!useApp.getState().prefs.soundOn) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  for (const note of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    // Square wave for the retro pixel timbre; a quick attack and exponential
    // decay reads as a soft blip rather than a click or a sustained tone.
    osc.type = "square";
    osc.frequency.value = note.freq;
    const t0 = now + note.start;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + note.dur + 0.02);
  }
}

function vibrate(pattern: number | number[]) {
  if (!useApp.getState().prefs.hapticsOn) return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

// A single sine that glides between two frequencies: a rounder, bubblier voice
// than the square blips, used for the nav tap.
function slide(from: number, to: number, glide: number, dur: number) {
  if (!useApp.getState().prefs.soundOn) return;
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + glide);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

// A small palette of voices. Each pairs a blip with a matching haptic so a
// single call gives both halves of the feedback.
export const sfx = {
  /** Tab switch: a quick upward "pop" glide, like a bubble. */
  tap: () => {
    slide(420, 1000, 0.055, 0.09);
    vibrate(6);
  },
  /** Jelly button press: a quick two-note bounce. */
  press: () => {
    play([
      { freq: 587, start: 0, dur: 0.05 },
      { freq: 880, start: 0.04, dur: 0.06 },
    ]);
    vibrate(10);
  },
  /** Something added or toggled on: a rising pop. */
  pop: () => {
    play([
      { freq: 784, start: 0, dur: 0.05 },
      { freq: 1047, start: 0.05, dur: 0.07 },
    ]);
    vibrate(8);
  },
  /** A date completed or a save landed: a little major arpeggio. */
  success: () => {
    play([
      { freq: 523, start: 0, dur: 0.06 },
      { freq: 659, start: 0.06, dur: 0.06 },
      { freq: 784, start: 0.12, dur: 0.06 },
      { freq: 1047, start: 0.18, dur: 0.1 },
    ]);
    vibrate([12, 24, 12]);
  },
  /** Something went wrong: a low, blunt descending buzz. */
  error: () => {
    play([
      { freq: 220, start: 0, dur: 0.09 },
      { freq: 165, start: 0.09, dur: 0.12 },
    ]);
    vibrate([20, 40, 20]);
  },
};
