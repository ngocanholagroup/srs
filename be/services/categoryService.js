const Category = require('../schemas/category');

class CategoryService {
  static async list({ status }) {
    const filter = {};
    if (status) filter.status = status;
    else filter.status = 'active';
    return Category.find(filter).sort({ name: 1 });
  }

  static async getById(id) {
    const cat = await Category.findById(id);
    return cat;
  }

  static async create({ name }) {
    const created = await Category.create({ name });
    return created;
  }

  static async update(id, { name }) {
    const updated = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    return updated;
  }

  static async softDelete(id) {
    const updated = await Category.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );
    return updated;
  }
}

module.exports = CategoryService;

