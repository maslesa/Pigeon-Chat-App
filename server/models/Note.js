const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    body:{
        type: String,
        default: ''
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

module.exports = mongoose.model('Note', NoteSchema);