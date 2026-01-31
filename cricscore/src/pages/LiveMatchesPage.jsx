import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PullToRefresh } from '../components/common';
import api from '../services/api';
import toast from '../utils/toast.jsx';

/**
 * Live Matches Page - Mobile-First Design
 * Shows live matches with NO square buttons
 */
const LiveMatchesPage = () => {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    fetchLiveMatches();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => fetchLiveMatches(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async (showToast = false) => {
    // Prevent multiple simultaneous requests
    if (fetchInProgressRef.current) {
      console.log('⏭️  Skipping duplicate live matches fetch');
      return;
    }

    fetchInProgressRef.current = true;

    try {
      const response = await api.getLiveMatches();
      setLiveMatches(response.data.matches || []);
      if (showToast) {
        toast.success('Matches refreshed');
      }
    } catch (err) {
      console.error('Failed to fetch live matches:', err);
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
    await fetchLiveMatches(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2C2D3F]">
        <div className="text-center">
          <div className="animate-spin w-14 h-14 border-4 border-[#8BC9E8] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading live matches...</p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[#2C2D3F] pb-6">
        {/* Header - Mobile First */}
        <div className="px-5 pt-6 pb-6 sticky top-0 bg-[#2C2D3F] z-10">
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
            <div className="w-12 h-12 bg-[#FF4B4B] rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">🔴</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Live Matches</h1>
              <p className="text-white/60 text-sm">Happening now</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mx-5 mb-4 bg-red-500/10 border border-red-500/30 rounded-[24px] p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Live Matches - Single Column */}
        <div className="px-5 space-y-4">
          {liveMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#353647] border border-[#4A4B5E] rounded-[28px] p-10 text-center"
            >
              <div className="w-20 h-20 bg-[#FF4B4B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📺</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Live Matches</h3>
              <p className="text-white/60 mb-6 text-base">No matches are being played right now</p>

              {/* Pill-shaped button */}
              <button
                onClick={() => navigate('/tournament/create')}
                className="bg-[#8BC9E8] text-[#2C2D3F] rounded-full py-4 px-8 font-bold text-lg shadow-xl active:shadow-lg transition-all active:scale-95"
              >
                Create Match
              </button>
            </motion.div>
          ) : (
            <>
              {liveMatches.map((match, index) => (
                <motion.button
                  key={match.matchId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/match/${match.matchId}`)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#353647] border border-[#4A4B5E] rounded-[28px] overflow-hidden shadow-xl active:shadow-2xl transition-all text-left"
                >
                  {/* Live Badge Header - Rounded */}
                  <div className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-lg"></span>
                      <span className="text-white font-black text-sm tracking-wide">LIVE NOW</span>
                    </div>
                    <span className="text-white/90 text-xs font-medium">{match.matchType} • {match.overs} overs</span>
                  </div>

                  {/* Match Content */}
                  <div className="p-6">
                    {/* Teams */}
                    <h3 className="text-xl font-bold text-white mb-1">
                      {match.team1?.name} vs {match.team2?.name}
                    </h3>
                    {match.tournament && (
                      <p className="text-sm text-white/50 mb-4">{match.tournament.name}</p>
                    )}

                    {/* Score Card - Rounded */}
                    <div className="bg-[#2C2D3F] rounded-[20px] p-5 mb-4 border border-[#4A4B5E]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/50 mb-1.5 font-medium">
                            {match.currentInnings?.battingTeam || match.team1?.name}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">
                              {match.currentInnings?.totalRuns || 0}
                            </span>
                            <span className="text-2xl font-bold text-white/50">/</span>
                            <span className="text-2xl font-bold text-white">
                              {match.currentInnings?.totalWickets || 0}
                            </span>
                            <span className="text-base text-white/50 ml-2">
                              ({match.currentInnings?.totalOvers || 0}/{match.overs})
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-white/50 mb-1 font-medium">Run Rate</p>
                          <p className="text-3xl font-black text-[#8BC9E8]">
                            {match.currentInnings?.runRate?.toFixed(1) || '0.0'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Watch Button - Pill Shaped */}
                    <div className="bg-[#8BC9E8] text-[#2C2D3F] rounded-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-lg shadow-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span>Watch Live</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </>
          )}
        </div>

        {/* Auto-refresh indicator */}
        {liveMatches.length > 0 && (
          <div className="mt-6 px-5 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#353647]/50 rounded-full border border-[#4A4B5E]">
              <svg className="w-4 h-4 animate-spin text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs text-white/60 font-medium">Auto-updating</span>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default LiveMatchesPage;
