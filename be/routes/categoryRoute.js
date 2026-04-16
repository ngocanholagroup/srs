const express = require('express');
const router = express.Router();

const CategoryController = require('../controllers/categoryController');
const { checkLogin, checkRole } = require('../middlewares/authHandler');

// Admin/Manager quản lý danh mục
router.get('/', checkLogin, checkRole(['Admin', 'Manager']), CategoryController.list);
router.post('/', checkLogin, checkRole(['Admin', 'Manager']), CategoryController.create);
router.get('/:id', checkLogin, checkRole(['Admin', 'Manager']), CategoryController.getById);
router.put('/:id', checkLogin, checkRole(['Admin', 'Manager']), CategoryController.update);
router.delete('/:id', checkLogin, checkRole(['Admin', 'Manager']), CategoryController.softDelete);

module.exports = router;

