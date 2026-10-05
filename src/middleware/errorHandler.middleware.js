import { logError } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logError("Error occurred", {
    message: err.message,
    statusCode: err.statusCode,
    method: req.method,
    path: req.originalUrl,
    stack: err.stack,
  });

  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : err.message || "Internal server error";
  let errors;

  // Mongoose CastError (for example a malformed ObjectId)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
  }

  // Mongoose schema validation error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 422;
    message = "Validation error";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON body";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
