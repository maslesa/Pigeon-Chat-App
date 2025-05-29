const mongoose = require('mongoose');

const AIMessageSchema = new mongoose.Schema({
    body: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isAI: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('AIMessage', AIMessageSchema);