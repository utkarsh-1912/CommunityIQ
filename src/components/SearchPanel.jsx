import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, X, LayoutDashboard, Cpu, ShieldAlert, Leaf,
  MessageSquare, Database, MapPin, Zap, Wind, Activity,
  Droplets, Trash2, Command, ArrowRight, Globe
} from 'lucide-react';

const SYNONYMS = {
  rain: ['storm', 'flood', 'rain', 'monsoon', 'precipitation', 'downpour', 'water', 'wet', 'drainage'],
  flood: ['storm', 'flood', 'rain', 'monsoon', 'precipitation', 'downpour', 'water', 'wet', 'drainage'],
  traffic: ['traffic', 'congestion', 'cars', 'delay', 'bus', 'transit', 'jam', 'road', 'commute', 'vehicle'],
  power: ['grid', 'electricity', 'power', 'brownout', 'load', 'energy', 'ac', 'voltage', 'blackout', 'shaving'],
  waste: ['bin', 'waste', 'trash', 'garbage', 'rubbish', 'landfill', 'litter', 'recycling', 'clean'],
  aqi: ['air', 'aqi', 'pollution', 'smog', 'smoke', 'breathing', 'pm25', 'pm10', 'respiratory', 'exhaust'],
  hospital: ['medical', 'hospital', 'clinic', 'emergency', 'doctor', 'outbreak', 'health', 'injury', 'responder'],
  school: ['college', 'education', 'school', 'student', 'class', 'classroom', 'university'],
  city: ['city', 'location', 'country', 'place', 'switch', 'change', 'recommend']
};

function getSemanticScore(query, item) {
  const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const targetText = [item.title, item.desc, item.keywords].join(' ').toLowerCase();

  let score = 0;

  // 1. Direct substring match (exact matches get a major boost)
  if (targetText.includes(query.toLowerCase())) {
    score += 10;
  }

  // 2. Token overlap and synonym expansion
  queryTokens.forEach(token => {
    // Check if token exists directly in target text
    if (targetText.includes(token)) {
      score += 4;
    }

    // Check synonym matches
    Object.entries(SYNONYMS).forEach(([key, synonyms]) => {
      if (token === key || synonyms.includes(token)) {
        const hasMatch = synonyms.some(syn => targetText.includes(syn));
        if (hasMatch) {
          score += 3;
        }
      }
    });
  });

  return score;
}

// All searchable items
function buildIndex(wards, city, pages, alerts, allCities) {
  const items = [];

  // Pages
  pages.forEach(p => items.push({
    type: 'page', id: p.id, title: p.label, icon: p.icon,
    desc: p.desc, action: { page: p.id },
    keywords: [p.label, p.id].join(' ').toLowerCase(),
  }));

  // Cities (Suggest cities in search!)
  if (allCities) {
    Object.values(allCities).forEach(c => {
      items.push({
        type: 'city', id: `city-${c.id}`, title: `${c.flag} Switch to ${c.name}`,
        icon: <Globe size={13}/>,
        desc: `Switch dashboard telemetry and maps context to ${c.name}, ${c.country}`,
        action: { cityId: c.id },
        keywords: [c.name, c.country, 'switch', 'city', 'location', 'telemetry', 'realtime'].join(' ').toLowerCase(),
      });
    });
  }

  // Zones
  Object.entries(wards).forEach(([id, w]) => {
    const cfg = city?.wards?.[id] || {};
    items.push({
      type: 'zone', id, title: cfg.name || w.name || id,
      icon: <MapPin size={13}/>,
      desc: `Pop: ${cfg.population || '—'} · AQI ${Math.round(w.aqi)} · Traffic ${w.traffic}%`,
      action: { page: 'twin', ward: id },
      keywords: [(cfg.name || id), (cfg.area || ''), id].join(' ').toLowerCase(),
    });
  });

  // Quick actions
  const actions = [
    { id: 'qa-storm',    title: 'Trigger Storm Scenario',   desc: 'Simulate heavy rainfall & flood emergency', icon: <Droplets size={13}/>, action: { preset: 'storm' },    keywords: 'storm flood rain emergency precipitation downpour' },
    { id: 'qa-rush',     title: 'Rush Hour Optimization',    desc: 'Deploy bus frequency & signal timing boost', icon: <Activity size={13}/>, action: { preset: 'rush' },     keywords: 'rush traffic congestion bus transit commute road jam' },
    { id: 'qa-brownout', title: 'Grid Brownout Scenario',    desc: 'Simulate power grid stress & load balancing', icon: <Zap size={13}/>,      action: { preset: 'brownout' }, keywords: 'brownout power grid electricity energy load shaving' },
    { id: 'qa-reset',    title: 'Reset All Simulations',     desc: 'Clear all active simulation parameters',    icon: <X size={13}/>,         action: { preset: 'reset' },    keywords: 'reset clear simulation parameter' },
  ];
  actions.forEach(a => items.push({ type: 'action', ...a }));

  // Layer shortcuts
  const layers = [
    { id: 'l-traffic',   title: 'View Traffic Layer',    icon: <Activity size={13}/>,  action: { page: 'twin', layer: 'traffic'   }, keywords: 'traffic layer congestion jam commute road cars' },
    { id: 'l-flood',     title: 'View Flood Risk Layer', icon: <Droplets size={13}/>,  action: { page: 'twin', layer: 'flood'     }, keywords: 'flood risk layer rain storm water drainage' },
    { id: 'l-aqi',       title: 'View Air Quality Layer',icon: <Wind size={13}/>,      action: { page: 'twin', layer: 'aqi'       }, keywords: 'air quality aqi layer pollution smog dust smoke' },
    { id: 'l-waste',     title: 'View Waste Bin Layer',  icon: <Trash2 size={13}/>,    action: { page: 'twin', layer: 'waste'     }, keywords: 'waste bin layer trash garbage rubbish recycling' },
    { id: 'l-utilities', title: 'View Power Grid Layer', icon: <Zap size={13}/>,       action: { page: 'twin', layer: 'utilities' }, keywords: 'power electricity grid layer energy battery load' },
  ];
  layers.forEach(l => items.push({ type: 'layer', ...l }));

  // Alerts
  alerts.slice(0, 5).forEach(a => items.push({
    type: 'alert', id: `alert-${a.id}`, title: a.title,
    icon: <ShieldAlert size={13}/>, desc: a.desc,
    action: a.action,
    keywords: [a.title, a.desc, a.zoneId || ''].join(' ').toLowerCase(),
  }));

  return items;
}

const TYPE_COLORS = {
  page:   'var(--teal)',
  city:   '#a78bfa',
  zone:   'var(--sky)',
  action: 'var(--amber)',
  layer:  'var(--indigo)',
  alert:  'var(--rose)',
};

const TYPE_LABELS = {
  page: 'Page', city: 'City', zone: 'Zone', action: 'Action', layer: 'Layer', alert: 'Alert',
};

export default function SearchPanel({
  open, onClose, wards, city, pages, alerts, allCities,
  onNavigate, onPreset, onLayer, onCityChange,
}) {
  const [query,   setQuery]   = useState('');
  const [selIdx,  setSelIdx]  = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQuery(''); setSelIdx(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const index   = useMemo(() => buildIndex(wards, city, pages, alerts, allCities), [wards, city, pages, alerts, allCities]);
  
  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 12);
    
    // Compute semantic score and sort descending
    return index
      .map(item => ({ item, score: getSemanticScore(query, item) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item)
      .slice(0, 12);
  }, [query, index]);

  useEffect(() => { setSelIdx(0); }, [results]);

  const execute = (item) => {
    if (!item) return;
    if (item.action?.preset) onPreset(item.action.preset);
    if (item.action?.layer)  onLayer(item.action.layer);
    if (item.action?.cityId && onCityChange) onCityChange(item.action.cityId);
    if (item.action?.page)   onNavigate(item.action.page, item.action.ward);
    onClose();
  };

  const onKey = (e) => {
    if (e.key === 'Escape')    { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelIdx(p => Math.min(p + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelIdx(p => Math.max(p - 1, 0)); }
    if (e.key === 'Enter')     { execute(results[selIdx]); }
  };

  if (!open) return null;

  const grouped = {};
  results.forEach(r => { if (!grouped[r.type]) grouped[r.type] = []; grouped[r.type].push(r); });

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="search-input-row">
          <Search size={16} style={{ color: 'var(--fg-muted)', flexShrink: 0 }}/>
          <input
            ref={inputRef}
            className="search-input"
            placeholder={`Search zones, pages, cities (semantic search active)...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>

        {/* Results */}
        <div className="search-results">
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--fg-muted)', fontSize: 13 }}>
              No semantic search matches for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="search-section-label">
                  <span style={{ color: TYPE_COLORS[type] }}>{TYPE_LABELS[type] || type}s</span>
                </div>
                {items.map((item, i) => {
                  const globalIdx = results.indexOf(item);
                  return (
                    <div
                      key={item.id}
                      className={`search-result-item ${globalIdx === selIdx ? 'selected' : ''}`}
                      onClick={() => execute(item)}
                      onMouseEnter={() => setSelIdx(globalIdx)}
                    >
                      <div className="search-item-icon" style={{ color: TYPE_COLORS[type] }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="search-item-title">{item.title}</div>
                        {item.desc && <div className="search-item-desc">{item.desc}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span className="search-item-type" style={{ background: `${TYPE_COLORS[type]}18`, color: TYPE_COLORS[type] }}>
                          {TYPE_LABELS[type]}
                        </span>
                        <ArrowRight size={11} style={{ color: 'var(--fg-dim)', opacity: globalIdx === selIdx ? 1 : 0 }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="search-footer">
          <span><kbd className="search-kbd">↑↓</kbd> navigate</span>
          <span><kbd className="search-kbd">↵</kbd> select</span>
          <span><kbd className="search-kbd">ESC</kbd> close</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Globe size={10}/> {city?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
