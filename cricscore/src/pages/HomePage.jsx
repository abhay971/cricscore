import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [completedLoading, setCompletedLoading] = useState(true);
  const liveFetchRef = useRef(false);
  const completedFetchRef = useRef(false);

  useEffect(() => {
    fetchLiveMatches();
    fetchCompletedMatches();
    const interval = setInterval(() => fetchLiveMatches(), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMatches = async () => {
    if (liveFetchRef.current) return;
    liveFetchRef.current = true;
    try {
      const response = await api.getLiveMatches();
      setLiveMatches(response.data.matches || []);
    } catch (err) {
      console.error('Failed to fetch live matches:', err);
    } finally {
      setLiveLoading(false);
      liveFetchRef.current = false;
    }
  };

  const fetchCompletedMatches = async () => {
    if (completedFetchRef.current) return;
    completedFetchRef.current = true;
    try {
      const response = await api.getCompletedMatches();
      setCompletedMatches(response.data.matches || []);
    } catch (err) {
      console.error('Failed to fetch completed matches:', err);
    } finally {
      setCompletedLoading(false);
      completedFetchRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">CricScore</h1>
        <p className="text-white/40 text-sm mt-0.5">Live Cricket Scoring</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="space-y-8 pb-4">

          {/* Live Matches */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-base font-semibold text-white/90 tracking-wide uppercase">Live</h2>
            </div>

            {liveLoading ? (
              <div className="px-5">
                <div className="bg-[#141620] border border-[#1E2030] rounded-2xl p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-3"></div>
                  <p className="text-white/30 text-sm">Loading...</p>
                </div>
              </div>
            ) : liveMatches.length === 0 ? (
              <div className="px-5">
                <div className="bg-[#141620] border border-[#1E2030] rounded-2xl p-6 text-center">
                  <p className="text-white/25 text-sm">No live matches right now</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-hide">
                {liveMatches.map((match, index) => (
                  <motion.button
                    key={match.matchId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/match/${match.matchId}`)}
                    whileTap={{ scale: 0.98 }}
                    className="min-w-[82vw] max-w-[82vw] snap-start bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden text-left flex-shrink-0"
                  >
                    {/* Live strip */}
                    <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-red-400 font-semibold text-xs tracking-wider">LIVE</span>
                      </div>
                      <span className="text-white/30 text-xs">{match.overs} ov</span>
                    </div>

                    <div className="p-4">
                      <p className="text-white/50 text-xs font-medium mb-3">
                        {match.team1?.name} vs {match.team2?.name}
                      </p>

                      {/* Score */}
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">
                            {match.currentInnings?.battingTeam || match.team1?.name}
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white tracking-tight">
                              {match.currentInnings?.totalRuns || 0}
                            </span>
                            <span className="text-lg text-white/30 font-medium">/{match.currentInnings?.totalWickets || 0}</span>
                            <span className="text-xs text-white/20 ml-1.5">
                              ({match.currentInnings?.totalOvers || 0}/{match.overs})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/20 uppercase tracking-wider">CRR</p>
                          <p className="text-lg font-bold text-emerald-400">
                            {match.currentInnings?.runRate?.toFixed(1) || '0.0'}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl py-2.5 flex items-center justify-center gap-2">
                        <svg className="w-3.5 h-3.5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span className="text-white/60 font-medium text-sm">Watch Live</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Completed Matches */}
          <div>
            <div className="flex items-center justify-between mb-4 px-5">
              <h2 className="text-base font-semibold text-white/90 tracking-wide uppercase">Recent</h2>
              {completedMatches.length > 0 && (
                <button
                  onClick={() => navigate('/matches/completed')}
                  className="text-white/30 text-xs font-medium hover:text-white/50 transition-colors"
                >
                  View All
                </button>
              )}
            </div>

            {completedLoading ? (
              <div className="px-5">
                <div className="bg-[#141620] border border-[#1E2030] rounded-2xl p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-3"></div>
                  <p className="text-white/30 text-sm">Loading...</p>
                </div>
              </div>
            ) : completedMatches.length === 0 ? (
              <div className="px-5">
                <div className="bg-[#141620] border border-[#1E2030] rounded-2xl p-6 text-center">
                  <p className="text-white/25 text-sm">No completed matches yet</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-hide">
                {completedMatches.map((match, index) => {
                  const inn1 = match.innings?.[0];
                  const inn2 = match.innings?.[1];

                  return (
                    <motion.button
                      key={match.matchId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/match/${match.matchId}`)}
                      whileTap={{ scale: 0.98 }}
                      className="min-w-[82vw] max-w-[82vw] snap-start bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden text-left flex-shrink-0"
                    >
                      {/* Header strip */}
                      <div className="px-4 py-2 border-b border-[#1E2030] flex items-center justify-between">
                        <span className="text-white/25 font-medium text-xs tracking-wider uppercase">Completed</span>
                        <span className="text-white/20 text-xs">{match.overs} ov</span>
                      </div>

                      <div className="p-4">
                        {/* Scores */}
                        <div className="space-y-3 mb-3">
                          {inn1 && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-white/60 font-medium truncate mr-3">{inn1.battingTeam}</p>
                              <div className="flex items-baseline gap-1 flex-shrink-0">
                                <span className="text-lg font-bold text-white">{inn1.totalRuns || 0}</span>
                                <span className="text-sm text-white/25">/{inn1.totalWickets || 0}</span>
                                <span className="text-[10px] text-white/15 ml-1">({inn1.totalOvers || 0})</span>
                              </div>
                            </div>
                          )}
                          {inn2 && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-white/60 font-medium truncate mr-3">{inn2.battingTeam}</p>
                              <div className="flex items-baseline gap-1 flex-shrink-0">
                                <span className="text-lg font-bold text-white">{inn2.totalRuns || 0}</span>
                                <span className="text-sm text-white/25">/{inn2.totalWickets || 0}</span>
                                <span className="text-[10px] text-white/15 ml-1">({inn2.totalOvers || 0})</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {match.result && (
                          <p className="text-xs text-emerald-400/80 font-medium">{match.result}</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0D14]/95 backdrop-blur-xl border-t border-white/5 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-6">
          <button className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-[10px] font-semibold text-white">Home</span>
          </button>

          <button onClick={() => navigate('/tournaments')} className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721" />
            </svg>
            <span className="text-[10px] font-medium text-white/30">Tournaments</span>
          </button>

          <button onClick={() => navigate('/matches/completed')} className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium text-white/30">Results</span>
          </button>

          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-[10px] font-medium text-white/30">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
