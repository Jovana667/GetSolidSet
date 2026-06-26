import dotenv from "dotenv";

// Load environment variables FIRST before any other imports that use them
dotenv.config();

import helmet from "helmet"; // Security middleware
import express, { Express } from "express";
import cors from "cors";
import foodRoutes from "./routes/foodRoutes";
import pool from "./utils/db";

const app: Express = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());  
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/api/foods", foodRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "food-service" });
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
    console.log(`🚀 Food service running on port ${PORT}`);
  });
});

export default app;
