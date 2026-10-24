const express = require('express');
const { getBooks, getArrivals, getAdminBooks, createBook, getBook, updateBook, deleteBook } = require('../controllers/bookController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getBooks);
router.get('/new-arrivals', getArrivals);
router.get('/admin/all', authenticateToken, authorizeAdmin, getAdminBooks);
router.get('/:id', getBook);
router.post('/', authenticateToken, authorizeAdmin, createBook);
router.put('/:id', authenticateToken, authorizeAdmin, updateBook);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteBook);

module.exports = router;
