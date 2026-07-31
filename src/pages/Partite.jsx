import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Swords } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Panel from '../components/ui/Panel';
import { getMatches } from '../api/client';
import { useIsMobile } from '../hooks/useMediaQuery';

function TeamCell({ players, align, onPlayerClick, compact }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 6 : 10, flex: 1, minWidth: 0,
      flexDirection: align === 'right' ? 'row-reverse' : 'row',
    }}>
      <div style={{ display: 'flex', flexDirection: align === 'right' ? 'row-reverse' : 'row', marginLeft: align === 'right' ? 0 : -4 }}>
        {players.map((p, i) => (
          <div key={p.id} onClick={() => onPlayerClick(p.id)} className="press-97" style={{ marginLeft: i === 0 ? 0 : -8, zIndex: players.length - i, cursor: 'pointer' }}>
            <Avatar player={p} size={compact ? 28 : 34} />
          </div>
        ))}
      </div>
      <div style={{
        minWidth: 0, textAlign: align === 'right' ? 'right' : 'left',
        fontSize: compact ? 13 : 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {players.map((p, i) => (
          <span key={p.id}>
            {i > 0 && <span style={{ fontWeight: 400, color: 'var(--dim)' }}> &amp; </span>}
            <span onClick={() => onPlayerClick(p.id)} style={{ cursor: 'pointer' }}>{p.name.split(' ')[0]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Partite() {
  const { matchVersion, onPlayerClick } = useOutletContext();
  const isMobile = useIsMobile();
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
          <h1 className="disp disp-tight glitch-title" style={{ fontSize: 'clamp(34px, 9vw, 52px)', fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>Partite</h1>
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

              if (isMobile) {
                return (
                  <div key={m.id} style={{
                    display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 12px', borderRadius: 12,
                    background: m.mine ? 'rgba(var(--accent-rgb),0.06)' : 'transparent',
                    border: m.mine ? '1px solid rgba(var(--accent-rgb),0.22)' : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="mono" style={{ fontSize: 10.5 }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{m.mode}</span>
                        <span style={{ color: 'var(--dim)' }}> · {m.when}</span>
                      </div>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>±{m.elo}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <TeamCell players={m.teamA} align="right" onPlayerClick={onPlayerClick} compact />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span className="disp" style={{ fontSize: 26, fontWeight: 700, color: aWon ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreA}</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--dim)' }}>–</span>
                        <span className="disp" style={{ fontSize: 26, fontWeight: 700, color: !aWon ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreB}</span>
                      </div>
                      <TeamCell players={m.teamB} align="left" onPlayerClick={onPlayerClick} compact />
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 12,
                  background: m.mine ? 'rgba(var(--accent-rgb),0.06)' : 'transparent',
                  border: m.mine ? '1px solid rgba(var(--accent-rgb),0.22)' : '1px solid transparent',
                }}>
                  {/* mode + quando */}
                  <div style={{ width: 88, flexShrink: 0 }}>
                    <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{m.mode}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{m.when}</div>
                  </div>

                  {/* squadra A */}
                  <TeamCell players={m.teamA} align="right" onPlayerClick={onPlayerClick} />

                  {/* punteggio */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className="disp" style={{ fontSize: 28, fontWeight: 700, color: aWon ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreA}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>–</span>
                    <span className="disp" style={{ fontSize: 28, fontWeight: 700, color: !aWon ? 'var(--accent)' : 'var(--dim)' }}>{m.scoreB}</span>
                  </div>

                  {/* squadra B */}
                  <TeamCell players={m.teamB} align="left" onPlayerClick={onPlayerClick} />

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
