import express from "express";
import cookieParser from "cookie-parser";
import { connect } from "mongoose";
import { config } from "dotenv";
import { userRoutes } from "./api/userAPI.js";
import { jobRoutes } from "./api/jobAPI.js";
import { applicationRoutes } from "./api/applicationAPI.js";
import { adminRoutes } from "./api/adminAPI.js";
config();

const server = express();

server.use(express.json());
server.use(cookieParser());

// Root endpoint to check server status
server.get("/", (request, response) => {
  response.json({ success: true, message: "Job Portal Backend is running" });
});

// API routes
server.use("/user-api", userRoutes);
server.use("/job-api", jobRoutes);
server.use("/application-api", applicationRoutes);
server.use("/admin-api", adminRoutes);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
async function connectToDatabase() {
  try {
    await connect(process.env.MONGO_URI);
    console.log("DB Connected");
    server.listen(PORT, () => console.log(`server listening on ${PORT}..`));
  } catch (error) {
    console.log("err in db connect:", error);
  }
}
connectToDatabase();

// Global error handling middleware
server.use((error, request, response, next) => {
  console.log("err is", error);
  response.status(error.status || 500).json({
    success: false,
    message: error.message || "Something went wrong"
  });
});
