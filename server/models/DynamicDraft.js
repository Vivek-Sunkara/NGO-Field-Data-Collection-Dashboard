import mongoose from 'mongoose';

const DynamicDraftSchema = new mongoose.Schema(
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
      state: String,
      city: String,
      village: String,
    },
    activityDate: Date,
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    filledSections: [String],
  },
  { timestamps: true }
);

// Index for faster queries
DynamicDraftSchema.index({ workerId: 1, formId: 1 });
DynamicDraftSchema.index({ eventId: 1 });

export default mongoose.model('DynamicDraft', DynamicDraftSchema);
