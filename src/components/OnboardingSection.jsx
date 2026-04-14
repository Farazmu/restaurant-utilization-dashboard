import StatusBadge from './StatusBadge.jsx';
import { CATEGORIES } from '../config/modules.js';

export default function OnboardingSection({ restaurants, onRowClick }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Onboarding Restaurants
        </div>
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 600,
          background: 'rgba(59,130,246,0.15)',
          color: '#3b82f6',
        }}>
          {restaurants.length}
        </span>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #1e3a5f' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <Th align="left">Restaurant</Th>
              <Th align="left">AIO Buddy</Th>
              <Th>Modules Onboarding</Th>
              {CATEGORIES.map(cat => (
                <Th key={cat}>{catAbbrev(cat)}</Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r, idx) => (
              <OnboardingRow key={r.id} restaurant={r} idx={idx} onClick={() => onRowClick(r)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OnboardingRow({ restaurant: r, idx, onClick }) {
  const onboardingModules = r.moduleDetails.filter(m => m.status === 'Onboarding');
  const totalIncluded = r.moduleDetails.filter(m => m.included).length;

  // Per-category: count onboarding modules
  const catSummary = {};
  for (const cat of CATEGORIES) {
    const catMods = r.moduleDetails.filter(m => m.category === cat);
    const onb = catMods.filter(m => m.status === 'Onboarding').length;
    const live = catMods.filter(m => m.status === 'Live').length;
    const total = catMods.filter(m => m.included).length;
    catSummary[cat] = { onb, live, total };
  }

  const tdBase = {
    padding: '9px 12px',
    borderBottom: '1px solid #1a2744',
    background: idx % 2 === 0 ? '#0f1a2e' : '#111d33',
    cursor: 'pointer',
  };

  return (
    <tr onClick={onClick} style={{ transition: 'background 0.1s' }}>
      <td style={{ ...tdBase, fontWeight: 500, color: '#f3f4f6', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {r.name}
      </td>
      <td style={{ ...tdBase, color: '#9ca3af', whiteSpace: 'nowrap' }}>
        {r.aioBuddy || <span style={{ color: '#374151' }}>—</span>}
      </td>
      <td style={{ ...tdBase, textAlign: 'center' }}>
        <span style={{ color: '#3b82f6', fontWeight: 600 }}>{onboardingModules.length}</span>
        <span style={{ color: '#4b5563' }}> / {totalIncluded}</span>
      </td>
      {CATEGORIES.map(cat => {
        const { onb, live, total } = catSummary[cat];
        if (total === 0) {
          return <td key={cat} style={{ ...tdBase, textAlign: 'center', color: '#374151' }}>—</td>;
        }
        return (
          <td key={cat} style={{ ...tdBase, textAlign: 'center' }}>
            {live > 0 && <span style={{ color: '#10b981', fontSize: 11, marginRight: 4 }}>{live}L</span>}
            {onb > 0 && <span style={{ color: '#3b82f6', fontSize: 11 }}>{onb}O</span>}
            {live === 0 && onb === 0 && <span style={{ color: '#6b7280', fontSize: 11 }}>0</span>}
          </td>
        );
      })}
    </tr>
  );
}

function Th({ children, align = 'center' }) {
  return (
    <th style={{
      padding: '8px 12px',
      textAlign: align,
      fontSize: 11,
      fontWeight: 600,
      color: '#3b82f6',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
      borderBottom: '1px solid #1e3a5f',
      background: '#0c1525',
    }}>
      {children}
    </th>
  );
}

const CAT_ABBREV = {
  'Order & Pay':     'O&P',
  'Marketing (On)':  'Mkt On',
  'Marketing (Off)': 'Mkt Off',
  'Payroll':         'Pay',
  'MoM':             'MoM',
  'Tips + Office':   'Tips',
};

function catAbbrev(cat) {
  return CAT_ABBREV[cat] || cat;
}
