const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStock: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    images: { type: [String], default: [] },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    legacySqlId: { type: Number, default: null },
    unit: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('product', productSchema);
