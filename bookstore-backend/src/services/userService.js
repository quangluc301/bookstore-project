const { prisma } = require('../config/db');
const { hashPassword } = require('../utils/hashPassword');

const userSelect = {
  id: true,
  email: true,
  full_name: true,
  role: true,
  is_active: true,
  email_verified: true,
  created_at: true,
  _count: { select: { orders: true } },
};

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validateRole(role) {
  if (!['USER', 'ADMIN'].includes(role)) {
    throw createError('Role must be USER or ADMIN', 400);
  }
}

async function ensureNotLastActiveAdmin(user, nextRole = user.role, nextActive = user.is_active) {
  if (user.role !== 'ADMIN' || !user.is_active || (nextRole === 'ADMIN' && nextActive)) return;

  const otherActiveAdmins = await prisma.user.count({
    where: { role: 'ADMIN', is_active: true, id: { not: user.id } },
  });
  if (otherActiveAdmins === 0) throw createError('At least one active administrator is required', 409);
}

async function getUsers({ search = '', role } = {}) {
  const normalizedSearch = typeof search === 'string' ? search.trim() : '';
  return prisma.user.findMany({
    where: {
      ...(role && ['USER', 'ADMIN'].includes(role) ? { role } : {}),
      ...(normalizedSearch ? {
        OR: [
          { full_name: { contains: normalizedSearch } },
          { email: { contains: normalizedSearch } },
        ],
      } : {}),
    },
    select: userSelect,
    orderBy: { created_at: 'desc' },
  });
}

async function createUser({ email, full_name, password, role = 'USER' }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = typeof full_name === 'string' ? full_name.trim() : '';
  if (!normalizedEmail || !normalizedName || typeof password !== 'string') {
    throw createError('Email, full name, and password are required', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw createError('A valid email address is required', 400);
  if (normalizedName.length > 191) throw createError('Full name is too long', 400);
  if (password.length < 8) throw createError('Password must be at least 8 characters', 400);
  validateRole(role);

  if (await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })) {
    throw createError('A user with this email already exists', 409);
  }

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      full_name: normalizedName,
      password_hash: await hashPassword(password),
      role,
      is_active: true,
      email_verified: true,
    },
    select: userSelect,
  });
}

async function updateUser(id, { email, full_name, role }, requesterId) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw createError('User not found', 404);

  const data = {};
  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw createError('A valid email address is required', 400);
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
    if (existing && existing.id !== id) throw createError('A user with this email already exists', 409);
    data.email = normalizedEmail;
  }
  if (full_name !== undefined) {
    if (typeof full_name !== 'string' || !full_name.trim()) throw createError('Full name is required', 400);
    if (full_name.trim().length > 191) throw createError('Full name is too long', 400);
    data.full_name = full_name.trim();
  }
  if (role !== undefined) {
    validateRole(role);
    if (id === requesterId && role !== 'ADMIN') throw createError('You cannot remove your own administrator role', 409);
    await ensureNotLastActiveAdmin(user, role, user.is_active);
    data.role = role;
  }
  if (!Object.keys(data).length) throw createError('No valid user fields provided', 400);

  return prisma.user.update({ where: { id }, data, select: userSelect });
}

async function setUserActive(id, is_active, requesterId) {
  if (typeof is_active !== 'boolean') throw createError('is_active must be a boolean', 400);
  if (id === requesterId && !is_active) throw createError('You cannot deactivate your own account', 409);

  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw createError('User not found', 404);
  await ensureNotLastActiveAdmin(user, user.role, is_active);

  return prisma.user.update({ where: { id }, data: { is_active }, select: userSelect });
}

async function deleteUser(id, requesterId) {
  if (id === requesterId) throw createError('You cannot delete your own account', 409);
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw createError('User not found', 404);
  await ensureNotLastActiveAdmin(user, 'USER', false);
  if (user._count.orders > 0) throw createError('This user has orders; deactivate the account instead', 409);
  return prisma.user.delete({ where: { id }, select: userSelect });
}

module.exports = { getUsers, createUser, updateUser, setUserActive, deleteUser };