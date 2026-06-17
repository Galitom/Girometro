export default function LineChart({ data, width = 720, height = 240, color = 'var(--accent)' }) {
  const pad = { t: 20, r: 12, b: 12, l: 12 };
  const min = Math.min(...data), max = Math.max(...data);
  const span = Math.max(1, max - min);
  const iw = width - pad.l - pad.r, ih = height - pad.t - pad.b;
  const pts = data.map((d, i) => [
    pad.l + (i / (data.length - 1)) * iw,
    pad.t + ih - ((d - min) / span) * ih,
  ]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L ${pts.at(-1)[0].toFixed(1)} ${height} L ${pts[0][0].toFixed(1)} ${height} Z`;
  const last = pts.at(-1);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="eloFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(g => (
        <line key={g}
          x1={pad.l} x2={width - pad.r}
          y1={pad.t + ih * g} y2={pad.t + ih * g}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#eloFill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} opacity={i === pts.length - 1 ? 0 : 0.5} />
      ))}
      <circle cx={last[0]} cy={last[1]} r="6" fill={color} />
      <circle cx={last[0]} cy={last[1]} r="6" fill="none" stroke="var(--bg)" strokeWidth="2.5" />
    </svg>
  );
}
