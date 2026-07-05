import React, { useState, useEffect } from 'react';
import { Database, Activity, Zap, Cloud, Wind, Trash2, RefreshCw } from 'lucide-react';

const SOURCE_COLORS = {
  'Open-Meteo':    '#0ea5e9',
  'WAQI':          '#f59e0b',
  'IoT Sensors':   '#14b8a6',
  'Citizen API':   '#a78bfa',
  'Energy SCADA':  '#6366f1',
};

function JsonBlock({ title, source, data, icon }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="json-card">
      <div className="json-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: SOURCE_COLORS[source] || 'var(--teal)' }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 11.5 }}>{title}</span>
          <span
            className="json-source-tag badge"
            style={{
              background: `${SOURCE_COLORS[source]}18` || 'var(--teal-glow)',
              color: SOURCE_COLORS[source] || 'var(--teal)',
              border: `1px solid ${SOURCE_COLORS[source]}35` || 'rgba(20,184,166,.2)',
              padding: '1px 6px',
            }}
          >
            {source}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge ok" style={{ fontSize: 9 }}><span className="dot"/>Live</span>
          <button
            onClick={() => setCollapsed(p => !p)}
            style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', fontSize: 11 }}
          >
            {collapsed ? '▶ Expand' : '▼ Collapse'}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="json-body">
          <span style={{ color: 'var(--teal)' }}>{JSON.stringify(data, null, 2)}</span>
        </div>
      )}
    </div>
  );
}

export default function DataIngestion({ wards, weather, aqiData, sim }) {
  const [ts, setTs] = useState(new Date().toISOString());
  useEffect(() => {
    const iv = setInterval(() => setTs(new Date().toISOString()), 3000);
    return () => clearInterval(iv);
  }, []);

  const hour    = new Date().getHours();
  const wardIds = Object.keys(wards);

  // Build representative IoT payloads from live data
  const iotPayload = wardIds.reduce((acc, id) => {
    const m = wards[id];
    acc[id] = {
      traffic_density_pct: m.traffic,
      waste_bin_fill_pct:  parseFloat(m.wasteLevel.toFixed(1)),
      electricity_load_pct: m.electricityLoad,
      flood_risk_idx:      m.floodRisk,
      complaints_pending:  m.complaints,
    };
    return acc;
  }, {});

  const weatherPayload = weather ? {
    source: 'Open-Meteo v1',
    city: 'Karachi, PK',
    latitude: 24.8607,
    longitude: 67.0011,
    timestamp: ts,
    current: {
      temperature_c:    weather.temperature,
      humidity_pct:     weather.humidity,
      wind_kmh:         weather.windSpeed,
      precipitation_mm: weather.precipitation,
      cloud_cover_pct:  weather.cloudCover,
      weather_code:     weather.weatherCode,
    },
    forecast_24h: {
      max_precip_prob_pct: weather.next24hPrecipProb,
      total_precipitation_mm: weather.totalPrecip24h?.toFixed(2),
    },
  } : { status: 'fetching...', timestamp: ts };

  const aqiPayload = aqiData ? {
    source: 'WAQI.info',
    city: aqiData.city,
    timestamp: aqiData.time,
    aqi: aqiData.aqi,
    dominant_pollutant: aqiData.dominantPollutant,
    breakdown: {
      pm2_5_ugm3: aqiData.pm25,
      pm10_ugm3:  aqiData.pm10,
      no2_ugm3:   aqiData.no2,
      o3_ugm3:    aqiData.o3,
      so2_ugm3:   aqiData.so2,
    },
  } : { status: 'fetching...', timestamp: ts };

  const simPayload = {
    source: 'Simulation Sandbox',
    timestamp: ts,
    active_params: {
      rainfall_mm: sim.rainfall,
      bus_frequency_pct_increase: sim.busFrequency,
      signal_timing_offset_s: sim.signalTiming,
      grid_efficiency_boost_pct: sim.gridEfficiency,
    },
    derived_effects: {
      flood_risk_delta: `+${Math.round(sim.rainfall * 0.7)}%`,
      traffic_reduction_est: `${Math.round(sim.busFrequency * 0.5 + sim.signalTiming * 0.3)}%`,
      co2_reduction_est_tons: Math.round(sim.busFrequency * 0.8 + sim.gridEfficiency * 1.2),
    },
  };

  const citizenPayload = {
    source: 'Citizen Portal API',
    timestamp: ts,
    ingestion_channels: ['WhatsApp Bot', 'MyCity App', 'SMS #8787', 'Twitter @KarachiMC'],
    stats: {
      messages_last_hour:      Math.round(120 + Math.random() * 80),
      avg_response_time_min:   parseFloat((1.2 + Math.random()).toFixed(1)),
      sentiment_positive_pct:  Math.round(35 + Math.random() * 10),
      sentiment_negative_pct:  Math.round(38 + Math.random() * 15),
      active_complaints:       wardIds.reduce((a, id) => a + wards[id].complaints, 0),
    },
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Status header */}
      <div className="panel">
        <div className="panel-body" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--teal)', marginBottom: 4 }}>
                Data Pipeline Status
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.keys(SOURCE_COLORS).map(src => (
                  <span key={src} className="badge ok">
                    <span className="dot"/>
                    {src}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--fg-muted)' }}>
              <RefreshCw size={10} style={{ marginRight: 4, verticalAlign: 'middle' }}/>
              Last tick: {new Date(ts).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* JSON blocks */}
      <JsonBlock title="IoT Sensor Telemetry — All Wards"
        source="IoT Sensors" icon={<Activity size={13}/>} data={{ timestamp: ts, wards: iotPayload }}/>

      <JsonBlock title="Weather Forecast Feed"
        source="Open-Meteo" icon={<Cloud size={13}/>} data={weatherPayload}/>

      <JsonBlock title="Air Quality Index Feed"
        source="WAQI" icon={<Wind size={13}/>} data={aqiPayload}/>

      <JsonBlock title="Simulation Sandbox State"
        source="IoT Sensors" icon={<Zap size={13}/>} data={simPayload}/>

      <JsonBlock title="Citizen Sentiment & Complaints"
        source="Citizen API" icon={<Database size={13}/>} data={citizenPayload}/>
    </div>
  );
}
