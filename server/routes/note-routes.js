const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middlewares/isLoggedInMiddleware');

const {addNote, deleteNote, fetchUserNotes} = require('../controllers/note-controllers');

router.post('/post', isLoggedIn, addNote);
router.get('/fetch', isLoggedIn, fetchUserNotes);
router.delete('/delete/:noteId', isLoggedIn, deleteNote);

module.exports = router;