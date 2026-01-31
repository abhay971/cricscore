import jwt from 'jsonwebtoken';
import { Match } from '../models/index.js';

/**
 * Verify JWT token and authenticate scorer
 */
export const authenticateScorer = async (req, res, next) => {
  try {
    // Get token from header or query parameter
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Authentication token required',
          code: 'NO_TOKEN'
        }
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // Get match and verify token belongs to this match
    const matchId = req.params.matchId || req.body.matchId || decoded.matchId;
    const match = await Match.findOne({ matchId });

    if (!match) {
      return res.status(404).json({
        error: {
          message: 'Match not found',
          code: 'MATCH_NOT_FOUND'
        }
      });
    }

    // Tournament-scoped scorer: verify match belongs to the tournament
    if (decoded.role === 'tournament_scorer') {
      if (match.tournamentId !== decoded.tournamentId) {
        return res.status(403).json({
          error: {
            message: 'Token does not have permission for this match',
            code: 'UNAUTHORIZED'
          }
        });
      }
    } else if (!match.verifyToken(token)) {
      // Existing per-match token verification
      return res.status(403).json({
        error: {
          message: 'Token does not have permission for this match',
          code: 'UNAUTHORIZED'
        }
      });
    }

    // Check if match can still be scored
    if (match.status === 'completed') {
      return res.status(400).json({
        error: {
          message: 'Match is already completed',
          code: 'MATCH_COMPLETED'
        }
      });
    }

    // Attach match and decoded token to request
    req.match = match;
    req.scorer = decoded;
    req.scorerToken = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: {
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      }
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.scorer = decoded;
    req.scorerToken = token;
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }

  next();
};

/**
 * Generate scorer token for a match
 */
export const generateScorerToken = (matchId) => {
  return jwt.sign(
    {
      matchId,
      role: 'scorer',
      createdAt: Date.now()
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

/**
 * Verify scorer token without middleware
 */
export const verifyScorerToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
};

/**
 * Authenticate admin using a shared secret
 */
export const authenticateAdmin = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'] || req.body.adminSecret;

  if (!adminSecret) {
    return res.status(401).json({
      error: {
        message: 'Admin secret required',
        code: 'NO_ADMIN_SECRET'
      }
    });
  }

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      error: {
        message: 'Invalid admin secret',
        code: 'INVALID_ADMIN_SECRET'
      }
    });
  }

  next();
};

export default {
  authenticateScorer,
  optionalAuth,
  generateScorerToken,
  verifyScorerToken,
  authenticateAdmin
};
