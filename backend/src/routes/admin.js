const express = require('express');
const router = express.Router();
const User = require('../models/User');
const License = require('../models/License');
const Server = require('../models/Server');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Toutes les routes nécessitent d'être admin
router.use(authenticateUser, requireAdmin);

// Statistiques globales
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLicenses = await License.countDocuments();
    const activeLicenses = await License.countDocuments({ status: 'active' });
    const totalServers = await Server.countDocuments();
    const onlineServers = await Server.countDocuments({ online: true });

    // Calculer les détections et bans totaux
    const servers = await Server.find();
    const totalDetections = servers.reduce((sum, s) => sum + s.stats.totalDetections, 0);
    const totalBans = servers.reduce((sum, s) => sum + s.stats.totalBans, 0);

    res.json({
      totalUsers,
      totalLicenses,
      activeLicenses,
      totalServers,
      onlineServers,
      totalDetections,
      totalBans
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().populate('licenses');
    res.json({ users });
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Bannir/débannir un utilisateur
router.put('/users/:userId/ban', async (req, res) => {
  try {
    const { banned, reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    user.banned = banned;
    user.banReason = reason || '';
    await user.save();

    res.json({ 
      message: banned ? 'Utilisateur banni' : 'Utilisateur débanni',
      user: user.toJSON() 
    });
  } catch (error) {
    console.error('Erreur ban utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste toutes les licences
router.get('/licenses', async (req, res) => {
  try {
    const licenses = await License.find().populate('owner', '-password');
    res.json({ licenses });
  } catch (error) {
    console.error('Erreur liste licences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une licence pour un utilisateur
router.post('/licenses', async (req, res) => {
  try {
    const { userId, type, duration } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (duration || 30));

    const license = new License({
      owner: userId,
      type: type || 'basic',
      expiresAt
    });

    await license.save();

    user.licenses.push(license._id);
    await user.save();

    res.status(201).json({ 
      message: 'Licence créée',
      license 
    });
  } catch (error) {
    console.error('Erreur création licence admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Suspendre/réactiver une licence
router.put('/licenses/:licenseKey/status', async (req, res) => {
  try {
    const { status } = req.body;
    const license = await License.findOne({ key: req.params.licenseKey });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    license.status = status;
    await license.save();

    // Notifier le serveur
    global.io.to(`license_${license.key}`).emit('license_status_changed', { status });

    res.json({ 
      message: 'Statut de la licence mis à jour',
      license 
    });
  } catch (error) {
    console.error('Erreur modification statut licence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une licence
router.delete('/licenses/:licenseKey', async (req, res) => {
  try {
    const license = await License.findOne({ key: req.params.licenseKey });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    // Supprimer le serveur associé
    await Server.deleteOne({ license: license._id });

    // Retirer de l'utilisateur
    await User.updateOne(
      { _id: license.owner },
      { $pull: { licenses: license._id } }
    );

    await license.deleteOne();

    res.json({ message: 'Licence supprimée' });
  } catch (error) {
    console.error('Erreur suppression licence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Liste tous les serveurs
router.get('/servers', async (req, res) => {
  try {
    const servers = await Server.find().populate({
      path: 'license',
      populate: { path: 'owner', select: '-password' }
    });
    res.json({ servers });
  } catch (error) {
    console.error('Erreur liste serveurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
