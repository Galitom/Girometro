// Square, arcade-style avatar: a solid neon tile with mono initials.
// `player.color` drives the tile color (per-player); `accent` forces the cyan
// accent tile; `ring` adds a cyan outline (used for "me").
export default function Avatar({ player, size = 44, ring = false, accent = false }) {
  const fs = Math.round(size * 0.38);
  const radius = Math.max(4, Math.round(size * 0.14));
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: accent ? 'var(--accent)' : (player?.color || '#2a2d34'),
      color: accent ? 'var(--accent-ink)' : '#050608',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: fs, lineHeight: 1,
      letterSpacing: '0.02em',
      boxShadow: ring
        ? '0 0 0 2px var(--bg), 0 0 0 3.5px var(--accent), 0 0 14px rgba(var(--accent-rgb),0.5)'
        : 'none',
    }}>
      <span>{player?.initials || '?'}</span>
    </div>
  );
}
