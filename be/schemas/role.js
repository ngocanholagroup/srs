const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    // Bỏ `roleID` vì Mongoose sẽ tự tạo khoá chính `_id` mặc định

    roleName: {
      type: String,
      required: [true, "Tên quyền (roleName) không được để trống"],
      unique: true // Tên Role nên là duy nhất (vd: 'Admin', 'User')
    }
  },
  {
    timestamps: true
  }
);

// Tên model được khai báo là "role" (chữ thường) để khớp hoàn toàn với `ref: "role"` ở file user.js
module.exports = mongoose.model("role", roleSchema);
