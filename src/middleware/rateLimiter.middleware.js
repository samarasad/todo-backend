import rateLimit from "express-rate-limit";
import { logWarn } from "../utils/logger.js";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
  handler: (req, res, next, options) => {
    logWarn("Rate limit exceeded", { ip: req.ip, path: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
});

// Stricter limiter for heavier aggregation endpoints like the weekly summary
export const heavyQueryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests to this endpoint. Please slow down.",
  },
  handler: (req, res, next, options) => {
    logWarn("Heavy query rate limit exceeded", { ip: req.ip, path: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
});
