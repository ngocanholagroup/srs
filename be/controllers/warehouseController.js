const WarehouseService = require('../services/warehouseService');

const attachUserId = (req) => ({
  ...req.body,
  userId: req.user?._id?.toString() || null,
});

class WarehouseController {
  static async stockIn(req, res) {
    try {
      const result = await WarehouseService.stockIn(attachUserId(req));
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async stockOut(req, res) {
    try {
      const result = await WarehouseService.stockOut(attachUserId(req));
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async stockReturn(req, res) {
    try {
      const result = await WarehouseService.stockReturn(attachUserId(req));
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

  static async getMovements(req, res) {
    try {
      const result = await WarehouseService.getMovements(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async getImportReceipts(req, res) {
    try {
      const result = await WarehouseService.getImportReceipts();
      return res.status(200).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }

  static async createImportReceipt(req, res) {
    try {
      const result = await WarehouseService.createImportReceipt(
        req.body,
        req.user?._id?.toString() || null
      );
      return res.status(201).json(result);
    } catch (error) {
      return res
        .status(error.status || 500)
        .json({ code: error.code || 'SERVER_ERROR', message: error.message });
    }
  }
}

module.exports = WarehouseController;
