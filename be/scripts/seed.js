const mongoose = require('mongoose');
const Role = require('../schemas/role');
const User = require('../schemas/user');
const Category = require('../schemas/category');
const Product = require('../schemas/product');
const PriceList = require('../schemas/priceList');
const PriceListItem = require('../schemas/priceListItem');

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

        // 3. Seed categories/products/price-lists (MVP để FE test nhanh)
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
            const catA = await Category.create({ name: 'Category A' });
            const catB = await Category.create({ name: 'Category B' });

            const productCount = await Product.countDocuments();
            if (productCount === 0) {
                const p1 = await Product.create({
                    name: 'Product 1',
                    categoryID: catA._id,
                    basePrice: 100000,
                    stockQuantity: 50,
                    images: [],
                });
                const p2 = await Product.create({
                    name: 'Product 2',
                    categoryID: catA._id,
                    basePrice: 250000,
                    stockQuantity: 20,
                    images: [],
                });
                const p3 = await Product.create({
                    name: 'Product 3',
                    categoryID: catB._id,
                    basePrice: 50000,
                    stockQuantity: 200,
                    images: [],
                });

                const priceListCount = await PriceList.countDocuments();
                if (priceListCount === 0) {
                    const pl = await PriceList.create({
                        name: 'Default',
                        description: 'Default price list (seed)',
                        status: 'active',
                    });

                    await PriceListItem.create({
                        priceListID: pl._id,
                        productID: p1._id,
                        unitPrice: p1.basePrice,
                        discount: 0,
                        status: 'active',
                    });
                    await PriceListItem.create({
                        priceListID: pl._id,
                        productID: p2._id,
                        unitPrice: p2.basePrice,
                        discount: 0,
                        status: 'active',
                    });
                    await PriceListItem.create({
                        priceListID: pl._id,
                        productID: p3._id,
                        unitPrice: p3.basePrice,
                        discount: 0,
                        status: 'active',
                    });
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi cắm dữ liệu (Seed):", error);
        process.exit(1);
    }
};

seedData();
