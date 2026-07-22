import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RegistraModal from '../pages/RegistraModal';
import ErrorBoundary from '../components/ErrorBoundary';
import { getGroup } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function AppLayout() {
  const { me, logout, refreshMe } = useAuth();
  const { pathname } = useLocation();
  const [group, setGroup] = useState(null);
  const [registraOpen, setRegistraOpen] = useState(false);
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
      <Sidebar me={me} onLogout={logout} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar me={me} group={group} onRegistra={() => setRegistraOpen(true)} />
        <div style={{
          flex: 1, padding: '32px 36px 48px',
          maxWidth: 1280, width: '100%', margin: '0 auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* key=pathname remounts the boundary on navigation so a crashed
              page doesn't keep showing the fallback after you move away. */}
          <ErrorBoundary key={pathname}>
            <Outlet context={{ onRegistra: () => setRegistraOpen(true), matchVersion, onMatchChanged }} />
          </ErrorBoundary>
        </div>
      </main>
      {registraOpen && (
        <RegistraModal onClose={(saved) => {
          setRegistraOpen(false);
          if (saved) onMatchChanged();
        }} />
      )}
    </div>
  );
}
