# 📖 Guide d'Installation Complet - Gestion des Congés

**Pour n'importe qui, n'importe où, n'importe quand** ✨

Durée estimée: **30-45 minutes** (première installation)

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Étape 1: Installer Java](#étape-1--installer-java)
3. [Étape 2: Installer Node.js](#étape-2--installer-nodejs)
4. [Étape 3: Installer MySQL](#étape-3--installer-mysql)
5. [Étape 4: Configurer la Base de Données](#étape-4--configurer-la-base-de-données)
6. [Étape 5: Cloner les Projets](#étape-5--cloner-les-projets)
7. [Étape 6: Démarrer le Backend](#étape-6--démarrer-le-backend)
8. [Étape 7: Démarrer le Frontend](#étape-7--démarrer-le-frontend)
9. [Étape 8: Se Connecter](#étape-8--se-connecter)
10. [Dépannage](#dépannage)

---

## ✅ Prérequis

Avant de commencer, vous devez avoir :

| Élément | Version | Télécharger |
|--------|---------|------------|
| **Java** | 17+ | [java.com](https://www.oracle.com/java/technologies/downloads/) |
| **Maven** | 3.6+ | [maven.apache.org](https://maven.apache.org/download.cgi) |
| **Node.js** | 16+ | [nodejs.org](https://nodejs.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **MySQL** | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/mysql/) |

**Durée**: 10-15 minutes

---

## Étape 1 🚀 Installer Java

### Windows

1. **Télécharger** Java 17 depuis [Oracle](https://www.oracle.com/java/technologies/downloads/)
   - Cliquer sur "Windows x64 Installer"
   - Accepter les conditions et télécharger

2. **Exécuter** le fichier `.exe`
   - Clic droit → "Exécuter en tant qu'administrateur"
   - Cliquer "Next" plusieurs fois
   - Cliquer "Install"
   - Attendre la fin de l'installation (2-3 minutes)

3. **Vérifier** l'installation:
   - Ouvrir PowerShell (Démarrer → taper "PowerShell")
   - Coller cette commande:
   ```powershell
   java -version
   ```
   - Vous devez voir quelque chose comme:
   ```
   java version "17.0.1"
   ```

**✅ Si vous voyez le numéro de version, bravo!**

### macOS

```bash
# Installer avec Homebrew
brew install openjdk@17

# Vérifier
java -version
```

### Linux (Ubuntu/Debian)

```bash
# Installer
sudo apt update
sudo apt install openjdk-17-jdk-headless

# Vérifier
java -version
```

---

## Étape 2 🔨 Installer Maven

### Windows

1. **Télécharger** Maven depuis [maven.apache.org](https://maven.apache.org/download.cgi)
   - Cliquer sur "Binary zip archive"
   - Télécharger le fichier

2. **Extraire** le fichier:
   - Clic droit sur le fichier `.zip`
   - "Extraire tout..."
   - Choisir le dossier `C:\Program Files`

3. **Ajouter Maven au PATH**:
   - Démarrer → taper "Environnement"
   - Cliquer "Modifier les variables d'environnement du système"
   - Cliquer "Variables d'environnement..."
   - Sous "Variables utilisateur", cliquer "Nouveau"
   - Nom: `MAVEN_HOME`
   - Valeur: `C:\Program Files\apache-maven-3.9.x` (ajuster le numéro de version)
   - Cliquer "OK"

4. **Vérifier** l'installation:
   - Ouvrir PowerShell
   - Coller:
   ```powershell
   mvn --version
   ```
   - Vous devez voir Apache Maven et la version

**✅ Si vous voyez Apache Maven, bravo!**

### macOS

```bash
brew install maven
mvn --version
```

### Linux

```bash
sudo apt install maven
mvn --version
```

---

## Étape 3 📦 Installer Node.js

### Windows

1. **Télécharger** Node.js depuis [nodejs.org](https://nodejs.org/)
   - Cliquer sur la version "LTS" (Recommended)
   - Télécharger l'installateur Windows

2. **Exécuter** l'installateur:
   - Clic droit → "Exécuter en tant qu'administrateur"
   - Cliquer "Next" plusieurs fois
   - Laisser les options par défaut
   - Cliquer "Install"
   - Attendre (2-3 minutes)

3. **Vérifier** l'installation:
   - Ouvrir PowerShell (nouveau terminal)
   - Coller:
   ```powershell
   node --version
   npm --version
   ```
   - Vous devez voir deux numéros de version

**✅ Si vous voyez les versions, bravo!**

### macOS

```bash
brew install node
node --version
npm --version
```

### Linux

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

---

## Étape 4 🗄️ Installer MySQL

### Windows

1. **Télécharger** MySQL Community Server depuis [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - Sélectionner "Windows (x86, 64-bit), MSI Installer"
   - Cliquer "Download"

2. **Exécuter** l'installateur:
   - Clic droit → "Exécuter en tant qu'administrateur"
   - Cliquer "Next"
   - Sélectionner "Developer Default" → "Next"
   - Cliquer "Execute" (télécharger les dépendances)
   - Cliquer "Next" plusieurs fois

3. **Configuration MySQL**:
   - Type de serveur: "Development Machine" → "Next"
   - Connectivity: laisser par défaut → "Next"
   - MySQL Enterprise Firewall: "Next"
   - Authentification: "Strong Password Encryption" → "Next"

4. **Mot de passe root**:
   - **IMPORTANT**: Noter le mot de passe que vous choisissez!
   - Par exemple: `admin123`
   - Cliquer "Next"

5. **Configuration du service**:
   - Laisser "Configure MySQL Server as a Windows Service" coché
   - Cliquer "Finish"

6. **Vérifier** l'installation:
   - Ouvrir PowerShell
   - Coller (remplacer par votre mot de passe):
   ```powershell
   mysql -u root -padmin123
   ```
   - Vous devez voir `mysql>` (l'invite de commande MySQL)
   - Taper:
   ```sql
   EXIT;
   ```

**✅ Si vous avez accès à MySQL, bravo!**

### macOS

```bash
brew install mysql
mysql_secure_installation
# Répondre aux questions (laisser par défaut, sauf pour mot de passe)
mysql -u root -p
```

### Linux

```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
mysql -u root -p
```

---

## Étape 5 💾 Configurer la Base de Données

1. **Ouvrir une session MySQL**:
   - PowerShell/Terminal
   - Coller (remplacer par votre mot de passe root):
   ```bash
   mysql -u root -padmin123
   ```
   - Vous devez voir `mysql>`

2. **Créer la base de données et l'utilisateur**:
   - Coller ces commandes une par une:

   ```sql
   CREATE DATABASE conges_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   ```sql
   CREATE USER 'conges_app'@'localhost' IDENTIFIED BY 'conges_app_password';
   ```

   ```sql
   GRANT ALL PRIVILEGES ON conges_db.* TO 'conges_app'@'localhost';
   ```

   ```sql
   FLUSH PRIVILEGES;
   ```

   ```sql
   EXIT;
   ```

3. **Vérifier** la création:
   ```bash
   mysql -u conges_app -pconges_app_password -e "USE conges_db; SHOW TABLES;"
   ```

**✅ Si vous voyez une table de résultats, bravo!**

---

## Étape 6 📥 Cloner les Projets

### Créer un Dossier de Travail

1. **Créer** un dossier pour les projets:
   - Ouvrir l'Explorateur de fichiers
   - Aller à votre Bureau ou Documents
   - Clic droit → "Nouveau" → "Dossier"
   - Nommer: `gestion-conges`

2. **Ouvrir PowerShell** dans ce dossier:
   - Clic droit dans le dossier → "Ouvrir PowerShell ici"

### Cloner le Backend

```powershell
git clone https://github.com/hamdisfaxii/gestion-conges-backend-main.git
cd gestion-conges-backend-main
```

### Cloner le Frontend

```powershell
cd ..
git clone https://github.com/hamdisfaxii/pfe-final-frontend.git
cd pfe-final-frontend
```

**Vous devez avoir:**
```
gestion-conges/
├── gestion-conges-backend-main/
└── pfe-final-frontend/
```

---

## Étape 7 🔧 Démarrer le Backend

### Installer les dépendances Maven

```powershell
cd gestion-conges-backend-main
mvn clean install -DskipTests
```

**⏳ Cela peut prendre 5-10 minutes** (télécharge les dépendances)

**Vous devez voir:**
```
BUILD SUCCESS
```

### Démarrer le serveur

```powershell
mvn spring-boot:run
```

**Attendre de voir:**
```
Tomcat started on port(s): 8080 (http)
```

**⚠️ NE PAS fermer ce terminal!**

### ✅ Vérifier le Backend

Dans un **nouveau PowerShell**:
```powershell
curl http://localhost:8080/swagger-ui.html
```

Vous devez voir du contenu HTML.

---

## Étape 8 ⚛️ Démarrer le Frontend

### Dans un NOUVEAU PowerShell

```powershell
cd gestion-conges-backend-main\..
cd pfe-final-frontend
```

### Installer les dépendances npm

```powershell
npm install
```

**⏳ Cela peut prendre 3-5 minutes**

**Vous devez voir:**
```
added X packages
```

### Démarrer le serveur dev

```powershell
npm run dev
```

**Attendre de voir:**
```
➜  Local:   http://localhost:5173/
```

**⚠️ NE PAS fermer ce terminal!**

---

## Étape 9 🔓 Se Connecter

### Ouvrir l'Application

1. **Ouvrir votre navigateur**:
   - Chrome, Firefox, Edge, Safari, etc.

2. **Aller à**:
   ```
   http://localhost:5173
   ```

3. **Voir la page de connexion** (fond bleu avec un formulaire)

### Utilisateurs de Test Disponibles

**L'application est livrée avec 5 utilisateurs de test :**

#### 1️⃣ Administrateur
- **Email**: `admin@conges.local`
- **Mot de passe**: `admin123`
- **Accès**: Tout l'application

#### 2️⃣ Responsable RH
- **Email**: `rh@conges.local`
- **Mot de passe**: `rh123`
- **Accès**: Gestion des demandes, approbations, statistiques

#### 3️⃣ Employé (Tunisie)
- **Email**: `employe@conges.local`
- **Mot de passe**: `employe123`
- **Accès**: Voir ses demandes, créer des demandes

#### 4️⃣ Employé (France)
- **Email**: `employe.fr@conges.local`
- **Mot de passe**: `employe123`
- **Accès**: Voir ses demandes, créer des demandes

#### 5️⃣ Employé (Maroc)
- **Email**: `employe.ma@conges.local`
- **Mot de passe**: `employe123`
- **Accès**: Voir ses demandes, créer des demandes

### Se Connecter

1. **Saisissez** l'email: `employe@conges.local`
2. **Saisissez** le mot de passe: `employe123`
3. **Cliquez** "Se connecter"
4. **Attendez** quelques secondes
5. **Vous voyez** le tableau de bord de l'employé ✅

---

## 🎯 Utilisation Basique

### Pour un Employé

1. **Tableau de bord**: Voir vos soldes de congés
2. **Demander des congés**: "Nouvelle demande"
3. **Historique**: Voir vos demandes précédentes
4. **Mon calendrier**: Visualiser vos absences

### Pour un RH

1. **Se connecter**: `rh@conges.local` / `rh123`
2. **Demandes en attente**: Voir toutes les demandes à traiter
3. **Approuver/Rejeter**: Cliquer sur une demande
4. **Statistiques**: Voir les soldes des employés
5. **Configuration**: Gérer les paramètres

---

## 🔧 Dépannage

### Problème: "Port 8080 déjà utilisé"

**Solution:**

```powershell
# Voir quel processus utilise le port
netstat -ano | findstr :8080

# Tuer le processus (remplacer PID par le numéro)
taskkill /PID XXXX /F
```

### Problème: "Impossible de se connecter à la base de données"

**Solution:**

1. Vérifier que MySQL fonctionne:
```powershell
mysql -u root -padmin123
```

2. Si l'erreur "Access denied":
   - Vérifier que vous utilisez le bon mot de passe
   - Réinitialiser si nécessaire

### Problème: "npm install échoue"

**Solution:**

```powershell
# Nettoyer le cache
npm cache clean --force

# Supprimer les fichiers
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Réinstaller
npm install
```

### Problème: "Java/Maven non trouvé"

**Solution:**

```powershell
# Vérifier les installations
java -version
mvn --version

# Si erreur, réinstaller:
# Télécharger Java: https://www.oracle.com/java/
# Télécharger Maven: https://maven.apache.org/
```

### Problème: "Frontend ne charge pas (localhost:5173)"

**Solution:**

1. Vérifier que le backend fonctionne:
```powershell
curl http://localhost:8080/swagger-ui.html
```

2. Si erreur, redémarrer le backend (terminal 1)

3. Nettoyer le navigateur:
   - Appuyer Ctrl+F5 (forcer la actualisation)
   - Ou vider le cache du navigateur

### Problème: "Page de connexion blanche"

**Solution:**

1. Ouvrir la console du navigateur (F12)
2. Voir les erreurs en rouge
3. Vérifier que le backend est accessible

---

## ✅ Checklist de Vérification

Avant de dire "ça fonctionne", vérifier:

- [ ] Java installé et version 17+
- [ ] Maven installé
- [ ] Node.js installé
- [ ] MySQL installé et base créée
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Page de connexion s'affiche (http://localhost:5173)
- [ ] Connexion avec `employe@conges.local` fonctionne
- [ ] Tableau de bord s'affiche

**Si tout est ✅, bravo! L'application fonctionne!** 🎉

---

## 📞 Besoin d'Aide?

1. **Lire la section Dépannage** ci-dessus
2. **Vérifier les logs** dans les 2 terminaux
3. **Contacter le développeur** avec les messages d'erreur

---

## 🚀 Prochaines Étapes

1. **Explorer l'application** avec les utilisateurs de test
2. **Créer vos propres données** (ajouter des employés, configurer les congés)
3. **Lire la documentation** des modules spécifiques
4. **Personnaliser** selon vos besoins

---

**Bonne chance! 🌟**

Si tout fonctionne, vous êtes maintenant prêt à utiliser **Gestion des Congés**!
