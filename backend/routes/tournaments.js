import express from 'express';
import jwt from 'jsonwebtoken';
import { Tournament, Match, Innings } from '../models/index.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';
import { tournamentCreationLimiter, scorerLoginLimiter } from '../middleware/rateLimiter.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/tournaments
 * Create a new tournament
 */
router.post('/', tournamentCreationLimiter, authenticateAdmin, asyncHandler(async (req, res) => {
  const { name, organizerName, customRules, scorerPin } = req.body;

  // Validation
  if (!name || !organizerName) {
    throw new ApiError(400, 'Tournament name and organizer name are required', 'MISSING_FIELDS');
  }

  // Validate and hash scorer PIN if provided
  let hashedPin;
  if (scorerPin) {
    if (!/^\d{4,6}$/.test(scorerPin)) {
      throw new ApiError(400, 'Scorer PIN must be 4-6 digits', 'INVALID_PIN');
    }
    hashedPin = await Tournament.hashPin(scorerPin);
  }

  // Create tournament
  const tournament = new Tournament({
    name: name.trim(),
    organizerName: organizerName.trim(),
    customRules: customRules || { declareOneEnabled: false },
    matches: [],
    status: 'upcoming',
    ...(hashedPin && { scorerPin: hashedPin })
  });

  await tournament.save();

  // Strip scorerPin from response (select:false only applies to find queries)
  const tournamentResponse = tournament.toObject();
  delete tournamentResponse.scorerPin;

  res.status(201).json({
    success: true,
    data: {
      tournament: tournamentResponse
    },
    message: 'Tournament created successfully'
  });
}));

/**
 * GET /api/tournaments/:tournamentId
 * Get tournament details
 */
router.get('/:tournamentId', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findOne({ tournamentId });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found', 'TOURNAMENT_NOT_FOUND');
  }

  res.json({
    success: true,
    data: {
      tournament
    }
  });
}));

/**
 * POST /api/tournaments/:tournamentId/scorer/login
 * Authenticate as a tournament scorer using PIN
 */
router.post('/:tournamentId/scorer/login', scorerLoginLimiter, asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const { pin } = req.body;

  if (!pin) {
    throw new ApiError(400, 'PIN is required', 'MISSING_PIN');
  }

  // Fetch tournament with scorerPin (normally excluded by select: false)
  const tournament = await Tournament.findOne({ tournamentId }).select('+scorerPin');

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found', 'TOURNAMENT_NOT_FOUND');
  }

  if (!tournament.scorerPin) {
    throw new ApiError(400, 'Scorer PIN not configured for this tournament', 'NO_PIN_CONFIGURED');
  }

  const isValid = await tournament.verifyPin(pin);
  if (!isValid) {
    throw new ApiError(401, 'Invalid PIN', 'INVALID_PIN');
  }

  // Generate tournament-scoped JWT
  const token = jwt.sign(
    {
      tournamentId: tournament.tournamentId,
      role: 'tournament_scorer',
      createdAt: Date.now()
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: {
      token,
      tournamentId: tournament.tournamentId,
      tournamentName: tournament.name
    },
    message: 'Scorer authenticated successfully'
  });
}));

/**
 * GET /api/tournaments/:tournamentId/matches
 * Get all matches in a tournament
 */
router.get('/:tournamentId/matches', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  // Verify tournament exists
  const tournament = await Tournament.findOne({ tournamentId });
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found', 'TOURNAMENT_NOT_FOUND');
  }

  // Get all matches
  const matches = await Match.find({ tournamentId }).sort({ createdAt: -1 }).lean();

  // For live/innings_break matches, attach current innings data
  const matchIds = matches
    .filter(m => m.status === 'live' || m.status === 'innings_break')
    .map(m => m.matchId);

  if (matchIds.length > 0) {
    const inningsData = await Innings.find({ matchId: { $in: matchIds } }).lean();

    for (const match of matches) {
      if (match.status === 'live' || match.status === 'innings_break') {
        const currentInn = inningsData.find(
          i => i.matchId === match.matchId && i.inningsNumber === match.currentInnings
        );
        if (currentInn) {
          match.liveInnings = {
            totalRuns: currentInn.totalRuns,
            totalWickets: currentInn.totalWickets,
            totalOvers: currentInn.totalOvers,
            inningsNumber: currentInn.inningsNumber
          };
        }
      }
    }
  }

  res.json({
    success: true,
    data: {
      tournament: {
        tournamentId: tournament.tournamentId,
        name: tournament.name,
        status: tournament.status
      },
      matches
    }
  });
}));

/**
 * PATCH /api/tournaments/:tournamentId
 * Update tournament details
 */
router.patch('/:tournamentId', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;
  const { name, status, customRules } = req.body;

  const tournament = await Tournament.findOne({ tournamentId });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found', 'TOURNAMENT_NOT_FOUND');
  }

  // Update allowed fields
  if (name) tournament.name = name.trim();
  if (status) tournament.status = status;
  if (customRules) tournament.customRules = { ...tournament.customRules, ...customRules };

  await tournament.save();

  res.json({
    success: true,
    data: {
      tournament
    },
    message: 'Tournament updated successfully'
  });
}));

/**
 * GET /api/tournaments
 * Get all tournaments (with filters)
 */
router.get('/', asyncHandler(async (req, res) => {
  const { status, limit = 20, page = 1 } = req.query;

  const query = {};
  if (status) query.status = status;

  const tournaments = await Tournament.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Tournament.countDocuments(query);

  res.json({
    success: true,
    data: {
      tournaments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * DELETE /api/tournaments/:tournamentId
 * Delete a tournament (only if no matches)
 */
router.delete('/:tournamentId', asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findOne({ tournamentId });

  if (!tournament) {
    throw new ApiError(404, 'Tournament not found', 'TOURNAMENT_NOT_FOUND');
  }

  // Check if tournament has matches
  if (tournament.matches && tournament.matches.length > 0) {
    throw new ApiError(400, 'Cannot delete tournament with matches', 'HAS_MATCHES');
  }

  await tournament.deleteOne();

  res.json({
    success: true,
    message: 'Tournament deleted successfully'
  });
}));

export default router;
