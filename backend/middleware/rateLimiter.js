import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Development: 500 requests per 15 minutes (lenient for testing)
 * Production: 100 requests per 15 minutes
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 0, // Disabled - no rate limit
  message: {
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

/**
 * Scorer action rate limiter (more strict)
 * Prevents spam scoring - 60 balls per minute max
 */
export const scorerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Max 60 balls per minute
  message: {
    error: {
      message: 'Scoring too fast, please slow down',
      code: 'SCORER_RATE_LIMIT'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per match
    return req.params.matchId || req.body.matchId || req.ip;
  }
});

/**
 * Match creation rate limiter
 * 10 matches per hour per IP
 */
export const matchCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: {
      message: 'Too many matches created, please try again later',
      code: 'MATCH_CREATION_LIMIT'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Tournament creation rate limiter
 * 5 tournaments per hour per IP
 */
export const tournamentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: {
      message: 'Too many tournaments created, please try again later',
      code: 'TOURNAMENT_CREATION_LIMIT'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Scorer login rate limiter
 * 10 attempts per 15 minutes per IP
 */
export const scorerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: {
      message: 'Too many login attempts, please try again later',
      code: 'LOGIN_RATE_LIMIT'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  apiLimiter,
  scorerLimiter,
  matchCreationLimiter,
  tournamentCreationLimiter,
  scorerLoginLimiter
};
