# 🎯 Gestion des Congés - Application Professionnelle

Une application complète pour gérer les demandes de congés avec des analyses intelligentes, des workflows d'approbation et une interface intuitive.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

---

## 🚀 Démarrer en 5 Minutes

```bash
# Cloner le projet
git clone https://github.com/hamdisfaxii/pfe-final-frontend.git
cd pfe-final-frontend

# Installer et démarrer
npm install
npm run dev

# Ouvrir http://localhost:5173
```

**Besoin d'aide?** → Lire le [📖 Guide Complet d'Installation](./docs/INDEX.md)

---

## 📚 Documentation

### 👉 TOUT DANS UN SEUL FICHIER

**[📖 DOCUMENTATION_COMPLETE.md](./DOCUMENTATION_COMPLETE.md)** ⭐

TOUTE la documentation (installation, guides, dépannage, architecture) dans un seul fichier.
Lisez ce fichier du début à la fin - c'est tout ce qu'il faut!

---

### Guides Rapides

| Guide | Niveau | Durée | Pour Qui |
|-------|--------|-------|----------|
| **[🔧 SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Débutant | 30-45 min | ⭐ Tout le monde |
| **[⚡ QUICK_START.md](./QUICK_START.md)** | Intermédiaire | 5 min | Expérimentés |
| **[📖 INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** | Avancé | 15 min | Développeurs |
| **[🎨 REFONTE_UI_UX_GUIDE.md](./REFONTE_UI_UX_GUIDE.md)** | Intermédiaire | 20 min | Designers |
| **[📊 DIAGRAMMES_UML_COMPLETS.md](./DIAGRAMMES_UML_COMPLETS.md)** | Avancé | 25 min | Architectes |
| **[✅ COUNTRY_DATA_VERIFICATION.md](./COUNTRY_DATA_VERIFICATION.md)** | Intermédiaire | 20 min | Admin |

---

## ✨ Fonctionnalités

### Pour les Employés
- ✅ Créer des demandes de congés avec calcul automatique
- ✅ Voir l'historique de toutes ses demandes
- ✅ Consulter les soldes de congés disponibles
- ✅ Notifications sur l'état des demandes
- ✅ Calendrier pour visualiser les absences

### Pour les RH
- ✅ Analyser les demandes avec analyse IA intelligente
- ✅ Approuver ou rejeter les demandes
- ✅ Voir les statistiques par employé/département
- ✅ Recommandations intelligentes (Approuver/Négocier/Reporter)
- ✅ Gestion des soldes et politiques de congés
- ✅ Configurer les paramètres par pays

### Pour l'Admin
- ✅ Gérer les utilisateurs
- ✅ Configurer les workflows d'approbation
- ✅ Voir les rapports complets
- ✅ Gérer les jours fériés par pays

---

## 🔑 Utilisateurs de Test

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Admin** | `admin@conges.local` | `admin123` | Tout |
| **RH** | `rh@conges.local` | `rh123` | Gestion |
| **Employé (TN)** | `employe@conges.local` | `employe123` | Demandes |
| **Employé (FR)** | `employe.fr@conges.local` | `employe123` | Demandes |
| **Employé (MA)** | `employe.ma@conges.local` | `employe123` | Demandes |

---

## 🛠️ Stack Technologique

### Frontend
- React 18 | TailwindCSS | Framer Motion | Lucide React | Vite

### Backend
- Spring Boot 3 | MySQL 8 | JWT | Swagger

### DevOps
- Docker | Maven | npm | Git

---

## 📁 Structure du Projet

```
pfe-final-frontend/
├── docs/
│   ├── INDEX.md              ⭐ POINT D'ENTRÉE PRINCIPAL
│   └── README.md             ← Documentation overview
├── src/
│   ├── pages/                ← Pages (employee, rh, login)
│   ├── components/           ← Composants réutilisables
│   ├── hooks/                ← Hooks React
│   ├── utils/                ← Utilitaires
│   └── context/              ← Context API
├── SETUP_GUIDE.md           ← Guide d'installation complet
├── QUICK_START.md           ← Démarrage rapide
├── INSTALLATION_GUIDE.md    ← Configuration technique
├── REFONTE_UI_UX_GUIDE.md   ← Design system
└── README.md                ← Ce fichier
```

---

## 🚀 Déploiement

### Build Optimisé
```bash
npm run build
# Résultat dans dist/
```

### Environments
- **Local:** http://localhost:5173 ✅
- **Dev:** À configurer
- **Prod:** À configurer

---

## 🐛 Dépannage Courant

### Port 5173 déjà utilisé
```bash
npm run dev -- --port 5174
```

### Impossible de se connecter au backend
1. Vérifier que le backend fonctionne (http://localhost:8080)
2. Vérifier les logs du backend
3. Vérifier la connexion à la base de données

### npm install échoue
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Pour tous les problèmes** → [Guide Complet Dépannage](./SETUP_GUIDE.md#dépannage)

---

## 📞 Support

### Avant de Contacter

1. **Lire le [Guide Complet](./SETUP_GUIDE.md)**
2. **Vérifier le [Dépannage](./SETUP_GUIDE.md#dépannage)**
3. **Consulter la [Documentation](./docs/INDEX.md)**

### Signaler un Bug

- Ouvrir une issue GitHub
- Inclure: OS, navigateur, steps, erreurs, screenshots

---

## 📝 License

MIT © 2024 - Gestion des Congés

---

## 🎉 Commencer

### Pour n'importe qui
**👉 [Guide Complet d'Installation](./SETUP_GUIDE.md)** - 30-45 minutes

### Pour les expérimentés
**👉 [Démarrage Rapide](./QUICK_START.md)** - 5 minutes

### Pour tout explorer
**👉 [INDEX de Tous les Guides](./docs/INDEX.md)** - Navigation complète

---

**Bonne chance! 🚀**
