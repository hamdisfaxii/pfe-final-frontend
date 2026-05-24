import React, { useEffect, useMemo, useState } from "react";
import {
  applyPublicHoliday,
  bulkApplyPublicHolidays,
  bulkDeletePublicHolidays,
  createPublicHoliday,
  deletePublicHoliday,
  getPublicHolidays,
  updatePublicHoliday,
} from "../../utils/rhApi";
import Spinner from "../../components/commun/Spinner";
import { HR_COUNTRY_LIST } from "../../utils/country";

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

  const activeCountryInfo = useMemo(
    () => COUNTRIES.find((c) => c.code === activeCountry) || COUNTRIES[0],
    [activeCountry],
  );

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 fade-in-up">
          <h1 className="text-4xl font-bold text-slate-900">Jours fériés</h1>
          <p className="mt-3 text-sm text-slate-600">
            Les jours fériés officiels (TN, FR, MA) sont synchronisés automatiquement pour l'année choisie (source Nager,
            repli local hors ligne).
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setShowAddForm((prev) => !prev);
                setError("");
                if (!newHolidayDate) {
                  setNewHolidayDate(`${year}-01-01`);
                }
              }}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-lg transition-all"
            >
              + Nouveau Jour Férié
            </button>
          </div>

          {showAddForm && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={newHolidayLabel}
                  onChange={(e) => setNewHolidayLabel(e.target.value)}
                  placeholder="Libellé (ex: Aïd El Fitr)"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCreateHoliday}
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-all disabled:opacity-60"
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Année :</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[year - 1, year, year + 1, year + 2].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-0">
            {COUNTRIES.map((country) => {
              const active = country.code === activeCountry;
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => setActiveCountry(country.code)}
                  className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="mr-2">{country.flag}</span>
                  {country.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-red-500 mt-0.5">⚠️</div>
                <div className="text-sm font-medium text-red-700">{error}</div>
              </div>
            </div>
          )}

          {selectedIds.size > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <span className="text-sm font-semibold text-blue-800">
                {selectedIds.size} jour{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkApply(true)}
                  disabled={saving}
                  className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition-all disabled:opacity-60"
                >
                  Activer
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkApply(false)}
                  disabled={saving}
                  className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition-all disabled:opacity-60"
                >
                  Désactiver
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={saving}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-all disabled:opacity-60"
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Annuler la sélection
                </button>
              </div>
            </div>
          )}

          {loading && holidays.length === 0 ? (
            <div className="mt-8">
              <Spinner size={3} />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                {activeCountryInfo.flag} {activeCountryInfo.label}
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        disabled={holidays.length === 0}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </th>
                    <th className="p-4 font-semibold text-slate-900">Libellé</th>
                    <th className="p-4 font-semibold text-slate-900">Date du jour</th>
                    <th className="p-4 font-semibold text-slate-900">Modifier</th>
                    <th className="p-4 font-semibold text-slate-900">Appliquer</th>
                    <th className="p-4 font-semibold text-slate-900">Supprimer</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading || saving) && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        Chargement...
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    !saving &&
                    holidays.map((h) => {
                      const isEditing = editingId === h.id;
                      const isSelected = selectedIds.has(h.id);
                      return (
                        <tr
                          key={h.id ?? `${h.libelle}-${h.dateJour}`}
                          className={`border-t border-slate-100 transition-colors ${
                            isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(h.id)}
                              disabled={isEditing}
                              className="h-4 w-4 accent-blue-600"
                            />
                          </td>
                          <td className="p-4 text-slate-700">
                            {isEditing ? (
                              <input
                                value={editingLabel}
                                onChange={(e) => setEditingLabel(e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              h.libelle
                            )}
                          </td>
                          <td className="p-4 text-slate-700">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editingDate}
                                onChange={(e) => setEditingDate(e.target.value)}
                                className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              h.dateJour
                                ? new Date(h.dateJour).toLocaleDateString("fr-FR")
                                : "-"
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(h)}
                                  disabled={saving}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  title="Sauvegarder"
                                >
                                  ✓
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  title="Annuler"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(h)}
                                disabled={saving || selectedIds.size > 0}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 hover:bg-cyan-200 disabled:opacity-40"
                                title="Modifier"
                              >
                                ✎
                              </button>
                            )}
                          </td>
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={Boolean(h.active)}
                              onChange={() => handleApply(h)}
                              disabled={saving || isEditing || selectedIds.size > 0}
                              className="h-4 w-4 accent-blue-600"
                            />
                          </td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleDelete(h)}
                              disabled={saving || isEditing || selectedIds.size > 0}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-all disabled:opacity-40"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {!loading && !saving && holidays.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        Aucun jour férié trouvé pour {year}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
