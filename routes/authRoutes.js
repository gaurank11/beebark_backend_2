const express = require('express');
const { registerUser, loginUser, forgotPassword, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Register, Login, Forgot Password, Verify Email
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

module.exports = router;
