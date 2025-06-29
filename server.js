const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.raw({ type: '*/*' }));

// ✅ Widevine license POST proxy
app.post('/widevine-proxy', async (req, res) => {
  try {
    const licenseUrl = 'http://143.44.136.74:9443/widevine/?deviceId=02:00:00:00:00:00';
    const response = await axios.post(licenseUrl, req.body, {
      headers: {
        'Content-Type': 'application/octet-stream',
        ...req.headers
      },
      responseType: 'arraybuffer'
    });
    res.set('Content-Type', 'application/octet-stream');
    res.status(200).send(response.data);
  } catch (err) {
    console.error('License error:', err.message);
    res.status(500).send('Widevine license proxy error');
  }
});

// ✅ MPEG-DASH manifest and segment GET proxy
app.get('/proxy/*', async (req, res) => {
  const targetUrl = decodeURIComponent(req.url.replace('/proxy/', ''));

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
        referer: undefined
      }
    });

    res.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    response.data.pipe(res);
  } catch (err) {
    console.error('Proxy GET error:', err.message);
    res.status(500).send('Proxy GET failed');
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Widevine Proxy Server running');
});

// ✅ Only declare PORT once!
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
