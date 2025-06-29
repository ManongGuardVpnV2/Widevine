const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// ✅ Use CORS middleware correctly
app.use(cors());

// ✅ Parse raw license requests
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// ✅ Proxy manifest/segments
app.get('/proxy/*', async (req, res) => {
  try {
    const targetUrl = decodeURIComponent(req.originalUrl.replace('/proxy/', ''));
    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      timeout: 10000
    });

    res.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.set('Access-Control-Allow-Origin', '*'); // Allow cross-origin
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy GET failed:', error.message);
    res.status(502).send('Bad Gateway');
  }
});

// ✅ Widevine License Proxy
app.post('/widevine-proxy', async (req, res) => {
  try {
    const licenseServerUrl = 'http://143.44.136.74:9443/widevine/?deviceId=02:00:00:00:00:00';
    const response = await axios.post(licenseServerUrl, req.body, {
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      responseType: 'arraybuffer'
    });

    res.set('Content-Type', 'application/octet-stream');
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(response.data);
  } catch (error) {
    console.error('License error:', error.message);
    res.status(500).send('Widevine license proxy error');
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
