import express from 'express';
import { authMiddleware, adminOrManager } from '../middleware/auth.js';
import {
  getWorkersDirectory,
  getWorkerProfile,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
} from '../controllers/profileController.js';

const router = express.Router();

// Directory & profiles — all authenticated users (admins + field workers)
router.get('/workers', authMiddleware, getWorkersDirectory);
router.get('/workers/:workerId', authMiddleware, getWorkerProfile);

// Performance reviews — admins / NGO managers only
router.post('/performance-reviews', authMiddleware, adminOrManager, createPerformanceReview);
router.put(
  '/performance-reviews/:reviewId',
  authMiddleware,
  adminOrManager,
  updatePerformanceReview
);
router.delete(
  '/performance-reviews/:reviewId',
  authMiddleware,
  adminOrManager,
  deletePerformanceReview
);

export default router;
