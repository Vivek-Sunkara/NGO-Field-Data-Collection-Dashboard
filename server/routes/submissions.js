import express from 'express';
import multer from 'multer';
import {
  createSubmission,
  saveDraft,
  getDraftsForWorker,
  getDraftById,
  deleteDraft,
  getAllSubmissions,
  getSubmissionById,
  getSubmissionsByWorker,
  getSubmissionStats,
} from '../controllers/submissionController.js';
import { authMiddleware, adminOrManager } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

/**
 * FIELD WORKER ROUTES
 */

// Create new submission
router.post('/', authMiddleware, upload.array('images', 10), createSubmission);

// Save as draft
router.post('/draft', authMiddleware, saveDraft);

// Get all drafts for worker
router.get('/drafts/:workerId', authMiddleware, getDraftsForWorker);

// Get specific draft
router.get('/draft/:draftId', authMiddleware, getDraftById);

// Delete draft
router.delete('/draft/:draftId', authMiddleware, deleteDraft);

// Get worker's submissions
router.get('/worker/:workerId', authMiddleware, getSubmissionsByWorker);

/**
 * ADMIN ROUTES
 */

// Get all submissions with filters
router.get('/', authMiddleware, adminOrManager, getAllSubmissions);
// Get submission stats
router.get('/stats', authMiddleware, adminOrManager, getSubmissionStats);
// Get specific submission
router.get('/:submissionId', authMiddleware, adminOrManager, getSubmissionById);
export default router;
