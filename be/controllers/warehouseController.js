const WarehouseService = require('../services/warehouseService');

class WarehouseController {
  static async stockIn(req, res) {
    try {
      const result = await WarehouseService.stockIn(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async stockOut(req, res) {
    try {
      const result = await WarehouseService.stockOut(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async stockReturn(req, res) {
    try {
      const result = await WarehouseService.stockReturn(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async getInventory(req, res) {
    try {
      const result = await WarehouseService.getInventory(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async getLowStock(req, res) {
    try {
      const result = await WarehouseService.getLowStock(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async getOrderStatusSummary(req, res) {
    try {
      const result = await WarehouseService.getOrderStatusSummary(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }
}

module.exports = WarehouseController;

