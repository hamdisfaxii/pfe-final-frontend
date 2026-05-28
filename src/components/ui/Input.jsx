import React from "react";
import clsx from "clsx";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const Input = React.forwardRef(
  ({ className, error, success, icon: Icon, label, hint, required = false, ...props }, ref) => {
    const hasState = error || success;

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-xs text-sm font-semibold text-neutral-900">
            {label}
            {required && <span className="text-danger-600 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            className={clsx(
              "w-full px-sm py-xs text-base border rounded-lg transition-all duration-200",
              "placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400",
              Icon && "pl-md",
              error &&
                "border-danger-300 bg-danger-50 text-danger-900 focus:border-danger-500 focus:ring-danger-200",
              success &&
                "border-success-300 bg-success-50 text-success-900 focus:border-success-500 focus:ring-success-200",
              !error &&
                !success &&
                "border-neutral-200 focus:border-primary-500 focus:ring-primary-100",
              className
            )}
            {...props}
          />

          {Icon && !hasState && (
            <Icon
              className="absolute left-sm top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
          )}

          {error && (
            <AlertCircle
              className="absolute right-sm top-1/2 -translate-y-1/2 text-danger-600"
              size={18}
            />
          )}

          {success && (
            <CheckCircle2
              className="absolute right-sm top-1/2 -translate-y-1/2 text-success-600"
              size={18}
            />
          )}
        </div>

        {error && <p className="mt-xs text-xs text-danger-600 font-medium">{error}</p>}
        {hint && !error && <p className="mt-xs text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

// Textarea component
export const Textarea = React.forwardRef(
  ({ className, error, success, label, hint, required = false, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-xs text-sm font-semibold text-neutral-900">
            {label}
            {required && <span className="text-danger-600 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={clsx(
            "w-full px-sm py-xs text-base border rounded-lg transition-all duration-200 min-h-24 resize-none",
            "placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400",
            error &&
              "border-danger-300 bg-danger-50 text-danger-900 focus:border-danger-500 focus:ring-danger-200",
            success &&
              "border-success-300 bg-success-50 text-success-900 focus:border-success-500 focus:ring-success-200",
            !error &&
              !success &&
              "border-neutral-200 focus:border-primary-500 focus:ring-primary-100",
            className
          )}
          {...props}
        />

        {error && <p className="mt-xs text-xs text-danger-600 font-medium">{error}</p>}
        {hint && !error && <p className="mt-xs text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// Select component
export const Select = React.forwardRef(
  ({ className, error, label, hint, required = false, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-xs text-sm font-semibold text-neutral-900">
            {label}
            {required && <span className="text-danger-600 ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          className={clsx(
            "w-full px-sm py-xs text-base border rounded-lg transition-all duration-200",
            "placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400",
            error &&
              "border-danger-300 bg-danger-50 text-danger-900 focus:border-danger-500 focus:ring-danger-200",
            !error && "border-neutral-200 focus:border-primary-500 focus:ring-primary-100",
            className
          )}
          {...props}
        >
          {children}
        </select>

        {error && <p className="mt-xs text-xs text-danger-600 font-medium">{error}</p>}
        {hint && !error && <p className="mt-xs text-xs text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
