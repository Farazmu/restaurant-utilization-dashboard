import { useState, useMemo } from 'react';
import ProgressBar, { HEALTH_COLORS } from './ProgressBar.jsx';
import { CATEGORIES } from '../config/modules.js';

const HEALTH_OPTIONS = ['All', 'Healthy', 'Moderate', 'At Risk', 'Critical'];

const CAT_ABBREV = {
  'Order & Pay':     'Order & Pay',
  'Marketing (On)':  'Mktg On',
  'Marketing (Off)': 'Mktg Off',
  'Payroll':         'Payroll',
  'MoM':             'MoM',
  'Tips + Office':   'Tips+Off',
};

export default function RestaurantTable({ restaurants, onRowClick }) {
  const [sortCol, setSortCol] = useState('overall');
  const [sortDir, setSortDir] = useState('desc');
  const [healthFilter, setHealthFilter] = useState('All');
  const [buddyFilter, setBuddyFilter] = useState('All');
  const [search, setSearch] = useState('');

  const buddyOptions = useMemo(() => {
    const names = [...new Set(restaurants.map(r => r.aioBuddy).filter(Boolean))].sort();
    return ['All', ...names];
  }, [restaurants]);

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (healthFilter !== 'All' && r.health !== healthFilter) return false;
      if (buddyFilter !== 'All' && r.aioBuddy !== buddyFilter) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [restaurants, healthFilter, buddyFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortCol === 'name') {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (sortCol === 'overall') {
        av = a.overall ?? -1;
        bv = b.overall ?? -1;
      } else if (sortCol === 'health') {
        const order = { Healthy: 4, Moderate: 3, 'At Risk': 2, Critical: 1, 'N/A': 0 };
        av = order[a.health] ?? 0;
        bv = order[b.health] ?? 0;
      } else if (sortCol === 'buddy') {
        av = (a.aioBuddy || '').toLowerCase();
        bv = (b.aioBuddy || '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      } else {
        // category key
        av = a.categoryScores[sortCol] ?? -1;
        bv = b.categoryScores[sortCol] ?? -1;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [filtered, sortCol, sortDir]);

  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }

  const thStyle = (col) => ({
    padding: '8px 12px',
    textAlign: col === 'name' || col === 'buddy' ? 'left' : 'right',
    fontSize: 11,
    fontWeight: 600,
    color: sortCol === col ? '#6366f1' : '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #2d3148',
    background: '#12151f',
  });

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ color: '#374151', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#6366f1', marginLeft: 4 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search restaurant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: '#1a1d27',
            border: '1px solid #2d3148',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#e5e7eb',
            fontSize: 13,
            outline: 'none',
            width: 200,
          }}
        />
        <Select value={healthFilter} onChange={setHealthFilter} options={HEALTH_OPTIONS} label="Health" />
        <Select value={buddyFilter} onChange={setBuddyFilter} options={buddyOptions} label="AIO Buddy" />
        <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
          {sorted.length} of {restaurants.length} restaurants
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #2d3148' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle('name')} onClick={() => handleSort('name')}>
                Restaurant <SortIcon col="name" />
              </th>
              <th style={thStyle('buddy')} onClick={() => handleSort('buddy')}>
                AIO Buddy <SortIcon col="buddy" />
              </th>
              <th style={{ ...thStyle('overall'), minWidth: 130 }} onClick={() => handleSort('overall')}>
                Utilization <SortIcon col="overall" />
              </th>
              <th style={thStyle('health')} onClick={() => handleSort('health')}>
                Health <SortIcon col="health" />
              </th>
              {CATEGORIES.map(cat => (
                <th key={cat} style={{ ...thStyle(cat), minWidth: 80 }} onClick={() => handleSort(cat)}>
                  {CAT_ABBREV[cat]} <SortIcon col={cat} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => (
              <TableRow key={r.id} restaurant={r} idx={idx} onClick={() => onRowClick(r)} />
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#6b7280', fontSize: 13 }}>
                  No restaurants match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableRow({ restaurant: r, idx, onClick }) {
  const [hovered, setHovered] = useState(false);
  const health = r.health;
  const hColor = HEALTH_COLORS[health] || '#6b7280';

  const tdBase = {
    padding: '9px 12px',
    borderBottom: '1px solid #1f2433',
    background: hovered ? '#1f2433' : (idx % 2 === 0 ? '#12151f' : '#13161e'),
    transition: 'background 0.1s',
    cursor: 'pointer',
  };

  const pct = r.overall !== null ? (r.overall * 100).toFixed(1) + '%' : '—';

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ ...tdBase, fontWeight: 500, color: '#f3f4f6', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {r.name}
      </td>
      <td style={{ ...tdBase, color: '#9ca3af', whiteSpace: 'nowrap' }}>
        {r.aioBuddy || <span style={{ color: '#374151' }}>—</span>}
      </td>
      <td style={{ ...tdBase, minWidth: 130 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: hColor, minWidth: 42, textAlign: 'right' }}>
            {pct}
          </span>
          <div style={{ width: 64 }}>
            <ProgressBar value={r.overall} height={5} color={hColor} />
          </div>
        </div>
      </td>
      <td style={{ ...tdBase, textAlign: 'right' }}>
        <HealthChip health={health} />
      </td>
      {CATEGORIES.map(cat => {
        const score = r.categoryScores[cat];
        return (
          <td key={cat} style={{ ...tdBase, textAlign: 'right' }}>
            {score !== null ? (
              <span style={{ fontSize: 12, color: '#d1d5db' }}>{(score * 100).toFixed(0)}%</span>
            ) : (
              <span style={{ color: '#374151', fontSize: 12 }}>—</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function HealthChip({ health }) {
  const color = HEALTH_COLORS[health] || '#6b7280';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      background: `${color}20`,
      color,
    }}>
      {health}
    </span>
  );
}

function Select({ value, onChange, options, label }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: '#1a1d27',
        border: '1px solid #2d3148',
        borderRadius: 8,
        padding: '6px 10px',
        color: '#e5e7eb',
        fontSize: 13,
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map(o => (
        <option key={o} value={o}>{o === 'All' ? `All ${label}s` : o}</option>
      ))}
    </select>
  );
}
