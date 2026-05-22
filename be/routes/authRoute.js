const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { checkLogin } = require('../middlewares/authHandler');

router.post('/login', AuthController.login);
router.get('/me', checkLogin, AuthController.me);

module.exports = router;
