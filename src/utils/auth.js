import api from "./api";

export const loginAPI = (email, password) =>
  api.post("/auth/login", { email: String(email ?? "").trim(), password });

export const getCurrentUserAPI = () => api.get("/auth/me");
