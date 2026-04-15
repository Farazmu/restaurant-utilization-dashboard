import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { CAT_COLORS } from './chartUtils.js';
import CustomTooltip, { barCursor } from './CustomTooltip.jsx';

export default function ModuleAdoption({ restaurants }) {
  const data = useMemo(() => {
    const moduleMap = {};
    for (const r of restaurants) {
      for (const mod of r.moduleDetails) {
        if (!moduleMap[mod.name]) moduleMap[mod.name] = { live: 0, total: 0, category: mod.category };
        moduleMap[mod.name].total++;
        if (mod.status === 'Live') moduleMap[mod.name].live++;
      }
    }
    return Object.entries(moduleMap)
      .map(([name, v]) => ({
        name,
        adoptionPct: v.total > 0 ? (v.live / v.total) * 100 : 0,
        category: v.category,
        color: CAT_COLORS[v.category] || '#6366f1',
        live: v.live,
        total: v.total,
      }))
      .sort((a, b) => b.adoptionPct - a.adoptionPct);
  }, [restaurants]);

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 22)}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
        <XAxis
          type="number" domain={[0, 100]}
          tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `${v}%`}
        />
        <YAxis
          type="category" dataKey="name" width={120}
          tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false}
        />
        <Tooltip cursor={barCursor} content={
          <CustomTooltip formatter={(entry) => {
            const d = entry.payload;
            return {
              title: d.name,
              primary: `${d.adoptionPct.toFixed(1)}% \u2014 ${d.live} of ${d.total} restaurants`,
              secondary: d.category,
            };
          }} />
        } />
        <Bar dataKey="adoptionPct" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
