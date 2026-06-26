import { Router } from "express";
import {
  createNutritionGoal,
  getNutritionGoalByUserId,
  addClient,
  getClients,
  removeClient,
  linkClient,
  getSkinFolds,
  createSkinFold,
  updateSkinFold,
  getProfile,
  updateProfile,
  deleteProfile,
  getClientNotes,
  createClientNote,
  deleteClientNote,
} from "../controllers/userControllers";
import { verifyToken } from "../middleware/auth";
import { validateAddClient, validateNutritionGoal } from "../middleware/validation";


const router = Router();

// User profile routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.delete("/profile", verifyToken, deleteProfile);

// Nutrition goals
router.put("/nutrition-goals", verifyToken, validateNutritionGoal, createNutritionGoal);
router.get("/nutrition-goals", verifyToken, getNutritionGoalByUserId);

// Trainer client management
router.post("/clients", verifyToken, validateAddClient, addClient);
router.get("/clients", verifyToken, getClients);
router.delete("/clients/:trainerClientId", verifyToken, removeClient);
router.put("/clients/:trainerClientId/link", verifyToken, linkClient);

// skin fold managment
router.get("/clients/:trainerClientId/skin-folds", verifyToken, getSkinFolds);
router.post("/clients/:trainerClientId/skin-folds", verifyToken, createSkinFold);
router.put("/clients/:trainerClientId/skin-folds/:id", verifyToken, updateSkinFold);

// client note management
router.get("/clients/:trainerClientId/notes", verifyToken, getClientNotes);
router.post("/clients/:trainerClientId/notes", verifyToken, createClientNote);
router.delete("/clients/:trainerClientId/notes/:noteId", verifyToken, deleteClientNote);

export default router;
