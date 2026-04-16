import { Ghost, GameState } from './types';
import { T, COLS, ROWS, W, H, COLORS, MAX_LEVEL, getLevelTheme } from './constants';
import {
  initSprites, drawSprite,
  getEnemySprite, getScaredSprite, getEyesSprite,
  getGrassSprite, getPowerUpColor,
} from './sprites';
import { spawnCowTrail } from './effects';

// ============================================================
// INITIALIZE - Pre-cache all pixel art sprites
// ============================================================

export function initRenderer(): void {
  initSprites();
}


// ============================================================
// MAP - Teal walls, pixel honey drops, pixel ghee jars
// ============================================================

export function drawMap(cx: CanvasRenderingContext2D, state: GameState): void {
  const theme = getLevelTheme(state.level);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * T;
      const y = r * T;
      const t = state.map[r][c];

      // --- Walls: themed per level ---
      if (t === 1) {
        cx.strokeStyle = theme.wall;
        cx.lineWidth = 2;
        const tp = r > 0 && state.map[r - 1][c] === 1;
        const bt = r < ROWS - 1 && state.map[r + 1][c] === 1;
        const lf = c > 0 && state.map[r][c - 1] === 1;
        const rt = c < COLS - 1 && state.map[r][c + 1] === 1;
        cx.beginPath();
        if (!tp) { cx.moveTo(x, y + 1); cx.lineTo(x + T, y + 1); }
        if (!bt) { cx.moveTo(x, y + T - 1); cx.lineTo(x + T, y + T - 1); }
        if (!lf) { cx.moveTo(x + 1, y); cx.lineTo(x + 1, y + T); }
        if (!rt) { cx.moveTo(x + T - 1, y); cx.lineTo(x + T - 1, y + T); }
        cx.stroke();
      }

      // --- Anveshan Raw Honey drop — smooth glossy amber ---
      if (t === 2) {
        drawSmoothHoney(cx, x + T / 2, y + T / 2, state.frame, r + c);
      }

      // --- Anveshan A2 Ghee Jar — smooth power pellet with glow ---
      if (t === 3) {
        drawSmoothGhee(cx, x + T / 2, y + T / 2, state.frame);
      }
    }
  }

  // --- Ghost house door: themed gate ---
  cx.fillStyle = theme.ghostDoor;
  cx.fillRect(8 * T, 8 * T + T / 2 - 2, 5 * T, 4);
}


// ============================================================
// DESI COW - Pixel art hero
// Sprite changes based on movement direction
// ============================================================

// Smooth position tracking for visual interpolation.
// LERP controls how quickly the rendered cow chases the simulation's
// logical state.px/state.py. A higher value = snappier, tighter feel but
// more visible when cornering snaps occur; lower = buttery smooth but can
// look floaty. 0.65 is the sweet spot — hides the ~0.2-tile cornering
// assist snap almost completely while staying responsive to input.
let smoothPX = 10, smoothPY = 15;
const LERP = 0.65;

export function drawPacMan(cx: CanvasRenderingContext2D, state: GameState): void {
  // Lerp toward actual position for smooth rendering
  smoothPX += (state.px - smoothPX) * LERP;
  smoothPY += (state.py - smoothPY) * LERP;

  const ppx = smoothPX * T + T / 2;
  const ppy = smoothPY * T + T / 2;
  const moving = state.dx !== 0 || state.dy !== 0;

  // Spawn dust trail behind cow every 4 frames while moving
  if (moving && state.frame % 4 === 0) {
    spawnCowTrail(ppx, ppy, state.dx, state.dy);
  }

  // Invulnerability blink — skip render every other few frames
  if (state.invulnTimer > 0 && Math.floor(state.frame / 4) % 2 === 0) {
    return;
  }

  drawSmoothCow(cx, ppx, ppy, state.dx, state.dy, state.frame, 0);
}

export function resetSmoothPos(): void {
  smoothPX = 10; smoothPY = 15;
}


// ============================================================
// SMOOTH COW - Canvas curves (no pixel art)
// Cute Amul-style cartoon cow with all the cute details
// ============================================================

function drawSmoothCow(
  cx: CanvasRenderingContext2D,
  x: number, y: number,
  dx: number, dy: number,
  frame: number,
  deathProgress: number,
): void {
  const moving = dx !== 0 || dy !== 0;

  // --- Drop shadow (outside transforms so it stays flat) ---
  if (deathProgress < 0.5) {
    cx.fillStyle = `rgba(0,0,0,${0.35 * (1 - deathProgress * 2)})`;
    cx.beginPath();
    cx.ellipse(x, y + 24, 20, 4, 0, 0, Math.PI * 2);
    cx.fill();
  }

  // --- Walk animation: bounce + squash & stretch ---
  const bounce = moving ? Math.sin(frame * 0.35) * 2 : 0;
  const sq = moving ? 1 - Math.sin(frame * 0.7) * 0.07 : 1;       // vertical squash
  const st = moving ? 1 + Math.sin(frame * 0.7) * 0.05 : 1;       // horizontal stretch
  const tilt = dx * 0.1;  // lean into movement direction

  cx.save();
  cx.translate(x, y + bounce);
  cx.rotate(tilt + deathProgress * Math.PI * 4);
  cx.scale(st * (1 + deathProgress * 0.5), sq * (1 + deathProgress * 0.5));
  cx.globalAlpha = 1 - deathProgress;

  drawCowBody(cx, frame);

  cx.restore();
  cx.globalAlpha = 1;
}

// Render the cute cartoon cow at origin (0, 0)
function drawCowBody(cx: CanvasRenderingContext2D, frame: number): void {
  const OUT = '#1A1A1A';      // dark outline
  const BODY = '#FFFFFF';     // white body
  const SPOT = '#1C1C1C';     // black patches
  const GOLD = '#F2CB05';     // horns + bell + ear outline
  const PINK = '#FF5C8A';     // nose
  const TLK = '#FF6A00';      // saffron tilak

  cx.lineJoin = 'round';
  cx.lineCap = 'round';

  // --- Legs (behind body) ---
  cx.fillStyle = BODY;
  cx.strokeStyle = OUT;
  cx.lineWidth = 2;
  // Front legs
  cx.beginPath();
  cx.roundRect(-11, 14, 5, 10, 2);
  cx.fill(); cx.stroke();
  cx.beginPath();
  cx.roundRect(6, 14, 5, 10, 2);
  cx.fill(); cx.stroke();

  // --- Body / chest ---
  cx.fillStyle = BODY;
  cx.beginPath();
  cx.ellipse(0, 10, 16, 10, 0, 0, Math.PI * 2);
  cx.fill(); cx.stroke();

  // Body black patches
  cx.fillStyle = SPOT;
  cx.beginPath();
  cx.ellipse(-8, 9, 4, 3, -0.3, 0, Math.PI * 2);
  cx.fill();
  cx.beginPath();
  cx.ellipse(8, 12, 4, 2.5, 0.2, 0, Math.PI * 2);
  cx.fill();

  // --- Bell on chest (gold) ---
  cx.fillStyle = GOLD;
  cx.strokeStyle = OUT;
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.moveTo(-4, 4);
  cx.lineTo(4, 4);
  cx.lineTo(5, 10);
  cx.quadraticCurveTo(0, 12, -5, 10);
  cx.closePath();
  cx.fill(); cx.stroke();
  // Bell shine
  cx.fillStyle = 'rgba(255,255,255,0.5)';
  cx.beginPath();
  cx.ellipse(-1, 6, 1, 2, 0, 0, Math.PI * 2);
  cx.fill();
  // Bell clapper
  cx.fillStyle = OUT;
  cx.beginPath();
  cx.arc(0, 12, 1, 0, Math.PI * 2);
  cx.fill();

  // --- Head (big round) ---
  cx.fillStyle = BODY;
  cx.strokeStyle = OUT;
  cx.lineWidth = 2;
  cx.beginPath();
  cx.arc(0, -4, 14, 0, Math.PI * 2);
  cx.fill(); cx.stroke();

  // Head side patch (characteristic Amul patch)
  cx.fillStyle = SPOT;
  cx.beginPath();
  cx.ellipse(-8, -3, 5, 4, 0.3, 0, Math.PI * 2);
  cx.fill();

  // --- Ears (gold outline, pink inside) ---
  cx.fillStyle = GOLD;
  cx.strokeStyle = OUT;
  cx.beginPath();
  cx.ellipse(-14, -5, 5, 3, -0.5, 0, Math.PI * 2);
  cx.fill(); cx.stroke();
  cx.beginPath();
  cx.ellipse(14, -5, 5, 3, 0.5, 0, Math.PI * 2);
  cx.fill(); cx.stroke();
  // Inner ear pink
  cx.fillStyle = PINK;
  cx.beginPath();
  cx.ellipse(-14, -5, 2.5, 1.5, -0.5, 0, Math.PI * 2);
  cx.fill();
  cx.beginPath();
  cx.ellipse(14, -5, 2.5, 1.5, 0.5, 0, Math.PI * 2);
  cx.fill();

  // --- Horns (curved) ---
  cx.fillStyle = GOLD;
  cx.strokeStyle = OUT;
  cx.lineWidth = 1.5;
  // Left horn
  cx.beginPath();
  cx.moveTo(-7, -13);
  cx.quadraticCurveTo(-11, -19, -7, -22);
  cx.quadraticCurveTo(-5, -18, -5, -13);
  cx.closePath();
  cx.fill(); cx.stroke();
  // Right horn
  cx.beginPath();
  cx.moveTo(7, -13);
  cx.quadraticCurveTo(11, -19, 7, -22);
  cx.quadraticCurveTo(5, -18, 5, -13);
  cx.closePath();
  cx.fill(); cx.stroke();

  // --- Saffron tilak ---
  cx.fillStyle = TLK;
  cx.beginPath();
  cx.ellipse(0, -11, 1.8, 2.5, 0, 0, Math.PI * 2);
  cx.fill();
  // Tilak shine
  cx.fillStyle = 'rgba(255,255,255,0.4)';
  cx.beginPath();
  cx.arc(-0.3, -12, 0.6, 0, Math.PI * 2);
  cx.fill();

  // --- Eyes (big anime style with blink) ---
  const blinking = (frame % 180) < 6;
  cx.strokeStyle = OUT;
  cx.lineWidth = 1.5;
  if (!blinking) {
    // Eye whites
    cx.fillStyle = '#FFFFFF';
    cx.beginPath();
    cx.arc(-5, -5, 3.5, 0, Math.PI * 2);
    cx.fill(); cx.stroke();
    cx.beginPath();
    cx.arc(5, -5, 3.5, 0, Math.PI * 2);
    cx.fill(); cx.stroke();
    // Pupils
    cx.fillStyle = OUT;
    cx.beginPath();
    cx.arc(-4, -4, 2, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.arc(6, -4, 2, 0, Math.PI * 2);
    cx.fill();
    // Eye shine highlights
    cx.fillStyle = '#FFFFFF';
    cx.beginPath();
    cx.arc(-3.3, -4.7, 0.8, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.arc(6.7, -4.7, 0.8, 0, Math.PI * 2);
    cx.fill();
  } else {
    // Happy closed eyes — upward curves
    cx.strokeStyle = OUT;
    cx.lineWidth = 2;
    cx.beginPath();
    cx.arc(-5, -4, 3, Math.PI, 0);
    cx.stroke();
    cx.beginPath();
    cx.arc(5, -4, 3, Math.PI, 0);
    cx.stroke();
  }

  // --- Muzzle (pink nose area) ---
  cx.fillStyle = '#FFE8F0';
  cx.strokeStyle = OUT;
  cx.lineWidth = 1;
  cx.beginPath();
  cx.ellipse(0, 3, 6, 4, 0, 0, Math.PI * 2);
  cx.fill(); cx.stroke();

  // Nose
  cx.fillStyle = PINK;
  cx.beginPath();
  cx.ellipse(0, 2, 3, 2, 0, 0, Math.PI * 2);
  cx.fill();

  // Nostrils
  cx.fillStyle = OUT;
  cx.beginPath();
  cx.arc(-1.2, 2, 0.5, 0, Math.PI * 2);
  cx.fill();
  cx.beginPath();
  cx.arc(1.2, 2, 0.5, 0, Math.PI * 2);
  cx.fill();

  // --- Smile (happy cow) ---
  cx.strokeStyle = OUT;
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.arc(0, 5, 2.5, 0.2, Math.PI - 0.2);
  cx.stroke();
}


// ============================================================
// GRASS TUFT - Pre-rendered cache for performance
// Renders once to offscreen canvas, reuses with drawImage (fast)
// ============================================================

let honeyCache: HTMLCanvasElement | null = null;

function buildHoneyCache(): HTMLCanvasElement {
  const size = 20;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.translate(size / 2, size / 2);

  // Soft green glow
  ctx.shadowColor = 'rgba(80, 220, 100, 0.55)';
  ctx.shadowBlur = 4;

  // Three grass blades — dark stem with bright tips
  ctx.strokeStyle = '#228B22';
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';

  // Left blade
  ctx.beginPath();
  ctx.moveTo(-2.5, 3);
  ctx.quadraticCurveTo(-3.2, 0, -2.8, -3);
  ctx.stroke();

  // Center blade (tallest)
  ctx.beginPath();
  ctx.moveTo(0, 3.5);
  ctx.quadraticCurveTo(0.3, -0.5, -0.2, -4);
  ctx.stroke();

  // Right blade
  ctx.beginPath();
  ctx.moveTo(2.5, 3);
  ctx.quadraticCurveTo(3.2, 0, 2.8, -3);
  ctx.stroke();

  // Bright tips (no glow, crisp)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#7FE87F';
  ctx.beginPath();
  ctx.arc(-2.8, -3, 0.9, 0, Math.PI * 2);
  ctx.arc(-0.2, -4, 1, 0, Math.PI * 2);
  ctx.arc(2.8, -3, 0.9, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

function drawSmoothHoney(
  cx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: number,
  seed: number,
): void {
  if (!honeyCache) honeyCache = buildHoneyCache();
  // Cheap wobble via translate only (no expensive redraw)
  const wobble = Math.sin(frame * 0.08 + seed * 0.5) * 0.8;
  cx.drawImage(honeyCache, x - 10, y - 10 + wobble);
}


// ============================================================
// ANVESHAN A2 GHEE JAR - Power pellet with pulsing glow + sparkles
// ============================================================

function drawSmoothGhee(
  cx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: number,
): void {
  const OUT = '#5C3A00';
  const LID = '#8B6914';
  const LID_DARK = '#5C3A00';
  const GOLD = '#F2CB05';
  const GOLD_LIGHT = '#FFE55C';
  const GOLD_DARK = '#C8A204';

  // Breathing pulse
  const pulse = 0.85 + Math.sin(frame * 0.1) * 0.15;
  const glowRadius = 10 + Math.sin(frame * 0.1) * 3;

  cx.save();
  cx.translate(x, y);

  // --- Radiating glow aura ---
  const aura = cx.createRadialGradient(0, 0, 2, 0, 0, glowRadius);
  aura.addColorStop(0, `rgba(242, 203, 5, ${0.5 * pulse})`);
  aura.addColorStop(0.5, `rgba(242, 203, 5, ${0.2 * pulse})`);
  aura.addColorStop(1, 'rgba(242, 203, 5, 0)');
  cx.fillStyle = aura;
  cx.beginPath();
  cx.arc(0, 0, glowRadius, 0, Math.PI * 2);
  cx.fill();

  // --- Rotating sparkles (4 points) ---
  const sparkleAngle = frame * 0.05;
  for (let i = 0; i < 4; i++) {
    const a = sparkleAngle + (i * Math.PI) / 2;
    const sx = Math.cos(a) * 9;
    const sy = Math.sin(a) * 9;
    cx.fillStyle = `rgba(255, 255, 220, ${0.7 * pulse})`;
    cx.beginPath();
    cx.arc(sx, sy, 0.8, 0, Math.PI * 2);
    cx.fill();
    // Sparkle cross
    cx.strokeStyle = `rgba(255, 255, 255, ${0.5 * pulse})`;
    cx.lineWidth = 0.6;
    cx.beginPath();
    cx.moveTo(sx - 1.5, sy);
    cx.lineTo(sx + 1.5, sy);
    cx.moveTo(sx, sy - 1.5);
    cx.lineTo(sx, sy + 1.5);
    cx.stroke();
  }

  // --- Jar shadow (base depth) ---
  cx.fillStyle = 'rgba(0,0,0,0.25)';
  cx.beginPath();
  cx.ellipse(0, 6, 5, 1.2, 0, 0, Math.PI * 2);
  cx.fill();

  // --- Jar body (rounded rectangle, golden ghee inside) ---
  const bodyGrad = cx.createLinearGradient(-5, 0, 5, 0);
  bodyGrad.addColorStop(0, GOLD_DARK);
  bodyGrad.addColorStop(0.3, GOLD);
  bodyGrad.addColorStop(0.6, GOLD_LIGHT);
  bodyGrad.addColorStop(1, GOLD_DARK);
  cx.fillStyle = bodyGrad;
  cx.strokeStyle = OUT;
  cx.lineWidth = 1;
  cx.beginPath();
  cx.roundRect(-5, -3, 10, 9, 1.5);
  cx.fill(); cx.stroke();

  // --- "A2" label (dark text on gold) ---
  cx.fillStyle = OUT;
  cx.font = 'bold 4px monospace';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText('A2', 0, 1.5);
  cx.textAlign = 'left';
  cx.textBaseline = 'alphabetic';

  // --- Shine highlight on jar (left side) ---
  cx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  cx.beginPath();
  cx.roundRect(-4, -2, 1, 6, 0.5);
  cx.fill();

  // --- Jar lid (dark bronze) ---
  cx.fillStyle = LID;
  cx.strokeStyle = OUT;
  cx.beginPath();
  cx.roundRect(-5.5, -5, 11, 2.5, 1);
  cx.fill(); cx.stroke();
  // Lid shadow line
  cx.fillStyle = LID_DARK;
  cx.fillRect(-5.5, -3.2, 11, 0.5);

  // --- Lid top shine ---
  cx.fillStyle = 'rgba(255, 220, 100, 0.6)';
  cx.fillRect(-4, -4.7, 5, 0.8);

  cx.restore();
}


// ============================================================
// DEAD COW - Shrinking + fading pixel art
// ============================================================

export function drawDeadPacMan(cx: CanvasRenderingContext2D, state: GameState): void {
  const pr = 1 - (state.deadT / 50);  // 0 → 1 over death duration
  const ppx = state.px * T + T / 2;
  const ppy = state.py * T + T / 2;

  // Smooth cow with death progress — rotates, scales up, fades
  drawSmoothCow(cx, ppx, ppy, state.dx, state.dy, state.frame, pr);
}


// ============================================================
// ADULTERATED FOOD ENEMIES - Pixel art characters
//   0 = Soda Can (red)
//   1 = Chips Packet (orange)
//   2 = Candy (pink)
//   3 = Pesticide (purple)
//
// Frightened = teal scared face
// Eaten = floating eyes only
// ============================================================

export function drawGhost(cx: CanvasRenderingContext2D, g: Ghost, frightTime: number, idx: number, frame: number): void {
  const gx = g.x * T + T / 2;
  const gy = g.y * T + T / 2;

  // --- Eaten: only floating eyes returning to base ---
  if (g.eaten) {
    const eyes = getEyesSprite();
    drawSprite(cx, eyes.name, eyes.sprite, gx, gy, 2);
    return;
  }

  const flashing = g.fr && frightTime < 30 && frightTime % 10 < 5;

  // Enemy 0 = Soda Can — smooth canvas render with villain personality
  if (idx === 0) {
    if (flashing) cx.globalAlpha = 0.5;
    drawSmoothSoda(cx, gx, gy, frame, g.fr);
    cx.globalAlpha = 1;
    return;
  }

  // --- Frightened: scared teal face (flashing near end) ---
  if (g.fr) {
    if (flashing) cx.globalAlpha = 0.5;
    const scared = getScaredSprite();
    drawSprite(cx, scared.name, scared.sprite, gx, gy, 2);
    cx.globalAlpha = 1;
    return;
  }

  // --- Normal: draw the adulterated food enemy ---
  const enemy = getEnemySprite(idx);
  drawSprite(cx, enemy.name, enemy.sprite, gx, gy, 2);
}


// ============================================================
// SMOOTH SODA CAN - Canvas curves villain
// Red cylinder, angry eyes, fizz bubbles, menacing shake
// ============================================================

function drawSmoothSoda(
  cx: CanvasRenderingContext2D,
  x: number, y: number,
  frame: number,
  frightened: boolean,
): void {
  const OUT = '#1A1A1A';
  const RED = '#E63946';
  const RED_DARK = '#8B1A2A';
  const RED_SHINE = '#FF6B6B';
  const WHITE = '#FFFFFF';
  const SILVER = '#C0C0C0';
  const SILVER_DARK = '#808080';
  const FRIGHT = '#1E4D8B';
  const FRIGHT_DARK = '#0A2548';
  const FRIGHT_SHINE = '#4A8FD8';

  const bodyColor = frightened ? FRIGHT : RED;
  const bodyDark = frightened ? FRIGHT_DARK : RED_DARK;
  const bodyShine = frightened ? FRIGHT_SHINE : RED_SHINE;

  // Shake: menacing vibrate normally, frantic when scared
  const shakeX = frightened
    ? (Math.random() - 0.5) * 1.8
    : Math.sin(frame * 0.4) * 0.6;

  // --- Drop shadow ---
  cx.fillStyle = 'rgba(0,0,0,0.35)';
  cx.beginPath();
  cx.ellipse(x, y + 20, 14, 3, 0, 0, Math.PI * 2);
  cx.fill();

  cx.save();
  cx.translate(x + shakeX, y);
  cx.lineJoin = 'round';
  cx.lineCap = 'round';

  // --- Bottom ellipse (can base) ---
  cx.fillStyle = bodyDark;
  cx.strokeStyle = OUT;
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.ellipse(0, 16, 11, 3, 0, 0, Math.PI * 2);
  cx.fill(); cx.stroke();

  // --- Main body (cylinder rectangle) ---
  cx.fillStyle = bodyColor;
  cx.beginPath();
  cx.rect(-11, -16, 22, 32);
  cx.fill();

  // --- White middle label band ---
  cx.fillStyle = WHITE;
  cx.fillRect(-11, -5, 22, 11);

  // --- Left shine highlight stripe ---
  cx.fillStyle = bodyShine;
  cx.globalAlpha = 0.5;
  cx.fillRect(-9, -15, 2, 30);
  cx.globalAlpha = 1;

  // --- Body outline ---
  cx.strokeStyle = OUT;
  cx.lineWidth = 1.5;
  cx.beginPath();
  cx.moveTo(-11, -16); cx.lineTo(-11, 16);
  cx.moveTo(11, -16); cx.lineTo(11, 16);
  cx.stroke();
  // Band top/bottom lines
  cx.beginPath();
  cx.moveTo(-11, -5); cx.lineTo(11, -5);
  cx.moveTo(-11, 6); cx.lineTo(11, 6);
  cx.stroke();

  // --- Top lid (silver ellipse) ---
  cx.fillStyle = SILVER;
  cx.strokeStyle = OUT;
  cx.beginPath();
  cx.ellipse(0, -16, 11, 3, 0, 0, Math.PI * 2);
  cx.fill(); cx.stroke();
  // Inner rim
  cx.fillStyle = SILVER_DARK;
  cx.beginPath();
  cx.ellipse(0, -16, 7, 1.8, 0, 0, Math.PI * 2);
  cx.fill();
  // Pull tab
  cx.strokeStyle = SILVER_DARK;
  cx.lineWidth = 1.2;
  cx.beginPath();
  cx.arc(0, -17, 2.5, Math.PI, 0);
  cx.stroke();

  // --- Face on white band ---
  if (frightened) {
    // Scared: big whites, jittery pupils, open mouth
    cx.fillStyle = WHITE;
    cx.strokeStyle = OUT;
    cx.lineWidth = 1;
    cx.beginPath();
    cx.arc(-5, 0, 2.8, 0, Math.PI * 2);
    cx.fill(); cx.stroke();
    cx.beginPath();
    cx.arc(5, 0, 2.8, 0, Math.PI * 2);
    cx.fill(); cx.stroke();
    // Jittery pupils
    const jx = (Math.random() - 0.5) * 1.5;
    const jy = (Math.random() - 0.5) * 1.5;
    cx.fillStyle = OUT;
    cx.beginPath();
    cx.arc(-5 + jx, jy, 1.1, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.arc(5 + jx, jy, 1.1, 0, Math.PI * 2);
    cx.fill();
    // Scared open mouth
    cx.fillStyle = OUT;
    cx.beginPath();
    cx.ellipse(0, 3.5, 1.2, 1.5, 0, 0, Math.PI * 2);
    cx.fill();
  } else {
    // Angry villain: slanted eyebrows + pupils + evil grin
    cx.strokeStyle = OUT;
    cx.lineWidth = 1.8;
    // Angry eyebrows — slanted down toward nose
    cx.beginPath();
    cx.moveTo(-8, -3); cx.lineTo(-3, -1);
    cx.moveTo(8, -3); cx.lineTo(3, -1);
    cx.stroke();
    // Eye whites
    cx.fillStyle = WHITE;
    cx.lineWidth = 1;
    cx.beginPath();
    cx.arc(-5, 1, 2.3, 0, Math.PI * 2);
    cx.fill(); cx.stroke();
    cx.beginPath();
    cx.arc(5, 1, 2.3, 0, Math.PI * 2);
    cx.fill(); cx.stroke();
    // Pupils (looking forward)
    cx.fillStyle = OUT;
    cx.beginPath();
    cx.arc(-4, 1, 1.3, 0, Math.PI * 2);
    cx.fill();
    cx.beginPath();
    cx.arc(6, 1, 1.3, 0, Math.PI * 2);
    cx.fill();
    // Evil grin
    cx.strokeStyle = OUT;
    cx.lineWidth = 1.2;
    cx.beginPath();
    cx.arc(0, 3.5, 2, 0, Math.PI);
    cx.stroke();
  }

  cx.restore();

  // --- Fizz bubbles (outside transform, above can) ---
  if (!frightened) {
    for (let i = 0; i < 3; i++) {
      const phase = (frame + i * 20) % 60;
      const by = y - 18 - phase * 0.45;
      const bx = x + Math.sin((frame + i * 25) * 0.12) * 3;
      const size = 1 + (1 - phase / 60) * 1.3;
      const alpha = 1 - phase / 60;
      cx.globalAlpha = alpha * 0.85;
      cx.fillStyle = '#FFFFFF';
      cx.beginPath();
      cx.arc(bx, by, size, 0, Math.PI * 2);
      cx.fill();
      cx.strokeStyle = OUT;
      cx.lineWidth = 0.5;
      cx.stroke();
    }
    cx.globalAlpha = 1;
  }
}


// ============================================================
// POWER-UP - Glowing orb
// ============================================================

export function drawPowerUp(cx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.powerUp.active) return;
  const px = state.powerUp.x * T + T / 2;
  const py = state.powerUp.y * T + T / 2;
  const color = getPowerUpColor(state.powerUp.type);

  // Pulsing glow
  const pulse = 0.6 + Math.sin(state.frame * 0.1) * 0.4;
  cx.globalAlpha = pulse;
  cx.fillStyle = color;
  cx.shadowColor = color;
  cx.shadowBlur = 12;
  cx.beginPath();
  cx.arc(px, py, 8, 0, Math.PI * 2);
  cx.fill();
  cx.shadowBlur = 0;

  // Label
  cx.globalAlpha = 1;
  cx.fillStyle = '#FFF';
  cx.font = 'bold 7px monospace';
  cx.textAlign = 'center';
  const label = state.powerUp.type === 'speed' ? 'SPD' : state.powerUp.type === 'magnet' ? 'MAG' : 'FRZ';
  cx.fillText(label, px, py + 3);
  cx.textAlign = 'left';
}

// Active power-up indicator on HUD
export function drawPowerUpIndicator(cx: CanvasRenderingContext2D, state: GameState): void {
  if (state.powerUp.effectTimer <= 0) return;
  const color = getPowerUpColor(state.powerUp.type);
  const label = state.powerUp.type === 'speed' ? 'SPEED BOOST' : state.powerUp.type === 'magnet' ? 'MAGNET' : 'FREEZE';

  cx.fillStyle = color;
  cx.globalAlpha = 0.8;
  cx.font = 'bold 10px monospace';
  cx.textAlign = 'center';
  cx.fillText(`${label} ${Math.ceil(state.powerUp.effectTimer / 60)}s`, W / 2, 14);
  cx.textAlign = 'left';
  cx.globalAlpha = 1;
}

// ============================================================
// FRUIT BONUS - Grass tuft
// ============================================================

export function drawFruit(cx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.fruit.active) return;
  const fx = state.fruit.x * T + T / 2;
  const fy = state.fruit.y * T + T / 2;
  const grass = getGrassSprite();
  drawSprite(cx, grass.name, grass.sprite, fx, fy, 2);
}


// ============================================================
// OBJECTIVE PROGRESS - Mission HUD drawn in empty space below maze
// Shows honey collected + enemies killed progress
// ============================================================

export function drawObjectiveProgress(cx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.started || state.gameover) return;
  const honey = Math.min(state.honeyPotsEaten, state.honeyTarget);
  const kills = Math.min(state.ghostKills, state.killsTarget);
  const honeyDone = honey >= state.honeyTarget;
  const killsDone = kills >= state.killsTarget;

  const y = 21 * T + 18;
  cx.save();
  cx.font = 'bold 14px monospace';
  cx.textAlign = 'center';
  cx.shadowColor = '#000';
  cx.shadowBlur = 4;

  cx.fillStyle = honeyDone ? '#7FE87F' : COLORS.honeyDrop;
  cx.fillText(`HONEY ${honey}/${state.honeyTarget}`, W / 2 - 90, y);

  cx.fillStyle = killsDone ? '#7FE87F' : COLORS.textPrimary;
  cx.fillText(`ENEMIES ${kills}/${state.killsTarget}`, W / 2 + 90, y);

  cx.fillStyle = state.endlessMode ? '#F2CB05' : COLORS.titleSub;
  cx.font = 'bold 11px monospace';
  const levelLabel = state.endlessMode
    ? `ENDLESS ${state.level}`
    : `LEVEL ${state.level} / ${MAX_LEVEL}`;
  cx.fillText(levelLabel, W / 2, y);

  cx.restore();
  cx.textAlign = 'left';
}


// ============================================================
// OVERLAYS - Start screen, Game Over, Pause
// ============================================================

let overlayAlpha = 0;
let startScreenFrame = 0;

// Floating honey-drop particle pool for the start screen background.
// Positions are fixed; a sine offset gives the hypnotic drifting motion.
const startParticles = Array.from({ length: 18 }, (_, i) => ({
  baseX: ((i * 61) % W),
  baseY: ((i * 113) % H),
  phase: i * 0.7,
  speed: 0.005 + (i % 5) * 0.002,
  amp: 10 + (i % 4) * 6,
}));

export function drawOverlays(cx: CanvasRenderingContext2D, state: GameState): void {
  const theme = getLevelTheme(state.level);
  // --- Start Screen ---
  if (!state.started) {
    startScreenFrame++;
    overlayAlpha = Math.min(overlayAlpha + 0.03, 1);
    cx.globalAlpha = overlayAlpha;
    cx.fillStyle = theme.overlayBg;
    cx.fillRect(0, 0, W, H);

    // --- Layer 1: Floating honey drop particles (background) ---
    for (const p of startParticles) {
      const px = p.baseX + Math.sin(state.frame * p.speed + p.phase) * p.amp;
      const py = p.baseY + Math.cos(state.frame * p.speed * 0.7 + p.phase) * p.amp;
      cx.globalAlpha = overlayAlpha * (0.35 + 0.25 * Math.sin(state.frame * 0.02 + p.phase));
      drawSmoothHoney(cx, px, py, state.frame, p.phase * 10);
    }
    cx.globalAlpha = overlayAlpha;

    // --- Layer 2: Animated cow chase loop (background) ---
    // Cow runs across chasing a scared enemy — purely decorative
    const chasePeriod = 260;
    const chaseT = (startScreenFrame % chasePeriod) / chasePeriod;
    const cowCX = -60 + chaseT * (W + 120);
    const chaseCY = H / 2 + 130;
    const scared = getScaredSprite();
    cx.globalAlpha = overlayAlpha * 0.7;
    drawSprite(cx, scared.name, scared.sprite, cowCX - 60, chaseCY, 2);
    drawSmoothCow(cx, cowCX, chaseCY, 1, 0, state.frame, 0);
    cx.globalAlpha = overlayAlpha;

    // --- Layer 3: Radial gold glow behind title (pulsing breath) ---
    const glowPulse = 0.55 + Math.sin(state.frame * 0.04) * 0.15;
    const glowGrad = cx.createRadialGradient(W / 2, H / 2 - 55, 10, W / 2, H / 2 - 55, 160);
    glowGrad.addColorStop(0, `rgba(242, 203, 5, ${0.22 * glowPulse})`);
    glowGrad.addColorStop(1, 'rgba(242, 203, 5, 0)');
    cx.fillStyle = glowGrad;
    cx.fillRect(0, H / 2 - 215, W, 320);

    // --- Layer 4: Title — zoom-in + bounce entrance, then shimmer ---
    // First 28 frames: scale from 0 → 1.25, then settle to 1.0 by frame 42.
    // After that: continuous gentle float + shimmer.
    const entry = Math.min(startScreenFrame / 28, 1);
    const settle = Math.min(Math.max((startScreenFrame - 28) / 14, 0), 1);
    const baseScale = entry * 1.25 - settle * 0.25;
    const floatY = startScreenFrame > 42 ? Math.sin(state.frame * 0.03) * 3 : 0;
    const titleCX = W / 2;
    const titleCY = H / 2 - 55 + floatY;

    cx.save();
    cx.translate(titleCX, titleCY);
    cx.scale(baseScale, baseScale);
    cx.globalAlpha = overlayAlpha * entry;
    cx.fillStyle = COLORS.titleMain;
    cx.font = 'bold 32px monospace';
    cx.textAlign = 'center';
    cx.shadowColor = '#F2CB05';
    cx.shadowBlur = 18 + Math.sin(state.frame * 0.05) * 6;
    cx.fillText('ANVESHAN', 0, 0);
    // Shimmer highlight sweeping across title
    const shimmerX = ((state.frame * 3) % 260) - 130;
    const shimmerGrad = cx.createLinearGradient(shimmerX - 40, 0, shimmerX + 40, 0);
    shimmerGrad.addColorStop(0, 'rgba(255,255,255,0)');
    shimmerGrad.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = shimmerGrad;
    cx.shadowBlur = 0;
    cx.fillText('ANVESHAN', 0, 0);
    cx.restore();

    // --- Subtitle: typewriter reveal ---
    const subtitle = 'ONE STEP CLOSER TO PURITY';
    const typeStart = 35;
    const typed = Math.max(0, Math.min(subtitle.length, startScreenFrame - typeStart));
    cx.globalAlpha = overlayAlpha;
    cx.fillStyle = COLORS.titleSub;
    cx.font = '11px monospace';
    cx.textAlign = 'center';
    cx.fillText(subtitle.slice(0, typed), W / 2, titleCY + 24);

    // --- Body text (fades in after entrance) ---
    const bodyAlpha = Math.max(0, Math.min(1, (startScreenFrame - 55) / 20));
    cx.globalAlpha = overlayAlpha * bodyAlpha;
    cx.fillStyle = COLORS.honeyDrop;
    cx.font = '11px monospace';
    cx.fillText('Desi Cow vs Adulterated Food!', W / 2, H / 2 - 10);
    cx.font = '9px monospace';
    cx.fillText('Collect honey pots & eat ghee', W / 2, H / 2 + 8);
    cx.fillText('to chase away junk food!', W / 2, H / 2 + 22);

    // --- Start prompt with ripple ring ---
    const isTouch = 'ontouchstart' in window;
    const promptY = H / 2 + 52;

    // Expanding ripple ring (every ~1.5s)
    const ripplePeriod = 90;
    const rippleT = (startScreenFrame % ripplePeriod) / ripplePeriod;
    const rippleR = 20 + rippleT * 80;
    const rippleAlpha = (1 - rippleT) * 0.5;
    cx.globalAlpha = overlayAlpha * rippleAlpha * bodyAlpha;
    cx.strokeStyle = COLORS.titleMain;
    cx.lineWidth = 2;
    cx.beginPath();
    cx.arc(W / 2, promptY - 4, rippleR, 0, Math.PI * 2);
    cx.stroke();

    // Blinking start prompt text
    const blink = Math.sin(state.frame * 0.08) * 0.5 + 0.5;
    cx.globalAlpha = overlayAlpha * blink * bodyAlpha;
    cx.fillStyle = COLORS.textPrimary;
    cx.font = 'bold 13px monospace';
    cx.fillText(isTouch ? 'TAP START OR D-PAD' : 'PRESS SPACE TO START', W / 2, promptY);

    // Control hints
    cx.globalAlpha = overlayAlpha * bodyAlpha;
    cx.fillStyle = theme.textMuted;
    cx.font = '9px monospace';
    cx.fillText(isTouch ? 'SWIPE or D-PAD = Move' : 'ARROW KEYS / WASD = Move', W / 2, H / 2 + 80);
    cx.fillText(isTouch ? 'TAP PAUSE = Pause' : 'SPACE = Pause', W / 2, H / 2 + 96);
    cx.textAlign = 'left';
    cx.globalAlpha = 1;
  } else {
    overlayAlpha = 0;
    startScreenFrame = 0;
  }

  // --- Game Over — HTML modal renders the real UI; just dim the canvas ---
  if (state.gameover && state.goT <= 0) {
    cx.fillStyle = theme.overlayBg;
    cx.fillRect(0, 0, W, H);
  }

  // --- Cut-scene between levels ---
  if (state.cutscene) {
    cx.fillStyle = theme.overlayBg;
    cx.fillRect(0, 0, W, H);

    // Cow chasing ghost across screen
    const progress = 1 - (state.cutsceneT / 120);
    const cowX = -40 + progress * (W + 80);
    const ghostX = cowX - 60;
    const cy = H / 2 + 10;

    // Draw ghost running away
    const scared = getScaredSprite();
    drawSprite(cx, scared.name, scared.sprite, ghostX, cy, 2);

    // Draw smooth cow chasing
    drawSmoothCow(cx, cowX, cy, 1, 0, state.frame, 0);

    // Level text — special banner when transitioning into endless mode
    const unlockingEndless = state.level === MAX_LEVEL && !state.endlessMode;
    cx.fillStyle = COLORS.titleMain;
    cx.font = 'bold 20px monospace';
    cx.textAlign = 'center';
    cx.shadowColor = '#F2CB05';
    cx.shadowBlur = 10;
    const bannerTitle = unlockingEndless
      ? 'ENDLESS UNLOCKED'
      : `LEVEL ${state.level + 1}`;
    cx.fillText(bannerTitle, W / 2, H / 2 - 40);
    cx.shadowBlur = 0;

    cx.fillStyle = COLORS.titleSub;
    cx.font = '11px monospace';
    cx.fillText(unlockingEndless ? 'Survive as long as you can!' : 'Get ready!', W / 2, H / 2 - 20);
    cx.textAlign = 'left';
  }

  // --- Paused ---
  if (state.paused) {
    cx.fillStyle = theme.overlayBg;
    cx.fillRect(0, 0, W, H);
    cx.fillStyle = COLORS.titleMain;
    cx.font = 'bold 22px monospace';
    cx.textAlign = 'center';
    cx.shadowColor = '#F2CB05';
    cx.shadowBlur = 10;
    cx.fillText('PAUSED', W / 2, H / 2);
    cx.shadowBlur = 0;
    cx.font = '11px monospace';
    cx.fillStyle = COLORS.textPrimary;
    cx.fillText('Press SPACE to resume', W / 2, H / 2 + 28);
    cx.textAlign = 'left';
  }
}


// ============================================================
// LIVES - Cow emoji display
// ============================================================

export function drawLivesEmoji(lives: number): string {
  let html = '';
  for (let i = 0; i < lives; i++) {
    html += '<span style="margin:0 1px;font-size:14px">🐄</span>';
  }
  return html;
}
