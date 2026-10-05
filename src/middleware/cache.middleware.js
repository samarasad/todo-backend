import redisClient from "../config/redis.js";
import { logError } from "../utils/logger.js";

export const cache = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (!redisClient.isOpen) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (error) {
      logError("Redis GET failed, falling back to database", error);
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.setHeader("X-Cache", "MISS");
      if (res.statusCode === 200) {
        redisClient
          .setEx(key, ttlSeconds, JSON.stringify(body))
          .catch((error) => logError("Redis SET failed", error));
      }
      return originalJson(body);
    };

    next();
  };
};

// Called after every create, update, status change or delete so reads never go stale
export const clearCache = async () => {
  if (!redisClient.isOpen) return;

  try {
    const keys = await redisClient.keys("cache:*");
    if (keys.length) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logError("Redis cache clear failed", error);
  }
};
