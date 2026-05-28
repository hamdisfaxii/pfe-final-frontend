import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Settings,
  Calendar,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import { getHrStats } from "../../utils/rhApi";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Grid,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Spinner,
  showToast,
} from "../../components/ui";

export default function HrDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHrStats();
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques RH.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const quickActions = [
    {
      icon: FileText,
      title: "Historique des demandes",
      description: "Examiner et traiter les demandes",
      href: "/rh/requests",
      color: "primary",
    },
    {
      icon: CheckCircle2,
      title: "Module de décision",
      description: "Approuver ou refuser les congés",
      href: "/rh/decisions",
      color: "success",
    },
    {
      icon: Calendar,
      title: "Calendrier RH",
      description: "Vue d'ensemble des congés",
      href: "/rh/calendar",
      color: "warning",
    },
    {
      icon: Users,
      title: "Soldes des employés",
      description: "Consulter les soldes restants",
      href: "/rh/soldes",
      color: "info",
    },
    {
      icon: Calendar,
      title: "Jours fériés",
      description: "Gérer les jours fériés",
      href: "/rh/jours-feries",
      color: "danger",
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Paramètres RH",
      href: "/rh/configuration",
      color: "neutral",
    },
  ];

  const approvalRate =
    stats.total > 0
      ? Math.round((stats.approved / stats.total) * 100)
      : 0;

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title="Tableau de bord RH"
            description="Gérez les demandes de congés et supervisez les équipes"
            action={
              <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
                Rafraîchir
              </Button>
            }
          />
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-lg p-sm bg-danger-50 border border-danger-200 rounded-lg"
          >
            <p className="font-semibold text-danger-900">{error}</p>
          </motion.div>
        )}

        {/* Statistics */}
        {loading ? (
          <Spinner size="lg" />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-2xl"
          >
            <Grid columns={4} gap="md">
              <motion.div variants={itemVariants}>
                <StatCard
                  label="En attente"
                  value={stats.pending}
                  icon={Clock}
                  variant="warning"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatCard
                  label="Approuvées"
                  value={stats.approved}
                  icon={CheckCircle2}
                  variant="success"
                  trend="up"
                  trendLabel={`${approvalRate}% d'approbation`}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatCard
                  label="Rejetées"
                  value={stats.rejected}
                  icon={XCircle}
                  variant="danger"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatCard
                  label="Total"
                  value={stats.total}
                  icon={BarChart3}
                  variant="dark"
                />
              </motion.div>
            </Grid>
          </motion.div>
        )}


        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-md">Actions rapides</h2>

          <Grid columns={3} gap="md">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorMap = {
                primary: "primary",
                success: "success",
                warning: "warning",
                danger: "danger",
                info: "primary",
                neutral: "default",
              };

              return (
                <motion.div key={index} variants={itemVariants}>
                  <Link to={action.href} className="block">
                    <Card
                      variant={colorMap[action.color]}
                      interactive
                      className="cursor-pointer h-full hover:border-current hover:border-opacity-50"
                    >
                      <div className="flex flex-col h-full">
                        <div className="inline-flex p-sm rounded-lg w-fit mb-sm opacity-75">
                          <Icon size={24} />
                        </div>
                        <h3 className="font-semibold text-neutral-900 mb-xs">{action.title}</h3>
                        <p className="text-sm text-neutral-600 flex-1 opacity-75">
                          {action.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </Grid>
        </motion.div>
      </ContentWrapper>
    </PageContainer>
  );
}
