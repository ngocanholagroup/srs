const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
      minlength: [1, 'Product name is too short'],
    },

    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: [true, 'categoryID is required'],
    },

    basePrice: {
      type: Number,
      required: [true, 'basePrice is required'],
      min: [0, 'basePrice must be >= 0'],
    },

    stockQuantity: {
      type: Number,
      required: [true, 'stockQuantity is required'],
      min: [0, 'stockQuantity must be >= 0'],
      default: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: null,
    },

    status: {
      // docs: soft delete for products -> set status inactive
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('product', productSchema);

