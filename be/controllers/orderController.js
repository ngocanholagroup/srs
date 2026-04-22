const OrderService = require('../services/orderService');

class OrderController {
  static async updateStatus(req, res) {
    try {
      const result = await OrderService.updateStatus(req.params.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }
}

module.exports = OrderController;

