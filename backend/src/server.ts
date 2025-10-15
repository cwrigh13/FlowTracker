import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import issuesRoutes from './routes/issues';
import collectionsRoutes from './routes/collections';
import usersRoutes from './routes/users';
import librariesRoutes from './routes/libraries';
import ilsRoutes from './routes/ils';
import thirdPartyRoutes from './routes/third-party';
import contactRoutes from './routes/contact';
import metricsRoutes from './routes/metrics';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/contact-attachments');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// More strict rate limiting for contact form
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 contact form submissions per hour
    message: 'Too many contact form submissions from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/libraries', librariesRoutes);
app.use('/api/ils', ilsRoutes);
app.use('/api/third-party', thirdPartyRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/metrics', metricsRoutes);

// Serve uploaded files (with authentication if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 FlowTracker server running on port ${PORT}`);
        console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔒 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
}

export default app;

