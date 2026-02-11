import express from 'express';
import { Match, Innings, Ball } from '../models/index.js';
import { authenticateScorer } from '../middleware/auth.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { scorerLimiter } from '../middleware/rateLimiter.js';
import {
  shouldStrikeChange,
  calculateStrikeRate,
  calculateEconomy,
  calculateRunRate,
  calculateRequiredRunRate,
  ballsToOvers,
  isOverComplete,
  calculateTotalExtras,
  shouldInningsEnd,
  generateCommentary
} from '../utils/cricketCalculations.js';
import {
  getCurrentOver,
  validateBallInput
} from '../utils/matchHelpers.js';
import {
  broadcastScoreUpdate,
  broadcastNewBall,
  broadcastCommentary,
  broadcastInningsEnd,
  broadcastMatchEnd
} from '../socket/index.js';
import { io } from '../server.js';

const router = express.Router();

// All routes require scorer authentication
router.use(authenticateScorer);

/**
 * POST /api/scorer/auth
 * Validate scorer token
 */
router.post('/auth', asyncHandler(async (req, res) => {
  // Token already validated by middleware
  res.json({
    success: true,
    data: {
      matchId: req.match.matchId,
      match: req.match
    },
    message: 'Scorer authenticated successfully'
  });
}));

/**
 * POST /api/scorer/ball
 * Record a ball (including declare 1 support)
 */
router.post('/ball', scorerLimiter, asyncHandler(async (req, res) => {
  const {
    batsman,
    bowler,
    runs = 0,
    extraType = 'none',
    extraRuns = 0,
    isDeclareOne = false,
    isWicket = false,
    wicketType = 'none',
    dismissedPlayer = '',
    fielder = ''
  } = req.body;

  const match = req.match;

  // Validate inputs
  const validation = validateBallInput({ runs, extraType, isDeclareOne, isWicket });
  if (!validation.valid) {
    throw new ApiError(400, validation.error, 'INVALID_BALL_INPUT');
  }

  // Get current innings
  const innings = await Innings.findOne({
    matchId: match.matchId,
    inningsNumber: match.currentInnings
  });

  if (!innings) {
    throw new ApiError(404, 'Current innings not found', 'INNINGS_NOT_FOUND');
  }

  // Start innings if not started
  if (innings.status === 'not_started') {
    innings.status = 'in_progress';
    match.status = 'live';
  }

  // Get current over and ball number
  const { overNumber, ballNumber } = getCurrentOver(innings.balls);

  // Determine if this is a valid delivery (not wide or no-ball)
  const isValidDelivery = extraType !== 'wide' && extraType !== 'noball';

  // Calculate total runs for this ball
  const totalRunsThisBall = runs + extraRuns;

  // Create ball record
  const ball = new Ball({
    matchId: match.matchId,
    inningsNumber: match.currentInnings,
    overNumber,
    ballNumber: isValidDelivery ? ballNumber : innings.balls % 6 || 6,
    batsman,
    bowler,
    runs,
    extras: {
      type: extraType,
      runs: extraRuns
    },
    isDeclareOne,
    isWicket,
    wicketType,
    dismissedPlayer: isWicket ? dismissedPlayer : '',
    fielder: isWicket ? fielder : '',
    strikeChanged: false // Will be calculated
  });

  // Determine if strike should change
  const isOverCompleteNow = isValidDelivery && isOverComplete(innings.balls % 6 + 1);
  ball.strikeChanged = shouldStrikeChange({
    runs,
    isDeclareOne,
    isWicket,
    extraType,
    isOverComplete: isOverCompleteNow
  });

  // Generate commentary
  ball.commentary = generateCommentary({
    batsman,
    bowler,
    runs,
    isWicket,
    wicketType,
    dismissedPlayer,
    fielder,
    isDeclareOne,
    extraType,
    extraRuns,
    overNumber,
    ballNumber: ball.ballNumber
  });

  await ball.save();

  // Update innings stats
  innings.totalRuns += totalRunsThisBall;
  if (isWicket) innings.totalWickets += 1;

  // Update balls count (only for valid deliveries)
  if (isValidDelivery) {
    innings.balls += 1;
    innings.totalOvers = parseFloat(ballsToOvers(innings.balls));
  }

  // Update extras
  if (extraType === 'wide') innings.extras.wides += extraRuns;
  else if (extraType === 'noball') innings.extras.noBalls += extraRuns;
  else if (extraType === 'bye') innings.extras.byes += extraRuns;
  else if (extraType === 'legbye') innings.extras.legByes += extraRuns;

  // Update batsman stats (case-insensitive lookup)
  const batsmanIndex = innings.currentBatsmen.findIndex(b =>
    b.name?.trim().toLowerCase() === batsman?.trim().toLowerCase() && !b.isOut
  );
  if (batsmanIndex !== -1) {
    const batsmanStats = innings.currentBatsmen[batsmanIndex];
    batsmanStats.runs += runs;
    if (isValidDelivery) batsmanStats.balls += 1;
    if (runs === 4) batsmanStats.fours += 1;
    if (runs === 6) batsmanStats.sixes += 1;
    batsmanStats.strikeRate = calculateStrikeRate(batsmanStats.runs, batsmanStats.balls);

    // Handle strike change
    if (ball.strikeChanged) {
      // Toggle strike
      innings.currentBatsmen.forEach(b => {
        if (!b.isOut) {
          b.onStrike = !b.onStrike;
        }
      });
    }

    // Wicket marking is handled in the single consolidated block below
  }

  // Handle wicket - mark the dismissed player as out (works for both striker and non-striker)
  if (isWicket && dismissedPlayer) {
    console.log('🏏 Processing wicket:', {
      dismissedPlayer,
      wicketType,
      batsman,
      isWicket,
      currentBatsmen: innings.currentBatsmen.map(b => ({ name: b.name, isOut: b.isOut }))
    });

    // Try to find the dismissed batsman (case-insensitive, trimmed)
    const dismissedBatsmanIndex = innings.currentBatsmen.findIndex(b =>
      b.name?.trim().toLowerCase() === dismissedPlayer?.trim().toLowerCase() && !b.isOut
    );

    console.log('📍 Found dismissed batsman at index:', dismissedBatsmanIndex);

    if (dismissedBatsmanIndex !== -1) {
      // Mark batsman as out (works for both striker and non-striker)
      innings.currentBatsmen[dismissedBatsmanIndex].isOut = true;
      innings.currentBatsmen[dismissedBatsmanIndex].dismissalType = wicketType;
      innings.currentBatsmen[dismissedBatsmanIndex].onStrike = false;
      console.log('✅ Batsman marked as out:', innings.currentBatsmen[dismissedBatsmanIndex].name);
    } else {
      console.error('❌ Could not find dismissed batsman:', dismissedPlayer);
      console.error('Available batsmen:', innings.currentBatsmen.map(b => b.name));
    }

    console.log('📊 Current batsmen after wicket:', innings.currentBatsmen.map(b => ({
      name: b.name,
      isOut: b.isOut,
      runs: b.runs
    })));
  }

  // Update bowler stats (case-insensitive)
  if (innings.currentBowler && innings.currentBowler.name?.trim().toLowerCase() === bowler?.trim().toLowerCase()) {
    innings.currentBowler.runs += totalRunsThisBall;
    if (isValidDelivery) {
      innings.currentBowler.balls += 1;
      innings.currentBowler.overs = parseFloat(ballsToOvers(innings.currentBowler.balls));
    }
    if (isWicket) innings.currentBowler.wickets += 1;
    innings.currentBowler.economy = calculateEconomy(innings.currentBowler.runs, innings.currentBowler.balls);

    // Sync to bowlers array
    const bowlerIdx = innings.bowlers.findIndex(b =>
      b.name?.trim().toLowerCase() === bowler?.trim().toLowerCase()
    );
    if (bowlerIdx !== -1) {
      innings.bowlers[bowlerIdx] = { ...innings.currentBowler.toObject() };
    } else {
      innings.bowlers.push({ ...innings.currentBowler.toObject() });
    }
  }

  // Calculate run rates
  innings.runRate = calculateRunRate(innings.totalRuns, innings.balls);

  // Calculate required run rate for chasing innings (2nd or SO 2nd)
  if ((match.currentInnings === 2 || match.currentInnings === 4) && innings.target) {
    const effectiveMaxOvers = innings.isSuperOver ? 1 : match.overs;
    const ballsRemaining = (effectiveMaxOvers * 6) - innings.balls;
    innings.requiredRunRate = calculateRequiredRunRate(innings.target, innings.totalRuns, ballsRemaining);
  }

  // Compute batting team's player count for variable team sizes
  const isTeam1Batting = innings.battingTeam === match.team1.name || innings.battingTeam === 'team1';
  const battingTeamData = isTeam1Batting ? match.team1 : match.team2;
  const totalPlayers = battingTeamData.players.length;

  // For Super Over innings: 1 over max, 3 players (2 wickets max)
  const effectiveMaxOvers = innings.isSuperOver ? 1 : match.overs;
  const effectiveTotalPlayers = innings.isSuperOver ? 3 : totalPlayers;

  // Check if innings should end
  console.log('🔍 Checking if innings should end:', {
    totalWickets: innings.totalWickets,
    balls: innings.balls,
    maxOvers: effectiveMaxOvers,
    totalBallsAllowed: effectiveMaxOvers * 6,
    target: innings.target,
    totalRuns: innings.totalRuns,
    totalPlayers: effectiveTotalPlayers,
    maxWickets: effectiveTotalPlayers - 1,
    isSuperOver: innings.isSuperOver
  });

  const shouldEnd = shouldInningsEnd(
    innings.totalWickets,
    innings.balls,
    effectiveMaxOvers,
    innings.target,
    innings.totalRuns,
    effectiveTotalPlayers
  );

  console.log('🏁 Should innings end?', shouldEnd);

  if (shouldEnd) {
    innings.status = 'completed';

    // Final sync of current bowler to bowlers array
    if (innings.currentBowler && innings.currentBowler.name) {
      const finalBowlerIdx = innings.bowlers.findIndex(b =>
        b.name?.trim().toLowerCase() === innings.currentBowler.name?.trim().toLowerCase()
      );
      if (finalBowlerIdx !== -1) {
        innings.bowlers[finalBowlerIdx] = { ...innings.currentBowler.toObject() };
      } else {
        innings.bowlers.push({ ...innings.currentBowler.toObject() });
      }
    }

    // Handle innings transition
    if (match.currentInnings === 1) {
      // Set target for second innings
      const secondInnings = new Innings({
        matchId: match.matchId,
        inningsNumber: 2,
        battingTeam: innings.bowlingTeam,
        bowlingTeam: innings.battingTeam,
        target: innings.totalRuns + 1,
        status: 'not_started'
      });
      await secondInnings.save();

      match.currentInnings = 2;
      match.status = 'innings_break';

      // Broadcast innings end
      broadcastInningsEnd(io, match.matchId, {
        inningsNumber: 1,
        innings: innings.toObject()
      });
    } else if (match.currentInnings === 2) {
      // 2nd innings completed — determine winner or trigger Super Over

      const firstInnings = await Innings.findOne({
        matchId: match.matchId,
        inningsNumber: 1
      });

      const resolveTeamName = (name) => {
        if (name === 'team1') return match.team1.name;
        if (name === 'team2') return match.team2.name;
        return name;
      };

      if (innings.totalRuns > firstInnings.totalRuns) {
        const wicketsRemaining = (totalPlayers - 1) - innings.totalWickets;
        const winnerName = resolveTeamName(innings.battingTeam);
        match.winner = winnerName;
        match.result = `${winnerName} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`;
        match.status = 'completed';

        broadcastMatchEnd(io, match.matchId, {
          winner: match.winner,
          result: match.result,
          match: match.toObject()
        });
      } else if (innings.totalRuns < firstInnings.totalRuns) {
        const runsDifference = firstInnings.totalRuns - innings.totalRuns;
        const winnerName = resolveTeamName(firstInnings.battingTeam);
        match.winner = winnerName;
        match.result = `${winnerName} won by ${runsDifference} run${runsDifference !== 1 ? 's' : ''}`;
        match.status = 'completed';

        broadcastMatchEnd(io, match.matchId, {
          winner: match.winner,
          result: match.result,
          match: match.toObject()
        });
      } else {
        // TIE — trigger Super Over
        match.isSuperOver = true;
        match.status = 'super_over';

        broadcastInningsEnd(io, match.matchId, {
          inningsNumber: 2,
          innings: innings.toObject(),
          superOver: true
        });
      }
    } else if (match.currentInnings === 3) {
      // Super Over 1st innings completed — create SO 2nd innings
      const soSecondInnings = new Innings({
        matchId: match.matchId,
        inningsNumber: 4,
        isSuperOver: true,
        battingTeam: innings.bowlingTeam,
        bowlingTeam: innings.battingTeam,
        target: innings.totalRuns + 1,
        status: 'not_started'
      });
      await soSecondInnings.save();

      match.currentInnings = 4;
      match.status = 'super_over_break';

      broadcastInningsEnd(io, match.matchId, {
        inningsNumber: 3,
        innings: innings.toObject()
      });
    } else if (match.currentInnings === 4) {
      // Super Over 2nd innings completed — determine SO winner
      match.status = 'completed';

      const soFirstInnings = await Innings.findOne({
        matchId: match.matchId,
        inningsNumber: 3
      });

      const resolveTeamName = (name) => {
        if (name === 'team1') return match.team1.name;
        if (name === 'team2') return match.team2.name;
        return name;
      };

      if (innings.totalRuns > soFirstInnings.totalRuns) {
        const winnerName = resolveTeamName(innings.battingTeam);
        match.winner = winnerName;
        match.result = `${winnerName} won in Super Over`;
      } else if (innings.totalRuns < soFirstInnings.totalRuns) {
        const winnerName = resolveTeamName(soFirstInnings.battingTeam);
        match.winner = winnerName;
        match.result = `${winnerName} won in Super Over`;
      } else {
        match.winner = 'Tie';
        match.result = 'Match tied (Super Over tied)';
      }

      broadcastMatchEnd(io, match.matchId, {
        winner: match.winner,
        result: match.result,
        match: match.toObject()
      });
    }
  }

  await innings.save();
  await match.save();

  // Broadcast updates
  broadcastNewBall(io, match.matchId, ball.toObject());
  broadcastScoreUpdate(io, match.matchId, {
    innings: innings.toObject(),
    match: match.toObject()
  });
  broadcastCommentary(io, match.matchId, ball.commentary);

  res.json({
    success: true,
    data: {
      ball,
      innings,
      match,
      inningsEnded: shouldEnd
    },
    message: 'Ball recorded successfully'
  });
}));

/**
 * DELETE /api/scorer/ball/undo
 * Undo the last ball
 */
router.delete('/ball/undo', asyncHandler(async (req, res) => {
  const match = req.match;

  // Get current innings
  const innings = await Innings.findOne({
    matchId: match.matchId,
    inningsNumber: match.currentInnings
  });

  if (!innings) {
    throw new ApiError(404, 'Current innings not found', 'INNINGS_NOT_FOUND');
  }

  // Get last ball
  const lastBall = await Ball.findOne({
    matchId: match.matchId,
    inningsNumber: match.currentInnings
  }).sort({ createdAt: -1 });

  if (!lastBall) {
    throw new ApiError(404, 'No ball to undo', 'NO_BALL_TO_UNDO');
  }

  // Reverse all the changes made by this ball
  const totalRunsThisBall = lastBall.runs + lastBall.extras.runs;
  innings.totalRuns -= totalRunsThisBall;

  if (lastBall.isWicket) {
    innings.totalWickets -= 1;
  }

  const isValidDelivery = lastBall.extras.type !== 'wide' && lastBall.extras.type !== 'noball';
  if (isValidDelivery) {
    innings.balls -= 1;
    innings.totalOvers = parseFloat(ballsToOvers(innings.balls));
  }

  // Reverse extras
  if (lastBall.extras.type === 'wide') innings.extras.wides -= lastBall.extras.runs;
  else if (lastBall.extras.type === 'noball') innings.extras.noBalls -= lastBall.extras.runs;
  else if (lastBall.extras.type === 'bye') innings.extras.byes -= lastBall.extras.runs;
  else if (lastBall.extras.type === 'legbye') innings.extras.legByes -= lastBall.extras.runs;

  // Reverse batsman stats (case-insensitive lookup)
  const batsmanIndex = innings.currentBatsmen.findIndex(b =>
    b.name?.trim().toLowerCase() === lastBall.batsman?.trim().toLowerCase()
  );
  if (batsmanIndex !== -1) {
    const batsmanStats = innings.currentBatsmen[batsmanIndex];
    batsmanStats.runs -= lastBall.runs;
    if (isValidDelivery) batsmanStats.balls -= 1;
    if (lastBall.runs === 4) batsmanStats.fours -= 1;
    if (lastBall.runs === 6) batsmanStats.sixes -= 1;
    batsmanStats.strikeRate = calculateStrikeRate(batsmanStats.runs, batsmanStats.balls);
  }

  // Reverse wicket dismissal (handles both striker and non-striker, case-insensitive)
  if (lastBall.isWicket && lastBall.dismissedPlayer) {
    const dismissedIndex = innings.currentBatsmen.findIndex(b =>
      b.name?.trim().toLowerCase() === lastBall.dismissedPlayer?.trim().toLowerCase() && b.isOut
    );
    if (dismissedIndex !== -1) {
      innings.currentBatsmen[dismissedIndex].isOut = false;
      innings.currentBatsmen[dismissedIndex].dismissalType = '';
    }
  }

  // Reverse bowler stats (case-insensitive)
  if (innings.currentBowler && innings.currentBowler.name?.trim().toLowerCase() === lastBall.bowler?.trim().toLowerCase()) {
    innings.currentBowler.runs -= totalRunsThisBall;
    if (isValidDelivery) {
      innings.currentBowler.balls -= 1;
      innings.currentBowler.overs = parseFloat(ballsToOvers(innings.currentBowler.balls));
    }
    if (lastBall.isWicket) innings.currentBowler.wickets -= 1;
    innings.currentBowler.economy = calculateEconomy(innings.currentBowler.runs, innings.currentBowler.balls);

    // Sync reversed stats to bowlers array
    const bowlerIdx = innings.bowlers.findIndex(b =>
      b.name?.trim().toLowerCase() === lastBall.bowler?.trim().toLowerCase()
    );
    if (bowlerIdx !== -1) {
      innings.bowlers[bowlerIdx] = { ...innings.currentBowler.toObject() };
    }
  }

  // Recalculate run rates
  innings.runRate = calculateRunRate(innings.totalRuns, innings.balls);
  if ((match.currentInnings === 2 || match.currentInnings === 4) && innings.target) {
    const effectiveMaxOvers = innings.isSuperOver ? 1 : match.overs;
    const ballsRemaining = (effectiveMaxOvers * 6) - innings.balls;
    innings.requiredRunRate = calculateRequiredRunRate(innings.target, innings.totalRuns, ballsRemaining);
  }

  await innings.save();

  // Delete the ball
  await lastBall.deleteOne();

  // Broadcast update
  broadcastScoreUpdate(io, match.matchId, {
    innings: innings.toObject(),
    match: match.toObject(),
    action: 'undo'
  });

  res.json({
    success: true,
    data: {
      innings,
      match
    },
    message: 'Ball undone successfully'
  });
}));

/**
 * POST /api/scorer/innings/end
 * Manually end current innings
 */
router.post('/innings/end', asyncHandler(async (req, res) => {
  const match = req.match;

  const innings = await Innings.findOne({
    matchId: match.matchId,
    inningsNumber: match.currentInnings
  });

  if (!innings) {
    throw new ApiError(404, 'Current innings not found', 'INNINGS_NOT_FOUND');
  }

  innings.status = 'completed';
  await innings.save();

  if (match.currentInnings === 1) {
    // Create second innings
    const secondInnings = new Innings({
      matchId: match.matchId,
      inningsNumber: 2,
      battingTeam: innings.bowlingTeam,
      bowlingTeam: innings.battingTeam,
      target: innings.totalRuns + 1,
      status: 'not_started'
    });
    await secondInnings.save();

    match.currentInnings = 2;
    match.status = 'innings_break';

    broadcastInningsEnd(io, match.matchId, {
      inningsNumber: 1,
      innings: innings.toObject()
    });
  }

  await match.save();

  res.json({
    success: true,
    data: {
      innings,
      match
    },
    message: 'Innings ended successfully'
  });
}));

/**
 * POST /api/scorer/innings/start
 * Start next innings (from innings break)
 */
router.post('/innings/start', asyncHandler(async (req, res) => {
  const match = req.match;

  // Can start innings from innings_break or super_over_break
  if (match.status !== 'innings_break' && match.status !== 'super_over_break') {
    throw new ApiError(400, 'Match is not at an innings break', 'INVALID_STATUS');
  }

  // Find the next innings dynamically by current match innings number
  const nextInnings = await Innings.findOne({
    matchId: match.matchId,
    inningsNumber: match.currentInnings
  });

  if (!nextInnings) {
    throw new ApiError(404, 'Next innings not found', 'INNINGS_NOT_FOUND');
  }

  // Start the next innings
  nextInnings.status = 'in_progress';
  await nextInnings.save();

  // Update match status
  match.status = 'live';
  await match.save();

  // Broadcast innings start
  io.to(match.matchId).emit('innings:start', {
    inningsNumber: match.currentInnings,
    match: match.toObject(),
    innings: nextInnings.toObject()
  });

  res.json({
    success: true,
    data: {
      match,
      innings: nextInnings
    },
    message: `Innings ${match.currentInnings} started successfully`
  });
}));

/**
 * POST /api/scorer/superover/start
 * Start Super Over (creates SO innings 3)
 */
router.post('/superover/start', asyncHandler(async (req, res) => {
  const match = req.match;

  if (match.status !== 'super_over') {
    throw new ApiError(400, 'Match is not in super over state', 'INVALID_STATUS');
  }

  // Per cricket rules: team that batted 2nd in main match bats first in SO
  const secondInnings = await Innings.findOne({
    matchId: match.matchId,
    inningsNumber: 2
  });

  if (!secondInnings) {
    throw new ApiError(404, '2nd innings not found', 'INNINGS_NOT_FOUND');
  }

  // Create SO 1st innings (innings 3)
  const soFirstInnings = new Innings({
    matchId: match.matchId,
    inningsNumber: 3,
    isSuperOver: true,
    battingTeam: secondInnings.battingTeam,
    bowlingTeam: secondInnings.bowlingTeam,
    status: 'not_started'
  });
  await soFirstInnings.save();

  match.currentInnings = 3;
  match.status = 'live';
  await match.save();

  io.to(match.matchId).emit('innings:start', {
    inningsNumber: 3,
    match: match.toObject(),
    innings: soFirstInnings.toObject(),
    superOver: true
  });

  res.json({
    success: true,
    data: {
      match,
      innings: soFirstInnings
    },
    message: 'Super Over started'
  });
}));

/**
 * POST /api/scorer/match/end
 * End match with result
 */
router.post('/match/end', asyncHandler(async (req, res) => {
  const { winner, result } = req.body;
  const match = req.match;

  match.status = 'completed';
  match.winner = winner;
  match.result = result;

  await match.save();

  broadcastMatchEnd(io, match.matchId, {
    winner: match.winner,
    result: match.result,
    match: match.toObject()
  });

  res.json({
    success: true,
    data: {
      match
    },
    message: 'Match ended successfully'
  });
}));

/**
 * POST /api/scorer/batsmen/set
 * Set current batsmen
 */
router.post('/batsmen/set', asyncHandler(async (req, res) => {
  const { batsmen } = req.body; // Array of { name, onStrike }
  const match = req.match;

  if (!batsmen || batsmen.length !== 2) {
    throw new ApiError(400, 'Exactly 2 batsmen required', 'INVALID_BATSMEN');
  }

  const innings = await Innings.findOne({
    matchId: match.matchId,
    inningsNumber: match.currentInnings
  });

  if (!innings) {
    throw new ApiError(404, 'Current innings not found', 'INNINGS_NOT_FOUND');
  }

  // Set current batsmen - PRESERVE ALL existing batsmen (including out ones)
  console.log('🔄 Setting batsmen. Incoming:', batsmen);
  console.log('📊 Current batsmen before update:', innings.currentBatsmen.map(b => ({ name: b.name, runs: b.runs, balls: b.balls, isOut: b.isOut })));

  // First, set all existing batsmen to NOT on strike
  innings.currentBatsmen.forEach(b => {
    b.onStrike = false;
  });

  // Then update or add the new batsmen
  batsmen.forEach(b => {
    // Check if this batsman already exists (including out ones)
    const existing = innings.currentBatsmen.find(bat =>
      bat.name?.trim().toLowerCase() === b.name?.trim().toLowerCase()
    );

    console.log(`🔍 Looking for existing batsman "${b.name}":`, existing ? `FOUND (${existing.runs} runs, ${existing.balls} balls, isOut: ${existing.isOut})` : 'NOT FOUND (new batsman)');

    if (existing) {
      // Keep existing stats, only update onStrike
      existing.onStrike = b.onStrike || false;
      console.log(`✅ Updated existing batsman: ${existing.name}, onStrike: ${existing.onStrike}`);
    } else {
      // New batsman - create fresh entry and ADD to array
      const newBatsman = {
        playerId: b.playerId || b.name.toLowerCase().replace(/\s+/g, '-'),
        name: b.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        onStrike: b.onStrike || false,
        isOut: false,
        dismissalType: ''
      };
      innings.currentBatsmen.push(newBatsman);
      console.log(`➕ Added new batsman: ${newBatsman.name}`);
    }
  });

  console.log('✅ Updated batsmen array:', innings.currentBatsmen.map(b => ({ name: b.name, runs: b.runs, balls: b.balls, isOut: b.isOut, onStrike: b.onStrike })));

  await innings.save();

  broadcastScoreUpdate(io, match.matchId, {
    innings: innings.toObject(),
    match: match.toObject()
  });

  res.json({
    success: true,
    data: {
      innings
    },
    message: 'Batsmen set successfully'
  });
}));

/**
 * POST /api/scorer/bowler/set
 * Set current bowler
 */
router.post('/bowler/set', asyncHandler(async (req, res) => {
  const { bowler } = req.body;
  const match = req.match;

  if (!bowler || !bowler.name) {
    throw new ApiError(400, 'Bowler name required', 'INVALID_BOWLER');
  }

  const innings = await Innings.findOne({
    matchId: match.matchId,
    inningsNumber: match.currentInnings
  });

  if (!innings) {
    throw new ApiError(404, 'Current innings not found', 'INNINGS_NOT_FOUND');
  }

  // Save outgoing bowler's stats to bowlers array
  if (innings.currentBowler && innings.currentBowler.name) {
    const existingIdx = innings.bowlers.findIndex(b =>
      b.name?.trim().toLowerCase() === innings.currentBowler.name?.trim().toLowerCase()
    );
    if (existingIdx !== -1) {
      // Update existing entry
      innings.bowlers[existingIdx] = { ...innings.currentBowler.toObject() };
    } else {
      // Add new entry
      innings.bowlers.push({ ...innings.currentBowler.toObject() });
    }
  }

  // Check if new bowler already bowled before (returning bowler)
  const returningBowler = innings.bowlers.find(b =>
    b.name?.trim().toLowerCase() === bowler.name?.trim().toLowerCase()
  );

  if (returningBowler) {
    // Restore their previous stats
    innings.currentBowler = {
      playerId: returningBowler.playerId,
      name: returningBowler.name,
      overs: returningBowler.overs,
      balls: returningBowler.balls,
      runs: returningBowler.runs,
      wickets: returningBowler.wickets,
      maidens: returningBowler.maidens,
      economy: returningBowler.economy
    };
  } else {
    // Fresh bowler
    innings.currentBowler = {
      playerId: bowler.playerId || bowler.name.toLowerCase().replace(/\s+/g, '-'),
      name: bowler.name,
      overs: 0,
      balls: 0,
      runs: 0,
      wickets: 0,
      maidens: 0,
      economy: 0
    };
  }

  await innings.save();

  broadcastScoreUpdate(io, match.matchId, {
    innings: innings.toObject(),
    match: match.toObject()
  });

  res.json({
    success: true,
    data: {
      innings
    },
    message: 'Bowler set successfully'
  });
}));

export default router;
