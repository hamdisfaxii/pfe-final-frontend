/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import { loginAPI, getCurrentUserAPI } from "../utils/auth";
import { normalizeCountryIsoForHr } from "../utils/country";

const AuthContext = createContext();

const normalizeRole = (rawRole) => {
  const role = String(rawRole ?? "").trim().toLowerCase();
  if (!role) return "UNKNOWN";
  const s = role.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (s.includes("employee") || s.includes("employe")) return "EMPLOYEE";
  if (s.includes("rh") || s.includes("responsable") || s.includes("manager") || s.includes("admin")) return "RH";
  return s.toUpperCase();
};

const getHomePathForRole = (rawRole) => {
  const role = normalizeRole(rawRole);
  if (role === "EMPLOYEE") return "/employee/dashboard";
  if (role === "RH") return "/rh/dashboard";
  return "/login";
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      let restoredUser = null;
      if (token && savedUser) {
        try {
          restoredUser = JSON.parse(savedUser);
          if (restoredUser?.role && restoredUser.role !== normalizeRole(restoredUser.role)) {
            restoredUser.role = normalizeRole(restoredUser.role);
          }
          setUser(restoredUser);
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }

      if (token) {
        try {
          const { data } = await getCurrentUserAPI();
          const pn = [data.prenom, data.nom].filter(Boolean).join(" ").trim();
          setUser({
            id: data.id ?? data.user?.id ?? restoredUser?.id,
            email: data.email ?? data.user?.email ?? restoredUser?.email,
            name: data.name ?? data.fullName ?? (pn || null) ?? data.user?.fullName ?? data.user?.name ?? data.email ?? restoredUser?.email,
            role: normalizeRole(data.role ?? data.user?.role),
            rawRole: data.role ?? data.user?.role,
            country: normalizeCountryIsoForHr(data.pays ?? data.country ?? data.user?.pays ?? data.user?.country),
            departement: data.departement ?? data.user?.departement ?? restoredUser?.departement ?? "",
          });
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }

      setLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginAPI(email, password);
      const u = data.user ?? {};
      const pn = [data.prenom, data.nom].filter(Boolean).join(" ").trim();
      const userData = {
        id: u.id ?? data.id ?? data.user?.id,
        email: u.email ?? data.email ?? email,
        name: u.fullName ?? data.fullName ?? (pn || null) ?? u.name ?? u.email ?? email,
        role: normalizeRole(data.role ?? data.user?.role),
        rawRole: data.role ?? data.user?.role,
        country: normalizeCountryIsoForHr(u.pays ?? data.pays ?? data.country ?? u.country),
        departement: u.departement ?? data.departement ?? data.user?.departement ?? "",
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth:logout"));
  };

  const isAuthenticated = Boolean(user);
  const isEmployee = user?.role === "EMPLOYEE";
  const isRH = user?.role === "RH";
  const isAdmin = isRH;
  const getHomePath = (roleOrRawRole) => getHomePathForRole(roleOrRawRole ?? user?.role);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, isEmployee, isRH, getHomePath, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
