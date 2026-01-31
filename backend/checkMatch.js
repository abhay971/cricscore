// Check match status
import mongoose from 'mongoose';
import { Match, Innings } from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkMatch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cricscore');
    console.log('Connected to MongoDB\n');

    const match = await Match.findOne({ matchId: 'M-2026-004' });
    if (match) {
      console.log('📊 Match Status:');
      console.log('  Match ID:', match.matchId);
      console.log('  Status:', match.status);
      console.log('  Current Innings:', match.currentInnings);
      console.log('  Team 1:', match.team1?.name);
      console.log('  Team 2:', match.team2?.name);
      console.log('');

      const innings = await Innings.find({ matchId: 'M-2026-004' }).sort({ inningsNumber: 1 });
      console.log('🏏 Innings Data:');
      innings.forEach(inn => {
        console.log(`\n  Innings ${inn.inningsNumber}:`);
        console.log('    Status:', inn.status);
        console.log('    Batting Team:', inn.battingTeam);
        console.log('    Score:', `${inn.totalRuns}/${inn.totalWickets}`);
        console.log('    Overs:', inn.totalOvers);
        console.log('    Balls:', inn.balls);
        console.log('    Current Batsmen:', inn.currentBatsmen?.length || 0);
      });
    } else {
      console.log('Match not found');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkMatch();
