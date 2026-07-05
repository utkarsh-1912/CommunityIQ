import axios from 'axios';

async function test() {
  try {
    const url = `https://nominatim.openstreetmap.org/search?city=Delhi&format=json&limit=40`;
    console.log('Fetching Nominatim structured Delhi items:', url);
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'CommunityIQ-CityOS/2.0.0 (contact: support@communityiq.os)'
      }
    });
    console.log('Results count:', res.data.length);
    res.data.forEach((item, idx) => {
      console.log(`${idx}: Name: "${item.display_name}", Class: "${item.class}", Type: "${item.type}"`);
    });
  } catch (err) {
    console.error(err);
  }
}

test();
