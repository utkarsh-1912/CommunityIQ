import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, Search, FileText, ChevronRight, BarChart2, X, Globe, Link, RefreshCw, Maximize2 } from 'lucide-react';

const MOCK_DOCUMENTS = {
  evac_playbook: {
    title: 'Disaster Response Playbook 2026 - Section 8.4',
    content: 'Emergency evacuation procedures mandate that under Level 3 precipitation thresholds, all local emergency centers must trigger active public notification alarms. Citizens in low-lying zones must be guided along green evacuation corridors. Transport assets are optimized via real-time traffic signal adjustments to give rescue convoys priority.'
  },
  gis_survey: {
    title: 'GIS Elevation Mapping Survey Report',
    content: 'Analysis of low-lying flood-prone catchment areas. Runoff indexes indicate critical pooling near river boundaries and coastal channels. High-altitude zones (elevation > 80m) are designated as dry-assembly staging grounds. Drainage capacity must be expanded to handle 120 l/s/ha.'
  },
  grid_shaving: {
    title: 'Smart Grid Peak Shaving Policy Directive - Section 2.1',
    content: 'When temperature metrics exceed 39°C, commercial sub-grids must execute smart load-shaving routines. Air-conditioning chillers should cycle load every 20 minutes, and energy reserves must be drawn from municipal battery vaults to keep distribution substations under 85% utilization.'
  },
  looker_report: {
    title: 'Looker Energy Analytics Report - Q2 2026',
    content: 'Data indicates a direct linear correlation between daily temperature peaks and AC grid load. Residential demand spikes by 4.2% per degree above 30°C. Peak commercial load occurs between 14:00 and 17:00, requiring active battery load sharing.'
  },
  clean_air: {
    title: 'Clean Air Directive 2024 - Article 14',
    content: 'Health indicators suggest particulate matter levels (PM2.5) above 150 µg/m³ pose immediate cardiovascular risks. Once AQI crosses 200, industrial particulate exhaust must be curtailed by 50% within 4 hours, and regional schools must switch to remote operations.'
  },
  who_guidelines: {
    title: 'WHO Urban Air Quality Guidelines - Annex B',
    content: 'Detailed recommendations for urban particulate limits. Hourly ozone thresholds should not exceed 100 µg/m³. Cities must maintain high-density canopy grids and dynamic traffic restrictions in narrow residential canyons to prevent particle locking.'
  },
  master_plan: {
    title: 'AlloyDB Embeddings - Master Plan 2030',
    content: 'Strategic blueprint for smart urban zoning. Integrates high-density residential corridors with electric public transit lines. Establishes smart infrastructure nodes every 500m to monitor AQI, flood risk, and grid health in real time.'
  },
  bq_policy: {
    title: 'BigQuery Policy Tables - Row 149 Reference',
    content: 'Cross-reference index for dynamic resource optimization. Links real-time sensor streams to active alert triggers. Governs ADK dispatch rules and recommendation weighting metrics.'
  }
};

function getDynamicKnowledgeBase(city) {
  const wardKeys = Object.keys(city.wards);
  const wardNames = wardKeys.map(id => city.wards[id]?.name?.split('—')[0]?.trim() || id);
  const zone1 = wardNames[0] || 'Zone A';
  const zone2 = wardNames[1] || 'Zone B';
  const zone3 = wardNames[2] || 'Zone C';

  return {
    'What is the evacuation protocol for flood zones?': {
      answer: `According to the Disaster Response Directive Section 8.4, in low-lying zones (elevation < 80m), evacuations are triggered when local precipitation exceeds 65mm or canal sensors register > 82% load capacity. Primary staging points are allocated at zone schools (e.g. ${zone1} School Complex, ${zone2} Gymnasium). Logistics vehicles should utilize pre-cleared high-altitude lanes in ${city.name}.`,
      sources: [
        { label: `[1] ${city.name} Disaster Response Playbook 2026, Section 8.4`, docId: 'evac_playbook' },
        { label: `[2] GIS Elevation Mapping Survey for ${city.name}, p. 44`, docId: 'gis_survey' }
      ]
    },
    'How to manage high grid load during a heatwave?': {
      answer: `Grid peak-shaving policy directive (${city.name} Power Code 2025) outlines that when ambient temperature exceeds 39°C, industrial and commercial zones (${zone3} / ${zone1}) must curtail grid demand by 15% via switching to on-site solar storage. Electric bus charging stations are throttled to low-draw modes during peak hours (14:00 - 17:00).`,
      sources: [
        { label: `[1] Smart Grid Peak Shaving Policy Directive, Section 2.1`, docId: 'grid_shaving' },
        { label: `[2] Looker Energy Analytics Report for ${city.name}, Q2 2026`, docId: 'looker_report' }
      ]
    },
    'What are the air quality guidelines for school closures?': {
      answer: `Environmental Protection Code Article 14 states that when the average AQI in ${city.name} exceeds 200 for 6 consecutive hours, schools and colleges within a 3km radius must transition to remote learning. Outdoor sports and physical activities are suspended once AQI passes 150 in the affected zone (e.g., ${zone2}).`,
      sources: [
        { label: `[1] Clean Air Directive 2024, Art. 14`, docId: 'clean_air' },
        { label: `[2] WHO Urban Air Guidelines for ${city.name}, Annex B`, docId: 'who_guidelines' }
      ]
    }
  };
}

export default function DecisionRoom({ city }) {
  const wardKeys = Object.keys(city.wards);
  const wardNames = wardKeys.map(id => city.wards[id]?.name?.split('—')[0]?.trim() || id);
  const zone1 = wardNames[0] || 'Zone A';
  const zone2 = wardNames[1] || 'Zone B';
  const zone3 = wardNames[2] || 'Zone C';
  const zone4 = wardNames[3] || 'Zone D';

  const dynamicScenarios = [
    {
      id: 'heatwave',
      title: '☀️ Extreme Heatwave Grid Surge',
      desc: `Forecast predicts temperatures peaking at 42°C in low-lying zones of ${city.name}, causing critical air-conditioning grid loads.`,
      targetZones: [zone1, zone2, zone3].slice(0, wardKeys.length),
      metrics: { traffic: 'Normal (+5%)', aqi: 'Poor (134 AQI)', electricityLoad: 'Critically High (96%)' },
      recommendations: [
        { id: 'shave', label: `Enable load-shaving on industrial zones (${zone3} / ${zone1})`, effect: 'Reduces peak load by ~18MW' },
        { id: 'cool', label: `Deploy community cooling centers in ${zone1} & ${zone2}`, effect: 'Prevents healthcare overload' },
        { id: 'ev', label: `Mandate electric-only transit in congested CBD lanes of ${city.name}`, effect: 'Mitigates ground O3 building' }
      ],
      predictedOutcome: {
        gridSafety: '98% (Secure)',
        heatAdmissions: '-42% reduction',
        co2Reduction: '12.4 tonnes saved',
        successRate: '94% Confidence'
      }
    },
    {
      id: 'flood',
      title: '🌧️ Monsoon Flash Flood Risk',
      desc: `Meteorological sensors forecast 85mm rainfall in 3 hours. Low-lying coastal sectors and river drains in ${city.name} are highly vulnerable.`,
      targetZones: [zone2, zone3, zone4].slice(0, wardKeys.length).filter(Boolean),
      metrics: { traffic: 'High Delay (+24%)', aqi: 'Good (34 AQI)', electricityLoad: 'Slightly Reduced (-8%)' },
      recommendations: [
        { id: 'pumps', label: `Pre-deploy 6 heavy-duty water pumps to ${zone1} & ${zone3}`, effect: 'Speeds up drainage by 3x' },
        { id: 'route', label: `Reroute bus lines away from flooded streets in ${zone2}`, effect: 'Avoids passenger gridlock' },
        { id: 'gate', label: `Close tidal canal control gates in ${zone1} waterfront`, effect: 'Blocks coastal backflow' }
      ],
      predictedOutcome: {
        gridSafety: '95% (Secure)',
        heatAdmissions: 'N/A',
        co2Reduction: 'N/A',
        successRate: '88% Confidence'
      }
    },
    {
      id: 'smog',
      title: '🌫️ Winter Smog Accumulation',
      desc: `Atmospheric inversion layer locking PM2.5 and PM10 particles over industrial and transit corridors of ${city.name}.`,
      targetZones: [zone1, zone3, zone4].slice(0, wardKeys.length).filter(Boolean),
      metrics: { traffic: 'Congested (+15%)', aqi: 'Severe (289 AQI)', electricityLoad: 'Normal' },
      recommendations: [
        { id: 'halt', label: 'Temporarily halt waste incineration & brick kilns in industrial wards', effect: 'Cuts direct PM2.5 release' },
        { id: 'spray', label: `Deploy water-mist spraying trucks in high-AQI zones like ${zone1}`, effect: 'Settles suspended dust' },
        { id: 'mask', label: 'Distribute N95 filtration masks to outdoor personnel', effect: 'Reduces respiratory emergencies' }
      ],
      predictedOutcome: {
        gridSafety: '100% (Nominal)',
        heatAdmissions: '-30% respiratory visits',
        co2Reduction: '8.2 tonnes saved',
        successRate: '91% Confidence'
      }
    }
  ];

  const [selectedScenario, setSelectedScenario] = useState(dynamicScenarios[0]);
  const [selectedRecommendations, setSelectedRecommendations] = useState([]);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedPanel, setExpandedPanel] = useState(null);

  // Sync scenario if city switches (update selected scenario bounds)
  useEffect(() => {
    const active = dynamicScenarios.find(s => s.id === selectedScenario.id) || dynamicScenarios[0];
    setSelectedScenario(active);
  }, [city]);

  // Reset simulation state when scenario changes
  useEffect(() => {
    setSelectedRecommendations([]);
    setSimulationComplete(false);
  }, [selectedScenario]);

  const handleToggleRec = (id) => {
    setSelectedRecommendations(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleSimulate = () => {
    if (selectedRecommendations.length === 0) return;
    setRunningSimulation(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setRunningSimulation(false);
      setSimulationComplete(true);
    }, 1800);
  };

  const handleRAGSubmit = (queryText) => {
    const q = queryText || ragQuery;
    if (!q.trim()) return;
    setRagLoading(true);
    setRagResult(null);
    setTimeout(() => {
      const matched = getDynamicKnowledgeBase(city)[q] || {
        answer: `Vertex AI Search performed semantic query retrieval over AlloyDB database for city documents. Found matching policies in '${city.name} General Urban Regulations 2025':\n\nStakeholders are advised to proceed with dynamic resource allocation matching the coordinates [${city.lat}, ${city.lon}]. Active alerts require prompt deployment matching recommendations in the Twin Simulator.`,
        sources: [
          { label: `[1] AlloyDB Embeddings Database: ${city.name.toLowerCase()}_master_plan.pdf`, docId: 'master_plan' },
          { label: `[2] BigQuery Policy Tables - Row 149`, docId: 'bq_policy' }
        ]
      };
      setRagResult(matched);
      setRagLoading(false);
    }, 1200);
  };

  const [forecastHour, setForecastHour] = useState(12);

  const forecastData = {
    aqi: [68, 70, 75, 84, 98, 120, 142, 168, 185, 172, 148, 130, 115, 98, 92, 85, 78, 72, 70, 68, 65, 62, 60, 62],
    traffic: [15, 12, 10, 18, 38, 74, 92, 85, 68, 55, 48, 52, 64, 58, 62, 78, 94, 88, 72, 50, 38, 28, 22, 18],
    power: [45, 40, 38, 42, 48, 55, 64, 78, 85, 92, 96, 94, 88, 82, 85, 88, 92, 90, 84, 75, 68, 58, 52, 48]
  };

  // Render sub-sections so we can easily reuse them in expanded modals
  const renderPlannerContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Scenario Selector */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {dynamicScenarios.map(s => (
          <button
            key={s.id}
            className={`chip ${selectedScenario.id === s.id ? 'active' : ''}`}
            onClick={() => setSelectedScenario(s)}
            style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '11.5px', flex: 1 }}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Scenario Info */}
      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg)' }}>{selectedScenario.title}</div>
        <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px', lineHeight: 1.4 }}>{selectedScenario.desc}</div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9.5px', color: 'var(--fg-dim)' }}>Target zones:</span>
          {selectedScenario.targetZones.map(z => (
            <span key={z} className="badge warning" style={{ fontSize: '9px' }}>{z}</span>
          ))}
        </div>
      </div>

      {/* Action Recommendations Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--fg-muted)' }}>
          AI Recommendations Action Plan
        </div>
        {selectedScenario.recommendations.map(r => {
          const isChecked = selectedRecommendations.includes(r.id);
          return (
            <div
              key={r.id}
              onClick={() => handleToggleRec(r.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                background: isChecked ? 'var(--teal-glow)' : 'rgba(255,255,255,0.01)',
                border: isChecked ? '1px solid rgba(20,184,166,0.3)' : '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.1s ease'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  background: isChecked ? 'var(--teal)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              >
                {isChecked && '✓'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--fg)' }}>{r.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--fg-muted)', marginTop: '2px' }}>Impact: {r.effect}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Run Simulation Trigger */}
      <button
        className="chat-send-btn"
        disabled={selectedRecommendations.length === 0 || runningSimulation}
        onClick={handleSimulate}
        style={{
          width: '100%',
          height: '38px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700,
          background: selectedRecommendations.length > 0 ? 'var(--indigo)' : 'var(--fg-dim)',
          color: '#fff',
          cursor: selectedRecommendations.length > 0 ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {runningSimulation ? (
          <>
            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }}/>
            Vertex AI Running Decision Modeling...
          </>
        ) : (
          <>
            <Sparkles size={13}/>
            Simulate Selected Actions & Predict Outcomes
          </>
        )}
      </button>

      {/* Predicted Outcomes Panel */}
      {simulationComplete && (
        <div style={{
          border: '1px solid var(--border-active)',
          background: 'var(--teal-glow)',
          borderRadius: '8px',
          padding: '14px',
          animation: 'slide-in 0.25s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal)', fontWeight: 700, fontSize: '13px' }}>
            <ShieldCheck size={16}/>
            Predicted Outcome Summary (Vertex AI Forecasting)
          </div>
          
          <div className="ward-detail-grid" style={{ marginTop: '10px' }}>
            <div className="ward-detail-stat" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="ward-detail-label">Grid safety</div>
              <div className="ward-detail-value" style={{ color: 'var(--teal)' }}>{selectedScenario.predictedOutcome.gridSafety}</div>
            </div>
            <div className="ward-detail-stat" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="ward-detail-label">Health Admissions</div>
              <div className="ward-detail-value" style={{ color: 'var(--rose)' }}>{selectedScenario.predictedOutcome.heatAdmissions}</div>
            </div>
            <div className="ward-detail-stat" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="ward-detail-label">CO2 Savings</div>
              <div className="ward-detail-value" style={{ color: 'var(--green)' }}>{selectedScenario.predictedOutcome.co2Reduction}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--fg-muted)', marginTop: '10px' }}>
            <CheckCircle2 size={12} style={{ color: 'var(--green)' }}/>
            Recommendation action protocol ready for local agent execution (ADK).
          </div>
        </div>
      )}
    </div>
  );

  const renderRAGContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '11px', color: 'var(--fg-muted)', lineHeight: 1.4 }}>
        Ask questions to query the local city policy directives, environmental playbooks, and disaster guidelines.
      </div>

      {/* RAG query input */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ask policy questions (e.g. 'evacuation protocol')..."
          className="chat-input"
          value={ragQuery}
          onChange={e => setRagQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRAGSubmit()}
          style={{ flex: 1 }}
        />
        <button
          className="chat-send-btn"
          onClick={() => handleRAGSubmit()}
          style={{ height: '36px', width: '36px', borderRadius: '8px', padding: 0 }}
        >
          <Search size={14}/>
        </button>
      </div>

      {/* RAG chips */}
      <div className="chip-row">
        {Object.keys(getDynamicKnowledgeBase(city)).map(k => (
          <button
            key={k}
            className="chip"
            onClick={() => { setRagQuery(k); handleRAGSubmit(k); }}
            style={{ fontSize: '9.5px', padding: '4px 8px' }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* RAG Result Rendering */}
      {ragLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div className="typing-wrap" style={{ padding: 0 }}>
            <div className="typing-dot"/>
            <div className="typing-dot"/>
            <div className="typing-dot"/>
          </div>
          <span style={{ fontSize: '9.5px', color: 'var(--fg-muted)' }}>Embedding search over AlloyDB databases...</span>
        </div>
      )}

      {ragResult && (
        <div style={{
          border: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.015)',
          borderRadius: '8px',
          padding: '12px',
          animation: 'slide-in 0.2s ease-out'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--indigo)', marginBottom: '6px' }}>
            🤖 Vertex AI RAG Response
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--fg)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
            {ragResult.answer}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase' }}>Sources & References (Click to view):</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {ragResult.sources.map(s => (
                <button
                  key={s.docId}
                  onClick={() => setSelectedDoc(MOCK_DOCUMENTS[s.docId])}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--teal)',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '2px 0'
                  }}
                >
                  <Link size={10} style={{ flexShrink: 0 }}/>
                  <span style={{ textDecoration: 'underline' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderForecastContent = (isExpanded = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
        Slide to inspect the forecast outcomes over the next 24 hours.
      </div>

      {/* Slider selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--teal)', minWidth: '60px' }}>
          {forecastHour === 0 ? 'Midnight' : forecastHour === 12 ? 'Noon' : `${forecastHour}:00`}
        </span>
        <input
          type="range"
          min="0"
          max="23"
          value={forecastHour}
          onChange={e => setForecastHour(Number(e.target.value))}
          style={{ flex: 1 }}
        />
      </div>

      {/* Mini telemetry forecast grid */}
      <div className="ward-detail-grid">
        <div className="ward-detail-stat" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="ward-detail-label">Forecast AQI</div>
          <div className="ward-detail-value" style={{ color: forecastData.aqi[forecastHour] > 150 ? 'var(--rose)' : forecastData.aqi[forecastHour] > 100 ? 'var(--amber)' : 'var(--green)' }}>
            {forecastData.aqi[forecastHour]}
          </div>
          <span style={{ fontSize: '8.5px', color: 'var(--fg-muted)' }}>US-AQI index</span>
        </div>
        
        <div className="ward-detail-stat" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="ward-detail-label">Forecast Congestion</div>
          <div className="ward-detail-value" style={{ color: forecastData.traffic[forecastHour] > 80 ? 'var(--rose)' : forecastData.traffic[forecastHour] > 50 ? 'var(--amber)' : 'var(--teal)' }}>
            {forecastData.traffic[forecastHour]}%
          </div>
          <span style={{ fontSize: '8.5px', color: 'var(--fg-muted)' }}>Transit delay</span>
        </div>

        <div className="ward-detail-stat" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <div className="ward-detail-label">Forecast Grid Load</div>
          <div className="ward-detail-value" style={{ color: forecastData.power[forecastHour] > 85 ? 'var(--rose)' : 'var(--indigo)' }}>
            {forecastData.power[forecastHour]}%
          </div>
          <span style={{ fontSize: '8.5px', color: 'var(--fg-muted)' }}>AC power demand</span>
        </div>
      </div>

      {/* Glowing SVG Time-series Chart */}
      <div style={{ height: isExpanded ? '180px' : '70px', marginTop: '6px', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
        <svg width="100%" height="100%" viewBox={isExpanded ? "0 0 240 180" : "0 0 240 70"} preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Grid Lines */}
          <line x1="0" y1={isExpanded ? "90" : "35"} x2="240" y2={isExpanded ? "90" : "35"} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3"/>
          
          {/* Path for AQI */}
          <path
            d={forecastData.aqi.reduce((acc, val, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${i * 10} ${(isExpanded ? 180 : 70) - (val / 300) * (isExpanded ? 160 : 60)}`, '')}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 2px var(--amber))' }}
          />
          {/* Path for Traffic */}
          <path
            d={forecastData.traffic.reduce((acc, val, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${i * 10} ${(isExpanded ? 180 : 70) - (val / 100) * (isExpanded ? 160 : 60)}`, '')}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 2px var(--teal))' }}
          />

          {/* Active hour indicator bar */}
          <line
            x1={forecastHour * 10}
            y1="0"
            x2={forecastHour * 10}
            y2={isExpanded ? "180" : "70"}
            stroke="var(--indigo)"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 2px var(--indigo))' }}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: 6, left: 8, fontSize: '9px', color: 'var(--fg-muted)', display: 'flex', gap: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--amber)', borderRadius: '50%' }}/>AQI Forecast</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--teal)', borderRadius: '50%' }}/>Traffic Forecast</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'auto', overflowY: 'visible' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px', fontWeight: 800 }}>
            <Brain size={18} style={{ color: 'var(--indigo)' }}/>
            AI Decision Room & RAG Insight Center
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
            Google Cloud Vertex AI & ADK-powered decision optimization interface for {city.name}.
          </span>
        </div>
        <div className="badge ok" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={10} style={{ animation: 'blink-text 1.5s infinite' }}/>
          Inference Engine Online
        </div>
      </div>

      <div className="grid-2" style={{ gap: '20px', minHeight: 0 }}>
        
        {/* ── Left Column: Decision Modeling Sandbox ── */}
        <div className="col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="panel-head">
              <div className="panel-head-left">
                <Brain size={13} style={{ color: 'var(--teal)' }}/>
                <span className="panel-head-title">Predictive Scenario Planner</span>
              </div>
              <button 
                onClick={() => setExpandedPanel('planner')}
                title="Expand section"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fg-muted)', padding: '2px' }}
              >
                <Maximize2 size={13}/>
              </button>
            </div>
            
            <div className="panel-body">
              {renderPlannerContent()}
            </div>
          </div>
        </div>

        {/* ── Right Column: RAG Agent Playground & Forecasting ── */}
        <div className="col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* RAG Console Panel */}
          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="panel-head">
              <div className="panel-head-left">
                <FileText size={13} style={{ color: 'var(--indigo)' }}/>
                <span className="panel-head-title">Vertex AI RAG Agent & Policy Retrieval</span>
              </div>
              <button 
                onClick={() => setExpandedPanel('rag')}
                title="Expand section"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fg-muted)', padding: '2px' }}
              >
                <Maximize2 size={13}/>
              </button>
            </div>

            <div className="panel-body">
              {renderRAGContent()}
            </div>
          </div>

          {/* Time Series Forecasting Panel */}
          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="panel-head">
              <div className="panel-head-left">
                <BarChart2 size={13} style={{ color: 'var(--teal)' }}/>
                <span className="panel-head-title">24-Hour Predictive AI Forecast (City-wide)</span>
              </div>
              <button 
                onClick={() => setExpandedPanel('forecast')}
                title="Expand section"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fg-muted)', padding: '2px' }}
              >
                <Maximize2 size={13}/>
              </button>
            </div>

            <div className="panel-body">
              {renderForecastContent(false)}
            </div>
          </div>

        </div>

      </div>

      {/* ── Document Reference Viewer Modal ── */}
      {selectedDoc && createPortal(
        <div className="modal-backdrop" onClick={() => setSelectedDoc(null)} style={{ zIndex: 100000 }}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', height: 'auto', maxHeight: '70vh' }}>
            <div className="modal-head" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <div className="modal-title" style={{ color: 'var(--teal)' }}>
                <FileText size={16}/>
                AlloyDB Document Repository Viewer
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedDoc(null)}>
                <X size={16}/>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fg)' }}>{selectedDoc.title}</div>
              
              <div style={{
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '12px',
                color: 'var(--fg-muted)',
                lineHeight: 1.5,
                fontFamily: 'monospace'
              }}>
                {selectedDoc.content}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--fg-dim)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <span>Storage Cluster: AlloyDB-v2-Index</span>
                <span>Security Level: Public Domain Reference</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Expanded Sub-panels Portals ── */}
      {expandedPanel === 'planner' && createPortal(
        <div className="modal-backdrop" onClick={() => setExpandedPanel(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', height: '80vh' }}>
            <div className="modal-head">
              <div className="modal-title" style={{ color: 'var(--teal)' }}>
                <Brain size={16}/>
                Predictive Scenario Planner Console — {city.name}
              </div>
              <button className="modal-close-btn" onClick={() => setExpandedPanel(null)}>
                <X size={16}/>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px 30px' }}>
              {renderPlannerContent()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {expandedPanel === 'rag' && createPortal(
        <div className="modal-backdrop" onClick={() => setExpandedPanel(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', height: '80vh' }}>
            <div className="modal-head">
              <div className="modal-title" style={{ color: 'var(--indigo)' }}>
                <FileText size={16}/>
                Vertex AI RAG Agent & Policy Search Explorer
              </div>
              <button className="modal-close-btn" onClick={() => setExpandedPanel(null)}>
                <X size={16}/>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px 30px' }}>
              {renderRAGContent()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {expandedPanel === 'forecast' && createPortal(
        <div className="modal-backdrop" onClick={() => setExpandedPanel(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', height: '80vh' }}>
            <div className="modal-head">
              <div className="modal-title" style={{ color: 'var(--teal)' }}>
                <BarChart2 size={16}/>
                24-Hour City-Wide Predictive Forecast
              </div>
              <button className="modal-close-btn" onClick={() => setExpandedPanel(null)}>
                <X size={16}/>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px 30px' }}>
              {renderForecastContent(true)}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
