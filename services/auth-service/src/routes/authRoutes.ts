import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { requestReset, verifyReset, completeReset } from '../controllers/resetController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Password reset routes
router.post('/forgot-password', requestReset);
router.post('/verify-otp', verifyReset);
router.post('/reset-password', completeReset);

export default router;