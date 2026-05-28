import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/authcontext";
import { libelleAffichageTypeConge } from "../../utils/country";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  CardContent,
  StatusBadge,
  Spinner,
  Modal,
} from "../../components/ui";

const formatStatus = (raw) => {
  const s = String(raw ?? "").trim().toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (s.includes("ATTENTE") || s.includes("PENDING")) return "PENDING";
  if (s.includes("ACCEPTE") || s.includes("APPROUVE") || s.includes("APPROVED")) return "APPROVED";
  if (s.includes("REFUSE") || s.includes("REJET") || s.includes("REJECTED")) return "REJECTED";
  return s || "UNKNOWN";
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
    isOpen: false, requestId: null, action: "APPROVE", comment: "", commentError: "",
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
    } catch {
      setError("Impossible de charger les demandes en attente.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const closeModal = () =>
    setModal({ isOpen: false, requestId: null, action: "APPROVE", comment: "", commentError: "" });

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
    } catch {
      setError("Échec de la mise à jour de la demande.");
    } finally {
      setLoading(false);
    }
  }, [fetchPending, modal.action, modal.comment, modal.requestId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title="Module de décision"
            description="Traitez les demandes en attente et appliquez vos décisions"
          />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-lg p-md bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-sm"
          >
            <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
            <p className="text-sm text-danger-900">{error}</p>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card variant="default">
            <CardContent className="pt-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-md mb-md">
                <input
                  type="text"
                  value={filters.employee}
                  onChange={(e) => setFilters((prev) => ({ ...prev, employee: e.target.value }))}
                  placeholder="Employé (nom/email)"
                  className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  value={filters.country}
                  onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="Pays (TN/MA/FR)"
                  className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  value={filters.department}
                  onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Département"
                  className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-md flex-wrap">
                <Button variant="primary" onClick={fetchPending} disabled={loading} isLoading={loading}>
                  Charger les demandes
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilters({ employee: "", country: "", department: "", startDate: "", endDate: "" });
                    setRequests([]);
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Requests Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mt-lg">
          {loading && requests.length === 0 ? (
            <div className="flex justify-center py-2xl">
              <Spinner size="lg" />
            </div>
          ) : requests.length === 0 ? (
            <Card variant="default">
              <div className="text-center py-2xl">
                <AlertCircle size={48} className="mx-auto mb-md text-neutral-400" />
                <p className="text-neutral-600 font-medium">Aucune demande en attente.</p>
              </div>
            </Card>
          ) : (
            <Card variant="default">
              <CardContent className="pt-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="text-left p-sm font-semibold text-neutral-900">Employé</th>
                      <th className="text-left p-sm font-semibold text-neutral-900">Pays / Département</th>
                      <th className="text-left p-sm font-semibold text-neutral-900">Type / Période</th>
                      <th className="text-left p-sm font-semibold text-neutral-900">Motif</th>
                      <th className="text-left p-sm font-semibold text-neutral-900">Statut</th>
                      <th className="text-left p-sm font-semibold text-neutral-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const status = formatStatus(req.statut);
                      return (
                        <tr key={req.id} className="border-t border-neutral-200 hover:bg-neutral-50 transition-colors">
                          <td className="p-sm">
                            <p className="font-semibold text-neutral-900">{req.employe?.prenom} {req.employe?.nom}</p>
                            <p className="text-xs text-neutral-500">{req.employe?.email}</p>
                          </td>
                          <td className="p-sm text-neutral-700">
                            {(req.employe?.country || "-") + " / " + (req.employe?.department || "-")}
                          </td>
                          <td className="p-sm text-neutral-700">
                            <p>{libelleAffichageTypeConge(req.typeConge, req.employe?.country)}</p>
                            <p className="text-xs text-neutral-500">{req.dateDebut} → {req.dateFin}</p>
                          </td>
                          <td className="p-sm text-neutral-700">{req.motif || "-"}</td>
                          <td className="p-sm">
                            <StatusBadge statut={status} />
                          </td>
                          <td className="p-sm">
                            <div className="flex gap-sm flex-wrap">
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={Eye}
                                onClick={() => navigate(`/rh/requests/${req.id}`)}
                              >
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                variant="success"
                                icon={CheckCircle2}
                                onClick={() => setModal({
                                  isOpen: true,
                                  requestId: req.id,
                                  action: "APPROVE",
                                  comment: "",
                                  commentError: "",
                                })}
                              >
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                icon={XCircle}
                                onClick={() => setModal({
                                  isOpen: true,
                                  requestId: req.id,
                                  action: "REJECT",
                                  comment: "",
                                  commentError: "",
                                })}
                              >
                                Rejeter
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </ContentWrapper>

      {/* Decision Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.action === "APPROVE" ? "Approuver la demande" : "Rejeter la demande"}
        description="Vérifiez les informations avant de décider."
      >
        {activeRequest && (
          <div className="mt-lg mb-lg rounded-lg border border-neutral-200 bg-neutral-50 p-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                  Employé
                </p>
                <p className="font-semibold text-neutral-900">{activeRequest.employe?.prenom} {activeRequest.employe?.nom}</p>
                <p className="text-xs text-neutral-500">{activeRequest.employe?.email}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                  Pays / Département
                </p>
                <p className="text-neutral-900">
                  {(activeRequest.employe?.country || "-") + " / " + (activeRequest.employe?.department || "-")}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                  Type
                </p>
                <p className="text-neutral-900">
                  {libelleAffichageTypeConge(activeRequest.typeConge, activeRequest.employe?.country)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                  Période
                </p>
                <p className="text-neutral-900">{activeRequest.dateDebut} → {activeRequest.dateFin}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                  Motif
                </p>
                <p className="text-neutral-900">{activeRequest.motif || "-"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-lg">
          <label htmlFor="decision-comment" className="block text-sm font-semibold text-neutral-900 mb-xs">
            {modal.action === "REJECT" ? (
              <>
                Motif de rejet <span className="text-danger-600">*</span>
              </>
            ) : (
              "Commentaire (optionnel)"
            )}
          </label>
          <textarea
            id="decision-comment"
            value={modal.comment}
            onChange={(e) => setModal((prev) => ({ ...prev, comment: e.target.value, commentError: "" }))}
            className={`w-full px-sm py-xs rounded-lg border bg-white text-neutral-900 text-sm min-h-24 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
              modal.commentError
                ? "border-danger-300 focus:ring-danger-500 bg-danger-50"
                : "border-neutral-300 focus:ring-primary-500"
            }`}
            placeholder={
              modal.action === "REJECT"
                ? "Saisissez le motif de rejet (obligatoire)"
                : "Commentaire (optionnel)"
            }
          />
          {modal.commentError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-xs text-xs font-medium text-danger-600">
              {modal.commentError}
            </motion.p>
          )}
        </div>

        <div className="flex gap-md justify-end">
          <Button variant="secondary" onClick={closeModal}>
            Annuler
          </Button>
          <Button
            variant={modal.action === "APPROVE" ? "success" : "danger"}
            onClick={submitDecision}
            disabled={loading}
            isLoading={loading}
          >
            Confirmer
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
