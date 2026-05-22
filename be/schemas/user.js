const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

require('./role');

const userSchema = new mongoose.Schema(
  {
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    dateOfBirth: { type: Date, default: null },
    phoneNumber: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: { type: String, default: null },
    roleID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'role',
      required: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre('save', function () {
  if (this.isModified('password')) {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
});

module.exports = mongoose.model('user', userSchema);
