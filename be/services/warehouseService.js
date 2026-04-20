class WarehouseService {
  static async stockIn(payload) {
    return {
      code: 'NOT_IMPLEMENTED',
      message: 'Day 1 skeleton: stockIn is not implemented yet',
      data: { payload },
    };
  }

  static async stockOut(payload) {
    return {
      code: 'NOT_IMPLEMENTED',
      message: 'Day 1 skeleton: stockOut is not implemented yet',
      data: { payload },
    };
  }

  static async getInventory(query) {
    return {
      code: 'NOT_IMPLEMENTED',
      message: 'Day 1 skeleton: getInventory is not implemented yet',
      data: { query },
    };
  }

  static async getLowStock(query) {
    return {
      code: 'NOT_IMPLEMENTED',
      message: 'Day 1 skeleton: getLowStock is not implemented yet',
      data: { query },
    };
  }

  static async getOrderStatusSummary(query) {
    return {
      code: 'NOT_IMPLEMENTED',
      message: 'Day 1 skeleton: getOrderStatusSummary is not implemented yet',
      data: { query },
    };
  }
}

module.exports = WarehouseService;

