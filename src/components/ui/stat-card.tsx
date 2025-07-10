import React from "react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  className?: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  className = "",
}) => {
  const isPositive = change >= 0;
  const formattedChange = Math.abs(change).toFixed(2); 

  return (
    <div
      className={clsx(
        `
        bg-white dark:bg-gray-800
        rounded-lg shadow-md
        border border-gray-200 dark:border-gray-700
        transition-transform duration-300 ease-in-out
        hover:shadow-lg 
        p-4
        flex items-center space-x-4
        `,
        className
      )}
    >
      <div className="p-3 bg-cyan-100 dark:bg-cyan-700 rounded-full">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </h3>
        <p className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
          {value}
        </p>
        <p
          className={`text-sm ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? "▲" : "▼"} {formattedChange}%
        </p>
      </div>
    </div>
  );
};

export default StatCard;
