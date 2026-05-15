import express from 'express';
import {
  getWorkerEvents,
  getFormSchema,
  getDraftForForm,
  getWorkerDrafts,
  saveDraftForForm,
  submitFormResponse,
  getWorkerSubmissions,
  getSubmissionById,
  updateSubmissionResponse,
  checkSubmissionStatus,
} from '../controllers/dynamicFormController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * WORKER ROUTES
 */

// Get all assigned events for worker
router.get('/events', authMiddleware, getWorkerEvents);

// Get form schema by ID
router.get('/form/:formId', authMiddleware, getFormSchema);

// Get draft for a specific form
router.get('/draft/:formId', authMiddleware, getDraftForForm);

// Get all drafts for the current worker
router.get('/drafts', authMiddleware, getWorkerDrafts);

// Save or update draft
router.post('/draft', authMiddleware, saveDraftForForm);

// Submit form response
router.post('/submit', authMiddleware, submitFormResponse);

// Check submission status and editability
router.get('/status/:formId', authMiddleware, checkSubmissionStatus);

// Get all submissions for worker
router.get('/submissions', authMiddleware, getWorkerSubmissions);

// Get submission by ID
router.get('/submission/:submissionId', authMiddleware, getSubmissionById);

// Update existing submission
router.put('/submission/:submissionId', authMiddleware, updateSubmissionResponse);
export default router;
