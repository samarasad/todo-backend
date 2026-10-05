import mongoose from "mongoose";
import { logError, logInfo, logWarn } from "../utils/logger.js";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  mongoose.connection.on("connected", () => {
    logInfo("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logError("MongoDB connection error", err);
  });

  mongoose.connection.on("disconnected", () => {
    logWarn("MongoDB disconnected");
  });

  await mongoose.connect(uri);
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
