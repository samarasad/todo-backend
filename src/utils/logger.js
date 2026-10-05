import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, "../../logs");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `[${level}] ${timestamp} - ${stack || message}${metaStr}`;
  })
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

export const morganStream = {
  write: (message) => logger.http(message.trim()),
};

export const logInfo = (message, data = "") => {
  logger.info(message, data ? { data } : undefined);
};

export const logError = (message, error = "") => {
  logger.error(message, error instanceof Error ? { stack: error.stack } : { error });
};

export const logWarn = (message, data = "") => {
  logger.warn(message, data ? { data } : undefined);
};

export default logger;
