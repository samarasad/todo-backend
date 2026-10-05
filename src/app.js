import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes/index.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import { logInfo, morganStream } from "./utils/logger.js";

const app = express();

// app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
  })
);
app.use(express.json());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream: morganStream }));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
  logInfo("Server is healthy");
});

app.use("/api", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
