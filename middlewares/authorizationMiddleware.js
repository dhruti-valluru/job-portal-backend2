import jwt from "jsonwebtoken";
import { UserModel } from "../models/usersSchema.js";

export async function authenticate(request, response, next) {
  try {
    let authToken = request.cookies.token;
    if (!authToken) {
      return response.status(401).json({ success: false, message: "Login required" });
    }
    let decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
    let currentUser = await UserModel.findById(decodedToken.userId);
    if (!currentUser) {
      return response.status(401).json({ success: false, message: "User not found" });
    }
    if (currentUser.status !== "active") {
      return response.status(403).json({ success: false, message: "User account is blocked" });
    }
    request.user = currentUser;
    next();
  } catch (error) {
    return response.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (request, response, next) => {
    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
}
