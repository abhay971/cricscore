/**
 * API Service
 * Handles all HTTP requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Tournament endpoints
  async createTournament(tournamentData, adminSecret) {
    return this.request('/tournaments', {
      method: 'POST',
      headers: {
        'x-admin-secret': adminSecret
      },
      body: JSON.stringify(tournamentData)
    });
  }

  async getTournament(tournamentId) {
    return this.request(`/tournaments/${tournamentId}`);
  }

  async getTournamentMatches(tournamentId) {
    return this.request(`/tournaments/${tournamentId}/matches`);
  }

  async updateTournament(tournamentId, updates) {
    return this.request(`/tournaments/${tournamentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async getAllTournaments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/tournaments?${params}`);
  }

  // Match endpoints
  async createMatch(tournamentId, matchData, adminSecret) {
    return this.request(`/tournaments/${tournamentId}/matches`, {
      method: 'POST',
      headers: {
        'x-admin-secret': adminSecret
      },
      body: JSON.stringify(matchData)
    });
  }

  async getMatch(matchId) {
    return this.request(`/matches/${matchId}`);
  }

  async getMatchInnings(matchId, inningsNumber = null) {
    const params = inningsNumber ? `?inningsNumber=${inningsNumber}` : '';
    return this.request(`/matches/${matchId}/innings${params}`);
  }

  async getMatchBalls(matchId, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/matches/${matchId}/balls?${params}`);
  }

  async getLiveMatches() {
    return this.request('/matches/live/all');
  }

  async updateMatchStatus(matchId, status) {
    return this.request(`/matches/${matchId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Scorer PIN login
  async scorerLogin(tournamentId, pin) {
    return this.request(`/tournaments/${tournamentId}/scorer/login`, {
      method: 'POST',
      body: JSON.stringify({ pin })
    });
  }

  // Scorer endpoints (require authentication)
  async validateScorerToken(token) {
    return this.request('/scorer/auth', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async recordBall(matchId, ballData, token) {
    return this.request('/scorer/ball', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...ballData, matchId })
    });
  }

  async undoBall(matchId, token) {
    return this.request('/scorer/ball/undo', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ matchId })
    });
  }

  async setBatsmen(matchId, batsmen, token) {
    return this.request('/scorer/batsmen/set', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ batsmen, matchId })
    });
  }

  async setBowler(matchId, bowler, token) {
    return this.request('/scorer/bowler/set', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bowler, matchId })
    });
  }

  async endInnings(matchId, token) {
    return this.request('/scorer/innings/end', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ matchId })
    });
  }

  async startInnings(matchId, token) {
    return this.request('/scorer/innings/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ matchId })
    });
  }

  async endMatch(matchId, winner, result, token) {
    return this.request('/scorer/match/end', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ matchId, winner, result })
    });
  }
}

export default new ApiService();
