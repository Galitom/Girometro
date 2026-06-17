import { useState, useEffect } from 'react';
import Avatar from '../components/ui/Avatar';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import { getLeagues, getMe } from '../api/mock';

export default function Leghe() {
  const [leagues, setLeagues] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    getLeagues().then(setLeagues);
    getMe().then(setMe);
  }, []);

  if (!leagues.length || !me) return null;

  return (
    <div className="screen-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Competizioni · Stagioni</div>
          <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Leghe</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="trans press-95 disp" style={{
            height: 48, padding: '0 20px', borderRadius: 13,
            border: '1px solid var(--line)', background: 'var(--surface)',
            color: 'var(--txt)', fontSize: 18, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
          }}>Unisciti</button>
          <button className="glow-accent trans press-95 disp" style={{
            height: 48, padding: '0 20px', borderRadius: 13,
            border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)',
            fontSize: 18, fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
          }}>Crea Lega</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {leagues.map(lg => (
          <Panel key={lg.id} className={lg.featured ? 'glow-accent' : ''} style={{ padding: 28, borderColor: lg.featured ? 'rgba(255,90,31,0.3)' : 'var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div className="disp" style={{ fontSize: 34, fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase' }}>{lg.name}</div>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 5 }}>{lg.season.toUpperCase()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="disp" style={{ fontSize: 38, fontWeight: 700, lineHeight: 0.82, color: 'var(--accent)' }}>
                  {lg.daysLeft}<span style={{ fontSize: 16, color: 'var(--muted)' }}>g</span>
                </div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>ALLA FINE</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <ProgressBar pct={(lg.played / lg.total) * 100} height={8} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--dim)', whiteSpace: 'nowrap' }}>{lg.played}/{lg.total} giornate</span>
            </div>

            <div style={{ background: 'var(--bg-2)', borderRadius: 14, padding: '8px 6px' }}>
              {lg.table.map((row, i) => {
                const isMine = row.p.id === me.id;
                return (
                  <div key={row.p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 10,
                    background: isMine ? 'rgba(255,90,31,0.1)' : 'transparent',
                  }}>
                    <span className="disp" style={{ fontSize: 19, fontWeight: 700, width: 22, color: i === 0 ? 'var(--accent)' : 'var(--dim)' }}>{i + 1}</span>
                    <Avatar player={row.p} size={30} accent={isMine} />
                    <span style={{ flex: 1, fontSize: 14.5, fontWeight: isMine ? 700 : 500 }}>{isMine ? 'Tu' : row.p.name.split(' ')[0]}</span>
                    <span className="disp" style={{ fontSize: 22, fontWeight: 700 }}>
                      {row.pts}<span style={{ fontSize: 11, color: 'var(--dim)', marginLeft: 2 }}>PT</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
