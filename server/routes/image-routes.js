const express = require('express');
const router = express.Router();
const isLoggedInMiddleware = require('../middlewares/isLoggedInMiddleware');
const { uploadProfileImage, uploadChatImage } = require('../controllers/image-controllers');
const uploadProfileImageMiddleware = require('../middlewares/profileImageUploadMiddleware');
const { isChatMember } = require('../middlewares/chatMiddleware');

router.post('/upload', isLoggedInMiddleware, isChatMember, uploadProfileImageMiddleware.single('image'), uploadProfileImage);
router.post('/upload/chat/:chatId', isLoggedInMiddleware, isChatMember, uploadProfileImageMiddleware.single('chatImage'), uploadChatImage);

module.exports = router;