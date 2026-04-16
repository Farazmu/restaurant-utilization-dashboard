import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import CustomTooltip from './CustomTooltip.jsx';

const LIFECYCLE_COLORS = {
  Active:     '#10b981',
  Onboarding: '#3b82f6',
  Other:      '#6b7280',
};

const LIFECYCLE_LABELS = {
  Active:     'Active',
  Onboarding: 'Onboarding',
  Other:      'On Hold / Churned',
};

export default function LifecycleBreakdown({ restaurants }) {
  const data = useMemo(() => {
    const counts = {};
    for (const r of restaurants) {
      const lc = r.lifecycle || 'Other';
      counts[lc] = (counts[lc] || 0) + 1;
    }
    return ['Active', 'Onboarding', 'Other']
      .filter(lc => counts[lc])
      .map(lc => ({
        name: LIFECYCLE_LABELS[lc],
        value: counts[lc],
        color: LIFECYCLE_COLORS[lc],
      }));
  }, [restaurants]);

  const total = restaurants.length;

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={70} outerRadius={100}
            dataKey="value" nameKey="name"
            stroke="none"
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={
            <CustomTooltip formatter={(entry) => ({
              title: entry.name,
              primary: `${entry.value} restaurant${entry.value !== 1 ? 's' : ''} (${((entry.value / total) * 100).toFixed(1)}%)`,
            })} />
          } />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: '#9ca3af', fontSize: 11 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center text */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#f9fafb' }}>{total}</div>
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: -2 }}>Total</div>
      </div>
    </div>
  );
}
