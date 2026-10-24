const { prisma } = require('../config/db');

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createOrder({ userId, items, recipient_name, phone, address }) {
  if (!userId || typeof recipient_name !== 'string' || !recipient_name.trim() ||
      typeof phone !== 'string' || !phone.trim() || typeof address !== 'string' || !address.trim()) {
    throw createError('Recipient name, phone, and address are required', 400);
  }
  if (recipient_name.trim().length > 191 || phone.trim().length > 32 || address.trim().length > 512) {
    throw createError('Delivery information exceeds the supported length', 400);
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw createError('Order must contain between 1 and 100 items', 400);
  }

  const quantities = new Map();
  for (const item of items) {
    if (!item || typeof item !== 'object') throw createError('Each order item must be an object', 400);
    const quantity = Number(item.quantity);
    if (typeof item.book_id !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw createError('Each item requires a valid book ID and quantity', 400);
    }
    quantities.set(item.book_id, (quantities.get(item.book_id) || 0) + quantity);
    if (quantities.get(item.book_id) > 99) throw createError('Quantity per book cannot exceed 99', 400);
  }

  return prisma.$transaction(async (transaction) => {
    const orderItems = [];
    let totalAmount = 0;

    for (const [bookId, quantity] of quantities) {
      const book = await transaction.book.findFirst({
        where: { id: bookId, is_active: true },
        select: { id: true, title: true, price: true, stock: true },
      });
      if (!book) throw createError(`Book ${bookId} is unavailable`, 404);
      if (book.stock < quantity) throw createError(`Not enough stock for ${book.title}`, 409);

      const stockUpdate = await transaction.book.updateMany({
        where: { id: bookId, is_active: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (stockUpdate.count !== 1) throw createError(`Not enough stock for ${book.title}`, 409);

      totalAmount += book.price * quantity;
      if (!Number.isSafeInteger(totalAmount) || totalAmount > 2147483647) {
        throw createError('Order total exceeds the supported limit', 400);
      }
      orderItems.push({
        book_id: book.id,
        title: book.title,
        quantity,
        unit_price: book.price,
      });
    }

    return transaction.order.create({
      data: {
        user_id: userId,
        recipient_name: recipient_name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        total_amount: totalAmount,
        items: { create: orderItems },
      },
      include: { items: true },
    });
  });
}

async function getOrdersByUser(userId) {
  return prisma.order.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: { items: true },
  });
}

async function getAllOrders() {
  return prisma.order.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      items: true,
      user: { select: { id: true, email: true, full_name: true } },
    },
  });
}

async function updateOrderStatus(id, status) {
  const allowedStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!allowedStatuses.includes(status)) throw createError('Invalid order status', 400);

  return prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw createError('Order not found', 404);
    if (order.status === status) return order;
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw createError(`Cannot change an order from ${order.status}`, 409);
    }
    const transitions = {
      PENDING: ['PROCESSING'],
      PROCESSING: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
    };
    if (status !== 'CANCELLED' && !transitions[order.status]?.includes(status)) {
      throw createError(`Cannot change order from ${order.status} to ${status}`, 409);
    }

    const changed = await transaction.order.updateMany({
      where: { id, status: order.status },
      data: { status },
    });
    if (changed.count !== 1) throw createError('Order status changed; reload and try again', 409);

    if (status === 'CANCELLED') {
      for (const item of order.items) {
        if (item.book_id) {
          await transaction.book.update({
            where: { id: item.book_id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    return transaction.order.findUnique({ where: { id }, include: { items: true } });
  });
}

async function getDashboardStats() {
  const [totalBooks, orderCount, revenue] = await Promise.all([
    prisma.book.count({ where: { is_active: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { total_amount: true },
    }),
  ]);

  return {
    total_books: totalBooks,
    total_orders: orderCount,
    revenue: revenue._sum.total_amount || 0,
  };
}

module.exports = {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
