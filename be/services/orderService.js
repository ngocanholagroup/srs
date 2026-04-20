class OrderService {
  static async updateStatus(orderId, payload) {
    return {
      code: 'NOT_IMPLEMENTED',
      message: 'Day 1 skeleton: updateStatus is not implemented yet',
      data: { orderId, payload },
    };
  }
}

module.exports = OrderService;

