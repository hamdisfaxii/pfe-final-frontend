import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useDemandes from "../../hooks/useDemandes";
import FiltresDemandes from "../../components/employee/FiltresDemandes";
import { formaterDate } from "../../utils/calculJours";
import { libelleAffichageTypeConge } from "../../utils/country";
import { useAuth } from "../../context/authcontext";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  StatusBadge,
  Spinner,
  Modal,
  showToast,
} from "../../components/ui";

const normalizeForStatus = (statut) => {
  const raw = String(statut ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return raw.replace(/\s+/g, "_");
};

const isAttente = (statut) => {
  const n = normalizeForStatus(statut);
  return n === "attente" || n === "en_attente" || n === "enattente";
};

const pickId = (demande) => demande?.id ?? demande?._id ?? demande?.ID;

export default function HistoriqueDemandes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { demandes, loading, error, fetchDemandes, annulerDemande } =
    useDemandes();

  const statusFromQuery = useMemo(() => {
    const q = new URLSearchParams(location.search).get("statut");
    const allowed = new Set([
      "tous",
      "attente",
      "validee",
      "refusee",
      "annulee",
    ]);
    if (q == null) return null;
    return allowed.has(q) ? q : null;
  }, [location.search]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const start = 2024;
    const end = current + 2;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, []);

  const [filters, setFilters] = useState({
    annee: String(new Date().getFullYear()),
    statut: statusFromQuery ?? "tous",
  });

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [modal, setModal] = useState({
    isOpen: false,
    demandeId: null,
    titre: "",
  });

  const totalPages = Math.max(1, Math.ceil(demandes.length / perPage));
  const pageSafe = Math.min(page, totalPages);
  const slice = demandes.slice((pageSafe - 1) * perPage, pageSafe * perPage);

  const effectiveStatus =
    statusFromQuery != null && String(statusFromQuery).trim() !== ""
      ? statusFromQuery
      : filters.statut;

  const handleSearch = (nextFilters) => {
    setPage(1);
    setFilters({
      annee: nextFilters?.annee ?? String(new Date().getFullYear()),
      statut: nextFilters?.statut ?? "tous",
    });
  };

  useEffect(() => {
    fetchDemandes({
      annee: filters.annee,
      statut: effectiveStatus,
    }).catch(() => {});
  }, [filters.annee, effectiveStatus, fetchDemandes]);

  const handleCancel = (demande) => {
    const id = pickId(demande);
    setModal({
      isOpen: true,
      demandeId: id,
      titre: demande?.titre ?? demande?.type ?? "demande",
    });
  };

  const handleConfirmCancel = async () => {
    try {
      if (!modal.demandeId) return;
      await annulerDemande(modal.demandeId);
      setModal({ isOpen: false, demandeId: null, titre: "" });
      await fetchDemandes({ annee: filters.annee, statut: effectiveStatus });
      showToast.success("Demande annulée");
    } catch (err) {
      showToast.error(err.message || "Erreur lors de l'annulation");
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
            title="Mes demandes de congés"
            description="Consultez l'historique de vos demandes et leur statut"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/employee/dashboard")}
              >
                Retour
              </Button>
            }
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="mb-lg">
            <FiltresDemandes
              years={years}
              initialAnnee={filters.annee}
              initialStatut={effectiveStatus}
              onSearch={handleSearch}
              onReset={() => {}}
            />
          </div>
        </motion.div>

        {loading && demandes.length === 0 ? (
          <div className="mt-lg">
            <Spinner />
          </div>
        ) : (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-lg p-md bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-sm"
              >
                <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-danger-900">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs mb-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                          Date début
                        </th>
                        <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                          Date fin
                        </th>
                        <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                          Nb jours
                        </th>
                        <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                          État
                        </th>
                        <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                          Type
                        </th>
                        <th className="px-sm py-xs text-left text-xs font-semibold text-neutral-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-sm py-md text-center text-neutral-500">
                            Aucune demande trouvée
                          </td>
                        </tr>
                      ) : (
                        slice.map((demande) => {
                          const id = pickId(demande);
                          const etat = demande?.statut ?? demande?.status;
                          const jours =
                            demande?.nbJours ??
                            demande?.nombreJours ??
                            demande?.jours ??
                            demande?.nb_days;
                          const titre = demande?.titre ?? demande?.type;

                          return (
                            <motion.tr
                              key={id}
                              variants={itemVariants}
                              className="border-t border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                              onClick={() => navigate(`/employee/demande/${id}`)}
                            >
                              <td className="px-sm py-xs text-sm text-neutral-700">
                                {formaterDate(demande?.dateDebut ?? demande?.debut)}
                              </td>
                              <td className="px-sm py-xs text-sm text-neutral-700">
                                {formaterDate(demande?.dateFin ?? demande?.fin)}
                              </td>
                              <td className="px-sm py-xs text-sm text-neutral-700">
                                {typeof jours === "number" ? jours : "--"}
                              </td>
                              <td className="px-sm py-xs text-xs">
                                <StatusBadge status={etat} icon={true} />
                              </td>
                              <td className="px-sm py-xs text-sm text-neutral-700">
                                {(() => {
                                  const raw = titre ?? demande?.typeConge ?? demande?.type;
                                  if (raw == null || String(raw).trim() === "") {
                                    return "--";
                                  }
                                  return libelleAffichageTypeConge(raw, user?.country ?? user?.pays);
                                })()}
                              </td>
                              <td className="px-sm py-xs" onClick={(e) => e.stopPropagation()}>
                                {isAttente(etat) ? (
                                  <Button
                                    size="xs"
                                    variant="danger"
                                    icon={Trash2}
                                    onClick={() => handleCancel(demande)}
                                  >
                                    Annuler
                                  </Button>
                                ) : (
                                  <span className="text-neutral-400">—</span>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between gap-md"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe === 1}
                >
                  Précédent
                </Button>
                <div className="text-sm font-medium text-neutral-600">
                  Page {pageSafe} / {totalPages}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe === totalPages}
                >
                  Suivant
                </Button>
              </motion.div>
            )}
          </>
        )}
      </ContentWrapper>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, demandeId: null, titre: "" })}
        title="Confirmer l'annulation"
        description={`Êtes-vous sûr de vouloir annuler cette demande ?`}
      >
        <div className="flex gap-sm justify-end mt-lg">
          <Button
            variant="ghost"
            onClick={() => setModal({ isOpen: false, demandeId: null, titre: "" })}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmCancel}
          >
            Confirmer l'annulation
          </Button>
        </div>
      </Modal>
    </PageContainer>
  );
}
