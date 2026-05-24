import React, { useCallback, useEffect, useState } from "react";
import api from "../utils/api";

export default function AIScoreCard({ demandeData, userId, isLoading = false }) {
  const [aiScore, setAiScore] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const calculateScore = useCallback(async () => {
    try {
      setCalculating(true);
      const { data: result } = await api.post("/demande/ai-score", { demandeData, userId });
      if (result.success && result.aiScore) setAiScore(result.aiScore);
    } catch (err) {
      console.error("AI Score error:", err);
    } finally {
      setCalculating(false);
    }
  }, [demandeData, userId]);

  useEffect(() => {
    if (!demandeData || !userId) return;
    calculateScore();
  }, [demandeData, userId, calculateScore]);

  if (isLoading || calculating) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
        <p className="text-blue-900 font-bold">🤖 Calcul du score...</p>
      </div>
    );
  }

  if (!aiScore) return null;

  const getRiskColor = (level) => {
    if (level === "FAIBLE") return { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100", bar: "bg-emerald-500" };
    if (level === "MOYEN") return { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100", bar: "bg-amber-500" };
    return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100", bar: "bg-red-500" };
  };

  const colors = getRiskColor(aiScore.riskLevel);

  return (
    <div className={`mt-6 rounded-xl border-2 ${colors.border} ${colors.bg} p-6`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold">Score Intelligent IA</h3>
        </div>
        <span className={`${colors.badge} px-3 py-1 rounded-full text-xs font-bold`}>
          {aiScore.riskLevel}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm">Score</span>
          <span className="text-3xl font-bold">{aiScore.score}</span>
          <span className="text-sm">/100</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${aiScore.score}%` }}
          ></div>
        </div>
      </div>

      {aiScore.impactFactors && aiScore.impactFactors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">📊 Impact</h4>
          {aiScore.impactFactors.map((f, i) => (
            <div key={i} className="text-sm text-slate-600">
              • {f}
            </div>
          ))}
        </div>
      )}

      {aiScore.riskFactors && aiScore.riskFactors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">⚠️ Risques</h4>
          {aiScore.riskFactors.map((f, i) => (
            <div key={i} className="text-sm text-slate-600">
              • {f}
            </div>
          ))}
        </div>
      )}

      {aiScore.recommendation && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
          <p className="font-semibold text-sm">{aiScore.recommendation.message}</p>
          <p className="text-xs text-slate-500 mt-1">
            Confiance: {aiScore.recommendation.confidence}%
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-xs text-slate-500">
        ℹ️ L'IA aide à la décision. Le RH valide finalement.
      </div>
    </div>
  );
}
