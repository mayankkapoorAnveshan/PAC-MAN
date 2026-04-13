export interface Ghost {
  x: number;
  y: number;
  dx: number;
  dy: number;
  sp: number;
  color: string;
  del: number;
  dc: number;
  eaten: boolean;
  fr: boolean;
  scat: { x: number; y: number };
}

export interface GameState {
  map: number[][];
  totalDots: number;
  dotsEaten: number;

  // Pac-Man position & direction
  px: number;
  py: number;
  dx: number;
  dy: number;
  ndx: number;
  ndy: number;
  spd: number;

  // Scoring
  score: number;
  hi: number;
  lives: number;
  level: number;
  frame: number;

  // Flags
  started: boolean;
  dead: boolean;
  deadT: number;
  won: boolean;
  wonT: number;
  gameover: boolean;
  goT: number;
  paused: boolean;

  // Pac-Man mouth animation
  mouth: number;
  mouthD: number;

  // Fright mode
  frightTime: number;
  eatCombo: number;

  // Ghost scatter/chase cycle
  scatterMode: boolean;
  scatterTimer: number;
  scatterCycle: number;

  // Fruit bonus
  fruit: { x: number; y: number; active: boolean; timer: number; points: number };

  // Power-ups
  powerUp: { type: string; x: number; y: number; active: boolean; timer: number; effectTimer: number };

  // Cut-scene
  cutscene: boolean;
  cutsceneT: number;

  // Ghosts
  ghosts: Ghost[];
}
