import mongoose from "mongoose";

export const PRIORITIES = ["low", "medium", "high"];
export const STATUSES = ["in_progress", "completed"];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 150 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    dateTime: { type: Date, required: [true, "Date and time is required"], index: true },
    priority: { type: String, enum: PRIORITIES, default: null },
    status: { type: String, enum: STATUSES, default: "in_progress", index: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

taskSchema.index({ dateTime: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

export default mongoose.model("Task", taskSchema);
