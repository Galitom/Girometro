import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Pencil, Trash2, X, Check } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Chip from '../components/ui/Chip';
import Panel from '../components/ui/Panel';
import {
  getAdminMatches, updateAdminMatch, deleteAdminMatch, getPlayers,
} from '../api/client';

const TEAM_SIZE = { '1vs1': 1, '2vs2': 2 };

function PlayerSelect({ value, onChange, players }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="disp"
      style={{
        appearance: 'none', background: 'var(--surface-2)', border: '1px solid var(--line)',
        borderRadius: 10, color: 'var(--txt)', padding: '8px 12px',
        fontSize: 15, fontWeight: 600, cursor: 'pointer', minWidth: 120,
      }}
    >
      <option value="" disabled>Scegli…</option>
      {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}

function ScoreInput({ value, onChange }) {
  return (
    <input
      type="number" min={0} max={10} value={value}
      onChange={(e) => onChange(Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
      className="disp"
      style={{
        width: 64, textAlign: 'center', background: 'var(--surface-2)',
        border: '1px solid var(--line)', borderRadius: 10, color: 'var(--txt)',
        padding: '8px 6px', fontSize: 24, fontWeight: 700, fontFamily: 'inherit',
      }}
    />
  );
}

// Editor inline per una singola partita.
function MatchEditor({ match, players, onSaved, onCancel, onDeleted }) {
  const [mode, setMode] = useState(match.mode);
  const [teamA, setTeamA] = useState(match.teamAIds);
  const [teamB, setTeamB] = useState(match.teamBIds);
  const [sa, setSa] = useState(match.scoreA);
  const [sb, setSb] = useState(match.scoreB);
  const [playedAt, setPlayedAt] = useState(match.playedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const slots = TEAM_SIZE[mode];
  const today = new Date().toISOString().slice(0, 10);

  // Adatta la lunghezza dei team quando cambia la modalità.
  function setTeamSlot(setter, team, idx, id) {
    const next = [...team];
    next[idx] = id;
    setter(next);
  }
  const a = teamA.slice(0, slots);
  const b = teamB.slice(0, slots);

  const overlap = a.some((x) => x && b.includes(x));
  const filled = a.length === slots && a.every(Boolean) && b.length === slots && b.every(Boolean);
  const valid = filled && !overlap && sa !== sb && Math.max(sa, sb) === 10;

  async function save() {
    setBusy(true); setError('');
    try {
      await updateAdminMatch(match.id, { mode, teamA: a, teamB: b, scoreA: sa, scoreB: sb, playedAt });
      onSaved();
    } catch (e) {
      setError(e?.data?.detail || (Array.isArray(e?.data) ? e.data[0] : '') || 'Salvataggio non riuscito.');
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Eliminare definitivamente questa partita? L\'Elo verrà ricalcolato.')) return;
    setBusy(true); setError('');
    try {
      await deleteAdminMatch(match.id);
      onDeleted();
    } catch (e) {
      setError(e?.data?.detail || 'Eliminazione non riuscita.');
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16, background: 'var(--bg-2)', border: '1px solid var(--accent)', borderRadius: 14 }}>
      {/* Mode + data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 3 }}>
          {['1vs1', '2vs2'].map((mm) => (
            <button key={mm} onClick={() => setMode(mm)} className="disp" style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: mode === mm ? 'var(--accent)' : 'transparent',
              color: mode === mm ? 'var(--accent-ink)' : 'var(--muted)',
              fontSize: 15, fontWeight: 700, textTransform: 'uppercase',
            }}>{mm}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} style={{ color: 'var(--dim)' }} />
          <input
            type="date" value={playedAt} max={today}
            onChange={(e) => setPlayedAt(e.target.value || today)}
            className="disp"
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10,
              color: 'var(--txt)', padding: '8px 12px', fontSize: 15, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', colorScheme: 'dark',
            }}
          />
        </div>
      </div>

      {/* Team + punteggio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Chip tone="accent">Squadra A</Chip>
          {Array.from({ length: slots }).map((_, i) => (
            <PlayerSelect key={i} value={a[i]} players={players} onChange={(id) => setTeamSlot(setTeamA, teamA, i, id)} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ScoreInput value={sa} onChange={setSa} />
          <span className="disp" style={{ fontSize: 26, color: 'var(--dim)', fontWeight: 700 }}>–</span>
          <ScoreInput value={sb} onChange={setSb} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Chip>Squadra B</Chip>
          {Array.from({ length: slots }).map((_, i) => (
            <PlayerSelect key={i} value={b[i]} players={players} onChange={(id) => setTeamSlot(setTeamB, teamB, i, id)} />
          ))}
        </div>
      </div>

      {error && <div style={{ color: 'var(--neg)', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button disabled={!valid || busy} onClick={save} className="trans press-95 disp" style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none',
          cursor: valid && !busy ? 'pointer' : 'not-allowed',
          background: valid && !busy ? 'var(--accent)' : 'var(--surface-2)',
          color: valid && !busy ? 'var(--accent-ink)' : 'var(--dim)',
          fontSize: 15, fontWeight: 700, textTransform: 'uppercase',
        }}><Check size={16} /> Salva</button>
        <button disabled={busy} onClick={onCancel} className="trans press-95" style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10,
          border: '1px solid var(--line)', background: 'transparent', color: 'var(--muted)',
          cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}><X size={16} /> Annulla</button>
        <button disabled={busy} onClick={remove} className="trans press-95" style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10,
          border: '1px solid var(--neg)', background: 'transparent', color: 'var(--neg)',
          cursor: 'pointer', fontSize: 14, fontWeight: 600, marginLeft: 'auto',
        }}><Trash2 size={16} /> Elimina</button>
      </div>
    </div>
  );
}

function TeamNames({ players }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <div style={{ display: 'flex' }}>
        {players.map((p, i) => (
          <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: players.length - i }}>
            <Avatar player={p} size={30} />
          </div>
        ))}
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {players.map((p) => p.name.split(' ')[0]).join(' & ')}
      </span>
    </div>
  );
}

export default function GestionePartite() {
  const { onMatchChanged } = useOutletContext();
  const [date, setDate] = useState('');
  const [matches, setMatches] = useState(null);
  const [players, setPlayers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);  // bump per ricaricare dopo un salva/elimina

  // (Ri)carica le partite quando cambia il filtro giorno o dopo una modifica.
  // La lista precedente resta visibile durante il refetch (niente flash a vuoto).
  useEffect(() => {
    let cancelled = false;
    getAdminMatches(date || undefined)
      .then((data) => { if (!cancelled) setMatches(data); })
      .catch(() => { if (!cancelled) setMatches([]); });
    return () => { cancelled = true; };
  }, [date, reloadKey]);

  useEffect(() => { getPlayers().then(setPlayers).catch(() => setPlayers([])); }, []);

  function afterChange() {
    setEditingId(null);
    setReloadKey((k) => k + 1);
    // La modifica/eliminazione ricalcola l'Elo server-side: aggiorna me (Sidebar)
    // e segnala alle altre pagine di rinfrescarsi al prossimo mount.
    onMatchChanged();
  }

  return (
    <div className="screen-in">
      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Amministrazione</div>
        <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Gestione Partite</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>Cerca le partite per giorno e modifica risultato, data e giocatori.</p>
      </div>

      {/* Filtro per giorno */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Calendar size={16} style={{ color: 'var(--dim)' }} />
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--dim)', textTransform: 'uppercase' }}>Giorno</span>
        <input
          type="date" value={date} max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="disp"
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12,
            color: 'var(--txt)', padding: '10px 16px', fontSize: 16, fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer', colorScheme: 'dark',
          }}
        />
        {date && (
          <button onClick={() => setDate('')} className="trans press-95" style={{
            padding: '8px 14px', borderRadius: 10, border: '1px solid var(--line)',
            background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
          }}>Tutte</button>
        )}
      </div>

      {!matches ? null : matches.length === 0 ? (
        <Panel style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          {date ? 'Nessuna partita in questo giorno.' : 'Ancora nessuna partita.'}
        </Panel>
      ) : (
        <Panel style={{ padding: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {matches.map((m) => (
              editingId === m.id ? (
                <MatchEditor
                  key={m.id} match={m} players={players}
                  onSaved={afterChange} onDeleted={afterChange}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px', borderRadius: 12,
                  background: 'transparent', border: '1px solid transparent',
                }} className="card-hover">
                  <div style={{ width: 96, flexShrink: 0 }}>
                    <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{m.mode}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{m.playedAt}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}><TeamNames players={m.teamA} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span className="disp" style={{ fontSize: 26, fontWeight: 700, color: m.scoreA > m.scoreB ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreA}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>–</span>
                    <span className="disp" style={{ fontSize: 26, fontWeight: 700, color: m.scoreB > m.scoreA ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreB}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}><TeamNames players={m.teamB} /></div>
                  <button onClick={() => setEditingId(m.id)} title="Modifica" className="trans press-90" style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: 10,
                    background: 'var(--surface-2)', border: '1px solid var(--line)',
                    color: 'var(--muted)', cursor: 'pointer', display: 'grid', placeItems: 'center',
                  }}><Pencil size={16} /></button>
                </div>
              )
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
