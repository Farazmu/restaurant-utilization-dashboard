import { memo } from 'react';
import { HEALTH_COLORS } from './ProgressBar.jsx';

const HEALTH_ORDER = ['Healthy', 'Moderate', 'At Risk', 'Critical'];

function SummaryBar({ restaurants }) {
  if (!restaurants.length) return null;

  const validScores = restaurants.filter(r => r.overall !== null).map(r => r.overall);
  const avgUtil = validScores.length
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : null;

  const counts = { Healthy: 0, Moderate: 0, 'At Risk': 0, Critical: 0, 'N/A': 0 };
  for (const r of restaurants) counts[r.health] = (counts[r.health] || 0) + 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, animation: 'fadeUp 0.5s ease' }}>
      <StatCard
        label="Total Restaurants"
        value={restaurants.length}
        icon="&#x1f3ea;"
        gradient="linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.04))"
        borderColor="#6366f140"
        accentColor="#a5b4fc"
      />
      <StatCard
        label="Avg Utilization"
        value={avgUtil !== null ? `${(avgUtil * 100).toFixed(1)}%` : '---'}
        icon="&#x1f4ca;"
        gradient="linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.04))"
        borderColor="#8b5cf640"
        accentColor="#c4b5fd"
      />
      {HEALTH_ORDER.map(h => (
        <HealthBadge key={h} label={h} count={counts[h] || 0} color={HEALTH_COLORS[h]} />
      ))}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default memo(SummaryBar);

function StatCard({ label, value, icon, gradient, borderColor, accentColor }) {
  return (
    <div style={{
      background: gradient,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${borderColor}`,
      borderRadius: 14,
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 12, right: 14, fontSize: 22, opacity: 0.3,
        filter: 'grayscale(0.3)',
      }}>
        <span dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
      <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accentColor, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function HealthBadge({ label, count, color }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${color}30`,
      borderRadius: 14,
      padding: '18px 16px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
      }} />
      <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </div>
    </div>
  );
}
