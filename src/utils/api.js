import axios from "axios";

// Je crée un livreur personnalisé (une instance axios)
const api = axios.create({
  // Toujours relatif : Vite proxy → localhost:8080 en dev, Nginx → backend en prod
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000, // évite des timeouts silencieux trop courts
  headers: { "Content-Type": "application/json" }, // j'envoie du JSON
});

// 🔒 Intercepteur : ajoute JWT et CSRF token
api.interceptors.request.use((config) => {
  const path = String(config.url ?? "");
  const isLoginPost =
    path.includes("auth/login") &&
    String(config.method ?? "get").toLowerCase() === "post";

  if (!isLoginPost) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ajouter CSRF token pour les requêtes authentifiées
    const csrfToken = localStorage.getItem("csrfToken");
    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

// 401 hors tentative de login : session invalide → purge. Un mauvais mot de passe sur /auth/login ne doit pas effacer une session ni déclencher logout global.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = String(error.config?.url ?? "");
      if (!url.includes("auth/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
