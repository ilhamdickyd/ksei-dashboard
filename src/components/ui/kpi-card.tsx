import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface KPICardProps {
  title: string;
  value: string;
  trend: number;
  icon?: React.ReactNode;
  className?: string;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  trend,
  icon,
  className = "",
}) => {
  const isPositive = trend >= 0;
  const formattedTrend = Math.abs(trend).toFixed(2); 

  return (
    <motion.div
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
      whileTap={{ scale: 0.95 }}
    >
      {icon && (
        <div className="p-3 bg-cyan-100 dark:bg-cyan-700 rounded-full">
          {icon}
        </div>
      )}
      <div>
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </h4>
        <p className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
          {value}
        </p>
        <p
          className={`text-sm ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? "▲" : "▼"} {formattedTrend}%
        </p>
      </div>
    </motion.div>
  );
};

export default KPICard;
