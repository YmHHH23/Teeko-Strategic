import { BOARD_SIZE } from "../game/constants";
import type { Board, Position } from "../game/types";
import { Cell, isCellInPositions } from "./Cell";

interface TeekoBoardProps {
  board: Board;
  selectedPiece: Position | null;
  validTargets: Position[];
  winningPattern: Position[];
  onCellClick: (row: number, col: number) => void;
}

export function TeekoBoard({
  board,
  selectedPiece,
  validTargets,
  winningPattern,
  onCellClick,
}: TeekoBoardProps) {
  return (
    <div className="board-shell">
      <div className="board-labels top">
        {Array.from({ length: BOARD_SIZE }, (_, index) => (
          <span key={index}>{String.fromCharCode(65 + index)}</span>
        ))}
      </div>
      <div className="teeko-board" role="grid" aria-label="Teeko board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={cell}
              isSelected={!!selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex}
              isValidTarget={isCellInPositions(validTargets, rowIndex, colIndex)}
              isWinningCell={isCellInPositions(winningPattern, rowIndex, colIndex)}
              onClick={onCellClick}
            />
          )),
        )}
      </div>
      <div className="board-labels side">
        {Array.from({ length: BOARD_SIZE }, (_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>
    </div>
  );
}
