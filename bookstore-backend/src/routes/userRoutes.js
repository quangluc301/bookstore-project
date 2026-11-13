const express = require('express');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');
const { listUsers, addUser, editUser, changeUserStatus, removeUser } = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken, authorizeAdmin);
router.get('/', listUsers);
router.post('/', addUser);
router.patch('/:id', editUser);
router.patch('/:id/status', changeUserStatus);
router.delete('/:id', removeUser);

module.exports = router;