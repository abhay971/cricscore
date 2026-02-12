import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Tournament Page - Mobile-First Design
 * Shows tournament details and list of matches
 */
const TournamentPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentData();
    }
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    if (fetchInProgressRef.current) return;

    fetchInProgressRef.current = true;
    setLoading(true);

    try {
      const [tournamentRes, matchesRes] = await Promise.all([
        api.getTournament(tournamentId),
        api.getTournamentMatches(tournamentId)
      ]);

      setTournament(tournamentRes.data.tournament);
      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      console.error('Failed to fetch tournament:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  const getMatchStatusBadge = (status) => {
    const badges = {
      not_started: { text: 'Upcoming', color: 'bg-white/10 text-white/50' },
      live: { text: 'LIVE', color: 'bg-red-500 text-white' },
      innings_break: { text: 'Break', color: 'bg-blue-500/15 text-blue-400' },
      completed: { text: 'Completed', color: 'bg-emerald-500/15 text-emerald-400' }
    };

    const badge = badges[status] || badges.not_started;

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.color} ${status === 'live' ? 'animate-pulse' : ''}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D14]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-4"></div>
          <p className="text-white/50 text-sm">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D14] px-5">
        <div className="bg-[#141620] border border-[#1E2030] rounded-2xl p-8 max-w-md text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-bold text-white mb-2">Error Loading Tournament</h2>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-[#0B0D14] rounded-xl py-3 px-6 font-semibold text-sm transition-all active:scale-95"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D14] pb-6">
      {/* Header */}
      <div className="px-5 pt-6 pb-5 sticky top-0 bg-[#0B0D14]/95 backdrop-blur-xl z-10 border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors py-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-sm">Back</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white mb-1 break-words">{tournament?.name}</h1>
            <p className="text-white/40 text-sm">Organized by {tournament?.organizerName}</p>
            {tournament?.customRules?.declareOneEnabled && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Declare 1 Run
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/tournament/${tournamentId}/match/new`)}
            className="bg-white text-[#0B0D14] rounded-xl py-2.5 px-4 font-semibold text-sm transition-all flex-shrink-0 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Match
          </motion.button>
        </div>
      </div>

      {/* Matches List */}
      <div className="px-5 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {matches.length === 0 ? (
            <div className="bg-[#141620] border border-[#1E2030] rounded-2xl p-10 text-center">
              <div className="w-16 h-16 bg-[#1E2030] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Matches Yet</h3>
              <p className="text-white/40 text-sm mb-6">Get started by creating your first match</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/tournament/${tournamentId}/match/new`)}
                className="bg-white text-[#0B0D14] rounded-xl py-3 px-6 font-semibold text-sm transition-all mx-auto"
              >
                Create First Match
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match, index) => (
                <motion.button
                  key={match.matchId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/match/${match.matchId}`)}
                  className="w-full bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden transition-all text-left"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base font-semibold text-white flex-1">
                        {match.team1?.name} vs {match.team2?.name}
                      </h3>
                      {getMatchStatusBadge(match.status)}
                    </div>
                    <p className="text-xs text-white/30 mb-3">
                      {match.matchType} &bull; {match.overs} overs per side
                    </p>

                    {match.status === 'live' && match.liveInnings && (
                      <div className="bg-[#0B0D14] rounded-xl p-4 mb-3 border border-[#1E2030]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-white/30 mb-1 font-medium uppercase tracking-wider">Current Score</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-white">
                                {match.liveInnings.totalRuns}
                              </span>
                              <span className="text-lg text-white/30">/</span>
                              <span className="text-lg font-medium text-white">
                                {match.liveInnings.totalWickets}
                              </span>
                              <span className="text-xs text-white/20 ml-2">
                                ({match.liveInnings.totalOvers}/{match.overs})
                              </span>
                            </div>
                          </div>
                          <div className="bg-white/10 text-white rounded-xl py-2 px-4 font-semibold text-xs">
                            Watch Live
                          </div>
                        </div>
                      </div>
                    )}

                    {match.status === 'completed' && match.result && (
                      <div className="border-t border-[#1E2030]/30 pt-3">
                        <p className="text-xs font-semibold text-emerald-400">
                          {match.result
                            .replace(/\bteam1\b/g, match.team1?.name || 'team1')
                            .replace(/\bteam2\b/g, match.team2?.name || 'team2')}
                        </p>
                      </div>
                    )}

                    {(match.status === 'not_started' || match.status === 'innings_break') && (
                      <div className="flex items-center justify-end pt-1">
                        <svg className="w-4 h-4 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TournamentPage;
