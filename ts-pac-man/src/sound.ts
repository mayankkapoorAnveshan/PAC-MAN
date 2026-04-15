// ============================================================
// SOUND EFFECTS - Web Audio API synthesized sounds
// No external files needed - all generated procedurally
// ============================================================

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume: number = 0.15): void {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (_) { /* ignore audio errors */ }
}

export function playEatDot(): void {
  playTone(600, 0.08, 'sine', 0.1);
}

export function playEatGhee(): void {
  getCtx();
  playTone(200, 0.3, 'square', 0.12);
  setTimeout(() => playTone(300, 0.3, 'square', 0.12), 80);
  setTimeout(() => playTone(400, 0.3, 'square', 0.12), 160);
}

export function playEatGhost(): void {
  playTone(800, 0.1, 'sawtooth', 0.12);
  setTimeout(() => playTone(1200, 0.15, 'sawtooth', 0.12), 60);
}

export function playDeath(): void {
  const steps = [400, 350, 300, 250, 200, 150, 100];
  steps.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'square', 0.12), i * 120);
  });
}

export function playLevelComplete(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'sine', 0.15), i * 150);
  });
}

export function playFruitEat(): void {
  playTone(500, 0.1, 'sine', 0.12);
  setTimeout(() => playTone(700, 0.1, 'sine', 0.12), 50);
  setTimeout(() => playTone(1000, 0.2, 'sine', 0.15), 100);
}

// ============================================================
// COMBO AUDIO — Candy-Crush-style rewarding chime + voice line
// Plays when player chains 2+ ghost kills in one fright window.
// Tier 1 = 2x combo → Sweet C-E-G triad
// Tier 2 = 3x combo → Brighter C-E-G-C four-note arpeggio
// Tier 3 = 4x combo → Full progression + higher voice pitch
// ============================================================

const COMBO_VOICES = ['Sweet!', 'Delicious!', 'Divine!', 'Unstoppable!'];

export function playComboChime(tier: number): void {
  // Chord progressions — mapped to satisfying major thirds / perfect fifths
  const tones: [number, number][] = [
    // [frequency Hz, delay ms]
    [523, 0],    // C5
    [659, 60],   // E5
    [784, 120],  // G5
  ];
  if (tier >= 2) tones.push([1047, 180]); // C6
  if (tier >= 3) tones.push([1319, 240]); // E6

  const dur = 0.35;
  const vol = 0.12 + tier * 0.02;
  for (const [freq, delay] of tones) {
    setTimeout(() => playTone(freq, dur, 'triangle', vol), delay);
  }
}

export function playComboVoice(tier: number): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const idx = Math.min(tier, COMBO_VOICES.length - 1);
    const utter = new SpeechSynthesisUtterance(COMBO_VOICES[idx]);
    utter.rate = 1.25;
    utter.pitch = 1.2 + tier * 0.2; // higher pitch for bigger combos
    utter.volume = 0.9;
    speechSynthesis.cancel(); // kill any queued utterance so tiers don't overlap
    speechSynthesis.speak(utter);
  } catch (_) { /* ignore */ }
}
