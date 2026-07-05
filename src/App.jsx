import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import logoImg from './assets/logo.png';
import {
  LayoutDashboard, Cpu, ShieldAlert, Leaf, MessageSquare, Database, Brain,
  Activity, Bell, Settings, RefreshCw, ChevronDown, MapPin,
  Users, Building2, HeartPulse, GraduationCap, Briefcase, Globe, Info, X,
  Search as SearchIcon
} from 'lucide-react';

import Overview          from './components/Overview';
import DigitalTwinMap    from './components/DigitalTwinMap';
import SimulationSandbox from './components/SimulationSandbox';
import EmergencyAgent    from './components/EmergencyAgent';
import GeminiCopilot     from './components/GeminiCopilot';
import Sustainability    from './components/Sustainability';
import SentimentMonitor  from './components/SentimentMonitor';
import DecisionRoom      from './components/DecisionRoom';
import AboutPage         from './components/AboutPage';
import LandingPage       from './components/LandingPage';
import toast, { Toaster } from 'react-hot-toast';
import DataIngestion     from './components/DataIngestion';
import SearchPanel       from './components/SearchPanel';
import AlertPanel        from './components/AlertPanel';
import SettingsPanel     from './components/SettingsPanel';
import NotFound          from './components/NotFound';
import AccessDenied      from './components/AccessDenied';

import {
  CITIES, DEFAULT_CITY,
  fetchWeather, fetchAQI,
  computeFloodRisk, computeElectricityDemand, computeTrafficLoad,
} from './services/liveData';

import { ROLES } from './config/roles';

// ─── Default settings ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  refreshInterval:  300,
  thresholds:       { aqi: 150, traffic: 80, waste: 80, power: 85, flood: 60 },
  notifyCritical:   true,
  notifyWarning:    true,
  notifyEmergency:  true,
  autoOpenAlert:    true,
  showAnimations:   true,
  showHospitals:    true,
  compactMode:      false,
  theme:            'cyberpunk',
};

// ─── Alert generator ──────────────────────────────────────────────────────────
let _alertId = 1;
function makeAlert(severity, metric, title, desc, zoneId, zoneName, action) {
  const key = `${zoneId || 'global'}-${metric}-${severity}`;
  return { id: _alertId++, key, severity, metric, title, desc, zoneId, zoneName, action, ts: Date.now(), read: false };
}

function evaluateAlerts(wards, city, emergency, settings) {
  const newAlerts = [];
  const thresholds = settings.thresholds;

  Object.entries(wards).forEach(([id, w]) => {
    const zoneName = city?.wards?.[id]?.name?.split('—')[0]?.trim() || id;
    const action   = (page, ward) => ({ page, ward: ward || id });

    if (w.aqi > thresholds.aqi) {
      if (settings.notifyWarning) {
        newAlerts.push(makeAlert('warning', 'aqi', `High AQI in ${zoneName}`,
          `Air Quality Index at ${Math.round(w.aqi)} — exceeds ${thresholds.aqi} threshold. Vulnerable populations at risk.`,
          id, zoneName, action('sustainability')));
      }
    }

    if (w.traffic > thresholds.traffic) {
      if (settings.notifyWarning) {
        newAlerts.push(makeAlert('warning', 'traffic', `Traffic Congestion in ${zoneName}`,
          `Congestion at ${w.traffic}% — above ${thresholds.traffic}% alert level. Bus routes impacted.`,
          id, zoneName, action('twin', id)));
      }
    }

    if (w.wasteLevel > thresholds.waste) {
      if (settings.notifyWarning) {
        newAlerts.push(makeAlert('warning', 'waste', `Waste Overflow in ${zoneName}`,
          `Bin fill at ${Math.round(w.wasteLevel)}% — exceeds ${thresholds.waste}% threshold. Collection required.`,
          id, zoneName, action('sustainability')));
      }
    }

    if (w.electricityLoad > thresholds.power) {
      const isCrit = w.electricityLoad > 95;
      const shouldNotify = isCrit ? settings.notifyCritical : settings.notifyWarning;
      if (shouldNotify) {
        newAlerts.push(makeAlert(isCrit ? 'critical' : 'warning', 'power',
          `High Power Demand in ${zoneName}`,
          `Grid load at ${w.electricityLoad}% — ${isCrit ? 'brownout risk' : 'above threshold'}. Smart load-shaving recommended.`,
          id, zoneName, action('sustainability')));
      }
    }

    if (w.floodRisk > thresholds.flood) {
      const isCrit = w.floodRisk > 75;
      const shouldNotify = isCrit ? (settings.notifyEmergency || settings.notifyCritical) : settings.notifyWarning;
      if (shouldNotify) {
        newAlerts.push(makeAlert(isCrit ? 'critical' : 'warning', 'flood',
          `Flood Risk Elevated in ${zoneName}`,
          `Flood index at ${w.floodRisk}/100 — ${isCrit ? 'evacuate vulnerable zones' : 'monitor drainage capacity'}.`,
          id, zoneName, action('emergency', id)));
      }
    }
  });

  if (emergency && settings.notifyEmergency) {
    newAlerts.unshift(makeAlert('critical', 'emergency', 'Active Emergency Incident',
      'Flood Level 3 alert active. Multi-agent response protocols engaged. Monitor emergency center.',
      null, null, { page: 'emergency' }));
  }

  return newAlerts;
}

// ─── Build initial ward metrics ────────────────────────────────────────────────
function buildInitialWards(city) {
  const hour = new Date().getHours();
  return Object.entries(city.wards).reduce((acc, [id, cfg]) => {
    acc[id] = {
      ...cfg,
      traffic:          computeTrafficLoad(hour, cfg.trafficBase || 0),
      aqi:              75,
      floodRisk:        cfg.floodBase || 10,
      electricityLoad:  computeElectricityDemand(30, cfg.elecBase || 0),
      wasteLevel:       Math.round(28 + Math.random() * 42),
      complaints:       Math.round(Math.random() * 14) + 1,
    };
    return acc;
  }, {});
}

// Convert ISO country code to flag emoji
function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const CITY_NEIGHBORHOODS = {
  delhi: [
    { suffix: 'Aerocity (CBD)',          aqi: 1.0,  flood: 8,  elec: 5,  traffic: 15,  latOffset: -0.065, lonOffset: -0.087, area: 'Indira Gandhi Int Airport' },
    { suffix: 'Abul Fazal Enclave',      aqi: 0.85, flood: 30, elec: 8,  traffic: -5,  latOffset: -0.068, lonOffset: 0.093,  area: 'Okhla, near Yamuna River' },
    { suffix: 'Bawana Industrial Area',  aqi: 1.65, flood: 10, elec: 22, traffic: 10,  latOffset: 0.184,  lonOffset: -0.166, area: 'North West Industrial Zone' },
    { suffix: 'Alaknanda (Residential)', aqi: 0.75, flood: 8,  elec: -2, traffic: -8,  latOffset: -0.088, lonOffset: 0.0425, area: 'South Delhi Green Belt' },
    { suffix: 'Anand Vihar (Transit)',   aqi: 1.25, flood: 15, elec: 10, traffic: 22,  latOffset: 0.033,  lonOffset: 0.107,  area: 'East Delhi ISBT Hub' },
    { suffix: 'Bhalswa Landfill Area',   aqi: 1.45, flood: 22, elec: 5,  traffic: 5,   latOffset: 0.121,  lonOffset: -0.048, area: 'GT Karnal Road Corridor' },
  ],
  newdelhi: [
    { suffix: 'Aerocity (CBD)',          aqi: 1.0,  flood: 8,  elec: 5,  traffic: 15,  latOffset: -0.065, lonOffset: -0.087, area: 'Indira Gandhi Int Airport' },
    { suffix: 'Abul Fazal Enclave',      aqi: 0.85, flood: 30, elec: 8,  traffic: -5,  latOffset: -0.068, lonOffset: 0.093,  area: 'Okhla, near Yamuna River' },
    { suffix: 'Bawana Industrial Area',  aqi: 1.65, flood: 10, elec: 22, traffic: 10,  latOffset: 0.184,  lonOffset: -0.166, area: 'North West Industrial Zone' },
    { suffix: 'Alaknanda (Residential)', aqi: 0.75, flood: 8,  elec: -2, traffic: -8,  latOffset: -0.088, lonOffset: 0.0425, area: 'South Delhi Green Belt' },
    { suffix: 'Anand Vihar (Transit)',   aqi: 1.25, flood: 15, elec: 10, traffic: 22,  latOffset: 0.033,  lonOffset: 0.107,  area: 'East Delhi ISBT Hub' },
    { suffix: 'Bhalswa Landfill Area',   aqi: 1.45, flood: 22, elec: 5,  traffic: 5,   latOffset: 0.121,  lonOffset: -0.048, area: 'GT Karnal Road Corridor' },
  ],
  paris: [
    { suffix: 'Champs-Élysées (CBD)',     aqi: 1.15, flood: 10, elec: 5,  traffic: 18,  latOffset: 0.002,  lonOffset: -0.015, area: '8th Arrondissement' },
    { suffix: 'Seine Riverfront',         aqi: 0.85, flood: 32, elec: 5,  traffic: -2,  latOffset: -0.005, lonOffset: 0.005,  area: 'Île de la Cité, 4th Arr.' },
    { suffix: 'La Défense (Business)',    aqi: 1.35, flood: 8,  elec: 20, traffic: 12,  latOffset: 0.035,  lonOffset: -0.075, area: 'Commercial Tech Hub' },
    { suffix: 'Montmartre (Residential)', aqi: 0.65, flood: 5,  elec: -2, traffic: -8,  latOffset: 0.032,  lonOffset: -0.005, area: '18th Arrondissement' },
    { suffix: 'Gare du Nord Corridor',    aqi: 1.25, flood: 12, elec: 10, traffic: 20,  latOffset: 0.025,  lonOffset: 0.015,  area: '10th Arrondissement Hub' },
    { suffix: 'Saint-Denis Sector',       aqi: 1.45, flood: 18, elec: 12, traffic: 8,   latOffset: 0.065,  lonOffset: 0.025,  area: 'Northern Industrial Belt' },
  ],
  tokyo: [
    { suffix: 'Shinjuku (CBD)',           aqi: 1.15, flood: 8,  elec: 12, traffic: 22,  latOffset: 0.002,  lonOffset: -0.035, area: 'West Tokyo Skyscraper Hub' },
    { suffix: 'Odaiba Waterfront',        aqi: 0.75, flood: 32, elec: 8,  traffic: -5,  latOffset: -0.062, lonOffset: 0.025,  area: 'Tokyo Bay Reclamation Zone' },
    { suffix: 'Ota Industrial Sector',    aqi: 1.55, flood: 15, elec: 22, traffic: 10,  latOffset: -0.125, lonOffset: 0.005,  area: 'Keihin Industrial Corridor' },
    { suffix: 'Setagaya (Residential)',   aqi: 0.65, flood: 12, elec: -3, traffic: -8,  latOffset: -0.025, lonOffset: -0.085, area: 'West Tokyo Green Belt' },
    { suffix: 'Ueno (Transit Corridor)',  aqi: 1.0,  flood: 18, elec: 8,  traffic: 15,  latOffset: 0.045,  lonOffset: 0.025,  area: 'Taito Ward Core' },
    { suffix: 'Chiba Outer District',     aqi: 0.85, flood: 22, elec: 2,  traffic: 4,   latOffset: 0.015,  lonOffset: 0.185,  area: 'Eastern Expansion Zone' },
  ]
};

// Generate 6 structured zones dynamically for searched cities
function generateDynamicWards(cityName, lat, lon, elevation = 0) {
  const isHighAltitude = elevation >= 80;
  const cityKey = cityName.toLowerCase().replace(/[^a-z0-9]/g, '');

  let suffixes;
  if (CITY_NEIGHBORHOODS[cityKey]) {
    suffixes = CITY_NEIGHBORHOODS[cityKey];
  } else {
    // Fallback to elevation-aware suffixes
    suffixes = [
      { suffix: 'Central (CBD)',                       aqi: 1.25, flood: isHighAltitude ? 8 : 12, elec: 5,  traffic: 15,  latOffset: 0.008,  lonOffset: 0.008,  area: `${cityName} Core` },
      { suffix: isHighAltitude ? 'Plateau / Ridge Sector' : 'Waterfront / Canal Zone', aqi: 0.75, flood: isHighAltitude ? 12 : 32, elec: 8,  traffic: -5,  latOffset: -0.012, lonOffset: 0.012,  area: isHighAltitude ? 'Highland Ridge' : 'Waterfront Zone' },
      { suffix: 'Industrial District',                 aqi: 1.65, flood: isHighAltitude ? 10 : 20, elec: 18, traffic: 8,   latOffset: 0.015,  lonOffset: -0.015, area: 'Manufacturing Zone' },
      { suffix: 'Metropolitan East',                   aqi: 1.0,  flood: isHighAltitude ? 8 : 15, elec: 2,  traffic: 10,  latOffset: 0.012,  lonOffset: 0.018,  area: 'East Sector' },
      { suffix: isHighAltitude ? 'Hillside Residential' : 'Bayview / Low-lying Zone',  aqi: 0.55, flood: isHighAltitude ? 15 : 28, elec: -5, traffic: -10, latOffset: -0.015, lonOffset: -0.012, area: 'Residential Belt' },
      { suffix: 'Satellite Township',                  aqi: 0.85, flood: isHighAltitude ? 5 : 10, elec: 0,  traffic: 2,   latOffset: -0.008, lonOffset: -0.008, area: 'Suburban Zone' },
    ];
  }

  return suffixes.reduce((acc, s, idx) => {
    const id = `Zone ${String.fromCharCode(65 + idx)}`;
    const zoneName = CITY_NEIGHBORHOODS[cityKey] ? `${id} — ${s.suffix}` : `${id} — ${cityName} ${s.suffix}`;
    acc[id] = {
      name: zoneName,
      area: s.area || `${cityName} quadrant ${idx + 1}`,
      population: Math.round(120000 + idx * 45000).toLocaleString(),
      hospitals: Math.floor(3 + idx * 1.5),
      schools: Math.floor(15 + idx * 8),
      businesses: Math.floor(800 + idx * 750),
      busRoutes: [`B-${idx + 1}`, `B-${(idx + 3) % 6 + 1}`],
      ngoCount: Math.floor(10 + idx * 4),
      aqiMod: s.aqi,
      floodBase: s.flood,
      elecBase: s.elec,
      trafficBase: s.traffic,
      lat: parseFloat((lat + s.latOffset).toFixed(4)),
      lon: parseFloat((lon + s.lonOffset).toFixed(4)),
    };
    return acc;
  }, {});
}

export default function App() {
  // ── Location & Role ────────────────────────────────────────────────────────
  const [allCities,        setAllCities]        = useState(CITIES);
  const [cityId,           setCityId]           = useState(DEFAULT_CITY);
  const [userLocationName, setUserLocationName] = useState('Bengaluru');
  const [userDetectedCity, setUserDetectedCity] = useState(null);
  const [roleId,           setRoleId]           = useState('admin');
  const [showCityPicker,   setShowCityPicker]   = useState(false);
  const [showRolePicker,   setShowRolePicker]   = useState(false);
  const [citySearchQuery,  setCitySearchQuery]  = useState('');
  const [citySearching,    setCitySearching]    = useState(false);

  const city = allCities[cityId] || CITIES[DEFAULT_CITY];
  const role = ROLES.find(r => r.id === roleId);

  // ── Settings ───────────────────────────────────────────────────────────────
  const [settings,         setSettings]         = useState(DEFAULT_SETTINGS);

  const isInitialLoad = useRef(true);
  const prevCityId = useRef(cityId);

  // ── UI panels ─────────────────────────────────────────────────────────────
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [alertPanelOpen,   setAlertPanelOpen]   = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

  // Close sidebar on any nav click on mobile
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [page,   setPage]   = useState('overview');
  const [ward,   setWard]   = useState(() => Object.keys(CITIES[DEFAULT_CITY].wards)[0]);
  const [layer,  setLayer]  = useState('none');
  const [entered, setEntered] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [aboutTab, setAboutTab] = useState('about');

  // ── Simulation ─────────────────────────────────────────────────────────────
  const [sim, setSim] = useState({ rainfall: 0, busFrequency: 0, signalTiming: 0, gridEfficiency: 10 });

  // ── Emergency ──────────────────────────────────────────────────────────────
  const [emergency,   setEmergency]   = useState(false);
  const [emiStep,     setEmiStep]     = useState(0);
  const [mitigations, setMitigations] = useState(false);

  // ── Ward metrics ───────────────────────────────────────────────────────────
  const [wards, setWards] = useState(() => buildInitialWards(CITIES[DEFAULT_CITY]));

  // ── Real API data ──────────────────────────────────────────────────────────
  const [weather,    setWeather]    = useState(null);
  const [aqiData,    setAqiData]    = useState(null);
  const [apiError,   setApiError]   = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [lastRefresh,setLastRefresh]= useState(null);

  // ── Alerts ─────────────────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState([]);

  // ── Chat ───────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([{
    id: 0, sender: 'bot',
    text: `Welcome to CommunityIQ. Monitoring ${city.name}, ${city.country}. Ask about traffic, air quality, flooding, energy, or waste across any zone.`,
  }]);

  // ── Keyboard shortcut: Cmd/Ctrl+K → search ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(p => !p);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setAlertPanelOpen(false);
        setSettingsPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Theme & Animations effect ──
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(`theme-${settings.theme || 'cyberpunk'}`);
    if (settings.showAnimations === false) {
      document.body.classList.add('no-animations');
    }
  }, [settings.theme, settings.showAnimations]);

  // ── Alert evaluation whenever wards change ─────────────────────────────────
  useEffect(() => {
    const newAlerts = evaluateAlerts(wards, city, emergency, settings);

    const cityChanged = prevCityId.current !== cityId;
    if (cityChanged) {
      prevCityId.current = cityId;
    }

    // Only toast on updates, not on first mount or city switch
    if (!isInitialLoad.current && !cityChanged) {
      const existingKeys = new Set(alerts.map(a => a.key));
      const freshAlerts = newAlerts.filter(a => !existingKeys.has(a.key));

      if (freshAlerts.length > 0) {
        freshAlerts.forEach(a => {
          const icon = a.severity === 'critical' ? '🚨' : '⚠️';
          toast.custom((t) => (
            <div
              className={`custom-toast-card ${a.severity} ${t.visible ? 'animate-enter' : 'animate-leave'}`}
              onClick={() => toast.dismiss(t.id)}
            >
              <div className="toast-icon">{icon}</div>
              <div className="toast-content">
                <div className="toast-title">{a.title}</div>
                <div className="toast-desc">{a.desc}</div>
              </div>
            </div>
          ), {
            id: a.key, // deduplicate automatically by alert type
            duration: 4500
          });
        });
      }
    } else {
      isInitialLoad.current = false;
    }

    setAlerts(newAlerts);
  }, [wards, emergency, city, settings, cityId]);

  const unreadCount = useMemo(() => alerts.filter(a => !a.read).length, [alerts]);
  const criticalCount = useMemo(() => alerts.filter(a => a.severity === 'critical').length, [alerts]);

  const onMarkRead    = useCallback((id) => setAlerts(p => p.map(a => a.id === id ? { ...a, read: true } : a)), []);
  const onMarkAllRead = useCallback(() => setAlerts(p => p.map(a => ({ ...a, read: true }))), []);
  const onClearAll    = useCallback(() => setAlerts([]), []);

  // ── API fetch ──────────────────────────────────────────────────────────────
  const refreshData = useCallback(async (targetCity) => {
    const c = targetCity || city;
    setApiLoading(true); setApiError(null);
    try {
      const [wx, aqi] = await Promise.all([fetchWeather(c), fetchAQI(c)]);
      setWeather(wx); setAqiData(aqi); setLastRefresh(new Date());
      const floodBase = computeFloodRisk(wx);
      const baseElec  = computeElectricityDemand(wx.temperature);
      const hour      = new Date().getHours();
      setWards(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const cfg = c.wards[id] || {};
          const w   = { ...next[id] };
          w.aqi             = Math.round(aqi.aqi * (cfg.aqiMod || 1) + (Math.random() * 10 - 5));
          w.floodRisk       = Math.min(100, Math.max(2, floodBase + (cfg.floodBase || 0)));
          w.electricityLoad = Math.min(99, baseElec + (cfg.elecBase || 0) + Math.round(Math.random() * 8 - 4));
          w.traffic         = computeTrafficLoad(hour, cfg.trafficBase || 0);
          next[id] = w;
        });
        return next;
      });
      if (floodBase > 55) setEmergency(true);
    } catch (e) {
      console.warn('API error:', e.message);
      setApiError(e.message);
    } finally {
      setApiLoading(false);
    }
  }, [city]);

  // ── Auto-refresh on settings.refreshInterval ───────────────────────────────
  useEffect(() => {
    refreshData();
    const id = setInterval(() => refreshData(), settings.refreshInterval * 1000);
    return () => clearInterval(id);
  }, [refreshData, settings.refreshInterval]);

  // ── City switch ────────────────────────────────────────────────────────────
  const switchCity = useCallback((newCityId, isManual = true, detectedName = null) => {
    const nc = allCities[newCityId] || CITIES[newCityId];
    if (!nc) return;

    if (isManual) {
      const current = detectedName || userLocationName || 'Bengaluru';
      const target = nc.name;
      const confirmed = window.confirm(`Confirm Switch:\n\nCurrent Location: ${current}\nTarget Location: ${target}\n\nDo you want to switch?`);
      if (!confirmed) return;
    }

    setCityId(newCityId); setShowCityPicker(false);
    setWards(buildInitialWards(nc));
    setWard(Object.keys(nc.wards)[0]);
    setEmergency(false); setEmiStep(0); setMitigations(false);
    setSim({ rainfall: 0, busFrequency: 0, signalTiming: 0, gridEfficiency: 10 });
    refreshData(nc);
    setMessages([{ id: Date.now(), sender: 'bot', text: `Switched to ${nc.name}, ${nc.country}. Fetching live data...` }]);
  }, [refreshData, allCities, userLocationName]);

  // ── Realtime Geolocation recommendations ──
  const geoRecommendedRef = useRef(false);

  useEffect(() => {
    if (geoRecommendedRef.current) return;
    geoRecommendedRef.current = true;

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.city) {
          setUserLocationName(data.city);

          const userLat = data.latitude;
          const userLon = data.longitude;
          const flag = getFlagEmoji(data.country_code);
          const detectedCityId = data.city.toLowerCase().replace(/[^a-z0-9]/g, '');

          // Check if it matches any of the default cities
          const isDefault = ['newyork', 'london', 'johannesburg', 'mumbai', 'canberra', 'tokyo', 'shanghai'].includes(detectedCityId);

          if (!isDefault) {
            const detectedCityObj = {
              id: detectedCityId,
              name: data.city,
              country: data.country_name || 'Unknown',
              flag,
              lat: userLat,
              lon: userLon,
              timezone: data.timezone || 'UTC',
              waqiSlug: data.city.toLowerCase(),
              wards: generateDynamicWards(data.city, userLat, userLon, 0)
            };
            setUserDetectedCity(detectedCityObj);
          } else {
            // Auto switch to default city on startup if they are physically there
            switchCity(detectedCityId, false, data.city);
          }
        }
      })
      .catch(err => {
        console.log('IP location fetch skipped, using browser GPS fallback:', err.message);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLat = position.coords.latitude;
              const userLon = position.coords.longitude;

              // Default reverse geocoding mock since we only have coords in GPS fallback
              const mockDetectedId = 'bengaluru';
              const isDefault = ['newyork', 'london', 'johannesburg', 'mumbai', 'canberra', 'tokyo', 'shanghai'].includes(mockDetectedId);

              let closestId = DEFAULT_CITY;
              let minDistance = Infinity;

              Object.keys(CITIES).forEach((id) => {
                const c = CITIES[id];
                const dist = Math.pow(c.lat - userLat, 2) + Math.pow(c.lon - userLon, 2);
                if (dist < minDistance) {
                  minDistance = dist;
                  closestId = id;
                }
              });

              switchCity(closestId, false, 'Detected Location');
            },
            (error) => {
              console.log('Location detection skipped:', error.message);
            }
          );
        }
      });
  }, [switchCity]);

  // ── Onboard dynamically detected city ──
  const handleOnboardCity = useCallback((cityObj) => {
    setAllCities(prev => ({ ...prev, [cityObj.id]: cityObj }));
    setCityId(cityObj.id);
    setWards(buildInitialWards(cityObj));
    setWard(Object.keys(cityObj.wards)[0]);
    setEmergency(false); setEmiStep(0); setMitigations(false);
    setSim({ rainfall: 0, busFrequency: 0, signalTiming: 0, gridEfficiency: 10 });
    refreshData(cityObj);
  }, [refreshData]);

  // ── Search & Geocode city ──────────────────────────────────────────────────
  const searchCity = useCallback(async (cityName) => {
    if (!cityName.trim()) return;
    setCitySearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        alert(`City "${cityName}" not found.`);
        return;
      }
      const item = data.results[0];
      const flag = getFlagEmoji(item.country_code);
      const newCityId = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Ask to confirm onboarding switch
      const current = userLocationName || 'Bengaluru';
      const target = item.name;
      const confirmed = window.confirm(`Confirm Onboarding & Switch:\n\nCurrent Location: ${current}\nTarget Location: ${target}\n\nDo you want to switch?`);
      if (!confirmed) {
        setCitySearching(false);
        return;
      }

      const newCity = {
        id: newCityId,
        name: item.name,
        country: item.country || 'Unknown',
        flag,
        lat: item.latitude,
        lon: item.longitude,
        timezone: item.timezone || 'UTC',
        waqiSlug: item.name.toLowerCase(),
        wards: generateDynamicWards(item.name, item.latitude, item.longitude, item.elevation),
      };

      setAllCities(prev => ({ ...prev, [newCityId]: newCity }));
      setCityId(newCityId);
      setShowCityPicker(false);
      setCitySearchQuery('');
      setWards(buildInitialWards(newCity));
      setWard(Object.keys(newCity.wards)[0]);
      setEmergency(false); setEmiStep(0); setMitigations(false);
      setSim({ rainfall: 0, busFrequency: 0, signalTiming: 0, gridEfficiency: 10 });
      refreshData(newCity);
      setMessages([{
        id: Date.now(), sender: 'bot',
        text: `Geocoded and onboarded ${item.name}, ${item.country}. Telemetry streams are now active.`,
      }]);
    } catch (e) {
      console.error(e);
      alert('Geocoding search failed. Please check connection.');
    } finally {
      setCitySearching(false);
    }
  }, [refreshData]);

  // ── Micro-fluctuation loop (3 s) ───────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const hour = new Date().getHours();
      const timeMs = Date.now();
      setWards(prev => {
        const next = { ...prev };
        const keys = Object.keys(next);
        keys.forEach((wardId, idx) => {
          const cfg = city.wards[wardId] || {};
          const m   = { ...next[wardId] };
          
          // Deterministic noise using sine wave based on time and index
          const noise = Math.sin(timeMs / 4000 + idx) * 3;
          
          const tgt = Math.max(10, Math.min(99, (cfg.trafficBase || 0) + 48 - sim.busFrequency * 0.5 - sim.signalTiming * 0.3));
          m.traffic         = Math.max(5, Math.min(99, Math.round(m.traffic * 0.8 + tgt * 0.2 + noise)));
          
          const ePgt = Math.max(15, Math.min(99, 62 - sim.gridEfficiency * 0.85));
          m.electricityLoad = Math.max(10, Math.min(99, Math.round(m.electricityLoad * 0.85 + ePgt * 0.15 + (noise / 2))));
          
          m.wasteLevel      = mitigations && emiStep >= 3
            ? Math.max(8,   Math.round(m.wasteLevel * 0.72))
            : Math.min(100, parseFloat((m.wasteLevel + 0.25).toFixed(1)));
          
          const aqiBase = Math.round((aqiData?.aqi || 80) * (cfg.aqiMod || 1));
          const aqiTgt  = Math.max(5, aqiBase - (sim.rainfall > 40 ? 35 : 0) - Math.round(sim.busFrequency * 0.25));
          m.aqi         = Math.max(5, Math.min(300, Math.round(m.aqi * 0.88 + aqiTgt * 0.12 + (noise * 0.8))));
          
          const coastal = wardId === keys[1] ? 20 : 0;
          m.floodRisk   = Math.max(2, Math.min(100, (cfg.floodBase || 8) + Math.round(sim.rainfall * 0.75) + coastal - (mitigations && emiStep >= 1 ? 45 : 0)));
          next[wardId]  = m;
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [sim, mitigations, emiStep, city, aqiData]);

  useEffect(() => { if (sim.rainfall > 65 && !emergency) setEmergency(true); }, [sim.rainfall, emergency]);

  // ── Sustainability score ────────────────────────────────────────────────────
  const sustainabilityScore = useMemo(() => Math.min(100, Math.max(0,
    72 + Math.round(sim.busFrequency * 0.15) + Math.round(sim.gridEfficiency * 0.18) - Math.round(sim.rainfall * 0.07)
  )), [sim]);

  // ── Presets ────────────────────────────────────────────────────────────────
  const handlePreset = useCallback((type) => {
    if (type === 'reset')    { setSim({ rainfall: 0, busFrequency: 0, signalTiming: 0, gridEfficiency: 10 }); setEmergency(false); setEmiStep(0); setMitigations(false); }
    if (type === 'storm')    { setSim(p => ({ ...p, rainfall: 88, gridEfficiency: 14 })); setEmergency(true); setEmiStep(0); setMitigations(false); }
    if (type === 'rush')     { setSim(p => ({ ...p, busFrequency: 45, signalTiming: 18 })); setLayer('traffic'); }
    if (type === 'brownout') { setSim(p => ({ ...p, gridEfficiency: 42 })); setLayer('utilities'); }
  }, []);

  // ── Emergency ──────────────────────────────────────────────────────────────
  const triggerEmergency = useCallback(() => {
    if (emergency) { setEmergency(false); setEmiStep(0); setMitigations(false); setSim(p => ({ ...p, rainfall: 0 })); }
    else           { setEmergency(true); setSim(p => ({ ...p, rainfall: 88 })); }
  }, [emergency]);

  const triggerMitigations = useCallback(() => {
    setMitigations(true); setEmiStep(0);
    const iv = setInterval(() => setEmiStep(prev => { if (prev >= 2) { clearInterval(iv); return 3; } return prev + 1; }), 1600);
  }, []);

  // ── Chat ───────────────────────────────────────────────────────────────────
  const sendMessage = useCallback((text, setTyping, setLogs) => {
    setMessages(p => [...p, { id: Date.now(), sender: 'user', text }]);
    setTyping(true); setLogs([]);
    const wardIds = Object.keys(wards);
    const chain = [
      'Citizen Agent → routing to orchestrator...',
      `Prediction Agent → querying BigQuery for ${city.name}...`,
      'Vertex AI → running LSTM forecast model...',
      `RAG Pipeline → fetching zone embeddings...`,
      'Recommendation Agent → computing action plan...',
    ];
    let i = 0;
    const logIv = setInterval(() => {
      if (i < chain.length) { setLogs(p => [...p, chain[i]]); i++; }
      else {
        clearInterval(logIv);
        const norm = text.toLowerCase();
        let reply = '', action = null;
        if (norm.includes('traffic') || norm.includes('congestion')) {
          setLayer('traffic');
          const busy = wardIds.reduce((a, b) => (wards[a]?.traffic > wards[b]?.traffic ? a : b));
          reply = `Live telemetry: ${city.wards[busy]?.name || busy} has highest congestion at ${wards[busy]?.traffic}%.\n\nRoutes: ${(city.wards[busy]?.busRoutes || []).join(', ')} are impacted.\n\nRecommendation: +45% bus frequency, +18s signal offset → estimated 34% congestion reduction.`;
          action = { label: '🚌 Apply Bus Optimization', fn: () => setSim(p => ({ ...p, busFrequency: 45, signalTiming: 18 })), layer: 'traffic' };
        } else if (norm.includes('air') || norm.includes('aqi') || norm.includes('pollution')) {
          setLayer('aqi');
          const worst = wardIds.reduce((a, b) => (wards[a]?.aqi > wards[b]?.aqi ? a : b));
          reply = `Real AQI: ${aqiData?.aqi ?? '—'}. ${city.wards[worst]?.name || worst} at AQI ${Math.round(wards[worst]?.aqi)} (worst zone).\n\nDominant: ${aqiData?.dominantPollutant?.toUpperCase() || 'PM2.5'}. ${city.wards[worst]?.hospitals} hospitals in this zone may face increased admissions.`;
        } else if (norm.includes('flood') || norm.includes('rain') || norm.includes('water')) {
          setLayer('flood');
          const high = wardIds.reduce((a, b) => (wards[a]?.floodRisk > wards[b]?.floodRisk ? a : b));
          reply = `Open-Meteo: ${weather?.totalPrecip24h?.toFixed(1) ?? '—'}mm forecast in 24h.\n\n${city.wards[high]?.name || high} — flood index ${wards[high]?.floodRisk}/100.\n\nArea: ${city.wards[high]?.area || '—'} · Population at risk: ${city.wards[high]?.population}.`;
          action = { label: '🚨 Open Emergency Panel', fn: () => { setEmergency(true); setPage('emergency'); } };
        } else if (norm.includes('power') || norm.includes('electric') || norm.includes('energy')) {
          setLayer('utilities');
          const over = wardIds.reduce((a, b) => (wards[a]?.electricityLoad > wards[b]?.electricityLoad ? a : b));
          reply = `Temp: ${weather?.temperature ?? '—'}°C → AC load surge. ${city.wards[over]?.name || over} at ${wards[over]?.electricityLoad}%.\n\n${city.wards[over]?.businesses?.toLocaleString()} businesses at brownout risk.\n\nRecommend grid peak-shaving. Savings: ~${Math.round(sim.gridEfficiency * 0.8 + 15)}MW.`;
          action = { label: '⚡ Enable Grid Shaving', fn: () => setSim(p => ({ ...p, gridEfficiency: 42 })) };
        } else if (norm.includes('waste') || norm.includes('bin') || norm.includes('trash')) {
          setLayer('waste');
          const full = wardIds.reduce((a, b) => (wards[a]?.wasteLevel > wards[b]?.wasteLevel ? a : b));
          reply = `${city.wards[full]?.name || full} bins at ${wards[full]?.wasteLevel?.toFixed(0)}% (critical). Dispatching 3 collection vehicles. ETA 35 minutes.`;
        } else if (norm.includes('hospital') || norm.includes('health')) {
          reply = `Healthcare in ${city.name}:\n${wardIds.map(id => `• ${city.wards[id]?.name?.split('—')[0]}: ${city.wards[id]?.hospitals} hospitals`).join('\n')}\n\nTotal: ${wardIds.reduce((a,id)=>a+(city.wards[id]?.hospitals||0),0)} facilities. High-AQI zones need mobile health units.`;
        } else if (norm.includes('school') || norm.includes('educat')) {
          reply = `Schools in ${city.name}:\n${wardIds.map(id => `• ${city.wards[id]?.name?.split('—')[0]}: ${city.wards[id]?.schools} schools`).join('\n')}\n\nTotal: ${wardIds.reduce((a,id)=>a+(city.wards[id]?.schools||0),0)} institutions.`;
        } else if (norm.includes('alert') || norm.includes('critical')) {
          const crits = alerts.filter(a => a.severity === 'critical');
          reply = `${crits.length} critical alerts active in ${city.name}.\n\n${crits.map(a => `• ${a.title}: ${a.desc}`).join('\n') || 'No critical alerts currently.'}\n\nAll alerts viewable in the notification center (bell icon).`;
        } else {
          reply = `${city.flag} ${city.name} — Live Dashboard Summary:\n\nGreen Score: ${sustainabilityScore}/100 | AQI: ${aqiData?.aqi ?? '—'} | Temp: ${weather?.temperature ?? '—'}°C | Alerts: ${alerts.length} (${criticalCount} critical)\n\nMonitoring ${wardIds.length} zones across ${city.name}. Ask about traffic, air quality, flooding, power, hospitals, or schools.`;
        }
        setTyping(false);
        setMessages(p => [...p, { id: Date.now(), sender: 'bot', text: reply, action }]);
        if (action?.fn) action.fn();
      }
    }, 480);
  }, [wards, weather, aqiData, emergency, sim, city, sustainabilityScore, alerts, criticalCount]);

  // ── Search navigation handler ──────────────────────────────────────────────
  const handleSearchNavigate = useCallback((targetPage, targetWard) => {
    setPage(targetPage);
    if (targetWard) setWard(targetWard);
  }, []);

  const PAGE_TITLE = {
    overview:       'Overview Dashboard',
    twin:           'Digital Twin Simulator',
    decision:       'AI Decision Room & Sandbox',
    emergency:      'Emergency Operations Center',
    sustainability: 'Sustainability & Utilities',
    sentiment:      'Citizen Sentiment Monitor',
    ingestion:      'Data Ingestion Portal',
    about:          'About CommunityIQ',
    privacy:        'Data Privacy & Governance',
    '404':          'Page Not Found',
    '403':          'Access Restricted',
  };

  const ALL_NAV = [
    { id: 'overview',       icon: <LayoutDashboard size={14}/>, label: 'Overview' },
    { id: 'twin',           icon: <Cpu size={14}/>,             label: 'Twin Simulator' },
    { id: 'decision',       icon: <Brain size={14}/>,           label: 'AI Decision Room' },
    { id: 'emergency',      icon: <ShieldAlert size={14}/>,     label: 'Emergency Center', alert: emergency },
    { id: 'sustainability', icon: <Leaf size={14}/>,            label: 'Sustainability' },
    { id: 'sentiment',      icon: <MessageSquare size={14}/>,   label: 'Sentiment Monitor' },
    { id: 'ingestion',      icon: <Database size={14}/>,        label: 'Data Portal' },
  ];

  // ── Page filtering ─────────────────────────────────────────────────────────
  const allPageIds    = ALL_NAV.map(n => n.id);
  const allowedPages  = role?.pages || ROLES[0].pages;
  const isPageValid   = allPageIds.includes(page);
  const isPageAllowed = allowedPages.includes(page);
  const safePage      = isPageValid && isPageAllowed ? page : (!isPageValid ? '404' : '403');

  const mapProps = { ward, setWard, layer, setLayer, sim, emergency, emiStep, mitigations, wards };

  const renderPage = () => {
    if (!isPageValid) {
      return <NotFound currentCity={city} setPage={setPage}/>;
    }
    if (!isPageAllowed) {
      return <AccessDenied role={role} setPage={setPage}/>;
    }

    switch (page) {
      case 'overview':
        return <Overview
          wards={wards} city={city} weather={weather} aqiData={aqiData}
          emergency={emergency} sim={sim} sustainabilityScore={sustainabilityScore}
          setPage={setPage} apiLoading={apiLoading} apiError={apiError}
          role={role} alerts={alerts}
        />;
      case 'twin':
        return (
          <div className="grid-2 fade-in" style={{ height: 'calc(100vh - 58px - 44px)' }}>
            <DigitalTwinMap {...mapProps} city={city} settings={settings}/>
            <div className="col">
              <SimulationSandbox sim={sim} setSim={setSim} handlePreset={handlePreset} weather={weather}/>
              <GeminiCopilot messages={messages} sendMessage={sendMessage} setLayer={setLayer} setWard={setWard}/>
            </div>
          </div>
        );
      case 'emergency':
        return (
          <div className="grid-2-rev fade-in" style={{ height: 'calc(100vh - 58px - 44px)' }}>
            <EmergencyAgent {...{ emergency, triggerEmergency, emiStep, mitigations, triggerMitigations, weather, wards, city, sim }}/>

            <DigitalTwinMap {...mapProps} city={city} layer="flood" settings={settings}/>
          </div>
        );
      case 'sustainability':
        return <Sustainability sim={sim} wards={wards} weather={weather} sustainabilityScore={sustainabilityScore} city={city}/>;
      case 'sentiment':
        return (
          <div className="grid-2 fade-in" style={{ height: 'calc(100vh - 58px - 44px)' }}>
            <SentimentMonitor wards={wards} sim={sim} weather={weather} city={city}/>
            <GeminiCopilot messages={messages} sendMessage={sendMessage} setLayer={setLayer} setWard={setWard}/>
          </div>
        );
      case 'ingestion':
        return <DataIngestion wards={wards} weather={weather} aqiData={aqiData} sim={sim} city={city}/>;
      case 'decision':
        return <DecisionRoom city={city} />;
      default: return null;
    }
  };

  // Build page list for search index
  const pagesList = ALL_NAV.filter(n => allowedPages.includes(n.id)).map(n => ({
    id: n.id, label: n.label, desc: PAGE_TITLE[n.id] || n.label, icon: n.icon,
  }));

  const closePickers = () => { setShowCityPicker(false); setShowRolePicker(false); };

  if (!entered) {
    return (
      <LandingPage
        onEnter={() => setEntered(true)}
        initialCityId={cityId}
        onCitySelect={(id) => switchCity(id, false)}
        cities={allCities}
        userDetectedCity={userDetectedCity}
        onOnboardCity={handleOnboardCity}
      />
    );
  }

  return (
    <div className={`shell theme-${settings.theme || 'cyberpunk'}`} onClick={closePickers}>
      {/* ── Search Overlay ─────────────────────────────────────────────── */}
      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        wards={wards}
        city={city}
        pages={pagesList}
        alerts={alerts}
        allCities={allCities}
        onNavigate={handleSearchNavigate}
        onPreset={handlePreset}
        onLayer={setLayer}
        onCityChange={switchCity}
      />

      {/* ── Alert Panel ────────────────────────────────────────────────── */}
      {alertPanelOpen && (
        <AlertPanel
          open={alertPanelOpen}
          onClose={() => setAlertPanelOpen(false)}
          alerts={alerts}
          onMarkRead={onMarkRead}
          onClearAll={onClearAll}
          onNavigate={handleSearchNavigate}
          unreadCount={unreadCount}
        />
      )}

      {/* ── Settings Panel ─────────────────────────────────────────────── */}
      {settingsPanelOpen && (
        <SettingsPanel
          open={settingsPanelOpen}
          onClose={() => setSettingsPanelOpen(false)}
          settings={settings}
          onSave={setSettings}
          cityId={cityId}
          roleId={roleId}
          onCityChange={switchCity}
          onRoleChange={(id) => { setRoleId(id); setPage(ROLES.find(r => r.id === id)?.pages[0] || 'overview'); }}
          cities={allCities}
        />
      )}

      {/* ── Sidebar Overlay ──────────────────────────────────────────────── */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img
            src={logoImg}
            alt="CommunityIQ"
            style={{ height: 36, width: 'auto', objectFit: 'contain' }}
          />
          <div>
            <div className="sidebar-app-name">CommunityIQ</div>
            <div className="sidebar-app-sub">City OS Platform</div>
          </div>
          {/* Mobile close button */}
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close menu">
            ×
          </button>
        </div>

        {/* Search trigger in sidebar */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <button
            className="sidebar-search-btn"
            onClick={e => { e.stopPropagation(); setSearchOpen(true); }}
          >
            <SearchIcon size={12} style={{ color: 'var(--fg-muted)' }}/>
            <span>Search anything...</span>
            <kbd className="search-kbd" style={{ marginLeft: 'auto', fontSize: 9 }}>⌘K</kbd>
          </button>
        </div>

        {/* City selector */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <div className="city-selector-btn"
            onClick={e => { e.stopPropagation(); setShowCityPicker(p => !p); setShowRolePicker(false); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <MapPin size={12} style={{ color: 'var(--teal)', flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{city.flag} {city.name}</div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-muted)' }}>{city.country}</div>
              </div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--fg-muted)', flexShrink: 0 }}/>
          </div>
          {showCityPicker && (
            <div className="dropdown-card" onClick={e => e.stopPropagation()}>
              <div className="dropdown-title"><Globe size={10}/>Select City</div>
              
              {/* Dynamic City Search Row */}
              <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
                <input
                  type="text"
                  placeholder="Onboard city (e.g. Paris)..."
                  className="search-input"
                  style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: '4px', flex: 1 }}
                  value={citySearchQuery}
                  onChange={e => setCitySearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      searchCity(citySearchQuery);
                    }
                  }}
                />
                <button
                  onClick={() => searchCity(citySearchQuery)}
                  disabled={citySearching}
                  style={{
                    background: 'var(--teal)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0 8px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    opacity: citySearching ? 0.6 : 1
                  }}
                >
                  {citySearching ? '...' : 'Go'}
                </button>
              </div>

              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {Object.values(allCities).map(c => (
                  <div key={c.id} className={`dropdown-item ${c.id === cityId ? 'active' : ''}`} onClick={() => switchCity(c.id)}>
                    <span style={{ fontSize: 14 }}>{c.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{c.name}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--fg-muted)' }}>{c.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role selector */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <div className="city-selector-btn"
            onClick={e => { e.stopPropagation(); setShowRolePicker(p => !p); setShowCityPicker(false); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ color: role?.color, display: 'flex' }}>{role?.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{role?.label}</div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-muted)' }}>{role?.desc}</div>
              </div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--fg-muted)', flexShrink: 0 }}/>
          </div>
          {showRolePicker && (
            <div className="dropdown-card" onClick={e => e.stopPropagation()}>
              <div className="dropdown-title"><Users size={10}/>Select Role</div>
              {ROLES.map(r => (
                <div key={r.id} className={`dropdown-item ${r.id === roleId ? 'active' : ''}`}
                  onClick={() => { setRoleId(r.id); setShowRolePicker(false); setPage(r.pages[0]); }}>
                  <span style={{ color: r.color, display: 'flex' }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{r.label}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--fg-muted)' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {ALL_NAV.filter(n => allowedPages.includes(n.id)).map(n => (
            <button key={n.id} className={`nav-item ${safePage === n.id ? 'active' : ''}`} onClick={() => { setPage(n.id); closeSidebar(); }}>
              {n.icon}
              {n.label}
              {n.alert && <span className="nav-badge">!</span>}
            </button>
          ))}
        </nav>

        {/* Alert summary in sidebar */}
        {alerts.length > 0 && (
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
            <button
              className="sidebar-alert-strip"
              onClick={e => { e.stopPropagation(); setAlertPanelOpen(true); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={12} style={{ color: criticalCount > 0 ? 'var(--rose)' : 'var(--amber)' }}/>
                <span style={{ fontSize: 11, fontWeight: 600, color: criticalCount > 0 ? 'var(--rose)' : 'var(--amber)' }}>
                  {criticalCount > 0 ? `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''}` : `${alerts.length} warnings active`}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--fg-muted)' }}>View →</span>
            </button>
          </div>
        )}

        <div className="sidebar-foot">
          <div className="live-dot"/>
          <span>Telemetry live · {city.name}</span>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <section className="content">
        <header className="topbar">
          {/* Hamburger — only visible on mobile via CSS */}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Toggle menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect y="2" width="16" height="2" rx="1" fill="currentColor"/>
              <rect y="7" width="16" height="2" rx="1" fill="currentColor"/>
              <rect y="12" width="16" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <div className="topbar-title">
            <Activity size={15}/>
            {PAGE_TITLE[safePage]}
          </div>
          <div className="topbar-right">
            {emergency && (
              <button
                className="badge alert topbar-emergency-btn"
                onClick={() => setPage('emergency')}
              >
                <span className="dot"/>Flood Alert Active
              </button>
            )}
            {lastRefresh && (
              <span style={{ fontSize: 10, color: 'var(--fg-muted)' }} title={`Local time in ${city.name}`}>
                {lastRefresh.toLocaleTimeString('en-US', { timeZone: city.timezone })}
              </span>
            )}
            <button
              onClick={() => { setAboutModalOpen(true); setAboutTab('about'); }}
              className="topbar-icon-btn"
              title="About & Privacy"
            >
              <Info size={14} style={{ color: 'var(--fg-muted)' }}/>
            </button>
            <button onClick={() => refreshData()} className="topbar-icon-btn" title="Refresh data">
              <RefreshCw size={14} style={apiLoading ? { animation: 'spin 1s linear infinite' } : {}}/>
            </button>
            {/* Bell with badge */}
            <button
              className={`topbar-icon-btn ${unreadCount > 0 ? 'has-badge' : ''}`}
              onClick={e => { e.stopPropagation(); setAlertPanelOpen(p => !p); setSettingsPanelOpen(false); }}
              title="Alerts"
              style={{ position: 'relative' }}
            >
              <Bell size={14} style={{ color: unreadCount > 0 ? 'var(--amber)' : 'var(--fg-muted)' }}/>
              {unreadCount > 0 && (
                <span className="topbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {/* Settings */}
            <button
              className="topbar-icon-btn"
              onClick={e => { e.stopPropagation(); setSettingsPanelOpen(p => !p); setAlertPanelOpen(false); }}
              title="Settings"
            >
              <Settings size={14} style={{ color: settingsPanelOpen ? 'var(--teal)' : 'var(--fg-muted)' }}/>
            </button>
          </div>
        </header>
        <div className="page-wrap">
          {renderPage()}
        </div>
      </section>
      <Toaster position="top-right" reverseOrder={false} />

      {/* About & Privacy Info Modal */}
      {aboutModalOpen && createPortal(
        <div className="modal-backdrop" onClick={() => setAboutModalOpen(false)} style={{ zIndex: 100000 }}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', height: '80vh' }}>
            <div className="modal-head" style={{ background: 'rgba(0,0,0,0.1)' }}>
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16}/>
                Platform Disclosures & Privacy Policy
              </div>
              <button className="modal-close-btn" onClick={() => setAboutModalOpen(false)}>
                <X size={16}/>
              </button>
            </div>
            
            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid var(--border)', padding: '10px 20px', background: 'rgba(0,0,0,0.05)' }}>
              <button
                onClick={() => setAboutTab('about')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: aboutTab === 'about' ? 'var(--teal)' : 'var(--fg-muted)',
                  fontWeight: 700,
                  fontSize: '12px',
                  borderBottom: aboutTab === 'about' ? '2px solid var(--teal)' : 'none',
                  paddingBottom: '4px'
                }}
              >
                About Platform
              </button>
              <button
                onClick={() => setAboutTab('privacy')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: aboutTab === 'privacy' ? 'var(--rose)' : 'var(--fg-muted)',
                  fontWeight: 700,
                  fontSize: '12px',
                  borderBottom: aboutTab === 'privacy' ? '2px solid var(--rose)' : 'none',
                  paddingBottom: '4px'
                }}
              >
                Data Privacy Policy
              </button>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
              <AboutPage city={city} view={aboutTab} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
