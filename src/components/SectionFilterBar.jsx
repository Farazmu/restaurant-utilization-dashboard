import { memo } from 'react';

const SECTION_COLORS = {
  'Live Restaurants':      '#10b981',
  'Marketing Live':        '#8b5cf6',
  'Onboarding':            '#3b82f6',
  'Marketing Onboarding':  '#6366f1',
  'On Hold Restaurants':   '#f59e0b',
  'Churned':               '#ef4444',
  'Churned Restaurants':   '#ef4444',
};

const DEFAULT_COLOR = '#6b7280';

function getColor(name) {
  return SECTION_COLORS[name] || DEFAULT_COLOR;
}

function SectionFilterBar({ sections, selectedSections, onToggle, onReset, totalCount, teamOptions, selectedTeam, onTeamChange }) {
  const selectedCount = sections
    .filter(s => selectedSections.includes(s.name))
    .reduce((sum, s) => sum + s.count, 0);

  return (
    <div style={{
      padding: '12px 28px',
      borderBottom: '1px solid #1f2433',
      background: '#0f1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
    }}>
      {/* Section Chips + Team Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {/* Team Dropdown */}
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Select Team
        </span>
        <select
          value={selectedTeam}
          onChange={e => onTeamChange(e.target.value)}
          style={{
            background: selectedTeam === 'All' ? '#1a1d27' : 'rgba(99,102,241,0.12)',
            border: `1px solid ${selectedTeam === 'All' ? '#2d3148' : '#6366f1'}`,
            borderRadius: 9999,
            padding: '5px 12px',
            color: selectedTeam === 'All' ? '#6b7280' : '#a5b4fc',
            fontSize: 12,
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
        >
          {(teamOptions || ['All']).map(t => (
            <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>
          ))}
        </select>

        <span style={{ width: 1, height: 20, background: '#2d3148', flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Restaurant Status
        </span>
        {sections.map(({ name, count }) => {
          const color = getColor(name);
          const isActive = selectedSections.includes(name);
          return (
            <button
              key={name}
              onClick={() => onToggle(name)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: `1px solid ${isActive ? color : '#2d3148'}`,
                background: isActive ? `${color}15` : 'transparent',
                color: isActive ? color : '#6b7280',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${color}60`;
                  e.currentTarget.style.color = `${color}aa`;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#2d3148';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isActive ? color : '#4b5563',
                flexShrink: 0,
                transition: 'background 0.2s ease',
              }} />
              {name}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 9999,
                background: isActive ? `${color}25` : '#1f2937',
                color: isActive ? color : '#4b5563',
                fontVariantNumeric: 'tabular-nums',
                transition: 'all 0.2s ease',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary + Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: '#4b5563', fontVariantNumeric: 'tabular-nums' }}>
          {selectedCount} of {totalCount} shown
        </span>
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: '1px solid #2d3148',
            borderRadius: 8,
            padding: '4px 10px',
            color: '#6b7280',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#4b5563';
            e.currentTarget.style.color = '#9ca3af';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#2d3148';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default memo(SectionFilterBar);
