import type { Board, Move, Piece } from "./types";
import { evaluateBoard } from "./heuristic";
import { applyMove, getAllWinningPatterns, getLegalMoves, getOpponent, getWinnerInfo } from "./rules";

interface SearchResult {
  score: number;
  move: Move | null;
}

const WIN_PATTERNS = getAllWinningPatterns();

function maxValue(
  board: Board,
  aiPiece: Piece,
  depth: number,
  depthLimit: number,
  alpha: number,
  beta: number,
): SearchResult {
  const winner = getWinnerInfo(board);
  if (winner || depth >= depthLimit) {
    return { score: evaluateBoard(board, aiPiece, WIN_PATTERNS), move: null };
  }

  const legalMoves = getLegalMoves(board, aiPiece);
  if (legalMoves.length === 0) {
    return { score: evaluateBoard(board, aiPiece, WIN_PATTERNS), move: null };
  }

  let bestScore = -Infinity;
  let bestMove: Move | null = null;

  for (const move of legalMoves) {
    const next = applyMove(board, aiPiece, move);
    const result = minValue(next, aiPiece, depth + 1, depthLimit, alpha, beta);
    if (result.score > bestScore) {
      bestScore = result.score;
      bestMove = move;
    }

    alpha = Math.max(alpha, bestScore);
    if (alpha >= beta) break;
  }

  return { score: bestScore, move: bestMove };
}

function minValue(
  board: Board,
  aiPiece: Piece,
  depth: number,
  depthLimit: number,
  alpha: number,
  beta: number,
): SearchResult {
  const winner = getWinnerInfo(board);
  if (winner || depth >= depthLimit) {
    return { score: evaluateBoard(board, aiPiece, WIN_PATTERNS), move: null };
  }

  const opp = getOpponent(aiPiece);
  const legalMoves = getLegalMoves(board, opp);
  if (legalMoves.length === 0) {
    return { score: evaluateBoard(board, aiPiece, WIN_PATTERNS), move: null };
  }

  let bestScore = Infinity;
  let bestMove: Move | null = null;

  for (const move of legalMoves) {
    const next = applyMove(board, opp, move);
    const result = maxValue(next, aiPiece, depth + 1, depthLimit, alpha, beta);
    if (result.score < bestScore) {
      bestScore = result.score;
      bestMove = move;
    }

    beta = Math.min(beta, bestScore);
    if (alpha >= beta) break;
  }

  return { score: bestScore, move: bestMove };
}

export function chooseBestMove(board: Board, aiPiece: Piece, depthLimit: number): Move | null {
  return maxValue(board, aiPiece, 0, depthLimit, -Infinity, Infinity).move;
}
