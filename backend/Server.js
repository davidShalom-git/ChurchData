const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const dataRouter = require('./router/router');

// 🌐 Allowed frontend origins
const corsOptions = {
  origin: [
    'https://church-data-56lv.vercel.app', // Your frontend URL
    'http://localhost:3000', // For local development
    'http://localhost:5173', // For Vite dev server
    'https://revivalprayerhouse.online',
    'https://church-data.vercel.app'// Add any other domains you need
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ]
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// 📦 Body Parser (supports large base64 uploads)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 📋 Request Logger
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  console.log(`🌐 Origin: ${req.get('Origin')}`);
  console.log(`📋 Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// 🛠 MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 🚀 Routes
app.use('/upload/data', dataRouter);

// 💚 Health Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Server is live with Base64 audio support'
  });
});

// 🌐 CORS Test
app.get('/cors-test', (req, res) => {
  res.json({
    message: '✅ CORS Check Passed',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  });
});

// 🧯 Error Handler
app.use((error, req, res, next) => {
  console.error('💥 Server Error:', error);

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: '❌ Upload exceeds 50MB limit'
    });
  }

  res.status(500).json({
    message: '🔥 Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ⏯️ Start Server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Base64 support enabled`);
  console.log(`🌐 CORS whitelist ready`);
});
