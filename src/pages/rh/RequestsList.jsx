import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Download, Search, Filter } from "lucide-react";
import { getHrRequests } from "../../utils/rhApi";
import { downloadHistoriqueDemandesCsv } from "../../utils/exportHistoriqueRhCsv";
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

const formatDateFr = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatDecimalFr = (val) => {
  if (val == null || !Number.isFinite(Number(val))) return "—";
  const n = Number(val);
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

export default function RequestsList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    status: "ALL",
    employee: "",
    country: "",
    department: "",
    startDate: "",
    endDate: "",
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHrRequests(filters);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("Impossible de charger l'historique des demandes.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chargement initial seulement
  }, []);

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
            title="Historique des demandes"
            description="Consultez, filtrez et exportez toutes les demandes de congés"
          />
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-lg">
          <Card variant="default">
            <CardContent className="pt-sm">
              <div className="space-y-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sm">
                  <div>
                    <label htmlFor="filter-status" className="block text-xs font-semibold text-neutral-700 mb-xs">
                      Statut
                    </label>
                    <select
                      id="filter-status"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, status: e.target.value }))
                      }
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="ALL">Tous les statuts</option>
                      <option value="PENDING">En attente</option>
                      <option value="APPROVED">Approuvé</option>
                      <option value="REJECTED">Rejeté</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="filter-employee" className="block text-xs font-semibold text-neutral-700 mb-xs">
                      Employé
                    </label>
                    <input
                      id="filter-employee"
                      value={filters.employee}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, employee: e.target.value }))
                      }
                      placeholder="Rechercher..."
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="filter-country" className="block text-xs font-semibold text-neutral-700 mb-xs">
                      Pays
                    </label>
                    <input
                      id="filter-country"
                      value={filters.country}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, country: e.target.value }))
                      }
                      placeholder="Rechercher..."
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="filter-department" className="block text-xs font-semibold text-neutral-700 mb-xs">
                      Département
                    </label>
                    <input
                      id="filter-department"
                      value={filters.department}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, department: e.target.value }))
                      }
                      placeholder="Rechercher..."
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="filter-start-date" className="block text-xs font-semibold text-neutral-700 mb-xs">
                      Date début
                    </label>
                    <input
                      id="filter-start-date"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, startDate: e.target.value }))
                      }
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="filter-end-date" className="block text-xs font-semibold text-neutral-700 mb-xs">
                      Date fin
                    </label>
                    <input
                      id="filter-end-date"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, endDate: e.target.value }))
                      }
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-sm pt-sm border-t border-neutral-200">
                  <Button
                    icon={Filter}
                    onClick={load}
                    disabled={loading}
                    isLoading={loading}
                  >
                    Appliquer les filtres
                  </Button>
                  <Button
                    variant="success"
                    icon={Download}
                    disabled={loading || rows.length === 0}
                    onClick={() => downloadHistoriqueDemandesCsv(rows)}
                  >
                    Exporter (CSV)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error */}
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

        {/* Table */}
        {loading && rows.length === 0 ? (
          <div className="mt-lg">
            <Spinner size="lg" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                      Employé
                    </th>
                    <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                      Type
                    </th>
                    <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                      Période
                    </th>
                    <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                      Durée
                    </th>
                    <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                      Statut
                    </th>
                    <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-sm py-md text-center text-neutral-500">
                        Chargement...
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    rows.map((r) => (
                      <motion.tr
                        key={r.id}
                        variants={itemVariants}
                        className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <td className="px-sm py-xs text-sm text-neutral-700">
                          {r.employe?.prenom} {r.employe?.nom}
                        </td>
                        <td className="px-sm py-xs text-sm text-neutral-700">
                          {libelleAffichageTypeConge(r.typeConge, r.employe?.country)}
                        </td>
                        <td className="px-sm py-xs text-sm text-neutral-700">
                          {formatDateFr(r.dateDebut)} → {formatDateFr(r.dateFin)}
                        </td>
                        <td className="px-sm py-xs text-sm text-neutral-700">
                          {(() => {
                            const exact = r?.nombreJoursExact ?? null;
                            const raw = r?.nombreJours ?? null;
                            const n =
                              typeof exact === "number"
                                ? exact
                                : typeof raw === "number"
                                  ? raw
                                  : Number(raw);
                            const val = Number.isFinite(n) ? n : null;
                            const sh = String(
                              r?.startHalfDay ?? "",
                            ).toUpperCase();
                            const eh = String(r?.endHalfDay ?? "").toUpperCase();
                            const labelHalf = (h) =>
                              h === "MORNING"
                                ? "Matin"
                                : h === "AFTERNOON"
                                  ? "Après-midi"
                                  : "";
                            const halfInfo =
                              sh || eh
                                ? ` (${labelHalf(sh) || "Journée"} → ${labelHalf(eh) || "Journée"})`
                                : "";
                            return val == null
                              ? "-"
                              : `${formatDecimalFr(val)} j${halfInfo}`;
                          })()}
                        </td>
                        <td className="px-sm py-xs">
                          <StatusBadge status={r.statut} icon={true} />
                        </td>
                        <td className="px-sm py-xs">
                          <Link to={`/rh/requests/${r.id}`}>
                            <Button variant="secondary" size="xs">
                              Ouvrir
                            </Button>
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-sm py-md text-center text-neutral-500">
                        Aucun résultat pour ces critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
