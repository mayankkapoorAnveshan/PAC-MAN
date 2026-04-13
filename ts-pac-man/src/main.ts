import { W, H } from './constants';
import { createInitialState, doStart, doRestart, drawLives, gameLoop } from './game';
import { setupInput } from './input';
import { initRenderer } from './renderer';
import { getLeaderboard } from './leaderboard';

initRenderer();

const cv = document.getElementById('cv') as HTMLCanvasElement;
cv.width = W;     // internal resolution (crisp rendering)
cv.height = H;
const cx = cv.getContext('2d') as CanvasRenderingContext2D;

// ============================================================
// RESPONSIVE CANVAS SIZING
// Canvas internal resolution stays 588×644 (crisp pixel rendering).
// CSS dimensions are calculated to fit the viewport while preserving
// the game's aspect ratio. We measure the actual chrome (header + HUD
// + lives bar + optional d-pad) and give the canvas ALL remaining space.
// ============================================================
function resizeCanvas(): void {
  // Measure every fixed UI element that eats vertical space
  const headerH = (document.getElementById('hdr')?.offsetHeight ?? 0);
  const hudH = (document.getElementById('hud')?.offsetHeight ?? 0);
  const bottomH = (document.getElementById('bottomUI')?.offsetHeight ?? 0);
  const dpadEl = document.getElementById('dpad');
  const dpadVisible = dpadEl && getComputedStyle(dpadEl).display !== 'none';
  const dpadH = dpadVisible ? (dpadEl?.offsetHeight ?? 0) : 0;

  // Tight buffer: only 24px total for margins/borders — previously 60 (wasted space)
  // This is Option B: compact chrome, bigger canvas
  const chrome = headerH + hudH + bottomH + dpadH + 24;

  // Available area = viewport minus chrome and a small horizontal gutter
  const availW = window.innerWidth - 8;   // 8px side breathing room
  const availH = window.innerHeight - chrome;

  const aspect = W / H;

  // Start with width-constrained fit
  let cssW = Math.min(availW, W);
  let cssH = cssW / aspect;

  // If that overflows height, switch to height-constrained fit
  if (cssH > availH) {
    cssH = Math.max(availH, 200);  // never go below 200px tall
    cssW = cssH * aspect;
  }

  cv.style.width = `${Math.floor(cssW)}px`;
  cv.style.height = `${Math.floor(cssH)}px`;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
// Delay orientation change to let browser settle on new dimensions
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

const scE = document.getElementById('sc') as HTMLElement;
const hiE = document.getElementById('hi') as HTMLElement;
const lvE = document.getElementById('lv') as HTMLElement;
const livE = document.getElementById('lives') as HTMLElement;
const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;

const state = createInitialState();
hiE.textContent = String(state.hi);

function onStart(): void {
  doStart(state, lvE, livE);
  startBtn.classList.add('hidden');
}

function onRestart(): void {
  doRestart(state, lvE, livE);
  startBtn.classList.add('hidden');
}

// ============================================================
// TOP LEADERBOARD PANEL
// Populates the mobile top panel with the top-5 scores from
// localStorage. Re-renders whenever a new game ends.
// ============================================================
const tbList = document.getElementById('tbList') as HTMLElement | null;
const topBoard = document.getElementById('topBoard') as HTMLElement | null;

function renderLeaderboardPanel(): void {
  if (!tbList || !topBoard) return;
  const board = getLeaderboard();
  if (board.length === 0) {
    // Empty state — prompt user to play
    topBoard.classList.add('empty');
    tbList.innerHTML = '<div class="tbEntry">Play to set your first score!</div>';
    return;
  }
  topBoard.classList.remove('empty');
  // Render each entry as a small chip: #1 1250 (L3)
  tbList.innerHTML = board.map((entry, i) => {
    const rankClass = i === 0 ? 'tbEntry rank1' : 'tbEntry';
    return `<div class="${rankClass}"><span class="rank">#${i + 1}</span>${entry.score} <span style="opacity:0.7">L${entry.level}</span></div>`;
  }).join('');
}
renderLeaderboardPanel();

// Show start button again on game over (for mobile) + refresh leaderboard
let prevGameOver = false;
function watchGameOver(): void {
  if (state.gameover && state.goT <= 0) {
    startBtn.textContent = 'TAP TO RETRY';
    startBtn.classList.remove('hidden');
    // Refresh leaderboard once when we enter post-gameover state
    if (!prevGameOver) {
      renderLeaderboardPanel();
      prevGameOver = true;
    }
  } else if (!state.gameover) {
    prevGameOver = false;
  }
  requestAnimationFrame(watchGameOver);
}
watchGameOver();

// Start button for mobile (tap to start)
startBtn.addEventListener('click', () => {
  if (!state.started) onStart();
  else if (state.gameover && state.goT <= 0) onRestart();
});
startBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (!state.started) onStart();
  else if (state.gameover && state.goT <= 0) onRestart();
});

setupInput(state, cv, pauseBtn, onStart, onRestart);

// ============================================================
// FIRST-TIME SWIPE HINT — teach new mobile players the controls
// ============================================================
// Only shows on touch devices, and only once per browser (stored
// in localStorage). Fades out after 4 seconds OR when the player
// performs any touch — whichever comes first.
// ============================================================
const swipeHint = document.getElementById('swipeHint');
const HINT_SEEN_KEY = 'anveshan_swipe_hint_seen';
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (swipeHint && isTouchDevice && !localStorage.getItem(HINT_SEEN_KEY)) {
  // Show the hint overlay (CSS keyframes handle fade-in)
  swipeHint.classList.add('show');

  // Dismiss handler — fade out, then fully hide and mark as seen
  const dismissHint = (): void => {
    if (!swipeHint.classList.contains('show')) return;
    swipeHint.classList.add('hide');
    // Wait for fade-out animation, then remove classes
    setTimeout(() => {
      swipeHint.classList.remove('show', 'hide');
    }, 500);
    localStorage.setItem(HINT_SEEN_KEY, '1');
  };

  // Auto-dismiss after 4 seconds
  setTimeout(dismissHint, 4000);

  // Also dismiss on first touch anywhere — player already knows now
  window.addEventListener('touchstart', dismissHint, { once: true, passive: true });
}

drawLives(state, livE);
gameLoop(cx, state, scE, hiE, lvE, livE);
