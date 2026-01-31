/**
 * Match Helper Utilities
 * Helper functions for match operations
 */

/**
 * Format match status for display
 * @param {String} status - Match status
 * @returns {String} - Formatted status
 */
export function formatMatchStatus(status) {
  const statusMap = {
    'not_started': 'Not Started',
    'live': 'Live',
    'innings_break': 'Innings Break',
    'completed': 'Completed'
  };
  return statusMap[status] || status;
}

/**
 * Get batting first team based on toss
 * @param {String} tossWinner - Team that won toss
 * @param {String} tossDecision - Toss decision (bat/bowl)
 * @param {String} team1 - Team 1 name
 * @param {String} team2 - Team 2 name
 * @returns {String} - Batting first team name
 */
export function getBattingFirstTeam(tossWinner, tossDecision, team1, team2) {
  // Resolve identifier ("team1"/"team2") to actual team name
  const resolvedWinner = tossWinner === 'team1' ? team1 :
                         tossWinner === 'team2' ? team2 : tossWinner;

  if (tossDecision === 'bat') {
    return resolvedWinner;
  } else {
    return resolvedWinner === team1 ? team2 : team1;
  }
}

/**
 * Get bowling first team
 * @param {String} battingTeam - Batting team name
 * @param {String} team1 - Team 1 name
 * @param {String} team2 - Team 2 name
 * @returns {String} - Bowling team name
 */
export function getBowlingTeam(battingTeam, team1, team2) {
  return battingTeam === team1 ? team2 : team1;
}

/**
 * Validate scorer token
 * @param {Object} match - Match object
 * @param {String} token - Token to validate
 * @returns {Boolean} - Is token valid
 */
export function validateScorerToken(match, token) {
  return match.verifyToken(token);
}

/**
 * Format player name with short form
 * @param {String} fullName - Full player name
 * @returns {String} - Formatted name (e.g., "V Kohli")
 */
export function formatPlayerName(fullName) {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName.charAt(0)} ${lastName}`;
}

/**
 * Get current over details
 * @param {Number} balls - Total balls bowled
 * @returns {Object} - { overNumber, ballNumber }
 */
export function getCurrentOver(balls) {
  const overNumber = Math.floor(balls / 6);
  const ballNumber = (balls % 6) + 1;
  return { overNumber, ballNumber };
}

/**
 * Calculate balls remaining in innings
 * @param {Number} maxOvers - Maximum overs
 * @param {Number} ballsBowled - Balls already bowled
 * @returns {Number} - Balls remaining
 */
export function getBallsRemaining(maxOvers, ballsBowled) {
  const totalBalls = maxOvers * 6;
  return Math.max(0, totalBalls - ballsBowled);
}

/**
 * Validate ball input
 * @param {Object} ballData - Ball data to validate
 * @returns {Object} - { valid, error }
 */
export function validateBallInput(ballData) {
  const { runs, extraType, isDeclareOne, isWicket } = ballData;

  // Runs must be between 0-6 for normal balls
  if (!isWicket && runs < 0 || runs > 6) {
    return { valid: false, error: 'Runs must be between 0 and 6' };
  }

  // Declare 1 must have at least 1 run
  if (isDeclareOne && runs === 0 && extraType === 'none') {
    return { valid: false, error: 'Declare 1 requires at least 1 run' };
  }

  return { valid: true };
}

/**
 * Generate match summary
 * @param {Object} match - Match object
 * @param {Object} innings1 - First innings
 * @param {Object} innings2 - Second innings
 * @returns {Object} - Match summary
 */
export function generateMatchSummary(match, innings1, innings2) {
  return {
    matchId: match.matchId,
    teams: {
      team1: match.team1.name,
      team2: match.team2.name
    },
    toss: {
      winner: match.tossWinner,
      decision: match.tossDecision
    },
    innings: [
      {
        battingTeam: innings1.battingTeam,
        runs: innings1.totalRuns,
        wickets: innings1.totalWickets,
        overs: innings1.totalOvers
      },
      innings2 ? {
        battingTeam: innings2.battingTeam,
        runs: innings2.totalRuns,
        wickets: innings2.totalWickets,
        overs: innings2.totalOvers
      } : null
    ].filter(Boolean),
    status: match.status,
    result: match.result,
    winner: match.winner
  };
}

/**
 * Generate scorer URL with token
 * @param {String} baseUrl - Base URL
 * @param {String} matchId - Match ID
 * @param {String} token - Scorer token
 * @returns {String} - Complete scorer URL
 */
export function generateScorerUrl(baseUrl, matchId, token) {
  return `${baseUrl}/match/${matchId}/score?token=${token}`;
}

/**
 * Check if match can be edited
 * @param {String} status - Match status
 * @returns {Boolean} - Can be edited
 */
export function canEditMatch(status) {
  return status !== 'completed';
}

/**
 * Get fall of wickets
 * @param {Array} balls - Array of all balls
 * @returns {Array} - Array of wicket falls { wicket, runs, overs, batsman }
 */
export function getFallOfWickets(balls) {
  return balls
    .filter(ball => ball.isWicket)
    .map((ball, index) => ({
      wicket: index + 1,
      runs: ball.totalRunsAtWicket || 0,
      overs: `${ball.overNumber}.${ball.ballNumber}`,
      batsman: ball.dismissedPlayer
    }));
}

export default {
  formatMatchStatus,
  getBattingFirstTeam,
  getBowlingTeam,
  validateScorerToken,
  formatPlayerName,
  getCurrentOver,
  getBallsRemaining,
  validateBallInput,
  generateMatchSummary,
  generateScorerUrl,
  canEditMatch,
  getFallOfWickets
};
