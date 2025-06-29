const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.raw({ type: '*/*' }));

// Target Widevine license server
const WIDEVINE_LICENSE_URL = 'https://anonymous-cable-tv.onrender.com/http://143.44.136.74:9443/widevine/?deviceId=02:00:00:00:00:00';

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
  try {
    const targetUrl = req.url.replace('/proxy/', '');

    // Basic validation: must start with http
    if (!targetUrl.startsWith('http')) {
      return res.status(400).send('Invalid URL');
    }

    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      headers: {
        // Remove 'host' to avoid issues
        ...req.headers,
        host: undefined,
        referer: undefined,
        origin: undefined,
      }
    });

    // Set content type from remote response
    res.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');

    response.data.pipe(res);
  } catch (error) {
    console.error('Manifest proxy error:', error.message);
    res.status(500).send('Manifest proxy error');
  }
});

// Optional root route
app.get('/', (req, res) => {
  res.send('✅ Widevine Proxy Server running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Widevine proxy listening on port ${PORT}`));
