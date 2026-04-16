const PriceListService = require('../services/priceListService');

class PriceListController {
  static async list(req, res) {
    try {
      const { status } = req.query;
      const items = await PriceListService.list({ status });
      return res.status(200).json({ code: 'SUCCESS', data: items });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const priceList = await PriceListService.getById(id);
      if (!priceList) return res.status(404).json({ code: 'NOT_FOUND', message: 'Price list không tồn tại' });
      return res.status(200).json({ code: 'SUCCESS', data: priceList });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, startDate, endDate, status, items } = req.body;
      if (!name) return res.status(400).json({ code: 'BAD_REQUEST', message: 'Thiếu name' });

      const created = await PriceListService.create({
        name,
        description,
        startDate,
        endDate,
        status,
        items,
      });

      return res.status(201).json({ code: 'SUCCESS', message: 'Tạo price list thành công', data: created });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ code: 'CONFLICT', message: 'name price list đã tồn tại' });
      }
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, startDate, endDate, status, items } = req.body;

      const updated = await PriceListService.update(id, {
        name,
        description,
        startDate,
        endDate,
        status,
        items,
      });

      if (!updated) return res.status(404).json({ code: 'NOT_FOUND', message: 'Price list không tồn tại' });
      return res.status(200).json({ code: 'SUCCESS', message: 'Cập nhật price list thành công', data: updated });
    } catch (error) {
      if (error.message === 'PRODUCT_NOT_FOUND') {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Một product trong items không tồn tại' });
      }
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async softDelete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await PriceListService.softDelete(id);
      if (!deleted) return res.status(404).json({ code: 'NOT_FOUND', message: 'Price list không tồn tại' });
      return res.status(200).json({ code: 'SUCCESS', message: 'Xóa mềm price list thành công', data: deleted });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async listItems(req, res) {
    try {
      const { id } = req.params;
      const listItems = await PriceListService.listItems(id);
      return res.status(200).json({ code: 'SUCCESS', data: listItems });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }
}

module.exports = PriceListController;

