import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Shield, Trophy } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Chip from '../components/ui/Chip';
import Delta from '../components/ui/Delta';
import Panel, { PanelTitle } from '../components/ui/Panel';
import { getLastMatch, getActivity } from '../api/client';
import { canManageMatches } from '../auth/roles';
import { useAuth } from '../auth/AuthContext';

function WebHead({ kicker, title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
      <div>
        {kicker && <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>{kicker}</div>}
        <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>{title}</h1>
        {sub && <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { onRegistra, matchVersion } = useOutletContext();
  const { me } = useAuth();
  const [lastMatch, setLastMatch] = useState(null);
  const [activity, setActivity] = useState([]);

  // Re-fetch match-derived data whenever a match is recorded (matchVersion bumps),
  // so the last match and group activity reflect it live. `me` (Elo/rank) comes
  // from useAuth() and is refreshed by AppLayout on the same event.
  useEffect(() => {
    getLastMatch().then(setLastMatch);
    getActivity().then(setActivity);
  }, [matchVersion]);

  if (!me) return null;

  const total = me.w + me.l;
  const wr = total ? Math.round(me.w / total * 100) : 0;

  return (
    <div className="screen-in">
      <WebHead
        kicker="Dashboard"
        title={`Ciao, ${me.name.split(' ')[0]}`}
        sub="Ecco cosa è successo nell'arena ultimamente."
        right={
          canManageMatches(me) && (
            <button onClick={onRegistra} className="glow-accent trans press-95 disp" style={{
              height: 52, padding: '0 26px', borderRadius: 14, border: 'none',
              background: 'var(--accent)', color: 'var(--accent-ink)',
              fontSize: 21, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            }}>
              <Plus size={22} strokeWidth={2.6} /> Registra Partita
            </button>
          )
        }
      />

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: 20, marginBottom: 20 }}>
        {/* Rank card */}
        <Panel style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(90% 80% at 80% 0%, rgba(255,90,31,0.12), transparent 60%)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Avatar player={me} size={64} accent ring />
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--accent)' }}>RANK GRUPPO</div>
              <div className="disp txt-glow" style={{ fontSize: 56, fontWeight: 700, lineHeight: 0.8, color: 'var(--accent)' }}>#{me.rank}</div>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="disp" style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.8 }}>{me.elo}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.12em', marginTop: 4 }}>PUNTI ELO</div>
            </div>
            <div style={{ textAlign: 'right', marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Delta value={me.delta} /></div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--dim)', letterSpacing: '0.08em', marginTop: 3 }}>QUESTA SETT.</div>
            </div>
          </div>
        </Panel>

        {/* Last match */}
        {lastMatch && (
          <Panel className="glow-accent" style={{ padding: 28, borderColor: 'rgba(255,90,31,0.28)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Chip tone={lastMatch.won ? 'accent' : 'neg'}>{lastMatch.won ? '★ Vittoria' : 'Sconfitta'}</Chip>
                <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>{lastMatch.mode.toUpperCase()} · {lastMatch.date}</span>
              </div>
              <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>ULTIMA PARTITA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 110, gap: 6 }}>
                {lastMatch.teamA.map(p => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Avatar player={p} size={lastMatch.teamA.length > 1 ? 46 : 62} accent />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="disp txt-glow" style={{ fontSize: 84, fontWeight: 700, lineHeight: 1, color: 'var(--accent)' }}>{lastMatch.scoreA}</span>
                <span className="disp" style={{ fontSize: 40, color: 'var(--dim)', fontWeight: 600 }}>–</span>
                <span className="disp" style={{ fontSize: 84, fontWeight: 700, lineHeight: 1 }}>{lastMatch.scoreB}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 110, gap: 6 }}>
                {lastMatch.teamB.map(p => (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Avatar player={p} size={lastMatch.teamB.length > 1 ? 46 : 62} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--line)' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Variazione Elo</span>
              <Delta value={lastMatch.elo} />
            </div>
          </Panel>
        )}
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 20 }}>
        {[
          { k: 'Vittorie',       v: me.w,                                            icon: 'TrendingUp',   c: 'var(--pos)' },
          { k: 'Sconfitte',      v: me.l,                                            icon: 'TrendingDown', c: 'var(--neg)' },
          { k: 'Striscia',       v: me.streak > 0 ? `${me.streak}W` : `${Math.abs(me.streak)}L`, icon: 'Flame', c: 'var(--accent)' },
          { k: 'Win rate',       v: `${wr}%`,                                        icon: 'Target',       c: 'var(--txt)' },
        ].map(s => (
          <Panel key={s.k} hover style={{ padding: 22 }}>
            <div className="disp" style={{ fontSize: 46, fontWeight: 700, lineHeight: 0.82, color: s.c }}>{s.v}</div>
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--dim)', marginTop: 8, textTransform: 'uppercase' }}>{s.k}</div>
          </Panel>
        ))}
      </div>

      {/* Activity + quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <Panel style={{ padding: 24 }}>
          <PanelTitle>Attività del gruppo</PanelTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activity.map(ev => {
              const winners = ev.sa > ev.sb ? ev.teamA : ev.teamB;
              const losers  = ev.sa > ev.sb ? ev.teamB : ev.teamA;
              const names = arr => arr.map(p => p.name.split(' ')[0]).join(' e ');
              const is2v2 = ev.teamA.length > 1 || ev.teamB.length > 1;
              return (
                <div key={ev.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 8px', borderRadius: 12,
                  background: ev.mine ? 'rgba(255,90,31,0.06)' : 'transparent',
                }}>
                  <div style={{ position: 'relative', width: 46, height: 32, flexShrink: 0 }}>
                    <Avatar player={ev.teamA[0]} size={30} />
                    <div style={{ position: 'absolute', left: 16, top: 3 }}><Avatar player={ev.teamB[0]} size={30} /></div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15 }}>
                      {is2v2 ? (
                        <>
                          <b>{names(winners)}</b>
                          <span style={{ color: 'var(--pos)' }}> hanno battuto </span>
                          <b>{names(losers)}</b>
                        </>
                      ) : (
                        <>
                          <b>{ev.teamA[0].name.split(' ')[0]}</b>
                          <span style={{ color: ev.sa > ev.sb ? 'var(--pos)' : 'var(--neg)' }}>
                            {ev.sa > ev.sb ? ' ha battuto ' : ' ha perso con '}
                          </span>
                          <b>{ev.teamB[0].name.split(' ')[0]}</b>
                        </>
                      )}
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--dim)' }}>{ev.when} · {ev.mode}</span>
                  </div>
                  <div className="disp" style={{ fontSize: 26, fontWeight: 700 }}>
                    <span style={{ color: ev.sa > ev.sb ? 'var(--txt)' : 'var(--dim)' }}>{ev.sa}</span>
                    <span style={{ color: 'var(--dim)' }}>–</span>
                    <span style={{ color: ev.sb > ev.sa ? 'var(--txt)' : 'var(--dim)' }}>{ev.sb}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel hover onClick={() => navigate('/leghe')} style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Shield size={26} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="disp" style={{ fontSize: 30, fontWeight: 700, textTransform: 'uppercase', lineHeight: 0.9 }}>Leghe</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Work in progress</div>
          </Panel>
          <Panel hover onClick={() => navigate('/tornei')} style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Trophy size={26} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="disp" style={{ fontSize: 30, fontWeight: 700, textTransform: 'uppercase', lineHeight: 0.9 }}>Tornei</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Work in progress</div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
