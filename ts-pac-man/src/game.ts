import { GameState } from './types';
import { COLS, ROWS, T, W, H, COLORS, getMapForLevel, LEVEL_OBJECTIVES, MAX_LEVEL } from './constants';
import { createGhosts, moveGhost } from './ghost';
import { drawMap, drawPacMan, drawDeadPacMan, drawGhost, drawFruit, drawPowerUp, drawPowerUpIndicator, drawOverlays, drawLivesEmoji, resetSmoothPos, drawObjectiveProgress } from './renderer';
import { playEatDot, playEatGhee, playEatGhost, playDeath, playLevelComplete, playFruitEat } from './sound';
import { triggerShake, applyShake, resetShake, spawnDotParticles, spawnGhostExplosion, spawnPowerUpBurst, spawnScorePopup, spawnDeathExplosion, updateAndDrawParticles, updateAndDrawPopups, triggerFlash, drawScreenFlash, haptic } from './effects';
import { addScore } from './leaderboard';

function isWall(map: number[][], x: number, y: number): boolean {
  // Vertical out-of-bounds is a hard wall (no top/bottom tunnels).
  // Horizontal out-of-bounds stays passable so the side-tunnel wrap
  // on row 9 still works as expected.
  if (y < 0 || y >= ROWS) return true;
  if (x < 0 || x >= COLS) return false;
  return map[y][x] === 1;
}

function initMap(state: GameState): void {
  state.map = [];
  state.totalDots = 0;
  state.dotsEaten = 0;
  const template = getMapForLevel(state.level);
  const potPositions: { r: number; c: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    state.map[r] = [];
    for (let c = 0; c < COLS; c++) {
      state.map[r][c] = template[r][c];
      if (state.map[r][c] === 2) state.totalDots++;
      if (state.map[r][c] === 3) potPositions.push({ r, c });
    }
  }

  // Trim honey pots (power pellets) down to honeyTarget for this level.
  // Clamp target to what the map actually offers so the level stays winnable.
  if (state.honeyTarget > potPositions.length) state.honeyTarget = potPositions.length;
  const target = state.honeyTarget;
  for (let i = potPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [potPositions[i], potPositions[j]] = [potPositions[j], potPositions[i]];
  }
  for (let i = target; i < potPositions.length; i++) {
    const { r, c } = potPositions[i];
    state.map[r][c] = 0;
  }
}

function resetPositions(state: GameState): void {
  state.px = 10; state.py = 15;
  state.dx = 0; state.dy = 0;
  state.ndx = 0; state.ndy = 0;
  // Speed ramp: cow gets slightly faster each level.
  // Previously 0.008 per level / cap 0.16 — felt jerky on L3 because the
  // higher per-frame step made tile alignment harder and the cow felt
  // "slippery". Softened to 0.005 per level / cap 0.13 so L3 plays smooth
  // but still gives a noticeable difficulty bump over L1.
  state.spd = Math.min(0.1 + (state.level - 1) * 0.005, 0.13);
  state.ghosts = createGhosts(state.level);
  state.frightTime = 0; state.eatCombo = 0;
  state.dead = false; state.deadT = 0;
  state.won = false; state.wonT = 0;
  state.scatterMode = true; state.scatterTimer = 0; state.scatterCycle = 0;
  state.fruit = { x: 10, y: 13, active: false, timer: 0, points: 100 + state.level * 100 };
  state.powerUp = { type: '', x: 0, y: 0, active: false, timer: 0, effectTimer: 0 };
  state.cutscene = false; state.cutsceneT = 0;
  resetSmoothPos();
}

function applyLevelObjectives(state: GameState): void {
  const idx = Math.min(state.level - 1, MAX_LEVEL - 1);
  const obj = LEVEL_OBJECTIVES[idx];
  state.honeyTarget = obj.honey;
  state.killsTarget = obj.kills;
  state.ghostKills = 0;
  state.honeyPotsEaten = 0;
}

function newLevel(state: GameState, lvE: HTMLElement): void {
  applyLevelObjectives(state);
  initMap(state);
  resetPositions(state);
  lvE.textContent = String(state.level);
}

export function createInitialState(): GameState {
  return {
    map: [],
    totalDots: 0,
    dotsEaten: 0,
    px: 10, py: 15,
    dx: 0, dy: 0,
    ndx: 0, ndy: 0,
    spd: 0.1,
    score: 0,
    hi: parseInt(localStorage.getItem('pac_hi') || '0'),
    lives: 1,
    level: 1,
    frame: 0,
    started: false,
    dead: false, deadT: 0,
    won: false, wonT: 0,
    gameover: false, goT: 0,
    paused: false,
    mouth: 0.08, mouthD: 1,
    frightTime: 0, eatCombo: 0,
    scatterMode: true, scatterTimer: 0, scatterCycle: 0,
    fruit: { x: 10, y: 13, active: false, timer: 0, points: 100 },
    powerUp: { type: '', x: 0, y: 0, active: false, timer: 0, effectTimer: 0 },
    cutscene: false, cutsceneT: 0,
    ghosts: [],
    honeyTarget: LEVEL_OBJECTIVES[0].honey,
    killsTarget: LEVEL_OBJECTIVES[0].kills,
    ghostKills: 0,
    honeyPotsEaten: 0,
    gameComplete: false,
    endlessMode: false,
    invulnTimer: 0,
  };
}

export function doStart(state: GameState, lvE: HTMLElement, livE: HTMLElement): void {
  if (state.started) return;
  state.started = true;
  state.gameover = false;
  state.gameComplete = false;
  state.endlessMode = false;
  state.score = 0;
  state.lives = 1;
  state.invulnTimer = 0;
  state.level = 1;
  drawLives(state, livE);
  newLevel(state, lvE);
  state.ndx = 0;
  state.ndy = 0;
}

export function doRestart(state: GameState, lvE: HTMLElement, livE: HTMLElement): void {
  // On victory/endless death restart: go back to level 1 fresh.
  // On failure retry: stay on the same level so the player retries
  // the exact level they died on instead of grinding from level 1.
  const retryLevel = state.gameComplete || state.endlessMode ? 1 : state.level;
  state.gameover = false;
  state.gameComplete = false;
  state.endlessMode = false;
  state.goT = 0;
  state.score = 0;
  state.lives = 1;
  state.invulnTimer = 0;
  state.level = retryLevel;
  drawLives(state, livE);
  newLevel(state, lvE);
}

export function drawLives(state: GameState, livE: HTMLElement): void {
  livE.innerHTML = drawLivesEmoji(state.lives);
}

export function gameLoop(
  cx: CanvasRenderingContext2D,
  state: GameState,
  scE: HTMLElement,
  hiE: HTMLElement,
  lvE: HTMLElement,
  livE: HTMLElement,
): void {
  let displayedScore = 0;
  let lastDisplayedRounded = 0;
  let lastDisplayedHi = state.hi;

  function loop(): void {
    state.frame++;

    // === GAME LOGIC ===
    if (state.started && !state.dead && !state.won && !state.gameover && !state.paused && !state.cutscene) {
      // Fright timer
      if (state.frightTime > 0) {
        state.frightTime--;
        if (state.frightTime <= 0) {
          for (const g of state.ghosts) g.fr = false;
        }
      }

      // Scatter/chase cycle (like real Pac-Man)
      // Pattern: scatter 7s, chase 20s, scatter 5s, chase 20s, then chase forever
      const SCATTER_DURATIONS = [420, 300, 300]; // frames (~7s, 5s, 5s at 60fps)
      const CHASE_DURATIONS = [1200, 1200, 1200]; // frames (~20s each)
      if (state.frightTime <= 0) {
        state.scatterTimer++;
        const ci = Math.min(state.scatterCycle, 2);
        const limit = state.scatterMode ? SCATTER_DURATIONS[ci] : CHASE_DURATIONS[ci];
        if (state.scatterTimer >= limit && state.scatterCycle < 3) {
          state.scatterMode = !state.scatterMode;
          state.scatterTimer = 0;
          if (!state.scatterMode) state.scatterCycle++;
        }
      }

      // ==========================================================
      // COW MOVEMENT — tile-aligned logic + cornering assist
      // ==========================================================
      const col = Math.round(state.px);
      const row = Math.round(state.py);

      // Standard alignment window — scales with current speed so the cow
      // never skips past a tile center between frames. At L1 (spd 0.1)
      // this is ~0.08 tiles; at L3 (spd 0.11) it's ~0.088. Without this,
      // fractional frame positions could land at .928 → .044 around a tile
      // and the cow would walk through walls / skip dots entirely.
      const alignTol = Math.max(0.08, state.spd * 0.7);

      // Cornering assist window — a WIDER buffer used ONLY when the player
      // pre-buffers a perpendicular turn. Lets them swipe up to ~0.2 tiles
      // early/late and still make the corner, giving the game a modern
      // "Pac-Man CE" feel instead of punishing precise timing.
      const cornerTol = 0.22;

      // Is the buffered next-direction perpendicular to current motion?
      // (e.g., cow going right, player swiped down) — only perpendicular
      // turns get the cornering assist; straight reversals don't need it.
      const wantsPerpTurn =
        (state.ndx !== 0 || state.ndy !== 0) &&
        ((state.dx !== 0 && state.ndy !== 0) || (state.dy !== 0 && state.ndx !== 0));

      // Attempt a wide-tolerance cornering turn FIRST. If the cow is close
      // enough to a tile center AND the perpendicular turn is legal, we
      // snap her to the intersection and change direction. The snap is
      // invisible at runtime because renderer.ts lerps smoothPX/PY toward
      // state.px/py and the jump is small (≤0.22 tile).
      if (
        wantsPerpTurn &&
        Math.abs(state.px - col) < cornerTol &&
        Math.abs(state.py - row) < cornerTol &&
        !(Math.abs(state.px - col) < alignTol && Math.abs(state.py - row) < alignTol)
      ) {
        const tx = col + state.ndx;
        const ty = row + state.ndy;
        const canTurn = tx < 0 || tx >= COLS || !isWall(state.map, tx, ty);
        if (canTurn) {
          state.px = col;
          state.py = row;
          state.dx = state.ndx;
          state.dy = state.ndy;
        }
      }

      if (Math.abs(state.px - col) < alignTol && Math.abs(state.py - row) < alignTol) {
        state.px = col;
        state.py = row;
        if (state.px < 0) state.px = COLS - 1;
        if (state.px >= COLS) state.px = 0;

        const nnx = col + state.ndx;
        const nny = row + state.ndy;
        if ((state.ndx !== 0 || state.ndy !== 0) && (nnx < 0 || nnx >= COLS || !isWall(state.map, nnx, nny))) {
          state.dx = state.ndx;
          state.dy = state.ndy;
        }

        const fx = col + state.dx;
        const fy = row + state.dy;
        if (fx >= 0 && fx < COLS && isWall(state.map, fx, fy)) {
          state.dx = 0;
          state.dy = 0;
        }

        // Magnet effect: auto-eat dots within 2 tiles
        if (state.powerUp.effectTimer > 0 && state.powerUp.type === 'magnet') {
          for (let mr = Math.max(0, row - 2); mr <= Math.min(ROWS - 1, row + 2); mr++) {
            for (let mc = Math.max(0, col - 2); mc <= Math.min(COLS - 1, col + 2); mc++) {
              if (state.map[mr]?.[mc] === 2) {
                state.map[mr][mc] = 0;
                state.score += 10;
                state.dotsEaten++;
                spawnDotParticles(mc, mr);
              }
            }
          }
        }

        // Eat dots
        if (state.map[row]?.[col] === 2) {
          state.map[row][col] = 0;
          state.score += 10;
          state.dotsEaten++;
          playEatDot();
          spawnDotParticles(col, row);
        } else if (state.map[row]?.[col] === 3) {
          state.map[row][col] = 0;
          state.score += 50;
          state.honeyPotsEaten++;
          playEatGhee();
          spawnPowerUpBurst(col, row);
          spawnScorePopup(col, row, 50);
          // Juice: gold screen flash + strong haptic pulse
          triggerFlash('#F2CB05', 0.45);
          haptic(35);
          state.eatCombo = 0;
          state.frightTime = Math.max(50, 150 - state.level * 20);
          for (const g of state.ghosts) {
            if (!g.eaten) g.fr = true;
          }
        }

        // Spawn power-up after 40, 100, 140 dots
        if ((state.dotsEaten === 40 || state.dotsEaten === 100 || state.dotsEaten === 140) && !state.powerUp.active && state.powerUp.effectTimer <= 0) {
          const types = ['speed', 'magnet', 'freeze'];
          const type = types[Math.floor(Math.random() * types.length)];
          // Find a random empty tile
          let px = 0, py = 0;
          for (let attempts = 0; attempts < 50; attempts++) {
            px = 1 + Math.floor(Math.random() * (COLS - 2));
            py = 1 + Math.floor(Math.random() * (ROWS - 2));
            if (state.map[py]?.[px] === 0) break;
          }
          state.powerUp = { type, x: px, y: py, active: true, timer: 480, effectTimer: 0 };
        }

        // Eat power-up
        if (state.powerUp.active && Math.abs(state.px - state.powerUp.x) < 0.8 && Math.abs(state.py - state.powerUp.y) < 0.8) {
          state.powerUp.active = false;
          state.powerUp.effectTimer = 300; // ~5 seconds effect
          playFruitEat();
          spawnPowerUpBurst(state.powerUp.x, state.powerUp.y);
          if (state.powerUp.type === 'freeze') {
            // Freeze all ghosts temporarily (handled in move check)
          }
        }

        // Spawn fruit after 70 or 170 dots eaten
        if ((state.dotsEaten === 70 || state.dotsEaten === 170) && !state.fruit.active) {
          state.fruit.active = true;
          state.fruit.timer = 600; // ~10 seconds
        }

        // Eat fruit
        if (state.fruit.active && Math.abs(state.px - state.fruit.x) < 0.8 && Math.abs(state.py - state.fruit.y) < 0.8) {
          state.score += state.fruit.points;
          state.fruit.active = false;
          playFruitEat();
          spawnPowerUpBurst(state.fruit.x, state.fruit.y);
          spawnScorePopup(state.fruit.x, state.fruit.y, state.fruit.points);
        }

      }

      // Mission win check — lives outside the tile-aligned block so
      // speed boosts can't overshoot and miss the final trigger frame.
      if (!state.won && state.honeyPotsEaten >= state.honeyTarget && state.ghostKills >= state.killsTarget) {
        state.won = true;
        state.wonT = 80;
        playLevelComplete();
      }

      if (state.dx !== 0 || state.dy !== 0) {
        const speedMult = (state.powerUp.effectTimer > 0 && state.powerUp.type === 'speed') ? 1.5 : 1;
        state.px += state.dx * state.spd * speedMult;
        state.py += state.dy * state.spd * speedMult;
        if (state.px < -0.5) state.px += COLS;
        if (state.px > COLS - 0.5) state.px -= COLS;
      }

      // Move ghosts (skip if frozen)
      const frozen = state.powerUp.effectTimer > 0 && state.powerUp.type === 'freeze';
      if (!frozen) {
        for (let i = 0; i < 4; i++) {
          moveGhost(state.ghosts[i], i, state);
        }
      }

      // Invulnerability decay (brief window after respawn)
      if (state.invulnTimer > 0) state.invulnTimer--;

      // Collision
      for (const g of state.ghosts) {
        if (g.dc < g.del) continue;
        if (Math.hypot(state.px - g.x, state.py - g.y) < 0.8) {
          if (g.fr && !g.eaten) {
            g.eaten = true;
            g.fr = false;
            state.eatCombo++;
            state.ghostKills++;
            const ghostScore = 200 * Math.pow(2, state.eatCombo - 1);
            state.score += ghostScore;
            playEatGhost();
            spawnGhostExplosion(g.x, g.y, g.color);
            spawnScorePopup(g.x, g.y, ghostScore);
            // Juice: color-matching flash + combo haptic
            triggerFlash(g.color, 0.4);
            haptic(state.eatCombo >= 2 ? 50 : 25);
          } else if (!g.eaten) {
            // Instant game over — one collision ends the run and pops the modal.
            playDeath();
            triggerShake(30, 8);
            spawnDeathExplosion(state.px * T + T / 2, state.py * T + T / 2);
            triggerFlash('#e74c3c', 0.55);
            haptic(80);
            state.lives = 0;
            drawLives(state, livE);
            state.gameover = true;
            state.goT = 0;
            addScore(state.score, state.level);
          }
        }
      }

      if (state.score > state.hi) {
        state.hi = state.score;
        localStorage.setItem('pac_hi', String(state.hi));
      }
    }

    // Smooth score counter — displayed number chases actual
    displayedScore += (state.score - displayedScore) * 0.15;
    const rounded = Math.round(displayedScore);
    if (rounded !== lastDisplayedRounded) {
      scE.textContent = String(rounded);
      if (rounded > lastDisplayedRounded) {
        scE.classList.remove('pulse');
        void scE.offsetWidth; // force reflow to re-trigger animation
        scE.classList.add('pulse');
      }
      lastDisplayedRounded = rounded;
    }
    const roundedHi = Math.max(state.hi, rounded);
    if (roundedHi !== lastDisplayedHi) {
      hiE.textContent = String(roundedHi);
      lastDisplayedHi = roundedHi;
    }

    // Death timer — when death animation ends, lose a life + respawn
    if (state.dead) {
      state.deadT--;
      if (state.deadT <= 0) {
        state.dead = false;
        state.lives--;
        drawLives(state, livE);
        if (state.lives <= 0) {
          state.gameover = true;
          state.goT = 0;
          addScore(state.score, state.level);
        } else {
          // Respawn at spawn tile WITHOUT touching mission progress
          // (honeyPotsEaten, ghostKills, score all preserved)
          const savedHoney = state.honeyPotsEaten;
          const savedKills = state.ghostKills;
          resetPositions(state);
          state.honeyPotsEaten = savedHoney;
          state.ghostKills = savedKills;
          state.invulnTimer = 90; // ~1.5s safe window
        }
      }
    }

    // Win timer → cutscene → next level
    if (state.won) {
      state.wonT--;
      if (state.wonT <= 0) {
        state.won = false;
        state.cutscene = true;
        state.cutsceneT = 120; // ~2 seconds
      }
    }

    if (state.cutscene) {
      state.cutsceneT--;
      if (state.cutsceneT <= 0) {
        state.cutscene = false;
        // After clearing L3, unlock endless mode instead of ending the game.
        // Levels keep incrementing, maps cycle, objectives stay at L3 difficulty.
        if (state.level >= MAX_LEVEL && !state.endlessMode) {
          state.endlessMode = true;
        }
        state.level++;
        newLevel(state, lvE);
      }
    }

    // Gameover timer
    if (state.gameover && state.goT > 0) state.goT--;

    // Fruit timer
    if (state.fruit.active) {
      state.fruit.timer--;
      if (state.fruit.timer <= 0) state.fruit.active = false;
    }

    // Power-up timers
    if (state.powerUp.active) {
      state.powerUp.timer--;
      if (state.powerUp.timer <= 0) state.powerUp.active = false;
    }
    if (state.powerUp.effectTimer > 0) {
      state.powerUp.effectTimer--;
    }

    // === RENDER ===
    cx.save();
    applyShake(cx);
    cx.fillStyle = COLORS.bg;
    cx.fillRect(0, 0, W, H);

    if (state.started) {
      drawMap(cx, state);
      drawFruit(cx, state);
      drawPowerUp(cx, state);

      if (!state.dead) {
        drawPacMan(cx, state);
      } else {
        drawDeadPacMan(cx, state);
      }

      for (let i = 0; i < state.ghosts.length; i++) {
        drawGhost(cx, state.ghosts[i], state.frightTime, i, state.frame);
      }
    }

    if (state.won && state.frame % 20 < 10) {
      cx.fillStyle = COLORS.winFlash;
      cx.fillRect(0, 0, W, H);
    }

    // Particles, popups, and power-up indicator
    updateAndDrawParticles(cx);
    updateAndDrawPopups(cx);
    drawPowerUpIndicator(cx, state);
    drawObjectiveProgress(cx, state);
    drawScreenFlash(cx, W, H);

    drawOverlays(cx, state);
    cx.restore();
    resetShake(cx);

    requestAnimationFrame(loop);
  }

  loop();
}
