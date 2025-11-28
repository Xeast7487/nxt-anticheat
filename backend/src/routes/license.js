const express = require('express');
const router = express.Router();
const License = require('../models/License');
const User = require('../models/User');
const { authenticateUser } = require('../middleware/auth');

// Obtenir toutes les licences de l'utilisateur
router.get('/my-licenses', authenticateUser, async (req, res) => {
  try {
    const licenses = await License.find({ owner: req.user._id });
    res.json({ licenses });
  } catch (error) {
    console.error('Erreur récupération licences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir une licence spécifique
router.get('/:licenseKey', authenticateUser, async (req, res) => {
  try {
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    res.json({ license });
  } catch (error) {
    console.error('Erreur récupération licence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une nouvelle licence (admin uniquement pour test, normalement via paiement)
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { type, duration } = req.body;
    
    // Calculer la date d'expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (duration || 30));

    const license = new License({
      owner: req.user._id,
      type: type || 'basic',
      expiresAt
    });

    await license.save();

    // Ajouter la licence à l'utilisateur
    req.user.licenses.push(license._id);
    await req.user.save();

    res.status(201).json({ 
      message: 'Licence créée avec succès',
      license 
    });
  } catch (error) {
    console.error('Erreur création licence:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// Mettre à jour les fonctionnalités d'une licence
router.put('/:licenseKey/features', authenticateUser, async (req, res) => {
  try {
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    // Mettre à jour les fonctionnalités
    license.features = { ...license.features, ...req.body };
    await license.save();

    // Notifier le serveur en temps réel
    global.io.to(`license_${license.key}`).emit('features_updated', license.features);

    res.json({ 
      message: 'Fonctionnalités mises à jour',
      license 
    });
  } catch (error) {
    console.error('Erreur mise à jour licence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Activer une licence sur un serveur
router.post('/:licenseKey/activate', authenticateUser, async (req, res) => {
  try {
    const { serverIp, serverPort, serverName } = req.body;
    
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    license.serverIp = serverIp;
    license.serverPort = serverPort;
    license.serverName = serverName;
    license.activatedAt = new Date();
    await license.save();

    res.json({ 
      message: 'Licence activée sur le serveur',
      license 
    });
  } catch (error) {
    console.error('Erreur activation licence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Renouveler une licence
router.post('/:licenseKey/renew', authenticateUser, async (req, res) => {
  try {
    const { duration } = req.body;
    
    const license = await License.findOne({ 
      key: req.params.licenseKey,
      owner: req.user._id 
    });

    if (!license) {
      return res.status(404).json({ error: 'Licence introuvable' });
    }

    // Ajouter la durée à partir de maintenant ou de la date d'expiration
    const baseDate = license.expiresAt > new Date() ? license.expiresAt : new Date();
    license.expiresAt = new Date(baseDate.getTime() + (duration || 30) * 24 * 60 * 60 * 1000);
    license.status = 'active';
    await license.save();

    res.json({ 
      message: 'Licence renouvelée avec succès',
      license 
    });
  } catch (error) {
    console.error('Erreur renouvellement licence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
