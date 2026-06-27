import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

export const validateCustomFood = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Food name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be under 255 characters")
    .escape(),
  body("category")
    .isIn(["protein", "carbs", "fats", "vegetables", "fruits", "supplements"])
    .withMessage("Invalid category"),
  body("protein_per_100g")
    .isFloat({ min: 0, max: 200 })
    .withMessage("Protein must be between 0 and 200"),
  body("carbs_per_100g")
    .isFloat({ min: 0, max: 200 })
    .withMessage("Carbs must be between 0 and 200"),
  body("fat_per_100g")
    .isFloat({ min: 0, max: 200 })
    .withMessage("Fat must be between 0 and 200"),
  body("calories_per_100g")
    .isFloat({ min: 0, max: 1000 })
    .withMessage("Calories must be between 0 and 1000"),
  handleValidationErrors,
];
