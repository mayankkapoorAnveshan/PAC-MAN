// ============================================================
// VISUAL EFFECTS - Screen shake, particles, transitions
// ============================================================

import { T } from './constants';

// ============================================================
// SCREEN SHAKE
// ============================================================

let shakeTime = 0;
let shakeIntensity = 0;

export function triggerShake(duration: number = 25, intensity: number = 6): void {
  shakeTime = duration;
  shakeIntensity = intensity;
}

export function applyShake(cx: CanvasRenderingContext2D): void {
  if (shakeTime > 0) {
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    cx.translate(dx, dy);
    shakeTime--;
  }
}

export function resetShake(cx: CanvasRenderingContext2D): void {
  cx.setTransform(1, 0, 0, 1, 0, 0);
}

// ============================================================
// SCREEN FLASH - full-canvas color pulse for juice (eat ghost, pot, etc)
// ============================================================

let flashColor: string = '#ffffff';
let flashAlpha: number = 0;
const FLASH_DECAY = 0.08;

export function triggerFlash(color: string, intensity: number = 0.35): void {
  flashColor = color;
  flashAlpha = Math.max(flashAlpha, intensity);
}

export function drawScreenFlash(cx: CanvasRenderingContext2D, w: number, h: number): void {
  if (flashAlpha <= 0) return;
  cx.save();
  cx.globalAlpha = flashAlpha;
  cx.fillStyle = flashColor;
  cx.fillRect(0, 0, w, h);
  cx.restore();
  flashAlpha = Math.max(0, flashAlpha - FLASH_DECAY);
}

// Helper: safe haptic vibration with feature detection
export function haptic(ms: number): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(ms); } catch { /* blocked */ }
  }
}

// ============================================================
// PARTICLES
// ============================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const particles: Particle[] = [];

// Trail dust particles behind the moving cow — saffron/gold ground puffs
export function spawnCowTrail(x: number, y: number, dx: number, dy: number): void {
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: x - dx * 10 + (Math.random() - 0.5) * 6,
      y: y + 18 - dy * 8 + (Math.random() - 0.5) * 3,
      vx: -dx * 0.4 + (Math.random() - 0.5) * 0.4,
      vy: -dy * 0.4 - 0.2 - Math.random() * 0.3,
      life: 12 + Math.random() * 8,
      maxLife: 20,
      color: Math.random() < 0.5 ? 'rgba(242, 203, 5, 0.7)' : 'rgba(255, 200, 100, 0.6)',
      size: 1.5 + Math.random() * 1.5,
    });
  }
}


// Big death explosion — rings of white + gold shrapnel
export function spawnDeathExplosion(x: number, y: number): void {
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 25 + Math.random() * 20,
      maxLife: 45,
      color: i % 3 === 0 ? '#F2CB05' : i % 3 === 1 ? '#FFFFFF' : '#FF5C8A',
      size: 2 + Math.random() * 3,
    });
  }
}

export function spawnDotParticles(tileX: number, tileY: number): void {
  const px = tileX * T + T / 2;
  const py = tileY * T + T / 2;
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 2;
    particles.push({
      x: px, y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 15 + Math.random() * 10,
      maxLife: 25,
      color: '#F2A900',
      size: 2,
    });
  }
}

export function spawnGhostExplosion(tileX: number, tileY: number, color: string): void {
  const px = tileX * T + T / 2;
  const py = tileY * T + T / 2;
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x: px, y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 20 + Math.random() * 15,
      maxLife: 35,
      color: i % 2 === 0 ? color : '#FFFFFF',
      size: 2 + Math.random() * 3,
    });
  }
}

export function spawnPowerUpBurst(tileX: number, tileY: number): void {
  const px = tileX * T + T / 2;
  const py = tileY * T + T / 2;
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      x: px, y: py,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 25 + Math.random() * 15,
      maxLife: 40,
      color: i % 3 === 0 ? '#F2CB05' : i % 3 === 1 ? '#FFD700' : '#FFF',
      size: 3 + Math.random() * 2,
    });
  }
}

export function updateAndDrawParticles(cx: CanvasRenderingContext2D): void {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = p.life / p.maxLife;
    cx.globalAlpha = alpha;
    cx.fillStyle = p.color;
    cx.beginPath();
    cx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    cx.fill();
  }
  cx.globalAlpha = 1;
}

// ============================================================
// SCORE POPUP - floating score text
// ============================================================

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  life: number;
}

const popups: ScorePopup[] = [];

export function spawnScorePopup(tileX: number, tileY: number, score: number): void {
  popups.push({
    x: tileX * T + T / 2,
    y: tileY * T + T / 2,
    text: String(score),
    life: 40,
  });
}

export function updateAndDrawPopups(cx: CanvasRenderingContext2D): void {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y -= 0.8;
    p.life--;

    if (p.life <= 0) {
      popups.splice(i, 1);
      continue;
    }

    cx.globalAlpha = p.life / 40;
    cx.fillStyle = '#FFFFFF';
    cx.font = 'bold 12px monospace';
    cx.textAlign = 'center';
    cx.fillText(p.text, p.x, p.y);
    cx.textAlign = 'left';
  }
  cx.globalAlpha = 1;
}

// ============================================================
// COMBO BANNER - Big centered "SWEET!" / "DELICIOUS!" text
// Uses a scale-in bounce and slow fade for a Candy-Crush-y punch.
// Only one banner is active at a time — newer combos replace older.
// ============================================================

interface ComboBanner {
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

let comboBanner: ComboBanner | null = null;

export function spawnComboBanner(text: string, color: string = '#F2CB05'): void {
  comboBanner = { text, color, life: 70, maxLife: 70 };
}

export function updateAndDrawComboBanner(
  cx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  if (!comboBanner) return;
  comboBanner.life--;
  if (comboBanner.life <= 0) { comboBanner = null; return; }

  const t = comboBanner.life / comboBanner.maxLife;
  // Scale-in bounce: starts at 0.3, overshoots to 1.15, settles at 1.0
  const progress = 1 - t;
  let scale: number;
  if (progress < 0.2) {
    scale = 0.3 + (progress / 0.2) * 0.85; // 0.3 → 1.15
  } else if (progress < 0.35) {
    scale = 1.15 - ((progress - 0.2) / 0.15) * 0.15; // 1.15 → 1.0
  } else {
    scale = 1.0;
  }

  const alpha = t < 0.3 ? t / 0.3 : 1; // fade out in last 30% of life

  cx.save();
  cx.globalAlpha = alpha;
  cx.translate(w / 2, h / 2 - 30);
  cx.scale(scale, scale);
  cx.font = 'bold 32px monospace';
  cx.textAlign = 'center';
  cx.shadowColor = comboBanner.color;
  cx.shadowBlur = 24;
  cx.fillStyle = comboBanner.color;
  cx.fillText(comboBanner.text, 0, 0);
  cx.shadowBlur = 0;
  // White core for extra punch
  cx.fillStyle = '#FFFFFF';
  cx.globalAlpha = alpha * 0.7;
  cx.font = 'bold 30px monospace';
  cx.fillText(comboBanner.text, 0, 0);
  cx.restore();
  cx.textAlign = 'left';
  cx.globalAlpha = 1;
}
