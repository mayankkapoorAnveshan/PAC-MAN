import { W, H } from './constants';
import { createInitialState, doStart, doRestart, drawLives, gameLoop } from './game';
import { setupInput } from './input';
import { initRenderer } from './renderer';
import { getLeaderboard } from './leaderboard';

initRenderer();

// ============================================================
// BACK GESTURE / BUTTON TRAP
// Prevents Android back button and iOS left-edge swipe-back from
// navigating away mid-game. Combines three defenses:
//   1. History state trap — pushes a dummy state so back button
//      lands on us instead of exiting. We re-push on every popstate.
//   2. iOS edge-swipe block — preventDefault on touchstart that
//      begins within 12px of the left/right screen edge.
//   3. CSS overscroll-behavior:none — already set in index.html.
// ============================================================
try { history.pushState({ pacBack: true }, '', location.href); } catch { /* private mode */ }
window.addEventListener('popstate', () => {
  try { history.pushState({ pacBack: true }, '', location.href); } catch { /* ignore */ }
});
// Narrow 5px trap zone matches iOS Safari's back-gesture trigger area
// but leaves gameplay swipes that start near (but not on) the edge alone.
window.addEventListener('touchstart', (e: TouchEvent) => {
  if (!e.touches[0]) return;
  const x = e.touches[0].clientX;
  const edge = 5;
  if (x < edge || x > window.innerWidth - edge) {
    e.preventDefault();
  }
}, { passive: false });

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

// ============================================================
// END GAME MODAL — victory / game over popup
// ============================================================
const endModal = document.getElementById('endModal') as HTMLElement | null;
const endCard = endModal?.querySelector('.endCard') as HTMLElement | null;
const endIcon = document.getElementById('endIcon') as HTMLElement | null;
const endTitle = document.getElementById('endTitle') as HTMLElement | null;
const endSubtitle = document.getElementById('endSubtitle') as HTMLElement | null;
const endScore = document.getElementById('endScore') as HTMLElement | null;
const endLevel = document.getElementById('endLevel') as HTMLElement | null;
const endBest = document.getElementById('endBest') as HTMLElement | null;
const endBoard = document.getElementById('endBoard') as HTMLElement | null;
const endRetry = document.getElementById('endRetry') as HTMLButtonElement | null;
const endCloseBtn = document.getElementById('endClose') as HTMLButtonElement | null;

function showEndModal(): void {
  if (!endModal) return;
  const victory = state.gameComplete;
  if (endCard) endCard.classList.toggle('loss', !victory);
  if (endIcon) endIcon.textContent = victory ? '\u{1F3C6}' : '\u{1F494}';
  if (endTitle) endTitle.textContent = victory ? 'VICTORY!' : 'GAME OVER';
  if (endSubtitle) endSubtitle.textContent = victory ? 'All 3 levels cleared' : 'Junk food won this round...';
  if (endScore) endScore.textContent = String(state.score);
  if (endLevel) endLevel.textContent = `${state.level}/3`;
  if (endBest) endBest.textContent = String(state.hi);

  if (endBoard) {
    const board = getLeaderboard().slice(0, 5);
    if (board.length === 0) {
      endBoard.innerHTML = '<div class="empty">No scores yet</div>';
    } else {
      endBoard.innerHTML = board.map((entry, i) => {
        const isMine = entry.score === state.score;
        return `<div class="row${isMine ? ' mine' : ''}"><span class="rank">#${i + 1}</span><span>${entry.score}</span><span class="lv">L${entry.level}</span></div>`;
      }).join('');
    }
  }
  endModal.classList.add('show');
}

function hideEndModal(): void {
  endModal?.classList.remove('show');
}

// Guard flag prevents rapid double-tap on retry from firing restart twice
// during the same frame before the game state has actually flipped over.
let retryInFlight = false;
function doModalRetry(): void {
  if (retryInFlight) return;
  retryInFlight = true;
  hideEndModal();
  prevGameOver = true; // keep suppressed until watchGameOver clears it
  onRestart();
  setTimeout(() => { retryInFlight = false; }, 400);
}

endRetry?.addEventListener('click', doModalRetry);
endRetry?.addEventListener('touchstart', (e) => { e.preventDefault(); doModalRetry(); }, { passive: false });
endCloseBtn?.addEventListener('click', hideEndModal);

// Show start button again on game over (for mobile) + refresh leaderboard + popup
let prevGameOver = false;
function watchGameOver(): void {
  if (state.gameover && state.goT <= 0) {
    startBtn.textContent = 'TAP TO RETRY';
    // Refresh leaderboard once when we enter post-gameover state
    if (!prevGameOver) {
      renderLeaderboardPanel();
      showEndModal();
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
const tutProgress = document.getElementById('tutProgress') as HTMLElement | null;
const tutProgressFill = document.getElementById('tutProgressFill') as HTMLElement | null;
const TUTORIAL_SEEN_KEY = 'anveshan_tutorial_seen';

// Auto-play config: each slide shows for this long before advancing
const AUTOPLAY_DURATION_MS = 4500;
const PROGRESS_TICK_MS = 50;   // how often we update the progress bar

const slides = tutTrack ? Array.from(tutTrack.querySelectorAll<HTMLElement>('.tutSlide')) : [];
const SLIDE_COUNT = slides.length;
let currentSlide = 0;

// Auto-play state: timer handle + elapsed tracker for progress bar
let autoPlayTimer: number | undefined;
let autoPlayElapsed = 0;
let autoPlayPausedByUser = false;  // once true, stays paused — user took control

// Stop any running auto-play timer and clear progress bar
function stopAutoPlay(): void {
  if (autoPlayTimer !== undefined) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = undefined;
  }
  autoPlayElapsed = 0;
  if (tutProgressFill) tutProgressFill.style.width = '0%';
}

// Mark auto-play as paused (user interacted) — shows grey progress bar
function pauseAutoPlay(): void {
  stopAutoPlay();
  autoPlayPausedByUser = true;
  if (tutProgress) tutProgress.classList.add('paused');
  // Leave progress bar at 100% grey so user knows it's been paused
  if (tutProgressFill) tutProgressFill.style.width = '100%';
}

// Start auto-play from scratch for the current slide
// Progress bar fills up over AUTOPLAY_DURATION_MS then advances to next slide
function startAutoPlay(): void {
  // Don't auto-play if user already interacted, or if we're on the last slide
  if (autoPlayPausedByUser) return;
  if (currentSlide >= SLIDE_COUNT - 1) return;

  stopAutoPlay();
  autoPlayElapsed = 0;
  if (tutProgress) tutProgress.classList.remove('paused');
  if (tutProgressFill) tutProgressFill.style.width = '0%';

  autoPlayTimer = window.setInterval(() => {
    autoPlayElapsed += PROGRESS_TICK_MS;
    // Update progress bar width (0% → 100% over duration)
    const pct = Math.min(100, (autoPlayElapsed / AUTOPLAY_DURATION_MS) * 100);
    if (tutProgressFill) tutProgressFill.style.width = `${pct}%`;

    // When full, advance to next slide
    if (autoPlayElapsed >= AUTOPLAY_DURATION_MS) {
      stopAutoPlay();
      goToSlide(currentSlide + 1);
    }
  }, PROGRESS_TICK_MS);
}

// Build pagination dots dynamically
function buildDots(): void {
  if (!tutDotsContainer) return;
  tutDotsContainer.innerHTML = '';
  for (let i = 0; i < SLIDE_COUNT; i++) {
    const dot = document.createElement('button');
    dot.className = 'tutDot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    // Tapping a dot is explicit navigation → pause auto-play
    dot.addEventListener('click', () => { pauseAutoPlay(); goToSlide(i); });
    tutDotsContainer.appendChild(dot);
  }
}

// Programmatically scroll to a specific slide
// Sets programmaticScroll flag so the scroll event handler knows not to
// interpret this movement as a user swipe (which would pause auto-play)
function goToSlide(index: number): void {
  if (!tutTrack) return;
  const clamped = Math.max(0, Math.min(SLIDE_COUNT - 1, index));
  programmaticScroll = true;
  tutTrack.scrollTo({ left: clamped * tutTrack.offsetWidth, behavior: 'smooth' });
  // Immediately sync UI — no need to wait for scroll event
  updateCarouselUI(clamped);
}

// Update dots, counter, button states, CTA readiness, and trigger slide animations
function updateCarouselUI(index: number): void {
  // No-op if we're already showing this slide — prevents re-triggering
  // animations/haptics from duplicate events (scroll + explicit call race)
  if (index === currentSlide && slides[index]?.classList.contains('active')) {
    return;
  }
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

  // Restart auto-play timer for this new slide (if user hasn't paused it)
  startAutoPlay();
}

// Listen to native scroll and keep UI in sync with the user's swipe
// Also marks user interaction → auto-play pauses permanently for this session
let scrollDebounce: number | undefined;
let userInitiatedScroll = false;
let programmaticScroll = false;  // set true when we call scrollTo() ourselves
tutTrack?.addEventListener('touchstart', () => { userInitiatedScroll = true; }, { passive: true });
tutTrack?.addEventListener('scroll', () => {
  if (scrollDebounce) clearTimeout(scrollDebounce);
  scrollDebounce = window.setTimeout(() => {
    if (!tutTrack) return;
    const idx = Math.round(tutTrack.scrollLeft / tutTrack.offsetWidth);

    // Guard: ignore scroll events triggered by our own goToSlide() call.
    // Only human-initiated scroll (user swipe) should pause auto-play.
    if (programmaticScroll) {
      programmaticScroll = false;
      userInitiatedScroll = false;
      return;
    }

    // Early return if the position hasn't actually changed — avoids
    // re-running updateCarouselUI which would re-trigger animations + haptics
    if (idx === currentSlide) {
      userInitiatedScroll = false;
      return;
    }

    // Real user swipe → pause auto-play permanently for this session
    if (userInitiatedScroll) pauseAutoPlay();
    updateCarouselUI(idx);
    userInitiatedScroll = false;
  }, 60);
});

// Prev/next button handlers — also pause auto-play (explicit user action)
tutPrev?.addEventListener('click', () => { pauseAutoPlay(); goToSlide(currentSlide - 1); });
tutNext?.addEventListener('click', () => { pauseAutoPlay(); goToSlide(currentSlide + 1); });

// Tap directly on a slide (without swiping) also pauses auto-play
// Gives user control to read at their own pace without accidentally advancing
tutTrack?.addEventListener('click', () => { if (!autoPlayPausedByUser) pauseAutoPlay(); });

// Open the tutorial overlay
function showTutorial(): void {
  if (!tutorial) return;
  tutorial.classList.remove('hide');
  tutorial.classList.add('show');
  tutorial.scrollTop = 0;
  // Reset auto-play state — fresh run every time tutorial opens
  autoPlayPausedByUser = false;
  if (tutProgress) tutProgress.classList.remove('paused');
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
  // Stop any running auto-play timer so it doesn't fire after close
  stopAutoPlay();
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
