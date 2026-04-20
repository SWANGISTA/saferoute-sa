const axios = require('axios');
const key = process.env.ANTHROPIC_API_KEY;
(async () => {
  for (const text of ['Tzaneen', 'Soshanguve']) {
    try {
      const res = await axios.get('https://api.openrouteservice.org/geocode/search', {
        params: { text, size: 1 },
        headers: { 'x-api-key': key }
      });
      console.log(text, res.data.features?.[0]?.geometry?.coordinates, res.data.features?.[0]?.properties?.label);
    } catch (err) {
      console.error(text, err.response?.status, err.response?.data || err.message);
    }
  }
})();
const axios = require('axios');
const key = process.env.ANTHROPIC_API_KEY;
(async () => {
  for (const text of ['Tzaneen', 'Soshanguve']) {
    try {
      const res = await axios.get('https://api.openrouteservice.org/geocode/search', {
        params: { text, size: 1 },
        headers: { 'x-api-key': key }
      });
      console.log(text, res.data.features?.[0]?.geometry?.coordinates, res.data.features?.[0]?.properties?.label);
    } catch (err) {
      console.error(text, err.response?.status, err.response?.data || err.message);
    }
  }
})();
