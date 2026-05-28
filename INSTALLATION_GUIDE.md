# 🚀 Guide d'Installation Complet - Gestion des Congés

Ce guide détaillé vous permettra d'installer et de configurer l'application complète sur n'importe quelle machine.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Structure du Projet](#structure-du-projet)
3. [Installation du Backend](#installation-du-backend)
4. [Installation du Frontend](#installation-du-frontend)
5. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
6. [Lancement de l'Application](#lancement-de-lapplication)
7. [Vérification et Tests](#vérification-et-tests)
8. [Troubleshooting](#troubleshooting)
9. [Arrêt de l'Application](#arrêt-de-lapplication)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous que vous avez installé:

### 1. **Java Development Kit (JDK) 17+**

**Windows:**
- Télécharger depuis [oracle.com](https://www.oracle.com/java/technologies/downloads/) ou [adoptopenjdk.net](https://adoptopenjdk.net/)
- Ou installer via Chocolatey: `choco install openjdk17`

**Vérification:**
```bash
java -version
javac -version
```

**Doit afficher:** `java version "17" ou supérieur`

### 2. **Node.js 18+ et npm**

**Windows:**
- Télécharger depuis [nodejs.org](https://nodejs.org/)
- Ou installer via Chocolatey: `choco install nodejs`

**Vérification:**
```bash
node --version
npm --version
```

**Doit afficher:** Node v18+ et npm 9+

### 3. **MySQL 8.0+**

**Option A: Installation Locale**
- Windows: Télécharger [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
  - Installer avec le Setup Wizard
  - Configurer le port (défaut: 3306)
  - Créer un utilisateur root avec mot de passe
- Ou: Installer via Chocolatey: `choco install mysql`

**Option B: Docker (Recommandé)**
- Installer [Docker Desktop](https://www.docker.com/products/docker-desktop)
- L'application inclut `docker-compose.yml` pour MySQL

**Vérification (MySQL local):**
```bash
mysql --version
mysql -u root -p -e "SELECT 1;"
```

### 4. **Maven** (pour compiler le backend)

**Windows:**
- Télécharger depuis [maven.apache.org](https://maven.apache.org/download.cgi)
- Ou installer via Chocolatey: `choco install maven`

**Vérification:**
```bash
mvn --version
```

**Doit afficher:** Apache Maven 3.8+

### 5. **Git** (optionnel mais recommandé)

**Windows:**
- Installer depuis [git-scm.com](https://git-scm.com/)
- Ou: `choco install git`

**Vérification:**
```bash
git --version
```

---

## 📁 Structure du Projet

```
Desktop/
├── pfe-frontend-main/          # Application React
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env                    # À créer
│
└── gestion-conges-backend-main/  # Backend Spring Boot
    ├── src/
    ├── pom.xml
    ├── .env                    # Déjà présent
    ├── setup-db.sql           # Script de création DB
    └── docker-compose.yml     # Configuration Docker
```

---

## 🔨 Installation du Backend

### Étape 1: Accéder au répertoire backend

```bash
cd C:\Users\Asus\Desktop\gestion-conges-backend-main
```

### Étape 2: Configurer la base de données

#### Option A: Utiliser Docker (Recommandé)

**2a.1 Vérifier le fichier `.env`:**

```bash
cat .env
```

**Le fichier doit contenir:**
```env
# ================= MAIL CONFIG =================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=hamdihamdisfaxi@gmail.com
MAIL_PASSWORD=ovpi joaz ateh imax
MAIL_FROM_EMAIL=hamdihamdisfaxi@gmail.com
MAIL_FROM_NAME=Gestion des Conges
MAIL_ASYNC=true
MAIL_TO_OVERRIDE=hamdihamdisfaxi@gmail.com

# ================= DATABASE =================
DB_HOST=db
DB_PORT=3306
DB_NAME=conges_db
DB_USER=conges_app
DB_PASSWORD=conges_app_password

# ================= DOLIBARR =================
DOLIBARR_URL=http://host.docker.internal/dolibarr/api/index.php
DOLIBARR_DB_HOST=localhost
DOLIBARR_DB_PORT=3306
DOLIBARR_DB_NAME=dolibarr
DOLIBARR_DB_USER=root
DOLIBARR_DB_PASSWORD=12345678

# ================= JWT =================
JWT_SECRET=Hf7_kL9_pQ2xZ8_mN5vR3sT6uY_safe_key_change_me
JWT_EXPIRATION=604800000

# ================= SERVER =================
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev
```

**2a.2 Démarrer Docker Compose:**

```bash
docker compose up -d
```

**2a.3 Vérifier le statut:**

```bash
docker compose ps
```

**Vous devriez voir:**
```
NAME                  STATUS
gestion-conges-backend-main-db-1  Up
gestion-conges-backend-main-backend-1  Up
```

**2a.4 Attendre 30 secondes** que MySQL soit complètement prêt.

#### Option B: MySQL Local

**2b.1 Démarrer MySQL:**

```bash
mysql -u root -p
```

**2b.2 Créer la base de données et l'utilisateur:**

```sql
CREATE DATABASE IF NOT EXISTS conges_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'conges_app'@'localhost' IDENTIFIED BY 'conges_app_password';
GRANT ALL PRIVILEGES ON conges_db.* TO 'conges_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**2b.3 Importer le schéma:**

```bash
mysql -u conges_app -pconges_app_password conges_db < setup-db.sql
```

**2b.4 Mettre à jour le fichier `.env`:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=conges_db
DB_USER=conges_app
DB_PASSWORD=conges_app_password
```

### Étape 3: Compiler et démarrer le backend

**3.1 Compiler le projet Maven:**

```bash
mvn clean install -DskipTests
```

**Cela peut prendre 3-5 minutes la première fois.**

**3.2 Démarrer le backend:**

```bash
mvn spring-boot:run
```

**Ou utiliser le script fourni:**

```bash
.\Start-Backend.ps1
```

**Vous devriez voir dans la console:**
```
2026-05-27 14:30:45 - Started GestionCongesBackendApplication
Server running on port 8080
```

**✅ Le backend est prêt quand vous voyez: `Tomcat started on port(s): 8080`**

### Étape 4: Vérifier le backend

Ouvrir dans le navigateur:
```
http://localhost:8080/swagger-ui.html
```

Vous devriez voir la documentation Swagger de l'API.

---

## 💻 Installation du Frontend

### Étape 1: Accéder au répertoire frontend

```bash
cd C:\Users\Asus\Desktop\pfe-frontend-main
```

### Étape 2: Créer le fichier `.env`

**Créer un fichier `.env` dans le répertoire racine du frontend:**

```bash
# Windows (PowerShell)
New-Item -Path ".env" -ItemType File -Force

# Ou créer manuellement le fichier
```

**Contenu du fichier `.env`:**

```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Gestion des Congés
VITE_APP_VERSION=1.0.0
NODE_ENV=development
```

### Étape 3: Installer les dépendances

```bash
npm install
```

**Cela peut prendre 2-3 minutes.**

**Vous devriez voir:**
```
added XXX packages in X.XXs
```

### Étape 4: Vérifier les dépendances

```bash
npm list
```

**Vérifier que vous avez:**
- `react@19.2.0`
- `react-dom@19.2.0`
- `react-router-dom@7.13.1`
- `axios@1.13.6`
- `tailwindcss@3.4.19`

### Étape 5: Démarrer le serveur de développement

```bash
npm run dev
```

**Vous devriez voir:**
```
  VITE v8.0.0-beta.13  ready in XXXms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**✅ Le frontend est accessible à `http://localhost:5173`**

---

## 🗄️ Configuration de la Base de Données

### Vérifier que les tables sont créées

#### Avec Docker:

```bash
docker compose exec db mysql -u conges_app -pconges_app_password conges_db -e "SHOW TABLES;"
```

#### Avec MySQL local:

```bash
mysql -u conges_app -pconges_app_password conges_db -e "SHOW TABLES;"
```

**Vous devriez voir les tables:**
```
+----------------------------+
| Tables_in_conges_db        |
+----------------------------+
| users                      |
| leave_requests             |
| leave_types                |
| country_leave_policies     |
| public_holidays            |
| work_schedules             |
| exceptional_leaves         |
| employee_leave_balances    |
| ...                        |
+----------------------------+
```

### Insérer les données de base (Optionnel)

Les tables sont créées vides. Vous pouvez ajouter des données de test:

```sql
INSERT INTO users (email, nom, prenom, role, pays, created_at, updated_at) 
VALUES 
  ('hamdi@example.com', 'Hamdi', 'Faxi', 'RH', 'TN', NOW(), NOW()),
  ('ali@example.com', 'Ali', 'Mohamed', 'EMPLOYE', 'TN', NOW(), NOW());

INSERT INTO leave_types (code, libelle, description, active, requires_approval) 
VALUES 
  ('PAYE', 'Congé payé', 'Congé annuel payé', TRUE, TRUE),
  ('MALADIE', 'Congé maladie', 'Congé pour maladie', TRUE, TRUE),
  ('COURTE_DUREE', 'Sortie courte durée', 'Permission courte durée', TRUE, FALSE);

INSERT INTO country_leave_policies (country_code, type_conge, annual_quota, monthly_accrual_rate) 
VALUES 
  ('TN', 'PAYE', 25, 1.83),
  ('MA', 'PAYE', 25, 1.05),
  ('FR', 'PAYE', 25, 2.08),
  ('TN', 'MALADIE', 7, NULL),
  ('MA', 'MALADIE', 7, NULL),
  ('FR', 'MALADIE', 7, NULL);
```

---

## 🎬 Lancement de l'Application

### Tous les services doivent être en cours d'exécution:

```
✅ Backend Spring Boot:    http://localhost:8080
✅ Frontend React:         http://localhost:5173
✅ Base de données MySQL:  localhost:3306 (Docker) ou 3306 (local)
```

### Accéder à l'application

Ouvrir le navigateur et aller à:
```
http://localhost:5173
```

### Identifiants par défaut

L'application utilise JWT pour l'authentification.

**Vous pouvez créer un utilisateur test via Swagger:**

1. Aller à: `http://localhost:8080/swagger-ui.html`
2. Rechercher l'endpoint `POST /auth/register`
3. Remplir le formulaire:
```json
{
  "email": "test@example.com",
  "password": "Test@123",
  "nom": "Dupont",
  "prenom": "Jean",
  "role": "EMPLOYE",
  "pays": "TN"
}
```
4. Copier le token JWT retourné
5. Le coller dans le formulaire de login du frontend

---

## ✅ Vérification et Tests

### Vérifier le Backend

```bash
# Tester la connexion API
curl http://localhost:8080/swagger-ui.html

# Vérifier les logs
docker compose logs -f backend  # Si Docker
# Ou voir la console du terminal où mvn spring-boot:run est lancé
```

### Vérifier la Base de Données

```bash
# Afficher les tables
docker compose exec db mysql -u conges_app -pconges_app_password conges_db -e "SELECT COUNT(*) FROM users;"

# Ou avec MySQL local
mysql -u conges_app -pconges_app_password conges_db -e "SELECT COUNT(*) FROM users;"
```

### Vérifier le Frontend

1. Ouvrir `http://localhost:5173`
2. La page devrait se charger
3. Essayer de vous connecter
4. Vérifier la console du navigateur (F12) pour les erreurs

### Tests de l'API

```bash
# Tester l'authentification
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Tester la récupération des demandes
curl http://localhost:8080/rh/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🆘 Troubleshooting

### Le backend ne démarre pas

**Erreur: Port 8080 déjà en utilisation**
```bash
# Vérifier quel processus utilise le port
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Mac/Linux

# Arrêter le processus (Windows)
taskkill /PID <PID> /F

# Ou changer le port dans .env
SERVER_PORT=8081
```

**Erreur: Cannot connect to MySQL**
```bash
# Vérifier que MySQL est en cours d'exécution
docker compose ps  # Si Docker

# Vérifier la connexion locale
mysql -u conges_app -pconges_app_password -h localhost

# Vérifier les credentials dans .env
DB_HOST=localhost  (pas 127.0.0.1 avec Docker)
DB_USER=conges_app
DB_PASSWORD=conges_app_password
```

**Erreur: mvn: command not found**
```bash
# Ajouter Maven au PATH ou utiliser le chemin complet
C:\path\to\apache-maven\bin\mvn --version

# Ou réinstaller Maven
choco install maven
```

### Le frontend ne se connecte pas au backend

**Erreur: CORS (Cross-Origin) error**
```bash
# Le backend doit avoir CORS activé
# Vérifier: http://localhost:8080/swagger-ui.html

# Si erreur 404, vérifier que le backend est running
curl http://localhost:8080/swagger-ui.html
```

**Erreur: Cannot GET /api/**
```bash
# Vérifier le fichier .env du frontend
VITE_API_URL=http://localhost:8080

# Et relancer le frontend
npm run dev
```

### La base de données est corrompue

**Solution: Réinitialiser la base**

```bash
# Avec Docker
docker compose down -v          # Supprimer les volumes
docker compose up -d           # Relancer

# Avec MySQL local
DROP DATABASE conges_db;
CREATE DATABASE conges_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# Réimporter le schema
mysql -u conges_app -pconges_app_password conges_db < setup-db.sql
```

### Erreur Java: Unsupported class version

**Solution: Vérifier la version de Java**
```bash
java -version
# Doit être 17 ou supérieur
```

**Si besoin de changer de version:**
```bash
# Windows - définir JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.1"
mvn --version
```

### npm ERR! code ERESOLVE

**Solution: Nettoyer et réinstaller**
```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### Application lente ou qui ne répond pas

**Solution: Augmenter les ressources Docker**

1. Ouvrir Docker Desktop
2. Settings → Resources
3. Augmenter CPU et Memory
4. Relancer: `docker compose restart`

---

## 🛑 Arrêt de l'Application

### Arrêter le frontend

Dans le terminal où `npm run dev` tourne:
```bash
Ctrl + C
```

### Arrêter le backend

Si via Maven:
```bash
Ctrl + C
```

Si via Docker:
```bash
docker compose down
```

### Arrêter MySQL

**Si Docker:**
```bash
docker compose down
```

**Si MySQL local (Windows):**
```bash
net stop MySQL80  # Remplacer 80 par votre version
```

---

## 📚 Commandes Utiles

### Frontend

```bash
npm install          # Installer les dépendances
npm run dev         # Démarrer le serveur dev
npm run build       # Compiler pour la production
npm run lint        # Vérifier le code
npm run preview     # Prévisualiser la build prod
```

### Backend

```bash
mvn clean install   # Compiler le projet
mvn spring-boot:run # Démarrer le backend
mvn test           # Lancer les tests
mvn clean          # Nettoyer les fichiers compilés
```

### Docker

```bash
docker compose up -d        # Démarrer les services
docker compose down         # Arrêter les services
docker compose logs -f      # Afficher les logs
docker compose ps          # Afficher le statut
docker compose restart     # Redémarrer les services
```

### MySQL

```bash
# Connexion
mysql -u conges_app -pconges_app_password -h localhost conges_db

# Commandes SQL
SHOW TABLES;
SELECT * FROM users;
DESC users;
```

---

## ✨ Prochaines Étapes

Une fois l'application en cours d'exécution:

1. **Créer un utilisateur admin:**
   - Via Swagger: `POST /auth/register`
   - Définir le rôle à `RH` ou `ADMIN`

2. **Configurer les règles de congés:**
   - Accéder à `/rh/config`
   - Définir les quotas par pays (TN, FR, MA)

3. **Importer les jours fériés:**
   - Aller à la page RH
   - Importer les jours fériés pour l'année en cours

4. **Créer des employés de test:**
   - Utiliser l'API ou le formulaire de inscription

5. **Tester les fonctionnalités:**
   - Créer une demande de congé
   - Approuver/refuser une demande
   - Consulter l'historique

---

## 📞 Support et Ressources

**Documents importants dans le projet:**
- `README.md` - Documentation générale
- `COUNTRY_DATA_VERIFICATION.md` - Vérification des données par pays
- `ACCRUAL_RULES_UPDATE_2026.md` - Règles d'accumulation
- `VALIDATION_COMPLETE_2026.md` - Validation des fonctionnalités

**Endpoints principaux:**
- Authentification: `POST /auth/login`, `POST /auth/register`
- Demandes: `GET /rh/requests`, `POST /conge`
- Configuration: `GET /hr-config/country-rules`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## ✅ Checklist d'Installation

- [ ] Java JDK 17+ installé
- [ ] Node.js 18+ installé
- [ ] MySQL 8+ ou Docker installé
- [ ] Maven installé
- [ ] Backend compilé et en cours d'exécution
- [ ] Frontend démarré
- [ ] Base de données créée et remplie
- [ ] API accessible sur `http://localhost:8080/swagger-ui.html`
- [ ] Frontend accessible sur `http://localhost:5173`
- [ ] Utilisateur de test créé
- [ ] Première connexion réussie

---

**Dernière mise à jour: 2026-05-27**

Bonne installation! 🎉
