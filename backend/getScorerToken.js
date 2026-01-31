// Quick script to get scorer token
import mongoose from 'mongoose';
import { Match } from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cricscore';

async function getScorerToken() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const match = await Match.findOne({ matchId: 'M-2026-003' });
    if (match) {
      console.log('\n🎯 SCORER URL:');
      console.log(`http://localhost:5173/match/${match.matchId}/score?token=${match.scorerToken}`);
      console.log('\n📋 Copy this URL and open it in your browser!\n');
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

getScorerToken();
