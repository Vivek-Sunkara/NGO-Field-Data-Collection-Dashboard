import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    analysisType: {
      type: String,
      enum: ['summary', 'insights', 'overview', 'attendees', 'custom'],
      required: true
    },
    customPrompt: {
      type: String,
      default: null
    },
    query: {
      type: String,
      required: true
    },
    response: {
      type: String,
      required: true
    },
    submissionCount: {
      type: Number,
      required: true
    },
    dataHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 24 * 60 * 60 * 1000),
      index: { expires: 0 }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    usageCount: {
      type: Number,
      default: 1
    },
    metadata: {
      dateRange: {
        startDate: Date,
        endDate: Date
      },
      submissionIds: [mongoose.Schema.Types.ObjectId]
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
aiAnalysisSchema.index({ eventId: 1, analysisType: 1, dataHash: 1 });

export default mongoose.model('AIAnalysis', aiAnalysisSchema);
