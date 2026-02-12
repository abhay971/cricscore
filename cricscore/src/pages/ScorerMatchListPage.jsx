import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import api from '../services/api';

/**
 * Scorer Match List Page - Premium Dark Theme
 */
const ScorerMatchListPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { isTournamentScorer, scorerToken, logout } = useAuthStore();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isTournamentScorer || !scorerToken) {
      navigate('/scorer/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await api.getTournamentMatches(tournamentId);
        setTournament(response.data.tournament);
        setMatches(response.data.matches || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, isTournamentScorer, scorerToken, navigate]);

  const handleScoreMatch = (matchId) => {
    navigate(`/match/${matchId}/score`);
  };

  const handleLogout = () => {
    logout();
    navigate('/scorer/login');
  };

  const getStatusBadge = (status) => {
    const styles = {
      live: 'bg-red-400/10 text-red-400 border-red-400/20',
      upcoming: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      completed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
      innings_break: 'bg-blue-400/10 text-blue-400 border-blue-400/20'
    };
    const labels = {
      live: 'LIVE',
      upcoming: 'Upcoming',
      completed: 'Completed',
      innings_break: 'Innings Break'
    };
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[status] || styles.upcoming}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <p className="text-white/60 text-sm">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D14]">
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Logout
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {tournament?.name || 'Tournament'}
            </h1>
            <p className="text-white/40 text-sm mt-1">Scorer Dashboard</p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-400/10 border border-red-400/20 rounded-xl"
          >
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Match List */}
        <div className="space-y-3">
          {matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141620] border border-[#1E2030] rounded-2xl p-8 text-center"
            >
              <p className="text-white/30 text-sm">No matches in this tournament yet</p>
            </motion.div>
          ) : (
            matches.map((match, index) => (
              <motion.div
                key={match.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-[#141620] border border-[#1E2030] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/30 font-medium">{match.matchId}</span>
                  {getStatusBadge(match.status)}
                </div>

                <div className="mb-4">
                  <h3 className="text-base font-semibold text-white">
                    {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
                  </h3>
                  {match.liveInnings && (
                    <p className="text-emerald-400 text-sm mt-1 font-medium">
                      {match.liveInnings.totalRuns}/{match.liveInnings.totalWickets} ({match.liveInnings.totalOvers} ov)
                    </p>
                  )}
                  <p className="text-white/30 text-xs mt-1">
                    {match.overs} overs - {match.playersPerTeam} players
                  </p>
                </div>

                {match.status !== 'completed' && (
                  <button
                    onClick={() => handleScoreMatch(match.matchId)}
                    className="w-full py-3 bg-white/10 border border-white/10 text-white font-semibold text-sm rounded-xl hover:bg-white/15 transition-colors"
                  >
                    {match.status === 'live' || match.status === 'innings_break' ? 'Continue Scoring' : 'Start Scoring'}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScorerMatchListPage;
