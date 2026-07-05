import React from 'react';
import { ShieldAlert, ShieldAlert as LockIcon, LayoutDashboard } from 'lucide-react';

export default function AccessDenied({ role, setPage }) {
  const allowedPagesStr = role?.pages?.map(p => p.toUpperCase())?.join(', ') || 'NONE';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      minHeight: '80%',
      animation: 'fade-up .4s ease'
    }}>
      <div className="panel danger" style={{
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        padding: '32px 24px',
        background: 'rgba(244, 63, 94, 0.02)',
        borderColor: 'rgba(244, 63, 94, 0.25)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--rose)',
          margin: '0 auto 18px',
        }}>
          <ShieldAlert size={28} style={{ animation: 'blink-dot 1.5s infinite' }}/>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 900,
          color: 'var(--rose)',
          fontFamily: 'var(--font-head)',
          lineHeight: 1,
          margin: '0 0 10px',
          textTransform: 'uppercase',
          letterSpacing: '.04em'
        }}>
          Access Restricted
        </h1>
        <h3 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: 8 }}>Security Clearance Level 3 Needed</h3>
        <p style={{ fontSize: '11px', color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 20 }}>
          Your current session role (<strong style={{ color: role?.color }}>{role?.label || 'Unknown'}</strong>) is not authorized to access this quadrant directory. 
        </p>

        <div style={{
          background: 'rgba(0,0,0,.25)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '10px',
          color: 'var(--fg-muted)',
          marginBottom: 24,
          textAlign: 'left',
          lineHeight: 1.5
        }}>
          <span style={{ fontWeight: 700, color: 'var(--fg)', display: 'block', marginBottom: 3 }}>Authorized Quadrants:</span>
          {allowedPagesStr}
        </div>

        <button 
          onClick={() => setPage(role?.pages?.[0] || 'overview')}
          className="emergency-btn trigger"
          style={{
            margin: '0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            fontSize: '11.5px',
            background: 'rgba(244, 63, 94, 0.1)',
            borderColor: 'rgba(244, 63, 94, 0.3)',
            color: '#fff'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
        >
          <LayoutDashboard size={13}/> Redirect to Authorized Sector
        </button>
      </div>
    </div>
  );
}
