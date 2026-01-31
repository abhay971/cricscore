import { useEffect, useCallback } from 'react';
import socketService from '../services/socket';

/**
 * useWebSocket Hook
 * Manages WebSocket connection and event subscriptions for a match
 */
export const useWebSocket = (matchId, callbacks = {}) => {
  const {
    onMatchUpdate,
    onScoreUpdate,
    onNewBall,
    onNewCommentary,
    onInningsEnd,
    onMatchEnd,
    onMatchJoined,
    onMatchState
  } = callbacks;

  // Connect to socket on mount
  useEffect(() => {
    socketService.connect();

    return () => {
      // Cleanup handled per match
    };
  }, []);

  // Join match room
  useEffect(() => {
    if (!matchId) return;

    console.log(`🔌 Joining match: ${matchId}`);
    socketService.joinMatch(matchId);
    socketService.subscribeToLiveUpdates(matchId);

    return () => {
      console.log(`🔌 Leaving match: ${matchId}`);
      socketService.leaveMatch(matchId);
      socketService.unsubscribeFromLiveUpdates(matchId);
    };
  }, [matchId]);

  // Subscribe to match events
  useEffect(() => {
    if (!matchId) return;

    const handlers = [];

    if (onMatchUpdate) {
      socketService.onMatchUpdate(onMatchUpdate);
      handlers.push({ event: 'match:update', callback: onMatchUpdate });
    }

    if (onScoreUpdate) {
      socketService.onScoreUpdate(onScoreUpdate);
      handlers.push({ event: 'score:update', callback: onScoreUpdate });
    }

    if (onNewBall) {
      socketService.onNewBall(onNewBall);
      handlers.push({ event: 'ball:new', callback: onNewBall });
    }

    if (onNewCommentary) {
      socketService.onNewCommentary(onNewCommentary);
      handlers.push({ event: 'commentary:new', callback: onNewCommentary });
    }

    if (onInningsEnd) {
      socketService.onInningsEnd(onInningsEnd);
      handlers.push({ event: 'innings:end', callback: onInningsEnd });
    }

    if (onMatchEnd) {
      socketService.onMatchEnd(onMatchEnd);
      handlers.push({ event: 'match:end', callback: onMatchEnd });
    }

    if (onMatchJoined) {
      socketService.onMatchJoined(onMatchJoined);
      handlers.push({ event: 'match:joined', callback: onMatchJoined });
    }

    if (onMatchState) {
      socketService.onMatchState(onMatchState);
      handlers.push({ event: 'match:state', callback: onMatchState });
    }

    // Cleanup listeners on unmount
    return () => {
      handlers.forEach(({ event, callback }) => {
        socketService.off(event, callback);
      });
    };
  }, [
    matchId,
    onMatchUpdate,
    onScoreUpdate,
    onNewBall,
    onNewCommentary,
    onInningsEnd,
    onMatchEnd,
    onMatchJoined,
    onMatchState
  ]);

  // Request initial match state
  const requestMatchState = useCallback(() => {
    if (!matchId) return;
    socketService.requestMatchState(matchId);
  }, [matchId]);

  return {
    isConnected: socketService.isConnected(),
    requestMatchState
  };
};

/**
 * useWebSocketScorer Hook
 * Extended hook for scorer-specific functionality
 */
export const useWebSocketScorer = (matchId, token, callbacks = {}) => {
  const baseCallbacks = useWebSocket(matchId, callbacks);

  // Authenticate scorer
  useEffect(() => {
    if (!matchId || !token) return;

    console.log(`🔐 Authenticating scorer for match: ${matchId}`);
    socketService.authenticateScorer(matchId, token);

    // Set up heartbeat
    const heartbeatInterval = setInterval(() => {
      socketService.scorerHeartbeat();
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [matchId, token]);

  // Listen to auth events
  useEffect(() => {
    if (!matchId) return;

    const handleAuthSuccess = (data) => {
      console.log('✅ Scorer authenticated:', data);
      if (callbacks.onScorerAuthSuccess) {
        callbacks.onScorerAuthSuccess(data);
      }
    };

    const handleAuthFailed = (error) => {
      console.error('❌ Scorer auth failed:', error);
      if (callbacks.onScorerAuthFailed) {
        callbacks.onScorerAuthFailed(error);
      }
    };

    socketService.onScorerAuthSuccess(handleAuthSuccess);
    socketService.onScorerAuthFailed(handleAuthFailed);

    return () => {
      socketService.off('scorer:auth:success', handleAuthSuccess);
      socketService.off('scorer:auth:failed', handleAuthFailed);
    };
  }, [matchId, callbacks]);

  return baseCallbacks;
};

export default useWebSocket;
