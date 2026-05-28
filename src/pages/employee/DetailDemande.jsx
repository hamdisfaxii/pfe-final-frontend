import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Trash2, Clock, CheckCircle, Info } from "lucide-react";
import useDemandes from "../../hooks/useDemandes";
import { formaterDate } from "../../utils/calculJours";
import { libelleAffichageTypeConge } from "../../utils/country";
import { useAuth } from "../../context/authcontext";
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

const formatDecimalFr = (val) => {
  if (val == null || !Number.isFinite(Number(val))) return "—";
  const n = Number(val);
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

const normalizeForStatus = (statut) => {
  const raw = String(statut ?? "").trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return raw.replace(/\s+/g, "_");
};

const isAttente = (statut) => {
  const n = normalizeForStatus(statut);
  return n === "attente" || n === "en_attente" || n === "enattente";
};

const pickId = (demande) => demande?.id ?? demande?._id ?? demande?.ID;

const getStatusInfo = (status) => {
  const s = String(status ?? "").trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (s.includes("attente") || s.includes("pending")) {
    return {
      message: "Votre demande est en cours de traitement",
      detail: "Elle sera examinée par les responsables RH",
      delayDays: 3,
      icon: Clock,
      color: "warning",
    };
  }
  if (s.includes("accepte") || s.includes("approuve") || s.includes("approved")) {
    return {
      message: "Votre demande a été approuvée",
      detail: "Vos congés sont confirmés",
      delayDays: 0,
      icon: CheckCircle,
      color: "success",
    };
  }
  if (s.includes("refuse") || s.includes("rejet") || s.includes("rejected")) {
    return {
      message: "Votre demande a été refusée",
      detail: "Consultez les raisons du refus",
      delayDays: 0,
      icon: AlertCircle,
      color: "danger",
    };
  }
  return {
    message: "Statut inconnu",
    detail: "Contactez les RH pour plus d'infos",
    delayDays: null,
    icon: Info,
    color: "neutral",
  };
};

export default function DetailDemande() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { demandeDetail, loading, error, fetchDemandeById, annulerDemande } = useDemandes();
  const [modal, setModal] = useState({ isOpen: false, demandeId: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchDemandeById(id).catch(() => {});
  }, [id, fetchDemandeById]);

  const statut = useMemo(() => {
    return demandeDetail?.statut ?? demandeDetail?.status;
  }, [demandeDetail]);

  const canAnnuler = isAttente(statut);

  const handleConfirmCancel = async () => {
    try {
      setSubmitting(true);
      if (!modal.demandeId) return;
      await annulerDemande(modal.demandeId);
      setModal({ isOpen: false, demandeId: null });
      navigate("/employee/historique");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title="Détail de la demande"
            description="Consultez les informations complètes de votre demande"
            action={
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate("/employee/historique")}>
                Retour
              </Button>
            }
          />
        </motion.div>

        {loading && !demandeDetail ? (
          <div className="mt-lg">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
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

            {demandeDetail ? (
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
                          Type de demande
                        </p>
                        <h2 className="text-2xl font-bold text-neutral-900">
                          {libelleAffichageTypeConge(
                            demandeDetail?.titre ?? demandeDetail?.typeConge ?? demandeDetail?.type,
                            user?.country ?? user?.pays,
                          )}
                        </h2>
                      </div>
                      <StatusBadge statut={statut} />
                    </div>

                    {/* Status Information Section */}
                    {(() => {
                      const info = getStatusInfo(statut);
                      const bgColorMap = {
                        warning: "bg-warning-50 border-warning-200",
                        success: "bg-success-50 border-success-200",
                        danger: "bg-danger-50 border-danger-200",
                        neutral: "bg-neutral-50 border-neutral-200",
                      };
                      const textColorMap = {
                        warning: "text-warning-900",
                        success: "text-success-900",
                        danger: "text-danger-900",
                        neutral: "text-neutral-900",
                      };
                      const IconComponent = info.icon;
                      const colorClass = bgColorMap[info.color] || bgColorMap.neutral;
                      const textClass = textColorMap[info.color] || textColorMap.neutral;

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className={`${colorClass} border rounded-lg p-md mb-lg`}
                        >
                          <div className="flex items-start gap-sm">
                            <IconComponent size={20} className={`flex-shrink-0 mt-xs ${textClass}`} />
                            <div className="flex-1">
                              <p className={`font-semibold ${textClass}`}>{info.message}</p>
                              <p className={`text-sm mt-xs ${textClass} opacity-90`}>{info.detail}</p>
                              {info.delayDays && info.delayDays > 0 && (
                                <p className={`text-xs mt-xs font-medium ${textClass} opacity-75`}>
                                  Délai estimé : {info.delayDays} à {info.delayDays + 2} jours ouvrables
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })()}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                          Approuvé par
                        </p>
                        <p className="text-base font-semibold text-neutral-900">
                          {(() => {
                            const ap = demandeDetail?.approuvePar ?? demandeDetail?.approvedBy ?? null;
                            if (!ap) return "--";
                            if (typeof ap === "string") return ap;
                            const nm = `${ap?.prenom ?? ap?.firstName ?? ""} ${ap?.nom ?? ap?.lastName ?? ""}`.trim();
                            return nm || ap?.name || ap?.fullName || ap?.email || "--";
                          })()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                          Date début
                        </p>
                        <p className="text-base font-semibold text-neutral-900">
                          {formaterDate(demandeDetail?.dateDebut ?? demandeDetail?.debut)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                          Date fin
                        </p>
                        <p className="text-base font-semibold text-neutral-900">
                          {formaterDate(demandeDetail?.dateFin ?? demandeDetail?.fin)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                          Nombre de jours
                        </p>
                        <p className="text-base font-semibold text-neutral-900">
                          {(() => {
                            const exact = demandeDetail?.nombreJoursExact ?? demandeDetail?.joursExact ?? null;
                            const raw = demandeDetail?.nbJours ?? demandeDetail?.nombreJours ?? demandeDetail?.jours ?? null;
                            const n = typeof exact === "number" ? exact : typeof raw === "number" ? raw : Number(raw);
                            const val = Number.isFinite(n) ? n : null;
                            const sh = String(demandeDetail?.startHalfDay ?? "").toUpperCase();
                            const eh = String(demandeDetail?.endHalfDay ?? "").toUpperCase();
                            const labelHalf = (h) => (h === "MORNING" ? "Matin" : h === "AFTERNOON" ? "Après-midi" : "");
                            const halfInfo = sh || eh ? ` (${labelHalf(sh) || "Journée"} → ${labelHalf(eh) || "Journée"})` : "";
                            return val == null ? "--" : `${formatDecimalFr(val)} jour(s)${halfInfo}`;
                          })()}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                          Commentaire
                        </p>
                        <p className="text-base text-neutral-700">{demandeDetail?.commentaire ?? "--"}</p>
                      </div>
                    </div>

                    {/* Dates Section */}
                    <div className="border-t border-neutral-200 pt-lg mt-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                        <div>
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                            Date de soumission
                          </p>
                          <p className="text-base font-semibold text-neutral-900">
                            {formaterDate(demandeDetail?.dateSoumission ?? demandeDetail?.createdAt ?? demandeDetail?.soumisLe)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-xs">
                            Date de réponse
                          </p>
                          <p className="text-base font-semibold text-neutral-900">
                            {canAnnuler
                              ? "--"
                              : formaterDate(demandeDetail?.dateReponse ?? demandeDetail?.reponseAt ?? demandeDetail?.validatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    {canAnnuler && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-lg pt-lg border-t border-neutral-200">
                        <Button
                          variant="danger"
                          icon={Trash2}
                          onClick={() => setModal({ isOpen: true, demandeId: pickId(demandeDetail) })}
                        >
                          Annuler la demande
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-lg">
                <p className="text-neutral-600 font-medium">Demande introuvable.</p>
              </motion.div>
            )}
          </>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, demandeId: null })}
          title="Confirmer l'annulation"
          description="Êtes-vous sûr de vouloir annuler cette demande ?"
        >
          <div className="flex gap-sm justify-end mt-lg">
            <Button variant="ghost" onClick={() => setModal({ isOpen: false, demandeId: null })}>
              Annuler
            </Button>
            <Button variant="danger" isLoading={submitting} onClick={handleConfirmCancel} disabled={submitting}>
              Confirmer l'annulation
            </Button>
          </div>
        </Modal>
      </ContentWrapper>
    </PageContainer>
  );
}
