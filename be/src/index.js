const express = require('express');
const mongoose = require('mongoose');

// VÁ LỖI TRIỆT ĐỂ: Import trực tiếp các Model vào bộ nhớ trung tâm của Mongoose
require('../schemas/role');
require('../schemas/user');
require('../schemas/category');
require('../schemas/product');
require('../schemas/priceList');
require('../schemas/priceListItem');

const app = express();
const port = process.env.PORT || 3000;

// Bắt buộc phải có để đọc JSON từ req.body
app.use(express.json());

// Khởi tạo các Route chuyên biệt
app.use('/api/auth', require('../routes/authRoute'));
app.use('/api/users', require('../routes/userRoute'));
app.use('/api/categories', require('../routes/categoryRoute'));
app.use('/api/products', require('../routes/productRoute'));
app.use('/api/price-lists', require('../routes/priceListRoute'));

// Health check để mở trình duyệt "/" không bị lỗi "Cannot GET /"
app.get('/', (req, res) => {
  return res.status(200).json({
    code: 'SUCCESS',
    message: 'Backend is running',
    timestamp: Date.now(),
  });
});

// Khởi tạo Database (Sử dụng URL MongoDB cục bộ hoặc thay bằng MongoDB Atlas tùy bạn)
const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/srs_db';

mongoose
  .connect(DB_URI)
  .then(() => console.log('✅ Đã kết nối thành công tới CSDL MongoDB!'))
  .catch((err) => console.error('❌ Kết nối CSDL thất bại:', err));

app.listen(port, () => {
  console.log(`🚀 Server Backend Nodejs khởi chạy tại Port: ${port}`);
});
