const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/orderController');
const { checkLogin, checkRole } = require('../middlewares/authHandler');
const { WAREHOUSE_ROLES } = require('../constants/warehouseRoles');

const guard = [checkLogin, checkRole(WAREHOUSE_ROLES)];

router.get('/', ...guard, OrderController.getOrders);
router.get('/:id/stock-check', ...guard, OrderController.checkStock);
router.post('/:id/accept', ...guard, OrderController.acceptOrder);
router.get('/:id', ...guard, OrderController.getById);
router.put('/:id/status', ...guard, OrderController.updateStatus);

module.exports = router;
