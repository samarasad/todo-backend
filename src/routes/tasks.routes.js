import express from "express";
import {
  createTaskController,
  listTasksController,
  getTaskByIdController,
  searchTasksController,
  updateTaskController,
  updateTaskStatusController,
  deleteTaskController,
  getWeeklySummaryController,
  getWeekTasksController,
} from "../controllers/tasks.controller.js";

import { validate } from "../middleware/validate.middleware.js";
import { cache } from "../middleware/cache.middleware.js";
import { heavyQueryLimiter } from "../middleware/rateLimiter.middleware.js";

import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  idParamSchema,
  listTasksSchema,
  searchTasksSchema,
  weeksQuerySchema,
  weekParamSchema,
  weekTasksQuerySchema,
} from "../validation/tasks.validation.js";

const router = express.Router();

router.post("/", validate(createTaskSchema, "body"), createTaskController);

router.get("/", validate(listTasksSchema), cache(60), listTasksController);

// Static paths must stay above "/:id"
router.get("/search", validate(searchTasksSchema), cache(60), searchTasksController);

router.get(
  "/weeks",
  heavyQueryLimiter,
  validate(weeksQuerySchema),
  cache(60),
  getWeeklySummaryController
);

router.get(
  "/weeks/:date",
  validate(weekParamSchema, "params"),
  validate(weekTasksQuerySchema),
  cache(60),
  getWeekTasksController
);

router.get("/:id", validate(idParamSchema, "params"), cache(60), getTaskByIdController);

router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateTaskSchema, "body"),
  updateTaskController
);

router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateTaskSchema, "body"),
  updateTaskController
);

router.patch(
  "/:id/status",
  validate(idParamSchema, "params"),
  validate(updateStatusSchema, "body"),
  updateTaskStatusController
);

router.delete("/:id", validate(idParamSchema, "params"), deleteTaskController);

export default router;
