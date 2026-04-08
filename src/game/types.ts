export type Piece = "b" | "r";
export type CellValue = Piece | null;
export type Board = CellValue[][];
export type Phase = "drop" | "move";

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  to: Position;
  from?: Position;
}

export interface WinnerInfo {
  winner: Piece;
  pattern: Position[];
}
