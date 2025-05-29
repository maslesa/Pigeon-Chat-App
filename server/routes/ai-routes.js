const express = require('express');
const { sendAIMessage, fetchUsersMessages } = require('../controllers/ai-controllers');
const isLoggedIn = require('../middlewares/isLoggedInMiddleware');
const router = express.Router();

router.get('/fetch-messages', isLoggedIn, fetchUsersMessages);
router.post('/send-message', isLoggedIn, sendAIMessage);

module.exports = router;