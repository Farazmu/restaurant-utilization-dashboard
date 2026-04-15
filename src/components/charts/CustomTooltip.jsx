/**
 * Shared custom tooltip component for all Recharts charts.
 *
 * Props (standard Recharts):
 *   active, payload, label
 *
 * Props (custom):
 *   unitLabel     – e.g. "restaurants" (default: "restaurants")
 *   totalCount    – optional denominator used for percentage calculations
 *   extraRenderer – optional (payload0) => JSX for extra lines
 *   formatter     – optional (payload0) => { primary: string, secondary?: string }
 *                   When provided, overrides the default rendering.
 *   lines         – optional array of { label, value, color? } for multi-line tooltips
 */

const TOOLTIP_BG = '#1e2433';
const TOOLTIP_BORDER = '#374151';
const PRIMARY_COLOR = '#ffffff';
const SECONDARY_COLOR = '#94a3b8';

const tooltipContainerStyle = {
  background: TOOLTIP_BG,
  border: `1px solid ${TOOLTIP_BORDER}`,
  borderRadius: 10,
  padding: '10px 14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  fontFamily: 'Inter, system-ui, sans-serif',
  minWidth: 160,
  maxWidth: 300,
  pointerEvents: 'none',
};

export default function CustomTooltip({
  active,
  payload,
  label,
  unitLabel = 'restaurants',
  totalCount,
  extraRenderer,
  formatter,
  lines,
}) {
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0];

  // If a custom formatter is provided, use it
  if (formatter) {
    const result = formatter(entry, payload, label);
    if (!result) return null;
    return (
      <div style={tooltipContainerStyle}>
        {result.title && (
          <div style={{ fontSize: 12, fontWeight: 600, color: PRIMARY_COLOR, marginBottom: 4 }}>
            {result.title}
          </div>
        )}
        {result.primary && (
          <div style={{ fontSize: 12, color: PRIMARY_COLOR }}>
            {result.primary}
          </div>
        )}
        {result.secondary && (
          <div style={{ fontSize: 11, color: SECONDARY_COLOR, marginTop: 2 }}>
            {result.secondary}
          </div>
        )}
        {result.extra && (
          <div style={{ fontSize: 11, color: SECONDARY_COLOR, marginTop: 2 }}>
            {result.extra}
          </div>
        )}
        {extraRenderer && extraRenderer(entry)}
      </div>
    );
  }

  // If lines array provided, render multi-line tooltip
  if (lines) {
    return (
      <div style={tooltipContainerStyle}>
        {label && (
          <div style={{ fontSize: 12, fontWeight: 600, color: PRIMARY_COLOR, marginBottom: 6 }}>
            {label}
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} style={{ fontSize: 11, color: line.color || SECONDARY_COLOR, marginTop: i > 0 ? 2 : 0 }}>
            {line.label && <span style={{ color: SECONDARY_COLOR }}>{line.label}: </span>}
            <span style={{ color: line.color || PRIMARY_COLOR, fontWeight: 600 }}>{line.value}</span>
          </div>
        ))}
        {extraRenderer && extraRenderer(entry)}
      </div>
    );
  }

  // Default: show value + count context
  const value = entry.value;
  const name = entry.name || label || '';

  return (
    <div style={tooltipContainerStyle}>
      <div style={{ fontSize: 12, fontWeight: 600, color: PRIMARY_COLOR }}>
        {name}
      </div>
      <div style={{ fontSize: 12, color: PRIMARY_COLOR, marginTop: 2 }}>
        {value} {unitLabel}
        {totalCount ? (
          <span style={{ color: SECONDARY_COLOR }}> ({((value / totalCount) * 100).toFixed(1)}%)</span>
        ) : null}
      </div>
      {extraRenderer && extraRenderer(entry)}
    </div>
  );
}

/* ─── Cursor constants for consistent hover highlight ─── */
export const barCursor = { fill: 'rgba(99,102,241,0.08)' };
export const scatterCursor = { strokeDasharray: '3 3' };
