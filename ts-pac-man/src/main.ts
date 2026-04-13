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
// TUTORIAL OVERLAY — "How to Play" swipe carousel
// ============================================================
// - Auto-shows on first visit (tracked via localStorage)
// - Reopens whenever the player taps the "?" help button
// - 6 slides: Objective, Controls, Collect, Enemies, Power-ups, Pro Tip
// - Native swipe via CSS scroll-snap (hardware accelerated)
// - Pagination dots, prev/next buttons, slide counter, skip button
// - LET'S PLAY CTA only enables on final slide
// - Haptic vibration on slide change (mobile only)
// ============================================================
const tutorial = document.getElementById('tutorial') as HTMLElement | null;
const helpBtn = document.getElementById('helpBtn') as HTMLButtonElement | null;
const tutClose = tutorial?.querySelector('.tutClose') as HTMLButtonElement | null;
const tutCta = tutorial?.querySelector('.tutCta') as HTMLButtonElement | null;
const tutSkip = tutorial?.querySelector('.tutSkip') as HTMLButtonElement | null;
const tutTrack = document.getElementById('tutTrack') as HTMLElement | null;
const tutDotsContainer = document.getElementById('tutDots') as HTMLElement | null;
const tutPrev = document.getElementById('tutPrev') as HTMLButtonElement | null;
const tutNext = document.getElementById('tutNext') as HTMLButtonElement | null;
const tutCurrent = document.getElementById('tutCurrent') as HTMLElement | null;
const tutTotal = document.getElementById('tutTotal') as HTMLElement | null;
const TUTORIAL_SEEN_KEY = 'anveshan_tutorial_seen';

const slides = tutTrack ? Array.from(tutTrack.querySelectorAll<HTMLElement>('.tutSlide')) : [];
const SLIDE_COUNT = slides.length;
let currentSlide = 0;

// Build pagination dots dynamically
function buildDots(): void {
  if (!tutDotsContainer) return;
  tutDotsContainer.innerHTML = '';
  for (let i = 0; i < SLIDE_COUNT; i++) {
    const dot = document.createElement('button');
    dot.className = 'tutDot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    tutDotsContainer.appendChild(dot);
  }
}

// Programmatically scroll to a specific slide
function goToSlide(index: number): void {
  if (!tutTrack) return;
  const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, index));
  tutTrack.scrollTo({ left: clamped * tutTrack.offsetWidth, behavior: 'smooth' });
}

// Update dots, counter, button states, CTA readiness, and trigger slide animations
function updateCarouselUI(index: number): void {
  currentSlide = index;

  // Sync pagination dots
  const dots = tutDotsContainer?.querySelectorAll('.tutDot') ?? [];
  dots.forEach((d, i) => d.classList.toggle('active', i === index));

  // Sync "active" class on slides (triggers content slide-in animation)
  slides.forEach((s, i) => s.classList.toggle('active', i === index));

  // Update slide counter (1 / 6)
  if (tutCurrent) tutCurrent.textContent = String(index + 1);

  // Enable/disable prev/next buttons at boundaries
  if (tutPrev) tutPrev.disabled = index === 0;
  if (tutNext) tutNext.disabled = index === SLIDE_COUNT - 1;

  // CTA only becomes active on the last slide — ensures player sees full guide
  if (tutCta) {
    if (index === SLIDE_COUNT - 1) tutCta.classList.add('ready');
    else tutCta.classList.remove('ready');
  }

  // Haptic tick on slide change (mobile only; silently ignored on desktop)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(8); } catch { /* vibration blocked */ }
  }
}

// Listen to native scroll and keep UI in sync with the user's swipe
let scrollDebounce: number | undefined;
tutTrack?.addEventListener('scroll', () => {
  // Debounce — update when scroll settles, not on every pixel
  if (scrollDebounce) clearTimeout(scrollDebounce);
  scrollDebounce = window.setTimeout(() => {
    if (!tutTrack) return;
    const idx = Math.round(tutTrack.scrollLeft / tutTrack.offsetWidth);
    if (idx !== currentSlide) updateCarouselUI(idx);
  }, 60);
});

// Prev/next button handlers
tutPrev?.addEventListener('click', () => goToSlide(currentSlide - 1));
tutNext?.addEventListener('click', () => goToSlide(currentSlide + 1));

// Open the tutorial overlay
function showTutorial(): void {
  if (!tutorial) return;
  tutorial.classList.remove('hide');
  tutorial.classList.add('show');
  tutorial.scrollTop = 0;
  // Reset to first slide every time we open
  goToSlide(0);
  // Force immediate UI sync (scroll event won't fire if already at 0)
  setTimeout(() => updateCarouselUI(0), 50);
  // Auto-pause active gameplay so the guide isn't competing with the game
  if (state.started && !state.dead && !state.won && !state.gameover && !state.paused) {
    state.paused = true;
    pauseBtn.textContent = 'RESUME';
  }
}

// Close the tutorial overlay and mark as seen
function hideTutorial(): void {
  if (!tutorial) return;
  tutorial.classList.add('hide');
  setTimeout(() => {
    tutorial.classList.remove('show', 'hide');
  }, 320);
  localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
}

// Initialize — build dots + counter total + show on first visit
buildDots();
if (tutTotal) tutTotal.textContent = String(SLIDE_COUNT);
updateCarouselUI(0);
if (tutorial && !localStorage.getItem(TUTORIAL_SEEN_KEY)) {
  showTutorial();
}

// Wire close / skip / cta buttons (both click + touchstart for snappy mobile)
function wireBtn(btn: HTMLButtonElement | null, fn: () => void): void {
  if (!btn) return;
  btn.addEventListener('click', fn);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); }, { passive: false });
}
wireBtn(helpBtn, showTutorial);
wireBtn(tutClose, hideTutorial);
wireBtn(tutSkip, hideTutorial);
wireBtn(tutCta, hideTutorial);

drawLives(state, livE);
gameLoop(cx, state, scE, hiE, lvE, livE);
