import axios from 'axios';

async function test() {
  try {
    const lat = 28.65195;
    const lon = 77.23149;
    const token = 'demo';
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`;
    console.log('Fetching:', url);
    const res = await axios.get(url);
    console.log('Status:', res.data.status);
    console.log('Data:', JSON.stringify(res.data.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
