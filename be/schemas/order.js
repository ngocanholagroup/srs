const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'draft',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'failed',
        'cancelled',
      ],
      default: 'confirmed',
    },
    deliveryDate: { type: Date, default: null },
    failureReason: { type: String, default: null },
    inventoryApplied: { type: Boolean, default: false },
    warehouseAcceptedAt: { type: Date, default: null },
    stockCheckedAt: { type: Date, default: null },
    deliveryOrderCode: { type: String, default: null },
    legacySqlId: { type: Number, default: null, unique: true, sparse: true },
    customerName: { type: String, default: null },
    customerPhone: { type: String, default: null },
    deliveryAddress: { type: String, default: null },
    totalAmount: { type: Number, default: 0 },
    items: {
      type: [orderItemSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'Order must have items'],
    },
  },
  { timestamps: true }
);

orderSchema.pre('save', function () {
  if (this.isNew && !this.deliveryOrderCode) {
    const suffix = this.legacySqlId || Date.now().toString().slice(-6);
    this.deliveryOrderCode = `LG-${suffix}`;
  }
});

module.exports = mongoose.model('order', orderSchema);
