const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middlewares/isLoggedInMiddleware');

const {chatCreate, chatFetchAll, chatJoin} = require('../controllers/chat-controllers')


router.post('/create', isLoggedIn, chatCreate);
router.get('/fetch-all', isLoggedIn, chatFetchAll);
router.put('/join/:chatId', isLoggedIn, chatJoin);



module.exports = router;