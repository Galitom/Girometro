import { Bell, Plus, Menu } from 'lucide-react';
import { canManageMatches } from '../auth/roles';

export default function TopBar({ me, onRegistra, isMobile = false, onMenu }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: isMobile ? 'space-between' : 'flex-end',
      padding: isMobile ? '12px 16px' : '16px 36px', borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
    }}>
      {isMobile && (
        <button onClick={onMenu} aria-label="Apri menu" className="trans press-90" style={{
          width: 44, height: 44, borderRadius: 8,
          background: 'var(--surface)', border: '1px solid var(--line)',
          display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--txt)',
        }}>
          <Menu size={22} />
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="trans press-90" style={{
          position: 'relative', width: 44, height: 44, borderRadius: 8,
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

        {canManageMatches(me) && (
          <button onClick={onRegistra} className="glow-accent trans press-95 disp" style={{
            height: 44, padding: isMobile ? '0 14px' : '0 20px', borderRadius: 8,
            border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)',
            fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.04em',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Plus size={20} strokeWidth={2.6} /> {!isMobile && 'Partita'}
          </button>
        )}
      </div>
    </div>
  );
}
