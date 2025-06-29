// server.js
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS globally
app.use(cors());

// Set custom CORS headers for all responses
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// Proxy route
app.use('/proxy', createProxyMiddleware({
  target: '', // will be determined dynamically
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Remove `/proxy/` and leave the rest as the full target URL
    return path.replace(/^\/proxy\//, '');
  },
  router: (req) => {
    // Extract full URL from path
    const fullUrl = decodeURIComponent(req.url.replace(/^\/proxy\//, ''));
    return fullUrl.split('/')[2]; // returns host only (e.g., 143.44.136.110)
  },
  onProxyReq: (proxyReq, req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
  },
  onProxyRes: (proxyRes, req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
  },
  logLevel: 'debug'
}));

// Root response
app.get('/', (req, res) => {
  res.send('✅ Widevine Proxy Server is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
