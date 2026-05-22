const express = require('express');
const router = express.Router();

const WarehouseController = require('../controllers/warehouseController');
const { checkLogin, checkRole } = require('../middlewares/authHandler');
const { WAREHOUSE_ROLES } = require('../constants/warehouseRoles');

const guard = [checkLogin, checkRole(WAREHOUSE_ROLES)];

router.post('/stock-in', ...guard, WarehouseController.stockIn);
router.post('/stock-out', ...guard, WarehouseController.stockOut);
router.post('/stock-return', ...guard, WarehouseController.stockReturn);
router.get('/inventory', ...guard, WarehouseController.getInventory);
router.get('/low-stock', ...guard, WarehouseController.getLowStock);
router.get('/order-status-summary', ...guard, WarehouseController.getOrderStatusSummary);
router.get('/movements', ...guard, WarehouseController.getMovements);
router.get('/import-receipts', ...guard, WarehouseController.getImportReceipts);
router.post('/import-receipts', ...guard, WarehouseController.createImportReceipt);

module.exports = router;
