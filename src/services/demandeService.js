/**
 * Service d'accès à l'API Spring Boot pour les demandes de congé (employé).
 * Toutes les fonctions retournent des Promises et propagent les erreurs Axios.
 */
import api from "../utils/api";
import { buildSoldeSummary } from "../hooks/useDemandes";

export async function getSolde() {
  const { data } = await api.get("/conge/solde");
  return buildSoldeSummary(data);
}

export async function getWorkSchedule() {
  const { data } = await api.get("/conge/meta/work-schedule");
  return data;
}

export async function listDemandes(filters = {}) {
  const params = {};
  if (filters.annee && filters.annee !== "tous") params.annee = filters.annee;
  if (filters.statut && filters.statut !== "tous") params.statut = filters.statut;
  const { data } = await api.get("/conge/liste", { params });
  const list = data?.demandes ?? data?.data ?? data;
  return Array.isArray(list) ? list : [];
}

export async function getDemandeById(id) {
  const { data } = await api.get(`/conge/${id}`);
  return data;
}

export async function creerDemande(payload) {
  const { data } = await api.post("/conge", payload);
  return data?.demande ?? data;
}

export async function annulerDemande(id) {
  const { data } = await api.put(`/conge/${id}/annuler`);
  return data;
}

export async function uploadAttachment(demandeId, file) {
  const formData = new FormData();
  formData.append("pieceJointe", file);
  const { data } = await api.post(`/conge/${demandeId}/attachment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
