const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    title: {
        type: String,
        default: '',
        required: true
    },
    passcode: {
        type: String,
        default: '',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    backgroundImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatImage',
    }
}, {timestamps: true});

module.exports = mongoose.model('Chat', ChatSchema);