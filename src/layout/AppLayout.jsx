import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RegistraModal from '../pages/RegistraModal';
import { getMe, getGroup } from '../api/mock';

export default function AppLayout() {
  const [me, setMe] = useState(null);
  const [group, setGroup] = useState(null);
  const [registraOpen, setRegistraOpen] = useState(false);

  useEffect(() => {
    getMe().then(setMe);
    getGroup().then(setGroup);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar me={me} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar group={group} onRegistra={() => setRegistraOpen(true)} />
        <div style={{
          flex: 1, padding: '32px 36px 48px',
          maxWidth: 1280, width: '100%', margin: '0 auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <Outlet />
        </div>
      </main>
      {registraOpen && <RegistraModal onClose={() => setRegistraOpen(false)} />}
    </div>
  );
}
