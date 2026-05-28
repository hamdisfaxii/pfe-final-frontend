import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/authcontext";
import GlobalWorkCalendar from "../../components/calendar/GlobalWorkCalendar";
import { normalizeCountryIsoForHr } from "../../utils/country";
import { Button, Spinner } from "../../components/ui";

export default function EmployeeCalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const country = normalizeCountryIsoForHr(user?.country) || "TN";

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Spinner size="lg" />
          <p className="text-sm text-neutral-600 mt-md">Chargement de la session…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <GlobalWorkCalendar
      variant="employee"
      employeeId={user.id}
      employeeCountryIso={country}
      topSlot={
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/employee/dashboard")}
          >
            Retour tableau de bord
          </Button>
        </motion.div>
      }
    />
  );
}
