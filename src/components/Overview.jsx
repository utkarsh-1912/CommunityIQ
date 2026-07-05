import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity, AlertTriangle, ShieldCheck, Database, Cpu, ArrowUpRight,
  Wind, Thermometer, Droplets, Cloud, HeartPulse, GraduationCap,
  Briefcase, Users, Building2, Bus, ShieldAlert, Maximize2, X
} from 'lucide-react';
import { WMO_DESC } from '../services/liveData';

function AqiMeta(aqi) {
  if (aqi <= 50)  return { label: 'Good',            color: 'var(--green)' };
  if (aqi <= 100) return { label: 'Moderate',         color: 'var(--amber)' };
  if (aqi <= 150) return { label: 'Unhealthy (Sens)', color: 'var(--amber)' };
  if (aqi <= 200) return { label: 'Unhealthy',         color: 'var(--rose)' };
  return               { label: 'Very Unhealthy',      color: 'var(--rose)' };
}

function ProgressBar({ value, color = 'var(--teal)', height = 5 }) {
  return (
    <div className="prog-track" style={{ height }}>
      <div className="prog-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}/>
    </div>
  );
}

// ─── Modal Backdrop & Card ────────────────────────────────────────────────────
function Modal({ title, icon, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            {icon}
            {title}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16}/>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Expanded comparative zones list ──────────────────────────────────────────
function ExpandedZonesView({ wards, city }) {
  const [search, setSearch] = useState('');

  const filteredWards = Object.entries(wards).filter(([id, w]) => {
    const nameMatch = w.name?.toLowerCase().includes(search.toLowerCase());
    const idMatch = id.toLowerCase().includes(search.toLowerCase());
    const boundaryMatch = (city?.wards?.[id]?.area || '').toLowerCase().includes(search.toLowerCase());
    return nameMatch || idMatch || boundaryMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
            Showing {filteredWards.length} of {Object.keys(wards).length} zones matching search criteria
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '260px' }}>
          <input
            type="text"
            placeholder="Search ward or area..."
            className="chat-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '11.5px', height: '30px' }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: 'var(--fg)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', textAlign: 'left', color: 'var(--fg-muted)' }}>
              <th style={{ padding: '12px 14px' }}>Zone / Ward</th>
              <th style={{ padding: '12px 10px' }}>Area Boundary</th>
              <th style={{ padding: '12px 10px' }}>Population</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Traffic</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>AQI</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Power Load</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Flood Risk</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Waste Level</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Hospitals</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Schools</th>
            </tr>
          </thead>
          <tbody>
            {filteredWards.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: '24px', textAlign: 'center', color: 'var(--fg-muted)' }}>
                  No zones match your search query.
                </td>
              </tr>
            ) : (
              filteredWards.map(([id, w]) => {
                const cfg = city?.wards?.[id] || {};
                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{w.name}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--fg-muted)' }}>{cfg.area || '—'}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--fg-muted)' }}>{cfg.population || '—'}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span className={`badge ${w.traffic > 80 ? 'alert' : w.traffic > 60 ? 'warn' : 'ok'}`}>
                        {w.traffic}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span className={`badge ${w.aqi > 150 ? 'alert' : w.aqi > 100 ? 'warn' : 'ok'}`}>
                        {Math.round(w.aqi)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span className={`badge ${w.electricityLoad > 85 ? 'alert' : w.electricityLoad > 65 ? 'warn' : 'ok'}`}>
                        {w.electricityLoad}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span className={`badge ${w.floodRisk > 60 ? 'alert' : w.floodRisk > 30 ? 'warn' : 'ok'}`}>
                        {w.floodRisk}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span className={`badge ${w.wasteLevel > 80 ? 'alert' : w.wasteLevel > 60 ? 'warn' : 'ok'}`}>
                        {Math.round(w.wasteLevel)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600 }}>{cfg.hospitals || 0}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600 }}>{cfg.schools || 0}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Expanded Alerts logs ─────────────────────────────────────────────────────
function ExpandedAlertsView({ alerts, city }) {
  const [checklist, setChecklist] = useState([
    { id: 1, done: true, text: 'Confirm IoT grid telemetry streams are nominal' },
    { id: 2, done: alerts.length === 0, text: 'Resolve active critical warnings and threshold violations' },
    { id: 3, done: false, text: 'Coordinate with local NGO resources for evacuation logistics' },
    { id: 4, done: false, text: 'Publish public advisory safety notice on sentiment feed' },
  ]);

  const toggleCheckItem = (id) => {
    setChecklist(p => p.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      {/* Active Alerts List */}
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--rose)' }}>
          <ShieldAlert size={14}/>
          Active Incidents log ({alerts.length})
        </h4>
        {alerts.length === 0 ? (
          <div style={{ padding: '36px 24px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center', color: 'var(--fg-muted)' }}>
            No active incidents reported. All city sectors nominal.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '6px' }}>
            {alerts.map(a => (
              <div key={a.id} style={{
                padding: '14px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${a.severity === 'critical' ? 'var(--rose)' : 'var(--amber)'}`,
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--fg)' }}>{a.title}</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold' }} className={`badge ${a.severity === 'critical' ? 'alert' : 'warn'}`}>
                    {a.severity.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--fg-muted)', lineHeight: 1.4 }}>{a.desc}</p>
                {a.zoneName && (
                  <div style={{ fontSize: '9.5px', color: 'var(--teal)', marginTop: '6px', fontWeight: 600 }}>
                    📍 {a.zoneName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Response checklist & resources */}
      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--teal)' }}>
          <Activity size={14}/>
          Emergency Responder Dispatch & Status
        </h4>
        
        {/* Responder status bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: '🚑 Medical Dispatch Units', status: 'Deployed (2 active)', color: 'var(--rose)', pct: 100 },
            { label: '🚒 Drainage / Flood Rescue', status: 'Standby (4 teams)', color: 'var(--amber)', pct: 60 },
            { label: '⚡ Utility Grid Engineers', status: 'Active load-shaving', color: 'var(--teal)', pct: 85 },
            { label: '🚮 Waste Disposal Vehicles', status: 'Routing (3 units)', color: 'var(--teal)', pct: 75 },
          ].map(r => (
            <div key={r.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{r.label}</span>
                <span style={{ color: r.color, fontSize: '10px', fontWeight: 700 }}>{r.status}</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: '3px' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Operational Checklist */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px', color: 'var(--fg)' }}>Incident Commander Mitigation Checklist</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11.5px' }}>
            {checklist.map((c) => (
              <div
                key={c.id}
                onClick={() => toggleCheckItem(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  color: c.done ? 'var(--fg-muted)' : 'var(--fg)',
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
              >
                <input
                  type="checkbox"
                  checked={c.done}
                  readOnly
                  style={{ accentColor: 'var(--teal)', marginTop: '2px', cursor: 'pointer' }}
                />
                <span style={{ textDecoration: c.done ? 'line-through' : 'none', lineHeight: 1.3 }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Role-specific KPI set */
function RoleKPIs({ role, wards, city, weather, aqiData, emergency, sustainabilityScore }) {
  const wardList = Object.values(wards);
  const wardIds  = Object.keys(wards);

  // Aggregate city-wide infra stats
  const totalHospitals = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.hospitals || 0), 0);
  const totalSchools   = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.schools   || 0), 0);
  const totalBiz       = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.businesses || 0), 0);
  const totalNGOs      = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.ngoCount  || 0), 0);
  const avgTraffic     = Math.round(wardList.reduce((a, w) => a + w.traffic, 0) / wardList.length);
  const avgElec        = Math.round(wardList.reduce((a, w) => a + w.electricityLoad, 0) / wardList.length);
  const avgAqi         = Math.round(wardList.reduce((a, w) => a + w.aqi, 0) / wardList.length);

  const roleId = role?.id;

  if (roleId === 'health') {
    return (
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label"><HeartPulse size={12} color="var(--rose)"/>Total Hospitals</div>
          <div className="stat-value" style={{ color: 'var(--rose)' }}>{totalHospitals}</div>
          <div className="stat-sub">Across {wardIds.length} zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Wind size={12} color="var(--amber)"/>City AQI</div>
          <div className="stat-value" style={{ color: AqiMeta(avgAqi).color }}>{aqiData?.aqi ?? avgAqi}</div>
          <div className="stat-sub">{AqiMeta(aqiData?.aqi ?? avgAqi).label}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Users size={12} color="var(--green)"/>Active NGOs</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{totalNGOs}</div>
          <div className="stat-sub">Registered in all zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><ShieldCheck size={12} color="var(--teal)"/>Emergency Status</div>
          <div className="stat-value" style={{ color: emergency ? 'var(--rose)' : 'var(--green)' }}>
            {emergency ? 'Alert' : 'Clear'}
          </div>
          <div className="stat-sub">{emergency ? 'Active incident' : 'All zones nominal'}</div>
        </div>
      </div>
    );
  }

  if (roleId === 'education') {
    return (
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label"><GraduationCap size={12} color="#a78bfa"/>Total Schools</div>
          <div className="stat-value" style={{ color: '#a78bfa' }}>{totalSchools}</div>
          <div className="stat-sub">Across {wardIds.length} zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Wind size={12} color="var(--amber)"/>AQI Alert</div>
          <div className="stat-value" style={{ color: avgAqi > 100 ? 'var(--rose)' : 'var(--green)' }}>
            {avgAqi > 100 ? '⚠ High' : '✓ Safe'}
          </div>
          <div className="stat-sub">Outdoor activity advisory</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Activity size={12} color="var(--teal)"/>Transit Safety</div>
          <div className="stat-value" style={{ color: avgTraffic > 75 ? 'var(--amber)' : 'var(--green)' }}>
            {avgTraffic > 75 ? 'Disrupted' : 'Normal'}
          </div>
          <div className="stat-sub">Avg congestion: {avgTraffic}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Droplets size={12} color="var(--sky)"/>Flood Alert</div>
          <div className="stat-value" style={{ color: emergency ? 'var(--rose)' : 'var(--green)' }}>
            {emergency ? 'Active' : 'None'}
          </div>
          <div className="stat-sub">{emergency ? 'School closures advised' : 'Safe conditions'}</div>
        </div>
      </div>
    );
  }

  if (roleId === 'business') {
    return (
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label"><Briefcase size={12} color="var(--amber)"/>Businesses</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{totalBiz.toLocaleString()}</div>
          <div className="stat-sub">Registered city-wide</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Activity size={12} color="var(--teal)"/>Traffic Index</div>
          <div className="stat-value" style={{ color: avgTraffic > 75 ? 'var(--rose)' : 'var(--teal)' }}>{avgTraffic}%</div>
          <div className="stat-sub">Supply chain impact</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Droplets size={12} color="var(--indigo)"/>Grid Load</div>
          <div className="stat-value" style={{ color: avgElec > 80 ? 'var(--rose)' : 'var(--indigo)' }}>{avgElec}%</div>
          <div className="stat-sub">Brownout risk: {avgElec > 85 ? 'High' : avgElec > 70 ? 'Medium' : 'Low'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><ShieldCheck size={12} color="var(--green)"/>Green Score</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{sustainabilityScore}/100</div>
          <div className="stat-sub">ESG compliance index</div>
        </div>
      </div>
    );
  }

  if (roleId === 'citizen') {
    return (
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label"><Bus size={12} color="var(--teal)"/>Transit Status</div>
          <div className="stat-value" style={{ color: avgTraffic > 75 ? 'var(--rose)' : 'var(--green)' }}>
            {avgTraffic > 75 ? 'Congested' : 'Normal'}
          </div>
          <div className="stat-sub">{avgTraffic}% avg congestion</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Wind size={12} color="var(--amber)"/>Air Quality</div>
          <div className="stat-value" style={{ color: AqiMeta(aqiData?.aqi ?? avgAqi).color }}>{aqiData?.aqi ?? avgAqi}</div>
          <div className="stat-sub">{AqiMeta(aqiData?.aqi ?? avgAqi).label}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><AlertTriangle size={12} color="var(--amber)"/>Complaints Open</div>
          <div className="stat-value">{Object.values(wards).reduce((a, w) => a + w.complaints, 0)}</div>
          <div className="stat-sub">Across all zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><Droplets size={12} color="var(--sky)"/>Flood Warning</div>
          <div className="stat-value" style={{ color: emergency ? 'var(--rose)' : 'var(--green)' }}>
            {emergency ? 'Active' : 'None'}
          </div>
          <div className="stat-sub">{emergency ? 'Avoid coastal areas' : 'Safe conditions'}</div>
        </div>
      </div>
    );
  }

  // Default: City Admin view
  const { label: aqiLabel, color: aqiColor } = AqiMeta(aqiData?.aqi ?? avgAqi);
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-label"><Activity size={12} color="var(--teal)"/>System Health</div>
        <div className="stat-value" style={{ color: emergency ? 'var(--rose)' : 'var(--green)' }}>
          {emergency ? '78' : '98.4'}%
        </div>
        <div className="stat-sub">{emergency ? 'Incident response active' : 'All channels nominal'}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">
          <Wind size={12} color="var(--amber)"/>City AQI
          {aqiData && <span className="badge info" style={{ marginLeft: 4, padding: '1px 5px', fontSize: 8 }}>Live</span>}
        </div>
        <div className="stat-value" style={{ color: aqiColor }}>{aqiData?.aqi ?? avgAqi}</div>
        <div className="stat-sub">{aqiLabel} · {aqiData?.city ?? 'City avg'}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">
          <Thermometer size={12} color="var(--sky)"/>Temperature
          {weather && <span className="badge info" style={{ marginLeft: 4, padding: '1px 5px', fontSize: 8 }}>Live</span>}
        </div>
        <div className="stat-value" style={{ color: 'var(--sky)' }}>{weather?.temperature ?? '—'}°C</div>
        <div className="stat-sub">{WMO_DESC[weather?.weatherCode] ?? '—'} · {weather?.humidity ?? '—'}% RH</div>
      </div>
      <div className="stat-card">
        <div className="stat-label"><ShieldCheck size={12} color="var(--green)"/>Green Score</div>
        <div className="stat-value" style={{ color: 'var(--green)' }}>{sustainabilityScore}/100</div>
        <div className="stat-sub">CO₂ offsets + transit efficiency</div>
      </div>
    </div>
  );
}

export default function Overview({
  wards, city, weather, aqiData, emergency, sim,
  sustainabilityScore, setPage, apiLoading, apiError, role, alerts = []
}) {
  const [expanded, setExpanded] = useState(null);
  const wardIds  = Object.keys(wards);
  const wardList = Object.values(wards);
  const avgAqi   = useMemo(() => Math.round(wardList.reduce((a, w) => a + w.aqi, 0) / wardList.length), [wardList]);

  // Totals for city infra panel
  const totalHospitals = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.hospitals || 0), 0);
  const totalSchools   = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.schools   || 0), 0);
  const totalBiz       = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.businesses || 0), 0);
  const totalNGOs      = wardIds.reduce((a, id) => a + (city?.wards?.[id]?.ngoCount  || 0), 0);

  // Filters for displaying critical notifications
  const criticals = alerts.filter(a => a.severity === 'critical');
  const warnings  = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Emergency ticker */}
      {emergency && (
        <div className="ticker-wrap">
          <span className="ticker-tag">ALERT</span>
          <span className="ticker-scroll">
            INCIDENT LEVEL 3 — Coastal flood risk elevated in {city?.name}.
            Open-Meteo precipitation: {weather?.totalPrecip24h?.toFixed(1) ?? '—'}mm expected in 24h.
            Emergency protocols active — all responders on standby.
          </span>
        </div>
      )}

      {/* API source badges */}
      <div className="api-bar">
        {apiLoading ? (
          <span className="badge warn"><span className="dot"/>Fetching live data for {city?.name}...</span>
        ) : apiError ? (
          <span className="badge alert"><span className="dot"/>API Error — using simulated fallback</span>
        ) : (
          <>
            <span className="badge ok"><span className="dot"/>Open-Meteo Weather</span>
            <span className="badge ok"><span className="dot"/>WAQI Air Quality</span>
            <span className="badge info"><span className="dot"/>IoT Sensors Live</span>
            <span className="badge" style={{ color: role?.color, borderColor: `${role?.color}35` }}>
              <span className="dot" style={{ background: role?.color }}/>
              {role?.label} View
            </span>
          </>
        )}
      </div>

      {/* Role-specific KPIs */}
      <RoleKPIs
        role={role} wards={wards} city={city} weather={weather}
        aqiData={aqiData} emergency={emergency} sustainabilityScore={sustainabilityScore}
      />

      {/* City infrastructure summary + zone table */}
      <div className="overview-bottom">

        {/* Zone status table */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left">
              <Building2 size={13} className="panel-head-icon"/>
              <span className="panel-head-title">{city?.name} — Zone Status</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="badge info" onClick={() => setPage('twin')} style={{ cursor: 'pointer', gap: 4 }}>
                Open Twin <ArrowUpRight size={11}/>
              </button>
              <button 
                onClick={() => setExpanded('zones')}
                title="Expand section"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fg-muted)', padding: '2px' }}
              >
                <Maximize2 size={13}/>
              </button>
            </div>
          </div>
          <div className="panel-body">
            {/* City infrastructure summary strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16, padding: '10px', background: 'rgba(255,255,255,.015)', borderRadius: 8, border: '1px solid var(--border)' }}>
              {[
                { icon: <HeartPulse size={11} color="var(--rose)"/>, val: totalHospitals,         label: 'Hospitals' },
                { icon: <GraduationCap size={11} color="#a78bfa"/>,  val: totalSchools,            label: 'Schools' },
                { icon: <Briefcase size={11} color="var(--amber)"/>, val: totalBiz.toLocaleString(), label: 'Businesses' },
                { icon: <Users size={11} color="var(--green)"/>,     val: totalNGOs,               label: 'NGOs' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-head)' }}>{s.val}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--fg-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Per-zone traffic bars */}
            <div className="prog-list">
              {Object.entries(wards).map(([id, w]) => {
                const worstVal   = Math.max(w.traffic, Math.round(w.aqi / 3), w.electricityLoad);
                const statusColor = worstVal > 80 ? 'var(--rose)' : worstVal > 60 ? 'var(--amber)' : 'var(--green)';
                const cfg = city?.wards?.[id] || {};
                return (
                  <div key={id} className="prog-item">
                    <div className="prog-row">
                      <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                        {w.name?.split('—')[0]?.trim() || id}
                      </span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10 }}>
                        <span style={{ color: 'var(--rose)' }}>🏥{cfg.hospitals}</span>
                        <span style={{ color: '#a78bfa' }}>🎓{cfg.schools}</span>
                        <span style={{ color: statusColor, fontWeight: 700 }}>{w.traffic}% traffic</span>
                      </div>
                    </div>
                    <ProgressBar value={w.traffic} color={statusColor}/>
                    {cfg.area && (
                      <div style={{ fontSize: 9.5, color: 'var(--fg-dim)', marginTop: 2 }}>{cfg.area}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Operations/Alerts + AI agents */}
        <div className="col">
          {/* Operations & Alerts Card */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-head-left">
                <ShieldAlert size={13} className="panel-head-icon" style={{ color: alerts.length > 0 ? 'var(--amber)' : 'var(--green)' }}/>
                <span className="panel-head-title">Active Alerts & Operations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${alerts.length > 0 ? 'warn' : 'ok'}`}>
                  <span className="dot"/>
                  {alerts.length} active
                </span>
                <button 
                  onClick={() => setExpanded('alerts')}
                  title="Expand section"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fg-muted)', padding: '2px' }}
                >
                  <Maximize2 size={13}/>
                </button>
              </div>
            </div>
            <div className="panel-body">
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--fg-muted)' }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>✓</div>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>All Systems Nominal</h4>
                  <p style={{ fontSize: 10, marginTop: 4 }}>No environmental or utility threshold violations detected in {city?.name}.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {alerts.slice(0, 3).map(a => {
                    const isCrit = a.severity === 'critical';
                    return (
                      <div key={a.id} style={{
                        padding: '8px 10px',
                        background: isCrit ? 'rgba(244,63,94,.05)' : 'rgba(255,255,255,.02)',
                        border: '1px solid var(--border)',
                        borderColor: isCrit ? 'rgba(244,63,94,.18)' : 'var(--border)',
                        borderRadius: 6,
                        fontSize: 11
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: isCrit ? 'var(--rose)' : 'var(--fg)' }}>
                          <span>{a.title}</span>
                          <span style={{ fontSize: 8, textTransform: 'uppercase', color: isCrit ? 'var(--rose)' : 'var(--amber)' }}>{a.severity}</span>
                        </div>
                        <div style={{ color: 'var(--fg-muted)', fontSize: 10.5, marginTop: 3, lineHeight: 1.3 }}>{a.desc}</div>
                      </div>
                    );
                  })}
                  {alerts.length > 3 && (
                    <div style={{ fontSize: 10, color: 'var(--fg-muted)', textAlign: 'center', marginTop: 4 }}>
                      + {alerts.length - 3} more alert(s). View them in the side notification drawer.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI agents */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-head-left">
                <Cpu size={13} className="panel-head-icon" style={{ color: 'var(--indigo)' }}/>
                <span className="panel-head-title">AI Agent Status</span>
              </div>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Citizen Agent (Gemini)',         desc: 'Natural language query processing',   status: 'ok',                            label: 'Active' },
                { name: 'Predictor Agent (Vertex AI)',    desc: `Live forecast for ${city?.name}`,      status: 'ok',                            label: 'Running' },
                { name: 'Recommendation Agent',           desc: 'Computing optimal action policies',    status: 'ok',                            label: 'Standby' },
                { name: 'Emergency Agent (ADK)',           desc: 'Monitoring drainage & flood sensors', status: emergency ? 'alert' : 'ok',       label: emergency ? 'Alerting!' : 'Standby' },
              ].map(a => (
                <div key={a.name} className="agent-row">
                  <div>
                    <div className="agent-name">{a.name}</div>
                    <div className="agent-desc">{a.desc}</div>
                  </div>
                  <span className={`badge ${a.status}`}><span className="dot"/>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {expanded === 'zones' && createPortal(
        <Modal
          title={`${city?.name} — Complete Telemetry & Zone Matrix`}
          icon={<Building2 size={16} color="var(--teal)"/>}
          onClose={() => setExpanded(null)}
        >
          <ExpandedZonesView wards={wards} city={city}/>
        </Modal>,
        document.body
      )}

      {expanded === 'alerts' && createPortal(
        <Modal
          title="Active Operations Log & Incident Center"
          icon={<ShieldAlert size={16} color="var(--rose)"/>}
          onClose={() => setExpanded(null)}
        >
          <ExpandedAlertsView alerts={alerts} city={city}/>
        </Modal>,
        document.body
      )}
    </div>
  );
}
