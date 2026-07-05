/**
 * liveData.js — Real API integrations for CommunityIQ
 *
 * Sources:
 * 1. Open-Meteo  — Real weather + hourly precipitation forecast (no API key)
 * 2. WAQI        — World Air Quality Index per city (free token)
 */

const BASE_WEATHER = 'https://api.open-meteo.com/v1/forecast';
const BASE_AQI     = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// ─── Supported Cities ─────────────────────────────────────────────────────────
export const CITIES = {
  newyork: {
    id: 'newyork',
    name: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    lat: 40.7128, lon: -74.0060,
    timezone: 'America/New_York',
    waqiSlug: 'new-york',
    currency: 'USD',
    wards: {
      'Zone A': {
        name: 'Zone A — Manhattan (CBD)',
        area: 'Times Square, Wall Street',
        population: '1,630,000',
        hospitals: 12, schools: 85, businesses: 9500,
        busRoutes: ['M1', 'M4', 'M15'],
        ngoCount: 28,
        aqiMod: 1.0, floodBase: 10, elecBase: 15, trafficBase: 20,
        lat: 40.7831, lon: -73.9712,
      },
      'Zone B': {
        name: 'Zone B — Brooklyn',
        area: 'Dumbo, Williamsburg, Flatbush',
        population: '2,590,000',
        hospitals: 15, schools: 110, businesses: 8200,
        busRoutes: ['B35', 'B44', 'B46'],
        ngoCount: 34,
        aqiMod: 0.85, floodBase: 15, elecBase: 10, trafficBase: 15,
        lat: 40.6782, lon: -73.9442,
      },
      'Zone C': {
        name: 'Zone C — Queens',
        area: 'Astoria, Flushing, Long Island City',
        population: '2,270,000',
        hospitals: 10, schools: 98, businesses: 6400,
        busRoutes: ['Q32', 'Q60'],
        ngoCount: 22,
        aqiMod: 0.90, floodBase: 20, elecBase: 8, trafficBase: 12,
        lat: 40.7282, lon: -73.7949,
      },
      'Zone D': {
        name: 'Zone D — Bronx',
        area: 'South Bronx, Riverdale',
        population: '1,420,000',
        hospitals: 8, schools: 72, businesses: 3800,
        busRoutes: ['Bx12', 'Bx19'],
        ngoCount: 19,
        aqiMod: 1.15, floodBase: 12, elecBase: 5, trafficBase: 10,
        lat: 40.8448, lon: -73.8648,
      },
      'Zone E': {
        name: 'Zone E — Staten Island',
        area: 'St George, Todt Hill',
        population: '475,000',
        hospitals: 3, schools: 35, businesses: 1200,
        busRoutes: ['S79'],
        ngoCount: 8,
        aqiMod: 0.65, floodBase: 25, elecBase: 2, trafficBase: -5,
        lat: 40.5795, lon: -74.1502,
      },
    },
  },
  london: {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    lat: 51.5074, lon: -0.1278,
    timezone: 'Europe/London',
    waqiSlug: 'london',
    currency: 'GBP',
    wards: {
      'Zone A': {
        name: 'Zone A — City of London (CBD)',
        area: 'Square Mile, Financial District',
        population: '9,000',
        hospitals: 2, schools: 8, businesses: 4800,
        busRoutes: ['RV1', '15'],
        ngoCount: 6,
        aqiMod: 1.05, floodBase: 12, elecBase: 18, trafficBase: 22,
        lat: 51.5155, lon: -0.0922,
      },
      'Zone B': {
        name: 'Zone B — Westminster',
        area: 'Soho, Whitehall, Covent Garden',
        population: '250,000',
        hospitals: 6, schools: 38, businesses: 7200,
        busRoutes: ['24', '11', '139'],
        ngoCount: 18,
        aqiMod: 1.0, floodBase: 15, elecBase: 14, trafficBase: 20,
        lat: 51.4975, lon: -0.1357,
      },
      'Zone C': {
        name: 'Zone C — Camden',
        area: 'Camden Town, Kentish Town',
        population: '270,000',
        hospitals: 5, schools: 42, businesses: 3900,
        busRoutes: ['88', '168'],
        ngoCount: 15,
        aqiMod: 0.85, floodBase: 8, elecBase: 8, trafficBase: 12,
        lat: 51.5290, lon: -0.1258,
      },
      'Zone D': {
        name: 'Zone D — Greenwich (Coastal)',
        area: 'Royal Observatory, Peninsula',
        population: '290,000',
        hospitals: 4, schools: 35, businesses: 2400,
        busRoutes: ['177', '188'],
        ngoCount: 12,
        aqiMod: 0.75, floodBase: 32, elecBase: 5, trafficBase: 8,
        lat: 51.4897, lon: 0.0072,
      },
      'Zone E': {
        name: 'Zone E — Southwark',
        area: 'Bermondsey, Peckham',
        population: '320,000',
        hospitals: 5, schools: 48, businesses: 3100,
        busRoutes: ['381', '453'],
        ngoCount: 14,
        aqiMod: 0.90, floodBase: 18, elecBase: 8, trafficBase: 15,
        lat: 51.4834, lon: -0.0825,
      },
    },
  },
  johannesburg: {
    id: 'johannesburg',
    name: 'Johannesburg',
    country: 'South Africa',
    flag: '🇿🇦',
    lat: -26.2041, lon: 28.0473,
    timezone: 'Africa/Johannesburg',
    waqiSlug: 'johannesburg',
    currency: 'ZAR',
    wards: {
      'Zone A': {
        name: 'Zone A — CBD',
        area: 'Marshalltown, Newtown',
        population: '120,000',
        hospitals: 4, schools: 15, businesses: 3200,
        busRoutes: ['J1', 'J4'],
        ngoCount: 12,
        aqiMod: 1.15, floodBase: 10, elecBase: 12, trafficBase: 22,
        lat: -26.2041, lon: 28.0473,
      },
      'Zone B': {
        name: 'Zone B — Sandton (Business)',
        area: 'Sandton Core, Morningside',
        population: '220,000',
        hospitals: 6, schools: 28, businesses: 6400,
        busRoutes: ['J3', 'J8'],
        ngoCount: 22,
        aqiMod: 0.85, floodBase: 8, elecBase: 22, trafficBase: 18,
        lat: -26.1044, lon: 28.0622,
      },
      'Zone C': {
        name: 'Zone C — Soweto',
        area: 'Orlando, Pimville',
        population: '1,300,000',
        hospitals: 5, schools: 120, businesses: 2400,
        busRoutes: ['J5', 'J9'],
        ngoCount: 45,
        aqiMod: 1.25, floodBase: 18, elecBase: 6, trafficBase: 8,
        lat: -26.2678, lon: 27.8581,
      },
      'Zone D': {
        name: 'Zone D — Randburg',
        area: 'Randburg CBD, Ferndale',
        population: '340,000',
        hospitals: 4, schools: 38, businesses: 2800,
        busRoutes: ['J2', 'J7'],
        ngoCount: 16,
        aqiMod: 0.90, floodBase: 12, elecBase: 8, trafficBase: 12,
        lat: -26.0936, lon: 27.9736,
      },
      'Zone E': {
        name: 'Zone E — Midrand (Industrial)',
        area: 'Halfway House, Corporate Park',
        population: '180,000',
        hospitals: 3, schools: 22, businesses: 4100,
        busRoutes: ['J6'],
        ngoCount: 11,
        aqiMod: 0.80, floodBase: 10, elecBase: 14, trafficBase: 10,
        lat: -25.9983, lon: 28.1254,
      },
    },
  },
  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    lat: 19.0760, lon: 72.8777,
    timezone: 'Asia/Kolkata',
    waqiSlug: 'mumbai',
    currency: 'INR',
    wards: {
      'Zone A': {
        name: 'Zone A — Colaba & Fort',
        area: 'Colaba, Fort, Churchgate',
        population: '95,000',
        hospitals: 5, schools: 22, businesses: 4200,
        busRoutes: ['BEST-1', 'BEST-4'],
        ngoCount: 15,
        aqiMod: 0.85, floodBase: 35, elecBase: 5, trafficBase: 15,
        lat: 18.9067, lon: 72.8147,
      },
      'Zone B': {
        name: 'Zone B — Andheri (Commercial)',
        area: 'Andheri East/West, MIDC',
        population: '832,000',
        hospitals: 12, schools: 95, businesses: 7800,
        busRoutes: ['BEST-12', 'BEST-18'],
        ngoCount: 28,
        aqiMod: 1.2, floodBase: 45, elecBase: 12, trafficBase: 20,
        lat: 19.1176, lon: 72.8631,
      },
      'Zone C': {
        name: 'Zone C — Chembur (Industrial)',
        area: 'Chembur, Govandi, Mankhurd',
        population: '715,000',
        hospitals: 7, schools: 78, businesses: 3400,
        busRoutes: ['BEST-14', 'BEST-19'],
        ngoCount: 19,
        aqiMod: 1.6, floodBase: 30, elecBase: 18, trafficBase: 10,
        lat: 19.0618, lon: 72.8993,
      },
      'Zone D': {
        name: 'Zone D — Kurla (Transit Hub)',
        area: 'Kurla, Vidyavihar, Ghatkopar',
        population: '920,000',
        hospitals: 9, schools: 110, businesses: 5100,
        busRoutes: ['BEST-11', 'BEST-16'],
        ngoCount: 24,
        aqiMod: 1.1, floodBase: 42, elecBase: 8, trafficBase: 22,
        lat: 19.0726, lon: 72.8825,
      },
      'Zone E': {
        name: 'Zone E — Borivali (Residential)',
        area: 'Borivali, Kandivali, Dahisar',
        population: '660,000',
        hospitals: 8, schools: 88, businesses: 2900,
        busRoutes: ['BEST-8', 'BEST-15'],
        ngoCount: 20,
        aqiMod: 0.7, floodBase: 20, elecBase: 2, trafficBase: 5,
        lat: 19.2307, lon: 72.8567,
      },
    },
  },
  canberra: {
    id: 'canberra',
    name: 'Canberra',
    country: 'Australia',
    flag: '🇦🇺',
    lat: -35.2809, lon: 149.1300,
    timezone: 'Australia/Sydney',
    waqiSlug: 'canberra',
    currency: 'AUD',
    wards: {
      'Zone A': {
        name: 'Zone A — Civic (CBD)',
        area: 'City Center, Braddon, Acton',
        population: '5,000',
        hospitals: 2, schools: 6, businesses: 1400,
        busRoutes: ['C1', 'C4'],
        ngoCount: 8,
        aqiMod: 0.85, floodBase: 8, elecBase: 10, trafficBase: 12,
        lat: -35.2809, lon: 149.1300,
      },
      'Zone B': {
        name: 'Zone B — Belconnen',
        area: 'Belconnen Lakes, Bruce',
        population: '100,000',
        hospitals: 3, schools: 28, businesses: 2100,
        busRoutes: ['C2', 'C5'],
        ngoCount: 12,
        aqiMod: 0.70, floodBase: 10, elecBase: 8, trafficBase: 8,
        lat: -35.2378, lon: 149.0683,
      },
      'Zone C': {
        name: 'Zone C — Tuggeranong',
        area: 'Greenway, Isabella Plains',
        population: '90,000',
        hospitals: 2, schools: 25, businesses: 1500,
        busRoutes: ['C3', 'C8'],
        ngoCount: 9,
        aqiMod: 0.65, floodBase: 18, elecBase: 6, trafficBase: 6,
        lat: -35.4191, lon: 149.0883,
      },
      'Zone D': {
        name: 'Zone D — Gungahlin',
        area: 'Gungahlin Town Center, Harrison',
        population: '85,000',
        hospitals: 2, schools: 22, businesses: 1800,
        busRoutes: ['C6', 'C7'],
        ngoCount: 11,
        aqiMod: 0.75, floodBase: 12, elecBase: 8, trafficBase: 10,
        lat: -35.1847, lon: 149.1325,
      },
      'Zone E': {
        name: 'Zone E — Woden Valley',
        area: 'Phillip, Mawson, Garran',
        population: '40,000',
        hospitals: 4, schools: 18, businesses: 1200,
        busRoutes: ['C9'],
        ngoCount: 7,
        aqiMod: 0.72, floodBase: 15, elecBase: 8, trafficBase: 8,
        lat: -35.3458, lon: 149.0942,
      },
    },
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    lat: 35.6762, lon: 139.6503,
    timezone: 'Asia/Tokyo',
    waqiSlug: 'tokyo',
    currency: 'JPY',
    wards: {
      'Zone A': {
        name: 'Zone A — Shinjuku (CBD)',
        area: 'West Tokyo Skyscraper Hub',
        population: '340,000',
        hospitals: 12, schools: 88, businesses: 8200,
        busRoutes: ['T-1', 'T-4'],
        ngoCount: 15,
        aqiMod: 1.15, floodBase: 8, elecBase: 12, trafficBase: 22,
        lat: 35.6895, lon: 139.6917,
      },
      'Zone B': {
        name: 'Zone B — Odaiba (Waterfront)',
        area: 'Tokyo Bay Reclamation Zone',
        population: '54,000',
        hospitals: 3, schools: 12, businesses: 1900,
        busRoutes: ['T-2', 'T-9'],
        ngoCount: 8,
        aqiMod: 0.75, floodBase: 32, elecBase: 8, trafficBase: -5,
        lat: 35.6268, lon: 139.7758,
      },
      'Zone C': {
        name: 'Zone C — Ota (Industrial)',
        area: 'Keihin Industrial Corridor',
        population: '730,000',
        hospitals: 8, schools: 92, businesses: 6400,
        busRoutes: ['T-5', 'T-6'],
        ngoCount: 22,
        aqiMod: 1.55, floodBase: 15, elecBase: 22, trafficBase: 10,
        lat: 35.5614, lon: 139.7158,
      },
      'Zone D': {
        name: 'Zone D — Setagaya (Residential)',
        area: 'West Tokyo Green Belt',
        population: '920,000',
        hospitals: 14, schools: 140, businesses: 5200,
        busRoutes: ['T-3', 'T-8'],
        ngoCount: 35,
        aqiMod: 0.65, floodBase: 12, elecBase: -3, trafficBase: -8,
        lat: 35.6461, lon: 139.6562,
      },
      'Zone E': {
        name: 'Zone E — Ueno (Transit Hub)',
        area: 'Taito Ward Core, Ueno Park',
        population: '180,000',
        hospitals: 6, schools: 42, businesses: 3100,
        busRoutes: ['T-10', 'T-11'],
        ngoCount: 14,
        aqiMod: 1.0, floodBase: 18, elecBase: 8, trafficBase: 15,
        lat: 35.7142, lon: 139.7772,
      },
    },
  },
  shanghai: {
    id: 'shanghai',
    name: 'Shanghai',
    country: 'China',
    flag: '🇨🇳',
    lat: 31.2304, lon: 121.4737,
    timezone: 'Asia/Shanghai',
    waqiSlug: 'shanghai',
    currency: 'CNY',
    wards: {
      'Zone A': {
        name: 'Zone A — Pudong (CBD)',
        area: 'Lujiazui Financial Sector',
        population: '5,600,000',
        hospitals: 18, schools: 180, businesses: 15000,
        busRoutes: ['S1', 'S8', 'S22'],
        ngoCount: 52,
        aqiMod: 1.05, floodBase: 12, elecBase: 24, trafficBase: 22,
        lat: 31.2355, lon: 121.5237,
      },
      'Zone B': {
        name: 'Zone B — Huangpu',
        area: 'Bund, People Square',
        population: '680,000',
        hospitals: 10, schools: 42, businesses: 8500,
        busRoutes: ['S2', 'S9'],
        ngoCount: 19,
        aqiMod: 1.0, floodBase: 18, elecBase: 14, trafficBase: 20,
        lat: 31.2223, lon: 121.4687,
      },
      'Zone C': {
        name: 'Zone C — Xuhui',
        area: 'Xujiahui, French Concession',
        population: '1,100,000',
        hospitals: 12, schools: 75, businesses: 6200,
        busRoutes: ['S3', 'S11'],
        ngoCount: 25,
        aqiMod: 0.85, floodBase: 10, elecBase: 10, trafficBase: 12,
        lat: 31.1897, lon: 121.4325,
      },
      'Zone D': {
        name: 'Zone D — Jing\'an',
        area: 'Nanjing West Road Corridor',
        population: '1,000,000',
        hospitals: 8, schools: 58, businesses: 7800,
        busRoutes: ['S4', 'S12'],
        ngoCount: 22,
        aqiMod: 0.95, floodBase: 12, elecBase: 12, trafficBase: 15,
        lat: 31.2525, lon: 121.4422,
      },
      'Zone E': {
        name: 'Zone E — Yangpu (Tech/Uni)',
        area: 'Wujiaochang Commercial Hub',
        population: '1,200,000',
        hospitals: 9, schools: 85, businesses: 4200,
        busRoutes: ['S5', 'S14'],
        ngoCount: 29,
        aqiMod: 1.15, floodBase: 15, elecBase: 10, trafficBase: 12,
        lat: 31.2654, lon: 121.5125,
      },
    },
  },
};

export const DEFAULT_CITY = 'newyork';

// ─── Weather (Open-Meteo) ─────────────────────────────────────────────────────
export async function fetchWeather(city = CITIES[DEFAULT_CITY]) {
  const params = new URLSearchParams({
    latitude:  city.lat,
    longitude: city.lon,
    current: [
      'temperature_2m', 'relative_humidity_2m', 'wind_speed_10m',
      'precipitation', 'weather_code', 'cloud_cover', 'apparent_temperature',
    ].join(','),
    hourly: [
      'precipitation_probability', 'precipitation', 'temperature_2m',
    ].join(','),
    forecast_days: 2,
    timezone: city.timezone,
    wind_speed_unit: 'kmh',
  });

  const res  = await fetch(`${BASE_WEATHER}?${params}`);
  if (!res.ok) throw new Error('Weather API failed');
  const data = await res.json();

  const c = data.current;
  const h = data.hourly;

  const next24hPrecipProb = h.precipitation_probability
    ? Math.max(...h.precipitation_probability.slice(0, 24))
    : 0;
  const totalPrecip24h = h.precipitation
    ? h.precipitation.slice(0, 24).reduce((a, b) => a + b, 0)
    : 0;

  return {
    temperature:       c.temperature_2m,
    feelsLike:         c.apparent_temperature,
    humidity:          c.relative_humidity_2m,
    windSpeed:         c.wind_speed_10m,
    precipitation:     c.precipitation,
    weatherCode:       c.weather_code,
    cloudCover:        c.cloud_cover,
    next24hPrecipProb,
    totalPrecip24h,
    hourlyTemps:       h.temperature_2m?.slice(0, 24) || [],
    hourlyPrecip:      h.precipitation?.slice(0, 24)  || [],
  };
}

// ─── AQI (Open-Meteo Air Quality API) ─────────────────────────────────────────
export async function fetchAQI(city = CITIES[DEFAULT_CITY]) {
  const params = new URLSearchParams({
    latitude: city.lat,
    longitude: city.lon,
    current: 'us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide',
    timezone: city.timezone || 'auto',
  });

  const res = await fetch(`${BASE_AQI}?${params}`);
  if (!res.ok) throw new Error('AQI API failed');
  const data = await res.json();
  const c = data.current;

  return {
    aqi:               c.us_aqi,
    city:              city.name,
    pm25:              Math.round(c.pm2_5),
    pm10:              Math.round(c.pm10),
    no2:               Math.round(c.nitrogen_dioxide),
    o3:                Math.round(c.ozone),
    so2:               Math.round(c.sulphur_dioxide),
    co:                Math.round(c.carbon_monoxide),
    dominantPollutant: c.pm2_5 > c.pm10 ? 'pm25' : 'pm10',
    time:              c.time,
  };
}

// ─── Flood Risk Model ─────────────────────────────────────────────────────────
export function computeFloodRisk(weatherData) {
  const { precipitation = 0, totalPrecip24h = 0, next24hPrecipProb = 0, humidity = 60 } = weatherData;
  let risk = 0;
  risk += Math.min(40, precipitation * 8);
  risk += Math.min(30, totalPrecip24h * 1.2);
  risk += (next24hPrecipProb / 100) * 20;
  risk += humidity > 85 ? 10 : humidity > 70 ? 5 : 0;
  return Math.round(Math.min(100, risk));
}

// ─── Electricity Demand Model ─────────────────────────────────────────────────
export function computeElectricityDemand(temperature, baseOffset = 0) {
  const base  = 55 + baseOffset;
  const extra = temperature > 30 ? (temperature - 30) * 2.5
              : temperature < 10 ? (10 - temperature) * 1.5 : 0;
  const noise = Math.sin(temperature * 10) * 2;
  return Math.round(Math.min(99, Math.max(20, base + extra + noise)));
}

// ─── Traffic Load Model ───────────────────────────────────────────────────────
export function computeTrafficLoad(hour, baseOffset = 0) {
  let base;
  if (hour >= 7  && hour <= 10) base = 75;
  else if (hour >= 17 && hour <= 20) base = 82;
  else if (hour >= 23 || hour <= 5) base = 12;
  else base = 38;
  const noise = Math.sin(hour * 1.5) * 5;
  return Math.max(5, Math.min(99, Math.round(base + baseOffset + noise)));
}

// ─── WMO weather code → description ──────────────────────────────────────────
export const WMO_DESC = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Light showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm + hail', 99: 'Thunderstorm heavy hail',
};
