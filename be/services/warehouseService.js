const Product = require('../schemas/product');
const WarehouseMovement = require('../schemas/warehouseMovement');
const ImportReceipt = require('../schemas/importReceipt');
const HttpError = require('../utils/httpError');
const { getRedis } = require('../config/redisClient');
const { summaryGroups } = require('../utils/orderTransitions');
const {
  serializeProduct,
  serializeMovement,
  serializeImportReceipt,
} = require('../utils/serializers');

class WarehouseService {
  static async _invalidateOrderSummaryCache() {
    const redis = getRedis();
    if (!redis) return;
    try {
      await redis.del('warehouse:order-status-summary');
    } catch (_) {}
  }

  static async _getProduct(productId, session) {
    const query = Product.findById(productId);
    if (session) query.session(session);
    const product = await query;
    if (!product) throw new HttpError(404, 'NOT_FOUND', 'Product không tồn tại');
    return product;
  }

  static async _addMovement(payload, session) {
    const movement = new WarehouseMovement(payload);
    if (session) await movement.save({ session });
    else await movement.save();
    return movement;
  }

  /** 3.1 — Kiểm tra tồn kho theo từng dòng đơn hàng */
  static async checkOrderStock(order) {
    const lines = [];
    let sufficient = true;

    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        sufficient = false;
        lines.push({
          productId: item.productId.toString(),
          productName: 'Không tìm thấy SP',
          required: item.quantity,
          available: 0,
          ok: false,
        });
        continue;
      }

      const available = product.stockQuantity;
      const ok = available >= item.quantity;
      if (!ok) sufficient = false;

      lines.push({
        productId: product._id.toString(),
        productName: product.name,
        required: item.quantity,
        available,
        minStock: product.minStock,
        ok,
      });
    }

    return { sufficient, lines };
  }

  static async stockIn(payload, options = {}) {
    const { session } = options;
    const { productId, quantity, reason, userId } = payload || {};
    if (!productId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'productId và quantity (>0) là bắt buộc');
    }

    const qty = Number(quantity);
    const product = await this._getProduct(productId, session);
    product.stockQuantity += qty;
    if (session) await product.save({ session });
    else await product.save();

    const movement = await this._addMovement(
      {
        productId,
        type: 'stock_in',
        quantity: qty,
        reason: reason || 'Manual stock-in',
        createdBy: userId || null,
      },
      session
    );

    if (!session) await this._invalidateOrderSummaryCache();

    return {
      code: 'SUCCESS',
      message: 'Nhập kho thành công',
      data: { product: serializeProduct(product), movement: serializeMovement(movement) },
    };
  }

  static async stockOut(payload, options = {}) {
    const { session } = options;
    const { productId, quantity, reason, userId, orderId } = payload || {};
    if (!productId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'productId và quantity (>0) là bắt buộc');
    }

    const qty = Number(quantity);
    const product = await this._getProduct(productId, session);
    if (product.stockQuantity < qty) {
      throw new HttpError(409, 'INSUFFICIENT_STOCK', 'Không đủ tồn kho để xuất');
    }

    product.stockQuantity -= qty;
    if (session) await product.save({ session });
    else await product.save();

    const movement = await this._addMovement(
      {
        productId,
        orderId: orderId || null,
        type: 'stock_out',
        quantity: qty,
        reason: reason || 'Manual stock-out',
        createdBy: userId || null,
      },
      session
    );

    if (!session) await this._invalidateOrderSummaryCache();

    return {
      code: 'SUCCESS',
      message: 'Xuất kho thành công',
      data: { product: serializeProduct(product), movement: serializeMovement(movement) },
    };
  }

  static async stockReturn(payload, options = {}) {
    const { session } = options;
    const { productId, quantity, reason, userId, orderId } = payload || {};
    if (!productId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'productId và quantity (>0) là bắt buộc');
    }

    const qty = Number(quantity);
    const product = await this._getProduct(productId, session);
    product.stockQuantity += qty;
    if (session) await product.save({ session });
    else await product.save();

    const movement = await this._addMovement(
      {
        productId,
        orderId: orderId || null,
        type: 'stock_return',
        quantity: qty,
        reason: reason || 'Return stock',
        createdBy: userId || null,
      },
      session
    );

    if (!session) await this._invalidateOrderSummaryCache();

    return {
      code: 'SUCCESS',
      message: 'Hoàn kho thành công',
      data: { product: serializeProduct(product), movement: serializeMovement(movement) },
    };
  }

  static async getInventory(query) {
    const q = (query?.q || '').trim();
    const status = query?.status;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.name = { $regex: q, $options: 'i' };

    const items = await Product.find(filter).sort({ name: 1 });
    return {
      code: 'SUCCESS',
      message: 'Lấy tồn kho thành công',
      data: items.map(serializeProduct),
    };
  }

  static async getLowStock(query) {
    const usePerProductMin = query?.useMinStock !== 'false';
    let items;

    if (usePerProductMin) {
      items = await Product.find({
        status: 'active',
        $expr: { $lte: ['$stockQuantity', '$minStock'] },
      }).sort({ stockQuantity: 1 });
    } else {
      const threshold = Number(query?.threshold || 10);
      if (!Number.isFinite(threshold) || threshold < 0) {
        throw new HttpError(400, 'BAD_REQUEST', 'threshold không hợp lệ');
      }
      items = await Product.find({
        stockQuantity: { $lte: threshold },
        status: 'active',
      }).sort({ stockQuantity: 1 });
    }

    return {
      code: 'SUCCESS',
      message: 'Lấy danh sách low-stock thành công',
      data: { items: items.map(serializeProduct) },
    };
  }

  /** 3.5 — Thống kê theo trạng thái chi tiết + nhóm SRS */
  static async getOrderStatusSummary() {
    const redis = getRedis();
    if (redis) {
      try {
        const cached = await redis.get('warehouse:order-status-summary');
        if (cached) {
          return {
            code: 'SUCCESS',
            message: 'Lấy thống kê trạng thái đơn (cache) thành công',
            data: JSON.parse(cached),
          };
        }
      } catch (_) {}
    }

    const Order = require('../schemas/order');
    const rows = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byStatus = rows.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const srsSummary = {
      draft: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const [group, statuses] of Object.entries(summaryGroups)) {
      srsSummary[group] = statuses.reduce((sum, st) => sum + (byStatus[st] || 0), 0);
    }

    const payload = { byStatus, srsSummary };

    if (redis) {
      try {
        await redis.setEx('warehouse:order-status-summary', 60, JSON.stringify(payload));
      } catch (_) {}
    }

    return {
      code: 'SUCCESS',
      message: 'Lấy thống kê trạng thái đơn thành công',
      data: payload,
    };
  }

  static async getMovements(query) {
    const filter = {};
    if (query?.productId) filter.productId = query.productId;
    if (query?.orderId) filter.orderId = query.orderId;
    if (query?.type) filter.type = query.type;

    const items = await WarehouseMovement.find(filter).sort({ createdAt: -1 }).limit(200);
    return {
      code: 'SUCCESS',
      message: 'Lấy lịch sử movement thành công',
      data: items.map(serializeMovement),
    };
  }

  /** 3.3 — Phiếu nhập kho */
  static async createImportReceipt(payload, userId) {
    const { supplier, items, notes } = payload || {};
    if (!supplier?.trim()) {
      throw new HttpError(400, 'BAD_REQUEST', 'supplier là bắt buộc');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'items không được rỗng');
    }

    const receiptCode = `NK-${Date.now()}`;
    let totalValue = 0;
    const normalizedItems = [];
    const stockUpdates = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
        throw new HttpError(400, 'BAD_REQUEST', 'Mỗi dòng cần productId và quantity > 0');
      }
      const product = await this._getProduct(item.productId);
      const qty = Number(item.quantity);
      const unitPrice = Number(item.unitPrice ?? product.basePrice ?? 0);
      const stockBefore = product.stockQuantity;
      totalValue += qty * unitPrice;

      const stockResult = await this.stockIn({
        productId: item.productId,
        quantity: qty,
        reason: notes || `Phiếu nhập ${receiptCode} - ${supplier}`,
        userId,
      });

      const stockAfter = stockResult.data.product.stockQuantity;
      normalizedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: qty,
        unitPrice,
      });
      stockUpdates.push({
        productId: product._id.toString(),
        productName: product.name,
        quantityAdded: qty,
        stockBefore,
        stockAfter,
      });
    }

    const receipt = await ImportReceipt.create({
      receiptCode,
      supplier: supplier.trim(),
      items: normalizedItems,
      totalValue,
      notes: notes || null,
      createdBy: userId || null,
      status: 'completed',
    });

    return {
      code: 'SUCCESS',
      message: 'Tạo phiếu nhập kho thành công — đã cộng tồn kho',
      data: {
        receipt: serializeImportReceipt(receipt),
        stockUpdates,
      },
    };
  }

  static async getImportReceipts() {
    const items = await ImportReceipt.find().sort({ createdAt: -1 }).limit(100);
    return {
      code: 'SUCCESS',
      message: 'Lấy danh sách phiếu nhập thành công',
      data: items.map(serializeImportReceipt),
    };
  }
}

module.exports = WarehouseService;
