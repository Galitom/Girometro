import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Delta from '../components/ui/Delta';
import Panel from '../components/ui/Panel';
import { getPlayers } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';

const MEDALS = ['#d8a23a', '#b8bcc4', '#bd7a44'];

// Calendar-period filter for the Δ column (all solar/local-time windows).
const PERIODS = [
  { key: 'today', label: 'Oggi', col: 'Δ OGGI' },
  { key: 'yesterday', label: 'Ieri', col: 'Δ IERI' },
  { key: 'week', label: 'Questa settimana', col: 'Δ SETT' },
  { key: 'month', label: 'Questo mese', col: 'Δ MESE' },
];

export default function Classifica() {
  const { matchVersion, onPlayerClick } = useOutletContext();
  const { me } = useAuth();
  const isMobile = useIsMobile();
  const [players, setPlayers] = useState([]);
  const [period, setPeriod] = useState('week');
  const deltaCol = PERIODS.find(p => p.key === period).col;

  // Reload the ranking whenever a match is recorded or the period changes.
  useEffect(() => {
    getPlayers(period).then(setPlayers);
  }, [matchVersion, period]);

  if (!players.length || !me) return null;

  const podium = players.slice(0, 3);
  // Visual podium order (2nd, 1st, 3rd); drop missing slots when fewer than 3 players.
  const display = [podium[1], podium[0], podium[2]].filter(Boolean);
  const heights = { 0: 120, 1: 160, 2: 96 };

  return (
    <div className="screen-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
            {players.length} giocatori
          </div>
          <h1 className="disp disp-tight" style={{ fontSize: 'clamp(34px, 9vw, 52px)', fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Classifica</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
          {PERIODS.map(({ key, label }) => {
            const active = key === period;
            return (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className="mono press-97"
                style={{
                  fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '7px 12px', borderRadius: 9, cursor: 'pointer',
                  border: '1px solid ' + (active ? 'rgba(255,90,31,0.3)' : 'transparent'),
                  background: active ? 'rgba(255,90,31,0.12)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.6fr', gap: 24, alignItems: 'start' }}>
        {/* Podium */}
        <Panel style={{ padding: isMobile ? 20 : 28 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 24, textAlign: 'center' }}>Podio</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
            {display.map((p, i) => {
              const place = players.findIndex(x => x.id === p.id) + 1;
              const isMine = p.id === me.id;
              return (
                <div key={p.id} onClick={() => onPlayerClick(p.id)} className="press-97" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer' }}>
                  <Avatar player={p} size={place === 1 ? 60 : 48} ring={isMine} accent={isMine} />
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, textAlign: 'center' }}>{isMine ? 'Tu' : p.name.split(' ')[0]}</div>
                  <div className="disp" style={{ fontSize: 18, color: 'var(--accent)', lineHeight: 1 }}>{p.elo}</div>
                  <div style={{
                    width: '100%', marginTop: 10, height: heights[i],
                    borderRadius: '12px 12px 0 0',
                    background: place === 1
                      ? 'linear-gradient(180deg, rgba(255,90,31,0.22), rgba(255,90,31,0.03))'
                      : 'var(--surface-2)',
                    border: '1px solid var(--line)', borderBottom: 'none',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 12,
                  }}>
                    <span className="disp" style={{ fontSize: 40, fontWeight: 700, color: MEDALS[place - 1] }}>{place}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Full table */}
        <Panel style={{ padding: isMobile ? 6 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16, padding: isMobile ? '10px 12px' : '10px 18px' }}>
            {[['#', 26], ['GIOCATORE', null], ['V–S', 90, true], ['ELO', 56], [deltaCol, 56]].map(([l, w, hideMobile]) => (
              (hideMobile && isMobile) ? null : (
                <span key={l} className="mono" style={{ fontSize: 10, color: 'var(--dim)', width: w || undefined, flex: w ? undefined : 1, letterSpacing: '0.1em', textAlign: w && l !== 'GIOCATORE' ? 'right' : 'left' }}>{l}</span>
              )
            ))}
          </div>
          {players.map((p, i) => {
            const isMine = p.id === me.id;
            return (
              <div key={p.id} onClick={() => onPlayerClick(p.id)} className={isMine ? '' : 'card-hover'} style={{
                display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16, padding: isMobile ? '12px' : '12px 18px', borderRadius: 12,
                background: isMine ? 'rgba(255,90,31,0.08)' : 'transparent',
                border: isMine ? '1px solid rgba(255,90,31,0.3)' : '1px solid transparent',
                cursor: 'pointer',
              }}>
                <span className="disp" style={{ fontSize: 26, fontWeight: 700, width: 26, color: i < 3 ? MEDALS[i] : 'var(--dim)' }}>{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <Avatar player={p} size={40} accent={isMine} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isMine ? 'Tu' : p.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>striscia {p.streak > 0 ? `${p.streak}W` : `${Math.abs(p.streak)}L`}</div>
                  </div>
                </div>
                {!isMobile && <span className="mono" style={{ fontSize: 12.5, color: 'var(--muted)', width: 90 }}>{p.w}–{p.l}</span>}
                <span className="disp" style={{ fontSize: 28, fontWeight: 700, width: 56, textAlign: 'right' }}>{p.elo}</span>
                <span style={{ width: 56, display: 'flex', justifyContent: 'flex-end' }}><Delta value={p.delta} /></span>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}
