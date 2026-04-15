export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.03em',
        background: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}

export function getStatusConfig(status) {
  if (!status || status.trim() === '') {
    return { bg: '#1f2937', color: '#6b7280', label: '—' };
  }
  switch (status.trim()) {
    case 'Live':
      return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Live' };
    case 'Onboarding':
      return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Onboarding' };
    case 'On Hold':
      return { bg: 'rgba(249,115,22,0.15)', color: '#f97316', label: 'On Hold' };
    case 'SW/Product Issue':
      return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'SW/Product Issue' };
    case 'Churned':
      return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Churned' };
    case 'Not Required':
      return { bg: '#1f2937', color: '#6b7280', label: 'Not Required' };
    default:
      return { bg: '#1f2937', color: '#6b7280', label: status };
  }
}
