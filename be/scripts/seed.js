const mongoose = require('mongoose');
const Role = require('../schemas/role');
const User = require('../schemas/user');

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/srs_db';

const seedData = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log("✅ Kết nối Database thành công để chạy Script!");

        // 1. Khởi tạo các Role nền tảng
        const roles = ['User', 'Admin', 'Manager', 'Sales'];
        const roleDocs = {};

        for (const roleName of roles) {
            let existingRole = await Role.findOne({ roleName });
            if (!existingRole) {
                existingRole = await Role.create({ roleName });
                console.log(`✅ Đã tạo mới Role: ${roleName}`);
            } else {
                console.log(`⚡ Role [${roleName}] đã khởi tạo sẵn. Bỏ qua.`);
            }
            // Lưu _id lại để xài cho bước mồi User
            roleDocs[roleName] = existingRole._id;
        }

        // 2. Khởi tạo tài khoản mồi (Super Admin & Normal User)
        const adminEmail = 'admin@holagroup.com';
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            await User.create({
                email: adminEmail,
                password: 'AdminPassword123', // Mongoose tự động kích hoạt băm (hash) ở file user.js
                firstName: 'Hệ thống',
                lastName: 'Admin',
                phoneNumber: '0999999999',
                address: 'Hệ thống Server nội bộ',
                roleID: roleDocs['Admin']
            });
            console.log(`✅ Đã tạo thành công tài khoản: ${adminEmail}`);
        }

        const userEmail = 'user@holagroup.com';
        const userExists = await User.findOne({ email: userEmail });
        if (!userExists) {
            await User.create({
                email: userEmail,
                password: 'UserPassword123',
                firstName: 'Nhân',
                lastName: 'Viên Basic',
                phoneNumber: '0888888888',
                address: 'Chi nhánh Sài Gòn',
                roleID: roleDocs['User']
            });
            console.log(`✅ Đã tạo thành công tài khoản: ${userEmail}`);
        }

        console.log("🎉 Hoàn tất quá trình Seed Hệ Thống! Database nội bộ đã sẵn sàng Login.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi cắm dữ liệu (Seed):", error);
        process.exit(1);
    }
};

seedData();
