# ⚡ Démarrage Rapide (5 minutes)

Pour les utilisateurs qui veulent juste lancer l'application rapidement.

---

## 🚀 Démarrage Automatique (Recommandé)

### Windows (PowerShell)

1. Ouvrir PowerShell en tant qu'administrateur
2. Naviguer vers le bureau:
```powershell
cd C:\Users\Asus\Desktop
```

3. Lancer le script:
```powershell
.\Start-Application.ps1
```

**Résultat:** Tout se lance automatiquement dans 3 fenêtres différentes.

### macOS / Linux

1. Ouvrir Terminal
2. Naviguer vers le bureau:
```bash
cd ~/Desktop
```

3. Donner les permissions:
```bash
chmod +x start-application.sh
```

4. Lancer le script:
```bash
./start-application.sh
```

---

## 🎯 Démarrage Manuel (Si le script échoue)

### 1. Démarrer la Base de Données

**Avec Docker (Recommandé):**
```bash
cd C:\Users\Asus\Desktop\gestion-conges-backend-main
docker compose up -d
```

**Ou avec MySQL local:**
```bash
mysql -u root -p
```
```sql
CREATE DATABASE IF NOT EXISTS conges_db;
CREATE USER 'conges_app'@'localhost' IDENTIFIED BY 'conges_app_password';
GRANT ALL PRIVILEGES ON conges_db.* TO 'conges_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Démarrer le Backend

**Terminal 1 - Backend:**
```bash
cd C:\Users\Asus\Desktop\gestion-conges-backend-main
mvn clean install -DskipTests
mvn spring-boot:run
```

**Attendre de voir:**
```
Tomcat started on port(s): 8080
```

### 3. Démarrer le Frontend

**Terminal 2 - Frontend:**
```bash
cd C:\Users\Asus\Desktop\pfe-frontend-main
npm install
npm run dev
```

**Attendre de voir:**
```
➜  Local:   http://localhost:5173/
```

### 4. Ouvrir l'Application

Ouvrir le navigateur et aller à:
```
http://localhost:5173
```

---

## ✅ Vérification Rapide

Tous ces liens doivent fonctionner:

- [ ] **Frontend:** http://localhost:5173 → Page de connexion
- [ ] **Backend:** http://localhost:8080/swagger-ui.html → Documentation API
- [ ] **API Test:** `curl http://localhost:8080/swagger-ui.html`

---

## 🔑 Identifiants de Test

Créer un utilisateur de test via Swagger:

1. Aller à: http://localhost:8080/swagger-ui.html
2. Chercher: `POST /auth/register`
3. Cliquer "Try it out"
4. Remplir:
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
5. Exécuter
6. Copier le token retourné
7. Utiliser dans le frontend pour se connecter

---

## 🆘 Erreurs Courantes

### Port déjà utilisé

```bash
# Windows - voir quel processus utilise le port
netstat -ano | findstr :8080

# Tuer le processus
taskkill /PID <number> /F
```

### Java/Maven non trouvé

```bash
# Vérifier
java -version
mvn --version

# Si erreur, installer:
choco install openjdk17
choco install maven
```

### npm install échoue

```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### Base de données non accessible

```bash
# Vérifier Docker
docker compose ps

# Ou MySQL local
mysql -u conges_app -pconges_app_password -h localhost -e "USE conges_db; SHOW TABLES;"
```

---

## 📚 Documentation Complète

Pour une installation plus détaillée, lire:
- [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
- [../gestion-conges-backend-main/README.md](../gestion-conges-backend-main/README.md)

---

## 🎉 Prêt?

1. Lancer le script de démarrage
2. Attendre ~1 minute
3. Ouvrir http://localhost:5173
4. Créer un compte
5. Utiliser l'application!

Bonne chance! 🚀
