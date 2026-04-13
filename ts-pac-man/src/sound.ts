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
