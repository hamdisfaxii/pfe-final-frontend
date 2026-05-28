import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Upload } from "lucide-react";
import useDemandes from "../../hooks/useDemandes";
import { calculerJoursOuvres } from "../../utils/calculJours";
import { useAuth } from "../../context/authcontext";
import { getActiveWorkSchedule, getSuperAdmins, uploadDemandeAttachment } from "../../utils/rhApi";
import AIScoreCard from "../../components/AIScoreCard";
import {
  collectScheduleSessionLabels,
  getScheduleRowForDate,
  isHalfDayAllowedOnRow,
  normalizeScheduleCountry,
  scheduleRowHasAnySession,
} from "../../utils/workSchedule";
import { normalizeCountryIsoForHr } from "../../utils/country";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  CardContent,
  Input,
  Spinner,
  showToast,
} from "../../components/ui";

export default function NouvelleDemande() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { solde, soldeSummary, loading, error, fetchSolde, creerDemande } =
    useDemandes();

  const soldeCongesPayes =
    typeof soldeSummary?.congesPayes === "number"
      ? soldeSummary.congesPayes
      : typeof solde === "number"
        ? solde
        : 0;

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [startHalfDay, setStartHalfDay] = useState("");
  const [endHalfDay, setEndHalfDay] = useState("");
  const [titre, setTitre] = useState("Congé payé");
  const [commentaire, setCommentaire] = useState("");
  const [approvedByAdminId, setApprovedByAdminId] = useState("");
  const [admins, setAdmins] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pieceJointe, setPieceJointe] = useState(null);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  useEffect(() => {
    fetchSolde().catch(() => {});
  }, [fetchSolde]);

  useEffect(() => {
    getSuperAdmins()
      .then((rows) => setAdmins(Array.isArray(rows) ? rows : []))
      .catch(() => setAdmins([]));
  }, []);

  useEffect(() => {
    if (!user?.country) return;
    const loadSchedule = async () => {
      setScheduleLoading(true);
      setScheduleError("");
      try {
        const schedule = await getActiveWorkSchedule(
          normalizeScheduleCountry(user.country),
        );
        setActiveSchedule(schedule);
      } catch {
        setActiveSchedule(null);
        setScheduleError("Impossible de charger le planning RH actif.");
      } finally {
        setScheduleLoading(false);
      }
    };
    loadSchedule();
  }, [user?.country]);

  const nbJours = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    if (end < start) return 0;
    return calculerJoursOuvres(dateDebut, dateFin, user?.country || "");
  }, [dateDebut, dateFin, user?.country]);

  const normalizeHalfDay = (value) => {
    const v = String(value || "")
      .trim()
      .toUpperCase();
    return v === "MORNING" || v === "AFTERNOON" ? v : "";
  };

  const nbJoursExact = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    if (end < start) return 0;
    const sameDay = String(dateDebut) === String(dateFin);
    const startPeriod = normalizeHalfDay(startHalfDay);
    const endPeriod = normalizeHalfDay(endHalfDay);
    if (sameDay) {
      if (nbJours === 0) return 0; // weekend ou jour férié
      const actualStart = startPeriod || "MORNING";
      const actualEnd = endPeriod || "AFTERNOON";
      if (actualStart === "AFTERNOON" && actualEnd === "MORNING") return 0;
      return actualStart === actualEnd ? 0.5 : 1;
    }
    let exact = nbJours;
    if (startPeriod === "AFTERNOON") exact -= 0.5;
    if (endPeriod === "MORNING") exact -= 0.5;
    return Math.max(0, exact);
  }, [dateDebut, dateFin, endHalfDay, nbJours, startHalfDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!dateDebut || !dateFin) {
      setFormError("Veuillez renseigner les dates.");
      return;
    }

    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    if (end < start) {
      setFormError("La date de fin ne peut pas être antérieure à la date de début.");
      return;
    }

    if (nbJoursExact <= 0) {
      setFormError("Le nombre de jours doit être supérieur à 0.");
      return;
    }

    if (activeSchedule && dateDebut) {
      const startRow = getScheduleRowForDate(activeSchedule.rows, dateDebut);
      const endRow =
        dateFin !== dateDebut
          ? getScheduleRowForDate(activeSchedule.rows, dateFin)
          : startRow;

      if (
        (startHalfDay || endHalfDay) &&
        (!startRow || !scheduleRowHasAnySession(startRow))
      ) {
        setFormError(
          "Le planning RH actif ne définit pas de plage horaire pour la date de début de congé.",
        );
        return;
      }
      if (
        endHalfDay &&
        dateFin !== dateDebut &&
        (!endRow || !scheduleRowHasAnySession(endRow))
      ) {
        setFormError(
          "Le planning RH actif ne définit pas de plage horaire pour la date de fin de congé.",
        );
        return;
      }
      if (startHalfDay && !isHalfDayAllowedOnRow(startRow, startHalfDay)) {
        setFormError(
          `La période de début (${startHalfDay.toLowerCase()}) n'est pas disponible dans le planning RH actif : ${collectScheduleSessionLabels(startRow)}`,
        );
        return;
      }
      if (endHalfDay && !isHalfDayAllowedOnRow(endRow, endHalfDay)) {
        setFormError(
          `La période de fin (${endHalfDay.toLowerCase()}) n'est pas disponible dans le planning RH actif : ${collectScheduleSessionLabels(endRow)}`,
        );
        return;
      }
    }

    if (!titre) {
      setFormError("Veuillez sélectionner le type de congé.");
      return;
    }

    if (admins.length > 0 && !approvedByAdminId) {
      setFormError("Veuillez sélectionner « Approuvé par ».");
      return;
    }

    const titreNormalise = String(titre || "").toLowerCase();
    const doitVerifierSoldePaye =
      titreNormalise.includes("payé") && !titreNormalise.includes("sans solde");

    if (
      doitVerifierSoldePaye &&
      typeof soldeCongesPayes === "number" &&
      nbJoursExact > soldeCongesPayes
    ) {
      setFormError(
        "Vous n'avez pas assez de jours de congés payés disponibles.",
      );
      return;
    }

    if (
      titre === "Congé maladie" &&
      Date.now() - new Date(dateDebut) > 1000 * 60 * 60 * 48
    ) {
      setFormError(
        "Le congé maladie doit être déclaré dans les 48h suivant le début du congé.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const demande = await creerDemande({
        dateDebut,
        dateFin,
        titre,
        commentaire: commentaire || undefined,
        approvedByAdminId: approvedByAdminId
          ? Number(approvedByAdminId)
          : undefined,
        startHalfDay: startHalfDay || undefined,
        endHalfDay: endHalfDay || undefined,
      });
      if (titre === "Congé maladie" && pieceJointe) {
        const demandeId = demande?.id ?? demande?.ID;
        if (demandeId) {
          await uploadDemandeAttachment(demandeId, pieceJointe);
        }
      }
      navigate("/employee/historique");
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (typeof err?.message === "string" ? err.message : null);
      setFormError(apiMsg || error || "Erreur lors de l'ajout de la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
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
            title="Nouvelle demande de congé"
            description="Remplissez le formulaire pour soumettre votre demande"
            action={
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate("/employee/dashboard")}
              >
                Retour
              </Button>
            }
          />
        </motion.div>

        {/* Schedule Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-lg">
          {scheduleError ? (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-sm flex items-start gap-sm">
              <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
              <p className="text-sm text-danger-900">{scheduleError}</p>
            </div>
          ) : scheduleLoading ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-sm">
              <Spinner size="sm" />
              <p className="text-sm text-neutral-600 mt-sm">Chargement du planning RH actif...</p>
            </div>
          ) : activeSchedule ? (
            <div className="rounded-lg border border-success-200 bg-success-50 p-sm">
              <p className="text-sm text-success-900 font-medium">
                Planning RH actif : {activeSchedule.activeType || "NORMAL"}
              </p>
            </div>
          ) : null}
        </motion.div>

        {/* User Info and Balance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-lg grid grid-cols-1 md:grid-cols-2 gap-sm"
        >
          <motion.div variants={itemVariants}>
            <Card variant="default">
              <CardContent className="pt-md">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-sm">
                  Utilisateur
                </p>
                <p className="text-base font-semibold text-neutral-900 mb-xs">
                  {[user?.prenom, user?.nom].filter(Boolean).join(" ").trim() || user?.email || "—"}
                </p>
                {user?.email && (
                  <p className="text-xs text-neutral-500 truncate">
                    {user.email}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card variant="primary">
              <CardContent className="pt-md">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-sm">
                  Solde disponible
                </p>
                <p className="text-2xl font-bold text-primary-900 tabular-nums">
                  {typeof soldeCongesPayes === "number"
                    ? `${soldeCongesPayes} jours`
                    : "—"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Loading/Error States */}
        {(loading || submitting) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-md">
            <Spinner size="sm" />
          </motion.div>
        )}

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

        {/* Form */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Card variant="default">
            <CardContent className="pt-lg">
              <form onSubmit={handleSubmit} className="space-y-md">
                {/* Type */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Type de congé <span className="text-danger-600">*</span>
                  </label>
                  <select
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="Congé payé">Congé payé</option>
                    <option value="Congé sans solde">Sans solde</option>
                    {normalizeCountryIsoForHr(user?.country ?? user?.pays) === "TN" && (
                      <option value="Congé maladie">Maladie</option>
                    )}
                  </select>
                </motion.div>

                {/* Start Date */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Date début <span className="text-danger-600">*</span>
                  </label>
                  <div className="flex flex-col md:flex-row gap-sm">
                    <input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="flex-1 px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                    <select
                      value={startHalfDay}
                      onChange={(e) => setStartHalfDay(e.target.value)}
                      className="md:w-40 px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      aria-label="Période début (matin ou après-midi)"
                    >
                      <option value="">Journée complète</option>
                      <option value="MORNING">Matin</option>
                      <option value="AFTERNOON">Après-midi</option>
                    </select>
                  </div>
                </motion.div>

                {/* End Date */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Date fin <span className="text-danger-600">*</span>
                  </label>
                  <div className="flex flex-col md:flex-row gap-sm">
                    <input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="flex-1 px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                    <select
                      value={endHalfDay}
                      onChange={(e) => setEndHalfDay(e.target.value)}
                      className="md:w-40 px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      aria-label="Période fin (matin ou après-midi)"
                    >
                      <option value="">Journée complète</option>
                      <option value="MORNING">Matin</option>
                      <option value="AFTERNOON">Après-midi</option>
                    </select>
                  </div>
                </motion.div>

                {/* Duration */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Nombre de jours (ouvrés)
                  </label>
                  <input
                    type="text"
                    value={nbJours}
                    readOnly
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 text-sm font-medium tabular-nums cursor-not-allowed"
                  />
                </motion.div>

                {/* Approver */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Sera approuvé par {admins.length > 0 && <span className="text-danger-600">*</span>}
                  </label>
                  <select
                    value={approvedByAdminId}
                    onChange={(e) => setApprovedByAdminId(e.target.value)}
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">
                      {admins.length > 0
                        ? "Sélectionner un validateur"
                        : "Aucun validateur disponible"}
                    </option>
                    {admins.map((a) => (
                      <option key={a.id ?? a.email ?? a.name} value={a.id}>
                        {a.name || a.email || "Super Admin"}
                      </option>
                    ))}
                  </select>
                </motion.div>

                {/* Description */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Description
                  </label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Ajoutez une description ou commentaire..."
                  />
                </motion.div>

                {/* Medical Attachment */}
                {titre === "Congé maladie" && (
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-neutral-900 mb-xs">
                      Justificatif médical <span className="text-neutral-500 font-normal text-xs">(optionnel)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.heic"
                        onChange={(e) => setPieceJointe(e.target.files?.[0] ?? null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="px-sm py-md rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors">
                        <Upload size={20} className="mx-auto text-neutral-400 mb-xs" />
                        <p className="text-sm font-medium text-neutral-700">
                          Cliquez pour sélectionner un fichier
                        </p>
                        <p className="text-xs text-neutral-500 mt-xs">
                          PDF, JPG, PNG, HEIC — 10 Mo max
                        </p>
                      </div>
                    </div>
                    {pieceJointe && (
                      <p className="mt-sm text-sm text-success-700 font-medium flex items-center gap-xs">
                        ✓ Fichier sélectionné: {pieceJointe.name}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Form Error */}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-sm bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-sm"
                  >
                    <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
                    <p className="text-sm text-danger-900">{formError}</p>
                  </motion.div>
                )}

                {/* AI Score Card */}
                {dateDebut && dateFin && (
                  <motion.div variants={itemVariants}>
                    <AIScoreCard
                      demandeData={{
                        titre,
                        dateDebut,
                        dateFin,
                        startHalfDay,
                        endHalfDay,
                        commentaire,
                        typeConge: titre.toLowerCase().includes("maladie")
                          ? "CONGE_MALADIE"
                          : titre.toLowerCase().includes("sans solde")
                            ? "CONGE_SANS_SOLDE"
                            : "CONGES_PAYES",
                      }}
                      userId={user?.id}
                      isLoading={loading}
                    />
                  </motion.div>
                )}

                {/* Form Actions */}
                <motion.div variants={itemVariants} className="flex gap-sm justify-end pt-md border-t border-neutral-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/employee/dashboard")}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={submitting}
                    disabled={submitting}
                  >
                    Soumettre la demande
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </ContentWrapper>
    </PageContainer>
  );
}
