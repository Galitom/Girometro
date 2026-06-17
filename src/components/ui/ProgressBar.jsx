export default function ProgressBar({ pct, height = 7, color = 'var(--accent)', track = 'rgba(255,255,255,0.07)' }) {
  return (
    <div style={{ height, background: track, borderRadius: 999, overflow: 'hidden', width: '100%' }}>
      <div style={{
        height: '100%',
        width: `${Math.max(0, Math.min(100, pct))}%`,
        background: color, borderRadius: 999,
        transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
      }} />
    </div>
  );
}
