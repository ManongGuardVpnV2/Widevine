const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors()); // Allow all origins

// Proxy MPD manifest
app.get('/proxy/manifest', async (req, res) => {
  const originalUrl = req.query.url;
  if (!originalUrl) {
    res.status(400).send("Missing 'url' query param");
    return;
  }

  try {
    const response = await axios.get(originalUrl);
    let manifest = response.data;

    // Rewrite segment URLs inside manifest to route through this proxy
    // Example: replace all 'http://143.44.136.110:6910' with 'https://yourproxy.com/proxy/http://143.44.136.110:6910'
    manifest = manifest.replace(/http:\/\/143\.44\.136\.110:6910/g, 'https://yourproxy.com/proxy/http://143.44.136.110:6910');

    res.setHeader('Content-Type', 'application/dash+xml');
    res.send(manifest);
  } catch (err) {
    res.status(500).send('Error fetching manifest: ' + err.message);
  }
});

// Proxy all segment/media requests (pass through)
app.get('/proxy/*', async (req, res) => {
  const proxiedUrl = req.params[0];
  try {
    const response = await axios({
      method: 'get',
      url: proxiedUrl,
      responseType: 'stream',
    });
    // Set CORS headers for media segments too
    res.setHeader('Access-Control-Allow-Origin', '*');

    response.data.pipe(res);
  } catch (err) {
    res.status(500).send('Error proxying media: ' + err.message);
  }
});

// Widevine license proxy if needed
app.post('/widevine-proxy', async (req, res) => {
  // Forward DRM license requests here
  // (You may need to forward headers/body as is, depends on license server)
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
