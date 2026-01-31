import { Match } from '../models/index.js';
import { verifyScorerToken } from '../middleware/auth.js';

/**
 * Socket.io event handlers for scorer operations
 */

export const setupScorerHandlers = (io, socket) => {
  /**
   * Authenticate scorer with token
   */
  socket.on('scorer:auth', async (data) => {
    try {
      const { matchId, token } = data;

      if (!token || !matchId) {
        socket.emit('scorer:auth:failed', {
          message: 'Token and match ID required'
        });
        return;
      }

      // Verify token
      const decoded = verifyScorerToken(token);
      if (!decoded) {
        socket.emit('scorer:auth:failed', {
          message: 'Invalid token'
        });
        return;
      }

      // Verify match exists
      const match = await Match.findOne({ matchId });
      if (!match) {
        socket.emit('scorer:auth:failed', {
          message: 'Match not found'
        });
        return;
      }

      // Tournament-scoped scorer: verify match belongs to the tournament
      if (decoded.role === 'tournament_scorer') {
        if (match.tournamentId !== decoded.tournamentId) {
          socket.emit('scorer:auth:failed', {
            message: 'Token does not match this match'
          });
          return;
        }
      } else if (decoded.matchId !== matchId || !match.verifyToken(token)) {
        // Existing per-match token verification
        socket.emit('scorer:auth:failed', {
          message: 'Token does not match this match'
        });
        return;
      }

      // Join scorer room
      socket.join(`scorer:${matchId}`);
      socket.scorerMatchId = matchId;
      socket.isScorer = true;

      console.log(`🏏 Scorer authenticated for match:${matchId}`);

      socket.emit('scorer:auth:success', {
        matchId,
        message: 'Scorer authenticated successfully'
      });
    } catch (error) {
      console.error('Scorer authentication error:', error);
      socket.emit('scorer:auth:failed', {
        message: 'Authentication failed'
      });
    }
  });

  /**
   * Scorer heartbeat to check connection
   */
  socket.on('scorer:heartbeat', () => {
    if (socket.isScorer && socket.scorerMatchId) {
      socket.emit('scorer:heartbeat:ack', {
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Scorer disconnect notification
   */
  socket.on('scorer:disconnect', () => {
    if (socket.scorerMatchId) {
      console.log(`🏏 Scorer disconnected from match:${socket.scorerMatchId}`);
      socket.leave(`scorer:${socket.scorerMatchId}`);
      socket.isScorer = false;
      socket.scorerMatchId = null;
    }
  });

  /**
   * Notify scorer of ball recorded confirmation
   */
  socket.on('scorer:ball:confirm', (data) => {
    if (socket.isScorer && socket.scorerMatchId) {
      socket.emit('scorer:ball:confirmed', data);
    }
  });
};

/**
 * Notify scorer of action result
 */
export const notifyScorer = (io, matchId, actionType, result) => {
  io.to(`scorer:${matchId}`).emit('scorer:action:result', {
    action: actionType,
    result,
    timestamp: new Date().toISOString()
  });
};

/**
 * Notify scorer of error
 */
export const notifyScorerError = (io, matchId, error) => {
  io.to(`scorer:${matchId}`).emit('scorer:error', {
    error,
    timestamp: new Date().toISOString()
  });
};

/**
 * Check if scorer is connected
 */
export const isScorerConnected = async (io, matchId) => {
  const room = io.sockets.adapter.rooms.get(`scorer:${matchId}`);
  return room && room.size > 0;
};

export default {
  setupScorerHandlers,
  notifyScorer,
  notifyScorerError,
  isScorerConnected
};
