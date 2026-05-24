/**
 * Service d'authentification — appels API Spring Boot.
 */
import api from "../utils/api";

export function login(email, password) {
  return api.post("/auth/login", {
    email: String(email ?? "").trim(),
    password,
  });
}

export function getCurrentUser() {
  return api.get("/auth/me");
}

export function logout() {
  return api.post("/auth/logout").catch(() => {});
}
