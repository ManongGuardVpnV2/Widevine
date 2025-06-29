const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS globally
app.use(cors());
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// Optional: Homepage
app.get('/', (req, res) => {
  res.send('✅ Anonymous Cable TV Proxy Server is running!');
});

// Proxy for DASH/MPD resources
app.get('/proxy/*', async (req, res) => {
  try {
    const targetUrl = decodeURIComponent(req.originalUrl.replace('/proxy/', ''));

    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        // Remove origin/referer to prevent being blocked
        ...req.headers,
        host: undefined,
        origin: undefined,
        referer: undefined
      }
    });

    res.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.set('Access-Control-Allow-Origin', '*');
    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy GET failed:', err.message);
    res.status(502).send('❌ Proxy fetch failed.');
  }
});

// Widevine license proxy
app.post('/widevine-proxy', async (req, res) => {
  try {
    const licenseUrl = 'http://143.44.136.74:9443/widevine/?deviceId=02:00:00:00:00:00';

    const response = await axios.post(licenseUrl, req.body, {
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      responseType: 'arraybuffer',
      timeout: 10000
    });

    res.set('Content-Type', 'application/octet-stream');
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(response.data);
  } catch (err) {
    console.error('License error:', err.message);
    res.status(500).send('❌ Widevine license proxy error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
