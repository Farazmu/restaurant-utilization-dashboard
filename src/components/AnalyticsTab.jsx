import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, ReferenceLine, ComposedChart, Legend,
  Treemap,
} from 'recharts';
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

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12, color: '#e5e7eb' },
  labelStyle: { color: '#e5e7eb' },
  itemStyle: { color: '#e5e7eb' },
};

function ChartCard({ children, title, subtitle, span = 1, style = {} }) {
  return (
    <div style={{
      background: '#1a1d27',
      border: '1px solid #2d3148',
      borderRadius: 12,
      padding: '20px 24px',
      gridColumn: span === 'full' ? '1 / -1' : `span ${span}`,
      ...style,
    }}>
      {title && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f3f4f6', marginBottom: 4 }}>{title}</div>
      )}
      {subtitle && (
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 16 }}>{subtitle}</div>
      )}
      {children}
    </div>
  );
}

export default function AnalyticsTab({ restaurants }) {
  const data = useMemo(() => computeAll(restaurants), [restaurants]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Row 1: Utilization Distribution (2fr) + Health Donut (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <ChartCard title="Utilization Distribution" subtitle="How restaurants spread across utilization bands">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.distBins} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40}
                label={{ position: 'top', fill: '#9ca3af', fontSize: 11 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Health Breakdown" subtitle="Restaurant health distribution">
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.healthPie}
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={95}
                  dataKey="value" nameKey="name"
                  stroke="none"
                >
                  {data.healthPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f9fafb' }}>{restaurants.length}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: -2 }}>Restaurants</div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Category Drag Analysis (full width) */}
      <ChartCard title="Category Drag Analysis" subtitle="Which categories drag utilization down the most?">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.catDrag} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis
              type="number" domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <YAxis
              type="category" dataKey="name" width={110}
              tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
            />
            <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              formatter={v => [`${v.toFixed(1)}%`, 'Avg Gap']}
            />
            <Bar dataKey="gap" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.catDrag.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 3: Category Box Plot (1fr) + AIO Buddy Bar (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="Category Score Spread" subtitle="Score distribution within each category (IQR + median)">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.boxPlot} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                formatter={(v, name) => {
                  if (name === 'iqr') return [`Q1-Q3 range`, 'IQR'];
                  if (name === 'median') return [`${v.toFixed(1)}%`, 'Median'];
                  if (name === 'base') return [null, null];
                  return [`${v.toFixed(1)}%`, name];
                }}
                itemSorter={() => 0}
              />
              {/* Invisible base bar to offset IQR */}
              <Bar dataKey="base" stackId="box" fill="transparent" maxBarSize={30} />
              {/* IQR bar */}
              <Bar dataKey="iqr" stackId="box" radius={[4, 4, 4, 4]} maxBarSize={30}>
                {data.boxPlot.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.5} />
                ))}
              </Bar>
              {/* Median dots */}
              <Scatter dataKey="median" fill="#f9fafb" shape="circle" r={4} />
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: '#6b7280' }}>Bar = IQR (25th-75th pctl)</span>
            <span style={{ fontSize: 10, color: '#6b7280' }}>Dot = Median</span>
          </div>
        </ChartCard>

        <ChartCard title="AIO Buddy Performance" subtitle="Average utilization per buddy">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.buddyBar} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                formatter={(v, name) => [`${v.toFixed(1)}%`, name === 'avg' ? 'Avg Utilization' : name]}
              />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]} maxBarSize={35}>
                {data.buddyBar.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: Scatter Plot (full width) */}
      <ChartCard title="Live Modules vs Utilization" subtitle="Do restaurants with more live modules score higher?">
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" dataKey="liveCount" name="Live Modules"
              tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false}
              label={{ value: 'Live Modules', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis type="number" dataKey="util" name="Utilization %"
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <ZAxis range={[40, 40]} />
            <Tooltip {...TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }}
              formatter={(v, name) => {
                if (name === 'Utilization %') return [`${v.toFixed(1)}%`, name];
                return [v, name];
              }}
              labelFormatter={() => ''}
            />
            <ReferenceLine y={data.avgUtil} stroke="#6366f1" strokeDasharray="5 5" strokeOpacity={0.6}
              label={{ value: `Avg ${data.avgUtil.toFixed(1)}%`, fill: '#6366f1', fontSize: 10, position: 'right' }}
            />
            <Scatter data={data.scatter}>
              {data.scatter.map((entry, i) => (
                <Cell key={i} fill={HEALTH_COLORS[entry.health] || '#6b7280'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 5: Treemap (1fr) + Radar (1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="AIO Buddy Portfolio" subtitle="Portfolio balance per buddy">
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={data.treemapData}
              dataKey="size"
              nameKey="name"
              content={<TreemapContent />}
            />
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Radar" subtitle="Average score per category across all restaurants">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#2d3148" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v.toFixed(1)}%`, 'Avg Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 6: Module Adoption Heatmap (full width) */}
      <ChartCard title="Module Adoption Heatmap" subtitle="Percentage of restaurants with each module live">
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.heatmapData.map((mod, i) => {
              const pct = mod.adoptionPct;
              const bg = pct >= 70 ? '#10b98130' : pct >= 40 ? '#f59e0b30' : '#ef444430';
              const fg = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={i} style={{
                  background: bg, borderRadius: 6, padding: '8px 10px', minWidth: 100,
                  border: `1px solid ${fg}30`,
                }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{mod.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: fg }}>{pct.toFixed(0)}%</div>
                  <div style={{ fontSize: 9, color: '#6b7280' }}>{mod.category}</div>
                </div>
              );
            })}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}

/* ─── Treemap custom content ─── */
function TreemapContent({ x, y, width, height, name, color, count }) {
  if (width < 30 || height < 30) return null;
  const truncated = name && name.length > Math.floor(width / 7) ? name.slice(0, Math.floor(width / 7)) + '...' : name;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4}
        style={{ fill: color || '#374151', stroke: '#0f1117', strokeWidth: 2 }}
      />
      {width > 40 && height > 40 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
            {truncated}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10}>
            {count} rest.
          </text>
        </>
      )}
    </g>
  );
}

/* ─── Data computation ─── */
function computeAll(restaurants) {
  // Distribution bins
  const bins = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
  const binCounts = [0, 0, 0, 0, 0];
  for (const r of restaurants) {
    if (r.overall === null) continue;
    const pct = r.overall * 100;
    const idx = pct >= 100 ? 4 : Math.floor(pct / 20);
    binCounts[idx]++;
  }
  const distBins = bins.map((range, i) => ({ range, count: binCounts[i] }));

  // Health pie
  const healthCounts = {};
  for (const r of restaurants) healthCounts[r.health] = (healthCounts[r.health] || 0) + 1;
  const healthPie = ['Healthy', 'Moderate', 'At Risk', 'Critical']
    .filter(h => healthCounts[h])
    .map(h => ({ name: h, value: healthCounts[h], color: HEALTH_COLORS[h] }));

  // Category drag
  const catSums = {};
  const catCounts = {};
  for (const cat of CATEGORIES) { catSums[cat] = 0; catCounts[cat] = 0; }
  for (const r of restaurants) {
    for (const cat of CATEGORIES) {
      if (r.categoryScores[cat] !== null && r.categoryScores[cat] !== undefined) {
        catSums[cat] += r.categoryScores[cat];
        catCounts[cat]++;
      }
    }
  }
  const catDrag = CATEGORIES
    .map(cat => ({
      name: cat,
      gap: catCounts[cat] > 0 ? (1 - catSums[cat] / catCounts[cat]) * 100 : 0,
      color: CAT_COLORS[cat],
    }))
    .sort((a, b) => b.gap - a.gap);

  // Box plot data
  const boxPlot = CATEGORIES.map(cat => {
    const scores = [];
    for (const r of restaurants) {
      const s = r.categoryScores[cat];
      if (s !== null && s !== undefined) scores.push(s * 100);
    }
    scores.sort((a, b) => a - b);
    const n = scores.length;
    if (n === 0) return { name: cat, base: 0, iqr: 0, median: 0, min: 0, max: 0, color: CAT_COLORS[cat] };
    const q1 = scores[Math.floor(n * 0.25)];
    const median = scores[Math.floor(n * 0.5)];
    const q3 = scores[Math.floor(n * 0.75)];
    return { name: cat, base: q1, iqr: q3 - q1, median, min: scores[0], max: scores[n - 1], color: CAT_COLORS[cat] };
  });

  // AIO Buddy bar
  const buddyMap = {};
  for (const r of restaurants) {
    const buddy = r.aioBuddy || 'Unassigned';
    if (!buddyMap[buddy]) buddyMap[buddy] = { sum: 0, count: 0 };
    if (r.overall !== null) {
      buddyMap[buddy].sum += r.overall;
      buddyMap[buddy].count++;
    }
  }
  const buddyBar = Object.entries(buddyMap)
    .filter(([, v]) => v.count > 0)
    .map(([name, v]) => {
      const avg = (v.sum / v.count) * 100;
      const color = avg >= 70 ? '#10b981' : avg >= 50 ? '#f59e0b' : avg >= 30 ? '#f97316' : '#ef4444';
      return { name, avg, color, count: v.count };
    })
    .sort((a, b) => b.avg - a.avg);

  // Scatter
  const validScores = restaurants.filter(r => r.overall !== null).map(r => r.overall);
  const avgUtil = validScores.length ? (validScores.reduce((a, b) => a + b, 0) / validScores.length) * 100 : 0;

  const scatter = restaurants
    .filter(r => r.overall !== null)
    .map(r => ({
      name: r.name,
      liveCount: r.moduleDetails.filter(m => m.status === 'Live').length,
      util: r.overall * 100,
      health: r.health,
    }));

  // Treemap
  const treeBuddyMap = {};
  for (const r of restaurants) {
    const buddy = r.aioBuddy || 'Unassigned';
    if (!treeBuddyMap[buddy]) treeBuddyMap[buddy] = { sum: 0, count: 0, validCount: 0 };
    treeBuddyMap[buddy].count++;
    if (r.overall !== null) {
      treeBuddyMap[buddy].sum += r.overall;
      treeBuddyMap[buddy].validCount++;
    }
  }
  const treemapData = Object.entries(treeBuddyMap).map(([name, v]) => {
    const avg = v.validCount > 0 ? (v.sum / v.validCount) * 100 : 0;
    const color = avg >= 70 ? '#10b981' : avg >= 50 ? '#f59e0b' : avg >= 30 ? '#f97316' : '#ef4444';
    return { name, size: v.count, color, count: v.count, avgUtil: avg };
  });

  // Radar
  const radarData = CATEGORIES.map(cat => ({
    name: cat,
    value: catCounts[cat] > 0 ? (catSums[cat] / catCounts[cat]) * 100 : 0,
  }));

  // Heatmap
  const moduleMap = {};
  for (const r of restaurants) {
    for (const mod of r.moduleDetails) {
      if (!moduleMap[mod.name]) moduleMap[mod.name] = { live: 0, total: 0, category: mod.category };
      moduleMap[mod.name].total++;
      if (mod.status === 'Live') moduleMap[mod.name].live++;
    }
  }
  const heatmapData = Object.entries(moduleMap)
    .map(([name, v]) => ({ name, adoptionPct: (v.live / v.total) * 100, category: v.category }))
    .sort((a, b) => b.adoptionPct - a.adoptionPct);

  return { distBins, healthPie, catDrag, boxPlot, buddyBar, scatter, avgUtil, treemapData, radarData, heatmapData };
}
