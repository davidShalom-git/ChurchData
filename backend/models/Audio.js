const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in seconds
        required: false
    },
    artist: {
        type: String,
        required: false,
        trim: true
    },
    album: {
        type: String,
        required: false,
        trim: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Audio', audioSchema);