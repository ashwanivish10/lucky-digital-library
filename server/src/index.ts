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
import messageRoutes from './routes/messages';

const app = express();

// Render and other hosts sit behind a proxy. This lets rate limits see the real visitor.
app.set('trust proxy', 1);

if (config.nodeEnv === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Set JWT_SECRET to a random string of at least 32 characters before starting in production.');
}

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  // The public site and admin run on another origin and must be allowed to read API responses.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// --- CORS Configuration (supports local dev and Vercel deployments) ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://lucky-digital-library.vercel.app',
  config.clientUrl,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow configured origins or any Vercel preview domain
    const ngrokHost = /^https:\/\/[a-z0-9-]+\.(ngrok-free\.app|ngrok-free\.dev|ngrok\.io|ngrok\.app|ngrok\.dev)$/i;
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || ngrokHost.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
app.use('/auth', authLimiter);
app.use('/api', generalLimiter);

// Middleware
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files (uploads)
app.use('/uploads', express.static(path.resolve(config.uploadsDir)));

// Primary API Routes (standard /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/messages', messageRoutes);

// Fallback Routes (handles clients calling without /api prefix)
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/memberships', membershipRoutes);
app.use('/payments', paymentRoutes);
app.use('/settings', settingsRoutes);
app.use('/messages', messageRoutes);

// Health check endpoints
app.get(['/api/health', '/health', '/'], (_req, res) => {
  res.json({ success: true, message: 'Lucky Digital Library API is running', timestamp: new Date() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
async function start() {
  await connectDB();

  // Listen on 0.0.0.0 and use PORT environment variable (required for Render)
  const PORT = Number(process.env.PORT) || config.port || 5000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
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
