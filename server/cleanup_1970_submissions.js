import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './models/Submission.js';
import DynamicSubmission from './models/DynamicSubmission.js';

dotenv.config();
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set in environment');
  process.exit(1);
}

const year1970Range = {
  $gte: new Date('1970-01-01T00:00:00.000Z'),
  $lt: new Date('1971-01-01T00:00:00.000Z'),
};

const run = async () => {
  await mongoose.connect(uri);

  const submissionQuery = {
    $or: [
      { activityDate: year1970Range },
      { submission_timestamp: year1970Range },
      { createdAt: year1970Range },
      { submission_timestamp: null },
      { submission_timestamp: { $exists: false } },
    ],
  };

  const dynamicQuery = {
    $or: [
      { submittedAt: year1970Range },
      { createdAt: year1970Range },
      { activityDate: year1970Range },
      { submittedAt: null },
      { submittedAt: { $exists: false } },
    ],
  };

  const legacyCount = await Submission.countDocuments(submissionQuery);
  const dynamicCount = await DynamicSubmission.countDocuments(dynamicQuery);

  console.log('Legacy Submission 1970 count:', legacyCount);
  console.log('DynamicSubmission 1970 count:', dynamicCount);

  if (legacyCount > 0) {
    const result = await Submission.deleteMany(submissionQuery);
    console.log('Deleted legacy submissions:', result.deletedCount);
  }

  if (dynamicCount > 0) {
    const result = await DynamicSubmission.deleteMany(dynamicQuery);
    console.log('Deleted dynamic submissions:', result.deletedCount);
  }

  if (legacyCount === 0 && dynamicCount === 0) {
    console.log('Nothing to delete');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
