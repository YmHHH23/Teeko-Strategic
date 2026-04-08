import { ADJACENT_DIRECTIONS, BOARD_SIZE, PIECES_PER_PLAYER } from "./constants";
import type { Board, Move, Phase, Piece, Position, WinnerInfo } from "./types";

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => null));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function getOpponent(piece: Piece): Piece {
  return piece === "b" ? "r" : "b";
}

export function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

export function isSamePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isAdjacent(from: Position, to: Position): boolean {
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);
  return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
}

export function countPiece(board: Board, piece: Piece): number {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] === piece) count += 1;
    }
  }
  return count;
}

export function countTotalPieces(board: Board): number {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] !== null) count += 1;
    }
  }
  return count;
}

export function getPhase(board: Board): Phase {
  return countTotalPieces(board) < PIECES_PER_PLAYER * 2 ? "drop" : "move";
}

export function getAllPositionsForPiece(board: Board, piece: Piece): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] === piece) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

export function getAdjacentEmptyPositions(board: Board, from: Position): Position[] {
  const moves: Position[] = [];
  for (const direction of ADJACENT_DIRECTIONS) {
    const to = { row: from.row + direction.row, col: from.col + direction.col };
    if (isInBounds(to) && board[to.row][to.col] === null) {
      moves.push(to);
    }
  }
  return moves;
}

export function isLegalMove(board: Board, piece: Piece, move: Move): boolean {
  const phase = getPhase(board);
  const { to, from } = move;

  if (!isInBounds(to) || board[to.row][to.col] !== null) return false;

  if (phase === "drop") {
    if (from) return false;
    return countPiece(board, piece) < PIECES_PER_PLAYER;
  }

  if (!from || !isInBounds(from)) return false;
  if (board[from.row][from.col] !== piece) return false;
  return isAdjacent(from, to);
}

export function applyMove(board: Board, piece: Piece, move: Move): Board {
  const next = cloneBoard(board);
  if (move.from) {
    next[move.from.row][move.from.col] = null;
  }
  next[move.to.row][move.to.col] = piece;
  return next;
}

export function getLegalMoves(board: Board, piece: Piece): Move[] {
  const phase = getPhase(board);
  const moves: Move[] = [];

  if (phase === "drop") {
    if (countPiece(board, piece) >= PIECES_PER_PLAYER) return moves;
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        if (board[row][col] === null) {
          moves.push({ to: { row, col } });
        }
      }
    }
    return moves;
  }

  const piecePositions = getAllPositionsForPiece(board, piece);
  for (const from of piecePositions) {
    const destinations = getAdjacentEmptyPositions(board, from);
    for (const to of destinations) {
      moves.push({ from, to });
    }
  }
  return moves;
}

export function getAllWinningPatterns(): Position[][] {
  const patterns: Position[][] = [];

  // Horizontal lines of 4.
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col <= BOARD_SIZE - 4; col += 1) {
      patterns.push([
        { row, col },
        { row, col: col + 1 },
        { row, col: col + 2 },
        { row, col: col + 3 },
      ]);
    }
  }

  // Vertical lines of 4.
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    for (let row = 0; row <= BOARD_SIZE - 4; row += 1) {
      patterns.push([
        { row, col },
        { row: row + 1, col },
        { row: row + 2, col },
        { row: row + 3, col },
      ]);
    }
  }

  // Main diagonals of 4.
  for (let row = 0; row <= BOARD_SIZE - 4; row += 1) {
    for (let col = 0; col <= BOARD_SIZE - 4; col += 1) {
      patterns.push([
        { row, col },
        { row: row + 1, col: col + 1 },
        { row: row + 2, col: col + 2 },
        { row: row + 3, col: col + 3 },
      ]);
    }
  }

  // Anti-diagonals of 4.
  for (let row = 0; row <= BOARD_SIZE - 4; row += 1) {
    for (let col = 3; col < BOARD_SIZE; col += 1) {
      patterns.push([
        { row, col },
        { row: row + 1, col: col - 1 },
        { row: row + 2, col: col - 2 },
        { row: row + 3, col: col - 3 },
      ]);
    }
  }

  // 2x2 boxes.
  for (let row = 0; row < BOARD_SIZE - 1; row += 1) {
    for (let col = 0; col < BOARD_SIZE - 1; col += 1) {
      patterns.push([
        { row, col },
        { row, col: col + 1 },
        { row: row + 1, col },
        { row: row + 1, col: col + 1 },
      ]);
    }
  }

  return patterns;
}

const WIN_PATTERNS = getAllWinningPatterns();

export function getWinnerInfo(board: Board): WinnerInfo | null {
  for (const pattern of WIN_PATTERNS) {
    const first = board[pattern[0].row][pattern[0].col];
    if (!first) continue;

    let isWin = true;
    for (let i = 1; i < pattern.length; i += 1) {
      const cell = board[pattern[i].row][pattern[i].col];
      if (cell !== first) {
        isWin = false;
        break;
      }
    }
    if (isWin) {
      return { winner: first, pattern };
    }
  }
  return null;
}
