import mongoose, { Schema, Document } from "mongoose";

//  interface
export interface IJob extends Document {
  title: string;
  companyName: string;
  location?: string;
  jobId?: string;
  jobUrl: string;
  shortDescription?: string;
  fullDescription?: string;
  source: "linkedin" | "wellfound";
  postedAt?: Date;
  fetchedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    jobId: {
      type: String,
    },
    jobUrl: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    fullDescription: {
      type: String,
    },
    source: {
      type: String,
      enum: ["linkedin", "wellfound"],
      required: true,
    },
    postedAt: {
      type: Date,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index(
  {
    jobId: 1,
    source: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

// Fallback dedup index
jobSchema.index({ title: 1, companyName: 1, location: 1 }, { unique: false });

export const JobModel = mongoose.model<IJob>("Job", jobSchema);
