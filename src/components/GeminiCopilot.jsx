import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Send, Bot, Cpu, Terminal, Maximize2, X } from 'lucide-react';

const PRESETS = [
  'Which areas have traffic congestion?',
  'Flood risk for coastal wards?',
  'Why is electricity high in Ward 12?',
  'Air quality status across city?',
  'Where to deploy waste vehicles?',
];

function CopilotChatContent({ messages, submit, typing, logs, input, setInput, bottomRef, setLayer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}>
      {/* Preset chips */}
      <div className="chip-row" style={{ marginBottom: '12px' }}>
        {PRESETS.map(p => (
          <button key={p} className="chip" onClick={() => submit(p)}>{p}</button>
        ))}
      </div>

      {/* Agent log (visible while typing) */}
      {typing && logs.length > 0 && (
        <div className="agent-log" style={{ marginBottom: 12 }}>
          <div className="agent-log-title"><Terminal size={9}/>Agent reasoning chain</div>
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}

      {/* Messages */}
      <div className="chat-log" style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginBottom: '12px', paddingRight: '4px' }}>
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.sender === 'user' ? 'user' : 'bot'}`}>
            <div className="bubble-meta">
              {m.sender === 'user' ? '👤 You' : <><Cpu size={9}/> Gemini</>}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{m.text}</div>
            {m.action && (
              <button
                className="bubble-action"
                onClick={() => {
                  if (m.action.layer) setLayer(m.action.layer);
                  if (m.action.fn) m.action.fn();
                }}
              >
                {m.action.label}
              </button>
            )}
          </div>
        ))}
        {typing && (
          <div className="bubble bot">
            <div className="bubble-meta"><Cpu size={9}/> Gemini</div>
            <div className="typing-wrap">
              <div className="typing-dot"/>
              <div className="typing-dot"/>
              <div className="typing-dot"/>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        <input
          type="text"
          className="chat-input"
          placeholder="Ask Copilot (e.g. 'how to resolve the Saddar power outage?')..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          disabled={typing}
          style={{ flex: 1 }}
        />
        <button className="chat-send-btn" onClick={() => submit()} disabled={typing || !input.trim()}>
          <Send size={12}/>
        </button>
      </div>
    </div>
  );
}

export default function GeminiCopilot({ messages, sendMessage, setLayer, setWard }) {
  const [input,    setInput]    = useState('');
  const [typing,   setTyping]   = useState(false);
  const [logs,     setLogs]     = useState([]);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, expanded]);

  const submit = (text) => {
    const t = (text || input).trim();
    if (!t || typing) return;
    setInput('');
    sendMessage(t, setTyping, setLogs);
  };

  const chatProps = { messages, submit, typing, logs, input, setInput, bottomRef, setLayer };

  return (
    <div className="panel" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-head">
        <div className="panel-head-left">
          <Bot size={13} className="panel-head-icon" style={{ color: 'var(--indigo)' }}/>
          <span className="panel-head-title">Gemini Copilot</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge ok"><span className="dot"/>ADK Connected</span>
          <button
            onClick={() => setExpanded(true)}
            title="Expand chat"
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fg-muted)', padding: '2px' }}
          >
            <Maximize2 size={13}/>
          </button>
        </div>
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <CopilotChatContent {...chatProps} />
      </div>

      {expanded && createPortal(
        <div className="modal-backdrop" onClick={() => setExpanded(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', height: '80vh' }}>
            <div className="modal-head">
              <div className="modal-title">
                <Bot size={16} color="var(--indigo)"/>
                Gemini Copilot — Full Assistant Console
              </div>
              <button className="modal-close-btn" onClick={() => setExpanded(false)}>
                <X size={16}/>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', justifyContent: 'center', height: '100%', overflow: 'hidden', padding: '16px 24px 24px' }}>
              <div style={{ maxWidth: '650px', width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CopilotChatContent {...chatProps} />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
