import express from 'express';
import {
  register,
  verifyRegistrationOTP,
  requestNewOTP,
  login,
  verifyLoginOTP,
  getProfile,
  logout,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOTP);
router.post('/request-otp', requestNewOTP);
router.post('/login', login);
router.post('/verify-login-otp', verifyLoginOTP);
router.get('/profile', authMiddleware, getProfile);
router.post('/logout', authMiddleware, logout);

export default router;
