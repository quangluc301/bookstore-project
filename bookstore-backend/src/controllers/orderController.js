const {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../services/orderService');

async function create(req, res, next) {
  try {
    const order = await createOrder({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await getOrdersByUser(req.user.id);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminOrders(req, res, next) {
  try {
    const orders = await getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
}

async function getAdminDashboard(req, res, next) {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  getMyOrders,
  getAdminOrders,
  updateStatus,
  getAdminDashboard,
};
