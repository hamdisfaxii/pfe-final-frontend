import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import useDemandes from "../../hooks/useDemandes";
import api from "../../utils/api";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  CardContent,
  Spinner,
} from "../../components/ui";

export default function CongesExceptionnels() {
  const navigate = useNavigate();
  const { creerDemande } = useDemandes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [selectedId, setSelectedId] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [motif, setMotif] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const selected = useMemo(
    () => items.find((i) => String(i.id) === String(selectedId)) || null,
    [items, selectedId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/exceptional-leaves/available");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError("Impossible de charger les congés exceptionnels.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setSuccess("");
    if (!selectedId) {
      setError("Veuillez sélectionner un congé exceptionnel.");
      return;
    }
    if (!dateDebut || !dateFin) {
      setError("Veuillez sélectionner une période.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const demande = await creerDemande({
        titre: "Congé exceptionnel",
        dateDebut,
        dateFin,
        commentaire: motif,
        exceptionalLeaveConfigId: Number(selectedId),
      });

      if (file && demande?.id) {
        const fd = new FormData();
        fd.append("file", file);
        await api.post(`/conge/${demande.id}/attachments`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSuccess("Demande créée avec succès.");
      setMotif("");
      setFile(null);
      setDateDebut("");
      setDateFin("");
      setSelectedId("");
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        (typeof e?.response?.data === "string" ? e.response.data : null);
      setError(msg || "Impossible de créer la demande.");
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
            title="Congés exceptionnels"
            description="Demandez un congé exceptionnel selon votre pays"
            action={
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate(-1)}
              >
                Retour
              </Button>
            }
          />
        </motion.div>

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

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-lg p-sm bg-success-50 border border-success-200 rounded-lg flex items-start gap-sm"
          >
            <CheckCircle2 size={20} className="text-success-600 flex-shrink-0 mt-xs" />
            <p className="text-sm text-success-900">{success}</p>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-lg"
        >
          {/* Available Leaves */}
          <motion.div variants={itemVariants}>
            <Card variant="default">
              <CardContent className="pt-lg">
                <h2 className="text-lg font-semibold text-neutral-900 mb-md">
                  Disponibles pour votre pays
                </h2>

                {loading ? (
                  <div className="mt-lg">
                    <Spinner size="sm" />
                    <p className="text-sm text-neutral-600 mt-sm">Chargement des congés exceptionnels...</p>
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-sm">
                    {items.map((it) => {
                      const isSelected = String(it.id) === String(selectedId);
                      return (
                        <motion.div
                          key={it.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-sm py-xs hover:bg-neutral-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-neutral-900">{it.label}</p>
                            <p className="text-xs text-neutral-500 mt-xs">
                              Quota annuel: {it.daysPerYear ?? 0} j — Restant: {it.remainingDays ?? "—"} j
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={isSelected ? "primary" : "secondary"}
                            onClick={() => setSelectedId(String(it.id))}
                          >
                            {isSelected ? "Sélectionné" : "Choisir"}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-sm text-sm text-neutral-600 text-center">
                    Aucun congé exceptionnel n'est configuré pour votre pays.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* New Request Form */}
          <motion.div variants={itemVariants}>
            <Card variant="default">
              <CardContent className="pt-lg">
                <h2 className="text-lg font-semibold text-neutral-900 mb-md">
                  Nouvelle demande
                </h2>

                <div className="space-y-md">
                  {/* Type */}
                  <div>
                    <label htmlFor="exc-type" className="block text-sm font-semibold text-neutral-900 mb-xs">
                      Type <span className="text-danger-600">*</span>
                    </label>
                    <select
                      id="exc-type"
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="">— Sélectionner —</option>
                      {items.map((it) => (
                        <option key={it.id} value={String(it.id)}>
                          {it.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                    <div>
                      <label htmlFor="exc-start" className="block text-sm font-semibold text-neutral-900 mb-xs">
                        Date début <span className="text-danger-600">*</span>
                      </label>
                      <input
                        id="exc-start"
                        type="date"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                        className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="exc-end" className="block text-sm font-semibold text-neutral-900 mb-xs">
                        Date fin <span className="text-danger-600">*</span>
                      </label>
                      <input
                        id="exc-end"
                        type="date"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                        className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label htmlFor="exc-reason" className="block text-sm font-semibold text-neutral-900 mb-xs">
                      Motif <span className="text-neutral-500 font-normal text-xs">(optionnel)</span>
                    </label>
                    <textarea
                      id="exc-reason"
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      placeholder="Expliquez les raisons de votre demande..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label htmlFor="exc-file" className="block text-sm font-semibold text-neutral-900 mb-xs">
                      Justificatif <span className="text-neutral-500 font-normal text-xs">(optionnel)</span>
                    </label>
                    <input
                      id="exc-file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all file:mr-sm file:py-xs file:px-sm file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-sm justify-end pt-md border-t border-neutral-200">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(-1)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      variant="success"
                      onClick={submit}
                      disabled={saving || !selected}
                      isLoading={saving}
                    >
                      Soumettre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </ContentWrapper>
    </PageContainer>
  );
}

