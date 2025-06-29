const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // install with npm i node-fetch@2
const app = express();

app.use(cors()); // Enable CORS for all origins

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const response = await fetch(targetUrl, {
      // You can add headers here if needed, like User-Agent, etc.
      method: 'GET',
    });

    if (!response.ok) {
      return res.status(response.status).send(`Upstream error: ${response.statusText}`);
    }

    // Forward headers like content-type to client
    res.setHeader('content-type', response.headers.get('content-type') || 'application/octet-stream');
    // Add any other headers you want to forward here

    // Pipe the response stream to the client
    response.body.pipe(res);

  } catch (error) {
    console.error('Proxy fetch error:', error);
    res.status(500).send('Proxy fetch error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
