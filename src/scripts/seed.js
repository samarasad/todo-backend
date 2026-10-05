import "dotenv/config";
import { DateTime } from "luxon";
import { connectDB, disconnectDB } from "../config/db.js";
import Task from "../models/Task.model.js";
import { logInfo, logError } from "../utils/logger.js";

const samples = [
  { title: "Design review", description: "Go through the new home screen", priority: "high", day: 0, hour: 10 },
  { title: "Buy groceries", description: "", priority: "low", day: 1, hour: 18 },
  { title: "Team standup notes", description: "Share notes with the team", priority: "medium", day: 2, hour: 11, done: true },
  { title: "Pay electricity bill", description: "Due this week", priority: "high", day: 3, hour: 9, done: true },
  { title: "Gym", description: "Leg day", priority: null, day: 4, hour: 7 },
  { title: "Plan weekend trip", description: "Book tickets", priority: "medium", day: 6, hour: 20 },
  { title: "Write blog post", description: "Intro to caching with Redis", priority: "medium", day: -5, hour: 15, done: true },
  { title: "Dentist appointment", description: "", priority: "high", day: -4, hour: 12 },
  { title: "Renew insurance", description: "Health policy", priority: "low", day: 9, hour: 16 },
];

const run = async () => {
  try {
    await connectDB();
    await Task.deleteMany({});

    const monday = DateTime.now().startOf("week");

    await Task.insertMany(
      samples.map((s) => ({
        title: s.title,
        description: s.description,
        priority: s.priority,
        dateTime: monday.plus({ days: s.day }).set({ hour: s.hour }).toJSDate(),
        status: s.done ? "completed" : "in_progress",
        completedAt: s.done ? new Date() : null,
      }))
    );

    logInfo(`Seeded ${samples.length} tasks`);
  } catch (error) {
    logError("Seeding failed", error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();
