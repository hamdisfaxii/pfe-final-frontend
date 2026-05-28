import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Clock } from "lucide-react";
import useDemandes from "../../hooks/useDemandes";
import { useAuth } from "../../context/authcontext";
import { isFranceSortieCourteEligible } from "../../utils/country";
import { getActiveWorkSchedule, getSuperAdmins } from "../../utils/rhApi";
import AIScoreCard from "../../components/AIScoreCard";
import { normalizeScheduleCountry } from "../../utils/workSchedule";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  CardContent,
  Spinner,
} from "../../components/ui";

const NON_FR_CAP = 2;
const FIXED_MINUTES = 120;

function formatRttJours(val) {
  if (val == null || !Number.isFinite(Number(val))) return "—";
  const n = Number(val);
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function addMinutesToTimeString(hhmm, deltaMin) {
  if (!hhmm || typeof hhmm !== "string") return "";
  const [ha, ma] = hhmm.split(":").map(Number);
  if (!Number.isFinite(ha) || !Number.isFinite(ma)) return "";
  let t = ha * 60 + ma + deltaMin;
  if (t < 0) t = 0;
  if (t >= 24 * 60) t = 24 * 60 - 1;
  return `${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`;
}

function minutesDelta(hd, hf) {
  if (!hd || !hf) return Number.NaN;
  const [h1, m1] = hd.split(":").map(Number);
  const [h2, m2] = hf.split(":").map(Number);
  if (![h1, m1, h2, m2].every(Number.isFinite)) return Number.NaN;
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

export default function NouvelleSortieCourteDuree() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, error, fetchSolde, soldeSummary, creerDemande } =
    useDemandes();

  const fr = isFranceSortieCourteEligible(user?.country);

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [periodeFr, setPeriodeFr] = useState(""); // "", MORNING, AFTERNOON
  const [motif, setMotif] = useState("");
  const [approvedByAdminId, setApprovedByAdminId] = useState("");
  const [admins, setAdmins] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const restantes =
    typeof soldeSummary?.autorisationsCourtesMoisRestantes === "number"
      ? soldeSummary.autorisationsCourtesMoisRestantes
      : null;
  const utilisees =
    typeof soldeSummary?.autorisationsCourtesMoisUtilisees === "number"
      ? soldeSummary.autorisationsCourtesMoisUtilisees
      : null;
  const maxMois =
    typeof soldeSummary?.autorisationsCourtesMoisMaximum === "number"
      ? soldeSummary.autorisationsCourtesMoisMaximum
      : NON_FR_CAP;

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDateDebut(today);
    setDateFin(today);
  }, []);

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

  useEffect(() => {
    if (!fr && heureDebut) {
      setHeureFin(addMinutesToTimeString(heureDebut, FIXED_MINUTES));
    }
  }, [fr, heureDebut]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        Chargement…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const dDeb = dateDebut;
    const dFin = fr ? dateFin : dateDebut;

    if (!dDeb) {
      setFormError("Veuillez renseigner la date.");
      return;
    }
    if (fr && !dFin) {
      setFormError("Veuillez renseigner la date de fin.");
      return;
    }

    const start = new Date(dDeb);
    if (Number.isNaN(start.getTime())) {
      setFormError("La date de début n'est pas valide.");
      return;
    }
    if (fr) {
      const end = new Date(dFin);
      if (Number.isNaN(end.getTime())) {
        setFormError("La date de fin n'est pas valide.");
        return;
      }
      if (end < start) {
        setFormError("La date de fin doit être après ou égale au début.");
        return;
      }
    }

    if (fr) {
      if (!periodeFr) {
        setFormError(
          "Veuillez sélectionner une période (Journée/Matin/Après-midi).",
        );
        return;
      }
    } else {
      if (!heureDebut) {
        setFormError("Veuillez renseigner l'heure de début.");
        return;
      }
      if (!heureFin) {
        setFormError("Veuillez renseigner l'heure de fin.");
        return;
      }
    }


    if (!motif.trim()) {
      setFormError("Veuillez renseigner le motif.");
      return;
    }

    if (admins.length > 0 && !approvedByAdminId) {
      setFormError("Veuillez sélectionner « Approuvé par ».");
      return;
    }

    if (!fr) {
      const capRest = typeof restantes === "number" ? restantes : maxMois;
      if (capRest <= 0) {
        setFormError(
          "Limite mensuelle de 2 autorisations courtes (2 h) atteinte.",
        );
        return;
      }
      if (heureDebut && heureFin) {
        const md = minutesDelta(heureDebut, heureFin);
        if (md !== FIXED_MINUTES) {
          setFormError("La durée doit être exactement 2 heures.");
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      await creerDemande({
        type: "sortie",
        titre: fr ? "RTT" : "Sortie courte durée",
        dateSortie: dDeb,
        dateDebut: dDeb,
        dateFin: dFin,
        // France RTT : demi-journée via startHalfDay/endHalfDay, pas via heureDebut
        heureDebut: fr ? null : heureDebut,
        heureFin: fr ? null : heureFin,
        startHalfDay: fr && periodeFr && periodeFr !== "FULL_DAY" ? periodeFr : undefined,
        endHalfDay: fr && periodeFr && periodeFr !== "FULL_DAY" ? periodeFr : undefined,
        motif: motif.trim(),
        approvedByAdminId: approvedByAdminId
          ? Number(approvedByAdminId)
          : undefined,
      });
      navigate("/employee/historique");
    } catch (err) {
      const apiMsg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        (typeof err?.message === "string" ? err.message : null);
      setFormError(
        apiMsg || error || "Erreur lors de l'ajout de la demande de sortie.",
      );
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
            title={fr ? "RTT (France)" : "Autorisation courte (2 h)"}
            description={
              fr
                ? "Choisissez une journée complète ou une demi-journée"
                : `Jusqu’à ${maxMois} autorisations de 2 h par mois calendaire`
            }
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

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-lg"
        >
          <Card variant={fr ? "primary" : "warning"}>
            <CardContent className="pt-md">
              <p className="text-xs font-semibold uppercase tracking-wide mb-md">
                {fr ? "Solde RTT" : "Autorisations 2h ce mois-ci"}
              </p>

              {fr ? (
                soldeSummary?.franceRtt ? (
                  <div className="grid grid-cols-4 gap-sm text-center">
                    <div>
                      <p className="text-[10px] font-semibold opacity-75 uppercase tracking-wide mb-xs">Total</p>
                      <p className="text-xl font-bold">
                        {formatRttJours(soldeSummary.franceRtt.total)} <span className="text-sm font-semibold">j</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold opacity-75 uppercase tracking-wide mb-xs">Pris</p>
                      <p className="text-xl font-bold">
                        {formatRttJours(soldeSummary.franceRtt.used)} <span className="text-sm font-semibold">j</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold opacity-75 uppercase tracking-wide mb-xs">Attente</p>
                      <p className="text-xl font-bold">
                        {formatRttJours(soldeSummary.franceRtt.pending)} <span className="text-sm font-semibold">j</span>
                      </p>
                    </div>
                    <div className="bg-primary-100/50 rounded-lg p-sm">
                      <p className="text-[10px] font-semibold opacity-75 uppercase tracking-wide mb-xs">Restant</p>
                      <p className="text-xl font-bold text-primary-600">
                        {formatRttJours(soldeSummary.franceRtt.remaining)} <span className="text-sm font-semibold">j</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-bold">
                    {loading ? "…" : soldeSummary ? `${soldeSummary.permission} j` : "—"}
                  </p>
                )
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">
                      {typeof utilisees === "number" && typeof restantes === "number" ? (
                        <>
                          {utilisees} / {maxMois} utilisée(s)
                        </>
                      ) : loading ? (
                        "Chargement…"
                      ) : (
                        "Indisponible"
                      )}
                    </p>
                    {typeof restantes === "number" && (
                      <p className={`text-sm font-semibold mt-xs ${restantes > 0 ? "text-success-600" : "text-danger-600"}`}>
                        {restantes} restante(s)
                      </p>
                    )}
                  </div>
                  <Clock size={20} className="opacity-25" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Error States */}
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
                  <label htmlFor="sortie-approver" className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Approuvé par {admins.length > 0 && <span className="text-danger-600">*</span>}
                  </label>
                  <select
                    id="sortie-approver"
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

                {/* Dates */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <div>
                    <label htmlFor="sortie-date-debut" className="block text-sm font-semibold text-neutral-900 mb-xs">
                      {fr ? "Date début" : "Date"} <span className="text-danger-600">*</span>
                    </label>
                    <input
                      id="sortie-date-debut"
                      type="date"
                      value={dateDebut}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDateDebut(v);
                        if (!fr) return;
                        setDateFin((prev) => (prev < v ? v : prev));
                      }}
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {fr && (
                    <div>
                      <label htmlFor="sortie-date-fin" className="block text-sm font-semibold text-neutral-900 mb-xs">
                        Date fin <span className="text-danger-600">*</span>
                      </label>
                      <input
                        id="sortie-date-fin"
                        type="date"
                        value={dateFin}
                        min={dateDebut}
                        onChange={(e) => setDateFin(e.target.value)}
                        className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  )}
                </motion.div>

                {/* Period / Hours */}
                {fr ? (
                  <motion.div variants={itemVariants}>
                    <label htmlFor="sortie-periode" className="block text-sm font-semibold text-neutral-900 mb-xs">
                      Période RTT
                    </label>
                    <select
                      id="sortie-periode"
                      value={periodeFr}
                      onChange={(e) => setPeriodeFr(e.target.value)}
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="FULL_DAY">Journée complète</option>
                      <option value="MORNING">Matin (0.5)</option>
                      <option value="AFTERNOON">Après-midi (0.5)</option>
                    </select>
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                    <div>
                      <label htmlFor="sortie-heure-debut" className="block text-sm font-semibold text-neutral-900 mb-xs">
                        Heure début <span className="text-danger-600">*</span>
                      </label>
                      <input
                        id="sortie-heure-debut"
                        type="time"
                        value={heureDebut}
                        onChange={(e) => setHeureDebut(e.target.value)}
                        className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="sortie-heure-fin" className="block text-sm font-semibold text-neutral-900 mb-xs">
                        Heure fin <span className="text-danger-600">*</span>
                      </label>
                      <input
                        id="sortie-heure-fin"
                        type="time"
                        value={heureFin}
                        readOnly
                        className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-600 text-sm cursor-not-allowed"
                      />
                      <p className="text-xs text-neutral-500 mt-xs">
                        Auto : début + 2h
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Reason */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="sortie-motif" className="block text-sm font-semibold text-neutral-900 mb-xs">
                    Motif <span className="text-danger-600">*</span>
                  </label>
                  <textarea
                    id="sortie-motif"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder={
                      fr
                        ? "Justification du RTT..."
                        : "Motif de l’autorisation courte..."
                    }
                    required
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
                {dateDebut && (
                  <motion.div variants={itemVariants}>
                    <AIScoreCard
                      demandeData={{
                        titre: fr ? "RTT" : "Sortie courte durée",
                        dateDebut,
                        dateFin: dateDebut,
                        heureDebut,
                        heureFin,
                        commentaire: motif,
                        typeConge: "SORTIE_COURTE",
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
                    Envoyer
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
