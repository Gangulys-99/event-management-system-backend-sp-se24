const express = require("express");
const authController = require('../controllers/auth')
const router = express.Router();

router.post("/register", authController.register)
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/verify', authController.verify);
router.post('/requestPasswordReset', authController.requestPasswordReset);
router.post('/resetPassword', authController.resetPassword);
router.post('/verify_captcha', authController.verify_captcha);

module.exports = router;

