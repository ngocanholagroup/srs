const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { checkLogin, checkRole } = require('../middlewares/authHandler');

// API xem danh sách (Quyền Quản lý hoặc Giám đốc mới được xem)
router.get('/', checkLogin, checkRole(['Admin', 'Manager']), UserController.getAllUsers);

// API thay đổi chức vụ (Hệ thống gắt gao: CHỈ CÓ ADMIN ĐƯỢC QUYỀN ĐỔI CHỨC VỤ)
router.put('/:id/role', checkLogin, checkRole(['Admin']), UserController.changeRole);

module.exports = router;
