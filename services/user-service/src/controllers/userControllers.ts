import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db";
import {
  GetProfileResponse,
  UpdateProfileRequest,
  // CreateNutritionGoalRequest,
} from "../types";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const query = `SELECT name, email, role FROM users WHERE id = $1`;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const profile: GetProfileResponse = {
      name: result.rows[0].name,
      email: result.rows[0].email,
      role: result.rows[0].role,
    };
    res.status(200).json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const {
      name,
      email,
      current_password,
      new_password,
    }: UpdateProfileRequest = req.body;

    // Validate current password if new_password is provided
    if (new_password) {
      const passwordCheck = await pool.query(
        `SELECT password_hash FROM users WHERE id = $1`,
        [userId],
      );
      const isMatch = await bcrypt.compare(
        current_password,
        passwordCheck.rows[0].password_hash,
      );
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
    }

    // Build dynamic update query
    const fields = [];
    const values = [];
    let idx = 1;
    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (email) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (new_password) {
      const hashedPassword = await bcrypt.hash(new_password, 10);
      fields.push(`password_hash = $${idx++}`);
      values.push(hashedPassword);
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    values.push(userId);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING name, email`;
    const result = await pool.query(query, values);
    if (email) {
      await pool.query(
        `UPDATE trainer_clients SET client_email = $1 WHERE client_id = $2`,
        [email, userId],
      );
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ error: "Failed to delete profile" });
  }
};

export const createNutritionGoal = async (req: Request, res: Response) => {
  try {
    // STEP 1: Get userId from JWT
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // STEP 2: Extract data from request body (NO userId here!)
    const {
      target_calories,
      target_protein_g,
      target_fat_g,
      target_carbs_g,
      dietary_restrictions,
    } = req.body;

    // STEP 3: Validate (INSIDE the function!)
    if (target_calories !== undefined && target_calories <= 0) {
      return res
        .status(400)
        .json({ error: "target_calories must be positive" });
    }
    if (target_protein_g !== undefined && target_protein_g <= 0) {
      return res
        .status(400)
        .json({ error: "target_protein_g must be positive" });
    }
    if (target_fat_g !== undefined && target_fat_g <= 0) {
      return res.status(400).json({ error: "target_fat_g must be positive" });
    }
    if (target_carbs_g !== undefined && target_carbs_g <= 0) {
      return res.status(400).json({ error: "target_carbs_g must be positive" });
    }

    // STEP 4: Database UPSERT
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, target_calories, target_protein_g, target_fat_g, target_carbs_g, dietary_restrictions)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id) DO UPDATE SET
               target_calories = EXCLUDED.target_calories,
               target_protein_g = EXCLUDED.target_protein_g,
               target_fat_g = EXCLUDED.target_fat_g,
               target_carbs_g = EXCLUDED.target_carbs_g,
               dietary_restrictions = EXCLUDED.dietary_restrictions
             RETURNING *`,
      [
        userId,
        target_calories,
        target_protein_g,
        target_fat_g,
        target_carbs_g,
        dietary_restrictions,
      ],
    );

    // STEP 5: Return success
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const getNutritionGoalByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const query = `
            SELECT id, target_calories, target_protein_g, target_fat_g, target_carbs_g, dietary_restrictions
            FROM user_profiles
            WHERE user_id = $1
        `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(200).json({
        target_calories: null,
        target_protein_g: null,
        target_fat_g: null,
        target_carbs_g: null,
        dietary_restrictions: null,
      });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get nutrition goal error:", error);
    res.status(500).json({ error: "Failed to retrieve nutrition goal" });
  }
};

// trainer client management controllers

export const addClient = async (req: Request, res: Response) => {
  try {
    const trainerId = req.user?.id;
    const { email, name } = req.body;

    // Step 1: try to find client in users table by email
    const clientResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );

    // Step 2: client_id is optional — null if no account exists
    const clientId =
      clientResult.rows.length > 0 ? clientResult.rows[0].id : null;

    // Step 3: insert into trainer_clients
    const result = await pool.query(
      `INSERT INTO trainer_clients (trainer_id, client_id, client_name, client_email) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [trainerId, clientId, name, email],
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Client already added" });
    }
    console.error("Add client error:", error);
    res.status(500).json({ error: "Failed to add client" });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const trainerId = req.user?.id;

    const result = await pool.query(
      `SELECT u.id, u.username, u.email, tc.client_name, tc.client_email, tc.id as trainer_client_id
FROM trainer_clients tc
LEFT JOIN users u ON tc.client_id = u.id
WHERE tc.trainer_id = $1`,
      [trainerId],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ error: "Failed to retrieve clients" });
  }
};

export const removeClient = async (req: Request, res: Response) => {
  try {
    const trainerId = req.user?.id;
    const { trainerClientId } = req.params;

    const result = await pool.query(
      `DELETE FROM trainer_clients WHERE id = $1 AND trainer_id = $2 RETURNING *`,
      [trainerClientId, trainerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.status(200).json({ message: "Client removed successfully" });
  } catch (error) {
    console.error("Remove client error:", error);
    res.status(500).json({ error: "Failed to remove client" });
  }
};

export const linkClient = async (req: Request, res: Response) => {
  try {
    const trainerId = req.user?.id;
    const { trainerClientId } = req.params;
    const email = req.body.email;

    const userResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email],
    );

    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No account found with that email" });
    }

    const clientId = userResult.rows[0].id;

    const result = await pool.query(
      `UPDATE trainer_clients SET client_id = $1 WHERE id = $2 AND trainer_id = $3 RETURNING *`,
      [clientId, trainerClientId, trainerId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Client not found or not authorized" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Link client error:", error);
    res.status(500).json({ error: "Failed to link client" });
  }
};

// skin fold management controllers

export const getSkinFolds = async (req: Request, res: Response) => {
  try {
    const { trainerClientId } = req.params;
    const result = await pool.query(
      `SELECT * FROM skin_folds 
       WHERE trainer_client_id = $1 
       ORDER BY week_number ASC`,
      [trainerClientId],
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get skin folds error:", error);
    res.status(500).json({ error: "Failed to retrieve skin folds" });
  }
};

export const createSkinFold = async (req: Request, res: Response) => {
  try {
    const { trainerClientId } = req.params;
    const { week_number, ...fields } = req.body;

    const allowedColumns = [
      "weight_kg",
      "triceps",
      "biceps",
      "chest",
      "subscapular",
      "midaxillary",
      "suprailiac",
      "abdominal",
      "thigh",
      "hamstring",
      "notes",
    ];

    const setClauses = Object.keys(fields)
      .filter((key) => allowedColumns.includes(key))
      .map((key, i) => `${key} = $${i + 3}`)
      .join(", ");

    const values = [
      trainerClientId,
      week_number,
      ...Object.keys(fields)
        .filter((key) => allowedColumns.includes(key))
        .map((key) => fields[key]),
    ];

    const result = await pool.query(
      `INSERT INTO skin_folds (trainer_client_id, week_number)
       VALUES ($1, $2)
       ON CONFLICT (trainer_client_id, week_number)
       DO UPDATE SET ${setClauses}, updated_at = NOW()
       RETURNING *`,
      values,
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Create skin fold error:", error);
    res.status(500).json({ error: "Failed to create skin fold" });
  }
};

export const updateSkinFold = async (req: Request, res: Response) => {
  try {
    const { trainerClientId, id } = req.params;
    const allowedColumns = [
      "week_number",
      "weight_kg",
      "triceps",
      "biceps",
      "chest",
      "subscapular",
      "midaxillary",
      "suprailiac",
      "abdominal",
      "thigh",
      "hamstring",
      "notes",
    ];

    const fields = [];
    const values = [];
    let idx = 1;

    for (const col of allowedColumns) {
      if (req.body[col] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push(req.body[col]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, trainerClientId);

    const result = await pool.query(
      `UPDATE skin_folds SET ${fields.join(", ")} WHERE id = $${idx} AND trainer_client_id = $${idx + 1} RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Skin fold not found or not authorized" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update skin fold error:", error);
    res.status(500).json({ error: "Failed to update skin fold" });
  }
};

// client note management controllers

export const getClientNotes = async (req: Request, res: Response) => {
  try {
    const { trainerClientId } = req.params;
    const result = await pool.query(
      `SELECT * FROM client_notes 
       WHERE trainer_client_id = $1 
       ORDER BY created_at DESC`,
      [trainerClientId],
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get client notes error:", error);
    res.status(500).json({ error: "Failed to retrieve client notes" });
  }
};

export const createClientNote = async (req: Request, res: Response) => {
  try {
    const { trainerClientId } = req.params;
    const { note } = req.body;
    const result = await pool.query(
`INSERT INTO client_notes (trainer_client_id, note)
 VALUES ($1, $2) RETURNING *`,
      [trainerClientId, note],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create client note error:", error);
    res.status(500).json({ error: "Failed to create client note" });
  }
};

export const deleteClientNote = async (req: Request, res: Response) => {
  try {
    const { trainerClientId, noteId } = req.params;
    const result = await pool.query(
      `DELETE FROM client_notes WHERE id = $1 AND trainer_client_id = $2 RETURNING *`,
      [noteId, trainerClientId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Client note not found" });
    }
    res.status(200).json({ message: "Client note deleted successfully" });
  } catch (error) {
    console.error("Delete client note error:", error);
    res.status(500).json({ error: "Failed to delete client note" });
  }
};
