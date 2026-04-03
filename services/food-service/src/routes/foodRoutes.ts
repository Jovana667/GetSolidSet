// Router and controller function imports needed to define and handle each route
import { Router } from "express";
import {
  getFoods,
  getFoodById,
  searchFoods,
  createCustomFood,
  verifyToken,
} from "../controllers/foodControllers";

// Router instance that groups all food-related routes together
const router = Router();

// Route definitions: each line maps an HTTP method + URL path to its controller function, protected by verifyToken
router.get("/", verifyToken, getFoods);
router.get("/search", verifyToken, searchFoods);
router.post("/custom", verifyToken, createCustomFood);
router.get("/:id", verifyToken, getFoodById);

// Exports the router so it can be mounted in the main server
export default router;
