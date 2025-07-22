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
  'https://church-data-56lv.vercel.app',
  'https://church-data.vercel.app',
  'https://church-fire.vercel.app',
  'https://church-76ju.vercel.app',
  'https://www.revivalprayerhouse.online',
  'http://localhost:4000',
  'http://localhost:1200',
  'http://localhost:1000',
  'http://localhost:2000',
];

// ✅ CORS middleware (dynamic origin handler)
app.use(cors({
  origin: function (origin, callback) {
    // if no origin, allow (Postman/curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// ✅ Express will handle preflight OPTIONS automatically, but to be safe:
app.options('*', cors());

// ✅ Parse JSON request bodies
app.use(bodyParser.json());

// ✅ Optional: Serve static /uploaded files if needed
// app.use('/uploads', express.static('uploads'));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("✅ MongoDB Connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use('/upload/data', dataRouter);

// ✅ Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
