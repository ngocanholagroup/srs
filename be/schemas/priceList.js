const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Price list name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('priceList', priceListSchema);

