import exp from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/usersSchema.js";
import { authenticate, authorizeRoles } from "../middleware/authorizationMiddleware.js";
export const userRoutes = exp.Router();

// Register as Job Seeker or Employer
userRoutes.post("/register", async (request, response) => {
  let { name, email, password, role, skills, experience, education } = request.body;
  if (!name || !email || !password) {
    return response.status(400).json({ success: false, message: "name, email and password are required" });
  }
  if (role === "admin") {
    return response.status(403).json({ success: false, message: "Admin registration is not allowed" });
  }
  role = role || "jobseeker";
  let existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return response.status(409).json({ success: false, message: "Email already registered" });
  }
  let passwordHash = await bcrypt.hash(password, 10);
  let createdUser = await UserModel.create({
    name,
    email,
    password: passwordHash,
    role,
    skills: skills || [],
    experience: experience || 0,
    education: education || []
  });
  let sanitizedUser = createdUser.toObject();
  delete sanitizedUser.password;
  response.status(201).json({
    success: true,
    message: "User registered",
    data: sanitizedUser
  });
});

// Login
userRoutes.post("/login", async (request, response) => {
  let { email, password } = request.body;
  let matchedUser = await UserModel.findOne({ email }).select("+password");
  if (!matchedUser) {
    return response.status(401).json({ success: false, message: "Invalid email or password" });
  }
  if (matchedUser.status !== "active") {
    return response.status(403).json({ success: false, message: "User account is blocked" });
  }
  let isPasswordValid = await bcrypt.compare(password, matchedUser.password);
  if (!isPasswordValid) {
    return response.status(401).json({ success: false, message: "Invalid email or password" });
  }
  let authToken = jwt.sign(
    { userId: matchedUser._id, role: matchedUser.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
  response.cookie("token", authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  });
  let sanitizedUser = matchedUser.toObject();
  delete sanitizedUser.password;
  response.status(200).json({
    success: true,
    message: "Login successful",
    data: sanitizedUser
  });
});

// View own profile
userRoutes.get("/profile", authenticate, async (request, response) => {
  response.status(200).json({
    success: true,
    message: "Profile details",
    data: request.user
  });
});

// Update own profile
userRoutes.put("/profile", authenticate, async (request, response) => {
  let profileUpdates = request.body;
  delete profileUpdates.password;
  delete profileUpdates.role;
  delete profileUpdates.status;
  delete profileUpdates.email;
  let updatedUser = await UserModel.findByIdAndUpdate(
    request.user._id,
    { $set: { ...profileUpdates } },
    { new: true, runValidators: true }
  );
  response.status(200).json({
    success: true,
    message: "Profile modified",
    data: updatedUser
  });
});

// Logout
userRoutes.post("/logout", authenticate, async (request, response) => {
  response.clearCookie("token");

  response.status(200).json({
    success: true,
    message: "Logout successful"
  });
});

// Protected route accessible only to authenticated Job Seekers
userRoutes.get("/jobseeker-only", authenticate, authorizeRoles("jobseeker"), (request, response) => {
  response.json({
    success: true,
    message: "Job Seeker protected route"
  });
});
