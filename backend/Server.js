const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const dataRouter = require('./router/router');

// 🌐 Enhanced CORS configuration
const corsOptions = {

  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      'https://church-data-56lv.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://revivalprayerhouse.online'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },

  origin: [
    'https://church-data-56lv.vercel.app', // Your frontend URL
    'http://localhost:3000', // For local development
    'http://localhost:5173', // For Vite dev server
    'https://revivalprayerhouse.online',
    'https://church-data.vercel.app'// Add any other domains you need
  ],

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override',
    'Access-Control-Allow-Origin'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Additional CORS headers for problematic requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://church-data-56lv.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://revivalprayerhouse.online',
    'https://church-data.vercel.app'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-HTTP-Method-Override');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ Preflight request from: ${origin}`);
    return res.status(204).end();
  }
  
  next();
});

// 📦 Body Parser (supports large base64 uploads)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 📋 Request Logger
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path}`);
  console.log(`🌐 Origin: ${req.get('Origin')}`);
  console.log(`📋 User-Agent: ${req.get('User-Agent')}`);
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

// 🌐 CORS Test Endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    message: '✅ CORS Check Passed',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString(),
    headers: req.headers
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

  console.log(`🌐 CORS whitelist: https://church-data-56lv.vercel.app`);
});

  console.log(`🌐 CORS whitelist ready`);


