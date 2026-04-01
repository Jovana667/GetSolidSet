import { Router } from "express";
import {
  getFoods,
  getFoodById,
  searchFoods,
  verifyToken,
} from "../controllers/foodControllers";

const router = Router();

// All food routes require a valid JWT — verifyToken runs first on every request
// Get all foods (with pagination and filters)
router.get("/", verifyToken, getFoods);

// Autocomplete search - MUST come before /:id route
// This handles /api/foods/search?q=chicken
router.get("/search", verifyToken, searchFoods);

// Get single food by ID
// IMPORTANT: This must come AFTER any specific routes like /search
// because Express matches routes in order and would treat "search" as an ID
router.get("/:id", verifyToken, getFoodById);

export default router;
