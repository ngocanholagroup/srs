const ORDER_STATUSES = [
  'draft',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'failed',
  'cancelled',
];

const allowedTransitions = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'failed', 'cancelled'],
  shipped: ['delivered', 'failed'],
  delivered: [],
  failed: ['processing'],
  cancelled: [],
};

const canTransition = (currentStatus, nextStatus) =>
  Boolean(allowedTransitions[currentStatus]?.includes(nextStatus));

/** Trạng thái SRS 3.5 — nhóm thống kê dashboard */
const summaryGroups = {
  draft: ['draft'],
  confirmed: ['confirmed'],
  shipping: ['processing', 'shipped'],
  delivered: ['delivered'],
  cancelled: ['cancelled', 'failed'],
};

module.exports = {
  ORDER_STATUSES,
  allowedTransitions,
  canTransition,
  summaryGroups,
};
