const CategoryService = require('../services/categoryService');

class CategoryController {
  static async list(req, res) {
    try {
      const { status } = req.query;
      const categories = await CategoryService.list({ status });
      return res.status(200).json({
        code: 'SUCCESS',
        message: 'Lấy danh sách categories thành công',
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ code: 'BAD_REQUEST', message: 'Thiếu trường name' });
      }

      const created = await CategoryService.create({ name });
      return res.status(201).json({
        code: 'SUCCESS',
        message: 'Tạo category thành công',
        data: created,
      });
    } catch (error) {
      // Duplicate key on unique index
      if (error.code === 11000) {
        return res.status(409).json({ code: 'CONFLICT', message: 'Category name đã tồn tại' });
      }
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getById(id);
      if (!category) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Category không tồn tại' });
      }
      return res.status(200).json({ code: 'SUCCESS', data: category });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (name === undefined) {
        return res.status(400).json({ code: 'BAD_REQUEST', message: 'Thiếu trường name' });
      }

      const updated = await CategoryService.update(id, { name });
      if (!updated) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Category không tồn tại' });
      }
      return res.status(200).json({ code: 'SUCCESS', message: 'Cập nhật category thành công', data: updated });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ code: 'CONFLICT', message: 'Category name đã tồn tại' });
      }
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async softDelete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await CategoryService.softDelete(id);
      if (!deleted) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Category không tồn tại' });
      }
      return res.status(200).json({ code: 'SUCCESS', message: 'Xóa mềm category thành công', data: deleted });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }
}

module.exports = CategoryController;

