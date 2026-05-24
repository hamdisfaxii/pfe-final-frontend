# 📋 Vérification et Cohérence des Données Pays

## ✅ Synchronisation Frontend-Backend

### 1. **Normalization des Pays (SYNCHRONISÉE)**

Tous les pays sont normalisés selon les règles suivantes :

| Condition                                                           | Résultat                  |
| ------------------------------------------------------------------- | ------------------------- |
| Vide ou null                                                        | `"TN"` (Tunisie - défaut) |
| Code ISO2 valide : TN, FR, MA                                       | Gardé tel quel            |
| Outre-mer français (GP, MQ, GF, RE, YT, PM, BL, MF, WF, PF, NC, TF) | `"FR"`                    |
| Contient "TUNIS" (insensible casse)                                 | `"TN"`                    |
| Contient "FRANCE" ou "FRANC"                                        | `"FR"`                    |
| Contient "MAROC" ou "MOROCCO"                                       | `"MA"`                    |
| Sinon                                                               | `"TN"` (défaut)           |

**Fichiers :**

- Frontend: `src/utils/country.js` → `normalizeCountryIsoForHr()`
- Backend: `src/main/java/com/example/conges/service/CountryPolicyService.java` → `normalizeBusinessCountry()`

### 2. **Pays Supportés**

```javascript
// Frontend & Backend
SUPPORTED_HR_COUNTRIES = ["TN", "FR", "MA"];
```

**Métadonnées associées :**

- TN (Tunisie) 🇹🇳
- FR (France) 🇫🇷
- MA (Maroc) 🇲🇦

### 3. **Calcul des Jours Ouvrés**

```javascript
// Frontend: src/utils/calculJours.js
calculerJoursOuvres(dateDebut, dateFin, paysIso2Hr);
```

- Exclut les samedis et dimanches
- Exclut les jours fériés (si pays ∈ {TN, FR, MA})
- Utilise la librairie `date-holidays` pour les jours fériés officiels

**Pays supportés pour jours fériés :** TN, FR, MA

### 4. **Politiques de Congés par Pays**

| Pays   | Congé Payé                 | Maladie      | Courte Durée (RTT) |
| ------ | -------------------------- | ------------ | ------------------ |
| **TN** | 25 j/an                    | 7 j/an       | ❌ Non disponible  |
| **FR** | 25 j/an (1,83-2,08 j/mois) | Configurable | ✅ Oui (10 j/an)   |
| **MA** | 18 j/an (1,05 j/mois)      | 7 j/an       | ❌ Non disponible  |

**Source Backend :** `CountryPolicyService.java`

---

## 🔍 Checklist de Vérification des Données

### 1. **Création/Mise à jour d'utilisateurs**

- [ ] Le champ `pays` doit être l'un de : `TN`, `FR`, `MA`, ou une variante (ex: "Tunisie", "France", "TUNISIA")
- [ ] La valeur sera automatiquement normalisée
- [ ] Les variantes mal orthographiées (ex: "morocc") seront normalisées à `TN`

### 2. **Ménus et Onglets RH**

```javascript
// Frontend: src/utils/country.js
COUNTRY_META = {
  TN: { code: "TN", label: "Tunisie", flag: "🇹🇳" },
  FR: { code: "FR", label: "France", flag: "🇫🇷" },
  MA: { code: "MA", label: "Maroc", flag: "🇲🇦" },
}

HR_COUNTRY_LIST = COUNTRY_META.map(...)  // Affichage dans les onglets
```

### 3. **Couleurs Calendrier par Pays**

```javascript
COUNTRY_CALENDAR_EVENT_CLASSES = {
  TN: "bg-green-500", // Vert
  FR: "bg-blue-500", // Bleu
  MA: "bg-amber-500", // Ambre
};
```

### 4. **"Sortie Courte Durée" (RTT)**

- ✅ Disponible **uniquement en France** (`FR`)
- ❌ Pas en Tunisie (`TN`)
- ❌ Pas au Maroc (`MA`)

Gestion dans `isFranceSortieCourteEligible()` (frontend) et `isRttEnabledForCountry()` (backend)

---

## 🐛 Problèmes Corrigés

### Avant (Incohérences détectées)

| Problème                        | Frontend      | Backend             | Solution      |
| ------------------------------- | ------------- | ------------------- | ------------- |
| Codes inconnus (ex: "TE", "UK") | → TN (défaut) | → "TE" ou "UK"      | ❌ Incohérent |
| Variante "MOROCCO"              | → MA          | → "MO" (2 premiers) | ❌ Incohérent |
| Variante "FRANCIE"              | → TN          | → "FR"              | ❌ Incohérent |

### Après (Synchronisation)

✅ **Tous les deux côtés** font une normalisation identique selon les règles ci-dessus

---

## 📝 Exemples de Normalisation

### Cas de Succès ✅

```
"TN"           → "TN"
"FR"           → "FR"
"MA"           → "MA"
"Tunisie"      → "TN"
"TUNISIA"      → "TN"
"France"       → "FR"
"FRANCE"       → "FR"
"Maroc"        → "MA"
"MOROCCO"      → "MA"
"GP" (Guadeloupe) → "FR"
"RE" (Réunion)    → "FR"
"YT" (Mayotte)    → "FR"
```

### Cas par Défaut (→ TN) ⚠️

```
""             → "TN"
null           → "TN"
undefined      → "TN"
"UK"           → "TN"
"GB"           → "TN"
"belgique"     → "TN"
"FRANCE123"    → "FR"  ✅ (contient FRANCE)
"MAROC_OLD"    → "MA"  ✅ (contient MAROC)
```

---

## 🔧 Maintenance

Si des changements doivent être faits (ex: ajout d'un nouveau pays) :

1. **Backend :** Mettre à jour `CountryPolicyService.normalizeBusinessCountry()`
2. **Frontend :** Mettre à jour `country.js` → `normalizeCountryIsoForHr()`
3. **Données :** Ajouter les métadonnées dans `COUNTRY_META`
4. **Couleurs :** Ajouter dans `COUNTRY_CALENDAR_EVENT_CLASSES`
5. **Base de données :** Ajouter les politiques dans `country_leave_policies` (si applicable)

---

## 📞 Support

Pour toute question sur la normalisation des pays ou incohérence détectée, consultez :

- Frontend: `src/utils/country.js`
- Backend: `src/main/java/com/example/conges/service/CountryPolicyService.java`
