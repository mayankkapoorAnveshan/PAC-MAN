// ============================================================
// LEADERBOARD - Top 5 scores saved to localStorage
// ============================================================

const STORAGE_KEY = 'pac_leaderboard';

export interface LeaderEntry {
  score: number;
  level: number;
  date: string;
}

export function getLeaderboard(): LeaderEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function addScore(score: number, level: number): LeaderEntry[] {
  const board = getLeaderboard();
  board.push({
    score,
    level,
    date: new Date().toLocaleDateString(),
  });
  board.sort((a, b) => b.score - a.score);
  const top5 = board.slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
  return top5;
}

export function drawLeaderboard(cx: CanvasRenderingContext2D, w: number, h: number): void {
  const board = getLeaderboard();
  if (board.length === 0) return;

  cx.fillStyle = '#F2CB05';
  cx.font = 'bold 11px monospace';
  cx.textAlign = 'center';
  cx.fillText('TOP SCORES', w / 2, h / 2 + 70);

  cx.font = '9px monospace';
  board.forEach((entry, i) => {
    const color = i === 0 ? '#FFD700' : '#fffbe8';
    cx.fillStyle = color;
    cx.fillText(
      `${i + 1}. ${entry.score} pts (Lv${entry.level})`,
      w / 2,
      h / 2 + 86 + i * 14,
    );
  });
  cx.textAlign = 'left';
}
