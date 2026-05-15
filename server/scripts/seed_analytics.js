import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Form from '../models/Form.js';
import Event from '../models/Event.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import DynamicDraft from '../models/DynamicDraft.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const LOCATIONS = [
  { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Karimnagar'], villages: ['Hasanparthy', 'Ghatkesar'] },
  { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru'], villages: ['Madhapur'] },
  { state: 'Maharashtra', cities: ['Pune', 'Nagpur'], villages: ['Kothapet'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore'], villages: ['Jubilee Hills'] }
];

const ISSUES = [
  'Medicine shortage due to logistics',
  'Low attendance caused by local festival',
  'Heavy rain disrupted the second half of the day',
  'Transport delay for supplies',
  'Volunteer shortage for crowd management',
  'Farmers concerned about rising fertilizer costs',
  'Acute water shortage affecting crop yield'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateResponses = (fields) => {
  const responses = {};
  fields.forEach(field => {
    switch (field.type) {
      case 'number':
        responses[field.id] = Math.floor(Math.random() * 100) + 1;
        break;
      case 'text':
        responses[field.id] = `Sample ${field.label} Data`;
        break;
      case 'textarea':
        if (field.id === 'healthConcerns') responses[field.id] = getRandom(['High diabetes cases among elderly', 'Several children showed signs of malnutrition', 'Common complaints of seasonal flu']);
        else if (field.id === 'issuesFaced' || field.id === 'distributionIssues') responses[field.id] = getRandom(ISSUES);
        else responses[field.id] = `Detailed report for ${field.label}. Everything was handled according to protocol.`;
        break;
      case 'dropdown':
      case 'radio':
        if (field.options && field.options.length > 0) responses[field.id] = getRandom(field.options);
        break;
      case 'checkbox':
        if (field.options && field.options.length > 0) {
          const count = Math.floor(Math.random() * field.options.length) + 1;
          responses[field.id] = field.options.slice(0, count);
        }
        break;
      case 'date':
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 30));
        responses[field.id] = d.toISOString().split('T')[0];
        break;
      case 'image':
        const filenames = [
          'photo_2026-01-09_19-44-27.jpg',
          'photo_2026-05-15_17-00-10.jpg',
          'photo_2026-05-15_17-00-33.jpg',
          'photo_2026-05-15_17-00-42.jpg'
        ];
        responses[field.id] = filenames.slice(0, 2).map(f => `http://localhost:5000/uploads/${f}`);
        break;
      default:
        responses[field.id] = 'N/A';
    }
  });
  return responses;
};

const seedAnalytics = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for analytics seeding...');

    // Clear existing submissions/drafts to start fresh for demo
    await DynamicSubmission.deleteMany({});
    await DynamicDraft.deleteMany({});

    const workers = await User.find({ role: 'Field Worker' });
    const events = await Event.find({ status: 'active' }).populate('forms.formId');

    if (workers.length === 0 || events.length === 0) {
      console.log('Error: No workers or events found. Please run seed.js first.');
      process.exit(1);
    }

    let submissionCount = 0;
    let draftCount = 0;
    let expiredCount = 0;
    
    const workerStats = {};
    const eventStats = {};

    const targetSubmissions = 30;

    for (let i = 0; i < targetSubmissions; i++) {
      const event = getRandom(events);
      
      // Only pick workers assigned to this event
      const assignedWorkerIds = event.assignedWorkers.map(aw => aw.workerId.toString());
      const eligibleWorkers = workers.filter(w => assignedWorkerIds.includes(w._id.toString()));
      
      if (eligibleWorkers.length === 0) continue;
      
      const worker = getRandom(eligibleWorkers);
      const formItem = getRandom(event.forms);
      const form = formItem.formId;

      if (!form) continue;

      const locationData = getRandom(LOCATIONS);
      const city = getRandom(locationData.cities);
      const village = Math.random() > 0.3 ? getRandom(locationData.villages) : '';

      const location = {
        state: locationData.state,
        city: city,
        village: village
      };

      const rand = Math.random();
      
      if (rand < 0.7) {
        // Create Submission
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 14));

        await DynamicSubmission.create({
          formId: form._id,
          eventId: event._id,
          workerId: worker._id,
          workerName: worker.name,
          workerRole: worker.role,
          responses: generateResponses(form.fields),
          location,
          activityDate,
          status: 'submitted',
          submittedAt: new Date(activityDate.getTime() + 3600000), // Submitted 1 hour after activity
          ipAddress: '192.168.1.' + (10 + i),
          deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Demo/1.0'
        });
        submissionCount++;
        
        eventStats[event.name] = (eventStats[event.name] || 0) + 1;
        workerStats[worker.email] = (workerStats[worker.email] || 0) + 1;

      } else if (rand < 0.85) {
        // Create Draft
        await DynamicDraft.create({
          formId: form._id,
          eventId: event._id,
          workerId: worker._id,
          workerName: worker.name,
          workerRole: worker.role,
          responses: generateResponses(form.fields.slice(0, 3)), // Partial responses for draft
          location,
          activityDate: new Date(),
          completionPercentage: 40
        });
        draftCount++;
      } else {
        // Create Expired (Simulation)
        // In this system, expired just means past date and no submission, but we'll mark some as expired status for analytics demo
        await DynamicSubmission.create({
          formId: form._id,
          eventId: event._id,
          workerId: worker._id,
          workerName: worker.name,
          workerRole: worker.role,
          responses: {},
          location,
          activityDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          status: 'expired',
          submittedAt: null
        });
        expiredCount++;
      }
    }

    console.log('\n--- ANALYTICS SEEDING COMPLETE ---');
    console.log(`Total Submissions: ${submissionCount}`);
    console.log(`Total Drafts: ${draftCount}`);
    console.log(`Total Expired: ${expiredCount}`);
    console.log(`Total Pending (Implicit): ${targetSubmissions - submissionCount - draftCount - expiredCount}`);

    console.log('\nSubmissions Per Worker:');
    Object.entries(workerStats).forEach(([email, count]) => {
      console.log(`- ${email}: ${count}`);
    });

    console.log('\nSubmissions Per Event:');
    Object.entries(eventStats).forEach(([name, count]) => {
      console.log(`- ${name}: ${count}`);
    });

    process.exit();
  } catch (error) {
    console.error('Analytics seeding failed:', error);
    process.exit(1);
  }
};

seedAnalytics();
