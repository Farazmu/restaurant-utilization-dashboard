import { memo } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
];

function TabNav({ activeTab, onTabChange }) {
  return (
    <div style={{
      background: '#0f1117',
      borderBottom: '1px solid #1f2433',
      padding: '0 28px',
      display: 'flex',
      gap: 0,
      position: 'sticky',
      top: 52,
      zIndex: 49,
      overflowX: 'auto',
    }}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
              padding: '12px 20px',
              color: isActive ? '#a5b4fc' : '#6b7280',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.color = '#9ca3af';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.color = '#6b7280';
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default memo(TabNav);
