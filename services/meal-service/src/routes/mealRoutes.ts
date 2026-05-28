import { Router } from "express";
import {
  createMeal,
  getMeals,
  getMealById,
  getMealPlanById,
  getClientMeals,
  updateMealPlan,
  deleteMealPlan,
  addFoodToMeal,
  updateFoodServing,
  removeFoodFromMeal,
  getAssignedMeals
} from "../controllers/mealController";

import {
  generateShareLink,
  revokeShareLink,
  getSharedMealPlan,
} from "../controllers/shareController";

import { verifyToken } from "../middleware/auth";

const router = Router();

// Get all meals for authenticated user (with pagination)
router.get("/", verifyToken, getMeals);

// Get a specific meal by ID
router.get("/:id", verifyToken, getMealById);

// Specific routes first
router.get("/plans/assigned", verifyToken, getAssignedMeals);
router.get("/plans/client/:trainerClientId", verifyToken, getClientMeals);

// Dynamic route after
router.get("/plans/:id", verifyToken, getMealPlanById);

// Create a new meal plan
router.post("/", verifyToken, createMeal);

// Update meal plan name
router.put("/plans/:id", verifyToken, updateMealPlan);

// Delete a meal plan
router.delete("/plans/:id", verifyToken, deleteMealPlan);

// Add a food item to a specific meal slot
router.post("/:mealId/foods", verifyToken, addFoodToMeal);

// Update serving size of a food item in a meal
router.put("/:mealId/foods/:mealFoodId", verifyToken, updateFoodServing);

// Remove a food item from a meal slot
router.delete("/:mealId/foods/:mealFoodId", verifyToken, removeFoodFromMeal);

// share link routes
// Public — no verifyToken middleware
router.get("/share/:token", getSharedMealPlan);
 
// Protected — trainer/owner only
router.post("/plans/:id/share",   verifyToken, generateShareLink);
router.delete("/plans/:id/share", verifyToken, revokeShareLink);
 
export default router;
