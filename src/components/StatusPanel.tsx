import { PIECE_LABEL } from "../game/constants";
import type { Phase, Piece } from "../game/types";

interface StatusPanelProps {
  phase: Phase;
  currentTurn: Piece;
  humanPiece: Piece;
  aiPiece: Piece;
  statusMessage: string;
  winner: Piece | null;
  aiDepth: number;
  isAiThinking: boolean;
  aiDecisionTimeMs: number | null;
  humanWins: number;
  aiWins: number;
  streakOwner: "human" | "ai" | null;
  streakCount: number;
  blackCount: number;
  redCount: number;
  onDepthChange: (depth: number) => void;
  onAiColorChange: (piece: Piece) => void;
  onRestart: () => void;
  onResetSeries: () => void;
}

export function StatusPanel({
  phase,
  currentTurn,
  humanPiece,
  aiPiece,
  statusMessage,
  winner,
  aiDepth,
  isAiThinking,
  aiDecisionTimeMs,
  humanWins,
  aiWins,
  streakOwner,
  streakCount,
  blackCount,
  redCount,
  onDepthChange,
  onAiColorChange,
  onRestart,
  onResetSeries,
}: StatusPanelProps) {
  const streakText =
    streakOwner === null ? "None" : `${streakOwner === "human" ? "Human" : "AI"} x${streakCount}`;

  return (
    <aside className="panel">
      <h2>Match Control</h2>
      <div className="status-grid">
        <div>
          <span className="label">Phase</span>
          <strong>{phase === "drop" ? "Drop phase" : "Move phase"}</strong>
        </div>
        <div>
          <span className="label">Turn</span>
          <strong>{PIECE_LABEL[currentTurn]}</strong>
        </div>
        <div>
          <span className="label">You</span>
          <strong>{PIECE_LABEL[humanPiece]}</strong>
        </div>
        <div>
          <span className="label">AI</span>
          <strong>{PIECE_LABEL[aiPiece]}</strong>
        </div>
      </div>

      <div className="series-board">
        <h3>Match Series</h3>
        <div className="series-row">
          <span className="label">Human wins</span>
          <strong>{humanWins}</strong>
        </div>
        <div className="series-row">
          <span className="label">AI wins</span>
          <strong>{aiWins}</strong>
        </div>
        <div className="series-row">
          <span className="label">Current streak</span>
          <strong>{streakText}</strong>
        </div>
      </div>

      <div className="status-message" data-winner={winner ? "true" : "false"}>
        {isAiThinking ? "AI is thinking..." : statusMessage}
      </div>

      <div className="controls">
        <label htmlFor="ai-color">AI color</label>
        <select
          id="ai-color"
          value={aiPiece}
          onChange={(e) => onAiColorChange(e.target.value as Piece)}
          disabled={blackCount > 0 || redCount > 0}
        >
          <option value="r">Red (you open as Black)</option>
          <option value="b">Black (AI opens)</option>
        </select>

        <label htmlFor="ai-depth">AI depth: {aiDepth}</label>
        <input
          id="ai-depth"
          type="range"
          min={1}
          max={4}
          value={aiDepth}
          onChange={(e) => onDepthChange(Number(e.target.value))}
        />
        <div className="ai-decision-time">
          Decision time: {aiDecisionTimeMs === null ? "--" : `${aiDecisionTimeMs} ms`}
        </div>

        <button type="button" className="restart-btn" onClick={onRestart}>
          Restart game
        </button>
        <button type="button" className="secondary-btn" onClick={onResetSeries}>
          Reset series
        </button>
      </div>

      <div className="rules">
        <h3>Quick rules</h3>
        <ul>
          <li>Drop phase: alternate placements until 8 total pieces.</li>
          <li>Move phase: move one piece to an adjacent empty cell (diagonals allowed).</li>
          <li>Win with 4 in a row (horizontal, vertical, diagonal) or a 2x2 square.</li>
        </ul>
      </div>
    </aside>
  );
}
