const mongoose = require('mongoose');

const ProfileImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        default: null
    },
    public_id: {
        type: String,
        required: true,
        default: null
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        default: null
    }
}, {timestamps: true});

module.exports = mongoose.model('ProfileImage', ProfileImageSchema);