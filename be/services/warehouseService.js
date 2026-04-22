const db = require('../data/store');
const HttpError = require('../utils/httpError');
const { getRedis } = require('../config/redisClient');

class WarehouseService {
  static _getProduct(productId) {
    const product = db.products.find((p) => p.id === productId);
    if (!product) throw new HttpError(404, 'NOT_FOUND', 'Product không tồn tại');
    return product;
  }

  static _addMovement({ productId, orderId = null, type, quantity, reason = null, userId = null }) {
    const movement = {
      id: `m${db.movements.length + 1}`,
      productId,
      orderId,
      type,
      quantity,
      reason,
      userId,
      createdAt: new Date().toISOString(),
    };
    db.movements.push(movement);
    return movement;
  }

  static async stockIn(payload) {
    const { productId, quantity, reason, userId } = payload || {};
    if (!productId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'productId và quantity (>0) là bắt buộc');
    }

    const product = this._getProduct(productId);
    product.stockQuantity += Number(quantity);

    const movement = this._addMovement({
      productId,
      type: 'stock_in',
      quantity: Number(quantity),
      reason: reason || 'Manual stock-in',
      userId: userId || null,
    });

    return {
      code: 'SUCCESS',
      message: 'Nhập kho thành công',
      data: { product, movement },
    };
  }

  static async stockOut(payload) {
    const { productId, quantity, reason, userId } = payload || {};
    if (!productId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'productId và quantity (>0) là bắt buộc');
    }

    const qty = Number(quantity);
    const product = this._getProduct(productId);
    if (product.stockQuantity < qty) {
      throw new HttpError(409, 'INSUFFICIENT_STOCK', 'Không đủ tồn kho để xuất');
    }

    product.stockQuantity -= qty;

    const movement = this._addMovement({
      productId,
      type: 'stock_out',
      quantity: qty,
      reason: reason || 'Manual stock-out',
      userId: userId || null,
    });

    return {
      code: 'SUCCESS',
      message: 'Xuất kho thành công',
      data: { product, movement },
    };
  }

  static async stockReturn(payload) {
    const { productId, quantity, reason, userId, orderId } = payload || {};
    if (!productId || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'productId và quantity (>0) là bắt buộc');
    }

    const qty = Number(quantity);
    const product = this._getProduct(productId);
    product.stockQuantity += qty;

    const movement = this._addMovement({
      productId,
      orderId: orderId || null,
      type: 'stock_return',
      quantity: qty,
      reason: reason || 'Return stock',
      userId: userId || null,
    });

    return {
      code: 'SUCCESS',
      message: 'Hoàn kho thành công',
      data: { product, movement },
    };
  }

  static async getInventory(query) {
    const q = (query?.q || '').trim().toLowerCase();
    const status = query?.status;
    let items = [...db.products];
    if (status) items = items.filter((p) => p.status === status);
    if (q) items = items.filter((p) => p.name.toLowerCase().includes(q));

    return {
      code: 'SUCCESS',
      message: 'Lấy tồn kho thành công',
      data: items,
    };
  }

  static async getLowStock(query) {
    const threshold = Number(query?.threshold || 10);
    if (!Number.isFinite(threshold) || threshold < 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'threshold không hợp lệ');
    }
    const items = db.products.filter((p) => p.stockQuantity <= threshold && p.status === 'active');
    return {
      code: 'SUCCESS',
      message: 'Lấy danh sách low-stock thành công',
      data: { threshold, items },
    };
  }

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

    const summary = db.orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    if (redis) {
      try {
        await redis.setEx('warehouse:order-status-summary', 60, JSON.stringify(summary));
      } catch (_) {}
    }

    return {
      code: 'SUCCESS',
      message: 'Lấy thống kê trạng thái đơn thành công',
      data: summary,
    };
  }
}

module.exports = WarehouseService;

