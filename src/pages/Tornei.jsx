import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Chip from '../components/ui/Chip';
import Panel from '../components/ui/Panel';
import { getTournaments, getMe } from '../api/mock';

function BracketSide({ p, score, win, live, me }) {
  const isMine = p?.id === me?.id;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 8,
      background: win ? 'rgba(255,90,31,0.12)' : 'transparent',
    }}>
      {p
        ? <Avatar player={p} size={28} accent={isMine} />
        : <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px dashed var(--line)', flexShrink: 0 }} />
      }
      <span style={{
        flex: 1, fontSize: 14, fontWeight: win ? 700 : 500,
        color: p ? 'var(--txt)' : 'var(--dim)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {p ? (isMine ? 'Tu' : p.name.split(' ')[0]) : 'TBD'}
      </span>
      <span className="disp" style={{ fontSize: 22, fontWeight: 700, color: win ? 'var(--accent)' : 'var(--muted)' }}>
        {score != null ? score : (live ? '·' : '–')}
      </span>
    </div>
  );
}

export default function Tornei() {
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    getTournaments().then(setData);
    getMe().then(setMe);
  }, []);

  if (!data || !me) return null;

  const statusMeta = {
    live: { tone: 'live', label: '● In corso' },
    open: { tone: 'pos',  label: 'Iscrizioni aperte' },
    done: { tone: 'default', label: 'Concluso' },
  };

  const bracketCols = [
    { key: 'quarti', label: 'Quarti di finale', matches: data.bracket.quarti },
    { key: 'semi',   label: 'Semifinali',       matches: data.bracket.semi },
    { key: 'finale', label: 'Finale',            matches: data.bracket.finale },
  ];

  return (
    <div className="screen-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Competizioni · Eliminazione diretta</div>
          <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Tornei</h1>
        </div>
        <button className="trans press-95 disp" style={{
          height: 48, padding: '0 22px', borderRadius: 13,
          border: '1px solid var(--line)', background: 'var(--surface)',
          color: 'var(--txt)', fontSize: 19, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
        }}>+ Crea Torneo</button>
      </div>

      {/* Tournament cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
        {data.list.map(t => {
          const m = statusMeta[t.status];
          return (
            <Panel key={t.id} hover className={t.status === 'live' ? 'glow-accent' : ''} style={{
              padding: 24, opacity: t.status === 'done' ? 0.8 : 1,
              borderColor: t.status === 'live' ? 'rgba(255,90,31,0.3)' : 'var(--line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <Chip tone={m.tone}>{m.label}</Chip>
                <div style={{ textAlign: 'right' }}>
                  <div className="disp" style={{ fontSize: 34, fontWeight: 700, color: 'var(--accent)', lineHeight: 0.82 }}>{t.prize}</div>
                  <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>MONTEPREMI</div>
                </div>
              </div>
              <div className="disp" style={{ fontSize: 30, fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase', marginBottom: 16 }}>{t.name}</div>

              {/* Mini bracket visual */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16, height: 36, opacity: 0.9 }}>
                {[8, 4, 2, 1].map((n, ci) => (
                  <div key={ci} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, flex: 1 }}>
                    {Array.from({ length: n }).map((_, ri) => (
                      <div key={ri} style={{
                        height: Math.max(2, 32 / n),
                        background: ci === 0 ? 'var(--accent)' : 'var(--surface-2)',
                        borderRadius: 2,
                        opacity: ci === 0 ? 0.4 + (ri % 2) * 0.5 : 1,
                      }} />
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={13} style={{ flexShrink: 0 }} />
                  {t.players}{t.cap ? `/${t.cap}` : ''} · {t.fee || '—'}
                </span>
                {t.status === 'open'
                  ? <button className="disp" style={{ fontSize: 17, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}>Iscriviti →</button>
                  : <span className="mono" style={{ fontSize: 11, color: 'var(--accent)' }}>{t.note}</span>
                }
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Live bracket */}
      <Panel style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 6 }}>● In corso · Quarti</div>
            <h2 className="disp" style={{ fontSize: 32, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Coppa del Bancone</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="disp" style={{ fontSize: 30, fontWeight: 700 }}>8</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>GIOCATORI</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="disp" style={{ fontSize: 30, fontWeight: 700, color: 'var(--accent)' }}>€120</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>MONTEPREMI</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
          {bracketCols.map(col => (
            <div key={col.key} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--dim)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>{col.label}</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 16 }}>
                {col.matches.map((mt, i) => {
                  const winA = mt.done && mt.sa > mt.sb, winB = mt.done && mt.sb > mt.sa;
                  return (
                    <div key={i} className={mt.live ? 'glow-accent' : ''} style={{
                      background: 'var(--bg-2)',
                      border: `1px solid ${mt.live ? 'rgba(255,90,31,0.4)' : 'var(--line)'}`,
                      borderRadius: 12, padding: 6,
                    }}>
                      <BracketSide p={mt.a} score={mt.sa} win={winA} live={mt.live} me={me} />
                      <div style={{ height: 1, background: 'var(--line)', margin: '0 11px' }} />
                      <BracketSide p={mt.b} score={mt.sb} win={winB} live={mt.live} me={me} />
                      {mt.live && (
                        <div className="mono" style={{ textAlign: 'center', fontSize: 9, color: 'var(--accent)', letterSpacing: '0.14em', padding: '5px 0 2px' }}>● LIVE ORA</div>
                      )}
                    </div>
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
