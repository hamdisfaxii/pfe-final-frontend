import React, { useCallback, useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
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
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <Sparkles size={20} className="text-blue-600" />
          </div>
          <p className="text-blue-900 font-semibold">Analyse intelligente en cours...</p>
        </div>
      </div>
    );
  }

  if (!aiScore) return null;

  const getRiskColor = (level) => {
    const colors = {
      FAIBLE: {
        bg: "bg-gradient-to-br from-green-50 to-emerald-50",
        border: "border-green-200",
        badge: "bg-green-100 text-green-800",
        bar: "bg-gradient-to-r from-green-500 to-emerald-500",
        icon: CheckCircle,
        text: "text-green-900"
      },
      MOYEN: {
        bg: "bg-gradient-to-br from-amber-50 to-orange-50",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-800",
        bar: "bg-gradient-to-r from-amber-500 to-orange-500",
        icon: TrendingUp,
        text: "text-amber-900"
      },
      ÉLEVÉ: {
        bg: "bg-gradient-to-br from-red-50 to-rose-50",
        border: "border-red-200",
        badge: "bg-red-100 text-red-800",
        bar: "bg-gradient-to-r from-red-500 to-rose-500",
        icon: AlertTriangle,
        text: "text-red-900"
      }
    };
    return colors[level] || colors.MOYEN;
  };

  const colors = getRiskColor(aiScore.riskLevel);
  const IconComponent = colors.icon;

  return (
    <div className={`mt-8 rounded-2xl border shadow-lg overflow-hidden ${colors.border} ${colors.bg}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-current border-opacity-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white bg-opacity-60">
              <Sparkles size={22} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analyse Intelligente</h3>
              <p className="text-xs text-gray-600 mt-1">Prédiction d'approbation</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${colors.badge} font-semibold text-sm`}>
            <IconComponent size={16} />
            {aiScore.riskLevel}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-6">
        {/* Score Principal */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-sm font-medium text-gray-700">Score d'approbation</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">{aiScore.score}</span>
              <span className="text-sm text-gray-500">/100</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
              style={{ width: `${aiScore.score}%` }}
            />
          </div>
        </div>

        {/* Facteurs d'Impact */}
        {aiScore.impactFactors && aiScore.impactFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              Facteurs positifs
            </h4>
            <div className="space-y-2">
              {aiScore.impactFactors.map((f, i) => (
                <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-white bg-opacity-50 hover:bg-opacity-100 transition-colors">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facteurs de Risque */}
        {aiScore.riskFactors && aiScore.riskFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-600" />
              Points d'attention
            </h4>
            <div className="space-y-2">
              {aiScore.riskFactors.map((f, i) => (
                <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-white bg-opacity-50 hover:bg-opacity-100 transition-colors">
                  <span className="text-orange-600 font-bold">⚡</span>
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommandation */}
        {aiScore.recommendation && (
          <div className="bg-white bg-opacity-70 rounded-xl p-4 border-l-4 border-indigo-500">
            <div className="flex gap-3">
              <Info size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{aiScore.recommendation.message}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${aiScore.recommendation.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{aiScore.recommendation.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Disclaimer */}
        <div className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900">
            <span className="font-semibold">À titre informatif :</span> L'IA aide à analyser votre demande. La décision finale reste avec votre responsable RH.
          </p>
        </div>
      </div>
    </div>
  );
}
