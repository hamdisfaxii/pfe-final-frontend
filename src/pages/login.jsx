import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";

function readApiErrorPayload(err) {
  const d = err?.response?.data;
  if (d == null) return { code: null, text: null, detail: null };
  if (typeof d === "string") return { code: null, text: d, detail: null };
  const code = d.code ?? d.errorCode ?? null;
  const text =
    d.error ??
    d.message ??
    d.title ??
    (Array.isArray(d.errors) && d.errors[0]?.defaultMessage) ??
    null;
  const detail = d.detail ?? d.path ?? null;
  return { code, text, detail };
}

/**
 * Message lisible sur la page /login (2 lignes : type + explication), sans ouvrir la console.
 */
function getLoginErrorMessage(err) {
  const status = err?.response?.status;
  const { code, text, detail } = readApiErrorPayload(err);

  if (!err?.response || err?.code === "ERR_NETWORK") {
    return [
      "Impossible de joindre le serveur",
      "Vérifiez que le backend est démarré (http://localhost:8080) et que le pare-feu ne bloque pas la connexion.",
    ].join("\n");
  }

  if (err?.code === "ECONNABORTED") {
    return [
      "Délai d’attente dépassé",
      "Le serveur ne répond pas assez vite. Réessayez.",
    ].join("\n");
  }

  if (status === 400 && code === "MISSING_CREDENTIALS") {
    return [
      "Champs incomplets",
      text || "Saisissez votre email et votre mot de passe.",
    ].join("\n");
  }

  if (status === 401) {
    if (code === "USER_NOT_FOUND") {
      return [
        "Compte introuvable",
        text ||
          "Aucun employé ne correspond à cet email. Vérifiez votre identifiant ou contactez le RH.",
      ].join("\n");
    }
    if (code === "INVALID_PASSWORD") {
      return [
        "Mot de passe incorrect",
        text ||
          "Le mot de passe ne correspond pas au compte. Vérifiez les majuscules / minuscules.",
      ].join("\n");
    }
    const low = String(text || "").toLowerCase();
    if (low.includes("utilisateur") && low.includes("trouv")) {
      return [
        "Compte inconnu",
        text || "Aucun utilisateur avec cet email.",
      ].join("\n");
    }
    if (
      low.includes("employé") ||
      low.includes("employe") ||
      low.includes("introuvable") ||
      low.includes("inexistant") ||
      low.includes("aucun employé")
    ) {
      return [
        "Compte introuvable",
        text || "L’utilisateur n’existe pas dans Dolibarr.",
      ].join("\n");
    }
    if (
      low.includes("mot de passe") ||
      low.includes("password") ||
      low.includes("identifiants")
    ) {
      return [
        "Connexion refusée",
        text || "Email ou mot de passe incorrect.",
      ].join("\n");
    }
    return [
      "Connexion refusée (401)",
      text || "Identifiants refusés par le serveur.",
    ].join("\n");
  }

  if (status === 403) {
    return [
      "Accès refusé",
      text || "Vous n’avez pas la permission de vous connecter ici.",
    ].join("\n");
  }

  if (status >= 500) {
    const extra = detail ? `\n${detail}` : "";
    return [
      `Erreur serveur (${status})`,
      (text ||
        "Une erreur technique s’est produite. Réessayez dans quelques instants.") +
        extra,
    ].join("\n");
  }

  if (status === 404) {
    return [
      "Service introuvable (404)",
      "L’URL de connexion n’existe pas sur ce serveur. Vérifiez la configuration du frontend (base URL API).",
    ].join("\n");
  }

  return [
    status ? `Erreur ${status}` : "Erreur",
    text || err?.message || "Une erreur est survenue. Réessayez.",
  ].join("\n");
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, getHomePath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const responseData = await login(email.trim(), password);
      navigate(getHomePath(responseData?.role));
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat flex items-center justify-start"
      style={{
        backgroundImage: "url('/login-background.png')",
        backgroundSize: "cover",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: -30 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md ml-[120px] mr-auto bg-white p-md rounded-2xl shadow-lg border border-neutral-100 backdrop-blur-sm bg-white/95"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900">Connexion</h1>
          <p className="text-sm text-neutral-500 mt-2">Accédez à votre espace de congés</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-sm bg-danger-50 border border-danger-200 rounded-lg text-sm flex items-start gap-sm"
          >
            <AlertCircle size={20} className="text-danger-600 flex-shrink-0 mt-xs" />
            <div className="min-w-0 whitespace-pre-line leading-relaxed">
              {error.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {i === 0 ? (
                    <span className="font-semibold text-danger-900">{line}</span>
                  ) : (
                    <span className="font-normal text-danger-800 mt-xs block">
                      {line}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-md"
          onSubmit={handleSubmit}
        >
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <label htmlFor="login-email" className="block text-sm font-semibold text-neutral-900 mb-xs">
              Email / Identifiant
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-sm top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="login-email"
                type="text"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-sm py-xs bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <label htmlFor="login-password" className="block text-sm font-semibold text-neutral-900 mb-xs">
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-sm top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-sm py-xs bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              disabled={loading}
              className="py-xs"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </motion.div>

          {/* Forgot Password Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center pt-xs border-t border-neutral-200"
          >
            <p className="text-sm text-neutral-600">
              <a
                href="http://localhost/dolibarr/user/passwordforgotten.php"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Mot de passe oublié?
              </a>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}

export default Login;
