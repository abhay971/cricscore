import mongoose from 'mongoose';

const ballSchema = new mongoose.Schema({
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
  overNumber: {
    type: Number,
    required: true
  },
  ballNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  batsman: {
    type: String,
    required: true
  },
  bowler: {
    type: String,
    required: true
  },
  runs: {
    type: Number,
    default: 0,
    min: 0
  },
  extras: {
    type: {
      type: String,
      enum: ['wide', 'noball', 'bye', 'legbye', 'none'],
      default: 'none'
    },
    runs: {
      type: Number,
      default: 0
    }
  },
  isDeclareOne: {
    type: Boolean,
    default: false
  },
  isWicket: {
    type: Boolean,
    default: false
  },
  wicketType: {
    type: String,
    enum: ['bowled', 'caught', 'lbw', 'stumped', 'run_out', 'hit_wicket', 'none'],
    default: 'none'
  },
  dismissedPlayer: {
    type: String,
    default: ''
  },
  fielder: {
    type: String,
    default: ''
  },
  strikeChanged: {
    type: Boolean,
    default: false
  },
  commentary: {
    type: String,
    default: ''
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient ball history queries
ballSchema.index({ matchId: 1, inningsNumber: 1, overNumber: 1, ballNumber: 1 });

// Virtual for ball identifier (e.g., "12.3")
ballSchema.virtual('ballIdentifier').get(function() {
  return `${this.overNumber}.${this.ballNumber}`;
});

// Method to generate commentary
ballSchema.methods.generateCommentary = function() {
  let commentary = `${this.overNumber}.${this.ballNumber} `;

  if (this.isWicket) {
    commentary += `WICKET! ${this.dismissedPlayer} ${this.wicketType}`;
    if (this.fielder) {
      commentary += ` by ${this.fielder}`;
    }
  } else if (this.runs === 6) {
    commentary += `SIX! ${this.batsman} hits it out of the park`;
  } else if (this.runs === 4) {
    commentary += `FOUR! Beautiful shot by ${this.batsman}`;
  } else if (this.extras.type !== 'none') {
    commentary += `${this.extras.type.toUpperCase()} - ${this.extras.runs} extra runs`;
  } else if (this.isDeclareOne) {
    commentary += `${this.runs} run${this.runs !== 1 ? 's' : ''} (Declare 1)`;
  } else {
    commentary += `${this.runs} run${this.runs !== 1 ? 's' : ''}`;
  }

  return commentary;
};

const Ball = mongoose.model('Ball', ballSchema);

export default Ball;
