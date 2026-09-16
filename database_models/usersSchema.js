import { Schema, model } from "mongoose";

const educationSubSchema = new Schema(
  {
    degree: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    year: {
      type: Number,
      min: 1900
    }
  },
  {
    _id: false
  }
);

const userSchemaDefinition = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin"],
      default: "jobseeker"
    },
    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: Number,
      min: 0,
      default: 0
    },
    education: {
      type: [educationSubSchema],
      default: []
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw"
  }
);

export const UserModel = model("user", userSchemaDefinition);
