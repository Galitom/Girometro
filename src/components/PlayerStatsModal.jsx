import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Avatar from './ui/Avatar';
import Delta from './ui/Delta';
import Panel from './ui/Panel';
import LineChart from './ui/LineChart';
import { getPlayerStats } from '../api/client';
import { useIsMobile } from '../hooks/useMediaQuery';

// Read-only profile modal: full stats for any player, opened by clicking their
// avatar/name anywhere outside the admin screens. Rivals and partners inside are
// themselves clickable, swapping the modal content in place (no navigation).
export default function PlayerStatsModal({ slug, onClose }) {
  const isMobile = useIsMobile();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  // Fetch on mount. The modal is remounted (key=slug) on in-place navigation,
  // so this runs fresh for each player and `data` starts null (loading state).
  useEffect(() => {
    let alive = true;
    getPlayerStats(slug).then(d => { if (alive) setData(d); }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [slug]);

  const p = data?.player;
  const total = p ? p.w + p.l : 0;
  const wr = total ? Math.round(p.w / total * 100) : 0;
  const diff = p ? p.gf - p.ga : 0;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(3,3,4,0.82)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 12 : 24,
    }}>
      <div onClick={e => e.stopPropagation()} className="rise" style={{
        width: 760, maxWidth: '100%',
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 24, padding: isMobile ? 20 : 32, position: 'relative',
        maxHeight: isMobile ? '94dvh' : '92vh', overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: isMobile ? 16 : 24, right: isMobile ? 16 : 24,
          width: 40, height: 40, borderRadius: 12, background: 'var(--surface-2)',
          border: '1px solid var(--line)', color: 'var(--muted)', cursor: 'pointer',
          display: 'grid', placeItems: 'center', zIndex: 1,
        }}><X size={22} /></button>

        {!p ? (
          <div style={{ height: 320, display: 'grid', placeItems: 'center' }}>
            <span className="mono" style={{ fontSize: 12, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase' }}>
              {error ? 'Giocatore non trovato' : 'Caricamento…'}
            </span>
          </div>
        ) : (
          <>
            {/* Header: avatar + name + rank/elo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18, marginBottom: 28, paddingRight: isMobile ? 44 : 48 }}>
              <Avatar player={p} size={isMobile ? 52 : 72} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Rank #{p.rank} nel gruppo
                </div>
                <h2 className="disp disp-tight" style={{ fontSize: isMobile ? 28 : 40, fontWeight: 700, lineHeight: 0.85, textTransform: 'uppercase', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h2>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="disp txt-glow" style={{ fontSize: isMobile ? 38 : 52, fontWeight: 700, lineHeight: 0.8, color: 'var(--accent)' }}>{p.elo}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}><Delta value={p.delta} /></div>
              </div>
            </div>

            {/* Elo chart */}
            <Panel style={{ padding: isMobile ? 16 : 22, marginBottom: 18 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 14 }}>Andamento Elo</div>
              <LineChart data={data.eloSeries} />
            </Panel>

            {/* Stat grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
              {[
                { k: 'Partite',        v: total },
                { k: 'Win rate',       v: `${wr}%`,                             c: 'var(--pos)' },
                { k: 'Striscia record', v: p.best,                              c: 'var(--accent)' },
                { k: 'Vittorie',       v: p.w,                                  c: 'var(--pos)' },
                { k: 'Sconfitte',      v: p.l,                                  c: 'var(--neg)' },
                { k: 'Giri',           v: `${diff >= 0 ? '+' : ''}${diff}`,     c: diff >= 0 ? 'var(--pos)' : 'var(--neg)' },
              ].map(s => (
                <Panel key={s.k} style={{ padding: 16 }}>
                  <div className="disp" style={{ fontSize: 34, fontWeight: 700, lineHeight: 0.82, color: s.c || 'var(--txt)' }}>{s.v}</div>
                  <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.08em', color: 'var(--dim)', marginTop: 6, textTransform: 'uppercase' }}>{s.k}</div>
                </Panel>
              ))}
            </div>

            {/* Rivalries */}
            {data.rivalries.length > 0 && (
              <Panel style={{ padding: 22, marginBottom: 18 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 16 }}>Rivalità</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {data.rivalries.map(r => {
                    const tot = r.w + r.l, pct = tot ? (r.w / tot) * 100 : 0, lead = r.w >= r.l;
                    return (
                      <div key={r.opp.id}>
                        <div
                          className="card-hover press-97"
                          onClick={() => onClose(r.opp.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, cursor: 'pointer', borderRadius: 12, padding: 4, margin: '-4px -4px 4px' }}
                        >
                          <Avatar player={r.opp} size={38} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700 }}>{r.opp.name}</div>
                            <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{tot} SCONTRI · {r.gf}–{r.ga} GOL</div>
                          </div>
                          <div className="disp" style={{ fontSize: 28, fontWeight: 700 }}>
                            <span style={{ color: lead ? 'var(--pos)' : 'var(--txt)' }}>{r.w}</span>
                            <span style={{ color: 'var(--dim)' }}>–</span>
                            <span style={{ color: !lead ? 'var(--neg)' : 'var(--txt)' }}>{r.l}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', background: 'var(--neg)' }}>
                          <div style={{ width: `${pct}%`, background: 'var(--pos)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}

            {/* Partners */}
            {data.partners.length > 0 && (
              <Panel style={{ padding: 22 }}>
                <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 8 }}>Migliori coppie</div>
                {data.partners.map(pt => (
                  <div
                    key={pt.mate.id}
                    className="card-hover press-97"
                    onClick={() => onClose(pt.mate.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 4px', borderBottom: '1px solid var(--line)', cursor: 'pointer', borderRadius: 12 }}
                  >
                    <Avatar player={pt.mate} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{pt.mate.name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{pt.w}V · {pt.l}S in 2vs2</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="disp" style={{ fontSize: 30, fontWeight: 700, color: 'var(--accent)', lineHeight: 0.85 }}>{pt.syn}</div>
                      <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>SINTONIA</div>
                    </div>
                  </div>
                ))}
              </Panel>
            )}
          </>
        )}
      </div>
    </div>
  );
}
