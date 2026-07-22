import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trophy, Frown, Calendar } from 'lucide-react';
import Chip from '../components/ui/Chip';
import Delta from '../components/ui/Delta';
import { submitMatch, getMe, getPlayers } from '../api/client';

// Today as a local YYYY-MM-DD string (not UTC, so it matches the user's day).
function todayLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function Stepper({ score, set, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <button onClick={() => set(s => Math.min(10, s + 1))} className="trans press-90" style={{
        width: 64, height: 52, borderRadius: 14, cursor: 'pointer', border: 'none',
        background: accent ? 'var(--accent)' : 'var(--surface-2)',
        color: accent ? 'var(--accent-ink)' : 'var(--txt)',
        display: 'grid', placeItems: 'center',
      }}><Plus size={28} strokeWidth={2.6} /></button>
      <span className="disp" style={{ fontSize: 96, fontWeight: 700, lineHeight: 0.8, color: accent ? 'var(--accent)' : 'var(--txt)', minWidth: 70, textAlign: 'center' }}>{score}</span>
      <button onClick={() => set(s => Math.max(0, s - 1))} className="trans press-90" style={{
        width: 64, height: 52, borderRadius: 14, cursor: 'pointer',
        border: '1px solid var(--line)', background: 'transparent', color: 'var(--muted)',
        display: 'grid', placeItems: 'center',
      }}><Minus size={28} strokeWidth={2.6} /></button>
    </div>
  );
}

function PlayerSelect({ idx, players, set, allPlayers, me }) {
  return (
    <select
      value={players[idx]?.id || ''}
      onChange={e => {
        const np = allPlayers.find(x => x.id === e.target.value);
        set(prev => { const n = [...prev]; n[idx] = np; return n; });
      }}
      className="disp"
      style={{
        appearance: 'none', background: 'var(--surface-2)', border: '1px solid var(--line)',
        borderRadius: 12, color: 'var(--txt)', padding: '12px 16px',
        fontSize: 18, fontWeight: 600, cursor: 'pointer', textAlign: 'center', minWidth: 130,
      }}
    >
      <option value="" disabled>Scegli…</option>
      {allPlayers.map(pl => <option key={pl.id} value={pl.id}>{pl.id === me?.id ? 'Tu' : pl.name}</option>)}
    </select>
  );
}

export default function RegistraModal({ onClose }) {
  // true once a match has been recorded, so the parent knows to refresh.
  const [saved, setSaved] = useState(false);
  const close = () => onClose(saved);
  const [allPlayers, setAllPlayers] = useState(null);
  const [me, setMe] = useState(null);
  const [mode, setMode] = useState('1vs1');
  const [teamA, setTeamA] = useState([null, null]);
  const [teamB, setTeamB] = useState([null, null]);
  const [sa, setSa] = useState(0);
  const [sb, setSb] = useState(0);
  const [playedAt, setPlayedAt] = useState(todayLocal());
  const [result, setResult] = useState(null);

  const today = todayLocal();

  // Load players once, then seed the default matchup (me vs. the third player).
  useEffect(() => {
    Promise.all([getMe(), getPlayers()]).then(([m, players]) => {
      setMe(m);
      setAllPlayers(players);
      setTeamA([m, null]);
      setTeamB([players.find(p => p.id !== m.id) ?? null, null]);
    });
  }, []);

  const slots = mode === '1vs1' ? 1 : 2;
  const valid = allPlayers && teamA.slice(0, slots).every(Boolean) && teamB.slice(0, slots).every(Boolean) && (sa === 10 || sb === 10) && sa !== sb;

  const confirm = async () => {
    const res = await submitMatch({
      mode, teamA: teamA.slice(0, slots), teamB: teamB.slice(0, slots), scoreA: sa, scoreB: sb,
      // Only send a date when backdating; today keeps the live timestamp.
      playedAt: playedAt !== today ? playedAt : undefined,
    });
    setResult({ won: sa > sb, eloChange: res.eloChange });
    setSaved(true);
  };

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(3,3,4,0.82)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} className="rise" style={{
        width: 720, maxWidth: '100%',
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 24, padding: 36, position: 'relative',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {!result ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 className="disp disp-tight" style={{ fontSize: 40, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Registra Partita</h2>
              <button onClick={close} style={{
                width: 40, height: 40, borderRadius: 12, background: 'var(--surface-2)',
                border: '1px solid var(--line)', color: 'var(--muted)', cursor: 'pointer',
                display: 'grid', placeItems: 'center',
              }}><X size={22} /></button>
            </div>

            {/* Mode toggle */}
            <div style={{
              display: 'flex', background: 'var(--bg-2)', border: '1px solid var(--line)',
              borderRadius: 13, padding: 4, marginBottom: 28, width: 240,
            }}>
              {['1vs1', '2vs2'].map(mm => (
                <button key={mm} onClick={() => setMode(mm)} className="disp" style={{
                  flex: 1, height: 42, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: mode === mm ? 'var(--accent)' : 'transparent',
                  color: mode === mm ? 'var(--accent-ink)' : 'var(--muted)',
                  fontSize: 20, fontWeight: 700, textTransform: 'uppercase',
                  transition: 'background 0.18s, color 0.18s',
                }}>{mm}</button>
              ))}
            </div>

            {/* Player selects */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 12 }}>
                <Chip tone="accent">Squadra A</Chip>
                {Array.from({ length: slots }).map((_, i) => (
                  <PlayerSelect key={i} idx={i} players={teamA} set={setTeamA} allPlayers={allPlayers || []} me={me} />
                ))}
              </div>
              <div className="disp" style={{ fontSize: 34, color: 'var(--dim)', fontWeight: 700, padding: '0 16px', marginTop: 30 }}>VS</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 12 }}>
                <Chip>Squadra B</Chip>
                {Array.from({ length: slots }).map((_, i) => (
                  <PlayerSelect key={i} idx={i} players={teamB} set={setTeamB} allPlayers={allPlayers || []} me={me} />
                ))}
              </div>
            </div>

            {/* Date — defaults to today; change it to log an older match. */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              <Calendar size={16} style={{ color: 'var(--dim)', flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--dim)', textTransform: 'uppercase' }}>Data</span>
              <input
                type="date"
                value={playedAt}
                max={today}
                onChange={e => setPlayedAt(e.target.value || today)}
                className="disp"
                style={{
                  background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12,
                  color: 'var(--txt)', padding: '10px 16px', fontSize: 17, fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer', colorScheme: 'dark',
                }}
              />
            </div>

            {/* Score */}
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>Punteggio finale · primo a 10</div>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 18, padding: '24px 16px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                <Stepper score={sa} set={setSa} accent />
                <span className="disp" style={{ fontSize: 40, color: 'var(--dim)', fontWeight: 700 }}>–</span>
                <Stepper score={sb} set={setSb} />
              </div>
            </div>

            <button disabled={!valid} onClick={confirm} className={valid ? 'glow-accent trans press-95 disp' : 'disp'} style={{
              width: '100%', height: 60, borderRadius: 15, border: 'none',
              cursor: valid ? 'pointer' : 'not-allowed',
              background: valid ? 'var(--accent)' : 'var(--surface-2)',
              color: valid ? 'var(--accent-ink)' : 'var(--dim)',
              fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
            }}>{valid ? 'Conferma risultato' : 'Completa la partita'}</button>
          </>
        ) : (
          <div className="rise" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 110, height: 110, borderRadius: '50%', margin: '0 auto 22px',
              display: 'grid', placeItems: 'center',
              background: result.won ? 'rgba(255,90,31,0.14)' : 'rgba(255,255,255,0.05)',
              border: `2px solid ${result.won ? 'var(--accent)' : 'var(--line)'}`,
            }}>
              {result.won
                ? <Trophy size={54} style={{ color: 'var(--accent)' }} />
                : <Frown size={54} style={{ color: 'var(--muted)' }} />
              }
            </div>
            <h1 className="disp txt-glow" style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.85, margin: 0, textTransform: 'uppercase', color: result.won ? 'var(--accent)' : 'var(--txt)' }}>
              {result.won ? 'Vittoria!' : 'Sconfitta'}
            </h1>
            <div className="disp" style={{ fontSize: 90, fontWeight: 700, lineHeight: 0.9, marginTop: 10 }}>
              {sa}<span style={{ color: 'var(--dim)' }}>–</span>{sb}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
              <span style={{ color: 'var(--muted)', fontSize: 15 }}>Elo</span>
              <Delta value={result.eloChange} />
            </div>
            <button onClick={close} className="glow-accent trans press-95 disp" style={{
              marginTop: 32, padding: '16px 52px', borderRadius: 15, border: 'none',
              cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-ink)',
              fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
            }}>Fatto</button>
          </div>
        )}
      </div>
    </div>
  );
}
