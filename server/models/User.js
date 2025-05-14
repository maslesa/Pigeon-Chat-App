const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nameSurname: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProfileImage'
    }
});

module.exports = mongoose.model('User', UserSchema);