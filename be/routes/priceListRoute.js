const express = require('express');
const router = express.Router();

const PriceListController = require('../controllers/priceListController');
const { checkLogin, checkRole } = require('../middlewares/authHandler');

// Admin/Manager quản lý bảng giá
router.get('/', checkLogin, checkRole(['Admin', 'Manager']), PriceListController.list);
router.get('/:id', checkLogin, checkRole(['Admin', 'Manager']), PriceListController.getById);
router.post('/', checkLogin, checkRole(['Admin', 'Manager']), PriceListController.create);
router.put('/:id', checkLogin, checkRole(['Admin', 'Manager']), PriceListController.update);
router.delete('/:id', checkLogin, checkRole(['Admin', 'Manager']), PriceListController.softDelete);

// Doc yêu cầu: GET /api/price-lists/{id}/items
router.get('/:id/items', checkLogin, checkRole(['Admin', 'Manager']), PriceListController.listItems);

module.exports = router;

