import { useState, useEffect } from 'react';
import Avatar from '../components/ui/Avatar';
import Panel, { PanelTitle } from '../components/ui/Panel';
import { getManagedUsers, setUserRole } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { ROLES, ROLE_LABELS } from '../auth/roles';

const ROLE_ORDER = [ROLES.PLAYER, ROLES.BACKOFFICE, ROLES.ADMIN];

export default function GestioneRuoli() {
  const { me, refreshMe } = useAuth();
  const [users, setUsers] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getManagedUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  if (!users) return null;

  async function changeRole(user, role) {
    if (role === user.role) return;
    setSavingId(user.id);
    setError('');
    try {
      const updated = await setUserRole(user.id, role);
      setUsers((list) => list.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u)));
      // Se ho cambiato il mio stesso ruolo, aggiorno la sessione (nav/permessi).
      if (updated.id === me.id) refreshMe();
    } catch (e) {
      setError(e?.data?.detail || 'Impossibile aggiornare il ruolo.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="screen-in">
      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Amministrazione</div>
        <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Gestione Ruoli</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>
          Assegna i permessi: <strong>Player</strong> vede soltanto, <strong>Back office</strong> aggiorna le partite, <strong>Admin</strong> gestisce tutto.
        </p>
      </div>

      {error && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 12,
          background: 'rgba(220,50,50,0.12)', border: '1px solid var(--neg)', color: 'var(--neg)',
          fontSize: 14,
        }}>{error}</div>
      )}

      <Panel style={{ padding: 8 }}>
        <PanelTitle>Utenti</PanelTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
          {users.map((u) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 14px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--line)',
            }}>
              <Avatar player={u} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.name}{u.id === me.id && <span className="mono" style={{ color: 'var(--dim)', fontWeight: 400 }}> · tu</span>}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--dim)' }}>{ROLE_LABELS[u.role]}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {ROLE_ORDER.map((role) => {
                  const active = u.role === role;
                  return (
                    <button
                      key={role}
                      onClick={() => changeRole(u, role)}
                      disabled={savingId === u.id || active}
                      className="trans press-95"
                      style={{
                        padding: '7px 13px', borderRadius: 9, cursor: active ? 'default' : 'pointer',
                        fontSize: 13, fontWeight: 700,
                        background: active ? 'var(--accent)' : 'transparent',
                        color: active ? 'var(--accent-ink)' : 'var(--muted)',
                        border: active ? '1px solid var(--accent)' : '1px solid var(--line)',
                        opacity: savingId === u.id && !active ? 0.5 : 1,
                      }}
                    >
                      {ROLE_LABELS[role]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
