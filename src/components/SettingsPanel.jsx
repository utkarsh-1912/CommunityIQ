import React, { useRef, useEffect, useState } from 'react';
import { Settings, X, RefreshCw, Bell, Sliders, Moon, Globe, Database, Shield } from 'lucide-react';
import { ROLES } from '../config/roles';
import { CITIES } from '../services/liveData';

const REFRESH_OPTIONS = [
  { label: '1 minute',  value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes',value: 900 },
  { label: '30 minutes',value: 1800 },
];

const THRESHOLD_DEFS = [
  { key: 'aqi',     label: 'AQI Alert Threshold',         min: 50,  max: 300, step: 10, unit: 'AQI', color: 'var(--amber)' },
  { key: 'traffic', label: 'Traffic Alert Threshold',     min: 50,  max: 100, step: 5,  unit: '%',   color: 'var(--teal)' },
  { key: 'waste',   label: 'Waste Bin Alert Threshold',   min: 50,  max: 100, step: 5,  unit: '%',   color: 'var(--green)' },
  { key: 'power',   label: 'Power Load Alert Threshold',  min: 50,  max: 100, step: 5,  unit: '%',   color: 'var(--indigo)' },
  { key: 'flood',   label: 'Flood Risk Alert Threshold',  min: 10,  max: 100, step: 5,  unit: '%',   color: 'var(--sky)' },
];

export default function SettingsPanel({
  open, onClose, settings, onSave,
  cityId, roleId, onCityChange, onRoleChange,
  cities = CITIES
}) {
  const ref    = useRef(null);
  const [local, setLocal] = useState(settings);

  // Sync local state when panel opens or settings change externally
  useEffect(() => { setLocal(settings); }, [settings, open]);

  useEffect(() => {
    const handler = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => { onSave(local); onClose(); };

  return (
    <div ref={ref} className="side-panel" style={{ right: 0, width: 360 }}>
      {/* Header */}
      <div className="side-panel-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Settings size={15} style={{ color: 'var(--teal)' }}/>
          <span className="side-panel-title">Settings</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="panel-action-btn" onClick={handleSave}>Save</button>
          <button className="panel-close-btn" onClick={onClose}><X size={14}/></button>
        </div>
      </div>

      <div className="side-panel-body">

        {/* ── City & Role ── */}
        <div className="settings-section">
          <div className="settings-section-label"><Globe size={11}/>Location & Role</div>

          <div className="settings-field">
            <label className="settings-label">Active City</label>
            <select className="settings-select" value={cityId} onChange={e => onCityChange(e.target.value)}>
              {Object.values(cities).map(c => (
                <option key={c.id} value={c.id}>{c.flag} {c.name}, {c.country}</option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <label className="settings-label">Stakeholder Role</label>
            <select className="settings-select" value={roleId} onChange={e => onRoleChange(e.target.value)}>
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <label className="settings-label">Interface Theme</label>
            <select className="settings-select" value={local.theme || 'cyberpunk'} onChange={e => setLocal(p => ({ ...p, theme: e.target.value }))}>
              <option value="cyberpunk">🌌 Cyberpunk Dark</option>
              <option value="dark">🌑 Slate Dark</option>
              <option value="light">☀️ Soft Light</option>
              <option value="frost">❄️ Frost Light</option>
              <option value="matrix">📟 Matrix Green</option>
              <option value="dracula">🧛 Dracula Purple</option>
            </select>
          </div>
        </div>

        {/* ── Data Refresh ── */}
        <div className="settings-section">
          <div className="settings-section-label"><RefreshCw size={11}/>Data Refresh</div>
          <div className="settings-field">
            <label className="settings-label">API Refresh Interval</label>
            <div className="settings-radio-group">
              {REFRESH_OPTIONS.map(o => (
                <label key={o.value} className={`settings-radio-btn ${local.refreshInterval === o.value ? 'on' : ''}`}>
                  <input
                    type="radio" name="refresh" value={o.value}
                    checked={local.refreshInterval === o.value}
                    onChange={() => setLocal(p => ({ ...p, refreshInterval: o.value }))}
                    style={{ display: 'none' }}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Alert Thresholds ── */}
        <div className="settings-section">
          <div className="settings-section-label"><Bell size={11}/>Alert Thresholds</div>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 10, lineHeight: 1.5 }}>
            Alerts fire when any zone exceeds these values.
          </div>
          {THRESHOLD_DEFS.map(t => (
            <div key={t.key} className="settings-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <label className="settings-label" style={{ margin: 0 }}>{t.label}</label>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: t.color, fontFamily: 'var(--font-head)' }}>
                  {local.thresholds?.[t.key] ?? 100}{t.unit}
                </span>
              </div>
              <input
                type="range" min={t.min} max={t.max} step={t.step}
                value={local.thresholds?.[t.key] ?? 100}
                onChange={e => setLocal(p => ({
                  ...p,
                  thresholds: { ...p.thresholds, [t.key]: Number(e.target.value) }
                }))}
                style={{
                  background: `linear-gradient(to right, ${t.color} 0%, ${t.color} ${(((local.thresholds?.[t.key] ?? 100) - t.min) / (t.max - t.min)) * 100}%, rgba(255,255,255,.08) ${(((local.thresholds?.[t.key] ?? 100) - t.min) / (t.max - t.min)) * 100}%, rgba(255,255,255,.08) 100%)`
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Notifications ── */}
        <div className="settings-section">
          <div className="settings-section-label"><Bell size={11}/>Notifications</div>
          {[
            { key: 'notifyCritical',  label: 'Critical alert notifications' },
            { key: 'notifyWarning',   label: 'Warning alert notifications' },
            { key: 'notifyEmergency', label: 'Emergency flood/fire alerts' },
            { key: 'autoOpenAlert',   label: 'Auto-open alert panel on critical' },
          ].map(n => (
            <div key={n.key} className="settings-toggle-row">
              <span className="settings-label" style={{ margin: 0 }}>{n.label}</span>
              <div
                className={`settings-toggle ${local[n.key] ? 'on' : ''}`}
                onClick={() => setLocal(p => ({ ...p, [n.key]: !p[n.key] }))}
              >
                <div className="settings-toggle-knob"/>
              </div>
            </div>
          ))}
        </div>

        {/* ── Display ── */}
        <div className="settings-section">
          <div className="settings-section-label"><Sliders size={11}/>Display</div>
          {[
            { key: 'showAnimations',  label: 'Enable map animations' },
            { key: 'showHospitals',   label: 'Show hospital markers on map' },
            { key: 'compactMode',     label: 'Compact ward detail panel' },
          ].map(n => (
            <div key={n.key} className="settings-toggle-row">
              <span className="settings-label" style={{ margin: 0 }}>{n.label}</span>
              <div
                className={`settings-toggle ${local[n.key] ? 'on' : ''}`}
                onClick={() => setLocal(p => ({ ...p, [n.key]: !p[n.key] }))}
              >
                <div className="settings-toggle-knob"/>
              </div>
            </div>
          ))}
        </div>

        {/* ── About ── */}
        <div className="settings-section" style={{ borderBottom: 'none' }}>
          <div className="settings-section-label"><Shield size={11}/>About</div>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', lineHeight: 1.7 }}>
            <div>CommunityIQ City OS Platform</div>
            <div style={{ marginTop: 6 }}>Data: Open-Meteo, WAQI.info</div>
          </div>
        </div>
      </div>
    </div>
  );
}
