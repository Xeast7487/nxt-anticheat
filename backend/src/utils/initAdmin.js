const User = require('../models/User');

exports.initializeAdmin = async () => {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@nxtanticheat.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
      
      const admin = new User({
        email: adminEmail,
        password: adminPassword,
        username: 'Administrator',
        role: 'admin',
        verified: true
      });

      await admin.save();
      console.log('✅ Compte admin créé');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log('⚠️  CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT!');
    }
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
  }
};
