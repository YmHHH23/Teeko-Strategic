import type { Piece, Position } from "./types";

export const BOARD_SIZE = 5;
export const PIECES_PER_PLAYER = 4;
export const DEFAULT_AI_DEPTH = 3;

export const ADJACENT_DIRECTIONS: Position[] = [
  { row: -1, col: -1 },
  { row: -1, col: 0 },
  { row: -1, col: 1 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
  { row: 1, col: -1 },
  { row: 1, col: 0 },
  { row: 1, col: 1 },
];

export const PIECE_LABEL: Record<Piece, string> = {
  b: "Black",
  r: "Red",
};
