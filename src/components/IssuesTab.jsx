import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { getNotes, saveNote } from '../lib/notesClient.js';

const STATUS_STYLE = {
  'On Hold':          { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b', border: 'rgba(245,158,11,0.3)'  },
  'SW/Product Issue': { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444', border: 'rgba(239,68,68,0.3)'   },
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
  const [saving, setSaving] = useState({}); // { key: 'saving' | 'saved' }
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [sortBy, setSortBy] = useState('restaurantName');
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [buddyFilter, setBuddyFilter] = useState('all');

  useEffect(() => {
    getNotes().then(n => {
      setNotes(n || {});
      setLoadingNotes(false);
    });
  }, []);

  // Unique restaurant names for the filter dropdown
  const restaurantOptions = useMemo(() => {
    const names = new Set();
    for (const r of restaurants) {
      for (const mod of r.moduleDetails || []) {
        if (mod.status === 'On Hold' || mod.status === 'SW/Product Issue') {
          names.add(r.name);
          break;
        }
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [restaurants]);

  // Unique AIO Buddy names for the filter dropdown
  const buddyOptions = useMemo(() => {
    const names = new Set();
    for (const r of restaurants) {
      const hasissue = (r.moduleDetails || []).some(
        m => m.status === 'On Hold' || m.status === 'SW/Product Issue'
      );
      if (hasissue && r.aioBuddy) names.add(r.aioBuddy);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [restaurants]);

  // Build flat list of all On Hold / SW/Product Issue entries
  const issues = useMemo(() => {
    const rows = [];
    for (const r of restaurants) {
      if (restaurantFilter !== 'all' && r.name !== restaurantFilter) continue;
      if (buddyFilter !== 'all' && (r.aioBuddy || '') !== buddyFilter) continue;
      for (const mod of r.moduleDetails || []) {
        if (mod.status === 'On Hold' || mod.status === 'SW/Product Issue') {
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
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = (a[sortBy] ?? '').toString();
      const bv = (b[sortBy] ?? '').toString();
      const primary = av.localeCompare(bv) * dir;
      if (primary !== 0) return primary;
      return a.moduleName.localeCompare(b.moduleName);
    });
    return rows;
  }, [restaurants, sortBy, sortDir, restaurantFilter, buddyFilter]);

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

  const onHoldCount = issues.filter(i => i.status === 'On Hold').length;
  const swCount = issues.filter(i => i.status === 'SW/Product Issue').length;

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip label="Total Issues" value={issues.length} color="#6366f1" />
        <Chip label="On Hold" value={onHoldCount} color="#f59e0b" />
        <Chip label="SW / Product Issues" value={swCount} color="#ef4444" />

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{
              fontSize: 11, color: '#6b7280', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              AIO Buddy
            </label>
            <select
              value={buddyFilter}
              onChange={e => setBuddyFilter(e.target.value)}
              style={{
                background: '#12151f',
                border: '1px solid #2d3148',
                borderRadius: 8,
                color: '#e5e7eb',
                fontSize: 12,
                padding: '7px 10px',
                outline: 'none',
                cursor: 'pointer',
                minWidth: 160,
              }}
            >
              <option value="all">All buddies</option>
              {buddyOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{
              fontSize: 11, color: '#6b7280', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>
              Restaurant
            </label>
            <select
              value={restaurantFilter}
              onChange={e => setRestaurantFilter(e.target.value)}
              style={{
                background: '#12151f',
                border: '1px solid #2d3148',
                borderRadius: 8,
                color: '#e5e7eb',
                fontSize: 12,
                padding: '7px 10px',
                outline: 'none',
                cursor: 'pointer',
                minWidth: 180,
              }}
            >
              <option value="all">All restaurants</option>
              {restaurantOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {issues.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: '#4b5563', fontSize: 14,
          border: '1px solid #1f2433', borderRadius: 12,
          background: '#12151f',
        }}>
          No On Hold or SW/Product Issues found.
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
                        <span style={{
                          marginLeft: 4,
                          fontSize: 9,
                          color: isActive ? '#6366f1' : '#4b5563',
                        }}>
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

  // Sync when notes load from server
  useEffect(() => {
    setLocalText(note);
  }, [note]);

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
