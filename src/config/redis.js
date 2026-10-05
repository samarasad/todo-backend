import { createClient } from "redis";
import { logInfo, logError, logWarn } from "../utils/logger.js";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logError("Redis: too many reconnect attempts, giving up");
        return new Error("Redis reconnect attempts exhausted");
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (err) => logError("Redis client error", err));
redisClient.on("ready", () => logInfo("Redis connected and ready"));
redisClient.on("reconnecting", () => logWarn("Redis reconnecting..."));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    // The API stays usable even if Redis is down. Caching becomes a no-op
    // and every request falls through to MongoDB.
    logError("Redis connection failed, continuing without cache", error);
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

export default redisClient;
