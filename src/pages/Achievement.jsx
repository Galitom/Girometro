import { useState, useEffect } from 'react';
import { Award, Check, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Panel from '../components/ui/Panel';
import ProgressBar from '../components/ui/ProgressBar';
import { getAchievements } from '../api/mock';

function AchIcon({ name, unlocked }) {
  const Comp = LucideIcons[name] || LucideIcons.Star;
  return <Comp size={26} />;
}

export default function Achievement() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    getAchievements().then(setAchievements);
  }, []);

  const got = achievements.filter(a => a.got).length;

  return (
    <div className="screen-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Profilo · Gamification</div>
          <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Achievement</h1>
        </div>
        <Panel className="glow-accent" style={{ padding: '14px 24px', borderColor: 'rgba(255,90,31,0.3)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Award size={30} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span className="disp txt-glow" style={{ fontSize: 38, fontWeight: 700, lineHeight: 0.8, color: 'var(--accent)' }}>{got}</span>
              <span className="disp" style={{ fontSize: 20, color: 'var(--dim)', fontWeight: 700 }}>/ {achievements.length}</span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>SBLOCCATI</div>
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
        {achievements.map(a => {
          const pct = a.got ? 100 : Math.round((a.prog / a.of) * 100);
          return (
            <Panel key={a.id} hover style={{
              padding: 22, opacity: a.got ? 1 : 0.94,
              borderColor: a.got ? 'rgba(255,90,31,0.28)' : 'var(--line)',
              background: a.got ? 'rgba(255,90,31,0.06)' : 'var(--surface)',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 15, display: 'grid', placeItems: 'center', marginBottom: 14,
                background: a.got ? 'var(--accent)' : 'var(--surface-2)',
                color: a.got ? 'var(--accent-ink)' : 'var(--dim)',
              }}>
                {a.got ? <AchIcon name={a.icon} /> : <Lock size={26} />}
              </div>
              <div className="disp" style={{ fontSize: 22, fontWeight: 700, lineHeight: 0.95, textTransform: 'uppercase', color: a.got ? 'var(--txt)' : 'var(--muted)' }}>{a.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--dim)', marginTop: 5, lineHeight: 1.3, minHeight: 34 }}>{a.desc}</div>
              {a.got ? (
                <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--accent)', letterSpacing: '0.06em', marginTop: 10 }}>
                  <Check size={13} strokeWidth={3} /> {a.date.toUpperCase()}
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <ProgressBar pct={pct} height={6} />
                  <div className="mono" style={{ fontSize: 10, color: 'var(--dim)', marginTop: 5 }}>{a.prog} / {a.of}</div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
