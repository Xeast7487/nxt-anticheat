# Installation Rapide - NXT Anti-Cheat

## 🚀 Démarrage Rapide (5 minutes)

### 1. Prérequis
- Node.js 18+ installé
- MongoDB installé et démarré
- Un serveur FiveM

### 2. Installation Backend

```powershell
# Dans le dossier nxt-anticheat
cd backend
npm install

# Copier et configurer .env
cp .env.example .env
# Éditez .env et changez au minimum:
# - JWT_SECRET (un string aléatoire long)
# - ADMIN_EMAIL et ADMIN_PASSWORD
```

Démarrer le backend:
```powershell
npm run dev
```

Le backend démarre sur http://localhost:5000

### 3. Installation Frontend

```powershell
# Nouveau terminal, dans le dossier nxt-anticheat
cd frontend
npm install

# Copier et configurer .env
cp .env.example .env
```

Démarrer le frontend:
```powershell
npm run dev
```

Le panel démarre sur http://localhost:3000

### 4. Première Connexion

1. Ouvrez http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Créez votre compte

Ou connectez-vous avec l'admin par défaut:
- Email: `admin@nxtanticheat.com`
- Password: `Admin123!`

**⚠️ CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT!**

### 5. Créer une Licence

Dans le dashboard:
1. Cliquez "Acheter une licence"
2. Pour le test, utilisez la commande admin ou créez-en une manuellement
3. Notez votre clé de licence

### 6. Installer sur FiveM

1. Copiez le dossier `fivem-script` dans votre serveur:
   ```
   resources/[anticheat]/nxt-anticheat/
   ```

2. Éditez `config.lua`:
   ```lua
   Config.LicenseKey = "VOTRE_CLE_ICI"  -- Collez votre clé
   Config.APIEndpoint = "http://localhost:5000"
   ```

3. Dans `server.cfg`:
   ```
   ensure nxt-anticheat
   ```

4. Redémarrez votre serveur FiveM

### 7. Vérification

1. Connectez-vous à votre serveur FiveM
2. Dans le panel web, allez dans votre licence
3. Vous devriez voir:
   - Serveur en ligne ✅
   - Joueurs connectés
   - Protection active

## 🐳 Installation Docker (Encore plus rapide!)

```powershell
# Configurer
cp backend/.env.example backend/.env
# Éditez backend/.env

# Démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

C'est tout! Le système est prêt sur http://localhost:3000

## 🔧 Configuration Stripe (Paiements)

Pour activer les paiements:

1. Créez un compte sur https://stripe.com
2. Récupérez vos clés API (Dashboard → Developers → API keys)
3. Ajoutez dans `backend/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Configurez le webhook Stripe:
   - URL: `https://votre-domaine.com/api/payment/webhook`
   - Événements: `checkout.session.completed`

## 📱 Commandes Utiles

### Créer une licence manuellement (pour test)

Dans MongoDB ou via l'API:
```javascript
// Depuis la console Node.js ou un script
const License = require('./backend/src/models/License');

const license = new License({
  owner: 'USER_ID_ICI',
  type: 'premium',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
});
await license.save();
console.log('Licence:', license.key);
```

### Commandes FiveM

En jeu sur le serveur:
```
/nxtban [id] [raison]     # Bannir un joueur
/nxtkick [id] [raison]    # Expulser un joueur
```

## 🌐 Mettre en Production

### Sur un VPS

1. Installez Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

2. Clonez votre projet
3. Configurez `.env` avec vos vraies valeurs
4. Changez `ALLOWED_ORIGINS` pour votre domaine
5. Démarrez:
```bash
docker-compose up -d
```

6. Configurez Nginx/Apache pour rediriger vers le port 3000

### Sur Pterodactyl

⚠️ **ERREUR COURANTE:** Ne uploadez PAS tout le projet!

**Solution au problème "Cannot find module '/home/container'":**

1. **Uploadez UNIQUEMENT le dossier `backend`** (pas le projet entier)
2. **Startup Command:** `node src/index.js`
3. **Installez les dépendances:** `npm install`
4. **Configurez MongoDB** (utilisez MongoDB Atlas gratuit)

📖 **Guide complet:** Voir `PTERODACTYL.md` pour les instructions détaillées

### Variables importantes à changer en prod:

```env
NODE_ENV=production
JWT_SECRET=un-très-long-string-aléatoire-sécurisé
ADMIN_PASSWORD=un-mot-de-passe-fort
ALLOWED_ORIGINS=https://votre-domaine.com
MONGODB_URI=mongodb://user:pass@host:port/database
```

## ❓ Problèmes Courants

### MongoDB ne démarre pas
```powershell
# Vérifier si MongoDB est installé
mongod --version

# Démarrer MongoDB
mongod --dbpath C:\data\db
```

### Port déjà utilisé
Changez les ports dans `.env`:
```
PORT=5001  # Au lieu de 5000
```

Et dans `docker-compose.yml` si vous utilisez Docker.

### Le FiveM ne se connecte pas
1. Vérifiez que l'API est accessible
2. Testez: `curl http://localhost:5000/health`
3. Vérifiez la clé de licence dans `config.lua`

## 🎉 C'est Prêt!

Vous avez maintenant:
- ✅ Un panel web professionnel
- ✅ Un système de licences
- ✅ Un anti-cheat FiveM fonctionnel
- ✅ Des détections en temps réel
- ✅ Un système de bans

**Profitez de votre anti-cheat professionnel!** 🛡️
