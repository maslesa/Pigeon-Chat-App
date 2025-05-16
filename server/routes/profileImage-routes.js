const express = require('express');
const router = express.Router();
const isLoggedInMiddleware = require('../middlewares/isLoggedInMiddleware');
const { uploadProfileImage } = require('../controllers/image-controllers');
const uploadProfileImageMiddleware = require('../middlewares/profileImageUploadMiddleware');

router.post('/upload', isLoggedInMiddleware, uploadProfileImageMiddleware.single('image'), uploadProfileImage);

module.exports = router;