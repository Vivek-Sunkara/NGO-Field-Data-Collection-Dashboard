import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Form from '../models/Form.js';
import Event from '../models/Event.js';
import DynamicSubmission from '../models/DynamicSubmission.js';
import DynamicDraft from '../models/DynamicDraft.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // 1. CLEAR EXISTING DATA
    await User.deleteMany({ email: { $in: ['2310080019@klh.edu.in', '2310080019aids@gmail.com', 'sindhu.j1729@gmail.com'] } });
    await Event.deleteMany({});
    await Form.deleteMany({});
    await DynamicSubmission.deleteMany({});
    await DynamicDraft.deleteMany({});

    // 2. CREATE ADMIN (Need an admin to be the creator)
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@ngo.org',
        password: hashedPassword,
        role: 'Admin',
        isVerified: true
      });
      console.log('Created new Admin user');
    }

    // 3. CREATE WORKERS
    const workerEmails = [
      '2310080019@klh.edu.in',
      '2310080019aids@gmail.com',
      'sindhu.j1729@gmail.com'
    ];

    const workers = [];
    for (const email of workerEmails) {
      let worker = await User.findOne({ email });
      if (!worker) {
        const hashedPassword = await bcrypt.hash('worker123', 10);
        worker = await User.create({
          name: email.split('@')[0],
          email: email,
          password: hashedPassword,
          role: 'Field Worker',
          isVerified: true
        });
        console.log(`Created worker: ${email}`);
      }
      workers.push(worker);
    }

    // 4. DEFINE FORMS
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const formTemplates = [
      {
        title: 'General Health Camp Report',
        fields: [
          { id: 'activityDate', label: 'Activity Date', type: 'date', required: true },
          { id: 'attendeesCount', label: 'Total Attendees', type: 'number', required: true },
          { id: 'maleCount', label: 'Male Count', type: 'number' },
          { id: 'femaleCount', label: 'Female Count', type: 'number' },
          { id: 'childrenCount', label: 'Children Count', type: 'number' },
          { id: 'servicesProvided', label: 'Services Provided', type: 'checkbox', options: ['Consultation', 'Vaccination', 'Basic Checkup', 'Specialist Review'] },
          { id: 'healthConcerns', label: 'Major Health Concerns', type: 'textarea' },
          { id: 'issuesFaced', label: 'Issues Faced', type: 'textarea' },
          { id: 'notes', label: 'General Notes', type: 'textarea' },
          { id: 'images', label: 'Upload Images', type: 'image' }
        ]
      },
      {
        title: 'Medicine Distribution Report',
        fields: [
          { id: 'medicinesDistributed', label: 'Medicines Distributed (Total)', type: 'number', required: true },
          { id: 'mostRequestedMedicine', label: 'Most Requested Medicine', type: 'text' },
          { id: 'stockShortage', label: 'Stock Shortage?', type: 'radio', options: ['Yes', 'No'] },
          { id: 'emergencyCases', label: 'Emergency Cases Handled', type: 'number' },
          { id: 'notes', label: 'Notes', type: 'textarea' },
          { id: 'images', label: 'Stock Images', type: 'image' }
        ]
      },
      {
        title: 'Farmer Training Activity Report',
        fields: [
          { id: 'farmersAttended', label: 'Farmers Attended', type: 'number', required: true },
          { id: 'trainingTopic', label: 'Training Topic', type: 'dropdown', options: ['Organic Farming', 'Pest Control', 'Irrigation Systems', 'Market Linkages'] },
          { id: 'demonstrationConducted', label: 'Field Demo Conducted?', type: 'radio', options: ['Yes', 'No'] },
          { id: 'commonProblems', label: 'Common Farming Problems', type: 'textarea' },
          { id: 'followUpActions', label: 'Follow-up Actions', type: 'textarea' },
          { id: 'images', label: 'Training Photos', type: 'image' }
        ]
      },
      {
        title: 'Crop Survey Form',
        fields: [
          { id: 'cropType', label: 'Primary Crop Type', type: 'dropdown', options: ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize'] },
          { id: 'waterAvailability', label: 'Water Availability', type: 'dropdown', options: ['Abundant', 'Sufficient', 'Scarce', 'Critical'] },
          { id: 'pestIssues', label: 'Pest Issues Observed', type: 'textarea' },
          { id: 'yieldSatisfaction', label: 'Expected Yield Satisfaction', type: 'dropdown', options: ['High', 'Moderate', 'Low'] },
          { id: 'schemeAwareness', label: 'Aware of Govt Schemes?', type: 'radio', options: ['Yes', 'No'] }
        ]
      },
      {
        title: 'Food Distribution Activity Report',
        fields: [
          { id: 'familiesServed', label: 'Families Served', type: 'number', required: true },
          { id: 'foodPacketsDistributed', label: 'Food Packets Distributed', type: 'number', required: true },
          { id: 'childrenBenefited', label: 'Children Benefited', type: 'number' },
          { id: 'distributionIssues', label: 'Distribution Issues', type: 'textarea' },
          { id: 'supportRequested', label: 'Additional Support Requested', type: 'textarea' },
          { id: 'images', label: 'Distribution Photos', type: 'image' }
        ]
      },
      {
        title: 'Volunteer Coordination Report',
        fields: [
          { id: 'volunteersPresent', label: 'Volunteers Present', type: 'number', required: true },
          { id: 'crowdManagementDifficulty', label: 'Crowd Management Difficulty', type: 'dropdown', options: ['Easy', 'Manageable', 'Difficult', 'Chaos'] },
          { id: 'shortageOfVolunteers', label: 'Shortage of Volunteers?', type: 'radio', options: ['Yes', 'No'] },
          { id: 'additionalSupportNeeded', label: 'Additional Support Needed', type: 'textarea' }
        ]
      },
      {
        title: 'Workshop Attendance & Feedback',
        fields: [
          { id: 'participantsCount', label: 'Total Participants', type: 'number', required: true },
          { id: 'skillTopic', label: 'Skill Topic', type: 'dropdown', options: ['Tailoring', 'Computer Literacy', 'Handicrafts', 'Food Processing'] },
          { id: 'handsOnSession', label: 'Hands-on Session Included?', type: 'radio', options: ['Yes', 'No'] },
          { id: 'interestLevel', label: 'Interest Level', type: 'dropdown', options: ['Very High', 'High', 'Moderate', 'Low'] },
          { id: 'requestedTrainings', label: 'Requested Future Trainings', type: 'textarea' },
          { id: 'trainerFeedback', label: 'Trainer Feedback', type: 'textarea' }
        ]
      }
    ];

    // 5. CREATE EVENTS & FORMS
    const eventData = [
      {
        name: 'Rural Health Camp 2026',
        description: 'Comprehensive health checkup and medicine distribution in rural areas.',
        formTitles: ['General Health Camp Report', 'Medicine Distribution Report']
      },
      {
        name: 'Smart Farming Awareness Drive',
        description: 'Training farmers on modern techniques and surveying crop conditions.',
        formTitles: ['Farmer Training Activity Report', 'Crop Survey Form']
      },
      {
        name: 'Community Food Relief Initiative',
        description: 'Distributing food packets to families in need and coordinating volunteers.',
        formTitles: ['Food Distribution Activity Report', 'Volunteer Coordination Report']
      },
      {
        name: 'Women Skill Empowerment Workshop',
        description: 'Skill development workshop for women to promote self-reliance.',
        formTitles: ['Workshop Attendance & Feedback']
      }
    ];

    let insertedEventsCount = 0;
    let insertedFormsCount = 0;
    const mapping = [];

    for (const e of eventData) {
      // Create Event First
      const event = new Event({
        name: e.name,
        description: e.description,
        createdBy: admin._id,
        status: 'active',
        // Randomly assign 1 or 2 workers to each event
        assignedWorkers: workers
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 2) + 1)
          .map(w => ({ workerId: w._id }))
      });
      await event.save();
      insertedEventsCount++;

      // Create Forms for this event
      for (const title of e.formTitles) {
        const template = formTemplates.find(t => t.title === title);
        if (template) {
          const form = await Form.create({
            title: template.title,
            fields: template.fields,
            eventId: event._id,
            expiryDate: expiryDate,
            createdBy: admin._id,
            status: 'active'
          });
          
          // Link form to event
          event.forms.push({ formId: form._id });
          insertedFormsCount++;
        }
      }
      await event.save();
      
      mapping.push({
        event: event.name,
        workers: event.assignedWorkers.map(aw => {
          const w = workers.find(work => work._id.toString() === aw.workerId.toString());
          return w ? w.email : 'Unknown';
        })
      });
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log(`Inserted Workers: ${workers.length}`);
    console.log(`Inserted Events: ${insertedEventsCount}`);
    console.log(`Inserted Forms: ${insertedFormsCount}`);
    console.log('\nWorker-Event Mapping:');
    mapping.forEach(m => {
      console.log(`- ${m.event}: [${m.workers.join(', ')}]`);
    });

    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
