import { Router } from "express";
import { createMeal, getMeals, getMealById, getMealPlanById, updateMealPlan } from "../controllers/mealController";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Get all meals for authenticated user (with pagination)
router.get("/", verifyToken, getMeals);

// Get a specific meal by ID (protected route - requires authentication)
router.get("/:id", verifyToken, getMealById);

router.get("/plans/:id", verifyToken, getMealPlanById);

// Create a new meal (protected route - requires authentication)
router.post("/", verifyToken, createMeal);

// Update and delete routes can be added here as needed, following the same pattern of using verifyToken middleware
router.put("/plans/:id", verifyToken, updateMealPlan);


export default router;
