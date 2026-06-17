export default function Panel({ children, style = {}, hover = false, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`${hover ? 'card-hover' : ''} ${className}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PanelTitle({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 className="disp" style={{ fontSize: 24, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{children}</h2>
      {action && (
        <button onClick={onAction} className="mono" style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', opacity: 1,
        }}
          onMouseDown={e => e.currentTarget.style.opacity = '0.6'}
          onMouseUp={e => e.currentTarget.style.opacity = '1'}
        >{action}</button>
      )}
    </div>
  );
}
