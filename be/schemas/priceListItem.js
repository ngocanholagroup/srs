const mongoose = require('mongoose');

const priceListItemSchema = new mongoose.Schema(
  {
    priceListID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'priceList',
      required: [true, 'priceListID is required'],
    },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: [true, 'productID is required'],
    },

    unitPrice: {
      type: Number,
      required: [true, 'unitPrice is required'],
      min: [0, 'unitPrice must be >= 0'],
    },

    discount: {
      type: Number,
      required: false,
      min: [0, 'discount must be >= 0'],
      default: 0,
    },

    status: {
      // allow soft-off item without removing the row
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Avoid duplicate items for the same product within a price list
priceListItemSchema.index({ priceListID: 1, productID: 1 }, { unique: true });

module.exports = mongoose.model('priceListItem', priceListItemSchema);

