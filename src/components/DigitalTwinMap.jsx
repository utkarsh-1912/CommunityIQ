import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Layers, Activity, AlertTriangle, Droplets, Cpu, Wind, Zap, HeartPulse, GraduationCap, Bus, Flame, Maximize2, X } from 'lucide-react';

const LAYERS = [
  { id: 'none',      icon: <Layers size={11}/>,   label: 'Base Map' },
  { id: 'traffic',   icon: <Activity size={11}/>,  label: 'Traffic Heat' },
  { id: 'flood',     icon: <Droplets size={11}/>,  label: 'Flood Risk' },
  { id: 'aqi',       icon: <Wind size={11}/>,      label: 'Air Quality' },
  { id: 'waste',     icon: <Layers size={11}/>,    label: 'Waste Bins' },
  { id: 'utilities', icon: <Zap size={11}/>,       label: 'Power Grid' },
];

// Helper to dynamically load CDN files
function loadCSS(url) {
  if (document.querySelector(`link[href="${url}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => reject();
    document.head.appendChild(link);
  });
}

function loadJS(url) {
  if (document.querySelector(`script[src="${url}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

export default function DigitalTwinMap({
  ward, setWard, layer, setLayer,
  sim, emergency, emiStep, mitigations, wards, city, settings
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayersRef = useRef([]);
  const heatLayerRef = useRef(null);
  const [libLoaded, setLibLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedBusRoute, setSelectedBusRoute] = useState(null);
  const busRouteLineRef = useRef(null);

  const toggleExpand = () => {
    setExpanded(prev => !prev);
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 120);
  };

  const wardIds = useMemo(() => Object.keys(wards), [wards]);
  const metrics = wards[ward] || {};
  const wardCfg = city?.wards?.[ward] || {};

  // Load Leaflet libraries from CDN
  useEffect(() => {
    Promise.all([
      loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'),
      loadJS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
    ])
    .then(() => {
      // Once Leaflet is loaded, load Leaflet.heat
      return loadJS('https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js');
    })
    .then(() => {
      setLibLoaded(true);
    })
    .catch(err => {
      console.error('Failed to load Leaflet from CDN', err);
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!libLoaded || !mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    // Create map centered on active city
    const map = L.map(mapContainerRef.current, {
      center: [city.lat, city.lon],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Save map reference
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [libLoaded, city.id]); // Re-initialize when library loads or city changes

  // Update Markers & Heatmaps
  useEffect(() => {
    if (!libLoaded || !mapRef.current) return;

    const L = window.L;
    const map = mapRef.current;

    // Clear old markers
    markerLayersRef.current.forEach(m => map.removeLayer(m));
    markerLayersRef.current = [];

    // Clear old heatmap
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    const heatPoints = [];

    // Draw markers / overlays based on selected layer
    Object.entries(wards).forEach(([id, w]) => {
      const cfg = city.wards[id];
      if (!cfg || !cfg.lat || !cfg.lon) return;

      let val = 0;
      let colorClass = 'green';
      let displayVal = '';

      if (layer === 'traffic') {
        val = w.traffic;
        displayVal = `${val}%`;
        colorClass = val > 80 ? 'rose' : val > 60 ? 'amber' : 'green';
        heatPoints.push([cfg.lat, cfg.lon, val / 100]);
      } else if (layer === 'aqi') {
        val = w.aqi;
        displayVal = Math.round(val);
        colorClass = val > 150 ? 'rose' : val > 100 ? 'amber' : 'green';
        heatPoints.push([cfg.lat, cfg.lon, val / 300]);
      } else if (layer === 'flood') {
        val = w.floodRisk;
        displayVal = `${val}%`;
        colorClass = val > 70 ? 'rose' : val > 40 ? 'amber' : 'green';
        heatPoints.push([cfg.lat, cfg.lon, val / 100]);
      } else if (layer === 'waste') {
        val = w.wasteLevel;
        displayVal = `${Math.round(val)}%`;
        colorClass = val > 80 ? 'rose' : val > 60 ? 'amber' : 'green';
      } else if (layer === 'utilities') {
        val = w.electricityLoad;
        displayVal = `${val}%`;
        colorClass = val > 80 ? 'rose' : val > 60 ? 'amber' : 'green';
      } else {
        // base map: display general info
        displayVal = id;
        colorClass = 'teal';
      }

      // Leaflet divIcon representing the telemetry point
      const isSelected = ward === id;
      const customIcon = L.divIcon({
        className: `custom-map-marker ${colorClass} ${isSelected ? 'selected' : ''}`,
        html: `
          <div class="marker-pulse-ring"></div>
          <div class="marker-core">
            <span class="marker-label">${displayVal}</span>
          </div>
        `,
        iconSize: isSelected ? [42, 42] : [34, 34],
        iconAnchor: isSelected ? [21, 21] : [17, 17]
      });

      const marker = L.marker([cfg.lat, cfg.lon], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setWard(id);
        });

      // Save marker layer so we can remove it later
      markerLayersRef.current.push(marker);

      // Draw hospital markers if enabled
      if (settings?.showHospitals && cfg.hospitals > 0) {
        const hospIcon = L.divIcon({
          className: 'hospital-map-marker',
          html: `
            <div class="hosp-marker-core">
              <span>🏥</span>
            </div>
          `,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });
        const latOffset = 0.003;
        const lonOffset = -0.003;
        const hospMarker = L.marker([cfg.lat + latOffset, cfg.lon + lonOffset], { icon: hospIcon })
          .addTo(map)
          .bindPopup(`🏥 <b>Local Medical Facility</b><br/>Serving ${cfg.name?.split('—')[0] || id}`);
        markerLayersRef.current.push(hospMarker);
      }
    });

    // Draw Heatmap Overlay if layer supports heatmaps and data exists
    if (heatPoints.length > 0 && (layer === 'traffic' || layer === 'aqi' || layer === 'flood')) {
      const gradientColors = {
        traffic: { 0.4: 'blue', 0.65: 'lime', 1.0: 'red' },
        aqi:     { 0.4: 'green', 0.65: 'orange', 1.0: 'purple' },
        flood:   { 0.4: 'cyan', 0.65: 'yellow', 1.0: 'red' }
      }[layer];

      if (typeof L.heatLayer === 'function') {
        heatLayerRef.current = L.heatLayer(heatPoints, {
          radius: 70,
          blur: 35,
          maxZoom: 13,
          gradient: gradientColors
        }).addTo(map);
      } else {
        console.warn('L.heatLayer is not loaded yet');
      }
    }

  }, [libLoaded, wards, layer, ward, settings?.showHospitals]); // Re-draw markers when wards state, layer, or selected ward changes

  // Evacuation visual effect when emergency is active
  useEffect(() => {
    if (!libLoaded || !mapRef.current) return;
    const L = window.L;
    const map = mapRef.current;
    
    // Draw red circle overlay in emergency coastal sector
    let emergencyCircle = null;
    if (emergency && layer === 'flood') {
      const coastalWard = Object.entries(city.wards)[1];
      if (coastalWard && coastalWard[1].lat && coastalWard[1].lon) {
        emergencyCircle = L.circle([coastalWard[1].lat, coastalWard[1].lon], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.15,
          radius: 1800,
          className: 'emergency-map-alert-circle'
        }).addTo(map);
      }
    }

    return () => {
      if (emergencyCircle && map) {
        map.removeLayer(emergencyCircle);
      }
    };
  }, [libLoaded, emergency, layer, city.id]);

  // Reset selected route on city/ward changes
  useEffect(() => {
    setSelectedBusRoute(null);
  }, [city.id, ward]);

  // Draw bus route polyline path on Leaflet map dynamically
  useEffect(() => {
    if (!libLoaded || !mapRef.current) return;
    const L = window.L;
    const map = mapRef.current;

    // Clear old route path
    if (busRouteLineRef.current) {
      map.removeLayer(busRouteLineRef.current);
      busRouteLineRef.current = null;
    }

    if (selectedBusRoute && wardCfg && wardCfg.lat && wardCfg.lon) {
      const center = [wardCfg.lat, wardCfg.lon];
      const seed = selectedBusRoute.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const latOffset1 = Math.sin(seed) * 0.012;
      const lonOffset1 = Math.cos(seed) * 0.012;
      const latOffset2 = Math.sin(seed + 1.5) * 0.022;
      const lonOffset2 = Math.cos(seed + 1.5) * 0.022;

      const pathCoords = [
        [center[0] - latOffset1, center[1] - lonOffset1],
        [center[0], center[1]],
        [center[0] + latOffset1, center[1] + lonOffset1],
        [center[0] + latOffset2, center[1] + lonOffset2],
      ];

      const routeLine = L.polyline(pathCoords, {
        color: '#14b8a6', // teal
        weight: 4.5,
        opacity: 0.9,
        dashArray: '6, 8',
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
      routeLine.bindTooltip(`🚌 Bus Route: ${selectedBusRoute}`, { sticky: true });
      busRouteLineRef.current = routeLine;
    }
  }, [libLoaded, selectedBusRoute, ward, city.id, wardCfg]);

  return (
    <>
      {expanded && <div className="modal-backdrop" style={{ zIndex: 2999 }} onClick={toggleExpand} />}
      <div className={`panel ${expanded ? 'expanded' : ''} ${settings?.compactMode ? 'compact-mode' : ''}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="panel-head">
          <div className="panel-head-left">
            <Cpu size={13} className="panel-head-icon"/>
            <span className="panel-head-title">Interactive GIS Digital Twin — {city?.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--fg-muted)' }}>
              <Activity size={10} style={{ color: 'var(--teal)', animation: 'blink-dot 2s ease-in-out infinite' }}/>
              GIS Mode
            </div>
            <button
              onClick={toggleExpand}
              title={expanded ? "Compress map" : "Expand map"}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fg-muted)', padding: '2px' }}
            >
              {expanded ? <X size={14}/> : <Maximize2 size={13}/>}
            </button>
          </div>
        </div>

      <div className="panel-body" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 280, position: 'relative', overflow: 'hidden' }}>
          
          {/* Layer controls on top of map */}
          <div className="layer-panel" style={{ zIndex: 1000 }}>
            {LAYERS.map(l => (
              <button key={l.id} className={`layer-btn ${layer === l.id ? 'on' : ''}`} onClick={() => setLayer(l.id)}>
                {l.icon}{l.label}
              </button>
            ))}
          </div>

          {/* Leaflet Map Div */}
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '100%', background: '#090c15' }}
          />

          {!libLoaded && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: '#090c15', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--fg-muted)', fontSize: 12,
              zIndex: 1001
            }}>
              Loading map engine...
            </div>
          )}

          {/* HUD overlay */}
          <div className="map-hud" style={{ zIndex: 1000 }}>
            <div>
              <div className="hud-name">{wardCfg.name || ward}</div>
              <div className="hud-sub" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {wardCfg.area || 'Zone area'}
              </div>
            </div>
            <div className="hud-kpis">
              {[
                { label: 'Traffic',  value: `${metrics.traffic ?? '—'}%`,          color: metrics.traffic > 75 ? 'var(--rose)' : 'var(--teal)' },
                { label: 'AQI',      value: Math.round(metrics.aqi) ?? '—',        color: metrics.aqi > 100 ? 'var(--amber)' : 'var(--green)' },
                { label: 'Elec.',    value: `${metrics.electricityLoad ?? '—'}%`,  color: metrics.electricityLoad > 82 ? 'var(--rose)' : 'var(--indigo)' },
                { label: 'Flood',    value: `${metrics.floodRisk ?? '—'}%`,        color: metrics.floodRisk > 50 ? 'var(--rose)' : 'var(--sky)' },
              ].map(k => (
                <div key={k.label} className="hud-kpi">
                  <span className="hud-k-lbl">{k.label}</span>
                  <span className="hud-k-val" style={{ color: k.color }}>{k.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ward Detail Panel */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'rgba(0,0,0,.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--fg-muted)', marginBottom: 8 }}>
            {ward} Infrastructure Detail
          </div>
          <div className="ward-detail-grid">
            <div className="ward-detail-stat">
              <div className="ward-detail-label"><HeartPulse size={9} style={{display:'inline',marginRight:3}}/>Hospitals</div>
              <div className="ward-detail-value" style={{ color: 'var(--rose)' }}>{wardCfg.hospitals ?? '—'}</div>
              <div className="ward-detail-sub">Medical facilities</div>
            </div>
            <div className="ward-detail-stat">
              <div className="ward-detail-label"><GraduationCap size={9} style={{display:'inline',marginRight:3}}/>Schools</div>
              <div className="ward-detail-value" style={{ color: '#a78bfa' }}>{wardCfg.schools ?? '—'}</div>
              <div className="ward-detail-sub">Education centres</div>
            </div>
            <div className="ward-detail-stat">
              <div className="ward-detail-label">🏢 Businesses</div>
              <div className="ward-detail-value" style={{ color: 'var(--amber)' }}>
                {wardCfg.businesses ? wardCfg.businesses.toLocaleString() : '—'}
              </div>
              <div className="ward-detail-sub">Registered firms</div>
            </div>
            <div className="ward-detail-stat">
              <div className="ward-detail-label">👥 Population</div>
              <div className="ward-detail-value" style={{ color: 'var(--teal)', fontSize: 14 }}>{wardCfg.population ?? '—'}</div>
              <div className="ward-detail-sub">Residents</div>
            </div>
            <div className="ward-detail-stat">
              <div className="ward-detail-label">❤ NGOs</div>
              <div className="ward-detail-value" style={{ color: 'var(--green)' }}>{wardCfg.ngoCount ?? '—'}</div>
              <div className="ward-detail-sub">Active organizations</div>
            </div>
            <div className="ward-detail-stat">
              <div className="ward-detail-label">♻ Waste</div>
              <div className="ward-detail-value" style={{ color: metrics.wasteLevel > 75 ? 'var(--rose)' : 'var(--green)' }}>
                {Math.round(metrics.wasteLevel ?? 0)}%
              </div>
              <div className="ward-detail-sub">Bin fill level</div>
            </div>
          </div>
          <div className="infra-row">
            <span style={{ fontSize: 9.5, color: 'var(--fg-muted)', marginRight: '6px' }}>Bus routes:</span>
            {(wardCfg.busRoutes || []).map(r => {
              const isActive = selectedBusRoute === r;
              return (
                <span
                  key={r}
                  className={`infra-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedBusRoute(prev => prev === r ? null : r)}
                  style={{
                    cursor: 'pointer',
                    background: isActive ? 'var(--teal-glow)' : 'rgba(255,255,255,0.03)',
                    border: isActive ? '1px solid var(--teal)' : '1px solid var(--border)',
                    boxShadow: isActive ? '0 0 8px rgba(20, 184, 166, 0.4)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Click to view route path on digital twin map"
                >
                  <Bus size={9} style={{ color: isActive ? 'var(--teal)' : 'var(--fg-muted)' }}/>
                  <span style={{ fontSize: '9.5px', fontWeight: isActive ? 800 : 500 }}>{r}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </>
);
}
