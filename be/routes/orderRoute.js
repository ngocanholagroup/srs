const express = require('express');
const router = express.Router();

const OrderController = require('../controllers/orderController');

// Day 1 skeleton endpoint for warehouse delivery flow
router.put('/:id/status', OrderController.updateStatus);

module.exports = router;

