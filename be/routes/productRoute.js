const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController');
const { checkLogin, checkRole } = require('../middlewares/authHandler');

// Admin/Manager quản lý sản phẩm
router.get('/', checkLogin, checkRole(['Admin', 'Manager']), ProductController.list);
router.post('/', checkLogin, checkRole(['Admin', 'Manager']), ProductController.create);
router.get('/:id', checkLogin, checkRole(['Admin', 'Manager']), ProductController.getById);
router.put('/:id', checkLogin, checkRole(['Admin', 'Manager']), ProductController.update);
router.delete('/:id', checkLogin, checkRole(['Admin', 'Manager']), ProductController.softDelete);

module.exports = router;

