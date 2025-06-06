const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const dataRouter = require('./router/router'); // Fixed router import

app.use(bodyParser.json());

// CORS configuration

// Update the allowedOrigins array and CORS configuration

const allowedOrigins = [
    'https://church-grace.vercel.app',
    'https://church-data-56lv.vercel.app',
    'https://church-data.vercel.app',
    'https://church-fire.vercel.app',
    'https://www.revivalprayerhouse.online',
    'http://localhost:4000',
    'http://localhost:1200',
    'http://localhost:1000',
    'http://localhost:2000'
];

// Update CORS configuration
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Add headers middleware
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

// Remove this line since we have CORS configured above
// app.options('*', cors());

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