
import { error } from "console";
import crypto from "crypto";
import { error } from "console";
import pool from "../utils/db";

// POST /meals/plans/:id/share
// Generates (or returns existing) share token for a meal plan.
// Requires auth — trainer or owner only.
export const generateShareLink = async (req: Request, res: Response) => {
  try {
    const userId  = req.user?.id;
    const planId  = parseInt(req.params.id);

    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    if (isNaN(planId)) return res.status(400).json({ error: "Invalid meal plan ID" });

    // Verify the requester owns this plan OR is the trainer who created it
    const ownerCheck = await pool.query(
      `SELECT id FROM meal_plans
       WHERE id = $1
         AND (
           user_id = $2
           OR $2 IN (SELECT trainer_id FROM trainer_clients WHERE client_id = user_id)
           OR $2 IN (SELECT tc.client_id FROM trainer_clients tc WHERE tc.id = trainer_client_id)
         )`,
      [planId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "You don't have permission to share this meal plan" });
    }

    // Return existing token if one already exists for this plan
    const existing = await pool.query(
      `SELECT token FROM meal_plan_shares WHERE meal_plan_id = $1 LIMIT 1`,
      [planId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({ token: existing.rows[0].token });
    }

    // Generate a new cryptographically random token
    const token = crypto.randomBytes(32).toString("hex"); // 64-char hex string

    await pool.query(
      `INSERT INTO meal_plan_shares (meal_plan_id, token, created_by)
       VALUES ($1, $2, $3)`,
      [planId, token, userId]
    );

    return res.status(201).json({ token });
  } catch (error) {
    console.error("Generate share link error:", error);
    res.status(500).json({ error: "Failed to generate share link" });
  }
  console.error("Generate share link error:", error);
};

// DELETE /meals/plans/:id/share
// Revokes the share token (link stops working immediately).
export const revokeShareLink = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const planId = parseInt(req.params.id);

    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    await pool.query(
      `DELETE FROM meal_plan_shares
       WHERE meal_plan_id = $1
         AND created_by = $2`,
      [planId, userId]
    );

    return res.status(200).json({ message: "Share link revoked" });
  } catch (error) {
    console.error("Revoke share link error:", error);
    res.status(500).json({ error: "Failed to revoke share link" });
  }
};

// GET /meals/share/:token  (NO auth middleware — public endpoint)
// Returns full meal plan data for the token.
export const getSharedMealPlan = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token || token.length !== 64) {
      return res.status(400).json({ error: "Invalid share token" });
    }

    // Look up the token
    const shareResult = await pool.query(
      `SELECT meal_plan_id, expires_at
       FROM meal_plan_shares
       WHERE token = $1`,
      [token]
    );

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: "Share link not found or has been revoked" });
    }

    const { meal_plan_id, expires_at } = shareResult.rows[0];

    if (expires_at && new Date(expires_at) < new Date()) {
      return res.status(410).json({ error: "Share link has expired" });
    }

    // Fetch the full meal plan (same shape as getMealPlanById)
    const mealPlanResult = await pool.query(
      `SELECT id, user_id, name, is_template, meal_date, created_at, updated_at
       FROM meal_plans WHERE id = $1`,
      [meal_plan_id]
    );

    if (mealPlanResult.rows.length === 0) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    const mealPlan = mealPlanResult.rows[0];

    const mealsResult = await pool.query(
      `SELECT
         m.id as meal_id,
         m.meal_type,
         mf.id as meal_food_id,
         mf.food_id,
         mf.quantity_g,
         f.name,
         f.category,
         f.protein_per_100g,
         f.fat_per_100g,
         f.carbs_per_100g,
         f.calories_per_100g
       FROM meals m
       LEFT JOIN meal_foods mf ON m.id = mf.meal_id
       LEFT JOIN foods f ON mf.food_id = f.id
       WHERE m.meal_plan_id = $1
       ORDER BY
         CASE m.meal_type
           WHEN 'breakfast' THEN 1
           WHEN 'lunch'     THEN 2
           WHEN 'dinner'    THEN 3
           WHEN 'snack'     THEN 4
         END,
         mf.created_at`,
      [meal_plan_id]
    );

    const groupedMeals: Record<string, { meal_id: number | null; foods: any[] }> = {
      breakfast: { meal_id: null, foods: [] },
      lunch:     { meal_id: null, foods: [] },
      dinner:    { meal_id: null, foods: [] },
      snack:     { meal_id: null, foods: [] },
    };

    mealsResult.rows.forEach((row: any) => {
      groupedMeals[row.meal_type].meal_id = row.meal_id;
      if (row.food_id) {
        groupedMeals[row.meal_type].foods.push({
          id:               row.food_id,
          name:             row.name,
          category:         row.category,
          meal_food_id:     row.meal_food_id,
          quantity_g:       row.quantity_g,
          protein_per_100g: parseFloat(row.protein_per_100g),
          fat_per_100g:     parseFloat(row.fat_per_100g),
          carbs_per_100g:   parseFloat(row.carbs_per_100g),
          calories_per_100g:parseFloat(row.calories_per_100g),
        });
      }
    });

    return res.status(200).json({ ...mealPlan, meals: groupedMeals });
  } catch (error) {
    console.error("Get shared meal plan error:", error);
    res.status(500).json({ error: "Failed to retrieve shared meal plan" });
  }
};