interface Props {
  sessionScores: number[];
}

export default function SessionStats({ sessionScores }: Props) {
  const n = sessionScores.length;
  const avg = n > 0 ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / n) : null;
  const best = n > 0 ? Math.max(...sessionScores) : null;

  return (
    <div className="session-row">
      <div className="session-stat">
        <div className="session-stat-val">{n}</div>
        <div className="session-stat-label">Questions done</div>
      </div>
      <div className="session-divider" />
      <div className="session-stat">
        <div className="session-stat-val">{avg ?? '—'}</div>
        <div className="session-stat-label">Avg structure score</div>
      </div>
      <div className="session-divider" />
      <div className="session-stat">
        <div className="session-stat-val">{best ?? '—'}</div>
        <div className="session-stat-label">Best score</div>
      </div>
    </div>
  );
}
