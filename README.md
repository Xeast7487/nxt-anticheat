# 🛡️ NXT Anti-Cheat

Système anti-cheat professionnel pour FiveM avec panel de gestion en ligne.

## 📋 Fonctionnalités

### Panel Web
- ✅ Système de comptes et authentification JWT
- ✅ Gestion des licences (achat, renouvellement)
- ✅ Dashboard temps réel avec Socket.IO
- ✅ Visualisation des joueurs en ligne
- ✅ Gestion des bans et kicks depuis le panel
- ✅ Configuration des détections en temps réel
- ✅ Historique des détections
- ✅ Panel admin complet
- ✅ Paiements Stripe intégrés

### Anti-Cheat FiveM
- 🚫 Détection Aimbot
- 🚫 Détection Speed Hack
- 🚫 Détection Noclip
- 🚫 Détection God Mode
- 🚫 Détection Weapon Modifier
- 🚫 Détection Vehicle Modifier
- 🚫 Détection Teleport
- 🚫 Détection Menu de triche
- 🚫 Détection Resource Injection
- 🚫 Protection Explosion Spam
- 🚫 Protection Particle Spam

## 🚀 Installation

### Prérequis
- Node.js 18+
- MongoDB
- Docker (optionnel)
- Serveur FiveM

### Méthode 1: Docker (Recommandé)

1. **Cloner le projet**
```bash
git clone https://github.com/votre-repo/nxt-anticheat.git
cd nxt-anticheat
```

2. **Configuration**
```bash
# Backend
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos valeurs

# Frontend
cp frontend/.env.example frontend/.env
# Éditer frontend/.env avec votre URL d'API
```

3. **Démarrer avec Docker**
```bash
docker-compose up -d
```

Le panel sera accessible sur http://localhost:3000
L'API sur http://localhost:5000

### Méthode 2: Installation Manuelle

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer le fichier .env
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurer le fichier .env
npm run dev
```

#### MongoDB

Assurez-vous que MongoDB est installé et en cours d'exécution:
```bash
mongod --dbpath /path/to/data
```

## 📦 Installation sur FiveM

1. **Télécharger le script**
   - Connectez-vous à votre panel
   - Allez dans votre licence
   - Téléchargez le fichier `nxt-anticheat.zip`

2. **Installation**
   - Extraire le dossier dans `resources/[anticheat]/nxt-anticheat`
   - Ouvrir `config.lua`
   - Configurer votre clé de licence:
   ```lua
   Config.LicenseKey = "VOTRE_CLE_ICI"
   Config.APIEndpoint = "http://votre-domaine.com:5000"
   ```

3. **Démarrer la ressource**
   - Ajouter dans `server.cfg`:
   ```
   ensure nxt-anticheat
   ```

## ⚙️ Configuration

### Variables d'environnement Backend

```env
# Serveur
PORT=5000
NODE_ENV=production

# Base de données
MONGODB_URI=mongodb://localhost:27017/nxt-anticheat

# Sécurité
JWT_SECRET=votre-secret-jwt-super-securise

# Admin par défaut
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123

# Stripe (Paiements)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://votre-domaine.com
```

### Configuration FiveM

Éditez `fivem-script/config.lua`:

```lua
Config.LicenseKey = "VOTRE_CLE_DE_LICENCE"
Config.APIEndpoint = "http://votre-domaine.com:5000"
Config.ServerName = "Mon Serveur"
Config.AutoBan = true
Config.AutoKick = true

-- Webhooks Discord
Config.Webhook = {
    Enabled = true,
    URL = "https://discord.com/api/webhooks/..."
}
```

## 🔧 Utilisation

### Première connexion

1. Accédez au panel: http://votre-domaine.com:3000
2. Créez un compte
3. Connectez-vous avec les identifiants admin:
   - Email: `admin@nxtanticheat.com`
   - Mot de passe: `Admin123!`
4. **CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT**

### Acheter une licence

1. Allez dans "Dashboard"
2. Cliquez sur "Acheter une licence"
3. Choisissez votre plan (Basic, Premium, Enterprise)
4. Complétez le paiement Stripe
5. Votre licence apparaîtra dans le dashboard

### Activer votre serveur

1. Cliquez sur "Gérer" pour votre licence
2. Configurez votre serveur (IP, nom)
3. Téléchargez le script
4. Installez-le dans votre serveur FiveM
5. Redémarrez votre serveur

### Gérer les détections

Dans le panel serveur, onglet "Paramètres":
- Activez/désactivez les détections en temps réel
- Les changements sont appliqués immédiatement
- Consultez les logs et détections dans l'onglet "Détections"

### Bannir un joueur

**Depuis le panel:**
1. Allez dans l'onglet "Joueurs en ligne"
2. Cliquez sur "Ban" à côté du joueur
3. Entrez la raison

**Depuis le serveur:**
```
/nxtban [id] [raison]
/nxtkick [id] [raison]
```

## 🐳 Déploiement Docker sur VPS

### Sur VPS Debian/Ubuntu

1. **Installer Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt install docker-compose -y
```

2. **Cloner et configurer**
```bash
git clone https://github.com/votre-repo/nxt-anticheat.git
cd nxt-anticheat
cp backend/.env.example backend/.env
nano backend/.env  # Configurer
```

3. **Démarrer**
```bash
docker-compose up -d
```

4. **Configurer Nginx (optionnel)**
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Sur Pterodactyl

1. Créez un nouveau serveur Node.js
2. Uploadez les fichiers
3. Configurez les variables d'environnement dans le panel
4. Démarrez avec: `npm start`

## 📊 API Endpoints

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/verify` - Vérifier le token

### Licences
- `GET /api/license/my-licenses` - Obtenir mes licences
- `POST /api/license/create` - Créer une licence
- `PUT /api/license/:key/features` - Modifier les fonctionnalités

### Serveur (avec licence)
- `POST /api/server/heartbeat` - Heartbeat du serveur FiveM
- `POST /api/server/detection` - Signaler une détection
- `POST /api/server/:key/ban` - Bannir un joueur
- `POST /api/server/:key/kick` - Expulser un joueur

### Admin
- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/licenses` - Liste des licences
- `PUT /api/admin/users/:id/ban` - Bannir un utilisateur

## 🔐 Sécurité

- ✅ Authentification JWT avec tokens sécurisés
- ✅ Mots de passe hashés avec bcrypt
- ✅ Rate limiting sur l'API
- ✅ Helmet.js pour sécuriser Express
- ✅ CORS configuré
- ✅ Validation des entrées
- ✅ Clés de licence uniques et cryptées

## 🛠️ Développement

### Structure du projet

```
nxt-anticheat/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── models/      # Modèles MongoDB
│   │   ├── routes/      # Routes API
│   │   ├── middleware/  # Middleware Express
│   │   └── utils/       # Utilitaires
│   └── package.json
├── frontend/            # Panel React
│   ├── src/
│   │   ├── pages/      # Pages React
│   │   ├── contexts/   # Context API
│   │   └── utils/      # Utilitaires
│   └── package.json
├── fivem-script/       # Script FiveM
│   ├── client/         # Scripts client
│   ├── server/         # Scripts serveur
│   └── config.lua
└── docker-compose.yml
```

### Commandes utiles

```bash
# Développement
npm run dev           # Démarrer tout en dev
npm run dev:backend   # Backend seulement
npm run dev:frontend  # Frontend seulement

# Production
npm run build         # Build tout
npm start            # Démarrer en production

# Docker
docker-compose up -d          # Démarrer
docker-compose logs -f        # Voir les logs
docker-compose down           # Arrêter
docker-compose restart backend # Redémarrer un service
```

## 📈 Plans et Tarifs

### Basic - 9.99€/mois
- Protection complète
- 32 joueurs max
- Détections en temps réel
- Support Discord

### Premium - 19.99€/mois ⭐
- Tout Basic +
- 128 joueurs max
- Screenshots automatiques
- Webhooks Discord
- Support prioritaire

### Enterprise - 49.99€/mois
- Tout Premium +
- Joueurs illimités
- API personnalisée
- Support 24/7
- SLA 99.9%

## 🐛 Dépannage

### Le serveur FiveM ne se connecte pas
1. Vérifiez que la clé de licence est correcte
2. Vérifiez que l'URL de l'API est accessible
3. Vérifiez les logs du serveur: `[NXT Anti-Cheat]`

### Les détections ne fonctionnent pas
1. Vérifiez que les fonctionnalités sont activées dans le panel
2. Vérifiez que le heartbeat fonctionne
3. Consultez les logs client avec F8

### Le panel ne charge pas
1. Vérifiez que MongoDB est en cours d'exécution
2. Vérifiez que le backend est démarré
3. Vérifiez les variables d'environnement

## 📞 Support

- 📧 Email: support@nxtanticheat.com
- 💬 Discord: https://discord.gg/nxtanticheat
- 📚 Documentation: https://docs.nxtanticheat.com

## 📝 Licence

Copyright © 2025 NXT Anti-Cheat. Tous droits réservés.

---

**⚠️ Important:**
- Changez tous les mots de passe par défaut
- Configurez correctement les variables d'environnement
- Utilisez HTTPS en production
- Sauvegardez régulièrement votre base de données
- Gardez le système à jour

**Made with ❤️ for the FiveM community**
