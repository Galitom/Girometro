const TONES = {
  default: { bg: 'rgba(255,255,255,0.06)',       fg: 'var(--muted)',   bd: 'var(--line)' },
  accent:  { bg: 'rgba(var(--accent-rgb),0.14)', fg: 'var(--accent)',  bd: 'rgba(var(--accent-rgb),0.35)' },
  pos:     { bg: 'rgba(94,232,156,0.12)',        fg: 'var(--pos)',     bd: 'rgba(94,232,156,0.28)' },
  neg:     { bg: 'rgba(255,90,110,0.12)',        fg: 'var(--neg)',     bd: 'rgba(255,90,110,0.28)' },
  live:    { bg: 'rgba(var(--accent-rgb),0.16)', fg: 'var(--accent)',  bd: 'rgba(var(--accent-rgb),0.45)' },
};

export default function Chip({ children, tone = 'default', style = {} }) {
  const t = TONES[tone] || TONES.default;
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '3px 9px', borderRadius: 4,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}
