const redisClient = require('../config/redisClient');

async function rateLimiter(req, res, next) {
  try {
    const ip = req.ip;

    const key = `rate_limit:${ip}`;

    // Increment request count
    const requests = await redisClient.incr(key);

    // Set expiry first time
    if (requests === 1) {
      await redisClient.expire(key, 60);
    }

    // Limit exceeded
    if (requests > 100) {
      return res.status(429).json({
        message: 'Too many requests',
      });
    }

    next();

  } catch (err) {
    console.error(err);

    next();
  }
}

module.exports = rateLimiter;