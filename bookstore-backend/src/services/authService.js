const crypto = require('crypto');
const { prisma } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { generateToken } = require('../utils/jwtToken');
const { sendOtpEmail } = require('../utils/email');

const OTP_LIFETIME_MS = 10 * 60 * 1000;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function isValidOtp(code, storedHash) {
  if (!/^\d{6}$/.test(code || '') || !storedHash) return false;
  const codeHash = Buffer.from(hashOtp(code), 'hex');
  const expectedHash = Buffer.from(storedHash, 'hex');
  return codeHash.length === expectedHash.length && crypto.timingSafeEqual(codeHash, expectedHash);
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

async function sendVerificationCode(user) {
  const code = createOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      email_verification_code: hashOtp(code),
      email_verification_expires: new Date(Date.now() + OTP_LIFETIME_MS),
    },
  });
  await sendOtpEmail(user.email, code, 'verification');
}

async function registerUser({ email, password, full_name }) {
  if (!email || !password || !full_name) {
    throw createError('Email, password, and full name are required', 400);
  }

  if (password.length < 8) throw createError('Password must be at least 8 characters', 400);

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser?.email_verified) throw createError('User already exists', 409);

  const password_hash = await hashPassword(password);
  const user = existingUser
    ? existingUser
    : await prisma.user.create({
        data: {
          email: normalizedEmail,
          password_hash,
          full_name: full_name.trim(),
          email_verified: false,
        },
      });

  if (existingUser) {
    await prisma.user.update({ where: { id: user.id }, data: { password_hash, full_name: full_name.trim() } });
  }
  await sendVerificationCode(user);
  return { email: user.email };
}

async function verifyEmail({ email, code }) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || user.email_verified || !isValidOtp(code, user.email_verification_code) ||
      !user.email_verification_expires || user.email_verification_expires < new Date()) {
    throw createError('Invalid or expired verification code', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email_verified: true,
      email_verification_code: null,
      email_verification_expires: null,
    },
  });
  return { email: user.email };
}

async function resendVerificationCode({ email }) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (user && !user.email_verified) await sendVerificationCode(user);
  return { message: 'If the account needs verification, a new code has been sent.' };
}

async function requestPasswordReset({ email }) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user || !user.email_verified) return;

  const code = createOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_reset_code: hashOtp(code),
      password_reset_expires: new Date(Date.now() + OTP_LIFETIME_MS),
    },
  });
  await sendOtpEmail(user.email, code, 'password-reset');
}

async function resetPassword({ email, code, password }) {
  if (typeof password !== 'string' || password.length < 8) {
    throw createError('Password must be at least 8 characters', 400);
  }

  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  if (!user || !isValidOtp(code, user.password_reset_code) ||
      !user.password_reset_expires || user.password_reset_expires < new Date()) {
    throw createError('Invalid or expired reset code', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: await hashPassword(password),
      password_reset_code: null,
      password_reset_expires: null,
    },
  });
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.email_verified) throw createError('Please verify your email before signing in', 403);

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
}

async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

async function updateUserProfile(userId, { full_name }) {
  if (typeof full_name !== 'string' || !full_name.trim()) {
    throw createError('Full name is required', 400);
  }
  if (full_name.trim().length > 191) {
    throw createError('Full name is too long', 400);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { full_name: full_name.trim() },
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      created_at: true,
    },
  });
}

async function changeAuthenticatedPassword(userId, { current_password, new_password }) {
  if (typeof current_password !== 'string' || typeof new_password !== 'string') {
    throw createError('Current and new passwords are required', 400);
  }
  if (new_password.length < 8) {
    throw createError('New password must be at least 8 characters', 400);
  }
  if (current_password === new_password) {
    throw createError('New password must be different from the current password', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password_hash: true },
  });
  if (!user) throw createError('User not found', 404);
  if (!(await comparePassword(current_password, user.password_hash))) {
    throw createError('Current password is incorrect', 401);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: await hashPassword(new_password) },
  });
}

module.exports = {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeAuthenticatedPassword,
};
