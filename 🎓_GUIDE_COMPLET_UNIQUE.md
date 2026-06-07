# 🎓 GUIDE COMPLET DU PROJET - TOUT DANS UN SEUL FICHIER

**Tout ce que vous devez savoir sur le projet: Architecture, Code, Database, Flux, SQL - COMPLET!**

---

## 📖 TABLE DES MATIÈRES

- [RÉSUMÉ RAPIDE](#résumé-rapide)
- [ARCHITECTURE GLOBALE](#architecture-globale)
- [STACK TECHNOLOGIQUE](#stack-technologique)
- [CODE FRONTEND](#code-frontend)
- [CODE BACKEND](#code-backend)
- [DATABASE - TABLES & QUERIES](#database--tables--queries)
- [FLUX COMPLETS AVEC SQL](#flux-complets-avec-sql)
- [SÉCURITÉ](#sécurité)
- [DÉPLOIEMENT](#déploiement)
- [QUESTIONS/RÉPONSES](#questionsréponses)
- [INDEX EMPLACEMENTS CODE](#index-emplacements-code)

---

## RÉSUMÉ RAPIDE

### Le Système en 60 Secondes

```
FRONTEND (React)
    ↓ POST /api/demandes {dateDebut, dateFin, motif}
    ↓ JWT Token: Authorization: Bearer {token}
    ↓ CSRF Token: X-CSRF-TOKEN: {token}

BACKEND (Spring Boot)
    ↓ JwtAuthFilter valide token
    ↓ Extrait user depuis JWT (impossible de modifier)
    ↓ DemandeController reçoit request
    ↓ Services: Validations (inactivité, chevauchement, solde)
    ↓ Repository: INSERT INTO demandes_conge

DATABASE (MySQL)
    ↓ demandes_conge table
    ↓ statut = 'EN_ATTENTE'
    ↓ id = auto-généré (123)

FRONTEND ← JSON response {id: 123, statut: EN_ATTENTE}
```

### 6 Tables Essentielles

```
users                            (Utilisateurs)
  - id, email, role, pays, contract_active

demandes_conge                   (Demandes)
  - id, user_id, type_conge, date_debut, date_fin, statut

employee_leave_allocations       (Allocations de soldes)
  - employee_id, leave_type_id, annee, jours_disponibles

leave_types                      (Types de congés)
  - id (PAYE, RTT, MALADIE), libelle, max_days_per_year

holidays                         (Jours fériés)
  - country_code, date_jour, libelle

audit_logs                       (Historique)
  - action, user_id, demande_id, timestamp
```

### 3 Points Clés

1. **JWT = Identité** (Token contient user_id, pas modifiable)
2. **Country = Sécurité RH** (RH voit que son pays via WHERE users.pays = ?)
3. **Soldes = Temps Réel** (Pas stockés, calculés: initial - used - pending)

---

## ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                │
│  Pages: Login, CreateRequest, RHRequests, MyBalance     │
│  Interceptors: JWT Token, CSRF Token, Error Handling    │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP(S)
                      ↓ Authorization: Bearer {token}
                      ↓ X-CSRF-TOKEN: {token}
┌─────────────────────────────────────────────────────────┐
│               BACKEND (Spring Boot + Java)              │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Security: JwtAuthFilter, CORS, CSRF              │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Controllers: Auth, Demande, HR, Balance, Stats    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Services: LeaveBalance, RTT, Stats, Validation    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Repositories: JPA Queries avec JOIN FETCH         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ SQL
                      ↓
┌─────────────────────────────────────────────────────────┐
│              DATABASE (MySQL + Dolibarr)                │
│  Tables: users, demandes_conge, allocations, etc.       │
│  Sync: Dolibarr API (POST /leave/{id})                  │
└─────────────────────────────────────────────────────────┘
```

---

## STACK TECHNOLOGIQUE

### Frontend
```
React 18.2 (SPA)
├─ Vite (build)
├─ axios (HTTP + interceptors)
├─ react-router-dom (navigation)
└─ framer-motion (animations)

localStorage:
  - token: JWT
  - csrfToken: CSRF
  - user: Profil utilisateur
```

### Backend
```
Spring Boot 2.7.15
├─ Java 17
├─ Spring Security (JWT + CSRF + CORS)
├─ Spring Data JPA (Hibernate)
├─ MySQL Driver
└─ Lombok (reduce boilerplate)

Key Annotations:
  @RestController, @Service, @Repository
  @Entity, @Transactional
  @PreAuthorize, @AuthenticationPrincipal
```

### Database
```
MySQL 8.0
├─ InnoDB (transactions + FK)
├─ UTF-8 (i18n)
└─ Indexes on frequently searched columns
```

---

## CODE FRONTEND

### 1. api.js - Interceptors (src/utils/api.js)

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ✅ JWT Token Interceptor
api.interceptors.request.use((config) => {
  const path = String(config.url ?? "");
  const isLoginPost = path.includes("auth/login") && 
                      String(config.method ?? "get").toLowerCase() === "post";
  
  if (!isLoginPost) {
    // Ajouter JWT
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter CSRF
    const csrfToken = localStorage.getItem("csrfToken");
    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  
  return config;
});

// ✅ Response Interceptor - Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = String(error.config?.url ?? "");
      if (!url.includes("auth/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

### 2. Login Component (src/pages/auth/Login.jsx)

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // POST /api/auth/login {email, password}
      const response = await api.post("/auth/login", { email, password });
      
      // ✅ Stocker les tokens
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("csrfToken", response.data.csrfToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // ✅ Rediriger
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email"
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        type="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button type="submit">Login</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### 3. Create Request Component (src/pages/employe/CreateRequest.jsx)

```javascript
import { useState } from "react";
import api from "../../utils/api";

export default function CreateRequest() {
  const [form, setForm] = useState({
    typeConge: "PAYE",
    dateDebut: "",
    dateFin: "",
    nombreJours: 0,
    motif: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST /api/demandes (JWT + CSRF automatiquement ajoutés par interceptor)
      const response = await api.post("/demandes", form);
      
      setSuccess("Demande créée avec ID: " + response.data.id);
      setForm({ typeConge: "PAYE", dateDebut: "", dateFin: "", nombreJours: 0, motif: "" });
      
      // Refresh list
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={form.typeConge}
        onChange={(e) => setForm({...form, typeConge: e.target.value})}
      >
        <option value="PAYE">Congé Payé</option>
        <option value="RTT">RTT</option>
        <option value="MALADIE">Maladie</option>
      </select>
      
      <input 
        type="date"
        value={form.dateDebut}
        onChange={(e) => setForm({...form, dateDebut: e.target.value})}
      />
      
      <input 
        type="date"
        value={form.dateFin}
        onChange={(e) => setForm({...form, dateFin: e.target.value})}
      />
      
      <input 
        type="number"
        value={form.nombreJours}
        onChange={(e) => setForm({...form, nombreJours: parseFloat(e.target.value)})}
      />
      
      <textarea
        value={form.motif}
        onChange={(e) => setForm({...form, motif: e.target.value})}
        placeholder="Raison"
      />
      
      <button type="submit">Créer Demande</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  );
}
```

---

## CODE BACKEND

### 1. Entity: DemandeConge (src/main/java/.../entity/DemandeConge.java)

```java
@Entity
@Table(name = "demandes_conge")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeConge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
    
    private String typeConge;  // PAYE, RTT, MALADIE
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private double nombreJours;
    private String motif;
    
    @Enumerated(EnumType.STRING)
    private StatutConge statut = StatutConge.EN_ATTENTE;
    
    @ManyToOne
    private UserEntity approuvePar;
    private String commentaireRh;
    
    private LocalDateTime dateSoumission = LocalDateTime.now();
    private LocalDateTime updatedAt;
}

// Enums
public enum StatutConge {
    EN_ATTENTE,  // Créée, en attente approbation
    ACCEPTE,     // RH a approuvé
    REFUSE,      // RH a refusé
    ANNULE       // Annulée
}

public enum TypeConge {
    PAYE("Congé payé"),
    MALADIE("Congé maladie"),
    SANS_SOLDE("Congé sans solde"),
    COURTE_DUREE("Congé de courte durée"),
    EXCEPTIONNEL("Congé exceptionnel"),
    RTT("Réduction Temps Travail")
}
```

### 2. Repository: DemandeCongeRepository

```java
@Repository
public interface DemandeCongeRepository extends JpaRepository<DemandeConge, Long> {
    
    // Récupérer par user
    @Query("SELECT d FROM DemandeConge d JOIN FETCH d.user WHERE d.user.id = :userId ORDER BY d.dateSoumission DESC")
    List<DemandeConge> findByUserId(@Param("userId") Long userId);
    
    // Nouveau: Récupérer par user + type
    @Query("SELECT d FROM DemandeConge d WHERE d.user.id = :userId AND d.typeConge = :typeConge")
    List<DemandeConge> findByUserIdAndTypeConge(
        @Param("userId") Long userId,
        @Param("typeConge") String typeConge
    );
    
    // Vérifier chevauchement
    @Query("""
        SELECT COUNT(d)
        FROM DemandeConge d
        WHERE d.user.id = :userId
          AND d.statut IN :statuts
          AND d.dateDebut <= :endDate
          AND d.dateFin >= :startDate
    """)
    long countOverlappingDemandes(
        @Param("userId") Long userId,
        @Param("statuts") Collection<StatutConge> statuts,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Pour RH: récupérer avec country filter
    @Query("""
        SELECT DISTINCT d
        FROM DemandeConge d
        JOIN FETCH d.user u
        WHERE (:statut IS NULL OR d.statut = :statut)
          AND (:country IS NULL OR UPPER(u.pays) = UPPER(:country))
        ORDER BY d.dateSoumission DESC
    """)
    List<DemandeConge> findHistoryForHrPanel(
        @Param("statut") StatutConge statut,
        @Param("country") String country
    );
}
```

### 3. Service: LeaveBalanceService (NOUVEAU)

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveBalanceService {
    
    private final EmployeeLeaveAllocationRepository allocationRepository;
    private final DemandeCongeRepository demandeRepository;
    
    // ✅ Source de vérité UNIQUE pour les soldes
    public LeaveBalanceDto getBalance(Long userId, String leaveType) {
        log.info("Calcul soldes utilisateur {} type {}", userId, leaveType);
        
        // 1. Récupérer allocation initiale
        EmployeeLeaveAllocation allocation = allocationRepository
            .findByUserIdAndLeaveTypeId(userId, leaveType)
            .orElseThrow(() -> new IllegalArgumentException("Allocation non trouvée"));
        
        // 2. Récupérer toutes demandes
        List<DemandeConge> allDemands = demandeRepository
            .findByUserIdAndTypeConge(userId, leaveType);
        
        // 3. Calculer jours utilisés (ACCEPTE seulement)
        double daysUsed = allDemands.stream()
            .filter(d -> d.getStatut() == StatutConge.ACCEPTE)
            .mapToDouble(d -> d.getNombreJoursExact() != null 
                ? d.getNombreJoursExact() 
                : d.getNombreJours())
            .sum();
        
        // 4. Calculer jours en attente (EN_ATTENTE seulement)
        double daysPending = allDemands.stream()
            .filter(d -> d.getStatut() == StatutConge.EN_ATTENTE)
            .mapToDouble(d -> d.getNombreJoursExact() != null 
                ? d.getNombreJoursExact() 
                : d.getNombreJours())
            .sum();
        
        // 5. Calculer disponible
        double available = allocation.getJoursDisponibles() - daysUsed;
        double effectiveAvailable = available - daysPending;
        
        return LeaveBalanceDto.builder()
            .userId(userId)
            .leaveType(leaveType)
            .initialDays(allocation.getJoursDisponibles())
            .daysUsed(daysUsed)
            .daysPending(daysPending)
            .availableDays(available)
            .effectiveAvailable(effectiveAvailable)
            .calculatedAt(LocalDateTime.now())
            .build();
    }
}
```

### 4. Controller: LeaveBalanceController (NOUVEAU)

```java
@RestController
@RequestMapping("/api/leave-balance")
@RequiredArgsConstructor
public class LeaveBalanceController {
    
    private final LeaveBalanceService leaveBalanceService;
    private final UserRepository userRepository;
    
    @GetMapping("/{userId}/{leaveType}")
    public ResponseEntity<LeaveBalanceDto> getBalance(
        @PathVariable Long userId,
        @PathVariable String leaveType,
        Authentication authentication) {  // ← Vient du JwtAuthFilter!
        
        UserEntity currentUser = userRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        
        // ✅ Sécurité: vérifier accès
        if (!currentUser.getId().equals(userId) && !currentUser.getRole().equals(Role.RH)) {
            throw new AccessDeniedException("Accès refusé");
        }
        
        LeaveBalanceDto balance = leaveBalanceService.getBalance(userId, leaveType);
        return ResponseEntity.ok(balance);
    }
}
```

### 5. Security Config

```java
@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ✅ CSRF: disabled pour /auth/login seulement
            .csrf(csrf -> csrf.ignoringRequestMatchers(
                new AntPathRequestMatcher("/api/auth/login")
            ))
            
            // ✅ CORS: headers restreints
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // ✅ Stateless (JWT, pas de session)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // ✅ Autorisation
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/logout").permitAll()
                .anyRequest().authenticated()
            )
            
            // ✅ JWT Filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-CSRF-TOKEN"  // ← CSRF header
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## DATABASE - TABLES & QUERIES

### CREATE TABLE Statements

```sql
-- 1. Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role ENUM('EMPLOYE', 'RH', 'MANAGER', 'ADMIN') NOT NULL,
    pays VARCHAR(50),                    -- ← IMPORTANT pour country access control
    departement VARCHAR(100),
    contract_active BOOLEAN DEFAULT true,  -- ← Vérifier inactivité
    password_hash VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_pays (pays)
);

-- 2. DemandesConge Table
CREATE TABLE demandes_conge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type_conge VARCHAR(50),              -- PAYE, RTT, MALADIE
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    nombre_jours DECIMAL(5,2),
    motif TEXT,
    statut ENUM('EN_ATTENTE', 'ACCEPTE', 'REFUSE', 'ANNULE') DEFAULT 'EN_ATTENTE',
    approuve_par_id BIGINT,
    commentaire_rh TEXT,
    date_soumission TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approuve_par_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_statut (statut),
    INDEX idx_date_debut (date_debut)
);

-- 3. LeaveTypes Table
CREATE TABLE leave_types (
    id VARCHAR(50) PRIMARY KEY,
    libelle VARCHAR(255),
    code VARCHAR(100),
    max_days_per_year INT
);

-- 4. EmployeeLeaveAllocations Table
CREATE TABLE employee_leave_allocations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    leave_type_id VARCHAR(50),
    annee INT,
    jours_disponibles DECIMAL(5,2),
    active BOOLEAN DEFAULT true,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
    UNIQUE KEY uk_employee_leave_year (employee_id, leave_type_id, annee)
);

-- 5. Holidays Table
CREATE TABLE holidays (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    country_code VARCHAR(2),
    date_jour DATE NOT NULL,
    libelle VARCHAR(255),
    UNIQUE KEY uk_country_date (country_code, date_jour)
);

-- 6. AuditLogs Table
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    action VARCHAR(255),
    user_id BIGINT,
    demande_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (demande_id) REFERENCES demandes_conge(id)
);
```

### INSERT Examples

```sql
-- Insérer un utilisateur
INSERT INTO users (email, nom, prenom, role, pays, departement, contract_active, password_hash, created_at, updated_at)
VALUES (
    'john@example.com',
    'Dupont',
    'John',
    'EMPLOYE',
    'FR',
    'IT',
    true,
    '$2a$10$abcdefghijklmnop...',  -- BCrypt hash
    NOW(),
    NOW()
);

-- Insérer une demande
INSERT INTO demandes_conge (user_id, type_conge, date_debut, date_fin, nombre_jours, motif, statut, date_soumission, updated_at)
VALUES (
    1,                    -- user_id
    'PAYE',              -- type_conge
    '2026-06-15',        -- date_debut
    '2026-06-19',        -- date_fin
    5,                   -- nombre_jours
    'Vacances',          -- motif
    'EN_ATTENTE',        -- statut (par défaut)
    NOW(),               -- date_soumission
    NOW()                -- updated_at
);
```

### SELECT Examples (Flux)

```sql
-- FLUX 1: LOGIN - Récupérer user par email
SELECT id, email, nom, prenom, role, pays, password_hash
FROM users
WHERE email = 'john@example.com';

-- FLUX 2: CRÉER DEMANDE - Vérifier chevauchement
SELECT COUNT(*) as overlapping
FROM demandes_conge d
WHERE d.user_id = 1
  AND d.statut IN ('ACCEPTE', 'EN_ATTENTE')
  AND d.date_debut <= '2026-06-19'
  AND d.date_fin >= '2026-06-15';

-- FLUX 3: VOIR SOLDES - Récupérer allocation initiale
SELECT jours_disponibles
FROM employee_leave_allocations
WHERE employee_id = 1 AND leave_type_id = 'PAYE' AND annee = 2026;

-- FLUX 3: VOIR SOLDES - Compter jours utilisés (ACCEPTE)
SELECT COALESCE(SUM(nombre_jours), 0) as days_used
FROM demandes_conge
WHERE user_id = 1 AND type_conge = 'PAYE' AND statut = 'ACCEPTE';

-- FLUX 3: VOIR SOLDES - Compter jours en attente (EN_ATTENTE)
SELECT COALESCE(SUM(nombre_jours), 0) as days_pending
FROM demandes_conge
WHERE user_id = 1 AND type_conge = 'PAYE' AND statut = 'EN_ATTENTE';

-- FLUX 4: RH APPROUVE - Récupérer demande
SELECT d.*, u.pays as user_pays
FROM demandes_conge d
JOIN users u ON d.user_id = u.id
WHERE d.id = 123;

-- FLUX 4: RH APPROUVE - Vérifier country access (RH ne peut voir que son pays)
SELECT u.pays as rh_country
FROM users u
WHERE u.id = 2 AND u.role = 'RH';
-- Vérifier: rh_country = demande.user.pays

-- FLUX 4: RH APPROUVE - Mettre à jour statut
UPDATE demandes_conge
SET statut = 'ACCEPTE',
    commentaire_rh = 'Approuvé',
    approuve_par_id = 2,
    updated_at = NOW()
WHERE id = 123;

-- FLUX 5: STATISTIQUES - Compter par statut et pays
SELECT 
    COUNT(CASE WHEN d.statut = 'EN_ATTENTE' THEN 1 END) as pending,
    COUNT(CASE WHEN d.statut = 'ACCEPTE' THEN 1 END) as approved,
    COUNT(CASE WHEN d.statut = 'REFUSE' THEN 1 END) as rejected
FROM demandes_conge d
JOIN users u ON d.user_id = u.id
WHERE u.pays = 'FR';
```

---

## FLUX COMPLETS AVEC SQL

### FLUX 1: LOGIN

```
ÉTAPE 1: Frontend
  POST /api/auth/login
  Body: {email: "john@example.com", password: "password123"}
  
ÉTAPE 2: Backend AuthController
  SELECT id, email, nom, prenom, role, pays, password_hash
  FROM users
  WHERE email = 'john@example.com';
  
  → Valider password (BCrypt)
  → Générer JWT token: {userId: 1, email, roles: ['EMPLOYE']}
  → Générer CSRF token
  
ÉTAPE 3: Response
  {
    token: "eyJhbGc...",
    csrfToken: "abc123...",
    user: {id: 1, email, role, pays}
  }
  
ÉTAPE 4: Frontend stocke
  localStorage.token = jwt_token
  localStorage.csrfToken = csrf_token
  localStorage.user = user_json
```

### FLUX 2: CRÉER DEMANDE

```
ÉTAPE 1: Frontend POST
  POST /api/demandes
  Headers: {
    Authorization: "Bearer eyJhbGc...",
    X-CSRF-TOKEN: "abc123..."
  }
  Body: {
    typeConge: "PAYE",
    dateDebut: "2026-06-15",
    dateFin: "2026-06-19",
    nombreJours: 5,
    motif: "Vacances"
  }

ÉTAPE 2: Backend JwtAuthFilter
  ✅ Valide JWT signature
  ✅ Extrait user_id=1 depuis token
  ✅ Cherche user en BD: SELECT ... WHERE id=1
  ✅ Crée Authentication object
  ✅ Stocke dans SecurityContext

ÉTAPE 3: DemandeController.creerDemande
  Reçoit: @AuthenticationPrincipal UserEntity user (vient du JWT!)
  user.id = 1 (impossible de modifier)

ÉTAPE 4: Validations
  a) InactiveUserCheckService.checkUserIsActive()
     SELECT contract_active FROM users WHERE id=1;
     if (contract_active == false) throw Exception;
  
  b) RequestValidationService.validateRequestCanBeCreated()
     SELECT COUNT(*) FROM demandes_conge
     WHERE user_id=1 AND statut IN ('ACCEPTE','EN_ATTENTE')
       AND date_debut <= '2026-06-19' AND date_fin >= '2026-06-15';
     if (count > 0) throw Exception("Chevauchement");
  
  c) LeaveBalanceService.getBalance()
     SELECT jours_disponibles FROM employee_leave_allocations
     WHERE employee_id=1 AND leave_type_id='PAYE' AND annee=2026;
     → Retourne 30 jours
     
     SELECT SUM(nombre_jours) FROM demandes_conge
     WHERE user_id=1 AND type_conge='PAYE' AND statut='ACCEPTE';
     → Retourne 5 jours
     
     available = 30 - 5 = 25 ✓

ÉTAPE 5: Créer demande
  INSERT INTO demandes_conge
  (user_id, type_conge, date_debut, date_fin, nombre_jours, motif, statut, date_soumission, updated_at)
  VALUES
  (1, 'PAYE', '2026-06-15', '2026-06-19', 5, 'Vacances', 'EN_ATTENTE', NOW(), NOW());
  
  → ID auto-généré: 123

ÉTAPE 6: Log audit
  EventAuditService.logRequestCreation()
  INSERT INTO audit_logs
  (action, user_id, demande_id, timestamp)
  VALUES ('REQUEST_CREATED', 1, 123, NOW());

ÉTAPE 7: Response
  {
    id: 123,
    user_id: 1,
    type_conge: "PAYE",
    date_debut: "2026-06-15",
    date_fin: "2026-06-19",
    nombre_jours: 5,
    motif: "Vacances",
    statut: "EN_ATTENTE",
    date_soumission: "2026-06-06T10:30:00"
  }
```

### FLUX 3: RH APPROUVE

```
ÉTAPE 1: Frontend POST
  POST /api/rh/requests/123/decision
  Headers: {
    Authorization: "Bearer eyJhbGc...",  ← RH JWT token
    X-CSRF-TOKEN: "xyz789..."
  }
  Body: {action: "APPROVE", comment: "Approuvé"}

ÉTAPE 2: Backend JwtAuthFilter
  ✅ Valide JWT RH
  ✅ Extrait user_id=2 (RH), role='RH', pays='FR'

ÉTAPE 3: HrDecisionController.decide()
  actor = UserEntity {id: 2, role: 'RH', pays: 'FR'}
  demandeId = 123

ÉTAPE 4: Vérifications
  a) Charger demande:
     SELECT d.*, u.pays as user_pays
     FROM demandes_conge d
     JOIN users u ON d.user_id = u.id
     WHERE d.id = 123;
     → {id: 123, user_id: 1, user_pays: 'FR', statut: 'EN_ATTENTE'}
  
  b) Vérifier country access:
     if (actor.pays != demande.user.pays) throw Exception("Accès refusé");
     if ('FR' != 'FR') ✓ OK
  
  c) Vérifier race condition (reload):
     SELECT statut FROM demandes_conge WHERE id=123;
     if (statut != 'EN_ATTENTE') throw Exception("Déjà modifiée");
     ✓ OK

ÉTAPE 5: Mettre à jour statut
  UPDATE demandes_conge
  SET statut = 'ACCEPTE',
      commentaire_rh = 'Approuvé',
      approuve_par_id = 2,
      updated_at = NOW()
  WHERE id = 123;

ÉTAPE 6: Synchroniser Dolibarr
  POST https://dolibarr.example.com/api/leave/123
  {status: 'ACCEPTED', employee_id: 1, ...}

ÉTAPE 7: Synchroniser RTT
  SELECT SUM(nombre_jours) FROM demandes_conge
  WHERE user_id=1 AND type_conge='RTT' AND statut='ACCEPTE'
  AND YEAR(date_debut)=2026;
  → RTT utilisé = 2 jours
  → RTT disponible = 30 - 2 = 28 jours

ÉTAPE 8: Log audit
  INSERT INTO audit_logs
  (action, user_id, demande_id, old_value, new_value, timestamp)
  VALUES ('REQUEST_STATUS_CHANGE', 2, 123, 'EN_ATTENTE', 'ACCEPTE', NOW());

ÉTAPE 9: Response
  {id: 123, statut: "ACCEPTE", approuve_par_id: 2, ...}
```

---

## SÉCURITÉ

### 1. JWT Authentication

```
Login génère JWT:
  {
    "userId": 1,
    "email": "john@example.com",
    "roles": ["EMPLOYE"],
    "iat": 1717747800,
    "exp": 1717834200
  }
  
  Signé avec: HS256 + SECRET_KEY (clé secrète)

Chaque requête:
  Authorization: Bearer eyJhbGc.eyJpc...

JwtAuthFilter:
  1. Extrait token depuis header
  2. Valide signature (impossible de modifier sans clé)
  3. Extrait userId, email, roles
  4. Crée Authentication object
  5. Injecte via @AuthenticationPrincipal

Impossible de truquer:
  - Modifier token → signature invalide
  - Envoyer userId différent → vient du token, pas du paramètre
```

### 2. Country Access Control

```
Règle: RH ne peut voir/approuver que demandes de son pays

Implémentation:
  1. user.pays = 'FR' (stocké en BD)
  2. HrDecisionService.enforceCountryAccess(actor, country)
     if (actor.pays != country) throw Exception("Accès refusé");
  3. SQL: WHERE users.pays = 'FR'

Exemple:
  RH France tente: GET /api/rh/requests?country=DE
  → Service vérifie: actor.pays('FR') != 'DE'
  → Exception: "Accès refusé"
```

### 3. Input Validation

```
Avant de créer demande:
  ✅ 1. Utilisateur actif? (contract_active == true)
  ✅ 2. Pas de chevauchement? (countOverlappingDemandes == 0)
  ✅ 3. Solde suffisant? (available >= requested)
  ✅ 4. Type congé valide? (exists in leave_types)

Avant d'approuver:
  ✅ 1. RH du bon pays? (enforceCountryAccess)
  ✅ 2. Race condition? (reload + verify statut)
  ✅ 3. Demande existe? (find by id)
```

### 4. CSRF Protection

```
Production:
  - POST/PUT/DELETE exige X-CSRF-TOKEN header
  - Token généré au login
  - Frontend ajoute via interceptor

Development:
  - CSRF disabled pour /auth/login seulement
  - Tout le reste protected
```

### 5. CORS

```
Whitelist:
  - Allowed origins: http://localhost:5173
  
Restricted headers:
  - Content-Type ✓
  - Authorization ✓
  - X-Requested-With ✓
  - X-CSRF-TOKEN ✓
  
NOT allowed:
  - * (wildcard)
```

---

## DÉPLOIEMENT

### Frontend

```bash
# Build
npm run build
→ dist/

# Deploy
Upload dist/ to web server
Configure: VITE_API_BASE_URL=https://api.example.com
```

### Backend

```bash
# Build
mvn clean package
→ target/gestion-conges-backend-0.0.1-SNAPSHOT.jar

# Run production
java -Dspring.profiles.active=prod -jar target/*.jar

# Environment variables
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/conges
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=your-secret-key
```

### Database

```bash
# Initialize
mysql -u root -p < schema.sql

# Test data
INSERT INTO users ...
INSERT INTO leave_types ...
INSERT INTO employee_leave_allocations ...
```

---

## QUESTIONS/RÉPONSES

**Q1: Comment JWT empêche la triche?**
Le token est signé avec une clé secrète. Si quelqu'un modifie userId dans le token, la signature devient invalide et le backend le rejette.

**Q2: Comment RH ne voit que son pays?**
user.pays stocké en BD + HrDecisionService vérifie actor.pays == demande.user.pays avant chaque opération.

**Q3: Où les soldes sont-ils stockés?**
Allocation initiale dans employee_leave_allocations (30 jours par an).
Solde = allocation - (jours acceptés) - (jours en attente) = **calculé en temps réel**.

**Q4: Qu'est-ce qui empêche les chevauchements?**
Avant de créer: `countOverlappingDemandes() == 0` sinon Exception.

**Q5: Comment fonctionne CSRF?**
Token généré au login, envoyé en header X-CSRF-TOKEN, vérifié par CsrfFilter. Impossible de faire une mutation sans.

**Q6: Qui peut approuver une demande?**
Uniquement les RH du bon pays. Sinon: AccessDeniedException.

**Q7: Et si RH modifie une demande déjà approuvée?**
Reload demande depuis BD avant modification. Si statut a changé → Exception "Déjà modifiée".

---

## INDEX EMPLACEMENTS CODE

| Sujet | Fichier | Localisation |
|-------|---------|--------------|
| JWT Interceptor | src/utils/api.js | Lignes 12-26 |
| CSRF Interceptor | src/utils/api.js | Lignes 20-24 |
| Login Component | src/pages/auth/Login.jsx | handleLogin function |
| Create Request | src/pages/employe/CreateRequest.jsx | handleSubmit |
| LeaveBalanceService | src/main/java/.../service/LeaveBalanceService.java | getBalance method |
| LeaveBalanceController | src/main/java/.../controller/LeaveBalanceController.java | @GetMapping /{userId} |
| SecurityConfig | src/main/java/.../config/SecurityConfig.java | securityFilterChain + corsConfigurationSource |
| DemandeCongeRepository | src/main/java/.../repository/DemandeCongeRepository.java | countOverlappingDemandes query |
| HrDecisionService | src/main/java/.../service/HrDecisionService.java | enforceCountryAccess |
| JwtAuthFilter | src/main/java/.../config/JwtAuthFilter.java | doFilterInternal method |
| DemandeConge Entity | src/main/java/.../entity/DemandeConge.java | class definition |
| EventAuditService | src/main/java/.../service/EventAuditService.java | logRequestStatusChange |
| CREATE TABLE users | schema.sql | Line ~1 |
| CREATE TABLE demandes_conge | schema.sql | Line ~25 |
| INSERT demande | N/A | Example SQL above |
| SELECT chevauchement | N/A | Query example above |

---

**STATUS: ✅ GUIDE COMPLET - Tout dans 1 seul fichier!**

