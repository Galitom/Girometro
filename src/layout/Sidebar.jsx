import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, TrendingUp, Swords,
  Shield, Trophy, Award, LogOut, ShieldCheck, ListChecks,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { isAdmin } from '../auth/roles';

const NAV_GROUPS = [
  { section: 'Gioca', items: [
    { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/classifica',   icon: BarChart3,       label: 'Classifica' },
    { to: '/partite',      icon: Swords,          label: 'Partite' },
    { to: '/statistiche',  icon: TrendingUp,      label: 'Statistiche' },
    { to: '/achievement',  icon: Award,           label: 'Achievement' },
  ]},
  { section: 'Competi', items: [
    { to: '/leghe',   icon: Shield,  label: 'Leghe' },
    { to: '/tornei',  icon: Trophy,  label: 'Tornei' },
  ]},
];

// Voci visibili solo agli admin, aggiunte in coda alla nav.
const ADMIN_GROUP = { section: 'Admin', items: [
  { to: '/gestione-partite', icon: ListChecks, label: 'Gestione partite' },
  { to: '/gestione-ruoli',   icon: ShieldCheck, label: 'Gestione ruoli' },
]};

export default function Sidebar({ me, onLogout, isMobile = false, open = false, onClose, onNavigate }) {
  const groups = isAdmin(me) ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;

  // On mobile the sidebar is an off-canvas drawer: hidden off-screen, slid in
  // over a dark overlay when `open`. On desktop it's a sticky rail as before.
  const asideStyle = isMobile
    ? {
        width: 'min(84vw, var(--sidebar-w))', flexShrink: 0,
        background: 'var(--bg)', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100dvh', zIndex: 60,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: open ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
      }
    : {
        width: 'var(--sidebar-w)', flexShrink: 0,
        background: 'var(--bg)', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      };

  return (
    <>
      {isMobile && (
        <div
          onClick={onClose}
          aria-hidden
          style={{
            position: 'fixed', inset: 0, zIndex: 55,
            background: 'rgba(3,3,4,0.6)', backdropFilter: 'blur(2px)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity 0.26s ease',
          }}
        />
      )}
    <aside style={asideStyle}>
      {/* Logo */}
      <div style={{ padding: '26px 24px 22px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="glow-accent" style={{
            width: 40, height: 40, background: 'var(--accent)',
            clipPath: 'polygon(28% 0, 72% 0, 100% 50%, 72% 100%, 28% 100%, 0 50%)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <div style={{ width: 15, height: 15, background: 'var(--accent-ink)', transform: 'rotate(45deg)', borderRadius: 2 }} />
          </div>
          <div className="disp disp-tight" style={{ fontSize: 27, lineHeight: 0.85, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
            Giro<span style={{ color: 'var(--accent)' }}>metro</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '18px 14px' }}>
        {groups.map(grp => (
          <div key={grp.section} style={{ marginBottom: 22 }}>
            <div className="mono" style={{
              fontSize: 10, letterSpacing: '0.22em', color: 'var(--dim)',
              textTransform: 'uppercase', padding: '0 12px 10px',
            }}>{grp.section}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {grp.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavigate}>
                  {({ isActive }) => (
                    <div className="nav-item" style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px', borderRadius: 6, cursor: 'pointer',
                      background: isActive ? 'rgba(var(--accent-rgb),0.1)' : 'transparent',
                      border: isActive ? '1px solid rgba(var(--accent-rgb),0.3)' : '1px solid transparent',
                      color: isActive ? 'var(--accent)' : 'var(--muted)',
                    }}>
                      <item.icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                      <span style={{ flex: 1, fontSize: 15, fontWeight: isActive ? 700 : 600 }}>{item.label}</span>
                      {item.badge && (
                        <span className="mono" style={{
                          fontSize: 10, fontWeight: 700,
                          background: 'var(--accent)', color: 'var(--accent-ink)',
                          borderRadius: 999, padding: '2px 7px',
                        }}>{item.badge}</span>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User mini */}
      {me && (
        <NavLink to="/statistiche" onClick={onNavigate} style={{ margin: 14 }}>
          <div className="nav-item" style={{
            padding: 12, borderRadius: 6,
            background: 'var(--surface)', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer',
          }}>
            <Avatar player={me} size={42} accent ring />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.name}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent)' }}>#{me.rank} · {me.elo} ELO</div>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLogout?.(); }}
              title="Esci"
              className="trans press-90"
              style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 6,
                background: 'transparent', border: '1px solid var(--line)',
                color: 'var(--dim)', cursor: 'pointer', display: 'grid', placeItems: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </NavLink>
      )}
    </aside>
    </>
  );
}
