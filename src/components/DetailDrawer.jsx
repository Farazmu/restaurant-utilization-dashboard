import { useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import StatusBadge from './StatusBadge.jsx';
import { HEALTH_COLORS } from './ProgressBar.jsx';
import { CATEGORIES } from '../config/modules.js';

const CAT_COLORS = {
  'Order & Pay':     '#6366f1',
  'Marketing (On)':  '#8b5cf6',
  'Marketing (Off)': '#a78bfa',
  'Payroll':         '#10b981',
  'MoM':             '#f59e0b',
  'Tips + Office':   '#3b82f6',
};

export default function DetailDrawer({ restaurant, onClose }) {
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

  const chartData = CATEGORIES.map(cat => ({
    name: cat,
    value: restaurant.categoryScores[cat] !== null
      ? parseFloat((restaurant.categoryScores[cat] * 100).toFixed(1))
      : 0,
    fill: CAT_COLORS[cat] || '#6366f1',
  }));

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
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12, color: '#e5e7eb' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
                formatter={(v, name, props) => [`${v}%`, props.payload.name]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Module Grid */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            All Modules
          </div>
          {CATEGORIES.map(cat => (
            <CategoryGroup key={cat} category={cat} modules={grouped[cat] || []} color={CAT_COLORS[cat]} />
          ))}
        </div>
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

function CategoryGroup({ category, modules, color }) {
  const catScore = calcCatScore(modules);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {category}
        </span>
        {catScore !== null && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>
            {(catScore * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
        {modules.map(mod => (
          <ModuleCard key={mod.fieldGid} mod={mod} />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ mod }) {
  return (
    <div style={{
      background: '#1a1d27',
      border: '1px solid #2d3148',
      borderRadius: 8,
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#e5e7eb', marginBottom: 2 }}>{mod.name}</div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>wt: {(mod.weight * 100).toFixed(2)}%</div>
      </div>
      <StatusBadge status={mod.status} />
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
