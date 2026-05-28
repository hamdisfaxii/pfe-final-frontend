import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import api from "../../utils/api";
import { normalizeCountryIsoForHr } from "../../utils/country";
import {
  PageContainer,
  ContentWrapper,
  PageHeader,
  Button,
  Card,
  CardContent,
  Spinner,
} from "../../components/ui";

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const formatDecimalFr = (val) => {
  if (val == null || !Number.isFinite(Number(val))) return "—";
  const n = Number(val);
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

const SKIPPED_SOLDE_TYPES = new Set([
  "PARENTAL",
  "ENFANT_MALADE",
  "ARRIVE_AUTORISATION",
  "SANS_SOLDE",
  "CONGE_SANS_SOLDE",
]);

const SOLDE_TYPE_LABELS = {
  CONGES_PAYES: "Congés payés",
  MALADIE: "Congé maladie",
  COURTE_DUREE: "RTT (France)",
  SORTIE_COURTE: "RTT (France)",
  SANS_SOLDE: "Autre congé",
  CONGE_SANS_SOLDE: "Autre congé",
};

const SOLDE_TYPE_DISPLAY_ORDER = [
  "MALADIE",
  "CONGES_PAYES",
  "COURTE_DUREE",
  "SORTIE_COURTE",
];

const getTypeLabel = (typeConge) => {
  const key = normalizeTypeKey(typeConge);
  return (
    SOLDE_TYPE_LABELS[key] ||
    String(key)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const getSortedSoldeTypeKeys = (keys) => {
  return [...keys]
    .filter((type) => !SKIPPED_SOLDE_TYPES.has(type))
    .sort((a, b) => {
      const idxA = SOLDE_TYPE_DISPLAY_ORDER.indexOf(a);
      const idxB = SOLDE_TYPE_DISPLAY_ORDER.indexOf(b);
      if (idxA !== -1 || idxB !== -1) {
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      }
      return String(a).localeCompare(String(b));
    });
};

const PersonGlyph = ({ className = "w-4 h-4 text-slate-400" }) => (
  <svg
    className={`shrink-0 ${className}`}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" />
  </svg>
);

const formatUser = (u) => {
  const prenom = String(u?.prenom ?? "").trim();
  const nom = String(u?.nom ?? "").trim();
  const full = [prenom, nom].filter(Boolean).join(" ").trim();
  return full || u?.email || "Utilisateur";
};

const normalizeTypeKey = (t) => String(t ?? "").toUpperCase();

const findBalanceLine = (row, typeConge) => {
  const lines = Array.isArray(row?.balances) ? row.balances : [];
  const wanted = normalizeTypeKey(typeConge);
  return lines.find((l) => normalizeTypeKey(l?.typeConge) === wanted) ?? null;
};

export default function SoldesRh() {
  const [loading, setLoading] = useState(false);
  const [savingRowId, setSavingRowId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const [data, setData] = useState({
    items: [],
    page: 0,
    size: 10,
    total: 0,
    totalPages: 0,
  });

  const [draft, setDraft] = useState(() => new Map());
  const [notesByRow, setNotesByRow] = useState(() => new Map());
  const [selectedRows, setSelectedRows] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data: resp } = await api.get("/hr/balances", {
        params: {
          q: q.trim() || undefined,
          page,
          size,
        },
      });
      setData(resp ?? {});
      setDraft(new Map());
    } catch (e) {
      setError(
        e?.response?.data?.message ??
          e?.response?.data?.error ??
          "Impossible de charger les soldes.",
      );
      setData({ items: [], page: 0, size, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, q, size]);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo(() => Array.isArray(data?.items) ? data.items : [], [data]);
  const totalPages = Number.isFinite(data?.totalPages) ? data.totalPages : 0;

  const noteKeyForRow = (row) => `${row?.user?.id}:${row?.year ?? currentYear}`;

  const onChangeRemaining = (row, typeConge, value) => {
    setError("");
    setSuccess("");
    // N'autoriser que des chiffres avec un séparateur décimal optionnel
    // (virgule ou point) ou un champ vide. On conserve la saisie brute pour
    // que l'utilisateur puisse effacer puis ressaisir librement.
    if (value !== "" && !/^\d*[.,]?\d*$/.test(value)) return;
    const key = `${row?.user?.id}:${row?.year}:${typeConge}`;
    setDraft((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  };

  const allTypeKeys = useMemo(() => {
    const keys = new Set();
    items.forEach((row) => {
      const lines = Array.isArray(row?.balances) ? row.balances : [];
      lines.forEach((line) => {
        const typeKey = normalizeTypeKey(line?.typeConge);
        if (typeKey) keys.add(typeKey);
      });
    });
    return getSortedSoldeTypeKeys(Array.from(keys));
  }, [items]);

  const cellInputValue = (row, line, typeConge, rttNotApplicable) => {
    const key = `${row?.user?.id}:${row?.year}:${typeConge}`;
    // Pendant la saisie : afficher exactement ce que l'utilisateur a tapé.
    if (draft.has(key)) return draft.get(key);
    // Cellule non applicable ou sans ligne : tiret (champ désactivé).
    if (rttNotApplicable || line == null) return "—";
    // Sinon : valeur serveur formatée fr-FR.
    return formatDecimalFr(line?.remaining);
  };

  const buildPayloadForRow = (row) => {
    const userId = row?.user?.id;
    const year = row?.year;
    if (userId == null || year == null) return null;
    const updates = [];
    for (const typeConge of allTypeKeys) {
      const k = `${userId}:${year}:${typeConge}`;
      if (!draft.has(k)) continue;
      const raw = draft.get(k);
      if (raw === "" || raw == null) continue;
      // Saisie brute : normaliser la virgule fr (7,5 → 7.5) avant de parser.
      const remaining = Number(String(raw).replace(",", "."));
      if (!Number.isFinite(remaining) || remaining < 0) continue;
      updates.push({ typeConge, remaining });
    }
    if (updates.length === 0) return null;
    return [{ userId, year, updates }];
  };

  const clearDraftForRow = (row) => {
    const userId = row?.user?.id;
    const year = row?.year;
    if (userId == null || year == null) return;
    const prefix = `${userId}:${year}:`;
    setDraft((prev) => {
      const next = new Map(prev);
      for (const k of [...next.keys()]) {
        if (String(k).startsWith(prefix)) next.delete(k);
      }
      return next;
    });
  };

  const saveRow = async (row) => {
    const payload = buildPayloadForRow(row);
    if (payload == null) {
      setError("Aucune modification sur cette ligne à enregistrer.");
      return;
    }
    setSavingRowId(row?.user?.id ?? null);
    setError("");
    setSuccess("");
    try {
      await api.put("/hr/balances", payload);
      setSuccess("Enregistré.");
      clearDraftForRow(row);
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message ??
          e?.response?.data?.error ??
          "Échec de la sauvegarde.",
      );
    } finally {
      setSavingRowId(null);
    }
  };

  const rowSelectableId = (row) => `${row?.user?.id}:${row?.year}`;
  const allSelected =
    items.length > 0 &&
    items.every((r) => selectedRows.has(rowSelectableId(r)));
  const toggleSelectAll = () => {
    if (allSelected) setSelectedRows(new Set());
    else setSelectedRows(new Set(items.map((r) => rowSelectableId(r))));
  };
  const toggleRowSelected = (row) => {
    const id = rowSelectableId(row);
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const inputCls = (readonly) =>
    [
      "w-full min-w-[4.5rem] max-w-[6.5rem] rounded border px-sm py-xs text-sm tabular-nums text-neutral-900",
      readonly
        ? "border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed"
        : "border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
    ].join(" ");

  return (
    <PageContainer>
      <ContentWrapper>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <PageHeader
            title="Soldes de congés"
            description="Consultez et gérez les soldes des employés"
            action={
              <Button
                size="sm"
                variant="secondary"
                icon={RefreshCw}
                onClick={load}
                disabled={loading || savingRowId != null}
              >
                Rafraîchir
              </Button>
            }
          />
        </motion.div>

        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-lg p-md bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-sm"
          >
            {error ? (
              <>
                <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
                <p className="text-sm text-danger-900">{error}</p>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} className="text-success-600 flex-shrink-0 mt-xs" />
                <p className="text-sm text-success-900">{success}</p>
              </>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card variant="default">
            <CardContent className="pt-lg">
              {/* Search & Pagination Controls */}
              <div className="mb-md flex flex-col sm:flex-row gap-md items-start sm:items-center">
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Rechercher…"
                    className="w-full px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <select
                  value={size}
                  onChange={(e) => {
                    setSize(clamp(Number(e.target.value), 5, 50));
                    setPage(0);
                  }}
                  className="px-sm py-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <div className="flex gap-sm">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={loading || page <= 0}
                  >
                    ←
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={loading || page >= totalPages - 1}
                  >
                    →
                  </Button>
                </div>

                <span className="text-xs text-neutral-600 whitespace-nowrap">
                  Page <span className="font-semibold">{page + 1}</span> / {Math.max(1, totalPages || 1)}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-neutral-200 rounded-lg -mx-lg">
                {loading ? (
                  <div className="py-2xl flex justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="w-10 px-sm py-xs text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            aria-label="Tout sélectionner"
                          />
                        </th>
                        <th className="px-sm py-xs font-semibold text-neutral-900 min-w-[160px]">
                          Collaborateur
                        </th>
                        {allTypeKeys.map((typeConge) => (
                          <th
                            key={typeConge}
                            className="px-sm py-xs font-semibold text-neutral-900 whitespace-nowrap"
                          >
                            {getTypeLabel(typeConge)}
                          </th>
                        ))}
                        <th className="px-sm py-xs font-semibold text-neutral-900 min-w-[140px]">
                          Note
                        </th>
                        <th className="px-sm py-xs font-semibold text-neutral-900 w-24 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={2 + allTypeKeys.length + 2}
                            className="px-sm py-md text-center text-sm text-neutral-500"
                          >
                            Aucun résultat.
                          </td>
                        </tr>
                      ) : (
                        items.map((row) => {
                          const rid = rowSelectableId(row);
                          const saving = savingRowId === row?.user?.id;
                          return (
                            <tr
                              key={rid}
                              className="border-t border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
                            >
                              <td className="px-sm py-xs text-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                  checked={selectedRows.has(rid)}
                                  onChange={() => toggleRowSelected(row)}
                                  aria-label={`Sélectionner ${formatUser(row?.user)}`}
                                />
                              </td>
                              <td className="px-sm py-xs">
                                <div className="flex items-center gap-sm">
                                  <PersonGlyph className="w-4 h-4 text-neutral-400" />
                                  <div className="min-w-0">
                                    <p className="font-medium text-neutral-900 truncate">
                                      {formatUser(row?.user)}
                                    </p>
                                    <p className="text-xs text-neutral-500 truncate">
                                      {row?.user?.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              {allTypeKeys.map((typeConge) => {
                                const line = findBalanceLine(row, typeConge);
                                const empCountry = normalizeCountryIsoForHr(row?.user?.pays);
                                const rttNotApplicable =
                                  (typeConge === "COURTE_DUREE" || typeConge === "SORTIE_COURTE") && empCountry !== "FR";
                                const ro = rttNotApplicable || Boolean(line?.readOnly) || line == null;
                                return (
                                  <td
                                    key={typeConge}
                                    className="px-sm py-xs"
                                  >
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={cellInputValue(
                                        row,
                                        line,
                                        typeConge,
                                        rttNotApplicable,
                                      )}
                                      disabled={ro || saving}
                                      onChange={(e) =>
                                        onChangeRemaining(
                                          row,
                                          typeConge,
                                          e.target.value,
                                        )
                                      }
                                      className={inputCls(ro)}
                                    />
                                  </td>
                                );
                              })}
                              <td className="px-sm py-xs">
                                <textarea
                                  rows={2}
                                  value={notesByRow.get(noteKeyForRow(row)) ?? ""}
                                  onChange={(e) => {
                                    const k = noteKeyForRow(row);
                                    setNotesByRow((prev) => {
                                      const next = new Map(prev);
                                      next.set(k, e.target.value);
                                      return next;
                                    });
                                  }}
                                  placeholder="Note…"
                                  className="w-full min-w-[120px] rounded border border-neutral-300 bg-white px-sm py-xs text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y"
                                />
                              </td>
                              <td className="px-sm py-xs text-center">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={
                                    saving ||
                                    loading ||
                                    buildPayloadForRow(row) == null
                                  }
                                  onClick={() => saveRow(row)}
                                  isLoading={saving}
                                >
                                  Enregistrer
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="mt-md text-xs text-neutral-600">
                Total : {Number.isFinite(data?.total) ? data.total : 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </ContentWrapper>
    </PageContainer>
  );
}
