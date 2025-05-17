const express = require('express');
const router = express.Router();
const isLoggedInMiddleware = require('../middlewares/isLoggedInMiddleware');
const { uploadProfileImage, uploadChatImage } = require('../controllers/image-controllers');
const uploadProfileImageMiddleware = require('../middlewares/profileImageUploadMiddleware');

router.post('/upload', isLoggedInMiddleware, uploadProfileImageMiddleware.single('image'), uploadProfileImage);
router.post('/upload/chat/:chatId', isLoggedInMiddleware, uploadProfileImageMiddleware.single('chatImage'), uploadChatImage);

module.exports = router;