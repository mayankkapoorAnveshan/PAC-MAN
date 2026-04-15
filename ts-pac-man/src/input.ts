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

  // ============================================================
  // TOUCH SWIPE CONTROLS — window-wide, continuous, with haptics
  // ============================================================
  // Features:
  //  1. Swipe anywhere on the page (not just canvas) — more forgiving
  //  2. Continuous direction changes — no need to lift finger
  //  3. Haptic vibration on every direction change — tactile feedback
  //  4. Double-tap anywhere to pause/resume — quick shortcut
  //  5. Buttons (start/pause) are excluded so taps on them still work
  // ============================================================

  // Touch origin (finger down position) — swipes are measured from here
  let ttx = 0, tty = 0;
  // Last applied direction — used to avoid re-vibrating on same direction
  let lastDx = 0, lastDy = 0;

  const SWIPE_THRESHOLD = 18;  // px finger must move before swipe registers

  // Fire a short vibration if the device supports it (phones do, desktops don't)
  // Wrapped in try/catch because some browsers throw if vibration policy blocks it
  function vibrate(ms: number): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch { /* ignore: vibration not permitted */ }
    }
  }

  // Apply a swipe vector to the game's next-direction (ndx, ndy)
  // The game loop will turn the cow when she's tile-aligned (buffered input)
  function applySwipeDirection(ddx: number, ddy: number): void {
    let nx = 0, ny = 0;
    // Dominant axis wins — avoids diagonal ambiguity
    if (Math.abs(ddx) > Math.abs(ddy)) {
      nx = ddx > 0 ? 1 : -1;  // right or left
    } else {
      ny = ddy > 0 ? 1 : -1;  // down or up
    }
    // Only vibrate when the new direction actually differs from the previous one.
    // Otherwise every touchmove frame would trigger vibration = annoying buzz.
    if (nx !== lastDx || ny !== lastDy) {
      vibrate(12);
      lastDx = nx;
      lastDy = ny;
    }
    state.ndx = nx;
    state.ndy = ny;
    // Any swipe also unpauses — prevents the player being stuck in paused state
    if (state.paused) state.paused = false;
  }

  // Check if a touch event target is part of the game area (canvas/body)
  // and NOT a button like Pause/Start — we don't want swipes to consume button taps.
  // Also rejects ANY touch that happens while the tutorial overlay is open,
  // so carousel swipes never leak into the game as cow-direction changes.
  function isGameTarget(target: EventTarget | null): boolean {
    // Global guard — if tutorial is visible, game never accepts touches
    const tut = document.getElementById('tutorial');
    if (tut && tut.classList.contains('show')) return false;
    if (!target) return true;
    const el = target as HTMLElement;
    // Reject direct button clicks so their own handlers still fire
    if (el.tagName === 'BUTTON') return false;
    // Also reject anything nested inside a button (button icons, text spans)
    if (el.closest && el.closest('button')) return false;
    // Reject touches originating inside the tutorial subtree (carousel etc.)
    if (el.closest && el.closest('#tutorial')) return false;
    return true;
  }

  // --- touchstart: record origin + auto-start/restart the game if needed ---
  window.addEventListener('touchstart', (e: TouchEvent) => {
    if (!isGameTarget(e.target)) return;   // let buttons handle their own taps
    e.preventDefault();                     // stop scrolling, text selection, etc.

    // If game over → any touch triggers restart
    if (state.gameover && state.goT <= 0) { doRestart(); return; }
    // If game not started → first touch starts the game
    if (!state.started) { doStart(); return; }

    // Record where the finger came down
    ttx = e.touches[0].clientX;
    tty = e.touches[0].clientY;
  }, { passive: false });

  // --- touchmove: live swipe detection ---
  // Player ke finger slide karte hi direction change ho jaati hai,
  // finger uthane ki zarurat nahi. After each registered swipe we
  // reset the origin so the NEXT swipe in a different direction is
  // measured fresh from the current finger position.
  window.addEventListener('touchmove', (e: TouchEvent) => {
    if (!isGameTarget(e.target)) return;
    e.preventDefault();
    if (!state.started) return;

    const ddx = e.touches[0].clientX - ttx;
    const ddy = e.touches[0].clientY - tty;

    // Haven't moved far enough yet — keep waiting
    if (Math.abs(ddx) < SWIPE_THRESHOLD && Math.abs(ddy) < SWIPE_THRESHOLD) return;

    // Register the swipe and update game direction
    applySwipeDirection(ddx, ddy);

    // Reset origin to current position — next swipe is measured from here.
    // This is what enables "swipe right then up without lifting finger"
    ttx = e.touches[0].clientX;
    tty = e.touches[0].clientY;
  }, { passive: false });

  // --- touchend: final swipe catch for slow slides ---
  // Double-tap-to-pause was removed — pause is available only via the
  // explicit PAUSE button in the HUD now.
  window.addEventListener('touchend', (e: TouchEvent) => {
    if (!isGameTarget(e.target)) return;
    if (!state.started) return;

    const t = e.changedTouches[0];
    const ddx = t.clientX - ttx;
    const ddy = t.clientY - tty;

    // If finger slid gently under the move threshold during touchmove
    // but the end delta now crosses it, register it here as a final swipe.
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
