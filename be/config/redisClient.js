const { createClient } = require('redis');

let redisClient = null;
let redisReady = false;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', () => {
    redisReady = false;
  });
  redisClient.on('ready', () => {
    redisReady = true;
  });

  try {
    await redisClient.connect();
  } catch (_) {
    redisReady = false;
  }

  return redisClient;
};

const getRedis = () => (redisReady ? redisClient : null);

module.exports = {
  initRedis,
  getRedis,
};

