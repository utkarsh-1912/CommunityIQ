import React from 'react';
import { HelpCircle, LayoutDashboard, Globe } from 'lucide-react';

export default function NotFound({ currentCity, setPage }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      minHeight: '80%',
      animation: 'fade-up .4s ease'
    }}>
      <div className="panel" style={{
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        padding: '32px 24px',
        background: 'rgba(15, 23, 42, 0.4)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(245,158,11,.08)',
          border: '1px solid rgba(245,158,11,.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--amber)',
          margin: '0 auto 18px',
        }}>
          <HelpCircle size={28} style={{ animation: 'blink-dot 2.5s infinite' }}/>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          color: 'var(--amber)',
          fontFamily: 'var(--font-head)',
          lineHeight: 1,
          margin: '0 0 10px'
        }}>
          Sector 404
        </h1>
        <h3 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: 8 }}>Zone Offline / Not Found</h3>
        <p style={{ fontSize: '11px', color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          The requested administrative quadrant or routing directory is currently off-grid or has been decommissioned in the {currentCity?.name || 'city'} system database.
        </p>

        <button 
          onClick={() => setPage('overview')}
          className="emergency-btn trigger"
          style={{
            margin: '0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            fontSize: '11.5px',
            background: 'rgba(255,255,255,.03)',
            border: '1px solid var(--border)',
            color: 'var(--fg)'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--amber)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <LayoutDashboard size={13}/> Return to Command Cockpit
        </button>
      </div>
    </div>
  );
}
