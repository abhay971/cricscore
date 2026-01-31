import express from 'express';
import { Tournament, Match, Innings, Ball } from '../models/index.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { matchCreationLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth, authenticateAdmin } from '../middleware/auth.js';
import { getBattingFirstTeam, getBowlingTeam, generateScorerUrl } from '../utils/matchHelpers.js';

const router = express.Router();

/**
 * POST /api/tournaments/:tournamentId/matches
 * Create a new match in a tournament
 */
router.post('/:tournamentId/matches', matchCreationLimiter, authenticateAdmin, asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const {
    team1,
    team2,
    tossWinner,
    tossDecision,
    overs,
    matchType,
    customRules
  } = req.body;

  // Validation
  if (!team1 || !team2 || !tossWinner || !tossDecision || !overs) {
    throw new ApiError(400, 'Missing required fields', 'MISSING_FIELDS');
  }

  if (!team1.name || !team1.players || team1.players.length === 0) {
    throw new ApiError(400, 'Team 1 must have name and players', 'INVALID_TEAM');
  }

  if (!team2.name || !team2.players || team2.players.length === 0) {
    throw new ApiError(400, 'Team 2 must have name and players', 'INVALID_TEAM');
  }

  if (overs < 1) {
    throw new ApiError(400, 'Overs must be at least 1', 'INVALID_OVERS');
  }

  // Verify tournament exists
  const tournament = await Tournament.findOne({ tournamentId });
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found', 'TOURNAMENT_NOT_FOUND');
  }

  // Create match
  const match = new Match({
    tournamentId,
    team1: {
      name: team1.name.trim(),
      players: team1.players.map(p => ({
        playerId: p.playerId || p.name.toLowerCase().replace(/\s+/g, '-'),
        name: p.name.trim(),
        role: p.role || 'batsman'
      }))
    },
    team2: {
      name: team2.name.trim(),
      players: team2.players.map(p => ({
        playerId: p.playerId || p.name.toLowerCase().replace(/\s+/g, '-'),
        name: p.name.trim(),
        role: p.role || 'batsman'
      }))
    },
    tossWinner: (tossWinner === 'team1' ? team1.name.trim() :
                 tossWinner === 'team2' ? team2.name.trim() : tossWinner.trim()),
    tossDecision,
    overs: parseInt(overs),
    matchType: matchType || 'Custom',
    customRules: customRules || tournament.customRules || { declareOneEnabled: false },
    status: 'not_started',
    currentInnings: 1
  });

  await match.save();

  // Add match to tournament
  tournament.matches.push(match.matchId);
  if (tournament.status === 'upcoming') {
    tournament.status = 'ongoing';
  }
  await tournament.save();

  // Create first innings
  const battingTeam = getBattingFirstTeam(tossWinner, tossDecision, team1.name, team2.name);
  const bowlingTeam = getBowlingTeam(battingTeam, team1.name, team2.name);

  const innings = new Innings({
    matchId: match.matchId,
    inningsNumber: 1,
    battingTeam,
    bowlingTeam,
    status: 'not_started'
  });

  await innings.save();

  // Generate scorer URL
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const scorerUrl = generateScorerUrl(baseUrl, match.matchId, match.scorerToken);

  res.status(201).json({
    success: true,
    data: {
      match,
      scorerUrl,
      scorerToken: match.scorerToken,
      viewerUrl: `${baseUrl}/match/${match.matchId}`
    },
    message: 'Match created successfully'
  });
}));

/**
 * GET /api/matches/:matchId
 * Get match details
 */
router.get('/:matchId', optionalAuth, asyncHandler(async (req, res) => {
  const { matchId } = req.params;

  const match = await Match.findOne({ matchId });

  if (!match) {
    throw new ApiError(404, 'Match not found', 'MATCH_NOT_FOUND');
  }

  // Get innings
  const innings = await Innings.find({ matchId }).sort({ inningsNumber: 1 });

  // Don't expose scorer token to non-scorers
  const matchData = match.toObject();
  if (!req.scorer || req.scorer.matchId !== matchId) {
    delete matchData.scorerToken;
  }

  res.json({
    success: true,
    data: {
      match: matchData,
      innings
    }
  });
}));

/**
 * GET /api/matches/:matchId/innings
 * Get innings data for a match
 */
router.get('/:matchId/innings', asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { inningsNumber } = req.query;

  const query = { matchId };
  if (inningsNumber) {
    query.inningsNumber = parseInt(inningsNumber);
  }

  const innings = await Innings.find(query).sort({ inningsNumber: 1 });

  res.json({
    success: true,
    data: {
      innings
    }
  });
}));

/**
 * GET /api/matches/:matchId/balls
 * Get ball-by-ball history
 */
router.get('/:matchId/balls', asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { inningsNumber, overNumber, limit = 50 } = req.query;

  const query = { matchId };
  if (inningsNumber) query.inningsNumber = parseInt(inningsNumber);
  if (overNumber !== undefined) query.overNumber = parseInt(overNumber);

  const balls = await Ball.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      balls: balls.reverse()
    }
  });
}));

/**
 * GET /api/matches/live
 * Get all live matches
 */
router.get('/live/all', asyncHandler(async (req, res) => {
  const matches = await Match.find({
    status: { $in: ['live', 'innings_break'] }
  }).sort({ updatedAt: -1 });

  // Get current innings for each match
  const matchesWithInnings = await Promise.all(
    matches.map(async (match) => {
      const currentInnings = await Innings.findOne({
        matchId: match.matchId,
        inningsNumber: match.currentInnings
      });
      return {
        ...match.toObject(),
        scorerToken: undefined, // Don't expose tokens
        currentInnings
      };
    })
  );

  res.json({
    success: true,
    data: {
      matches: matchesWithInnings
    }
  });
}));

/**
 * GET /api/matches/completed
 * Get all completed matches
 */
router.get('/completed/all', asyncHandler(async (req, res) => {
  const matches = await Match.find({
    status: 'completed'
  }).sort({ updatedAt: -1 }).limit(50);

  // Get both innings for each match
  const matchesWithInnings = await Promise.all(
    matches.map(async (match) => {
      const innings = await Innings.find({
        matchId: match.matchId
      }).sort({ inningsNumber: 1 });

      // Look up tournament name
      const tournament = await Tournament.findOne({ tournamentId: match.tournamentId });

      return {
        ...match.toObject(),
        scorerToken: undefined,
        innings,
        tournamentName: tournament?.name || null
      };
    })
  );

  res.json({
    success: true,
    data: {
      matches: matchesWithInnings
    }
  });
}));

/**
 * PATCH /api/matches/:matchId/status
 * Update match status (start match, innings break, etc.)
 */
router.patch('/:matchId/status', asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { status } = req.body;

  const match = await Match.findOne({ matchId });

  if (!match) {
    throw new ApiError(404, 'Match not found', 'MATCH_NOT_FOUND');
  }

  const validStatuses = ['not_started', 'live', 'innings_break', 'completed'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status', 'INVALID_STATUS');
  }

  match.status = status;
  await match.save();

  res.json({
    success: true,
    data: {
      match
    },
    message: 'Match status updated'
  });
}));

export default router;
