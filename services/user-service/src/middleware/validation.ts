import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: "Validation failed", 
      details: errors.array() 
    });
  }
  next();
};

export const validateAddClient = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name must be under 100 characters")
    .escape(),
  handleValidationErrors,
];

export const validateNutritionGoal = [
  body("target_calories")
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage("Calories must be between 0 and 10000"),
  body("target_protein_g")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Protein must be between 0 and 1000"),
  body("target_fat_g")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Fat must be between 0 and 1000"),
  body("target_carbs_g")
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Carbs must be between 0 and 1000"),
  handleValidationErrors,
];