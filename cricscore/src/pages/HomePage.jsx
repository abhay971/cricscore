import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

/**
 * HomePage - Mobile-First Design
 * Optimized for small screens (320px+) with large touch targets
 * Shows live matches inline with 10s auto-refresh
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(() => fetchLiveMatches(), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async () => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;
    try {
      const response = await api.getLiveMatches();
      setLiveMatches(response.data.matches || []);
    } catch (err) {
      console.error('Failed to fetch live matches:', err);
    } finally {
      setLiveLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#2C2D3F] flex flex-col">
      {/* Header - Compact for mobile */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-3xl font-black text-white mb-1">CricScore</h1>
        <p className="text-white/60 text-base">Live Cricket Scoring</p>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="space-y-4 py-4">

          {/* Live Matches Section - Top */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-[#FF4B4B] rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold text-white">Live Matches</h2>
            </div>

            {liveLoading ? (
              <div className="bg-[#353647] border border-[#4A4B5E] rounded-[28px] p-8 text-center">
                <div className="animate-spin w-10 h-10 border-3 border-[#8BC9E8] border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-white/50 text-sm">Loading live matches...</p>
              </div>
            ) : liveMatches.length === 0 ? (
              <div className="bg-[#353647]/60 border border-[#4A4B5E] rounded-[24px] p-6 text-center">
                <p className="text-white/40 text-sm">No live matches right now</p>
              </div>
            ) : (
              <div className="space-y-4">
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
                    {/* Live Badge Header */}
                    <div className="bg-gradient-to-r from-[#FF4B4B] to-[#FF6B6B] px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-lg"></span>
                        <span className="text-white font-black text-sm tracking-wide">LIVE NOW</span>
                      </div>
                      <span className="text-white/90 text-xs font-medium">{match.matchType} &bull; {match.overs} overs</span>
                    </div>

                    {/* Match Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {match.team1?.name} vs {match.team2?.name}
                      </h3>

                      {/* Score Card */}
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

                      {/* Watch Live Button */}
                      <div className="bg-[#8BC9E8] text-[#2C2D3F] rounded-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-lg shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Watch Live</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Tournaments - Dark card */}
          <motion.button
            onClick={() => navigate('/tournaments')}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#353647] border border-[#4A4B5E] rounded-[24px] p-5 flex items-center gap-4 active:bg-[#3D3E52] transition-colors min-h-[88px]"
          >
            <div className="w-16 h-16 bg-[#3D3E52] rounded-[18px] flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-white mb-0.5">Tournaments</h3>
              <p className="text-white/50 text-sm">
                View all tournaments
              </p>
            </div>
            <svg className="w-7 h-7 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Quick Stats - 2 column grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#353647]/60 border border-[#4A4B5E] rounded-[20px] p-4 text-center">
              <div className="flex justify-center mb-2">
                <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Real-time</p>
            </div>
            <div className="bg-[#353647]/60 border border-[#4A4B5E] rounded-[20px] p-4 text-center">
              <div className="flex justify-center mb-2">
                <svg className="w-8 h-8 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Custom Rules</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Navigation - Fixed, Large Touch Targets */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#353647] border-t border-[#4A4B5E] safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          {/* Home - Active */}
          <button className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]">
            <div className="w-14 h-14 bg-[#8BC9E8] rounded-[16px] flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-[#2C2D3F]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#8BC9E8]">Home</span>
          </button>

          {/* Stats */}
          <button
            onClick={() => navigate('/tournaments')}
            className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]"
          >
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Stats</span>
          </button>

          {/* Completed */}
          <button
            onClick={() => navigate('/matches/completed')}
            className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]"
          >
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Completed</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]"
          >
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
