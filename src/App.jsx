import { useState, useEffect, useMemo } from 'react';
import { fetchAllTasks } from './lib/asanaClient.js';
import { enrichAll } from './lib/formulaEngine.js';
import SummaryBar from './components/SummaryBar.jsx';
import RestaurantTable from './components/RestaurantTable.jsx';
import DetailDrawer from './components/DetailDrawer.jsx';
import TopBottom from './components/TopBottom.jsx';
import OnboardingSection from './components/OnboardingSection.jsx';

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Split restaurants by lifecycle
  const { active, onboarding, excludedCount } = useMemo(() => {
    const active = [];
    const onboarding = [];
    let excludedCount = 0;
    for (const r of restaurants) {
      if (r.lifecycle === 'Active') {
        active.push(r);
      } else if (r.lifecycle === 'Onboarding') {
        onboarding.push(r);
      } else {
        excludedCount++;
      }
    }
    return { active, onboarding, excludedCount };
  }, [restaurants]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const tasks = await fetchAllTasks();
      const enriched = enrichAll(tasks);
      setRestaurants(enriched);
      setLastFetched(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Nav */}
      <div style={{
        background: '#0d0f19',
        borderBottom: '1px solid #1f2433',
        padding: '0 28px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff',
          }}>
            A
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#f9fafb' }}>AIO Utilization</span>
          <span style={{ fontSize: 12, color: '#374151', marginLeft: 4 }}>Restaurant Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastFetched && (
            <span style={{ fontSize: 11, color: '#4b5563' }}>
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            style={{
              background: loading ? '#1f2433' : '#1e2238',
              border: '1px solid #2d3148',
              borderRadius: 7,
              padding: '5px 14px',
              color: loading ? '#6b7280' : '#a5b4fc',
              fontSize: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Loading…' : '↺ Refresh'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 28px' }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '14px 18px', marginBottom: 20,
            color: '#fca5a5', fontSize: 13,
          }}>
            <strong>Error fetching Asana data:</strong> {error}
          </div>
        )}

        {loading && restaurants.length === 0 ? (
          <LoadingState />
        ) : (
          <>
            {/* Summary — active restaurants only */}
            <section style={{ marginBottom: 20 }}>
              <SummaryBar restaurants={active} />
              {excludedCount > 0 && (
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 8 }}>
                  {excludedCount} non-live restaurant{excludedCount !== 1 ? 's' : ''} hidden
                </div>
              )}
            </section>

            {/* Top/Bottom — active only */}
            <section style={{ marginBottom: 20 }}>
              <TopBottom restaurants={active} />
            </section>

            {/* Active Restaurants Table */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Active Restaurants
              </div>
              <RestaurantTable restaurants={active} onRowClick={setSelected} />
            </section>

            {/* Onboarding Restaurants — separate section */}
            {onboarding.length > 0 && (
              <section>
                <OnboardingSection restaurants={onboarding} onRowClick={setSelected} />
              </section>
            )}
          </>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer restaurant={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
      <div style={{
        width: 36, height: 36, border: '3px solid #2d3148',
        borderTopColor: '#6366f1', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: '#6b7280', fontSize: 14 }}>Fetching restaurants from Asana…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
