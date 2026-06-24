import { Bell, Plus } from 'lucide-react';

export default function TopBar({ onRegistra }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '16px 36px', borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(6,6,7,0.85)', backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="trans press-90" style={{
          position: 'relative', width: 44, height: 44, borderRadius: 12,
          background: 'var(--surface)', border: '1px solid var(--line)',
          display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--muted)',
        }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute', top: 10, right: 11,
            width: 7, height: 7, borderRadius: 999,
            background: 'var(--accent)', boxShadow: '0 0 0 2px var(--bg-2)',
          }} />
        </button>

        <button onClick={onRegistra} className="glow-accent trans press-95 disp" style={{
          height: 44, padding: '0 20px', borderRadius: 12,
          border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)',
          fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <Plus size={20} strokeWidth={2.6} /> Partita
        </button>
      </div>
    </div>
  );
}
