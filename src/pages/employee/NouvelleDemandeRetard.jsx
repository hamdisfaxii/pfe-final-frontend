import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Clock } from "lucide-react";
import useDemandes from "../../hooks/useDemandes";
import { getActiveWorkSchedule, getSuperAdmins } from "../../utils/rhApi";
import AIScoreCard from "../../components/AIScoreCard";
import { useAuth } from "../../context/authcontext";
import {
  collectScheduleSessionLabels,
  getScheduleRowForDate,
  isTimeWithinAnyScheduleSession,
  normalizeScheduleCountry,
  scheduleRowHasAnySession,
} from "../../utils/workSchedule";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  CardContent,
  Spinner,
} from "../../components/ui";

export default function NouvelleDemandeRetard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, creerDemande } = useDemandes();

  const [date, setDate] = useState("");
  const [heureArrivee, setHeureArrivee] = useState("");
  const [motif, setMotif] = useState("");
  const [approvedByAdminId, setApprovedByAdminId] = useState("");
  const [admins, setAdmins] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!date) {
      setFormError("Veuillez renseigner la date.");
      return;
    }

    if (!heureArrivee) {
      setFormError("Veuillez renseigner l'heure d'arrivée prévue.");
      return;
    }

    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      setFormError("La date n'est pas valide.");
      return;
    }

    const heureRegex = /^\d{2}:\d{2}$/;
    if (!heureRegex.test(heureArrivee)) {
      setFormError("L'heure doit être au format HH:MM.");
      return;
    }

    if (activeSchedule && date) {
      const scheduleRow = getScheduleRowForDate(activeSchedule.rows, date);
      if (!scheduleRow || !scheduleRowHasAnySession(scheduleRow)) {
        setFormError(
          "Le planning RH actif ne définit pas de plage horaire pour cette date.",
        );
        return;
      }
      if (!isTimeWithinAnyScheduleSession(scheduleRow, heureArrivee)) {
        setFormError(
          `L'heure d'arrivée doit se situer dans le planning RH actif : ${collectScheduleSessionLabels(scheduleRow)}`,
        );
        return;
      }
    }

    if (admins.length > 0 && !approvedByAdminId) {
      setFormError("Veuillez sélectionner « Approuvé par ».");
      return;
    }

    try {
      setSubmitting(true);
      await creerDemande({
        type: "retard",
        date,
        heureArrivee,
        motif: motif || undefined,
        approvedByAdminId: approvedByAdminId
          ? Number(approvedByAdminId)
          : undefined,
      });
      navigate("/employee/historique");
    } catch {
      setFormError(error || "Erreur lors de l'ajout de la demande de retard.");
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
            title="J'arrive en retard"
            description="Soumettez votre demande de retard avec l'heure d'arrivée prévue"
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
          {scheduleError && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-sm flex items-start gap-sm">
              <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
              <p className="text-sm text-danger-900">{scheduleError}</p>
            </div>
          )}
          {!scheduleError && scheduleLoading && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-sm">
              <Spinner size="sm" />
              <p className="text-sm text-neutral-600 mt-sm">Chargement du planning RH actif...</p>
            </div>
          )}
          {!scheduleError && !scheduleLoading && activeSchedule && (
            <div className="rounded-lg border border-success-200 bg-success-50 p-sm">
              <p className="text-sm text-success-900 font-medium">
                Planning RH actif : {activeSchedule.activeType || "NORMAL"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Loading / Error States */}
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
                {/* Approver */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="retard-approver" className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Approuvé par {admins.length > 0 && <span className="text-danger-600">*</span>}
                  </label>
                  <select
                    id="retard-approver"
                    value={approvedByAdminId}
                    onChange={(e) => setApprovedByAdminId(e.target.value)}
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">
                      {admins.length > 0
                        ? "Sélectionner un Super Admin"
                        : "Aucun validateur disponible"}
                    </option>
                    {admins.map((a) => (
                      <option key={a.id ?? a.email ?? a.name} value={a.id}>
                        {a.name || a.email || "Super Admin"}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-xs">
                    Ce champ est requis si la liste des Super Admins est disponible.
                  </p>
                </motion.div>

                {/* Date and Time */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <div>
                    <label htmlFor="retard-date" className="block text-sm font-semibold text-neutral-900 mb-xs">
                      Date <span className="text-danger-600">*</span>
                    </label>
                    <input
                      id="retard-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="retard-heure" className="block text-sm font-semibold text-neutral-900 mb-xs">
                      Heure d'arrivée <span className="text-danger-600">*</span>
                    </label>
                    <input
                      id="retard-heure"
                      type="time"
                      value={heureArrivee}
                      onChange={(e) => setHeureArrivee(e.target.value)}
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </motion.div>

                {/* Reason */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="retard-motif" className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Motif <span className="text-neutral-500 font-normal text-xs">(optionnel)</span>
                  </label>
                  <textarea
                    id="retard-motif"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Expliquez les raisons de votre retard..."
                  />
                </motion.div>

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
                {date && (
                  <motion.div variants={itemVariants}>
                    <AIScoreCard
                      demandeData={{
                        titre: "Retard",
                        dateDebut: date,
                        dateFin: date,
                        commentaire: motif,
                        typeConge: "RETARD_DEMAND",
                      }}
                      userId={user?.id}
                      isLoading={loading}
                    />
                  </motion.div>
                )}

                {/* Actions */}
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
                    Soumettre
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
