import { HEALTH_COLORS } from './ProgressBar.jsx';

const HEALTH_ORDER = ['Healthy', 'Moderate', 'At Risk', 'Critical'];

export default function SummaryBar({ restaurants }) {
  if (!restaurants.length) return null;

  const validScores = restaurants.filter(r => r.overall !== null).map(r => r.overall);
  const avgUtil = validScores.length
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : null;

  const counts = { Healthy: 0, Moderate: 0, 'At Risk': 0, Critical: 0, 'N/A': 0 };
  for (const r of restaurants) counts[r.health] = (counts[r.health] || 0) + 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <StatCard label="Total Restaurants" value={restaurants.length} accent="#6366f1" />
      <StatCard
        label="Avg Utilization"
        value={avgUtil !== null ? `${(avgUtil * 100).toFixed(1)}%` : '—'}
        accent="#6366f1"
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {HEALTH_ORDER.map(h => (
          <HealthBadge key={h} label={h} count={counts[h] || 0} color={HEALTH_COLORS[h]} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: '#1a1d27',
      border: '1px solid #2d3148',
      borderRadius: 10,
      padding: '12px 20px',
      minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#f9fafb' }}>{value}</div>
    </div>
  );
}

function HealthBadge({ label, count, color }) {
  return (
    <div style={{
      background: '#1a1d27',
      border: `1px solid ${color}40`,
      borderRadius: 10,
      padding: '12px 16px',
      minWidth: 90,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>
        {count}
      </div>
    </div>
  );
}
