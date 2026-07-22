import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Chip from '../components/ui/Chip';
import Delta from '../components/ui/Delta';
import Panel from '../components/ui/Panel';
import { getPlayers } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const MEDALS = ['#d8a23a', '#b8bcc4', '#bd7a44'];

export default function Classifica() {
  const { matchVersion } = useOutletContext();
  const { me } = useAuth();
  const [players, setPlayers] = useState([]);

  // Reload the ranking whenever a match is recorded, so Elo updates live.
  useEffect(() => {
    getPlayers().then(setPlayers);
  }, [matchVersion]);

  if (!players.length || !me) return null;

  const podium = players.slice(0, 3);
  // Visual podium order (2nd, 1st, 3rd); drop missing slots when fewer than 3 players.
  const display = [podium[1], podium[0], podium[2]].filter(Boolean);
  const heights = { 0: 120, 1: 160, 2: 96 };

  return (
    <div className="screen-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
            {players.length} giocatori
          </div>
          <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Classifica</h1>
        </div>
        <Chip tone="accent" style={{ fontSize: 12, padding: '6px 12px' }}>
          <Calendar size={13} /> Questa settimana
        </Chip>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24, alignItems: 'start' }}>
        {/* Podium */}
        <Panel style={{ padding: 28 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 24, textAlign: 'center' }}>Podio</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
            {display.map((p, i) => {
              const place = players.findIndex(x => x.id === p.id) + 1;
              const isMine = p.id === me.id;
              return (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
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
        <Panel style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 18px' }}>
            {[['#', 30], ['GIOCATORE', null], ['V–S', 90], ['ELO', 60], ['Δ SETT', 60]].map(([l, w]) => (
              <span key={l} className="mono" style={{ fontSize: 10, color: 'var(--dim)', width: w || undefined, flex: w ? undefined : 1, letterSpacing: '0.1em', textAlign: w && l !== 'GIOCATORE' ? 'right' : 'left' }}>{l}</span>
            ))}
          </div>
          {players.map((p, i) => {
            const isMine = p.id === me.id;
            return (
              <div key={p.id} className={isMine ? '' : 'card-hover'} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px', borderRadius: 12,
                background: isMine ? 'rgba(255,90,31,0.08)' : 'transparent',
                border: isMine ? '1px solid rgba(255,90,31,0.3)' : '1px solid transparent',
              }}>
                <span className="disp" style={{ fontSize: 26, fontWeight: 700, width: 30, color: i < 3 ? MEDALS[i] : 'var(--dim)' }}>{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <Avatar player={p} size={40} accent={isMine} />
                  <div>
                    <div style={{ fontSize: 15.5, fontWeight: 700 }}>{isMine ? 'Tu' : p.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>striscia {p.streak > 0 ? `${p.streak}W` : `${Math.abs(p.streak)}L`}</div>
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 12.5, color: 'var(--muted)', width: 90 }}>{p.w}–{p.l}</span>
                <span className="disp" style={{ fontSize: 28, fontWeight: 700, width: 60, textAlign: 'right' }}>{p.elo}</span>
                <span style={{ width: 60, display: 'flex', justifyContent: 'flex-end' }}><Delta value={p.delta} /></span>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}
