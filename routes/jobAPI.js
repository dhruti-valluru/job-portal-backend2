import exp from "express";
import { JobModel } from "../models/jobSchema.js";
import { ApplicationModel } from "../models/applSchema.js";
import { authenticate, authorizeRoles } from "../middleware/authorizationMiddleware.js";
export const jobRoutes = exp.Router();

// View all available jobs - public
jobRoutes.get("/jobs", async (request, response) => {
  let openJobs = await JobModel.find({ status: "open" }).populate("employer", "name email");
  response.status(200).json({ success: true, message: "Available jobs", data: openJobs });
});

// View a single job - public
jobRoutes.get("/jobs/:jobId", async (request, response) => {
  let targetJob = await JobModel.findById(request.params.jobId).populate("employer", "name email");
  if (!targetJob) return response.status(404).json({ success: false, message: "Job not found" });
  response.status(200).json({ success: true, message: "Job details", data: targetJob });
});

// Employer creates job
jobRoutes.post("/jobs", authenticate, authorizeRoles("employer"), async (request, response) => {
  let jobData = request.body;
  if (!jobData.title || !jobData.companyName || !jobData.description || !jobData.location || !jobData.employmentType || jobData.salaryMin === undefined || jobData.salaryMax === undefined || jobData.experienceRequirement === undefined || !jobData.applicationDeadline) {
    return response.status(400).json({ success: false, message: "Required job fields are missing" });
  }
  let createdJob = await JobModel.create({ ...jobData, employer: request.user._id });
  response.status(201).json({ success: true, message: "Job created", data: createdJob });
});

// Employer views own jobs
jobRoutes.get("/my-jobs", authenticate, authorizeRoles("employer"), async (request, response) => {
  let myJobs = await JobModel.find({ employer: request.user._id });
  response.status(200).json({ success: true, message: "Your jobs", data: myJobs });
});

// Employer views a specific own job
jobRoutes.get("/my-jobs/:jobId", authenticate, authorizeRoles("employer"), async (request, response) => {
  let myJob = await JobModel.findOne({ _id: request.params.jobId, employer: request.user._id });
  if (!myJob) return response.status(404).json({ success: false, message: "Job not found or not owned by you" });
  response.status(200).json({ success: true, message: "Job details", data: myJob });
});

// Employer updates own job
jobRoutes.put("/jobs/:jobId", authenticate, authorizeRoles("employer"), async (request, response) => {
  let myJob = await JobModel.findOne({ _id: request.params.jobId, employer: request.user._id });
  if (!myJob) return response.status(404).json({ success: false, message: "Job not found or not owned by you" });
  let jobUpdates = request.body;
  delete jobUpdates.employer;
  let updatedJob = await JobModel.findByIdAndUpdate(
    request.params.jobId,
    { $set: { ...jobUpdates } },
    { new: true, runValidators: true }
  );
  response.status(200).json({ success: true, message: "Job modified", data: updatedJob });
});

// Employer deletes own job
jobRoutes.delete("/jobs/:jobId", authenticate, authorizeRoles("employer"), async (request, response) => {
  let myJob = await JobModel.findOne({ _id: request.params.jobId, employer: request.user._id });
  if (!myJob) return response.status(404).json({ success: false, message: "Job not found or not owned by you" });
  await ApplicationModel.deleteMany({ job: request.params.jobId });
  await JobModel.findByIdAndDelete(request.params.jobId);
  response.status(200).json({ success: true, message: "Job deleted" });
});
