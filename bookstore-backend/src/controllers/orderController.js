const {
  createOrder,
  createAdminOrder: createAdminOrderService,
  getOrdersByUser,
  cancelOrderByCustomer,
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

async function createAdmin(req, res, next) {
  try {
    const order = await createAdminOrderService({
      ...req.body,
      userId: req.body.user_id,
    });
    res.status(201).json({ success: true, data: order });
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

async function cancelMyOrder(req, res, next) {
  try {
    const order = await cancelOrderByCustomer(req.params.id, req.user.id, req.body.reason);
    res.status(200).json({ success: true, data: order });
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
  createAdmin,
  getMyOrders,
  cancelMyOrder,
  getAdminOrders,
  updateStatus,
  getAdminDashboard,
};
