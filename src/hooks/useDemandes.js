import { useCallback, useMemo, useState } from "react";
import api from "../utils/api";

/** Normalise un statut brut (accents, espaces, variantes) vers une clé canonique ASCII. */
const normalizeStatut = (statut) => {
  if (!statut || statut === "tous") return undefined;
  const s = String(statut)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  if (s === "en_attente" || s === "enattente" || s === "attente") return "attente";
  if (s === "validee" || s === "accordee") return "validee";
  if (s === "refusee" || s === "refuse") return "refusee";
  if (s === "annulee" || s === "annule") return "annulee";
  return s;
};

/** Retourne true si la demande couvre au moins un jour de l'année civile indiquée. */
const demandeCroiseAnnee = (d, annee) => {
  if (annee == null || annee === "" || String(annee) === "tous") return true;
  const y = Number(annee);
  if (!Number.isFinite(y)) return true;
  const deb = String(d?.dateDebut ?? "").slice(0, 10);
  const fin = String(d?.dateFin ?? "").slice(0, 10);
  if (!deb || !fin) return false;
  return deb <= `${y}-12-31` && fin >= `${y}-01-01`;
};

/** Identifiant universel d'une demande (gère les variantes de nommage). */
export const pickId = (demande) => demande?.id ?? demande?._id ?? demande?.ID;

/**
 * Interprète la réponse brute de GET /api/conge/solde et retourne un objet
 * normalisé utilisable par les composants.
 */
export function buildSoldeSummary(payload) {
  if (payload === null || payload === undefined) {
    return {
      congesPayes: 0, permission: 0, maladie: 0,
      maladieQuotaReference: null, maladieNonDecompte: true,
      maladieMessage: "Congé maladie : suivi hors quota selon vos règles RH.",
      hintCongesPayes: "", details: [], soldeTotalTousTypes: null,
      autorisationsCourtesMoisMaximum: null, autorisationsCourtesMoisUtilisees: null,
      autorisationsCourtesMoisAcceptees: null, autorisationsCourtesMoisRestantes: null,
      franceRtt: null,
    };
  }
  if (typeof payload !== "object" || Array.isArray(payload)) {
    const n = Number(payload);
    return {
      congesPayes: Number.isFinite(n) ? Math.max(0, n) : 0,
      permission: 0, maladie: 0, maladieQuotaReference: null,
      maladieNonDecompte: true, maladieMessage: "",
      hintCongesPayes: "", details: [], soldeTotalTousTypes: null,
      autorisationsCourtesMoisMaximum: null, autorisationsCourtesMoisUtilisees: null,
      autorisationsCourtesMoisAcceptees: null, autorisationsCourtesMoisRestantes: null,
      franceRtt: null,
    };
  }

  const pickJoursDetails = (details, typeEnum) => {
    if (!Array.isArray(details)) return null;
    const row = details.find((d) => d && String(d.typeConge) === typeEnum);
    if (!row || row.joursRestants == null || row.joursRestants === "") return null;
    const n = Number(row.joursRestants);
    return Number.isFinite(n) ? Math.max(0, n) : null;
  };

  const data = payload;
  const cp = Number(
    data.soldeCongesPayes ??
      pickJoursDetails(data.details, "PAYE") ??
      data.solde ?? data.reste ?? 0,
  );
  const rawFrRem = data.franceRtt != null ? Number(data.franceRtt.rtt_remaining) : NaN;
  const perm = Number.isFinite(rawFrRem)
    ? Math.max(0, rawFrRem)
    : Number(
        data.soldeCourteDureeExact ?? data.soldeCourteDuree ?? data.soldePermission ??
          pickJoursDetails(data.details, "COURTE_DUREE") ?? 0,
      );

  let maladieNum = 0;
  if (data.soldeMaladie != null && data.soldeMaladie !== "") {
    const nMal = Number(data.soldeMaladie);
    maladieNum = Number.isFinite(nMal) ? Math.max(0, nMal) : 0;
  } else {
    const picked = pickJoursDetails(data.details, "MALADIE");
    maladieNum = picked != null && Number.isFinite(Number(picked)) ? Math.max(0, Number(picked)) : 0;
  }

  const malQuotaRef = data.maladieQuotaReference != null && data.maladieQuotaReference !== ""
    ? Number(data.maladieQuotaReference) : null;
  const maladieNonDecompte = typeof data.maladieNonDecompte === "boolean"
    ? data.maladieNonDecompte
    : Number.isFinite(malQuotaRef) ? malQuotaRef <= 0 : false;
  const maladieMessage = (typeof data.messageMaladie === "string" ? data.messageMaladie.trim() : "") ||
    (maladieNonDecompte ? "Congé maladie défini hors quota : il ne diminue pas vos congés payés." : "");

  let soldeTotalTousTypes = data.soldeTotalTousTypes != null ? Number(data.soldeTotalTousTypes) : null;
  if (!Number.isFinite(soldeTotalTousTypes)) soldeTotalTousTypes = null;

  const authMaxRaw = data.autorisationsCourtesMoisMaximum;
  const authMaxNum = authMaxRaw != null && authMaxRaw !== "" && Number.isFinite(Number(authMaxRaw))
    ? Math.max(0, Number(authMaxRaw)) : null;

  const franceRtt = data.franceRtt && typeof data.franceRtt === "object" && !Array.isArray(data.franceRtt)
    ? {
        total: Number(data.franceRtt.rtt_total),
        used: Number(data.franceRtt.rtt_used),
        remaining: Number(data.franceRtt.rtt_remaining),
        pending: Number(data.franceRtt.rtt_pending),
        accrualMode: data.franceRtt.rtt_accrual_mode,
        lastUpdate: data.franceRtt.last_rtt_update,
      }
    : null;

  return {
    congesPayes: Number.isFinite(cp) ? Math.max(0, cp) : 0,
    permission: Number.isFinite(perm) ? Math.max(0, perm) : 0,
    maladie: maladieNum,
    maladieQuotaReference: malQuotaRef !== null && Number.isFinite(malQuotaRef) ? malQuotaRef : undefined,
    maladieNonDecompte,
    maladieMessage,
    hintCongesPayes: typeof data.hintCongesPayes === "string" ? data.hintCongesPayes : "",
    details: Array.isArray(data.details) ? data.details : [],
    soldeTotalTousTypes,
    autorisationsCourtesMoisMaximum: authMaxNum,
    autorisationsCourtesMoisUtilisees: Number.isFinite(Number(data.autorisationsCourtesMoisUtilisees))
      ? Math.max(0, Number(data.autorisationsCourtesMoisUtilisees)) : null,
    autorisationsCourtesMoisAcceptees: Number.isFinite(Number(data.autorisationsCourtesMoisAcceptees))
      ? Math.max(0, Number(data.autorisationsCourtesMoisAcceptees)) : null,
    autorisationsCourtesMoisRestantes: Number.isFinite(Number(data.autorisationsCourtesMoisRestantes))
      ? Math.max(0, Number(data.autorisationsCourtesMoisRestantes)) : null,
    franceRtt,
  };
}

export default function useDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [solde, setSolde] = useState(null);
  const [soldeSummary, setSoldeSummary] = useState(null);
  const [demandeDetail, setDemandeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSolde = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/conge/solde");
      const summary = buildSoldeSummary(data);
      setSoldeSummary(summary);
      setSolde(summary.congesPayes);
      return summary;
    } catch (e) {
      setSoldeSummary(null);
      setSolde(null);
      setError("Impossible de récupérer le solde.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDemandes = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.annee && filters.annee !== "tous") params.annee = filters.annee;
      if (filters.statut && filters.statut !== "tous") params.statut = normalizeStatut(filters.statut);

      const { data } = await api.get("/conge/liste", { params });
      const list = Array.isArray(data?.demandes ?? data?.data ?? data)
        ? (data?.demandes ?? data?.data ?? data)
        : [];

      const filtered = filters.annee && filters.annee !== "tous"
        ? list.filter((d) => demandeCroiseAnnee(d, filters.annee))
        : list;

      setDemandes(filtered);
      return filtered;
    } catch (e) {
      setError("Impossible de récupérer la liste des demandes.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDemandeById = useCallback(async (id) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/conge/${id}`);
      setDemandeDetail(data ?? null);
      return data;
    } catch (e) {
      setError("Impossible de récupérer le détail de la demande.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const creerDemande = useCallback(async (data) => {
    setLoading(true);
    setError("");
    try {
      const isSortie = data?.type === "sortie";
      const isRetard = data?.type === "retard";
      const titre = data?.titre ?? (isSortie ? "Sortie courte durée" : isRetard ? "J'arrive en retard" : (data?.typeConge ?? "Congé payé"));
      const dateDebut = isSortie ? (data?.dateDebut ?? data?.dateSortie) : isRetard ? (data?.date ?? data?.dateDebut) : data?.dateDebut;
      const dateFin = isSortie ? (data?.dateFin ?? data?.dateSortie) : isRetard ? (data?.date ?? data?.dateDebut) : data?.dateFin;

      const payload = {
        titre,
        dateDebut,
        dateFin,
        commentaire: data?.commentaire ?? data?.motif ?? "",
        heureDebut: isRetard ? (data?.heureArrivee ?? null) : (data?.heureDebut ?? null),
        heureFin: data?.heureFin ?? null,
        startHalfDay: data?.startHalfDay ?? null,
        endHalfDay: data?.endHalfDay ?? null,
        demandeSortieCourte: Boolean(isSortie),
        approvedByAdminId: data?.approvedByAdminId ?? data?.approuveParId ?? null,
        exceptionalLeaveConfigId: data?.exceptionalLeaveConfigId ?? null,
      };

      const { data: res } = await api.post("/conge", payload);
      return res?.demande ?? res;
    } catch (e) {
      const msg = e?.response?.data?.message ?? e?.response?.data?.error ??
        (typeof e?.response?.data === "string" ? e.response.data : null);
      setError(msg || "Impossible de créer la demande.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const annulerDemande = useCallback(async (id) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.put(`/conge/${id}/annuler`);
      return data;
    } catch (e) {
      setError("Impossible d'annuler la demande.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      demandes, solde, soldeSummary, demandeDetail, loading, error,
      fetchSolde, fetchDemandes, fetchDemandeById, creerDemande, annulerDemande, pickId,
    }),
    [demandes, solde, soldeSummary, demandeDetail, loading, error,
      fetchSolde, fetchDemandes, fetchDemandeById, creerDemande, annulerDemande],
  );
}
