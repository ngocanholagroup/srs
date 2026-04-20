const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Day 1 bootstrap routes (warehouse-delivery module)
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

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
