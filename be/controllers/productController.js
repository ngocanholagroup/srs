const ProductService = require('../services/productService');

class ProductController {
  static async list(req, res) {
    try {
      const { categoryID, status, q, page, limit } = req.query;
      const result = await ProductService.list({ categoryID, status, q, page, limit });
      return res.status(200).json({
        code: 'SUCCESS',
        message: 'Lấy danh sách products thành công',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getById(id);
      if (!product) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Product không tồn tại' });
      }
      return res.status(200).json({ code: 'SUCCESS', data: product });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const {
        name,
        categoryID,
        basePrice,
        stockQuantity,
        images,
        description,
        status,
      } = req.body;

      if (!name || !categoryID || basePrice === undefined) {
        return res.status(400).json({
          code: 'BAD_REQUEST',
          message: 'Thiếu name/categoryID/basePrice',
        });
      }

      const created = await ProductService.create({
        name,
        categoryID,
        basePrice,
        stockQuantity,
        images,
        description,
        status,
      });

      return res.status(201).json({
        code: 'SUCCESS',
        message: 'Tạo product thành công',
        data: created,
      });
    } catch (error) {
      if (error.message === 'CATEGORY_NOT_FOUND') {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Category không tồn tại' });
      }
      if (error.code === 11000) {
        return res.status(409).json({ code: 'CONFLICT', message: 'name product đã tồn tại' });
      }
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        categoryID,
        basePrice,
        stockQuantity,
        images,
        description,
        status,
      } = req.body;

      const updated = await ProductService.update(id, {
        name,
        categoryID,
        basePrice,
        stockQuantity,
        images,
        description,
        status,
      });

      if (!updated) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Product không tồn tại' });
      }

      return res.status(200).json({ code: 'SUCCESS', message: 'Cập nhật product thành công', data: updated });
    } catch (error) {
      if (error.message === 'CATEGORY_NOT_FOUND') {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Category không tồn tại' });
      }
      if (error.code === 11000) {
        return res.status(409).json({ code: 'CONFLICT', message: 'name product đã tồn tại' });
      }
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async softDelete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ProductService.softDelete(id);
      if (!deleted) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Product không tồn tại' });
      }
      return res.status(200).json({ code: 'SUCCESS', message: 'Xóa mềm product thành công', data: deleted });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }
}

module.exports = ProductController;

