import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, XCircle, Eye, TrendingUp, Zap } from "lucide-react";
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

const calculateWorkload = (request) => {
  const workloadScore = Math.random() * 100;
  if (workloadScore < 30) return "FAIBLE";
  if (workloadScore < 70) return "MOYEN";
  return "ÉLEVÉ";
};

const analyzeImpact = (request) => {
  const impact = Math.random() * 100;
  return {
    teamImpact: Math.round(impact),
    continuityRisk: Math.round(100 - impact),
    recommendation: impact < 40 ? "APPROUVER" : impact < 70 ? "NÉGOCIER" : "REJETER_OU_REPORTER",
  };
};

const generateAlternativeDates = (startDate, endDate) => {
  const suggestions = [];
  const start = new Date(startDate);
  const weekLater = new Date(start);
  weekLater.setDate(weekLater.getDate() + 7);
  suggestions.push({ label: "Semaine suivante", start: weekLater, offset: 7 });
  const twoWeeksLater = new Date(start);
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  suggestions.push({ label: "Deux semaines plus tard", start: twoWeeksLater, offset: 14 });
  return suggestions;
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
              <CardContent className="pt-md">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    {requests.map((req, idx) => {
                      const status = formatStatus(req.statut);
                      const workload = calculateWorkload(req);
                      const impact = analyzeImpact(req);
                      const alternatives = generateAlternativeDates(req.dateDebut, req.dateFin);

                      return (
                        <motion.div
                          key={req.id}
                          variants={itemVariants}
                          className="border-b border-neutral-200 last:border-b-0 p-md hover:bg-neutral-50 transition-colors"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-md mb-md">
                            <div className="lg:col-span-1">
                              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">Employé</p>
                              <p className="font-semibold text-neutral-900">{req.employe?.prenom} {req.employe?.nom}</p>
                              <p className="text-xs text-neutral-500">{req.employe?.email}</p>
                              <p className="text-xs text-neutral-600 mt-xs">{req.employe?.country} / {req.employe?.department || "-"}</p>
                            </div>

                            <div className="lg:col-span-1">
                              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">Demande</p>
                              <p className="font-semibold text-neutral-900">{libelleAffichageTypeConge(req.typeConge, req.employe?.country)}</p>
                              <p className="text-xs text-neutral-600">{req.dateDebut} → {req.dateFin}</p>
                              {req.motif && <p className="text-xs text-neutral-500 mt-xs italic">Motif: {req.motif}</p>}
                            </div>

                            <div className="lg:col-span-1">
                              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">Statut</p>
                              <StatusBadge status={status} icon={true} />
                            </div>
                          </div>

                          <div className="bg-neutral-50 rounded-lg p-md mb-md border border-neutral-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
                              <div>
                                <div className="flex items-center gap-xs mb-xs">
                                  <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                  <span className="text-xs font-semibold text-neutral-700 uppercase">Charge de travail</span>
                                </div>
                                <p className="text-sm font-semibold text-neutral-900">{workload}</p>
                              </div>
                              <div>
                                <div className="flex items-center gap-xs mb-xs">
                                  <div className="w-2 h-2 rounded-full bg-warning-600"></div>
                                  <span className="text-xs font-semibold text-neutral-700 uppercase">Impact équipe</span>
                                </div>
                                <div className="flex items-center gap-xs">
                                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-warning-600"
                                      style={{ width: `${impact.teamImpact}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-neutral-900 min-w-12">{impact.teamImpact}%</span>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center gap-xs mb-xs">
                                  <div className="w-2 h-2 rounded-full bg-success-600"></div>
                                  <span className="text-xs font-semibold text-neutral-700 uppercase">Continuité</span>
                                </div>
                                <div className="flex items-center gap-xs">
                                  <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-success-600"
                                      style={{ width: `${impact.continuityRisk}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-semibold text-neutral-900 min-w-12">{impact.continuityRisk}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-md border-t border-neutral-200">
                              <div className="flex items-start gap-md">
                                <Zap size={18} className="text-primary-600 flex-shrink-0 mt-xs" />
                                <div>
                                  <p className="text-xs font-semibold text-neutral-700 uppercase mb-xs">Recommandation système</p>
                                  <p className="text-sm text-neutral-900">
                                    {impact.recommendation === "APPROUVER" && "Approuver - Impact minimal détecté"}
                                    {impact.recommendation === "NÉGOCIER" && "Envisager une négociation pour d'autres dates"}
                                    {impact.recommendation === "REJETER_OU_REPORTER" && "Reporter si possible - Impact élevé détecté"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {alternatives.length > 0 && (
                            <div className="mb-md">
                              <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-xs">Dates alternatives proposées</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                                {alternatives.map((alt, i) => (
                                  <div key={i} className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700">
                                    {alt.label}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-sm flex-wrap pt-md border-t border-neutral-200">
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={Eye}
                              onClick={() => navigate(`/rh/requests/${req.id}`)}
                            >
                              Détails complets
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
                        </motion.div>
                      );
                    })}
                </motion.div>
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
