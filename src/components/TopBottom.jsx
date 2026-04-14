import ProgressBar, { HEALTH_COLORS } from './ProgressBar.jsx';
import { getHealth } from '../lib/formulaEngine.js';

export default function TopBottom({ restaurants }) {
  const withScores = restaurants
    .filter(r => r.overall !== null)
    .sort((a, b) => b.overall - a.overall);

  const top5 = withScores.slice(0, 5);
  const bottom5 = [...withScores].reverse().slice(0, 5);

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Panel title="Top 5" items={top5} />
      <Panel title="Bottom 5" items={bottom5} />
    </div>
  );
}

function Panel({ title, items }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 280,
      background: '#1a1d27',
      border: '1px solid #2d3148',
      borderRadius: 10,
      padding: '16px 20px',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((r, i) => {
          const health = getHealth(r.overall);
          const color = HEALTH_COLORS[health];
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#6b7280', width: 16, textAlign: 'right', flexShrink: 0 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                  {r.name}
                </div>
                <ProgressBar value={r.overall} height={5} color={color} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color, flexShrink: 0, minWidth: 40, textAlign: 'right' }}>
                {(r.overall * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
        {items.length === 0 && (
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', padding: '12px 0' }}>No data</div>
        )}
      </div>
    </div>
  );
}
