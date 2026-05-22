const Order = require('../schemas/order');
const HttpError = require('../utils/httpError');
const { canTransition } = require('../utils/orderTransitions');
const { serializeOrder } = require('../utils/serializers');
const { runWithOptionalTransaction } = require('../utils/mongoTransaction');
const WarehouseService = require('./warehouseService');

const WAREHOUSE_VISIBLE_STATUSES = [
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'failed',
];

class OrderService {
  static async _getOrder(orderId, session) {
    const query = Order.findById(orderId);
    if (session) query.session(session);
    const order = await query;
    if (!order) throw new HttpError(404, 'NOT_FOUND', 'Order không tồn tại');
    return order;
  }

  static async getOrders(query = {}) {
    const filter = {};

    if (query.status) {
      filter.status = String(query.status).toLowerCase();
    } else if (query.forWarehouse === 'true' || query.forWarehouse === '1') {
      filter.status = { $in: WAREHOUSE_VISIBLE_STATUSES };
    }

    if (query.confirmedOnly === 'true' || query.confirmedOnly === '1') {
      filter.status = 'confirmed';
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return {
      code: 'SUCCESS',
      message: 'Lấy danh sách order thành công',
      data: orders.map((o) => serializeOrder(o)),
    };
  }

  static async getById(orderId) {
    const order = await this._getOrder(orderId);
    return {
      code: 'SUCCESS',
      message: 'Lấy chi tiết order thành công',
      data: serializeOrder(order),
    };
  }

  /** 3.1 — Kiểm tra tồn kho trước chuẩn bị giao */
  static async checkStock(orderId) {
    const order = await this._getOrder(orderId);
    const stockCheck = await WarehouseService.checkOrderStock(order);
    order.stockCheckedAt = new Date();
    await order.save();

    return {
      code: 'SUCCESS',
      message: stockCheck.sufficient
        ? 'Đủ tồn kho để chuẩn bị giao'
        : 'Không đủ tồn kho cho một hoặc nhiều sản phẩm',
      data: {
        orderId: order._id.toString(),
        deliveryOrderCode: order.deliveryOrderCode,
        ...stockCheck,
      },
    };
  }

  /** 3.1 — Tiếp nhận đơn đã xác nhận từ Sales → tạo lệnh giao (processing) */
  static async acceptOrder(orderId, payload = {}) {
    const { userId = null } = payload;
    const order = await this._getOrder(orderId);

    if (order.status !== 'confirmed') {
      throw new HttpError(
        409,
        'INVALID_STATUS',
        'Chỉ tiếp nhận được đơn ở trạng thái confirmed (đã xác nhận từ Sales)'
      );
    }

    const stockCheck = await WarehouseService.checkOrderStock(order);
    if (!stockCheck.sufficient) {
      throw new HttpError(409, 'INSUFFICIENT_STOCK', 'Không đủ tồn kho', {
        stockCheck,
      });
    }

    order.status = 'processing';
    order.warehouseAcceptedAt = new Date();
    order.stockCheckedAt = new Date();
    await order.save();

    await WarehouseService._invalidateOrderSummaryCache();

    return {
      code: 'SUCCESS',
      message: 'Tiếp nhận đơn và tạo lệnh giao hàng thành công',
      data: {
        order: serializeOrder(order),
        stockCheck,
        acceptedBy: userId,
      },
    };
  }

  static async updateStatus(orderId, payload) {
    const { status, failureReason = null, userId = null } = payload || {};
    if (!status) throw new HttpError(400, 'BAD_REQUEST', 'Thiếu trường status');

    const nextStatus = String(status).toLowerCase();

    if (nextStatus === 'shipped') {
      const orderPreview = await this._getOrder(orderId);
      const stockCheck = await WarehouseService.checkOrderStock(orderPreview);
      if (!stockCheck.sufficient) {
        throw new HttpError(409, 'INSUFFICIENT_STOCK', 'Không đủ tồn kho để xuất hàng giao', {
          stockCheck,
        });
      }
    }

    const updatedOrder = await runWithOptionalTransaction(async (session) => {
      const order = await this._getOrder(orderId, session);
      const current = order.status;

      if (!canTransition(current, nextStatus)) {
        throw new HttpError(
          409,
          'INVALID_STATUS_TRANSITION',
          `Không thể chuyển từ ${current} sang ${nextStatus}`
        );
      }

      if (nextStatus === 'shipped' && !order.inventoryApplied) {
        for (const item of order.items) {
          await WarehouseService.stockOut(
            {
              productId: item.productId,
              quantity: item.quantity,
              orderId: order._id,
              reason: `Order ${order.deliveryOrderCode || order._id} shipped`,
              userId,
            },
            { session }
          );
        }
        order.inventoryApplied = true;
      }

      if (nextStatus === 'failed' && order.inventoryApplied) {
        for (const item of order.items) {
          await WarehouseService.stockReturn(
            {
              productId: item.productId,
              quantity: item.quantity,
              orderId: order._id,
              reason: `Order ${order.deliveryOrderCode || order._id} failed`,
              userId,
            },
            { session }
          );
        }
        order.inventoryApplied = false;
      }

      order.status = nextStatus;
      if (nextStatus === 'delivered') order.deliveryDate = new Date();
      if (nextStatus === 'failed') {
        order.failureReason = failureReason || 'Unknown delivery issue';
      }
      if (nextStatus === 'cancelled') {
        order.failureReason = failureReason || 'Đơn hàng đã hủy';
      }

      if (session) await order.save({ session });
      else await order.save();

      return order;
    });

    await WarehouseService._invalidateOrderSummaryCache();

    return {
      code: 'SUCCESS',
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: serializeOrder(updatedOrder),
    };
  }
}

module.exports = OrderService;
