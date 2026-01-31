/**
 * Cricket Calculations Utility
 * Handles all cricket-related calculations including "Declare 1 Run" custom rule
 */

/**
 * Determine if strike should change after a ball
 * @param {Object} ball - Ball data
 * @param {Number} ball.runs - Runs scored
 * @param {Boolean} ball.isDeclareOne - Is declare 1 rule active
 * @param {Boolean} ball.isWicket - Is it a wicket
 * @param {String} ball.extraType - Type of extra (wide, noball, bye, legbye, none)
 * @param {Boolean} ball.isOverComplete - Is the over complete
 * @returns {Boolean} - Should strike change
 */
export function shouldStrikeChange(ball) {
  // If declare 1 is active, strike never changes within over
  if (ball.isDeclareOne) {
    return false;
  }

  // If it's a wicket, new batsman comes in (strike changes)
  if (ball.isWicket) {
    return true;
  }

  // Wide and no-ball: strike doesn't change
  if (ball.extraType === 'wide' || ball.extraType === 'noball') {
    return false;
  }

  // Odd runs scored (1, 3, 5): strike changes
  if (ball.runs % 2 === 1) {
    return true;
  }

  // Check if end of over (completed 6 valid deliveries)
  if (ball.isOverComplete) {
    return true;
  }

  // Even runs or no runs: strike stays same
  return false;
}

/**
 * Calculate strike rate for a batsman
 * @param {Number} runs - Total runs scored
 * @param {Number} balls - Total balls faced
 * @returns {Number} - Strike rate (runs per 100 balls)
 */
export function calculateStrikeRate(runs, balls) {
  if (balls === 0) return 0;
  return parseFloat(((runs / balls) * 100).toFixed(2));
}

/**
 * Calculate economy rate for a bowler
 * @param {Number} runs - Total runs conceded
 * @param {Number} balls - Total balls bowled
 * @returns {Number} - Economy rate (runs per over)
 */
export function calculateEconomy(runs, balls) {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return parseFloat((runs / overs).toFixed(2));
}

/**
 * Calculate current run rate
 * @param {Number} runs - Total runs scored
 * @param {Number} balls - Total balls faced
 * @returns {Number} - Current run rate (runs per over)
 */
export function calculateRunRate(runs, balls) {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return parseFloat((runs / overs).toFixed(2));
}

/**
 * Calculate required run rate for chasing team
 * @param {Number} target - Target runs to chase
 * @param {Number} currentRuns - Current runs scored
 * @param {Number} ballsRemaining - Balls remaining in innings
 * @returns {Number} - Required run rate
 */
export function calculateRequiredRunRate(target, currentRuns, ballsRemaining) {
  if (ballsRemaining === 0) return 0;
  const runsNeeded = target - currentRuns;
  if (runsNeeded <= 0) return 0;
  const oversRemaining = ballsRemaining / 6;
  return parseFloat((runsNeeded / oversRemaining).toFixed(2));
}

/**
 * Convert balls to overs format (e.g., 76 balls = 12.4 overs)
 * @param {Number} balls - Total balls
 * @returns {String} - Overs in format "12.4"
 */
export function ballsToOvers(balls) {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
}

/**
 * Convert overs to balls (e.g., "12.4" = 76 balls)
 * @param {String} overs - Overs in format "12.4"
 * @returns {Number} - Total balls
 */
export function oversToBalls(overs) {
  const [completedOvers, remainingBalls] = overs.split('.').map(Number);
  return (completedOvers * 6) + (remainingBalls || 0);
}

/**
 * Check if over is complete
 * @param {Number} ballsInOver - Number of balls in current over
 * @returns {Boolean} - Is over complete
 */
export function isOverComplete(ballsInOver) {
  return ballsInOver >= 6;
}

/**
 * Calculate total extras
 * @param {Object} extras - Extras object
 * @returns {Number} - Total extras
 */
export function calculateTotalExtras(extras) {
  return (extras.wides || 0) +
         (extras.noBalls || 0) +
         (extras.byes || 0) +
         (extras.legByes || 0);
}

/**
 * Determine match result
 * @param {Object} innings1 - First innings data
 * @param {Object} innings2 - Second innings data
 * @param {String} team1Name - Team 1 name
 * @param {String} team2Name - Team 2 name
 * @param {Number} totalPlayers - Number of players in chasing team (default 11)
 * @returns {Object} - { winner, result }
 */
export function determineMatchResult(innings1, innings2, team1Name, team2Name, totalPlayers = 11) {
  const battingFirstTeam = innings1.battingTeam;
  const chasingTeam = innings2.battingTeam;

  const firstInningsRuns = innings1.totalRuns;
  const secondInningsRuns = innings2.totalRuns;

  if (secondInningsRuns > firstInningsRuns) {
    // Chasing team won
    const wicketsRemaining = (totalPlayers - 1) - innings2.totalWickets;
    return {
      winner: chasingTeam,
      result: `${chasingTeam} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`
    };
  } else if (firstInningsRuns > secondInningsRuns) {
    // Batting first team won
    const runsDifference = firstInningsRuns - secondInningsRuns;
    return {
      winner: battingFirstTeam,
      result: `${battingFirstTeam} won by ${runsDifference} run${runsDifference !== 1 ? 's' : ''}`
    };
  } else {
    // Match tied
    return {
      winner: 'Tie',
      result: 'Match tied'
    };
  }
}

/**
 * Check if innings should end
 * @param {Number} wickets - Current wickets
 * @param {Number} balls - Balls bowled
 * @param {Number} maxOvers - Maximum overs
 * @param {Number} target - Target (for second innings)
 * @param {Number} currentRuns - Current runs (for second innings)
 * @param {Number} totalPlayers - Number of players in batting team (default 11)
 * @returns {Boolean} - Should innings end
 */
export function shouldInningsEnd(wickets, balls, maxOvers, target = null, currentRuns = null, totalPlayers = 11) {
  // All wickets down (totalPlayers - 1 since one batsman can't bat alone)
  const maxWickets = totalPlayers - 1;
  if (wickets >= maxWickets) return true;

  // All overs completed
  const totalBalls = maxOvers * 6;
  if (balls >= totalBalls) return true;

  // Target chased (second innings only - target must be > 0)
  if (target !== null && target > 0 && currentRuns !== null && currentRuns >= target) {
    return true;
  }

  return false;
}

/**
 * Generate ball commentary with declare 1 support
 * @param {Object} ball - Ball data
 * @returns {String} - Commentary text
 */
export function generateCommentary(ball) {
  const {
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
    ballNumber
  } = ball;

  let commentary = `${overNumber}.${ballNumber} ${bowler} to ${batsman}, `;

  if (isWicket) {
    commentary += `OUT! ${dismissedPlayer} is ${wicketType}`;
    if (fielder) {
      commentary += ` by ${fielder}`;
    }
    commentary += '!';
  } else if (runs === 6) {
    commentary += `SIX! Massive hit from ${batsman}! The ball sails over the boundary!`;
  } else if (runs === 4) {
    commentary += `FOUR! Brilliant shot by ${batsman}! That raced to the boundary!`;
  } else if (extraType === 'wide') {
    commentary += `Wide! ${extraRuns} extra run${extraRuns !== 1 ? 's' : ''}`;
  } else if (extraType === 'noball') {
    commentary += `No ball! ${extraRuns} extra run${extraRuns !== 1 ? 's' : ''}`;
  } else if (extraType === 'bye' || extraType === 'legbye') {
    commentary += `${extraType === 'bye' ? 'Bye' : 'Leg bye'}! ${extraRuns} extra run${extraRuns !== 1 ? 's' : ''}`;
  } else if (isDeclareOne) {
    commentary += `${runs} run${runs !== 1 ? 's' : ''} (Declare 1 - strike stays same)`;
  } else {
    const runWords = ['No run', 'Single', 'Two runs', 'Three runs'];
    commentary += runs <= 3 ? runWords[runs] : `${runs} runs`;
  }

  return commentary;
}

/**
 * Calculate partnership runs between two batsmen
 * @param {Array} balls - Array of balls in partnership
 * @returns {Object} - { runs, balls }
 */
export function calculatePartnership(balls) {
  const runs = balls.reduce((sum, ball) => sum + ball.runs, 0);
  return {
    runs,
    balls: balls.length
  };
}

export default {
  shouldStrikeChange,
  calculateStrikeRate,
  calculateEconomy,
  calculateRunRate,
  calculateRequiredRunRate,
  ballsToOvers,
  oversToBalls,
  isOverComplete,
  calculateTotalExtras,
  determineMatchResult,
  shouldInningsEnd,
  generateCommentary,
  calculatePartnership
};
