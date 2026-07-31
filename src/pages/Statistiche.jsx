import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Chip from '../components/ui/Chip';
import Delta from '../components/ui/Delta';
import Panel, { PanelTitle } from '../components/ui/Panel';
import LineChart from '../components/ui/LineChart';
import { getStats } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Statistiche() {
  const { matchVersion, onPlayerClick } = useOutletContext();
  const { me } = useAuth();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);

  // Reload stats/Elo series whenever a match is recorded.
  useEffect(() => {
    getStats().then(setStats);
  }, [matchVersion]);

  if (!me || !stats) return null;

  const total = me.w + me.l;
  const wr = total ? Math.round(me.w / total * 100) : 0;

  return (
    <div className="screen-in">
      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Profilo · Statistiche</div>
        <h1 className="disp disp-tight glitch-title" style={{ fontSize: 'clamp(32px, 8.5vw, 52px)', fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>Le tue statistiche</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>Andamento, rivalità e performance nel tempo.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Elo chart */}
        <Panel style={{ padding: isMobile ? 20 : 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase' }}>Andamento Elo · 90 giorni</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                <span className="disp txt-glow" style={{ fontSize: 56, fontWeight: 700, lineHeight: 0.8, color: 'var(--accent)' }}>{me.elo}</span>
                <Delta value={+140} />
              </div>
            </div>
            <Chip tone="accent">Picco 1851</Chip>
          </div>
          <LineChart data={stats.eloSeries} />
        </Panel>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignContent: 'start' }}>
          {[
            { k: 'Partite totali',   v: total },
            { k: 'Win rate',         v: `${wr}%`,              c: 'var(--pos)' },
            { k: 'Gol fatti',        v: me.gf },
            { k: 'Gol subiti',       v: me.ga,                 c: 'var(--neg)' },
            { k: 'Giri',             v: `${me.gf - me.ga >= 0 ? '+' : ''}${me.gf - me.ga}`, c: me.gf - me.ga >= 0 ? 'var(--pos)' : 'var(--neg)' },
            { k: 'Striscia record',  v: me.best,               c: 'var(--accent)' },
          ].map(s => (
            <Panel key={s.k} hover style={{ padding: 20 }}>
              <div className="disp" style={{ fontSize: 40, fontWeight: 700, lineHeight: 0.9, color: s.c || 'var(--txt)' }}>{s.v}</div>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.08em', color: 'var(--dim)', marginTop: 6, textTransform: 'uppercase' }}>{s.k}</div>
            </Panel>
          ))}
        </div>
      </div>

      {/* Rivalries + partners */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 20 }}>
        <Panel style={{ padding: 24 }}>
          <PanelTitle>Rivalità</PanelTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.rivalries.map(r => {
              const tot = r.w + r.l, pct = (r.w / tot) * 100, lead = r.w >= r.l;
              return (
                <div key={r.opp.id}>
                  <div onClick={() => onPlayerClick(r.opp.id)} className="card-hover press-97" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, cursor: 'pointer', borderRadius: 12, padding: 4, margin: '-4px -4px 4px' }}>
                    <Avatar player={r.opp} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{r.opp.name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{tot} SCONTRI · {r.gf}–{r.ga} GOL</div>
                    </div>
                    <div className="disp" style={{ fontSize: 30, fontWeight: 700 }}>
                      <span style={{ color: lead ? 'var(--pos)' : 'var(--txt)' }}>{r.w}</span>
                      <span style={{ color: 'var(--dim)' }}>–</span>
                      <span style={{ color: !lead ? 'var(--neg)' : 'var(--txt)' }}>{r.l}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', height: 7, borderRadius: 999, overflow: 'hidden', background: 'var(--neg)' }}>
                    <div style={{ width: `${pct}%`, background: 'var(--pos)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel style={{ padding: 24 }}>
          <PanelTitle>Miglior coppia</PanelTitle>
          {stats.partners.map(pt => (
            <div key={pt.mate.id} onClick={() => onPlayerClick(pt.mate.id)} className="card-hover press-97" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px', borderBottom: '1px solid var(--line)', cursor: 'pointer', borderRadius: 12 }}>
              <div style={{ position: 'relative', width: 64, height: 44 }}>
                <Avatar player={me} size={42} accent />
                <div style={{ position: 'absolute', left: 22, top: 2 }}><Avatar player={pt.mate} size={42} /></div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Tu &amp; {pt.mate.name.split(' ')[0]}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{pt.w}V · {pt.l}S in 2vs2</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="disp" style={{ fontSize: 34, fontWeight: 700, color: 'var(--accent)', lineHeight: 0.9 }}>{pt.syn}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>SINTONIA</div>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
