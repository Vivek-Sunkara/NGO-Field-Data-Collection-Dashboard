import mongoose from 'mongoose';

const DynamicSubmissionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerName: String,
    workerRole: String,
    responses: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    location: {
      state: { type: String, required: true },
      city: { type: String, required: true },
      village: String,
    },
    activityDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'draft', 'expired'],
      default: 'submitted',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    deviceInfo: String,
  },
  { timestamps: true }
);

// Index for faster queries
DynamicSubmissionSchema.index({ workerId: 1, formId: 1 });
DynamicSubmissionSchema.index({ eventId: 1 });
DynamicSubmissionSchema.index({ status: 1 });
DynamicSubmissionSchema.index({ 'location.state': 1, 'location.city': 1 });
DynamicSubmissionSchema.index({ activityDate: 1 });

export default mongoose.model('DynamicSubmission', DynamicSubmissionSchema);
