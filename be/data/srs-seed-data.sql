-- Dữ liệu mẫu theo schema trong srs/srs.sql (holagroup_sales)
-- File srs.sql chỉ có CREATE TABLE; dữ liệu migrate nằm ở đây.

USE holagroup_sales;

INSERT INTO Roles (roleID, roleName) VALUES
(1, 'Admin'),
(2, 'Sales'),
(3, 'Manager'),
(4, 'Warehouse');

INSERT INTO Users (userID, lastName, firstName, dateOfBirth, phoneNumber, email, address, roleID) VALUES
(1, 'Phạm', 'Admin', '1990-01-15', '0999999999', 'admin@holagroup.com', 'TP.HCM', 1),
(2, 'Trần', 'Sale', '1992-05-20', '0911111111', 'sale@holagroup.com', 'TP.HCM', 2),
(3, 'Lê', 'Kho', '1993-08-10', '0888777666', 'warehouse@holagroup.com', 'Kho Bình Tân', 4);

INSERT INTO Categories (categoryID, categoryName, priceListItemID) VALUES
(1, 'Chăm sóc gia đình', NULL),
(2, 'Chăm sóc cá nhân', NULL),
(3, 'Tiện ích gia đình', NULL);

INSERT INTO Products (productID, productName, salePrice, cost, unit, description, status, imageURL, categoryID, priceListItemID) VALUES
(1, 'Bột giặt cao cấp Hola', 200000, 150000, 'Thùng', 'Bột giặt dòng premium', 'Active', NULL, 1, NULL),
(2, 'Nước rửa chén Hola', 500000, 380000, 'Thùng', 'Nước rửa chén đậm đặc', 'Active', NULL, 1, NULL),
(3, 'Dầu gội đầu Hola', 160000, 120000, 'Thùng', 'Dầu gội dưỡng tóc', 'Active', NULL, 2, NULL),
(4, 'Kem đánh răng Hola', 350000, 280000, 'Thùng', 'Kem đánh răng bảo vệ', 'Active', NULL, 2, NULL),
(5, 'Nước lau sàn Hola', 190000, 140000, 'Thùng', 'Nước lau sàn khử khuẩn', 'Active', NULL, 1, NULL),
(6, 'Giấy vệ sinh Hola', 120000, 90000, 'Bịch', 'Giấy 2 lớp', 'Active', NULL, 3, NULL);

INSERT INTO Warehouses (warehouseID, name, addres, createAt) VALUES
(1, 'Kho trung tâm HCM', '123 Nguyễn Văn Qúy, Bình Tân', '2026-01-01');

INSERT INTO Inventory (inventoryID, quantity, updateAt, productID, warehouseID) VALUES
(1, 450, '2026-05-01', 1, 1),
(2, 8, '2026-05-01', 2, 1),
(3, 320, '2026-05-01', 3, 1),
(4, 15, '2026-05-01', 4, 1),
(5, 180, '2026-05-01', 5, 1),
(6, 600, '2026-05-01', 6, 1);

INSERT INTO Customers (customerID, firstName, lastName, address, phoneNumber, email, companyName, status, taskID) VALUES
(1, 'Minh', 'Nguyễn', '123 Nguyễn Huệ, Q1', '0901234567', 'minh@abc.com', 'Công ty TNHH ABC', 'Active', NULL),
(2, 'Lan', 'Trần', '456 Lê Lợi, Q3', '0912345678', 'lan@xyz.com', 'Cửa hàng XYZ', 'Active', NULL),
(3, 'Hùng', 'Võ', '789 Trần Hưng Đạo, Q5', '0923456789', 'hung@mega.com', 'Siêu thị Mega', 'Active', NULL);

INSERT INTO Orders (orderID, paymentTerm, paymentMethod, orderStatus, orderDate, deliveryDate, customerID, opportunityID, totalAmount, taxAmount, discountAmount, paidAmount) VALUES
(1001, 'Net 30', 'Bank Transfer', 'Confirmed', '2026-04-28', NULL, 1, NULL, 45000000, 0, 0, 0),
(1002, 'Net 15', 'Cash', 'Shipped', '2026-04-27', NULL, 2, NULL, 32000000, 0, 0, 16000000),
(1003, 'Net 30', 'Bank Transfer', 'Delivered', '2026-04-25', '2026-04-27', 3, NULL, 78500000, 0, 0, 78500000),
(1004, 'Net 30', 'Bank Transfer', 'Failed', '2026-04-26', NULL, 1, NULL, 15200000, 0, 0, 0),
(1005, 'Net 30', 'Bank Transfer', 'Draft', '2026-05-10', NULL, 2, NULL, 10000000, 0, 0, 0),
(1006, 'Net 30', 'Bank Transfer', 'Cancelled', '2026-05-09', NULL, 3, NULL, 5000000, 0, 0, 0);

INSERT INTO OrderItems (orderID, productID, quantity, unitPrice, discount) VALUES
(1001, 1, 10, 200000, 0),
(1001, 2, 5, 500000, 0),
(1002, 3, 20, 160000, 0),
(1003, 1, 20, 200000, 0),
(1003, 4, 11, 350000, 0),
(1004, 5, 8, 190000, 0),
(1005, 6, 5, 120000, 0),
(1006, 3, 3, 160000, 0);
