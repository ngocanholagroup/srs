const mongoose = require("mongoose");
let bcrypt = require('bcrypt');
require('./role'); // Vá lỗi Mongoose (Gọi file tải trước mẫu Schema Role để thằng User.populate() nhận diện được)

const userSchema = new mongoose.Schema(
  {
    lastName: {
      type: String,
      required: [true, "Họ không được để trống"]
    },

    firstName: {
      type: String,
      required: [true, "Tên không được để trống"]
    },

    dateOfBirth: {
      type: Date,
      default: null
    },

    phoneNumber: {
      type: String,
      required: [true, "Số điện thoại không được để trống"]
    },

    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      lowercase: true
    },

    address: {
      type: String,
      default: null
    },

    roleID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      required: true
    },

    password: {
      type: String,
      required: [true, "Password is required"]
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function () {
  if (this.isModified("password")) {
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt)
  }
})

userSchema.pre('findOneAndUpdate', function () {
  console.log(this);
  if (this._update && this._update.password) {
    let salt = bcrypt.genSaltSync(10);
    this._update.password = bcrypt.hashSync(this._update.password, salt)
  }
})

module.exports = mongoose.model("user", userSchema);
