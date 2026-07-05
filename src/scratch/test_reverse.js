import axios from 'axios';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function test() {
  const centerLat = 28.65195;
  const centerLon = 77.23149;

  const offsets = [
    { latOffset: 0.008,  lonOffset: 0.008 },
    { latOffset: -0.012, lonOffset: 0.012 },
    { latOffset: 0.015,  lonOffset: -0.015 },
    { latOffset: 0.012,  lonOffset: 0.018 },
    { latOffset: -0.015, lonOffset: -0.012 },
    { latOffset: -0.008, lonOffset: -0.008 },
  ];

  for (let i = 0; i < offsets.length; i++) {
    const lat = centerLat + offsets[i].latOffset;
    const lon = centerLon + offsets[i].lonOffset;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14`;
    console.log(`Fetching reverse ${i}:`, url);
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'CommunityIQ-CityOS/2.0.0 (contact: support@communityiq.os)'
        }
      });
      const addr = res.data.address;
      const name = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.city_district || addr.road || `Zone ${i}`;
      console.log(`Result ${i}:`, name, 'full:', res.data.display_name);
    } catch (e) {
      console.error(e.message);
    }
    // Respect Nominatim rate limit of 1 req/sec
    await delay(1200);
  }
}

test();
