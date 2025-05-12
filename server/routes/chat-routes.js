const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middlewares/isLoggedInMiddleware');
const { isChatMember } = require('../middlewares/chatMiddleware');

const {chatCreate, chatFetchAll, chatJoin, sendMessage, leaveChat, } = require('../controllers/chat-controllers');
const {fetchAllMessages} = require('../controllers/message-controller')


router.post('/create', isLoggedIn, chatCreate);
router.get('/fetch-all', isLoggedIn, chatFetchAll);
router.get('/get-messages/:chatId', isLoggedIn, isChatMember, fetchAllMessages);
router.put('/join/:chatId', isLoggedIn, chatJoin);
router.put('/send-message/:chatId', isLoggedIn, isChatMember, sendMessage);
router.put('/leave/:chatId', isLoggedIn, isChatMember, leaveChat);

module.exports = router;