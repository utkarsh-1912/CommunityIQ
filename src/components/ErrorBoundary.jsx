import React from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, Terminal } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#04060f',
          color: 'var(--fg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'var(--font-sans)',
        }}>
          <div className="panel danger" style={{
            maxWidth: '650px',
            width: '100%',
            background: 'rgba(13, 17, 34, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 30px rgba(244, 63, 94, 0.05)',
            padding: '32px',
            borderRadius: '12px',
            animation: 'slide-in .3s ease-out',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: 'rgba(244,63,94,.1)',
                border: '1px solid rgba(244,63,94,.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--rose)'
              }}>
                <ShieldAlert size={24} style={{ animation: 'blink-dot 1.5s infinite' }}/>
              </div>
              <div>
                <h1 style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-head)',
                  color: 'var(--rose)',
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  margin: 0
                }}>
                  Platform Exception Intercepted
                </h1>
                <p style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: 4 }}>
                  CommunityIQ core runtime caught an unhandled component rendering error.
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div style={{
              background: 'rgba(0,0,0,.35)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11.5px', fontWeight: 700, color: 'var(--rose)' }}>
                <AlertTriangle size={13}/>
                {this.state.error && this.state.error.toString()}
              </div>
              
              {this.state.errorInfo && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div style={{ fontSize: '10px', color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                    <Terminal size={10}/> Component Stack Trace
                  </div>
                  <pre style={{
                    fontSize: '10px',
                    color: 'var(--fg-muted)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    lineHeight: 1.5
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            {/* Recovery actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="emergency-btn trigger" 
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)', color: 'var(--fg)' }}
              >
                Attempt Recovery
              </button>
              <button 
                onClick={this.handleReset}
                className="emergency-btn trigger"
                style={{ background: 'var(--rose)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={13}/> Cold Boot (Reset Session)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
