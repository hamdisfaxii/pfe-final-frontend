import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "./commun/Spinner";
import { getHrRequests } from "../utils/rhApi";

export default function AIValidationModule() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await getHrRequests({ status: "PENDING" });
        if (active) setDemandes(rows);
      } catch {
        if (active) setError("Impossible de charger les demandes en attente.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8">
        <Spinner size={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-xl border-l-4 border-red-500 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <div className="text-red-500 mt-0.5">⚠️</div>
          <div className="text-sm font-medium text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  if (demandes.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">✅ Aucune demande en attente</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Demandes en attente
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {demandes.length} demande{demandes.length > 1 ? "s" : ""} à traiter
          </p>
        </div>
        <Link
          to="/rh/demandes"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
        >
          Voir tout
        </Link>
      </div>

      <div className="space-y-3">
        {demandes.slice(0, 5).map((demande) => (
          <Link
            key={demande.id}
            to={`/rh/demandes/${demande.id}`}
            className="block rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900 text-sm">
                    {demande.typeConge}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    En attente
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  👤 {[demande.employe?.prenom, demande.employe?.nom].filter(Boolean).join(" ") || demande.employe?.email || "Employé"}
                </p>
                {demande.dateDebut && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    📅 {demande.dateDebut} → {demande.dateFin}
                    {demande.nombreJours ? ` (${demande.nombreJours} j)` : ""}
                  </p>
                )}
              </div>
              <span className="text-slate-400 text-sm">›</span>
            </div>
          </Link>
        ))}
      </div>

      {demandes.length > 5 && (
        <div className="mt-4 text-center">
          <Link
            to="/rh/demandes"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            + {demandes.length - 5} autres demandes
          </Link>
        </div>
      )}
    </div>
  );
}
