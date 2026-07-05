import axios from 'axios';

async function test() {
  try {
    const cityName = 'Delhi';
    const url = `https://nominatim.openstreetmap.org/search?q=neighbourhoods+in+${encodeURIComponent(cityName)}&format=json&limit=10`;
    console.log('Fetching Nominatim neighborhoods:', url);
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'CommunityIQ-CityOS/2.0.0 (contact: support@communityiq.os)'
      }
    });
    console.log('Results count:', res.data.length);
    if (res.data.length > 0) {
      console.log('Sample:', JSON.stringify(res.data.slice(0, 5), null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}

test();
