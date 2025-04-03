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
    'https://church-data-56lv.vercel.app',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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