import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllTasks } from './lib/asanaClient.js';
import { enrichAll } from './lib/formulaEngine.js';
import { getCachedData, setCachedData } from './lib/cache.js';
import { getSession, setSession, clearSession } from './lib/authStore.js';
import { runFormulaVerification } from './lib/verifyOnLoad.js';
import LoginScreen from './components/LoginScreen.jsx';
import SummaryBar from './components/SummaryBar.jsx';
import RestaurantTable from './components/RestaurantTable.jsx';
import DetailDrawer from './components/DetailDrawer.jsx';
import TopBottom from './components/TopBottom.jsx';
import TabNav from './components/TabNav.jsx';
import DashboardTab from './components/AnalyticsTab.jsx';
import ModuleBreakdownTab from './components/ModuleBreakdownTab.jsx';

export default function App() {
  const [authTeam, setAuthTeam] = useState(() => {
    const session = getSession();
    return session ? session.team : null;
  });
  const [restaurants, setRestaurants] = useState([]);
  const [loadingPhase, setLoadingPhase] = useState(null); // null | 'loading' | 'processing' | 'refreshing'
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('aio-active-tab');
      return saved === 'overview' || saved === 'dashboard' || saved === 'modules' ? saved : 'overview';
    } catch { return 'overview'; }
  });

  // Persist active tab to localStorage
  useEffect(() => {
    try { localStorage.setItem('aio-active-tab', activeTab); } catch {}
  }, [activeTab]);

  const handleLogin = useCallback((team) => {
    setSession(team);
    setAuthTeam(team);
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setAuthTeam(null);
  }, []);

  // Show login screen if not authenticated
  if (!authTeam) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const loading = loadingPhase === 'loading' || loadingPhase === 'processing';
  const isBackgroundRefresh = loadingPhase === 'refreshing';

  // Split restaurants by lifecycle (section-based)
  const { active, excludedCount } = useMemo(() => {
    const active = [];
    let excludedCount = 0;
    for (const r of restaurants) {
      if (r.lifecycle === 'Active') {
        active.push(r);
      } else {
        excludedCount++;
      }
    }
    return { active, excludedCount };
  }, [restaurants]);

  const handleSelect = useCallback((r) => setSelected(r), []);
  const handleClose = useCallback(() => setSelected(null), []);

  async function fetchAndEnrich() {
    setLoadingPhase(prev => prev === 'refreshing' ? 'refreshing' : 'loading');
    setError(null);
    try {
      const tasks = await fetchAllTasks();
      setLoadingPhase(prev => prev === 'refreshing' ? 'refreshing' : 'processing');
      const enriched = enrichAll(tasks);
      setRestaurants(enriched);
      setCachedData(enriched);
      setLastFetched(new Date());
      runFormulaVerification(enriched);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingPhase(null);
    }
  }

  function load() {
    setLoadingPhase('loading');
    fetchAndEnrich();
  }

  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      setRestaurants(cached.data);
      setLastFetched(new Date(cached.timestamp));
      // Show cached data, refresh in background
      setLoadingPhase('refreshing');
      fetchAndEnrich();
    } else {
      load();
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Nav */}
      <div style={{
        background: 'linear-gradient(180deg, #0d0f19, #0f1117)',
        borderBottom: '1px solid #1f2433',
        padding: '0 28px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff',
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
          }}>
            A
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#f9fafb' }}>AIO Utilization</span>
          <span style={{ fontSize: 12, color: '#4b5563', marginLeft: 4, fontWeight: 500 }}>Restaurant Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isBackgroundRefresh && (
            <span style={{
              fontSize: 11,
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#6366f1',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              Updating...
            </span>
          )}
          {lastFetched && !isBackgroundRefresh && (
            <span style={{ fontSize: 11, color: '#4b5563' }}>
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading || isBackgroundRefresh}
            style={{
              background: loading ? '#1f2433' : 'linear-gradient(135deg, #1e2238, #252a40)',
              border: '1px solid #2d3148',
              borderRadius: 9,
              padding: '6px 16px',
              color: loading ? '#6b7280' : '#a5b4fc',
              fontSize: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {loading ? 'Loading...' : '\u21ba Refresh'}
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #2d3148',
              borderRadius: 9,
              padding: '6px 14px',
              color: '#6b7280',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {authTeam} &middot; Logout
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main */}
      <div style={{ maxWidth: activeTab === 'modules' ? 'none' : 1400, margin: '0 auto', padding: '24px 28px' }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            color: '#fca5a5', fontSize: 13,
          }}>
            <strong>Error fetching Asana data:</strong> {error}
            <button
              onClick={load}
              style={{
                marginLeft: 12,
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 6,
                padding: '3px 10px',
                color: '#fca5a5',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading && restaurants.length === 0 ? (
          <LoadingState phase={loadingPhase} />
        ) : activeTab === 'overview' ? (
          <>
            {/* Summary — active restaurants only */}
            <section style={{ marginBottom: 24 }}>
              <SummaryBar restaurants={active} />
              {excludedCount > 0 && (
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 10 }}>
                  {excludedCount} non-live restaurant{excludedCount !== 1 ? 's' : ''} hidden
                </div>
              )}
            </section>

            {/* Top/Bottom — active only */}
            <section style={{ marginBottom: 24 }}>
              <TopBottom restaurants={active} />
            </section>

            {/* Live Restaurants Table */}
            <section style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Live Restaurants
              </div>
              <RestaurantTable restaurants={active} onRowClick={handleSelect} />
            </section>
          </>
        ) : activeTab === 'dashboard' ? (
          <DashboardTab restaurants={active} />
        ) : (
          <ModuleBreakdownTab restaurants={active} onRowClick={handleSelect} />
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <DetailDrawer restaurant={selected} onClose={handleClose} />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function LoadingState({ phase }) {
  const message = phase === 'processing'
    ? 'Processing data...'
    : 'Loading restaurants from Asana...';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
      <div style={{
        width: 36, height: 36, border: '3px solid #2d3148',
        borderTopColor: '#6366f1', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: '#6b7280', fontSize: 14 }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
