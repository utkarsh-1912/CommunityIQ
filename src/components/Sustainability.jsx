import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { Leaf, Zap, Wind, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ── Circular gauge (for green score) ──────────────────────────────────────────
function CircularGauge({ value = 0, max = 100, size = 120, color = 'var(--green)', label = '' }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const dash = pct * circ;
  const gap  = circ - dash;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={10} />
      {/* Fill */}
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      {/* Center text */}
      <text x={size/2} y={size/2 - 6} textAnchor="middle" fill="var(--fg)" fontSize={size * 0.23} fontWeight={800} fontFamily="var(--font-head)">{value}</text>
      <text x={size/2} y={size/2 + 12} textAnchor="middle" fill="var(--fg-muted)" fontSize={size * 0.1}>{label}</text>
    </svg>
  );
}

// ── Sparkline with area fill and animated reveal ───────────────────────────────
function Sparkline({ values = [], color = 'var(--teal)', height = 56, showDots = false, unit = '' }) {
  if (values.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--fg-muted)', opacity: .5 }}>Collecting data…</span>
    </div>
  );

  const w = 220;
  const pad = 6;
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);

  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + ((1 - (v - min) / range) * (height - pad * 2));
    return [x, y];
  });

  const polyline = pts.map(p => p.join(',')).join(' ');
  const polygon  = `${pad},${height} ${polyline} ${pad + (values.length - 1) * step},${height}`;

  const gradId = `sg-${color.replace(/[^a-z0-9]/gi, '')}`;
  const last = pts[pts.length - 1];
  const lastVal = values[values.length - 1];
  const prev = values[values.length - 2];
  const diff = lastVal - prev;

  const [tooltip, setTooltip] = useState(null);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        style={{ width: '100%', height, overflow: 'visible', display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity=".3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          {/* Subtle grid */}
          {[0.25, 0.5, 0.75].map(frac => (
            <line
              key={frac}
              x1={pad} y1={pad + frac * (height - pad * 2)}
              x2={w - pad} y2={pad + frac * (height - pad * 2)}
              stroke="rgba(255,255,255,.04)" strokeWidth={1}
            />
          ))}
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(frac => (
          <line
            key={frac}
            x1={pad} y1={pad + frac * (height - pad * 2)}
            x2={w - pad} y2={pad + frac * (height - pad * 2)}
            stroke="rgba(255,255,255,.04)" strokeWidth={1}
          />
        ))}

        {/* Area fill */}
        <polygon points={polygon} fill={`url(#${gradId})`} />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover areas */}
        {pts.map(([x, y], i) => (
          <rect
            key={i}
            x={x - step / 2} y={pad}
            width={step} height={height - pad}
            fill="transparent"
            onMouseEnter={() => setTooltip({ i, x, y, v: values[i] })}
          />
        ))}

        {/* Tooltip dot */}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={pad} x2={tooltip.x} y2={height} stroke={color} strokeWidth={1} strokeDasharray="3,2" opacity={.6} />
            <circle cx={tooltip.x} cy={tooltip.y} r={4} fill={color} stroke="var(--bg-panel)" strokeWidth={2} />
          </>
        )}

        {/* Latest dot */}
        {showDots && (
          <circle cx={last[0]} cy={last[1]} r={3.5} fill={color} stroke="var(--bg-panel)" strokeWidth={2} />
        )}
      </svg>

      {/* Axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--fg-muted)', opacity: .6, marginTop: 2, padding: '0 4px' }}>
        <span>{values.length}t ago</span>
        <span>Now</span>
      </div>

      {/* Value tooltip popup */}
      {tooltip && (
        <div style={{
          position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(20,20,30,.95)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '3px 8px', fontSize: 10.5, color: 'var(--fg)',
          fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 10
        }}>
          {tooltip.v.toFixed(1)}{unit}
        </div>
      )}

      {/* Current value + trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>
        {diff > 0.5
          ? <TrendingUp size={11} color="var(--rose)" />
          : diff < -0.5
          ? <TrendingDown size={11} color="var(--green)" />
          : <Minus size={11} color="var(--fg-muted)" />}
        <span>{diff > 0.5 ? 'Rising' : diff < -0.5 ? 'Falling' : 'Stable'} vs prev tick</span>
      </div>
    </div>
  );
}

// ── Horizontal bar with animated fill ─────────────────────────────────────────
function HBar({ value = 0, max = 100, color, label, unit = '%', subLabel }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const c = color || (pct > 80 ? 'var(--rose)' : pct > 60 ? 'var(--amber)' : 'var(--green)');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px', alignItems: 'center', marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: c, textAlign: 'right' }}>
        {typeof value === 'number' ? Math.round(value) : value}{unit}
      </div>
      <div style={{
        gridColumn: '1 / -1',
        height: 5, borderRadius: 4,
        background: 'rgba(255,255,255,.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: c,
          borderRadius: 4,
          transition: 'width .8s cubic-bezier(.4,0,.2,1), background .4s',
        }} />
      </div>
      {subLabel && <div style={{ gridColumn: '1/-1', fontSize: 9.5, color: 'var(--fg-muted)', opacity: .65, marginTop: 1 }}>{subLabel}</div>}
    </div>
  );
}

// ── AQI colour helper ──────────────────────────────────────────────────────────
function aqiColor(v) {
  if (v > 200) return 'var(--rose)';
  if (v > 150) return '#f97316';
  if (v > 100) return 'var(--amber)';
  if (v > 50)  return '#a3e635';
  return 'var(--green)';
}
function aqiLabel(v) {
  if (v > 200) return 'Hazardous';
  if (v > 150) return 'Very Unhealthy';
  if (v > 100) return 'Unhealthy';
  if (v > 50)  return 'Moderate';
  return 'Good';
}

// ── History hook — accumulates up to N ticks of real ward data ─────────────────
const HIST_MAX = 20;
function useHistory(wards, keys) {
  const histRef = useRef({});
  keys.forEach(k => {
    if (!histRef.current[k]) histRef.current[k] = [];
  });

  useEffect(() => {
    keys.forEach(k => {
      const wardList = Object.values(wards);
      if (!wardList.length) return;
      const avg = wardList.reduce((a, w) => a + (w[k] || 0), 0) / wardList.length;
      histRef.current[k] = [...(histRef.current[k] || []).slice(-(HIST_MAX - 1)), avg];
    });
  }, [wards]); // eslint-disable-line

  return histRef.current;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Sustainability({ sim, wards, weather, sustainabilityScore }) {
  const wardList = useMemo(() => Object.values(wards), [wards]);

  // Accumulate rolling history for charts
  const hist = useHistory(wards, ['electricityLoad', 'aqi', 'wasteLevel', 'floodRisk', 'traffic']);

  // Force re-render each tick to update sparklines
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const avgElec  = useMemo(() => Math.round(wardList.reduce((a,w) => a + w.electricityLoad, 0) / (wardList.length || 1)), [wardList]);
  const avgAqi   = useMemo(() => Math.round(wardList.reduce((a,w) => a + w.aqi, 0)            / (wardList.length || 1)), [wardList]);
  const avgWaste = useMemo(() => Math.round(wardList.reduce((a,w) => a + w.wasteLevel, 0)      / (wardList.length || 1)), [wardList]);
  const avgFlood = useMemo(() => Math.round(wardList.reduce((a,w) => a + w.floodRisk, 0)       / (wardList.length || 1)), [wardList]);

  const criticalWaste = wardList.filter(w => w.wasteLevel > 70).length;
  const co2Saved  = Math.round(sim.busFrequency * 0.8 + sim.gridEfficiency * 1.2);
  const treeEq    = Math.round(co2Saved * 2.3);
  const solarPct  = Math.max(5, Math.round(sim.gridEfficiency * 1.1 + 22));
  const evAdopt   = Math.max(3, Math.round(sim.busFrequency * 0.7 + 8));

  // Snapshot history arrays for charts (trigger by tick state)
  const elecHist  = [...(hist.electricityLoad || [])];
  const aqiHist   = [...(hist.aqi || [])];
  const wasteHist = [...(hist.wasteLevel || [])];
  const floodHist = [...(hist.floodRisk || [])];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Green Score Hero ── */}
      <div className="panel" style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,.1) 0%, rgba(20,184,166,.08) 100%)',
        borderColor: 'rgba(16,185,129,.2)',
        padding: 0, overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Gauge */}
          <CircularGauge
            value={sustainabilityScore}
            max={100}
            size={110}
            color={sustainabilityScore > 70 ? 'var(--green)' : sustainabilityScore > 50 ? 'var(--amber)' : 'var(--rose)'}
            label="/100"
          />

          {/* Text info */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 10, color: 'var(--teal)', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>
              Municipal Green Score
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 12 }}>
              Composite score based on transit efficiency, grid optimization & AQI impact.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px' }}>
              {[
                { label: 'CO₂ Reduced', value: `${co2Saved}t`, color: 'var(--green)' },
                { label: 'Tree Equiv.', value: `${treeEq}`, color: 'var(--teal)' },
                { label: 'Solar Grid', value: `${solarPct}%`, color: 'var(--amber)' },
                { label: 'EV Adoption', value: `${evAdopt}%`, color: 'var(--indigo)' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontSize: 9.5, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-head)', color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score bar */}
        </div>
        <div style={{ height: 4, background: `linear-gradient(to right, var(--green) ${sustainabilityScore}%, rgba(255,255,255,.06) ${sustainabilityScore}%)`, transition: 'all 1.2s ease' }} />
      </div>

      {/* ── 3 Live Chart Panels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>

        {/* Electricity Load */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-head-left">
              <Zap size={13} style={{ color: 'var(--indigo)' }} />
              <span className="panel-head-title">Electricity Load</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-head)', color: avgElec > 80 ? 'var(--rose)' : 'var(--indigo)' }}>
              {avgElec}%
            </span>
          </div>
          <div className="panel-body" style={{ padding: '10px 14px' }}>
            <Sparkline values={elecHist} color="var(--indigo)" height={60} showDots unit="%" />
            <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              {wardList.map(w => (
                <HBar
                  key={w.name}
                  label={w.name?.split('—')[0]?.trim() || w.name}
                  value={w.electricityLoad}
                  color={w.electricityLoad > 80 ? 'var(--rose)' : w.electricityLoad > 65 ? 'var(--amber)' : 'var(--indigo)'}
                  unit="%"
                />
              ))}
            </div>
            {weather?.temperature && (
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--fg-muted)', background: 'rgba(255,255,255,.02)', borderRadius: 6, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>🌡</span>
                <span>{weather.temperature}°C outdoor temp — driving AC peak loads</span>
              </div>
            )}
          </div>
        </div>

        {/* Air Quality */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-head-left">
              <Wind size={13} style={{ color: 'var(--amber)' }} />
              <span className="panel-head-title">Air Quality (AQI)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: `${aqiColor(avgAqi)}22`, color: aqiColor(avgAqi) }}>
                {aqiLabel(avgAqi)}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-head)', color: aqiColor(avgAqi) }}>
                {avgAqi}
              </span>
            </div>
          </div>
          <div className="panel-body" style={{ padding: '10px 14px' }}>
            <Sparkline values={aqiHist} color="var(--amber)" height={60} showDots unit=" AQI" />
            <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              {wardList.map(w => {
                const c = aqiColor(Math.round(w.aqi));
                return (
                  <HBar
                    key={w.name}
                    label={w.name?.split('—')[0]?.trim() || w.name}
                    value={Math.round(w.aqi)}
                    max={300}
                    color={c}
                    unit=""
                    subLabel={aqiLabel(Math.round(w.aqi))}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Waste Bins */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-head-left">
              <Leaf size={13} style={{ color: 'var(--green)' }} />
              <span className="panel-head-title">Waste Bin Levels</span>
            </div>
            <span className={`badge ${criticalWaste > 0 ? 'warn' : 'ok'}`}>
              <span className="dot" />
              {criticalWaste} critical
            </span>
          </div>
          <div className="panel-body" style={{ padding: '10px 14px' }}>
            <Sparkline values={wasteHist} color="var(--green)" height={60} showDots unit="%" />
            <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              {wardList.map(w => {
                const c = w.wasteLevel > 85 ? 'var(--rose)' : w.wasteLevel > 65 ? 'var(--amber)' : 'var(--green)';
                return (
                  <HBar
                    key={w.name}
                    label={w.name?.split('—')[0]?.trim() || w.name}
                    value={Math.round(w.wasteLevel)}
                    color={c}
                    unit="%"
                    subLabel={w.wasteLevel > 85 ? '⚠ Collection urgent' : w.wasteLevel > 65 ? 'Filling up' : 'Normal'}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom row: Flood Risk + Summary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>

        {/* Flood Risk */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-head-left">
              <Droplets size={13} style={{ color: '#60a5fa' }} />
              <span className="panel-head-title">Flood Risk</span>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-head)',
              color: avgFlood > 60 ? 'var(--rose)' : avgFlood > 35 ? 'var(--amber)' : '#60a5fa'
            }}>
              {avgFlood}%
            </span>
          </div>
          <div className="panel-body" style={{ padding: '10px 14px' }}>
            <Sparkline values={floodHist} color="#60a5fa" height={56} showDots unit="%" />
            <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              {wardList.map(w => {
                const c = w.floodRisk > 60 ? 'var(--rose)' : w.floodRisk > 35 ? 'var(--amber)' : '#60a5fa';
                return (
                  <HBar
                    key={w.name}
                    label={w.name?.split('—')[0]?.trim() || w.name}
                    value={Math.round(w.floodRisk)}
                    color={c}
                    unit="%"
                    subLabel={w.floodRisk > 60 ? '🚨 High risk' : w.floodRisk > 35 ? 'Elevated' : 'Low'}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary KPI grid */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="panel-head-left">
              <TrendingUp size={13} style={{ color: 'var(--teal)' }} />
              <span className="panel-head-title">Utility Summary</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--fg-muted)' }}>Live</span>
          </div>
          <div className="panel-body" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Avg Grid Load',    value: `${avgElec}%`,  color: avgElec > 80 ? 'var(--rose)' : 'var(--indigo)', icon: '⚡' },
                { label: 'Avg AQI',          value: `${avgAqi}`,    color: aqiColor(avgAqi), icon: '💨' },
                { label: 'Avg Waste Fill',   value: `${avgWaste}%`, color: avgWaste > 70 ? 'var(--rose)' : 'var(--green)', icon: '🗑' },
                { label: 'Flood Risk Avg',   value: `${avgFlood}%`, color: avgFlood > 60 ? 'var(--rose)' : '#60a5fa', icon: '🌊' },
                { label: 'CO₂ Offset',       value: `${co2Saved}t`, color: 'var(--green)', icon: '🌿' },
                { label: 'Solar Penetration',value: `${solarPct}%`, color: 'var(--amber)', icon: '☀️' },
                { label: 'EV Fleet Adopt',   value: `${evAdopt}%`,  color: 'var(--teal)', icon: '🔋' },
                { label: 'Tree Equivalent',  value: `${treeEq}`,    color: 'var(--teal)', icon: '🌳' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,.025)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-head)', color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
