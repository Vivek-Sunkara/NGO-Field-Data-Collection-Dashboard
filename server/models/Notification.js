import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['FORM_CREATED', 'SUBMISSION_RECEIVED', 'REMINDER', 'EVENT_COMPLETED', 'DRAFT_SAVED', 'FORM_EXPIRED'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedEntity: {
      entityType: String, // 'Event', 'Form', 'Submission'
      entityId: mongoose.Schema.Types.ObjectId,
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: String, // Link to relevant page
  },
  { timestamps: true }
);

// Index for faster queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
