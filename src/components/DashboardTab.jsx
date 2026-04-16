import { memo } from 'react';
import BuddyBar from './charts/BuddyBar.jsx';
import HealthDonut from './charts/HealthDonut.jsx';
import CategoryPerformance from './charts/CategoryPerformance.jsx';
import LifecycleBreakdown from './charts/LifecycleBreakdown.jsx';

function ChartCard({ children, title, subtitle, span = 1, style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1d27, #16192380)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #2d3148',
      borderRadius: 14,
      padding: '20px 24px',
      gridColumn: span === 'full' ? '1 / -1' : `span ${span}`,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {title && (
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f3f4f6', marginBottom: 4 }}>{title}</div>
      )}
      {subtitle && (
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 16 }}>{subtitle}</div>
      )}
      {children}
    </div>
  );
}

function DashboardTab({ restaurants, allRestaurants }) {
  return (
    <>
      <div className="dashboard-grid">
        {/* Row 1: Health Donut + Lifecycle Breakdown */}
        <ChartCard title="Health Distribution" subtitle="Restaurant health status breakdown">
          <HealthDonut restaurants={restaurants} />
        </ChartCard>

        <ChartCard title="Lifecycle Breakdown" subtitle="Restaurant lifecycle distribution">
          <LifecycleBreakdown restaurants={allRestaurants} />
        </ChartCard>

        {/* Row 2: Category Performance (full width) */}
        <ChartCard
          title="Category Performance"
          subtitle="Average score per product category across all active restaurants"
          span="full"
        >
          <CategoryPerformance restaurants={restaurants} />
        </ChartCard>

        {/* Row 3: AIO Buddy Performance + Module Adoption */}
        <ChartCard title="AIO Buddy Performance" subtitle="Average utilization per buddy, sorted by performance">
          <BuddyBar restaurants={restaurants} />
        </ChartCard>
      </div>

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          animation: fadeUp 0.5s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default memo(DashboardTab);
