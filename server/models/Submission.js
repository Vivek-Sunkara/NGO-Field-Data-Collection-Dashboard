import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    // Auto-populated metadata
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker_name: {
      type: String,
      required: true,
    },
    user_role: {
      type: String,
      enum: ['field_worker', 'admin'],
      default: 'field_worker',
    },
    submission_timestamp: {
      type: Date,
      default: Date.now,
    },
    worker_region: {
      type: String,
      required: false,
    },

    // SECTION 1: Activity Details
    activityType: {
      type: String,
      enum: ['Training', 'Awareness Program', 'Food Distribution', 'Health Camp', 'Survey', 'Meeting'],
      required: true,
    },
    activityTitle: {
      type: String,
      required: true,
      maxlength: 200,
    },
    activityDate: {
      type: Date,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    locationDetails: {
      type: String,
      required: false,
      maxlength: 500,
    },

    // SECTION 2: Participation Details
    totalParticipants: {
      type: Number,
      required: true,
      min: 0,
    },
    maleCount: {
      type: Number,
      required: true,
      min: 0,
    },
    femaleCount: {
      type: Number,
      required: true,
      min: 0,
    },
    childrenCount: {
      type: Number,
      required: false,
      min: 0,
      default: 0,
    },
    beneficiaryCategory: {
      type: String,
      enum: ['Farmers', 'Students', 'Women', 'Children', 'Senior Citizens', 'General Public'],
      required: true,
    },

    // SECTION 3: Issues Faced
    issuesTags: [
      {
        type: String,
        enum: ['Water Shortage', 'Low Attendance', 'Rain / Weather', 'Resource Shortage', 'Transport Issues', 'Technical Issues'],
      },
    ],
    additionalNotes: {
      type: String,
      required: false,
      maxlength: 1000,
    },

    // SECTION 4: Evidence/Images
    evidenceImages: [
      {
        fileName: String,
        fileSize: Number,
        uploadedAt: { type: Date, default: Date.now },
        fileUrl: String, // URL to uploaded file
      },
    ],

    // Status
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'submitted',
    },

    // Additional metadata
    ipAddress: String,
    deviceInfo: String,
  },
  { timestamps: true }
);

// Index for faster queries
submissionSchema.index({ worker_id: 1, submission_timestamp: -1 });
submissionSchema.index({ region: 1, activityDate: -1 });
submissionSchema.index({ activityType: 1 });
submissionSchema.index({ status: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
