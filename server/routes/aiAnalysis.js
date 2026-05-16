import express from 'express';
import {
  analyzeEvent,
  exportAnalysis,
  getAnalysisHistory,
  clearEventCache
} from '../controllers/aiAnalysisController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All AI analysis routes require authentication
router.use(authMiddleware);

/**
 * POST /api/ai/analyze
 * Analyze event submissions using AI
 * Body: { eventId, analysisType, customPrompt? }
 * analysisType: 'summary' | 'insights' | 'overview' | 'attendees' | 'custom'
 */
router.post('/analyze', analyzeEvent);

/**
 * POST /api/ai/export
 * Export analysis results in requested format
 * Body: { analysisId, exportFormat }
 * exportFormat: 'pdf' | 'csv' | 'json'
 */
router.post('/export', exportAnalysis);

/**
 * GET /api/ai/history/:eventId
 * Get analysis history for an event
 */
router.get('/history/:eventId', getAnalysisHistory);

/**
 * DELETE /api/ai/cache/:eventId
 * Clear cached analyses for an event
 */
router.delete('/cache/:eventId', clearEventCache);

export default router;
