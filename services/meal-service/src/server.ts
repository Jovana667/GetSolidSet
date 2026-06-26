import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

import helmet from "helmet"; // Security middleware
import express, { Express } from "express";
import cors from "cors";
import mealRoutes from "./routes/mealRoutes";
import pool from "./utils/db";

// Add this debug line
pool.query("SELECT current_database()").then(result => {
  console.log("Connected to database:", result.rows[0].current_database);
});

const app: Express = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());  
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Meal routes
app.use("/api/meals", mealRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "meal-service" });
});

async function testDatabaseConnection() {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}

testDatabaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Meal service running on port ${PORT}`);
  });
});

export default app;
