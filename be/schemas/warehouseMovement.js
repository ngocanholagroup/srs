// Day 1 schema placeholder for module design review.
// Real mongoose schema will be implemented in Day 2
// after confirming business rules with leader.
const warehouseMovementSchemaDraft = {
  productID: 'ObjectId',
  orderID: 'ObjectId|null',
  type: 'stock_in|stock_out|stock_return',
  quantity: 'number',
  reason: 'string|null',
  createdBy: 'ObjectId|null',
  createdAt: 'Date',
  updatedAt: 'Date',
};

module.exports = warehouseMovementSchemaDraft;

