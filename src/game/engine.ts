import { DEFAULT_AI_DEPTH } from "./constants";
import { chooseBestMove } from "./minimax";
import { applyMove, getLegalMoves } from "./rules";
import type { Board, Move, Piece } from "./types";

export function getAiMove(board: Board, aiPiece: Piece, depth: number = DEFAULT_AI_DEPTH): Move | null {
  const chosen = chooseBestMove(board, aiPiece, depth);
  if (chosen) return chosen;

  // Fallback safety to always keep AI legal.
  const legal = getLegalMoves(board, aiPiece);
  return legal.length ? legal[0] : null;
}

export function getNextBoardAfterMove(board: Board, piece: Piece, move: Move): Board {
  return applyMove(board, piece, move);
}
