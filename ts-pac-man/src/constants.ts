export const T = 36;
export const COLS = 15;
export const ROWS = 25;
export const W = COLS * T;
export const H = ROWS * T;

// ============================================================
// ANVESHAN STORY THEME:
//   Hero     = Desi Cow (collecting honey drops for purity)
//   Enemies  = Adulterated food (soda, chips, candy, pesticide)
//   Dots     = Honey drops (golden drops)
//   Power    = A2 Ghee Jar (eat ghee = become powerful!)
// ============================================================

// Enemy colors: each represents an adulterated food type
//   Soda (red), Chips Packet (orange), Candy (pink), Pesticide (purple)
export const GHOST_COLORS = ['#E63946', '#F77F00', '#FF69B4', '#9B59B6'];

// Per-level mission targets: grass to collect + enemies to kill
export const LEVEL_OBJECTIVES: readonly { honey: number; kills: number }[] = [
  { honey: 4, kills: 4 }, // Level 1
  { honey: 3, kills: 4 }, // Level 2
  { honey: 2, kills: 4 }, // Level 3
];
export const MAX_LEVEL = LEVEL_OBJECTIVES.length;

// Anveshan brand palette (shared across all levels)
export const COLORS = {
  // Collectibles
  honeyDrop: '#F2A900',
  honeyDropSmall: '#D4910A',
  gheePellet: '#F2CB05',
  gheePelletJar: '#C8A204',

  // Desi Cow (hero)
  cow: '#F5F5DC',
  cowSpots: '#6B4226',
  cowNose: '#FFB6C1',
  cowHorns: '#D2B48C',
  cowDead: '#F5F5DC',

  // Frightened enemies (after eating ghee = powerful!)
  frightEnemy: '#00584B',
  frightFlash: '#fffbe8',

  // Eyes
  eyeWhite: '#FFF',
  eyePupil: '#012a24',

  // UI text colors
  titleMain: '#F2CB05',
  titleSub: '#4ecdc4',
  textPrimary: '#fffbe8',
  gameoverText: '#e74c3c',
} as const;

// ============================================================
// PER-LEVEL THEMES — each level gets its own visual identity
//   L1: Farm Fresh   (Anveshan teal — clean, pure, organic)
//   L2: Bazaar Heat  (saffron/orange — busy Indian market)
//   L3: Factory Danger (crimson/pink — industrial threat)
// ============================================================

export interface LevelTheme {
  name: string;
  bg: string;
  wall: string;
  wallGlow: string;
  ghostDoor: string;
  overlayBg: string;
  winFlash: string;
  textMuted: string;
}

const LEVEL_THEMES: LevelTheme[] = [
  {
    name: 'Farm Fresh',
    bg: '#011f1a',
    wall: '#00584B',
    wallGlow: '#4ecdc4',
    ghostDoor: '#F2CB05',
    overlayBg: 'rgba(1,31,26,0.9)',
    winFlash: 'rgba(242,203,5,0.1)',
    textMuted: '#4a8a7a',
  },
  {
    name: 'Bazaar Heat',
    bg: '#1a0f00',
    wall: '#B85C1E',
    wallGlow: '#FF9F43',
    ghostDoor: '#FFD93D',
    overlayBg: 'rgba(26,15,0,0.9)',
    winFlash: 'rgba(255,159,67,0.1)',
    textMuted: '#8a6a3a',
  },
  {
    name: 'Factory Danger',
    bg: '#1a0510',
    wall: '#8B1A4A',
    wallGlow: '#E84393',
    ghostDoor: '#FD79A8',
    overlayBg: 'rgba(26,5,16,0.9)',
    winFlash: 'rgba(232,67,147,0.1)',
    textMuted: '#8a4a6a',
  },
];

/** Get the theme for a given level (1-indexed). Levels beyond 3 cycle. */
export function getLevelTheme(level: number): LevelTheme {
  return LEVEL_THEMES[((level - 1) % LEVEL_THEMES.length)];
}

// 15 x 25 grid — narrow portrait aspect (0.60) fits mobile screens
// far better than the old near-square 21x23. Same template is used for
// every level for now; level theming still differs by color palette.
//   1 = wall, 2 = honey drop (dot), 3 = honey pot (power pellet),
//   0 = empty (tunnel / ghost-house interior / below-maze HUD rows 23-24)
// Ghost house: cols 6-8, rows 9-11 (exit upward through col 6/7/8 → row 8)
export const MAP_TEMPLATES: readonly (readonly number[][])[] = [
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // 0
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 1
    [1,2,1,2,1,1,2,1,2,1,1,2,1,2,1], // 2
    [1,3,2,2,2,2,2,2,2,2,2,2,2,3,1], // 3  honey pots NW/NE
    [1,2,1,2,1,2,1,1,1,2,1,2,1,2,1], // 4
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 5
    [1,1,1,2,1,1,1,2,1,1,1,2,1,1,1], // 6
    [0,0,0,2,2,2,2,2,2,2,2,2,0,0,0], // 7  tunnel row
    [1,1,1,2,1,1,2,2,2,1,1,2,1,1,1], // 8  house approach
    [0,0,0,2,2,1,0,0,0,1,2,2,0,0,0], // 9  tunnel + house top
    [1,1,1,1,2,1,0,0,0,1,2,1,1,1,1], // 10 house middle
    [0,0,0,0,2,1,0,0,0,1,2,0,0,0,0], // 11 tunnel + house bottom
    [1,1,1,1,2,1,1,1,1,1,2,1,1,1,1], // 12 below house
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 13
    [1,2,1,2,1,2,1,1,1,2,1,2,1,2,1], // 14
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 15
    [1,1,1,2,1,1,1,2,1,1,1,2,1,1,1], // 16
    [1,3,2,2,2,2,2,2,2,2,2,2,2,3,1], // 17 honey pots SW/SE
    [1,2,1,1,1,2,1,2,1,2,1,1,1,2,1], // 18
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 19
    [1,2,1,2,1,2,1,2,1,2,1,2,1,2,1], // 20
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // 21
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // 22 bottom wall
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 23 HUD
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // 24 HUD
  ],
];

// Keep backward compat
export const MAP_TEMPLATE = MAP_TEMPLATES[0];

export function getMapForLevel(level: number): readonly number[][] {
  return MAP_TEMPLATES[(level - 1) % MAP_TEMPLATES.length];
}
