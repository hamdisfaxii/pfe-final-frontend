import React from "react";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, CheckCircle2, Calendar } from "lucide-react";
import { useAuth } from "../context/authcontext";
import { Link } from "react-router-dom";
import {
  PageContainer,
  ContentWrapper,
  Button,
  Card,
  CardContent,
} from "../components/ui";

export default function Home() {
  const { user, isEmployee, isRH, logout } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-xl"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-sm">
            {isEmployee ? "Espace Employé" : "Espace Responsable RH"}
          </h1>
          <p className="text-lg text-neutral-600">
            Connecté en tant que{" "}
            <span className="font-semibold text-neutral-900">{user?.name}</span>
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg"
        >
          {isEmployee && (
            <motion.div variants={itemVariants}>
              <Card variant="primary">
                <CardContent className="pt-lg text-center">
                  <LayoutDashboard size={20} className="mx-auto mb-md text-primary-600 opacity-75" />
                  <h3 className="text-lg font-semibold text-primary-900 mb-sm">
                    Accès Employé
                  </h3>
                  <p className="text-sm text-primary-700 mb-md">
                    Gérez vos demandes de congés et consultez votre historique
                  </p>
                  <Link to="/employee/dashboard" className="block">
                    <Button variant="primary" fullWidth>
                      Aller au Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isRH && (
            <>
              <motion.div variants={itemVariants}>
                <Card variant="primary">
                  <CardContent className="pt-lg text-center">
                    <LayoutDashboard size={20} className="mx-auto mb-md text-primary-600 opacity-75" />
                    <h3 className="text-lg font-semibold text-primary-900 mb-sm">
                      Tableau de bord RH
                    </h3>
                    <p className="text-sm text-primary-700 mb-md">
                      Vue d'ensemble des demandes et statistiques
                    </p>
                    <Link to="/rh/dashboard" className="block">
                      <Button variant="primary" fullWidth>
                        Ouvrir
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card variant="success">
                  <CardContent className="pt-lg text-center">
                    <CheckCircle2 size={20} className="mx-auto mb-md text-success-600 opacity-75" />
                    <h3 className="text-lg font-semibold text-success-900 mb-sm">
                      Module Décisions
                    </h3>
                    <p className="text-sm text-success-700 mb-md">
                      Approuvez ou rejetez les demandes
                    </p>
                    <Link to="/rh/decisions" className="block">
                      <Button variant="success" fullWidth>
                        Accéder
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card variant="warning">
                  <CardContent className="pt-lg text-center">
                    <Calendar size={20} className="mx-auto mb-md text-warning-600 opacity-75" />
                    <h3 className="text-lg font-semibold text-warning-900 mb-sm">
                      Jours Fériés
                    </h3>
                    <p className="text-sm text-warning-700 mb-md">
                      Configurez les jours fériés
                    </p>
                    <Link to="/rh/jours-feries" className="block">
                      <Button variant="warning" fullWidth>
                        Configurer
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            variant="ghost"
            icon={LogOut}
            onClick={logout}
            className="text-danger-600 hover:bg-danger-50"
          >
            Déconnexion
          </Button>
        </motion.div>
      </ContentWrapper>
    </PageContainer>
  );
}
