import { memo } from 'react';
import ProgressBar, { HEALTH_COLORS } from './ProgressBar.jsx';
import { getHealth } from '../lib/formulaEngine.js';

function TopBottom({ restaurants }) {
  const withScores = restaurants
    .filter(r => r.overall !== null)
    .sort((a, b) => b.overall - a.overall);

  const top5 = withScores.slice(0, 5);
  const bottom5 = [...withScores].reverse().slice(0, 5);

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.1s both' }}>
      <Panel title="Top 5 Performers" items={top5} icon={'\u2191'} accentColor="#10b981" />
      <Panel title="Bottom 5 Performers" items={bottom5} icon={'\u2193'} accentColor="#ef4444" />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default memo(TopBottom);

function Panel({ title, items, icon, accentColor }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 320,
      background: 'linear-gradient(135deg, #1a1d27, #16192380)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #2d3148',
      borderRadius: 14,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accentColor}50, transparent)`,
      }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 16,
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: 6,
          background: `${accentColor}20`, color: accentColor,
          fontSize: 12, fontWeight: 700,
        }}>
          {icon}
        </span>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((r, i) => {
          const health = getHealth(r.overall);
          const color = HEALTH_COLORS[health];
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 10px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid #2d314830',
              transition: 'background 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#2d3148'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = '#2d314830'; }}
            >
              <span style={{
                fontSize: 11, color: '#4b5563', width: 20, textAlign: 'center',
                fontWeight: 700, flexShrink: 0,
                background: '#1a1d27', borderRadius: 6, padding: '2px 0',
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                  {r.name}
                </div>
                <ProgressBar value={r.overall} height={5} color={color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0, minWidth: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {(r.overall * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
        {items.length === 0 && (
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', padding: '16px 0' }}>No data</div>
        )}
      </div>
    </div>
  );
}
