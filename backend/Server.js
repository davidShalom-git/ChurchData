const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const dataRouter = require('./router/router'); // Fixed router import

app.use(bodyParser.json());

// CORS configuration
const allowedOrigins = [
    'https://church-grace.vercel.app',
    'https://church-data-56lv.vercel.app',
    'https://church-data.vercel.app',
    'https://church-fire.vercel.app',
    'https://church-fire.vercel.app/api/image/upload/tam',
    'https://church-fire.vercel.app/api/image/upload/eng',
    'https://church-fire.vercel.app/api/image/upload',
    'https://www.revivalprayerhouse.online',
    'http://localhost:4000',
    'http://localhost:1200',
    'http://localhost:1000',
    'http://localhost:2000'
];

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Blocked origin:', origin);
            return callback(new Error('CORS not allowed'));
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // Cache CORS preflight response for 24 hours
}));

// Handle CORS preflight requests
app.options('*', cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("✅ MongoDB Connected successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Use the router correctly
app.use('/upload/data', dataRouter);

// Start Server
app.listen(2000, () => {
    console.log("🚀 Server running on port 2000");
});