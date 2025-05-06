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
    }
}, {timestamps: true});

module.exports = mongoose.model('Message', MessageSchema);