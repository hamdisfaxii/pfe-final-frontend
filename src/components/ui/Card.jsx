import React from "react";
import clsx from "clsx";

export const Card = React.forwardRef(
  ({ children, className, variant = "default", interactive = false, ...props }, ref) => {
    const variants = {
      default:
        "bg-white border border-neutral-200 shadow-xs hover:shadow-sm transition-shadow duration-200",
      elevated:
        "bg-white border border-neutral-100 shadow-md hover:shadow-lg transition-shadow duration-200",
      ghost: "bg-neutral-50 border border-neutral-100",
      success: "bg-success-50 border border-success-200",
      warning: "bg-warning-50 border border-warning-200",
      danger: "bg-danger-50 border border-danger-200",
      primary: "bg-primary-50 border border-primary-200",
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-xl p-md",
          variants[variant],
          interactive && "cursor-pointer hover:border-primary-300",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({ children, className, ...props }) => (
  <div className={clsx("mb-md border-b border-neutral-100 pb-md", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={clsx("text-lg font-semibold text-neutral-900", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={clsx("mt-1 text-sm text-neutral-600", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={clsx("", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={clsx("mt-md flex gap-2", className)} {...props}>
    {children}
  </div>
);

export default Card;
