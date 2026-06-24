import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, TrendingUp,
  Shield, Trophy, MessageCircle, Award, LogOut,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const NAV_GROUPS = [
  { section: 'Gioca', items: [
    { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/classifica',   icon: BarChart3,       label: 'Classifica' },
    { to: '/statistiche',  icon: TrendingUp,      label: 'Statistiche' },
  ]},
  { section: 'Competi', items: [
    { to: '/leghe',   icon: Shield,  label: 'Leghe' },
    { to: '/tornei',  icon: Trophy,  label: 'Tornei' },
  ]},
  { section: 'Social', items: [
    { to: '/chat',        icon: MessageCircle, label: 'Chat', badge: 3 },
    { to: '/achievement', icon: Award,         label: 'Achievement' },
  ]},
];

export default function Sidebar({ me, onLogout }) {
  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      background: 'var(--bg)', borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '26px 24px 22px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, background: 'var(--accent)',
            display: 'grid', placeItems: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'radial-gradient(circle at 34% 30%, #fff, var(--accent-ink) 90%)' }} />
          </div>
          <div className="disp disp-tight" style={{ fontSize: 28, fontWeight: 700, lineHeight: 0.85, textTransform: 'uppercase' }}>
            Giro<span style={{ color: 'var(--accent)' }}>metro</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '18px 14px' }}>
        {NAV_GROUPS.map(grp => (
          <div key={grp.section} style={{ marginBottom: 22 }}>
            <div className="mono" style={{
              fontSize: 9.5, letterSpacing: '0.18em', color: 'var(--dim)',
              textTransform: 'uppercase', padding: '0 12px 10px',
            }}>{grp.section}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {grp.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                  {({ isActive }) => (
                    <div className="nav-item" style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px', borderRadius: 11, cursor: 'pointer',
                      background: isActive ? 'rgba(255,90,31,0.12)' : 'transparent',
                      border: isActive ? '1px solid rgba(255,90,31,0.25)' : '1px solid transparent',
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
        <NavLink to="/statistiche" style={{ margin: 14 }}>
          <div className="nav-item" style={{
            padding: 12, borderRadius: 14,
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
                flexShrink: 0, width: 32, height: 32, borderRadius: 9,
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
  );
}
