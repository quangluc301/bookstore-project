const { prisma } = require('../config/db');

const includeImages = { images: { orderBy: { sort_order: 'asc' } } };

function parseImageUrls(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 4) {
    const error = new Error('A book can have at most four image URLs');
    error.statusCode = 400;
    throw error;
  }

  return value.map((value) => {
    if (typeof value !== 'string' || !value.trim()) {
      const error = new Error('Image URLs must be non-empty strings');
      error.statusCode = 400;
      throw error;
    }

    const url = value.trim();
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      const error = new Error('Each image must have a valid URL');
      error.statusCode = 400;
      throw error;
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      const error = new Error('Image URLs must use HTTP or HTTPS');
      error.statusCode = 400;
      throw error;
    }
    return url;
  });
}

async function getAllBooks({
  search = '',
  sort = 'newest',
  includeInactive = false,
  categories = [],
  format,
  maxPrice,
} = {}) {
  const orderBy = {
    newest: { created_at: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    title_asc: { title: 'asc' },
  }[sort] || { created_at: 'desc' };

  return prisma.book.findMany({
    include: includeImages,
    where: {
      ...(includeInactive ? {} : { is_active: true }),
      ...(search.trim()
        ? {
            OR: [
              { title: { contains: search.trim() } },
              { author: { contains: search.trim() } },
              { publisher: { contains: search.trim() } },
            ],
          }
        : {}),
      ...(categories.length ? { category: { in: categories } } : {}),
      ...(format ? { format } : {}),
      ...(maxPrice !== undefined ? { price: { lte: maxPrice } } : {}),
    },
    orderBy,
  });
}

async function getNewArrivals(limit = 12) {
  return prisma.book.findMany({
    include: includeImages,
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}

async function createBook(payload) {
  const { title, author, price, stock, publisher, publication_year, category, format, description } = payload;

  if (!title || !author || price === undefined || stock === undefined) {
    const error = new Error('Title, author, price, and stock are required');
    error.statusCode = 400;
    throw error;
  }

  const numericPrice = Number(price);
  const numericStock = Number(stock);
  const numericYear = publication_year ? Number(publication_year) : null;
  const imageUrls = parseImageUrls(payload.image_urls);
  if (!Number.isInteger(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0 ||
      (numericYear !== null && (!Number.isInteger(numericYear) || numericYear < 0))) {
    const error = new Error('Price, stock, or publication year is invalid');
    error.statusCode = 400;
    throw error;
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    const error = new Error('Description must be a string');
    error.statusCode = 400;
    throw error;
  }

  return prisma.book.create({
    data: {
      title: title.trim(),
      author: author.trim(),
      category: typeof category === 'string' && category.trim() ? category.trim() : null,
      format: typeof format === 'string' && format.trim() ? format.trim() : null,
      price: numericPrice,
      stock: numericStock,
      publisher: typeof publisher === 'string' && publisher.trim() ? publisher.trim() : null,
      publication_year: numericYear,
      description: typeof description === 'string' && description.trim() ? description.trim() : null,
      images: { create: imageUrls.map((url, sort_order) => ({ url, sort_order })) },
    },
    include: includeImages,
  });
}

async function getBookById(id) {
  const book = await prisma.book.findFirst({
    where: { id, is_active: true },
    include: includeImages,
  });

  if (!book) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  return book;
}

async function updateBookById(id, payload) {
  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = ['title', 'author', 'category', 'format', 'price', 'stock', 'publisher', 'publication_year', 'description', 'is_active'];
  const data = Object.fromEntries(Object.entries(payload).filter(([key]) => allowedFields.includes(key)));
  if (payload.image_urls !== undefined) {
    const imageUrls = parseImageUrls(payload.image_urls);
    data.images = {
      deleteMany: {},
      create: imageUrls.map((url, sort_order) => ({ url, sort_order })),
    };
  }
  if (!Object.keys(data).length) {
    const error = new Error('No valid book fields provided');
    error.statusCode = 400;
    throw error;
  }
  if (data.title !== undefined) data.title = String(data.title).trim();
  if (data.author !== undefined) data.author = String(data.author).trim();
  if (data.title === '') {
    const error = new Error('Title cannot be empty');
    error.statusCode = 400;
    throw error;
  }
  if (data.author === '') {
    const error = new Error('Author cannot be empty');
    error.statusCode = 400;
    throw error;
  }
  if (data.price !== undefined) {
    data.price = Number(data.price);
    if (!Number.isInteger(data.price) || data.price < 0) {
      const error = new Error('Price must be a non-negative integer');
      error.statusCode = 400;
      throw error;
    }
  }
  if (data.stock !== undefined) {
    data.stock = Number(data.stock);
    if (!Number.isInteger(data.stock) || data.stock < 0) {
      const error = new Error('Stock must be a non-negative integer');
      error.statusCode = 400;
      throw error;
    }
  }
  if (data.publication_year !== undefined && data.publication_year !== null) {
    data.publication_year = Number(data.publication_year);
    if (!Number.isInteger(data.publication_year) || data.publication_year < 0) {
      const error = new Error('Publication year is invalid');
      error.statusCode = 400;
      throw error;
    }
  }
  for (const field of ['category', 'format', 'publisher']) {
    if (data[field] !== undefined && data[field] !== null && typeof data[field] !== 'string') {
      const error = new Error(`${field} must be a string`);
      error.statusCode = 400;
      throw error;
    }
    if (typeof data[field] === 'string') data[field] = data[field].trim() || null;
  }
  if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
    const error = new Error('Description must be a string');
    error.statusCode = 400;
    throw error;
  }
  if (typeof data.description === 'string') data.description = data.description.trim() || null;
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    const error = new Error('is_active must be a boolean');
    error.statusCode = 400;
    throw error;
  }

  return prisma.book.update({
    where: { id },
    data,
    include: includeImages,
  });
}

async function deleteBookById(id) {
  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    const error = new Error('Book not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.book.update({ where: { id }, data: { is_active: false } });
}

module.exports = {
  getAllBooks,
  getNewArrivals,
  createBook,
  getBookById,
  updateBookById,
  deleteBookById,
};
