const express = require('express');
const router = express.Router();
const isLoggedInMiddleware = require('../middlewares/isLoggedInMiddleware');
const { uploadProfileImage, uploadChatImage, deleteProfileImage, deleteChatImage } = require('../controllers/image-controllers');
const uploadProfileImageMiddleware = require('../middlewares/profileImageUploadMiddleware');
const { isChatMember } = require('../middlewares/chatMiddleware');

router.post('/upload', isLoggedInMiddleware, uploadProfileImageMiddleware.single('image'), uploadProfileImage);
router.post('/upload/chat/:chatId', isLoggedInMiddleware, isChatMember, uploadProfileImageMiddleware.single('chatImage'), uploadChatImage);
router.delete('/delete/profileImage/:profileImageId', isLoggedInMiddleware, deleteProfileImage);
router.delete('/delete/chatImage/:chatId', isLoggedInMiddleware, isChatMember, deleteChatImage);

module.exports = router;