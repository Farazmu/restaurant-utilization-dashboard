import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { getNotes, saveNote } from '../lib/notesClient.js';

const ALL_STATUSES = ['Live', 'In Progress', 'Pending', 'On Hold', 'SW/Product Issue', 'Not Required', 'Not Applicable'];

const STATUS_STYLE = {
  'Live':             { bg: 'rgba(34,197,94,0.15)',   text: '#22c55e', border: 'rgba(34,197,94,0.3)'   },
  'In Progress':      { bg: 'rgba(59,130,246,0.15)',  text: '#3b82f6', border: 'rgba(59,130,246,0.3)'  },
  'Pending':          { bg: 'rgba(168,85,247,0.15)',  text: '#a855f7', border: 'rgba(168,85,247,0.3)'  },
  'On Hold':          { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
  'SW/Product Issue': { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444', border: 'rgba(239,68,68,0.3)'   },
  'Not Required':     { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
  'Not Applicable':   { bg: 'rgba(75,85,99,0.15)',    text: '#6b7280', border: 'rgba(75,85,99,0.3)'    },
  'Churned':          { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
};

const CAT_COLOR = {
  'Order & Pay':     '#60a5fa',
  'Marketing (On)':  '#4ade80',
  'Marketing (Off)': '#facc15',
  'Payroll':         '#f87171',
  'MoM':             '#a78bfa',
  'Tips + Office':   '#fb923c',
};

const SORT_KEYS = {
  'Restaurant': 'restaurantName',
  'Section': 'section',
  'AIO Buddy': 'aioBuddy',
  'Module': 'moduleName',
  'Category': 'category',
  'Status': 'status',
};

function IssuesTab({ restaurants }) {
  const [notes, setNotes] = useState({});
  const [saving, setSaving] = useState({});
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [sortBy, setSortBy] = useState('restaurantName');
  const [sortDir, setSortDir] = useState('asc');
  const [statusFilter, setStatusFilter] = useState(['On Hold', 'SW/Product Issue']);
  const [restaurantFilter, setRestaurantFilter] = useState([]);
  const [buddyFilter, setBuddyFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [moduleFilter, setModuleFilter] = useState([]);

  useEffect(() => {
    getNotes().then(n => {
      setNotes(n || {});
      setLoadingNotes(false);
    });
  }, []);

  const allRows = useMemo(() => {
    const rows = [];
    for (const r of restaurants) {
      for (const mod of r.moduleDetails || []) {
        if (!mod.status) continue;
        rows.push({
          key: `note:${r.id}:${mod.fieldGid}`,
          restaurantName: r.name,
          section: r.section,
          aioBuddy: r.aioBuddy || '—',
          moduleName: mod.name,
          category: mod.category,
          status: mod.status,
        });
      }
    }
    return rows;
  }, [restaurants]);

  const statusCounts = useMemo(() => {
    const counts = {};
    for (const row of allRows) {
      if (restaurantFilter.length > 0 && !restaurantFilter.includes(row.restaurantName)) continue;
      if (buddyFilter.length > 0 && !buddyFilter.includes(row.aioBuddy)) continue;
      if (categoryFilter.length > 0 && !categoryFilter.includes(row.category)) continue;
      if (moduleFilter.length > 0 && !moduleFilter.includes(row.moduleName)) continue;
      counts[row.status] = (counts[row.status] || 0) + 1;
    }
    return counts;
  }, [allRows, restaurantFilter, buddyFilter, categoryFilter, moduleFilter]);

  const restaurantOptions = useMemo(() => (
    Array.from(new Set(allRows.map(r => r.restaurantName))).sort((a, b) => a.localeCompare(b))
  ), [allRows]);

  const buddyOptions = useMemo(() => (
    Array.from(new Set(allRows.map(r => r.aioBuddy).filter(b => b && b !== '—'))).sort((a, b) => a.localeCompare(b))
  ), [allRows]);

  const { categoryOptions, moduleOptions } = useMemo(() => {
    const cats = new Set();
    const mods = new Set();
    for (const row of allRows) {
      if (row.category) cats.add(row.category);
      if (row.moduleName) mods.add(row.moduleName);
    }
    return {
      categoryOptions: Array.from(cats).sort((a, b) => a.localeCompare(b)),
      moduleOptions: Array.from(mods).sort((a, b) => a.localeCompare(b)),
    };
  }, [allRows]);

  const issues = useMemo(() => {
    const rows = allRows.filter(row => {
      if (statusFilter.length > 0 && !statusFilter.includes(row.status)) return false;
      if (restaurantFilter.length > 0 && !restaurantFilter.includes(row.restaurantName)) return false;
      if (buddyFilter.length > 0 && !buddyFilter.includes(row.aioBuddy)) return false;
      if (categoryFilter.length > 0 && !categoryFilter.includes(row.category)) return false;
      if (moduleFilter.length > 0 && !moduleFilter.includes(row.moduleName)) return false;
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = (a[sortBy] ?? '').toString();
      const bv = (b[sortBy] ?? '').toString();
      const primary = av.localeCompare(bv) * dir;
      if (primary !== 0) return primary;
      return a.moduleName.localeCompare(b.moduleName);
    });
    return rows;
  }, [allRows, statusFilter, restaurantFilter, buddyFilter, categoryFilter, moduleFilter, sortBy, sortDir]);

  const handleSort = useCallback((key) => {
    if (sortBy === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  }, [sortBy]);

  const handleBlur = useCallback(async (key, text) => {
    setSaving(s => ({ ...s, [key]: 'saving' }));
    await saveNote(key, text);
    setNotes(n => ({ ...n, [key]: text }));
    setSaving(s => ({ ...s, [key]: 'saved' }));
    setTimeout(() => setSaving(s => {
      const next = { ...s };
      delete next[key];
      return next;
    }), 2000);
  }, []);

  const toggleStatus = useCallback((status) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  }, []);

  return (
    <div>
      {/* Summary / status filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip label="Showing" value={issues.length} color="#6366f1" />
        {ALL_STATUSES.map(status => {
          const style = STATUS_STYLE[status];
          const selected = statusFilter.includes(status);
          const count = statusCounts[status] || 0;
          return (
            <div
              key={status}
              onClick={() => toggleStatus(status)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: selected ? style.bg : '#12151f',
                border: `1px solid ${selected ? style.border : '#2d3148'}`,
                borderRadius: 10, padding: '10px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                userSelect: 'none',
                opacity: selected ? 1 : 0.5,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, color: style.text, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
              <span style={{ fontSize: 11, color: selected ? '#d1d5db' : '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{status}</span>
            </div>
          );
        })}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <MultiSelect label="Category"   options={categoryOptions}   selected={categoryFilter}   onChange={setCategoryFilter} />
        <MultiSelect label="Module"     options={moduleOptions}     selected={moduleFilter}     onChange={setModuleFilter} />
        <MultiSelect label="AIO Buddy"  options={buddyOptions}      selected={buddyFilter}      onChange={setBuddyFilter} />
        <MultiSelect label="Restaurant" options={restaurantOptions} selected={restaurantFilter} onChange={setRestaurantFilter} />
      </div>

      {issues.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: '#4b5563', fontSize: 14,
          border: '1px solid #1f2433', borderRadius: 12,
          background: '#12151f',
        }}>
          No modules found for the selected filters.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #1f2433' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Restaurant', 'Section', 'AIO Buddy', 'Category', 'Module', 'Status', 'Reason / Comment'].map(h => {
                  const sortKey = SORT_KEYS[h];
                  const isActive = sortKey && sortBy === sortKey;
                  const arrow = !sortKey ? '' : isActive ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕';
                  return (
                    <th
                      key={h}
                      onClick={sortKey ? () => handleSort(sortKey) : undefined}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: 10,
                        fontWeight: 700,
                        color: isActive ? '#e5e7eb' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid #2d3148',
                        background: '#12151f',
                        cursor: sortKey ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                    >
                      {h}
                      {sortKey && (
                        <span style={{ marginLeft: 4, fontSize: 9, color: isActive ? '#6366f1' : '#4b5563' }}>
                          {arrow.trim()}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, idx) => (
                <IssueRow
                  key={issue.key}
                  issue={issue}
                  idx={idx}
                  note={notes[issue.key] || ''}
                  saveState={saving[issue.key]}
                  onBlur={handleBlur}
                  loadingNotes={loadingNotes}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const IssueRow = memo(function IssueRow({ issue, idx, note, saveState, onBlur, loadingNotes }) {
  const [localText, setLocalText] = useState(note);
  const [hovered, setHovered] = useState(false);

  useEffect(() => { setLocalText(note); }, [note]);

  const rowBg = idx % 2 === 0 ? '#12151f' : '#14171f';
  const tdBase = {
    padding: '10px 14px',
    borderBottom: '1px solid #1f243320',
    background: hovered ? '#1e2238' : rowBg,
    transition: 'background 0.15s',
    verticalAlign: 'top',
  };

  const statusStyle = STATUS_STYLE[issue.status] || { bg: '#1f2433', text: '#9ca3af', border: '#2d3148' };
  const catColor = CAT_COLOR[issue.category] || '#6b7280';

  return (
    <tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <td style={{ ...tdBase, fontWeight: 600, color: '#f3f4f6', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {issue.restaurantName}
      </td>
      <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{issue.section || '---'}</span>
      </td>
      <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>{issue.aioBuddy}</span>
      </td>
      <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 11, color: catColor, fontWeight: 600 }}>{issue.category}</span>
      </td>
      <td style={{ ...tdBase, fontWeight: 500, color: '#d1d5db', whiteSpace: 'nowrap' }}>
        {issue.moduleName}
      </td>
      <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 9999,
          fontSize: 11, fontWeight: 600,
          background: statusStyle.bg,
          color: statusStyle.text,
          border: `1px solid ${statusStyle.border}`,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusStyle.text, flexShrink: 0 }} />
          {issue.status}
        </span>
      </td>
      <td style={{ ...tdBase, minWidth: 260, width: '35%' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={localText}
            onChange={e => setLocalText(e.target.value)}
            onBlur={() => onBlur(issue.key, localText)}
            placeholder={loadingNotes ? 'Loading...' : 'Add reason or comment…'}
            disabled={loadingNotes}
            rows={2}
            style={{
              width: '100%',
              background: '#1a1d27',
              border: `1px solid ${localText !== note ? '#6366f1' : '#2d3148'}`,
              borderRadius: 8,
              padding: '7px 10px',
              color: '#e5e7eb',
              fontSize: 12,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.5,
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => {
              e.target.style.borderColor = localText !== note ? '#6366f1' : '#2d3148';
              onBlur(issue.key, localText);
            }}
          />
          {saveState && (
            <span style={{
              position: 'absolute', bottom: 6, right: 8,
              fontSize: 10, color: saveState === 'saved' ? '#22c55e' : '#6366f1',
              pointerEvents: 'none',
            }}>
              {saveState === 'saving' ? 'Saving…' : '✓ Saved'}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
});

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  const isActive = selected.length > 0;
  const buttonText = selected.length === 0
    ? `All ${label}s`
    : selected.length === 1
      ? selected[0]
      : `${label}: ${selected.length} selected`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: isActive ? 'rgba(99,102,241,0.15)' : '#12151f',
          border: `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : '#2d3148'}`,
          borderRadius: 8,
          color: isActive ? '#818cf8' : '#9ca3af',
          fontSize: 12, fontWeight: isActive ? 600 : 400,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
        }}
      >
        <span style={{
          fontSize: 10, fontWeight: 700, color: isActive ? '#818cf8' : '#6b7280',
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {label}
        </span>
        <span style={{ color: isActive ? '#c7d2fe' : '#6b7280' }}>
          {isActive ? buttonText.replace(`${label}: `, '') : 'All'}
        </span>
        {isActive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 16, height: 16, borderRadius: '50%',
            background: '#6366f1', color: '#fff',
            fontSize: 9, fontWeight: 800,
          }}>
            {selected.length}
          </span>
        )}
        <span style={{ fontSize: 9, color: '#4b5563', marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          zIndex: 200, minWidth: 200, maxWidth: 280,
          background: '#1a1d27',
          border: '1px solid #2d3148',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* All / Clear controls */}
          <div style={{
            display: 'flex', gap: 0,
            borderBottom: '1px solid #2d3148',
          }}>
            <button
              onClick={() => onChange([...options])}
              style={{
                flex: 1, padding: '7px 0',
                background: 'transparent',
                border: 'none', borderRight: '1px solid #2d3148',
                color: '#9ca3af', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Select all
            </button>
            <button
              onClick={() => onChange([])}
              style={{
                flex: 1, padding: '7px 0',
                background: 'transparent',
                border: 'none',
                color: '#9ca3af', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Clear
            </button>
          </div>

          {/* Options */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {options.map(opt => {
              const checked = selected.includes(opt);
              return (
                <label
                  key={opt}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 14px',
                    cursor: 'pointer',
                    background: checked ? 'rgba(99,102,241,0.1)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = checked ? 'rgba(99,102,241,0.1)' : 'transparent'; }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt)}
                    style={{ accentColor: '#6366f1', width: 13, height: 13, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 12, color: checked ? '#c7d2fe' : '#d1d5db', fontWeight: checked ? 600 : 400 }}>
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#12151f', border: '1px solid #1f2433',
      borderRadius: 10, padding: '10px 16px',
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
    </div>
  );
}

export default memo(IssuesTab);
