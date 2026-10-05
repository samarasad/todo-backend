import Joi from "joi";

const priority = Joi.string().valid("low", "medium", "high");
const status = Joi.string().valid("in_progress", "completed");

const objectId = Joi.string()
  .hex()
  .length(24)
  .messages({ "string.length": "id must be a valid 24 character id", "string.hex": "id must be a valid id" });

const isoDay = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "date must be in YYYY-MM-DD format" });

const timezone = Joi.string().trim().max(64).default("UTC");

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().max(10).required(),
  description: Joi.string().trim().max(100).allow("").default(""),
  dateTime: Joi.date().iso().required(),
  priority: priority.allow(null, ""),
  status: status.default("in_progress"),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().max(10),
  description: Joi.string().trim().max(100).allow(""),
  dateTime: Joi.date().iso(),
  priority: priority.allow(null, ""),
  status,
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

export const updateStatusSchema = Joi.object({
  status: status.required(),
});

export const idParamSchema = Joi.object({
  id: objectId.required(),
});

export const listTasksSchema = Joi.object({
  status,
  priority,
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from")),
  ...pagination,
});

export const searchTasksSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).required(),
  status,
  priority,
  ...pagination,
});

export const weeksQuerySchema = Joi.object({
  tz: timezone,
  limit: Joi.number().integer().min(1).max(104).default(52),
});

export const weekParamSchema = Joi.object({
  date: isoDay.required(),
});

export const weekTasksQuerySchema = Joi.object({
  tz: timezone,
  status,
});
