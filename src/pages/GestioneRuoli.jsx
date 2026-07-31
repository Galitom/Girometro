import { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Panel, { PanelTitle } from '../components/ui/Panel';
import { getManagedUsers, setUserRole, setUserPassword } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { ROLES, ROLE_LABELS } from '../auth/roles';

const ROLE_ORDER = [ROLES.PLAYER, ROLES.BACKOFFICE, ROLES.ADMIN];

export default function GestioneRuoli() {
  const { me, refreshMe } = useAuth();
  const [users, setUsers] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [pwOpenId, setPwOpenId] = useState(null);   // id utente con l'editor password aperto

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
        <h1 className="disp disp-tight glitch-title" style={{ fontSize: 'clamp(32px, 8.5vw, 52px)', fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>Gestione Ruoli</h1>
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
              padding: '12px 14px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <Avatar player={u} size={40} />
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.name}{u.id === me.id && <span className="mono" style={{ color: 'var(--dim)', fontWeight: 400 }}> · tu</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--dim)' }}>{ROLE_LABELS[u.role]}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
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
                  <button
                    onClick={() => { setPwOpenId((id) => (id === u.id ? null : u.id)); setError(''); }}
                    className="trans press-95"
                    title="Reimposta password"
                    style={{
                      display: 'grid', placeItems: 'center', width: 34, height: 34,
                      borderRadius: 9, cursor: 'pointer',
                      background: pwOpenId === u.id ? 'var(--accent)' : 'transparent',
                      color: pwOpenId === u.id ? 'var(--accent-ink)' : 'var(--muted)',
                      border: pwOpenId === u.id ? '1px solid var(--accent)' : '1px solid var(--line)',
                    }}
                  >
                    <KeyRound size={16} />
                  </button>
                </div>
              </div>
              {pwOpenId === u.id && (
                <PasswordEditor
                  user={u}
                  onCancel={() => setPwOpenId(null)}
                  onDone={() => setPwOpenId(null)}
                  onError={setError}
                />
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// Editor inline per reimpostare la password di un utente (solo admin).
function PasswordEditor({ user, onCancel, onDone, onError }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const canSave = pw.length >= 8 && pw === confirm && !busy;

  async function save(e) {
    e.preventDefault();
    if (!canSave) return;
    setBusy(true);
    onError('');
    try {
      await setUserPassword(user.id, pw);
      setOk(true);
      setPw(''); setConfirm('');
      setTimeout(onDone, 1200);
    } catch (err) {
      onError(err?.data?.detail || 'Impossibile reimpostare la password.');
    } finally {
      setBusy(false);
    }
  }

  const mismatch = confirm.length > 0 && pw !== confirm;

  return (
    <form onSubmit={save} style={{
      marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10,
    }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 160 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--dim)', textTransform: 'uppercase' }}>Nuova password</span>
        <input
          type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          placeholder="min. 8 caratteri" autoComplete="new-password"
          style={pwInputStyle}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 160 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--dim)', textTransform: 'uppercase' }}>Conferma</span>
        <input
          type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="ripeti password" autoComplete="new-password"
          style={{ ...pwInputStyle, borderColor: mismatch ? 'var(--neg)' : 'var(--line)' }}
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={onCancel} className="trans press-95" style={{
          padding: '0 16px', height: 42, borderRadius: 10, cursor: 'pointer',
          fontSize: 13, fontWeight: 700, background: 'transparent',
          color: 'var(--muted)', border: '1px solid var(--line)',
        }}>Annulla</button>
        <button type="submit" disabled={!canSave} className="trans press-95" style={{
          padding: '0 16px', height: 42, borderRadius: 10, cursor: canSave ? 'pointer' : 'default',
          fontSize: 13, fontWeight: 700,
          background: ok ? 'var(--pos)' : (canSave ? 'var(--accent)' : 'var(--surface-2)'),
          color: canSave || ok ? 'var(--accent-ink)' : 'var(--dim)',
          border: 'none', whiteSpace: 'nowrap',
        }}>
          {ok ? 'Fatto ✓' : (busy ? 'Attendi…' : 'Reimposta')}
        </button>
      </div>
    </form>
  );
}

const pwInputStyle = {
  height: 42, background: 'var(--surface-2)', border: '1px solid var(--line)',
  borderRadius: 10, color: 'var(--txt)', padding: '0 12px',
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
};
