import mongoose from 'mongoose';

const WorkerPerformanceReviewSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// One rating per admin per worker per event (eventId null = general rating)
WorkerPerformanceReviewSchema.index(
  { workerId: 1, ratedBy: 1, eventId: 1 },
  { unique: true }
);

WorkerPerformanceReviewSchema.index({ workerId: 1, createdAt: -1 });

export default mongoose.model('WorkerPerformanceReview', WorkerPerformanceReviewSchema);
