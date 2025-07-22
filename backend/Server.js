const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const dataRouter = require('./router/router');

// CORS Configuration
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
    'http://localhost:2000'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204
}));

// Advanced CORS headers
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Body parser
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("✅ MongoDB Connected successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use('/upload/data', dataRouter);

// Start server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
