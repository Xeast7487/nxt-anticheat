const express = require('express');
const router = express.Router();
const Server = require('../models/Server');
const License = require('../models/License');
const { authenticateUser, authenticateLicense } = require('../middleware/auth');

// Obtenir l'état du serveur (pour le panel utilisateur)
router.get('/:licenseKey', authenticateUser, async (req, res) => {
  try {
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    let server = await Server.findOne({ license: license._id });
    
    if (!server) {
      // Créer le serveur s'il n'existe pas
      server = new Server({ license: license._id });
      await server.save();
    }

    res.json({ server, license });
  } catch (error) {
    console.error('Erreur récupération serveur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Bannir un joueur
router.post('/:licenseKey/ban', authenticateUser, async (req, res) => {
  try {
    const { playerName, identifiers, reason, duration, permanent } = req.body;
    
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    const server = await Server.findOne({ license: license._id });
    
    const ban = {
      playerName,
      identifiers,
      reason,
      bannedBy: req.user.username,
      permanent: permanent || false,
      expiresAt: permanent ? null : new Date(Date.now() + (duration || 86400000))
    };

    server.bans.push(ban);
    server.stats.totalBans += 1;
    await server.save();

    // Notifier le serveur FiveM en temps réel
    global.io.to(`license_${license.key}`).emit('player_banned', ban);

    res.json({ message: 'Joueur banni avec succès', ban });
  } catch (error) {
    console.error('Erreur ban joueur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Débannir un joueur
router.delete('/:licenseKey/ban/:banId', authenticateUser, async (req, res) => {
  try {
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    const server = await Server.findOne({ license: license._id });
    
    server.bans = server.bans.filter(ban => ban._id.toString() !== req.params.banId);
    await server.save();

    // Notifier le serveur FiveM
    global.io.to(`license_${license.key}`).emit('player_unbanned', req.params.banId);

    res.json({ message: 'Ban retiré avec succès' });
  } catch (error) {
    console.error('Erreur unban joueur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Kick un joueur
router.post('/:licenseKey/kick', authenticateUser, async (req, res) => {
  try {
    const { playerId, reason } = req.body;
    
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    // Notifier le serveur FiveM pour kick le joueur
    global.io.to(`license_${license.key}`).emit('kick_player', { playerId, reason });

    res.json({ message: 'Joueur expulsé' });
  } catch (error) {
    console.error('Erreur kick joueur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Heartbeat du serveur FiveM (appelé automatiquement par le script)
router.post('/heartbeat', authenticateLicense, async (req, res) => {
  try {
    const { players, maxPlayers, detections } = req.body;
    
    let server = await Server.findOne({ license: req.license._id });
    
    if (!server) {
      server = new Server({ license: req.license._id });
    }

    server.online = true;
    server.players = players || [];
    server.currentPlayers = players?.length || 0;
    server.maxPlayers = maxPlayers || 32;
    server.lastUpdate = new Date();

    // Ajouter les nouvelles détections
    if (detections && detections.length > 0) {
      server.detections.push(...detections);
      server.stats.totalDetections += detections.length;
    }

    await server.save();

    // Notifier les clients web connectés
    global.io.to(`license_${req.license.key}`).emit('server_update', {
      online: server.online,
      players: server.players,
      currentPlayers: server.currentPlayers
    });

    res.json({ 
      success: true,
      features: req.license.features,
      bans: server.bans
    });
  } catch (error) {
    console.error('Erreur heartbeat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Signaler une détection (appelé par le serveur FiveM)
router.post('/detection', authenticateLicense, async (req, res) => {
  try {
    const detection = req.body;
    
    let server = await Server.findOne({ license: req.license._id });
    
    if (!server) {
      server = new Server({ license: req.license._id });
    }

    detection.timestamp = new Date();
    server.detections.push(detection);
    server.stats.totalDetections += 1;
    await server.save();

    // Notifier en temps réel
    global.io.to(`license_${req.license.key}`).emit('new_detection', detection);

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur détection:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
