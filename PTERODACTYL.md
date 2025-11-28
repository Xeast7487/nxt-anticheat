# Guide d'Installation sur Pterodactyl

## 🐦 Installation Pterodactyl

### Structure du Projet

Uploadez **UNIQUEMENT** le dossier `backend` sur Pterodactyl (pas tout le projet).

### Configuration Pterodactyl

1. **Créer un nouveau serveur Node.js**
   - Type: Node.js Generic
   - Version Node.js: 18 ou supérieur

2. **Configuration du Startup**

Dans les paramètres du serveur Pterodactyl, configurez:

**Startup Command:**
```bash
node src/index.js
```

**Variables d'environnement:**

⚠️ **IMPORTANT:** Ajoutez ces variables dans Pterodactyl:
- Allez dans votre serveur
- Cliquez sur "Startup"
- Descendez jusqu'à "Variables"
- Cliquez sur chaque variable et ajoutez la valeur

| Variable | Valeur Exemple | Description |
|----------|----------------|-------------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/nxt-anticheat` | **REQUIS** - URI MongoDB (voir ci-dessous) |
| `JWT_SECRET` | `changez-moi-par-un-string-tres-long-securise-123456` | **REQUIS** - Secret pour JWT |
| `ADMIN_EMAIL` | `admin@votredomaine.com` | Email admin par défaut |
| `ADMIN_PASSWORD` | `VotreMotDePasseSecurisé123!` | Mot de passe admin |
| `PORT` | `5000` | Port (auto-assigné par Pterodactyl) |
| `NODE_ENV` | `production` | Environnement |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | URLs autorisées (séparées par virgule) |

### 🔧 Comment ajouter les variables dans Pterodactyl:

1. Dans votre serveur, allez dans **"Startup"**
2. Descendez jusqu'à la section **"Variables"**
3. Pour chaque variable listée:
   - Cliquez dans le champ de texte
   - Collez votre valeur
   - Sauvegardez (automatique)

3. **Structure des fichiers sur Pterodactyl**

```
/home/container/
├── src/
│   ├── index.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── package.json
└── node_modules/
```

### Installation Étape par Étape

1. **Préparer les fichiers localement**

```powershell
# Créez un ZIP contenant UNIQUEMENT le dossier backend
cd nxt-anticheat
Compress-Archive -Path backend\* -DestinationPath nxt-backend.zip
```

2. **Uploader sur Pterodactyl**
   - Allez dans File Manager
   - Uploadez `nxt-backend.zip`
   - Extrayez-le
   - Assurez-vous que `src/index.js` est directement dans `/home/container/`

3. **Installer les dépendances**

Dans la console Pterodactyl:
```bash
npm install --production
```

4. **Configurer MongoDB** (TRÈS IMPORTANT!)

**⭐ Option A: MongoDB Atlas (RECOMMANDÉ - Gratuit)**

1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte gratuit
3. Créez un nouveau cluster (choisissez le plan FREE - M0)
4. Attendez que le cluster soit créé (2-5 minutes)

5. **🔥 IMPORTANT - Autoriser toutes les IPs:**
   - Dans le menu de gauche, cliquez sur **"Network Access"**
   - Cliquez sur **"Add IP Address"**
   - Cliquez sur **"Allow Access from Anywhere"** (ou ajoutez `0.0.0.0/0`)
   - Cliquez sur **"Confirm"**
   - ⚠️ **C'est la cause #1 d'erreur de connexion!**

6. **Créer un utilisateur de base de données:**
   - Dans le menu de gauche, cliquez sur **"Database Access"**
   - Cliquez sur **"Add New Database User"**
   - Choisissez "Password" comme méthode d'authentification
   - Créez un nom d'utilisateur (exemple: `nxtuser`)
   - Créez un mot de passe **SANS caractères spéciaux** (exemple: `MonMotDePasse123`)
   - **NOTEZ BIEN le mot de passe!**
   - Privilèges: **"Read and write to any database"**
   - Cliquez sur **"Add User"**

7. **Obtenir l'URI de connexion:**
   - Retournez dans "Database" (menu de gauche)
   - Cliquez sur **"Connect"** sur votre cluster
   - Choisissez **"Connect your application"**
   - Copiez l'URI de connexion:
     ```
     mongodb+srv://nxtuser:MonMotDePasse123@cluster0.xxxxx.mongodb.net/nxt-anticheat
     ```
   - **REMPLACEZ `<password>` par votre VRAI mot de passe!**

8. Dans Pterodactyl → Startup → Variables, collez cette URI dans `MONGODB_URI`

**Option B: MongoDB sur votre propre serveur**
```
MONGODB_URI=mongodb://username:password@ip:27017/nxt-anticheat
```

**⚠️ ERREURS COMMUNES:**
- "uri parameter must be a string" → `MONGODB_URI` n'est pas défini dans les variables
- "Could not connect to any servers" → IP non autorisée (suivez l'étape 5 ci-dessus!)
- "Authentication failed" → Mauvais mot de passe dans l'URI

**💡 ASTUCE:** Utilisez un mot de passe SIMPLE sans caractères spéciaux (@, #, %, etc.) pour éviter les problèmes d'encodage

5. **Démarrer le serveur**

Cliquez sur "Start" dans le panel Pterodactyl

### Vérification

Si tout fonctionne, vous devriez voir dans la console:
```
✅ Connecté à MongoDB
✅ Compte admin créé
🚀 Serveur démarré sur le port 5000
📡 Socket.IO actif
```

### Erreurs Courantes

#### ❌ Erreur: Cannot find module '/home/container'

**Cause:** Vous avez uploadé tout le projet au lieu du dossier `backend` uniquement.

**Solution:** 
1. Supprimez tout sur Pterodactyl
2. Uploadez UNIQUEMENT le contenu du dossier `backend`
3. Startup command: `node src/index.js`

#### ❌ Erreur: The `uri` parameter to `openUri()` must be a string, got "undefined"

**Cause:** La variable `MONGODB_URI` n'est pas configurée.

**Solution:**
1. Allez dans **Startup → Variables** sur Pterodactyl
2. Trouvez `MONGODB_URI` dans la liste
3. Cliquez dans le champ et collez votre URI MongoDB Atlas
4. Exemple: `mongodb+srv://user:password@cluster.mongodb.net/nxt-anticheat`
5. Redémarrez le serveur

#### ❌ Erreur: Could not connect to any servers in your MongoDB Atlas cluster / IP isn't whitelisted

**Cause:** Votre IP n'est pas autorisée dans MongoDB Atlas.

**Solution:**
1. Allez sur https://cloud.mongodb.com
2. Connectez-vous à votre compte
3. Dans le menu de gauche, cliquez sur **"Network Access"**
4. Cliquez sur **"Add IP Address"**
5. Cliquez sur **"Allow Access from Anywhere"**
6. Confirmez en ajoutant `0.0.0.0/0`
7. Cliquez sur **"Confirm"**
8. Attendez 1-2 minutes que les changements soient appliqués
9. Redémarrez votre serveur Pterodactyl

**Alternative:** Si vous connaissez l'IP de votre serveur Pterodactyl, ajoutez-la spécifiquement au lieu de `0.0.0.0/0`

#### Erreur: Cannot find module 'express'

**Solution:** Les dépendances ne sont pas installées.
```bash
npm install
```

#### Erreur: MongoDB connection failed

**Solution:** Vérifiez votre URI MongoDB dans les variables d'environnement.

### Configuration pour le Frontend

Si vous hébergez le frontend ailleurs, configurez:

1. **Dans les variables d'environnement du backend:**
```
ALLOWED_ORIGINS=https://votre-frontend-url.com
```

2. **Dans votre frontend (.env):**
```
VITE_API_URL=https://votre-backend-pterodactyl.com
```

### Package.json pour Pterodactyl

Assurez-vous que votre `backend/package.json` contient:

```json
{
  "name": "nxt-anticheat-backend",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Allocation de Port

Pterodactyl assigne automatiquement un port. Pour l'utiliser:

1. Dans votre code, utilisez:
```javascript
const PORT = process.env.PORT || 5000;
```

2. Notez le port assigné par Pterodactyl (visible dans le panel)

3. Utilisez ce port pour configurer votre frontend et votre script FiveM

### Logs et Debugging

Pour voir les logs:
- Allez dans "Console" sur Pterodactyl
- Regardez les messages de démarrage
- Utilisez `console.log()` dans votre code pour déboguer

### Domaine Personnalisé

Pour utiliser un domaine personnalisé:

1. Créez un enregistrement DNS:
```
Type: A
Name: api
Value: [IP de votre serveur Pterodactyl]
```

2. Configurez un reverse proxy (Nginx/Cloudflare)

3. Mettez à jour `ALLOWED_ORIGINS` avec votre domaine

---

## 🚀 Frontend sur Hébergement Séparé

Si vous hébergez le frontend ailleurs (Vercel, Netlify, etc.):

### Sur Vercel

1. Connectez votre repo GitHub
2. Sélectionnez le dossier `frontend`
3. Variables d'environnement:
   - `VITE_API_URL`: URL de votre backend Pterodactyl

### Sur Netlify

Même processus que Vercel.

### Sur un VPS

```bash
cd frontend
npm install
npm run build

# Servir avec Nginx
sudo cp -r dist/* /var/www/html/
```

---

## 🔒 Sécurité

**Important:**
- Changez `JWT_SECRET` en production
- Utilisez HTTPS (Cloudflare, Let's Encrypt)
- Changez le mot de passe admin par défaut
- Ne commitez jamais les fichiers `.env`

---

## 📞 Support Pterodactyl

Si vous avez toujours des problèmes:

1. Vérifiez les logs dans la console Pterodactyl
2. Assurez-vous que MongoDB est accessible
3. Vérifiez que le port est ouvert
4. Testez la connexion avec:
```bash
curl http://votre-ip:port/health
```

---

**Votre backend devrait maintenant fonctionner sur Pterodactyl!** 🎉
