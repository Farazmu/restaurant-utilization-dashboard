import { useEffect, useState, memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import StatusBadge from './StatusBadge.jsx';
import ProgressBar, { HEALTH_COLORS } from './ProgressBar.jsx';
import { CATEGORIES } from '../config/modules.js';
import { getHealth } from '../lib/formulaEngine.js';
import CustomTooltip, { barCursor } from './charts/CustomTooltip.jsx';

const CAT_COLORS = {
  'Order & Pay':     '#6366f1',
  'Marketing (On)':  '#8b5cf6',
  'Marketing (Off)': '#a78bfa',
  'Payroll':         '#10b981',
  'MoM':             '#f59e0b',
  'Tips + Office':   '#3b82f6',
};

function DetailDrawer({ restaurant, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!restaurant) return null;

  const health = restaurant.health;
  const hColor = HEALTH_COLORS[health] || '#6b7280';
  const pct = restaurant.overall !== null ? (restaurant.overall * 100).toFixed(1) : '—';

  const chartData = CATEGORIES.map(cat => {
    // Compute points-earned and points-possible for this category
    const catModules = (restaurant.moduleDetails || []).filter(m => m.category === cat);
    let ptsEarned = 0;
    let ptsPossible = 0;
    for (const m of catModules) {
      if (m.included) {
        ptsEarned += m.weight * m.score * 100;
        ptsPossible += m.weight * 100;
      }
    }
    return {
      name: cat,
      value: restaurant.categoryScores[cat] !== null
        ? parseFloat((restaurant.categoryScores[cat] * 100).toFixed(1))
        : 0,
      fill: CAT_COLORS[cat] || '#6366f1',
      ptsEarned,
      ptsPossible,
    };
  });

  const grouped = {};
  for (const mod of restaurant.moduleDetails) {
    if (!grouped[mod.category]) grouped[mod.category] = [];
    grouped[mod.category].push(mod);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 100, backdropFilter: 'blur(2px)',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 560, background: '#13161e',
        borderLeft: '1px solid #2d3148',
        zIndex: 101, overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.22s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2d3148',
          position: 'sticky', top: 0, background: '#13161e', zIndex: 1,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f9fafb', marginBottom: 6 }}>
              {restaurant.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 28, fontWeight: 800, color: hColor,
              }}>
                {pct}{pct !== '—' ? '%' : ''}
              </span>
              <HealthBadge health={health} color={hColor} />
              {restaurant.aioBuddy && (
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                  · {restaurant.aioBuddy}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#6b7280',
              cursor: 'pointer', fontSize: 20, padding: '0 4px', lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Category Chart */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2d3148' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Category Breakdown
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
              <XAxis
                type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={v => `${v}%`} axisLine={false} tickLine={false}
              />
              <YAxis
                type="category" dataKey="name" width={100}
                tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
              />
              <Tooltip cursor={barCursor} content={
                <CustomTooltip formatter={(entry) => {
                  const d = entry.payload;
                  return {
                    title: d.name,
                    primary: `${d.value}%`,
                    secondary: `${d.ptsEarned.toFixed(2)} of ${d.ptsPossible.toFixed(2)} pts`,
                  };
                }} />
              } />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Module Grid — Collapsible Accordion */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            All Modules
          </div>
          {CATEGORIES.map(cat => (
            <CategoryAccordion key={cat} category={cat} modules={grouped[cat] || []} color={CAT_COLORS[cat]} />
          ))}
        </div>

        {/* Formula Footer */}
        <FormulaFooter restaurant={restaurant} hColor={hColor} pct={pct} />
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default memo(DetailDrawer);

/** Export CAT_COLORS for reuse by other components */
export { CAT_COLORS };

function CategoryAccordion({ category, modules, color }) {
  const [expanded, setExpanded] = useState(true);
  const catScore = calcCatScore(modules);
  const catScoreHealth = catScore !== null ? getHealth(catScore) : null;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Accordion Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          background: '#1a1d27',
          border: '1px solid #2d3148',
          borderRadius: expanded ? '10px 10px 0 0' : 10,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#1f2433'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#1a1d27'; }}
      >
        <span style={{ fontSize: 11, color: '#6b7280', width: 12, flexShrink: 0 }}>
          {expanded ? '\u25BC' : '\u25B6'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
          {category}
        </span>
        {/* Mini progress bar */}
        <div style={{ flex: 1, minWidth: 60 }}>
          {catScore !== null ? (
            <ProgressBar value={catScore} height={4} color={HEALTH_COLORS[catScoreHealth] || color} />
          ) : (
            <div style={{ height: 4, background: '#1f2937', borderRadius: 9999 }} />
          )}
        </div>
        {catScore !== null && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', flexShrink: 0, minWidth: 44, textAlign: 'right' }}>
            {(catScore * 100).toFixed(1)}%
          </span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          border: '1px solid #2d3148',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden',
        }}>
          {modules.map((mod, i) => (
            <ModuleRow key={mod.fieldGid} mod={mod} isLast={i === modules.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleRow({ mod, isLast }) {
  const contribution = mod.included ? mod.weight * mod.score : null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 12px',
      background: '#141822',
      borderBottom: isLast ? 'none' : '1px solid #1f2433',
    }}>
      {/* Module name */}
      <span style={{ fontSize: 12, fontWeight: 500, color: '#e5e7eb', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {mod.name}
      </span>
      {/* Status badge */}
      <StatusBadge status={mod.status} />
      {/* Weight */}
      <span style={{ fontSize: 11, color: '#6b7280', minWidth: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {(mod.weight * 100).toFixed(2)}%
      </span>
      {/* Contribution */}
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        minWidth: 48,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        color: contribution !== null && contribution > 0 ? '#10b981' : '#6b7280',
      }}>
        {contribution !== null ? `+${(contribution * 100).toFixed(1)}%` : '\u2014'}
      </span>
    </div>
  );
}

function FormulaFooter({ restaurant, hColor, pct }) {
  const details = restaurant.moduleDetails || [];
  let numerator = 0;
  let denominator = 0;
  let includedCount = 0;
  let excludedCount = 0;

  for (const m of details) {
    if (m.included) {
      numerator += m.weight * m.score * 100;
      denominator += m.weight * 100;
      includedCount++;
    } else {
      excludedCount++;
    }
  }

  return (
    <div style={{
      padding: '20px 24px',
      borderTop: '1px solid #2d3148',
      background: '#11141b',
    }}>
      {/* Large overall score */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: hColor }}>
          {pct}{pct !== '\u2014' ? '%' : ''}
        </span>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Overall Utilization</div>
      </div>
      {/* Points breakdown */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: '#1a1d27',
        border: '1px solid #2d3148',
        borderRadius: 10,
        padding: '12px 16px',
        fontSize: 12,
        color: '#9ca3af',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Points earned / possible</span>
          <span style={{ color: '#e5e7eb', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {numerator.toFixed(2)} pts / {denominator.toFixed(2)} pts possible
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Included modules</span>
          <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{includedCount} of {details.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Excluded (Not Required / empty)</span>
          <span style={{ color: '#6b7280', fontWeight: 600 }}>{excludedCount} of {details.length}</span>
        </div>
      </div>
    </div>
  );
}

function HealthBadge({ health, color }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 600,
      background: `${color}20`,
      color,
    }}>
      {health}
    </span>
  );
}

function calcCatScore(modules) {
  let num = 0, den = 0;
  for (const m of modules) {
    if (m.included) {
      num += m.weight * m.score;
      den += m.weight;
    }
  }
  return den > 0 ? num / den : null;
}
