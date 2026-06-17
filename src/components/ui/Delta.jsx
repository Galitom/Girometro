import { ArrowUp, ArrowDown } from 'lucide-react';

export default function Delta({ value, suffix = '' }) {
  if (value === 0 || value == null)
    return <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>—</span>;
  const up = value > 0;
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 12, fontWeight: 700, color: up ? 'var(--pos)' : 'var(--neg)',
    }}>
      {up ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
      {Math.abs(value)}{suffix}
    </span>
  );
}
