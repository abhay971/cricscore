import mongoose from 'mongoose';

const batsmanSchema = new mongoose.Schema({
  playerId: String,
  name: String,
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0 },
  onStrike: { type: Boolean, default: false },
  isOut: { type: Boolean, default: false },
  dismissalType: { type: String, default: '' }
}, { _id: false });

const bowlerSchema = new mongoose.Schema({
  playerId: String,
  name: String,
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  economy: { type: Number, default: 0 }
}, { _id: false });

const extrasSchema = new mongoose.Schema({
  wides: { type: Number, default: 0 },
  noBalls: { type: Number, default: 0 },
  byes: { type: Number, default: 0 },
  legByes: { type: Number, default: 0 }
}, { _id: false });

const inningsSchema = new mongoose.Schema({
  matchId: {
    type: String,
    ref: 'Match',
    required: true,
    index: true
  },
  inningsNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  isSuperOver: {
    type: Boolean,
    default: false
  },
  battingTeam: {
    type: String,
    required: true
  },
  bowlingTeam: {
    type: String,
    required: true
  },
  totalRuns: {
    type: Number,
    default: 0
  },
  totalWickets: {
    type: Number,
    default: 0
  },
  totalOvers: {
    type: Number,
    default: 0
  },
  balls: {
    type: Number,
    default: 0
  },
  currentBatsmen: [batsmanSchema],
  currentBowler: bowlerSchema,
  bowlers: [bowlerSchema],
  extras: {
    type: extrasSchema,
    default: () => ({})
  },
  runRate: {
    type: Number,
    default: 0
  },
  requiredRunRate: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
inningsSchema.index({ matchId: 1, inningsNumber: 1 }, { unique: true });

const Innings = mongoose.model('Innings', inningsSchema);

export default Innings;
