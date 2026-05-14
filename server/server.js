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
const { errorHandler, notFound } = await import('./middleware/errorHandler.js');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

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
