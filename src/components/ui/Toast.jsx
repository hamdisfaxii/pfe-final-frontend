import React from "react";
import toast, { Toaster } from "react-hot-toast";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export const ToastProvider = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    toastOptions={{
      duration: 4000,
      style: {
        background: "#fff",
        color: "#000",
        padding: "16px",
        borderRadius: "12px",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid #e5e7eb",
      },
      success: {
        style: {
          background: "#f0fdf4",
          color: "#166534",
          borderColor: "#bbf7d0",
        },
        icon: <CheckCircle2 size={20} />,
      },
      error: {
        style: {
          background: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
        icon: <AlertCircle size={20} />,
      },
      loading: {
        style: {
          background: "#f3f4f6",
          color: "#374151",
        },
      },
    }}
  />
);

// Custom toast functions
export const showToast = {
  success: (message, options = {}) =>
    toast.success(message, {
      ...options,
      icon: <CheckCircle2 size={20} className="text-success-600" />,
    }),

  error: (message, options = {}) =>
    toast.error(message, {
      ...options,
      icon: <AlertCircle size={20} className="text-danger-600" />,
    }),

  warning: (message, options = {}) =>
    toast(message, {
      ...options,
      icon: <AlertTriangle size={20} className="text-warning-600" />,
      style: {
        background: "#fffbeb",
        color: "#78350f",
        borderColor: "#fde68a",
      },
    }),

  info: (message, options = {}) =>
    toast(message, {
      ...options,
      icon: <Info size={20} className="text-primary-600" />,
      style: {
        background: "#f0f9ff",
        color: "#0c3d66",
        borderColor: "#bae6fd",
      },
    }),

  loading: (message, options = {}) => toast.loading(message, options),
};

// Custom Toast component for fine control
export const Toast = ({ message, type = "default", onClose, className }) => {
  const typeStyles = {
    success: "bg-success-50 border-success-200 text-success-900",
    error: "bg-danger-50 border-danger-200 text-danger-900",
    warning: "bg-warning-50 border-warning-200 text-warning-900",
    info: "bg-primary-50 border-primary-200 text-primary-900",
    default: "bg-neutral-50 border-neutral-200 text-neutral-900",
  };

  const iconMap = {
    success: <CheckCircle2 className="text-success-600" size={20} />,
    error: <AlertCircle className="text-danger-600" size={20} />,
    warning: <AlertTriangle className="text-warning-600" size={20} />,
    info: <Info className="text-primary-600" size={20} />,
    default: null,
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-sm p-md rounded-lg border shadow-md",
        typeStyles[type],
        className
      )}
      role="alert"
    >
      {iconMap[type]}
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button onClick={onClose} className="ml-sm p-1 hover:opacity-70">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ToastProvider;
