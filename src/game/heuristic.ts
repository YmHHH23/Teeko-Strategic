import type { Board, Piece, Position } from "./types";
import { getOpponent, getWinnerInfo } from "./rules";

function scorePattern(board: Board, pattern: Position[], piece: Piece, opp: Piece): number {
  let mine = 0;
  let theirs = 0;

  for (const cell of pattern) {
    const value = board[cell.row][cell.col];
    if (value === piece) mine += 1;
    else if (value === opp) theirs += 1;
  }

  if (mine > 0 && theirs > 0) return 0;
  if (mine === 0 && theirs === 0) return 0.1;
  if (mine > 0) return mine * mine;
  if (theirs > 0) return -(theirs * theirs);
  return 0;
}

export function evaluateBoard(board: Board, piece: Piece, patterns: Position[][]): number {
  const winner = getWinnerInfo(board);
  if (winner) {
    return winner.winner === piece ? 1 : -1;
  }

  const opp = getOpponent(piece);
  let score = 0;
  for (const pattern of patterns) {
    score += scorePattern(board, pattern, piece, opp);
  }

  // Squash to (-1, 1) so terminal states remain the only +/-1.
  return Math.tanh(score / 25);
}
