import AuditLog from '../models/AuditLog.js';

/**
 * Log an action to audit trail
 */
export const logAction = async (userId, userName, action, entityType, entityId, entityName = null, changes = null, ipAddress = null, status = 'success', errorMessage = null) => {
  try {
    const auditLog = new AuditLog({
      userId,
      userName,
      action,
      entityType,
      entityId,
      entityName,
      changes,
      ipAddress,
      status,
      errorMessage,
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
};

/**
 * Get audit logs with filtering
 */
export const getAuditLogs = async (filters = {}, page = 1, limit = 20) => {
  try {
    const query = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    const skip = (page - 1) * limit;
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await AuditLog.countDocuments(query);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Get audit logs for a specific entity
 */
export const getEntityAuditLogs = async (entityType, entityId) => {
  try {
    return await AuditLog.find({
      entityType,
      entityId,
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    throw error;
  }
};

/**
 * Get audit logs for a user
 */
export const getUserAuditLogs = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments({ userId });

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    throw error;
  }
};
