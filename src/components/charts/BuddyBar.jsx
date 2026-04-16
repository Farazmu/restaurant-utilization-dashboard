import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import CustomTooltip, { barCursor } from './CustomTooltip.jsx';

export default function BuddyBar({ restaurants }) {
  const data = useMemo(() => {
    const buddyMap = {};
    for (const r of restaurants) {
      const buddy = r.aioBuddy || 'Unassigned';
      if (!buddyMap[buddy]) buddyMap[buddy] = { sum: 0, count: 0 };
      if (r.overall !== null) {
        buddyMap[buddy].sum += r.overall;
        buddyMap[buddy].count++;
      }
    }
    return Object.entries(buddyMap)
      .filter(([, v]) => v.count > 0)
      .map(([name, v]) => {
        const avg = (v.sum / v.count) * 100;
        const color = avg >= 70 ? '#10b981' : avg >= 50 ? '#f59e0b' : avg >= 30 ? '#f97316' : '#ef4444';
        return { name, avg, color, count: v.count };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [restaurants]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
        <XAxis
          type="number" domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `${v}%`}
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
              primary: `${d.avg.toFixed(1)}% \u2014 ${d.count} restaurant${d.count !== 1 ? 's' : ''}`,
            };
          }} />
        } />
        <Bar dataKey="avg" radius={[0, 6, 6, 0]} maxBarSize={24}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
