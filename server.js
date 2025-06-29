const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({
  origin: '*',  // or restrict to your domain: 'https://manongguardvpnv2.github.io'
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.raw({ type: '*/*' }));

// Target Widevine license server
const WIDEVINE_LICENSE_URL = 'http://143.44.136.74:9443/widevine/?deviceId=02:00:00:00:00:00';

// Proxy license POST requests
app.post('/widevine-proxy', async (req, res) => {
  try {
    const response = await axios.post(WIDEVINE_LICENSE_URL, req.body, {
      headers: {
        'Content-Type': 'application/octet-stream',
        ...req.headers
      },
      responseType: 'arraybuffer'
    });

    res.set('Content-Type', 'application/octet-stream');
    res.status(200).send(response.data);
  } catch (error) {
    console.error('License proxy error:', error.message);
    res.status(500).send('Widevine license proxy error');
  }
});

// Proxy GET requests for manifests and segments
app.get('/proxy/*', async (req, res) => {
  const targetUrl = decodeURIComponent(req.originalUrl.replace('/proxy/', ''));

  if (!targetUrl.startsWith('http')) {
    return res.status(400).send('Invalid proxy URL');
  }

  try {
    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      headers: {
        ...req.headers,
        host: undefined,
        origin: undefined,
        referer: undefined,
      },
      timeout: 10000, // optional timeout
    });

    res.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.set('Access-Control-Allow-Origin', '*');  // Add CORS header here
    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy GET error:', err.message);
    res.status(502).send('Bad Gateway');
  }
});


// Optional root route
app.get('/', (req, res) => {
  res.send('✅ Widevine Proxy Server running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Widevine proxy listening on port ${PORT}`));
