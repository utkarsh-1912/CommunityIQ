import axios from 'axios';

async function test() {
  try {
    const lat = 28.65195;
    const lon = 77.23149;
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&timezone=auto`;
    console.log('Fetching Open-Meteo AQI:', url);
    const res = await axios.get(url);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
