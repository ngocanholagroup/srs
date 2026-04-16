const PriceList = require('../schemas/priceList');
const PriceListItem = require('../schemas/priceListItem');
const Product = require('../schemas/product');

class PriceListService {
  static async list({ status }) {
    const filter = {};
    if (status) filter.status = status;
    else filter.status = 'active';
    return PriceList.find(filter).sort({ createdAt: -1 });
  }

  static async getById(id) {
    return PriceList.findById(id);
  }

  static async create({ name, description, startDate, endDate, status, items }) {
    const created = await PriceList.create({
      name,
      description: description ?? null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      status: status ?? 'active',
    });

    if (Array.isArray(items) && items.length > 0) {
      // create items one-by-one; if an item fails, we leave it as-is
      // (MVP: keep logic simple; can upgrade to transactions later).
      for (const it of items) {
        await PriceListItem.create({
          priceListID: created._id,
          productID: it.productID,
          unitPrice: it.unitPrice,
          discount: it.discount ?? 0,
          status: it.status ?? 'active',
        });
      }
    }

    return created;
  }

  static async update(
    id,
    { name, description, startDate, endDate, status, items }
  ) {
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (startDate !== undefined) updatePayload.startDate = startDate;
    if (endDate !== undefined) updatePayload.endDate = endDate;
    if (status !== undefined) updatePayload.status = status;

    const updated = await PriceList.findByIdAndUpdate(id, updatePayload, { new: true });

    if (Array.isArray(items)) {
      // Replace items for MVP: mark old as inactive then insert/activate.
      await PriceListItem.updateMany(
        { priceListID: id },
        { $set: { status: 'inactive' } }
      );

      for (const it of items) {
        // Upsert by (priceListID, productID)
        const product = await Product.findById(it.productID);
        if (!product) throw new Error('PRODUCT_NOT_FOUND');

        await PriceListItem.findOneAndUpdate(
          { priceListID: id, productID: it.productID },
          {
            priceListID: id,
            productID: it.productID,
            unitPrice: it.unitPrice,
            discount: it.discount ?? 0,
            status: it.status ?? 'active',
          },
          { upsert: true, new: true }
        );
      }
    }

    return updated;
  }

  static async softDelete(id) {
    await PriceListItem.updateMany({ priceListID: id }, { status: 'inactive' });
    return PriceList.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
  }

  static async listItems(priceListId) {
    return PriceListItem.find({ priceListID: priceListId, status: 'active' })
      .populate('productID')
      .sort({ createdAt: 1 });
  }
}

module.exports = PriceListService;

