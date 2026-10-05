import { DateTime, Info } from "luxon";
import Task from "../models/Task.model.js";
import { ApiError } from "../utils/ApiError.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveZone = (tz = "UTC") => {
  if (!Info.isValidIANAZone(tz)) {
    throw new ApiError(422, "Invalid timezone, use an IANA name like Asia/Kolkata");
  }
  return tz;
};

const buildPagination = (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPaginationMeta = (page, limit, total) => ({
  currentPage: page,
  totalPages: Math.ceil(total / limit) || 1,
  totalRecords: total,
  limit,
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

// Build a MongoDB filter from query params. Every filter is optional.
const buildFilter = (query = {}) => {
  const { status, priority, from, to, q } = query;
  const filter = {};

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  if (from || to) {
    filter.dateTime = {};
    if (from) filter.dateTime.$gte = new Date(from);
    if (to) filter.dateTime.$lte = new Date(to);
  }

  if (q) {
    const pattern = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  return filter;
};

const findTaskOrThrow = async (id) => {
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, "Task not found");
  return task;
};

const applyStatus = (task, status) => {
  task.status = status;
  task.completedAt = status === "completed" ? new Date() : null;
};

// Create

export const createTaskService = async (payload) => {
  const { priority, status, ...rest } = payload;

  const task = new Task({
    ...rest,
    priority: priority || null,
  });
  applyStatus(task, status || "in_progress");

  await task.save();
  return task.toObject();
};

// Read

export const listTasksService = async (query = {}) => {
  const filter = buildFilter(query);
  const { page, limit, skip } = buildPagination(query);

  const [records, total] = await Promise.all([
    Task.find(filter).sort({ dateTime: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(page, limit, total) };
};

export const getTaskByIdService = async (id) => {
  const task = await Task.findById(id).lean();
  if (!task) throw new ApiError(404, "Task not found");
  return task;
};

// Search by keyword across title and description

export const searchTasksService = async (query = {}) => {
  const filter = buildFilter(query);
  const { page, limit, skip } = buildPagination(query);

  const [records, total] = await Promise.all([
    Task.find(filter).sort({ dateTime: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  return { query: query.q, records, pagination: buildPaginationMeta(page, limit, total) };
};

// Update

export const updateTaskService = async (id, payload) => {
  const task = await findTaskOrThrow(id);
  const { status, priority, ...rest } = payload;

  Object.assign(task, rest);
  if (priority !== undefined) task.priority = priority || null;
  if (status !== undefined && status !== task.status) applyStatus(task, status);

  await task.save();
  return task.toObject();
};

export const updateTaskStatusService = async (id, status) => {
  const task = await findTaskOrThrow(id);
  if (task.status !== status) applyStatus(task, status);

  await task.save();
  return task.toObject();
};

// Delete

export const deleteTaskService = async (id) => {
  const task = await Task.findByIdAndDelete(id).lean();
  if (!task) throw new ApiError(404, "Task not found");
  return task;
};

// Weekly summary for the home screen. Weeks run Monday to Sunday in the given timezone.

export const getWeeklySummaryService = async ({ tz, limit = 52 } = {}) => {
  const zone = resolveZone(tz);

  const rows = await Task.aggregate([
    {
      $group: {
        _id: { $dateTrunc: { date: "$dateTime", unit: "week", startOfWeek: "monday", timezone: zone } },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: limit },
  ]);

  return rows.map((row) => {
    const start = DateTime.fromJSDate(row._id, { zone }).startOf("week");
    return {
      weekStart: start.toISODate(),
      weekEnd: start.plus({ days: 6 }).toISODate(),
      totalTasks: row.total,
      openTasks: row.total - row.completed,
      completedTasks: row.completed,
    };
  });
};

// All tasks for the week that contains the given date

export const getWeekTasksService = async (date, { tz, status } = {}) => {
  const zone = resolveZone(tz);

  const start = DateTime.fromISO(date, { zone }).startOf("week");
  if (!start.isValid) throw new ApiError(422, "Invalid date");
  const end = start.plus({ weeks: 1 });

  const range = { $gte: start.toJSDate(), $lt: end.toJSDate() };

  const tasks = await Task.find({ dateTime: range }).sort({ dateTime: 1 }).lean();
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  return {
    weekStart: start.toISODate(),
    weekEnd: start.plus({ days: 6 }).toISODate(),
    totalTasks: tasks.length,
    openTasks: tasks.length - completedTasks,
    completedTasks,
    tasks: status ? tasks.filter((t) => t.status === status) : tasks,
  };
};
