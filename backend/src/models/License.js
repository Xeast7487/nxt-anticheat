const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const licenseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4().replace(/-/g, '').toUpperCase()
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'expired', 'cancelled'],
    default: 'active'
  },
  serverIp: {
    type: String,
    sparse: true
  },
  serverPort: {
    type: Number,
    sparse: true
  },
  serverName: String,
  maxPlayers: {
    type: Number,
    default: 32
  },
  features: {
    aimbot: { type: Boolean, default: true },
    speedhack: { type: Boolean, default: true },
    noclip: { type: Boolean, default: true },
    godmode: { type: Boolean, default: true },
    weaponModifier: { type: Boolean, default: true },
    vehicleModifier: { type: Boolean, default: true },
    teleport: { type: Boolean, default: true },
    resourceInjection: { type: Boolean, default: true },
    menuDetection: { type: Boolean, default: true },
    screenshotOnBan: { type: Boolean, default: false },
    webhookLogs: { type: Boolean, default: true }
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastHeartbeat: Date,
  activatedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
licenseSchema.index({ key: 1 });
licenseSchema.index({ owner: 1 });
licenseSchema.index({ status: 1 });

// Méthode pour vérifier si la licence est valide
licenseSchema.methods.isValid = function() {
  return this.status === 'active' && this.expiresAt > new Date();
};

// Méthode pour obtenir les jours restants
licenseSchema.methods.daysRemaining = function() {
  const now = new Date();
  const diff = this.expiresAt - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

module.exports = mongoose.model('License', licenseSchema);
