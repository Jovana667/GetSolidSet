// Express, JWT, custom types, and the database connection pool
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";
import pool from "../utils/db";

// Adds the authenticated user to the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Controller function: verifies the JWT token on incoming requests before allowing access to protected routes
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Invalid token format. Use: Bearer <token>" });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this",
    ) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Controller function: retrieves a paginated, filterable list of foods visible to the authenticated user
export const getFoods = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 100;

    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    const userId = req.user!.id;
    conditions.push(`(created_by IS NULL OR created_by = $${paramIndex++})`);
    params.push(userId);

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${search}%`);
    }

    const whereClause =
      conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const foodsQuery = `
      SELECT 
        id,
        name,
        category,
        protein_per_100g,
        fat_per_100g,
        carbs_per_100g,
        calories_per_100g,
        created_at,
        updated_at
      FROM foods
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(pageSize, offset);

    const foodsResult = await pool.query(foodsQuery, params);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM foods
      ${whereClause}
    `;

    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.status(200).json({
      foods: foodsResult.rows,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Get foods error:", error);
    res.status(500).json({ error: "Failed to retrieve foods" });
  }
};

// Controller function: retrieves a single food by its ID, scoped to the authenticated user
export const getFoodById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return res.status(400).json({
        error: "Invalid food ID format. ID must be a number.",
      });
    }

    const userId = req.user!.id;
    const query = `
      SELECT 
        id,
        name,
        category,
        protein_per_100g,
        fat_per_100g,
        carbs_per_100g,
        calories_per_100g,
        created_at,
        updated_at
      FROM foods
      WHERE id = $1
        AND (created_by IS NULL OR created_by = $2)
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: `Food with ID ${id} not found`,
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get food by ID error:", error);
    res.status(500).json({ error: "Failed to retrieve food" });
  }
};

// Controller function: searches foods by name using a query string, returns up to 10 matches for autocomplete
export const searchFoods = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";

    if (!query.trim()) {
      return res.json([]);
    }

    const userId = req.user!.id;
    const result = await pool.query(
      `SELECT 
        id,
        name,
        category,
        protein_per_100g,
        fat_per_100g,
        carbs_per_100g,
        calories_per_100g
      FROM foods 
      WHERE name ILIKE $1
        AND (created_by IS NULL OR created_by = $2)
      ORDER BY name ASC 
      LIMIT 10`,
      [`%${query}%`, userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Search foods error:", error);
    res.status(500).json({ error: "Failed to search foods" });
  }
};

// Controller function: inserts a new custom food into the database, owned by the authenticated user
export const createCustomFood = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = `INSERT INTO foods (name, category, protein_per_100g, fat_per_100g, carbs_per_100g, calories_per_100g, is_custom, created_by ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
`;

    const result = await pool.query(query, [
      req.body.name,
      req.body.category,
      req.body.protein_per_100g,
      req.body.fat_per_100g,
      req.body.carbs_per_100g,
      req.body.calories_per_100g,
      true,
      userId,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") { // Unique violation
      return res.status(409).json({ error: "Item already exists" });
    }
    console.error("Create foods error :", error);
    res.status(500).json({ error: "Failed to create food" });
  }
};
