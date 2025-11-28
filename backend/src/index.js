require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Routes
const authRoutes = require('./routes/auth');
const licenseRoutes = require('./routes/license');
const serverRoutes = require('./routes/server');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

// Middleware
const { errorHandler } = require('./middleware/errorHandler');
const { initializeAdmin } = require('./utils/initAdmin');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }
});

// Middleware de base
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO pour temps réel
global.io = io;

io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);
  
  socket.on('authenticate', (data) => {
    // Authentification du serveur FiveM
    socket.licenseKey = data.licenseKey;
    socket.join(`license_${data.licenseKey}`);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Route santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gestion des erreurs
app.use(errorHandler);

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nxt-anticheat';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI non défini, utilisation de la valeur par défaut');
  console.warn('⚠️  Configurez MONGODB_URI dans les variables d\'environnement!');
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connecté à MongoDB');
  await initializeAdmin();
})
.catch((err) => {
  console.error('❌ Erreur MongoDB:', err);
  console.error('💡 Solution: Configurez MONGODB_URI dans les variables d\'environnement');
  console.error('💡 Exemple: mongodb+srv://user:pass@cluster.mongodb.net/nxt-anticheat');
  process.exit(1);
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
