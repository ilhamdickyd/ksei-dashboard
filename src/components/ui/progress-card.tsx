import React from "react";
import { Card, CardContent } from "./card";
import clsx from "clsx";

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  color?: "blue" | "green" | "yellow" | "red" | "indigo" | "purple" | "cyan"; 
}

const colorClasses: Record<
  "blue" | "green" | "yellow" | "red" | "indigo" | "purple" | "cyan",
  string
> = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  yellow: "from-yellow-500 to-yellow-600",
  red: "from-red-500 to-red-600",
  indigo: "from-indigo-500 to-indigo-600",
  purple: "from-purple-500 to-purple-600",
  cyan: "from-cyan-500 to-cyan-600",
};

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  max,
  color = "blue", 
}) => {
  const percentage = Math.min((value / max) * 100, 100); 

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </h3>
          <span
            className={clsx(
              "text-lg font-bold",
              percentage >= 100
                ? "text-green-600 dark:text-green-400"
                : "text-gray-700 dark:text-gray-200"
            )}
            aria-label={`Progress: ${percentage}%`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div
          className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${title} progress`}
        >
          <div
            className={clsx(
              "absolute left-0 top-0 h-full bg-gradient-to-r rounded-full transition-all duration-500 ease-out",
              colorClasses[
                color as
                  | "blue"
                  | "green"
                  | "yellow"
                  | "red"
                  | "indigo"
                  | "purple"
                  | "cyan"
              ]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {value} of {max}
        </div>
      </CardContent>
    </Card>
  );
};
