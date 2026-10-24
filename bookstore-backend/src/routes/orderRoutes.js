const express = require('express');
const {
	create,
	getMyOrders,
	getAdminOrders,
	updateStatus,
	getAdminDashboard,
} = require('../controllers/orderController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.get('/admin/stats', authorizeAdmin, getAdminDashboard);
router.get('/admin/all', authorizeAdmin, getAdminOrders);
router.post('/', create);
router.get('/', getMyOrders);
router.patch('/:id/status', authorizeAdmin, updateStatus);

module.exports = router;
