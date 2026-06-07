import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle2, XCircle, Zap } from "lucide-react";
import { decideHrRequest, getHrRequestById } from "../../utils/rhApi";
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
} from "../../components/ui";

const formatDecimalFr = (val) => {
  if (val == null || !Number.isFinite(Number(val))) return "—";
  const n = Number(val);
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

const formatDateFr = (raw) => {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatTimeLabel = (time) => {
  if (!time) return "";
  if (String(time).toUpperCase() === "MORNING") return "Matin";
  if (String(time).toUpperCase() === "AFTERNOON") return "Après-midi";
  return time;
};

const formatRequestPeriod = (request) => {
  if (!request) return "-";
  const startDate = formatDateFr(request.dateDebut);
  const endDate = formatDateFr(request.dateFin);
  const startTime = formatTimeLabel(request.heureDebut || request.startHalfDay);
  const endTime = formatTimeLabel(request.heureFin || request.endHalfDay);
  const startPart = startTime ? `${startDate} ${startTime}` : startDate;
  const endPart = endTime ? `${endDate} ${endTime}` : endDate;
  return `${startPart} → ${endPart}`;
};

// 🔒 CORRIGÉ : Suppression des calculs aléatoires
// L'analyse IA est maintenant fournie par le backend avec données réelles
// Les fonctions aléatoires causaient des décisions RH non déterministes

export default function RequestDetailsRh() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [request, setRequest] = useState(null);
  const [comment, setComment] = useState("");
  const [impact, setImpact] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const req = await getHrRequestById(id);
      setRequest(req);
      // Charger l'analyse d'impact depuis le backend
      const impactData = await fetch(`/api/ai/impact-score?demandeId=${req.id}`).then(r => r.json());
      setImpact(impactData);
    } catch {
      setError("Impossible de charger le détail de la demande.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (action) => {
    if (action === "REJECT" && !comment.trim()) {
      setCommentError("Le motif de rejet est obligatoire.");
      return;
    }
    setCommentError("");
    setLoading(true);
    setError("");
    try {
      await decideHrRequest(id, action, comment);
      await load();
    } catch {
      setError("Impossible de traiter la décision.");
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title="Détail de la demande"
            description="Examinez et décidez sur la demande de l'employé"
            action={
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate("/rh/requests")}
              >
                Retour
              </Button>
            }
          />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-lg p-sm bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-sm"
          >
            <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
            <p className="text-sm text-danger-900">{error}</p>
          </motion.div>
        )}

        {loading && !request ? (
          <div className="mt-lg">
            <Spinner size="lg" />
          </div>
        ) : !request ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-lg">
            <p className="text-neutral-600 font-medium">Demande introuvable.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card variant="default">
              <CardContent className="pt-lg">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm mb-lg pb-lg border-b border-neutral-200">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                      {libelleAffichageTypeConge(request.typeConge)}
                    </p>
                    <h2 className="text-2xl font-bold text-neutral-900">
                      {`${request.employe?.prenom || request.prenom || ""} ${request.employe?.nom || request.nom || ""}`.trim()}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-xs">
                      {request.employe?.email || request.email || "-"}
                    </p>
                  </div>
                  <StatusBadge statut={request.statut} />
                </div>

                {/* Employee & Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                      Approuvé par
                    </p>
                    <p className="text-base font-semibold text-neutral-900">
                      {(() => {
                        const ap = request?.approuvePar ?? request?.approvedBy ?? null;
                        if (!ap) return "-";
                        if (typeof ap === "string") return ap;
                        const nm = `${ap?.prenom ?? ap?.firstName ?? ""} ${ap?.nom ?? ap?.lastName ?? ""}`.trim();
                        return nm || ap?.email || ap?.mail || "-";
                      })()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                      Pays / Département
                    </p>
                    <p className="text-base font-semibold text-neutral-900">
                      {(request.employe?.country || "-") + " / " + (request.employe?.department || "-")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                      Période
                    </p>
                    <p className="text-base font-semibold text-neutral-900">{formatRequestPeriod(request)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                      Durée
                    </p>
                    <p className="text-base font-semibold text-neutral-900">
                      {(() => {
                        const exact = request?.nombreJoursExact ?? null;
                        const raw = request?.nombreJours ?? null;
                        const n = typeof exact === "number" ? exact : typeof raw === "number" ? raw : Number(raw);
                        const val = Number.isFinite(n) ? n : null;
                        const sh = String(request?.startHalfDay ?? "").toUpperCase();
                        const eh = String(request?.endHalfDay ?? "").toUpperCase();
                        const labelHalf = (h) => (h === "MORNING" ? "Matin" : h === "AFTERNOON" ? "Après-midi" : "");
                        const halfInfo = sh || eh ? ` (${labelHalf(sh) || "Journée"} → ${labelHalf(eh) || "Journée"})` : "";
                        return val == null ? "-" : `${formatDecimalFr(val)} jour(s)${halfInfo}`;
                      })()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                      Soumis le
                    </p>
                    <p className="text-base font-semibold text-neutral-900">
                      {formatDateFr(request.dateSoumission || request.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                      Décision
                    </p>
                    <p className="text-base font-semibold text-neutral-900">
                      {formatDateFr(request.dateDecision || request.dateAcceptation || request.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-md mb-lg">
                  <div className="flex items-center gap-sm mb-md">
                    <Zap size={20} className="text-primary-600" />
                    <h3 className="text-sm font-semibold text-primary-900">Analyse Intelligente</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
                    <div className="bg-white rounded-lg p-sm border border-primary-100">
                      <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-xs">Charge de travail</p>
                      <p className="text-lg font-bold text-neutral-900">{impact?.workload ?? "—"}</p>
                    </div>

                    <div className="bg-white rounded-lg p-sm border border-primary-100">
                      <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-xs">Impact équipe</p>
                      <div className="flex items-center gap-xs">
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-warning-600"
                            style={{ width: `${impact?.teamImpact ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-neutral-900 min-w-10">{impact?.teamImpact ?? "—"}%</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-sm border border-primary-100">
                      <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-xs">Continuité</p>
                      <div className="flex items-center gap-xs">
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success-600"
                            style={{ width: `${impact?.continuityRisk ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-neutral-900 min-w-10">{impact?.continuityRisk ?? "—"}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-sm border border-primary-100 mb-md">
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-xs">Recommandation du système</p>
                    {(() => {
                      const recommendations = {
                        APPROUVER: "Approuver - L'impact sur l'organisation est minimal. Les délais permettent une planification adéquate.",
                        NÉGOCIER: "Envisager une négociation - Proposer des dates alternatives qui réduiraient l'impact opérationnel.",
                        REPORTER: "Reporter si possible - L'impact est élevé. Proposer un report pour une période moins critique.",
                      };
                      return (
                        <p className="text-sm text-neutral-700">{recommendations[impact?.recommendation] ?? "Analyse en cours..."}</p>
                      );
                    })()}
                  </div>

                  <div className="bg-white rounded-lg p-sm border border-primary-100">
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-xs">Dates alternatives suggérées</p>
                    {(() => {
                      const start = new Date(request.dateDebut);
                      const week = new Date(start);
                      week.setDate(week.getDate() + 7);
                      const twoWeeks = new Date(start);
                      twoWeeks.setDate(twoWeeks.getDate() + 14);
                      return (
                        <div className="flex flex-wrap gap-xs">
                          <span className="px-xs py-2xs text-xs bg-neutral-100 text-neutral-700 rounded">{formatDateFr(week)}</span>
                          <span className="px-xs py-2xs text-xs bg-neutral-100 text-neutral-700 rounded">{formatDateFr(twoWeeks)}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Comments */}
                {(request.motif || request.commentaireRh) && (
                  <div className="border-t border-neutral-200 pt-lg mt-lg mb-lg space-y-md">
                    {request.motif && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                          Motif de l'employé
                        </p>
                        <p className="text-sm text-neutral-700 bg-neutral-50 p-sm rounded-lg">{request.motif}</p>
                      </div>
                    )}
                    {request.commentaireRh && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                          Commentaire RH
                        </p>
                        <p className="text-sm text-neutral-700 bg-neutral-50 p-sm rounded-lg">{request.commentaireRh}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Decision Section */}
                <div className="border-t border-neutral-200 pt-lg mt-lg">
                  <label htmlFor="decision-comment" className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Commentaire{" "}
                    <span className="text-xs font-normal text-neutral-500">
                      (obligatoire en cas de rejet <span className="text-danger-600">*</span>)
                    </span>
                  </label>
                  <textarea
                    id="decision-comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      setCommentError("");
                    }}
                    className={`w-full px-sm py-xs rounded-lg border bg-white text-neutral-900 text-sm min-h-24 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none ${
                      commentError
                        ? "border-danger-300 focus:ring-danger-500 bg-danger-50"
                        : "border-neutral-300 focus:ring-primary-500"
                    }`}
                    placeholder="Commentaire de validation / motif de rejet..."
                  />
                  {commentError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-xs text-xs font-medium text-danger-600">
                      {commentError}
                    </motion.p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-sm justify-end mt-lg pt-lg border-t border-neutral-200">
                  <Button
                    variant="success"
                    icon={CheckCircle2}
                    onClick={() => decide("APPROVE")}
                    disabled={loading}
                    isLoading={loading}
                  >
                    Approuver
                  </Button>
                  <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={() => decide("REJECT")}
                    disabled={loading}
                    isLoading={loading}
                  >
                    Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
