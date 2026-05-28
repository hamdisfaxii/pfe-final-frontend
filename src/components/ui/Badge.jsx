import React from "react";
import clsx from "clsx";
import { Check, Clock, X } from "lucide-react";

const Badge = ({
  children,
  variant = "default",
  size = "sm",
  icon = false,
  className,
  ...props
}) => {
  const variants = {
    default: "bg-gray-200 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    // Statuts RH
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-800",
  };

  const sizes = {
    xs: "px-2 py-1 text-xs font-medium rounded",
    sm: "px-3 py-1.5 text-sm font-medium rounded-md",
    md: "px-4 py-2 text-base font-medium rounded-lg",
  };

  const iconMap = {
    success: Check,
    warning: Clock,
    danger: X,
    pending: Clock,
    approved: Check,
    rejected: X,
    cancelled: null,
  };

  const IconComponent = icon && iconMap[variant] ? iconMap[variant] : null;

  return (
    <span
      className={clsx("inline-flex items-center gap-1", variants[variant], sizes[size], className)}
      {...props}
    >
      {IconComponent && <IconComponent size={14} />}
      {children}
    </span>
  );
};

// Status badge with predefined styles
export const StatusBadge = ({ status, className, ...props }) => {
  if (!status) {
    return <Badge variant="default" size="sm" className={className} {...props}>—</Badge>;
  }

  const s = String(status)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_");

  let variant = "default";
  let label = String(status);
  let icon = true;

  if (s.includes("attente") || s === "pending") {
    variant = "warning";
    label = "En attente";
  } else if (s.includes("approuve") || s.includes("approved") || s.includes("validee") || s.includes("accordee")) {
    variant = "success";
    label = "Approuvé";
  } else if (s.includes("refuse") || s.includes("rejected") || s.includes("rejet")) {
    variant = "danger";
    label = "Rejeté";
  } else if (s.includes("annule")) {
    variant = "default";
    label = "Annulé";
  } else {
    icon = false;
  }

  return (
    <Badge variant={variant} icon={icon} size="sm" className={clsx("capitalize", className)} {...props}>
      {label}
    </Badge>
  );
};

export default Badge;
