import exp from "express";
import { UserModel } from "../models/usersSchema.js";
import { JobModel } from "../models/jobSchema.js";
import { ApplicationModel } from "../models/applSchema.js";
import { authenticate, authorizeRoles } from "../middleware/authorizationMiddleware.js";
export const adminRoutes = exp.Router();
adminRoutes.use(authenticate, authorizeRoles("admin"));

// View all users
adminRoutes.get("/users", async (request, response) => {
  const allUsers = await UserModel.find().select("-password");
  response.status(200).json({
    success: true,
    message: "All users",
    data: allUsers
  });
});

// View user by ID
adminRoutes.get("/users/:userId", async (request, response) => {
  const targetUser = await UserModel
    .findById(request.params.userId)
    .select("-password");
  if (!targetUser) {
    return response.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  response.status(200).json({
    success: true,
    message: "User details",
    data: targetUser
  });
});

// Update user status
adminRoutes.put("/users/:userId/status", async (request, response) => {
  const { status: newStatus } = request.body;
  if (!["active", "blocked"].includes(newStatus)) {
    return response.status(400).json({
      success: false,
      message: "Invalid user status"
    });
  }
  const updatedUser = await UserModel
    .findByIdAndUpdate(
      request.params.userId,
      { $set: { status: newStatus } },
      {
        new: true,
        runValidators: true
      }
    )
    .select("-password");
  if (!updatedUser) {
    return response.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  response.status(200).json({
    success: true,
    message: "User status updated",
    data: updatedUser
  });
});

// Delete user
adminRoutes.delete("/users/:userId", async (request, response) => {
  const deletedUser = await UserModel.findByIdAndDelete(
    request.params.userId
  );
  if (!deletedUser) {
    return response.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  // Delete jobs posted by the user
  await JobModel.deleteMany({
    employer: request.params.userId
  });
  // Delete applications submitted by the user
  await ApplicationModel.deleteMany({
    jobSeeker: request.params.userId
  });
  response.status(200).json({
    success: true,
    message: "User deleted"
  });
});

// View all jobs
adminRoutes.get("/jobs", async (request, response) => {
  const allJobs = await JobModel
    .find()
    .populate("employer", "name email");
  response.status(200).json({
    success: true,
    message: "All jobs",
    data: allJobs
  });
});

// View job by ID
adminRoutes.get("/jobs/:jobId", async (request, response) => {
  const targetJob = await JobModel
    .findById(request.params.jobId)
    .populate("employer", "name email");
  if (!targetJob) {
    return response.status(404).json({
      success: false,
      message: "Job not found"
    });
  }
  response.status(200).json({
    success: true,
    message: "Job details",
    data: targetJob
  });
});

// Remove inappropriate job
adminRoutes.delete("/jobs/:jobId", async (request, response) => {
  const deletedJob = await JobModel.findByIdAndDelete(
    request.params.jobId
  );
  if (!deletedJob) {
    return response.status(404).json({
      success: false,
      message: "Job not found"
    });
  }
  // Delete applications related to the deleted job
  await ApplicationModel.deleteMany({
    job: request.params.jobId
  });
  response.status(200).json({
    success: true,
    message: "Job removed by admin"
  });
});

// Platform data summary
adminRoutes.get("/summary", async (request, response) => {
  const totalUserCount = await UserModel.countDocuments();
  const totalJobCount = await JobModel.countDocuments();
  const totalApplicationCount = await ApplicationModel.countDocuments();
  response.status(200).json({
    success: true,
    message: "Platform summary",
    data: {
      totalUsers: totalUserCount,
      totalJobs: totalJobCount,
      totalApplications: totalApplicationCount
    }
  });
});
