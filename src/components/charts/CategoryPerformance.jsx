import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ReferenceLine,
} from 'recharts';
import { CATEGORIES } from '../../config/modules.js';
import { CAT_COLORS } from './chartUtils.js';
import CustomTooltip, { barCursor } from './CustomTooltip.jsx';

export default function CategoryPerformance({ restaurants }) {
  const { data, avgOverall } = useMemo(() => {
    const catSums = {};
    const catCounts = {};
    const catLive = {};
    for (const cat of CATEGORIES) { catSums[cat] = 0; catCounts[cat] = 0; catLive[cat] = 0; }
    for (const r of restaurants) {
      for (const cat of CATEGORIES) {
        if (r.categoryScores[cat] !== null && r.categoryScores[cat] !== undefined) {
          catSums[cat] += r.categoryScores[cat];
          catCounts[cat]++;
          if (r.categoryScores[cat] > 0) catLive[cat]++;
        }
      }
    }
    const totalRestaurants = restaurants.length;
    const data = CATEGORIES.map(cat => ({
      name: cat,
      avg: catCounts[cat] > 0 ? (catSums[cat] / catCounts[cat]) * 100 : 0,
      color: CAT_COLORS[cat] || '#6366f1',
      liveCount: catLive[cat],
      totalCount: totalRestaurants,
    }));

    const validScores = restaurants.filter(r => r.overall !== null).map(r => r.overall);
    const avgOverall = validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length) * 100
      : 0;

    return { data, avgOverall };
  }, [restaurants]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          axisLine={false} tickLine={false}
          interval={0} angle={-15} textAnchor="end" height={50}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false} tickLine={false}
          tickFormatter={v => `${v}%`}
        />
        <Tooltip cursor={barCursor} content={
          <CustomTooltip formatter={(entry) => {
            const d = entry.payload;
            return {
              title: d.name,
              primary: `${d.avg.toFixed(1)}%`,
              secondary: `${d.liveCount} of ${d.totalCount} restaurants scoring > 0`,
            };
          }} />
        } />
        <ReferenceLine
          y={avgOverall}
          stroke="#6366f1"
          strokeDasharray="5 5"
          strokeOpacity={0.5}
          label={{ value: `Overall ${avgOverall.toFixed(1)}%`, fill: '#6366f1', fontSize: 10, position: 'right' }}
        />
        <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
