import mongoose from 'mongoose';

const activityTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['Training', 'Awareness Program', 'Food Distribution', 'Health Camp', 'Survey', 'Meeting'],
    },
    description: String,
    icon: String, // For future UI improvements
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ActivityType = mongoose.model('ActivityType', activityTypeSchema);
export default ActivityType;
