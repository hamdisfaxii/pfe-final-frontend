import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export const Spinner = ({ size = "md", className }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <Loader2 className={clsx("animate-spin text-primary-600", sizes[size])} />
    </div>
  );
};

export const LoadingPage = ({ message = "Chargement..." }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-md bg-neutral-50">
    <Spinner size="lg" />
    <p className="text-neutral-600 text-sm font-medium">{message}</p>
  </div>
);

export const LoadingSkeleton = ({ className, count = 1 }) => (
  <div className={clsx("space-y-md", className)}>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="h-12 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 rounded-lg animate-pulse"
      />
    ))}
  </div>
);

export default Spinner;
