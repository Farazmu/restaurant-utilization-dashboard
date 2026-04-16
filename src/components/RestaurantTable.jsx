import { useState, useMemo, memo } from 'react';
import ProgressBar, { HEALTH_COLORS } from './ProgressBar.jsx';
import { CATEGORIES } from '../config/modules.js';

const HEALTH_OPTIONS = ['All', 'Healthy', 'Moderate', 'At Risk', 'Critical'];

const SECTION_COLORS = {
  'Live Restaurants':      '#10b981',
  'Marketing Live':        '#8b5cf6',
  'Onboarding':            '#3b82f6',
  'Marketing Onboarding':  '#6366f1',
  'On Hold Restaurants':   '#f59e0b',
  'Churned Restaurants':   '#ef4444',
};

const CAT_ABBREV = {
  'Order & Pay':     'Order & Pay',
  'Marketing (On)':  'Mktg On',
  'Marketing (Off)': 'Mktg Off',
  'Payroll':         'Payroll',
  'MoM':             'MoM',
  'Tips + Office':   'Tips+Off',
};

function RestaurantTable({ restaurants, onRowClick }) {
  const [sortCol, setSortCol] = useState('overall');
  const [sortDir, setSortDir] = useState('desc');
  const [healthFilter, setHealthFilter] = useState('All');
  const [buddyFilter, setBuddyFilter] = useState('All');
  const [search, setSearch] = useState('');

  const buddyOptions = useMemo(() => {
    const names = [...new Set(restaurants.map(r => r.aioBuddy).filter(Boolean))].sort();
    return ['All', ...names];
  }, [restaurants]);

  const sectionOptions = useMemo(() => {
    const names = [...new Set(restaurants.map(r => r.section).filter(Boolean))].sort();
    return ['All', ...names];
  }, [restaurants]);

  const [sectionFilter, setSectionFilter] = useState('All');

  const filtered = useMemo(() => {
    return restaurants.filter(r => {
      if (healthFilter !== 'All' && r.health !== healthFilter) return false;
      if (buddyFilter !== 'All' && r.aioBuddy !== buddyFilter) return false;
      if (sectionFilter !== 'All' && r.section !== sectionFilter) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [restaurants, healthFilter, buddyFilter, sectionFilter, search]);

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
      } else if (sortCol === 'section') {
        av = (a.section || '').toLowerCase();
        bv = (b.section || '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      } else {
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
    padding: '10px 14px',
    textAlign: col === 'name' || col === 'buddy' || col === 'section' ? 'left' : 'right',
    fontSize: 10,
    fontWeight: 700,
    color: sortCol === col ? '#a5b4fc' : '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #2d3148',
    background: '#12151f',
    transition: 'color 0.15s',
  });

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ color: '#374151', marginLeft: 4, fontSize: 10 }}>{'\u2195'}</span>;
    return <span style={{ color: '#6366f1', marginLeft: 4, fontSize: 10 }}>{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>;
  };

  return (
    <div style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563', fontSize: 13, pointerEvents: 'none' }}>
            {'\u{1f50d}'}
          </span>
          <input
            type="text"
            placeholder="Search restaurant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: '#1a1d27',
              border: '1px solid #2d3148',
              borderRadius: 10,
              padding: '8px 12px 8px 32px',
              color: '#e5e7eb',
              fontSize: 13,
              outline: 'none',
              width: 220,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#2d3148'}
          />
        </div>
        <Select value={healthFilter} onChange={setHealthFilter} options={HEALTH_OPTIONS} label="Health" />
        <Select value={buddyFilter} onChange={setBuddyFilter} options={buddyOptions} label="AIO Buddy" />
        <Select value={sectionFilter} onChange={setSectionFilter} options={sectionOptions} label="Section" />
        <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
          {sorted.length} of {restaurants.length} restaurants
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #2d3148', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle('name')} onClick={() => handleSort('name')}>
                Restaurant <SortIcon col="name" />
              </th>
              <th style={thStyle('section')} onClick={() => handleSort('section')}>
                Section <SortIcon col="section" />
              </th>
              <th style={thStyle('buddy')} onClick={() => handleSort('buddy')}>
                AIO Buddy <SortIcon col="buddy" />
              </th>
              <th style={{ ...thStyle('team'), textAlign: 'left' }}>
                Team
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
                <td colSpan={5 + CATEGORIES.length} style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: 13 }}>
                  No restaurants match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default memo(RestaurantTable);

function TableRow({ restaurant: r, idx, onClick }) {
  const [hovered, setHovered] = useState(false);
  const health = r.health;
  const hColor = HEALTH_COLORS[health] || '#6b7280';

  const rowBg = idx % 2 === 0 ? '#12151f' : '#14171f';
  const tdBase = {
    padding: '10px 14px',
    borderBottom: '1px solid #1f243320',
    background: hovered ? '#1e2238' : rowBg,
    transition: 'background 0.15s',
    cursor: 'pointer',
  };

  const pct = r.overall !== null ? (r.overall * 100).toFixed(1) + '%' : '---';

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ ...tdBase, fontWeight: 500, color: '#f3f4f6', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {r.name}
      </td>
      <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
        <SectionPill section={r.section} />
      </td>
      <td style={{ ...tdBase, color: '#9ca3af', whiteSpace: 'nowrap', fontSize: 12 }}>
        {r.aioBuddy || <span style={{ color: '#374151' }}>---</span>}
      </td>
      <td style={{ ...tdBase, color: '#9ca3af', whiteSpace: 'nowrap', fontSize: 12 }}>
        {r.team || <span style={{ color: '#374151' }}>---</span>}
      </td>
      <td style={{ ...tdBase, minWidth: 130 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: hColor, minWidth: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {pct}
          </span>
          <div style={{ width: 64 }}>
            <ProgressBar value={r.overall} height={5} color={hColor} />
          </div>
        </div>
      </td>
      <td style={{ ...tdBase, textAlign: 'right' }}>
        <HealthPill health={health} />
      </td>
      {CATEGORIES.map(cat => {
        const score = r.categoryScores[cat];
        return (
          <td key={cat} style={{ ...tdBase, textAlign: 'right' }}>
            {score !== null ? (
              <span style={{ fontSize: 12, color: '#d1d5db', fontVariantNumeric: 'tabular-nums' }}>{(score * 100).toFixed(0)}%</span>
            ) : (
              <span style={{ color: '#374151', fontSize: 12 }}>---</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function HealthPill({ health }) {
  const color = HEALTH_COLORS[health] || '#6b7280';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
      letterSpacing: '0.02em',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: color, flexShrink: 0,
        boxShadow: `0 0 6px ${color}60`,
      }} />
      {health}
    </span>
  );
}

function SectionPill({ section }) {
  if (!section) return <span style={{ color: '#374151', fontSize: 11 }}>---</span>;
  const color = SECTION_COLORS[section] || '#6b7280';
  // Short label for compact display
  const SHORT = {
    'Live Restaurants':      'Live',
    'Marketing Live':        'Mkt Live',
    'Onboarding':            'Onboarding',
    'Marketing Onboarding':  'Mkt Onb',
    'On Hold Restaurants':   'On Hold',
    'Churned Restaurants':   'Churned',
  };
  const label = SHORT[section] || section;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 600,
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
      letterSpacing: '0.02em',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: color, flexShrink: 0,
      }} />
      {label}
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
        borderRadius: 10,
        padding: '8px 12px',
        color: '#e5e7eb',
        fontSize: 13,
        outline: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      {options.map(o => (
        <option key={o} value={o}>{o === 'All' ? `All ${label}s` : o}</option>
      ))}
    </select>
  );
}
