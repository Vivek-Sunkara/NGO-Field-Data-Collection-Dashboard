import Notification from '../models/Notification.js';

/**
 * Create a notification
 */
export const createNotification = async (userId, type, title, message, relatedEntity = null, actionUrl = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedEntity,
      actionUrl,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get unread notifications for user
 */
export const getUnreadNotifications = async (userId) => {
  try {
    return await Notification.find({
      userId,
      read: false,
    }).sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
};

/**
 * Get all notifications for user (paginated)
 */
export const getNotifications = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for user
 */
export const markAllAsRead = async (userId) => {
  try {
    return await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Send notification to multiple users (e.g., all workers in an event)
 */
export const bulkNotify = async (userIds, type, title, message, relatedEntity = null, actionUrl = null) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      relatedEntity,
      actionUrl,
    }));

    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};
