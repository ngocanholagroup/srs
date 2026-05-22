const mongoose = require('mongoose');

const warehouseMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'order',
      default: null,
    },
    type: {
      type: String,
      enum: ['stock_in', 'stock_out', 'stock_return'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('warehouseMovement', warehouseMovementSchema);
