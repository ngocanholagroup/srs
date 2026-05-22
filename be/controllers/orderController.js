const OrderService = require('../services/orderService');

const attachUserId = (req) => ({
  ...req.body,
  userId: req.user?._id?.toString() || null,
});

const handleError = (res, error) =>
  res.status(error.status || 500).json({
    code: error.code || 'SERVER_ERROR',
    message: error.message,
    details: error.details || undefined,
  });

class OrderController {
  static async getOrders(req, res) {
    try {
      const result = await OrderService.getOrders(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }

  static async getById(req, res) {
    try {
      const result = await OrderService.getById(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }

  static async checkStock(req, res) {
    try {
      const result = await OrderService.checkStock(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }

  static async acceptOrder(req, res) {
    try {
      const result = await OrderService.acceptOrder(req.params.id, attachUserId(req));
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }

  static async updateStatus(req, res) {
    try {
      const result = await OrderService.updateStatus(req.params.id, attachUserId(req));
      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = OrderController;
