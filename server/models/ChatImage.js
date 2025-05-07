const mongoose = require('mongoose');

const ChatImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    public_id: {
        type: String,
        required: true,
    },
}, {timestamps: true});

module.exports = mongoose.model('Image', ChatImageSchema);