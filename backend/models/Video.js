const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['video', 'audio'],
        default: 'video'
    },
    duration: {
        type: Number, // in seconds
        required: false
    },
    // NEW: Additional fields for base64 support
    mimeType: {
        type: String,
        required: false,
        default: 'audio/mpeg'
    },
    fileSize: {
        type: Number, // in bytes
        required: false
    },
    storageType: {
        type: String,
        enum: ['url', 'base64'],
        default: 'url'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better performance
videoSchema.index({ type: 1, uploadDate: -1 });
videoSchema.index({ storageType: 1 });

module.exports = mongoose.model('Video', videoSchema);