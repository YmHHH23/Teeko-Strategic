interface HistoryItem {
  id: number;
  text: string;
}

interface HistoryPanelProps {
  entries: HistoryItem[];
}

export function HistoryPanel({ entries }: HistoryPanelProps) {
  return (
    <section className="panel history-panel">
      <h2>Move History</h2>
      {entries.length === 0 ? (
        <p className="history-empty">No moves yet.</p>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
