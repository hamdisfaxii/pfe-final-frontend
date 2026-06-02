# 📖 DOCUMENTATION COMPLÈTE - Gestion des Congés

**TOUT CE QU'IL FAUT SAVOIR DANS UN SEUL FICHIER**

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Guide d'Installation Complet](#guide-dinstallation-complet)
3. [Démarrage Rapide](#démarrage-rapide)
4. [Installation Technique](#installation-technique)
5. [Guide UI/UX](#guide-uiux)
6. [Architecture et Diagrammes](#architecture-et-diagrammes)
7. [Configuration par Pays](#configuration-par-pays)
8. [Dépannage](#dépannage)
9. [Support](#support)

---

# 🎯 INTRODUCTION

## Qu'est-ce que c'est?

**Gestion des Congés** est une application professionnelle pour gérer les demandes de congés avec:
- ✅ Analyses intelligentes avec IA
- ✅ Workflows d'approbation automatisés
- ✅ Interface moderne et intuitive
- ✅ Support multi-pays (Tunisie, France, Maroc)

## Qui l'utilise?

| Utilisateur | Utilisation |
|------------|------------|
| **Employés** | Créer des demandes de congés |
| **RH** | Approuver/rejeter les demandes |
| **Admin** | Gérer l'application |

## Utilisateurs de Test

| Rôle | Email | Mot de passe |
|------|-------|------------|
| Admin | `admin@conges.local` | `admin123` |
| RH | `rh@conges.local` | `rh123` |
| Employé TN | `employe@conges.local` | `employe123` |
| Employé FR | `employe.fr@conges.local` | `employe123` |
| Employé MA | `employe.ma@conges.local` | `employe123` |

---

# 🚀 GUIDE D'INSTALLATION COMPLET

**Durée: 30-45 minutes | Pour: N'importe qui**

## ✅ Prérequis

Avant de commencer, vous devez avoir:

| Élément | Version | Télécharger |
|--------|---------|------------|
| Java | 17+ | [oracle.com](https://www.oracle.com/java/technologies/downloads/) |
| Maven | 3.6+ | [maven.apache.org](https://maven.apache.org/download.cgi) |
| Node.js | 16+ | [nodejs.org](https://nodejs.org/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| MySQL | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/mysql/) |

---

## Étape 1: Installer Java

### Windows
1. Télécharger Java 17 depuis [Oracle](https://www.oracle.com/java/technologies/downloads/)
2. Exécuter le fichier `.exe`
3. Clic droit → "Exécuter en tant qu'administrateur"
4. Cliquer "Next" plusieurs fois → "Install"
5. Vérifier: PowerShell → `java -version`

### macOS
```bash
brew install openjdk@17
java -version
```

### Linux
```bash
sudo apt update
sudo apt install openjdk-17-jdk-headless
java -version
```

---

## Étape 2: Installer Maven

### Windows
1. Télécharger Maven depuis [maven.apache.org](https://maven.apache.org/download.cgi)
2. Extraire dans `C:\Program Files`
3. Ajouter au PATH:
   - Démarrer → "Environnement" → "Variables d'environnement"
   - Nouveau → `MAVEN_HOME` = `C:\Program Files\apache-maven-3.9.x`
4. Vérifier: PowerShell → `mvn --version`

### macOS/Linux
```bash
brew install maven  # macOS
sudo apt install maven  # Linux
mvn --version
```

---

## Étape 3: Installer Node.js

### Windows
1. Télécharger depuis [nodejs.org](https://nodejs.org/) (LTS)
2. Exécuter l'installateur
3. Clic droit → "Exécuter en tant qu'administrateur"
4. Cliquer "Next" plusieurs fois → "Install"
5. Vérifier: PowerShell → `node --version` et `npm --version`

### macOS/Linux
```bash
brew install node  # macOS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -  # Linux
sudo apt-get install -y nodejs
node --version
npm --version
```

---

## Étape 4: Installer MySQL

### Windows
1. Télécharger depuis [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Sélectionner "Windows (x86, 64-bit), MSI Installer"
3. Exécuter l'installateur
4. Configurer: "Development Machine" → "Strong Password Encryption"
5. **Important**: Noter votre mot de passe root (exemple: `admin123`)
6. Vérifier: PowerShell → `mysql -u root -padmin123` (remplacer par votre mot de passe)

### macOS/Linux
```bash
brew install mysql  # macOS
sudo apt update && sudo apt install mysql-server  # Linux
mysql_secure_installation
mysql -u root -p
```

---

## Étape 5: Configurer la Base de Données

### Ouvrir MySQL
```bash
mysql -u root -padmin123  # Remplacer admin123 par votre mot de passe
```

### Créer la base et l'utilisateur
```sql
CREATE DATABASE conges_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'conges_app'@'localhost' IDENTIFIED BY 'conges_app_password';
GRANT ALL PRIVILEGES ON conges_db.* TO 'conges_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Vérifier
```bash
mysql -u conges_app -pconges_app_password -e "USE conges_db; SHOW TABLES;"
```

---

## Étape 6: Cloner les Projets

### Créer un dossier de travail
```powershell
# Windows PowerShell
mkdir C:\Users\VotreNom\Desktop\gestion-conges
cd C:\Users\VotreNom\Desktop\gestion-conges
```

### Cloner le Backend
```bash
git clone https://github.com/hamdisfaxii/gestion-conges-backend-main.git
cd gestion-conges-backend-main
```

### Cloner le Frontend
```bash
cd ..
git clone https://github.com/hamdisfaxii/pfe-final-frontend.git
cd pfe-final-frontend
```

---

## Étape 7: Démarrer le Backend

### Terminal 1 - Backend
```bash
cd gestion-conges-backend-main
mvn clean install -DskipTests
```
**⏳ Attendre 5-10 minutes** (télécharge les dépendances)

```bash
mvn spring-boot:run
```

**Attendre de voir:**
```
Tomcat started on port(s): 8080 (http)
```

**⚠️ NE PAS fermer ce terminal!**

---

## Étape 8: Démarrer le Frontend

### Terminal 2 - Frontend
```bash
cd pfe-final-frontend
npm install
```

**⏳ Attendre 3-5 minutes**

```bash
npm run dev
```

**Attendre de voir:**
```
➜  Local:   http://localhost:5173/
```

**⚠️ NE PAS fermer ce terminal!**

---

## Étape 9: Se Connecter

### 1. Ouvrir le navigateur
- Aller à: `http://localhost:5173`
- Vous voyez la page de connexion (fond bleu avec formulaire)

### 2. Se connecter
- Email: `employe@conges.local`
- Mot de passe: `employe123`
- Cliquer "Se connecter"

### 3. Utiliser l'application
- ✅ Vous voyez le tableau de bord
- ✅ Créer une nouvelle demande
- ✅ Voir l'historique
- ✅ Consulter les soldes

---

# ⚡ DÉMARRAGE RAPIDE

**Pour utilisateurs expérimentés (5 minutes)**

```bash
# Cloner et installer
git clone https://github.com/hamdisfaxii/gestion-conges-backend-main.git
git clone https://github.com/hamdisfaxii/pfe-final-frontend.git

# Backend (Terminal 1)
cd gestion-conges-backend-main
mvn clean install -DskipTests
mvn spring-boot:run

# Frontend (Terminal 2)
cd pfe-final-frontend
npm install
npm run dev

# Ouvrir http://localhost:5173
# Email: employe@conges.local | Mot de passe: employe123
```

---

# 🔧 INSTALLATION TECHNIQUE

## Architecture

```
Frontend (React)         Backend (Spring Boot)      Database (MySQL)
     ↓                         ↓                          ↓
  5173                       8080                        3306
   
Requests             API REST + Swagger          conges_db
  Components          Controllers                  Tables
  Pages               Services                     Queries
  Hooks               Repositories                 Data
```

## Configuration

### Backend (.env.properties)
```properties
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=conges_db
DB_USER=conges_app
DB_PASSWORD=conges_app_password

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=604800000
```

### Frontend (vite.config.js)
```javascript
export default {
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
}
```

## Dépendances Principales

### Frontend
- React 18
- TailwindCSS
- Framer Motion
- Lucide React
- React Router v6
- Axios

### Backend
- Spring Boot 3
- MySQL Driver
- JPA/Hibernate
- JWT
- Swagger/OpenAPI

---

# 🎨 GUIDE UI/UX

## Design System

### Couleurs
```
Primaires:
- primary-600: #3B82F6 (Bleu principal)
- success-600: #10B981 (Vert succès)
- danger-600: #EF4444 (Rouge danger)
- warning-600: #F59E0B (Orange warning)

Neutres:
- neutral-900: #111827 (Texte)
- neutral-600: #4B5563 (Texte secondaire)
- neutral-50: #F9FAFB (Fond léger)
```

### Espacement (Scale)
```
3xs: 4px
2xs: 8px
xs: 12px
sm: 16px
md: 24px
lg: 32px
xl: 48px
2xl: 64px
```

### Typographie
```
Headings: font-bold | font-semibold
Body: text-sm | text-base
Small: text-xs
```

### Composants Réutilisables

#### Button
```jsx
<Button 
  variant="primary"        // primary | secondary | danger | success
  size="md"               // xs | sm | md | lg | xl
  icon={IconComponent}
  onClick={() => {}}
>
  Cliquer
</Button>
```

#### Card
```jsx
<Card variant="default">
  <CardContent>
    Contenu
  </CardContent>
</Card>
```

#### StatusBadge
```jsx
<StatusBadge status="APPROUVER" icon={true} />
```

### Animations
```javascript
// Container (staggerChildren)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

// Item (fade + slide)
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}
```

---

# 📊 ARCHITECTURE ET DIAGRAMMES

## Architecture Générale

```
┌─────────────────────────────────────────┐
│       Frontend (React + Vite)           │
│  ┌─────────────────────────────────┐    │
│  │  Pages & Components             │    │
│  │  - Employee Pages               │    │
│  │  - RH Pages                     │    │
│  │  - Admin Pages                  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  Hooks & Context                │    │
│  │  - useAuth                      │    │
│  │  - useDemandes                  │    │
│  │  - useRH                        │    │
│  └─────────────────────────────────┘    │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────┐
│     Backend (Spring Boot)               │
│  ┌─────────────────────────────────┐    │
│  │  REST Controllers               │    │
│  │  - AuthController               │    │
│  │  - DemandeController            │    │
│  │  - RHController                 │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  Services & Business Logic      │    │
│  │  - DemandeService               │    │
│  │  - RHService                    │    │
│  │  - AnalysisService (IA)         │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  Repositories (JPA)             │    │
│  │  - UserRepository               │    │
│  │  - DemandeRepository            │    │
│  │  - LeaveAllocationRepository    │    │
│  └─────────────────────────────────┘    │
└──────────────────┬──────────────────────┘
                   │ JDBC/JPA
                   ▼
┌─────────────────────────────────────────┐
│      MySQL Database                     │
│  ┌─────────────────────────────────┐    │
│  │  Tables:                        │    │
│  │  - users                        │    │
│  │  - demandes_conge               │    │
│  │  - leave_types                  │    │
│  │  - holidays                     │    │
│  │  - employee_leave_allocations   │    │
│  │  - workflow_definitions         │    │
│  │  - workflow_steps               │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Flux de Données - Créer une Demande

```
1. Employee clique "Nouvelle Demande"
        ↓
2. Frontend affiche le formulaire
        ↓
3. Employee remplit les champs
   - Dates de début/fin
   - Type de congé
   - Motif
        ↓
4. Frontend calcule automatiquement les jours
   (exclut weekends et jours fériés)
        ↓
5. Employee clique "Soumettre"
        ↓
6. Frontend envoie requête POST /demandes
        ↓
7. Backend valide les données
   - Vérifier les dates
   - Vérifier le solde disponible
   - Vérifier les règles par pays
        ↓
8. Backend crée la demande
   - Sauvegarde en base
   - Status = EN_ATTENTE
   - Notifie le RH
        ↓
9. Frontend affiche confirmation
   "Votre demande a été créée"
        ↓
10. RH reçoit notification
    "Nouvelle demande de Jean Dupont"
```

## Schéma Base de Données

### Table: users
```sql
id (PK)
email (UNIQUE)
password_hash
nom
prenom
role (EMPLOYE|RH|ADMIN)
pays (TN|FR|MA)
departement
contract_active
```

### Table: demandes_conge
```sql
id (PK)
user_id (FK → users)
type_conge (PAYE|MALADIE|SANS_SOLDE|COURTE_DUREE|EXCEPTIONNEL)
date_debut
date_fin
nombre_jours
statut (EN_ATTENTE|ACCEPTE|REFUSE|ANNULE)
motif
commentaire_rh
date_soumission
```

### Table: employee_leave_allocations
```sql
id (PK)
user_id (FK → users)
leave_type_id (FK → leave_types)
jours_initiaux
jours_utilises
jours_disponibles
annee
```

### Table: holidays
```sql
id (PK)
libelle
date_jour
duree
country_code (TN|FR|MA)
active
```

---

# 🌍 CONFIGURATION PAR PAYS

## Tunisie (TN)

### Congés Payés
- **Quota annuel**: 22 jours
- **Accrual**: 1.83 jours/mois
- **Conditions**: 
  - Min 2 ans d'ancienneté pour RTT
  - Max 5 jours consécutifs sans approbation

### Jours Fériés Officiels
```
1er janvier    - Jour de l'an
14 janvier     - Révolution
20 mars        - Indépendance
30 juin        - Fête de la jeunesse
25 juillet     - Fête de la République
13 août        - Jour du combattant
Dates mobiles  - Aïd El Fitr (2 jours)
Dates mobiles  - Aïd El Adha (2 jours)
```

### Autres Congés
- Congé Maladie: 7 jours/an
- Congé Sans Solde: Non rémunéré
- Congé Exceptionnel: Selon justification

---

## France (FR)

### Congés Payés
- **Quota annuel**: 25 jours
- **Accrual**: 2.08 jours/mois
- **RTT**: Oui, 9 jours/an

### Jours Fériés Officiels
```
1er janvier    - Jour de l'an
Lundi de Pâques
1er mai        - Fête du Travail
8 mai          - Victoire 1945
Jeudi Ascension
Lundi de Pentecôte
14 juillet     - Fête Nationale
15 août        - Assomption
1er novembre   - Toussaint
11 novembre    - Armistice
25 décembre    - Noël
```

### Autres Congés
- Congé Maladie: Selon accord
- Congé Parental: Jusqu'à 3 ans
- Congé Sabbatique: Selon accord

---

## Maroc (MA)

### Congés Payés
- **Quota annuel**: 18 jours
- **Accrual**: 1.5 jours/mois
- **Conditions**: 1 an d'ancienneté minimum

### Jours Fériés Officiels
```
1er janvier    - Jour de l'an
11 janvier     - Indépendance
1er mai        - Fête du Travail
30 juillet     - Fête du Trône
21 août        - Révolution
6 novembre     - Marche Verte
18 novembre    - Indépendance
25 décembre    - Noël
Dates mobiles  - Aïd El Fitr
Dates mobiles  - Aïd El Adha
```

### Autres Congés
- Congé Maladie: 3 jours payés
- Congé Sans Solde: Selon accord
- Congé Exceptionnel: Événements familiaux

---

## Validation et Règles

### Pour Approuver une Demande

✅ **Conditions à vérifier:**
1. ✓ Solde disponible suffisant
2. ✓ Dates valides (pas de chevauchement)
3. ✓ Au moins 1 jour ouvré (sauf urgence)
4. ✓ Respecte les règles du pays
5. ✓ Pas de conflit avec autres demandes

### Calcul des Jours Ouvrés

```javascript
// Exclut:
- Samedi et dimanche
- Jours fériés du pays
- Autres congés approuvés

// Exemple: 22-26 juin (semaine)
- Lundi 22: +1 jour
- Mardi 23: +1 jour
- Mercredi 24: +1 jour
- Jeudi 25: +1 jour
- Vendredi 26: +1 jour
= 5 jours au total
```

---

# 🔧 DÉPANNAGE

## Problèmes Courants

### "Port 8080 déjà utilisé"

**Solution:**

Windows:
```powershell
netstat -ano | findstr :8080
taskkill /PID XXXX /F
```

Linux/macOS:
```bash
lsof -i :8080
kill -9 PID
```

---

### "Port 5173 déjà utilisé"

```bash
npm run dev -- --port 5174
```

---

### "Impossible de se connecter au backend"

**Vérifier:**
1. Backend fonctionne? `curl http://localhost:8080/swagger-ui.html`
2. Logs du backend pour erreurs
3. MySQL fonctionne? `mysql -u root -p`
4. Firewall bloque? Vérifier pare-feu

---

### "npm install échoue"

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

### "Java/Maven non trouvé"

```powershell
java -version
mvn --version

# Si erreur:
# Réinstaller Java: https://www.oracle.com/java/
# Réinstaller Maven: https://maven.apache.org/
# Ajouter au PATH
```

---

### "Base de données non accessible"

```bash
# Vérifier MySQL
mysql -u root -padmin123

# Vérifier la base conges_db
mysql -u conges_app -pconges_app_password conges_db
SHOW TABLES;
```

---

### "Frontend ne charge pas"

1. Ouvrir `http://localhost:5173`
2. Si page blanche:
   - Appuyer Ctrl+F5 (forcer actualisation)
   - Ouvrir F12 (console développeur)
   - Vérifier les erreurs en rouge
3. Si "Cannot GET /":
   - Backend ne fonctionne pas
   - Redémarrer Terminal 1 (backend)

---

### "Impossible de se connecter (401)"

**Vérifier:**
- Email correct: `employe@conges.local`
- Mot de passe correct: `employe123`
- Base de données initialisée
- Backend fonctionne

**Si toujours erreur:**
```sql
-- Vérifier l'utilisateur en base
USE conges_db;
SELECT * FROM users WHERE email = 'employe@conges.local';
```

---

### "Erreur CORS"

**Backend (ajouter si nécessaire):**
```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class MyController {
  // ...
}
```

---

### "Table 'demandes_conge' doesn't exist"

**Solution:**
1. Exécuter le script setup-db.sql
```bash
mysql -u root -padmin123 < setup-db.sql
```
2. Ou dans MySQL:
```sql
USE conges_db;
source setup-db.sql;
```

---

## Checklist de Vérification

Avant de dire "ça fonctionne":

- [ ] Java installé (version 17+)
- [ ] Maven installé
- [ ] Node.js installé
- [ ] MySQL installé et en cours d'exécution
- [ ] Base de données créée (conges_db)
- [ ] Utilisateur conges_app créé
- [ ] Backend démarre sans erreur (port 8080)
- [ ] Frontend démarre sans erreur (port 5173)
- [ ] Page de connexion s'affiche
- [ ] Connexion avec employe@conges.local fonctionne
- [ ] Tableau de bord s'affiche
- [ ] Création de demande fonctionne

**Si tout est ✅, bravo!** 🎉

---

# 📞 SUPPORT

## Avant de Contacter

1. **Lire cette documentation** (vous êtes ici!)
2. **Vérifier la section Dépannage** ci-dessus
3. **Vérifier les logs** des 2 terminaux
4. **Essayer les solutions** proposées

## Signaler un Bug

Ouvrir une issue GitHub avec:
- OS et version navigateur
- Steps pour reproduire
- Messages d'erreur (console F12)
- Screenshots si possible

## Resources

- **GitHub Frontend:** https://github.com/hamdisfaxii/pfe-final-frontend
- **GitHub Backend:** https://github.com/hamdisfaxii/gestion-conges-backend-main
- **Swagger API:** http://localhost:8080/swagger-ui.html

---

## Prochaines Étapes

1. **Installation**: Suivre les étapes 1-9
2. **Exploration**: Tester avec les utilisateurs de test
3. **Utilisation**: Créer vos propres données
4. **Personnalisation**: Adapter selon vos besoins

---

# 🎉 FIN DE LA DOCUMENTATION

**Vous avez maintenant TOUT ce qu'il faut savoir!**

Bonne chance! 🚀

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2 juin 2026  
**Status**: Production Ready ✅
