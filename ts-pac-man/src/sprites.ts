// ============================================================
// PIXEL ART SPRITES - Anveshan Theme
// Each sprite is a 16x16 grid of hex color values
// null = transparent pixel
// Hand-crafted retro arcade style characters
// ============================================================

type Sprite = (string | null)[][];

// Color shortcuts for readability
const _ = null;           // Transparent
const W = '#FFFFFF';      // White
const K = '#111111';      // Black / outline
const BG = '#6B4226';     // Brown (legacy, enemy sprites)
// Amul-style cow palette: bold, high-contrast cartoon feel
const B = '#FFFFFF';      // Pure Amul white body
const S = '#1C1C1C';      // Black spot patches
const H = '#F2CB05';      // Anveshan gold horns / bell (brand tie-in)
const N = '#FF5C8A';      // Hot pink nose
const T = '#FF6A00';      // Saffron tilak (desi spiritual marker)

// ============================================================
// DESI COW - 16x16 pixel art
// Cream body, brown spots, horns, pink nose, cute eyes
// ============================================================

// Anveshan Amul cow — side profile: tilak, gold bell on chin, black patches
const COW_RIGHT: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, H, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, H, H, _, _, _, _],
  [_, _, _, _, _, _, K, K, K, K, K, H, K, _, _, _],
  [_, _, _, _, _, K, B, B, B, T, B, B, B, K, _, _],
  [_, _, _, _, K, B, B, B, B, B, B, B, B, B, K, _],
  [_, _, _, K, B, S, S, S, B, B, B, W, W, B, K, _],
  [_, _, K, B, S, S, S, S, S, B, B, W, K, B, K, _],
  [_, _, K, B, S, S, S, S, B, B, B, B, B, N, K, _],
  [_, _, K, B, B, B, B, B, B, B, B, B, N, N, K, _],
  [_, _, K, B, B, B, B, S, S, S, B, B, B, K, K, _],
  [_, _, _, K, B, B, B, S, S, B, B, B, K, H, H, _],
  [_, _, _, K, K, _, _, _, _, K, K, _, _, H, H, _],
  [_, _, _, B, B, _, _, _, _, B, B, _, _, K, K, _],
  [_, _, _, B, B, _, _, _, _, B, B, _, _, _, _, _],
  [_, _, _, K, K, _, _, _, _, K, K, _, _, _, _, _],
];

// Walk cycle frame B — front legs stepped forward, back legs slightly shifted
const COW_RIGHT_B: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, H, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, H, H, _, _, _, _],
  [_, _, _, _, _, _, K, K, K, K, K, H, K, _, _, _],
  [_, _, _, _, _, K, B, B, B, T, B, B, B, K, _, _],
  [_, _, _, _, K, B, B, B, B, B, B, B, B, B, K, _],
  [_, _, _, K, B, S, S, S, B, B, B, W, W, B, K, _],
  [_, _, K, B, S, S, S, S, S, B, B, W, K, B, K, _],
  [_, _, K, B, S, S, S, S, B, B, B, B, B, N, K, _],
  [_, _, K, B, B, B, B, B, B, B, B, B, N, N, K, _],
  [_, _, K, B, B, B, B, S, S, S, B, B, B, K, K, _],
  [_, _, _, K, B, B, B, S, S, B, B, B, K, H, H, _],
  [_, _, _, _, K, K, _, _, _, _, K, K, _, H, H, _],
  [_, _, _, _, B, B, _, _, _, _, B, B, _, K, K, _],
  [_, _, _, _, B, B, _, _, _, _, B, B, _, _, _, _],
  [_, _, _, _, K, K, _, _, _, _, K, K, _, _, _, _],
];

const COW_LEFT: Sprite = COW_RIGHT.map(row => [...row].reverse());
const COW_LEFT_B: Sprite = COW_RIGHT_B.map(row => [...row].reverse());

// Amul rear view: both horns visible, BIG shoulder patches, tail down the middle
const COW_UP: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, H, _, _, _, _, _, _, _, H, _, _, _],
  [_, _, _, _, H, H, _, _, _, _, _, H, H, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, _, _, K, B, B, B, B, B, B, B, B, B, K, _, _],
  [_, _, _, K, B, S, S, B, B, B, S, S, B, K, _, _],
  [_, _, K, B, S, S, S, B, B, S, S, S, B, B, K, _],
  [_, _, K, B, S, S, S, B, B, S, S, S, B, B, K, _],
  [_, _, K, B, B, B, B, B, B, B, B, B, B, B, K, _],
  [_, _, K, B, B, B, B, B, S, S, B, B, B, B, K, _],
  [_, _, K, B, B, B, B, S, S, S, S, B, B, B, K, _],
  [_, _, _, K, B, B, B, B, B, B, B, B, B, K, _, _],
  [_, _, _, K, K, _, _, K, K, _, _, K, K, _, _, _],
  [_, _, _, B, B, _, _, K, K, _, _, B, B, _, _, _],
  [_, _, _, B, B, _, _, K, K, _, _, B, B, _, _, _],
  [_, _, _, K, K, _, _, _, _, _, _, K, K, _, _, _],
];

// Walk frame B — legs shifted inward for mid-stride look
const COW_UP_B: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, H, _, _, _, _, _, _, _, H, _, _, _],
  [_, _, _, _, H, H, _, _, _, _, _, H, H, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, _, _, K, B, B, B, B, B, B, B, B, B, K, _, _],
  [_, _, _, K, B, S, S, B, B, B, S, S, B, K, _, _],
  [_, _, K, B, S, S, S, B, B, S, S, S, B, B, K, _],
  [_, _, K, B, S, S, S, B, B, S, S, S, B, B, K, _],
  [_, _, K, B, B, B, B, B, B, B, B, B, B, B, K, _],
  [_, _, K, B, B, B, B, B, S, S, B, B, B, B, K, _],
  [_, _, K, B, B, B, B, S, S, S, S, B, B, B, K, _],
  [_, _, _, K, B, B, B, B, B, B, B, B, B, K, _, _],
  [_, _, _, _, K, K, _, K, K, _, K, K, _, _, _, _],
  [_, _, _, _, B, B, _, K, K, _, B, B, _, _, _, _],
  [_, _, _, _, B, B, _, K, K, _, B, B, _, _, _, _],
  [_, _, _, _, K, K, _, _, _, _, K, K, _, _, _, _],
];

// Amul front view: gold horns, tilak on forehead, big eyes, smile, bell on chest
const COW_DOWN: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, H, _, _, _, _, _, _, _, H, _, _, _],
  [_, _, _, _, H, H, _, _, _, _, _, H, H, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, _, _, K, B, B, B, B, T, B, B, B, B, K, _, _],
  [_, _, H, K, B, W, W, B, B, B, W, W, B, K, H, _],
  [_, H, H, K, B, W, K, B, B, B, K, W, B, K, H, H],
  [_, H, H, K, B, B, B, B, B, B, B, B, B, K, H, H],
  [_, _, _, K, B, B, B, N, N, B, B, B, K, _, _, _],
  [_, _, _, K, B, B, N, N, N, N, B, B, K, _, _, _],
  [_, _, _, _, K, B, K, B, B, K, B, K, _, _, _, _],
  [_, _, _, K, B, B, B, K, K, B, B, B, K, _, _, _],
  [_, _, _, K, B, S, S, H, H, S, S, B, K, _, _, _],
  [_, _, _, K, B, B, S, K, K, S, B, B, K, _, _, _],
  [_, _, _, K, K, _, K, K, K, K, _, K, K, _, _, _],
  [_, _, _, K, K, _, K, K, K, K, _, K, K, _, _, _],
];

// Walk frame B — legs shifted (inward step)
const COW_DOWN_B: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, H, _, _, _, _, _, _, _, H, _, _, _],
  [_, _, _, _, H, H, _, _, _, _, _, H, H, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, _, _, K, B, B, B, B, T, B, B, B, B, K, _, _],
  [_, _, H, K, B, W, W, B, B, B, W, W, B, K, H, _],
  [_, H, H, K, B, W, K, B, B, B, K, W, B, K, H, H],
  [_, H, H, K, B, B, B, B, B, B, B, B, B, K, H, H],
  [_, _, _, K, B, B, B, N, N, B, B, B, K, _, _, _],
  [_, _, _, K, B, B, N, N, N, N, B, B, K, _, _, _],
  [_, _, _, _, K, B, K, B, B, K, B, K, _, _, _, _],
  [_, _, _, K, B, B, B, K, K, B, B, B, K, _, _, _],
  [_, _, _, K, B, S, S, H, H, S, S, B, K, _, _, _],
  [_, _, _, K, B, B, S, K, K, S, B, B, K, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, K, _, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, K, _, _, _, _],
];

// Blink frame — eyes closed (horizontal lines) for idle blink animation
const COW_DOWN_BLINK: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, H, _, _, _, _, _, _, _, H, _, _, _],
  [_, _, _, _, H, H, _, _, _, _, _, H, H, _, _, _],
  [_, _, _, _, K, K, K, K, K, K, K, K, K, _, _, _],
  [_, _, _, K, B, B, B, B, T, B, B, B, B, K, _, _],
  [_, _, H, K, B, B, B, B, B, B, B, B, B, K, H, _],
  [_, H, H, K, B, K, K, B, B, B, K, K, B, K, H, H],
  [_, H, H, K, B, B, B, B, B, B, B, B, B, K, H, H],
  [_, _, _, K, B, B, B, N, N, B, B, B, K, _, _, _],
  [_, _, _, K, B, B, N, N, N, N, B, B, K, _, _, _],
  [_, _, _, _, K, B, K, B, B, K, B, K, _, _, _, _],
  [_, _, _, K, B, B, B, K, K, B, B, B, K, _, _, _],
  [_, _, _, K, B, S, S, H, H, S, S, B, K, _, _, _],
  [_, _, _, K, B, B, S, K, K, S, B, B, K, _, _, _],
  [_, _, _, K, K, _, K, K, K, K, _, K, K, _, _, _],
  [_, _, _, K, K, _, K, K, K, K, _, K, K, _, _, _],
];

// ============================================================
// SODA CAN - Enemy 0 (Red fizzy drink)
// ============================================================

const SODA: Sprite = [
  [_, _, _, _, _, '#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0', _, _, _, _, _],
  [_, _, _, _, '#C0C0C0', '#A0A0A0', '#C0C0C0', '#C0C0C0', '#C0C0C0', '#C0C0C0', '#A0A0A0', _, _, _, _, _],
  [_, _, _, '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', _, _, _, _],
  [_, _, _, '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', _, _, _, _],
  [_, _, _, '#C0292F', W, W, '#E63946', '#E63946', '#E63946', W, W, '#C0292F', _, _, _, _],
  [_, _, _, '#C0292F', W, K, '#E63946', '#E63946', '#E63946', W, K, '#C0292F', _, _, _, _],
  [_, _, _, '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', _, _, _, _],
  [_, _, _, W, W, W, W, W, W, W, W, W, _, _, _, _],
  [_, _, _, W, '#E63946', W, 'SODA', _, _, W, '#E63946', W, _, _, _, _],
  [_, _, _, W, W, W, W, W, W, W, W, W, _, _, _, _],
  [_, _, _, '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', _, _, _, _],
  [_, _, _, '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', '#E63946', _, _, _, _],
  [_, _, _, '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', _, _, _, _],
  [_, _, _, _, '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', '#C0292F', _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ============================================================
// CHIPS PACKET - Enemy 1 (Orange processed snack)
// ============================================================

const CHIPS: Sprite = [
  [_, _, _, _, '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', _, _, _, _],
  [_, _, _, '#F77F00', '#FFAA00', '#F77F00', '#FFAA00', '#F77F00', '#FFAA00', '#F77F00', '#FFAA00', '#F77F00', _, _, _, _],
  [_, _, _, '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', _, _, _, _],
  [_, _, _, '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', _, _, _, _],
  [_, _, _, '#D06800', W, W, '#F77F00', '#F77F00', '#F77F00', W, W, '#D06800', _, _, _, _],
  [_, _, _, '#D06800', W, K, '#F77F00', '#F77F00', '#F77F00', W, K, '#D06800', _, _, _, _],
  [_, _, _, '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', _, _, _, _],
  [_, _, _, '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', _, _, _, _],
  [_, _, _, '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00', _, _, _, _],
  [_, _, _, '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', _, _, _, _],
  [_, _, _, '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', _, _, _, _],
  [_, _, _, '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', '#F77F00', _, _, _, _],
  [_, _, _, '#D06800', '#D06800', '#D06800', '#D06800', '#D06800', '#D06800', '#D06800', '#D06800', '#D06800', _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ============================================================
// CANDY - Enemy 2 (Pink artificial sweet)
// ============================================================

const CANDY: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, '#FF69B4', '#FF69B4', _, _, _, _, _, _, _, _, '#FF69B4', '#FF69B4', _, _],
  [_, '#FF69B4', '#FF8DC7', '#FF69B4', _, _, _, _, _, _, _, _, '#FF69B4', '#FF8DC7', '#FF69B4', _],
  [_, _, '#FF69B4', '#FF69B4', '#FF69B4', _, _, _, _, _, _, '#FF69B4', '#FF69B4', '#FF69B4', _, _],
  [_, _, _, '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', _, _, _, _],
  [_, _, _, '#FF69B4', '#FF69B4', W, W, '#FF69B4', '#FF69B4', W, W, '#FF69B4', _, _, _, _],
  [_, _, _, '#FF69B4', '#FF69B4', W, K, '#FF69B4', '#FF69B4', W, K, '#FF69B4', _, _, _, _],
  [_, _, _, '#FF69B4', '#FF8DC7', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF8DC7', '#FF69B4', _, _, _, _],
  [_, _, _, '#FF69B4', '#FF69B4', W, '#FF69B4', '#FF69B4', '#FF69B4', W, '#FF69B4', '#FF69B4', _, _, _, _],
  [_, _, _, '#FF69B4', '#FF8DC7', '#FF69B4', W, W, '#FF69B4', '#FF69B4', '#FF8DC7', '#FF69B4', _, _, _, _],
  [_, _, _, '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', _, _, _, _],
  [_, _, '#FF69B4', '#FF69B4', '#FF69B4', _, _, _, _, _, _, '#FF69B4', '#FF69B4', '#FF69B4', _, _],
  [_, '#FF69B4', '#FF8DC7', '#FF69B4', _, _, _, _, _, _, _, _, '#FF69B4', '#FF8DC7', '#FF69B4', _],
  [_, _, '#FF69B4', '#FF69B4', _, _, _, _, _, _, _, _, '#FF69B4', '#FF69B4', _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ============================================================
// PESTICIDE BOTTLE - Enemy 3 (Purple chemical)
// ============================================================

const PESTICIDE: Sprite = [
  [_, _, _, _, _, _, _, '#333', '#333', _, _, _, _, _, _, _],
  [_, _, _, _, _, _, '#333', '#333', '#333', '#333', _, _, _, _, _, _],
  [_, _, _, _, _, _, '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', _, _, _, _, _, _],
  [_, _, _, _, _, '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', _, _, _, _, _],
  [_, _, _, _, '#9B59B6', '#9B59B6', W, W, '#9B59B6', W, W, '#9B59B6', _, _, _, _],
  [_, _, _, _, '#9B59B6', '#9B59B6', W, K, '#9B59B6', W, K, '#9B59B6', _, _, _, _],
  [_, _, _, _, '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', _, _, _, _],
  [_, _, _, _, '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', _, _, _, _],
  [_, _, _, _, W, W, W, W, W, W, W, W, _, _, _, _],
  [_, _, _, _, W, W, '#FF0000', _, _, '#FF0000', W, W, _, _, _, _],
  [_, _, _, _, W, W, _, '#FF0000', '#FF0000', _, W, W, _, _, _, _],
  [_, _, _, _, W, W, '#FF0000', _, _, '#FF0000', W, W, _, _, _, _],
  [_, _, _, _, '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', _, _, _, _],
  [_, _, _, _, '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', '#9B59B6', _, _, _, _],
  [_, _, _, _, _, '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', '#7D3C98', _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ============================================================
// SCARED ENEMY - When cow eats A2 Ghee (frightened mode)
// ============================================================

const SCARED: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', _, _, _, _, _],
  [_, _, _, _, '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', _, _, _, _],
  [_, _, _, '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', '#00584B', W, W, '#00584B', '#00584B', W, W, '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', '#00584B', W, W, '#00584B', '#00584B', W, W, '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', W, '#00584B', W, '#00584B', W, '#00584B', W, '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', '#00584B', W, '#00584B', W, '#00584B', W, '#00584B', W, '#00584B', _, _, _],
  [_, _, _, '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', '#00584B', _, _, _],
  [_, _, _, '#00584B', _, '#00584B', _, '#00584B', '#00584B', _, '#00584B', _, '#00584B', _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ============================================================
// HONEY DROP - Small collectible dot (8x8)
// ============================================================

const HONEY_DROP: (string | null)[][] = [
  [_, _, _, '#F2A900', '#F2A900', _, _, _],
  [_, _, '#F2A900', '#F2A900', '#F2A900', '#F2A900', _, _],
  [_, '#F2A900', '#FFD54F', '#F2A900', '#F2A900', '#F2A900', '#F2A900', _],
  [_, '#F2A900', '#FFD54F', '#F2A900', '#F2A900', '#F2A900', '#F2A900', _],
  [_, '#F2A900', '#F2A900', '#F2A900', '#F2A900', '#F2A900', '#F2A900', _],
  [_, _, '#F2A900', '#F2A900', '#F2A900', '#F2A900', _, _],
  [_, _, _, '#D4910A', '#D4910A', _, _, _],
  [_, _, _, _, _, _, _, _],
];

// ============================================================
// GHEE JAR - Power pellet (12x12)
// Golden jar with "A2" label
// ============================================================

const GHEE_JAR: (string | null)[][] = [
  [_, _, _, _, '#C8A204', '#C8A204', '#C8A204', '#C8A204', _, _, _, _],
  [_, _, _, '#C8A204', '#C8A204', '#E8C805', '#E8C805', '#C8A204', '#C8A204', _, _, _],
  [_, _, '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', _, _],
  [_, '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', _],
  [_, '#F2CB05', '#F2CB05', W, W, '#F2CB05', '#F2CB05', W, W, '#F2CB05', '#F2CB05', _],
  [_, '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', '#F2CB05', _],
  [_, '#E8B805', W, W, W, W, W, W, W, W, '#E8B805', _],
  [_, '#E8B805', W, '#C8A204', '#C8A204', W, W, '#C8A204', '#C8A204', W, '#E8B805', _],
  [_, '#E8B805', W, '#C8A204', W, '#C8A204', '#C8A204', W, '#C8A204', W, '#E8B805', _],
  [_, '#E8B805', W, '#C8A204', W, '#C8A204', '#C8A204', '#C8A204', '#C8A204', W, '#E8B805', _],
  [_, _, '#C8A204', '#C8A204', '#C8A204', '#C8A204', '#C8A204', '#C8A204', '#C8A204', '#C8A204', _, _],
  [_, _, _, '#C8A204', '#C8A204', '#C8A204', '#C8A204', '#C8A204', '#C8A204', _, _, _],
];

// ============================================================
// EYES ONLY - For eaten enemies (returning to base)
// ============================================================

const EYES_ONLY: Sprite = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, W, W, _, _, W, W, _, _, _, _, _],
  [_, _, _, _, W, W, W, W, W, W, W, W, _, _, _, _],
  [_, _, _, _, W, W, K, _, W, W, K, _, _, _, _, _],
  [_, _, _, _, W, W, K, _, W, W, K, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];


// ============================================================
// FRUIT BONUS - Mango sprite (12x12)
// ============================================================
const MO = '#FF8C00'; // Orange
const MY = '#FFD700'; // Yellow
const MG = '#228B22'; // Green stem
const ML = '#32CD32'; // Light green leaf

const MANGO: Sprite = [
  [_, _, _, _, MG, MG, _, _, _, _, _, _],
  [_, _, _, MG, MG, ML, ML, _, _, _, _, _],
  [_, _, MY, MY, MO, MO, MO, MY, _, _, _, _],
  [_, MY, MO, MO, MO, MO, MO, MO, MY, _, _, _],
  [_, MO, MO, MO, MO, MO, MO, MO, MO, _, _, _],
  [_, MO, MO, MO, MO, MO, MO, MO, MO, _, _, _],
  [_, MO, MO, MO, MO, MO, MO, MO, MO, _, _, _],
  [_, MY, MO, MO, MO, MO, MO, MO, MY, _, _, _],
  [_, _, MY, MO, MO, MO, MO, MY, _, _, _, _],
  [_, _, _, MY, MY, MY, MY, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _],
];

// ============================================================
// SPRITE CACHE - Pre-render sprites to offscreen canvases
// for fast drawing (no per-pixel loop at runtime)
// ============================================================

const spriteCache = new Map<string, HTMLCanvasElement>();

function renderSpriteToCanvas(sprite: (string | null)[][], scale: number): HTMLCanvasElement {
  const h = sprite.length;
  const w = sprite[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d')!;

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const color = sprite[r][c];
      if (color && color !== 'SODA') {
        ctx.fillStyle = color;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }
  }

  return canvas;
}

function getCachedSprite(name: string, sprite: (string | null)[][], scale: number): HTMLCanvasElement {
  const key = `${name}_${scale}`;
  if (!spriteCache.has(key)) {
    spriteCache.set(key, renderSpriteToCanvas(sprite, scale));
  }
  return spriteCache.get(key)!;
}

// ============================================================
// PUBLIC API - Draw sprites centered at (x, y) on a canvas
// ============================================================

// Pre-cache all sprites at init
export function initSprites(): void {
  const cowS = 3; // Cow hero at 3x — dominant on screen (16×3 = 48px)
  const s = 2;    // Enemies / items at 2x
  getCachedSprite('cow_r', COW_RIGHT, cowS);
  getCachedSprite('cow_r_b', COW_RIGHT_B, cowS);
  getCachedSprite('cow_l', COW_LEFT, cowS);
  getCachedSprite('cow_l_b', COW_LEFT_B, cowS);
  getCachedSprite('cow_u', COW_UP, cowS);
  getCachedSprite('cow_u_b', COW_UP_B, cowS);
  getCachedSprite('cow_d', COW_DOWN, cowS);
  getCachedSprite('cow_d_b', COW_DOWN_B, cowS);
  getCachedSprite('cow_d_blink', COW_DOWN_BLINK, cowS);
  getCachedSprite('soda', SODA, s);
  getCachedSprite('chips', CHIPS, s);
  getCachedSprite('candy', CANDY, s);
  getCachedSprite('pesticide', PESTICIDE, s);
  getCachedSprite('scared', SCARED, s);
  getCachedSprite('eyes', EYES_ONLY, s);
  getCachedSprite('honey', HONEY_DROP, s);
  getCachedSprite('ghee', GHEE_JAR, s);
  getCachedSprite('mango', MANGO, s);
}

// Draw a 16x16 sprite centered at tile position
export function drawSprite(cx: CanvasRenderingContext2D, name: string, sprite: (string | null)[][], x: number, y: number, scale: number = 1): void {
  const cached = getCachedSprite(name, sprite, scale);
  cx.drawImage(cached, x - cached.width / 2, y - cached.height / 2);
}

// --- Cow sprite based on direction + frame (walk cycle + blink) ---
export function getCowSprite(dx: number, dy: number, frame: number): { name: string; sprite: Sprite } {
  const moving = dx !== 0 || dy !== 0;
  const walkB = moving && Math.floor(frame / 8) % 2 === 1;
  // Blink every ~3 seconds (180 frames), lasts 6 frames
  const blinking = (frame % 180) < 6;

  if (dx === 1) return walkB ? { name: 'cow_r_b', sprite: COW_RIGHT_B } : { name: 'cow_r', sprite: COW_RIGHT };
  if (dx === -1) return walkB ? { name: 'cow_l_b', sprite: COW_LEFT_B } : { name: 'cow_l', sprite: COW_LEFT };
  if (dy === -1) return walkB ? { name: 'cow_u_b', sprite: COW_UP_B } : { name: 'cow_u', sprite: COW_UP };
  if (dy === 1) {
    if (walkB) return { name: 'cow_d_b', sprite: COW_DOWN_B };
    if (blinking) return { name: 'cow_d_blink', sprite: COW_DOWN_BLINK };
    return { name: 'cow_d', sprite: COW_DOWN };
  }
  // Idle (no direction): front-facing with blink for personality
  if (blinking) return { name: 'cow_d_blink', sprite: COW_DOWN_BLINK };
  return { name: 'cow_d', sprite: COW_DOWN };
}

// --- Enemy sprites ---
const ENEMY_SPRITES: { name: string; sprite: Sprite }[] = [
  { name: 'soda', sprite: SODA },
  { name: 'chips', sprite: CHIPS },
  { name: 'candy', sprite: CANDY },
  { name: 'pesticide', sprite: PESTICIDE },
];

export function getEnemySprite(idx: number): { name: string; sprite: Sprite } {
  return ENEMY_SPRITES[idx];
}

export function getScaredSprite(): { name: string; sprite: Sprite } {
  return { name: 'scared', sprite: SCARED };
}

export function getEyesSprite(): { name: string; sprite: Sprite } {
  return { name: 'eyes', sprite: EYES_ONLY };
}

export function getHoneySprite(): { name: string; sprite: (string | null)[][] } {
  return { name: 'honey', sprite: HONEY_DROP };
}

export function getGheeSprite(): { name: string; sprite: (string | null)[][] } {
  return { name: 'ghee', sprite: GHEE_JAR };
}

export function getMangoSprite(): { name: string; sprite: (string | null)[][] } {
  return { name: 'mango', sprite: MANGO };
}

// Power-up indicator colors
export function getPowerUpColor(type: string): string {
  if (type === 'speed') return '#00FFFF';
  if (type === 'magnet') return '#FF00FF';
  if (type === 'freeze') return '#87CEEB';
  return '#FFFFFF';
}
