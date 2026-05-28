# DIAGRAMMES UML COMPLETS — Système de Gestion Intelligente des Congés

## 1. DIAGRAMME DE CAS D'UTILISATION

Le diagramme de cas d'utilisation représente les interactions entre les acteurs (Employé, Responsable RH / Super Admin) et le système. Le système externe **Dolibarr** et le **système de notification e-mail** apparaissent comme acteurs secondaires.

Conventions : **généralisation** (un cas parent décliné en cas enfants), **«include»** pour un comportement toujours exécuté (authentification, calcul des jours), **«extend»** pour un comportement optionnel.

### 1.1. Vue globale

```plantuml
@startuml UC_Global
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false
skinparam actorBackgroundColor #DDD9C3
skinparam usecase {
  BorderColor #333333
}

actor "Employé" as EMP
actor "Responsable RH\n(Super Admin)" as RH
actor "Dolibarr\n(système externe)" as DOL
actor "Système\ne-mail" as MAIL

rectangle "Système de Gestion des Congés" {

  ' ===== Commun =====
  usecase "S'authentifier" as AUTH #EEEEEE
  usecase "Se déconnecter" as LOGOUT #EEEEEE

  ' ===== Employé =====
  usecase "Gérer ses demandes\nde congé" as GDEM #F8CBAD
  usecase "Créer une demande" as CREATE #F8CBAD
  usecase "Annuler une demande" as CANCEL #F8CBAD
  usecase "Consulter l'état\nd'une demande" as STATUS #F8CBAD
  usecase "Consulter l'historique" as HIST #F8CBAD
  usecase "Calculer les\njours ouvrables" as CALC #F8CBAD
  usecase "Joindre un\njustificatif" as JUST #F8CBAD
  usecase "Demander une\nautorisation 2h / RTT" as AUTOR #F8CBAD
  usecase "Demander un\ncongé exceptionnel" as EXC #F8CBAD
  usecase "Obtenir l'assistance IA\n(dates, conflits)" as IAEMP #F8CBAD
  usecase "Consulter son solde" as ESOLDE #F8CBAD
  usecase "Consulter son\ncalendrier" as ECAL #F8CBAD
  usecase "Télécharger une\nattestation" as ATT #F8CBAD
  usecase "Recevoir une\nnotification e-mail" as NOTIF #F8CBAD

  ' ===== Responsable RH =====
  usecase "Gérer les demandes\ndes employés" as GRH #FFE699
  usecase "Consulter une demande" as CONS #FFE699
  usecase "Valider une demande" as VALID #FFE699
  usecase "Refuser une demande" as REFUS #FFE699
  usecase "Configurer les\nrègles par pays" as CONF #FFE699
  usecase "Gérer les jours fériés\n(TN / MA / FR)" as FERIES #FFE699
  usecase "Configurer les\nhoraires de travail" as HORAIRE #FFE699
  usecase "Configurer les\ncongés exceptionnels" as CONFEXC #FFE699
  usecase "Configurer les\npolitiques de congés" as POL #FFE699
  usecase "Configurer le\nworkflow de validation" as WF #FFE699
  usecase "Gérer les soldes\ndes employés" as RSOLDE #FFE699
  usecase "Consulter le\ntableau de bord" as DASH #FFE699
  usecase "Consulter le\ncalendrier RH global" as RCAL #FFE699
  usecase "Consulter le\njournal d'audit" as AUDIT #FFE699
  usecase "Exporter des rapports\n(PDF / Excel)" as EXPORT #FFE699
  usecase "Bénéficier de l'assistance IA\n(score, tendances)" as IARH #FFE699
  usecase "Synchroniser\navec Dolibarr" as SYNC #FFE699
}

' ===== Acteur Employé =====
EMP --> AUTH
EMP --> LOGOUT
EMP --> GDEM
EMP --> ESOLDE
EMP --> ECAL
EMP --> NOTIF

' ===== Acteur Responsable RH =====
RH --> AUTH
RH --> LOGOUT
RH --> GRH
RH --> CONF
RH --> RSOLDE
RH --> DASH
RH --> RCAL
RH --> AUDIT
RH --> EXPORT
RH --> IARH
RH --> SYNC

' ===== Acteurs secondaires =====
DOL --> SYNC
NOTIF --> MAIL
VALID --> MAIL
REFUS --> MAIL

' ===== Généralisations (héritage) =====
CREATE --|> GDEM
CANCEL --|> GDEM
STATUS --|> GDEM
HIST   --|> GDEM
AUTOR  --|> CREATE
EXC    --|> CREATE

CONS  --|> GRH
VALID --|> GRH
REFUS --|> GRH

FERIES  --|> CONF
HORAIRE --|> CONF
CONFEXC --|> CONF
POL     --|> CONF
WF      --|> CONF

' ===== <<include>> (toujours exécuté) =====
GDEM   ..> AUTH : <<include>>
ESOLDE ..> AUTH : <<include>>
ECAL   ..> AUTH : <<include>>
GRH    ..> AUTH : <<include>>
CONF   ..> AUTH : <<include>>
RSOLDE ..> AUTH : <<include>>
DASH   ..> AUTH : <<include>>
SYNC   ..> AUTH : <<include>>
CREATE ..> CALC : <<include>>

' ===== <<extend>> (optionnel) =====
JUST  ..> CREATE : <<extend>>
IAEMP ..> CREATE : <<extend>>
ATT   ..> STATUS : <<extend>>

@enduml
```

Pour plus de lisibilité, ce diagramme global est ensuite détaillé **par acteur** (package Employé, package Responsable RH).

### 1.2. Package Employé

```plantuml
@startuml UC_Package_Employe
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false
skinparam actorBackgroundColor #DDD9C3
skinparam usecase {
  BackgroundColor #F8CBAD
  BorderColor #C55A11
}

actor "Employé" as EMP
actor "Système\ne-mail" as MAIL

rectangle "Gestion des Congés — Package Employé" {

  usecase "S'authentifier" as AUTH
  usecase "Se déconnecter" as LOGOUT

  ' --- gérer ses demandes (cas parent) ---
  usecase "Gérer ses demandes\nde congé" as GDEM
  usecase "Créer une demande" as CREATE
  usecase "Annuler une demande" as CANCEL
  usecase "Consulter l'état\nd'une demande" as STATUS
  usecase "Consulter l'historique" as HIST

  ' --- liés à la création ---
  usecase "Calculer les\njours ouvrables" as CALC
  usecase "Joindre un\njustificatif" as JUST
  usecase "Demander une\nautorisation 2h / RTT" as AUTOR
  usecase "Demander un\ncongé exceptionnel" as EXC
  usecase "Obtenir l'assistance IA\n(dates, conflits)" as IA

  ' --- autres ---
  usecase "Consulter son solde" as SOLDE
  usecase "Consulter son\ncalendrier" as CAL
  usecase "Télécharger une\nattestation" as ATT
  usecase "Recevoir une\nnotification e-mail" as NOTIF
}

' --- Acteur Employé ---
EMP --> AUTH
EMP --> LOGOUT
EMP --> GDEM
EMP --> SOLDE
EMP --> CAL
EMP --> NOTIF

' --- Généralisations ---
CREATE --|> GDEM
CANCEL --|> GDEM
STATUS --|> GDEM
HIST   --|> GDEM
AUTOR  --|> CREATE
EXC    --|> CREATE

' --- <<include>> (toujours exécuté) ---
GDEM   ..> AUTH : <<include>>
SOLDE  ..> AUTH : <<include>>
CAL    ..> AUTH : <<include>>
CREATE ..> CALC : <<include>>

' --- <<extend>> (optionnel) ---
JUST ..> CREATE : <<extend>>
IA   ..> CREATE : <<extend>>
ATT  ..> STATUS : <<extend>>

' --- Acteur secondaire ---
NOTIF --> MAIL

@enduml
```

### 1.3. Package Responsable RH (Super Admin)

```plantuml
@startuml UC_Package_RH
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false
skinparam actorBackgroundColor #DDD9C3
skinparam usecase {
  BackgroundColor #FFE699
  BorderColor #BF9000
}

actor "Responsable RH\n(Super Admin)" as RH
actor "Système\ne-mail" as MAIL
actor "Dolibarr\n(système externe)" as DOL

rectangle "Gestion des Congés — Package Responsable RH" {

  usecase "S'authentifier" as AUTH

  ' --- gérer les demandes (cas parent) ---
  usecase "Gérer les demandes\ndes employés" as GRH
  usecase "Consulter une demande" as CONS
  usecase "Valider une demande" as VALID
  usecase "Refuser une demande" as REFUS

  ' --- configuration multi-pays (cas parent) ---
  usecase "Configurer les\nrègles par pays" as CONF
  usecase "Gérer les jours fériés\n(TN / MA / FR)" as FERIES
  usecase "Configurer les\nhoraires de travail" as HORAIRE
  usecase "Configurer les\ncongés exceptionnels" as CONFEXC
  usecase "Configurer les\npolitiques de congés" as POL
  usecase "Configurer le\nworkflow de validation" as WF

  ' --- pilotage ---
  usecase "Gérer les soldes\ndes employés" as SOLDE
  usecase "Consulter le\ntableau de bord" as DASH
  usecase "Consulter le\ncalendrier RH global" as CAL
  usecase "Consulter le\njournal d'audit" as AUDIT
  usecase "Exporter des rapports\n(PDF / Excel)" as EXPORT
  usecase "Bénéficier de l'assistance IA\n(score, tendances)" as IA
  usecase "Synchroniser\navec Dolibarr" as SYNC
}

' --- Acteur RH ---
RH --> AUTH
RH --> GRH
RH --> CONF
RH --> SOLDE
RH --> DASH
RH --> CAL
RH --> AUDIT
RH --> EXPORT
RH --> IA
RH --> SYNC

' --- Généralisations ---
CONS  --|> GRH
VALID --|> GRH
REFUS --|> GRH
FERIES  --|> CONF
HORAIRE --|> CONF
CONFEXC --|> CONF
POL     --|> CONF
WF      --|> CONF

' --- <<include>> (toujours exécuté) ---
GRH    ..> AUTH : <<include>>
CONF   ..> AUTH : <<include>>
SOLDE  ..> AUTH : <<include>>
DASH   ..> AUTH : <<include>>
EXPORT ..> AUTH : <<include>>
SYNC   ..> AUTH : <<include>>

' --- Acteurs secondaires ---
VALID --> MAIL
REFUS --> MAIL
DOL --> SYNC

@enduml
```

---

## 2. DIAGRAMME DE CLASSE (MODÈLE DE DONNÉES)

```plantuml
@startuml ClassDiagram
hide empty members
skinparam classBackgroundColor #F0F0F0
skinparam classBorderColor #333333

enum Role {
    EMPLOYE
    RH
    MANAGER
    ADMIN
}

enum StatutConge {
    EN_ATTENTE
    APPROUVE
    REJETE
    ANNULE
}

enum TypeConge {
    CONGE_PAYE
    RTT
    MALADIE
    COURTE_DUREE
    EXCEPTIONNEL
    AUTRE
}

enum HalfDay {
    MORNING
    AFTERNOON
}

enum ActionType {
    CREATED
    APPROVED
    REJECTED
    CANCELLED
    SYNCED
    MODIFIED
}

class UserEntity {
    -id: Long
    -dolibarrId: Long
    -email: String [unique]
    -nom: String
    -prenom: String
    -role: Role
    -pays: String
    -countryCode: String (TN, MA, FR)
    -weeklyHours: BigDecimal
    -annualWorkDays: Integer
    -contractType: String
    -contractActive: boolean
    -hireDate: LocalDate
    -departement: String
    -passwordHash: String
    -createdAt: LocalDateTime
    -updatedAt: LocalDateTime
    --
    +authenticate(): boolean
    +hasRole(): boolean
}

class DemandeConge {
    -id: Long
    -user: UserEntity (FK)
    -approvedBy: UserEntity (FK nullable)
    -typeConge: TypeConge
    -exceptionalLeaveConfigId: Long
    -dateDebut: LocalDate
    -dateFin: LocalDate
    -nombreJours: int
    -nombreJoursExact: Double
    -startHalfDay: HalfDay
    -endHalfDay: HalfDay
    -statut: StatutConge
    -motif: String
    -commentaireRh: String
    -dateSoumission: LocalDateTime
    -dateTraitement: LocalDateTime
    -workflowCode: String
    -currentStepOrder: Integer
    -dolibarrLeaveRequestId: Long
    -dureePermissionMinutes: Integer
    -pieceJointeNom: String
    --
    +calculerJoursOuvrables(): int
    +calculerJoursOuvrablesExact(): double
    +isWorkdayAndNotHoliday(): boolean
}

class EmployeeLeaveAllocation {
    -id: Long
    -employee: UserEntity (FK)
    -leaveType: LeaveType (FK)
    -dolibarrAllocationId: Long [unique]
    -joursInitiaux: Double
    -joursUtilises: Double
    -joursDisponibles: Double
    -annee: Integer
    -dateDebut: LocalDate
    -dateFin: LocalDate
    -active: Boolean
    -createdAt: LocalDateTime
    -updatedAt: LocalDateTime
    --
    +getJoursRestants(): Double
    +updateFromDolibarr(): void
}

class LeaveType {
    -id: Long
    -dolibarrLeaveTypeId: Long [unique]
    -code: String
    -libelle: String
    -description: String
    -couleur: String
    -active: Boolean
    -requiresApproval: Boolean
    -delai: Long
    -createdAt: LocalDateTime
    -updatedAt: LocalDateTime
    -syncStatus: Integer
}

class History {
    -id: Long
    -userId: Long
    -userNom: String
    -userPrenom: String
    -userEmail: String
    -demandeId: Long
    -actionType: ActionType
    -description: String
    -details: String (JSON)
    -pays: String
    -statut: String
    -actionDate: LocalDateTime
    --
    +logAction(): void
}

class Holiday {
    -id: Long
    -date: LocalDate
    -nom: String
    -pays: String (TN, MA, FR)
    -holidayType: String (FIXED, LUNAR)
    -isActive: Boolean
    -year: Integer
    --
    +isHolidayOn(): boolean
}

class CountryLeavePolicy {
    -id: Long
    -countryCode: String (TN, MA, FR)
    -weekendDays: Set<DayOfWeek>
    -standardWorkHours: Integer
    -cpAnnualDays: Integer
    -rttConfiguration: String (nullable)
    -exceptionLeaveTypes: Set<String>
    --
    +getWeekendDays(): Set
    +isWorkDay(): boolean
}

class WorkflowDefinition {
    -id: Long
    -name: String
    -countryCode: String
    -isActive: Boolean
    -steps: List<WorkflowStep>
    --
    +getSteps(): List
    +getNextStep(): WorkflowStep
}

class WorkflowStep {
    -id: Long
    -workflowId: Long
    -stepOrder: Integer
    -roleName: String (MANAGER, RH, ADMIN)
    -isRequired: Boolean
    -description: String
    --
    +getNextStep(): WorkflowStep
}

class DemandeApproval {
    -id: Long
    -demandeId: Long
    -approverRoleId: Long
    -approverUserId: Long (nullable)
    -status: String (PENDING, APPROVED, REJECTED)
    -approvalDate: LocalDateTime
    -comments: String
    --
    +approve(): void
    +reject(): void
}

class DemandeAttachment {
    -id: Long
    -demandeId: Long
    -fileName: String
    -filePath: String
    -uploadedAt: LocalDateTime
    -attachmentType: String
    --
    +getFile(): File
}

class WorkScheduleSetting {
    -id: Long
    -countryCode: String
    -scheduleType: String (NORMAL, SUMMER, RAMADAN)
    -startDate: LocalDate
    -endDate: LocalDate
    -workDays: List<WorkScheduleDay>
    --
    +getWorkDays(): List
}

class WorkScheduleDay {
    -id: Long
    -settingId: Long
    -dayOfWeek: DayOfWeek
    -startTime: LocalTime
    -endTime: LocalTime
    -isWorkDay: Boolean
    --
    +getWorkingHours(): Integer
}

class ExceptionalLeaveConfig {
    -id: Long
    -countryCode: String
    -leaveReason: String (MARRIAGE, BIRTH, DEATH...)
    -maxDaysPerOccurrence: Integer
    -requiresJustification: Boolean
    -isActive: Boolean
    --
    +isValidReason(): boolean
}

class FranceRttSettings {
    -id: Long
    -employeeId: Long
    -rttHoursBalance: BigDecimal
    -rttDaysUsedThisYear: BigDecimal
    -lastUpdateDate: LocalDateTime
    --
    +consumeRttHours(): void
    +getRemainingRttDays(): BigDecimal
}

class EmployeeFranceRttBalance {
    -id: Long
    -userId: Long (FK)
    -annee: Integer
    -rttHoursTotal: BigDecimal
    -rttHoursUsed: BigDecimal
    -rttHoursAvailable: BigDecimal
    -updatedAt: LocalDateTime
    --
    +updateBalance(): void
}

class DolibarrSyncLog {
    -id: Long
    -syncTimestamp: LocalDateTime
    -direction: String (IN, OUT)
    -status: String (SUCCESS, FAILED)
    -entityType: String (USER, ALLOCATION, LEAVE)
    -entityId: Long
    -details: String (JSON)
    --
    +logSync(): void
}

' Relations
UserEntity "1" --> "*" DemandeConge : crée
UserEntity "1" --> "*" EmployeeLeaveAllocation : possède
UserEntity "1" --> "*" History : effectue
UserEntity "1" --> "?" FranceRttSettings : possède (FR)
UserEntity "1" --> "?" EmployeeFranceRttBalance : possède (FR)

DemandeConge "*" --> "1" LeaveType : de type
DemandeConge "*" --> "1" UserEntity : approvementBy
DemandeConge "1" --> "*" DemandeApproval : a workflow
DemandeConge "1" --> "*" History : génère
DemandeConge "1" --> "*" DemandeAttachment : contient

EmployeeLeaveAllocation "*" --> "1" LeaveType
EmployeeLeaveAllocation "*" --> "1" UserEntity

Holiday "*" --> "1" CountryLeavePolicy : appartient à
CountryLeavePolicy "1" --> "*" ExceptionalLeaveConfig : configure

WorkflowDefinition "*" --> "1" CountryLeavePolicy : pour pays
WorkflowDefinition "1" --> "*" WorkflowStep : contient

WorkScheduleSetting "*" --> "1" CountryLeavePolicy : pour pays
WorkScheduleSetting "1" --> "*" WorkScheduleDay : contient

DemandeApproval "*" --> "1" WorkflowStep : suit

@enduml
```

---

## 3. DIAGRAMME DE SÉQUENCE — Créer une Demande de Congé

```plantuml
@startuml Sequence_CreateRequest
actor "Employé" as Emp
participant "Frontend React" as FE
participant "API Demande\nController" as API
participant "CongeService" as Service
participant "LeaveCalculation\nService" as CalcSvc
participant "Repository" as Repo
database "MySQL DB" as DB

Emp -> FE: Remplir formulaire\n(type, dates, motif)
FE -> FE: Validation locale\n(dates, format)

FE -> API: POST /api/demandes\n{typeConge, dateDebut, dateFin, motif}\n+ JWT token
activate API
API -> API: Vérifier JWT + RBAC\n(EMPLOYE)

API -> Service: creerDemande(\nemployeeId, request)
activate Service

Service -> CalcSvc: calculerJoursOuvrables(\ndateDebut, dateFin, \ncountryCode)
activate CalcSvc
CalcSvc -> Repo: getActiveHolidays(\ncountryCode)
Repo -> DB: SELECT * FROM holiday\nWHERE pays = countryCode\nAND isActive = 1
DB --> Repo: List<Holiday>
CalcSvc -> CalcSvc: Exclure weekends\n+ jours fériés\n+ demi-journées
CalcSvc --> Service: nombreJoursExact\n= 5.5 jours
deactivate CalcSvc

Service -> Repo: getEmployeeBalance(\nemployeeId, typeConge)
Repo -> DB: SELECT * FROM employee_leave_allocations\nWHERE userId = employeeId\nAND leaveTypeId = typeConge
DB --> Repo: EmployeeLeaveAllocation
Service -> Service: Vérifier solde\nsuffisant ?
alt Solde insuffisant
    Service --> API: CongesInsufficientException
    API --> FE: 400 Bad Request\n"Solde insuffisant"
    FE -> FE: Afficher erreur
    FE -> Emp: Message erreur
    stop
end

Service -> Repo: saveDemande(\nnew DemandeConge)
activate Repo
Repo -> DB: INSERT INTO demandes_conge\n(user_id, type_conge,\ndate_debut, date_fin,\nnombre_jours_exact, statut, motif)\nVALUES (...)
DB --> Repo: ID demande créée
deactivate Repo

Service -> Repo: saveHistory(\nActionType.CREATED)
Repo -> DB: INSERT INTO history\n(user_id, demande_id, action_type,\naction_date, details)
DB --> Repo: OK

Service --> API: DemandeCongeResponse\n{id, statut=EN_ATTENTE, ...}
deactivate Service

API --> FE: 201 Created\n{demande}
deactivate API

FE -> FE: Afficher confirmation\n+ numéro demande

FE -> Emp: "Demande créée !\nN° demande: #123456"

@enduml
```

---

## 4. DIAGRAMME DE SÉQUENCE — Valider une Demande (RH avec Règles Multi-Pays)

```plantuml
@startuml Sequence_ValidateRequest
actor "RH" as RH
participant "Frontend React" as FE
participant "HrDecision\nController" as API
participant "CongeService" as Service
participant "Dolibarr\nSyncService" as DoliSvc
participant "Country\nPolicyService" as CountrySvc
participant "Repository" as Repo
participant "Email\nService" as Email
database "MySQL DB" as DB

RH -> FE: Consulter demande\nen attente
FE -> API: GET /api/demandes/en-attente\n+ JWT token RH
API -> Repo: getAllDemandesEnAttente()
Repo -> DB: SELECT * FROM demandes_conge\nWHERE statut = 'EN_ATTENTE'
DB --> Repo: List<DemandeConge>
Repo --> API: Demandes
API --> FE: 200 OK + list

FE -> FE: Afficher tableau\ndemandes + détails
FE -> Emp: "Liste des demandes"

RH -> FE: Cliquer "Approuver"\nou "Rejeter"

alt APPROUVER DEMANDE
    FE -> API: PUT /api/demandes/{id}/valider\n{accepte: true,\ncommentaire: ""}\n+ JWT token
    activate API
    
    API -> API: Vérifier JWT + RBAC\n(hasRole('RH'))
    API -> Service: validerDemande(\ndemandeId, rhId,\naccepte=true, "")")
    activate Service
    
    Service -> CountrySvc: applyCountryRules(\ncountryCode, demande)
    activate CountrySvc
    CountrySvc -> Repo: getCountryPolicy(\ncountryCode)
    Repo -> DB: SELECT * FROM country_leave_policies\nWHERE countryCode = ?
    DB --> Repo: CountryLeavePolicy
    
    alt TN ou MA
        CountrySvc -> CountrySvc: Vérifier règles TN/MA\n- Autorisation 2h ?\n- Solde CP suffisant ?\n- Pas de chevauchement ?
    else FR
        CountrySvc -> CountrySvc: Vérifier règles FR\n- RTT ou CP suffisant ?\n- Congé exceptionnel ?\n- Conformité RTT ?
    end
    
    CountrySvc --> Service: Validation OK
    deactivate CountrySvc
    
    Service -> Repo: updateDemande(\nstatut = APPROUVE,\napprovedBy = rhId)
    Repo -> DB: UPDATE demandes_conge\nSET statut = 'APPROUVE',\napproved_by_admin_id = ?\nWHERE id = ?
    DB --> Repo: OK
    
    Service -> Repo: updateAllocation(\nemployeeId, typeConge,\njoursConsommes)
    Repo -> DB: UPDATE employee_leave_allocations\nSET jours_utilises = jours_utilises + ?,\njours_disponibles = jours_disponibles - ?\nWHERE user_id = ? AND leave_type_id = ?
    DB --> Repo: OK
    
    Service -> Repo: saveHistory(\nActionType.APPROVED)
    Repo -> DB: INSERT INTO history\n(user_id, demande_id,\naction_type = APPROVED, ...)"
    DB --> Repo: OK
    
    Service -> DoliSvc: syncLeaveToDolibarr(\ndemande)
    activate DoliSvc
    DoliSvc -> DoliSvc: Construire payload\nDolibarr\n{userId, dateDebut,\ndateFin, typeConge, ...}
    DoliSvc --> Service: SyncSuccess\n(dolibarrLeaveId)
    deactivate DoliSvc
    
    Service -> Email: envoyerNotification(\nemployeeEmail, "APPROUVE")
    activate Email
    Email -> Email: Charger template\nFreeMarker\n"approval.ftl"
    Email -> Email: Remplacer variables\n{demandeur, dates,\ntype, ...}
    Email --> Service: Email envoyé
    deactivate Email
    
    Service --> API: DemandeCongeResponse\n{id, statut=APPROUVE, ...}
    deactivate Service
    
    API --> FE: 200 OK\n{demande approuvée}
    deactivate API
    
    FE -> FE: Rafraîchir\ntableau de bord
    FE -> RH: "Demande approuvée"

else REJETER DEMANDE
    FE -> API: PUT /api/demandes/{id}/valider\n{accepte: false,\ncommentaire: "Conflit avec\nabsence prévue"}\n+ JWT token
    activate API
    
    API -> Service: validerDemande(\ndemandeId, rhId,\naccepte=false, "Conflit...")")
    activate Service
    
    Service -> Repo: updateDemande(\nstatut = REJETE,\ncommentaireRh = "Conflit...")
    Repo -> DB: UPDATE demandes_conge\nSET statut = 'REJETE',\ncommentaire_rh = ?\nWHERE id = ?
    DB --> Repo: OK
    
    Service -> Repo: saveHistory(\nActionType.REJECTED)
    Repo -> DB: INSERT INTO history\n(user_id, demande_id,\naction_type = REJECTED, details = JSON)"
    DB --> Repo: OK
    
    Service -> Email: envoyerNotification(\nemployeeEmail, "REJETE",\nmotif)
    Email --> Service: Email envoyé\navec motif du rejet
    
    Service --> API: DemandeCongeResponse\n{id, statut=REJETE, ...}
    deactivate Service
    
    API --> FE: 200 OK
    deactivate API
    
    FE -> RH: "Demande rejetée"
end

@enduml
```

---

## 5. DIAGRAMME DE SÉQUENCE — Authentification Dolibarr (Login)

```plantuml
@startuml Sequence_Auth
actor "Utilisateur" as User
participant "Login Form\n(React)" as LoginForm
participant "AuthController" as AuthAPI
participant "AuthService" as AuthSvc
participant "Dolibarr\nService" as DoliSvc
participant "JWT\nService" as JWTSvc
participant "Repository" as Repo
participant "Dolibarr\nREST API" as DolREST
database "MySQL DB" as DB

User -> LoginForm: Saisir email/password
LoginForm -> LoginForm: Valider format

LoginForm -> AuthAPI: POST /api/auth/login\n{email, password}
activate AuthAPI

AuthAPI -> AuthSvc: login(email, password)
activate AuthSvc

AuthSvc -> DoliSvc: authenticateViaDolibiarr(\nemail, password)
activate DoliSvc

DoliSvc -> DolREST: POST /user/login\nBasic Auth ou API Key\n{email, password}
activate DolREST
DolREST --> DoliSvc: 200 OK\n{dolibarrUserId, roles,\nname, email, ...}
deactivate DolREST

DoliSvc -> Repo: findUserByDolibarrId(\ndolibarrUserId)
activate Repo
Repo -> DB: SELECT * FROM users\nWHERE dolibarr_id = ?
DB --> Repo: UserEntity ou NULL
deactivate Repo

alt Utilisateur n'existe pas
    DoliSvc -> Repo: createNewUser(\ndolibarrUserId, email,\nname, role, countryCode)
    Repo -> DB: INSERT INTO users\n(dolibarr_id, email, nom,\nrole, pays, countryCode, ...)\nVALUES (...)
    DB --> Repo: UserEntity créé
    Repo --> DoliSvc: newUser
else Utilisateur existe
    Repo --> DoliSvc: existingUser
end

DoliSvc -> DoliSvc: Déterminer rôle\nselon Dolibarr role\n(EMPLOYE ou RH)

DoliSvc --> AuthSvc: UserEntity\n{id, email, role, ...}
deactivate DoliSvc

AuthSvc -> JWTSvc: generateToken(\nuserId, role,\nexpiryTime = 24h)
activate JWTSvc

JWTSvc -> JWTSvc: Signer JWT\nAlgorithme: HS256\nSecret: app.jwt.secret\nPayload:\n{\n  sub: userId,\n  role: role,\n  email: email,\n  exp: expiryTimestamp\n}

JWTSvc --> AuthSvc: JWT token\n(eyJhbGc...)")
deactivate JWTSvc

AuthSvc --> AuthAPI: AuthResponse\n{token, userId,\nrole, expiryTime}
deactivate AuthSvc

AuthAPI --> LoginForm: 200 OK\n{token, userInfo}
deactivate AuthAPI

LoginForm -> LoginForm: Stocker token\nen localStorage\nkey: "authToken"

LoginForm -> LoginForm: Déterminer\nredirection selon role

alt role = EMPLOYE
    LoginForm -> LoginForm: Redirect to\n/employee/dashboard
else role = RH
    LoginForm -> LoginForm: Redirect to\n/rh/dashboard
end

LoginForm -> User: Accueil (dashboard)"

note right of JWTSvc
  JWT token est envoyé dans\n  Authorization header pour\n  chaque appel API:
  Authorization: Bearer <token>
end note

@enduml
```

---

## 6. DIAGRAMME DE DÉPLOIEMENT

```plantuml
@startuml DeploymentDiagram
!define BACKEND_COLOR #87CEEB
!define FRONTEND_COLOR #98FB98
!define DATABASE_COLOR #FFB6C1
!define EXTERNAL_COLOR #DEB887

node "Client Browser" as ClientNode <<device>> #FRONTEND_COLOR {
    artifact "React SPA\n(Vite Build)" as ReactApp
    artifact "State Management\n(Context API)" as StateMan
    artifact "Axios HTTP Client" as HttpClient
    artifact "Tailwind CSS Styling" as TailwindCSS
}

node "Application Server\n(Spring Boot - AWS/On-Premises)" as AppServer <<node>> #BACKEND_COLOR {
    artifact "Embedded Tomcat\n(Port 8080)" as Tomcat
    artifact "Spring Web MVC\nControllers" as Controllers
    artifact "Security Layer\n(JWT Filter)" as Security
    artifact "Business Logic\nServices" as Services
    artifact "Data Access\nRepositories (JPA)" as Repositories
    artifact "Integration\nServices" as IntegrationSvc
    artifact "Email Service\n(FreeMarker + SMTP)" as EmailSvc
    artifact "File Storage\nService" as FileSvc
}

node "Database Server\n(MariaDB/MySQL)" as DBServer <<database>> #DATABASE_COLOR {
    database "Leave Management\nDatabase" as AppDB {
        component "users" as TableUsers
        component "demandes_conge" as TableDemandes
        component "employee_leave_allocations" as TableAllocations
        component "leave_types" as TableLeaveTypes
        component "holidays" as TableHolidays
        component "history" as TableHistory
        component "workflow_definitions" as TableWorkflows
        component "country_leave_policies" as TablePolicies
        component "work_schedule_settings" as TableSchedules
    }
}

node "Dolibarr Server\n(External ERP)" as DolibarrServer <<device>> #EXTERNAL_COLOR {
    artifact "Dolibarr REST API\n(/user, /hrm/...)" as DoliAPI
    artifact "Authentication\n(API Key or OAuth)" as DoliAuth
}

node "Email Server" as EmailServer <<device>> #EXTERNAL_COLOR {
    artifact "SMTP Server\n(localhost:25 or\nexternal provider)" as SMTP
}

node "File Storage" as FileStorage <<device>> #EXTERNAL_COLOR {
    artifact "Local Filesystem\n(/uploads/attachments)" as LocalFS
}

' Relationships
ClientNode --|> AppServer : HTTPS\n(JWT in header)
AppServer --|> DBServer : JDBC/Hibernate\n(SQL)
AppServer --|> DolibarrServer : HTTPS REST\n(API Key auth)
AppServer --|> EmailServer : SMTP\n(outbound mail)
AppServer --|> FileStorage : File I/O\n(upload/download)

ReactApp --|> StateMan
ReactApp --|> HttpClient
ReactApp --|> TailwindCSS

HttpClient --|> Controllers : Axios calls

Tomcat --|> Controllers
Controllers --|> Security
Security --|> Controllers

Controllers --|> Services
Services --|> Repositories
Services --|> IntegrationSvc
Services --|> EmailSvc
Services --|> FileSvc

Repositories --|> AppDB
EmailSvc --|> SMTP
FileSvc --|> LocalFS
IntegrationSvc --|> DoliAPI

@enduml
```

---

## 7. DIAGRAMME D'ACTIVITÉ — Workflow Demande de Congé

```plantuml
@startuml ActivityDiagram_LeaveWorkflow
start
:Employé accède au formulaire;
:Sélectionner dates, type, motif;

if (Dates valides ?) then (Non)
  :Afficher erreur "Dates invalides";
  stop
else (Oui)
endif

if (Motif complété ?) then (Non)
  :Afficher erreur "Motif requis";
  stop
else (Oui)
endif

:Système récupérer les jours fériés\ndu pays de l'employé;
:Calculer jours ouvrables\nexclure weekends + fériés\n+ éventuelles demi-journées;

:Afficher prévisualisation\nnombre jours, solde requis;

if (Employé confirme ?) then (Non)
  :Fermer formulaire;
  stop
else (Oui)
endif

:Créer DemandeConge\nstatut = EN_ATTENTE;

:Créer History entry\nActionType = CREATED;

:Récupérer profil RH\nor Manager selon workflow;

:Assigner demande\nà approuveur;

:Envoyer notification email\nà approuveur;

partition "Phase Approbation" {
  if (Approuveur\nvérifie rules ?) then (Refus)
    :Status = REJETE;
    :Envoyer email de rejet\navec motif;
    stop
  else (Accepte)
  endif

  if (Type = Autorisation 2h ?\nor RTT ?) then (Oui)
    :Validation rapide\nDirectement RH;
  else (Non)
    if (Manager existe ?) then (Oui)
      :Assigner à Manager\n(étape 1 workflow);
    else (Non)
      :Assigner directement à RH\n(étape finale);
    endif
  endif

  if (Conflit détecté ?) then (Oui)
    :Afficher conflits\ndécisions RH;
    if (RH confirme ?) then (Oui)
    else (Non)
      stop
    endif
  else (Non)
  endif

  :Status = APPROUVE;
  :Consommer solde\nde l'employé;
}

partition "Phase Synchronisation" {
  if (Sync Dolibarr\nconfigurée ?) then (Oui)
    :Appeler API Dolibarr\nPOST /hrm/holidays;
    if (Réponse OK ?) then (Oui)
      :Status = SYNCED;
      :Mettre à jour\ndolibarrLeaveRequestId;
    else (Non)
      :Log erreur\nsync;
      :Alerter RH;
    endif
  else (Non)
    :Marquer pour\nsync ultérieure;
  endif
}

:Envoyer email\nde confirmation\nà employé;

:Mettre à jour\nTableau de Bord RH;

:Employé consulte\nsonhistorique;

:Statut = APPROUVE;

stop

@enduml
```

---

## 8. DIAGRAMME DE COMPOSANTS (ARCHITECTURE COUCHES)

```plantuml
@startuml ComponentDiagram
!define PRESENTATION #FFE4C4
!define API #87CEEB
!define SERVICE #90EE90
!define REPOSITORY #FFB6C1
!define DB #DEB887
!define EXTERNAL #D3D3D3

package "Frontend Layer (React + Vite)" <<folder>> #PRESENTATION {
    component "Pages" as Pages {
        [LoginPage]
        [EmployeeDashboard]
        [CreateRequestForm]
        [LeaveHistory]
        [RhDashboard]
        [ConfigurationPages]
        [CalendarView]
    }
    
    component "Components" as Components {
        [FormFields]
        [Tables]
        [Cards]
        [Modals]
        [Notifications]
    }
    
    component "Services" as FEServices {
        [API Service (Axios)]
        [Auth Service]
        [Local Storage Service]
    }
    
    component "State Management" as StateMan {
        [Context API]
        [Custom Hooks]
        [useAuth]
        [useLeaveData]
    }
}

package "API Layer (Spring Boot Controllers)" <<folder>> #API {
    component "REST Controllers" as Controllers {
        [AuthController]
        [DemandeController]
        [EmployeeController]
        [RhDashboardController]
        [HrConfigController]
        [DolibarrSyncController]
        [ReportController]
        [CalendarController]
    }
    
    component "Security & CORS" as APISecurity {
        [JWT Filter]
        [CORS Configuration]
        [Exception Handler]
    }
    
    component "Request/Response" as RequestResponse {
        [DTOs (Request/Response)]
        [Validation Annotations]
        [Error Responses]
    }
}

package "Business Logic Layer (Services)" <<folder>> #SERVICE {
    component "Core Services" as CoreServices {
        [AuthenticationService]
        [CongeService]
        [EmployeeLeaveService]
        [LeaveCalculationService]
        [WorkflowService]
    }
    
    component "Configuration Services" as ConfigServices {
        [CountryPolicyService]
        [HolidayService]
        [ScheduleService]
        [ExceptionalLeaveService]
    }
    
    component "Integration Services" as IntegServices {
        [DolibarrSyncService]
        [DolibarrAuthService]
    }
    
    component "Supporting Services" as SupportServices {
        [EmailNotificationService]
        [ReportGenerationService]
        [FileStorageService]
        [HistoryAuditService]
    }
}

package "Data Access Layer (Repositories)" <<folder>> #REPOSITORY {
    component "JPA Repositories" as JpaRepos {
        [UserRepository]
        [DemandeCongeRepository]
        [EmployeeLeaveAllocationRepository]
        [LeaveTypeRepository]
        [HolidayRepository]
        [HistoryRepository]
        [WorkflowRepository]
    }
    
    component "ORM Mapping" as ORM {
        [Hibernate ORM]
        [Entity Mapping]
        [Lazy Loading Config]
    }
}

package "Infrastructure Layer" <<folder>> #DB {
    component "Databases" as Databases {
        [MySQL/MariaDB]
        [Connection Pool (HikariCP)]
    }
    
    component "External Services" as ExternalSvc {
        [Dolibarr REST API]
        [SMTP Mail Server]
        [File System (Attachments)]
    }
}

package "Cross-Cutting Concerns" <<folder>> #EXTERNAL {
    component "Logging & Monitoring" as LogMon {
        [SLF4J Logging]
        [Audit Trail]
        [Performance Metrics]
    }
    
    component "Configuration" as Config {
        [application.yml]
        [JWT Secret]
        [Dolibarr API Key]
        [Country Rules Config]
    }
}

' Relationships
Pages --> Components
Components --> StateMan
Pages --> StateMan
StateMan --> FEServices
FEServices --|> Controllers : HTTP/HTTPS

Controllers --|> APISecurity
Controllers --> RequestResponse
Controllers --> CoreServices
Controllers --> ConfigServices
Controllers --> IntegServices
Controllers --> SupportServices

CoreServices --> ConfigServices
CoreServices --> JpaRepos
CoreServices --> IntegServices
CoreServices --> SupportServices

ConfigServices --> JpaRepos
IntegServices --> ExternalSvc

SupportServices --> JpaRepos
SupportServices --> Databases
SupportServices --> ExternalSvc

JpaRepos --> ORM
ORM --> Databases

CoreServices -.-> LogMon
APISecurity -.-> LogMon

IntegServices -.-> Config

@enduml
```

---

## 9. DIAGRAMME DE CAS D'UTILISATION PAR SPRINT

### Sprint 1 — Authentification, Sécurité & Socle

```plantuml
@startuml Sprint1_UC
left to right direction
actor "Utilisateur" as User

rectangle "Sprint 1 : Auth & Fondation" {
    usecase "S'authentifier\nvia Dolibarr (JWT)" as UC_Auth
    usecase "Créer compte utilisateur\nsi absent" as UC_CreateUser
    usecase "Contrôler accès\npar rôle (EMPLOYE/RH)" as UC_RBAC
    usecase "Sécuriser API REST\n(JWT Filter)" as UC_SecureAPI
    usecase "Se déconnecter\nproprement" as UC_Logout
    usecase "Initialiser Base\nde Données" as UC_InitDB
    usecase "Configurer Dolibarr\nIntegration" as UC_ConfigDol
}

User --> UC_Auth
UC_Auth --> UC_CreateUser
UC_Auth --> UC_RBAC
UC_Auth --> UC_SecureAPI
UC_Auth --> UC_Logout
UC_InitDB -.-> UC_Auth
UC_ConfigDol -.-> UC_Auth

@enduml
```

### Sprint 2 — Demandes Côté Employé

```plantuml
@startuml Sprint2_UC
left to right direction
actor "Employé" as Emp

rectangle "Sprint 2 : Demandes Employé" {
    usecase "Créer demande\n(type, dates, motif)" as UC_Create
    usecase "Calculer jours\nouvrables\n(pays + fériés)" as UC_CalcDays
    usecase "Consulter solde\nde congés" as UC_Balance
    usecase "Consulter historique\nfiltré" as UC_History
    usecase "Annuler demande\nen attente" as UC_Cancel
    usecase "Suivre statut\n(En attente / Approuvé / Rejeté)" as UC_Track
}

Emp --> UC_Create
UC_Create -.-> UC_CalcDays
UC_Create -.-> UC_Balance
Emp --> UC_History
Emp --> UC_Cancel
Emp --> UC_Track

@enduml
```

### Sprint 3 — Validation RH & Workflow BPM

```plantuml
@startuml Sprint3_UC
left to right direction
actor "RH" as RH

rectangle "Sprint 3 : Validation & Workflow" {
    usecase "Valider/Rejeter\ndemande" as UC_Approve
    usecase "Consulter tableau\nde bord RH\n(stats)" as UC_Dashboard
    usecase "Configurer workflow\nBPM par pays" as UC_ConfigWF
    usecase "Tracer actions\n(audit trail)" as UC_Audit
    usecase "Configurer jours\nfériés\n(TN/MA/FR)" as UC_ConfigHol
}

RH --> UC_Approve
RH --> UC_Dashboard
RH --> UC_ConfigWF
RH --> UC_Audit
RH --> UC_ConfigHol
UC_Approve -.-> UC_Audit
UC_ConfigHol -.-> UC_Approve

@enduml
```

### Sprint 4 — Intégration Dolibarr & Config RH

```plantuml
@startuml Sprint4_UC
left to right direction
actor "RH" as RH

rectangle "Sprint 4 : Intégration & Config" {
    usecase "Gérer soldes\nemployés" as UC_Balances
    usecase "Configurer congés\nexceptionnels\npar pays" as UC_ConfigExcept
    usecase "Configurer horaires\n(Normal/Été/Ramadan)" as UC_ConfigSched
    usecase "Visualiser calendrier\nRH global" as UC_Calendar
    usecase "Exporter\nPDF/Excel" as UC_Export
    usecase "Synchroniser\nDolibarr\n(employés, soldes,\ncongés validés)" as UC_Sync
    usecase "Gérer cohérence\ndonnées" as UC_DataConsist
    usecase "Notifications email\n(approbation/rejet)" as UC_Email
}

RH --> UC_Balances
RH --> UC_ConfigExcept
RH --> UC_ConfigSched
RH --> UC_Calendar
RH --> UC_Export
RH --> UC_Sync
RH --> UC_DataConsist
RH --> UC_Email
UC_Sync -.-> UC_DataConsist

@enduml
```

### Sprint 5 — IA & Finalisation

```plantuml
@startuml Sprint5_UC
left to right direction
actor "Employé" as Emp
actor "RH" as RH

rectangle "Sprint 5 : IA & Finalisation" {
    usecase "Demander\nautorisation 2h\n(TN/MA)" as UC_Auth2h
    usecase "Demander RTT\n(FR)" as UC_RTT
    usecase "Demander congé\nexceptionnel" as UC_Except
    usecase "Joindre\njustificatif" as UC_Attach
    usecase "Suggestion\nintelligente\nde dates" as UC_Suggest
    usecase "Score d'impact\norganisationnel" as UC_Score
    usecase "Détecter conflits\nd'absence" as UC_Conflict
    usecase "Prévoir tendances\nd'absences" as UC_Forecast
    usecase "Interface\nresponsive & UX" as UC_UX
    usecase "Tests\nintégration E2E" as UC_Testing
}

Emp --> UC_Auth2h
Emp --> UC_RTT
Emp --> UC_Except
Emp --> UC_Attach
Emp --> UC_UX

RH --> UC_Suggest
RH --> UC_Score
RH --> UC_Conflict
RH --> UC_Forecast
RH --> UC_UX

UC_Suggest -.-> UC_Score
UC_Conflict -.-> UC_Suggest

@enduml
```

---

## 10. TABLEAU RÉCAPITULATIF DES DIAGRAMMES

| ID | Diagramme | Type | Éléments | Fichier PlantUML |
|----|-----------|------|----------|------------------|
| 1 | Cas d'utilisation — Vue globale | Use Case | 2 acteurs + Dolibarr + Système e-mail · généralisation + «include»/«extend» | UC_Global |
| 1a | Cas d'utilisation — Package Employé | Use Case | Employé + Système e-mail · généralisation + «include»/«extend» | UC_Package_Employe |
| 1b | Cas d'utilisation — Package RH | Use Case | RH + Dolibarr + Système e-mail · généralisation + «include»/«extend» | UC_Package_RH |
| 2 | Modèle de données | Class | 15+ entités + énums + relations | ClassDiagram |
| 3 | Créer demande de congé | Sequence | 6 participants + calcul jours | Sequence_CreateRequest |
| 4 | Valider demande (multi-pays) | Sequence | 7 participants + règles pays | Sequence_ValidateRequest |
| 5 | Authentification Dolibarr | Sequence | 6 participants + JWT | Sequence_Auth |
| 6 | Déploiement | Deployment | 5 nœuds + 3 BD + services externes | DeploymentDiagram |
| 7 | Activité workflow | Activity | 15 décisions métier + approbation | ActivityDiagram_LeaveWorkflow |
| 8 | Composants (couches) | Component | 8 packages + 30+ composants | ComponentDiagram |
| 9 | Sprint 1 UC | Use Case | 6 UC (Auth + base) | Sprint1_UC |
| 10 | Sprint 2 UC | Use Case | 6 UC (Demandes employé) | Sprint2_UC |
| 11 | Sprint 3 UC | Use Case | 5 UC (Validation + Workflow) | Sprint3_UC |
| 12 | Sprint 4 UC | Use Case | 8 UC (Intégration) | Sprint4_UC |
| 13 | Sprint 5 UC | Use Case | 10 UC (IA + finition) | Sprint5_UC |

---

## CONVERSION EN IMAGES

Pour convertir chaque diagramme PlantUML en image PNG/SVG, utilisez l'un de ces outils :

### Option 1 : Convertisseur en ligne
- **PlantUML Online Editor** : https://www.plantuml.com/plantuml/uml/
- Copier-coller le code PlantUML → Télécharger en PNG/SVG

### Option 2 : Command-line (avec Java installé)
```bash
# Télécharger plantuml.jar
java -jar plantuml.jar DIAGRAMMES_UML_COMPLETS.md -o output_folder/

# Résultat : PNG dans output_folder/
```

### Option 3 : VS Code Extension
- Installer "PlantUML" extension
- Ouvrir le fichier `.md` → Right-click → "Preview Diagram"
- Export to PNG

---

**Fin des diagrammes UML — Tous 100% fidèles au code réel du projet**
