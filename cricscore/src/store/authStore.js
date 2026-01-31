import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import socket from '../services/socket';

/**
 * Auth Store - Manages scorer authentication
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      scorerToken: null,
      matchId: null,
      tournamentId: null,
      isTournamentScorer: false,
      isAuthenticated: false,
      isAuthenticating: false,
      error: null,

      // Actions
      setToken: (token, matchId) => {
        set({
          scorerToken: token,
          matchId,
          isAuthenticated: true,
          error: null
        });
      },

      // Login as tournament-scoped scorer
      loginAsScorer: (token, tournamentId) => {
        set({
          scorerToken: token,
          tournamentId,
          isTournamentScorer: true,
          isAuthenticated: true,
          error: null
        });
      },

      clearToken: () => {
        set({
          scorerToken: null,
          matchId: null,
          tournamentId: null,
          isTournamentScorer: false,
          isAuthenticated: false,
          error: null
        });
      },

      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },

      // Authenticate scorer with token
      authenticateScorer: async (token, matchId) => {
        set({ isAuthenticating: true, error: null });

        try {
          // Validate token with API
          const response = await api.validateScorerToken(token);

          // Authenticate with Socket.io
          socket.authenticateScorer(matchId, token);

          // Wait for socket auth confirmation
          return new Promise((resolve, reject) => {
            socket.onScorerAuthSuccess((data) => {
              set({
                scorerToken: token,
                matchId: data.matchId,
                isAuthenticated: true,
                isAuthenticating: false,
                error: null
              });
              resolve(true);
            });

            socket.onScorerAuthFailed((data) => {
              set({
                error: data.message,
                isAuthenticating: false,
                isAuthenticated: false
              });
              reject(new Error(data.message));
            });

            // Timeout after 10 seconds
            setTimeout(() => {
              if (get().isAuthenticating) {
                set({
                  error: 'Authentication timeout',
                  isAuthenticating: false
                });
                reject(new Error('Authentication timeout'));
              }
            }, 10000);
          });
        } catch (error) {
          set({
            error: error.message,
            isAuthenticating: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      // Logout scorer
      logout: () => {
        set({
          scorerToken: null,
          matchId: null,
          tournamentId: null,
          isTournamentScorer: false,
          isAuthenticated: false,
          error: null
        });
      },

      // Get token for API requests
      getToken: () => get().scorerToken
    }),
    {
      name: 'cricscore-auth', // localStorage key
      partialize: (state) => ({
        scorerToken: state.scorerToken,
        matchId: state.matchId,
        tournamentId: state.tournamentId,
        isTournamentScorer: state.isTournamentScorer,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
