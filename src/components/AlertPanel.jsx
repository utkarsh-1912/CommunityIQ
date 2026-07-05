import React, { useRef, useEffect } from 'react';
import {
  Bell, X, ShieldAlert, Wind, Activity, Zap, Trash2,
  Droplets, CheckCheck, Trash, AlertTriangle, Info, ArrowRight
} from 'lucide-react';

const SEVERITY_META = {
  critical: { color: 'var(--rose)',  bg: 'rgba(244,63,94,.07)',  border: 'rgba(244,63,94,.22)',  icon: <ShieldAlert size={14}/>, label: 'Critical' },
  warning:  { color: 'var(--amber)', bg: 'rgba(245,158,11,.07)', border: 'rgba(245,158,11,.22)', icon: <AlertTriangle size={14}/>, label: 'Warning' },
  info:     { color: 'var(--sky)',   bg: 'rgba(14,165,233,.06)', border: 'rgba(14,165,233,.18)', icon: <Info size={14}/>, label: 'Info' },
};

const METRIC_ICON = {
  aqi:       <Wind size={13}/>,
  traffic:   <Activity size={13}/>,
  power:     <Zap size={13}/>,
  waste:     <Trash2 size={13}/>,
  flood:     <Droplets size={13}/>,
  emergency: <ShieldAlert size={13}/>,
};

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60)  return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function AlertPanel({
  open, onClose, alerts, onMarkRead, onClearAll, onNavigate, unreadCount
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const criticals = alerts.filter(a => a.severity === 'critical');
  const warnings  = alerts.filter(a => a.severity === 'warning');
  const infos     = alerts.filter(a => a.severity === 'info');
  const unread    = alerts.filter(a => !a.read);

  return (
    <div ref={ref} className="side-panel" style={{ right: 0 }}>
      {/* Header */}
      <div className="side-panel-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Bell size={15} style={{ color: 'var(--amber)' }}/>
          <span className="side-panel-title">Alert Center</span>
          {unreadCount > 0 && (
            <span className="alert-count-badge">{unreadCount}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {unread.length > 0 && (
            <button className="panel-action-btn" onClick={() => alerts.forEach(a => onMarkRead(a.id))} title="Mark all read">
              <CheckCheck size={13}/> All read
            </button>
          )}
          {alerts.length > 0 && (
            <button className="panel-action-btn danger" onClick={onClearAll} title="Clear all">
              <Trash size={13}/>
            </button>
          )}
          <button className="panel-close-btn" onClick={onClose}><X size={14}/></button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="alert-summary-strip">
        <div className="alert-summary-item">
          <span style={{ color: 'var(--rose)', fontWeight: 800 }}>{criticals.length}</span>
          <span>Critical</span>
        </div>
        <div className="alert-summary-sep"/>
        <div className="alert-summary-item">
          <span style={{ color: 'var(--amber)', fontWeight: 800 }}>{warnings.length}</span>
          <span>Warnings</span>
        </div>
        <div className="alert-summary-sep"/>
        <div className="alert-summary-item">
          <span style={{ color: 'var(--sky)', fontWeight: 800 }}>{infos.length}</span>
          <span>Info</span>
        </div>
      </div>

      {/* Alert list */}
      <div className="side-panel-body">
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--fg-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 12px', opacity: .3 }}/>
            <div style={{ fontWeight: 600 }}>All clear</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>No active alerts at this time</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {alerts.map(alert => {
              const meta = SEVERITY_META[alert.severity] || SEVERITY_META.info;
              return (
                <div
                  key={alert.id}
                  className={`alert-item ${!alert.read ? 'unread' : ''}`}
                  style={{ background: meta.bg, borderColor: meta.border }}
                  onClick={() => {
                    onMarkRead(alert.id);
                    if (alert.action?.page) onNavigate(alert.action.page, alert.action.ward);
                    onClose();
                  }}
                >
                  <div className="alert-item-icon" style={{ color: meta.color, background: `${meta.color}14`, borderColor: `${meta.color}25` }}>
                    {METRIC_ICON[alert.metric] || meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="alert-item-title">
                      {!alert.read && <span className="alert-unread-dot"/>}
                      {alert.title}
                    </div>
                    <div className="alert-item-desc">{alert.desc}</div>
                    <div className="alert-item-meta">
                      <span className="alert-severity-pill" style={{ color: meta.color, background: `${meta.color}14`, borderColor: `${meta.color}25` }}>
                        {meta.label}
                      </span>
                      {alert.zoneName && <span>{alert.zoneName}</span>}
                      <span style={{ marginLeft: 'auto' }}>{timeAgo(alert.ts)}</span>
                    </div>
                  </div>
                  {alert.action?.page && (
                    <ArrowRight size={12} style={{ color: 'var(--fg-muted)', flexShrink: 0, alignSelf: 'center' }}/>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
