import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Swords } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Panel from '../components/ui/Panel';
import { getMatches } from '../api/client';

function TeamCell({ players, align }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0,
      flexDirection: align === 'right' ? 'row-reverse' : 'row',
    }}>
      <div style={{ display: 'flex', flexDirection: align === 'right' ? 'row-reverse' : 'row', marginLeft: align === 'right' ? 0 : -4 }}>
        {players.map((p, i) => (
          <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: players.length - i }}>
            <Avatar player={p} size={34} />
          </div>
        ))}
      </div>
      <div style={{
        minWidth: 0, textAlign: align === 'right' ? 'right' : 'left',
        fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {players.map((p) => p.name.split(' ')[0]).join(' & ')}
      </div>
    </div>
  );
}

export default function Partite() {
  const { matchVersion } = useOutletContext();
  const [matches, setMatches] = useState(null);

  // Reload the match list whenever a match is recorded.
  useEffect(() => {
    getMatches().then(setMatches).catch(() => setMatches([]));
  }, [matchVersion]);

  if (!matches) return null;

  return (
    <div className="screen-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
            {matches.length} {matches.length === 1 ? 'partita' : 'partite'}
          </div>
          <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Partite</h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>Lo storico completo di tutte le sfide.</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <Panel style={{ padding: 48, textAlign: 'center' }}>
          <Swords size={40} style={{ color: 'var(--dim)', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 700 }}>Ancora nessuna partita</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>Le partite registrate compariranno qui.</div>
        </Panel>
      ) : (
        <Panel style={{ padding: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {matches.map((m) => {
              const aWon = m.scoreA > m.scoreB;
              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 12,
                  background: m.mine ? 'rgba(255,90,31,0.06)' : 'transparent',
                  border: m.mine ? '1px solid rgba(255,90,31,0.22)' : '1px solid transparent',
                }}>
                  {/* mode + quando */}
                  <div style={{ width: 88, flexShrink: 0 }}>
                    <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{m.mode}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{m.when}</div>
                  </div>

                  {/* squadra A */}
                  <TeamCell players={m.teamA} align="right" />

                  {/* punteggio */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className="disp" style={{ fontSize: 28, fontWeight: 700, color: aWon ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreA}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>–</span>
                    <span className="disp" style={{ fontSize: 28, fontWeight: 700, color: !aWon ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreB}</span>
                  </div>

                  {/* squadra B */}
                  <TeamCell players={m.teamB} align="left" />

                  {/* delta elo */}
                  <div className="mono" style={{ width: 64, flexShrink: 0, textAlign: 'right', fontSize: 12.5, color: 'var(--muted)' }}>
                    ±{m.elo}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
