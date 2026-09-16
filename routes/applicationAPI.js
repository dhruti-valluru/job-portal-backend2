import exp from "express";
import { JobModel } from "../models/jobSchema.js";
import { ApplicationModel } from "../models/applSchema.js";
import { authenticate, authorizeRoles } from "../middleware/authorizationMiddleware.js";
export const applicationRoutes = exp.Router();

// Job Seeker applies for a job
applicationRoutes.post("/applications", authenticate, authorizeRoles("jobseeker"), async (request, response) => {
  let { jobId, resume, coverLetter } = request.body;
  if (!jobId) {
    return response.status(400).json({ success: false, message: "jobId is required" });
  }
  let targetJob = await JobModel.findOne({ _id: jobId, status: "open" });
  if (!targetJob) {
    return response.status(404).json({ success: false, message: "Open job not found" });
  }
  if (new Date(targetJob.applicationDeadline) < new Date()) {
    return response.status(400).json({ success: false, message: "Application deadline has passed" });
  }
  let duplicateApplication = await ApplicationModel.findOne({
    job: jobId,
    jobSeeker: request.user._id
  });
  if (duplicateApplication) {
    return response.status(409).json({ success: false, message: "You already applied for this job" });
  }
  let newApplication = await ApplicationModel.create({
    job: jobId,
    jobSeeker: request.user._id,
    resume,
    coverLetter
  });
  response.status(201).json({
    success: true,
    message: "Application submitted",
    data: newApplication
  });
});

// Job Seeker views own applications
applicationRoutes.get("/my-applications", authenticate, authorizeRoles("jobseeker"), async (request, response) => {
  let myApplications = await ApplicationModel.find({ jobSeeker: request.user._id })
    .populate("job", "title companyName location employmentType status applicationDeadline")
    .populate("jobSeeker", "name email");

  response.status(200).json({
    success: true,
    message: "Your applications",
    data: myApplications
  });
});

// Job Seeker views status of one own application
applicationRoutes.get("/my-applications/:applicationId", authenticate, authorizeRoles("jobseeker"), async (request, response) => {
  let myApplication = await ApplicationModel.findOne({
    _id: request.params.applicationId,
    jobSeeker: request.user._id
  }).populate("job", "title companyName status");

  if (!myApplication) {
    return response.status(404).json({ success: false, message: "Application not found" });
  }
  response.status(200).json({
    success: true,
    message: "Application status",
    data: myApplication
  });
});

// Employer views applications for own jobs
applicationRoutes.get("/employer-applications", authenticate, authorizeRoles("employer"), async (request, response) => {
  let employerJobs = await JobModel.find({ employer: request.user._id }).select("_id");
  let employerJobIds = employerJobs.map(job => job._id);

  let receivedApplications = await ApplicationModel.find({ job: { $in: employerJobIds } })
    .populate("job", "title companyName")
    .populate("jobSeeker", "name email skills experience education");

  response.status(200).json({
    success: true,
    message: "Applications received",
    data: receivedApplications
  });
});

// Employer updates application status for an application belonging to their job
applicationRoutes.put("/applications/:applicationId/status", authenticate, authorizeRoles("employer"), async (request, response) => {
  let { status: newStatus } = request.body;
  let allowedStatuses = ["submitted", "reviewing", "shortlisted", "rejected", "hired"];

  if (!allowedStatuses.includes(newStatus)) {
    return response.status(400).json({ success: false, message: "Invalid application status" });
  }
  let targetApplication = await ApplicationModel.findById(request.params.applicationId).populate("job", "employer");
  if (!targetApplication) {
    return response.status(404).json({ success: false, message: "Application not found" });
  }
  if (targetApplication.job.employer.toString() !== request.user._id.toString()) {
    return response.status(403).json({ success: false, message: "You can manage only applications for your jobs" });
  }
  targetApplication.status = newStatus;
  await targetApplication.save();
  response.status(200).json({
    success: true,
    message: "Application status updated",
    data: targetApplication
  });
});
