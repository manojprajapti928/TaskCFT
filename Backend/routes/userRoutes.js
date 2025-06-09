const express = require('express');
const { registerUser, LoginUser,getUsers,forgetPassword,resetPassword } = require('../controllers/user.controller');

const router = express.Router();

router.post ('/register',registerUser);
router.post('/login',LoginUser);
router.get('/users', getUsers);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

