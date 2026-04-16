import { useState, useMemo, memo, useCallback } from 'react';
import { MODULE_CONFIG, CATEGORIES } from '../config/modules.js';
import { HEALTH_COLORS } from './ProgressBar.jsx';
import { getHealth } from '../lib/formulaEngine.js';
import { getStatusConfig } from './StatusBadge.jsx';

/* ── Category colours (same palette as DetailDrawer) ── */
const CAT_COLORS = {
  'Order & Pay':     '#6366f1',
  'Marketing (On)':  '#8b5cf6',
  'Marketing (Off)': '#a78bfa',
  'Payroll':         '#10b981',
  'MoM':             '#f59e0b',
  'Tips + Office':   '#3b82f6',
};

/* ── Derive ordered module list with category index ── */
const MODULES_ORDERED = MODULE_CONFIG.map(m => ({
  ...m,
  catIdx: CATEGORIES.indexOf(m.category),
}));

/* Category spans for the two-row thead */
const CATEGORY_SPANS = (() => {
  const spans = [];
  let prev = null;
  for (const m of MODULES_ORDERED) {
    if (m.category !== prev) {
      spans.push({ category: m.category, count: 1 });
      prev = m.category;
    } else {
      spans[spans.length - 1].count++;
    }
  }
  return spans;
})();

/* ── Short labels for the compact status pill ── */
const SHORT_LABELS = {
  Live: 'L',
  Onboarding: 'On',
  'On Hold': 'H',
  'SW/Product Issue': 'SW',
  'Not Required': 'NR',
};

function shortLabel(status) {
  if (!status || status.trim() === '') return '\u2014';
  return SHORT_LABELS[status.trim()] || status.trim().charAt(0);
}

/* ── Compact status pill (inline, not importing StatusBadge to keep tiny) ── */
function CompactPill({ status }) {
  const cfg = getStatusConfig(status);
  const isBlank = !status || status.trim() === '';
  return (
    <span
      title={isBlank ? 'No status' : status}
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 600,
        lineHeight: '16px',
        textAlign: 'center',
        minWidth: 22,
        background: isBlank ? '#141822' : cfg.bg,
        color: isBlank ? '#374151' : cfg.color,
        cursor: 'default',
      }}
    >
      {shortLabel(status)}
    </span>
  );
}

/* ── Health ordering for sort ── */
const HEALTH_ORDER = { Critical: 0, 'At Risk': 1, Moderate: 2, Healthy: 3, 'N/A': 4 };

/* ── MultiSelect dropdown ── */
function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === 0;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#1a1d27',
          border: '1px solid #2d3148',
          borderRadius: 8,
          padding: '6px 12px',
          color: allSelected ? '#6b7280' : '#e5e7eb',
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        {label}{!allSelected && ` (${selected.length})`}
        <span style={{ fontSize: 9, color: '#6b7280' }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 80 }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            background: '#1a1d27',
            border: '1px solid #2d3148',
            borderRadius: 8,
            padding: 6,
            zIndex: 81,
            minWidth: 160,
            maxHeight: 240,
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {options.map(opt => {
              const checked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#e5e7eb',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1f2433'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      onChange(checked ? selected.filter(s => s !== opt) : [...selected, opt]);
                    }}
                    style={{ accentColor: '#6366f1' }}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main component ── */
function ModuleBreakdownTab({ restaurants, onRowClick }) {
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState([]);
  const [buddyFilter, setBuddyFilter] = useState([]);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  /* Unique AIO Buddy values */
  const buddyOptions = useMemo(() => {
    const set = new Set();
    for (const r of restaurants) {
      if (r.aioBuddy) set.add(r.aioBuddy);
    }
    return [...set].sort();
  }, [restaurants]);

  /* Filter */
  const filtered = useMemo(() => {
    let list = restaurants;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    if (healthFilter.length > 0) {
      list = list.filter(r => healthFilter.includes(r.health));
    }
    if (buddyFilter.length > 0) {
      list = list.filter(r => buddyFilter.includes(r.aioBuddy));
    }
    return list;
  }, [restaurants, search, healthFilter, buddyFilter]);

  /* Sort */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'utilization': {
          const va = a.overall ?? -1;
          const vb = b.overall ?? -1;
          return dir * (va - vb);
        }
        case 'health': {
          const ha = HEALTH_ORDER[a.health] ?? 99;
          const hb = HEALTH_ORDER[b.health] ?? 99;
          return dir * (ha - hb);
        }
        case 'buddy':
          return dir * (a.aioBuddy || '').localeCompare(b.aioBuddy || '');
        default:
          return 0;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const handleSort = useCallback((key) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        return key;
      }
      setSortDir(key === 'health' ? 'asc' : 'asc');
      return key;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setHealthFilter([]);
    setBuddyFilter([]);
  }, []);

  const hasFilters = search || healthFilter.length > 0 || buddyFilter.length > 0;

  /* Build a module-status lookup per restaurant for fast cell rendering */
  const statusLookup = useMemo(() => {
    const map = new Map();
    for (const r of sorted) {
      const modMap = {};
      for (const md of r.moduleDetails) {
        modMap[md.fieldGid] = md.status;
      }
      map.set(r.id, modMap);
    }
    return map;
  }, [sorted]);

  const sortArrow = (key) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  };

  const thStyle = {
    padding: '6px 8px',
    fontSize: 11,
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid #2d3148',
    background: '#0f1117',
    position: 'sticky',
    top: 0,
    zIndex: 3,
  };

  const thModuleStyle = {
    padding: '4px 3px',
    fontSize: 10,
    fontWeight: 600,
    color: '#6b7280',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid #2d3148',
    background: '#0f1117',
    position: 'sticky',
    top: 26,
    zIndex: 3,
    maxWidth: 50,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const stickyColStyle = {
    position: 'sticky',
    left: 0,
    zIndex: 4,
    background: '#0f1117',
  };

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}>
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search restaurant..."
          style={{
            background: '#1a1d27',
            border: '1px solid #2d3148',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#e5e7eb',
            fontSize: 12,
            width: 200,
            outline: 'none',
          }}
        />
        <MultiSelect
          label="Health"
          options={['Healthy', 'Moderate', 'At Risk', 'Critical']}
          selected={healthFilter}
          onChange={setHealthFilter}
        />
        <MultiSelect
          label="AIO Buddy"
          options={buddyOptions}
          selected={buddyFilter}
          onChange={setBuddyFilter}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 8,
              padding: '6px 12px',
              color: '#a5b4fc',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Clear filters
          </button>
        )}
        <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>
          Showing {sorted.length} of {restaurants.length} restaurants
        </span>
      </div>

      {/* Scrollable table container */}
      <div style={{
        overflow: 'auto',
        maxHeight: 'calc(100vh - 200px)',
        border: '1px solid #2d3148',
        borderRadius: 12,
        background: '#0f1117',
      }}>
        <table style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          width: 'max-content',
          minWidth: '100%',
          fontFamily: 'Inter, sans-serif',
        }}>
          {/* Two-row thead: category row + column header row */}
          <thead>
            {/* Row 1: Category group headers spanning module columns */}
            <tr>
              {/* Empty cells for sticky columns: Restaurant, Utilization, Health, Buddy */}
              <th style={{ ...thStyle, ...stickyColStyle, zIndex: 6, top: 0, borderRight: '1px solid #2d3148', minWidth: 180 }} rowSpan={2}>
                <span onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Restaurant{sortArrow('name')}
                </span>
              </th>
              <th style={{ ...thStyle, top: 0, minWidth: 110, borderRight: '1px solid #1f2433' }} rowSpan={2}>
                <span onClick={() => handleSort('utilization')} style={{ cursor: 'pointer' }}>
                  Util %{sortArrow('utilization')}
                </span>
              </th>
              <th style={{ ...thStyle, top: 0, minWidth: 80, borderRight: '1px solid #1f2433' }} rowSpan={2}>
                <span onClick={() => handleSort('health')} style={{ cursor: 'pointer' }}>
                  Health{sortArrow('health')}
                </span>
              </th>
              <th style={{ ...thStyle, top: 0, minWidth: 100, borderRight: '2px solid #2d3148' }} rowSpan={2}>
                <span onClick={() => handleSort('buddy')} style={{ cursor: 'pointer' }}>
                  AIO Buddy{sortArrow('buddy')}
                </span>
              </th>
              {/* Category spans */}
              {CATEGORY_SPANS.map(cs => (
                <th
                  key={cs.category}
                  colSpan={cs.count}
                  style={{
                    ...thStyle,
                    top: 0,
                    textAlign: 'center',
                    cursor: 'default',
                    background: `linear-gradient(${CAT_COLORS[cs.category] || '#6366f1'}18, ${CAT_COLORS[cs.category] || '#6366f1'}18), #0f1117`,
                    borderBottom: `2px solid ${CAT_COLORS[cs.category] || '#6366f1'}`,
                    borderRight: '1px solid #2d3148',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    color: CAT_COLORS[cs.category] || '#9ca3af',
                  }}
                >
                  {cs.category}
                </th>
              ))}
            </tr>
            {/* Row 2: Individual module name headers */}
            <tr>
              {/* (Restaurant/Util/Health/Buddy already handled with rowSpan=2) */}
              {MODULES_ORDERED.map((mod, idx) => {
                /* detect category boundary for thin separator */
                const prevCat = idx > 0 ? MODULES_ORDERED[idx - 1].category : null;
                const isBoundary = prevCat && prevCat !== mod.category;
                return (
                  <th
                    key={mod.fieldGid}
                    title={`${mod.name} (${(mod.weight * 100).toFixed(2)}%)`}
                    style={{
                      ...thModuleStyle,
                      borderLeft: isBoundary ? '2px solid #2d3148' : 'none',
                    }}
                  >
                    <div style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontSize: 10,
                      lineHeight: '14px',
                      maxHeight: 80,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {mod.name}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, rowIdx) => {
              const hColor = HEALTH_COLORS[r.health] || '#6b7280';
              const pct = r.overall !== null ? (r.overall * 100).toFixed(1) : null;
              const modStatuses = statusLookup.get(r.id) || {};
              return (
                <tr
                  key={r.id}
                  onClick={() => onRowClick(r)}
                  style={{
                    cursor: 'pointer',
                    background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'; }}
                >
                  {/* Restaurant name (sticky) */}
                  <td style={{
                    ...stickyColStyle,
                    zIndex: 2,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#e5e7eb',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #1a1d27',
                    borderRight: '1px solid #2d3148',
                    background: rowIdx % 2 === 0 ? '#0f1117' : '#121520',
                  }}>
                    {r.name}
                  </td>
                  {/* Utilization % with mini bar */}
                  <td style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid #1a1d27',
                    borderRight: '1px solid #1f2433',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: pct !== null ? hColor : '#6b7280',
                        minWidth: 38,
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {pct !== null ? `${pct}%` : '\u2014'}
                      </span>
                      <div style={{ width: 40, height: 4, background: '#1f2937', borderRadius: 9999, overflow: 'hidden' }}>
                        {pct !== null && (
                          <div style={{
                            width: `${Math.min(100, parseFloat(pct))}%`,
                            height: '100%',
                            background: hColor,
                            borderRadius: 9999,
                          }} />
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Health pill */}
                  <td style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid #1a1d27',
                    borderRight: '1px solid #1f2433',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: `${hColor}20`,
                      color: hColor,
                      whiteSpace: 'nowrap',
                    }}>
                      {r.health}
                    </span>
                  </td>
                  {/* AIO Buddy */}
                  <td style={{
                    padding: '6px 8px',
                    fontSize: 12,
                    color: '#9ca3af',
                    borderBottom: '1px solid #1a1d27',
                    borderRight: '2px solid #2d3148',
                    whiteSpace: 'nowrap',
                  }}>
                    {r.aioBuddy || '\u2014'}
                  </td>
                  {/* Module cells */}
                  {MODULES_ORDERED.map((mod, idx) => {
                    const prevCat = idx > 0 ? MODULES_ORDERED[idx - 1].category : null;
                    const isBoundary = prevCat && prevCat !== mod.category;
                    const status = modStatuses[mod.fieldGid] || '';
                    return (
                      <td
                        key={mod.fieldGid}
                        style={{
                          padding: '4px 3px',
                          textAlign: 'center',
                          borderBottom: '1px solid #1a1d27',
                          borderLeft: isBoundary ? '2px solid #2d3148' : 'none',
                        }}
                      >
                        <CompactPill status={status} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4 + MODULES_ORDERED.length}
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: 13,
                  }}
                >
                  No restaurants match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(ModuleBreakdownTab);
