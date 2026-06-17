import { Bell, Users, ChevronsUpDown, Search, Plus } from 'lucide-react';

export default function TopBar({ group, onRegistra }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 36px', borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(6,6,7,0.85)', backdropFilter: 'blur(10px)',
    }}>
      {/* Group selector */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 12, padding: '9px 14px', cursor: 'pointer', color: 'inherit',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
        }}>
          <Users size={15} style={{ color: 'var(--accent)' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div className="mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', color: 'var(--dim)' }}>GRUPPO</div>
          <div className="disp" style={{ fontSize: 17, fontWeight: 700, lineHeight: 0.9, textTransform: 'uppercase' }}>
            {group?.name ?? '…'}
          </div>
        </div>
        <ChevronsUpDown size={16} style={{ color: 'var(--dim)', marginLeft: 4 }} />
      </button>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        flex: 1, maxWidth: 420, margin: '0 28px',
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 12, padding: '0 14px', height: 44,
      }}>
        <Search size={18} style={{ color: 'var(--dim)', flexShrink: 0 }} />
        <input
          placeholder="Cerca giocatori, leghe, tornei…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--txt)', fontSize: 14, fontFamily: 'inherit',
          }}
        />
      </div>

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
