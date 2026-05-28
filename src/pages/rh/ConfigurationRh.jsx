import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import {
  createExceptionalLeave,
  deleteExceptionalLeave,
  getExceptionalLeaves,
  getWorkSchedules,
  saveWorkSchedules,
  updateExceptionalLeave,
} from "../../utils/rhApi";
import { useAuth } from "../../context/authcontext";
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

const SCHEDULE_TYPES = [
  { code: "NORMAL", label: "Horaire normal" },
  { code: "SUMMER", label: "Horaire été" },
  { code: "RAMADAN", label: "Horaire Ramadan" },
];

const DAYS = [
  { idx: 0, label: "Dimanche" },
  { idx: 1, label: "Lundi" },
  { idx: 2, label: "Mardi" },
  { idx: 3, label: "Mercredi" },
  { idx: 4, label: "Jeudi" },
  { idx: 5, label: "Vendredi" },
  { idx: 6, label: "Samedi" },
];

const toInputTime = (value) => {
  if (!value) return "";
  const s = String(value);
  if (s.length >= 5) return s.slice(0, 5);
  return s;
};

const toExclusiveOptions = (activeType) => ({
  activeType,
  normalEnabled: activeType === "NORMAL",
  summerEnabled: activeType === "SUMMER",
  ramadanEnabled: activeType === "RAMADAN",
});

export default function ConfigurationRh() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeCountry, setActiveCountry] = useState("TN");
  const [rows, setRows] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editingDays, setEditingDays] = useState(0);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleType, setScheduleType] = useState("NORMAL");
  const [scheduleOptions, setScheduleOptions] = useState({
    activeType: "NORMAL",
    normalEnabled: true,
    summerEnabled: true,
    ramadanEnabled: true,
  });
  const [pendingActiveType, setPendingActiveType] = useState("NORMAL");
  const [scheduleRows, setScheduleRows] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editingTimes, setEditingTimes] = useState({
    start: "",
    end: "",
  });

  const activeCountryInfo = useMemo(
    () => COUNTRIES.find((c) => c.code === activeCountry) || COUNTRIES[0],
    [activeCountry],
  );

  const load = useCallback(
    async (countryCode = activeCountry) => {
      setLoading(true);
      setError("");
      try {
        setRows(await getExceptionalLeaves(countryCode));
      } catch {
        setRows([]);
        setError("Impossible de charger les congés exceptionnels.");
      } finally {
        setLoading(false);
      }
    },
    [activeCountry],
  );

  useEffect(() => {
    load(activeCountry);
    setEditingId(null);
    setShowAddForm(false);
  }, [activeCountry, load]);

  useEffect(() => {
    const userCountry = String(user?.country ?? "")
      .trim()
      .toUpperCase();
    if (
      userCountry &&
      COUNTRIES.some((c) => c.code === userCountry) &&
      userCountry !== activeCountry
    ) {
      setActiveCountry(userCountry);
    }
  }, [user?.country, activeCountry]);

  const loadSchedule = useCallback(
    async (country = activeCountry, type = scheduleType) => {
      setScheduleLoading(true);
      setScheduleError("");
      try {
        const data = await getWorkSchedules(country, type);
        const resolvedActiveType = String(
          data?.activeType || type,
        ).toUpperCase();
        setScheduleOptions(toExclusiveOptions(resolvedActiveType));
        setPendingActiveType(resolvedActiveType);
        const incoming = Array.isArray(data?.rows) ? data.rows : [];
        const byDay = new Map(incoming.map((r) => [r.dayOfWeek, r]));
        const fullRows = DAYS.map((d) => {
          const row = byDay.get(d.idx) || {};
          return {
            dayOfWeek: d.idx,
            firstStart: toInputTime(row.firstStart),
            firstEnd: toInputTime(row.firstEnd),
            secondStart: toInputTime(row.secondStart),
            secondEnd: toInputTime(row.secondEnd),
          };
        });
        setScheduleRows(fullRows);
      } catch {
        setScheduleRows(
          DAYS.map((d) => ({
            dayOfWeek: d.idx,
            firstStart: "",
            firstEnd: "",
            secondStart: "",
            secondEnd: "",
          })),
        );
        setScheduleError("Impossible de charger les horaires de travail.");
      } finally {
        setScheduleLoading(false);
      }
    },
    [activeCountry, scheduleType],
  );

  useEffect(() => {
    loadSchedule(activeCountry, scheduleType);
    setEditingCell(null);
  }, [activeCountry, scheduleType, loadSchedule]);

  const persistSchedule = async (
    nextRows,
    nextOptions = scheduleOptions,
    nextType = scheduleType,
  ) => {
    setScheduleSaving(true);
    setScheduleError("");
    try {
      const payload = {
        countryCode: activeCountry,
        scheduleType: nextType,
        activeType: nextOptions.activeType,
        normalEnabled: nextOptions.normalEnabled,
        summerEnabled: nextOptions.summerEnabled,
        ramadanEnabled: nextOptions.ramadanEnabled,
        rows: (nextRows || []).map((row) => ({
          dayOfWeek: row.dayOfWeek,
          firstStart: row.firstStart || null,
          firstEnd: row.firstEnd || null,
          secondStart: row.secondStart || null,
          secondEnd: row.secondEnd || null,
        })),
      };
      const saved = await saveWorkSchedules(payload);
      const resolvedActiveType = String(
        saved?.activeType || nextType,
      ).toUpperCase();
      setScheduleOptions(toExclusiveOptions(resolvedActiveType));
      setPendingActiveType(resolvedActiveType);
      const incoming = Array.isArray(saved?.rows) ? saved.rows : [];
      const byDay = new Map(incoming.map((r) => [r.dayOfWeek, r]));
      setScheduleRows(
        DAYS.map((d) => {
          const row = byDay.get(d.idx) || {};
          return {
            dayOfWeek: d.idx,
            firstStart: toInputTime(row.firstStart),
            firstEnd: toInputTime(row.firstEnd),
            secondStart: toInputTime(row.secondStart),
            secondEnd: toInputTime(row.secondEnd),
          };
        }),
      );
    } catch {
      setScheduleError("Impossible de sauvegarder les horaires.");
    } finally {
      setScheduleSaving(false);
    }
  };

  const queueScheduleActivation = (type) => {
    setPendingActiveType(type);
  };

  const confirmScheduleActivation = async () => {
    if (pendingActiveType === scheduleOptions.activeType) return;
    const nextOptions = toExclusiveOptions(pendingActiveType);
    await persistSchedule(scheduleRows, nextOptions, scheduleType);
  };

  const activateTab = (type) => {
    setScheduleType(type);
  };

  const openEditCell = (dayOfWeek, session) => {
    const row = scheduleRows.find((r) => r.dayOfWeek === dayOfWeek);
    if (!row) return;
    const isFirst = session === 1;
    setEditingCell({ dayOfWeek, session });
    setEditingTimes({
      start: isFirst ? row.firstStart : row.secondStart,
      end: isFirst ? row.firstEnd : row.secondEnd,
    });
  };

  const saveCell = async () => {
    if (!editingCell) return;
    const { dayOfWeek, session } = editingCell;
    const nextRows = scheduleRows.map((row) => {
      if (row.dayOfWeek !== dayOfWeek) return row;
      if (session === 1) {
        return {
          ...row,
          firstStart: editingTimes.start,
          firstEnd: editingTimes.end,
        };
      }
      return {
        ...row,
        secondStart: editingTimes.start,
        secondEnd: editingTimes.end,
      };
    });
    setScheduleRows(nextRows);
    setEditingCell(null);
    await persistSchedule(nextRows);
  };

  const handleToggleEnabled = async (row) => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateExceptionalLeave(row.id, {
        countryCode: activeCountry,
        label: row.label,
        daysPerYear: row.daysPerYear,
        enabled: !row.enabled,
      });
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, ...updated } : r)),
      );
    } catch {
      setError("Impossible de mettre à jour l'état du congé.");
    } finally {
      setSaving(false);
    }
  };

  const saveEditedDays = async (row) => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateExceptionalLeave(row.id, {
        countryCode: activeCountry,
        label: row.label,
        daysPerYear: Number(editingDays || 0),
        enabled: row.enabled,
      });
      setEditingId(null);
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, ...updated } : r)),
      );
    } catch {
      setError("Impossible de sauvegarder le nombre de jours.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(`Supprimer "${row.label}" ?`);
    if (!ok) return;
    setSaving(true);
    setError("");
    try {
      await deleteExceptionalLeave(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      setError("Impossible de supprimer le congé exceptionnel.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) {
      setError("Veuillez saisir un libellé.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createExceptionalLeave({
        countryCode: activeCountry,
        label: newLabel.trim(),
        daysPerYear: Number(newDays || 0),
        enabled: true,
      });
      setNewLabel("");
      setNewDays(0);
      setShowAddForm(false);
      await load(activeCountry);
    } catch {
      setError("Impossible d'ajouter le congé exceptionnel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title="Configuration RH"
            description="Gérez les congés exceptionnels et les horaires de travail"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-sm">
          <Card variant="default">
            <CardContent className="pt-sm">
              <h2 className="text-lg font-semibold text-neutral-900 mb-sm">
                Congés exceptionnels
              </h2>

              <div className="mb-sm">
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowAddForm((prev) => !prev)}
                >
                  Nouveau Congé Exceptionnel
                </Button>
              </div>

              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-sm p-sm bg-neutral-50 border border-neutral-200 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Libellé (ex: Mariage)"
                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      min={0}
                      value={newDays}
                      onChange={(e) => setNewDays(e.target.value)}
                      placeholder="Nbr jrs/an"
                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <Button
                      variant="success"
                      onClick={handleCreate}
                      disabled={saving}
                      isLoading={saving}
                    >
                      Ajouter
                    </Button>
                  </div>
                </motion.div>
              )}

              <div className="mb-sm flex gap-sm flex-wrap">
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

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-sm p-sm bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-sm"
                >
                  <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
                  <p className="text-sm text-danger-900">{error}</p>
                </motion.div>
              )}

              {loading ? (
                <div className="py-2xl flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto border border-neutral-200 rounded-lg -mx-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Libellé</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Nbr jrs/an</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Modifier</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Actif</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Supprimer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-neutral-200 hover:bg-neutral-50 transition-colors"
                        >
                          <td className="px-sm py-xs text-neutral-900">{row.label}</td>
                          <td className="px-sm py-xs text-neutral-900">
                            {editingId === row.id ? (
                              <input
                                type="number"
                                min={0}
                                value={editingDays}
                                onChange={(e) => setEditingDays(e.target.value)}
                                className="w-24 px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                              />
                            ) : (
                              row.daysPerYear
                            )}
                          </td>
                          <td className="px-sm py-xs">
                            {editingId === row.id ? (
                              <Button
                                size="sm"
                                variant="success"
                                icon={Check}
                                onClick={() => saveEditedDays(row)}
                                disabled={saving}
                              />
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                icon={Edit2}
                                onClick={() => {
                                  setEditingId(row.id);
                                  setEditingDays(row.daysPerYear);
                                }}
                              />
                            )}
                          </td>
                          <td className="px-sm py-xs">
                            <input
                              type="checkbox"
                              checked={Boolean(row.enabled)}
                              onChange={() => handleToggleEnabled(row)}
                              disabled={saving}
                              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-sm py-xs">
                            <Button
                              size="sm"
                              variant="danger"
                              icon={Trash2}
                              onClick={() => handleDelete(row)}
                              disabled={saving}
                            />
                          </td>
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-md py-lg text-center text-neutral-500">
                            Aucun congé exceptionnel configuré.
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

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card variant="default">
            <CardContent className="pt-lg">
              <h2 className="text-xl font-semibold text-neutral-900 mb-sm">
                Horaires de travail
              </h2>

              {/* Active Schedule Type Selector */}
              <div className="mb-sm p-sm bg-neutral-50 border border-neutral-200 rounded-lg">
                <p className="text-sm font-semibold text-neutral-900 mb-md">Type d'horaire actif :</p>
                <div className="flex flex-wrap items-center gap-sm mb-md">
                  {["NORMAL", "SUMMER", "RAMADAN"].map((type) => (
                    <label key={type} className="inline-flex items-center gap-xs text-sm text-neutral-900">
                      <input
                        type="radio"
                        name="activeSchedule"
                        checked={pendingActiveType === type}
                        onChange={() => queueScheduleActivation(type)}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                      <span>{type === "NORMAL" ? "Normal" : type === "SUMMER" ? "Été" : "Ramadan"}</span>
                    </label>
                  ))}
                </div>
                {pendingActiveType !== scheduleOptions.activeType && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={confirmScheduleActivation}
                    disabled={scheduleSaving}
                    isLoading={scheduleSaving}
                  >
                    Confirmer
                  </Button>
                )}
              </div>

              {/* Schedule Type Tabs */}
              <div className="mb-sm flex gap-sm flex-wrap">
                {SCHEDULE_TYPES.map((tab) => (
                  <Button
                    key={tab.code}
                    size="sm"
                    variant={scheduleType === tab.code ? "primary" : "secondary"}
                    onClick={() => activateTab(tab.code)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {scheduleError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-sm p-sm bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-sm"
                >
                  <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
                  <p className="text-sm text-danger-900">{scheduleError}</p>
                </motion.div>
              )}

              {scheduleLoading ? (
                <div className="py-2xl flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto border border-neutral-200 rounded-lg -mx-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">Jour</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">1ère séance</th>
                        <th className="px-sm py-xs text-left font-semibold text-neutral-900">2ème séance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => {
                        const row = scheduleRows.find(
                          (r) => r.dayOfWeek === day.idx,
                        ) || {
                          firstStart: "",
                          firstEnd: "",
                          secondStart: "",
                          secondEnd: "",
                        };
                        const firstEdit =
                          editingCell?.dayOfWeek === day.idx &&
                          editingCell?.session === 1;
                        const secondEdit =
                          editingCell?.dayOfWeek === day.idx &&
                          editingCell?.session === 2;

                        return (
                          <tr key={day.idx} className="border-t border-neutral-200 hover:bg-neutral-50 transition-colors">
                            <td className="px-sm py-xs font-medium text-neutral-900">{day.label}</td>
                            <td className="px-sm py-xs">
                              <div className="flex items-center justify-between gap-sm">
                                {firstEdit ? (
                                  <div className="flex items-center gap-sm">
                                    <input
                                      type="time"
                                      value={editingTimes.start}
                                      onChange={(e) =>
                                        setEditingTimes((p) => ({
                                          ...p,
                                          start: e.target.value,
                                        }))
                                      }
                                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                    <span className="text-neutral-500">-</span>
                                    <input
                                      type="time"
                                      value={editingTimes.end}
                                      onChange={(e) =>
                                        setEditingTimes((p) => ({
                                          ...p,
                                          end: e.target.value,
                                        }))
                                      }
                                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-neutral-600">
                                    {row.firstStart && row.firstEnd
                                      ? `${row.firstStart} - ${row.firstEnd}`
                                      : "-"}
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  icon={firstEdit ? Check : Edit2}
                                  disabled={scheduleSaving}
                                  onClick={() =>
                                    firstEdit
                                      ? saveCell()
                                      : openEditCell(day.idx, 1)
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-sm py-xs">
                              <div className="flex items-center justify-between gap-sm">
                                {secondEdit ? (
                                  <div className="flex items-center gap-sm">
                                    <input
                                      type="time"
                                      value={editingTimes.start}
                                      onChange={(e) =>
                                        setEditingTimes((p) => ({
                                          ...p,
                                          start: e.target.value,
                                        }))
                                      }
                                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                    <span className="text-neutral-500">-</span>
                                    <input
                                      type="time"
                                      value={editingTimes.end}
                                      onChange={(e) =>
                                        setEditingTimes((p) => ({
                                          ...p,
                                          end: e.target.value,
                                        }))
                                      }
                                      className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-neutral-600">
                                    {row.secondStart && row.secondEnd
                                      ? `${row.secondStart} - ${row.secondEnd}`
                                      : "-"}
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  icon={secondEdit ? Check : Edit2}
                                  disabled={scheduleSaving}
                                  onClick={() =>
                                    secondEdit
                                      ? saveCell()
                                      : openEditCell(day.idx, 2)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
