import { useEffect, useMemo, useState } from "react";
import { DEFAULT_AI_DEPTH, PIECE_LABEL } from "../game/constants";
import { getAiMove, getNextBoardAfterMove } from "../game/engine";
import {
  createEmptyBoard,
  getAdjacentEmptyPositions,
  getPhase,
  getWinnerInfo,
  isLegalMove,
  isSamePosition,
} from "../game/rules";
import type { Board, Move, Phase, Piece, Position } from "../game/types";

interface HistoryEntry {
  id: number;
  piece: Piece;
  text: string;
}

function label(pos: Position): string {
  return `${String.fromCharCode(65 + pos.col)}${pos.row + 1}`;
}

function describeMove(move: Move): string {
  if (!move.from) return `placed at ${label(move.to)}`;
  return `moved ${label(move.from)} → ${label(move.to)}`;
}

export function useTeekoGame() {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [aiPiece, setAiPiece] = useState<Piece>("r");
  const [currentTurn, setCurrentTurn] = useState<Piece>("b");
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Your turn.");
  const [winner, setWinner] = useState<Piece | null>(null);
  const [winningPattern, setWinningPattern] = useState<Position[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [aiDepth, setAiDepth] = useState<number>(DEFAULT_AI_DEPTH);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [moveCounter, setMoveCounter] = useState(1);

  const humanPiece: Piece = aiPiece === "b" ? "r" : "b";
  const phase: Phase = getPhase(board);
  const isHumanTurn = currentTurn === humanPiece;

  const validTargets = useMemo(() => {
    if (!selectedPiece || phase === "drop") return [];
    return getAdjacentEmptyPositions(board, selectedPiece);
  }, [board, phase, selectedPiece]);

  const resetGame = (nextAiPiece: Piece = aiPiece) => {
    setBoard(createEmptyBoard());
    setAiPiece(nextAiPiece);
    setCurrentTurn("b");
    setSelectedPiece(null);
    setStatusMessage(nextAiPiece === "b" ? "AI opens as Black." : "Your turn.");
    setWinner(null);
    setWinningPattern([]);
    setHistory([]);
    setMoveCounter(1);
    setIsAiThinking(false);
  };

  const pushHistory = (piece: Piece, move: Move) => {
    const entry: HistoryEntry = {
      id: moveCounter,
      piece,
      text: `${PIECE_LABEL[piece]} ${describeMove(move)}`,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 40));
    setMoveCounter((prev) => prev + 1);
  };

  const commitMove = (piece: Piece, move: Move) => {
    const nextBoard = getNextBoardAfterMove(board, piece, move);
    const result = getWinnerInfo(nextBoard);

    setBoard(nextBoard);
    pushHistory(piece, move);
    setSelectedPiece(null);

    if (result) {
      setWinner(result.winner);
      setWinningPattern(result.pattern);
      setStatusMessage(`${PIECE_LABEL[result.winner]} wins.`);
      return;
    }

    const nextTurn: Piece = piece === "b" ? "r" : "b";
    setCurrentTurn(nextTurn);
    setStatusMessage(nextTurn === humanPiece ? "Your turn." : "AI is thinking...");
  };

  const handleHumanCellClick = (row: number, col: number) => {
    if (!isHumanTurn || winner || isAiThinking) return;
    const clicked = { row, col };
    const cell = board[row][col];

    if (phase === "drop") {
      const move: Move = { to: clicked };
      if (!isLegalMove(board, humanPiece, move)) {
        setStatusMessage("Pick an empty cell during drop phase.");
        return;
      }
      commitMove(humanPiece, move);
      return;
    }

    if (!selectedPiece) {
      if (cell === humanPiece) {
        setSelectedPiece(clicked);
        setStatusMessage("Select an adjacent empty cell.");
      } else {
        setStatusMessage("Select one of your pieces first.");
      }
      return;
    }

    if (cell === humanPiece) {
      if (isSamePosition(selectedPiece, clicked)) {
        setSelectedPiece(null);
        setStatusMessage("Selection cleared.");
      } else {
        setSelectedPiece(clicked);
        setStatusMessage("Piece switched. Pick destination.");
      }
      return;
    }

    const move: Move = { from: selectedPiece, to: clicked };
    if (!isLegalMove(board, humanPiece, move)) {
      setStatusMessage("Illegal move. Destination must be adjacent and empty.");
      return;
    }
    commitMove(humanPiece, move);
  };

  useEffect(() => {
    if (winner || currentTurn !== aiPiece) return;

    setIsAiThinking(true);
    setStatusMessage("AI is thinking...");

    const timer = window.setTimeout(() => {
      const aiMove = getAiMove(board, aiPiece, aiDepth);
      setIsAiThinking(false);

      if (!aiMove) {
        setStatusMessage("No legal moves available.");
        return;
      }
      commitMove(aiPiece, aiMove);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [aiDepth, aiPiece, board, currentTurn, winner]);

  const stats = useMemo(() => {
    const blackCount = board.flat().filter((cell) => cell === "b").length;
    const redCount = board.flat().filter((cell) => cell === "r").length;
    return { blackCount, redCount };
  }, [board]);

  return {
    board,
    phase,
    currentTurn,
    humanPiece,
    aiPiece,
    winner,
    winningPattern,
    selectedPiece,
    validTargets,
    statusMessage,
    history,
    aiDepth,
    isAiThinking,
    stats,
    setAiDepth,
    setAiPiece,
    resetGame,
    handleHumanCellClick,
  };
}
