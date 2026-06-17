const TONES = {
  default: { bg: 'rgba(255,255,255,0.06)', fg: 'var(--muted)', bd: 'var(--line)' },
  accent:  { bg: 'rgba(255,90,31,0.14)',   fg: 'var(--accent)', bd: 'rgba(255,90,31,0.30)' },
  pos:     { bg: 'rgba(143,227,154,0.12)', fg: 'var(--pos)',    bd: 'rgba(143,227,154,0.25)' },
  neg:     { bg: 'rgba(255,106,90,0.12)',  fg: 'var(--neg)',    bd: 'rgba(255,106,90,0.25)' },
  live:    { bg: 'rgba(255,90,31,0.16)',   fg: 'var(--accent)', bd: 'rgba(255,90,31,0.4)' },
};

export default function Chip({ children, tone = 'default', style = {} }) {
  const t = TONES[tone] || TONES.default;
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      padding: '3px 8px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}
