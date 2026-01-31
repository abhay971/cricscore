import { create } from 'zustand';
import api from '../services/api';

/**
 * Tournament Store - Manages tournament state
 */
const useTournamentStore = create((set, get) => ({
  // State
  currentTournament: null,
  tournaments: [],
  tournamentMatches: [],
  loading: false,
  error: null,

  // Actions
  setCurrentTournament: (tournament) => set({ currentTournament: tournament }),

  setTournaments: (tournaments) => set({ tournaments }),

  setTournamentMatches: (matches) => set({ tournamentMatches: matches }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // Create tournament
  createTournament: async (tournamentData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createTournament(tournamentData);
      set({
        currentTournament: response.data.tournament,
        loading: false
      });
      return response.data.tournament;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch tournament
  fetchTournament: async (tournamentId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getTournament(tournamentId);
      set({
        currentTournament: response.data.tournament,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch tournament matches
  fetchTournamentMatches: async (tournamentId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getTournamentMatches(tournamentId);
      set({
        currentTournament: response.data.tournament,
        tournamentMatches: response.data.matches,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch all tournaments
  fetchAllTournaments: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getAllTournaments(filters);
      set({
        tournaments: response.data.tournaments,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Update tournament
  updateTournament: async (tournamentId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await api.updateTournament(tournamentId, updates);
      set({
        currentTournament: response.data.tournament,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Create match in tournament
  createMatch: async (tournamentId, matchData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createMatch(tournamentId, matchData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reset store
  reset: () => set({
    currentTournament: null,
    tournaments: [],
    tournamentMatches: [],
    loading: false,
    error: null
  })
}));

export default useTournamentStore;
