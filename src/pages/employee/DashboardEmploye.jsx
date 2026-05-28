import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Gift,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import useDemandes from "../../hooks/useDemandes";
import { useAuth } from "../../context/authcontext";
import { formaterDate, calculerJoursOuvres } from "../../utils/calculJours";
import {
  isFranceSortieCourteEligible,
  libelleAffichageTypeConge,
  metaForCountry,
} from "../../utils/country";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Grid,
  Stack,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  StatusBadge,
  Spinner,
  showToast,
} from "../../components/ui";

export default function DashboardEmploye() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { solde, soldeSummary, demandes, loading, error, fetchSolde, fetchDemandes } =
    useDemandes();
  const paysMeta = metaForCountry(user?.country);

  const reloadAll = useCallback(() => {
    fetchSolde().catch(() => {});
    fetchDemandes({}).catch(() => {});
  }, [fetchSolde, fetchDemandes]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") reloadAll();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [reloadAll]);

  const recentDemandes = demandes.slice(0, 5);
  const congesPayes = soldeSummary?.congesPayes || 0;
  const maladie = soldeSummary?.maladie || 0;

  const actionCards = [
    {
      icon: Calendar,
      title: "Nouveau congé",
      description: "Créer une demande de congé payé",
      action: () => navigate("/employee/conge/new"),
      color: "primary",
    },
    {
      icon: Clock,
      title: isFranceSortieCourteEligible(user?.country) ? "RTT" : "Autorisation courte",
      description: isFranceSortieCourteEligible(user?.country)
        ? "Demande de RTT"
        : "Jusqu'à 2h par mois",
      action: () => navigate("/employee/sortie/new"),
      color: "success",
    },
    {
      icon: Gift,
      title: "Congés exceptionnels",
      description: "Mariage, naissance, décès…",
      action: () => navigate("/employee/exceptionnels"),
      color: "warning",
    },
    {
      icon: AlertCircle,
      title: "Déclaration de retard",
      description: "Signaler une arrivée tardive",
      action: () => navigate("/employee/retard/new"),
      color: "danger",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title={`Bienvenue, ${user?.firstName || "Collaborateur"}`}
            description={`Gérez vos congés facilement • ${paysMeta.label}`}
            action={
              <Button
                size="sm"
                variant="secondary"
                icon={RefreshCw}
                onClick={reloadAll}
                disabled={loading}
              >
                Actualiser
              </Button>
            }
          />
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-lg p-sm bg-danger-50 border border-danger-200 rounded-lg flex gap-sm items-start"
          >
            <AlertCircle className="text-danger-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-danger-900">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Soldes de congés */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-2xl"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-md">Vos soldes de congés</h2>

          {loading && !soldeSummary ? (
            <Spinner size="lg" />
          ) : (
            <Grid columns={3} gap="md">
              <motion.div variants={itemVariants}>
                <StatCard
                  label="Congés payés"
                  value={Math.round(congesPayes * 10) / 10}
                  subValue="jours"
                  variant="primary"
                  icon={Calendar}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatCard
                  label="Congé maladie"
                  value={Math.round(maladie * 10) / 10}
                  subValue="jours"
                  variant="warning"
                  icon={AlertCircle}
                />
              </motion.div>

              {isFranceSortieCourteEligible(user?.country) && (
                <motion.div variants={itemVariants}>
                  <StatCard
                    label="RTT"
                    value={
                      soldeSummary?.franceRtt?.remaining
                        ? Math.round(soldeSummary.franceRtt.remaining * 10) / 10
                        : 0
                    }
                    subValue="jours"
                    variant="success"
                    icon={Clock}
                  />
                </motion.div>
              )}
            </Grid>
          )}
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-2xl"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-md">Actions rapides</h2>

          <Grid columns={4} gap="md">
            {actionCards.map((item, index) => {
              const Icon = item.icon;
              const colorMap = {
                primary: "primary",
                success: "success",
                warning: "warning",
                danger: "danger",
              };

              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card
                    variant={colorMap[item.color]}
                    interactive
                    onClick={item.action}
                    className="cursor-pointer h-full hover:border-current hover:border-opacity-50"
                  >
                    <div className="flex flex-col h-full">
                      <div
                        className={`inline-flex p-sm rounded-lg w-fit mb-sm opacity-75`}
                      >
                        <Icon size={20} />
                      </div>
                      <h3 className="font-semibold text-neutral-900 mb-xs">{item.title}</h3>
                      <p className="text-sm text-neutral-600 text-opacity-80 flex-1 mb-md">
                        {item.description}
                      </p>
                      <div className="flex items-center text-sm font-semibold gap-1 opacity-75">
                        Accéder
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </Grid>
        </motion.div>

        {/* Demandes récentes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-xl font-semibold text-neutral-900">Demandes récentes</h2>
            <Button variant="ghost" onClick={() => navigate("/employee/historique")}>
              Voir tout
              <ChevronRight size={16} />
            </Button>
          </div>

          {recentDemandes.length === 0 ? (
            <Card variant="ghost">
              <div className="text-center py-lg">
                <FileText className="mx-auto mb-md text-neutral-400" size={48} />
                <p className="text-neutral-600">Aucune demande pour l'instant</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-md">
              {recentDemandes.map((demande) => (
                <motion.div key={demande.id} variants={itemVariants}>
                  <Card
                    interactive
                    onClick={() => navigate(`/employee/demande/${demande.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-sm">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-sm mb-xs">
                          <h4 className="font-semibold text-neutral-900">
                            {libelleAffichageTypeConge(demande.typeConge, user?.country)}
                          </h4>
                          <StatusBadge status={demande.statut} size="xs" />
                        </div>
                        <div className="grid grid-cols-2 gap-sm text-sm text-neutral-600">
                          <div>
                            <p className="text-xs text-neutral-500">Période</p>
                            <p className="font-medium text-neutral-900">
                              {formaterDate(demande.dateDebut)} → {formaterDate(demande.dateFin)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Durée</p>
                            <p className="font-medium text-neutral-900">{demande.nombreJours} jour(s)</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="text-neutral-400 flex-shrink-0" size={20} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </ContentWrapper>
    </PageContainer>
  );
}
