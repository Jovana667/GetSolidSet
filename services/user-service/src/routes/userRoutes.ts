import { Router } from "express";
import {
  createNutritionGoal,
  getNutritionGoalByUserId,
  addClient,
  getClients,
  removeClient,
  linkClient,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/userControllers";
import { verifyToken } from "../middleware/auth";

const router = Router();

// User profile routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.delete("/profile", verifyToken, deleteProfile);

// Nutrition goals
router.put("/nutrition-goals", verifyToken, createNutritionGoal);
router.get("/nutrition-goals", verifyToken, getNutritionGoalByUserId);

// Trainer client management
router.post("/clients", verifyToken, addClient);
router.get("/clients", verifyToken, getClients);
router.delete("/clients/:trainerClientId", verifyToken, removeClient);
router.put("/clients/:trainerClientId/link", verifyToken, linkClient);

export default router;
