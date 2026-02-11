import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useEffect, useCallback, useMemo } from 'react';
import { Scoreboard, RecentBalls, Commentary, InningsBreak, MatchComplete } from '../components/viewer';
import { useMatchStore } from '../store';
import useWebSocket from '../hooks/useWebSocket';
import api from '../services/api';

/**
 * Viewer Page - Modern Mobile App Design
 * Navy background with light blue accent cards
 */
const ViewerPage = () => {
  const { matchId } = useParams();
  const {
    match,
    currentInnings,
    allInnings,
    recentBalls,
    commentary,
    setMatch,
    setCurrentInnings,
    setRecentBalls,
    addCommentary,
    loading,
    fetchMatch
  } = useMatchStore();

  // WebSocket callbacks for real-time updates
  const handleMatchUpdate = useCallback((data) => {
    console.log('📊 Match update received:', data);
    if (data.match) setMatch(data.match);
    if (data.innings) setCurrentInnings(data.innings);
  }, [setMatch, setCurrentInnings]);

  const handleScoreUpdate = useCallback(async (data) => {
    console.log('🏏 Score update received:', data);
    if (data.innings) setCurrentInnings(data.innings);
    if (data.match) setMatch(data.match);
    // Refresh balls list on score update
    try {
      const response = await api.getMatchBalls(matchId);
      if (response.data.balls) setRecentBalls(response.data.balls);
    } catch (error) {
      console.error('Failed to fetch balls after score update:', error);
    }
  }, [setCurrentInnings, setMatch, matchId, setRecentBalls]);

  const handleNewCommentary = useCallback((data) => {
    console.log('💬 New commentary received:', data);
    addCommentary(data.commentary);
  }, [addCommentary]);

  const handleMatchJoined = useCallback((data) => {
    console.log('✅ Match joined:', data);
    if (data.match) setMatch(data.match);
    if (data.innings) {
      const currentInningsData = data.innings[data.match.currentInnings - 1];
      setCurrentInnings(currentInningsData);
    }
    if (data.recentBalls) setRecentBalls(data.recentBalls);
  }, [setMatch, setCurrentInnings, setRecentBalls]);

  // Set up WebSocket connection with callbacks
  // score:update already refetches balls, so no need for a separate onNewBall handler
  const { isConnected } = useWebSocket(matchId, {
    onMatchUpdate: handleMatchUpdate,
    onScoreUpdate: handleScoreUpdate,
    onNewCommentary: handleNewCommentary,
    onMatchJoined: handleMatchJoined
  });

  // Fetch initial match data and balls
  useEffect(() => {
    if (matchId) {
      fetchMatch(matchId);
      const fetchBalls = async () => {
        try {
          const response = await api.getMatchBalls(matchId);
          if (response.data.balls) setRecentBalls(response.data.balls);
        } catch (error) {
          console.error('Failed to fetch balls:', error);
        }
      };
      fetchBalls();
    }
  }, [matchId, fetchMatch, setRecentBalls]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-light-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-light-text">Loading match...</p>
        </div>
      </div>
    );
  }

  // Show Innings Break screen
  if (match?.status === 'innings_break') {
    const firstInnings = allInnings?.[0] || currentInnings;
    return (
      <InningsBreak
        match={match}
        innings={firstInnings}
        onStartNextInnings={() => {
          // Viewer-only: no action (scorer starts innings)
        }}
      />
    );
  }

  // Show Match Complete screen
  if (match?.status === 'completed') {
    return (
      <MatchComplete
        match={match}
        innings1={allInnings?.[0] || currentInnings}
        innings2={allInnings?.[1]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Modern Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/95 backdrop-blur-lg border-b border-dark-lighter">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button and title */}
            <div className="flex items-center gap-3">
              <button className="w-11 h-11 rounded-xl bg-white/5 active:bg-white/10 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-light-text">Live Match</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-accent-red">LIVE</span>
                  </div>
                  <span className="text-xs text-dark-text">• T20 Match</span>
                </div>
              </div>
            </div>

            {/* Menu button */}
            <button className="w-11 h-11 rounded-xl bg-white/5 active:bg-white/10 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Main scoreboard */}
          <Scoreboard match={match} innings={currentInnings} />

          {/* Recent balls */}
          <RecentBalls balls={recentBalls} currentInningsNumber={match?.currentInnings} />

          {/* Fall of Wickets */}
          <FallOfWickets balls={recentBalls} currentInningsNumber={match?.currentInnings} />

          {/* Live Commentary */}
          <Commentary commentary={commentary} />
        </motion.div>
      </div>

      {/* Bottom Navigation - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#353647] border-t border-[#4A4B5E]">
        <div className="flex items-center justify-around py-2 px-2">
          <button className="flex flex-col items-center gap-1 py-2 px-2 min-w-[68px]">
            <div className="w-12 h-12 bg-[#8BC9E8] rounded-[14px] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#2C2D3F]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#8BC9E8]">Match</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-2 px-2 min-w-[68px]">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Stats</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-2 px-2 min-w-[68px]">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Commentary</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-2 px-2 min-w-[68px]">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Teams</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Fall of Wickets - computed from ball data
 */
const FallOfWickets = ({ balls, currentInningsNumber }) => {
  const fowData = useMemo(() => {
    if (!balls || balls.length === 0) return [];

    // Filter balls for current innings, sorted by over/ball
    const inningsBalls = balls
      .filter(b => b.inningsNumber === (currentInningsNumber || 1))
      .sort((a, b) => a.overNumber - b.overNumber || a.ballNumber - b.ballNumber);

    let runningScore = 0;
    let wicketCount = 0;
    const fow = [];

    for (const ball of inningsBalls) {
      const ballRuns = (ball.runs || 0) + (ball.extras?.runs || 0);
      runningScore += ballRuns;

      if (ball.isWicket) {
        wicketCount++;
        fow.push({
          score: runningScore,
          wickets: wicketCount,
          over: `${ball.overNumber}.${ball.ballNumber}`,
          player: ball.dismissedPlayer || ball.batsman
        });
      }
    }

    return fow;
  }, [balls, currentInningsNumber]);

  if (fowData.length === 0) return null;

  return (
    <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg p-4">
      <h3 className="font-bold text-white text-sm mb-3">
        Fall of Wickets
      </h3>
      <div className="flex flex-wrap gap-3 text-sm">
        {fowData.map((fow, i) => (
          <div key={i} className="text-white/70">
            <span className="font-semibold text-white">{fow.score}/{fow.wickets}</span> ({fow.over} ov)
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewerPage;
