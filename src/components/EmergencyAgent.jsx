import React, { useMemo } from 'react';
import { ShieldAlert, Terminal, Play, CheckCircle, AlertTriangle, Clock, Zap, Droplets, Wind } from 'lucide-react';

// Derive incident level (1–5) from flood risk score
function getIncidentLevel(floodRisk, rainfall) {
  const combined = (floodRisk * 0.7) + (rainfall * 0.3);
  if (combined >= 80) return 5;
  if (combined >= 65) return 4;
  if (combined >= 45) return 3;
  if (combined >= 25) return 2;
  return 1;
}

const LEVEL_META = {
  1: { label: 'Advisory',    color: 'var(--green)',  bg: 'rgba(16,185,129,.08)',  border: 'rgba(16,185,129,.2)' },
  2: { label: 'Watch',       color: '#a3e635',        bg: 'rgba(163,230,53,.08)',  border: 'rgba(163,230,53,.2)' },
  3: { label: 'Warning',     color: 'var(--amber)',  bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.2)' },
  4: { label: 'Severe',      color: '#f97316',        bg: 'rgba(249,115,22,.08)',  border: 'rgba(249,115,22,.2)' },
  5: { label: 'Critical',    color: 'var(--rose)',   bg: 'rgba(239,68,68,.1)',    border: 'rgba(239,68,68,.3)'  },
};

export default function EmergencyAgent({
  emergency, triggerEmergency,
  emiStep, mitigations, triggerMitigations,
  weather, wards, sim
}) {
  // Find the highest-risk ward dynamically
  const wardList = useMemo(() => Object.entries(wards || {}), [wards]);

  const worstWard = useMemo(() => {
    if (!wardList.length) return null;
    return wardList.reduce((worst, [id, w]) =>
      (w.floodRisk > (worst?.[1]?.floodRisk ?? -1) ? [id, w] : worst), null
    );
  }, [wardList]);

  const worstWardName = worstWard?.[1]?.name?.split('—')[0]?.trim() ?? 'Zone A';
  const worstFlood    = Math.round(worstWard?.[1]?.floodRisk ?? 0);
  const worstAqi      = Math.round(worstWard?.[1]?.aqi ?? 0);
  const worstTraffic  = Math.round(worstWard?.[1]?.traffic ?? 0);

  const rainfall    = sim?.rainfall ?? weather?.precipitation ?? 0;
  const precip24h   = weather?.totalPrecip24h?.toFixed(1) ?? (rainfall * 0.8).toFixed(1);
  const probPct     = weather?.next24hPrecipProb ?? Math.min(99, Math.round(rainfall * 1.1));
  const incidentLevel = getIncidentLevel(worstFlood, rainfall);
  const meta          = LEVEL_META[incidentLevel];

  // Dynamic recommended actions based on worst ward
  const ACTIONS = useMemo(() => [
    {
      label: `Deploy ${incidentLevel >= 4 ? '6' : '3'} water pumps to ${worstWardName}`,
      step: 1, done: 'Operational', doing: 'Deploying...',
    },
    {
      label: `SMS alert to residents in ${worstWardName} sector`,
      step: 2, done: 'Broadcast sent', doing: 'Sending...',
    },
    {
      label: `Reroute transit via alternate corridors`,
      step: 3, done: 'Rerouted', doing: 'Updating...',
    },
    ...(incidentLevel >= 4 ? [{
      label: `Activate emergency shelters in low-risk wards`,
      step: 4, done: 'Activated', doing: 'Coordinating...',
    }] : []),
  ], [incidentLevel, worstWardName]);

  const now = new Date().toLocaleTimeString();

  return (
    <div className={`panel ${emergency ? (mitigations ? 'teal' : 'danger') : ''}`}>
      <div className="panel-head">
        <div className="panel-head-left">
          <ShieldAlert size={14} style={{ color: emergency ? meta.color : 'var(--teal)' }}/>
          <span className="panel-head-title" style={{ color: emergency ? meta.color : 'var(--fg)' }}>
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

            {/* Live telemetry preview even in standby */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '14px 0', textAlign: 'left' }}>
              {[
                { icon: <Droplets size={12}/>, label: 'Flood Risk', value: `${worstFlood}%`, ward: worstWardName, color: worstFlood > 50 ? 'var(--rose)' : 'var(--teal)' },
                { icon: <Wind size={12}/>,     label: 'AQI Peak',   value: worstAqi,          ward: worstWardName, color: worstAqi > 150 ? 'var(--amber)' : 'var(--green)' },
                { icon: <Zap size={12}/>,      label: 'Traffic',    value: `${worstTraffic}%`, ward: worstWardName, color: worstTraffic > 70 ? 'var(--amber)' : 'var(--fg-muted)' },
              ].map(({ icon, label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fg-muted)', fontSize: 9.5, marginBottom: 4 }}>
                    {icon} {label}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-head)', color }}>{value}</div>
                  <div style={{ fontSize: 9, color: 'var(--fg-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{worstWardName}</div>
                </div>
              ))}
            </div>

            {weather && (
              <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                Precipitation forecast: <strong style={{ color: 'var(--sky)' }}>{precip24h} mm</strong> in 24h &nbsp;·&nbsp;
                Rain probability: <strong style={{ color: probPct > 60 ? 'var(--amber)' : 'var(--green)' }}>{probPct}%</strong>
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
            {/* Dynamic Incident Card */}
            <div className="incident-card" style={{ borderColor: meta.border, background: meta.bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {/* Dynamic level badge */}
                    <span style={{
                      background: meta.bg,
                      border: `1px solid ${meta.border}`,
                      color: meta.color,
                      fontWeight: 800,
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 99,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}>
                      LEVEL {incidentLevel} — {meta.label}
                    </span>
                  </div>
                  <div className="inc-title" style={{ color: meta.color }}>
                    Flood Risk Incident — {worstWardName}
                  </div>
                  <div className="inc-desc">
                    {precip24h}mm precipitation expected. Drainage capacity at{' '}
                    <strong style={{ color: meta.color }}>{worstFlood}%</strong> threshold in {worstWardName}.
                    {incidentLevel >= 4 && ' Immediate evacuation protocols may be required.'}
                  </div>
                </div>
                {/* Live level gauge */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-head)', color: meta.color, lineHeight: 1 }}>
                    {incidentLevel}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    of 5
                  </div>
                  {/* Mini level bar */}
                  <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                    {[1,2,3,4,5].map(l => (
                      <div key={l} style={{
                        width: 6, height: 14, borderRadius: 2,
                        background: l <= incidentLevel ? meta.color : 'rgba(255,255,255,.08)',
                        transition: 'background .4s',
                      }}/>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live telemetry log */}
            <div style={{ background: 'rgba(0,0,0,.3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
              <div className="agent-log-title">
                <Terminal size={10}/> Live Incident Telemetry
              </div>
              <div className="tl-wrap">
                <div className="tl-line gray">[{now}] Weather Station: Rainfall {rainfall}mm/hr — {worstWardName} coastal nodes</div>
                <div className="tl-line gray">[{now}] AQI Sensor: {worstAqi} AQI in {worstWardName} — {worstAqi > 150 ? '⚠ Unhealthy' : 'Moderate'}</div>
                <div className="tl-line warn">[{now}] Predictor Agent: Drainage capacity at {Math.min(99, worstFlood + 10)}% threshold → Level {incidentLevel} confirmed</div>
                {mitigations && (<>
                  <div className="tl-line ok">[{now}] Emergency Agent: Pump array deployed at {worstWardName}</div>
                  <div className="tl-line ok">[{now}] Citizen Agent: SMS broadcast dispatched to sector residents</div>
                  <div className="tl-line ok">[{now}] Transit Agent: Alternate corridor activated</div>
                  {incidentLevel >= 4 && <div className="tl-line ok">[{now}] Shelter Agent: Emergency facilities activated</div>}
                </>)}
              </div>
            </div>

            {/* AI Recommended Actions */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--fg-muted)', marginBottom: 8 }}>
                AI Recommended Actions ({ACTIONS.length})
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
                <ShieldAlert size={15}/> Authorize {ACTIONS.length} Recommended Mitigations
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
                {emiStep >= ACTIONS.length
                  ? 'All mitigations executed — situation stabilizing'
                  : `Executing ${emiStep} / ${ACTIONS.length} workflows...`}
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
