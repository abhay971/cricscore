import { motion } from 'framer-motion';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Scoreboard, RecentBalls, InningsBreak, MatchComplete, SuperOverBreak } from '../components/viewer';
import { BallInput, PlayerSelector, ScorerActions, WicketModal, ExtrasModal, DeclareOneModal } from '../components/scorer';
import { useMatchStore, useAuthStore } from '../store';
import { useWebSocketScorer } from '../hooks/useWebSocket';
import api from '../services/api';
import toast from '../utils/toast.jsx';

/**
 * Scorer Page - Protected Scorer Interface
 * Matches reference design with dark background
 */
const ScorerPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token');
  const storeToken = useAuthStore((s) => s.scorerToken);
  const token = urlToken || storeToken;

  const {
    match,
    currentInnings,
    allInnings,
    recentBalls,
    loading,
    fetchMatch,
    setMatch,
    setCurrentInnings,
    addRecentBall,
    setRecentBalls
  } = useMatchStore();
  const isTournamentScorer = useAuthStore((s) => s.isTournamentScorer);
  const { authenticateScorer, isAuthenticated, setIsAuthenticated } = useAuthStore();

  const [selectedBall, setSelectedBall] = useState(null);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showDeclareOneModal, setShowDeclareOneModal] = useState(false);
  const [extraType, setExtraType] = useState('wide');
  const [selectedStriker, setSelectedStriker] = useState(null);
  const [selectedNonStriker, setSelectedNonStriker] = useState(null);
  const [selectedBowler, setSelectedBowler] = useState(null);

  // Track previous balls count to detect over completion
  const previousBallsRef = useRef(0);

  // WebSocket callbacks for scorer
  const handleScorerAuthSuccess = useCallback((data) => {
    console.log('✅ Scorer authenticated successfully');
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  const handleScorerAuthFailed = useCallback((error) => {
    console.error('❌ Scorer authentication failed:', error);
    setIsAuthenticated(false);
  }, [setIsAuthenticated]);

  const handleScoreUpdate = useCallback(async (data) => {
    console.log('🏏 Score update received (scorer):', data);

    // Check if over just completed (balls INCREASED to a multiple of 6)
    if (data.innings) {
      const currentBalls = data.innings.balls;
      const previousBalls = previousBallsRef.current;

      // Over completed if: balls increased AND new balls is divisible by 6 AND balls > 0
      if (currentBalls > previousBalls && currentBalls > 0 && currentBalls % 6 === 0) {
        toast.info('Over complete! Please select a new bowler');
        // Clear selected bowler to force selection of new bowler
        setSelectedBowler(null);
      }

      // Update previous balls count
      previousBallsRef.current = currentBalls;

      setCurrentInnings(data.innings);

      // Fetch updated balls list to refresh "This Over" display
      try {
        const response = await api.getMatchBalls(matchId);
        if (response.data.balls) {
          setRecentBalls(response.data.balls);
        }
      } catch (error) {
        console.error('Failed to fetch balls after score update:', error);
      }
    }

    if (data.match) {
      setMatch(data.match);

      // When status changes to break/completed/super_over, re-fetch full match
      // so allInnings has the latest scores for summary screens
      if (['innings_break', 'completed', 'super_over', 'super_over_break'].includes(data.match.status)) {
        await fetchMatch(matchId);
      }
    }
  }, [setCurrentInnings, setMatch, matchId, setRecentBalls, fetchMatch]);

  const handleNewBall = useCallback(async (ball) => {
    console.log('⚪ New ball received (scorer):', ball);
    // Refetch all balls to ensure we have the latest data
    try {
      const response = await api.getMatchBalls(matchId);
      if (response.data.balls) {
        setRecentBalls(response.data.balls);
      }
    } catch (error) {
      console.error('Failed to fetch balls after new ball:', error);
    }
  }, [matchId, setRecentBalls]);

  // Set up WebSocket connection with scorer authentication
  const { isConnected } = useWebSocketScorer(matchId, token, {
    onScorerAuthSuccess: handleScorerAuthSuccess,
    onScorerAuthFailed: handleScorerAuthFailed,
    onScoreUpdate: handleScoreUpdate,
    onNewBall: handleNewBall
  });

  // Authenticate scorer and fetch match data
  useEffect(() => {
    if (matchId && token) {
      // Tournament scorers skip HTTP validation (no per-match matchId in JWT).
      // Socket auth (useWebSocketScorer) handles it by passing matchId explicitly.
      if (!isTournamentScorer) {
        authenticateScorer(token, matchId);
      }
      fetchMatch(matchId);

      // Fetch balls for current innings
      const fetchBalls = async () => {
        try {
          const response = await api.getMatchBalls(matchId);
          if (response.data.balls) {
            setRecentBalls(response.data.balls);
          }
        } catch (error) {
          console.error('Failed to fetch balls:', error);
        }
      };
      fetchBalls();
    }
  }, [matchId, token, isTournamentScorer, authenticateScorer, fetchMatch]);

  // Restore selected players from current innings when data loads
  useEffect(() => {
    if (currentInnings) {
      // Set batsmen from currentBatsmen array
      const striker = currentInnings.currentBatsmen?.find(b => b.onStrike && !b.isOut);
      const nonStriker = currentInnings.currentBatsmen?.find(b => !b.onStrike && !b.isOut);

      if (striker) setSelectedStriker(striker.playerId);
      if (nonStriker) setSelectedNonStriker(nonStriker.playerId);

      // Set bowler
      if (currentInnings.currentBowler?.playerId) {
        setSelectedBowler(currentInnings.currentBowler.playerId);
      }
    }
  }, [currentInnings]);

  // Helper: check if current innings belongs to team1 (handles both identifier and actual name)
  const isBattingTeam1 = () => {
    const bt = currentInnings?.battingTeam?.trim();
    return bt === match?.team1?.name?.trim() || bt === 'team1';
  };

  const handleBallClick = (runs) => {
    setSelectedBall({ runs, type: 'run' });
  };

  const handleDeclareOneClick = () => {
    setShowDeclareOneModal(true);
  };

  const handleExtrasClick = (type) => {
    setExtraType(type);
    setShowExtrasModal(true);
  };

  // Player selection handlers
  const handleStrikerChange = async (playerId) => {
    setSelectedStriker(playerId);

    // Only call API if both batsmen are selected
    if (playerId && selectedNonStriker) {
      // Get batting team and find player names
      const battingTeam = isBattingTeam1() ? match?.team1 : match?.team2;
      const striker = battingTeam?.players?.find(p => p.playerId === playerId);
      const nonStriker = battingTeam?.players?.find(p => p.playerId === selectedNonStriker);

      if (!striker || !nonStriker) {
        toast.error('Players not found');
        return;
      }

      try {
        // Backend expects batsmen as ARRAY with onStrike flags
        await api.setBatsmen(matchId, [
          { playerId: striker.playerId, name: striker.name, onStrike: true },
          { playerId: nonStriker.playerId, name: nonStriker.name, onStrike: false }
        ], token);
        toast.success('Batsmen updated');
      } catch (error) {
        console.error('Failed to set batsmen:', error);
        toast.error('Failed to set striker');
      }
    }
  };

  const handleNonStrikerChange = async (playerId) => {
    setSelectedNonStriker(playerId);

    // Only call API if both batsmen are selected
    if (selectedStriker && playerId) {
      // Get batting team and find player names
      const battingTeam = isBattingTeam1() ? match?.team1 : match?.team2;
      const striker = battingTeam?.players?.find(p => p.playerId === selectedStriker);
      const nonStriker = battingTeam?.players?.find(p => p.playerId === playerId);

      if (!striker || !nonStriker) {
        toast.error('Players not found');
        return;
      }

      try {
        // Backend expects batsmen as ARRAY with onStrike flags
        await api.setBatsmen(matchId, [
          { playerId: striker.playerId, name: striker.name, onStrike: true },
          { playerId: nonStriker.playerId, name: nonStriker.name, onStrike: false }
        ], token);
        toast.success('Batsmen updated');
      } catch (error) {
        console.error('Failed to set batsmen:', error);
        toast.error('Failed to set non-striker');
      }
    }
  };

  const handleBowlerChange = async (playerId) => {
    // Check if over just completed and trying to select same bowler
    const currentBalls = currentInnings?.balls || 0;
    const isOverJustCompleted = currentBalls > 0 && currentBalls % 6 === 0;

    if (isOverJustCompleted && currentInnings?.currentBowler?.playerId === playerId) {
      toast.error('Same bowler cannot bowl consecutive overs!');
      return;
    }

    setSelectedBowler(playerId);

    // Find player name from match data
    const bowlingTeam = isBattingTeam1() ? match?.team2 : match?.team1;
    const bowler = bowlingTeam?.players?.find(p => p.playerId === playerId);

    if (!bowler) {
      toast.error('Bowler not found');
      return;
    }

    try {
      await api.setBowler(matchId, { playerId: bowler.playerId, name: bowler.name }, token);
      toast.success('Bowler updated');
    } catch (error) {
      console.error('Failed to set bowler:', error);
      toast.error('Failed to set bowler');
    }
  };

  const handleWicketClick = () => {
    setShowWicketModal(true);
  };

  const handleWicketSubmit = async (wicketData) => {
    // Validate that batsmen and bowler are selected
    if (!selectedStriker || selectedStriker === '' || !selectedNonStriker || selectedNonStriker === '') {
      toast.error('Please select both batsmen first');
      return;
    }

    if (!selectedBowler || selectedBowler === '') {
      toast.error('Please select a bowler first');
      return;
    }

    try {
      // Get batting and bowling teams
      const battingTeam = isBattingTeam1() ? match?.team1 : match?.team2;
      const bowlingTeam = isBattingTeam1() ? match?.team2 : match?.team1;

      // Find player details
      const striker = battingTeam?.players?.find(p => p.playerId === selectedStriker);
      const bowler = bowlingTeam?.players?.find(p => p.playerId === selectedBowler);

      if (!striker || !bowler) {
        toast.error('Player information not found');
        return;
      }

      const ballData = {
        isWicket: true,
        runs: wicketData.runs || 0,
        isDeclareOne: selectedBall?.isDeclareOne || false,
        batsman: striker.name,  // Required field
        bowler: bowler.name,    // Required field
        wicketType: wicketData.howOut,
        dismissedPlayer: wicketData.batsmanOut,
        fielder: wicketData.fielder || ''
      };

      console.log('📤 Recording wicket:', { dismissedPlayer: wicketData.batsmanOut, striker: striker.name });
      await api.recordBall(matchId, ballData, token);
      setSelectedBall(null);

      // IMMEDIATELY clear the dismissed batsman from selection
      if (wicketData.batsmanOut === striker.name) {
        // Striker is out - clear striker selection
        console.log('❌ Clearing striker (out):', striker.name);
        setSelectedStriker(null);
      } else {
        // Check if non-striker is out
        const nonStriker = battingTeam?.players?.find(p => p.playerId === selectedNonStriker);
        if (nonStriker && wicketData.batsmanOut === nonStriker.name) {
          console.log('❌ Clearing non-striker (out):', nonStriker.name);
          setSelectedNonStriker(null);
        }
      }

      // Force fetch updated match and innings data
      try {
        // Get fresh match data first
        const matchResponse = await api.getMatch(matchId);
        const updatedMatch = matchResponse.data.match;
        setMatch(updatedMatch);

        // Now fetch innings data using the UPDATED currentInnings value
        console.log('🔄 Fetching innings:', updatedMatch.currentInnings);
        const inningsResponse = await api.getMatchInnings(matchId, updatedMatch.currentInnings);
        if (inningsResponse.data.innings) {
          const inningsData = Array.isArray(inningsResponse.data.innings)
            ? inningsResponse.data.innings[0]
            : inningsResponse.data.innings;
          if (inningsData) {
            setCurrentInnings(inningsData);
            console.log('✅ Innings updated after wicket:', inningsData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch updated data after wicket:', error);
      }

      toast.warning('WICKET! Select a new batsman to continue');

      // Check if this ball completed an over (wickets are valid deliveries)
      const ballsAfterThisBall = (currentInnings?.balls || 0) + 1;
      if (ballsAfterThisBall % 6 === 0 && ballsAfterThisBall > 0) {
        toast.info('Over complete! Please select a new bowler');
        setSelectedBowler(null);
      }

      toast.success('Wicket recorded');
    } catch (error) {
      console.error('Failed to record wicket:', error);
      toast.error('Failed to record wicket');
    }
  };

  const handleExtrasSubmit = async (extrasData) => {
    // Validate that batsmen and bowler are selected
    if (!selectedStriker || selectedStriker === '' || !selectedNonStriker || selectedNonStriker === '') {
      toast.error('Please select both batsmen first');
      return;
    }

    if (!selectedBowler || selectedBowler === '') {
      toast.error('Please select a bowler first');
      return;
    }

    try {
      // Get batting and bowling teams
      const battingTeam = isBattingTeam1() ? match?.team1 : match?.team2;
      const bowlingTeam = isBattingTeam1() ? match?.team2 : match?.team1;

      // Find player details
      const striker = battingTeam?.players?.find(p => p.playerId === selectedStriker);
      const bowler = bowlingTeam?.players?.find(p => p.playerId === selectedBowler);

      if (!striker || !bowler) {
        toast.error('Player information not found');
        return;
      }

      // Backend expects: runs (batsman runs) and extraRuns (penalty/extra runs) separately
      const ballData = {
        extraType: extrasData.type,
        runs: extrasData.additionalRuns,  // Runs scored by batsman
        extraRuns: extrasData.runs,       // Penalty runs (1 for wide/NB, or bye/legbye runs)
        isDeclareOne: selectedBall?.isDeclareOne || false,
        batsman: striker.name,
        bowler: bowler.name
      };

      console.log('📤 Sending extras ball data:', ballData);
      await api.recordBall(matchId, ballData, token);
      setSelectedBall(null);

      // Check if this ball completed an over (only if not wide/no-ball)
      const isValidDelivery = extrasData.type !== 'wide' && extrasData.type !== 'noball';
      if (isValidDelivery) {
        const ballsAfterThisBall = (currentInnings?.balls || 0) + 1;
        if (ballsAfterThisBall % 6 === 0 && ballsAfterThisBall > 0) {
          toast.info('Over complete! Please select a new bowler');
          setSelectedBowler(null);
        }
      }

      toast.success('Extras recorded');
    } catch (error) {
      console.error('Failed to record extras:', error);
      toast.error('Failed to record extras');
    }
  };

  const handleDeclareOneSubmit = async (declareData) => {
    // Validate that batsmen and bowler are selected
    if (!selectedStriker || selectedStriker === '' || !selectedNonStriker || selectedNonStriker === '') {
      toast.error('Please select both batsmen first');
      return;
    }

    if (!selectedBowler || selectedBowler === '') {
      toast.error('Please select a bowler first');
      return;
    }

    try {
      // Get batting and bowling teams
      const battingTeam = isBattingTeam1() ? match?.team1 : match?.team2;
      const bowlingTeam = isBattingTeam1() ? match?.team2 : match?.team1;

      // Find player details
      const striker = battingTeam?.players?.find(p => p.playerId === selectedStriker);
      const bowler = bowlingTeam?.players?.find(p => p.playerId === selectedBowler);

      if (!striker || !bowler) {
        toast.error('Player information not found');
        return;
      }

      let ballData;
      if (declareData.extraType === 'none') {
        // Just declare 1 run (no extra)
        ballData = {
          runs: 1,  // 1 run scored
          isDeclareOne: true,
          batsman: striker.name,
          bowler: bowler.name
        };
      } else {
        // Wide or No Ball + Declare 1
        // Backend expects: runs (batsman) and extraRuns (penalty) separately
        ballData = {
          extraType: declareData.extraType,
          runs: 1 + declareData.additionalRuns,  // Declare 1 run + additional runs scored
          extraRuns: 1,  // Penalty for wide/no-ball
          isDeclareOne: true,
          batsman: striker.name,
          bowler: bowler.name
        };
      }

      await api.recordBall(matchId, ballData, token);
      setSelectedBall(null);

      // Check if this ball completed an over (only if not wide/no-ball)
      const isValidDelivery = declareData.extraType === 'none';
      if (isValidDelivery) {
        const ballsAfterThisBall = (currentInnings?.balls || 0) + 1;
        if (ballsAfterThisBall % 6 === 0 && ballsAfterThisBall > 0) {
          toast.info('Over complete! Please select a new bowler');
          setSelectedBowler(null);
        }
      }

      toast.success('Declare 1 Run recorded');
    } catch (error) {
      console.error('Failed to record declare 1:', error);
      toast.error('Failed to record declare 1');
    }
  };

  const handleAction = async () => {
    if (!selectedBall) return;

    // Debug: Log current selections
    console.log('🔍 Player selections:', { selectedStriker, selectedNonStriker, selectedBowler });

    // Validate that batsmen and bowler are selected
    if (!selectedStriker || selectedStriker === '' || !selectedNonStriker || selectedNonStriker === '') {
      toast.error('Please select both batsmen first');
      console.log('❌ Validation failed: batsmen not selected');
      return;
    }

    if (!selectedBowler || selectedBowler === '') {
      // Check if this is because over just completed
      if (currentInnings?.balls > 0 && currentInnings?.balls % 6 === 0) {
        toast.error('Over complete! Please select a new bowler');
      } else {
        toast.error('Please select a bowler first');
      }
      console.log('❌ Validation failed: bowler not selected');
      return;
    }

    try {
      // Get batting and bowling teams
      const battingTeam = isBattingTeam1() ? match?.team1 : match?.team2;
      const bowlingTeam = isBattingTeam1() ? match?.team2 : match?.team1;

      // Find player details
      const striker = battingTeam?.players?.find(p => p.playerId === selectedStriker);
      const bowler = bowlingTeam?.players?.find(p => p.playerId === selectedBowler);

      if (!striker || !bowler) {
        toast.error('Player information not found');
        return;
      }

      // Include player info when recording the ball
      const ballData = {
        ...selectedBall,
        batsman: striker.name,  // Just the name as string
        bowler: bowler.name     // Just the name as string
      };

      await api.recordBall(matchId, ballData, token);
      setSelectedBall(null);

      // Check if this ball completed an over (was 5 valid balls, now will be 6)
      const wasValidDelivery = !selectedBall.isDeclareOne && selectedBall.type === 'run';
      if (wasValidDelivery) {
        const ballsAfterThisBall = (currentInnings?.balls || 0) + 1;
        if (ballsAfterThisBall % 6 === 0 && ballsAfterThisBall > 0) {
          console.log('🔄 OVER COMPLETE! Clearing bowler selection');
          setSelectedBowler(null);
          toast.warning('OVER COMPLETE! Select a different bowler to continue', { duration: 5000 });
        } else {
          toast.success('Ball recorded');
        }
      } else {
        toast.success('Ball recorded');
      }
    } catch (error) {
      console.error('Failed to record ball:', error);
      toast.error('Failed to record ball');
    }
  };

  const handleUndo = async () => {
    try {
      await api.undoBall(matchId, token);
      toast.success('Last ball undone');
    } catch (error) {
      console.error('Failed to undo:', error);
      toast.error('Failed to undo ball');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading scorer panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg-elevated p-8 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-white/70">
            Invalid or missing scorer token. Please use the correct scorer URL.
          </p>
        </div>
      </div>
    );
  }

  // Handle Innings Break (scorer can start next innings)
  const handleStartNextInnings = async () => {
    console.log('🎯 Start 2nd innings button clicked!');
    console.log('Match ID:', matchId, 'Token:', token ? 'Present' : 'Missing');

    try {
      console.log('📡 Calling api.startInnings...');
      const response = await api.startInnings(matchId, token);
      console.log('✅ API response:', response);

      toast.success('2nd innings started');

      // Clear 1st innings balls, player selections, and refresh match data
      setRecentBalls([]);
      setSelectedStriker(null);
      setSelectedNonStriker(null);
      setSelectedBowler(null);
      previousBallsRef.current = 0;
      await fetchMatch(matchId);
    } catch (error) {
      console.error('❌ Failed to start next innings:', error);
      toast.error('Failed to start next innings');
    }
  };

  // Handle Start Super Over
  const handleStartSuperOver = async () => {
    try {
      await api.startSuperOver(matchId, token);
      toast.success('Super Over started!');
      setRecentBalls([]);
      setSelectedStriker(null);
      setSelectedNonStriker(null);
      setSelectedBowler(null);
      previousBallsRef.current = 0;
      await fetchMatch(matchId);
    } catch (error) {
      console.error('Failed to start Super Over:', error);
      toast.error('Failed to start Super Over');
    }
  };

  // Handle Start SO 2nd innings (from super_over_break)
  const handleStartSONextInnings = async () => {
    try {
      await api.startInnings(matchId, token);
      toast.success('SO 2nd innings started!');
      setRecentBalls([]);
      setSelectedStriker(null);
      setSelectedNonStriker(null);
      setSelectedBowler(null);
      previousBallsRef.current = 0;
      await fetchMatch(matchId);
    } catch (error) {
      console.error('Failed to start SO next innings:', error);
      toast.error('Failed to start next innings');
    }
  };

  // Show Super Over screen (match tied, SO pending)
  if (match?.status === 'super_over') {
    const inn1 = allInnings?.find(i => i.inningsNumber === 1);
    const inn2 = allInnings?.find(i => i.inningsNumber === 2);
    return (
      <SuperOverBreak
        match={match}
        innings1={inn1}
        innings2={inn2}
        onStartSuperOver={handleStartSuperOver}
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
        onStartNextInnings={handleStartSONextInnings}
        isSuperOver={true}
      />
    );
  }

  // Show Innings Break screen - pass 1st innings data (not the empty 2nd innings)
  if (match?.status === 'innings_break') {
    const firstInnings = allInnings?.find(i => i.inningsNumber === 1) || allInnings?.[0] || currentInnings;

    return (
      <InningsBreak
        match={match}
        innings={firstInnings}
        onStartNextInnings={handleStartNextInnings}
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <button onClick={() => navigate(-1)} className="text-white mb-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-white">Scoreboard</h1>
          </div>

          {/* Ball Running toggle */}
          <div className="flex items-center gap-2 text-white text-sm">
            <span>Ball Running</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" id="ball-running" />
              <label htmlFor="ball-running" className="cursor-pointer">
                <div className="w-11 h-6 bg-white/20 rounded-full"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* 1st Innings Summary (shown during 2nd innings) */}
          {match?.currentInnings === 2 && allInnings?.[0] && (
            <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm">{allInnings[0].battingTeam || match?.team1?.name}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-lg">{allInnings[0].totalRuns}/{allInnings[0].totalWickets}</span>
                <span className="text-white/50 text-xs">({allInnings[0].totalOvers} ov)</span>
              </div>
            </div>
          )}

          {/* SO 1st Innings Summary (shown during SO 2nd innings) */}
          {match?.currentInnings === 4 && (() => {
            const soInn3 = allInnings?.find(i => i.inningsNumber === 3);
            return soInn3 ? (
              <div className="bg-[#353647] border border-amber-500/30 rounded-[24px] p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-[#2C2D3F] text-[10px] font-bold px-2 py-0.5 rounded-full">SO</span>
                  <span className="text-white/70 text-sm">{soInn3.battingTeam}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-lg">{soInn3.totalRuns}/{soInn3.totalWickets}</span>
                  <span className="text-white/50 text-xs">({soInn3.totalOvers} ov)</span>
                </div>
              </div>
            ) : null;
          })()}

          {/* Scoreboard */}
          <Scoreboard match={match} innings={currentInnings} />

          {/* Recent balls */}
          <RecentBalls
            balls={recentBalls}
            partnership={currentInnings?.partnership || { runs: 0, balls: 0 }}
            currentInningsNumber={match?.currentInnings}
          />

          {/* Player selectors */}
          <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg p-4">
            <PlayerSelector
              match={match}
              currentInnings={currentInnings}
              striker={selectedStriker}
              nonStriker={selectedNonStriker}
              bowler={selectedBowler}
              onStrikerChange={handleStrikerChange}
              onNonStrikerChange={handleNonStrikerChange}
              onBowlerChange={handleBowlerChange}
            />
          </div>

          {/* Ball input grid */}
          <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg p-4 mb-4">
            <BallInput
              onBallClick={handleBallClick}
              onExtrasClick={handleExtrasClick}
              onWicketClick={handleWicketClick}
              onDeclareOneClick={match?.customRules?.declareOneEnabled ? handleDeclareOneClick : null}
            />

            {/* Selected ball indicator */}
            {selectedBall && (
              <div className="mt-3 p-3 bg-brand-blue/10 rounded-lg border border-brand-blue/20">
                <div className="text-sm text-center">
                  <span className="font-bold text-brand-blue">
                    Selected: {selectedBall.isDeclareOne ? 'DECLARE 1 RUN' : selectedBall.type === 'run' ? `${selectedBall.runs} runs` : selectedBall.type.toUpperCase()}
                  </span>
                  {selectedBall.isDeclareOne && (
                    <div className="mt-1 text-xs text-brand-blue/80">
                      (Strike won't change)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg p-4">
            <ScorerActions
              onAction={handleAction}
              onReview={() => {}}
              onUndo={handleUndo}
            />
          </div>
        </motion.div>
      </div>

      {/* Wicket Modal */}
      <WicketModal
        isOpen={showWicketModal}
        onClose={() => setShowWicketModal(false)}
        onSubmit={handleWicketSubmit}
        batsmen={currentInnings?.currentBatsmen?.filter(b => !b.isOut) || []}
      />

      {/* Extras Modal */}
      <ExtrasModal
        isOpen={showExtrasModal}
        onClose={() => setShowExtrasModal(false)}
        onSubmit={handleExtrasSubmit}
        extraType={extraType}
      />

      {/* Declare One Modal */}
      <DeclareOneModal
        isOpen={showDeclareOneModal}
        onClose={() => setShowDeclareOneModal(false)}
        onSubmit={handleDeclareOneSubmit}
      />
    </div>
  );
};

export default ScorerPage;
