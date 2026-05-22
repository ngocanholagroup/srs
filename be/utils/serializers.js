const toId = (value) => (value?._id ? value._id.toString() : value?.toString?.() || value);

const serializeProduct = (doc) => {
  if (!doc) return null;
  const p = doc.toObject ? doc.toObject() : doc;
  return {
    id: toId(p._id),
    name: p.name,
    stockQuantity: p.stockQuantity,
    minStock: p.minStock ?? 10,
    status: p.status,
    basePrice: p.basePrice,
    categoryID: toId(p.categoryID),
    unit: p.unit,
    legacySqlId: p.legacySqlId,
  };
};

const serializeMovement = (doc) => {
  if (!doc) return null;
  const m = doc.toObject ? doc.toObject() : doc;
  return {
    id: toId(m._id),
    productId: toId(m.productId),
    orderId: m.orderId ? toId(m.orderId) : null,
    type: m.type,
    quantity: m.quantity,
    reason: m.reason,
    userId: m.createdBy ? toId(m.createdBy) : null,
    createdAt: m.createdAt,
  };
};

const serializeOrder = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: toId(o._id),
    legacySqlId: o.legacySqlId ?? null,
    deliveryOrderCode: o.deliveryOrderCode ?? null,
    status: o.status,
    deliveryDate: o.deliveryDate,
    failureReason: o.failureReason,
    inventoryApplied: o.inventoryApplied,
    warehouseAcceptedAt: o.warehouseAcceptedAt,
    stockCheckedAt: o.stockCheckedAt,
    customerName: o.customerName ?? null,
    customerPhone: o.customerPhone ?? null,
    deliveryAddress: o.deliveryAddress ?? null,
    totalAmount: o.totalAmount ?? 0,
    items: (o.items || []).map((item) => ({
      productId: toId(item.productId),
      quantity: item.quantity,
    })),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

const serializeImportReceipt = (doc) => {
  if (!doc) return null;
  const r = doc.toObject ? doc.toObject() : doc;
  return {
    id: toId(r._id),
    receiptCode: r.receiptCode,
    supplier: r.supplier,
    items: r.items,
    totalValue: r.totalValue,
    notes: r.notes,
    status: r.status,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
  };
};

module.exports = {
  serializeProduct,
  serializeMovement,
  serializeOrder,
  serializeImportReceipt,
};
