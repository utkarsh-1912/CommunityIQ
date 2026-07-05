import React from 'react';
import { SlidersHorizontal, RotateCcw, Cloud, Bus, Timer, Zap } from 'lucide-react';

const SLIDERS = [
  {
    key: 'rainfall',
    label: 'Rainfall Simulation',
    icon: <Cloud size={12}/>,
    unit: 'mm/hr',
    min: 0, max: 100,
    color: (v) => v > 60 ? 'var(--rose)' : v > 30 ? 'var(--amber)' : 'var(--sky)',
  },
  {
    key: 'busFrequency',
    label: 'Bus Fleet Frequency',
    icon: <Bus size={12}/>,
    unit: '%',
    min: 0, max: 60,
    color: () => 'var(--green)',
  },
  {
    key: 'signalTiming',
    label: 'Signal Cycle Offset',
    icon: <Timer size={12}/>,
    unit: 's',
    min: 0, max: 45,
    color: () => 'var(--teal)',
  },
  {
    key: 'gridEfficiency',
    label: 'Grid Efficiency Boost',
    icon: <Zap size={12}/>,
    unit: '%',
    min: 0, max: 60,
    color: () => 'var(--indigo)',
  },
];

const PRESETS = [
  { id: 'storm',    label: '🌧 Storm Scenario' },
  { id: 'rush',     label: '🚦 Rush Hour Opt.' },
  { id: 'brownout', label: '⚡ Grid Brownout' },
  { id: 'reset',    label: '↺ Reset All' },
];

export default function SimulationSandbox({ sim, setSim, handlePreset, weather }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-head-left">
          <SlidersHorizontal size={13} className="panel-head-icon"/>
          <span className="panel-head-title">Simulation Sandbox</span>
        </div>
        {weather && (
          <span style={{ fontSize: 10, color: 'var(--fg-muted)' }}>
            Real temp: {weather.temperature}°C
          </span>
        )}
      </div>
      <div className="panel-body">
        {/* Sliders */}
        <div className="slider-block">
          {SLIDERS.map(s => {
            const val   = sim[s.key] ?? 0;
            const color = s.color(val);
            return (
              <div key={s.key}>
                <div className="slider-row" style={{ marginBottom: 6 }}>
                  <span className="slider-label" style={{ display: 'flex', alignItems: 'center', gap: 6, color }}>
                    {s.icon}{s.label}
                  </span>
                  <span className="slider-val" style={{ color }}>
                    {val}{s.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min} max={s.max}
                  value={val}
                  onChange={e => setSim(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                  style={{
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${((val-s.min)/(s.max-s.min))*100}%, rgba(255,255,255,.08) ${((val-s.min)/(s.max-s.min))*100}%, rgba(255,255,255,.08) 100%)`
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Preset buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id)}
              style={{
                background: p.id === 'reset' ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.02)',
                border: '1px solid var(--border)',
                borderRadius: 7,
                color: 'var(--fg-muted)',
                fontSize: 11, fontWeight: 600,
                padding: '8px 4px',
                cursor: 'pointer',
                transition: 'all .13s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-muted)'}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
