const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');

// Multer setup for audio uploads (if sending as files via multipart/form-data)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, ''))
});
const upload = multer({ storage });

// POST: Upload video (expects JSON)
router.post('/video', async (req, res) => {
  try {
    const { title, url, duration } = req.body;
    if (!title || !url)
      return res.status(400).json({ message: '❌ Title and URL are required' });

    const video = new Video({
      title,
      url,
      type: 'video',
      duration: duration || null
    });
    const saved = await video.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Error saving video:', error);
    res.status(500).json({ message: '🔥 Internal Server Error', error });
  }
});

// POST: Upload audio (as JSON, i.e. by URL)
router.post('/audio', async (req, res) => {
  try {
    const { title, url, duration } = req.body;
    if (!title || !url)
      return res.status(400).json({ message: '❌ Title and URL are required' });

    const audio = new Video({
      title,
      url,
      type: 'audio',
      duration: duration || null
    });
    const saved = await audio.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Error saving audio:', error);
    res.status(500).json({ message: '🔥 Internal Server Error', error });
  }
});

// POST: Upload audio (actual file upload, optional, if you want users to send files)
// Form field is 'audio' (not 'file' or 'audioFile')
router.post('/audio-file', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: '❌ No audio file uploaded' });

    const audioUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const audio = new Video({
      title: req.file.originalname,
      url: audioUrl,
      type: 'audio',
      duration: null // implement duration extraction as needed
    });
    const saved = await audio.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Error saving audio:', error);
    res.status(500).json({ message: '🔥 Internal Server Error', error });
  }
});

// GET: All videos
router.get('/url', async (req, res) => {
  try {
    const videos = await Video.find({ type: 'video' }).sort({ uploadDate: -1 });
    if (!videos.length) return res.status(404).json({ message: 'No videos found' });
    res.json(videos);
  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    res.status(500).json({ message: 'Data not found', error });
  }
});

// GET: All audio
router.get('/audio', async (req, res) => {
  try {
    const audios = await Video.find({ type: 'audio' }).sort({ uploadDate: -1 });
    if (!audios.length) return res.status(404).json({ message: 'No audio files found' });
    res.json(audios);
  } catch (error) {
    console.error('❌ Error fetching audio:', error);
    res.status(500).json({ message: 'Data not found', error });
  }
});

// GET: All media
router.get('/all', async (req, res) => {
  try {
    const all = await Video.find({}).sort({ uploadDate: -1 });
    if (!all.length) return res.status(404).json({ message: 'No media found' });
    res.json(all);
  } catch (error) {
    console.error('❌ Error fetching all media:', error);
    res.status(500).json({ message: 'Data not found', error });
  }
});

// GET: Media by type
router.get('/type/:mediaType', async (req, res) => {
  try {
    const { mediaType } = req.params;
    if (!['video', 'audio'].includes(mediaType))
      return res.status(400).json({ message: "Invalid media type. Use 'video' or 'audio'" });

    const data = await Video.find({ type: mediaType }).sort({ uploadDate: -1 });
    if (!data.length) return res.status(404).json({ message: `No ${mediaType} files found` });
    res.json(data);
  } catch (error) {
    console.error(`❌ Error fetching ${req.params.mediaType}:`, error);
    res.status(500).json({ message: 'Data not found', error });
  }
});

// DELETE: by _id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Video.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Media not found' });
    res.json({ message: 'Media deleted successfully', data: deleted });
  } catch (error) {
    console.error('❌ Error deleting media:', error);
    res.status(500).json({ message: 'Error deleting media', error });
  }
});

module.exports = router;
