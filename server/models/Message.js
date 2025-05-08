const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    body: {
        type: String,
        default: '',
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('Message', MessageSchema);