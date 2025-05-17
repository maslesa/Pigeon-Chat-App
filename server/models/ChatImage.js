const mongoose = require('mongoose');

const ChatImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        default: null,
    },
    public_id: {
        type: String,
        required: true,
        default: null
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
        default: null,
    }
}, {timestamps: true});

module.exports = mongoose.model('ChatImage', ChatImageSchema);