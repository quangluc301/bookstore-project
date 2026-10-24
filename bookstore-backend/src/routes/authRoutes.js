const express = require('express');
const {
	register,
	verifyEmailAddress,
	resendEmailVerification,
	forgotPassword,
	changePassword,
	login,
	getProfile,
	updateProfile,
	updatePassword,
} = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmailAddress);
router.post('/resend-verification', resendEmailVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', changePassword);
router.post('/login', login);
router.get('/me', authenticateToken, getProfile);
router.patch('/me', authenticateToken, updateProfile);
router.patch('/me/password', authenticateToken, updatePassword);

module.exports = router;
