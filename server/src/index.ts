import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { connectDB } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import membershipRoutes from './routes/memberships';
import paymentRoutes from './routes/payments';
import settingsRoutes from './routes/settings';

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Middleware
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(config.uploadsDir)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Lucky Digital Library API is running', timestamp: new Date() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
async function start() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Server running at http://localhost:${config.port}`);
    console.log(`📦 Environment: ${config.nodeEnv}`);

    // Background Google Reviews sync (runs on startup + every 6 hours)
    import('./services/googleReviewsSync').then(({ syncGoogleReviews }) => {
      syncGoogleReviews().catch((e) => console.warn('Google reviews sync note:', e.message));
      setInterval(() => {
        syncGoogleReviews().catch((e) => console.warn('Google reviews periodic sync note:', e.message));
      }, 6 * 60 * 60 * 1000);
    });
  });
}

start();

export default app;
