const Product = require('../schemas/product');
const Category = require('../schemas/category');

class ProductService {
  static async list({ categoryID, status, q, page, limit }) {
    const filter = {};

    if (categoryID) filter.categoryID = categoryID;
    if (status) filter.status = status;
    else filter.status = 'active';

    if (q) {
      // simple search by name substring
      filter.name = { $regex: q, $options: 'i' };
    }

    const pageNum = Number(page || 1);
    const limitNum = Number(limit || 20);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryID')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    return {
      items,
      pagination: { page: pageNum, limit: limitNum, total },
    };
  }

  static async getById(id) {
    return Product.findById(id).populate('categoryID');
  }

  static async create({
    name,
    categoryID,
    basePrice,
    stockQuantity,
    images,
    description,
    status,
  }) {
    const category = await Category.findById(categoryID);
    if (!category) throw new Error('CATEGORY_NOT_FOUND');

    const created = await Product.create({
      name,
      categoryID,
      basePrice,
      stockQuantity: stockQuantity ?? 0,
      images: images ?? [],
      description: description ?? null,
      status: status ?? 'active',
    });

    await created.populate('categoryID');
    return created;
  }

  static async update(
    id,
    { name, categoryID, basePrice, stockQuantity, images, description, status }
  ) {
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (categoryID !== undefined) updatePayload.categoryID = categoryID;
    if (basePrice !== undefined) updatePayload.basePrice = basePrice;
    if (stockQuantity !== undefined) updatePayload.stockQuantity = stockQuantity;
    if (images !== undefined) updatePayload.images = images;
    if (description !== undefined) updatePayload.description = description;
    if (status !== undefined) updatePayload.status = status;

    if (updatePayload.categoryID) {
      const category = await Category.findById(updatePayload.categoryID);
      if (!category) throw new Error('CATEGORY_NOT_FOUND');
    }

    const updated = await Product.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!updated) return null;
    await updated.populate('categoryID');
    return updated;
  }

  static async softDelete(id) {
    const deleted = await Product.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );
    if (!deleted) return null;
    await deleted.populate('categoryID');
    return deleted;
  }
}

module.exports = ProductService;

