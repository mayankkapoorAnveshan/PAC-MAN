import { Ghost, GameState } from './types';
import { COLS, ROWS, GHOST_COLORS } from './constants';

export function createGhosts(level: number): Ghost[] {
  const sp = 0.055 + level * 0.005;
  // Stagger: each ghost waits longer before leaving the house
  // Higher levels = shorter delays
  const delayBase = Math.max(30, 120 - level * 15);
  return [
    { x: 9, y: 7, dx: -1, dy: 0, sp, color: GHOST_COLORS[0], del: 0, dc: 0, eaten: false, fr: false, scat: { x: 19, y: 0 } },
    { x: 11, y: 7, dx: 1, dy: 0, sp, color: GHOST_COLORS[1], del: delayBase, dc: 0, eaten: false, fr: false, scat: { x: 2, y: 0 } },
    { x: 4, y: 5, dx: 0, dy: -1, sp, color: GHOST_COLORS[2], del: delayBase * 2, dc: 0, eaten: false, fr: false, scat: { x: 19, y: 20 } },
    { x: 16, y: 5, dx: 0, dy: 1, sp, color: GHOST_COLORS[3], del: delayBase * 3, dc: 0, eaten: false, fr: false, scat: { x: 2, y: 20 } },
  ];
}

export function moveGhost(g: Ghost, idx: number, state: GameState): void {
  if (g.dc < g.del) { g.dc++; return; }

  const s = g.eaten ? 0.1 : (g.fr ? 0.035 : g.sp);
  const gc = Math.round(g.x);
  const gr = Math.round(g.y);

  if (Math.abs(g.x - gc) < 0.04 && Math.abs(g.y - gr) < 0.04) {
    g.x = gc;
    g.y = gr;
    if (g.x < 0) g.x = COLS - 1;
    if (g.x >= COLS) g.x = 0;

    // Eaten ghost returns to house
    if (g.eaten && gc === 10 && gr === 9) {
      g.eaten = false;
      g.fr = false;
      return;
    }

    let tx: number, ty: number;
    const ppx = Math.round(state.px);
    const ppy = Math.round(state.py);

    if (g.eaten) {
      tx = 10; ty = 9;
    } else if (g.fr) {
      tx = Math.floor(Math.random() * COLS);
      ty = Math.floor(Math.random() * ROWS);
    } else if (state.scatterMode) {
      // Scatter: each ghost retreats to its corner
      tx = g.scat.x; ty = g.scat.y;
    } else if (idx === 0) {
      // Blinky: chase directly
      tx = ppx; ty = ppy;
    } else if (idx === 1) {
      // Pinky: target 4 ahead
      tx = ppx + state.dx * 4;
      ty = ppy + state.dy * 4;
    } else if (idx === 2) {
      // Inky: complex targeting using Blinky
      const b = state.ghosts[0];
      tx = ppx + state.dx * 2;
      ty = ppy + state.dy * 2;
      tx += (tx - Math.round(b.x));
      ty += (ty - Math.round(b.y));
    } else {
      // Clyde: chase or scatter
      const dd = Math.hypot(g.x - ppx, g.y - ppy);
      if (dd > 8) { tx = ppx; ty = ppy; }
      else { tx = g.scat.x; ty = g.scat.y; }
    }

    const dirs: [number, number][] = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    let best: [number, number] | null = null;
    let bestD = Infinity;

    for (const dir of dirs) {
      if (!g.eaten && dir[0] === -g.dx && dir[1] === -g.dy) continue;
      const nx = gc + dir[0];
      const ny = gr + dir[1];
      if (nx < 0 || nx >= COLS) { best = dir; bestD = -1; continue; }
      if (ny < 0 || ny >= ROWS || state.map[ny][nx] === 1) continue;
      const d = Math.hypot(nx - tx, ny - ty);
      if (d < bestD) { bestD = d; best = dir; }
    }

    if (best) { g.dx = best[0]; g.dy = best[1]; }
  }

  g.x += g.dx * s;
  g.y += g.dy * s;
  if (g.x < -1) g.x = COLS;
  if (g.x > COLS) g.x = -1;
}
