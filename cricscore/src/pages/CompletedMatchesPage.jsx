import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PullToRefresh } from '../components/common';
import api from '../services/api';
import toast from '../utils/toast.jsx';

/**
 * Completed Matches Page - Mobile-First Design
 * Shows completed matches with final scores and results
 */
const CompletedMatchesPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    fetchCompletedMatches();
  }, []);

  const fetchCompletedMatches = async (showToast = false) => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;

    try {
      const response = await api.getCompletedMatches();
      setMatches(response.data.matches || []);
      if (showToast) {
        toast.success('Matches refreshed');
      }
    } catch (err) {
      console.error('Failed to fetch completed matches:', err);
      setError(err.message);
      if (showToast) {
        toast.error('Failed to refresh matches');
      }
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  const handleRefresh = async () => {
    await fetchCompletedMatches(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D14]">
        <div className="text-center">
          <div className="animate-spin w-14 h-14 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading completed matches...</p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[#0B0D14] pb-6">
        {/* Header */}
        <div className="px-5 pt-6 pb-6 sticky top-0 bg-[#0B0D14] z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-5 transition-colors py-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-base">Back</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#1E2030] rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Completed Matches</h1>
              <p className="text-white/60 text-sm">Final scores & results</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-5 mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Completed Matches */}
        <div className="px-5 space-y-4">
          {matches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141620] border border-[#1E2030] rounded-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-[#1E2030] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Completed Matches</h3>
              <p className="text-white/60 mb-6 text-base">Matches will appear here once they finish</p>

              <button
                onClick={() => navigate('/')}
                className="bg-white/10 text-white/70 border border-white/10 rounded-full py-4 px-8 font-bold text-lg transition-all active:scale-95"
              >
                Go Home
              </button>
            </motion.div>
          ) : (
            <>
              {matches.map((match, index) => {
                const innings1 = match.innings?.[0];
                const innings2 = match.innings?.[1];

                return (
                  <motion.button
                    key={match.matchId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/match/${match.matchId}`)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden transition-all text-left"
                  >
                    {/* Completed Badge Header */}
                    <div className="border-b border-[#1E2030] px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-white font-bold text-sm tracking-wide">COMPLETED</span>
                      </div>
                      <span className="text-white/70 text-xs font-medium">{match.matchType} &bull; {match.overs} overs</span>
                    </div>

                    {/* Match Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {match.team1?.name} vs {match.team2?.name}
                      </h3>
                      {match.tournamentName && (
                        <p className="text-sm text-white/50 mb-4">{match.tournamentName}</p>
                      )}

                      {/* Both Innings Scores */}
                      <div className="bg-[#111318] rounded-xl p-5 mb-4 border border-[#1E2030] space-y-3">
                        {/* First Innings */}
                        {innings1 && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-white/70 font-medium">{innings1.battingTeam}</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-white">{innings1.totalRuns || 0}</span>
                              <span className="text-lg font-bold text-white/50">/</span>
                              <span className="text-lg font-bold text-white">{innings1.totalWickets || 0}</span>
                              <span className="text-sm text-white/50 ml-2">({innings1.totalOvers || 0})</span>
                            </div>
                          </div>
                        )}

                        {/* Divider */}
                        {innings1 && innings2 && (
                          <div className="border-t border-[#1E2030]"></div>
                        )}

                        {/* Second Innings */}
                        {innings2 && (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-white/70 font-medium">{innings2.battingTeam}</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-white">{innings2.totalRuns || 0}</span>
                              <span className="text-lg font-bold text-white/50">/</span>
                              <span className="text-lg font-bold text-white">{innings2.totalWickets || 0}</span>
                              <span className="text-sm text-white/50 ml-2">({innings2.totalOvers || 0})</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Match Result */}
                      {match.result && (
                        <p className="text-sm text-emerald-400 font-semibold mb-4">{match.result}</p>
                      )}

                      {/* View Scorecard Button */}
                      <div className="bg-white/10 text-white/70 border border-white/10 rounded-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                        <span>View Scorecard</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default CompletedMatchesPage;
