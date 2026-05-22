const mongoose = require('mongoose');

const importReceiptItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    productName: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const importReceiptSchema = new mongoose.Schema(
  {
    receiptCode: { type: String, required: true, unique: true },
    supplier: { type: String, required: true, trim: true },
    items: { type: [importReceiptItemSchema], required: true },
    totalValue: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: null },
    status: {
      type: String,
      enum: ['completed', 'cancelled'],
      default: 'completed',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('importReceipt', importReceiptSchema);
