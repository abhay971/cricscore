import { setupMatchHandlers } from './matchHandler.js';
import { setupScorerHandlers } from './scorerHandler.js';

/**
 * Initialize all Socket.io handlers
 */
export const initializeSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Setup handlers
    setupMatchHandlers(io, socket);
    setupScorerHandlers(io, socket);

    // Global error handler
    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.id}:`, error);
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
  });
};

// Re-export all broadcast functions
export * from './matchHandler.js';
export * from './scorerHandler.js';
