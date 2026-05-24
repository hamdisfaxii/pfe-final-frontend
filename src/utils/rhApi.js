import api from "./api";
import { normalizeCountryIsoForHr } from "./country";

/** Normalise un statut brut vers une clé canonique (PENDING / APPROVED / REJECTED). */
export function normalizeStatus(raw) {
  const s = String(raw ?? "").trim().toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (s.includes("ATTENTE") || s.includes("PENDING")) return "PENDING";
  if (s.includes("APPROUV") || s.includes("ACCEPTE") || s.includes("APPROVED")) return "APPROVED";
  if (s.includes("REJET") || s.includes("REFUS") || s.includes("REJECTED")) return "REJECTED";
  return s || "UNKNOWN";
}

/** Normalise une demande RH vers le format attendu par l'UI. */
const normalizeRequest = (row) => {
  const emp = row.employe ?? row.employee ?? row.user ?? row.userDetails ?? {};
  const rawApprover = row.approuvePar ?? row.approvedBy ?? null;
  const approver = typeof rawApprover === "string" ? { email: rawApprover } : rawApprover;
  const fullName = emp.fullName ??
    ([emp.prenom, emp.nom].filter(Boolean).join(" ") ||
     [emp.firstName, emp.lastName].filter(Boolean).join(" ")) ?? "";

  return {
    id: row.id,
    typeConge: row.typeConge,
    statut: normalizeStatus(row.statut),
    rawStatus: row.statut,
    dateDebut: row.dateDebut,
    dateFin: row.dateFin,
    nombreJours: row.nombreJours,
    nombreJoursExact: row.nombreJoursExact ?? row.joursExact ?? null,
    startHalfDay: row.startHalfDay ?? null,
    endHalfDay: row.endHalfDay ?? null,
    motif: row.raison ?? row.motif ?? "",
    commentaireRh: row.commentaireRh ?? "",
    dateSoumission: row.dateCreation ?? row.dateSoumission ?? null,
    dateDecision: row.dateDecision ?? row.dateAcceptation ?? null,
    heureDebut: row.heureDebut ?? row.heureArrivee ?? null,
    heureFin: row.heureFin ?? null,
    approuvePar: approver,
    employe: {
      id: row.userId ?? emp.id ?? emp.userId ?? null,
      nom: emp.nom ?? emp.lastName ?? fullName.split(" ").slice(1).join(" ") ?? "",
      prenom: emp.prenom ?? emp.firstName ?? fullName.split(" ")[0] ?? "",
      email: emp.email ?? emp.mail ?? emp.username ?? "",
      country: emp.country ?? emp.pays ?? "",
      department: emp.department ?? emp.departement ?? "",
    },
    historique: row.historique ?? [],
  };
};

const normalizeAdminUser = (user) => {
  const raw = user ?? {};
  const fullName = raw.name ?? raw.fullName ??
    ([raw.prenom, raw.nom].filter(Boolean).join(" ") ||
     [raw.firstName, raw.lastName].filter(Boolean).join(" ") ||
     (raw.email ?? raw.username ?? ""));
  return {
    id: raw.id ?? raw.userId ?? raw.approuveParId ?? raw.adminId ?? null,
    name: fullName,
    email: raw.email ?? raw.mail ?? raw.username ?? raw.login ?? "",
    prenom: raw.prenom ?? raw.firstName ?? "",
    nom: raw.nom ?? raw.lastName ?? "",
    raw,
  };
};

// ─── Dashboard & statistiques ────────────────────────────────────────────────

export async function getHrStats() {
  const { data } = await api.get("/rh/dashboard");
  const leg = data?.statistiques ?? {};
  const raw = data?.demandesParStatut ?? {};

  const pick = (...keys) => {
    for (const k of keys) {
      const n = Number(k);
      if (Number.isFinite(n)) return n;
    }
    return 0;
  };

  const pending  = pick(data?.demandesEnAttente, leg?.en_attente, raw?.EN_ATTENTE);
  const approved = pick(data?.demandesAcceptees, leg?.approuvees, raw?.ACCEPTE);
  const rejected = pick(data?.demandesRefusees, leg?.rejetees, raw?.REFUSE);
  return { pending, approved, rejected, total: pending + approved + rejected };
}

// ─── Demandes RH ─────────────────────────────────────────────────────────────

export async function getHrRequests(filters = {}) {
  const params = {};
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.employee)   params.employee   = filters.employee;
  if (filters.country)    params.country    = filters.country;
  if (filters.department) params.department = filters.department;
  if (filters.startDate)  params.startDate  = filters.startDate;
  if (filters.endDate)    params.endDate    = filters.endDate;

  const { data } = await api.get("/rh/requests", { params });
  const list = data?.requests ?? data ?? [];
  return Array.isArray(list) ? list.map(normalizeRequest) : [];
}

export async function getHrRequestById(id) {
  const { data } = await api.get(`/rh/requests/${id}`);
  return normalizeRequest(data);
}

export async function decideHrRequest(id, action, comment) {
  const { data } = await api.post(`/rh/requests/${id}/decision`, { action, comment });
  return data;
}

export async function getSuperAdmins() {
  try {
    const { data } = await api.get("/hr/admins");
    const rows = Array.isArray(data) ? data
      : Array.isArray(data?.admins) ? data.admins
      : Array.isArray(data?.data)   ? data.data : [];
    return rows.map(normalizeAdminUser);
  } catch {
    return [];
  }
}

// ─── Calendrier ──────────────────────────────────────────────────────────────

export async function getCalendarEvents(filters = {}) {
  const params = {};
  if (filters.employeeId) params.employeeId = filters.employeeId;
  if (filters.department) params.department = filters.department;
  if (filters.country)    params.country    = filters.country;
  if (filters.startDate)  params.startDate  = filters.startDate;
  if (filters.endDate)    params.endDate    = filters.endDate;
  try {
    const { data } = await api.get("/calendar/events", { params });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ─── Configuration RH ────────────────────────────────────────────────────────

export async function getHrConfiguration() {
  const [workflow, country, leaveTypes, integration] = await Promise.all([
    api.get("/hr-config/workflow-rules"),
    api.get("/hr-config/country-rules"),
    api.get("/hr-config/leave-types"),
    api.get("/hr-config/integration-settings"),
  ]);
  return {
    workflowRules: workflow.data ?? [],
    countryRules:  country.data ?? [],
    leaveTypes:    leaveTypes.data ?? [],
    integration:   integration.data ?? {},
  };
}

export async function getExceptionalLeaves(countryCode) {
  const { data } = await api.get("/hr-config/exceptional-leaves", {
    params: { country: String(countryCode || "TN").toUpperCase() },
  });
  return Array.isArray(data) ? data : [];
}

export async function createExceptionalLeave(payload) {
  const { data } = await api.post("/hr-config/exceptional-leaves", payload);
  return data;
}

export async function updateExceptionalLeave(id, payload) {
  const { data } = await api.put(`/hr-config/exceptional-leaves/${id}`, payload);
  return data;
}

export async function deleteExceptionalLeave(id) {
  const { data } = await api.delete(`/hr-config/exceptional-leaves/${id}`);
  return data ?? {};
}

// ─── Jours fériés ────────────────────────────────────────────────────────────

export async function getPublicHolidays(countryCode, year) {
  const { data } = await api.get("/hr-config/public-holidays", {
    params: { country: String(countryCode || "TN").toUpperCase(), year: Number(year) },
  });
  return Array.isArray(data) ? data : [];
}

export async function importPublicHolidays(countryCode, year) {
  const { data } = await api.post("/hr-config/public-holidays/import", {}, {
    params: { country: String(countryCode || "TN").toUpperCase(), year: Number(year) },
  });
  return data;
}

export async function importPublicHolidaysAllCountries(year) {
  const { data } = await api.post("/hr-config/public-holidays/import-all", {}, {
    params: { year: Number(year) },
  });
  return data;
}

export async function createPublicHoliday(payload) {
  const { data } = await api.post("/hr-config/public-holidays", payload);
  return data;
}

export async function updatePublicHoliday(id, payload) {
  const { data } = await api.put(`/hr-config/public-holidays/${id}`, payload);
  return data;
}

export async function applyPublicHoliday(id, applied) {
  const { data } = await api.put(`/hr-config/public-holidays/${id}/apply`, {}, {
    params: { applied: Boolean(applied) },
  });
  return data;
}

export async function deletePublicHoliday(id) {
  const { data } = await api.delete(`/hr-config/public-holidays/${id}`);
  return data;
}

export async function bulkDeletePublicHolidays(ids) {
  const { data } = await api.delete("/hr-config/public-holidays/bulk", { data: ids });
  return data;
}

export async function bulkApplyPublicHolidays(ids, applied) {
  const { data } = await api.put("/hr-config/public-holidays/bulk/apply", { ids, applied });
  return data;
}

// ─── Planning de travail ──────────────────────────────────────────────────────

export async function getWorkSchedules(countryCode, scheduleType = "NORMAL") {
  const { data } = await api.get("/hr-config/work-schedules", {
    params: { country: normalizeCountryIsoForHr(countryCode), type: scheduleType },
  });
  return data ?? {};
}

export async function getActiveWorkSchedule(countryCode) {
  const country = normalizeCountryIsoForHr(countryCode);
  const { data: first } = await api.get("/hr-config/work-schedules", {
    params: { country, type: "NORMAL" },
  });
  const activeType = String(first.activeType || "NORMAL").toUpperCase();
  if (String(first.scheduleType || "NORMAL").toUpperCase() === activeType) {
    return { ...first, activeType };
  }
  const { data: second } = await api.get("/hr-config/work-schedules", {
    params: { country, type: activeType },
  });
  return { ...second, activeType };
}

export async function saveWorkSchedules(payload) {
  const { data } = await api.put("/hr-config/work-schedules", payload);
  return data;
}

// ─── Contrat employé (RTT France) ────────────────────────────────────────────

export async function patchEmployeeContract(userId, payload) {
  const { data } = await api.patch(
    `/hr-config/employees/${userId}/contract`,
    payload,
  );
  return data;
}

// ─── Pièces jointes ──────────────────────────────────────────────────────────

export async function uploadDemandeAttachment(demandeId, file) {
  const formData = new FormData();
  formData.append("pieceJointe", file);
  const { data } = await api.post(`/conge/${demandeId}/attachment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
