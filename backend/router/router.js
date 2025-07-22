const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

// POST Endpoint for video upload
router.post('/video', async (req, res) => {
    try {
        const { title, url, duration } = req.body;

        if (!title || !url) {
            return res.status(400).json({ message: "❌ Title and URL are required" });
        }

        const video = new Video({
            title,
            url,
            type: 'video',
            duration: duration || null
        });

        const savedVideo = await video.save();
        res.status(201).json(savedVideo);
    } catch (error) {
        console.error("❌ Error saving video:", error);
        res.status(500).json({ message: "🔥 Internal Server Error", error });
    }
});

// POST Endpoint for audio upload
router.post('/audio', async (req, res) => {
    try {
        const { title, url, duration } = req.body;

        if (!title || !url) {
            return res.status(400).json({ message: "❌ Title and URL are required" });
        }

        const audio = new Video({
            title,
            url,
            type: 'audio',
            duration: duration || null
        });

        const savedAudio = await audio.save();
        res.status(201).json(savedAudio);
    } catch (error) {
        console.error("❌ Error saving audio:", error);
        res.status(500).json({ message: "🔥 Internal Server Error", error });
    }
});

// GET all videos
router.get('/url', async (req, res) => {
    try {
        const videos = await Video.find({ type: 'video' }).sort({ uploadDate: -1 });
        if (!videos.length) return res.status(404).json({ message: "No videos found" });
        res.json(videos);
    } catch (error) {
        console.error("❌ Error fetching videos:", error);
        res.status(500).json({ message: "Data not found", error });
    }
});

// GET all audio
router.get('/audio', async (req, res) => {
    try {
        const audio = await Video.find({ type: 'audio' }).sort({ uploadDate: -1 });
        if (!audio.length) return res.status(404).json({ message: "No audio files found" });
        res.json(audio);
    } catch (error) {
        console.error("❌ Error fetching audio:", error);
        res.status(500).json({ message: "Data not found", error });
    }
});

// GET all media
router.get('/all', async (req, res) => {
    try {
        const all = await Video.find({}).sort({ uploadDate: -1 });
        if (!all.length) return res.status(404).json({ message: "No media found" });
        res.json(all);
    } catch (error) {
        console.error("❌ Error fetching all media:", error);
        res.status(500).json({ message: "Data not found", error });
    }
});

// GET media by type
router.get('/type/:mediaType', async (req, res) => {
    try {
        const { mediaType } = req.params;

        if (!['video', 'audio'].includes(mediaType)) {
            return res.status(400).json({ message: "Invalid media type. Use 'video' or 'audio'" });
        }

        const data = await Video.find({ type: mediaType }).sort({ uploadDate: -1 });
        if (!data.length) return res.status(404).json({ message: `No ${mediaType} files found` });
        res.json(data);
    } catch (error) {
        console.error(`❌ Error fetching ${req.params.mediaType}:`, error);
        res.status(500).json({ message: "Data not found", error });
    }
});

// DELETE media by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Video.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Media not found" });
        res.json({ message: "Media deleted successfully", data: deleted });
    } catch (error) {
        console.error("❌ Error deleting media:", error);
        res.status(500).json({ message: "Error deleting media", error });
    }
});

module.exports = router;
