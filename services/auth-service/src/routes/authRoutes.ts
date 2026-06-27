import { Router } from 'express';
import { register, login, refreshToken, logout } from "../controllers/authController";
import { requestReset, verifyReset, completeReset } from '../controllers/resetController';
import { validateRegister, validateLogin } from "../middleware/validation";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: "Too many attempts, please try again in 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Password reset routes
router.post('/forgot-password', authLimiter, requestReset);
router.post('/verify-otp', authLimiter, verifyReset);
router.post('/reset-password', authLimiter, completeReset);

export default router;