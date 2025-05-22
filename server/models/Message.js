const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    body: {
        type: String,
        default: '',
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        default: null,
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