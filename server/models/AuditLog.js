import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: String,
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'DRAFT', 'REMINDER_SENT', 'EMAIL_SENT', 'VIEW'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Event', 'Form', 'Submission', 'Draft', 'Notification', 'User'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    entityName: String,
    changes: {
      type: mongoose.Schema.Types.Mixed, // Store what changed
    },
    ipAddress: String,
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    errorMessage: String,
  },
  { timestamps: true }
);

// Index for faster queries
AuditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

export default mongoose.model('AuditLog', AuditLogSchema);
