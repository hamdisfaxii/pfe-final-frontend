/**
 * Service d'accès à l'API Spring Boot pour le module RH.
 * Toutes les fonctions retournent des Promises et propagent les erreurs Axios.
 */
import api from "../utils/api";

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboard() {
  const { data } = await api.get("/rh/dashboard");
  return data;
}

// ─── Demandes RH ─────────────────────────────────────────────────────────────

export async function listRequests(filters = {}) {
  const params = {};
  if (filters.status && filters.status !== "ALL") params.status = filters.status;
  if (filters.employee)   params.employee   = filters.employee;
  if (filters.country)    params.country    = filters.country;
  if (filters.department) params.department = filters.department;
  if (filters.startDate)  params.startDate  = filters.startDate;
  if (filters.endDate)    params.endDate    = filters.endDate;
  const { data } = await api.get("/rh/requests", { params });
  const list = data?.requests ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

export async function getRequestById(id) {
  const { data } = await api.get(`/rh/requests/${id}`);
  return data;
}

export async function processDecision(id, action, comment) {
  const { data } = await api.post(`/rh/requests/${id}/decision`, { action, comment });
  return data;
}

export async function getStats() {
  const { data } = await api.get("/rh/requests/stats");
  return data;
}

// ─── Soldes employés ─────────────────────────────────────────────────────────

export async function getEmployeeBalances(filters = {}) {
  const { data } = await api.get("/hr/leave-balances", { params: filters });
  return data;
}

// ─── Configuration ───────────────────────────────────────────────────────────

export async function getLeaveTypes() {
  const { data } = await api.get("/hr-config/leave-types");
  return Array.isArray(data) ? data : [];
}

export async function createLeaveType(payload) {
  const { data } = await api.post("/hr-config/leave-types", payload);
  return data;
}

export async function updateLeaveType(id, payload) {
  const { data } = await api.put(`/hr-config/leave-types/${id}`, payload);
  return data;
}

export async function deleteLeaveType(id) {
  await api.delete(`/hr-config/leave-types/${id}`);
}

export async function getCountryRules() {
  const { data } = await api.get("/hr-config/country-rules");
  return data;
}

export async function updateCountryRule(payload) {
  const { data } = await api.put("/hr-config/country-rules", payload);
  return data;
}

export async function getWorkflowRules() {
  const { data } = await api.get("/hr-config/workflow-rules");
  return data;
}

// ─── Jours fériés ────────────────────────────────────────────────────────────

export async function getPublicHolidays(countryCode, year) {
  const { data } = await api.get("/hr-config/public-holidays", {
    params: { country: String(countryCode || "TN").toUpperCase(), year: Number(year) },
  });
  return Array.isArray(data) ? data : [];
}

export async function createPublicHoliday(payload) {
  const { data } = await api.post("/hr-config/public-holidays", payload);
  return data;
}

export async function updatePublicHoliday(id, payload) {
  const { data } = await api.put(`/hr-config/public-holidays/${id}`, payload);
  return data;
}

export async function deletePublicHoliday(id) {
  await api.delete(`/hr-config/public-holidays/${id}`);
}

export async function importHolidays(countryCode, year) {
  const { data } = await api.post("/hr-config/public-holidays/import", {}, {
    params: { country: String(countryCode || "TN").toUpperCase(), year: Number(year) },
  });
  return data;
}
