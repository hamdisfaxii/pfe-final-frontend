import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import { metaForCountry } from "../utils/country";
import {
  Home,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  AlertCircle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import Button from "./ui/Button";

function userInitials(user) {
  if (!user) return "?";
  const name = String(user.name || "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase() || "?";
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const mail = String(user.email || "").trim();
  if (mail.length >= 2) return mail.slice(0, 2).toUpperCase();
  return "?";
}

function NavLink2({ to, label, icon: Icon, active = false, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 px-sm py-xs rounded-lg font-medium text-sm transition-all duration-200 ${
          isActive
            ? "bg-primary-100 text-primary-700"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
        }`
      }
    >
      {Icon && <Icon size={18} />}
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

export default function NavbarV2() {
  const { user, isEmployee, isRH, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const homePath = isEmployee ? "/employee/dashboard" : "/rh/dashboard";
  const countryMeta = metaForCountry(user?.country);
  const initials = useMemo(() => userInitials(user), [user]);

  const employeeNav = [
    { to: "/employee/dashboard", label: "Accueil", icon: Home },
    { to: "/employee/calendar", label: "Calendrier", icon: Calendar },
    { to: "/employee/historique", label: "Mes demandes", icon: FileText },
  ];

  const rhNav = [
    { to: "/rh/dashboard", label: "Tableau de bord", icon: BarChart3 },
    { to: "/rh/decisions", label: "Décisions", icon: CheckCircle2 },
    { to: "/rh/requests", label: "Demandes", icon: FileText },
    { to: "/rh/calendar", label: "Calendrier", icon: Calendar },
    { to: "/rh/configuration", label: "Paramètres", icon: Settings },
  ];

  const navItems = isEmployee ? employeeNav : rhNav;

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
        <div className="mx-auto max-w-7xl px-md py-sm sm:px-lg lg:px-xl">
          <div className="flex items-center justify-between gap-md">
            {/* Logo */}
            <div className="flex items-center gap-sm flex-shrink-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-sm">
                <Calendar className="text-white" size={20} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-neutral-900">Congés</h1>
                {isRH && <p className="text-xs text-neutral-500">Module RH</p>}
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-xs flex-1">
              {navItems.map((item) => (
                <NavLink2 key={item.to} {...item} />
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-sm">
              {/* User Info - Desktop */}
              {user && (
                <div className="hidden sm:flex items-center gap-sm pl-sm border-l border-neutral-200">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div className="hidden lg:flex flex-col min-w-0">
                      <p className="text-xs font-medium text-neutral-900 truncate">{user.email}</p>
                      <p className="text-xs text-neutral-500">{countryMeta.label}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-xs rounded-lg hover:bg-neutral-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X size={20} className="text-neutral-600" />
                ) : (
                  <Menu size={20} className="text-neutral-600" />
                )}
              </button>

              {/* Logout Button */}
              <Button
                size="sm"
                variant="ghost"
                icon={LogOut}
                onClick={logout}
                className="hidden sm:flex"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-white border-b border-neutral-200 p-md animate-slideIn">
          <nav className="space-y-2 mb-md">
            {navItems.map((item) => (
              <NavLink2 key={item.to} {...item} />
            ))}
          </nav>
          <Button
            fullWidth
            variant="ghost"
            icon={LogOut}
            onClick={logout}
          >
            Déconnexion
          </Button>
        </div>
      )}
    </>
  );
}
