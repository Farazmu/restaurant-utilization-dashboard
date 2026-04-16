import { useMemo, memo } from 'react';
import { MODULE_CONFIG, CATEGORIES } from '../config/modules.js';

/* ── Category colours ── */
const CAT_HEADER_BG = {
  'Order & Pay':     '#0d2137',
  'Marketing (On)':  '#0d2219',
  'Marketing (Off)': '#1f1c08',
  'Payroll':         '#1f0d0d',
  'MoM':             '#130d1f',
  'Tips + Office':   '#1f1208',
};
const CAT_COLOR = {
  'Order & Pay':     '#60a5fa',
  'Marketing (On)':  '#4ade80',
  'Marketing (Off)': '#facc15',
  'Payroll':         '#f87171',
  'MoM':             '#a78bfa',
  'Tips + Office':   '#fb923c',
};

/* ── Rate → color ── */
function rateStyle(rate) {
  if (rate >= 0.70) return { bg: 'rgba(34,197,94,0.18)',   text: '#22c55e' };
  if (rate >= 0.50) return { bg: 'rgba(96,165,250,0.18)',  text: '#60a5fa' };
  if (rate >= 0.30) return { bg: 'rgba(234,179,8,0.18)',   text: '#eab308' };
  if (rate >= 0.10) return { bg: 'rgba(249,115,22,0.18)',  text: '#f97316' };
  return                    { bg: 'rgba(239,68,68,0.18)',  text: '#ef4444' };
}

/* ── Category groups (stable) ── */
const GROUPS = CATEGORIES.map(cat => ({
  cat,
  modules: MODULE_CONFIG.filter(m => m.category === cat),
}));

const COL_W   = 92;
const LABEL_W = 96;
const ROW_H   = 26;

const cellBase = {
  border: '1px solid #1f2433',
  padding: '0 6px',
  height: ROW_H,
  verticalAlign: 'middle',
};

const labelCell = {
  ...cellBase,
  position: 'sticky',
  left: 0,
  zIndex: 2,
  background: '#0d0f16',
  color: '#6b7280',
  fontWeight: 700,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  whiteSpace: 'nowrap',
  minWidth: LABEL_W,
  width: LABEL_W,
};

function ModuleBreakdownTab({ restaurants }) {
  /* Per-module: list of adopter names (Live status) */
  const { moduleData, maxAdopters } = useMemo(() => {
    const map = {};
    for (const mod of MODULE_CONFIG) {
      map[mod.fieldGid] = { name: mod.name, category: mod.category, adopters: [] };
    }
    for (const r of restaurants) {
      for (const mod of r.moduleDetails) {
        if (mod.status === 'Live') map[mod.fieldGid].adopters.push(r.name);
      }
    }
    const maxAdopters = Math.max(0, ...Object.values(map).map(m => m.adopters.length));
    return { moduleData: map, maxAdopters };
  }, [restaurants]);

  const total = restaurants.length;

  return (
    <div style={{
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 140px)',
      borderRadius: 12,
      border: '1px solid #1f2433',
    }}>
      <table style={{
        borderCollapse: 'separate',
        borderSpacing: 0,
        fontSize: 11,
        whiteSpace: 'nowrap',
        minWidth: MODULE_CONFIG.length * COL_W + LABEL_W,
        width: '100%',
      }}>
        <thead>
          {/* ── CATEGORY HEADER ── */}
          <tr>
            <th style={{ ...cellBase, ...labelCell, zIndex: 4, background: '#0d0f16', position: 'sticky', top: 0 }} />
            {GROUPS.map(({ cat, modules }) => (
              <th
                key={cat}
                colSpan={modules.length}
                style={{
                  ...cellBase,
                  background: CAT_HEADER_BG[cat] || '#131720',
                  color: CAT_COLOR[cat] || '#f3f4f6',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  height: 28,
                  position: 'sticky',
                  top: 0,
                  zIndex: 3,
                }}
              >
                {cat}
              </th>
            ))}
          </tr>

          {/* ── MODULE NAME ── */}
          <tr>
            <th style={{ ...cellBase, ...labelCell, zIndex: 4, top: 28, position: 'sticky', background: '#131720' }}>
              Module
            </th>
            {MODULE_CONFIG.map(mod => (
              <th key={mod.fieldGid} style={{
                ...cellBase,
                background: '#131720',
                color: '#d1d5db',
                fontWeight: 700,
                fontSize: 10,
                textAlign: 'center',
                maxWidth: COL_W,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                position: 'sticky',
                top: 28,
                zIndex: 2,
              }}>
                {mod.name}
              </th>
            ))}
          </tr>

          {/* ── ADOPTED COUNT ── */}
          <tr>
            <td style={{ ...cellBase, ...labelCell }}>Adopted</td>
            {MODULE_CONFIG.map(mod => {
              const count = moduleData[mod.fieldGid].adopters.length;
              const rate  = total > 0 ? count / total : 0;
              const { bg, text } = rateStyle(rate);
              return (
                <td key={mod.fieldGid} style={{ ...cellBase, textAlign: 'center', background: '#0f1117' }}>
                  <span style={{
                    display: 'inline-block',
                    background: bg,
                    color: text,
                    fontWeight: 800,
                    fontSize: 12,
                    borderRadius: 6,
                    padding: '1px 10px',
                    minWidth: 30,
                  }}>
                    {count}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* ── RATE % ── */}
          <tr>
            <td style={{ ...cellBase, ...labelCell }}>Rate</td>
            {MODULE_CONFIG.map(mod => {
              const rate = total > 0 ? moduleData[mod.fieldGid].adopters.length / total : 0;
              const { bg, text } = rateStyle(rate);
              return (
                <td key={mod.fieldGid} style={{ ...cellBase, textAlign: 'center', background: bg }}>
                  <span style={{ color: text, fontWeight: 700, fontSize: 11 }}>
                    {Math.round(rate * 100)}%
                  </span>
                </td>
              );
            })}
          </tr>
        </thead>

        {/* ── RESTAURANT ROWS ── */}
        <tbody>
          {Array.from({ length: maxAdopters }, (_, i) => (
            <tr key={i}>
              <td style={{ ...cellBase, ...labelCell, background: i % 2 === 0 ? '#0f1117' : '#0d0f16' }} />
              {MODULE_CONFIG.map(mod => {
                const name = moduleData[mod.fieldGid].adopters[i];
                return (
                  <td key={mod.fieldGid} style={{
                    ...cellBase,
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 10,
                    background: i % 2 === 0 ? '#0f1117' : '#0d0f16',
                    maxWidth: COL_W,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {name || ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ModuleBreakdownTab);
