import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";

// Adds the authenticated user to the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// verifies the JWT token on incoming requests before allowing access to protected routes
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Invalid token format. Use: Bearer <token>" });
    }
    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Authentication failed" });
  }
};