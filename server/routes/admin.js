import express from 'express';
import { authMiddleware, adminOrManager, adminOnly } from '../middleware/auth.js';
import {
  getAllEvents,
  getEventDetail,
  getEventSubmissionStats,
  getAllSubmissions,
  getSubmissionDetail,
  getDashboardStats,
  getPendingSubmissions,
  getAuditLogs,
  getWorkers,
  createEvent,
  updateEvent,
  deleteEvent,
  createForm,
  updateForm,
  deleteForm,
  getFormSubmissionStatus,
  getFormDetail,
} from '../controllers/adminController.js';
import {
  getNotifications_Handler,
  getUnreadCount,
  markAsRead_Handler,
  markAllAsRead_Handler,
} from '../controllers/notificationController.js';

const router = express.Router();

/**
 * ADMIN ROUTES
 */

// Dashboard stats
router.get('/stats', authMiddleware, adminOrManager, getDashboardStats);

// Workers list (for assigning to events)
router.get('/workers', authMiddleware, adminOrManager, getWorkers);

// Events management
router.post('/events', authMiddleware, adminOrManager, createEvent);
router.get('/events', authMiddleware, adminOrManager, getAllEvents);
router.get('/events/:eventId', authMiddleware, adminOrManager, getEventDetail);
router.get('/events/:eventId/submissions/stats', authMiddleware, adminOrManager, getEventSubmissionStats);
router.put('/events/:eventId', authMiddleware, adminOrManager, updateEvent);
router.delete('/events/:eventId', authMiddleware, adminOrManager, deleteEvent);

// Forms management
router.post('/forms', authMiddleware, adminOrManager, createForm);
router.put('/forms/:formId', authMiddleware, adminOrManager, updateForm);
router.delete('/forms/:formId', authMiddleware, adminOrManager, deleteForm);
router.get('/forms/:formId/status', authMiddleware, adminOrManager, getFormSubmissionStatus);
router.get('/forms/:formId', authMiddleware, adminOrManager, getFormDetail);

// Submissions management
router.get('/submissions', authMiddleware, adminOrManager, getAllSubmissions);
router.get('/submissions/:submissionId', authMiddleware, adminOrManager, getSubmissionDetail);

// Pending submissions for reminders
router.get('/pending-submissions', authMiddleware, adminOrManager, getPendingSubmissions);

// Audit logs (admin only)
router.get('/audit-logs', authMiddleware, adminOnly, getAuditLogs);

/**
 * NOTIFICATION ROUTES
 */

// Get user notifications
router.get('/notifications', authMiddleware, getNotifications_Handler);

// Get unread count
router.get('/notifications/unread-count', authMiddleware, getUnreadCount);

// Mark notification as read
router.put('/notifications/:notificationId/read', authMiddleware, markAsRead_Handler);

// Mark all notifications as read
router.put('/notifications/mark-all-read', authMiddleware, markAllAsRead_Handler);

export default router;
