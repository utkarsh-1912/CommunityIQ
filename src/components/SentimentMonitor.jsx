import React, { useState, useEffect, useMemo } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const POSITIVE_TEMPLATES = [
  (w) => `New bus routes in ${w} are a huge improvement! Commute time halved. 👏`,
  (w) => `Parks in ${w} are beautiful this season. Great work city council!`,
  (w) => `Road resurfacing in ${w} completed ahead of schedule. Excellent service!`,
  (w) => `Street lighting upgrades in ${w} make the area feel much safer at night.`,
  (w) => `Water supply in ${w} has been consistent all week. Thank you!`,
];

const NEUTRAL_TEMPLATES = [
  (w) => `Any update on the road expansion project in ${w}?`,
  (w) => `When will the new waste collection schedule be active in ${w}?`,
  (w) => `${w} residents asking about community health camp dates.`,
  (w) => `Traffic signal at Main & Ring Road in ${w} has been amber-flashing for 2 days.`,
];

const TRAFFIC_COMPLAINTS = [
  (w) => `Stuck at a standstill in ${w} for 40 minutes. City traffic management needs a major overhaul! 🚗💨`,
  (w) => `Bumper to bumper transit delays in ${w}. Total gridlock today.`,
  (w) => `Extreme congestion on the main junction in ${w}. Traffic signals are poorly timed!`,
];

const AQI_COMPLAINTS = [
  (w) => `The smog in ${w} is unbearable today. Eyes burning. Air Quality is in dangerous zones! 😷`,
  (w) => `Industrial dust settling in ${w} homes. Can we get strict emission checking?`,
  (w) => `Air quality index is extremely high in ${w}. Kids coughing, unsafe to play outside.`,
];

const WASTE_COMPLAINTS = [
  (w) => `Overflowing waste bins on the sidewalk in ${w}. Disgusting and attracting pests! 🗑`,
  (w) => `Garbage disposal trucks skipped ${w} this morning. Waste accumulation is critical.`,
  (w) => `Rotting garbage smell spreading in ${w} residential blocks. Clean it up please!`,
];

const POWER_COMPLAINTS = [
  (w) => `Unexpected power cut in ${w} during peak working hours. Businesses losing productivity! ⚡`,
  (w) => `Voltage fluctuations in ${w} damaged my refrigerator. Please stabilize the grid.`,
  (w) => `Electricity load-shaving in ${w} is making summer heat unbearable.`,
];

const FLOOD_COMPLAINTS = [
  (w) => `Water logging in ${w} coastal sectors. Streets turning into rivers! 🌧💧`,
  (w) => `Blocked storm drains in ${w} leading to local flooding. High water damage risk.`,
  (w) => `Beach Road in ${w} is impassable due to rapid coastal water accumulation.`,
];

// Seeded PRNG to avoid Math.random
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Deterministic item selector
function selectItem(arr, seed) {
  const idx = Math.floor(seededRandom(seed) * arr.length);
  return arr[idx];
}

// Generate realistic complaint matching the current ward metrics
function generatePost(wards, tickCount) {
  const wardIds   = Object.keys(wards);
  // Pick ward deterministically based on tick count
  const wId       = wardIds[tickCount % wardIds.length];
  const w         = wards[wId];
  const wName     = w?.name?.split('—')?.[0]?.trim() || wId;

  // Decide sentiment and template based on actual ward data
  let text = '';
  let sentiment = 'neu';

  const seed = tickCount * 13 + wName.charCodeAt(0);

  if (w.floodRisk > 55) {
    text = selectItem(FLOOD_COMPLAINTS, seed)(wName);
    sentiment = 'neg';
  } else if (w.traffic > 78) {
    text = selectItem(TRAFFIC_COMPLAINTS, seed)(wName);
    sentiment = 'neg';
  } else if (w.aqi > 130) {
    text = selectItem(AQI_COMPLAINTS, seed)(wName);
    sentiment = 'neg';
  } else if (w.wasteLevel > 78) {
    text = selectItem(WASTE_COMPLAINTS, seed)(wName);
    sentiment = 'neg';
  } else if (w.electricityLoad > 85) {
    text = selectItem(POWER_COMPLAINTS, seed)(wName);
    sentiment = 'neg';
  } else {
    // Normal parameters: check if we have positive comments or neutral
    const r = seededRandom(seed);
    if (r < 0.45) {
      text = selectItem(POSITIVE_TEMPLATES, seed)(wName);
      sentiment = 'pos';
    } else {
      text = selectItem(NEUTRAL_TEMPLATES, seed)(wName);
      sentiment = 'neu';
    }
  }

  return {
    id:   tickCount + seed * 0.001,
    ward: wId,
    text,
    sentiment,
    time: new Date(Date.now() - (30 - (tickCount % 30)) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

const SEED_COUNT = 10;

export default function SentimentMonitor({ wards, sim, weather, city }) {
  const [feed, setFeed] = useState([]);
  const [tick, setTick] = useState(0);

  // Initialize and update feed deterministically
  useEffect(() => {
    // Seed initial posts
    const initialFeed = [];
    for (let i = 0; i < SEED_COUNT; i++) {
      initialFeed.push(generatePost(wards, i));
    }
    setFeed(initialFeed.reverse());
    setTick(SEED_COUNT);
  }, [wards, city]);

  // Feed simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => {
        const nextPost = generatePost(wards, t);
        setFeed(prev => [nextPost, ...prev].slice(0, 30));
        return t + 1;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [wards]);

  const posCount = useMemo(() => feed.filter(p => p.sentiment === 'pos').length, [feed]);
  const negCount = useMemo(() => feed.filter(p => p.sentiment === 'neg').length, [feed]);
  const neuCount = useMemo(() => feed.filter(p => p.sentiment === 'neu').length, [feed]);
  const total    = feed.length || 1;
  const posP     = Math.round((posCount / total) * 100);
  const negP     = Math.round((negCount / total) * 100);
  const neuP     = 100 - posP - negP;

  // Ward-level complaint breakdown
  const wardCounts = useMemo(() => {
    const map = {};
    feed.forEach(p => {
      if (!map[p.ward]) map[p.ward] = { pos: 0, neg: 0, neu: 0 };
      map[p.ward][p.sentiment]++;
    });
    return map;
  }, [feed]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Sentiment overview */}
      <div className="panel">
        <div className="panel-head">
          <div className="panel-head-left">
            <MessageSquare size={13} className="panel-head-icon"/>
            <span className="panel-head-title">City-Wide Sentiment Score — {city?.name}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{total} posts analyzed</span>
        </div>
        <div className="panel-body">
          <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>😊 Positive: {posP}%</span>
            <span style={{ color: 'var(--fg-muted)', fontWeight: 600 }}>😐 Neutral: {neuP}%</span>
            <span style={{ color: 'var(--rose)', fontWeight: 700 }}>😠 Negative: {negP}%</span>
          </div>
          <div className="sent-bar">
            <div className="sent-pos" style={{ width: `${posP}%` }}/>
            <div className="sent-neu" style={{ width: `${neuP}%` }}/>
            <div className="sent-neg" style={{ width: `${negP}%` }}/>
          </div>
          <div className="sent-legend">
            <span><span className="sent-dot" style={{ background: 'var(--green)' }}/>Positive</span>
            <span><span className="sent-dot" style={{ background: 'rgba(255,255,255,.13)' }}/>Neutral</span>
            <span><span className="sent-dot" style={{ background: 'var(--rose)' }}/>Negative</span>
          </div>
        </div>
      </div>

      {/* Bottom grid: ward breakdown + live feed */}
      <div className="overview-bottom" style={{ gap: 16 }}>
        {/* Ward sentiment table */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-head-left">
              <TrendingDown size={13} className="panel-head-icon" style={{ color: 'var(--rose)' }}/>
              <span className="panel-head-title">Per-Ward Breakdown</span>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.keys(wards).map(wId => {
                const wc   = wardCounts[wId] || { pos: 0, neg: 0, neu: 0 };
                const wTotal = wc.pos + wc.neg + wc.neu || 1;
                const negRatio = wc.neg / wTotal;
                const mood = negRatio > 0.55 ? { icon: <TrendingDown size={11}/>, color: 'var(--rose)' }
                           : negRatio < 0.25 ? { icon: <TrendingUp size={11}/>,   color: 'var(--green)' }
                           :                   { icon: <Minus size={11}/>,         color: 'var(--amber)' };
                return (
                  <div key={wId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: mood.color, display: 'flex' }}>{mood.icon}</span>
                    <span style={{ flex: 1, fontSize: 12 }}>{wards[wId]?.name?.split('—')?.[0]?.trim() || wId}</span>
                    <span style={{ fontSize: 10, color: 'var(--green)', marginRight: 4 }}>{wc.pos}👍</span>
                    <span style={{ fontSize: 10, color: 'var(--rose)' }}>{wc.neg}👎</span>
                  </div>
                );
              })}
            </div>
            {weather && (
              <div style={{ marginTop: 12, fontSize: 10.5, color: 'var(--fg-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {weather.weatherCode >= 61
                  ? '⛈ Rain event detected — flood complaint likelihood ↑'
                  : '☀ Clear conditions — transit complaints dominant'}
              </div>
            )}
          </div>
        </div>

        {/* Live complaint feed */}
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div className="panel-head">
            <div className="panel-head-left">
              <MessageSquare size={13} className="panel-head-icon"/>
              <span className="panel-head-title">Live Citizen Feed</span>
            </div>
            <span className="badge alert"><span className="dot"/>Streaming</span>
          </div>
          <div className="panel-body" style={{ overflow: 'hidden' }}>
            <div className="feed" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {feed.map(p => (
                <div key={p.id} className="post-card">
                  <div className="post-head">
                    <span>{wards[p.ward]?.name?.split('—')?.[0]?.trim() || p.ward}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`post-tag ${p.sentiment}`}>
                        {p.sentiment === 'pos' ? '+ Positive' : p.sentiment === 'neg' ? '- Negative' : '~ Neutral'}
                      </span>
                      <span style={{ fontSize: 9, color: 'var(--fg-muted)' }}>{p.time}</span>
                    </div>
                  </div>
                  <div>{p.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
