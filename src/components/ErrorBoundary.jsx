import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

// Catches render errors in any descendant so a single broken page shows a
// fallback instead of unmounting the whole app (which left a black screen).
// Error boundaries must be class components — there is no hook equivalent.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface the stack in the console for debugging during development.
    console.error('Errore di rendering catturato da ErrorBoundary:', error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="screen-in" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '64px 24px', gap: 18, minHeight: 360,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, display: 'grid', placeItems: 'center',
          background: 'rgba(255,90,31,0.1)', border: '1px solid rgba(255,90,31,0.3)',
          color: 'var(--accent)',
        }}>
          <AlertTriangle size={30} />
        </div>
        <h1 className="disp disp-tight" style={{
          fontSize: 40, fontWeight: 700, textTransform: 'uppercase', lineHeight: 0.9, margin: 0,
        }}>
          Qualcosa è andato storto
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', maxWidth: 420, margin: 0 }}>
          Questa pagina ha riscontrato un errore imprevisto. Puoi riprovare o spostarti
          su un'altra sezione dal menu laterale.
        </p>
        <button onClick={this.handleRetry} className="glow-accent trans press-95 disp" style={{
          height: 48, padding: '0 24px', borderRadius: 13, border: 'none',
          background: 'var(--accent)', color: 'var(--accent-ink)',
          fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <RotateCcw size={18} strokeWidth={2.6} /> Riprova
        </button>
      </div>
    );
  }
}
