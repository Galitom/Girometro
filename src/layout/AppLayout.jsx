import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RegistraModal from '../pages/RegistraModal';
import PlayerStatsModal from '../components/PlayerStatsModal';
import ErrorBoundary from '../components/ErrorBoundary';
import { getGroup } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function AppLayout() {
  const { me, logout, refreshMe } = useAuth();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [group, setGroup] = useState(null);
  const [registraOpen, setRegistraOpen] = useState(false);
  // Off-canvas nav drawer (mobile only). Closed on every navigation.
  const [navOpen, setNavOpen] = useState(false);
  // Slug of the player whose stats modal is open (null = closed). Opened via the
  // outlet-context `onPlayerClick`, so any non-admin page can pop the profile modal.
  const [viewPlayer, setViewPlayer] = useState(null);
  // Bumped whenever a match is recorded/edited/deleted, so pages can re-fetch
  // match-derived data (last match, activity, stats, ranking) and show the new
  // Elo live. `onMatchChanged` lets pages (e.g. Gestione Partite) trigger this too.
  const [matchVersion, setMatchVersion] = useState(0);
  const onMatchChanged = () => { refreshMe(); setMatchVersion(v => v + 1); };

  useEffect(() => {
    // Group is optional (the DB may have none yet) — ignore a 404.
    getGroup().then(setGroup).catch(() => setGroup(null));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* The drawer only opens on mobile; on desktop the sidebar is a static rail
          and `navOpen` is ignored. Navigating (NavLink click) closes it. */}
      <Sidebar
        me={me} onLogout={logout} isMobile={isMobile}
        open={isMobile && navOpen}
        onClose={() => setNavOpen(false)}
        onNavigate={() => setNavOpen(false)}
      />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          me={me} group={group}
          onRegistra={() => setRegistraOpen(true)}
          isMobile={isMobile}
          onMenu={() => setNavOpen(true)}
        />
        <div style={{
          flex: 1, padding: isMobile ? '20px 16px 40px' : '32px 36px 48px',
          maxWidth: 1280, width: '100%', margin: '0 auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* key=pathname remounts the boundary on navigation so a crashed
              page doesn't keep showing the fallback after you move away. */}
          <ErrorBoundary key={pathname}>
            <Outlet context={{
              onRegistra: () => setRegistraOpen(true),
              onPlayerClick: (slug) => slug && setViewPlayer(slug),
              matchVersion,
              onMatchChanged,
            }} />
          </ErrorBoundary>
        </div>
      </main>
      {registraOpen && (
        <RegistraModal onClose={(saved) => {
          setRegistraOpen(false);
          if (saved) onMatchChanged();
        }} />
      )}
      {viewPlayer && (
        <PlayerStatsModal
          // Remount on slug change so state (loading spinner) resets cleanly.
          key={viewPlayer}
          slug={viewPlayer}
          // A string arg is an in-modal navigation to another player; anything
          // else (backdrop/X click event) closes it.
          onClose={(next) => setViewPlayer(typeof next === 'string' ? next : null)}
        />
      )}
    </div>
  );
}
