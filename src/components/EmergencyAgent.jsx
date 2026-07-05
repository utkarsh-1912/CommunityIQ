import React from 'react';
import { ShieldAlert, Terminal, Play, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const ACTIONS = [
  { label: 'Deploy 3 water pumps to Beach Road',      step: 1, done: 'Operational', doing: 'Deploying...' },
  { label: 'SMS alert to 64,000 Ward 8 residents',   step: 2, done: 'Broadcast sent', doing: 'Sending...' },
  { label: 'Reroute Transit lines 14B via High St.',  step: 3, done: 'Rerouted',   doing: 'Updating...' },
];

export default function EmergencyAgent({
  emergency, triggerEmergency,
  emiStep, mitigations, triggerMitigations,
  weather, wards
}) {
  const coastalRisk = wards?.['Ward 8']?.floodRisk ?? 0;
  const precip24h   = weather?.totalPrecip24h?.toFixed(1) ?? '—';
  const probPct     = weather?.next24hPrecipProb ?? 0;

  return (
    <div className={`panel ${emergency ? (mitigations ? 'teal' : 'danger') : ''}`}>
      <div className="panel-head">
        <div className="panel-head-left">
          <ShieldAlert size={14} style={{ color: emergency ? 'var(--rose)' : 'var(--teal)' }}/>
          <span className="panel-head-title" style={{ color: emergency ? 'var(--rose)' : 'var(--fg)' }}>
            Emergency Response Agent
          </span>
        </div>
        <span className={`badge ${emergency ? 'alert' : 'ok'}`}>
          <span className="dot"/>
          {emergency ? 'Active Incident' : 'Monitoring'}
        </span>
      </div>

      <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!emergency ? (
          // ── Standby ──
          <div style={{ textAlign: 'center', padding: '28px 10px' }}>
            <AlertTriangle size={34} style={{ color: 'var(--amber)', margin: '0 auto 12px', opacity: .6 }}/>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>Monitoring Mode — No Active Incident</h4>
            {weather && (
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                Precipitation forecast: <strong style={{ color: 'var(--sky)' }}>{precip24h} mm</strong> in 24h<br/>
                Rain probability: <strong style={{ color: probPct > 60 ? 'var(--amber)' : 'var(--green)' }}>{probPct}%</strong><br/>
                Ward 8 flood index: <strong style={{ color: coastalRisk > 50 ? 'var(--rose)' : 'var(--teal)' }}>{coastalRisk}/100</strong>
              </div>
            )}
            <p style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 18 }}>
              Trigger a drill to test multi-agent response, real-time telemetry processing, and automated action dispatch.
            </p>
            <button className="emergency-btn trigger" onClick={triggerEmergency} style={{ width: '100%' }}>
              <Play size={14}/> Trigger Flood Risk Scenario
            </button>
          </div>
        ) : (
          // ── Active ──
          <>
            {/* Incident Card */}
            <div className="incident-card">
              <AlertTriangle size={22} className="inc-icon" style={{ animation: 'blink-dot 1.2s ease-in-out infinite', flexShrink: 0 }}/>
              <div>
                <div className="inc-title">Incident Level 3 — Flood Risk (Ward 8)</div>
                <div className="inc-desc">
                  {precip24h}mm precipitation expected. Drainage capacity forecast at {coastalRisk}% threshold.
                  Coastal sectors experiencing rapid water accumulation.
                </div>
              </div>
            </div>

            {/* Live telemetry log */}
            <div style={{ background: 'rgba(0,0,0,.3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
              <div className="agent-log-title">
                <Terminal size={10}/> Live Incident Telemetry
              </div>
              <div className="tl-wrap">
                <div className="tl-line gray">[{new Date().toLocaleTimeString()}] Weather Station: Rainfall exceeds {weather?.precipitation ?? 0}mm/hr at coastal nodes</div>
                <div className="tl-line gray">[{new Date().toLocaleTimeString()}] Citizen Complaints: #{Math.round(100 + Math.random()*20)} — blocked drains at Beach Rd</div>
                <div className="tl-line warn">[{new Date().toLocaleTimeString()}] Predictor Agent: Drainage capacity at {Math.min(99, 80 + coastalRisk)}% threshold</div>
                {mitigations && (<>
                  <div className="tl-line ok">[{new Date().toLocaleTimeString()}] Emergency Agent: Pump array deployed at Beach Road</div>
                  <div className="tl-line ok">[{new Date().toLocaleTimeString()}] Citizen Agent: SMS broadcast to 64,000 residents dispatched</div>
                  <div className="tl-line ok">[{new Date().toLocaleTimeString()}] Transit Agent: Route 14B rerouted via High Street</div>
                </>)}
              </div>
            </div>

            {/* Actions */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--fg-muted)', marginBottom: 8 }}>
                AI Recommended Actions
              </div>
              <div className="action-list">
                {ACTIONS.map(a => {
                  const isDone    = emiStep >= a.step;
                  const isRunning = !isDone && mitigations && emiStep === a.step - 1;
                  return (
                    <div key={a.label} className={`action-row ${isDone ? 'done' : isRunning ? 'running' : ''}`}>
                      <input type="checkbox" readOnly checked={isDone} style={{ accentColor: 'var(--green)', flexShrink: 0 }}/>
                      <span className="action-name">{a.label}</span>
                      <span className="action-status">
                        {isDone ? a.done : isRunning ? a.doing : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Authorization / progress */}
            {!mitigations ? (
              <button className="emergency-btn auth" onClick={triggerMitigations} style={{ width: '100%' }}>
                <ShieldAlert size={15}/> Authorize Recommended Mitigations
              </button>
            ) : (
              <div style={{
                background: 'rgba(16,185,129,.05)',
                border: '1px solid rgba(16,185,129,.2)',
                borderRadius: 8, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'var(--green)', fontSize: 12, fontWeight: 700
              }}>
                <CheckCircle size={18}/>
                {emiStep >= 3 ? 'All mitigations executed — situation stabilizing' : 'Executing workflows...'}
              </div>
            )}

            <button
              onClick={triggerEmergency}
              style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', fontSize: 11, textDecoration: 'underline', cursor: 'pointer', textAlign: 'center' }}
            >
              Reset Emergency Scenario
            </button>
          </>
        )}
      </div>
    </div>
  );
}
