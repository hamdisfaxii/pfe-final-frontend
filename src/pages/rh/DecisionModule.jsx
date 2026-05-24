import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/authcontext";
import Spinner from "../../components/commun/Spinner";
import { libelleAffichageTypeConge } from "../../utils/country";

const formatStatus = (raw) => {
  const s = String(raw ?? "").trim().toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (s.includes("ATTENTE") || s.includes("PENDING")) return "PENDING";
  if (s.includes("ACCEPTE") || s.includes("APPROUVE") || s.includes("APPROVED")) return "APPROVED";
  if (s.includes("REFUSE") || s.includes("REJET") || s.includes("REJECTED")) return "REJECTED";
  return s || "UNKNOWN";
};

const statusBadgeClass = (status) => {
  if (status === "PENDING")  return "bg-amber-100 text-amber-800";
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-800";
  if (status === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-700";
};

const statusLabel = (status) => {
  if (status === "PENDING")  return "EN ATTENTE";
  if (status === "APPROVED") return "APPROUVÉ";
  if (status === "REJECTED") return "REJETÉ";
  return status;
};

export default function DecisionModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);

  const [filters, setFilters] = useState({
    employee: "", country: "", department: "", startDate: "", endDate: "",
  });

  const [modal, setModal] = useState({
    open: false, requestId: null, action: "APPROVE", comment: "", commentError: "",
  });

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.employee.trim())   params.employee   = filters.employee.trim();
      if (filters.country.trim())    params.country    = filters.country.trim();
      if (filters.department.trim()) params.department = filters.department.trim();
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate)   params.endDate   = filters.endDate;

      const { data } = await api.get("/rh/requests/pending", { params });
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Impossible de charger les demandes en attente.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const closeModal = () =>
    setModal({ open: false, requestId: null, action: "APPROVE", comment: "", commentError: "" });

  const activeRequest = requests.find((row) => String(row.id) === String(modal.requestId));

  const submitDecision = useCallback(async () => {
    if (!modal.requestId) return;
    if (modal.action === "REJECT" && !modal.comment.trim()) {
      setModal((prev) => ({ ...prev, commentError: "Le motif de rejet est obligatoire." }));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(`/rh/requests/${modal.requestId}/decision`, {
        action: modal.action,
        comment: modal.comment || "",
      });
      closeModal();
      await fetchPending();
    } catch (e) {
      setError("Échec de la mise à jour de la demande.");
    } finally {
      setLoading(false);
    }
  }, [fetchPending, modal.action, modal.comment, modal.requestId]);

  const title = useMemo(() => `Décisions RH - ${user?.name || "Responsable RH"}`, [user?.name]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-slate-900 fade-in-up">{title}</h1>
        <p className="mt-3 text-sm text-slate-600 fade-in-up" style={{ animationDelay: "0.05s" }}>
          Gérez les demandes en attente, appliquez les décisions et synchronisez le workflow.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm fade-in-up">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <input value={filters.employee}
              onChange={(e) => setFilters((prev) => ({ ...prev, employee: e.target.value }))}
              placeholder="Employé (nom/email)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={filters.country}
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
              placeholder="Pays (TN/MA/FR)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={filters.department}
              onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
              placeholder="Département"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={fetchPending} disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-lg transition-all">
              Charger les demandes en attente
            </button>
            <button type="button"
              onClick={() => { setFilters({ employee: "", country: "", department: "", startDate: "", endDate: "" }); setRequests([]); }}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all">
              Réinitialiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="text-red-500 mt-0.5">⚠️</div>
              <div className="text-sm font-medium text-red-700">{error}</div>
            </div>
          </div>
        )}

        {loading && requests.length === 0 ? (
          <div className="mt-8"><Spinner size={3} /></div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm fade-in-up">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-900">Employé</th>
                  <th className="p-4 font-semibold text-slate-900">Pays / Département</th>
                  <th className="p-4 font-semibold text-slate-900">Type / Période</th>
                  <th className="p-4 font-semibold text-slate-900">Motif</th>
                  <th className="p-4 font-semibold text-slate-900">Statut</th>
                  <th className="p-4 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Chargement...</td></tr>
                )}
                {!loading && requests.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Aucune demande en attente.</td></tr>
                )}
                {!loading && requests.map((req) => {
                  const status = formatStatus(req.statut);
                  return (
                    <tr key={req.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{req.employe?.prenom} {req.employe?.nom}</div>
                        <div className="text-xs text-slate-500">{req.employe?.email}</div>
                      </td>
                      <td className="p-4 text-slate-700">{(req.employe?.country || "-") + " / " + (req.employe?.department || "-")}</td>
                      <td className="p-4 text-slate-700">
                        <div>{libelleAffichageTypeConge(req.typeConge, req.employe?.country)}</div>
                        <div className="text-xs text-slate-500">{req.dateDebut} → {req.dateFin}</div>
                      </td>
                      <td className="p-4 text-slate-700">{req.motif || "-"}</td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(status)}`}>
                          {statusLabel(status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button type="button"
                            className="rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 hover:shadow-lg transition-all"
                            onClick={() => navigate(`/rh/requests/${req.id}`)}>
                            Détails
                          </button>
                          <button type="button"
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 hover:shadow-lg transition-all"
                            onClick={() => setModal({ open: true, requestId: req.id, action: "APPROVE", comment: "" })}>
                            Approuver
                          </button>
                          <button type="button"
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 hover:shadow-lg transition-all"
                            onClick={() => setModal({ open: true, requestId: req.id, action: "REJECT", comment: "" })}>
                            Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" role="presentation" onClick={closeModal} />
          <div className="relative z-10 flex h-full items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900">
                {modal.action === "APPROVE" ? "Approuver la demande" : "Rejeter la demande"}
              </h3>
              <p className="mt-2 text-sm text-slate-600">Vérifiez les informations avant de décider.</p>

              {activeRequest && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase text-slate-500">Employé</div>
                      <div className="font-semibold text-slate-900">{activeRequest.employe?.prenom} {activeRequest.employe?.nom}</div>
                      <div className="text-xs text-slate-500">{activeRequest.employe?.email}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-slate-500">Pays / Département</div>
                      <div className="text-slate-900">{(activeRequest.employe?.country || "-") + " / " + (activeRequest.employe?.department || "-")}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-slate-500">Type</div>
                      <div className="text-slate-900">{libelleAffichageTypeConge(activeRequest.typeConge, activeRequest.employe?.country)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-slate-500">Période</div>
                      <div className="text-slate-900">{activeRequest.dateDebut} → {activeRequest.dateFin}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs uppercase text-slate-500">Motif</div>
                      <div className="text-slate-900">{activeRequest.motif || "-"}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-700">
                  {modal.action === "REJECT" ? (<>Motif de rejet <span className="text-red-500">*</span></>) : "Commentaire (optionnel)"}
                </label>
                <textarea value={modal.comment}
                  onChange={(e) => setModal((prev) => ({ ...prev, comment: e.target.value, commentError: "" }))}
                  className={`mt-1 min-h-[120px] w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${modal.commentError ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                  placeholder={modal.action === "REJECT" ? "Saisissez le motif de rejet (obligatoire)" : "Commentaire (optionnel)"} />
                {modal.commentError && (
                  <p className="mt-1 text-xs font-medium text-red-600">{modal.commentError}</p>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                  Annuler
                </button>
                <button type="button" onClick={submitDecision} disabled={loading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
