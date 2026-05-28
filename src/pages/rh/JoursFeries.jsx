import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Plus, Trash2, Edit2, Check, X, CheckCircle2 } from "lucide-react";
import {
  applyPublicHoliday,
  bulkApplyPublicHolidays,
  bulkDeletePublicHolidays,
  createPublicHoliday,
  deletePublicHoliday,
  getPublicHolidays,
  updatePublicHoliday,
} from "../../utils/rhApi";
import { HR_COUNTRY_LIST } from "../../utils/country";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  CardContent,
  Spinner,
} from "../../components/ui";

const COUNTRIES = HR_COUNTRY_LIST;

export default function JoursFeries() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeCountry, setActiveCountry] = useState("TN");
  const [holidays, setHolidays] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHolidayLabel, setNewHolidayLabel] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());


  const refreshList = async (countryCode = activeCountry, selectedYear = year) => {
    setLoading(true);
    setError("");
    try {
      const rows = await getPublicHolidays(countryCode, selectedYear);
      setHolidays([...rows].sort((a, b) => String(a.dateJour ?? "").localeCompare(String(b.dateJour ?? ""))));
    } catch {
      setHolidays([]);
      setError("Impossible de charger les jours fériés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedIds(new Set());
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const rows = await getPublicHolidays(activeCountry, year);
        if (!cancelled) {
          setHolidays([...rows].sort((a, b) => String(a.dateJour ?? "").localeCompare(String(b.dateJour ?? ""))));
        }
      } catch {
        if (!cancelled) {
          setHolidays([]);
          setError("Impossible de charger les jours fériés.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCountry, year]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === holidays.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(holidays.map((h) => h.id)));
    }
  };

  const allSelected = holidays.length > 0 && selectedIds.size === holidays.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < holidays.length;

  const handleCreateHoliday = async () => {
    if (!newHolidayLabel.trim() || !newHolidayDate) {
      setError("Veuillez saisir le libellé et la date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createPublicHoliday({
        countryCode: activeCountry,
        libelle: newHolidayLabel.trim(),
        dateJour: newHolidayDate,
      });
      setShowAddForm(false);
      setNewHolidayLabel("");
      setNewHolidayDate("");
      await refreshList(activeCountry, year);
    } catch {
      setError("Ajout du jour férié impossible.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (h) => {
    setEditingId(h.id);
    setEditingLabel(h.libelle ?? "");
    setEditingDate(h.dateJour ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingLabel("");
    setEditingDate("");
  };

  const saveEdit = async (h) => {
    if (!editingLabel.trim() || !editingDate) {
      setError("Veuillez renseigner le libellé et la date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updatePublicHoliday(h.id, {
        countryCode: activeCountry,
        libelle: editingLabel.trim(),
        dateJour: editingDate,
      });
      setEditingId(null);
      await refreshList(activeCountry, year);
    } catch {
      setError("Impossible de modifier ce jour férié.");
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (row) => {
    setSaving(true);
    setError("");
    try {
      await applyPublicHoliday(row.id, !row.active);
      await refreshList(activeCountry, year);
    } catch {
      setError("Impossible de changer l'état du jour férié.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    setSaving(true);
    setError("");
    try {
      await deletePublicHoliday(row.id);
      await refreshList(activeCountry, year);
    } catch {
      setError("Impossible de supprimer ce jour férié.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkApply = async (applied) => {
    if (selectedIds.size === 0) return;
    setSaving(true);
    setError("");
    try {
      await bulkApplyPublicHolidays([...selectedIds], applied);
      setSelectedIds(new Set());
      await refreshList(activeCountry, year);
    } catch {
      setError("Impossible de modifier l'état des jours fériés sélectionnés.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setSaving(true);
    setError("");
    try {
      await bulkDeletePublicHolidays([...selectedIds]);
      setSelectedIds(new Set());
      await refreshList(activeCountry, year);
    } catch {
      setError("Impossible de supprimer les jours fériés sélectionnés.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title="Jours fériés"
            description="Gérez les jours fériés officiels pour chaque pays"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-lg">
          <Card variant="default">
            <CardContent className="pt-lg">
              {/* Add Form */}
              <div className="mb-lg">
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => {
                    setShowAddForm((prev) => !prev);
                    setError("");
                    if (!newHolidayDate) {
                      setNewHolidayDate(`${year}-01-01`);
                    }
                  }}
                  disabled={saving}
                >
                  Nouveau Jour Férié
                </Button>
              </div>

              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-lg p-md bg-neutral-50 border border-neutral-200 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <input
                      type="text"
                      value={newHolidayLabel}
                      onChange={(e) => setNewHolidayLabel(e.target.value)}
                      placeholder="Libellé (ex: Aïd El Fitr)"
                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="date"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <Button
                      variant="success"
                      onClick={handleCreateHoliday}
                      disabled={saving}
                      isLoading={saving}
                    >
                      Ajouter
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Year & Country Controls */}
              <div className="mb-lg flex flex-col sm:flex-row gap-md items-start sm:items-center">
                <div className="flex items-center gap-sm">
                  <label htmlFor="year-select" className="text-sm font-semibold text-neutral-900">Année :</label>
                  <select
                    id="year-select"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    {[year - 1, year, year + 1, year + 2].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-sm flex-wrap">
                  {COUNTRIES.map((country) => {
                    const active = country.code === activeCountry;
                    return (
                      <Button
                        key={country.code}
                        size="sm"
                        variant={active ? "primary" : "secondary"}
                        onClick={() => setActiveCountry(country.code)}
                      >
                        <span className="mr-xs">{country.flag}</span>
                        {country.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

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

              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-lg p-md bg-primary-50 border border-primary-200 rounded-lg"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-md justify-between">
                    <p className="text-sm font-semibold text-primary-900">
                      {selectedIds.size} jour{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
                    </p>
                    <div className="flex gap-sm flex-wrap">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleBulkApply(true)}
                        disabled={saving}
                        isLoading={saving}
                      >
                        Activer
                      </Button>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleBulkApply(false)}
                        disabled={saving}
                      >
                        Désactiver
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={handleBulkDelete}
                        disabled={saving}
                      >
                        Supprimer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedIds(new Set())}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Table */}
              {loading && holidays.length === 0 ? (
                <div className="py-2xl flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto border border-neutral-200 rounded-lg -mx-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="w-10 px-sm py-xs text-center">
                          <input
                            type="checkbox"
                            ref={(el) => {
                              if (el) el.indeterminate = someSelected;
                            }}
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            disabled={holidays.length === 0}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Libellé</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Date</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Modifier</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Actif</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Supprimer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(loading || saving) && (
                        <tr>
                          <td colSpan={6} className="px-md py-lg text-center text-neutral-500">
                            Chargement...
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        !saving &&
                        holidays.map((h) => {
                          const isEditing = editingId === h.id;
                          const isSelected = selectedIds.has(h.id);
                          const rowClassName = isSelected ? "bg-primary-50" : "hover:bg-neutral-50";
                          return (
                            <tr
                              key={h.id ?? `${h.libelle}-${h.dateJour}`}
                              className={`border-t border-neutral-200 transition-colors ${rowClassName}`}
                            >
                              <td className="px-sm py-xs text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelect(h.id)}
                                  disabled={isEditing}
                                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-sm py-xs text-neutral-900">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingLabel}
                                    onChange={(e) => setEditingLabel(e.target.value)}
                                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                  />
                                ) : (
                                  h.libelle
                                )}
                              </td>
                              <td className="px-sm py-xs text-neutral-900">
                                {isEditing ? (
                                  <input
                                    type="date"
                                    value={editingDate}
                                    onChange={(e) => setEditingDate(e.target.value)}
                                    className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                  />
                                ) : (
                                  h.dateJour
                                    ? new Date(h.dateJour).toLocaleDateString("fr-FR")
                                    : "-"
                                )}
                              </td>
                              <td className="px-sm py-xs">
                                {isEditing ? (
                                  <div className="flex items-center gap-xs">
                                    <Button
                                      size="sm"
                                      variant="success"
                                      icon={Check}
                                      onClick={() => saveEdit(h)}
                                      disabled={saving}
                                    />
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      icon={X}
                                      onClick={cancelEdit}
                                    />
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    icon={Edit2}
                                    onClick={() => startEdit(h)}
                                    disabled={saving || selectedIds.size > 0}
                                  />
                                )}
                              </td>
                              <td className="px-sm py-xs">
                                <input
                                  type="checkbox"
                                  checked={Boolean(h.active)}
                                  onChange={() => handleApply(h)}
                                  disabled={saving || isEditing || selectedIds.size > 0}
                                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-sm py-xs">
                                <Button
                                  size="sm"
                                  variant="danger"
                                  icon={Trash2}
                                  onClick={() => handleDelete(h)}
                                  disabled={saving || isEditing || selectedIds.size > 0}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      {!loading && !saving && holidays.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-md py-lg text-center text-neutral-500">
                            Aucun jour férié trouvé pour {year}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </ContentWrapper>
    </PageContainer>
  );
}
