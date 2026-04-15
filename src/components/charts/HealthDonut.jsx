import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { HEALTH_COLORS_MAP } from './chartUtils.js';
import CustomTooltip from './CustomTooltip.jsx';

const HEALTH_ORDER = ['Healthy', 'Moderate', 'At Risk', 'Critical'];

export default function HealthDonut({ restaurants }) {
  const data = useMemo(() => {
    const counts = {};
    for (const r of restaurants) {
      counts[r.health] = (counts[r.health] || 0) + 1;
    }
    return HEALTH_ORDER
      .filter(h => counts[h])
      .map(h => ({ name: h, value: counts[h], color: HEALTH_COLORS_MAP[h] }));
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
