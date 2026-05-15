import Notification from '../models/Notification.js';
import { getNotifications, getUnreadNotifications, markAsRead, markAllAsRead } from '../services/notificationService.js';

/**
 * Get user notifications
 */
export const getNotifications_Handler = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await getNotifications(req.user.id, page, limit);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const unreadNotifications = await getUnreadNotifications(req.user.id);

    res.json({
      success: true,
      data: {
        unreadCount: unreadNotifications.length,
        notifications: unreadNotifications,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead_Handler = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await markAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead_Handler = async (req, res) => {
  try {
    await markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read',
      error: error.message,
    });
  }
};
