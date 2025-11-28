const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  identifiers: [String],
  ip: String,
  ping: Number,
  joinedAt: Date
}, { _id: false });

const banSchema = new mongoose.Schema({
  playerName: String,
  identifiers: [String],
  reason: String,
  bannedBy: String,
  bannedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  permanent: {
    type: Boolean,
    default: false
  },
  screenshot: String
});

const detectionSchema = new mongoose.Schema({
  playerName: String,
  playerId: Number,
  identifiers: [String],
  type: String,
  details: mongoose.Schema.Types.Mixed,
  action: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const serverSchema = new mongoose.Schema({
  license: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'License',
    required: true,
    unique: true
  },
  online: {
    type: Boolean,
    default: false
  },
  players: [playerSchema],
  currentPlayers: {
    type: Number,
    default: 0
  },
  maxPlayers: {
    type: Number,
    default: 32
  },
  bans: [banSchema],
  detections: [detectionSchema],
  stats: {
    totalDetections: { type: Number, default: 0 },
    totalBans: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 }
  },
  lastUpdate: Date
}, {
  timestamps: true
});

// Limiter les détections stockées (garder les 1000 dernières)
serverSchema.pre('save', function(next) {
  if (this.detections.length > 1000) {
    this.detections = this.detections.slice(-1000);
  }
  next();
});

module.exports = mongoose.model('Server', serverSchema);
