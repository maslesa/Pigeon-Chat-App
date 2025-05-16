const express = require('express');
const router = express.Router();

const {userRegister, userLogin, changePassword, changeNameSurname, changeUsername} = require('../controllers/auth-controllers');
const isLoggedIn = require('../middlewares/isLoggedInMiddleware');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.put('/password/change', isLoggedIn, changePassword);
router.put('/nameSurname/change', isLoggedIn, changeNameSurname);
router.put('/username/change', isLoggedIn, changeUsername);

module.exports = router;