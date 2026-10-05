import {
  createTaskService,
  listTasksService,
  getTaskByIdService,
  searchTasksService,
  updateTaskService,
  updateTaskStatusService,
  deleteTaskService,
  getWeeklySummaryService,
  getWeekTasksService,
} from "../services/tasks.service.js";

import { clearCache } from "../middleware/cache.middleware.js";
import { sendSuccess } from "../utils/response.js";

export const createTaskController = async (req, res, next) => {
  try {
    const task = await createTaskService(req.body);
    await clearCache();
    return sendSuccess(res, task, "Task created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const listTasksController = async (req, res, next) => {
  try {
    const result = await listTasksService(req.query);
    return sendSuccess(res, result, "Tasks fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const getTaskByIdController = async (req, res, next) => {
  try {
    const task = await getTaskByIdService(req.params.id);
    return sendSuccess(res, task, "Task fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const searchTasksController = async (req, res, next) => {
  try {
    const result = await searchTasksService(req.query);
    return sendSuccess(res, result, "Search results fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const updateTaskController = async (req, res, next) => {
  try {
    const task = await updateTaskService(req.params.id, req.body);
    await clearCache();
    return sendSuccess(res, task, "Task updated successfully");
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatusController = async (req, res, next) => {
  try {
    const task = await updateTaskStatusService(req.params.id, req.body.status);
    await clearCache();
    return sendSuccess(res, task, "Task status updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteTaskController = async (req, res, next) => {
  try {
    const task = await deleteTaskService(req.params.id);
    await clearCache();
    return sendSuccess(res, task, "Task deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getWeeklySummaryController = async (req, res, next) => {
  try {
    const weeks = await getWeeklySummaryService(req.query);
    return sendSuccess(res, weeks, "Weekly summary fetched successfully");
  } catch (error) {
    next(error);
  }
};

export const getWeekTasksController = async (req, res, next) => {
  try {
    const week = await getWeekTasksService(req.params.date, req.query);
    return sendSuccess(res, week, "Week tasks fetched successfully");
  } catch (error) {
    next(error);
  }
};
