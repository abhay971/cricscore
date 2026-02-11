import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
// Rate limiters are still available for specific routes (match creation, scorer login, etc.)
// import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting disabled - many concurrent viewers expected
// app.use('/api/', apiLimiter);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cricscore');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Initialize Socket.io handlers
import { initializeSocketHandlers } from './socket/index.js';
initializeSocketHandlers(io);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CricScore API is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import tournamentRoutes from './routes/tournaments.js';
import matchRoutes from './routes/matches.js';
import scorerRoutes from './routes/scorer.js';

// Use routes
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/tournaments', matchRoutes); // Nested under tournaments for match creation
app.use('/api/matches', matchRoutes); // Direct access for match queries
app.use('/api/scorer', scorerRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler (must be last)
app.use(notFoundHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready for connections`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Export io for use in route handlers
export { io };
