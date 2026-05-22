/**
 * Migrate dữ liệu từ file SQL (schema: srs/srs.sql) sang MongoDB.
 *
 * srs.sql chỉ chứa DDL. Dữ liệu INSERT nằm tại be/data/srs-seed-data.sql
 * (cùng cấu trúc bảng holagroup_sales).
 *
 * Usage:
 *   node scripts/migrateFromSql.js
 *   node scripts/migrateFromSql.js --clear
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

require('../schemas/role');
require('../schemas/user');
require('../schemas/category');
require('../schemas/product');
require('../schemas/order');
require('../schemas/warehouseMovement');

const Role = require('../schemas/role');
const User = require('../schemas/user');
const Category = require('../schemas/category');
const Product = require('../schemas/product');
const Order = require('../schemas/order');
const ImportReceipt = require('../schemas/importReceipt');
const WarehouseMovement = require('../schemas/warehouseMovement');

const DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/srs_db';
const SQL_DATA_FILE = path.join(__dirname, '../data/srs-seed-data.sql');
const DEFAULT_PASSWORD = process.env.MIGRATE_USER_PASSWORD || 'Warehouse123';

const ORDER_STATUS_MAP = {
  draft: 'draft',
  confirmed: 'confirmed',
  processing: 'processing',
  pending: 'processing',
  shipped: 'shipped',
  shipping: 'shipped',
  delivered: 'delivered',
  completed: 'delivered',
  failed: 'failed',
  cancelled: 'cancelled',
};

const PRODUCT_MIN_STOCK = {
  1: 50,
  2: 20,
  3: 30,
  4: 25,
  5: 40,
  6: 100,
};

const parseSqlValue = (raw) => {
  const v = raw.trim();
  if (v.toUpperCase() === 'NULL') return null;
  if (v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1).replace(/''/g, "'");
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
};

const splitSqlValues = (tupleContent) => {
  const values = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < tupleContent.length; i += 1) {
    const ch = tupleContent[i];
    if (ch === "'" && tupleContent[i - 1] !== '\\') {
      inString = !inString;
      current += ch;
      continue;
    }
    if (ch === ',' && !inString) {
      values.push(parseSqlValue(current));
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) values.push(parseSqlValue(current));
  return values;
};

const parseInsertStatements = (sqlText) => {
  const tables = {};
  const insertRegex =
    /INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/gi;

  let match;
  while ((match = insertRegex.exec(sqlText)) !== null) {
    const tableName = match[1];
    const columns = match[2].split(',').map((c) => c.trim());
    const valuesBlock = match[3].trim();

    const rowRegex = /\(([^)]*(?:'[^']*'[^)]*)*)\)/g;
    let rowMatch;
    const rows = [];

    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      const vals = splitSqlValues(rowMatch[1]);
      const row = {};
      columns.forEach((col, idx) => {
        row[col] = vals[idx];
      });
      rows.push(row);
    }

    if (!tables[tableName]) tables[tableName] = [];
    tables[tableName].push(...rows);
  }

  return tables;
};

const mapProductStatus = (status) => {
  const s = String(status || 'active').toLowerCase();
  return s === 'inactive' ? 'inactive' : 'active';
};

const mapOrderStatus = (orderStatus) => {
  const key = String(orderStatus || 'processing').toLowerCase();
  return ORDER_STATUS_MAP[key] || 'processing';
};

const inventoryAppliedForStatus = (status) =>
  ['shipped', 'delivered', 'failed'].includes(status);

const run = async () => {
  const shouldClear = process.argv.includes('--clear');

  if (!fs.existsSync(SQL_DATA_FILE)) {
    throw new Error(`Không tìm thấy file dữ liệu: ${SQL_DATA_FILE}`);
  }

  const sqlText = fs.readFileSync(SQL_DATA_FILE, 'utf8');
  const data = parseInsertStatements(sqlText);

  await mongoose.connect(DB_URI);
  console.log('Connected:', DB_URI);
  console.log('Source SQL:', SQL_DATA_FILE);
  console.log('Schema reference: srs/srs.sql (DDL only)');

  if (shouldClear) {
    await Promise.all([
      ImportReceipt.deleteMany({}),
      WarehouseMovement.deleteMany({}),
      Order.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
      Role.deleteMany({}),
    ]);
    console.log('Cleared warehouse-related collections');
  }

  const idMaps = {
    role: {},
    user: {},
    category: {},
    product: {},
    customer: {},
    order: {},
  };

  // Roles
  for (const row of data.Roles || []) {
    const doc = await Role.findOneAndUpdate(
      { roleName: row.roleName },
      { roleName: row.roleName },
      { upsert: true, new: true }
    );
    idMaps.role[row.roleID] = doc._id;
    console.log(`Role: ${row.roleName}`);
  }

  // Users (password mặc định — srs.sql không có cột password)
  for (const row of data.Users || []) {
    const roleId = idMaps.role[row.roleID];
    if (!roleId) continue;

    const password =
      row.email === 'admin@holagroup.com' ? 'AdminPassword123' : DEFAULT_PASSWORD;

    let doc = await User.findOne({ email: String(row.email).toLowerCase() });
    if (!doc) {
      doc = await User.create({
        lastName: row.lastName,
        firstName: row.firstName,
        dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
        phoneNumber: row.phoneNumber,
        email: row.email,
        address: row.address,
        roleID: roleId,
        password,
      });
    } else {
      doc.roleID = roleId;
      doc.lastName = row.lastName;
      doc.firstName = row.firstName;
      await doc.save();
    }
    idMaps.user[row.userID] = doc._id;
    console.log(`User: ${row.email}`);
  }

  // Categories
  for (const row of data.Categories || []) {
    const name = row.categoryName || `Category ${row.categoryID}`;
    let doc = await Category.findOne({ name });
    if (!doc) {
      doc = await Category.create({ name, status: 'active' });
    }
    idMaps.category[row.categoryID] = doc._id;
    console.log(`Category: ${name}`);
  }

  // Products + stock from Inventory
  const inventoryByProduct = {};
  for (const row of data.Inventory || []) {
    inventoryByProduct[row.productID] = Number(row.quantity) || 0;
  }

  for (const row of data.Products || []) {
    const categoryId = idMaps.category[row.categoryID];
    if (!categoryId) continue;

    const stockQty = inventoryByProduct[row.productID] ?? 0;
    const doc = await Product.findOneAndUpdate(
      { name: row.productName },
      {
        name: row.productName,
        categoryID: categoryId,
        basePrice: Number(row.salePrice) || 0,
        stockQuantity: stockQty,
        minStock: PRODUCT_MIN_STOCK[row.productID] ?? 10,
        description: row.description || null,
        status: mapProductStatus(row.status),
        images: row.imageURL ? [row.imageURL] : [],
        legacySqlId: Number(row.productID),
        unit: row.unit || null,
      },
      { upsert: true, new: true }
    );
    idMaps.product[row.productID] = doc._id;
    console.log(`Product: ${row.productName} (stock: ${stockQty})`);
  }

  // Customers (embedded vào order, không tạo collection riêng)
  const customerLabel = {};
  for (const row of data.Customers || []) {
    customerLabel[row.customerID] = {
      name: `${row.firstName} ${row.lastName}`.trim(),
      phone: row.phoneNumber || '—',
      company: row.companyName || '',
      address: row.address || '—',
    };
  }

  // OrderItems grouped by orderID
  const itemsByOrder = {};
  for (const row of data.OrderItems || []) {
    if (!itemsByOrder[row.orderID]) itemsByOrder[row.orderID] = [];
    const productId = idMaps.product[row.productID];
    if (!productId) continue;
    itemsByOrder[row.orderID].push({
      productId,
      quantity: Number(row.quantity) || 1,
    });
  }

  // Orders
  for (const row of data.Orders || []) {
    const items = itemsByOrder[row.orderID];
    if (!items?.length) continue;

    const status = mapOrderStatus(row.orderStatus);
    const customer = customerLabel[row.customerID] || {};

    const warehouseAcceptedAt =
      status === 'processing' || inventoryAppliedForStatus(status) ? new Date() : null;

    const doc = await Order.findOneAndUpdate(
      { legacySqlId: Number(row.orderID) },
      {
        legacySqlId: Number(row.orderID),
        deliveryOrderCode: `LG-${row.orderID}`,
        status,
        deliveryDate: row.deliveryDate ? new Date(row.deliveryDate) : null,
        failureReason:
          status === 'failed'
            ? 'Giao hàng thất bại (migrate từ SQL)'
            : status === 'cancelled'
              ? 'Đơn đã hủy (migrate từ SQL)'
              : null,
        inventoryApplied: inventoryAppliedForStatus(status),
        warehouseAcceptedAt,
        stockCheckedAt: warehouseAcceptedAt,
        items,
        customerName: customer.company || customer.name || `KH #${row.customerID}`,
        customerPhone: customer.phone,
        deliveryAddress: customer.address,
        totalAmount: Number(row.totalAmount) || 0,
      },
      { upsert: true, new: true }
    );
    idMaps.order[row.orderID] = doc._id;
    console.log(`Order #${row.orderID} -> ${status}`);
  }

  // Movement log: stock_in từ inventory ban đầu (audit)
  for (const row of data.Inventory || []) {
    const productId = idMaps.product[row.productID];
    if (!productId) continue;
    const qty = Number(row.quantity) || 0;
    if (qty <= 0) continue;

    const exists = await WarehouseMovement.findOne({
      productId,
      type: 'stock_in',
      reason: 'SQL migrate - initial inventory',
    });
    if (!exists) {
      await WarehouseMovement.create({
        productId,
        type: 'stock_in',
        quantity: qty,
        reason: 'SQL migrate - initial inventory',
      });
    }
  }

  console.log('\nMigrate completed.');
  console.log('Summary:', {
    roles: Object.keys(idMaps.role).length,
    users: Object.keys(idMaps.user).length,
    categories: Object.keys(idMaps.category).length,
    products: Object.keys(idMaps.product).length,
    orders: Object.keys(idMaps.order).length,
  });
  console.log('\nLogin: warehouse@holagroup.com /', DEFAULT_PASSWORD);

  process.exit(0);
};

run().catch((err) => {
  console.error('Migrate failed:', err);
  process.exit(1);
});
