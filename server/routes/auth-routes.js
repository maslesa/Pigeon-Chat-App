const express = require('express');
const router = express.Router();

const {userRegister, userLogin, changePassword, changeNameSurname} = require('../controllers/auth-controllers');
const isLoggedIn = require('../middlewares/isLoggedInMiddleware');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.put('/password/change', isLoggedIn, changePassword);
router.put('/nameSurname/change', isLoggedIn, changeNameSurname);

module.exports = router;