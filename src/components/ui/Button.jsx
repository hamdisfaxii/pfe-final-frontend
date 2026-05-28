import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const Button = React.forwardRef(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-sm hover:shadow-md",
      secondary:
        "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus-visible:ring-primary-500 shadow-xs",
      outline:
        "border-2 border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 focus-visible:ring-primary-500",
      ghost: "text-neutral-700 hover:bg-neutral-100 focus-visible:ring-primary-500",
      success:
        "bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500 shadow-sm hover:shadow-md",
      danger:
        "bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500 shadow-sm hover:shadow-md",
      warning:
        "bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500 shadow-sm hover:shadow-md",
    };

    const sizes = {
      xs: "px-2xs py-3xs text-xs gap-1.5",
      sm: "px-xs py-2xs text-sm gap-2",
      md: "px-sm py-xs text-sm gap-2",
      lg: "px-md py-sm text-base gap-2.5",
      xl: "px-lg py-md text-lg gap-3",
    };

    const isIconOnly = !children && Icon;

    const iconOnlyStyles = {
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-14 w-14",
    };

    const iconSize = {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 24,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          variants[variant],
          isIconOnly ? "rounded-full" : sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={iconSize[size]} />
            {children && <span className="ml-2">{children}</span>}
          </>
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon size={iconSize[size]} />}
            {children}
            {Icon && iconPosition === "right" && <Icon size={iconSize[size]} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
