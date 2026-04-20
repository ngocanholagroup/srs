const WarehouseService = require('../services/warehouseService');

class WarehouseController {
  static async stockIn(req, res) {
    const result = await WarehouseService.stockIn(req.body);
    return res.status(501).json(result);
  }

  static async stockOut(req, res) {
    const result = await WarehouseService.stockOut(req.body);
    return res.status(501).json(result);
  }

  static async getInventory(req, res) {
    const result = await WarehouseService.getInventory(req.query);
    return res.status(501).json(result);
  }

  static async getLowStock(req, res) {
    const result = await WarehouseService.getLowStock(req.query);
    return res.status(501).json(result);
  }

  static async getOrderStatusSummary(req, res) {
    const result = await WarehouseService.getOrderStatusSummary(req.query);
    return res.status(501).json(result);
  }
}

module.exports = WarehouseController;

