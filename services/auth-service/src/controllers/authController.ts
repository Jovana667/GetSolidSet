import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../utils/db";
import crypto from "crypto";
import { RegisterRequest, LoginRequest, JWTPayload } from "../types";
import { validateEmail, validatePassword } from "../utils/validation";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, role, email, password }: RegisterRequest = req.body;

    // Validate role

    if (role && !["client", "trainer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // TODO: Add validation
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ error: "Password does not meet requirements" });
    }
    // TODO: Check if user exists
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    const userExists = checkResult.rows.length > 0;

    if (userExists) {
      // Check FIRST
      return res.status(409).json({ error: "Email already taken" });
    }

    // THEN hash (only if user doesn't exist)
    const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Insert user into database
    const result = await pool.query(
      "INSERT INTO users (name, role, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, role, email, created_at",
      [name, role, email, hashedPassword],
    );
    const newUser = result.rows[0];

    // TODO: Return user info (without password)
    res.status(201).json({
      message: "User registered successfully",
      user: newUser, // This contains id, name, role, email, created_at (no password!)
    });
  } catch (error) {
    // ← Need this!
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const result = await pool.query(
      "SELECT id, email, username, role, password_hash FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

const accessToken = jwt.sign(
  payload,
  process.env.JWT_SECRET || "your-secret-key-change-this",
  { expiresIn: "30d" },
);

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, refreshExpiry],
    );

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [refreshToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const storedToken = result.rows[0];

    const userResult = await pool.query(
      "SELECT id, email, username, role FROM users WHERE id = $1",
      [storedToken.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

const accessToken = jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key-change-this", {
  expiresIn: "30d",
});

    res.status(200).json({ token: accessToken });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token from database
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
        refreshToken,
      ]);
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both fields are required" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include a number and special character",
      });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    console.error("changePassword error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};