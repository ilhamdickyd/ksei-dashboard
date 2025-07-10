import React from "react";
import clsx from "clsx";

interface MetricGridProps {
  children: React.ReactNode;
  className?: string;
}

const MetricGrid: React.FC<MetricGridProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={clsx(
        `
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6
        `,
        className
      )}
    >
      {children}
    </div>
  );
};

export default MetricGrid;
