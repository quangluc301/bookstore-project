const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend is running correctly',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorMiddleware);

connectDB().catch((error) => {
  console.error('Database startup error:', error);
});

module.exports = app;
