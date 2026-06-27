import dotenv from "dotenv"; // Loads .env file

// Load environment variables FIRST before any other imports that use them
dotenv.config();

import helmet from "helmet"; // Security middleware
import express, { Express } from "express"; // Gets the web framework
import cors from "cors"; // Allows frontend to talk to backend
import authRoutes from "./routes/authRoutes"; // Gets your login/register routes
import pool from "./utils/db";

const app: Express = express(); // Creates your web server
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001; // Uses PORT from .env, or 3001 as fallback

// Middleware - these run on EVERY request
app.use(helmet()); // Adds security headers to responses
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json()); // Lets you read JSON from request body

// Routes - defines what URLs your service responds to
app.use("/api/auth", authRoutes); // All /api/auth/* requests go to authRoutes

// Health check - a simple endpoint to test if server is alive
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

// Create a function to test DB
async function testDatabaseConnection() {
  try {
    await pool.query("SELECT NOW()"); // Simple test query
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1); // Exit if DB is broken
  }
}

// Test DB BEFORE starting server
testDatabaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Auth service running on port ${PORT}`);
  });
});
