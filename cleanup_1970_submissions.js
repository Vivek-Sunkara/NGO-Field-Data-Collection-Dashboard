import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './server/models/Submission.js';

dotenv.config();
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set in environment');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri);
  const query = {
    submissionDate: {
      $gte: new Date('1970-01-01T00:00:00.000Z'),
      $lt: new Date('1971-01-01T00:00:00.000Z'),
    },
  };
  const count = await Submission.countDocuments(query);
  console.log('1970 submissions count:', count);
  if (count > 0) {
    const result = await Submission.deleteMany(query);
    console.log('Deleted documents:', result.deletedCount);
  } else {
    console.log('Nothing to delete');
  }
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
