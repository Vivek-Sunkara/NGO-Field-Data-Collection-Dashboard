import express from 'express';
import { authMiddleware, adminOrManager, authorize } from '../middleware/auth.js';
import {
  getGlobalHeatmap,
  getSubmissionTrends,
  getEventProgress,
  getTopWorkers,
  getStatusBreakdown,
  getMyHeatmap,
  getMyTimeline,
  getMyStats,
  getMyEventSummary,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/global-heatmap', authMiddleware, adminOrManager, getGlobalHeatmap);
router.get('/submission-trends', authMiddleware, adminOrManager, getSubmissionTrends);
router.get('/event-progress', authMiddleware, adminOrManager, getEventProgress);
router.get('/top-workers', authMiddleware, adminOrManager, getTopWorkers);
router.get('/status-breakdown', authMiddleware, adminOrManager, getStatusBreakdown);

router.get('/my-heatmap', authMiddleware, authorize('Field Worker'), getMyHeatmap);
router.get('/my-timeline', authMiddleware, authorize('Field Worker'), getMyTimeline);
router.get('/my-stats', authMiddleware, authorize('Field Worker'), getMyStats);
router.get('/my-event-summary', authMiddleware, authorize('Field Worker'), getMyEventSummary);

export default router;
