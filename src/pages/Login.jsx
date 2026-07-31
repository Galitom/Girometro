import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isRegister) {
        await register({ username, password, name });
      } else {
        await login(username, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(humanError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--bg-2)',
    }}>
      <div className="rise" style={{
        width: 420, maxWidth: '100%',
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 10, padding: 40,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <div className="glow-accent" style={{
            width: 40, height: 40, background: 'var(--accent)',
            clipPath: 'polygon(28% 0, 72% 0, 100% 50%, 72% 100%, 28% 100%, 0 50%)',
            display: 'grid', placeItems: 'center',
          }}>
            <div style={{ width: 15, height: 15, background: 'var(--accent-ink)', transform: 'rotate(45deg)', borderRadius: 2 }} />
          </div>
          <div className="disp disp-tight" style={{ fontSize: 27, lineHeight: 0.85, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            Giro<span style={{ color: 'var(--accent)' }}>metro</span>
          </div>
        </div>

        <h1 className="disp disp-tight glitch-title" style={{ fontSize: 38, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px' }}>
          {isRegister ? 'Crea account' : 'Accedi'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 26 }}>
          {isRegister ? 'Registrati per entrare nell’arena.' : 'Bentornato nell’arena.'}
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <Field label="Nome visualizzato" value={name} onChange={setName}
                   placeholder="Es. Teo Marchetti" />
          )}
          <Field label="Username" value={username} onChange={setUsername}
                 placeholder="username" autoComplete="username" required />
          <Field label="Password" value={password} onChange={setPassword}
                 placeholder="••••••" type="password"
                 autoComplete={isRegister ? 'new-password' : 'current-password'} required />

          {error && (
            <div className="mono" style={{
              fontSize: 12, color: 'var(--neg)', background: 'rgba(255,90,110,0.1)',
              border: '1px solid rgba(255,90,110,0.3)', borderRadius: 6, padding: '10px 12px',
            }}>{error}</div>
          )}

          <button type="submit" disabled={busy} className="glow-accent trans press-95 disp" style={{
            height: 54, borderRadius: 8, border: 'none', marginTop: 6,
            background: busy ? 'var(--surface-2)' : 'var(--accent)',
            color: busy ? 'var(--dim)' : 'var(--accent-ink)',
            fontSize: 22, textTransform: 'uppercase', letterSpacing: '0.05em',
            cursor: busy ? 'wait' : 'pointer',
          }}>
            {busy ? 'Attendi…' : (isRegister ? 'Registrati' : 'Accedi')}
          </button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
          {isRegister ? 'Hai già un account?' : 'Non hai un account?'}{' '}
          <button onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(null); }} style={{
            background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
            fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
          }}>
            {isRegister ? 'Accedi' : 'Registrati'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type, ...rest }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  // Per i campi password mostriamo un "occhiolino" che alterna testo in chiaro/nascosto.
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--dim)', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={inputType}
          {...rest}
          style={{
            width: '100%', height: 48, background: 'var(--surface-2)', border: '1px solid var(--line)',
            borderRadius: 6, color: 'var(--txt)', padding: isPassword ? '0 46px 0 14px' : '0 14px',
            fontSize: 15, fontFamily: 'inherit', outline: 'none',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            title={show ? 'Nascondi password' : 'Mostra password'}
            aria-label={show ? 'Nascondi password' : 'Mostra password'}
            className="trans press-90"
            style={{
              position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)',
              width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent',
              color: show ? 'var(--accent)' : 'var(--dim)', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

function humanError(err) {
  const d = err?.data;
  if (!d) return 'Qualcosa è andato storto. Riprova.';
  if (typeof d.detail === 'string') return d.detail;
  // DRF field errors: { field: [msg, ...] }
  const first = Object.values(d)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === 'string') return first;
  return 'Credenziali non valide.';
}
