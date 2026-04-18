import { memo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HEALTH_COLORS } from './ProgressBar.jsx';

const HEALTH_ORDER = ['Healthy', 'Moderate', 'At Risk', 'Critical'];

function SummaryBar({ restaurants, healthFilter = 'All', onHealthFilterChange }) {
  if (!restaurants.length) return null;

  const validScores = restaurants.filter(r => r.overall !== null).map(r => r.overall);
  const avgUtil = validScores.length
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : null;

  const validHealthScores = restaurants.filter(r => r.healthScore !== null).map(r => r.healthScore);
  const avgHealthScore = validHealthScores.length
    ? validHealthScores.reduce((a, b) => a + b, 0) / validHealthScores.length
    : null;

  const counts = { Healthy: 0, Moderate: 0, 'At Risk': 0, Critical: 0, 'N/A': 0 };
  for (const r of restaurants) counts[r.health] = (counts[r.health] || 0) + 1;

  function handleBadgeClick(h) {
    if (!onHealthFilterChange) return;
    onHealthFilterChange(healthFilter === h ? 'All' : h);
  }

  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'stretch', animation: 'fadeUp 0.5s ease', flexWrap: 'wrap' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(150px, 1fr))', gap: 14, flex: 'none' }}>
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
          tooltip="The average across all restaurants shown. Utilization measures how much of the platform each restaurant is using — features like online ordering, kiosks, and loyalty each contribute. 100% means every applicable feature for that restaurant is live and active."
        />
        <StatCard
          label="Avg Health Score"
          value={avgHealthScore !== null ? `${(avgHealthScore * 100).toFixed(1)}%` : '---'}
          icon="&#x2764;"
          gradient="linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.04))"
          borderColor="#10b98140"
          accentColor="#6ee7b7"
          tooltip="The average health score across all restaurants shown. Health score is an overall rating — like a report card — based on how much of the platform each restaurant uses, with core features like Order & Pay weighted more heavily than others."
        />
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: '#2d3148', margin: '2px 4px', flexShrink: 0, alignSelf: 'stretch' }} />

      {/* Health filter badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(100px, 1fr))', gap: 14, flex: 1 }}>
        {HEALTH_ORDER.map(h => (
          <HealthBadge
            key={h}
            label={h}
            count={counts[h] || 0}
            color={HEALTH_COLORS[h]}
            active={healthFilter === h}
            onClick={() => handleBadgeClick(h)}
          />
        ))}
      </div>

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

function StatCard({ label, value, icon, gradient, borderColor, accentColor, tooltip }) {
  return (
    <div style={{
      background: gradient,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${borderColor}`,
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: accentColor, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      </div>
      <div style={{ fontSize: 26, opacity: 0.5, flexShrink: 0 }}>
        <span dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
    </div>
  );
}

function InfoTooltip({ text }) {
  const [coords, setCoords] = useState(null);
  const iconRef = useRef(null);

  function handleMouseEnter() {
    const rect = iconRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
  }

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setCoords(null)}
    >
      <span ref={iconRef} style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 13, height: 13, borderRadius: '50%',
        border: '1px solid #4b5563', color: '#6b7280',
        fontSize: 8, fontWeight: 700, cursor: 'default',
        lineHeight: 1, textTransform: 'none', letterSpacing: 0,
        userSelect: 'none', flexShrink: 0,
      }}>i</span>
      {coords && createPortal(
        <div style={{
          position: 'fixed', top: coords.top, left: coords.left,
          transform: 'translateX(-50%)',
          background: '#1e2433', border: '1px solid #374151',
          borderRadius: 10, padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          width: 240, zIndex: 9999,
          fontSize: 11, color: '#d1d5db', lineHeight: 1.6,
          fontWeight: 400, textTransform: 'none', letterSpacing: 0,
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '0 5px 5px', borderStyle: 'solid',
            borderColor: 'transparent transparent #374151',
          }} />
          {text}
        </div>,
        document.body
      )}
    </span>
  );
}

function HealthBadge({ label, count, color, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? `${color}25` : `linear-gradient(135deg, ${color}15, ${color}05)`,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${active ? color : `${color}30`}`,
        borderRadius: 14,
        padding: '18px 16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: active ? `0 0 16px ${color}30` : 'none',
        minWidth: 90,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${active ? color : `${color}60`}, transparent)`,
      }} />
      <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </div>
      {active && (
        <div style={{ fontSize: 9, color: `${color}99`, marginTop: 4, fontWeight: 600, letterSpacing: '0.06em' }}>
          FILTERED ✕
        </div>
      )}
    </div>
  );
}
