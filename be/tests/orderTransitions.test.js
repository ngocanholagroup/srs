const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransition, allowedTransitions, summaryGroups } = require('../utils/orderTransitions');

test('confirmed can move to processing or cancelled', () => {
  assert.equal(canTransition('confirmed', 'processing'), true);
  assert.equal(canTransition('confirmed', 'cancelled'), true);
  assert.equal(canTransition('confirmed', 'shipped'), false);
});

test('processing can move to shipped, failed, cancelled', () => {
  assert.equal(canTransition('processing', 'shipped'), true);
  assert.equal(canTransition('processing', 'failed'), true);
  assert.equal(canTransition('processing', 'cancelled'), true);
});

test('shipped can move to delivered or failed', () => {
  assert.equal(canTransition('shipped', 'delivered'), true);
  assert.equal(canTransition('shipped', 'failed'), true);
});

test('terminal states', () => {
  assert.deepEqual(allowedTransitions.delivered, []);
  assert.deepEqual(allowedTransitions.cancelled, []);
});

test('srs summary groups cover all statuses', () => {
  const all = Object.values(summaryGroups).flat();
  assert.ok(all.includes('confirmed'));
  assert.ok(all.includes('draft'));
  assert.ok(all.includes('cancelled'));
});
