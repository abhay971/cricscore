import { Match, Innings, Ball } from '../models/index.js';
import { verifyScorerToken } from '../middleware/auth.js';

/**
 * Socket.io event handlers for match operations
 */

export const setupMatchHandlers = (io, socket) => {
  /**
   * Join match room as viewer
   */
  socket.on('match:join', async (data) => {
    try {
      const { matchId } = data;

      if (!matchId) {
        socket.emit('error', { message: 'Match ID required' });
        return;
      }

      // Verify match exists
      const match = await Match.findOne({ matchId });
      if (!match) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }

      // Join room
      socket.join(`match:${matchId}`);
      console.log(`👥 Socket ${socket.id} joined match:${matchId}`);

      // Send current match state
      const innings = await Innings.find({ matchId }).sort({ inningsNumber: 1 });
      const recentBalls = await Ball.find({ matchId })
        .sort({ createdAt: -1 })
        .limit(20);

      socket.emit('match:joined', {
        match,
        innings,
        recentBalls: recentBalls.reverse()
      });
    } catch (error) {
      console.error('Error joining match:', error);
      socket.emit('error', { message: 'Failed to join match' });
    }
  });

  /**
   * Leave match room
   */
  socket.on('match:leave', (data) => {
    const { matchId } = data;
    socket.leave(`match:${matchId}`);
    console.log(`👋 Socket ${socket.id} left match:${matchId}`);
  });

  /**
   * Get live match updates
   */
  socket.on('match:subscribe', async (data) => {
    const { matchId } = data;
    socket.join(`match:${matchId}:live`);
    console.log(`📡 Socket ${socket.id} subscribed to live updates for match:${matchId}`);
  });

  /**
   * Unsubscribe from live updates
   */
  socket.on('match:unsubscribe', (data) => {
    const { matchId } = data;
    socket.leave(`match:${matchId}:live`);
  });

  /**
   * Request current match state
   */
  socket.on('match:getState', async (data) => {
    try {
      const { matchId } = data;

      const match = await Match.findOne({ matchId });
      if (!match) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }

      const innings = await Innings.find({ matchId }).sort({ inningsNumber: 1 });
      const currentInnings = innings[match.currentInnings - 1];
      const recentBalls = await Ball.find({
        matchId,
        inningsNumber: match.currentInnings
      })
        .sort({ createdAt: -1 })
        .limit(6);

      socket.emit('match:state', {
        match,
        currentInnings,
        allInnings: innings,
        recentBalls: recentBalls.reverse()
      });
    } catch (error) {
      console.error('Error getting match state:', error);
      socket.emit('error', { message: 'Failed to get match state' });
    }
  });
};

/**
 * Broadcast match update to all viewers
 */
export const broadcastMatchUpdate = (io, matchId, updateType, data) => {
  io.to(`match:${matchId}`).emit('match:update', {
    type: updateType,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Broadcast score update
 */
export const broadcastScoreUpdate = (io, matchId, scoreData) => {
  io.to(`match:${matchId}`).emit('score:update', {
    ...scoreData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Broadcast new ball
 */
export const broadcastNewBall = (io, matchId, ballData) => {
  io.to(`match:${matchId}`).emit('ball:new', {
    ...ballData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Broadcast commentary
 */
export const broadcastCommentary = (io, matchId, commentary) => {
  io.to(`match:${matchId}`).emit('commentary:new', {
    commentary,
    timestamp: new Date().toISOString()
  });
};

/**
 * Broadcast innings end
 */
export const broadcastInningsEnd = (io, matchId, inningsData) => {
  io.to(`match:${matchId}`).emit('innings:end', {
    ...inningsData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Broadcast match end
 */
export const broadcastMatchEnd = (io, matchId, matchResult) => {
  io.to(`match:${matchId}`).emit('match:end', {
    ...matchResult,
    timestamp: new Date().toISOString()
  });
};

export default {
  setupMatchHandlers,
  broadcastMatchUpdate,
  broadcastScoreUpdate,
  broadcastNewBall,
  broadcastCommentary,
  broadcastInningsEnd,
  broadcastMatchEnd
};
