const db = require('../data/store');
const HttpError = require('../utils/httpError');
const WarehouseService = require('./warehouseService');

const allowedTransitions = {
  processing: ['shipped', 'failed'],
  shipped: ['delivered', 'failed'],
  delivered: [],
  failed: [],
};

class OrderService {
  static _getOrder(orderId) {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new HttpError(404, 'NOT_FOUND', 'Order không tồn tại');
    return order;
  }

  static async updateStatus(orderId, payload) {
    const { status, failureReason = null, userId = null } = payload || {};
    if (!status) throw new HttpError(400, 'BAD_REQUEST', 'Thiếu trường status');

    const order = this._getOrder(orderId);
    const nextStatus = String(status).toLowerCase();
    const current = order.status;

    if (!allowedTransitions[current]?.includes(nextStatus)) {
      throw new HttpError(
        409,
        'INVALID_STATUS_TRANSITION',
        `Không thể chuyển từ ${current} sang ${nextStatus}`
      );
    }

    // Day 3 business rule:
    // - stock-out when order is shipped (first time only)
    // - stock-return when order failed after stock had been applied
    if (nextStatus === 'shipped' && !order.inventoryApplied) {
      for (const item of order.items) {
        await WarehouseService.stockOut({
          productId: item.productId,
          quantity: item.quantity,
          reason: `Order ${order.id} shipped`,
          userId,
        });
      }
      order.inventoryApplied = true;
    }

    if (nextStatus === 'failed' && order.inventoryApplied) {
      for (const item of order.items) {
        await WarehouseService.stockReturn({
          productId: item.productId,
          quantity: item.quantity,
          orderId: order.id,
          reason: `Order ${order.id} failed`,
          userId,
        });
      }
      order.inventoryApplied = false;
    }

    order.status = nextStatus;
    if (nextStatus === 'delivered') {
      order.deliveryDate = new Date().toISOString();
    }
    if (nextStatus === 'failed') {
      order.failureReason = failureReason || 'Unknown delivery issue';
    }

    return {
      code: 'SUCCESS',
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order,
    };
  }
}

module.exports = OrderService;

