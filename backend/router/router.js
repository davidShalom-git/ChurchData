const express = require('express');
const router = express.Router();
const Video = require('../models/Video'); // Fixed model import

// POST Endpoint for video upload
router.post('/video', async (req, res) => {
    try {
        if (!req.body.title || !req.body.url) {
            return res.status(400).json({ message: "❌ Title and URL are required" });
        }

        const createData = new Video({
            title: req.body.title,
            url: req.body.url,
        });

        const newData = await createData.save();
        res.status(201).json(newData);
    } catch (error) {
        console.error("❌ Error saving video:", error);
        res.status(500).json({ message: "🔥 Internal Server Error", error });
    }
});

module.exports = router;