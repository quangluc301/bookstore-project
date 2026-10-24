const {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeAuthenticatedPassword,
} = require('../services/authService');

async function register(req, res, next) {
  try {
    const { email, password, full_name } = req.body;
    const user = await registerUser({ email, password, full_name });

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyEmailAddress(req, res, next) {
  try {
    const result = await verifyEmail(req.body);
    res.status(200).json({ success: true, message: 'Email verified successfully', data: result });
  } catch (error) {
    next(error);
  }
}

async function resendEmailVerification(req, res, next) {
  try {
    const result = await resendVerificationCode(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    await requestPasswordReset(req.body);
    res.status(200).json({
      success: true,
      message: 'If an account exists for that email, a reset code has been sent.',
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    await resetPassword(req.body);
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await getUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await updateUserProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    await changeAuthenticatedPassword(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  verifyEmailAddress,
  resendEmailVerification,
  forgotPassword,
  changePassword,
  login,
  getProfile,
  updateProfile,
  updatePassword,
};
