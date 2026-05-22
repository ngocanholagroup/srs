const mongoose = require('mongoose');

const isReplicaSetRequiredError = (error) =>
  error?.code === 20 ||
  String(error?.message || '').includes('replica set') ||
  String(error?.message || '').includes('mongos');

/**
 * Runs work inside a Mongo transaction when supported (replica set).
 * Falls back to a single non-transactional pass on standalone MongoDB (local dev).
 */
const runWithOptionalTransaction = async (work) => {
  // Standalone MongoDB (local dev) does not support transactions unless replica set is configured.
  if (process.env.MONGO_USE_TRANSACTIONS !== 'true') {
    return work(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (isReplicaSetRequiredError(error)) {
      return work(null);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { runWithOptionalTransaction };
