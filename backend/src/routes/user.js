const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

// Obtenir le profil utilisateur
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await req.user.populate('licenses');
    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour le profil
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { username, discordId } = req.body;
    
    if (username) req.user.username = username;
    if (discordId !== undefined) req.user.discordId = discordId;
    
    await req.user.save();
    
    res.json({ 
      message: 'Profil mis à jour',
      user: req.user.toJSON() 
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Changer le mot de passe
router.put('/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mots de passe requis' });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
