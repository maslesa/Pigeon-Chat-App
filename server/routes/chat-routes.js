const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middlewares/isLoggedInMiddleware');
const { isChatMember } = require('../middlewares/chatMiddleware');

const { chatCreate, chatFetchAll, chatJoin, sendMessage, leaveChat, fetchMembers, changeTitle, fetchAllChatMedia, fetchChatAdmins } = require('../controllers/chat-controllers');
const { fetchAllMessages } = require('../controllers/message-controller');

const uploadImageMiddleware = require('../middlewares/profileImageUploadMiddleware');

router.post('/create', isLoggedIn, chatCreate);
router.get('/fetch-all', isLoggedIn, chatFetchAll);
router.get('/fetch-members/:chatId', isLoggedIn, fetchMembers);
router.get('/get-messages/:chatId', isLoggedIn, isChatMember, fetchAllMessages);
router.put('/join/:chatId', isLoggedIn, chatJoin);
router.put('/send-message/:chatId', isLoggedIn, isChatMember, uploadImageMiddleware.single('file'), sendMessage);
router.put('/leave/:chatId', isLoggedIn, isChatMember, leaveChat);
router.put('/change/title/:chatId', isLoggedIn, isChatMember, changeTitle);
router.get('/fetch-media/:chatId', isLoggedIn, isChatMember, fetchAllChatMedia);
router.get('/fetch-admins/:chatId', isLoggedIn, isChatMember, fetchChatAdmins);

module.exports = router;