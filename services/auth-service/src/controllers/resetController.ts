import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../utils/db";
import { RequestReset, VerifyReset, CompleteReset } from "../types";
import { validateEmail } from "../utils/validation";
import { sendEmail } from "../utils/sendEmail";

export const requestReset = async (req: Request, res: Response) => {
  try {
    const { email }: RequestReset = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query("DELETE FROM password_reset_otps WHERE email = $1", [
      email,
    ]);

    await pool.query(
      "INSERT INTO password_reset_otps (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, otpExpiry],
    );

    const message = `Your password reset OTP is ${otp}. It is valid for 10 minutes.`;
    await sendEmail({
      to: user.rows[0].email,
      subject: "Password Reset OTP",
      text: message,
    });
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyReset = async (req: Request, res: Response) => {
  try {
    const { email, otp }: VerifyReset = req.body;

    if (!email || !validateEmail(email) || !otp) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const otpRecord = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = $1 AND otp = $2",
      [email, otp],
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const record = otpRecord.rows[0];

    if (record.expires_at < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (record.used) {
      return res.status(400).json({ message: "OTP has already been used" });
    }

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const completeReset = async (req: Request, res: Response) => {
  try {
    const { email, newPassword }: CompleteReset = req.body;

    if (!email || !validateEmail(email) || !newPassword) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const otpRecord = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = $1 AND used = false ORDER BY created_at DESC LIMIT 1",
      [email],
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({ message: "No valid OTP found" });
    }

    const record = otpRecord.rows[0];

    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    await pool.query(
      "UPDATE password_reset_otps SET used = true WHERE id = $1",
      [record.id],
    );

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
