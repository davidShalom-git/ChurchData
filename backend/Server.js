const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const dataRouter = require('./router/router');

// ✅ Allowed frontend origins
const allowedOrigins = [
  'https://church-grace.vercel.app',
  'https://church-data.vercel.app',
  'https://www.revivalprayerhouse.online',
  'http://localhost:4000',
  'http://localhost:1200',
  'http://localhost:1000',
  'http://localhost:2000',
  'https://church-76ju.vercel.app'
];

// Regex to allow any subdomain under church-data.vercel.app
const subdomainRegex = /^https:\/\/church-data(-[a-zA-Z0-9]+)?\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    console.log('🔍 Request origin:', origin);
    
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      subdomainRegex.test(origin)
    ) {
      callback(null, true);
    } else {
      console.log('❌ Origin not allowed:', origin);
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('*', cors());

// ✅ IMPORTANT: Increase body size limit for base64 audio files
app.use(bodyParser.json({ 
  limit: '50mb' // Increase limit for base64 audio files
}));
app.use(bodyParser.urlencoded({ 
  limit: '50mb', 
  extended: true 
}));

// ✅ Add request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} from origin: ${req.get('Origin')}`);
  next();
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ MongoDB Connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use('/upload/data', dataRouter);

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running with Base64 audio support'
  });
});

// ✅ Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server Error:', error);
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ 
      message: '❌ File too large. Maximum size is 50MB' 
    });
  }
  
  res.status(500).json({ 
    message: '🔥 Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Base64 audio support enabled`);
  console.log(`📏 Max body size: 50MB`);
});

module.exports = app;