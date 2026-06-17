export default function Avatar({ player, size = 44, ring = false, accent = false }) {
  const fs = Math.round(size * 0.40);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: accent ? 'var(--accent)' : (player?.color || '#3a3a40'),
      color: accent ? 'var(--accent-ink)' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: fs, lineHeight: 1,
      letterSpacing: '0.02em',
      boxShadow: ring
        ? '0 0 0 2px var(--bg), 0 0 0 3.5px var(--accent)'
        : 'inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>
      <span style={{ marginTop: size * 0.04 }}>{player?.initials || '?'}</span>
    </div>
  );
}
