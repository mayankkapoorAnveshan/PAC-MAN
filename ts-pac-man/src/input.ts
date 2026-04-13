import { GameState } from './types';

export function setupInput(
  state: GameState,
  canvas: HTMLCanvasElement,
  pauseBtn: HTMLElement,
  doStart: () => void,
  doRestart: () => void,
): void {
  // Keyboard
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const k = e.key;

    if (!state.started) {
      if (k === ' ' || k === 'Space') {
        e.preventDefault();
        doStart();
      }
      return;
    }

    if (state.gameover && state.goT <= 0) { e.preventDefault(); doRestart(); return; }

    if ((k === ' ' || k === 'Enter') && state.started && !state.dead && !state.won && !state.gameover) {
      e.preventDefault();
      state.paused = !state.paused;
      pauseBtn.textContent = state.paused ? 'RESUME' : 'PAUSE';
      return;
    }
    if (k === 'Escape' && state.started) { state.paused = !state.paused; return; }

    if (k === 'ArrowUp' || k === 'w' || k === 'W') { state.ndx = 0; state.ndy = -1; e.preventDefault(); }
    if (k === 'ArrowDown' || k === 's' || k === 'S') { state.ndx = 0; state.ndy = 1; e.preventDefault(); }
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { state.ndx = -1; state.ndy = 0; e.preventDefault(); }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') { state.ndx = 1; state.ndy = 0; e.preventDefault(); }
    if (state.paused) state.paused = false;
  });

  // --- Touch swipe controls (mobile/tablet) ---
  // Continuous swipe: direction changes the moment finger crosses threshold,
  // then resets origin so player can change direction without lifting finger.
  let ttx = 0, tty = 0;
  const SWIPE_THRESHOLD = 20;  // px — how far to swipe before direction registers

  function applySwipeDirection(ddx: number, ddy: number): void {
    if (Math.abs(ddx) > Math.abs(ddy)) {
      state.ndx = ddx > 0 ? 1 : -1;
      state.ndy = 0;
    } else {
      state.ndx = 0;
      state.ndy = ddy > 0 ? 1 : -1;
    }
    if (state.paused) state.paused = false;
  }

  canvas.addEventListener('touchstart', (e: TouchEvent) => {
    e.preventDefault();
    if (state.gameover && state.goT <= 0) { doRestart(); return; }
    if (!state.started) { doStart(); return; }
    ttx = e.touches[0].clientX;
    tty = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e: TouchEvent) => {
    e.preventDefault();
    if (!state.started) return;
    const ddx = e.touches[0].clientX - ttx;
    const ddy = e.touches[0].clientY - tty;
    if (Math.abs(ddx) < SWIPE_THRESHOLD && Math.abs(ddy) < SWIPE_THRESHOLD) return;
    applySwipeDirection(ddx, ddy);
    // Reset origin so next swipe in another direction registers immediately
    ttx = e.touches[0].clientX;
    tty = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchend', (e: TouchEvent) => {
    e.preventDefault();
    if (!state.started) return;
    const ddx = e.changedTouches[0].clientX - ttx;
    const ddy = e.changedTouches[0].clientY - tty;
    if (Math.abs(ddx) < SWIPE_THRESHOLD && Math.abs(ddy) < SWIPE_THRESHOLD) return;
    applySwipeDirection(ddx, ddy);
  }, { passive: false });

  canvas.addEventListener('click', () => {
    if (state.gameover && state.goT <= 0) doRestart();
  });

  // D-pad buttons — these also start the game on mobile
  function setupDpad(id: string, ddx: number, ddy: number): void {
    const btn = document.getElementById(id)!;
    const handler = () => {
      if (state.gameover && state.goT <= 0) { doRestart(); return; }
      if (!state.started) doStart();
      state.ndx = ddx;
      state.ndy = ddy;
      if (state.paused) state.paused = false;
    };
    btn.addEventListener('touchstart', (e: TouchEvent) => { e.preventDefault(); handler(); }, { passive: false });
    btn.addEventListener('click', handler);
  }

  setupDpad('bu', 0, -1);
  setupDpad('bd', 0, 1);
  setupDpad('bl', -1, 0);
  setupDpad('br', 1, 0);

  // Pause button
  pauseBtn.addEventListener('click', () => {
    if (state.started && !state.dead && !state.won && !state.gameover) {
      state.paused = !state.paused;
      pauseBtn.textContent = state.paused ? 'RESUME' : 'PAUSE';
    }
  });

  // Prevent all annoying mobile behaviors
  document.addEventListener('touchmove', (e) => {
    // Allow scroll only if not on game area
    if (e.target === canvas || (e.target as HTMLElement).closest('#dpad')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent double-tap zoom
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
    }
    lastTap = now;
  }, { passive: false });

  // Prevent pull-to-refresh (Chrome Android)
  document.body.style.overscrollBehavior = 'none';
}
