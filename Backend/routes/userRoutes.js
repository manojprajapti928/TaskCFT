const express = require('express');
const { registerUser, LoginUser,getUsers } = require('../controllers/user.controller');

const router = express.Router();

router.post ('/register',registerUser);
router.post('/login',LoginUser);
router.get('/users', getUsers);

module.exports = router;

