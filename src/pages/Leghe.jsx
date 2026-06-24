import { Shield } from 'lucide-react';

export default function Leghe() {
  return (
    <div className="screen-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20 }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'var(--surface)', border: '1px solid var(--line)',
        display: 'grid', placeItems: 'center',
      }}>
        <Shield size={32} color="var(--accent)" strokeWidth={1.8} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, textTransform: 'uppercase', lineHeight: 0.85, margin: '0 0 14px' }}>Leghe</h1>
        <div className="mono" style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>Work in progress</div>
        <div style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 320 }}>
          La gestione delle leghe è in arrivo. Per ora, creale e gestisci le classifiche dall'area admin.
        </div>
      </div>
    </div>
  );
}
