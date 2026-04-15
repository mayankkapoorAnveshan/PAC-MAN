import { GameState } from './types';
import { COLS, ROWS, T, W, H, COLORS, getMapForLevel, LEVEL_OBJECTIVES, MAX_LEVEL } from './constants';
import { createGhosts, moveGhost } from './ghost';
import { drawMap, drawPacMan, drawDeadPacMan, drawGhost, drawFruit, drawPowerUp, drawPowerUpIndicator, drawOverlays, drawLivesEmoji, resetSmoothPos, drawObjectiveProgress } from './renderer';
import { playEatDot, playEatGhee, playEatGhost, playDeath, playLevelComplete, playFruitEat } from './sound';
import { triggerShake, applyShake, resetShake, spawnDotParticles, spawnGhostExplosion, spawnPowerUpBurst, spawnScorePopup, spawnDeathExplosion, updateAndDrawParticles, updateAndDrawPopups } from './effects';
import { addScore } from './leaderboard';

function isWall(map: number[][], x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
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
  // Speed ramp: cow gets slightly faster each level
  state.spd = Math.min(0.1 + (state.level - 1) * 0.008, 0.16);
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
    lives: 3,
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
  };
}

export function doStart(state: GameState, lvE: HTMLElement, livE: HTMLElement): void {
  if (state.started) return;
  state.started = true;
  state.gameover = false;
  state.gameComplete = false;
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  drawLives(state, livE);
  newLevel(state, lvE);
  state.ndx = 0;
  state.ndy = 0;
}

export function doRestart(state: GameState, lvE: HTMLElement, livE: HTMLElement): void {
  state.gameover = false;
  state.gameComplete = false;
  state.goT = 0;
  state.score = 0;
  state.lives = 3;
  state.level = 1;
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
    if (state.started && !state.dead && !state.won && !state.gameover && !state.paused) {
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

      // Pac-Man movement
      const col = Math.round(state.px);
      const row = Math.round(state.py);

      if (Math.abs(state.px - col) < 0.04 && Math.abs(state.py - row) < 0.04) {
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

        if (state.honeyPotsEaten >= state.honeyTarget && state.ghostKills >= state.killsTarget) {
          state.won = true;
          state.wonT = 80;
          playLevelComplete();
        }
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
          } else if (!g.eaten) {
            state.dead = true;
            state.deadT = 50;
            state.lives = 1;
            playDeath();
            triggerShake(30, 8);
            // Big explosion at cow position
            spawnDeathExplosion(state.px * T + T / 2, state.py * T + T / 2);
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

    // Death timer
    if (state.dead) {
      state.deadT--;
      if (state.deadT <= 0) {
        state.dead = false;
        state.lives--;
        drawLives(state, livE);
        if (state.lives <= 0) {
          state.gameover = true;
          state.goT = 80;
          addScore(state.score, state.level);
        } else {
          resetPositions(state);
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
        if (state.level >= MAX_LEVEL) {
          state.gameComplete = true;
          state.gameover = true;
          state.goT = 80;
          addScore(state.score, state.level);
        } else {
          state.level++;
          newLevel(state, lvE);
        }
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

    drawOverlays(cx, state);
    cx.restore();
    resetShake(cx);

    requestAnimationFrame(loop);
  }

  loop();
}
