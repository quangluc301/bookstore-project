const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookstore-secret');
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, is_active: true },
    });
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    req.user = { ...decoded, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
}

function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  authorizeAdmin,
};
