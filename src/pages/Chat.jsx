import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Panel from '../components/ui/Panel';
import { getChat, getMe, getGroup } from '../api/mock';

function EventIcon({ name }) {
  const Comp = LucideIcons[name];
  return Comp ? <Comp size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} /> : null;
}

export default function Chat() {
  const [msgs, setMsgs] = useState([]);
  const [me, setMe] = useState(null);
  const [group, setGroup] = useState(null);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    getChat().then(setMsgs);
    getMe().then(setMe);
    getGroup().then(setGroup);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = () => {
    if (!draft.trim() || !me) return;
    setMsgs(m => [...m, { id: Date.now(), who: me, mine: true, text: draft.trim(), t: 'ora' }]);
    setDraft('');
  };

  if (!me) return null;

  return (
    <div className="screen-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
          {group?.members ?? '…'} giocatori · 5 online
        </div>
        <h1 className="disp disp-tight" style={{ fontSize: 52, fontWeight: 700, lineHeight: 0.82, textTransform: 'uppercase', margin: 0 }}>Chat di gruppo</h1>
      </div>

      <Panel style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {/* Messages */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {msgs.map(m => {
            if (m.type === 'event') {
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 16px',
                    borderRadius: 999, background: 'rgba(255,90,31,0.1)', border: '1px solid rgba(255,90,31,0.22)',
                  }}>
                    <EventIcon name={m.icon} />
                    <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{m.text}</span>
                  </div>
                </div>
              );
            }
            const mine = m.mine;
            return (
              <div key={m.id} style={{ display: 'flex', gap: 12, flexDirection: mine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {!mine && <Avatar player={m.who} size={36} />}
                <div style={{ maxWidth: '60%' }}>
                  {!mine && <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4, marginLeft: 2 }}>{m.who.name.split(' ')[0]}</div>}
                  <div style={{
                    padding: '11px 16px',
                    borderRadius: mine ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                    background: mine ? 'var(--accent)' : 'var(--surface-2)',
                    color: mine ? 'var(--accent-ink)' : 'var(--txt)',
                    fontSize: 15, lineHeight: 1.4, fontWeight: mine ? 600 : 500,
                  }}>{m.text}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--dim)', marginTop: 4, textAlign: mine ? 'right' : 'left', padding: '0 4px' }}>{m.t}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Scrivi un messaggio al gruppo…"
            style={{
              flex: 1, height: 50, borderRadius: 14, border: '1px solid var(--line)',
              background: 'var(--bg-2)', color: 'var(--txt)', padding: '0 18px',
              fontSize: 15, fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button onClick={send} className="glow-accent trans press-95" style={{
            width: 50, height: 50, borderRadius: 14, border: 'none',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}>
            <Send size={22} />
          </button>
        </div>
      </Panel>
    </div>
  );
}
