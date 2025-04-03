const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const data = require('./router/router');
const { default: mongoose } = require('mongoose');
require('dotenv').config();



app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URL).then(()=> {
    console.log("MongoDB Connected da....")
}).catch("MongoDB Connection la Kolaaaru")

app.use('/upload/data',data);


app.listen(2000,()=> {
    console.log("Jesus");
})