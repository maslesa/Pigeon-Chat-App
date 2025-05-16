const express = require('express');
const router = express.Router();

const {userRegister, userLogin, changePassword} = require('../controllers/auth-controllers');
const isLoggedIn = require('../middlewares/isLoggedInMiddleware');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.put('/password/change', isLoggedIn, changePassword);

module.exports = router;