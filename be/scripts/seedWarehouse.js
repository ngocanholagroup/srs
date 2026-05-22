const mongoose = require('mongoose');
const Role = require('../schemas/role');
const User = require('../schemas/user');
const Category = require('../schemas/category');
const Product = require('../schemas/product');
const Order = require('../schemas/order');

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/srs_db';

const ensureRole = async (roleName) => {
  let role = await Role.findOne({ roleName });
  if (!role) role = await Role.create({ roleName });
  return role;
};

const ensureUser = async ({ email, password, firstName, lastName, phoneNumber, roleId }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      address: 'Warehouse seed',
      roleID: roleId,
    });
    console.log(`Created user: ${email}`);
  } else {
    console.log(`User exists: ${email}`);
  }
  return user;
};

const seed = async () => {
  await mongoose.connect(DB_URI);
  console.log('Connected for warehouse seed');

  const roles = ['Admin', 'Manager', 'Warehouse', 'Sales'];
  const roleMap = {};
  for (const name of roles) {
    roleMap[name] = await ensureRole(name);
  }

  await ensureUser({
    email: 'admin@holagroup.com',
    password: 'AdminPassword123',
    firstName: 'System',
    lastName: 'Admin',
    phoneNumber: '0999999999',
    roleId: roleMap.Admin._id,
  });

  await ensureUser({
    email: 'warehouse@holagroup.com',
    password: 'Warehouse123',
    firstName: 'Kho',
    lastName: 'NhanVien',
    phoneNumber: '0888777666',
    roleId: roleMap.Warehouse._id,
  });

  let category = await Category.findOne({ name: 'Phu kien' });
  if (!category) category = await Category.create({ name: 'Phu kien', status: 'active' });

  const productSeed = [
    { name: 'Cable Type C', stockQuantity: 100 },
    { name: 'Keyboard K87', stockQuantity: 20 },
    { name: 'Mouse M1', stockQuantity: 8 },
  ];

  const products = [];
  for (const item of productSeed) {
    let product = await Product.findOne({ name: item.name });
    if (!product) {
      product = await Product.create({
        name: item.name,
        categoryID: category._id,
        basePrice: 100000,
        stockQuantity: item.stockQuantity,
        status: 'active',
      });
      console.log(`Created product: ${item.name}`);
    }
    products.push(product);
  }

  const existingOrders = await Order.countDocuments();
  if (existingOrders === 0) {
    await Order.create([
      {
        status: 'processing',
        inventoryApplied: false,
        items: [
          { productId: products[0]._id, quantity: 3 },
          { productId: products[1]._id, quantity: 1 },
        ],
      },
      {
        status: 'shipped',
        inventoryApplied: true,
        items: [{ productId: products[2]._id, quantity: 2 }],
      },
    ]);
    console.log('Created sample orders');
  } else {
    console.log('Orders already seeded');
  }

  console.log('Warehouse seed completed');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
