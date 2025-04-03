const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const data = require('./router/router');
const { default: mongoose } = require('mongoose');
require('dotenv').config();



app.use(bodyParser.json());
const allowedOrigins = [
    'https://church-data-56lv.vercel.app',
];

// CORS configuration
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

mongoose.connect(process.env.MONGODB_URL).then(()=> {
    console.log("MongoDB Connected da....")
}).catch("MongoDB Connection la Kolaaaru")

app.use('/upload/data',data);


app.listen(2000,()=> {
    console.log("Jesus");
})