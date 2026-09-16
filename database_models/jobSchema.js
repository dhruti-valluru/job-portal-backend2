import { Schema, model, Types } from "mongoose";

const jobSchemaDefinition = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      required: true
    },
    salaryMin: {
      type: Number,
      required: true,
      min: 0
    },
    salaryMax: {
      type: Number,
      required: true,
      min: 0
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    experienceRequirement: {
      type: Number,
      required: true,
      min: 0
    },
    postedDate: {
      type: Date,
      default: Date.now
    },
    applicationDeadline: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },
    employer: {
      type: Types.ObjectId,
      ref: "user",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw"
  }
);

jobSchemaDefinition.pre("validate", function (next) {
  if (this.salaryMax < this.salaryMin) {
    return next(new Error("salaryMax must be greater than or equal to salaryMin"));
  }
  next();
});

export const JobModel = model("job", jobSchemaDefinition);
