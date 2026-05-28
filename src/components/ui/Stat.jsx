import React from "react";
import clsx from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({
  label,
  value,
  subValue,
  icon: Icon,
  variant = "default",
  trend,
  trendLabel,
  className,
  ...props
}) => {
  const variants = {
    default: "bg-white border-neutral-200 text-neutral-900",
    primary: "bg-primary-50 border-primary-200 text-primary-900",
    success: "bg-success-50 border-success-200 text-success-900",
    warning: "bg-warning-50 border-warning-200 text-warning-900",
    danger: "bg-danger-50 border-danger-200 text-danger-900",
    dark: "bg-neutral-900 border-neutral-800 text-white",
  };

  const iconColorMap = {
    default: "text-neutral-400",
    primary: "text-primary-600",
    success: "text-success-600",
    warning: "text-warning-600",
    danger: "text-danger-600",
    dark: "text-neutral-500",
  };

  return (
    <div
      className={clsx(
        "rounded-xl border p-md flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-sm">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75 mb-xs">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {subValue && <p className="text-sm opacity-60">{subValue}</p>}
          </div>
        </div>
        {Icon && (
          <div className={clsx("p-2 rounded-lg opacity-50", iconColorMap[variant])}>
            <Icon size={24} className="opacity-75" />
          </div>
        )}
      </div>

      {trend && trendLabel && (
        <div className="flex items-center gap-1 text-xs font-medium pt-sm border-t border-current border-opacity-20">
          {trend === "up" ? (
            <TrendingUp size={14} className="text-success-600" />
          ) : (
            <TrendingDown size={14} className="text-danger-600" />
          )}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
