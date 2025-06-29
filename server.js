const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.raw({ type: '*/*' }));

const WIDEVINE_LICENSE_URL = 'http://143.44.136.74:9443/widevine/?deviceId=02:00:00:00:00:00';

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
    console.error('Proxy error:', error.message);
    res.status(500).send('Widevine proxy error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Widevine proxy running on port ${PORT}`));
