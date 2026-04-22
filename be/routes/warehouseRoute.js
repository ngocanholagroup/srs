const express = require('express');
const router = express.Router();

const WarehouseController = require('../controllers/warehouseController');

// Day 1 skeleton endpoints
router.post('/stock-in', WarehouseController.stockIn);
router.post('/stock-out', WarehouseController.stockOut);
router.post('/stock-return', WarehouseController.stockReturn);
router.get('/inventory', WarehouseController.getInventory);
router.get('/low-stock', WarehouseController.getLowStock);
router.get('/order-status-summary', WarehouseController.getOrderStatusSummary);

module.exports = router;

