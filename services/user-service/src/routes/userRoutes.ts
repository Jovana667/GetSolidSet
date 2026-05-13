import { Router } from "express";
import {
  createNutritionGoal,
  getNutritionGoalByUserId,
  addClient,
  getClients,
} from "../controllers/userControllers";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Nutrition goals
router.put("/profile", verifyToken, createNutritionGoal);
router.get("/profile", verifyToken, getNutritionGoalByUserId);

// Trainer client management
router.post("/clients", verifyToken, addClient);
router.get("/clients", verifyToken, getClients);

export default router;
