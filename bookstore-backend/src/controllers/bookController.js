const {
  getAllBooks,
  getNewArrivals,
  createBook,
  getBookById,
  updateBookById,
  deleteBookById,
} = require('../services/bookService');

async function getBooks(req, res, next) {
  try {
    const maxPrice = req.query.maxPrice === undefined ? undefined : Number(req.query.maxPrice);
    const books = await getAllBooks({
      search: req.query.search || '',
      sort: req.query.sort || 'newest',
      categories: req.query.categories ? String(req.query.categories).split(',').filter(Boolean) : [],
      format: req.query.format || undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    });

    res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
}

async function getArrivals(req, res, next) {
  try {
    const requestedLimit = Number(req.query.limit) || 12;
    const books = await getNewArrivals(Math.min(Math.max(requestedLimit, 1), 50));
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
}

async function getAdminBooks(req, res, next) {
  try {
    const books = await getAllBooks({
      search: req.query.search || '',
      sort: req.query.sort || 'newest',
      includeInactive: true,
    });
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
}

async function createNewBook(req, res, next) {
  try {
    const payload = req.body;
    const book = await createBook(payload);

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

async function getBook(req, res, next) {
  try {
    const book = await getBookById(req.params.id);

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

async function updateBook(req, res, next) {
  try {
    const book = await updateBookById(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteBook(req, res, next) {
  try {
    await deleteBookById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBooks,
  getArrivals,
  getAdminBooks,
  createBook: createNewBook,
  getBook,
  updateBook,
  deleteBook,
};
