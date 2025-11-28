exports.errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreur Mongoose de validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: 'Erreur de validation', details: errors });
  }

  // Erreur Mongoose de duplication
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ error: `${field} existe déjà` });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide' });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur'
  });
};
