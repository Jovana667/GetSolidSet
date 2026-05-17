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
} from "../controllers/mealController";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Get all meals for authenticated user (with pagination)
router.get("/", verifyToken, getMeals);

// Get a specific meal plan by plan ID
router.get("/plans/:id", verifyToken, getMealPlanById);

// Get a specific meal by ID
router.get("/:id", verifyToken, getMealById);

// trainer routes for managing meal plans for clients
router.get("/plans/user/:userId", verifyToken, getClientMeals);

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

export default router;
