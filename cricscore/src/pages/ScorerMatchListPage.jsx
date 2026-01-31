import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import api from '../services/api';

/**
 * Scorer Match List Page - Shows tournament matches for scoring
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
      live: 'bg-red-500/20 text-red-400 border-red-500/30',
      upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      innings_break: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    const labels = {
      live: 'LIVE',
      upcoming: 'Upcoming',
      completed: 'Completed',
      innings_break: 'Innings Break'
    };
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${styles[status] || styles.upcoming}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C2D3F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#8BC9E8] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2C2D3F] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8BC9E8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8BC9E8]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-6 py-8 max-w-2xl mx-auto">
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

          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-[#8BC9E8] to-[#6BA8C8] rounded-[16px] flex items-center justify-center shadow-xl">
              <svg className="w-7 h-7 text-[#2C2D3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {tournament?.name || 'Tournament'}
              </h1>
              <p className="text-white/50 text-sm">Scorer Dashboard</p>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-[20px]"
          >
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Match List */}
        <div className="space-y-4">
          {matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#353647] border border-[#4A4B5E]/50 rounded-[24px] p-8 text-center"
            >
              <p className="text-white/50 text-lg">No matches in this tournament yet</p>
            </motion.div>
          ) : (
            matches.map((match, index) => (
              <motion.div
                key={match.matchId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-gradient-to-br from-[#353647] to-[#2C2D3F] border border-[#4A4B5E]/50 rounded-[24px] p-5 shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40 font-medium">{match.matchId}</span>
                  {getStatusBadge(match.status)}
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
                  </h3>
                  {match.liveInnings && (
                    <p className="text-[#8BC9E8] text-sm mt-1 font-medium">
                      {match.liveInnings.totalRuns}/{match.liveInnings.totalWickets} ({match.liveInnings.totalOvers} ov)
                    </p>
                  )}
                  <p className="text-white/40 text-xs mt-1">
                    {match.overs} overs • {match.playersPerTeam} players
                  </p>
                </div>

                {match.status !== 'completed' && (
                  <button
                    onClick={() => handleScoreMatch(match.matchId)}
                    className="w-full py-3 bg-[#8BC9E8]/10 border border-[#8BC9E8]/30 text-[#8BC9E8] font-bold rounded-[16px] hover:bg-[#8BC9E8]/20 transition-colors"
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
