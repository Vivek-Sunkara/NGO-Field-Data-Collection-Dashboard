import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DynamicDraft from './models/DynamicDraft.js';
import DynamicSubmission from './models/DynamicSubmission.js';
import Event from './models/Event.js';
import User from './models/User.js';

const envPath = './.env';
dotenv.config({ path: envPath });

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not found.');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const submittedFormWorkers = await DynamicSubmission.aggregate([
    { $group: { _id: { formId: '$formId', workerId: '$workerId' } } },
  ]);

  const submittedPairs = new Set(
    submittedFormWorkers.map(item => `${item._id.formId}:${item._id.workerId}`)
  );

  const draftDocs = await DynamicDraft.find().populate('workerId', 'name email');
  const draftPairs = new Set(
    draftDocs.map(item => `${item.formId}:${item.workerId}`)
  );

  const allAssignments = await Event.aggregate([
    {
      $lookup: {
        from: 'forms',
        localField: 'forms.formId',
        foreignField: '_id',
        as: 'formList',
      },
    },
    { $unwind: '$formList' },
    { $unwind: '$assignedWorkers' },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedWorkers.workerId',
        foreignField: '_id',
        as: 'worker',
      },
    },
    { $unwind: '$worker' },
    {
      $project: {
        formId: '$formList._id',
        formTitle: '$formList.title',
        expiryDate: '$formList.expiryDate',
        workerId: '$worker._id',
        workerName: '$worker.name',
        workerEmail: '$worker.email',
        eventId: '$_id',
        eventName: '$name',
      },
    },
  ]);

  const pending = allAssignments.filter(assignment => {
    const pair = `${assignment.formId}:${assignment.workerId}`;
    return !submittedPairs.has(pair) && !draftPairs.has(pair);
  });

  console.log('totalDrafts=', draftDocs.length);
  console.log('submittedPairs=', submittedPairs.size);
  console.log('pendingAssignments=', pending.length);

  console.log('---- draft entries ----');
  draftDocs.forEach((d, idx) => {
    console.log(
      `${idx + 1}. formId=${d.formId} worker=${d.workerId?.name || 'unknown'} workerId=${d.workerId?._id || d.workerId} email=${d.workerId?.email || 'unknown'} eventId=${d.eventId}`
    );
  });

  console.log('---- pending entries ----');
  pending.forEach((p, idx) => {
    console.log(
      `${idx + 1}. event=${p.eventName} eventId=${p.eventId} form=${p.formTitle} formId=${p.formId} worker=${p.workerName} workerId=${p.workerId} email=${p.workerEmail}`
    );
  });

  await mongoose.disconnect();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
