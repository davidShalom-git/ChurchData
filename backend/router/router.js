const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Video = require('../models/Video');

// POST: Upload video (expects JSON) - EXISTING
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

// POST: Upload audio (as JSON URL) - EXISTING
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

// NEW: POST: Upload audio as Base64 (replaces multer functionality)
router.post('/audio-file', async (req, res) => {
  try {
    const { title, audioData, mimeType, duration, originalName } = req.body;
    
    if (!title || !audioData) {
      return res.status(400).json({ message: '❌ Title and audio data are required' });
    }

    // Validate base64 format
    const base64Regex = /^data:audio\/[a-zA-Z0-9+]+;base64,/;
    if (!base64Regex.test(audioData)) {
      return res.status(400).json({ message: '❌ Invalid audio data format. Expected base64 data URL' });
    }

    // Calculate file size from base64
    const base64Data = audioData.split(',')[1];
    const fileSize = Math.round((base64Data.length * 3) / 4); // Approximate size in bytes

    const audio = new Video({
      title: title || originalName || 'Untitled Audio',
      url: audioData, // Store base64 directly
      type: 'audio',
      mimeType: mimeType || 'audio/mpeg',
      fileSize: fileSize,
      duration: duration || null,
      storageType: 'base64' // Track storage method
    });

    const saved = await audio.save();
    
    // Return response without the full base64 data for cleaner logs
    const response = {
      ...saved.toObject(),
      url: `[Base64 Audio Data - ${Math.round(fileSize / 1024)}KB]` // Hide base64 in response
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Error saving base64 audio:', error);
    res.status(500).json({ message: '🔥 Internal Server Error', error });
  }
});

// NEW: GET: Stream audio file (for base64 stored audio)
router.get('/audio-stream/:id', async (req, res) => {
  try {
    const audio = await Video.findById(req.params.id);
    
    if (!audio || audio.type !== 'audio') {
      return res.status(404).json({ message: 'Audio not found' });
    }

    // If it's a base64 data URL, extract and stream
    if (audio.url.startsWith('data:audio/')) {
      const [header, base64Data] = audio.url.split(',');
      const mimeType = header.match(/data:([^;]+)/)[1] || 'audio/mpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      
      res.set({
        'Content-Type': mimeType,
        'Content-Length': buffer.length,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Disposition': `inline; filename="${audio.title}.mp3"`
      });
      
      res.send(buffer);
    } else {
      // If it's a regular URL, redirect
      res.redirect(audio.url);
    }
  } catch (error) {
    console.error('❌ Error streaming audio:', error);
    res.status(500).json({ message: 'Error streaming audio', error });
  }
});

// GET: All videos - EXISTING
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

// UPDATED: GET: All audio (hide base64 data in list)
router.get('/audio', async (req, res) => {
  try {
    const audios = await Video.find({ type: 'audio' }).sort({ uploadDate: -1 });
    if (!audios.length) return res.status(404).json({ message: 'No audio files found' });
    
    // Hide base64 data in list view for better performance
    const audioList = audios.map(audio => {
      if (audio.url.startsWith('data:audio/')) {
        return {
          ...audio.toObject(),
          url: `/upload/data/audio-stream/${audio._id}`, // Provide streaming URL
          hasBase64Data: true,
          fileSize: audio.fileSize
        };
      }
      return audio.toObject();
    });
    
    res.json(audioList);
  } catch (error) {
    console.error('❌ Error fetching audio:', error);
    res.status(500).json({ message: 'Data not found', error });
  }
});

// GET: All media - EXISTING (with base64 optimization)
router.get('/all', async (req, res) => {
  try {
    const all = await Video.find({}).sort({ uploadDate: -1 });
    if (!all.length) return res.status(404).json({ message: 'No media found' });
    
    // Optimize base64 data for list view
    const mediaList = all.map(media => {
      if (media.url.startsWith('data:audio/')) {
        return {
          ...media.toObject(),
          url: `/upload/data/audio-stream/${media._id}`,
          hasBase64Data: true,
          fileSize: media.fileSize
        };
      }
      return media.toObject();
    });
    
    res.json(mediaList);
  } catch (error) {
    console.error('❌ Error fetching all media:', error);
    res.status(500).json({ message: 'Data not found', error });
  }
});

// GET: Media by type - EXISTING (with base64 optimization)
router.get('/type/:mediaType', async (req, res) => {
  try {
    const { mediaType } = req.params;
    if (!['video', 'audio'].includes(mediaType))
      return res.status(400).json({ message: "Invalid media type. Use 'video' or 'audio'" });

    const data = await Video.find({ type: mediaType }).sort({ uploadDate: -1 });
    if (!data.length) return res.status(404).json({ message: `No ${mediaType} files found` });
    
    // Optimize base64 data for list view
    const mediaList = data.map(media => {
      if (media.url.startsWith('data:audio/')) {
        return {
          ...media.toObject(),
          url: `/upload/data/audio-stream/${media._id}`,
          hasBase64Data: true,
          fileSize: media.fileSize
        };
      }
      return media.toObject();
    });
    
    res.json(mediaList);
  } catch (error) {
    console.error(`❌ Error fetching ${req.params.mediaType}:`, error);
    res.status(500).json({ message: 'Data not found', error });
  }
});

// DELETE: by _id - EXISTING
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