import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import dotenv from 'dotenv';
dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const workers = await User.find({
    email: { $in: ['2310080019@klh.edu.in', '2310080019aids@gmail.com', 'sindhu.j1729@gmail.com'] }
  });
  
  console.log('--- Workers found in DB ---');
  workers.forEach(w => console.log(`${w.email}: ${w._id}`));
  
  const events = await Event.find({ status: 'active' }).populate('forms.formId');
  console.log('\n--- Active Events & Forms ---');
  events.forEach(e => {
    console.log(`Event: ${e.name}`);
    console.log(`Workers assigned: ${e.assignedWorkers.map(aw => aw.workerId).join(', ')}`);
    console.log(`Forms assigned: ${e.forms.map(f => f.formId ? f.formId.title : 'MISSING FORM').join(', ')}`);
  });
  
  process.exit();
};

check();
