const OrderService = require('../services/orderService');

class OrderController {
  static async updateStatus(req, res) {
    const result = await OrderService.updateStatus(req.params.id, req.body);
    return res.status(501).json(result);
  }
}

module.exports = OrderController;

