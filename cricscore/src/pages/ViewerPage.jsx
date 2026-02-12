import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Scoreboard, RecentBalls, Commentary, InningsBreak, MatchComplete, SuperOverBreak } from '../components/viewer';
import { useMatchStore } from '../store';
import useWebSocket from '../hooks/useWebSocket';
import api from '../services/api';

/**
 * Viewer Page - Modern Mobile App Design
 * Navy background with light blue accent cards
 */
const ViewerPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('match');
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
    if (data.match) {
      setMatch(data.match);
      // Re-fetch full match data on status change so allInnings is up to date
      if (['innings_break', 'completed', 'super_over', 'super_over_break'].includes(data.match.status)) {
        await fetchMatch(matchId);
        return; // fetchMatch already sets everything
      }
    }
    // Refresh balls list on score update
    try {
      const response = await api.getMatchBalls(matchId);
      if (response.data.balls) setRecentBalls(response.data.balls);
    } catch (error) {
      console.error('Failed to fetch balls after score update:', error);
    }
  }, [setCurrentInnings, setMatch, matchId, setRecentBalls, fetchMatch]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#0B0D14]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading match...</p>
        </div>
      </div>
    );
  }

  // Show Super Over screen (match tied, SO pending)
  if (match?.status === 'super_over') {
    const inn1 = allInnings?.find(i => i.inningsNumber === 1);
    const inn2 = allInnings?.find(i => i.inningsNumber === 2);
    return (
      <SuperOverBreak
        match={match}
        innings1={inn1}
        innings2={inn2}
      />
    );
  }

  // Show SO innings break (between SO innings 3 and 4)
  if (match?.status === 'super_over_break') {
    const soFirstInnings = allInnings?.find(i => i.inningsNumber === 3);
    return (
      <InningsBreak
        match={match}
        innings={soFirstInnings}
        isSuperOver={true}
      />
    );
  }

  // Show Innings Break screen
  if (match?.status === 'innings_break') {
    const firstInnings = allInnings?.find(i => i.inningsNumber === 1) || allInnings?.[0] || currentInnings;
    return (
      <InningsBreak
        match={match}
        innings={firstInnings}
      />
    );
  }

  // Show Match Complete screen
  if (match?.status === 'completed') {
    return (
      <MatchComplete
        match={match}
        allInnings={allInnings?.length ? allInnings : [currentInnings]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D14] pb-20">
      {/* Modern Header */}
      <div className="sticky top-0 z-10 bg-[#0B0D14]/95 backdrop-blur-lg border-b border-[#1E2030]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button and title */}
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-11 h-11 rounded-xl bg-white/5 active:bg-white/10 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">Live Match</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-red-500">LIVE</span>
                  </div>
                  <span className="text-xs text-white/50">• T20 Match</span>
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
        {/* Scoreboard always visible */}
        <Scoreboard match={match} innings={currentInnings} />

        {/* Tab content */}
        {activeTab === 'match' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <RecentBalls balls={recentBalls} currentInningsNumber={match?.currentInnings} />
            <FallOfWickets balls={recentBalls} currentInningsNumber={match?.currentInnings} />
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <StatsTab innings={currentInnings} allInnings={allInnings} match={match} />
          </motion.div>
        )}

        {activeTab === 'commentary' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Commentary commentary={commentary} />
          </motion.div>
        )}

        {activeTab === 'teams' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TeamsTab match={match} currentInnings={currentInnings} />
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0D14]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around py-2 px-2">
          {[
            { id: 'match', label: 'Match', icon: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />, filled: true },
            { id: 'stats', label: 'Stats', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
            { id: 'commentary', label: 'Commentary', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
            { id: 'teams', label: 'Teams', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex flex-col items-center gap-1 py-2 px-2 min-w-[68px]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/10' : ''}`}>
                  {tab.filled ? (
                    <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/30'}`} fill="currentColor" viewBox="0 0 24 24">
                      {tab.icon}
                    </svg>
                  ) : (
                    <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      {tab.icon}
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] ${isActive ? 'font-semibold text-white' : 'font-medium text-white/30'}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Stats Tab - Batting & Bowling summary from innings data
 */
const StatsTab = ({ innings, allInnings, match }) => {
  const batters = innings?.batsmen || [];
  const bowlers = innings?.bowlers || [];
  const extras = innings?.extras || {};
  const totalExtras = (extras.wides || 0) + (extras.noBalls || 0) + (extras.byes || 0) + (extras.legByes || 0);

  return (
    <div className="space-y-4">
      {/* Batting Card */}
      <div className="bg-[#141620] border border-[#1E2030] rounded-2xl  overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1E2030]/30">
          <h3 className="font-bold text-white text-sm">Batting</h3>
        </div>
        {batters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/50 text-xs">
                  <th className="text-left px-4 py-2">Batter</th>
                  <th className="text-right px-2 py-2">R</th>
                  <th className="text-right px-2 py-2">B</th>
                  <th className="text-right px-2 py-2">4s</th>
                  <th className="text-right px-2 py-2">6s</th>
                  <th className="text-right px-3 py-2">SR</th>
                </tr>
              </thead>
              <tbody>
                {batters.map((b, i) => (
                  <tr key={i} className="border-t border-[#1E2030]/20">
                    <td className="px-4 py-2.5">
                      <span className="text-white font-medium">{b.name}</span>
                      {b.status === 'batting' && <span className="text-[emerald-400] text-xs ml-1">*</span>}
                      {b.status !== 'batting' && b.dismissal && (
                        <p className="text-white/40 text-xs truncate max-w-[140px]">{b.dismissal}</p>
                      )}
                    </td>
                    <td className="text-right px-2 py-2.5 text-white font-bold">{b.runs || 0}</td>
                    <td className="text-right px-2 py-2.5 text-white/70">{b.balls || 0}</td>
                    <td className="text-right px-2 py-2.5 text-white/70">{b.fours || 0}</td>
                    <td className="text-right px-2 py-2.5 text-white/70">{b.sixes || 0}</td>
                    <td className="text-right px-3 py-2.5 text-white/70">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-white/40 text-sm">No batting data yet</div>
        )}
        {/* Extras row */}
        {totalExtras > 0 && (
          <div className="px-4 py-2 border-t border-[#1E2030]/30 text-xs text-white/50">
            Extras: {totalExtras} (wd {extras.wides || 0}, nb {extras.noBalls || 0}, b {extras.byes || 0}, lb {extras.legByes || 0})
          </div>
        )}
      </div>

      {/* Bowling Card */}
      <div className="bg-[#141620] border border-[#1E2030] rounded-2xl  overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1E2030]/30">
          <h3 className="font-bold text-white text-sm">Bowling</h3>
        </div>
        {bowlers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/50 text-xs">
                  <th className="text-left px-4 py-2">Bowler</th>
                  <th className="text-right px-2 py-2">O</th>
                  <th className="text-right px-2 py-2">M</th>
                  <th className="text-right px-2 py-2">R</th>
                  <th className="text-right px-2 py-2">W</th>
                  <th className="text-right px-3 py-2">ECON</th>
                </tr>
              </thead>
              <tbody>
                {bowlers.map((b, i) => (
                  <tr key={i} className="border-t border-[#1E2030]/20">
                    <td className="px-4 py-2.5">
                      <span className="text-white font-medium">{b.name}</span>
                      {b.isBowling && <span className="text-[emerald-400] text-xs ml-1">*</span>}
                    </td>
                    <td className="text-right px-2 py-2.5 text-white/70">{b.overs || 0}</td>
                    <td className="text-right px-2 py-2.5 text-white/70">{b.maidens || 0}</td>
                    <td className="text-right px-2 py-2.5 text-white font-bold">{b.runs || 0}</td>
                    <td className="text-right px-2 py-2.5 text-[emerald-400] font-bold">{b.wickets || 0}</td>
                    <td className="text-right px-3 py-2.5 text-white/70">{b.economy?.toFixed(1) || '0.0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-white/40 text-sm">No bowling data yet</div>
        )}
      </div>

      {/* Previous Innings Summary (if 2nd innings) */}
      {match?.currentInnings === 2 && allInnings?.[0] && (
        <div className="bg-[#141620] border border-[#1E2030] rounded-2xl  p-4">
          <h3 className="font-bold text-white text-sm mb-2">1st Innings</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-white/70 text-sm">{allInnings[0].battingTeam}</span>
            <span className="text-white font-bold text-lg">{allInnings[0].totalRuns}/{allInnings[0].totalWickets}</span>
            <span className="text-white/50 text-xs">({allInnings[0].totalOvers} ov)</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Teams Tab - Show team lineups
 */
const TeamsTab = ({ match, currentInnings }) => {
  const team1Players = match?.team1?.players || [];
  const team2Players = match?.team2?.players || [];

  const PlayerList = ({ teamName, players, isBatting }) => (
    <div className="bg-[#141620] border border-[#1E2030] rounded-2xl  overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1E2030]/30 flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">{teamName}</h3>
        {isBatting && (
          <span className="text-xs bg-[emerald-400]/20 text-[emerald-400] px-2 py-0.5 rounded-full font-semibold">BATTING</span>
        )}
      </div>
      {players.length > 0 ? (
        <div className="divide-y divide-[#1E2030]/20">
          {players.map((player, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1E2030] flex items-center justify-center">
                <span className="text-white/70 text-xs font-bold">{i + 1}</span>
              </div>
              <span className="text-white text-sm">{player.name || player}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-white/40 text-sm">No players added</div>
      )}
    </div>
  );

  const battingTeam = currentInnings?.battingTeam;

  return (
    <div className="space-y-4">
      <PlayerList
        teamName={match?.team1?.name || 'Team 1'}
        players={team1Players}
        isBatting={battingTeam?.trim() === match?.team1?.name?.trim()}
      />
      <PlayerList
        teamName={match?.team2?.name || 'Team 2'}
        players={team2Players}
        isBatting={battingTeam?.trim() === match?.team2?.name?.trim()}
      />
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
    <div className="bg-[#141620] border border-[#1E2030] rounded-2xl  p-4">
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
