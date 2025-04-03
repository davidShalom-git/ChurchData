const express = require('express');
const router = express.Router();
const data = require('../models/Video');


router.post('/video',(req,res)=> {
    const createData = new data({
        title: req.body.title,
        url: req.body.url,
    })

    try{
        const newData = createData.save();
        res.status(201).json(newData)
    }
    catch(error){
        res.status(400).json({message: "Kolaaru aagidichi"})
    }
})


module.exports = router;