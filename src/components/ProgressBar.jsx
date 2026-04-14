import { getHealth } from '../lib/formulaEngine.js';

const HEALTH_COLORS = {
  Healthy:  '#10b981',
  Moderate: '#f59e0b',
  'At Risk': '#f97316',
  Critical: '#ef4444',
  'N/A':    '#374151',
};

export default function ProgressBar({ value, height = 4, showLabel = false, color }) {
  if (value === null || value === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showLabel && <span style={{ fontSize: 12, color: '#6b7280', minWidth: 38 }}>—</span>}
        <div style={{ flex: 1, height, background: '#1f2937', borderRadius: 9999 }} />
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, value * 100));
  const health = getHealth(value);
  const barColor = color || HEALTH_COLORS[health];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {showLabel && (
        <span style={{ fontSize: 12, color: '#e5e7eb', minWidth: 38, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {(pct).toFixed(1)}%
        </span>
      )}
      <div style={{ flex: 1, height, background: '#1f2937', borderRadius: 9999, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: 9999,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

export { HEALTH_COLORS };
