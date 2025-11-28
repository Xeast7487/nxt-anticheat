const jwt = require('jsonwebtoken');
const User = require('../models/User');
const License = require('../models/License');

// Authentifier l'utilisateur avec JWT
exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    if (user.banned) {
      return res.status(403).json({ error: 'Compte banni', reason: user.banReason });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    return res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// Vérifier que l'utilisateur est admin
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé - Admin requis' });
  }
  next();
};

// Authentifier une licence (pour les serveurs FiveM)
exports.authenticateLicense = async (req, res, next) => {
  try {
    const licenseKey = req.headers['x-license-key'];
    
    if (!licenseKey) {
      return res.status(401).json({ error: 'Clé de licence manquante' });
    }

    const license = await License.findOne({ key: licenseKey });

    if (!license) {
      return res.status(401).json({ error: 'Licence invalide' });
    }

    if (!license.isValid()) {
      return res.status(403).json({ 
        error: 'Licence inactive ou expirée',
        status: license.status,
        expiresAt: license.expiresAt
      });
    }

    // Mettre à jour le dernier heartbeat
    license.lastHeartbeat = new Date();
    await license.save();

    req.license = license;
    next();
  } catch (error) {
    console.error('Erreur authentification licence:', error);
    return res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};
