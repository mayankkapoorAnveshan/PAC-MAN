// ============================================================
// LEADERBOARD - Top 5 scores saved to localStorage
// Each entry can optionally carry a player name + email so the
// brand can build a marketing list from top-of-funnel players.
// ============================================================

const STORAGE_KEY = 'pac_leaderboard';
const EMAIL_KEY = 'pac_player_email';
const NAME_KEY = 'pac_player_name';

export interface LeaderEntry {
  score: number;
  level: number;
  date: string;
  name?: string;
  email?: string;
}

export function getLeaderboard(): LeaderEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function addScore(score: number, level: number, name?: string, email?: string): LeaderEntry[] {
  const board = getLeaderboard();
  board.push({
    score,
    level,
    date: new Date().toLocaleDateString(),
    name: name || getSavedName() || undefined,
    email: email || getSavedEmail() || undefined,
  });
  board.sort((a, b) => b.score - a.score);
  const top5 = board.slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
  return top5;
}

/** Update the most-recent matching score with a name+email after the
 *  player submits the capture form. Returns true if a row was patched. */
export function attachIdentityToScore(score: number, name: string, email: string): boolean {
  const board = getLeaderboard();
  const row = board.find(e => e.score === score && !e.email);
  if (!row) return false;
  row.name = name;
  row.email = email;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  saveIdentity(name, email);
  return true;
}

export function getSavedEmail(): string {
  return localStorage.getItem(EMAIL_KEY) || '';
}
export function getSavedName(): string {
  return localStorage.getItem(NAME_KEY) || '';
}
export function saveIdentity(name: string, email: string): void {
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(EMAIL_KEY, email);
}

/** True if the score would land in the top 5. */
export function qualifiesForLeaderboard(score: number): boolean {
  if (score <= 0) return false;
  const board = getLeaderboard();
  if (board.length < 5) return true;
  return score > board[board.length - 1].score;
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
    const label = entry.name ? `${entry.name.slice(0, 8)} ${entry.score}` : `${entry.score} pts`;
    cx.fillText(
      `${i + 1}. ${label} (Lv${entry.level})`,
      w / 2,
      h / 2 + 86 + i * 14,
    );
  });
  cx.textAlign = 'left';
}
