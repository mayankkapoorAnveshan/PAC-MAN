import { W, H } from './constants';
import { createInitialState, doStart, doRestart, drawLives, gameLoop } from './game';
import { setupInput } from './input';
import { initRenderer } from './renderer';

initRenderer();

const cv = document.getElementById('cv') as HTMLCanvasElement;
cv.width = W;     // internal resolution (crisp rendering)
cv.height = H;
const cx = cv.getContext('2d') as CanvasRenderingContext2D;

// --- Responsive canvas sizing: fit viewport while preserving aspect ratio ---
function resizeCanvas(): void {
  const headerH = (document.getElementById('hdr')?.offsetHeight ?? 0);
  const hudH = (document.getElementById('hud')?.offsetHeight ?? 0);
  const bottomH = (document.getElementById('bottomUI')?.offsetHeight ?? 0);
  const dpadEl = document.getElementById('dpad');
  const dpadVisible = dpadEl && getComputedStyle(dpadEl).display !== 'none';
  const dpadH = dpadVisible ? (dpadEl?.offsetHeight ?? 0) : 0;
  const chrome = headerH + hudH + bottomH + dpadH + 60;  // padding buffer

  const availW = window.innerWidth - 16;
  const availH = window.innerHeight - chrome;

  const aspect = W / H;
  let cssW = Math.min(availW, W);
  let cssH = cssW / aspect;
  if (cssH > availH) {
    cssH = Math.max(availH, 200);
    cssW = cssH * aspect;
  }
  cv.style.width = `${Math.floor(cssW)}px`;
  cv.style.height = `${Math.floor(cssH)}px`;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
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

// Show start button again on game over (for mobile)
function watchGameOver(): void {
  if (state.gameover && state.goT <= 0) {
    startBtn.textContent = 'TAP TO RETRY';
    startBtn.classList.remove('hidden');
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

drawLives(state, livE);
gameLoop(cx, state, scE, hiE, lvE, livE);
