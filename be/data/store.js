// Day 2/3 in-memory store for fast backend iteration.
// Replace with database repository in next steps.
const db = {
  products: [
    { id: 'p1', name: 'Cable Type C', stockQuantity: 100, status: 'active' },
    { id: 'p2', name: 'Keyboard K87', stockQuantity: 20, status: 'active' },
    { id: 'p3', name: 'Mouse M1', stockQuantity: 8, status: 'active' },
  ],
  orders: [
    {
      id: 'o1001',
      status: 'processing',
      deliveryDate: null,
      failureReason: null,
      inventoryApplied: false,
      items: [
        { productId: 'p1', quantity: 3 },
        { productId: 'p2', quantity: 1 },
      ],
    },
    {
      id: 'o1002',
      status: 'shipped',
      deliveryDate: null,
      failureReason: null,
      inventoryApplied: true,
      items: [{ productId: 'p3', quantity: 2 }],
    },
  ],
  movements: [],
};

module.exports = db;

