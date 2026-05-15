import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
  {
    // Worker reference
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker_name: {
      type: String,
      required: true,
    },

    // Draft metadata
    draftTitle: {
      type: String,
      required: false,
      default: 'Untitled Draft',
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // SECTION 1: Activity Details
    activityType: String,
    activityTitle: String,
    activityDate: Date,
    region: String,
    locationDetails: String,

    // SECTION 2: Participation Details
    totalParticipants: Number,
    maleCount: Number,
    femaleCount: Number,
    childrenCount: Number,
    beneficiaryCategory: String,

    // SECTION 3: Issues Faced
    issuesTags: [String],
    additionalNotes: String,

    // SECTION 4: Evidence/Images
    evidenceImages: [
      {
        fileName: String,
        fileSize: Number,
        uploadedAt: { type: Date, default: Date.now },
        fileUrl: String,
      },
    ],

    // Track which sections have been filled
    filledSections: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for faster queries
draftSchema.index({ worker_id: 1, lastSavedAt: -1 });

const Draft = mongoose.model('Draft', draftSchema);
export default Draft;
