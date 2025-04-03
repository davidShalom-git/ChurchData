const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const dataRouter = require('./router/router'); // Fixed router import

app.use(bodyParser.json());

// CORS configuration
app.use(cors({
    origin: '*', // Allow all origins (For debugging, replace '*' with your frontend URL in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


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