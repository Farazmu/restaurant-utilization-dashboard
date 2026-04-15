import { useState, useMemo, memo } from 'react';
import { calcMarketingScore } from '../lib/formulaEngine.js';
import { HEALTH_COLORS } from './ProgressBar.jsx';
import { getHealth } from '../lib/formulaEngine.js';

const PURPLE = '#8b5cf6';
const PURPLE_DIM = '#8b5cf620';

function getScoreColor(score) {
  if (score === null) return '#374151';
  return HEALTH_COLORS[getHealth(score)] || '#6b7280';
}

function MarketingLiveSection({ restaurants, onRowClick }) {
  const [sortCol, setSortCol] = useState('marketingScore');
  const [sortDir, setSortDir] = useState('desc');

  // Filter to active restaurants with marketingScore > 0
  const marketingRestaurants = useMemo(() => {
    return restaurants
      .map(r => ({
        ...r,
        marketingScore: calcMarketingScore(r),
        marketingOnScore: r.categoryScores['Marketing (On)'] ?? null,
        marketingOffScore: r.categoryScores['Marketing (Off)'] ?? null,
        liveMarketingModules: r.moduleDetails.filter(
          m => (m.category === 'Marketing (On)' || m.category === 'Marketing (Off)') && m.status === 'Live'
        ),
      }))
      .filter(r => r.marketingScore !== null && r.marketingScore > 0);
  }, [restaurants]);

  const sorted = useMemo(() => {
    return [...marketingRestaurants].sort((a, b) => {
      let av, bv;
      if (sortCol === 'name') {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (sortCol === 'buddy') {
        av = (a.aioBuddy || '').toLowerCase();
        bv = (b.aioBuddy || '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (sortCol === 'marketingScore') {
        av = a.marketingScore ?? -1;
        bv = b.marketingScore ?? -1;
      } else if (sortCol === 'marketingOn') {
        av = a.marketingOnScore ?? -1;
        bv = b.marketingOnScore ?? -1;
      } else if (sortCol === 'marketingOff') {
        av = a.marketingOffScore ?? -1;
        bv = b.marketingOffScore ?? -1;
      } else if (sortCol === 'liveModules') {
        av = a.liveMarketingModules.length;
        bv = b.liveMarketingModules.length;
      } else {
        av = 0;
        bv = 0;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [marketingRestaurants, sortCol, sortDir]);

  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }

  if (marketingRestaurants.length === 0) return null;

  const thStyle = (col, align = 'right') => ({
    padding: '10px 14px',
    textAlign: align,
    fontSize: 10,
    fontWeight: 700,
    color: sortCol === col ? '#c4b5fd' : '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${PURPLE}30`,
    background: '#12151f',
    transition: 'color 0.15s',
  });

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ color: '#374151', marginLeft: 4, fontSize: 10 }}>{'\u2195'}</span>;
    return <span style={{ color: PURPLE, marginLeft: 4, fontSize: 10 }}>{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>;
  };

  return (
    <div style={{ animation: 'fadeUpMkt 0.5s ease 0.2s both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: PURPLE, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Marketing Live
        </div>
        <span style={{
          display: 'inline-block',
          padding: '2px 9px',
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 600,
          background: PURPLE_DIM,
          color: PURPLE,
          border: `1px solid ${PURPLE}30`,
        }}>
          {marketingRestaurants.length}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 14, border: `1px solid ${PURPLE}30`, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle('name', 'left')} onClick={() => handleSort('name')}>
                Restaurant <SortIcon col="name" />
              </th>
              <th style={thStyle('buddy', 'left')} onClick={() => handleSort('buddy')}>
                AIO Buddy <SortIcon col="buddy" />
              </th>
              <th style={{ ...thStyle('marketingScore'), minWidth: 150 }} onClick={() => handleSort('marketingScore')}>
                Marketing Score <SortIcon col="marketingScore" />
              </th>
              <th style={{ ...thStyle('marketingOn'), minWidth: 90 }} onClick={() => handleSort('marketingOn')}>
                Mktg On % <SortIcon col="marketingOn" />
              </th>
              <th style={{ ...thStyle('marketingOff'), minWidth: 90 }} onClick={() => handleSort('marketingOff')}>
                Mktg Off % <SortIcon col="marketingOff" />
              </th>
              <th style={{ ...thStyle('liveModules', 'left'), minWidth: 180 }} onClick={() => handleSort('liveModules')}>
                Live Marketing Modules <SortIcon col="liveModules" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => (
              <MarketingRow key={r.id} restaurant={r} idx={idx} onClick={() => onRowClick(r)} />
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes fadeUpMkt {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default memo(MarketingLiveSection);

function MarketingRow({ restaurant: r, idx, onClick }) {
  const [hovered, setHovered] = useState(false);
  const rowBg = idx % 2 === 0 ? '#12151f' : '#14171f';

  const tdBase = {
    padding: '10px 14px',
    borderBottom: '1px solid #1f243320',
    background: hovered ? '#1e2238' : rowBg,
    transition: 'background 0.15s',
    cursor: 'pointer',
  };

  const mktPct = r.marketingScore !== null ? (r.marketingScore * 100).toFixed(1) : '---';
  const mktColor = getScoreColor(r.marketingScore);
  const onPct = r.marketingOnScore !== null ? (r.marketingOnScore * 100).toFixed(0) + '%' : '---';
  const offPct = r.marketingOffScore !== null ? (r.marketingOffScore * 100).toFixed(0) + '%' : '---';

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ ...tdBase, fontWeight: 500, color: '#f3f4f6', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {r.name}
      </td>
      <td style={{ ...tdBase, color: '#9ca3af', whiteSpace: 'nowrap', fontSize: 12 }}>
        {r.aioBuddy || <span style={{ color: '#374151' }}>---</span>}
      </td>
      <td style={{ ...tdBase, minWidth: 150 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: mktColor, minWidth: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {mktPct}{mktPct !== '---' ? '%' : ''}
          </span>
          <div style={{ width: 64, height: 5, background: '#1f2937', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              width: `${r.marketingScore !== null ? Math.min(100, r.marketingScore * 100) : 0}%`,
              height: '100%',
              background: mktColor,
              borderRadius: 9999,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </td>
      <td style={{ ...tdBase, textAlign: 'right' }}>
        <span style={{ fontSize: 12, color: '#d1d5db', fontVariantNumeric: 'tabular-nums' }}>{onPct}</span>
      </td>
      <td style={{ ...tdBase, textAlign: 'right' }}>
        <span style={{ fontSize: 12, color: '#d1d5db', fontVariantNumeric: 'tabular-nums' }}>{offPct}</span>
      </td>
      <td style={{ ...tdBase }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {r.liveMarketingModules.length > 0 ? (
            r.liveMarketingModules.map(mod => (
              <span key={mod.fieldGid} style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 600,
                background: `${PURPLE}18`,
                color: '#c4b5fd',
                border: `1px solid ${PURPLE}30`,
                whiteSpace: 'nowrap',
              }}>
                {mod.name}
              </span>
            ))
          ) : (
            <span style={{ color: '#374151', fontSize: 12 }}>---</span>
          )}
        </div>
      </td>
    </tr>
  );
}
