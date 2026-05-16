import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Dynamically import other modules after dotenv is configured
const express = (await import('express')).default;
const cors = (await import('cors')).default;
const connectDB = (await import('./config/database.js')).default;
const authRoutes = (await import('./routes/auth.js')).default;
const submissionRoutes = (await import('./routes/submissions.js')).default;
const dynamicFormRoutes = (await import('./routes/dynamicForms.js')).default;
const adminRoutes = (await import('./routes/admin.js')).default;
const aiAnalysisRoutes = (await import('./routes/aiAnalysis.js')).default;
const translationRoutes = (await import('./routes/translation.js')).default;
const analyticsRoutes = (await import('./routes/analytics.js')).default;
const upload = (await import('./middleware/upload.js')).default;
const { errorHandler, notFound } = await import('./middleware/errorHandler.js');
const { initializeMailer } = await import('./services/mailService.js');
const { initializeCronJobs } = await import('./services/reminderService.js');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/forms', dynamicFormRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiAnalysisRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Image Upload Route
app.post('/api/upload', upload.array('images', 10), (req, res) => {
  try {
    const files = req.files.map(file => ({
      name: file.originalname,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    }));
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/exports', express.static(path.join(__dirname, 'public', 'exports')));

// Initialize services
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  initializeMailer();
  console.log('Email service initialized');
}

// Initialize cron jobs
initializeCronJobs();
console.log('Cron jobs initialized');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
