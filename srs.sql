-- ==============================================================================
-- DATABASE SCRIPT CHO HỆ THỐNG SALES HOLA GROUP
-- Dựa trên Database Schema (ER Diagram) được cung cấp
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS holagroup_sales;
USE holagroup_sales;

-- 1. Bảng Roles
CREATE TABLE Roles (
    roleID INT NOT NULL AUTO_INCREMENT,
    roleName VARCHAR(255) NOT NULL,
    PRIMARY KEY (roleID)
);

-- 2. Bảng Groups
CREATE TABLE Groups (
    groupID INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (groupID)
);

-- 3. Bảng Users (Phụ thuộc Roles)
CREATE TABLE Users (
    userID INT NOT NULL AUTO_INCREMENT,
    lastName VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    dateOfBirth DATE NULL,
    phoneNumber VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address VARCHAR(255) NULL,
    roleID INT NOT NULL,
    PRIMARY KEY (userID),
    FOREIGN KEY (roleID) REFERENCES Roles(roleID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. Bảng Members (Phụ thuộc Users, Groups)
CREATE TABLE Members (
    memberID INT NOT NULL AUTO_INCREMENT,
    userID INT NOT NULL,
    groupID INT NOT NULL,
    PRIMARY KEY (memberID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (groupID) REFERENCES Groups(groupID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Bảng Tasks (Phụ thuộc Users)
CREATE TABLE Tasks (
    taskID INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    priority VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    createAt DATE NOT NULL,
    userID INT NOT NULL,
    PRIMARY KEY (taskID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. Bảng Leads (Phụ thuộc Users)
CREATE TABLE Leads (
    leadID INT NOT NULL AUTO_INCREMENT,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(255) NULL,
    company VARCHAR(255) NULL,
    source VARCHAR(255) NULL,
    status VARCHAR(255) NOT NULL,
    userID INT NOT NULL,
    PRIMARY KEY (leadID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 7. Bảng Activities (Phụ thuộc Users)
CREATE TABLE Activities (
    activityID INT NOT NULL AUTO_INCREMENT,
    relatedType VARCHAR(255) NOT NULL,
    activityType VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    status VARCHAR(255) NOT NULL,
    activityTime DATE NOT NULL,
    createdAt DATE NOT NULL,
    userID INT NOT NULL,
    PRIMARY KEY (activityID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 8. Bảng Customers (Phụ thuộc Tasks)
CREATE TABLE Customers (
    customerID INT NOT NULL AUTO_INCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    address VARCHAR(255) NULL,
    phoneNumber VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    companyName VARCHAR(255) NULL,
    status VARCHAR(255) NULL,
    taskID INT NULL,
    PRIMARY KEY (customerID),
    FOREIGN KEY (taskID) REFERENCES Tasks(taskID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 9. Bảng CustomerRequests (Phụ thuộc Customers, Users)
CREATE TABLE CustomerRequests (
    requestID INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NULL,
    content VARCHAR(255) NULL,
    priority VARCHAR(255) NULL,
    status VARCHAR(255) NULL,
    customerID INT NOT NULL,
    userID INT NOT NULL,
    PRIMARY KEY (requestID),
    FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 10. Bảng Contracts (Phụ thuộc Customers)
CREATE TABLE Contracts (
    contractID INT NOT NULL AUTO_INCREMENT,
    contractCode VARCHAR(255) NOT NULL,
    signedDate DATE NULL,
    priority VARCHAR(255) NULL,
    status VARCHAR(255) NOT NULL,
    customerID INT NOT NULL,
    PRIMARY KEY (contractID),
    FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11. Bảng Opportunities (Phụ thuộc Customers, Tasks, Users)
CREATE TABLE Opportunities (
    opportunityID INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    stage VARCHAR(255) NOT NULL,
    expected_close DATE NULL,
    priority INT NULL,
    value DECIMAL(19, 0) NULL,
    customerID INT NOT NULL,
    assignedTo INT NULL,
    taskID INT NULL,
    PRIMARY KEY (opportunityID),
    FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES Users(userID) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (taskID) REFERENCES Tasks(taskID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 12. Bảng Orders (Phụ thuộc Customers, Opportunities)
CREATE TABLE Orders (
    orderID INT NOT NULL AUTO_INCREMENT,
    paymentTerm VARCHAR(255) NULL,
    paymentMethod VARCHAR(255) NULL,
    orderStatus VARCHAR(255) NULL,
    orderDate DATE NULL,
    deliveryDate DATE NULL,
    customerID INT NOT NULL,
    opportunityID INT NULL,
    totalAmount DECIMAL(19, 0) NULL,
    taxAmount DECIMAL(19, 0) NULL,
    discountAmount DECIMAL(19, 0) NULL,
    paidAmount DECIMAL(19, 0) NULL,
    PRIMARY KEY (orderID),
    FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (opportunityID) REFERENCES Opportunities(opportunityID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 13. Bảng Quotations (Phụ thuộc Customers, Orders, Users, Opportunities)
CREATE TABLE Quotations (
    quotationID INT NOT NULL AUTO_INCREMENT,
    quotationDate DATE NOT NULL,
    expiration DATE NULL,
    paymentTerm VARCHAR(255) NULL,
    paymentMethod VARCHAR(255) NULL,
    quotationStatus VARCHAR(255) NOT NULL,
    customerID INT NOT NULL,
    orderID INT NULL,
    userID INT NOT NULL,
    opportunityID INT NULL,
    PRIMARY KEY (quotationID),
    FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (orderID) REFERENCES Orders(orderID) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (opportunityID) REFERENCES Opportunities(opportunityID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 14. Bảng PriceLists
CREATE TABLE PriceLists (
    priceListID INT NOT NULL AUTO_INCREMENT,
    priceListName VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    PRIMARY KEY (priceListID)
);

-- 15. Bảng PriceListItems (Phụ thuộc PriceLists)
CREATE TABLE PriceListItems (
    priceListItemID INT NOT NULL AUTO_INCREMENT,
    applyTo VARCHAR(255) NOT NULL,
    minQTY INT NOT NULL DEFAULT 1,
    priceType VARCHAR(255) NOT NULL,
    discount DECIMAL(19, 0) NULL,
    fixedPrice DECIMAL(19, 0) NULL,
    basePrice DECIMAL(19, 0) NULL,
    roundOffTo DECIMAL(19, 0) NULL,
    extraFee DECIMAL(19, 0) NULL,
    priceListID INT NOT NULL,
    PRIMARY KEY (priceListItemID),
    FOREIGN KEY (priceListID) REFERENCES PriceLists(priceListID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 16. Bảng Categories (Phụ thuộc PriceListItems)
CREATE TABLE Categories (
    categoryID INT NOT NULL AUTO_INCREMENT,
    categoryName VARCHAR(255) NULL,
    priceListItemID INT NULL,
    PRIMARY KEY (categoryID),
    FOREIGN KEY (priceListItemID) REFERENCES PriceListItems(priceListItemID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 17. Bảng Products (Phụ thuộc Categories, PriceListItems)
CREATE TABLE Products (
    productID INT NOT NULL AUTO_INCREMENT,
    productName VARCHAR(255) NOT NULL,
    salePrice DECIMAL(19, 0) NOT NULL,
    cost DECIMAL(19, 0) NULL,
    unit VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    status VARCHAR(255) NOT NULL,
    imageURL VARCHAR(255) NULL,
    categoryID INT NOT NULL,
    priceListItemID INT NULL,
    PRIMARY KEY (productID),
    FOREIGN KEY (categoryID) REFERENCES Categories(categoryID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (priceListItemID) REFERENCES PriceListItems(priceListItemID) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 18. Bảng OrderItems (Phụ thuộc Orders, Products)
CREATE TABLE OrderItems (
    orderID INT NOT NULL,
    productID INT NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(19, 0) NOT NULL,
    discount DECIMAL(19, 0) NOT NULL,
    PRIMARY KEY (orderID, productID),
    FOREIGN KEY (orderID) REFERENCES Orders(orderID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 19. Bảng QuotationItems (Phụ thuộc Quotations, Products)
CREATE TABLE QuotationItems (
    quotationID INT NOT NULL,
    productID INT NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(19, 0) NOT NULL,
    discount DECIMAL(19, 0) NOT NULL,
    PRIMARY KEY (quotationID, productID),
    FOREIGN KEY (quotationID) REFERENCES Quotations(quotationID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 20. Bảng Invoices (Phụ thuộc Orders)
CREATE TABLE Invoices (
    invoiceID INT NOT NULL AUTO_INCREMENT,
    invoiceDate DATE NOT NULL,
    dueDate DATE NULL,
    totalAmount DECIMAL(19, 0) NULL,
    paidAmount DECIMAL(19, 0) NULL,
    status VARCHAR(255) NULL,
    createAt DATE NOT NULL,
    orderID INT NOT NULL,
    PRIMARY KEY (invoiceID),
    FOREIGN KEY (orderID) REFERENCES Orders(orderID) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 21. Bảng Payments (Phụ thuộc Invoices)
CREATE TABLE Payments (
    paymentID INT NOT NULL AUTO_INCREMENT,
    amount DECIMAL(19, 0) NOT NULL,
    paymentMethod VARCHAR(255) NULL,
    paymentDate DATE NOT NULL,
    status VARCHAR(255) NULL,
    invoiceID INT NOT NULL,
    PRIMARY KEY (paymentID),
    FOREIGN KEY (invoiceID) REFERENCES Invoices(invoiceID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 22. Bảng Warehouses
CREATE TABLE Warehouses (
    warehouseID INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    addres VARCHAR(255) NULL,
    createAt DATE NOT NULL,
    PRIMARY KEY (warehouseID)
);

-- 23. Bảng Inventory (Phụ thuộc Products, Warehouses)
CREATE TABLE Inventory (
    inventoryID INT NOT NULL AUTO_INCREMENT,
    quantity INT NOT NULL,
    updateAt DATE NOT NULL,
    productID INT NOT NULL,
    warehouseID INT NOT NULL,
    PRIMARY KEY (inventoryID),
    FOREIGN KEY (productID) REFERENCES Products(productID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (warehouseID) REFERENCES Warehouses(warehouseID) ON DELETE CASCADE ON UPDATE CASCADE
);