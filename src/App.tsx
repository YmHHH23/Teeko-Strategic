import { HistoryPanel } from "./components/HistoryPanel";
import { StatusPanel } from "./components/StatusPanel";
import { TeekoBoard } from "./components/TeekoBoard";
import { PIECE_LABEL } from "./game/constants";
import type { Piece } from "./game/types";
import { useTeekoGame } from "./hooks/useTeekoGame";
import "./styles.css";

function App() {
  const {
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
    aiDecisionTimeMs,
    seriesStats,
    stats,
    setAiDepth,
    setAiPiece,
    resetGame,
    resetSeries,
    handleHumanCellClick,
  } = useTeekoGame();

  return (
    <div className="app">
      <header className="header">
        <h1>Teeko Game</h1>
        <p>Play a polished 5x5 strategy duel against a depth-limited minimax AI.</p>
      </header>

      <main className="layout">
        <section className="board-panel panel">
          <div className="board-panel-head">
            <h2>Board</h2>
            <div className="chip-row">
              <span className="chip">Black: {stats.blackCount}</span>
              <span className="chip">Red: {stats.redCount}</span>
            </div>
          </div>

          <TeekoBoard
            board={board}
            selectedPiece={selectedPiece}
            validTargets={validTargets}
            winningPattern={winningPattern}
            onCellClick={handleHumanCellClick}
          />

          <div className="board-footer">
            <span>Phase: {phase === "drop" ? "Drop" : "Move"}</span>
            <span>Turn: {PIECE_LABEL[currentTurn]}</span>
            <span>{winner ? `Winner: ${PIECE_LABEL[winner]}` : statusMessage}</span>
          </div>
        </section>

        <div className="side-column">
          <StatusPanel
            phase={phase}
            currentTurn={currentTurn}
            humanPiece={humanPiece}
            aiPiece={aiPiece}
            statusMessage={statusMessage}
            winner={winner}
            aiDepth={aiDepth}
            isAiThinking={isAiThinking}
            aiDecisionTimeMs={aiDecisionTimeMs}
            humanWins={seriesStats.humanWins}
            aiWins={seriesStats.aiWins}
            streakOwner={seriesStats.streakOwner}
            streakCount={seriesStats.streakCount}
            blackCount={stats.blackCount}
            redCount={stats.redCount}
            onDepthChange={setAiDepth}
            onAiColorChange={(piece: Piece) => {
              setAiPiece(piece);
              resetGame(piece);
            }}
            onRestart={() => resetGame(aiPiece)}
            onResetSeries={resetSeries}
          />
          <HistoryPanel entries={history} />
        </div>
      </main>
    </div>
  );
}

export default App;
