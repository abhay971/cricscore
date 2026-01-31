import { create } from 'zustand';
import api from '../services/api';
import socket from '../services/socket';

/**
 * Match Store - Manages current match state
 */
const useMatchStore = create((set, get) => ({
  // State
  match: null,
  currentInnings: null,
  allInnings: [],
  recentBalls: [],
  commentary: [],
  loading: false,
  error: null,
  connected: false,

  // Actions
  setMatch: (match) => set({ match }),

  setCurrentInnings: (innings) => set({ currentInnings: innings }),

  setAllInnings: (innings) => set({ allInnings: innings }),

  addRecentBall: (ball) => set((state) => ({
    recentBalls: [ball, ...state.recentBalls].slice(0, 20)
  })),

  setRecentBalls: (balls) => set({ recentBalls: balls }),

  addCommentary: (commentary) => set((state) => ({
    commentary: [
      {
        text: commentary,
        timestamp: new Date().toISOString()
      },
      ...state.commentary
    ].slice(0, 50)
  })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setConnected: (connected) => set({ connected }),

  // Fetch match data
  fetchMatch: async (matchId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getMatch(matchId);
      set({
        match: response.data.match,
        allInnings: response.data.innings,
        currentInnings: response.data.innings[response.data.match.currentInnings - 1],
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch ball history
  fetchBalls: async (matchId, filters = {}) => {
    try {
      const response = await api.getMatchBalls(matchId, filters);
      set({ recentBalls: response.data.balls });
    } catch (error) {
      console.error('Failed to fetch balls:', error);
    }
  },

  // Connect to match via WebSocket
  connectToMatch: (matchId) => {
    const state = get();
    if (state.connected) return;

    socket.connect();
    socket.joinMatch(matchId);
    socket.subscribeToLiveUpdates(matchId);

    // Set up event listeners
    socket.onMatchJoined((data) => {
      set({
        match: data.match,
        allInnings: data.innings,
        currentInnings: data.innings[data.match.currentInnings - 1],
        recentBalls: data.recentBalls || [],
        connected: true
      });
    });

    socket.onScoreUpdate((data) => {
      set({
        currentInnings: data.innings,
        match: data.match
      });
    });

    socket.onNewBall((ball) => {
      get().addRecentBall(ball);
    });

    socket.onNewCommentary((data) => {
      get().addCommentary(data.commentary);
    });

    socket.onInningsEnd((data) => {
      set((state) => ({
        allInnings: [...state.allInnings, data.innings]
      }));
    });

    socket.onMatchEnd((data) => {
      set({ match: data.match });
    });

    socket.onMatchState((data) => {
      set({
        match: data.match,
        currentInnings: data.currentInnings,
        allInnings: data.allInnings,
        recentBalls: data.recentBalls
      });
    });
  },

  // Disconnect from match
  disconnectFromMatch: (matchId) => {
    socket.leaveMatch(matchId);
    socket.unsubscribeFromLiveUpdates(matchId);
    set({ connected: false });
  },

  // Reset store
  reset: () => set({
    match: null,
    currentInnings: null,
    allInnings: [],
    recentBalls: [],
    commentary: [],
    loading: false,
    error: null,
    connected: false
  })
}));

export default useMatchStore;
