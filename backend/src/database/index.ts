import { JobModel } from "./models/job.model";
import mongoose from "mongoose";
import { log } from "../config/logger";

// DB Connection Code
export const connectDb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in enviornment varibles");
    }

    await mongoose.connect(process.env.MONGO_URI);

    log.info("🚀 MongoDB connected successfully");
  } catch (error) {
    log.error("❌ MongoDB connection failed:" + error);
    process.exit(1);
  }
};
