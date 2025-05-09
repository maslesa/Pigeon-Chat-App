const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middlewares/isLoggedInMiddleware');
const { isChatMember } = require('../middlewares/chatMiddleware')

const {chatCreate, chatFetchAll, chatJoin, sentMessage} = require('../controllers/chat-controllers')


router.post('/create', isLoggedIn, chatCreate);
router.get('/fetch-all', isLoggedIn, chatFetchAll);
router.put('/join/:chatId', isLoggedIn, chatJoin);
router.put('/send-message/:chatId', isLoggedIn, isChatMember, sentMessage);

module.exports = router;