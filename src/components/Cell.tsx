import type { CellValue, Position } from "../game/types";

interface CellProps {
  row: number;
  col: number;
  value: CellValue;
  isSelected: boolean;
  isValidTarget: boolean;
  isWinningCell: boolean;
  onClick: (row: number, col: number) => void;
}

function containsPosition(list: Position[], row: number, col: number): boolean {
  return list.some((p) => p.row === row && p.col === col);
}

export function Cell({
  row,
  col,
  value,
  isSelected,
  isValidTarget,
  isWinningCell,
  onClick,
}: CellProps) {
  const classes = [
    "teeko-cell",
    isSelected ? "selected" : "",
    isValidTarget ? "valid-target" : "",
    isWinningCell ? "winning" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const pieceClass = value === "b" ? "piece piece-black" : value === "r" ? "piece piece-red" : "";

  return (
    <button type="button" className={classes} onClick={() => onClick(row, col)} aria-label={`Cell ${row},${col}`}>
      {value && <span className={pieceClass} />}
      {!value && isValidTarget && <span className="target-dot" />}
    </button>
  );
}

export function isCellInPositions(positions: Position[], row: number, col: number): boolean {
  return containsPosition(positions, row, col);
}
