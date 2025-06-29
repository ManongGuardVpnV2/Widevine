// server.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Proxy route: forward any /proxy/* request to the target HTTP URL
app.use('/proxy', (req, res, next) => {
  // Extract target URL by removing /proxy/ prefix
  const targetUrl = req.url.slice(1); // remove leading "/"
  
  // Validate URL format - must start with http:// or https://
  if (!/^https?:\/\//.test(targetUrl)) {
    res.status(400).send('Invalid target URL');
    return;
  }
  
  // Use http-proxy-middleware to proxy the request
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    secure: false,
    // Rewrite the path to empty because targetUrl contains the full URL
    pathRewrite: () => '',
    onProxyRes(proxyRes) {
      // Add CORS headers to proxied response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    }
  })(req, res, next);
});

// Basic root endpoint for sanity check
app.get('/', (req, res) => {
  res.send('IPTV Proxy Server Running');
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
