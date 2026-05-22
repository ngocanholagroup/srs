const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

require('../schemas/role');
require('../schemas/user');
require('../schemas/category');
require('../schemas/product');
require('../schemas/order');
require('../schemas/warehouseMovement');
require('../schemas/importReceipt');

const { connectDatabase } = require('../config/database');
const { initRedis } = require('../config/redisClient');

const app = express();
const port = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(helmet());
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());

app.use('/api/auth', require('../routes/authRoute'));
app.use('/api/warehouse', require('../routes/warehouseRoute'));
app.use('/api/orders', require('../routes/orderRoute'));

app.get('/', (req, res) => {
  res.status(200).json({
    code: 'SUCCESS',
    message: 'Backend is running',
    module: 'warehouse-delivery',
    timestamp: Date.now(),
  });
});

const start = async () => {
  await connectDatabase();
  initRedis();

  app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
