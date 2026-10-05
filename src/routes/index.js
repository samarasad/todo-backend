import express from "express";
import tasksRoutes from "./tasks.routes.js";

const router = express.Router();

router.use("/tasks", tasksRoutes);

export default router;
