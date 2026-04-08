export function RulesPanel() {
  return (
    <section className="panel rules-panel">
      <h2>Quick Rules</h2>
      <ul>
        <li>Drop phase: alternate placements until 8 total pieces.</li>
        <li>Move phase: move one piece to an adjacent empty cell (diagonals allowed).</li>
        <li>Win with 4 in a row (horizontal, vertical, diagonal) or a 2x2 square.</li>
      </ul>
    </section>
  );
}
