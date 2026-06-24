import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RegistraModal from '../pages/RegistraModal';
import { getGroup } from '../api/mock';
import { useAuth } from '../auth/AuthContext';

export default function AppLayout() {
  const { me, logout, refreshMe } = useAuth();
  const [group, setGroup] = useState(null);
  const [registraOpen, setRegistraOpen] = useState(false);

  useEffect(() => {
    // Group is optional (the DB may have none yet) — ignore a 404.
    getGroup().then(setGroup).catch(() => setGroup(null));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar me={me} onLogout={logout} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar group={group} onRegistra={() => setRegistraOpen(true)} />
        <div style={{
          flex: 1, padding: '32px 36px 48px',
          maxWidth: 1280, width: '100%', margin: '0 auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <Outlet context={{ onRegistra: () => setRegistraOpen(true) }} />
        </div>
      </main>
      {registraOpen && (
        <RegistraModal onClose={() => { setRegistraOpen(false); refreshMe(); }} />
      )}
    </div>
  );
}
