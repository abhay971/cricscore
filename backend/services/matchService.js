import { Match, Innings, Ball } from '../models/index.js';
import {
  calculateStrikeRate,
  calculateEconomy,
  calculateRunRate,
  ballsToOvers
} from '../utils/cricketCalculations.js';

/**
 * Get complete match state including all data
 */
export async function getMatchState(matchId) {
  const match = await Match.findOne({ matchId });
  if (!match) return null;

  const innings = await Innings.find({ matchId }).sort({ inningsNumber: 1 });
  const currentInnings = innings[match.currentInnings - 1];

  const recentBalls = await Ball.find({
    matchId,
    inningsNumber: match.currentInnings
  })
    .sort({ createdAt: -1 })
    .limit(6);

  return {
    match: match.toObject(),
    innings,
    currentInnings,
    recentBalls: recentBalls.reverse()
  };
}

/**
 * Initialize match for scoring
 * Sets up first two batsmen and first bowler
 */
export async function initializeMatch(matchId, batsmen, bowler) {
  const match = await Match.findOne({ matchId });
  if (!match) throw new Error('Match not found');

  const innings = await Innings.findOne({
    matchId,
    inningsNumber: 1
  });

  if (!innings) throw new Error('Innings not found');

  // Set batsmen
  innings.currentBatsmen = batsmen.map((b, index) => ({
    playerId: b.playerId || b.name.toLowerCase().replace(/\s+/g, '-'),
    name: b.name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
    onStrike: index === 0, // First batsman on strike
    isOut: false,
    dismissalType: ''
  }));

  // Set bowler
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

  innings.status = 'in_progress';
  match.status = 'live';

  await innings.save();
  await match.save();

  return { match, innings };
}

/**
 * Get fall of wickets for an innings
 */
export async function getFallOfWickets(matchId, inningsNumber) {
  const balls = await Ball.find({
    matchId,
    inningsNumber,
    isWicket: true
  }).sort({ createdAt: 1 });

  return balls.map((ball, index) => ({
    wicket: index + 1,
    batsman: ball.dismissedPlayer,
    runs: ball.totalRunsAtWicket || 0,
    overs: `${ball.overNumber}.${ball.ballNumber}`,
    dismissalType: ball.wicketType
  }));
}

/**
 * Get over-by-over summary
 */
export async function getOverSummary(matchId, inningsNumber) {
  const balls = await Ball.find({
    matchId,
    inningsNumber
  }).sort({ overNumber: 1, ballNumber: 1 });

  const overSummary = {};

  balls.forEach(ball => {
    if (!overSummary[ball.overNumber]) {
      overSummary[ball.overNumber] = {
        overNumber: ball.overNumber,
        balls: [],
        runs: 0,
        wickets: 0
      };
    }

    overSummary[ball.overNumber].balls.push(ball);
    overSummary[ball.overNumber].runs += ball.runs + ball.extras.runs;
    if (ball.isWicket) overSummary[ball.overNumber].wickets += 1;
  });

  return Object.values(overSummary);
}

/**
 * Get partnership information
 */
export async function getCurrentPartnership(matchId, inningsNumber) {
  const innings = await Innings.findOne({ matchId, inningsNumber });
  if (!innings || !innings.currentBatsmen || innings.currentBatsmen.length < 2) {
    return null;
  }

  const batsmen = innings.currentBatsmen.filter(b => !b.isOut);
  if (batsmen.length < 2) return null;

  // Get balls since last wicket
  const lastWicketBall = await Ball.findOne({
    matchId,
    inningsNumber,
    isWicket: true
  }).sort({ createdAt: -1 });

  const partnershipBalls = await Ball.find({
    matchId,
    inningsNumber,
    ...(lastWicketBall && { createdAt: { $gt: lastWicketBall.createdAt } })
  });

  const partnershipRuns = partnershipBalls.reduce((sum, ball) => {
    return sum + ball.runs + ball.extras.runs;
  }, 0);

  return {
    batsman1: batsmen[0],
    batsman2: batsmen[1],
    runs: partnershipRuns,
    balls: partnershipBalls.length
  };
}

/**
 * Get bowling figures for all bowlers
 */
export async function getBowlingFigures(matchId, inningsNumber) {
  const balls = await Ball.find({
    matchId,
    inningsNumber
  });

  const bowlers = {};

  balls.forEach(ball => {
    if (!bowlers[ball.bowler]) {
      bowlers[ball.bowler] = {
        name: ball.bowler,
        balls: 0,
        runs: 0,
        wickets: 0,
        maidens: 0,
        economy: 0
      };
    }

    // Only count valid deliveries for balls
    if (ball.extras.type !== 'wide' && ball.extras.type !== 'noball') {
      bowlers[ball.bowler].balls += 1;
    }

    bowlers[ball.bowler].runs += ball.runs + ball.extras.runs;
    if (ball.isWicket) bowlers[ball.bowler].wickets += 1;
  });

  // Calculate overs and economy
  Object.values(bowlers).forEach(bowler => {
    bowler.overs = ballsToOvers(bowler.balls);
    bowler.economy = calculateEconomy(bowler.runs, bowler.balls);
  });

  return Object.values(bowlers);
}

/**
 * Get batting scorecard for an innings
 */
export async function getBattingScorecard(matchId, inningsNumber) {
  const balls = await Ball.find({
    matchId,
    inningsNumber
  });

  const batsmen = {};

  balls.forEach(ball => {
    if (!batsmen[ball.batsman]) {
      batsmen[ball.batsman] = {
        name: ball.batsman,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
        dismissalType: ''
      };
    }

    batsmen[ball.batsman].runs += ball.runs;

    // Only count valid deliveries for balls faced
    if (ball.extras.type !== 'wide' && ball.extras.type !== 'noball') {
      batsmen[ball.batsman].balls += 1;
    }

    if (ball.runs === 4) batsmen[ball.batsman].fours += 1;
    if (ball.runs === 6) batsmen[ball.batsman].sixes += 1;

    if (ball.isWicket && ball.dismissedPlayer === ball.batsman) {
      batsmen[ball.batsman].isOut = true;
      batsmen[ball.batsman].dismissalType = ball.wicketType;
    }
  });

  // Calculate strike rates
  Object.values(batsmen).forEach(batsman => {
    batsman.strikeRate = calculateStrikeRate(batsman.runs, batsman.balls);
  });

  return Object.values(batsmen);
}

/**
 * Validate if a player can bat/bowl
 */
export function validatePlayer(match, playerName, role) {
  const team1Players = match.team1.players.map(p => p.name);
  const team2Players = match.team2.players.map(p => p.name);

  return team1Players.includes(playerName) || team2Players.includes(playerName);
}

export default {
  getMatchState,
  initializeMatch,
  getFallOfWickets,
  getOverSummary,
  getCurrentPartnership,
  getBowlingFigures,
  getBattingScorecard,
  validatePlayer
};
