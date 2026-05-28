import React from "react";
import clsx from "clsx";

export const PageContainer = ({ children, className, ...props }) => (
  <div
    className={clsx("min-h-screen bg-neutral-50", className)}
    {...props}
  >
    {children}
  </div>
);

export const ContentWrapper = ({ children, className, maxWidth = "7xl", ...props }) => (
  <div
    className={clsx(
      `mx-auto max-w-${maxWidth} px-md py-lg sm:px-lg lg:px-xl`,
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const PageHeader = ({ title, description, action, className, ...props }) => (
  <div className={clsx("mb-lg", className)} {...props}>
    <div className="flex items-start justify-between gap-md">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">{title}</h1>
        {description && <p className="mt-sm text-neutral-600">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  </div>
);

export const Grid = ({ children, columns = 3, gap = "md", className, ...props }) => {
  const colMap = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  const gapMap = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
  };

  return (
    <div
      className={clsx("grid", colMap[columns], gapMap[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const Stack = ({
  children,
  direction = "vertical",
  gap = "md",
  align = "stretch",
  className,
  ...props
}) => {
  const directionMap = {
    vertical: "flex flex-col",
    horizontal: "flex flex-row",
  };

  const gapMap = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
  };

  const alignMap = {
    stretch: "items-stretch",
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };

  return (
    <div
      className={clsx(directionMap[direction], gapMap[gap], alignMap[align], className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const Section = ({ children, title, className, ...props }) => (
  <section className={clsx("mb-lg", className)} {...props}>
    {title && <h2 className="text-xl font-semibold text-neutral-900 mb-md">{title}</h2>}
    {children}
  </section>
);

export default { PageContainer, ContentWrapper, PageHeader, Grid, Stack, Section };
