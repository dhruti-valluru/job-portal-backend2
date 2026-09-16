import { Schema, model, Types } from "mongoose";

const applicationSchemaDefinition = new Schema(
  {
    job: {
      type: Types.ObjectId,
      ref: "job",
      required: true
    },
    jobSeeker: {
      type: Types.ObjectId,
      ref: "user",
      required: true
    },
    resume: {
      type: String,
      trim: true
    },
    coverLetter: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "shortlisted", "rejected", "hired"],
      default: "submitted"
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw"
  }
);

applicationSchemaDefinition.index({ job: 1, jobSeeker: 1 }, { unique: true });

export const ApplicationModel = model("application", applicationSchemaDefinition);
