import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import { logInfo, logError } from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      logInfo(`Server running on port ${PORT}`);
    });

    process.on("unhandledRejection", (err) => {
      logError("Unhandled rejection", err);
      server.close(() => process.exit(1));
    });

    process.on("SIGTERM", async () => {
      logInfo("SIGTERM received, shutting down gracefully");
      server.close(async () => {
        await disconnectRedis();
        process.exit(0);
      });
    });
  } catch (error) {
    logError("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
