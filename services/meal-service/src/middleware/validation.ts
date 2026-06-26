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

export const validateCreateMeal = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Meal name is required")
    .isLength({ max: 100 })
    .withMessage("Meal name must be under 100 characters")
    .escape(),
  body("meal_date")
    .optional()
    .isDate()
    .withMessage("Invalid date format"),
  body("foods")
    .notEmpty()
    .withMessage("Foods object is required"),
  handleValidationErrors,
];

export const validateUpdateMeal = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Meal name is required")
    .isLength({ max: 100 })
    .withMessage("Meal name must be under 100 characters")
    .escape(),
  handleValidationErrors,
];